/**
 * The published `forces` topic (docs/30): every simulated number its captions
 * and chapter bodies state is what the model gives for that beat's settings;
 * the syllabus boundaries (docs/30 D3, D4) hold in the main line; the data
 * keeps the fixes made in content (the side push stays on the runway, no
 * friction arrow on a rolling wheel).
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse as parseYaml } from 'yaml';
import { evaluateSim } from '../../src/engines/space-scene/lib/sim';
import { resolveSimValues } from '../../src/engines/space-scene/lib/sim/controls';
import { endValue, isTimeline, type Timeline } from '../../src/engines/space-scene/lib/sim/timeline';
import { simSchema, type SimData } from '../../src/engines/space-scene/sim-schema';

const DIR = join(import.meta.dirname, '../../src/content/topics/forces');
const parts = JSON.parse(readFileSync(join(DIR, 'data/parts.json'), 'utf8'));
const sim: SimData = simSchema.parse(parts.sim);

interface Beat {
  sim?: { set?: Record<string, unknown> };
  caption: { en: string; zh: string };
}
interface Chapter {
  id: string;
  set: Record<string, unknown>;
  beats: Beat[];
  body: string;
}
const chapters: Chapter[] = readdirSync(join(DIR, 'chapters'))
  .filter((f) => f.endsWith('.mdx'))
  .sort()
  .map((f) => {
    const text = readFileSync(join(DIR, 'chapters', f), 'utf8');
    const [, front, ...rest] = text.split(/^---$/m);
    const fm = parseYaml(front!);
    return { id: fm.id, set: fm.state.sim?.set ?? {}, beats: fm.state.beats, body: rest.join('---') };
  });
const chapter = (id: string) => chapters.find((c) => c.id === id)!;

/** The model's outputs for a beat: chapter `set` with the beat's `set` on top (as the stage does). */
function outputsAt(ch: string, beat: number): Record<string, unknown> {
  const c = chapter(ch);
  const values = resolveSimValues(sim, { ...c.set, ...(c.beats[beat - 1]!.sim?.set ?? {}) });
  return evaluateSim(sim, values) as unknown as Record<string, unknown>;
}
const shown = (v: unknown, decimals: number) => (v as number).toFixed(decimals);

/** [chapter, beat (1-based), output, decimals, shown value, English words, Chinese words] */
const BEAT_NUMBERS: [string, number, string, number, string, string, string][] = [
  ['before-you-start', 3, 'extension', 1, '2.0', 'two centimetres', '两厘米'],
  ['pushes-and-pulls', 2, 'speed-before', 2, '0.60', 'zero point six', '零点六'],
  ['pushes-and-pulls', 2, 'speed-after', 2, '0.90', 'zero point nine', '零点九'],
  ['pushes-and-pulls', 3, 'speed-after', 2, '0.30', 'zero point three', '零点三'],
  ['pushes-and-pulls', 4, 'speed-after', 2, '0.00', 'stops', '停下'],
  ['pushes-and-pulls', 5, 'speed-after', 2, '0.60', 'keeps its speed', '快慢不变'],
  ['gravity-and-weight', 2, 't-left', 2, '0.45', 'zero point four five', '零点四五'],
  ['gravity-and-weight', 2, 't-right', 2, '0.45', 'zero point four five', '零点四五'],
  ['gravity-and-weight', 3, 't-left', 2, '0.55', 'zero point five five', '零点五五'],
  ['gravity-and-weight', 3, 't-right', 2, '0.55', 'zero point five five', '零点五五'],
  ['gravity-and-weight', 4, 't-left', 2, '0.46', 'under half a second', '不到半秒'],
  ['gravity-and-weight', 4, 't-right', 2, '1.00', 'about one second', '约一秒'],
  ['gravity-and-weight', 5, 'weight', 1, '2.2', 'two point two newtons', '二点二牛顿'],
  ['friction-starting', 3, 'f-start', 1, '1.0', 'one newton', '一牛顿'],
  ['friction-starting', 3, 'f-move', 1, '0.6', 'zero point six newtons', '零点六牛顿'],
  ['friction-starting', 4, 'f-start', 1, '1.8', 'one point eight newtons', '一点八牛顿'],
  ['friction-starting', 5, 'f-start', 1, '2.9', 'two point nine newtons', '二点九牛顿'],
  ['friction-and-motion', 1, 'distance', 0, '53', 'fifty-three centimetres', '五十三厘米'],
  ['friction-and-motion', 2, 'distance', 0, '80', 'eighty centimetres', '八十厘米'],
  ['friction-and-motion', 3, 'distance', 0, '19', 'nineteen centimetres', '十九厘米'],
  ['friction-and-motion', 5, 'distance', 0, '80', 'eighty centimetres', '八十厘米'],
  ['elastic-spring-force', 1, 'extension', 1, '1.0', 'one centimetre', '一厘米'],
  ['elastic-spring-force', 3, 'extension', 1, '4.0', 'four centimetres', '四厘米'],
  ['elastic-spring-force', 5, 'extension', 1, '9.2', 'nine point two centimetres', '九点二厘米'],
  ['elastic-spring-force', 6, 'extension', 1, '1.2', 'one point two centimetres', '一点二厘米'],
  ['forces-at-work', 2, 'stop-time', 0, '80', 'eighty seconds', '八十秒'],
  ['forces-at-work', 3, 'stop-time', 1, '1.8', 'one point eight seconds', '一点八秒'],
  ['forces-at-work', 4, 'stop-time', 1, '0.6', 'zero point six seconds', '零点六秒'],
];

