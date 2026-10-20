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
import { bilingual, colorRef, KEBAB_ID, kebabId, level, theme, vec3, type Bilingual } from '../../content/schema/common';
import { orbitCamera } from '../../content/schema/camera';
import { sourcesFile } from '../../content/schema/sources';
import { glossaryFile } from '../../content/schema/glossary';
import {
  contractMap,
  fitnessBundle,
  jointAngles,
  jointName,
  trainingFile,
  type FitnessBundle,
  type JointAngles,
  type MuscleSheet,
} from '../../content/schema/fitness';
import { ACTION_JOINTS, equipmentList, EXERCISE_BODIES, EXERCISE_PHASES, MOVEMENTS, OPPOSITE_MOVEMENTS, otherSideJoint, type Movement } from '../../lib/anatomy';
import { equipmentJoints } from './lib/equipment';
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
import { canMove, jointCandidates, DEFAULT_BULGE, DEFAULT_DEMO_ANGLE, JOINT_PREFIX, jointOf, MIN_DEMO_ANGLE, musclePartIds } from './lib/rig';
import { MAX_EXPLODE_STAGE } from './lib/explode';
import { MAX_FLOW_PATHS } from './lib/flow-curve';
import { beatSimSchema, chapterSimIssues, chapterSimSchema, simIssues, simSchema } from './sim-schema';

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
 *   lathe        {profile: [[r, y]...], segments, arc?}  profile revolved about Y (r ≥ 0);
 *                points on the axis (r = 0) close the solid; `arc` < 360 turns it only
 *                that far (kept on −Z) and closes both cuts with hatched section faces
 *   coil         {radius | [r0, r1], wire, turns, length, segments?, radial?}  a helix of
 *                round wire along Y, centred (a spring, a filament; a cone with [r0, r1])
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
export const SHAPED_KINDS = ['lathe', 'coil', 'extrude', 'curvedPanel', 'blades', 'coilBank', 'grille'] as const;

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

/**
 * Field kinds (docs/22 §4.4 M3; lib/sim/field.ts):
 *   filings  {size: [w, d], count?, needle?, saturate?, exponent?}  iron filings on a card
 *            w × d in the part's XZ plane (one InstancedMesh of `count` needles, default
 *            2400, each `needle` [length, thickness], default [0.002, 0.0003]); a sim
 *            `state` binding lays them out along the field of the magnet field state on
 *            show, kept with probability (|B| ÷ `saturate` T, default 0.002)^`exponent`
 *            (default 0.5); without a state they lie sprinkled at random. Only as a
 *            part's main `primitive` (the paper goes in `extra`), never repeated.
 */
