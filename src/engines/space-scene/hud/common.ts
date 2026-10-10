/** Shared bits of the SpaceScene HUD drawings. */
import { resolveColorRef } from '../../../theme/theme';
import type { StopSpan } from '../lib/flow-stops';
import { numberedParts } from '../lib/schematic';
import type { Flow, PartsFile } from '../schema';

/** Two-digit part number (data order, context parts skipped; a bilateral twin shares its part's), as in the card, panels and status line. */
export function partNumber(file: PartsFile, id: string): string {
  const own = file.parts.find((p) => p.id === id)?.twinOf ?? id;
  const i = numberedParts(file.parts).findIndex((p) => p.id === own);
  return i < 0 ? '--' : String(i + 1).padStart(2, '0');
}

/** Whether a flow is moving now (run + layer on, or an always-on flow). */
export function isFlowing(f: Pick<Flow, 'whenRun' | 'group'>, run: boolean, layers: readonly string[]): boolean {
  return (run || !f.whenRun) && layers.includes(f.group);
}

/** Groups whose flows are moving now (run + layer on, or always-on flows). */
export function flowingGroups(file: PartsFile, run: boolean, layers: readonly string[]): Map<string, string> {
  const out = new Map<string, string>();
  for (const f of file.flows) if (isFlowing(f, run, layers) && !out.has(f.group)) out.set(f.group, f.color);
  return out;
}

/** CSS colour of a stop span (a `color-mix` between the two stops). */
export function spanCss(span: StopSpan): string {
  const a = resolveColorRef(span.a);
  if (span.k <= 0.001 || span.a === span.b) return a;
  const b = resolveColorRef(span.b);
  if (span.k >= 0.999) return b;
  return `color-mix(in srgb, ${b} ${Math.round(span.k * 100)}%, ${a})`;
}

/** Cut a single line to `max` characters with an ellipsis. */
export function clip(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, Math.max(1, max - 1)).trimEnd()}…`;
}
