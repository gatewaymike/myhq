import { useEffect, useRef, useState } from 'react';
import { DAILY_REFERENCE_HQ, formatHQ } from '../../lib/hq';

export interface DayBar {
  date: string; // YYYY-MM-DD
  water: number;
  inhalation: number;
}

/** Column path with a 4px rounded data-end and a square baseline. */
function column(x: number, top: number, w: number, h: number, roundTop: boolean): string {
  if (h <= 0) return '';
  const r = roundTop ? Math.min(4, h, w / 2) : 0;
  const b = top + h;
  return `M${x},${b}L${x},${top + r}Q${x},${top} ${x + r},${top}L${x + w - r},${top}Q${x + w},${top} ${x + w},${top + r}L${x + w},${b}Z`;
}

/**
 * Stacked daily columns: water at the base, inhalation above, 2px surface gap between them.
 * One y-axis in HQ; a solid reference line at 10.0 (a reference value, never a target).
 * Hover (desktop) or tap (phone) selects a day; the parent shows its numbers.
 */
export function TrendsChart(props: {
  days: DayBar[];
  locale: string;
  selected: string | null;
  onSelect: (date: string | null) => void;
  label: string;
}) {
  const { days, locale, selected, onSelect, label } = props;
  const wrap = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(340);
  // Roving focus: one tab stop for the chart, arrow keys move between days, Enter or Space selects.
  const [focusIdx, setFocusIdx] = useState<number | null>(null);
  const slotRefs = useRef<(SVGRectElement | null)[]>([]);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(Math.max(260, Math.round(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const H = 220;
  const pad = { l: 28, r: 34, t: 10, b: 26 };
  const plotW = width - pad.l - pad.r;
  const plotH = H - pad.t - pad.b;
  const max = Math.max(...days.map((d) => d.water + d.inhalation), 0);
  const yMax = Math.max(15, Math.ceil(max / 5) * 5);
  const y = (v: number) => pad.t + plotH - (v / yMax) * plotH;
  const ticks: number[] = [];
  for (let v = 0; v <= yMax; v += 5) ticks.push(v);
  const slot = plotW / Math.max(1, days.length);
  const barW = Math.max(3, Math.min(24, slot * 0.62));
  const short = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString(locale, { month: 'short', day: 'numeric' });
  const labelEvery = days.length > 14 ? 7 : days.length > 7 ? 3 : 2;
  const refY = y(DAILY_REFERENCE_HQ);

  return (
    <div ref={wrap} className="w-full" onPointerLeave={(e) => e.pointerType === 'mouse' && onSelect(null)}>
      <svg width={width} height={H} viewBox={`0 0 ${width} ${H}`} role="img" aria-label={label} className="block">
        {/* hairline grid and y ticks */}
        {ticks.map((v) => (
          <g key={v}>
            <line x1={pad.l} x2={pad.l + plotW} y1={y(v)} y2={y(v)} stroke="rgb(var(--border))" strokeWidth="1" />
            <text x={pad.l - 6} y={y(v) + 4} textAnchor="end" fontSize="11" fill="rgb(var(--muted))" fontFamily="DM Mono, ui-monospace, monospace">
              {v}
            </text>
          </g>
        ))}

        {/* columns */}
        {days.map((d, i) => {
          const x = pad.l + i * slot + (slot - barW) / 2;
          const wH = (d.water / yMax) * plotH;
          const iH = (d.inhalation / yMax) * plotH;
          const base = pad.t + plotH;
          const gap = wH > 0 && iH > 0 ? 2 : 0;
          const dim = selected !== null && selected !== d.date;
          return (
            <g key={d.date} opacity={dim ? 0.4 : 1}>
              <path d={column(x, base - wH, barW, wH, iH === 0)} fill="rgb(var(--water))" />
              <path d={column(x, base - wH - gap - iH, barW, iH, true)} fill="rgb(var(--inhalation))" />
            </g>
          );
        })}

        {/* reference line at 10.0 */}
        <line x1={pad.l} x2={pad.l + plotW} y1={refY} y2={refY} stroke="rgb(var(--ref))" strokeWidth="1.5" />
        <text x={pad.l + plotW + 4} y={refY + 4} fontSize="11" fill="rgb(var(--ref))" fontFamily="DM Mono, ui-monospace, monospace">
          10.0
        </text>

        {/* x labels */}
        {days.map((d, i) =>
          (days.length - 1 - i) % labelEvery === 0 ? (
            <text key={d.date} x={pad.l + i * slot + slot / 2} y={H - 8} textAnchor="middle" fontSize="11" fill="rgb(var(--muted))" fontFamily="DM Mono, ui-monospace, monospace">
              {short(d.date)}
            </text>
          ) : null,
        )}

        {/* hit targets: the whole column slot, taller and wider than the mark */}
        {days.map((d, i) => {
          const selIdx = days.findIndex((x) => x.date === selected);
          const stop = focusIdx ?? (selIdx >= 0 ? selIdx : days.length - 1);
          const isFocus = focusIdx === i;
          const move = (to: number) => {
            const n = Math.min(days.length - 1, Math.max(0, to));
            setFocusIdx(n);
            slotRefs.current[n]?.focus();
          };
          return (
            <rect
              key={d.date}
              ref={(el) => {
                slotRefs.current[i] = el;
              }}
              x={pad.l + i * slot}
              y={pad.t}
              width={slot}
              height={plotH}
              fill="transparent"
              stroke={isFocus ? 'rgb(var(--action))' : 'none'}
              strokeWidth="2"
              rx="4"
              role="button"
              tabIndex={i === stop ? 0 : -1}
              aria-pressed={selected === d.date}
              aria-label={`${short(d.date)}: ${formatHQ(d.water + d.inhalation, locale)} HQ`}
              style={{ cursor: 'pointer', outline: 'none' }}
              onFocus={() => setFocusIdx(i)}
              onBlur={() => setFocusIdx(null)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelect(d.date);
                } else if (e.key === 'ArrowRight') {
                  e.preventDefault();
                  move(i + 1);
                } else if (e.key === 'ArrowLeft') {
                  e.preventDefault();
                  move(i - 1);
                } else if (e.key === 'Home') {
                  e.preventDefault();
                  move(0);
                } else if (e.key === 'End') {
                  e.preventDefault();
                  move(days.length - 1);
                }
              }}
              onPointerEnter={(e) => e.pointerType === 'mouse' && onSelect(d.date)}
              onClick={() => onSelect(d.date)}
            />
          );
        })}
      </svg>
    </div>
  );
}
