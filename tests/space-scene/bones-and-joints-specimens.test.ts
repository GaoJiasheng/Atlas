import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { Matrix4, Mesh, MeshBasicMaterial, Raycaster, Vector3 } from 'three';
import { partsFile } from '../../src/engines/space-scene/schema';
import { partPrimitives } from '../../src/engines/space-scene/lib/parts';
import { partPieces } from '../../src/engines/space-scene/stages/model3d/geometry';
import { simEffects } from '../../src/engines/space-scene/lib/sim/bind';
import { evaluateSim } from '../../src/engines/space-scene/lib/sim';
import { resolveSimValues } from '../../src/engines/space-scene/lib/sim/controls';

const file=partsFile.parse(JSON.parse(readFileSync('src/content/topics/bones-and-joints/data/parts.json','utf8')));
const part=(id:string)=>file.parts.find(p=>p.id===id)!;

describe('bones and joints: anatomical teaching relationships',()=>{
  it.each(['a','b'])('joins cartilage %s to the curved bone end, with outward-facing surfaces on both sides',(side)=>{
    const p=part(`joint-cartilage-${side}`),prims=partPrimitives(p);
    const cap=prims[0]!,bone=prims[1]!;
    if(cap.kind!=='lathe'||bone.kind!=='lathe')throw Error('Curved lathe end required');
    const common=cap.profile.filter(([r,y])=>bone.profile.some(([br,by])=>Math.hypot(r-br,y-by)<1e-12));
    expect(common.length).toBeGreaterThanOrEqual(5);
    const meshes=partPieces(p).map(piece=>{
      const mesh=new Mesh(piece.geometry,new MeshBasicMaterial());
      mesh.position.fromArray(p.primitive!.at);mesh.updateMatrixWorld(true);return mesh;
    });
    const ray=new Raycaster(new Vector3(-2,side==='a'?.05:-.05,.3),new Vector3(0,0,-1));
    const hits=ray.intersectObjects(meshes,false);
    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0]!.face!.normal.z).toBeGreaterThan(0);
    meshes.forEach(m=>{m.geometry.dispose();(m.material as MeshBasicMaterial).dispose();});
  });
  it('shows both marrow types and a connected, merged end lattice inside a thick section wall',()=>{
    const marrow=partPrimitives(part('bone-marrow'));
    expect(marrow.some(p=>p.tint==='token:cut'&&p.kind==='sweep')).toBe(true);
    for(const sign of [-1,1])expect(marrow.some(p=>p.tint==='token:muscle-3'&&p.kind==='sweep'&&p.path.some(v=>v[1]*sign>.15))).toBe(true);
    // The cortical shell is one implicit mesh, so overlapping primitive
    // seams cannot return at the neck/shaft/condyle junctions.
    expect(part('bone-cortex').mesh).toBe('polished-cortex');
    expect(part('bone-cortex').primitive).toBeUndefined();
    // Growth plate conforms to the proximal contour, rather than a blue disc.
    expect(part('growth-plate').primitive!.kind).toBe('sweep');
    const pieces=partPieces(part('bone-lattice'));
    expect(pieces.length).toBe(2);
    expect(pieces[0]!.geometry.getAttribute('position').count).toBeGreaterThan(1000);
    expect(pieces.reduce((n,p)=>n+(p.geometry.index?.count??0)/3,0)).toBeLessThan(90_000);
    pieces.forEach(p=>p.geometry.dispose());
  });
  it('faces the conforming head cartilage outwards, so it covers the posterior joint surface',()=>{
    const p=part('bone-lattice'),material=new MeshBasicMaterial();
    const meshes=partPieces(p).map(piece=>{const m=new Mesh(piece.geometry,material);m.position.fromArray(p.primitive!.at);m.updateMatrixWorld(true);return m;});
    const hits=new Raycaster(new Vector3(1.946,.218,-.1),new Vector3(0,0,1)).intersectObjects(meshes,false);
    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0]!.point.z).toBeLessThan(-.0314);
    expect(hits[0]!.face!.normal.z).toBeLessThan(-.9);
    meshes.forEach(m=>m.geometry.dispose());material.dispose();
  });
  it('keeps the fulcrum fixed and places the beam dot at 0.04 m for every model angle',()=>{
    const pivot=part('lever-pivot');expect(pivot.context).toBe(true);
    expect(pivot.primitive!.at).toEqual([4,0,0]);
    const dot=partPrimitives(part('lever-beam')).find(p=>p.kind==='sphere')!;
    const start=new Vector3(...dot.at).sub(new Vector3(4,0,0));
    for(const angle of [30,60,90,120]){
      const values=resolveSimValues(file.sim!,{mode:'lever','elbow-angle':angle});
      const effects=simEffects(file.sim!,values,evaluateSim(file.sim!,values));
      expect(effects.hidden.has('lever-pivot')).toBe(false);
      const moved=start.clone().applyMatrix4(new Matrix4().makeRotationZ(angle*Math.PI/180));
      expect(Math.hypot(moved.x,moved.y)).toBeCloseTo(.04,12);
      expect(file.sim!.bind!.some(b=>'part' in b&&b.part==='lever-pivot'&&'rotate' in b)).toBe(false);
    }
    const values=resolveSimValues(file.sim!,{mode:'explore'});
    expect(simEffects(file.sim!,values,evaluateSim(file.sim!,values)).hidden.has('lever-pivot')).toBe(true);
  });
});
