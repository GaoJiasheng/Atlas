/**
 * Control-area keyframes, wire shape -> per-keyframe FeatureCollections.
 *
 * `control.json` is either
 *   { keyframes: [{ t, features: FeatureCollection }] }                 plain GeoJSON
 *   { topology: Topology, keyframes: [{ t, object: "<objects key>" }] } one shared TopoJSON
 * The second shape lets keyframes share arcs (coastlines and borders that do
 * not change between keyframes are stored once) and uses quantised, delta-coded
 * coordinates, so a dozen full-theatre keyframes stay small. The engine decodes
 * it once when the model is built; everything downstream (frames, areas,
 * rendering) only ever sees FeatureCollections. Pure and client-safe (schema
 * types only, no zod at runtime).
 */
import { feature } from 'topojson-client';
import type { Feature, FeatureCollection, Geometry, Position } from 'geojson';
import type { ControlFile, ControlKeyframe } from '../schema';

type Topology = Parameters<typeof feature>[0];
type TopoObject = Parameters<typeof feature>[1];

function signedArea(ring: readonly Position[]): number {
  let a = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) a += ((ring[j]?.[0] ?? 0) - (ring[i]?.[0] ?? 0)) * ((ring[j]?.[1] ?? 0) + (ring[i]?.[1] ?? 0));
  return a / 2;
}

/**
 * RFC 7946 winding: outer ring counter-clockwise, holes clockwise. TopoJSON
 * (as written by mapshaper / d3) winds the other way, and MapLibre tells holes
 * from outer rings by winding.
 */
export function rewindPolygon(poly: Position[][]): Position[][] {
  return poly.map((ring, i) => {
    const ccw = signedArea(ring) > 0;
    return (i === 0) === ccw ? ring : ring.slice().reverse();
  });
}

function rewindGeometry(g: Geometry): Geometry {
  if (g.type === 'Polygon') return { type: 'Polygon', coordinates: rewindPolygon(g.coordinates) };
  if (g.type === 'MultiPolygon') return { type: 'MultiPolygon', coordinates: g.coordinates.map(rewindPolygon) };
  return g;
}

/** Decode one named object of a topology into a FeatureCollection (null geometries dropped, GeoJSON winding). */
export function decodeTopologyObject(topology: unknown, name: string): FeatureCollection {
  const topo = topology as Topology;
  const object = (topo.objects as Record<string, TopoObject | undefined>)[name];
  if (!object) throw new Error(`control topology has no object "${name}"`);
  const decoded = feature(topo, object) as Feature | FeatureCollection;
  const features = decoded.type === 'FeatureCollection' ? decoded.features : [decoded];
  return {
    type: 'FeatureCollection',
    features: features
      .filter((f) => f.geometry)
      .map((f) => ({ type: 'Feature', properties: f.properties ?? {}, geometry: rewindGeometry(f.geometry) })),
  };
}

/** `[{ t, features }]` for either shape of `control.json` (the plain shape passes through unchanged). */
export function decodeControl(control: ControlFile): ControlKeyframe[] {
  if (!('topology' in control)) return control.keyframes;
  return control.keyframes.map((kf) => ({ t: kf.t, features: decodeTopologyObject(control.topology, kf.object) as ControlKeyframe['features'] }));
}
