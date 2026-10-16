import { describe, expect, it } from 'vitest';
import { glueBceDates, yearRange } from '../scripts/lib/topic-dates';

describe('new-topic BCE dates', () => {
  it('glues a BCE date to its flag so parseArgs reads it as a value', () => {
    expect(glueBceDates(['ws', '--start', '-0770-01-01', '--end', '-0221-12-31'])).toEqual(['ws', '--start=-0770-01-01', '--end=-0221-12-31']);
    expect(glueBceDates(['--start', '-0770', '--title-en', 'x'])).toEqual(['--start=-0770', '--title-en', 'x']);
    expect(glueBceDates(['--start', '1914-07-28', '--end=-0221'])).toEqual(['--start', '1914-07-28', '--end=-0221']);
    // Not a date: left alone (parseArgs reports it).
    expect(glueBceDates(['--start', '--end', '1918'])).toEqual(['--start', '--end', '1918']);
  });

  it('writes the default subtitle in each language', () => {
    expect(yearRange('-0770', '-0221', 'en')).toBe('770–221 BCE');
    expect(yearRange('-0770-01-01', '-0221-12-31', 'zh')).toBe('公元前770–前221年');
    expect(yearRange('-0027', '0014', 'en')).toBe('27 BCE–14 CE');
    expect(yearRange('1947-03-12', '1991-12-26', 'zh')).toBe('1947–1991');
  });
});
