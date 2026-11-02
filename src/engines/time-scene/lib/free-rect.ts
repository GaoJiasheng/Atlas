/* Free HUD rectangle (copy of the SpaceScene `freeStageRect`; kept inside the TimeScene engine). */
/** HUD free rectangles in stage-local CSS pixels, shared by the map and 3D cameras. */
/** Below this stage aspect the HUD stacks over the stage (lib/camera.ts fitCameraToAspect uses the same 0.8). */
export const STACKED_ASPECT = 0.8;
export interface FrameRect { x0: number; y0: number; x1: number; y1: number }

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

