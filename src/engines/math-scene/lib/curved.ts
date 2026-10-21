/**
 * The nets of a cylinder and a cone (docs/39 §3.3, model A8): a rectangle
 * and two circles, a sector (like an open fan) and a circle, rolled up part
 * way. The circle on the ground stays put; the curved face turns up about
 * the point where it touches that circle and rolls round as it goes: a
 * cylinder's rectangle onto a cylinder of radius r / t (t = 0 flat, t = 1
 * round), a cone's sector onto a cone whose opened-out angle goes from a
 * whole turn down to the sector's. The other circle turns about the edge it
 * hangs on. A curved face cut too short or too long (`wrap` ≠ 1) does not
 * close: the gap is drawn. A triangle for a cone's curved face is a wrong
 * net, drawn flat. The curved face is cut into 48 strips, a circle drawn
 * with 64 sides, so the painter's order of `lib/project.ts` draws it.
 * Pure: no DOM.
 */
import type { CurvedNetSpec, SolidSpec } from '../schema';
import { add, cross, dot, norm, scale, slant, sub, unit, type Vec3 } from './solid';

export const STRIPS = 48;
export const CIRCLE_SIDES = 64;

export type CurvedFace = 'bottom' | 'top' | 'base' | 'side';

export interface CurvedPiece {
  face: CurvedFace;
  pts: Vec3[];
  /** Edges drawn in ink (`i`: from pts[i] to pts[i + 1]): the face's own outline, not the cuts between strips. */
  outline: number[];
  /** A strip of the curved face: its place in the row (silhouette lines are drawn between strips that face different ways). */
  strip?: number;
  /** The side that is outside the folded solid (flat: the ground side). */
  outside: Vec3;
}

type Cyl = Extract<SolidSpec, { type: 'cylinder' }>;
type Cone = Extract<SolidSpec, { type: 'cone' }>;

interface Cap {
  at: number;
  edge: 'top' | 'bottom';
}

/** The circles of a curved net: positional numbers are the top edge then the bottom one (a cone's: along its curved edge). */
export function capsOf(s: Cyl | Cone, c: CurvedNetSpec | undefined): Cap[] {
  const raw = c?.caps ?? (s.type === 'cylinder' ? [0.5, 0.5] : [0.5]);
  return raw.map((x, i) => (typeof x === 'number' ? { at: x, edge: s.type === 'cone' ? 'bottom' : i === 0 ? 'top' : 'bottom' } : x));
}

/** The net closes up into the solid: the curved face the right length (and a sector for a cone), a circle on each end. */
export function curvedCloses(s: SolidSpec, c: CurvedNetSpec | undefined): boolean {
  if (s.type !== 'cylinder' && s.type !== 'cone') return false;
  if ((c?.wrap ?? 1) !== 1 || (c?.lateral ?? 'sector') !== 'sector') return false;
  const caps = capsOf(s, c);
  if (s.type === 'cone') return caps.length === 1;
  return caps.length === 2 && caps.some((x) => x.edge === 'top') && caps.some((x) => x.edge === 'bottom');
}

/** The circles a curved net has (flat faces), and its curved face. */
export const curvedFaceCount = (s: Cyl | Cone, c: CurvedNetSpec | undefined): number => capsOf(s, c).length + 1;

const Z: Vec3 = [0, 0, 1];
const X: Vec3 = [1, 0, 0];
/** The way a curved face opens out from its circle (towards the viewer: folded, its seam is at the back). */
const Y: Vec3 = [0, -1, 0];
const ring = (centre: Vec3, a: Vec3, b: Vec3, r: number): Vec3[] => Array.from({ length: CIRCLE_SIDES }, (_, k) => add(centre, add(scale(a, r * Math.cos((2 * Math.PI * k) / CIRCLE_SIDES)), scale(b, r * Math.sin((2 * Math.PI * k) / CIRCLE_SIDES)))));
const all = (n: number) => Array.from({ length: n }, (_, i) => i);

/**
 * A circle hung on an edge of the curved face at `q`: the edge runs along `te`, `out` points away from the face
 * in its surface, `inward` into the solid; it turns through 90° × t towards `inward`.
 */
