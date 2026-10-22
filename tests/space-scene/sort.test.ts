/**
 * The sort model (docs/38 §2.8, §4.2 E-LT1) on the full specimen-tray data:
 * every table of §2.8 cell by cell (T1 six rows, T2 four, T3 six, T4 seven
 * with the dolphin, T5 both ways with the eight suspects, T6 seven rows and
 * its bar chart), the slots (inside their group's grid, never overlapping,
 * offsets from each specimen's home to the pad), invariants (each specimen
 * in exactly one place, a longer chain never puts more back in the case,
 * the fix leaves nothing wrong), the quantities' kinds, determinism, the URL
 * round trip, speed, and the validation of the sort data and its outputs.
 */
import { describe, expect, it } from 'vitest';
import { evaluateSim, SEPARATE_EXPERIMENTS } from '../../src/engines/space-scene/lib/sim';
import { decodeSimParam, encodeSimParam, resolveSimValues } from '../../src/engines/space-scene/lib/sim/controls';
import { solveSort, sortQuantity, sortSlotCentre, traySpecimens } from '../../src/engines/space-scene/lib/sim/sort';
import { simEffects } from '../../src/engines/space-scene/lib/sim/bind';
import { quantityKind, simIssues, simSchema, type SimValues } from '../../src/engines/space-scene/sim-schema';
import { partBounds } from '../../src/engines/space-scene/lib/parts';
import { ANIMAL_TRAY, SPECIMEN_IDS, SPECIMEN_PARTS, caseCell, specimenTrayContext, specimenTrayInput, specimenTraySim } from './fixtures/specimen-tray';
import { msPerCall } from '../timing';

const sim = specimenTraySim;
const sort = sim.sort!;
const values = (set: SimValues) => resolveSimValues(sim, set);
const solve = (set: SimValues) => solveSort(sort, values(set), SPECIMEN_PARTS);
/** Who is in group g (case order). */
const inGroup = (q: ReturnType<typeof solve>, g: string) => SPECIMEN_IDS.filter((id) => q[`where:${id}`] === g);
const count = (q: ReturnType<typeof solve>, g: string) => q[`count:${g}`] as number;
const issues = (input: unknown, ctx = specimenTrayContext) => simIssues(simSchema.parse(input), ctx).map((x) => `${x.path.join('.')}: ${x.message}`);

describe('T1 living or not (§2.8)', () => {
  const T1: [string, string[], string[], string][] = [
    ['none', [], [], 'u'],
    ['moves', ['toy-car', 'grasshopper', 'plantain-squirrel', 'guppy'], ['pebble', 'plastic-flower', 'chilli-seedling'], 'a'],
    ['responds', ['toy-car', 'chilli-seedling', 'grasshopper', 'plantain-squirrel', 'guppy'], ['pebble', 'plastic-flower'], 'a'],
    ['grows', ['chilli-seedling', 'grasshopper', 'plantain-squirrel', 'guppy'], ['toy-car', 'pebble', 'plastic-flower'], 'b'],
    ['reproduces', ['chilli-seedling', 'grasshopper', 'plantain-squirrel', 'guppy'], ['toy-car', 'pebble', 'plastic-flower'], 'b'],
    ['needs', ['chilli-seedling', 'grasshopper', 'plantain-squirrel', 'guppy'], ['toy-car', 'pebble', 'plastic-flower'], 'b'],
  ];
  it.each(T1)('%s', (question, a, b, car) => {
    const q = solve({ tray: 'alive', 'q-alive': question });
    expect(inGroup(q, 'a')).toEqual(a);
    expect(inGroup(q, 'b')).toEqual(b);
    expect(q['where:toy-car']).toBe(car);
    expect(count(q, 'tray')).toBe(7);
    expect(count(q, 'u')).toBe(question === 'none' ? 7 : 0);
    expect(q.layout).toBe('two');
  });
});

