/** Saturn V's content contract: sourced table values and physically connected static configurations. */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { expect, it } from 'vitest';
import { parse as parseYaml } from 'yaml';
import { Euler, Matrix4, PerspectiveCamera, Vector3 } from 'three';
import { partsFile, type Part } from '../../src/engines/space-scene/schema';
import { evaluateSim } from '../../src/engines/space-scene/lib/sim';
import { resolveSimValues } from '../../src/engines/space-scene/lib/sim/controls';
import { simEffects } from '../../src/engines/space-scene/lib/sim/bind';
import { cellValue } from '../../src/engines/space-scene/lib/sim/table';
import { tableSourceIssues } from '../../src/engines/space-scene/table-schema';
import { anchorPoint } from '../../src/engines/space-scene/stages/model3d/shapes';
import { partPieces } from '../../src/engines/space-scene/stages/model3d/geometry';
import { repeatTransforms } from '../../src/engines/space-scene/lib/parts';
import { toTransform } from '../../src/engines/space-scene/lib/pose';
import type { SimValues } from '../../src/engines/space-scene/sim-schema';

const DIR = join(import.meta.dirname, '../../src/content/topics/saturn-v');
const file = partsFile.parse(JSON.parse(readFileSync(join(DIR, 'data/parts.json'), 'utf8')));
const sim = file.sim!;
const sources = JSON.parse(readFileSync(join(DIR, 'data/sources.json'), 'utf8')).sources as { id: string; design?: boolean }[];
interface Camera { position: [number, number, number]; target: [number, number, number]; fov?: number; }
interface Beat { camera?: string | Camera; caption: { en: string; zh: string }; labels?: string[]; hide?: string[]; pose?: string; sim?: { set?: SimValues }; }
interface Chapter { id: string; state: { camera?: Camera; index: { parts: string[] }; beats: Beat[]; labels?: string[]; hide?: string[]; pose?: string; sim?: { set?: SimValues } }; body: string; }
const chapters: Chapter[] = readdirSync(join(DIR, 'chapters')).filter((x) => x.endsWith('.mdx')).sort().map((name) => {
  const [, front, ...rest] = readFileSync(join(DIR, 'chapters', name), 'utf8').split(/^---$/m);
  return { ...parseYaml(front!), body: rest.join('---') };
});
const part = (id: string) => file.parts.find((x) => x.id === id)!;
const count = (id: string) => part(id).repeat?.count ?? 1;
const PHASE_NAMES = ['launch', 'first-off', 'parking', 'translunar', 'separated', 'turned', 'docked', 'extracted', 'lunar', 'ascent', 'rendezvous', 'homeward', 'return'];
const phaseValue = (phase: string) => phaseControl.kind === 'step' ? PHASE_NAMES.indexOf(phase) : phase;
const values = (set: SimValues = {}) => resolveSimValues(sim, { ...set, ...(typeof set.phase === 'string' && PHASE_NAMES.includes(set.phase) ? { phase: phaseValue(set.phase) } : {}) });
const out = (set: SimValues = {}) => evaluateSim(sim, values(set));
const effects = (set: SimValues = {}) => simEffects(sim, values(set), out(set));
const phaseControl = sim.controls.find((c) => c.id === 'phase')!;
const phases = phaseControl.kind === 'choice' ? phaseControl.options.map((x) => x.id) : PHASE_NAMES;
const phasePose = (phase: string, id: string) => effects({ phase }).poses.get(id);

