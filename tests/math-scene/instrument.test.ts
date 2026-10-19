/**
 * Model A11 `instrument` (docs/32 §3.2, §3.8): every small part the same size
 * on the page (a ruler, a skipped tape, a dial's rim, a jug), the dial's 0 at
 * the top going clockwise with a gap before full scale, a jug's level in
 * proportion to its value, the balance's heavier side down, the readings and
 * what they are made of, the `unroll`'s ends, the fewest weights, the
 * numbers of a two-unit scale.
 */
import { describe, expect, it } from 'vitest';
import { model, type InstrumentModelSpec, type InstrumentSpec } from '../../src/engines/math-scene/schema';
import { beamAngle, beamTilt, breakdown, dialAngle, drawnParts, fewestWeights, markAt, markOf, markText, partsBetween, readingOf, rimPoint, scaleOf, shareOf, unrollPoint, valueAtAngle, zoomStretch } from '../../src/engines/math-scene/lib/instrument';
import { dialFrame, jugFrame, straightFrame } from '../../src/engines/math-scene/stage/instrument/geometry';

const M = 1_000_000;
const inst = (spec: Record<string, unknown>): InstrumentSpec => model.parse({ kind: 'instrument', ...spec }) as InstrumentModelSpec;
const box = { x: 0, y: 0, w: 1000, h: 700 };
const gaps = (xs: number[]) => xs.slice(1).map((x, i) => Math.round((x - xs[i]!) * 1e6) / 1e6);

describe('the scale', () => {
  const ruler = inst({ type: 'ruler', unit: 'cm', from: 0, to: 15, major: 1, minor: 1, object: { kind: 'pencil', from: 0, to: 9 } });

  it('reads the marks and numbers of a scale', () => {
    const sc = scaleOf(inst({ type: 'dial', unit: 'g', from: 0, to: 500, major: 100, minor: 20 }))!;
    expect(sc.parts).toBe(25);
    expect(sc.per).toBe(5);
    expect(markAt(sc, 4)).toBe(80 * M);
    expect(markOf(sc, 280 * M)).toBe(14);
    expect(markOf(sc, 290 * M)).toBeNull();
  });

  it('draws every small part the same size on a ruler', () => {
    const sc = scaleOf(ruler)!;
    const f = straightFrame(ruler, sc, box, { counting: false });
    const xs = Array.from({ length: sc.parts + 1 }, (_, i) => f.track.at(markAt(sc, i)).x);
    expect(new Set(gaps(xs)).size).toBe(1);
    expect(f.track.partPx).toBeCloseTo(xs[1]! - xs[0]!, 6);
  });

  it('draws a skipped stretch as two parts, the parts either side the same size', () => {
    const tape = inst({ type: 'tape', look: 'height-chart', unit: 'cm', sub: { unit: 'm' }, from: 0, to: 150, major: 10, minor: 2, skip: { from: 0, to: 100 }, head: 132 });
    const sc = scaleOf(tape)!;
    expect(drawnParts(tape, sc)).toBe(27);
    expect(shareOf(tape, sc, 100 * M)).toBeCloseTo(2 / 27, 9);
    const f = straightFrame(tape, sc, box, { counting: false });
    const ys = Array.from({ length: 26 }, (_, i) => f.track.at((100 + 2 * i) * M).y);
    expect(new Set(gaps(ys)).size).toBe(1);
    expect(f.vertical).toBe(true);
    for (const v of [0, 100, 112, 132, 150]) expect(f.track.valueAt(f.track.at(v * M))).toBeCloseTo(v * M, 6);
  });

  it('draws the marks of a jug the same height apart, the level in proportion', () => {
    const jug = inst({ type: 'jug', unit: 'ml', from: 0, to: 1000, major: 100, minor: 50, value: 350 });
    const sc = scaleOf(jug)!;
    const f = jugFrame(jug, sc, box);
    const ys = Array.from({ length: sc.parts + 1 }, (_, i) => f.track!.at(markAt(sc, i)).y);
    expect(new Set(gaps(ys)).size).toBe(1);
    expect(f.floor - f.levelY(500 * M)).toBeCloseTo(2 * (f.floor - f.levelY(250 * M)), 9);
    expect(f.levelY(350 * M)).toBeCloseTo(f.track!.at(350 * M).y, 9);
  });

  it('keeps a compound jug large enough on a phone while reserving its bracket labels', () => {
    const jug = inst({ type: 'jug', unit: 'ml', from: 0, to: 2000, major: 500, minor: 50, value: 1250, brackets: [{ from: 0, to: 1000, label: { en: '1 ℓ', zh: '1 ℓ' } }, { from: 1000, to: 1250, label: { en: '250 ml', zh: '250 ml' } }] });
    expect(jugFrame(jug, scaleOf(jug), { x: 0, y: 0, w: 336, h: 400 }).body.h).toBeGreaterThanOrEqual(200);
  });

  it('numbers a two-unit scale in whole big units and what is over', () => {
    const sc = scaleOf(inst({ type: 'tape', unit: 'cm', sub: { unit: 'm' }, from: 100, to: 150, major: 10, minor: 2 }))!;
    expect(markText(sc, 100 * M)).toBe('1 m');
    expect(markText(sc, 120 * M)).toBe('20');
    const jug = scaleOf(inst({ type: 'jug', unit: 'ml', sub: { unit: 'l' }, from: 0, to: 2000, major: 500, minor: 50 }))!;
    expect([0, 500, 1000, 1500, 2000].map((v) => markText(jug, v * M))).toEqual(['0', '500', '1 ℓ', '500', '2 ℓ']);
  });
});

