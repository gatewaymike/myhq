import { localDateOf } from '../../lib/hq';
import type { Entry } from '../../store/types';

export interface TimePatch {
  sessionStart: string;
  localDate: string;
  tz: string;
}

/**
 * What an edit sends for the entry's time. Nothing at all unless the time field was changed, so
 * fixing a note or a figure never moves an entry to another day or drops the seconds from its start.
 * When the time was changed, the day is worked out in the zone the entry was logged in, not the
 * zone the phone happens to be in now.
 */
export function timePatch(entry: Pick<Entry, 'tz'>, when: string, openedWith: string): TimePatch | null {
  if (when === openedWith) return null;
  const date = new Date(when);
  if (Number.isNaN(date.getTime())) return null;
  let day: { localDate: string; tz: string };
  try {
    day = localDateOf(date, entry.tz);
  } catch {
    day = localDateOf(date); // a zone name this phone does not know: fall back to the phone's own
  }
  return { sessionStart: date.toISOString(), localDate: day.localDate, tz: day.tz };
}
