/** Fossils evidence: captions agree with visible models; ages remain ranges;
 * filtering teaching modules never changes the evidence inventory (docs/46). */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse as parseYaml } from 'yaml';
import { evaluateSim } from '../../src/engines/space-scene/lib/sim';
import { simEffects } from '../../src/engines/space-scene/lib/sim/bind';
import { resolveSimValues } from '../../src/engines/space-scene/lib/sim/controls';
import { simSchema } from '../../src/engines/space-scene/sim-schema';
import { tableSourceIssues } from '../../src/engines/space-scene/table-schema';

const DIR = join(import.meta.dirname, '../../src/content/topics/fossils-and-skeletons');
type Text = { en: string; zh: string };
type Primitive = { kind: string; at: number[]; path?: number[][]; holes?: number[][][] };
type Part = { id: string; group: string; context?: boolean; name: Text; summary: Text; detail: Text; primitive: Primitive; extra?: Primitive[] };
const file = JSON.parse(readFileSync(join(DIR, 'data/parts.json'), 'utf8'));
const parts: Part[] = file.parts;
const sim = simSchema.parse(file.sim);
type Set = Record<string, boolean | number | string>;
type State = { layers: string[]; hide: string[]; labels: string[]; run: boolean; view: string; sim: { set: Set; try?: { vary: string; observe: string[]; record: boolean } }; index: { parts: string[] } };
type Beat = Partial<State> & { caption: Text };
const chapters = readdirSync(join(DIR, 'chapters')).filter((f) => f.endsWith('.mdx')).sort().map((f) => {
  const text = readFileSync(join(DIR, 'chapters', f), 'utf8');
  const [, front, ...body] = text.split(/^---$/m);
  const fm = parseYaml(front!);
  return { id: fm.id as string, state: fm.state as State & { beats: Beat[] }, body: body.join('---') };
});
const chapter = (id: string) => chapters.find((c) => c.id === id)!;
const part = (id: string) => parts.find((p) => p.id === id)!;
const result = (set: Set) => evaluateSim(sim, resolveSimValues(sim, set));
const at = (id: string, beat: number) => {
  const c = chapter(id), b = c.state.beats[beat - 1]!;
  const set = { ...c.state.sim.set, ...b.sim?.set };
  const state = { ...c.state, ...b };
  const hidden = simEffects(sim, resolveSimValues(sim, set), result(set)).hidden;
  const visible = parts.filter((p) => !p.context && state.layers.includes(p.group) && !state.hide.includes(p.id) && !hidden.has(p.id)).map((p) => p.id);
  return { b, state, visible, outputs: result(set) };
};
const DIRECT = ['sk-skull', 'sk-jaw', 'sk-trunk', 'sk-pelvis', 'sk-arm-l', 'sk-leg-l', 'sk-leg-r'];
const COMPARISON = ['sk-neck', 'sk-ribs', 'sk-arm-r'];
const INFERRED = ['sk-tail-base', 'sk-tail-tip'];