export const FIELD_KINDS = ['filings'] as const;

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
 * the yellow alloy of valves and flare nuts, `fabric` short-pile carpet and
 * `abrasive` sandpaper grit (or sand, tinted light). Organism families: `chitin`
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
  'wood',
  'fabric',
  'abrasive',
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
        /**
         * Turn the profile through this many degrees only (a cut-open exhibit:
         * 180 = half), the part kept on the −Z side; a closed profile (ends on
         * the axis, or first point = last) gets flat section faces at both cuts,
         * drawn in its own colour with the section hatch.
         */
        arc: z.number().gt(0).lt(360).optional(),
        ...placement,
      })
      .strict(),
    z
      .object({
        kind: z.literal('coil'),
        /** Helix radius to the wire centre: one number, or [bottom, top] for a cone (a torch's tail spring). */
        radius: z.union([positive, z.tuple([positive, positive])]),
        /** Radius of the wire. */
        wire: positive,
        turns: z.number().positive().max(200),
        /** Height of the helix along its own Y axis (centred on `at`). */
        length: positive,
        /** Tube segments per turn (default 24). */
        segments: z.number().int().min(6).max(64).optional(),
        /** Sides of the wire (default 8). */
        radial: z.number().int().min(3).max(24).optional(),
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
    z
      .object({
        kind: z.literal('filings'),
        size: z.tuple([positive, positive]),
        count: z.number().int().min(50).max(4000).default(2400),
        needle: z.tuple([positive, positive]).default([0.002, 0.0003]),
        saturate: positive.default(0.002),
        exponent: z.number().min(0.2).max(1).default(0.5),
        /** Not data: the engine lays the filings out per field state (refused below with a pointer). */
        states: z.unknown().optional(),
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
      case 'coil': {
        const r = typeof p.radius === 'number' ? p.radius : Math.min(...p.radius);
        if (p.wire >= r) issue(['wire'], `wire radius ${p.wire} must be less than the coil radius ${r}`);
        if (p.length / p.turns < 2 * p.wire * 0.999) issue(['turns'], `${p.turns} turns of a ${2 * p.wire} wire do not fit in ${p.length}: the turns would overlap`);
        break;
      }
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
      case 'filings':
        if (p.needle[1] >= p.needle[0]) issue(['needle'], 'a needle is longer than it is thick');
        if (p.mirror || p.scale) issue(['scale'], 'size the card with `size` (no `scale` / `mirror`)');
        if (p.states !== undefined)
          issue(['states'], 'the engine lays filings out for each field state (`sim.magnet.fields`, docs/06 磁铁): drop `states`; `size` is the card [w, d]');
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
export const MAX_EXTRA_PRIMITIVES = 32;

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

/** Material of a glb part (mesh parts have no primitive to carry one): a family or colour, and an optional family tint. */
export const partMaterialSchema = z
  .object({
    color: z.union([z.enum(MATERIAL_PRESETS), colorRef]),
    tint: colorRef.optional(),
  })
  .strict();

export const partSchema = z
  .object({
    id: kebabId,
    name: bilingual,
    /** Card and leader-label name when `name` is long (default: the linked muscle's `short`, else `name`). */
    short: bilingual.optional(),
    /** Required, except for `context` parts (which may stand outside every group). */
    group: kebabId.optional(),
    /** Required, except for parts that link a `muscle` (then the muscle sheet's). */
    summary: bilingual.optional(),
    /**
     * "Tell me more" text. Blank lines (`\n\n`) split paragraphs; `[S3]` or
     * `[S3, S7]` cite data/sources.json (`[M3]` a shared source) and render as
     * source superscripts. Default for a `muscle` part: the muscle sheet's.
     */
    detail: bilingual.optional(),
    /** Node name inside the glb model (`model`); docs/16 §2: the part id + `.l` / `.r`. */
    mesh: z.string().min(1).optional(),
    /** Material of a glb-only part (required without a `primitive`). */
    material: partMaterialSchema.optional(),
    /** Shared muscle sheet this part shows (src/content/shared/fitness): the inspector's four tabs. */
    muscle: kebabId.optional(),
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
    /**
     * Exploded-view move (dir is normalised). Default: none (context parts never move).
     * `stage` (0–3): peel in layers, stage 0 moving first (lib/explode.ts `stagedAmount`).
     */
    explode: z
      .object({ dir: vec3, dist: z.number().nonnegative(), stage: z.number().int().min(0).max(MAX_EXPLODE_STAGE).optional() })
      .strict()
      .default({ dir: [0, 1, 0], dist: 0 }),
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
     * `labelBoth`: leader labels name both sides (default: this side only);
     * `mesh`: the twin draws this glb node (the real other side) instead of a
     * mirror image of this part's geometry.
     */
    bilateral: z
      .union([
        z.literal(true),
        z
          .object({
            axis: z.enum(['x', 'y', 'z']).optional(),
            side: z.enum(['left', 'right']).optional(),
            labelBoth: z.boolean().optional(),
            mesh: z.string().min(1).optional(),
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
  .refine((p) => p.primitive !== undefined || p.material !== undefined, {
    message: 'a glb-only part needs a `material` ({ color, tint? })',
    path: ['material'],
  })
  .refine((p) => p.muscle !== undefined || (p.summary !== undefined && p.detail !== undefined), {
    message: 'a part needs `summary` and `detail` (only parts that link a `muscle` may leave them to the muscle sheet)',
    path: ['summary'],
  })
  .refine((p) => typeof p.bilateral !== 'object' || p.bilateral.mesh === undefined || p.mesh !== undefined, {
    message: '`bilateral.mesh` pairs a glb node with this part\'s own `mesh`',
    path: ['bilateral', 'mesh'],
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
/** A part after the build: `summary` and `detail` filled in (from the muscle sheet where the data leaves them out). */
export type Part = Omit<z.output<typeof partSchema>, 'summary' | 'detail'> & { summary: Bilingual; detail: Bilingual } & PairInfo;

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
    /**
     * A scale bar under the group while it is the focus (a part of it selected,
     * soloed, or `group:<id>` among the labels on show): a round real length in
     * `unit`, for a sub-model drawn `magnification` × life size (default 1),
     * reading the model's `units` (default 1 scene unit = 1 m).
     */
    scale: z.object({ unit: z.enum(['mm', 'cm', 'm']), magnification: z.number().positive().default(1) }).strict().optional(),
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
    /** Polyline in scene coordinates the particles travel along (or several: `paths`). */
    path: z.array(vec3).min(2).optional(),
    /**
     * Several polylines drawn as one flow (one draw call): the particles share
     * the flow's look and are spread over the paths by length. A sim binding
     * (`intensity`) can then run each path at its own speed and direction, or
     * stop it (a circuit's current per edge).
     */
    paths: z
      .array(z.object({ id: kebabId, path: z.array(vec3).min(2) }).strict())
      .min(1)
      .max(MAX_FLOW_PATHS)
      .optional(),
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
    /** Not data: a field-line flow's lines are traced by the engine per field state (refused below with a pointer). */
    states: z.unknown().optional(),
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
    if (f.states !== undefined)
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['states'],
        message: 'field lines are traced by the engine for each field state (`sim.magnet.fields` + a `state` binding, docs/06 磁铁): drop `states` and `path` / `paths`',
      });
    // Neither: a field-line flow (its sim `state` binding gives the paths; checked with the sim).
    if (f.path !== undefined && f.paths !== undefined) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['path'], message: 'give `path` or `paths` (not both)' });
    if (f.path === undefined && f.paths === undefined && f.bilateral) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['bilateral'], message: 'a field-line flow is not mirrored' });
    f.paths?.forEach((p, i) => {
      if (f.paths!.findIndex((q) => q.id === p.id) !== i) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['paths', i, 'id'], message: `duplicate path "${p.id}"` });
    });
    if (f.paths && f.bilateral) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['bilateral'], message: 'a multi-path flow is not mirrored' });
  })
  // `path` is always there afterwards: a multi-path flow's is its first path's.
  .transform((f) => ({ ...f, path: f.path ?? f.paths?.[0]?.path ?? [] }));
export type Flow = z.output<typeof flowSchema>;

/** A rig joint as an animation / pose target: `joint:shoulder.l`. */
export const jointRef = z.string().refine((v) => v.startsWith(JOINT_PREFIX) && jointName.safeParse(v.slice(JOINT_PREFIX.length)).success, {
  message: 'joint:<name>, e.g. joint:elbow.l',
});

