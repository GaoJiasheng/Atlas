/** Straight variable-length links between two transformed part-local points. */
import { z } from 'zod';
import { kebabId, vec3 } from '../../content/schema/common';
import type { MatterPart } from './matter-schema';

const endpoint = z.object({ part: kebabId, point: vec3.refine((p) => p.every(Number.isFinite), 'span point must be finite') }).strict();
export const spanSchema = z.object({ from: endpoint, to: endpoint, minLength: z.number().finite().positive().default(0.001) }).strict();
export type SimSpan = z.output<typeof spanSchema>;

type Bind = { part?: string | readonly string[]; span?: SimSpan; [key: string]: unknown };
interface SpanContext {
  parts: ReadonlySet<string>;
  partData?: readonly MatterPart[];
  repeated?: ReadonlySet<string>;
  contextParts?: ReadonlySet<string>;
  animations: ReadonlyMap<string, { target: string }>;
}

/** Paths are relative to sim. Span is a geometry branch, with no source. */
export function spanIssues(bind: readonly Bind[], ctx: SpanContext): { path: (string | number)[]; message: string }[] {
  const out: { path: (string | number)[]; message: string }[] = [];
  const issue = (i: number, message: string) => out.push({ path: ['bind', i, 'span'], message });
  const spans = bind.flatMap((b, i) => b.span ? [{ b, i }] : []);
  const targets = new Set(spans.flatMap(({ b }) => typeof b.part === 'string' ? [b.part] : []));
  const seen = new Set<string>();
  if (spans.length > 16) out.push({ path: ['bind'], message: 'at most 16 span bindings per topic' });
  for (const { b, i } of spans) {
    const id = b.part;
    if (typeof id !== 'string') { issue(i, 'span needs exactly one target part'); continue; }
    if (!ctx.parts.has(id)) issue(i, `unknown span target "${id}"`);
    if (seen.has(id)) issue(i, `duplicate span for "${id}"`);
    seen.add(id);
    if (Object.keys(b).some((key) => key !== 'part' && key !== 'span' && b[key] !== undefined)) issue(i, 'span accepts only part + span, with no control, output or other binding');
    const part = ctx.partData?.find((p) => p.id === id);
    if (part) {
      const p = part.primitive;
      if (!p || p.kind !== 'cylinder' || p.size[2] !== 1 || p.rotation?.some((v) => v !== 0) || p.scale?.some((v) => v !== 1) || p.mirror) issue(i, `span target "${id}" needs a Y-axis cylinder of height 1 with no primitive rotation, scale or mirror`);
      if (part.repeat !== undefined || (part.extra?.length ?? 0) > 0) issue(i, `span target "${id}" cannot have repeat or extra`);
    }
    if (ctx.contextParts?.has(id)) issue(i, `span target "${id}" cannot be context`);
    for (const end of [b.span!.from, b.span!.to]) {
      if (!ctx.parts.has(end.part)) issue(i, `unknown span endpoint "${end.part}"`);
      if (end.part === id) issue(i, 'span cannot reference itself');
      else if (targets.has(end.part)) issue(i, 'span endpoints cannot depend on another span (including cycles)');
      if (ctx.repeated?.has(end.part) || ctx.partData?.find((p) => p.id === end.part)?.repeat !== undefined) issue(i, `span endpoint "${end.part}" cannot be repeated`);
      if (ctx.partData && !ctx.partData.find((p) => p.id === end.part)?.primitive) issue(i, `span endpoint "${end.part}" needs a primary primitive`);
    }
    for (const other of bind) {
      if (other === b || other.span || other.part === undefined) continue;
      const ids = typeof other.part === 'string' ? [other.part] : other.part;
      if (ids.includes(id)) issue(i, `span target "${id}" cannot have another binding driver`);
    }
    for (const a of ctx.animations.values()) if (a.target === id) issue(i, `span target "${id}" cannot have an animation driver`);
  }
  return out;
}
