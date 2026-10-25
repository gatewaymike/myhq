// Daily log reminder (R-466). Local to the phone: the setting lives in this device's storage, never in
// Supabase, and the store app schedules plain local notifications (no server, no push service).
//
// Rolling schedule: the next 14 reminders are scheduled as one-shot notifications at the chosen time and
// rebuilt on launch, on resume, after every save or delete, and whenever the setting changes. Today's
// reminder is left out once today already has an entry, so nobody is reminded after they have logged.
// If the app goes unopened for 14 days, the reminders run out (suggested; Michael's call at the gate).
import { readJSON, writeJSON } from '../store/localStore';

export const REMINDER_KEY = 'myhq.reminder.v1';
export const REMINDER_DAYS = 14;
export const REMINDER_FIRST_ID = 1001;
export const REMINDER_IDS = Array.from({ length: REMINDER_DAYS }, (_, i) => REMINDER_FIRST_ID + i);
export const DEFAULT_REMINDER_TIME = '20:00';

export interface ReminderSettings {
  on: boolean;
  /** 24-hour HH:MM in the phone's own time zone. */
  time: string;
}

const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function isValidTime(time: string): boolean {
  return TIME_RE.test(time);
}

export function readReminder(): ReminderSettings {
  const r = readJSON<Partial<ReminderSettings>>(REMINDER_KEY, {});
  return { on: r.on === true, time: typeof r.time === 'string' && isValidTime(r.time) ? r.time : DEFAULT_REMINDER_TIME };
}

export function writeReminder(s: ReminderSettings): void {
  writeJSON(REMINDER_KEY, s);
}

export interface PlannedReminder {
  id: number;
  at: Date;
}

/**
 * The reminders to schedule, soonest first. `now` and the result are in the phone's local time.
 * Today's slot is included only if its time is still ahead and nothing has been logged today.
 */
export function planReminders(now: Date, time: string, loggedToday: boolean, days = REMINDER_DAYS): PlannedReminder[] {
  if (!isValidTime(time)) return [];
  const [h, m] = time.split(':').map(Number);
  const out: PlannedReminder[] = [];
  for (let offset = 0; out.length < days && offset <= days; offset++) {
    const at = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset, h, m, 0, 0);
    if (offset === 0 && (loggedToday || at.getTime() <= now.getTime())) continue;
    out.push({ id: REMINDER_FIRST_ID + out.length, at });
  }
  return out;
}
