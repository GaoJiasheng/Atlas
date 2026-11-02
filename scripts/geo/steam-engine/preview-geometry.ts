/** CPU inspection export of the actual engine meshes. No browser, GPU or runtime changes.
 * pnpm tsx scripts/geo/steam-engine/preview-geometry.ts [parts.json] [output-dir]
 * Then python3 scripts/geo/steam-engine/render-preview.py <output-dir>/*.json
 * This verifies forms only; pnpm shoot remains the runtime visual gate. */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { Euler, Matrix3, Matrix4, PerspectiveCamera, Vector3 } from 'three';
import { partsFile } from '../../../src/engines/space-scene/schema';
import { partPieces } from '../../../src/engines/space-scene/stages/model3d/geometry';
import { partMaterialSlots } from '../../../src/engines/space-scene/lib/parts';
import { resolveMaterialLook } from '../../../src/engines/space-scene/lib/color';
import { ROLE_ENDPOINTS, solveMechanism } from '../../../src/engines/space-scene/lib/mechanism';
const file = process.argv[2] ?? 'src/content/topics/steam-engine/data/parts.json';
const out = process.argv[3] ?? 'shots/steam-engine/cpu-preview';
mkdirSync(out, {recursive:true});
const data = partsFile.parse(JSON.parse(readFileSync(file, 'utf8')));
const spec = data.mechanisms[0]!, rest = solveMechanism(0, spec.geometry);
const width=1440, height=1080;
const cameras: Record<string, {position:number[];target:number[];fov:number;phase?:number;group?:string;parts?:string[];pose?:string}> = {
  hero:{position:[11,9,15],target:[-.5,2.8,0],fov:30},
  beam:{position:[0,7.3,10.5],target:[0,5.1,0],fov:30},
  gears:{position:[3.2,3.0,3.8],target:[2.8,2.85,.03],fov:30,parts:['sun','planet','shaft','drive-rod','centre-link']},
  'gears-90':{position:[3.2,3.0,3.8],target:[2.8,2.85,.03],fov:30,phase:90,parts:['sun','planet','shaft','drive-rod','centre-link']},
  newcomen:{position:[-7,5,7],target:[-11,2,0],fov:30,group:'teaching',pose:'nc-fill'},
  'newcomen-power':{position:[-7,5,7],target:[-11,2,0],fov:30,group:'teaching',pose:'nc-power'},
};
const vec = (v: readonly number[]) => new Vector3(v[0],v[1],v[2]);
const bytes = (a: Float32Array | Uint32Array) => Buffer.from(a.buffer,a.byteOffset,a.byteLength).toString('base64');
for(const [name, shot] of Object.entries(cameras)) {
  const camera=new PerspectiveCamera(shot.fov,width/height,.01,1000);
  camera.position.copy(vec(shot.position));camera.lookAt(vec(shot.target));camera.updateMatrixWorld();
  const projection=new Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);
  const frame=solveMechanism((shot.phase??0)*Math.PI/180,spec.geometry);
  const meshes=[];
  let triangles=0;
  for(const part of data.parts) {
    if(shot.parts ? !shot.parts.includes(part.id) : shot.group ? part.group!==shot.group || part.id.startsWith('energy-') : part.group==='teaching')continue;
    const main=part.primitive!;
    const transform=new Matrix4();
    for(const [role,binding] of Object.entries(spec.parts))if(binding.part===part.id) {
      let centre:Vector3, restCentre:Vector3, angle=0;
      const pair=ROLE_ENDPOINTS[role as keyof typeof ROLE_ENDPOINTS];
      if(pair) {
        const [a,b]=pair, ra=rest.points[a],rb=rest.points[b],fa=frame.points[a],fb=frame.points[b];
        restCentre=vec([(ra[0]+rb[0])/2,(ra[1]+rb[1])/2,0]);centre=vec([(fa[0]+fb[0])/2,(fa[1]+fb[1])/2,0]);
        angle=Math.atan2(fb[1]-fa[1],fb[0]-fa[0])-Math.atan2(rb[1]-ra[1],rb[0]-ra[0]);
      }else{
        const key=role==='piston'?'S':role==='pumpPiston'?'W':role==='planet'?'P':'O';
        restCentre=vec([...rest.points[key],0]);centre=vec([...frame.points[key],0]);
        angle=role==='planet'?frame.planetAngleRad:['sun','shaft','flywheel'].includes(role)?frame.sunAngleRad:0;
      }
      centre.add(vec(spec.origin));restCentre.add(vec(spec.origin));
      transform.makeTranslation(centre.x,centre.y,0).multiply(new Matrix4().makeRotationZ(angle)).multiply(new Matrix4().makeTranslation(-restCentre.x,-restCentre.y,0));
    }
    const pose=shot.pose?data.poses?.[shot.pose]?.parts[part.id]:undefined;
    if(pose){
      const pivot=vec(pose.pivot??main.at),offset=vec(pose.offset??[0,0,0]);
      const r=pose.rotation??[0,0,0], scale=pose.scale??1;
      const s=typeof scale==='number'?[scale,scale,scale]:scale;
      transform.makeTranslation(pivot.x+offset.x,pivot.y+offset.y,pivot.z+offset.z).multiply(new Matrix4().makeRotationFromEuler(new Euler(r[0]*Math.PI/180,r[1]*Math.PI/180,r[2]*Math.PI/180))).multiply(new Matrix4().makeScale(s[0]!,s[1]!,s[2]!)).multiply(new Matrix4().makeTranslation(-pivot.x,-pivot.y,-pivot.z));
    }
    transform.multiply(new Matrix4().makeTranslation(...main.at));
    const slots=partMaterialSlots(part);
    for(const piece of partPieces(part)) {
      if(piece.lines)continue;
      const g=piece.geometry;
      for(const copy of piece.matrices??[new Matrix4()]) {
        const m=transform.clone().multiply(copy), normals=new Matrix3().getNormalMatrix(m);
        const p=g.getAttribute('position'),n=g.getAttribute('normal');
        const position=new Float32Array(p.count*3),normal=new Float32Array(p.count*3);
        for(let i=0;i<p.count;i++) {
          const world=new Vector3().fromBufferAttribute(p,i).applyMatrix4(m), screen=world.clone().applyMatrix4(projection);
          position.set([(screen.x+1)*width/2,(1-screen.y)*height/2,-world.clone().applyMatrix4(camera.matrixWorldInverse).z],i*3);
          const norm=new Vector3().fromBufferAttribute(n,i).applyMatrix3(normals).normalize();
          normal.set([norm.x,norm.y,norm.z],i*3);
        }
        const idx=g.index?new Uint32Array(g.index.array):Uint32Array.from({length:p.count},(_,i)=>i);
        const slot=slots[piece.slot??0]!, look=resolveMaterialLook(slot.color,{'--cold':'#4f7f8c','--signal':'#cc6328'},'paper',slot.tint);
        meshes.push({id:part.id,position:bytes(position),normal:bytes(normal),index:bytes(idx),color:look.color});
        triangles+=idx.length/3;
      }
      g.dispose();
    }
  }
  writeFileSync(`${out}/${name}.json`,JSON.stringify({width,height,meshes}));
  console.log(`${out}/${name}.json: ${triangles} triangles`);
}
