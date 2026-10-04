import { entryHQ, localDateOf } from '../lib/hq';
import type { Device, Entry } from './types';

/** Example data for preview builds only. Generic names: the app names no maker without the disclosure. */
export function exampleSeed(): { devices: Device[]; entries: Entry[] } {
  const created = new Date().toISOString();
  const exDevice: Device = { id: 'ex-device', name: 'Example device', route: 'inhalation', h2FlowMlMin: 600, concentrationMgL: null, modeLabel: null, archived: false, createdAt: created };
  const bottle: Device = { id: 'ex-bottle', name: 'Example water bottle', route: 'water', h2FlowMlMin: null, concentrationMgL: 1.2, modeLabel: null, archived: false, createdAt: created };
  const mk = (hoursAgo: number, e: Partial<Entry> & Pick<Entry, 'route'>): Entry => {
    const start = new Date(Date.now() - hoursAgo * 3600 * 1000);
    const { localDate, tz } = localDateOf(start);
    const base = { minutes: null, h2FlowMlMin: null, volumeMl: null, concentrationMgL: null, ...e };
    const hq = base.route === 'water'
      ? entryHQ({ route: 'water', volumeMl: base.volumeMl!, concentrationMgL: base.concentrationMgL! })
      : entryHQ({ route: 'inhalation', minutes: base.minutes!, h2FlowMlMin: base.h2FlowMlMin! });
    return { id: `ex-${hoursAgo}`, deviceId: null, sessionStart: start.toISOString(), localDate, tz, notes: null, source: 'guest', clientRequestId: `ex-${hoursAgo}`, createdAt: start.toISOString(), ...base, hq } as Entry;
  };
  return {
    devices: [exDevice, bottle],
    entries: [
      mk(3, { route: 'water', deviceId: 'ex-bottle', volumeMl: 500, concentrationMgL: 1.2 }),
      mk(26, { route: 'inhalation', deviceId: 'ex-device', minutes: 30, h2FlowMlMin: 600 }),
    ],
  };
}
