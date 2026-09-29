import { useEffect, useState } from 'react';
import './Danji.css';
import './DanjiFix.css';
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
import sticker1 from '../assets/danji/stickers/1.png';
import sticker2 from '../assets/danji/stickers/2.png';
import sticker3 from '../assets/danji/stickers/3.png';
import sticker4 from '../assets/danji/stickers/4.png';
import sticker5 from '../assets/danji/stickers/5.png';
import sticker6 from '../assets/danji/stickers/6.png';
import sticker7 from '../assets/danji/stickers/7.png';

const stickerOptions = [
  { image: sticker1, label: '클로버' }, { image: sticker2, label: '비눗방울' },
  { image: sticker3, label: '별똥별' }, { image: sticker4, label: '파란 꽃' },
  { image: sticker5, label: '불꽃' }, { image: sticker6, label: '카메라' },
  { image: sticker7, label: '분홍 꽃' },
];

const initialRecords = [sample1, sample4, sample3, sample5, sample2, sample3, sample1, sample4, sample5, sample2].map((image, id) => ({ id, image, date: '2026/09/23', note: '' }));
type RecordItem = typeof initialRecords[number];
type View = 'jar' | 'all' | 'detail' | 'editor' | 'decorate';
type Sheet = 'none' | 'options' | 'select';