const animationBase = {
  id: kebabId,
  /** Part id to animate (a `sequence` may also drive a rig joint: `joint:<name>`). */
  target: kebabId,
  whenRun: z.boolean().default(true),
  /** Point the motion turns / scales about, scene coordinates (a joint); default the part centre. */
  pivot: vec3.optional(),
};

const scaleValue = z.union([positive, positiveVec3]);

/**
 * `each: true` (rotate / oscillate / pulse): every copy of the part — each
 * `repeat` instance times the main primitive and every `extra` — moves about
 * its own centre (its primitive's `at`, carried by the repeat) instead of the
 * whole part moving about the part centre: a wall of fan rotors, a row of
 * blinking lamps. Drawn instanced (identical primitives share one draw call);
 * not with `pivot`.
 */
const eachField = { each: z.boolean().optional() };

/** One transform: about `pivot` scale, then rotate (XYZ Euler, degrees), then `offset`; `fan` opens (1) / folds (0) a wing. */
const transformFields = {
  rotation: vec3.optional(),
  offset: vec3.optional(),
  scale: scaleValue.optional(),
  fan: z.number().min(0).max(1).optional(),
};

/**
 * A keyframe: a transform for a part, or for a `joint:<name>` target its
 * `angles` (`{ movement: degrees }`); `contract` (0..1) contracts a part along
 * its fibres at that key.
 */
export const sequenceKeySchema = z
  .object({ t: z.number().nonnegative(), ...transformFields, angles: jointAngles.optional(), contract: z.number().min(0).max(1).optional() })
  .strict();
export type SequenceKeyData = z.output<typeof sequenceKeySchema>;

export const animationSchema = z.discriminatedUnion('kind', [
  z.object({ ...animationBase, ...eachField, kind: z.literal('rotate'), axis: vec3, rpm: z.number() }).strict(),
  z
    .object({
      ...animationBase,
      ...eachField,
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
    .object({ ...animationBase, ...eachField, kind: z.literal('pulse'), scale: scaleValue, hz: z.number().positive() })
    .strict(),
  z
    /**
     * Keyframe clip: `keys` (t in seconds, ascending, ≤ 32) eased key to key;
     * `loop` (default) repeats it, else it plays once per run and holds the last key.
     * Aimed at `joint:<name>`, its keys carry `angles`.
     */
    .object({
      ...animationBase,
      target: z.union([kebabId, jointRef]),
      kind: z.literal('sequence'),
      keys: z.array(sequenceKeySchema).min(2).max(32),
      loop: z.boolean().default(true),
    })
    .strict(),
  z
    /**
     * A muscle contracting along its fibres (docs/16 §6.4): 0 → `amount` → 0 at
     * `hz`, shortening up to 20 % and swelling by `bulge` × its thickness, with
     * moving signal stripes; needs the glb's `_U` / `_FIBRE` attributes
     * (without them the part scales instead).
     */
    .object({
      ...animationBase,
      kind: z.literal('contract'),
      amount: z.number().min(0).max(1).default(0.7),
      bulge: z.number().min(0).max(0.3).default(DEFAULT_BULGE),
      hz: z.number().positive().max(4),
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
    /** Name of the EXPLODED mode and slider in this topic (e.g. PEEL / 剥层 for staged muscle layers). */
    explodeLabel: bilingual.optional(),
    /**
     * Optional cover camera `{ position, target, fov? }`: where the camera goes
     * while the HUD is hidden (H, `hero-clean` shots); default: the current
     * camera re-fitted so the model's bounding sphere fills ~75 % of the stage width.
     */
    cover: orbitCamera.optional(),
    /**
     * How the body reads while an exercise plays (topics with a skinned
     * `context` skin part): `wire` (default when the glb has a `skin-wire`
     * node) draws the low-poly figure as ink hairlines over a faint
     * silhouette; `mannequin` (the default otherwise) draws the skin as a
     * solid matte figure; both put the muscles over it x-ray style, hide the
     * bones and draw procedural hands that match the grip; `ghost` keeps the
     * faint skin outline of the other modes.
     */
    exerciseBody: z.enum(EXERCISE_BODIES).optional(),
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
    idle: z.number().optional(),
    run: z.number().optional(),
    /** Time constant, seconds (with `follow`, default 0.3). */
    lag: z.number().positive().max(120).optional(),
    /** Decimal places (default: as many as `idle` / `run` are written with, at most 3; with `follow`, the output's). */
    decimals: z.number().int().min(0).max(3).optional(),
    /**
     * A number output of `sim` this reading shows instead (docs/22 §4.3 S5):
     * it eases to each new value over `lag`, whatever RUN says; `idle` / `run`
     * are then left out. Two or three outputs (one unit) share a row,
     * `0.45 · 0.45 s` (docs/30 F6).
     */
    follow: z.union([kebabId, z.array(kebabId).min(1).max(3)]).optional(),
    /**
     * `observe`: show only the followed outputs this chapter's try-it card
     * observes (`—` when it observes none of them): one row for a weight the
     * fall chapter reads and the spring chapter reads as a load.
     */
    scope: z.literal('observe').optional(),
  })
  .strict()
  .superRefine((r, ctx) => {
    if (r.follow === undefined && (r.idle === undefined || r.run === undefined || r.lag === undefined))
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['idle'], message: 'a reading needs `idle`, `run` and `lag`, or `follow` (a sim output)' });
    if (r.follow !== undefined && (r.idle !== undefined || r.run !== undefined))
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['follow'], message: 'a `follow` reading takes no `idle` / `run`' });
    if (r.scope !== undefined && r.follow === undefined) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['scope'], message: '`scope` belongs to a `follow` reading' });
  });
export type TelemetryRow = z.output<typeof telemetrySchema>;
export const MAX_TELEMETRY_ROWS = 6;

