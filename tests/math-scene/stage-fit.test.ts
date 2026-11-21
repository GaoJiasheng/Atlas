/**
 * A drawing kept inside a phone's stage above the docked tray (stage/fit.ts): left alone when it fits, shrunk and moved inside
 * its box when it outgrows it, kept as wide as it was when it was laid out wider than any phone, and not drawn at all when it
 * would have to shrink past legibility.
 */
import { describe, expect, it } from 'vitest';
import { FIT_MIN, fitTransform } from '../../src/engines/math-scene/stage/fit';

const box = { x: 14, y: 100, w: 300, h: 200 };
const parse = (t: string) => t.match(/-?[\d.]+/g)!.map(Number) as [number, number, number];
const placed = (t: string, r: { x: number; y: number; w: number; h: number }) => {
  const [tx, ty, s] = parse(t);
  return { x: r.x * s + tx, y: r.y * s + ty, w: r.w * s, h: r.h * s };
};

describe('fitTransform', () => {
  it('leaves a drawing inside its box alone', () => {
    expect(fitTransform({ x: 20, y: 110, w: 200, h: 180 }, box)).toBe('');
  });

  it('shrinks a drawing that runs under the tray into its box, as high as it was when it can be', () => {
    const painted = { x: 40, y: 110, w: 240, h: 220 };
    const t = fitTransform(painted, box)!;
    const r = placed(t, painted);
    expect(r.y).toBeCloseTo(100, 0);
    expect(placed(fitTransform({ ...painted, y: 120, h: 180, w: 400 }, box)!, { ...painted, y: 120, h: 180, w: 400 }).y).toBeCloseTo(120, 0);
    expect(r.y + r.h).toBeLessThanOrEqual(box.y + box.h + 0.5);
    expect(r.x).toBeGreaterThanOrEqual(box.x - 0.5);
    expect(r.x + r.w).toBeLessThanOrEqual(box.x + box.w + 0.5);
  });

  it('brings a drawing that starts above its box down into it', () => {
    const painted = { x: 40, y: 60, w: 200, h: 150 };
    const r = placed(fitTransform(painted, box)!, painted);
    expect(r.y).toBeGreaterThanOrEqual(box.y - 0.5);
  });

  it('fits only the height of a drawing laid out wider than the stage, centred on the box', () => {
    const painted = { x: -220, y: 110, w: 780, h: 240 };
    const [, , s] = parse(fitTransform(painted, box)!);
    expect(s).toBeCloseTo(200 / 240, 2);
    const r = placed(fitTransform(painted, box)!, painted);
    expect(r.x + r.w / 2).toBeCloseTo(box.x + box.w / 2, 0);
  });

  it('draws nothing rather than shrink past legibility', () => {
    expect(fitTransform({ x: 20, y: 110, w: 200, h: 200 / (FIT_MIN * 0.9) }, box)).toBeNull();
  });
});
