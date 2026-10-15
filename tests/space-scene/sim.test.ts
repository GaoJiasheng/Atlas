/**
 * Try-it simulation (docs/22 §4.3, docs/23 §4): the circuit solver against the
 * spec's §1.3 table (3 significant figures), every switch combination against
 * hand reasoning, the control resolution and URL codec, bindings, the fair-test
 * table and the magnet stub.
 */
import { describe, expect, it } from 'vitest';
import { solveCircuit, solveLinear } from '../../src/engines/space-scene/lib/sim/circuit';
import { evaluateSim } from '../../src/engines/space-scene/lib/sim';
import {
  decodeSimParam,
  encodeSimParam,
  resolveSimValues,
  setSimControl,
  stepValue,
} from '../../src/engines/space-scene/lib/sim/controls';
import { holds, simEffects } from '../../src/engines/space-scene/lib/sim/bind';
import { outcomeOf, recordRow, MAX_TABLE_ROWS } from '../../src/engines/space-scene/lib/sim/trial';
import { solveMagnets } from '../../src/engines/space-scene/lib/sim/magnet';
import { simIssues, simSchema, chapterSimIssues, type SimValues } from '../../src/engines/space-scene/sim-schema';
import { boardSim } from './fixtures/board-circuit';
import { diagramEdges, diagramJunctions, polylinePath, SYMBOL_LENGTH } from '../../src/engines/space-scene/lib/sim/diagram';
import { particlesPerPath } from '../../src/engines/space-scene/lib/flow-curve';
import { helixBox, helixPoint, latheArcStart, latheProfileClosed } from '../../src/engines/space-scene/lib/shaped';
import { flowSchema, partsFile, primitiveSchema } from '../../src/engines/space-scene/schema';
import { readFileSync } from 'node:fs';
import { groupScaleBar } from '../../src/engines/space-scene/lib/units';
import { resolveAllPartDisplays } from '../../src/engines/space-scene/lib/visibility';
import { decodeSceneState, encodeSceneState } from '../../src/engines/core/url-state';

/** Outputs for the board with these values set on top of the defaults. */
const run = (set: SimValues) => evaluateSim(boardSim, resolveSimValues(boardSim, set));
const sig3 = (x: number) => Number(x.toPrecision(3));
const num = (v: unknown) => v as number;

