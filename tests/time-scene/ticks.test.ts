import { describe, expect, it } from 'vitest';
import { ruleTicks } from '../../src/engines/time-scene/lib/ticks';
import { toNumber } from '../../src/engines/time-scene/lib/time';

describe('ruleTicks', () => {
  it('uses months as majors for a span of a few months (year label on January)', () => {
    const ticks = ruleTicks(toNumber('2000-01-01'), toNumber('2000-08-01'), 'date', 12, 'en');
    expect(ticks.major.map((m) => m.label)).toEqual(['2000', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG']);
    expect(ticks.minor).toContain(toNumber('2000-01-15'));
    expect(ticks.unit).toBe('');
  });

  it('localises month labels', () => {
    const ticks = ruleTicks(toNumber('2000-01-01'), toNumber('2000-04-01'), 'date', 12, 'zh');
    expect(ticks.major.map((m) => m.label)).toEqual(['2000', '2月', '3月', '4月']);
  });

  it('uses years with month minors for a war-length span', () => {
    const ticks = ruleTicks(toNumber('1939-09-01'), toNumber('1945-09-02'), 'date', 14, 'en');
    expect(ticks.major.map((m) => m.label)).toEqual(['1940', '1941', '1942', '1943', '1944', '1945']);
    expect(ticks.minor).toContain(toNumber('1942-02'));
    expect(ticks.minor).not.toContain(toNumber('1942'));
  });

  it('coarsens when there is little room', () => {
    const ticks = ruleTicks(toNumber('1900'), toNumber('2000'), 'date', 5, 'en');
    expect(ticks.major.map((m) => m.label)).toEqual(['1900', '1925', '1950', '1975', '2000']);
    expect(ticks.minor).toContain(toNumber('1905'));
  });

  it('labels BCE years', () => {
    const ticks = ruleTicks(toNumber('-0300'), toNumber('-0100'), 'date', 4, 'en');
    expect(ticks.major.map((m) => m.label)).toEqual(['300 BCE', '250 BCE', '200 BCE', '150 BCE', '100 BCE']);
  });

  it('ticks geological time in Ma with a unit caption', () => {
    const ticks = ruleTicks(toNumber({ ma: 250 }), toNumber({ ma: 200 }), 'ma', 8, 'en');
    expect(ticks.major.map((m) => m.label)).toEqual(['250', '240', '230', '220', '210', '200']);
    expect(ticks.minor).toHaveLength(45);
    expect(ticks.unit).toBe('MA');
    expect(ruleTicks(-2.5e8, -2e8, 'ma', 8, 'zh').unit).toBe('百万年前');
  });

  it('returns nothing for an empty span', () => {
    expect(ruleTicks(5, 5, 'date', 10).major).toEqual([]);
  });
});
