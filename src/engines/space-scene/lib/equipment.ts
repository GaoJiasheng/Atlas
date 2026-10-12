/**
 * Exercise-mode equipment (docs/16 §6.5, decision 13: the fewest elements,
 * the muscles stay the subject; docs/06 动作模式数据手册), built from the
 * engine's own primitives (pure: the stage turns them into geometry with
 * `partPieces`). Real sizes in metres; one neutral matte material (the stage
 * draws every piece in the same grey, one draw call per piece).
 *
 * Held (in the palms, the rig's `hand.*` + offset; they turn with the body):
 *   barbell        Olympic bar, 2.2 m, 28 mm shaft, 50 mm sleeves, a 300 mm ×
 *                  25 mm plate (the standard 10 kg size) on each sleeve; palm to
 *                  palm, or across the upper back (`on: back`, on the trunk joint)
 *   dumbbell       330 mm long, 140 mm chamfered round heads, handle along X
 *   kettlebell     a 210 mm bell under a 120 mm handle, the bell past the fingers
 *   cable-handle   a stirrup handle, grip along X, ring toward the fingers
 *   lat-bar        a 1.2 m straight bar between the palms, its cable up to a pulley
 * Lines (scene; from a fixed point to the body):
 *   cable          a 2.2 m column with its pulley at `at`; the cable runs to a
 *                  D-handle in each holding palm, or to a straight bar
 *   band           from its anchor `at` to the holding palms (or the feet)
 * Free-standing (scene; placed from the trunk, the planted palms, the feet):
 *   bench          1.2 × 0.3 m pad, top 0.45 m above the floor, long axis Z
 *                  (head end −Z); `incline`° raises the back toward −Z
 *   incline-bench  the same bench, back at `angle`° (default 30)
 *   machine-seat   a seat pad (top at the origin, `height` 0.45 m) with a back
 *                  pad reclined `angle`° from vertical and an optional thigh pad
 *   pull-up-bar    a 1.2 m bar at the palms (the hands hang from it), `height`
 *                  2.3 m above the floor on two uprights
 *   dip-bars       two bars along Z under the planted palms (`height` 1.45 m)
 *   step           a 0.4 × 0.35 m box, `height` 0.2 m, under the balls of the feet
 *   floor          a thin floor slab, its top at the origin
 *   wall           a 1.2 m wide, 40 mm thick panel, `height` 2 m, on the floor at
 *                  the trunk + `at` (a wall to lean the back or heels on)
 *   post           a 40 mm upright rail, `height` 1.1 m, on the floor at the
 *                  trunk + `at` (a hand on it for balance)
 */
import type { ContactKind, EquipmentKind } from '../../../lib/anatomy';
import type { Primitive } from '../schema';
import { isStanding } from './stance';

/** How a kind attaches to the body (docs/06): where the hands and feet go, and whether it rides with the body. */
export interface EquipmentInfo {
  /** `held`: drawn in the body's frame (palms, back); `line`: a cable or band from a fixed point; `fixed`: stands in the scene. */
  place: 'held' | 'line' | 'fixed';
  /** The hands: on one `bar`, on a handle each, or free. */
  hands: 'bar' | 'handles' | 'none';
  /** The feet: on the floor, on a step, or hanging. */
  feet: 'floor' | 'step' | 'hanging';
  /** It holds the palms still (the body moves instead, `contacts` default). */
  holdsHands?: true;
}

