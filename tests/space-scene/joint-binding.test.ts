/** Numeric overrides reuse the existing rig path (docs/57 §4 E-BJ2). */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parse as parseYaml } from 'yaml';
import { Object3D, Quaternion, Vector3 } from 'three';
import { partsFile, spaceChapterIssues, spaceChapterState, spaceSceneData } from '../../src/engines/space-scene/schema';
import { simEffects } from '../../src/engines/space-scene/lib/sim/bind';
import { evaluateSim } from '../../src/engines/space-scene/lib/sim';
import { resolveSimValues } from '../../src/engines/space-scene/lib/sim/controls';
import { overrideJoints } from '../../src/engines/space-scene/lib/sim/joints';
import { anglesQuat, foldAngles, type Angles } from '../../src/engines/space-scene/lib/rig';
import type { SimValues } from '../../src/engines/space-scene/sim-schema';

const raw = () => JSON.parse(readFileSync('src/content/topics/sample-joint/data/parts.json', 'utf8'));
const file = partsFile.parse(raw());
const sim = file.sim!;
const values = (v: SimValues = {}) => resolveSimValues(sim, { mode: 'lever', ...v });
const fx = (v: SimValues = {}) => { const x = values(v); return simEffects(sim, x, evaluateSim(sim, x)); };
const errors = (mutate: (d: ReturnType<typeof raw>) => void) => { const d = raw(); mutate(d); const r = partsFile.safeParse(d); return r.success ? [] : r.error.issues.map((x) => x.message); };

describe('numeric joint bindings', () => {
  it('keeps the draft fixture sources and chapter indices valid', () => {
    const sources = JSON.parse(readFileSync('src/content/topics/sample-joint/data/sources.json', 'utf8'));
    const data = spaceSceneData.parse({ parts: raw(), sources });
    for (const name of ['00-before-you-start', '01-lever', '02-named-pose']) {
      const text = readFileSync(`src/content/topics/sample-joint/chapters/${name}.mdx`, 'utf8');
      const chapter = parseYaml(text.split('---')[1]!);
      expect(spaceChapterIssues(spaceChapterState.parse(chapter.state), data)).toEqual([]);
    }
  });
  it('uses every one of the 24 finite table combinations with correct static results', () => {
    expect(sim.kind).toBe('table');
    expect(sim.table!.experiments.lever!.rows).toHaveLength(24);
    for (const angle of [30, 60, 90, 120]) for (const load of [0, 10, 20]) for (const length of [0.15, 0.3]) {
      const v = values({ 'elbow-angle': angle, 'load-force': load, 'load-distance': length });
      const o = evaluateSim(sim, v);
      expect(Object.values(o).every((n) => typeof n === 'number' && Number.isFinite(n))).toBe(true);
      expect(o['load-arm']).toBeCloseTo(length * Math.abs(Math.sin(angle * Math.PI / 180)), 10);
      expect(o['muscle-force']).toBeCloseTo(load * length * Math.abs(Math.sin(angle * Math.PI / 180)) / 0.04, 9);
      expect(Math.abs(o.residual as number)).toBeLessThanOrEqual(1e-10);
      expect(simEffects(sim, v, o).joints.get('elbow.l')).toEqual({ flexion: angle });
    }
    expect(evaluateSim(sim, values())['muscle-force']).toBeCloseTo(150, 9);
  });
  it('preserves unbound movements and the other side without mutating a named pose', () => {
    const baseline = new Map<string, Angles>([['elbow.l', { flexion: 30, pronation: 20 }], ['elbow.r', { flexion: 25 }], ['shoulder.l', { abduction: 10 }]]);
    const merged = overrideJoints(baseline, fx().joints);
    expect(merged.get('elbow.l')).toEqual({ flexion: 90, pronation: 20 });
    expect(merged.get('elbow.r')).toEqual({ flexion: 25 });
    expect(merged.get('shoulder.l')).toEqual({ abduction: 10 });
    expect(baseline.get('elbow.l')).toEqual({ flexion: 30, pronation: 20 });
    expect(fx().joints.has('elbow.r')).toBe(false);
  });
  it('inactive guard and nonfinite values restore the chapter pose instead of forcing zero', () => {
    const base = new Map<string, Angles>(Object.entries(file.poses!.baseline!.joints));
    for (const bad of [NaN, Infinity, -Infinity, 181, 'inactive']) {
      const out = simEffects(sim, values(), { angle: bad });
      expect(out.joints.size).toBe(0);
      expect(overrideJoints(base, out.joints)).toEqual(base);
    }
    expect(overrideJoints(base, fx({ mode: 'explore' }).joints)).toEqual(base);
    expect(overrideJoints(base, fx({ 'elbow-angle': 120 }).joints).get('elbow.l')!.flexion).toBe(120);
    expect(overrideJoints(base, fx({ mode: 'explore' }).joints).get('elbow.l')!.flexion).toBe(30);
  });
  it('applies origin and per to numeric step controls, accepts multiple distinct movements', () => {
    const d = raw();
    d.rig.joints['elbow.l'].axes.pronation = [0, 1, 0];
    d.sim.bind = [{ control: 'elbow-angle', joint: 'elbow.l', movement: 'flexion', angle: { origin: 30, per: .5 } }, { control: 'elbow-angle', joint: 'elbow.l', movement: 'pronation', angle: { per: .25 } }];
    const s = partsFile.parse(d).sim!;
    expect(simEffects(s, values(), {}).joints.get('elbow.l')).toEqual({ flexion: 30, pronation: 22.5 });
  });
  it('gives the same deep-chain endpoint and rotation as the matching named pose', () => {
    const baseline = new Map<string, Angles>(Object.entries(file.poses!.baseline!.joints));
    const named = new Map<string, Angles>(Object.entries(file.poses!['named-ninety']!.joints));
    const driven = overrideJoints(baseline, fx().joints);
    // Parent shoulder, elbow, forearm, hand and a distal point: no part rotations.
    const endpoint = (pose: ReadonlyMap<string, Angles>) => {
      const shoulder = new Object3D(); shoulder.rotation.y = .3;
      const elbow = new Object3D(); elbow.position.set(0, -.3, 0); shoulder.add(elbow);
      const forearm = new Object3D(); forearm.position.set(0, -.02, 0); elbow.add(forearm);
      const hand = new Object3D(); hand.position.set(0, -.25, 0); forearm.add(hand);
      const tip = new Object3D(); tip.position.set(0, -.15, 0); hand.add(tip);
      elbow.quaternion.fromArray(anglesQuat({ flexion: [1, 0, 0] }, foldAngles({ flexion: [1, 0, 0] }, pose.get('elbow.l') ?? {})));
      forearm.quaternion.fromArray(anglesQuat({ pronation: [0, -1, 0] }, foldAngles({ pronation: [0, -1, 0] }, pose.get('forearm.l') ?? {})));
      shoulder.updateMatrixWorld(true);
      return { p: tip.getWorldPosition(new Vector3()), q: tip.getWorldQuaternion(new Quaternion()) };
    };
    const a = endpoint(driven), b = endpoint(named), rest = endpoint(baseline);
    expect(a.p.distanceTo(b.p)).toBeLessThan(1e-6);
    expect(a.q.angleTo(b.q)).toBeLessThan(1e-6);
    expect(a.p.distanceTo(rest.p)).toBeGreaterThan(.1);
  });
});

