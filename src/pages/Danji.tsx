import { useEffect, useRef, useState } from 'react';
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

type RecordItem = { id: string; date: string; image?: string; text: string; season: string };
const STORAGE_KEY = 'sagye-danji-records-v1';
const SEASONS = ['봄', '여름', '가을', '겨울'];
const seasonForMonth = (month: number) => SEASONS[Math.floor((month % 12) / 3) === 0 ? 3 : Math.floor((month % 12) / 3) - 1];
const currentSeason = () => seasonForMonth(new Date().getMonth() + 1);
const dateLabel = (date: string) => date.replaceAll('-', '/');
const samplePhotos = [sample1, sample4, sample3, sample5, sample2];

function loadRecords(): RecordItem[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) as RecordItem[] : [];
  } catch {
    return [];
  }
}

export default function Danji() {
  const [records, setRecords] = useState<RecordItem[]>(loadRecords);
  const [tab, setTab] = useState<'jar' | 'all'>('jar');
  const [season, setSeason] = useState(currentSeason);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [arranging, setArranging] = useState(false);
  const [text, setText] = useState('');
  const [image, setImage] = useState<string | undefined>();
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const fileInput = useRef<HTMLInputElement>(null);
  const selected = records.find((item) => item.id === selectedId);
  const seasonRecords = records.filter((item) => item.season === season);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(records)); } catch { /* Storage quota can be exceeded by photos. */ }
  }, [records]);

  function beginNew() {
    setSelectedId(null);
    setDate(new Date().toISOString().slice(0, 10));
    setText('');
    setImage(undefined);
    setEditing(true);
  }

  function beginEdit() {
    if (!selected) return;
    setDate(selected.date);
    setText(selected.text);
    setImage(selected.image);
    setEditing(true);
  }

  function save() {
    if (!text.trim() && !image) return;
    const item: RecordItem = {
      id: selectedId ?? crypto.randomUUID(), date, text: text.trim(), image,
      season: seasonForMonth(Number(date.slice(5, 7))),
    };
    setRecords((previous) => selectedId
      ? previous.map((record) => record.id === selectedId ? item : record)
      : [item, ...previous]);
    setSeason(item.season);
    setSelectedId(item.id);
    setEditing(false);
  }

  function choosePhoto(file?: File) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImage(typeof reader.result === 'string' ? reader.result : undefined);
    reader.readAsDataURL(file);
  }

  function moveRecord(id: string, direction: number) {
    setRecords((previous) => {
      const copy = [...previous];
      const index = copy.findIndex((item) => item.id === id);
      const next = index + direction;
      if (index < 0 || next < 0 || next >= copy.length) return previous;
      [copy[index], copy[next]] = [copy[next], copy[index]];
      return copy;
    });
  }

  return (
    <div className="danji-page">
      <header className="danji-header">
        <button aria-label="뒤로" onClick={() => selectedId ? setSelectedId(null) : window.history.back()}>‹</button>
        <span className="danji-app-icon">⌂</span><strong>사계단지</strong>
        <span className="danji-header-spacer" />
        <button aria-label="좋아요">♥</button><button aria-label="더보기">···</button><button aria-label="닫기" onClick={() => window.history.back()}>×</button>
      </header>
      <nav className="danji-tabs" aria-label="기록 보기 방식">
        <button className={tab === 'jar' ? 'active' : ''} onClick={() => { setTab('jar'); setSelectedId(null); }}>단지</button>
        <button className={tab === 'all' ? 'active' : ''} onClick={() => { setTab('all'); setSelectedId(null); }}>전체</button>
      </nav>

      {editing ? (
        <section className="danji-editor">
          <h1>{selectedId ? '기록 수정하기' : '기록하기'}</h1>
          <label>날짜<input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label>
          <div className="danji-photo-input" onClick={() => fileInput.current?.click()} role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === 'Enter') fileInput.current?.click(); }}>
            {image ? <img src={image} alt="선택한 사진" /> : <span>＋<br />사진 선택하기</span>}
          </div>
          <input ref={fileInput} type="file" accept="image/*" hidden onChange={(event) => choosePhoto(event.target.files?.[0])} />
          {image && <button className="danji-remove-photo" onClick={() => setImage(undefined)}>사진 삭제</button>}
          <textarea placeholder="이 계절의 기억을 적어주세요" maxLength={500} value={text} onChange={(event) => setText(event.target.value)} />
          <small>{text.length}/500</small>
          <div className="danji-actions"><button onClick={() => setEditing(false)}>뒤로</button><button className="primary" disabled={!text.trim() && !image} onClick={save}>완료</button></div>
        </section>
      ) : selected ? (
        <section className="danji-detail">
          <article className="danji-large-card">
            <span className="danji-badge">{records.indexOf(selected) + 1}/{records.length}</span>
            {selected.image ? <img src={selected.image} alt="기록 사진" /> : <p>{selected.text}</p>}
            <time>{dateLabel(selected.date)}</time>
          </article>
          {selected.image && selected.text && <p className="danji-detail-text">{selected.text}</p>}
          <div className="danji-actions"><button onClick={() => setSelectedId(null)}>뒤로</button><button className="primary" onClick={beginEdit}>기록 수정하기</button></div>
        </section>
      ) : tab === 'all' ? (
        <section className="danji-gallery" aria-label="전체 기록">
          {records.length ? records.map((item) => <button key={item.id} className="danji-mini-card" onClick={() => setSelectedId(item.id)}>
            {item.image ? <img src={item.image} alt="" /> : <span className="danji-mini-text">{item.text}</span>}
            <time>{dateLabel(item.date)}</time>
          </button>) : <p className="danji-empty">아직 기록이 없어요.<br />첫 계절의 기억을 남겨보세요.</p>}
        </section>
      ) : (
        <section className="danji-scene">
          <img className="danji-art ground" src={ground} alt="" />
          <img className="danji-art shadow-a" src={shadowA} alt="" />
          <img className="danji-art shadow-b" src={shadowB} alt="" />
          <img className="danji-art leaf-top" src={leavesTop} alt="" />
          <img className="danji-art leaf-right" src={leafRight} alt="" />
          <img className="danji-art leaf-left" src={leafLeft} alt="" />
          <div className="danji-jar" aria-label={`${season} 단지`}>
            <img className="jar-back" src={jarBack} alt="" />
            <img className="jar-inner" src={jarInner} alt="" />
            <img className="jar-glow" src={jarGlow} alt="" />
            <img className="jar-lid-base" src={jarLidBase} alt="" />
            <img className="jar-lid-top" src={jarLidTop} alt="" />
          </div>
          {(seasonRecords.length ? seasonRecords.slice(0, 5) : samplePhotos).map((entry, index) => {
            const item = typeof entry === 'string' ? null : entry;
            return <button key={item?.id ?? index} className={`danji-polaroid position-${index}`} onClick={() => item && !arranging ? setSelectedId(item.id) : !item ? beginNew() : undefined} aria-label={item ? `${dateLabel(item.date)} 기록 보기` : '예시 사진, 기록하기'}>
              {item ? (item.image ? <img src={item.image} alt="" /> : <span>{item.text}</span>) : <img src={entry as string} alt="" />}
              <time>{item ? dateLabel(item.date) : '2026/09/23'}</time>
              {item && arranging && <span className="danji-order"><span onClick={(event) => { event.stopPropagation(); moveRecord(item.id, -1); }}>↑</span><span onClick={(event) => { event.stopPropagation(); moveRecord(item.id, 1); }}>↓</span></span>}
            </button>;
          })}
          <div className="danji-dots"><span className="active" /><span /></div>
          <div className="danji-actions"><button aria-label="단지 꾸미기" onClick={() => setArranging(!arranging)}>{arranging ? '완료' : '☷'}</button><button className="primary" onClick={beginNew}>✎ &nbsp; 기록하기</button></div>
        </section>
      )}
      {!editing && !selected && tab === 'all' && <div className="danji-actions gallery-actions"><button aria-label="단지 꾸미기" onClick={() => { setTab('jar'); setArranging(true); }}>☷</button><button className="primary" onClick={beginNew}>✎ &nbsp; 기록하기</button></div>}
    </div>
  );
}
