/**
 * Shared fitness data (docs/16 §4): one muscle sheet per muscle and one card
 * per exercise, written once and used by every muscle topic.
 *
 *   src/content/shared/fitness/muscles/<region>.json    { "muscles": [ … ] }
 *   src/content/shared/fitness/exercises/<pattern>.json { "exercises": [ … ] }
 *   src/content/shared/fitness/sources.json             { "sources": [ { "id": "M1", … } ] }
 *
 * A topic links into it with `muscle` on a part (parts.json) and the exercise
 * ids in its `data/training.json`. The build merges only what a topic uses
 * into its data.json as `fitness` (`withSharedFitness`), so pages stay small.
 * Shared sources are numbered `M#` and cited like a topic's `S#`.
 *
 * Training text is principles only (docs/16 §0 decision 11): `dose` is words,
 * no sets × reps; every exercise card carries the safety line (UI string).
 */
import { z } from 'zod';
import { bilingual, kebabId, vec3 } from './common';
import { sharedSourceEntry, sharedSourceId } from './sources';
import {
  ACTION_JOINTS,
  ACTION_ROLES,
  CONTACT_KINDS,
  EQUIPMENT_KINDS,
  equipmentList,
  EXERCISE_KEY_PHASES,
  JOINT_NAME,
  MOVEMENTS,
  MUSCLE_LAYERS,
  type EquipmentKind,
} from '../../lib/anatomy';

/** Shared source refs (`M#`). */
/** Source ids, each once (they key the source chips). */
const refs = z
  .array(sharedSourceId)
  .default([])
  .refine((ids) => new Set(ids).size === ids.length, { message: 'a source is cited twice in one list' });

/* ------------------------------------------------------------------ */
/* Muscles                                                             */
/* ------------------------------------------------------------------ */

export const FIBRE_ARRANGEMENTS = ['parallel', 'fusiform', 'convergent', 'unipennate', 'bipennate', 'multipennate'] as const;

const attachment = z
  .object({
    text: bilingual,
    /** Bones it attaches to (part ids of the topic's skeleton parts, where present). */
    bones: z.array(kebabId).min(1),
    s: refs,
  })
  .strict();

export const muscleAction = z
  .object({
    joint: z.enum(ACTION_JOINTS),
    movement: z.enum(MOVEMENTS),
    role: z.enum(ACTION_ROLES),
    s: refs,
  })
  .strict();
export type MuscleAction = z.output<typeof muscleAction>;

export const muscleSheet = z
  .object({
    /** Globally unique; a part links it with `muscle`. */
    id: kebabId,
    /** The whole muscle of a head or part (that entry exists too and holds what they share). */
    parent: kebabId.optional(),
    name: bilingual,
    /** Card and leader-label name when the full name is long ("PEC MAJ · CLAV"). */
    short: bilingual.optional(),
    /** Gym name, shown in brackets. */
    common: bilingual.optional(),
    latin: z.string().trim().min(1).optional(),
    fma: z.string().regex(/^FMA\d+$/, 'FMA ids look like FMA34687').optional(),
    /** Node name in the Z-Anatomy source (pipeline bookkeeping). */
    zAnatomy: z.string().trim().min(1).optional(),
    /** Body regions (topic regions) it belongs to. */
    regions: z.array(kebabId).min(1),
    layer: z.enum(MUSCLE_LAYERS),
    origin: attachment,
    insertion: attachment,
    fibres: z.object({ arrangement: z.enum(FIBRE_ARRANGEMENTS), direction: bilingual }).strict(),
    actions: z.array(muscleAction).default([]),
    /** Where to feel it on your own body. */
    feel: bilingual,
    /** The commonest mistakes when training it (≤ 3). */
    mistakes: z.array(bilingual).max(3).default([]),
    /** Exercises that train it, in order (ids of shared exercises; 3–5 for a muscle a topic labels). */
    exercises: z.array(kebabId).max(8).default([]),
    /** One line (≤ 60 characters): the inspector summary and the leader-label note. */
    summary: bilingual,
    /** "Tell me more": blank lines split paragraphs, `[M3]` cites a shared source. */
    detail: bilingual,
    /** Injuries, general knowledge only (chapter 06). */
    injury: bilingual.optional(),
  })
  .strict();