// Each caption has a concrete object on show. The second list records an
// absence the caption needs: uncovered leaf, enlarged pores, or filtered tail.
const CAPTIONS: [string, number, string[], string[]][] = [
  ['before-you-start', 1, ['bone-sample', 'track-slab', 'leaf-slab'], ['leaf-lid']],
  ['before-you-start', 2, ['sk-skull', 'sk-pelvis', 'sk-tail-tip'], ['bone-sample']],
  ['before-you-start', 3, ['ash-low', 'fossil-bed', 'ash-high'], ['dated-crystal']],
  ['before-you-start', 4, ['myna-body'], ['prince-study', 'apollonia-study', 'twinky-study']],
  ['body-track-leaf', 1, ['bone-sample', 'leaf-lid'], []],
  ['body-track-leaf', 2, ['track-slab'], []],
  ['body-track-leaf', 3, ['leaf-slab'], ['leaf-lid']],
  ['body-track-leaf', 4, ['bone-sample', 'leaf-slab'], ['leaf-lid']],
  ['body-track-leaf', 5, ['bone-sample', 'track-slab', 'leaf-slab'], ['leaf-lid']],
  ['buried-to-exposed', 1, ['sediment-low', 'buried-bone'], ['sediment-mid', 'sediment-high', 'pore-shell', 'pore-minerals']],
  ['buried-to-exposed', 2, ['sediment-mid', 'sediment-high', 'buried-bone'], ['pore-shell', 'pore-minerals']],
  ['buried-to-exposed', 3, ['pore-shell'], ['buried-bone', 'pore-minerals']],
  ['buried-to-exposed', 4, ['pore-shell', 'pore-minerals'], ['buried-bone']],
  ['buried-to-exposed', 5, ['sediment-mid', 'buried-bone'], ['sediment-high', 'pore-shell', 'pore-minerals']],
  ['layers-in-order', 1, ['ash-low'], ['dated-crystal']],
  ['layers-in-order', 2, ['ash-high'], ['dated-crystal']],
  ['layers-in-order', 3, ['fossil-bed', 'ash-low', 'ash-high'], ['dated-crystal']],
  ['layers-in-order', 4, ['ash-low', 'fossil-bed', 'ash-high'], ['dated-crystal']],
  ['ash-beds-and-ages', 1, ['ash-low', 'fossil-bed', 'ash-high'], []],
  ['ash-beds-and-ages', 2, ['dated-crystal'], []],
  ['ash-beds-and-ages', 3, ['ash-low', 'fossil-bed', 'ash-high'], []],
  ['ash-beds-and-ages', 4, ['ash-low', 'fossil-bed', 'ash-high'], []],
  ['ash-beds-and-ages', 5, ['ash-low', 'ash-high'], []],
  ['rebuilding-evidence', 1, [...DIRECT, ...COMPARISON, ...INFERRED], []],
  ['rebuilding-evidence', 2, ['sk-skull', 'sk-trunk', 'sk-pelvis', 'sk-arm-l', 'sk-leg-l'], []],
  ['rebuilding-evidence', 3, COMPARISON, INFERRED],
  ['rebuilding-evidence', 4, DIRECT, [...COMPARISON, ...INFERRED]],
  ['rebuilding-evidence', 5, ['sk-arm-l', 'sk-arm-r'], []],
  ['birds-are-dinosaurs', 1, ['myna-body', 'myna-leg'], ['prince-study', 'apollonia-study', 'twinky-study']],
  ['birds-are-dinosaurs', 2, ['myna-wing', 'myna-leg'], ['prince-study']],
  ['birds-are-dinosaurs', 3, ['myna-feather'], ['prince-study']],
  ['birds-are-dinosaurs', 4, ['myna-body', 'myna-wing'], ['prince-study']],
  ['singapore-skeletons', 1, ['prince-study', 'apollonia-study', 'twinky-study'], ['myna-body', 'myna-wing', 'myna-leg', 'myna-feather']],
  ['singapore-skeletons', 2, ['apollonia-study'], ['myna-body']],
  ['singapore-skeletons', 3, ['prince-study', 'twinky-study'], ['myna-body']],
  ['singapore-skeletons', 4, ['prince-study', 'apollonia-study', 'twinky-study'], ['myna-body']],
];

describe('fossils-and-skeletons: captions and their models', () => {
  it('eight chapters contain all 36 bilingual captions', () => {
    expect(chapters.map((c) => c.state.beats.length)).toEqual([4, 5, 5, 4, 5, 5, 4, 4]);
    expect(CAPTIONS).toHaveLength(36);
  });
  it.each(CAPTIONS)('%s beat %i shows its evidence', (id, beat, shown, hidden) => {
    const { b, state, visible } = at(id, beat);
    expect(b.caption.en.trim().length).toBeGreaterThan(20);
    expect(b.caption.zh.trim().length).toBeGreaterThan(10);
    expect(b.caption.en.split(/\s+/).length).toBeLessThanOrEqual(45);
    for (const p of shown) expect(visible, `${id}.${beat}: ${p}`).toContain(p);
    for (const p of hidden) expect(visible, `${id}.${beat}: ${p}`).not.toContain(p);
    for (const p of state.labels) expect(visible, `${id}.${beat} label ${p}`).toContain(p);
    expect(state.labels.length).toBeLessThanOrEqual(6);
    expect(state.run).toBe(false);
  });
  it('age captions and evidence captions use their own beat settings', () => {
    expect([3, 4, 5].map((b) => at('ash-beds-and-ages', b).outputs['bracket-width'])).toEqual([2, expect.closeTo(0.8, 8), 2]);
    expect([1, 2, 3, 4, 5].map((b) => at('rebuilding-evidence', b).outputs['visible-count'])).toEqual([12, 12, 10, 7, 12]);
    expect(at('buried-to-exposed', 2).state.view).toBe('xray');
    expect(at('buried-to-exposed', 5).state.view).toBe('xray');
    expect(at('rebuilding-evidence', 2).state.view).toBe('exploded');
  });
});