/** Independent scene-space application of the documented XYZ, scale, pivot, offset contract. */
const poseFrames = new Map<string, { pivot: Vector3; rotation: Matrix4; scale: Vector3; offset: Vector3 }>();
function posedPoint(id: string, phase: string, point: readonly number[]) {
  const key = `${phase}/${id}`;
  let frame = poseFrames.get(key);
  if (!frame) {
    const name = phasePose(phase, id);
    const entry = name ? file.poses?.[name]?.parts[id] : undefined;
    const t = toTransform(entry);
    frame = {
      pivot: new Vector3(...(t.pivot ?? part(id).primitive!.at)),
      rotation: new Matrix4().makeRotationFromEuler(new Euler(...t.rotation.map((x) => x * Math.PI / 180) as [number, number, number], 'XYZ')),
      scale: new Vector3(...t.scale), offset: new Vector3(...t.offset),
    };
    poseFrames.set(key, frame);
  }
  return new Vector3(...point as [number, number, number]).sub(frame.pivot).multiply(frame.scale).applyMatrix4(frame.rotation).add(frame.pivot).add(frame.offset);
}
/** Use actual generated mesh vertices, including repeat/extra, rather than boxes around radial parts. */
function vertices(p: Part): Vector3[] {
  const points: Vector3[] = [];
  for (const piece of partPieces(p)) {
    const pos = piece.geometry.getAttribute('position');
    for (const matrix of piece.matrices ?? [new Matrix4()]) for (let i = 0; i < pos.count; i++) {
      points.push(new Vector3().fromBufferAttribute(pos, i).applyMatrix4(matrix).add(new Vector3(...p.primitive!.at)));
    }
    piece.geometry.dispose();
  }
  return points;
}

it('publishes seven bilingual chapters with exactly five beats each and 33 selectable parts', () => {
  expect(parseYaml(readFileSync(join(DIR, 'topic.yaml'), 'utf8')).status).toBe('published');
  expect(chapters).toHaveLength(7);
  expect(chapters.map((c) => c.state.beats.length)).toEqual([5, 5, 5, 5, 5, 5, 5]);
  expect(file.parts.filter((p) => !p.context)).toHaveLength(33);
  expect(new Set(file.parts.map((p) => p.id)).size).toBe(file.parts.length);
  for (const c of chapters) for (const b of c.state.beats) {
    expect(b.caption.en.trim(), c.id).not.toBe('');
    expect(b.caption.zh.trim(), c.id).not.toBe('');
    if (phaseControl.kind === 'step') expect(phaseControl.values, `${c.id}: phase is a supported numeric step`).toContain(b.sim?.set?.phase);
    else expect(phases, `${c.id}: phase is a supported choice`).toContain(b.sim?.set?.phase);
  }
});

it('has five F-1, five S-II J-2, one S-IVB J-2, three couches and four single-ladder legs', () => {
  expect([count('f1-centre'), count('f1-outer'), count('j2-centre'), count('j2-outer'), count('sivb-engine')]).toEqual([1, 4, 1, 4, 1]);
  expect([count('cm-couches'), count('lm-legs'), count('lm-ladder')]).toEqual([3, 4, 1]);
  expect(count('lm-windows') * (1 + (part('lm-windows').extra?.length ?? 0))).toBe(2);
  expect(file.flows).toHaveLength(3);
  const stages = chapters.find((c) => c.id === 'stages-and-mass')!;
  expect(stages.state.beats.map((b) => out({ ...stages.state.sim?.set, ...b.sim?.set })['engine-count'])).toEqual([5, 5, 1, 1, 1]);
});

it('uses existing table only and every row cites the appropriate design or historical source', () => {
  expect(sim.kind).toBe('table');
  expect(phaseControl.kind).toBe('step');
  if (phaseControl.kind === 'step') expect(phaseControl.values).toEqual(Array.from({ length: 13 }, (_, i) => i));
  expect(tableSourceIssues(sim.table!, sim.outputs, new Map(sources.map((s) => [s.id, s])))).toEqual([]);
  expect(sources.filter((s) => s.design).map((s) => s.id)).toEqual(['S90']);
  expect(Object.fromEntries(Object.entries(sim.table!.experiments).map(([id, e]) => [id, e.rows.length]))).toEqual({ ideal: 18, stage: 3, 'phase-state': 13 });
});

