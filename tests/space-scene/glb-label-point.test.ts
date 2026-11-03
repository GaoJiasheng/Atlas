import { describe, expect, it } from 'vitest';
import { BufferGeometry, Group, Mesh } from 'three';
import { boxAnchor, glbLabelPoint } from '../../src/engines/space-scene/stages/model3d/glbAnchor';
import type { Box3Like } from '../../src/engines/space-scene/lib/parts';

const box: Box3Like = { min: [0, 0, 0], max: [2, 4, 6] };

describe('glb extras.labelPoint', () => {
  it('reads a node-local point into scene coordinates', () => {
    const root = new Group();
    root.position.set(10, 0, 0);
    const mesh = new Mesh(new BufferGeometry());
    mesh.position.set(0, 1, 0);
    mesh.scale.setScalar(2);
    mesh.userData.labelPoint = [1, 0, -1];
    root.add(mesh);
    root.updateMatrixWorld(true);
    expect(glbLabelPoint(mesh)).toEqual([12, 1, -2]);
  });

  it('reads the point from the parent node of a multi-primitive mesh', () => {
    const node = new Group();
    node.position.set(0, 0, 5);
    node.userData.labelPoint = [0, 1, 0];
    const mesh = new Mesh(new BufferGeometry());
    node.add(mesh);
    expect(glbLabelPoint(mesh)).toEqual([0, 1, 5]);
  });

  it('ignores a missing or malformed point', () => {
    const mesh = new Mesh(new BufferGeometry());
    expect(glbLabelPoint(mesh)).toBeNull();
    for (const bad of [[1, 2], [1, 2, 'x'], [1, 2, Number.NaN], 'centre', { x: 1 }]) {
      mesh.userData.labelPoint = bad;
      expect(glbLabelPoint(mesh)).toBeNull();
    }
  });

  it('keeps the bounds centre without a point and moves only the leader end with one', () => {
    const plain = boxAnchor(box, [1, 1, 1]);
    expect(plain).toEqual({ offset: [0, 1, 2], point: [0, 1, 2], half: [1, 2, 3], radius: Math.hypot(1, 2, 3) * 0.75 });
    const pointed = boxAnchor(box, [1, 1, 1], [2, 0, 6]);
    expect(pointed.point).toEqual([1, -1, 5]);
    // Bounds, on-screen box and radius are unchanged: HUD framing and occlusion keep the measured extents.
    expect({ ...pointed, point: plain.point }).toEqual(plain);
  });
});
