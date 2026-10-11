/**
 * Exercise-mode equipment (docs/16 §6.5, decision 13: the fewest elements,
 * the muscles stay the subject), built from the engine's own primitives
 * (pure: the stage turns them into geometry with `partPieces`). Metres.
 *
 *   barbell        held: 2.2 m bar along X centred between the hands, a pair of plates
 *   dumbbell       held: one per hand, handle along X (Z for a neutral grip)
 *   cable-handle   held: a stirrup handle per hand
 *   bench          free-standing at `at` (its seat top there), long axis along Z,
 *                  `incline`° raises the back toward −Z, `turn` about Y
 *   parallel-bars  free-standing: two bars along Z, `width` apart, their tops at `at`
 */
import type { EquipmentKind } from '../../../lib/anatomy';
import type { Primitive } from '../schema';

export const HELD_EQUIPMENT: readonly EquipmentKind[] = ['barbell', 'dumbbell', 'cable-handle'];

export interface EquipmentShape {
  primitive: Primitive;
  extra?: Primitive[];
}

type Prim = Primitive;
const steel = 'steel' as const;
const rubber = 'rubber' as const;

/** A cylinder (radius r, length len) lying along X, centred at `at`. */
const alongX = (r: number, len: number, at: [number, number, number], color: Prim['color'] = steel): Prim =>
  ({ kind: 'cylinder', size: [r, r, len], at, rotation: [0, 0, 90], color }) as Prim;
/** A cylinder lying along Z. */
const alongZ = (r: number, len: number, at: [number, number, number], color: Prim['color'] = steel): Prim =>
  ({ kind: 'cylinder', size: [r, r, len], at, rotation: [90, 0, 0], color }) as Prim;

const PLATE: [number, number][] = [
  [0.026, -0.03],
  [0.2, -0.03],
  [0.225, -0.02],
  [0.225, 0.02],
  [0.2, 0.03],
  [0.026, 0.03],
];

export function barbellShape(): EquipmentShape {
  const plate = (x: number): Prim => ({ kind: 'lathe', profile: PLATE, segments: 40, at: [x, 0, 0], rotation: [0, 0, 90], color: rubber }) as Prim;
  return {
    primitive: alongX(0.014, 2.2, [0, 0, 0]),
    extra: [alongX(0.025, 0.38, [-0.9, 0, 0]), alongX(0.025, 0.38, [0.9, 0, 0]), plate(-0.82), plate(0.82)],
  };
}

export function dumbbellShape(): EquipmentShape {
  return { primitive: alongX(0.016, 0.14, [0, 0, 0]), extra: [alongX(0.055, 0.06, [-0.1, 0, 0]), alongX(0.055, 0.06, [0.1, 0, 0])] };
}

export function cableHandleShape(): EquipmentShape {
  return {
    primitive: alongX(0.015, 0.12, [0, 0, 0]),
    extra: [{ kind: 'torus', size: [0.075, 0.006], at: [0, 0.06, 0], color: steel } as Prim],
  };
}

/** A bench whose seat top is at the origin, long axis along Z (head end −Z), back raised `incline`°. */
export function benchShape(incline = 0): EquipmentShape {
  const pad = 0.07;
  const top = -pad / 2;
  const legs: Prim[] = [
    { kind: 'box', size: [0.05, 0.4, 0.26], at: [0, -0.2 - pad, 0.42], color: steel } as Prim,
    { kind: 'box', size: [0.05, 0.4, 0.26], at: [0, -0.2 - pad, -0.42], color: steel } as Prim,
  ];
  if (incline <= 0) return { primitive: { kind: 'bevelBox', size: [0.29, pad, 1.15], bevel: 0.015, at: [0, top, 0], color: rubber } as Prim, extra: legs };
  const a = (incline * Math.PI) / 180;
  const back = 0.75;
  return {
    primitive: { kind: 'bevelBox', size: [0.29, pad, 0.4], bevel: 0.015, at: [0, top, 0.375], color: rubber } as Prim,
    extra: [
      { kind: 'bevelBox', size: [0.29, pad, back], bevel: 0.015, at: [0, top + (back / 2) * Math.sin(a), 0.175 - (back / 2) * Math.cos(a)], rotation: [incline, 0, 0], color: rubber } as Prim,
      ...legs,
    ],
  };
}

/** Two bars `width` apart along Z with their tops at the origin, on posts `height` tall. */
export function parallelBarsShape(width = 0.5, height = 1.1): EquipmentShape {
  const x = width / 2;
  const post = (px: number, pz: number): Prim => ({ kind: 'cylinder', size: [0.02, 0.02, height], at: [px, -height / 2, pz], color: steel }) as Prim;
  return {
    primitive: alongZ(0.025, 1.3, [x, -0.025, 0]),
    extra: [alongZ(0.025, 1.3, [-x, -0.025, 0]), post(x, 0.5), post(x, -0.5), post(-x, 0.5), post(-x, -0.5)],
  };
}
