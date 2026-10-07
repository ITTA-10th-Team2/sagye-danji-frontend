import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import SeasonJar from './SeasonJar';
import { Modal } from '@toss/tds-mobile';
import { Lottie } from 'lottie-react';

import jarOpenAnimation from '../../assets/lottie/jar-open.json';
import type { RecordSeason } from '../../apis/records';
type SeasonType = '봄' | '여름' | '가을' | '겨울';

interface JarData {
  id: string;
  season: SeasonType;
  key: RecordSeason;
}

// 더미데이터
const JAR_DATA: JarData[] = [
  { id: 'spring', season: '봄', key: 'SPRING' },
  { id: 'summer', season: '여름', key: 'SUMMER' },
  { id: 'autumn', season: '가을', key: 'AUTUMN' },
  { id: 'winter', season: '겨울', key: 'WINTER' },
];

export default function SeasonJarList({ counts }: { counts?: Record<RecordSeason, number> }) {
  const navigate = useNavigate();

  const [isSeasonModalOpen, setIsSeasonModalOpen] = useState<boolean>(false);
  const [isAnimationPlaying, setIsAnimationPlaying] = useState<boolean>(false);

  const handleJarClick = (season: SeasonType) => {
    if (season !== '가을') setIsSeasonModalOpen(true);
    else setIsAnimationPlaying(true);
  };

  return (
    <>
      <div className="grid grid-cols-4 items-end gap-[clamp(6px,2%,8px)] w-full max-w-[324px] mx-auto">
        {JAR_DATA.map((jar) => (
          <SeasonJar key={jar.id} season={jar.season} count={counts?.[jar.key]} onClick={() => handleJarClick(jar.season)} />
        ))}
      </div>

      {/* 다른 계절 클릭 시 모달 */}
      <Modal open={isSeasonModalOpen} onOpenChange={setIsSeasonModalOpen}>
        <Modal.Overlay />
        <Modal.Content
          style={{
            padding: '24px 20px 20px 20px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div className="flex flex-col mb-6">
            <h3 className="text-[20px] font-bold text-[#191F28] mb-2">아직 숙성 중이에요.</h3>
            <p className="text-[15px] font-medium text-gray-500 leading-snug whitespace-pre-line">계절이 무르익으면 열어볼 수 있어요.</p>
          </div>

          <button
            className="self-end px-2 py-1 text-[17px] font-semibold text-[#ee8f11] active:opacity-50 transition-opacity"
            onClick={() => setIsSeasonModalOpen(false)}
          >
            확인
          </button>
        </Modal.Content>
      </Modal>

      {isAnimationPlaying &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60">
            <div className="w-full scale-350 origin-bottom">
              <Lottie
                src={jarOpenAnimation}
                loop={false}
                autoplay={true}
                subscriptions={{
                  complete: () => {
                    navigate('/danji');
                  },
                }}
              />
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
