/**
 * The magnet kind of the try-it model (docs/22 §4.2–4.4): the push / pull
 * table, field states, the field-line solver (symmetry, where lines start and
 * end), iron-filings density, the compass bearing and its damped swing, the
 * paper-clip tables, bindings (ring, settle, tint, count, state) and the
 * validation rules, on a bench at the scale of docs/22 §3
 * (fixtures/magnet-bench.ts).
 */
import { describe, expect, it } from 'vitest';
import { benchContext, benchSim } from './fixtures/magnet-bench';
import { evaluateSim, compassPoint } from '../../src/engines/space-scene/lib/sim';
import { resolveSimValues } from '../../src/engines/space-scene/lib/sim/controls';
import { simEffects } from '../../src/engines/space-scene/lib/sim/bind';
import { bearingOf, earthField, fieldAt, magnetCharges, ringPoint, solveMagnets } from '../../src/engines/space-scene/lib/sim/magnet';
import { fieldLines, ironFilings, layFilings, linesPerMagnet, statePoles, traceFieldLines, type FilingsCard } from '../../src/engines/space-scene/lib/sim/field';
import { nearestTurn, stepSwing } from '../../src/engines/space-scene/lib/sim/settle';
import { arrowLength } from '../../src/engines/space-scene/stages/model3d/SimOverlays';
import { simIssues, simSchema, type SimData, type SimValues } from '../../src/engines/space-scene/sim-schema';
import { partsFile } from '../../src/engines/space-scene/schema';

const values = (set: SimValues) => resolveSimValues(benchSim, set);
const run = (set: SimValues, observe: string[] = []) => evaluateSim(benchSim, values(set), observe);
const num = (v: unknown) => v as number;
const issues = (sim: SimData, ctx = benchContext) => simIssues(sim, ctx as never).map((x) => `${x.path.join('.')}: ${x.message}`);
/** A copy of the bench with a change. */
const edit = (f: (raw: Record<string, any>) => void): SimData => {
  const raw = structuredClone(benchSim) as Record<string, any>;
  f(raw);
  return simSchema.parse(raw);
};
const near = (a: readonly number[], b: readonly number[], eps: number) => Math.hypot(a[0]! - b[0]!, a[1]! - b[1]!, a[2]! - b[2]!) < eps;

describe('push and pull (docs/22 §4.2 item 5, F-11)', () => {
  it('N–S pulls 12 / 41 / 100 % at 6 / 3 / 1.5 cm; N–N and S–S push as hard', () => {
    const pull = [6, 3, 1.5].map((gap) => Math.round(num(run({ gap, facing: 'ns' }).force)));
    expect(pull).toEqual([12, 41, 100]);
    for (const facing of ['nn', 'ss']) for (const gap of [6, 3, 1.5]) expect(num(run({ gap, facing }).force)).toBeCloseTo(-num(run({ gap, facing: 'ns' }).force), 6);
  });
});

describe('field states', () => {
  it('the first state whose `when` holds is on show; a state without `when` is the fallback', () => {
    expect(run({})['field-state']).toBe('ns-6');
    expect(run({ gap: 1.5 })['field-state']).toBe('ns-1.5');
    expect(run({ facing: 'ss', gap: 1.5 })['field-state']).toBe('ss-3');
    expect(run({ setup: 'electromagnet' })['field-state']).toBe('em-off');
    expect(run({ setup: 'electromagnet', 'em-switch': true, 'em-cells': 1 })['field-state']).toBe('em-on-1');
    expect(run({ setup: 'alone' })['field-state']).toBe('single');
    // With B off the bench the push / pull does not apply (`—`, no arrows).
    expect(Number.isNaN(num(run({ setup: 'alone' }).force))).toBe(true);
  });
  it('a state is worked out at the defaults ⊕ its `when` (B 6 cm away in ns-6, 1.5 cm in ns-1.5)', () => {
    const b = (state: string) => statePoles(benchSim, state).filter((p) => p.at[0] > -0.11);
    expect(b('ns-6').map((p) => p.at[0])).toEqual([0.042, -0.042]);
    expect(b('ns-1.5')[1]!.at[0]).toBeCloseTo(-0.087, 9);
    // Turned round: B's north faces A's north.
    expect(b('nn-3')[0]!.at[0]).toBeCloseTo(-0.072, 9);
  });
  it('an electromagnet is moment × cells while on, × its residual (0.15) while off', () => {
    const em = benchSim.magnet!.magnets.find((m) => m.id === 'em')!;
    const q = (set: SimValues) => magnetCharges(em, values(set))[0]!.q;
    expect(q({ 'em-switch': true, 'em-cells': 2 }) / q({ 'em-switch': true, 'em-cells': 1 })).toBeCloseTo(2, 9);
    expect(q({ 'em-switch': false }) / q({ 'em-switch': true, 'em-cells': 1 })).toBeCloseTo(0.15, 9);
  });
});

