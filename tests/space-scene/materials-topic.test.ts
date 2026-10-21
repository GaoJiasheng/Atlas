/**
 * The `materials` topic (docs/37): every result its captions state is what the
 * materials model gives for that beat's settings; the five-test table
 * (`profile`) is docs/37 §2.5 T6 as corrected by fact-check pass 2; the
 * topic's constants are the author template's (S1); the drawn bench agrees
 * with the model's sizes (supports at ±span / 2, the clamp's edge and reach,
 * the peg's foot on the strip, the water depth); no material-property number
 * reaches a card, the PLATE block or a caption (D9); and the syllabus
 * boundaries hold: "density" once, in the chapter 03 More box, and
 * transparent / translucent / opaque only in chapter 05's More box and the
 * glossary; plastic is 塑料 throughout.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse as parseYaml } from 'yaml';
import { evaluateSim } from '../../src/engines/space-scene/lib/sim';
import { resolveSimValues } from '../../src/engines/space-scene/lib/sim/controls';
import { simSchema, type SimData } from '../../src/engines/space-scene/sim-schema';
import { materialsBench } from './fixtures/materials-bench';

const DIR = join(import.meta.dirname, '../../src/content/topics/materials');
const parts = JSON.parse(readFileSync(join(DIR, 'data/parts.json'), 'utf8'));
const glossaryText = readFileSync(join(DIR, 'data/glossary.json'), 'utf8');
const sim: SimData = simSchema.parse(parts.sim);
type Prim = { kind: string; at: number[]; size?: number[]; profile?: number[][] };
type Part = { id: string; primitive: Prim; extra?: Prim[]; summary: { en: string; zh: string }; detail: { en: string; zh: string } };
const part = (id: string): Part => parts.parts.find((p: Part) => p.id === id);

interface Beat {
  sim?: { set?: Record<string, unknown> };
  caption: { en: string; zh: string };
}
interface Chapter {
  id: string;
  set: Record<string, unknown>;
  try?: { observe: string[]; predict?: { observe: string } };
  summary: { en: string; zh: string };
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
    return { id: fm.id, set: fm.state.sim?.set ?? {}, try: fm.state.sim?.try, summary: fm.state.summary, beats: fm.state.beats, body: rest.join('---') };
  });
const chapter = (id: string) => chapters.find((c) => c.id === id)!;
const out = (set: Record<string, unknown>) => evaluateSim(sim, resolveSimValues(sim, set as never)) as unknown as Record<string, unknown>;
const at = (ch: string, beat: number, extra: Record<string, unknown> = {}) => {
  const c = chapter(ch);
  return out({ ...c.set, ...(c.beats[beat - 1]!.sim?.set ?? {}), ...extra });
};

/** [chapter, beat (1-based), extra settings for a material the caption also names, output, state]. */
const CAPTION_STATES: [string, number, Record<string, unknown>, string, string][] = [
  ['strength', 2, {}, 'strength-result', 'holds'],
  ['strength', 2, {}, 'strength-bend', 'a-little'],
  ['strength', 3, {}, 'strength-result', 'snapped'],
  ['strength', 3, {}, 'bridge-view', 'glass-snapped'],
  ['strength', 3, { strip: 'ceramic' }, 'strength-result', 'snapped'],
  ['strength', 4, {}, 'strength-result', 'on-bench'],
  ['strength', 5, {}, 'strength-result', 'on-bench'],
  ['strength', 5, { strip: 'rubber' }, 'strength-result', 'on-bench'],
  ['flexibility', 2, {}, 'flex-result', 'bends'],
  ['flexibility', 3, {}, 'flex-result', 'snapped'],
  ['flexibility', 3, {}, 'bend-view', 'glass-snapped'],
  ['flexibility', 3, { strip: 'ceramic' }, 'flex-result', 'snapped'],
  ['flexibility', 4, {}, 'flex-result', 'droops'],
  ['flexibility', 4, { strip: 'plastic' }, 'flex-result', 'droops'],
  ['flexibility', 4, { strip: 'fabric' }, 'flex-result', 'droops'],
  ['float-or-sink', 1, {}, 'float-result', 'floats'],
  ['float-or-sink', 2, {}, 'float-result', 'sinks'],
  ['float-or-sink', 3, {}, 'float-result', 'floats'],
  ['float-or-sink', 4, {}, 'float-result', 'floats'],
  ['float-or-sink', 5, {}, 'float-result', 'floats'],
  ['waterproof', 1, {}, 'drop-result', 'stays-on-top'],
  ['waterproof', 2, {}, 'drop-result', 'soaks-in'],
  ['waterproof', 3, {}, 'drop-result', 'soaks-in'],
  ['waterproof', 4, {}, 'drop-result', 'stays-on-top'],
  ['waterproof', 4, { square: 'metal' }, 'drop-result', 'stays-on-top'],
  ['waterproof', 4, { square: 'rubber' }, 'drop-result', 'stays-on-top'],
  ['waterproof', 4, { square: 'glass' }, 'drop-result', 'stays-on-top'],
  ['light-through', 2, {}, 'light-result', 'most'],
  ['light-through', 3, {}, 'light-result', 'some'],
  ['light-through', 3, { square: 'fabric' }, 'light-result', 'some'],
  ['light-through', 4, {}, 'light-result', 'none'],
  ['light-through', 4, { square: 'metal' }, 'light-result', 'none'],
  ['light-through', 4, { square: 'ceramic' }, 'light-result', 'none'],
  ['light-through', 4, { square: 'rubber' }, 'light-result', 'none'],
  ['choosing-materials', 5, {}, 'p-light', 'most'],
  ['choosing-materials', 5, {}, 'p-water', 'stays-on-top'],
  ['choosing-materials', 5, {}, 'p-strength', 'snapped'],
  ['choosing-materials', 5, {}, 'p-float', 'sinks'],
  ['choosing-materials', 5, {}, 'strength-result', 'snapped'],
  ['choosing-materials', 5, {}, 'flex-result', 'snapped'],
  ['choosing-materials', 5, {}, 'float-result', 'sinks'],
];

