import api from '../lib/axios';
import { User } from '@apps-in-toss/web-framework';

export interface AuthResponse {
  tokenType: string;
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
  refreshExpiresIn: number;
  isNewMember: boolean;
  member: {
    memberId: string;
    onboardingStatus: string;
  };
}

// 미니앱 로그인 API
export async function loginWithoutPassword() {
  // 인증 코드 발급
  const authCode = await User.getAnonymousKey();

  if (!authCode) throw new Error('사용자 식별키 인증 코드 발급에 실패했습니다.');

  // 서버로 코드 전달
  const result = await api.post<AuthResponse>('/api/auth/anonymous', {
    code: authCode,
  });

  return result;
}