describe('field-line solver', () => {
  const lines = fieldLines(benchSim, 'single');
  const a = benchSim.magnet!.magnets[0]!;
  it('one bar magnet: 8 lines from the north pole, mirror-symmetric about the magnet axis', () => {
    expect(lines).toHaveLength(8);
    for (const l of lines) {
      const mirror = lines.find((m) => m.path.length === l.path.length && m.path.every((p, i) => near(p, [l.path[i]![0], p[1], -l.path[i]![2]], 1e-9)));
      expect(mirror, l.id).toBeDefined();
    }
  });
  it('lines start at the north pole, never cross the plane edge, and end at the south pole or on the edge', () => {
    const plane = benchSim.magnet!.plane!;
    for (const l of lines) {
      const [x0, , z0] = l.path[0]!;
      expect(Math.hypot(x0 - a.north[0], z0 - a.north[2])).toBeLessThan(0.01);
      for (const p of l.path) {
        expect(Math.abs(p[0] - plane.center[0])).toBeLessThanOrEqual(plane.size[0] / 2 + 1e-9);
        expect(Math.abs(p[2] - plane.center[2])).toBeLessThanOrEqual(plane.size[1] / 2 + 1e-9);
        // Drawn in the plane.
        expect(p[1]).toBeCloseTo(plane.center[1], 12);
      }
      const end = l.path[l.path.length - 1]!;
      const atSouth = Math.hypot(end[0] - a.south[0], end[2] - a.south[2]) < 0.01;
      const onEdge = Math.abs(Math.abs(end[0] - plane.center[0]) - plane.size[0] / 2) < 1e-6 || Math.abs(Math.abs(end[2] - plane.center[2]) - plane.size[1] / 2) < 1e-6;
      expect(atSouth || onEdge, l.id).toBe(true);
      expect(l.path.length).toBeLessThanOrEqual(120);
    }
    // The lines nearest the axis loop round to the south pole.
    expect(lines.filter((l) => Math.hypot(l.path.at(-1)![0] - a.south[0], l.path.at(-1)![2] - a.south[2]) < 0.01).length).toBeGreaterThanOrEqual(4);
  });
  it('the field: mirrored across the axis, null midway between facing north poles, strong between unlike ones', () => {
    const poles = statePoles(benchSim, 'single');
    const p = [-0.13, 0.012, 0.04];
    const b1 = fieldAt(poles, p);
    const b2 = fieldAt(poles, [p[0]!, p[1]!, -p[2]!]);
    expect(b2[0]).toBeCloseTo(b1[0], 15);
    expect(b2[2]).toBeCloseTo(-b1[2], 15);
    // nn-6: A's north at −0.118, B's at −0.042: the midpoint is a null point; ns-6 pulls along +X there.
    const mid = [-0.08, 0.005, 0];
    expect(Math.hypot(...fieldAt(statePoles(benchSim, 'nn-6'), mid))).toBeLessThan(1e-9);
    const ns = fieldAt(statePoles(benchSim, 'ns-6'), mid);
    expect(ns[0]).toBeGreaterThan(1e-4);
  });
  it('N–S: lines from A bridge the gap to B; N–N: no line crosses the midplane', () => {
    const ns = fieldLines(benchSim, 'ns-1.5');
    const bSouth = -0.042 - 0.045;
    expect(ns.some((l) => Math.abs(l.path.at(-1)![0] - bSouth) < 0.01 && l.path[0]![0] < -0.1)).toBe(true);
    // nn-1.5: the facing north poles at −0.118 and −0.087, the midplane between them at −0.1025.
    for (const l of fieldLines(benchSim, 'nn-1.5')) {
      const side = Math.sign(l.path[0]![0] - -0.1025);
      expect(l.path.every((p) => Math.sign(p[0] - -0.1025) === side || Math.abs(p[0] - -0.1025) < 1e-3)).toBe(true);
    }
  });
  it('a vertical plane traces the upright electromagnet; lines ∝ moment, at least one, at most 16 a state', () => {
    const on2 = fieldLines(benchSim, 'em-on-2');
    expect(on2).toHaveLength(12);
    expect(fieldLines(benchSim, 'em-on-1')).toHaveLength(6);
    expect(fieldLines(benchSim, 'em-off')).toHaveLength(1);
    // In the plane z = −0.05, rising from the north end (bottom) of the nail.
    for (const l of on2) for (const p of l.path) expect(p[2]).toBeCloseTo(-0.05, 12);
    expect(linesPerMagnet([1, 1, 1], 8)).toEqual([5, 5, 5]);
    expect(linesPerMagnet([0.01, 0], 8)).toEqual([1, 0]);
    expect(traceFieldLines([], [], { center: [0, 0, 0], size: [1, 1] })).toEqual([]);
  });
  it('is cached per loaded data and state', () => {
    expect(fieldLines(benchSim, 'single')).toBe(lines);
  });
});

