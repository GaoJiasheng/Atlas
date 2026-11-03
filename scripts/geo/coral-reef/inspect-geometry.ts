/** Offline CPU geometry QA. Uses engine primitive tessellation and the topic's
 * uncompressed local GLB, with a per-pixel depth buffer and interpolated normals.
 * pnpm tsx scripts/geo/coral-reef/inspect-geometry.ts polish-after [comma-separated-view-ids]
 */
import fs from 'node:fs';
import sharp from 'sharp';
import { BufferAttribute, BufferGeometry, Matrix3, Matrix4, PerspectiveCamera, Quaternion, Vector3 } from 'three';
import { partsFile, type Part } from '../../../src/engines/space-scene/schema';
import { partPieces } from '../../../src/engines/space-scene/stages/model3d/geometry';
import { partMaterialSlots } from '../../../src/engines/space-scene/lib/parts';
import { solveTable } from '../../../src/engines/space-scene/lib/sim/table';

const data=partsFile.parse(JSON.parse(fs.readFileSync('src/content/topics/coral-reef/data/parts.json','utf8')));
const round=process.argv[2]??'polish-after';
const selectedViews=process.argv[3]?new Set(process.argv[3].split(',')):undefined;
const folder='/private/tmp/coral-reef-model-qa';
fs.mkdirSync(folder,{recursive:true});
const W=1200,H=850,VH=730,TOP=65;
const light=new Vector3(-.35,.8,1).normalize(), fill=new Vector3(.8,.4,-.2).normalize();
const palette:Record<string,number[]>={
  'token:neutral':[138,131,120],'token:bone':[224,214,191],
  'token:food':[138,138,60],'token:muscle-1':[196,138,118],
  'token:muscle-3':[145,79,68],'token:cold':[79,127,140],
  'token:signal':[204,99,40],'token:ink':[42,40,36],
};
const defaults=Object.fromEntries(data.sim!.controls.map(c=>[c.id,c.default]));
const outputs=solveTable(data.sim!.table!,defaults,data.sim!.outputs);
type V3=[number,number,number];
type Triangle={vertices:Vector3[];normals:Vector3[];face:Vector3;color:number[];opacity:number};
type Bounds={min:V3;max:V3};
type Gltf={accessors:{bufferView:number;byteOffset?:number;componentType:number;count:number;type:string}[];bufferViews:{byteOffset?:number;byteLength:number;byteStride?:number}[];meshes:{name?:string;primitives:{attributes:Record<string,number>;indices?:number;mode?:number}[]}[];nodes:{name?:string;mesh?:number;matrix?:number[];translation?:number[];rotation?:number[];scale?:number[];children?:number[]}[];scenes:{nodes:number[]}[];scene?:number};
function readGlb(file:string){
  const bytes=fs.readFileSync(file);
  if(bytes.toString('ascii',0,4)!=='glTF'||bytes.readUInt32LE(4)!==2)throw new Error('Expected GLB v2');
  const jsonSize=bytes.readUInt32LE(12),gltf=JSON.parse(bytes.toString('utf8',20,20+jsonSize)) as Gltf;
  const bin=bytes.subarray(28+jsonSize),components:Record<string,number>={SCALAR:1,VEC2:2,VEC3:3,VEC4:4};
  function attribute(n:number){
    const a=gltf.accessors[n]!,view=gltf.bufferViews[a.bufferView]!,size=components[a.type]!;
    const widths:Record<number,number>={5120:1,5121:1,5122:2,5123:2,5125:4,5126:4},width=widths[a.componentType]!;
    const values=new Float32Array(a.count*size),start=(view.byteOffset??0)+(a.byteOffset??0);
    for(let i=0;i<a.count;i++)for(let j=0;j<size;j++){
      const at=start+i*(view.byteStride??size*width)+j*width;
      values[i*size+j]=a.componentType===5126?bin.readFloatLE(at):a.componentType===5125?bin.readUInt32LE(at):a.componentType===5123?bin.readUInt16LE(at):a.componentType===5122?bin.readInt16LE(at):a.componentType===5121?bin.readUInt8(at):bin.readInt8(at);
    }
    return new BufferAttribute(values,size);
  }
  const result=new Map<string,{geometry:BufferGeometry;matrix:Matrix4}[]>();
  function visit(index:number,parent:Matrix4){
    const node=gltf.nodes[index]!,local=node.matrix?new Matrix4().fromArray(node.matrix):new Matrix4().compose(new Vector3(...(node.translation??[0,0,0]) as V3),new Quaternion(...(node.rotation??[0,0,0,1]) as [number,number,number,number]),new Vector3(...(node.scale??[1,1,1]) as V3));
    const matrix=parent.clone().multiply(local);
    if(node.mesh!==undefined){
      const mesh=gltf.meshes[node.mesh]!,pieces=[];
      for(const primitive of mesh.primitives){
        if(primitive.mode!==undefined&&primitive.mode!==4)throw new Error('Preview supports triangle GLB primitives');
        const geometry=new BufferGeometry();
        geometry.setAttribute('position',attribute(primitive.attributes.POSITION!));
        if(primitive.attributes.NORMAL!==undefined)geometry.setAttribute('normal',attribute(primitive.attributes.NORMAL));
        if(primitive.indices!==undefined)geometry.setIndex(Array.from(attribute(primitive.indices).array));
        if(!geometry.hasAttribute('normal'))geometry.computeVertexNormals();
        pieces.push({geometry,matrix});
      }
      result.set(node.name??mesh.name??String(index),pieces);
    }
    for(const child of node.children??[])visit(child,matrix);
  }
  for(const node of gltf.scenes[gltf.scene??0]!.nodes)visit(node,new Matrix4());
  return result;
}
const glb=data.model?readGlb(`public${data.model}`):new Map<string,{geometry:BufferGeometry;matrix:Matrix4}[]>();
const baked=new Map<string,Triangle[]>();
const counts:Record<string,{triangles:number;pieces:number;source:string;bounds:Bounds}>={};
let totalTriangles=0,totalPieces=0;
for(const p of data.parts){
  const triangles:Triangle[]=[],bounds:Bounds={min:[Infinity,Infinity,Infinity],max:[-Infinity,-Infinity,-Infinity]};
  const enginePieces=p.mesh?undefined:partPieces(p),slots=partMaterialSlots(p);
  const pieces=p.mesh?glb.get(p.mesh):enginePieces!.filter(piece=>!piece.lines).flatMap(piece=>(piece.matrices??[new Matrix4()]).map(matrix=>({geometry:piece.geometry,matrix:new Matrix4().makeTranslation(...p.primitive!.at).multiply(matrix),slot:piece.slot??0})));
  if(!pieces)throw new Error(`${p.id}: missing GLB node ${p.mesh}`);
  for(const piece of pieces){
    const g=piece.geometry,pos=g.getAttribute('position'),norm=g.getAttribute('normal'),index=g.index;
    for(const name of ['position','normal'])if(!Array.from(g.getAttribute(name).array).every(Number.isFinite))throw new Error(`${p.id}: nonfinite ${name}`);
    const m=p.mesh?p.material!:slots['slot' in piece?Number(piece.slot):0]!,color=palette[m.tint??m.color]??[193,183,160],opacity=m.color==='membrane'?.42:1;
    const normalMatrix=new Matrix3().getNormalMatrix(piece.matrix);
    for(let i=0;i<(index?.count??pos.count);i+=3){
      const ids=[0,1,2].map(j=>index?index.getX(i+j):i+j);
      const vertices=ids.map(id=>new Vector3().fromBufferAttribute(pos,id).applyMatrix4(piece.matrix));
      if(p.id==='light-marker')for(const v of vertices)v.y+=Number(outputs['light-index'])*.01;
      const normals=ids.map(id=>new Vector3().fromBufferAttribute(norm,id).applyMatrix3(normalMatrix).normalize());
      for(const v of vertices)for(const [k,key] of (['x','y','z'] as const).entries()){bounds.min[k]=Math.min(bounds.min[k]!,v[key]);bounds.max[k]=Math.max(bounds.max[k]!,v[key]);}
      const face=new Vector3().crossVectors(new Vector3().subVectors(vertices[1]!,vertices[0]!),new Vector3().subVectors(vertices[2]!,vertices[0]!)).normalize();
      triangles.push({vertices,normals,face,color,opacity});
    }
  }
  for(const piece of enginePieces??[])piece.geometry.dispose();
  baked.set(p.id,triangles);
  counts[p.id]={triangles:triangles.length,pieces:enginePieces?.length??pieces.length,source:p.mesh?'GLB':'engine primitive',bounds};
  totalTriangles+=triangles.length;totalPieces+=counts[p.id]!.pieces;
}
const intended:Record<string,(p:Part)=>boolean>={hero:p=>p.group==='reef-habitat',reef:p=>p.group==='reef-habitat',polyp:p=>p.group==='polyp-closeup',web:p=>p.group==='web-specimens'||p.group==='feeding-flows',evidence:p=>p.group==='evidence-tools',conservation:p=>p.group==='evidence-tools'};
type Camera={position:V3;target:V3;fov:number};
type View={id:string;camera:Camera;only?:string[];cutaway?:boolean};
const views:View[]=data.presets!.map(p=>({id:p.id,camera:{...p.camera,fov:p.camera.fov??30}}));
function closeup(id:string,only:string[],direction:V3,cutaway=false){
  const bounds:Bounds={min:[Infinity,Infinity,Infinity],max:[-Infinity,-Infinity,-Infinity]};
  for(const part of only){const b=counts[part]!.bounds;for(let k=0;k<3;k++){bounds.min[k]=Math.min(bounds.min[k]!,b.min[k]!);bounds.max[k]=Math.max(bounds.max[k]!,b.max[k]!);}}
  const target=bounds.min.map((v,k)=>(v+bounds.max[k]!)/2) as V3;
  const axis=new Vector3(...direction).normalize(),right=new Vector3().crossVectors(new Vector3(0,1,0),axis).normalize(),up=new Vector3().crossVectors(axis,right);
  const tangent=Math.tan(14*Math.PI/180),margin=.86;
  let distance=0;
  // Fit the actual surface, rather than the conservative bounding sphere: small
  // calice and tentacle details should remain legible in the exported close-ups.
  for(const part of only)for(const triangle of baked.get(part)!)for(const point of triangle.vertices){
    const dx=point.x-target[0],dy=point.y-target[1],dz=point.z-target[2];
    const z=dx*axis.x+dy*axis.y+dz*axis.z;
    distance=Math.max(distance,z+Math.abs(dx*right.x+dy*right.y+dz*right.z)/(margin*tangent*W/VH),z+Math.abs(dx*up.x+dy*up.y+dz*up.z)/(margin*tangent));
  }
  const position=new Vector3(...target).add(axis.multiplyScalar(distance)).toArray() as V3;
  views.push({id,camera:{position,target,fov:28},only,cutaway});
}
closeup('boulder',['colony-boulder','colony-tissue'],[.9,.7,1]);
closeup('sheet',['colony-sheet'],[.7,.5,1]);
closeup('branching',['nursery-fragments'],[.7,.5,1]);
const polyp=['polyp-tissue','polyp-mouth','polyp-tentacles','polyp-skeleton','polyp-symbionts'];
closeup('polyp-top',polyp,[.16,1,.24]);
closeup('polyp-side',polyp,[.7,.38,1]);
closeup('polyp-cutaway',polyp,[.8,.5,1],true);
closeup('polyp-skeleton',['polyp-skeleton'],[.4,1,.65]);
closeup('polyp-skeleton-top',['polyp-skeleton'],[0,1,.0001]);
closeup('nursery',['nursery-frame','nursery-fragments'],[.7,.8,1]);
closeup('quadrat',['monitoring-quadrat'],[.1,1,.45]);
closeup('quadrat-top',['monitoring-quadrat'],[0,1,.0001]);
closeup('parrotfish',['web-parrotfish'],[.1,.12,1]);
const cameras:Record<string,unknown>={};
for(const view of views.filter(view=>!selectedViews||selectedViews.has(view.id))){
  const camera=new PerspectiveCamera(view.camera.fov,W/VH,.001,100);
  camera.position.set(...view.camera.position);camera.lookAt(new Vector3(...view.camera.target));camera.updateMatrixWorld();
  const rgba=new Uint8Array(W*VH*4),depth=new Float32Array(W*VH).fill(Infinity);
  for(let i=0;i<W*VH;i++){rgba[i*4]=233;rgba[i*4+1]=228;rgba[i*4+2]=216;rgba[i*4+3]=255;}
  const targets:Record<string,{ndcMin:number[];ndcMax:number[];visibleTriangles:number;expected:boolean}>={};
  const queue:{id:string;t:Triangle;z:number}[]=[];
  for(const p of data.parts){
    const ndcMin=[Infinity,Infinity,Infinity],ndcMax=[-Infinity,-Infinity,-Infinity];let visibleTriangles=0;
    if(view.only&&!view.only.includes(p.id))continue;
    for(const t of baked.get(p.id)!){
      const vs=t.vertices.map(v=>v.clone().project(camera));
      for(const v of vs)for(const [i,k]of(['x','y','z'] as const).entries()){ndcMin[i]=Math.min(ndcMin[i]!,v[k]);ndcMax[i]=Math.max(ndcMax[i]!,v[k]);}
      const centroid=t.vertices[0]!.clone().add(t.vertices[1]!).add(t.vertices[2]!).multiplyScalar(1/3);
      if(t.face.dot(camera.position.clone().sub(centroid))<=0&&t.opacity===1)continue;
      if(vs.every(v=>v.x< -1)||vs.every(v=>v.x>1)||vs.every(v=>v.y< -1)||vs.every(v=>v.y>1)||vs.some(v=>v.z< -1||v.z>1))continue;
      visibleTriangles++;queue.push({id:p.id,t,z:centroid.clone().applyMatrix4(camera.matrixWorldInverse).z});
    }
    targets[p.id]={ndcMin,ndcMax,visibleTriangles,expected:view.only?true:intended[view.id]!(p)};
  }
  // Opaque surfaces use exact depth; translucent membranes are composited back to front.
  queue.sort((a,b)=>(a.t.opacity===1?0:1)-(b.t.opacity===1?0:1)||a.z-b.z);
  for(const {id,t} of queue){
    const vs=t.vertices.map(v=>v.clone().project(camera)),screen=vs.map(v=>[(v.x+1)*W/2,(1-v.y)*VH/2]);
    const [a,b,c]=screen as [number[],number[],number[]];
    const area=(b[0]!-a[0]!)*(c[1]!-a[1]!)-(b[1]!-a[1]!)*(c[0]!-a[0]!);
    if(Math.abs(area)<.02)continue;
    const x0=Math.max(0,Math.floor(Math.min(a[0]!,b[0]!,c[0]!))),x1=Math.min(W-1,Math.ceil(Math.max(a[0]!,b[0]!,c[0]!)));
    const y0=Math.max(0,Math.floor(Math.min(a[1]!,b[1]!,c[1]!))),y1=Math.min(VH-1,Math.ceil(Math.max(a[1]!,b[1]!,c[1]!)));
    const iw=t.vertices.map(v=>-1/v.clone().applyMatrix4(camera.matrixWorldInverse).z);
    for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
      const px=x+.5,py=y+.5;
      const u=((b[0]!-px)*(c[1]!-py)-(b[1]!-py)*(c[0]!-px))/area;
      const v=((c[0]!-px)*(a[1]!-py)-(c[1]!-py)*(a[0]!-px))/area,w=1-u-v;
      if(u<0||v<0||w<0)continue;
      const z=u*vs[0]!.z+v*vs[1]!.z+w*vs[2]!.z,index=y*W+x;
      if(z>=depth[index]!)continue;
      const denom=u*iw[0]!+v*iw[1]!+w*iw[2]!,pu=u*iw[0]!/denom,pv=v*iw[1]!/denom,pw=w*iw[2]!/denom;
      if(view.cutaway&&id!=='polyp-skeleton'&&(pu*t.vertices[0]!.x+pv*t.vertices[1]!.x+pw*t.vertices[2]!.x)>5)continue;
      let nx=pu*t.normals[0]!.x+pv*t.normals[1]!.x+pw*t.normals[2]!.x,ny=pu*t.normals[0]!.y+pv*t.normals[1]!.y+pw*t.normals[2]!.y,nz=pu*t.normals[0]!.z+pv*t.normals[1]!.z+pw*t.normals[2]!.z;
      const norm=1/Math.hypot(nx,ny,nz);nx*=norm;ny*=norm;nz*=norm;
      const shade=.45+.48*Math.max(0,nx*light.x+ny*light.y+nz*light.z)+.13*Math.max(0,nx*fill.x+ny*fill.y+nz*fill.z)+.04*ny;
      for(let k=0;k<3;k++)rgba[index*4+k]=Math.min(255,t.color[k]!*shade)*t.opacity+rgba[index*4+k]!*(1-t.opacity);
      if(t.opacity===1)depth[index]=z;
    }
  }
  const unexpected=Object.entries(targets).filter(([,t])=>!t.expected&&t.visibleTriangles>0).map(([id])=>id);
  cameras[view.id]={camera:view.camera,targets,unexpectedVisibleParts:unexpected};
  const text=`<svg width="${W}" height="${H}"><g font-family="sans-serif" fill="#333"><text x="25" y="30" font-size="20">${round} · coral-reef · ${view.id}</text><text x="25" y="53" font-size="13">Actual geometry · CPU depth buffer · interpolated vertex normals${view.only?' · isolated detail':' · all groups active'}</text><text x="25" y="825" font-size="14">Offline geometry preview; GPU lighting, HUD, material grain and interaction require runtime acceptance.</text></g></svg>`;
  const viewport=await sharp(Buffer.from(rgba),{raw:{width:W,height:VH,channels:4}}).png().toBuffer();
  await sharp({create:{width:W,height:H,channels:4,background:'#e9e4d8'}}).composite([{input:viewport,top:TOP,left:0},{input:Buffer.from(text),top:0,left:0}]).png().toFile(`${folder}/${round}-${view.id}.png`);
}
const collisions=[];
for(let i=0;i<data.parts.length;i++)for(let j=i+1;j<data.parts.length;j++){
  const a=data.parts[i]!,b=data.parts[j]!;if(a.group!==b.group)continue;
  const ab=counts[a.id]!.bounds,bb=counts[b.id]!.bounds;
  const overlap=[0,1,2].map(k=>Math.min(ab.max[k]!,bb.max[k]!)-Math.max(ab.min[k]!,bb.min[k]!));
  if(overlap.every(v=>v>0))collisions.push({a:a.id,b:b.id,overlap});
}
const groupTriangles:Record<string,number>={};
for(const p of data.parts)groupTriangles[p.group??'ungrouped']=(groupTriangles[p.group??'ungrouped']??0)+counts[p.id]!.triangles;
const report={round,kind:'offline-cpu-depth-buffer',totalTriangles,totalPieces,groupTriangles,counts,cameras,collisions,notes:['Actual engine primitive tessellation and local GLB mesh geometry.','All tessellated positions/normals finite.','Vertex normals use perspective-correct interpolation; per-pixel z-buffer resolves overlap.','Collisions are conservative AABBs: connected tissue/skeleton, nested cells and support contacts are intentional.','No exploded displacement.','No GPU/browser/runtime performance or HUD claim.']};
fs.writeFileSync(`${folder}/${round}${selectedViews?'-selected':''}-metrics.json`,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({round,totalTriangles,totalPieces,cameraIntrusions:Object.fromEntries(Object.entries(cameras).map(([id,c])=>[id,(c as {unexpectedVisibleParts:string[]}).unexpectedVisibleParts])),folder}));
