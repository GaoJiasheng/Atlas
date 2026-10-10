/**
 * SpaceScene data schemas (docs/03 §B).
 *
 * A space topic ships `data/parts.json` containing parts, groups, flows,
 * animations and camera views. The parsed engine data is `{ parts: PartsFile }`
 * (keyed by file name like every engine).
 *
 * This module is build-time only (zod); client code imports its *types* only.
 */
import { z } from 'zod';
import { bilingual, colorRef, KEBAB_ID, kebabId, level, theme, vec3 } from '../../content/schema/common';
import { orbitCamera } from '../../content/schema/camera';
import { sourcesFile } from '../../content/schema/sources';
import { glossaryFile } from '../../content/schema/glossary';
import { detailSourceIds } from './lib/detail';
import { GROUP_LABEL_PREFIX } from './lib/labels';

/* ------------------------------------------------------------------ */
/* Parts                                                               */
/* ------------------------------------------------------------------ */

/**
 * Primitive shapes for "building-block" models. `size` meaning per kind
 * (scene units, mirrors the three.js geometry constructors):
 *   box       [width, height, depth]
 *   cylinder  [radiusTop, radiusBottom, height]
 *   cone      [radius, height]
 *   sphere    [radius]
 *   torus     [radius, tube]
 *   capsule   [radius, length]
 *   plane     [width, height]
 */
export const PRIMITIVE_KINDS = ['box', 'cylinder', 'cone', 'sphere', 'torus', 'capsule', 'plane'] as const;

/**
 * Engineered parts (docs/08 §4), each with its own parameters:
 *   bevelBox  {size: [w, h, d], bevel}            box with a real rounded bevel on every edge
 *   tube      {path: [[x,y,z]...], radius, bendRadius?}  pipe along a polyline (points relative
 *             to `at`); every corner is bent with the same radius (default 3 × radius)
 *   flange    {radius, thickness, boltCount, boltRadius}  disc in the XZ plane (axis Y) with
 *             `boltCount` hex bolt heads on the bolt circle `boltRadius`
 *   fins      {size: [a, b, t], count, gap, axis}  `count` plates a × b, thickness t, stacked
 *             along `axis` (x | y | z) with a clear `gap` between plates
 *   vessel    {radius, length, headRatio}          cylinder along Y (`length` = straight shell)
 *             with domed heads of depth radius × headRatio (0.5 = 2:1 ellipsoidal head)
 *   panelHole {size: [w, h, t], hole: {r, at: [x, y]}}  flat panel w × h in its XY plane,
 *             thickness t along Z, with one round through-hole of radius r centred at
 *             (x, y) from the panel centre (e.g. a fan opening); the hole has a wall
 */
export const ENGINEERED_KINDS = ['bevelBox', 'tube', 'flange', 'fins', 'vessel', 'panelHole'] as const;

const PRIMITIVE_ARITY: Record<(typeof PRIMITIVE_KINDS)[number], number> = {
  box: 3,
  cylinder: 3,
  cone: 2,
  sphere: 1,
  torus: 2,
  capsule: 2,
  plane: 2,
};

/**
 * Material families (docs/08 §4, master-spec E). The engine builds each one
 * per theme (colour, metalness, roughness, procedural brushed / orange-peel
 * maps). `metal` and `matte` are older names kept as aliases of `steel` and
 * `plastic`. `enamel` is warm-white baked enamel (appliance casings), `brass`
 * the yellow alloy of valves and flare nuts.
 */
export const MATERIAL_PRESETS = [
  'casing',
  'steel',
  'powder',
  'stainless',
  'copper',
  'rubber',
  'plastic',
  'glass',
  'enamel',
  'brass',
  'metal',
  'matte',
] as const;

const positive = z.number().positive();
const positiveVec3 = z.tuple([positive, positive, positive]);

/** Fields every primitive has: placement and material. */
const placement = {
  /** Position of the part centre. */
  at: vec3,
  /** Euler rotation in degrees (XYZ). */
  rotation: vec3.optional(),
  color: z.union([z.enum(MATERIAL_PRESETS), colorRef]),
  /**
   * Base colour override for a material family (`token:<name>` or `#hex`):
   * keeps the family's metalness, roughness and surface map, e.g. a
   * light-grey `powder` casing. Ignored when `color` is already a colour.
   */
  tint: colorRef.optional(),
};

