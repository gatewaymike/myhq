/**
 * HQ formula module. CORE IP: these constants never change.
 *
 *   1.0 HQ = 500 mL water at 1.6 mg/L = 0.80 mg H2
 *   Water:      HQ = (mL / 500) * (mg/L / 1.6)
 *   Inhalation: HQ = (minutes / 30) * (hydrogen mL/min / 300) * 2
 *   mg H2 = HQ * 0.80
 *
 * Full precision is carried through every computation; only the displayed
 * figure is rounded (R-039). The database computes the same figure in a
 * generated column (supabase/migrations/0001_init.sql) and is the source of
 * truth for stored entries; this module drives live previews, guest mode and
 * the "show the math" panels, and its test vectors are mirrored in SQL.
 */

export const WATER_REF_ML = 500;
export const WATER_REF_MG_L = 1.6;
export const INHALATION_REF_MIN = 30;
export const INHALATION_REF_FLOW = 300;
export const INHALATION_FACTOR = 2;
export const MG_PER_HQ = 0.8;
/** Daily reference value inside a range; neither a floor nor a ceiling (R-073). */
export const DAILY_REFERENCE_HQ = 10;
/** Point-of-pour window for water entries, closed vessel (R-350). */
export const POUR_WINDOW_MIN = 30;

export type Route = 'water' | 'inhalation';

export interface WaterInput {
  route: 'water';
  volumeMl: number;
  concentrationMgL: number;
}

export interface InhalationInput {
  route: 'inhalation';
  minutes: number;
  /** Hydrogen flow at the machine outlet, mL/min (R-201). Never a purity input (G1). lint-allow */
  h2FlowMlMin: number;
}

export type EntryInput = WaterInput | InhalationInput;

function assertPositiveFinite(name: string, v: number): void {
  if (typeof v !== 'number' || !Number.isFinite(v) || v <= 0) {
    throw new RangeError(`${name} must be a positive number`);
  }
}

export function waterHQ(volumeMl: number, concentrationMgL: number): number {
  assertPositiveFinite('volumeMl', volumeMl);
  assertPositiveFinite('concentrationMgL', concentrationMgL);
  return (volumeMl / WATER_REF_ML) * (concentrationMgL / WATER_REF_MG_L);
}

export function inhalationHQ(minutes: number, h2FlowMlMin: number): number {
  assertPositiveFinite('minutes', minutes);
  assertPositiveFinite('h2FlowMlMin', h2FlowMlMin);
  return (minutes / INHALATION_REF_MIN) * (h2FlowMlMin / INHALATION_REF_FLOW) * INHALATION_FACTOR;
}

export function entryHQ(e: EntryInput): number {
  return e.route === 'water'
    ? waterHQ(e.volumeMl, e.concentrationMgL)
    : inhalationHQ(e.minutes, e.h2FlowMlMin);
}

export function mgFromHQ(hq: number): number {
  return hq * MG_PER_HQ;
}

/** True when a value parses to a positive finite number. For form validation. */
export function isValidAmount(v: unknown): boolean {
  const n = typeof v === 'string' ? Number(v.replace(/,/g, '')) : v;
  return typeof n === 'number' && Number.isFinite(n) && n > 0;
}

/* ------------------------------------------------------------------ display */

/** Displayed HQ: always two decimals. Rounding happens here and nowhere else. */
export function formatHQ(hq: number, locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(hq);
}

export function formatMg(mg: number, locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(mg);
}

/** Plain number for the inputs echoed in "show the math" (no forced decimals). */
export function formatInput(v: number, locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 3 }).format(v);
}

/** "1.2 mg/L = 1.2 ppm = 1,200 ppb" helper values (item 8). */
export function concentrationEquivalents(mgL: number): { mgL: number; ppm: number; ppb: number } {
  return { mgL, ppm: mgL, ppb: mgL * 1000 };
}

export interface MathStep {
  /** Human-readable arithmetic, e.g. "(500 mL ÷ 500) × (1.2 mg/L ÷ 1.6)". */
  expression: string;
  hq: number;
  mg: number;
}

/** The arithmetic behind any HQ figure (item 3). */
export function showTheMath(e: EntryInput, locale = 'en-US'): MathStep {
  const hq = entryHQ(e);
  const f = (v: number) => formatInput(v, locale);
  const expression =
    e.route === 'water'
      ? `(${f(e.volumeMl)} mL ÷ ${WATER_REF_ML}) × (${f(e.concentrationMgL)} mg/L ÷ ${WATER_REF_MG_L})`
      : `(${f(e.minutes)} min ÷ ${INHALATION_REF_MIN}) × (${f(e.h2FlowMlMin)} mL/min ÷ ${INHALATION_REF_FLOW}) × ${INHALATION_FACTOR}`;
  return { expression, hq, mg: mgFromHQ(hq) };
}

/* ------------------------------------------------------------- aggregation */

export interface StoredEntryLike {
  route: Route;
  hq: number;
  /** YYYY-MM-DD in the user's own time zone at logging. */
  localDate: string;
}

export interface DaySummary {
  water: number;
  inhalation: number;
  total: number;
  /** "Both routes today": at least one water and one inhalation entry (R-364). Never changes any HQ figure. */
  bothRoutes: boolean;
  entryCount: number;
}

export function summarizeDay(entries: StoredEntryLike[]): DaySummary {
  let water = 0;
  let inhalation = 0;
  let hasWater = false;
  let hasInhalation = false;
  for (const e of entries) {
    if (e.route === 'water') {
      water += e.hq;
      hasWater = true;
    } else {
      inhalation += e.hq;
      hasInhalation = true;
    }
  }
  return { water, inhalation, total: water + inhalation, bothRoutes: hasWater && hasInhalation, entryCount: entries.length };
}

/** Add days to a YYYY-MM-DD string without touching time zones. */
export function addDays(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + days));
  return t.toISOString().slice(0, 10);
}

/**
 * The one definition of the 7-day average (item 16):
 * total HQ logged on the last 7 calendar days, today included, divided by 7.
 * Days with no entries count as zero.
 */
export const SEVEN_DAY_WINDOW = 7;
export function sevenDayAverage(entries: StoredEntryLike[], today: string): number {
  const start = addDays(today, -(SEVEN_DAY_WINDOW - 1));
  let sum = 0;
  for (const e of entries) {
    if (e.localDate >= start && e.localDate <= today) sum += e.hq;
  }
  return sum / SEVEN_DAY_WINDOW;
}

/** Local calendar date (YYYY-MM-DD) and IANA zone for a moment, from the device's own clock. */
export function localDateOf(moment: Date, timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone): { localDate: string; tz: string } {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(moment);
  const get = (t: string) => parts.find((p) => p.type === t)!.value;
  return { localDate: `${get('year')}-${get('month')}-${get('day')}`, tz: timeZone };
}
