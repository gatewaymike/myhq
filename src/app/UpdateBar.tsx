import { useRegisterSW } from 'virtual:pwa-register/react';
import { useApp } from './context';

const CHECK_EVERY_MS = 60 * 60 * 1000; // an installed app can stay open for days

/**
 * Registers the service worker and, when a new version is waiting, shows one line with a Reload button.
 * The swap happens only on that tap, so a reload never lands in the middle of an entry.
 */
export function UpdateBar() {
  const { t } = useApp();
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, reg) {
      if (!reg) return;
      setInterval(() => {
        if (document.visibilityState === 'visible' && navigator.onLine) void reg.update();
      }, CHECK_EVERY_MS);
    },
  });

  if (!needRefresh) return null;
  return (
    <div
      role="status"
      className="fixed inset-x-0 z-40 flex justify-center px-4 md:bottom-6"
      style={{ bottom: 'calc(96px + env(safe-area-inset-bottom, 0px))' }}
    >
      <div className="flex w-full max-w-md items-center justify-between gap-3 rounded-card border border-water/60 bg-surface px-4 py-2 shadow-[0_0_25px_rgb(var(--water)/.2)]">
        <span className="text-sm text-text">{t('pwa.updateReady')}</span>
        <button
          type="button"
          className="min-h-tap shrink-0 rounded-full bg-water px-4 font-mono text-xs font-medium uppercase tracking-wider text-bg"
          onClick={() => void updateServiceWorker(true)}
        >
          {t('pwa.reload')}
        </button>
      </div>
    </div>
  );
}
