/** Exercises the exact loader and material-slot helpers used by PartNode. */
import {readFileSync} from 'node:fs';
import {it,expect} from 'vitest';
import {Box3,Mesh,MeshStandardMaterial,Quaternion,Plane,Vector3,DoubleSide,FrontSide} from 'three';
import {MeshoptDecoder} from 'meshoptimizer';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {gltfGroupShape} from '../../src/engines/space-scene/stages/model3d/gltfGroupShape';
import {applyVisibilityFlags} from '../../src/engines/space-scene/stages/model3d/visibilityFlags';
import {gltfSurface} from '../../src/engines/space-scene/stages/model3d/GltfSource';
import {createSlotMaterials,gltfGroupShadowFlags,gltfSlotClipping,gltfSlotCount,gltfSlotSurface,type PartShape} from '../../src/engines/space-scene/stages/model3d/PartNode';
it('keeps all nine fish surfaces, transforms, fades and depth policies in actual renderer slots',async()=>{
 await MeshoptDecoder.ready;
 const model=await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).parseAsync(Uint8Array.from(readFileSync('public/models/heart-and-lungs-bench.glb')).buffer,'');model.scene.updateMatrixWorld(true);
 const root=model.scene.getObjectByName('fish-body')!,meshes:Mesh[]=[];root.traverse(o=>{if(o instanceof Mesh)meshes.push(o);});
 expect(root.userData.atlasSurfaceGroup).toBe(true);expect(meshes).toHaveLength(9);
 const first=meshes[0]!,position=new Vector3(),quaternion=new Quaternion(),scale=new Vector3();first.matrixWorld.decompose(position,quaternion,scale);
 const base={pieces:[{geometry:first.geometry,matrices:null}],position:position.toArray(),quaternion,scale,radius:1,closed:true,surface:gltfSurface(first),box:{min:[0,0,0],max:[0,0,0]}} as PartShape;
 const shape=gltfGroupShape(root,first,base);expect(gltfSlotCount(shape,1)).toBe(9);const paints=createSlotMaterials(shape.pieces,gltfSlotCount(shape,1));
 const shadows=new Map(shape.pieces.map(p=>[p,{visible:true,castShadow:true}]));
 for(const cast of [true,false,true]){applyVisibilityFlags(shadows.values(),{visible:true},true,true,cast);gltfGroupShadowFlags(shape,shadows);for(const [p,o]of shadows)expect(o.castShadow).toBe(cast&&p.slot===0);}
 for(const [i,piece]of shape.pieces.entries()){
  const actual=new Box3().setFromBufferAttribute(piece.geometry.getAttribute('position') as any).applyMatrix4(first.matrixWorld),expected=new Box3().setFromBufferAttribute(meshes[i]!.geometry.getAttribute('position') as any).applyMatrix4(meshes[i]!.matrixWorld);
  expect(actual.min.distanceTo(expected.min)).toBeLessThan(1e-6);expect(actual.max.distanceTo(expected.max)).toBeLessThan(1e-6);
  expect(piece.geometry.getAttribute('normal').array).toEqual(meshes[i]!.geometry.getAttribute('normal').array);
  const surface=gltfSlotSurface(shape,i)!,paint=paints[i]!,target=paint.material;surface.style(target);gltfSlotClipping(paint,shape,i,null,false);surface.fade(target,1,false);
  expect(target.vertexColors).toBe(true);expect(target.alphaHash).toBe(false);expect(target.forceSinglePass).toBe(true);expect(target.transparent).toBe(i>0);expect(target.depthWrite).toBe(i===0);
  if(i>0){expect(target.side).toBe(DoubleSide);const c=piece.geometry.getAttribute('color');expect(c.itemSize).toBe(4);expect(Math.min(...Array.from({length:c.count},(_,k)=>c.getW(k)))).toBeGreaterThan(.25);expect(Math.max(...Array.from({length:c.count},(_,k)=>c.getW(k)))).toBeLessThan(.65);}
  gltfSlotClipping(paint,shape,i,[new Plane(new Vector3(0,1,0),0)],false);expect(paint.uniforms.uCut.value).toBe(i===0?1:0);expect(target.side).toBe(DoubleSide);
  gltfSlotClipping(paint,shape,i,null,false);if(i>0)expect(target.side).toBe(DoubleSide);
  surface.fade(target,.12,true);expect(target.transparent).toBe(true);expect(target.depthWrite).toBe(false);
  target.dispose();piece.geometry.dispose();
 }
 const legacy=model.scene.getObjectByName('gill-cover')!;expect(gltfGroupShape(legacy,legacy as Mesh,base)).toBe(base);
});

it('leaves every shape without the atlasSurfaceGroup flag on the legacy path',()=>{
 const source=new MeshStandardMaterial({side:DoubleSide,transparent:true});source.userData.atlasSurface=true;
 const mesh=new Mesh(undefined,source);
 const base={pieces:[{geometry:mesh.geometry,matrices:null}],closed:true,surface:gltfSurface(mesh),box:{min:[0,0,0],max:[0,0,0]}} as unknown as PartShape;
 expect(gltfGroupShape(mesh,mesh,base)).toBe(base);
 expect(gltfSlotCount(base,2)).toBe(2);
 expect(gltfSlotSurface(base,1)).toBe(base.surface);
 const [paint]=createSlotMaterials(base.pieces,1),target=paint!.material;
 target.side=FrontSide;base.surface!.style(target);expect(target.side).toBe(FrontSide);
 gltfSlotClipping(paint!,base,0,null,false);expect(target.side).toBe(FrontSide);
 const flags=new Map([[base.pieces[0]!,{castShadow:true}]]);gltfGroupShadowFlags(base,flags);expect(flags.get(base.pieces[0]!)!.castShadow).toBe(true);
 target.dispose();
});
