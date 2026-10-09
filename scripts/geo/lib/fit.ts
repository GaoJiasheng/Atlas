/**
 * Georeferencing fit: SVG user units -> [lng, lat].
 *
 * A model = a map projection (equirectangular, Mercator, Lambert azimuthal
 * equal-area, Lambert conformal conic) + a least-squares transform from SVG
 * units to projected coordinates (affine, 6 parameters; or a 2nd-order
 * polynomial, 12 parameters, for maps whose projection is unknown). Residuals
 * are great-circle distances in km at the control points; the leave-one-out
 * RMS (each point predicted by a fit without it) is the honest error figure
 * and is what `auto` minimises.
 */
import { haversineKm } from './common';
import type { ControlPoint } from './manifest';

const RAD = Math.PI / 180;

export interface Projection {
  name: string;
  forward(lng: number, lat: number): [number, number];
  inverse(x: number, y: number): [number, number];
}

export function equirect(): Projection {
  return { name: 'equirectangular', forward: (l, p) => [l, p], inverse: (x, y) => [x, y] };
}

export function mercator(): Projection {
  return {
    name: 'mercator',
    forward: (l, p) => [l * RAD, Math.log(Math.tan(Math.PI / 4 + (p * RAD) / 2))],
    inverse: (x, y) => [x / RAD, (2 * Math.atan(Math.exp(y)) - Math.PI / 2) / RAD],
  };
}

export function laea(lon0: number, lat0: number): Projection {
  const l0 = lon0 * RAD;
  const p0 = lat0 * RAD;
  return {
    name: `laea(${lon0.toFixed(1)},${lat0.toFixed(1)})`,
    forward(l, p) {
      const lam = l * RAD - l0;
      const phi = p * RAD;
      const k = Math.sqrt(2 / (1 + Math.sin(p0) * Math.sin(phi) + Math.cos(p0) * Math.cos(phi) * Math.cos(lam)));
      return [k * Math.cos(phi) * Math.sin(lam), k * (Math.cos(p0) * Math.sin(phi) - Math.sin(p0) * Math.cos(phi) * Math.cos(lam))];
    },
    inverse(x, y) {
      const rho = Math.hypot(x, y);
      if (rho === 0) return [lon0, lat0];
      const c = 2 * Math.asin(Math.min(1, rho / 2));
      const phi = Math.asin(Math.cos(c) * Math.sin(p0) + (y * Math.sin(c) * Math.cos(p0)) / rho);
      const lam = Math.atan2(x * Math.sin(c), rho * Math.cos(p0) * Math.cos(c) - y * Math.sin(p0) * Math.sin(c));
      return [(l0 + lam) / RAD, phi / RAD];
    },
  };
}

export function lcc(lon0: number, lat0: number, lat1: number, lat2: number): Projection {
  const l0 = lon0 * RAD;
  const p1 = lat1 * RAD;
  const p2 = lat2 * RAD;
  const n =
    Math.abs(p1 - p2) < 1e-9
      ? Math.sin(p1)
      : Math.log(Math.cos(p1) / Math.cos(p2)) / Math.log(Math.tan(Math.PI / 4 + p2 / 2) / Math.tan(Math.PI / 4 + p1 / 2));
  const F = (Math.cos(p1) * Math.tan(Math.PI / 4 + p1 / 2) ** n) / n;
  const rho = (p: number) => F / Math.tan(Math.PI / 4 + p / 2) ** n;
  const rho0 = rho(lat0 * RAD);
  return {
    name: `lcc(${lon0.toFixed(1)},${lat1.toFixed(1)},${lat2.toFixed(1)})`,
    forward(l, p) {
      const r = rho(p * RAD);
      const th = n * (l * RAD - l0);
      return [r * Math.sin(th), rho0 - r * Math.cos(th)];
    },
    inverse(x, y) {
      const dy = rho0 - y;
      const r = Math.sign(n) * Math.hypot(x, dy);
      const th = Math.atan2(Math.sign(n) * x, Math.sign(n) * dy);
      const phi = 2 * Math.atan((F / r) ** (1 / n)) - Math.PI / 2;
      return [(l0 + th / n) / RAD, phi / RAD];
    },
  };
}

/* ------------------------------------------------------------------ */
/* Least squares                                                       */
/* ------------------------------------------------------------------ */

function solve(A: number[][], b: number[]): number[] {
  const n = b.length;
  const M = A.map((row, i) => [...row, b[i]!]);
  for (let c = 0; c < n; c++) {
    let piv = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r]![c]!) > Math.abs(M[piv]![c]!)) piv = r;
    [M[c], M[piv]] = [M[piv]!, M[c]!];
    const d = M[c]![c]!;
    if (Math.abs(d) < 1e-300) throw new Error('singular fit (control points are collinear or too few)');
    for (let r = 0; r < n; r++) {
      if (r === c) continue;
      const f = M[r]![c]! / d;
      for (let k = c; k <= n; k++) M[r]![k]! -= f * M[c]![k]!;
    }
  }
  return M.map((row, i) => row[n]! / row[i]!);
}

type Basis = (u: number, v: number) => number[];
const AFFINE: Basis = (u, v) => [1, u, v];
const POLY2: Basis = (u, v) => [1, u, v, u * u, u * v, v * v];

