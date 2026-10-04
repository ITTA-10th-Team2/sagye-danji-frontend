import { useState, useEffect } from 'react';
import RecommendationCard from '../components/home/RecommendationCard';
import SeasonJarList from '../components/home/SeasonJarList';
import FloatingRecordCTA from '../components/home/FloatingRecordCTA';

export default function Home() {
  // 배경 이미지 상태
  const [bgImage, setBgImage] = useState('/assets/home/bg-day.png');

  useEffect(() => {
    // 현재 시간에 따라 배경 이미지 변경
    const currentHour = new Date().getHours();

    if (currentHour >= 6 && currentHour < 7) {
      setBgImage('/assets/home/bg-sunrise.png');
    } else if (currentHour >= 7 && currentHour < 17) {
      setBgImage('/assets/home/bg-day.png');
    } else if (currentHour >= 17 && currentHour < 18) {
      setBgImage('/assets/home/bg-sunset.png');
    } else {
      setBgImage('/assets/home/bg-night.png');
    }
  }, []);

  return (
    <main className="relative flex flex-col w-full h-dvh bg-[#F3D8AB] overflow-hidden">
      {/* 배경 */}
      <div
        className="absolute inset-0 z-0 w-full h-full pointer-events-none transition-all duration-1000"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundPosition: 'top center',
          backgroundSize: '100% auto',
          backgroundRepeat: 'no-repeat',
        }}
      />

      <div className="relative z-10 flex flex-col w-full h-full">
        {/* 상단 추천 카드 */}
        <section className="pt-[40vw] px-6">
          <RecommendationCard />
        </section>

        {/* 단지 */}
        <section className="mt-[35vw] flex flex-col items-center w-full">
          <div className="w-full px-6 relative z-20">
            <SeasonJarList />
          </div>

          {/* 테이블 & 안내 문구 */}
          <div className="relative w-full flex justify-center -mt-[7%]">
            <img src="/assets/home/table.png" className="w-full object-contain pointer-events-none" />
            <p className="absolute bottom-[20%] text-[13px] text-[#00132B]/58 font-medium">단지를 눌러 기록을 확인해보세요.</p>
          </div>
        </section>
      </div>

      {/* CTA 버튼 */}
      <div className="absolute bottom-0 left-0 w-full px-5 pb-safe mb-4 z-30">
        <FloatingRecordCTA />
      </div>
    </main>
  );
}
