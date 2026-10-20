import { describe, expect, it } from 'vitest';
import { evaluateSim, SEPARATE_EXPERIMENTS } from '../../src/engines/space-scene/lib/sim';
import { resolveSimValues, setSimControl, encodeSimParam, decodeSimParam } from '../../src/engines/space-scene/lib/sim/controls';
import { benchShadow, holeInterval, lightQuantity, solveLight } from '../../src/engines/space-scene/lib/sim/light';
import { quantityKind, simIssues, simSchema, simTimelineChannels, type SimData, type SimValues } from '../../src/engines/space-scene/sim-schema';
import { LIGHT_PARTS, lightSim } from './fixtures/light-bench';
const data = lightSim.light!,
  bench = data.bench!;
const run = (set: SimValues = {}) => evaluateSim(lightSim, resolveSimValues(lightSim, set));
const ctx = {
  parts: new Set([...LIGHT_PARTS, 'ground', 'pole', 'context']),
  flows: new Map(),
  animations: new Map(),
  poses: new Set<string>(),
  countable: new Set<string>(),
  contextParts: new Set(['context']),
  groups: new Set(['rays']),
};
const copy = () => JSON.parse(JSON.stringify(lightSim)) as SimData;
const issues = (edit: (sim: SimData) => void) => {
  const sim = copy();
  edit(sim);
  return simIssues(sim, ctx)
    .map((x) => x.message)
    .join('\n');
};

