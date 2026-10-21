/**
 * The two net task kinds (docs/39 §3.5, lib/net-tasks.ts) and the rules
 * around them: complete-net — where a face may go (free paper, next to a
 * face, a list), placing and taking away, at most `add`, checked by folding
 * the child's net, solved, its samples read; tap-face — the face opposite
 * the one given, a box's bottom, a neighbour diagnosed; numbers about a net;
 * the ways a nets task asks; validate's net rules (a layout that cannot
 * fold flat, faces that do not meet, a curved solid in a net task, a wrong
 * claim about folding); the scale of a transition holds after its first
 * 30 % (no shake) and fits every state between.
 */
import { describe, expect, it } from 'vitest';
import { taskSchema, type NetSpec, type SolidSpec, type Task, type TaskOf } from '../../src/engines/math-scene/schema';
import { candidatesOf, checkNetModel, childSpec, completeSolution, foldedOf, netWay, tapAnswer } from '../../src/engines/math-scene/lib/net-tasks';
import { check } from '../../src/engines/math-scene/lib/check';
import { apply, sampleState, solve } from '../../src/engines/math-scene/lib/solve';
import { initialState, reduce } from '../../src/engines/math-scene/lib/state';
import { proveTask } from '../../src/engines/math-scene/lib/proof';
import { netModelIssues, netTaskIssues } from '../../src/engines/math-scene/validate-nets';
import { fitIn, mixPose, poseBounds, shapeOf, specPose, transitionBounds, transitionFit } from '../../src/engines/math-scene/lib/net-view';

const CUBE: SolidSpec = { type: 'cuboid', size: [1, 1, 1] };
const ROW: [number, number][] = [[0, 1], [1, 1], [2, 1], [3, 1]];
const words = (s: string) => ({ en: s, zh: s });
const base = (id: string) => ({ id, prompt: words('p'), guide: words('g'), hints: [words('h')], feedback: { correct: words('any one of them'), fallback: words('f'), reveal: words('r'), wrong: [] as unknown[] } });
const parse = (t: Record<string, unknown>): Task => taskSchema.parse(t);
const net = (layout: NetSpec['layout'], extra: Record<string, unknown> = {}, solid: SolidSpec = CUBE) => ({ kind: 'net', solid, layout, fold: 0, ...extra });

