import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { completeOnboarding } from '../apis/member';

const ONBOARDING_DATA = [
  {
    image: '/assets/onboarding/onboarding-1.webp',
    title: '오늘, 이 계절을 누리는 한 가지 방법',
    desc: '지금 놓치기 아쉬운 계절 활동을\n매일 하나씩 추천해 드려요.',
    blurColor: 'bg-[#F8B8B3]',
  },
  {
    image: '/assets/onboarding/onboarding-2.png',
    title: '사계 단지에 찰칵!',
    desc: '오늘 누린 계절의 순간을\n사진으로 남겨보세요.',
    blurColor: 'bg-[#CACE56]',
  },
  {
    image: '/assets/onboarding/onboarding-3.webp',
    title: '계절이 건네는 풍요',
    desc: '하나씩 담은 순간이 모여\n나만의 사계가 됩니다.',
    blurColor: 'bg-[#FFC642]',
  },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const submitting = useRef(false);

  // 스와이프 감지 관련 상태
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);

  const isLastStep = step === ONBOARDING_DATA.length - 1;

  const handleNextClick = async () => {
    if (submitting.current) return;
    if (isLastStep) {
      submitting.current = true;
      setIsSubmitting(true);
      setSubmitError(false);

      // 로그인 상태에 따른 분기 처리
      try {
        const member = await completeOnboarding();
        if (member.onboardingStatus !== 'COMPLETED') throw new Error('온보딩 완료 상태가 반영되지 않았습니다.');
        navigate('/home', { replace: true });
      } catch {
        setSubmitError(true);
      } finally {
        submitting.current = false;
        setIsSubmitting(false);
      }
    } else {
      setStep((prev) => prev + 1);
    }
  };

  // 스와이프 로직
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (submitting.current) {
      setTouchStartX(0);
      setTouchEndX(0);
      return;
    }
    if (!touchStartX || !touchEndX) return;
    const distance = touchStartX - touchEndX;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance && !isLastStep) {
      setStep((prev) => prev + 1);
    } else if (distance < -minSwipeDistance && step > 0) {
      setStep((prev) => prev - 1);
    }
    setTouchStartX(0);
    setTouchEndX(0);
  };

  return (
    <main
      className="relative flex flex-col items-center w-full h-dvh bg-white pb-safe overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 슬라이드 적용 영역 */}
      <div className="flex-1 w-full overflow-hidden -mt-10">
        <div
          className="flex w-full h-full transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]"
          style={{ transform: `translateX(-${step * 100}%)` }}
        >
          {ONBOARDING_DATA.map((data, index) => (
            <div key={index} className="flex flex-col items-center justify-center min-w-full px-6 pt-16">
              <div className="relative w-[240px] h-[240px] mb-4 flex justify-center items-center">
                {/* 블러 영역 */}
                <div className={`absolute -top-8 -right-10 w-[180px] h-[180px] rounded-full blur-[30px] opacity-35 ${data.blurColor}`} />
                {/* 이미지 영역 */}
                <img src={data.image} className="relative z-10 object-contain w-full h-full" />
              </div>
              {/* 설명글 영역 */}
              <h2 className="text-[20px] font-bold text-[#191F28] mb-4 text-center">{data.title}</h2>
              <p className="text-[15px] text-[#00132B]/58 text-center leading-[1.4] whitespace-pre-line">{data.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col w-full px-5 pb-6 z-20 bg-white">
        {/* 인디케이터 영역 */}
        <div className="flex justify-center gap-2 mb-14">
          {ONBOARDING_DATA.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${step === index ? 'w-4 bg-[#ffb331]' : 'w-2 bg-gray-200'}`}
            />
          ))}
        </div>

        {/* 버튼 영역 */}
        {submitError && (
          <p className="mb-3 text-center text-[13px] text-[#E42939]" role="alert">
            완료 상태를 저장하지 못했어요. 다시 시도해주세요.
          </p>
        )}
        <button
          className="w-full py-4 text-[17px] border-none font-semibold rounded-2xl! transition-all duration-200 bg-[#ffb331] text-white active:scale-95 disabled:opacity-60"
          onClick={handleNextClick}
          disabled={isSubmitting}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? '저장 중…' : isLastStep ? '시작하기' : '다음'}
        </button>
      </div>
    </main>
  );
}
