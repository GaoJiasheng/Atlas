/**
 * Camera targets and tweening for the orbit stage (pure, unit-tested).
 */
import type { OrbitCamera, SceneTransition } from '../../core/types';
import type { SectionPlane, SpaceView, ViewPresets } from '../schema';
import type { Box3Like } from './parts';
import { easeInOutCubic, lerp, lerp3, type Vec3 } from './math';

export const DEFAULT_CAMERA: OrbitCamera = { position: [3.2, 2.2, 4.2], target: [0, 0, 0], fov: 40 };
export const DEFAULT_FOV = 40;
/** The stage camera's far plane for small exhibits (metres). */
export const BASE_FAR = 200;
/**
 * Far plane that still reaches the model from the farthest the orbit controls
 * let the camera go (`minDistance * 20`, `minDistance` = 0.9 × the model radius)
 * plus the model's own depth: a site-sized model (a quay crane) would otherwise
 * vanish when the camera backs off to fit a narrow stage. Small exhibits keep 200.
 */
export function farPlane(radius: number): number {
  return Math.max(BASE_FAR, Math.ceil(radius * 0.9 * 20 + radius * 2));
}
/** Chapter and preset moves (docs/08 §3: 1.4–1.8 s easeInOut). */
export const CAMERA_TWEEN_MS = 1600;
/** REFERENCE in and out (master-spec H: ~2 s). */
export const REFERENCE_TWEEN_MS = 2000;
/** Long lens of the REFERENCE view: reads as an elevation drawing. */
export const REFERENCE_FOV = 16;
/** ORBIT turntable: one turn per 40 s. */
export const ORBIT_PERIOD_S = 40;
/** Cover camera in and out (HUD hidden / shown). */
export const COVER_TWEEN_MS = 800;
/** Share of the stage width the model's bounding sphere fills in the default cover camera. */
export const COVER_FILL = 0.75;
/** …and at most this share of the stage height. */
export const COVER_MAX_HEIGHT = 1.3;
/** A tall subject (its box, seen from the cover direction) fills this share of the stage height. */
export const COVER_FILL_HEIGHT = 0.8;

/**
 * Where the camera should go after a transition:
 *  1. an explicit camera (URL `cam=` override, or the chapter's own `state.camera`),
 *  2. else the view preset `views[view].camera` from parts.json,
 *  3. else the inherited (cumulative) camera, else DEFAULT_CAMERA.
 */
export function resolveTargetCamera(input: {
  explicit: OrbitCamera | null;
  view: SpaceView;
  views: ViewPresets;
  inherited: OrbitCamera | null;
}): OrbitCamera {
  if (input.explicit) return input.explicit;
  const preset = input.views[input.view]?.camera;
  if (preset) return { position: [...preset.position], target: [...preset.target], fov: preset.fov };
  return input.inherited ?? DEFAULT_CAMERA;
}

/**
 * The camera a scene transition should end on (`null` = do not move):
 *  - `preset` (a VIEW button / digit key) and `state` (several fields applied at
 *    once): always the stored camera, so a preset
 *    lands on exactly its camera even when the current chapter has no camera of
 *    its own (its baseline is then inherited and may equal the preset)
 *  - `snap`: no new target (the rig only finishes a running move)
 *  - `init` / `chapter` / `url`: an explicit camera (URL `cam=` differing from
 *    the chapter baseline, or the chapter's own `state.camera`), else the view
 *    preset, else the inherited one
 */
export function transitionCamera(input: {
  reason: SceneTransition['reason'];
  stored: OrbitCamera | null;
  baseline: OrbitCamera | null;
  own: OrbitCamera | null;
  view: SpaceView;
  views: ViewPresets;
}): OrbitCamera | null {
  const { reason, stored, baseline, own } = input;
  if (reason === 'snap') return null;
  if (reason === 'preset' || reason === 'state') return stored;
  const same = (a: OrbitCamera | null, b: OrbitCamera | null) =>
    !a || !b
      ? a === b
      : a.position.every((v, i) => Math.abs(v - b.position[i]!) < 1e-3) && a.target.every((v, i) => Math.abs(v - b.target[i]!) < 1e-3);
  const explicit = !same(stored, baseline) ? stored : own ? stored : null;
  return resolveTargetCamera({ explicit, view: input.view, views: input.views, inherited: stored });
}

interface Spherical {
  r: number;
  /** Azimuth about +Y, from +Z towards +X. */
  theta: number;
  /** Polar angle from +Y. */
  phi: number;
}