describe('T2 the four big groups (§2.8)', () => {
  const plants = ['ixora', 'chilli-seedling', 'birds-nest-fern', 'moss'];
  const animals = ['grasshopper', 'javan-myna', 'plantain-squirrel', 'snakehead'];
  const fungi = ['mushroom', 'bracket-fungus', 'mouldy-bread', 'yeast'];
  const T2: [number, number[], string][] = [
    [0, [0, 0, 0, 0, 13], 'u'],
    [1, [4, 0, 0, 0, 9], 'u'],
    [2, [4, 4, 0, 0, 5], 'u'],
    [3, [4, 4, 4, 1, 0], 'c'],
  ];
  it.each(T2)('%i questions asked', (k, [a, b, c, d, u], mushroom) => {
    const q = solve({ tray: 'big', 'asked-big': k });
    expect([count(q, 'a'), count(q, 'b'), count(q, 'c'), count(q, 'd'), count(q, 'u')]).toEqual([a, b, c, d, u]);
    expect(q['where:mushroom']).toBe(mushroom);
  });
  it('who goes where', () => {
    const q = solve({ tray: 'big', 'asked-big': 3 });
    expect(inGroup(q, 'a')).toEqual(plants);
    expect(inGroup(q, 'b')).toEqual(animals);
    expect(inGroup(q, 'c')).toEqual(fungi);
    expect(inGroup(q, 'd')).toEqual(['bacteria-dish']);
  });
});

describe('T3 sorting plants (§2.8)', () => {
  const T3: [string, string[], number, string][] = [
    ['none', [], 0, 'u'],
    ['flowers-now', ['ixora'], 5, 'b'],
    ['flowers-or-fruits', ['ixora', 'rhu-sapling'], 4, 'b'],
    ['needles', ['rhu-sapling'], 5, 'b'],
    ['green', ['ixora', 'chilli-seedling', 'rhu-sapling', 'birds-nest-fern', 'staghorn-fern', 'moss'], 0, 'a'],
    ['flowering', ['ixora', 'chilli-seedling', 'rhu-sapling'], 3, 'a'],
  ];
  it.each(T3)('%s', (question, a, b, chilli) => {
    const q = solve({ tray: 'plants', 'q-plant': question });
    expect(inGroup(q, 'a')).toEqual(a);
    expect(count(q, 'b')).toBe(b);
    expect(q['where:chilli-seedling']).toBe(question === 'none' ? 'u' : chilli);
  });
});

describe('T4 the animal flowchart (§2.8)', () => {
  const T4: [number, Record<string, string[]>, number, string][] = [
    [0, {}, 18, 'u'],
    [1, { a: ['grasshopper', 'beetle'] }, 16, 'u'],
    [2, { b: ['javan-myna', 'penguin'] }, 14, 'u'],
    [3, { c: ['plantain-squirrel', 'fruit-bat'] }, 12, 'u'],
    [4, { d: ['dolphin', 'snakehead', 'guppy', 'mudskipper', 'shark'] }, 7, 'd'],
    [5, { e: ['pangolin', 'house-gecko', 'python', 'hawksbill-turtle'] }, 3, 'd'],
    [6, { f: ['tree-frog'], x: ['spider', 'asian-toad'] }, 0, 'd'],
  ];
  it.each(T4)('%i questions asked', (k, step, left, dolphin) => {
    const q = solve({ tray: 'animals', 'asked-animal': k });
    for (const [g, ids] of Object.entries(step)) expect(inGroup(q, g)).toEqual(ids);
    expect(count(q, 'u')).toBe(left);
    expect(q['where:dolphin']).toBe(dolphin);
  });
  it('three land in the wrong true group: the dolphin, the pangolin and the toad', () => {
    const q = solve({ tray: 'animals', 'asked-animal': 6 });
    const heading: Record<string, string> = { a: 'insect', b: 'bird', c: 'mammal', d: 'fish', e: 'reptile', f: 'amphibian', x: 'none' };
    expect(ANIMAL_TRAY.filter((id) => heading[q[`where:${id}`] as string] !== sort.specimens[id]!.group)).toEqual(['dolphin', 'pangolin', 'asian-toad']);
  });
});

