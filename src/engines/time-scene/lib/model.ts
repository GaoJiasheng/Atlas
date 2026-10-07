/**
 * Pre-computed numeric view of a GeoStage topic's data: every TimePoint is
 * turned into a number once (lib/time.ts), the timeline span is derived, and
 * lookups are indexed. Pure; built once per scene in the View.
 */
import type { Bloc, ControlKeyframe, Entity, Movement, SceneEvent, TimeSceneGeoData } from '../schema';
import { periodEnd, toNumber, type TimePoint, type TimeScale } from './time';

export interface KeyframeN {
  t: number;
  keyframe: ControlKeyframe;
}

export interface EventN {
  event: SceneEvent;
  start: number;
  /** End of the active window (>= start; at least `minWindow` long). */
  end: number;
}

export interface MovementN {
  movement: Movement;
  start: number;
  end: number;
}

export interface EntityN {
  entity: Entity;
  joined: number;
  left: number;
}

export interface ChapterNode {
  id: string;
  t: number;
}

export interface TimeModel {
  scale: TimeScale;
  min: number;
  max: number;
  span: number;
  keyframes: KeyframeN[];
  events: EventN[];
  movements: MovementN[];
  entities: Map<string, EntityN>;
  chapterNodes: ChapterNode[];
  /** Largest movement strength (for arrow widths). */
  maxStrength: number;
  /** [west, south, east, north] of all data geometry. */
  bounds: [number, number, number, number] | null;
}

export function blocOf(model: TimeModel, entityId: string): Bloc {
  return model.entities.get(entityId)?.entity.bloc ?? 'neutral';
}

const finite = (n: number) => Number.isFinite(n);

/**
 * @param chapterTimes resolved `t` per chapter (in chapter order); chapters
 *   without a time are skipped. They widen the span if they fall outside it.
 */
export function buildTimeModel(
  data: TimeSceneGeoData,
  chapterTimes: readonly { id: string; t: TimePoint | null | undefined }[],
): TimeModel {
  const first = data.control.keyframes[0];
  const scale: TimeScale = first && typeof first.t === 'object' ? 'ma' : 'date';

  const keyframes = data.control.keyframes.map((keyframe) => ({ t: toNumber(keyframe.t), keyframe }));
  const movements = data.movements
    .map((movement) => ({ movement, start: toNumber(movement.from), end: toNumber(movement.to) }))
    .filter((m) => finite(m.start) && finite(m.end));

  const points: number[] = [
    ...keyframes.map((k) => k.t),
    ...movements.flatMap((m) => [m.start, m.end]),
  ];
  const rawEvents = data.events.map((event) => {
    const start = toNumber(event.t);
    const end = event.until !== undefined ? periodEnd(event.until) : periodEnd(event.t);
    points.push(start);
    if (event.until !== undefined) points.push(toNumber(event.until));
    return { event, start, end };
  });
  const chapterNodes: ChapterNode[] = [];
  for (const c of chapterTimes) {
    if (c.t === null || c.t === undefined) continue;
    const t = toNumber(c.t);
    if (!finite(t)) continue;
    chapterNodes.push({ id: c.id, t });
    points.push(t);
  }

  const valid = points.filter(finite);
  let min = valid.length ? Math.min(...valid) : 0;
  let max = valid.length ? Math.max(...valid) : 1;
  if (max - min <= 0) {
    // Single point in time: give the axis some room.
    const pad = scale === 'ma' ? 1e6 : 1;
    min -= pad / 2;
    max += pad / 2;
  }
  const span = max - min;
  const minWindow = span * 0.01;
  const events = rawEvents
    .filter((e) => finite(e.start))
    .map((e) => ({ ...e, end: Math.max(finite(e.end) ? e.end : e.start, e.start + minWindow) }));

  const entities = new Map<string, EntityN>();
  for (const entity of data.entities) {
    const joined = toNumber(entity.joined);
    const left = entity.left !== undefined ? toNumber(entity.left) : Number.POSITIVE_INFINITY;
    entities.set(entity.id, { entity, joined: finite(joined) ? joined : min, left });
  }

  return {
    scale,
    min,
    max,
    span,
    keyframes,
    events,
    movements,
    entities,
    chapterNodes,
    maxStrength: Math.max(1, ...data.movements.map((m) => m.strength)),
    bounds: dataBounds(data),
  };
}

function dataBounds(data: TimeSceneGeoData): [number, number, number, number] | null {
  let w = Infinity;
  let s = Infinity;
  let e = -Infinity;
  let n = -Infinity;
  const add = (p: readonly number[]) => {
    const [x = 0, y = 0] = p;
    if (x < w) w = x;
    if (x > e) e = x;
    if (y < s) s = y;
    if (y > n) n = y;
  };
  for (const kf of data.control.keyframes)
    for (const f of kf.features.features) {
      const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
      for (const poly of polys) for (const ring of poly) ring.forEach(add);
    }
  for (const m of data.movements) m.path.coordinates.forEach(add);
  for (const ev of data.events) add(ev.at);
  return Number.isFinite(w) ? [w, s, e, n] : null;
}
