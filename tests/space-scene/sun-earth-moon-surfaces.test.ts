import { beforeAll, describe, expect, it } from 'vitest';
import { readFileSync, statSync } from 'node:fs';
import { NodeIO, type Document } from '@gltf-transform/core';
import sharp from 'sharp';
import { Vector3 } from 'three';
import { geographicDirection, globe, sampleMap, SINGAPORE } from '../../scripts/geo/sun-earth-moon/surfaces';
const model='public/models/sun-earth-moon/surfaces.glb';
let doc:Document;
beforeAll(async()=>{doc=await new NodeIO().read(model);});

describe('sun-earth-moon prepared surface asset (integration is separately gated by ownership)',()=>{
  it('keeps all three surfaces local, credited, and well below the screen and asset budgets',()=>{
    expect(statSync(model).size).toBeLessThan(8*1024*1024);
    expect(doc.getRoot().getAsset().copyright).toContain('Natural Earth');
    expect(doc.getRoot().getAsset().copyright).toContain('NASA');
    expect(doc.getRoot().listNodes().map(n=>n.getName()).sort()).toEqual(['earth-body','moon-body','sun-body']);
    let count=0;
    for(const node of doc.getRoot().listNodes()){
      expect(node.getExtras().atlasSurface).toBe(true);
      const p=node.getMesh()!.listPrimitives()[0]!;
      expect(p.getMaterial()!.getBaseColorTexture()!.getImage()!.length).toBeGreaterThan(10000);
      count+=p.getIndices()!.getCount()/3;
    }
    expect(count+11808).toBeLessThan(350000);
  });
  it('has outward winding and smooth outward normals, including the seam and poles',()=>{
    for(const node of doc.getRoot().listNodes()){
      const p=node.getMesh()!.listPrimitives()[0]!,positions=p.getAttribute('POSITION')!.getArray()!,normals=p.getAttribute('NORMAL')!.getArray()!,indices=p.getIndices()!.getArray()!;
      const v=(i:number)=>new Vector3().fromArray(positions,i*3);
      for(let i=0;i<indices.length;i+=3*197){
        const a=v(indices[i]!),b=v(indices[i+1]!),c=v(indices[i+2]!);
        expect(b.sub(a).cross(c.sub(a)).dot(a),node.getName()).toBeGreaterThan(0);
        const n=new Vector3().fromArray(normals,indices[i]!*3);
        expect(n.length()).toBeCloseTo(1,5);expect(n.dot(a.clone().normalize())).toBeGreaterThan(.65);
      }
    }
  });
  it('uses the simulator observer meridian for the Singapore location and the +X near-side meridian for the Moon',()=>{
    const at=geographicDirection(SINGAPORE.lat,SINGAPORE.lon);
    expect(at[2]).toBeCloseTo(0,12);expect(at[1]).toBeCloseTo(Math.sin(SINGAPORE.lat*Math.PI/180),12);
    expect(geographicDirection(0,0,0)).toEqual([1,0,-0]);
    const g=globe(0,48,24),position=g.getAttribute('position'),uv=g.getAttribute('uv');
    const mid=12*49+24;
    expect(position.getX(mid)).toBe(1);expect(uv.getX(mid)).toBe(.5);expect(uv.getY(mid)).toBe(.5);
    g.dispose();
  });
  it('preserves measured lunar heights in metres rather than converting them to display colours',()=>{
    const raw=readFileSync('scripts/geo/sun-earth-moon/sources/lola.u16');
    const h=new Uint16Array(raw.buffer,raw.byteOffset,raw.length/2);
    expect(h.length).toBe(1440*720);
    let min=Infinity,max=-Infinity;for(const value of h){min=Math.min(min,value);max=Math.max(max,value);}
    expect(min).toBeGreaterThan(0);expect(max).toBeGreaterThan(20000);
    expect((max-min)*.5).toBeGreaterThan(10000);
    const moon=doc.getRoot().listNodes().find(n=>n.getName()==='moon-body')!.getMesh()!.listPrimitives()[0]!;
    const pos=moon.getAttribute('POSITION')!.getArray()!;
    for(let i=0;i<pos.length;i+=3*103){const r=Math.hypot(pos[i]!,pos[i+1]!,pos[i+2]!);expect(r).toBeGreaterThan(.99);expect(r).toBeLessThan(1.01);}
  });
  it('keeps near-side maria visibly darker than the far-side highlands in the embedded albedo',async()=>{
    const p=doc.getRoot().listNodes().find(n=>n.getName()==='moon-body')!.getMesh()!.listPrimitives()[0]!;
    const img=await sharp(Buffer.from(p.getMaterial()!.getBaseColorTexture()!.getImage()!)).removeAlpha().raw().toBuffer({resolveWithObject:true});
    const brightness=(lat:number,lon:number)=>[0,1,2].reduce((s,k)=>s+sampleMap(img.data,img.info.width,img.info.height,img.info.channels,lat,lon,k),0)/3;
    expect(brightness(32.8,-15.6)).toBeLessThan(brightness(-15,160)*.85);
  });
});
