import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { model, type InstrumentModelSpec } from '../../src/engines/math-scene/schema';
import { partsBetween, scaleOf } from '../../src/engines/math-scene/lib/instrument';
import { Magnifier } from '../../src/engines/math-scene/stage/instrument/Magnifier';
import { dialFrame, magnifierSplit, straightFrame } from '../../src/engines/math-scene/stage/instrument/geometry';
import { magnifiedCounts, magnifierRing } from '../../src/engines/math-scene/stage/instrument/magnifier-geometry';

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

describe('the dial magnifier source ring', () => {
  for (const box of [{ x: 0, y: 0, w: 1000, h: 700 }, { x: 0, y: 0, w: 336, h: 400 }]) {
    for (const major of [100, 500]) {
      it(`stays at the rim with a ${major} g gap in a ${box.w} px box`, () => {
        const s = inst({ type: 'dial', unit: 'g', from: 0, to: 1000, major, minor: 50, value: 350 });
        const sc = scaleOf(s)!;
        const split = magnifierSplit(box);
        const f = dialFrame(s, sc, split.inst, { counting: false });
        const stretch = { from: 0, to: major * M };
        const ring = magnifierRing(s, sc, f.track, stretch);
        const radialDistance = Math.hypot(ring.x - f.c.x, ring.y - f.c.y);
        // The needle reaches 0.8 r. Keep its entire face, the hub, and the
        // central unit label (0.42 r below the hub) clear of the ring.
        expect(radialDistance - ring.r).toBeGreaterThan(f.r * 0.8);
        expect(ring.r).toBeLessThanOrEqual(26);
        expect(Math.hypot(ring.x - f.c.x, ring.y - (f.c.y + f.r * 0.42)) - ring.r).toBeGreaterThan(f.r * 0.1);
        const middle = f.track.at((stretch.from + stretch.to) / 2);
        expect(Math.hypot(ring.x - middle.x, ring.y - middle.y)).toBeLessThan(ring.r);
      });
    }
  }
});
