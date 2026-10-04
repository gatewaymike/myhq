import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../app/context';
import { RouteIcon } from '../../app/RouteIcon';
import {
  MG_PER_HQ,
  SEVEN_DAY_WINDOW,
  addDays,
  formatHQ,
  formatInput,
  formatMg,
  localDateOf,
  sevenDayAverage,
  showTheMath,
  summarizeDay,
} from '../../lib/hq';
import type { Device, Entry } from '../../store/types';
import { Ring } from './Ring';

function entryMath(e: Entry, locale: string) {
  return e.route === 'water'
    ? showTheMath({ route: 'water', volumeMl: e.volumeMl!, concentrationMgL: e.concentrationMgL! }, locale)
    : showTheMath({ route: 'inhalation', minutes: e.minutes!, h2FlowMlMin: e.h2FlowMlMin! }, locale);
}

export function TodayScreen() {
  const { t, store, version, locale } = useApp();
  const [today, setToday] = useState(() => localDateOf(new Date()).localDate);
  const [week, setWeek] = useState<Entry[] | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [lifetime, setLifetime] = useState<number | null>(null);
  const [showMath, setShowMath] = useState(false);
  const [openEntry, setOpenEntry] = useState<string | null>(null);
  const [about, setAbout] = useState(false);

  // Roll over at local midnight while the screen stays open.
  useEffect(() => {
    const id = window.setInterval(() => setToday(localDateOf(new Date()).localDate), 60_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    let live = true;
    Promise.all([
      store.listEntries({ fromDate: addDays(today, -(SEVEN_DAY_WINDOW - 1)), toDate: today }),
      store.listDevices(),
      store.lifetimeHQ(),
    ]).then(([e, d, l]) => {
      if (!live) return;
      setWeek(e);
      setDevices(d);
      setLifetime(l);
    });
    return () => {
      live = false;
    };
  }, [store, version, today]);

  const todays = (week ?? []).filter((e) => e.localDate === today);
  const day = summarizeDay(todays);
  const avg = sevenDayAverage(week ?? [], today);
  const weekSum = avg * SEVEN_DAY_WINDOW;
  const glow = { textShadow: '0 0 10px rgb(var(--water) / .7), 0 0 22px rgb(var(--water) / .35)' };
  const dateLabel = new Date(`${today}T12:00:00`).toLocaleDateString(locale, { weekday: 'short', month: 'short', day: 'numeric' });
  const time = (iso: string) => new Date(iso).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
  const deviceName = (id: string | null) => devices.find((d) => d.id === id)?.name;

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-6">
      <div className="grid justify-items-center gap-2 pt-2">
        <div className="flex items-center gap-3">
          <h1 className="text-center text-[2rem] font-bold uppercase leading-none tracking-[.12em] text-water sm:text-[2.6rem]">{t('today.title')}</h1>
          <button
            type="button"
            onClick={() => setAbout(true)}
            aria-label={t('today.about')}
            className="grid h-11 w-11 place-content-center rounded-full text-water hover:bg-water/10"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <span className="font-mono text-xs uppercase tracking-[.14em] text-muted">{dateLabel}</span>
      </div>

      {/* Ring */}
      <div className="relative mx-auto aspect-square w-full max-w-[300px]">
        <Ring water={day.water} inhalation={day.inhalation} locale={locale} label={`${formatHQ(day.total, locale)} ${t('today.hqToday')}`} />
        <div className="pointer-events-none absolute inset-0 grid place-content-center gap-1 text-center">
          <span className={`tabular text-[3.6rem] font-bold leading-none ${day.total > 0 ? 'text-water' : 'text-muted/50'}`} style={day.total > 0 ? glow : undefined}>
            {formatHQ(day.total, locale)}
          </span>
          <span className="font-mono text-xs uppercase tracking-[.14em] text-text">{t('today.hqToday')}</span>
          <span className="tabular font-mono text-xs text-muted">{formatMg(day.total * MG_PER_HQ, locale)} mg H₂</span>
        </div>
      </div>

      {day.bothRoutes && (
        <span className="inline-flex items-center gap-2 justify-self-center rounded-full border border-gold/60 bg-gold/10 px-4 py-1.5 font-mono text-xs tracking-wide text-gold">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5" aria-hidden="true">
            <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {t('today.bothRoutes')}
        </span>
      )}

      {/* Route split */}
      <div className="grid grid-cols-2 gap-3">
        {(['water', 'inhalation'] as const).map((r) => {
          const v = r === 'water' ? day.water : day.inhalation;
          const color = r === 'water' ? 'text-water' : 'text-inhalation';
          return (
            <div key={r} className="grid gap-1 rounded-card border border-line bg-surface p-4">
              <span className={`flex items-center gap-2 font-mono text-[11px] uppercase tracking-[.1em] ${color}`}>
                <RouteIcon route={r} className="h-4 w-4" />
                {t(r === 'water' ? 'route.water' : 'route.inhalation')}
              </span>
              <span className="tabular text-2xl font-bold text-text">{formatHQ(v, locale)}</span>
              <span className="tabular font-mono text-[11px] text-muted">{formatMg(v * MG_PER_HQ, locale)} mg H₂</span>
            </div>
          );
        })}
      </div>

      {/* The arithmetic behind today's figure (item 3) */}
      {todays.length > 0 && (
        <div className="grid justify-items-center gap-2">
          <button type="button" onClick={() => setShowMath((s) => !s)} aria-expanded={showMath} className="min-h-tap px-2 font-mono text-xs text-water">
            {t(showMath ? 'log.hideMath' : 'log.showMath')}
          </button>
          {showMath && (
            <div className="tabular grid w-full gap-1.5 rounded-xl border border-line bg-bg p-3 font-mono text-xs leading-relaxed text-body">
              {todays
                .slice()
                .reverse()
                .map((e) => {
                  const m = entryMath(e, locale);
                  return (
                    <div key={e.id} className="flex flex-wrap justify-between gap-x-3">
                      <span className="break-words">{m.expression}</span>
                      <span className="text-text">= {formatHQ(m.hq, locale)}</span>
                    </div>
                  );
                })}
              <div className="mt-1 border-t border-line pt-2 text-text">
                {formatHQ(day.water, locale)} + {formatHQ(day.inhalation, locale)} = {formatHQ(day.total, locale)} HQ × 0.80 mg = {formatMg(day.total * MG_PER_HQ, locale)} mg H₂
              </div>
            </div>
          )}
        </div>
      )}

      {/* 7-day average (one labeled definition, item 16) and lifetime */}
      <div className="grid divide-y divide-line rounded-card border border-line bg-surface">
        <div className="grid gap-1 px-4 py-3">
          <div className="flex items-baseline justify-between gap-4">
            <span className="font-mono text-[11px] uppercase tracking-[.1em] text-muted">{t('today.sevenDayAvg')}</span>
            <span className="tabular font-mono text-text">{formatHQ(avg, locale)} HQ</span>
          </div>
          <span className="tabular text-xs text-muted">
            {t('today.sevenDayAvgDef')}: {formatHQ(weekSum, locale)} ÷ {SEVEN_DAY_WINDOW}
          </span>
        </div>
        <div className="flex items-baseline justify-between gap-4 px-4 py-3">
          <span className="font-mono text-[11px] uppercase tracking-[.1em] text-muted">{t('today.lifetime')}</span>
          <span className="tabular font-mono text-text">{lifetime === null ? '…' : `${formatHQ(lifetime, locale)} HQ`}</span>
        </div>
      </div>

      {/* Today's entries */}
      <section className="grid gap-2" aria-labelledby="today-entries-h">
        <h2 id="today-entries-h" className="font-mono text-[11px] uppercase tracking-[.12em] text-muted">
          {t('today.entries')}
        </h2>
        {week !== null && todays.length === 0 ? (
          <div className="grid justify-items-center gap-3 rounded-card border border-dashed border-line p-6 text-center">
            <p className="text-sm text-muted">{t('today.empty')}</p>
            <Link to="/log" className="grid min-h-[48px] place-content-center rounded-xl bg-water px-6 text-sm font-bold text-bg">
              {t('today.logFirst')}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-[minmax(0,1fr)] gap-2">
            {todays.map((e) => {
              const m = entryMath(e, locale);
              const color = e.route === 'water' ? 'text-water' : 'text-inhalation';
              const open = openEntry === e.id;
              const body =
                e.route === 'water'
                  ? `${formatInput(e.volumeMl!, locale)} mL · ${formatInput(e.concentrationMgL!, locale)} mg/L`
                  : `${formatInput(e.minutes!, locale)} min · ${formatInput(e.h2FlowMlMin!, locale)} mL/min`;
              return (
                <button
                  key={e.id}
                  type="button"
                  aria-expanded={open}
                  onClick={() => setOpenEntry(open ? null : e.id)}
                  className="grid gap-2 rounded-xl border border-line bg-surface px-3 py-2.5 text-left hover:border-muted"
                >
                  <span className="flex items-center justify-between gap-3">
                    <span className="flex min-w-0 items-center gap-3">
                      <RouteIcon route={e.route} className={`h-4 w-4 shrink-0 ${color}`} />
                      <span className="grid min-w-0">
                        <span className="tabular truncate text-sm text-body">
                          <span className="font-mono text-xs text-muted">{time(e.sessionStart)}</span> · {body}
                        </span>
                        {deviceName(e.deviceId) && <span className="truncate text-xs text-muted">{deviceName(e.deviceId)}</span>}
                      </span>
                    </span>
                    <span className="tabular shrink-0 font-mono text-sm text-text">{formatHQ(e.hq, locale)} HQ</span>
                  </span>
                  {open && (
                    <span className="tabular block rounded-lg bg-bg p-2 text-center font-mono text-[11px] leading-relaxed text-body">
                      {m.expression} = {formatHQ(e.hq, locale)} HQ = {formatMg(e.hq * MG_PER_HQ, locale)} mg H₂
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </section>

      {about && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70 sm:items-center" onClick={() => setAbout(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="about-h"
            className="grid w-full max-w-md gap-4 rounded-t-[20px] border border-water/60 bg-surface p-5 text-sm leading-relaxed text-body shadow-[0_0_25px_rgb(var(--water)/.25)] sm:rounded-[20px]"
            style={{ paddingBottom: 'calc(20px + env(safe-area-inset-bottom, 0px))' }}
            onClick={(ev) => ev.stopPropagation()}
          >
            <h2 id="about-h" className="font-mono text-sm uppercase tracking-[.12em] text-text">{t('today.about')}</h2>
            <p>{t('today.aboutHQ')}</p>
            <p>{t('today.aboutRef')}</p>
            <p>{t('today.aboutBoth')}</p>
            <p>{t('today.aboutAvg')}</p>
            <button type="button" onClick={() => setAbout(false)} className="min-h-[48px] rounded-xl border border-line text-body">
              {t('today.close')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
