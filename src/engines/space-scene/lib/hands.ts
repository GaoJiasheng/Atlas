/**
 * Exercise-mode hands (docs/06 动作模式数据手册 · body styles and hands;
 * pure, unit-tested). The skin's own hands are cast splayed, so with the
 * wire figure and the mannequin the stage hides them and draws a hand from
 * the rig's `hand.l` / `hand.r` joint instead, shaped by what it holds:
 *
 *  - `fist`: closed around the grip axis of a bar, a handle, a dumbbell, a
 *    kettlebell's handle, a band (barbell, lat bar, cable bar, pull-up bar,
 *    dip bars; dumbbells, kettlebells, cable and band handles in the holding
 *    hand);
 *  - `palm`: flat and open on the floor or a bench, when nothing is held and
 *    the palm is a contact of the exercise (`hands`, `hand.l` / `hand.r`) or
 *    lies within 2 cm of the surface (`nearSurface`): its heel at the wrist,
 *    the fingers along the forearm (toward the head when the forearm stands
 *    up from the surface, a push-up);
 *  - `relaxed`: slightly curled, when the hand is free.
 *
 * The hand's frame: x = toward the thumb, y = along the hand (the forearm's
 * direction for a fist or a free hand, the fingers' direction for a flat
 * palm), z = the palm's normal (toward what the palm holds or presses on).
 * A right hand's frame is right-handed, a left hand's its mirror. The thumb
 * follows the grip: pronated = toward the other hand (bench press, pull-up),
 * supinated = away from it (curl, chin-up), neutral = forward along the
 * handle (hammer curl, dips; toward the head when the forearm points forward).
 */
import { equipmentList, type ContactKind, type EquipmentKind } from '../../../lib/anatomy';
import { BAND, BAR, DIP_BAR, DUMBBELL, KETTLEBELL, LAT_BAR, PALM_LIFT, PRESS_SURFACES, PULL_UP, defaultContacts } from './equipment';

export type HandKind = 'fist' | 'palm' | 'relaxed';
export type HandGrip = 'pronated' | 'supinated' | 'neutral';
/**
 * Where a closed hand's grip axis comes from: `between` = palm to palm (a bar
 * in both hands); `across` = across the forearm, side to side (front to back
 * for a neutral grip), as a held handle sits (Equipment.tsx); `scene-z` = the
 * scene's Z (dip bars run front to back under the palms).
 */
export type GripAxis = 'between' | 'across' | 'scene-z';

export interface HandPlan {
  kind: HandKind;
  grip: HandGrip;
  axis: GripAxis;
  /** Radius of what the fist closes around (metres; 0 for an open hand). */
  radius: number;
}

/** The thinnest thing a fist closes around (a band, a kettlebell's wire handle): the fingers cannot close tighter. */
export const FIST_MIN_RADIUS = 0.012;
/** A cable D-handle's grip radius (lib/equipment.ts `cableHandleShape`: 30 mm). */
const HANDLE_RADIUS = 0.015;

export const RELAXED: HandPlan = { kind: 'relaxed', grip: 'neutral', axis: 'across', radius: 0 };
export const PALM: HandPlan = { kind: 'palm', grip: 'neutral', axis: 'across', radius: 0 };

interface HandSpec {
  kind: EquipmentKind;
  grip?: HandGrip | undefined;
  hand?: 'left' | 'right' | 'both' | undefined;
  on?: 'hands' | 'back' | undefined;
  to?: 'hands' | 'feet' | 'ankle.l' | 'ankle.r' | undefined;
  handle?: 'd-handle' | 'bar' | undefined;
  hold?: 'across' | 'along' | 'vertical' | 'both' | undefined;
}

interface HandMotion {
  root?: { rotation: readonly number[] } | undefined;
  equipment?: HandSpec | readonly HandSpec[] | undefined;
  contacts?: readonly ContactKind[] | undefined;
  feet?: string | undefined;
}

const fist = (grip: HandGrip, axis: GripAxis, radius: number): HandPlan => ({ kind: 'fist', grip, axis, radius: Math.max(FIST_MIN_RADIUS, radius) });

