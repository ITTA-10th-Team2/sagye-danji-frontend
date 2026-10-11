import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import { flushAnalytics, getHomeEntrySource, trackEvent, type AnalyticsScreen } from './analytics';

export function useAnalyticsScreen(screen: AnalyticsScreen) {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    const expectedPath =
      screen === 'HOME' ? '/home' : screen === 'ONBOARDING' ? '/onboarding' : screen === 'RECORD_CREATE' ? '/write' : '/danji';
    if (pathname !== expectedPath) return;
    let since = document.visibilityState === 'visible' ? performance.now() : null;
    let disposed = false;
    let viewed = false;
    const recordView = () => {
      if (disposed || viewed || document.visibilityState !== 'visible') return;
      viewed = true;
      if (screen === 'HOME') trackEvent('HOME_VIEW', { entrySource: getHomeEntrySource(navigationType === 'POP') }, true);
      if (screen === 'ONBOARDING') trackEvent('ONBOARDING_START', {}, true);
      if (screen === 'RECORD_CREATE') trackEvent('RECORD_SCREEN_VIEW', {});
      if (screen === 'JAR') trackEvent('JAR_VIEW', {}, true);
    };

    // StrictMode의 즉시 정리된 effect에서는 이벤트를 만들지 않음
    queueMicrotask(recordView);
    const closeSegment = () => {
      if (since === null) return;
      const durationMs = Math.round(performance.now() - since);
      since = null;
      if (durationMs > 0) trackEvent('SCREEN_ENGAGEMENT', { screenName: screen, durationMs });
    };
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        closeSegment();
        void flushAnalytics(true);
      } else {
        since = performance.now();
        recordView();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      disposed = true;
      if (viewed) closeSegment();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [screen, pathname, navigationType]);
}
