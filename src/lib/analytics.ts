import { Environment, getPlatformOS } from '@apps-in-toss/web-framework';
import { getAccessToken } from './authStorage';

export type AnalyticsScreen = 'ONBOARDING' | 'HOME' | 'RECORD_CREATE' | 'RECORD_DETAIL' | 'JAR';
type EventProperties = {
  ONBOARDING_START: Record<string, never>;
  ONBOARDING_SKIP: Record<string, never>;
  HOME_VIEW: { entrySource: 'APP_OPEN' | 'INTERNAL_NAVIGATION' | 'BACK_NAVIGATION' };
  HOME_ELEMENT_TAP: { target: 'CHARACTER' | 'SPEECH_BUBBLE' | 'SEASON_OBJECT' };
  RECORD_SCREEN_VIEW: Record<string, never>;
  RECORD_START: { source: 'CAMERA' | 'GALLERY' };
  JAR_VIEW: { previousScreen?: AnalyticsScreen };
  LOCKED_SEASON_CLICK: { season: 'SPRING' | 'SUMMER' | 'AUTUMN' | 'WINTER' };
  SHARE_CLICK: { sourceScreen: AnalyticsScreen; method?: 'SYSTEM_SHARE' | 'COPY_LINK' };
  SCREEN_ENGAGEMENT: { screenName: AnalyticsScreen; durationMs: number };
};
type EventName = keyof EventProperties;
interface AnalyticsEvent {
  eventId: string;
  sessionId: string;
  eventName: EventName;
  occurredAt: string;
  serviceVersion: string;
  os: 'IOS' | 'ANDROID' | 'WEB' | 'OTHER';
  sequence: number;
  properties: EventProperties[EventName];
}

// 서버 배포와 CORS 설정을 확인한 후 활성화
export const analyticsEnabled = import.meta.env.VITE_ANALYTICS_ENABLED === 'true';
const serviceVersion = String(import.meta.env.VITE_SERVICE_VERSION || '0.0.0').slice(0, 30);
let sessionId: string | undefined;
let sequence = 0;
let queue: AnalyticsEvent[] = [];
let timer: ReturnType<typeof setTimeout> | undefined;
let flushing = false;
let failures = 0;
let started = false;
const once = new Set<EventName>();
let homeVisited = false;

export function getHomeEntrySource(isBack: boolean): EventProperties['HOME_VIEW']['entrySource'] {
  if (!homeVisited) {
    homeVisited = true;
    return 'APP_OPEN';
  }
  return isBack ? 'BACK_NAVIGATION' : 'INTERNAL_NAVIGATION';
}

export function getAnalyticsContext() {
  sessionId ??= crypto.randomUUID();
  let os: AnalyticsEvent['os'] = 'WEB';
  try {
    if (Environment.environment === 'toss') {
      const platform = getPlatformOS();
      os = platform === 'ios' ? 'IOS' : platform === 'android' ? 'ANDROID' : 'OTHER';
    }
  } catch {
    /* 일반 브라우저에서는 WEB을 사용 */
  }
  return { sessionId, serviceVersion, os };
}

export function getAnalyticsHeaders(): Record<string, string> {
  if (!analyticsEnabled) return {};
  try {
    const context = getAnalyticsContext();
    return {
      'X-Analytics-Session-Id': context.sessionId,
      'X-Client-Version': context.serviceVersion,
      'X-Client-OS': context.os,
    };
  } catch {
    return {};
  }
}

function schedule(delay = 5000) {
  if (timer || !queue.length) return;
  timer = setTimeout(() => {
    timer = undefined;
    void flushAnalytics();
  }, delay);
}

export function trackEvent<N extends EventName>(eventName: N, properties: EventProperties[N], oncePerSession = false): void {
  if (!analyticsEnabled || (oncePerSession && once.has(eventName))) return;
  try {
    if (!getAccessToken()) return;
    const context = getAnalyticsContext();
    const event: AnalyticsEvent = {
      ...context,
      eventId: crypto.randomUUID(),
      eventName,
      occurredAt: new Date().toISOString(),
      sequence: ++sequence,
      properties,
    };
    if (oncePerSession) once.add(eventName);
    queue.push(event);
    if (queue.length > 500) queue.splice(0, queue.length - 500);
    if (queue.length >= 10) void flushAnalytics();
    else schedule();
  } catch {
    /* 분석 실패는 화면 동작을 막지 않음 */
  }
}

/** 대기 이벤트를 전송하고 실패 시 동일한 이벤트 ID로 재시도 */
export async function flushAnalytics(keepalive = false): Promise<void> {
  if (!analyticsEnabled || flushing || !queue.length) return;
  if (timer) clearTimeout(timer);
  timer = undefined;
  let token: string | null;

  try {
    token = getAccessToken();
  } catch {
    return;
  }
  if (!token) return;
  const batch: AnalyticsEvent[] = [];
  for (const event of queue.slice(0, 50)) {
    if (new TextEncoder().encode(JSON.stringify({ events: [...batch, event] })).length > 48 * 1024) break;
    batch.push(event);
  }
  if (!batch.length) return;
  flushing = true;
  let retryDelay = 5000;

  try {
    let response: Response;
    const send = async () =>
      await fetch(`${String(import.meta.env.VITE_API_BASE_URL).replace(/\/$/, '')}/analytics/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...getAnalyticsHeaders() },
        body: JSON.stringify({ events: batch }),
        keepalive,
        ...(keepalive ? {} : { signal: AbortSignal.timeout(10000) }),
      });
    response = await send();
    if (response.status === 401 && !keepalive) {
      const body = await response.clone().json();
      if (body.code === 'AUTH_001') {
        const { refreshAuthTokens } = await import('../apis/auth');
        await refreshAuthTokens();
        token = getAccessToken();
        response = await send();
      }
    }
    if (response.ok) {
      const body = await response.json();
      if (body.success !== true || body.data?.acceptedCount + body.data?.duplicateCount !== batch.length) {
        throw new Error('Unexpected analytics response');
      }
      const ids = new Set(batch.map((event) => event.eventId));
      queue = queue.filter((event) => !ids.has(event.eventId));
      failures = 0;
    } else if (response.status === 400 || response.status === 413) {
      const ids = new Set(batch.map((event) => event.eventId));
      queue = queue.filter((event) => !ids.has(event.eventId));
      console.warn('[Analytics] 이벤트 배치 거부', { status: response.status });
    } else {
      throw new Error('Analytics unavailable');
    }
  } catch {
    retryDelay = Math.min(60000, 1000 * 2 ** Math.min(++failures, 6)) + Math.random() * 1000;
  } finally {
    flushing = false;
    if (queue.length) schedule(retryDelay);
  }
}

export function startAnalytics(): () => void {
  if (!analyticsEnabled || started) return () => {};
  started = true;
  const onHidden = () => {
    if (document.visibilityState === 'hidden') void flushAnalytics(true);
  };
  const onOnline = () => {
    void flushAnalytics();
  };
  document.addEventListener('visibilitychange', onHidden);
  window.addEventListener('online', onOnline);
  schedule();
  return () => {
    started = false;
    document.removeEventListener('visibilitychange', onHidden);
    window.removeEventListener('online', onOnline);
    if (timer) clearTimeout(timer);
    timer = undefined;
  };
}
