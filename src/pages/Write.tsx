import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ListHeader } from '@toss/tds-mobile';
import UploadedPhoto from '../components/write/UploadedPhoto';
import WriteInput from '../components/write/WriteInput';
import WriteBottomCTA from '../components/write/WriteBottomCTA';

export default function Write() {
  // 더미 사진 데이터
  const DUMMY_PHOTOS = [
    'https://images.unsplash.com/photo-1507371341162-763b5e419408?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1476820865390-c52aeebb9891?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1507371341162-763b5e419408?q=80&w=400&auto=format&fit=crop',
  ];

  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [texts, setTexts] = useState<string[]>(Array(DUMMY_PHOTOS.length).fill(''));

  // 텍스트 입력 핸들러
  const handleTextChange = (newText: string) => {
    const updatedTexts = [...texts];
    updatedTexts[currentIndex] = newText;
    setTexts(updatedTexts);
  };

  // 버튼 클릭 핸들러
  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else {
      navigate('/');
    }
  };

  const handleNext = () => {
    if (currentIndex < DUMMY_PHOTOS.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      navigate('/write/complete');
    }
  };

  const numberWords = ['첫', '두', '세', '네', '다섯', '여섯', '일곱', '여덟', '아홉', '열'];
  const currentWord = numberWords[currentIndex] || `${currentIndex + 1}번째`;
  const currentText = texts[currentIndex]; // 현재 사진에 작성된 글자 수 확인
  const isLastStep = currentIndex === DUMMY_PHOTOS.length - 1;

  return (
    <main className="flex flex-col h-dvh px-5 pt-4 pb-6 bg-white overflow-hidden">
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <ListHeader
          title={
            <ListHeader.TitleParagraph typography="t4" fontWeight="bold">
              {currentWord} 번째 사진의 <br />
              이야기를 작성해주세요.
            </ListHeader.TitleParagraph>
          }
          description={
            <ListHeader.DescriptionParagraph fontWeight="regular">
              {currentIndex + 1}/{DUMMY_PHOTOS.length}
            </ListHeader.DescriptionParagraph>
          }
          rightAlignment="center"
        />
      </div>

      <section>
        <UploadedPhoto imageUrl={DUMMY_PHOTOS[currentIndex]} />
      </section>

      <section>
        <WriteInput key={`input-${currentIndex}`} onTextChange={handleTextChange} initialValue={currentText} />
      </section>

      <WriteBottomCTA onBackClick={handleBack} onNextClick={handleNext} isLastStep={isLastStep} />
    </main>
  );
}