/** One part's entry in a pose (see lib/pose.ts): `pivot` in scene coordinates. */
export const poseEntrySchema = z.object({ pivot: vec3.optional(), ...transformFields }).strict();
export type PoseEntry = z.output<typeof poseEntrySchema>;

/**
 * A pose: `{ "<part id>": entry, …, "joint:<name>": { movement: degrees }, …,
 * "contract": { "<part id>": 0..1 }, "duration"?: seconds }` (`duration` and
 * `contract` are reserved keys: the transition into the pose, default 0.8 s,
 * and how far the named muscle parts are contracted). Parsed into
 * `{ duration, parts, joints, contract }`.
 */
export const poseSchema = z
  .record(z.string(), z.unknown())
  .superRefine((r, ctx) => {
    const issue = (key: string, message: string) => ctx.addIssue({ code: z.ZodIssueCode.custom, path: [key], message });
    for (const [key, value] of Object.entries(r)) {
      if (key === 'duration') {
        if (typeof value !== 'number' || value < 0 || value > 10) issue(key, '`duration` is the transition in seconds (0–10)');
      } else if (key === 'contract') {
        const c = contractMap.safeParse(value);
        if (!c.success) issue(key, '`contract` maps part ids to 0..1');
      } else if (jointOf(key) !== null) {
        if (!jointRef.safeParse(key).success) issue(key, 'joint:<name>, e.g. joint:elbow.l');
        else if (!jointAngles.safeParse(value).success) issue(key, 'joint angles `{ movement: degrees }`, e.g. { "flexion": 90 }');
      } else if (!KEBAB_ID.test(key)) issue(key, 'a part id (kebab-case) or joint:<name>');
      else if (!poseEntrySchema.safeParse(value).success) issue(key, 'a pose entry `{ pivot?, rotation?, offset?, scale?, fan? }`');
    }
  })
  .transform((r) => {
    const parts: Record<string, PoseEntry> = {};
    const joints: Record<string, JointAngles> = {};
    let contract: Record<string, number> = {};
    for (const [key, value] of Object.entries(r)) {
      if (key === 'duration') continue;
      if (key === 'contract') contract = contractMap.parse(value);
      else {
        const joint = jointOf(key);
        if (joint !== null) joints[joint] = jointAngles.parse(value);
        else parts[key] = poseEntrySchema.parse(value);
      }
    }
    return { duration: typeof r.duration === 'number' ? r.duration : POSE_DURATION, parts, joints, contract };
  });
export type Pose = z.output<typeof poseSchema>;

/**
 * A rig joint (docs/16 §5): the glb bone `node` it turns, and per movement
 * the rotation axis in scene coordinates at rest (positive = that movement
 * on that side of the body; the opposite movement uses it negated). Angles
 * apply in the order the axes are listed.
 */
export const rigJointSchema = z
  .object({
    node: z.string().min(1),
    axes: z
      .record(z.enum(MOVEMENTS), vec3)
      .refine((r) => Object.keys(r).length > 0, { message: 'a joint needs at least one axis' })
      .refine((r) => Object.values(r).every((v) => Math.hypot(...v) > 1e-9), { message: 'axes must not be zero' })
      .refine((r) => !(Object.keys(r) as Movement[]).some((m) => OPPOSITE_MOVEMENTS[m] !== undefined && OPPOSITE_MOVEMENTS[m]! in r), {
        message: 'give one axis per pair of opposite movements (flexion or extension, not both)',
      })
      .refine((r) => !('stabilisation' in r), { message: '`stabilisation` is not an axis' }),
    /**
     * Where held equipment sits relative to the bone's origin (hand joints):
     * metres along the parent → joint axis (the forearm for a wrist bone: the
     * palm is ~0.08 m past the wrist), or a vector in scene coordinates at rest
     * that turns with the bone.
     */
    offset: z.union([z.number().min(-0.5).max(0.5), vec3]).optional(),
  })
  .strict();
export type RigJoint = z.output<typeof rigJointSchema>;

/** Most joints a rig may declare. */
export const MAX_RIG_JOINTS = 64;

export const rigSchema = z
  .object({
    joints: z
      .record(jointName, rigJointSchema)
      .refine((r) => Object.keys(r).length <= MAX_RIG_JOINTS, { message: `at most ${MAX_RIG_JOINTS} joints` }),
    /**
     * Angles the muscle sheet's ACTIONS "demo" buttons swing to, per action
     * joint (`shoulder`, `elbow` …, no side) and movement (default 60°).
     */
    demo: z.record(z.enum(ACTION_JOINTS), jointAngles).optional(),
  })
  .strict();
export type Rig = z.output<typeof rigSchema>;

/**
 * Where a muscle attaches (docs/16 §6.3): origin or insertion on `bone` (a
 * part id), as 1–8 points in scene coordinates (several for a broad
 * attachment). `muscle` is the muscle's part id. Drawn as hollow (origin) /
 * solid (insertion) dots with a dashed line of pull between their centroids,
 * following the bone as it moves.
 */
export const siteSchema = z
  .object({
    muscle: kebabId,
    kind: z.enum(['origin', 'insertion']),
    bone: kebabId,
    points: z.array(vec3).min(1).max(8),
  })
  .strict();
