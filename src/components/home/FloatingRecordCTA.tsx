import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { BottomSheet } from '@toss/tds-mobile';
import { Device, getPermission, openPermissionDialog } from '@apps-in-toss/web-framework';
import { sdkPhotoToDataUrl } from '../../lib/recordImage';
import type { WritePhotoState } from '../../lib/recordImage';
import { getRecordSummary } from '../../apis/records';
import type { RecordSummary } from '../../apis/records';

type SummaryState = { status: 'loading' } | { status: 'error' } | { status: 'success'; summary: RecordSummary };

export default function FloatingRecordCTA({ renderTrigger }: { renderTrigger?: (open: () => void) => ReactNode }) {
  const navigate = useNavigate();

  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState<boolean>(false);
  const [isPermissionSheetOpen, setIsPermissionSheetOpen] = useState<boolean>(false);
  const [permissionTarget, setPermissionTarget] = useState<'camera' | 'album'>('album');
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [summaryState, setSummaryState] = useState<SummaryState>({ status: 'loading' });
  const [summaryAttempt, setSummaryAttempt] = useState(0);
  const showSummary = !renderTrigger;

  useEffect(() => {
    if (!showSummary) return;
    const controller = new AbortController();
    /** 홈 카드의 기록 요약 조회 */
    async function loadSummary() {
      try {
        const summary = await getRecordSummary(controller.signal);
        if (!controller.signal.aborted) setSummaryState({ status: 'success', summary });
      } catch {
        if (!controller.signal.aborted) setSummaryState({ status: 'error' });
      }
    }
    void loadSummary();
    return () => controller.abort();
  }, [showSummary, summaryAttempt]);

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  // 앨범 선택 시
  const handleGalleryClick = () => {
    setPhotoError(null);
    setPermissionTarget('album');
    setIsBottomSheetOpen(false);
    setTimeout(() => {
      setIsPermissionSheetOpen(true);
    }, 200);
  };

  // 카메라 선택 시
  const handleCameraClick = () => {
    setPhotoError(null);
    setPermissionTarget('camera');
    setIsBottomSheetOpen(false);
    setTimeout(() => setIsPermissionSheetOpen(true), 200);
  };

  // 권한 허용 시트 내용
  const permissionContent = {
    album: {
      title: '사진 접근 권한이 필요해요',
      desc: '사계단지에 기록할 사진을 선택하기 위해\n사진 접근 권한이 필요해요.',
      icon: '/assets/icons/gallery.svg',
      collect: '기기 내 사진',
    },
    camera: {
      title: '카메라 접근 권한이 필요해요',
      desc: '사계단지에 기록할 순간을 직접 촬영하기 위해\n카메라 사용 권한이 필요해요.',
      icon: '/assets/icons/camera.svg',
      collect: '카메라로 촬영한 사진',
    },
  };

  const content = permissionContent[permissionTarget];

  // '계속하기' 버튼 클릭 시
  const handleContinueClick = async () => {
    try {
      // 갤러리 권한일 시
      if (permissionTarget === 'album') {
        let status = await getPermission({ name: 'photos', access: 'read' });

        // 권한 팝업 열기
        if (status !== 'allowed') {
          status = await openPermissionDialog({ name: 'photos', access: 'read' });
        }

        if (status === 'denied') {
          console.log('갤러리 접근 권한을 거부했어요.');
          setIsPermissionSheetOpen(false);
          return;
        }

        if (status === 'allowed') {
          setIsPermissionSheetOpen(false);

          // 사진 선택
          const items = await Device.getAlbumItems({
            types: ['PHOTO'],
            maxCount: 5,
            base64: true,
          });

          if (items.length === 0) {
            console.log('사진 선택이 취소되었어요.');
            return;
          }

          // 기록 페이지로 이동하면서 사진 데이터 같이 보내기
          const photoArray = items.map((item) => sdkPhotoToDataUrl(item.dataUri));
          navigate('/write', { state: { photos: photoArray, source: 'GALLERY' } satisfies WritePhotoState });
        }
      } else if (permissionTarget === 'camera') {
        // 카메라 권한일 시
        let status = await getPermission({ name: 'camera', access: 'access' });

        // 권한 팝업 열기
        if (status !== 'allowed') {
          status = await openPermissionDialog({ name: 'camera', access: 'access' });
        }

        if (status === 'denied') {
          console.log('카메라 접근 권한을 거부했어요.');
          setIsPermissionSheetOpen(false);
          return;
        }

        if (status === 'allowed') {
          setIsPermissionSheetOpen(false);

          await delay(300);

          // 촬영하기
          try {
            const response = await Device.openCamera({ base64: true, maxWidth: 500 });

            if (!response || !response.dataUri) {
              console.log('사진 촬영이 취소되었어요.');
              return;
            }

            // 기록 페이지로 이동하면서 사진 데이터 같이 보내기
            const imageUri = sdkPhotoToDataUrl(response.dataUri);
            navigate('/write', { state: { photos: [imageUri], source: 'CAMERA' } satisfies WritePhotoState, replace: true });
          } catch (error) {
            setPhotoError(error instanceof Error ? error.message : '사진을 준비하지 못했어요. 다시 시도해주세요.');
            console.error('카메라 실행 및 촬영 오류:', error);
          }
        }
      }
    } catch (error: unknown) {
      setPhotoError(error instanceof Error ? error.message : '사진을 준비하지 못했어요. 다시 시도해주세요.');
      console.error('권한 요청 또는 실행 중 오류:', error instanceof Error ? error.message : error);
    }
  };

  return (
    <>
      {photoError && (
        <p role="alert" className="mb-2 text-center text-[13px] text-[#E42939]">
          {photoError}
        </p>
      )}
      {renderTrigger ? (
        renderTrigger(() => setIsBottomSheetOpen(true))
      ) : (
        <div className="flex items-center justify-between w-full p-2 pl-5 pr-5 bg-white/80 backdrop-blur-md border border-white/50 rounded-[16px] shadow-sm">
          {/* 텍스트 영역 */}
          <div className="flex flex-col">
            <p className="text-[15px] font-medium text-[#000C1E]/80">가을의 순간을 더 담아보세요</p>
            <p className="text-[11px] font-medium text-[#00132B]/58" aria-live="polite" aria-busy={summaryState.status === 'loading'}>
              {summaryState.status === 'loading'
                ? '기록을 불러오는 중이에요'
                : summaryState.status === 'error'
                  ? '기록 정보를 불러오지 못했어요'
                  : summaryState.summary.recordCount === 0
                    ? '첫 계절의 순간을 담아보세요'
                    : `기록 ${summaryState.summary.recordCount}개 · ${summaryState.summary.recordingDayCount}일째`}
            </p>
            {summaryState.status === 'error' && (
              <button
                className="self-start text-[11px] text-[#00132B]/58 underline"
                onClick={() => {
                  setSummaryState({ status: 'loading' });
                  setSummaryAttempt((value) => value + 1);
                }}
              >
                다시 시도
              </button>
            )}
          </div>

          {/* 기록하기 버튼 */}
          <button
            className="px-3.5 py-2 text-[13px] font-semibold text-white rounded-xl! bg-gradient-to-r from-[#FFB84C] to-[#FFA31A] shadow-[0_2px_8px_rgba(255,163,26,0.3)] active:scale-95 transition-transform"
            onClick={() => setIsBottomSheetOpen(true)}
          >
            기록하기
          </button>
        </div>
      )}

      {/* 사진 추가 바텀시트 */}
      <BottomSheet
        open={isBottomSheetOpen}
        onClose={() => setIsBottomSheetOpen(false)}
        header={<BottomSheet.Header>사진을 추가해주세요</BottomSheet.Header>}
        cta={
          <div className="flex w-full gap-3 px-6 pb-6">
            <button
              className="flex-1 py-4 text-[17px] font-semibold text-[#4E5968] bg-[#F2F4F6] rounded-2xl! active:scale-95 transition-transform"
              onClick={handleCameraClick}
            >
              카메라로 촬영
            </button>
            <button
              className="flex-1 py-4 text-[17px] font-semibold text-white bg-[#ffb331] rounded-2xl! active:scale-95 transition-transform"
              onClick={handleGalleryClick}
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

      {/* 권한 설정 바텀시트 */}
      <BottomSheet
        open={isPermissionSheetOpen}
        onClose={() => setIsPermissionSheetOpen(false)}
        header={<BottomSheet.Header>{content.title}</BottomSheet.Header>}
        cta={
          <div className="flex w-full gap-3 px-6 pb-6">
            <button
              className="flex-1 py-4 text-[17px] font-semibold text-[#4E5968] bg-[#F2F4F6] rounded-2xl! active:scale-95 transition-transform"
              onClick={() => setIsPermissionSheetOpen(false)}
            >
              뒤로
            </button>
            <button
              className="flex-1 py-4 text-[17px] font-semibold text-white bg-[#ffb331] rounded-2xl! active:scale-95 transition-transform"
              onClick={handleContinueClick}
            >
              계속하기
            </button>
          </div>
        }
      >
        <div className="px-6 pb-6">
          <p className="text-[15px] font-medium text-gray-500 whitespace-pre-line">{content.desc}</p>
        </div>

        <div className="px-6 pb-8">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <img src={content.icon} alt="수집 항목" />
              <div className="flex flex-col mt-0.5">
                <span className="text-[16px] font-bold text-[#191F28]">수집 항목</span>
                <span className="text-[13px] text-gray-500 font-medium">{content.collect}</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <img src="/assets/icons/document.svg" alt="이용 목적" />
              <div className="flex flex-col mt-0.5">
                <span className="text-[16px] font-bold text-[#191F28]">이용 목적</span>
                <span className="text-[13px] text-gray-500 font-medium">사계단지에 기록할 사진 촬영 및 업로드</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <img src="/assets/icons/lock.svg" alt="보관 기간" />
              <div className="flex flex-col mt-0.5">
                <span className="text-[16px] font-bold text-[#191F28]">보관 기간</span>
                <span className="text-[13px] text-gray-500 font-medium">
                  선택한 사진만 사용되며,
                  <br />
                  별도로 저장하지 않아요.
                </span>
              </div>
            </div>
          </div>
        </div>
      </BottomSheet>
    </>
  );
}
