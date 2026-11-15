/**
 * Plate-bound geometry for the rotation map (docs/72 E-CD2): today's polygons, carried to any age
 * with each feature's plate rotation. Pure functions; no MapLibre.
 *
 * Today's vertices are kept as unit vectors. At an age the features valid then (`to <= t <= from`)
 * are rotated (one 3×3 matrix per plate), converted back to lon/lat, and each ring is unwrapped
 * (no jump over 180° between neighbours) so the map's tiler splits it across the antimeridian
 * itself. A ring that goes once round a pole is closed along that pole.
 */
import type { Feature, FeatureCollection, MultiPolygon, Position } from 'geojson';
import type { RotationModel } from './plateRotation';

export interface PlateFeatureProps { plateId: number; from: number; to: number }

export interface PreparedLayer {
  /** 3 floats per vertex. */
  xyz: Float64Array;
  features: { props: PlateFeatureProps & Record<string, unknown>; polygons: { start: number; end: number }[][] }[];
  vertices: number;
}

const RAD = Math.PI / 180;

export function prepareLayer(fc: FeatureCollection): PreparedLayer {
  let count = 0;
  const rings = (f: Feature) => {
    const g = f.geometry;
    return g.type === 'Polygon' ? [g.coordinates] : g.type === 'MultiPolygon' ? g.coordinates : [];
  };
  for (const f of fc.features) for (const poly of rings(f)) for (const ring of poly) count += ring.length - 1;
  const xyz = new Float64Array(count * 3);
  let at = 0;
  const features: PreparedLayer['features'] = [];
  for (const f of fc.features) {
    const p = f.properties as PlateFeatureProps & Record<string, unknown>;
    const polygons = rings(f).map((poly) => poly.map((ring) => {
      const start = at;
      for (let i = 0; i < ring.length - 1; i++) {
        const [lon, lat] = ring[i]!;
        const cl = Math.cos(lat! * RAD);
        xyz[at * 3] = cl * Math.cos(lon! * RAD);
        xyz[at * 3 + 1] = cl * Math.sin(lon! * RAD);
        xyz[at * 3 + 2] = Math.sin(lat! * RAD);
        at++;
      }
      return { start, end: at };
    }));
    features.push({ props: p, polygons });
  }
  return { xyz, features, vertices: count };
}

/** True when the feature exists at `ma` (its valid time holds the age). */
export const validAt = (p: PlateFeatureProps, ma: number) => p.to <= ma && ma <= p.from;

/** Unwrap a ring of [lon, lat] in place; returns the net longitude turn (±360 when it circles a pole). */
export function unwrapRing(ring: Position[]): number {
  for (let i = 1; i < ring.length; i++) {
    const prev = ring[i - 1]![0]!;
    let lon = ring[i]![0]!;
    while (lon - prev > 180) lon -= 360;
    while (lon - prev < -180) lon += 360;
    ring[i]![0] = lon;
  }
  const first = ring[0]![0]!;
  const last = ring[ring.length - 1]![0]!;
  let closing = first - last;
  while (closing > 180) closing -= 360;
  while (closing < -180) closing += 360;
  return Math.round((last + closing - first) / 360) * 360;
}

/**
 * A closed lon/lat ring for one rotated ring: unwrapped, shifted so its first point lies in
 * [-180, 180), and closed along the enclosed pole when it circles one.
 */
export function closeRing(ring: Position[], meanZ: number): Position[] {
  const turn = unwrapRing(ring);
  const shift = Math.floor((ring[0]![0]! + 180) / 360) * 360;
  if (shift) for (const p of ring) p[0]! -= shift;
  if (turn !== 0) {
    // Go on past the closing hop to the first point one turn round, up its meridian to the pole,
    // back along the pole, and down the first point's own meridian.
    const pole = meanZ >= 0 ? 90 : -90;
    const [lon0, lat0] = ring[0]!;
    ring.push([lon0! + turn, lat0!]);
    // Along the pole in quarter turns, so no step spans more than 180° of longitude.
    for (let k = 0; k <= 4; k++) ring.push([lon0! + turn - (turn * k) / 4, pole]);
  }
  ring.push([ring[0]![0]!, ring[0]![1]!]);
  return ring;
}

export interface RotatedFrame { collection: FeatureCollection<MultiPolygon>; features: number; vertices: number }

/** Rotate a prepared layer to `ma`. `extra` adds properties (e.g. `kind`) to every feature. */
export function rotateLayer(layer: PreparedLayer, model: RotationModel, ma: number, extra: Record<string, unknown> = {}): RotatedFrame {
  const m = new Float64Array(9);
  const matrices = new Map<number, Float64Array | null>();
  const out: Feature<MultiPolygon>[] = [];
  let vertices = 0;
  const { xyz } = layer;
  for (const f of layer.features) {
    if (!validAt(f.props, ma)) continue;
    let mat = matrices.get(f.props.plateId);
    if (mat === undefined) {
      mat = model.matrix(f.props.plateId, ma, m) ? Float64Array.from(m) : null;
      matrices.set(f.props.plateId, mat);
    }
    if (!mat) continue;
    const polygons: Position[][][] = [];
    for (const poly of f.polygons) {
      const rings: Position[][] = [];
      for (const { start, end } of poly) {
        const ring: Position[] = new Array(end - start);
        let z = 0;
        for (let i = start; i < end; i++) {
          const x = xyz[i * 3]!, y = xyz[i * 3 + 1]!, w = xyz[i * 3 + 2]!;
          const rx = mat[0]! * x + mat[1]! * y + mat[2]! * w;
          const ry = mat[3]! * x + mat[4]! * y + mat[5]! * w;
          const rz = mat[6]! * x + mat[7]! * y + mat[8]! * w;
          z += rz;
          ring[i - start] = [Math.atan2(ry, rx) / RAD, Math.asin(rz > 1 ? 1 : rz < -1 ? -1 : rz) / RAD];
        }
        vertices += end - start;
        rings.push(closeRing(ring, z / (end - start)));
      }
      // Holes follow their outer ring into the same 360° window.
      const base = rings[0]![0]![0]!;
      for (let k = 1; k < rings.length; k++) {
        const d = Math.round((rings[k]![0]![0]! - base) / 360) * 360;
        if (d) for (const p of rings[k]!) p[0]! -= d;
      }
      polygons.push(rings);
    }
    out.push({ type: 'Feature', properties: { ...f.props, ...extra }, geometry: { type: 'MultiPolygon', coordinates: polygons } });
  }
  return { collection: { type: 'FeatureCollection', features: out }, features: out.length, vertices };
}
