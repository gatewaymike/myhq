import type { ReactNode } from 'react';
import type { StringKey } from '../../i18n/strings';

/** Input ceilings, mirrored from the database CHECK constraints (0001_init.sql). */
export const LIMITS = {
  volume: 5000,
  concentration: 20,
  minutes: 1440,
  flow: 10000,
} as const;

export function parseNum(s: string): number {
  const clean = s.replace(/,/g, '').trim();
  return clean === '' ? Number.NaN : Number(clean);
}

type T = (k: StringKey, v?: Record<string, string | number>) => string;

export function validate(s: string, max: number, t: T): string | null {
  const n = parseNum(s);
  if (!Number.isFinite(n) || n <= 0) return t('log.errorPositive');
  if (n > max) return t('log.errorMax', { max: max.toLocaleString('en-US') });
  return null;
}

export function NumberField(props: {
  id: string;
  label: string;
  unit: string;
  value: string;
  onChange: (v: string) => void;
  error?: string | null;
  hint?: string;
  below?: ReactNode;
}) {
  const { id, label, unit, value, onChange, error, hint, below } = props;
  return (
    <div className="grid min-w-0 gap-1.5">
      <label htmlFor={id} className="font-mono text-[11px] uppercase tracking-[.1em] text-muted">
        {label}
      </label>
      <div className={`flex min-h-tap items-center rounded-xl border bg-bg focus-within:border-water ${error ? 'border-danger' : 'border-line'}`}>
        <input
          id={id}
          inputMode="decimal"
          autoComplete="off"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-err` : hint ? `${id}-hint` : undefined}
          className="tabular w-0 min-w-0 flex-1 bg-transparent px-3 py-2.5 text-lg text-text focus:outline-none"
        />
        <span className="pr-3 font-mono text-xs text-muted">{unit}</span>
      </div>
      {error && (
        <span id={`${id}-err`} className="text-xs text-danger">
          {error}
        </span>
      )}
      {below}
      {hint && (
        <span id={`${id}-hint`} className="text-xs leading-relaxed text-muted">
          {hint}
        </span>
      )}
    </div>
  );
}

/** "YYYY-MM-DDTHH:mm" in local time, for <input type="datetime-local">. */
export function toLocalInput(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

export function formatClock(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const p = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${p(m)}:${p(sec)}` : `${p(m)}:${p(sec)}`;
}
