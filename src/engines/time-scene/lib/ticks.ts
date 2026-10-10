/**
 * Tick marks for the participation card's time axis.
 * Pure and unit-tested. The step adapts to the span and the room available:
 * the finest ladder rung whose major ticks fit `maxMajors` wins, e.g.
 *
 *   ~7 months   major = month (year label on January), minor = days 8/15/22
 *   ~6 years    major = year, minor = month
 *   ~200 Ma     major = 10 or 25 Ma, minor = 1 or 5 Ma
 *
 * Numbers are the TimeScene axis unit (decimal years; geological time is
 * negative years, see lib/time.ts).
 */
import type { Locale } from '../../../i18n';
import { toNumber, type TimeScale } from './time';

export interface Tick {
  t: number;
  label: string;
}

export interface Ticks {
  major: Tick[];
  minor: number[];
  /** Unit caption for the rule's end (`MA` / `百万年前`), empty for dates. */
  unit: string;
}

const MONTHS_EN = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

type DateRung =
  | { major: 'month'; months: number; minor: 'days' | 'month' }
  | { major: 'year'; years: number; minorYears: number; minorMonths?: number };

/** Date ladder, finest first. */
const DATE_LADDER: DateRung[] = [
  { major: 'month', months: 1, minor: 'days' },
  { major: 'month', months: 3, minor: 'month' },
  { major: 'year', years: 1, minorYears: 0, minorMonths: 1 },
  { major: 'year', years: 1, minorYears: 0, minorMonths: 3 },
  { major: 'year', years: 2, minorYears: 0, minorMonths: 6 },
  { major: 'year', years: 5, minorYears: 1 },
  { major: 'year', years: 10, minorYears: 1 },
  { major: 'year', years: 25, minorYears: 5 },
  { major: 'year', years: 50, minorYears: 10 },
  { major: 'year', years: 100, minorYears: 10 },
  { major: 'year', years: 250, minorYears: 50 },
  { major: 'year', years: 500, minorYears: 100 },
  { major: 'year', years: 1000, minorYears: 100 },
];

/** Geological ladder in Ma (major, minor), finest first. */
const MA_LADDER: [number, number][] = [
  [0.1, 0.01],
  [0.5, 0.1],
  [1, 0.1],
  [5, 1],
  [10, 1],
  [25, 5],
  [50, 10],
  [100, 10],
  [250, 50],
  [500, 100],
  [1000, 100],
];