export type Site = z.output<typeof siteSchema>;

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
    /** Named poses (≤ 32; see poseSchema): a chapter or beat `pose: "<name>"` eases the parts into one. */
    poses: z
      .record(kebabId, poseSchema)
      .refine((r) => Object.keys(r).length <= MAX_POSES, { message: `at most ${MAX_POSES} poses` })
      .optional(),
    /** Real-world units of the model (see unitsSchema); default: scene units. */
    units: unitsSchema.optional(),
    /** Joints of the glb skeleton that poses, clips and exercises turn (see rigSchema). */
    rig: rigSchema.optional(),
    /** Muscle attachments (see siteSchema). */
    sites: z.array(siteSchema).max(256).optional(),
    /** Try-it simulation: controls, a model, outputs and bindings (sim-schema.ts, docs/06 「SpaceScene · 试一试」). */
    sim: simSchema.optional(),
  })
  .strict()
  .superRefine((file, ctx) => {
    if (file.sim) {
      const countable = new Set(file.parts.filter((p) => p.repeat !== undefined && (p.extra ?? []).length === 0).map((p) => p.id));
      for (const x of simIssues(file.sim, {
        parts: new Set(file.parts.map((p) => p.id)),
        flows: new Map(file.flows.map((f) => [f.id, { paths: f.paths, own: f.path.length > 0 }])),
        animations: new Map(file.animations.map((a) => [a.id, { kind: a.kind, target: a.target }])),
        poses: new Set(Object.keys(file.poses ?? {})),
        countable,
        filings: new Set(file.parts.filter((p) => p.primitive?.kind === 'filings').map((p) => p.id)),
        primitives: new Set(file.parts.filter((p) => p.primitive !== undefined).map((p) => p.id)),
        coils: new Map(file.parts.map((p) => [p.id, [p.primitive, ...(p.extra ?? [])].filter((q) => q?.kind === 'coil').length])),
        repeated: new Set(file.parts.filter((p) => p.repeat !== undefined).map((p) => p.id)),
        withExtra: new Set(file.parts.filter((p) => (p.extra ?? []).length > 0).map((p) => p.id)),
        groups: new Set(file.groups.map((g) => g.id)),
        contextParts: new Set(file.parts.filter((p) => p.context).map((p) => p.id)),
      }))
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['sim', ...x.path], message: x.message });
    }
    file.parts.forEach((p, i) => {
      const at = (path: (string | number)[], message: string) => ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['parts', i, ...path], message });
      (p.extra ?? []).forEach((e, k) => {
        if (e.kind === 'filings') at(['extra', k], 'filings are a part\'s main `primitive` (put the paper in `extra`)');
      });
      if (p.primitive?.kind !== 'filings') return;
      if (p.repeat) at(['repeat'], 'a filings card is not repeated');
      if (file.sim?.kind !== 'magnet') at(['primitive'], 'filings need a magnet `sim` (a `state` binding lays them out)');
    });
    file.flows.forEach((f, i) => {
      if (f.path.length === 0 && file.sim?.kind !== 'magnet')
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['flows', i, 'path'], message: 'give `path` or `paths` (only a magnet sim\'s field-line flow has neither)' });
    });
    const outputs = new Map((file.sim?.outputs ?? []).map((o) => [o.id, o]));
    file.telemetry?.forEach((r, i) => {
      if (r.follow === undefined) return;
      const ids = Array.isArray(r.follow) ? r.follow : [r.follow];
      for (const id of ids) {
        const o = outputs.get(id);
        if (!o) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['telemetry', i, 'follow'], message: file.sim ? `unknown sim output "${id}"` : 'parts.json has no `sim`' });
        else if (o.kind !== 'number') ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['telemetry', i, 'follow'], message: `"${id}" is a ${o.kind}, not a number` });
      }
      if (new Set(ids.map((id) => outputs.get(id)?.unit ?? '')).size > 1)
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['telemetry', i, 'follow'], message: 'one reading, one unit' });
    });
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
    const joints = new Set(Object.keys(file.rig?.joints ?? {}));
    const noJoint = (path: (string | number)[], name: string) =>
      ctx.addIssue({ code: z.ZodIssueCode.custom, path, message: file.rig ? `unknown joint "${name}" (not in rig.joints)` : `joint "${name}": parts.json has no \`rig\`` });
    Object.entries(file.poses ?? {}).forEach(([name, pose]) => {
      for (const [id, entry] of Object.entries(pose.parts)) {
        if (!parts.has(id)) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['poses', name, id], message: `unknown part "${id}"` });
        else if (entry.fan !== undefined && !folds(id))
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['poses', name, id, 'fan'], message: `"${id}" has no folding wing (\`wing\` with \`fold\`)` });
      }
      for (const joint of Object.keys(pose.joints)) if (!joints.has(joint)) noJoint(['poses', name, `${JOINT_PREFIX}${joint}`], joint);
      for (const id of Object.keys(pose.contract)) if (!parts.has(id)) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['poses', name, 'contract', id], message: `unknown part "${id}"` });
    });
    (file.sites ?? []).forEach((site, i) => {
      for (const field of ['muscle', 'bone'] as const)
        if (!parts.has(site[field])) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['sites', i, field], message: `unknown part "${site[field]}"` });
    });
    if (file.rig && file.model === undefined) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['rig'], message: 'a rig turns the bones of a glb skeleton: add `model`' });
    file.animations.forEach((a, i) => {
      if (a.kind !== 'sequence') return;
      const joint = jointOf(a.target);
      a.keys.forEach((k, j) => {
        const prev = a.keys[j - 1];
        if (prev && k.t <= prev.t) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['animations', i, 'keys', j, 't'], message: 'key times must increase' });
        if (joint !== null && (k.angles === undefined || k.rotation || k.offset || k.scale !== undefined || k.fan !== undefined || k.contract !== undefined))
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['animations', i, 'keys', j], message: 'a joint clip\'s keys give `angles` only' });
        if (joint === null && k.angles !== undefined) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['animations', i, 'keys', j, 'angles'], message: '`angles` belong to a joint:<name> clip' });
      });
      if (joint !== null) {
        if (!joints.has(joint)) noJoint(['animations', i, 'target'], joint);
        return;
      }
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
      if (jointOf(a.target) === null && !parts.has(a.target)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['animations', i, 'target'],
          message: `unknown part "${a.target}"`,
        });
      }
      if ('each' in a && a.each) {
        const target = file.parts.find((p) => p.id === a.target);
        if (a.pivot !== undefined)
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['animations', i, 'pivot'], message: '`each` moves every copy about its own centre: no `pivot`' });
        if (target && (target.primitive === undefined || target.mesh !== undefined))
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['animations', i, 'each'], message: '`each` needs a primitive part (no glb `mesh`)' });
        else if (target && target.repeat === undefined && (target.extra ?? []).length === 0)
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['animations', i, 'each'], message: '`each` needs a part with `repeat` or `extra` (one copy: leave it out)' });
      }
    });
  });
