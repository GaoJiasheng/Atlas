/** Browser-free actual decoded meshopt kit, using runtime equipment finish. */
import fs from 'node:fs';
import sharp from 'sharp';
import { BufferAttribute, BufferGeometry, Color, Matrix4, Matrix3, Vector3 } from 'three';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dequantize } from '@gltf-transform/functions';
import { MeshoptDecoder } from 'meshoptimizer';
import { render, tokens, verifyRig, bounds, type Surface } from '../../anatomy/rebuild-evidence/studio';
const pass=process.argv[2]??'iteration1',root='scripts/anatomy/rebuild-evidence/gym';
await MeshoptDecoder.ready;
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder});
const doc=await io.read('public/models/muscles-core-gym.glb');await doc.transform(dequantize());
const gs=new Map<string,BufferGeometry>();
for(const node of doc.getRoot().listNodes()){
 const p=node.getMesh()?.listPrimitives()[0];if(!p)continue;
 const g=new BufferGeometry();for(const [a,s]of [['position','POSITION'],['normal','NORMAL']]as const)g.setAttribute(a,new BufferAttribute(new Float32Array(p.getAttribute(s)!.getArray()!),3));
 const indices=p.getIndices();if(indices)g.setIndex(new BufferAttribute(new Uint32Array(indices.getArray()!),1));
 g.applyMatrix4(new Matrix4().fromArray(node.getWorldMatrix()));gs.set(node.getName(),g);
}
function surfaces(id:string,theme:'paper'|'cinema',angle:number,elevation:number):Surface[]{
 const g=gs.get(id)!,i=g.index,ps=g.getAttribute('position'),ns=g.getAttribute('normal'),n=i?.count??ps.count;
 g.computeBoundingBox();const center=g.boundingBox!.getCenter(new Vector3()),theta=angle*Math.PI/180;
 const rot=new Matrix4().makeRotationAxis(new Vector3(Math.cos(theta),0,-Math.sin(theta)),elevation*Math.PI/180),nm=new Matrix3().getNormalMatrix(rot),positions=new Float32Array(n*3),normals=new Float32Array(n*3),v=new Vector3();
 for(let k=0;k<n;k++){const j=i?i.getX(k):k;v.fromBufferAttribute(ps,j).sub(center).applyMatrix4(rot).add(center);positions.set(v.toArray(),k*3);v.fromBufferAttribute(ns,j).applyMatrix3(nm).normalize();normals.set(v.toArray(),k*3);}
 return [{id,positions,normals,rgb:new Color(tokens(theme).neutral!),roughness:.68,metalness:0,envIntensity:.5}];
}
function fittedSize(shapes:Surface[],angle:number){
 const theta=angle*Math.PI/180;let lo=Infinity,hi=-Infinity;
 for(const s of shapes)for(let k=0;k<s.positions.length;k+=3){const x=s.positions[k]!*Math.cos(theta)-s.positions[k+2]!*Math.sin(theta);lo=Math.min(lo,x);hi=Math.max(hi,x);}
 return Math.max(bounds(shapes).getSize(new Vector3()).y,(hi-lo)*800/640)*1.18;
}
const refs:Record<string,string>={barbell:'Olympic_barbell.jpg',dumbbell:'Dumbells_and_free_weights_in_a_gym.jpg',bench:'WeightBenchSide.jpg',rack:'Power_Rack.JPG',cable:'Multifunctional_cable_and_row_machines_in_a_gym.jpg'};
const views=[{name:'front',angle:0,elevation:0},{name:'three-quarter',angle:45,elevation:18},{name:'profile',angle:90,elevation:0},{name:'detail',angle:63,elevation:12}];
const shots=[];
for(const id of Object.keys(refs))for(const view of views){
 const s=surfaces(id,'paper',view.angle,view.elevation),b=bounds(s),center=b.getCenter(new Vector3());
 let size=fittedSize(s,view.angle),target=center.toArray() as [number,number,number];
 if(view.name==='detail'){
  if(id==='barbell'){target=[.753,0,0];size=.35;}
  if(id==='dumbbell'){target=[.10,0,0];size=.24;}
  if(id==='bench'){target=[0,-.13,-.12];size=.63;}
  if(id==='rack'){target=[.60,1.13,0];size=.36;}
  if(id==='cable'){target=[0,.4,-.27];size=.8;}
 }
 const dir=`${root}/${pass}`;fs.mkdirSync(dir,{recursive:true});
 const image=`${dir}/${id}-${view.name}.png`;
 shots.push(await render(s,image,{angle:view.angle,width:640,height:800,size,target}));
 const photo=`${root}/refs/${id==='dumbbell'&&view.name==='detail'?'A_close-up_view_of_a_set_of_heavy_dumbbells.jpg':refs[id]}`,left=await sharp(image).png().toBuffer(),right=await sharp(photo).resize(640,800,{fit:'contain',background:'#f1ede4'}).png().toBuffer();
 const title=Buffer.from(`<svg width="1280" height="70"><rect width="1280" height="70" fill="#e9e4d8"/><text x="15" y="24" font-family="sans-serif" font-size="18">${pass} · ${id} · ${view.name}</text><text x="15" y="49" font-family="sans-serif" font-size="14">Decoded kit · engine GGX studio / ACES · env material multiplier .5</text><text x="655" y="49" font-family="sans-serif" font-size="14">Commons reference · related construction, angle varies</text></svg>`);
 await sharp({create:{width:1280,height:870,channels:3,background:'#e9e4d8'}}).composite([{input:left,left:0,top:70},{input:right,left:640,top:70},{input:title,left:0,top:0}]).png().toFile(`${dir}/${id}-${view.name}-comparison.png`);
 console.log(`${id} ${view.name}`);
}
// Dark-plate finish checks use the same geometry, neutral token and engine rig.
for(const id of Object.keys(refs)){
 const s=surfaces(id,'cinema',45,18);
 await render(s,`${root}/${pass}/${id}-cinema.png`,{theme:'cinema',angle:45,width:640,height:800,size:fittedSize(s,45)});
}
fs.writeFileSync(`${root}/${pass}/render-manifest.json`,JSON.stringify({lighting:verifyRig(),materialSource:'SceneRoot.tsx equipmentStyle / Equipment.tsx overrides',roughness:.68,metalness:0,envMapIntensity:.5,shots,limitations:'These are comparison studies of related equipment; references do not supply matching orthogonal views, so front/profile are construction checks, not photo-matched acceptance.'},null,2));