export const EQUIPMENT_INFO: Readonly<Record<EquipmentKind, EquipmentInfo>> = {
  barbell: { place: 'held', hands: 'bar', feet: 'floor' },
  dumbbell: { place: 'held', hands: 'handles', feet: 'floor' },
  kettlebell: { place: 'held', hands: 'handles', feet: 'floor' },
  'cable-handle': { place: 'held', hands: 'handles', feet: 'floor' },
  'lat-bar': { place: 'held', hands: 'bar', feet: 'floor' },
  cable: { place: 'line', hands: 'handles', feet: 'floor' },
  band: { place: 'line', hands: 'handles', feet: 'floor' },
  bench: { place: 'fixed', hands: 'none', feet: 'floor' },
  'incline-bench': { place: 'fixed', hands: 'none', feet: 'floor' },
  'machine-seat': { place: 'fixed', hands: 'none', feet: 'floor' },
  'pull-up-bar': { place: 'fixed', hands: 'bar', feet: 'hanging', holdsHands: true },
  'dip-bars': { place: 'fixed', hands: 'handles', feet: 'hanging', holdsHands: true },
  step: { place: 'fixed', hands: 'none', feet: 'step' },
  floor: { place: 'fixed', hands: 'none', feet: 'floor' },
  wall: { place: 'fixed', hands: 'none', feet: 'floor' },
  post: { place: 'fixed', hands: 'none', feet: 'floor' },
};

/** Surfaces a palm can press flat on (the floor, a bench, a step, a seat): a hand contact there can hinge, and a free hand near one lies flat. */
export const PRESS_SURFACES: ReadonlySet<EquipmentKind> = new Set(['floor', 'bench', 'incline-bench', 'step', 'machine-seat']);

/** Real sizes (metres). */
export const BAR = { length: 2.2, shaft: 0.028, sleeve: 0.05, sleeveLength: 0.415, plate: 0.3, plateThick: 0.025 } as const;
export const DUMBBELL = { length: 0.33, head: 0.14, handle: 0.034, grip: 0.13, chamfer: 0.012 } as const;
export const KETTLEBELL = { bell: 0.21, handle: 0.12, wire: 0.02 } as const;
export const BENCH = { length: 1.2, width: 0.3, height: 0.45, pad: 0.06 } as const;
/** Bench seat (the part that stays flat under an inclined back). */
const SEAT = 0.42;
export const DIP_BAR = { radius: 0.025, length: 0.9 } as const;
export const PULL_UP = { width: 1.2, bar: 0.032, upright: 0.05, height: 2.3 } as const;
export const LAT_BAR = { length: 1.2, bar: 0.028, cable: 0.006 } as const;
export const COLUMN = { height: 2.2, width: 0.08, pulley: 0.08 } as const;
export const MACHINE_SEAT = { width: 0.38, depth: 0.38, pad: 0.07, back: 0.6, height: 0.45, thigh: 0.1 } as const;
export const STEP = { width: 0.4, depth: 0.35, height: 0.2 } as const;
export const BAND = { thick: 0.012 } as const;
export const FLOOR = { width: 0.8, length: 2.2, thick: 0.004 } as const;
export const WALL = { width: 1.2, thick: 0.04, height: 2 } as const;
export const POST = { diameter: 0.04, height: 1.1, base: 0.25 } as const;
/** How far the palm's grip point sits above the floor it pushes on (hand thickness), metres. */
export const PALM_LIFT = 0.015;
/** Dip bars: bar tops this far above the floor. */
export const DIP_HEIGHT = 1.45;
/** Default incline-bench back angle (degrees). */
export const INCLINE_DEFAULT = 30;
/** Machine seat back recline from vertical by default (degrees). */
export const SEAT_RECLINE = 10;

export interface EquipmentShape {
  primitive: Primitive;
  extra?: Primitive[];
}

type Prim = Primitive;
type V3 = readonly [number, number, number];
const grey = 'rubber' as const;

/** A cylinder (diameter d, length len) lying along X, centred at `at`. */
const alongX = (d: number, len: number, at: V3): Prim => ({ kind: 'cylinder', size: [d / 2, d / 2, len], at: [...at], rotation: [0, 0, 90], color: grey }) as Prim;
/** A cylinder lying along Z. */
const alongZ = (d: number, len: number, at: V3): Prim => ({ kind: 'cylinder', size: [d / 2, d / 2, len], at: [...at], rotation: [90, 0, 0], color: grey }) as Prim;
/** An upright cylinder (along Y). */
const upright = (d: number, len: number, at: V3): Prim => ({ kind: 'cylinder', size: [d / 2, d / 2, len], at: [...at], color: grey }) as Prim;
const box = (size: V3, at: V3, rotation?: V3): Prim =>
  ({ kind: 'bevelBox', size: [...size], bevel: Math.min(0.01, Math.min(...size) / 4), at: [...at], ...(rotation ? { rotation: [...rotation] } : {}), color: grey }) as Prim;

