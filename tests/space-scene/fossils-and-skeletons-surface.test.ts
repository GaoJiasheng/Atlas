import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dequantize } from '@gltf-transform/functions';
import { MeshoptDecoder } from 'meshoptimizer';
import { Color, Mesh, MeshStandardMaterial } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { gltfSurface } from '../../src/engines/space-scene/stages/model3d/GltfSource';
import { resolveMaterialLook } from '../../src/engines/space-scene/lib/color';
import { aces, studioShade, studioRigs } from '../../scripts/geo/fossils-and-skeletons/studio-cpu';
import { BONE_ALBEDO } from '../../scripts/geo/fossils-and-skeletons/bone-surface';
const file=JSON.parse(readFileSync('src/content/topics/fossils-and-skeletons/data/parts.json','utf8'));
describe('museum mineral bone surface',()=>{
 it('retains the fossil tint while the actual GLB material hook supplies matte mineral reflectance',async()=>{
  await MeshoptDecoder.ready;
  const doc=await new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder}).read(`public${file.model}`);
  await doc.transform(dequantize());
  const nodes=doc.getRoot().listNodes().filter(n=>n.getName().endsWith('-study'));
  const primitive=nodes[0]!.getMesh()!.listPrimitives()[0]!,material=primitive.getMaterial()!,factor=material.getBaseColorFactor();
  expect(material.getExtras().atlasSurface).toBe(true);
  expect(factor[3]).toBe(1);expect(material.getAlphaMode()).toBe('OPAQUE');
  expect(material.getMetallicFactor()).toBe(0);expect(material.getRoughnessFactor()).toBeGreaterThan(.85);
  expect(material.getBaseColorTexture()).toBeNull();expect(material.getEmissiveFactor()).toEqual([0,0,0]);
  const colors=primitive.getAttribute('COLOR_0')!,values=Array.from(colors.getArray()!);
  expect(colors.getCount()).toBe(primitive.getAttribute('POSITION')!.getCount());
  const minimum=values.reduce((a,b)=>Math.min(a,b),Infinity),maximum=values.reduce((a,b)=>Math.max(a,b),-Infinity);
  expect(minimum).toBeGreaterThan(.55);expect(minimum).toBeLessThan(.80);
  expect(maximum).toBeGreaterThan(.96);expect(maximum).toBeLessThanOrEqual(1);
  // Exercise the production hook, rather than merely assert authoring JSON.
  const bytes=readFileSync(`public${file.model}`);
  const loaded=await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).parseAsync(new Uint8Array(bytes).buffer,'');
  const loadedBone=loaded.scene.getObjectByName('prince-study') as Mesh;
  expect(loadedBone.geometry.hasAttribute('color')).toBe(true);
  const target=new MeshStandardMaterial({color:'#6e5a44'}),surface=gltfSurface(loadedBone)!;
  expect(surface).toBeDefined();
  surface.style(target);surface.fade(target,1,false);
  expect(target.color.r).toBeCloseTo(new Color('#6e5a44').r*factor[0],6);
  expect(target.vertexColors).toBe(true);expect(target.transparent).toBe(false);expect(target.depthWrite).toBe(true);
  expect(target.roughnessMap).toBeNull();expect(target.normalMap).toBeNull();
  const sorted=nodes.sort((a,b)=>a.getTranslation()[2]-b.getTranslation()[2]);
  const k=JSON.parse(readFileSync('scripts/geo/fossils-and-skeletons/model-layout.json','utf8')).studies.museum.scale;
  const platforms=[file.parts.at(-1).primitive,...file.parts.at(-1).extra.slice(0,2)];
  for(let i=0;i<3;i++){
   const dx=sorted[i]!.getTranslation()[0]-sorted[1]!.getTranslation()[0];
   expect(dx).toBeCloseTo((i-1)*.3*k,6);expect(platforms[i].at[0]).toBeCloseTo((i-1)*.3*k,6);
  }
  // No unrequested surface edits on the independently selectable theropod.
  for(const n of doc.getRoot().listNodes().filter(n=>n.getName().startsWith('sk-')))expect(n.getMesh()!.listPrimitives()[0]!.getAttribute('COLOR_0')).toBeNull();
 });
 it('preserves the calibrated reflectance through studio lights and ACES under neutral environment radiance',()=>{
  // Keep numerical BRDF coverage fast and filesystem-independent. The full
  // sampled RoomEnvironment and actual pixels are verified by studio-preview.
  const environment=()=>.7;
  for(const [theme,tint] of [['paper','#6e5a44'],['cinema','#97816a']] as const){
   const look=resolveMaterialLook('plastic',{fossil:tint},theme,'token:fossil'),base=new Color(look.color);
   const old=aces(studioShade([base.r,base.g,base.b],[0,0,1],[0,0,1],theme,look.roughness*.92,0,environment),studioRigs[theme].exposure);
   base.multiplyScalar(BONE_ALBEDO*.87);
   const corrected=aces(studioShade([base.r,base.g,base.b],[0,0,1],[0,0,1],theme,.92,0,environment),studioRigs[theme].exposure);
   const luminance=(c:number[])=>.2126*c[0]!+.7152*c[1]!+.0722*c[2]!;
   expect(luminance(corrected)).toBeLessThan(luminance(old)*.55);
   expect(corrected[0]).toBeGreaterThan(corrected[1]);expect(corrected[1]).toBeGreaterThan(corrected[2]);
   expect(new Color().fromArray(corrected).convertLinearToSRGB().r*255).toBeLessThan(theme==='paper'?145:180);
  }
 });
});
