/**
 * Anatomy vocabulary shared by the fitness data schema (build time) and the
 * SpaceScene rig (client): joints, movements and their opposites, muscle
 * layers and roles (docs/16 §4.2). Plain constants, no zod.
 */

/** Joints a muscle action names (no side: `shoulder`, not `shoulder.l`). */
export const ACTION_JOINTS = ['scapula', 'shoulder', 'elbow', 'forearm', 'wrist', 'trunk', 'neck', 'hip', 'knee', 'ankle', 'ribs'] as const;
export type ActionJoint = (typeof ACTION_JOINTS)[number];

/** Movements of a joint (anatomical names; `stabilisation` = holds the joint still). */
export const MOVEMENTS = [
  'flexion',
  'extension',
  'abduction',
  'adduction',
  'horizontal-abduction',
  'horizontal-adduction',
  'internal-rotation',
  'external-rotation',
  'elevation',
  'depression',
  'protraction',
  'retraction',
  'upward-rotation',
  'downward-rotation',
  'pronation',
  'supination',
  'lateral-flexion',
  'rotation',
  'plantarflexion',
  'dorsiflexion',
  'inversion',
  'eversion',
  'inspiration',
  'expiration',
  'stabilisation',
] as const;
export type Movement = (typeof MOVEMENTS)[number];

/**
 * Pairs of opposite movements: a rig that defines the axis of one drives the
 * other with the angle negated (extension 20° = flexion −20°).
 */
export const OPPOSITE_MOVEMENTS: Readonly<Partial<Record<Movement, Movement>>> = {
  flexion: 'extension',
  extension: 'flexion',
  abduction: 'adduction',
  adduction: 'abduction',
  'horizontal-abduction': 'horizontal-adduction',
  'horizontal-adduction': 'horizontal-abduction',
  'internal-rotation': 'external-rotation',
  'external-rotation': 'internal-rotation',
  elevation: 'depression',
  depression: 'elevation',
  protraction: 'retraction',
  retraction: 'protraction',
  'upward-rotation': 'downward-rotation',
  'downward-rotation': 'upward-rotation',
  pronation: 'supination',
  supination: 'pronation',
  plantarflexion: 'dorsiflexion',
  dorsiflexion: 'plantarflexion',
  inversion: 'eversion',
  eversion: 'inversion',
  inspiration: 'expiration',
  expiration: 'inspiration',
};

/** Muscle layers (the topic's groups `superficial` / `intermediate` / `deep`). */
export const MUSCLE_LAYERS = ['superficial', 'intermediate', 'deep'] as const;
export type MuscleLayer = (typeof MUSCLE_LAYERS)[number];

/** A muscle's part in a movement. */
export const ACTION_ROLES = ['prime', 'assist', 'stabilise'] as const;
export type ActionRole = (typeof ACTION_ROLES)[number];

/**
 * A rig joint name: kebab-case, optionally with a side suffix (`shoulder.l`,
 * `elbow.r`, `trunk`). The side is the body's own (left = +X).
 */
export const JOINT_NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*(?:\.[lr])?$/;

/** `shoulder.l` → `shoulder`; `trunk` → `trunk`. */
export function jointBase(name: string): string {
  return name.replace(/\.[lr]$/, '');
}

/** `shoulder.l` → `shoulder.r` (and back); names without a side stay. */
export function otherSideJoint(name: string): string {
  if (name.endsWith('.l')) return `${name.slice(0, -2)}.r`;
  if (name.endsWith('.r')) return `${name.slice(0, -2)}.l`;
  return name;
}

/**
 * Equipment the exercise mode draws (docs/16 §6.5, docs/06 动作模式数据手册):
 * held in the palms (`barbell`, `dumbbell`, `kettlebell`, `cable-handle`,
 * `lat-bar`), a cable from a column or overhead pulley (`cable`), a band
 * from an anchor (`band`), or free-standing (`bench`, `incline-bench`,
 * `machine-seat`, `pull-up-bar`, `dip-bars`, `step`, `floor`, a `wall` to lean
 * on, a `post` to steady a hand, a `back-extension` bench), or scenery that
 * frames the lift (a `rack` with J-hooks at the bar, a `machine-frame` around
 * a machine seat).
 */
export const EQUIPMENT_KINDS = [
  'barbell',
  'dumbbell',
  'kettlebell',
  'cable-handle',
  'cable',
  'lat-bar',
  'band',
  'bench',
  'incline-bench',
  'machine-seat',
  'pull-up-bar',
  'dip-bars',
  'step',
  'floor',
  'wall',
  'post',
  'back-extension',
  'rack',
  'machine-frame',
] as const;
export type EquipmentKind = (typeof EQUIPMENT_KINDS)[number];

/** An exercise motion's `equipment` (one spec or a list) as a list. */
export function equipmentList<T>(equipment: T | readonly T[] | undefined): T[] {
  return equipment === undefined ? [] : Array.isArray(equipment) ? [...(equipment as readonly T[])] : [equipment as T];
}

/**
 * What holds the body still in an exercise (docs/06 动作模式数据手册): the
 * palms on a bar or the floor (`hands`, or one palm: `hand.l` / `hand.r`), the
 * feet on the floor, the knees on the floor or a bench, the seat on a bench.
 */
export const CONTACT_KINDS = ['hands', 'hand.l', 'hand.r', 'feet', 'knees', 'seat'] as const;
export type ContactKind = (typeof CONTACT_KINDS)[number];

/** How the body reads in exercise mode (SpaceScene `views.exerciseBody`; docs/06 动作模式数据手册): ink wire figure, solid mannequin, or the faint skin outline. */
export const EXERCISE_BODIES = ['wire', 'mannequin', 'ghost'] as const;
export type ExerciseBody = (typeof EXERCISE_BODIES)[number];

/** Phases of an exercise key: a beat shows one, or loops through them (`loop`). */
export const EXERCISE_KEY_PHASES = ['start', 'mid', 'end'] as const;
export type ExerciseKeyPhase = (typeof EXERCISE_KEY_PHASES)[number];
export const EXERCISE_PHASES = ['start', 'end', 'loop'] as const;
export type ExercisePhase = (typeof EXERCISE_PHASES)[number];
