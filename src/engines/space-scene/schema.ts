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
import {
  bilateralSpec,
  mirrorAnimation,
  mirrorPoint,
  mirrorPrimitive,
  mirrorRepeat,
  mirrorTransform,
  otherSide,
  twinId,
  type BilateralSpec,
  type Side,
} from './lib/bilateral';
import { MAX_POSES, POSE_DURATION } from './lib/pose';

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

/**
 * Shaped parts (docs/06 §SpaceScene, realism round): profiles and fan /
 * heat-exchanger builders. Round kinds turn about their local Y axis like
 * `vessel` and `flange`; turn them with `rotation`.
 *   lathe        {profile: [[r, y]...], segments}  profile revolved about Y (r ≥ 0);
 *                points on the axis (r = 0) close the solid
 *   extrude      {shape: [[x, y]...], holes?, depth, bevel?}  outline in XY extruded along Z,
 *                centred (depth = overall thickness, a bevel rounds the edges inside it)
 *   curvedPanel  {radius, angle, height, thickness, segments}  slice of a cylinder (axis ‖ Y)
 *                spanning `angle`° about +Z; `at` = middle of its outer face
 *   blades       {layout, count, radius, hub, chord, twist, sweep, pitch, thickness, length, discs}
 *                axial: `count` cambered blades from `hub` to `radius` in the XZ plane, blade
 *                angle `pitch`° at the root minus `twist`° at the tip, tip swept `sweep`°
 *                forward, chord growing to `chord` at the tip, plus a domed hub;
 *                barrel: a cross-flow rotor, `count` forward-curved blades of chord `chord`
 *                between `hub` and `radius`, `length` long along Y, held by `discs` discs
 *   coilBank     {rows, cols, pitch, tubeRadius, length, finPitch, finDepth, bends, shape, legs}
 *                finned-tube heat exchanger: `rows` × `cols` tubes along X (`cols` stacked
 *                in Y at `pitch`, `rows` deep in Z, staggered), aluminium fins every
 *                `finPitch`, return bends (`tubeColor`, default copper) at both ends
 *                (`both`), none, or the bends alone (`only`, a separate hairpin part);
 *                `shape: L` bends the bank 90° about Y: leg 0 (`legs[0]`) along X, then
 *                round the corner (radius `corner`) and leg 1 (`legs[1]`) along +Z at −X
 *   grille       rings: concentric wire rings out to `radius` plus `spokes` radial wires,
 *                in the XZ plane (axis Y), wire radius `bar`;
 *                slats: `count` slats `bar` wide across a `size` [w, d, h] frame (XZ plane)
 * Every primitive also takes `mirror` (x | y | z): reflect the shape in its own
 * plane normal to that axis before `rotation` (a left-hand copy of a profile),
 * and `scale` [sx, sy, sz]: stretch it along its own axes first (a sphere
 * becomes an ellipsoid, a lathe an oval shell). Order: scale, mirror, rotation.
 */
export const SHAPED_KINDS = ['lathe', 'extrude', 'curvedPanel', 'blades', 'coilBank', 'grille'] as const;

/**
 * Organic parts (docs/06 §SpaceScene "organisms"; lib/sweep.ts, lib/wing.ts):
 *   sweep  {path: [[x,y,z]...], radius: r | [r per path point], section?, up?, hollow?, rings?, closed?, caps?}
 *          a lofted tube along a smooth (centripetal Catmull-Rom) curve through `path`
 *          (relative to `at`): legs, antennae, gut, vessels, tracheae, nerves.
 *          section: round (default) | flat (= {flat: 0.5}) | u | {flat: h/w} | {u: opening°, flat?};
 *          `flat` squashes the section along `up` (default +Y), a U opens on the side away
 *          from `up`; hollow: wall thickness (a cut shows the lumen); rings: {every, depth}
 *          a groove every `every` units, depth × r deep (segments, annuli, taenidia);
 *          caps: round (default) | flat | none; closed: a loop
 *   wing   {outline: [[x,y]...], veins: [[[x,y]...]...], thickness, fold?: {hinge, segments, lead?, rest?, foldedWidth?}}
 *          a thin membrane in the XY plane (thickness along Z) with vein hairlines on both
 *          faces; `fold` makes it a fan hinged at `hinge` that a pose or a sequence opens
 *          (`fan` 1, as drawn) or folds (0) into `segments` pleats; `rest`: fan at rest (default 0)
 */