describe('circuit solver: docs/23 §1.3 table', () => {
  const rows: [string, SimValues, { i: number; a: number; b?: number; status?: string }][] = [
    ['1 cell, one bulb', { cells: 1 }, { i: 0.118, a: 26 }],
    ['2 cells, one bulb (reference)', {}, { i: 0.233, a: 100, status: 'closed' }],
    ['3 cells, one bulb', { cells: 3 }, { i: 0.346, a: 220, status: 'over-rating' }],
    ['3 cells, one reversed', { cells: 3, 'flip-2': true }, { i: 0.115, a: 24 }],
    ['2 cells, two in series', { arrangement: 'series' }, { i: 0.118, a: 26, b: 26 }],
    ['1 cell, two in series', { arrangement: 'series', cells: 1 }, { i: 0.0595, a: 7, b: 7 }],
    ['2 cells, two in parallel', { arrangement: 'parallel' }, { i: 0.454, a: 95, b: 95 }],
    ['pencil lead in the gap', { gap: 'pencil-lead' }, { i: 0.0913, a: 15 }],
    ['insulator in the gap', { gap: 'plastic-straw' }, { i: 0, a: 0, status: 'open' }],
    ['switch open', { main: false }, { i: 0, a: 0, status: 'open' }],
    ['bulb unscrewed', { 'bulb-a-in': false }, { i: 0, a: 0, status: 'open' }],
  ];
  for (const [name, set, want] of rows) {
    it(name, () => {
      const o = run(set);
      expect(sig3(num(o['i-cells']))).toBe(want.i);
      expect(Math.round(num(o['bright-a']))).toBe(want.a);
      if (want.b !== undefined) expect(Math.round(num(o['bright-b']))).toBe(want.b);
      if (want.status) expect(o.status).toBe(want.status);
    });
  }

  it('series: the same current through both bulbs (current is not used up)', () => {
    const o = run({ arrangement: 'series' });
    expect(sig3(num(o['i-a']))).toBe(0.118);
    expect(num(o['i-a'])).toBeCloseTo(num(o['i-b']), 12);
    expect(num(o['i-a'])).toBeCloseTo(num(o['i-cells']), 12);
  });

  it('parallel: each branch about half of what the cells give', () => {
    const o = run({ arrangement: 'parallel' });
    expect(sig3(num(o['i-a']))).toBe(0.227);
    expect(num(o['i-a']) + num(o['i-b'])).toBeCloseTo(num(o['i-cells']), 9);
  });

  it('short circuit: all three link switches closed', () => {
    const o = run({ arrangement: 'free', x: true, y: true, z: true });
    expect(o.status).toBe('short');
    expect(sig3(num(o['i-cells']))).toBe(8.45);
    expect(Math.round(num(o['bright-a']))).toBe(0);
    expect(Math.round(num(o['bright-b']))).toBe(0);
  });

  it('motor and buzzer at A', () => {
    const m = run({ 'load-a': 'motor' });
    expect(sig3(num(m['i-cells']))).toBe(0.472);
    expect(num(m['motor-speed'])).toBeCloseTo((40 * 0.4722 * 6) / 3, 1);
    expect(m['bright-a']).toBe(0);
    const b = run({ 'load-a': 'buzzer' });
    expect(sig3(num(b['i-cells']))).toBe(0.0299);
    expect(b.buzz).toBe('on');
    expect(run({}).buzz).toBe('off');
  });

  it('terminal voltage: EMF less the drop in the cells', () => {
    expect(sig3(num(run({}).volts))).toBe(2.93);
    expect(sig3(num(run({ main: false }).volts))).toBe(3);
  });

  it('the torch is its own loop', () => {
    expect(num(run({})['bright-torch'])).toBe(0);
    expect(Math.round(num(run({ 'torch-switch': true })['bright-torch']))).toBe(100);
    // The board does not notice the torch.
    expect(num(run({ 'torch-switch': true })['i-cells'])).toBeCloseTo(num(run({})['i-cells']), 12);
  });

  it('current leaves the positive end: direction round the loop', () => {
    const edges = run({})['edge-currents'] as Record<string, number>;
    for (const id of ['cells', 'main', 'gap', 'a', 'z', 'ret']) expect(edges[id]).toBeGreaterThan(0.2);
    expect(edges.x).toBe(0);
    expect(edges.b).toBe(0);
  });
});

describe('circuit solver: every link-switch combination', () => {
  // Expected lamps from the topology (A: n1→n2, X: n2→n3, B: n3→n4, Y: n1→n3, Z: n2→n4).
  const lit = (x: boolean, y: boolean, z: boolean): [boolean, boolean] => {
    if (x && y && z) return [false, false]; // short
    if (x && z) return [true, false]; // B bypassed
    if (x && y) return [false, true]; // A bypassed
    if (y && z) return [true, true]; // parallel
    if (x) return [true, true]; // series
    if (z) return [true, false]; // A only
    if (y) return [false, true]; // B only (A's far end, n2, goes nowhere)
    return [false, false];
  };
  for (const main of [true, false])
    for (const x of [false, true])
      for (const y of [false, true])
        for (const z of [false, true])
          for (const pull of ['none', 'a', 'b'] as const) {
            it(`main ${main} x ${x} y ${y} z ${z} pulled ${pull}`, () => {
              const o = run({ arrangement: 'free', main, x, y, z, 'bulb-a-in': pull !== 'a', 'bulb-b-in': pull !== 'b' });
              let [a, b] = main ? lit(x, y, z) : [false, false];
              // A bulb taken out breaks its own path; recompute what still has one.
              if (main && pull !== 'none') {
                const short = x && y && z;
                if (short) [a, b] = [false, false];
                else if (pull === 'a') {
                  // Without A: n1 reaches n3 only through Y; B lights if Y and the path n3→n4 is B (and not bypassed by X+Z).
                  a = false;
                  b = y && !(x && z);
                } else {
                  b = false;
                  // Without B: A lights through Z, or through X then … (n3 dead end) no.
                  a = z && !(y && x);
                }
              }
              expect(num(o['bright-a']) > 1, 'A').toBe(a);
              expect(num(o['bright-b']) > 1, 'B').toBe(b);
            });
          }
});

