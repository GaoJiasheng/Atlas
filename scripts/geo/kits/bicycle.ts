/**
 * A life-size diamond-frame city bicycle: fork, dished spoke wheels, chain
 * drive, saddle and swept handlebar. Build-time primitives for
 * energy-conversion; wheels also reusable by states-of-matter and forces.
 * Coordinates are upright, front to the left, wheel axles along Z.
 */
import { CatmullRomCurve3, Euler, Quaternion, Vector3 } from 'three';
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
  headTop: [-0.329, 0.814, 0] as V3,
  headBottom: [-0.370, 0.677, 0] as V3,
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
// Rounded forged outlines retain their actual openings and shoulder widths.
const roundedOutline = (points: V2[], samples: number): V2[] => {
  const curve = new CatmullRomCurve3(points.map(([x, y]) => new Vector3(x, y, 0)), true, 'centripetal');
  return Array.from({ length: samples }, (_, i): V2 => {
    const p = curve.getPoint(i / samples);
    return [round(p.x), round(p.y)];
  });
};
const member = (a: V3, b: V3, radius: number, color = 'powder'): BicyclePrimitive =>
  sweep(a, [[0, 0, 0], v3(b.map((v, i) => v - a[i]!))], radius, color, color === 'powder' ? paint : {});

/**
 * A padded touring saddle loft. The centreline is deliberately dished in
 * side elevation; many width stations give a rounded nose, narrow waist,
 * broad haunches and a rounded, almost square rear (not a flat extrusion).
 * Separate inset pan, bent 7 mm rails and the clamp keep the inverted view
 * as complete as the riding view. All dimensions here are design geometry.
 */
export function bicycleSaddle(): BicyclePrimitive[] {
  const xs = [.105, .113, .13, .16, .19, .22, .25, .28, .31, .335, .35, .363, .37];
  const widths = [.008, .015, .020, .022, .027, .040, .061, .078, .086, .084, .072, .047, .0005];
  const ys = [.938, .938, .937, .934, .929, .924, .922, .923, .925, .927, .928, .929, .930];
  const pad = sweep([0, 0, 0], xs.map((x, i) => [x, ys[i]!, 0]), widths, 'rubber', {
    section: { flat: .32 }, up: [0, 1, 0], radial: 48, segments: 64, caps: 'round', tint: '#292b2b',
  });
  // The moulded pan is inset below the rolled upholstery, visible from below.
  const pan = sweep([0, 0, 0], xs.map((x, i) => [x + (i === 0 ? .009 : i === xs.length - 1 ? -.003 : 0), ys[i]! - widths[i]! * .24 - .003, 0]), widths.map((w, i) => Math.max(.002, w * (i < 2 ? .8 : .95))), 'plastic', {
    section: { flat: .09 }, up: [0, 1, 0], radial: 20, segments: 36, caps: 'round', tint: '#161c1d',
  });
  const rail = sweep([0, 0, 0], [
    // Both ends turn up into the shell: at the nose the loop closes inside
    // the padding, at the rear the rails rise steeply into the pan sockets.
    [.128, .935, -.009], [.15, .919, -.016], [.175, .905, -.021], [.21, .886, -.022], [.29, .886, -.022], [.316, .892, -.032],
    [.330, .906, -.039], [.336, .925, -.040], [.340, .930, 0], [.336, .925, .040], [.330, .906, .039], [.316, .892, .032],
    [.29, .886, .022], [.21, .886, .022], [.175, .905, .021], [.15, .919, .016], [.128, .935, .009],
  ], .0035, 'steel', { radial: 8, segments: 48, closed: true, caps: 'none' });
  // Twin rail channels, separated clamp jaws and the saddle cradle form one
  // machined profile; the rail holes remain visible in the underside view.
  const clamp: BicyclePrimitive = {
    kind: 'extrude', at: [.267, .883, 0], depth: .041, bevel: .002, color: 'steel',
    rotation: [0, -90, 0],
    shape: [[-.033, -.006], [-.030, -.010], [-.018, -.014], [0, -.015], [.018, -.014], [.030, -.010], [.033, -.006], [.033, .005], [.028, .010], [.017, .011], [0, .008], [-.017, .011], [-.028, .010], [-.033, .005]],
    holes: [...[-.022, .022].map((z) => Array.from({ length: 16 }, (_, i): V2 => [z + .0037 * Math.cos(i * Math.PI / 8), .003 + .0037 * Math.sin(i * Math.PI / 8)])), [[-.016, .001], [.016, .001], [.016, .003], [-.016, .003]]],
  };
  return [pad, pan, rail, clamp];
}

