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
import { aces, luminance, toLinear, mappedOrbitLight, type RGB } from '../../scripts/geo/sun-earth-moon/night-fill';
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
    expect(shader.fragmentShader).toMatch(/#ifdef USE_MAP\nif \(uOrbitLight < 1.5\) outgoingLight = [^;]+;\n#endif/);
    expect(shader.fragmentShader).toContain('#include <lights_physical_fragment>');
    expect(shader.fragmentShader).toContain('outgoingLight = diffuseColor.rgb * gain + totalEmissiveRadiance;');
    pm.material.dispose();
  });
  it('separates the cinema night surface from the actual plate token, preserving paper and the direct-Sun term',()=>{
    const pm=createPartMaterial();
    const shader={uniforms:UniformsUtils.clone(ShaderLib.standard.uniforms),vertexShader:ShaderLib.standard.vertexShader,fragmentShader:ShaderLib.standard.fragmentShader} as Parameters<typeof pm.material.onBeforeCompile>[0];
    pm.material.onBeforeCompile(shader,{} as WebGLRenderer);
    // Evaluate the emitted GLSL expression, rather than a duplicate fill formula.
    const light=mappedOrbitLight(shader.fragmentShader);
    const css=readFileSync('src/theme/tokens.css','utf8');
    const themes=[css.split(':root[data-theme="cinema"]')[0]!,css.split(':root[data-theme="cinema"]')[1]!];
    const token=(theme:string,key:string):RGB=>{
      const hex=new RegExp(`--${key}: #([a-f0-9]{6});`).exec(theme)![1]!;
      return [0,2,4].map(i=>toLinear(parseInt(hex.slice(i,i+2),16)/255)) as RGB;
    };
    expect(token(themes[0]!,'ink')[0]).toBeLessThan(.5);
    expect(token(themes[1]!,'ink')[0]).toBeGreaterThan(.5);
    const plate=luminance(token(themes[1]!,'paper'));
    const contrast=(y:number)=>(y+.05)/(plate+.05);
    const before=luminance(aces([.05,.05,.05],1));
    expect(contrast(before)).toBeLessThan(1.3);
    // Screen-area-weighted normals across a night disc; includes the dark
    // ocean and bright lunar highlands without inventing city-light textures.
    for(const albedo of [[.03,.06,.07],[.45,.43,.4]] as RGB[]){
      let mean=0;
      for(let i=0;i<200;i++){
        const mu=Math.sqrt(1-(i+.5)/200);
        mean+=luminance(aces(light(albedo,0,mu,true),1))/200;
        for(const day of [0,.001,.1,.5,1]){
          const paper=albedo.map(v=>.05*(1-day)+v*day) as RGB;
          expect(light(albedo,day,mu,false)).toEqual(paper);
        }
      }
      expect(contrast(mean)).toBeGreaterThan(1.9);
      expect(mean).toBeLessThan(.12); // still a dark surface, not a lit grey day
      expect(light(albedo,1,.6,true)).toEqual(albedo);
      expect(light(albedo,0,.6,true,0)).toEqual([0,0,0]);
      expect(luminance(light(albedo,0,1,true))).toBeGreaterThan(luminance(light(albedo,0,0,true)));
    }
    // Shader scope: PBR (uOrbitLight=0), self-lit Sun (=2), and untextured
    // analytic bodies retain the old paths, including the exact Lambert dot.
    expect(shader.fragmentShader).toContain('if (uOrbitLight > 0.5) {');
    expect(shader.fragmentShader).toContain('float day = max(0.0,dot(inverseTransformDirection(normalize(vNormal),viewMatrix),uOrbitSun));');
    expect(shader.fragmentShader).toContain('outgoingLight = diffuseColor.rgb * (uOrbitLight > 1.5 ? 1.0 : uOrbitFill + (1.0-uOrbitFill)*day);');
    expect(readFileSync('src/content/topics/solar-system/data/parts.json','utf8')).not.toContain('solarIllumination');
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
