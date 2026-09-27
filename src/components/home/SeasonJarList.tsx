import SeasonJar from './SeasonJar';

type SeasonType = '봄' | '여름' | '가을' | '겨울';

interface JarData {
  id: string;
  season: SeasonType;
  count: number;
}

// 더미데이터
const JAR_DATA: JarData[] = [
  { id: 'spring', season: '봄', count: 0 },
  { id: 'summer', season: '여름', count: 0 },
  { id: 'autumn', season: '가을', count: 3 },
  { id: 'winter', season: '겨울', count: 0 },
];

export default function SeasonJarList() {
  const handleJarClick = (season: SeasonType) => {
    console.log(`${season} 단지 클릭됨 / 추후 애니메이션 적용`);
  };

  return (
    <div className="flex items-end justify-between w-full px-2">
      {JAR_DATA.map((jar) => (
        <SeasonJar key={jar.id} season={jar.season} count={jar.count} onClick={() => handleJarClick(jar.season)} />
      ))}
    </div>
  );
}
