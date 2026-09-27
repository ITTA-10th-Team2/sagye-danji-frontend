export default function FloatingRecordCTA() {
  return (
    <div className="flex items-center justify-between w-full p-2 pl-5 pr-5 bg-white/80 backdrop-blur-md border border-white/50 rounded-[16px] shadow-sm">
      {/* 텍스트 영역 */}
      <div className="flex flex-col">
        <p className="text-[15px] font-medium text-[#000C1E]/80">가을의 순간을 더 담아보세요</p>
        <p className="text-[11px] font-medium text-[#00132B]/58">기록 3개 · 12일째</p>
      </div>

      {/* 기록하기 버튼 */}
      <button
        className="px-3.5 py-2 text-[13px] font-semibold text-white !rounded-xl bg-gradient-to-r from-[#FFB84C] to-[#FFA31A] shadow-[0_2px_8px_rgba(255,163,26,0.3)] active:scale-95 transition-transform"
        onClick={() => {
          console.log('모달 열기');
        }}
      >
        기록하기
      </button>
    </div>
  );
}
