/**
 * TimeScene data schemas (docs/03 §A).
 *
 * GeoStage topics ship four files in `data/`:
 *   entities.json   participants (who)
 *   control.json    control-area keyframes (where, over time)
 *   movements.json  campaign / route arrows
 *   events.json     battles and other dated events (and static `site` points)
 * and two optional ones:
 *   presets.json    extra named camera presets (VIEW buttons, `<FlyTo>`)
 *   sources.json    numbered sources (shared schema, content/schema/sources.ts)
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
import { sourceId, sourceIds, sourcesFile } from '../../content/schema/sources';
import { compareTime } from '../../lib/time';
import { decodeControl, decodeTopologyObject } from './lib/control';

/* ------------------------------------------------------------------ */
/* entities.json                                                       */
/* ------------------------------------------------------------------ */

export const BLOCS = ['axis', 'allied', 'neutral'] as const;
export const bloc = z.enum(BLOCS);
export type Bloc = z.infer<typeof bloc>;

/** One stretch of an entity's alignment: `bloc` from `from` until `to` (exclusive; open-ended if omitted). */
export const blocSpan = z
  .object({ bloc, from: timePoint, to: timePoint.optional() })
  .strict()
  .superRefine((span, ctx) => {
    if (span.to === undefined) return;
    const cmp = compareTime(span.from, span.to);
    if (cmp === null || cmp >= 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['to'], message: '`to` must be after `from` on the same time scale' });
    }
  });
export type BlocSpan = z.output<typeof blocSpan>;

/**
 * An entity's bloc: one bloc for the whole story, or spans in time order for
 * entities that change sides (Italy 1943: `[{ bloc: "axis", from: "1940-06-10",
 * to: "1943-10-13" }, { bloc: "allied", from: "1943-10-13" }]`).
 */
export const entityBloc = z.union([
  bloc,
  z
    .array(blocSpan)
    .min(1)
    .superRefine((spans, ctx) => {
      for (let i = 1; i < spans.length; i++) {
        const prev = spans[i - 1]!;
        const cur = spans[i]!;
        if (prev.to === undefined) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: [i - 1, 'to'], message: 'only the last span may be open-ended' });
          continue;
        }
        const cmp = compareTime(prev.to, cur.from);
        if (cmp === null || cmp > 0) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: [i, 'from'], message: 'spans must be in time order and must not overlap' });
        }
      }
    }),
]);
export type EntityBloc = z.output<typeof entityBloc>;