/**
 * A chamfered disc / head profile for a lathe about Y (r, y), from `y0` to
 * `y1`, radius `r`, chamfer `c`: the chamfer facets catch the key light as a
 * light rim (crisp lathe edges), so a weight reads as a turned part, not a blob.
 */
function chamferRing(r: number, y0: number, y1: number, c: number, inner = 0): [number, number][] {
  const k = Math.min(c, (y1 - y0) / 2.5, r / 3);
  return [
    [inner, y0],
    [r - k, y0],
    [r, y0 + k],
    [r, y1 - k],
    [r - k, y1],
    [inner, y1],
  ];
}

/** A lathe about Y turned to lie along X, centred at `at`. */
const latheX = (profile: [number, number][], at: V3, segments = 40): Prim =>
  ({ kind: 'lathe', profile, segments, at: [...at], rotation: [0, 0, 90], color: grey }) as Prim;

export function barbellShape(): EquipmentShape {
  const sleeveAt = BAR.length / 2 - BAR.sleeveLength / 2;
  // Plates sit on the inner end of each sleeve, against the collar.
  const plateAt = BAR.length / 2 - BAR.sleeveLength + 0.03 + BAR.plateThick / 2;
  const plate = (x: number): Prim => latheX(chamferRing(BAR.plate / 2, -BAR.plateThick / 2, BAR.plateThick / 2, 0.006), [x, 0, 0], 48);
  return {
    primitive: alongX(BAR.shaft, BAR.length - 2 * BAR.sleeveLength, [0, 0, 0]),
    extra: [alongX(BAR.sleeve, BAR.sleeveLength, [-sleeveAt, 0, 0]), alongX(BAR.sleeve, BAR.sleeveLength, [sleeveAt, 0, 0]), plate(-plateAt), plate(plateAt)],
  };
}

/** One turned dumbbell: two chamfered round heads on a knurled-size handle, one lathe (one draw). */
export function dumbbellShape(): EquipmentShape {
  const L = DUMBBELL.length / 2;
  const g = DUMBBELL.grip / 2;
  const R = DUMBBELL.head / 2;
  const h = DUMBBELL.handle / 2;
  const c = DUMBBELL.chamfer;
  const profile: [number, number][] = [
    [0, -L],
    [R - c, -L],
    [R, -L + c],
    [R, -g - c],
    [R - c, -g],
    [h, -g],
    [h, g],
    [R - c, g],
    [R, g + c],
    [R, L - c],
    [R - c, L],
    [0, L],
  ];
  return { primitive: latheX(profile, [0, 0, 0]) };
}

/** A kettlebell: the handle's top bar along X through the grip point, the bell below it (toward the fingers, −Y). */
export function kettlebellShape(): EquipmentShape {
  const r = KETTLEBELL.bell / 2;
  const cy = -KETTLEBELL.handle / 2 - r * 0.85;
  // A slightly flattened bell with a flat base (lathe about Y).
  const bell: [number, number][] = [];
  for (let i = 0; i <= 10; i++) {
    const a = -Math.PI / 2 + (i / 10) * Math.PI * 0.92;
    bell.push([Math.max(0, r * Math.cos(a)), r * 0.92 * Math.sin(a)]);
  }
  bell[0] = [r * 0.55, -r * 0.92];
  bell.unshift([0, -r * 0.92]);
  bell.push([0, bell[bell.length - 1]![1]]);
  return {
    primitive: { kind: 'torus', size: [KETTLEBELL.handle / 2, KETTLEBELL.wire / 2], at: [0, -KETTLEBELL.handle / 2, 0], color: grey } as Prim,
    extra: [{ kind: 'lathe', profile: bell, segments: 36, at: [0, cy, 0], color: grey } as Prim],
  };
}

