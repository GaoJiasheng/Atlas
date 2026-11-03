import { readFileSync, readdirSync } from 'node:fs';
import { beforeAll, describe, expect, it } from 'vitest';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dequantize } from '@gltf-transform/functions';
import { MeshoptDecoder } from 'meshoptimizer';
import { BufferGeometry, Float32BufferAttribute, Matrix4, Mesh, MeshBasicMaterial, DoubleSide, Raycaster, Vector3 } from 'three';
import { anchorPoint } from '../../src/engines/space-scene/stages/model3d/shapes';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { partsFile } from '../../src/engines/space-scene/schema';
import { partBounds, partMaterialSlots, partPrimitives } from '../../src/engines/space-scene/lib/parts';
import { apply3, eulerDeg } from '../../src/engines/space-scene/lib/xform';
import { partPieces } from '../../src/engines/space-scene/stages/model3d/geometry';
const file=partsFile.parse(JSON.parse(readFileSync('src/content/topics/cells/data/parts.json','utf8')));
const part=(id:string)=>file.parts.find(p=>p.id===id)!;
const meshes=new Map<string,Mesh>();
beforeAll(async()=>{
 await MeshoptDecoder.ready;
 const doc=await new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder}).read(`public${file.model}`);
 await doc.transform(dequantize());
 for(const node of doc.getRoot().listNodes()){
  const prim=node.getMesh()?.listPrimitives()[0];if(!prim)continue;
  const g=new BufferGeometry();g.setAttribute('position',new Float32BufferAttribute(prim.getAttribute('POSITION')!.getArray()!,3));
  const n=prim.getAttribute('NORMAL');if(n)g.setAttribute('normal',new Float32BufferAttribute(n.getArray()!,3));
  const idx=prim.getIndices();if(idx)g.setIndex(Array.from(idx.getArray()!));
  g.applyMatrix4(new Matrix4().fromArray(node.getWorldMatrix()));
  const m=new Mesh(g,new MeshBasicMaterial({side:DoubleSide}));m.updateMatrixWorld();meshes.set(node.getName(),m);
 }
 for(const p of file.parts.filter(p=>p.primitive)){
  const gs=partPieces(p).flatMap(piece=>(piece.matrices??[new Matrix4()]).map(m=>{
   const g=piece.geometry.index?piece.geometry.toNonIndexed():piece.geometry.clone();
   g.deleteAttribute('uv');g.clearGroups();return g.applyMatrix4(m).translate(...p.primitive!.at);
  }));
  const mesh=new Mesh(mergeGeometries(gs,false),new MeshBasicMaterial({side:DoubleSide}));mesh.updateMatrixWorld();meshes.set(p.id,mesh);
 }
});
const bounds=(id:string)=>{const p=part(id);if(!p.mesh)return partBounds(p)!;const g=meshes.get(p.mesh)!.geometry;g.computeBoundingBox();return {min:g.boundingBox!.min.toArray(),max:g.boundingBox!.max.toArray()};};
const hits=(id:string,x:number,y:number)=>new Raycaster(new Vector3(x,y,.1),new Vector3(0,0,-1)).intersectObject(meshes.get(part(id).mesh??id)!).map(h=>h.point.z);