type PartsFileInput = z.output<typeof partsFileBase>;
type FlowData = z.output<typeof flowSchema>;

/**
 * Expand bilateral parts and flows (lib/bilateral.ts): each twin follows its
 * part (or draws its own glb node, `bilateral.mesh`); animations aimed at a
 * bilateral part get a mirrored copy aimed at the twin (`<animation id>-r`),
 * poses a mirrored entry for the twin (unless the pose names the twin
 * itself), `connects` to other bilateral parts point at the same side, a
 * pose's `contract` covers both sides and a part's `sites` are mirrored for
 * its twin (unless the data lists the twin's own). Rig joints on the left
 * (`<name>.l`) also drive their right counterpart (`<name>.r`, when the rig
 * has it and the pose or clip does not name it): the rig's axes are
 * anatomical, so the same angles make the mirror movement. Runs at build
 * time, so data.json carries the twins.
 */
export function expandBilateral(file: PartsFileInput): Omit<PartsFileInput, 'parts'> & { parts: Part[] } {
  const specs = new Map<string, BilateralSpec>();
  for (const p of file.parts) {
    const spec = bilateralSpec(p.bilateral);
    if (spec) specs.set(p.id, spec);
  }
  const rigJoints = new Set(Object.keys(file.rig?.joints ?? {}));
  const rightOf = (joint: string) => (joint.endsWith('.l') && rigJoints.has(otherSideJoint(joint)) ? otherSideJoint(joint) : null);
  if (specs.size === 0 && !file.flows.some((f) => f.bilateral) && rigJoints.size === 0) return file as Omit<PartsFileInput, 'parts'> & { parts: Part[] };
  const twinOf = (id: string) => {
    const spec = specs.get(id);
    return spec ? twinId(id, spec) : id;
  };
  const parts: Part[] = [];
  for (const p of file.parts as Part[]) {
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
      ...(spec.mesh ? { mesh: spec.mesh } : {}),
      ...(p.primitive ? { primitive: mirrorPrimitive(p.primitive, axis) } : {}),
      ...(p.extra ? { extra: p.extra.map((e) => mirrorPrimitive(e, axis)) } : {}),
      ...(p.repeat ? { repeat: mirrorRepeat(p.repeat, axis) } : {}),
      explode: { ...p.explode, dir: mirrorPoint(p.explode.dir, axis) },
      connects: p.connects.map(twinOf),
    });
  }
  const animations = file.animations.flatMap((a) => {
    const spec = specs.get(a.target);
    if (spec) return [a, mirrorAnimation(a, spec.axis, twinId(a.id, spec), twinOf(a.target))];
    const joint = jointOf(a.target);
    const right = joint !== null ? rightOf(joint) : null;
    if (right === null || file.animations.some((b) => b.target === `${JOINT_PREFIX}${right}`)) return [a];
    return [a, { ...a, id: `${a.id}-r`, target: `${JOINT_PREFIX}${right}` }];
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
          const joints = { ...pose.joints };
          for (const [joint, angles] of Object.entries(pose.joints)) {
            const right = rightOf(joint);
            if (right !== null && joints[right] === undefined) joints[right] = angles;
          }
          const contract = { ...pose.contract };
          for (const [id, c] of Object.entries(pose.contract)) if (specs.has(id) && contract[twinOf(id)] === undefined) contract[twinOf(id)] = c;
          return [name, { ...pose, parts: out, joints, contract }];
        }),
      )
    : undefined;
  const sites = file.sites?.flatMap((site) => {
    const spec = specs.get(site.muscle);
    if (!spec || file.sites!.some((o) => o.muscle === twinOf(site.muscle) && o.kind === site.kind)) return [site];
    return [site, { ...site, muscle: twinOf(site.muscle), bone: twinOf(site.bone), points: site.points.map((q) => mirrorPoint(q, spec.axis)) }];
  });
  return { ...file, parts, animations, flows, ...(poses ? { poses } : {}), ...(sites ? { sites } : {}) };
}

export const partsFile = partsFileBase.transform(expandBilateral);
export type PartsFile = z.output<typeof partsFile>;

/**
 * Parsed `data/*.json` of a SpaceScene topic, keyed by file name: `parts.json`,
 * the optional `sources.json` and `glossary.json` (content/schema), a muscle
 * topic's `training.json` and the shared fitness data the build merged in
 * (`fitness`, content/schema/fitness.ts `withSharedFitness`). Parts that link a
 * `muscle` take its summary, detail and short name unless they give their own.
 */
