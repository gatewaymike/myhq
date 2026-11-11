import { useCallback, useEffect, useState } from 'react';
import { recall, remember } from './loadCache';

/**
 * loading: no answer yet and nothing cached.   ok: the latest answer.
 * stale: the load failed, showing the last answer that did arrive.   failed: the load failed and nothing is cached.
 */
export type LoadStatus = 'loading' | 'ok' | 'stale' | 'failed';

interface LoadState<T> {
  store: object;
  key: string;
  data: T | null;
  status: LoadStatus;
}

/**
 * Runs a data load, remembers each answer, and never invents a value when the load fails:
 * data stays null (the screen shows "…") until there is a real answer or a cached one.
 */
export function useLoad<T>(store: object, key: string, load: () => Promise<T>, deps: unknown[]): { data: T | null; status: LoadStatus; retry: () => void } {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<LoadState<T>>(() => {
    const cached = recall<T>(store, key);
    return { store, key, data: cached ?? null, status: cached === undefined ? 'loading' : 'ok' };
  });

  useEffect(() => {
    let live = true;
    const cached = recall<T>(store, key);
    // A new key (another day, another range) or a new store (signing in or out) starts from its own cache,
    // never from the data of the one before.
    setState((s) => (s.key === key && s.store === store ? s : { store, key, data: cached ?? null, status: cached === undefined ? 'loading' : 'ok' }));
    load().then(
      (value) => {
        remember(store, key, value);
        if (live) setState({ store, key, data: value, status: 'ok' });
      },
      () => {
        if (!live) return;
        const last = recall<T>(store, key);
        setState(last === undefined ? { store, key, data: null, status: 'failed' } : { store, key, data: last, status: 'stale' });
      },
    );
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store, key, attempt, ...deps]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  // While the effect catches up with a changed key or store, do not hand back the previous one's data.
  return state.key === key && state.store === store ? { data: state.data, status: state.status, retry } : { data: recall<T>(store, key) ?? null, status: 'loading', retry };
}
