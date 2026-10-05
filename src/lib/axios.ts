import axios from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import { getAccessToken } from './authStorage';

export interface ApiResponse<T> {
  success: boolean;
  code: string;
  message: string;
  data: T;
}

// 서버 에러 응답 타입 정의
export interface ApiErrorResponse {
  success: boolean;
  code: string;
  message: string;
  errors?: Array<{
    field: string;
    value: string;
    reason: string;
  }>;
}

export class ApiError extends Error {
  readonly code: string;
  readonly errors?: ApiErrorResponse['errors'];
  readonly status?: number;

  constructor(data: ApiErrorResponse, fallbackMessage: string, status?: number) {
    super(data.message || fallbackMessage);
    this.name = 'ApiError';
    this.code = data.code;
    this.errors = data.errors;
    this.status = status;
  }
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: false,
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    // 저장된 토큰 조회
    const accessToken = getAccessToken();

    if (accessToken) {
      // 모든 요청 헤더에 Authorization 붙이기
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => {
    // 200 OK인데 { success: false }를 줄 때 예외처리
    if (response.data && response.data.success === false) {
      const errData = response.data as ApiErrorResponse;
      const customError = new ApiError(errData, '요청 처리에 실패했습니다.', response.status);
      return Promise.reject(customError);
    }

    // 성공 시 응답 데이터 반환
    return response.data;
  },
  async (error) => {
    // 실패 시 에러 메시지 반환
    if (error.response?.data) {
      const errData = error.response.data as ApiErrorResponse;
      const customError = new ApiError(errData, '서버 통신 중 오류가 발생했습니다.', error.response.status);
      const config = error.config as (InternalAxiosRequestConfig & { authRetried?: boolean }) | undefined;
      const isAuthRequest = /^\/auth\/(anonymous|refresh|logout)\/?(?:\?|$)/.test(config?.url ?? '');

      // 만료된 일반 API 요청만 한 번 복구
      if (config && !isAuthRequest && !config.authRetried && customError.status === 401 && customError.code === 'AUTH_001') {
        config.authRetried = true;
        const latestToken = getAccessToken();
        if (!latestToken || config.headers.Authorization === `Bearer ${latestToken}`) {
          const { refreshAuthTokens } = await import('../apis/auth');
          await refreshAuthTokens();
        }
        return api.request(config);
      }

      return Promise.reject(customError);
    }

    // 네트워크 끊김 또는 타임아웃
    return Promise.reject(error);
  },
);

export default api;
