/**
 * Magnets that ride on parts (lib/sim/carrier.ts, lib/sim/frame.ts): a
 * magnet's `part` carries its poles wherever the pose on show and the try-it
 * bindings put that part, so the force, the compass, the field lines and the
 * iron filings follow it (docs/22 §11 known gap, fixed); and the try-it tint
 * reaches only the part's own material slot (lib/sim/bind.ts `slotTint`).
 */
import { describe, expect, it } from 'vitest';
import { Matrix4, Vector3, Euler } from 'three';
import { benchContext, benchSim } from './fixtures/magnet-bench';
import { evaluateSim } from '../../src/engines/space-scene/lib/sim';
import { resolveSimValues } from '../../src/engines/space-scene/lib/sim/controls';
import { slotTint } from '../../src/engines/space-scene/lib/sim/bind';
import { evaluateSimOnStage, magnetFrames, type CarrierSource } from '../../src/engines/space-scene/lib/sim/carrier';
import { applyFrame, partFrame } from '../../src/engines/space-scene/lib/sim/frame';
import { fieldLines, ironFilings, statePoles, type FilingsCard } from '../../src/engines/space-scene/lib/sim/field';
import { magnetPoles } from '../../src/engines/space-scene/lib/sim/magnet';
import { toTransform } from '../../src/engines/space-scene/lib/pose';
import { simIssues, simSchema, type SimData, type SimValues } from '../../src/engines/space-scene/sim-schema';

const label = (en: string) => ({ en, zh: en });
const near = (a: readonly number[], b: readonly number[], eps = 1e-9) => Math.hypot(a[0]! - b[0]!, a[1]! - b[1]!, a[2]! - b[2]!) < eps;
const num = (v: unknown) => v as number;

/** A copy of the bench with a change. */
const edit = (f: (raw: Record<string, any>) => void): SimData => {
  const raw = structuredClone(benchSim) as Record<string, any>;
  f(raw);
  return simSchema.parse(raw);
};

/** A rides on bar-magnet-n, B on bar-magnet-b (B's gap offset and turn are its own `move` / `flip`). */
const rider = edit((r) => {
  r.magnet.magnets[0].part = 'bar-magnet-n';
  r.magnet.magnets[1].part = 'bar-magnet-b';
  r.bind.push({ control: 'facing', part: 'bar-magnet-b', pose: { ns: null, nn: 'b-flipped', ss: 'b-flipped' } });
});

/** The rider plus a hanging A (docs/06 「悬挂磁铁」): a pose to the thread and a 90° turn about it. */
const hanging = edit((r) => {
  r.magnet.magnets[0].part = 'bar-magnet-n';
  r.controls.push({ id: 'hang', kind: 'toggle', label: label('Hang'), default: false });
  r.bind.push(
    { control: 'hang', part: 'bar-magnet-n', pose: { true: 'suspended' } },
    { control: 'hang', part: 'bar-magnet-n', rotate: { axis: [0, 1, 0], per: 90, pivot: [0.095, 0.155, -0.18] } },
  );
});

const source: CarrierSource = {
  parts: [
    { id: 'bar-magnet-n', primitive: { at: [-0.16, 0.005, 0] } },
    { id: 'bar-magnet-b', primitive: { at: [0, 0.005, 0] } },
  ],
  poses: {
    tray: { parts: { 'bar-magnet-n': { offset: [0.24, 0.06, 0.1] } } },
    'b-up': { parts: { 'bar-magnet-b': { offset: [0, 0.1, 0] } } },
    'b-flipped': { parts: { 'bar-magnet-b': { pivot: [0, 0.005, 0], rotation: [0, 180, 0] } } },
    suspended: { parts: { 'bar-magnet-n': { offset: [0.255, 0.15, -0.18] } } },
  },
};

const values = (sim: SimData, set: SimValues) => resolveSimValues(sim, set);
const stage = (sim: SimData, set: SimValues, pose: string | null = null) => evaluateSimOnStage(sim, source, values(sim, set), pose);

