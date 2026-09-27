import { useState } from 'react';
import './Danji.css';
import ground from '../assets/danji/ground.svg';
import shadowA from '../assets/danji/shadow-a.svg';
import shadowB from '../assets/danji/shadow-b.svg';
import jarBack from '../assets/danji/jar-back.svg';
import jarInner from '../assets/danji/jar-inner.svg';
import jarGlow from '../assets/danji/jar-glow.svg';
import jarLidBase from '../assets/danji/jar-lid-base.svg';
import jarLidTop from '../assets/danji/jar-lid-top.svg';
import leavesTop from '../assets/danji/leaves-top.png';
import leafRight from '../assets/danji/leaf-right.png';
import leafLeft from '../assets/danji/leaf-left.png';
import sample1 from '../assets/danji/sample-1.jpg';
import sample2 from '../assets/danji/sample-2.jpg';
import sample3 from '../assets/danji/sample-3.jpg';
import sample4 from '../assets/danji/sample-4.jpg';
import sample5 from '../assets/danji/sample-5.jpg';

// Design fixtures only. Real records and API integration belong to separate tasks.
const previewRecords = [sample1, sample4, sample3, sample5, sample2].map((image, id) => ({
  id, image, date: '2026/09/23',
}));
type View = 'jar' | 'all' | 'detail';
type Sheet = 'none' | 'options' | 'select';

export default function Danji() {
  const [view, setView] = useState<View>('jar');
  const [sheet, setSheet] = useState<Sheet>('none');
  const [selected, setSelected] = useState<number | null>(null);

  function openDetail(index: number) {
    setSelected(index);
    setView('detail');
    setSheet('none');
  }

  return <div className="danji-page">
    <header className="danji-header">
      <button aria-label="뒤로" onClick={() => view === 'detail' ? setView('jar') : window.history.back()}>‹</button>
      <span className="danji-app-icon">⌂</span><strong>사계단지</strong><span className="danji-header-spacer" />
      <button aria-label="좋아요">♥</button><button aria-label="더보기">···</button><button aria-label="닫기">×</button>
    </header>
    <nav className="danji-tabs" aria-label="기록 보기 방식">
      <button className={view !== 'all' ? 'active' : ''} onClick={() => { setView('jar'); setSheet('none'); }}>단지</button>
      <button className={view === 'all' ? 'active' : ''} onClick={() => { setView('all'); setSheet('none'); }}>전체</button>
    </nav>

    {view === 'jar' && <section className="danji-scene" aria-label="가을 단지">
      <img className="danji-art ground" src={ground} alt="" /><img className="danji-art shadow-a" src={shadowA} alt="" />
      <img className="danji-art shadow-b" src={shadowB} alt="" /><img className="danji-art leaf-top" src={leavesTop} alt="" />
      <img className="danji-art leaf-right" src={leafRight} alt="" /><img className="danji-art leaf-left" src={leafLeft} alt="" />
      <div className="danji-jar" aria-hidden="true">
        <img className="jar-back" src={jarBack} alt="" /><img className="jar-inner" src={jarInner} alt="" />
        <img className="jar-glow" src={jarGlow} alt="" /><img className="jar-lid-base" src={jarLidBase} alt="" />
        <img className="jar-lid-top" src={jarLidTop} alt="" />
      </div>
      {previewRecords.map((record, index) => <button key={record.id} className={`danji-polaroid position-${index}`} onClick={() => openDetail(index)} aria-label={`${record.date} 기록 상세보기`}>
        <img src={record.image} alt="가을 기록 예시" /><time>{record.date}</time>
      </button>)}
      <div className="danji-dots" aria-hidden="true"><span className="active" /><span /></div>
      <div className="danji-actions"><button aria-label="단지 메뉴" onClick={() => setSheet('options')}>☷</button><button className="primary" onClick={() => setSheet('options')}>✎ &nbsp; 기록하기</button></div>
    </section>}

    {view === 'all' && <section className="danji-gallery" aria-label="전체 기록 예시">
      {previewRecords.map((record, index) => <button key={record.id} className="danji-mini-card" onClick={() => openDetail(index)}>
        <img src={record.image} alt="가을 기록 예시" /><time>{record.date}</time>
      </button>)}
    </section>}

    {view === 'detail' && selected !== null && <section className="danji-detail">
      <article className="danji-large-card"><span className="danji-badge">{selected + 1}/{previewRecords.length}</span>
        <img src={previewRecords[selected].image} alt="가을 기록 예시" /><time>{previewRecords[selected].date}</time>
      </article>
      <div className="danji-actions"><button onClick={() => setView('jar')}>뒤로</button><button className="primary" onClick={() => setSheet('select')}>기록 수정하기</button></div>
    </section>}
    {view === 'all' && <div className="danji-actions gallery-actions"><button aria-label="단지 메뉴" onClick={() => setSheet('options')}>☷</button><button className="primary" onClick={() => setSheet('options')}>✎ &nbsp; 기록하기</button></div>}

    {sheet !== 'none' && <div className="danji-sheet-backdrop" onClick={() => setSheet('none')}>
      {sheet === 'options' ? <div className="danji-sheet danji-option-sheet" onClick={(event) => event.stopPropagation()}>
        <button className="danji-sheet-handle" aria-label="닫기" onClick={() => setSheet('none')} />
        <button className="danji-sheet-primary" onClick={() => { setSelected(null); setSheet('select'); }}>기록 수정하기</button>
        <button className="danji-sheet-secondary" onClick={() => setSheet('none')}>단지 꾸미기</button>
      </div> : <div className="danji-sheet danji-select-sheet" onClick={(event) => event.stopPropagation()}>
        <button className="danji-sheet-handle" aria-label="닫기" onClick={() => setSheet('none')} />
        <strong>수정할 기록을 선택해주세요.</strong>
        <div className="danji-sheet-photos">{previewRecords.map((record) => <button key={record.id} className={selected === record.id ? 'selected' : ''} onClick={() => setSelected(record.id)}><img src={record.image} alt={`${record.date} 기록 선택`} /></button>)}</div>
        <button className="danji-sheet-primary" disabled={selected === null} onClick={() => setSheet('none')}>기록 수정하기</button>
      </div>}
    </div>}
  </div>;
}
