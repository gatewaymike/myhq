import { useEffect } from 'react';
import { useApp } from '../../app/context';
import { RouteIcon } from '../../app/RouteIcon';
import { formatInput, type Route } from '../../lib/hq';
import type { Device } from '../../store/types';

/** One list for choosing equipment: saved devices, "Enter values", "Add equipment". */
export function DevicePicker(props: {
  route: Route;
  devices: Device[];
  selectedId: string;
  manualId: string;
  onPick: (id: string) => void;
  onAdd: () => void;
  onClose: () => void;
}) {
  const { t, locale } = useApp();
  const { route, devices, selectedId, manualId, onPick, onAdd, onClose } = props;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const accent = route === 'water' ? 'text-water' : 'text-inhalation';
  const row = (active: boolean) =>
    `flex min-h-[52px] w-full items-center justify-between gap-3 rounded-xl border px-4 text-left ${active ? (route === 'water' ? 'border-water bg-water/10' : 'border-inhalation bg-inhalation/10') : 'border-line hover:border-muted'}`;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70 sm:items-center" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="picker-title"
        className="grid w-full max-w-md gap-2 rounded-t-[20px] border border-water/60 bg-surface p-5 shadow-[0_0_25px_rgb(var(--water)/.25)] sm:rounded-[20px]"
        style={{ paddingBottom: 'calc(20px + env(safe-area-inset-bottom, 0px))' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="picker-title" className="mb-2 font-mono text-sm uppercase tracking-[.12em] text-text">
          {t('log.equipment')}
        </h2>
        {devices.map((d) => (
          <button key={d.id} type="button" className={row(selectedId === d.id)} onClick={() => onPick(d.id)} aria-pressed={selectedId === d.id}>
            <span className="flex min-w-0 items-center gap-3">
              <RouteIcon route={d.route} className={`h-4 w-4 shrink-0 ${accent}`} />
              <span className="truncate text-text">
                {d.name}
                {d.modeLabel ? ` · ${d.modeLabel}` : ''}
              </span>
            </span>
            <span className={`tabular shrink-0 font-mono text-xs ${accent}`}>
              {d.route === 'inhalation' ? `${formatInput(d.h2FlowMlMin!, locale)} mL/min` : `${formatInput(d.concentrationMgL!, locale)} mg/L`}
            </span>
          </button>
        ))}
        <button type="button" className={row(selectedId === manualId)} onClick={() => onPick(manualId)} aria-pressed={selectedId === manualId}>
          <span className="text-body">{t('log.manual')}</span>
        </button>
        <button type="button" onClick={onAdd} className="flex min-h-[52px] w-full items-center rounded-xl border border-dashed border-line px-4 text-left text-muted hover:text-body">
          + {t('log.addEquipment')}
        </button>
      </div>
    </div>
  );
}
