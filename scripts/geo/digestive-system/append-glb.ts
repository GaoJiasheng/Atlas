/** Append original topic sculptures without re-encoding an anatomy accessor.
 * Both inputs use the repository's local meshopt + quantization pipeline.
 * The entire original BIN chunk and every original JSON array entry survive.
 */
type Json = Record<string, any>;
export function unpackGlb(b: Buffer): { json: Json; bin: Buffer } {
  if (b.readUInt32LE(0) !== 0x46546c67) throw new Error('Expected GLB');
  const length = b.readUInt32LE(12), start = 20 + length;
  return { json: JSON.parse(b.subarray(20, start).toString()), bin: b.subarray(start + 8, start + 8 + b.readUInt32LE(start)) };
}
export function appendGlb(original: Buffer, additions: Buffer): Buffer {
  const a = unpackGlb(original), b = unpackGlb(additions), j = a.json, fresh = b.json;
  if (fresh.images || fresh.skins || fresh.animations) throw new Error('Sculpt packet must be static geometry');
  const align = (n: number) => Math.ceil(n / 4) * 4;
  const physical = align(a.bin.length), fallback = align(j.buffers[1]?.byteLength ?? 0);
  const offsets = Object.fromEntries(['accessors', 'bufferViews', 'materials', 'meshes', 'nodes'].map(k => [k, (j[k] ?? []).length]));
  const addedViews = (fresh.bufferViews ?? []).map((v: Json) => {
    const out = structuredClone(v), compression = out.extensions?.EXT_meshopt_compression;
    out.byteOffset = (out.byteOffset ?? 0) + (out.buffer === 1 ? fallback : physical);
    if (compression) { compression.byteOffset += physical; compression.buffer = 0; }
    return out;
  });
  const addedAccessors = fresh.accessors.map((v: Json) => {
    if (v.sparse) throw new Error('Unexpected sparse accessor');
    return { ...v, bufferView: v.bufferView + offsets.bufferViews };
  });
  const addedMeshes = fresh.meshes.map((v: Json) => ({ ...v, primitives: v.primitives.map((p: Json) => ({ ...p,
    ...(p.indices !== undefined ? { indices: p.indices + offsets.accessors } : {}),
    attributes: Object.fromEntries(Object.entries(p.attributes).map(([k, i]) => [k, Number(i) + offsets.accessors])),
    ...(p.material !== undefined ? { material: p.material + offsets.materials } : {}),
  })) }));
  const addedNodes = fresh.nodes.map((v: Json) => ({ ...v,
    ...(v.mesh !== undefined ? { mesh: v.mesh + offsets.meshes } : {}),
    ...(v.children ? { children: v.children.map((i: number) => i + offsets.nodes) } : {}),
  }));
  for (const [k, values] of Object.entries({ accessors: addedAccessors, bufferViews: addedViews, materials: fresh.materials ?? [], meshes: addedMeshes, nodes: addedNodes })) j[k] = [...(j[k] ?? []), ...values];
  const roots = fresh.scenes[fresh.scene ?? 0].nodes.map((i: number) => i + offsets.nodes);
  j.scenes[j.scene ?? 0].nodes.push(...roots);
  j.buffers = [{ byteLength: physical + align(b.bin.length) }, { byteLength: fallback + align(fresh.buffers[1]?.byteLength ?? 0), extensions: { EXT_meshopt_compression: { fallback: true } } }];
  for (const k of ['extensionsUsed', 'extensionsRequired']) j[k] = [...new Set([...(j[k] ?? []), ...(fresh[k] ?? [])])];
  j.asset.extras = { ...(j.asset.extras ?? {}), atlasSculptures: { generator: 'scripts/geo/digestive-system/rebuild.ts', copyright: 'Original Atlas procedural close-ups, CC0-1.0; original organ asset copyright retained.' } };
  const raw = Buffer.from(JSON.stringify(j)), json = Buffer.alloc(align(raw.length), 32); raw.copy(json);
  const bin = Buffer.concat([a.bin, Buffer.alloc(physical - a.bin.length), b.bin], j.buffers[0].byteLength);
  const out = Buffer.alloc(28 + json.length + bin.length);
  out.writeUInt32LE(0x46546c67, 0); out.writeUInt32LE(2, 4); out.writeUInt32LE(out.length, 8);
  out.writeUInt32LE(json.length, 12); out.writeUInt32LE(0x4e4f534a, 16); json.copy(out, 20);
  out.writeUInt32LE(bin.length, 20 + json.length); out.writeUInt32LE(0x004e4942, 24 + json.length); bin.copy(out, 28 + json.length);
  return out;
}
