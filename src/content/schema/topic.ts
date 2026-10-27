import { z } from 'zod';
import { bilingual, kebabId, level, theme } from './common';
import { TOKEN_NAMES } from '../../theme/theme';
import { monthlyLayerSchema } from '../../engines/time-scene/lib/climate';
import { sourceId } from './sources';

/** The six fixed top-level categories, in display order. */
export const SUBJECTS = [
  'science',
  'math',
  'history',
  'geography',
  'biology',
  'computer',
] as const;
export const subject = z.enum(SUBJECTS);
export type Subject = z.infer<typeof subject>;

export const ENGINES = ['time-scene', 'space-scene', 'simulation', 'math-scene'] as const;
export const engineId = z.enum(ENGINES);
export type EngineId = z.infer<typeof engineId>;

/** Stages each engine knows how to render (docs/03). */
export const ENGINE_STAGES = {
  'time-scene': ['geo', 'diagram'],
  'space-scene': ['model3d', 'layer2d'],
  simulation: ['chart', 'diagram'],
  'math-scene': ['svg'],
} as const satisfies Record<EngineId, readonly string[]>;

/** Bloc names a topic may override; each needs both languages (the site-wide `time.bloc.*` strings are the fallback). */
export const BLOC_LABEL_KEYS = ['axis', 'allied', 'neutral', 'out'] as const;
export const blocLabels = z
  .object({
    axis: bilingual.optional(),
    allied: bilingual.optional(),
    neutral: bilingual.optional(),
    out: bilingual.optional(),
  })
  .strict();
export type BlocLabels = z.output<typeof blocLabels>;

/** `[west, south, east, north]` in degrees: west < east, south < north (no antimeridian crossing). */
export const lngLatBox = z
  .tuple([z.number().min(-180).max(180), z.number().min(-85).max(85), z.number().min(-180).max(180), z.number().min(-85).max(85)])
  .refine(([w, s, e, n]) => w < e && s < n, 'bounds must be [west, south, east, north] with west < east and south < north');
export type LngLatBox = z.output<typeof lngLatBox>;

/**
 * A regional plate (docs/06 "TimeScene" · 区域底图): the stage shows one region
 * only. `bounds` is the plate (land is drawn inside it; outside it the sheet is
 * plain paper, no coastline); `maxBounds` the camera limit (default: `bounds`
 * plus 8 % of its span on each side), so the reader can never pan or zoom out
 * to the rest of the world. `land` names `public/geo/<land>.json` (TopoJSON,
 * one object `<land>` with `kind: land` polygons and `kind: coast` lines, made
 * by `scripts/geo/lib/region-land.ts`); `rivers` names an optional
 * `public/geo/<rivers>.json` of dated river lines (lib/rivers.ts). No world
 * land, no modern borders in this mode.
 */
export const regionBasemap = z
  .object({
    bounds: lngLatBox,
    maxBounds: lngLatBox.optional(),
    land: kebabId,
    rivers: kebabId.optional(),
  })
  .strict()
  .superRefine((r, ctx) => {
    if (!r.maxBounds) return;
    const [w, s, e, n] = r.bounds;
    const [mw, ms, me, mn] = r.maxBounds;
    if (mw > w || ms > s || me < e || mn < n) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['maxBounds'], message: '`maxBounds` must contain `bounds`' });
  });
export type RegionBasemap = z.output<typeof regionBasemap>;

/**
 * TimeScene basemap options (docs/06 "TimeScene" · 底图数据). Either `local`,
 * a high-resolution island land file `public/geo/<local>.json` (TopoJSON with
 * `kind: mask` and `kind: land` geometries, built by
 * `scripts/geo/lib/local-land.ts`) drawn over the Natural Earth layers from
 * zoom 9.4, or `region`, a regional plate instead of the world map (above).
 * `maxZoom` changes the map's zoom ceiling (default 10).
 */
export const basemapOptions = z
  .object({
    local: kebabId.optional(),
    region: regionBasemap.optional(),
    maxZoom: z.number().min(6).max(16).optional(),
  })
  .strict()
  .refine((b) => (b.local === undefined) !== (b.region === undefined), 'basemap needs exactly one of `local` or `region`');
export type BasemapOptions = z.output<typeof basemapOptions>;

/**
 * TimeScene wording a topic may override (entity card, entity leader notes):
 * `joined` ("Joined" / "joined 1941"), `left` ("Left"), `notYet` ("Not yet at
 * war"). A history of states writes `joined: { en: "appears", zh: "出现" }`,
 * `left: { en: "ends", zh: "灭亡" }`.
 */