export type MuscleSheet = z.output<typeof muscleSheet>;

export const musclesFile = z.object({ muscles: z.array(muscleSheet) }).strict();

/* ------------------------------------------------------------------ */
/* Exercises                                                           */
/* ------------------------------------------------------------------ */

export const EXERCISE_EQUIPMENT = ['barbell', 'dumbbell', 'machine', 'cable', 'bodyweight', 'band', 'kettlebell'] as const;
export const EXERCISE_PATTERNS = [
  'horizontal-push',
  'vertical-push',
  'horizontal-pull',
  'vertical-pull',
  'hinge',
  'squat',
  'lunge',
  'carry',
  'anti-extension',
  'anti-rotation',
  'flexion',
  'isolation',
] as const;
export const EXERCISE_LEVELS = ['beginner', 'intermediate'] as const;

/** Joint angles in degrees by movement (`{ "flexion": 85, "abduction": 10 }`), along the rig's anatomical axes. */
export const jointAngles = z
  .record(z.enum(MOVEMENTS), z.number().min(-180).max(180))
  .refine((r) => !('stabilisation' in r), { message: '`stabilisation` is not an angle' });
export type JointAngles = z.output<typeof jointAngles>;

export const jointName = z.string().regex(JOINT_NAME, 'a joint name such as shoulder.l, elbow.r or trunk');

/** Contraction per muscle (shared muscle id) or part: 0 = lengthened / at rest, 1 = shortest. */
export const contractMap = z.record(kebabId, z.number().min(0).max(1));

/** Which hand holds a piece (held equipment, a cable, a band): both by default. */
export const EQUIPMENT_HANDS = ['left', 'right', 'both'] as const;

/** Fields each equipment kind may use besides `kind` (docs/06 动作模式数据手册; the rest are refused). */
const EQUIPMENT_FIELDS: Record<EquipmentKind, readonly string[]> = {
  barbell: ['grip', 'width', 'on', 'at'],
  dumbbell: ['grip', 'hand', 'hold'],
  kettlebell: ['grip', 'hand', 'hold'],
  'cable-handle': ['grip', 'width', 'hand'],
  cable: ['grip', 'hand', 'handle', 'at', 'turn', 'to'],
  'lat-bar': ['grip', 'width', 'at'],
  band: ['hand', 'to', 'at'],
  bench: ['at', 'turn', 'incline'],
  'incline-bench': ['at', 'turn', 'angle'],
  'machine-seat': ['at', 'turn', 'angle', 'height', 'thighPad'],
  'pull-up-bar': ['grip', 'width', 'turn', 'height'],
  'dip-bars': ['at', 'height'],
  step: ['at', 'turn', 'height'],
  floor: ['at', 'turn'],
  wall: ['at', 'turn', 'height'],
  post: ['at', 'height', 'hand'],
  'back-extension': ['at', 'turn'],
  rack: [],
  'machine-frame': ['at', 'turn', 'height'],
};

