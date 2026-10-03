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
      {/* 로고 영역 */}
      <div className="w-[120px] h-[60px] bg-gray-200 flex items-center justify-center mb-10">
        <span className="font-bold">로고</span>
      </div>
      <p className="text-center text-gray-500 font-medium whitespace-pre-line">
        배경 이미지{'\n'}_홈과 동일한 이미지{'\n'}_수정예정
      </p>
    </main>
  );
}