export const ENTITY_STRING_KEYS = ['joined', 'left', 'notYet'] as const;
export const entityStrings = z
  .object({
    joined: bilingual.optional(),
    left: bilingual.optional(),
    notYet: bilingual.optional(),
  })
  .strict();
export type EntityStrings = z.output<typeof entityStrings>;

/** Opt-in mission vocabulary and story-range participation lines. */
export const timePresentation = z.object({
  mode: z.literal('missions'),
  showArea: z.literal(false),
  eventsLabel: bilingual.refine((text) => text.zh.trim().length > 0, 'Chinese text is required'),
  entityLabel: bilingual.refine((text) => text.zh.trim().length > 0, 'Chinese text is required'),
}).strict();
export type TimePresentation = z.output<typeof timePresentation>;

/** Built-in GeoStage layer ids; topic-defined layers share this namespace. */
export const BUILTIN_TIME_LAYER_IDS = ['base', 'control', 'borders', 'movements', 'battles', 'participation', 'labels', 'sites'] as const;

/** A static TopoJSON overlay whose features carry numeric `[f, u)` dates. */
export const datedLayerDef = z
  .object({
    id: kebabId,
    file: kebabId,
    kind: z.enum(['point', 'line', 'area']),
    holder: kebabId.optional(),
    color: z.string().refine((value) => value.startsWith('token:') && TOKEN_NAMES.some((name) => value === `token:${name}`), 'must reference a known theme token: token:<name>').optional(),
    label: bilingual,
    count: z.boolean().optional(),
    /** The PLATE row's short name (`HDB blocks` / `组屋`); defaults to `label`. */
    countLabel: bilingual.optional(),
  })
  .strict()
  .refine((layer) => layer.holder !== undefined || layer.color !== undefined, { path: ['color'], message: 'a dated layer needs `holder` or `color`' })
  .refine((layer) => layer.countLabel === undefined || layer.count === true, { path: ['countLabel'], message: '`countLabel` needs `count: true`' });
export type DatedLayerDef = z.output<typeof datedLayerDef>;

export const datedLayers = z.array(datedLayerDef).superRefine((layers, ctx) => {
  const seen = new Set<string>(BUILTIN_TIME_LAYER_IDS);
  layers.forEach((layer, i) => {
    if (seen.has(layer.id)) ctx.addIssue({ code: z.ZodIssueCode.custom, path: [i, 'id'], message: `layer id "${layer.id}" is taken` });
    seen.add(layer.id);
  });
});

/** `src/content/topics/<slug>/topic.yaml` (docs/02). */
export const climatologyPeriod = z.object({
  periodId: kebabId,
  startYear: z.number().int(),
  endYear: z.number().int(),
  initialMonth: z.number().int().min(1).max(12),
  /** Sources for the KEY's display rules (rain bins, arrow scale), shown beside each layer's data sources. */
  keySources: z.array(sourceId).optional(),
}).strict().refine((p) => p.startYear <= p.endYear, { path: ['endYear'], message: 'endYear must be at least startYear' });
export type ClimatologyPeriod = z.output<typeof climatologyPeriod>;

