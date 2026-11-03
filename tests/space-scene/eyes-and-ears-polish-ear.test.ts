/** Anatomical invariants that the previous ear violated, checked on shipped data. */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { NodeIO } from '@gltf-transform/core';
import { describe, expect, it } from 'vitest';
import { Vector3, Euler } from 'three';
import { partsFile } from '../../src/engines/space-scene/schema';
import { partPieces } from '../../src/engines/space-scene/stages/model3d/geometry';
const root=resolve(import.meta.dirname,'../..');
const file=partsFile.parse(JSON.parse(readFileSync(resolve(root,'src/content/topics/eyes-and-ears/data/parts.json'),'utf8')));
const part=(id:string)=>file.parts.find(p=>p.id===id)!;
const doc=await new NodeIO().read(resolve(root,'public',file.model!.slice(1)));

describe('polished ear anatomical geometry',()=>{
  it('has three perpendicular canal planes and one ampulla per loop, with both ends meeting the vestibule',()=>{
    const p=part('balance-context');
    const loops=[p.primitive!,...p.extra!.slice(0,2)];
    const normals=loops.map(loop=>{
      expect(loop.kind).toBe('sweep'); if(loop.kind!=='sweep') throw new Error('Expected a tube loop');
      const points=loop.path.map(p=>new Vector3(...p));
      const a=points[0]!,b=points[20]!,c=points[40]!;
      const normal=new Vector3().crossVectors(b.clone().sub(a),c.clone().sub(a)).normalize();
      for(const point of points) expect(Math.abs(point.clone().sub(a).dot(normal))).toBeLessThan(.000003);
      const radii=loop.radius as number[];
      const peaks=radii.filter((r,i)=>i>0&&i<radii.length-1&&r>radii[i-1]!&&r>radii[i+1]!);
      expect(peaks).toHaveLength(1);expect(peaks[0]).toBeGreaterThan(.06);
      const vestibule=new Vector3(2.48,.205,-.255);
      expect(points[0]!.distanceTo(vestibule)).toBeLessThan(.14);
      expect(points.at(-1)!.distanceTo(vestibule)).toBeLessThan(.14);
      return normal;
    });
    for(let i=0;i<3;i++) for(let j=i+1;j<3;j++) expect(Math.abs(normals[i]!.dot(normals[j]!))).toBeLessThan(.00003);
  });
  it('has a tapering 2.5-turn cochlear helix with real axial depth',()=>{
    const p=part('cochlea-shell').primitive!;expect(p.kind).toBe('sweep');if(p.kind!=='sweep') throw new Error('Expected helix');
    const a=p.path.map(v=>Math.atan2(v[1]+.04,v[0]-2.97));let winding=0;
    for(let i=1;i<a.length;i++) winding+=Math.atan2(Math.sin(a[i]!-a[i-1]!),Math.cos(a[i]!-a[i-1]!));
    expect(winding/(Math.PI*2)).toBeCloseTo(2.5,5);
    expect(p.path.at(-1)![2]-p.path[0]![2]).toBeGreaterThan(.35);
    expect((p.radius as number[])[0]).toBeGreaterThan((p.radius as number[]).at(-1)!*1.8);
  });
  it('attaches the malleus handle at the inward umbo of a thin conical drum',()=>{
    const drum=part('eardrum').primitive!;expect(drum.kind).toBe('lathe');if(drum.kind!=='lathe') throw new Error('Expected drum');
    const umbo=new Vector3(0,drum.profile[0]![1],0).applyEuler(new Euler(...drum.rotation!.map(v=>v*Math.PI/180) as [number,number,number])).add(new Vector3(...drum.at));
    const position=doc.getRoot().listNodes().find(n=>n.getName()==='malleus')!.getMesh()!.listPrimitives()[0]!.getAttribute('POSITION')!;
    let distance=Infinity;for(let i=0;i<position.getCount();i++) {const v:number[]=[];position.getElement(i,v);distance=Math.min(distance,new Vector3(v[0],v[1],v[2]).distanceTo(umbo));}
    expect(distance).toBeLessThan(.022);
    expect(Math.abs(drum.profile[0]![1]-drum.profile.at(-1)![1])).toBeLessThan(.01);
    expect(drum.profile[0]![1]-drum.profile[4]![1]).toBeGreaterThan(.06);
  });
  it('ships finite, smoothly shaded local meshes with all geometry under the topic budget',()=>{
    let triangles=0;
    for(const p of file.parts) {
      if(p.mesh) {
        const g=doc.getRoot().listNodes().find(n=>n.getName()===p.mesh)!.getMesh()!.listPrimitives()[0]!;
        triangles+=(g.getIndices()?.getCount()??g.getAttribute('POSITION')!.getCount())/3;
        for(const semantic of ['POSITION','NORMAL']) expect(Array.from(g.getAttribute(semantic)!.getArray()!).every(Number.isFinite)).toBe(true);
      } else for(const piece of partPieces(p)) {triangles+=(piece.geometry.index?.count??piece.geometry.getAttribute('position').count)/3*(piece.matrices?.length??1);piece.geometry.dispose();}
    }
    // Includes BOTH mutually-exclusive iris inserts: stricter than any lesson state.
    expect(triangles).toBeLessThan(350000);
  });
});
