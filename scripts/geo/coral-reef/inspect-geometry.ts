/** Offline geometry QA using real engine tessellation. No browser/GPU use.
 * pnpm tsx scripts/geo/coral-reef/inspect-geometry.ts r1
 */
import fs from 'node:fs';
import sharp from 'sharp';
import { Matrix4, PerspectiveCamera, Vector3 } from 'three';
import { partsFile, type Part } from '../../../src/engines/space-scene/schema';
import { partPieces } from '../../../src/engines/space-scene/stages/model3d/geometry';
import { partBounds, partMaterialSlots } from '../../../src/engines/space-scene/lib/parts';
import { solveTable } from '../../../src/engines/space-scene/lib/sim/table';

const data=partsFile.parse(JSON.parse(fs.readFileSync('src/content/topics/coral-reef/data/parts.json','utf8')));
const round=process.argv[2]??'r2';
const folder='/private/tmp/coral-reef-model-qa';
fs.mkdirSync(folder,{recursive:true});
const light=new Vector3(-.35,.8,1).normalize();
const W=1200,H=850,VH=730;
const palette:Record<string,number[]>={
  'token:neutral':[138,131,120],'token:bone':[224,214,191],
  'token:food':[138,138,60],'token:muscle-1':[196,138,118],
  'token:muscle-3':[145,79,68],'token:cold':[79,127,140],
  'token:signal':[204,99,40],'token:ink':[42,40,36],
};
const defaults=Object.fromEntries(data.sim!.controls.map(c=>[c.id,c.default]));
const outputs=solveTable(data.sim!.table!,defaults,data.sim!.outputs);
const slots=new Map(data.parts.map(p=>[p.id,partMaterialSlots(p)]));
type Triangle={vertices:Vector3[];normal:Vector3;color:number[];opacity:number};
const baked=new Map<string,Triangle[]>();
const counts:Record<string,{triangles:number;pieces:number;bounds:ReturnType<typeof partBounds>}>={};
let totalTriangles=0,totalPieces=0;
for(const p of data.parts){
  const triangles:Triangle[]=[];
  const pieces=partPieces(p);
  for(const piece of pieces){
    const g=piece.geometry,pos=g.getAttribute('position'),index=g.index;
    for(const name of ['position','normal']){
      const arr=g.getAttribute(name)?.array;
      if(arr&&!Array.from(arr).every(Number.isFinite))throw new Error(`${p.id}: nonfinite ${name}`);
    }
    const m=slots.get(p.id)![piece.slot ?? 0]!;
    const color=palette[m.tint??m.color]??[193,183,160];
    const opacity=m.color==='membrane'?.42:1;
    if(piece.lines)continue;
    for(const matrix of piece.matrices??[new Matrix4()]){
      for(let i=0;i<(index?.count??pos.count);i+=3){
        const vertices=[0,1,2].map(j=>new Vector3().fromBufferAttribute(pos,index?index.getX(i+j):i+j).applyMatrix4(matrix).add(new Vector3(...p.primitive!.at)));
        // The original table binds this marker's Y offset to L × .01.
        if(p.id==='light-marker')for(const v of vertices)v.y+=Number(outputs['light-index'])*.01;
        const normal=new Vector3().crossVectors(new Vector3().subVectors(vertices[1]!,vertices[0]!),new Vector3().subVectors(vertices[2]!,vertices[0]!)).normalize();
        triangles.push({vertices,normal,color,opacity});
      }
    }
    g.dispose();
  }
  baked.set(p.id,triangles);
  counts[p.id]={triangles:triangles.length,pieces:pieces.length,bounds:partBounds(p)};
  totalTriangles+=triangles.length;totalPieces+=pieces.length;
}
const intended:Record<string,(p:Part)=>boolean>={
  hero:p=>p.group==='reef-habitat',reef:p=>p.group==='reef-habitat',
  polyp:p=>p.group==='polyp-closeup',web:p=>p.group==='web-specimens',
  evidence:p=>p.group==='evidence-tools',conservation:p=>p.group==='evidence-tools',
};
const cameras:Record<string,unknown>={};
for(const preset of data.presets!){
  const name=preset.id;
  const camera=new PerspectiveCamera(preset.camera.fov,W/VH,.01,100);
  camera.position.set(...preset.camera.position);camera.lookAt(new Vector3(...preset.camera.target));camera.updateMatrixWorld();
  const projected:{z:number;path:string;color:string;opacity:number}[]=[];
  const targets:Record<string,{ndcMin:number[];ndcMax:number[];visibleTriangles:number;expected:boolean}>={};
  for(const p of data.parts){
    const ndcMin=[Infinity,Infinity,Infinity],ndcMax=[-Infinity,-Infinity,-Infinity];let visibleTriangles=0;
    for(const t of baked.get(p.id)!){
      const centroid=t.vertices[0]!.clone().add(t.vertices[1]!).add(t.vertices[2]!).multiplyScalar(1/3);
      const vs=t.vertices.map(v=>v.clone().project(camera));
      for(const v of vs)for(const [i,k]of(['x','y','z'] as const).entries()){ndcMin[i]=Math.min(ndcMin[i]!,v[k]);ndcMax[i]=Math.max(ndcMax[i]!,v[k]);}
      if(t.normal.dot(camera.position.clone().sub(centroid))<=0&&t.opacity===1)continue;
      if(vs.every(v=>v.x< -1)||vs.every(v=>v.x>1)||vs.every(v=>v.y< -1)||vs.every(v=>v.y>1)||vs.some(v=>v.z< -1||v.z>1))continue;
      visibleTriangles++;
      const area=Math.abs((vs[1]!.x-vs[0]!.x)*(vs[2]!.y-vs[0]!.y)-(vs[2]!.x-vs[0]!.x)*(vs[1]!.y-vs[0]!.y))*W*VH/8;
      if(area<.12)continue;
      const shade=.52+.48*Math.max(0,t.normal.dot(light));
      const z=centroid.clone().applyMatrix4(camera.matrixWorldInverse).z;
      projected.push({z,path:vs.map((v,j)=>`${j?'L':'M'}${((v.x+1)*W/2).toFixed(2)},${(65+(1-v.y)*VH/2).toFixed(2)}`).join('')+'Z',color:`rgb(${t.color.map(c=>Math.round(c*shade)).join(',')})`,opacity:t.opacity});
    }
    targets[p.id]={ndcMin,ndcMax,visibleTriangles,expected:intended[name]!(p)};
  }
  projected.sort((a,b)=>a.z-b.z);
  const unexpected=Object.entries(targets).filter(([,t])=>!t.expected&&t.visibleTriangles>0).map(([id])=>id);
  cameras[name]={camera:preset.camera,targets,unexpectedVisibleParts:unexpected};
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><defs><clipPath id="viewport"><rect x="0" y="65" width="${W}" height="${VH}"/></clipPath></defs><rect width="${W}" height="${H}" fill="#e9e4d8"/><g font-family="sans-serif" fill="#333"><text x="25" y="30" font-size="20">${round} · coral-reef · ${name} · all groups active</text><text x="25" y="53" font-size="13">Actual engine tessellation · schematic habitat and separately enlarged specimens</text></g><g clip-path="url(#viewport)">${projected.map(t=>`<path d="${t.path}" fill="${t.color}" fill-opacity="${t.opacity}"/>`).join('')}</g><text x="25" y="825" font-size="14" font-family="sans-serif" fill="#333">Offline CPU projection; GPU materials, lighting, transparency, HUD and interaction pending.</text></svg>`;
  await sharp(Buffer.from(svg)).png().toFile(`${folder}/${round}-${name}.png`);
}
const collisions=[];
for(let i=0;i<data.parts.length;i++)for(let j=i+1;j<data.parts.length;j++){
  const a=data.parts[i]!,b=data.parts[j]!;
  if(a.group!==b.group)continue;
  const ab=partBounds(a)!,bb=partBounds(b)!;
  const overlap=[0,1,2].map(k=>Math.min(ab.max[k]!,bb.max[k]!)-Math.max(ab.min[k]!,bb.min[k]!));
  if(overlap.every(v=>v>0))collisions.push({a:a.id,b:b.id,overlap});
}
const report={round,kind:'offline-cpu-geometry',totalTriangles,totalPieces,counts,cameras,collisions,
  notes:['All bounds and tessellated positions/normals finite.','Collisions are conservative AABBs: connected tissue/skeleton, nested cells and support contacts are intentional.','No exploded displacement: all explode distances are zero.','No GPU/browser/runtime performance claim.']};
fs.writeFileSync(`${folder}/${round}-metrics.json`,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({round,totalTriangles,totalPieces,cameraIntrusions:Object.fromEntries(Object.entries(cameras).map(([id,c])=>[id,(c as {unexpectedVisibleParts:string[]}).unexpectedVisibleParts])),folder}));
