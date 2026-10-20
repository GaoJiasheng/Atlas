/**
 * The published `states-of-matter` topic (docs/36): every simulated number its
 * captions and chapter bodies state is what the matter model gives for that
 * beat's settings; each liquid is drawn inside its vessel; the wording rules
 * (docs/36 D3, D5) and the content fixes from the engine review hold.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse as parseYaml } from 'yaml';
import { evaluateSim } from '../../src/engines/space-scene/lib/sim';
import { resolveSimValues } from '../../src/engines/space-scene/lib/sim/controls';
import { capacity, fillShapeForPrimitive } from '../../src/engines/space-scene/lib/fill';
import { simSchema, type SimData } from '../../src/engines/space-scene/sim-schema';
import type { MatterPart } from '../../src/engines/space-scene/matter-schema';

const DIR = join(import.meta.dirname, '../../src/content/topics/states-of-matter');
const file = JSON.parse(readFileSync(join(DIR, 'data/parts.json'), 'utf8'));
const sim: SimData = simSchema.parse(file.sim);
const parts: MatterPart[] = file.parts;
const part = (id: string) => file.parts.find((p: { id: string }) => p.id === id);

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

const evaluate = (set: Record<string, unknown>) => evaluateSim(sim, resolveSimValues(sim, set), [], undefined, parts) as unknown as Record<string, unknown>;
/** The model's outputs for a beat: chapter `set` with the beat's `set` on top (as the stage does). */
const outputsAt = (ch: string, beat: number) => {
  const c = chapter(ch);
  return evaluate({ ...c.set, ...(c.beats[beat - 1]!.sim?.set ?? {}) });
};

/** [chapter, beat (1-based), output, decimals, shown value, English words, Chinese words] */
const BEAT_NUMBERS: [string, number, string, number, string, string, string][] = [
  ['mass-and-space', 1, 'mass', 1, '66.3', 'sixty-six point three grams', '六十六点三克'],
  ['mass-and-space', 2, 'mass', 1, '11.5', 'eleven point five grams', '十一点五克'],
  ['mass-and-space', 4, 'mass', 1, '199.4', 'one hundred and ninety-nine point four grams', '一百九十九点四克'],
  ['solids', 1, 'reading', 0, '100', 'one hundred millilitres', '一百毫升'],
  ['solids', 2, 'reading', 0, '125', 'one hundred and twenty-five millilitres', '一百二十五毫升'],
  ['solids', 2, 'object-volume', 1, '25.0', 'twenty-five cubic centimetres', '二十五立方厘米'],
  ['solids', 3, 'reading', 0, '120', 'one hundred and twenty', '一百二十毫升'],
  ['liquids', 1, 'level', 1, '18.6', 'eighteen point six centimetres', '十八点六厘米'],
  ['liquids', 2, 'level', 1, '7.1', 'seven point one centimetres', '七点一厘米'],
  ['liquids', 3, 'level', 1, '5.0', 'five centimetres', '五厘米'],
  ['liquids', 4, 'level', 1, '3.0', 'three centimetres', '三厘米'],
  ['liquids', 5, 'poured', 0, '200', 'two hundred millilitres', '两百毫升'],
  ['air-is-matter', 2, 'basin-rise', 0, '9', 'nine millimetres', '九毫米'],
  ['air-is-matter', 4, 'ball-mass', 1, '600.0', 'six hundred grams', '六百克'],
  ['air-is-matter', 5, 'ball-mass', 1, '604.7', 'six hundred and four point seven grams', '六百零四点七克'],
  ['gases', 1, 'v-air', 1, '20.0', 'twenty millilitres', '二十毫升'],
  ['gases', 3, 'v-air', 1, '12.4', 'twelve point four millilitres', '十二点四毫升'],
  ['gases', 3, 'v-water', 1, '20.0', 'stay at twenty', '还是二十毫升'],
  ['gases', 3, 'v-sand', 1, '20.0', 'stay at twenty', '还是二十毫升'],
  ['gases', 4, 'v-air', 0, '9', 'nine millilitres', '九毫升'],
  ['gases', 5, 'v-air', 1, '20.0', 'twenty millilitres', '二十毫升'],
  ['sorting-matter', 1, 'sand-reading', 0, '100', 'one hundred millilitres of dry sand', '一百毫升干沙'],
  ['sorting-matter', 2, 'sand-reading', 0, '100', 'stays at one hundred millilitres', '还是一百毫升'],
  ['sorting-matter', 3, 'sand-reading', 0, '165', 'one hundred and sixty-five millilitres', '一百六十五毫升'],
];

