export default function RecommendationCard() {
  return (
    <div className="mx-auto flex flex-col items-start w-[80%] px-5 py-8 bg-white/30 backdrop-opacity-50 border border-white/40 rounded-[12px] shadow-sm">
      {/* 아이콘 영역 */}
      <div className="flex items-center justify-center w-12 h-12 mb-3 bg-[#07194C]/5 rounded-[16px] shadow-sm">
        <img src="/assets/icons/sun.svg" className="w-[70%]" />
      </div>

      {/* 서브 타이틀 */}
      <span className="mb-1 text-[13px] font-medium text-[#031228]/70">오늘의 추천 콘텐츠</span>

      {/* 메인 타이틀 */}
      <h2 className="mb-3 text-[28px] font-bold text-[#191F28]">지금이 제철인 밤</h2>

      {/* 본문 설명 */}
      <p className="text-[17px] font-medium text-[#031228]/70 leading-snug">
        여유롭게 보늬밤을
        <br />
        만들어 보는 건 어떨까요?
      </p>
    </div>
  );
}