export const primitiveSchema = z
  .discriminatedUnion('kind', [
    z.object({ kind: z.enum(PRIMITIVE_KINDS), size: z.array(positive).min(1).max(3), ...placement }).strict(),
    z.object({ kind: z.literal('bevelBox'), size: positiveVec3, bevel: positive, ...placement }).strict(),
    z
      .object({
        kind: z.literal('tube'),
        path: z.array(vec3).min(2).max(64),
        radius: positive,
        bendRadius: positive.optional(),
        ...placement,
      })
      .strict(),
    z
      .object({
        kind: z.literal('flange'),
        radius: positive,
        thickness: positive,
        boltCount: z.number().int().min(3).max(64),
        boltRadius: positive,
        ...placement,
      })
      .strict(),
    z
      .object({
        kind: z.literal('fins'),
        size: positiveVec3,
        count: z.number().int().min(2).max(512),
        gap: positive,
        axis: z.enum(['x', 'y', 'z']).default('x'),
        ...placement,
      })
      .strict(),
    z
      .object({
        kind: z.literal('vessel'),
        radius: positive,
        length: z.number().nonnegative(),
        headRatio: z.number().min(0).max(1).default(0.5),
        ...placement,
      })
      .strict(),
    z
      .object({
        kind: z.literal('panelHole'),
        size: positiveVec3,
        hole: z.object({ r: positive, at: z.tuple([z.number(), z.number()]).default([0, 0]) }).strict(),
        ...placement,
      })
      .strict(),
  ])
  .superRefine((p, ctx) => {
    const issue = (path: (string | number)[], message: string) =>
      ctx.addIssue({ code: z.ZodIssueCode.custom, path, message });
    switch (p.kind) {
      case 'bevelBox':
        if (p.bevel * 2 >= Math.min(...p.size)) issue(['bevel'], `bevel ${p.bevel} must be less than half the smallest size`);
        break;
      case 'tube': {
        p.path.forEach((pt, i) => {
          const prev = p.path[i - 1];
          if (prev && Math.hypot(pt[0] - prev[0], pt[1] - prev[1], pt[2] - prev[2]) < 1e-6)
            issue(['path', i], 'repeats the previous point');
        });
        if (p.bendRadius !== undefined && p.bendRadius < p.radius)
          issue(['bendRadius'], `bendRadius ${p.bendRadius} is tighter than the pipe radius ${p.radius}`);
        break;
      }
      case 'flange':
        if (p.boltRadius >= p.radius) issue(['boltRadius'], `bolt circle ${p.boltRadius} must be inside radius ${p.radius}`);
        break;
      case 'fins':
        break;
      case 'vessel':
        if (p.length === 0 && p.headRatio === 0) issue(['length'], 'a vessel needs a length or domed heads');
        break;
      case 'panelHole': {
        const [w, h] = p.size;
        const { r, at } = p.hole;
        if (Math.abs(at[0]) + r >= w / 2 || Math.abs(at[1]) + r >= h / 2)
          issue(['hole'], `hole (r ${r} at ${at.join(', ')}) must lie inside the ${w} × ${h} panel`);
        break;
      }
      default: {
        const want = PRIMITIVE_ARITY[p.kind];
        if (p.size.length !== want) issue(['size'], `${p.kind} needs ${want} size value(s), got ${p.size.length}`);
      }
    }
  });
export type Primitive = z.output<typeof primitiveSchema>;

/**
 * Repeat a part as instances (one draw call): `count` copies along `axis`
 * `spacing` apart, centred on `at` (linear), or `count` copies on a circle of
 * `radius` around `axis` through `at`, each turned to face outwards (radial).
 * Axes are in scene coordinates.
 */
export const repeatSchema = z.union([
  z.object({ count: z.number().int().min(2).max(512), axis: vec3, spacing: positive }).strict(),
  z.object({ count: z.number().int().min(2).max(512), axis: vec3, radius: positive }).strict(),
]);
export type PartRepeat = z.output<typeof repeatSchema>;