/** The hand `side` of an exercise (`motion`; none = free): the first piece it holds decides, else a palm on the floor or a bench (a contact, or `near` one now), else relaxed. */
export function handPlan(motion: HandMotion | undefined, side: 'l' | 'r', near = false): HandPlan {
  if (!motion) return near ? PALM : RELAXED;
  const list = equipmentList(motion.equipment);
  const holds = (s: HandSpec) => s.hand === undefined || s.hand === 'both' || (s.hand === 'left') === (side === 'l');
  for (const s of list) {
    switch (s.kind) {
      case 'barbell':
        return s.on === 'back' ? fist(s.grip ?? 'pronated', 'across', BAR.shaft / 2) : fist(s.grip ?? 'pronated', 'between', BAR.shaft / 2);
      case 'lat-bar':
        return fist(s.grip ?? 'pronated', 'between', LAT_BAR.bar / 2);
      case 'pull-up-bar':
        return fist(s.grip ?? 'pronated', 'between', PULL_UP.bar / 2);
      case 'dip-bars':
        return fist('neutral', 'scene-z', DIP_BAR.radius);
      case 'dumbbell':
        // On end between both palms (a goblet squat): the palms cup the head, the fingers stay open.
        if (s.hold === 'both' || (s.hold === 'vertical' && (s.hand ?? 'both') === 'both')) return RELAXED;
        if (holds(s)) return fist(s.grip ?? 'pronated', 'across', DUMBBELL.handle / 2);
        break;
      case 'kettlebell':
        if (holds(s)) return fist(s.grip ?? 'pronated', 'across', KETTLEBELL.wire / 2);
        break;
      case 'cable-handle':
        if (holds(s)) return fist(s.grip ?? 'pronated', 'across', HANDLE_RADIUS);
        break;
      case 'cable':
        if (s.to === 'ankle.l' || s.to === 'ankle.r') break;
        if (s.handle === 'bar') return fist(s.grip ?? 'pronated', 'between', LAT_BAR.bar / 2);
        if (holds(s)) return fist(s.grip ?? 'pronated', 'across', HANDLE_RADIUS);
        break;
      case 'band':
        if (s.to !== 'feet' && holds(s)) return fist(s.grip ?? 'neutral', 'across', BAND.thick / 2);
        break;
      default:
        break;
    }
  }
  const contacts = defaultContacts(motion);
  const pressed = (contacts.includes('hands') || contacts.includes(side === 'l' ? 'hand.l' : 'hand.r')) && list.some((s) => PRESS_SURFACES.has(s.kind));
  return pressed || near ? PALM : RELAXED;
}

type V3 = readonly [number, number, number];
type M3 = [number, number, number];

const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V3, b: V3): M3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const scale = (a: V3, k: number): M3 => [a[0] * k, a[1] * k, a[2] * k];
const sub = (a: V3, b: V3): M3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const len = (a: V3) => Math.hypot(a[0], a[1], a[2]);
const unit = (a: V3): M3 => {
  const l = len(a);
  return l > 1e-9 ? scale(a, 1 / l) : [0, 0, 0];
};
/** `a` with its component along unit `n` removed. */
const flat = (a: V3, n: V3): M3 => sub(a, scale(n, dot(a, n)));

/** Directions the frame needs, all in the body's (skeleton) frame. */
export interface HandInput {
  /** Unit forearm direction, elbow → wrist. */
  forearm: V3;
  /** From this palm to the other one (`between`), or null when the rig has one hand. */
  toOther?: V3 | null;
  /** The scene's +Z (`scene-z`) and +Y (the floor's up, a flat palm), seen from the body's frame. */
  sceneZ?: V3;
  sceneUp?: V3;
}

export interface HandFrame {
  /** Toward the thumb. */
  x: M3;
  /** Along the hand: the forearm (fist, relaxed) or the fingers (palm). */
  y: M3;
  /** The palm's normal. */
  z: M3;
}

/** A forearm at most ~60° from the surface (its projection at least this long) leads the fingers. */
const FLAT_FOREARM = 0.5;

const BODY_X: V3 = [1, 0, 0];
const BODY_Y: V3 = [0, 1, 0];
const BODY_Z: V3 = [0, 0, 1];

/** A unit vector along `pref` across `y`, else along the fallbacks (the first that is not too close to `y`). */
function across(y: V3, ...prefs: V3[]): M3 {
  for (const p of prefs) {
    const f = flat(p, y);
    if (len(f) > 0.3) return unit(f);
  }
  return unit(flat(BODY_X, y));
}

/** The frame (x thumb, y along the hand, z palm normal) of hand `side` for its plan. */
export function handFrame(side: 'l' | 'r', plan: HandPlan, input: HandInput): HandFrame {
  if (plan.kind === 'palm') {
    // Flat on the surface: the palm faces down, the fingers carry on along the forearm (lying on the surface,
    // a forearm plank), or point the way the head does when the forearm stands up from it (a push-up).
    const z = scale(unit(input.sceneUp ?? BODY_Y), -1);
    const along = flat(input.forearm, z);
    const y = len(along) >= FLAT_FOREARM ? unit(along) : across(z, BODY_Y, input.forearm, BODY_Z);
    const x = side === 'r' ? cross(y, z) : cross(z, y);
    return { x, y, z };
  }
  const y = unit(input.forearm);
  // The grip axis, and the direction toward the other hand along it (pronated thumbs point there).
  let a: M3;
  let medial: M3;
  const sideways: V3 = side === 'l' ? [-1, 0, 0] : [1, 0, 0];
  if (plan.axis === 'between' && input.toOther && len(flat(input.toOther, y)) > 1e-4) {
    a = unit(flat(input.toOther, y));
    medial = a;
  } else if (plan.axis === 'scene-z') {
    a = across(y, input.sceneZ ?? BODY_Z, BODY_Y);
    medial = across(y, sideways);
  } else {
    a = plan.grip === 'neutral' ? across(y, BODY_Z, BODY_Y) : across(y, BODY_X, BODY_Y);
    medial = across(y, sideways);
  }
  let thumb: M3;
  if (plan.grip === 'neutral' && plan.axis !== 'between') thumb = a;
  else {
    const toward = dot(a, medial) >= 0 ? a : scale(a, -1);
    thumb = plan.grip === 'supinated' ? scale(toward, -1) : toward;
  }
  const z = side === 'r' ? cross(thumb, y) : cross(y, thumb);
  return { x: thumb, y, z };
}

