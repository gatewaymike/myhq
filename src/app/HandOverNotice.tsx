import { useApp } from './context';
import { useAuth } from './auth';

/** Shown only while entries are still on this device because the move into the account failed. */
export function HandOverNotice() {
  const { t } = useApp();
  const { stuck, retryHandOver } = useAuth();
  if (stuck === 0) return null;
  const text = stuck === -1 ? t('auth.stuckSome') : stuck === 1 ? t('auth.stuckOne') : t('auth.stuck', { n: stuck });
  return (
    <div role="status" className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-xl border border-line bg-surface px-3 py-2 text-center text-sm">
      <span className="text-body">{text}</span>
      <button type="button" onClick={retryHandOver} className="min-h-tap px-2 font-mono text-xs uppercase tracking-wider text-water">
        {t('net.retry')}
      </button>
    </div>
  );
}
