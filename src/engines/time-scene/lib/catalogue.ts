/** Client-safe catalogue joins, visibility, search and hit ordering. */
import type { Feature, FeatureCollection } from 'geojson';
import type { DatedLayerDef } from '../../../content/schema/topic';
import type { CatalogueEntry, CatalogueIndex } from '../catalogueSchema';
export interface CatalogueLayer {
  id: string;
  status: 'loading' | 'ready' | 'error';
  def: DatedLayerDef;
  entries: CatalogueEntry[];
  features: FeatureCollection;
}
export const catalogueVisible = (def: DatedLayerDef, feature: Feature, t: number) => def.temporal?.mode === 'reference' || (Number(feature.properties?.f) <= t && (feature.properties?.u === undefined || Number(feature.properties.u) > t));
export function visibleCatalogue(layer: CatalogueLayer, t: number): CatalogueEntry[] {
  if (layer.status !== 'ready') return [];
  const ids = new Set(layer.features.features.filter((f) => catalogueVisible(layer.def, f, t)).map((f) => f.properties?.id));
  return layer.entries.filter((entry) => ids.has(entry.id));
}
export function catalogueItems(layers: readonly CatalogueLayer[], enabled: readonly string[], t: number, index?: CatalogueIndex): CatalogueEntry[] {
  return (index ?? []).flatMap((group) => {
    const layer = layers.find((l) => l.id === group.layerId && enabled.includes(l.id));
    return layer ? visibleCatalogue(layer, t).filter((entry) => !group.ids || group.ids.includes(entry.id)) : [];
  }).sort((a, b) => a.id.localeCompare(b.id));
}
export function cataloguePage(entries: readonly CatalogueEntry[], query: string, page: number) {
  const q = query.trim().toLocaleLowerCase();
  const found = entries.filter((e) => `${e.id} ${e.title.en} ${e.title.zh}`.toLocaleLowerCase().includes(q));
  return { total: found.length, rows: found.slice(Math.max(0, page) * 50, Math.max(0, page) * 50 + 50) };
}
export const magnitudeRadius = (mag: number) => 2 + 6 * Math.max(0, Math.min(1, (mag - 6) / 3.5));
export function nearestCatalogue(candidates: readonly { id: string; distance: number }[]): string | null {
  return [...candidates].filter((c) => c.distance <= 22).sort((a, b) => a.distance - b.distance || a.id.localeCompare(b.id))[0]?.id ?? null;
}

/** Resolve a deferred URL request against the live selection, never its former chapter. */
export function resolveCataloguePick(requested: string, currentPick: string | null, definitions: readonly DatedLayerDef[], enabled: readonly string[], loaded: readonly CatalogueLayer[], t: number): 'cancelled' | 'waiting' | 'invalid' | { layer: CatalogueLayer; entry: CatalogueEntry } {
  if (requested !== currentPick) return 'cancelled';
  const active = definitions.filter((def) => def.catalogue && enabled.includes(def.id));
  for (const def of active) {
    const layer = loaded.find((layer) => layer.id === def.id);
    const entry = layer && visibleCatalogue(layer, t).find((entry) => entry.id === requested);
    if (entry) return { layer, entry };
  }
  const known = loaded.find((layer) => layer.entries.some((entry) => entry.id === requested));
  if (known && !enabled.includes(known.id)) return 'invalid';
  return active.some((def) => !loaded.some((layer) => layer.id === def.id && layer.status !== 'loading')) ? 'waiting' : 'invalid';
}

/** Exact screen distance after the 44px query box, including polygon holes/corners. */
export function catalogueHitDistance(geometry: Feature['geometry'], point: { x: number; y: number }, project: (position: number[]) => { x: number; y: number }): number {
  const distance = (line: number[][]) => {
    let best = Infinity;
    for (let i = 1; i < line.length; i++) {
      const a = project(line[i - 1]!), b = project(line[i]!);
      const dx = b.x - a.x, dy = b.y - a.y;
      const t = Math.max(0, Math.min(1, ((point.x - a.x) * dx + (point.y - a.y) * dy) / (dx * dx + dy * dy || 1)));
      best = Math.min(best, Math.hypot(a.x + t * dx - point.x, a.y + t * dy - point.y));
    }
    return best;
  };
  const contains = (ring: number[][]) => {
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const a = project(ring[i]!), b = project(ring[j]!);
      if ((a.y > point.y) !== (b.y > point.y) && point.x < (b.x - a.x) * (point.y - a.y) / (b.y - a.y) + a.x) inside = !inside;
    }
    return inside;
  };
  if (geometry.type === 'Point') { const p = project(geometry.coordinates); return Math.hypot(p.x - point.x, p.y - point.y); }
  if (geometry.type === 'LineString') return distance(geometry.coordinates);
  if (geometry.type === 'MultiLineString') return Math.min(...geometry.coordinates.map(distance));
  const polygonDistance = (rings: number[][][]) => rings[0] && contains(rings[0]) && !rings.slice(1).some(contains) ? 0 : Math.min(...rings.map(distance));
  if (geometry.type === 'Polygon') return polygonDistance(geometry.coordinates);
  if (geometry.type === 'MultiPolygon') return Math.min(...geometry.coordinates.map(polygonDistance));
  return Infinity;
}