/** How near (metres, palm underside to surface) a free hand lies flat: up to 2 cm above, or a little into it. */
export const NEAR_ABOVE = 0.02;
export const NEAR_BELOW = 0.05;

/**
 * The heights (scene y) of the surfaces a palm can lie on: the floor, and
 * the tops of the benches, seats and steps (placed from the trunk + `at`, a
 * step on the model's floor; lib/equipment.ts `placeFixed`).
 */
export function surfaceHeights(
  equipment: readonly { kind: EquipmentKind; at?: readonly number[] | undefined; height?: number | undefined }[],
  ctx: { trunkY: number; floor: number | null; modelFloor: number },
): number[] {
  const out = [ctx.floor ?? ctx.modelFloor];
  for (const e of equipment) {
    if (e.kind === 'bench' || e.kind === 'incline-bench' || e.kind === 'machine-seat') out.push(ctx.trunkY + (e.at?.[1] ?? 0));
    else if (e.kind === 'step') out.push(ctx.modelFloor);
  }
  return out;
}

/** The surface a palm whose grip point is at height `gripY` lies on (within `below` / `above` metres), or null. */
export function surfaceUnder(gripY: number, heights: readonly number[], above = NEAR_ABOVE, below = NEAR_BELOW): number | null {
  const palm = gripY - PALM_LIFT;
  let best: number | null = null;
  for (const h of heights) {
    const d = palm - h;
    if (d <= above && d >= -below && (best === null || Math.abs(d) < Math.abs(palm - best))) best = h;
  }
  return best;
}

/**
 * The triangles of an index to keep: those with no vertex `drop`s (the
 * skin's hands: vertices weighted mostly to a hand joint).
 */
export function keepTriangles(index: ArrayLike<number>, drop: (vertex: number) => boolean): number[] {
  const out: number[] = [];
  for (let i = 0; i + 2 < index.length; i += 3) {
    const a = index[i]!;
    const b = index[i + 1]!;
    const c = index[i + 2]!;
    if (!drop(a) && !drop(b) && !drop(c)) out.push(a, b, c);
  }
  return out;
}

/**
 * The feature edges of a triangle mesh (vertex index pairs): where the two
 * faces sharing an edge turn by more than `angle` degrees, and the open
 * borders. Vertices at the same position count as one (a seam is not an
 * edge); each edge comes once, as the first pair of vertices that drew it.
 */
export function featureEdges(position: ArrayLike<number>, index: ArrayLike<number>, angle: number): number[] {
  const weld = new Map<string, number>();
  const id = (v: number): number => {
    const key = `${Math.round(position[v * 3]! * 1e5)},${Math.round(position[v * 3 + 1]! * 1e5)},${Math.round(position[v * 3 + 2]! * 1e5)}`;
    let w = weld.get(key);
    if (w === undefined) weld.set(key, (w = v));
    return w;
  };
  const p = (v: number): M3 => [position[v * 3]!, position[v * 3 + 1]!, position[v * 3 + 2]!];
  const edges = new Map<string, { a: number; b: number; n: M3; turned: boolean; faces: number }>();
  const cos = Math.cos((angle * Math.PI) / 180);
  for (let i = 0; i + 2 < index.length; i += 3) {
    const tri = [index[i]!, index[i + 1]!, index[i + 2]!];
    const n = unit(cross(sub(p(tri[1]!), p(tri[0]!)), sub(p(tri[2]!), p(tri[0]!))));
    if (len(n) === 0) continue;
    for (let k = 0; k < 3; k++) {
      const a = tri[k]!;
      const b = tri[(k + 1) % 3]!;
      const wa = id(a);
      const wb = id(b);
      if (wa === wb) continue;
      const key = wa < wb ? `${wa}_${wb}` : `${wb}_${wa}`;
      const e = edges.get(key);
      if (!e) edges.set(key, { a, b, n, turned: false, faces: 1 });
      else {
        e.faces++;
        if (dot(e.n, n) < cos) e.turned = true;
      }
    }
  }
  const out: number[] = [];
  for (const e of edges.values()) if (e.faces === 1 || e.turned) out.push(e.a, e.b);
  return out;
}