describe('T5 which are wrong (§2.8)', () => {
  const before: Record<string, string[]> = {
    a: ['grasshopper', 'beetle', 'spider'],
    b: ['javan-myna', 'fruit-bat'],
    c: ['plantain-squirrel'],
    d: ['penguin', 'dolphin', 'snakehead', 'guppy', 'shark'],
    // Case order inside a group (§3.2 #): the toad (#29) before the gecko (#30).
    e: ['pangolin', 'asian-toad', 'house-gecko', 'python', 'hawksbill-turtle'],
    f: ['mudskipper', 'tree-frog'],
    x: [],
  };
  const after: Record<string, string[]> = {
    a: ['grasshopper', 'beetle'],
    b: ['javan-myna', 'penguin'],
    c: ['plantain-squirrel', 'fruit-bat', 'dolphin', 'pangolin'],
    d: ['snakehead', 'guppy', 'mudskipper', 'shark'],
    e: ['house-gecko', 'python', 'hawksbill-turtle'],
    f: ['tree-frog', 'asian-toad'],
    x: ['spider'],
  };
  it('the classmate puts seven in the wrong group; moved, none', () => {
    const off = solve({ tray: 'classmate' });
    for (const [g, ids] of Object.entries(before)) expect(inGroup(off, g)).toEqual(ids);
    expect(off.wrong).toBe(7);
    expect(off['where:dolphin']).toBe('d');
    const on = solve({ tray: 'classmate', fix: true });
    for (const [g, ids] of Object.entries(after)) expect(inGroup(on, g)).toEqual(ids);
    expect(on.wrong).toBe(0);
    expect(on['where:dolphin']).toBe('c');
  });
  const SUSPECTS: [string, string, string][] = [
    ['fruit-bat', 'wrong', 'mammal'],
    ['dolphin', 'wrong', 'mammal'],
    ['penguin', 'wrong', 'bird'],
    ['spider', 'wrong', 'none'],
    ['asian-toad', 'wrong', 'amphibian'],
    ['mudskipper', 'wrong', 'fish'],
    ['pangolin', 'wrong', 'mammal'],
    ['shark', 'right', 'fish'],
  ];
  it.each(SUSPECTS)('%s: %s, belongs with the %s', (id, verdict, belongs) => {
    const q = solve({ tray: 'classmate', suspect: id });
    expect(q.verdict).toBe(verdict);
    expect(q.belongs).toBe(belongs);
    expect(solve({ tray: 'classmate', suspect: id, fix: true }).verdict).toBe('right');
  });
  it('wrong reads — away from the classmate\'s tray', () => {
    expect(solve({ tray: 'animals', 'asked-animal': 6 }).wrong).toBeNaN();
  });
});

describe('T6 your own flowchart (§2.8)', () => {
  const T6: [string, string, number, number, number, number, number][] = [
    ['feathers', 'hair', 2, 1, 2, 1, 14],
    ['hair', 'hair', 2, 1, 0, 0, 16],
    ['six-legs', 'hair', 2, 1, 2, 1, 14],
    ['fins', 'hair', 5, 2, 2, 1, 11],
    ['scales', 'hair', 8, 3, 2, 1, 8],
    ['can-fly', 'hair', 4, 3, 1, 1, 13],
    ['six-legs', 'feathers', 2, 1, 2, 1, 14],
  ];
  it.each(T6)('%s then %s', (first, second, a, kindsA, b, kindsB, c) => {
    const q = solve({ tray: 'own-key', first, second });
    expect([count(q, 'a'), q['kinds:a'], count(q, 'b'), q['kinds:b'], count(q, 'c')]).toEqual([a, kindsA, b, kindsB, c]);
  });
  it('the bar chart of kinds in A for each first question (second: hair)', () => {
    const kinds = ['feathers', 'hair', 'six-legs', 'fins', 'scales', 'can-fly'].map((first) => solve({ tray: 'own-key', first, second: 'hair' })['kinds:a']);
    expect(kinds).toEqual([1, 1, 1, 2, 3, 3]);
  });
  it('scales gathers a mammal, fish and reptiles', () => {
    expect(inGroup(solve({ tray: 'own-key', first: 'scales' }), 'a')).toEqual(['pangolin', 'snakehead', 'guppy', 'mudskipper', 'shark', 'house-gecko', 'python', 'hawksbill-turtle']);
  });
});

