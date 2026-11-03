/** Complete on-screen geometry count, including loaded specimen meshes. */
import { readFileSync } from 'node:fs';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
import { partSchema } from '../../../src/engines/space-scene/schema';
import { partPieces } from '../../../src/engines/space-scene/stages/model3d/geometry';
const staged=process.argv.includes('--staging');
const json=staged?'/tmp/atlas-living-polish/parts.json':'src/content/topics/living-things/data/parts.json';
const glb=staged?'/tmp/atlas-living-polish/living-things.glb':'public/models/living-things.glb';
await MeshoptDecoder.ready;
const file=JSON.parse(readFileSync(json,'utf8')),doc=await new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder}).read(glb);
let total=0,calls=0;
for(const raw of file.parts){const part=partSchema.parse(raw);let tris=0;
 if(part.mesh){const node=doc.getRoot().listNodes().find(n=>n.getName()===part.mesh)!;for(const p of node.getMesh()!.listPrimitives())tris+=(p.getIndices()?.getCount()??p.getAttribute('POSITION')!.getCount())/3;calls++;}
 else for(const p of partPieces(part)){if(p.lines){p.geometry.dispose();continue;}tris+=(p.geometry.index?.count??p.geometry.getAttribute('position').count)/3*(p.matrices?.length??1);calls++;p.geometry.dispose();}
 total+=tris;console.log(`${part.id.padEnd(20)} ${String(tris).padStart(7)} tris`);
}
console.log(`total ${total} triangles, ${calls} pieces (all parts, before visibility)`);
if(total>300000)process.exitCode=1;
