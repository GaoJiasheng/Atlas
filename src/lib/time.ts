/**
 * Time helpers shared by schemas, URL state and (later) the TimeScene engine.
 * A `TimePoint` is either an ISO date string with year/month/day precision or
 * a geological time `{ ma }` (millions of years ago).
 */
export type TimePoint = string | { ma: number };

export type TimeScale = 'date' | 'ma';

export interface TimeOrdinal {
  scale: TimeScale;
  /**
   * Monotonic value: for dates, milliseconds since the Unix epoch at the start
   * of the period; for geological time, `-ma` (so later = larger).
   */
  value: number;
}

const DATE_RE = /^(-?\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/;

export function isGeoTime(t: TimePoint): t is { ma: number } {
  return typeof t === 'object' && t !== null && typeof t.ma === 'number';
}

/**
 * Start-of-period UTC timestamp for `YYYY`, `YYYY-MM`, `YYYY-MM-DD`
 * (proleptic Gregorian; `-0221` = 221 BCE). `null` for malformed or
 * impossible dates (`1942-13`, `1942-02-30`).
 */
export function isoDateToMs(value: string): number | null {
  const m = DATE_RE.exec(value);
  if (!m) return null;
  const year = Number(m[1]);
  const month = m[2] ? Number(m[2]) : 1;
  const day = m[3] ? Number(m[3]) : 1;
  if (month < 1 || month > 12 || day < 1) return null;
  const d = new Date(Date.UTC(2000, 0, 1));
  d.setUTCFullYear(year, month - 1, day);
  if (d.getUTCMonth() !== month - 1 || d.getUTCDate() !== day) return null; // overflowed: no such day
  return d.getTime();
}

export function isIsoDate(value: string): boolean {
  return isoDateToMs(value) !== null;
}

export function toOrdinal(t: TimePoint): TimeOrdinal | null {
  if (isGeoTime(t)) return { scale: 'ma', value: -t.ma };
  const ms = isoDateToMs(t);
  return ms === null ? null : { scale: 'date', value: ms };
}

/**
 * Compare two time points. Returns negative / 0 / positive like `Array.sort`,
 * or `null` if they are on different scales or unparsable.
 */
export function compareTime(a: TimePoint, b: TimePoint): number | null {
  const oa = toOrdinal(a);
  const ob = toOrdinal(b);
  if (!oa || !ob || oa.scale !== ob.scale) return null;
  return oa.value - ob.value;
}

/** URL form: dates as-is, geological time as `200ma`. */
export function formatTimeParam(t: TimePoint): string {
  return isGeoTime(t) ? `${t.ma}ma` : t;
}

export function parseTimeParam(raw: string): TimePoint | null {
  const geo = /^(\d+(?:\.\d+)?)ma$/.exec(raw);
  if (geo) return { ma: Number(geo[1]) };
  return isoDateToMs(raw) === null ? null : raw;
}
