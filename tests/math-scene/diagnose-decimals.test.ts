/**
 * The decimals domain's diagnosis (docs/29 §2.1, §3.8): for every code two
 * wrong answers it explains and one it does not (the right answer never
 * shows a misconception); the three codes shared with other domains have
 * decimal rules of their own here.
 */
import { describe, expect, it } from 'vitest';
import { DECIMAL_CODES, DECIMAL_SHARED_CODES, MISCONCEPTION_DOMAINS, type ConvertUnit, type DecimalWork, type MisconceptionCode } from '../../src/engines/math-scene/schema';
import { carryDroppedProduct, carryDroppedSum, compareShows, decimalShows, fractionShows, orderShows, placeShows, shadeShows, shiftShows, type Claim } from '../../src/engines/math-scene/lib/diagnose/decimals';
import { formatDecimal, parseDecimal, type Decimal } from '../../src/engines/math-scene/lib/decimal';

const d = (s: string): Decimal => parseDecimal(s)!;
const dec = (s: string) => ({ kind: 'dec' as const, ...d(s) });
const W = (w: Partial<Omit<DecimalWork, 'a' | 'b' | 'of'>> & { a?: string; b?: string; of?: string | { n: number; d: number; w?: number } }): DecimalWork =>
  ({ ...w, a: w.a ? d(w.a) : undefined, b: w.b ? d(w.b) : undefined, of: typeof w.of === 'string' ? dec(w.of) : w.of }) as DecimalWork;

/** Does `x` show the code, for the work and its answer (places when rounding or money)? */
const shows = (code: MisconceptionCode, work: DecimalWork | null, answer: string, x: string, places: number | null = null) => decimalShows(code, { answer: d(answer), places, work }, d(x));

const add = (a: string, b: string) => W({ do: 'add', a, b });
const subtract = (a: string, b: string) => W({ do: 'subtract', a, b });
const multiply = (a: string, b: string) => W({ do: 'multiply', a, b });
const divide = (a: string, b: string) => W({ do: 'divide', a, b });
const roundTo = (a: string, to: number) => W({ do: 'round', a, to });
const scaleBy = (a: string, op: '×' | '÷', by: number) => W({ do: 'scale', a, op, by });
const convert = (a: string, from: ConvertUnit, into: ConvertUnit) => W({ do: 'convert', a, from, into });

describe('the decimals domain', () => {
  it('registers its 25 codes and borrows four', () => {
    expect(DECIMAL_CODES).toHaveLength(25);
    expect(MISCONCEPTION_DOMAINS.decimals).toEqual([...DECIMAL_CODES, ...DECIMAL_SHARED_CODES]);
    // A borrowed code stays registered once, in its home domain.
    expect(MISCONCEPTION_DOMAINS.fractions).toContain('tick-counting');
    expect(MISCONCEPTION_DOMAINS['whole-ops']).toContain('carry-not-added');
  });
});

describe('comparing and ordering', () => {
  const claim = (code: MisconceptionCode, a: string, b: string, c: Claim) => compareShows(code, d(a), d(b), c);
  it('longer-is-larger', () => {
    expect(claim('longer-is-larger', '0.25', '0.3', '>')).toBe(true);
    expect(claim('longer-is-larger', '4.5', '4.125', '<')).toBe(true);
    expect(orderShows('longer-is-larger', ['0.5', '0.45', '0.405', '0.54'].map(d), [0, 1, 3, 2], 'asc')).toBe(true);
    expect(claim('longer-is-larger', '0.4', '0.45', '>')).toBe(false);
  });
  it('shorter-is-larger', () => {
    expect(claim('shorter-is-larger', '0.4', '0.45', '>')).toBe(true);
    expect(claim('shorter-is-larger', '0.55', '0.5', '<')).toBe(true);
    expect(orderShows('shorter-is-larger', ['0.5', '0.45', '0.405', '0.54'].map(d), [2, 1, 3, 0], 'asc')).toBe(true);
    expect(claim('shorter-is-larger', '0.25', '0.3', '>')).toBe(false);
  });
  it('trailing-zero-changes', () => {
    expect(claim('trailing-zero-changes', '3.5', '3.50', '<')).toBe(true);
    expect(claim('trailing-zero-changes', '0.50', '0.5', '>')).toBe(true);
    expect(claim('trailing-zero-changes', '0.5', '0.50', '=')).toBe(false);
  });
});

