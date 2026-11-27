import { useEffect, useRef } from 'react';
import { useDialog } from '../../app/useDialog';
import { useApp } from '../../app/context';
import { Figure } from '../../app/Figure';
import { RouteIcon } from '../../app/RouteIcon';
import type { Route } from '../../lib/hq';

/**
 * First run (R-390 reopened): one screen, not three cards. The anchor, then two tiles; either tile opens Log
 * on that route, in minutes entry, with the cursor in the first empty field. "Skip for now" lands on Today.
 */
export function FirstRun({ onPick, onSkip }: { onPick: (route: Route) => void; onSkip: () => void }) {
  const { t } = useApp();
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => titleRef.current?.focus(), []);
  const panelRef = useRef<HTMLDivElement>(null);
  useDialog(panelRef, onSkip);

  const tile = 'grid min-h-[88px] w-full grid-cols-[auto_minmax(0,1fr)] items-center gap-4 rounded-card border bg-bg px-4 text-left transition-colors duration-150 motion-reduce:transition-none hover:bg-surface-2';
  return (
    <div className="fixed inset-0 z-[55] flex items-end justify-center bg-black/75 sm:items-center">
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="firstrun-title"
        className="grid max-h-[94vh] w-full max-w-md grid-cols-[minmax(0,1fr)] gap-5 overflow-y-auto rounded-t-[20px] border border-line bg-surface p-6 sm:rounded-[20px]"
        style={{ paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))' }}
      >
        <h2 id="firstrun-title" ref={titleRef} tabIndex={-1} className="sr-only focus:outline-none">
          {t('onboard.c1Title')}
        </h2>

        <div className="grid justify-items-center gap-2 pt-2 text-center">
          <span className="flex items-baseline gap-2 text-text">
            <span className="text-readout">
              <Figure value="1.00" />
            </span>
            <span className="font-mono text-small text-body">HQ = 0.80 mg H₂</span>
          </span>
          <p className="text-row text-body">{t('today.aboutHQ')}</p>
        </div>

        <div className="grid gap-3">
          <p className="text-center text-body text-text">{t('onboard.c3Title')}</p>
          <button type="button" onClick={() => onPick('water')} className={`${tile} border-water/50`}>
            <RouteIcon route="water" className="h-7 w-7 text-water" />
            <span className="text-[16px] text-text">{t('firstRun.water')}</span>
          </button>
          <button type="button" onClick={() => onPick('inhalation')} className={`${tile} border-inhalation/50`}>
            <RouteIcon route="inhalation" className="h-7 w-7 text-inhalation" />
            <span className="text-[16px] text-text">{t('firstRun.inhalation')}</span>
          </button>
        </div>

        <button type="button" onClick={onSkip} className="min-h-tap justify-self-center px-3 font-mono text-xs uppercase tracking-wider text-muted hover:text-body">
          {t('firstRun.skip')}
        </button>
      </div>
    </div>
  );
}
