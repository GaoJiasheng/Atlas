/** Production author-data checks: docs/45 §8; engine browser acceptance is recorded in §9.2–9.3. */
import { readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { Euler, Vector3 } from 'three';
import { sampleSequence } from '../src/engines/space-scene/lib/pose';
import { parse as parseYaml } from 'yaml';
import { partsFile } from '../src/engines/space-scene/schema';
import { evaluateSim } from '../src/engines/space-scene/lib/sim';
import { resolveSimValues } from '../src/engines/space-scene/lib/sim/controls';
import { W } from '../scripts/geo/how-planes-fly/layout';
import { simEffects } from '../src/engines/space-scene/lib/sim/bind';
import type { SimValues } from '../src/engines/space-scene/sim-schema';

const DIR = new URL('../src/content/topics/how-planes-fly/', import.meta.url);
const data = partsFile.parse(JSON.parse(readFileSync(new URL('data/parts.json', DIR), 'utf8')));
const sim = data.sim!;
type Text = { en: string; zh: string };
type Scene = {
  view: string; explode: number; part: string | null; run: boolean; cutaway: string; pose: string | null;
  layers: string[]; hide: string[]; ghost: string[]; labels: string[]; camera: unknown;
  sim: { set: SimValues; try?: { vary: string; observe: string[]; record: boolean; predict: { start: SimValues; change: SimValues; observe: string } } };
};
type Chapter = { id: string; kind?: string; state: Scene & { index: { parts: string[] }; beats: (Scene & { caption: Text })[] }; body: string };
const chapters: Chapter[] = readdirSync(new URL('chapters/', DIR)).filter(f => f.endsWith('.mdx')).sort().map(f => {
  const [, front, ...body] = readFileSync(new URL(`chapters/${f}`, DIR), 'utf8').split(/^---$/m);
  return { ...parseYaml(front!), body: body.join('---') };
});
const chapter = (id: string) => chapters.find(c => c.id === id)!;
const at = (id: string, beat: number) => chapter(id).state.beats[beat - 1]!;
const values = (set: SimValues = {}) => resolveSimValues(sim, set);
const output = (set: SimValues = {}) => evaluateSim(sim, values(set));
const fx = (set: SimValues) => simEffects(sim, values(set), output(set));
const allParts = data.parts.map(p => p.id);
const part = (id: string) => data.parts.find(p => p.id === id)!;
const expectedChapters = ['before-you-start', 'four-forces', 'wing-and-air', 'angle-and-stall', 'changing-direction', 'inside-a-turbofan', 'thin-air', 'flight-and-singapore'];
const whole = W;
const shown = (s: Scene) => allParts.filter(id => !s.hide.includes(id));
// Independent point-in-section test (radius, axial position) for lathe walls.
const inside = (poly: number[][], r: number, u: number) => {
  let hit = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i]!, b = poly[j]!;
    if ((a[1]! > u) !== (b[1]! > u) && r < (b[0]! - a[0]!) * (u - a[1]!) / (b[1]! - a[1]!) + a[0]!) hit = !hit;
  }
  return hit;
};