function toSpherical(v: readonly number[]): Spherical {
  const [x = 0, y = 0, z = 0] = v;
  const r = Math.hypot(x, y, z);
  if (r < 1e-9) return { r: 0, theta: 0, phi: Math.PI / 2 };
  return { r, theta: Math.atan2(x, z), phi: Math.acos(Math.min(1, Math.max(-1, y / r))) };
}

function fromSpherical({ r, theta, phi }: Spherical): Vec3 {
  const s = Math.sin(phi);
  return [r * s * Math.sin(theta), r * Math.cos(phi), r * s * Math.cos(theta)];
}

/** Shortest signed angle from `a` to `b`. */
function angleDelta(a: number, b: number): number {
  let d = (b - a) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return d;
}

/**
 * Camera pose `k` (0..1, eased) of the way from `from` to `to`. The target
 * moves in a straight line; the camera's offset from the target is
 * interpolated in spherical coordinates (radius geometrically, azimuth the
 * short way round, polar angle linearly), so the camera swings around the
 * model instead of cutting through it.
 */
export function tweenCamera(from: OrbitCamera, to: OrbitCamera, k: number): OrbitCamera {
  const e = easeInOutCubic(k);
  const fromFov = from.fov ?? DEFAULT_FOV;
  const toFov = to.fov ?? DEFAULT_FOV;
  const target = lerp3(from.target, to.target, e);
  const a = toSpherical([from.position[0] - from.target[0], from.position[1] - from.target[1], from.position[2] - from.target[2]]);
  const b = toSpherical([to.position[0] - to.target[0], to.position[1] - to.target[1], to.position[2] - to.target[2]]);
  const r = a.r > 1e-6 && b.r > 1e-6 ? a.r * (b.r / a.r) ** e : lerp(a.r, b.r, e);
  const off = fromSpherical({ r, theta: a.theta + angleDelta(a.theta, b.theta) * e, phi: lerp(a.phi, b.phi, e) });
  return {
    position: k >= 1 ? [...to.position] : [target[0] + off[0], target[1] + off[1], target[2] + off[2]],
    target: k >= 1 ? [...to.target] : target,
    fov: lerp(fromFov, toFov, e),
  };
}

/**
 * REFERENCE camera: a long-lens straight view on the section plane (`xy`:
 * from +Z, `zy`: from +X, `xz`: from +Y) that frames the model bounds with a
 * margin for the stage aspect, so it reads like an elevation drawing.
 */
export function referenceCamera(bounds: Box3Like, plane: SectionPlane, aspect: number, fov = REFERENCE_FOV): OrbitCamera {
  const c: Vec3 = [0, 1, 2].map((i) => (bounds.min[i]! + bounds.max[i]!) / 2) as Vec3;
  const half: Vec3 = [0, 1, 2].map((i) => (bounds.max[i]! - bounds.min[i]!) / 2) as Vec3;
  // [screen-x axis, screen-y axis, view axis]
  const [u, v, w] = plane === 'zy' ? [2, 1, 0] : plane === 'xz' ? [0, 2, 1] : [0, 1, 2];
  const fit = Math.max(half[v]!, half[u]! / Math.max(0.3, aspect)) * 1.35;
  const dist = fit / Math.tan(((fov * Math.PI) / 180) / 2) + half[w]!;
  const position: Vec3 = [...c];
  position[w] = position[w]! + dist;
  // A plan view looks down; nudge so the orbit controls keep a well-defined up.
  if (plane === 'xz') position[2] += dist * 1e-3;
  return { position, target: c, fov };
}

/**
 * The default cover camera: `cam` re-fitted so a sphere (the model's bounds)
 * fills `fill` of the stage width, seen from the same direction and centred
 * on the sphere. On wide stages the sphere may overrun the height by up to
 * 30 % (a bounding sphere is larger than the model inside it), no more.
 * With the model's half extents (`half`, x / y / z), a tall narrow subject is
 * also fitted by height: the camera never sits closer than the one where the
 * box's projected height fills `COVER_FILL_HEIGHT` of the stage, so the
 * subject fills most of the frame height instead of overrunning it.
 */