describe('linear solve', () => {
  it('solves with pivoting and leaves singular rows at 0', () => {
    expect(solveLinear([[0, 1], [1, 0]], [2, 3])).toEqual([3, 2]);
    expect(solveLinear([[0, 0], [0, 1]], [0, 4])).toEqual([0, 4]);
  });
  it('a floating piece without a battery carries nothing', () => {
    const r = solveCircuit(boardSim.circuit!, resolveSimValues(boardSim, { main: false, arrangement: 'parallel' }));
    expect(Object.values(r.edges).filter((i, k) => Object.keys(r.edges)[k]!.startsWith('t-') === false).every((i) => i === 0)).toBe(true);
  });
});

describe('controls', () => {
  it('a choice sets the controls it covers', () => {
    const v = resolveSimValues(boardSim, { arrangement: 'series' });
    expect([v.x, v.y, v.z]).toEqual([true, false, false]);
    expect(resolveSimValues(boardSim, {}).arrangement).toBe('single');
  });
  it('hand-set link switches move the choice to free, keeping the others where they were', () => {
    const set = setSimControl(boardSim, { arrangement: 'series' }, 'z', true);
    const v = resolveSimValues(boardSim, set);
    expect(v.arrangement).toBe('free');
    expect([v.x, v.y, v.z]).toEqual([true, false, true]);
  });
  it('free stays free; a named option that no longer holds gives way to one that does', () => {
    let set = setSimControl(boardSim, {}, 'arrangement', 'free');
    set = setSimControl(boardSim, set, 'z', false);
    set = setSimControl(boardSim, set, 'x', true);
    expect(resolveSimValues(boardSim, set).arrangement).toBe('free');
    set = setSimControl(boardSim, set, 'arrangement', 'parallel');
    let v = resolveSimValues(boardSim, set);
    expect([v.x, v.y, v.z]).toEqual([false, true, true]);
    set = setSimControl(boardSim, set, 'y', false);
    v = resolveSimValues(boardSim, set);
    expect([v.arrangement, v.x, v.y, v.z]).toEqual(['single', false, false, true]);
  });
  it('free keeps the switches as they are', () => {
    const set = setSimControl(boardSim, { arrangement: 'parallel' }, 'arrangement', 'free');
    const v = resolveSimValues(boardSim, set);
    expect([v.arrangement, v.x, v.y, v.z]).toEqual(['free', false, true, true]);
  });
  it('a chapter set wins over the choice for what it names', () => {
    const v = resolveSimValues(boardSim, { arrangement: 'free', x: true, y: true, z: true });
    expect([v.arrangement, v.x, v.y, v.z]).toEqual(['free', true, true, true]);
  });
  it('invalid values are ignored', () => {
    const v = resolveSimValues(boardSim, { cells: 7, gap: 'gold', nope: true });
    expect([v.cells, v.gap]).toEqual([2, 'link']);
    expect('nope' in v).toBe(false);
  });
  it('steps through values and options, holding at the ends', () => {
    const cells = boardSim.controls.find((c) => c.id === 'cells')!;
    expect(stepValue(cells, 2, 1)).toBe(3);
    expect(stepValue(cells, 3, 1)).toBe(3);
    expect(stepValue(cells, 1, -1)).toBe(1);
    const gap = boardSim.controls.find((c) => c.id === 'gap')!;
    expect(stepValue(gap, 'link', 1)).toBe('paper-clip');
    const main = boardSim.controls.find((c) => c.id === 'main')!;
    expect(stepValue(main, true, -1)).toBe(false);
  });
  it('URL codec round-trips', () => {
    const v: SimValues = { cells: 3, gap: 'pencil-lead', x: true, main: false };
    const s = encodeSimParam(v);
    expect(s).toBe('cells.3~gap.pencil-lead~main.off~x.on');
    expect(decodeSimParam(s)).toEqual(v);
    expect(decodeSimParam('bad~.x~a.B~k.1.5')).toEqual({ k: 1.5 });
    expect(encodeSimParam({})).toBe('');
  });
});

