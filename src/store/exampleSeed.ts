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
  // Two weeks of example history: a varied, plausible pattern (example data, preview only).
  const pattern: [number, number, number][] = [
    // [days ago, inhalation minutes at 600, water mL at 1.2]
    [3, 30, 500], [4, 45, 0], [5, 0, 1000], [6, 30, 500], [7, 60, 500], [8, 30, 0],
    [10, 30, 1000], [11, 20, 500], [12, 45, 500], [13, 30, 0],
  ];
  const history: Entry[] = [];
  for (const [ago, min, ml] of pattern) {
    if (min) history.push(mk(ago * 24 - 2, { route: 'inhalation', deviceId: 'ex-device', minutes: min, h2FlowMlMin: 600 }));
    if (ml) history.push(mk(ago * 24 - 6, { route: 'water', deviceId: 'ex-bottle', volumeMl: ml, concentrationMgL: 1.2 }));
  }
  return {
    devices: [exDevice, bottle],
    entries: [
      ...history,
      mk(3, { route: 'water', deviceId: 'ex-bottle', volumeMl: 500, concentrationMgL: 1.2 }),
      mk(1, { route: 'inhalation', deviceId: 'ex-device', minutes: 30, h2FlowMlMin: 600 }),
      mk(26, { route: 'inhalation', deviceId: 'ex-device', minutes: 30, h2FlowMlMin: 600 }),
      mk(50, { route: 'water', deviceId: 'ex-bottle', volumeMl: 400, concentrationMgL: 1.2 }),
    ],
  };
}
