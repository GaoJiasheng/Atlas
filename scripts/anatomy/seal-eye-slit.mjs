/** Seal the eye-level slit in the six muscle topics' body skin (`skin-outline`, shared by `skin-wire`).
 *
 * Cause: Z-Anatomy's head skin has open eye fissures. `round2-voxel.py` fills
 * each transverse section before the global fill, but a section through the
 * eyes is an open contour, so ~1 cm of head sections stayed hollow and the
 * marching-cubes surface folded through the eye openings into a horizontal
 * pocket spanning the whole head. Under the translucent body it reads as a
 * light band across the eyes. `round2-voxel.py` now seals those sections at
 * the source; this step applies the same repair to the shipped skin without
 * a full chain rebuild, so masks, rig, weights and every existing vertex stay as they are:
 *
 *  1. Pocket triangles: in the eye band, faces whose outward hemisphere is
 *     enclosed by the head (rays from the face hit the skin again) are dropped.
 *  2. Level lip faces left just inside each opening go too.
 *  3. Each eye opening is closed by a lid: rim ear clipping, subdivided twice,
 *     relaxed as a membrane with the rim held and raised up to 1.5 mm over the eyeball.
 *     The new vertices are appended (existing indices, masks and rig untouched)
 *     and take the nearest rim vertex's skin weights.
 *  4. Vertex normals on every touched face are recomputed from the new faces.
 *
 * Runs once per GLB: the sealed skin carries `extras.eyeSlit = 'sealed'` and is skipped after.
 * Usage: node scripts/anatomy/seal-eye-slit.mjs [topic ...]   (default: all six)
 * Z-Anatomy derivative, CC BY-SA 4.0.
 */
import fs from 'node:fs';
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS,EXTMeshoptCompression} from '@gltf-transform/extensions';
import {MeshoptEncoder,MeshoptDecoder} from 'meshoptimizer';
import {Matrix4,Vector3,Vector2,Ray,ShapeUtils} from 'three';
import {filterNormals} from './round4/normal-filter.mjs';
await Promise.all([MeshoptEncoder.ready,MeshoptDecoder.ready]);
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.encoder':MeshoptEncoder,'meshopt.decoder':MeshoptDecoder});

/** Eye band below the crown (m) and the head's half width searched (m): the slit sits 115–125 mm below the crown in every topic. */
const BAND=[.095,.145],HALF_WIDTH=.11;
/** Hemisphere rays per face; a face is inside the pocket when at most this share escapes. */
const RAYS=48,ESCAPE=.12;
/** Lip faces: at least this level (|n.y|) and this close (m) to a pocket face. */
const LIP=.85,LIP_REACH=.006;
/** Each lid rises this far (m) at its centre above the opening's plane, a dome over the eyeball. */
const LID_RISE=.0015;

function hemisphere(n){
 const out=[],golden=Math.PI*(3-Math.sqrt(5));
 for(let i=0;i<n;i++){const z=1-(i+.5)/n,r=Math.sqrt(1-z*z),t=golden*i;out.push(new Vector3(Math.cos(t)*r,Math.sin(t)*r,z));}
 return out;
}
const DIRS=hemisphere(RAYS);

