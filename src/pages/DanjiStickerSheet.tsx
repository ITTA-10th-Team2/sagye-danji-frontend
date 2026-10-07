import { useRef, useState, type PointerEvent, type ReactNode } from 'react';

type Props = {
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  children: ReactNode;
  actions: ReactNode;
};

// At the top of the list, a downward swipe moves the sheet. Otherwise it
// scrolls the list first. Pointer coordinates work for both mouse and touch.
export default function DanjiStickerSheet({ expanded, onExpandedChange, children, actions }: Props) {
  const gridRef = useRef<HTMLDivElement>(null);
  const gesture = useRef<{
    pointerId: number; x: number; y: number; lastY: number;
    offset: number; travel: number; inGrid: boolean; dragging: boolean;
  } | null>(null);
  const suppressClick = useRef(false);
  const [dragOffset, setDragOffset] = useState<number | null>(null);

  function start(event: PointerEvent<HTMLElement>) {
    if (!event.isPrimary || event.button !== 0 || (event.target as HTMLElement).closest('.danji-decoration-actions')) return;
    const scene = event.currentTarget.closest('.danji-scene')!.getBoundingClientRect();
    const expandedTop = Math.min(scene.width * .54133, Math.max(0, scene.height - 96));
    const collapsedTop = Math.min(scene.width * 1.21067, Math.max(0, scene.height - 96));
    gesture.current = {
      pointerId: event.pointerId, x: event.clientX, y: event.clientY, lastY: event.clientY,
      offset: expanded ? 0 : 1, travel: Math.max(1, collapsedTop - expandedTop),
      inGrid: !!(event.target as HTMLElement).closest('.danji-decoration-grid'), dragging: false,
    };
  }

  function move(event: PointerEvent<HTMLElement>) {
    const g = gesture.current;
    if (!g || g.pointerId !== event.pointerId) return;
    if (!g.dragging) {
      if (Math.abs(event.clientY - g.y) < 6) return;
      if (Math.abs(event.clientX - g.x) > Math.abs(event.clientY - g.y)) { gesture.current = null; return; }
      g.dragging = true;
      suppressClick.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    let delta = event.clientY - g.lastY;
    g.lastY = event.clientY;
    const grid = gridRef.current;
    // An expanded list consumes movement until its scroll reaches the top.
    if (g.inGrid && grid && g.offset === 0) {
      if (delta < 0) { grid.scrollTop -= delta; delta = 0; }
      else {
        const consumed = Math.min(grid.scrollTop, delta);
        grid.scrollTop -= consumed;
        delta -= consumed;
      }
    }
    if (delta !== 0) {
      const previous = g.offset;
      g.offset = Math.max(0, Math.min(1, previous + delta / g.travel));
      if (g.inGrid && grid && delta < 0 && g.offset === 0) {
        grid.scrollTop += Math.max(0, -delta - previous * g.travel);
      }
    }
    setDragOffset(g.offset);
  }

  function finish(event: PointerEvent<HTMLElement>, cancelled = false) {
    const g = gesture.current;
    if (!g || g.pointerId !== event.pointerId) return;
    gesture.current = null;
    if (g.dragging) {
      if (!cancelled) onExpandedChange(g.offset < .5);
      setDragOffset(null);
      if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
      // A swipe starting on a sticker must not add it as a click on release.
      window.setTimeout(() => { suppressClick.current = false; }, 0);
    }
  }

  return (
    <section className={`danji-decoration-sheet ${expanded ? 'expanded' : 'collapsed'} ${dragOffset !== null ? 'dragging' : ''}`}
      aria-label="단지 꾸미기"
      style={{ top: `calc(var(--sticker-sheet-expanded-top) + (var(--sticker-sheet-collapsed-top) - var(--sticker-sheet-expanded-top)) * ${dragOffset ?? (expanded ? 0 : 1)})` }}
      onPointerDown={start} onPointerMove={move} onPointerUp={(event) => finish(event)}
      onPointerCancel={(event) => finish(event, true)} onLostPointerCapture={(event) => finish(event, true)}
      onClickCapture={(event) => { if (suppressClick.current) { event.preventDefault(); event.stopPropagation(); } }}>
      <button className="danji-decoration-handle" aria-label={expanded ? '스티커 패널 접기' : '스티커 패널 펼치기'}
        aria-expanded={expanded} onClick={() => onExpandedChange(!expanded)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            event.preventDefault(); onExpandedChange(event.key === 'ArrowUp');
          }
        }} />
      <h2>나의 스티커</h2>
      <div className="danji-decoration-grid" ref={gridRef}>{children}</div>
      <div className="danji-decoration-actions">{actions}</div>
    </section>
  );
}