export const partSchema = z
  .object({
    id: kebabId,
    name: bilingual,
    /** Required, except for `context` parts (which may stand outside every group). */
    group: kebabId.optional(),
    summary: bilingual,
    /**
     * "Tell me more" text. Blank lines (`\n\n`) split paragraphs; `[S3]` or
     * `[S3, S7]` cite data/sources.json and render as source superscripts.
     */
    detail: bilingual,
    /** Mesh name inside a glb model; the name is the part id's counterpart. */
    mesh: z.string().min(1).optional(),
    primitive: primitiveSchema.optional(),
    /** Instanced copies of the primitive (see repeatSchema). */
    repeat: repeatSchema.optional(),
    /** Exploded-view move (dir is normalised). Default: none (context parts never move). */
    explode: z.object({ dir: vec3, dist: z.number().nonnegative() }).strict().default({ dir: [0, 1, 0], dist: 0 }),
    connects: z.array(kebabId).default([]),
    /**
     * Outer skin (casing, cover, insulation): in X-RAY only parts flagged
     * `shell` turn see-through and the rest stay solid. When no part of the
     * topic is a shell, X-RAY ghosts every part but the selected one.
     */
    shell: z.boolean().optional(),
    /**
     * Scenery, not a part of the machine (e.g. a slice of wall): drawn, but
     * never labelled, selected, numbered, counted, put in the part-chain card
     * or exploded, and casts no shadow unless `castShadow` says so.
     */
    context: z.boolean().optional(),
    /** Override the automatic shadow choice (only parts ≥ 28 % of the model radius cast). */
    castShadow: z.boolean().optional(),
    /** Planning metadata only; never rendered. */
    level: level.optional(),
  })
  .strict()
  .refine((p) => p.mesh !== undefined || p.primitive !== undefined, {
    message: 'a part needs either `mesh` or `primitive`',
    path: ['primitive'],
  })
  .refine((p) => p.group !== undefined || p.context === true, {
    message: 'a part needs a `group` (only `context: true` parts may omit it)',
    path: ['group'],
  })
  .refine((p) => p.repeat === undefined || Math.hypot(...p.repeat.axis) > 1e-9, {
    message: 'repeat axis must not be zero',
    path: ['repeat', 'axis'],
  });
export type Part = z.output<typeof partSchema>;

/* ------------------------------------------------------------------ */
/* Groups, flows, animations, views                                    */
/* ------------------------------------------------------------------ */

export const groupSchema = z
  .object({
    id: kebabId,
    name: bilingual,
    color: colorRef,
  })
  .strict();
export type PartGroup = z.output<typeof groupSchema>;

/** Defaults of the optional flow parameters (today's look). */
export const FLOW_DEFAULTS = { count: 360, size: 1, spread: 0.012 } as const;
export const MAX_FLOW_PARTICLES = 1024;
export const MAX_FLOW_STOPS = 6;

export const flowStopSchema = z.object({ at: z.number().min(0).max(1), color: colorRef }).strict();
export type FlowStop = z.output<typeof flowStopSchema>;

export const flowSchema = z
  .object({
    id: kebabId,
    group: kebabId,
    /** Polyline in scene coordinates the particles travel along. */
    path: z.array(vec3).min(2),
    /** Scene units per second. */
    speed: z.number().positive(),
    /** Particle colour without `stops`; with `stops`, the colour of the legend swatch. */
    color: colorRef,
    /**
     * Colour along the path (`at` = arc-length fraction 0..1, ascending, ≤ 6):
     * each particle takes the colour interpolated (linear RGB) at its position.
     */
    stops: z.array(flowStopSchema).min(2).max(MAX_FLOW_STOPS).optional(),
    /**
     * `fade` (default): particles fade in / out over the first 5 % / last 8 %
     * of an open path. `open`: no fade, so flows laid end to end (one segment's
     * last point = the next one's first) read as one stream without gaps.
     * Closed loops (last point = first) never fade.
     */
    ends: z.enum(['fade', 'open']).default('fade'),
    /** Particles (default 360, ≤ 1024). Keep particles per metre × speed similar across joined segments. */
    count: z.number().int().min(8).max(MAX_FLOW_PARTICLES).default(FLOW_DEFAULTS.count),
    /** Particle size as a multiple of the theme's default size. */
    size: z.number().positive().max(4).default(FLOW_DEFAULTS.size),
    /** Jitter around the centre line, scene units: a number = ball radius; [x, y, z] = half-extents of a box on the scene axes. */
    spread: z.union([z.number().nonnegative(), z.tuple([z.number().nonnegative(), z.number().nonnegative(), z.number().nonnegative()])]).default(FLOW_DEFAULTS.spread),
    /** `false`: the cutaway plane does not cut this flow (air outside the machine). */
    clip: z.boolean().default(true),
    /**
     * Parts the stream passes, in order. While it runs, the part-chain card
     * colours the line between each consecutive pair (with the stop colour at
     * that point of the chain) and marches it.
     */
    parts: z.array(kebabId).min(2).optional(),
    whenRun: z.boolean().default(true),
  })
  .strict()
  .superRefine((f, ctx) => {
    f.stops?.forEach((s, i) => {
      const prev = f.stops![i - 1];
      if (prev && s.at < prev.at) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['stops', i, 'at'], message: 'stops must be in ascending `at` order' });
    });
  });