/** States the captions name. */
const BEAT_STATES: [string, number, string, string][] = [
  ['air-is-matter', 2, 'tissue', 'dry'],
  ['air-is-matter', 2, 'cup-bubbles', 'none'],
  ['air-is-matter', 3, 'tissue', 'wet'],
  ['air-is-matter', 3, 'cup-bubbles', 'rising'],
  ['air-is-matter', 4, 'firmness', 'flat'],
  ['air-is-matter', 5, 'firmness', 'firm'],
  ['sorting-matter', 2, 'sand-bubbles', 'rising'],
  ['sorting-matter', 3, 'sand-bubbles', 'none'],
  ['sorting-matter', 3, 'vs-sum', 'less'],
];

describe('states-of-matter topic: captions say what the model gives', () => {
  it.each(BEAT_NUMBERS)('%s beat %i: %s = %s', (ch, beat, output, decimals, value, en, zh) => {
    expect((outputsAt(ch, beat)[output] as number).toFixed(decimals)).toBe(value);
    const caption = chapter(ch).beats[beat - 1]!.caption;
    expect(caption.en).toContain(en);
    expect(caption.zh).toContain(zh);
  });

  it.each(BEAT_STATES)('%s beat %i: %s is %s', (ch, beat, output, state) => {
    expect(outputsAt(ch, beat)[output]).toBe(state);
  });

  it('the cup with its air trapped and with a hole: 14.9 cm and 14.1 cm, 1.0 mm inside, 1.3 mm after venting', () => {
    const sealed = outputsAt('air-is-matter', 2);
    const vented = outputsAt('air-is-matter', 3);
    expect((sealed['basin-level'] as number).toFixed(1)).toBe('14.9');
    expect((sealed['basin-rise'] as number).toFixed(1)).toBe('8.9');
    expect((sealed['cup-rise'] as number).toFixed(1)).toBe('1.0');
    expect((vented['basin-level'] as number).toFixed(1)).toBe('14.1');
    expect((vented['basin-rise'] as number).toFixed(1)).toBe('1.3');
  });

  it('the marble shows its displaced volume to one decimal, 2.1 cm³, and reads 102 ml', () => {
    const out = evaluate({ 'drop-object': 'marble' });
    expect((out['object-volume'] as number).toFixed(1)).toBe('2.1');
    expect((out.reading as number).toFixed(0)).toBe('102');
    expect(sim.outputs.find((o) => o.id === 'object-volume')!.decimals).toBe(1);
  });
});

/** Design values (S1) the bodies state that are inputs, not outputs, of the model. */
const DESIGN = new Set([
  '15 times', '15 倍', '40 times', '40 倍', '384 cm³', '25 cm³', '20 cm³', '11.5 g', '100 ml', '200 ml', '20 ml', '2 kg', '4 kg', '20',
  '0.236 g', '9 × 7 × 3 m', '220 kg', '33°', '1 mm', '9 mm', '0.1 ml',
]);

