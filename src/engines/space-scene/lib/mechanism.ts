/** Beam-steam's prescribed planar geometry. No clock, DOM, store or physics integration. */
import type { MechanismGeometry } from '../mechanism-schema';

export type Point2 = [number, number];
export const POINT_ROLES = ['A', 'O', 'F', 'P', 'K', 'C', 'B', 'E', 'D', 'S', 'Q', 'W'] as const;
export type MechanismPoint = typeof POINT_ROLES[number];
export const ROLE_ENDPOINTS = {
  beam: ['A', 'K'], innerLink: ['C', 'E'], outerLink: ['B', 'D'], bottomLink: ['E', 'D'], radiusRod: ['F', 'E'],
  driveRod: ['K', 'P'], centreLink: ['O', 'P'], pistonRod: ['S', 'D'], pumpRod: ['Q', 'W'],
} as const;
export const PORT_ROLES = ['upperIn', 'lowerIn', 'upperOut', 'lowerOut'] as const;
export const LINK_ROLES = Object.keys(ROLE_ENDPOINTS) as (keyof typeof ROLE_ENDPOINTS)[];
export const MECHANISM_ROLES = [...LINK_ROLES, 'piston', 'planet', 'sun', 'shaft', 'flywheel', 'pumpPiston'] as const;
type Points = Record<MechanismPoint, Point2>;
export interface MechanismFrame {
  thetaRad: number; phaseDeg: number; cycles: number;
  points: Points;
  pistonDirection: 'up' | 'down' | 'switch'; derivativeM: number;
  planetAngleRad: number; sunAngleRad: number; shaftTurns: number;
  ports: Record<typeof PORT_ROLES[number], boolean>;
  linkResidualM: number; clearanceMarginM: number;
  circleHeights: Point2; pumpMarginM2: number;
  /** Reused scratch space, never part of the public bridge snapshot. */
  scratch: Points;
}
function points(): Points { return Object.fromEntries(POINT_ROLES.map((k) => [k, [0, 0]])) as Points; }
export function createMechanismFrame(): MechanismFrame {
  return { thetaRad: 0, phaseDeg: 0, cycles: 0, points: points(), scratch: points(), pistonDirection: 'switch', derivativeM: 0,
    planetAngleRad: 0, sunAngleRad: 0, shaftTurns: 0, ports: { upperIn: false, lowerIn: false, upperOut: false, lowerOut: false },
    linkResidualM: 0, clearanceMarginM: 0, circleHeights: [0, 0], pumpMarginM2: 0 };
}
/** Returns the branch-stable intersection; only a tiny negative roundoff is clamped. */
export function circle(c0: readonly number[], r0: number, c1: readonly number[], r1: number, branch: number, out: Point2 = [0, 0]): Point2 {
  const dx = c1[0]! - c0[0]!, dy = c1[1]! - c0[1]!, d = Math.hypot(dx, dy);
  if (!Number.isFinite(d + r0 + r1) || d <= 1e-9 || r0 <= 0 || r1 <= 0 || (branch !== 1 && branch !== -1)) throw new Error('Invalid mechanism circle centres, radii or branch');
  const a = (r0 * r0 - r1 * r1 + d * d) / (2 * d), h2 = r0 * r0 - a * a;
  if (h2 < -1e-10 || d > r0 + r1 + 1e-10 || d < Math.abs(r0 - r1) - 1e-10) throw new Error('Unreachable mechanism circle intersection');
  const h = branch * Math.sqrt(Math.max(0, h2));
  out[0] = c0[0]! + (a * dx - h * dy) / d; out[1] = c0[1]! + (a * dy + h * dx) / d;
  return out;
}
function set(p: Point2, x: number, y: number): void { p[0] = x; p[1] = y; }
function solvePoints(theta: number, g: MechanismGeometry, p: Points): void {
  const { A, O, F, P, K, C, B, E, D, S, Q, W } = p;
  set(A, ...g.beamPivot); set(O, ...g.shaftCentre); set(F, ...g.radiusPivot);
  set(P, O[0] + g.orbitM * Math.cos(theta), O[1] + g.orbitM * Math.sin(theta));
  circle(A, g.beamHalfM, P, g.connectingRodM, g.beamBranch, K);
  const vx = K[0] - A[0], vy = K[1] - A[1];
  set(C, A[0] - g.innerFraction * vx, A[1] - g.innerFraction * vy); set(B, A[0] - vx, A[1] - vy);
  circle(C, g.shortLinkM, F, g.radiusRodM, g.parallelBranch, E);
  set(D, B[0] + E[0] - C[0], B[1] + E[1] - C[1]); set(S, D[0], D[1] - g.pistonRodM);
  set(Q, A[0] + g.pump.beamFraction * vx, A[1] + g.pump.beamFraction * vy);
  const margin = g.pump.rodM ** 2 - (Q[0] - g.pump.sliderX) ** 2;
  if (!Number.isFinite(margin) || margin <= 0) throw new Error('Unreachable mechanism pump slider');
  set(W, g.pump.sliderX, Q[1] - Math.sqrt(margin));
}
const distance = (a: Point2, b: Point2) => Math.hypot(a[0] - b[0], a[1] - b[1]);
function height(c0: Point2, r0: number, c1: Point2, r1: number): number {
  const d = distance(c0, c1), a = (r0 * r0 - r1 * r1 + d * d) / (2 * d);
  return Math.sqrt(Math.max(0, r0 * r0 - a * a));
}
/** Reusing `out` allocates no vectors, matrices, geometry or materials. Angles remain unwrapped. */
export function solveMechanism(thetaRad: number, g: MechanismGeometry, out = createMechanismFrame()): MechanismFrame {
  if (!Number.isFinite(thetaRad)) throw new Error('Mechanism phase must be finite');
  const p = out.points, tmp = out.scratch;
  solvePoints(0, g, tmp);
  const alpha0 = Math.atan2(tmp.K[1] - tmp.P[1], tmp.K[0] - tmp.P[0]);
  solvePoints(thetaRad + 1e-5, g, tmp); const plus = tmp.D[1];
  solvePoints(thetaRad - 1e-5, g, tmp); const minus = tmp.D[1];
  solvePoints(thetaRad, g, p);
  out.thetaRad = thetaRad; out.phaseDeg = ((thetaRad * 180 / Math.PI) % 360 + 360) % 360; out.cycles = thetaRad / (2 * Math.PI);
  out.derivativeM = (plus - minus) / 2e-5;
  out.pistonDirection = Math.abs(out.derivativeM) <= 1e-7 ? 'switch' : out.derivativeM < 0 ? 'down' : 'up';
  const delta = Math.atan2(p.K[1] - p.P[1], p.K[0] - p.P[0]) - alpha0;
  out.planetAngleRad = Math.atan2(Math.sin(delta), Math.cos(delta)); out.sunAngleRad = 2 * thetaRad - out.planetAngleRad; out.shaftTurns = out.sunAngleRad / (2 * Math.PI);
  const down = out.pistonDirection === 'down', up = out.pistonDirection === 'up';
  out.ports.upperIn = out.ports.lowerOut = down; out.ports.lowerIn = out.ports.upperOut = up;
  out.linkResidualM = Math.max(Math.abs(distance(p.A, p.K) - g.beamHalfM), Math.abs(distance(p.A, p.C) - g.beamHalfM / 2),
    Math.abs(distance(p.C, p.B) - g.beamHalfM / 2), Math.abs(distance(p.E, p.D) - g.beamHalfM / 2), Math.abs(distance(p.F, p.E) - g.radiusRodM),
    Math.abs(distance(p.C, p.E) - g.shortLinkM), Math.abs(distance(p.B, p.D) - g.shortLinkM), Math.abs(distance(p.K, p.P) - g.connectingRodM),
    Math.abs(distance(p.O, p.P) - g.orbitM), Math.abs(distance(p.Q, p.W) - g.pump.rodM));
  out.clearanceMarginM = g.radialDisplayClearanceM - Math.abs(p.D[0] - g.cylinderX);
  out.circleHeights[0] = height(p.A, g.beamHalfM, p.P, g.connectingRodM); out.circleHeights[1] = height(p.C, g.shortLinkM, p.F, g.radiusRodM);
  out.pumpMarginM2 = g.pump.rodM ** 2 - (p.Q[0] - g.pump.sliderX) ** 2;
  if (!Number.isFinite(p.S[0] + p.S[1] + out.derivativeM + out.sunAngleRad + out.clearanceMarginM + out.linkResidualM))
    throw new Error('Non-finite mechanism solution');
  return out;
}