export const equipmentSchema = z
  .object({
    kind: z.enum(EQUIPMENT_KINDS),
    grip: z.enum(['pronated', 'supinated', 'neutral']).optional(),
    /** Grip width between the hands, metres (barbell, bars); for the record, the engine follows the hands. */
    width: z.number().positive().max(2).optional(),
    /** Held pieces, `cable` and `band`: the hand that holds it (default both: one in each palm); a cable to an ankle: the hand on the column; `post`: the hand resting on its rail (it stands under that palm). */
    hand: z.enum(EQUIPMENT_HANDS).optional(),
    /** barbell: in the palms (default) or across the upper back (`back`: it rides on the trunk joint, `at` metres in the trunk's rest frame). */
    on: z.enum(['hands', 'back']).optional(),
    /**
     * Free-standing equipment (bench, seat, step, floor, bars): position relative to the trunk joint after the root turn (metres).
     * `cable`: the pulley; `band`: its anchor; `lat-bar`: the overhead pulley (default 0.9 m above the bar); barbell `on: back`: see `on`.
     */
    at: vec3.optional(),
    /** Turn about Y, degrees (bench, seat, step, floor, column). */
    turn: z.number().min(-180).max(180).optional(),
    /** bench: back incline, degrees (0 = flat; `incline-bench` with `angle` says the same). */
    incline: z.number().min(0).max(90).optional(),
    /** incline-bench: back angle above the horizontal (default 30°); machine-seat: back pad recline from vertical (default 10°). */
    angle: z.number().min(0).max(90).optional(),
    /** pull-up-bar: bar above the floor (default 2.3 m); dip-bars: bar tops (1.45 m); step: box height (0.2 m); machine-seat: seat top (0.45 m); wall: 2 m; post: 1.1 m; machine-frame: top beam (2.2 m). */
    height: z.number().positive().max(3).optional(),
    /** cable: a D-handle in each holding hand (default), a straight bar between the palms, or a `rope` (a grip in each palm, two strands to the cable's end). */
    handle: z.enum(['d-handle', 'bar', 'rope']).optional(),
    /** band: what it pulls on (default the hands; `feet`: the balls of the feet); cable: an ankle cuff (`ankle.l` / `ankle.r`) instead of handles. */
    to: z.enum(['hands', 'feet', 'ankle.l', 'ankle.r']).optional(),
    /**
     * dumbbell / kettlebell: how it sits in the palm — `across` the forearm
     * (default), `along` it, `vertical` (on end; with both hands, one held
     * between the palms: a goblet squat), or `both`: one held between the
     * palms, along the arms (a pullover; a goblet with the forearms upright).
     */
    hold: z.enum(['across', 'along', 'vertical', 'both']).optional(),
    /** machine-seat: a pad over the thighs (lat pulldown). */
    thighPad: z.boolean().optional(),
  })
  .strict()
  .superRefine((e, ctx) => {
    const allowed = EQUIPMENT_FIELDS[e.kind];
    for (const key of Object.keys(e))
      if (key !== 'kind' && !allowed.includes(key))
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: [key], message: `\`${key}\` does not apply to ${e.kind} (it takes ${allowed.join(', ') || 'no fields'})` });
    if ((e.kind === 'cable' || e.kind === 'band') && e.at === undefined)
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['at'], message: `${e.kind} needs \`at\` (${e.kind === 'cable' ? 'the pulley' : 'the anchor'}, metres from the trunk joint)` });
    if (e.to !== undefined && (e.kind === 'band' ? e.to.startsWith('ankle') : e.kind === 'cable' && e.to === 'feet'))
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['to'], message: e.kind === 'band' ? 'band: `to` is hands or feet' : 'cable: `to` is hands or an ankle cuff (ankle.l / ankle.r)' });
    if (e.kind === 'back-extension' && e.at === undefined)
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['at'], message: 'back-extension needs `at` (the top of the hip pad, metres from the trunk joint)' });
    if (e.kind === 'barbell' && e.on === 'back' && e.at === undefined)
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['at'], message: 'a barbell on the back needs `at` (metres from the trunk joint, in its rest frame)' });
  });
export type EquipmentSpec = z.output<typeof equipmentSchema>;

export const motionKey = z
  .object({
    phase: z.enum(EXERCISE_KEY_PHASES),
    /** This key's whole-body turn (`motion.root` form), when the body tilts between keys (a curl-up); the motion's `root` otherwise. */
    root: z.object({ rotation: vec3, offset: vec3.optional() }).strict().optional(),
    joints: z.record(jointName, jointAngles).default({}),
    /** Optional override: contraction per muscle (else computed from the joints and the muscle sheets' actions, lib/contraction.ts). */
    contract: contractMap.optional(),
  })
  .strict();

