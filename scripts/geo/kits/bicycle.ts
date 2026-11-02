/**
 * A life-size diamond-frame city bicycle: fork, dished spoke wheels, chain
 * drive, saddle and swept handlebar. Build-time primitives for
 * energy-conversion; wheels also reusable by states-of-matter and forces.
 * Coordinates are upright, front to the left, wheel axles along Z.
 */
import { Euler, Quaternion, Vector3 } from 'three';
import type { z } from 'zod';
import type { primitiveSchema } from '../../../src/engines/space-scene/schema';

export type BicyclePrimitive = z.input<typeof primitiveSchema>;
export type V3 = [number, number, number];
type V2 = [number, number];
const paint = { color: 'powder', tint: '#2f5d62' };
const round = (v: number) => Number(v.toFixed(7)) || 0;
const v3 = (v: number[]): V3 => [round(v[0]!), round(v[1]!), round(v[2]!)];
export const BICYCLE = {
  front: [-0.52, 0.33, 0] as V3,
  rear: [0.52, 0.33, 0] as V3,
  crank: [0.10, 0.28, 0] as V3,
  seat: [0.245, 0.78, 0] as V3,
  headTop: [-0.34, 0.78, 0] as V3,
  headBottom: [-0.385, 0.63, 0] as V3,
  tyreRadius: 2.07 / (2 * Math.PI),
  tyreSection: 0.01945,
  rimRadius: 0.289,
  chainring: 0.093,
  sprocket: 0.093 * 0.37,
  chainZ: -0.070,
  spokes: 28,
} as const;

const lathe = (at: V3, profile: V2[], color: string, rest = {}): BicyclePrimitive =>
  ({ kind: 'lathe', at, profile, segments: 64, color, ...rest });
const sweep = (at: V3, path: V3[], radius: number | number[], color: string, rest = {}): BicyclePrimitive =>
  ({ kind: 'sweep', at, path, radius, radial: 16, segments: 12, caps: 'flat', color, ...rest });
const member = (a: V3, b: V3, radius: number, color = 'powder'): BicyclePrimitive =>
  sweep(a, [[0, 0, 0], v3(b.map((v, i) => v - a[i]!))], radius, color, color === 'powder' ? paint : {});

/** All static frame members; no wheels or drive components move with it. */
export function diamondFrame(): BicyclePrimitive[] {
  const { crank: b, seat: s, headTop: h, headBottom: l, rear: r, front: f } = BICYCLE;
  const frame: BicyclePrimitive[] = [
    member(s, h, 0.014), member(b, l, 0.018), member(b, s, 0.015), member(h, l, 0.020),
  ];
  for (const z of [-0.055, 0.055]) {
    frame.push(member([s[0], s[1], z * 0.35], [r[0], r[1], z], 0.0075));
    frame.push(member([b[0], b[1], z * 0.6], [r[0], r[1], z], 0.009));
    // Crown to dropout: gradual taper and forward rake, on both sides of the tyre.
    frame.push(sweep([0, 0, 0], [[l[0] - 0.009, l[1] - 0.03, z], [-0.42, 0.49, z], [-0.485, 0.35, z], [f[0], f[1], z]], [0.014, 0.012, 0.007, 0.006], 'powder', { ...paint, segments: 32 }));
    for (const axle of [f, r]) frame.push(lathe([axle[0], axle[1], z], [[0.005, -0.004], [0.012, -0.004], [0.012, 0.004], [0.005, 0.004], [0.005, -0.004]], 'steel', { rotation: [90, 0, 0] }));
  }
  frame.push(member([-0.394, 0.60, -0.055], [-0.394, 0.60, 0.055], 0.015));
  frame.push(lathe(b, [[0, -0.037], [0.023, -0.037], [0.023, 0.037], [0, 0.037]], 'steel', { rotation: [90, 0, 0] }));
  for (const p of [h, l]) frame.push(lathe(p, [[0, -0.005], [0.024, -0.005], [0.024, 0.005], [0, 0.005]], 'steel', { rotation: [0, 0, -16.7] }));
  frame.push(member(s, [0.280, 0.895, 0], 0.012, 'steel'));
  // The saddle has a narrow nose, broad rounded rear and thin curved padding.
  frame.push(sweep([0, 0, 0], [[0.085, 0.926, 0], [0.16, 0.928, 0], [0.26, 0.925, 0], [0.34, 0.927, 0], [0.37, 0.925, 0]], [0.012, 0.025, 0.063, 0.072, 0.030], 'rubber', { section: { flat: 0.24 }, up: [0, 1, 0], caps: 'round', segments: 40 }));
  for (const z of [-0.025, 0.025]) frame.push(sweep([0, 0, 0], [[0.14, 0.914, z], [0.21, 0.888, z], [0.30, 0.882, z], [0.34, 0.907, z]], 0.003, 'steel', { segments: 20 }));
  frame.push(sweep([0, 0, 0], [h, [-0.315, 0.885, 0], [-0.25, 0.908, 0]], 0.012, 'steel', { segments: 24 }));
  frame.push(sweep([0, 0, 0], [[-0.17, 0.935, -0.28], [-0.20, 0.935, -0.20], [-0.25, 0.908, -0.10], [-0.25, 0.908, 0.10], [-0.20, 0.935, 0.20], [-0.17, 0.935, 0.28]], 0.011, 'steel', { segments: 48 }));
  for (const z of [-1, 1]) frame.push(member([-0.20, 0.935, z * 0.20], [-0.17, 0.935, z * 0.28], 0.016, 'rubber'));
  frame.push(member(l, [-0.565, 0.72, 0], 0.004, 'steel'));
  return frame;
}

