import { describe, expect, it } from 'vitest';
import { flowSchema, partsFile, spaceChapterIssues, spaceChapterState, spaceSceneData } from '../../src/engines/space-scene/schema';
import { flowColorAt, stopSpan } from '../../src/engines/space-scene/lib/flow-stops';
import { formatReading, lagValue, readingDecimals } from '../../src/engines/space-scene/lib/telemetry';
import { detailParagraphs, detailSourceIds } from '../../src/engines/space-scene/lib/detail';
import { spaceSpecRows } from '../../src/engines/space-scene/hud/spec';
import { spaceSceneEngine, type SpaceSceneExt } from '../../src/engines/space-scene/index';

const flow = { id: 'f', group: 'g', path: [[0, 0, 0], [1, 0, 0]], speed: 1, color: 'token:hot' };
const part = (id: string, extra: Record<string, unknown> = {}) => ({
  id,
  name: { en: id },
  group: 'g',
  summary: { en: 's' },
  detail: { en: 'd' },
  primitive: { kind: 'box', size: [1, 1, 1], at: [0, 0, 0], color: 'steel' },
  ...extra,
});

describe('flow parameters (G3)', () => {
  it('defaults keep the previous look', () => {
    expect(flowSchema.parse(flow)).toMatchObject({ ends: 'fade', count: 360, size: 1, spread: 0.012, clip: true });
  });
  it('accepts stops, open ends, counts, box spread and part chains', () => {
    const f = flowSchema.parse({
      ...flow,
      stops: [{ at: 0, color: 'token:cold' }, { at: 1, color: 'token:hot' }],
      ends: 'open',
      count: 720,
      size: 0.45,
      spread: [0.3, 0.01, 0.01],
      clip: false,
      parts: ['a', 'b'],
    });
    expect(f.spread).toEqual([0.3, 0.01, 0.01]);
  });
  it('rejects descending stops and too many particles', () => {
    expect(flowSchema.safeParse({ ...flow, stops: [{ at: 0.6, color: 'token:cold' }, { at: 0.2, color: 'token:hot' }] }).success).toBe(false);
    expect(flowSchema.safeParse({ ...flow, count: 2000 }).success).toBe(false);
  });
  it('interpolates stop colours along the path', () => {
    const stops = [{ at: 0.2, color: 'a' }, { at: 0.6, color: 'b' }, { at: 1, color: 'c' }];
    expect(stopSpan(stops, 0)).toEqual({ a: 'a', b: 'a', k: 0 });
    expect(stopSpan(stops, 0.4)).toEqual({ a: 'a', b: 'b', k: expect.closeTo(0.5) });
    expect(stopSpan(stops, 0.8)).toEqual({ a: 'b', b: 'c', k: expect.closeTo(0.5) });
    expect(stopSpan(stops, 1)).toEqual({ a: 'b', b: 'c', k: 1 });
    expect(flowColorAt({ color: 'x' }, 0.3)).toEqual({ a: 'x', b: 'x', k: 0 });
  });
  it('checks flow part chains against the parts', () => {
    const file = { parts: [part('a'), part('b')], groups: [{ id: 'g', name: { en: 'G' }, color: 'token:ink' }] };
    expect(partsFile.safeParse({ ...file, flows: [{ ...flow, parts: ['a', 'b'] }] }).success).toBe(true);
    expect(partsFile.safeParse({ ...file, flows: [{ ...flow, parts: ['a', 'x'] }] }).success).toBe(false);
  });
});

describe('telemetry (G6)', () => {
  it('eases with a first-order lag', () => {
    expect(lagValue(0, 100, 0, 5)).toBe(0);
    expect(lagValue(0, 100, 5, 5)).toBeCloseTo(100 * (1 - Math.exp(-1)));
    expect(lagValue(1.93, 1.01, 1e6, 10)).toBeCloseTo(1.01);
  });
  it('formats with the decimals the data is written with', () => {
    expect(readingDecimals({ idle: 1.93, run: 3 })).toBe(2);
    expect(readingDecimals({ idle: 0, run: 3600 })).toBe(0);
    expect(readingDecimals({ idle: 0, run: 3600, decimals: 1 })).toBe(1);
    expect(formatReading(3417.6, 0)).toBe('3,418');
    expect(formatReading(-0.001, 2)).toBe('0.00');
  });
});

