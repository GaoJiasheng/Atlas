/**
 * The flower-and-seed table's layout (docs/41 §3.2, as built): one round
 * specimen table 1.9 m across (1 scene unit = 1 m, top at y = 0) and a small
 * table outside it. Stations sit at clock angles θ (degrees clockwise from
 * the back, seen from above: the flower at 12 o'clock is at −Z) and face the
 * table's centre, where the reader stands. A station frame has its origin on
 * the table, +Z towards the centre, +X to the reader's right.
 */
import { DEG, r3, type Model, type Prim, type V3 } from '../living-things/kit';
import { add3, prims, shiftModel, turnModel } from './models';
import { axisAngle, I3, mulMM, mulMV, type M3 } from './reuse';

export const R_TABLE = 0.94;
/** The radius of the `cycle` flow, between the reader and the stations. */
export const RING = 0.34;

/** A point on the table at clock angle θ and radius r. */
export const polar = (theta: number, r: number, y = 0): V3 => r3([r * Math.sin(theta * DEG), y, -r * Math.cos(theta * DEG)]);

export interface Station {
  theta: number;
  r: number;
  o: V3;
  m: M3;
}
/** The turn that takes a model's front (+Z) to face the centre from angle θ. */
const faceCentre = (theta: number): M3 => axisAngle([0, 1, 0], -theta);
const station = (theta: number, r: number): Station => ({ theta, r, o: polar(theta, r), m: faceCentre(theta) });

/** A station's local point in the scene. */
export const at = (s: Station, local: readonly number[]): V3 => add3(s.o, mulMV(s.m, local));
/** A station's local direction in the scene. */
export const dirIn = (s: Station, local: readonly number[]): V3 => r3(mulMV(s.m, local));
/** A model built in its own frame placed at `local` in a station, tilted by `tilt` and then turned by `yawDeg` about its vertical. */
export const place = (s: Station, m: Model, local: readonly number[], yawDeg = 0, tilt: M3 = I3): Prim[] =>
  prims(shiftModel(turnModel(turnModel(m, tilt), mulMM(s.m, axisAngle([0, 1, 0], yawDeg))), at(s, local)));

export const FLOWER = station(0, 0.66);
export const VISIT = station(50, 0.68);
export const FIG = station(87, 0.72);
export const CELLS = station(117, 0.68);
export const FRUITS = station(162, 0.62);
export const SEED = station(200, 0.68);
export const STRIP = station(226, 0.72);
export const SILL = station(256, 0.74);
export const CUPBOARD = station(287, 0.76);
export const FRIDGE = station(315, 0.74);
export const SIDE = station(336, 1.36);

/* ------------------------------------------------------------ cameras */

export interface Camera {
  position: V3;
  target: V3;
  fov: number;
}
export const cam = (position: readonly number[], target: readonly number[], fov = 30): Camera => ({ position: r3(position), target: r3(target), fov });
/**
 * A camera on subject P (scene point): `dist` away along `dir` (from the
 * subject towards the camera). The stage canvas ends at the reading panel, so
 * its centre is already the middle of the free band between the HUD blocks.
 */
export function frameAt(P: readonly number[], dir: readonly number[], dist: number, fov = 30): Camera {
  const l = Math.hypot(dir[0]!, dir[1]!, dir[2]!);
  return cam(add3(P, dir.map((x) => (x / l) * dist)), P, fov);
}
/** frameAt on a station point: the camera comes from the table's centre side, turned `az` degrees to the reader's right and raised `elev` degrees. */
export const frame = (s: Station, local: readonly number[], dist: number, elev: number, az = 0, fov = 30): Camera => {
  const e = (elev * Math.PI) / 180;
  const a = (az * Math.PI) / 180;
  const flat = dirIn(s, [Math.sin(a), 0, Math.cos(a)]);
  return frameAt(at(s, local), [flat[0] * Math.cos(e), Math.sin(e), flat[2] * Math.cos(e)], dist, fov);
};
/** The midpoint of two scene points. */
export const mid = (a: readonly number[], b: readonly number[]): V3 => r3([(a[0]! + b[0]!) / 2, (a[1]! + b[1]!) / 2, (a[2]! + b[2]!) / 2]);

/** The six named views (VIEW buttons; chapter and beat cameras use them too). */
export const PRESET_CAMERAS: Record<string, Camera> = {
  'spores-view': frame(SIDE, [0.03, 0.07, -0.02], 1.3, 30, 62),
  'flower-view': frame(FLOWER, [0.0, 0.12, 0.03], 1.35, 16, 24),
  'visitors-view': frame(VISIT, [-0.02, 0.17, -0.03], 1.6, 12, 0),
  'fruits-view': frame(FRUITS, [0.04, 0.02, 0.0], 1.4, 42, 0),
  'seed-view': frame(SEED, [0.01, 0.02, 0.025], 0.95, 34, 0),
  'cups-view': frameAt(mid(at(SILL, [0, 0.12, 0]), at(FRIDGE, [0, 0.12, 0])), [1, 0.42, 0.12], 2.6),
};

/** The whole table from the front right, high enough to see round the ring. */
export const HERO = frameAt([-0.18, 0.06, -0.12], [0.5, 0.58, 0.8], 3.9);
/** HUD off: the whole table filling the screen. */
export const COVER = cam([1.25, 1.5, 2.02], [-0.16, 0.0, -0.12]);
