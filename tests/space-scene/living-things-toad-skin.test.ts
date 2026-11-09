import { describe,expect,it } from 'vitest';
import { BufferGeometry,Vector3 } from 'three';
import { dermalRelief } from '../../scripts/geo/living-things/specimens/toad-skin';
import { specimen } from '../../scripts/geo/living-things/models';

describe('Asian toad uninterrupted dermis',()=>{
 it('joins raised dermal relief with zero height and slope at its support boundary',()=>{
  const n=new Vector3(0,1,0),radius=.0008,wart={centre:new Vector3(),radius,height:.0004,dark:.9,stretch:1};
  const h=(x:number)=>dermalRelief(new Vector3(x,0,0),n,[wart]).height,e=radius*1e-4;
  expect(h(0)).toBe(.0004);
  expect(h(radius)).toBe(0);
  expect(h(radius+e)).toBe(0);
  expect(Math.abs((h(radius+e)-h(radius-e))/(2*e))).toBeLessThan(1e-7);
 });
 it('grows all dorsal detail from closed torso/head surfaces without open patch borders',()=>{
  const m=specimen('asian-toad');
  for(const prim of [m.primitive,m.extra[0]!]){
   const g=prim.geometry as BufferGeometry,p=g.getAttribute('position'),n=g.getAttribute('normal'),ix=g.index!,edges=new Map<string,number>();
   expect(g.userData.dermalIntegrated).toBe(true);
   const key=(i:number)=>[p.getX(i),p.getY(i),p.getZ(i)].map(v=>Math.round(v*1e8)).join(',');
   for(let t=0;t<ix.count;t+=3){
    const ids=[ix.getX(t),ix.getX(t+1),ix.getX(t+2)].map(key);
    for(let j=0;j<3;j++){const a=ids[j]!,b=ids[(j+1)%3]!;if(a===b)continue;const edge=[a,b].sort().join(':');edges.set(edge,(edges.get(edge)??0)+1);}
   }
   expect([...edges.values()].every(count=>count===2)).toBe(true);
   for(let i=0;i<n.count;i++)expect(Math.hypot(n.getX(i),n.getY(i),n.getZ(i))).toBeCloseTo(1,5);
  }
 }, 20_000);
});