export function fitSphereCamera(
  cam: OrbitCamera,
  center: readonly number[],
  radius: number,
  aspect: number,
  fill = COVER_FILL,
  half?: readonly number[],
): OrbitCamera {
  const fov = cam.fov ?? DEFAULT_FOV;
  const tv = Math.tan((fov * Math.PI) / 360);
  const t = Math.min(fill * tv * Math.max(aspect, 0.1), COVER_MAX_HEIGHT * tv);
  let d = Math.max(radius, 1e-3) / Math.sin(Math.atan(t));
  let dir = [cam.position[0] - cam.target[0], cam.position[1] - cam.target[1], cam.position[2] - cam.target[2]];
  const len = Math.hypot(dir[0]!, dir[1]!, dir[2]!);
  dir = len > 1e-9 ? dir.map((v) => v / len) : [0, 0, 1];
  if (half) {
    // Projected half height of the box seen from `dir` (up = +Y): its height foreshortened by the elevation, plus the footprint's depth.
    const sin = Math.min(1, Math.abs(dir[1]!));
    const cos = Math.sqrt(1 - sin * sin);
    const hh = (half[1] ?? 0) * cos + Math.hypot(half[0] ?? 0, half[2] ?? 0) * sin;
    d = Math.max(d, (hh / (COVER_FILL_HEIGHT * tv)) + Math.hypot(half[0] ?? 0, half[2] ?? 0) * cos);
  }
  const c: Vec3 = [center[0] ?? 0, center[1] ?? 0, center[2] ?? 0];
  return { position: [c[0] + dir[0]! * d, c[1] + dir[1]! * d, c[2] + dir[2]! * d], target: c, fov };
}

const r3 = (n: number) => Math.round(n * 1000) / 1000;

/** Rounded camera for the store / URL. */
export function roundCamera(cam: OrbitCamera): OrbitCamera {
  return {
    position: [r3(cam.position[0]), r3(cam.position[1]), r3(cam.position[2])],
    target: [r3(cam.target[0]), r3(cam.target[1]), r3(cam.target[2])],
  };
}

/**
 * Authored cameras are framed for a wide stage (aspect ≥ 1.6). On narrower
 * stages (tablets in portrait, phones) the horizontal field of view shrinks, so we pull the
 * camera back along its view direction by `minAspect / aspect` (never closer).
 * Phones (aspect below 0.8, the HUD stacks and the model gets the full stage
 * width instead of a band between the side panels) ease the pull-back down to
 * half of that, so a wide model still fills most of the screen.
 * `inverse` undoes it (used before writing a user camera back to the store,
 * so URLs stay device-independent).
 */
export function fitCameraToAspect(cam: OrbitCamera, aspect: number, inverse = false, minAspect = 1.6): OrbitCamera {
  const stacked = aspect >= 0.8 ? 1 : aspect <= 0.5 ? 0.5 : 0.5 + (0.5 * (aspect - 0.5)) / 0.3;
  const k = aspect > 0 ? Math.max(1, (minAspect * stacked) / aspect) : 1;
  const s = inverse ? 1 / k : k;
  if (s === 1) return cam;
  const [px, py, pz] = cam.position;
  const [tx, ty, tz] = cam.target;
  return { ...cam, position: [tx + (px - tx) * s, ty + (py - ty) * s, tz + (pz - tz) * s] };
}

/** Share of the half stage width a held bar may reach in exercise mode (the HUD side panels cover the rest). */
export const SPAN_FILL = 0.56;
/** Stages narrower than this (aspect) stack the HUD: the bar may leave the frame rather than shrink the body. */
export const SPAN_MIN_ASPECT = 1.2;

/**
 * Exercise mode with a long held bar (docs/16 §6.5): pull the camera back
 * along its view direction until a bar `half` metres either side of the
 * camera target (turned `yaw`° about +Y with the body, along X at 0°) stays
 * within `fill` of the half stage width, so its ends do not run behind the
 * HUD side panels. Never moves closer; a bar seen end-on needs no move.
 */
export function fitSpan(cam: OrbitCamera, span: { half: number; yaw: number }, aspect: number, fill = SPAN_FILL): OrbitCamera {
  if (aspect < SPAN_MIN_ASPECT || span.half <= 0) return cam;
  const [px, py, pz] = cam.position;
  const [tx, ty, tz] = cam.target;
  const dx = px - tx;
  const dy = py - ty;
  const dz = pz - tz;
  const d = Math.hypot(dx, dy, dz);
  if (d < 1e-9) return cam;
  const dir: Vec3 = [dx / d, dy / d, dz / d];
  // Screen right: horizontal, perpendicular to the view direction.
  const rl = Math.hypot(dir[2], dir[0]);
  const right: Vec3 = rl > 1e-9 ? [dir[2] / rl, 0, -dir[0] / rl] : [1, 0, 0];
  const tanH = Math.tan(((cam.fov ?? DEFAULT_FOV) * Math.PI) / 360) * aspect;
  const yaw = (span.yaw * Math.PI) / 180;
  const bar: Vec3 = [Math.cos(yaw) * span.half, 0, -Math.sin(yaw) * span.half];
  let need = d;
  for (const s of [1, -1]) {
    const rel: Vec3 = [bar[0] * s, bar[1] * s, bar[2] * s];
    const lateral = Math.abs(rel[0] * right[0] + rel[2] * right[2]);
    const along = rel[0] * dir[0] + rel[1] * dir[1] + rel[2] * dir[2];
    need = Math.max(need, along + lateral / (fill * tanH));
  }
  if (need <= d + 1e-6) return cam;
  const k = need / d;
  return { ...cam, position: [tx + dx * k, ty + dy * k, tz + dz * k] };
}

