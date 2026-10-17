/**
 * Where the lesson draws and how the decimal models lay themselves out
 * (docs/06 MathScene, docs/29 §9.5): the model's rectangle beside a tall
 * rail and under a short card column (a 1024 × 768 tablet with the reader
 * open), the sentence's span past the model, a grid lined up over its
 * number line, a rounding line's halfway value clear of the mark's, the
 * smaller-unit reading drawn once at a mark, the labels of a money pair and
 * a place-value chart on the stage with the pair's boxes one height, and
 * the plates' discs beside the column method at 1920 × 1080.
 */
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { beatSchema, model as modelSchema, type Beat, type Model } from '../../src/engines/math-scene/schema';
import { freeRect, spanAt, type Panel, type StageLayout } from '../../src/engines/math-scene/stage/layout';
import { gridOverLine } from '../../src/engines/math-scene/stage/BeatModel';
import { DecimalLine } from '../../src/engines/math-scene/stage/DecimalLine';
import { MoneyModel } from '../../src/engines/math-scene/stage/MoneyModel';
import { PlaceValueChart } from '../../src/engines/math-scene/stage/PlaceValueChart';

const m = (x: unknown): Model => modelSchema.parse(x);
const svg = (el: ReturnType<typeof createElement>) => renderToStaticMarkup(createElement('svg', null, el));
const texts = (html: string) => [...html.matchAll(/<text[^>]*>([^<]*)<\/text>/g)].map((x) => x[1]);
/** The model's room at 1920 × 1080 (between the HUD columns, the sentence's line taken off). */
const BIG = { x: 342, y: 79, w: 806, h: 877 };

describe('the model on the stage', () => {
  // 1024 × 768, the reader open: the stage is 624 × 703; title, rail and plate on the left down to the dock, the card on the right.
  const left: Panel[] = [
    { x: 22, y: 16, w: 240, h: 239, side: 'left' },
    { x: 22, y: 271, w: 240, h: 305, side: 'left' },
    { x: 22, y: 587, w: 240, h: 37, side: 'left' },
  ];
  const card: Panel = { x: 338, y: 16, w: 264, h: 189, side: 'right' };
  it('takes the room under a short card column beside the rail (1024 × 768), not the 48 px between the columns', () => {
    const tools: Panel = { x: 338, y: 215, w: 264, h: 44, side: 'right' };
    const free = freeRect(624, 632, [...left, card, tools], 'hud');
    expect(free.x).toBe(276);
    expect(free.w).toBeGreaterThanOrEqual(300);
    expect(free.h).toBeGreaterThanOrEqual(300);
    expect(free.y).toBe(273);
  });
  it('keeps the band between the columns when it is the larger room (1280 × 720)', () => {
    const panels: Panel[] = [
      { x: 22, y: 16, w: 240, h: 579, side: 'left' },
      { x: 594, y: 16, w: 264, h: 242, side: 'right' },
      { x: 594, y: 267, w: 264, h: 220, side: 'right' },
    ];
    expect(freeRect(880, 603, panels, 'hud')).toEqual({ x: 276, y: 14, w: 304, h: 589 });
  });
  it('gives the sentence the free span at its height, up to the panels on either side', () => {
    const L: StageLayout = { w: 880, h: 674, free: { x: 276, y: 14, w: 304, h: 589 }, dock: 0, floor: 603, obstacles: [
      { x: 8, y: 2, w: 268, h: 607 },
      { x: 580, y: 2, w: 292, h: 270 },
      { x: 580, y: 253, w: 292, h: 248 },
    ] };
    // Beside the card and the control panel: only the band.
    expect(spanAt(L, 420, 58, 428)).toEqual({ x: 276, w: 304 });
    // Lower than the control panel: on to the stage's right edge.
    expect(spanAt(L, 520, 58, 428)).toEqual({ x: 276, w: 590 });
  });
});

describe('a hundred grid over its number line', () => {
  const beat = (x: unknown): Beat => beatSchema.parse(x);
  it('lays 0…1 of the line under the first whole and 1…2 under the second', () => {
    const b = beat({ model: { kind: 'decimal-grid', level: 10, wholes: 2, given: '1.4' }, under: { kind: 'numberline', scale: 'decimal', from: '0', to: '2', step: '0.1', labels: 'wholes', marks: ['0.9', '1.0', '1.4'] }, caption: { en: 'c', zh: 'c' } });
    const g = gridOverLine(b.model, b.under!, BIG)!;
    expect(g.line.x).toBe(g.grid.x);
    expect(g.line.w).toBeCloseTo(2 * g.grid.s, 6);
    expect(g.line.y).toBeGreaterThan(g.grid.y + g.grid.s);
    expect(g.grid.x + 2 * g.grid.s).toBeLessThanOrEqual(BIG.x + BIG.w);
  });
  it('one whole over 0…1', () => {
    const b = beat({ model: { kind: 'decimal-grid', level: 10, given: '0.3' }, under: { kind: 'numberline', scale: 'decimal', from: '0', to: '1', step: '0.1', labels: 'all', marks: ['0.3'] }, caption: { en: 'c', zh: 'c' } });
    const g = gridOverLine(b.model, b.under!, BIG)!;
    expect(g.line).toMatchObject({ x: g.grid.x, w: g.grid.s });
  });
  it('does not line up a zoomed line or a line past the wholes', () => {
    const grid = m({ kind: 'decimal-grid', level: 10, given: '0.3' });
    expect(gridOverLine(grid, m({ kind: 'numberline', scale: 'decimal', from: '0', to: '2', step: '0.1' }), BIG)).toBeNull();
    expect(gridOverLine(grid, m({ kind: 'numberline', scale: 'decimal', from: '0', to: '1', step: '0.1', zoom: [{ from: '0.2', to: '0.3' }] }), BIG)).toBeNull();
  });
});

