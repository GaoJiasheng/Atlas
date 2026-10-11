import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
import { getBounds } from '@gltf-transform/core';
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder });
const doc = await io.read(process.argv[2]);
const root = doc.getRoot();
console.log('copyright:', root.getAsset().copyright?.slice(0, 80));
console.log('skins:', root.listSkins().length, 'nodes:', root.listNodes().length, 'meshes:', root.listMeshes().length);
let tris = 0;
for (const n of root.listNodes()) {
  const m = n.getMesh(); if (!m) continue;
  const b = getBounds(n); const c = b.min.map((v, i) => ((v + b.max[i]) / 2).toFixed(3));
  const t = m.listPrimitives().reduce((s, p) => s + (p.getIndices()?.getCount() ?? 0) / 3, 0); tris += t;
  const attrs = m.listPrimitives()[0].listSemantics().join(',');
  console.log(n.getName().padEnd(34), 'c', c.join(' '), 'size', b.max.map((v,i)=>(v-b.min[i]).toFixed(2)).join(' '), 'tris', t, n.getSkin() ? 'skinned' : '', attrs);
}
console.log('total tris', tris);
