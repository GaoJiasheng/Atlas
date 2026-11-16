/**
 * Whole-globe framing for the rotation map (docs/72 §9.4). MapLibre 5's globe has a radius of
 * worldSize / 2π / cos(centre latitude) px and a perspective camera 1.5 × the canvas height from the
 * centre point (36.87° field of view), so the disc on screen is the sphere's silhouette, slightly
 * smaller than the radius. A view whose disc would be only a little larger than the free stage rect
 * (its rim cut by the HUD blocks around it) is zoomed out until the whole disc sits in the rect;
 * a close-up whose disc is much larger than the rect (rim mostly off the canvas) is left alone.
 */
const RAD = Math.PI / 180;
/** Camera distance / canvas height for MapLibre's default 36.87° field of view. */
const CAMERA = 0.5 / Math.tan((36.87 / 2) * RAD);
/** Discs up to this many times the free rect's shorter side are fitted into it. */
export const GLOBE_FIT_RATIO = 1.7;

/** On-screen diameter (px) of the globe at a map zoom and centre latitude, on a canvas `height` px tall. */
export function globeDiameter(zoom: number, lat: number, height: number): number {
  const r = (512 * 2 ** zoom) / (2 * Math.PI) / Math.cos(Math.min(85, Math.abs(lat)) * RAD);
  const d = CAMERA * height;
  return (2 * d * r) / Math.sqrt(d * d + 2 * d * r);
}

/** The map zoom at which the globe's disc is `diameter` px (inverse of `globeDiameter`). */
export function zoomForDiameter(diameter: number, lat: number, height: number): number {
  const s = diameter / 2;
  const d = CAMERA * height;
  const r = (s * s + s * Math.sqrt(s * s + d * d)) / d;
  return Math.log2((r * 2 * Math.PI * Math.cos(Math.min(85, Math.abs(lat)) * RAD)) / 512);
}

/** `zoom`, or the zoom that fits the whole disc into a free rect `w` × `h` when it nearly fits already. Never zooms in. */
export function globeFitZoom(zoom: number, lat: number, height: number, w: number, h: number, ratio = GLOBE_FIT_RATIO): number {
  const side = Math.min(w, h);
  if (!(side > 0) || !(height > 0)) return zoom;
  const disc = globeDiameter(zoom, lat, height);
  if (disc <= side || disc > ratio * side) return zoom;
  return Math.min(zoom, zoomForDiameter(side, lat, height));
}