describe('the dial', () => {
  const d = inst({ type: 'dial', unit: 'g', from: 0, to: 1000, major: 100, minor: 50, value: 350 });
  const sc = scaleOf(d)!;

  it('has 0 at the top, turns clockwise, and leaves a gap before full scale', () => {
    expect(dialAngle(d, sc, 0)).toBe(0);
    expect(dialAngle(d, sc, 500 * M)).toBe(165);
    expect(dialAngle(d, sc, 1000 * M)).toBe(330);
    const top = rimPoint(0, 0, 100, 0);
    const right = rimPoint(0, 0, 100, 90);
    expect(top.x).toBeCloseTo(0, 9);
    expect(top.y).toBeCloseTo(-100, 9);
    expect(right.x).toBeCloseTo(100, 9);
  });

  it('turns an angle back into a value on the marks, the gap to the nearer end', () => {
    expect(valueAtAngle(d, sc, 165)).toBe(500 * M);
    expect(valueAtAngle(d, sc, 170)).toBe(500 * M);
    expect(valueAtAngle(d, sc, 340)).toBe(1000 * M);
    expect(valueAtAngle(d, sc, 355)).toBe(0);
    const f = dialFrame(d, sc, box);
    for (const [angle, value] of [[340, 1000], [355, 0], [165, 500]]) {
      expect(f.track.valueAt(rimPoint(f.c.x, f.c.y, f.r, angle!))).toBe(value! * M);
    }
  });

  it('draws every small part the same length of rim', () => {
    const f = dialFrame(d, sc, box);
    const pts = Array.from({ length: sc.parts + 1 }, (_, i) => f.track.at(markAt(sc, i)));
    const chords = pts.slice(1).map((p, i) => Math.round(Math.hypot(p.x - pts[i]!.x, p.y - pts[i]!.y) * 1e6) / 1e6);
    expect(new Set(chords).size).toBe(1);
  });

  it('unrolls each mark from the rim to the straight line, exact at both ends', () => {
    const dialAt = { cx: 100, cy: 100, r: 50 };
    const line = { x: 0, y: 200, w: 300 };
    const a = unrollPoint(0, dialAt, line, 90, 0.5);
    const b = unrollPoint(1, dialAt, line, 90, 0.5);
    expect(a.x).toBeCloseTo(150, 9);
    expect(a.y).toBeCloseTo(100, 9);
    expect(a.angle).toBe(90);
    expect(b).toEqual({ x: 150, y: 200, angle: 0 });
  });
});

