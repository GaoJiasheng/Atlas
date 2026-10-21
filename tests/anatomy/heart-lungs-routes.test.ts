/**
 * The heart-and-lungs flow hand-off (scripts/anatomy/heart-lungs/routes.json, written by
 * routes.py): the invariants the content's build-flows step relies on.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

type Vec = [number, number, number];
interface Leg { kind: string; schematic: boolean; range: [number, number] }
interface Path {
  id: string;
  path: Vec[];
  legs: Leg[];
  schematic: { range: [number, number] }[];
  tracedNotEnclosed: number;
  schematicNotEnclosed: number;
}
interface Routes {
  stepM: number;
  joinToleranceM: number;
  joins: { maxGapM: number; over: unknown[] };
  flows: Record<string, { group: string; paths: Path[] }>;
}

const ROOT = join(import.meta.dirname, '../..');
const routes = JSON.parse(readFileSync(join(ROOT, 'scripts/anatomy/heart-lungs/routes.json'), 'utf8')) as Routes;
const dist = (a: Vec, b: Vec) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const all = Object.entries(routes.flows).flatMap(([flow, f]) => f.paths.map((p) => ({ flow, ...p })));

describe('heart-lungs routes', () => {
  it('has every body flow of docs/40 §3.6 with the planned path counts', () => {
    const counts = Object.fromEntries(Object.entries(routes.flows).map(([k, f]) => [k, f.paths.length]));
    expect(counts).toEqual({
      'air-right': 10, 'air-left': 9, 'heart-right': 2, 'to-lungs': 5, 'exchange-lungs': 5, 'from-lungs': 5, 'heart-left': 1,
      'to-body': 7, 'from-body': 7, 'exchange-body': 7, 'oxygen-lungs': 5, 'co2-lungs': 5, 'oxygen-muscle': 4, 'co2-muscle': 4,
      'food-in': 4, 'food-route': 1,
    });
  });

  it('samples every path at most one step apart (8 mm, plus re-centring)', () => {
    for (const p of all) {
      expect(p.path.length, `${p.flow}/${p.id}`).toBeGreaterThan(1);
      for (let i = 1; i < p.path.length; i++) expect(dist(p.path[i - 1]!, p.path[i]!), `${p.flow}/${p.id} @${i}`).toBeLessThan(routes.stepM + 0.0065);
    }
  });

  it('keeps traced points in their tubes and schematic points in their organs', () => {
    for (const p of all) {
      expect(p.tracedNotEnclosed, `${p.flow}/${p.id}`).toBe(0);
      expect(p.schematicNotEnclosed, `${p.flow}/${p.id}`).toBe(0);
    }
  });

  it('flags the schematic legs and covers every point with a leg', () => {
    for (const p of all) {
      const covered = new Set<number>();
      for (const l of p.legs) for (let i = l.range[0]; i <= l.range[1]; i++) covered.add(i);
      expect(covered.size, `${p.flow}/${p.id}`).toBe(p.path.length);
      expect(p.schematic.length).toBe(p.legs.filter((l) => l.schematic).length);
    }
    // Inside the heart the source has no lumen: those paths are schematic end to end.
    for (const p of [...routes.flows['heart-right']!.paths, ...routes.flows['heart-left']!.paths])
      expect(p.legs.every((l) => l.schematic)).toBe(true);
  });

  it('closes the blood loop: each path ends where one of the next flow begins', () => {
    expect(routes.joins.over).toEqual([]);
    expect(routes.joins.maxGapM).toBeLessThanOrEqual(routes.joinToleranceM);
  });

  it('keeps blood flows in the two red groups and reverses carbon dioxide out of the muscles', () => {
    const groups = Object.fromEntries(Object.entries(routes.flows).map(([k, f]) => [k, f.group]));
    for (const k of ['heart-right', 'to-lungs', 'exchange-lungs', 'from-body']) expect(groups[k]).toBe('blood-poor');
    for (const k of ['from-lungs', 'heart-left', 'to-body', 'exchange-body']) expect(groups[k]).toBe('blood-rich');
    const o2 = routes.flows['oxygen-muscle']!.paths, co2 = routes.flows['co2-muscle']!.paths;
    for (const p of o2) {
      const q = co2.find((c) => c.id === p.id)!;
      expect(dist(p.path[0]!, q.path.at(-1)!)).toBeLessThan(1e-6);
    }
  });
});
