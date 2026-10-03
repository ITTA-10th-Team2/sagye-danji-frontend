interface WriteBottomCTAProps {
  onBackClick: () => void;
  onNextClick: () => void;
  isLastStep?: boolean;
  isNextDisabled?: boolean;
}

export default function WriteBottomCTA({ onBackClick, onNextClick, isNextDisabled = false, isLastStep = false }: WriteBottomCTAProps) {
  return (
    <div className="flex w-full gap-3 mt-auto">
      <button
        className="flex-1 py-4 text-[17px] font-semibold text-[#4E5968] bg-[#F2F4F6] rounded-2xl! active:scale-95 transition-all duration-200"
        onClick={onBackClick}
      >
        뒤로
      </button>

      <button
        className={`flex-1 py-4 text-[17px] font-semibold rounded-2xl! transition-all duration-200
          ${isNextDisabled ? 'bg-[#F2F4F6] text-[#B0B8C1]' : 'bg-[#ffb331] text-white active:scale-95'}
        `}
        onClick={onNextClick}
        disabled={isNextDisabled}
      >
        {isLastStep ? '단지에 담기' : '다음'}
      </button>
    </div>
  );
}