/** The toothed outline has three vertices per tooth (46 teeth fit the 160-point limit). */
function sprocket(at: V3, radius: number, teeth: number, pierced: boolean): BicyclePrimitive {
  const shape: V2[] = [];
  for (let k = 0; k < teeth; k++) for (const [phase, dr] of [[0, -0.002], [0.35, 0.002], [0.65, 0.002]]) {
    const a = (k + phase!) / teeth * Math.PI * 2;
    shape.push([round((radius + dr!) * Math.cos(a)), round((radius + dr!) * Math.sin(a))]);
  }
  const holes: V2[][] = [];
  if (pierced) for (let k = 0; k < 5; k++) {
    const a = k * Math.PI * 2 / 5;
    holes.push(Array.from({ length: 12 }, (_, j): V2 => {
      const t = j * Math.PI * 2 / 12;
      return [round(Math.cos(a) * 0.051 + Math.cos(t) * 0.021), round(Math.sin(a) * 0.051 + Math.sin(t) * 0.021)];
    }));
  }
  return { kind: 'extrude', at, shape, ...(holes.length ? { holes } : {}), depth: 0.0035, bevel: 0, color: 'steel' };
}

/**
 * Every primitive is anchored at the axle, including spokes. With `each`
 * rotation the engine instances the four spoke patterns, all about that
 * common axle. This preserves the complete wheel's rotation and dishing.
 */
export function bicycleWheel(rear = false): BicyclePrimitive[] {
  const at: V3 = [...(rear ? BICYCLE.rear : BICYCLE.front)];
  const major = BICYCLE.tyreRadius - BICYCLE.tyreSection;
  const tyre: V2[] = Array.from({ length: 25 }, (_, k) => {
    const t = k * Math.PI * 2 / 24;
    return [round(major + BICYCLE.tyreSection * Math.cos(t)), round(0.021 * Math.sin(t))];
  });
  const wheel: BicyclePrimitive[] = [lathe(at, tyre, 'rubber', { segments: 96, rotation: [90, 0, 0] })];
  wheel.push(lathe(at, [[0.281, -0.010], [0.290, -0.012], [0.295, -0.009], [0.295, 0.009], [0.290, 0.012], [0.281, 0.010], [0.281, -0.010]], 'steel', { segments: 96, rotation: [90, 0, 0] }));
  wheel.push(lathe(at, [[0, -0.060], [0.005, -0.060], [0.005, -0.035], [0.024, -0.031], [0.024, -0.027], [0.012, -0.024], [0.012, 0.024], [0.024, 0.027], [0.024, 0.031], [0.005, 0.035], [0.005, 0.060], [0, 0.060]], 'steel', { rotation: [90, 0, 0] }));
  for (let k = 0; k < BICYCLE.spokes; k++) {
    const side = k % 2 === 0 ? -1 : 1;
    const lace = Math.floor(k / 2) % 2 === 0 ? -1 : 1;
    const a = lace * Math.PI * 2 * 2 / 14;
    wheel.push(sweep(at, [[round(0.023 * Math.cos(a)), round(0.023 * Math.sin(a)), side * 0.029], [BICYCLE.rimRadius - 0.006, 0, 0]], 0.0011, 'steel', { segments: 4, radial: 6, rotation: [0, 0, k * 360 / BICYCLE.spokes] }));
  }
  if (rear) {
    const gear = sprocket(at, BICYCLE.sprocket, 17, false);
    // Z displacement leaves the rotation axis unchanged.
    gear.at = [at[0], at[1], BICYCLE.chainZ];
    wheel.push(gear);
  }
  return wheel;
}

