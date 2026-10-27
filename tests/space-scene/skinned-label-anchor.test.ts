import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';
import { Box3, DetachedBindMode, Matrix4, Object3D, PropertyBinding, Quaternion, SkinnedMesh, Vector3 } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'meshoptimizer';
import { updateSkinAnchor } from '../../src/engines/space-scene/stages/model3d/skinAnchor';
import { anglesQuat } from '../../src/engines/space-scene/lib/rig';
import type { Vec3 } from '../../src/engines/space-scene/lib/math';

describe('skinned label anchors on a snapped elbow-only deep link', () => {
  it('projects the final ulna anchor on the next demand frame, with no later bone motion', async () => {
    const bytes = readFileSync('public/models/muscles-arms.glb');
    const gltf = await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).parseAsync(
      bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer, '',
    );
    const mesh = gltf.scene.getObjectByName('ulnal') as SkinnedMesh;
    expect(mesh?.isSkinnedMesh).toBe(true);
    mesh.bindMode = DetachedBindMode;
    gltf.scene.updateMatrixWorld(true);
    const samples = Array.from({ length: mesh.geometry.getAttribute('position').count }, (_, i) => i);
    const anchor = { point: [0,0,0] as Vec3, offset: [0,0,0] as Vec3, half: [0,0,0] as Vec3 };
    const position = new Vector3();
    updateSkinAnchor(mesh, samples, new Matrix4(), position, anchor, () => {});
    const rest = new Vector3(...anchor.point);

    // The same elbow-only flexion used by muscles-arms ch04/b1. All other
    // joints stay at rest; no root turn or continuing animation wakes labels.
    const data = JSON.parse(readFileSync('src/content/topics/muscles-arms/data/parts.json', 'utf8'));
    const spec = data.rig.joints['elbow.l'];
    const elbow = gltf.scene.getObjectByName(PropertyBinding.sanitizeNodeName(spec.node)) as Object3D;
    const axes = Object.fromEntries(Object.entries(spec.axes).map(([name, axis]) => {
      const v = new Vector3(...axis as Vec3).applyQuaternion(elbow.parent!.getWorldQuaternion(new Quaternion()).invert());
      return [name, v.toArray()];
    }));
    const pose = new Quaternion(...anglesQuat(axes, { flexion: data.poses['elbow-flexed']['joint:elbow.l'].flexion }));
    elbow.quaternion.premultiply(pose);
    gltf.scene.updateMatrixWorld(true);
    const savedRotation = elbow.quaternion.clone();
    const expected = new Box3();
    const v = new Vector3();
    for (const i of samples) expected.expandByPoint(mesh.getVertexPosition(i,v).applyMatrix4(mesh.matrixWorld));
    const centre = expected.getCenter(new Vector3());
    expect(centre.distanceTo(rest)).toBeGreaterThan(.1);

    // Labels run first, then the last sampled PartNode update (frame 6).
    // Only an explicit invalidation can let the label probe see that update.
    let screenAnchor = rest.clone();
    const frames: (() => void)[] = [];
    const invalidate = vi.fn(() => frames.push(() => { screenAnchor = new Vector3(...anchor.point); }));
    updateSkinAnchor(mesh, samples, new Matrix4(), position, anchor, invalidate);
    expect(screenAnchor.distanceTo(rest)).toBe(0);
    expect(invalidate).toHaveBeenCalledOnce();
    frames.shift()!();
    expect(screenAnchor.distanceTo(centre)).toBeLessThan(1e-10);
    expect(anchor.offset).toEqual(anchor.point);
    expect(new Vector3(...anchor.half).distanceTo(expected.getSize(v).multiplyScalar(.5))).toBeLessThan(1e-10);
    expect(elbow.quaternion.equals(savedRotation)).toBe(true);
    mesh.geometry.dispose();
  });
});
