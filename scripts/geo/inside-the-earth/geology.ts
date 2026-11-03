/** Topic-owned geological sections. Bed contacts are shared sampled curves,
 * not coloured boxes laid on a block. All grain/relief dimensions are design. */
import type { z } from 'zod';
import { primitiveSchema } from '../../../src/engines/space-scene/schema';
type Primitive = z.input<typeof primitiveSchema>;
type V2 = [number, number];
type V3 = [number, number, number];
export const section = (lower: V2[], upper: V2[], depth: number, tint: string, at: V3 = [0, 0, 0]): Primitive => ({
  kind: 'extrude', shape: [...lower, ...upper.slice().reverse()], depth, at, color: 'abrasive', tint,
});
export const trace = (x0: number, x1: number, y: (x: number, t: number) => number, n = 49): V2[] => Array.from({ length: n }, (_, i) => {
  const t = i / (n - 1), x = x0 + (x1 - x0) * t;
  return [x, y(x, t)];
});
export function beds(x0: number, x1: number, bottom: number, top: number, depth: number, count = 7, weathered = false): Primitive[] {
  const contacts = Array.from({ length: count + 1 }, (_, k) => trace(x0, x1, (x, t) => {
    const f = k / count;
    return bottom + (top - bottom) * f + Math.sin(Math.PI * f) * (0.012 * Math.sin(x * 7.1) + 0.006 * Math.sin(x * 18 + 0.5))
      - (weathered && k === count ? 0.007 * (0.5 + 0.5 * Math.sin(x * 23 + t)) : 0);
  }));
  return Array.from({ length: count }, (_, k) => section(contacts[k]!, contacts[k + 1]!, depth, k % 3 === 0 ? 'token:ink-2' : 'token:ink-3'));
}
/** Thin, branching mineralised joints on a specimen's cut face. */
export function joints(x0: number, x1: number, y0: number, y1: number, z: number, count = 4): Primitive[] {
  return Array.from({ length: count }, (_, k) => {
    const x = x0 + (x1 - x0) * (k + 0.63) / count;
    const points: V2[] = Array.from({ length: 15 }, (_, i) => {
      const t = i / 14;
      return [x + 0.024 * Math.sin(t * 8 + k) + 0.035 * t, y0 + (y1 - y0) * t];
    });
    return { kind: 'extrude', shape: [...points, ...points.slice().reverse().map(([a, b]): V2 => [a + 0.0025, b])], depth: 0.0015, at: [0, 0, z], color: 'abrasive', tint: 'token:ink-2' };
  });
}
/** Grain ribbons confined to a globe's two meridian cut faces. These do not
 * add named seismic layers or change any of the measured spherical radii. */
export function shellGrain(inner: number, outer: number): Primitive[] {
  return [-70, -160].flatMap((rotation, face) => Array.from({ length: 7 }, (_, k) => {
    const r = inner + (outer - inner) * (k + 0.6) / 8;
    const a0 = 0.13 + (k % 3) * 0.22, a1 = Math.PI - 0.12 - (k % 2) * 0.27;
    const line: V2[] = Array.from({ length: 49 }, (_, i) => {
      const a = a0 + (a1 - a0) * i / 48;
      const rr = r + 0.003 * Math.sin(a * 17 + k) + 0.0012 * Math.cos(a * 39 - k);
      return [rr * Math.sin(a), rr * Math.cos(a)];
    });
    const other = line.map(([x, y]): V2 => { const h = Math.hypot(x, y), rr = h + 0.0015 + 0.0008 * Math.sin(k + y * 18); return [x * rr / h, y * rr / h]; });
    return { ...section(line, other, 0.0012, k % 3 ? 'token:ink-2' : 'token:ink-3'), rotation: [0, rotation, 0], at: face ? [0.00034,0,0.00094] : [-0.00094,0,0.00034] };
  }));
}