describe('writing and reading decimals', () => {
  it('point-separator', () => {
    expect(shows('point-separator', add('2.35', '1.8'), '4.15', '3.43')).toBe(true);
    expect(shows('point-separator', multiply('0.4', '3'), '1.2', '0.12')).toBe(true);
    expect(shows('point-separator', add('0.9', '0.1'), '1', '0.10')).toBe(true);
    expect(shows('point-separator', multiply('2.36', '4'), '9.44', '8.144')).toBe(true);
    expect(shows('point-separator', add('0.9', '0.1'), '1', '1.0')).toBe(false);
  });
  it('zero-placeholder', () => {
    expect(shows('zero-placeholder', null, '0.07', '0.7')).toBe(true);
    expect(shows('zero-placeholder', W({ do: 'compose', parts: [{ digit: 4, place: 'O' }, { digit: 3, place: 'h' }, { digit: 5, place: 'th' }] }), '4.035', '4.35')).toBe(true);
    expect(shows('zero-placeholder', convert('3.05', 'm', 'cm'), '305', '350')).toBe(true);
    expect(shadeShows('zero-placeholder', d('0.06'), d('0.6'))).toBe(true);
    expect(placeShows('zero-placeholder', d('0.306'), d('0.36'), d('0.001'))).toBe(true);
    expect(shows('zero-placeholder', null, '0.07', '0.08')).toBe(false);
  });
  it('place-order', () => {
    const parts = W({ do: 'compose', parts: [{ digit: 4, place: 'O' }, { digit: 7, place: 'h' }, { digit: 2, place: 't' }] });
    expect(shows('place-order', parts, '4.27', '4.72')).toBe(true);
    expect(shows('place-order', W({ do: 'compose', parts: [{ digit: 6, place: 't' }, { digit: 3, place: 'O' }, { digit: 8, place: 'th' }] }), '3.608', '6.38')).toBe(true);
    expect(placeShows('place-order', d('0.235'), d('0.325'), d('0.001'))).toBe(true);
    expect(shows('place-order', parts, '4.27', '4.07')).toBe(false);
  });
  it('fraction-as-digits', () => {
    expect(shows('fraction-as-digits', W({ do: 'to-decimal', of: { n: 3, d: 4 } }), '0.75', '0.34')).toBe(true);
    expect(shows('fraction-as-digits', W({ do: 'to-decimal', of: { n: 2, d: 5 } }), '0.4', '0.25')).toBe(true);
    expect(fractionShows('fraction-as-digits', W({ do: 'to-fraction', of: '0.3' }), { n: 1, d: 3 })).toBe(true);
    expect(shows('fraction-as-digits', W({ do: 'to-decimal', of: { n: 3, d: 4 } }), '0.75', '0.7')).toBe(false);
  });
  it('place-denominator', () => {
    expect(fractionShows('place-denominator', W({ do: 'to-fraction', of: '0.35' }), { n: 35, d: 10 })).toBe(true);
    expect(fractionShows('place-denominator', W({ do: 'to-fraction', of: '0.7' }), { n: 7, d: 100 })).toBe(true);
    expect(shows('place-denominator', W({ do: 'to-decimal', of: { n: 3, d: 50 } }), '0.06', '0.6')).toBe(true);
    expect(fractionShows('place-denominator', W({ do: 'to-fraction', of: '0.35' }), { n: 35, d: 100 })).toBe(false);
  });
  it('interval-misread', () => {
    const read = W({ do: 'read', line: { from: d('0.2'), step: d('0.01') }, tick: 7 });
    expect(shows('interval-misread', read, '0.27', '0.9')).toBe(true);
    expect(shows('interval-misread', read, '0.27', '0.207')).toBe(true);
    expect(shows('interval-misread', read, '0.27', '0.28')).toBe(false);
  });
  it('tick-counting (shared with fractions)', () => {
    expect(placeShows('tick-counting', d('0.8'), d('0.7'), d('0.1'))).toBe(true);
    expect(placeShows('tick-counting', d('0.235'), d('0.234'), d('0.001'))).toBe(true);
    expect(shows('tick-counting', W({ do: 'read', line: { from: d('0.2'), step: d('0.01') }, tick: 7 }), '0.27', '0.28')).toBe(true);
    expect(placeShows('tick-counting', d('0.8'), d('0.9'), d('0.1'))).toBe(false);
  });
});

