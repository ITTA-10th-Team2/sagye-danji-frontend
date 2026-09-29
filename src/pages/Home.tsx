import RecommendationCard from '../components/home/RecommendationCard';
import SeasonJarList from '../components/home/SeasonJarList';
import FloatingRecordCTA from '../components/home/FloatingRecordCTA';

export default function Home() {
  return (
    <main className="relative w-full h-dvh bg-[#E7C380] overflow-hidden">
      {/* 풍경 */}
      <div className="absolute top-0 left-0 w-full h-[50%] bg-[url('/assets/bg-sunset.png')] bg-contain bg-no-repeat bg-center " />
      {/* 전체 뼈대 */}
      <div className="absolute inset-0 w-full h-full pointer-events-none bg-[url('/assets/frame-base.png')] bg-[length:100%_auto] bg-top bg-no-repeat" />

      {/* 실제 UI 요소들 */}
      <div className="relative z-10 flex flex-col w-full h-full pb-safe">
        {/* 추천 카드 */}
        <section className="pt-14 px-6">
          <RecommendationCard />
        </section>

        {/* 단지 리스트 & 테이블 */}
        <section className="relative mt-auto flex flex-col items-center w-full pb-[20vh]">
          <div className="w-full px-6 relative z-20">
            <SeasonJarList />
          </div>
          <img src="/assets/table.png" className="w-[92%] object-contain pointer-events-none -mt-[8%]" />

          {/* 안내 텍스트 */}
          <p className="mt-[5%] text-[13px] text-gray-700/80 font-medium">단지를 눌러 기록을 확인해보세요.</p>
        </section>
      </div>

      {/* CTA 버튼 */}
      <div className="absolute bottom-0 left-0 w-full px-5 pb-safe mb-6 z-10">
        <FloatingRecordCTA />
      </div>
    </main>
  );
}
