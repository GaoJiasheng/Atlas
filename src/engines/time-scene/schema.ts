/**
 * TimeScene data schemas (docs/03 §A).
 *
 * GeoStage topics ship four files in `data/`:
 *   entities.json   participants (who)
 *   control.json    control-area keyframes (where, over time)
 *   movements.json  campaign / route arrows
 *   events.json     battles and other dated events
 *
 * Each file name (without `.json`) becomes a key of the parsed data object.
 * This module is build-time only (zod); client code imports its *types* only.
 */
import { z } from 'zod';
import {
  bilingual,
  colorRef,
  kebabId,
  lngLat,
  theme,
  timePoint,
} from '../../content/schema/common';
import { areaGeometry, feature, featureCollection, lineString } from '../../content/schema/geojson';
import { geoCamera } from '../../content/schema/camera';
import { compareTime } from '../../lib/time';

/* ------------------------------------------------------------------ */
/* entities.json                                                       */
/* ------------------------------------------------------------------ */

export const BLOCS = ['axis', 'allied', 'neutral'] as const;
export const bloc = z.enum(BLOCS);
export type Bloc = z.infer<typeof bloc>;

export const entitySchema = z
  .object({
    id: kebabId,
    name: bilingual,
    bloc,
    /** Date the entity entered the story (e.g. joined the war). */
    joined: timePoint,
    left: timePoint.optional(),
    /** Override the bloc colour. Prefer a token. */
    color: colorRef.optional(),
  })
  .strict();
export type Entity = z.output<typeof entitySchema>;

export const entitiesFile = z.array(entitySchema);

/* ------------------------------------------------------------------ */
/* control.json                                                        */
/* ------------------------------------------------------------------ */

export const controlProperties = z
  .object({
    /** Entity id holding this area at the keyframe time. */
    holder: kebabId,
    label: bilingual.optional(),
  })
  .passthrough();

export const controlFeature = feature(areaGeometry, controlProperties);
export type ControlFeature = z.output<typeof controlFeature>;

export const controlKeyframe = z
  .object({
    t: timePoint,
    features: featureCollection(controlFeature),
  })
  .strict();
export type ControlKeyframe = z.output<typeof controlKeyframe>;

export const controlFile = z
  .object({ keyframes: z.array(controlKeyframe).min(1) })
  .strict()
  .superRefine((file, ctx) => {
    for (let i = 1; i < file.keyframes.length; i++) {
      const prev = file.keyframes[i - 1];
      const cur = file.keyframes[i];
      if (!prev || !cur) continue;
      const cmp = compareTime(prev.t, cur.t);
      if (cmp === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['keyframes', i, 't'],
          message: 'keyframes mix date and geological time scales',
        });
      } else if (cmp >= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['keyframes', i, 't'],
          message: 'keyframes must be in strictly ascending time order',
        });
      }
    }
  });
export type ControlFile = z.output<typeof controlFile>;

/* ------------------------------------------------------------------ */
/* movements.json                                                      */
/* ------------------------------------------------------------------ */

export const MOVEMENT_KINDS = ['land', 'sea', 'air'] as const;

export const movementSchema = z
  .object({
    id: kebabId,
    from: timePoint,
    to: timePoint,
    path: lineString,
    holder: kebabId,
    /** Number of people involved; drives arrow width and Counter widgets. */
    strength: z.number().nonnegative(),
    label: bilingual,
    kind: z.enum(MOVEMENT_KINDS),
  })
  .strict()
  .superRefine((m, ctx) => {
    const cmp = compareTime(m.from, m.to);
    if (cmp === null || cmp > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['to'],
        message: '`to` must be on the same time scale as `from` and not before it',
      });
    }
  });
export type Movement = z.output<typeof movementSchema>;

export const movementsFile = z.array(movementSchema);

/* ------------------------------------------------------------------ */
/* events.json                                                         */
/* ------------------------------------------------------------------ */

export const EVENT_KINDS = ['battle', 'landing', 'surrender', 'bombing', 'political'] as const;
export const EVENT_RESULTS = ['attacker', 'defender', 'draw', 'inconclusive'] as const;

const forceTable = z.record(kebabId, z.number().nonnegative());

