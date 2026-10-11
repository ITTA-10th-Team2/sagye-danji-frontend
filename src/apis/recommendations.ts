import api, { ApiError } from '../lib/axios';
import type { ApiResponse } from '../lib/axios';

export type RecommendationCategory = 'FOOD' | 'SCENERY' | 'TREND' | 'EVENT' | 'ACTIVITY_LIFESTYLE';

export interface TodayRecommendation {
  id: number;
  contentCode: string;
  category: RecommendationCategory;
  material: string;
  title: string;
  description: string;
  stage: 'START' | 'PEAK' | 'END';
  region: string;
}

/** 오늘 배정된 추천 콘텐츠 조회 */
export async function getTodayRecommendation(signal?: AbortSignal): Promise<TodayRecommendation | null> {
  try {
    const result = await api.get<ApiResponse<TodayRecommendation | null>, ApiResponse<TodayRecommendation | null>>(
      '/v1/recommendations/today',
      { signal },
    );
    return result.data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404 && error.code === 'RECOMMENDATION_001') return null;
    throw error;
  }
}