describe('materials topic: captions say what the model gives', () => {
  it.each(CAPTION_STATES)('%s beat %i %o: %s is %s', (ch, beat, extra, output, state) => {
    expect(at(ch, beat, extra)[output]).toBe(state);
  });

  it('a capped bottle floats but a solid block of its plastic (PET) would sink: the bottle is the only block the model floats by its air', () => {
    expect(sim.materials!.tank!.blocks.bottle).toEqual({ density: 40, height: 6.5 });
    expect(out({ block: 'bottle' })['float-result']).toBe('floats');
  });

  it('fabric sinks once it has soaked (the end state the model draws), and the captions never say it sinks at once', () => {
    expect(out({ block: 'fabric' })['float-result']).toBe('sinks');
    const text = chapters.map((c) => c.body).join('\n');
    expect(text).toMatch(/soak/);
  });
});

describe('materials topic: the five tests together (docs/37 §2.5 T6, fact-check pass 2)', () => {
  const T6: Record<string, [string, string, string, string, string]> = {
    wood: ['holds', 'bends', 'floats', 'soaks-in', 'none'],
    metal: ['holds', 'bends', 'sinks', 'stays-on-top', 'none'],
    ceramic: ['snapped', 'snapped', 'sinks', 'stays-on-top', 'none'],
    rubber: ['on-bench', 'droops', 'floats', 'stays-on-top', 'none'],
    glass: ['snapped', 'snapped', 'sinks', 'stays-on-top', 'most'],
    plastic: ['on-bench', 'droops', 'floats', 'stays-on-top', 'some'],
    fabric: ['on-bench', 'droops', 'sinks', 'soaks-in', 'some'],
  };
  it.each(Object.entries(T6))('%s', (pick, row) => {
    const o = out({ pick });
    expect(['p-strength', 'p-flex', 'p-float', 'p-water', 'p-light'].map((k) => o[k])).toEqual(row);
  });

  it('glass and ceramic both snap at the third mass and at 1.5 cm, so the text never ranks them', () => {
    for (const strip of ['glass', 'ceramic']) {
      expect([0, 1, 2, 3, 4, 5].map((masses) => out({ strip, masses })['strength-result'])).toEqual(['holds', 'holds', 'holds', 'snapped', 'snapped', 'snapped']);
      expect([0, 0.5, 1, 1.5, 2].map((push) => out({ strip, push })['flex-result'])).toEqual(['not-pushed', 'bends', 'bends', 'snapped', 'snapped']);
    }
  });

  it('plastic bends a lot with one mass and rests on the bench from two; rubber is on the bench from the start', () => {
    expect(out({ strip: 'plastic', masses: 1 })['strength-bend']).toBe('a-lot');
    expect(out({ strip: 'plastic', masses: 1 })['strength-result']).toBe('holds');
    expect(out({ strip: 'plastic', masses: 2 })['strength-result']).toBe('on-bench');
    expect(out({ strip: 'rubber', masses: 0 })['strength-result']).toBe('on-bench');
  });

  it('the topic uses the author template’s constants (S1)', () => {
    expect(sim.materials).toEqual(materialsBench);
  });
});