/** Caliper is perpendicular to its mount, with an open tyre arch and rim pads. */
function rimBrake(at: V3, reach: number, tilt: number): BicyclePrimitive[] {
  // Profile coordinates are lateral Z, vertical Y. Extrusion is fore/aft X.
  const shape: V2[] = [
    [-.046, .021], [-.037, .025], [-.016, .009], [0, .008], [.023, -.001], [.034, -.019],
    [.033, -reach + .002], [.021, -reach + .004], [.021, -.029], [.014, -.016], [0, -.008],
    [-.014, -.018], [-.021, -.031], [-.021, -reach + .004], [-.033, -reach + .002], [-.034, -.025], [-.026, -.009], [-.039, .012],
  ];
  const q = new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), tilt * Math.PI / 180).multiply(new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), -Math.PI / 2));
  const e = new Euler().setFromQuaternion(q);
  const rotation: V3 = [e.x, e.y, e.z].map((v) => v * 180 / Math.PI) as V3;
  const arm: BicyclePrimitive = { kind: 'extrude', at, shape: roundedOutline(shape, 30), holes: [Array.from({ length: 6 }, (_, i): V2 => [.0025 * Math.cos(i * Math.PI / 3), .0025 * Math.sin(i * Math.PI / 3)])], depth: .009, bevel: .0015, color: 'steel', rotation };
  const a = tilt * Math.PI / 180;
  const padAt: V3 = [at[0] + Math.sin(a) * reach, at[1] - Math.cos(a) * reach, at[2]];
  // Two separate oval shoes on a common axle line. Zero-radius sections
  // between them make no connecting disc through the tyre.
  const profile: V2[] = [[0, -.025], [.0048, -.025], [.0058, -.023], [.0058, -.016], [.0048, -.014], [0, -.014], [0, .014], [.0048, .014], [.0058, .016], [.0058, .023], [.0048, .025], [0, .025]];
  const shoeQ = new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), a).multiply(new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), Math.PI / 2));
  const shoeE = new Euler().setFromQuaternion(shoeQ);
  const shoeRotation = [shoeE.x, shoeE.y, shoeE.z].map((v) => v * 180 / Math.PI) as V3;
  const shoes = lathe(padAt, profile, 'rubber', { rotation: shoeRotation, scale: [3, 1, 1], segments: 24 });
  return [arm, shoes];
}

