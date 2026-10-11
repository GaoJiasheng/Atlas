/**
 * Exercise-mode equipment (docs/16 §6.5, decision 13: the fewest elements,
 * the muscles stay the subject), built from the engine's own primitives
 * (pure: the stage turns them into geometry with `partPieces`). Real sizes in
 * metres; one neutral material (the stage draws every piece in the same
 * matte dark grey).
 *
 *   barbell        held: Olympic bar, 2.2 m long, 28 mm shaft, 50 mm sleeves,
 *                  a 300 mm × 25 mm iron plate (the standard 10 kg size) on each sleeve; the shaft runs along
 *                  X between the palms
 *   dumbbell       held: 350 mm long, 170 mm heads, handle along X
 *   cable-handle   held: a stirrup handle, grip along X, ring toward −Y
 *   bench          free-standing: 1.2 × 0.3 m pad with its top at the origin,
 *                  0.45 m above the floor; long axis along Z (head end −Z);
 *                  `incline`° raises the back toward −Z
 *   parallel-bars  free-standing: two dip bars along Z under the planted
 *                  palms (one piece each: a bar on two posts down to the floor)
 *   floor          free-standing: a thin floor slab, its top at the origin
 */
import type { EquipmentKind } from '../../../lib/anatomy';
import type { Primitive } from '../schema';

export const HELD_EQUIPMENT: readonly EquipmentKind[] = ['barbell', 'dumbbell', 'cable-handle'];

/** Equipment the hands push against: the body moves, the hands stay planted (closed chain). */
export const PLANTED_EQUIPMENT: readonly EquipmentKind[] = ['floor', 'parallel-bars'];

/** Real sizes (metres). */
export const BAR = { length: 2.2, shaft: 0.028, sleeve: 0.05, sleeveLength: 0.415, plate: 0.3, plateThick: 0.025 } as const;
export const DUMBBELL = { length: 0.35, head: 0.17, handle: 0.034, grip: 0.13 } as const;
export const BENCH = { length: 1.2, width: 0.3, height: 0.45, pad: 0.06 } as const;
/** Bench seat (the part that stays flat under an inclined back). */
const SEAT = 0.42;
export const DIP_BAR = { radius: 0.025, length: 0.9 } as const;
export const FLOOR = { width: 0.8, length: 2.2, thick: 0.004 } as const;
/** How far the palm's grip point sits above the floor it pushes on (hand thickness), metres. */
export const PALM_LIFT = 0.015;
/** Dip bars: bar tops this far above the floor. */
export const DIP_HEIGHT = 1.45;

export interface EquipmentShape {
  primitive: Primitive;
  extra?: Primitive[];
}

type Prim = Primitive;
const grey = 'rubber' as const;

/** A cylinder (diameter d, length len) lying along X, centred at `at`. */
const alongX = (d: number, len: number, at: [number, number, number]): Prim =>
  ({ kind: 'cylinder', size: [d / 2, d / 2, len], at, rotation: [0, 0, 90], color: grey }) as Prim;
/** A cylinder lying along Z. */
const alongZ = (d: number, len: number, at: [number, number, number]): Prim =>
  ({ kind: 'cylinder', size: [d / 2, d / 2, len], at, rotation: [90, 0, 0], color: grey }) as Prim;

export function barbellShape(): EquipmentShape {
  const sleeveAt = BAR.length / 2 - BAR.sleeveLength / 2;
  // Plates sit on the inner end of each sleeve, against the collar.
  const plateAt = BAR.length / 2 - BAR.sleeveLength + 0.03 + BAR.plateThick / 2;
  const plate = (x: number): Prim => alongX(BAR.plate, BAR.plateThick, [x, 0, 0]);
  return {
    primitive: alongX(BAR.shaft, BAR.length - 2 * BAR.sleeveLength, [0, 0, 0]),
    extra: [
      alongX(BAR.sleeve, BAR.sleeveLength, [-sleeveAt, 0, 0]),
      alongX(BAR.sleeve, BAR.sleeveLength, [sleeveAt, 0, 0]),
      plate(-plateAt),
      plate(plateAt),
    ],
  };
}