export type Flow = z.output<typeof flowSchema>;

const animationBase = {
  id: kebabId,
  /** Part id to animate. */
  target: kebabId,
  whenRun: z.boolean().default(true),
};

export const animationSchema = z.discriminatedUnion('kind', [
  z.object({ ...animationBase, kind: z.literal('rotate'), axis: vec3, rpm: z.number() }).strict(),
  z
    .object({
      ...animationBase,
      kind: z.literal('oscillate'),
      axis: vec3,
      /** Peak swing in degrees. */
      amplitude: z.number().nonnegative(),
      /** Swings per second. */
      hz: z.number().positive(),
    })
    .strict(),
  z
    /** `scale` is the peak scale factor (e.g. 1.15), `hz` breaths per second. */
    .object({ ...animationBase, kind: z.literal('pulse'), scale: z.number().positive(), hz: z.number().positive() })
    .strict(),
]);
export type PartAnimation = z.output<typeof animationSchema>;

export const SPACE_VIEWS = ['assembled', 'xray', 'exploded', 'isolate'] as const;
export type SpaceView = (typeof SPACE_VIEWS)[number];

const viewPreset = z.object({ camera: orbitCamera }).strict();

/**
 * Cutaway plane used when `cutaway: half`. Everything on the side the
 * `normal` points away from is cut off: points p with dot(normal, p) + offset < 0
 * are clipped (three.js Plane semantics). Default: normal [-1, 0, 0], offset 0
 * (keeps x <= 0, i.e. removes the right half).
 */
export const cutawayPlaneSchema = z
  .object({
    normal: vec3,
    offset: z.number().default(0),
  })
  .strict();
export type CutawayPlane = z.output<typeof cutawayPlaneSchema>;

/**
 * Elevation plane of the ARCHITECTURE panel and the REFERENCE camera:
 * `xy` = front elevation (seen from +Z, default), `zy` = side (from +X),
 * `xz` = plan (from +Y).
 */
export const SECTION_PLANES = ['xy', 'zy', 'xz'] as const;
export type SectionPlane = (typeof SECTION_PLANES)[number];

export const viewsSchema = z
  .object({
    assembled: viewPreset.optional(),
    xray: viewPreset.optional(),
    exploded: viewPreset.optional(),
    isolate: viewPreset.optional(),
    /** Optional cutaway plane (see cutawayPlaneSchema). */
    cutaway: cutawayPlaneSchema.optional(),
    /** Optional elevation plane for the ARCHITECTURE panel and REFERENCE view. */
    section: z.object({ plane: z.enum(SECTION_PLANES) }).strict().optional(),
    /** Optional REFERENCE camera; default: a long-lens straight view on the section plane. */
    reference: viewPreset.optional(),
  })
  .strict();
export type ViewPresets = z.output<typeof viewsSchema>;

/** VIEW preset ids the engine registers itself (named presets may not use them). */
export const RESERVED_PRESET_IDS = ['orbit', 'reference'] as const;
/** Named camera presets in parts.json (after the chapter presets, ORBIT and REF. the digit keys reach up to 9). */
export const MAX_NAMED_PRESETS = 6;

