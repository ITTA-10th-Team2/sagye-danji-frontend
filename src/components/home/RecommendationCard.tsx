import { useEffect, useState } from 'react';
import { getTodayRecommendation } from '../../apis/recommendations';
import type { RecommendationCategory, TodayRecommendation } from '../../apis/recommendations';

type RecommendationState = { status: 'loading' | 'error' } | { status: 'success'; recommendation: TodayRecommendation | null };

// 아이콘 매핑
const ICON_MAP: Record<RecommendationCategory, string> = {
  FOOD: '/assets/icons/food.svg',
  ACTIVITY_LIFESTYLE: '/assets/icons/sun.svg',
  SCENERY: '/assets/icons/landscape.svg',
  TREND: '/assets/icons/sun.svg',
  EVENT: '/assets/icons/sun.svg',
};

export default function RecommendationCard() {
  const [state, setState] = useState<RecommendationState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    async function loadRecommendation() {
      try {
        const recommendation = await getTodayRecommendation(controller.signal);
        if (!controller.signal.aborted) setState({ status: 'success', recommendation });
      } catch {
        if (!controller.signal.aborted) setState({ status: 'error' });
      }
    }
    void loadRecommendation();
    return () => controller.abort();
  }, [attempt]);

  const recommendation = state.status === 'success' ? state.recommendation : null;
  const title =
    recommendation?.title ??
    (state.status === 'loading'
      ? '추천을 불러오고 있어요'
      : state.status === 'error'
        ? '추천을 불러오지 못했어요'
        : '오늘의 추천을 준비 중이에요');
  const description = recommendation?.description ?? (state.status === 'error' ? '잠시 후 다시 시도해주세요.' : '');

  return (
    <div
      className="mx-auto flex flex-col items-start w-[80%] p-6 bg-[#F2F2FF]/47 backdrop-blur-[1px] border border-none rounded-[12px] shadow-sm"
      aria-busy={state.status === 'loading'}
      aria-live="polite"
    >
      {/* 아이콘 영역 */}
      <div className="flex items-center justify-center w-12 h-12 mb-3 bg-[#07194C]/5 rounded-[16px] shadow-sm">
        <img src={ICON_MAP[recommendation?.category ?? 'ACTIVITY_LIFESTYLE'] ?? '/assets/icons/sun.svg'} className="w-[70%]" alt="" />
      </div>
      {/* 서브 타이틀 */}
      <span className="mb-1 text-[13px] font-medium text-[#031228]/70">오늘의 추천 콘텐츠</span>
      {/* 메인 타이틀 */}
      <h2 className="mb-3 text-[28px] font-bold text-[#191F28] break-words">{title}</h2>
      {/* 본문 설명 */}
      <p className="text-[17px] font-medium text-[#031228]/70 leading-snug whitespace-pre-line break-words">{description}</p>
      {state.status === 'error' && (
        <button
          className="mt-3 text-[15px] font-semibold text-[#191F28] underline"
          onClick={() => {
            setState({ status: 'loading' });
            setAttempt((value) => value + 1);
          }}
        >
          다시 시도
        </button>
      )}
    </div>
  );
}
