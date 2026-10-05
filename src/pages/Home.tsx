import { useState } from 'react';
import RecommendationCard from '../components/home/RecommendationCard';
import SeasonJarList from '../components/home/SeasonJarList';
import FloatingRecordCTA from '../components/home/FloatingRecordCTA';

export default function Home() {
  // 배경 이미지 상태
  const [bgImage] = useState(() => {
    // 현재 시간에 따라 배경 이미지 변경
    const currentHour = new Date().getHours();

    if (currentHour >= 6 && currentHour < 7) {
      return '/assets/home/bg-sunrise.webp';
    } else if (currentHour >= 7 && currentHour < 17) {
      return '/assets/home/bg-day.webp';
    } else if (currentHour >= 17 && currentHour < 18) {
      return '/assets/home/bg-sunset.webp';
    } else {
      return '/assets/home/bg-night.webp';
    }
  });

  return (
    <main className="w-full h-dvh overflow-y-auto overflow-x-hidden bg-[#F3D8AB]">
      <div
        className="relative flex flex-col min-h-full w-full"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: '100% auto',
          backgroundPosition: 'center top',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="relative w-full shrink-0 aspect-[1125/2050]">
          {/* 컨텐츠 추천 카드 */}
          <section className="absolute top-[23.77%] w-full px-6">
            <RecommendationCard />
          </section>

          {/* 단지 & 테이블 */}
          <section className="absolute top-[77.24%] w-full flex flex-col items-center">
            <div className="w-[86%] relative z-20">
              <SeasonJarList />
            </div>

            <div className="relative w-full flex justify-center -mt-[7%]">
              <img src="/assets/home/table.webp" className="w-[95%] object-contain pointer-events-none" />
              <p className="absolute bottom-[20%] text-[13px] text-[#00132B]/58 font-medium">단지를 눌러 기록을 확인해보세요.</p>
            </div>
          </section>
        </div>

        {/* 하단 CTA 카드 */}
        <div className="relative z-30 w-full shrink-0 mt-auto bg-transparent px-5 pt-4 pb-[max(16px,env(safe-area-inset-bottom))]">
          <FloatingRecordCTA />
        </div>
      </div>
    </main>
  );
}
