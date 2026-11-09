/** Round four fish; retained gill/plant streams are compacted without resculpting. */
import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
import {Float32BufferAttribute} from 'three';
import {Document,NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {meshopt,weld,dedup} from '@gltf-transform/functions';
import {MeshoptEncoder,MeshoptDecoder,MeshoptSimplifier} from 'meshoptimizer';
import {fishSculpt,fishMembraneSculpt,coverSculpt,CRANIAL_STATS} from './sculpt-fish';
import {appendGlb} from './append-glb';
import {compactAccepted} from './compact-accepted';
export async function buildFish(round=420){
 const out=`/tmp/atlas-heart-round4/round${round}`;fs.mkdirSync(out,{recursive:true});
 await Promise.all([MeshoptEncoder.ready,MeshoptDecoder.ready,MeshoptSimplifier.ready]);
 const d=new Document(),b=d.createBuffer(),scene=d.createScene('freshwater-perch'),stats:Record<string,unknown>={};
 const solid=fishSculpt(),web=fishMembraneSculpt(),cover=coverSculpt();
 // Each web is a separate BLEND primitive; rays, skin and eyes are opaque.
 for(const g of [solid,...web,cover]){
  const c=g.getAttribute('color'),uv=g.getAttribute('uv'),rgba:number[]=[];
  const membrane=web.includes(g);
  for(let i=0;i<c.count;i++){const v=uv?.getY(i)??0;rgba.push(c.getX(i),c.getY(i),c.getZ(i),membrane?.32+.24*Math.exp(-v*5):1);}
  g.setAttribute('color',new Float32BufferAttribute(rgba,4));g.deleteAttribute('uv');
 }
 for(const [id,geometries] of Object.entries({'fish-body':[solid,...web],'gill-cover':[cover]})){
  const mesh=d.createMesh(id);let triangles=0;
  for(const g of geometries){
   const p=d.createPrimitive();for(const [a,semantic] of [['position','POSITION'],['normal','NORMAL'],['color','COLOR_0']] as const)p.setAttribute(semantic,d.createAccessor().setType(a==='color'?'VEC4':'VEC3').setArray(new Float32Array(g.getAttribute(a).array)).setBuffer(b));
   p.setIndices(d.createAccessor().setType('SCALAR').setArray(new Uint32Array(g.index!.array)).setBuffer(b));
   const mat=d.createMaterial(`${id}-surface`).setRoughnessFactor(.57).setMetallicFactor(0).setExtras({atlasSurface:true});
   if(web.includes(g))mat.setAlphaMode('BLEND').setDoubleSided(true).setRoughnessFactor(.46);

   p.setMaterial(mat);mesh.addPrimitive(p);triangles+=g.index!.count/3;g.dispose();
  }
  scene.addChild(d.createNode(id).setMesh(mesh).setExtras({closed:true,...(id==='fish-body'?{atlasSurfaceGroup:true}:{})}));stats[id]={triangles,drawCalls:geometries.length};
 }
 await d.transform(weld(),dedup(),meshopt({encoder:MeshoptEncoder,level:'high',quantizePosition:16,quantizeNormal:12,quantizeColor:12}));
 for(const node of scene.listChildren()){const primitives=node.getMesh()!.listPrimitives();stats[node.getName()]={triangles:primitives.reduce((sum,p)=>sum+p.getIndices()!.getCount()/3,0),drawCalls:primitives.length};}
 const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.encoder':MeshoptEncoder,'meshopt.decoder':MeshoptDecoder}),packet=Buffer.from(await io.writeBinary(d));
 if(packet.length>600000)throw new Error('Fish packet exceeds 600 KB');
 const retained=await compactAccepted(fs.readFileSync('scripts/geo/heart-and-lungs/accepted-sculpt.glb'));
 const base=appendGlb(fs.readFileSync('public/models/heart-and-lungs.glb'),retained.bytes);
 const combined=appendGlb(base,packet);
 fs.writeFileSync('public/models/heart-and-lungs-bench.glb',combined);
 fs.writeFileSync('scripts/geo/heart-and-lungs/fish-packet.glb',packet);
 const parts=JSON.parse(fs.readFileSync('src/content/topics/heart-and-lungs/data/parts.json','utf8'));
 fs.writeFileSync('src/content/topics/heart-and-lungs/data/parts.json',JSON.stringify(parts,null,1)+'\n');fs.writeFileSync(`${out}/parts.json`,JSON.stringify(parts,null,1)+'\n');
 fs.writeFileSync(`${out}/stats.json`,JSON.stringify({round,parts:stats,fishPacketBytes:packet.length,combinedBytes:combined.length,retainedAccepted:retained.stats,cranial:CRANIAL_STATS},null,2)+'\n');
 console.log({round,parts:stats,fishPacketBytes:packet.length,combinedBytes:combined.length});
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)await buildFish(Number(process.argv[2]??420));
