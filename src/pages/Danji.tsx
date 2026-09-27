import { useEffect, useState } from 'react';
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
const initialRecords = [sample1, sample4, sample3, sample5, sample2, sample3, sample1, sample4, sample5, sample2].map((image, id) => ({
  id, image, date: '2026/09/23', note: '',
}));
type View = 'jar' | 'all' | 'detail' | 'editor' | 'decorate';
type Sheet = 'none' | 'options' | 'select';

export default function Danji() {
  const [previewRecords, setPreviewRecords] = useState(() => {
    try { return JSON.parse(localStorage.getItem('danji-preview-records') || 'null') || initialRecords; }
    catch { return initialRecords; }
  });
  const [page, setPage] = useState(0);
  const [draftDate, setDraftDate] = useState('2026-09-23');
  const [draftNote, setDraftNote] = useState('');
  const [draftImage, setDraftImage] = useState<string | null>(null);
  const [stickers, setStickers] = useState<{ id: number; icon: string; x: number; y: number }[]>(() => {
    try { return JSON.parse(localStorage.getItem('danji-preview-stickers') || '[]'); }
    catch { return []; }
  });
  const [stickerIcon, setStickerIcon] = useState('🍁');
  const [headerMenu, setHeaderMenu] = useState(false);
  const [view, setView] = useState<View>('jar');
  const [sheet, setSheet] = useState<Sheet>('none');
  const [selected, setSelected] = useState<number | null>(null);
  const pageCount = Math.max(1, Math.ceil(previewRecords.length / 5));
  useEffect(() => { localStorage.setItem('danji-preview-records', JSON.stringify(previewRecords)); }, [previewRecords]);
  useEffect(() => { localStorage.setItem('danji-preview-stickers', JSON.stringify(stickers)); }, [stickers]);

  function editRecord(id: number) {
    const record = previewRecords.find((item: typeof initialRecords[number]) => item.id === id);
    if (!record) return;
    setSelected(id); setDraftDate(record.date.replaceAll('/', '-')); setDraftNote(record.note); setDraftImage(record.image);
    setSheet('none'); setView('editor');
  }
  function saveRecord() {
    if (!draftDate || !draftImage) return;
    if (selected === null) {
      const id = Math.max(-1, ...previewRecords.map((item: typeof initialRecords[number]) => item.id)) + 1;
      setPreviewRecords((items: typeof initialRecords) => [...items, { id, date: draftDate.replaceAll('-', '/'), note: draftNote, image: draftImage }]);
      setSelected(id);
    } else setPreviewRecords((items: typeof initialRecords) => items.map(item => item.id === selected ? { ...item, date: draftDate.replaceAll('-', '/'), note: draftNote, image: draftImage } : item));
    setView('detail');
  }
  function createRecord() { setSelected(null); setDraftDate(new Date().toISOString().slice(0, 10)); setDraftNote(''); setDraftImage(null); setSheet('none'); setView('editor'); }

  function openDetail(index: number) {
    setSelected(index);
    setView('detail');
    setSheet('none');
  }

  return <div className="danji-page">
    {import.meta.env.DEV && <div className="danji-device-status" aria-hidden="true"><span>9:41</span><i /><span>▂▅ ▰</span></div>}
    <header className="danji-header">
      <button aria-label="뒤로" onClick={() => view === 'editor' ? setView('detail') : view === 'detail' || view === 'decorate' ? setView('jar') : window.history.back()}>‹</button>
      <span className="danji-app-icon">⌂</span><strong>사계단지</strong><span className="danji-header-spacer" />
      <button aria-label="좋아요: 토스 앱 공통 버튼" title="토스 앱 공통 버튼">♥</button><span className="header-pair"><button aria-label="더보기" onClick={() => setHeaderMenu(!headerMenu)}>···</button><button aria-label="닫기" onClick={() => window.history.back()}>×</button></span>{headerMenu && <div className="danji-header-popover">토스 앱 공통 메뉴<br />브라우저 미리보기에서는 연결되지 않습니다.<button onClick={() => setHeaderMenu(false)}>닫기</button></div>}
    </header>
    <nav className="danji-tabs" aria-label="기록 보기 방식">
      <button className={view !== 'all' ? 'active' : ''} onClick={() => { setView('jar'); setSheet('none'); }}>단지</button>
      <button className={view === 'all' ? 'active' : ''} onClick={() => { setView('all'); setSheet('none'); }}>전체</button>
    </nav>

    {(view === 'jar' || view === 'decorate') && <section className="danji-scene" aria-label="가을 단지" onTouchStart={e => { e.currentTarget.dataset.x = String(e.touches[0].clientX); }} onTouchEnd={e => { const delta = e.changedTouches[0].clientX - Number(e.currentTarget.dataset.x); if (view === 'jar' && Math.abs(delta) > 45) setPage(Math.max(0, Math.min(pageCount - 1, page + (delta < 0 ? 1 : -1)))); }}>
      <img className="danji-art ground" src={ground} alt="" /><img className="danji-art shadow-a" src={shadowA} alt="" />
      <img className="danji-art shadow-b" src={shadowB} alt="" /><img className="danji-art leaf-top" src={leavesTop} alt="" />
      <img className="danji-art leaf-right" src={leafRight} alt="" /><img className="danji-art leaf-left" src={leafLeft} alt="" />
      <div className="danji-jar" aria-hidden="true">
        <img className="jar-back" src={jarBack} alt="" /><img className="jar-inner" src={jarInner} alt="" />
        <img className="jar-glow" src={jarGlow} alt="" /><img className="jar-lid-base" src={jarLidBase} alt="" />
        <img className="jar-lid-top" src={jarLidTop} alt="" />
      </div>
      <div className="danji-decoration-dots" aria-hidden="true">{Array.from({ length: 6 }, (_, index) => <span key={index} />)}</div>
      {previewRecords.slice(page * 5, page * 5 + 5).map((record: typeof initialRecords[number], index: number) => <button key={record.id} className={`danji-polaroid position-${index}`} onClick={() => view === 'jar' && openDetail(record.id)} aria-label={`${record.date} 기록 상세보기`}>
        <img src={record.image} alt="가을 기록 예시" /><time>{record.date}</time>
      </button>)}
      <div className="danji-stickers">{stickers.map(item => <button key={item.id} style={{ left: `${item.x}%`, top: `${item.y}%` }} onClick={() => view === 'decorate' && setStickers(items => items.filter(sticker => sticker.id !== item.id))}>{item.icon}</button>)}{view === 'decorate' && <div className="sticker-target" onClick={e => { const rect = e.currentTarget.getBoundingClientRect(); setStickers(items => [...items, { id: Date.now(), icon: stickerIcon, x: (e.clientX - rect.left) / rect.width * 100, y: (e.clientY - rect.top) / rect.height * 100 }]); }} />}</div>
      {view === 'jar' ? <><div className="danji-dots">{Array.from({ length: pageCount }, (_, index) => <button key={index} aria-label={`${index + 1}번째 단지`} className={page === index ? 'active' : ''} onClick={() => setPage(index)} />)}</div><div className="danji-actions"><button className="danji-settings-button" aria-label="단지 편집 메뉴" onClick={() => setSheet('options')}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18"/><circle cx="9" cy="6" r="2"/><circle cx="15" cy="12" r="2"/><circle cx="8" cy="18" r="2"/></svg></button><button className="primary" onClick={createRecord}><span className="danji-pencil" aria-hidden="true">✎</span> 기록하기</button></div></> : <div className="decorate-controls"><p>단지를 눌러 스티커를 붙이세요. 스티커를 누르면 제거됩니다.</p>{['🍁', '✨', '🌰', '🍂'].map(icon => <button key={icon} className={stickerIcon === icon ? 'active' : ''} onClick={() => setStickerIcon(icon)}>{icon}</button>)}<button className="done" onClick={() => setView('jar')}>꾸미기 완료</button></div>}
    </section>}

    {view === 'all' && <section className="danji-gallery" aria-label="전체 기록 예시">
      {previewRecords.map((record: typeof initialRecords[number]) => <button key={record.id} className="danji-mini-card" onClick={() => openDetail(record.id)}>
        <img src={record.image} alt="가을 기록 예시" /><time>{record.date}</time>
      </button>)}
    </section>}

    {view === 'detail' && selected !== null && <section className="danji-detail">
      <article className="danji-large-card"><span className="danji-badge">{selected + 1}/{previewRecords.length}</span>
        <img src={previewRecords[selected].image} alt="가을 기록 예시" /><time>{previewRecords[selected].date}</time>{previewRecords[selected].note && <p>{previewRecords[selected].note}</p>}
      </article>
      <div className="danji-actions"><button onClick={() => setView('jar')}>뒤로</button><button className="primary" onClick={() => editRecord(selected)}>기록 수정하기</button></div>
    </section>}
    {view === 'all' && <div className="danji-actions gallery-actions"><button aria-label="단지 편집 메뉴" onClick={() => setSheet('options')}>☷</button><button className="primary" onClick={createRecord}>✎ &nbsp; 기록하기</button></div>}

    {view === 'editor' && <section className="danji-editor"><h1>{selected === null ? '기록하기' : '기록 수정하기'}</h1><label>날짜<input type="date" value={draftDate} onChange={e => setDraftDate(e.target.value)} /></label><label className="photo-upload">사진 {selected === null ? '선택' : '변경'}<input type="file" accept="image/*" onChange={e => { const file = e.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onload = () => setDraftImage(String(reader.result)); reader.readAsDataURL(file); } }} /></label>{draftImage && <img className="editor-image" src={draftImage} alt="선택한 사진" />}<textarea value={draftNote} onChange={e => setDraftNote(e.target.value)} placeholder="기록을 입력하세요" /><div className="danji-actions"><button onClick={() => setView(selected === null ? 'jar' : 'detail')}>취소</button><button className="primary" disabled={!draftImage || !draftDate} onClick={saveRecord}>저장하기</button></div></section>}

    {sheet !== 'none' && <div className="danji-sheet-backdrop" onClick={() => setSheet('none')}>
      {sheet === 'options' ? <div className="danji-sheet danji-option-sheet" onClick={(event) => event.stopPropagation()}>
        <button className="danji-sheet-handle" aria-label="닫기" onClick={() => setSheet('none')} />
        <button className="danji-sheet-primary" onClick={() => { setSelected(null); setSheet('select'); }}>기록 수정하기</button>
        <button className="danji-sheet-secondary" onClick={() => { setSheet('none'); setView('decorate'); }}>단지 꾸미기</button>
      </div> : <div className="danji-sheet danji-select-sheet" onClick={(event) => event.stopPropagation()}>
        <button className="danji-sheet-handle" aria-label="닫기" onClick={() => setSheet('none')} />
        <strong>수정할 기록을 선택해주세요.</strong>
        <div className="danji-sheet-photos">{previewRecords.map((record: typeof initialRecords[number]) => <button key={record.id} className={selected === record.id ? 'selected' : ''} onClick={() => setSelected(record.id)}><img src={record.image} alt={`${record.date} 기록 선택`} /></button>)}</div>
        <button className="danji-sheet-primary" disabled={selected === null} onClick={() => selected !== null && editRecord(selected)}>기록 수정하기</button>
      </div>}
    </div>}
    {import.meta.env.DEV && <div className="danji-device-indicator" aria-hidden="true" />}
  </div>;
}
