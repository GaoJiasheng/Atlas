/**
 * Data counts and areas for the TimeScene HUD (card band chart, panel 03
 * STATE, spec rows). Pure and unit-tested; these are statistics of the topic
 * data, not simulated values.
 */
import { areaKm2 } from './geo';
import type { Frame } from './frame';
import type { TimeModel } from './model';

/** Event kinds counted as battles in panel 03. */
const BATTLE_KINDS = new Set(['battle', 'landing', 'bombing', 'siege']);

/** Controlled area (km²) per entity at each keyframe, indexed like `model.keyframes`. */
export function controlAreas(model: TimeModel): Map<string, number[]> {
  const out = new Map<string, number[]>();
  for (const id of model.entities.keys()) out.set(id, model.keyframes.map(() => 0));
  model.keyframes.forEach((k, i) => {
    for (const f of k.keyframe.features.features) {
      const row = out.get(f.properties.holder);
      if (row) row[i] = (row[i] ?? 0) + areaKm2(f.geometry);
    }
  });
  return out;
}

/**
 * Area of `entityId` at `t`: 0 before the first keyframe, the last keyframe's
 * value after it, linear in between (an approximation of the crossfade).
 */
export function areaAt(model: TimeModel, areas: Map<string, number[]>, entityId: string, t: number): number {
  const row = areas.get(entityId);
  const ks = model.keyframes;
  if (!row || ks.length === 0 || t < ks[0]!.t) return 0;
  for (let i = ks.length - 1; i >= 0; i--) {
    if (t < ks[i]!.t) continue;
    const next = ks[i + 1];
    if (!next) return row[i] ?? 0;
    const k = (t - ks[i]!.t) / (next.t - ks[i]!.t);
    return (row[i] ?? 0) + ((row[i + 1] ?? 0) - (row[i] ?? 0)) * k;
  }
  return 0;
}

export interface FrameStats {
  participants: number;
  entities: number;
  activeBattles: number;
  activeMovements: number;
  /** Keyframe at or before `t` (-1 before the first) and the next one (-1 after the last). */
  prevIndex: number;
  nextIndex: number;
  /** Crossfade progress 0..1 toward `nextIndex`. */
  blend: number;
}

export function frameStats(model: TimeModel, frame: Frame): FrameStats {
  let activeBattles = 0;
  for (const ef of frame.events) {
    if (!ef.active) continue;
    const e = model.events.find((x) => x.event.id === ef.id)?.event;
    if (e && BATTLE_KINDS.has(e.kind)) activeBattles++;
  }
  return {
    participants: frame.participation.length,
    entities: model.entities.size,
    activeBattles,
    activeMovements: frame.movements.filter((m) => !m.lingering).length,
    prevIndex: frame.control.prevIndex,
    nextIndex: frame.control.nextIndex,
    blend: frame.control.blend,
  };
}

/**
 * The keyframe the map mostly shows at `frame` and the one to compare it
 * with in REFERENCE mode: the previous keyframe, or the next one when the
 * dominant keyframe is the first. `null` with fewer than two keyframes.
 */
export function referencePair(model: TimeModel, frame: Frame): { current: number; other: number } | null {
  if (model.keyframes.length < 2) return null;
  const { prevIndex, nextIndex, blend } = frame.control;
  const current = blend >= 0.5 && nextIndex >= 0 ? nextIndex : Math.max(0, prevIndex);
  const other = current > 0 ? current - 1 : current + 1;
  return { current, other };
}
