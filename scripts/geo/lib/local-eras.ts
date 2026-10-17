/**
 * The island coast by date (`pipeline.localLand.eras`, docs/28 §3.3 / P1):
 * the pure parts of local-land.ts — recipe checks, where an era's traced
 * inputs live, the properties each era's land is written with, today's
 * coastline as lines, and folding the per-layer topology mapshaper writes into
 * the single object the GeoStage reads (lib/localLand.ts). Unit-tested in
 * tests/geo-local-land.test.ts.
 */
import { join } from 'node:path';
import type { Position } from 'geojson';
import { datedWindow, eraSequenceIssues } from '../../../src/engines/time-scene/lib/dated';
import type { LocalLandEra } from './manifest';
import { repoPath } from './topic';

/** Problems of an `eras` recipe list: ids present and unique, and the `[from, to)` windows tiling time once (no overlap, no gap). */
export function eraRecipeIssues(eras: readonly LocalLandEra[]): string[] {
  const issues: string[] = [];
  const seen = new Set<string>();
  for (const [i, e] of eras.entries()) {
    if (!e.id) issues.push(`era #${i} has no id`);
    else if (seen.has(e.id)) issues.push(`duplicate era id ${e.id}`);
    seen.add(e.id);
  }
  const name = (k: number) => eras[k]?.id || `#${k}`;
  for (const m of eraSequenceIssues(eras.map((e) => datedWindow(e.from, e.to)))) issues.push(m.replace(/#(\d+)/g, (_, k: string) => name(Number(k))));
  return issues;
}

/** An era input (`outline` / `minus` / `plus`): relative to the topic folder `dir` under `work/` or `raw/`, else to the repo. */
export function eraInputPath(dir: string, path: string): string {
  return /^(work|raw)\//.test(path) ? join(dir, path) : repoPath(path);
}

/** Properties of an era's land: `kind: land`, its id, its window and its map sources. */
export function eraProperties(era: LocalLandEra): Record<string, unknown> {
  const p: Record<string, unknown> = { kind: 'land', id: era.id };
  if (era.from) p.from = era.from;
  if (era.to) p.to = era.to;
  if (era.src?.length) p.src = [...era.src];
  return p;
}

/** Today's coastline from today's land polygons: their exterior rings (holes are inland water, not coast). */
export function coastTodayLines(polygons: readonly Position[][][]): Position[][] {
  return polygons.map((p) => p[0]!).filter((r) => r && r.length >= 2);
}

/**
 * Fold the objects mapshaper wrote one per layer (`layers`, in order) into
 * one GeometryCollection named `id`, dropping null geometries. The arcs stay
 * shared: a shoreline two eras have in common is one arc.
 */
export function foldTopology<T extends { objects: object }>(topo: T, layers: readonly string[], id: string): T {
  const objects = topo.objects as Record<string, { geometries?: { type: string | null }[] } | undefined>;
  const geometries = layers.flatMap((n) => objects[n]?.geometries ?? []).filter((g) => g.type !== null);
  return { ...topo, objects: { [id]: { type: 'GeometryCollection', geometries } } };
}