/** All static frame members; no wheels or drive components move with it. */
export function diamondFrame(): BicyclePrimitive[] {
  const { crank: b, seat: s, headTop: h, headBottom: l, rear: r, front: f } = BICYCLE;
  // A continuous welded perimeter: close support stations retain straight
  // tube runs and the small, rounded mitres at the head-tube junctions.
  const frame: BicyclePrimitive[] = [sweep([0, 0, 0], [
    b, [-.33, .651, 0], l, [-.365, .701, 0], [-.337, .792, 0], h, [-.31, .813, 0], [.22, .781, 0], s, [.238, .756, 0], [.109, .309, 0],
  ], [.018, .018, .020, .020, .020, .020, .014, .014, .014, .015, .015], 'powder', { ...paint, radial: 20, segments: 96, closed: true, caps: 'none' })];
  for (const side of [-1, 1]) {
    const z = side * .055;
    // The tapered rear-stay junction is flattened across Z like a stamped
    // rear end, brazed to the forward face of the slotted dropout.
    frame.push(sweep([0, 0, 0], [[s[0], s[1], z * .35], [.490, .372, z], [.502, .352, z], [.498, .338, z], [.486, .327, z], [b[0], b[1], z * .6]], [.008, .008, .006, .006, .008, .009], 'powder', { ...paint, radial: 16, segments: 48, up: [0, 0, 1], section: { flat: .65 } }));
    frame.push(sweep([0, 0, 0], [[-.386, .645, z * .74], [-.411, .559, z * .95], [-.455, .440, z], [-.491, .365, z], [f[0] + .007, f[1] + .008, z]], [.015, .0125, .0105, .0075, .006], 'powder', { ...paint, radial: 20, segments: 32, up: [0, 0, 1], section: { flat: .72 } }));
    // Open downward axle slot with a rounded root, not a closed torus.
    frame.push({ kind: 'extrude', at: [f[0], f[1], z], depth: .004, bevel: .0006, color: 'steel', shape: [
      [-.012, -.010], [-.014, .002], [-.011, .012], [-.004, .018], [.008, .016], [.014, .006], [.012, -.010],
      [.005, -.010], [.005, .001], [.0035, .0045], [0, .006], [-.0035, .0045], [-.005, .001], [-.005, -.010],
    ] });
    frame.push({ kind: 'extrude', at: [r[0], r[1], z], rotation: [0, 0, 90], depth: .004, bevel: .0006, color: 'steel', shape: [
      [-.012, -.010], [-.014, .002], [-.011, .012], [-.004, .025], [.008, .024], [.014, .006], [.012, -.010],
      [.005, -.010], [.005, .001], [.0035, .0045], [0, .006], [-.0035, .0045], [-.005, .001], [-.005, -.010],
    ] });
  }
  // A forged crown has shoulders, a tyre-clearance arch and blade sockets.
  frame.push({ kind: 'extrude', at: [-.381, .658, 0], rotation: [0, -90, 0], depth: .030, bevel: .002, ...paint,
    shape: roundedOutline([[-.054, -.016], [-.048, .005], [-.025, .015], [0, .019], [.025, .015], [.048, .005], [.054, -.016], [.036, -.016], [.030, -.003], [.016, .002], [-.016, .002], [-.030, -.003], [-.036, -.016]], 32),
  });
  frame.push(lathe(b, [[0, -.037], [.021, -.037], [.024, -.034], [.024, .034], [.021, .037], [0, .037]], 'steel', { rotation: [90, 0, 0], segments: 32 }));
  const headLength = Math.hypot(h[0] - l[0], h[1] - l[1]);
  // Both bearing cups, top race, locknut shoulder and quill expander bolt;
  // the zero-radius middle stays hidden inside the painted head tube.
  frame.push(lathe(l, [[0, -.015], [.024, -.015], [.026, -.012], [.026, -.005], [.022, 0], [0, 0], [0, headLength - .003], [.023, headLength - .003], [.026, headLength + .002], [.026, headLength + .008], [.021, headLength + .011], [.021, headLength + .019], [.018, headLength + .023], [0, headLength + .023], [0, headLength + .085], [.0045, headLength + .085], [.006, headLength + .087], [.006, headLength + .091], [.002, headLength + .092], [.002, headLength + .088], [0, headLength + .088]], 'steel', { rotation: [0, 0, -16.7], segments: 32 }));
  frame.push(sweep(s, [[0, 0, 0], [.031, .103, 0], [.033, .107, 0], [.024, .111, 0], [.023, .120, 0], [.023, .123, 0]], [.012, .012, .016, .012, .005, .006], 'steel', { radial: 20, segments: 20, section: { flat: .8 }, up: [0, 0, 1] }));
  frame.push(...bicycleSaddle());
  // Quill follows the steerer, then the forged extension reaches FORWARD.
  // Its nose is the split clamp around the bar's central straight section.
  frame.push(sweep([0, 0, 0], [[-.565, .72, 0], [-.39, .683, 0], l, [-.364, .697, 0], [-.335, .794, 0], h, [-.307, .884, 0], [-.309, .901, 0], [-.330, .912, 0], [-.390, .912, 0]], [.004, .004, .004, .004, .006, .011, .011, .014, .014, .014], 'steel', { radial: 24, segments: 32 }));
  frame.push(lathe([-.395, .912, 0], [[.011, -.017], [.016, -.017], [.018, -.013], [.018, .013], [.016, .017], [.011, .017], [.011, -.017]], 'steel', { segments: 32, arc: 352, rotation: [90, 0, 0] }));
  frame.push(sweep([0, 0, 0], [[-.295, .935, -.285], [-.340, .935, -.205], [-.385, .927, -.139], [-.395, .912, -.075], [-.395, .912, .075], [-.385, .927, .139], [-.340, .935, .205], [-.295, .935, .285]], .0111, 'steel', { radial: 20, segments: 48 }));
  // A continuous undersleeve follows the steel bar between the two grips.
  // Its small central radius is completely inside the metal tube, while
  // short shoulder stations make the two visible grip ends crisp.
  frame.push(sweep([0, 0, 0], [[-.295, .935, -.285], [-.300, .935, -.276], [-.337, .935, -.210], [-.340, .935, -.205], [-.343, .934, -.200], [-.385, .927, -.139], [-.395, .912, -.075], [-.395, .912, .075], [-.385, .927, .139], [-.343, .934, .200], [-.340, .935, .205], [-.337, .935, .210], [-.300, .935, .276], [-.295, .935, .285]], [.015, .015, .015, .015, .008, .008, .008, .008, .008, .008, .015, .015, .015, .015], 'rubber', { radial: 16, segments: 80, caps: 'round', rings: { every: .005, depth: .07 } }));
  for (const side of [-1, 1]) {
    frame.push(sweep([0, 0, 0], [[-.357, .932, side * .182], [-.369, .925, side * .188], [-.385, .922, side * .205], [-.370, .916, side * .232], [-.337, .913, side * .274]], [.014, .013, .009, .005, .0035], 'steel', { radial: 16, segments: 28, section: { flat: .55 }, up: [0, 1, 0], caps: 'round' }));
  }
  const frontBrake: V3 = [-.401, .664, 0], rearBrake: V3 = [.325, .650, 0];
  frame.push(...rimBrake(frontBrake, .068, -25), ...rimBrake(rearBrake, .087, 30));
  frame.push(sweep([0, 0, 0], [[-.385, .922, -.205], [-.455, .884, -.175], [-.478, .775, -.095], [-.421, .697, -.045], [-.3934, .6803, -.038]], .0022, 'rubber', { radial: 8, segments: 40 }));
  frame.push(sweep([0, 0, 0], [[-.385, .922, .205], [-.444, .873, .155], [-.409, .799, .050], [-.30, .825, .014], [.19, .793, .014], [.255, .761, .029], [.298, .697, -.029], [.316, .670, -.038]], .0022, 'rubber', { radial: 8, segments: 64 }));
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
  const bands = [-0.004, 0.004].map((z) => sweep([0, 0, 0], path.map((p) => [p[0], p[1], p[2] + z]), 0.0018, 'steel', { radial: 8, closed: true, caps: 'none', section: { flat: 0.40 }, up: [0, 0, 1], rings: { every: 0.0127, depth: 0.22 }, segments: 96 }));
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
    const pedalAt: V3 = [at[0] + .09 * side, at[1] + .145 * side, side * .13];
    out.push({ kind: 'extrude', at: pedalAt, rotation: [90, 0, 0], depth: .018, bevel: .0015, color: 'powder', tint: '#303938',
      shape: [[-.043, -.0375], [.043, -.0375], [.0475, -.032], [.0475, .032], [.043, .0375], [-.043, .0375], [-.0475, .032], [-.0475, -.032]],
      holes: [-1, 1].flatMap((x) => [-1, 1].map((z): V2[] => [[x * .010, z * .007], [x * .035, z * .007], [x * .035, z * .026], [x * .010, z * .026]])),
    });
    // Amber front/rear reflectors are inset in the platform's moulded rim.
    for (const x of [-1, 1]) out.push({ kind: 'bevelBox', at: [pedalAt[0] + x * .047, pedalAt[1], pedalAt[2]], size: [.002, .010, .048], bevel: .0007, color: 'plastic', tint: '#a67c35' });
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