describe('bindings', () => {
  const sim = simSchema.parse({
    ...boardSim,
    bind: [
      { control: 'cells', part: 'cell-3', visible: { gte: 3 } },
      { output: 'bright-a', part: 'filament-a', glow: { color: 'token:lamp', full: 100 } },
      { control: 'gap', part: 'pencil-lead', pose: { 'pencil-lead': 'pencil-in-gap' } },
      { output: 'edge-currents', flow: 'current', intensity: { full: 0.25 } },
      { output: 'status', flow: 'current', stops: { short: 'token:hot' } },
      { output: 'motor-speed', animation: 'fan-spin', rpm: {} },
      { output: 'buzz', animation: 'buzzer-pulse', enabled: true },
    ],
  });
  const fx = (set: SimValues) => {
    const values = resolveSimValues(sim, set);
    return simEffects(sim, values, evaluateSim(sim, values));
  };
  it('visibility, pose, glow', () => {
    expect(fx({}).hidden.has('cell-3')).toBe(true);
    expect(fx({ cells: 3 }).hidden.has('cell-3')).toBe(false);
    expect(fx({ gap: 'pencil-lead' }).poses.get('pencil-lead')).toBe('pencil-in-gap');
    expect(fx({}).poses.get('pencil-lead')).toBeNull();
    expect(fx({}).glow.get('filament-a')!.level).toBeCloseTo(1, 2);
    expect(fx({ cells: 1 }).glow.get('filament-a')!.level).toBeCloseTo(Math.sqrt(0.2563), 3);
    expect(fx({ main: false }).glow.get('filament-a')!.level).toBe(0);
  });
  it('flows: per-path intensity, direction, a hot short', () => {
    const f = fx({}).flows.get('current')!;
    expect(f.paths!.a).toBeCloseTo(0.2334 / 0.25, 3);
    expect(f.paths!.x).toBe(0);
    expect(f.color).toBeNull();
    expect(fx({ arrangement: 'free', x: true, y: true, z: true }).flows.get('current')!.color).toBe('token:hot');
  });
  it('animations: speed and on / off', () => {
    expect(fx({ 'load-a': 'motor' }).animations.get('fan-spin')!.rpm).toBeGreaterThan(30);
    expect(fx({}).animations.get('fan-spin')!.rpm).toBe(0);
    expect(fx({ 'load-a': 'buzzer' }).animations.get('buzzer-pulse')!.enabled).toBe(true);
    expect(fx({}).animations.get('buzzer-pulse')!.enabled).toBe(false);
  });
  it('conditions', () => {
    expect(holds(true, 'on', 'off')).toBe(true);
    expect(holds(true, 'off', 'off')).toBe(false);
    expect(holds({ in: [1, 2] }, 2)).toBe(true);
    expect(holds({ lte: 2 }, 3)).toBe(false);
    expect(holds({ ne: 'link' }, 'empty')).toBe(true);
  });
});

describe('fair test', () => {
  it('records a row per varied value, the same value overwriting', () => {
    let rows = recordRow([], { vary: 1, values: { a: 26 } });
    rows = recordRow(rows, { vary: 2, values: { a: 100 } });
    rows = recordRow(rows, { vary: 1, values: { a: 25 } });
    expect(rows.map((r) => [r.vary, r.values.a])).toEqual([
      [1, 25],
      [2, 100],
    ]);
    for (let i = 0; i < 20; i++) rows = recordRow(rows, { vary: 10 + i, values: {} });
    expect(rows).toHaveLength(MAX_TABLE_ROWS);
  });
  it('says what was observed', () => {
    expect(outcomeOf(100, 0)).toBe('zero');
    expect(outcomeOf(100, 97)).toBe('same');
    expect(outcomeOf(26, 100)).toBe('more');
    expect(outcomeOf(100, 26)).toBe('less');
    expect(outcomeOf(41, -41)).toBe('negative');
    expect(outcomeOf(0, 0)).toBe('same');
  });
});

