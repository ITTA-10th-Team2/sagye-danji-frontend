import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Post, Paragraph } from '@toss/tds-mobile';

export default function WriteComplete() {
  const navigate = useNavigate();
  const [isPop, setIsPop] = useState(false);

  // 완료 애니메이션
  useEffect(() => {
    const timer = setTimeout(() => setIsPop(true), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="flex flex-col h-dvh px-5 pt-4 pb-6 bg-white overflow-hidden">
      <div className="flex flex-col flex-1 justify-center items-center">
        {/* 이미지 영역 */}
        <div className="w-[90%]">
          <img
            src="/assets/write-complete.png"
            className={`z-999 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
              isPop ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
            }`}
          />
        </div>

        {/* 완료 텍스트 영역 */}
        <div className="text-center">
          <Post.H2 paddingBottom={16}>가을 단지에 담았어요!</Post.H2>
          <Paragraph typography="t6">
            <Paragraph.Text style={{ color: '#00132B94' }}>
              사계단지에서
              <br />
              나의 기록을 확인해보세요.
            </Paragraph.Text>
          </Paragraph>
        </div>
      </div>

      {/* 버튼 영역 */}
      <div className="flex flex-col w-full gap-3 mt-auto">
        <button
          className="flex-1 py-4 text-[17px] font-semibold rounded-2xl! transition-all duration-200 bg-[#ffb331] text-white active:scale-95"
          onClick={() => {
            navigate('/danji');
          }}
        >
          단지 보러 가기
        </button>
        <button
          className="flex-1 py-4 text-[17px] font-semibold text-[#4E5968] bg-[#F2F4F6] rounded-2xl! active:scale-95 transition-all duration-200"
          onClick={() => {
            navigate('/home');
          }}
        >
          홈으로 이동
        </button>
      </div>
    </main>
  );
}
