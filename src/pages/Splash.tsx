import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/onboarding', { replace: true });
    }, 1800);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <main className="flex flex-col items-center justify-center w-full h-dvh bg-white">
      {/* 배경 */}
      <img src="/assets/onboarding/splash.webp" className="absolute inset-0 w-full h-full object-cover pointer-events-none" />

      {/* 로고 영역 */}
      <div className="w-[120px] h-[60px] bg-gray-200 flex items-center justify-center z-10">
        <span className="font-bold">로고</span>
      </div>
    </main>
  );
}