describe('validation', () => {
  const ctx = {
    parts: new Set(['cell-3', 'filament-a']),
    flows: new Map([['current', { paths: [{ id: 'a' }, { id: 'nope' }] }]]),
    animations: new Map([['fan-spin', { kind: 'pulse', target: 'motor-fan' }]]),
    poses: new Set<string>(),
    countable: new Set<string>(),
  };
  it('the board sim is clean', () => {
    expect(simIssues(boardSim, { ...ctx, flows: new Map(), animations: new Map() })).toEqual([]);
  });
  it('reports what does not exist or fit', () => {
    const bad = simSchema.parse({
      ...boardSim,
      bind: [
        { control: 'cells', part: 'cell-9', visible: { gte: 3 } },
        { output: 'edge-currents', flow: 'current', intensity: { full: 0.25 } },
        { output: 'motor-speed', animation: 'fan-spin', rpm: {} },
        { output: 'status', part: 'filament-a', glow: { color: 'token:lamp', full: 1 } },
        { control: 'gap', part: 'cell-3', pose: { gold: null } },
      ],
    });
    const msgs = simIssues(bad, ctx).map((x) => x.message);
    expect(msgs).toContain('unknown part "cell-9"');
    expect(msgs).toContain('path "nope" of flow "current" is not a circuit edge');
    expect(msgs).toContain('"fan-spin" is a pulse animation (rpm turns a rotate)');
    expect(msgs.some((m) => m.includes('need a number'))).toBe(true);
    expect(msgs).toContain('"gold" is not a value of "gap"');
  });
  it('checks a default against its choice', () => {
    const bad = simSchema.parse({
      ...boardSim,
      controls: boardSim.controls.map((c) => (c.id === 'z' ? { ...c, default: false } : c)),
    });
    expect(simIssues(bad, { ...ctx, flows: new Map(), animations: new Map() }).map((x) => x.message)).toContain(
      'option "single" sets z = true, but z defaults to false',
    );
  });
  it('checks a chapter sim', () => {
    expect(chapterSimIssues('state.', { set: { cells: 5, bogus: true }, try: { vary: 'cells', observe: ['nope'] } }, boardSim)).toEqual([
      'state.sim.set: 5 is not a value of "cells"',
      'state.sim.set: unknown control "bogus"',
      'state.sim.try.observe: unknown output "nope"',
    ]);
    expect(chapterSimIssues('state.', { set: {} }, undefined)).toEqual(['state.sim: parts.json has no `sim`']);
  });
});

describe('magnet stub', () => {
  const m = simSchema.parse({
    kind: 'magnet',
    controls: [
      { id: 'gap', kind: 'step', values: [6, 3, 1.5], default: 6, label: { en: 'Gap', zh: '间隙' } },
      { id: 'facing', kind: 'choice', default: 'ns', label: { en: 'Facing', zh: '相对' }, options: [{ id: 'ns', label: { en: 'N–S', zh: '北南' } }, { id: 'nn', label: { en: 'N–N', zh: '北北' } }] },
      { id: 'cards', kind: 'step', values: [0, 1, 2, 3, 4, 5, 6], default: 0, label: { en: 'Cards', zh: '卡片' } },
    ],
    outputs: [{ id: 'force', label: { en: 'Pull', zh: '吸' }, unit: '%' }],
    magnet: {
      magnets: [
        // A: north at its right end facing B.
        { id: 'a', north: [-0.0092, 0, 0], south: [-0.0908, 0, 0] },
        // B: south at its left end facing A; gap in cm moves it along +x.
        { id: 'b', north: [0.0908, 0, 0], south: [0.0092, 0, 0], move: { control: 'gap', axis: [1, 0, 0], per: 0.01, origin: 0 }, flip: { control: 'facing', when: ['nn'] } },
      ],
      reference: 1.5,
      clips: { cards: 'cards' },
    },
  }).magnet!;
  it('pulls when opposite poles face, pushes when alike, weaker further apart', () => {
    const near = solveMagnets(m, { gap: 1.5, facing: 'ns', cards: 0 });
    const far = solveMagnets(m, { gap: 6, facing: 'ns', cards: 0 });
    const push = solveMagnets(m, { gap: 1.5, facing: 'nn', cards: 0 });
    expect(near.force).toBeCloseTo(100, 6);
    expect(far.force as number).toBeGreaterThan(0);
    expect(far.force as number).toBeLessThan(near.force as number);
    expect(push.force as number).toBeLessThan(0);
    expect(push.facing).toBe('same');
  });
  it('clips through cards: 10 5 3 2 1 1 0', () => {
    expect([0, 1, 2, 3, 4, 5, 6].map((n) => solveMagnets(m, { cards: n })['clips-cards'])).toEqual([10, 5, 3, 2, 1, 1, 0]);
  });
});

