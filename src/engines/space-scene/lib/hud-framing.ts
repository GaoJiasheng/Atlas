/**
 * Camera framing in the stage area the HUD leaves free (stage CSS pixels).
 *  - every topic (`stageFraming`): the authored view, composed for the 1920 × 1080
 *    HUD layout, is moved into the largest free rectangle between the HUD blocks
 *    as they are now (a pull-back plus a view-offset shift, docs/67 §9)
 *  - opt-in `views.hudFrame` (`fitCameraToHud`): named subjects fitted into the free band
 */
import type { OrbitCamera } from '../../core/types';
import { DEFAULT_FOV } from './camera';
import type { Vec3 } from './math';
/** Below this stage aspect the HUD stacks over the stage (lib/camera.ts fitCameraToAspect uses the same 0.8). */
export const STACKED_ASPECT = 0.8;
export interface FrameRect { x0: number; y0: number; x1: number; y1: number }
export interface FrameBox {
  center: Vec3; half: Vec3;
  /** Optional inscribed-sphere radius floor, in CSS pixels, for the primary subject. */
  minRadiusPx?: number;
}

/**
 * The free band between the HUD blocks. `stacked`: the HUD overlays the stage
 * (portrait phone / drawer layout), so only blocks across the middle narrow it;
 * the caller decides from the viewport (a landscape tablet's stage can be
 * narrower than 0.8 and still has side columns). Default: the stage aspect.
 */
export function freeStageRect(width: number, height: number, panels: readonly FrameRect[], gap = 12, stacked = width / height < STACKED_ASPECT): FrameRect {
  const out = { x0: gap, y0: gap, x1: width - gap, y1: height - gap };
  for (const r of panels) {
    if (r.x1 <= 0 || r.x0 >= width || r.y1 <= 0 || r.y0 >= height) continue;
    if (r.x0 < width / 2 && r.x1 > width / 2) {
      if (r.y0 > height / 2) out.y1 = Math.min(out.y1, r.y0 - gap);
      else if (r.y1 < height / 2) out.y0 = Math.max(out.y0, r.y1 + gap);
    }
  }
  // Stacked phone layout: the HUD overlays and the model takes the full width
  // (docs/06 camera rules), so a corner block such as the title does not squeeze it into a side column.
  if (stacked) return out;
  for (const r of panels) {
    if (r.y1 <= out.y0 || r.y0 >= out.y1) continue;
    if (r.x1 <= width / 2) out.x0 = Math.max(out.x0, r.x1 + gap);
    else if (r.x0 >= width / 2) out.x1 = Math.min(out.x1, r.x0 - gap);
  }
  return out;
}

/** Maximal empty rectangles between the actual HUD blocks, with the same 12px gutter. */
export function freeRects(width: number, height: number, panels: readonly FrameRect[], gap = 12): FrameRect[] {
  const xs = [...new Set([gap, width-gap, ...panels.flatMap(p => [p.x0-gap, p.x1+gap])])]
    .filter(x => x >= gap && x <= width-gap).sort((a,b) => a-b);
  const out: FrameRect[] = [];
  for (let i=0; i<xs.length; i++) for (let j=i+1; j<xs.length; j++) {
    const x0 = xs[i]!, x1 = xs[j]!;
    let gaps = [[gap, height-gap]];
    for (const p of panels) {
      if (p.x1+gap <= x0 || p.x0-gap >= x1) continue;
      gaps = gaps.flatMap(([lo,hi]) => {
        const a = Math.max(lo!, p.y0-gap), b = Math.min(hi!, p.y1+gap);
        return a >= b ? [[lo!,hi!]] : [[lo!,a],[b,hi!]].filter(([l,h]) => h! > l!);
      });
    }
    for (const [y0,y1] of gaps) out.push({x0,x1,y0:y0!,y1:y1!});
  }
  return out.filter((r,i) => !out.some((s,j) => j !== i && s.x0 <= r.x0 && s.x1 >= r.x1 && s.y0 <= r.y0 && s.y1 >= r.y1));
}

