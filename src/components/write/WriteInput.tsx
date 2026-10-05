import { useState, useRef } from 'react';

interface WriteInputProps {
  onTextChange?: (text: string) => void;
  initialValue?: string;
}

export default function WriteInput({ onTextChange, initialValue = '' }: WriteInputProps) {
  const [text, setText] = useState<string>(initialValue);
  const [isFocused, setIsFocused] = useState<boolean>(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const MAX_LENGTH = 100;
  const isOverLimit = text.length >= MAX_LENGTH;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const inputText = e.target.value;
    const clippedText = inputText.slice(0, MAX_LENGTH);
    setText(clippedText);

    if (onTextChange) onTextChange(clippedText);
  };

  const getBgColor = () => {
    if (isOverLimit) return 'bg-[#EF222F]/5'; // 글자수 초과 시
    if (isFocused) return 'bg-[#FFF9E7]'; // 입력 시
    return 'bg-[#F2F4F6]'; // 기본
  };

  return (
    <div className="flex flex-col w-full">
      <div
        className={`relative flex flex-col w-full h-[150px] rounded-2xl p-4 transition-colors duration-200 ${getBgColor()}`}
        onClick={() => textareaRef.current?.focus()}
      >
        <textarea
          ref={textareaRef}
          value={text}
          className="w-full h-full bg-transparent resize-none appearance-none [&::-webkit-resizer]:hidden [&::-webkit-scrollbar]:hidden outline-none text-[15px] text-[#191F28] placeholder:text-[#B0B8C1] leading-relaxed"
          placeholder={'계절의 순간을 기록해보세요!\n(글은 남기지 않아도 괜찮아요.)'}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          maxLength={MAX_LENGTH + 1}
        />

        <span
          className={`absolute bottom-4 right-4 text-[13px] font-medium transition-colors duration-200
            ${isOverLimit ? 'text-[#E42939]' : 'text-[#B0B8C1]'}`}
        >
          {text.length}/{MAX_LENGTH}
        </span>
      </div>

      <div className="h-5 mt-2 ml-1">
        {isOverLimit && <p className="text-[13px] font-medium text-[#E42939]">최대 100자까지 작성할 수 있어요</p>}
      </div>
    </div>
  );
}
