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

export const sourceEntry = z
  .object({
    id: sourceId,
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
  })
  .strict();
export type SourceEntry = z.output<typeof sourceEntry>;

export const sourcesFile = z
  .object({ sources: z.array(sourceEntry) })
  .strict()
  .superRefine((file, ctx) => {
    const seen = new Set<string>();
    file.sources.forEach((s, i) => {
      if (seen.has(s.id)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['sources', i, 'id'], message: `duplicate source id "${s.id}"` });
      }
      seen.add(s.id);
    });
  });
export type SourcesFile = z.output<typeof sourcesFile>;

/** Ids declared in a parsed sources file (empty when the topic has none). */
export function sourceIds(file: SourcesFile | undefined): Set<string> {
  return new Set((file?.sources ?? []).map((s) => s.id));
}
