import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@toss/tds-mobile';
import { LoginError, loginWithoutPassword } from '../apis/auth';

export default function Splash() {
  const navigate = useNavigate();
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    async function initialize() {
      try {
        // 서버에서 받은 온보딩 상태로 분기
        const minimumDisplay = new Promise<void>((resolve) => setTimeout(resolve, 1800));
        const [auth] = await Promise.all([loginWithoutPassword(), minimumDisplay]);
        if (!active) return;
        navigate(auth.member.onboardingStatus === 'COMPLETED' ? '/home' : '/onboarding', { replace: true });
      } catch (cause: unknown) {
        if (cause instanceof LoginError) {
          console.error('[Auth] 로그인 실패', { stage: cause.stage, status: cause.status, code: cause.code });
        } else {
          console.error('[Auth] 로그인 응답 처리 실패');
        }
        if (active) setError(true);
      }
    }
    void initialize();
    return () => {
      active = false;
    };
  }, [navigate, attempt]);

  return (
    <main className="flex flex-col items-center w-full h-dvh bg-white">
      {/* 배경 */}
      <img src="/assets/onboarding/splash.png" className="absolute inset-0 w-full h-full object-cover pointer-events-none" />

      {/* 로고 */}
      <img src="/assets/onboarding/app-logo.svg" className="w-[65%] mt-60 z-999" />
      {error && (
        <div className="relative z-10 mt-14 text-center" role="alert">
          <p>로그인하지 못했어요. 잠시 후 다시 시도해주세요.</p>
          <Button
            onClick={() => {
              setError(false);
              setAttempt((value) => value + 1);
            }}
          >
            다시 시도하기
          </Button>
        </div>
      )}
    </main>
  );
}