function hungCircle(face: CurvedFace, q: Vec3, te: Vec3, out: Vec3, inward: Vec3, r: number, t: number): CurvedPiece {
  const phi = (Math.PI / 2) * t;
  const d = add(scale(out, Math.cos(phi)), scale(inward, Math.sin(phi)));
  // Its outside is the curved face's outside where it hangs, turned with it.
  const sign = Math.sign(dot(cross(te, out), scale(inward, -1))) || 1;
  return { face, pts: ring(add(q, scale(d, r)), te, d, r), outline: all(CIRCLE_SIDES), outside: scale(unit(cross(te, d)), sign) };
}

/** A cylinder's net folded `t` of the way: the circle on the ground, the rectangle rolled up from where it touches it, the other circle on its edge. */
function cylinderPieces(s: Cyl, c: CurvedNetSpec | undefined, t: number): CurvedPiece[] {
  const r = s.radius;
  const h = s.height;
  const L = 2 * Math.PI * r * (c?.wrap ?? 1);
  const caps = capsOf(s, c);
  const ground = caps.find((x) => x.edge === 'bottom');
  const a = ground?.at ?? 0.5;
  // The rectangle's bottom edge touches the ground circle at K, along x; it opens out along Y.
  const K: Vec3 = scale(Y, ground ? r : 0);
  const phi = ground ? (Math.PI / 2) * t : 0;
  const g = add(scale(Y, Math.cos(phi)), scale(Z, Math.sin(phi)));
  const nUp = add(scale(Y, -Math.sin(phi)), scale(Z, Math.cos(phi)));
  const R = t > 1e-9 ? r / t : Infinity;
  const at = (sArc: number, v: number): Vec3 => {
    if (!Number.isFinite(R)) return add(add(K, scale(X, sArc)), scale(g, v));
    const psi = sArc / R;
    return add(add(add(K, scale(g, v)), scale(nUp, R * (1 - Math.cos(psi)))), scale(X, R * Math.sin(psi)));
  };
  const frame = (sArc: number) => {
    const psi = Number.isFinite(R) ? sArc / R : 0;
    return { te: add(scale(X, Math.cos(psi)), scale(nUp, Math.sin(psi))), inward: add(scale(nUp, Math.cos(psi)), scale(X, -Math.sin(psi))) };
  };
  const out: CurvedPiece[] = [];
  const s0 = -a * L;
  for (let k = 0; k < STRIPS; k++) {
    const p = s0 + (L * k) / STRIPS;
    const q = s0 + (L * (k + 1)) / STRIPS;
    const pts = [at(p, 0), at(q, 0), at(q, h), at(p, h)];
    const mid = frame((p + q) / 2);
    out.push({ face: 'side', pts, outline: [0, 2, ...(k === 0 ? [3] : []), ...(k === STRIPS - 1 ? [1] : [])], strip: k, outside: scale(mid.inward, -1) });
  }
  if (ground) out.push({ face: 'bottom', pts: ring([0, 0, 0], X, Y, r), outline: all(CIRCLE_SIDES), outside: [0, 0, -1] });
  for (const cap of caps) {
    if (cap === ground) continue;
    const sArc = s0 + cap.at * L;
    const f = frame(sArc);
    const top = cap.edge === 'top';
    out.push(hungCircle(top ? 'top' : 'bottom', at(sArc, top ? h : 0), f.te, scale(g, top ? 1 : -1), f.inward, r, t));
  }
  return out;
}

