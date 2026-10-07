import api from '../lib/axios';
import type { ApiResponse } from '../lib/axios';

export interface MemberResponse {
  memberId: string;
  onboardingStatus: 'NOT_COMPLETED' | 'COMPLETED';
  onboardingCompletedAt: string | null;
}

// 현재 로그인한 회원의 정보와 온보딩 상태 조회
export async function getMyMember(): Promise<MemberResponse> {
  const result = await api.get<ApiResponse<MemberResponse>, ApiResponse<MemberResponse>>('/members/me');

  return result.data;
}

// 현재 회원의 온보딩 완료 상태를 서버에 저장
export async function completeOnboarding(): Promise<MemberResponse> {
  const result = await api.post<ApiResponse<MemberResponse>, ApiResponse<MemberResponse>>('/members/me/onboarding/complete');

  return result.data;
}
