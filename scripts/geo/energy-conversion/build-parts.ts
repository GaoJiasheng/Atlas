/**
 * pnpm tsx scripts/geo/energy-conversion/build-parts.ts
 * Regenerates reviewed geometry in parts.json. The existing file remains
 * the source for teaching text, scene layout and simulation constants.
 * Re-running replaces, rather than appends to, the generated assemblies.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { BICYCLE, bicycleChain, bicycleCrankset, bicycleWheel, bottleDynamo, diamondFrame, placeBicycle, type BicyclePrimitive, type V3 } from '../kits/bicycle';

const OUT = fileURLToPath(new URL('../../../src/content/topics/energy-conversion/data/parts.json', import.meta.url));
export const ORIGIN: V3 = [0.90, 1.10, 1.60];
// Body inside the wheel circumference, neck pointing towards the tyre,
// tilted across the seat stay so the shell clears it and only the roller
// touches the sidewall. The mounting clamp is fixed to that stay.
const rawAxis: V3 = [-0.4400191, -0.6894795, -0.5750125];
export const DYNAMO_AXIS = rawAxis.map((v) => v / Math.hypot(...rawAxis)) as V3;
export const DYNAMO_AT: V3 = [1.2782811, 0.5479344, 1.6632257];
export const DYNAMO_HINGE: V3 = [1.281, 0.544, 1.646];
export const DYNAMO_OFF = -28;

export function rebuild(data: any): void {
  const parts = new Map<string, any>(data.parts.map((p: any) => [p.id, p]));
  const replace = (id: string, primitives: BicyclePrimitive[]) => {
    const part = parts.get(id);
    if (!part || !primitives.length) throw new Error(`Missing assembly: ${id}`);
    part.primitive = primitives[0];
    if (primitives.length > 1) part.extra = primitives.slice(1);
    else delete part.extra;
    part.castShadow = false;
  };
  const place = (p: BicyclePrimitive[]) => placeBicycle(p, ORIGIN, true);
  replace('bicycle-frame', [...place([...diamondFrame(), ...bicycleChain()]),
    { kind: 'torus', at: DYNAMO_HINGE, size: [0.009, 0.002], color: 'steel', rotation: [90, 0, -31.4] },
  ]);
  replace('front-wheel', place(bicycleWheel()));
  replace('rear-wheel', place(bicycleWheel(true)));
  replace('crank-pedals', place(bicycleCrankset()));

  const dynamo = bottleDynamo(DYNAMO_AT, DYNAMO_AXIS);
  // Clamp at the stay, a hinged arm and the terminal insulator.
  dynamo.casing.push(
    { kind: 'sweep', at: DYNAMO_HINGE, path: [[0, 0, 0], [-0.006, 0.001, 0.025], [-0.016, -0.019, 0.031]], radius: 0.004, radial: 12, segments: 12, caps: 'flat', color: 'steel' },
    // Feedthrough at the hinge: its position remains fixed as the bottle
    // swings away, so the frame-mounted leads stay connected in both poses.
    { kind: 'sphere', at: DYNAMO_HINGE, size: [0.004], color: 'rubber' },
  );
  replace('bicycle-dynamo', dynamo.casing);
  replace('dynamo-magnet', dynamo.rotor);
  replace('dynamo-coil', dynamo.coil);

  const wire: V3[] = [DYNAMO_HINGE, [1.28, 0.54, 1.627], [1.245, 0.48, 1.625], [1.16, 0.34, 1.63], [1.08, 0.315, 1.626], [0.65, 0.315, 1.626], [0.56, 0.34, 1.626], [0.52, 0.46, 1.626], [0.333, 0.38, 1.615]];
  replace('dynamo-wires', [0, 0.005].map((z) => ({ kind: 'sweep', at: [0, 0, 0], path: wire.map((p) => [p[0], p[1], p[2] + z]), radius: 0.0015, radial: 8, segments: 64, caps: 'flat', color: 'rubber' })));
  const lamp = parts.get('headlamp');
  for (const p of [lamp.primitive, ...lamp.extra]) p.segments = 64;

  const kettleAt: V3 = [2.6, 4.985, -2.95];
  const lathe = (at: V3, profile: [number, number][], color: string, rest = {}): BicyclePrimitive => ({ kind: 'lathe', at, profile, segments: 64, color, ...rest });
  replace('kettle', [
    lathe(kettleAt, [[0, -0.115], [0.078, -0.115], [0.084, -0.08], [0.087, 0.02], [0.08, 0.09], [0.07, 0.11], [0.068, 0.11], [0.078, 0.09], [0.085, 0.02], [0.082, -0.08], [0.076, -0.112], [0, -0.112]], 'stainless'),
    lathe(kettleAt, [[0, -0.15], [0.092, -0.15], [0.096, -0.145], [0.096, -0.13], [0.090, -0.126], [0.083, -0.126], [0.083, -0.114], [0, -0.114]], 'plastic', { tint: '#2a2928' }),
    lathe(kettleAt, [[0.086, -0.128], [0.093, -0.128], [0.093, -0.125], [0.086, -0.125], [0.086, -0.128]], 'stainless'),
    { kind: 'sweep', at: kettleAt, path: [[0.075, 0.08, 0], [0.116, 0.09, 0], [0.143, 0.065, 0], [0.144, -0.04, 0], [0.122, -0.075, 0], [0.082, -0.075, 0]], radius: 0.011, section: { flat: 0.75 }, up: [0, 0, 1], radial: 48, segments: 48, caps: 'flat', color: 'plastic', tint: '#2a2928' },
    { kind: 'sweep', at: kettleAt, path: [[-0.074, 0.085, 0], [-0.089, 0.100, 0], [-0.112, 0.112, 0]], radius: [0.026, 0.024, 0.014], section: { u: 160, flat: 0.75 }, up: [0, -1, 0], hollow: 0.0012, radial: 48, segments: 24, caps: 'none', color: 'stainless' },
    lathe(kettleAt, [[0, 0.111], [0.067, 0.111], [0.071, 0.114], [0.071, 0.12], [0.064, 0.126], [0.012, 0.127], [0.012, 0.137], [0, 0.139]], 'plastic', { tint: '#2a2928' }),
    { kind: 'bevelBox', at: [2.673, 5.097, -2.95], size: [0.023, 0.012, 0.026], bevel: 0.003, color: 'steel' },
  ]);
  parts.get('kettle-water').primitive.segments = 64;

  const surround: [number, number][] = Array.from({ length: 25 }, (_, i) => {
    const a = i * Math.PI * 2 / 24;
    return [0.066 + 0.0055 * Math.cos(a), 0.0055 * Math.sin(a)];
  });
  replace('speaker', [
    { kind: 'extrude', at: [-3.2, 4.55, -3.05], shape: [[-0.1, -0.16], [0.1, -0.16], [0.1, 0.16], [-0.1, 0.16]], holes: [[[-0.086, -0.146], [-0.086, 0.146], [0.086, 0.146], [0.086, -0.146]]], depth: 0.24, bevel: 0.001, color: 'wood', tint: '#6e4f36' },
    { kind: 'bevelBox', at: [-3.2, 4.55, -3.163], size: [0.173, 0.294, 0.014], bevel: 0.002, color: 'wood', tint: '#6e4f36' },
    { kind: 'panelHole', at: [-3.2, 4.55, -2.931], size: [0.181, 0.301, 0.012], hole: { r: 0.072, at: [0, 0.03] }, color: 'wood', tint: '#6e4f36' },
    lathe([-3.2, 4.58, -2.922], surround, 'rubber', { rotation: [90, 0, 0] }),
    { kind: 'extrude', at: [-3.2, 4.55, -2.919], shape: [[-0.096, -0.155], [0.096, -0.155], [0.096, 0.155], [-0.096, 0.155]], holes: [[[-0.089, -0.148], [-0.089, 0.148], [0.089, 0.148], [0.089, -0.148]]], depth: 0.006, bevel: 0.001, color: 'rubber' },
  ]);
  replace('speaker-cone', [lathe([-3.2, 4.58, -2.93], [[0, -0.013], [0.006, -0.014], [0.014, -0.02], [0.020, -0.027], [0.028, -0.022], [0.044, -0.010], [0.060, 0.004], [0.062, 0.004]], 'plastic', { rotation: [90, 0, 0], tint: '#2d2b29' })]);
  const fan = parts.get('fan-blades');
  fan.primitive.twist = 8;
  fan.primitive.sweep = 8;
  fan.extra = [lathe(fan.primitive.at, [[0, -0.068], [0.040, -0.067], [0.080, -0.063], [0.106, -0.055], [0.106, 0.020], [0.104, 0.022], [0.104, -0.054], [0, -0.054]], 'enamel', { tint: '#efebe2' })];

  // Static front wheel still uses the engine's each path to retain spoke
  // instancing. All spoke primitives share an axle pivot, so rear rotation
  // moves the wheel as a whole rather than spinning spokes in place.
  const wheel = data.animations.find((a: any) => a.id === 'wheel-spin');
  wheel.each = true;
  if (!data.animations.some((a: any) => a.id === 'front-wheel-rest')) data.animations.push({ id: 'front-wheel-rest', target: 'front-wheel', kind: 'rotate', axis: [0, 0, 1], rpm: 0, each: true });
  const crank = data.animations.find((a: any) => a.id === 'crank-spin');
  crank.pivot = [ORIGIN[0] + BICYCLE.crank[0], ORIGIN[1] - BICYCLE.crank[1], ORIGIN[2]].map((v) => Number(v.toFixed(7)));
  const rotor = data.animations.find((a: any) => a.id === 'magnet-spin');
  rotor.axis = DYNAMO_AXIS;
  rotor.pivot = DYNAMO_AT;
  data.poses['dynamo-off'] = Object.fromEntries(['bicycle-dynamo', 'dynamo-magnet', 'dynamo-coil'].map((id) => [id, { pivot: DYNAMO_HINGE, rotation: [DYNAMO_OFF, 0, 0] }]));
  data.poses['dynamo-off'].duration = 0.6;
  data.views.cuts.dynamo.offset = DYNAMO_AT[2];

  const paths: Record<string, V3[]> = {
    'dynamo-lamp': wire.map((p) => [p[0], p[1], p[2] + 0.012]),
    'pedal-wheel': [[1, 0.82, 1.685], [1, 0.727, 1.68], [1.42, 0.736, 1.68], [1.42, 0.77, 1.68]],
    'wheel-dynamo': [[1.42, 0.77, 1.64], [1.42, 1.08, 1.64], [1.18, 0.97, 1.64], [1.11, 0.77, 1.64], [1.18, 0.574, 1.64], [1.2532, 0.5086, 1.64], [1.2783, 0.5479, 1.68]],
    'dynamo-whirr': [[1.2783, 0.5479, 1.69], [1.53, 0.43, 2.18]],
    'dynamo': [[1.2783, 0.57, 1.69], [1.31, 0.70, 1.72], [1.29, 0.81, 1.75], [1.34, 0.92, 1.79], [1.31, 1.035, 1.82]],
  };
  for (const flow of data.flows) for (const p of flow.paths) if (paths[p.id]) p.path = paths[p.id];
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const data = JSON.parse(readFileSync(OUT, 'utf8'));
  rebuild(data);
  writeFileSync(OUT, JSON.stringify(data, null, 1) + '\n');
}
