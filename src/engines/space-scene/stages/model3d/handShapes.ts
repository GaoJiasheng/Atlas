/**
 * Procedural hand geometry for exercise mode (lib/hands.ts plans the kind and
 * the frame). Adult sizes in metres: palm 84 × 85 × 27 mm, fingers 15–17 mm
 * thick, thumb 21 mm. Each kind is one merged, non-indexed geometry in the
 * hand's frame (x toward the thumb, y along the hand, z the palm's normal):
 *
 *  - `fist`: origin on the grip axis (the held bar's centre line, along x);
 *    the palm sits behind it (−z), four fingers wrap the axis as short tubes
 *    from the knuckles over the far side, the thumb closes the other way
 *    round, over the fingers;
 *  - `palm`: origin under the wrist on the surface (the heel of the hand);
 *    the palm flat on z = 0, fingers forward along +y, thumb out to the side;
 *  - `relaxed`: origin at the wrist; palm along +y, fingers curled a little
 *    toward the palm side.
 *
 * `wristLink` is a unit open cylinder (radius 1, y 0 → 1) the stage
 * stretches from the wrist joint to the hand's heel, `wristCap` a unit sphere
 * on the joint.
 */
import { BufferGeometry, CatmullRomCurve3, CylinderGeometry, SphereGeometry, TubeGeometry, Vector3 } from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { HandKind } from '../../lib/hands';

/** Palm: width (x), length (y), thickness (z). */
export const PALM = { width: 0.084, length: 0.085, thick: 0.027 } as const;
/** Finger tube radii and x positions, index → pinky (the index finger is on the thumb's side, +x). */
const FINGERS = [
  { x: 0.029, r: 0.0085, len: 0.072 },
  { x: 0.0095, r: 0.0088, len: 0.08 },
  { x: -0.0095, r: 0.0084, len: 0.075 },
  { x: -0.0285, r: 0.0074, len: 0.06 },
] as const;
const THUMB_R = 0.0105;
/** Wrist link radius (the skin's wrist is ~55 × 40 mm). */
export const WRIST_RADIUS = 0.021;

/** A tube through `points` with rounded ends, non-indexed. */
function tube(points: Vector3[], radius: number): BufferGeometry {
  const curve = new CatmullRomCurve3(points, false, 'centripetal');
  const body = new TubeGeometry(curve, Math.max(6, points.length * 3), radius, 8, false);
  const cap = (p: Vector3) => new SphereGeometry(radius, 8, 6).translate(p.x, p.y, p.z);
  return merge([body, cap(points[0]!), cap(points[points.length - 1]!)]);
}

function merge(parts: BufferGeometry[]): BufferGeometry {
  const flat = parts.map((g) => {
    const n = g.index ? g.toNonIndexed() : g;
    if (n !== g) g.dispose();
    n.deleteAttribute('uv');
    return n;
  });
  const out = mergeGeometries(flat, false)!;
  flat.forEach((g) => g.dispose());
  return out;
}

const v = (x: number, y: number, z: number) => new Vector3(x, y, z);

/** Points on an arc about the x axis at `x` (radius `R`, centre (y0, z0)), φ measured from −z toward +y, degrees. */
function arc(x: number, R: number, from: number, to: number, steps: number, y0 = 0, z0 = 0): Vector3[] {
  const out: Vector3[] = [];
  for (let i = 0; i <= steps; i++) {
    const phi = ((from + ((to - from) * i) / steps) * Math.PI) / 180;
    out.push(v(x, y0 + R * Math.sin(phi), z0 - R * Math.cos(phi)));
  }
  return out;
}

function palmBox(cy: number, cz: number): BufferGeometry {
  return new RoundedBoxGeometry(PALM.width, PALM.length, PALM.thick, 2, 0.009).translate(0, cy, cz);
}

/** A fist closed around a grip of radius `r` (along x through the origin). */
export function fistGeometry(r: number): BufferGeometry {
  const parts: BufferGeometry[] = [];
  // The palm just behind the grip, its top at the knuckle row (y ≈ 0).
  const palmZ = -(r + 0.002 + PALM.thick / 2);
  parts.push(palmBox(-PALM.length / 2 + 0.004, palmZ));
  // Fingers: from the knuckles (palm side, −z) over the far side (+y) round to the front, ending toward the wrist.
  for (const f of FINGERS) {
    const R = r + f.r + 0.0012;
    const wrap = Math.min(275, 180 + ((f.len - 0.045) / (2 * Math.PI * R)) * 360);
    parts.push(tube([v(f.x, -0.012, palmZ + PALM.thick / 2 - f.r * 0.4), ...arc(f.x, R, 0, wrap, 9)], f.r));
  }
  // Thumb: from the base of the palm on the thumb side, under the grip on the wrist side, over the fingers in front.
  const Rt = r + 2 * FINGERS[1].r + THUMB_R * 0.7;
  parts.push(tube([v(0.04, -0.062, palmZ + 0.004), v(0.036, -0.04, palmZ - 0.002), ...arc(0.022, Rt, -55, -150, 5).slice(1)], THUMB_R));
  return merge(parts);
}

/** A flat open hand on a surface (z = 0 is the surface, the hand on −z). */
export function palmGeometry(): BufferGeometry {
  const parts: BufferGeometry[] = [palmBox(PALM.length / 2, -PALM.thick / 2)];
  FINGERS.forEach((f, i) => {
    const spread = (i - 1.5) * -0.05;
    const y0 = PALM.length - 0.006;
    parts.push(tube([v(f.x, y0, -f.r), v(f.x + spread * f.len * 0.5, y0 + f.len * 0.5, -f.r), v(f.x + spread * f.len, y0 + f.len, -f.r)], f.r));
  });
  parts.push(tube([v(0.03, 0.018, -0.013), v(0.056, 0.042, -0.011), v(0.072, 0.07, -THUMB_R)], THUMB_R));
  return merge(parts);
}

/** A free hand, the fingers curled a little toward the palm side (+z). */
export function relaxedGeometry(): BufferGeometry {
  const parts: BufferGeometry[] = [palmBox(PALM.length / 2, 0)];
  for (const f of FINGERS) {
    const C = 0.065;
    parts.push(tube(arc(f.x, C, 0, Math.min(80, (f.len / C) * (180 / Math.PI)), 5, PALM.length - 0.006, C), f.r));
  }
  parts.push(tube([v(0.034, 0.012, 0.006), v(0.05, 0.04, 0.016), v(0.054, 0.068, 0.028)], THUMB_R));
  return merge(parts);
}

export function handGeometry(kind: HandKind, radius: number): BufferGeometry {
  return kind === 'fist' ? fistGeometry(radius) : kind === 'palm' ? palmGeometry() : relaxedGeometry();
}

/** Unit open cylinder along +y (0 → 1), radius 1: the wrist link, stretched per frame. */
export function wristLinkGeometry(): BufferGeometry {
  return merge([new CylinderGeometry(1, 1, 1, 12, 1, true).translate(0, 0.5, 0)]);
}

/** Unit sphere: the wrist joint (it closes the skin's open wrist). */
export function wristCapGeometry(): BufferGeometry {
  return merge([new SphereGeometry(1, 12, 8)]);
}

/**
 * Where the hand's heel is in its own frame (the wrist link runs from the
 * wrist joint to it): the base of the palm.
 */
export function heelPoint(kind: HandKind, radius: number): [number, number, number] {
  if (kind === 'fist') return [0, -PALM.length + 0.012, -(radius + 0.002 + PALM.thick / 2)];
  if (kind === 'palm') return [0, 0.012, -PALM.thick / 2];
  return [0, 0, 0];
}