it.each(Array.from({ length: 18 }, (_, i) => i))('ideal table row %i matches an independent mass-ratio calculation', (i) => {
  const row = sim.table!.experiments.ideal!.rows[i]!;
  const payload = Number(row.when.payload), propellant = Number(row.when.propellant), extra = row.when['carry-inert'] ? 100 : 0;
  const final = 100 + payload + extra, initial = final + propellant;
  expect(cellValue(row.set['initial-mass']!)).toBe(initial);
  expect(cellValue(row.set['final-mass']!)).toBe(final);
  expect(Number(cellValue(row.set['ideal-dv']!))).toBeCloseTo(3000 * Math.log(initial / final), 8);
  expect(row.source).toContain('S90');
  expect(initial).toBeGreaterThan(final);
  expect(final).toBeGreaterThan(0);
});

it.each([
  [200, 600, false, 3295.84], [200, 600, true, 2748.87], [100, 200, false, 2079.44], [300, 200, false, 1216.40],
] as const)('payload %i, propellant %i, inert %s produces %f m/s', (payload, propellant, inert, expected) => {
  expect(Number(out({ payload, propellant, 'carry-inert': inert })['ideal-dv'])).toBeCloseTo(expected, 2);
});

it('changing stage selection preserves every ideal output and changes only the sourced stage description', () => {
  const picked = { payload: 300, propellant: 400, 'carry-inert': true };
  const initial = out(picked);
  for (const [stage, engines, fuel] of [['first', 5, 'kerosene'], ['second', 5, 'hydrogen'], ['third', 1, 'hydrogen']] as const) {
    const after = out({ ...picked, 'stage-choice': stage });
    expect([after['engine-count'], after['fuel-name']]).toEqual([engines, fuel]);
    for (const id of ['initial-mass', 'final-mass', 'ideal-dv']) expect(after[id]).toBe(initial[id]);
  }
});

it.each(['launch', 'first-off', 'parking', 'translunar', 'separated', 'turned', 'docked', 'extracted', 'lunar', 'ascent', 'rendezvous', 'homeward', 'return'])('%s reconstructs visibility and a named absolute pose for every part', (phase) => {
  const fx = effects({ phase });
  expect(phases).toContain(phase);
  expect(out({ phase })['configuration-name']).toBe(phase);
  for (const p of file.parts) {
    const name = fx.poses.get(p.id);
    expect(typeof name, `${phase}/${p.id} pose`).toBe('string');
    expect(file.poses?.[name!], `${phase}/${p.id}`).toBeDefined();
  }
  const sic = ['sic-shell', 'sic-fuel', 'sic-oxidiser', 'f1-centre', 'f1-outer', 'sic-fins'];
  const sii = ['sii-shell', 'sii-fuel', 'sii-oxidiser', 'j2-centre', 'j2-outer'];
  const upper = ['sivb-shell', 'sivb-fuel', 'sivb-oxidiser', 'sivb-engine', 'iu-ring'];
  for (const id of sic) expect(fx.hidden.has(id), `${phase}/${id}`).toBe(phase !== 'launch');
  for (const id of sii) expect(fx.hidden.has(id), `${phase}/${id}`).toBe(!['launch', 'first-off'].includes(phase));
  for (const id of upper) expect(fx.hidden.has(id), `${phase}/${id}`).toBe(['extracted', 'lunar', 'ascent', 'rendezvous', 'homeward', 'return'].includes(phase));
  expect(fx.hidden.has('sla-shell')).toBe(!['launch', 'first-off', 'parking', 'translunar'].includes(phase));
  for (const id of ['lm-descent', 'lm-descent-engine', 'lm-legs', 'lm-ladder']) expect(fx.hidden.has(id), `${phase}/${id}`).toBe(['rendezvous', 'homeward', 'return'].includes(phase));
  for (const id of ['lm-ascent', 'lm-ascent-engine', 'lm-windows', 'lm-docking-port']) expect(fx.hidden.has(id), `${phase}/${id}`).toBe(['homeward', 'return'].includes(phase));
  for (const id of ['sm-shell', 'sm-tanks', 'sm-engine']) expect(fx.hidden.has(id), `${phase}/${id}`).toBe(phase === 'return');
  expect(fx.hidden.has('les-tower')).toBe(!['launch', 'first-off'].includes(phase));
  expect(fx.hidden.has('cm-probe')).toBe(['homeward', 'return'].includes(phase));
  if (phase === 'return') expect(file.parts.filter((p) => !fx.hidden.has(p.id)).map((p) => p.id).sort()).toEqual(['cm-couches', 'cm-heatshield', 'cm-shell']);
});

