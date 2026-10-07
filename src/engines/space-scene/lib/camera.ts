/**
 * Camera targets and tweening for the orbit stage (pure, unit-tested).
 */
import type { OrbitCamera } from '../../core/types';
import type { SpaceView, ViewPresets } from '../schema';
import { easeInOutCubic, lerp, lerp3 } from './math';

export const DEFAULT_CAMERA: OrbitCamera = { position: [3.2, 2.2, 4.2], target: [0, 0, 0], fov: 40 };
export const CAMERA_TWEEN_MS = 800;

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

/** Camera pose `k` (0..1, eased) of the way from `from` to `to`. */
export function tweenCamera(from: OrbitCamera, to: OrbitCamera, k: number): OrbitCamera {
  const e = easeInOutCubic(k);
  const fromFov = from.fov ?? DEFAULT_CAMERA.fov!;
  const toFov = to.fov ?? DEFAULT_CAMERA.fov!;
  return {
    position: lerp3(from.position, to.position, e),
    target: lerp3(from.target, to.target, e),
    fov: lerp(fromFov, toFov, e),
  };
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
 * Authored cameras are framed for a roughly square stage. On narrower stages
 * (portrait phones) the horizontal field of view shrinks, so we pull the
 * camera back along its view direction by `minAspect / aspect` (never closer).
 * `inverse` undoes it (used before writing a user camera back to the store,
 * so URLs stay device-independent).
 */
export function fitCameraToAspect(cam: OrbitCamera, aspect: number, inverse = false, minAspect = 0.95): OrbitCamera {
  const k = aspect > 0 ? Math.max(1, minAspect / aspect) : 1;
  const s = inverse ? 1 / k : k;
  if (s === 1) return cam;
  const [px, py, pz] = cam.position;
  const [tx, ty, tz] = cam.target;
  return { ...cam, position: [tx + (px - tx) * s, ty + (py - ty) * s, tz + (pz - tz) * s] };
}