/** Effects and landings the captions name. */
const BEAT_STATES: [string, number, string, string][] = [
  ['pushes-and-pulls', 1, 'effect', 'starts'],
  ['pushes-and-pulls', 2, 'effect', 'speeds-up'],
  ['pushes-and-pulls', 3, 'effect', 'slows-down'],
  ['pushes-and-pulls', 4, 'effect', 'stops'],
  ['pushes-and-pulls', 5, 'effect', 'turns'],
  ['pushes-and-pulls', 6, 'effect', 'starts'],
  ['gravity-and-weight', 2, 'landing', 'together'],
  ['gravity-and-weight', 3, 'landing', 'together'],
  ['gravity-and-weight', 4, 'landing', 'left-first'],
  ['elastic-spring-force', 6, 'returns', 'stays-longer'],
];

describe('forces topic: captions say what the model gives', () => {
  it.each(BEAT_NUMBERS)('%s beat %i: %s = %s', (ch, beat, output, decimals, value, en, zh) => {
    const out = outputsAt(ch, beat);
    expect(shown(out[output], decimals)).toBe(value);
    const caption = chapter(ch).beats[beat - 1]!.caption;
    expect(caption.en).toContain(en);
    expect(caption.zh).toContain(zh);
  });

  it.each(BEAT_STATES)('%s beat %i: %s is %s', (ch, beat, output, state) => {
    expect(outputsAt(ch, beat)[output]).toBe(state);
  });

  it('the side push turns the car fifteen degrees and it stays on the runway', () => {
    const out = outputsAt('pushes-and-pulls', 5);
    const run = out['push-run'] as Timeline;
    expect(isTimeline(run)).toBe(true);
    expect(Math.abs(endValue(run, "heading"))).toBeCloseTo(15, 0);
    // The car (28 mm half-width on its wheels) ends inside the side rails (runway 28 cm wide, rails 6 mm).
    const drift = Math.abs(endValue(run, "z"));
    expect(drift + 0.028).toBeLessThan(0.14 - 0.006);
    const runway = parts.parts.find((p: { id: string }) => p.id === 'runway').primitive.size[2];
    expect(runway).toBeCloseTo(0.28, 3);
  });
});

/** Design values (S1) the bodies state that are inputs, not outputs, of the model. */
const DESIGN = new Set([
  '0 g', '50 g', '175 g', '200 g', '300 g', '350 g', '400 g', '28 g', '224 g',
  '3 cm', '6 cm', '9 cm', '8.0 cm', '25 cm', '3.5 cm', '1.0 cm',
  '1.0 m', '1.5 m', '15°', '0.15 s', '4 times', '4 倍', '2 turns per second', '每秒 2 圈',
  '0.3 m/s', '0.4 m/s', '0.6 m/s', '1.1 m/s', '0.05 N', '0.4 N', '80 s',
]);

