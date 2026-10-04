import { useEffect, useState } from 'react';
import { useApp } from '../../app/context';
import { RouteIcon } from '../../app/RouteIcon';
import { entryHQ, formatHQ, localDateOf } from '../../lib/hq';
import type { Entry } from '../../store/types';
import { LIMITS, NumberField, parseNum, toLocalInput, validate } from '../log/fields';

/** Edit an entry's figures, time and note (item 9: editable time on edits). The route stays. */
export function EditSheet({ entry, onClose, onSaved }: { entry: Entry; onClose: () => void; onSaved: (e: Entry) => void }) {
  const { t, store, locale } = useApp();
  const water = entry.route === 'water';
  const [a, setA] = useState(String(water ? entry.volumeMl : entry.minutes));
  const [b, setB] = useState(String(water ? entry.concentrationMgL : entry.h2FlowMlMin));
  const [when, setWhen] = useState(toLocalInput(new Date(entry.sessionStart)));
  const [notes, setNotes] = useState(entry.notes ?? '');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const aErr = validate(a, water ? LIMITS.volume : LIMITS.minutes, t);
  const bErr = validate(b, water ? LIMITS.concentration : LIMITS.flow, t);
  const date = new Date(when);
  const ok = !aErr && !bErr && !Number.isNaN(date.getTime());
  const hq = ok
    ? entryHQ(water ? { route: 'water', volumeMl: parseNum(a), concentrationMgL: parseNum(b) } : { route: 'inhalation', minutes: parseNum(a), h2FlowMlMin: parseNum(b) })
    : null;

  async function save() {
    if (!ok || busy) return;
    setBusy(true);
    setErr(null);
    try {
      const { localDate, tz } = localDateOf(date);
      const saved = await store.updateEntry(entry.id, {
        sessionStart: date.toISOString(),
        localDate,
        tz,
        ...(water ? { volumeMl: parseNum(a), concentrationMgL: parseNum(b) } : { minutes: parseNum(a), h2FlowMlMin: parseNum(b) }),
        notes: notes.trim() || null,
      });
      onSaved(saved);
    } catch {
      setErr(t('log.errorSave'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70 sm:items-center" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-h"
        className="grid max-h-[92vh] w-full max-w-md grid-cols-[minmax(0,1fr)] gap-4 overflow-y-auto rounded-t-[20px] border border-water/60 bg-surface p-5 shadow-[0_0_25px_rgb(var(--water)/.25)] sm:rounded-[20px]"
        style={{ paddingBottom: 'calc(20px + env(safe-area-inset-bottom, 0px))' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="edit-h" className="flex items-center gap-2 font-mono text-sm uppercase tracking-[.12em] text-text">
          <RouteIcon route={entry.route} className={`h-4 w-4 ${water ? 'text-water' : 'text-inhalation'}`} />
          {t('history.editTitle')}
        </h2>
        <form
          className="grid grid-cols-[minmax(0,1fr)] gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
        >
          <label className="grid gap-1.5" htmlFor="edit-when">
            <span className="font-mono text-[11px] uppercase tracking-[.1em] text-muted">{t('log.when')}</span>
            <input
              id="edit-when"
              type="datetime-local"
              value={when}
              max={toLocalInput(new Date())}
              onChange={(e) => setWhen(e.target.value)}
              className="min-h-tap rounded-xl border border-line bg-bg px-3 text-text focus:border-water focus:outline-none"
            />
          </label>
          <NumberField id="edit-a" label={t(water ? 'log.volume' : 'log.minutes')} unit={water ? 'mL' : 'min'} value={a} onChange={setA} error={aErr} />
          <NumberField
            id="edit-b"
            label={t(water ? 'log.concentration' : 'device.flowLabel')}
            unit={water ? 'mg/L' : 'mL/min'}
            value={b}
            onChange={setB}
            error={bErr}
          />
          <label className="grid gap-1.5" htmlFor="edit-notes">
            <span className="font-mono text-[11px] uppercase tracking-[.1em] text-muted">{t('log.notes')}</span>
            <textarea
              id="edit-notes"
              rows={2}
              maxLength={500}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="rounded-xl border border-line bg-bg px-3 py-2 text-text focus:border-water focus:outline-none"
            />
          </label>
          <p className="tabular text-center font-mono text-sm text-text">{hq === null ? '·' : `${formatHQ(hq, locale)} HQ`}</p>
          {err && <p className="text-sm text-danger">{err}</p>}
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={onClose} className="min-h-[48px] rounded-xl border border-line text-sm text-body">
              {t('device.cancel')}
            </button>
            <button type="submit" disabled={!ok || busy} className={`min-h-[48px] rounded-xl text-sm font-bold text-bg disabled:opacity-40 ${water ? 'bg-water' : 'bg-inhalation'}`}>
              {busy ? t('log.saving') : t('history.saveChanges')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