/* ------------------------------------------------------------------ */
/* Exercise framing (docs/06 动作模式数据手册)                          */
/* ------------------------------------------------------------------ */

/** How the body lies in an exercise (from its root turn and keys): picks the default camera direction. */
export type ExercisePosture = 'supine' | 'prone' | 'side-lying' | 'hinge' | 'upright';

/** Default camera direction per posture: degrees about +Y from in front of the body toward its left, and above the horizontal. */
export const EXERCISE_VIEWS: Readonly<Record<ExercisePosture, { azimuth: number; elevation: number }>> = {
  // Lying on the back: side-above, from the feet's quarter (the bar reads across the chest, not end-on).
  supine: { azimuth: 55, elevation: 36 },
  // Face down (push-up, plank): from the side, a little above.
  prone: { azimuth: 82, elevation: 16 },
  // On one side (side plank): from in front, a little above.
  'side-lying': { azimuth: 12, elevation: 22 },
  // Bent at the hips (row, deadlift): from the side.
  hinge: { azimuth: 88, elevation: 10 },
  // Standing, sitting or hanging: front three-quarter.
  upright: { azimuth: 35, elevation: 12 },
};
/** Long lens of the exercise camera (degrees). */
export const EXERCISE_FOV = 24;
/** Share of the frame height the figure fills (the tall side), and of the half width (the HUD side panels take the rest). */
export const EXERCISE_FILL = 0.72;
export const EXERCISE_FILL_WIDTH = 0.56;
/** The figure's centre sits this share of the half height above the frame centre (the bottom HUD panels take the bottom). */
export const EXERCISE_LIFT = 0.08;
/** Highest the figure reaches (share of the half height above the centre): the topic title sits above it. */
export const EXERCISE_TOP = 0.9;
/** Gap kept between the figure and the caption card (share of the half height). */
export const EXERCISE_CARD_GAP = 0.08;
/** The band between the card and the top edge never shrinks below this (share of the half height). */
export const EXERCISE_BAND_MIN = 1.2;

/**
 * Fill and lift of the exercise camera with a presentation caption card
 * `cardPx` tall over the bottom of a stage `stageH` px tall: the figure
 * fills `fill` of the frame height, capped by the band the card leaves
 * (between the card's top edge, less a gap, and `EXERCISE_TOP`), and is
 * centred in that band. Without a card: `fill`, lifted `EXERCISE_LIFT`.
 */
export function exerciseFraming(cardPx: number, stageH: number, fill = EXERCISE_FILL): { fill: number; lift: number } {
  if (!(cardPx > 0) || !(stageH > 0)) return { fill, lift: EXERCISE_LIFT };
  const bottom = Math.min(EXERCISE_TOP - EXERCISE_BAND_MIN, -1 + (2 * cardPx) / stageH + EXERCISE_CARD_GAP);
  return { fill: Math.min(fill, (EXERCISE_TOP - bottom) / 2), lift: (EXERCISE_TOP + bottom) / 2 };
}

/** Trunk flexion (degrees, any key) that makes a standing exercise a hinge. */
export const HINGE_FLEXION = 30;

/** The posture of an exercise motion. */
export function exercisePosture(motion: { root?: { rotation: readonly number[] } | undefined; keys: readonly { joints: Readonly<Record<string, Partial<Record<string, number>> | undefined>> }[] }): ExercisePosture {
  const r = motion.root?.rotation ?? [0, 0, 0];
  const rx = r[0] ?? 0;
  const rz = r[2] ?? 0;
  if (rx <= -50) return 'supine';
  if (rx >= 50) return 'prone';
  if (Math.abs(rz) >= 50) return 'side-lying';
  const flex = Math.max(0, ...motion.keys.map((k) => (k.joints.trunk?.flexion ?? 0) - (k.joints.trunk?.extension ?? 0)));
  return rx >= 25 || rx + flex >= HINGE_FLEXION ? 'hinge' : 'upright';
}