export function cableHandleShape(): EquipmentShape {
  return {
    primitive: alongX(0.03, 0.12, [0, 0, 0]),
    extra: [{ kind: 'torus', size: [0.075, 0.006], at: [0, -0.06, 0], color: grey } as Prim],
  };
}

/** A straight bar between the palms (`lat-bar`, a cable bar), along X. */
export function straightBarShape(length: number = LAT_BAR.length): EquipmentShape {
  return { primitive: alongX(LAT_BAR.bar, length, [0, 0, 0]), extra: [{ kind: 'torus', size: [0.02, 0.004], at: [0, 0.018, 0], color: grey } as Prim] };
}

/** A bench whose pad top is at the origin, long axis along Z (head end −Z), back raised `incline`°. */
export function benchShape(incline = 0): EquipmentShape {
  const top = -BENCH.pad / 2;
  const legH = BENCH.height - BENCH.pad;
  const foot = (z: number): Prim => ({ kind: 'box', size: [0.05, legH, 0.05], at: [0, -BENCH.pad - legH / 2, z], color: grey }) as Prim;
  const base: Prim = { kind: 'box', size: [0.05, 0.04, BENCH.length - 0.1], at: [0, -BENCH.height + 0.02, 0], color: grey } as Prim;
  if (incline <= 0)
    return {
      primitive: { kind: 'bevelBox', size: [BENCH.width, BENCH.pad, BENCH.length], bevel: 0.012, at: [0, top, 0], color: grey } as Prim,
      extra: [foot(BENCH.length / 2 - 0.12), foot(-BENCH.length / 2 + 0.12), base],
    };
  // Seat at the foot end (+Z); the back hinges at the seat's head end and rises toward −Z.
  const a = (incline * Math.PI) / 180;
  const back = BENCH.length - SEAT;
  const hinge = BENCH.length / 2 - SEAT;
  return {
    primitive: { kind: 'bevelBox', size: [BENCH.width, BENCH.pad, SEAT], bevel: 0.012, at: [0, top, hinge + SEAT / 2], color: grey } as Prim,
    extra: [
      {
        kind: 'bevelBox',
        size: [BENCH.width, BENCH.pad, back],
        bevel: 0.012,
        at: [0, top + (back / 2) * Math.sin(a), hinge - (back / 2) * Math.cos(a)],
        rotation: [incline, 0, 0],
        color: grey,
      } as Prim,
      foot(BENCH.length / 2 - 0.12),
      foot(hinge - 0.05),
      base,
    ],
  };
}

/**
 * A machine seat: the pad's top at the origin (`height` above the floor), the
 * back pad behind it (−Z) reclined `angle`° from vertical, a post and base to
 * the floor, an optional thigh pad above the knees' side of the seat.
 */
export function machineSeatShape(angle = SEAT_RECLINE, height: number = MACHINE_SEAT.height, thighPad = false): EquipmentShape {
  const S = MACHINE_SEAT;
  const a = (angle * Math.PI) / 180;
  const backZ = -S.depth / 2 - S.pad / 2;
  const post = height - S.pad;
  const extra: Prim[] = [
    box([S.width, S.back, S.pad], [0, S.back / 2 * Math.cos(a), backZ - (S.back / 2) * Math.sin(a)], [-angle, 0, 0]),
    upright(0.06, post, [0, -S.pad - post / 2, 0]),
    box([0.5, 0.03, 0.5], [0, -height + 0.015, 0]),
  ];
  if (thighPad) extra.push(alongX(S.thigh, S.width + 0.04, [0, S.thigh / 2 + 0.17, S.depth / 2 - 0.08]));
  return { primitive: box([S.width, S.pad, S.depth], [0, -S.pad / 2, 0]), extra };
}

