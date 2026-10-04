import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../app/context';
import { useAuth } from '../../app/auth';
import { RouteIcon } from '../../app/RouteIcon';
import { readJSON, writeJSON } from '../../store/localStore';
import { DeviceSheet } from '../log/DeviceSheet';

/** First-run cards (item 11): skippable; shown once to someone with no entries and no equipment. */
export const ONBOARDED_KEY = 'myhq.onboarded.v1';
export const SHOW_INTRO_EVENT = 'myhq:show-intro';

export function Onboarding({ forceShow = false }: { forceShow?: boolean }) {
  const { t, store } = useApp();
  const { session, loading } = useAuth();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [sheet, setSheet] = useState(false);
  const titleRef = useRef<HTMLHeadingElement>(null);

  // Decide once the account (if any) has loaded.
  useEffect(() => {
    if (loading || readJSON<boolean>(ONBOARDED_KEY, false)) return;
    let live = true;
    if (forceShow) {
      setOpen(true);
      return;
    }
    Promise.all([store.listDevices(), store.listEntries({ limit: 1 })]).then(([d, e]) => {
      if (live && d.length === 0 && e.length === 0) setOpen(true);
    });
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, store, forceShow]);

  // "Show the intro again" from Settings.
  useEffect(() => {
    const show = () => {
      setStep(0);
      setOpen(true);
    };
    window.addEventListener(SHOW_INTRO_EVENT, show);
    return () => window.removeEventListener(SHOW_INTRO_EVENT, show);
  }, []);

  useEffect(() => {
    if (open) titleRef.current?.focus();
  }, [open, step]);

  function finish() {
    writeJSON(ONBOARDED_KEY, true);
    setOpen(false);
    setStep(0);
  }

  if (!open) return null;

  const cards = [
    {
      title: t('onboard.c1Title'),
      body: (
        <>
          <p>{t('today.aboutHQ')}</p>
          <p>{t('onboard.c1Body')}</p>
          <p className="text-muted">{t('today.aboutRef')}</p>
        </>
      ),
      art: (
        <div className="flex items-baseline justify-center gap-2">
          <span className="tabular text-[3.4rem] font-bold leading-none text-water" style={{ textShadow: '0 0 10px rgb(var(--water) / .7), 0 0 22px rgb(var(--water) / .35)' }}>
            1.00
          </span>
          <span className="font-mono text-sm text-text">HQ = 0.80 mg H₂</span>
        </div>
      ),
      primary: { label: t('onboard.next'), run: () => setStep(1) },
    },
    {
      title: t('onboard.c2Title'),
      body: (
        <>
          <p>{t('onboard.c2Body')}</p>
          <p className="text-muted">{t('device.mixedGasExample')}</p>
        </>
      ),
      art: (
        <div className="flex justify-center gap-6">
          <RouteIcon route="inhalation" className="h-10 w-10 text-inhalation" />
          <RouteIcon route="water" className="h-10 w-10 text-water" />
        </div>
      ),
      primary: { label: `+ ${t('log.addEquipment')}`, run: () => setSheet(true) },
      secondary: { label: t('onboard.later'), run: () => setStep(2) },
    },
    {
      title: t('onboard.c3Title'),
      body: (
        <>
          <p>{t('onboard.c3Body')}</p>
          {!session && <p className="text-muted">{t('onboard.c3Guest')}</p>}
        </>
      ),
      art: (
        <div className="mx-auto grid h-14 w-14 place-content-center rounded-full bg-water text-[13px] font-bold text-bg">{t('nav.addLog')}</div>
      ),
      primary: {
        label: t('today.logFirst'),
        run: () => {
          finish();
          nav('/log');
        },
      },
    },
  ];
  const card = cards[step];

  return (
    <div className="fixed inset-0 z-[55] flex items-end justify-center bg-black/75 sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboard-title"
        className="grid max-h-[92vh] w-full max-w-md grid-cols-[minmax(0,1fr)] gap-5 overflow-y-auto rounded-t-[24px] border border-water/60 bg-surface p-6 shadow-[0_0_25px_rgb(var(--water)/.25)] sm:rounded-[24px]"
        style={{ paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))' }}
      >
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] uppercase tracking-[.12em] text-muted">{t('onboard.step', { n: step + 1 })}</span>
          <button type="button" onClick={finish} className="min-h-tap px-2 font-mono text-xs uppercase tracking-wider text-muted hover:text-body">
            {t('onboard.skip')}
          </button>
        </div>

        <div className="py-2">{card.art}</div>

        <h2 id="onboard-title" ref={titleRef} tabIndex={-1} className="text-center text-[1.6rem] font-bold uppercase leading-tight tracking-[.1em] text-water focus:outline-none">
          {card.title}
        </h2>
        <div className="grid gap-3 text-[15px] leading-relaxed text-body">{card.body}</div>

        {/* step dots */}
        <div className="flex justify-center gap-2" aria-hidden="true">
          {cards.map((_, i) => (
            <span key={i} className={`h-1.5 rounded-full transition-all ${i === step ? 'w-6 bg-water' : 'w-1.5 bg-line'}`} />
          ))}
        </div>

        <div className={`grid gap-3 ${card.secondary ? 'grid-cols-2' : ''}`}>
          {card.secondary && (
            <button type="button" onClick={card.secondary.run} className="min-h-[52px] rounded-xl border border-line text-sm text-body">
              {card.secondary.label}
            </button>
          )}
          <button type="button" onClick={card.primary.run} className="min-h-[52px] rounded-xl bg-water text-base font-bold text-bg">
            {card.primary.label}
          </button>
        </div>
      </div>

      {sheet && (
        <DeviceSheet
          route="inhalation"
          onClose={() => setSheet(false)}
          onSaved={() => {
            setSheet(false);
            setStep(2);
          }}
        />
      )}
    </div>
  );
}
