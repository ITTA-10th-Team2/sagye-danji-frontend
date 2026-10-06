import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { deleteRecord, getRecord, getSeasonRecords, updateRecord } from '../apis/records';
import type { RecordDetail, RecordListItem, RecordSeason } from '../apis/records';
import { graniteEvent } from '@apps-in-toss/web-framework';
import FloatingRecordCTA from '../components/home/FloatingRecordCTA';
import './Danji.css';
import DanjiCalendar from './DanjiCalendar';
// import DanjiStickerSheet from './DanjiStickerSheet';
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
import navClose from '../assets/danji/figma/nav-close.png';

import navBack from '../assets/danji/figma/nav-back.png';
import navLogo from '../assets/danji/figma/nav-logo.png';
import navHome from '../assets/danji/figma/nav-home.png';
import navDots from '../assets/danji/figma/nav-dots.png';
import statusTime from '../assets/danji/figma/status-time.png';
import statusRight from '../assets/danji/figma/status-right.png';
import buttonSparkle from '../assets/danji/figma/button-sparkle.png';
import buttonPencil from '../assets/danji/figma/button-pencil.png';

// Records come from the authenticated API; decoration remains device-local until its API exists.

import decor0 from '../assets/danji/current/sticker-0.png';
import decor1 from '../assets/danji/current/sticker-1.png';
import decor2 from '../assets/danji/current/sticker-2.png';
import decor3 from '../assets/danji/current/sticker-3.png';
import decor4 from '../assets/danji/current/sticker-4.png';
import decor5 from '../assets/danji/current/sticker-5.png';
import decor6 from '../assets/danji/current/sticker-6.png';
const stickerOptions = [decor0, decor1, decor2, decor3, decor4, decor5, decor6];
const stickerNames = ['클로버', '물방울', '별', '노란 불꽃', '분홍 불꽃', '카메라', '꽃'];
type Sticker = { id: number; option: number; x: number; y: number; size: number; page: number };
type DisplayRecord = { id: number; image: string; date: string; note: string; season: RecordSeason };
// The current backend exposes image IDs but no image retrieval URL.
const unavailablePhoto =
  'data:image/svg+xml;charset=utf-8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><rect width="100%" height="100%" fill="#e7e5df"/><text x="50%" y="50%" text-anchor="middle" fill="#65635d" font-size="16">사진을 불러올 수 없어요</text></svg>',
  );
function toDisplayRecord(record: RecordListItem | RecordDetail): DisplayRecord {
  return {
    id: record.id,
    image: unavailablePhoto,
    date: record.recordDate.replaceAll('-', '/'),
    note: record.memo ?? '',
    season: record.season,
  };
}
function sortRecordsByDate(records: DisplayRecord[]): DisplayRecord[] {
  return [...records].sort((a, b) => a.date.localeCompare(b.date) || a.id - b.id);
}

type View = 'jar' | 'all' | 'detail' | 'editor' | 'editPreview' | 'decorate';
type Sheet = 'none' | 'options' | 'select';

function PencilIcon() {
  return (
    <svg className="danji-inline-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="m4 16.5 11.7-11.7 3.5 3.5L7.5 20H4v-3.5Zm13-13a1.65 1.65 0 0 1 2.34 0l1.16 1.16a1.65 1.65 0 0 1 0 2.34l-.6.6-3.5-3.5.6-.6Z" />
    </svg>
  );
}

