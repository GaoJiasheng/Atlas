import { readFileSync } from 'node:fs';
import { beforeAll, describe, expect, it } from 'vitest';
import { Box3, Mesh, Raycaster, Vector3, type Object3D } from 'three';
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'meshoptimizer';
import { glbLabelPoint } from '../../src/engines/space-scene/stages/model3d/glbAnchor';

// extras.labelPoint is node-local; the quantized b200 nodes each have their own
// frame, so a point written in scene coordinates lands somewhere else (it put
// the GPU and NVSwitch leaders above the chips cutaway, which hid both labels).
const parts = JSON.parse(readFileSync('src/content/topics/b200-server/data/parts.json', 'utf8')) as {
  model: string;
  views: { cuts: Record<string, { normal: number[]; offset: number }> };
};
let gltf: GLTF;
const meshes = (): Mesh[] => {
  const out: Mesh[] = [];
  gltf.scene.traverse((o: Object3D) => {
    if ((o as Mesh).isMesh && glbLabelPoint(o)) out.push(o as Mesh);
  });
  return out;
};

describe('B200 leader-label points', () => {
  beforeAll(async () => {
    await MeshoptDecoder.ready;
    const bytes = readFileSync(`public${parts.model}`);
    gltf = await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).parseAsync(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), '');
    gltf.scene.updateMatrixWorld(true);
  });

  it('puts every label point inside its own part', () => {
    const list = meshes();
    expect(list.length).toBeGreaterThan(10);
    for (const m of list) {
      const box = new Box3().setFromObject(m).expandByScalar(0.001);
      expect(box.containsPoint(new Vector3(...glbLabelPoint(m)!)), m.name).toBe(true);
    }
  });

  it('keeps the repeated-part leaders on a copy that the chips and side cuts keep', () => {
    // A cut keeps points with normal · p + offset ≥ 0.
    const kept = (cut: { normal: number[]; offset: number }, p: Vector3) => new Vector3(...cut.normal).dot(p) + cut.offset >= 0;
    for (const id of ['gpu-modules', 'nvswitch-chips', 'power-cords', 'cpus']) {
      const m = gltf.scene.getObjectByName(id) as Mesh;
      const p = new Vector3(...glbLabelPoint(m)!);
      expect(kept(parts.views.cuts.side!, p), `${id} side`).toBe(true);
      if (id === 'gpu-modules' || id === 'nvswitch-chips') expect(kept(parts.views.cuts.chips!, p), `${id} chips`).toBe(true);
      expect(new Raycaster(new Vector3(p.x, 0.6, p.z), new Vector3(0, -1, 0)).intersectObject(m, false).length, id).toBeGreaterThan(0);
    }
  });
});
