import api, { ApiError } from '../lib/axios';
import { User } from '@apps-in-toss/web-framework';
import type { ApiResponse } from '../lib/axios';
import { clearTokens, getRefreshToken, saveTokens } from '../lib/authStorage';
import { isAxiosError } from 'axios';

export class LoginError extends Error {
  readonly stage: 'toss-code' | 'server-login' | 'token-storage';
  readonly status?: number;
  readonly code?: string;

  constructor(stage: LoginError['stage'], error: unknown) {
    super('로그인을 완료하지 못했습니다.');
    this.name = 'LoginError';
    this.stage = stage;
    if (error instanceof ApiError) {
      this.status = error.status;
      this.code = error.code;
    } else if (isAxiosError(error)) {
      this.status = error.response?.status;
      this.code = error.code;
    }
  }
}

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
    onboardingStatus: 'NOT_COMPLETED' | 'COMPLETED';
  };
}

// 토스 인증 코드로 로그인
let loginPromise: Promise<AuthResponse> | null = null;
let refreshPromise: Promise<TokenResponse> | null = null;

// 동시에 요청되어도 토스 인증 코드는 한 번만 발급
export async function loginWithoutPassword(): Promise<AuthResponse> {
  if (loginPromise) return await loginPromise;
  loginPromise = performLogin();
  try {
    return await loginPromise;
  } finally {
    loginPromise = null;
  }
}

// 새 토스 인증 코드로 로그인
async function performLogin(): Promise<AuthResponse> {
  let code: string;
  try {
    const result = await User.createAnonymousKeyAuthCode();
    if (!result?.code) throw new Error('인증 코드 발급 실패');
    code = result.code;
  } catch (error) {
    throw new LoginError('toss-code', error);
  }

  // 서버로 코드 전달
  let result: ApiResponse<AuthResponse>;
  try {
    result = await api.post<ApiResponse<AuthResponse>, ApiResponse<AuthResponse>>('/auth/anonymous', { code });
  } catch (error) {
    throw new LoginError('server-login', error);
  }

  try {
    saveTokens(result.data); // 토큰 저장
  } catch (error) {
    throw new LoginError('token-storage', error);
  }

  return result.data; // 회원 정보 반환
}

// 저장된 리프레시 토큰 관리
export async function refreshAuthTokens(): Promise<TokenResponse> {
  if (refreshPromise) return await refreshPromise;
  refreshPromise = performRefresh();
  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

// 갱신 불가능한 세션은 기존 토큰을 지우고 새 코드로 재인증
async function performRefresh(): Promise<TokenResponse> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return loginWithoutPassword();

  // 새 토큰 발급 후 저장
  try {
    const result = await api.post<ApiResponse<TokenResponse>, ApiResponse<TokenResponse>>('/auth/refresh', { refreshToken });
    saveTokens(result.data);
    return result.data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401 && ['AUTH_003', 'AUTH_005', 'AUTH_006'].includes(error.code)) {
      clearTokens();
      return loginWithoutPassword();
    }
    throw error;
  }
}

// 로그아웃
export async function logout(): Promise<string> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error('로그아웃할 로그인 정보가 없습니다.');

  const result = await api.post<ApiResponse<string>, ApiResponse<string>>('/auth/logout', { refreshToken });
  clearTokens(); // 저장된 토큰 삭제

  return result.data;
}
