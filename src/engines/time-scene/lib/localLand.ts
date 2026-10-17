/**
 * Island-scale land by date (`topic.basemap.local`, `public/geo/<local>.json`;
 * scripts/geo/lib/local-land.ts). The file is one TopoJSON object `<local>`
 * whose geometries carry `kind`:
 *
 *   mask         the coarse land it replaces, painted in the water colour
 *   land         the island's land, filled and stroked as the coast
 *   coast-today  optional: today's coastline, a dashed reference line
 *
 * `kind: land` features may carry `from` / `to` (`[from, to)`, lib/dated.ts):
 * then each is one whole coast of an era and the GeoStage shows exactly one of
 * them, the era in force at the playhead (`localEraAt`), by re-filtering the
 * fill and edge layers when the era changes. A file whose land has no dates
 * is drawn as it is, unchanged. Pure; unit-tested in
 * tests/time-scene/local-land.test.ts.
 */
import { feature as topoFeature } from 'topojson-client';
import type { Feature, FeatureCollection } from 'geojson';
import type { FilterSpecification } from 'maplibre-gl';
import { datedWindow, hasDate, isDatedAt, type DatedWindow } from './dated';
import type { TimePoint } from './time';

type Topology = Parameters<typeof topoFeature>[0];
type TopoObject = Parameters<typeof topoFeature>[1];

/** One dated coast: its window and its index (the `era` property of its feature). */
export interface LocalEra extends DatedWindow {
  index: number;
}

export interface LocalLand {
  /** The map data: as decoded; with eras, each dated land feature also carries `era` (its index). */
  collection: FeatureCollection;
  /** The dated coasts in file order; null when the land has no dates. */
  eras: LocalEra[] | null;
  /** Whether the file has a `kind: coast-today` line. */
  coastToday: boolean;
}

/** Property that tags a dated land feature with its era index (set at load, read by the layer filter). */
export const ERA_PROP = 'era';

/** Decode object `name` of a `basemap.local` TopoJSON; null when there is no such object. */
export function decodeLocalLand(topo: Topology, name: string): FeatureCollection | null {
  const obj = (topo.objects as Record<string, TopoObject>)[name];
  if (!obj) return null;
  const decoded = topoFeature(topo, obj) as Feature | FeatureCollection;
  return decoded.type === 'FeatureCollection' ? decoded : { type: 'FeatureCollection', features: [decoded] };
}

const kindOf = (f: Feature) => (f.properties as { kind?: unknown } | null)?.kind;

/**
 * The land file as map data plus its eras. Undated land: the collection is
 * returned as is (the same object), `eras` null. Dated land: each land feature
 * is copied with `era: <index>`.
 */
export function parseLocalLand(fc: FeatureCollection): LocalLand {
  const coastToday = fc.features.some((f) => kindOf(f) === 'coast-today');
  const dated = fc.features.some((f) => kindOf(f) === 'land' && hasDate(f.properties as { from?: unknown; to?: unknown }));
  if (!dated) return { collection: fc, eras: null, coastToday };
  const eras: LocalEra[] = [];
  const features = fc.features.map((f) => {
    if (kindOf(f) !== 'land') return f;
    const p = (f.properties ?? {}) as { from?: TimePoint; to?: TimePoint };
    const index = eras.length;
    eras.push({ index, ...datedWindow(p.from, p.to) });
    return { ...f, properties: { ...f.properties, [ERA_PROP]: index } };
  });
  return { collection: { ...fc, features }, eras, coastToday };
}

/**
 * The era shown at `t`: the one whose window holds it; before every era the
 * earliest, after every era (or in a gap, which `pnpm validate` rejects) the
 * latest one that has begun. Always exactly one when there are eras.
 */
export function localEraAt(eras: readonly LocalEra[], t: number): number | null {
  if (!eras.length) return null;
  const hit = eras.find((e) => isDatedAt(e, t));
  if (hit) return hit.index;
  let best: LocalEra | null = null;
  for (const e of eras) if (e.from <= t && (!best || e.from > best.from)) best = e;
  if (best) return best.index;
  return eras.reduce((a, b) => (b.from < a.from ? b : a)).index;
}

/** Filter of the local land fill / edge layers: `kind: land`, and with an era only that era's coast. */
export function localLandFilter(era: number | null): FilterSpecification {
  const land: FilterSpecification = ['==', ['get', 'kind'], 'land'];
  return era === null ? land : ['all', land, ['==', ['get', ERA_PROP], era]];
}
