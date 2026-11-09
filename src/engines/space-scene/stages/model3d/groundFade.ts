/**
 * How much of the ground shadow to draw for a camera. Seen at a grazing angle the soft disc flattens into a grey band
 * across the stage, and from close up the view sits inside it and the whole backdrop turns grey; neither reads as a shadow.
 */
const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
/** Sine of the camera's height above the floor: no shadow below the first, all of it from the second. */
const GRAZING: readonly [number, number] = [0.1, 0.34];
/** The disc's radius in view half-heights: all of it up to the first, none from the second. */
const OVERSIZE: readonly [number, number] = [1.6, 3.2];

export function groundShadowFade(camera: readonly [number, number, number], floorY: number, center: readonly [number, number], radius: number, fovDeg: number): number {
  const dx = camera[0] - center[0];
  const dy = camera[1] - floorY;
  const dz = camera[2] - center[1];
  const distance = Math.hypot(dx, dy, dz);
  if (distance <= 0 || dy <= 0) return 0;
  const halfHeight = distance * Math.tan((fovDeg * Math.PI) / 360);
  return smooth(GRAZING[0], GRAZING[1], dy / distance) * (1 - smooth(OVERSIZE[0], OVERSIZE[1], radius / halfHeight));
}
