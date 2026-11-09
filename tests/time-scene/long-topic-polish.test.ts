import { describe, expect, it } from 'vitest';
import { areaLabelPoint } from '../../src/engines/time-scene/lib/geo';
import { fitTickLabels, ruleTicks } from '../../src/engines/time-scene/lib/ticks';

describe('long historical topics', () => {
  it('does not label a year zero on a mixed BCE/CE axis', () => {
    expect(ruleTicks(-2000,2000,'date',6,'en',true).major.some((tick) => tick.label === '0')).toBe(false);
  });
  it('keeps a territory leader out of an enclosed sea', () => {
    const outer = [[0,0],[12,0],[12,12],[0,12],[0,0]];
    const sea = [[2,2],[2,10],[10,10],[10,2],[2,2]];
    const at = areaLabelPoint([[outer, sea]])!;
    expect(at[0] < 2 || at[0] > 10 || at[1] < 2 || at[1] > 10).toBe(true);
    expect(at.every((v) => v > 0 && v < 12)).toBe(true);
  });
  it('keeps a leader within a concave land polygon', () => {
    const land = [[0,0],[10,0],[10,2],[2,2],[2,8],[10,8],[10,10],[0,10],[0,0]];
    const at = areaLabelPoint([[land]])!;
    expect(at[0] < 2 || at[1] < 2 || at[1] > 8).toBe(true);
  });
  it('fits BCE and CJK label boxes without discarding tick dates', () => {
    const ticks = [{x:0,label:'3000 BCE'}, {x:34,label:'2000 BCE'}, {x:68,label:'公元500'}, {x:103,label:'1000'}];
    const width = (label: string) => [...label].reduce((w,c) => w + (c.codePointAt(0)! > 255 ? 10.4 : 6.4),0);
    const result = fitTickLabels(ticks,0,110,8,width);
    expect(result.map((t) => [t.x,t.label])).toEqual(ticks.map((t) => [t.x,t.label]));
    let edge = -Infinity;
    for (const tick of result.filter((t) => t.showLabel)) {
      const half = width(tick.label)/2;
      expect(tick.labelX-half).toBeGreaterThanOrEqual(Math.max(0,edge+8));
      expect(tick.labelX+half).toBeLessThanOrEqual(110);
      edge=tick.labelX+half;
    }
    expect(result.filter((t) => t.showLabel).length).toBeGreaterThan(0);
  });
});