describe('iron filings', () => {
  const card: FilingsCard = { at: [-0.11, 0.0118, 0], size: [0.36, 0.21], count: 2400, saturate: 0.002, exponent: 0.5 };
  const count = (list: { x: number; z: number }[], x: number, z: number, r: number) => list.filter((f) => Math.hypot(f.x + card.at[0]! - x, f.z - z) < r).length;
  it('crowd at the poles and thin out to the side of the middle (density ∝ (|B| ÷ saturate)^0.5)', () => {
    const single = ironFilings(benchSim, 'single', 'iron-filings', card);
    const a = benchSim.magnet!.magnets[0]!;
    const atN = count(single, a.north[0], 0, 0.02);
    const atS = count(single, a.south[0], 0, 0.02);
    const side = count(single, -0.16, 0.08, 0.02);
    expect(atN).toBeGreaterThan(2 * side);
    expect(atS).toBeGreaterThan(2 * side);
    expect(Math.abs(atN - atS)).toBeLessThan(0.25 * atN);
  });
  it('more with a stronger magnet: em on with 2 cells > 1 cell > off', () => {
    const em = (state: string) => ironFilings(benchSim, state, 'em-card', { ...card, at: [0.29, 0.0118, -0.05], size: [0.12, 0.12] }).length;
    expect(em('em-on-2')).toBeGreaterThan(em('em-on-1'));
    expect(em('em-on-1')).toBeGreaterThan(em('em-off'));
  });
  it('lie along the field in the card (a turned card too), within the budget and the card; at random without a state', () => {
    const turned: FilingsCard = { ...card, rotation: [0, 30, 0] };
    const poles = statePoles(benchSim, 'single');
    const list = layFilings(poles, turned);
    expect(list.length).toBeLessThanOrEqual(card.count);
    const c = Math.cos(Math.PI / 6);
    const s = Math.sin(Math.PI / 6);
    for (const f of list.slice(0, 200)) {
      expect(Math.abs(f.x)).toBeLessThanOrEqual(card.size[0] / 2);
      expect(Math.abs(f.z)).toBeLessThanOrEqual(card.size[1] / 2);
      // The needle's direction in the scene (card turned 30° about +Y) is parallel to B there (±0.1 rad jitter).
      const p = [card.at[0]! + c * f.x + s * f.z, card.at[1]!, card.at[2]! - s * f.x + c * f.z];
      const b = fieldAt(poles, p);
      const lx = Math.cos(f.angle);
      const lz = -Math.sin(f.angle);
      const dir = [c * lx + s * lz, -s * lx + c * lz];
      const h = Math.hypot(b[0], b[2]);
      expect(Math.abs(dir[0]! * b[2] - dir[1]! * b[0]) / h).toBeLessThan(0.11);
    }
    expect(ironFilings(benchSim, '', 'iron-filings', card).length).toBeGreaterThan(card.count * 0.4);
    expect(ironFilings(benchSim, 'single', 'iron-filings', card)).toBe(ironFilings(benchSim, 'single', 'iron-filings', card));
  });
});

