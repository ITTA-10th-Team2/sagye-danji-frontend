import { useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ListHeader } from '@toss/tds-mobile';
import UploadedPhoto from '../components/write/UploadedPhoto';
import WriteInput from '../components/write/WriteInput';
import WriteBottomCTA from '../components/write/WriteBottomCTA';
import type { WritePhotoState } from '../lib/recordImage';
import { uploadRecordImage } from '../apis/images';
import type { ImageUploadStage } from '../apis/images';
import { createRecord } from '../apis/records';
import { ApiError } from '../lib/axios';
import { isAxiosError } from 'axios';

export default function Write() {
  const navigate = useNavigate();
  const location = useLocation();
  const photoState = location.state as WritePhotoState | null;

  // 더미 사진 데이터
  const DUMMY_PHOTOS = photoState?.photos || [
    'https://images.unsplash.com/photo-1507371341162-763b5e419408?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1476820865390-c52aeebb9891?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1507371341162-763b5e419408?q=80&w=400&auto=format&fit=crop',
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [texts, setTexts] = useState<string[]>(Array(DUMMY_PHOTOS.length).fill(''));
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [progress, setProgress] = useState('');
  const [uncertainSave, setUncertainSave] = useState(false);
  const [savedPhotos, setSavedPhotos] = useState<number[]>([]);
  const saving = useRef(false);
  const objectKeys = useRef(new Map<number, string>());
  const savedIndexes = useRef(new Set<number>());
  const recordDate = useRef(new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(new Date()));

  /** 사진 업로드 후 사진별 기록 저장 */
  async function handleSave() {
    if (saving.current || uncertainSave) return;
    if (!photoState?.photos.length || !['CAMERA', 'GALLERY'].includes(photoState.source)) {
      setSaveError('홈에서 사진을 다시 선택해주세요.');
      return;
    }
    saving.current = true;
    setIsSaving(true);
    setSaveError(null);
    let stage: ImageUploadStage | 'create' = 'image-prepare';
    try {
      for (let index = 0; index < photoState.photos.length; index++) {
        if (savedIndexes.current.has(index)) continue;
        stage = 'image-prepare';
        setProgress(`사진 업로드 중 ${index + 1}/${photoState.photos.length}`);
        let objectKey = objectKeys.current.get(index);
        if (!objectKey) {
          objectKey = await uploadRecordImage(photoState.photos[index], (value) => {
            stage = value;
          });
          objectKeys.current.set(index, objectKey);
        }
        stage = 'create';
        setProgress(`기록 저장 중 ${index + 1}/${photoState.photos.length}`);
        await createRecord({
          recordDate: recordDate.current,
          memo: texts[index]?.trim() || null,
          objectKey,
        });
        savedIndexes.current.add(index);
        setSavedPhotos([...savedIndexes.current]);
      }
      navigate('/write/complete', { replace: true });
    } catch (error) {
      const status = error instanceof ApiError ? error.status : isAxiosError(error) ? error.response?.status : undefined;
      const code = error instanceof ApiError ? error.code : isAxiosError(error) ? error.code : undefined;
      const storageCode =
        isAxiosError(error) && typeof error.response?.data === 'string'
          ? /<Code>([A-Za-z0-9]+)<\/Code>/.exec(error.response.data)?.[1]
          : undefined;
      const errorName = error instanceof Error ? error.name : 'UnknownError';
      console.error('[Record] 저장 실패', { stage, status, code, storageCode, errorName });
      const unknownResult = stage === 'create' && (status === undefined || status >= 500 || status === 409);
      setUncertainSave(unknownResult);
      setSaveError(
        unknownResult
          ? '저장 결과를 확인하지 못했어요. 홈으로 돌아가 기록을 확인해주세요.'
          : `${savedIndexes.current.size}개 저장됨 · 저장하지 못한 사진은 다시 시도해주세요.`,
      );
    } finally {
      saving.current = false;
      setIsSaving(false);
      setProgress('');
    }
  }

  // 텍스트 입력 핸들러
  const handleTextChange = (newText: string) => {
    if (saving.current || savedIndexes.current.has(currentIndex)) return;
    const updatedTexts = [...texts];
    updatedTexts[currentIndex] = newText;
    setTexts(updatedTexts);
  };

  // 버튼 클릭 핸들러
  const handleBack = () => {
    if (saving.current) return;
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else {
      navigate('/home');
    }
  };

  const handleNext = async () => {
    if (saving.current) return;
    if (currentIndex < DUMMY_PHOTOS.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      await handleSave();
    }
  };

  const numberWords = ['첫', '두', '세', '네', '다섯', '여섯', '일곱', '여덟', '아홉', '열'];
  const currentWord = numberWords[currentIndex] || `${currentIndex + 1}번째`;
  const currentText = texts[currentIndex]; // 현재 사진에 작성된 글자 수 확인
  const isLastStep = currentIndex === DUMMY_PHOTOS.length - 1;

  return (
    <div className="flex flex-col h-dvh bg-white overflow-hidden">
      {/* 리스트헤더 */}
      <ListHeader
        title={
          <ListHeader.TitleParagraph typography="t4" fontWeight="bold">
            {currentWord} 번째 사진의 <br />
            이야기를 작성해주세요.
          </ListHeader.TitleParagraph>
        }
        right={
          <ListHeader.RightArrow typography="t7" onClick={handleSave}>
            바로 저장하기
          </ListHeader.RightArrow>
        }
        description={
          <ListHeader.DescriptionParagraph fontWeight="regular">
            {currentIndex + 1}/{DUMMY_PHOTOS.length}
          </ListHeader.DescriptionParagraph>
        }
        titleWidthRatio={0.68}
      />

      <main className="flex flex-col flex-1 px-5 pt-4 pb-6">
        {/* 사진 & 글쓰기 영역 */}
        <fieldset disabled={isSaving || savedPhotos.includes(currentIndex)} className="flex flex-col gap-y-4 border-0 p-0 m-0 min-w-0">
          <section>
            <UploadedPhoto imageUrl={DUMMY_PHOTOS[currentIndex]} />
          </section>

          <section>
            <WriteInput key={`input-${currentIndex}`} onTextChange={handleTextChange} initialValue={currentText} />
          </section>
        </fieldset>

        {/* 버튼 영역 */}
        <div className="mt-auto">
          {isSaving && (
            <p role="status" className="mb-2 text-center text-[13px]">
              {progress}
            </p>
          )}
          {saveError && (
            <p role="alert" className="mb-2 text-center text-[13px] text-[#E42939]">
              {saveError}
            </p>
          )}
          <WriteBottomCTA
            onBackClick={handleBack}
            onNextClick={handleNext}
            isLastStep={isLastStep}
            isNextDisabled={isSaving || uncertainSave}
          />
        </div>
      </main>
    </div>
  );
}