describe('fossils-and-skeletons: age brackets and independent evidence inventory', () => {
  const CASES = [
    ['wide', 150, 148, 0.2, 0.2, 2, 147.8, 150.2],
    ['close', 149.4, 148.6, 0.1, 0.1, 0.8, 148.5, 149.5],
    ['precise', 150, 148, 0.05, 0.05, 2, 147.95, 150.05],
  ] as const;
  it.each(CASES)('%s keeps the two dates and bounded errors', (id, lower, upper, eL, eU, width, young, old) => {
    const o = result({ 'ash-case': id });
    for (const [key, value] of Object.entries({ 'ash-lower-age': lower, 'ash-upper-age': upper, 'ash-lower-error': eL, 'ash-upper-error': eU, 'bracket-young': upper, 'bracket-old': lower, 'bracket-width': width, 'envelope-young': young, 'envelope-old': old })) expect(o[key]).toBeCloseTo(value, 8);
    expect(lower).toBeGreaterThan(upper);
    expect(upper).toBeGreaterThan(0);
    expect(Math.min(eL, eU, upper - eU)).toBeGreaterThanOrEqual(0);
    expect(upper + eU).toBeLessThan(lower - eL);
    expect(o['bracket-width']).toBeCloseTo(lower - upper, 8);
    expect(o['envelope-young']).toBeCloseTo(Math.max(0, upper - eU), 8);
    expect(o['envelope-old']).toBeCloseTo(lower + eL, 8);
  });
  it('six source-backed table rows evaluate all nine independent combinations', () => {
    expect(Object.values(sim.table!.experiments).map((e) => e.rows.length)).toEqual([3, 3]);
    expect(sim.outputs).toHaveLength(15);
    expect(sim.outputs.map((o) => o.id)).not.toContain('mean-age');
    const sources = JSON.parse(readFileSync(join(DIR, 'data/sources.json'), 'utf8')).sources;
    const sourceMap = new Map<string, { design?: boolean }>(sources.map((s: { id: string; design?: boolean }) => [s.id, s]));
    expect(tableSourceIssues(sim.table!, sim.outputs, sourceMap)).toEqual([]);
    expect(sourceMap.get('S90')?.design).toBe(true);
    for (const e of Object.values(sim.table!.experiments)) for (const r of e.rows) expect(r.source).toEqual(['S90']);
    for (const [ash] of CASES) for (const [evidence, visible] of [['whole', 12], ['supported', 10], ['direct', 7]] as const) {
      const values = resolveSimValues(sim, { 'ash-case': ash, 'evidence-view': evidence });
      const o = evaluateSim(sim, values);
      expect([o['direct-count'], o['comparison-count'], o['inferred-count'], o['visible-count']]).toEqual([7, 3, 2, visible]);
      for (const output of sim.outputs.filter((x) => x.id.includes('ash-') || x.id.includes('bracket-') || x.id.includes('envelope-'))) expect(o[output.id]).toEqual(result({ 'ash-case': ash })[output.id]);
      const hidden = simEffects(sim, values, o).hidden;
      expect([...DIRECT, ...COMPARISON, ...INFERRED].filter((id) => !hidden.has(id))).toHaveLength(visible);
      for (const id of DIRECT) expect(hidden.has(id), `direct record ${id}, including the cast skull`).toBe(false);
      expect([...hidden].sort()).toEqual((evidence === 'whole' ? [] : evidence === 'supported' ? INFERRED : [...COMPARISON, ...INFERRED]).sort());
    }
  });
  it('only two chapters have cards, with the complete observation and recording contract', () => {
    expect(chapters.filter((c) => c.state.sim.try).map((c) => c.id)).toEqual(['ash-beds-and-ages', 'rebuilding-evidence']);
    expect(chapter('ash-beds-and-ages').state.sim.try).toMatchObject({ vary: 'ash-case', observe: ['bracket-young', 'bracket-old', 'bracket-width', 'envelope-young', 'envelope-old'], record: true });
    expect(chapter('rebuilding-evidence').state.sim.try).toMatchObject({ vary: 'evidence-view', observe: ['direct-count', 'comparison-count', 'inferred-count', 'visible-count'], record: true });
    for (const c of chapters) expect(c.state.sim.set).toEqual({ 'ash-case': 'wide', 'evidence-view': 'whole' });
    expect(file.telemetry ?? []).toEqual([]);
  });
});

