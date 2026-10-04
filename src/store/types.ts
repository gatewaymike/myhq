import type { Route } from '../lib/hq';

export interface Device {
  id: string;
  name: string;
  route: Route;
  /** Hydrogen flow at the machine outlet, mL/min. Inhalation only. */
  h2FlowMlMin: number | null;
  /** mg/L at the point of pour. Water only. */
  concentrationMgL: number | null;
  modeLabel: string | null;
  archived: boolean;
  createdAt: string;
}

export type DeviceInput = Omit<Device, 'id' | 'archived' | 'createdAt'>;

export interface Entry {
  id: string;
  deviceId: string | null;
  route: Route;
  /** ISO timestamp of the session start (or the pour, for water). */
  sessionStart: string;
  /** YYYY-MM-DD in the user's time zone at logging. */
  localDate: string;
  tz: string;
  minutes: number | null;
  h2FlowMlMin: number | null;
  volumeMl: number | null;
  concentrationMgL: number | null;
  /** Full precision. Server-computed for signed-in users. */
  hq: number;
  notes: string | null;
  source: 'app' | 'guest' | 'import';
  clientRequestId: string;
  createdAt: string;
}

export interface EntryInput {
  deviceId: string | null;
  route: Route;
  sessionStart: string;
  localDate: string;
  tz: string;
  minutes: number | null;
  h2FlowMlMin: number | null;
  volumeMl: number | null;
  concentrationMgL: number | null;
  notes: string | null;
  clientRequestId: string;
}

export interface Store {
  readonly kind: 'guest' | 'account';
  listDevices(): Promise<Device[]>;
  addDevice(d: DeviceInput): Promise<Device>;
  updateDevice(id: string, d: Partial<DeviceInput>): Promise<Device>;
  archiveDevice(id: string): Promise<void>;
  /** Newest first. */
  listEntries(opts?: { fromDate?: string; toDate?: string; limit?: number }): Promise<Entry[]>;
  /** Everything the person has stored, archived devices included (download my data). */
  exportAll(): Promise<{ devices: Device[]; entries: Entry[] }>;
  /** Sum of every entry's HQ, full precision. */
  lifetimeHQ(): Promise<number>;
  /** Idempotent on clientRequestId: a second call returns the first entry (double-save guard). */
  addEntry(e: EntryInput): Promise<Entry>;
  updateEntry(id: string, e: Partial<Omit<EntryInput, 'clientRequestId'>>): Promise<Entry>;
  deleteEntry(id: string): Promise<void>;
}

/** Device-local preferences (both guest and signed-in). */
export interface Prefs {
  lastDeviceId: Partial<Record<Route, string>>;
  lastRoute: Route;
  pourNoteSeen: boolean;
}