/** Chain tangent points, sampled around both sprockets, clockwise from the top. */
export function chainLoop(): V3[] {
  const a = BICYCLE.crank, b = BICYCLE.rear;
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const phi = Math.atan2(dy, dx);
  const tangent = Math.acos((BICYCLE.chainring - BICYCLE.sprocket) / Math.hypot(dx, dy));
  const top = phi + tangent, bottom = phi - tangent;
  const p: V3[] = [];
  const arc = (c: V3, radius: number, start: number, end: number, n: number) => {
    for (let i = 0; i <= n; i++) {
      const t = start + (end - start) * i / n;
      p.push([c[0] + radius * Math.cos(t), c[1] + radius * Math.sin(t), BICYCLE.chainZ]);
    }
  };
  arc(b, BICYCLE.sprocket, top, bottom, 16);
  const line = (from: V3, to: V3) => {
    for (let k = 1; k < 12; k++) p.push(from.map((v, i) => v + (to[i]! - v) * k / 12) as V3);
  };
  const point = (c: V3, r: number, angle: number): V3 => [c[0] + r * Math.cos(angle), c[1] + r * Math.sin(angle), BICYCLE.chainZ];
  line(point(b, BICYCLE.sprocket, bottom), point(a, BICYCLE.chainring, bottom));
  arc(a, BICYCLE.chainring, bottom, top - Math.PI * 2, 32);
  line(point(a, BICYCLE.chainring, top), point(b, BICYCLE.sprocket, top));
  return p;
}

/** Twin continuous sideplate bands with a link-pitch joint rhythm; no loose chain through the frame. */
export function bicycleChain(): BicyclePrimitive[] {
  const path = chainLoop();
  const bands = [-0.004, 0.004].map((z) => sweep([0, 0, 0], path.map((p) => [p[0], p[1], p[2] + z]), 0.0018, 'steel', { radial: 8, closed: true, caps: 'none', section: { flat: 0.40 }, up: [0, 0, 1], rings: { every: 0.0127, depth: 0.22 }, segments: 120 }));
  // Repeated short links on the two taut runs. `fins` supplies the repeat
  // transforms; the engine bakes these static links into the frame's steel
  // slot. The continuous sideplates also join the curved sprocket wraps.
  for (const [a, b] of [[path[60]!, path[0]!], [path[28]!, path[16]!]]) {
    const length = Math.hypot(b![0] - a![0], b![1] - a![1]);
    bands.push({ kind: 'fins', at: [(a![0] + b![0]) / 2, (a![1] + b![1]) / 2, BICYCLE.chainZ], size: [0.008, 0.0055, 0.0105], count: Math.floor(length / 0.0127), gap: 0.0022, axis: 'x', rotation: [0, 0, Math.atan2(b![1] - a![1], b![0] - a![0]) * 180 / Math.PI], color: 'steel' });
  }
  return bands;
}