describe('complete-net', () => {
  const adjacent = parse({ ...base('a'), kind: 'complete-net', model: net({ cells: [...ROW, [1, 2]] }), add: 1, candidates: 'adjacent', box: [6, 5] }) as TaskOf<'complete-net'>;
  it('offers the empty squares next to a face, and only those', () => {
    const keys = candidatesOf(adjacent, []).map((c) => c.key);
    expect(keys).toContain('1,0');
    expect(keys).toContain('4,1');
    expect(keys).not.toContain('5,4');
    expect(keys).not.toContain('1,1');
  });
  it('places a face, takes it away again, never more than add', () => {
    let s = initialState(adjacent);
    s = reduce(adjacent, s, { do: 'nplace', key: '1,0' });
    expect(s.nplaced).toEqual(['1,0']);
    expect(reduce(adjacent, s, { do: 'nplace', key: '2,0' }).nplaced).toEqual(['1,0']);
    expect(reduce(adjacent, s, { do: 'nplace', key: '1,0' }).nplaced).toEqual([]);
    expect(reduce(adjacent, s, { do: 'clear' }).nplaced).toEqual([]);
  });
  it('is checked by folding: any place that closes is right; two on one face is overlap-unseen', () => {
    for (const k of ['0,0', '1,0', '2,0', '3,0']) expect(check(adjacent, { ...initialState(adjacent), nplaced: [k] }).ok, k).toBe(true);
    expect(checkNetModel(adjacent, { nplaced: ['2,2'], ntapped: null }, ['overlap-unseen'])).toEqual({ ok: false, code: 'overlap-unseen' });
    expect(checkNetModel(adjacent, { nplaced: ['2,2'], ntapped: null }, [])).toEqual({ ok: false, code: null });
  });
  it('free paper: the solution is a cube net holding the square given', () => {
    const free = parse({ ...base('b'), kind: 'complete-net', model: net({ cells: [[2, 2]] }), add: 5, candidates: 'free', box: [6, 5] }) as TaskOf<'complete-net'>;
    const sol = completeSolution(free)!;
    expect(sol).toHaveLength(5);
    expect(foldedOf(childSpec(free, sol)!).closes).toBe(true);
    expect(check(free, apply(free, solve(free))).ok).toBe(true);
  });
  it('a list of rectangles: the right one closes, a short one is face-size; samples by index', () => {
    const tall: SolidSpec = { type: 'cuboid', size: [2, 2, 3] };
    const t = parse({
      ...base('c'),
      kind: 'complete-net',
      model: net({ rects: [[0, 2, 2, 3], [2, 2, 2, 3], [4, 2, 2, 3], [6, 2, 2, 3], [2, 0, 2, 2]] }, {}, tall),
      add: 1,
      candidates: [[4, 5, 2, 2], [4, 5, 2, 1], [0, 0, 2, 2]],
      feedback: { ...base('c').feedback, wrong: [{ when: 'face-size', say: words('s'), sample: 'rects:1' }, { when: 'overlap-unseen', say: words('o'), sample: 'rects:2' }] },
    }) as TaskOf<'complete-net'>;
    expect(completeSolution(t)).toEqual(['0']);
    expect(proveTask(t)).toEqual([]);
    expect(sampleState(t, 'rects:1')!.nplaced).toEqual(['1']);
  });
});

describe('tap-face', () => {
  it('the opposite face of the one given; a neighbour is adjacent-as-opposite', () => {
    const t = parse({
      ...base('d'),
      kind: 'tap-face',
      model: net({ cubeNet: '141-d' }, { mark: '[1,1]' }),
      ask: 'opposite',
      feedback: { ...base('d').feedback, wrong: [{ when: 'adjacent-as-opposite', say: words('a'), sample: 'face:2,1' }] },
    }) as TaskOf<'tap-face'>;
    const a = tapAnswer(t)!;
    expect(sampleState(t, 'face:3,1')!.ntapped).toBe(a);
    expect(proveTask(t)).toEqual([]);
    // The face given cannot be tapped.
    expect(reduce(t, initialState(t), { do: 'ntap', node: 1 }).ntapped).toBeNull();
  });
  it('a box with no lid: the bottom is opposite the open face, at an end of the row or in the middle', () => {
    const end = parse({ ...base('e'), kind: 'tap-face', model: net({ cells: [...ROW, [0, 0]] }, { base: [0, 0], open: 'top' }), ask: 'bottom' }) as TaskOf<'tap-face'>;
    expect(tapAnswer(end)).toBe(4);
    const middle = parse({ ...base('f'), kind: 'tap-face', model: net({ cells: [...ROW, [1, 0]] }, { base: [1, 1], open: 'top' }), ask: 'bottom' }) as TaskOf<'tap-face'>;
    expect(tapAnswer(middle)).toBe(1);
  });
});

describe('the ways a nets task asks (the practice counts them)', () => {
  it('names each way', () => {
    const t = (o: Record<string, unknown>) => netWay(parse({ ...base('g'), model: net({ cubeNet: '141-e' }), ...o }));
    expect(t({ kind: 'complete-net', add: 1, candidates: 'free', box: [6, 5], model: net({ cells: ROW.slice(0, 1) }) })).toBe('complete-net:free');
    expect(t({ kind: 'tap-face', ask: 'bottom' })).toBe('tap-face:bottom');
    expect(t({ kind: 'choose', options: [{ id: 'a', correct: true, solid: 'cube' }, { id: 'b', correct: false, solid: 'cuboid' }] })).toBe('choose:name');
    expect(t({ kind: 'choose', options: [{ id: 'a', correct: true, folds: true }, { id: 'b', correct: false, folds: false }] })).toBe('choose:folds');
  });
});

