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

/** Equipment the exercise mode draws (docs/16 §6.5). */
export const EQUIPMENT_KINDS = ['barbell', 'dumbbell', 'bench', 'cable-handle', 'parallel-bars', 'floor'] as const;
export type EquipmentKind = (typeof EQUIPMENT_KINDS)[number];

/** Phases of an exercise key: a beat shows one, or loops through them (`loop`). */
export const EXERCISE_KEY_PHASES = ['start', 'mid', 'end'] as const;
export type ExerciseKeyPhase = (typeof EXERCISE_KEY_PHASES)[number];
export const EXERCISE_PHASES = ['start', 'end', 'loop'] as const;
export type ExercisePhase = (typeof EXERCISE_PHASES)[number];