/** Exercise camera override: the direction the camera looks from, relative to the body (the engine still fits the distance). */
export const exerciseCamera = z
  .object({
    /** Degrees about the vertical from in front of the body (0) toward its left side (90); 180 = behind. */
    azimuth: z.number().min(-180).max(180),
    /** Degrees above the horizontal. */
    elevation: z.number().min(-20).max(80),
    /** Share of the frame height the figure fills when it is the tall side (default 0.68, at least 0.6). */
    fill: z.number().min(0.6).max(0.9).optional(),
  })
  .strict();
export type ExerciseCameraSpec = z.output<typeof exerciseCamera>;

export const exerciseMotion = z
  .object({
    /** Whole-body turn into the exercise position (bench press: lying on the back), XYZ degrees about the trunk joint, then `offset` metres. */
    root: z.object({ rotation: vec3, offset: vec3.optional() }).strict().optional(),
    equipment: z.union([equipmentSchema, z.array(equipmentSchema).min(1).max(4)]).optional(),
    /**
     * What holds the body, in priority order (lib/contact.ts): `hands` (the
     * palms stay where the first key puts them — on a pull-up bar, dip bars or
     * the floor — and the body moves), `hand.l` / `hand.r` (one palm: a
     * one-arm row's hand on the bench), `feet` (planted on the floor),
     * `knees` (kneeling: their midpoint stays), `seat` (the body stays where
     * the root turn puts it). The first is met exactly; with a hand (or both)
     * first and the feet or knees second on the floor or a bench the body
     * pivots about them so the palm stays on it (push-up, plank; bird dog). Default from the equipment: hands for
     * a pull-up bar / dip bars, `[hands, feet]` for the floor with the palms
     * on it, feet when standing, else none.
     */
    contacts: z
      .array(z.enum(CONTACT_KINDS))
      .max(2)
      .refine((c) => new Set(c).size === c.length, { message: 'a contact is listed once' })
      .optional(),
    /**
     * Standing exercises keep the feet planted (the body drops and shifts so the
     * lowest heel / ball stays on the floor): `both` (default), or the one foot
     * that stays (`left` / `right`: a reverse lunge steps the other back, a cable
     * abduction swings it out); `free` for a body that hangs (a hanging knee
     * raise: the feet leave the floor).
     */
    feet: z.enum(['both', 'left', 'right', 'free']).optional(),
    /** Two or three keys (`start`, optional `mid`, `end`), in that order. */
    keys: z.array(motionKey).min(2).max(3),
    /** Seconds for start → end, hold at end, end → start, hold at start (loop). */
    tempo: z.tuple([z.number().positive(), z.number().nonnegative(), z.number().positive(), z.number().nonnegative()]).optional(),
    /** Camera direction override (default from the posture: side-above lying, side for a hinge, front three-quarter standing). */
    camera: exerciseCamera.optional(),
  })
  .strict()
  .superRefine((m, ctx) => {
    const order = m.keys.map((k) => EXERCISE_KEY_PHASES.indexOf(k.phase));
    if (m.keys[0]?.phase !== 'start' || m.keys[m.keys.length - 1]?.phase !== 'end' || order.some((o, i) => i > 0 && o <= order[i - 1]!))
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['keys'], message: 'keys run start, (mid,) end' });
    const kinds = equipmentList(m.equipment).map((e) => e.kind);
    if (kinds.includes('rack') && !kinds.includes('barbell'))
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['equipment'], message: 'a rack holds a barbell: add the barbell (its J-hooks go where the first key holds the bar)' });
  });
export type ExerciseMotion = z.output<typeof exerciseMotion>;

