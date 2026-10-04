import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { loadPrefs, readJSON, savePrefs, uuid, writeJSON } from '../../store/localStore';
import type { Device, Entry } from '../../store/types';
import { DeviceSheet } from './DeviceSheet';
import { RouteIcon } from '../../app/RouteIcon';
import { LIMITS, NumberField, formatClock, parseNum, toLocalInput, validate } from './fields';

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

function routeColor(r: Route) {
  return r === 'water' ? 'text-water' : 'text-inhalation';
}

export function LogScreen() {
  const { t, store, version, bump, toast, locale } = useApp();
  const prefs = useMemo(loadPrefs, []);

  const [route, setRoute] = useState<Route>(prefs.lastRoute);
  const [devices, setDevices] = useState<Device[]>([]);
  const [recent, setRecent] = useState<Entry[]>([]);
  const [deviceId, setDeviceId] = useState<string>(MANUAL);
  const [sheet, setSheet] = useState(false);

  // values as typed
  const [volume, setVolume] = useState('');
  const [conc, setConc] = useState('');
  const [flow, setFlow] = useState('');
  const [minutes, setMinutes] = useState('');
  const [inhMode, setInhMode] = useState<InhalationMode>('timer');
  const [notes, setNotes] = useState('');

  const [whenMode, setWhenMode] = useState<WhenMode>('now');
  const [pickValue, setPickValue] = useState(() => toLocalInput(new Date()));

  const [timer, setTimer] = useState<TimerState | null>(() => readJSON<TimerState | null>(TIMER_KEY, null));
  const [now, setNow] = useState(Date.now());
  const [pourNoteSeen, setPourNoteSeen] = useState(prefs.pourNoteSeen);

  const [showMath, setShowMath] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  // Double-save guard (item 9): one request id per form; a repeat tap reuses it and the store ignores the duplicate.
  const requestId = useRef(uuid());

  /* -------------------------------------------------------- load data */
  useEffect(() => {
    let live = true;
    Promise.all([store.listDevices(), store.listEntries({ limit: 30 })]).then(([d, e]) => {
      if (!live) return;
      setDevices(d);
      setRecent(e);
    });
    return () => {
      live = false;
    };
  }, [store, version]);

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
  const flowValue = device?.h2FlowMlMin ?? parseNum(flow);
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
  const canSave = !!formulaInput && !saving && !timerBlocking && !(whenMode === 'pick' && Number.isNaN(new Date(pickValue).getTime()));

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
    setShowMath(false);
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
      bump();
      toast(t('log.saved', { hq: formatHQ(saved.hq, locale) }), {
        label: t('log.undo'),
        run: async () => {
          await store.deleteEntry(saved.id);
          bump();
          toast(t('log.removed'));
        },
      });
    } catch {
      setSaveError(t('log.errorSave'));
    } finally {
      setSaving(false);
    }
  }

  async function repeat(e: Entry) {
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
        await store.deleteEntry(saved.id);
        bump();
        toast(t('log.removed'));
      },
    });
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
  const selected = route === 'water' ? 'border-water bg-water/10 text-text' : 'border-inhalation bg-inhalation/10 text-text';

  /* ------------------------------------------------------------- render */
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-5">
      <h1 className="font-mono text-sm uppercase tracking-[.14em] text-text">{t('log.title')}</h1>

      {/* Route */}
      <div className="grid grid-cols-2 gap-1 rounded-full border border-line bg-surface p-1" role="radiogroup" aria-label={t('log.routeLabel')}>
        {(['inhalation', 'water'] as Route[]).map((r) => (
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
            className={`flex min-h-tap items-center justify-center gap-2 rounded-full text-sm transition-colors disabled:opacity-40 ${
              route === r ? (r === 'water' ? 'bg-water/15 text-water' : 'bg-inhalation/15 text-inhalation') : 'text-muted hover:text-body'
            }`}
          >
            <RouteIcon route={r} />
            {t(r === 'water' ? 'route.water' : 'route.inhalation')}
          </button>
        ))}
      </div>

      {/* Equipment */}
      <section className="grid gap-2" aria-labelledby="equip-h">
        <h2 id="equip-h" className="font-mono text-[11px] uppercase tracking-[.1em] text-muted">
          {t('log.equipment')}
        </h2>
        <div className="flex flex-wrap gap-2">
          {routeDevices.map((d) => (
            <button
              key={d.id}
              type="button"
              disabled={!!timer}
              aria-pressed={deviceId === d.id}
              onClick={() => setDeviceId(d.id)}
              className={`min-h-tap rounded-xl border px-3 py-1.5 text-left text-sm transition-colors disabled:opacity-60 ${
                deviceId === d.id ? selected : 'border-line text-body hover:border-muted'
              }`}
            >
              <span className="block leading-tight">{d.name}{d.modeLabel ? ` · ${d.modeLabel}` : ''}</span>
              <span className={`tabular block font-mono text-[11px] ${routeColor(d.route)}`}>
                {d.route === 'inhalation' ? `${formatInput(d.h2FlowMlMin!, locale)} mL/min H₂` : `${formatInput(d.concentrationMgL!, locale)} mg/L`}
              </span>
            </button>
          ))}
          <button
            type="button"
            disabled={!!timer}
            aria-pressed={deviceId === MANUAL}
            onClick={() => setDeviceId(MANUAL)}
            className={`min-h-tap rounded-xl border px-3 text-sm disabled:opacity-60 ${deviceId === MANUAL ? selected : 'border-line text-body'}`}
          >
            {t('log.manual')}
          </button>
          <button type="button" disabled={!!timer} onClick={() => setSheet(true)} className="min-h-tap rounded-xl border border-dashed border-line px-3 text-sm text-muted hover:text-body disabled:opacity-60">
            + {t('log.addEquipment')}
          </button>
        </div>
      </section>

      {/* Inputs */}
      <section className="grid grid-cols-[minmax(0,1fr)] gap-4 rounded-card border border-line bg-surface p-4">
        {route === 'water' ? (
          <>
            {!pourNoteSeen && (
              <div className="flex items-start gap-3 rounded-xl border border-water/30 bg-water/5 p-3 text-sm text-body">
                <p className="flex-1 leading-relaxed">{t('log.pourNote')}</p>
                <button
                  type="button"
                  className="min-h-tap shrink-0 px-2 font-mono text-xs uppercase tracking-wider text-water"
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
            <div className="grid gap-2">
              <span className="text-base text-text">{t('log.howMuchDrank')}</span>
              <div className="flex flex-wrap gap-2">
                {WATER_CHIPS.map((ml) => (
                  <button
                    key={ml}
                    type="button"
                    aria-pressed={parseNum(volume) === ml}
                    onClick={() => setVolume(String(ml))}
                    className={`tabular min-h-tap rounded-xl border px-4 font-mono text-sm ${parseNum(volume) === ml ? 'border-water bg-water/10 text-water' : 'border-line text-body'}`}
                  >
                    {ml} mL
                  </button>
                ))}
              </div>
            </div>
            <NumberField id="log-volume" label={t('log.volume')} unit="mL" value={volume} onChange={setVolume} error={volErr} />
            {device ? null : (
              <NumberField
                id="log-conc"
                label={t('log.concentration')}
                unit="mg/L"
                value={conc}
                onChange={setConc}
                error={concErr}
              />
            )}
            {equiv && !concErr && (
              <p className="tabular font-mono text-xs text-muted">
                {t('log.concEquiv', {
                  mgL: formatInput(equiv.mgL, locale),
                  ppm: formatInput(equiv.ppm, locale),
                  ppb: formatInput(equiv.ppb, locale),
                })}
              </p>
            )}
          </>
        ) : (
          <>
            {device ? null : (
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

            <div className="grid grid-cols-2 gap-1 rounded-full border border-line bg-bg p-1" role="radiogroup" aria-label={t('log.minutes')}>
              {(['timer', 'manual'] as InhalationMode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  role="radio"
                  aria-checked={inhMode === m}
                  disabled={!!timer && m === 'manual'}
                  onClick={() => setInhMode(m)}
                  className={`min-h-tap rounded-full text-sm disabled:opacity-40 ${inhMode === m ? 'bg-inhalation/15 text-inhalation' : 'text-muted'}`}
                >
                  {t(m === 'timer' ? 'log.timer' : 'log.enterMinutes')}
                </button>
              ))}
            </div>

            {inhMode === 'timer' && !stoppedAt && (
              <div className="grid justify-items-center gap-3 py-2">
                <span className="tabular font-mono text-5xl font-medium text-text" aria-live="off">
                  {formatClock(timer ? now - timer.startedAt : 0)}
                </span>
                {timer ? (
                  <>
                    <p className="max-w-sm text-center text-xs leading-relaxed text-muted">{t('log.sessionRunning')}</p>
                    <div className="grid w-full max-w-xs grid-cols-2 gap-3">
                      <button type="button" onClick={discardTimer} className="min-h-tap rounded-xl border border-line text-sm text-body">
                        {t('log.discardSession')}
                      </button>
                      <button type="button" onClick={stopTimer} className="min-h-tap rounded-xl bg-inhalation text-sm font-bold text-bg">
                        {t('log.stopSession')}
                      </button>
                    </div>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={startTimer}
                    disabled={!(flowValue > 0) || !!flowErr}
                    className="min-h-tap w-full max-w-xs rounded-xl bg-inhalation text-sm font-bold text-bg disabled:opacity-40"
                  >
                    {t('log.startSession')}
                  </button>
                )}
              </div>
            )}

            {(inhMode === 'manual' || stoppedAt) && (
              <NumberField id="log-minutes" label={t('log.minutes')} unit="min" value={minutes} onChange={setMinutes} error={minErr} />
            )}
            {stoppedAt && (
              <button type="button" onClick={discardTimer} className="min-h-tap justify-self-start px-1 font-mono text-xs uppercase tracking-wider text-muted hover:text-body">
                {t('log.discardSession')}
              </button>
            )}
          </>
        )}
      </section>

      {/* Live HQ with the arithmetic (item 3) */}
      <section className="grid justify-items-center gap-1 rounded-card border border-line bg-surface px-4 py-5" aria-live="polite">
        <span className="font-mono text-[11px] uppercase tracking-[.12em] text-muted">{t('log.thisEntry')}</span>
        <span className={`tabular text-5xl font-bold ${formulaInput ? `${routeColor(route)} glow-water` : 'text-muted/50'}`} style={route === 'inhalation' && formulaInput ? { textShadow: '0 0 10px rgb(var(--inhalation) / .6), 0 0 22px rgb(var(--inhalation) / .3)' } : undefined}>
          {formatHQ(hq, locale)}
        </span>
        <span className="font-mono text-xs text-body">
          HQ · {formatMg(hq * 0.8, locale)} mg H₂
        </span>
        {math && (
          <>
            <button type="button" onClick={() => setShowMath((s) => !s)} aria-expanded={showMath} className="mt-1 min-h-tap px-3 font-mono text-xs text-water underline-offset-4 hover:underline">
              {t(showMath ? 'log.hideMath' : 'log.showMath')}
            </button>
            {showMath && (
              <div className="tabular w-full max-w-md rounded-xl border border-line bg-bg p-3 text-center font-mono text-xs leading-relaxed text-body">
                <div className="break-words">{math.expression}</div>
                <div className="text-text">
                  = {formatHQ(math.hq, locale)} HQ × 0.80 mg = {formatMg(math.mg, locale)} mg H₂
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {/* When */}
      {!(route === 'inhalation' && timer) && (
        <section className="grid gap-2" aria-labelledby="when-h">
          <h2 id="when-h" className="font-mono text-[11px] uppercase tracking-[.1em] text-muted">
            {t('log.when')}
          </h2>
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
                className={`min-h-tap rounded-xl border px-4 text-sm ${whenMode === w ? 'border-water bg-water/10 text-water' : 'border-line text-body'}`}
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
              className="min-h-tap rounded-xl border border-line bg-bg px-3 text-text focus:border-water focus:outline-none"
            />
          )}
        </section>
      )}

      <label className="grid gap-1.5">
        <span className="font-mono text-[11px] uppercase tracking-[.1em] text-muted">{t('log.notes')}</span>
        <textarea
          id="log-notes"
          rows={2}
          maxLength={500}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="rounded-xl border border-line bg-bg px-3 py-2 text-text focus:border-water focus:outline-none"
        />
      </label>

      {saveError && <p className="text-sm text-danger">{saveError}</p>}
      <button
        type="button"
        onClick={save}
        disabled={!canSave}
        className={`min-h-[52px] rounded-xl text-base font-bold text-bg transition-opacity disabled:opacity-35 ${route === 'water' ? 'bg-water' : 'bg-inhalation'}`}
      >
        {saving ? t('log.saving') : t('log.save')}
      </button>

      {/* One-tap repeat (item 5) */}
      {repeatable.length > 0 && (
        <section className="grid gap-2 pt-2" aria-labelledby="repeat-h">
          <div>
            <h2 id="repeat-h" className="font-mono text-[11px] uppercase tracking-[.1em] text-muted">
              {t('log.repeat')}
            </h2>
            <p className="text-xs text-muted">{t('log.repeatHint')}</p>
          </div>
          <div className="grid grid-cols-[minmax(0,1fr)] gap-2">
            {repeatable.map((e) => {
              const d = describe(e);
              return (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => repeat(e)}
                  className="flex min-h-tap items-center justify-between gap-3 rounded-xl border border-line bg-surface px-3 py-2 text-left hover:border-muted"
                >
                  <span className="min-w-0 flex-1">
                    <span className={`flex min-w-0 items-center gap-2 font-mono text-[11px] uppercase tracking-wider ${routeColor(e.route)}`}>
                      <RouteIcon route={e.route} className="h-3.5 w-3.5 shrink-0" />
                      {t(e.route === 'water' ? 'route.water' : 'route.inhalation')}
                      {d.name && <span className="truncate normal-case tracking-normal text-muted">· {d.name}</span>}
                    </span>
                    <span className="tabular block text-sm text-body">{d.body}</span>
                  </span>
                  <span className="tabular shrink-0 font-mono text-sm text-text">{formatHQ(e.hq, locale)} HQ</span>
                </button>
              );
            })}
          </div>
        </section>
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
