import type { Primitive } from '../schema';

/** Radius and local Y, in scene units. Axis edges may connect cavity boundaries. */
export type FillProfile = readonly (readonly [number, number])[];
export type FillShape = FillProfile | { kind: 'lathe'; profile: FillProfile } | { kind: 'box'; size: readonly number[]; rotationY?: number };
export interface FillSlice {
  /** Drawn liquid volume; decorative meniscus volume is deliberately excluded. */
  volume: number;
  level: number;
  bottom: number;
  shown: boolean;
  profile: FillProfile;
  meniscus: FillProfile;
}

const isBox = (shape: FillShape): shape is { kind: 'box'; size: readonly number[] } => !Array.isArray(shape) && 'kind' in shape && shape.kind === 'box';
const profileOf = (shape: FillShape): FillProfile => Array.isArray(shape) ? shape : (shape as { profile: FillProfile }).profile;

export function fillShapeForPrimitive(primitive: Primitive | undefined): FillShape | null {
  if (!primitive) return null;
  const upright = (degrees: number) => Math.abs(degrees % 360) < 1e-9;
  if (!upright(primitive.rotation?.[0] ?? 0) || !upright(primitive.rotation?.[2] ?? 0)) return null;
  const [sx, sy, sz] = primitive.scale ?? [1, 1, 1];
  if (primitive.kind === 'lathe') {
    if (primitive.arc !== undefined || Math.abs(sx - sz) > 1e-9 * Math.max(sx, sz)) return null;
    const flipY = primitive.mirror === 'y' ? -1 : 1;
    return { kind: 'lathe', profile: primitive.profile.map(([r, y]) => [r * sx, y === 0 ? 0 : y * sy * flipY]) };
  }
  if (primitive.kind === 'box') {
    const shape: { kind: 'box'; size: number[]; rotationY?: number } = { kind: 'box', size: [(primitive.size[0] ?? 1) * sx, (primitive.size[1] ?? 1) * sy, (primitive.size[2] ?? 1) * sz] };
    if (primitive.rotation?.[1]) shape.rotationY = primitive.rotation[1];
    return shape;
  }
  return null;
}

export function fillBounds(shape: FillShape): { min: number; max: number } {
  if (isBox(shape)) {
    const half = (shape.size[1] ?? 1) / 2;
    return { min: -half, max: half };
  }
  let min = Infinity, max = -Infinity;
  for (const [, y] of profileOf(shape)) { min = Math.min(min, y); max = Math.max(max, y); }
  return { min, max };
}

/** Half-plane clipping, with an explicit closing point even for axis-closed inputs. */
export function clipProfile(profile: FillProfile, y: number, side: 'below' | 'above' = 'below'): FillProfile {
  if (profile.length < 3) return [];
  const result: [number, number][] = [];
  const inside = (point: readonly [number, number]) => side === 'below' ? point[1] <= y : point[1] >= y;
  const append = (point: readonly [number, number]) => {
    const last = result[result.length - 1];
    if (!last || last[0] !== point[0] || last[1] !== point[1]) result.push([point[0], point[1]]);
  };
  let previous = profile[profile.length - 1]!;
  for (const current of profile) {
    if (inside(previous) !== inside(current)) {
      const t = (y - previous[1]) / (current[1] - previous[1]);
      append([previous[0] + t * (current[0] - previous[0]), y]);
    }
    if (inside(current)) append(current);
    previous = current;
  }
  if (result.length > 1) append(result[0]!);
  return result;
}

/**
 * Pappus's first area moment after horizontal clipping. Integrating r² dy on
 * each clipped edge is the polygon area × centroid formula without allocating
 * a clipped polygon; its horizontal closing edges contribute zero.
 */
export function volumeBelow(shape: FillShape, y: number): number {
  if (isBox(shape)) {
    const { min, max } = fillBounds(shape);
    return (shape.size[0] ?? 1) * (shape.size[2] ?? 1) * Math.max(0, Math.min(max, y) - min);
  }
  const profile = profileOf(shape);
  let sum = 0;
  for (let i = 0; i < profile.length; i++) {
    const a = profile[i]!, b = profile[(i + 1) % profile.length]!;
    if (a[1] > y && b[1] > y) continue;
    let ar = a[0], ay = a[1], br = b[0], by = b[1];
    if (ay > y) { ar += (br - ar) * (y - ay) / (by - ay); ay = y; }
    if (by > y) { br = a[0] + (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]); by = y; }
    sum += (by - ay) * (ar * ar + ar * br + br * br);
  }
  return Math.abs(Math.PI * sum / 3);
}

export function capacity(shape: FillShape): number { return volumeBelow(shape, fillBounds(shape).max); }

/** Forty bisections bound height error to less than 1e-9 m for scene vessels. */
export function levelForVolume(shape: FillShape, volume: number): number {
  const bounds = fillBounds(shape), total = capacity(shape);
  if (volume <= 0) return bounds.min;
  if (volume >= total) return bounds.max;
  if (isBox(shape)) return bounds.min + volume / ((shape.size[0] ?? 1) * (shape.size[2] ?? 1));
  let low = bounds.min, high = bounds.max;
  for (let i = 0; i < 40; i++) {
    const middle = (low + high) / 2;
    if (volumeBelow(shape, middle) < volume) low = middle; else high = middle;
  }
  return (low + high) / 2;
}