export function bicycleCrankset(): BicyclePrimitive[] {
  const at: V3 = [...BICYCLE.crank];
  const out = [sprocket([at[0], at[1], BICYCLE.chainZ], BICYCLE.chainring, 46, true)];
  for (const side of [-1, 1]) {
    const z = side * 0.085;
    out.push(sweep([0, 0, 0], [[at[0], at[1], z], [at[0] + 0.075 * side, at[1] + 0.12 * side, z], [at[0] + 0.09 * side, at[1] + 0.145 * side, z]], [0.012, 0.009, 0.009], 'steel', { section: { flat: 0.6 }, up: [0, 0, 1] }));
    out.push({ kind: 'bevelBox', at: [at[0] + 0.09 * side, at[1] + 0.145 * side, side * 0.13], size: [0.095, 0.021, 0.075], bevel: 0.004, color: 'rubber' });
    out.push(member([at[0] + 0.09 * side, at[1] + 0.145 * side, z], [at[0] + 0.09 * side, at[1] + 0.145 * side, side * 0.13], 0.006, 'steel'));
  }
  return out;
}

/** Proper rigid placement, including inversion, without changing primitive-local paths. */
export function placeBicycle(primitives: BicyclePrimitive[], origin: V3, upsideDown = false): BicyclePrimitive[] {
  const q = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), upsideDown ? Math.PI : 0);
  return primitives.map((p) => {
    const at = new Vector3(...p.at).applyQuaternion(q).add(new Vector3(...origin));
    const old = new Euler(...(p.rotation ?? [0, 0, 0]).map((v) => v * Math.PI / 180) as V3);
    const euler = new Euler().setFromQuaternion(q.clone().multiply(new Quaternion().setFromEuler(old)));
    return { ...p, at: v3(at.toArray()), rotation: v3([euler.x, euler.y, euler.z].map((v) => v * 180 / Math.PI)) };
  });
}

export function axisRotation(axis: V3): V3 {
  const q = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), new Vector3(...axis).normalize());
  const e = new Euler().setFromQuaternion(q);
  return v3([e.x, e.y, e.z].map((v) => v * 180 / Math.PI));
}

/** Hollow turned bottle shell, separate rotating roller/shaft and two-pole rotor. */
export function bottleDynamo(at: V3, axis: V3): { casing: BicyclePrimitive[]; rotor: BicyclePrimitive[]; coil: BicyclePrimitive[] } {
  const rotation = axisRotation(axis);
  const place = (y: number): V3 => v3(at.map((v, i) => v + axis[i]! * y));
  const casing = [lathe(at, [
    [0, -0.048], [0.013, -0.048], [0.018, -0.044], [0.020, -0.039],
    [0.020, 0.018], [0.0195, 0.023], [0.017, 0.029], [0.012, 0.034],
    [0.008, 0.037], [0.007, 0.043], [0.007, 0.049],
    [0.0055, 0.049], [0.0055, 0.043], [0.0065, 0.037], [0.0105, 0.033],
    [0.0155, 0.028], [0.018, 0.022], [0.0185, 0.017], [0.0185, -0.039], [0.013, -0.045], [0, -0.045],
  ], 'casing', { rotation })];
  const pole = [[0, -0.018], [0.009, -0.018], [0.009, 0.018], [0, 0.018]] as V2[];
  const rotor: BicyclePrimitive[] = [
    lathe(at, pole, 'token:pole-n', { rotation, arc: 180 }),
    lathe(at, pole, 'token:pole-s', { rotation, arc: 180, mirror: 'z' }),
    lathe(at, [[0, -0.025], [0.0025, -0.025], [0.0025, 0.064], [0, 0.064]], 'steel', { rotation }),
    lathe(place(0.057), [[0, -0.006], [0.0095, -0.006], [0.011, -0.0045], [0.011, 0.0045], [0.0095, 0.006], [0, 0.006]], 'steel', { rotation }),
    { kind: 'coil', at: place(0.057), rotation, radius: 0.0107, wire: 0.00045, turns: 9, length: 0.010, segments: 24, radial: 6, color: 'steel' },
  ];
  const coil: BicyclePrimitive[] = [{ kind: 'coil', at, rotation, radius: 0.0135, wire: 0.0012, turns: 14, length: 0.034, segments: 24, radial: 8, color: 'copper' }];
  return { casing, rotor, coil };
}
