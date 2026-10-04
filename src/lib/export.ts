import { MG_PER_HQ, formatHQ } from './hq';
import type { Device, Entry } from '../store/types';

/** "Download my data" (item 17). Full-precision HQ alongside the displayed figure (R-039). */

const CSV_COLUMNS = [
  'local_date',
  'session_start_utc',
  'time_zone',
  'route',
  'device',
  'device_mode',
  'minutes',
  'h2_flow_ml_min',
  'volume_ml',
  'concentration_mg_l',
  'hq',
  'hq_displayed',
  'mg_h2',
  'notes',
  'source',
  'created_at_utc',
] as const;

function cell(v: unknown): string {
  if (v === null || v === undefined) return '';
  const s = String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function entriesToCSV(entries: Entry[], devices: Device[]): string {
  const byId = new Map(devices.map((d) => [d.id, d]));
  const rows = [...entries]
    .sort((a, b) => (a.sessionStart < b.sessionStart ? -1 : 1))
    .map((e) => {
      const d = e.deviceId ? byId.get(e.deviceId) : undefined;
      return [
        e.localDate,
        e.sessionStart,
        e.tz,
        e.route,
        d?.name ?? '',
        d?.modeLabel ?? '',
        e.minutes,
        e.h2FlowMlMin,
        e.volumeMl,
        e.concentrationMgL,
        e.hq,
        formatHQ(e.hq),
        e.hq * MG_PER_HQ,
        e.notes,
        e.source,
        e.createdAt,
      ]
        .map(cell)
        .join(',');
    });
  // Leading byte-order mark so spreadsheet apps read Chinese notes correctly.
  return '﻿' + [CSV_COLUMNS.join(','), ...rows].join('\r\n') + '\r\n';
}

export function exportJSON(entries: Entry[], devices: Device[], email: string | null): string {
  return JSON.stringify(
    {
      app: 'MyHQ',
      exported_at: new Date().toISOString(),
      account: email,
      formula: {
        water: 'HQ = (volume_ml / 500) * (concentration_mg_l / 1.6)',
        inhalation: 'HQ = (minutes / 30) * (h2_flow_ml_min / 300) * 2',
        mg_h2: 'mg = HQ * 0.80',
        note: 'hq is stored at full precision; hq_displayed is rounded to two decimals.',
      },
      devices,
      entries: entries.map((e) => ({ ...e, hq_displayed: formatHQ(e.hq), mg_h2: e.hq * MG_PER_HQ })),
    },
    null,
    2,
  );
}

export function downloadFile(name: string, content: string, type: string): void {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