describe('how-planes-fly production content and model', () => {
  it('ships eight chapters, 38 beats, 44 selectable parts and one context stand', () => {
    expect(chapters.map(c => c.id)).toEqual(expectedChapters);
    expect(chapters.map(c => c.state.beats.length)).toEqual([4, 5, 5, 5, 5, 5, 4, 5]);
    expect(chapters.flatMap(c => c.state.beats)).toHaveLength(38);
    expect(chapters.filter(c => c.kind === 'background').map(c => c.id)).toEqual(['before-you-start']);
    expect(data.parts.filter(p => !p.context)).toHaveLength(44);
    expect(data.parts.filter(p => p.context).map(p => p.id)).toEqual(['display-plinth']);
    expect(new Set(allParts).size).toBe(45);
    expect(chapter('inside-a-turbofan').state.index.parts).toHaveLength(13);
    expect(part('wing-ribs').repeat?.count).toBe(3);
    expect(part('wing-ribs').detail.en).toContain('three');
    expect(part('wing-ribs').detail.zh).toContain('三道');
  });

  it.each(expectedChapters)('%s has independent complete masks and indexed bilingual captions', id => {
    const c = chapter(id), index = c.state.index.parts;
    expect(new Set(index).size).toBe(index.length);
    for (const p of index) expect(allParts).toContain(p);
    for (const s of [c.state, ...c.state.beats]) {
      for (const key of ['view', 'explode', 'part', 'run', 'cutaway', 'pose', 'layers', 'hide', 'ghost', 'labels', 'camera', 'sim']) expect(s).toHaveProperty(key);
      expect(Object.keys(s.sim.set).sort()).toEqual(['angle-deg', 'airspeed-mps', 'altitude-m', 'flow-view', 'diagram-case'].sort());
      expect(new Set(s.hide).size).toBe(s.hide.length);
      for (const hidden of s.hide) expect(allParts).toContain(hidden);
      expect(s.labels.length).toBeLessThanOrEqual(['wing-and-air', 'angle-and-stall', 'inside-a-turbofan'].includes(id) ? 3 : 6);
      for (const label of s.labels) {
        expect(index).toContain(label);
        expect(shown(s)).toContain(label);
        expect(s.ghost).not.toContain(label);
      }
    }
    for (const b of c.state.beats) {
      expect(b.caption.en.trim()).not.toBe(''); expect(b.caption.zh.trim()).not.toBe('');
      expect(b.caption.en.split(/\s+/)).toHaveLength(b.caption.en.trim().split(/\s+/).length);
      expect(b.caption.en.trim().split(/\s+/).length).toBeLessThanOrEqual(45);
    }
  });

  it('shows one station at a time, with the specified fan demonstration and actual skin removal', () => {
    const box = at('wing-and-air', 1);
    expect(shown(box).sort()).toEqual(['front-spar', 'rear-spar', 'wing-ribs'].sort());
    expect(box.hide).toContain('wing-box-skin'); expect(box.ghost).not.toContain('wing-box-skin');
    for (const i of [2, 3, 4, 5]) expect(shown(at('wing-and-air', i)).sort()).toEqual(['foil-sample', 'chord-marker', 'inflow-reference', 'angle-marker', 'display-plinth'].sort());
    expect(shown(at('angle-and-stall', 5))).toEqual(expect.arrayContaining(['foil-sample', 'fan-right', 'nacelle-right']));
    expect(at('angle-and-stall', 5).run).toBe(true);
    for (const id of ['nacelle-left', 'nacelle-right', 'fan-left', 'fan-right']) expect(at('four-forces', 4).hide).toContain(id);
  });

  it('reproduces the actual NASA-atmosphere default, the caption’s fourfold speed result and zero lift', () => {
    const start = output({ 'airspeed-mps': 20 }), end = output({ 'airspeed-mps': 40 });
    expect(end['rho-now']).toBeCloseTo(1.226613787410970, 12);
    expect(end['cl-now']).toBeCloseTo(0.47075898801417243, 12);
    expect(end['lift-n']).toBeCloseTo(923.9031443933111, 9);
    expect(Number(end['lift-n']) / Number(start['lift-n'])).toBeCloseTo(4, 12);
    expect(at('wing-and-air', 5).caption.en).toContain('four times');
    expect(at('wing-and-air', 5).caption.zh).toContain('四倍');
    expect(output(at('angle-and-stall', 1).sim.set)['lift-n']).toBe(0);
    expect(output({ 'angle-deg': -16, 'airspeed-mps': 0 })['lift-n']).toBe(0);
  });

  it('puts the captioned 0°, 4°, 12°, 16° on the signed illustrative curve', () => {
    expect([1, 2, 3, 4].map(i => at('angle-and-stall', i).sim.set['angle-deg'])).toEqual([0, 4, 12, 16]);
    const peak = output(at('angle-and-stall', 3).sim.set), separated = output(at('angle-and-stall', 4).sim.set);
    expect(peak['flow-state']).toBe('ideal-attached');
    expect(separated['flow-state']).toBe('separated-illustration');
    expect(Number(separated['cl-now']) / Number(peak['cl-now'])).toBeCloseTo(.85, 12);
    expect(output({ 'angle-deg': -16 })['cl-now']).toBe(-Number(separated['cl-now']));
    expect(at('angle-and-stall', 3).caption.en).toContain('twelve degrees');
    expect(at('angle-and-stall', 4).caption.en).toContain('dashed');
    expect(at('wing-and-air', 4).sim.set['flow-view']).toBe('pressure');
  });

  it('changes density rather than speed or angle across the thin-air experiment', () => {
    const expected = [[0, 1.226613787410970, 923.9031443933111], [5000, .7376745768470427, 555.6270996484747], [10000, .4140080791698312, 311.8368390074898]];
    for (const [i, [h, rho, lift]] of expected.entries()) {
      const b = at('thin-air', i + 1), out = output(b.sim.set);
      expect(b.sim.set).toMatchObject({ 'angle-deg': 4, 'airspeed-mps': 40, 'altitude-m': h });
      expect(out['rho-now']).toBeCloseTo(rho!, 12); expect(out['lift-n']).toBeCloseTo(lift!, 9);
    }
  });

  it('has three prediction-first recording cards whose stated change gives the predicted direction', () => {
    const cards = chapters.filter(c => c.state.sim.try);
    expect(cards.map(c => c.id)).toEqual(['wing-and-air', 'angle-and-stall', 'thin-air']);
    for (const c of cards) {
      const card = c.state.sim.try!, p = card.predict;
      expect(card.record).toBe(true);
      const before = Number(output({ ...c.state.sim.set, ...p.start })[p.observe]);
      const after = Number(output({ ...c.state.sim.set, ...p.start, ...p.change })[p.observe]);
      if (c.id === 'wing-and-air') expect(after / before).toBeCloseTo(4, 12);
      else expect(after).toBeLessThan(before);
    }
  });

  it('moves all whole-aircraft parts together only in the balanced level-flight beat', () => {
    const travel = data.animations.filter(a => a.id.startsWith('balanced-travel-'));
    expect(travel.map(a => a.target).sort()).toEqual([...whole].sort());
    for (const a of travel) {
      expect(a.kind).toBe('sequence');
      if (a.kind !== 'sequence') throw new Error('steady motion must be a sequence');
      expect(a.loop).toBe(false); expect(a.keys).toEqual([{ t: 0, offset: [0, 0, 0] }, { t: 2, offset: [-.3, 0, 0] }]);
      expect(fx(at('four-forces', 2).sim.set).animations.get(a.id)?.enabled).toBe(true);
      expect(fx(at('four-forces', 1).sim.set).animations.get(a.id)?.enabled).toBe(false);
    }
    expect(at('four-forces', 1).run).toBe(false);
    expect(at('four-forces', 2).run).toBe(true);
    expect(at('four-forces', 3).run).toBe(false);
    expect(at('four-forces', 2).pose).toBeNull();
    const clip = travel[0]!;
    if (clip.kind !== 'sequence') throw new Error('clip required');
    expect(sampleSequence(clip.keys, 1, clip.loop).offset).toEqual([-.15, 0, 0]);
    expect(sampleSequence(clip.keys, 9, clip.loop).offset).toEqual([-.3, 0, 0]);
  });

  it('holds the bank pose static with world vertical weight and a separately tilted lift', () => {
    const b = at('changing-direction', 4), pose = data.poses![b.pose!]!;
    expect(pose.duration).toBe(0); expect(b.run).toBe(false);
    for (const id of whole) expect(pose.parts[id]?.rotation).toEqual([-20, 0, 0]);
    const arrows = sim.overlays.filter(o => o.kind === 'force-vectors').flatMap(o => o.arrows).filter(a => a.part === 'fuselage-shell');
    expect(arrows.find(a => a.force === 'gravity')!.dir).toEqual([0, -1, 0]);
    expect(arrows.find(a => a.force === 'lift' && a.dir[2] !== 0)!.dir).toEqual([0, .9396926208, -.3420201433]);
    const surfaces = data.poses!['high-lift-open']!.parts;
    expect(Math.hypot(...surfaces['spoiler-left']!.rotation!)).toBeGreaterThan(20);
    expect(surfaces['flap-left']!.offset![0]).toBeGreaterThan(0);
    expect(surfaces['slat-left']!.offset![0]).toBeLessThan(0);
  });

  it('rotates each spool together, keeps stators still and puts the LP shaft inside the hollow HP shaft', () => {
    const spinning = data.animations.filter(a => a.kind === 'rotate');
    for (const [targets, rpm] of [[['fan-disc', 'lp-shaft', 'lp-turbine-rotor'], 30], [['compressor-rotor', 'hp-shaft', 'hp-turbine-rotor'], 45]] as const) {
      for (const target of targets) expect(spinning.find(a => a.target === target)).toMatchObject({ rpm, axis: [1, 0, 0] });
    }
    for (const target of ['compressor-bank', 'turbine-bank', 'combustor-ring', 'bypass-duct']) expect(spinning.some(a => a.target === target)).toBe(false);
    const lp = part('lp-shaft').primitive!, hp = part('hp-shaft').primitive!;
    expect(lp.kind).toBe('cylinder'); expect(hp.kind).toBe('lathe');
    if (lp.kind !== 'cylinder' || hp.kind !== 'lathe') throw new Error('two concentric shafts required');
    expect(lp.size[0]).toBeLessThan(Math.min(...hp.profile.map(p => p[0])));
    expect(at('inside-a-turbofan', 4).caption.en).toContain('inside the core shaft');
    for (const [i, name] of ['engine-intake', 'engine-split', 'engine-core', 'engine-shafts', 'engine-exhaust'].entries()) expect(at('inside-a-turbofan', i + 1).sim.set['diagram-case']).toBe(name);
    expect(fx(at('inside-a-turbofan', 1).sim.set).flows.get('engine-core-hot')?.visible).toBe(false);
    expect(fx(at('inside-a-turbofan', 3).sim.set).flows.get('engine-core-hot')?.visible).toBe(true);
  });

  it('raises the actual spoiler panel above its hinge rather than merely naming an open pose', () => {
    const p = part('spoiler-left').primitive!;
    if (p.kind !== 'extrude') throw new Error('panel required');
    const local = p.shape.reduce((v, q) => v.add(new Vector3(q[0], q[1], 0)), new Vector3()).divideScalar(p.shape.length);
    const rad = (v: readonly number[]) => new Euler(v[0]! * Math.PI / 180, v[1]! * Math.PI / 180, v[2]! * Math.PI / 180);
    const centre = local.applyEuler(rad(p.rotation ?? [0, 0, 0])).add(new Vector3(...p.at));
    const pose = data.poses!['high-lift-open']!.parts['spoiler-left']!;
    const pivot = new Vector3(...pose.pivot!);
    const raised = centre.clone().sub(pivot).applyEuler(rad(pose.rotation!)).add(pivot);
    expect(raised.y - centre.y).toBeGreaterThan(.015);
  });

  it('leaves the illustrated hot gas inside an open combustion passage between two liner walls', () => {
    const chamber = part('combustor-ring');
    const walls = [chamber.primitive!, ...(chamber.extra ?? [])];
    expect(walls).toHaveLength(2);
    for (const wall of walls) {
      if (wall.kind !== 'lathe') throw new Error('annular liner required');
      // The real production flow follows r=.118 to .12 across this chamber.
      for (let i = 0; i <= 100; i++) {
        const u = .031 + .18 * i / 100;
        const r = u < .12 ? .118 + (.12 - .118) * (u - .03) / .09 : .12;
        expect(inside(wall.profile, r, u)).toBe(false);
      }
    }
  });

  it('joins the compressor drum to the hollow HP shaft with material webs', () => {
    const webs = (part('hp-shaft').extra ?? []).filter(p => p.kind === 'lathe');
    for (const [u, radii] of [[-.491, [.035, .05, .067]], [-.034, [.035, .06, .08]]] as const) {
      for (const r of radii) expect(webs.some(w => w.kind === 'lathe' && inside(w.profile, r, u))).toBe(true);
    }
  });

  it('keeps sourced history units and dates, 16 bilingual glossary entries and the original design source', () => {
    const history = chapter('flight-and-singapore');
    expect(at(history.id, 5).caption.en).toMatch(/1975.*558 buildings.*4,096 graves.*not people/);
    expect(at(history.id, 5).caption.zh).toMatch(/558 座建筑.*4,096 座坟墓.*不是人数/);
    expect(at(history.id, 4).caption.en).toMatch(/1 July 1981.*29 December/);
    const terms = JSON.parse(readFileSync(new URL('data/glossary.json', DIR), 'utf8')).terms as { id: string; term: Text; definition: Text }[];
    expect(terms).toHaveLength(16);
    for (const t of terms) for (const locale of ['en', 'zh'] as const) { expect(t.term[locale]).toBeTruthy(); expect(t.definition[locale]).toBeTruthy(); }
    const sources = JSON.parse(readFileSync(new URL('data/sources.json', DIR), 'utf8')).sources as { id: string; design?: boolean; url?: string }[];
    expect(sources).toHaveLength(24);
    expect(sources.filter(s => s.design).map(s => s.id)).toEqual(['S58']);
    expect(sources.find(s => s.id === 'S58')!.url).toBeUndefined();
  });
});
