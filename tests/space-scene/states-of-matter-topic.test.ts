/**
 * The published `states-of-matter` topic (docs/36): every simulated number its
 * captions and chapter bodies state is what the matter model gives for that
 * beat's settings; each liquid is drawn inside its vessel; the wording rules
 * (docs/36 D3, D5) and the content fixes from the engine review hold.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { NodeIO, type Primitive as GltfPrimitive } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dequantize } from '@gltf-transform/functions';
import { MeshoptDecoder } from 'meshoptimizer';
import { Vector3, Matrix4, Matrix3, Box3, Triangle, Euler, Mesh, MeshStandardMaterial } from 'three';
import { parseShippingGLB } from '../../scripts/geo/states-of-matter/node-gltf';
import { partsFile } from '../../src/engines/space-scene/schema';
import { partPieces } from '../../src/engines/space-scene/stages/model3d/geometry';
import { gltfSurface } from '../../src/engines/space-scene/stages/model3d/GltfSource';
import { describe, expect, it } from 'vitest';
import { parse as parseYaml } from 'yaml';
import { evaluateSim } from '../../src/engines/space-scene/lib/sim';
import { resolveSimValues } from '../../src/engines/space-scene/lib/sim/controls';
import { simEffects } from '../../src/engines/space-scene/lib/sim/bind';
import { capacity, fillShapeForPrimitive } from '../../src/engines/space-scene/lib/fill';
import { simSchema, type SimData } from '../../src/engines/space-scene/sim-schema';
import type { MatterPart } from '../../src/engines/space-scene/matter-schema';

const DIR = join(import.meta.dirname, '../../src/content/topics/states-of-matter');
const file = JSON.parse(readFileSync(join(DIR, 'data/parts.json'), 'utf8'));
const sim: SimData = simSchema.parse(file.sim);
const parts: MatterPart[] = file.parts;
const part = (id: string) => file.parts.find((p: { id: string }) => p.id === id);
const round1 = JSON.parse(readFileSync(join(import.meta.dirname, '../../scripts/geo/states-of-matter/evidence/round1-parts.json'), 'utf8'));
const parsedRound1 = partsFile.parse(round1);
const bakedStatic = ['balance-a', 'balance-b', 'beam-balance', 'syringe-rack', 'plunger-air', 'plunger-water', 'plunger-sand', 'sand-heap', 'sugar-heap', 'balance-stand'];

interface Beat {
  pose?: string;
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

const decoded = (async () => {
  await MeshoptDecoder.ready;
  const doc = await new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder }).read(join(import.meta.dirname, '../../public/models/states-of-matter.glb'));
  await doc.transform(dequantize());
  return doc;
})();
async function meshVertices(id: string) {
  const doc = await decoded, node = doc.getRoot().listNodes().find(n => n.getName() === id)!;
  const primitive = node.getMesh()!.listPrimitives()[0]!, positions = primitive.getAttribute('POSITION')!, matrix = new Matrix4().fromArray(node.getWorldMatrix());
  const vertices = Array.from({ length: positions.getCount() }, (_, i) => new Vector3().fromArray(positions.getElement(i, [0, 0, 0])).applyMatrix4(matrix).toArray());
  const normalMatrix = new Matrix3().getNormalMatrix(matrix), normals = Array.from({ length: positions.getCount() }, (_, i) => new Vector3().fromArray(primitive.getAttribute('NORMAL')!.getElement(i, [0, 0, 0])).applyMatrix3(normalMatrix).normalize());
  return { node, primitive, vertices, normals };
}

/** Connectivity is recovered from the decoded indices, not from build labels. */
function connected(primitive: GltfPrimitive, accept: (i: number) => boolean = () => true, joinCoincident = false): number[][] {
  const n = primitive.getAttribute('POSITION')!.getCount(), parent = Array.from({ length: n }, (_, i) => i), active = new Set<number>(), ix = primitive.getIndices()!;
  const find = (start: number) => { let i = start; while (parent[i] !== i) { parent[i] = parent[parent[i]!]!; i = parent[i]!; } return i; };
  if (joinCoincident) {
    // Rounded shells and double-sided crack films may split coincident vertices
    // to retain different face normals. Recover physical connectivity as well.
    const positions = primitive.getAttribute('POSITION')!, seen = new Map<string, number>();
    for (let i = 0; i < n; i++) if (accept(i)) {
      const key = positions.getElement(i, [0, 0, 0]).map(x => Math.round(x * 1e7)).join(',');
      const other = seen.get(key); if (other !== undefined) parent[find(i)] = find(other); else seen.set(key, i);
    }
  }
  for (let j = 0; j < ix.getCount(); j += 3) {
    const ids = [0, 1, 2].map(k => ix.getScalar(j + k));
    for (let k = 0; k < 3; k++) { const a = ids[k]!, b = ids[(k + 1) % 3]!; if (accept(a) && accept(b)) { parent[find(a)] = find(b); active.add(a); active.add(b); } }
  }
  const out = new Map<number, number[]>();
  for (const i of active) { const k = find(i); if (!out.has(k)) out.set(k, []); out.get(k)!.push(i); }
  return [...out.values()];
}

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
  it('the beam comparison and squeezed sponge use beat poses without scene-only controls', () => {
    expect(sim.controls.map((c) => c.id)).not.toContain('beam');
    expect(sim.controls.map((c) => c.id)).not.toContain('squeeze');
    const beam = chapter('mass-and-space').beats[2]!;
    const squeezed = chapter('solids').beats[3]!;
    expect(beam.pose).toBe('beam-tilt');
    expect(squeezed.pose).toBe('sponge-squeezed');
    for (const [c, beat, ids] of [
      [chapter('mass-and-space'), beam, ['beam-balance', 'stone', 'sponge']],
      [chapter('solids'), squeezed, ['sponge']],
    ] as const) {
      const values = resolveSimValues(sim, { ...c.set, ...beat.sim?.set });
      const effects = simEffects(sim, values, evaluateSim(sim, values, [], undefined, parts));
      for (const id of ids) {
        expect(effects.poses.has(id), `${c.id}: ${id} must keep its beat pose`).toBe(false);
        expect(file.poses[beat.pose!][id]).toBeDefined();
      }
    }
    expect(file.poses['beam-tilt']['beam-balance'].rotation).toEqual([0, 0, -6]);
    expect(file.poses['sponge-squeezed'].sponge.scale).toEqual([1.06, 0.45, 1.04]);
  });

  it('weighing one object leaves the other four available to chapter poses', () => {
    for (const [value, id] of [['stone', 'stone'], ['sponge', 'sponge'], ['marble', 'marble'], ['clay', 'clay-ball'], ['water', 'water-beaker']]) {
      const values = resolveSimValues(sim, { 'weigh-object': value });
      const effects = simEffects(sim, values, evaluateSim(sim, values, [], undefined, parts));
      for (const other of ['stone', 'sponge', 'marble', 'clay-ball', 'water-beaker']) {
        expect(effects.poses.has(other), `${value}: ${other}`).toBe(other === id);
      }
    }
  });

  it('basin cuts leave both wooden support surfaces intact', () => {
    expect(part('bench').clip).toBe(false);
    expect(part('side-table').clip).toBe(false);
    expect(part('basin').clip).not.toBe(false);
  });

  const lum = (hex: string) => {
    const n = parseInt(hex.slice(1), 16);
    return 0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255);
  };

  it('wet sand and the wet tissue tint towards a fixed darker colour (not a theme token), in both themes', () => {
    for (const [id, output] of [['sand-in-cylinder', 'wet'], ['tissue', 'tissue-wet']] as const) {
      const b = file.sim.bind.find((x: { part?: string; output?: string }) => x.part === id && x.output === output);
      expect(b.tint.color).toMatch(/^#[0-9a-f]{6}$/i);
      expect(lum(b.tint.color)).toBeLessThan(lum(part(id).primitive?.tint ?? part(id).material.tint) * 0.6);
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

  it('the inflated ball remains 75 cm round, and the pump barrel clears it', async () => {
    const ball = await meshVertices('basketball');
    const centre = ball.node.getTranslation();
    const surface = ball.vertices.map(v => Math.hypot(v[0]! - centre[0]!, v[1]! - centre[1]!, v[2]! - centre[2]!));
    // The moulded grain projects 0.18 mm above the unchanged 75 cm carcass.
    expect(2 * Math.PI * Math.max(...surface)).toBeCloseTo(0.75113, 2);
    const pump = await meshVertices('ball-pump');
    const barrel = pump.vertices.filter(v => v[0]! >= .08 && v[0]! <= .28 && Math.abs(v[2]! + .04) < .017);
    expect(barrel.length).toBeGreaterThan(100);
    for (const v of barrel) expect(Math.hypot(v[0]! - centre[0]!, v[1]! - centre[1]!, v[2]! - centre[2]!)).toBeGreaterThan(.75 / (2 * Math.PI) + .03);
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

describe('states-of-matter shipping rebuild', () => {
  it('ships every replacement as a single selectable mesh with the engine source-material opt-in', async () => {
    const doc = await decoded;
    const replaced = file.parts.filter((p: { mesh?: string }) => p.mesh);
    expect(replaced.map((p: { id: string }) => p.id).sort()).toEqual([
      'bicycle-wheel', 'floor-pump', 'ball-pump', 'balloon-pump', 'basketball', 'balloon-round', 'balloon-long',
      'torch', 'bench', 'side-table', 'sand-grains', 'sponge', 'tissue', 'ice-cube', ...bakedStatic,
    ].sort());
    for (const p of replaced) {
      const mesh = doc.getRoot().listNodes().find(n => n.getName() === p.mesh)!.getMesh()!;
      expect(mesh.listPrimitives()).toHaveLength(1);
      const primitive = mesh.listPrimitives()[0]!;
      expect(primitive.getMaterial()!.getExtras().atlasSurface).toBe(true);
      expect(primitive.getAttribute('NORMAL')).toBeTruthy();
      expect(primitive.getAttribute('COLOR_0')).toBeTruthy();
    }
    expect(readFileSync(join(import.meta.dirname, '../../public/models/states-of-matter.glb')).byteLength).toBeLessThanOrEqual(1_500_000);
  });

  it('has 36 real spoke wires and eight separated basketball panel surfaces', async () => {
    const wheel = await meshVertices('bicycle-wheel');
    const spokes = connected(wheel.primitive).filter(c => {
      const radii = c.map(i => Math.hypot(wheel.vertices[i]![0]! + 1.45, wheel.vertices[i]![1]! - .345));
      return c.length > 20 && Math.min(...radii) < .025 && Math.max(...radii) > .25 && Math.max(...radii) < .28;
    });
    expect(spokes).toHaveLength(36);
    const ball = await meshVertices('basketball'), colors = ball.primitive.getAttribute('COLOR_0')!;
    const panels = connected(ball.primitive, i => colors.getElement(i, [0, 0, 0])[0]! > .14).filter(c => c.length > 40 && new Box3().setFromPoints(c.map(i => new Vector3(...ball.vertices[i]! as [number, number, number]))).getSize(new Vector3()).length() > .05);
    expect(panels).toHaveLength(8);
  });

  it('keeps the renderer flow paths inside the decoded hose surfaces', async () => {
    for (const [id, flow, start, end, tolerance] of [
      ['ball-pump', file.flows.find((f: { id: string }) => f.id === 'pumped-air').paths.find((p: { id: string }) => p.id === 'ball').path, 3, 33, .0053],
      ['floor-pump', file.flows.find((f: { id: string }) => f.id === 'tyre-air').path, 4, 34, .0065],
    ] as const) {
      const mesh = await meshVertices(id);
      const hose = connected(mesh.primitive).find(c => {
        const size = new Box3().setFromPoints(c.map(i => new Vector3(...mesh.vertices[i]! as [number, number, number]))).getSize(new Vector3());
        return c.length > 100 && size.x > .06 && size.y > .05 && size.z > .03;
      });
      expect(hose, id).toBeDefined();
      const members = new Set(hose!), indices = mesh.primitive.getIndices()!, triangles: { shape: Triangle; ids: number[] }[] = [];
      for (let j = 0; j < indices.getCount(); j += 3) {
        const ids = [0, 1, 2].map(k => indices.getScalar(j + k));
        if (ids.every(i => members.has(i))) triangles.push({ shape: new Triangle(...ids.map(i => new Vector3(...mesh.vertices[i]! as [number, number, number])) as [Vector3, Vector3, Vector3]), ids });
      }
      for (const p of flow.slice(start, end + 1) as [number, number, number][]) {
        const point = new Vector3(...p); let distance = Infinity, signed = Infinity;
        for (const { shape, ids } of triangles) {
          const closest = shape.closestPointToPoint(point, new Vector3()), d = point.distanceToSquared(closest);
          if (d < distance) {
            distance = d; const bary = shape.getBarycoord(closest, new Vector3())!, normal = new Vector3();
            for (let k = 0; k < 3; k++) normal.addScaledVector(mesh.normals[ids[k]!]!, bary.getComponent(k));
            signed = point.clone().sub(closest).dot(normal.normalize());
          }
        }
        expect(Math.sqrt(distance), `${id} flow ${p}`).toBeLessThan(tolerance);
        expect(signed, `${id}: stream must be inside the decoded wall triangles`).toBeLessThan(.0003);
      }

    }
  });

  it('seats the round neck on the actual nozzle throughout inflation and ends its air stream inside both poses', async () => {
    const balloon = await meshVertices('balloon-round'), pump = await meshVertices('balloon-pump'), pose = file.poses['balloons-full']['balloon-round'];
    const bottom = Math.min(...balloon.vertices.map(p => p[1]!));
    const mouth = balloon.vertices.filter(p => Math.abs(p[1]! - bottom) < .00002);
    const radius = (p: number[]) => Math.hypot(p[0]! - .36, p[2]! + .26);
    const mouthMin = Math.min(...mouth.map(radius));
    const nozzleAt = (y: number) => Math.max(...pump.vertices.filter(p => Math.abs(p[1]! - y) < .00003 && radius(p) < .006).map(radius));
    const small = nozzleAt(.160), large = nozzleAt(.152);
    expect(small).toBeGreaterThan(.001); expect(large).toBeGreaterThan(.0035);
    for (let i = 0; i <= 10; i++) {
      const t = i / 10, scaledMouth = mouthMin * (1 + (pose.scale[0] - 1) * t), nozzle = small + (large - small) * t;
      expect(scaledMouth - nozzle, `neck clearance at ${t}`).toBeGreaterThan(-.00003);
      expect(scaledMouth - nozzle, `neck remains seated at ${t}`).toBeLessThan(.0004);
    }
    const air = file.flows.find((f: { id: string }) => f.id === 'pumped-air').paths.find((p: { id: string }) => p.id === 'balloon').path.at(-1);
    const top = Math.max(...balloon.vertices.map(p => p[1]!));
    expect(air[1]).toBeGreaterThan(bottom + .005); expect(air[1]).toBeLessThan(top - .005);
  });

  it('retains the six straight hanger centrelines and radii recorded before baking the balance into one draw', () => {
    const old = JSON.parse(readFileSync(join(import.meta.dirname, '../../scripts/geo/states-of-matter/evidence/before-parts.json'), 'utf8')).parts.find((p: { id: string }) => p.id === 'beam-balance');
    // The round-1 native record defines the original dimensions. The separate
    // decoded-triangle test below proves the shipping bake retained that shape.
    const current = round1.parts.find((p: { id: string }) => p.id === 'beam-balance'), wires = current.extra.filter((p: { kind: string }) => p.kind === 'cylinder'), oldWires = old.extra.filter((p: { kind: string }) => p.kind === 'tube');
    expect(wires).toHaveLength(6);
    for (let i = 0; i < 6; i++) {
      const a = oldWires[i], b = wires[i], rotation = new Euler(...b.rotation.map((x: number) => x * Math.PI / 180) as [number, number, number]);
      const targets = a.path.map((p: [number, number, number]) => new Vector3(...p).add(new Vector3(...a.at as [number, number, number])));
      for (const sign of [-1, 1]) {
        const endpoint = new Vector3(0, sign * b.size[2] / 2, 0).applyEuler(rotation).add(new Vector3(...b.at as [number, number, number]));
        expect(Math.min(...targets.map((p: Vector3) => p.distanceTo(endpoint)))).toBeLessThan(.000001);
      }
      expect(b.size[0]).toBe(a.radius); expect(b.color).toBe(a.color);
    }
    expect({ ...current, extra: current.extra.filter((p: { kind: string }) => p.kind !== 'cylinder') }).toEqual({ ...old, extra: old.extra.filter((p: { kind: string }) => p.kind !== 'tube') });
  });

  it('passes source colour, vertex grain and finish through the production GLTFLoader and material hook', async () => {
    await MeshoptDecoder.ready;
    const bytes = readFileSync(join(import.meta.dirname, '../../public/models/states-of-matter.glb'));
    const loaded = await parseShippingGLB(new Uint8Array(bytes));
    for (const id of file.parts.filter((p: { mesh?: string }) => p.mesh).map((p: { id: string }) => p.id)) {
      const mesh = loaded.scene.getObjectByName(id) as Mesh, source = mesh.material as MeshStandardMaterial, target = new MeshStandardMaterial({ color: '#ffffff' });
      const surface = gltfSurface(mesh)!; expect(surface, id).toBeDefined(); surface.style(target); surface.fade(target, 1, false);
      expect(target.color.toArray()).toEqual(source.color.toArray()); expect(target.roughness).toBe(source.roughness); expect(target.metalness).toBe(source.metalness);
      expect(target.vertexColors).toBe(true); expect(target.transparent, id).toBe(id === 'ice-cube');
      if (id === 'sponge') { expect(target.roughness).toBeGreaterThan(.9); expect(target.color.r).toBeLessThan(.6); expect(target.map).toBe(source.map); expect(target.map).toBeTruthy(); expect(target.map!.image.width).toBe(64); expect(mesh.geometry.getAttribute('uv').itemSize).toBe(2); expect(target.map!.repeat.x).toBeGreaterThan(4); }
      target.dispose();
    }
  });

  it('delivers clear ice shells, bubbles, crack films and a dish through one RGBA source mesh', async () => {
    const ice = part('ice-cube'), { node, primitive } = await meshVertices('ice-cube');
    expect(ice.mesh).toBe('ice-cube'); expect(ice.primitive).toBeUndefined(); expect(ice.extra).toBeUndefined();
    // Multiple glTF primitives become separate Mesh children; GltfSource only
    // uses the first child. One primitive proves all four regions reach it.
    expect(node.getMesh()!.listPrimitives()).toHaveLength(1);
    const rgba = primitive.getAttribute('COLOR_0')!, material = primitive.getMaterial()!;
    expect(rgba.getType()).toBe('VEC4'); expect(material.getAlphaMode()).toBe('BLEND');
    expect(material.getRoughnessFactor()).toBeCloseTo(.04, 6);
    const alphas = Array.from({ length: rgba.getCount() }, (_, i) => rgba.getElement(i, [0, 0, 0, 0])[3]!);
    expect(alphas.every(a => a >= 0 && a <= 1)).toBe(true);
    // Test the decoded shipping attribute, including its actual face/edge
    // ramp. The old constant .12 shell passed a source-only gate but vanished.
    const islands = connected(primitive, () => true, true);
    const shells = islands.filter(c => Math.min(...c.map(i => alphas[i]!)) > .20 && Math.min(...c.map(i => alphas[i]!)) < .24 && Math.max(...c.map(i => alphas[i]!)) > .55);
    expect(shells).toHaveLength(2);
    for (const c of shells) {
      expect(Math.max(...c.map(i => alphas[i]!))).toBeLessThanOrEqual(.66);
      expect(c.filter(i => alphas[i]! < .24).length).toBeGreaterThan(8);
      expect(c.filter(i => alphas[i]! > .55).length).toBeGreaterThan(8);
    }
    const bubbles = islands.filter(c => c.every(i => Math.abs(alphas[i]! - .635) < .006));
    expect(bubbles.length).toBeGreaterThanOrEqual(50);
    const cracks = islands.filter(c => Math.min(...c.map(i => alphas[i]!)) < .07 && Math.max(...c.map(i => alphas[i]!)) > .55);
    expect(cracks.length).toBeGreaterThanOrEqual(6);
    expect(islands.some(c => c.every(i => alphas[i]! > .99))).toBe(true);
    expect(islands.some(c => c.every(i => Math.abs(alphas[i]! - .255) < .008))).toBe(true);

  });

  it('bakes static pieces without changing their decoded triangle surfaces or individual part identities', async () => {
    const tolerance = .00005; // 50 micrometres: below a visible edge at the closest authored camera.
    const cellKey = (p: Vector3) => [p.x, p.y, p.z].map(x => Math.floor(x / tolerance));
    for (const id of bakedStatic) {
      const original = round1.parts.find((p: { id: string }) => p.id === id), source = parsedRound1.parts.find(p => p.id === id)!;
      const pieces = partPieces(source), expected: Vector3[][] = [];
      for (const piece of pieces) for (const matrix of piece.matrices ?? [new Matrix4()]) {
        const geometry = piece.geometry, positions = geometry.getAttribute('position'), indices = geometry.index, count = indices?.count ?? positions.count;
        for (let j = 0; j < count; j += 3) {
          const triangle = [0, 1, 2].map(k => new Vector3().fromBufferAttribute(positions, indices ? indices.getX(j + k) : j + k).applyMatrix4(matrix).add(new Vector3(...source.primitive!.at)));
          // Lathe pole fans contain repeated points. Welding legitimately
          // removes their zero-area faces; they never represented a surface.
          if (new Triangle(...triangle as [Vector3, Vector3, Vector3]).getArea() > 1e-14) expected.push(triangle);
        }
      }
      const actual = await meshVertices(id), indices = actual.primitive.getIndices()!;
      const actualFaces: Vector3[][] = [];
      for (let j = 0; j < indices.getCount(); j += 3) {
        const triangle = [0, 1, 2].map(k => new Vector3(...actual.vertices[indices.getScalar(j + k)]! as [number, number, number]));
        if (new Triangle(...triangle as [Vector3, Vector3, Vector3]).getArea() > 1e-14) actualFaces.push(triangle);
      }
      expect(actualFaces.length, `${id}: nondegenerate triangle count`).toBe(expected.length);
      const buckets = new Map<string, { triangle: Vector3[]; used: boolean }[]>();
      for (const triangle of expected) {
        const centre = triangle.reduce((sum, p) => sum.add(p), new Vector3()).divideScalar(3), key = cellKey(centre).join(',');
        if (!buckets.has(key)) buckets.set(key, []); buckets.get(key)!.push({ triangle, used: false });
      }
      let missing = 0;
      for (const triangle of actualFaces) {
        const centre = triangle.reduce((sum, p) => sum.add(p), new Vector3()).divideScalar(3), key = cellKey(centre);
        let found = false;
        for (let z = -1; z <= 1 && !found; z++) for (let y = -1; y <= 1 && !found; y++) for (let x = -1; x <= 1 && !found; x++) {
          for (const candidate of buckets.get([key[0]! + x, key[1]! + y, key[2]! + z].join(',')) ?? []) {
            if (candidate.used) continue;
            // Cyclic shifts preserve triangle winding while allowing reindexing.
            if ([0, 1, 2].some(shift => triangle.every((p, k) => p.distanceTo(candidate.triangle[(k + shift) % 3]!) <= tolerance))) { candidate.used = true; found = true; break; }
          }
        }
        if (!found) missing++;
      }
      expect(missing, `${id}: changed decoded faces`).toBe(0);
      for (const piece of pieces) piece.geometry.dispose();
      expect(part(id).mesh).toBe(id); expect(part(id).id).toBe(original.id);
      expect(part(id).explode).toEqual(original.explode);
    }
  });

  it('stays within 90 real material draws, 350k triangles and 1.5 MB with every part included', async () => {
    const doc = await decoded; let draws = 0, triangles = 0;
    for (const p of partsFile.parse(file).parts) {
      if (p.mesh) {
        const node = doc.getRoot().listNodes().find(n => n.getName() === p.mesh)!;
        for (const primitive of node.getMesh()!.listPrimitives()) { draws++; triangles += (primitive.getIndices()?.getCount() ?? primitive.getAttribute('POSITION')!.getCount()) / 3; }
      } else {
        const pieces = partPieces(p); draws += pieces.length;
        for (const piece of pieces) { triangles += (piece.geometry.index?.count ?? piece.geometry.getAttribute('position').count) / 3 * (piece.matrices?.length ?? 1); piece.geometry.dispose(); }
      }
    }
    expect(draws).toBeLessThanOrEqual(90); expect(triangles).toBeLessThanOrEqual(350_000);
    expect(readFileSync(join(import.meta.dirname, '../../public/models/states-of-matter.glb')).byteLength).toBeLessThanOrEqual(1_500_000);
  });

  it('both balloon poses retain their neck anchors when the shipping mesh inflates', async () => {
    for (const id of ['balloon-round', 'balloon-long']) {
      const { vertices } = await meshVertices(id), pose = file.poses['balloons-full'][id];
      const box = new Box3().setFromPoints(vertices.map(p => new Vector3(...p as [number, number, number])));
      const transformed = vertices.map(p => p.map((x, i) => pose.pivot[i] + (x - pose.pivot[i]) * pose.scale[i] + (pose.offset?.[i] ?? 0)));
      expect(transformed.every(p => p.every(Number.isFinite))).toBe(true);
      const inflated = new Box3().setFromPoints(transformed.map(p => new Vector3(...p as [number, number, number])));
      expect(inflated.getSize(new Vector3()).length()).toBeGreaterThan(box.getSize(new Vector3()).length() * 2);
      expect(pose.pivot).toEqual(id === 'balloon-round' ? [.36, .16, -.26] : [.41, 0, -.31]);
    }
  });
});
