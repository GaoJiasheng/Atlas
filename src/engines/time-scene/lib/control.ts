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
import { feature, mesh } from 'topojson-client';
import type { Feature, FeatureCollection, Geometry, MultiLineString, Position } from 'geojson';
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

/** A decoded keyframe: its control areas, and (TopoJSON shape only) the frontier between holders. */
export interface DecodedKeyframe extends ControlKeyframe {
  /**
   * Only the arcs shared by two features of **different holders**: the inland
   * frontiers, never a coastline (an arc with a single feature on it is a
   * coast) and never the seam between two features of one holder. Absent for
   * plain GeoJSON, where nothing tells a coast from a border: the renderer
   * outlines the polygons instead.
   */
  frontier?: MultiLineString;
}

/**
 * The frontier of one named object: `mesh` of the arcs two features of
 * different holders share. `null` when there is none.
 */
export function frontierOf(topology: unknown, name: string): MultiLineString | null {
  const topo = topology as Topology;
  const object = (topo.objects as Record<string, TopoObject | undefined>)[name];
  if (!object) throw new Error(`control topology has no object "${name}"`);
  const holder = (g: unknown) => (g as { properties?: { holder?: unknown } }).properties?.holder;
  const lines = mesh(topo, object as Parameters<typeof mesh>[1], (a, b) => a !== b && holder(a) !== holder(b));
  return lines.coordinates.length ? lines : null;
}

/**
 * `[{ t, features, frontier? }]` for either shape of `control.json` (the plain
 * shape passes through unchanged). The frontier of every keyframe is computed
 * here, once, with the keyframe; the model keeps it.
 */
export function decodeControl(control: ControlFile): DecodedKeyframe[] {
  if (!('topology' in control)) return control.keyframes;
  return control.keyframes.map((kf) => {
    const frontier = frontierOf(control.topology, kf.object);
    return {
      t: kf.t,
      features: decodeTopologyObject(control.topology, kf.object) as ControlKeyframe['features'],
      ...(frontier ? { frontier } : {}),
    };
  });
}