describe('fossils-and-skeletons: selectable evidence and access routes', () => {
  it('33 selectable objects have bilingual names, summaries and details; the platform is context only', () => {
    const selectable = parts.filter((p) => !p.context);
    expect(selectable).toHaveLength(33);
    expect(parts.filter((p) => p.context).map((p) => p.id)).toEqual(['study-plinth']);
    for (const p of selectable) for (const field of [p.name, p.summary, p.detail]) for (const locale of ['en', 'zh'] as const) expect(field[locale].trim().length, `${p.id} ${locale}`).toBeGreaterThan(0);
    expect(new Set(chapters.flatMap((c) => c.state.index.parts))).toEqual(new Set(selectable.map((p) => p.id)));
    expect(chapter('rebuilding-evidence').state.index.parts.slice().sort()).toEqual([...DIRECT, ...COMPARISON, ...INFERRED].sort());
  });
  it('every chapter index object has an explicit bilingual route to a beat where it is visible', () => {
    for (const c of chapters) for (const id of c.state.index.parts) {
      expect(part(id)?.context).not.toBe(true);
      const routes = [...c.body.matchAll(/href="\?ch=([a-z-]+)&amp;b=(\d+)&amp;part=([a-z-]+)"/g)].filter((m) => m[3] === id);
      expect(routes.length, `${c.id} → ${id}: links in both Lang bodies`).toBe(2);
      for (const route of routes) expect(at(route[1]!, Number(route[2])).visible, `${c.id} → ${id}`).toContain(id);
    }
  });
  it('the footprint and leaf are negative shapes, while the skull has open fenestrae', () => {
    for (const id of ['track-slab', 'leaf-slab', 'sk-skull']) {
      const p = part(id);
      expect([p.primitive, ...(p.extra ?? [])].some((p) => p.kind === 'extrude' && (p.holes?.length ?? 0) > 0), id).toBe(true);
    }
  });
  it('each short forelimb ends in two distinct fingers and each foot has three ground-level toes plus a raised small toe', () => {
    const tip = (p: Primitive) => p.at.map((x, i) => x + p.path!.at(-1)![i]!);
    for (const id of ['sk-arm-l', 'sk-arm-r']) {
      const p = part(id);
      const fingers = (p.extra ?? []).filter((p) => p.kind === 'sweep');
      expect(fingers, id).toHaveLength(2);
      const tips = fingers.map(tip);
      expect(Math.abs(tips[0]![2]! - tips[1]![2]!)).toBeGreaterThan(0.05);
      expect(tips.every((x) => x[1]! < tip(p.primitive)[1]!)).toBe(true);
      expect(p.detail.en).toMatch(/two functional fingers/);
    }
    for (const id of ['sk-leg-l', 'sk-leg-r']) {
      const p = part(id);
      // The three long forward digits share one metatarsal origin. Their
      // terminals lie at the support level; the short rear digit is higher.
      const toes = (p.extra ?? []).filter((p) => p.kind === 'sweep' && p.path?.length === 4);
      expect(toes, id).toHaveLength(3);
      expect(new Set(toes.map((p) => JSON.stringify(p.at))).size).toBe(1);
      expect(new Set(toes.map((p) => tip(p)[2])).size).toBe(3);
      const floor = Math.max(...toes.map((p) => tip(p)[1]!));
      const toeLength = Math.max(...toes.map((p) => Math.hypot(...p.path!.at(-1)!)));
      const hallux = (p.extra ?? []).filter((p) => p.kind === 'sweep' && p.path?.length === 3 && tip(p)[0]! > p.at[0]! && tip(p)[1]! > floor && Math.hypot(...p.path.at(-1)!) < toeLength / 2);
      expect(hallux, id).toHaveLength(1);
      expect(p.detail.en).toMatch(/Three main support toes/);
    }
  });
});
