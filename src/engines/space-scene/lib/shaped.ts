/**
 * Layout maths of the shaped primitive kinds (lathe, extrude, curvedPanel,
 * blades, coilBank, grille), shared by the WebGL builders, the part bounds
 * and the tests (pure, no three.js). Everything is in the primitive's own
 * frame, before `mirror` and `rotation`.
 */
import type { Primitive } from '../schema';
import type { Vec3 } from './math';
import { DEG2RAD } from './math';

type Kind<K extends Primitive['kind']> = Extract<Primitive, { kind: K }>;
export type CoilBank = Kind<'coilBank'>;
export type Blades = Kind<'blades'>;

/* ------------------------------------------------------------------ */
/* coilBank                                                            */
/* ------------------------------------------------------------------ */

/** How far tubes run past the outer fins before a return bend (scene units). */
export function coilStub(p: CoilBank): number {
  return Math.max(p.tubeRadius * 2.5, p.pitch * 0.35);
}

/** Row offsets across the bank (Z for leg 0), centred; rows sit 0.866 × pitch apart (staggered). */
export function coilRowOffsets(p: CoilBank): number[] {
  return Array.from({ length: p.rows }, (_, r) => (r - (p.rows - 1) / 2) * p.pitch * 0.866);
}

/** Tube heights (Y) of row `r`: `cols` tubes at `pitch`, odd rows shifted half a pitch (kept inside the face). */
export function coilTubeHeights(p: CoilBank, r: number): number[] {
  const shift = p.rows > 1 ? (r % 2 === 0 ? -0.25 : 0.25) * p.pitch : 0;
  return Array.from({ length: p.cols }, (_, k) => (k - (p.cols - 1) / 2) * p.pitch + shift);
}

/**
 * First tube of the return-bend pairs at the +X end of row `r` (the far end
 * starts at the other parity): even rows join (1,2), (3,4)… there and leave
 * tube 0 (bottom) free; odd rows join (0,1), (2,3)… and, with an odd `cols`,
 * leave the top tube free. The free tube ends are where pipes connect.
 */
export function coilBendStart(_p: CoilBank, r: number): number {
  return r % 2 === 0 ? 1 : 0;
}

/** Face height of the fin pack. */
export function coilFaceHeight(p: CoilBank): number {
  return p.cols * p.pitch;
}

/** Corner radius of an L bank (centre plane of the tubes). */
export function coilCorner(p: CoilBank): number {
  return p.corner ?? Math.max(p.finDepth, p.pitch * 2);
}

/** Bank legs: flat = [length, 0]; L = `legs`. */
export function coilLegs(p: CoilBank): [number, number] {
  return p.shape === 'L' && p.legs ? [p.legs[0], p.legs[1]] : [p.length, 0];
}

/** Bounds of a coil bank in its own frame. */
export function coilBox(p: CoilBank): { min: Vec3; max: Vec3 } {
  const [a, b] = coilLegs(p);
  const halfH = Math.max(coilFaceHeight(p) / 2, Math.max(...coilTubeHeights(p, p.rows - 1).map(Math.abs)) + p.tubeRadius);
  const rowMax = Math.max(...coilRowOffsets(p).map(Math.abs)) + p.tubeRadius;
  const halfD = Math.max(p.finDepth / 2, rowMax);
  const tip = p.bends === 'none' ? coilStub(p) : coilStub(p) + p.pitch / 2 + p.tubeRadius;
  if (p.shape !== 'L') return { min: [-a / 2 - tip, -halfH, -halfD], max: [a / 2 + tip, halfH, halfD] };
  const rc = coilCorner(p);
  return { min: [-a / 2 - rc - halfD, -halfH, -halfD], max: [a / 2 + tip, halfH, rc + b + tip] };
}

/* ------------------------------------------------------------------ */
/* blades                                                              */
/* ------------------------------------------------------------------ */

/**
 * A point on the mid surface of axial blade 0 (the others are turned about Y):
 * `s` 0..1 from hub to tip, `c` −0.5..0.5 from leading to trailing edge.
 * The chord grows from 55 % at the root to `chord` at the tip; the blade
 * angle falls from `pitch` to `pitch − twist`; the tip is swept `sweep`°
 * ahead of the root; a light camber bows the section.
 */
export function axialBladePoint(p: Blades, s: number, c: number): Vec3 {
  const r = p.hub + (p.radius - p.hub) * s;
  const chord = p.chord * (0.55 + 0.45 * s);
  const angle = (p.pitch - p.twist * s) * DEG2RAD;
  const sweep = p.sweep * DEG2RAD * s * s;
  const along = c * chord * Math.cos(angle);
  const theta = sweep + along / r;
  const camber = chord * 0.06 * (1 - 4 * c * c);
  const y = -c * chord * Math.sin(angle) + camber * Math.cos(angle);
  return [Math.cos(theta) * r, y, Math.sin(theta) * r];
}

