import { describe, expect, it } from 'vitest';
import { elevation, labelBudget, partChain, planeAxes, scaleStep, stackColumn } from '../../src/engines/space-scene/lib/schematic';
import type { Part } from '../../src/engines/space-scene/schema';

const p = (id: string, group: string, at: [number, number, number], connects: string[] = []) =>
  ({
    id,
    group,
    connects,
    explode: { dir: [0, 1, 0], dist: 1 },
    primitive: { kind: 'box', size: [1, 1, 1], at, color: 'steel' },
  }) as unknown as Part;

const parts = [p('a', 'g1', [0, 0, 0], ['b', 'c']), p('b', 'g1', [2, 0, 0]), p('c', 'g2', [0, 3, 0], ['a'])];

describe('partChain', () => {
  const layout = partChain(parts, [{ id: 'g1' }, { id: 'g2' }], 300);
  it('puts groups in columns and numbers parts in data order', () => {
    expect(layout.columns.map((c) => c.id)).toEqual(['g1', 'g2']);
    expect(layout.nodes.map((n) => [n.id, n.n])).toEqual([['a', 1], ['b', 2], ['c', 3]]);
    const [a, b] = layout.nodes;
    expect(a!.x).toBe(b!.x);
    expect(b!.y).toBeGreaterThan(a!.y);
    expect(layout.nodes[2]!.x).toBeGreaterThan(a!.x + a!.w);
  });
  it('draws each connection once', () => {
    expect(layout.links.map((l) => [l.a, l.b, l.group])).toEqual([
      ['a', 'b', 'g1'],
      ['a', 'c', null],
    ]);
    for (const l of layout.links) expect(l.d).toMatch(/^M[\d.]+ [\d.]+H/);
  });
  it('fits the width', () => {
    for (const n of layout.nodes) expect(n.x + n.w).toBeLessThanOrEqual(300);
  });
});

describe('elevation', () => {
  it('projects rest bounds on the section plane', () => {
    const el = elevation(parts, 'xy');
    expect(el.rects).toHaveLength(3);
    expect([el.u0, el.u1, el.v0, el.v1]).toEqual([-0.5, 2.5, -0.5, 3.5]);
    expect(planeAxes('zy')).toEqual([2, 1, 0]);
    expect(elevation(parts, 'zy').u1).toBe(0.5);
  });
  it('explodes along each part direction', () => {
    const el = elevation(parts, 'xy', 1);
    expect(el.rects.find((r) => r.id === 'a')!.v0).toBe(0.5);
  });
  it('picks a 1-2-5 scale step near a quarter of the span', () => {
    expect(scaleStep(2.6)).toBe(0.5);
    expect(scaleStep(10)).toBe(2);
    expect(scaleStep(30)).toBe(5);
    expect(scaleStep(0.4)).toBe(0.1);
  });
});

describe('leader label layout', () => {
  it('shows fewer labels in close-ups', () => {
    expect(labelBudget(5)).toBe(10);
    expect(labelBudget(1)).toBe(3);
    expect(labelBudget(2.5)).toBeGreaterThan(3);
    expect(labelBudget(2.5)).toBeLessThan(10);
  });
  it('stacks a column without overlap inside the band', () => {
    const tops = stackColumn([100, 105, 110, 400], [30, 30, 30, 30], 50, 300, 8);
    for (let i = 1; i < tops.length; i++) expect(tops[i]!).toBeGreaterThanOrEqual(tops[i - 1]! + 38 - 1e-9);
    expect(tops[0]).toBeGreaterThanOrEqual(50);
    expect(tops[3]! + 30).toBeLessThanOrEqual(300);
    expect(stackColumn([10], [30], 50, 300, 8)).toEqual([50]);
  });
});