/**
 * Named camera preset (docs/12 §7.4, G7): a VIEW button after the chapter
 * presets, ORBIT and REF.; `<FlyTo preset>` and a beat's `camera: "<id>"`
 * name it. `view` (optional) switches the view with the camera.
 */
export const cameraPresetSchema = z
  .object({
    id: kebabId,
    label: bilingual,
    camera: orbitCamera,
    view: z.enum(SPACE_VIEWS).optional(),
  })
  .strict();
export type CameraPreset = z.output<typeof cameraPresetSchema>;

/* ------------------------------------------------------------------ */
/* parts.json                                                          */
/* ------------------------------------------------------------------ */

/** docs/12 §1.2 fact discipline: a source-backed typical range, this design's own value, or a simulated reading. */
export const SPEC_TAGS = ['typical', 'design', 'sim'] as const;

/**
 * Title-block spec row from data (after the host's rows and the engine's
 * PARTS row; the title block shows 8 rows at most). `tag: sim` draws the SIM
 * chip; `typical` / `design` are fact-discipline metadata (no chip).
 */
export const specRowSchema = z
  .object({
    key: bilingual,
    /** A plain string (numbers, units, codes: mono face) or bilingual words. */
    value: z.union([z.string().trim().min(1), bilingual]),
    tag: z.enum(SPEC_TAGS).optional(),
  })
  .strict();
export type SpecRowData = z.output<typeof specRowSchema>;
export const MAX_SPEC_ROWS = 4;

/**
 * Simulated STATE reading: eases toward `run` while the scene runs and back
 * toward `idle` when it stops, as a first-order lag with time constant `lag`
 * seconds: x(t) = target + (x0 − target) · e^(−t / lag).
 */
export const telemetrySchema = z
  .object({
    key: bilingual,
    /** Shown after the value, e.g. `rpm`, `MPa abs`, `°C`. */
    unit: z.string().trim().max(12),
    idle: z.number(),
    run: z.number(),
    /** Time constant, seconds. */
    lag: z.number().positive().max(120),
    /** Decimal places (default: as many as `idle` / `run` are written with, at most 3). */
    decimals: z.number().int().min(0).max(3).optional(),
  })
  .strict();
export type TelemetryRow = z.output<typeof telemetrySchema>;
export const MAX_TELEMETRY_ROWS = 6;

export const partsFile = z
  .object({
    /**
     * glb model for parts that use `mesh`, as a site path under `public/`
     * (e.g. `/models/aircon.glb`; the engine prefixes the base). Required when
     * any part has `mesh`.
     */
    model: z
      .string()
      .regex(/^\/models\/[a-z0-9][a-z0-9._-]*\.glb$/, 'must be /models/<name>.glb')
      .optional(),
    parts: z.array(partSchema).min(1),
    groups: z.array(groupSchema).default([]),
    flows: z.array(flowSchema).default([]),
    animations: z.array(animationSchema).default([]),
    views: viewsSchema.default({}),
    /** Title-block spec rows (≤ 4; see specRowSchema). */
    spec: z.array(specRowSchema).max(MAX_SPEC_ROWS).optional(),
    /** Simulated STATE-panel readings (≤ 6; see telemetrySchema); replace the default rows after RUN. */
    telemetry: z.array(telemetrySchema).min(1).max(MAX_TELEMETRY_ROWS).optional(),
    /** Named camera presets (≤ 6; see cameraPresetSchema). */
    presets: z.array(cameraPresetSchema).min(1).max(MAX_NAMED_PRESETS).optional(),
  })
  .strict()
  .superRefine((file, ctx) => {
    file.presets?.forEach((p, i) => {
      if ((RESERVED_PRESET_IDS as readonly string[]).includes(p.id))
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['presets', i, 'id'], message: `"${p.id}" is the engine's own preset id` });
    });
    const parts = new Set(file.parts.map((p) => p.id));
    const groups = new Set(file.groups.map((g) => g.id));
    const contextIds = new Set(file.parts.filter((p) => p.context).map((p) => p.id));
    file.parts.forEach((p, i) => {
      if (p.group !== undefined && !groups.has(p.group)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['parts', i, 'group'], message: `unknown group "${p.group}"` });
      }
      p.connects.forEach((c, j) => {
        if (!parts.has(c)) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['parts', i, 'connects', j], message: `unknown part "${c}"` });
        } else if (contextIds.has(c) || p.context) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['parts', i, 'connects', j], message: 'context parts take no part in `connects`' });
        }
      });
    });
    file.flows.forEach((f, i) => {
      if (!groups.has(f.group)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['flows', i, 'group'], message: `unknown group "${f.group}"` });
      }
      f.parts?.forEach((id, j) => {
        if (!parts.has(id)) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['flows', i, 'parts', j], message: `unknown part "${id}"` });
        else if (contextIds.has(id)) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['flows', i, 'parts', j], message: `"${id}" is a context part` });
      });
    });
    if (file.model === undefined) {
      file.parts.forEach((p, i) => {
        if (p.mesh !== undefined && p.primitive === undefined) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['parts', i, 'mesh'],
            message: 'a part with `mesh` needs a top-level `model` (glb path)',
          });
        }
      });
    }
    file.animations.forEach((a, i) => {
      if (!parts.has(a.target)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['animations', i, 'target'],
          message: `unknown part "${a.target}"`,
        });
      }
    });
  });
