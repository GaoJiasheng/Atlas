/** Shared bits of the SpaceScene HUD drawings. */
import type { PartsFile } from '../schema';

/** Two-digit part number (data order), as in the card, panels and status line. */
export function partNumber(file: PartsFile, id: string): string {
  const i = file.parts.findIndex((p) => p.id === id);
  return i < 0 ? '--' : String(i + 1).padStart(2, '0');
}

/** Groups whose flows are moving now (run + layer on, or always-on flows). */
export function flowingGroups(file: PartsFile, run: boolean, layers: readonly string[]): Map<string, string> {
  const out = new Map<string, string>();
  for (const f of file.flows) if ((run || !f.whenRun) && layers.includes(f.group) && !out.has(f.group)) out.set(f.group, f.color);
  return out;
}

/** Cut a single line to `max` characters with an ellipsis. */
export function clip(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, Math.max(1, max - 1)).trimEnd()}…`;
}
