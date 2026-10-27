/**
 * The optical bench's disclosed vertical exaggeration and object-point colours
 * (docs/58 F1): only heights are scaled, the solver is untouched, the receiver
 * spot keeps its blur readable and the authored contract rejects bad values.
 */
import { describe, expect, it } from 'vitest';
import { simIssues, simSchema } from '../../src/engines/space-scene/sim-schema';
import { benchLabelPoint, benchSpotScale, benchVertex, BENCH_DOT_RADIUS, effectiveEyeRays, solveSenses } from '../../src/engines/space-scene/lib/sim/senses';
import { SENSES_BENCH_SIM } from './fixtures/senses-bench';
import topic from '../../src/content/topics/eyes-and-ears/data/parts.json';

const ctx = { parts: new Set<string>(), flows: new Map(), animations: new Map(), poses: new Set<string>(), countable: new Set<string>(), groups: new Set(['bench', 'eye-study', 'wave-study']) };
const issues = (mutate: (x: any) => void) => {
  const raw = structuredClone(SENSES_BENCH_SIM) as any;
  mutate(raw);
  const parsed = simSchema.safeParse(raw);
  return parsed.success ? simIssues(parsed.data, ctx) : parsed.error.issues;
};
const bench = { origin: [-1, -2.4, 1.3], cmToScene: .06, yScale: 20 };

describe('bench display mapping', () => {
  it('scales only heights; distances stay at cmToScene', () => {
    expect(benchVertex(bench, [-40, 1, 0])).toEqual([-1 - 2.4, -2.4 + 1.2, 1.3]);
    expect(benchVertex(bench, [4, -.5, 0])[0]).toBeCloseTo(-.76, 12);
    expect(benchVertex(bench, [4, -.5, 0])[1]).toBeCloseTo(-3, 12);
    expect(benchVertex({ origin: [0, 0, 0], cmToScene: .06 }, [1, 1, 1])).toEqual([.06, .06, .06]);
  });
  it('leaves the solver geometry and readouts unchanged', () => {
    const sim = simSchema.parse(SENSES_BENCH_SIM);
    const values = Object.fromEntries(sim.controls.map((c) => [c.id, c.default]));
    const before = solveSenses(sim.senses!, values), rays = effectiveEyeRays(sim.senses!, values);
    const scaled = simSchema.parse({ ...SENSES_BENCH_SIM, overlays: SENSES_BENCH_SIM.overlays.map((o: any) => (o.kind === 'paraxial-eye' ? { ...o, yScale: 20 } : o)) });
    expect(solveSenses(scaled.senses!, values)).toEqual(before);
    expect(effectiveEyeRays(scaled.senses!, values)).toEqual(rays);
  });
  it('draws a focused point as a visible dot and a blur as a patch as wide as the exaggerated spread', () => {
    const focused = benchSpotScale(bench, 0, true), blurred = benchSpotScale(bench, 7 / 150, false);
    expect(focused).toEqual([BENCH_DOT_RADIUS, BENCH_DOT_RADIUS, BENCH_DOT_RADIUS]);
    expect(blurred[1]).toBeCloseTo((7 / 150) * .06 * 20 / 2, 12);
    expect(blurred[1] / focused[1]).toBeGreaterThan(2);
    // Doubling the aperture doubles the patch.
    expect(benchSpotScale(bench, 7 / 75, false)[1]).toBeCloseTo(2 * blurred[1], 12);
    // Without exaggeration a sub-dot blur still shows as the dot, never vanishing.
    expect(benchSpotScale({ origin: [0, 0, 0], cmToScene: .06 }, 7 / 150, false)[1]).toBe(BENCH_DOT_RADIUS);
  });
  it('puts the stage note above the receiver, level with the highest object point', () => {
    const at = benchLabelPoint(bench, { r: 4, points: [{ h: 1 }, { h: -.5 }] });
    expect(at[0]).toBeCloseTo(-.76, 12);
    expect(at[1]).toBeCloseTo(-1.2, 12);
    expect(at[2]).toBe(1.3);
  });
});

describe('bench display contract', () => {
  it('defaults to no exaggeration and accepts a token pair', () => {
    const o = simSchema.parse(SENSES_BENCH_SIM).overlays.find((x) => x.kind === 'paraxial-eye')!;
    expect(o.kind === 'paraxial-eye' && o.yScale).toBe(1);
    expect(issues((x) => Object.assign(x.overlays[0], { yScale: 12, pointColors: ['token:ray-top', 'token:ray-bottom'] }))).toEqual([]);
  });
  it.each([
    (x: any) => (x.overlays[0].yScale = .5),
    (x: any) => (x.overlays[0].yScale = Infinity),
    (x: any) => (x.overlays[0].yScale = 100),
    (x: any) => (x.overlays[0].pointColors = ['#a35f00', 'token:ray-bottom']),
    (x: any) => (x.overlays[0].pointColors = ['token:ray-top']),
  ])('rejects illegal display values %#', (mutate) => expect(issues(mutate).length).toBeGreaterThan(0));
  it('the published topic discloses its exaggeration and colours both object points', () => {
    const o = topic.sim.overlays.find((x) => x.kind === 'paraxial-eye') as { yScale: number; pointColors: string[]; origin: number[]; cmToScene: number };
    expect(o.yScale).toBeGreaterThan(1);
    expect(o.pointColors).toEqual(['token:ray-top', 'token:ray-bottom']);
    const marker = (id: string) => topic.parts.find((p) => p.id === id)!.primitive as { at: number[]; color: string };
    // Markers sit where the exaggerated rays start and share their colour.
    expect(marker('object-top').at[1]).toBeCloseTo(benchVertex(o, [-40, 1, 0])[1], 6);
    expect(marker('object-bottom').at[1]).toBeCloseTo(benchVertex(o, [-40, -.5, 0])[1], 6);
    expect([marker('object-top').color, marker('object-bottom').color]).toEqual(o.pointColors);
    expect(topic.spec.some((r) => r.value.en.includes(`×${o.yScale}`) && r.value.zh.includes(`×${o.yScale}`))).toBe(true);
  });
});
