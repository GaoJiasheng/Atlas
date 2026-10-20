import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { model, type InstrumentModelSpec, type InstrumentSpec } from '../../src/engines/math-scene/schema';
import { scaleOf } from '../../src/engines/math-scene/lib/instrument';
import { heightHeadShare, sideBySide, straightFrame } from '../../src/engines/math-scene/stage/instrument/geometry';
import { InstrumentModel } from '../../src/engines/math-scene/stage/Instrument';
import { countingTrack, StraightInstrument } from '../../src/engines/math-scene/stage/instrument/Ruler';

const M = 1_000_000;
const chart = (extra: Record<string, unknown> = {}) => model.parse({ kind: 'instrument', type: 'tape', look: 'height-chart', unit: 'cm', from: 100, to: 200, major: 10, minor: 5, head: 105, ...extra }) as InstrumentSpec;
const attr = (tag: string, name: string) => Number(tag.match(new RegExp(` ${name}="([^"]+)"`))![1]);

describe('a height chart', () => {
  it.each([{ x: 0, y: 0, w: 800, h: 700 }, { x: 10, y: 20, w: 310, h: 300 }, { x: 0, y: 0, w: 150, h: 100 }])('shows a complete head near a nonzero lowest mark in $w × $h', (box) => {
    const s = chart();
    const sc = scaleOf(s)!;
    const f = straightFrame(s, sc, box, { counting: false });
    const html = renderToStaticMarkup(createElement('svg', null, createElement(StraightInstrument, { s, sc, f, defs: 'height', locale: 'en', head: s.head!.units })));
    const head = html.match(/<circle class="ms-inst__person"[^>]+>/)![0];
    const headBottom = attr(head, 'cy') + attr(head, 'r');
    const body = html.match(/<path class="ms-inst__person"[^>]+>/)![0];
    const cutoff = Number(body.match(/d="M[-\d.]+ ([-\d.]+)/)![1]);
    expect(html).not.toContain('clipPath');
    expect(headBottom).toBeGreaterThan(f.track.at(sc.from).y);
    expect(cutoff).toBeGreaterThan(headBottom);
    expect(cutoff).toBeGreaterThan(f.track.at(sc.from).y);
    expect(cutoff + 4).toBeLessThanOrEqual(box.y + box.h);
    expect(body).toContain('data-cropped="true"');
    expect(f.floor).toBeNull();
    expect(f.thing.h).toBeGreaterThan(0);
    expect(f.ppu).toBeGreaterThan(0);
  });

  it('reserves space using the drawn position on a chart with a skipped stretch', () => {
    const s = chart({ to: 1000, major: 10, minor: 1, head: 991, skip: { from: 100, to: 990 } });
    const sc = scaleOf(s)!;
    expect(heightHeadShare(s, sc)).toBe(0.25);
    const box = { x: 0, y: 0, w: 310, h: 300 };
    const f = straightFrame(s, sc, box, { counting: false });
    const html = renderToStaticMarkup(createElement('svg', null, createElement(StraightInstrument, { s, sc, f, defs: 'skip-height', locale: 'en', head: s.head!.units })));
    const body = html.match(/<path class="ms-inst__person"[^>]+>/)![0];
    const cutoff = Number(body.match(/d="M[-\d.]+ ([-\d.]+)/)![1]);
    expect(cutoff + 4).toBeLessThanOrEqual(box.h);
  });

  it('keeps the chart height when the head is clear of the lowest mark', () => {
    const s = chart({ head: 150 });
    const sc = scaleOf(s)!;
    const box = { x: 0, y: 0, w: 800, h: 700 };
    const f = straightFrame(s, sc, box, { counting: false });
    const full = straightFrame(chart({ from: 0, head: 150 }), scaleOf(chart({ from: 0, head: 150 }))!, box, { counting: false });
    expect(f.thing.h).toBe(full.thing.h);
  });

  it('keeps grouped charts on the same scale when one head is near the lowest mark', () => {
    const spec = { type: 'tape', look: 'height-chart', unit: 'cm', from: 100, to: 200, major: 10, minor: 5 };
    const pair = model.parse({ kind: 'instrument', ...spec, pair: [
      { ...spec, head: 105, label: { en: 'A', zh: '甲' } },
      { ...spec, head: 150, label: { en: 'B', zh: '乙' } },
    ] }) as InstrumentModelSpec;
    const html = renderToStaticMarkup(createElement('svg', null, createElement(InstrumentModel, { model: pair, box: { x: 0, y: 0, w: 700, h: 400 }, defs: 'pair', locale: 'en', label: 'Compare heights' })));
    const heights = [...html.matchAll(/<rect class="ms-inst__body"[^>]+>/g)].map(([tag]) => attr(tag, 'height'));
    const marks = [...html.matchAll(/<line class="ms-inst__major"[^>]+>/g)].map(([tag]) => attr(tag, 'y1'));
    expect(heights).toHaveLength(2);
    expect(heights[0]).toBe(heights[1]);
    expect(marks.slice(0, marks.length / 2)).toEqual(marks.slice(marks.length / 2));
  });

  it('fits each complete person, head board and strip inside a phone-width pair member', () => {
    const members = [chart({ head: 105 }), chart({ head: 150 })];
    const boxes = sideBySide({ x: 12, y: 190, w: 366, h: 485 }, 2, false);
    const headShare = Math.min(...members.map((s) => heightHeadShare(s, scaleOf(s)!)));
    const frames = members.map((s, i) => straightFrame(s, scaleOf(s)!, boxes[i]!, { counting: false, headShare }));
    for (const [i, f] of frames.entries()) {
      const box = boxes[i]!;
      const r = f.personRadius;
      const hx = f.body.x - 26 - r;
      expect(hx - r * 1.9 - 0.5).toBeGreaterThanOrEqual(box.x);
      expect(hx - r - 8 - 0.5).toBeGreaterThanOrEqual(box.x);
      expect(f.body.x + f.body.w + 0.5).toBeLessThanOrEqual(box.x + box.w);
      expect(r).toBeGreaterThan(8);
    }
    expect(frames[0]!.body.h).toBe(frames[1]!.body.h);
  });

  it('keeps the floor and full torso on a chart starting at zero', () => {
    const s = chart({ from: 0, head: 128 });
    const sc = scaleOf(s)!;
    const f = straightFrame(s, sc, { x: 0, y: 0, w: 800, h: 700 }, { counting: false });
    const html = renderToStaticMarkup(createElement('svg', null, createElement(StraightInstrument, { s, sc, f, defs: 'height', locale: 'en', head: s.head!.units })));
    expect(f.floor).toBe(f.track.at(0).y);
    expect(html).not.toContain('data-cropped');
  });

  it.each([false, true])('draws counting arcs on the free side, clear of the person and dual=%s number columns', (dual) => {
    const s = chart({ sub: { unit: 'm' }, dual, count: { from: 120, to: 130 } });
    const sc = scaleOf(s)!;
    const f = straightFrame(s, sc, { x: 0, y: 0, w: 700, h: 600 }, { counting: true });
    const track = countingTrack(f);
    const p = track.at(120 * M);
    expect(p.x).toBeGreaterThan(f.body.x + f.body.w);
    expect(p.y).toBe(f.track.at(120 * M).y);
    expect(p.nx).toBe(-1);
    const html = renderToStaticMarkup(createElement('svg', null, createElement(StraightInstrument, { s, sc, f, defs: 'height', locale: 'en', head: s.head!.units, counted: [4, 5] })));
    const arcs = [...html.matchAll(/class="ms-inst__arc"[^>]*><path d="M([\d.]+) [^Q]+Q([\d.]+) /g)];
    expect(arcs).toHaveLength(2);
    for (const arc of arcs) {
      expect(Number(arc[1])).toBeGreaterThan(f.body.x + f.body.w);
      expect(Number(arc[2])).toBeGreaterThan(Number(arc[1]));
    }
  });

  it('leaves a horizontal ruler’s counting track unchanged', () => {
    const s = chart({ look: 'tape', head: undefined });
    const sc = scaleOf(s)!;
    const f = straightFrame(s, sc, { x: 0, y: 0, w: 700, h: 600 }, { counting: true });
    expect(countingTrack(f)).toBe(f.track);
  });
});
