import { describe, expect, it } from 'vitest';
import { recall, remember } from './loadCache';

describe('load cache', () => {
  it('returns what was remembered for the same store and key', () => {
    const store = {};
    remember(store, 'today:2026-11-11', { total: 8 });
    expect(recall(store, 'today:2026-11-11')).toEqual({ total: 8 });
  });

  it('knows nothing about another key, so yesterday is never shown as today', () => {
    const store = {};
    remember(store, 'today:2026-11-10', { total: 8 });
    expect(recall(store, 'today:2026-11-11')).toBeUndefined();
  });

  it('keeps stores apart: a guest never sees an account, nor one account another', () => {
    const account = {};
    const guest = {};
    remember(account, 'today:2026-11-11', { total: 8 });
    expect(recall(guest, 'today:2026-11-11')).toBeUndefined();
  });

  it('a newer answer replaces the older one', () => {
    const store = {};
    remember(store, 'k', 1);
    remember(store, 'k', 2);
    expect(recall(store, 'k')).toBe(2);
  });
});
