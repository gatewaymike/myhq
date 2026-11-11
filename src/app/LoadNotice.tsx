import { useApp } from './context';
import type { LoadStatus } from './useLoad';

/** One line when a load failed: what is on screen is the last loaded data, or nothing could be loaded. */
export function LoadNotice({ status, retry }: { status: LoadStatus; retry: () => void }) {
  const { t } = useApp();
  if (status !== 'stale' && status !== 'failed') return null;
  return (
    <div role="status" className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-xl border border-line bg-surface px-3 py-2 text-center text-sm">
      <span className={status === 'failed' ? 'text-danger' : 'text-body'}>{t(status === 'failed' ? 'net.failed' : 'net.stale')}</span>
      <button type="button" onClick={retry} className="min-h-tap px-2 font-mono text-xs uppercase tracking-wider text-water">
        {t('net.retry')}
      </button>
    </div>
  );
}
