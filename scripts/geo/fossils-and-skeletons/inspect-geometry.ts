/** Offline geometry review fallback when sandbox prevents Chromium launch.
 * Uses the real engine tessellation; this is not a browser screenshot or GPU test.
 */
import fs from 'node:fs';
import sharp from 'sharp';
import { PerspectiveCamera, Vector3 } from 'three';
import { partsFile } from '../../../src/engines/space-scene/schema';
import { partPieces } from '../../../src/engines/space-scene/stages/model3d/geometry';
import { partBounds } from '../../../src/engines/space-scene/lib/parts';

const data=partsFile.parse(JSON.parse(fs.readFileSync('src/content/topics/fossils-and-skeletons/data/parts.json','utf8')));
const folder='/private/tmp/fossils-model-qa';fs.mkdirSync(folder,{recursive:true});
const round=process.argv[2]??'r2';
const light=new Vector3(-.3,.8,1).normalize();
const studies=[['skeleton',data.parts.filter(p=>p.group==='skeleton')],['specimens',data.parts.filter(p=>p.group==='specimens'&&p.id!=='leaf-lid')],['pores',data.parts.filter(p=>['pore-shell','pore-minerals'].includes(p.id))],['museum',data.parts.filter(p=>p.id.endsWith('-study'))],['bird',data.parts.filter(p=>p.id.startsWith('myna-'))]] as const;
const counts:Record<string,{triangles:number;pieces:number}>={};
for(const[name,items]of studies){
 for(const angle of ['side','oblique']){
  const camera=new PerspectiveCamera(34,1200/650,.1,100);
  const target=name==='pores'?new Vector3(0,2.1,.9):new Vector3(0,2,0);
  const p=name==='skeleton'?(angle==='side'?[0,3,15]:[-3,4,14]):name==='specimens'?(angle==='side'?[0,11,12]:[3,11,12]):name==='pores'?(angle==='side'?[0,2.2,8]:[2,3.2,8]):angle==='side'?[0,2.6,12]:[3,5,12];
  camera.position.set(p[0]!,p[1]!,p[2]!);camera.lookAt(target);camera.updateMatrixWorld();
  const triangles:{z:number;path:string;color:string}[]=[];let pieces=0;
  for(const part of items){const color=part.primitive?.tint??part.primitive?.color;const rgb=color==='token:cold'?[112,147,153]:color==='token:ink-2'?[76,72,64]:color==='token:neutral'?[154,147,132]:[211,200,167];
   for(const piece of partPieces(part)){pieces++; const g=piece.geometry;const pos=g.getAttribute('position');const index=g.index;
    for(const matrix of piece.matrices??[null])for(let i=0;i<(index?.count??pos.count);i+=3){const vs=[0,1,2].map(j=>{const n=index?index.getX(i+j):i+j;const v=new Vector3().fromBufferAttribute(pos,n);if(matrix)v.applyMatrix4(matrix);v.add(new Vector3(...part.primitive!.at));return v;});
     const face=new Vector3().crossVectors(new Vector3().subVectors(vs[1]!,vs[0]!),new Vector3().subVectors(vs[2]!,vs[0]!)).normalize();
     const centroid=vs[0]!.clone().add(vs[1]!).add(vs[2]!).multiplyScalar(1/3);if(face.dot(camera.position.clone().sub(centroid))<=0)continue;
     const bright=.45+.55*Math.max(0,face.dot(light)); const z=vs.reduce((n,v)=>n+v.clone().applyMatrix4(camera.matrixWorldInverse).z,0)/3;
     const projected=vs.map(v=>v.project(camera));if(projected.some(v=>Math.abs(v.x)>2||Math.abs(v.y)>2))continue;
     triangles.push({z,path:projected.map((v,j)=>`${j?'L':'M'}${(v.x*600+600).toFixed(2)},${(-v.y*325+390).toFixed(2)}`).join('')+'Z',color:`rgb(${rgb.map(v=>Math.round(v*bright)).join(',')})`});
    }
   }
  }
  triangles.sort((a,b)=>a.z-b.z);
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="800"><rect width="1600" height="800" fill="#e9e4d8"/><text x="32" y="36" font-family="sans-serif" font-size="20">${round} · ${name} · ${angle} · original schematic geometry</text>${triangles.map(t=>`<path d="${t.path}" fill="${t.color}"/>`).join('')}<rect x="1210" y="70" width="1" height="640" fill="#aaa"/><g font-family="sans-serif" fill="#333" font-size="17"><text x="1234" y="105">Institutional reference checks</text><text x="1234" y="150">S9 AMNH: two functional fingers</text><text x="1234" y="185">S48 AMNH: three main toes</text><text x="1234" y="220">S4 NPS: mineral fills pores</text><text x="1234" y="255">S54 NPS: impression has no film</text><text x="1234" y="290">S55 Field: cast ≠ inferred shape</text><text x="1234" y="345">Not a measured specimen copy</text><text x="1234" y="380">No bone, rib or tooth count claim</text><text x="1234" y="430">Offline CPU projection of actual</text><text x="1234" y="460">engine tessellation; GPU lighting</text><text x="1234" y="490">and browser layout unverified.</text></g></svg>`;
  await sharp(Buffer.from(svg)).png().toFile(`${folder}/${round}-${name}-${angle}.png`);counts[name]={triangles:triangles.length,pieces};
 }
}
const collisions=[];
for(const exploded of [false,true])for(const[name,items]of studies){for(let i=0;i<items.length;i++)for(let j=i+1;j<items.length;j++){
 const a=items[i]!,b=items[j]!;const offset=(p:typeof a)=>exploded?p.explode.dir.map(v=>v*p.explode.dist/Math.hypot(...p.explode.dir)):[0,0,0];const ab=partBounds(a,offset(a))!,bb=partBounds(b,offset(b))!;
 const overlap=[0,1,2].map(k=>Math.min(ab.max[k]!,bb.max[k]!)-Math.max(ab.min[k]!,bb.min[k]!));if(overlap.every(v=>v>0))collisions.push({study:name,exploded,a:a.id,b:b.id,overlap});
}}
fs.writeFileSync(`${folder}/${round}-metrics.json`,JSON.stringify({counts,collisions},null,2));
console.log(JSON.stringify(counts));
