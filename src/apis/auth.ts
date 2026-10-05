import api from '../lib/axios';
import { User } from '@apps-in-toss/web-framework';
import type { ApiResponse } from '../lib/axios';
import { clearTokens, getRefreshToken, saveTokens } from '../lib/authStorage';

export interface TokenResponse {
  tokenType: string;
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
  refreshExpiresIn: number;
}

export interface AuthResponse extends TokenResponse {
  isNewMember: boolean;
  member: {
    memberId: string;
    onboardingStatus: string;
  };
}

// 토스 인증 코드로 로그인
export async function loginWithoutPassword(): Promise<AuthResponse> {
  const { code } = await User.createAnonymousKeyAuthCode(); // 인증 코드 발급
  if (!code) throw new Error('사용자 식별키 인증 코드 발급에 실패했습니다.');

  // 서버로 코드 전달
  const result = await api.post<ApiResponse<AuthResponse>, ApiResponse<AuthResponse>>('/auth/anonymous', {
    code,
  });

  saveTokens(result.data); // 토큰 저장

  return result.data; // 회원 정보 반환
}

// 저장된 리프레시 토큰 관리
export async function refreshAuthTokens(): Promise<TokenResponse> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error('갱신할 로그인 정보가 없습니다.');

  // 새 토큰 발급 후 저장
  const result = await api.post<ApiResponse<TokenResponse>, ApiResponse<TokenResponse>>('/auth/refresh', { refreshToken });
  saveTokens(result.data);

  return result.data;
}

// 로그아웃
export async function logout(): Promise<string> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error('로그아웃할 로그인 정보가 없습니다.');

  const result = await api.post<ApiResponse<string>, ApiResponse<string>>('/auth/logout', { refreshToken });
  clearTokens(); // 저장된 토큰 삭제

  return result.data;
}