/** A display-only raised outer lip; the flat level remains the reading. */
export function meniscusProfile(profile: FillProfile, level: number, height: number): FillProfile {
  if (height <= 0) return [];
  let outer = 0, inner = Infinity;
  for (let i = 0; i < profile.length; i++) {
    const a = profile[i]!, b = profile[(i + 1) % profile.length]!;
    if (a[1] === level) { outer = Math.max(outer, a[0]); inner = Math.min(inner, a[0]); }
    if ((a[1] < level && b[1] > level) || (b[1] < level && a[1] > level)) {
      const radius = a[0] + (b[0] - a[0]) * (level - a[1]) / (b[1] - a[1]);
      outer = Math.max(outer, radius); inner = Math.min(inner, radius);
    }
  }
  const width = Math.min(height * 2, outer - (Number.isFinite(inner) ? inner : 0));
  return width > 0 ? [[outer - width, level], [outer, level], [outer, level + height], [outer - width, level]] : [];
}

export function fillSlice(shape: FillShape, volume: number, options: { below?: number; meniscus?: number } = {}): FillSlice {
  const total = capacity(shape), below = Math.max(0, Math.min(total, options.below ?? 0));
  const actual = Math.max(0, Math.min(total - below, volume));
  const bottom = levelForVolume(shape, below), level = levelForVolume(shape, below + actual);
  const shown = actual > 0 && actual >= total * 0.001;
  const profile = !isBox(shape) && shown ? clipProfile(clipProfile(profileOf(shape), level), bottom, 'above') : [];
  return { volume: actual, level, bottom, shown, profile, meniscus: shown ? meniscusProfile(profile, level, options.meniscus ?? 0) : [] };
}

/** Cubic ease-in-out in volume space, shared by all vessels in one change. */
export function easeFillVolume(from: number, to: number, elapsed: number, duration: number): number {
  if (duration <= 0 || elapsed >= duration) return to;
  if (elapsed <= 0) return from;
  const t = elapsed / duration, eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  return from + (to - from) * eased;
}

/** Weakly simple polygons may share axis edges, allowing an enclosed cavity. */
export function validateFillProfile(profile: FillProfile): string[] {
  const errors: string[] = [];
  if (profile.length < 3) return ['fill needs at least three profile points'];
  if (profile.some(([r, y]) => !Number.isFinite(r) || !Number.isFinite(y) || r < 0)) return ['fill profile coordinates must be finite with nonnegative radius'];
  const first = profile[0]!, last = profile[profile.length - 1]!;
  if (!((first[0] === 0 && last[0] === 0) || (first[0] === last[0] && first[1] === last[1]))) errors.push('fill profile must be closed (both ends on the axis, or matching endpoints)');
  const points = first[0] === last[0] && first[1] === last[1] ? profile.slice(0, -1) : profile;
  const epsilon = Math.max(...points.flatMap(([r, y]) => [Math.abs(r), Math.abs(y)]), 1e-3) * 1e-10;
  const cross = (a: readonly number[], b: readonly number[], c: readonly number[]) => (b[0]! - a[0]!) * (c[1]! - a[1]!) - (b[1]! - a[1]!) * (c[0]! - a[0]!);
  const on = (a: readonly number[], b: readonly number[], c: readonly number[]) => Math.abs(cross(a, b, c)) <= epsilon * epsilon && c[0]! >= Math.min(a[0]!, b[0]!) - epsilon && c[0]! <= Math.max(a[0]!, b[0]!) + epsilon && c[1]! >= Math.min(a[1]!, b[1]!) - epsilon && c[1]! <= Math.max(a[1]!, b[1]!) + epsilon;
  for (let i = 0; i < points.length; i++) {
    const a = points[i]!, b = points[(i + 1) % points.length]!;
    const next = points[(i + 2) % points.length]!;
    if (Math.abs(cross(a, b, next)) <= epsilon * epsilon && (a[0] - b[0]) * (next[0] - b[0]) + (a[1] - b[1]) * (next[1] - b[1]) > epsilon * epsilon && Math.max(a[0], b[0], next[0]) > epsilon)
      return [...errors, 'fill profile must not retrace an edge away from the axis'];
    for (let j = i + 1; j < points.length; j++) {
      if (j === i + 1 || (i === 0 && j === points.length - 1)) continue;
      const c = points[j]!, d = points[(j + 1) % points.length]!;
      const proper = cross(a, b, c) * cross(a, b, d) < 0 && cross(c, d, a) * cross(c, d, b) < 0;
      const contacts = [on(a, b, c) && c, on(a, b, d) && d, on(c, d, a) && a, on(c, d, b) && b].filter((p): p is readonly [number, number] => p !== false);
      if (proper || contacts.some(([r]) => r > epsilon)) return [...errors, 'fill profile must not self-intersect away from the axis'];
    }
  }
  if (!(capacity(profile) > 0)) errors.push('fill profile must enclose positive volume');
  return errors;
}