describe('light bench geometry from docs/35 §2.4', () => {
  it.each([
    [10, 32],
    [15, 24],
    [20, 20],
    [30, 16],
    [40, 14],
    [60, 12],
  ])('torch %s cm, screen 30 cm → %s cm', (a, height) => {
    expect(Math.round(benchShadow(bench, 'card-circle', 0, a, 30).height)).toBe(height);
    // Finite 2 mm thickness moves the near surface slightly toward the point source.
    expect(benchShadow(bench, 'card-circle', 0, a, 30).height).toBeCloseTo((8 * (a + 30)) / (a - 0.1), 10);
    const ideal = (8 * (a + 30)) / a;
    const relative = benchShadow(bench, 'card-circle', 0, a, 30).height / ideal - 1;
    // At the spec's rejected 10 cm setting, 2 mm thickness necessarily adds 1/99.
    if (a === 10) expect(relative).toBeCloseTo(1 / 99, 12);
    else expect(relative).toBeLessThan(0.01);
  });
  it.each([
    [10, 12],
    [20, 16],
    [30, 20],
    [40, 24],
    [50, 28],
    [60, 32],
  ])('screen %s cm → %s cm', (b, height) => expect(Math.round(benchShadow(bench, 'card-circle', 0, 20, b).height)).toBe(height));
  const table = [
    [
      'card-circle',
      [
        [20, 20],
        [20, 15],
        [20, 1],
      ],
    ],
    [
      'card-square',
      [
        [20, 20],
        [23, 15],
        [25, 1],
      ],
    ],
    [
      'card-triangle',
      [
        [20, 23],
        [21, 17],
        [22, 1],
      ],
    ],
    [
      'card-circle-big',
      [
        [30, 30],
        [31, 23],
        [31, 1],
      ],
    ],
    [
      'tin',
      [
        [17, 36],
        [21, 33],
        [24, 24],
      ],
    ],
    [
      'cone',
      [
        [20, 28],
        [25, 24],
        [27, 27],
      ],
    ],
    [
      'ball',
      [
        [16, 16],
        [16, 16],
        [16, 16],
      ],
    ],
  ] as const;
  it.each(table)('%s: all three turned silhouettes', (id, readings) =>
    readings.forEach(([h, w], i) => {
      const q = benchShadow(bench, id, [0, 45, 90][i]!, 20, 30);
      expect(Math.round(q.height)).toBe(h);
      expect(Math.round(q.width)).toBe(w);
      if (bench.objects[id]!.names[String([0, 45, 90][i])] === 'circle') expect(q.width / q.height).toBeCloseTo(1, 2);
      if (i === 2 && id.startsWith('card-')) expect(q.width).toBeLessThan(1.5);
    }),
  );
  it('sphere uses the exact tangent cone, independent of its turn', () => {
    const exact = (2 * 50 * 3.25) / Math.sqrt(20 ** 2 - 3.25 ** 2);
    expect(benchShadow(bench, 'ball', 45, 20, 30).width).toBe(exact);
  });
  it('no object or no torch has no shadow and unavailable dimensions', () => {
    for (const set of [{ object: 'none' }, { 'torch-on': false }] as SimValues[]) {
      expect(run(set)['shadow-shape']).toBe('none');
      expect(run(set)['shadow-height']).toBeNaN();
    }
  });
});
describe('transmission, holes and seeing', () => {
  it.each([
    ['clear-glass', 91, 91],
    ['frosted-glass', 45, 18],
    ['tracing-paper', 35, 14],
    ['cardboard', 0, 0],
  ])('%s transmitted light at 10/30 cm', (material, near, far) => {
    expect(Math.round(run({ material, 'd-screen': 10 })['light-behind'] as number)).toBe(near);
    expect(Math.round(run({ material, 'd-screen': 30 })['light-behind'] as number)).toBe(far);
    expect(run({ material })['sheet-dark']).toBeCloseTo(1 - (run({ material })['light-behind'] as number) / 100, 12);
  });
  it('empty holder, torch off and the scattering near-screen limit', () => {
    expect(run({ material: 'none' })['light-behind']).toBe(100);
    expect(run({ 'torch-on': false })['light-behind']).toBe(0);
    expect(run({ 'torch-on': false })['shadow-kind']).toBe('none');
    expect(
      solveLight(data, {
        'd-torch': 20,
        'd-screen': 0,
        material: 'frosted-glass',
        'torch-on': true,
      })['sheet:light'],
    ).toBe(83);
  });
  it('three aligned holes leave a 2 cm dot; a 2 cm move blocks it', () => {
    expect(holeInterval(data.holes!, 20, 30, false)).toEqual([-1, 1]);
    expect(run().dot).toBe('yes');
    expect(run({ middle: 'moved' }).dot).toBe('no');
    expect(run({ 'torch-on': false }).dot).toBe('no');
  });
  it('dark box requires a source and records reflected brightness', () => {
    expect(run().eye).toBe('some');
    expect(run({ 'in-box': 'mirror' }).eye).toBe('bright');
    expect(run({ 'box-torch': false }).eye).toBe('none');
    expect(run({ 'box-torch': false })['box-dark']).toBe(1);
  });
});
describe('contracts and validation', () => {
  it('registers the independent model and quantities without timeline channels', () => {
    expect(SEPARATE_EXPERIMENTS.light).toBe(true);
    expect(simTimelineChannels(lightSim, 'sun:at')).toBeNull();
    expect(quantityKind(lightSim, 'sun:at')).toBe('vector');
    expect(lightQuantity(data, 'sun:unknown')).toBeNull();
    expect(quantityKind(lightSim, 'control:object')).toBeNull();
    expect(run()['torch-lit']).toBe(1);
    expect(run()).toEqual(run());
    expect(simIssues(lightSim, ctx)).toEqual([]);
  });
  it('rejects the original inconsistent distance envelope and source/card intersection', () =>
    expect(
      issues((s) => {
        const c = s.controls.find((c) => c.id === 'd-torch');
        if (c?.kind === 'step') c.values = [10, 15, 20, 30, 40, 60];
        const b = s.controls.find((c) => c.id === 'd-screen');
        if (b?.kind === 'step') b.values = [10, 20, 30, 40, 50, 60];
      }),
    ).toMatch(/exceeds the screen[\s\S]*in front of the source/));
  it.each([
    [
      (s: SimData) => {
        s.light!.bench!.power = 'object';
      },
      /toggle control/,
    ],
    [
      (s: SimData) => {
        delete s.light!.bench!.objects.ball;
      },
      /no data for option "ball"/,
    ],
    [
      (s: SimData) => {
        s.light!.bench!.objects.ball!.part = 'missing';
      },
      /unknown part/,
    ],
    [
      (s: SimData) => {
        s.light!.bench!.objects.ball!.part = 'context';
      },
      /context part/,
    ],
    [
      (s: SimData) => {
        delete s.light!.bench!.objects.ball!.names['45'];
      },
      /no shape name/,
    ],
    [
      (s: SimData) => {
        s.light!.sheets!.materials['clear-glass']!.scattered = 0.5;
      },
      /straight \+ scattered/,
    ],
    [
      (s: SimData) => {
        s.light!.sheets!.kinds.dark = 90;
      },
      /dark must be below/,
    ],
    [
      (s: SimData) => {
        s.light!.bench!.source.beam = 1;
      },
      /outside the light beam/,
    ],
    [
      (s: SimData) => {
        s.light!.holes!.cards[2]!.at = 0;
      },
      /positions must be distinct/,
    ],
    [
      (s: SimData) => {
        s.light!.holes!.cards[0]!.moved = 1;
      },
      /exactly one card/,
    ],
    [
      (s: SimData) => {
        s.light!.sun!.dates['oct-20'] = '2026-02-30';
      },
      /valid ISO date/,
    ],
    [
      (s: SimData) => {
        s.light!.sun!.north = [0, 0, -2];
      },
      /horizontal unit vector/,
    ],
    [
      (s: SimData) => {
        const c = s.controls.find((c) => c.id === 'time');
        if (c?.kind === 'step') c.values = [0, 8, 18];
      },
      /at least 5°/,
    ],
    [
      (s: SimData) => {
        s.outputs.find((o) => o.id === 'dot')!.states!.maybe = {
          en: 'Maybe',
          zh: '也许',
        };
      },
      /never "maybe"/,
    ],
    [
      (s: SimData) => {
        delete s.outputs.find((o) => o.id === 'dot')!.states!.yes;
      },
      /give it a label/,
    ],
    [
      (s: SimData) => {
        s.outputs.find((o) => o.id === 'sun-at')!.kind = 'number';
      },
      /is a vector/,
    ],
    [
      (s: SimData) => {
        s.outputs.find((o) => o.id === 'time-now')!.unit = 'cm';
      },
      /time format needs/,
    ],
  ] as const)('invalid authored data %#', (edit, expected) => expect(issues(edit)).toMatch(expected));
  it('validates the new binding and overlay branches', () => {
    const sim = copy();
    sim.bind.push({
      output: 'sun-at',
      part: 'ball',
      place: { centre: [0, 0, 0], radius: 7, face: 'centre' },
    });
    sim.overlays.push({
      kind: 'shadow-cast',
      source: { direction: { output: 'sun-at' } },
      receiver: { part: 'ground', normal: [0, 1, 0], radius: 5.5 },
      casters: [{ part: 'pole' }],
      rays: { group: 'rays', edges: 'tip', parallel: [-0.4, 0.4] },
      trail: { control: 'time' },
    });
    expect(simSchema.safeParse(sim).success).toBe(true);
    expect(simIssues(sim, ctx)).toEqual([]);
    sim.bind.push({
      output: 'shadow-height',
      part: 'ball',
      place: { centre: [0, 0, 0], radius: 7 },
    });
    expect(simIssues(sim, ctx).some((x) => x.message.includes('xyz vector'))).toBe(true);
  });
  it('mutually exclusive choices clear the other holder and round-trip through the URL', () => {
    let set = setSimControl(lightSim, {}, 'material', 'frosted-glass');
    let values = resolveSimValues(lightSim, set);
    expect(values.object).toBe('none');
    expect(values.material).toBe('frosted-glass');
    set = setSimControl(lightSim, set, 'object', 'tin');
    values = resolveSimValues(lightSim, set);
    expect(values.object).toBe('tin');
    expect(values.material).toBe('none');
    expect(resolveSimValues(lightSim, decodeSimParam(encodeSimParam(set)))).toEqual(values);
  });
  it('enforces geographic bounds structurally', () => {
    for (const key of ['lat', 'lon', 'zone'] as const) {
      const sim = copy();
      sim.light!.sun![key] = 1000;
      expect(simSchema.safeParse(sim).success).toBe(false);
    }
  });
});

