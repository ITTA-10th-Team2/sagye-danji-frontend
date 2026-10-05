import { useEffect, useRef, useState } from 'react';

type Props = { value: string; onConfirm: (value: string) => void; onCancel: () => void };
const formatDate = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

export default function DanjiCalendar({ value, onConfirm, onCancel }: Props) {
  const [selection, setSelection] = useState(value);
  const [year, setYear] = useState(Number(value.slice(0, 4)));
  const [month, setMonth] = useState(Number(value.slice(5, 7)) - 1);
  const dialog = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    dialog.current?.focus();
    return () => previous?.focus();
  }, []);
  const start = new Date(year, month, 1);
  start.setDate(1 - start.getDay());
  const rows = Math.ceil((new Date(year, month, 1).getDay() + new Date(year, month + 1, 0).getDate()) / 7);
  const days = Array.from({ length: rows * 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
  return (
    <div className="danji-modal-backdrop" onClick={onCancel}>
      <div
        ref={dialog}
        tabIndex={-1}
        className="danji-calendar"
        role="dialog"
        aria-modal="true"
        aria-label="기록 날짜 수정"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => {
          if (event.key === 'Escape') onCancel();
          if (event.key === 'Tab') {
            const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button,select'));
            const first = controls[0],
              last = controls[controls.length - 1];
            if (event.shiftKey && document.activeElement === first) {
              event.preventDefault();
              last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
              event.preventDefault();
              first.focus();
            }
          }
        }}
      >
        <div className="danji-calendar-selects">
          <select aria-label="월" value={month} onChange={(event) => setMonth(Number(event.target.value))}>
            {Array.from({ length: 12 }, (_, index) => (
              <option key={index} value={index}>
                {index + 1}월
              </option>
            ))}
          </select>
          <select aria-label="연도" value={year} onChange={(event) => setYear(Number(event.target.value))}>
            {Array.from({ length: Math.max(new Date().getFullYear(), year) - 1900 + 11 }, (_, index) => 1900 + index).map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>
        <div className="danji-calendar-grid">
          {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
            <span key={day}>{day}</span>
          ))}
          {days.map((date) => (
            <button
              key={formatDate(date)}
              className={`${date.getMonth() !== month ? 'outside' : ''} ${formatDate(date) === selection ? 'selected' : ''}`}
              aria-label={formatDate(date)}
              aria-pressed={formatDate(date) === selection}
              onClick={() => setSelection(formatDate(date))}
            >
              {date.getDate()}
            </button>
          ))}
        </div>
        <div className="danji-calendar-actions">
          <button onClick={onCancel}>취소</button>
          <button onClick={() => onConfirm(selection)}>완료</button>
        </div>
      </div>
    </div>
  );
}
