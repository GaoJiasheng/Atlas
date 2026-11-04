import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
import { diplodocidStudy, sauropodFoot, sauropodTail } from '../../scripts/geo/fossils-and-skeletons/sauropod-study';
import { museumBoneGeometry } from '../../scripts/geo/fossils-and-skeletons/sculpt-museum';
import { primitiveSchema, type Primitive, type Part } from '../../src/engines/space-scene/schema';
const file=JSON.parse(readFileSync('src/content/topics/fossils-and-skeletons/data/parts.json','utf8'));
const sweeps=(ps:Primitive[])=>ps.filter((p):p is Extract<Primitive,{kind:'sweep'}>=>p.kind==='sweep');
const end=(p:Extract<Primitive,{kind:'sweep'}>)=>p.at.map((v,i)=>v+p.path.at(-1)![i]!);
const claws=(ps:Primitive[])=>sweeps(ps).filter(p=>Array.isArray(p.radius)&&p.radius.at(-1)!<.001);
describe('chapter 07 sauropod osteology',()=>{
 it.each([-1,1])('has appressed U-shaped metacarpals and only a medial thumb ungual on side %s',side=>{
  const foot=sauropodFoot([0,0,0],side,false),rays=sweeps(foot).filter(p=>p.at[1]>-.01);
  expect(rays).toHaveLength(5);expect(claws(foot)).toHaveLength(1);
  for(const ray of rays){const tip=end(ray);expect(pPrimitive(ray)).toBe(true);expect(Math.abs(tip[0]!-ray.at[0])).toBeLessThan(.01);expect(ray.at[1]-tip[1]!).toBeGreaterThan(.09);}
  expect(rays.filter(p=>p.at[0]>0)).toHaveLength(2);expect(rays.filter(p=>p.at[0]<-.02)).toHaveLength(3);
  expect(Math.max(...rays.map(p=>p.at[2]))-Math.min(...rays.map(p=>p.at[2]))).toBeGreaterThan(.08);
  expect(claws(foot)[0]!.at[2]*side).toBeLessThan(0);
 });
 it.each([-1,1])('has a broad short-toed pes with three diminishing medial claws on side %s',side=>{
  const foot=sauropodFoot([0,0,0],side,true),rays=sweeps(foot).filter(p=>p.at[1]>-.02),unguals=claws(foot);
  expect(rays).toHaveLength(5);expect(unguals).toHaveLength(3);
  const spans=unguals.map(p=>Math.abs(end(p)[0]!-p.at[0]));
  expect(spans[0]).toBeGreaterThan(spans[1]!);expect(spans[1]).toBeGreaterThan(spans[2]!);
  const tips=rays.map(end);expect(Math.max(...tips.map(p=>p[2]!))-Math.min(...tips.map(p=>p[2]!))).toBeGreaterThan(.11);
  for(const p of unguals)expect(sweeps(foot).some(q=>q!==p&&end(q).every((v,i)=>Math.abs(v-p.at[i]!)<1e-8))).toBe(true);
  expect(foot.every(pPrimitive)).toBe(true);
 });
 it('tapers eighty separate caudals into rod-like distal centra without spines or chevrons',()=>{
  const tail=sauropodTail(),centra=tail.filter(p=>p.kind==='lathe');
  expect(centra).toHaveLength(80);
  const radii=centra.map(p=>p.kind==='lathe'?Math.max(...p.profile.map(v=>v[0])):0);
  for(let i=1;i<radii.length;i++)expect(radii[i]).toBeLessThan(radii[i-1]!);
  expect(radii[79]).toBeLessThan(radii[0]!*.08);
  const arches=tail.filter(p=>p.kind==='extrude');expect(arches).toHaveLength(30);
  const heights=arches.map(p=>p.kind==='extrude'?Math.max(...p.shape.map(v=>v[1])):0);
  expect(heights[29]).toBeLessThan(heights[0]!*.30);
  expect(heights[29]).toBeLessThanOrEqual(radii[29]!*1.71); // arch remains, projecting spine has vanished
  const distal=tail.filter(p=>p.at[0]>1.72);expect(distal.every(p=>p.kind==='lathe')).toBe(true);
  expect(tail.every(pPrimitive)).toBe(true);
 });
 it('builds closed curved girdles with smoothly varying surface normals',()=>{
  const ps=diplodocidStudy(0,0).filter(p=>p.kind==='extrude'&&(p.shape.length===19||p.shape.length===24));
  expect(ps).toHaveLength(4);
  const g=museumBoneGeometry({primitive:ps[0],extra:ps.slice(1)} as Part),normal=g.getAttribute('normal');
  for(let i=0;i<normal.count;i++)expect(Math.hypot(normal.getX(i),normal.getY(i),normal.getZ(i))).toBeCloseTo(1,4);
  const position=g.getAttribute('position'),edges=new Map<string,number>();
  const vertex=(i:number)=>[position.getX(i),position.getY(i),position.getZ(i)].map(v=>Math.round(v*1e6)).join(',');
  for(let i=0;i<position.count;i+=3)for(const [a,b] of [[i,i+1],[i+1,i+2],[i+2,i]]){
   const key=[vertex(a!),vertex(b!)].sort().join('|');edges.set(key,(edges.get(key)??0)+1);
  }
  // Rounded rims join both cortex faces; there must be no open edge at the
  // authoring precision (collapsed sub-micron slivers can have incidence 4).
  expect([...edges.values()].every(n=>n%2===0)).toBe(true);
  g.computeBoundingBox();expect(g.boundingBox!.max.z-g.boundingBox!.min.z).toBeGreaterThan(.35);
  g.dispose();
 });
 it('preserves all accepted content, cameras and visibility except the authorised horizontal display stagger',()=>{
  const preserved=structuredClone(file);
  for(const p of preserved.parts){
   if(p.id.endsWith('-study'))delete p.material;
   if(p.id==='study-plinth')for(const g of [p.primitive,...p.extra])g.at[0]=0;
  }
  // Fingerprint of the accepted input with only the authorised fields masked.
  expect(createHash('sha256').update(JSON.stringify(preserved)).digest('hex')).toBe('b225abc877661ad3a37ef87ff7dc4ffad5b05830a316583296c10ed6f92afd91');
 });
 it('preserves every theropod index, position, normal, UV and world transform exactly',async()=>{
  await MeshoptDecoder.ready;
  const doc=await new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder}).read(`public${file.model}`),hash=createHash('sha256');
  for(const node of doc.getRoot().listNodes().filter(n=>n.getName().startsWith('sk-'))){
   hash.update(node.getName());hash.update(JSON.stringify(node.getWorldMatrix()));
   const p=node.getMesh()!.listPrimitives()[0]!;
   for(const a of [p.getIndices()!,...['POSITION','NORMAL','TEXCOORD_0'].map(k=>p.getAttribute(k)!)]){const array=a.getArray()!;hash.update(Buffer.from(array.buffer,array.byteOffset,array.byteLength));}
  }
  expect(hash.digest('hex')).toBe('7938bfafd9dcd4586687d00ad83e1f2035ede1c20f5dffc04d3ee547c479106e');
 });
});
function pPrimitive(p:Primitive){return primitiveSchema.safeParse(p).success;}
