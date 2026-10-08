import { describe, expect, it } from 'vitest';
import { BAND_MAX_ROWS, planBandRows, rankBandEntities } from '../../src/engines/time-scene/lib/bandRows';
import type { EntityN } from '../../src/engines/time-scene/lib/model';

const ent = (id: string, joined: number, left = Number.POSITIVE_INFINITY): EntityN => ({
  entity: { id, name: { en: id, zh: id }, bloc: 'allied', joined: '1939' },
  joined,
  left,
  spans: [{ bloc: 'allied', from: -Infinity, to: Infinity }],
});

const T = 1950;

interface Opts {
  /** Area at T by id (km²). */
  area?: Record<string, number>;
  joined?: Record<string, number>;
  left?: Record<string, number>;
}
/** n entities e00..: joined = 1930 + index unless given, all at war at T unless `left` says otherwise. */
function setup(n: number, { area = {}, joined = {}, left = {} }: Opts = {}) {
  const entities = Array.from({ length: n }, (_, i) => {
    const id = `e${String(i).padStart(2, '0')}`;
    return ent(id, joined[id] ?? 1930 + i, left[id]);
  });
  const areaNow = new Map(entities.map((e) => [e.entity.id, area[e.entity.id] ?? 0]));
  return { entities, areaNow };
}
const ids = (rows: EntityN[]) => rows.map((r) => r.entity.id);
const plan = (n: number, opts: Opts, availableHeight: number, t = T) => {
  const { entities, areaNow } = setup(n, opts);
  return planBandRows({ entities, t, areaNow, availableHeight, minRowHeight: 30, collapsedHeight: 15 });
};

describe('rankBandEntities', () => {
  it('puts entities with area at t first (largest first), then the other entities at war by join date', () => {
    const { entities, areaNow } = setup(6, { area: { e04: 100, e02: 500, e05: 100 }, joined: { e00: 1941, e01: 1939, e03: 1940 } });
    // Area: e02 (500), then e04 and e05 tie at 100 (data order); no area: e01 (1939), e03 (1940), e00 (1941).
    expect(ids(rankBandEntities(entities, T, areaNow))).toEqual(['e02', 'e04', 'e05', 'e01', 'e03', 'e00']);
  });

  it('uses the area at t, not the peak: a past giant ranks below the present one', () => {
    const { entities } = setup(2);
    expect(ids(rankBandEntities(entities, T, new Map([['e00', 0], ['e01', 5]])))).toEqual(['e01', 'e00']);
  });

  it('leaves out entities not at war at t (not yet joined, already left), even with area', () => {
    const { entities, areaNow } = setup(5, { area: { e01: 900, e03: 100 }, joined: { e02: 1960 }, left: { e01: 1949 } });
    expect(ids(rankBandEntities(entities, T, areaNow))).toEqual(['e03', 'e00', 'e04']);
    expect(ids(rankBandEntities(entities, T, new Map([...areaNow])))).not.toContain('e02');
  });

  it('counts the left day itself as at war', () => {
    const { entities, areaNow } = setup(2, { left: { e00: T } });
    expect(ids(rankBandEntities(entities, T, areaNow))).toEqual(['e00', 'e01']);
  });
});

describe('planBandRows', () => {
  it('draws everything, in data order, when it fits', () => {
    const p = plan(5, { area: { e04: 9 } }, 150); // 5 rows of 30
    expect(ids(p.rows)).toEqual(['e00', 'e01', 'e02', 'e03', 'e04']);
    expect(p.hidden).toBe(0);
  });

  it('collapses the rest into one row when it does not fit, reserving the slim row', () => {
    const p = plan(10, { area: { e07: 50, e03: 90 } }, 150); // (150 - 15) / 30 = 4 rows
    expect(ids(p.rows)).toEqual(['e03', 'e07', 'e00', 'e01']);
    expect(p.hidden).toBe(6);
  });

  it('puts entities not at war at t into the "+N others" row', () => {
    const p = plan(10, { area: { e07: 50, e03: 90 }, left: { e03: 1945, e00: 1946 }, joined: { e01: 1999 } }, 150);
    expect(ids(p.rows)).toEqual(['e07', 'e02', 'e04', 'e05']);
    expect(p.hidden).toBe(6);
    // The same card earlier in time: e03 and e00 are at war again, e01 is not.
    const early = plan(10, { area: { e07: 50, e03: 90 }, left: { e03: 1945, e00: 1946 }, joined: { e01: 1999 } }, 150, 1940);
    expect(ids(early.rows)).toEqual(['e03', 'e07', 'e00', 'e02']);
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
    const p = plan(5, { area: { e02: 1 } }, 20);
    expect(ids(p.rows)).toEqual(['e02']);
    expect(p.hidden).toBe(4);
  });

  it('draws no rows when nobody is at war at t', () => {
    const p = plan(5, {}, 20, 1900);
    expect(p).toEqual({ rows: [], hidden: 5 });
  });

  it('handles an empty topic', () => {
    expect(plan(0, {}, 100)).toEqual({ rows: [], hidden: 0 });
  });
});