describe('validate (nets)', () => {
  it('refuses a layout that overlaps flat, faces that do not meet, a net in two pieces', () => {
    expect(netModelIssues(parse({ ...base('h'), kind: 'tap-face', ask: 'opposite', model: net({ cells: [[0, 0], [0, 0], [1, 0], [2, 0], [3, 0], [1, 1]] }) }).model as never).join()).toMatch(/twice|over each other/);
    const prism: SolidSpec = { type: 'prism', sides: 3, edge: 2, length: 3 };
    expect(netModelIssues({ kind: 'net', solid: prism, layout: { tree: [['end-a', null], ['end-b', 'end-a']] }, stagger: true, view: 'auto', turn: 0 }).join()).toMatch(/do not share an edge/);
    expect(netModelIssues({ kind: 'net', solid: CUBE, layout: { cells: [[0, 0], [2, 0]] }, stagger: true, view: 'auto', turn: 0 }).join()).toMatch(/more than one piece/);
  });
  it('a cylinder is only recognised: no complete-net, no tap-face', () => {
    const t = parse({ ...base('i'), kind: 'tap-face', ask: 'bottom', model: { kind: 'net', solid: { type: 'cylinder', radius: 1, height: 2 }, curved: {}, fold: 0 } });
    expect(netTaskIssues(t, undefined).errors.join()).toMatch(/only recognised/);
  });
  it('checks a "does it fold" option against folding', () => {
    const t = parse({ ...base('j'), kind: 'choose', model: net({ cubeNet: '222' }), options: [{ id: 'yes', correct: false, folds: true }, { id: 'no', correct: true, folds: false }] });
    expect(netTaskIssues(t, undefined).errors.join()).toMatch(/closes/);
  });
});

describe('the scale over a transition', () => {
  const spec = { solid: CUBE, layout: { cubeNet: '141-e' as const }, stagger: true, view: 'auto' as const, turn: 0 };
  const shape = shapeOf(spec);
  const box = { x: 0, y: 0, w: 800, h: 600 };
  for (const [from, to] of [[0, 1], [1, 0], [0.5, 1]] as const) {
    it(`fold ${from} → ${to}: the fit holds after 30 % and every state between fits the box`, () => {
      const a = specPose(shape, spec, { fold: from });
      const b = specPose(shape, spec, { fold: to });
      const fitA = fitIn(poseBounds(shape, a)!, box);
      const fitB = fitIn(transitionBounds(shape, a, b)!, box);
      expect(transitionFit(fitA, fitB, 0.3)).toEqual(fitB);
      expect(transitionFit(fitA, fitB, 0.7)).toEqual(fitB);
      for (let i = 0; i <= 9; i++) {
        const q = poseBounds(shape, mixPose(shape, a, b, i / 9))!;
        const left = fitB.cx + (q.minX - fitB.mx) * fitB.s;
        const right = fitB.cx + (q.maxX - fitB.mx) * fitB.s;
        const top = fitB.cy - (q.maxY - fitB.my) * fitB.s;
        const bottom = fitB.cy - (q.minY - fitB.my) * fitB.s;
        expect(left).toBeGreaterThanOrEqual(-1e-6);
        expect(right).toBeLessThanOrEqual(800 + 1e-6);
        expect(top).toBeGreaterThanOrEqual(-1e-6);
        expect(bottom).toBeLessThanOrEqual(600 + 1e-6);
      }
      // Between the start and the 30 % mark the scale moves one way only.
      const s = [0, 0.1, 0.2, 0.3].map((k) => transitionFit(fitA, fitB, k).s);
      expect(s.every((v, i) => i === 0 || Math.sign(v - s[i - 1]!) * Math.sign(fitB.s - fitA.s) >= 0)).toBe(true);
    });
  }
});
