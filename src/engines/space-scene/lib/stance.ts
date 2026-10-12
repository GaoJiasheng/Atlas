/**
 * Planted feet in standing exercises (docs/16 §6.5; pure, unit-tested). The
 * joints only turn about the trunk, so a squat would otherwise lift the feet
 * toward a fixed pelvis. Each frame the body is moved instead:
 *
 *  - up / down so the lowest contact (heel or ball of either foot) stays on
 *    the floor line it stood on at the exercise's first key;
 *  - across the floor so the feet that bear weight stay where they stood: a
 *    foot within `LIFT_BAND` of the lowest one holds (fully on the floor, fading
 *    as it rises), and its anchor rolls from heel to ball as one rises above
 *    the other (a calf raise pivots on the ball, a heel walk on the heel).
 *
 * A single-leg move (a cable abduction) therefore keeps the standing foot
 * fixed, and a two-footed one (a squat) both, on average. An exercise can name
 * the feet that hold (`motion.feet`: a reverse lunge steps one foot back while
 * the front one stays): only those anchor the body, and the lowest of them
 * stays on the floor. On a step (`ball`: a calf raise with heel drop) the
 * balls of the feet hold: they stay on the step's edge, and the heels are free
 * to drop below it.
 */
type V3 = readonly [number, number, number];

/** A foot's two floor contacts. */
export interface FootPair {
  heel: V3;
  ball: V3;
}

/** Band (metres) over which a foot rising off the floor stops holding the body. */
export const LIFT_BAND = 0.03;
/** Band (metres) over which the contact rolls from heel to ball as one rises above the other. */
export const ROLL_BAND = 0.02;

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);

/** Share of the ball in a foot's anchor (0 = heel, 1 = ball): the lower contact holds. */
export function footRoll(heelY: number, ballY: number): number {
  return clamp01(0.5 + (heelY - ballY) / ROLL_BAND);
}

/** How much a foot holds the body: 1 on the floor, 0 once it is `LIFT_BAND` above the lowest foot. */
export function footWeight(low: number, lowest: number): number {
  return clamp01(1 - (low - lowest) / LIFT_BAND);
}

/** Equipment the body rests on or hangs from (not standing): benches, a seat, the floor, bars. */
const SUPPORTS: ReadonlySet<string> = new Set(['bench', 'incline-bench', 'machine-seat', 'floor', 'dip-bars', 'pull-up-bar']);

/** A standing exercise: the body upright (root turned ≤ 30° about X and Z) and nothing under it but the floor (or a step) it stands on. */
export function isStanding(rotation: readonly number[] | undefined, equipment: readonly { kind: string }[]): boolean {
  const r = rotation ?? [0, 0, 0];
  if (Math.abs(r[0] ?? 0) > 30 || Math.abs(r[2] ?? 0) > 30) return false;
  return !equipment.some((e) => SUPPORTS.has(e.kind));
}

const low = (f: FootPair) => Math.min(f.heel[1], f.ball[1]);
/** The contact that holds: the lower of heel and ball, or the ball alone on a step. */
const contactY = (f: FootPair, ball: boolean) => (ball ? f.ball[1] : low(f));
const mix = (a: V3, b: V3, k: number): V3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];

/**
 * The move that puts the feet back: `now` are the feet as the joints leave
 * them, `ref` where they stood at the first key (same frame, same order).
 * Returns the translation [x, y, z] (metres) to add to the body.
 */
export function standCorrection(now: readonly FootPair[], ref: readonly FootPair[], holds?: readonly boolean[], ball = false): [number, number, number] {
  if (now.length === 0 || now.length !== ref.length) return [0, 0, 0];
  const held = (i: number) => holds?.[i] ?? true;
  if (!now.some((_, i) => held(i))) return [0, 0, 0];
  const lowest = Math.min(...now.filter((_, i) => held(i)).map((f) => contactY(f, ball)));
  const floor = Math.min(...ref.filter((_, i) => held(i)).map((f) => contactY(f, ball)));
  let wx = 0;
  let wz = 0;
  let w = 0;
  for (let i = 0; i < now.length; i++) {
    const f = now[i]!;
    const r = ref[i]!;
    const weight = held(i) ? footWeight(contactY(f, ball), lowest) : 0;
    if (weight === 0) continue;
    const roll = ball ? 1 : footRoll(f.heel[1], f.ball[1]);
    const a = mix(f.heel, f.ball, roll);
    const b = mix(r.heel, r.ball, roll);
    wx += (b[0] - a[0]) * weight;
    wz += (b[2] - a[2]) * weight;
    w += weight;
  }
  return w > 0 ? [wx / w, floor - lowest, wz / w] : [0, floor - lowest, 0];
}

/**
 * How far (metres, across the floor) the weight-bearing feet still sit from
 * where they stood once the body has moved by `shift`: two feet share one
 * correction, so a squat that turns the legs out leaves a small residue.
 */
export function footSlip(now: readonly FootPair[], ref: readonly FootPair[], shift: readonly [number, number, number], holds?: readonly boolean[], ball = false): number {
  const held = (i: number) => holds?.[i] ?? true;
  if (now.length === 0 || now.length !== ref.length || !now.some((_, i) => held(i))) return 0;
  const lowest = Math.min(...now.filter((_, i) => held(i)).map((f) => contactY(f, ball)));
  let slip = 0;
  for (let i = 0; i < now.length; i++) {
    const f = now[i]!;
    const r = ref[i]!;
    if (!held(i) || footWeight(contactY(f, ball), lowest) < 1) continue;
    const roll = ball ? 1 : footRoll(f.heel[1], f.ball[1]);
    const a = mix(f.heel, f.ball, roll);
    const b = mix(r.heel, r.ball, roll);
    slip = Math.max(slip, Math.hypot(a[0] + shift[0] - b[0], a[2] + shift[2] - b[2]));
  }
  return slip;
}
