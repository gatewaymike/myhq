import { beforeEach, describe, expect, it } from 'vitest';
import { GUEST_KEY, LocalStore, StorageRefused } from './localStore';
import type { EntryInput } from './types';

/** A stand-in for the browser's storage, shared by every store in a test (as two tabs share one). */
function fakeStorage() {
  const m = new Map<string, string>();
  return {
    getItem: (k: string) => (m.has(k) ? m.get(k)! : null),
    setItem: (k: string, v: string) => void m.set(k, v),
    removeItem: (k: string) => void m.delete(k),
    raw: m,
  };
}

const water = (ml: number, id: string): EntryInput => ({
  deviceId: null,
  route: 'water',
  sessionStart: '2026-11-11T02:00:00.000Z',
  localDate: '2026-11-11',
  tz: 'Asia/Taipei',
  minutes: null,
  h2FlowMlMin: null,
  volumeMl: ml,
  concentrationMgL: 1.6,
  notes: null,
  clientRequestId: id,
});

let storage: ReturnType<typeof fakeStorage>;
beforeEach(() => {
  storage = fakeStorage();
  (globalThis as { window?: unknown }).window = { localStorage: storage };
});

describe('guest store shared by two tabs', () => {
  it('one save in each tab keeps both entries', async () => {
    const tabA = new LocalStore();
    const tabB = new LocalStore(); // both opened before either saved
    await tabA.addEntry(water(200, 'a'));
    await tabB.addEntry(water(400, 'b'));
    const fresh = new LocalStore();
    const volumes = (await fresh.listEntries()).map((e) => e.volumeMl).sort();
    expect(volumes).toEqual([200, 400]);
    expect(await tabA.lifetimeHQ()).toBeCloseTo(0.4 + 0.8, 10);
  });

  it('a delete in one tab is not undone by a save in the other', async () => {
    const tabA = new LocalStore();
    const tabB = new LocalStore();
    const first = await tabA.addEntry(water(200, 'a'));
    await tabB.listEntries();
    await tabA.deleteEntry(first.id);
    await tabB.addEntry(water(400, 'b'));
    expect((await new LocalStore().listEntries()).map((e) => e.volumeMl)).toEqual([400]);
  });

  it('equipment added in one tab survives an entry saved in the other', async () => {
    const tabA = new LocalStore();
    const tabB = new LocalStore();
    await tabA.addDevice({ name: 'Home device', route: 'inhalation', h2FlowMlMin: 600, concentrationMgL: null, modeLabel: null });
    await tabB.addEntry(water(400, 'b'));
    const fresh = new LocalStore();
    expect((await fresh.listDevices()).length).toBe(1);
    expect((await fresh.listEntries()).length).toBe(1);
  });

  it('the double-save guard still holds across tabs', async () => {
    const tabA = new LocalStore();
    const tabB = new LocalStore();
    await tabA.addEntry(water(200, 'same'));
    await tabB.addEntry(water(200, 'same'));
    expect((await new LocalStore().listEntries()).length).toBe(1);
  });

  it('unreadable storage keeps the in-memory copy', async () => {
    const tab = new LocalStore();
    await tab.addEntry(water(200, 'a'));
    storage.raw.set(GUEST_KEY, 'not json');
    expect((await tab.listEntries()).length).toBe(1);
  });
});

describe('guest store when the device refuses to store', () => {
  it('addEntry rejects and nothing is listed as saved', async () => {
    const store = new LocalStore();
    await store.addEntry(water(200, 'kept'));
    storage.setItem = () => {
      throw new Error('QuotaExceededError');
    };
    await expect(store.addEntry(water(400, 'refused'))).rejects.toBeInstanceOf(StorageRefused);
    expect((await store.listEntries()).map((e) => e.volumeMl)).toEqual([200]);
    expect(await store.lifetimeHQ()).toBeCloseTo(0.4, 10);
  });

  it('edits, deletes and equipment changes are refused the same way and leave the data as it was', async () => {
    const store = new LocalStore();
    const e = await store.addEntry(water(200, 'kept'));
    const d = await store.addDevice({ name: 'Bottle', route: 'water', h2FlowMlMin: null, concentrationMgL: 1.2, modeLabel: null });
    storage.setItem = () => {
      throw new Error('QuotaExceededError');
    };
    await expect(store.updateEntry(e.id, { volumeMl: 900 })).rejects.toBeInstanceOf(StorageRefused);
    await expect(store.deleteEntry(e.id)).rejects.toBeInstanceOf(StorageRefused);
    await expect(store.archiveDevice(d.id)).rejects.toBeInstanceOf(StorageRefused);
    expect((await store.listEntries())[0].volumeMl).toBe(200);
    expect((await store.listDevices()).length).toBe(1);
  });

  it('a retried save with the same request id succeeds once storage works again', async () => {
    const store = new LocalStore();
    const real = storage.setItem;
    storage.setItem = () => {
      throw new Error('QuotaExceededError');
    };
    await expect(store.addEntry(water(400, 'retry'))).rejects.toBeInstanceOf(StorageRefused);
    storage.setItem = real;
    await store.addEntry(water(400, 'retry'));
    expect((await store.listEntries()).length).toBe(1);
  });
});