it('the ascent cabin, engine, windows and port rise together while descent gear remains on the surface', () => {
  for (const id of ['lm-ascent', 'lm-ascent-engine', 'lm-windows', 'lm-docking-port']) {
    const rest = posedPoint(id, 'lunar', part(id).primitive!.at);
    const up = posedPoint(id, 'ascent', part(id).primitive!.at);
    expect(up.clone().sub(rest).toArray(), id).toEqual([0, 8, 0]);
  }
  for (const id of ['lm-descent', 'lm-descent-engine', 'lm-legs', 'lm-ladder']) {
    expect(posedPoint(id, 'ascent', part(id).primitive!.at).distanceTo(posedPoint(id, 'lunar', part(id).primitive!.at)), id).toBeLessThan(1e-8);
  }
});

it('the CSM components retain pairwise distances while clearing, turning and docking', () => {
  const ids = ['cm-shell', 'cm-heatshield', 'cm-couches', 'cm-probe', 'sm-shell', 'sm-tanks', 'sm-engine'];
  for (const phase of ['separated', 'turned', 'docked', 'extracted', 'rendezvous']) {
    for (const a of ids) for (const b of ids) {
      const before = new Vector3(...part(a).primitive!.at).distanceTo(new Vector3(...part(b).primitive!.at));
      const after = posedPoint(a, phase, part(a).primitive!.at).distanceTo(posedPoint(b, phase, part(b).primitive!.at));
      expect(Math.abs(after - before), `${phase}: ${a}/${b}`).toBeLessThan(1e-7);
    }
  }
});

it('all five F-1 bells have at least 0.10 m between their outer rims', () => {
  const centre = part('f1-centre'), outer = part('f1-outer');
  expect(centre.primitive!.kind).toBe('lathe');
  expect(outer.primitive!.kind).toBe('lathe');
  const maxRadius = (p: Part) => p.primitive!.kind === 'lathe' ? Math.max(...p.primitive.profile.map(([r]) => r)) : NaN;
  const bells = [centre, ...Array.from({ length: 4 }, () => outer)];
  const positions = [new Vector3(...centre.primitive!.at), ...repeatTransforms(outer.repeat).map((r) => new Vector3(...outer.primitive!.at).add(new Vector3(...r.offset)))];
  for (let i = 0; i < 5; i++) for (let j = i + 1; j < 5; j++) {
    expect(positions[i]!.distanceTo(positions[j]!) - maxRadius(bells[i]!) - maxRadius(bells[j]!), `${i}/${j}`).toBeGreaterThanOrEqual(0.1 - 1e-8);
  }
});

it('every beat labels only visible indexed objects, and each index entry can be viewed within its chapter', () => {
  for (const c of chapters) {
    const seen = new Set<string>();
    for (const b of c.state.beats) {
      const set = { ...c.state.sim?.set, ...b.sim?.set };
      const hidden = new Set([...effects(set).hidden, ...(b.hide ?? c.state.hide ?? [])]);
      const labels = b.labels ?? c.state.labels ?? [];
      expect(labels.length, c.id).toBeLessThanOrEqual(4);
      for (const id of c.state.index.parts) {
        expect(part(id), `${c.id}/${id}`).toBeDefined();
        if (!hidden.has(id)) seen.add(id);
      }
      for (const id of labels) {
        expect(c.state.index.parts, `${c.id} label ${id}`).toContain(id);
        expect(hidden.has(id), `${c.id} hidden label ${id}`).toBe(false);
      }
    }
    for (const id of c.state.index.parts) expect(seen.has(id), `${c.id} index ${id} needs a visible beat`).toBe(true);
  }
});