/** The stage the authored cameras are composed for: 1920 × 1080 with the HUD (the reader docked beside it). */
export const DESIGN_STAGE = { width: 1520, height: 1023 } as const;
export const DESIGN_ASPECT = DESIGN_STAGE.width / DESIGN_STAGE.height;
/**
 * The free area of that layout as shares of the stage (measured 2026-11-02, the
 * same in every SpaceScene topic): right of the left column (28–328 px), left of
 * the top-right card (from 1162 px), above the chapter axis (from 963 px), 12 px gutters.
 */
export const DESIGN_FREE: FrameRect = { x0: 340 / 1520, y0: 12 / 1023, x1: 1150 / 1520, y1: 951 / 1023 };

/**
 * Where the authored view goes on the stage as it is now. The camera composed
 * for the design layout (`fitCameraToAspect(cam, DESIGN_ASPECT)`) sees the
 * design free area `DESIGN_FREE`; this maps that area onto the free rectangle
 * that holds it largest (`freeRects` between the measured HUD blocks):
 *  - `scale`: image scale relative to the design camera (pull the camera back
 *    by 1 / scale), never above `cap` (no closer than the plain aspect-fitted
 *    camera: a large free area does not zoom into the authored framing)
 *  - `shift`: then move the image by this share of the stage width (+ right)
 *    and height (+ up): the projection's view offset, so the orbit target stays
 *    on the subject and ORBIT / drags turn about the middle of the free area
 * Exactly the design layout gives `{ scale: cap at the design aspect, shift: 0 }`.
 * Near ties (within `FRAMING_TIE`) go to the rectangle that needs the smallest
 * shift, so the view does not hop between two similar spaces as a panel's
 * height changes by a few pixels. Null
 * when the stage has no size or no free rectangle.
 */
/** Free rectangles whose subject scales differ by less than this share count as equal (`stageFraming`). */
export const FRAMING_TIE = 0.06;
export function stageFraming(width: number, height: number, panels: readonly FrameRect[], cap: number, gap = 12):
  { scale: number; shift: [number, number]; rect: FrameRect } | null {
  if (!(width > 2 * gap) || !(height > 2 * gap)) return null;
  const a = width / height, d = DESIGN_FREE;
  // Tangent-plane units of half the stage height (fov-free: everything scales with tan(fov / 2)).
  const sw = (d.x1 - d.x0) * 2 * DESIGN_ASPECT, sh = (d.y1 - d.y0) * 2;
  const scx = (d.x0 + d.x1 - 1) * DESIGN_ASPECT, scy = 1 - (d.y0 + d.y1);
  const inside = panels.filter(p => p.x1 > 0 && p.x0 < width && p.y1 > 0 && p.y0 < height);
  let best: { scale: number; shift: [number, number]; rect: FrameRect; move: number } | null = null;
  for (const r of freeRects(width, height, inside, gap)) {
    const rw = (r.x1 - r.x0) / width * 2 * a, rh = (r.y1 - r.y0) / height * 2;
    if (rw <= 0 || rh <= 0) continue;
    const scale = Math.min(rw / sw, rh / sh, cap);
    const tx = ((r.x0 + r.x1) / width - 1) * a - scale * scx, ty = 1 - (r.y0 + r.y1) / height - scale * scy;
    const shift: [number, number] = [tx / (2 * a), ty / 2];
    const move = Math.hypot(...shift);
    if (!best || scale > best.scale * (1 + FRAMING_TIE) || (scale >= best.scale * (1 - FRAMING_TIE) && move < best.move)) best = { scale, shift, rect: r, move };
  }
  return best && { scale: best.scale, shift: best.shift, rect: best.rect };
}