describe('a part frame is the stage transform (PartNode: pose about its pivot → turn → offset)', () => {
  it('matches the three.js stack for a pose with pivot, rotation, scale and offset, turned about a pivot and about the posed centre', () => {
    const centre = [0.1, 0.02, -0.05] as const;
    const pose = toTransform({ pivot: [0.12, 0, -0.04], rotation: [20, -35, 60], scale: [1, 1.2, 0.9], offset: [0.01, 0.03, -0.02] });
    for (const pivot of [[0.2, 0.15, -0.1] as [number, number, number], undefined]) {
      const turn = { axis: [0, 0.6, 0.8] as [number, number, number], deg: 47, ...(pivot ? { pivot } : {}) };
      const move = [0.004, -0.01, 0.02] as const;
      // PartNode: a group at the centre; pr.matrix = T(move) · about c: R(turn) · P, P = T(offset) · about pv: R · S.
      const P = new Matrix4().makeTranslation(pose.offset[0], pose.offset[1], pose.offset[2]);
      const pv = new Vector3(pose.pivot![0] - centre[0], pose.pivot![1] - centre[1], pose.pivot![2] - centre[2]);
      const rs = new Matrix4().makeRotationFromEuler(new Euler((pose.rotation[0] * Math.PI) / 180, (pose.rotation[1] * Math.PI) / 180, (pose.rotation[2] * Math.PI) / 180, 'XYZ')).scale(new Vector3(...pose.scale));
      P.multiply(new Matrix4().makeTranslation(pv.x, pv.y, pv.z)).multiply(rs).multiply(new Matrix4().makeTranslation(-pv.x, -pv.y, -pv.z));
      const e = P.elements;
      const c = pivot ? new Vector3(pivot[0] - centre[0], pivot[1] - centre[1], pivot[2] - centre[2]) : new Vector3(e[12], e[13], e[14]);
      const M = new Matrix4().makeTranslation(move[0], move[1], move[2]);
      const R = new Matrix4().makeRotationAxis(new Vector3(...turn.axis).normalize(), (turn.deg * Math.PI) / 180);
      M.multiply(new Matrix4().makeTranslation(c.x, c.y, c.z)).multiply(R).multiply(new Matrix4().makeTranslation(-c.x, -c.y, -c.z)).multiply(P);
      const f = partFrame(centre, pose, move, turn);
      for (const p of [[0, 0, 0], [0.13, 0.04, -0.07], [-0.2, 0.1, 0.3]]) {
        const local = new Vector3(p[0]! - centre[0], p[1]! - centre[1], p[2]! - centre[2]).applyMatrix4(M);
        expect(near(applyFrame(f, p), [local.x + centre[0], local.y + centre[1], local.z + centre[2]], 1e-12)).toBe(true);
      }
    }
  });
});

describe('magnets ride on their parts (docs/22 §11)', () => {
  it('without `part` nothing moves: the outputs are the plain model\'s', () => {
    expect(magnetFrames(benchSim, source, values(benchSim, {}), 'tray').size).toBe(0);
    const set = { setup: 'alone', 'compass-at': 3 };
    expect(stage(benchSim, set, 'tray').outputs).toEqual(evaluateSim(benchSim, values(benchSim, set)));
  });

  it('a chapter / beat pose carries the poles with the part', () => {
    const frames = stage(rider, {}, 'tray').frames;
    const a = rider.magnet!.magnets[0]!;
    const [n, s] = magnetPoles(a, values(rider, {}), frames.get('a'));
    expect(near(n!.at, [-0.118 + 0.24, 0.065, 0.1])).toBe(true);
    expect(near(s!.at, [-0.202 + 0.24, 0.065, 0.1])).toBe(true);
    // The field state's poles follow; at rest they stay where the data puts them.
    expect(near(statePoles(rider, 'single', frames)[0]!.at, n!.at)).toBe(true);
    expect(near(statePoles(rider, 'single')[0]!.at, [-0.118, 0.005, 0])).toBe(true);
  });

  it('the force and the compass are read where the magnets are', () => {
    const rest = num(stage(rider, { gap: 3 }).outputs.force);
    const away = num(stage(rider, { gap: 3 }, 'tray').outputs.force);
    expect(rest).toBeCloseTo(num(evaluateSim(benchSim, values(benchSim, { gap: 3 })).force), 9);
    expect(Math.abs(away)).toBeLessThan(Math.abs(rest) / 5);
    // A carried away: the needle swings back toward model north (0°).
    const offNorth = (b: unknown) => Math.min(num(b), 360 - num(b));
    const before = stage(rider, { setup: 'alone', 'compass-at': 1 }).outputs['needle-bearing'];
    const after = stage(rider, { setup: 'alone', 'compass-at': 1 }, 'tray').outputs['needle-bearing'];
    expect(offNorth(after)).toBeLessThan(offNorth(before) / 2);
  });

  it('bindings of the magnet\'s own `move` / `flip` controls are left to the model (no double move or turn)', () => {
    for (const set of [{ gap: 1.5 }, { facing: 'nn', gap: 3 }, { facing: 'ss', gap: 6 }] as SimValues[]) {
      const { frames, outputs } = stage(rider, set);
      expect(frames.has('b')).toBe(false);
      expect(num(outputs.force)).toBeCloseTo(num(evaluateSim(benchSim, values(benchSim, set)).force), 9);
    }
    // B has a try-it pose binding, so (like the stage) the chapter pose does not move it.
    expect(stage(rider, {}, 'b-up').frames.has('b')).toBe(false);
  });

  it('an unmapped pose binding inherits the chapter pose, while explicit null forces rest', () => {
    const inherited = stage(hanging, { hang: false }, 'tray').frames.get('a')!;
    expect(near(applyFrame(inherited, [-0.16, 0.005, 0]), [0.08, 0.065, 0.1])).toBe(true);
    const explicitRest = edit((r) => {
      Object.assign(r, structuredClone(hanging));
      const binds = r.bind as { control?: string; pose?: Record<string, string | null> }[];
      binds.find((b) => b.control === 'hang' && b.pose)!.pose!.false = null;
    });
    expect(stage(explicitRest, { hang: false }, 'tray').frames.has('a')).toBe(false);
  });

  it('a hung magnet turns about its thread: north settles toward model north (−Z)', () => {
    const { frames } = stage(hanging, { hang: true });
    const [n, s] = magnetPoles(hanging.magnet!.magnets[0]!, values(hanging, { hang: true }), frames.get('a'));
    expect(near(n!.at, [0.095, 0.155, -0.18 - 0.042])).toBe(true);
    expect(near(s!.at, [0.095, 0.155, -0.18 + 0.042])).toBe(true);
    // The turn is the target, not the swing: the frame does not change while the part settles.
    expect(stage(hanging, { hang: false }).frames.size).toBe(0);
  });
});