export const exerciseSheet = z
  .object({
    id: kebabId,
    name: bilingual,
    short: bilingual.optional(),
    equipment: z.enum(EXERCISE_EQUIPMENT),
    pattern: z.enum(EXERCISE_PATTERNS),
    level: z.enum(EXERCISE_LEVELS),
    /** Prime movers, synergists, stabilisers (shared muscle ids). */
    primary: z.array(kebabId).min(1),
    secondary: z.array(kebabId).default([]),
    stabilisers: z.array(kebabId).default([]),
    setup: bilingual,
    steps: z.array(bilingual).min(1).max(8),
    cues: z.array(bilingual).max(4).default([]),
    mistakes: z.array(bilingual).max(3).default([]),
    /** How much and how often, as principles in words (no sets × reps; docs/16 decision 11), each with sources. */
    dose: z.array(z.object({ text: bilingual, s: z.array(sharedSourceId).min(1) }).strict()).default([]),
    /** When to wait or stop (general knowledge). */
    cautions: z.array(bilingual).default([]),
    /** "Research shows …" with sample and conditions. */
    evidence: z.array(z.object({ text: bilingual, s: z.array(sharedSourceId).min(1) }).strict()).default([]),
    /** Two-panel drawing `public/illustrations/exercises/<sketch>.webp` (1200 × 800, single density). */
    sketch: kebabId.optional(),
    /** Exercise mode keyframes (docs/16 §6.5). */
    motion: exerciseMotion.optional(),
    sources: refs,
  })
  .strict();
export type ExerciseSheet = z.output<typeof exerciseSheet>;

export const exercisesFile = z.object({ exercises: z.array(exerciseSheet) }).strict();


/** What a card's `equipment` should show in exercise mode (validate warns when the motion draws none of it). */
export const CARD_EQUIPMENT_DRAWN: Record<(typeof EXERCISE_EQUIPMENT)[number], readonly EquipmentKind[]> = {
  barbell: ['barbell'],
  dumbbell: ['dumbbell'],
  kettlebell: ['kettlebell'],
  cable: ['cable', 'cable-handle', 'lat-bar'],
  band: ['band'],
  machine: ['machine-seat', 'lat-bar', 'cable', 'cable-handle', 'bench', 'incline-bench'],
  bodyweight: [],
};

/* ------------------------------------------------------------------ */
/* A topic's training.json and the merged bundle                       */
/* ------------------------------------------------------------------ */

/** `data/training.json`: the exercises the topic shows, in order, and an optional example session (not a prescription). */
export const trainingFile = z
  .object({
    exercises: z.array(kebabId).min(1),
    /** One principle line for the muscle sheet's TRAINING tab (e.g. how often a week, in words). */
    note: bilingual.optional(),
    session: z
      .object({
        title: bilingual,
        blocks: z.array(z.object({ exercise: kebabId, note: bilingual.optional() }).strict()).min(1),
        note: bilingual.optional(),
        s: refs,
      })
      .strict()
      .optional(),
  })
  .strict();
export type TrainingFile = z.output<typeof trainingFile>;

/** What `withSharedFitness` merges into a topic's data (`fitness`). */
export const fitnessBundle = z
  .object({
    muscles: z.array(muscleSheet),
    exercises: z.array(exerciseSheet),
    sources: z.array(sharedSourceEntry),
  })
  .strict();
export type FitnessBundle = z.output<typeof fitnessBundle>;

/* ------------------------------------------------------------------ */
/* Merge (raw JSON in, raw JSON out; the engine schema parses it)      */
/* ------------------------------------------------------------------ */

/** The shared fitness tree as raw JSON: file stem → file content. */
export interface SharedFitnessRaw {
  muscles: Record<string, unknown>;
  exercises: Record<string, unknown>;
  sources?: unknown;
}

