/**
 * Topic glossary, `data/glossary.json` (docs/06 "名词表"). Shared by every
 * engine: chapter bodies mark a term with `<Term id="blitzkrieg">…</Term>`,
 * which opens its definition in the reading panel's inspector; the control
 * panel's TOOLS list every term. `pnpm validate` checks every `<Term id>` and
 * every `see` reference.
 */
import { z } from 'zod';
import { bilingual, kebabId } from './common';

export const glossaryTerm = z
  .object({
    id: kebabId,
    /** The word as it appears in each language. */
    term: bilingual,
    /** One or two plain sentences: what it means in this topic. */
    definition: bilingual,
    /** Related terms (ids in this file), shown as links under the definition. */
    see: z.array(kebabId).optional(),
  })
  .strict();
export type GlossaryTerm = z.output<typeof glossaryTerm>;

export const glossaryFile = z
  .object({ terms: z.array(glossaryTerm) })
  .strict()
  .superRefine((file, ctx) => {
    const ids = new Set<string>();
    file.terms.forEach((term, i) => {
      if (ids.has(term.id)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['terms', i, 'id'], message: `duplicate term id "${term.id}"` });
      }
      ids.add(term.id);
    });
    file.terms.forEach((term, i) =>
      (term.see ?? []).forEach((ref, j) => {
        if (ref === term.id) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['terms', i, 'see', j], message: `term "${term.id}" refers to itself` });
        } else if (!ids.has(ref)) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['terms', i, 'see', j], message: `unknown term "${ref}"` });
        }
      }),
    );
  });
export type GlossaryFile = z.output<typeof glossaryFile>;

/** Term ids declared in a parsed glossary (empty when the topic has none). */
export function glossaryIds(file: GlossaryFile | undefined): Set<string> {
  return new Set((file?.terms ?? []).map((term) => term.id));
}
