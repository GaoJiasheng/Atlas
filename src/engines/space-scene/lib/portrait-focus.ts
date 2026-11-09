/**
 * Portrait framing of a beat's focus. Only portrait stages use it, so CameraRig fetches this module for them alone
 * and it stays out of every other first screen.
 */
import type { OrbitCamera } from '../../core/types';
import { DEFAULT_FOV } from './camera';

/** The full pull-back for a portrait stage, without the phone's easing: the authored framing's whole width stays in view. */
export function widestPortrait(cam: OrbitCamera, aspect: number): OrbitCamera {
  const s = aspect > 0 ? Math.max(1, 1.6 / aspect) : 1;
  const [px, py, pz] = cam.position;
  const [tx, ty, tz] = cam.target;
  return { ...cam, position: [tx + (px - tx) * s, ty + (py - ty) * s, tz + (pz - tz) * s] };
}

/** A part a portrait stage must keep in frame: its centre and bounding radius. */
export interface FocusBall {
  center: readonly [number, number, number];
  radius: number;
}
/** Share of the half stage width a focus part may reach on a portrait stage. */
const FOCUS_FILL = 0.92;

/**
 * Portrait stages ease the pull-back of `fitCameraToAspect` so a wide model fills the screen, which can leave the part a
 * beat is about outside the frame. Pull back only as far as those parts need, and never past `widest` (the pull-back a
 * wide stage's framing would need). Landscape stages and beats without a focus keep `cam`.
 */
export function keepFocusInPortrait(cam: OrbitCamera, widest: OrbitCamera, focus: readonly FocusBall[], aspect: number): OrbitCamera {
  if (aspect >= 0.8 || focus.length === 0) return cam;
  const [px, py, pz] = cam.position;
  const [tx, ty, tz] = cam.target;
  const length = Math.hypot(px - tx, py - ty, pz - tz);
  const room = Math.hypot(widest.position[0] - tx, widest.position[1] - ty, widest.position[2] - tz) - length;
  if (length <= 0 || room <= 0) return cam;
  const back: [number, number, number] = [(px - tx) / length, (py - ty) / length, (pz - tz) / length];
  // The camera's right vector (world up crossed with the backward axis).
  const rl = Math.hypot(back[2], back[0]) || 1;
  const right: [number, number, number] = [back[2] / rl, 0, -back[0] / rl];
  const tanH = Math.tan(((cam.fov ?? DEFAULT_FOV) * Math.PI) / 360) * aspect * FOCUS_FILL;
  let need = 0;
  for (const { center, radius } of focus) {
    const d = [center[0] - px, center[1] - py, center[2] - pz] as const;
    const across = Math.abs(d[0] * right[0] + d[1] * right[1] + d[2] * right[2]);
    const depth = -(d[0] * back[0] + d[1] * back[1] + d[2] * back[2]);
    need = Math.max(need, (across + radius) / tanH - depth);
  }
  const move = Math.min(room, Math.max(0, need));
  return move === 0 ? cam : { ...cam, position: [px + back[0] * move, py + back[1] * move, pz + back[2] * move] };
}

interface FocusHandle {
  object: { position: { x: number; y: number; z: number } };
  offset: readonly number[];
  half: readonly number[];
}

/** The eased camera, pulled back for the part a beat selects, else the parts it labels. */
export function framePortraitBeat(authored: OrbitCamera, eased: OrbitCamera, ids: readonly string[], handles: ReadonlyMap<string, FocusHandle>, aspect: number): OrbitCamera {
  const focus = ids.flatMap((id) => {
    const h = handles.get(id);
    if (!h) return [];
    const { x, y, z } = h.object.position;
    return [{ center: [x + h.offset[0]!, y + h.offset[1]!, z + h.offset[2]!] as const, radius: Math.hypot(...h.half) }];
  });
  return keepFocusInPortrait(eased, widestPortrait(authored, aspect), focus, aspect);
}
