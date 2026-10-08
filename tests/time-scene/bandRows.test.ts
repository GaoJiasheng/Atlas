import { describe, expect, it } from 'vitest';
import { BAND_MAX_ROWS, planBandRows, rankBandEntities } from '../../src/engines/time-scene/lib/bandRows';
import type { EntityN } from '../../src/engines/time-scene/lib/model';

const ent = (id: string, joined: number): EntityN => ({
  entity: { id, name: { en: id, zh: id }, bloc: 'allied', joined: '1939' },
  joined,
  left: Number.POSITIVE_INFINITY,
  spans: [{ bloc: 'allied', from: -Infinity, to: Infinity }],
});

/** n entities e00..: area only for the ones listed (peak km² by id); joined = 1930 + index unless given. */
function setup(n: number, withArea: Record<string, number>, joined: Record<string, number> = {}) {
  const entities = Array.from({ length: n }, (_, i) => ent(`e${String(i).padStart(2, '0')}`, joined[`e${String(i).padStart(2, '0')}`] ?? 1930 + i));
  const areas = new Map<string, number[]>(entities.map((e) => [e.entity.id, withArea[e.entity.id] ? [0, withArea[e.entity.id]!] : [0, 0]]));
  return { entities, areas };
}
const ids = (rows: EntityN[]) => rows.map((r) => r.entity.id);
const plan = (n: number, area: Record<string, number>, availableHeight: number, joined: Record<string, number> = {}) => {
  const { entities, areas } = setup(n, area, joined);
  return planBandRows({ entities, areas, availableHeight, minRowHeight: 30, collapsedHeight: 15 });
};

describe('rankBandEntities', () => {
  it('puts entities with control area first (largest peak first), then the rest by join date', () => {
    const { entities, areas } = setup(6, { e04: 100, e02: 500, e05: 100 }, { e00: 1941, e01: 1939, e03: 1940 });
    // Area: e02 (500), then e04 and e05 tie at 100 (data order); no area: e01 (1939), e03 (1940), e00 (1941).
    expect(ids(rankBandEntities(entities, areas))).toEqual(['e02', 'e04', 'e05', 'e01', 'e03', 'e00']);
  });

  it('uses the peak over keyframes, not the last one', () => {
    const { entities } = setup(2, {});
    const areas = new Map([
      ['e00', [10, 0]],
      ['e01', [5, 5]],
    ]);
    expect(ids(rankBandEntities(entities, areas))).toEqual(['e00', 'e01']);
  });
});

describe('planBandRows', () => {
  it('draws everything, in data order, when it fits', () => {
    const p = plan(5, { e04: 9 }, 150); // 5 rows of 30
    expect(ids(p.rows)).toEqual(['e00', 'e01', 'e02', 'e03', 'e04']);
    expect(p.hidden).toBe(0);
  });

  it('collapses the rest into one row when it does not fit, reserving the slim row', () => {
    const p = plan(10, { e07: 50, e03: 90 }, 150); // (150 - 15) / 30 = 4 rows
    expect(ids(p.rows)).toEqual(['e03', 'e07', 'e00', 'e01']);
    expect(p.hidden).toBe(6);
  });

  it('never shows more than 12 rows', () => {
    const p = plan(34, {}, 600);
    expect(p.rows).toHaveLength(BAND_MAX_ROWS);
    expect(p.hidden).toBe(34 - BAND_MAX_ROWS);
  });

  it('shows all when they fit even beyond 12', () => {
    const p = plan(15, {}, 2000);
    expect(p.rows).toHaveLength(15);
    expect(p.hidden).toBe(0);
  });

  it('keeps at least one row on a tiny card and counts the others', () => {
    const p = plan(5, { e02: 1 }, 20);
    expect(ids(p.rows)).toEqual(['e02']);
    expect(p.hidden).toBe(4);
  });

  it('handles an empty topic', () => {
    expect(plan(0, {}, 100)).toEqual({ rows: [], hidden: 0 });
  });
});