describe('cells polished anatomy and microscope mechanics',()=>{
 it('retains all 29 selectable parts, teaching groups, six presets and three indexed poses',()=>{
  expect(file.parts).toHaveLength(29);expect(file.parts.some(p=>p.context)).toBe(false);
  expect(file.groups).toHaveLength(4);
  for(const [id,n]of [['animal-cell',3],['plant-cell',6],['microscope-bench',15],['tissue-context',5]]as const)expect(file.parts.filter(p=>p.group===id)).toHaveLength(n);
  expect(file.presets?.map(p=>p.id)).toEqual(['pair-hero','animal-close','animal-oblique','plant-close','scope-whole','scope-stage-close']);
  expect(file.flows).toHaveLength(0);expect(file.animations).toHaveLength(0);
  for(const p of file.parts){expect(p.summary?.en.length).toBeLessThanOrEqual(60);expect(p.detail?.en).toMatch(/\[S\d/);expect(p.detail?.zh).toMatch(/\[S\d/);}
 });
 it('uses smooth hollow cell boundaries, opaque cytoplasm and a visibly irregular animal outline',()=>{
  for(const id of ['animal-membrane','plant-cell-wall','plant-membrane']){expect(part(id).shell).toBe(true);expect(part(id).mesh).toBeTruthy();}
  for(const [id,size]of [['animal-membrane',[.12,.09,.016]],['plant-cell-wall',[.16,.08,.05]]]as const){const b=bounds(id);size.forEach((v,k)=>expect(b.max[k]!-b.min[k]!).toBeCloseTo(v,3));}
  expect(hits('animal-membrane',.1,.1)).toHaveLength(0);expect(hits('plant-cell-wall',-.1,.12)).toHaveLength(0);
  expect(part('animal-cytoplasm').primitive?.color).toBe('tissue');
  // A circle / ellipse is centrally symmetric; the authored epithelial boundary is not.
  const pos=meshes.get('animal-membrane')!.geometry.getAttribute('position');
  const top:number[]=[],bottom:number[]=[];
  for(let i=0;i<pos.count;i++){if(pos.getY(i)>.141)top.push(pos.getX(i));if(pos.getY(i)<.059)bottom.push(pos.getX(i));}
  expect(Math.abs((Math.min(...top)+Math.max(...top))-(Math.min(...bottom)+Math.max(...bottom)))).toBeGreaterThan(.005);
 });
 it('leaves actual basal openings around each nucleus and the central vacuole',()=>{
  expect(hits('animal-cytoplasm',.115,.1).every(z=>z<-.0062)).toBe(true);
  expect(hits('plant-cytoplasm',-.1645,.12).every(z=>z<.006)).toBe(true);
  for(const x of [-.14,-.12,-.1,-.08,-.06])expect(hits('plant-cytoplasm',x,.12)).toHaveLength(0);
  expect(hits('plant-vacuole',-.1,.12).length).toBeGreaterThan(0);
  expect(hits('plant-vacuole',-.1645,.12)).toHaveLength(0);
  expect(file.parts.filter(p=>p.id.endsWith('-nucleus'))).toHaveLength(2);
  for(const id of ['animal-nucleus','plant-nucleus'])expect(part(id).extra?.length).toBeGreaterThan(1);
 });
 it('anchors cytoplasm in actual gel away from either nucleus and gives mitochondria separate relief colours',()=>{
  for(const [id,nucleus]of [['animal-cytoplasm','animal-nucleus'],['plant-cytoplasm','plant-nucleus']]){
   const p=part(id!),n=part(nucleus!),a=new Vector3(...p.primitive!.at).add(new Vector3(...anchorPoint(p)));
   expect(hits(id!,a.x,a.y).length).toBeGreaterThan(0);
   expect(a.distanceTo(new Vector3(...n.primitive!.at))).toBeGreaterThan(id==='animal-cytoplasm'?.02:.03);
   const slots=partMaterialSlots(p).map(s=>s.tint);
   expect(slots).toContain('token:bone');expect(slots).toContain('token:hot');expect(slots).toContain('token:en-heat');
  }
 });
 it('keeps the labelled context objects unobstructed in systems and comparison beat five',()=>{
  const context=new Set(['onion-patch','tissue-patch','leaf-context','body-context','intestine-context']);
  for(const name of readdirSync('src/content/topics/cells/chapters').filter(n=>/^(04|07)/.test(n))){
   const chapter=JSON.parse(readFileSync(`src/content/topics/cells/chapters/${name}`,'utf8').split('---')[1]!);
   for(const [i,b]of chapter.state.beats.entries()){
    if(name.startsWith('04')&&i!==4)continue;
    const cam=typeof b.camera==='string'?file.presets!.find(p=>p.id===b.camera)!.camera:b.camera;
    const hidden=new Set(b.hide??chapter.state.hide),layers=b.layers??chapter.state.layers;
    for(const id of b.labels.filter((id:string)=>context.has(id))){
     const p=part(id),at=new Vector3(...p.primitive!.at).add(new Vector3(...anchorPoint(p))),origin=new Vector3(...cam.position);
     const ray=new Raycaster(origin,at.clone().sub(origin).normalize(),0,origin.distanceTo(at)-.002);
     for(const other of file.parts){
      if(other.id===id||hidden.has(other.id)||hidden.has(other.group)||!layers.includes(other.group))continue;
      expect(ray.intersectObject(meshes.get(other.mesh??other.id)!).length,`${chapter.id}.${i+1}: ${other.id} covers ${id}`).toBe(0);
     }
    }
   }
  }
 });
 it('keeps exactly six peripheral chloroplast bodies with membrane-stack detail',()=>{
  const ps=partPrimitives(part('plant-chloroplasts')),shells=ps.filter(p=>p.tint==='token:seedling');expect(shells).toHaveLength(6);
  expect(ps.filter(p=>p.tint==='token:food')).toHaveLength(24);
  for(const p of shells){expect(p.at[0]).toBeGreaterThan(-.173);expect(p.at[0]).toBeLessThan(-.027);expect(Math.abs(p.at[1]-.12)).toBeGreaterThan(.025);}
 });
 it('keeps one active objective coaxial and positive coverslip clearance in all three poses',()=>{
  const ids=['scope-objective-four','scope-objective-ten','scope-objective-forty'];const coverTop=partBounds(part('coverslip-glass'))!.max[1];
  for(const [poseId,active]of [['scope-scan',ids[0]],['scope-low',ids[1]],['scope-high',ids[2]]]as const){
   const onAxis:string[]=[];
   for(const id of ids){const entry=file.poses![poseId]!.parts[id]!,pivot=entry.pivot!,b=bounds(id),centre=b.min.map((v,k)=>(v+b.max[k]!)/2);
    const turned=apply3(eulerDeg(entry.rotation),centre.map((v,k)=>v-pivot[k]!)),at=turned.map((v,k)=>v+pivot[k]!);
    if(Math.hypot(at[0]!-.18,at[2]!)<.0001)onAxis.push(id);expect(b.min[1]!-coverTop).toBeGreaterThan(.003);
   }expect(onAxis).toEqual([active]);
  }
  for(const id of ['scope-condenser','scope-illuminator']){expect(part(id).primitive!.at[0]).toBe(.18);expect(part(id).primitive!.at[2]).toBe(0);}
  for(const id of ['slide-glass','coverslip-glass']){const b=bounds(id);expect((b.min[0]!+b.max[0]!)/2).toBeCloseTo(.18,3);expect((b.min[2]!+b.max[2]!)/2).toBeCloseTo(0,3);}
  expect(partBounds(part('slide-glass'))!.min[1]).toBeCloseTo(.172,10);
 });
 it('preserves physical slide motion and a fixed stage',()=>{
  const sim=file.sim!;const objective=sim.bind!.find(b=>'control'in b&&b.control==='objective');
  expect(objective&&'pose'in objective&&objective.pose).toEqual({'4':'scope-scan','10':'scope-low','40':'scope-high'});
  for(const id of ['slide-x','slide-y']){const b=sim.bind!.find(b=>'control'in b&&b.control===id)!;expect('part'in b&&b.part).toEqual(['slide-glass','coverslip-glass']);expect('offset'in b&&b.offset?.per).toBe(1e-6);}
  expect(sim.bind!.some(b=>'part'in b&&(Array.isArray(b.part)?b.part:[b.part]).includes('scope-stage'))).toBe(false);
 });
 it('separates all cell selections at full exploded peel',()=>{
  for(const group of ['animal-cell','plant-cell']){
   const boxes=file.parts.filter(p=>p.group===group).map(p=>{const b=bounds(p.id),e=p.explode,l=Math.hypot(...e.dir),offset=e.dir.map(v=>v/l*e.dist);return {id:p.id,min:b.min.map((v,k)=>v+offset[k]!),max:b.max.map((v,k)=>v+offset[k]!)};});
   for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){const a=boxes[i]!,b=boxes[j]!;expect(a.min.every((v,k)=>Math.min(a.max[k]!,b.max[k]!)-Math.max(v,b.min[k]!)>1e-7),`${a.id} / ${b.id}`).toBe(false);}
  }
 });
 it('builds finite actual GLB and primitive geometry within 350k total triangles',()=>{
  let triangles=0,slots=0;
  for(const p of file.parts){slots+=p.mesh?1:partMaterialSlots(p).length;
   const pieces=p.mesh?[{geometry:meshes.get(p.mesh)!.geometry,matrices:null}]:partPieces(p);
   for(const piece of pieces){const a=piece.geometry.getAttribute('position');expect(Array.from(a.array).every(Number.isFinite)).toBe(true);triangles+=(piece.geometry.index?.count??a.count)/3*(piece.matrices?.length??1);if(!p.mesh)piece.geometry.dispose();}
  }
  expect(triangles).toBeLessThan(350_000);expect(slots).toBeLessThan(100);
 });
});