export const topicSchema = z
  .object({
    id: kebabId,
    title: bilingual,
    subtitle: bilingual,
    subject,
    /** Content-planning metadata (school levels the topic targets); never rendered. */
    levels: z.array(level).min(1).optional(),
    /** Planning metadata (e.g. `beyond-syllabus`, `singapore`); never rendered. */
    tags: z.array(kebabId).optional(),
    moe: z.array(z.string().min(1)).default([]),
    /** Index badge: `time`, `space`, `both`, or `lesson` (a guided lesson with practice, MathScene). */
    mode: z.enum(['time', 'space', 'both', 'lesson']),
    engine: engineId,
    stage: z.string().min(1),
    theme: theme.default('paper'),
    /** Optional metadata only; nothing is hidden or gated on it. */
    sensitivity: z.enum(['open', 'guarded']).default('open'),
    status: z.enum(['draft', 'ready', 'published']).default('draft'),
    /** Path relative to the topic directory, e.g. `./cover.jpg`. */
    cover: z.string().min(1).optional(),
    /**
     * Home-page drawing: file stem under `public/illustrations/` (`<stem>.webp` + `<stem>@2x.webp`,
     * made by `scripts/illustrate.ts`). Missing or not yet drawn = a dotted placeholder plate.
     */
    illustration: kebabId.optional(),
    /** Short name for the drawing's leader label in the frontispiece (EN small caps + 中文); defaults to the title. */
    shortTitle: bilingual.optional(),
    /**
     * Shown in the home frontispiece (at most five, published topics with a drawing only).
     * `true`, or a rank: 1 takes the largest slot, then 2, 3 …; plain `true` comes after the ranked ones.
     */
    featured: z.union([z.boolean(), z.number().int().min(1).max(99)]).default(false),
    /**
     * TimeScene: per-topic names of the engine's blocs (legend, entity inspector, leader notes),
     * overriding the site-wide `time.bloc.*` strings. `out` = "no longer at war".
     */
    blocLabels: blocLabels.optional(),
    /** TimeScene: island- / city-scale basemap (`{ local: land-sg, maxZoom: 13 }`) or a regional plate (`{ region: { bounds, land, rivers } }`). */
    basemap: basemapOptions.optional(),
    /** TimeScene GeoStage: dated GPU overlays from public/geo/<file>.json. */
    datedLayers: datedLayers.optional(),
    temporalMode: z.enum(['chronological', 'climatology']).default('chronological'),
    climatology: climatologyPeriod.optional(),
    monthlyLayers: z.array(monthlyLayerSchema).min(1).optional(),
    /**
     * TimeScene: `entity` colours every control area by its holder (`entities[].color`,
     * `token:holder-1` … `token:holder-8`, assigned by scripts/geo/lib/colour-holders.ts)
     * and lists every holder in the key; `bloc` (default) colours by bloc.
     */
    colorBy: z.enum(['bloc', 'entity']).optional(),
    /**
     * TimeScene: the finest date precision shown (readout, bar labels, inspectors,
     * `t=` written back to the URL). `year` for topics dated to the year (BCE history).
     */
    datePrecision: z.enum(['day', 'month', 'year']).optional(),
    /** TimeScene: wording overrides for the entity card and entity leader notes (`joined`, `left`, `notYet`). */
    strings: entityStrings.optional(),
    timePresentation: timePresentation.optional(),
    /**
     * Title-block disclaimer line (any engine), replacing the site-wide
     * "Educational visualization", e.g. "Generic design study · not a specific
     * brand or model".
     */
    note: bilingual.optional(),
  })
  .strict()
  .superRefine((topic, ctx) => {
    if (topic.timePresentation !== undefined && (topic.engine !== 'time-scene' || topic.stage !== 'geo'))
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['timePresentation'], message: '`timePresentation` requires time-scene with stage: geo' });
    if (topic.timePresentation !== undefined && topic.temporalMode === 'climatology')
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['timePresentation'], message: '`timePresentation` does not apply to climatology topics' });
    if (topic.temporalMode === 'climatology') {
      if (topic.engine !== 'time-scene' || topic.stage !== 'geo') ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['temporalMode'], message: 'climatology requires time-scene with stage: geo' });
      if (!topic.monthlyLayers) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['monthlyLayers'], message: 'at least one monthly layer is required' });
      if (!topic.climatology) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['climatology'], message: 'climatology period is required' });
      if (topic.datedLayers !== undefined) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['datedLayers'], message: 'climatology does not support datedLayers' });
    } else if (topic.climatology) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['climatology'], message: 'climatology metadata requires temporalMode: climatology' });
    if (topic.monthlyLayers) {
      if (topic.temporalMode !== 'climatology') ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['monthlyLayers'], message: 'monthlyLayers requires climatology mode' });
      const used = new Set<string>([...BUILTIN_TIME_LAYER_IDS, ...(topic.datedLayers ?? []).map((l) => l.id)]);
      topic.monthlyLayers.forEach((layer, i) => {
        if (used.has(layer.id)) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['monthlyLayers', i, 'id'], message: 'layer id must be unique and cannot collide with built-in layers' });
        used.add(layer.id);
        if (layer.periodId !== topic.climatology?.periodId) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['monthlyLayers', i, 'periodId'], message: 'must match climatology.periodId' });
      });
    }
    if (topic.datedLayers !== undefined && (topic.engine !== 'time-scene' || topic.stage !== 'geo'))
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['datedLayers'], message: '`datedLayers` requires time-scene with stage: geo' });
    const stages: readonly string[] = ENGINE_STAGES[topic.engine];
    if (!stages.includes(topic.stage)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['stage'],
        message: `engine "${topic.engine}" has no stage "${topic.stage}" (expected ${stages.join(' | ')})`,
      });
    }
  });

export type TopicInput = z.input<typeof topicSchema>;
export type TopicMeta = z.output<typeof topicSchema>;