describe('readings', () => {
  it('reads a thing laid along a ruler (its far end less its near end)', () => {
    const r = readingOf(inst({ type: 'ruler', unit: 'cm', from: 0, to: 15, major: 1, minor: 1, object: { kind: 'key', from: 3, to: 8 } }))!;
    expect(r).toMatchObject({ value: 5 * M, a: 3 * M, b: 8 * M });
    expect(r.nearest).toBe(false);
  });

  it('reads a thing off the marks to the nearest mark', () => {
    const r = readingOf(inst({ type: 'ruler', unit: 'cm', from: 0, to: 15, major: 1, minor: 1, object: { kind: 'crayon', from: 0, to: '6.7' } }))!;
    expect(r).toMatchObject({ value: 7 * M, nearest: true, b: 6_700_000 });
    expect(readingOf(inst({ type: 'ruler', unit: 'cm', from: 0, to: 15, major: 1, minor: 1, object: { kind: 'leaf', from: 0, to: '8.3' } }))!.value).toBe(8 * M);
  });

  it('breaks a pointer reading into the numbered mark below it and the parts on', () => {
    const r = readingOf(inst({ type: 'dial', unit: 'g', from: 0, to: 500, major: 100, minor: 20, value: 280 }))!;
    expect(r).toMatchObject({ value: 280 * M, L: 200 * M, U: 300 * M, M: 100 * M, i: 20 * M, n: 5, k: 4 });
    expect(breakdown(scaleOf(inst({ type: 'dial', unit: 'kg', from: 0, to: 3, major: 1, minor: '0.1' }))!, 1_400_000)).toMatchObject({ L: M, k: 4 });
  });

  it('reads the weights on a balance', () => {
    expect(readingOf(inst({ type: 'balance', left: [{ item: 'onion', mass: 720 }], right: [{ weight: 500 }, { weight: 200 }, { weight: 20 }] }))!.value).toBe(720 * M);
  });

  it('magnifies the numbered stretch the reading is in, and lists its parts', () => {
    const sc = scaleOf(inst({ type: 'dial', unit: 'g', from: 0, to: 500, major: 100, minor: 20 }))!;
    expect(zoomStretch(sc, 280 * M)).toEqual({ from: 200 * M, to: 300 * M });
    expect(zoomStretch(sc, 500 * M)).toEqual({ from: 400 * M, to: 500 * M });
    expect(partsBetween(sc, 200 * M, 300 * M)).toEqual([10, 11, 12, 13, 14]);
  });
});

describe('the balance', () => {
  it('puts the heavier side down, 8°, and is level when the masses are equal', () => {
    expect(beamTilt(inst({ type: 'balance', left: [{ item: 'beach-ball', mass: 60 }], right: [{ item: 'stone', mass: 400 }] }))).toBe(1);
    expect(beamTilt(inst({ type: 'balance', left: [{ item: 'pineapple', mass: 1000 }], right: [{ weight: 500 }] }))).toBe(-1);
    expect(beamTilt(inst({ type: 'balance', left: [{ item: 'pineapple', mass: 1000 }], right: [{ weight: 1000 }] }))).toBe(0);
    expect(beamAngle(1)).toBe(8);
    expect(beamAngle(-1)).toBe(-8);
  });

  it('finds the fewest weights that balance (any number of each), heaviest first', () => {
    expect(fewestWeights(800, [500, 200, 100, 50])).toEqual([500, 200, 100]);
    expect(fewestWeights(750, [500, 200, 50])).toEqual([500, 200, 50]);
    expect(fewestWeights(1000, [500, 200, 100])).toEqual([500, 500]);
    expect(fewestWeights(35, [20, 10])).toBeNull();
  });
});
