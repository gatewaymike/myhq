import { entryHQ } from '../lib/hq';
import type { Device, DeviceInput, Entry, EntryInput, Prefs, Store } from './types';

/** Safe localStorage access: private windows and blocked storage must not break the app. */
export function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
/** Returns false when the device refused the write (storage full, blocked, or a private window). */
export function writeJSON(key: string, value: unknown): boolean {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

/** Thrown when guest data could not be written to this device, so nothing claims to be saved when it is not. */
export class StorageRefused extends Error {
  constructor() {
    super('This device refused to store the data');
    this.name = 'StorageRefused';
  }
}

export function uuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export const GUEST_KEY = 'myhq.guest.v1';
const KEY = GUEST_KEY;
interface GuestData {
  devices: Device[];
  entries: Entry[];
}

function computeHQ(e: Pick<Entry, 'route' | 'minutes' | 'h2FlowMlMin' | 'volumeMl' | 'concentrationMgL'>): number {
  return e.route === 'water'
    ? entryHQ({ route: 'water', volumeMl: e.volumeMl!, concentrationMgL: e.concentrationMgL! })
    : entryHQ({ route: 'inhalation', minutes: e.minutes!, h2FlowMlMin: e.h2FlowMlMin! });
}

/** Guest mode (item 1): entries stay on this device until the person creates an account. */
export class LocalStore implements Store {
  readonly kind = 'guest' as const;
  private data: GuestData;

  private key: string;

  constructor(seed?: GuestData, key = KEY) {
    this.key = key;
    this.data = readJSON<GuestData | null>(key, null) ?? seed ?? { devices: [], entries: [] };
    if (seed) writeJSON(this.key, this.data); // preview examples: best effort
  }

  /**
   * Writes the next state to the device first and only then adopts it. If the device refuses the
   * write, this throws and the store keeps its previous state: an entry is never shown as saved
   * when it would be gone on the next launch.
   */
  private commit(next: GuestData) {
    if (!writeJSON(this.key, next)) throw new StorageRefused();
    this.data = next;
  }

  /**
   * Picks up what another tab (or the installed app next to a browser tab) has stored since this
   * copy was read. Every method starts here, so a save in one tab can never erase a save in another.
   * If storage cannot be read, the in-memory copy stays as it is.
   */
  private refresh() {
    const stored = readJSON<GuestData | null>(this.key, null);
    if (stored && Array.isArray(stored.devices) && Array.isArray(stored.entries)) this.data = stored;
  }

  /** Everything kept on this device, archived devices included (for the hand-over to an account). */
  snapshot(): GuestData {
    this.refresh();
    return { devices: [...this.data.devices], entries: [...this.data.entries] };
  }

  /** Empties the guest data. If the device refuses the write, the in-memory copy is emptied all the same. */
  clear() {
    const empty: GuestData = { devices: [], entries: [] };
    writeJSON(this.key, empty);
    this.data = empty;
  }

  async listDevices() {
    this.refresh();
    return this.data.devices.filter((d) => !d.archived);
  }

  async addDevice(d: DeviceInput) {
    this.refresh();
    const dev: Device = { ...d, id: uuid(), archived: false, createdAt: new Date().toISOString() };
    this.commit({ devices: [...this.data.devices, dev], entries: this.data.entries });
    return dev;
  }

  async updateDevice(id: string, patch: Partial<DeviceInput>) {
    this.refresh();
    const cur = this.data.devices.find((d) => d.id === id);
    if (!cur) throw new Error('Device not found');
    const dev: Device = { ...cur, ...patch };
    this.commit({ devices: this.data.devices.map((d) => (d.id === id ? dev : d)), entries: this.data.entries });
    return dev;
  }

  async archiveDevice(id: string) {
    this.refresh();
    this.commit({ devices: this.data.devices.map((d) => (d.id === id ? { ...d, archived: true } : d)), entries: this.data.entries });
  }

  async listEntries(opts: { fromDate?: string; toDate?: string; limit?: number } = {}) {
    this.refresh();
    let list = [...this.data.entries];
    if (opts.fromDate) list = list.filter((e) => e.localDate >= opts.fromDate!);
    if (opts.toDate) list = list.filter((e) => e.localDate <= opts.toDate!);
    list.sort((a, b) => (a.sessionStart < b.sessionStart ? 1 : -1));
    return opts.limit ? list.slice(0, opts.limit) : list;
  }

  async exportAll() {
    return this.snapshot();
  }

  async lifetimeHQ() {
    this.refresh();
    return this.data.entries.reduce((a, e) => a + e.hq, 0);
  }

  async addEntry(input: EntryInput) {
    this.refresh();
    const existing = this.data.entries.find((e) => e.clientRequestId === input.clientRequestId);
    if (existing) return existing;
    const entry: Entry = { ...input, id: uuid(), hq: computeHQ(input), source: 'guest', createdAt: new Date().toISOString() };
    this.commit({ devices: this.data.devices, entries: [...this.data.entries, entry] });
    return entry;
  }

  async updateEntry(id: string, patch: Partial<Omit<EntryInput, 'clientRequestId'>>) {
    this.refresh();
    const cur = this.data.entries.find((x) => x.id === id);
    if (!cur) throw new Error('Entry not found');
    const merged = { ...cur, ...patch };
    const e: Entry = { ...merged, hq: computeHQ(merged) };
    this.commit({ devices: this.data.devices, entries: this.data.entries.map((x) => (x.id === id ? e : x)) });
    return e;
  }

  async deleteEntry(id: string) {
    this.refresh();
    this.commit({ devices: this.data.devices, entries: this.data.entries.filter((e) => e.id !== id) });
  }
}

const PREFS_KEY = 'myhq.prefs.v1';
export function loadPrefs(): Prefs {
  return readJSON<Prefs>(PREFS_KEY, { lastDeviceId: {}, lastRoute: 'inhalation', pourNoteSeen: false });
}
export function savePrefs(p: Prefs): void {
  writeJSON(PREFS_KEY, p);
}