/** Subtract an open forbidden pan rectangle; touching its edge preserves the gutter. */
function subtract(regions: FrameRect[], f: FrameRect): FrameRect[] {
  return regions.flatMap(r => {
    const x0 = Math.max(r.x0,f.x0), x1 = Math.min(r.x1,f.x1);
    if (r.x1 <= f.x0 || r.x0 >= f.x1 || r.y1 <= f.y0 || r.y0 >= f.y1) return [r];
    return [
      ...(r.x0 <= f.x0 ? [{...r,x1:f.x0}] : []),
      ...(r.x1 >= f.x1 ? [{...r,x0:f.x1}] : []),
      ...(r.y0 <= f.y0 ? [{x0,x1,y0:r.y0,y1:f.y0}] : []),
      ...(r.y1 >= f.y1 ? [{x0,x1,y0:f.y1,y1:r.y1}] : []),
    ];
  });
}

/** Keep direction/lens and fit authored-visible subjects. An optional primary size
 * floor opens up other empty HUD regions instead of shrinking into a narrow strip.
 * All listed bodies, including authored-offscreen secondaries, avoid reserved HUD.
 * If no candidate meets the floor, prefer the smallest safe pullback. */
export function fitCameraToHud(cam: OrbitCamera, boxes: readonly FrameBox[], width: number, height: number, rect: FrameRect,
  options?: { panels: readonly FrameRect[] }): OrbitCamera {
  if (width <= 24 || height <= 24) return cam;
  if (rect.x1 <= rect.x0 || rect.y1 <= rect.y0) {
    if (!options) return cam;
    rect = {x0:12,y0:12,x1:width-12,y1:height-12};
  }
  const delta = cam.position.map((v, i) => v - cam.target[i]!) as Vec3;
  const distance = Math.hypot(...delta);
  if (distance < 1e-9) return cam;
  const dir = delta.map(v => v / distance) as Vec3;
  const rl = Math.hypot(dir[0], dir[2]);
  const right: Vec3 = rl > 1e-9 ? [dir[2] / rl, 0, -dir[0] / rl] : [1, 0, 0];
  const up: Vec3 = [dir[1] * right[2], dir[2] * right[0] - dir[0] * right[2], -dir[1] * right[0]];
  const dot = (a: Vec3, b: Vec3) => a.reduce((sum, v, i) => sum + v * b[i]!, 0);
  const tv = Math.tan((cam.fov ?? DEFAULT_FOV) * Math.PI / 360), th = tv * width / height;
  const local = boxes.map(box => Array.from({ length: 8 }, (_, k): Vec3 => {
    const p = box.center.map((v, i) => v + (k & (1 << i) ? 1 : -1) * box.half[i]! - cam.target[i]!) as Vec3;
    return [dot(p, right), dot(p, up), dot(p, dir)];
  }));
  const visible = local.map(corners => !(corners.every(p => distance <= p[2]) || corners.every(p => p[0] < -th * (distance - p[2])) ||
    corners.every(p => p[0] > th * (distance - p[2])) || corners.every(p => p[1] < -tv * (distance - p[2])) ||
    corners.every(p => p[1] > tv * (distance - p[2]))));
  const points = local.filter((_,i) => visible[i]).flat();
  if (!points.length) return cam;
  const panels = (options?.panels ?? []).filter(p => p.x1 > 0 && p.x0 < width && p.y1 > 0 && p.y0 < height)
    .map(p => ({x0:Math.max(0,p.x0), x1:Math.min(width,p.x1), y0:Math.max(0,p.y0), y1:Math.min(height,p.y1)}));
  let maxDistance = Infinity;
  boxes.forEach((box,i) => {
    if (!visible[i] || !box.minRadiusPx || box.minRadiusPx <= 0) return;
    const z = dot(box.center.map((v,j) => v-cam.target[j]!) as Vec3, dir);
    maxDistance = Math.min(maxDistance, z + Math.min(...box.half)*height/(2*tv*box.minRadiusPx));
  });
  const interval = (d: number, r: FrameRect): FrameRect | null => {
    const left = (2*r.x0/width-1)*th, rightEdge = (2*r.x1/width-1)*th;
    const bottom = (1-2*r.y1/height)*tv, top = (1-2*r.y0/height)*tv;
    let x0 = -Infinity, x1 = Infinity, y0 = -Infinity, y1 = Infinity;
    for (const [x,y,z] of points) {
      if (d <= z) return null;
      x0 = Math.max(x0,x-rightEdge*(d-z)); x1 = Math.min(x1,x-left*(d-z));
      y0 = Math.max(y0,y-top*(d-z)); y1 = Math.min(y1,y-bottom*(d-z));
    }
    return x0 <= x1 && y0 <= y1 ? {x0,x1,y0,y1} : null;
  };
  const fit = (r: FrameRect, start = distance) => {
    let d = start, span = interval(d,r);
    if (!span) {
      let lo = start, hi = Math.max(start,...points.map(p => p[2]))+distance;
      while (!interval(hi,r)) hi *= 2;
      for (let i=0; i<48; i++) { const mid = (lo+hi)/2; if (interval(mid,r)) hi=mid; else lo=mid; }
      d=hi; span=interval(d,r)!;
    }
    return {d,span};
  };
  const safePan = (d: number, span: FrameRect) => {
    let regions = [span];
    for (const corners of panels.length ? local : []) {
      if (corners.every(p => p[2] >= d)) continue;
      // A box straddling the eye plane has no finite projected rectangle.
      if (corners.some(p => p[2] >= d)) return null;
      for (const p of panels) {
        const left = (2*(p.x0-12)/width-1)*th, rightEdge = (2*(p.x1+12)/width-1)*th;
        const bottom = (1-2*(p.y1+12)/height)*tv, top = (1-2*(p.y0-12)/height)*tv;
        regions = subtract(regions, {
          x0:Math.min(...corners.map(([x,,z]) => x-rightEdge*(d-z))),
          x1:Math.max(...corners.map(([x,,z]) => x-left*(d-z))),
          y0:Math.min(...corners.map(([,y,z]) => y-top*(d-z))),
          y1:Math.max(...corners.map(([,y,z]) => y-bottom*(d-z))),
        });
        if (!regions.length) return null;
      }
    }
    return regions.map(r => ({x:Math.max(r.x0,Math.min(r.x1,0)), y:Math.max(r.y0,Math.min(r.y1,0))}))
      .sort((a,b) => a.x*a.x+a.y*a.y-b.x*b.x-b.y*b.y)[0]!;
  };
  const cameraAt = (d: number, pan: {x:number;y:number}): OrbitCamera => {
    if (d === distance && pan.x === 0 && pan.y === 0) return cam;
    const target = cam.target.map((v,i) => v+right[i]!*pan.x+up[i]!*pan.y) as Vec3;
    return {...cam,target,position:target.map((v,i) => v+dir[i]!*d) as Vec3};
  };
  const initial = fit(rect), initialPan = safePan(initial.d,initial.span);
  if (initialPan && initial.d <= maxDistance) return cameraAt(initial.d,initialPan);
  let best: {d:number;pan:{x:number;y:number}} | null = initialPan ? {d:initial.d,pan:initialPan} : null;
  for (const r of freeRects(width,height,panels)) {
    let {d,span} = fit(r,Math.max(1e-6,Math.min(distance,maxDistance)));
    let pan = safePan(d,span);
    // Extra depth can open enough pan slack to move an excluded secondary past a HUD edge.
    if (!pan && Number.isFinite(maxDistance) && maxDistance > d) {
      const end = interval(maxDistance,r);
      const endPan = end && safePan(maxDistance,end);
      if (endPan) {
        let lo=d, hi=maxDistance;
        pan=endPan;
        for (let i=0; i<32; i++) {
          const mid=(lo+hi)/2, middle=interval(mid,r), p=middle && safePan(mid,middle);
          if (p) { hi=mid; pan=p; } else lo=mid;
        }
        d=hi;
      }
    }
    if (!pan) continue;
    if (!best || d < best.d || (d === best.d && pan.x*pan.x+pan.y*pan.y < best.pan.x*best.pan.x+best.pan.y*best.pan.y)) best={d,pan};
  }
  return best ? cameraAt(best.d,best.pan) : cam;
}