export const entitySchema = z
  .object({
    id: kebabId,
    name: bilingual,
    bloc: entityBloc,
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

/** Plain GeoJSON keyframe: `features` inline. */
export const controlKeyframe = z
  .object({
    t: timePoint,
    features: featureCollection(controlFeature),
  })
  .strict();
export type ControlKeyframe = z.output<typeof controlKeyframe>;

/** TopoJSON keyframe: `object` names an entry of the file's shared `topology.objects`. */
export const controlTopologyKeyframe = z
  .object({
    t: timePoint,
    object: z.string().min(1),
  })
  .strict();
export type ControlTopologyKeyframe = z.output<typeof controlTopologyKeyframe>;

const xy = z.tuple([z.number(), z.number()]);

/**
 * A TopoJSON topology, checked loosely: `arcs` is an array of arcs (each an
 * array of >= 2-number positions), `objects` a record of objects with a `type`,
 * `transform` (quantisation) optional. The geometry itself is validated after
 * decoding, as ordinary control features.
 */
export const topologySchema = z
  .object({
    type: z.literal('Topology'),
    arcs: z.array(z.array(z.array(z.number()).min(2))),
    objects: z.record(z.string(), z.object({ type: z.string() }).passthrough()),
    transform: z.object({ scale: xy, translate: xy }).strict().optional(),
    bbox: z.array(z.number()).optional(),
  })
  .passthrough();
export type ControlTopology = z.output<typeof topologySchema>;

function checkKeyframeOrder(keyframes: readonly { t: TimePointInput }[], ctx: z.RefinementCtx): void {
  for (let i = 1; i < keyframes.length; i++) {
    const prev = keyframes[i - 1];
    const cur = keyframes[i];
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
}
type TimePointInput = z.output<typeof timePoint>;

const geoControlFile = z
  .object({ keyframes: z.array(controlKeyframe).min(1) })
  .strict()
  .superRefine((file, ctx) => checkKeyframeOrder(file.keyframes, ctx));
export type GeoControlFile = z.output<typeof geoControlFile>;

const topologyControlFile = z
  .object({ topology: topologySchema, keyframes: z.array(controlTopologyKeyframe).min(1) })
  .strict()
  .superRefine((file, ctx) => {
    checkKeyframeOrder(file.keyframes, ctx);
    file.keyframes.forEach((kf, i) => {
      if (!Object.hasOwn(file.topology.objects, kf.object)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['keyframes', i, 'object'],
          message: `topology has no object "${kf.object}"`,
        });
        return;
      }
      // The geometry is only checked once decoded: every feature must be an ordinary control feature.
      let decoded;
      try {
        decoded = decodeTopologyObject(file.topology, kf.object);
      } catch (error) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['keyframes', i, 'object'], message: `cannot decode "${kf.object}": ${(error as Error).message}` });
        return;
      }
      const result = featureCollection(controlFeature).safeParse(decoded);
      if (!result.success) {
        for (const issue of result.error.issues.slice(0, 10)) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['keyframes', i, 'object', ...issue.path], message: `${kf.object}: ${issue.message}` });
        }
      }
    });
  });
export type TopologyControlFile = z.output<typeof topologyControlFile>;

/**
 * `control.json`: plain GeoJSON keyframes `{ keyframes: [{ t, features }] }`, or
 * one shared topology `{ topology, keyframes: [{ t, object }] }`. The shape is
 * picked by the presence of `topology`, so errors point into the right one.
 * Engines read it through `decodeControl` (lib/control.ts).
 */
export const controlFile = z.unknown().transform((raw, ctx): GeoControlFile | TopologyControlFile => {
  const schema = raw !== null && typeof raw === 'object' && 'topology' in raw ? topologyControlFile : geoControlFile;
  const result = schema.safeParse(raw);
  if (!result.success) {
    for (const issue of result.error.issues) ctx.addIssue(issue);
    return z.NEVER;
  }
  return result.data;
});
export type ControlFile = GeoControlFile | TopologyControlFile;

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
    /** Number of people involved; drives arrow width. Absent or 0 = unknown: no "people" line is shown. */
    strength: z.number().nonnegative().optional(),
    /**
     * Keep the finished line (40% opacity, arrowhead at the end) until this
     * date, then fade it out. Default: the line disappears right after `to`.
     */
    linger: timePoint.optional(),
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
    if (m.linger !== undefined) {
      const lc = compareTime(m.to, m.linger);
      if (lc === null || lc >= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['linger'],
          message: '`linger` must be on the same time scale as `to` and after it',
        });
      }
    }
  });
export type Movement = z.output<typeof movementSchema>;

export const movementsFile = z.array(movementSchema);

/* ------------------------------------------------------------------ */
/* events.json                                                         */
/* ------------------------------------------------------------------ */

export const EVENT_KINDS = [
  'battle',
  'landing',
  'surrender',
  'bombing',
  'political',
  'massacre',
  'siege',
  'evacuation',
  'liberation',
  'atrocity',
  /** A static place (prison, memorial, building): no pulse, ignores `t`, shown on the `sites` layer only. */
  'site',
] as const;
export type EventKind = (typeof EVENT_KINDS)[number];
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
    /** Longer text for the inspector's collapsed "More" block. */
    detail: bilingual.optional(),
    /** Source ids from `data/sources.json` (`["S1", "S7"]`). */
    sources: z.array(sourceId).optional(),
    /** Optional metadata only; nothing is hidden or gated on it. */
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
/* presets.json (optional)                                             */
/* ------------------------------------------------------------------ */

