import { useEffect, useMemo, useState } from 'react';
import './Danji.css';
import DanjiCalendar from './DanjiCalendar';
import jarArt from '../assets/danji/current/jar.png';
import branchArt from '../assets/danji/current/branch.png';
import floatingLeaf from '../assets/danji/current/floating-leaf.png';
import stickerSaveIllustration from '../assets/danji/current/sticker-save-illustration.png';
import saveIllustration from '../assets/danji/current/save-illustration.png';
import deleteSelectedCheck from '../assets/danji/current/delete-selected.png';
import deleteUnselectedCheck from '../assets/danji/current/delete-unselected.png';
import emptyLines from '../assets/danji/current/empty-lines.png';
import loadingRing from '../assets/danji/current/loading-ring.png';
import trashIcon from '../assets/danji/current/trash.png';
import figmaPhoto1 from '../assets/danji/figma/photo-1.jpg';
import figmaPhoto2 from '../assets/danji/figma/photo-2.jpg';
import figmaPhoto3 from '../assets/danji/figma/photo-3.jpg';
import figmaPhoto4 from '../assets/danji/figma/photo-4.jpg';
import figmaPhoto5 from '../assets/danji/figma/photo-5.jpg';
import navClose from '../assets/danji/figma/nav-close.png';




import navBack from '../assets/danji/figma/nav-back.png';
import navLogo from '../assets/danji/figma/nav-logo.png';
import navHome from '../assets/danji/figma/nav-home.png';
import navDots from '../assets/danji/figma/nav-dots.png';
import statusTime from '../assets/danji/figma/status-time.png';
import statusRight from '../assets/danji/figma/status-right.png';
import buttonSparkle from '../assets/danji/figma/button-sparkle.png';
import buttonPencil from '../assets/danji/figma/button-pencil.png';

// Design fixtures only. Real records and API integration belong to separate tasks.

import decor0 from '../assets/danji/current/sticker-0.png';
import decor1 from '../assets/danji/current/sticker-1.png';
import decor2 from '../assets/danji/current/sticker-2.png';
import decor3 from '../assets/danji/current/sticker-3.png';
import decor4 from '../assets/danji/current/sticker-4.png';
import decor5 from '../assets/danji/current/sticker-5.png';
import decor6 from '../assets/danji/current/sticker-6.png';
const stickerOptions = [decor0, decor1, decor2, decor3, decor4, decor5, decor6];
const stickerNames = ['클로버', '물방울', '별', '노란 불꽃', '분홍 불꽃', '카메라', '꽃'];
type Sticker = {id: number; option: number; x: number; y: number; size: number; page: number};
const demoImages = [figmaPhoto1, figmaPhoto2, figmaPhoto4, figmaPhoto3, figmaPhoto5];
const demoNotes = ['단풍이 예쁜 길을 걸었어요.', '물가에서 책을 읽었어요.', '친구들과 가을 소풍을 다녀왔어요.', '높은 곳에서 가을 풍경을 봤어요.', '오늘의 계절을 사진에 담았어요.'];
const initialRecords = Array.from({ length: 15 }, (_, id) => ({
  id, image: demoImages[id % 5], date: `2026/09/${String(23 + Math.floor(id / 5)).padStart(2, '0')}`,
  note: demoNotes[id % 5],
}));
function sortRecordsByDate(records: typeof initialRecords): typeof initialRecords {
  return [...records].sort((a, b) => a.date.replaceAll('-', '/').localeCompare(b.date.replaceAll('-', '/')) || a.id - b.id);
}

type View = 'jar' | 'all' | 'detail' | 'editor' | 'editPreview' | 'decorate';
type Sheet = 'none' | 'options' | 'select';

function CalendarIcon() {
  return <svg className="danji-inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 3v4M17 3v4M3 10h18M7 14h2M15 14h2M7 18h2" /></svg>;
}
function PencilIcon() {
  return <svg className="danji-inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 4 5 5M4 20l5-1L20 8a2.1 2.1 0 0 0-4-4L5 15l-1 5Z" /><path d="m5 15 4 4" /></svg>;
}

