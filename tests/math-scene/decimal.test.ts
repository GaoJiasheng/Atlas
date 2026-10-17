/**
 * Exact decimals (docs/29 §3.1 X1, §3.10): parsing digit by digit, values and
 * how they are written, arithmetic on whole millionths (no floats), long
 * division, rounding half up, the digits moved by × ÷ 10ⁿ, fractions.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { add, cmp, digitAt, divWhole, eq, formatDecimal, fromFraction, minPlaces, mulWhole, parseDecimal, round, same, scale, sub, toFraction, truncate, type Decimal } from '../../src/engines/math-scene/lib/decimal';
import { answerValue, decimal } from '../../src/engines/math-scene/schema';

const d = (s: string): Decimal => parseDecimal(s)!;
const f = (x: Decimal | null) => (x ? formatDecimal(x) : null);

describe('decimals are exact', () => {
  it('parses text digit by digit and keeps how it is written', () => {
    expect(d('0.50')).toEqual({ units: 500_000, dp: 2 });
    expect(d('.35')).toEqual({ units: 350_000, dp: 2 });
    expect(d('3')).toEqual({ units: 3_000_000, dp: 0 });
    expect(d('99999.999999')).toEqual({ units: 99_999_999_999, dp: 6 });
    for (const bad of ['1.2.3', '-1', '', '.', '5.', '1e3', '0,5', '123456']) expect(parseDecimal(bad), bad).toBeNull();
    expect(f(d('0.50'))).toBe('0.50');
    expect(f(d('.35'))).toBe('0.35');
    expect(formatDecimal(d('12345.6'), true)).toBe('12 345.6');
  });

  it('tells equal values from equal writing', () => {
    expect(eq(d('0.5'), d('0.50'))).toBe(true);
    expect(same(d('0.5'), d('0.50'))).toBe(false);
    expect(cmp(d('0.3'), d('0.25'))).toBe(1);
    expect(cmp(d('0.4'), d('0.45'))).toBe(-1);
    expect(minPlaces(d('2.50'))).toBe(1);
  });

  it('adds without a float: 0.1 + 0.2 = 0.3', () => {
    expect(f(add(d('0.1'), d('0.2')))).toBe('0.3');
    expect(eq(add(d('0.1'), d('0.2')), d('0.3'))).toBe(true);
    expect(f(add(d('0.45'), d('0.38')))).toBe('0.83');
    expect(f(add(d('3.4'), d('1.25')))).toBe('4.65');
    expect(f(sub(d('5'), d('1.47')))).toBe('3.53');
    expect(sub(d('1.2'), d('3'))).toBeNull();
    expect(f(mulWhole(d('2.35'), 3))).toBe('7.05');
  });

  it('rounds half up, keeping the places asked for', () => {
    expect(f(round(d('1.005'), 2))).toBe('1.01');
    expect(f(round(d('2.96'), 1))).toBe('3.0');
    expect(f(round(d('0.65'), 1))).toBe('0.7');
    expect(f(round(d('3.447'), 1))).toBe('3.4');
    expect(f(round(d('7.5'), 0))).toBe('8');
    expect(f(truncate(d('2.96'), 1))).toBe('2.9');
  });

  it('divides by long division, exact or not', () => {
    expect(divWhole(d('1.5'), 4)).toEqual({ q: d('0.375'), exact: true });
    expect(f(divWhole(d('7'), 4).q)).toBe('1.75');
    expect(f(divWhole(d('6.12'), 6).q)).toBe('1.02');
    const third = divWhole(d('2'), 3);
    expect(third.exact).toBe(false);
    expect(f(round(third.q, 2))).toBe('0.67');
  });

  it('moves the digits for × ÷ 10ⁿ', () => {
    expect(f(scale(d('2.35'), 3))).toBe('2350');
    expect(f(scale(d('4.8'), -2))).toBe('0.048');
    expect(f(scale(d('6'), -3))).toBe('0.006');
    expect(scale(d('0.000005'), -1)).toBeNull();
  });

  it('reads a digit by its place', () => {
    const x = d('34.506');
    expect([digitAt(x, 2), digitAt(x, 1), digitAt(x, -1), digitAt(x, -2), digitAt(x, -3)]).toEqual([3, 4, 5, 0, 6]);
  });

  it('turns into a fraction and back only when the denominator has factors 2 and 5', () => {
    expect(toFraction(d('0.35'))).toEqual({ n: 7, d: 20 });
    expect(toFraction(d('2.75'))).toEqual({ n: 11, d: 4 });
    expect(f(fromFraction({ n: 3, d: 4 }))).toBe('0.75');
    expect(f(fromFraction({ w: 1, n: 1, d: 2 }))).toBe('1.5');
    expect(fromFraction({ n: 1, d: 3 })).toBeNull();
    expect(f(fromFraction({ n: 1, d: 8 }))).toBe('0.125');
    expect(fromFraction({ n: 1, d: 16 })).toBeNull();
  });

  it('the data writes decimals as strings, never as JSON numbers with a point', () => {
    expect(decimal.parse('0.50')).toEqual({ units: 500_000, dp: 2 });
    expect(decimal.parse(3)).toEqual({ units: 3_000_000, dp: 0 });
    expect(decimal.safeParse(0.5).error?.issues[0]?.message).toContain('write decimals as strings');
    expect(answerValue.safeParse(0.5).error?.issues[0]?.message).toContain('write decimals as strings');
    expect(answerValue.parse('0.35')).toEqual({ kind: 'dec', units: 350_000, dp: 2 });
  });

  it('lib/decimal.ts and the decimal diagnosis never use a float conversion', () => {
    for (const file of ['src/engines/math-scene/lib/decimal.ts', 'src/engines/math-scene/lib/diagnose/decimals.ts']) {
      const text = readFileSync(join(import.meta.dirname, '../..', file), 'utf8');
      expect(text, file).not.toMatch(/parseFloat|toFixed|toPrecision|Number\(text\)/);
    }
  });
});
