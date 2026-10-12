/**
 * Contraction from motion (docs/06 动作模式数据手册; pure, unit-tested). An
 * exercise's muscles (its `primary`, `secondary` and `stabilisers`) shorten
 * with the joints they move, read from the muscle sheets' `actions`:
 *
 *   along = angle(movement) − angle(opposite movement)   (that joint, this frame)
 *   c     = weight × clamp01((along − lo) / (hi − lo))
 *
 * where lo / hi are the lowest / highest `along` over the exercise's keys
 * (the muscle is shortest where the joint has gone furthest in the direction
 * of its action), weight 1 for a `prime` action, 0.5 `assist`, 0.2
 * `stabilise`; a muscle takes the largest of its actions. A listed muscle
 * none of whose actions moves (by at least `MIN_RANGE`°) holds still:
 * isometric, a constant `ISOMETRIC`. A hand-typed key `contract` overrides
 * the computed value for that muscle (MotionDriver).
 *
 * Joints: the part's side (`-r` twin = right) picks `<joint>.l` / `.r`, else
 * the unsided joint (`trunk`); `wrist` falls back to `hand`, pronation /
 * supination on `forearm` to `elbow`. On an unsided joint a right-side
 * muscle's lateral flexion counts the other way and rotation counts either
 * way (its sign depends on the muscle, not the side).
 */
import { OPPOSITE_MOVEMENTS, type ActionRole, type Movement } from '../../../lib/anatomy';
import { musclePartIds, type Angles } from './rig';

export const ROLE_WEIGHT: Readonly<Record<ActionRole, number>> = { prime: 1, assist: 0.5, stabilise: 0.2 };
/** A listed muscle whose joints do not move holds at this level while the exercise runs. */
export const ISOMETRIC = 0.3;
/** Smallest range (degrees over the keys) that counts as moving. */
export const MIN_RANGE = 5;

export interface ContractionTerm {
  part: string;
  joint: string;
  movement: Movement;
  /** +1, −1 (a right-side lateral flexion on an unsided joint), or 0 = either way (|along|). */
  sign: number;
  weight: number;
  lo: number;
  hi: number;
}

export interface ContractionPlan {
  terms: ContractionTerm[];
  /** Listed parts with no moving action: `ISOMETRIC`. */
  isometric: string[];
  /** Every part the plan writes. */
  parts: string[];
}

interface PlanPart {
  id: string;
  muscle?: string | undefined;
  context?: boolean | undefined;
}

interface PlanMuscle {
  id: string;
  parent?: string | undefined;
  actions: readonly { joint: string; movement: Movement; role: ActionRole }[];
}

/** The joint's angle along `movement` (minus its opposite), signed; `sign` 0 takes its size. */
export function along(angles: Angles | undefined, movement: Movement, sign = 1): number {
  if (!angles) return 0;
  const opp = OPPOSITE_MOVEMENTS[movement];
  const v = (angles[movement] ?? 0) - (opp ? (angles[opp] ?? 0) : 0);
  return sign === 0 ? Math.abs(v) : v * sign;
}

/** The rig joint an action of a part turns (null: the rig has none). */
export function actionJoint(joint: string, movement: Movement, side: 'l' | 'r', rigJoints: ReadonlySet<string>): string | null {
  const names = [`${joint}.${side}`, joint];
  if (joint === 'wrist') names.push(`hand.${side}`);
  if (joint === 'forearm' && (movement === 'pronation' || movement === 'supination')) names.push(`elbow.${side}`);
  return names.find((n) => rigJoints.has(n)) ?? null;
}

/**
 * The plan for one exercise in one topic: `keys` are the exercise keys' joint
 * angles by rig joint (both sides filled in, `bothSides`).
 */
export function contractionPlan(input: {
  exercise: { primary: readonly string[]; secondary: readonly string[]; stabilisers: readonly string[] };
  muscles: ReadonlyMap<string, PlanMuscle>;
  parts: readonly PlanPart[];
  rigJoints: ReadonlySet<string>;
  keys: readonly Readonly<Record<string, Angles>>[];
}): ContractionPlan {
  const { exercise, muscles, parts, rigJoints, keys } = input;
  const parentOf = new Map([...muscles.values()].map((m) => [m.id, m.parent]));
  const terms: ContractionTerm[] = [];
  const isometric: string[] = [];
  const seen = new Set<string>();
  /** A muscle's own actions, else its nearest parent's. */
  const actionsOf = (id: string | undefined) => {
    for (let cur = id, n = 0; cur && n < 16; cur = parentOf.get(cur), n++) {
      const a = muscles.get(cur)?.actions;
      if (a && a.length > 0) return a;
    }
    return [];
  };
  for (const listed of [...exercise.primary, ...exercise.secondary, ...exercise.stabilisers]) {
    for (const partId of musclePartIds(parts, listed, parentOf)) {
      if (seen.has(partId)) continue;
      seen.add(partId);
      const part = parts.find((p) => p.id === partId)!;
      const side = partId.endsWith('-r') ? 'r' : 'l';
      let moving = false;
      for (const a of actionsOf(part.muscle ?? listed)) {
        if (a.movement === 'stabilisation') continue;
        const joint = actionJoint(a.joint, a.movement, side, rigJoints);
        if (!joint) continue;
        const unsided = !/\.[lr]$/.test(joint);
        const sign = unsided && side === 'r' ? (a.movement === 'lateral-flexion' ? -1 : a.movement === 'rotation' ? 0 : 1) : 1;
        const values = keys.map((k) => along(k[joint], a.movement, sign));
        const lo = Math.min(...values);
        const hi = Math.max(...values);
        if (!(hi - lo >= MIN_RANGE)) continue;
        moving = true;
        terms.push({ part: partId, joint, movement: a.movement, sign, weight: ROLE_WEIGHT[a.role], lo, hi });
      }
      if (!moving) isometric.push(partId);
    }
  }
  return { terms, isometric, parts: [...seen] };
}

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);

/** Contraction per part for the joint angles now (rig joint → angles). */
export function contractionAt(plan: ContractionPlan, joints: { get(name: string): Angles | undefined }, out = new Map<string, number>()): Map<string, number> {
  for (const id of plan.isometric) out.set(id, ISOMETRIC);
  for (const t of plan.terms) {
    const c = t.weight * clamp01((along(joints.get(t.joint), t.movement, t.sign) - t.lo) / (t.hi - t.lo));
    if (c > (out.get(t.part) ?? -1)) out.set(t.part, c);
  }
  return out;
}
