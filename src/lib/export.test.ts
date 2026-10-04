import { describe, expect, it } from 'vitest';
import { entriesToCSV, exportJSON } from './export';
import type { Device, Entry } from '../store/types';

const dev: Device = { id: 'd1', name: 'Home, "bedroom"', route: 'inhalation', h2FlowMlMin: 150, concentrationMgL: null, modeLabel: null, archived: true, createdAt: '2026-10-01T00:00:00Z' };
const e: Entry = {
  id: 'e1', deviceId: 'd1', route: 'inhalation', sessionStart: '2026-10-04T12:00:00Z', localDate: '2026-10-04', tz: 'Asia/Taipei',
  minutes: 130, h2FlowMlMin: 150, volumeMl: null, concentrationMgL: null, hq: 4.333333333333333,
  notes: 'line one\nline two, 好', source: 'app', clientRequestId: 'c1', createdAt: '2026-10-04T12:31:00Z',
};

describe('download my data', () => {
  it('CSV keeps full precision, the displayed figure, and escapes commas, quotes and newlines', () => {
    const csv = entriesToCSV([e], [dev]);
    expect(csv.startsWith('﻿local_date,')).toBe(true);
    expect(csv).toContain('4.333333333333333,4.33,');
    expect(csv).toContain('"Home, ""bedroom"""');
    expect(csv).toContain('"line one\nline two, 好"');
  });

  it('JSON carries the formula, archived devices and the displayed figure', () => {
    const j = JSON.parse(exportJSON([e], [dev], 'a@b.co'));
    expect(j.formula.inhalation).toContain('* 2');
    expect(j.devices[0].archived).toBe(true);
    expect(j.entries[0].hq).toBe(4.333333333333333);
    expect(j.entries[0].hq_displayed).toBe('4.33');
  });
});
