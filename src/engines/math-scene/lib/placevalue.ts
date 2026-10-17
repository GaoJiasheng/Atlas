/**
 * The place-value chart with decimal places (docs/29 §3.3, model A6b):
 * places from thousands down to thousandths, a count of discs in each
 * (`1`, `0.1`, `0.01`, `0.001`; with money `$1`, `10¢`, `1¢`), trading 10 of
 * a place for 1 of the next and back, sharing a place into equal plates, the
 * digits moved n places by × 10ⁿ (the point never moves), and the numbers of
 * the column method lined up on the point. Values are counted in
 * thousandths (whole numbers). Pure.
 */
import { DPLACES, type DCountsSpec, type DPlace, type DTrade, type PlaceValueSpec } from '../schema';
import { digitAt, fromThousandths, minPlaces, thousandths, wholePart, type Decimal } from './decimal';

export type DCounts = Record<DPlace, number>;

/** The power of ten of each place: thousands 3 … ones 0, tenths −1 … thousandths −3. */
export const PLACE_EXP: Record<DPlace, number> = { Th: 3, H: 2, T: 1, O: 0, t: -1, h: -2, th: -3 };
/** Thousandths one disc of the place is worth. */
export const placeTh = (p: DPlace): number => 10 ** (PLACE_EXP[p] + 3);

export const DZERO: DCounts = { Th: 0, H: 0, T: 0, O: 0, t: 0, h: 0, th: 0 };

export const dcounts = (c: DCountsSpec | undefined): DCounts => ({ Th: c?.Th ?? 0, H: c?.H ?? 0, T: c?.T ?? 0, O: c?.O ?? 0, t: c?.t ?? 0, h: c?.h ?? 0, th: c?.th ?? 0 });
/** The value of the discs, in thousandths. */
export const dtotal = (c: DCounts): number => DPLACES.reduce((s, p) => s + c[p] * placeTh(p), 0);
export const discCount = (c: DCounts): number => DPLACES.reduce((s, p) => s + c[p], 0);

/** The place below and above (`null` past thousandths / thousands). */
export const below = (p: DPlace): DPlace | null => DPLACES[DPLACES.indexOf(p) + 1] ?? null;
export const above = (p: DPlace): DPlace | null => DPLACES[DPLACES.indexOf(p) - 1] ?? null;

/** A decimal's digits by place (it has at most three places). */
export function dstandard(d: Decimal): DCounts {
  const out = { ...DZERO };
  for (const p of DPLACES) out[p] = digitAt(d, PLACE_EXP[p] >= 0 ? PLACE_EXP[p] + 1 : PLACE_EXP[p]);
  return out;
}

/** Thousandths as a decimal written with the places it needs (at least `dp`). */
export function asDecimal(n: number, dp = 0): Decimal {
  const d = fromThousandths(n, 0);
  return { ...d, dp: Math.max(dp, minPlaces(d)) };
}

/** The places a trade takes from and gives to. */
export function dtradeOf(trade: DTrade): { from: DPlace; to: DPlace; take: number; give: number } {
  const [from, to] = trade.split('>') as [DPlace, DPlace];
  const up = PLACE_EXP[to] > PLACE_EXP[from];
  return { from, to, take: up ? 10 : 1, give: up ? 1 : 10 };
}

export const canDTrade = (c: DCounts, trade: DTrade): boolean => c[dtradeOf(trade).from] >= dtradeOf(trade).take;

export function applyDTrade(c: DCounts, trade: DTrade): DCounts {
  if (!canDTrade(c, trade)) return c;
  const t = dtradeOf(trade);
  return { ...c, [t.from]: c[t.from] - t.take, [t.to]: c[t.to] + t.give };
}

/** Every place under 10 (the number reads off the chart). */
export const dregrouped = (c: DCounts): boolean => DPLACES.every((p) => c[p] < 10);

/** Share one place into `k` plates as far as it goes. */
export function dsharePlace(mat: DCounts, dealt: DCounts, place: DPlace, k: number): { mat: DCounts; dealt: DCounts } {
  const each = Math.floor(mat[place] / k);
  if (each === 0) return { mat, dealt };
  return { mat: { ...mat, [place]: mat[place] - each * k }, dealt: { ...dealt, [place]: dealt[place] + each } };
}

