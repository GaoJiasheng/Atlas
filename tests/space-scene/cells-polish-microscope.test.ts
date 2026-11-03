import { readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { DoubleSide, Euler, Matrix4, PerspectiveCamera, Mesh, MeshBasicMaterial, Raycaster, Vector3 } from 'three';
import { partSchema, poseSchema, type PartsFile } from '../../src/engines/space-scene/schema';
import { partBounds, partPrimitives } from '../../src/engines/space-scene/lib/parts';
import { anchorPoint } from '../../src/engines/space-scene/stages/model3d/shapes';
import { partPieces } from '../../src/engines/space-scene/stages/model3d/geometry';
const raw=JSON.parse(readFileSync('src/content/topics/cells/data/parts.json','utf8'));
// Validate instrument geometry independently of the cell mesh asset path.
const file={...raw,parts:raw.parts.map((p:unknown)=>partSchema.parse(p)),poses:Object.fromEntries(Object.entries(raw.poses).map(([id,p])=>[id,poseSchema.parse(p)]))} as PartsFile;
const chapters=readdirSync('src/content/topics/cells/chapters').map(f=>JSON.parse(readFileSync(`src/content/topics/cells/chapters/${f}`,'utf8').split('---')[1]!));
const part=(id:string)=>file.parts.find(p=>p.id===id)!;
const material=new MeshBasicMaterial({side:DoubleSide});
function poseMatrix(id:string,power:number) {
 const pose=file.poses![power===40?'scope-high':power===10?'scope-low':'scope-scan']!.parts[id];
 if(!pose)return new Matrix4();
 const pivot=pose.pivot!,r=pose.rotation!;
 return new Matrix4().makeTranslation(...pivot).multiply(new Matrix4().makeRotationFromEuler(new Euler(...r.map(v=>v*Math.PI/180) as [number,number,number],'XYZ'))).multiply(new Matrix4().makeTranslation(-pivot[0],-pivot[1],-pivot[2]));
}
function scene(power:number,hide:string[]) {
 const meshes:Mesh[]=[];
 for(const p of file.parts.filter(p=>p.group==='microscope-bench'&&!hide.includes(p.id))){
  for(const piece of partPieces(p))for(const instance of piece.matrices??[new Matrix4()]){
   const m=new Mesh(piece.geometry,material);m.name=p.id;m.matrixAutoUpdate=false;
   m.matrix.copy(poseMatrix(p.id,power)).multiply(new Matrix4().makeTranslation(...p.primitive!.at)).multiply(instance);m.updateMatrixWorld(true);meshes.push(m);
  }
 }
 return meshes;
}
describe('cells polished microscope optics and close detail',()=>{
 it('keeps three graded barrels and their original optical axes, lengths and safe working distance',()=>{
  const top=partBounds(part('coverslip-glass'))!.max[1];
  for(const [id,height,center,tint] of [
   ['four',.024,[.18,.213,0],'token:pole-n'],['ten',.036,[.22,.207,0],'token:en-light'],['forty',.048,[.2,.201,-.034641015],'token:en-electrical'],
  ] as const){
   const p=part(`scope-objective-${id}`),barrel=p.extra!.find(p=>p.kind==='lathe'&&p.color==='stainless')!;
   expect(barrel.at).toEqual(center);expect(barrel.kind).toBe('lathe');
   if(barrel.kind==='lathe'){const y=barrel.profile.map(p=>p[1]);expect(Math.max(...y)-Math.min(...y)).toBeCloseTo(height,9);}
   expect(p.primitive?.tint).toBe(tint);expect(partBounds(p)!.min[1]-top).toBeGreaterThan(.003);
   expect(p.primitive?.kind).toBe('curvedPanel');
   const anchor=new Vector3(...anchorPoint(p)).add(new Vector3(...p.primitive!.at));
   expect(anchor.z).toBeGreaterThan(center[2]+.007);
  }
 });
 it('puts real spring clips over the slide and leaves the transmitted-light aperture open',()=>{
  const stage=part('scope-stage'),clips=partPrimitives(stage).filter(p=>p.kind==='extrude'&&p.rotation?.[1]===-90);
  expect(clips).toHaveLength(2);expect(clips.map(p=>p.at[0])).toEqual([.151,.209]);
  const meshes=scene(4,[]).filter(m=>m.name==='scope-stage');
  const ray=new Raycaster(new Vector3(.18,.18,0),new Vector3(0,-1,0),0,.025);
  expect(ray.intersectObjects(meshes)).toHaveLength(0);
  const springBounds=clips.map(p=>partBounds({...stage,primitive:p,extra:undefined})!);
  for(const b of springBounds){expect(b.max[1]).toBeGreaterThan(.175);expect(b.min[2]).toBeLessThan(-.03);expect(b.max[2]).toBeGreaterThan(.01);}
  meshes.forEach(m=>m.geometry.dispose());
 });
 it('has a volumetric curved arm and coaxial fluted focus controls',()=>{
  const arm=part('scope-arm').primitive!;expect(arm.kind).toBe('sweep');
  if(arm.kind==='sweep'){expect(arm.path.length).toBeGreaterThan(5);expect(new Set(arm.path.map(p=>p[0])).size).toBeGreaterThan(5);}
  for(const id of ['scope-coarse-focus','scope-fine-focus']){
   const knob=part(id).primitive!;expect(knob.kind).toBe('extrude');expect(knob.at.slice(1)).toEqual([.16,0]);
   if(knob.kind==='extrude'){
    const radii=knob.shape.map(([x,y])=>Math.hypot(x,y));let peaks=0;
    for(let i=0;i<radii.length;i++)if(radii[i]!>radii[(i+radii.length-1)%radii.length]!+.0001)peaks++;
    expect(peaks).toBeGreaterThanOrEqual(30);expect(peaks).toBeLessThanOrEqual(40);
   }
  }
 });
 it('labels the eyepiece and 40× objective on visible surfaces in every authored beat highlighting them',()=>{
  let tested=0;const occluded:string[]=[];
  for(const c of chapters)for(const [i,b] of c.state.beats.entries()){
   const namedEye=/eyepiece/i.test(b.caption.en),namedForty=/forty.power objective|40.?[×x]?.? objective/i.test(b.caption.en);
   const ids=['scope-eyepiece','scope-objective-forty'].filter(id=>b.part===id||b.labels.includes(id)||(id==='scope-eyepiece'&&namedEye)||(id==='scope-objective-forty'&&namedForty));if(!ids.length)continue;
   if(namedForty)expect(b.sim.set.objective).toBe(40);
   const camera=typeof b.camera==='string'?file.presets!.find(p=>p.id===b.camera)!.camera:b.camera;
   const power=b.sim.set.objective,meshes=scene(power,b.hide),origin=new Vector3(...camera.position);
   const projection=new PerspectiveCamera(camera.fov,16/9,.001,20);projection.position.copy(origin);projection.lookAt(new Vector3(...camera.target));projection.updateMatrixWorld(true);
   for(const id of ids){
    expect(b.labels,`${c.id} beat ${i+1}`).toContain(id);
    const p=part(id),anchor=new Vector3(...anchorPoint(p)).add(new Vector3(...p.primitive!.at)).applyMatrix4(poseMatrix(id,power));
    const screen=anchor.clone().project(projection);expect(Math.abs(screen.x)).toBeLessThan(1);expect(Math.abs(screen.y)).toBeLessThan(1);
    const ray=new Raycaster(origin,anchor.clone().sub(origin).normalize());const hit=ray.intersectObjects(meshes)[0];
    if(hit?.object.name!==id)occluded.push(`${c.id} beat ${i+1}: ${id} anchor occluded by ${hit?.object.name}`);tested++;
   }
   meshes.forEach(m=>m.geometry.dispose());
  }
  expect(tested).toBeGreaterThan(4);expect(occluded).toEqual([]);
 });
});