/** A pull-up bar along X with its centre at the origin, on two uprights reaching `height` down to the floor. */
export function pullUpBarShape(height: number = PULL_UP.height): EquipmentShape {
  const x = PULL_UP.width / 2;
  const post = (px: number): Prim => box([PULL_UP.upright, height + PULL_UP.upright / 2, PULL_UP.upright], [px, -height / 2 + PULL_UP.upright / 4, 0]);
  const foot = (px: number): Prim => box([0.08, 0.02, 0.6], [px, -height + 0.01, 0]);
  return { primitive: alongX(PULL_UP.bar, PULL_UP.width + 2 * PULL_UP.upright, [0, 0, 0]), extra: [post(x + PULL_UP.upright / 2), post(-x - PULL_UP.upright / 2), foot(x + PULL_UP.upright / 2), foot(-x - PULL_UP.upright / 2)] };
}

/** One dip bar along Z with its top at the origin, on two posts reaching `height` down to the floor. */
export function dipBarShape(height = DIP_HEIGHT): EquipmentShape {
  const r = DIP_BAR.radius;
  const z = DIP_BAR.length / 2 - 0.08;
  const post = (pz: number): Prim => upright(0.04, height, [0, -height / 2, pz]);
  return { primitive: alongZ(2 * r, DIP_BAR.length, [0, -r, 0]), extra: [post(z), post(-z)] };
}

/** A cable column standing on the floor at the origin (its face toward +Z), the pulley `pulley` metres up on that face. */
export function columnShape(pulley: number): EquipmentShape {
  const C = COLUMN;
  const y = Math.min(C.height - 0.05, Math.max(0.05, pulley));
  return {
    primitive: box([C.width, C.height, C.width], [0, C.height / 2, -C.width / 2]),
    extra: [
      alongX(C.pulley, 0.03, [0, y, C.pulley / 2]),
      box([0.5, 0.03, 0.4], [0, 0.015, -C.width / 2]),
    ],
  };
}

/** A step box with its top at the origin. */
export function stepShape(height: number = STEP.height): EquipmentShape {
  return { primitive: box([STEP.width, height, STEP.depth], [0, -height / 2, 0]) };
}

/** A thin floor slab with its top at the origin, long axis along Z. */
export function floorShape(): EquipmentShape {
  return { primitive: { kind: 'box', size: [FLOOR.width, FLOOR.thick, FLOOR.length], at: [0, -FLOOR.thick / 2, 0], color: grey } as Prim };
}

/** A wall panel standing on the floor at the origin, its face toward +Z (the body), `height` tall. */
export function wallShape(height: number = WALL.height): EquipmentShape {
  return { primitive: box([WALL.width, height, WALL.thick], [0, height / 2, -WALL.thick / 2]) };
}

/** An upright rail standing on the floor at the origin on a flat base, `height` tall. */
export function postShape(height: number = POST.height): EquipmentShape {
  return { primitive: upright(POST.diameter, height, [0, height / 2, 0]), extra: [box([POST.base, 0.02, POST.base], [0, 0.01, 0])] };
}

/** A unit line (cable, band): an upright cylinder from y 0 to 1 (the stage stretches it between its ends). */
export function lineShape(thick: number): EquipmentShape {
  return { primitive: upright(thick, 1, [0, 0.5, 0]) };
}

/* ------------------------------------------------------------------ */
/* Placement                                                           */
/* ------------------------------------------------------------------ */

interface Placed {
  kind: EquipmentKind;
  at?: readonly number[] | undefined;
  height?: number | undefined;
}

/** Where the exercise puts the body (scene coordinates), what free-standing equipment stands on. */
export interface PlaceContext {
  /** The trunk joint after the root turn. */
  trunk: V3;
  /** The palms held still (planted on the floor or bars, hanging from a bar), else null. */
  palms: readonly [V3, V3] | null;
  /** The balls of the feet at the first key (midpoint), else null. */
  feet?: V3 | null;
  /** The model's own floor (scene y). */
  modelFloor?: number | null;
}