/** The highest place with a disc (ones at least) and the lowest the value or `dp` needs (ones at least). */
export function spanOf(n: number, dp: number): { top: DPlace; bottom: DPlace } {
  const whole = Math.floor(n / 1000);
  const top: DPlace = whole >= 1000 ? 'Th' : whole >= 100 ? 'H' : whole >= 10 ? 'T' : 'O';
  const need = Math.max(dp, minPlaces(fromThousandths(n, 0)));
  const bottom: DPlace = need >= 3 ? 'th' : need === 2 ? 'h' : need === 1 ? 't' : 'O';
  return { top, bottom };
}

/** The place of a power of ten (clamped to thousands … thousandths). */
export const placeAt = (e: number): DPlace => DPLACES.find((p) => PLACE_EXP[p] === Math.max(-3, Math.min(3, e)))!;

/** The places from `top` down to `bottom`. */
export const placesBetween = (top: DPlace, bottom: DPlace): DPlace[] => DPLACES.slice(DPLACES.indexOf(top), DPLACES.indexOf(bottom) + 1);

/** Places of a decimal, highest first, at least ones (2.35 → O t h). */
export function placesOf(d: Decimal): DPlace[] {
  const n = thousandths(d) ?? 0;
  const s = spanOf(n, d.dp);
  return placesBetween(s.top, s.bottom);
}

/** The columns a chart draws: given, else every value's places joined (and the digits shifted, and the plates' places). */
export function chartColumns(m: PlaceValueSpec, extra: Decimal[] = []): DPlace[] {
  if (m.columns) return m.columns;
  const values = [...(m.value ? [m.value] : []), ...(m.rows ?? []), ...(typeof m.pad === 'object' ? [m.pad] : []), ...extra];
  let top = 0;
  let bottom = 0;
  for (const v of values) {
    const ps = placesOf(v);
    top = Math.max(top, PLACE_EXP[ps[0]!]);
    bottom = Math.min(bottom, PLACE_EXP[ps.at(-1)!]);
  }
  // The digits slid along keep their own columns on the chart (the point does not move).
  const shift = m.shift ? m.shift.by * (m.shift.dir === 'left' ? 1 : -1) : 0;
  if (m.value && shift) {
    const ps = placesOf(m.value);
    top = Math.max(top, PLACE_EXP[ps[0]!] + shift);
    bottom = Math.min(bottom, PLACE_EXP[ps.at(-1)!] + shift);
  }
  return placesBetween(placeAt(top), placeAt(bottom));
}

/** The value of the discs on the chart (`left`, or the value; × copies pushed together). */
export function chartCounts(m: PlaceValueSpec): DCounts {
  if (m.left) return dcounts(m.left);
  const v = m.value ? dstandard(m.value) : { ...DZERO };
  if (m.copies && m.combined) return Object.fromEntries(DPLACES.map((p) => [p, v[p] * m.copies!])) as DCounts;
  return v;
}

/** The number a chart shows after its shift (× or ÷ by 10ⁿ). */
export function shiftedValue(d: Decimal, by: number): Decimal | null {
  const n = thousandths(d);
  if (n === null) return null;
  const k = by >= 0 ? n * 10 ** by : n / 10 ** -by;
  if (!Number.isInteger(k)) return null;
  return asDecimal(k);
}

/** The whole part of a decimal at most 9999 (the chart's thousands). */
export const fitsChart = (d: Decimal): boolean => wholePart(d) <= 9999 && thousandths(d) !== null;

/** A disc's printed face: `1`, `0.1` … or with money `$1`, `10¢`, `1¢`. */
export function discFace(p: DPlace, money: boolean): string {
  if (money) return p === 'O' ? '$1' : p === 't' ? '10¢' : p === 'h' ? '1¢' : p === 'T' ? '$10' : p === 'H' ? '$100' : p === 'Th' ? '$1000' : '';
  return { Th: '1000', H: '100', T: '10', O: '1', t: '0.1', h: '0.01', th: '0.001' }[p];
}
