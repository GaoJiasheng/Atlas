/** Opt-in camera framing in the actual free HUD band (stage CSS pixels). */
import type { OrbitCamera } from '../../core/types';
import { DEFAULT_FOV } from './camera';
import type { Vec3 } from './math';
/** Below this stage aspect the HUD stacks over the stage (lib/camera.ts fitCameraToAspect uses the same 0.8). */
export const STACKED_ASPECT = 0.8;
export interface FrameRect { x0: number; y0: number; x1: number; y1: number }
export interface FrameBox { center: Vec3; half: Vec3 }

export function freeStageRect(width: number, height: number, panels: readonly FrameRect[], gap = 12): FrameRect {
  const out = { x0: gap, y0: gap, x1: width - gap, y1: height - gap };
  for (const r of panels) {
    if (r.x1 <= 0 || r.x0 >= width || r.y1 <= 0 || r.y0 >= height) continue;
    if (r.x0 < width / 2 && r.x1 > width / 2) {
      if (r.y0 > height / 2) out.y1 = Math.min(out.y1, r.y0 - gap);
      else if (r.y1 < height / 2) out.y0 = Math.max(out.y0, r.y1 + gap);
    }
  }
  // Stacked phone layout (portrait, aspect < 0.8): the HUD overlays and the model takes the full width
  // (docs/06 camera rules), so a corner block such as the title does not squeeze it into a side column.
  if (width / height < STACKED_ASPECT) return out;
  for (const r of panels) {
    if (r.y1 <= out.y0 || r.y0 >= out.y1) continue;
    if (r.x1 <= width / 2) out.x0 = Math.max(out.x0, r.x1 + gap);
    else if (r.x0 >= width / 2) out.x1 = Math.min(out.x1, r.x0 - gap);
  }
  return out;
}

/** Keep the view direction and lens; find the smallest pullback and pan that
 * fits the boxes. Offscreen boxes are intentionally outside an authored closeup.
 * Feasibility is the intersection of pan intervals at each depth, so near/far
 * objects and asymmetric HUD columns are handled without viewport-specific values. */
export function fitCameraToHud(cam: OrbitCamera, boxes: readonly FrameBox[], width: number, height: number, rect: FrameRect): OrbitCamera {
  if (width <= 0 || height <= 0 || rect.x1 <= rect.x0 || rect.y1 <= rect.y0) return cam;
  const delta = cam.position.map((v, i) => v - cam.target[i]!) as Vec3;
  const distance = Math.hypot(...delta);
  if (distance < 1e-9) return cam;
  const dir = delta.map(v => v / distance) as Vec3;
  const rl = Math.hypot(dir[0], dir[2]);
  const right: Vec3 = rl > 1e-9 ? [dir[2] / rl, 0, -dir[0] / rl] : [1, 0, 0];
  const up: Vec3 = [dir[1] * right[2], dir[2] * right[0] - dir[0] * right[2], -dir[1] * right[0]];
  const dot = (a: Vec3, b: Vec3) => a.reduce((sum, v, i) => sum + v * b[i]!, 0);
  const tv = Math.tan((cam.fov ?? DEFAULT_FOV) * Math.PI / 360), th = tv * width / height;
  const left = (2 * rect.x0 / width - 1) * th, rightEdge = (2 * rect.x1 / width - 1) * th;
  const bottom = (1 - 2 * rect.y1 / height) * tv, top = (1 - 2 * rect.y0 / height) * tv;
  const points: Vec3[] = [];
  for (const box of boxes) {
    const corners: Vec3[] = Array.from({ length: 8 }, (_, k) => {
      const p = box.center.map((v, i) => v + (k & (1 << i) ? 1 : -1) * box.half[i]! - cam.target[i]!) as Vec3;
      return [dot(p, right), dot(p, up), dot(p, dir)];
    });
    // Do not drag an intentionally excluded Sun into an Earth/Moon closeup.
    if (corners.every(p => distance <= p[2]) || corners.every(p => p[0] < -th * (distance - p[2])) ||
        corners.every(p => p[0] > th * (distance - p[2])) || corners.every(p => p[1] < -tv * (distance - p[2])) ||
        corners.every(p => p[1] > tv * (distance - p[2]))) continue;
    points.push(...corners);
  }
  if (!points.length) return cam;
  const interval = (d: number) => {
    let x0 = -Infinity, x1 = Infinity, y0 = -Infinity, y1 = Infinity;
    for (const [x,y,z] of points) {
      if (d <= z) return null;
      x0 = Math.max(x0, x - rightEdge * (d-z)); x1 = Math.min(x1, x - left * (d-z));
      y0 = Math.max(y0, y - top * (d-z)); y1 = Math.min(y1, y - bottom * (d-z));
    }
    return x0 <= x1 && y0 <= y1 ? [x0,x1,y0,y1] as const : null;
  };
  let d = distance, span = interval(d);
  if (!span) {
    let lo = distance, hi = Math.max(distance, ...points.map(p => p[2])) + distance;
    while (!interval(hi)) hi *= 2;
    for (let i=0; i<48; i++) { const mid = (lo+hi)/2; if (interval(mid)) hi=mid; else lo=mid; }
    d = hi; span = interval(d)!;
  }
  const x = Math.max(span[0], Math.min(span[1], 0)), y = Math.max(span[2], Math.min(span[3], 0));
  if (d === distance && x === 0 && y === 0) return cam;
  const target = cam.target.map((v,i) => v + right[i]! * x + up[i]! * y) as Vec3;
  return { ...cam, target, position: target.map((v,i) => v + dir[i]! * d) as Vec3 };
}