/** Built-in preset ids the engine always registers. */
export const BUILTIN_PRESETS = ['world', 'theatre'] as const;

export const cameraPresetSchema = z
  .object({
    id: kebabId,
    /** Button text (keep it to a word or two) and tooltip. */
    label: bilingual,
    camera: geoCamera,
  })
  .strict();
export type CameraPresetDef = z.output<typeof cameraPresetSchema>;

export const presetsFile = z
  .object({ presets: z.array(cameraPresetSchema) })
  .strict()
  .superRefine((file, ctx) => {
    const seen = new Set<string>(BUILTIN_PRESETS);
    file.presets.forEach((p, i) => {
      if (seen.has(p.id)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['presets', i, 'id'], message: `preset id "${p.id}" is taken` });
      }
      seen.add(p.id);
    });
  });
export type PresetsFile = z.output<typeof presetsFile>;

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
    presets: presetsFile.optional(),
    sources: sourcesFile.optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    const known = new Set(data.entities.map((e) => e.id));
    const check = (id: string, path: (string | number)[]) => {
      if (!known.has(id)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path, message: `unknown entity "${id}"` });
      }
    };
    // An invalid control file already reported its own issues (the transform yields nothing then).
    (Array.isArray(data.control?.keyframes) ? decodeControl(data.control) : []).forEach((kf, k) =>
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
    const sources = sourceIds(data.sources);
    data.events.forEach((e, i) =>
      (e.sources ?? []).forEach((id, j) => {
        if (!sources.has(id)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['events', i, 'sources', j],
            message: data.sources ? `unknown source "${id}" (not in data/sources.json)` : `source "${id}" needs data/sources.json`,
          });
        }
      }),
    );
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
  /** Static `site` events (default off). */
  'sites',
] as const;
export type TimeLayer = (typeof TIME_LAYERS)[number];

/**
 * One presentation beat (PRESENTATION, `P`): where the camera goes, the time,
 * layers and highlight for that step (each optional, on top of the chapter's
 * own target) and the caption shown once the flight is done. `audio` is a
 * site path (under `public/`) played on entering the beat; the presentation
 * still waits for the reader to advance.
 */
export const timeBeat = z
  .object({
    t: timePoint.optional(),
    camera: geoCamera.optional(),
    layers: z.array(z.enum(TIME_LAYERS)).optional(),
    highlight: z.array(kebabId).optional(),
    caption: bilingual,
    audio: z
      .string()
      .regex(/^\/[^\s?#]+\.(mp3|m4a|aac|ogg|opus|wav)$/i, 'audio: a site path such as /audio/ww2/ch07-1.mp3')
      .optional(),
  })
  .strict();
export type TimeBeat = z.output<typeof timeBeat>;

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
    /** The child's question for this chapter (reading panel header when there is no `summary`). */
    question: bilingual.optional(),
    /** One-sentence overview under the chapter title in the reading panel (and the default presentation caption). */
    summary: bilingual.optional(),
    /** One-sentence answer shown under the question. */
    answer: bilingual.optional(),
    /** PRESENTATION beats for this chapter; default = one beat (the chapter's state, `summary` as caption). */
    beats: z.array(timeBeat).min(1).optional(),
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
    ...(data.presets?.presets ?? []).map((p) => ({ kind: 'preset', id: p.id })),
  ];
}

/** Camera preset ids a chapter body may fly to (`<FlyTo preset>`). */
export function timeScenePresetIds(data: TimeSceneGeoData): string[] {
  return (data.presets?.presets ?? []).map((p) => p.id);
}

export function timeChapterRefs(state: TimeChapterState): string[] {
  return [...(state.highlight ?? []), ...(state.beats ?? []).flatMap((b) => b.highlight ?? [])];
}