describe('spec rows (G5)', () => {
  const base = partsFile.parse({
    parts: [part('a'), part('wall', { context: true, group: undefined })],
    groups: [{ id: 'g', name: { en: 'G' }, color: 'token:ink' }],
  });
  it('default: PARTS (context parts not counted), GROUPS, FLOWS', () => {
    expect(spaceSpecRows(base).map((r) => [r.id, r.value])).toEqual([
      ['parts', '01'],
      ['groups', '01'],
      ['flows', '00'],
    ]);
  });
  it('with data rows: PARTS then the rows; sim rows carry the SIM chip', () => {
    const rows = spaceSpecRows({
      ...base,
      spec: [
        { key: { en: 'Refrigerant', zh: '冷媒' }, value: 'R32 · 0.60 kg', tag: 'design' },
        { key: { en: 'Type', zh: '类型' }, value: { en: 'Split', zh: '分体' } },
        { key: { en: 'Load', zh: '负荷' }, value: '2.6 kW', tag: 'sim' },
      ],
    });
    expect(rows.map((r) => r.id)).toEqual(['parts', 'spec-1', 'spec-2', 'spec-3']);
    expect(rows[1]).toMatchObject({ mono: true, value: 'R32 · 0.60 kg' });
    expect(rows[1]!.source).toBeUndefined();
    expect(rows[2]!.mono).toBe(false);
    expect(rows[3]!.source).toBe('simulated');
  });
  it('allows four data rows at most', () => {
    const row = { key: { en: 'K' }, value: 'v' };
    expect(partsFile.safeParse({ ...base, spec: [row, row, row, row, row] }).success).toBe(false);
  });
});

describe('part detail (G11)', () => {
  it('splits paragraphs and source markers', () => {
    const text = 'First line\ncontinues [S1].\n\nSecond [S2, S10] paragraph.';
    expect(detailParagraphs(text)).toEqual([
      [{ text: 'First line continues' }, { sources: ['S1'] }, { text: '.' }],
      [{ text: 'Second' }, { sources: ['S2', 'S10'] }, { text: ' paragraph.' }],
    ]);
    expect(detailSourceIds(text)).toEqual(['S1', 'S2', 'S10']);
    expect(detailParagraphs('Plain.')).toEqual([[{ text: 'Plain.' }]]);
  });
  it('the schema checks markers against data/sources.json', () => {
    const parts = {
      parts: [part('a', { detail: { en: 'See [S2].' } })],
      groups: [{ id: 'g', name: { en: 'G' }, color: 'token:ink' }],
    };
    const sources = { sources: [{ id: 'S1', text: { en: 'One' } }] };
    expect(spaceSceneData.safeParse({ parts }).success).toBe(false);
    expect(spaceSceneData.safeParse({ parts, sources }).success).toBe(false);
    expect(spaceSceneData.safeParse({ parts, sources: { sources: [...sources.sources, { id: 'S2', text: { en: 'Two' } }] } }).success).toBe(true);
  });
});

describe('chapter hide (G2)', () => {
  it('is part of the chapter state and must name parts', () => {
    const state = spaceChapterState.parse({ hide: ['front-panel'] });
    const data = spaceSceneData.parse({ parts: { parts: [part('a')], groups: [{ id: 'g', name: { en: 'G' }, color: 'token:ink' }] } });
    expect(spaceChapterIssues(state, data)).toEqual(['state.hide: unknown part "front-panel"']);
  });
  it('maps to the store, not cumulative', () => {
    const hidden = (state: Record<string, unknown>) => (spaceSceneEngine.fromChapterState(state) as Partial<SpaceSceneExt>).hidden;
    expect(hidden({ hide: ['a'] })).toEqual(['a']);
    expect(hidden({})).toEqual([]);
  });
});
