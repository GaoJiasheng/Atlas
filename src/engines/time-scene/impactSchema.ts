/** Optional, source-defined event impact estimates (docs/49 §4.3). */
import { z } from 'zod';
import { bilingual, isoDate, kebabId } from '../../content/schema/common';
import { sourceId } from '../../content/schema/sources';

const impactText = bilingual.refine((value) => !!value.zh.trim(), { path: ['zh'], message: 'Chinese text is required for impact records' }).refine((value) => !!value.en.trim(), { path: ['en'], message: 'English text is required for impact records' });
const value = z.number().finite().int().nonnegative();
const sources = z.array(sourceId).min(1, 'impact records need at least one source');

export const impactRecordSchema = z.object({
  id: kebabId,
  measure: z.enum(['deaths', 'dead-or-missing-presumed-dead']),
  estimate: z.object({ kind: z.enum(['reported', 'about', 'more-than']), value }).strict(),
  label: impactText,
  scope: impactText,
  sourceAsOf: isoDate.refine((date) => !date.startsWith('-'), 'source date must use YYYY, YYYY-MM or YYYY-MM-DD'),
  sourceDateKind: z.enum(['publication', 'accessed']),
  sources,
  components: z.array(z.object({ id: kebabId, label: impactText, value, sources }).strict()).min(1).optional(),
  componentsComplete: z.boolean().optional(),
}).strict().superRefine((record, ctx) => {
  const issue = (path: (string | number)[], message: string) => ctx.addIssue({ code: z.ZodIssueCode.custom, path, message });
  if (record.componentsComplete !== undefined && !record.components)
    issue(['componentsComplete'], '`componentsComplete` needs components');
  if (record.components) {
    const sum = record.components.reduce((total, component) => total + component.value, 0);
    if (sum > record.estimate.value) issue(['components'], 'component values must not exceed the total estimate');
    if (record.componentsComplete === true) {
      if (record.estimate.kind !== 'reported') issue(['componentsComplete'], 'complete components require a reported total');
      if (sum !== record.estimate.value) issue(['componentsComplete'], 'complete component values must equal the total');
    }
    const seen = new Set([record.id]);
    record.components.forEach((component, index) => {
      if (seen.has(component.id)) issue(['components', index, 'id'], `duplicate impact id "${component.id}"`);
      seen.add(component.id);
    });
  }
});

export type ImpactRecord = z.output<typeof impactRecordSchema>;
