/** CPU depth-buffer input from the runtime builder. No browser or GPU. */
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {BufferGeometry,BufferAttribute,Matrix3,Matrix4,PerspectiveCamera,Vector3} from 'three';
import {partsFile} from '../../../src/engines/space-scene/schema';
import {partPieces} from '../../../src/engines/space-scene/stages/model3d/geometry';
import {partMaterialSlots} from '../../../src/engines/space-scene/lib/parts';
const file=process.argv[2]??'src/content/topics/bones-and-joints/data/parts.json';
const out=process.argv[3]??'scripts/geo/bones-and-joints/previews/polish-2026-11-03';mkdirSync(out,{recursive:true});
const data=partsFile.parse(JSON.parse(readFileSync(file,'utf8')));
// Decode the appended (uncompressed) cortex accessors from the shipped GLB.
// The other anatomical nodes retain their source meshopt payload unchanged.
function authoredMesh(name:string){
 const bytes=readFileSync('public/models/bones-and-joints-polished.glb');const jl=bytes.readUInt32LE(12);
 const gltf=JSON.parse(bytes.subarray(20,20+jl).toString('utf8')),bin=bytes.subarray(28+jl);
 const node=gltf.nodes.find((n:{name:string})=>n.name===name),prim=gltf.meshes[node.mesh].primitives[0];
 const array=(id:number)=>{const a=gltf.accessors[id],v=gltf.bufferViews[a.bufferView];
  const offset=(v.byteOffset??0)+(a.byteOffset??0),buffer=Uint8Array.from(bin.subarray(offset,offset+v.byteLength)).buffer;
  const types:Record<number,Int8ArrayConstructor|Int16ArrayConstructor|Uint16ArrayConstructor|Uint32ArrayConstructor|Float32ArrayConstructor>={5120:Int8Array,5122:Int16Array,5123:Uint16Array,5125:Uint32Array,5126:Float32Array};
  return new (types[a.componentType]!)(buffer);};
 const position=Float32Array.from(array(prim.attributes.POSITION),(v,i)=>v*(node.scale?.[i%3]??1));
 const normal=Float32Array.from(array(prim.attributes.NORMAL),v=>v/127);
 return {at:node.translation as [number,number,number],geometry:new BufferGeometry().setAttribute('position',new BufferAttribute(position,3))
 .setAttribute('normal',new BufferAttribute(normal,3)).setIndex(new BufferAttribute(new Uint32Array(array(prim.indices)),1))};
}
const colors:Record<string,string>={bone:'#d1c3a3',cold:'#4f7f8c',neutral:'#8a8378',xray:'#3a9aa0','muscle-3':'#8f4740',cut:'#b8973c','blood-rich':'#c8222d','ink-2':'#555047'};
const bone=['bone-cortex','bone-lattice','bone-marrow','bone-vessel'];
const repair=['repair-stage-clot','repair-stage-soft','repair-stage-hard','repair-stage-remodelled'];
const repairSkins=['repair-clot-skin','repair-soft-skin'];
const views=[
 {id:'bone-front',ids:bone,pos:[2,0,1.23],target:[2,0,0],fov:30},
 {id:'bone-oblique',ids:bone,pos:[2.24,.10,1.25],target:[2,0,0],fov:30},
 {id:'bone-rear',ids:bone,pos:[2.42,.12,-1.23],target:[2,0,0],fov:30},
 {id:'bone-head-close',ids:bone,pos:[1.96,.19,.42],target:[1.983,.18,0],fov:30},
 {id:'bone-marrow-close',ids:bone,pos:[2.06,0,.48],target:[2,0,0],fov:30},
 {id:'growth-beat',ids:[...bone,'growth-plate'],pos:[2.28,.09,1.44],target:[2,-.025,0],fov:30},
 {id:'growth-close',ids:[...bone,'growth-plate'],pos:[2.02,.235,.28],target:[1.96,.205,0],fov:30},
 {id:'growth-side',ids:[...bone,'growth-plate'],pos:[2.20,.27,-.25],target:[1.96,.205,0],fov:30},
 {id:'growth-disc',ids:['growth-plate'],pos:[1.91,.25,.075],target:[1.96,.202,-.007],fov:30},
 {id:'remodel',ids:[...bone,'remodel-patch'],pos:[2.28,.09,1.44],target:[2,-.025,0],fov:30},
 {id:'remodel-close',ids:['bone-cortex','remodel-patch'],pos:[2.022,.025,.11],target:[2.005,.025,-.008],fov:30},
 {id:'remodel-side',ids:['bone-cortex','remodel-patch'],pos:[2.15,.04,-.10],target:[2.004,.025,-.008],fov:30},
 {id:'growth',ids:[...bone,'growth-plate'],pos:[2.24,.10,1.25],target:[2,0,0],fov:30},
 {id:'repair-front',ids:[...repair,...repairSkins],pos:[2.12,0,2.55],target:[2.12,0,0],fov:30},
 {id:'repair-oblique',ids:[...repair,...repairSkins],pos:[2.52,.30,2.55],target:[2.12,0,0],fov:30},
 {id:'joint',ids:['joint-cartilage-a','joint-cartilage-b','joint-capsule','joint-ligament'],pos:[-1.7,.15,1.2],target:[-2,0,0],fov:30},
];
for(const [i,id] of repair.entries())views.push({id:`${id}-close`,ids:[id,...(i<2?[repairSkins[i]!]:[])],pos:[[1.46,1.82,2.18,2.54][i]!,0,.35],target:[[1.46,1.82,2.18,2.54][i]!,0,0],fov:30});
const bytes=(a:Float32Array|Uint32Array)=>Buffer.from(a.buffer,a.byteOffset,a.byteLength).toString('base64');
const width=1200,height=1000;
const requested=process.argv[4]?.split(',');
for(const shot of views.filter(s=>!requested||requested.includes(s.id))){
 const camera=new PerspectiveCamera(shot.fov,width/height,.001,30);camera.position.fromArray(shot.pos);camera.lookAt(new Vector3(...shot.target));camera.updateMatrixWorld();
 const projection=new Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);
 const meshes=[];let triangles=0;
 for(const id of shot.ids){const part=data.parts.find(p=>p.id===id)!;const slots=part.primitive?partMaterialSlots(part):[part.material!];
 const authored=part.mesh?.startsWith('polished-')?authoredMesh(part.mesh):null;
 for(const piece of (authored?[{geometry:authored.geometry,matrices:null,slot:0}]:partPieces(part))){
 const g=piece.geometry,p=g.getAttribute('position'),n=g.getAttribute('normal');
 for(const copy of piece.matrices??[new Matrix4()]){
  const matrix=new Matrix4().makeTranslation(...(part.primitive?.at??authored!.at)).multiply(copy);const norm=new Matrix3().getNormalMatrix(matrix);
  const position=new Float32Array(p.count*3),normal=new Float32Array(p.count*3);
  for(let i=0;i<p.count;i++){
   const world=new Vector3().fromBufferAttribute(p,i).applyMatrix4(matrix);const screen=world.clone().applyMatrix4(projection);
   position.set([(screen.x+1)*width/2,(1-screen.y)*height/2,-world.clone().applyMatrix4(camera.matrixWorldInverse).z],i*3);
   const nn=new Vector3().fromBufferAttribute(n,i).applyMatrix3(norm).normalize();normal.set([nn.x,nn.y,nn.z],i*3);
  }
  const index=g.index?new Uint32Array(g.index.array):Uint32Array.from({length:p.count},(_,i)=>i);
  const tint=slots[piece.slot??0]!.tint?.replace('token:','')??'bone';
  meshes.push({id,position:bytes(position),normal:bytes(normal),index:bytes(index),color:colors[tint]??colors.bone});triangles+=index.length/3;
 }
 g.dispose();
 }}
 writeFileSync(`${out}/${shot.id}.json`,JSON.stringify({width,height,meshes}));console.log(JSON.stringify({view:shot.id,triangles,draws:meshes.length}));
}