export const spaceSceneData = z
  .object({
    parts: partsFile,
    sources: sourcesFile.optional(),
    glossary: glossaryFile.optional(),
    training: trainingFile.optional(),
    fitness: fitnessBundle.optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    const issue = (path: (string | number)[], message: string) => ctx.addIssue({ code: z.ZodIssueCode.custom, path, message });
    // `[S#]` markers in part details must cite data/sources.json, `[M#]` the shared sources.
    const known = new Set((data.sources?.sources ?? []).map((s) => s.id));
    const shared = new Set((data.fitness?.sources ?? []).map((s) => s.id));
    const muscles = new Map((data.fitness?.muscles ?? []).map((m) => [m.id, m]));
    const exercises = new Map((data.fitness?.exercises ?? []).map((e) => [e.id, e]));
    const parentOf = new Map([...muscles.values()].map((m) => [m.id, m.parent]));
    data.parts.parts.forEach((p, i) => {
      if (p.twinOf) return;
      for (const lang of ['en', 'zh'] as const) {
        for (const id of detailSourceIds(p.detail?.[lang] ?? '')) {
          if (id.startsWith('M')) {
            if (!shared.has(id)) issue(['parts', 'parts', i, 'detail', lang], `[${id}]: unknown shared source (not in shared/fitness/sources.json)`);
          } else if (!known.has(id)) {
            issue(['parts', 'parts', i, 'detail', lang], data.sources ? `[${id}]: unknown source (not in data/sources.json)` : `[${id}]: the topic has no data/sources.json`);
          }
        }
      }
      if (p.muscle !== undefined && !muscles.has(p.muscle))
        issue(['parts', 'parts', i, 'muscle'], data.fitness ? `unknown muscle "${p.muscle}" (not in src/content/shared/fitness/muscles)` : `muscle "${p.muscle}": no shared fitness data was merged`);
      // Every ACTIONS demo button the muscle sheet shows must visibly move its joint.
      const side = p.id.endsWith('-r') ? '.r' : '.l';
      for (const a of (p.muscle !== undefined ? muscles.get(p.muscle)?.actions : undefined) ?? []) {
        const joint = jointCandidates(a.joint, a.movement, side === '.r' ? 'r' : 'l')
          .map((n) => data.parts.rig?.joints[n])
          .find((j) => j !== undefined && canMove(j.axes, a.movement as Movement));
        if (!joint) continue;
        const amount = data.parts.rig?.demo?.[a.joint as keyof NonNullable<Rig['demo']>]?.[a.movement as Movement] ?? DEFAULT_DEMO_ANGLE;
        if (Math.abs(amount) < MIN_DEMO_ANGLE)
          issue(['parts', 'rig', 'demo', a.joint, a.movement], `${amount}°: the ${p.id} demo button (${a.joint} ${a.movement}) would not visibly move; give at least ${MIN_DEMO_ANGLE}°`);
      }
    });
    if (data.training && !data.fitness) issue(['training'], 'training.json needs the shared fitness data (src/content/shared/fitness)');
    const rig = data.parts.rig?.joints ?? {};
    data.training?.exercises.forEach((id, i) => {
      const e = exercises.get(id);
      if (!e) {
        issue(['training', 'exercises', i], `unknown exercise "${id}" (not in src/content/shared/fitness/exercises)`);
        return;
      }
      if (!e.primary.some((m) => musclePartIds(data.parts.parts, m, parentOf).length > 0))
        issue(['training', 'exercises', i], `"${id}": none of its primary muscles (${e.primary.join(', ')}) is a part of this topic`);
      e.motion?.keys.forEach((k, j) => {
        for (const joint of Object.keys(k.joints))
          if (!(joint in rig)) issue(['training', 'exercises', i], `"${id}" motion.keys.${j}: joint "${joint}" is not in this topic's rig`);
      });
      // Equipment the rig can hold (the palms, the trunk, the feet), and contacts it can keep.
      for (const eq of equipmentList(e.motion?.equipment))
        for (const joint of equipmentJoints(eq))
          if (!(joint in rig)) issue(['training', 'exercises', i], `"${id}" motion.equipment ${eq.kind}: needs the rig joint "${joint}" (not in this topic's rig)`);
      const contactJoints = { hands: ['hand.l', 'hand.r'], 'hand.l': ['hand.l'], 'hand.r': ['hand.r'], knees: ['knee.l', 'knee.r'] } as const;
      for (const c of e.motion?.contacts ?? []) {
        const need: readonly string[] = c in contactJoints ? contactJoints[c as keyof typeof contactJoints] : [];
        if (need.some((j) => !(j in rig))) issue(['training', 'exercises', i], `"${id}" motion.contacts: ${c} needs the rig joints ${need.join(' and ')}`);
      }
    });
    data.training?.session?.blocks.forEach((b, i) => {
      if (!data.training!.exercises.includes(b.exercise)) issue(['training', 'session', 'blocks', i, 'exercise'], `"${b.exercise}" is not in training.exercises`);
    });
  })
  .transform((data) => {
    const muscles = new Map((data.fitness?.muscles ?? []).map((m) => [m.id, m]));
    if (muscles.size === 0) return data;
    const fill = (p: Part): Part => {
      const m: MuscleSheet | undefined = p.muscle ? muscles.get(p.muscle) : undefined;
      if (!m) return p;
      const short = p.short ?? m.short;
      return { ...p, summary: p.summary ?? m.summary, detail: p.detail ?? m.detail, ...(short ? { short } : {}) };
    };
    return { ...data, parts: { ...data.parts, parts: data.parts.parts.map(fill) } };
  });
/** Shared fitness data as merged into a topic (the type the client sees). */
export type { FitnessBundle };
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

