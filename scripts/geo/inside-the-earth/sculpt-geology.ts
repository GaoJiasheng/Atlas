/** Original relief meshes for the geological teaching specimens. No downloaded
 * models/textures. Closed surfaces, deterministic relief, all lengths DESIGN. */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { Document, NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { meshopt } from '@gltf-transform/functions';
import { MeshoptEncoder } from 'meshoptimizer';
import { BufferGeometry, CatmullRomCurve3, Float32BufferAttribute, SphereGeometry, Vector3 } from 'three';
import type { z } from 'zod';
import type { partSchema } from '../../../src/engines/space-scene/schema';
type Part=z.input<typeof partSchema>;
type V3=[number,number,number];
class Surface {
  positions:number[]=[]; indices:number[]=[]; uv:number[]=[];
  grid(n:number,m:number,point:(u:number,v:number)=>V3,flip=false) {
    const start=this.positions.length/3;
    for(let j=0;j<=m;j++) for(let i=0;i<=n;i++) {this.positions.push(...point(i/n,j/m));this.uv.push(i/n,j/m);}
    for(let j=0;j<m;j++) for(let i=0;i<n;i++) {
      const a=start+j*(n+1)+i,b=a+1,c=a+n+1,d=c+1;
      this.indices.push(...(flip ? [a,c,b,b,c,d] : [a,b,c,b,d,c]));
    }
  }
  append(g:BufferGeometry) {
    const offset=this.positions.length/3,p=g.getAttribute('position'),uv=g.getAttribute('uv');
    for(let i=0;i<p.count;i++){this.positions.push(p.getX(i),p.getY(i),p.getZ(i));this.uv.push(uv?.getX(i)??0,uv?.getY(i)??0);}
    for(let i=0;i<(g.index?.count??p.count);i++)this.indices.push(offset+(g.index?.getX(i)??i));
  }
  geometry(){const g=new BufferGeometry();g.setAttribute('position',new Float32BufferAttribute(this.positions,3));g.setAttribute('uv',new Float32BufferAttribute(this.uv,2));g.setIndex(this.indices);g.computeVertexNormals();return g;}
}
const noise=(x:number,y:number,z:number)=>Math.sin(x*31+y*17+z*13)*0.48+Math.sin(x*67-y*43+z*29)*0.27+Math.cos(x*113+y*79-z*53)*0.13;
const gaussian=(x:number,s:number)=>Math.exp(-((x/s)**2));
function sectionRelief(profile:number[][],sign:number) {
  // A regular radial grid avoids the long, skinny ear-cut triangles that
  // smear relief into streaks. Every meridian vertex remains a boundary row.
  const levels=[...new Set(profile.map(p=>p[1]!))].sort((a,b)=>a-b);
  const rows=levels.flatMap((y,i)=>i===levels.length-1 ? [y] : [y,(y+levels[i+1]!)/2]);
  const bounds=(y:number):[number,number]=>{
    const rs:number[]=[];
    for(let i=0;i<profile.length;i++){
      const a=profile[i]!,b=profile[(i+1)%profile.length]!;
      if(Math.abs(b[1]!-a[1]!)<1e-9){if(Math.abs(y-a[1]!)<1e-9)rs.push(a[0]!,b[0]!);continue;}
      const t=(y-a[1]!)/(b[1]!-a[1]!);if(t>=-1e-8 && t<=1+1e-8)rs.push(a[0]!+(b[0]!-a[0]!)*t);
    }
    return [Math.min(...rs),Math.max(...rs)];
  };
  const s=new Surface(),n=40;
  for(let j=0;j<rows.length;j++){
    const y=rows[j]!,[lo,hi]=bounds(y);
    for(let i=0;i<=n;i++){
      const u=i/n,x=sign*(lo+(hi-lo)*u),height=1.28*(1-Math.min(.999,Math.abs(x)/1.2)**.64);
      const phase=y/Math.max(.1,height)*14,seam=gaussian(phase-Math.round(phase),.09);
      const relief=(.001*noise(x,y,0)-.0045*seam)*Math.sin(Math.PI*u)*Math.sin(Math.PI*j/(rows.length-1));
      s.positions.push(x,y,relief);s.uv.push(x,y);
    }
  }
  for(let j=0;j<rows.length-1;j++)for(let i=0;i<n;i++){
    const a=j*(n+1)+i,b=a+1,c=a+n+1,d=c+1;
    s.indices.push(...(sign>0 ? [a,b,c,b,d,c] : [a,c,b,b,c,d]));
  }
  return s.geometry();
}
function volcano(part:Part) {
  const p=part.primitive!;if(p.kind!=='lathe')throw new Error('cone profile missing');
  const s=new Surface();
  // Smooth the rim/inner slope while retaining the exact flared floor join.
  const flank=p.profile.slice(0,41);
  const rim=p.profile.slice(40,47).map(([r,y])=>new Vector3(r,y,0));
  const curve=new CatmullRomCurve3(rim,false,'centripetal');
  const profile=[...flank.slice(0,-1),...curve.getPoints(32).map(v=>[v.x,v.y]),...p.profile.slice(47)];
  const point=(a:number,r:number,y:number):V3=>{
    const ca=Math.cos(a),sa=Math.sin(a),t=Math.max(0,Math.min(1,y/1.326));
    const isFlank=r>0.18 && y<1.321;
    const envelope=Math.sin(Math.PI*t)**0.7*sa;
    const rills=(0.7*Math.sin(13*a+1.9*t)+0.3*Math.sin(23*a-2.1*t))*(0.5+0.5*Math.sin(5*a+0.3));
    const relief=isFlank ? envelope*(0.018*Math.sin(3*a+0.7)+0.013*rills+0.0015*noise(r*ca,y,-r*sa)) : 0;
    const rimMix=Math.max(0,Math.min(1,(y-1.22)/0.10));
    const yy=y+rimMix*0.010*sa*Math.sin(5*a+0.6);
    const rr=r+relief+rimMix*0.004*sa*Math.cos(7*a);
    return [rr*ca,yy,-rr*sa];
  };
  // Individual meridian strips retain physical corners at the floor, bore
  // and foot; normals are smooth around the hero surface.
  for(let k=0;k<profile.length-1;k++){
    const a=profile[k]!,b=profile[k+1]!;
    s.grid(96,1,(u,v)=>point(Math.PI*u,a[0]!+(b[0]!-a[0]!)*v,a[1]!+(b[1]!-a[1]!)*v));
  }
  for(const sign of [1,-1]){const cut=sectionRelief(profile,sign);s.append(cut);cut.dispose();}
  const g=s.geometry();
  // Share normals of duplicate surface ring vertices without rounding the
  // section lip: exterior and section keep their independent normal groups.
  const position=g.getAttribute('position'),normal=g.getAttribute('normal');
  const groups=new Map<string,number[]>();
  const exterior=(profile.length-1)*97*2;
  for(let i=0;i<exterior;i++){const key=[position.getX(i),position.getY(i),position.getZ(i)].map(v=>v.toFixed(6)).join(',');const list=groups.get(key)??[];list.push(i);groups.set(key,list);}
  for(const list of groups.values()){const n=new Vector3();for(const i of list)n.add(new Vector3(normal.getX(i),normal.getY(i),normal.getZ(i)));n.normalize();for(const i of list)normal.setXYZ(i,n.x,n.y,n.z);}
  return g;
}
function specimen(x0:number,x1:number,bottom:number,depth:number,top:(x:number,z:number)=>number,kind:'fault'|'mountain'|'forearc') {
  const s=new Surface(),w=x1-x0;
  const base=(x:number)=> kind==='forearc' ? Math.max(.72,1-0.91*((x-.55)/1.05)**2+.002) : bottom;
  // Front/back relief follows bedding, with smaller mineral grain over it.
  for(const side of [-1,1]) s.grid(64,kind==='fault'?72:48,(u,v)=>{
    const x=x0+w*u,y=base(x)+(top(x,side*depth/2)-base(x))*v + (kind==='fault' ? (.012*Math.sin(x*7.1)+.006*Math.sin(x*18+.5))*Math.sin(Math.PI*v) : 0);
    const fade=Math.sin(Math.PI*u)*Math.sin(Math.PI*v);
    const phase=v*(kind==='fault'?9:8),bedding=gaussian(phase-Math.round(phase),.14);
    let fractures=0;
    if(kind==='fault')for(const joint of [-1.42,-.98,-.71,-.17,.36,.63,1.27]) fractures+=.004*gaussian(x-joint-.015*Math.sin(y*15+joint),.012);
    const dz=fade*(.0018*noise(x,y,side)-(kind==='fault'?.014:.010)*bedding-fractures);
    return [x,y,side*(depth/2+dz)];
  },side<0);
  s.grid(64,24,(u,v)=>{const x=x0+w*u,z=(v-.5)*depth;return[x,top(x,z),z];},true);
  s.grid(64,1,(u,v)=>{const x=x0+w*u;return[x,base(x),(v-.5)*depth];});
  for(const side of [-1,1])s.grid(24,20,(u,v)=>{
    const x=side<0?x0:x1,z=(u-.5)*depth;const y=base(x)+(top(x,z)-base(x))*v,relief=kind==='fault' ? side*.0025*Math.sin(z*48+y*.7)*Math.sin(Math.PI*u)*Math.sin(Math.PI*v) : 0;return[x+relief,y,z];
  },side>0);
  return s.geometry();
}
export async function sculptGeology(parts:Part[],output:string) {
  const meshes=new Map<string,BufferGeometry>();
  const byId=(id:string)=>parts.find(p=>p.id===id)!;
  meshes.set('volcano-cone',volcano(byId('volcano-cone')));
  for(const [side,x] of [['left',-.765],['right',.765]] as const){
    const top=(xx:number,z:number)=>{
      let cracks=0;for(const joint of [-1.42,-.98,-.71,-.17,.36,.63,1.27]){const q=joint+.023*Math.sin(z*13+joint);cracks+=.006*gaussian(xx-q,.012);}
      return 1.246-0.003*(1+noise(xx,0,z)) - cracks;
    };
    meshes.set(`fault-${side}`,specimen(x-.735,x+.735,.55,1,top,'fault'));
  }
  const mountain=(x:number,z:number)=>-.53+.31*gaussian(x-1.08-.045*Math.sin(z*5),.18)+.17*gaussian(x-.72+.035*Math.sin(z*7+.6),.14)+.068*gaussian(x-1.37,.09)+.008*noise(x,0,z);
  meshes.set('collision-fold',specimen(.08,1.78,-1.02,.7,mountain,'mountain'));
  const forearc=(x:number,z:number)=>.997+.105*(1-gaussian(x-.64,.10))+.065*gaussian(x-.94-.03*Math.sin(z*8),.13)+.20*gaussian(x-1.43+.045*Math.sin(z*5),.11)+.006*noise(x,0,z)*Math.min(1,(x-.64)/.1);
  meshes.set('edge-sub-right',specimen(.64,1.78,.72,.7,forearc,'forearc'));
  const melt=new SphereGeometry(1,40,24),p=melt.getAttribute('position');
  for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),f=1+.13*Math.sin(x*4+y*3)+.055*Math.cos(z*6-y*5);p.setXYZ(i,1.22+x*.169*f,.71+y*.0845*f,.42+z*.091*f);}
  melt.computeVertexNormals();meshes.set('edge-melt',melt);
  const doc=new Document(),buffer=doc.createBuffer(),scene=doc.createScene('Geological relief specimens');
  doc.getRoot().getAsset().copyright='Atlas original procedural geological teaching reconstruction · CC BY-NC-SA 4.0. Generated by scripts/geo/inside-the-earth/sculpt-geology.ts; no third-party mesh or texture.';
  for(const [id,g] of meshes){
    const positions=g.getAttribute('position'),normals=g.getAttribute('normal'),uv=g.getAttribute('uv');
    const primitive=doc.createPrimitive()
      .setAttribute('POSITION',doc.createAccessor().setType('VEC3').setArray(new Float32Array(positions.array)).setBuffer(buffer))
      .setAttribute('NORMAL',doc.createAccessor().setType('VEC3').setArray(new Float32Array(normals.array)).setBuffer(buffer))
      .setAttribute('TEXCOORD_0',doc.createAccessor().setType('VEC2').setArray(new Float32Array(uv.array)).setBuffer(buffer))
      .setIndices(doc.createAccessor().setType('SCALAR').setArray(new Uint32Array(g.index!.array)).setBuffer(buffer));
    scene.addChild(doc.createNode(id).setMesh(doc.createMesh(id).addPrimitive(primitive)).setExtras({closed:true}));
    const part=byId(id);part.mesh=id;
    // Cross-section primitives remain as exact authoring/label contracts.
    part.primitive!.color=id==='edge-melt' ? 'enamel' : 'abrasive';
    if(id!=='edge-melt')part.primitive!.tint='token:ink-3';
    g.dispose();
  }
  await MeshoptEncoder.ready;
  // Preserve the complete sculpt and topology. Sixteen position bits keep
  // the quantisation step below 0.00004 scene units on these specimens.
  await doc.transform(meshopt({encoder:MeshoptEncoder,level:'high',quantizePosition:16,quantizeNormal:10,quantizeTexcoord:14}));
  const bytes=await new NodeIO().registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({'meshopt.encoder':MeshoptEncoder}).writeBinary(doc);
  if(bytes.length>1_500_000)throw new Error(`Earth relief exceeds 1.5 MB: ${bytes.length} bytes`);
  mkdirSync(dirname(output),{recursive:true});writeFileSync(output,bytes);
  process.stdout.write(`Earth relief: ${bytes.length} bytes · six named meshes · meshopt compression\n`);
}
