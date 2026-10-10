/**
 * Camera targets and tweening for the orbit stage (pure, unit-tested).
 */
import type { OrbitCamera, SceneTransition } from '../../core/types';
import type { SectionPlane, SpaceView, ViewPresets } from '../schema';
import type { Box3Like } from './parts';
import { easeInOutCubic, lerp, lerp3, type Vec3 } from './math';

export const DEFAULT_CAMERA: OrbitCamera = { position: [3.2, 2.2, 4.2], target: [0, 0, 0], fov: 40 };
export const DEFAULT_FOV = 40;
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
 */
export function fitSphereCamera(cam: OrbitCamera, center: readonly number[], radius: number, aspect: number, fill = COVER_FILL): OrbitCamera {
  const fov = cam.fov ?? DEFAULT_FOV;
  const tv = Math.tan((fov * Math.PI) / 360);
  const t = Math.min(fill * tv * Math.max(aspect, 0.1), COVER_MAX_HEIGHT * tv);
  const d = Math.max(radius, 1e-3) / Math.sin(Math.atan(t));
  let dir = [cam.position[0] - cam.target[0], cam.position[1] - cam.target[1], cam.position[2] - cam.target[2]];
  const len = Math.hypot(dir[0]!, dir[1]!, dir[2]!);
  dir = len > 1e-9 ? dir.map((v) => v / len) : [0, 0, 1];
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
 * `inverse` undoes it (used before writing a user camera back to the store,
 * so URLs stay device-independent).
 */
export function fitCameraToAspect(cam: OrbitCamera, aspect: number, inverse = false, minAspect = 1.6): OrbitCamera {
  const k = aspect > 0 ? Math.max(1, minAspect / aspect) : 1;
  const s = inverse ? 1 / k : k;
  if (s === 1) return cam;
  const [px, py, pz] = cam.position;
  const [tx, ty, tz] = cam.target;
  return { ...cam, position: [tx + (px - tx) * s, ty + (py - ty) * s, tz + (pz - tz) * s] };
}
