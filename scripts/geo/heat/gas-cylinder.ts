/** Heat-only glass floor. Metres; the rim and piston travel stay unchanged. */
import {BufferGeometry,Float32BufferAttribute,Vector3,Color,Matrix4} from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {type Document} from '@gltf-transform/core';
import {partPieces} from '../../../src/engines/space-scene/stages/model3d/geometry';
import {partMaterialSlots} from '../../../src/engines/space-scene/lib/parts';
import {resolveMaterialLook} from '../../../src/engines/space-scene/lib/color';
import {partsFile} from '../../../src/engines/space-scene/schema';
import fs from 'node:fs';
export function gasFloor(){
 // Support top is y=.756. A rounded heel rests .3 mm above it; the
 // underside rises to a shallow dome. No glass face shares the support plane.
 const profile=[[0,.0081],[.012,.0078],[.023,.0064],[.026,.0063],[.028,.0072],[.029,.009],[.029,.136],[.029,.139],[.0285,.140],[.0272,.1403],[.026,.139],[.026,.136],[.026,.013],[.025,.011],[.020,.011],[.010,.011],[0,.011]];
 const N=128,pos:number[]=[],normals:number[]=[],uv:number[]=[],ix:number[]=[],starts:number[]=[];
 const point=(j:number,i:number)=>{const a=i/N*Math.PI*2,[r,y]=profile[j]!;return new Vector3(r!*Math.sin(a),y,r!*Math.cos(a));};
 for(let j=0;j<profile.length;j++){
  const [r,y]=profile[j]!,pole=r===0;starts.push(pos.length/3);
  for(let i=0;i<(pole?N:N+1);i++){
   pos.push(...point(j,i).toArray());
   // Sector-local poles avoid a single fan vertex stretching across the UV
   // seam. The entire inner floor has one flat normal and one clean UV row.
   uv.push(j>=14?.5:pole?(i+.5)/N:i/N,j>=14?.5:y!/.1403);
   const n=pole?new Vector3(0,j===0?-1:1,0):j>=14?new Vector3(0,1,0):point(j,i+.01).sub(point(j,i-.01)).cross(point(Math.min(profile.length-1,j+1),i).sub(point(Math.max(0,j-1),i))).normalize();
   normals.push(...n.toArray());
  }
 }
 for(let j=0;j<profile.length-1;j++)for(let i=0;i<N;i++){
  const a=starts[j]!,b=starts[j+1]!;
  if(profile[j]![0]===0)ix.push(b+i,a+i,b+i+1);
  else if(profile[j+1]![0]===0)ix.push(a+i,a+i+1,b+i);
  else ix.push(a+i,a+i+1,b+i,b+i,a+i+1,b+i+1);
 }
 return new BufferGeometry().setAttribute('position',new Float32BufferAttribute(pos,3)).setAttribute('normal',new Float32BufferAttribute(normals,3)).setAttribute('uv',new Float32BufferAttribute(uv,2)).setIndex(ix);
}
/** All fixed hardware remains in the same selectable part. Per-vertex alpha
 * preserves opaque scale marks and support while keeping both glass walls
 * transparent. Three's production loader enables vertexAlphas for RGBA. */
export function bakeGasCylinder(doc:Document,part:Record<string,any>){
 const css=fs.readFileSync('src/theme/tokens.css','utf8'),block=css.slice(css.indexOf(':root[data-theme="paper"] {'),css.indexOf(':root[data-theme="cinema"] {'));
 const tokens=Object.fromEntries([...block.matchAll(/--([a-z0-9-]+):\s*(#[0-9a-f]{6})/gi)].map(m=>[m[1]!,m[2]!]));
 const glass=gasFloor().translate(...part.primitive.at as [number,number,number]);
 const colorize=(g:BufferGeometry,color:string,alpha:number)=>{
  const c=new Color(color),count=g.getAttribute('position').count;
  g.setAttribute('color',new Float32BufferAttribute(Array.from({length:count},()=>[c.r,c.g,c.b,alpha]).flat(),4));
  if(!g.index)g.setIndex(Array.from({length:count},(_,i)=>i));
  if(!g.hasAttribute('uv'))g.setAttribute('uv',new Float32BufferAttribute(new Float32Array(count*2),2));return g;
 };
 colorize(glass,tokens.bone!,.1);
 const raw=structuredClone(part);delete raw.mesh;delete raw.group;delete raw.connects;raw.context=true;
 const data=partsFile.parse({parts:[raw]}),slots=partMaterialSlots(data.parts[0]!),pieces=[glass];
 for(const piece of partPieces(data.parts[0]!)){
  // Slot zero is the legacy cylinder envelope, replaced by the loft above.
  if((piece.slot??0)===0){piece.geometry.dispose();continue;}
  const slot=slots[piece.slot!]!,look=resolveMaterialLook(slot.color,tokens,'paper',slot.tint);
  for(const m of piece.matrices??[new Matrix4()])pieces.push(colorize(piece.geometry.clone().applyMatrix4(m).translate(...part.primitive.at as [number,number,number]),look.color,slot.color==='glass'?.1:1));
  piece.geometry.dispose();
 }
 const g=mergeGeometries(pieces)!;pieces.forEach(p=>p.dispose());
 // One blended draw has no depth writes, so closed shells rely on back-face culling for the opaque plate; shared roughness suits its satin coat.
 const buffer=doc.getRoot().listBuffers()[0]??doc.createBuffer(),primitive=doc.createPrimitive();
 for(const [name,semantic,type]of [['position','POSITION','VEC3'],['normal','NORMAL','VEC3'],['uv','TEXCOORD_0','VEC2'],['color','COLOR_0','VEC4']] as const){const a=g.getAttribute(name);primitive.setAttribute(semantic,doc.createAccessor().setType(type).setArray(Float32Array.from(a.array)).setBuffer(buffer));}
 primitive.setIndices(doc.createAccessor().setType('SCALAR').setArray(Uint32Array.from(g.index!.array)).setBuffer(buffer));
 primitive.setMaterial(doc.createMaterial('heat-gas-glass-and-fixed-hardware').setAlphaMode('BLEND').setDoubleSided(false).setMetallicFactor(0).setRoughnessFactor(.45).setExtras({atlasSurface:true}));
 const node=doc.createNode('gas-cylinder').setMesh(doc.createMesh('gas-cylinder').addPrimitive(primitive)).setExtras({closed:false,labelPoint:[.65,.82,-.211]});
 doc.getRoot().listScenes()[0]!.addChild(node);// Vertex alpha already carries the glass; a `glass` slot 0 would multiply its 0.22 opacity over the whole merged mesh.
 part.mesh='gas-cylinder';part.material={color:'#ffffff'};part.primitive.color='#ffffff';
 const triangles=g.index!.count/3;g.dispose();return triangles;
}
