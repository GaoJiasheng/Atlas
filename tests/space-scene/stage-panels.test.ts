import { describe, expect, it } from 'vitest';
import { daylightChart } from '../../src/engines/space-scene/stages/panels/stage-chart';
import { groundShadowFade } from '../../src/engines/space-scene/stages/model3d/groundFade';
import { partChain, wrapChainName } from '../../src/engines/space-scene/lib/schematic';
import { fitCameraToAspect } from '../../src/engines/space-scene/lib/camera';
import { keepFocusInPortrait, widestPortrait } from '../../src/engines/space-scene/lib/portrait-focus';
import { resolveMaterialLook } from '../../src/engines/space-scene/lib/color';

const days = Array.from({ length: 365 }, (_, i) => ({
  date: new Date(Date.UTC(2026, 0, i + 1)).toISOString().slice(0, 10),
  daylight_minutes: 727.5 + 4.5 * Math.sin(((i - 80) / 365) * 2 * Math.PI),
}));

describe('stage daylight chart', () => {
  it('puts the cursor on the day and states the expanded range', () => {
    const c = daylightChart(days, 172, 'en')!;
    expect(c.cursor).toBe(172);
    expect(c.yDomain).toEqual([720, 735]);
    expect(c.series[0]!.points).toHaveLength(365);
    expect(c.note).toMatch(/expanded/i);
    expect(c.xTicks.map((t) => t.x)).toEqual([1, 91, 182, 274]);
  });
  it('is bilingual and has no chart for a day outside the table', () => {
    expect(daylightChart(days, 172, 'zh')!.current).toMatch(/小时/);
    expect(daylightChart(days, 0, 'en')).toBeNull();
  });
});

describe('ground shadow fade', () => {
  it('draws fully from a raised camera at a normal distance', () => {
    expect(groundShadowFade([0, 4, 4], 0, [0, 0], 1, 30)).toBe(1);
  });
  it('drops the band at a grazing angle', () => {
    expect(groundShadowFade([0, 0.2, 5], 0, [0, 0], 1, 30)).toBe(0);
  });
  it('drops the disc when the view sits inside it', () => {
    expect(groundShadowFade([0, 1, 1], 0, [0, 0], 4, 30)).toBe(0);
  });
  it('has nothing to draw from below the floor', () => {
    expect(groundShadowFade([0, -1, 3], 0, [0, 0], 1, 30)).toBe(0);
  });
});

describe('part chain names', () => {
  it('leaves a short name on one line', () => {
    expect(wrapChainName('HEATED WATER', 15)).toEqual(['HEATED WATER']);
  });
  it('wraps long names without an ellipsis', () => {
    expect(wrapChainName('BATH THERMOMETER LIQUID COLUMN', 15)).toEqual(['BATH THERMOMETER', 'LIQUID COLUMN']);
    expect(wrapChainName('ROOM-TEMPERATURE REFERENCE', 15)).toEqual(['ROOM-TEMPERATURE', 'REFERENCE']);
  });
  it('grows a two-line node and pushes the next one down', () => {
    const parts = ['a', 'b'].map((id) => ({ id, group: 'g', connects: [] }));
    const one = partChain(parts, [{ id: 'g' }], 330, { nameOf: () => 'SHORT' });
    const two = partChain(parts, [{ id: 'g' }], 110, { nameOf: (id) => (id === 'a' ? 'A VERY LONG NAME THAT WRAPS' : 'SHORT') });
    expect(one.nodes[0]!.lines).toEqual(['SHORT']);
    expect(two.nodes[0]!.lines).toHaveLength(2);
    expect(two.nodes[1]!.y).toBeGreaterThan(two.nodes[0]!.y + two.nodes[0]!.h);
  });
});

describe('portrait focus', () => {
  const cam = { position: [0, 1, 5] as [number, number, number], target: [0, 0, 0] as [number, number, number], fov: 30 };
  const aspect = 390 / 844;
  const eased = fitCameraToAspect(cam, aspect);
  const widest = widestPortrait(cam, aspect);
  const dist = (c: { position: readonly [number, number, number] }) => Math.hypot(...c.position);
  it('keeps the eased camera when the part already fits', () => {
    expect(keepFocusInPortrait(eased, widest, [{ center: [0, 0, 0], radius: 0.1 }], aspect)).toBe(eased);
  });
  it('pulls back for a part off to the side, no further than the full pull-back', () => {
    const moved = keepFocusInPortrait(eased, widest, [{ center: [3, 0, 0], radius: 0.1 }], aspect);
    expect(dist(moved)).toBeGreaterThan(dist(eased));
    expect(dist(moved)).toBeLessThanOrEqual(dist(widest) + 1e-6);
  });
  it('leaves landscape stages alone', () => {
    expect(keepFocusInPortrait(cam, cam, [{ center: [30, 0, 0], radius: 1 }], 1.6)).toBe(cam);
  });
});

describe('pale plastic on the dark plate', () => {
  it('dims a near-white tint in cinema and leaves paper and dark tints alone', () => {
    expect(resolveMaterialLook('plastic', {}, 'paper', '#e7e0cf').color).toBe('#e7e0cf');
    expect(resolveMaterialLook('plastic', {}, 'cinema', '#e7e0cf').color).not.toBe('#e7e0cf');
    expect(resolveMaterialLook('plastic', {}, 'cinema', '#303330').color).toBe('#303330');
  });
});