export function sealEyeSlit(doc){
 const node=doc.getRoot().listNodes().find(n=>n.getName()==='skin-outline');
 if(node.getExtras().eyeSlit==='sealed')return null;
 const prim=node.getMesh().listPrimitives()[0],skin=node.getSkin();
 const joints=skin.listJoints(),ibm=skin.getInverseBindMatrices();
 const bind=joints.map((j,i)=>new Matrix4().fromArray(j.getWorldMatrix()).multiply(new Matrix4().fromArray(ibm.getElement(i,[]))));
 const pa=prim.getAttribute('POSITION'),ja=prim.getAttribute('JOINTS_0'),wa=prim.getAttribute('WEIGHTS_0'),na=prim.getAttribute('NORMAL');
 // Rest (bind) positions in the model frame, as the engine draws them unposed.
 const pos=[];
 for(let i=0;i<pa.getCount();i++){const P=pa.getElement(i,[]),J=ja.getElement(i,[]),W=wa.getElement(i,[]),v=new Vector3();for(let k=0;k<4;k++)if(W[k])v.addScaledVector(new Vector3(...P).applyMatrix4(bind[J[k]]),W[k]);pos.push(v);}
 const idx=Array.from(prim.getIndices().getArray()),faces=idx.length/3;
 let top=-Infinity;for(const v of pos)top=Math.max(top,v.y);
 const tri=f=>[pos[idx[f*3]],pos[idx[f*3+1]],pos[idx[f*3+2]]];
 const centroid=f=>{const [a,b,c]=tri(f);return a.clone().add(b).add(c).multiplyScalar(1/3);};
 const normal=f=>{const [a,b,c]=tri(f);return b.clone().sub(a).cross(c.clone().sub(a));};
 // The head's faces are the only occluders a pocket ray can meet.
 const head=[];for(let f=0;f<faces;f++){const c=centroid(f);if(c.y>top-.33)head.push(f);}
 const boxes=head.map(f=>{const [a,b,c]=tri(f);return {f,min:a.clone().min(b).min(c),max:a.clone().max(b).max(c)};});
 const ray=new Ray(),hit=new Vector3();
 const blocked=(origin,dir,self)=>{ray.set(origin,dir);for(const b of boxes){if(b.f===self||!ray.intersectsBox({min:b.min,max:b.max,isEmpty:()=>false}))continue;const [x,y,z]=tri(b.f);if(ray.intersectTriangle(x,y,z,false,hit))return true;}return false;};
 const pocket=new Set();
 for(const f of head){
  const c=centroid(f),depth=top-c.y;if(depth<BAND[0]||depth>BAND[1]||Math.abs(c.x)>HALF_WIDTH)continue;
  const n=normal(f);if(n.lengthSq()===0)continue;n.normalize();
  // Hemisphere around the face normal.
  const t=Math.abs(n.x)<.9?new Vector3(1,0,0):new Vector3(0,1,0),u=t.cross(n).normalize(),w=n.clone().cross(u),origin=c.clone().addScaledVector(n,1e-5);
  let escaped=0;
  for(const d of DIRS){const dir=u.clone().multiplyScalar(d.x).addScaledVector(w,d.y).addScaledVector(n,d.z).normalize();if(!blocked(origin,dir,f))escaped++;if(escaped>ESCAPE*RAYS)break;}
  if(escaped<=ESCAPE*RAYS)pocket.add(f);
 }
 if(pocket.size===0)return null;
 // Keep the outer surface: drop pocket faces, then any face cut off from the main body (pocket crumbs).
 let kept=[];for(let f=0;f<faces;f++)if(!pocket.has(f))kept.push(f);
 const parent=new Map(),root=x=>{while(parent.get(x)!==x){parent.set(x,parent.get(parent.get(x)));x=parent.get(x);}return x;};
 // Positions are shared by seam duplicates; weld by position for topology only.
 const weldKey=new Map(),weld=pos.map((v,i)=>{const k=v.toArray().map(a=>Math.round(a*1e6)).join(',');if(!weldKey.has(k))weldKey.set(k,i);return weldKey.get(k);});
 for(const f of kept)for(let k=0;k<3;k++){const v=weld[idx[f*3+k]];if(!parent.has(v))parent.set(v,v);}
 for(const f of kept){const a=root(weld[idx[f*3]]);for(let k=1;k<3;k++){const b=root(weld[idx[f*3+k]]);if(a!==b)parent.set(b,a);}}
 const size=new Map();for(const f of kept){const r=root(weld[idx[f*3]]);size.set(r,(size.get(r)??0)+1);}
 // Small closed components (nail plates) live far from the band; only band crumbs are dropped.
 const main=[...size].sort((a,b)=>b[1]-a[1])[0][0];
 const crumbs=kept.filter(f=>{if(root(weld[idx[f*3]])===main)return false;const c=centroid(f),d=top-c.y;return d>BAND[0]-.02&&d<BAND[1]+.02;});
 const crumbSet=new Set(crumbs);kept=kept.filter(f=>!crumbSet.has(f));
 // The pocket's lips: level faces just inside each opening that still saw the air through it.
 const pocketPoints=[...pocket].map(centroid);
 const lips=kept.filter(f=>{const c=centroid(f),d=top-c.y;if(d<BAND[0]||d>BAND[1]||Math.abs(c.x)>HALF_WIDTH)return false;const n=normal(f);if(n.lengthSq()===0||Math.abs(n.normalize().y)<LIP)return false;return pocketPoints.some(q=>q.distanceToSquared(c)<LIP_REACH**2);});
 const lipSet=new Set(lips);kept=kept.filter(f=>!lipSet.has(f));
 // Boundary loops of the kept surface inside the band: the eye openings.
 const edgeCount=new Map(),directed=new Map();
 for(const f of kept)for(let k=0;k<3;k++){const a=idx[f*3+k],b=idx[f*3+(k+1)%3],wa_=weld[a],wb=weld[b],key=wa_<wb?wa_+'_'+wb:wb+'_'+wa_;edgeCount.set(key,(edgeCount.get(key)??0)+1);directed.set(wa_+'>'+wb,[a,b]);}
 // Outgoing boundary half-edges per welded vertex (a vertex where two openings touch has two).
 const next=new Map();let boundary=0;
 for(const [key,count] of edgeCount){if(count!==1)continue;const [x,y]=key.split('_').map(Number);const [a,b]=directed.get(x+'>'+y)??directed.get(y+'>'+x);
  const c=pos[a].clone().add(pos[b]).multiplyScalar(.5),d=top-c.y;if(d<BAND[0]-.02||d>BAND[1]+.02||Math.abs(c.x)>HALF_WIDTH)continue;
  // A hole is walked opposite to the faces' own edge direction.
  if(!next.has(weld[b]))next.set(weld[b],[]);next.get(weld[b]).push({to:weld[a],vertex:b});boundary++;
 }
 const loops=[];
 for(const start of [...next.keys()]){
  while(next.get(start)?.length){
   const loop=[];let k=start;
   while(true){const outs=next.get(k);if(!outs?.length)throw Error(`open boundary chain at ${pos[loop.at(-1)]?.toArray()}`);const e=outs.shift();loop.push(e.vertex);k=e.to;if(k===start)break;}
   loops.push(loop);
  }
 }
 // Close each opening with a shallow dome: one ring halfway in and a centre vertex, all new,
 // skinned like the rim (weights of the nearest rim vertex) so the lid moves with the head.
 const added=[],extra=[];let nextVertex=pa.getCount();
 const newVertex=(model,from)=>{const W=wa.getElement(from,[]),J=ja.getElement(from,[]),m=new Matrix4().set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);for(let k=0;k<4;k++)if(W[k]){const e=bind[J[k]].elements;for(let q=0;q<16;q++)m.elements[q]+=e[q]*W[k];}
  const local=model.clone().applyMatrix4(m.clone().invert());extra.push({local,J,W,from});pos.push(model);weld.push(nextVertex);return nextVertex++;};
 for(const loop of loops){
  const pts=loop.map(i=>pos[i]),centre=pts.reduce((a,b)=>a.clone().add(b),new Vector3()).multiplyScalar(1/pts.length);
  // Newell normal of the loop, turned to face forward (the eyes look along +z).
  const nn=new Vector3();for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length];nn.x+=(a.y-b.y)*(a.z+b.z);nn.y+=(a.z-b.z)*(a.x+b.x);nn.z+=(a.x-b.x)*(a.y+b.y);}nn.normalize();
  const winding=nn.z>=0;if(!winding)nn.negate();
  const t=Math.abs(nn.x)<.9?new Vector3(1,0,0):new Vector3(0,1,0),u=t.cross(nn).normalize(),w=nn.clone().cross(u);
  const flat=pts.map(p=>new Vector2(p.clone().sub(centre).dot(u),p.clone().sub(centre).dot(w)));
  const ccw=!ShapeUtils.isClockWise(flat);
  // Rim-only ear clipping, then (for the real openings) two midpoint subdivisions
  // relaxed as a membrane with the rim held: a smooth lid, not a fan of slivers.
  let cap=ShapeUtils.triangulateShape(flat,[]).map(([x,y,z])=>[loop[x],loop[y],loop[z]]);
  const model=new Map(loop.map(v=>[v,pos[v]])),fixed=new Set(loop),owner=new Map(loop.map(v=>[v,v]));
  if(loop.length>4){
   let id=0;const mids=new Map();
   const mid=(x,y)=>{const key=x<y?x+'_'+y:y+'_'+x;if(mids.has(key))return mids.get(key);const k='n'+id++;model.set(k,model.get(x).clone().lerp(model.get(y),.5));owner.set(k,owner.get(x));if(fixed.has(x)&&fixed.has(y)&&(Math.abs(loop.indexOf(x)-loop.indexOf(y))===1||Math.abs(loop.indexOf(x)-loop.indexOf(y))===loop.length-1))fixed.add(k+'rim');mids.set(key,k);return k;};
   for(let pass=0;pass<2;pass++)cap=cap.flatMap(([x,y,z])=>{const a=mid(x,y),b=mid(y,z),c=mid(z,x);return [[x,a,c],[a,y,b],[c,b,z],[a,b,c]];});
   // Rim-edge midpoints stay on the rim polyline; every other new vertex relaxes.
   const free=[...model.keys()].filter(k=>typeof k==='string'&&!fixed.has(k+'rim'));
   const nbr=new Map(free.map(k=>[k,new Set()]));for(const f of cap)for(let i=0;i<3;i++)for(let j=0;j<3;j++)if(i!==j&&nbr.has(f[i]))nbr.get(f[i]).add(f[j]);
   for(let it=0;it<120;it++)for(const k of free){const n=[...nbr.get(k)],avg=n.reduce((a,v)=>a.add(model.get(v)),new Vector3()).multiplyScalar(1/n.length);model.get(k).copy(avg);}
   // A slight rise over the eyeball, largest in the middle of the lid.
   const radius=Math.max(...flat.map(p=>p.length()));
   for(const k of free){const p=model.get(k),r=Math.min(1,new Vector2(p.clone().sub(centre).dot(u),p.clone().sub(centre).dot(w)).length()/radius);p.addScaledVector(nn,LID_RISE*(1-r*r));}
   const index=new Map();for(const k of model.keys())if(typeof k==='string')index.set(k,newVertex(model.get(k),owner.get(k)));
   cap=cap.map(f=>f.map(v=>typeof v==='string'?index.get(v):v));
  }
  for(const [x,y,z] of cap)added.push(...(ccw?[x,y,z]:[x,z,y]));
 }
 if(extra.length){
  const grow=(a,n)=>{const old=a.getArray(),arr=new old.constructor(old.length+n*a.getElementSize());arr.set(old);a.setArray(arr);};
  for(const a of [pa,na,ja,wa])grow(a,extra.length);
  extra.forEach((e,k)=>{const i=pa.getCount()-extra.length+k;pa.setElement(i,e.local.toArray());na.setElement(i,na.getElement(e.from,[]));ja.setElement(i,e.J);wa.setElement(i,e.W);});
 }
 const out=[];for(const f of kept)out.push(idx[f*3],idx[f*3+1],idx[f*3+2]);out.push(...added);
 // Every lid must wind with the skin around it: no directed edge (by welded vertex) may occur more often than in the kept skin alone.
 const clashes=list=>{const seen=new Set();let n=0;for(let i=0;i<list.length;i+=3)for(let k=0;k<3;k++){const key=weld[list[i+k]]+'>'+weld[list[i+(k+1)%3]];if(seen.has(key))n++;seen.add(key);}return n;};
 if(clashes(out)!==clashes(out.slice(0,kept.length*3)))throw Error('a lid winds against the skin around it');
 // Normals of every vertex on a changed face, from the new faces (area-weighted), in the attribute's own frame.
 const touched=new Set();for(const f of [...pocket,...crumbs,...lips])for(let k=0;k<3;k++)touched.add(weld[idx[f*3+k]]);for(const v of added)touched.add(weld[v]);
 const acc=new Map();for(let i=0;i<out.length;i+=3){const ids=[out[i],out[i+1],out[i+2]];if(!ids.some(v=>touched.has(weld[v])))continue;const a=new Vector3(...pa.getElement(ids[0],[])),b=new Vector3(...pa.getElement(ids[1],[])),c=new Vector3(...pa.getElement(ids[2],[])),fn=b.sub(a).cross(c.sub(a));for(const v of ids)if(touched.has(weld[v]))acc.set(weld[v],(acc.get(weld[v])??new Vector3()).add(fn));}
 let renormalised=0;for(let v=0;v<pos.length;v++){if(!touched.has(weld[v]))continue;const s=acc.get(weld[v]);if(!s||s.lengthSq()===0)continue;na.setElement(v,s.clone().normalize().toArray());renormalised++;}
 node.setExtras({...node.getExtras(),eyeSlit:'sealed'});
 const Index=prim.getIndices().getArray().constructor;
 prim.getIndices().setArray(new Index(out));
 return {top:+top.toFixed(4),pocketFaces:pocket.size,crumbFaces:crumbs.length,lipFaces:lips.length,lidVertices:extra.length,openings:loops.map(l=>l.length),capFaces:added.length/3,facesBefore:faces,facesAfter:out.length/3,renormalised};
}

if(import.meta.url===`file://${process.argv[1]}`){
 const topics=process.argv.slice(2);
 for(const topic of topics.length?topics:['arms','back','chest','core','legs','shoulders']){
  const file=`public/models/muscles-${topic}.glb`,before=fs.statSync(file).size,doc=await io.read(file);
  const report=sealEyeSlit(doc);
  if(!report){console.log(JSON.stringify({topic,sealed:false}));continue;}
  if(process.env.DRY){console.log(JSON.stringify({topic,...report,dry:true}));continue;}
  doc.createExtension(EXTMeshoptCompression).setRequired(true).setEncoderOptions({method:EXTMeshoptCompression.EncoderMethod.QUANTIZE});
  const bytes=await filterNormals(await io.writeBinary(doc),doc);fs.writeFileSync(file,bytes);
  console.log(JSON.stringify({topic,...report,bytesBefore:before,bytesAfter:bytes.length}));
 }
}
