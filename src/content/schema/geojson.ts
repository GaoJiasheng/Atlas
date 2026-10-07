/**
 * Minimal GeoJSON (RFC 7946) schemas for engine data. Only the geometry types
 * Atlas engines consume are modelled; positions are `[lng, lat]` (an optional
 * third altitude value is tolerated and ignored).
 */
import { z } from 'zod';

export const position = z
  .array(z.number())
  .min(2)
  .max(3)
  .refine(([lng = NaN, lat = NaN]) => lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90, {
    message: 'position must be [lng, lat] within -180..180, -90..90',
  });

/** A closed ring: >= 4 positions, first == last. */
export const linearRing = z
  .array(position)
  .min(4)
  .refine(
    (ring) => {
      const a = ring[0];
      const b = ring[ring.length - 1];
      return !!a && !!b && a[0] === b[0] && a[1] === b[1];
    },
    { message: 'polygon ring must be closed (first position == last position)' },
  );

export const lineString = z
  .object({ type: z.literal('LineString'), coordinates: z.array(position).min(2) })
  .strict();

export const polygon = z
  .object({ type: z.literal('Polygon'), coordinates: z.array(linearRing).min(1) })
  .strict();

export const multiPolygon = z
  .object({ type: z.literal('MultiPolygon'), coordinates: z.array(z.array(linearRing).min(1)).min(1) })
  .strict();

export const areaGeometry = z.discriminatedUnion('type', [polygon, multiPolygon]);

/** Feature with a typed geometry and typed (but passthrough) properties. */
export function feature<G extends z.ZodTypeAny, P extends z.ZodTypeAny>(geometry: G, properties: P) {
  return z.object({
    type: z.literal('Feature'),
    id: z.union([z.string(), z.number()]).optional(),
    geometry,
    properties,
  });
}

export function featureCollection<F extends z.ZodTypeAny>(featureSchema: F) {
  return z.object({
    type: z.literal('FeatureCollection'),
    features: z.array(featureSchema),
  });
}
