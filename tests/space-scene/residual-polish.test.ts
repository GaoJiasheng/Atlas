/** Renderer-input regressions: decoded GLBs, UV derivatives and sheet topology. */
import {readFileSync,statSync} from 'node:fs';
import {describe,it,expect} from 'vitest';
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {dequantize} from '@gltf-transform/functions';
import {MeshoptDecoder} from 'meshoptimizer';
import {Matrix4,Vector3} from 'three';
const read=(s:string)=>JSON.parse(readFileSync(s,'utf8'));
async function mesh(path:string,id:string){await MeshoptDecoder.ready;const d=await new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder}).read(path);await d.transform(dequantize());const n=d.getRoot().listNodes().find(n=>n.getName()===id)!;return {p:n.getMesh()!.listPrimitives()[0]!,m:new Matrix4().fromArray(n.getWorldMatrix())};}
describe('residual polish shipped geometry',()=>{
 it('keeps every installed residual asset under the topic byte ceiling',()=>{for(const id of ['plant','grasshopper','forces','how-planes-fly-polish','aircon-inverter','b200-server','container-port-grit','living-things'])expect(statSync(`public/models/${id}.glb`).size,id).toBeLessThanOrEqual(1_500_000);});
 it('uses metre-based asphalt UVs with the live abrasive finish',async()=>{
  const data=read('src/content/topics/container-port/data/parts.json'),part=data.parts.find((p:{id:string})=>p.id==='quay-context'),{p,m}=await mesh('public'+data.model,part.mesh),pos=p.getAttribute('POSITION')!,uv=p.getAttribute('TEXCOORD_0')!,normal=p.getAttribute('NORMAL')!,ix=p.getIndices()!;let checked=0;
  expect(part.material.color).toBe('abrasive');expect(p.getMaterial()!.getExtras().atlasSurface).not.toBe(true);
  for(let t=0;t<ix.getCount();t+=3){const a=ix.getScalar(t),b=ix.getScalar(t+1);if(normal.getElement(a,[0,0,0])[1]!<.9)continue;const A=new Vector3(...pos.getElement(a,[0,0,0]) as [number,number,number]).applyMatrix4(m),B=new Vector3(...pos.getElement(b,[0,0,0]) as [number,number,number]).applyMatrix4(m),d=A.distanceTo(B);if(d<1)continue;const u=uv.getElement(a,[0,0]),v=uv.getElement(b,[0,0]);expect(Math.hypot(u[0]!-v[0]!,u[1]!-v[1]!)/d).toBeCloseTo(1/1.08,2);checked++;}expect(checked).toBeGreaterThan(5);
 });
 it('keeps the rear skull chart continuous at visible triangle scale',async()=>{
  const {p,m}=await mesh('public/models/living-things.glb','fruit-bat'),pos=p.getAttribute('POSITION')!,uv=p.getAttribute('TEXCOORD_0')!,ix=p.getIndices()!;let checked=0,maxSlope=0;
  for(let t=0;t<ix.getCount();t+=3){const ids=[0,1,2].map(k=>ix.getScalar(t+k)),points=ids.map(i=>new Vector3(...pos.getElement(i,[0,0,0]) as [number,number,number]).applyMatrix4(m)),c=points.reduce((s,p)=>s.add(p),new Vector3()).divideScalar(3);if(c.z>=-.2872||c.y<=.0533||Math.abs(c.x+.18)>=.0075)continue;for(let k=0;k<3;k++){const a=points[k]!,b=points[(k+1)%3]!,d=a.distanceTo(b);if(d<.0001)continue;const u=uv.getElement(ids[k]!,[0,0]),v=uv.getElement(ids[(k+1)%3]!,[0,0]);maxSlope=Math.max(maxSlope,Math.hypot(u[0]!-v[0]!,u[1]!-v[1]!)/d);checked++;}}
  expect(checked).toBeGreaterThan(50);expect(maxSlope).toBeLessThan(140);expect(p.getAttribute('_LOCK')).toBe(null);expect(p.getMaterial()!.getExtras().atlasRoughness).toBe(true);
 });
 it('ships paper as one thin closed sheet rather than a solid crumpled sphere',async()=>{
  const {p,m}=await mesh('public/models/forces.glb','paper-crumpled'),a=p.getAttribute('POSITION')!,ix=p.getIndices()!,points=Array.from({length:a.getCount()},(_,i)=>new Vector3(...a.getElement(i,[0,0,0]) as [number,number,number]).applyMatrix4(m).sub(new Vector3(1.07,.319,.14))),edges=new Map<string,number>(),keys=points.map(q=>q.toArray().map(v=>Math.round(v*1e6)).join(':'));let volume=0;
  for(let t=0;t<ix.getCount();t+=3){const ids=[0,1,2].map(k=>ix.getScalar(t+k)),[a,b,c]=ids.map(i=>points[i]!) as [Vector3,Vector3,Vector3];volume+=a.dot(b.clone().cross(c))/6;const k=ids.map(i=>keys[i]!);if(new Set(k).size<3)continue;for(let j=0;j<3;j++){const edge=[k[j]!,k[(j+1)%3]!].sort().join('|');edges.set(edge,(edges.get(edge)??0)+1);}}
  const min=new Vector3(Infinity,Infinity,Infinity),max=new Vector3(-Infinity,-Infinity,-Infinity);for(const q of points){min.min(q);max.max(q);}const size=max.sub(min);expect(Math.max(...size.toArray())).toBeLessThan(.055);expect(Math.abs(volume)/(size.x*size.y*size.z)).toBeLessThan(.25);expect([...edges.values()].filter(n=>n===1).length).toBeLessThan(12);
 });
 it('retains the six authored nymph stages and actual updated performance inventory',async()=>{
  const data=read('src/content/topics/grasshopper/data/parts.json'),perf=read('scripts/geo/grasshopper/performance.json');
  for(let stage=1;stage<=6;stage++){const id='nymph-'+stage,{p}=await mesh('public'+data.model,id);expect(perf.after.parts[id].triangles).toBe(p.getIndices()!.getCount()/3);expect(p.getAttribute('NORMAL')!.getCount()).toBeGreaterThan(100);expect(data.parts.find((p:{id:string})=>p.id===id)).toBeDefined();}expect(perf.after.maxAuthoredTriangles).toBeLessThan(350_000);
 });
});