describe('slots and the shift vector', () => {
  const home = (id: string) => {
    const p = SPECIMEN_PARTS.find((x) => x.id === id)!;
    return [p.primitive!.at[0], partBounds({ primitive: p.primitive!, repeat: undefined })!.min[1], p.primitive!.at[2]];
  };
  const slot = (q: ReturnType<typeof solve>, id: string) => [q.slots as Record<string, number>].map((v) => [v[`${id}:x`]!, v[`${id}:y`]!, v[`${id}:z`]!, v[`${id}:shown`]!])[0]!;
  it('a specimen in the case stays home; one off the tray is hidden', () => {
    const q = solve({ tray: 'animals' });
    expect(slot(q, 'dolphin')).toEqual([0, 0, 0, 1]);
    expect(slot(q, 'toy-car')).toEqual([0, 0, 0, 0]);
    expect(solve({ tray: 'all' }).layout).toBe('none');
    expect(SPECIMEN_IDS.every((id) => slot(solve({ tray: 'all' }), id).join() === '0,0,0,1')).toBe(true);
  });
  it('the offset takes the specimen from its home to its slot, standing on the pad', () => {
    const q = solve({ tray: 'animals', 'asked-animal': 6 });
    // X: the spider first (case order), the toad second: column 0 and 1 of the back row.
    const [x, y, z] = slot(q, 'spider');
    const h = home('spider');
    expect(h).toEqual([caseCell(17)[0], 0.015, caseCell(17)[2]]);
    expect(x! + h[0]!).toBeCloseTo(0.62 - 0.07, 12);
    expect(y! + h[1]!).toBeCloseTo(0.005, 12);
    expect(z! + h[2]!).toBeCloseTo(-0.33 - 0.035, 12);
    const [tx, , tz] = slot(q, 'asian-toad');
    const ht = home('asian-toad');
    expect(tx! + ht[0]!).toBeCloseTo(0.62, 12);
    expect(tz! + ht[2]!).toBeCloseTo(-0.365, 12);
  });
  it('every tray and setting: each specimen in one place, slots inside their grid, none shared', () => {
    for (const tray of Object.keys(sort.trays))
      for (const k of [0, 3, 6])
        for (const fix of [false, true])
          for (const first of ['feathers', 'scales', 'fins']) {
            const set = { tray, 'asked-animal': k, 'asked-big': Math.min(k, 3), fix, first, 'q-alive': 'grows', 'q-plant': 'flowering' };
            const q = solve(set);
            const on = traySpecimens(sort, tray);
            const places = SPECIMEN_IDS.map((id) => q[`where:${id}`] as string);
            expect(places.filter((p) => p !== 'off').length).toBe(on.length);
            const counted = ['u', 'a', 'b', 'c', 'd', 'e', 'f', 'x'].reduce((n, g) => n + count(q, g), 0);
            expect(counted).toBe(on.length);
            const layout = q.layout === 'none' ? undefined : sort.layouts[q.layout as string];
            const taken = new Set<string>();
            for (const id of on) {
              const g = q[`where:${id}`] as string;
              const [x, y, z] = slot(q, id);
              const h = home(id);
              if (g === 'u') {
                expect([x, y, z]).toEqual([0, 0, 0]);
                continue;
              }
              const grid = layout![g]!;
              const at = [x! + h[0]!, y! + h[1]!, z! + h[2]!];
              const lo = sortSlotCentre(grid, 0);
              const hi = sortSlotCentre(grid, grid.cols * grid.rows - 1);
              expect(at[0]).toBeGreaterThanOrEqual(lo[0] - 1e-9);
              expect(at[0]).toBeLessThanOrEqual(hi[0] + 1e-9);
              expect(at[2]).toBeGreaterThanOrEqual(lo[2] - 1e-9);
              expect(at[2]).toBeLessThanOrEqual(hi[2] + 1e-9);
              const key = at.map((v) => v.toFixed(6)).join();
              expect(taken.has(key)).toBe(false);
              taken.add(key);
            }
          }
  });
  it('asking more never puts more back in the case', () => {
    for (const [tray, step, n] of [['animals', 'asked-animal', 6], ['big', 'asked-big', 3]] as const) {
      const left = Array.from({ length: n + 1 }, (_, k) => count(solve({ tray, [step]: k }), 'u'));
      for (let k = 1; k <= n; k++) expect(left[k]).toBeLessThanOrEqual(left[k - 1]!);
    }
  });
  it('drives the shift binding: offsets per part, hidden off the tray', () => {
    const v = values({ tray: 'alive', 'q-alive': 'moves' });
    const fx = simEffects(sim, v, evaluateSim(sim, v, [], undefined, SPECIMEN_PARTS as never));
    expect(fx.hidden.has('dolphin')).toBe(true);
    expect(fx.hidden.has('toy-car')).toBe(false);
    expect(fx.shift.get('toy-car')!.order).toBe(0);
    expect(fx.shift.get('pebble')!.order).toBe(1);
    expect(fx.shift.get('guppy')!.offset[0]).toBeCloseTo(-0.32 + 0.08 * (3 - 3) - caseCell(25)[0], 12);
    expect(fx.hidden.has('pad-2a')).toBe(false);
    expect(fx.hidden.has('pad-6a')).toBe(true);
  });
});

