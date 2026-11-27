import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../app/context';
import {
  concentrationEquivalents,
  entryHQ,
  formatHQ,
  formatInput,
  formatMg,
  localDateOf,
  showTheMath,
  type EntryInput as FormulaInput,
  type Route,
} from '../../lib/hq';
import { failKey } from '../../app/failKey';
import { LoadNotice } from '../../app/LoadNotice';
import { useLoad } from '../../app/useLoad';
import { loadPrefs, readJSON, savePrefs, uuid, writeJSON } from '../../store/localStore';
import type { Device, Entry } from '../../store/types';
import { DeviceSheet } from './DeviceSheet';
import { DevicePicker } from './DevicePicker';
import { RouteIcon } from '../../app/RouteIcon';
import { Figure } from '../../app/Figure';
import { LIMITS, NumberField, formatClock, parseNum, toLocalInput, validate, isFuture } from './fields';

/* ------------------------------------------------------------------ timer */
// Item 6: the start time is stored, so a locked phone or a closed tab never loses a session.
const TIMER_KEY = 'myhq.timer.v1';
interface TimerState {
  startedAt: number;
  deviceId: string | null;
  h2FlowMlMin: number;
}

type WhenMode = 'now' | 'yesterday' | 'pick';
type InhalationMode = 'timer' | 'manual';
const MANUAL = '__manual__';
const WATER_CHIPS = [200, 400, 600];
const MINUTE_CHIPS = [15, 30, 45, 60];

function routeColor(r: Route) {
  return r === 'water' ? 'text-water' : 'text-inhalation';
}