describe('forces topic: every S1 number in the chapter bodies is the model or the design', () => {
  // Every reading the model can show, at its display precision.
  const grid: Record<string, unknown>[] = [];
  for (const push of ['behind', 'front', 'front-firm', 'side']) for (const start of ['rest', 'moving']) grid.push({ push, 'car-start': start });
  for (const pair of ['balls', 'papers', 'ball-paper', 'ball-crumpled']) for (const h of [0.5, 1.0, 1.5]) grid.push({ pair, 'drop-height': h });
  for (const weigh of ['small-ball', 'large-ball', 'paper']) grid.push({ weigh });
  for (const lane of ['glass', 'wood', 'sandpaper']) for (const load of [0, 200, 400]) grid.push({ lane, 'block-load': load });
  for (const runway of ['glass', 'wood', 'carpet']) for (const h of [3, 6, 9]) grid.push({ runway, 'ramp-height': h });
  for (const load of [0, 50, 100, 150, 200, 250, 300, 350, 400]) for (const unload of [false, true]) grid.push({ 'spring-load': load, unload });
  for (const squeeze of ['none', 'light', 'firm']) grid.push({ squeeze });
  const modelled = new Set<string>();
  for (const set of grid) {
    const out = evaluateSim(sim, resolveSimValues(sim, set)) as unknown as Record<string, unknown>;
    for (const o of sim.outputs) {
      const v = out[o.id];
      if (typeof v !== 'number') continue;
      const d = o.decimals ?? 0;
      modelled.add(o.unit ? `${v.toFixed(d)} ${o.unit}` : v.toFixed(d));
    }
  }

  it.each(chapters.map((c) => [c.id, c.body] as const))('%s', (_id, body) => {
    const nums = [...body.matchAll(/<Num s="S1">([^<]+)<\/Num>/g)].map((m) => m[1]!);
    for (const n of nums) expect(modelled.has(n) || DESIGN.has(n), n).toBe(true);
  });
});

/** The main line: chapter bodies without their <More> boxes, and the captions. */
function mainLine(c: Chapter): string {
  return c.body.replace(/<More[\s\S]*?<\/More>/g, '') + c.beats.map((b) => `${b.caption.en}\n${b.caption.zh}`).join('\n');
}

describe('forces topic: syllabus boundaries (docs/30 D3, D4)', () => {
  it.each(chapters.map((c) => [c.id, c] as const))('%s keeps the terms and formulas out of the main line', (_id, c) => {
    const text = mainLine(c);
    for (const word of [/air resistance/i, /空气阻力/, /elastic limit/i, /弹性限度/, /Hooke/, /胡克/, /μ/, /\bF\s*=/, /coefficient/i, /系数/]) {
      expect(text, String(word)).not.toMatch(word);
    }
  });

  it('"air resistance" appears only in the gravity chapter, inside a More box', () => {
    for (const c of chapters) {
      const inMore = [...c.body.matchAll(/<More[\s\S]*?<\/More>/g)].map((m) => m[0]).join('\n');
      if (c.id === 'gravity-and-weight') expect(inMore).toMatch(/air resistance/i);
      else expect(c.body).not.toMatch(/air resistance|空气阻力/i);
    }
  });

  it('no grades in the text and only Chinese quotation marks in Chinese', () => {
    for (const c of chapters) {
      expect(c.body).not.toMatch(/\bP[3-6]\b|Primary [3-6]|primary [3-6]|小[三四五六]|Foundation/);
      const zh = [...c.body.matchAll(/<Lang zh>([\s\S]*?)<\/Lang>/g)].map((m) => m[1]).join('');
      expect(zh).not.toMatch(/[「」『』]/);
    }
  });

  it('no friction arrow on a rolling wheel; the arrows that show friction act on the block and the brake', () => {
    const arrows = parts.sim.overlays.flatMap((o: { arrows?: { part: string; force: string }[] }) => o.arrows ?? []);
    const friction = arrows.filter((a: { force: string }) => a.force === 'friction').map((a: { part: string }) => a.part);
    expect(friction.sort()).toEqual(['brake-caliper', 'wooden-block']);
  });
});