describe('states-of-matter topic: every S1 number in the chapter bodies is the model or the design', () => {
  const grid: Record<string, unknown>[] = [];
  for (const w of ['stone', 'sponge', 'marble', 'clay', 'water']) grid.push({ 'weigh-object': w });
  for (const d of ['nothing', 'stone', 'marble', 'clay-ball', 'clay-roll']) grid.push({ 'drop-object': d });
  for (const c of ['cylinder', 'glass', 'flask', 'bowl']) grid.push({ container: c });
  for (const pumps of [0, 5, 10, 15, 20]) grid.push({ pumps });
  for (const place of ['above', 'pushed']) for (const hole of [false, true]) grid.push({ 'cup-place': place, 'cup-hole': hole });
  for (const load of [0, 1, 2, 3, 4]) grid.push({ load });
  for (const w of [0, 20, 40, 60, 80, 100]) grid.push({ 'water-added': w });
  const modelled = new Set<string>();
  for (const set of grid) {
    const out = evaluate(set);
    for (const o of sim.outputs) {
      const v = out[o.id];
      if (typeof v !== 'number' || !o.unit) continue;
      for (const d of new Set([o.decimals ?? 0, 0])) modelled.add(`${v.toFixed(d)} ${o.unit}`);
    }
  }

  it.each(chapters.map((c) => [c.id, c.body] as const))('%s', (_id, body) => {
    const nums = [...body.matchAll(/<Num s="S1">([^<]+)<\/Num>/g)].map((m) => m[1]!);
    for (const n of nums) expect(modelled.has(n) || DESIGN.has(n), n).toBe(true);
  });
});

/** The main line: chapter bodies without their <More> boxes, and the captions. */
const mainLine = (c: Chapter) => c.body.replace(/<More[\s\S]*?<\/More>/g, '') + c.beats.map((b) => `${b.caption.en}\n${b.caption.zh}`).join('\n');
const everything = chapters.map((c) => c.body + c.beats.map((b) => `${b.caption.en}\n${b.caption.zh}`).join('\n')).join('\n');