describe('the decimal line', () => {
  const line = (x: unknown) => {
    const spec = m(x);
    if (spec.kind !== 'numberline' || spec.scale !== 'decimal') throw new Error('line');
    return svg(createElement(DecimalLine, { defs: 'd', box: { x: 0, y: 0, w: 806, h: 200 }, model: spec, locale: 'en', label: 'l' }));
  };
  it('moves the halfway value under the line when the mark sits by it (3.447 by 3.45)', () => {
    const html = line({ kind: 'numberline', scale: 'decimal', from: '3.4', to: '3.5', step: '0.01', labels: 'ends', marks: ['3.447'], halfway: true, nearest: '3.4' });
    expect(html).toMatch(/class="ms-dline__half"[^>]*data-under="true"/);
    expect(texts(html).filter((t) => t === '3.45')).toHaveLength(1);
  });
  it('keeps the halfway value above the line when no mark is near it', () => {
    const html = line({ kind: 'numberline', scale: 'decimal', from: '4.6', to: '4.7', step: '0.01', labels: 'ends', marks: ['4.63'], halfway: true, nearest: '4.6' });
    expect(html).not.toContain('data-under');
    expect(texts(html)).toContain('4.65');
  });
  it('draws the smaller-unit reading once at a mark on a labelled tick (2045)', () => {
    const html = line({ kind: 'numberline', scale: 'decimal', from: '2.04', to: '2.05', step: '0.001', labels: 'all', unit: 'km', dual: { unit: 'm', factor: 1000 }, marks: ['2.045'] });
    expect(texts(html).filter((t) => t === '2045')).toHaveLength(1);
    expect(texts(html)).toContain('2044');
  });
  it('lifts a mark value that would touch the one before it, on a leader', () => {
    const html = svg(
      createElement(DecimalLine, { defs: 'd', box: { x: 0, y: 0, w: 380, h: 200 }, model: m({ kind: 'numberline', scale: 'decimal', from: '0', to: '2', step: '0.1', labels: 'wholes', marks: ['0.9', '1.0', '1.4'] }) as never, locale: 'en', label: 'l' }),
    );
    expect(html.match(/ms-dline__tag/g)).toHaveLength(1);
  });
});

describe('labels and pairs', () => {
  it('names each amount of a money pair over it, the two boxes one height', () => {
    const money = m({ kind: 'money', layout: 'by-place', pair: [{ amount: '2.35', label: { en: 'Noodles', zh: '面' } }, { amount: '1.80', label: { en: 'Drink', zh: '饮料' } }] });
    if (money.kind !== 'money') throw new Error('money');
    const html = svg(createElement(MoneyModel, { box: BIG, model: money, locale: 'en', label: 'l' }));
    expect(texts(html)).toEqual(expect.arrayContaining(['Noodles', 'Drink']));
    const heights = new Set([...html.matchAll(/class="ms-mat__band"[^>]*height="([\d.]+)"/g)].map((x) => x[1]));
    expect(heights.size).toBe(1);
  });
  it('names a place-value chart over it', () => {
    const chart = m({ kind: 'place-value', columns: ['H', 'T', 'O', 't', 'h'], value: '0.75', show: 'digits', shift: { by: 3, dir: 'left' }, label: { en: 'kg → g: × 1000', zh: '千克化克：× 1000' } });
    if (chart.kind !== 'place-value') throw new Error('chart');
    expect(texts(svg(createElement(PlaceValueChart, { box: BIG, model: chart, locale: 'zh', label: 'l' })))).toContain('千克化克：× 1000');
  });
  it('keeps the plates’ discs at 28 px or more beside the column method at 1920 × 1080 (7 ÷ 4 = 1.75)', () => {
    const chart = m({ kind: 'place-value', columns: ['O', 't', 'h'], value: '7', plates: 4, dealt: { O: 1, t: 7, h: 5 }, show: 'discs', money: true, column: { op: '÷', a: '7', b: '4' } });
    if (chart.kind !== 'place-value') throw new Error('chart');
    const html = svg(createElement(PlaceValueChart, { box: BIG, model: chart, locale: 'en', label: 'l' }));
    const radii = [...html.matchAll(/class="ms-disc ms-disc--dealt"><circle[^>]*r="([\d.]+)"/g)].map((x) => Number(x[1]));
    expect(radii).toHaveLength(4 * 13);
    expect(Math.min(...radii) * 2).toBeGreaterThanOrEqual(28);
  });
});