/** Axial half extent of an axial rotor (blades and hub). */
export function axialHalfHeight(p: Blades): number {
  let h = 0;
  for (let i = 0; i <= 8; i++)
    for (let j = 0; j <= 8; j++) h = Math.max(h, Math.abs(axialBladePoint(p, i / 8, j / 8 - 0.5)[1]));
  return Math.max(h + p.thickness, axialHub(p).height / 2);
}

/** Domed hub of an axial rotor: radius and overall height. */
export function axialHub(p: Blades): { radius: number; height: number } {
  return { radius: p.hub * 1.05, height: Math.max(p.hub * 1.1, p.chord * 0.5) };
}

/** Barrel (cross-flow) rotor: Y positions of its discs, end discs at ±length/2. */
export function barrelDiscs(p: Blades): number[] {
  const len = p.length ?? 0;
  return Array.from({ length: p.discs }, (_, k) => -len / 2 + (len * k) / (p.discs - 1));
}

/**
 * Cross-section of one forward-curved barrel blade (blade 0): `t` 0..1 from the
 * inner edge (`hub`) to the outer edge (`radius`), as [x, z]. The blade leans
 * forward by `sweep`° (default 25°) and bows by a circular camber.
 */
export function barrelBladePoint(p: Blades, t: number): [number, number] {
  const lean = (p.sweep || 25) * DEG2RAD;
  const r = p.hub + (p.radius - p.hub) * t;
  const theta = lean * t * t + (p.chord / p.radius) * 0.25 * Math.sin(Math.PI * t);
  return [Math.cos(theta) * r, Math.sin(theta) * r];
}

/* ------------------------------------------------------------------ */
/* curved panel, lathe, extrude, grille                                */
/* ------------------------------------------------------------------ */

/** A point of a curved panel at angle `a` (radians from +Z towards +X) and radius `rr`, apex of the outer face at the origin. */
export function panelPoint(radius: number, a: number, rr: number): [number, number] {
  return [Math.sin(a) * rr, Math.cos(a) * rr - radius];
}

export function curvedPanelBox(p: Kind<'curvedPanel'>): { min: Vec3; max: Vec3 } {
  const half = (p.angle / 2) * DEG2RAD;
  let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
  const steps = 64;
  for (let k = 0; k <= steps; k++) {
    const a = -half + (2 * half * k) / steps;
    for (const rr of [p.radius, p.radius - p.thickness]) {
      const [x, z] = panelPoint(p.radius, a, rr);
      x0 = Math.min(x0, x); x1 = Math.max(x1, x); z0 = Math.min(z0, z); z1 = Math.max(z1, z);
    }
  }
  return { min: [x0, -p.height / 2, z0], max: [x1, p.height / 2, z1] };
}

export function latheBox(p: Kind<'lathe'>): { min: Vec3; max: Vec3 } {
  const r = Math.max(...p.profile.map(([x]) => x));
  const ys = p.profile.map(([, y]) => y);
  return { min: [-r, Math.min(...ys), -r], max: [r, Math.max(...ys), r] };
}

export function extrudeBox(p: Kind<'extrude'>): { min: Vec3; max: Vec3 } {
  const xs = p.shape.map(([x]) => x);
  const ys = p.shape.map(([, y]) => y);
  return { min: [Math.min(...xs), Math.min(...ys), -p.depth / 2], max: [Math.max(...xs), Math.max(...ys), p.depth / 2] };
}

/** Ring radii of a ring grille: `count` rings, evenly from a fifth of the radius out to the radius. */
export function grilleRings(p: Kind<'grille'>): number[] {
  const R = p.radius ?? 0;
  if (p.count === 1) return [R];
  const r0 = R * 0.2;
  return Array.from({ length: p.count }, (_, k) => r0 + ((R - r0) * k) / (p.count - 1));
}

/** Slat centres (X) of a slat grille. */
export function grilleSlats(p: Kind<'grille'>): number[] {
  const [w] = p.size ?? [0, 0, 0];
  const usable = w - p.bar * 2;
  return Array.from({ length: p.count }, (_, k) => -usable / 2 + p.bar / 2 + (p.count === 1 ? usable / 2 : ((usable - p.bar) * k) / (p.count - 1)));
}

export function grilleBox(p: Kind<'grille'>): { min: Vec3; max: Vec3 } {
  if (p.style === 'rings') {
    const R = (p.radius ?? 0) + p.bar;
    return { min: [-R, -p.bar, -R], max: [R, p.bar, R] };
  }
  const [w, d, h] = p.size ?? [0, 0, 0];
  return { min: [-w / 2, -h / 2, -d / 2], max: [w / 2, h / 2, d / 2] };
}
