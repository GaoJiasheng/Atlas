/**
 * Force arrows (`force-vectors`, docs/30 F3; pure, unit-tested): a colour
 * token and a KEY name per kind of force, an arrow's value and length, and
 * which kinds of force the scene on show draws (the KEY lists only those).
 */
import type { ForceArrow, ForceKind, SimData, SimOverlay, SimValues } from '../../sim-schema';
import type { BilingualText } from '../../../../i18n';
import { holds } from './bind';
import { numberOf, type SimOutputs } from './index';
import { channelPeak, channelValue, isTimeline } from './timeline';

/** One colour per kind of force (theme tokens; the magnetic force keeps the magnets topic's north-pole red). */
export const FORCE_COLORS: Readonly<Record<ForceKind, string>> = {
  lift: 'token:f-lift', drag: 'token:f-drag', thrust: 'token:f-thrust',
  gravity: 'token:f-gravity',
  friction: 'token:f-friction',
  elastic: 'token:f-elastic',
  push: 'token:f-push',
  magnetic: 'token:pole-n',
};

/** The KEY names (syllabus wording; "push or pull" for a push of the rod or a pull of the balance). */
export const FORCE_NAMES: Readonly<Record<ForceKind, BilingualText>> = {
  lift: { en: 'Lift', zh: '升力' }, drag: { en: 'Drag', zh: '阻力' }, thrust: { en: 'Thrust', zh: '推力' },
  gravity: { en: 'Gravitational force', zh: '重力' },
  friction: { en: 'Frictional force', zh: '摩擦力' },
  elastic: { en: 'Elastic spring force', zh: '弹簧的弹力' },
  push: { en: 'Push or pull', zh: '推力或拉力' },
  magnetic: { en: 'Magnetic force', zh: '磁力' },
};

/** Below this many newtons an arrow fades out. */
export const ARROW_FLOOR = 0.05;

type Vectors = Extract<SimOverlay, { kind: 'force-vectors' }>;

/** An arrow's length (scene units) for a value in newtons: `per` × |value|, at most `max`. */
export function arrowLength(value: number, per: number, max: number): number {
  return Math.min(max, Math.abs(value) * per);
}

/** A force arrow's shaft and head scale with the overlay's `per` (the length of 1 N): this many newtons' worth. */
const VECTOR_FULL = 1.6;
/** Smallest arrow scale as a share of the overlay's longest arrow (`max`). */
const VECTOR_MIN_SHARE = 0.16;

/**
 * Shaft and head scale of a force-vectors overlay (scene units): 1.6 N's
 * worth of length, but never below 0.16 × `max`, so an overlay measured in
 * thousands of newtons (the airfoil's lift, docs/45 E-AF5) still draws a
 * visible shaft and head. The overlays in newtons keep their old scale.
 */
export function vectorScale(per: number, max: number): number {
  return Math.max(per * VECTOR_FULL, max * VECTOR_MIN_SHARE);
}

/** The arrow's value now: a number, a number output, or a timeline channel at model time `t` (the end state when `t` is not given). */
export function arrowValue(a: ForceArrow, outputs: SimOutputs, t?: number): number {
  if (typeof a.value === 'number') return a.value;
  const v = outputs[a.value.output];
  if (a.value.channel !== undefined) return isTimeline(v) ? channelValue(v, a.value.channel, t ?? v.duration) : 0;
  const n = numberOf(v);
  return Number.isFinite(n) ? n : 0;
}

/** Whether an arrow's `when` holds for these values and outputs. */
export function arrowWhen(a: ForceArrow, sim: SimData, values: SimValues, outputs: SimOutputs): boolean {
  const w = a.when;
  if (!w) return true;
  const first = w.output ? Object.keys(sim.outputs.find((o) => o.id === w.output)?.states ?? {})[0] : undefined;
  return holds(w.is, w.control !== undefined ? values[w.control] : outputs[w.output!], first);
}

/**
 * The kinds of force the scene draws now, in the KEY's order: arrows whose
 * `when` holds, whose part is on show (not put aside, its group's layer on),
 * whose overlay's group is on, and whose value reaches the floor at some
 * point of its run (a timeline channel) or now (a number).
 */
export function forcesOnShow(
  sim: SimData,
  values: SimValues,
  outputs: SimOutputs,
  shown: (part: string) => boolean,
  layerOn: (group: string) => boolean,
): ForceKind[] {
  const kinds = new Set<ForceKind>();
  for (const o of sim.overlays) {
    if (o.kind !== 'force-vectors') continue;
    const v = o as Vectors;
    if (v.group !== undefined && !layerOn(v.group)) continue;
    for (const a of v.arrows) {
      if (!shown(a.part) || !arrowWhen(a, sim, values, outputs)) continue;
      const peak =
        typeof a.value === 'object' && a.value.channel !== undefined
          ? (() => {
              const tl = outputs[a.value.output];
              return isTimeline(tl) ? channelPeak(tl, a.value.channel) : 0;
            })()
          : Math.abs(arrowValue(a, outputs));
      if (peak >= ARROW_FLOOR) kinds.add(a.force);
    }
  }
  return (Object.keys(FORCE_COLORS) as ForceKind[]).filter((k) => kinds.has(k));
}
