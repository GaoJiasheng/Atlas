/**
 * Shared zod building blocks for topic content and engine data.
 *
 * These schemas are plain `zod` (not `astro:content`'s re-export) so that the
 * same definitions are used by Astro content collections, the build-time engine
 * data parser, the standalone validator (`scripts/validate-content.ts`) and
 * the unit tests. Astro 5 bundles the same zod major (3.x), and pnpm resolves
 * both to one copy.
 */
import { z } from 'zod';
import { LEVELS } from '../../lib/levels';
import { THEMES } from '../../theme/theme';
import { isIsoDate } from '../../lib/time';

/* ------------------------------------------------------------------ */
/* Text                                                                */
/* ------------------------------------------------------------------ */

/**
 * A bilingual text field. `en` is mandatory; `zh` may be missing while a topic
 * is being drafted (the validator warns, `tx()` falls back to English).
 * Output type is always `{ en: string; zh: string }` (missing zh -> '').
 */
export const bilingual = z
  .object({
    en: z.string().trim().min(1, 'English text is required'),
    zh: z.string().trim().optional().default(''),
  })
  .strict();
export type Bilingual = z.output<typeof bilingual>;

/* ------------------------------------------------------------------ */
/* Identifiers                                                         */
/* ------------------------------------------------------------------ */

export const KEBAB_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** kebab-case identifier: `fall-of-singapore`, `p4`, `ww2`. */
export const kebabId = z
  .string()
  .regex(KEBAB_ID, 'must be kebab-case (lowercase letters, digits, single dashes)');

/* ------------------------------------------------------------------ */
/* Levels, subjects, themes                                            */
/* ------------------------------------------------------------------ */

export { LEVELS, THEMES };
export const level = z.enum(LEVELS);
export type Level = z.infer<typeof level>;

export const theme = z.enum(THEMES);
export type Theme = z.infer<typeof theme>;

/* ------------------------------------------------------------------ */
/* Time                                                                */
/* ------------------------------------------------------------------ */

/**
 * ISO date with three precisions: `1942`, `1942-02`, `1942-02-15`.
 * A leading `-` marks years BCE (`-0221` = 221 BCE).
 */
export const ISO_DATE = /^-?\d{4}(?:-(0[1-9]|1[0-2])(?:-(0[1-9]|[12]\d|3[01]))?)?$/;

export const isoDate = z
  .string()
  .regex(ISO_DATE, 'must be an ISO date: YYYY, YYYY-MM or YYYY-MM-DD')
  .refine(isIsoDate, 'is not a real calendar date');
export type IsoDate = z.infer<typeof isoDate>;

/** Geological time in millions of years ago: `{ ma: 200 }`. */
export const geoTime = z.object({ ma: z.number().nonnegative() }).strict();
export type GeoTime = z.infer<typeof geoTime>;

/** Any point on a TimeScene axis: historical date or geological time. */
export const timePoint = z.union([isoDate, geoTime]);
export type TimePoint = z.infer<typeof timePoint>;

/* ------------------------------------------------------------------ */
/* Geometry                                                            */
/* ------------------------------------------------------------------ */

export const lngLat = z.tuple([
  z.number().min(-180).max(180),
  z.number().min(-90).max(90),
]);
export type LngLat = z.infer<typeof lngLat>;

export const vec3 = z.tuple([z.number(), z.number(), z.number()]);
export type Vec3 = z.infer<typeof vec3>;

/* ------------------------------------------------------------------ */
/* Colours                                                             */
/* ------------------------------------------------------------------ */

/**
 * A colour reference: either a theme token (`token:accent-1`, resolved against
 * the CSS variable `--accent-1` at runtime so it follows the theme) or a hex
 * literal (`#c0392b`). Prefer tokens.
 */
export const colorRef = z
  .string()
  .regex(/^(?:token:[a-z0-9-]+|#[0-9a-fA-F]{3,8})$/, 'must be token:<name> or #hex');
export type ColorRef = z.infer<typeof colorRef>;