/** Default height of a kind that has one (metres). */
export function heightOf(e: Placed): number {
  if (e.height !== undefined) return e.height;
  if (e.kind === 'pull-up-bar') return PULL_UP.height;
  if (e.kind === 'dip-bars') return DIP_HEIGHT;
  if (e.kind === 'step') return STEP.height;
  if (e.kind === 'machine-seat') return MACHINE_SEAT.height;
  if (e.kind === 'bench' || e.kind === 'incline-bench') return BENCH.height;
  if (e.kind === 'wall') return WALL.height;
  if (e.kind === 'post') return POST.height;
  return 0;
}

/**
 * The floor under an exercise (scene y), or null to keep the model's own:
 * the planted palms for `floor` (else `at` below the trunk), the bench's and
 * the seat's feet, the bars' feet, under the step. `at` is relative to the
 * trunk joint (metres). The first piece that stands on the floor decides.
 */
export function equipmentFloor(specs: readonly Placed[], ctx: PlaceContext): number | null {
  const { trunk, palms } = ctx;
  const low = palms ? Math.min(palms[0][1], palms[1][1]) : null;
  for (const e of specs) {
    switch (e.kind) {
      case 'floor':
        return low !== null ? low - PALM_LIFT : trunk[1] + (e.at?.[1] ?? -0.5);
      case 'bench':
      case 'incline-bench':
      case 'machine-seat':
        return trunk[1] + (e.at?.[1] ?? 0) - heightOf(e);
      case 'dip-bars':
      case 'pull-up-bar':
        return (low !== null ? low : trunk[1] + (e.at?.[1] ?? 0)) - heightOf(e);
      case 'step':
        return ctx.modelFloor != null ? ctx.modelFloor - heightOf(e) : null;
      default:
        break;
    }
  }
  return null;
}

/**
 * Where a free-standing piece stands (scene coordinates): bench, seat and
 * floor at the trunk + `at` (the floor at the planted palms' height); each
 * dip bar (`side` 0 = left, 1 = right) under its planted palm; the pull-up
 * bar at the palms (between them); the step under the balls of the feet
 * (+ `at`, top on the model's floor); a cable column at its pulley's x / z
 * on the floor (`floor`).
 */
export function placeFixed(e: Placed, ctx: PlaceContext, floor: number | null, side = 0): [number, number, number] {
  const { trunk, palms } = ctx;
  const at = e.at ?? [0, 0, 0];
  const rel: [number, number, number] = [trunk[0] + (at[0] ?? 0), trunk[1] + (at[1] ?? 0), trunk[2] + (at[2] ?? 0)];
  switch (e.kind) {
    case 'floor':
      return [rel[0], floor ?? rel[1], rel[2]];
    case 'dip-bars':
      // Each bar runs under its palm (the palm wraps the bar); without a rig's hands, 0.5 m apart at the trunk + `at`.
      if (palms) {
        const p = palms[side]!;
        return [p[0], p[1] + DIP_BAR.radius * 0.4, p[2] + (at[2] ?? 0)];
      }
      return [rel[0] + (side === 0 ? 0.25 : -0.25), rel[1], rel[2]];
    case 'pull-up-bar':
      // The palms wrap the bar: its axis a bar radius above the grip points.
      if (palms) return [(palms[0][0] + palms[1][0]) / 2, (palms[0][1] + palms[1][1]) / 2 + PULL_UP.bar * 0.3, (palms[0][2] + palms[1][2]) / 2];
      return [rel[0], rel[1] + 0.9, rel[2]];
    case 'step': {
      const f = ctx.feet;
      const top = ctx.modelFloor ?? rel[1];
      return f ? [f[0] + (at[0] ?? 0), top, f[2] + (at[2] ?? 0)] : [rel[0], top, rel[2]];
    }
    case 'cable':
    case 'wall':
    case 'post':
      return [rel[0], floor ?? ctx.modelFloor ?? rel[1] - 1, rel[2]];
    default:
      return rel;
  }
}

