import type { SupabaseClient } from '@supabase/supabase-js';
import type { Device, DeviceInput, Entry, EntryInput, Store } from './types';

/* Row shapes as stored (snake_case). hq is a generated column: never written by the client. */
interface DeviceRow {
  id: string;
  name: string;
  route: 'water' | 'inhalation';
  h2_flow_ml_min: number | string | null;
  concentration_mg_l: number | string | null;
  mode_label: string | null;
  archived: boolean;
  created_at: string;
}
interface EntryRow {
  id: string;
  device_id: string | null;
  route: 'water' | 'inhalation';
  session_start: string;
  local_date: string;
  tz: string;
  minutes: number | string | null;
  h2_flow_ml_min: number | string | null;
  volume_ml: number | string | null;
  concentration_mg_l: number | string | null;
  hq: number | string;
  notes: string | null;
  source: 'app' | 'guest' | 'import';
  client_request_id: string;
  created_at: string;
}

// Postgres numeric arrives as a string; keep full precision by parsing once here.
const num = (v: number | string | null): number | null => (v === null ? null : Number(v));

const toDevice = (r: DeviceRow): Device => ({
  id: r.id,
  name: r.name,
  route: r.route,
  h2FlowMlMin: num(r.h2_flow_ml_min),
  concentrationMgL: num(r.concentration_mg_l),
  modeLabel: r.mode_label,
  archived: r.archived,
  createdAt: r.created_at,
});

const toEntry = (r: EntryRow): Entry => ({
  id: r.id,
  deviceId: r.device_id,
  route: r.route,
  sessionStart: r.session_start,
  localDate: r.local_date,
  tz: r.tz,
  minutes: num(r.minutes),
  h2FlowMlMin: num(r.h2_flow_ml_min),
  volumeMl: num(r.volume_ml),
  concentrationMgL: num(r.concentration_mg_l),
  hq: Number(r.hq),
  notes: r.notes,
  source: r.source,
  clientRequestId: r.client_request_id,
  createdAt: r.created_at,
});

const deviceCols = (d: Partial<DeviceInput>) => ({
  ...(d.name !== undefined && { name: d.name }),
  ...(d.route !== undefined && { route: d.route }),
  ...(d.h2FlowMlMin !== undefined && { h2_flow_ml_min: d.h2FlowMlMin }),
  ...(d.concentrationMgL !== undefined && { concentration_mg_l: d.concentrationMgL }),
  ...(d.modeLabel !== undefined && { mode_label: d.modeLabel }),
});

const entryCols = (e: Partial<EntryInput>) => ({
  ...(e.deviceId !== undefined && { device_id: e.deviceId }),
  ...(e.route !== undefined && { route: e.route }),
  ...(e.sessionStart !== undefined && { session_start: e.sessionStart }),
  ...(e.localDate !== undefined && { local_date: e.localDate }),
  ...(e.tz !== undefined && { tz: e.tz }),
  ...(e.minutes !== undefined && { minutes: e.minutes }),
  ...(e.h2FlowMlMin !== undefined && { h2_flow_ml_min: e.h2FlowMlMin }),
  ...(e.volumeMl !== undefined && { volume_ml: e.volumeMl }),
  ...(e.concentrationMgL !== undefined && { concentration_mg_l: e.concentrationMgL }),
  ...(e.notes !== undefined && { notes: e.notes }),
  ...(e.clientRequestId !== undefined && { client_request_id: e.clientRequestId }),
});

/** Signed-in store. Row-level security limits every query to the caller's own rows. */
export class SupabaseStore implements Store {
  readonly kind = 'account' as const;
  private sb: SupabaseClient;
  constructor(sb: SupabaseClient) {
    this.sb = sb;
  }

  async listDevices() {
    const { data, error } = await this.sb.from('devices').select('*').eq('archived', false).order('created_at');
    if (error) throw error;
    return (data as DeviceRow[]).map(toDevice);
  }

  async addDevice(d: DeviceInput) {
    const { data, error } = await this.sb.from('devices').insert(deviceCols(d)).select().single();
    if (error) throw error;
    return toDevice(data as DeviceRow);
  }

  async updateDevice(id: string, d: Partial<DeviceInput>) {
    const { data, error } = await this.sb.from('devices').update(deviceCols(d)).eq('id', id).select().single();
    if (error) throw error;
    return toDevice(data as DeviceRow);
  }

  async archiveDevice(id: string) {
    const { error } = await this.sb.from('devices').update({ archived: true }).eq('id', id);
    if (error) throw error;
  }

  async listEntries(opts: { fromDate?: string; toDate?: string; limit?: number } = {}) {
    let q = this.sb.from('entries').select('*').order('session_start', { ascending: false });
    if (opts.fromDate) q = q.gte('local_date', opts.fromDate);
    if (opts.toDate) q = q.lte('local_date', opts.toDate);
    if (opts.limit) q = q.limit(opts.limit);
    const { data, error } = await q;
    if (error) throw error;
    return (data as EntryRow[]).map(toEntry);
  }

  async addEntry(e: EntryInput) {
    // Insert, ignoring a duplicate client_request_id, then read the row back either way.
    const { error } = await this.sb
      .from('entries')
      .upsert({ ...entryCols(e), source: 'app' }, { onConflict: 'user_id,client_request_id', ignoreDuplicates: true });
    if (error) throw error;
    const { data, error: readErr } = await this.sb.from('entries').select('*').eq('client_request_id', e.clientRequestId).single();
    if (readErr) throw readErr;
    return toEntry(data as EntryRow);
  }

  /**
   * Guest mode hand-over (item 1): devices and entries kept on this device move into the account.
   * Entries keep their client_request_id, so running this twice never duplicates a row.
   */
  async importGuest(devices: Device[], entries: Entry[]): Promise<number> {
    const idMap = new Map<string, string>();
    // Reuse a matching device already in the account (same name, route and figure), so a retried hand-over adds nothing twice.
    const existing = await this.listDevices();
    const same = (a: Device, b: Device) =>
      a.name === b.name && a.route === b.route && a.h2FlowMlMin === b.h2FlowMlMin && a.concentrationMgL === b.concentrationMgL && (a.modeLabel ?? null) === (b.modeLabel ?? null);
    for (const d of devices) {
      const match = existing.find((x) => same(x, d));
      const target = match ?? (await this.addDevice({ name: d.name, route: d.route, h2FlowMlMin: d.h2FlowMlMin, concentrationMgL: d.concentrationMgL, modeLabel: d.modeLabel }));
      idMap.set(d.id, target.id);
    }
    if (entries.length === 0) return 0;
    const rows = entries.map((e) => ({
      ...entryCols({ ...e, deviceId: e.deviceId ? idMap.get(e.deviceId) ?? null : null }),
      source: 'guest' as const,
    }));
    const { error } = await this.sb.from('entries').upsert(rows, { onConflict: 'user_id,client_request_id', ignoreDuplicates: true });
    if (error) throw error;
    return entries.length;
  }

  async updateEntry(id: string, e: Partial<Omit<EntryInput, 'clientRequestId'>>) {
    const { data, error } = await this.sb.from('entries').update(entryCols(e)).eq('id', id).select().single();
    if (error) throw error;
    return toEntry(data as EntryRow);
  }

  async deleteEntry(id: string) {
    const { error } = await this.sb.from('entries').delete().eq('id', id);
    if (error) throw error;
  }
}
