/**
 * The contact solver (docs/06 动作模式数据手册; pure, unit-tested). The
 * joints only turn about the trunk, so an exercise whose hands or feet hold
 * on to something would otherwise move them through it. Each frame the body
 * is moved instead, so the first contact of `motion.contacts` (lib/equipment.ts
 * `defaultContacts`) stays where the exercise's first key put it:
 *
 *  - `hands`: the palms' midpoint stays put — the body translates (a chin-up
 *    rises as the elbows bend, a dip sinks, a hanging knee raise hangs). With
 *    `[hands, feet]` and the palms on the floor the body instead pivots about
 *    the feet so the palms keep their height (a push-up lowers the chest);
 *  - `feet`: the weight-bearing feet stay planted (lib/stance.ts: the lowest
 *    heel / ball on the floor, the feet that bear weight where they stood);
 *  - `seat`: nothing moves the body (a bench or a machine seat holds it where
 *    the root turn puts it).
 *
 * Only one contact is met exactly; the others follow from the pose (a chin-up's
 * feet hang). Contacts the rig cannot show (no hands, no ankles) are dropped.
 */
import type { ContactKind } from '../../../lib/anatomy';

type V3 = readonly [number, number, number];

/** What the solver does this exercise. */
export interface ContactPlan {
  /** Palms: held still by moving the body, by pivoting it about the feet, or free. */
  hands: 'translate' | 'hinge' | null;
  /** The feet stay planted (stance.ts). */
  feet: boolean;
}

export const NO_CONTACT: ContactPlan = { hands: null, feet: false };

/**
 * The plan for a contact order. `hands` / `feet`: the rig has the hands' grip
 * points / the ankles' heel and ball; `handsOnFloor`: the palms push on the
 * floor (a hinge is possible). A default pair `[hands, feet]` (not written
 * in the data) whose hands the rig lacks is dropped whole; written contacts
 * fall through to the next one the rig has.
 */
export function contactPlan(order: readonly ContactKind[], rig: { hands: boolean; feet: boolean }, handsOnFloor: boolean, explicit: boolean): ContactPlan {
  if (!explicit && order[0] === 'hands' && !rig.hands) return NO_CONTACT;
  const usable = order.filter((k) => (k === 'hands' ? rig.hands : k === 'feet' ? rig.feet || order[0] === 'hands' : true));
  const first = usable[0];
  if (first === 'hands') return { hands: usable[1] === 'feet' && handsOnFloor ? 'hinge' : 'translate', feet: false };
  if (first === 'feet' && rig.feet) return { hands: null, feet: true };
  return NO_CONTACT;
}

/** The move that puts the palms' midpoint back: `ref − now` (metres). */
export function handsCorrection(now: V3, ref: V3): [number, number, number] {
  return [ref[0] - now[0], ref[1] - now[1], ref[2] - now[2]];
}

/**
 * The turn about +X (radians) through `pivot` (the feet) that brings `now`
 * (the palms' midpoint) back to the height of `ref`, the smaller of the two
 * solutions; 0 when it cannot reach it (the arc never crosses that height).
 */
export function hingeAngle(now: V3, ref: V3, pivot: V3): number {
  const vy = now[1] - pivot[1];
  const vz = now[2] - pivot[2];
  const rho = Math.hypot(vy, vz);
  if (rho < 1e-6) return 0;
  const beta = Math.atan2(vz, vy);
  const c = Math.acos(Math.min(1, Math.max(-1, (ref[1] - pivot[1]) / rho)));
  const wrap = (x: number) => Math.atan2(Math.sin(x), Math.cos(x));
  const d1 = wrap(c - beta);
  const d2 = wrap(-c - beta);
  return Math.abs(d1) < Math.abs(d2) ? d1 : d2;
}
