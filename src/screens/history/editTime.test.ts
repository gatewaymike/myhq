import { describe, expect, it } from 'vitest';
import { timePatch } from './editTime';

describe('edit sheet: what happens to the entry time', () => {
  it('sends nothing when the time field was not changed', () => {
    expect(timePatch({ tz: 'Asia/Taipei' }, '2026-11-09T08:30', '2026-11-09T08:30')).toBeNull();
  });

  it('keeps the day in the zone the entry was logged in', () => {
    // 2026-11-09T17:00Z is 01:00 on Nov 10 in Taipei, whatever zone the test machine is in.
    const iso = '2026-11-09T17:00:00.000Z';
    const p = timePatch({ tz: 'Asia/Taipei' }, iso, 'something else');
    expect(p).toEqual({ sessionStart: iso, localDate: '2026-11-10', tz: 'Asia/Taipei' });
  });

  it('the same moment logged in Los Angeles stays on Nov 9', () => {
    const p = timePatch({ tz: 'America/Los_Angeles' }, '2026-11-09T17:00:00.000Z', 'x');
    expect(p?.localDate).toBe('2026-11-09');
    expect(p?.tz).toBe('America/Los_Angeles');
  });

  it('falls back to the phone zone for an unknown zone name, and ignores an unreadable time', () => {
    expect(timePatch({ tz: 'Not/AZone' }, '2026-11-09T17:00:00.000Z', 'x')?.sessionStart).toBe('2026-11-09T17:00:00.000Z');
    expect(timePatch({ tz: 'Asia/Taipei' }, 'not a date', 'x')).toBeNull();
  });
});
