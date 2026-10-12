/**
 * Build-time checks of a topic's glb model (docs/16 §9 M1), used by
 * `pnpm validate`: the file exists under public/, is within the size budget,
 * carries its licence and attribution in `asset.copyright`, and has a node of
 * every name the parts (`mesh`, `bilateral.mesh` twins) and the rig name.
 *
 * Reads the node table with @gltf-transform/core's `readAsJSON` (the glTF JSON
 * and buffers, not decoded), so meshopt-compressed files need no decoder here.
 */
import { existsSync, statSync } from 'node:fs';
import { NodeIO } from '@gltf-transform/core';

/** A node name as three's GLTFLoader keeps it (PropertyBinding.sanitizeNodeName). */
export const loadedName = (name: string): string => name.replace(/\s/g, '_').replace(/[[\].:/]/g, '');

/** Hard cap of one topic's glb (docs/16 §2.2: target 4 MB, cap 8 MB). */
export const GLB_MAX_BYTES = 8 * 1024 * 1024;

export interface GlbNodeRef {
  node: string;
  /** What names it, for the message (`part "pec-major" mesh`). */
  what: string;
}

/** The node names of the glb at `path` (empty when it cannot be read). */
export async function glbNodeNames(path: string): Promise<Set<string>> {
  if (!existsSync(path)) return new Set();
  try {
    const json = (await new NodeIO().readAsJSON(path)).json as { nodes?: { name?: string }[] };
    return new Set((json.nodes ?? []).map((n) => n.name).filter((n): n is string => typeof n === 'string'));
  } catch {
    return new Set();
  }
}

/** Problems with the glb at `path` (empty when it is fine). */
export async function glbIssues(path: string, nodes: readonly GlbNodeRef[]): Promise<string[]> {
  if (!existsSync(path)) return ['file not found under public/'];
  const out: string[] = [];
  const bytes = statSync(path).size;
  if (bytes > GLB_MAX_BYTES) out.push(`${(bytes / 1024 / 1024).toFixed(2)} MB is over the ${GLB_MAX_BYTES / 1024 / 1024} MB budget`);
  let json: { asset?: { copyright?: string }; nodes?: { name?: string }[]; meshes?: { name?: string }[] };
  try {
    json = (await new NodeIO().readAsJSON(path)).json as typeof json;
  } catch (e) {
    return [...out, `not a readable glTF binary (${(e as Error).message})`];
  }
  if (!json.asset?.copyright?.trim()) out.push('asset.copyright is empty (licence and attribution of the meshes go there)');
  const names = new Set((json.nodes ?? []).map((n) => n.name).filter((n): n is string => typeof n === 'string'));
  for (const ref of nodes) if (!names.has(ref.node)) out.push(`${ref.what}: no node named "${ref.node}"`);
  // three's loader strips `.` `:` `/` `[` `]` from names: two names must not become one.
  const seen = new Map<string, string>();
  for (const name of names) {
    const key = loadedName(name);
    const other = seen.get(key);
    if (other !== undefined && other !== name) out.push(`nodes "${other}" and "${name}" load under the same name "${key}"`);
    seen.set(key, name);
  }
  return out;
}
