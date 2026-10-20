import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { model, type InstrumentModelSpec } from '../../src/engines/math-scene/schema';
import { partsBetween, scaleOf } from '../../src/engines/math-scene/lib/instrument';
import { Magnifier } from '../../src/engines/math-scene/stage/instrument/Magnifier';
import { dialFrame, magnifierSplit, straightFrame } from '../../src/engines/math-scene/stage/instrument/geometry';
import { magnifiedCounts, magnifierLeaders, magnifierSource } from '../../src/engines/math-scene/stage/instrument/magnifier-geometry';

const M = 1_000_000;
const inst = (s: Record<string, unknown>) => model.parse({ kind: 'instrument', ...s }) as InstrumentModelSpec;

it('shows only counted parts inside the zoom, with the same numbering as the source', () => {
  const s = inst({ type: 'tape', look: 'height-chart', unit: 'cm', from: 100, to: 150, major: 10, minor: 2, head: 128 });
  const sc = scaleOf(s)!;
  const stretch = { from: 120 * M, to: 130 * M };
  const counted = partsBetween(sc, 120 * M, 128 * M);
  expect(magnifiedCounts(sc, stretch, counted)).toEqual({ parts: [0, 1, 2, 3], numbers: [1, 2, 3, 4] });
  const html = renderToStaticMarkup(createElement('svg', null, createElement(Magnifier, {
    s, sc, track: straightFrame(s, sc, { x: 0, y: 0, w: 500, h: 600 }, { counting: true }).track,
    stretch, pointer: 128 * M, mag: { x: 550, y: 100, w: 300, h: 150 }, counted,
  })));
  expect(html.match(/class="ms-inst__arc"/g)).toHaveLength(4);
  expect(html).not.toMatch(/dominant-baseline="central">5<\/text>/);
  expect(magnifiedCounts(sc, stretch, partsBetween(sc, 118 * M, 134 * M))).toEqual({ parts: [0, 1, 2, 3, 4], numbers: [2, 3, 4, 5, 6] });
  expect(magnifiedCounts(sc, stretch)).toEqual({ parts: [], numbers: [] });
});

describe('the dial magnifier source', () => {
  for (const box of [{ x: 0, y: 0, w: 1000, h: 700 }, { x: 0, y: 0, w: 336, h: 400 }]) {
    for (const major of [100, 500]) {
      it(`is a band along the rim over a ${major} g gap in a ${box.w} px box, clear of the face`, () => {
        const s = inst({ type: 'dial', unit: 'g', from: 0, to: 1000, major, minor: 50, value: 350 });
        const sc = scaleOf(s)!;
        const split = magnifierSplit(box);
        const f = dialFrame(s, sc, split.inst, { counting: false });
        const stretch = { from: 0, to: major * M };
        const src = magnifierSource(s, sc, f.track, stretch);
        if (src.kind !== 'band') throw new Error('a dial gets a band');
        expect(Math.hypot(src.c.x - f.c.x, src.c.y - f.c.y)).toBeLessThan(0.01);
        // Only the rim's marks: the hub, the unit (0.42 r below it) and the
        // middle of the needle stay outside the band.
        expect(src.inner).toBeGreaterThan(f.r * 0.7);
        expect(src.inner).toBeLessThan(f.r * 0.94 - f.track.marks.major);
        expect(src.outer).toBeLessThan(f.r * 1.1);
        // Both ends on the stretch's end marks, outside the rim.
        for (const [end, v] of [[src.ends[0], stretch.from], [src.ends[1], stretch.to]] as const) {
          const p = f.track.at(v);
          expect(Math.hypot(end.x - f.c.x, end.y - f.c.y)).toBeCloseTo(src.outer, 6);
          expect(Math.abs((end.x - f.c.x) * p.ny - (end.y - f.c.y) * p.nx)).toBeLessThan(1e-6);
        }
        expect(src.d).toMatch(new RegExp(`A${src.outer} ${src.outer} 0 0 1 `));
        const [a, b] = magnifierLeaders(src, [{ x: 900, y: 100 }, { x: 900, y: 300 }]);
        expect(a![0].y).toBeLessThanOrEqual(b![0].y);
        expect(a![1]).toEqual({ x: 900, y: 100 });
      });
    }
  }

  it('keeps both leaders off the face when one end is across the dial from the box', () => {
    const s = inst({ type: 'dial', unit: 'kg', from: 0, to: 3, major: 1, minor: '0.1', value: '1.4' });
    const sc = scaleOf(s)!;
    const split = magnifierSplit({ x: 0, y: 0, w: 1400, h: 700 });
    const f = dialFrame(s, sc, split.inst, { counting: true });
    const src = magnifierSource(s, sc, f.track, { from: 1 * M, to: 2 * M });
    if (src.kind !== 'band') throw new Error('a dial gets a band');
    const { mag } = split;
    for (const [a, q] of magnifierLeaders(src, [{ x: mag.x, y: mag.y }, { x: mag.x, y: mag.y + mag.h }])) {
      for (let t = 0; t <= 1; t += 0.05) {
        expect(Math.hypot(a.x + (q.x - a.x) * t - f.c.x, a.y + (q.y - a.y) * t - f.c.y)).toBeGreaterThanOrEqual(src.outer - 1);
      }
    }
  });

  it('takes the long way round for a stretch past half the sweep', () => {
    const s = inst({ type: 'dial', unit: 'g', from: 0, to: 1000, major: 100, minor: 50, value: 350 });
    const sc = scaleOf(s)!;
    const f = dialFrame(s, sc, { x: 0, y: 0, w: 700, h: 700 }, { counting: false });
    const src = magnifierSource(s, sc, f.track, { from: 0, to: 600 * M });
    expect(src.kind === 'band' && src.d).toContain(' 0 1 1 ');
  });

  it('rings a straight stretch', () => {
    const s = inst({ type: 'tape', unit: 'cm', from: 0, to: 50, major: 10, minor: 5 });
    const sc = scaleOf(s)!;
    const f = straightFrame(s, sc, { x: 0, y: 0, w: 800, h: 300 }, { counting: false });
    const src = magnifierSource(s, sc, f.track, { from: 30 * M, to: 40 * M });
    expect(src.kind).toBe('ring');
    if (src.kind !== 'ring') return;
    expect(src.x).toBeCloseTo((f.track.at(30 * M).x + f.track.at(40 * M).x) / 2, 6);
    const [[a, q]] = magnifierLeaders(src, [{ x: src.x, y: src.y - 200 }, { x: src.x, y: src.y + 200 }]) as [[{ x: number; y: number }, { x: number; y: number }]];
    expect(Math.hypot(a.x - src.x, a.y - src.y)).toBeCloseTo(src.r, 6);
    expect(q.y).toBe(src.y - 200);
  });
});
