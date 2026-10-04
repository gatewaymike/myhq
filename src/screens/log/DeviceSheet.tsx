import { useEffect, useRef, useState } from 'react';
import { useApp } from '../../app/context';
import type { Route } from '../../lib/hq';
import type { Device } from '../../store/types';
import { LIMITS, NumberField, parseNum, validate } from './fields';

/** "My equipment, set up once" (item 2). Hydrogen flow at the outlet or concentration; no purity input (G1). lint-allow */
export function DeviceSheet({ route, onClose, onSaved }: { route: Route; onClose: () => void; onSaved: (d: Device) => void }) {
  const { t, store, bump } = useApp();
  const [r, setR] = useState<Route>(route);
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [mode, setMode] = useState('');
  const [busy, setBusy] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    dialogRef.current?.querySelector<HTMLInputElement>('input')?.focus();
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const limit = r === 'inhalation' ? LIMITS.flow : LIMITS.concentration;
  const err = value ? validate(value, limit, t) : null;
  const ok = name.trim().length > 0 && value !== '' && !err;

  async function save() {
    if (!ok || busy) return;
    setBusy(true);
    try {
      const v = parseNum(value);
      const d = await store.addDevice({
        name: name.trim(),
        route: r,
        h2FlowMlMin: r === 'inhalation' ? v : null,
        concentrationMgL: r === 'water' ? v : null,
        modeLabel: mode.trim() || null,
      });
      bump();
      onSaved(d);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70 sm:items-center" onClick={onClose}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="device-title"
        className="w-full max-w-md rounded-t-[20px] border border-water/60 bg-surface p-5 shadow-[0_0_25px_rgb(var(--water)/.25)] sm:rounded-[20px]"
        style={{ paddingBottom: 'calc(20px + env(safe-area-inset-bottom, 0px))' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="device-title" className="mb-4 font-mono text-sm uppercase tracking-[.12em] text-text">
          {t('device.title')}
        </h2>
        <form
          className="grid grid-cols-[minmax(0,1fr)] gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
        >
          <div className="grid grid-cols-2 gap-1 rounded-full border border-line bg-bg p-1" role="radiogroup" aria-label={t('device.route')}>
            {(['inhalation', 'water'] as Route[]).map((x) => (
              <button
                key={x}
                type="button"
                role="radio"
                aria-checked={r === x}
                onClick={() => {
                  setR(x);
                  setValue('');
                }}
                className={`min-h-tap rounded-full text-sm ${r === x ? (x === 'water' ? 'bg-water/15 text-water' : 'bg-inhalation/15 text-inhalation') : 'text-muted'}`}
              >
                {t(x === 'water' ? 'route.water' : 'route.inhalation')}
              </button>
            ))}
          </div>

          <label className="grid gap-1.5">
            <span className="font-mono text-[11px] uppercase tracking-[.1em] text-muted">{t('device.name')}</span>
            <input
              id="device-name"
              value={name}
              maxLength={80}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('device.namePlaceholder')}
              className="min-h-tap rounded-xl border border-line bg-bg px-3 text-text placeholder:text-muted/60 focus:border-water focus:outline-none"
            />
          </label>

          <NumberField
            id="device-value"
            label={t(r === 'inhalation' ? 'device.flowLabel' : 'device.concentrationLabel')}
            unit={r === 'inhalation' ? 'mL/min' : 'mg/L'}
            value={value}
            onChange={setValue}
            error={err}
            hint={r === 'inhalation' ? t('device.mixedGasExample') : undefined}
          />

          <label className="grid gap-1.5">
            <span className="font-mono text-[11px] uppercase tracking-[.1em] text-muted">{t('device.modeLabel')}</span>
            <input
              id="device-mode"
              value={mode}
              maxLength={60}
              onChange={(e) => setMode(e.target.value)}
              className="min-h-tap rounded-xl border border-line bg-bg px-3 text-text focus:border-water focus:outline-none"
            />
            <span className="text-xs text-muted">{t('device.modeHint')}</span>
          </label>

          <div className="mt-1 grid grid-cols-2 gap-3">
            <button type="button" onClick={onClose} className="min-h-tap rounded-xl border border-line text-sm text-body">
              {t('device.cancel')}
            </button>
            <button type="submit" disabled={!ok || busy} className="min-h-tap rounded-xl bg-water text-sm font-bold text-bg disabled:opacity-40">
              {t('device.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
