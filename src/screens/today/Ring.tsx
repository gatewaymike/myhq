import { DAILY_REFERENCE_HQ } from '../../lib/hq';

/**
 * Daily ring (item 10, R-365): the HQ number with a reference tick at 10.0, never a percentage.
 * 300 x 300, r = 124, stroke 16; water then inhalation arcs, drawn over 1.5 s ease-out.
 * Scale: the full circle is 15.0 HQ, stepping up in fives above that, so a full ring never
 * reads as "10.0 reached" (suggested, not ruled).
 */
export const RING_MIN_SCALE = 15;
export function ringScale(total: number): number {
  return Math.max(RING_MIN_SCALE, Math.ceil(total / 5) * 5);
}

const R = 124;
const C = 2 * Math.PI * R;

export function Ring({ water, inhalation, locale, label }: { water: number; inhalation: number; locale: string; label: string }) {
  const total = water + inhalation;
  const scale = ringScale(total);
  const w = (water / scale) * C;
  const i = (inhalation / scale) * C;
  const a = (DAILY_REFERENCE_HQ / scale) * 2 * Math.PI - Math.PI / 2;
  const at = (rad: number) => ({ x: 150 + rad * Math.cos(a), y: 150 + rad * Math.sin(a) });
  const t1 = at(R - 13);
  const t2 = at(R + 13);
  const lbl = at(R + 22);
  // Keep the label clear of the tick: anchor it away from the ring on whichever side the tick falls.
  const anchor = Math.cos(a) < -0.3 ? 'end' : Math.cos(a) > 0.3 ? 'start' : 'middle';

  return (
    <svg viewBox="0 0 300 300" role="img" aria-label={label} className="block h-full w-full overflow-visible">
      <circle cx="150" cy="150" r={R} fill="none" stroke="rgb(var(--track))" strokeWidth="16" />
      <g transform="rotate(-90 150 150)">
        {w > 0 && (
          <circle
            className="ring-arc"
            cx="150" cy="150" r={R} fill="none"
            stroke="rgb(var(--water))" strokeWidth="16" strokeLinecap="round"
            strokeDasharray={`${w} ${C}`}
            style={{ ['--len' as string]: `${w}` }}
          />
        )}
        {i > 0 && (
          <circle
            className="ring-arc"
            cx="150" cy="150" r={R} fill="none"
            stroke="rgb(var(--inhalation))" strokeWidth="16" strokeLinecap="round"
            strokeDasharray={`${i} ${C}`}
            transform={`rotate(${(w / C) * 360} 150 150)`}
            style={{ ['--len' as string]: `${i}`, animationDelay: '.15s' }}
          />
        )}
      </g>
      <line x1={t1.x} y1={t1.y} x2={t2.x} y2={t2.y} stroke="rgb(var(--text))" strokeWidth="3" strokeLinecap="round" opacity=".9" />
      <text x={lbl.x} y={lbl.y + 5} fill="rgb(var(--muted))" fontFamily="DM Mono, ui-monospace, monospace" fontSize="13" textAnchor={anchor}>
        {DAILY_REFERENCE_HQ.toLocaleString(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
      </text>
    </svg>
  );
}