const list = (file: unknown, key: string): Record<string, unknown>[] => {
  const v = file && typeof file === 'object' ? (file as Record<string, unknown>)[key] : undefined;
  return Array.isArray(v) ? v.filter((x): x is Record<string, unknown> => !!x && typeof x === 'object') : [];
};
const strings = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []);

/**
 * A topic's raw data with `fitness` added when it uses shared fitness data
 * (a `training.json`, or a part with `muscle`): the muscles its parts link
 * (and their parents), the exercises its training list and those muscles
 * name, the muscles those exercises name, and every shared source. Unknown
 * ids are skipped here; the schema reports them.
 */
export function withSharedFitness(raw: Record<string, unknown>, shared: SharedFitnessRaw): Record<string, unknown> {
  const partMuscles = list(raw.parts, 'parts')
    .map((p) => p.muscle)
    .filter((m): m is string => typeof m === 'string');
  const training = raw.training;
  if (!training && partMuscles.length === 0) return raw;

  const muscles = new Map<string, Record<string, unknown>>();
  for (const file of Object.values(shared.muscles)) for (const m of list(file, 'muscles')) if (typeof m.id === 'string' && !muscles.has(m.id)) muscles.set(m.id, m);
  const exercises = new Map<string, Record<string, unknown>>();
  for (const file of Object.values(shared.exercises)) for (const e of list(file, 'exercises')) if (typeof e.id === 'string' && !exercises.has(e.id)) exercises.set(e.id, e);

  const pickedMuscles = new Set<string>();
  const addMuscle = (id: string) => {
    // A muscle and its parent chain (cycles stop at the first repeat).
    let cur: string | undefined = id;
    while (cur && muscles.has(cur) && !pickedMuscles.has(cur)) {
      pickedMuscles.add(cur);
      const parent: unknown = muscles.get(cur)!.parent;
      cur = typeof parent === 'string' ? parent : undefined;
    }
  };
  partMuscles.forEach(addMuscle);
  const pickedExercises = new Set<string>(strings((training as { exercises?: unknown } | undefined)?.exercises).filter((id) => exercises.has(id)));
  for (const id of [...pickedMuscles]) for (const e of strings(muscles.get(id)!.exercises)) if (exercises.has(e)) pickedExercises.add(e);
  for (const id of pickedExercises) {
    const e = exercises.get(id)!;
    for (const m of [...strings(e.primary), ...strings(e.secondary), ...strings(e.stabilisers)]) addMuscle(m);
  }
  return {
    ...raw,
    fitness: {
      muscles: [...pickedMuscles].map((id) => muscles.get(id)!),
      exercises: [...pickedExercises].map((id) => exercises.get(id)!),
      sources: list(shared.sources, 'sources'),
    },
  };
}

/* ------------------------------------------------------------------ */
/* Whole-tree checks (pnpm validate)                                   */
/* ------------------------------------------------------------------ */

export interface SharedFitnessParsed {
  /** File stem → parsed file. */
  muscles: Map<string, z.output<typeof musclesFile>>;
  exercises: Map<string, z.output<typeof exercisesFile>>;
  sources: z.output<typeof sharedSourceEntry>[];
}

export interface FitnessIssue {
  level: 'error' | 'warn';
  where: string;
  message: string;
}

const DETAIL_REFS = /\[([SM][1-9]\d*(?:\s*,\s*[SM][1-9]\d*)*)\]/g;
const citedIn = (text: string) => [...text.matchAll(DETAIL_REFS)].flatMap((m) => m[1]!.split(/\s*,\s*/));

/**
 * Cross-references inside the shared tree: ids unique across files, parents,
 * exercise ↔ muscle links, `M#` citations; warnings for the content rules
 * (3–5 exercises a muscle, one-line summaries, no numbers in a dose).
 */
