/**
 * Dated GPU layers: numeric `f` / `u` share dated.ts's `[from, to)` windows.
 * Index once at load; counts and boundary signatures need only binary searches,
 * even for tens of thousands of features. The map retains its static source.
 */
import type { FeatureCollection } from 'geojson';
import type { ExpressionSpecification } from 'maplibre-gl';
import { numericDatedWindow } from './dated';
import { decodeLocalLand } from './localLand';

export interface DatedLayerIndex {
  starts: number[];
  ends: number[];
  /** A point stops being new at the earlier of `f + 1` and `u`. */
  recentEnds: number[];
  total: number;
}

export interface DatedLayerLoaded {
  id: string;
  index: DatedLayerIndex;
}

/** Decode the named TopoJSON object (the same static object convention as local land). */
export const decodeDatedLayer = decodeLocalLand;

/** Index numeric dates independently of input order; no feature work is needed during scrubbing. */
export function indexDatedLayer(collection: FeatureCollection): DatedLayerIndex {
  const starts: number[] = [];
  const ends: number[] = [];
  const recentEnds: number[] = [];
  for (const feature of collection.features) {
    const p = feature.properties as { f: number; u?: number };
    const window = numericDatedWindow(p.f, p.u);
    starts.push(window.from);
    ends.push(window.to);
    recentEnds.push(Math.min(window.to, window.from + 1));
  }
  const ascending = (a: number, b: number) => a - b;
  starts.sort(ascending);
  ends.sort(ascending);
  recentEnds.sort(ascending);
  return { starts, ends, recentEnds, total: starts.length };
}

/** Number of sorted values at or before `t` (upper bound, including equal dates). */
function upperBound(values: readonly number[], t: number): number {
  let lo = 0;
  let hi = values.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (values[mid]! <= t) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

/** Counts and change signatures, including replacement at equal count and the `(t−1, t]` point window. */
export function datedLayerState(index: DatedLayerIndex, t: number) {
  const started = upperBound(index.starts, t);
  const ended = upperBound(index.ends, t);
  const recentEnded = upperBound(index.recentEnds, t);
  return {
    visible: started - ended,
    recent: started - recentEnded,
    signature: `${started}:${ended}`,
    recentSignature: `${started}:${recentEnded}`,
  };
}

/** Numeric GPU filter: no list of 10,000 ids, and `u` is exclusive. */
export function datedLayerFilter(t: number, recent = false): ExpressionSpecification {
  const visible: ExpressionSpecification = ['all', ['<=', ['get', 'f'], t], ['>', ['coalesce', ['get', 'u'], 1e9], t]];
  return recent ? ['all', visible, ['>', ['get', 'f'], t - 1]] : visible;
}
