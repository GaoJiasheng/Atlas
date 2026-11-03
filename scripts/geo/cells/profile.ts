/** Offline startup proxies, not browser stage-ready or GPU timings.
 * pnpm tsx scripts/geo/cells/profile.ts [parts.json] [cells.glb]
 */
import { readFileSync } from 'node:fs';
import { performance } from 'node:perf_hooks';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { partsFile } from '../../../src/engines/space-scene/schema';
import { primitiveShape } from '../../../src/engines/space-scene/stages/model3d/shapes';
const file=partsFile.parse(JSON.parse(readFileSync(process.argv[2]??'src/content/topics/cells/data/parts.json','utf8')));
const bytes=readFileSync(process.argv[3]??`public${file.model}`);
const start=performance.now();let pieces=0,triangles=0,vertices=0;
for(const p of file.parts){
 const shape=primitiveShape(p);if(!shape)continue;
 for(const piece of shape.pieces){
  const n=piece.geometry.getAttribute('position').count,m=piece.matrices?.length??1;
  pieces++;vertices+=n;triangles+=(piece.geometry.index?.count??n)/3*m;piece.geometry.dispose();
 }
}
const generationMs=performance.now()-start;
const decodeStart=performance.now();await MeshoptDecoder.ready;const decoderReadyMs=performance.now()-decodeStart;
const parseStart=performance.now();
const gltf=await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
const parseMs=performance.now()-parseStart;let meshPieces=0,meshTriangles=0;
gltf.scene.traverse(o=>{if('isMesh'in o&&o.isMesh){const g=(o as import('three').Mesh).geometry;meshPieces++;meshTriangles+=(g.index?.count??g.getAttribute('position').count)/3;g.dispose();}});
console.log(JSON.stringify({generationMs,decoderReadyMs,parseMs,glbBytes:bytes.length,procedural:{pieces,triangles,vertices},mesh:{pieces:meshPieces,triangles:meshTriangles},totalTriangles:triangles+meshTriangles}));
