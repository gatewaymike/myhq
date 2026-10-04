import { describe, expect, it } from 'vitest';
import vectors from './hq.vectors.json';
import {
  DAILY_REFERENCE_HQ,
  addDays,
  concentrationEquivalents,
  entryHQ,
  formatHQ,
  inhalationHQ,
  localDateOf,
  mgFromHQ,
  sevenDayAverage,
  showTheMath,
  summarizeDay,
  waterHQ,
  type EntryInput,
} from './hq';

type V = (typeof vectors.single)[number];
const toInput = (v: Partial<V> & { route: string }): EntryInput =>
  v.route === 'water'
    ? { route: 'water', volumeMl: v.volumeMl!, concentrationMgL: v.concentrationMgL! }
    : { route: 'inhalation', minutes: v.minutes!, h2FlowMlMin: v.h2FlowMlMin! };

describe('handoff test vectors', () => {
  for (const v of vectors.single) {
    it(`${v.label} -> ${v.display}`, () => {
      const hq = entryHQ(toInput(v));
      expect(formatHQ(hq)).toBe(v.display);
      if ('storedApprox' in v && v.storedApprox !== undefined) {
        // Full precision is stored, not the rounded figure (R-039).
        expect(hq).toBeCloseTo(v.storedApprox, 12);
        expect(hq).not.toBe(Number(v.display));
      }
    });
  }

  for (const d of vectors.day) {
    it(`${d.label} -> ${d.display}, badge ${d.bothRoutes ? 'on' : 'off'}`, () => {
      const stored = d.entries.map((e) => ({ route: e.route as 'water' | 'inhalation', hq: entryHQ(toInput(e)), localDate: '2026-10-04' }));
      const s = summarizeDay(stored);
      expect(formatHQ(s.total)).toBe(d.display);
      expect(s.bothRoutes).toBe(d.bothRoutes);
    });
  }
});

describe('formula properties', () => {
  it('1.0 HQ = 0.80 mg', () => {
    expect(mgFromHQ(1)).toBeCloseTo(0.8, 12);
    expect(mgFromHQ(DAILY_REFERENCE_HQ)).toBeCloseTo(8, 12);
  });

  it('the badge never changes the total (no synergy bonus, R-364)', () => { // lint-allow
    const w = waterHQ(500, 1.2);
    const i = inhalationHQ(30, 600);
    const s = summarizeDay([
      { route: 'water', hq: w, localDate: '2026-10-04' },
      { route: 'inhalation', hq: i, localDate: '2026-10-04' },
    ]);
    expect(s.total).toBe(w + i);
    expect(s.bothRoutes).toBe(true);
  });

  it('one route only: badge off', () => {
    const s = summarizeDay([
      { route: 'water', hq: 1, localDate: '2026-10-04' },
      { route: 'water', hq: 1, localDate: '2026-10-04' },
    ]);
    expect(s.bothRoutes).toBe(false);
  });

  it('rejects zero, negative and non-finite inputs', () => {
    expect(() => waterHQ(0, 1.6)).toThrow();
    expect(() => waterHQ(500, -1)).toThrow();
    expect(() => inhalationHQ(Number.NaN, 300)).toThrow();
    expect(() => inhalationHQ(30, Number.POSITIVE_INFINITY)).toThrow();
  });

  it('concentration line: 1.2 mg/L = 1.2 ppm = 1,200 ppb', () => {
    expect(concentrationEquivalents(1.2)).toEqual({ mgL: 1.2, ppm: 1.2, ppb: 1200 });
  });
});

describe('show the math', () => {
  it('water', () => {
    const m = showTheMath({ route: 'water', volumeMl: 500, concentrationMgL: 1.2 });
    expect(m.expression).toBe('(500 mL ÷ 500) × (1.2 mg/L ÷ 1.6)');
    expect(formatHQ(m.hq)).toBe('0.75');
    expect(m.mg).toBeCloseTo(0.6, 12);
  });

  it('inhalation, mixed-gas worked example', () => {
    const m = showTheMath({ route: 'inhalation', minutes: 30, h2FlowMlMin: 2000 });
    expect(m.expression).toBe('(30 min ÷ 30) × (2,000 mL/min ÷ 300) × 2');
    expect(formatHQ(m.hq)).toBe('13.33');
  });
});

describe('7-day average (one definition)', () => {
  it('total over the last 7 days, today included, divided by 7', () => {
    const entries = [
      { route: 'water' as const, hq: 0.6, localDate: '2026-10-04' }, // today
      { route: 'water' as const, hq: 7, localDate: '2026-09-28' }, // day 7, included
      { route: 'water' as const, hq: 100, localDate: '2026-09-27' }, // day 8, excluded
    ];
    expect(sevenDayAverage(entries, '2026-10-04')).toBeCloseTo(7.6 / 7, 12);
  });

  it('matches the live app figure: 0.60 today only -> 0.09', () => {
    expect(formatHQ(sevenDayAverage([{ route: 'water', hq: 0.6, localDate: '2026-10-04' }], '2026-10-04'))).toBe('0.09');
  });

  it('addDays crosses month and year boundaries', () => {
    expect(addDays('2026-10-01', -1)).toBe('2026-09-30');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
  });
});

describe('local date', () => {
  it('uses the given time zone, not UTC', () => {
    // 16:30 UTC on the 4th is 00:30 on the 5th in Taipei and 11:30 on the 4th in Chicago.
    expect(localDateOf(new Date('2026-10-04T16:30:00Z'), 'Asia/Taipei').localDate).toBe('2026-10-05');
    expect(localDateOf(new Date('2026-10-04T16:30:00Z'), 'America/Chicago').localDate).toBe('2026-10-04');
  });
});