export type PartsFile = z.output<typeof partsFile>;

/** Parsed `data/*.json` of a SpaceScene topic, keyed by file name. */
/** `parts.json`, plus the optional shared `sources.json` (content/schema/sources.ts). */
export const spaceSceneData = z
  .object({ parts: partsFile, sources: sourcesFile.optional(), glossary: glossaryFile.optional() })
  .strict()
  .superRefine((data, ctx) => {
    // `[S#]` markers in part details must cite data/sources.json.
    const known = new Set((data.sources?.sources ?? []).map((s) => s.id));
    data.parts.parts.forEach((p, i) => {
      for (const lang of ['en', 'zh'] as const) {
        for (const id of detailSourceIds(p.detail[lang])) {
          if (known.has(id)) continue;
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['parts', 'parts', i, 'detail', lang],
            message: data.sources ? `[${id}]: unknown source (not in data/sources.json)` : `[${id}]: the topic has no data/sources.json`,
          });
        }
      }
    });
  });
export type SpaceSceneData = z.output<typeof spaceSceneData>;

/* ------------------------------------------------------------------ */
/* Chapter state                                                       */
/* ------------------------------------------------------------------ */

/** A leader-label target: a part id, or `group:<group id>` (one placard at the group's bounding centre). */
export const labelRef = z
  .string()
  .refine((v) => KEBAB_ID.test(v.startsWith(GROUP_LABEL_PREFIX) ? v.slice(GROUP_LABEL_PREFIX.length) : v), {
    message: 'a part id or group:<group id> (kebab-case)',
  });

/** Leader labels in one presentation beat at most (docs/12 §8 G1). */
export const MAX_BEAT_LABELS = 6;

/**
 * One presentation beat (PRESENTATION, `P`), on top of its chapter's state:
 * every field is optional and only changes what it names; `hide` and
 * `labels` replace the chapter's for this beat (not cumulative). `camera` is
 * an orbit camera or the id of a named preset (`presets` in parts.json; the
 * camera only, not the preset's view). The caption shows once the camera has
 * settled; `audio` is a site path (under `public/`) played on entering the beat.
 */
