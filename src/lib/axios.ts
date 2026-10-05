import axios from 'axios';

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

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    // 저장된 토큰 조회
    const accessToken = localStorage.getItem('accessToken');

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
    // 200 OK인데 success: false를 줄 때 예외처리
    if (response.data && response.data.success === false) {
      const errData = response.data as ApiErrorResponse;
      const customError = new Error(errData.message || '요청 처리에 실패했습니다.');
      (customError as any).code = errData.code;
      (customError as any).errors = errData.errors;
      return Promise.reject(customError);
    }

    // 성공 시 응답 데이터 반환
    return response.data;
  },
  (error) => {
    // 실패 시 에러 메시지 반환
    if (error.response?.data) {
      const errData = error.response.data as ApiErrorResponse;
      const customError = new Error(errData.message || '서버 통신 중 오류가 발생했습니다.');

      (customError as any).code = errData.code;
      (customError as any).errors = errData.errors;

      return Promise.reject(customError);
    }

    // 네트워크 끊김 또는 타임아웃
    return Promise.reject(error);
  },
);

export default api;