/** A pull-up bar's turn about +Y (degrees) so it runs palm to palm. */
export function barYaw(palms: readonly [V3, V3] | null, fallback = 0): number {
  if (!palms) return fallback;
  const dx = palms[0][0] - palms[1][0];
  const dz = palms[0][2] - palms[1][2];
  if (Math.hypot(dx, dz) < 1e-6) return fallback;
  return (Math.atan2(-dz, dx) * 180) / Math.PI;
}

/** The joints of the topic's rig a piece needs (validate: the rig must have them). */
export function equipmentJoints(e: {
  kind: EquipmentKind;
  hand?: 'left' | 'right' | 'both' | undefined;
  on?: 'hands' | 'back' | undefined;
  to?: 'hands' | 'feet' | 'ankle.l' | 'ankle.r' | undefined;
}): string[] {
  const info = EQUIPMENT_INFO[e.kind];
  if (e.kind === 'barbell' && e.on === 'back') return ['trunk'];
  if (e.kind === 'band' && e.to === 'feet') return ['ankle.l', 'ankle.r'];
  if (e.kind === 'cable' && (e.to === 'ankle.l' || e.to === 'ankle.r')) return [e.to];
  if (info.hands === 'none') return [];
  const hand = info.hands === 'bar' ? 'both' : (e.hand ?? 'both');
  return hand === 'left' ? ['hand.l'] : hand === 'right' ? ['hand.r'] : ['hand.l', 'hand.r'];
}

/**
 * How far a held bar reaches either side of the body in a standing exercise
 * (metres; an authored camera backs off so its ends stay off the HUD side
 * panels), and the body's turn about +Y; null when nothing long is held or
 * the body is lying or sitting.
 */
export function heldSpan(motion: { root?: { rotation: readonly number[] } | undefined; equipment?: Placed | readonly Placed[] | undefined } | undefined): { half: number; yaw: number } | null {
  if (!motion) return null;
  const list = motion.equipment === undefined ? [] : Array.isArray(motion.equipment) ? (motion.equipment as readonly Placed[]) : [motion.equipment as Placed];
  if (!list.some((e) => e.kind === 'barbell')) return null;
  if (!isStanding(motion.root?.rotation, list)) return null;
  return { half: BAR.length / 2, yaw: motion.root?.rotation[1] ?? 0 };
}

/**
 * What holds the body (docs/06; `motion.contacts`, else from the equipment):
 * a pull-up bar or dip bars hold the palms; the floor holds the palms and
 * the feet of a face-down body (root turned ≥ 30° about X: push-up, plank);
 * a standing body (lib/stance.ts) stands on its feet (unless `feet: free`);
 * otherwise nothing (the body stays where the root turn puts it).
 */
export function defaultContacts(motion: {
  root?: { rotation: readonly number[] } | undefined;
  equipment?: Placed | readonly Placed[] | undefined;
  contacts?: readonly ContactKind[] | undefined;
  feet?: string | undefined;
}): ContactKind[] {
  if (motion.contacts) return [...motion.contacts];
  const list = motion.equipment === undefined ? [] : Array.isArray(motion.equipment) ? (motion.equipment as readonly Placed[]) : [motion.equipment as Placed];
  if (list.some((e) => EQUIPMENT_INFO[e.kind].holdsHands)) return ['hands'];
  // Face down on the floor: the palms and the feet (the pair is dropped when the rig has no hands).
  if (list.some((e) => e.kind === 'floor') && (motion.root?.rotation[0] ?? 0) >= 30) return ['hands', 'feet'];
  if (list.some((e) => e.kind === 'machine-seat' || e.kind === 'bench' || e.kind === 'incline-bench')) return ['seat'];
  if (motion.feet !== 'free' && isStanding(motion.root?.rotation, list)) return ['feet'];
  return [];
}