export const ORGANIC_KINDS = ['sweep', 'wing'] as const;

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
 * the yellow alloy of valves and flare nuts. Organism families: `chitin`
 * (semi-gloss cuticle, tint it the species' colour), `membrane` (translucent,
 * double-sided: wings, tympana, air sacs), `tissue` (matte soft tissue with a
 * soft-lit look), `muscle` (fibre normal map), `trachea` (white, ringed),
 * `nerve` (pale yellow), `eye` (dark gloss with hexagonal facets).
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
  'chitin',
  'membrane',
  'tissue',
  'muscle',
  'trachea',
  'nerve',
  'eye',
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
  /** Reflect the shape in its own plane normal to this axis (before `rotation`). */
  mirror: z.enum(['x', 'y', 'z']).optional(),
  /** Stretch along the shape's own axes before `mirror` and `rotation` (sphere → ellipsoid). */
  scale: positiveVec3.optional(),
};

const point2 = z.tuple([z.number(), z.number()]);
const outline = z.array(point2).min(3).max(160);

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
    z
      .object({
        kind: z.literal('lathe'),
        profile: z.array(z.tuple([z.number().nonnegative(), z.number()])).min(2).max(96),
        segments: z.number().int().min(6).max(128).default(48),
        ...placement,
      })
      .strict(),
    z
      .object({
        kind: z.literal('extrude'),
        shape: outline,
        holes: z.array(outline).max(16).optional(),
        depth: positive,
        bevel: positive.optional(),
        ...placement,
      })
      .strict(),
    z
      .object({
        kind: z.literal('curvedPanel'),
        radius: positive,
        angle: z.number().positive().max(360),
        height: positive,
        thickness: positive,
        segments: z.number().int().min(2).max(128).default(32),
        ...placement,
      })
      .strict(),
    z
      .object({
        kind: z.literal('blades'),
        layout: z.enum(['axial', 'barrel']).default('axial'),
        count: z.number().int().min(2).max(64),
        radius: positive,
        hub: positive,
        chord: positive,
        twist: z.number().min(-80).max(80).default(0),
        sweep: z.number().min(-80).max(80).default(0),
        pitch: z.number().min(0).max(85).default(30),
        thickness: positive,
        length: positive.optional(),
        discs: z.number().int().min(2).max(24).default(2),
        ...placement,
      })
      .strict(),
    z
      .object({
        kind: z.literal('coilBank'),
        rows: z.number().int().min(1).max(4),
        cols: z.number().int().min(1).max(48),
        pitch: positive,
        tubeRadius: positive,
        length: positive,
        finPitch: positive,
        finDepth: positive,
        bends: z.enum(['both', 'none', 'only']).default('both'),
        shape: z.enum(['flat', 'L']).default('flat'),
        legs: z.tuple([positive, positive]).optional(),
        corner: positive.optional(),
        tubeColor: z.union([z.enum(MATERIAL_PRESETS), colorRef]).default('copper'),
        ...placement,
      })
      .strict(),
    z
      .object({
        kind: z.literal('grille'),
        style: z.enum(['rings', 'slats']),
        radius: positive.optional(),
        size: positiveVec3.optional(),
        count: z.number().int().min(1).max(96),
        spokes: z.number().int().min(0).max(24).default(8),
        bar: positive,
        ...placement,
      })
      .strict(),
    z
      .object({
        kind: z.literal('sweep'),
        path: z.array(vec3).min(2).max(128),
        radius: z.union([positive, z.array(positive).min(2).max(128)]),
        section: z
          .union([
            z.enum(['round', 'flat', 'u']),
            z.object({ flat: z.number().min(0.05).max(1) }).strict(),
            z.object({ u: z.number().min(10).max(300), flat: z.number().min(0.05).max(1).optional() }).strict(),
          ])
          .default('round'),
        up: vec3.optional(),
        hollow: positive.optional(),
        rings: z.object({ every: positive, depth: z.number().min(0).max(0.6) }).strict().optional(),
        closed: z.boolean().default(false),
        caps: z.enum(['round', 'flat', 'none']).default('round'),
        radial: z.number().int().min(6).max(48).optional(),
        segments: z.number().int().min(4).max(512).optional(),
        ...placement,
      })
      .strict(),
    z
      .object({
        kind: z.literal('wing'),
        outline,
        veins: z.array(z.array(point2).min(2).max(64)).max(64).default([]),
        thickness: positive,
        fold: z
          .object({
            hinge: point2,
            segments: z.number().int().min(2).max(24),
            lead: point2.optional(),
            rest: z.number().min(0).max(1).optional(),
            foldedWidth: z.number().min(0.02).max(0.9).optional(),
          })
          .strict()
          .optional(),
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
      case 'lathe':
        if (p.profile.every(([r]) => r < 1e-9)) issue(['profile'], 'a lathe profile needs a point off the axis');
        break;
      case 'extrude':
        if (p.bevel !== undefined && p.bevel * 2 >= p.depth) issue(['bevel'], `bevel ${p.bevel} must be less than half the depth ${p.depth}`);
        break;
      case 'curvedPanel':
        if (p.thickness >= p.radius) issue(['thickness'], `thickness ${p.thickness} must be less than the radius ${p.radius}`);
        break;
      case 'blades':
        if (p.hub >= p.radius) issue(['hub'], `hub ${p.hub} must be inside the radius ${p.radius}`);
        if (p.layout === 'barrel' && p.length === undefined) issue(['length'], 'a barrel rotor needs a `length`');
        break;
      case 'coilBank':
        if (p.shape === 'L' && p.legs === undefined) issue(['legs'], 'an L-shaped bank needs `legs` [along X, along Z]');
        if (p.tubeRadius * 2 >= p.pitch) issue(['tubeRadius'], `tubes of radius ${p.tubeRadius} overlap at pitch ${p.pitch}`);
        if (p.finPitch * 2 > p.length) issue(['finPitch'], 'fin pitch is longer than half the bank');
        break;
      case 'grille':
        if (p.style === 'rings' && p.radius === undefined) issue(['radius'], 'a ring grille needs a `radius`');
        if (p.style === 'slats' && p.size === undefined) issue(['size'], 'a slat grille needs a `size` [w, d, h]');
        break;
      case 'vessel':
        if (p.length === 0 && p.headRatio === 0) issue(['length'], 'a vessel needs a length or domed heads');
        break;
      case 'sweep': {
        p.path.forEach((pt, i) => {
          const prev = p.path[i - 1];
          if (prev && Math.hypot(pt[0] - prev[0], pt[1] - prev[1], pt[2] - prev[2]) < 1e-6) issue(['path', i], 'repeats the previous point');
        });
        if (Array.isArray(p.radius) && p.radius.length !== p.path.length)
          issue(['radius'], `a radius profile needs one value per path point (${p.path.length}), got ${p.radius.length}`);
        const rmin = Array.isArray(p.radius) ? Math.min(...p.radius) : p.radius;
        if (p.hollow !== undefined && p.hollow >= rmin) issue(['hollow'], `wall ${p.hollow} must be thinner than the smallest radius ${rmin}`);
        if (p.closed && p.path.length < 3) issue(['closed'], 'a closed sweep needs at least 3 points');
        if (p.up && Math.hypot(...p.up) < 1e-9) issue(['up'], '`up` must not be zero');
        break;
      }
      case 'wing':
        if (p.fold && p.outline.every(([x, y]) => Math.hypot(x - p.fold!.hinge[0], y - p.fold!.hinge[1]) < 1e-9))
          issue(['fold', 'hinge'], 'the hinge must not be the whole outline');
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

/** Extra primitives a part may carry (each its own material; repeated with the part). */
export const MAX_EXTRA_PRIMITIVES = 16;

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
    /**
     * More primitives belonging to the same part (`at` in scene coordinates,
     * like `primitive`): e.g. a compressor's terminal cover and feet. They
     * move, fade, explode, repeat and animate with the part; the label points
     * at `primitive`. Pieces sharing a material are merged into one draw call.
     */
    extra: z.array(primitiveSchema).min(1).max(MAX_EXTRA_PRIMITIVES).optional(),
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
    /**
     * One side of a symmetric pair (lib/bilateral.ts): the engine adds the mirror
     * twin `<id>-r` (`<id>-l` when `side: right`), reflected in the plane through
     * the origin normal to `axis` (default z), with mirrored explode, animations,
     * pose entries and `connects`. `true` = `{ axis: z, side: left }`;
     * `labelBoth`: leader labels name both sides (default: this side only).
     */
    bilateral: z
      .union([
        z.literal(true),
        z
          .object({
            axis: z.enum(['x', 'y', 'z']).optional(),
            side: z.enum(['left', 'right']).optional(),
            labelBoth: z.boolean().optional(),
          })
          .strict(),
      ])
      .optional(),
    /** Planning metadata only; never rendered. */
    level: level.optional(),
  })
  .strict()
  .refine((p) => p.mesh !== undefined || p.primitive !== undefined, {
    message: 'a part needs either `mesh` or `primitive`',
    path: ['primitive'],
  })
  .refine((p) => p.extra === undefined || p.primitive !== undefined, {
    message: '`extra` needs a main `primitive`',
    path: ['extra'],
  })
  .refine((p) => p.group !== undefined || p.context === true, {
    message: 'a part needs a `group` (only `context: true` parts may omit it)',
    path: ['group'],
  })
  .refine((p) => p.repeat === undefined || Math.hypot(...p.repeat.axis) > 1e-9, {
    message: 'repeat axis must not be zero',
    path: ['repeat', 'axis'],
  });