/**
 * Exercise mode (docs/16 §6.5): a shared exercise of the topic's
 * training.json; `phase` holds its `start` or `end` key, or `loop`s through
 * them at its tempo (default `loop`); `bones: true` keeps the skeleton on
 * show over the mannequin. `null`: none.
 */
export const exerciseRef = z
  .object({
    id: kebabId,
    phase: z.enum(EXERCISE_PHASES).default('loop'),
    /** Keep the skeleton on show over the mannequin (`views.exerciseBody`; default: bones hidden while an exercise plays). */
    bones: z.boolean().optional(),
  })
  .strict();
export type ExerciseRef = z.output<typeof exerciseRef>;

/** Parts (or groups) tinted in the signal colour (prime movers) and the cold colour (synergists). */
/** `custom`: part or group id → its own colour (`token:<name>` or `#hex`): a stain or a dye, any colour. */
export const highlightSchema = z
  .object({ signal: z.array(kebabId).default([]), cold: z.array(kebabId).default([]), custom: z.record(kebabId, colorRef).optional() })
  .strict();
export type Highlight = z.output<typeof highlightSchema>;

/** Fields a chapter state and a beat share for the muscle topics (each not cumulative). */
const muscleStateFields = {
  /** Exercise mode (see exerciseRef); `null` = none. */
  exercise: exerciseRef.nullable().optional(),
  /** Tints (see highlightSchema). */
  highlight: highlightSchema.nullable().optional(),
  /** Muscle parts whose origin / insertion markers show (parts.json `sites`). */
  sites: z.array(kebabId).optional(),
};

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
    ...muscleStateFields,
    /** Try-it control values for this beat, on top of the chapter's `sim.set`. */
    sim: beatSimSchema.optional(),
    caption: bilingual,
    audio: z
      .string()
      .regex(/^\/[^\s?#]+\.(mp3|m4a|aac|ogg|opus|wav)$/i, 'audio: a site path such as /audio/aircon/ch03-1.mp3')
      .optional(),
  })
  .strict();
export type SpaceBeat = z.output<typeof spaceBeat>;

/**
 * A chapter's index in the reading panel (docs/08 §2 HUD 铁律 e): every
 * object the chapter talks about, reachable from a list. `exercises` (ids of
 * `data/training.json` `exercises`) lists them grouped by equipment, with the
 * example session after them; `parts` lists parts (not context ones).
 */
export const spaceChapterIndex = z
  .object({
    exercises: z.array(kebabId).min(1).optional(),
    parts: z.array(kebabId).min(1).optional(),
  })
  .strict()
  .refine((x) => x.exercises !== undefined || x.parts !== undefined, 'index: give `exercises` or `parts`');
export type SpaceChapterIndex = z.output<typeof spaceChapterIndex>;

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
    /** The background chapter's reading note ("How this topic is written"; docs/06 背景章; only on `kind: background`). */
    note: bilingual.optional(),
    ...muscleStateFields,
    /** PRESENTATION beats for this chapter; default = one beat (the chapter's state, `summary` as caption). */
    beats: z.array(spaceBeat).min(1).optional(),
    /** The chapter index after the body in the reading panel (exercises or parts). */
    index: spaceChapterIndex.optional(),
    /**
     * Try-it: the control values the chapter starts from (`set`, not
     * cumulative: what it leaves out is at its default) and its try-it card (`try`).
     */
    sim: chapterSimSchema.optional(),
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
 * `cutaway` none / half / a named cut, a beat's string `camera` a named preset,
 * `index.parts` parts (not context ones), `index.exercises` training exercises.
 */
export function spaceChapterIssues(state: SpaceChapterState, data: SpaceSceneData): string[] {
  const f = data.parts;
  const parts = new Map(f.parts.map((p) => [p.id, p]));
  const groups = new Set(f.groups.map((g) => g.id));
  const presets = new Set(spacePresetIds(data));
  const out: string[] = [];
  const poses = new Set(Object.keys(f.poses ?? {}));
  const cuts = new Set(['none', 'half', ...Object.keys(f.views.cuts ?? {})]);
  const training = new Set(data.training?.exercises ?? []);
  const sited = new Set((f.sites ?? []).map((x) => x.muscle));
  const check = (
    where: string,
    s: Pick<SpaceBeat, 'part' | 'hide' | 'labels' | 'layers' | 'pose' | 'ghost' | 'cutaway' | 'exercise' | 'highlight' | 'sites'> & { camera?: unknown },
  ) => {
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
    if (s.exercise && !training.has(s.exercise.id)) out.push(`${where}exercise: "${s.exercise.id}" is not in data/training.json exercises`);
    for (const id of [...(s.highlight?.signal ?? []), ...(s.highlight?.cold ?? []), ...Object.keys(s.highlight?.custom ?? {})])
      if (!groups.has(id) && !parts.has(id)) out.push(`${where}highlight: unknown group or part "${id}"`);
    for (const id of s.sites ?? []) if (!sited.has(id)) out.push(`${where}sites: "${id}" has no sites in parts.json`);
  };
  check('state.', state);
  state.beats?.forEach((b, i) => check(`state.beats.${i}.`, b));
  out.push(...chapterSimIssues('state.', state.sim, f.sim));
  state.beats?.forEach((b, i) => out.push(...chapterSimIssues(`state.beats.${i}.`, b.sim, f.sim)));
  for (const id of state.index?.parts ?? []) {
    const p = parts.get(id);
    if (!p) out.push(`state.index.parts: unknown part "${id}"`);
    else if (p.context) out.push(`state.index.parts: "${id}" is a context part (never selected)`);
  }
  for (const id of state.index?.exercises ?? [])
    if (!training.has(id)) out.push(`state.index.exercises: "${id}" is not in data/training.json exercises`);
  return out;
}
