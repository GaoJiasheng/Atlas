/**
 * The shift binding (docs/38 §4.3 E-LT2): a vector output's `<part>:x|y|z`
 * becomes each part's offset, `<part>:shown` 0 hides it, parts the vector
 * does not name stay put; it adds to an `offset` binding; the move is an
 * eased arc whose middle is `lift` above the straight line; several parts
 * start one after another in the vector's order (hidden ones take no turn);
 * and the validation of the binding.
 */
import { describe, expect, it } from 'vitest';
import { shiftEntry, shiftOrder, simEffects } from '../../src/engines/space-scene/lib/sim/bind';
import { shiftDelays, shiftPoint } from '../../src/engines/space-scene/lib/sim/shift';
import { simIssues, simSchema, type SimData } from '../../src/engines/space-scene/sim-schema';
import type { Vec3 } from '../../src/engines/space-scene/lib/math';

const b = (en: string) => ({ en, zh: en });
/** A small sort sim (its `slots` vector); the tests hand simEffects the outputs directly. */
const sim = (bind: unknown[]): SimData =>
  simSchema.parse({
    kind: 'sort',
    controls: [{ id: 'tray', kind: 'choice', default: 'all', label: b('Tray'), options: [{ id: 'all', label: b('All') }, { id: 'one', label: b('One') }] }],
    outputs: [{ id: 'slots', kind: 'vector', from: 'slots', label: b('Slots') }, { id: 'n', from: 'count:tray', label: b('n') }],
    bind,
    sort: {
      groups: { thing: { label: b('Thing') } },
      questions: {},
      specimens: { car: { group: 'thing' }, rock: { group: 'thing' } },
      layouts: {},
      trays: { all: { specimens: '*' }, one: { specimens: ['car'] } },
    },
  });

describe('the shift vector', () => {
  const v = { 'car:x': 0.1, 'car:y': -0.01, 'car:z': 0.2, 'car:shown': 1, 'rock:x': 0, 'rock:y': 0, 'rock:z': 0, 'rock:shown': 0, 'pad-2a:x': 0.5 };
  it('reads each part\'s offset and whether it is shown; null for a part it does not name', () => {
    expect(shiftEntry(v, 'car')).toEqual({ offset: [0.1, -0.01, 0.2], shown: true });
    expect(shiftEntry(v, 'rock')).toEqual({ offset: [0, 0, 0], shown: false });
    expect(shiftEntry(v, 'pad-2a')).toEqual({ offset: [0.5, 0, 0], shown: true });
    expect(shiftEntry(v, 'tree')).toBeNull();
  });
  it('orders the parts as the vector names them (ids with dashes kept whole)', () => {
    expect([...shiftOrder(v)]).toEqual([['car', 0], ['rock', 1], ['pad-2a', 2]]);
  });
  it('becomes offsets and hides: simEffects', () => {
    const s = sim([{ output: 'slots', part: ['car', 'rock', 'tree'], shift: { ease: 0.5 } }]);
    const fx = simEffects(s, { k: 0 }, { slots: v, n: 0 });
    expect(fx.shift.get('car')).toEqual({ offset: [0.1, -0.01, 0.2], order: 0, ease: 0.5, stagger: 0.03, lift: 0.04 });
    expect(fx.hidden.has('rock')).toBe(true);
    expect(fx.shift.has('rock')).toBe(true);
    expect(fx.shift.has('tree')).toBe(false);
    expect(fx.hidden.has('tree')).toBe(false);
  });
  it('sits apart from (and so adds to) an offset binding on the same part', () => {
    const s = sim([
      { output: 'n', part: 'car', offset: { axis: [1, 0, 0], per: 1 } },
      { output: 'slots', part: ['car'], shift: {} },
    ]);
    const fx = simEffects(s, { k: 0 }, { slots: v, n: 0.3 });
    expect(fx.offset.get('car')).toEqual([0.3, 0, 0]);
    expect(fx.shift.get('car')!.offset).toEqual([0.1, -0.01, 0.2]);
  });
});