/**
 * Set by the bilateral expansion (never written in parts.json): `side` of a
 * paired part, the other side's id (`pair`), and on the twin, `twinOf` (the
 * part it mirrors: numbered, carded and labelled through it).
 */
export interface PairInfo {
  side?: Side;
  pair?: string;
  twinOf?: string;
}
export type Part = z.output<typeof partSchema> & PairInfo;

/* ------------------------------------------------------------------ */
/* Groups, flows, animations, views                                    */
/* ------------------------------------------------------------------ */

export const groupSchema = z
  .object({
    id: kebabId,
    name: bilingual,
    color: colorRef,
    /** `false`: the group's parts stay out of the part-chain card (still numbered, labelled, selectable). */
    card: z.boolean().optional(),
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
    /**
     * Also run the mirror image (id `<id>-r`, or `-l` with `side: right`):
     * path reflected like a bilateral part's, `parts` mapped to their twins.
     */
    bilateral: z
      .union([z.literal(true), z.object({ axis: z.enum(['x', 'y', 'z']).optional(), side: z.enum(['left', 'right']).optional() }).strict()])
      .optional(),
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
  /** Point the motion turns / scales about, scene coordinates (a joint); default the part centre. */
  pivot: vec3.optional(),
};

const scaleValue = z.union([positive, positiveVec3]);

/** One transform: about `pivot` scale, then rotate (XYZ Euler, degrees), then `offset`; `fan` opens (1) / folds (0) a wing. */
const transformFields = {
  rotation: vec3.optional(),
  offset: vec3.optional(),
  scale: scaleValue.optional(),
  fan: z.number().min(0).max(1).optional(),
};

export const sequenceKeySchema = z.object({ t: z.number().nonnegative(), ...transformFields }).strict();
export type SequenceKeyData = z.output<typeof sequenceKeySchema>;

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
    /** `scale` is the peak scale factor (e.g. 1.15, or [sx, sy, sz] per axis), `hz` breaths per second. */
    .object({ ...animationBase, kind: z.literal('pulse'), scale: scaleValue, hz: z.number().positive() })
    .strict(),
  z
    /**
     * Keyframe clip: `keys` (t in seconds, ascending, ≤ 32) eased key to key;
     * `loop` (default) repeats it, else it plays once per run and holds the last key.
     */
    .object({
      ...animationBase,
      kind: z.literal('sequence'),
      keys: z.array(sequenceKeySchema).min(2).max(32),
      loop: z.boolean().default(true),
    })
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

/** Named cut planes a topic may declare. */
export const MAX_CUTS = 4;

export const viewsSchema = z
  .object({
    assembled: viewPreset.optional(),
    xray: viewPreset.optional(),
    exploded: viewPreset.optional(),
    isolate: viewPreset.optional(),
    /** Optional cutaway plane (see cutawayPlaneSchema). */
    cutaway: cutawayPlaneSchema.optional(),
    /**
     * Named cut planes (≤ 4; same semantics as `cutaway`): a chapter or beat
     * `cutaway: "<name>"` cuts with one (a sagittal or a transverse section);
     * `label` names it in the status line (default: the name).
     */
    cuts: z
      .record(kebabId, z.object({ normal: vec3, offset: z.number().default(0), label: bilingual.optional() }).strict())
      .refine((r) => Object.keys(r).length <= MAX_CUTS, { message: `at most ${MAX_CUTS} named cuts` })
      .refine((r) => !Object.keys(r).some((k) => k === 'none' || k === 'half'), { message: '`none` and `half` are the engine\'s own cutaway values' })
      .optional(),
    /** Optional elevation plane for the ARCHITECTURE panel and REFERENCE view. */
    section: z.object({ plane: z.enum(SECTION_PLANES) }).strict().optional(),
    /** Optional REFERENCE camera; default: a long-lens straight view on the section plane. */
    reference: viewPreset.optional(),
    /**
     * Optional cover camera `{ position, target, fov? }`: where the camera goes
     * while the HUD is hidden (H, `hero-clean` shots); default: the current
     * camera re-fitted so the model's bounding sphere fills ~75 % of the stage width.
     */
    cover: orbitCamera.optional(),
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

/** One part's entry in a pose (see lib/pose.ts): `pivot` in scene coordinates. */
export const poseEntrySchema = z.object({ pivot: vec3.optional(), ...transformFields }).strict();
export type PoseEntry = z.output<typeof poseEntrySchema>;

/**
 * A pose: `{ "<part id>": entry, …, "duration"?: seconds }` (`duration` is
 * reserved: the transition into the pose, default 0.8 s). Parsed into
 * `{ duration, parts }`.
 */
export const poseSchema = z
  .record(z.string(), z.union([z.number(), poseEntrySchema]))
  .superRefine((r, ctx) => {
    for (const [key, value] of Object.entries(r)) {
      if (key === 'duration') {
        if (typeof value !== 'number' || value < 0 || value > 10)
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: [key], message: '`duration` is the transition in seconds (0–10)' });
      } else if (!KEBAB_ID.test(key)) ctx.addIssue({ code: z.ZodIssueCode.custom, path: [key], message: 'a part id (kebab-case)' });
      else if (typeof value === 'number') ctx.addIssue({ code: z.ZodIssueCode.custom, path: [key], message: 'a pose entry `{ pivot?, rotation?, offset?, scale?, fan? }`' });
    }
  })
  .transform((r) => {
    const parts: Record<string, PoseEntry> = {};
    for (const [key, value] of Object.entries(r)) if (key !== 'duration' && typeof value !== 'number') parts[key] = value;
    return { duration: typeof r.duration === 'number' ? r.duration : POSE_DURATION, parts };
  });
export type Pose = z.output<typeof poseSchema>;

/** Real-world units: one scene unit is `scale` `modelUnit` (lib/units.ts). */
export const unitsSchema = z.object({ modelUnit: z.enum(['mm', 'cm', 'm']), scale: positive }).strict();

export const partsFileBase = z
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
    /** Named poses (≤ 8; see poseSchema): a chapter or beat `pose: "<name>"` eases the parts into one. */
    poses: z
      .record(kebabId, poseSchema)
      .refine((r) => Object.keys(r).length <= MAX_POSES, { message: `at most ${MAX_POSES} poses` })
      .optional(),
    /** Real-world units of the model (see unitsSchema); default: scene units. */
    units: unitsSchema.optional(),
  })
  .strict()
  .superRefine((file, ctx) => {
    file.presets?.forEach((p, i) => {
      if ((RESERVED_PRESET_IDS as readonly string[]).includes(p.id))
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['presets', i, 'id'], message: `"${p.id}" is the engine's own preset id` });
    });
    const declared = new Set(file.parts.map((p) => p.id));
    // Mirror twins are parts too: flows, poses and chapters may name them.
    const twins = new Map<string, string>();
    file.parts.forEach((p, i) => {
      const spec = bilateralSpec(p.bilateral);
      if (!spec) return;
      const id = twinId(p.id, spec);
      if (declared.has(id)) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['parts', i, 'bilateral'], message: `the mirror twin "${id}" clashes with a part of that id` });
      twins.set(id, p.id);
    });
    const parts = new Set([...declared, ...twins.keys()]);
    const byId = new Map(file.parts.map((p) => [p.id, p]));
    const partOf = (id: string) => byId.get(twins.get(id) ?? id);
    const folds = (id: string) => {
      const p = partOf(id);
      return [p?.primitive, ...(p?.extra ?? [])].some((q) => q?.kind === 'wing' && q.fold !== undefined);
    };
    file.groups.forEach((g, i) => {
      if (file.groups.findIndex((x) => x.id === g.id) !== i)
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['groups', i, 'id'], message: `duplicate group "${g.id}"` });
    });
    Object.entries(file.poses ?? {}).forEach(([name, pose]) => {
      for (const [id, entry] of Object.entries(pose.parts)) {
        if (!parts.has(id)) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['poses', name, id], message: `unknown part "${id}"` });
        else if (entry.fan !== undefined && !folds(id))
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['poses', name, id, 'fan'], message: `"${id}" has no folding wing (\`wing\` with \`fold\`)` });
      }
    });
    file.animations.forEach((a, i) => {
      if (a.kind !== 'sequence') return;
      a.keys.forEach((k, j) => {
        const prev = a.keys[j - 1];
        if (prev && k.t <= prev.t) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['animations', i, 'keys', j, 't'], message: 'key times must increase' });
      });
      const fans = a.keys.filter((k) => k.fan !== undefined).length;
      if (fans > 0 && fans < a.keys.length) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['animations', i, 'keys'], message: 'give `fan` in every key or in none' });
      else if (fans > 0 && parts.has(a.target) && !folds(a.target))
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['animations', i, 'keys'], message: `"${a.target}" has no folding wing for \`fan\`` });
    });
    const groups = new Set(file.groups.map((g) => g.id));
    const contextIds = new Set(file.parts.filter((p) => p.context).map((p) => p.id));
    for (const [twin, of] of twins) if (contextIds.has(of)) contextIds.add(twin);
    file.parts.forEach((p, i) => {
      if (p.group !== undefined && !groups.has(p.group)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['parts', i, 'group'], message: `unknown group "${p.group}"` });
      }
      p.connects.forEach((c, j) => {
        if (!parts.has(c)) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['parts', i, 'connects', j], message: `unknown part "${c}"` });
        } else if (contextIds.has(twins.get(c) ?? c) || p.context) {
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
type PartsFileInput = z.output<typeof partsFileBase>;
type FlowData = z.output<typeof flowSchema>;

/**
 * Expand bilateral parts and flows (lib/bilateral.ts): each twin follows its
 * part; animations aimed at a bilateral part get a mirrored copy aimed at the
 * twin (`<animation id>-r`), poses a mirrored entry for the twin (unless the
 * pose names the twin itself), `connects` to other bilateral parts point at
 * the same side. Runs at build time, so data.json carries the twins.
 */
export function expandBilateral(file: PartsFileInput): Omit<PartsFileInput, 'parts'> & { parts: Part[] } {
  const specs = new Map<string, BilateralSpec>();
  for (const p of file.parts) {
    const spec = bilateralSpec(p.bilateral);
    if (spec) specs.set(p.id, spec);
  }
  if (specs.size === 0 && !file.flows.some((f) => f.bilateral)) return file;
  const twinOf = (id: string) => {
    const spec = specs.get(id);
    return spec ? twinId(id, spec) : id;
  };
  const parts: Part[] = [];
  for (const p of file.parts) {
    const spec = specs.get(p.id);
    if (!spec) {
      parts.push(p);
      continue;
    }
    const id = twinOf(p.id);
    const { axis } = spec;
    parts.push({ ...p, side: spec.side, pair: id });
    parts.push({
      ...p,
      id,
      side: otherSide(spec.side),
      pair: p.id,
      twinOf: p.id,
      ...(p.primitive ? { primitive: mirrorPrimitive(p.primitive, axis) } : {}),
      ...(p.extra ? { extra: p.extra.map((e) => mirrorPrimitive(e, axis)) } : {}),
      ...(p.repeat ? { repeat: mirrorRepeat(p.repeat, axis) } : {}),
      explode: { ...p.explode, dir: mirrorPoint(p.explode.dir, axis) },
      connects: p.connects.map(twinOf),
    });
  }
  const animations = file.animations.flatMap((a) => {
    const spec = specs.get(a.target);
    if (!spec) return [a];
    return [a, mirrorAnimation(a, spec.axis, twinId(a.id, spec), twinOf(a.target))];
  });
  const flows = file.flows.flatMap((f): FlowData[] => {
    const spec = bilateralSpec(f.bilateral);
    if (!spec) return [f];
    const twin: FlowData = { ...f, id: twinId(f.id, spec), path: f.path.map((q) => mirrorPoint(q, spec.axis)) };
    if (f.parts) twin.parts = f.parts.map(twinOf);
    return [f, twin];
  });
  const poses = file.poses
    ? Object.fromEntries(
        Object.entries(file.poses).map(([name, pose]) => {
          const out: Record<string, PoseEntry> = { ...pose.parts };
          for (const [id, entry] of Object.entries(pose.parts)) {
            const spec = specs.get(id);
            if (spec && out[twinOf(id)] === undefined) out[twinOf(id)] = mirrorTransform(entry, spec.axis);
          }
          return [name, { ...pose, parts: out }];
        }),
      )
    : undefined;
  return { ...file, parts, animations, flows, ...(poses ? { poses } : {}) };
}

export const partsFile = partsFileBase.transform(expandBilateral);
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
/** `none`, `half` (the default plane, `views.cutaway`) or the name of a cut in `views.cuts`. */
export const cutawayRef = kebabId;

export const spaceBeat = z
  .object({
    view: z.enum(SPACE_VIEWS).optional(),
    part: kebabId.nullable().optional(),
    explode: z.number().min(0).max(1).optional(),
    run: z.boolean().optional(),
    cutaway: cutawayRef.optional(),
    camera: z.union([orbitCamera, kebabId]).optional(),
    layers: z.array(kebabId).optional(),
    labels: z.array(labelRef).max(MAX_BEAT_LABELS).optional(),
    hide: z.array(kebabId).optional(),
    /** A pose of `parts.json` `poses` for this beat (`null`: rest); default the chapter's. */
    pose: kebabId.nullable().optional(),
    /** Groups (or parts) drawn faint for this beat (not cumulative); default the chapter's. */
    ghost: z.array(kebabId).optional(),
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
    /** `none`, `half` or a named cut of `views.cuts`. */
    cutaway: cutawayRef.optional(),
    theme: theme.optional(),
    /**
     * A pose of `parts.json` `poses` (not cumulative: a chapter without `pose`
     * is at rest); the parts ease into it (the pose's `duration`, default 0.8 s).
     */
    pose: kebabId.nullable().optional(),
    /**
     * Groups (or single parts) drawn faint (0.12 opacity, not pickable, not
     * labelled) in this chapter: the body outline around the system on show.
     * Not cumulative.
     */
    ghost: z.array(kebabId).optional(),
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
 * `group:<id>` groups, `layers` groups, `ghost` groups or parts, `pose` a pose,
 * `cutaway` none / half / a named cut, a beat's string `camera` a named preset.
 */
export function spaceChapterIssues(state: SpaceChapterState, data: SpaceSceneData): string[] {
  const f = data.parts;
  const parts = new Map(f.parts.map((p) => [p.id, p]));
  const groups = new Set(f.groups.map((g) => g.id));
  const presets = new Set(spacePresetIds(data));
  const out: string[] = [];
  const poses = new Set(Object.keys(f.poses ?? {}));
  const cuts = new Set(['none', 'half', ...Object.keys(f.views.cuts ?? {})]);
  const check = (where: string, s: Pick<SpaceBeat, 'part' | 'hide' | 'labels' | 'layers' | 'pose' | 'ghost' | 'cutaway'> & { camera?: unknown }) => {
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
    for (const id of s.ghost ?? []) if (!groups.has(id) && !parts.has(id)) out.push(`${where}ghost: unknown group or part "${id}"`);
    if (typeof s.pose === 'string' && !poses.has(s.pose)) out.push(`${where}pose: unknown pose "${s.pose}" (not in parts.json poses)`);
    if (s.cutaway !== undefined && !cuts.has(s.cutaway)) out.push(`${where}cutaway: unknown cut "${s.cutaway}" (none, half or a views.cuts name)`);
    if (typeof s.camera === 'string' && !presets.has(s.camera))
      out.push(`${where}camera: unknown preset "${s.camera}" (not in parts.json presets)`);
  };
  check('state.', state);
  state.beats?.forEach((b, i) => check(`state.beats.${i}.`, b));
  return out;
}