export default function Danji() {
  const [previewRecords, setPreviewRecords] = useState<RecordItem[]>(() => {
    try { return JSON.parse(localStorage.getItem('danji-preview-records') || 'null') || initialRecords; }
    catch { return initialRecords; }
  });
  const [page, setPage] = useState(0);
  const [draftDate, setDraftDate] = useState('2026-09-23');
  const [draftNote, setDraftNote] = useState('');
  const [draftImage, setDraftImage] = useState<string | null>(null);
  const [editBack, setEditBack] = useState(false);
  const [detailBack, setDetailBack] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [deleteIds, setDeleteIds] = useState<number[]>([]);
  const [toast, setToast] = useState('');
  const [saveDone, setSaveDone] = useState(false);
  const [stickers, setStickers] = useState<{ id: number; option: number; x: number; y: number }[]>(() => {
    try { return JSON.parse(localStorage.getItem('danji-preview-stickers-v3') || '[]'); }
    catch { return []; }
  });
  const [stickerOption, setStickerOption] = useState(0);
  const [headerMenu, setHeaderMenu] = useState(false);
  const [view, setView] = useState<View>('jar');
  const [sheet, setSheet] = useState<Sheet>('none');
  const [selected, setSelected] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const pageCount = Math.max(1, Math.ceil(previewRecords.length / 5));
  const selectedRecord = previewRecords.find(item => item.id === selected);

  useEffect(() => { localStorage.setItem('danji-preview-records', JSON.stringify(previewRecords)); }, [previewRecords]);
  useEffect(() => { localStorage.setItem('danji-preview-stickers-v3', JSON.stringify(stickers)); }, [stickers]);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function editRecord(id: number) {
    const record = previewRecords.find(item => item.id === id);
    if (!record) return;
    setSelected(id);
    setDraftDate(record.date.replaceAll('/', '-'));
    setDraftNote(record.note);
    setDraftImage(record.image);
    setEditBack(false);
    setDetailBack(false);
    setSheet('none');
    setView('editor');
  }

  function saveRecord() {
    if (!draftDate || !draftImage) return;
    if (selected === null) {
      const id = Math.max(-1, ...previewRecords.map(item => item.id)) + 1;
      setPreviewRecords(items => [...items, { id, date: draftDate.replaceAll('-', '/'), note: draftNote, image: draftImage }]);
      setSelected(id);
    } else {
      setPreviewRecords(items => items.map(item => item.id === selected ? { ...item, date: draftDate.replaceAll('-', '/'), note: draftNote, image: draftImage } : item));
    }
    setSaveDone(true);
  }

  function createRecord() {
    setSelected(null);
    setDraftDate(new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10));
    setDraftNote('');
    setDraftImage(null);
    setEditBack(false);
    setSheet('none');
    setView('editor');
  }

  function deleteRecord() {
    if (selected === null) return;
    setPreviewRecords(items => items.filter(item => item.id !== selected));
    setSelected(null);
    setConfirmDelete(false);
    setView('all');
    setPage(0);
    setToast('기록이 삭제되었어요!');
  }

  function deleteSelectedRecords() {
    if (deleteIds.length === 0) return;
    setPreviewRecords(items => items.filter(item => !deleteIds.includes(item.id)));
    setDeleteIds([]);
    setDeleteMode(false);
    setToast('기록이 삭제되었어요!');
  }

  function openDetail(id: number) {
    if (deleteMode) {
      setDeleteIds(ids => ids.includes(id) ? ids.filter(item => item !== id) : [...ids, id]);
      return;
    }
    setSelected(id);
    setDetailBack(false);
    setView('detail');
    setSheet('none');
  }

  return <div className="danji-page">
    {import.meta.env.DEV && <div className="danji-device-status" aria-hidden="true"><span>9:41</span><i /><span>▂▅ ▰</span></div>}
    <header className="danji-header">
      <button aria-label="뒤로" onClick={() => view === 'editor' ? setView(selectedRecord ? 'detail' : 'jar') : view === 'detail' || view === 'decorate' ? setView('jar') : window.history.back()}>‹</button>
      <span className="danji-app-icon">⌂</span><strong>사계단지</strong><span className="danji-header-spacer" />
      <button aria-label="좋아요" title="좋아요">♥</button><span className="header-pair"><button aria-label="더보기" onClick={() => setHeaderMenu(!headerMenu)}>···</button><button aria-label="닫기" onClick={() => window.history.back()}>×</button></span>
      {headerMenu && <div className="danji-header-popover">토스 앱 공통 메뉴<br />브라우저 미리보기에서는 연결되지 않습니다.<button onClick={() => setHeaderMenu(false)}>닫기</button></div>}
    </header>
    <nav className="danji-tabs" aria-label="기록 보기 방식">
      <button className={view !== 'all' ? 'active' : ''} onClick={() => { setView('jar'); setDeleteMode(false); setSheet('none'); }}>단지</button>
      <button className={view === 'all' ? 'active' : ''} onClick={() => { setView('all'); setDeleteMode(false); setSheet('none'); }}>전체</button>
    </nav>

    {toast && <div className="danji-toast"><span>✓</span>{toast}</div>}

    {(view === 'jar' || view === 'decorate') && <section className="danji-scene" aria-label="가을 단지" onTouchStart={e => { e.currentTarget.dataset.x = String(e.touches[0].clientX); }} onTouchEnd={e => { const delta = e.changedTouches[0].clientX - Number(e.currentTarget.dataset.x); if (view === 'jar' && Math.abs(delta) > 45) setPage(Math.max(0, Math.min(pageCount - 1, page + (delta < 0 ? 1 : -1)))); }}>
      <img className="danji-art ground" src={ground} alt="" /><img className="danji-art shadow-a" src={shadowA} alt="" /><img className="danji-art shadow-b" src={shadowB} alt="" />
      <div className="danji-jar" aria-hidden="true"><img className="jar-back" src={jarBack} alt="" /><img className="jar-inner" src={jarInner} alt="" /><img className="jar-glow" src={jarGlow} alt="" /><img className="jar-lid-base" src={jarLidBase} alt="" /><img className="jar-lid-top" src={jarLidTop} alt="" /></div>
      <img className="danji-art leaf-top" src={leavesTop} alt="" /><img className="danji-art leaf-right" src={leafRight} alt="" /><img className="danji-art leaf-left" src={leafLeft} alt="" />
      {previewRecords.length === 0 && <p className="danji-jar-empty">아직 담긴 기록이 없어요.<br />첫 계절을 기록해보세요.</p>}
      {previewRecords.slice(page * 5, page * 5 + 5).map((record, index) => <button key={record.id} className={`danji-polaroid position-${index}`} onClick={() => view === 'jar' && openDetail(record.id)}><img src={record.image} alt="가을 기록" /><time>{record.date}</time></button>)}
      <div className="danji-stickers">{stickers.map(item => <button key={item.id} style={{ left: `${item.x}%`, top: `${item.y}%` }} aria-label={`${stickerOptions[item.option]?.label ?? '스티커'}${view === 'decorate' ? ' 제거' : ''}`} onClick={() => view === 'decorate' && setStickers(items => items.filter(sticker => sticker.id !== item.id))}><img src={stickerOptions[item.option]?.image} alt="" /></button>)}{view === 'decorate' && <div className="sticker-target" onClick={e => { const rect = e.currentTarget.getBoundingClientRect(); setStickers(items => [...items, { id: Date.now(), option: stickerOption, x: (e.clientX - rect.left) / rect.width * 100, y: (e.clientY - rect.top) / rect.height * 100 }]); }} />}</div>
      {view === 'jar' ? <><div className="danji-dots">{Array.from({ length: pageCount }, (_, index) => <button key={index} className={page === index ? 'active' : ''} onClick={() => setPage(index)} />)}</div><div className="danji-actions"><button className="danji-settings-button" aria-label="단지 편집 메뉴" onClick={() => setSheet('options')}>☷</button><button className="primary" onClick={createRecord}>✎ &nbsp; 기록하기</button></div></> : <div className="decorate-controls"><p>단지를 눌러 스티커를 붙이세요.</p><div className="sticker-palette">{stickerOptions.map((option, index) => <button key={option.label} aria-label={`${option.label} 선택`} className={stickerOption === index ? 'active' : ''} onClick={() => setStickerOption(index)}><img src={option.image} alt="" /></button>)}</div><button className="done" onClick={() => setView('jar')}>꾸미기 완료</button></div>}
    </section>}

    {view === 'all' && <section className="danji-gallery" aria-label="전체 기록">
      {previewRecords.length === 0 && <p className="danji-empty">아직 담긴 기록이 없어요.<br />첫 계절을 기록해보세요.</p>}
      {previewRecords.map(record => <button key={record.id} className={`danji-mini-card ${deleteMode ? 'delete-mode' : ''} ${deleteIds.includes(record.id) ? 'delete-selected' : ''}`} onClick={() => openDetail(record.id)}>
        {deleteMode && <span className="danji-delete-check">✓</span>}<img src={record.image} alt="가을 기록" /><time>{record.date}</time>
      </button>)}
    </section>}
    {view === 'all' && !deleteMode && <div className="danji-actions gallery-actions"><button aria-label="기록 삭제" onClick={() => { setDeleteMode(true); setDeleteIds([]); }}>♜</button><button className="primary" onClick={createRecord}>✎ &nbsp; 기록하기</button></div>}
    {view === 'all' && deleteMode && <div className="danji-delete-toolbar"><button className="cancel" onClick={() => { setDeleteMode(false); setDeleteIds([]); }}>취소</button><button className="delete" disabled={deleteIds.length === 0} onClick={deleteSelectedRecords}>삭제하기</button></div>}

    {view === 'detail' && selectedRecord && <section className="danji-detail">
      <button className="danji-large-card" onClick={() => setDetailBack(value => !value)} aria-label={detailBack ? '카드 앞면 보기' : '카드 뒷면 보기'}>
        {detailBack ? <div className="danji-card-back">{selectedRecord.note || '오늘의 계절을 기록해보세요.'}</div> : <img src={selectedRecord.image} alt="가을 기록" />}
        <time>{selectedRecord.date}</time>
      </button>
      <div className="danji-detail-controls"><button onClick={() => setView('jar')}>뒤로</button><button onClick={() => editRecord(selectedRecord.id)}>수정하기</button></div>
    </section>}

    {view === 'editor' && <section className="danji-editor" aria-label={selected === null ? '기록하기' : '기록 수정하기'}>
      {selected !== null && <div className="danji-edit-status">수정중</div>}
      <p className="danji-edit-help">카드를 눌러 뒷면을 확인해보세요.</p>
      <div className="danji-edit-card">
        {!editBack ? <div className="danji-edit-photo" onClick={() => setEditBack(true)} role="button" tabIndex={0} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setEditBack(true); } }} aria-label="카드 뒷면 보기">
          {draftImage ? <img src={draftImage} alt="선택한 기록 사진" /> : <span>사진을 선택해주세요</span>}
          <label className="danji-edit-photo-action" onClick={e => e.stopPropagation()} aria-label="사진 변경">사진 변경<input type="file" accept="image/*" onChange={e => { const file = e.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onload = () => setDraftImage(String(reader.result)); reader.readAsDataURL(file); } }} /></label>
        </div> : <div className="danji-edit-back"><button type="button" className="danji-flip-front" onClick={() => setEditBack(false)}>사진 보기</button><textarea maxLength={500} value={draftNote} onChange={e => setDraftNote(e.target.value)} placeholder="오늘의 계절을 기록해보세요." aria-label="기록 내용" /></div>}
        <label className="danji-edit-date">날짜 <input type="date" value={draftDate} onChange={e => setDraftDate(e.target.value)} /></label>
        <small>{draftNote.length}/500</small>
      </div>
      <button className="danji-edit-cancel" onClick={() => setView(selectedRecord ? 'detail' : 'jar')}>취소</button>
      <div className="danji-actions edit-actions"><button className="primary" disabled={!draftImage || !draftDate} onClick={saveRecord}>{selected === null ? '작성 완료' : '저장하기'}</button></div>
    </section>}

    {confirmDelete && <div className="danji-confirm-backdrop" onClick={() => setConfirmDelete(false)}><div className="danji-confirm" role="alertdialog" onClick={e => e.stopPropagation()}><strong>이 기록을 삭제할까요?</strong><p>삭제한 기록은 다시 복구할 수 없어요.</p><div><button onClick={() => setConfirmDelete(false)}>취소</button><button className="danger" onClick={deleteRecord}>삭제</button></div></div></div>}

    {sheet !== 'none' && <div className="danji-sheet-backdrop" onClick={() => setSheet('none')}>
      {sheet === 'options' ? <div className="danji-sheet danji-option-sheet" onClick={e => e.stopPropagation()}><button className="danji-sheet-handle" aria-label="닫기" onClick={() => setSheet('none')} /><button className="danji-sheet-primary" onClick={() => { setSelected(null); setSheet('select'); }}>기록 수정하기</button><button className="danji-sheet-secondary" onClick={() => { setSheet('none'); setView('decorate'); }}>단지 꾸미기</button></div> : <div className="danji-sheet danji-select-sheet" onClick={e => e.stopPropagation()}><button className="danji-sheet-handle" aria-label="닫기" onClick={() => setSheet('none')} /><strong>수정할 기록을 선택해주세요.</strong><div className="danji-sheet-photos">{previewRecords.map(record => <button key={record.id} className={selected === record.id ? 'selected' : ''} onClick={() => setSelected(record.id)}><img src={record.image} alt={`${record.date} 기록 선택`} /></button>)}</div><button className="danji-sheet-primary" disabled={selected === null} onClick={() => selected !== null && editRecord(selected)}>기록 수정하기</button></div>}
    </div>}

    {saveDone && <div className="danji-save-backdrop"><div className="danji-save-modal"><strong>저장했어요!</strong><p>단지에서 수정한 나의 기록을 확인해보세요.</p><div className="danji-save-jar">🏺</div><button className="go-jar" onClick={() => { setSaveDone(false); setView('jar'); }}>단지 보러 가기</button><button className="go-home" onClick={() => { setSaveDone(false); window.history.back(); }}>홈으로 이동</button></div></div>}
    {import.meta.env.DEV && <div className="danji-device-indicator" aria-hidden="true" />}
  </div>;
}