describe('circuit diagram layout', () => {
  const c = simSchema.parse({
    ...boardSim,
    circuit: {
      ...boardSim.circuit,
      nodes: { ...boardSim.circuit!.nodes, bn: { d: [100, 0] }, bp: { d: [0, 0] }, s1: { d: [0, 50] }, n1: { d: [40, 50] } },
      edges: boardSim.circuit!.edges.map((e) => (e.id === 'main' ? { ...e, via: [] } : e.id === 'gap' ? { ...e, via: [] } : e)),
      diagram: { size: [100, 60] },
    },
  }).circuit!;
  it('draws only edges with both ends placed, the symbol on the longest run with a gap in the wire', () => {
    const edges = diagramEdges(c);
    expect(edges.map((e) => e.edge.id).sort()).toEqual(['cells', 'gap', 'main']);
    const cells = edges.find((e) => e.edge.id === 'cells')!;
    expect(cells.at).toEqual([50, 0]);
    expect(cells.dir).toEqual([-1, 0]);
    expect(cells.wires).toHaveLength(2);
    expect(cells.wires[0]!.at(-1)).toEqual([50 + SYMBOL_LENGTH / 2, 0]);
    expect(polylinePath([[0, 0], [10, 5.555]])).toBe('M0 0L10 5.56');
  });
  it('junction dots where three drawn wires meet', () => {
    expect(diagramJunctions(c)).toEqual([]);
  });
});

describe('multi-path flows and shaped primitives', () => {
  it('spreads particles over paths by length, at least 4 each, keeping the total', () => {
    const n = particlesPerPath([1, 3, 0.001], 100);
    expect(n.reduce((a, b) => a + b, 0)).toBe(100);
    expect(n[2]).toBe(4);
    expect(n[1]).toBeGreaterThan(n[0]!);
  });
  it('closed lathe profiles: on the axis, or a ring', () => {
    expect(latheProfileClosed([[0, 0], [1, 0], [0, 1]])).toBe(true);
    expect(latheProfileClosed([[1, 0], [2, 0], [2, 1], [1, 1], [1, 0]])).toBe(true);
    expect(latheProfileClosed([[1, 0], [2, 1]])).toBe(false);
    expect(latheArcStart(180)).toBeCloseTo(Math.PI / 2, 9);
  });
  it('coil centre line and box', () => {
    const p = { kind: 'coil', radius: [0.006, 0.003], wire: 0.0004, turns: 5, length: 0.008, at: [0, 0, 0], color: 'steel' } as const;
    expect(helixPoint(p as never, 0)).toEqual([0, -0.004, 0.006]);
    expect(helixPoint(p as never, 1)[1]).toBeCloseTo(0.004, 9);
    expect(helixBox(p as never).max[0]).toBeCloseTo(0.0064, 9);
  });
  it('a coil whose turns would overlap is refused', () => {
    expect(() => primitiveSchema.parse({ kind: 'coil', radius: 0.005, wire: 0.001, turns: 10, length: 0.01, at: [0, 0, 0], color: 'steel' })).toThrow(/overlap/);
  });
  it('a flow takes path or paths (not both), and a multi-path flow keeps its first path as `path`', () => {
    const f = flowSchema.parse({ id: 'f', group: 'g', paths: [{ id: 'a', path: [[0, 0, 0], [1, 0, 0]] }], speed: 1, color: 'token:current' });
    expect(f.path).toEqual([[0, 0, 0], [1, 0, 0]]);
    const both = { id: 'f', group: 'g', path: [[0, 0, 0], [1, 0, 0]], paths: [{ id: 'a', path: [[0, 0, 0], [1, 0, 0]] }], speed: 1, color: 'token:current' };
    expect(() => flowSchema.parse(both)).toThrow(/not both/);
    // Neither: a field-line flow (the parts file then needs a magnet sim's `state` binding, magnet-field.test.ts).
    expect(flowSchema.parse({ id: 'f', group: 'g', speed: 1, color: 'token:current' }).path).toEqual([]);
  });
});

