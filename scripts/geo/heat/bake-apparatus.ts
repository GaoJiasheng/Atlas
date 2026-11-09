/** Original profile-loft glass and forged spoons. CC0 geometry; no external runtime assets. */
import fs from 'node:fs';
import sharp from 'sharp';
import {BufferGeometry,Float32BufferAttribute,Matrix4,Vector3} from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {Document,NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {dedup,weld,meshopt} from '@gltf-transform/functions';
import {MeshoptEncoder} from 'meshoptimizer';
import {bakeGasCylinder} from './gas-cylinder';
type P=Record<string,any>;
function geometry(pos:number[],uv:number[],ix:number[]){const g=new BufferGeometry();g.setAttribute('position',new Float32BufferAttribute(pos,3));g.setAttribute('uv',new Float32BufferAttribute(uv,2));g.setIndex(ix);g.computeVertexNormals();return g;}
function beaker(iteration:number){
 // Cross-section: slightly domed base → rounded heel → outer wall → fire-polished lip → inner return.
 // Like real moulded glass, the base only touches the bench near its heel: a base coplanar with
 // the bench top depth-fights with it and shows radial streaks through the glass.
 const profile=[[0,.0018],[.035,.0003],[.041,.0004],[.044,.0015],[.045,.004],[.045,.008],[.045,.030],[.045,.065],[.045,.095],[.045,.108],[.0452,.114],[.046,.117],[.0465,.119],[.0462,.1202],[.0454,.1208],[.0444,.1207],[.0436,.120],[.0433,.119],[.0435,.117],[.043,.113],[.0426,.108],[.042,.095],[.042,.065],[.042,.030],[.042,.009],[.041,.006],[.036,.005],[0,.005]];
 // Densely sample the bent upper wall, so the lip is a continuous surface at close range.
 const rows:{r:number;y:number;inner:boolean}[]=[];
 for(let j=0;j<profile.length-1;j++){
  const [r,y]=profile[j]!,[nr,ny]=profile[j+1]!;
  const steps=Math.max(y!,ny!)>.095?4:1;
  for(let k=0;k<steps;k++)rows.push({r:r!+(nr!-r!)*k/steps,y:y!+(ny!-y!)*k/steps,inner:j>=17});
 }
 rows.push({r:0,y:.005,inner:true});
 const N=192,pos:number[]=[],uv:number[]=[],ix:number[]=[],normals:number[]=[],starts:number[]=[];
 const point=(j:number,i:number)=>{
  const {r,y}=rows[j]!,a=(i/N-.5)*Math.PI*2;
  const delta=Math.atan2(Math.sin(a+Math.PI/2),Math.cos(a+Math.PI/2));
  const sector=Math.exp(-((delta/(iteration>=2?.23:.32))**2));
  const rise=Math.max(0,Math.min(1,(y-.095)/.024));
  const rr=r+(iteration>=2?.011:.016)*sector*rise**2;
  return new Vector3(Math.sin(a)*rr,y-.003*sector*rise,Math.cos(a)*rr);
 };
 for(let j=0;j<rows.length;j++){
  starts.push(pos.length/3);
  const row=rows[j]!,pole=row.r===0;
  // A pole keeps one vertex per sector (same point, u at the sector centre): every fan triangle
  // then spans 1/N of the texture, not the whole width, so the floor shows no radial UV streaks.
  for(let i=0;i<(pole?N:N+1);i++){
   const q=point(j,i);pos.push(...q.toArray());uv.push(row.inner?.99:pole?(i+.5)/N:i/N,1-Math.max(0,Math.min(1,row.y/.121)));
   // Parametric derivatives remove diagonal-triangulation bias from the specular normals.
   // The planar inner floor and both poles have exactly one normal.
   const flat=row.r===0||row.y===.005&&row.r<=.036;
   const n=flat?new Vector3(0,row.inner?1:-1,0):point(j,i+.01).sub(point(j,i-.01)).cross(point(Math.min(rows.length-1,j+1),i).sub(point(Math.max(0,j-1),i))).normalize();
   normals.push(...n.toArray());
  }
 }
 for(let j=0;j<rows.length-1;j++)for(let i=0;i<N;i++){
  const a=starts[j]!,b=starts[j+1]!;
  if(rows[j]!.r===0)ix.push(b+i,a+i,b+i+1);
  else if(rows[j+1]!.r===0)ix.push(a+i,a+i+1,b+i);
  else ix.push(a+i,a+i+1,b+i,b+i,a+i+1,b+i+1);
 }
 const g=geometry(pos,uv,ix);g.setAttribute('normal',new Float32BufferAttribute(normals,3));
 return g;
}
function spoon(){
 const N=64,R=18,pos:number[]=[],uv:number[]=[],ix:number[]=[];
 for(let side=0;side<2;side++)for(let j=0;j<=R;j++)for(let i=0;i<=N;i++){
  const r=j/R,a=i/N*Math.PI*2;
  // Long oval bowl, tangent at the rim; two nested surfaces give real thickness.
  const x=.0117*r*Math.cos(a)*(1-.14*r*Math.sin(a)),y=.017*r*Math.sin(a),z=.0044*(r*r-1)-(side?.0007:0);
  pos.push(x,y,z);uv.push((x/.024+.5),(y/.034+.5));
 }
 const stride=(R+1)*(N+1);
 for(let side=0;side<2;side++)for(let j=0;j<R;j++)for(let i=0;i<N;i++){const a=side*stride+j*(N+1)+i,b=a+N+1;if(!side)ix.push(a,b,a+1,a+1,b,b+1);else ix.push(a,a+1,b,a+1,b+1,b);}
 for(let i=0;i<N;i++){const a=R*(N+1)+i,b=a+stride;ix.push(a,b,a+1,a+1,b,b+1);}
 const bowl=geometry(pos,uv,ix);
 const ps:number[]=[],us:number[]=[],ids:number[]=[],M=56,K=16;
 for(let j=0;j<=M;j++)for(let i=0;i<=K;i++){
  const t=j/M,a=i/K*Math.PI*2,y=.013+t*.130;
  const w=.0022+.0015*Math.exp(-(((t-.92)/.12)**2))+.0013*Math.exp(-((t/.12)**2));
  const tip=Math.min(1,Math.sqrt(Math.max(0,(1-t)*35)));
  const z=.0012*Math.sin(t*Math.PI)-.0002;
  ps.push(w*tip*Math.cos(a),y,z+.00075*tip*Math.sin(a));us.push(i/K,t);
 }
 for(let j=0;j<M;j++)for(let i=0;i<K;i++){const a=j*(K+1)+i,b=a+K+1;ids.push(a,b,a+1,b,b+1,a+1);}
 const handle=geometry(ps,us,ids);return mergeGeometries([bowl,handle])!;
}
export async function bakeApparatus(parts:P[],iteration=2){
 const doc=new Document(),buffer=doc.createBuffer(),scene=doc.createScene('heat');
 doc.getRoot().getAsset().copyright='Atlas original procedural school apparatus. CC0-1.0. https://creativecommons.org/publicdomain/zero/1.0/ . Photographs used for study only; none embedded.';
 // Alpha-bearing printed calibration. Labels are true surface decals; rim/spout are geometry.
 const css=fs.readFileSync('src/theme/tokens.css','utf8');
 const paper=css.slice(css.indexOf(':root[data-theme="paper"] {'));
 const token=(name:string)=>paper.match(new RegExp(`--${name}:\\s*(#[0-9a-f]{6})`,'i'))![1]!;
 const ink=token('ink-2'),glassColor=token('bone'),label=token('bone');
 let marks='';
 for(let ml=100;ml<=500;ml+=50){const y=1024-(.006+ml/1000000/(Math.PI*.042**2))/.121*1024,major=ml%100===0;marks+=`<path d="M570 ${y}h${major?70:40}" stroke="${ink}" stroke-width="4"/>${major?`<text x="650" y="${y+12}" font-size="35" fill="${ink}">${ml}</text>`:''}`;}
 const svg=`<svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg"><rect width="1024" height="1024" fill="${glassColor}" fill-opacity=".028"/><path d="M0 18H1024 M0 988H1024" stroke="${glassColor}" stroke-opacity=".32" stroke-width="34"/>${marks}<text x="355" y="405" fill="${ink}" font-family="sans-serif" font-size="35">600 mL</text><text x="355" y="450" fill="${ink}" font-size="25">APPROX.</text><rect x="355" y="520" width="170" height="100" rx="12" fill="${label}" fill-opacity=".8"/></svg>`;
 const image=await sharp(Buffer.from(svg)).png().toBuffer();
 const tex=doc.createTexture('heat-fired-calibration').setImage(image).setMimeType('image/png');
 const glass=doc.createMaterial('heat-glass-and-fired-scale').setBaseColorTexture(tex).setAlphaMode('BLEND').setDoubleSided(true).setRoughnessFactor(.08).setMetallicFactor(0).setExtras({atlasSurface:true});
 const counts:Record<string,number>={};
 for(const part of parts){
  let g:BufferGeometry|null=null;
  const isCup=['bath-beaker','heater-beaker','cooling-beaker'].includes(part.id);
  if(isCup)g=beaker(iteration);else if(['metal-spoon','plastic-spoon'].includes(part.id))g=spoon();
  if(!g)continue;
  const prim=doc.createPrimitive();
  for(const [name,semantic] of [['position','POSITION'],['normal','NORMAL'],['uv','TEXCOORD_0']] as const){const a=g.getAttribute(name);prim.setAttribute(semantic,doc.createAccessor().setType(name==='uv'?'VEC2':'VEC3').setArray(Float32Array.from(a.array)).setBuffer(buffer));}
  prim.setIndices(doc.createAccessor().setType('SCALAR').setArray(Uint32Array.from(g.index!.array)).setBuffer(buffer));
  if(isCup)prim.setMaterial(glass);
  const at=part.primitive.at;
  scene.addChild(doc.createNode(part.id).setMesh(doc.createMesh(part.id).addPrimitive(prim)).setTranslation(at).setExtras({closed:true}));
  counts[part.id]=g.index!.count/3;
  part.mesh=part.id;part.material=isCup?{color:'enamel',tint:'token:bone'}:{color:part.primitive.color};
  delete part.primitive;delete part.extra;
  if(isCup)part.detail={en:'This open glass beaker has a thin wall, a thick base, a rounded rim and a small pouring lip. The millilitre marks printed on it are only approximate. Its water surface is shown as a separate part. [S27]',zh:'敞口玻璃烧杯有薄壁、厚杯底、圆润杯沿和小杯嘴。杯上印的毫升刻度只是大概的数值，水面作为单独的部分显示。[S27]'};
 }
 counts['gas-cylinder']=bakeGasCylinder(doc,parts.find(p=>p.id==='gas-cylinder')!);
 await MeshoptEncoder.ready;
 await doc.transform(weld(),dedup(),meshopt({encoder:MeshoptEncoder,level:'high',quantizePosition:16,quantizeTexcoord:14}));
 // Quantised frames require local-space label anchors.
 for(const n of doc.getRoot().listNodes()){const p=parts.find(p=>p.id===n.getName())!;const old=n.getWorldMatrix();const at=p.id.includes('beaker')?[old[12]!,old[13]!+.070,old[14]!+.043]:n.getExtras().labelPoint;if(at)n.setExtras({...n.getExtras(),labelPoint:new Vector3(...at as [number,number,number]).applyMatrix4(new Matrix4().fromArray(old).invert()).toArray()});}
 const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.encoder':MeshoptEncoder});const bytes=await io.writeBinary(doc);
 if(bytes.length>1_500_000)throw new Error(`Heat GLB exceeds budget: ${bytes.length}`);
 fs.mkdirSync('public/models',{recursive:true});fs.writeFileSync('public/models/heat-apparatus.glb',bytes);
 return {counts,bytes:bytes.length,model:'/models/heat-apparatus.glb'};
}