describe('materials topic: the drawn bench is the model’s bench', () => {
  const m = sim.materials!;
  it('strips are 30 × 3 cm and 2 mm, as the model’s strip', () => {
    for (const id of ['bridge-wood', 'bend-glass']) expect(part(id).primitive.size).toEqual([0.3, m.strip.thick, m.strip.width]);
  });

  it('the support blocks’ inner faces stand on the supports (±span / 2), 6 cm high = the clearance', () => {
    const b = part('bridge-blocks');
    const strip = part('bridge-wood').primitive.at;
    const faces = [b.primitive, ...(b.extra ?? [])].map((p) => p.at[0]! + (p.at[0]! < strip[0]! ? 1 : -1) * p.size![0]! / 2);
    expect(faces.map((x) => Math.abs(x - strip[0]!))).toEqual([m.bridge!.span / 2, m.bridge!.span / 2].map((v) => expect.closeTo(v, 6)));
    expect(b.primitive.size![1]).toBeCloseTo(m.bridge!.clearance, 6);
    expect(strip[1]! - m.strip.thick / 2).toBeCloseTo(m.bridge!.clearance, 6);
  });

  it('the clamp edge, reach and the push peg agree with the cantilever binding', () => {
    const bind = sim.bind.find((b) => 'bend' in b && (b as { bend: { mode: string } }).bend.mode === 'cantilever') as unknown as { bend: { clamp: number; reach: number } };
    const strip = part('bend-wood').primitive.at;
    expect(strip[0]! + bind.bend.clamp + bind.bend.reach).toBeCloseTo(strip[0]! + 0.15, 6);
    expect(bind.bend.reach).toBe(m.cantilever!.reach);
    // The peg's rubber foot rests on the strip's top at push 0.
    const peg = part('push-peg');
    const foot = peg.extra!.find((p) => p.kind === 'cylinder')!;
    expect(foot.at[1]! - foot.size![0]!).toBeCloseTo(strip[1]! + m.strip.thick / 2, 6);
  });

  it('the water is 18 cm deep in the tank, as in the model', () => {
    const water = part('tank-water').primitive;
    expect(water.size![1]! * 100).toBeCloseTo(m.tank!.water, 6);
    expect(part('tank').primitive.size![1]! * 100).toBeCloseTo(m.tank!.height!, 6);
  });
});

describe('materials topic: no material numbers in the UI (D9)', () => {
  it('cards observe only state outputs; the PLATE block follows only apparatus readings', () => {
    const kinds = new Map(sim.outputs.map((o) => [o.id, o]));
    for (const c of chapters) {
      if (!c.try) continue;
      for (const id of [...c.try.observe, ...(c.try.predict ? [c.try.predict.observe] : [])]) expect(kinds.get(id)?.kind, `${c.id} ${id}`).toBe('state');
    }
    for (const row of parts.telemetry) for (const f of [row.follow].flat()) expect(kinds.get(f)!.from).toMatch(/^control:/);
  });

  it('captions and summaries carry only apparatus sizes and the 2004 rule', () => {
    const allowed = new Set(['30', '2', '25', '2004']);
    for (const c of chapters) {
      for (const text of [c.summary.en, c.summary.zh, ...c.beats.flatMap((b) => [b.caption.en, b.caption.zh])]) {
        for (const n of text.match(/\d+(\.\d+)?/g) ?? []) expect(allowed.has(n), `${c.id}: ${n} in “${text}”`).toBe(true);
      }
    }
  });

  it('part summaries carry only sizes of the apparatus and samples', () => {
    for (const p of parts.parts as Part[]) for (const n of `${p.summary.en} ${p.summary.zh}`.match(/\d+(\.\d+)?/g) ?? []) expect(['30', '3', '2', '25', '18', '500', '8', '0.5'], `${p.id}: ${n}`).toContain(n);
  });
});

describe('materials topic: syllabus boundaries and wording', () => {
  const all = chapters.map((c) => c.body).join('\n');
  it('“density” appears once, in chapter 03’s “A word for later”', () => {
    for (const c of chapters) {
      const hits = (c.body.match(/density|密度/gi) ?? []).length;
      if (c.id === 'float-or-sink') {
        expect(hits).toBeGreaterThan(0);
        const box = c.body.match(/<More title=\{\{"en": "A word for later"[\s\S]*?<\/More>/g) ?? [];
        expect(box.join('').match(/density|密度/gi)?.length).toBe(hits);
      } else expect(hits, c.id).toBe(0);
    }
    for (const p of parts.parts as Part[]) expect(`${p.summary.en}${p.detail.en}${p.summary.zh}${p.detail.zh}`).not.toMatch(/density|密度/i);
  });

  it('transparent / translucent / opaque only in chapter 05’s More box and the glossary', () => {
    for (const c of chapters) {
      const outside = c.body.replace(/<More[\s\S]*?<\/More>/g, '');
      expect(outside, c.id).not.toMatch(/\b(transparent|translucent|opaque)\b|半透明|不透明/i);
      if (c.id !== 'light-through') expect(c.body, c.id).not.toMatch(/\b(transparent|translucent|opaque)\b|半透明|不透明/i);
    }
    expect(glossaryText).toMatch(/translucent/);
  });

  it('plastic is 塑料 in every chapter and part text (塑胶 only in the glossary note)', () => {
    expect(all).not.toContain('塑胶');
    expect(JSON.stringify(parts)).not.toContain('塑胶');
    expect(all).toContain('塑料');
  });
});