describe('the model', () => {
  it('quantity kinds', () => {
    expect(sortQuantity(sort, 'slots')).toBe('vector');
    expect(sortQuantity(sort, 'layout')).toBe('state');
    expect(sortQuantity(sort, 'count:x')).toBe('number');
    expect(sortQuantity(sort, 'count:g')).toBeNull();
    expect(sortQuantity(sort, 'kinds:a')).toBe('number');
    expect(sortQuantity(sort, 'where:dolphin')).toBe('state');
    expect(sortQuantity(sort, 'where:unicorn')).toBeNull();
    expect(quantityKind(sim, 'verdict')).toBe('state');
    expect(SEPARATE_EXPERIMENTS.sort).toBe(true);
  });
  it('is deterministic and fast', () => {
    const set = values({ tray: 'own-key', first: 'scales', second: 'fins' });
    expect(solveSort(sort, set, SPECIMEN_PARTS)).toEqual(solveSort(sort, set, SPECIMEN_PARTS));
    expect(msPerCall(() => solveSort(sort, set, SPECIMEN_PARTS), 10)).toBeLessThan(0.2);
  });
  it('the URL round trip: sim=tray.animals~asked-animal.4', () => {
    const v = decodeSimParam('tray.animals~asked-animal.4');
    expect(v).toEqual({ tray: 'animals', 'asked-animal': 4 });
    expect(decodeSimParam(encodeSimParam(v))).toEqual(v);
    expect(evaluateSim(sim, values(v), [], undefined, SPECIMEN_PARTS as never)['count-d']).toBe(5);
  });
});