export function sharedFitnessIssues(tree: SharedFitnessParsed): FitnessIssue[] {
  const out: FitnessIssue[] = [];
  const err = (where: string, message: string) => out.push({ level: 'error', where, message });
  const warn = (where: string, message: string) => out.push({ level: 'warn', where, message });
  const sources = new Set(tree.sources.map((s) => s.id));
  const muscleAt = new Map<string, string>();
  const exerciseAt = new Map<string, string>();
  for (const [stem, file] of tree.muscles)
    file.muscles.forEach((m, i) => {
      const where = `muscles/${stem}.json muscles.${i}`;
      if (muscleAt.has(m.id)) err(where, `muscle id "${m.id}" duplicates ${muscleAt.get(m.id)}`);
      else muscleAt.set(m.id, where);
    });
  for (const [stem, file] of tree.exercises)
    file.exercises.forEach((e, i) => {
      const where = `exercises/${stem}.json exercises.${i}`;
      if (exerciseAt.has(e.id)) err(where, `exercise id "${e.id}" duplicates ${exerciseAt.get(e.id)}`);
      else exerciseAt.set(e.id, where);
    });
  const cite = (where: string, ids: readonly string[]) => {
    for (const id of ids) {
      if (id.startsWith('S')) err(where, `[${id}]: shared data cites shared sources (M#) only`);
      else if (!sources.has(id)) err(where, `${id}: unknown shared source (not in shared/fitness/sources.json)`);
    }
  };
  const wholes = new Set([...tree.muscles.values()].flatMap((f) => f.muscles.map((m) => m.parent)).filter((p): p is string => p !== undefined));
  for (const [stem, file] of tree.muscles)
    file.muscles.forEach((m, i) => {
      const where = `muscles/${stem}.json muscles.${i} (${m.id})`;
      if (m.parent !== undefined && !muscleAt.has(m.parent)) err(where, `parent: unknown muscle "${m.parent}"`);
      if (m.parent === m.id) err(where, 'parent: a muscle cannot be its own parent');
      for (const e of m.exercises) if (!exerciseAt.has(e)) err(where, `exercises: unknown exercise "${e}"`);
      if (!wholes.has(m.id) && (m.exercises.length < 3 || m.exercises.length > 5))
        warn(where, `exercises: ${m.exercises.length} listed (3–5 per muscle, docs/16 §4.4)`);
      if (m.summary.en.length > 60) warn(where, `summary: ${m.summary.en.length} characters (one line ≤ 60)`);
      cite(where, [...m.origin.s, ...m.insertion.s, ...m.actions.flatMap((a) => a.s), ...citedIn(m.detail.en), ...citedIn(m.detail.zh)]);
    });
  for (const [stem, file] of tree.exercises)
    file.exercises.forEach((e, i) => {
      const where = `exercises/${stem}.json exercises.${i} (${e.id})`;
      for (const [field, ids] of [
        ['primary', e.primary],
        ['secondary', e.secondary],
        ['stabilisers', e.stabilisers],
      ] as const)
        for (const id of ids) if (!muscleAt.has(id)) err(where, `${field}: unknown muscle "${id}"`);
      for (const id of Object.keys(e.motion?.keys.reduce((acc, k) => ({ ...acc, ...k.contract }), {}) ?? {}))
        if (!muscleAt.has(id)) err(where, `motion contract: unknown muscle "${id}"`);
      const drawn = equipmentList(e.motion?.equipment).map((q) => q.kind);
      const shows = CARD_EQUIPMENT_DRAWN[e.equipment];
      if (e.motion && shows.length > 0 && !drawn.some((k) => shows.includes(k)))
        warn(where, `card equipment "${e.equipment}" but motion.equipment draws none of ${shows.join(' / ')}`);
      e.dose.forEach((d, j) => {
        if (/\d/.test(d.text.en) || /\d/.test(d.text.zh)) warn(`${where} dose.${j}`, 'dose is principles in words, no numbers (docs/16 decision 11)');
      });
      cite(where, [...e.dose.flatMap((d) => d.s), ...e.evidence.flatMap((d) => d.s), ...e.sources]);
    });
  return out;
}