export const eventSchema = z
  .object({
    id: kebabId,
    t: timePoint,
    until: timePoint.optional(),
    at: lngLat,
    kind: z.enum(EVENT_KINDS),
    /** Required for battle / landing / bombing; optional for the others. */
    sides: z.object({ attacker: kebabId, defender: kebabId }).strict().optional(),
    forces: forceTable.optional(),
    casualties: forceTable.optional(),
    /** Required for battle / landing. */
    result: z.enum(EVENT_RESULTS).optional(),
    importance: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    title: bilingual,
    summary: bilingual,
    sensitive: z.boolean().default(false),
  })
  .strict()
  .superRefine((e, ctx) => {
    if ((e.kind === 'battle' || e.kind === 'landing' || e.kind === 'bombing') && !e.sides) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['sides'], message: `${e.kind} events need sides` });
    }
    if ((e.kind === 'battle' || e.kind === 'landing') && !e.result) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['result'], message: `${e.kind} events need a result` });
    }
    if (e.until !== undefined) {
      const cmp = compareTime(e.t, e.until);
      if (cmp === null || cmp > 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['until'], message: '`until` must not be before `t`' });
      }
    }
  });
export type SceneEvent = z.output<typeof eventSchema>;

export const eventsFile = z.array(eventSchema);

/* ------------------------------------------------------------------ */
/* Whole-topic data                                                    */
/* ------------------------------------------------------------------ */

/** Parsed `data/*.json` of a GeoStage topic, keyed by file name. */
export const timeSceneGeoData = z
  .object({
    entities: entitiesFile,
    control: controlFile,
    movements: movementsFile,
    events: eventsFile,
  })
  .strict()
  .superRefine((data, ctx) => {
    const known = new Set(data.entities.map((e) => e.id));
    const check = (id: string, path: (string | number)[]) => {
      if (!known.has(id)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path, message: `unknown entity "${id}"` });
      }
    };
    data.control.keyframes.forEach((kf, k) =>
      kf.features.features.forEach((f, i) =>
        check(f.properties.holder, ['control', 'keyframes', k, 'features', 'features', i, 'properties', 'holder']),
      ),
    );
    data.movements.forEach((m, i) => check(m.holder, ['movements', i, 'holder']));
    data.events.forEach((e, i) => {
      if (e.sides) {
        check(e.sides.attacker, ['events', i, 'sides', 'attacker']);
        check(e.sides.defender, ['events', i, 'sides', 'defender']);
      }
      for (const key of Object.keys(e.forces ?? {})) check(key, ['events', i, 'forces', key]);
      for (const key of Object.keys(e.casualties ?? {})) check(key, ['events', i, 'casualties', key]);
    });
  });
export type TimeSceneGeoData = z.output<typeof timeSceneGeoData>;

/**
 * DiagramStage data (SVG keyframes) is specified in Phase 2. Until then any
 * object is accepted so a diagram topic can be scaffolded.
 */
export const timeSceneDiagramData = z.record(z.string(), z.unknown());

export type TimeSceneData = TimeSceneGeoData;

/* ------------------------------------------------------------------ */
/* Chapter state                                                       */
/* ------------------------------------------------------------------ */

/** GeoStage layers (docs/03 §A). */
export const TIME_LAYERS = [
  'base',
  'control',
  'borders',
  'movements',
  'battles',
  'participation',
  'labels',
] as const;
export type TimeLayer = (typeof TIME_LAYERS)[number];

/** `state:` in a TimeScene chapter's frontmatter. */
export const timeChapterState = z
  .object({
    /** Target time for the chapter (`t` in the URL). */
    time: timePoint.optional(),
    camera: geoCamera.optional(),
    layers: z.array(z.enum(TIME_LAYERS)).optional(),
    /** Event / movement / entity ids to emphasise. */
    highlight: z.array(kebabId).optional(),
    theme: theme.optional(),
    /** The child's question for this chapter (panel 02 QUESTION). */
    question: bilingual.optional(),
    /** One-sentence answer shown under the question. */
    answer: bilingual.optional(),
  })
  .strict()
  .refine((s) => !s.answer || s.question, { message: '`answer` needs a `question`', path: ['answer'] });
export type TimeChapterState = z.output<typeof timeChapterState>;

/* ------------------------------------------------------------------ */
/* Id helpers for the validator                                        */
/* ------------------------------------------------------------------ */

export function timeSceneIds(data: TimeSceneGeoData): { kind: string; id: string }[] {
  return [
    ...data.entities.map((e) => ({ kind: 'entity', id: e.id })),
    ...data.movements.map((m) => ({ kind: 'movement', id: m.id })),
    ...data.events.map((e) => ({ kind: 'event', id: e.id })),
  ];
}

export function timeChapterRefs(state: TimeChapterState): string[] {
  return state.highlight ?? [];
}
