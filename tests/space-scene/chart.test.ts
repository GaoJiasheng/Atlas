/**
 * The try-it graph (docs/30 F5): which kind of graph, its axis, the points
 * per recorded row, and the words a screen reader hears.
 */
import { describe, expect, it } from 'vitest';
import { chartModel, chartSummary, niceAxis, type SummaryWords } from '../../src/engines/space-scene/lib/sim/chart';
import type { TableRow } from '../../src/engines/space-scene/lib/sim/trial';
import type { SimControl, SimOutput, SimValue } from '../../src/engines/space-scene/sim-schema';

const l = (en: string) => ({ en, zh: en });
const load: SimControl = { id: 'spring-load', kind: 'step', label: l('Load'), values: [0, 50, 100, 150, 200, 250, 300, 350, 400], default: 0, unit: 'g' };
const lane: SimControl = { id: 'lane', kind: 'choice', label: l('Surface'), default: 'wood', options: [{ id: 'glass', label: l('Glass') }, { id: 'wood', label: l('Wood') }, { id: 'sandpaper', label: l('Sandpaper') }] };
const ext: SimOutput = { id: 'extension', kind: 'number', label: { en: 'Extension', zh: '伸长' }, unit: 'cm', decimals: 1 };
const pull: SimOutput = { id: 'f-start', kind: 'number', label: { en: 'Pull to start', zh: '开始滑动的拉力' }, unit: 'N', decimals: 1 };
const rows = (pairs: [SimValue, number][], id: string): TableRow[] => pairs.map(([vary, y]) => ({ vary, values: { [id]: y } }));
const words = (c: SimControl, locale: 'en' | 'zh' = 'en'): SummaryWords => ({
  locale,
  x: locale === 'zh' ? (c.id === 'lane' ? '表面' : '载荷') : c.label.en,
  xText: (v) => (c.kind === 'choice' ? (c.options.find((o) => o.id === v)?.label.en ?? String(v)) : `${v} ${c.kind === 'step' ? c.unit : ''}`.trim()),
  y: (o) => (locale === 'zh' ? o.label.zh : o.label.en),
  yText: (o, v) => `${v.toFixed(o.decimals ?? 0)} ${o.unit}`,
});

describe('axis', () => {
  it('round maxima with 2–6 steps', () => {
    expect(niceAxis(9.2)).toEqual({ max: 10, step: 2 });
    expect(niceAxis(1.8)).toEqual({ max: 2, step: 0.5 });
    expect(niceAxis(120)).toEqual({ max: 120, step: 20 });
    expect(niceAxis(0.45)).toEqual({ max: 0.5, step: 0.1 });
    expect(niceAxis(5.3)).toEqual({ max: 6, step: 1 });
    expect(niceAxis(0)).toEqual({ max: 1, step: 0.25 });
  });
});

describe('graph model', () => {
  it('no graph below two rows', () => {
    expect(chartModel(rows([[0, 0]], 'extension'), load, [ext], 0)).toBeNull();
  });
  it('a step control: a line over its values, sorted along x, the current row marked', () => {
    const m = chartModel(rows([[100, 2], [0, 0], [50, 1]], 'extension'), load, [ext], 50)!;
    expect(m.kind).toBe('line');
    expect(m.x).toEqual([0, 400]);
    expect(m.series[0]!.points.map((p) => p.x)).toEqual([0, 50, 100]);
    expect(m.series[0]!.points.find((p) => p.current)!.key).toBe(50);
    expect(m.yMax).toBe(2);
  });
  it('a choice: a bar per option in the options\' order', () => {
    const m = chartModel(rows([['sandpaper', 1.8], ['glass', 0.5]], 'f-start'), lane, [pull], 'glass')!;
    expect(m.kind).toBe('bar');
    expect(m.ticks).toEqual(['glass', 'wood', 'sandpaper']);
    expect(m.series[0]!.points.map((p) => [p.x, p.y])).toEqual([[0, 0.5], [2, 1.8]]);
  });
});

describe('words for a screen reader', () => {
  it('a steady rate and where it changes (the elastic limit)', () => {
    const data: [number, number][] = [[0, 0], [50, 1], [100, 2], [150, 3], [200, 4], [250, 5], [300, 6], [350, 7.3], [400, 9.2]];
    const m = chartModel(rows(data, 'extension'), load, [ext], 0)!;
    expect(chartSummary(m, words(load))).toBe('Line graph. Extension rises by 1.0 cm for every 50 g up to 300 g, then rises faster (0.0 cm at 0 g to 9.2 cm at 400 g)');
    expect(chartSummary(m, words(load, 'zh'))).toBe('折线图。载荷每增加 50 g，伸长增加 1.0 cm，直到 300 g，之后增加得更快（载荷 0 g 时 0.0 cm，400 g 时 9.2 cm）');
  });
  it('steady all the way, and rising unevenly', () => {
    const m = chartModel(rows([[0, 0], [100, 2], [200, 4]], 'extension'), load, [ext], 0)!;
    expect(chartSummary(m, words(load))).toBe('Line graph. Extension rises by 2.0 cm for every 100 g (0.0 cm at 0 g to 4.0 cm at 200 g)');
    const u = chartModel(rows([[0, 0], [100, 3], [200, 4]], 'extension'), load, [ext], 0)!;
    expect(chartSummary(u, words(load))).toBe('Line graph. Extension rises all the way, from 0.0 cm at 0 g to 4.0 cm at 200 g');
  });
  it('bars: each value, highest and lowest', () => {
    const m = chartModel(rows([['glass', 0.5], ['wood', 1.0], ['sandpaper', 1.8]], 'f-start'), lane, [pull], 'wood')!;
    expect(chartSummary(m, words(lane))).toBe('Bar graph. Pull to start for each surface: Glass 0.5 N, Wood 1.0 N, Sandpaper 1.8 N; highest for Sandpaper, lowest for Glass');
    expect(chartSummary(m, words(lane, 'zh'))).toBe('条形图。开始滑动的拉力（按表面）：Glass 0.5 N，Wood 1.0 N，Sandpaper 1.8 N；最高的是Sandpaper，最低的是Glass');
  });
});
