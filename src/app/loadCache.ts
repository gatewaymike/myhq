/**
 * The last successful answer to each data load, kept in memory for as long as the app stays open.
 * One cache per store, so a guest never sees an account's figures and one account never sees another's.
 * It lets a screen keep showing what was loaded when the connection drops (R-414), instead of a zero.
 */
const caches = new WeakMap<object, Map<string, unknown>>();

export function remember<T>(store: object, key: string, value: T): void {
  let m = caches.get(store);
  if (!m) {
    m = new Map();
    caches.set(store, m);
  }
  m.set(key, value);
}

export function recall<T>(store: object, key: string): T | undefined {
  return caches.get(store)?.get(key) as T | undefined;
}
