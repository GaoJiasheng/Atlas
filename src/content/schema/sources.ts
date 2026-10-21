/**
 * Topic-level source list, `data/sources.json` (docs/09 §6). Shared by every
 * engine: events (`sources: ["S1"]`), chapter numbers (`<Num s="S1">`) and the
 * source popover all point at these ids. `scripts/sources-md.ts` renders the
 * list into `data/SOURCES.md`.
 */
import { z } from 'zod';
import { bilingual } from './common';

/** `S1`, `S12`: capital S + a number. */
export const SOURCE_ID = /^S[1-9]\d*$/;

export const sourceId = z.string().regex(SOURCE_ID, 'source ids look like S1, S12');

/**
 * Shared sources (`src/content/shared/<area>/sources.json`, docs/16 §4): `M1`,
 * `M12`. Topics that use shared data cite them like their own `S#` (in
 * `<Num s="M3">`, `[M3]` in a detail, the source popover, SOURCES.md).
 */
export const SHARED_SOURCE_ID = /^M[1-9]\d*$/;
export const sharedSourceId = z.string().regex(SHARED_SOURCE_ID, 'shared source ids look like M1, M12');

const entryFields = {
  /** What the source says, in short (court judgment, archive, monograph …). */
  text: bilingual,
  /** Where to read it. Shown as a link; never fetched. */
  url: z
    .string()
    .url()
    .refine((u) => /^https?:\/\//.test(u), 'url must be http(s)')
    .optional(),
  /** Range, disagreement between sources, or how the number was rounded. */
  note: bilingual.optional(),
  /**
   * The topic's own design study (docs/40 §4.2): the values a model sets for
   * showing ("in this model", SIM), not measurements. A SpaceScene `table`
   * row of SIM outputs cites one; a row of TYPICAL outputs cites another.
   */
  design: z.literal(true).optional(),
};

export const sourceEntry = z.object({ id: sourceId, ...entryFields }).strict();
/** An entry of a shared sources file (`M#`); same fields as a topic source. */
export const sharedSourceEntry = z.object({ id: sharedSourceId, ...entryFields }).strict();
export type SourceEntry = z.output<typeof sourceEntry>;

function noDuplicates(file: { sources: { id: string }[] }, ctx: z.RefinementCtx): void {
  const seen = new Set<string>();
  file.sources.forEach((s, i) => {
    if (seen.has(s.id)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['sources', i, 'id'], message: `duplicate source id "${s.id}"` });
    }
    seen.add(s.id);
  });
}

export const sourcesFile = z.object({ sources: z.array(sourceEntry) }).strict().superRefine(noDuplicates);
export type SourcesFile = z.output<typeof sourcesFile>;

/** A shared sources file (`M#` ids). */
export const sharedSourcesFile = z.object({ sources: z.array(sharedSourceEntry) }).strict().superRefine(noDuplicates);

/** Ids declared in a parsed sources file (empty when the topic has none). */
export function sourceIds(file: SourcesFile | undefined): Set<string> {
  return new Set((file?.sources ?? []).map((s) => s.id));
}
