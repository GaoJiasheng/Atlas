/**
 * BCE topics (docs/27 §4 G1–G3): the bar's segment labels, the readout and the
 * band card ticks print `770 BCE` / `前770年`, never `-0770-01`; a topic with
 * `datePrecision: year` reads and writes years; chapter order compares as time.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse as parseYaml } from 'yaml';
import { buildTimeModel } from '../../src/engines/time-scene/lib/model';
import { timeSceneGeoData } from '../../src/engines/time-scene/schema';
import { fromNumber, toNumber } from '../../src/engines/time-scene/lib/time';
import { ruleTicks } from '../../src/engines/time-scene/lib/ticks';
import { formatNumber, formatReadout, segmentDate } from '../../src/engines/time-scene/timeline/Timeline';
import { compareTime } from '../../src/lib/time';

const DIR = join(import.meta.dirname, '../../src/content/topics/sample-region');
const json = (name: string) => JSON.parse(readFileSync(join(DIR, 'data', `${name}.json`), 'utf8'));
const data = timeSceneGeoData.parse({
  entities: json('entities'),
  control: json('control'),
  movements: json('movements'),
  events: json('events'),
  presets: json('presets'),
  sources: json('sources'),
});

describe('BCE on the timeline', () => {
  const yearly = buildTimeModel(data, [], { datePrecision: 'year' });
  const daily = buildTimeModel(data, []);

  it('segment labels are years, never ISO strings', () => {
    expect(segmentDate(toNumber('-0770'), yearly, 'en')).toBe('770 BCE');
    expect(segmentDate(toNumber('-0770'), yearly, 'zh')).toBe('前770年');
    // BCE without datePrecision still prints the year.
    expect(segmentDate(toNumber('-0310-03-01'), daily, 'en')).toBe('310 BCE');
    expect(segmentDate(toNumber('-0310-03-01'), daily, 'zh')).toBe('前310年');
  });

  it('modern topics keep YYYY-MM', () => {
    const modern = { ...daily, min: 1939, max: 1945, span: 6, datePrecision: undefined };
    expect(segmentDate(toNumber('1941-12-08'), modern, 'en')).toBe('1941-12');
  });

  it('the readout follows datePrecision', () => {
    const t = toNumber('-0260-05-14');
    expect(formatReadout(t, yearly, 'en')).toBe('260 BCE');
    expect(formatNumber(t, yearly, 'zh')).toBe('公元前260年');
    const short = { ...daily, span: 5, datePrecision: undefined };
    expect(formatNumber(t, short, 'en')).toBe('14 May 260 BCE');
  });

  it('a year-precision topic writes years back (URL t=)', () => {
    const t = toNumber('-0350') + 0.4;
    expect(fromNumber(t, 'date', { precision: 'year' })).toBe('-0350');
    expect(toNumber('-0350')).toBe(-350);
  });

  it('band card ticks over five centuries are BCE years', () => {
    const ticks = ruleTicks(toNumber('-0770'), toNumber('-0221'), 'date', 8, 'en');
    expect(ticks.major.map((m) => m.label)).toEqual(['700 BCE', '600 BCE', '500 BCE', '400 BCE', '300 BCE']);
    expect(ruleTicks(toNumber('-0770'), toNumber('-0221'), 'date', 8, 'zh').major[0]!.label).toBe('前700');
  });

  it('chapter order is time order, compared as dates (not strings)', () => {
    const times = readdirSync(join(DIR, 'chapters'))
      .sort()
      .map((f) => readFileSync(join(DIR, 'chapters', f), 'utf8'))
      .map((text) => (parseYaml(/^---\n([\s\S]*?)\n---/.exec(text)![1]!) as { kind?: string; state: { time: string } }))
      .filter((c) => c.kind !== 'background')
      .map((c) => c.state.time);
    expect(times).toEqual(['-0400', '-0300', '-0220']);
    for (let i = 1; i < times.length; i++) expect(compareTime(times[i - 1]!, times[i]!)).toBeLessThan(0);
    // As strings the order would be wrong.
    expect('-0300' < '-0400').toBe(true);
  });
});