export function LogScreen() {
  const { t, store, version, bump, toast, locale } = useApp();
  const prefs = useMemo(loadPrefs, []);
  const nav = useNavigate();
  // From the first-run screen: open on the tapped route, with the cursor in the first empty field.
  const startRoute = (useLocation().state as { startRoute?: Route } | null)?.startRoute;
  const cardRef = useRef<HTMLElement>(null);
  const focused = useRef(false);

  const [route, setRoute] = useState<Route>(startRoute ?? prefs.lastRoute);
  const [devices, setDevices] = useState<Device[]>([]);
  const [recent, setRecent] = useState<Entry[]>([]);
  const [deviceId, setDeviceId] = useState<string>(MANUAL);
  const [sheet, setSheet] = useState(false);

  // values as typed
  const [volume, setVolume] = useState('');
  const [conc, setConc] = useState('');
  const [flow, setFlow] = useState('');
  const [minutes, setMinutes] = useState('');
  const [inhMode, setInhMode] = useState<InhalationMode>('manual');
  const [notes, setNotes] = useState('');

  const [whenMode, setWhenMode] = useState<WhenMode>('now');
  const [pickValue, setPickValue] = useState(() => toLocalInput(new Date()));

  const [timer, setTimer] = useState<TimerState | null>(() => readJSON<TimerState | null>(TIMER_KEY, null));
  const [now, setNow] = useState(Date.now());
  const [pourNoteSeen, setPourNoteSeen] = useState(prefs.pourNoteSeen);

  // The result bar sits where the toast normally appears; lift the toast clear of it while this screen is open.
  useEffect(() => {
    document.documentElement.style.setProperty('--toast-lift', '150px');
    return () => {
      document.documentElement.style.removeProperty('--toast-lift');
    };
  }, []);
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const flashTimer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(flashTimer.current), []);
  const [saveError, setSaveError] = useState<string | null>(null);
  // Double-save guard (item 9): one request id per form; a repeat tap reuses it and the store ignores the duplicate.
  const requestId = useRef(uuid());

  /* -------------------------------------------------------- load data */
  // A failed load keeps the last loaded equipment and entries; the form stays usable either way.
  const { data: loaded, status: loadStatus, retry: retryLoad } = useLoad<{ devices: Device[]; recent: Entry[] }>(
    store,
    'log',
    async () => {
      const [devices, recent] = await Promise.all([store.listDevices(), store.listEntries({ limit: 30 })]);
      return { devices, recent };
    },
    [version],
  );
  useEffect(() => {
    if (!loaded) return;
    setDevices(loaded.devices);
    setRecent(loaded.recent);
  }, [loaded]);

  useEffect(() => {
    if (!startRoute || !loaded || focused.current) return;
    focused.current = true;
    window.setTimeout(() => {
      const empty = [...(cardRef.current?.querySelectorAll<HTMLInputElement>('input') ?? [])].find((i) => i.value === '');
      empty?.focus();
    }, 50);
  }, [startRoute, loaded]);

  // Open on the last device used for this route (item 4).
  const routeDevices = devices.filter((d) => d.route === route);
  useEffect(() => {
    if (timer) return;
    const last = prefs.lastDeviceId[route];
    const pick = routeDevices.find((d) => d.id === last) ?? routeDevices[0];
    setDeviceId(pick ? pick.id : MANUAL);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route, devices.length]);

  const device = devices.find((d) => d.id === deviceId) ?? null;

  /* ------------------------------------------------------------ timer */
  useEffect(() => {
    if (!timer) return;
    const tick = () => setNow(Date.now());
    const id = window.setInterval(tick, 1000);
    document.addEventListener('visibilitychange', tick);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [timer]);

  useEffect(() => {
    if (timer) {
      setRoute('inhalation');
      setInhMode('timer');
      if (timer.deviceId) setDeviceId(timer.deviceId);
      else setFlow(String(timer.h2FlowMlMin));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [stoppedAt, setStoppedAt] = useState<number | null>(null);

  /* ------------------------------------------------------- effective values */
  // During a timer session the flow is the saved device's, or else the figure captured at Start. A device
  // that went away mid-session (removed, or re-created by signing in) can therefore never strand the session.
  const flowValue = device?.h2FlowMlMin ?? (timer ? timer.h2FlowMlMin : parseNum(flow));
  const concValue = device?.concentrationMgL ?? parseNum(conc);

  const flowErr = !device && flow ? validate(flow, LIMITS.flow, t) : null;
  const concErr = !device && conc ? validate(conc, LIMITS.concentration, t) : null;
  const volErr = volume ? validate(volume, LIMITS.volume, t) : null;
  const minErr = minutes ? validate(minutes, LIMITS.minutes, t) : null;

  const runningMinutes = timer && !stoppedAt ? (now - timer.startedAt) / 60000 : null;

  const formulaInput: FormulaInput | null = useMemo(() => {
    if (route === 'water') {
      const v = parseNum(volume);
      if (volErr || concErr || !(v > 0) || !(concValue > 0)) return null;
      return { route: 'water', volumeMl: v, concentrationMgL: concValue };
    }
    const m = runningMinutes ?? parseNum(minutes);
    if ((runningMinutes === null && minErr) || flowErr || !(m > 0) || !(flowValue > 0)) return null;
    return { route: 'inhalation', minutes: m, h2FlowMlMin: flowValue };
  }, [route, volume, volErr, concErr, concValue, runningMinutes, minutes, minErr, flowErr, flowValue]);

  const hq = formulaInput ? entryHQ(formulaInput) : 0;
  const math = formulaInput ? showTheMath(formulaInput, locale) : null;

  const sessionStartDate = useMemo(() => {
    if (route === 'inhalation' && timer && stoppedAt) return new Date(timer.startedAt);
    if (whenMode === 'yesterday') return new Date(Date.now() - 24 * 3600 * 1000);
    if (whenMode === 'pick') return new Date(pickValue);
    return null; // "now" resolves at save time
  }, [route, timer, stoppedAt, whenMode, pickValue]);

  const timerBlocking = route === 'inhalation' && inhMode === 'timer' && (!timer || !stoppedAt);
  const pickedFuture = whenMode === 'pick' && isFuture(new Date(pickValue));
  const canSave = !!formulaInput && !saving && !timerBlocking && !(whenMode === 'pick' && Number.isNaN(new Date(pickValue).getTime())) && !pickedFuture;

  /* ------------------------------------------------------------ actions */
  const rememberDevice = useCallback(
    (r: Route, id: string) => {
      const p = loadPrefs();
      if (id !== MANUAL) p.lastDeviceId[r] = id;
      p.lastRoute = r;
      savePrefs(p);
    },
    [],
  );

  function resetForm() {
    setVolume('');
    setMinutes('');
    setNotes('');
    setWhenMode('now');
    setStoppedAt(null);
    setTimer(null);
    writeJSON(TIMER_KEY, null);
    requestId.current = uuid();
  }

  async function save() {
    if (!canSave || !formulaInput) return;
    setSaving(true);
    setSaveError(null);
    try {
      // The first entry a person ever saves goes to Today so the gauge draws; every later save stays here.
      const firstEver = !!loaded && loaded.recent.length === 0;
      const start = sessionStartDate ?? new Date();
      const { localDate, tz } = localDateOf(start);
      const saved = await store.addEntry({
        deviceId: device?.id ?? null,
        route,
        sessionStart: start.toISOString(),
        localDate,
        tz,
        minutes: formulaInput.route === 'inhalation' ? formulaInput.minutes : null,
        h2FlowMlMin: formulaInput.route === 'inhalation' ? formulaInput.h2FlowMlMin : null,
        volumeMl: formulaInput.route === 'water' ? formulaInput.volumeMl : null,
        concentrationMgL: formulaInput.route === 'water' ? formulaInput.concentrationMgL : null,
        notes: notes.trim() || null,
        clientRequestId: requestId.current,
      });
      rememberDevice(route, deviceId);
      resetForm();
      setSavedFlash(true);
      window.clearTimeout(flashTimer.current);
      flashTimer.current = window.setTimeout(() => setSavedFlash(false), 380);
      bump();
      toast(t('log.saved', { hq: formatHQ(saved.hq, locale) }), {
        label: t('log.undo'),
        run: async () => {
          try {
            await store.deleteEntry(saved.id);
          } catch (err) {
            toast(t(failKey(err)));
            return;
          }
          bump();
          toast(t('log.removed'));
        },
      });
      if (firstEver) {
        // Typed by hand: Today offers once to keep the figure as equipment.
        const offer = device ? null : route === 'inhalation' ? { route, value: flowValue } : { route, value: concValue };
        nav('/', { state: offer ? { offer } : null });
      }
    } catch (e) {
      setSaveError(t(failKey(e)));
    } finally {
      setSaving(false);
    }
  }

  // One repeat at a time: a double tap on a row is one entry, not two.
  const repeating = useRef(false);
  async function repeat(e: Entry) {
    if (repeating.current) return;
    repeating.current = true;
    setSaveError(null);
    try {
      const start = new Date();
      const { localDate, tz } = localDateOf(start);
      const saved = await store.addEntry({
        deviceId: e.deviceId,
        route: e.route,
        sessionStart: start.toISOString(),
        localDate,
        tz,
        minutes: e.minutes,
        h2FlowMlMin: e.h2FlowMlMin,
        volumeMl: e.volumeMl,
        concentrationMgL: e.concentrationMgL,
        notes: null,
        clientRequestId: uuid(),
      });
      bump();
      toast(t('log.saved', { hq: formatHQ(saved.hq, locale) }), {
        label: t('log.undo'),
        run: async () => {
          try {
            await store.deleteEntry(saved.id);
          } catch (err) {
            toast(t(failKey(err)));
            return;
          }
          bump();
          toast(t('log.removed'));
        },
      });
    } catch (err) {
      setSaveError(t(failKey(err)));
    } finally {
      repeating.current = false;
    }
  }

  function startTimer() {
    if (!(flowValue > 0) || flowErr) return;
    const s: TimerState = { startedAt: Date.now(), deviceId: device?.id ?? null, h2FlowMlMin: flowValue };
    writeJSON(TIMER_KEY, s);
    setTimer(s);
    setStoppedAt(null);
    setNow(Date.now());
  }

  function stopTimer() {
    if (!timer) return;
    const end = Date.now();
    setStoppedAt(end);
    // Whole tenths of a minute (6 s), so the review figure reads cleanly.
    setMinutes(String(Math.max(0.1, Math.round((end - timer.startedAt) / 6000) / 10)));
  }

  function discardTimer() {
    setTimer(null);
    setStoppedAt(null);
    setMinutes('');
    writeJSON(TIMER_KEY, null);
  }

  /* --------------------------------------------------------- recent list */
  const repeatable = useMemo(() => {
    const seen = new Set<string>();
    const out: Entry[] = [];
    for (const e of recent) {
      const k = [e.route, e.deviceId, e.minutes, e.h2FlowMlMin, e.volumeMl, e.concentrationMgL].join('|');
      if (seen.has(k)) continue;
      seen.add(k);
      out.push(e);
      if (out.length === 3) break;
    }
    return out;
  }, [recent]);

  const describe = (e: Entry) => {
    const name = devices.find((d) => d.id === e.deviceId)?.name;
    const body =
      e.route === 'water'
        ? `${formatInput(e.volumeMl!, locale)} mL · ${formatInput(e.concentrationMgL!, locale)} mg/L`
        : `${formatInput(e.minutes!, locale)} min · ${formatInput(e.h2FlowMlMin!, locale)} mL/min`;
    return { name, body };
  };


  const equiv = concValue > 0 ? concentrationEquivalents(concValue) : null;
  const [picker, setPicker] = useState(false);
  const [whenOpen, setWhenOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const routeText = routeColor(route);
  const timeLabel = (d: Date) => d.toLocaleString(locale, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  const whenSummary =
    whenMode === 'now' ? t('log.now') : whenMode === 'yesterday' ? `${t('log.yesterday')} · ${timeLabel(new Date(Date.now() - 864e5))}` : timeLabel(new Date(pickValue));
  const linkBtn = 'min-h-tap px-1 font-mono text-xs uppercase tracking-wider text-action';

  /* ------------------------------------------------------------- render */
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-6">
      <h1 className="pt-2 text-center text-title text-text">{t('log.title')}</h1>

      <LoadNotice status={loadStatus} retry={retryLoad} />

      {/* Route */}
      <div className="grid grid-cols-2 gap-1 rounded-full border border-line bg-surface p-1" role="radiogroup" aria-label={t('log.routeLabel')}>
        {(['water', 'inhalation'] as Route[]).map((r) => (
          <button
            key={r}
            type="button"
            role="radio"
            aria-checked={route === r}
            disabled={!!timer && r === 'water'}
            onClick={() => {
              setRoute(r);
              const p = loadPrefs();
              p.lastRoute = r;
              savePrefs(p);
            }}
            className={`flex min-h-[48px] items-center justify-center gap-2 rounded-full text-[15px] transition-colors disabled:opacity-40 ${
              route === r ? (r === 'water' ? 'bg-water/15 text-water' : 'bg-inhalation/15 text-inhalation') : 'text-muted hover:text-body'
            }`}
          >
            <RouteIcon route={r} />
            {t(r === 'water' ? 'route.water' : 'route.inhalation')}
          </button>
        ))}
      </div>

      {/* Main card */}
      <section ref={cardRef} className={`grid grid-cols-[minmax(0,1fr)] gap-5 rounded-[20px] border bg-surface p-5 ${route === 'water' ? 'border-water/40' : 'border-inhalation/40'}`}>
        {/* Equipment, one row */}
        <button
          type="button"
          disabled={!!timer}
          onClick={() => setPicker(true)}
          className="flex min-h-[52px] items-center justify-between gap-3 rounded-xl border border-line bg-bg px-4 py-2 text-left disabled:opacity-70"
          aria-haspopup="dialog"
        >
          <span className="grid min-w-0">
            <span className="font-mono text-[10px] uppercase tracking-[.12em] text-muted">{t('log.equipment')}</span>
            <span className="truncate text-text">{device ? `${device.name}${device.modeLabel ? ` · ${device.modeLabel}` : ''}` : t('log.manual')}</span>
            {device && (
              <span className={`tabular font-mono text-xs ${routeText}`}>
                {device.route === 'inhalation' ? `${formatInput(device.h2FlowMlMin!, locale)} mL/min H₂` : `${formatInput(device.concentrationMgL!, locale)} mg/L`}
              </span>
            )}
          </span>
          {!timer && <span className="shrink-0 font-mono text-xs uppercase tracking-wider text-action">{t('log.change')}</span>}
        </button>

        {route === 'water' ? (
          <>
            <div className="grid gap-3">
              <span className="text-[17px] text-text">{t('log.howMuchDrank')}</span>
              <div className="grid grid-cols-3 gap-2">
                {WATER_CHIPS.map((ml) => (
                  <button
                    key={ml}
                    type="button"
                    aria-pressed={parseNum(volume) === ml}
                    onClick={() => setVolume(String(ml))}
                    className={`tabular min-h-[48px] rounded-xl border font-mono text-sm ${parseNum(volume) === ml ? 'border-water bg-water/10 text-water' : 'border-line text-body'}`}
                  >
                    {ml} mL
                  </button>
                ))}
              </div>
              <NumberField id="log-volume" label={t('log.volume')} unit="mL" value={volume} onChange={setVolume} error={volErr} />
            </div>
            {!device && <NumberField id="log-conc" label={t('log.concentration')} unit="mg/L" value={conc} onChange={setConc} error={concErr} />}
            {equiv && !concErr && (
              <p className="tabular -mt-2 font-mono text-xs text-muted">
                {t('log.concEquiv', { mgL: formatInput(equiv.mgL, locale), ppm: formatInput(equiv.ppm, locale), ppb: formatInput(equiv.ppb, locale) })}
              </p>
            )}
            {!pourNoteSeen && (
              <div className="flex items-start gap-3 border-t border-line pt-4 text-xs leading-relaxed text-muted">
                <p className="flex-1">{t('log.pourNote')}</p>
                <button
                  type="button"
                  className={linkBtn}
                  onClick={() => {
                    setPourNoteSeen(true);
                    const p = loadPrefs();
                    p.pourNoteSeen = true;
                    savePrefs(p);
                  }}
                >
                  {t('log.gotIt')}
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            {!device && (
              <NumberField
                id="log-flow"
                label={t('log.flow')}
                unit="mL/min"
                value={timer ? String(timer.h2FlowMlMin) : flow}
                onChange={setFlow}
                error={flowErr}
                hint={t('device.mixedGasExample')}
              />
            )}

            {/* Minutes or Timer: a two-way switch, locked while a session is running */}
            <div className="grid grid-cols-2 gap-1 rounded-xl border border-line bg-bg p-1" role="radiogroup" aria-label={`${t('log.minutes')} / ${t('log.timer')}`}>
              {(['manual', 'timer'] as InhalationMode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  role="radio"
                  aria-checked={inhMode === m}
                  disabled={!!timer}
                  onClick={() => setInhMode(m)}
                  className={`min-h-tap rounded-lg text-row transition-colors duration-150 motion-reduce:transition-none disabled:cursor-default ${inhMode === m ? 'bg-surface-2 text-text' : 'text-muted hover:text-body'}`}
                >
                  {t(m === 'manual' ? 'log.minutes' : 'log.timer')}
                </button>
              ))}
            </div>

            {inhMode === 'timer' && !stoppedAt ? (
              <div className="grid justify-items-center gap-4 py-1">
                <span className="tabular font-mono text-[3.25rem] font-medium leading-none text-text">{formatClock(timer ? now - timer.startedAt : 0)}</span>
                {timer ? (
                  <>
                    <p className="max-w-sm text-center text-small text-muted">{t('log.sessionRunning')}</p>
                    <div className="grid w-full grid-cols-2 gap-3">
                      <button type="button" onClick={discardTimer} className="min-h-[52px] rounded-xl border border-line text-row text-body">
                        {t('log.discardSession')}
                      </button>
                      <button type="button" onClick={stopTimer} className="min-h-[52px] rounded-xl bg-action text-row font-semibold text-on-action">
                        {t('log.stopSession')}
                      </button>
                    </div>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={startTimer}
                    disabled={!(flowValue > 0) || !!flowErr}
                    className="min-h-[52px] w-full rounded-xl bg-action text-[16px] font-semibold text-on-action disabled:opacity-40"
                  >
                    {t('log.startSession')}
                  </button>
                )}
              </div>
            ) : (
              <div className="grid gap-3">
                {!stoppedAt && (
                  <div className="grid grid-cols-4 gap-2">
                    {MINUTE_CHIPS.map((m) => (
                      <button
                        key={m}
                        type="button"
                        aria-pressed={parseNum(minutes) === m}
                        onClick={() => setMinutes(String(m))}
                        className={`tabular min-h-[48px] rounded-xl border font-mono text-sm transition-colors duration-150 motion-reduce:transition-none ${parseNum(minutes) === m ? 'border-inhalation bg-inhalation/10 text-inhalation' : 'border-line text-body'}`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                )}
                <NumberField id="log-minutes" label={t('log.minutes')} unit="min" value={minutes} onChange={setMinutes} error={minErr} />
                {stoppedAt && (
                  <button type="button" onClick={discardTimer} className={`${linkBtn} justify-self-start text-muted`}>
                    {t('log.discardSession')}
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </section>

      {/* Time and note: one quiet line until opened */}
      {!(route === 'inhalation' && timer) && (
        <div className="grid gap-3">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-sm">
            <span className="text-muted">
              {t('log.when')}: <span className="text-text">{whenSummary}</span>
              <button type="button" className={`${linkBtn} ml-2`} aria-expanded={whenOpen} onClick={() => setWhenOpen((o) => !o)}>
                {t('log.change')}
              </button>
            </span>
            {!notesOpen && (
              <button type="button" className={linkBtn} onClick={() => setNotesOpen(true)}>
                + {t('log.addNote')}
              </button>
            )}
          </div>
          {whenOpen && (
            <div className="grid gap-2">
              <div className="flex flex-wrap gap-2">
                {(['now', 'yesterday', 'pick'] as WhenMode[]).map((w) => (
                  <button
                    key={w}
                    type="button"
                    aria-pressed={whenMode === w}
                    onClick={() => {
                      setWhenMode(w);
                      if (w === 'pick') setPickValue(toLocalInput(new Date()));
                    }}
                    className={`min-h-tap rounded-xl border px-4 text-sm ${whenMode === w ? 'border-action bg-action/10 text-action' : 'border-line text-body'}`}
                  >
                    {t(w === 'now' ? 'log.now' : w === 'yesterday' ? 'log.yesterday' : 'log.pickTime')}
                  </button>
                ))}
              </div>
              {whenMode === 'pick' && (
                <input
                  id="log-when"
                  type="datetime-local"
                  value={pickValue}
                  max={toLocalInput(new Date())}
                  onChange={(e) => setPickValue(e.target.value)}
                  aria-invalid={pickedFuture}
                  className="min-h-tap rounded-xl border border-line bg-bg px-3 text-text focus:border-action focus:outline-none"
                />
              )}
              {pickedFuture && <p className="text-xs text-danger">{t('log.errorFuture')}</p>}
            </div>
          )}
          {notesOpen && (
            <textarea
              id="log-notes"
              rows={2}
              maxLength={500}
              value={notes}
              autoFocus
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('log.notes')}
              className="scroll-mb-56 rounded-xl border border-line bg-bg px-3 py-2 text-text placeholder:text-muted/60 focus:border-action focus:outline-none"
            />
          )}
        </div>
      )}

      {/* Result bar: the figure, its arithmetic (always shown) and Save stay on screen above the tab bar */}
      <section
        aria-live="polite"
        className="sticky bottom-[calc(96px+env(safe-area-inset-bottom,0px))] z-20 grid gap-3 rounded-card border border-line bg-surface p-4 before:pointer-events-none before:absolute before:inset-x-0 before:-top-6 before:h-6 before:bg-gradient-to-t before:from-bg before:to-transparent md:bottom-4"
      >
        <div className="flex items-end justify-between gap-3">
          <div className="grid min-w-0 gap-1">
            <span className={`flex items-baseline gap-2 ${formulaInput ? routeText : 'text-muted/50'}`}>
              <span className="text-figure-l">
                <Figure value={formatHQ(hq, locale)} />
              </span>
              <span className="font-mono text-small text-muted">HQ</span>
            </span>
            <span className="tabular font-mono text-small text-muted">{formatMg(hq * 0.8, locale)} mg H₂</span>
          </div>
          <button
            type="button"
            onClick={save}
            disabled={!canSave && !savedFlash}
            className={`min-h-[52px] min-w-[132px] shrink-0 rounded-xl bg-action px-5 text-[16px] font-semibold text-on-action transition-transform active:scale-[.98] motion-reduce:transition-none motion-reduce:active:scale-100 ${canSave || savedFlash ? '' : 'opacity-35'}`}
          >
            {savedFlash ? t('log.savedFlash') : saving ? t('log.saving') : t('log.save')}
          </button>
        </div>
        <p className="tabular break-words font-mono text-arith text-body">
          {math
            ? `${math.expression} = ${formatHQ(math.hq, locale)} HQ × 0.80 mg = ${formatMg(math.mg, locale)} mg H₂`
            : route === 'water'
              ? '(mL ÷ 500) × (mg/L ÷ 1.6)'
              : '(min ÷ 30) × (mL/min ÷ 300) × 2'}
        </p>
        {saveError && <p className="text-small text-danger">{saveError}</p>}
      </section>

      {/* One-tap repeat (item 5) */}
      {repeatable.length > 0 && (
        <section className="grid gap-2 border-t border-line pt-5" aria-labelledby="repeat-h">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3">
            <h2 id="repeat-h" className="font-mono text-[11px] uppercase tracking-[.12em] text-muted">
              {t('log.repeat')}
            </h2>
            <span className="text-xs text-muted">{t('log.repeatHint')}</span>
          </div>
          <div className="grid grid-cols-[minmax(0,1fr)] gap-2">
            {repeatable.map((e) => {
              const d = describe(e);
              return (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => repeat(e)}
                  className="flex min-h-[52px] items-center justify-between gap-3 rounded-xl border border-line px-3 text-left hover:border-muted"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <RouteIcon route={e.route} className={`h-4 w-4 shrink-0 ${routeColor(e.route)}`} />
                    <span className="grid min-w-0">
                      <span className="tabular truncate text-sm text-body">{d.body}</span>
                      {d.name && <span className="truncate text-xs text-muted">{d.name}</span>}
                    </span>
                  </span>
                  <span className="tabular shrink-0 font-mono text-sm text-text">{formatHQ(e.hq, locale)} HQ</span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {picker && (
        <DevicePicker
          route={route}
          devices={routeDevices}
          selectedId={deviceId}
          manualId={MANUAL}
          onPick={(id) => {
            setDeviceId(id);
            setPicker(false);
          }}
          onAdd={() => {
            setPicker(false);
            setSheet(true);
          }}
          onClose={() => setPicker(false)}
        />
      )}

      {sheet && (
        <DeviceSheet
          route={route}
          onClose={() => setSheet(false)}
          onSaved={(d) => {
            setSheet(false);
            setRoute(d.route);
            setDevices((cur) => [...cur, d]);
            setDeviceId(d.id);
            rememberDevice(d.route, d.id);
          }}
        />
      )}
    </div>
  );
}