function iso(year: number, month = 1, day = 1): string {
  const y = `${year < 0 ? '-' : ''}${String(Math.abs(year)).padStart(4, '0')}`;
  return `${y}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/** Decimal-year number at 00:00 on `day` `month` `year`. */
function at(year: number, month = 1, day = 1): number {
  // Normalise month overflow (13 -> January next year).
  const y = year + Math.floor((month - 1) / 12);
  const m = ((((month - 1) % 12) + 12) % 12) + 1;
  return toNumber(iso(y, m, day));
}

function yearLabel(year: number, locale: Locale): string {
  if (year < 0) return locale === 'zh' ? `前${-year}` : `${-year} BCE`;
  return String(year);
}

function monthLabel(year: number, month: number, locale: Locale): string {
  if (month === 1) return yearLabel(year, locale);
  return locale === 'zh' ? `${month}月` : MONTHS_EN[month - 1]!;
}

function dateTicks(min: number, max: number, rung: DateRung, locale: Locale): Ticks {
  const major: Tick[] = [];
  const minor: number[] = [];
  const y0 = Math.floor(min) - 1;
  const y1 = Math.ceil(max) + 1;
  const inside = (t: number) => t >= min - 1e-9 && t <= max + 1e-9;
  if (rung.major === 'month') {
    for (let y = y0; y <= y1; y++)
      for (let m = 1; m <= 12; m++) {
        const t = at(y, m);
        if (inside(t) && (m - 1) % rung.months === 0) major.push({ t, label: monthLabel(y, m, locale) });
        else if (inside(t) && rung.minor === 'month') minor.push(t);
        if (rung.minor === 'days')
          for (const d of [8, 15, 22]) {
            const td = at(y, m, d);
            if (inside(td)) minor.push(td);
          }
      }
  } else {
    const step = rung.years;
    for (let y = Math.floor(y0 / step) * step; y <= y1; y += step) {
      const t = at(y);
      if (inside(t)) major.push({ t, label: yearLabel(y, locale) });
    }
    if (rung.minorYears > 0) {
      for (let y = Math.floor(y0 / rung.minorYears) * rung.minorYears; y <= y1; y += rung.minorYears) {
        const t = at(y);
        if (inside(t) && y % step !== 0) minor.push(t);
      }
    } else if (rung.minorMonths) {
      for (let y = y0; y <= y1; y++)
        for (let m = 1 + rung.minorMonths; m <= 12; m += rung.minorMonths) {
          const t = at(y, m);
          if (inside(t)) minor.push(t);
        }
    }
  }
  return { major, minor, unit: '' };
}

function maTicks(min: number, max: number, majorMa: number, minorMa: number, locale: Locale): Ticks {
  const major: Tick[] = [];
  const minor: number[] = [];
  // Axis numbers are negative years; work in Ma ago (positive, decreasing to the right).
  const hi = -min / 1e6;
  const lo = -max / 1e6;
  const digits = Math.max(0, -Math.floor(Math.log10(minorMa) + 1e-9));
  const fmt = (ma: number) => ma.toFixed(Math.max(0, -Math.floor(Math.log10(majorMa) + 1e-9)));
  const n0 = Math.ceil(lo / minorMa - 1e-9);
  const n1 = Math.floor(hi / minorMa + 1e-9);
  const ratio = Math.round(majorMa / minorMa);
  for (let n = n1; n >= n0; n--) {
    const ma = Number((n * minorMa).toFixed(digits + 2));
    const t = ma === 0 ? 0 : -ma * 1e6;
    if (n % ratio === 0) major.push({ t, label: fmt(ma) });
    else minor.push(t);
  }
  return { major, minor, unit: locale === 'zh' ? '百万年前' : 'MA' };
}

/**
 * Ticks for `[min, max]` with at most `maxMajors` major ticks (falls back to
 * the coarsest rung). `maxMajors` is usually `width / ~70 px`.
 */
export function ruleTicks(min: number, max: number, scale: TimeScale, maxMajors: number, locale: Locale = 'en'): Ticks {
  const limit = Math.max(2, Math.floor(maxMajors));
  if (!(max > min)) return { major: [], minor: [], unit: '' };
  if (scale === 'ma') {
    const spanMa = (max - min) / 1e6;
    const rung = MA_LADDER.find(([major]) => spanMa / major <= limit) ?? MA_LADDER[MA_LADDER.length - 1]!;
    return maTicks(min, max, rung[0], rung[1], locale);
  }
  const span = max - min;
  const rung =
    DATE_LADDER.find((r) => span / (r.major === 'month' ? r.months / 12 : r.years) <= limit) ??
    DATE_LADDER[DATE_LADDER.length - 1]!;
  return dateTicks(min, max, rung, locale);
}

/**
 * Tick thinning for a non-linear axis (the band card on the timeline's
 * segmented mapping): keep a major tick's label only when it is at least
 * `labelGap` px from the last kept label, and drop minor ticks closer than
 * `minorGap` px to the previous tick drawn. Minor ticks come back as px
 * positions.
 */
export function thinTicks<T extends { t: number }>(
  major: readonly T[],
  minor: readonly number[],
  x: (t: number) => number,
  labelGap: number,
  minorGap = 3,
): { major: (T & { x: number; showLabel: boolean })[]; minor: number[] } {
  let lastLabel = -Infinity;
  const majors = major.map((m) => {
    const px = x(m.t);
    const showLabel = px - lastLabel >= labelGap;
    if (showLabel) lastLabel = px;
    return { ...m, x: px, showLabel };
  });
  const majorX = majors.map((m) => m.x);
  const minors: number[] = [];
  let last = -Infinity;
  for (const t of minor) {
    const px = x(t);
    if (px - last < minorGap || majorX.some((mx) => Math.abs(mx - px) < minorGap)) continue;
    minors.push(px);
    last = px;
  }
  return { major: majors, minor: minors };
}
