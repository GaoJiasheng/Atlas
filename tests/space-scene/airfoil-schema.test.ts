import { it, expect } from 'vitest';
import fixture from '../../src/content/topics/sample-airfoil/data/parts.json';
import { partsFile } from '../../src/engines/space-scene/schema';
import {
  airfoilSchema,
  airfoilSourceIssues,
} from '../../src/engines/space-scene/airfoil-schema';
import { AIRFOIL_DATA } from './fixtures/airfoil-bench';
const copy = () => structuredClone(fixture) as any;
const errors = (f: any) => {
  const r = partsFile.safeParse(f);
  return r.success
    ? []
    : r.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`);
};
it('complete fixture validates', () => expect(errors(fixture)).toEqual([]));
it.each([
  [
    'missing flow-view',
    (f: any) =>
      (f.sim.controls = f.sim.controls.filter(
        (c: any) => c.id !== 'flow-view',
      )),
  ],
  ['angle21', (f: any) => f.sim.controls[0].values.push(21)],
  ['negative speed', (f: any) => f.sim.controls[1].values.unshift(-1)],
  ['altitude10001', (f: any) => f.sim.controls[2].values.push(10001)],
  [
    'density0',
    (f: any) => (f.sim.airfoil.atmosphere = { kind: 'constant', density: 0 }),
  ],
  ['Infinity', (f: any) => (f.sim.airfoil.area = Infinity)],
  ['NaN', (f: any) => (f.sim.airfoil.chord = NaN)],
  [
    'profile url',
    (f: any) => (f.sim.airfoil.profile.url = 'https://example.com/foil'),
  ],
  ['unknown field', (f: any) => (f.sim.airfoil.camper = 0.1)],
  ['version', (f: any) => (f.sim.airfoil.model = 'measured')],
  ['knots', (f: any) => (f.sim.airfoil.stall.knots[1][1] = 0.9)],
  ['from', (f: any) => (f.sim.outputs[0].from = 'missing')],
  ['from choice', (f: any) => (f.sim.outputs[0].from = 'control:flow-view')],
  ['state tag', (f: any) => (f.sim.outputs[6].tag = 'sim')],
  ['missing state', (f: any) => delete f.sim.outputs[6].states.still],
  [
    'extra state',
    (f: any) => (f.sim.outputs[6].states.extra = { en: 'Extra', zh: '多余' }),
  ],
  ['wrong output kind', (f: any) => (f.sim.outputs[4].kind = 'state')],
  ['duplicate provider', (f: any) => f.sim.bind.push(f.sim.bind[1])],
  [
    'mixed intensity',
    (f: any) =>
      f.sim.bind.push({
        output: 'lift-n',
        flow: 'section-air',
        intensity: { full: 1000 },
      }),
  ],
  [
    'provider with paths',
    (f: any) =>
      (f.flows[0].path = [
        [0, 0, 0],
        [1, 0, 0],
      ]),
  ],
  ['provider spread', (f: any) => (f.flows[0].spread = 0.1)],
  ['speed mechanism', (f: any) => (f.flows[0].speed = 2)],
  ['extra scale', (f: any) => (f.parts[0].primitive.scale = [2, 1, 1])],
  [
    'extra pose',
    (f: any) => (f.poses.bank['foil-sample'] = { offset: [0, 1, 0] }),
  ],
  [
    'extra binding',
    (f: any) =>
      f.sim.bind.push({
        part: 'foil-sample',
        control: 'angle-deg',
        offset: { axis: [1, 0, 0], per: 1 },
      }),
  ],
  ['wrong chord pivot', (f: any) => (f.sim.bind[0].rotate.pivot = [0, 0, 0])],
  ['wrong shape', (f: any) => (f.parts[0].primitive.shape[1][0] += 0.001)],
  ['depth', (f: any) => (f.parts[0].primitive.depth = 0.2)],
  ['bilateral', (f: any) => (f.parts[0].bilateral = true)],
  ['context', (f: any) => (f.parts[0].context = true)],
  ['pressure wrong part', (f: any) => (f.sim.overlays[2].part = 'force-body')],
  ['pressure wrong group', (f: any) => (f.sim.overlays[2].group = 'absent')],
  [
    'pressure wrong when',
    (f: any) => (f.sim.overlays[2].when.is = { eq: 'streamlines' }),
  ],
  ['plot wrong output', (f: any) => (f.sim.airfoil.plot.y = 'q-now')],
  ['block kind pair', (f: any) => (f.sim.kind = 'seeds')],
  ['no block', (f: any) => delete f.sim.airfoil],
  ['frame forbidden', (f: any) => (f.sim.overlays[0].arrows[0].frame = 'body')],
])('rejects %s', (_name, mutate) => {
  const f = copy();
  (mutate as (f: any) => void)(f);
  expect(errors(f).length).toBeGreaterThan(0);
});
it('sources exist and stall cites its design study', () => {
  const valid = new Map(
    AIRFOIL_DATA.sources.map((id) => [id, { design: id === 'S58' }]),
  );
  expect(airfoilSourceIssues(AIRFOIL_DATA, valid)).toEqual([]);
  expect(airfoilSourceIssues(AIRFOIL_DATA, new Map())).not.toEqual([]);
  expect(
    airfoilSourceIssues(
      AIRFOIL_DATA,
      new Map([...valid].map(([id]) => [id, {}])),
    ),
  ).not.toEqual([]);
  expect(
    airfoilSchema.safeParse({ ...AIRFOIL_DATA, sources: [] }).success,
  ).toBe(false);
});
