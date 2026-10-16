/**
 * Dated river lines of a regional plate (`topic.basemap.region.rivers`,
 * `public/geo/<rivers>.json`; schema `riversFile` in ../schema.ts). A course
 * shows while `from <= t < to` (either end open): the GeoStage filters the
 * river layer only when the set of visible ids changes, so scrubbing costs one
 * set comparison per frame. Pure; unit-tested in tests/time-scene/rivers.test.ts.
 */
import { feature as topoFeature } from 'topojson-client';
import type { Feature, FeatureCollection, Position } from 'geojson';
import type { BilingualText } from '../../../i18n';
import type { RiverProperties } from '../schema';
import { mercY } from './territory';
import { toNumber, type TimePoint } from './time';
import type { LngLat } from './geo';

export interface RiverN {
  id: string;
  name: BilingualText;
  /** First year shown (−∞ when open). */
  from: number;
  /** First year no longer shown (+∞ when open). */
  to: number;
  reconstructed: boolean;
  lines: LngLat[][];
  /** Name anchor: `label`, else the middle of the longest line. */
  label: LngLat | null;
  /** Screen angle of the name in degrees (Mercator is conformal: the same at every zoom), kept upright (−90 … 90). */
  angle: number;
}

type Topology = Parameters<typeof topoFeature>[0];
type TopoObject = Parameters<typeof topoFeature>[1];

/** A rivers file as features: GeoJSON as is, TopoJSON's first object decoded. */
export function riverFeatures(raw: unknown): Feature[] {
  if (!raw || typeof raw !== 'object') return [];
  const data = raw as FeatureCollection | Topology;
  if (data.type === 'Topology') {
    const object = Object.values(data.objects)[0] as TopoObject | undefined;
    if (!object) return [];
    const decoded = topoFeature(data, object) as Feature | FeatureCollection;
    return decoded.type === 'FeatureCollection' ? decoded.features : [decoded];
  }
  return data.type === 'FeatureCollection' ? data.features : [];
}

const time = (t: TimePoint | undefined, open: number) => {
  if (t === undefined) return open;
  const n = toNumber(t);
  return Number.isFinite(n) ? n : open;
};

function lineLengthDeg(line: readonly LngLat[]): number {
  let d = 0;
  for (let i = 1; i < line.length; i++) d += Math.hypot(line[i]![0] - line[i - 1]![0], mercY(line[i]![1]) - mercY(line[i - 1]![1]));
  return d;
}

/** Point half-way along a line (by Mercator length) and the screen angle of the stretch around it. */
export function riverLabel(lines: readonly LngLat[][]): { at: LngLat; angle: number } | null {
  let longest: readonly LngLat[] | null = null;
  let max = -1;
  for (const l of lines) {
    const d = lineLengthDeg(l);
    if (l.length >= 2 && d > max) {
      max = d;
      longest = l;
    }
  }
  if (!longest || max <= 0) return null;
  const half = max / 2;
  let run = 0;
  for (let i = 1; i < longest.length; i++) {
    const a = longest[i - 1]!;
    const b = longest[i]!;
    const seg = Math.hypot(b[0] - a[0], mercY(b[1]) - mercY(a[1]));
    if (run + seg >= half && seg > 0) {
      const f = (half - run) / seg;
      const at: LngLat = [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
      // The stretch around the midpoint (a tenth of the line each way) sets the angle; screen y grows downwards.
      const before = pointAt(longest, Math.max(0, half - max / 10));
      const after = pointAt(longest, Math.min(max, half + max / 10));
      let angle = (Math.atan2(-(mercY(after[1]) - mercY(before[1])), after[0] - before[0]) * 180) / Math.PI;
      if (angle > 90) angle -= 180;
      if (angle < -90) angle += 180;
      return { at, angle: Math.round(angle * 10) / 10 || 0 };
    }
    run += seg;
  }
  return { at: longest[longest.length - 1]!, angle: 0 };
}

function pointAt(line: readonly LngLat[], dist: number): LngLat {
  let run = 0;
  for (let i = 1; i < line.length; i++) {
    const a = line[i - 1]!;
    const b = line[i]!;
    const seg = Math.hypot(b[0] - a[0], mercY(b[1]) - mercY(a[1]));
    if (run + seg >= dist && seg > 0) {
      const f = (dist - run) / seg;
      return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
    }
    run += seg;
  }
  return line[line.length - 1]!;
}

const asLines = (g: Feature['geometry']): LngLat[][] => {
  const pos = (p: Position): LngLat => [p[0] ?? 0, p[1] ?? 0];
  if (!g) return [];
  if (g.type === 'LineString') return [g.coordinates.map(pos)];
  if (g.type === 'MultiLineString') return g.coordinates.map((l) => l.map(pos));
  return [];
};

/** Rivers with numeric `[from, to)` windows, label anchors and angles. Features without an id or lines are skipped. */
export function parseRivers(raw: unknown): RiverN[] {
  const out: RiverN[] = [];
  for (const f of riverFeatures(raw)) {
    const p = (f.properties ?? {}) as Partial<RiverProperties>;
    const lines = asLines(f.geometry).filter((l) => l.length >= 2);
    if (typeof p.id !== 'string' || lines.length === 0) continue;
    const pinned = Array.isArray(p.label) ? ([p.label[0], p.label[1]] as LngLat) : null;
    const auto = riverLabel(lines);
    out.push({
      id: p.id,
      name: { en: p.name?.en ?? p.id, zh: p.name?.zh ?? '' },
      from: time(p.from, Number.NEGATIVE_INFINITY),
      to: time(p.to, Number.POSITIVE_INFINITY),
      reconstructed: p.reconstructed === true,
      lines,
      label: pinned ?? auto?.at ?? null,
      angle: auto?.angle ?? 0,
    });
  }
  return out;
}

/** Ids of the courses that exist at `t` (`from <= t < to`), in data order. */
export function riversAt(rivers: readonly RiverN[], t: number): string[] {
  return rivers.filter((r) => r.from <= t && t < r.to).map((r) => r.id);
}

/** The rivers as map features (`id`, `rec` for the dashed reconstructed courses). */
export function riverCollection(rivers: readonly RiverN[]): FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: rivers.map((r) => ({
      type: 'Feature',
      properties: { id: r.id, rec: r.reconstructed },
      geometry: { type: 'MultiLineString', coordinates: r.lines },
    })),
  };
}
