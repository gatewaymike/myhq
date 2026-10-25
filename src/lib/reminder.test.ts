import { describe, expect, it } from 'vitest';
import { REMINDER_DAYS, REMINDER_IDS, isValidTime, planReminders } from './reminder';

const at = (y: number, mo: number, d: number, h: number, mi: number) => new Date(y, mo - 1, d, h, mi, 0, 0);

describe('daily log reminder planner', () => {
  it('builds 14 reminders with the fixed ID range, soonest first', () => {
    const plan = planReminders(at(2026, 10, 25, 9, 0), '20:00', false);
    expect(plan).toHaveLength(REMINDER_DAYS);
    expect(plan.map((p) => p.id)).toEqual(REMINDER_IDS);
    expect(plan[0].at).toEqual(at(2026, 10, 25, 20, 0)); // today still ahead and nothing logged
    expect(plan[13].at).toEqual(at(2026, 11, 7, 20, 0));
  });

  it('skips today when today already has an entry', () => {
    const plan = planReminders(at(2026, 10, 25, 9, 0), '20:00', true);
    expect(plan).toHaveLength(REMINDER_DAYS);
    expect(plan[0].at).toEqual(at(2026, 10, 26, 20, 0));
  });

  it('skips nothing ahead when today is empty', () => {
    const plan = planReminders(at(2026, 10, 25, 19, 59), '20:00', false);
    expect(plan[0].at).toEqual(at(2026, 10, 25, 20, 0));
  });

  it('starts tomorrow once today\'s time has passed', () => {
    const plan = planReminders(at(2026, 10, 25, 20, 0), '20:00', false);
    expect(plan[0].at).toEqual(at(2026, 10, 26, 20, 0));
  });

  it('keeps one reminder per calendar day across a month end', () => {
    const plan = planReminders(at(2026, 10, 30, 21, 0), '08:15', false);
    const days = plan.map((p) => `${p.at.getMonth() + 1}-${p.at.getDate()}`);
    expect(new Set(days).size).toBe(REMINDER_DAYS);
    expect(days[0]).toBe('10-31');
    expect(days[1]).toBe('11-1');
    expect(plan.every((p) => p.at.getHours() === 8 && p.at.getMinutes() === 15)).toBe(true);
  });

  it('follows the phone clock, so a rebuild after a time zone change lands on the new local time', () => {
    // A rebuild runs on resume; the plan is in whatever local time the phone now reports.
    const plan = planReminders(at(2026, 10, 25, 6, 0), '07:30', false);
    expect(plan[0].at.getHours()).toBe(7);
    expect(plan[0].at.getMinutes()).toBe(30);
  });

  it('plans nothing for a malformed time', () => {
    expect(planReminders(at(2026, 10, 25, 9, 0), '25:00', false)).toEqual([]);
    expect(isValidTime('7:30')).toBe(false);
    expect(isValidTime('07:30')).toBe(true);
  });
});
