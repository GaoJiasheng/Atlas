/**
 * When OrbitDriver may publish a rendered snapshot reading (`bridge.orbitRendered.snapshotId`).
 *
 * The reading claims "these are the transforms drawn for snapshot N", so it waits until every body the snapshot
 * places is on the stage. A glb body without a stand-in has no part node (and no handle) until the model has loaded;
 * a frame before that would otherwise publish the snapshot id with those bodies missing. Parts that will never be
 * drawn (no shape and no glb coming, e.g. the model failed) are not waited for.
 */
export function orbitReadingComplete(
  ids: Iterable<string>,
  expected: ReadonlySet<string>,
  handles: ReadonlyMap<string, { object: unknown }>,
): boolean {
  for (const id of ids) if (expected.has(id) && !handles.get(id)?.object) return false;
  return true;
}

/** The parts that will get a part node: a shape now, or a glb mesh the stage still expects to load. */
export function orbitExpectedParts(
  parts: readonly { id: string; mesh?: string | undefined }[],
  shapes: ReadonlyMap<string, unknown>,
  modelExpected: boolean,
): Set<string> {
  return new Set(parts.filter((p) => shapes.has(p.id) || (modelExpected && p.mesh !== undefined)).map((p) => p.id));
}
