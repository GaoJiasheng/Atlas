/** Original Atlas CC0 build-time cellulose sponge sculpture.
 * Rounded 120 × 40 × 80 mm body minus multiscale, lobed pore chambers. Pairs
 * of neighbouring chambers communicate through buried passages. These are
 * subtractions from solid material, never tubes laid across the visible face.
 * Source normals are analytic SDF gradients; the export refiner transports
 * curvature onto the simplified topology with angle-weighted normals. The caller owns simplification and shipping material tokens.
 */
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {BufferGeometry,BufferAttribute,MeshBasicMaterial} from 'three';
import {sampleMicro,microFieldSha} from './sponge-micro-ao.mjs';
import {MarchingCubes} from 'three/examples/jsm/objects/MarchingCubes.js';

export function connectedSponge(p,P){
 const key=createHash('sha256').update(connectedSponge.toString()+microFieldSha+JSON.stringify({p,colour:P?.bone?.toArray?.()})).digest('hex').slice(0,20);
 const cache=`/private/tmp/states-of-matter-connected-foam-${key}.bin`;
 const sidecar='scripts/geo/states-of-matter/evidence/sponge-passages.json';
 if(fs.existsSync(cache)&&fs.existsSync(`${cache}.json`)){
  fs.mkdirSync('scripts/geo/states-of-matter/evidence',{recursive:true});fs.copyFileSync(`${cache}.json`,sidecar);
  const bytes=fs.readFileSync(cache),count=bytes.readUInt32LE(0),g=new BufferGeometry();
  for(const [i,name]of ['position','normal','color'].entries()){
   const a=new Float32Array(count*3);new Uint8Array(a.buffer).set(bytes.subarray(4+i*count*12,4+(i+1)*count*12));g.setAttribute(name,new BufferAttribute(a,3));
  }
  return [g];
 }
 const N=512,S=.066,STEP=.008,half=[.06,.02,.04],holes=[],mouths=[],channels=[],proofPaths=[];
 let seed=815;const random=()=>((seed=(1664525*seed+1013904223)>>>0)/4294967296);
 // A 9 mm continuous body radius, slight asymmetric swell, and 0.3–0.8 mm
 // micro-pits are in the SDF itself, not a colour or normal-map substitute.
 const macro=(x,y,z)=>.0006*Math.cos(x*29+.3)*Math.cos(z*43-.2)*Math.cos(y*34);
 const baseDistance=(x,y,z)=>{const a=Math.abs(x)-.051,b=Math.abs(y)-.011,c=Math.abs(z)-.031;return Math.hypot(Math.max(0,a),Math.max(0,b),Math.max(0,c))+Math.min(Math.max(a,b,c),0)-.009-macro(x,y,z);};
 const addHole=(q,r,scale)=>holes.push({q,r,scale});
 // Deterministic stratified size distribution on each face. Centre rejection
 // protects small mouths from being swallowed by the occasional large cell.
 for(const axis of [0,1,2])for(const sign of [-1,1]){
  const wanted=axis===1?(sign>0?310:30):axis===0?104:156,face=[];
  for(let j=0;j<wanted;j++){
   const category=j%10,diameter=category<6?.001+.001*random():category<9?.002+.002*random():.004+.003*random(),r=diameter/2;
   let q,placed=false;
   for(let attempt=0;attempt<300;attempt++){
    q=[(random()*2-1)*.056,(random()*2-1)*.016,(random()*2-1)*.036];
    q[axis]=sign*half[axis];
    if(face.every(h=>Math.hypot(...q.map((x,k)=>k===axis?0:x-h.q[k]))>r+h.r+.00024)){placed=true;break;}
   }
   if(!placed)continue;
   // Solve the rounded, swollen body's actual surface at the mouth centre.
   for(let k=0;k<12;k++)q[axis]-=sign*baseDistance(...q);
   const surface=q.slice(),depth=.0026+.0024*random();
   q[axis]-=sign*depth*.48;
   const lo=category<6?1.06:.88,scale=[lo+.24*random(),lo+.24*random(),lo+.24*random()];scale[axis]=depth/r;
   addHole(q,r,scale);const mouth={q,axis,sign,r,surface,diameter};mouths.push(mouth);face.push(mouth);
   // Unequal lobes distort the larger openings without uniform round bowls.
   if(category>=6){const qq=q.slice(),u=(axis+1)%3,v=(axis+2)%3,a=random()*Math.PI*2;
    qq[u]+=Math.cos(a)*r*.52;qq[v]+=Math.sin(a)*r*.52;
    if(category>=9)addHole(qq,r*.62,scale.map((s,k)=>k===axis?s:1));
   }
  }
 }
 const links=new Set();
 for(let i=0;i<mouths.length;i++){
  const a=mouths[i];if(a.r<.0014)continue;const neighbours=mouths.map((b,j)=>({j,d:(a.q[0]-b.q[0])**2+(a.q[1]-b.q[1])**2+(a.q[2]-b.q[2])**2})).filter(x=>x.j!==i&&mouths[x.j].r>.0014&&x.d<.017**2).sort((a,b)=>a.d-b.d).slice(0,2);
  for(const {j}of neighbours){
   const id=[Math.min(i,j),Math.max(i,j)].join(':');if(links.has(id)||links.size>=60)continue;links.add(id);
   const b=mouths[j],radius=.00160+.00025*random();
   // Chamber endpoints are pushed beneath the membrane before the connecting
   // arc is made. Its shallowest point is >=1.1 mm below the outside surface.
   const inward=m=>{const q=m.q.slice();for(let k=0;k<12&&baseDistance(...q)>-radius-.0011;k++)q[m.axis]-=m.sign*.00025;return q;};
   const aa=inward(a),bb=inward(b),mid=aa.map((x,k)=>(x+bb[k])*.5);
   mid[a.axis]-=a.sign*.00035;mid[b.axis]-=b.sign*.00035;
   proofPaths.push({id,radius,path:[a.q,aa,mid,bb,b.q]});
   // A short inward throat starts at each chamber centre. It guarantees that
   // even a shallow, narrow pore joins the buried passage; the throat reaches
   // the exterior only inside that pore's existing mouth.
   for(const [u,v]of [[a.q,aa],[aa,mid],[mid,bb],[bb,b.q]]){
    const direction=v.map((x,k)=>x-u[k]),length2=direction.reduce((s,x)=>s+x*x,0);
    if(length2>1e-12)channels.push({a:u,b:v,d:direction,length2,r:radius});
   }
  }
 }
 // Spatial lookup includes complete primitive bounds; long passages cannot
 // vanish at bin boundaries or accidentally become disconnected segments.
 const bins=new Map(),bin=(x,y,z)=>`${x},${y},${z}`;
 const insert=(kind,value,min,max)=>{
  const lo=min.map(x=>Math.floor(x/STEP)),hi=max.map(x=>Math.floor(x/STEP));
  for(let z=lo[2];z<=hi[2];z++)for(let y=lo[1];y<=hi[1];y++)for(let x=lo[0];x<=hi[0];x++){
   const k=bin(x,y,z);if(!bins.has(k))bins.set(k,{holes:[],channels:[]});bins.get(k)[kind].push(value);
  }
 };
 for(const h of holes){const extent=h.scale.map(s=>h.r*s+.0004);insert('holes',h,h.q.map((x,k)=>x-extent[k]),h.q.map((x,k)=>x+extent[k]));}
 for(const c of channels)insert('channels',c,c.a.map((x,k)=>Math.min(x,c.b[k])-c.r-.0004),c.a.map((x,k)=>Math.max(x,c.b[k])+c.r+.0004));
 // Integer bin keys during the 192³ evaluation avoid allocating millions of
 // strings. Each bin owns only nearby cavities and complete capsule segments.
 const stride=32,near=new Array(stride**3);
 for(let z=-12;z<12;z++)for(let y=-12;y<12;y++)for(let x=-12;x<12;x++)near[(x+12)+stride*(y+12)+stride*stride*(z+12)]=bins.get(bin(x,y,z));
 function field(x,y,z,normal=false){
  let d=baseDistance(x,y,z),nx=0,ny=0,nz=0;
  if(normal){const e=.000015;nx=(baseDistance(x+e,y,z)-baseDistance(x-e,y,z))/(2*e);ny=(baseDistance(x,y+e,z)-baseDistance(x,y-e,z))/(2*e);nz=(baseDistance(x,y,z+e)-baseDistance(x,y,z-e))/(2*e);}
  // Smooth narrow depressions, 0.3–0.8 mm across. They break up the land
  // between the open chambers and survive as real submillimetre relief.
  const micro=sampleMicro;
  if(d>-.0015&&d<.0015){d+=micro(x,y,z);if(normal){const e=.000015;nx+=(micro(x+e,y,z)-micro(x-e,y,z))/(2*e);ny+=(micro(x,y+e,z)-micro(x,y-e,z))/(2*e);nz+=(micro(x,y,z+e)-micro(x,y,z-e))/(2*e);}}
  if(d<.005&&d>-.008){
   const nearby=near[(Math.floor(x/STEP)+12)+stride*(Math.floor(y/STEP)+12)+stride*stride*(Math.floor(z/STEP)+12)];
   if(nearby){
    for(const h of nearby.holes){
     const a=(x-h.q[0])/h.scale[0],b=(y-h.q[1])/h.scale[1],c=(z-h.q[2])/h.scale[2],distance=Math.hypot(a,b,c),s=h.r-distance,k=Math.min(.00028,h.r*.22),m=Math.max(0,Math.min(1,.5+.5*(d-s)/k));
     d=d*m+s*(1-m)+k*m*(1-m);
     if(normal&&m<1){const den=distance||1;nx=nx*m-a/h.scale[0]/den*(1-m);ny=ny*m-b/h.scale[1]/den*(1-m);nz=nz*m-c/h.scale[2]/den*(1-m);}
    }
    for(const c of nearby.channels){
     const t=Math.max(0,Math.min(1,((x-c.a[0])*c.d[0]+(y-c.a[1])*c.d[1]+(z-c.a[2])*c.d[2])/c.length2));
     const a=x-c.a[0]-t*c.d[0],b=y-c.a[1]-t*c.d[1],e=z-c.a[2]-t*c.d[2],distance=Math.hypot(a,b,e),s=c.r-distance,k=.00022,m=Math.max(0,Math.min(1,.5+.5*(d-s)/k));
     d=d*m+s*(1-m)+k*m*(1-m);
     if(normal&&m<1){const den=distance||1;nx=nx*m-a/den*(1-m);ny=ny*m-b/den*(1-m);nz=nz*m-e/den*(1-m);}
    }
   }
  }
  if(!normal)return d;const length=Math.hypot(nx,ny,nz)||1;return [nx/length,ny/length,nz/length];
 }
 const mc=new MarchingCubes(N,new MeshBasicMaterial(),false,false,3000000);mc.isolation=0;
 for(let z=0;z<N;z++)for(let y=0;y<N;y++)for(let x=0;x<N;x++)mc.field[z*N*N+y*N+x]=-field((x/N*2-1)*S,(y/N*2-1)*S,(z/N*2-1)*S);
 mc.update();const count=mc.count,g=new BufferGeometry();
 g.setAttribute('position',new BufferAttribute(mc.positionArray.slice(0,count*3),3));
 g.setAttribute('normal',new BufferAttribute(new Float32Array(count*3),3));g.scale(S,S,S);
 const positions=g.getAttribute('position'),normals=g.getAttribute('normal'),colours=new Float32Array(count*3);
 for(let i=0;i<count;i++){
  const x=Math.round(positions.getX(i)*1e7)/1e7,y=Math.round(positions.getY(i)*1e7)/1e7,z=Math.round(positions.getZ(i)*1e7)/1e7;positions.setXYZ(i,x,y,z);
  normals.setXYZ(i,...field(x,y,z,true));
  // Neutral source multiplier only: the caller's technical-plate material
  // determines the visible sponge colour. Deep chambers receive restrained AO.
  const depth=Math.max(0,-baseDistance(x,y,z)),value=Math.round((.055+.945*Math.exp(-depth/.00050))*63)/63;
  colours.set([value,value,value],i*3);
 }
 g.setAttribute('color',new BufferAttribute(colours,3));g.translate(...p.primitive.at);
 g.userData.spongeStructure={mouths:mouths.map(m=>({axis:m.axis,sign:m.sign,diameter:m.diameter,surface:m.surface.map((x,k)=>x+p.primitive.at[k])})),chambers:holes.length,passages:channels.length,connectedPairs:links.size,sourceTriangles:count/3};
 const world=q=>q.map((x,k)=>x+p.primitive.at[k]);
 const representative=proofPaths.filter(a=>a.radius>.0008).map(a=>{
  const [q,aa,mid,bb,r]=a.path,halfway=(x,y)=>x.map((v,k)=>(v+y[k])*.5);
  const samples=[halfway(q,aa),halfway(aa,mid),mid,halfway(mid,bb),halfway(bb,r)];
  return {...a,samples,length:a.path.slice(1).reduce((sum,q,i)=>sum+Math.hypot(...q.map((x,k)=>x-a.path[i][k])),0)};
 }).filter(a=>a.samples.every(q=>baseDistance(...q)<-.0008&&field(...q)>.00075)).sort((a,b)=>b.length-a.length).slice(0,40);
 if(representative.length<40)throw new Error(`Only ${representative.length} suitably buried large passage proofs`);
 const proof={generatorSha256:key,description:'Build-time targets only. Run audit-sponge-passages.mjs against the shipping decoded mesh to prove these remain air and their connecting segments remain unobstructed.',units:'metres',part:'sponge',at:p.primitive.at,structure:g.userData.spongeStructure,paths:representative.map(a=>({id:a.id,radius:a.radius,length:a.length,path:a.path.map(world),samples:a.samples.map(q=>({point:world(q),expected:'air',sourceClearance:field(...q),depthBelowOutside:-baseDistance(...q)}))}))};
 fs.mkdirSync('scripts/geo/states-of-matter/evidence',{recursive:true});const proofJson=JSON.stringify(proof,null,2);fs.writeFileSync(sidecar,proofJson);fs.writeFileSync(`${cache}.json`,proofJson);
 mc.geometry.dispose();mc.material.dispose();
 const bytes=Buffer.alloc(4+count*36);bytes.writeUInt32LE(count,0);
 for(const [i,name]of ['position','normal','color'].entries())Buffer.from(g.getAttribute(name).array.buffer).copy(bytes,4+i*count*12);
 fs.writeFileSync(cache,bytes);return [g];
}
