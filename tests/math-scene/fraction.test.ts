import { describe, expect, it } from 'vitest';
import {
  add,
  compare,
  equal,
  equivalent,
  formatFrac,
  gcd,
  isSimplest,
  lcm,
  over,
  parseFrac,
  related,
  simplify,
  sub,
  toImproper,
  toMixed,
  valueOnLine,
} from '../../src/engines/math-scene/lib/fraction';

const f = (s: string) => parseFrac(s)!;

describe('fraction arithmetic', () => {
  it('parses the data notation', () => {
    expect(parseFrac('3/4')).toEqual({ n: 3, d: 4 });
    expect(parseFrac('1 3/4')).toEqual({ w: 1, n: 3, d: 4 });
    expect(parseFrac('2')).toEqual({ n: 2, d: 1 });
    expect(parseFrac(' 12/12 ')).toEqual({ n: 12, d: 12 });
    for (const bad of ['3/0', '1 2', '/4', '3/', 'a/b', '1.5', '-1/2', '']) expect(parseFrac(bad)).toBeNull();
    expect(formatFrac(f('1 3/4'))).toBe('1 3/4');
    expect(formatFrac(f('2'))).toBe('2');
  });

  it('gcd and lcm', () => {
    expect(gcd(8, 12)).toBe(4);
    expect(gcd(5, 8)).toBe(1);
    expect(gcd(0, 7)).toBe(7);
    expect(lcm(4, 6)).toBe(12);
    expect(lcm(3, 12)).toBe(12);
    expect(lcm(0, 5)).toBe(0);
  });

  it('simplest form, including 0, n = d and twelfths', () => {
    expect(simplify(f('8/12'))).toEqual({ n: 2, d: 3 });
    expect(simplify(f('12/12'))).toEqual({ n: 1, d: 1 });
    expect(simplify(f('0/12'))).toEqual({ n: 0, d: 1 });
    expect(simplify(f('1 2/4'))).toEqual({ n: 3, d: 2 });
    expect(isSimplest(f('5/8'))).toBe(true);
    expect(isSimplest(f('4/6'))).toBe(false);
    expect(isSimplest(f('0/5'))).toBe(true);
  });

  it('equal is the same writing, equivalent the same value', () => {
    expect(equal(f('2/4'), f('2/4'))).toBe(true);
    expect(equal(f('2/4'), f('1/2'))).toBe(false);
    expect(equivalent(f('2/4'), f('1/2'))).toBe(true);
    expect(equivalent(f('1 3/4'), f('7/4'))).toBe(true);
    expect(equivalent(f('4/4'), f('1'))).toBe(true);
    expect(equivalent(f('2/3'), f('3/4'))).toBe(false);
  });

  it('compares without floats', () => {
    expect(compare(f('1/3'), f('1/5'))).toBe(1);
    expect(compare(f('2/3'), f('3/4'))).toBe(-1);
    expect(compare(f('6/8'), f('3/4'))).toBe(0);
    expect(compare(f('2 1/3'), f('7/3'))).toBe(0);
  });

  it('adds and subtracts related fractions in lowest terms', () => {
    expect(add(f('1/2'), f('1/4'))).toEqual({ n: 3, d: 4 });
    expect(add(f('1/3'), f('5/12'))).toEqual({ n: 3, d: 4 });
    expect(add(f('2/7'), f('3/7'))).toEqual({ n: 5, d: 7 });
    expect(sub(f('7/8'), f('1/2'))).toEqual({ n: 3, d: 8 });
    expect(sub(f('5/6'), f('1/3'))).toEqual({ n: 1, d: 2 });
    expect(sub(f('1'), f('5/12'))).toEqual({ n: 7, d: 12 });
    expect(sub(f('3/4'), f('3/4'))).toEqual({ n: 0, d: 1 });
    expect(sub(f('1/4'), f('1/2'))).toEqual({ n: -1, d: 4 });
  });

  it('related denominators', () => {
    expect(related(f('1/2'), f('3/8'))).toBe(true);
    expect(related(f('5/6'), f('7/12'))).toBe(true);
    expect(related(f('2/3'), f('3/4'))).toBe(false);
    expect(related(f('3/7'), f('5/7'))).toBe(true);
  });

  it('mixed and improper', () => {
    expect(toImproper(f('1 3/4'))).toEqual({ n: 7, d: 4 });
    expect(toMixed(f('11/4'))).toEqual({ w: 2, n: 3, d: 4 });
    expect(toMixed(f('8/4'))).toEqual({ w: 2, n: 0, d: 4 });
    expect(toMixed(f('3/4'))).toEqual({ n: 3, d: 4 });
  });

  it('renames over a denominator and finds a value on a line', () => {
    expect(over(f('3/4'), 12)).toEqual({ n: 9, d: 12 });
    expect(over(f('2/3'), 8)).toBeNull();
    expect(valueOnLine(f('3/4'), { from: 0, intervals: 8 })).toBe(6);
    expect(valueOnLine(f('2 1/3'), { from: 0, intervals: 3 })).toBe(7);
    expect(valueOnLine(f('1/3'), { from: 0, intervals: 4 })).toBeNull();
  });
});