describe('light validation boundaries', () => {
  it.each([
    [
      'missing material',
      (s: SimData) => {
        delete s.light!.sheets!.materials['tracing-paper'];
      },
      /no data for option "tracing-paper"/,
    ],
    [
      'source intersects object',
      (s: SimData) => {
        const c = s.controls.find((c) => c.id === 'd-torch');
        if (c?.kind === 'step') c.values = [1, 20, 30];
      },
      /every gap must exceed/,
    ],
    [
      'clock control in centimetres',
      (s: SimData) => {
        const c = s.controls.find((c) => c.id === 'time');
        if (c?.kind === 'step') c.unit = 'cm';
      },
      /time format needs/,
    ],
    [
      'unknown caster',
      (s: SimData) => {
        s.overlays.push({
          kind: 'shadow-cast',
          source: { direction: { output: 'sun-at' } },
          receiver: { part: 'ground', normal: [0, 1, 0], radius: 5.5 },
          casters: [{ part: 'missing' }],
        });
      },
      /unknown part/,
    ],
    [
      'context receiver',
      (s: SimData) => {
        s.overlays.push({
          kind: 'shadow-cast',
          source: { direction: { output: 'sun-at' } },
          receiver: { part: 'context', normal: [0, 1, 0], radius: 5.5 },
          casters: [{ part: 'pole' }],
        });
      },
      /context part/,
    ],
    [
      'context caster',
      (s: SimData) => {
        s.overlays.push({
          kind: 'shadow-cast',
          source: { direction: { output: 'sun-at' } },
          receiver: { part: 'ground', normal: [0, 1, 0], radius: 5.5 },
          casters: [{ part: 'context' }],
        });
      },
      /context part/,
    ],
  ] as const)('%s', (_, edit, expected) => expect(issues(edit)).toMatch(expected));
});
