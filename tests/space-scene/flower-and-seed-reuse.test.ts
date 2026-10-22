/**
 * docs/41 D13 / §3.2: flower-and-seed reuses the plant topic's procedural
 * parts by moving them (scale s = 50 ÷ N_plant × M_here ÷ 100, a turn, a
 * translation). A moved part's bounding box is the plant part's box × s
 * (± 1 %), a quarter turn swaps its width and depth, and the plant topic's
 * parts.json is only read.
 */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { axisAngle, boundsOf, PLANT_FILE, plantPrims, reuse, scaleFor } from '../../scripts/geo/flower-and-seed/reuse';

const hash = () => createHash('sha256').update(readFileSync(PLANT_FILE)).digest('hex');

// The plant parts this topic moves, with the magnification the plant names (×1 when unnamed) and this table's.
const REUSED: [string, number, number][] = [
  ['flower', 1.7, 20],
  ['sepals', 1.7, 20],
  ['stamens', 1.7, 20],
  ['pistil', 1.7, 20],
  ['fruit-green', 1, 1],
  ['fruit-red-section', 2, 1],
  ['winged-fruit', 1.5, 1],
  ['bean-seed', 10, 10],
  ['bean-sprouting', 5, 10],
];

describe('flower-and-seed reuses plant parts', () => {
  const before = hash();

  it('the scale rule', () => {
    expect(scaleFor(1.7, 20)).toBeCloseTo(5.882, 3);
    expect(scaleFor(10, 10)).toBe(0.5);
    expect(scaleFor(2, 1)).toBe(0.25);
  });

  it.each(REUSED)('%s: the moved box is the plant box × s', (id, n, m) => {
    const s = scaleFor(n, m);
    const was = boundsOf(plantPrims(id)).size;
    const now = boundsOf(reuse(id, { s, to: [0.3, 0, -0.4] })).size;
    for (let k = 0; k < 3; k++) expect(Math.abs(now[k]! - was[k]! * s)).toBeLessThanOrEqual(0.01 * was[k]! * s + 1e-6);
  });

  it('a quarter turn about the vertical swaps width and depth', () => {
    const was = boundsOf(plantPrims('winged-fruit')).size;
    const now = boundsOf(reuse('winged-fruit', { s: 1, to: [0, 0, 0], m: axisAngle([0, 1, 0], 90) })).size;
    expect(now[0]).toBeCloseTo(was[2]!, 3);
    expect(now[2]).toBeCloseTo(was[0]!, 3);
    expect(now[1]).toBeCloseTo(was[1]!, 3);
  });

  it('the moved part lands on its target', () => {
    const anchor = plantPrims('pistil')[0]!.at;
    const moved = reuse('pistil', { s: 2, to: [1, 2, 3], anchor });
    expect(moved[0]!.at).toEqual([1, 2, 3]);
  });

  it('the plant topic’s parts.json is not changed', () => {
    expect(hash()).toBe(before);
  });
});