/** A cone's net folded `t` of the way: the base circle on the ground, the sector turning up from where it touches it and closing round. */
function conePieces(s: Cone, c: CurvedNetSpec | undefined, t: number): CurvedPiece[] {
  const r = s.radius;
  const l = slant(s.radius, s.height);
  const theta = ((2 * Math.PI * r) / l) * (c?.wrap ?? 1);
  const caps = capsOf(s, c);
  const ground = caps[0];
  const bc = ground ? (ground.at - 0.5) * theta : 0;
  const K: Vec3 = scale(Y, ground ? r : 0);
  const out: CurvedPiece[] = [];
  if ((c?.lateral ?? 'sector') === 'triangle') {
    const half = l * Math.sin(Math.min(theta, Math.PI * 0.9) / 2);
    out.push({ face: 'side', pts: [add(K, scale(X, -half)), add(K, scale(X, half)), add(K, scale(Y, l))], outline: [0, 1, 2], outside: [0, 0, -1] });
  } else {
    // The sector turns about the tangent at K through φ = t (π − the slant's angle with the ground) and curls onto a cone of opened-out angle Φ.
    const phi1 = Math.PI - Math.acos(r / l);
    const phi = ground ? t * phi1 : 0;
    const g = add(scale(Y, Math.cos(phi)), scale(Z, Math.sin(phi)));
    const nUp = add(scale(Y, -Math.sin(phi)), scale(Z, Math.cos(phi)));
    const big = 2 * Math.PI - t * (2 * Math.PI - (2 * Math.PI * r) / l);
    const sinA = Math.min(1, big / (2 * Math.PI));
    const cosA = Math.sqrt(Math.max(0, 1 - sinA * sinA));
    const apex = add(K, scale(g, l));
    const ax = add(scale(g, -cosA), scale(nUp, sinA));
    const e1 = add(scale(g, -sinA), scale(nUp, -cosA));
    const e2 = X;
    const point = (rho: number, beta: number): Vec3 => {
      const w = (beta - bc) / sinA;
      return add(apex, scale(add(scale(ax, cosA), scale(add(scale(e1, Math.cos(w)), scale(e2, Math.sin(w))), sinA)), rho));
    };
    for (let k = 0; k < STRIPS; k++) {
      const b0 = -theta / 2 + (theta * k) / STRIPS;
      const b1 = -theta / 2 + (theta * (k + 1)) / STRIPS;
      const pts = [apex, point(l, b0), point(l, b1)];
      const wm = ((b0 + b1) / 2 - bc) / sinA;
      const radial = add(scale(e1, Math.cos(wm)), scale(e2, Math.sin(wm)));
      // The outside of the cone: away from its axis.
      const outside = unit(sub(scale(radial, cosA), scale(ax, sinA)));
      out.push({ face: 'side', pts, outline: [1, ...(k === 0 ? [0] : []), ...(k === STRIPS - 1 ? [2] : [])], strip: k, outside: t < 1e-9 ? [0, 0, -1] : outside });
    }
  }
  if (ground) out.push({ face: 'base', pts: ring([0, 0, 0], X, Y, r), outline: all(CIRCLE_SIDES), outside: [0, 0, -1] });
  // A second circle (a wrong net): on the curved edge, flat.
  for (const cap of caps.slice(1)) {
    const beta = (cap.at - 0.5) * theta;
    const apex: Vec3 = add(K, scale(Y, l));
    const dir: Vec3 = add(scale(X, Math.sin(beta - bc)), scale(Y, -Math.cos(beta - bc)));
    const q = add(apex, scale(dir, l));
    out.push({ face: 'base', pts: ring(add(q, scale(dir, r)), [dir[1], -dir[0], 0], dir, r), outline: all(CIRCLE_SIDES), outside: [0, 0, -1] });
  }
  return out;
}

/** The pieces of a curved net folded `t` (0 flat, 1 folded) of the way. */
export function curvedPieces(s: SolidSpec, c: CurvedNetSpec | undefined, t: number): CurvedPiece[] {
  if (s.type === 'cylinder') return cylinderPieces(s, c, t);
  if (s.type === 'cone') return conePieces(s, c, t);
  return [];
}

/** The gap left round the curved face when folded (along the circle; 0: it meets itself). */
export function curvedGap(s: SolidSpec, c: CurvedNetSpec | undefined): number {
  if (s.type !== 'cylinder' && s.type !== 'cone') return 0;
  return Math.max(0, 1 - (c?.wrap ?? 1)) * 2 * Math.PI * s.radius;
}

/** The length round a circle the curved face's long edge covers (the cylinder's rectangle, the cone's arc). */
export const wrapLength = (s: Cyl | Cone, c: CurvedNetSpec | undefined): number => 2 * Math.PI * s.radius * (c?.wrap ?? 1);

/** The seam ends of a curved face folded all the way (for the closing test: they meet when it closes). */
export function seamEnds(s: SolidSpec, c: CurvedNetSpec | undefined): [Vec3, Vec3] | null {
  const strips = curvedPieces(s, c, 1).filter((p) => p.face === 'side');
  if (strips.length < 2) return null;
  const first = strips[0]!;
  const last = strips.at(-1)!;
  return s.type === 'cone' ? [first.pts[1]!, last.pts[2]!] : [first.pts[0]!, last.pts[1]!];
}

/** Distance between two points (for the tests and the gap's label). */
export const dist = (a: Vec3, b: Vec3): number => norm(sub(a, b));
