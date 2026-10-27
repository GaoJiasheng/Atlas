/** Dimensionless classroom optics and slowed longitudinal motion (docs/58 §4). */
import type { SensesData } from '../../senses-schema';
import type { SimValues } from '../../sim-schema';

export const SENSES_STATES: Readonly<Record<string, readonly string[]>> = {
  'focus-state': ['on-retina', 'before-retina', 'behind-retina'],
  'eye-state': ['dark', 'lit'], 'sound-state': ['still', 'vibrating'],
};
export const SENSES_NUMBERS = ['aperture-area', 'relative-light', 'image-distance', 'magnification', 'retinal-top-y', 'blur-diameter', 'visual-hz', 'wavelength-scene', 'displacement-max', 'amplitude-level'] as const;
export function sensesQuantity(from: string): 'number' | 'state' | null {
  return Object.prototype.hasOwnProperty.call(SENSES_STATES, from) ? 'state' : (SENSES_NUMBERS as readonly string[]).includes(from) ? 'number' : null;
}
export function sensesExperiment(from: string): 'eye-light' | 'eye-focus' | 'sound' | null {
  if (['aperture-area', 'relative-light'].includes(from)) return 'eye-light';
  if (['image-distance', 'magnification', 'retinal-top-y', 'blur-diameter', 'focus-state', 'eye-state'].includes(from)) return 'eye-focus';
  return sensesQuantity(from) ? 'sound' : null;
}
function number(values: SimValues, id: string): number {
  const v = values[id];
  if (typeof v !== 'number' || !Number.isFinite(v) || v <= 0) throw new Error(`senses: ${id} must be a positive finite number`);
  return v;
}
function toggle(values: SimValues, id: string): boolean {
  const v = values[id];
  if (typeof v !== 'boolean') throw new Error(`senses: ${id} must be a boolean`);
  return v;
}
export function effectiveEyeRays(data: SensesData, values: SimValues) {
  const e = data.eye;
  const object = values[e.object], focus = values[e.focus];
  if ((object !== 'near' && object !== 'far') || (focus !== 'near' && focus !== 'far')) throw new Error('senses: object and focus must be near or far');
  const u = e.objectsCm[object], f = e.focalCm[focus], r = e.retinaCm, diameterCm = number(values, e.pupilMm) / 10;
  if (![u, f, r, diameterCm].every((x) => Number.isFinite(x) && x > 0) || u <= f || diameterCm >= .5) throw new Error('senses: invalid paraxial domain (u > f > 0, diameter < .5 cm)');
  const v = u * f / (u - f);
  return { u, f, v, r, diameterCm, points: e.objectHeightsCm.map((h) => ({
    h, centerY: -r * h / u, spotDiameter: diameterCm * Math.abs(1 - r / v),
    rays: [-diameterCm / 2, 0, diameterCm / 2].map((a) => ({
      object: [-u, h, 0] as [number, number, number], lens: [0, a, 0] as [number, number, number],
      retina: [r, a * (1 - r / v) - r * h / u, 0] as [number, number, number],
    })),
  })) };
}
export function solveSenses(data: SensesData, values: SimValues): Record<string, number | string> {
  const e = data.eye, s = data.sound, ray = effectiveEyeRays(data, values);
  const d = number(values, e.pupilMm), active = toggle(values, s.active), light = toggle(values, e.illumination);
  const frequency = number(values, s.frequencyHz), amplitude = number(values, s.amplitude);
  return {
    'aperture-area': Math.PI * d * d / 4, 'relative-light': light ? (d / e.referencePupilMm) ** 2 : 0,
    'image-distance': ray.v, magnification: -ray.v / ray.u, 'retinal-top-y': ray.points[0]!.centerY,
    'blur-diameter': ray.points[0]!.spotDiameter,
    'focus-state': Math.abs(ray.v - ray.r) <= 1e-6 ? 'on-retina' : ray.v < ray.r ? 'before-retina' : 'behind-retina',
    'eye-state': light ? 'lit' : 'dark', 'visual-hz': active ? frequency / s.slowFactor : 0,
    'wavelength-scene': s.baseWavelengthScene * s.baseFrequencyHz / frequency,
    'displacement-max': active ? s.baseDisplacementScene * amplitude : 0, 'amplitude-level': active ? amplitude : 0,
    'sound-state': active ? 'vibrating' : 'still',
  };
}
export function longitudinalPositions(count: number, spacing: number, amplitude: number, wavelength: number, phaseCycles: number): number[] {
  return Array.from({ length: count }, (_, i) => { const x = i * spacing; return x + amplitude * Math.sin(2 * Math.PI * (x / wavelength - phaseCycles)); });
}

/** Particle radius of the longitudinal row, scene units (DESIGN: about a quarter of the rest spacing). */
export const WAVE_PARTICLE_RADIUS = .013;
/** A focused point on the bench receiver is a small visible dot, not a vanishing speck (scene units). */
export const BENCH_DOT_RADIUS = .012;
interface Bench { origin: readonly number[]; cmToScene: number; yScale?: number }
/** Model centimetres → scene: x and z at `cmToScene`; y also times the disclosed vertical exaggeration. */
export function benchVertex(o: Bench, v: readonly number[]): [number, number, number] {
  const y = o.yScale ?? 1;
  return [o.origin[0]! + v[0]! * o.cmToScene, o.origin[1]! + v[1]! * o.cmToScene * y, o.origin[2]! + v[2]! * o.cmToScene];
}
/** Scale of a unit sphere drawn as the receiver spot: a round patch whose diameter is the geometric
 * blur at the bench's vertical scale (the rays' spread on the receiver); a focused point is a small dot. */
export function benchSpotScale(o: Bench, spotDiameterCm: number, focused: boolean): [number, number, number] {
  const half = focused ? 0 : spotDiameterCm * o.cmToScene * (o.yScale ?? 1) / 2;
  const r = Math.max(BENCH_DOT_RADIUS, half);
  return [r, r, r];
}
/** Scene point for the stage note: above the receiver, level with the highest object point, where no ray runs. */
export function benchLabelPoint(o: Bench, eye: { r: number; points: { h: number }[] }): [number, number, number] {
  const high = Math.max(...eye.points.map((p) => p.h));
  return benchVertex(o, [eye.r, high, 0]);
}