function lsq(basis: Basis, uv: [number, number][], target: number[]): number[] {
  const k = basis(0, 0).length;
  const AtA = Array.from({ length: k }, () => new Array<number>(k).fill(0));
  const Atb = new Array<number>(k).fill(0);
  uv.forEach(([u, v], i) => {
    const row = basis(u, v);
    for (let a = 0; a < k; a++) {
      Atb[a]! += row[a]! * target[i]!;
      for (let b = 0; b < k; b++) AtA[a]![b]! += row[a]! * row[b]!;
    }
  });
  return solve(AtA, Atb);
}

export interface Model {
  name: string;
  /** SVG units -> [lng, lat]. */
  toLngLat(u: number, v: number): [number, number];
}

/** Normalise SVG coordinates so the polynomial terms stay well conditioned. */
function normaliser(cps: ControlPoint[]) {
  const us = cps.map((c) => c.svg[0]);
  const vs = cps.map((c) => c.svg[1]);
  const cu = (Math.min(...us) + Math.max(...us)) / 2;
  const cv = (Math.min(...vs) + Math.max(...vs)) / 2;
  const s = Math.max(Math.max(...us) - Math.min(...us), Math.max(...vs) - Math.min(...vs)) / 2 || 1;
  return (u: number, v: number): [number, number] => [(u - cu) / s, (v - cv) / s];
}

export function fitModel(proj: Projection, kind: 'affine' | 'poly2', cps: ControlPoint[]): Model {
  const basis = kind === 'affine' ? AFFINE : POLY2;
  const norm = normaliser(cps);
  const uv = cps.map((c) => norm(c.svg[0], c.svg[1]));
  const xy = cps.map((c) => proj.forward(c.lnglat[0], c.lnglat[1]));
  const cx = lsq(basis, uv, xy.map((p) => p[0]));
  const cy = lsq(basis, uv, xy.map((p) => p[1]));
  return {
    name: `${proj.name}+${kind}`,
    toLngLat(u, v) {
      const row = basis(...norm(u, v));
      let x = 0;
      let y = 0;
      row.forEach((r, i) => {
        x += r * cx[i]!;
        y += r * cy[i]!;
      });
      return proj.inverse(x, y);
    },
  };
}

export interface FitReport {
  model: string;
  rmsKm: number;
  maxKm: number;
  looRmsKm: number;
  looMaxKm: number;
  points: { name: string; residualKm: number; looKm: number }[];
}

export function evaluate(proj: Projection, kind: 'affine' | 'poly2', cps: ControlPoint[]): { model: Model; report: FitReport } {
  const model = fitModel(proj, kind, cps);
  const points = cps.map((c, i) => {
    const res = haversineKm(model.toLngLat(c.svg[0], c.svg[1]), c.lnglat);
    let loo = NaN;
    const rest = cps.filter((_, j) => j !== i);
    if (rest.length >= (kind === 'affine' ? 4 : 8)) {
      const m = fitModel(proj, kind, rest);
      loo = haversineKm(m.toLngLat(c.svg[0], c.svg[1]), c.lnglat);
    }
    return { name: c.name, residualKm: res, looKm: loo };
  });
  const rms = (a: number[]) => Math.sqrt(a.reduce((s, x) => s + x * x, 0) / Math.max(1, a.length));
  const loo = points.map((p) => p.looKm).filter((x) => Number.isFinite(x));
  return {
    model,
    report: {
      model: model.name,
      rmsKm: rms(points.map((p) => p.residualKm)),
      maxKm: Math.max(...points.map((p) => p.residualKm)),
      looRmsKm: loo.length ? rms(loo) : NaN,
      looMaxKm: loo.length ? Math.max(...loo) : NaN,
      points,
    },
  };
}

/**
 * Candidate models: `auto` (all of them) or one family, e.g. `laea+affine`,
 * `lcc+poly2`, `equirectangular+affine`. Projections are centred on the
 * control points.
 */
export function candidates(spec: string, cps: ControlPoint[]): { proj: Projection; kind: 'affine' | 'poly2' }[] {
  const lngs = cps.map((c) => c.lnglat[0]);
  const lats = cps.map((c) => c.lnglat[1]);
  const lon0 = (Math.min(...lngs) + Math.max(...lngs)) / 2;
  const lat0 = (Math.min(...lats) + Math.max(...lats)) / 2;
  const span = Math.max(...lats) - Math.min(...lats);
  const p1 = Math.min(...lats) + span / 6;
  const p2 = Math.max(...lats) - span / 6;
  const all: { proj: Projection; kind: 'affine' | 'poly2' }[] = [
    { proj: equirect(), kind: 'affine' },
    { proj: mercator(), kind: 'affine' },
    { proj: laea(lon0, lat0), kind: 'affine' },
    { proj: lcc(lon0, lat0, p1, p2), kind: 'affine' },
  ];
  if (cps.length >= 9) {
    all.push({ proj: equirect(), kind: 'poly2' }, { proj: laea(lon0, lat0), kind: 'poly2' }, { proj: lcc(lon0, lat0, p1, p2), kind: 'poly2' });
  }
  if (spec === 'auto') return all;
  const hit = all.filter((c) => `${c.proj.name.split('(')[0]}+${c.kind}` === spec);
  if (!hit.length) throw new Error(`unknown projection model "${spec}"`);
  return hit;
}