/** Unit vector from the camera target to the camera: `azimuth`° about +Y from +Z (the body's front at yaw 0) toward +X, `elevation`° up. */
export function viewDirection(azimuth: number, elevation: number, yaw = 0): Vec3 {
  const a = ((azimuth + yaw) * Math.PI) / 180;
  const e = (elevation * Math.PI) / 180;
  return [Math.sin(a) * Math.cos(e), Math.sin(e), Math.cos(a) * Math.cos(e)];
}

/**
 * The exercise camera: looking along `dir` (target → camera), centred on the
 * points' extent across the view (x, y, z triples: the mannequin over the
 * keys, the held palms) and backed off until every point stays within `fill`
 * of the frame height and `fillWidth` of the half width, then the figure's
 * centre lifted `lift` of the half height above the frame centre.
 */
export function fitExerciseCamera(
  points: ArrayLike<number>,
  dir: readonly number[],
  aspect: number,
  opts: { fov?: number; fill?: number; fillWidth?: number; lift?: number } = {},
): OrbitCamera | null {
  const n = Math.floor(points.length / 3);
  if (n === 0) return null;
  const fov = opts.fov ?? EXERCISE_FOV;
  const lift = opts.lift ?? EXERCISE_LIFT;
  const fillH = opts.fill ?? EXERCISE_FILL;
  const fillW = aspect < SPAN_MIN_ASPECT ? 0.9 : (opts.fillWidth ?? EXERCISE_FILL_WIDTH);
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < n; i++)
    for (let a = 0; a < 3; a++) {
      const v = points[i * 3 + a]!;
      if (v < min[a]!) min[a] = v;
      if (v > max[a]!) max[a] = v;
    }
  const box: Vec3 = [(min[0]! + max[0]!) / 2, (min[1]! + max[1]!) / 2, (min[2]! + max[2]!) / 2];
  const len = Math.hypot(dir[0] ?? 0, dir[1] ?? 0, dir[2] ?? 0) || 1;
  const d0: Vec3 = [(dir[0] ?? 0) / len, (dir[1] ?? 0) / len, (dir[2] ?? 1) / len];
  const rl = Math.hypot(d0[2], d0[0]);
  const right: Vec3 = rl > 1e-9 ? [d0[2] / rl, 0, -d0[0] / rl] : [1, 0, 0];
  const up: Vec3 = [d0[1] * right[2] - d0[2] * right[1], d0[2] * right[0] - d0[0] * right[2], d0[0] * right[1] - d0[1] * right[0]];
  // Centre on the middle of the points' extent across the view (a hanging figure's arms do not push its legs down the frame).
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (let i = 0; i < n; i++) {
    const q = [points[i * 3]! - box[0], points[i * 3 + 1]! - box[1], points[i * 3 + 2]! - box[2]];
    const x = q[0]! * right[0] + q[1]! * right[1] + q[2]! * right[2];
    const y = q[0]! * up[0] + q[1]! * up[1] + q[2]! * up[2];
    x0 = Math.min(x0, x);
    x1 = Math.max(x1, x);
    y0 = Math.min(y0, y);
    y1 = Math.max(y1, y);
  }
  const mx = (x0 + x1) / 2;
  const my = (y0 + y1) / 2;
  const c: Vec3 = [box[0] + right[0] * mx + up[0] * my, box[1] + right[1] * mx + up[1] * my, box[2] + right[2] * mx + up[2] * my];
  const tanV = Math.tan((fov * Math.PI) / 360);
  const tanH = tanV * Math.max(aspect, 0.1);
  let d = 0;
  for (let i = 0; i < n; i++) {
    const q = [points[i * 3]! - c[0], points[i * 3 + 1]! - c[1], points[i * 3 + 2]! - c[2]];
    const x = q[0]! * right[0] + q[1]! * right[1] + q[2]! * right[2];
    const y = q[0]! * up[0] + q[1]! * up[1] + q[2]! * up[2];
    const z = q[0]! * d0[0] + q[1]! * d0[1] + q[2]! * d0[2];
    d = Math.max(d, z + Math.abs(x) / (tanH * fillW), z + Math.abs(y) / (tanV * fillH));
  }
  const shift = lift * tanV * d;
  const target: Vec3 = [c[0] - up[0] * shift, c[1] - up[1] * shift, c[2] - up[2] * shift];
  return { position: [target[0] + d0[0] * d, target[1] + d0[1] * d, target[2] + d0[2] * d], target, fov };
}
