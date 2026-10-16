import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { assignHolderColours, colourConflicts, holderAdjacency, holderIndex, holderToken, withEntityColours, type Adjacency } from '../../src/engines/time-scene/lib/holders';
import { controlFile, type Entity } from '../../src/engines/time-scene/schema';

const square = (x: number, y: number, holder: string) => ({
  type: 'Feature' as const,
  properties: { holder },
  geometry: { type: 'Polygon' as const, coordinates: [[[x, y], [x + 1, y], [x + 1, y + 1], [x, y + 1], [x, y]]] },
});
const graph = (pairs: [string, string][]): Adjacency => {
  const adj: Adjacency = new Map();
  for (const [a, b] of pairs) {
    (adj.get(a) ?? adj.set(a, new Set()).get(a)!).add(b);
    (adj.get(b) ?? adj.set(b, new Set()).get(b)!).add(a);
  }
  return adj;
};

describe('holder colours (colorBy: entity)', () => {
  it('holder tokens', () => {
    expect(holderToken(3)).toBe('token:holder-3');
    expect(holderIndex('token:holder-8')).toBe(8);
    expect(holderIndex('token:holder-9')).toBeNull();
    expect(holderIndex('token:accent-1')).toBeNull();
    expect(holderIndex(undefined)).toBeNull();
  });

  it('fills in a holder colour for entities without one, only with colorBy: entity', () => {
    const entities = [
      { id: 'a', color: 'token:holder-5' },
      { id: 'b' },
      { id: 'c' },
    ] as unknown as Entity[];
    expect(withEntityColours({ entities }, 'bloc').entities).toBe(entities);
    const out = withEntityColours({ entities }, 'entity').entities;
    expect(out.map((e) => e.color)).toEqual(['token:holder-5', 'token:holder-2', 'token:holder-3']);
  });

  it('neighbours from shared edges (GeoJSON) across keyframes; a corner touch is not a border', () => {
    const control = controlFile.parse({
      keyframes: [
        { t: '-0400', features: { type: 'FeatureCollection', features: [square(0, 0, 'a'), square(1, 0, 'b'), square(1, 1, 'c')] } },
        { t: '-0300', features: { type: 'FeatureCollection', features: [square(0, 0, 'a'), square(0, 1, 'd')] } },
      ],
    });
    const adj = holderAdjacency(control);
    expect([...adj.get('a')!].sort()).toEqual(['b', 'd']);
    expect([...adj.get('c')!]).toEqual(['b']);
  });

  it('neighbours from shared arcs (TopoJSON): the sample-region topology', () => {
    const raw = JSON.parse(readFileSync(join(import.meta.dirname, '../../src/content/topics/sample-region/data/control.json'), 'utf8'));
    const adj = holderAdjacency(controlFile.parse(raw));
    expect([...adj.keys()].sort()).toEqual(['east-sample', 'north-sample', 'south-sample', 'west-sample']);
    expect([...adj.get('north-sample')!].sort()).toEqual(['east-sample', 'south-sample', 'west-sample']);
  });

  it('colours a graph so neighbours differ, balancing the palette; keeps pinned colours that fit', () => {
    // A wheel: hub + six rim states in a ring (needs 3–4 colours).
    const rim = ['r1', 'r2', 'r3', 'r4', 'r5', 'r6'];
    const pairs: [string, string][] = rim.map((r, i) => [r, rim[(i + 1) % rim.length]!]);
    for (const r of rim) pairs.push(['hub', r]);
    const adj = graph(pairs);
    const { colours, conflicts } = assignHolderColours(adj);
    expect(conflicts).toEqual([]);
    expect(colourConflicts(adj, (id) => String(colours.get(id)))).toEqual([]);
    expect(new Set(colours.values()).size).toBeGreaterThan(3); // least-used colour first: more than the minimum
    const kept = assignHolderColours(adj, { keep: new Map([['hub', 7]]) });
    expect(kept.colours.get('hub')).toBe(7);
  });

  it('reports clashes when the palette is too small', () => {
    const k5 = ['a', 'b', 'c', 'd', 'e'];
    const pairs: [string, string][] = [];
    for (let i = 0; i < k5.length; i++) for (let j = i + 1; j < k5.length; j++) pairs.push([k5[i]!, k5[j]!]);
    const { conflicts } = assignHolderColours(graph(pairs), { colours: 4 });
    expect(conflicts.length).toBeGreaterThan(0);
    expect(colourConflicts(graph([['x', 'y']]), () => 'token:holder-1')).toEqual([['x', 'y']]);
  });
});