export default function Danji() {
  const [searchParams] = useSearchParams();
  const seoulYear = Number(new Intl.DateTimeFormat('en', { timeZone: 'Asia/Seoul', year: 'numeric' }).format(new Date()));
  const requestedYear = Number(searchParams.get('year') ?? seoulYear);
  const year = Number.isInteger(requestedYear) && requestedYear >= 2000 && requestedYear <= 2100 ? requestedYear : seoulYear;
  const requestedSeason = searchParams.get('season')?.toUpperCase();
  const season: RecordSeason =
    requestedSeason === 'SPRING' || requestedSeason === 'SUMMER' || requestedSeason === 'WINTER' ? requestedSeason : 'AUTUMN';
  const [previewRecords, setPreviewRecords] = useState<DisplayRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [reload, setReload] = useState(0);
  const [busy, setBusy] = useState(false);
  const mutationPending = useRef(false);
  const detailRequest = useRef<AbortController | null>(null);
  useEffect(() => () => detailRequest.current?.abort(), []);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setLoadError(false);
    getSeasonRecords(year, season, controller.signal)
      .then((records) => {
        if (!controller.signal.aborted) {
          setPreviewRecords(sortRecordsByDate(records.map(toDisplayRecord)));
          setPage(0);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) setLoadError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [year, season, reload]);
  const [page, setPage] = useState(0);
  const [draftDate, setDraftDate] = useState(new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(new Date()));
  const [draftNote, setDraftNote] = useState('');
  const [draftImage, setDraftImage] = useState<string | null>(null);
  const [stickers, setStickers] = useState<Sticker[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(`danji-local-stickers-${year}-${season}`) || '[]');
      return Array.isArray(saved)
        ? saved
            .filter((item) => Number.isInteger(item.option) && item.option >= 0 && item.option < 7)
            .map((item) => ({ ...item, size: item.size ?? 24.533, page: item.page ?? 0 }))
        : [];
    } catch {
      return [];
    }
  });
  const [draftStickers, setDraftStickers] = useState<Sticker[]>([]);
  const [activeSticker, setActiveSticker] = useState<number | null>(null);
  const [stickerPanelExpanded, setStickerPanelExpanded] = useState(true);
  function beginDecoration() {
    setDraftStickers(stickers.map((item) => ({ ...item })));
    setActiveSticker(null);
    setStickerPanelExpanded(true);
    setView('decorate');
  }
  function cancelDecoration() {
    requestLeave('jar');
  }
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
    if (mutationPending.current) return;
    if (view === 'editPreview' || view === 'editor' || view === 'decorate') setLeaveTarget(target);
    else finishLeave(target);
  }
  function finishLeave(target: 'jar' | 'detail' | 'home' | 'close') {
    detailRequest.current?.abort();
    setLoading(false);
    setLeaveTarget(null);
    setSaveSuccess(false);
    setStickerSaved(false);
    setSheet('none');
    setSaveError(null);
    setCalendarOpen(false);
    setEditingText(false);
    setShowNote(false);
    setActiveSticker(null);
    setDraftStickers([]);
    if (target === 'home' || target === 'close') window.location.assign('/home');
    else setView(target);
  }
  // Subscribe only inside a card/edit view so the main screen keeps Toss's normal back action.
  useEffect(() => {
    if (view !== 'detail' && view !== 'editPreview' && view !== 'editor' && view !== 'decorate') return;
    return graniteEvent.addEventListener('backEvent', {
      onEvent: () => requestLeave('jar'),
      onError: (error) => console.error('단지 뒤로가기 이벤트 오류:', error),
    });
  });

  function saveDecoration() {
    try {
      localStorage.setItem(`danji-local-stickers-${year}-${season}`, JSON.stringify(draftStickers));
    } catch {
      setSaveError('sticker');
      return;
    }
    setSaveError(null);
    setStickers(draftStickers);
    setView('jar');
    setActiveSticker(null);
    setStickerSaved(true);
  }
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  // Preview the new date order immediately; cancelling keeps the saved records intact.
  const displayRecords = useMemo(
    () =>
      sortRecordsByDate(
        view === 'editPreview' && selected !== null
          ? previewRecords.map((record) => (record.id === selected ? { ...record, date: draftDate.replaceAll('-', '/') } : record))
          : previewRecords,
      ),
    [previewRecords, view, selected, draftDate],
  );
  const pageCount = Math.max(1, Math.ceil(displayRecords.length / 5));
  const selectedRecord = previewRecords.find((item: DisplayRecord) => item.id === selected);
  useEffect(() => {
    if (!deleteSuccess) return;
    const timer = window.setTimeout(() => setDeleteSuccess(false), 2800);
    return () => window.clearTimeout(timer);
  }, [deleteSuccess]);

  function editRecord(id: number) {
    const record = previewRecords.find((item: DisplayRecord) => item.id === id);
    if (!record) return;
    setSelected(id);
    setDraftDate(record.date.replaceAll('/', '-'));
    setDraftNote(record.note.slice(0, 100));
    setNoteLimitReached(false);
    setDraftImage(record.image);
    setShowNote(true);
    setEditingText(true);
    setSheet('none');
    setView('editPreview');
  }
  async function saveRecord() {
    if (mutationPending.current || selected === null || !draftDate || draftNote.length > 100) return;
    mutationPending.current = true;
    setBusy(true);
    try {
      const record = toDisplayRecord(await updateRecord(selected, draftDate, draftNote));
      const next = sortRecordsByDate(previewRecords.map((item) => (item.id === record.id ? record : item)));
      setPreviewRecords(next);
      setPage(Math.floor(next.findIndex((item) => item.id === record.id) / 5));
      setSaveError(null);
      setCalendarOpen(false);
      setEditingText(false);
      setShowNote(true);
      setSaveSuccess(true);
      setView('detail');
    } catch {
      setSaveError('edit');
    } finally {
      mutationPending.current = false;
      setBusy(false);
    }
  }
  function openDateEditor() {
    if (!selectedRecord) return;
    setDraftDate(selectedRecord.date.replaceAll('/', '-'));
    setDraftNote(selectedRecord.note);
    setDraftImage(selectedRecord.image);
    setCalendarOpen(true);
  }
  async function saveDate(value: string) {
    if (!selectedRecord || mutationPending.current) return;
    setDraftDate(value);
    mutationPending.current = true;
    setBusy(true);
    try {
      const record = toDisplayRecord(await updateRecord(selectedRecord.id, value, selectedRecord.note));
      // A date change may move the record into a different year or season.
      const belongs = record.season === season && Number(value.slice(0, 4)) === year;
      const next = sortRecordsByDate(previewRecords.flatMap((item) => (item.id === record.id ? (belongs ? [record] : []) : [item])));
      setPreviewRecords(next);
      setPage(belongs ? Math.floor(next.findIndex((item) => item.id === record.id) / 5) : 0);
      setCalendarOpen(false);
      setSaveError(null);
      if (!belongs) {
        setSelected(null);
        setView('jar');
      }
    } catch {
      setSaveError('edit');
    } finally {
      mutationPending.current = false;
      setBusy(false);
    }
  }

  async function openDetail(id: number) {
    if (mutationPending.current) return;
    detailRequest.current?.abort();
    const controller = new AbortController();
    detailRequest.current = controller;
    setSelected(id);
    setShowNote(false);
    setView('detail');
    setSheet('none');
    setLoading(true);
    try {
      const record = toDisplayRecord(await getRecord(id, controller.signal));
      if (!controller.signal.aborted) {
        setPreviewRecords((items) => items.map((item) => (item.id === id ? record : item)));
        setLoadError(false);
      }
    } catch {
      if (!controller.signal.aborted) {
        setView('jar');
        setSelected(null);
        setLoadError(true);
      }
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }
  async function deleteSelectedRecords() {
    if (!deleteIds.length || mutationPending.current) return;
    mutationPending.current = true;
    setBusy(true);
    // Individual endpoints: keep failed IDs selected when only some deletes succeed.
    const results = await Promise.allSettled(deleteIds.map((id) => deleteRecord(id)));
    const deleted = deleteIds.filter((_, i) => results[i].status === 'fulfilled');
    const failed = deleteIds.filter((_, i) => results[i].status === 'rejected');
    setPreviewRecords((items) => items.filter((item) => !deleted.includes(item.id)));
    setDeleteIds(failed);
    setConfirmDelete(false);
    setSelected(null);
    setPage(0);
    setDeleting(failed.length > 0);
    setSaveError(failed.length ? 'delete' : null);
    setDeleteSuccess(failed.length === 0);
    mutationPending.current = false;
    setBusy(false);
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
      {import.meta.env.DEV && (
        <header className="danji-header">
          <button
            aria-label="뒤로"
            onClick={() =>
              view === 'detail' || view === 'editPreview' || view === 'editor' || view === 'decorate'
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
            <button aria-label="앱 닫기" onClick={() => requestLeave('close')}>
              <img src={navClose} alt="" />
            </button>
          </span>
          {headerMenu && (
            <div className="danji-header-popover">
              토스 앱 공통 메뉴
              <br />
              브라우저 미리보기에서는 연결되지 않습니다.<button onClick={() => setHeaderMenu(false)}>닫기</button>
            </div>
          )}
        </header>
      )}
      {!deleting && view !== 'detail' && view !== 'editPreview' && view !== 'decorate' && (
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
          className={`danji-scene record-count-${Math.min(5, Math.max(0, previewRecords.length - page * 5))}${previewRecords.slice(page * 5, page * 5 + 5).length === 5 ? ` full-layout-${page % 3}` : ''}`}
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
          {!loading && !loadError && previewRecords.length === 0 && (
            <p className="danji-jar-empty">
              <strong>아직 담긴 기록이 없어요!</strong>
              <span>
                사계단지에
                <br />첫 기록을 담아보세요.
              </span>
            </p>
          )}
          {!loading && !loadError && previewRecords.length === 0 && <img className="danji-empty-lines" src={emptyLines} alt="" />}
          {displayRecords.slice(page * 5, page * 5 + 5).map((record: DisplayRecord, index: number) => (
            <button
              key={record.id}
              className={`danji-polaroid position-${index}`}
              onClick={() => view === 'jar' && openDetail(record.id)}
              aria-label={`${record.date} 기록 상세보기`}
            >
              <img src={record.image} alt="기록 사진 (조회 URL 미제공)" />
              <time>{record.date}</time>
            </button>
          ))}
          <div className="danji-stickers">
            {(view === 'decorate' ? draftStickers : stickers)
              .filter((item) => item.page === page)
              .map((item) => (
                <div
                  key={item.id}
                  className={`danji-placed-sticker ${view === 'decorate' ? 'editable' : ''} ${activeSticker === item.id ? 'selected' : ''}`}
                  style={{ left: `${item.x}%`, top: `${item.y}%`, width: `${item.size}%` }}
                >
                  <button
                    className="danji-sticker-drag"
                    aria-label={`${stickerNames[item.option]} 스티커 이동`}
                    disabled={view !== 'decorate'}
                    onPointerDown={(event) => {
                      if (view !== 'decorate') return;
                      setActiveSticker(item.id);
                      event.currentTarget.setPointerCapture(event.pointerId);
                    }}
                    onPointerMove={(event) => {
                      if (view !== 'decorate' || !event.currentTarget.hasPointerCapture(event.pointerId)) return;
                      const rect = event.currentTarget.closest('.danji-scene')!.getBoundingClientRect();
                      setDraftStickers((items) =>
                        items.map((sticker) =>
                          sticker.id === item.id
                            ? {
                                ...sticker,
                                x: Math.max(0, Math.min(100 - sticker.size, sticker.x + (event.movementX / rect.width) * 100)),
                                y: Math.max(
                                  0,
                                  Math.min(
                                    100 - (sticker.size * rect.width) / rect.height,
                                    sticker.y + (event.movementY / rect.height) * 100,
                                  ),
                                ),
                              }
                            : sticker,
                        ),
                      );
                    }}
                    onPointerUp={(event) => {
                      if (event.currentTarget.hasPointerCapture(event.pointerId))
                        event.currentTarget.releasePointerCapture(event.pointerId);
                    }}
                  >
                    <img src={stickerOptions[item.option]} alt={stickerNames[item.option]} draggable={false} />
                  </button>
                  {view === 'decorate' && (
                    <>
                      <button
                        className="danji-sticker-remove"
                        aria-label="스티커 삭제"
                        onClick={() => {
                          setDraftStickers((items) => items.filter((sticker) => sticker.id !== item.id));
                          setActiveSticker(null);
                        }}
                      >
                        ×
                      </button>
                      <button
                        className="danji-sticker-resize"
                        aria-label="스티커 크기 조절"
                        onPointerDown={(event) => {
                          setActiveSticker(item.id);
                          event.currentTarget.setPointerCapture(event.pointerId);
                        }}
                        onPointerMove={(event) => {
                          if (view !== 'decorate' || !event.currentTarget.hasPointerCapture(event.pointerId)) return;
                          const width = event.currentTarget.closest('.danji-scene')!.getBoundingClientRect().width;
                          setDraftStickers((items) =>
                            items.map((sticker) =>
                              sticker.id === item.id
                                ? { ...sticker, size: Math.max(10, Math.min(40, sticker.size - (event.movementX / width) * 100)) }
                                : sticker,
                            ),
                          );
                        }}
                        onPointerUp={(event) => {
                          if (event.currentTarget.hasPointerCapture(event.pointerId))
                            event.currentTarget.releasePointerCapture(event.pointerId);
                        }}
                      >
                        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path
                            d="M9 15 15 9M5 14v5h5M14 5h5v5M5 19l4-4M19 5l-4 4"
                            stroke="currentColor"
                            strokeWidth="2.4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </>
                  )}
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
                <FloatingRecordCTA
                  renderTrigger={(open) => (
                    <button className="primary" aria-label="기록하기" onClick={open}>
                      <img src={buttonPencil} alt="" />
                    </button>
                  )}
                />
              </div>
            </>
          ) : (
            <>
              <section className={`danji-decoration-sheet ${stickerPanelExpanded ? 'expanded' : 'collapsed'}`} aria-label="단지 꾸미기">
                <button
                  className="danji-decoration-handle"
                  aria-label={stickerPanelExpanded ? '스티커 패널 접기' : '스티커 패널 펼치기'}
                  aria-expanded={stickerPanelExpanded}
                  onClick={() => setStickerPanelExpanded(!stickerPanelExpanded)}
                />
                <h2>나의 스티커</h2>
                <p style={{ fontSize: 12, textAlign: 'center' }}>꾸민 내용은 현재 기기에만 저장돼요.</p>
                <div className="danji-decoration-grid">
                  {stickerOptions.map((src, option) => (
                    <button
                      key={src}
                      aria-label={`${stickerNames[option]} 스티커 추가`}
                      onClick={() => {
                        const id = Date.now();
                        setDraftStickers((items) => [...items, { id, option, x: 38, y: 33, size: 24.533, page }]);
                        setActiveSticker(id);
                        setStickerPanelExpanded(false);
                      }}
                    >
                      <img src={src} alt="" />
                    </button>
                  ))}
                </div>
                <div className="danji-decoration-actions">
                  <button onClick={cancelDecoration}>취소</button>
                  <button onClick={saveDecoration}>이 기기에 저장</button>
                </div>
              </section>
            </>
          )}
        </section>
      )}

      {view === 'all' && (
        <section className={`danji-gallery ${deleting ? 'deleting' : ''}`} aria-label={deleting ? '삭제할 기록 선택' : '전체 기록'}>
          {deleting && (
            <div className="danji-delete-heading">
              <strong>기록 삭제</strong>
              <small>삭제할 기록을 선택해주세요.</small>
            </div>
          )}
          {!loading && !loadError && previewRecords.length === 0 && (
            <p className="danji-empty">
              <strong>아직 담긴 기록이 없어요!</strong>
              <span>
                사계단지에
                <br />첫 기록을 담아보세요.
              </span>
            </p>
          )}
          {displayRecords.map((record: DisplayRecord) => (
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
              <img src={record.image} alt="기록 사진 (조회 URL 미제공)" />
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
        <div
          className="danji-modal-backdrop"
          onClick={() => {
            setSaveSuccess(false);
            setStickerSaved(false);
          }}
        >
          <div
            className={`danji-saved-sheet ${stickerSaved ? 'sticker-saved' : ''}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="danji-saved-title"
            onClick={(event) => event.stopPropagation()}
          >
            <span className="danji-saved-handle" />
            <strong id="danji-saved-title">{stickerSaved ? '이 기기에 스티커를 저장했어요!' : '저장했어요!'}</strong>
            <p>{stickerSaved ? '스티커는 현재 기기에만 저장돼요.' : '단지에서 수정된 나의 기록을 확인해보세요.'}</p>
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
          <article className={`danji-large-card ${showNote ? 'showing-note' : ''}`}>
            {showNote ? (
              <>
                <button className="danji-card-note" onClick={() => setShowNote(false)} aria-label="사진 보기">
                  {selectedRecord.note || '아직 작성한 글이 없어요.'}
                </button>
                <button className="danji-direct-pencil" aria-label="글 수정" onClick={() => editRecord(selectedRecord.id)}>
                  <PencilIcon />
                </button>
              </>
            ) : (
              <>
                <button className="danji-detail-photo" onClick={() => setShowNote(true)} aria-label="기록 글 보기">
                  <img src={selectedRecord.image} alt="기록 사진 (조회 URL 미제공)" />
                </button>
                <button className="danji-detail-date" onClick={openDateEditor} aria-label="기록 날짜 수정">
                  <span>{selectedRecord.date}</span>
                  <PencilIcon />
                </button>
              </>
            )}
          </article>
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
              <button className="primary" disabled={busy || !deleteIds.length} onClick={() => setConfirmDelete(true)}>
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
              <FloatingRecordCTA
                renderTrigger={(open) => (
                  <button className="primary" onClick={open}>
                    <img src={buttonPencil} alt="기록하기" />
                  </button>
                )}
              />
            </>
          )}
        </div>
      )}

      {view === 'editPreview' && selectedRecord && (
        <section className="danji-edit-preview" aria-label="기록 글 수정">
          <div className="danji-edit-preview-card">
            <div className={`danji-edit-preview-note ${noteLimitReached ? 'limit-reached' : ''}`}>
              <textarea
                autoFocus
                maxLength={100}
                value={draftNote}
                onChange={(event) => {
                  const value = event.target.value;
                  setNoteLimitReached(value.length >= 100);
                  setDraftNote(value.slice(0, 100));
                }}
                aria-invalid={noteLimitReached}
                aria-describedby={noteLimitReached ? 'danji-note-limit' : undefined}
                placeholder="기록을 입력해주세요."
                aria-label="기록 글 수정"
              />
              <small>{draftNote.length}/100</small>
            </div>
          </div>
          {noteLimitReached && (
            <p className="danji-note-limit" id="danji-note-limit" role="status">
              최대 100자까지 작성할 수 있어요.
            </p>
          )}
          <div className="danji-edit-preview-controls">
            <button disabled={busy} onClick={() => requestLeave('detail')}>
              취소
            </button>
            <button onClick={saveRecord} disabled={busy || !draftDate}>
              저장하기
            </button>
          </div>
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
            <button className="primary" disabled={busy || !draftDate} onClick={saveRecord}>
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
            if (view === 'detail') saveDate(value);
            else {
              setDraftDate(value);
              setCalendarOpen(false);
            }
          }}
        />
      )}
      {saveError && (
        <div className="danji-error-snackbar" role="alert">
          <span>
            {saveError === 'delete'
              ? '기록을 삭제하지 못했어요.'
              : saveError === 'record'
                ? '기록을 저장하지 못했어요.'
                : '수정한 내용을 저장하지 못했어요.'}
          </span>
          <button
            disabled={busy}
            onClick={() =>
              saveError === 'delete'
                ? deleteSelectedRecords()
                : saveError === 'sticker'
                  ? saveDecoration()
                  : view === 'detail'
                    ? saveDate(draftDate)
                    : saveRecord()
            }
          >
            다시시도
          </button>
        </div>
      )}
      {leaveTarget && (
        <div className="danji-confirm-backdrop" onClick={() => setLeaveTarget(null)}>
          <div
            className="danji-confirm danji-leave-confirm"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="danji-leave-title"
            onClick={(event) => event.stopPropagation()}
          >
            <strong id="danji-leave-title">
              {view === 'decorate' ? '꾸민 내용을 저장하지 않고' : view === 'editor' ? '단지에 기록하지 않고' : '수정내용을 저장하지 않고'}
              <br />
              나갈까요?
            </strong>
            <p>
              {view === 'decorate'
                ? '지금까지 꾸민 내용이 저장되지 않아요.'
                : view === 'editor'
                  ? '지금까지 작성한 내용은 저장되지 않아요.'
                  : '저장하지 않은 내용은 사라져요.'}
            </p>
            <div>
              <button autoFocus onClick={() => setLeaveTarget(null)}>
                {view === 'decorate' ? '계속 꾸미기' : view === 'editor' ? '계속 기록하기' : '계속 수정하기'}
              </button>
              <button className="danger" onClick={() => finishLeave(leaveTarget)}>
                나가기
              </button>
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
              <button className="danger" disabled={busy} onClick={deleteSelectedRecords}>
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
                {displayRecords.map((record: DisplayRecord) => (
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
      {loadError && !loading && (
        <div className="danji-error-snackbar" role="alert">
          <span>기록을 불러오지 못했어요.</span>
          <button onClick={() => setReload((value) => value + 1)}>다시시도</button>
        </div>
      )}
      {(loading || busy) && (
        <div className="danji-loading" role="status">
          <img src={loadingRing} alt="" />
          <strong>잠시만 기다려주세요</strong>
        </div>
      )}
      {import.meta.env.DEV && <div className="danji-device-indicator" aria-hidden="true" />}
    </div>
  );
}