describe('compass', () => {
  it('reads at the ring position of the `at` binding; positions run clockwise from the front', () => {
    const ring = benchSim.magnet!.rings!['compass-ring']!;
    expect(ringPoint(ring, 1)[2]).toBeCloseTo(0.085, 12);
    expect(ringPoint(ring, 3)[0]).toBeCloseTo(-0.245, 12);
    expect(compassPoint(benchSim, values({ 'compass-at': 7 }))![0]).toBeCloseTo(-0.075, 12);
  });
  it('points along the field: east beyond either end, west alongside, toward north with Earth alone', () => {
    const bearing = (k: number) => num(run({ setup: 'alone', 'compass-at': k })['needle-bearing']);
    // Beyond the north end (7) and beyond the south end (3) the needle lies along the axis, pointing +X;
    // alongside (1, 5) it points from the north end to the south end; Earth's 40 µT tilts it north.
    expect(bearing(7)).toBeGreaterThan(80);
    expect(bearing(7)).toBeLessThan(90);
    expect(bearing(3)).toBeCloseTo(bearing(7), 6);
    expect(bearing(1)).toBeGreaterThan(270);
    expect(bearing(1)).toBeLessThan(300);
    expect(bearing(5)).toBeCloseTo(bearing(1), 6);
    const earth = solveMagnets({ ...benchSim.magnet!, fields: { far: { magnets: ['em'], when: {} } } }, values({ 'em-switch': false }), [5, 0, 5]);
    expect(num(earth['needle-bearing'])).toBeLessThan(0.5);
    expect(bearingOf([1, 0, 0], earthField(benchSim.magnet!).north)).toBeCloseTo(90, 9);
    expect(bearingOf([-1, 0, 0], [0, 0, -1])).toBeCloseTo(270, 9);
  });
  it('swings past the field direction and settles on it within about 4 s (period 1.2 s, damping 0.3)', () => {
    const s = { x: 0, v: 0 };
    let peak = 0;
    let t = 0;
    while (stepSwing(s, 90, 1 / 60, { period: 1.2, damping: 0.3 }) && t < 10) {
      peak = Math.max(peak, s.x);
      t += 1 / 60;
    }
    expect(peak).toBeGreaterThan(100);
    expect(s.x).toBe(90);
    expect(t).toBeLessThan(4.5);
    // Settled: no more frames asked for.
    expect(stepSwing(s, 90, 1 / 60, { period: 1.2, damping: 0.3 })).toBe(false);
    expect(nearestTurn(350, 10)).toBe(370);
    expect(nearestTurn(10, 350)).toBe(-10);
  });
});

