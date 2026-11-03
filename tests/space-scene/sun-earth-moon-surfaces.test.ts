import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { readFileSync, statSync } from 'node:fs';
import { NodeIO, type Document } from '@gltf-transform/core';
import { EXTTextureWebP, EXTMeshoptCompression } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import sharp from 'sharp';
import { Mesh, ShaderLib, Texture, UniformsUtils, Vector3, type WebGLRenderer } from 'three';
import { partsFile } from '../../src/engines/space-scene/schema';
import { gltfSurface } from '../../src/engines/space-scene/stages/model3d/GltfSource';
import { createPartMaterial, stylePartMaterial } from '../../src/engines/space-scene/stages/model3d/materials';
import { resolveMaterialLook } from '../../src/engines/space-scene/lib/color';
import live from '../../src/content/topics/sun-earth-moon/data/parts.json';
import { geographicDirection, globe, sampleMap, SINGAPORE } from '../../scripts/geo/sun-earth-moon/surfaces';
const model='public/models/sun-earth-moon.glb';
let doc:Document, gltf:GLTF;
beforeAll(async()=>{
  await MeshoptDecoder.ready;
  doc=await new NodeIO().registerExtensions([EXTTextureWebP,EXTMeshoptCompression]).registerDependencies({'meshopt.decoder':MeshoptDecoder}).read(model);
  vi.stubGlobal('self',globalThis);
  vi.stubGlobal('createImageBitmap',async(blob:Blob)=>{
    const img=await sharp(Buffer.from(await blob.arrayBuffer())).metadata();
    return {width:img.width,height:img.height,close(){}};
  });
  const bytes=readFileSync(model);
  gltf=await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
});
afterAll(()=>vi.unstubAllGlobals());

describe('sun-earth-moon live local surfaces',()=>{
  it('keeps all three surfaces local, credited, and well below the screen and asset budgets',()=>{
    expect(statSync(model).size).toBeLessThanOrEqual(1_500_000);
    expect(live.model).toBe('/models/sun-earth-moon.glb');
    expect(partsFile.safeParse(live).success).toBe(true);
    expect(doc.getRoot().getAsset().copyright).toContain('Natural Earth');
    expect(doc.getRoot().getAsset().copyright).toContain('NASA');
    expect(doc.getRoot().listNodes().map(n=>n.getName()).sort()).toEqual(['earth-body','moon-body','sun-body']);
    let count=0;
    for(const node of doc.getRoot().listNodes()){
      const p=node.getMesh()!.listPrimitives()[0]!;
      expect(p.getMaterial()!.getExtras().atlasSurface).toBe(true);
      expect(p.getMaterial()!.getBaseColorTexture()!.getMimeType()).toBe('image/webp');
      expect(p.getMaterial()!.getBaseColorTexture()!.getImage()!.length).toBeGreaterThan(1000);
      expect(live.parts.find(part=>part.id===node.getName())?.mesh).toBe(node.getName());
      count+=p.getIndices()!.getCount()/3;
    }
    expect(count+11808).toBeLessThan(350000);
  });
  it.each(['paper','cinema'] as const)('uses the production loader and style/fade adapters on %s',theme=>{
    for(const id of ['earth-body','moon-body','sun-body']){
      const mesh=gltf.scene.getObjectByName(id) as Mesh,surface=gltfSurface(mesh)!;
      expect(surface,id).toBeDefined();
      const pm=createPartMaterial();
      const kitTexture=new Texture();
      const look=resolveMaterialLook(live.parts.find(p=>p.id===id)!.material!.color,{},theme,'#ffffff');
      stylePartMaterial(pm,{look,kit:{roughness:()=>kitTexture,normal:()=>kitTexture,albedo:()=>null,dispose(){}},signal:'#cc6328',cold:'#4f7f8c',cut:'#b8973c',ink:'#2a2824',rim:.35,tint:.05,hatchPx:7});
      surface.style(pm.material);
      expect(pm.material.map).toBe(surface.source.map);
      expect(pm.material.map!.colorSpace).toBe('srgb');
      expect(pm.material.map!.flipY).toBe(false);
      expect(pm.material.normalMap).toBeNull();
      expect(pm.material.roughness).toBe(1);
      expect(pm.material.metalness).toBe(0);
      for(const fade of [0,.4,1]){
        surface.fade(pm.material,fade*look.opacity,false);
        expect(pm.material.opacity).toBe(fade*look.opacity);
        expect(pm.material.transparent).toBe(fade*look.opacity<.999);
        if(id==='sun-body'){
          expect(look.opacity).toBe(.55);
          expect(pm.material.opacity/.55).toBeCloseTo(fade,12);
        }
      }
      const emission=mesh.geometry.getAttribute('_emission');
      // Every body carries the attribute (Earth/Moon all 0): a missing one reads a stale generic value in WebGL.
      expect(Array.from(emission.array).every(v=>v===(id==='sun-body'?1:0))).toBe(true);
      pm.material.dispose();
      kitTexture.dispose();
    }
  });
  it('gates neutral analytic night fill to mapped orbit bodies, retaining PBR and self-lit Sun paths',()=>{
    const pm=createPartMaterial();
    const shader={uniforms:UniformsUtils.clone(ShaderLib.standard.uniforms),vertexShader:ShaderLib.standard.vertexShader,fragmentShader:ShaderLib.standard.fragmentShader} as Parameters<typeof pm.material.onBeforeCompile>[0];
    pm.material.onBeforeCompile(shader,{} as WebGLRenderer);
    expect(pm.uniforms.uOrbitLight.value).toBe(0);
    expect(shader.fragmentShader).toContain('#ifdef USE_MAP\nif (uOrbitLight < 1.5) outgoingLight = mix(vec3(uOrbitFill),diffuseColor.rgb,day);\n#endif');
    expect(shader.fragmentShader).toContain('#include <lights_physical_fragment>');
    expect(shader.fragmentShader).toContain('outgoingLight = diffuseColor.rgb * gain + totalEmissiveRadiance;');
    pm.material.dispose();
  });
  it('uses the flat local /models/<name>.glb route',()=>{
    for(const model of ['/models/earth.glb','/models/sun-earth-moon.glb'])expect(partsFile.safeParse({...live,model}).success).toBe(true);
    for(const model of ['https://example.com/a.glb','/models/../a.glb','/models/topic/surfaces.glb','/models/a.glb?q=1'])expect(partsFile.safeParse({...live,model}).success).toBe(false);
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