describe('URL `sim`', () => {
  it('round-trips through the scene query string and drops it at the chapter baseline', () => {
    const q = encodeSceneState({ chapter: 'a', sim: { cells: 3, x: true } }, { chapter: 'a', sim: {} });
    expect(q).toEqual([
      ['ch', 'a'],
      ['sim', 'cells.3~x.on'],
    ]);
    expect(decodeSceneState('ch=a&sim=cells.3~x.on').sim).toEqual({ cells: 3, x: true });
    expect(encodeSceneState({ chapter: 'a', sim: { cells: 1 } }, { chapter: 'a', sim: { cells: 1 } })).toEqual([['ch', 'a']]);
  });
});

describe('the circuits topic data (src/content/topics/circuits/data/parts.json)', () => {
  const file = partsFile.parse(JSON.parse(readFileSync(new URL('../../src/content/topics/circuits/data/parts.json', import.meta.url), 'utf8')));
  const sim = file.sim!;
  const out = (set: SimValues) => evaluateSim(sim, resolveSimValues(sim, set));
  it('starts with the copper wire across the gap and reproduces the docs/23 §1.3 readings', () => {
    expect(resolveSimValues(sim, {}).gap).toBe('copper-wire');
    const rows: [SimValues, number, number][] = [
      [{}, 0.233, 100],
      [{ cells: 1 }, 0.118, 26],
      [{ cells: 3 }, 0.346, 220],
      [{ cells: 3, 'flip-2': true }, 0.115, 24],
      [{ arrangement: 'series' }, 0.118, 26],
      [{ arrangement: 'parallel' }, 0.454, 95],
      [{ gap: 'pencil-lead' }, 0.0913, 15],
      [{ gap: 'rubber-band' }, 0, 0],
    ];
    for (const [set, i, a] of rows) {
      const o = out(set);
      expect(sig3(num(o['i-cells'])), JSON.stringify(set)).toBe(i);
      expect(Math.round(num(o['bright-a'])), JSON.stringify(set)).toBe(a);
    }
    expect(sig3(num(out({ arrangement: 'free', x: true, y: true, z: true })['i-cells']))).toBe(8.24);
    expect(Math.round(num(out({ 'torch-switch': true })['bright-torch']))).toBe(100);
  });
  it('every circuit edge has a flow path and the diagram places the board and the torch', () => {
    const flow = file.flows.find((f) => f.paths)!;
    expect(flow.paths!.map((p) => p.id).sort()).toEqual(sim.circuit!.edges.map((e) => e.id).sort());
    expect(diagramEdges(sim.circuit!)).toHaveLength(sim.circuit!.edges.length);
  });
});

describe('plant-topic helpers: group scale bar, custom tints', () => {
  it('a magnified group gets a round real length near 100 px', () => {
    // 1 scene unit = 1 m (no units); 1000 px per scene unit at the group's depth; drawn 20× life size.
    const bar = groupScaleBar(1000, undefined, { unit: 'mm', magnification: 20 })!;
    expect(bar.label).toBe('5 MM · ×20');
    expect(bar.px).toBeCloseTo(100, 6);
    expect(groupScaleBar(1000, { modelUnit: 'mm', scale: 1 }, { unit: 'mm', magnification: 1 })!.label).toBe('0.1 MM');
    expect(groupScaleBar(0, undefined, { unit: 'cm', magnification: 1 })).toBeNull();
  });
  it('custom highlight colours a part or its group', () => {
    const parts = [
      { id: 'leaf', group: 'shoot' },
      { id: 'root', group: 'roots' },
    ];
    const d = resolveAllPartDisplays(parts, { view: 'assembled', part: null, layers: ['shoot', 'roots'], highlight: { signal: [], cold: [], custom: { leaf: 'token:food', roots: '#334455' } } });
    expect([d.get('leaf')!.tint, d.get('leaf')!.tintRef]).toEqual(['custom', 'token:food']);
    expect(d.get('root')!.tintRef).toBe('#334455');
  });
});
