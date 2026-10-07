/**
 * What the GeoStage shows at numeric time `t`: pure, renderer-agnostic, and
 * unit-tested. The MapLibre controller turns a Frame into source data and
 * paint values.
 */
import { keyframeWindow, progressAlong, type KeyframeWindow } from './time';
import { pointAlong, sliceLine, type LngLat } from './geo';
import type { KeyframeN, MovementN, TimeModel } from './model';

export interface MovementFrame {
  m: MovementN;
  /** 0..1 of the way along the path (time progress). */
  progress: number;
  /** Path from the start to the head. */
  coords: LngLat[];
  head: LngLat;
  /** Point a little behind the head, for the arrow direction. */
  tail: LngLat;
}

export interface EventFrame {
  id: string;
  /** `t` inside [start, end]: drawn strongly and pulses on entry. */
  active: boolean;
}

export interface ParticipationFrame {
  entityId: string;
  /** 1 right at `joined`, fading to 0 over FLASH_SHARE of the span. */
  flash: number;
}

export interface Frame {
  control: KeyframeWindow<KeyframeN>;
  movements: MovementFrame[];
  /** Events that have started (or are highlighted). */
  events: EventFrame[];
  /** Entities in the story at `t` (joined, not yet left). */
  participation: ParticipationFrame[];
}

/** Share of the timeline span over which a newly joined entity glows. */
export const FLASH_SHARE = 0.04;

export function frameAt(model: TimeModel, t: number, highlight: readonly string[] = []): Frame {
  const hl = new Set(highlight);
  const control = keyframeWindow(model.keyframes, t, (k) => k.t);

  const movements: MovementFrame[] = [];
  for (const m of model.movements) {
    if (t < m.start || t > m.end) continue;
    const progress = progressAlong(m.start, m.end, t);
    const path = m.movement.path.coordinates;
    const coords = sliceLine(path, progress);
    const head = coords[coords.length - 1] ?? ([path[0]?.[0] ?? 0, path[0]?.[1] ?? 0] as LngLat);
    // Direction: a short way back along the path (mirrored from ahead at the very start).
    const behind = pointAlong(path, Math.max(0, progress - 0.02)) ?? head;
    const tail =
      behind[0] !== head[0] || behind[1] !== head[1]
        ? behind
        : mirror(head, pointAlong(path, Math.min(1, progress + 0.02)) ?? head);
    movements.push({ m, progress, coords, head, tail });
  }

  const events: EventFrame[] = [];
  for (const e of model.events) {
    const started = t >= e.start;
    if (!started && !hl.has(e.event.id)) continue;
    events.push({ id: e.event.id, active: started && t <= e.end });
  }

  const participation: ParticipationFrame[] = [];
  const flashSpan = model.span * FLASH_SHARE;
  for (const [entityId, en] of model.entities) {
    if (t < en.joined || t >= en.left) continue;
    participation.push({ entityId, flash: flashSpan > 0 ? 1 - progressAlong(en.joined, en.joined + flashSpan, t) : 0 });
  }

  return { control, movements, events, participation };
}

/** Reflect `p` through `origin` (turns a point ahead into a point behind). */
function mirror(origin: LngLat, p: LngLat): LngLat {
  return [2 * origin[0] - p[0], 2 * origin[1] - p[1]];
}
