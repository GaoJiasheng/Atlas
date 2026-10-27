/** Build-only catalogue schemas. Geometry remains in the static GPU source. */
import { z } from 'zod';
import { bilingual, kebabId, lngLat } from '../../content/schema/common';
import { sourceId } from '../../content/schema/sources';
import type { Feature, Position } from 'geojson';
const catalogueText = bilingual.refine((value) => !!value.zh.trim(), 'catalogue text requires non-empty Chinese').refine((value) => !!value.en.trim(), 'catalogue text requires non-empty English');
export const catalogueIndex = z.array(z.object({ layerId: kebabId, ids: z.array(kebabId).optional() }).strict());
export const catalogueEntry = z.object({
  id: kebabId.max(128), title: catalogueText, summary: catalogueText, at: lngLat,
  sources: z.array(sourceId).min(1),
  rows: z.array(z.object({ key: kebabId, label: catalogueText, value: z.union([z.number().finite(), catalogueText, z.null()]), unit: catalogueText.optional(), sources: z.array(sourceId).optional() }).strict()),
}).strict().superRefine((entry, ctx) => {
  const seen = new Set<string>();
  entry.rows.forEach((row, i) => {
    if (seen.has(row.key)) ctx.addIssue({ code: 'custom', path: ['rows', i, 'key'], message: `${entry.id}: duplicate row key ${row.key}` });
    seen.add(row.key);
  });
});
export const catalogueFile = z.object({ entries: z.array(catalogueEntry) }).strict();
export type CatalogueEntry = z.output<typeof catalogueEntry>;
export type CatalogueIndex = z.output<typeof catalogueIndex>;

/** Anchor validation in local metres; lines tolerate only quantization error (250 m). */
export function catalogueAnchorValid(at: readonly number[], feature: Feature): boolean {
  const g = feature.geometry;
  if (g.type === 'Point') return at[0] === g.coordinates[0] && at[1] === g.coordinates[1];
  const lineDistance = (line: Position[]) => {
    const scale = Math.cos(at[1]! * Math.PI / 180);
    let best = Infinity;
    for (let i = 1; i < line.length; i++) {
      const a = line[i - 1]!, b = line[i]!;
      const wrap = (x: number) => ((x - at[0]! + 540) % 360) - 180;
      const ax = wrap(a[0]!) * scale, ay = a[1]! - at[1]!;
      const bx = wrap(b[0]!) * scale, by = b[1]! - at[1]!;
      const dx = bx - ax, dy = by - ay;
      const t = Math.max(0, Math.min(1, -(ax * dx + ay * dy) / (dx * dx + dy * dy || 1)));
      best = Math.min(best, Math.hypot(ax + t * dx, ay + t * dy) * 111195);
    }
    return best;
  };
  if (g.type === 'LineString') return lineDistance(g.coordinates) <= 250;
  if (g.type === 'MultiLineString') return g.coordinates.some((line) => lineDistance(line) <= 250);
  const ringContains = (ring: Position[]) => {
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const a = ring[i]!, b = ring[j]!;
      if ((a[1]! > at[1]!) !== (b[1]! > at[1]!) && at[0]! < (b[0]! - a[0]!) * (at[1]! - a[1]!) / (b[1]! - a[1]!) + a[0]!) inside = !inside;
    }
    return inside;
  };
  const polygonContains = (rings: Position[][]) => !!rings[0] && ringContains(rings[0]) && !rings.slice(1).some(ringContains);
  return g.type === 'Polygon' ? polygonContains(g.coordinates) : g.type === 'MultiPolygon' && g.coordinates.some(polygonContains);
}
