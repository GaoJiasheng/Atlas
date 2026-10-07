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
import { bilingual, colorRef, kebabId, level, theme, vec3 } from '../../content/schema/common';
import { orbitCamera } from '../../content/schema/camera';

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

const PRIMITIVE_ARITY: Record<(typeof PRIMITIVE_KINDS)[number], number> = {
  box: 3,
  cylinder: 3,
  cone: 2,
  sphere: 1,
  torus: 2,
  capsule: 2,
  plane: 2,
};

/** Material presets; the engine tints them from theme tokens. */
export const MATERIAL_PRESETS = ['metal', 'plastic', 'copper', 'glass', 'rubber', 'matte'] as const;

export const primitiveSchema = z
  .object({
    kind: z.enum(PRIMITIVE_KINDS),
    size: z.array(z.number().positive()).min(1).max(3),
    /** Position of the part centre. */
    at: vec3,
    /** Euler rotation in degrees (XYZ). */
    rotation: vec3.optional(),
    color: z.union([z.enum(MATERIAL_PRESETS), colorRef]),
  })
  .strict()
  .superRefine((p, ctx) => {
    const want = PRIMITIVE_ARITY[p.kind];
    if (p.size.length !== want) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['size'],
        message: `${p.kind} needs ${want} size value(s), got ${p.size.length}`,
      });
    }
  });
export type Primitive = z.output<typeof primitiveSchema>;

export const partSchema = z
  .object({
    id: kebabId,
    name: bilingual,
    group: kebabId,
    summary: bilingual,
    detail: bilingual,
    /** Mesh name inside a glb model; the name is the part id's counterpart. */
    mesh: z.string().min(1).optional(),
    primitive: primitiveSchema.optional(),
    explode: z.object({ dir: vec3, dist: z.number().nonnegative() }).strict(),
    connects: z.array(kebabId).default([]),
    level,
  })
  .strict()
  .refine((p) => p.mesh !== undefined || p.primitive !== undefined, {
    message: 'a part needs either `mesh` or `primitive`',
    path: ['primitive'],
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

export const flowSchema = z
  .object({
    id: kebabId,
    group: kebabId,
    /** Polyline in scene coordinates the particles travel along. */
    path: z.array(vec3).min(2),
    /** Scene units per second. */
    speed: z.number().positive(),
    color: colorRef,
    whenRun: z.boolean().default(true),
  })
  .strict();
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

export const viewsSchema = z
  .object({
    assembled: viewPreset.optional(),
    xray: viewPreset.optional(),
    exploded: viewPreset.optional(),
    isolate: viewPreset.optional(),
    /** Optional cutaway plane (see cutawayPlaneSchema). */
    cutaway: cutawayPlaneSchema.optional(),
  })
  .strict();
export type ViewPresets = z.output<typeof viewsSchema>;

/* ------------------------------------------------------------------ */
/* parts.json                                                          */
/* ------------------------------------------------------------------ */

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
  })
  .strict()
  .superRefine((file, ctx) => {
    const parts = new Set(file.parts.map((p) => p.id));
    const groups = new Set(file.groups.map((g) => g.id));
    file.parts.forEach((p, i) => {
      if (!groups.has(p.group)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['parts', i, 'group'], message: `unknown group "${p.group}"` });
      }
      p.connects.forEach((c, j) => {
        if (!parts.has(c)) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['parts', i, 'connects', j], message: `unknown part "${c}"` });
        }
      });
    });
    file.flows.forEach((f, i) => {
      if (!groups.has(f.group)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['flows', i, 'group'], message: `unknown group "${f.group}"` });
      }
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
export const spaceSceneData = z.object({ parts: partsFile }).strict();
export type SpaceSceneData = z.output<typeof spaceSceneData>;

/* ------------------------------------------------------------------ */
/* Chapter state                                                       */
/* ------------------------------------------------------------------ */

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
  ];
}

export function spaceChapterRefs(state: SpaceChapterState): string[] {
  return [...(state.part ? [state.part] : []), ...(state.layers ?? [])];
}