describe('paper clips (docs/22 §4.2 items 7–9)', () => {
  it('through 0–6 cards: 10 5 3 2 1 1 0; after 0/10/20/30 strokes: 0 2 4 6; electromagnet 3 / 6 on, 1 off', () => {
    expect([0, 1, 2, 3, 4, 5, 6].map((cards) => run({ cards })['clips-cards'])).toEqual([10, 5, 3, 2, 1, 1, 0]);
    expect([0, 10, 20, 30].map((strokes) => run({ strokes })['clips-stroke'])).toEqual([0, 2, 4, 6]);
    expect(run({ 'em-switch': true, 'em-cells': 1 })['clips-em']).toBe(3);
    expect(run({ 'em-switch': true, 'em-cells': 2 })['clips-em']).toBe(6);
    expect(run({ 'em-switch': false })['clips-em']).toBe(1);
  });
  it('`clips` is the clip count the card observes, NaN (shown —) elsewhere', () => {
    expect(run({ cards: 3 }, ['clips-cards']).clips).toBe(2);
    expect(run({ strokes: 20 }, ['force', 'clips-stroke']).clips).toBe(4);
    expect(Number.isNaN(num(run({}, ['force']).clips))).toBe(true);
  });
});

describe('magnet bindings', () => {
  const fx = (set: SimValues) => {
    const v = values(set);
    return simEffects(benchSim, v, evaluateSim(benchSim, v));
  };
  it('`at` moves the parts from the default ring position; `count: true` shows k copies; `tint` follows the switch', () => {
    const e = fx({ 'compass-at': 3 });
    const d = e.offset.get('compass-needle')!;
    expect(d[0]).toBeCloseTo(-0.085, 12);
    expect(d[2]).toBeCloseTo(-0.085, 12);
    expect(e.offset.get('compass-case')).toEqual(d);
    expect(fx({ cards: 2 }).count.get('clip-chain')).toBe(3);
    expect(fx({ 'em-switch': true }).tint.get('em-nail')).toEqual({ color: 'token:signal', level: 1 });
    expect(fx({}).tint.get('em-nail')!.level).toBe(0);
  });
  it('a settling turn carries its swing; the field state goes to the filings part and the field-line flow', () => {
    const e = fx({ setup: 'alone', 'compass-at': 7 });
    const turn = e.rotate.get('compass-needle')!;
    expect(turn.axis).toEqual([0, -1, 0]);
    expect(turn.settle).toEqual({ period: 1.2, damping: 0.3 });
    expect(turn.deg).toBeCloseTo(num(run({ setup: 'alone', 'compass-at': 7 })['needle-bearing']), 9);
    expect(e.states.get('iron-filings')).toBe('single');
    expect(e.flows.get('field-lines')!.state).toBe('single');
  });
  it('force arrows: length ∝ √|value|, capped', () => {
    expect(arrowLength(100, 0.04)).toBeCloseTo(0.04, 12);
    expect(arrowLength(-25, 0.04)).toBeCloseTo(0.02, 12);
    expect(arrowLength(1000, 0.04)).toBeCloseTo(0.064, 12);
  });
});

