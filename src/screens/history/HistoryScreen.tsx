import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../app/context';
import { RouteIcon } from '../../app/RouteIcon';
import {
  MG_PER_HQ,
  addDays,
  formatHQ,
  formatInput,
  formatMg,
  localDateOf,
  showTheMath,
  summarizeDay,
  type Route,
} from '../../lib/hq';
import type { Device, Entry } from '../../store/types';
import { EditSheet } from './EditSheet';
import { TrendsChart, type DayBar } from './TrendsChart';

type RouteFilter = 'all' | Route;
const RANGES = [7, 30, 90, 0] as const; // 0 = all time
const TREND_RANGES = [14, 30] as const;

const chip = (on: boolean) =>
  `min-h-tap rounded-full border px-4 text-sm ${on ? 'border-water bg-water/10 text-water' : 'border-line text-body hover:border-muted'}`;

function mathFor(e: Entry, locale: string) {
  return e.route === 'water'
    ? showTheMath({ route: 'water', volumeMl: e.volumeMl!, concentrationMgL: e.concentrationMgL! }, locale)
    : showTheMath({ route: 'inhalation', minutes: e.minutes!, h2FlowMlMin: e.h2FlowMlMin! }, locale);
}

export function HistoryScreen() {
  const { t } = useApp();
  const { pathname } = useLocation();
  const nav = useNavigate();
  const view = pathname === '/trends' ? 'trends' : 'list';

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-6">
      <h1 className="pt-2 text-center text-[2rem] font-bold uppercase leading-none tracking-[.12em] text-water sm:text-[2.6rem]">{t('history.title')}</h1>
      <div className="grid grid-cols-2 gap-1 rounded-full border border-line bg-surface p-1" role="tablist" aria-label={t('history.title')}>
        {(['list', 'trends'] as const).map((v) => (
          <button
            key={v}
            type="button"
            role="tab"
            aria-selected={view === v}
            onClick={() => nav(v === 'list' ? '/history' : '/trends')}
            className={`min-h-[48px] rounded-full text-[15px] ${view === v ? 'bg-water/15 text-water' : 'text-muted hover:text-body'}`}
          >
            {t(v === 'list' ? 'history.list' : 'history.trends')}
          </button>
        ))}
      </div>
      {view === 'list' ? <EntryList /> : <TrendsView />}
    </div>
  );
}

