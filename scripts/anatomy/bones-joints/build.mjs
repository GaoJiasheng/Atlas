/** Offline source-backed geometry packet. Original glue: CC BY-SA 4.0. */
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {dirname,resolve} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {NodeIO} from '@gltf-transform/core';
import {prune,weld,quantize,reorder} from '@gltf-transform/functions';
import {MeshoptEncoder,MeshoptDecoder,MeshoptSimplifier} from 'meshoptimizer';
import {FBXLoader} from 'three/examples/jsm/loaders/FBXLoader.js';
import {Vector3,Matrix4,Matrix3} from 'three';
import {selections} from './selection.mjs';
import {controlPoints} from './fbx-vertices.mjs';

const here=dirname(fileURLToPath(import.meta.url)),root=resolve(here,'../../..');
const ix=process.argv.indexOf('--source-cache');
const cache=ix>=0?resolve(process.argv[ix+1]):resolve(here,'../cache');
const work=resolve(here,'../cache/bones-joints');await fs.mkdir(work,{recursive:true});
const inventory=JSON.parse(await fs.readFile(resolve(cache,'inventory.json'),'utf8')).objects;
const selected=selections(inventory),rig=JSON.parse(await fs.readFile(resolve(here,'../arms/rig.json'),'utf8'));
const sourceCentre=[0,rig.sourceCentre[2],-rig.sourceCentre[1]];
const require=createRequire(import.meta.url);
const {ALL_EXTENSIONS,EXTMeshoptCompression}=await import(pathToFileURL(require.resolve('@gltf-transform/extensions',{paths:[dirname(require.resolve('@gltf-transform/functions'))]})));
await Promise.all([MeshoptEncoder.ready,MeshoptDecoder.ready,MeshoptSimplifier.ready]);
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.encoder':MeshoptEncoder,'meshopt.decoder':MeshoptDecoder});
const document=await io.read(resolve(root,'public/models/muscles-arms.glb'));
const scene=document.getRoot().getDefaultScene();
const originalNodes=document.getRoot().listNodes(),find=name=>originalNodes.find(n=>n.getName()===name);
const buffer=document.createBuffer('bones-and-joints');
const sourceSkin=find('skin-outline').getSkin(),skin=document.createSkin('bones-and-joints-rig');
for(const joint of sourceSkin.listJoints())skin.addJoint(joint);
const inverse=new Float32Array(skin.listJoints().flatMap(j=>new Matrix4().fromArray(j.getWorldMatrix()).invert().toArray()));
skin.setInverseBindMatrices(document.createAccessor('body-inverse-bind').setType('MAT4').setArray(inverse).setBuffer(buffer));
function inheritedPrimitive(node,primitive){
  const previous=node.getSkin(),binds=previous.getInverseBindMatrices(),oldJoints=previous.listJoints();
  const worlds=oldJoints.map(j=>new Matrix4().fromArray(j.getWorldMatrix()));
  const matrices=worlds.map((w,i)=>{const b=[];binds.getElement(i,b);return w.clone().multiply(new Matrix4().fromArray(b));});
  const normalMatrices=matrices.map(m=>new Matrix3().getNormalMatrix(m));
  const position=primitive.getAttribute('POSITION'),normal=primitive.getAttribute('NORMAL'),weights=primitive.getAttribute('WEIGHTS_0'),joints=primitive.getAttribute('JOINTS_0');
  const positions=new Float32Array(position.getCount()*3),normals=new Float32Array(position.getCount()*3),jointValues=new Uint16Array(position.getCount()*4);
  for(let i=0;i<position.getCount();i++){
    const p=[],n=[],w=[],j=[];position.getElement(i,p);normal?.getElement(i,n);weights.getElement(i,w);joints.getElement(i,j);const out=new Vector3(),outNormal=new Vector3();
    for(let k=0;k<4;k++){
      jointValues[i*4+k]=skin.listJoints().indexOf(oldJoints[j[k]]);
      if(!w[k])continue;
      out.add(new Vector3().fromArray(p).applyMatrix4(matrices[j[k]]).multiplyScalar(w[k]));
      if(normal)outNormal.add(new Vector3().fromArray(n).applyMatrix3(normalMatrices[j[k]]).multiplyScalar(w[k]));
    }
    positions.set(out.toArray(),i*3);if(normal)normals.set(outNormal.normalize().toArray(),i*3);
  }
  const result=primitive.clone();
  result.setAttribute('POSITION',document.createAccessor('inherited-position').setType('VEC3').setArray(positions).setBuffer(buffer));
  if(normal)result.setAttribute('NORMAL',document.createAccessor('inherited-normal').setType('VEC3').setArray(normals).setBuffer(buffer));
  result.setAttribute('JOINTS_0',document.createAccessor('inherited-joints').setType('VEC4').setArray(jointValues).setBuffer(buffer));
  return result;
}
const muscles=[['biceps-l',['biceps-brachii-long.l','biceps-brachii-short.l']],['triceps-l',['triceps-brachii-long.l','triceps-brachii-lateral.l','triceps-brachii-medial.l']]];
for(const[id,sources]of [...muscles,['body-context',['skin-outline','skin-hand.l','skin-hand.r']]]){
  const mesh=document.createMesh(id),nodes=sources.map(find);
  for(const node of nodes)for(const primitive of node.getMesh().listPrimitives())mesh.addPrimitive(inheritedPrimitive(node,primitive));
  const node=document.createNode(id==='body-context'?'skin-outline':id).setMesh(mesh).setSkin(skin).setExtras({closed:false,role:id==='body-context'?'skin':'region',sourceNodes:sources});
  mesh.setExtras({closed:false,role:id==='body-context'?'skin':'region'});scene.addChild(node);
}
for(const node of originalNodes)if(node.getMesh())node.dispose();
const file=await fs.readFile(resolve(cache,'SkeletalSystem100.fbx'));
const sourceControls=controlPoints(file);
const source=new FBXLoader().parse(file.buffer.slice(file.byteOffset,file.byteOffset+file.byteLength),'');source.updateMatrixWorld(true);
const objects=new Map();source.traverse(ob=>{if(ob.isMesh)objects.set(ob.userData.originalName,ob);});
const stats=[],audit=[];
function bounds(pos){const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];for(let i=0;i<pos.length;i++) {min[i%3]=Math.min(min[i%3],pos[i]);max[i%3]=Math.max(max[i%3],pos[i]);}return{min,max};}
function extract(name,detail){
  const object=objects.get(name);if(!object)throw Error(`Missing FBX mesh ${name}`);
  const geometry=object.geometry,attribute=geometry.attributes.position,p=new Vector3(),positions=[],canonical=new Map(),remap=[];
  for(let i=0;i<attribute.count;i++){
    p.fromBufferAttribute(attribute,i).applyMatrix4(object.matrixWorld).multiplyScalar(.01);
    const key=p.toArray().map(x=>Math.round(x*1e7)).join(',');let index=canonical.get(key);
    if(index===undefined){index=positions.length/3;canonical.set(key,index);positions.push(...p.toArray());}remap.push(index);
  }
  let indices=Uint32Array.from(geometry.index?.array??Array.from({length:attribute.count},(_,i)=>i),i=>remap[i]);
  if(object.matrixWorld.determinant()<0)for(let i=0;i<indices.length;i+=3)[indices[i+1],indices[i+2]]=[indices[i+2],indices[i+1]];
  const entry=inventory.find(e=>e.system==='skeleton'&&e.name===name&&e.type==='MESH');
  const raw=sourceControls.get(name),allPositions=[];
  if(!raw)throw Error(`Missing source control points ${name}`);
  for(let i=0;i<raw.length;i+=3)allPositions.push(...p.fromArray(raw,i).applyMatrix4(object.matrixWorld).multiplyScalar(.01).toArray());
  const box=bounds(allPositions),renderBox=bounds(positions),expected={min:[entry.boundingBox.min[0],entry.boundingBox.min[2],-entry.boundingBox.max[1]],max:[entry.boundingBox.max[0],entry.boundingBox.max[2],-entry.boundingBox.min[1]]};
  const bboxError=Math.max(...box.min.map((v,i)=>Math.abs(v-expected.min[i])),...box.max.map((v,i)=>Math.abs(v-expected.max[i])));
  if(bboxError>1e-6)throw Error(`FBX/native inventory frame mismatch ${name}: ${bboxError}`);
  const original=Array.from(indices),retain=/^Parietal bone|^Costal cartilage of fourth rib/.test(name),target=detail||retain?indices.length/3:/rib|cartilage/i.test(name)?900:/Scapula/.test(name)?5000:/bone|Mandible|Sacrum/.test(name)?3500:2000;
  let error=0;if(indices.length/3>target)[indices,error]=MeshoptSimplifier.simplify(indices,new Float32Array(positions),3,target*3,.00045,['LockBorder','ErrorAbsolute']);
  stats.push({source:name,sourceTriangles:original.length/3,triangles:indices.length/3,bboxErrorM:bboxError,unreferencedControlPoints:raw.length/3-positions.length/3,renderBounds:renderBox,simplifierErrorM:error});
  audit.push({name,positions,sourceIndices:original,indices:Array.from(indices)});
  return{positions,indices};
}
const extracted=new Map();
for(const part of selected){
  const positions=[],indices=[];
  for(const name of part.sources){
    const key=name+(part.station[0]?'detail':'overview');let geometry=extracted.get(key);
    if(!geometry){geometry=extract(name,!!part.station[0]);extracted.set(key,geometry);}
    const offset=positions.length/3;
    for(let i=0;i<geometry.positions.length;i++)positions.push(geometry.positions[i]-sourceCentre[i%3]+part.station[i%3]);
    for(const index of geometry.indices)indices.push(index+offset);
  }
  // Discard unreferenced source vertices so byte budgets reflect visible geometry.
  const used=[...new Set(indices)].sort((a,b)=>a-b),lookup=new Map(used.map((i,k)=>[i,k]));
  const compact=used.flatMap(i=>positions.slice(i*3,i*3+3)),faces=indices.map(i=>lookup.get(i)),normals=new Float32Array(compact.length);
  for(let i=0;i<faces.length;i+=3){const a=new Vector3().fromArray(compact,faces[i]*3),b=new Vector3().fromArray(compact,faces[i+1]*3),c=new Vector3().fromArray(compact,faces[i+2]*3),n=b.sub(a).cross(c.sub(a));for(const v of faces.slice(i,i+3)){normals[v*3]+=n.x;normals[v*3+1]+=n.y;normals[v*3+2]+=n.z;}}
  for(let i=0;i<normals.length;i+=3){const n=new Vector3().fromArray(normals,i).normalize();normals.set(n.toArray(),i);}
  const accessor=(name,type,array)=>document.createAccessor(name).setBuffer(buffer).setType(type).setArray(array);
  const primitive=document.createPrimitive().setAttribute('POSITION',accessor(part.id+'-position','VEC3',new Float32Array(compact))).setAttribute('NORMAL',accessor(part.id+'-normal','VEC3',normals)).setIndices(accessor(part.id+'-index','SCALAR',new Uint32Array(faces)));
  if(part.joint){const ji=skin.listJoints().findIndex(j=>j.getName()===`joint.${part.joint}`);if(ji<0)throw Error(`Unknown rigid joint ${part.joint}`);const joints=new Uint16Array(used.length*4),weights=new Float32Array(used.length*4);for(let i=0;i<used.length;i++){joints[i*4]=ji;weights[i*4]=1;}primitive.setAttribute('JOINTS_0',accessor(part.id+'-joints','VEC4',joints)).setAttribute('WEIGHTS_0',accessor(part.id+'-weights','VEC4',weights));}
  const mesh=document.createMesh(part.id).addPrimitive(primitive).setExtras({closed:false,role:'bone'});
  const node=document.createNode(part.id).setMesh(mesh).setExtras({closed:false,role:'bone',sourceNodes:part.sources,rigidJoint:part.joint,station:part.station});if(part.joint)node.setSkin(skin);scene.addChild(node);
  part.bounds=bounds(compact);
}
document.getRoot().getAsset().copyright=`BodyParts3D - The Database Center for Life Science - CC-BY-SA 2.1 Japan\nZ-Anatomy - The open source atlas of anatomy - CC-BY-SA 4.0\nhttps://github.com/LluisV/Z-Anatomy ; https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html\nAtlas: source structures selected, simplified, regrouped, inherited muscle/skin rig retained; original teaching glue CC BY-SA 4.0. BodyParts3D current licence is CC BY 4.0; historical upstream attribution retained.`;
await document.transform(weld(),reorder({encoder:MeshoptEncoder}),quantize({pattern:/^(POSITION|NORMAL|WEIGHTS_\d+)$/,quantizePosition:16,quantizeNormal:12,quantizeWeight:16}),prune({keepLeaves:true,keepAttributes:true}));
document.createExtension(EXTMeshoptCompression).setRequired(true).setEncoderOptions({method:EXTMeshoptCompression.EncoderMethod.QUANTIZE});
for(const accessor of document.getRoot().listAccessors())accessor.setBuffer(buffer);
for(const other of document.getRoot().listBuffers())if(other!==buffer)other.dispose();
const output=resolve(root,'public/models/bones-and-joints.glb');await io.write(output,document);
const data=await fs.readFile(output),roundtrip=await io.read(output);let triangles=0,draws=0;
for(const node of roundtrip.getRoot().listNodes())for(const primitive of node.getMesh()?.listPrimitives()??[]){triangles+=primitive.getIndices().getCount()/3;draws++;}
if(data.length>4000000||triangles>350000)throw Error(`Budget failed: ${data.length} bytes, ${triangles} triangles`);
const result={license:'CC BY-SA 4.0',nativeBlender:{status:'REVIEW',probeExit:139,reason:'Blender 5.1.2 initialization failed before Python; no native export or native preview claimed'},pipeline:'Three FBXLoader offline extraction + inherited native arms rig + meshoptimizer + independently decoded audit',sourceFile:'SkeletalSystem100.fbx',sourceSha256:createHash('sha256').update(file).digest('hex'),modelSha256:createHash('sha256').update(data).digest('hex'),bytes:data.length,triangles,draws,sourceCentre:rig.sourceCentre,sourceStatureM:1.7095352601027116,parts:selected,sourceMeshes:stats,meshNodes:roundtrip.getRoot().listNodes().filter(n=>n.getMesh()).map(n=>n.getName()),review:'Named attachment faces, demonstration axes and native previews remain REVIEW. Source bbox checks are coordinate checks, not medical review.'};
await fs.writeFile(resolve(here,'manifest.json'),JSON.stringify(result,null,2)+'\n');
await fs.writeFile(resolve(here,'anatomy-rig.json'),JSON.stringify(rig,null,2)+'\n');
await fs.writeFile(resolve(here,'MANIFEST-READY'),createHash('sha256').update(JSON.stringify(result,null,2)+'\n').digest('hex')+'\n');
await fs.writeFile(resolve(work,'surface-jobs.json'),JSON.stringify(audit));
console.log(JSON.stringify({output,bytes:data.length,triangles,draws,sourceMeshes:stats.length,meshNodes:result.meshNodes.length}));