export default function Danji() {
  const [previewRecords, setPreviewRecords] = useState<typeof initialRecords>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('danji-preview-records') || 'null');
      const valid = Array.isArray(saved) && saved.every((r) => r && Number.isInteger(r.id) && typeof r.image === 'string' && typeof r.date === 'string' && typeof r.note === 'string');
      if (!valid) return sortRecordsByDate(initialRecords);
      if (!localStorage.getItem('danji-demo-15-v1')) {
        const records = [...saved];
        let nextId = Math.max(-1, ...records.map((r) => r.id)) + 1;
        while (records.length < 15) {
          const fixture = initialRecords[records.length];
          records.push({...fixture, id: nextId++});
        }
        return sortRecordsByDate(records);
      }
      return sortRecordsByDate(saved);
    } catch { return sortRecordsByDate(initialRecords); }
  });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let mounted = true;
    Promise.all(demoImages.map((src) => new Promise<void>((resolve) => {
      const image = new Image(); image.onload = () => resolve(); image.onerror = () => resolve(); image.src = src;
    }))).then(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);
  const [page, setPage] = useState(0);
  const [draftDate, setDraftDate] = useState('2026-09-23');
  const [draftNote, setDraftNote] = useState('');
  const [draftImage, setDraftImage] = useState<string | null>(null);
  const [stickers, setStickers] = useState<Sticker[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('danji-preview-stickers') || '[]');
      return Array.isArray(saved) ? saved.filter((item) => Number.isInteger(item.option) && item.option >= 0 && item.option < 7).map((item) => ({...item, size: item.size ?? 24.533, page: item.page ?? 0})) : [];
    } catch { return []; }
  });
  const [draftStickers, setDraftStickers] = useState<Sticker[]>([]);
  const [activeSticker, setActiveSticker] = useState<number | null>(null);
  const [stickerPanelExpanded, setStickerPanelExpanded] = useState(true);
  function beginDecoration() {
    setDraftStickers(stickers.map((item) => ({...item})));
    setActiveSticker(null);
    setStickerPanelExpanded(true);
    setView('decorate');
  }
  function cancelDecoration() { requestLeave('jar'); }
  const [headerMenu, setHeaderMenu] = useState(false);
  const [view, setView] = useState<View>('jar');
  const [sheet, setSheet] = useState<Sheet>('none');
  const [selected, setSelected] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteIds, setDeleteIds] = useState<number[]>([]);
  const [showNote, setShowNote] = useState(false);
  const [editingText, setEditingText] = useState(false);
  const [noteLimitReached, setNoteLimitReached] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [saveError, setSaveError] = useState<'record' | 'edit' | 'sticker' | 'delete' | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [stickerSaved, setStickerSaved] = useState(false);
  const [leaveTarget, setLeaveTarget] = useState<'jar' | 'detail' | 'home' | 'close' | null>(null);
  function requestLeave(target: 'jar' | 'detail' | 'home' | 'close') {
    if (view === 'editPreview' || view === 'editor' || view === 'decorate') setLeaveTarget(target);
    else finishLeave(target);
  }
  function finishLeave(target: 'jar' | 'detail' | 'home' | 'close') {
    setLeaveTarget(null);
    setSaveError(null);
    setCalendarOpen(false);
    setEditingText(false);
    setShowNote(false);
    setActiveSticker(null);
    setDraftStickers([]);
    if (target === 'home' || target === 'close') window.location.assign('/home');
    else setView(target);
  }
  function saveDecoration() {
    try { localStorage.setItem('danji-preview-stickers', JSON.stringify(draftStickers)); }
    catch { setSaveError('sticker'); return; }
    setSaveError(null);
    setStickers(draftStickers);
    setView('jar');
    setActiveSticker(null);
    setStickerSaved(true);
  }
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  // Preview the new date order immediately; cancelling keeps the saved records intact.
  const displayRecords = useMemo(() => sortRecordsByDate(
    view === 'editPreview' && selected !== null
      ? previewRecords.map((record) => record.id === selected ? {...record, date: draftDate.replaceAll('-', '/')} : record)
      : previewRecords,
  ), [previewRecords, view, selected, draftDate]);
  const pageCount = Math.max(1, Math.ceil(displayRecords.length / 5));
  const selectedRecord = previewRecords.find((item: (typeof initialRecords)[number]) => item.id === selected);
  useEffect(() => {
    try {
      localStorage.setItem('danji-preview-records', JSON.stringify(previewRecords));
      localStorage.setItem('danji-demo-15-v1', '1');
    } catch {
      /* Saving reports errors in saveRecord. */
    }
  }, [previewRecords]);
  useEffect(() => {
    if (!deleteSuccess) return;
    const timer = window.setTimeout(() => setDeleteSuccess(false), 2800);
    return () => window.clearTimeout(timer);
  }, [deleteSuccess]);

  function editRecord(id: number) {
    const record = previewRecords.find((item: (typeof initialRecords)[number]) => item.id === id);
    if (!record) return;
    setSelected(id);
    setDraftDate(record.date.replaceAll('/', '-'));
    setDraftNote(record.note.slice(0, 100));
    setNoteLimitReached(false);
    setDraftImage(record.image);
    setShowNote(false);
    setEditingText(false);
    setSheet('none');
    setView('editPreview');
  }
  function saveRecord() {
    if (!draftDate || !draftImage || draftNote.length > 100) return;
    const id = selected ?? Math.max(-1, ...previewRecords.map((item: (typeof initialRecords)[number]) => item.id)) + 1;
    const next = sortRecordsByDate(
      selected === null
        ? [...previewRecords, { id, date: draftDate.replaceAll('-', '/'), note: draftNote, image: draftImage }]
        : previewRecords.map((item: (typeof initialRecords)[number]) =>
            item.id === selected ? { ...item, date: draftDate.replaceAll('-', '/'), note: draftNote } : item,
          ),
    );
    try {
      localStorage.setItem('danji-preview-records', JSON.stringify(next));
    } catch {
      setSaveError(selected === null ? 'record' : 'edit');
      return;
    }
    setSaveError(null);
    setPreviewRecords(next);
    setPage(Math.floor(next.findIndex((record) => record.id === id) / 5));
    setSelected(id);
    setCalendarOpen(false);
    setEditingText(false);
    setShowNote(false);
    setSaveSuccess(selected !== null);
    setView('detail');
  }
  function createRecord() {
    setSelected(null);
    const today = new Date();
    setDraftDate(`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`);
    setDraftNote('');
    setDraftImage(null);
    setSheet('none');
    setView('editor');
  }

  function openDetail(index: number) {
    setSelected(index);
    setShowNote(false);
    setView('detail');
    setSheet('none');
  }
  function deleteSelectedRecords() {
    if (!deleteIds.length) return;
    const next = previewRecords.filter((item) => !deleteIds.includes(item.id));
    try { localStorage.setItem('danji-preview-records', JSON.stringify(next)); }
    catch { setConfirmDelete(false); setSaveError('delete'); return; }
    setSaveError(null);
    setPreviewRecords(next);
    setDeleteIds([]);
    setDeleting(false);
    setConfirmDelete(false);
    setSelected(null);
    setPage(0);
    setDeleteSuccess(true);
  }

  return (
    <div className={`danji-page ${import.meta.env.DEV ? 'browser-preview' : 'inapp'} view-${view} ${editingText ? 'text-editing' : ''}`}>
      {(view === 'jar' || view === 'decorate') && (
        <div className="danji-jar-background" aria-hidden="true">
          <i className="jar-ground" />
          <i className="jar-shadow-a" />
          <i className="jar-shadow-b" />
          <i className="jar-blurred-left" />
          <i className="jar-blurred-right" />
        </div>
      )}
      {view === 'all' && (
        <div className="danji-gallery-background" aria-hidden="true">
          <i className="gallery-glow-a" />
          <i className="gallery-glow-b" />
          <i className="gallery-ground" />
        </div>
      )}
      {(view === 'detail' || view === 'editPreview') && <div className="danji-record-background" aria-hidden="true" />}
      {import.meta.env.DEV && (
        <div className="danji-device-status" aria-hidden="true">
          <img src={statusTime} alt="" />
          <i />
          <img src={statusRight} alt="" />
        </div>
      )}
      {import.meta.env.DEV && <header className="danji-header">
        <button
          aria-label="뒤로"
          onClick={() =>
            view === 'editPreview'
              ? requestLeave('detail')
              : view === 'editor'
                ? requestLeave(selectedRecord ? 'detail' : 'jar')
                : view === 'detail' || view === 'decorate'
                  ? requestLeave('jar')
                  : window.history.back()
          }
        >
          <img src={navBack} alt="" />
        </button>
        <button className="danji-title-pill" aria-label="홈으로 이동" onClick={() => requestLeave('home')}>
          <img className="danji-app-icon" src={navLogo} alt="" />
          <strong>사계단지</strong>
          <img className="danji-home-icon" src={navHome} alt="" />
        </button>
        <span className="danji-header-spacer" />
        <span className="header-pair">
          <button aria-label="더보기" onClick={() => setHeaderMenu(!headerMenu)}>
            <img src={navDots} alt="" />
          </button>
          <span className="danji-header-divider" />
          <button aria-label="앱 닫기" onClick={() => requestLeave('close')}><img src={navClose} alt="" /></button>
        </span>
        {headerMenu && (
          <div className="danji-header-popover">
            토스 앱 공통 메뉴
            <br />
            브라우저 미리보기에서는 연결되지 않습니다.<button onClick={() => setHeaderMenu(false)}>닫기</button>
          </div>
        )}
      </header>}
      {!deleting && view !== 'editPreview' && view !== 'decorate' && (
        <nav className="danji-tabs" aria-label="기록 보기 방식">
          <button
            className={view !== 'all' ? 'active' : ''}
            onClick={() => {
              setView('jar');
              setSheet('none');
            }}
          >
            단지
          </button>
          <button
            className={view === 'all' ? 'active' : ''}
            onClick={() => {
              setView('all');
              setSheet('none');
            }}
          >
            전체
          </button>
        </nav>
      )}

      {(view === 'jar' || view === 'decorate') && (
        <section
          className={`danji-scene record-count-${Math.min(5, Math.max(0, previewRecords.length - page * 5))}`}
          aria-label="가을 단지"
          onTouchStart={(e) => {
            e.currentTarget.dataset.x = String(e.touches[0].clientX);
          }}
          onTouchEnd={(e) => {
            const delta = e.changedTouches[0].clientX - Number(e.currentTarget.dataset.x);
            if (view === 'jar' && Math.abs(delta) > 45) setPage(Math.max(0, Math.min(pageCount - 1, page + (delta < 0 ? 1 : -1))));
          }}
        >
          <img className="danji-art leaf-top" src={branchArt} alt="" />
          <img className="danji-art leaf-right" src={floatingLeaf} alt="" />
          <img className="danji-jar" src={jarArt} alt="" />
          {previewRecords.length === 0 && (
            <p className="danji-jar-empty">
              <strong>아직 담긴 기록이 없어요!</strong>
              <span>사계단지에<br />첫 기록을 담아보세요.</span>
            </p>
          )}
          {previewRecords.length === 0 && <img className="danji-empty-lines" src={emptyLines} alt="" />}
          {displayRecords.slice(page * 5, page * 5 + 5).map((record: (typeof initialRecords)[number], index: number) => (
            <button
              key={record.id}
              className={`danji-polaroid position-${index}`}
              onClick={() => view === 'jar' && openDetail(record.id)}
              aria-label={`${record.date} 기록 상세보기`}
            >
              <img src={record.image} alt="가을 기록 예시" />
              <time>{record.date}</time>
            </button>
          ))}
          <div className="danji-stickers">
            {(view === 'decorate' ? draftStickers : stickers).filter((item) => item.page === page).map((item) => (
              <div key={item.id} className={`danji-placed-sticker ${view === 'decorate' ? 'editable' : ''} ${activeSticker === item.id ? 'selected' : ''}`}
                style={{ left: `${item.x}%`, top: `${item.y}%`, width: `${item.size}%` }}>
                <button className="danji-sticker-drag" aria-label={`${stickerNames[item.option]} 스티커 이동`}
                  disabled={view !== 'decorate'}
                  onPointerDown={(event) => {if (view !== 'decorate') return; setActiveSticker(item.id); event.currentTarget.setPointerCapture(event.pointerId);}}
                  onPointerMove={(event) => {
                    if (view !== 'decorate' || !event.currentTarget.hasPointerCapture(event.pointerId)) return;
                    const rect = event.currentTarget.closest('.danji-scene')!.getBoundingClientRect();
                    setDraftStickers((items) => items.map((sticker) => sticker.id === item.id ? {...sticker,
                      x: Math.max(0, Math.min(100 - sticker.size, sticker.x + event.movementX / rect.width * 100)),
                      y: Math.max(0, Math.min(100 - sticker.size * rect.width / rect.height, sticker.y + event.movementY / rect.height * 100))} : sticker));
                  }}
                  onPointerUp={(event) => {if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);}}>
                  <img src={stickerOptions[item.option]} alt={stickerNames[item.option]} draggable={false} />
                </button>
                {view === 'decorate' && <>
                  <button className="danji-sticker-remove" aria-label="스티커 삭제" onClick={() => {setDraftStickers((items) => items.filter((sticker) => sticker.id !== item.id)); setActiveSticker(null);}}>×</button>
                  <button className="danji-sticker-resize" aria-label="스티커 크기 조절"
                    onPointerDown={(event) => {setActiveSticker(item.id);event.currentTarget.setPointerCapture(event.pointerId);}}
                    onPointerMove={(event) => {if (view !== 'decorate' || !event.currentTarget.hasPointerCapture(event.pointerId)) return;
                      const width = event.currentTarget.closest('.danji-scene')!.getBoundingClientRect().width;
                      setDraftStickers((items) => items.map((sticker) => sticker.id === item.id ? {...sticker, size: Math.max(10, Math.min(40, sticker.size - event.movementX / width * 100))} : sticker));}}
                    onPointerUp={(event) => {if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);}}>↗</button>
                </>}
              </div>
            ))}
          </div>
          {view === 'jar' ? (
            <>
              <div className="danji-dots">
                {Array.from({ length: pageCount }, (_, index) => (
                  <button
                    key={index}
                    aria-label={`${index + 1}번째 단지`}
                    className={page === index ? 'active' : ''}
                    onClick={() => setPage(index)}
                  />
                ))}
              </div>
              <div className="danji-actions">
                <button className="danji-settings-button" aria-label="단지 꾸미기" onClick={beginDecoration}>
                  <img src={buttonSparkle} alt="" />
                </button>
                <button className="primary" aria-label="기록하기" onClick={createRecord}>
                  <img src={buttonPencil} alt="" />
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="danji-decoration-badge">수정중</div>
              <section className={`danji-decoration-sheet ${stickerPanelExpanded ? 'expanded' : 'collapsed'}`} aria-label="단지 꾸미기">
                <button className="danji-decoration-handle" aria-label={stickerPanelExpanded ? '스티커 패널 접기' : '스티커 패널 펼치기'} aria-expanded={stickerPanelExpanded} onClick={() => setStickerPanelExpanded(!stickerPanelExpanded)} />
                <h2>나의 스티커</h2>
                <div className="danji-decoration-grid">
                  {stickerOptions.map((src, option) => <button key={src} aria-label={`${stickerNames[option]} 스티커 추가`} onClick={() => {
                    const id = Date.now();
                    setDraftStickers((items) => [...items, {id, option, x: 38, y: 33, size: 24.533, page}]);
                    setActiveSticker(id); setStickerPanelExpanded(false);
                  }}><img src={src} alt="" /></button>)}
                </div>
                <div className="danji-decoration-actions">
                  <button onClick={cancelDecoration}>취소</button>
                  <button onClick={saveDecoration}>저장하기</button>
                </div>
              </section>
            </>

          )}
        </section>
      )}

      {view === 'all' && (
        <section className={`danji-gallery ${deleting ? 'deleting' : ''}`} aria-label={deleting ? '삭제할 기록 선택' : '전체 기록 예시'}>
          {deleting && (
            <div className="danji-delete-heading">
              <strong>기록 삭제</strong>
              <small>삭제할 기록을 선택해주세요.</small>
            </div>
          )}
          {previewRecords.length === 0 && (
            <p className="danji-empty">
              <strong>아직 담긴 기록이 없어요!</strong>
              <span>사계단지에<br />첫 기록을 담아보세요.</span>
            </p>
          )}
          {displayRecords.map((record: (typeof initialRecords)[number]) => (
            <button
              key={record.id}
              className={`danji-mini-card ${deleting && deleteIds.includes(record.id) ? 'selected' : ''}`}
              aria-pressed={deleting ? deleteIds.includes(record.id) : undefined}
              onClick={() =>
                deleting
                  ? setDeleteIds((ids) => (ids.includes(record.id) ? ids.filter((id) => id !== record.id) : [...ids, record.id]))
                  : openDetail(record.id)
              }
            >
              <img src={record.image} alt="가을 기록 예시" />
              <time>{record.date}</time>
              {deleting && (
                <span className="danji-delete-check" aria-hidden="true">
                  <img src={deleteIds.includes(record.id) ? deleteSelectedCheck : deleteUnselectedCheck} alt="" />
                </span>
              )}
            </button>
          ))}
        </section>
      )}
      {view === 'all' && deleteSuccess && (
        <div className="danji-success-toast" role="status">
          <span aria-hidden="true">✓</span>기록이 삭제되었어요!
        </div>
      )}
      {(saveSuccess || stickerSaved) && (
        <div className="danji-modal-backdrop" onClick={() => { setSaveSuccess(false); setStickerSaved(false); }}>
          <div
            className={`danji-saved-sheet ${stickerSaved ? 'sticker-saved' : ''}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="danji-saved-title"
            onClick={(event) => event.stopPropagation()}
          >
            <span className="danji-saved-handle" />
            <strong id="danji-saved-title">{stickerSaved ? '스티커를 저장했어요!' : '저장했어요!'}</strong>
            <p>{stickerSaved ? '단지에 새로운 스티커가 추가됐어요.' : '단지에서 수정된 나의 기록을 확인해보세요.'}</p>
            <img src={stickerSaved ? stickerSaveIllustration : saveIllustration} alt="" />
            <div>
              <button
                autoFocus
                onClick={() => {
                  setSaveSuccess(false);
                  setStickerSaved(false);
                  setView('jar');
                }}
              >
                단지 보러 가기
              </button>
              <button
                onClick={() => {
                  setSaveSuccess(false);
                  setStickerSaved(false);
                  window.location.assign('/home');
                }}
              >
                홈으로 이동
              </button>
            </div>
          </div>
        </div>
      )}

      {view === 'detail' && selectedRecord && (
        <section className="danji-detail">
          <p className="danji-detail-hint">카드를 눌러 뒷면을 확인해보세요.</p>
          <button
            className="danji-large-card"
            onClick={() => setShowNote((value) => !value)}
            aria-label={showNote ? '사진 보기' : '기록 글 보기'}
          >
            {showNote ? (
              <div className="danji-card-note">{selectedRecord.note || '아직 작성한 글이 없어요.'}</div>
            ) : (
              <>
                <img src={selectedRecord.image} alt="가을 기록" />
                <time>{selectedRecord.date}</time>
              </>
            )}
          </button>
          <div className="danji-detail-controls">
            <button
              onClick={() => {
                setView('jar');
                setShowNote(false);
              }}
            >
              뒤로
            </button>
            <button onClick={() => editRecord(selectedRecord.id)}>수정하기</button>
          </div>
        </section>
      )}
      {view === 'all' && (
        <div className={`danji-actions gallery-actions ${deleting ? 'delete-actions' : ''}`}>
          {deleting ? (
            <>
              <button
                onClick={() => {
                  setDeleting(false);
                  setDeleteIds([]);
                }}
              >
                취소
              </button>
              <button className="primary" disabled={!deleteIds.length} onClick={() => setConfirmDelete(true)}>
                삭제하기
              </button>
            </>
          ) : (
            <>
              <button
                aria-label="기록 삭제"
                onClick={() => {
                  setDeleting(true);
                  setDeleteIds([]);
                }}
              >
                <img className="danji-trash-icon" src={trashIcon} alt="" />
              </button>
              <button className="primary" onClick={createRecord}>
                <img src={buttonPencil} alt="기록하기" />
              </button>
            </>
          )}
        </div>
      )}

      {view === 'editPreview' && selectedRecord && (
        <section className="danji-edit-preview" aria-label="기록 수정하기">
          <span className="danji-editing-badge">수정중</span>
          <p className="danji-detail-hint">카드를 눌러 뒷면을 확인해보세요.</p>
          <div className="danji-edit-preview-card">
            {showNote ? (
              <div className={`danji-edit-preview-note ${noteLimitReached ? 'limit-reached' : ''}`}>
                {editingText ? (
                  <>
                    <textarea
                      autoFocus
                      value={draftNote}
                      onChange={(e) => {
                        const value = e.target.value;
                        setNoteLimitReached(value.length >= 100);
                        setDraftNote(value.slice(0, 100));
                      }}
                      aria-invalid={noteLimitReached}
                      aria-describedby={noteLimitReached ? 'danji-note-limit' : undefined}
                      placeholder="기록을 입력해주세요."
                      aria-label="기록 글 수정"
                    />
                    <small>{draftNote.length}/100</small>
                  </>
                ) : (
                  <button className="danji-note-flip" onClick={() => setEditingText(true)}>
                    {draftNote || '기록을 입력해주세요.'}
                  </button>
                )}
                {!editingText && <button
                  className="danji-note-pencil"
                  aria-label={editingText ? '글 수정 완료' : '글 수정'}
                  onClick={() => setEditingText((value) => !value)}
                >
                  <PencilIcon />
                </button>}
                {!editingText && (
                  <>
                    <button className="danji-back-date" onClick={() => setCalendarOpen(true)} aria-label="기록 날짜 수정">
                      <CalendarIcon /> <span>{draftDate.replaceAll('-', '/')}</span>
                    </button>
                    <button className="danji-flip-front" onClick={() => setShowNote(false)}>
                      사진 보기
                    </button>
                  </>
                )}
              </div>
            ) : (
              <>
                <button className="danji-edit-preview-photo" onClick={() => setShowNote(true)} aria-label="글 뒷면 보기">
                  <img src={selectedRecord.image} alt="수정 중인 사진" />
                </button>
                <button className="danji-date-button" onClick={() => setCalendarOpen(true)} aria-label="기록 날짜 수정">
                  <CalendarIcon /> <span>{draftDate.replaceAll('-', '/')}</span>
                </button>
              </>
            )}
          </div>
          {editingText && noteLimitReached && <p className="danji-note-limit" id="danji-note-limit" role="status">최대 100자까지 작성할 수 있어요.</p>}
          {editingText ? (
            <div className="danji-writing-controls">
              <button onClick={() => { setEditingText(false); setNoteLimitReached(false); }}>작성완료</button>
            </div>
          ) : <div className="danji-edit-preview-controls">
            <button
              onClick={() => {
                requestLeave('detail');
              }}
            >
              취소
            </button>
            <button onClick={saveRecord} disabled={!draftImage || !draftDate}>
              저장하기
            </button>
          </div>}
        </section>
      )}

      {view === 'editor' && (
        <section className="danji-editor" aria-label={selected === null ? '기록하기' : '기록 수정하기'}>
          <div className="danji-edit-card">
            <label className="danji-edit-photo">
              {draftImage ? <img src={draftImage} alt="선택한 기록 사진" /> : <span>사진을 선택해주세요</span>}
              <span className="danji-edit-photo-action">{draftImage ? '사진 변경' : '사진 선택'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = () => setDraftImage(String(reader.result));
                    reader.onerror = () => setSaveError('record');
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </label>
            <label className="danji-edit-date">
              날짜 <input type="date" value={draftDate} onChange={(e) => setDraftDate(e.target.value)} />
            </label>
            <textarea
              maxLength={100}
              value={draftNote}
              onChange={(e) => setDraftNote(e.target.value)}
              placeholder="오늘의 계절을 기록해보세요."
              aria-label="기록 내용"
            />
            <small>{draftNote.length}/100</small>
          </div>
          <div className="danji-actions edit-actions">
            <button onClick={() => requestLeave('jar')}>취소</button>
            <button className="primary" disabled={!draftImage || !draftDate} onClick={saveRecord}>
              {selected === null ? '작성 완료' : '저장하기'}
            </button>
          </div>
        </section>
      )}

      {calendarOpen && (
        <DanjiCalendar
          value={draftDate}
          onCancel={() => setCalendarOpen(false)}
          onConfirm={(value) => {
            setDraftDate(value);
            setCalendarOpen(false);
          }}
        />
      )}
      {saveError && (
        <div className="danji-error-snackbar" role="alert">
          <span>{saveError === 'delete' ? '기록을 삭제하지 못했어요.' : saveError === 'record' ? '기록을 저장하지 못했어요.' : '수정한 내용을 저장하지 못했어요.'}</span>
          <button onClick={() => saveError === 'delete' ? deleteSelectedRecords() : saveError === 'sticker' ? saveDecoration() : saveRecord()}>다시시도</button>
        </div>
      )}
      {leaveTarget && (
        <div className="danji-confirm-backdrop" onClick={() => setLeaveTarget(null)}>
          <div className="danji-confirm danji-leave-confirm" role="alertdialog" aria-modal="true" aria-labelledby="danji-leave-title" onClick={(event) => event.stopPropagation()}>
            <strong id="danji-leave-title">{view === 'decorate' ? '꾸민 내용을 저장하지 않고' : view === 'editor' ? '단지에 기록하지 않고' : '수정내용을 저장하지 않고'}<br />나갈까요?</strong>
            <p>{view === 'decorate' ? '지금까지 꾸민 내용이 저장되지 않아요.' : view === 'editor' ? '지금까지 작성한 내용은 저장되지 않아요.' : '저장하지 않은 내용은 사라져요.'}</p>
            <div>
              <button autoFocus onClick={() => setLeaveTarget(null)}>{view === 'decorate' ? '계속 꾸미기' : view === 'editor' ? '계속 기록하기' : '계속 수정하기'}</button>
              <button className="danger" onClick={() => finishLeave(leaveTarget)}>나가기</button>
            </div>
          </div>
        </div>
      )}
      {confirmDelete && (
        <div className="danji-confirm-backdrop" onClick={() => setConfirmDelete(false)}>
          <div
            className="danji-confirm"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="danji-confirm-title"
            onClick={(event) => event.stopPropagation()}
          >
            <strong id="danji-confirm-title">기록을 삭제할까요?</strong>
            <p>삭제한 기록은 다시 복구할 수 없어요.</p>
            <div>
              <button onClick={() => setConfirmDelete(false)}>취소</button>
              <button className="danger" onClick={deleteSelectedRecords}>
                삭제하기
              </button>
            </div>
          </div>
        </div>
      )}
      {sheet !== 'none' && (
        <div className="danji-sheet-backdrop" onClick={() => setSheet('none')}>
          {sheet === 'options' ? (
            <div className="danji-sheet danji-option-sheet" onClick={(event) => event.stopPropagation()}>
              <button className="danji-sheet-handle" aria-label="닫기" onClick={() => setSheet('none')} />
              <button
                className="danji-sheet-primary"
                onClick={() => {
                  setSelected(null);
                  setSheet('select');
                }}
              >
                기록 수정하기
              </button>
              <button
                className="danji-sheet-secondary"
                onClick={() => {
                  setSheet('none');
                  beginDecoration();
                }}
              >
                단지 꾸미기
              </button>
            </div>
          ) : (
            <div className="danji-sheet danji-select-sheet" onClick={(event) => event.stopPropagation()}>
              <button className="danji-sheet-handle" aria-label="닫기" onClick={() => setSheet('none')} />
              <strong>수정할 기록을 선택해주세요.</strong>
              <div className="danji-sheet-photos">
                {displayRecords.map((record: (typeof initialRecords)[number]) => (
                  <button key={record.id} className={selected === record.id ? 'selected' : ''} onClick={() => setSelected(record.id)}>
                    <img src={record.image} alt={`${record.date} 기록 선택`} />
                  </button>
                ))}
              </div>
              <button
                className="danji-sheet-primary"
                disabled={selected === null}
                onClick={() => selected !== null && editRecord(selected)}
              >
                기록 수정하기
              </button>
            </div>
          )}
        </div>
      )}
      {loading && <div className="danji-loading" role="status"><img src={loadingRing} alt="" /><strong>잠시만 기다려주세요</strong></div>}
      {import.meta.env.DEV && <div className="danji-device-indicator" aria-hidden="true" />}
    </div>
  );
}

