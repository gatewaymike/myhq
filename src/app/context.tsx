import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { t as translate, type Lang, type StringKey } from '../i18n/strings';
import { readJSON, writeJSON } from '../store/localStore';
import type { Store } from '../store/types';

interface AppCtx {
  store: Store;
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: StringKey, vars?: Record<string, string | number>) => string;
  locale: string;
  /** Bumped after any write so screens can refetch. */
  version: number;
  bump: () => void;
  toast: (msg: string, action?: { label: string; run: () => void }) => void;
}

const Ctx = createContext<AppCtx | null>(null);

export function useApp(): AppCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error('useApp outside provider');
  return c;
}

interface ToastState {
  id: number;
  msg: string;
  action?: { label: string; run: () => void };
}

export function AppProvider({ store, children }: { store: Store; children: ReactNode }) {
  // store comes from AuthProvider: the guest store, or the account store once signed in.
  const [lang, setLangState] = useState<Lang>(() => readJSON<Lang>('myhq.lang', navigator.language?.startsWith('zh') ? 'zh-TW' : 'en'));
  const [version, setVersion] = useState(0);
  const [toastState, setToast] = useState<ToastState | null>(null);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    writeJSON('myhq.lang', l);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const toast = useCallback((msg: string, action?: ToastState['action']) => {
    const id = Date.now();
    setToast({ id, msg, action });
    window.setTimeout(() => setToast((cur) => (cur?.id === id ? null : cur)), 6000);
  }, []);

  const value = useMemo<AppCtx>(
    () => ({
      store,
      lang,
      setLang,
      t: (k, v) => translate(k, lang, v),
      locale: lang === 'zh-TW' ? 'zh-TW' : 'en-US',
      version,
      bump: () => setVersion((n) => n + 1),
      toast,
    }),
    [store, lang, setLang, version, toast],
  );

  return (
    <Ctx.Provider value={value}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 z-50 flex justify-center px-4" style={{ bottom: 'calc(96px + env(safe-area-inset-bottom, 0px))' }}>
        {toastState && (
          <div className="pointer-events-auto flex max-w-full items-center gap-4 rounded-card border border-water/60 bg-surface-2 px-4 py-3 text-sm text-text shadow-[0_0_24px_rgb(var(--water)/.25)] animate-[toastIn_.25s_ease-out]">
            <span>{toastState.msg}</span>
            {toastState.action && (
              <button
                type="button"
                className="min-h-tap px-2 font-mono text-xs uppercase tracking-wider text-water"
                onClick={() => {
                  toastState.action!.run();
                  setToast(null);
                }}
              >
                {toastState.action.label}
              </button>
            )}
          </div>
        )}
      </div>
    </Ctx.Provider>
  );
}
