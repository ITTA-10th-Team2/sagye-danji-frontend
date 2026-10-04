import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/onboarding', { replace: true });
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <main className="flex flex-col items-center justify-center w-full h-dvh bg-white">
      {/* 배경 */}
      <div
        className="absolute inset-0 w-full h-full pointer-events-none transition-all duration-1000"
        style={{
          backgroundImage: `url(/assets/onboarding/splash.webp)`,
          backgroundSize: '100% auto',
        }}
      />
      {/* 로고 영역 */}
      <div className="w-[120px] h-[60px] bg-gray-200 flex items-center justify-center z-10">
        <span className="font-bold">로고</span>
      </div>
    </main>
  );
}