describe('the move', () => {
  const from: Vec3 = [0, 0, 0];
  const to: Vec3 = [0.4, 0.02, -0.2];
  const at = (t: number, lift = 0.04) => shiftPoint(from, to, t, lift, [0, 0, 0]);
  it('starts at from, ends at to, with no lift at either end', () => {
    expect(at(0)).toEqual([0, 0, 0]);
    expect(at(1)[0]).toBeCloseTo(0.4, 12);
    expect(at(1)[1]).toBeCloseTo(0.02, 12);
    expect(at(1)[2]).toBeCloseTo(-0.2, 12);
    expect(at(-1)).toEqual([0, 0, 0]);
    expect(at(2)[0]).toBeCloseTo(0.4, 12);
  });
  it('the middle of the arc is lift above the straight line', () => {
    const mid = at(0.5);
    expect(mid[0]).toBeCloseTo(0.2, 12);
    expect(mid[1]).toBeCloseTo(0.01 + 0.04, 12);
    expect(at(0.5, 0)[1]).toBeCloseTo(0.01, 12);
  });
  it('eases in and out (slow at the ends)', () => {
    expect(at(0.1)[0]).toBeLessThan(0.04);
    expect(at(0.9)[0]).toBeGreaterThan(0.36);
  });
  it('staggers the parts that move, in vector order; hidden ones wait no turn', () => {
    const move = (offset: Vec3, order: number) => ({ offset, order, ease: 0.8, stagger: 0.03, lift: 0.04 });
    const prev = new Map<string, Vec3>([['a', [0, 0, 0]], ['b', [0, 0, 0]], ['c', [0, 0, 0]], ['d', [1, 0, 0]]]);
    const next = new Map([['c', move([0.2, 0, 0], 2)], ['a', move([0.1, 0, 0], 0)], ['b', move([0, 0, 0], 1)], ['d', move([1, 0, 0], 3)], ['e', move([0.3, 0, 0], 4)]]);
    const delays = shiftDelays(prev, next, new Set(['e']));
    expect([...delays]).toEqual([['a', 0], ['c', 0.03]]);
    // A part new to the vector moves too.
    expect(shiftDelays(new Map(), next, new Set()).get('e')).toBeCloseTo(0.12, 12);
    // A jump (deep link) has nothing to stagger against once it is there.
    expect(shiftDelays(new Map([...next].map(([id, s]) => [id, s.offset])), next, new Set()).size).toBe(0);
  });
});

describe('validation', () => {
  const ctx = { parts: new Set(['car', 'rock', 'bench']), flows: new Map(), animations: new Map(), poses: new Set<string>(), countable: new Set<string>(), contextParts: new Set(['bench']) };
  const of = (bind: unknown[]) => simIssues(sim(bind), ctx).map((x) => x.message);
  it('needs a vector output', () => {
    expect(of([{ output: 'n', part: 'car', shift: {} }])).toContainEqual('shift needs a vector output (an offset per part), "n" is a number');
    expect(of([{ control: 'k', part: 'car', shift: {} }])).toContainEqual('shift needs a vector output (an offset per part)');
  });
  it('no context part, one shift per part, not with place', () => {
    expect(of([{ output: 'slots', part: ['bench'], shift: {} }])).toContainEqual('"bench" is a context part (never moved)');
    expect(of([{ output: 'slots', part: ['car'], shift: {} }, { output: 'slots', part: ['car'], shift: {} }])).toContainEqual('"car" has a shift already');
    expect(of([{ output: 'slots', part: ['car'], place: { centre: [0, 0, 0], radius: 1 } }, { output: 'slots', part: ['car'], shift: {} }])).toContainEqual('"car" is placed on a sphere (`place`): no shift');
  });
  it('a clean binding', () => {
    expect(of([{ output: 'slots', part: ['car', 'rock'], shift: { ease: 0.8, stagger: 0.03, lift: 0.04 } }]).filter((m) => m.includes('shift'))).toEqual([]);
  });
});
