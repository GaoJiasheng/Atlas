import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { Box3, Vector3, type Mesh } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'meshoptimizer';
import { glbLabelPoint } from '../../src/engines/space-scene/stages/model3d/glbAnchor';

// extras.labelPoint is node-local, and meshopt quantization folds a dequantize
// scale and offset into the node, so the bake must re-express the point after
// quantizing (same bug class as the B200 leaders).
describe('light-and-shadows courtyard label point', () => {
  it('lands on the paving top at the courtyard centre', async () => {
    await MeshoptDecoder.ready;
    const bytes = readFileSync('public/models/light-and-shadows.glb');
    const gltf = await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).parseAsync(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), '');
    gltf.scene.updateMatrixWorld(true);
    const court = gltf.scene.getObjectByName('courtyard') as Mesh;
    const p = new Vector3(...glbLabelPoint(court)!);
    expect(p.distanceTo(new Vector3(10, 0.05, 0))).toBeLessThan(1e-3);
    expect(new Box3().setFromObject(court).expandByScalar(0.001).containsPoint(p)).toBe(true);
  });
});
