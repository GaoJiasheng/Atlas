/** Corneal gloss must reach the part shader without replacing the fabric look. */
import { readFileSync } from 'node:fs';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import sharp from 'sharp';
import { BufferGeometry, Mesh, MeshStandardMaterial, Texture } from 'three';
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { gltfSurface } from '../../src/engines/space-scene/stages/model3d/GltfSource';
import { createPartMaterial, fadePartMaterial, stylePartMaterial } from '../../src/engines/space-scene/stages/model3d/materials';
import { resolveMaterialLook } from '../../src/engines/space-scene/lib/color';

let gltf: GLTF;
const albedo = new Texture(), normal = new Texture(), roughness = new Texture();
function styled(theme: 'paper' | 'cinema') {
  const pm = createPartMaterial();
  pm.material.vertexColors = true;
  stylePartMaterial(pm, {
    look: resolveMaterialLook('fabric', {}, theme, '#ffffff'),
    kit: { albedo: () => albedo, normal: () => normal, roughness: () => roughness, dispose() {} },
    signal: '#cc6328', cold: '#4f7f8c', cut: '#b8973c', ink: '#2a2824', rim: .35, tint: .05, hatchPx: 7,
  });
  return pm;
}
beforeAll(async () => {
  vi.stubGlobal('self', globalThis);
  vi.stubGlobal('createImageBitmap', async (blob: Blob) => {
    const decoded = await sharp(Buffer.from(await blob.arrayBuffer())).raw().toBuffer({ resolveWithObject: true });
    return { width: decoded.info.width, height: decoded.info.height, data: decoded.data, close() {} };
  });
  const bytes = readFileSync('public/models/living-things.glb');
  gltf = await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).parseAsync(
    bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), '',
  );
});
afterAll(() => {
  vi.unstubAllGlobals();
  const textures = new Set<Texture>([albedo, normal, roughness]);
  gltf?.scene.traverse(node => {
    if (node instanceof Mesh) {
      node.geometry.dispose();
      for (const material of Array.isArray(node.material) ? node.material : [node.material]) {
        if (material.roughnessMap) textures.add(material.roughnessMap);
        material.dispose();
      }
    }
  });
  textures.forEach(texture => texture.dispose());
});

describe('living-things selective cornea finish', () => {
  it('loads one embedded numeric mask on a separate UV channel, only for the bat', () => {
    const bat = gltf.scene.getObjectByName('fruit-bat') as Mesh;
    const source = bat.material as MeshStandardMaterial, map = source.roughnessMap!;
    expect(source.userData.atlasRoughness).toBe(true);
    expect(map).toBeDefined();
    expect(map.channel).toBe(1);
    expect(map.colorSpace).toBe('');
    expect(map.flipY).toBe(false);
    expect([map.image.width, map.image.height]).toEqual([2, 1]);
    expect(Array.from(map.image.data)).toEqual([235,235,235,20,20,20]);
    const uv = bat.geometry.getAttribute('uv1');
    expect(uv.count).toBe(bat.geometry.getAttribute('position').count);
    let coat = 0, cornea = 0;
    for (let i = 0; i < uv.count; i++) {
      expect(uv.getY(i)).toBeCloseTo(.5, 3);
      const u = uv.getX(i);
      if (u > .5) { cornea++; expect(u).toBeCloseTo(.75, 3); }
      else { coat++; expect(u).toBeCloseTo(.25, 3); }
    }
    expect(coat).toBeGreaterThan(cornea * 5);
    expect(cornea).toBeGreaterThan(100);
    gltf.scene.traverse(node => {
      if (node instanceof Mesh && node !== bat) expect(gltfSurface(node), node.name).toBeUndefined();
    });
  });

  it.each(['paper', 'cinema'] as const)('replaces only roughness and preserves fabric styling, shader and fades on %s', theme => {
    const bat = gltf.scene.getObjectByName('fruit-bat') as Mesh, surface = gltfSurface(bat)!;
    const pm = styled(theme), target = pm.material;
    const before = target.clone(), compile = target.onBeforeCompile, uniforms = pm.uniforms;
    const version = target.version;
    surface.style(target);
    expect(target.version).toBeGreaterThan(version);
    expect(target.roughnessMap).toBe(surface.source.roughnessMap);
    expect(target.map).toBe(albedo);
    expect(target.normalMap).toBe(normal);
    // Every material property except the explicitly replaced map is unchanged.
    const unchangedProperties = (m: MeshStandardMaterial) => Object.fromEntries(
      Object.entries(m.toJSON()).filter(([key]) => !['uuid', 'roughnessMap', 'textures', 'images'].includes(key)),
    );
    expect(unchangedProperties(target)).toEqual(unchangedProperties(before));
    expect(target.onBeforeCompile).toBe(compile);
    expect(pm.uniforms).toBe(uniforms);
    expect(target.roughness * 20 / 255).toBeCloseTo(.0753, 3);
    expect(target.roughness * 235 / 255).toBeCloseTo(.8847, 3);
    for (const ghost of [false, true]) for (const opacity of [0, .4, 1]) {
      surface.fade(target, opacity, ghost);
      fadePartMaterial(before, opacity, ghost);
      expect([target.opacity, target.transparent, target.depthWrite, target.forceSinglePass])
        .toEqual([before.opacity, before.transparent, before.depthWrite, before.forceSinglePass]);
    }
    target.dispose(); before.dispose();
  });

  it.each([undefined, false, 'true', 1])('leaves an unflagged source with a roughness map on the exact legacy path (%s)', flag => {
    const source = new MeshStandardMaterial({ roughnessMap: roughness, map: albedo, normalMap: normal });
    if (flag !== undefined) source.userData.atlasRoughness = flag;
    const mesh = new Mesh(new BufferGeometry(), source);
    const before = source.toJSON();
    expect(gltfSurface(mesh)).toBeUndefined();
    expect(source.toJSON()).toEqual(before);
    // Existing atlasSurface assets still take their established colour-map path.
    source.userData.atlasSurface = true;
    const pm = styled('paper');
    gltfSurface(mesh)!.style(pm.material);
    expect(pm.material.map).toBe(albedo);
    expect(pm.material.normalMap).toBeNull();
    expect(pm.material.roughnessMap).toBeNull();
    expect(pm.material.roughness).toBe(source.roughness);
    mesh.geometry.dispose(); source.dispose(); pm.material.dispose();
  });

  it('requires an actual roughness texture even when opted in', () => {
    const source = new MeshStandardMaterial();
    source.userData.atlasRoughness = true;
    const mesh = new Mesh(new BufferGeometry(), source);
    expect(gltfSurface(mesh)).toBeUndefined();
    mesh.geometry.dispose(); source.dispose();
  });
});
