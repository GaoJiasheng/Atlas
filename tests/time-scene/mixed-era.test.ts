/**
 * Topics that cross from BCE into CE (docs/43 §4 E1, ancient-civilisations):
 * years 1–999 CE are written '150 CE' / '公元150年' (readout, segment labels,
 * band ticks, event / entity dates) so they do not read like bare numbers next
 * to '260 BCE'. Topics on one side of 1 CE print exactly what they did before.
 */
import { describe, expect, it } from 'vitest';
import { buildTimeModel } from '../../src/engines/time-scene/lib/model';
import { formatTime, formatTimeRange, yearLabel } from '../../src/engines/time-scene/lib/format';
import { ruleTicks } from '../../src/engines/time-scene/lib/ticks';
import { toNumber } from '../../src/engines/time-scene/lib/time';
import { formatReadout, segmentDate } from '../../src/engines/time-scene/timeline/Timeline';
import type { TimeSceneGeoData } from '../../src/engines/time-scene/schema';

const empty = { type: 'FeatureCollection' as const, features: [] };
const data = (from: string, to: string): TimeSceneGeoData =>
  ({ entities: [], control: { keyframes: [{ t: from, features: empty }, { t: to, features: empty }] }, movements: [], events: [] }) as unknown as TimeSceneGeoData;

describe('mixed era (BCE → CE)', () => {
  const mixed = buildTimeModel(data('-3200', '2021'), [], { datePrecision: 'year' });
  const bceOnly = buildTimeModel(data('-0770', '-0221'), [], { datePrecision: 'year' });
  const ceOnly = buildTimeModel(data('1914', '1918'), []);

  it('the model knows when a topic crosses 1 CE', () => {
    expect(mixed.mixedEra).toBe(true);
    expect(bceOnly.mixedEra).toBe(false);
    expect(ceOnly.mixedEra).toBe(false);
  });

  it('marks years 1–999 CE, and only those', () => {
    expect(formatTime('0150', 'en', 'year', true)).toBe('150 CE');
    expect(formatTime('0150', 'zh', 'year', true)).toBe('公元150年');
    expect(formatTime('0999', 'en', 'year', true)).toBe('999 CE');
    expect(formatTime('1511', 'en', 'year', true)).toBe('1511');
    expect(formatTime('1511', 'zh', 'year', true)).toBe('1511年');
    expect(formatTime('-0260', 'en', 'year', true)).toBe('260 BCE');
    expect(formatTime('-0260', 'zh', 'year', true)).toBe('公元前260年');
    expect(formatTimeRange('1113', '1150', 'en', 'year', true)).toBe('1113 – 1150');
    expect(formatTimeRange('0671', '0683', 'en', 'year', true)).toBe('671 CE – 683 CE');
  });

  it('unchanged without the flag (every other topic)', () => {
    expect(formatTime('0150', 'en', 'year')).toBe('150');
    expect(formatTime('0150', 'zh', 'year')).toBe('150年');
    expect(yearLabel(150, 'en')).toBe('150');
    expect(yearLabel(-770, 'zh')).toBe('前770年');
  });

  it('readout, segment labels and band ticks of a mixed-era model', () => {
    expect(formatReadout(toNumber('0802'), mixed, 'en')).toBe('802 CE');
    expect(formatReadout(toNumber('-0508'), mixed, 'en')).toBe('508 BCE');
    expect(formatReadout(toNumber('1365'), mixed, 'zh')).toBe('1365年');
    expect(segmentDate(toNumber('0150'), mixed, 'en')).toBe('150 CE');
    expect(segmentDate(toNumber('0150'), mixed, 'zh')).toBe('公元150年');
    expect(segmentDate(toNumber('2021'), mixed, 'en')).toBe('2021');
    const labels = ruleTicks(toNumber('-1000'), toNumber('1500'), 'date', 6, 'en', mixed.mixedEra).major.map((m) => m.label);
    expect(labels).toContain('500 CE');
    expect(labels).toContain('500 BCE');
    expect(labels).toContain('1000');
    expect(ruleTicks(toNumber('-1000'), toNumber('1500'), 'date', 6, 'zh', true).major.map((m) => m.label)).toContain('公元500');
  });

  it('a BCE-only topic reads as before', () => {
    expect(segmentDate(toNumber('-0770'), bceOnly, 'en')).toBe('770 BCE');
    expect(formatReadout(toNumber('-0260'), bceOnly, 'en')).toBe('260 BCE');
  });
});
