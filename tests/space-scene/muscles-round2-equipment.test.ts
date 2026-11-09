import fs from 'node:fs';
import { describe, expect, it } from 'vitest';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { Mesh, Vector3 } from 'three';

async function asset(name: string) {
  const bytes=fs.readFileSync(`public/models/${name}.glb`);
  expect(bytes.length).toBeLessThanOrEqual(1_500_000);
  return new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
}
describe('muscles round two runtime equipment assets',()=>{
  it('decodes every actual runtime mesh with complete finite vertex buffers and valid indices',async()=>{
    for(const file of ['muscles-core-gym','muscles-back-pulldown','muscles-core-linea']){
      const gltf=await asset(file);let count=0;
      gltf.scene.traverse(o=>{if(!(o instanceof Mesh))return;count++;
        const g=o.geometry,p=g.getAttribute('position'),n=g.getAttribute('normal');
        expect(n.count).toBe(p.count);expect(Array.from(p.array).every(Number.isFinite)).toBe(true);expect(Array.from(n.array).every(Number.isFinite)).toBe(true);
        expect(g.index).not.toBeNull();expect(Array.from(g.index!.array as ArrayLike<number>).every(i=>i>=0&&i<p.count)).toBe(true);
        for(let i=0;i<n.count;i++)expect(new Vector3().fromBufferAttribute(n,i).length()).toBeGreaterThan(.9);
      });expect(count).toBeGreaterThan(0);
    }
  });
  it('keeps rack height fitting in its saved vertex weights, with the liner exactly 14mm below the bar',async()=>{
    const gltf=await asset('muscles-core-gym');gltf.scene.updateMatrixWorld(true);
    const mesh=gltf.scene.getObjectByName('rack') as Mesh,g=mesh.geometry.clone().applyMatrix4(mesh.matrixWorld),p=g.getAttribute('position'),fit=g.getAttribute('_fit');
    expect(fit.count).toBe(p.count);
    for(const height of [.8,1.3,1.65]){
      let linerTop=-Infinity;
      for(let i=0;i<p.count;i++)if(Math.abs(Math.abs(p.getX(i))-.6)<.0291&&Math.abs(p.getZ(i)+.002)<.0276&&p.getY(i)>.97&&p.getY(i)<.99){
        expect(fit.getX(i)).toBeCloseTo(1,4);linerTop=Math.max(linerTop,p.getY(i)+(height-1)*fit.getX(i));
      }
      expect(linerTop).toBeCloseTo(height-.014,3);
    }
  });
  it('keeps build-time factories out of both executing equipment modules',()=>{
    for(const file of ['src/engines/space-scene/lib/equipment.ts','src/engines/space-scene/stages/model3d/Equipment.tsx'])expect(fs.readFileSync(file,'utf8')).not.toMatch(/from\s+['"][^'"]*scripts\//);
    expect(fs.readFileSync('src/engines/space-scene/stages/model3d/Equipment.tsx','utf8')).not.toContain('createPartMaterial');
  });
});
