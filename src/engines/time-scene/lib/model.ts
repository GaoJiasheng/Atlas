/**
 * Pre-computed numeric view of a GeoStage topic's data: every TimePoint is
 * turned into a number once (lib/time.ts), the timeline span is derived, and
 * lookups are indexed. Pure; built once per scene in the View.
 */
import type { Bloc, ControlKeyframe, Entity, Movement, SceneEvent, TimeSceneGeoData } from '../schema';
import { periodEnd, toNumber, type TimePoint, type TimeScale } from './time';
import { unwrapPathCentred, type LngLat } from './geo';
import { blocAtSpans, blocSpansN } from './bloc';
import { decodeControl } from './control';

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
  /** Path with continuous longitudes (may pass ±180; see `unwrapPathCentred`). Use this, not `movement.path`. */
  path: LngLat[];
  /** After `end`, the finished line stays (faint) until this time; null = hidden right after `end`. */
  linger: number | null;
}

export interface EntityN {
  entity: Entity;
  joined: number;
  left: number;
  /** Bloc spans `[from, to)` as numbers (one open span for a plain bloc). */
  spans: { bloc: Bloc; from: number; to: number }[];
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
  /** Dated events (everything but `site`). */
  events: EventN[];
  /** Static `site` events: no time window, shown on the `sites` layer. */
  sites: SceneEvent[];
  movements: MovementN[];
  entities: Map<string, EntityN>;
  chapterNodes: ChapterNode[];
  /** Largest movement strength (for arrow widths). */
  maxStrength: number;
  /** [west, south, east, north] of all data geometry. */
  bounds: [number, number, number, number] | null;
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
  // Either control.json shape (GeoJSON or TopoJSON) becomes plain FeatureCollections here, once.
  const decoded = decodeControl(data.control);
  const first = decoded[0];
  const scale: TimeScale = first && typeof first.t === 'object' ? 'ma' : 'date';

  const keyframes = decoded.map((keyframe) => ({ t: toNumber(keyframe.t), keyframe }));
  const movements = data.movements
    .map((movement) => {
      const end = toNumber(movement.to);
      const linger = movement.linger !== undefined ? periodEnd(movement.linger) : Number.NaN;
      return {
        movement,
        start: toNumber(movement.from),
        end,
        path: unwrapPathCentred(movement.path.coordinates),
        linger: finite(linger) && linger > end ? linger : null,
      };
    })
    .filter((m) => finite(m.start) && finite(m.end));

  const points: number[] = [
    ...keyframes.map((k) => k.t),
    ...movements.flatMap((m) => [m.start, m.end]),
  ];
  const sites = data.events.filter((event) => event.kind === 'site');
  const rawEvents = data.events.filter((event) => event.kind !== 'site').map((event) => {
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
    entities.set(entity.id, { entity, joined: finite(joined) ? joined : min, left, spans: blocSpansN(entity) });
  }

  return {
    scale,
    min,
    max,
    span,
    keyframes,
    events,
    sites,
    movements,
    entities,
    chapterNodes,
    maxStrength: Math.max(1, ...data.movements.map((m) => m.strength ?? 0)),
    bounds: dataBounds(data, keyframes, movements),
  };
}

/** Bloc (map colour) of entity `id` at numeric time `t`: `neutral` for unknown ids and outside its joined / left window (lib/bloc.ts `blocAt`). */
export function entityBlocAt(model: TimeModel, id: string, t: number): Bloc {
  const en = model.entities.get(id);
  return en ? blocAtSpans(en.spans, t, en.joined, en.left) : 'neutral';
}

function dataBounds(data: TimeSceneGeoData, keyframes: readonly KeyframeN[], movements: readonly MovementN[]): [number, number, number, number] | null {
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
  for (const { keyframe: kf } of keyframes)
    for (const f of kf.features.features) {
      const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
      for (const poly of polys) for (const ring of poly) ring.forEach(add);
    }
  for (const m of movements) m.path.forEach(add);
  for (const ev of data.events) add(ev.at);
  return Number.isFinite(w) ? [w, s, e, n] : null;
}