export const spaceBeat = z
  .object({
    view: z.enum(SPACE_VIEWS).optional(),
    part: kebabId.nullable().optional(),
    explode: z.number().min(0).max(1).optional(),
    run: z.boolean().optional(),
    cutaway: z.enum(['none', 'half']).optional(),
    camera: z.union([orbitCamera, kebabId]).optional(),
    layers: z.array(kebabId).optional(),
    labels: z.array(labelRef).max(MAX_BEAT_LABELS).optional(),
    hide: z.array(kebabId).optional(),
    caption: bilingual,
    audio: z
      .string()
      .regex(/^\/[^\s?#]+\.(mp3|m4a|aac|ogg|opus|wav)$/i, 'audio: a site path such as /audio/aircon/ch03-1.mp3')
      .optional(),
  })
  .strict();
export type SpaceBeat = z.output<typeof spaceBeat>;

/** `state:` in a SpaceScene chapter's frontmatter (a "step"). */
export const spaceChapterState = z
  .object({
    part: kebabId.nullable().optional(),
    view: z.enum(SPACE_VIEWS).optional(),
    explode: z.number().min(0).max(1).optional(),
    run: z.boolean().optional(),
    /** Visible groups (e.g. refrigerant, air, electrical). */
    layers: z.array(kebabId).optional(),
    camera: orbitCamera.optional(),
    cutaway: z.enum(['none', 'half']).optional(),
    theme: theme.optional(),
    /**
     * Parts (or `group:<id>` groups) that get leader labels in this chapter
     * (default: every visible part, capped by camera distance).
     */
    labels: z.array(labelRef).optional(),
    /**
     * Parts put aside in this chapter (not cumulative: a chapter without
     * `hide` shows every part). They slide out along their explode direction
     * and fade (~0.6 s), and come back the same way.
     */
    hide: z.array(kebabId).optional(),
    /** One-sentence overview under the chapter title in the reading panel (and the default presentation caption). */
    summary: bilingual.optional(),
    /** The child's question for this chapter (reading panel header when there is no `summary`). */
    question: bilingual.optional(),
    /** PRESENTATION beats for this chapter; default = one beat (the chapter's state, `summary` as caption). */
    beats: z.array(spaceBeat).min(1).optional(),
  })
  .strict();
export type SpaceChapterState = z.output<typeof spaceChapterState>;

/* ------------------------------------------------------------------ */
/* Id helpers for the validator                                        */
/* ------------------------------------------------------------------ */

export function spaceSceneIds(data: SpaceSceneData): { kind: string; id: string }[] {
  const f = data.parts;
  return [
    ...f.parts.map((p) => ({ kind: 'part', id: p.id })),
    ...f.groups.map((g) => ({ kind: 'group', id: g.id })),
    ...f.flows.map((x) => ({ kind: 'flow', id: x.id })),
    ...f.animations.map((a) => ({ kind: 'animation', id: a.id })),
    ...(f.presets ?? []).map((p) => ({ kind: 'preset', id: p.id })),
  ];
}

/** Camera preset ids a chapter body may fly to (`<FlyTo preset>`): the named presets of parts.json. */
export function spacePresetIds(data: SpaceSceneData): string[] {
  return (data.parts.presets ?? []).map((p) => p.id);
}

/**
 * What a chapter state (and each of its beats) names that the data does not
 * have: `part` / `hide` must be parts (not context ones), `labels` parts or
 * `group:<id>` groups, `layers` groups, a beat's string `camera` a named preset.
 */
export function spaceChapterIssues(state: SpaceChapterState, data: SpaceSceneData): string[] {
  const f = data.parts;
  const parts = new Map(f.parts.map((p) => [p.id, p]));
  const groups = new Set(f.groups.map((g) => g.id));
  const presets = new Set(spacePresetIds(data));
  const out: string[] = [];
  const check = (where: string, s: Pick<SpaceBeat, 'part' | 'hide' | 'labels' | 'layers'> & { camera?: unknown }) => {
    const part = (field: string, id: string, selectable: boolean) => {
      const p = parts.get(id);
      if (!p) out.push(`${where}${field}: unknown part "${id}"`);
      else if (selectable && p.context) out.push(`${where}${field}: "${id}" is a context part (never selected or labelled)`);
    };
    if (s.part) part('part', s.part, true);
    for (const id of s.hide ?? []) part('hide', id, false);
    for (const id of s.labels ?? []) {
      if (!id.startsWith(GROUP_LABEL_PREFIX)) part('labels', id, true);
      else if (!groups.has(id.slice(GROUP_LABEL_PREFIX.length))) out.push(`${where}labels: unknown group "${id.slice(GROUP_LABEL_PREFIX.length)}"`);
    }
    for (const id of s.layers ?? []) if (!groups.has(id)) out.push(`${where}layers: unknown group "${id}"`);
    if (typeof s.camera === 'string' && !presets.has(s.camera))
      out.push(`${where}camera: unknown preset "${s.camera}" (not in parts.json presets)`);
  };
  check('state.', state);
  state.beats?.forEach((b, i) => check(`state.beats.${i}.`, b));
  return out;
}