describe('rounding', () => {
  it('round-truncated', () => {
    expect(shows('round-truncated', roundTo('2.96', 1), '3.0', '2.9', 1)).toBe(true);
    expect(shows('round-truncated', divide('7', '6'), '1.17', '1.16', 2)).toBe(true);
    expect(shows('round-truncated', roundTo('0.65', 1), '0.7', '0.6', 1)).toBe(false);
  });
  it('round-carry-slip', () => {
    expect(shows('round-carry-slip', roundTo('2.96', 1), '3.0', '2.10', 1)).toBe(true);
    expect(shows('round-carry-slip', roundTo('4.98', 1), '5.0', '4.10', 1)).toBe(true);
    expect(shows('round-carry-slip', roundTo('4.63', 1), '4.6', '4.10', 1)).toBe(false);
  });
  it('places-short (one step short)', () => {
    expect(shows('places-short', roundTo('2.96', 1), '3.0', '3', 1)).toBe(true);
    expect(shows('places-short', null, '1.60', '1.6', 2)).toBe(true);
    expect(shows('places-short', null, '1.60', '1.6', null)).toBe(false);
  });
  it('round-wrong-place', () => {
    expect(shows('round-wrong-place', roundTo('3.476', 1), '3.5', '3.48', 1)).toBe(true);
    expect(shows('round-wrong-place', divide('10', '3'), '3.3', '3.33', 1)).toBe(true);
    expect(shows('round-wrong-place', roundTo('3.476', 1), '3.5', '3.4', 1)).toBe(false);
  });
  it('round-chain', () => {
    expect(shows('round-chain', roundTo('3.447', 1), '3.4', '3.5', 1)).toBe(true);
    expect(shows('round-chain', roundTo('2.449', 1), '2.4', '2.5', 1)).toBe(true);
    expect(shows('round-chain', roundTo('3.437', 1), '3.4', '3.5', 1)).toBe(false);
  });
  it('round-half-down', () => {
    expect(shows('round-half-down', roundTo('0.65', 1), '0.7', '0.6', 1)).toBe(true);
    expect(shows('round-half-down', roundTo('2.5', 0), '3', '2', 0)).toBe(true);
    expect(shows('round-half-down', roundTo('0.651', 1), '0.7', '0.6', 1)).toBe(false);
  });
});

describe('adding, subtracting, multiplying, dividing', () => {
  it('aligned-right', () => {
    expect(shows('aligned-right', add('3.4', '1.25'), '4.65', '1.59')).toBe(true);
    expect(shows('aligned-right', subtract('7.25', '1.5'), '5.75', '7.10')).toBe(true);
    expect(shows('aligned-right', add('3.4', '1.25'), '4.65', '4.56')).toBe(false);
  });
  it('carry-not-added (shared with whole numbers)', () => {
    expect(shows('carry-not-added', add('0.68', '0.57'), '1.25', '0.15')).toBe(true);
    expect(shows('carry-not-added', multiply('2.35', '3'), '7.05', '6.95')).toBe(true);
    expect(shows('carry-not-added', multiply('0.75', '4'), '3', '0.80')).toBe(true);
    expect(shows('carry-not-added', add('0.68', '0.57'), '1.25', '1.15')).toBe(false);
  });
  it('carry-not-added keeps the top place whole (as 47 × 3 → 121 for whole numbers)', () => {
    const sum = (a: string, b: string) => formatDecimal(carryDroppedSum(d(a), d(b)));
    const product = (a: string, k: number) => formatDecimal(carryDroppedProduct(d(a), k));
    // The top place written is the ones at least: 0 × 3 and 0 + 0 stay 0.
    expect(product('0.47', 3)).toBe('0.21');
    expect(product('2.35', 3)).toBe('6.95');
    expect(product('4.7', 3)).toBe('12.1');
    expect(product('12.5', 9)).toBe('98.5');
    expect(sum('0.68', '0.57')).toBe('0.15');
    expect(sum('4.7', '8.5')).toBe('12.2');
    expect(sum('6.25', '5.85')).toBe('11.00');
    expect(shows('carry-not-added', multiply('4.7', '3'), '14.1', '12.1')).toBe(true);
    expect(shows('carry-not-added', multiply('4.7', '3'), '14.1', '2.1')).toBe(false);
    expect(shows('carry-not-added', add('4.7', '8.5'), '13.2', '12.2')).toBe(true);
    expect(shows('carry-not-added', add('4.7', '8.5'), '13.2', '2.2')).toBe(false);
  });
  it('smaller-from-larger', () => {
    expect(shows('smaller-from-larger', subtract('0.72', '0.35'), '0.37', '0.43')).toBe(true);
    expect(shows('smaller-from-larger', subtract('7.2', '2.65'), '4.55', '5.45')).toBe(true);
    expect(shows('smaller-from-larger', subtract('0.72', '0.35'), '0.37', '0.47')).toBe(false);
  });
  it('empty-place-brought-down', () => {
    expect(shows('empty-place-brought-down', subtract('5', '1.47'), '3.53', '4.47')).toBe(true);
    expect(shows('empty-place-brought-down', subtract('7.2', '2.65'), '4.55', '4.65')).toBe(true);
    expect(shows('empty-place-brought-down', subtract('7.25', '2.65'), '4.6', '4.65')).toBe(false);
  });
  it('point-misplaced', () => {
    expect(shows('point-misplaced', multiply('2.35', '3'), '7.05', '70.5')).toBe(true);
    expect(shows('point-misplaced', divide('9', '4'), '2.25', '22.5')).toBe(true);
    expect(shows('point-misplaced', multiply('2.35', '3'), '7.05', '7.5')).toBe(false);
  });
  it('zero-in-quotient (shared with whole numbers)', () => {
    expect(shows('zero-in-quotient', divide('6.12', '6'), '1.02', '1.2')).toBe(true);
    expect(shows('zero-in-quotient', divide('4.2', '4'), '1.05', '1.5')).toBe(true);
    expect(shows('zero-in-quotient', divide('8.4', '4'), '2.1', '2.01')).toBe(false);
  });
  it('remainder-as-decimal', () => {
    expect(shows('remainder-as-decimal', divide('7', '4'), '1.75', '1.3')).toBe(true);
    expect(shows('remainder-as-decimal', divide('9', '4'), '2.25', '2.1')).toBe(true);
    expect(shows('remainder-as-decimal', divide('8.4', '4'), '2.1', '2.0')).toBe(false);
  });
});