it('cold-link ideal-model beat 2 starts at 3295.84 m/s independently of the preceding chapter', () => {
  const chapter = chapters.find((c) => c.id === 'ideal-model')!;
  const set = { ...chapter.state.sim?.set, ...chapter.state.beats[1]!.sim?.set };
  expect(values(set)).toMatchObject({ payload: 200, propellant: 600, 'carry-inert': false, phase: phaseValue('translunar') });
  expect(Number(out(set)['ideal-dv'])).toBeCloseTo(3295.836866004329, 8);
});


it.each(['docked', 'extracted', 'rendezvous'])('%s aligns the actual probe tip and LM docking-port centre within 0.05 m', (phase) => {
  // NASA reference feature positions in the authored launch frame, not the primitive centres.
  const probe = posedPoint('cm-probe', phase, [0, 104.8, 0]);
  const port = posedPoint('lm-docking-port', phase, [0, 92.5, 0]);
  expect(probe.distanceTo(port)).toBeLessThanOrEqual(0.05);
});

it('the complete folded LM mesh fits inside the tapered adapter without a second copy outside it', () => {
  const points = file.parts.filter((p) => p.group === 'lander').flatMap((p) => vertices(p).map((v) => posedPoint(p.id, 'launch', v.toArray())));
  expect(points.length).toBeGreaterThan(100);
  let minRadialClearance = Infinity, minY = Infinity, maxY = -Infinity;
  for (const v of points) {
    minY = Math.min(minY, v.y); maxY = Math.max(maxY, v.y);
    // SLA inner profile is 3.225 m at y85.59, tapering to1.87 m at y94.
    const inner = 3.225 + (1.87 - 3.225) * (v.y - 85.59) / (94 - 85.59);
    minRadialClearance = Math.min(minRadialClearance, inner - Math.hypot(v.x, v.z));
  }
  expect(minY).toBeGreaterThanOrEqual(85.59 - 1e-5);
  expect(maxY).toBeLessThanOrEqual(94 + 1e-5);
  expect(minRadialClearance).toBeGreaterThanOrEqual(-1e-5);
  expect(file.parts.filter((p) => p.id === 'lm-ascent')).toHaveLength(1);
});

it('every labelled anchor is inside its beat camera at 1600×900 after the phase pose is applied', () => {
  const failures: string[] = [];
  for (const c of chapters) for (const [i, b] of c.state.beats.entries()) {
    const camera = typeof b.camera === 'string' ? file.presets?.find((p) => p.id === b.camera)?.camera : b.camera ?? c.state.camera;
    expect(camera, `${c.id}/${i + 1} camera`).toBeDefined();
    const cam = new PerspectiveCamera(camera!.fov ?? 35, 1600 / 900, 0.01, 4000);
    cam.position.set(...camera!.position); cam.lookAt(new Vector3(...camera!.target)); cam.updateMatrixWorld();
    const set = { ...c.state.sim?.set, ...b.sim?.set };
    for (const id of b.labels ?? c.state.labels ?? []) {
      const p = part(id);
      const anchor = new Vector3(...p.primitive!.at).add(new Vector3(...anchorPoint(p)));
      const phase = phaseControl.kind === 'step' ? PHASE_NAMES[Number(values(set).phase)]! : String(values(set).phase);
      const ndc = posedPoint(id, phase, anchor.toArray()).project(cam);
      if (Math.abs(ndc.x) > 1 || Math.abs(ndc.y) > 1 || ndc.z <= -1 || ndc.z >= 1) failures.push(`${c.id}/${i + 1}: ${id} NDC [${ndc.toArray().map((v) => v.toFixed(3)).join(', ')}]`);
    }
  }
  expect(failures).toEqual([]);
});


it('propellant flows require launch configuration and first-stage selection together', () => {
  for (const phase of phases) for (const stage of ['first', 'second', 'third']) {
    const fx = effects({ phase, 'stage-choice': stage });
    for (const id of ['fuel-feed', 'oxidiser-feed', 'exhaust-out']) expect(fx.flows.get(id)?.visible, `${phase}/${stage}/${id}`).toBe(phase === 'launch' && stage === 'first');
  }
});