describe('field lines and filings follow the magnets', () => {
  const card: FilingsCard = { at: [-0.16, 0.0108, 0], size: [0.297, 0.21], count: 2400, saturate: 0.002, exponent: 0.5 };

  it('lines are traced from the moved poles; a lone magnet takes its plane along, turned with it', () => {
    const { frames } = stage(hanging, { setup: 'alone', hang: true });
    const lines = fieldLines(hanging, 'single', frames);
    const rest = fieldLines(hanging, 'single');
    expect(lines.length).toBe(rest.length);
    expect(lines).not.toBe(rest);
    // The bench plane (y 0.012) moved up with the magnet; the lines leave its north pole, now on the −Z side.
    for (const l of lines) for (const p of l.path) expect(p[1]).toBeCloseTo(0.162, 9);
    for (const l of lines) expect(Math.hypot(l.path[0]![0] - 0.095, l.path[0]![2] - (-0.222))).toBeLessThan(0.01);
    // The rectangle turned with it: its long side (0.36) now runs along Z, so the lines spread wider than the 0.21 it had there.
    const zs = lines.flatMap((l) => l.path.map((p) => p[2]));
    expect(Math.max(...zs) - Math.min(...zs)).toBeGreaterThan(0.22);
  });

  it('two magnets moved apart keep the plane where it is', () => {
    const { frames } = stage(rider, { gap: 3 }, 'tray');
    for (const l of fieldLines(rider, 'ns-3', frames)) for (const p of l.path) expect(p[1]).toBeCloseTo(0.012, 9);
  });

  it('each place is laid out once (cached), a new place again', () => {
    const at = (set: SimValues) => stage(hanging, { setup: 'alone', ...set }).frames;
    expect(fieldLines(hanging, 'single', at({ hang: true }))).toBe(fieldLines(hanging, 'single', at({ hang: true })));
    expect(fieldLines(hanging, 'single', at({}))).toBe(fieldLines(hanging, 'single'));
    expect(ironFilings(hanging, 'single', 'iron-filings', card, at({ hang: true }))).toBe(ironFilings(hanging, 'single', 'iron-filings', card, at({ hang: true })));
    expect(ironFilings(hanging, '', 'iron-filings', card)).toBe(ironFilings(hanging, '', 'iron-filings', card));
  });

  it('filings thin out under a magnet lifted off the card', () => {
    const lifted = ironFilings(hanging, 'single', 'iron-filings', card, stage(hanging, { setup: 'alone', hang: true }).frames);
    const onCard = ironFilings(hanging, 'single', 'iron-filings', card);
    expect(lifted.length).toBeLessThan(onCard.length / 2);
  });
});

describe('magnet `part` validation', () => {
  const ctx0 = { ...benchContext, poses: new Set(['b-flipped']) };
  const issues = (sim: SimData, ctx: object = ctx0) => simIssues(sim, ctx as never).map((x) => `${x.path.join('.')}: ${x.message}`).join('\n');
  it('names a primitive part', () => {
    expect(issues(rider)).toBe('');
    expect(issues(edit((r) => (r.magnet.magnets[0].part = 'ghost')))).toMatch(/magnets\.0\.part: unknown part "ghost"/);
    expect(issues(rider, { ...ctx0, primitives: new Set(['bar-magnet-b']) })).toMatch(/"bar-magnet-n" has no `primitive`/);
  });
});

describe('try-it tint: only the part\'s own material (PartNode slots)', () => {
  it('slot 0 takes the try-it tint while bound; the other slots keep the highlight', () => {
    const hi = { level: 0.55, color: 'signal' };
    const sim = { level: 0.3, color: 'iron' };
    expect([0, 1, 2].map((i) => slotTint(i, hi, sim))).toEqual([sim, hi, hi]);
    expect([0, 1, 2].map((i) => slotTint(i, hi, null))).toEqual([hi, hi, hi]);
    // Unlit (switch off, level 0) is still the bound slot's: the core goes back to steel, the rest keep theirs.
    expect(slotTint(0, 0.55, 0)).toBe(0);
    expect(slotTint(1, 0.55, 0)).toBe(0.55);
  });
});
