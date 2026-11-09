import type { EngineId } from './types';
import type { SimKind } from '../space-scene/sim-schema';

/** Engine data is validated at build time; keep feature selection independent of renderers. */
export function needsPartFill(engine: EngineId, data: unknown): boolean {
  if (engine !== 'space-scene') return false;
  const file = data as { parts?: { sim?: { bind?: { part?: string; fill?: unknown }[] } } } | null;
  return file?.parts?.sim?.bind?.some(binding => binding.part !== undefined && binding.fill !== undefined) ?? false;
}

export function needsSimTimeText(engine: EngineId, data: unknown): boolean {
  if (engine !== 'space-scene') return false;
  const file = data as { parts?: { sim?: { controls?: { format?: string }[]; outputs?: { format?: string }[] } } } | null;
  const sim = file?.parts?.sim;
  return [...(sim?.controls ?? []), ...(sim?.outputs ?? [])].some(field => field.format === 'time');
}

export function needsSimTools(engine: EngineId, data: unknown): boolean {
  return engine === 'space-scene' && !!(data as { parts?: { sim?: unknown } } | null)?.parts?.sim;
}

/** Complete data-selected dependencies before the engine renders or signals its first frame. */
export async function prepareEngineData(engine: EngineId, data: unknown): Promise<void> {
  const pending: Promise<unknown>[] = [];
  if (needsSimTools(engine, data)) {
    pending.push(import('../space-scene/lib/sim/sim-tools-resource').then(m => m.loadSimTools()));
    const kind = (data as { parts: { sim: { kind?: SimKind } } }).parts.sim.kind;
    if (!import.meta.env.SSR && kind) pending.push(import('../space-scene/lib/sim/runtime').then(m => m.loadSim(kind)));
  }
  if (needsPartFill(engine, data)) pending.push(import('../space-scene/lib/sim/part-fill').then(m => m.loadPartFill()));
  if (needsSimTimeText(engine, data)) pending.push(import('../space-scene/lib/sim/time-text').then(m => m.loadTimeText()));
  await Promise.all(pending);
}
