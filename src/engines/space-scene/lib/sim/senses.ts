/** Dimensionless classroom optics and slowed longitudinal motion (docs/58 §4). */
import type { SensesData } from '../../senses-schema';
import type { SimValues } from '../../sim-schema';

export { SENSES_STATES, SENSES_NUMBERS, SOUND_LAB_NULLABLE, sensesQuantity, sensesExperiment } from './senses-info';
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
  if (!e) throw new Error('senses: sound-only has no eye geometry');
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
/** Fixed teaching speeds and analytic travel events; a missing path is never a zero-time event. */
export function solveSoundLab(config: NonNullable<SensesData['soundLab']>, values: SimValues): Record<string, number | string | null> {
  const medium = values[config.medium], distance = number(values, config.distanceM), active = toggle(values, 'sound-active');
  if (!['air','water','solid-example','vacuum'].includes(String(medium))) throw new Error('senses: unknown sound medium');
  if (![17,34,68].includes(distance)) throw new Error('senses: distance must be 17, 34 or 68');
  const speed = medium === 'vacuum' ? null : config.speedMps[medium as keyof typeof config.speedMps];
  const transmitted = medium !== 'vacuum' && active;
  return { 'propagation-state': medium === 'vacuum' ? 'no-medium' : active ? 'transmitted' : 'source-off',
    'speed-mps': speed, 'one-way-ms': transmitted ? 1000 * distance / speed! : null, 'echo-ms': transmitted ? 2000 * distance / speed! : null };
}
export function solveSenses(data: SensesData, values: SimValues): Record<string, number | string | null> {
  const e = data.eye, s = data.sound;
  const active = toggle(values, s.active), frequency = number(values, s.frequencyHz), amplitude = number(values, s.amplitude);
  if (![250,500].includes(frequency) || ![1,2].includes(amplitude)) throw new Error('senses: frequency/amplitude outside fixed classroom domain');
  const sound: Record<string, number | string | null> = {
    'visual-hz': active ? frequency / s.slowFactor : 0,
    'wavelength-scene': s.baseWavelengthScene * s.baseFrequencyHz / frequency,
    'displacement-max': active ? s.baseDisplacementScene * amplitude : 0, 'amplitude-level': active ? amplitude : 0,
    'sound-state': active ? 'vibrating' : 'still', 'source-drive': !active ? 'off' : amplitude === 1 ? 'amplitude-one' : 'amplitude-two',
    ...(data.soundLab ? solveSoundLab(data.soundLab, values) : {}),
  };
  if (data.profile === 'sound-only') return sound;
  if (!e) throw new Error('senses: eye-and-sound requires eye');
  const ray = effectiveEyeRays(data, values), d = number(values, e.pupilMm), light = toggle(values, e.illumination);
  return {
    'aperture-area': Math.PI * d * d / 4, 'relative-light': light ? (d / e.referencePupilMm) ** 2 : 0,
    'image-distance': ray.v, magnification: -ray.v / ray.u, 'retinal-top-y': ray.points[0]!.centerY,
    'blur-diameter': ray.points[0]!.spotDiameter,
    'focus-state': Math.abs(ray.v - ray.r) <= 1e-6 ? 'on-retina' : ray.v < ray.r ? 'before-retina' : 'behind-retina',
    'eye-state': light ? 'lit' : 'dark', ...sound,
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