describe('joint schema checks', () => {
  it.each([
    ['unknown joint', (d: ReturnType<typeof raw>) => { d.sim.bind[0].joint = 'unknown.l'; }],
    ['already has a joint animation', (d: ReturnType<typeof raw>) => { d.animations.push({ id: 'curl', kind: 'sequence', target: 'joint:elbow.l', loop: true, keys: [{ t: 0, angles: { flexion: 0 } }, { t: 1, angles: { flexion: 60 } }] }); }],
    ['no axis', (d: ReturnType<typeof raw>) => { d.sim.bind[0].movement = 'abduction'; }],
    ['duplicate joint', (d: ReturnType<typeof raw>) => { d.sim.bind.push(d.sim.bind[0]); }],
    ['numeric step', (d: ReturnType<typeof raw>) => { delete d.sim.bind[0].output; d.sim.bind[0].control = 'mode'; }],
    ['number output', (d: ReturnType<typeof raw>) => { d.sim.outputs[0] = { id: 'angle', kind: 'state', label: { en: 'State', zh: '状态' }, states: { rest: { en: 'Rest', zh: '静止' } } }; for (const row of d.sim.table.experiments.lever.rows) row.set.angle = 'rest'; }],
    ['-180..180', (d: ReturnType<typeof raw>) => { d.sim.bind[0].angle.per = 2; }],
    ['unknown control', (d: ReturnType<typeof raw>) => { d.sim.bind[0].when.control = 'missing'; }],
    ['exactly one', (d: ReturnType<typeof raw>) => { d.sim.bind[0].when.output = 'angle'; }],
    ['not a value', (d: ReturnType<typeof raw>) => { d.sim.bind[0].when.is.eq = 'missing'; }],
  ])('rejects %s', (match, mutate) => { expect(errors(mutate).join(';')).toContain(match); });
  it('refuses mixed targets, nonfinite coefficients, and zero per', () => {
    for (const key of ['part', 'flow', 'animation']) expect(errors((d) => { d.sim.bind[0][key] = 'radius-l'; }).length).toBeGreaterThan(0);
    for (const per of [0, NaN, Infinity]) expect(errors((d) => { d.sim.bind[0].angle.per = per; }).length).toBeGreaterThan(0);
    expect(errors((d) => { delete d.sim.bind[0].output; }).join(';')).toContain('exactly one');
  });
  it('rejects an active exercise on the same joint and permits inactive exploration', () => {
    const data = { parts: file, training: { exercises: ['curl'] }, fitness: { exercises: [{ id: 'curl', motion: { keys: [{ joints: { 'elbow.l': { flexion: 30 } } }] } }] } };
    for (const mode of ['lever', 'explore']) {
      const state = spaceChapterState.parse({ exercise: { id: 'curl' }, sim: { set: { mode } } });
      const e = spaceChapterIssues(state, data as never);
      expect(e.some((x) => x.includes('active sim binding'))).toBe(mode === 'lever');
    }
  });
});