describe('states-of-matter topic: wording rules (docs/36 D3, D5)', () => {
  it('particles stay out of the main line, in one box beyond the syllabus', () => {
    for (const c of chapters) expect(mainLine(c)).not.toMatch(/particle|微粒/i);
    const box = [...chapter('sorting-matter').body.matchAll(/<More title=\{\{"en": "Look closer \(beyond the syllabus\)"[\s\S]*?<\/More>/g)].map((m) => m[0]).join('\n');
    expect(box).toContain("the primary syllabus doesn't cover it; you'll learn it in secondary school");
    expect(box).toContain('小学课纲没有讲，中学会学');
  });

  it('never "not required" for particles, compression or displacement; water is much harder to squash; air stops the cup filling', () => {
    expect(everything).not.toMatch(/not required|不要求/);
    expect(everything).not.toMatch(/incompressible|cannot be (compressed|squashed)|can't be squashed|完全不能压缩|不能被压缩/i);
    expect(everything).not.toMatch(/no water (gets|can get) in|水一点都进不去/i);
    expect(chapter('gases').body).toContain('Water is much harder to squash');
    expect(chapter('air-is-matter').body).toContain('the air stops the cup filling');
    expect(chapter('gases').body).toContain("The primary syllabus doesn't cover compression; you'll learn it in secondary school");
    expect(chapter('solids').body).toContain("The primary syllabus doesn't cover the method by name; you'll learn it in secondary school");
  });

  it('the Chinese uses the syllabus terms and only Chinese quotation marks; no grade labels anywhere', () => {
    const zh = chapters.map((c) => [...c.body.matchAll(/<Lang zh>([\s\S]*?)<\/Lang>/g)].map((m) => m[1]).join('')).join('');
    expect(zh).toContain('固定的形状');
    expect(zh).toContain('固定的体积');
    expect(zh).not.toMatch(/[「」『』]/);
    for (const line of zh.split('\n')) expect(line.replace(/<[^>]*>/g, ''), line).not.toMatch(/"/);
    expect(everything).not.toMatch(/\bP[3-6]\b|Primary [3-6]|小[三四五六]|Foundation/);
  });
});

describe('states-of-matter topic: content fixes from the engine review', () => {
  const lum = (hex: string) => {
    const n = parseInt(hex.slice(1), 16);
    return 0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255);
  };

  it('wet sand and the wet tissue tint towards a fixed darker colour (not a theme token), in both themes', () => {
    for (const [id, output] of [['sand-in-cylinder', 'wet'], ['tissue', 'tissue-wet']] as const) {
      const b = file.sim.bind.find((x: { part?: string; output?: string }) => x.part === id && x.output === output);
      expect(b.tint.color).toMatch(/^#[0-9a-f]{6}$/i);
      expect(lum(b.tint.color)).toBeLessThan(lum(part(id).primitive.tint) * 0.6);
    }
  });

  it('the sealed cup shows a trapped-air pocket; it is hidden once the hole lets the water in', () => {
    const vis = file.sim.bind.filter((x: { part?: string; visible?: unknown }) => x.part === 'trapped-air' && x.visible);
    expect(vis.map((x: { control: string; visible: unknown }) => [x.control, x.visible])).toEqual([['cup-place', { eq: 'pushed' }], ['cup-hole', { eq: false }]]);
    expect(file.views.cuts['basin-section']).toBeDefined();
    const sealed = chapter('air-is-matter').beats[1]!;
    expect(sealed).toMatchObject({ cutaway: 'basin-section' });
  });

  it('the clay roll is the same 20 cm³ as the clay ball (capsule middle section + two half balls)', () => {
    const [r, mid] = part('drop-clay-roll').primitive.size as [number, number];
    expect((Math.PI * r * r * mid + (4 / 3) * Math.PI * r ** 3) * 1e6).toBeCloseTo(20, 2);
    expect(((4 / 3) * Math.PI * part('drop-clay-ball').primitive.size[0] ** 3) * 1e6).toBeCloseTo(20, 2);
  });

  it('the inflated ball keeps clear of the pump handle and is 75 cm round', () => {
    const ball = part('basketball').primitive;
    expect(2 * Math.PI * ball.size[0]).toBeCloseTo(0.75, 4);
    const pump = part('ball-pump');
    for (const p of [pump.primitive, ...pump.extra.filter((e: { kind: string }) => e.kind !== 'tube')]) {
      const d = Math.hypot(p.at[0] - ball.at[0], p.at[1] - ball.at[1], p.at[2] - ball.at[2]);
      expect(d).toBeGreaterThan(ball.size[0] + 0.03);
    }
  });

  it('the unopened can shows no bubbles in the drink (gas only above it)', () => {
    expect(part('can-drink').extra).toBeUndefined();
  });
});

describe('states-of-matter topic: liquids are drawn inside their vessels', () => {
  const PAIRS: [string, string][] = [
    ['cyl-a-water', 'cylinder-a'], ['glass-water', 'tall-glass'], ['flask-water', 'flask'], ['bowl-water', 'bowl'],
    ['cyl-b-water', 'cylinder-b'], ['basin-water', 'basin'], ['basin-water-cup', 'basin'], ['cup-water', 'cup'],
    ['water-over-sand', 'cylinder-c'], ['jug-water', 'pour-cup'],
  ];
  it.each(PAIRS)('%s sits on the axis of %s and is no wider than its inside', (liquidId, vesselId) => {
    const l = part(liquidId).primitive;
    const v = part(vesselId).primitive;
    expect(l.at[0]).toBeCloseTo(v.at[0], 6);
    expect(l.at[2]).toBeCloseTo(v.at[2], 6);
    const rl = Math.max(...l.profile.map(([r]: [number, number]) => r));
    const inner = v.profile.map(([r]: [number, number]) => r).filter((r: number) => r >= rl - 1e-6);
    expect(Math.min(...inner)).toBeCloseTo(rl, 4);
  });

  it('every liquid can hold the most the model gives it', () => {
    const most: Record<string, number> = { 'cyl-a-water': 200, 'glass-water': 200, 'flask-water': 200, 'bowl-water': 200, 'cyl-b-water': 125, 'cup-water': 346.3, 'water-over-sand': 165, 'jug-water': 100 };
    for (const [id, ml] of Object.entries(most)) expect(capacity(fillShapeForPrimitive(part(id).primitive)!) * 1e6).toBeGreaterThanOrEqual(ml);
  });

  it('the model uses the drawn sizes: basin, cup and syringe bore', () => {
    const m = file.sim.matter;
    expect(m.cup.basin.radius / 100).toBeCloseTo(Math.max(...part('basin-water').primitive.profile.map(([r]: [number, number]) => r)), 6);
    expect(m.cup.cup.radius / 100).toBeCloseTo(Math.max(...part('cup-water').primitive.profile.map(([r]: [number, number]) => r)), 6);
    expect(m.squeeze.bore / 200).toBeCloseTo(0.01, 6);
  });
});