export function dumbbellShape(): EquipmentShape {
  const head = (DUMBBELL.length - DUMBBELL.grip) / 2;
  const x = DUMBBELL.grip / 2 + head / 2;
  return {
    primitive: alongX(DUMBBELL.handle, DUMBBELL.grip, [0, 0, 0]),
    extra: [alongX(DUMBBELL.head, head, [-x, 0, 0]), alongX(DUMBBELL.head, head, [x, 0, 0])],
  };
}

export function cableHandleShape(): EquipmentShape {
  return {
    primitive: alongX(0.03, 0.12, [0, 0, 0]),
    extra: [{ kind: 'torus', size: [0.075, 0.006], at: [0, -0.06, 0], color: grey } as Prim],
  };
}

/** A bench whose pad top is at the origin, long axis along Z (head end −Z), back raised `incline`°. */
export function benchShape(incline = 0): EquipmentShape {
  const top = -BENCH.pad / 2;
  const legH = BENCH.height - BENCH.pad;
  const foot = (z: number): Prim =>
    ({ kind: 'box', size: [0.05, legH, 0.05], at: [0, -BENCH.pad - legH / 2, z], color: grey }) as Prim;
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

/** One dip bar along Z with its top at the origin, on two posts reaching `height` down to the floor. */
export function dipBarShape(height = DIP_HEIGHT): EquipmentShape {
  const r = DIP_BAR.radius;
  const z = DIP_BAR.length / 2 - 0.08;
  const post = (pz: number): Prim => ({ kind: 'cylinder', size: [0.02, 0.02, height], at: [0, -height / 2, pz], color: grey }) as Prim;
  return { primitive: alongZ(2 * r, DIP_BAR.length, [0, -r, 0]), extra: [post(z), post(-z)] };
}

/** A thin floor slab with its top at the origin, long axis along Z. */
export function floorShape(): EquipmentShape {
  return { primitive: { kind: 'box', size: [FLOOR.width, FLOOR.thick, FLOOR.length], at: [0, -FLOOR.thick / 2, 0], color: grey } as Prim };
}


type V3 = readonly [number, number, number];

interface Placed {
  kind: EquipmentKind;
  at?: readonly number[] | undefined;
}

/**
 * The floor under an exercise (scene y), or null to keep the model's own:
 * the planted palms for `floor` (else `at` below the trunk), the bench's feet,
 * the dip bars' feet. `at` is relative to the trunk joint (metres).
 */
export function equipmentFloor(specs: readonly Placed[], trunk: V3, palms: readonly [V3, V3] | null): number | null {
  const low = palms ? Math.min(palms[0][1], palms[1][1]) : null;
  for (const e of specs) {
    if (e.kind === 'floor') return low !== null ? low - PALM_LIFT : trunk[1] + (e.at?.[1] ?? -0.5);
    if (e.kind === 'bench') return trunk[1] + (e.at?.[1] ?? 0) - BENCH.height;
    if (e.kind === 'parallel-bars') return (low !== null ? low : trunk[1] + (e.at?.[1] ?? 0)) - DIP_HEIGHT;
  }
  return null;
}

/**
 * Where a free-standing piece stands (scene coordinates): bench and floor at
 * the trunk + `at` (the floor at the planted palms' height), each dip bar
 * (`side` 0 = left, 1 = right) under its planted palm (or beside the trunk + `at`).
 */
export function placeFixed(e: Placed, trunk: V3, palms: readonly [V3, V3] | null, floor: number | null, side = 0): [number, number, number] {
  const at = e.at ?? [0, 0, 0];
  const rel: [number, number, number] = [trunk[0] + (at[0] ?? 0), trunk[1] + (at[1] ?? 0), trunk[2] + (at[2] ?? 0)];
  if (e.kind === 'floor') return [rel[0], floor ?? rel[1], rel[2]];
  if (e.kind === 'parallel-bars') {
    // Each bar runs under its palm (the palm wraps the bar); without a rig's hands, 0.5 m apart at the trunk + `at`.
    if (palms) {
      const p = palms[side]!;
      return [p[0], p[1] + DIP_BAR.radius * 0.4, p[2] + (at[2] ?? 0)];
    }
    return [rel[0] + (side === 0 ? 0.25 : -0.25), rel[1], rel[2]];
  }
  return rel;
}
