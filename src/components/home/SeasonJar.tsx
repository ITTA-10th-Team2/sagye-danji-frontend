interface SeasonJarProps {
  season: '봄' | '여름' | '가을' | '겨울';
  count: number;
  onClick?: () => void;
}

// 계절/개수에 따른 이미지 매핑
const getJarImage = (season: string, count: number) => {
  const seasonMap: Record<string, string> = {
    봄: 'spring',
    여름: 'summer',
    가을: 'autumn',
    겨울: 'winter',
  };
  const engSeason = seasonMap[season];

  const level = count >= 5 ? 5 : count >= 3 ? 3 : count >= 1 ? 1 : 0;

  return `/assets/jars/jar-${engSeason}-${level}.svg`;
};

export default function SeasonJar({ season, count, onClick }: SeasonJarProps) {
  const currentImgSrc = getJarImage(season, count);

  return (
    <div
      className="relative flex flex-col min-w-0 items-center justify-center cursor-pointer active:scale-95 transition-transform"
      onClick={onClick}
    >
      {/* 이미지 영역 */}
      <img src={currentImgSrc} className="w-full max-w-[75px] object-contain drop-shadow-sm transition-all duration-300" />

      {/* 텍스트 영역 */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-3">
        <span className="text-[15px] font-semibold text-[#000C1E]/80 leading-tight">{season}</span>
        <span className="text-[11px] font-medium text-[#00132B]/58 mt-0.5">{count}개</span>
      </div>
    </div>
  );
}