describe('× ÷ 10, 100, 1000 and measures', () => {
  it('shift-wrong-way', () => {
    expect(shiftShows('shift-wrong-way', d('3.07'), '×', 100, d('0.0307'))).toBe(true);
    expect(shows('shift-wrong-way', convert('75', 'ml', 'l'), '0.075', '75000')).toBe(true);
    expect(shiftShows('shift-wrong-way', d('3.07'), '×', 100, d('30.7'))).toBe(false);
  });
  it('shift-count-wrong', () => {
    expect(shiftShows('shift-count-wrong', d('3.07'), '×', 100, d('30.7'))).toBe(true);
    expect(shows('shift-count-wrong', scaleBy('4.8', '÷', 100), '0.048', '0.48')).toBe(true);
    expect(shiftShows('shift-count-wrong', d('3.07'), '×', 100, d('0.0307'))).toBe(false);
  });
  it('zero-appended', () => {
    expect(shows('zero-appended', scaleBy('2.35', '×', 10), '23.5', '2.350')).toBe(true);
    expect(shows('zero-appended', scaleBy('0.4', '×', 100), '40', '0.400')).toBe(true);
    expect(shows('zero-appended', scaleBy('2.35', '×', 10), '23.5', '2.35')).toBe(false);
  });
  it('decimal-as-subunit', () => {
    expect(shows('decimal-as-subunit', convert('2.5', 'kg', 'g'), '2500', '2005')).toBe(true);
    expect(shows('decimal-as-subunit', convert('4005', 'g', 'kg'), '4.005', '4.5')).toBe(true);
    expect(shows('decimal-as-subunit', convert('2.5', 'dollar', 'cent'), '250', '205')).toBe(true);
    expect(shows('decimal-as-subunit', convert('1.25', 'm', 'cm'), '125', '1025')).toBe(false);
  });
  it('unit-factor-wrong', () => {
    expect(shows('unit-factor-wrong', convert('1.5', 'km', 'm'), '1500', '150')).toBe(true);
    expect(shows('unit-factor-wrong', convert('0.75', 'kg', 'g'), '750', '75')).toBe(true);
    expect(shows('unit-factor-wrong', convert('1.5', 'km', 'm'), '1500', '1.5')).toBe(false);
  });
});

describe('every code has its rules tested here', () => {
  it('lists each decimals code in a test above', () => {
    // Read from this file: a new code without tests fails here.
    const covered = new Set(['longer-is-larger', 'shorter-is-larger', 'trailing-zero-changes', 'point-separator', 'zero-placeholder', 'place-order', 'fraction-as-digits', 'place-denominator', 'interval-misread', 'round-truncated', 'round-carry-slip', 'places-short', 'round-wrong-place', 'round-chain', 'round-half-down', 'aligned-right', 'smaller-from-larger', 'empty-place-brought-down', 'point-misplaced', 'remainder-as-decimal', 'shift-wrong-way', 'shift-count-wrong', 'zero-appended', 'decimal-as-subunit', 'unit-factor-wrong']);
    expect(DECIMAL_CODES.filter((c) => !covered.has(c))).toEqual([]);
  });
});
