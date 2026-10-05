import { useState, useEffect } from 'react';
import RecommendationCard from '../components/home/RecommendationCard';
import SeasonJarList from '../components/home/SeasonJarList';
import FloatingRecordCTA from '../components/home/FloatingRecordCTA';

export default function Home() {
  // 배경 이미지 상태
  const [bgImage, setBgImage] = useState('/assets/home/bg-day.webp');

  useEffect(() => {
    // 현재 시간에 따라 배경 이미지 변경
    const currentHour = new Date().getHours();

    if (currentHour >= 6 && currentHour < 7) {
      setBgImage('/assets/home/bg-sunrise.webp');
    } else if (currentHour >= 7 && currentHour < 17) {
      setBgImage('/assets/home/bg-day.webp');
    } else if (currentHour >= 17 && currentHour < 18) {
      setBgImage('/assets/home/bg-sunset.webp');
    } else {
      setBgImage('/assets/home/bg-night.webp');
    }
  }, []);

  return (
    <main className="relative flex flex-col w-full min-h-dvh bg-[#F3D8AB] overflow-x-hidden">
      <div className="relative w-full aspect-[375/812] max-h-dvh">
        {/* 배경 이미지 */}
        <img src={bgImage} className="absolute inset-0 w-full h-full object-cover object-top pointer-events-none" />

        {/* 컨텐츠 추천 카드 */}
        <section className="absolute top-[20%] w-full px-6 z-10">
          <RecommendationCard />
        </section>

        {/* 단지 & 테이블 */}
        <section className="absolute top-[68%] w-full flex flex-col items-center z-10">
          <div className="w-full px-6 relative z-20">
            <SeasonJarList />
          </div>

          <div className="relative w-full flex justify-center -mt-[7%]">
            <img src="/assets/home/table.webp" className="w-[95%] object-contain pointer-events-none" />
            <p className="absolute bottom-[20%] text-[13px] text-[#00132B]/58 font-medium">단지를 눌러 기록을 확인해보세요.</p>
          </div>
        </section>
      </div>

      {/* CTA 버튼 */}
      <div className="fixed bottom-0 left-0 w-full px-5 pb-safe mb-[clamp(16px,3.5dvh,48px)] z-30">
        <FloatingRecordCTA />
      </div>
    </main>
  );
}
