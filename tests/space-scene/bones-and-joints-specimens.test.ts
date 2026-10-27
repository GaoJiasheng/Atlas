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
    expect(marrow.some(p=>p.tint==='token:cut'&&p.kind==='capsule')).toBe(true);
    for(const sign of [-1,1])expect(marrow.some(p=>p.tint==='token:muscle-3'&&p.at[1]*sign>.15)).toBe(true);
    const walls=partPrimitives(part('bone-cortex')).filter(p=>p.kind==='lathe');
    expect(walls.every(p=>p.kind==='lathe'&&p.profile[0]![0]===p.profile.at(-1)![0])).toBe(true);
    expect(walls.filter(p=>p.arc===200).length).toBe(2);
    const pieces=partPieces(part('bone-lattice'));
    expect(pieces.length).toBe(1);
    expect(pieces[0]!.geometry.getAttribute('position').count).toBeGreaterThan(1000);
    expect((pieces[0]!.geometry.index?.count??0)/3).toBeLessThan(150_000);
    pieces.forEach(p=>p.geometry.dispose());
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
