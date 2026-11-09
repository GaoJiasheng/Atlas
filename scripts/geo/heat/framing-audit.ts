/** Offline projection audit through the SAME CameraRig fitting helpers. */
import fs from 'node:fs';
import {Box3,Matrix4,Vector3,PerspectiveCamera,BufferGeometry,BufferAttribute} from 'three';
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {MeshoptDecoder} from 'meshoptimizer';
import {dequantize} from '@gltf-transform/functions';
import {partsFile} from '../../../src/engines/space-scene/schema';
import {partPieces} from '../../../src/engines/space-scene/stages/model3d/geometry';
import {fitCameraToAspect} from '../../../src/engines/space-scene/lib/camera';
import {fitCameraToHud,freeStageRect} from '../../../src/engines/space-scene/lib/hud-framing';
import {museumHudLayouts} from '../fossils-and-skeletons/museum-framing';
import {parse as yaml} from 'yaml';
const data=partsFile.parse(JSON.parse(fs.readFileSync('src/content/topics/heat/data/parts.json','utf8'))),bounds=new Map<string,Box3>();
for(const p of data.parts){if(p.mesh)continue;for(const piece of partPieces(p)){if(piece.lines)continue;for(const m of piece.matrices??[new Matrix4()]){piece.geometry.computeBoundingBox();const b=piece.geometry.boundingBox!.clone().applyMatrix4(new Matrix4().makeTranslation(...p.primitive!.at).multiply(m));bounds.set(p.id,bounds.has(p.id)?bounds.get(p.id)!.union(b):b);}}}
await MeshoptDecoder.ready;const doc=await new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder}).read('public'+data.model);await doc.transform(dequantize());
for(const node of doc.getRoot().listNodes()){const prim=node.getMesh()?.listPrimitives()[0];if(!prim)continue;const g=new BufferGeometry();g.setAttribute('position',new BufferAttribute(Float32Array.from(prim.getAttribute('POSITION')!.getArray()!),3));g.computeBoundingBox();bounds.set(node.getName(),g.boundingBox!.clone().applyMatrix4(new Matrix4().fromArray(node.getWorldMatrix())));}
const candidates=process.env.HEAT_CAMERA_STUDY==='1'?[{id:'current',camera:data.presets![0]!.camera},...[.8,1.4,2.0].map(x=>({id:`x${x}`,camera:{position:[x,1.48,1.4] as [number,number,number],target:[.02,.88,-.01] as [number,number,number],fov:30}}))]:data.presets!;
const report:Record<string,unknown>={};
const cases=candidates.map(p=>({id:p.id,camera:p.camera,ids:data.parts.filter(q=>q.context||p.id==='view-hero'||p.id==='current'||p.id.startsWith('x')||q.group===(p.id==='view-probe'||p.id==='view-spoons'?'transfer':p.id==='view-expansion'?'expansion':'curves')).map(q=>q.id)}));
if(process.env.HEAT_CAMERA_STUDY!=='1')for(const file of fs.readdirSync('src/content/topics/heat/chapters').filter(f=>f.endsWith('.mdx'))){const state=yaml(fs.readFileSync('src/content/topics/heat/chapters/'+file,'utf8').split('---')[1]!).state;for(const [i,beat]of state.beats.entries()){const s={...state,...beat};const camera=typeof s.camera==='string'?data.presets!.find(p=>p.id===s.camera)!.camera:s.camera;cases.push({id:`beat-${file.slice(0,2)}-${i+1}`,camera,ids:data.parts.filter(p=>(p.context||s.layers.includes(p.group))&&!s.hide?.includes(p.id)).map(p=>p.id)});}}
for(const c of cases)for(const layout of museumHudLayouts){
 const {width:W,height:H,panels}=layout,boxes=data.views.hudFrame!.parts.filter(id=>c.ids.includes(id)).map(id=>{const b=bounds.get(id)!;return {center:b.getCenter(new Vector3()).toArray() as [number,number,number],half:b.getSize(new Vector3()).multiplyScalar(.5).toArray() as [number,number,number],minRadiusPx:id==='bath-beaker'?Number(process.env.HEAT_MIN_RADIUS??28):undefined};});
 const cam=fitCameraToHud(fitCameraToAspect(c.camera,W/H),boxes,W,H,freeStageRect(W,H,panels),{panels});const camera=new PerspectiveCamera(cam.fov,W/H,.001,100);camera.position.fromArray(cam.position);camera.lookAt(new Vector3().fromArray(cam.target));camera.updateMatrixWorld();const matrix=new Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);
 const projected=Object.fromEntries(data.views.hudFrame!.parts.filter(id=>c.ids.includes(id)).map(id=>{const b=bounds.get(id)!,points=Array.from({length:8},(_,k)=>new Vector3(...b.min.toArray().map((v,i)=>k&(1<<i)?b.max.toArray()[i]!:v) as [number,number,number]).applyMatrix4(matrix));return [id,{x0:Math.min(...points.map(p=>(p.x+1)*W/2)),x1:Math.max(...points.map(p=>(p.x+1)*W/2)),y0:Math.min(...points.map(p=>(1-p.y)*H/2)),y1:Math.max(...points.map(p=>(1-p.y)*H/2))}];}));
 // Curve presets and every beat using them must include BOTH complete setups.
 const comparisonCamera=data.presets!.filter(p=>['view-heater','view-cooler'].includes(p.id)).some(p=>JSON.stringify(p.camera)===JSON.stringify(c.camera));
 if(comparisonCamera)for(const id of ['heater','heater-beaker','heater-probe-support','heater-probe','cooling-beaker','cooler-probe-support','cool-probe','room-reference']){
  const p=projected[id];if(!p)continue;
  if(p.x0<0||p.x1>W||p.y0<0||p.y1>H)throw new Error(`${c.id}/${W}: ${id} cut at stage edge`);
  if(p.x0<freeStageRect(W,H,panels).x0-1)throw new Error(`${c.id}/${W}: ${id} under left HUD`);
 }
 report[`${c.id}-${W}`]={camera:cam,projected};
 if(process.env.HEAT_CAMERA_STUDY==='1'&&W===1520){const all=Object.values(projected);console.log(c.id,JSON.stringify({cam,box:{x0:Math.min(...all.map(b=>b.x0)),x1:Math.max(...all.map(b=>b.x1)),y0:Math.min(...all.map(b=>b.y0)),y1:Math.max(...all.map(b=>b.y1))}}));}
}
fs.writeFileSync('scripts/geo/heat/comparisons/framing-audit.json',JSON.stringify(report,null,2));

console.log(`Audited ${cases.length} cameras/chapter beats × ${museumHudLayouts.length} stage layouts; both comparison setups fit.`);
