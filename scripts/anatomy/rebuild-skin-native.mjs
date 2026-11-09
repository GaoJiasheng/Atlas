/** Extract the actual native Regions surfaces, not the already decimated GLB skin.
 * CC BY-SA 4.0 Z-Anatomy. Requires an explicit offline source cache. */
import fs from 'node:fs/promises';
import {FBXLoader} from 'three/examples/jsm/loaders/FBXLoader.js';
import {Vector3} from 'three';
const cache=process.env.ATLAS_ANATOMY_CACHE;if(!cache)throw Error('Set ATLAS_ANATOMY_CACHE to the offline Z-Anatomy FBX cache.');
const manifest=JSON.parse(await fs.readFile('scripts/anatomy/arms/manifest.json','utf8')),wanted=new Set(manifest.parts.find(p=>p.id==='skin-outline').objects),bytes=await fs.readFile(cache+'/Regions of human body100.fbx');
const scene=new FBXLoader().parse(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');scene.updateMatrixWorld(true);
const positions=[],indices=[],lookup=new Map(),sources=[];const v=new Vector3();
scene.traverse(o=>{if(!o.isMesh)return;const name=o.userData.originalName??'';if(!wanted.has(name)&&!wanted.has(name.replace(/\.[lr]$/,'')))return;
 const p=o.geometry.attributes.position,remap=[];for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld).multiplyScalar(.01);const a=v.toArray(),key=a.map(x=>Math.round(x*1e7)).join(',');if(!lookup.has(key)){lookup.set(key,positions.length/3);positions.push(...a);}remap.push(lookup.get(key));}
 const ix=Array.from(o.geometry.index?.array??Array.from({length:p.count},(_,i)=>i),i=>remap[i]);if(o.matrixWorld.determinant()<0)for(let i=0;i<ix.length;i+=3)[ix[i+1],ix[i+2]]=[ix[i+2],ix[i+1]];indices.push(...ix);sources.push({name,triangles:ix.length/3});
});
await fs.writeFile('scripts/anatomy/cache/rebuild-skin-native.json',JSON.stringify({positions,indices,sources,license:'CC BY-SA 4.0',source:'https://github.com/LluisV/Z-Anatomy'}));console.log('native source skin',positions.length/3,indices.length/3,'from',sources.length,'exact panels');