describe('magnet validation', () => {
  it('the bench is clean', () => {
    expect(issues(benchSim)).toEqual([]);
  });
  it('a compass bearing must turn clockwise seen from above', () => {
    const bad = edit((r) => (r.bind[2].rotate.axis = [0, 1, 0]));
    expect(issues(bad).join('\n')).toMatch(/clockwise seen from above/);
    const ok = edit((r) => {
      r.bind[2].rotate.axis = [0, 1, 0];
      r.bind[2].rotate.per = -1;
    });
    expect(issues(ok)).toEqual([]);
  });
  it('rings, states, flows, overlays and field states name things that exist', () => {
    expect(issues(edit((r) => (r.bind[1].at = 'nowhere'))).join('\n')).toMatch(/unknown ring "nowhere"/);
    expect(issues(edit((r) => (r.controls[3].values = [1, 2, 9]))).join('\n')).toMatch(/positions 1 … 8/);
    expect(issues(edit((r) => (r.bind[5].part = 'clip-chain'))).join('\n')).toMatch(/no `filings` primitive/);
    expect(issues(edit((r) => (r.bind[5].output = 'force'))).join('\n')).toMatch(/field-state output/);
    expect(issues(benchSim, { ...benchContext, flows: new Map([['field-lines', { own: true }]]) }).join('\n')).toMatch(/drop its `path`/);
    expect(issues(edit((r) => r.bind.splice(5, 1))).join('\n')).toMatch(/filings part "iron-filings" needs a `state` binding/);
    expect(issues(edit((r) => r.bind.splice(6, 1))).join('\n')).toMatch(/flow "field-lines" has no path/);
    expect(issues(edit((r) => (r.overlays[0].between = ['bar-magnet-n', 'ghost']))).join('\n')).toMatch(/unknown part "ghost"/);
    expect(issues(edit((r) => (r.overlays[0].output = 'field-state'))).join('\n')).toMatch(/is a state, not a number/);
    expect(issues(edit((r) => (r.magnet.fields['ns-6'].magnets = ['a', 'z']))).join('\n')).toMatch(/unknown magnet "z"/);
    expect(issues(edit((r) => (r.magnet.fields['ns-6'].when = { gap: 4 }))).join('\n')).toMatch(/4 is not a value of "gap"/);
    expect(issues(edit((r) => delete r.outputs[6].states.horseshoe)).join('\n')).toMatch(/no label for "horseshoe"/);
    expect(issues(edit((r) => (r.magnet.fields = { single: { magnets: ['a'] }, 'ns-6': { when: { gap: 6 } } }))).join('\n')).toMatch(/put it last/);
    expect(issues(edit((r) => delete r.magnet.plane)).join('\n')).toMatch(/give the state a `plane`/);
    expect(issues(edit((r) => (r.magnet.fields.single.plane = { center: [5, 5, 5], size: [0.1, 0.1] }))).join('\n')).toMatch(/no field line starts/);
    expect(issues(edit((r) => (r.bind[3].output = 'clips'))).join('\n')).toMatch(/`clips` is the PLATE reading/);
    expect(issues(edit((r) => (r.magnet.magnets[3].power.switch = 'gap'))).join('\n')).toMatch(/"gap" is not a toggle/);
    expect(issues(edit((r) => (r.bind = r.bind.filter((b: { at?: string }) => !b.at)))).join('\n')).toMatch(/needle-bearing needs `compass`/);
  });
  it('a step may run either way (6 → 3 → 1.5) but not back and forth', () => {
    expect(issues(edit((r) => (r.controls[1].values = [6, 3, 4]))).join('\n')).toMatch(/ascend or descend/);
  });
  it('filings: a magnet sim, the main primitive only, no repeat, no hand-made states; a field-line flow needs a magnet sim', () => {
    const part = (primitive: unknown, extra?: unknown[]) => ({
      id: 'card',
      name: { en: 'Card', zh: '卡' },
      group: 'g',
      summary: { en: 'Card', zh: '卡' },
      detail: { en: 'Card', zh: '卡' },
      primitive,
      ...(extra ? { extra } : {}),
    });
    const filings = { kind: 'filings', size: [0.3, 0.2], at: [0, 0, 0], color: 'powder' };
    const file = (parts: unknown[], flows: unknown[] = []) => partsFile.safeParse({ parts, groups: [{ id: 'g', name: { en: 'G', zh: 'G' }, color: 'token:neutral' }], flows, views: { assembled: { camera: { position: [1, 1, 1], target: [0, 0, 0], fov: 30 } } } });
    const messages = (r: ReturnType<typeof file>) => (r.success ? '' : r.error.issues.map((i) => i.message).join('\n'));
    expect(messages(file([part(filings)]))).toMatch(/filings need a magnet `sim`/);
    expect(messages(file([part({ kind: 'box', size: [1, 1, 1], at: [0, 0, 0], color: 'powder' }, [filings])]))).toMatch(/main `primitive`/);
    expect(messages(file([part({ ...filings, states: { single: [] } })]))).toMatch(/drop `states`/);
    expect(messages(file([part({ kind: 'box', size: [1, 1, 1], at: [0, 0, 0], color: 'powder' })], [{ id: 'f', group: 'g', speed: 1, color: 'token:cold' }]))).toMatch(/only a magnet sim's field-line flow/);
  });
});
