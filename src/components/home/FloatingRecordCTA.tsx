import { useState } from 'react';
import { BottomSheet } from '@toss/tds-mobile';

export default function FloatingRecordCTA() {
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

  //   const handleCameraClick = () => {
  //     console.log('카메라로 촬영 로직 실행');
  //     setIsBottomSheetOpen(false);
  //   };

  //   const handleGalleryClick = () => {
  //     console.log('앨범에서 선택 로직 실행');
  //     setIsBottomSheetOpen(false);
  //   };

  return (
    <>
      <div className="flex items-center justify-between w-full p-2 pl-5 pr-5 bg-white/80 backdrop-blur-md border border-white/50 rounded-[16px] shadow-sm">
        {/* 텍스트 영역 */}
        <div className="flex flex-col">
          <p className="text-[15px] font-medium text-[#000C1E]/80">가을의 순간을 더 담아보세요</p>
          <p className="text-[11px] font-medium text-[#00132B]/58">기록 3개 · 12일째</p>
        </div>

        {/* 기록하기 버튼 */}
        <button
          className="px-3.5 py-2 text-[13px] font-semibold text-white rounded-xl! bg-gradient-to-r from-[#FFB84C] to-[#FFA31A] shadow-[0_2px_8px_rgba(255,163,26,0.3)] active:scale-95 transition-transform"
          onClick={() => {
            setIsBottomSheetOpen(true);
          }}
        >
          기록하기
        </button>
      </div>

      {/* 바텀시트 */}
      <BottomSheet
        open={isBottomSheetOpen}
        onClose={() => setIsBottomSheetOpen(false)}
        header={<BottomSheet.Header>사진을 추가해주세요</BottomSheet.Header>}
        cta={
          <div className="flex w-full gap-3 px-6 pb-6">
            <button
              className="flex-1 py-4 text-[17px] font-semibold text-[#4E5968] bg-[#F2F4F6] rounded-2xl! active:scale-95 transition-transform"
              onClick={() => setIsBottomSheetOpen(false)}
            >
              카메라로 촬영
            </button>
            <button
              className="flex-1 py-4 text-[17px] font-semibold text-white bg-[#ffb331] rounded-2xl! active:scale-95 transition-transform"
              onClick={() => setIsBottomSheetOpen(false)}
            >
              앨범에서 선택
            </button>
          </div>
        }
      >
        <div className="px-6 pb-3">
          <p className="text-[15px] font-medium text-gray-500">등록일 기준으로 맞는 계절에 자동 저장돼요.</p>
        </div>
      </BottomSheet>
    </>
  );
}
