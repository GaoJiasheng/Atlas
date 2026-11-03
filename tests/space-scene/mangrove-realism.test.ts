import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { branchingTree, pencilRootSystem, propRootSystem } from '../../scripts/geo/kits/tree';
import { buildParts } from '../../scripts/geo/mangrove-food-web/build-parts';
import { partsFileBase } from '../../src/engines/space-scene/schema';
import { partPrimitives } from '../../src/engines/space-scene/lib/parts';
import { geometryBounds, geometryPieces } from '../../scripts/geo/mangrove-food-web/geometry';
import { treeStudies } from '../../scripts/geo/mangrove-food-web/tree-meshes';
import { Vector3 } from 'three';
const data=partsFileBase.parse(buildParts());
const by=(id:string)=>data.parts.find(p=>p.id===id)!;

describe('mangrove realism and geometry budget',()=>{
 it('uses irregular tree crowns with 336 individual curled elliptic leaves',()=>{
  for(const id of ['api-tree','bakau-tree'] as const) {
   const p=by(id),study=treeStudies[id];
   expect(p.repeat).toBeUndefined();
   expect(study.leaves).toHaveLength(336);
   expect(study.wood.length).toBeGreaterThan(40);
   const heights=study.leaves.map(q=>q.at[1]);
   expect(Math.max(...heights)-Math.min(...heights)).toBeGreaterThan(.15);
   expect(new Set(study.leaves.map(q=>q.rotation[1].toFixed(2))).size).toBeGreaterThan(300);
   expect(p.mesh).toBe(id);
   // Foliage crown and bark trunk keep separate finishes (one material per glb node).
   const trunk=by(id.replace('-tree','-trunk'));
   expect(p.material).toEqual({color:'tissue',tint:'token:seedling'});
   expect(trunk.context).toBe(true);
   expect(trunk.material).toEqual({color:'wood',tint:'token:neutral'});
  }
 });
 it('has 72 varied pneumatophores with each foot attached to a wandering cable',()=>{
  const {pencils,lateral}=pencilRootSystem([-.46,0,-.13]);
  expect(pencils).toHaveLength(72);
  const feet=lateral.flatMap(c=>c.kind==='sweep'?c.path:[]);
  const heights:number[]=[];
  for(const root of pencils) {
   if(root.kind!=='sweep')throw new Error('Expected pencil loft');
   const foot=new Vector3(...root.path[0]!);
   expect(Math.min(...feet.map(p=>new Vector3(...p).distanceTo(foot)))).toBeLessThan(.000001);
   heights.push(root.path.at(-1)![1]);
  }
  expect(Math.max(...heights)-Math.min(...heights)).toBeGreaterThan(.06);
  expect(new Set(feet.map(p=>Math.hypot(p[0],p[2]).toFixed(4))).size).toBeGreaterThan(60);
 });
 it('has twelve unequal prop arches with six attached forks and low branch origins',()=>{
  const roots=propRootSystem([.18,0,-.25]);
  expect(roots).toHaveLength(18);
  const origins=roots.filter(p=>p.kind==='sweep'&&p.path.length===4);
  expect(origins).toHaveLength(12);
  expect(new Set(origins.map(p=>p.kind==='sweep'?p.path[0]![1].toFixed(3):'')).size).toBeGreaterThan(9);
  for(const root of roots)if(root.kind==='sweep')expect(root.path.at(-1)![1]).toBeLessThan(0);
 });
 it('has a transverse broad palm with independent fixed finger and movable dactyl',()=>{
  const p=by('fiddler-crabs');
  const [merus,carpus,palm,fixed,dactyl]=p.extra!.slice(8,13);
  expect([merus,carpus,palm,fixed,dactyl].every(p=>p?.kind==='sweep')).toBe(true);
  if(palm?.kind!=='sweep'||fixed?.kind!=='sweep'||dactyl?.kind!=='sweep')throw new Error('cheliped lofts required');
  expect(Math.max(...palm.radius as number[])).toBeGreaterThan(.017);
  expect(fixed.path.at(-1)![0]-fixed.path[0]![0]).toBeGreaterThan(.05);
  expect(dactyl.at[1]+dactyl.path.at(-1)![1]).toBeGreaterThan(fixed.at[1]+fixed.path.at(-1)![1]);
 });
 it('has a muscular pectoral shoulder/elbow/wrist and twelve fin rays on both sides',()=>{
  const p=by('giant-mudskipper');
  expect(p.extra!.filter(q=>q.kind==='sweep'&&q.path.length===4&&q.radial===24)).toHaveLength(2);
  expect(p.extra!.filter(q=>q.kind==='wing'&&q.veins?.length===12)).toHaveLength(2);
  expect(p.extra!.filter(q=>q.color==='eye')).toHaveLength(2);
 });
 it('retains four long toes on each heron foot and distinct walking-leg segments on both crabs',()=>{
  const heron=by('heron');
  const toes=heron.extra!.filter(p=>p.kind==='sweep'&&p.path.every(q=>p.at[1]+q[1]<.010));
  expect(toes).toHaveLength(8);
  for(const id of ['fiddler-crabs','tree-crabs']) {
   const crab=by(id);
   expect(crab.extra!.slice(0,8).every(p=>p.kind==='sweep'&&p.path.length===11)).toBe(true);
   expect(partPrimitives(crab).filter(p=>p.color==='eye')).toHaveLength(2);
  }
 });
 it('stays within the full-scene triangle and draw-piece budgets, with finite geometry',()=>{
  let triangles=0,calls=0;
  for(const part of data.parts) {
   const bounds=geometryBounds(part)!;
   expect([...bounds.min,...bounds.max].every(Number.isFinite)).toBe(true);
   for(const piece of geometryPieces(part)) {
    const g=piece.geometry;
    if(!piece.lines)triangles+=(g.index?.count??g.getAttribute('position').count)/3*(piece.matrices?.length??1);
    calls++;
    expect(Array.from(g.getAttribute('position').array).every(Number.isFinite)).toBe(true);
    g.dispose();
   }
  }
  expect(triangles).toBeLessThanOrEqual(250_000);
  expect(calls).toBeLessThan(100);
 });
 it('ships the same five original mesh surfaces inspected in the CPU audit',async()=>{
  await MeshoptDecoder.ready;
  const doc=await new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder}).read(resolve('public/models/mangrove-food-web.glb'));
  expect(doc.getRoot().getAsset().copyright).toContain('Original Atlas');
  expect(doc.getRoot().listNodes().map(n=>n.getName()).sort()).toEqual(['api-tree','bakau-tree','api-trunk','bakau-trunk','api-lateral','api-pencil','bakau-prop'].sort());
  for(const node of doc.getRoot().listNodes()){
   const expected=geometryPieces(by(node.getName()));
   const triangles=expected.reduce((n,p)=>n+(p.geometry.index?.count??p.geometry.getAttribute('position').count)/3,0);
   expect(node.getMesh()!.listPrimitives().reduce((n,p)=>n+p.getIndices()!.getCount()/3,0)).toBe(triangles);
   expected.forEach(p=>p.geometry.dispose());
  }
 });
 it('supports deterministic reuse at another size',()=>{
  const a=branchingTree([1,0,2],{height:1.8,spread:.6});
  expect(a).toEqual(branchingTree([1,0,2],{height:1.8,spread:.6}));
  expect(a.leaves).toHaveLength(336);
  expect(pencilRootSystem([1,0,2],{sectors:8,reach:.5}).pencils).toHaveLength(48);
 });
});
