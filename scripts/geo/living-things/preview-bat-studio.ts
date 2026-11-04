/** Decode the actual candidate; export studio rig and RoomEnvironment for CPU QA. */
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {dequantize} from '@gltf-transform/functions';
import {MeshoptDecoder} from 'meshoptimizer';
import {Matrix3,Matrix4,Vector3,Color,Mesh,MeshLambertMaterial,Raycaster} from 'three';
import sharp from 'sharp';
import {resolveMaterialLook} from '../../../src/engines/space-scene/lib/color';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
const runtimeFinish=readFileSync('src/engines/space-scene/stages/model3d/GltfSource.tsx','utf8').includes('source.userData.atlasRoughness');
const out=process.argv[2]??'/tmp/atlas-living-bat-round2/iteration2';mkdirSync(out,{recursive:true});
await MeshoptDecoder.ready;
const path=process.argv[3]??'/tmp/atlas-living-polish/living-things.glb';
const doc=await new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder}).read(path);await doc.transform(dequantize());
const node=doc.getRoot().listNodes().find(n=>n.getName()==='fruit-bat')!,g=node.getMesh()!.listPrimitives()[0]!,ix=g.getIndices()!;
const w=new Matrix4().fromArray(node.getWorldMatrix()),nm=new Matrix3().getNormalMatrix(w);
const positions:number[][]=[],normals:number[][]=[],colours:number[][]=[],uvs:number[][]=[],finish:number[]=[];
for(let t=0;t<ix.getCount();t+=3){const p:number[]=[],n:number[]=[],c:number[]=[],uv:number[]=[];let f=0;
 for(let j=0;j<3;j++){const i=ix.getScalar(t+j);p.push(...new Vector3(...g.getAttribute('POSITION')!.getElement(i,[0,0,0]) as [number,number,number]).applyMatrix4(w).add(new Vector3(.5,-.004,.345)).toArray());n.push(...new Vector3(...g.getAttribute('NORMAL')!.getElement(i,[0,0,0]) as [number,number,number]).applyMatrix3(nm).normalize().toArray());c.push(...g.getAttribute('COLOR_0')!.getElement(i,[0,0,0]));uv.push(...g.getAttribute('TEXCOORD_0')!.getElement(i,[0,0]));f+=g.getAttribute('TEXCOORD_1')?.getElement(i,[0,0])[0]??.25;}
 positions.push(p);normals.push(n);colours.push(c);uvs.push(uv);finish.push(f/3>.5?1:0);
}
// Read the lighting values from engine source, so the offline study cannot drift.
const source=readFileSync('src/engines/space-scene/stages/model3d/Lighting.tsx','utf8');
const rig=source.match(/paper: \{([\s\S]*?)\n  \}/)![1]!;
const colors=(s:string)=>[...s.matchAll(/'(#\w+)'/g)].map(m=>new Color(m[1]!).toArray());
const lights=['KEY','FILL','RIM'].map((name,i)=>{const xyz=source.match(new RegExp(`const ${name}_DIR: Vec3 = normalize3\\(\\[([^\\]]+)`))![1]!.split(',').map(Number),entry=rig.match(new RegExp(`${['key','fill','rim'][i]}: \\[([^\\]]+)`))![1]!;return {dir:new Vector3(...xyz as [number,number,number]).normalize().toArray(),color:colors(entry)[0],intensity:Number(entry.split(',')[1])};});
const hemi=rig.match(/hemi: \[([^\]]+)/)![1]!;
const lighting={lights,hemi:colors(hemi),hemiIntensity:Number(hemi.split(',')[2]),environment:Number(rig.match(/env: ([\d.]+)/)![1]),exposure:Number(rig.match(/exposure: ([\d.]+)/)![1])};
// Capture the SAME procedural room via CPU rays. PBR raster convolves this
// cubical room radiance numerically, rather than inventing a different softbox.
const room=new RoomEnvironment();room.updateMatrixWorld(true);const ray=new Raycaster(),dir=new Vector3(),point=new Vector3(.418,16.199,.300),env:number[]=[];const W=256,H=128;
for(let y=0;y<H;y++)for(let x=0;x<W;x++){
 const a=(x+.5)/W*Math.PI*2,b=(y+.5)/H*Math.PI;dir.set(Math.sin(b)*Math.cos(a),Math.cos(b),Math.sin(b)*Math.sin(a));ray.set(new Vector3(),dir);
 const hit=ray.intersectObjects(room.children,false)[0];let rgb=new Vector3(.05,.05,.05);
 if(hit){const mesh=hit.object as Mesh,mat=mesh.material as MeshLambertMaterial;if(mat.emissive?.getHex()>0)rgb.fromArray(mat.emissive.toArray()).multiplyScalar(mat.emissiveIntensity);
 else {const normal=hit.normal!.clone().transformDirection(mesh.matrixWorld);if(normal.dot(dir)>0)normal.negate();const L=point.clone().sub(hit.point),d=L.length(),atten=Math.pow(Math.max(0,1-Math.pow(d/28,4)),2)/(d*d);rgb.setScalar(900*atten*Math.max(0,normal.dot(L.normalize()))/Math.PI);}}
 env.push(...rgb.toArray());
}
room.dispose();
const mask=g.getMaterial()?.getMetallicRoughnessTexture()?.getImage();
const maskPixels=mask?await sharp(Buffer.from(mask)).removeAlpha().raw().toBuffer():null;
const factor=resolveMaterialLook('fabric',{},'paper','#ffffff').roughness;
const regionRoughness=maskPixels?[factor*maskPixels[1]!/255,factor*maskPixels[4]!/255]:null;
writeFileSync(`${out}/geometry.json`,JSON.stringify({positions,normals,colours,uvs,finish,regionRoughness,finishActive:runtimeFinish&&g.getMaterial()?.getExtras().atlasRoughness===true,lighting,environment:{width:W,height:H,pixels:env},camera:{target:[.320,.0546,.063],distance:.35,fov:5},bytes:readFileSync(path).byteLength}));
console.log(`Exported ${positions.length} decoded bat triangles and engine studio rig to ${out}`);