describe('validation', () => {
  it('the fixture is clean', () => {
    expect(issues(specimenTrayInput())).toEqual([]);
  });
  it('a feature the key asks, missing (listing specimen and feature)', () => {
    const s = specimenTrayInput();
    delete (s.sort.specimens.beetle!.traits as Record<string, boolean>)['moist-skin'];
    expect(issues(s)).toContainEqual(expect.stringMatching(/trays\.animals\.specimens: "beetle" has no answer to "moist-skin"/));
  });
  it('a key control that is not there or the wrong kind', () => {
    const s = specimenTrayInput();
    (s.sort.trays.alive.key as { ask: string }).ask = 'q-nope';
    (s.sort.trays.big.key as { asked: string }).asked = 'fix';
    const out = issues(s);
    expect(out).toContainEqual(expect.stringMatching(/trays\.alive\.key\.ask: unknown control "q-nope"/));
    expect(out).toContainEqual(expect.stringMatching(/trays\.big\.key\.asked: "fix" must be a step control of 0 … 3/));
  });
  it('a group too small for some setting (listing it)', () => {
    const s = specimenTrayInput();
    s.sort.layouts.three.a.cols = 1;
    s.sort.layouts.three.a.rows = 4;
    expect(issues(s)).toContainEqual(expect.stringMatching(/trays\.own-key\.layout: group A gets 5 specimens but has 4 slots \(first = fins, second = feathers\)/));
  });
  it('an arrangement that leaves out a specimen, has one twice, or names no true group', () => {
    const s = specimenTrayInput();
    s.sort.trays.classmate.key.arrangement.a.members = ['grasshopper', 'beetle', 'beetle'];
    (s.sort.trays.classmate.key.arrangement.b as { heading: string }).heading = 'dragons';
    const out = issues(s);
    expect(out).toContainEqual(expect.stringMatching(/"beetle" is also in group A/));
    expect(out).toContainEqual(expect.stringMatching(/"spider" is on the tray but in no group/));
    expect(out).toContainEqual(expect.stringMatching(/arrangement\.b\.heading: "dragons" is not a group/));
  });
  it('a suspect not on the tray', () => {
    const s = specimenTrayInput();
    s.controls.find((c) => c.id === 'suspect')!.options!.push({ id: 'pebble', label: { en: 'Pebble', zh: '石头' } });
    expect(issues(s)).toContainEqual(expect.stringMatching(/option "pebble" of "suspect" is not on this tray/));
  });
  it('where: an unknown specimen, a state it never reaches, a missing label, predictOnly it does reach', () => {
    const s = specimenTrayInput();
    const out = s.outputs as { id: string; from?: string; states?: Record<string, unknown>; predictOnly?: string[] }[];
    out.find((o) => o.id === 'where-toy-car')!.from = 'where:unicorn';
    out.find((o) => o.id === 'where-chilli')!.states!.f = { en: 'F', zh: 'F' };
    delete out.find((o) => o.id === 'where-dolphin')!.states!.off;
    out.find((o) => o.id === 'where-mushroom')!.predictOnly = ['c'];
    const got = issues(s);
    expect(got).toContainEqual(expect.stringMatching(/the sort model has no quantity "where:unicorn"/));
    expect(got).toContainEqual(expect.stringMatching(/"where:chilli-seedling" is never "f"/));
    expect(got).toContainEqual(expect.stringMatching(/"where:dolphin" can be "off": give it a label/));
    expect(got).toContainEqual(expect.stringMatching(/"where:mushroom" can be "c" in this model: it is not prediction-only/));
  });
  it('a pad that is not a part; slots that run off their pad; groups that overlap', () => {
    const s = specimenTrayInput();
    s.sort.layouts.two.a.pad = 'pad-nope';
    s.sort.layouts.six.x.cols = 5;
    s.sort.layouts.three.b.at = [-0.3, 0.011, 0.23];
    const out = issues(s);
    expect(out).toContainEqual(expect.stringMatching(/layouts\.two\.a\.pad: unknown part "pad-nope"/));
    expect(out).toContainEqual(expect.stringMatching(/the slots of group X run off its pad "pad-x"/));
    expect(out).toContainEqual(expect.stringMatching(/layouts\.three: groups A and B overlap/));
  });
  it('shift: a vector output only, one shift per part, no place with it', () => {
    const s = specimenTrayInput();
    (s.bind as unknown[]).push({ output: 'count-a', part: ['beetle'], shift: {} }, { output: 'slots', part: ['beetle'], shift: {} });
    const out = issues(s);
    expect(out).toContainEqual(expect.stringMatching(/shift needs a vector output \(an offset per part\), "count-a" is a number/));
    expect(out).toContainEqual(expect.stringMatching(/"beetle" has a shift already/));
  });
  it('predictOnly is the sort model\'s', () => {
    const s = specimenTrayInput();
    (s.outputs as { id: string; predictOnly?: string[] }[]).find((o) => o.id === 'verdict')!.predictOnly = ['right'];
    expect(issues(s)).toContainEqual(expect.stringMatching(/"verdict" can be "right" in this model: it is not prediction-only/));
  });
});
