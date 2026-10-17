/**
 * Dated features (lib/dated.ts): the `[from, to)` window shared by the
 * regional plate's rivers and the island coast by date, and the check that a
 * sequence of eras tiles time once.
 */
import { describe, expect, it } from 'vitest';
import { datedAt, datedWindow, eraSequenceIssues, hasDate, isDatedAt } from '../../src/engines/time-scene/lib/dated';
import { toNumber } from '../../src/engines/time-scene/lib/time';

describe('dated windows', () => {
  it('open ends are infinite; a malformed end counts as open', () => {
    expect(datedWindow(undefined, undefined)).toEqual({ from: -Infinity, to: Infinity });
    expect(datedWindow('1823-01-01', undefined)).toEqual({ from: toNumber('1823-01-01'), to: Infinity });
    expect(datedWindow(undefined, '-0602')).toEqual({ from: -Infinity, to: -602 });
    expect(datedWindow('not a date', '1900')).toEqual({ from: -Infinity, to: 1900 });
  });

  it('a window holds from <= t < to', () => {
    const w = datedWindow('1823-01-01', '1887-01-01');
    expect(isDatedAt(w, toNumber('1823-01-01'))).toBe(true);
    expect(isDatedAt(w, toNumber('1886-12-31'))).toBe(true);
    expect(isDatedAt(w, toNumber('1887-01-01'))).toBe(false);
    expect(isDatedAt(w, toNumber('1822-12-31'))).toBe(false);
  });

  it('datedAt keeps the order of the input', () => {
    const items = [
      { id: 'a', ...datedWindow(undefined, '1900') },
      { id: 'b', ...datedWindow('1850', undefined) },
      { id: 'c', ...datedWindow('1950', undefined) },
    ];
    expect(datedAt(items, 1875).map((x) => x.id)).toEqual(['a', 'b']);
    expect(datedAt(items, 1960).map((x) => x.id)).toEqual(['b', 'c']);
  });

  it('hasDate looks for either end', () => {
    expect(hasDate({ from: '1900' })).toBe(true);
    expect(hasDate({ to: '1900' })).toBe(true);
    expect(hasDate({})).toBe(false);
    expect(hasDate(null)).toBe(false);
  });
});

describe('era sequences', () => {
  const eras = (...pairs: [string | undefined, string | undefined][]) => pairs.map(([a, b]) => datedWindow(a, b));

  it('accepts eras that tile time, in any order', () => {
    expect(eraSequenceIssues(eras([undefined, '1823-01-01'], ['1823-01-01', '1887-01-01'], ['1887-01-01', undefined]))).toEqual([]);
    expect(eraSequenceIssues(eras(['1887-01-01', undefined], [undefined, '1887-01-01']))).toEqual([]);
    expect(eraSequenceIssues(eras(['1900', '1950']))).toEqual([]);
  });

  it('reports overlaps, gaps, inner open ends and empty windows, by input position', () => {
    expect(eraSequenceIssues(eras([undefined, '1900'], ['1890', undefined]))).toEqual(['#1 overlaps #0 (it starts before #0 ends)']);
    expect(eraSequenceIssues(eras([undefined, '1900'], ['1910', undefined]))).toEqual(['gap between #0 and #1 (no era in force in between)']);
    expect(eraSequenceIssues(eras([undefined, undefined], ['1900', undefined]))).toContain('#0: only the last era may leave out `to`');
    expect(eraSequenceIssues(eras(['1900', undefined], [undefined, '1900'], [undefined, '1800']))).toContain('#1: only the first era may leave out `from`');
    expect(eraSequenceIssues(eras(['1900', '1900']))).toEqual(['#0: `to` must be after `from`']);
  });
});
