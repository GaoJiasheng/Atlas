/**
 * Human-readable time for the timeline readout, chapter nodes and event
 * details. Hand-written (no Intl date formatting) so output is identical in
 * every browser and in tests.
 *
 *   en: '1942' -> '1942', '1942-02' -> 'Feb 1942', '1942-02-15' -> '15 Feb 1942',
 *       '-0221' -> '221 BCE', { ma: 200 } -> '200 Ma'
 *   zh: '1942年', '1942年2月', '1942年2月15日', '公元前221年', '2亿年前' / '6600万年前'
 */
import type { Locale } from '../../../i18n';
import { isGeoTime, type TimePoint } from '../../../lib/time';

const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DATE_RE = /^(-?)(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/;

/** Up to `digits` decimals, trailing zeros trimmed. */
function trim(n: number, digits: number): string {
  const s = n.toFixed(digits);
  return s.includes('.') ? s.replace(/\.?0+$/, '') : s;
}

function groupThousands(s: string): string {
  const [int = '', frac] = s.split('.');
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return frac ? `${grouped}.${frac}` : grouped;
}

function formatMa(ma: number, locale: Locale): string {
  if (locale === 'zh') {
    if (ma === 0) return '现在';
    const years = ma * 1e6;
    if (years >= 1e8) return `${trim(years / 1e8, 2)}亿年前`;
    if (years >= 1e4) return `${trim(years / 1e4, 1)}万年前`;
    return `${trim(years, 0)}年前`;
  }
  return `${groupThousands(trim(ma, 2))} Ma`;
}

export function formatTime(t: TimePoint, locale: Locale): string {
  if (isGeoTime(t)) return formatMa(t.ma, locale);
  const m = DATE_RE.exec(t);
  if (!m) return t;
  const bce = m[1] === '-';
  const year = Number(m[2]);
  const month = m[3] ? Number(m[3]) : null;
  const day = m[4] ? Number(m[4]) : null;

  if (locale === 'zh') {
    let s = `${bce ? '公元前' : ''}${year}年`;
    if (month !== null) s += `${month}月`;
    if (day !== null) s += `${day}日`;
    return s;
  }
  let s = `${year}${bce ? ' BCE' : ''}`;
  if (month !== null) s = `${MONTHS_EN[month - 1]} ${s}`;
  if (day !== null) s = `${day} ${s}`;
  return s;
}

/**
 * "One icon = N": a round N (1, 2, 5 × 10^k) so the largest value needs at
 * most `maxIcons` icons.
 */
export function nicePer(max: number, maxIcons = 20): number {
  if (!(max > 0)) return 1;
  const raw = max / maxIcons;
  const exp = 10 ** Math.floor(Math.log10(raw));
  for (const m of [1, 2, 5, 10]) if (m * exp >= raw) return Math.max(1, m * exp);
  return Math.max(1, 10 * exp);
}

/**
 * Units per Counter icon for numbers of people: from 1,000,000 up to
 * 5,000,000 the fixed "1 icon = 100,000 people" unit (at most 50 icons),
 * otherwise `nicePer`.
 */
export function counterPer(max: number): number {
  if (max >= 1_000_000 && max <= 5_000_000) return 100_000;
  return nicePer(max);
}
