/*
웹에는 토스 앱 기능(로그인, 공유하기 등)이 없기 때문에 SDK를 바로 호출하면 에러가 발생함.
따라서 이 파일에서 지금 실행 환경이 PC면 가짜 응답을 주고, 폰이면 진짜 SDK를 실행하도록 함.

import { tossBridge } from '../lib/tossBridge'; 형식으로 불러와 사용하시면 됩니다.
*/

import { TossAuth, Share } from '@apps-in-toss/web-framework';

const isDev = import.meta.env.DEV;

export const tossBridge = {
  // 로그인 모킹
  login: async () => {
    if (isDev) {
      console.log('[Mock SDK] TossAuth.login 호출됨');
      return { authorizationCode: 'mock_code_1234' };
    }
    // 실제 SDK 호출
    return await TossAuth.login();
  },

  // 공유하기 모킹
  share: async (message: string) => {
    if (isDev) {
      console.log(`[Mock SDK] 공유 호출됨: ${message}`);
      alert(`[개발용 모의 공유창]\n메시지: ${message}`);
      return { success: true };
    }
    return await Share.sendMessage({ message });
  },
};