/* ================================================================== list */
function EntryList() {
  const { t, store, version, bump, toast, locale } = useApp();
  const [routeF, setRouteF] = useState<RouteFilter>('all');
  const [range, setRange] = useState<(typeof RANGES)[number]>(30);
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const [armed, setArmed] = useState<string | null>(null);
  const [editing, setEditing] = useState<Entry | null>(null);

  useEffect(() => {
    let live = true;
    const today = localDateOf(new Date()).localDate;
    // "All time" returns up to the newest 1,000 entries (the API's per-response cap).
    Promise.all([store.listEntries(range ? { fromDate: addDays(today, -(range - 1)) } : {}), store.listDevices()]).then(([e, d]) => {
      if (!live) return;
      setEntries(e);
      setDevices(d);
    });
    return () => {
      live = false;
    };
  }, [store, version, range]);

  useEffect(() => {
    if (!armed) return;
    const id = window.setTimeout(() => setArmed(null), 4000);
    return () => window.clearTimeout(id);
  }, [armed]);

  const filtered = (entries ?? []).filter((e) => routeF === 'all' || e.route === routeF);
  const groups = useMemo(() => {
    const m = new Map<string, Entry[]>();
    for (const e of filtered) m.set(e.localDate, [...(m.get(e.localDate) ?? []), e]);
    return [...m.entries()];
  }, [filtered]);

  const dayLabel = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString(locale, { weekday: 'short', month: 'short', day: 'numeric' });
  const time = (iso: string) => new Date(iso).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
  const deviceName = (id: string | null) => devices.find((d) => d.id === id)?.name;

  async function remove(e: Entry) {
    await store.deleteEntry(e.id);
    setArmed(null);
    setOpen(null);
    bump();
    toast(t('log.removed'));
  }

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-5">
      {/* Filters, one block above the list */}
      <div className="grid gap-2">
        <div className="flex flex-wrap gap-2" role="group" aria-label={t('log.routeLabel')}>
          {(['all', 'water', 'inhalation'] as RouteFilter[]).map((r) => (
            <button key={r} type="button" aria-pressed={routeF === r} onClick={() => setRouteF(r)} className={`${chip(routeF === r)} flex items-center gap-2`}>
              {r !== 'all' && <RouteIcon route={r} className="h-3.5 w-3.5" />}
              {t(r === 'all' ? 'history.all' : r === 'water' ? 'route.water' : 'route.inhalation')}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label={t('log.when')}>
          {RANGES.map((n) => (
            <button key={n} type="button" aria-pressed={range === n} onClick={() => setRange(n)} className={chip(range === n)}>
              {n ? t('history.days', { n }) : t('history.allTime')}
            </button>
          ))}
        </div>
      </div>

      {entries === null ? (
        <p className="text-center text-sm text-muted">{t('history.loading')}</p>
      ) : groups.length === 0 ? (
        <p className="rounded-card border border-dashed border-line p-6 text-center text-sm text-muted">{t('history.empty')}</p>
      ) : (
        groups.map(([date, list]) => {
          // Day totals and the badge always use every route that day, whatever the filter shows.
          const day = summarizeDay((entries ?? []).filter((e) => e.localDate === date));
          return (
            <section key={date} className="grid gap-2" aria-label={dayLabel(date)}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 px-1">
                <h2 className="font-mono text-xs uppercase tracking-[.12em] text-text">{dayLabel(date)}</h2>
                <span className="flex items-center gap-2">
                  {day.bothRoutes && (
                    <span className="rounded-full border border-gold/60 bg-gold/10 px-2 py-0.5 font-mono text-[10px] text-gold">{t(date === localDateOf(new Date()).localDate ? 'today.bothRoutes' : 'history.bothRoutes')}</span>
                  )}
                  <span className="tabular font-mono text-sm text-text">{formatHQ(day.total, locale)} HQ</span>
                </span>
              </div>
              <div className="grid grid-cols-[minmax(0,1fr)] gap-2">
                {list.map((e) => {
                  const isOpen = open === e.id;
                  const color = e.route === 'water' ? 'text-water' : 'text-inhalation';
                  const body =
                    e.route === 'water'
                      ? `${formatInput(e.volumeMl!, locale)} mL @ ${formatInput(e.concentrationMgL!, locale)} mg/L`
                      : `${formatInput(e.minutes!, locale)} min @ ${formatInput(e.h2FlowMlMin!, locale)} mL/min`;
                  return (
                    <div key={e.id} className={`rounded-xl border bg-surface ${isOpen ? 'border-muted' : 'border-line'}`}>
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        onClick={() => {
                          setOpen(isOpen ? null : e.id);
                          setArmed(null);
                        }}
                        className="flex min-h-[56px] w-full items-center justify-between gap-3 px-3 py-2 text-left"
                      >
                        <span className="flex min-w-0 items-center gap-3">
                          <RouteIcon route={e.route} className={`h-4 w-4 shrink-0 ${color}`} />
                          <span className="grid min-w-0">
                            <span className="tabular truncate text-sm text-body">
                              <span className="font-mono text-xs text-muted">{time(e.sessionStart)}</span> · {body}
                            </span>
                            {deviceName(e.deviceId) && <span className="truncate text-xs text-muted">{deviceName(e.deviceId)}</span>}
                          </span>
                        </span>
                        <span className="tabular shrink-0 font-mono text-base font-medium text-text">{formatHQ(e.hq, locale)}</span>
                      </button>
                      {isOpen && (
                        <div className="grid gap-3 border-t border-line px-3 pb-3 pt-3">
                          <p className="tabular rounded-lg bg-bg p-2 text-center font-mono text-[11px] leading-relaxed text-body">
                            {mathFor(e, locale).expression} = {formatHQ(e.hq, locale)} HQ = {formatMg(e.hq * MG_PER_HQ, locale)} mg H₂
                          </p>
                          {e.notes && <p className="whitespace-pre-wrap break-words text-sm text-body">{e.notes}</p>}
                          <div className="flex flex-wrap justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => (armed === e.id ? remove(e) : setArmed(e.id))}
                              className={`min-h-tap rounded-xl border px-4 text-sm ${armed === e.id ? 'border-danger bg-danger/10 text-danger' : 'border-line text-muted hover:text-body'}`}
                            >
                              {armed === e.id ? t('history.confirmDelete') : t('history.delete')}
                            </button>
                            <button type="button" onClick={() => setEditing(e)} className="min-h-tap rounded-xl border border-water/60 px-4 text-sm text-water">
                              {t('history.edit')}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })
      )}

      {editing && (
        <EditSheet
          entry={editing}
          onClose={() => setEditing(null)}
          onSaved={(saved) => {
            setEditing(null);
            bump();
            toast(t('history.updated', { hq: formatHQ(saved.hq, locale) }));
          }}
        />
      )}
    </div>
  );
}

/* ================================================================ trends */
function TrendsView() {
  const { t, store, version, locale } = useApp();
  const [n, setN] = useState<(typeof TREND_RANGES)[number]>(14);
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const today = localDateOf(new Date()).localDate;

  useEffect(() => {
    let live = true;
    store.listEntries({ fromDate: addDays(today, -(n - 1)), toDate: today }).then((e) => live && setEntries(e));
    return () => {
      live = false;
    };
  }, [store, version, n, today]);

  const days: DayBar[] = useMemo(() => {
    const out: DayBar[] = [];
    for (let i = n - 1; i >= 0; i--) {
      const date = addDays(today, -i);
      const s = summarizeDay((entries ?? []).filter((e) => e.localDate === date));
      out.push({ date, water: s.water, inhalation: s.inhalation });
    }
    return out;
  }, [entries, n, today]);

  const totals = days.map((d) => d.water + d.inhalation);
  const avg = totals.reduce((a, b) => a + b, 0) / n;
  const logged = days.filter((d) => d.water + d.inhalation > 0).length;
  const both = days.filter((d) => d.water > 0 && d.inhalation > 0).length;
  const sel = days.find((d) => d.date === selected) ?? null;
  const dayLabel = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString(locale, { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-5">
      <div className="flex flex-wrap gap-2" role="group" aria-label={t('log.when')}>
        {TREND_RANGES.map((r) => (
          <button key={r} type="button" aria-pressed={n === r} onClick={() => { setN(r); setSelected(null); }} className={chip(n === r)}>
            {t('history.days', { n: r })}
          </button>
        ))}
      </div>

      <section className="grid gap-3 rounded-[20px] border border-line bg-surface p-4" aria-labelledby="trend-h">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <h2 id="trend-h" className="font-mono text-[11px] uppercase tracking-[.12em] text-muted">{t('trends.title')}</h2>
          {/* legend: two series, text in text colors beside a colored swatch */}
          <div className="flex items-center gap-4 text-xs text-body">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-water" aria-hidden="true" />{t('route.water')}</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-inhalation" aria-hidden="true" />{t('route.inhalation')}</span>
            <span className="flex items-center gap-1.5"><span className="h-px w-4 bg-text/75" aria-hidden="true" />{t('trends.reference')}</span>
          </div>
        </div>
        {entries === null ? (
          <p className="py-16 text-center text-sm text-muted">{t('history.loading')}</p>
        ) : (
          <TrendsChart days={days} locale={locale} selected={selected} onSelect={setSelected} label={t('trends.chartLabel', { n })} />
        )}
        <p className="tabular min-h-[2.5rem] text-sm text-body" aria-live="polite">
          {sel ? (
            <>
              <span className="text-text">{dayLabel(sel.date)}</span>
              {' · '}
              {t('route.water')} {formatHQ(sel.water, locale)} + {t('route.inhalation')} {formatHQ(sel.inhalation, locale)} ={' '}
              <span className="font-medium text-text">{formatHQ(sel.water + sel.inhalation, locale)} HQ</span>
            </>
          ) : (
            <span className="text-muted">{t('trends.tapHint')}</span>
          )}
        </p>
      </section>

      <div className="grid divide-y divide-line rounded-card border border-line bg-surface">
        <div className="grid gap-1 px-4 py-3">
          <div className="flex items-baseline justify-between gap-4">
            <span className="font-mono text-[11px] uppercase tracking-[.1em] text-muted">{t('trends.avg')}</span>
            <span className="tabular font-mono text-text">{formatHQ(avg, locale)} HQ</span>
          </div>
          <span className="text-xs text-muted">{t('trends.avgDef')}</span>
        </div>
        <div className="flex items-baseline justify-between gap-4 px-4 py-3">
          <span className="font-mono text-[11px] uppercase tracking-[.1em] text-muted">{t('trends.daysLogged')}</span>
          <span className="tabular font-mono text-text">{t('trends.ofN', { n: logged, total: n })}</span>
        </div>
        <div className="flex items-baseline justify-between gap-4 px-4 py-3">
          <span className="font-mono text-[11px] uppercase tracking-[.1em] text-muted">{t('trends.bothDays')}</span>
          <span className="tabular font-mono text-text">{t('trends.ofN', { n: both, total: n })}</span>
        </div>
      </div>
    </div>
  );
}
