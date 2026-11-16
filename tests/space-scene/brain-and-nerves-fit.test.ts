/**
 * brain-and-nerves model fit (docs/75 §15.8), measured on the published GLB: no cerebrum vertex inside the
 * skull, nor of the plain core drawn inside it (exact signed distance, scripts/anatomy/brain-nerves/penetration.ts); the reflex pose turns about the
 * measured elbow hinge; the cerebellum's drawn folds stay inside its triangle budget.
 */
import { readFileSync } from 'node:fs';
import { NodeIO, type Node } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dequantize } from '@gltf-transform/functions';
import { MeshoptDecoder } from 'meshoptimizer';
import { Euler, Matrix4, Quaternion, Vector3 } from 'three';
import { beforeAll, describe, expect, it } from 'vitest';
import { penetration } from '../../scripts/anatomy/brain-nerves/penetration';

const CORTEX = /^(frontal|parietal|temporal|occipital)-lobe\.[lr]$|^insula\.[lr]$|^cerebrum-medial\.[lr]$|^cerebrum-core\.[lr]$/;
let nodes: Node[] = [];

/** World-space positions and indices of a mesh node. */
function mesh(name: string): { positions: Float64Array; indices: Uint32Array } {
  const node = nodes.find((n) => n.getName() === name)!;
  const prim = node.getMesh()!.listPrimitives()[0]!;
  const pos = prim.getAttribute('POSITION')!;
  const m = new Matrix4().fromArray(node.getWorldMatrix());
  const out = new Float64Array(pos.getCount() * 3);
  const v = new Vector3();
  for (let i = 0; i < pos.getCount(); i++) {
    v.fromArray(pos.getElement(i, [])).applyMatrix4(m);
    out.set([v.x, v.y, v.z], 3 * i);
  }
  return { positions: out, indices: Uint32Array.from(prim.getIndices()!.getArray()!) };
}

beforeAll(async () => {
  await MeshoptDecoder.ready;
  const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder });
  const doc = await io.read('public/models/brain-and-nerves.glb');
  await doc.transform(dequantize());
  nodes = doc.getRoot().listNodes().filter((n) => n.getMesh());
});

describe('brain-and-nerves model fit', () => {
  it('no cerebrum vertex is inside the skull', { timeout: 60_000 }, () => {
    const skull = mesh('skull');
    const names = nodes.map((n) => n.getName()).filter((n) => CORTEX.test(n));
    expect(names).toHaveLength(14);
    let total = 0;
    const inside: string[] = [];
    for (const name of names) {
      const { positions } = mesh(name);
      const { signed } = penetration(positions, skull.positions, skull.indices);
      total += signed.length;
      signed.forEach((s, i) => {
        if (s < 0) inside.push(`${name}#${i} ${(s * 1000).toFixed(2)} mm`);
      });
    }
    expect(total).toBeGreaterThan(50_000);
    expect(inside).toEqual([]);
  });

  it('the withdrawn pose turns 20° about the measured elbow hinge', () => {
    const elbow = JSON.parse(readFileSync('scripts/anatomy/brain-nerves/landmarks.json', 'utf8')).elbow as { flexionAxis: number[] };
    const parts = JSON.parse(readFileSync('src/content/topics/brain-and-nerves/data/parts.json', 'utf8'));
    for (const id of ['forearm-hand-r', 'arm-nerves-forearm']) {
      const r = parts.poses.withdrawn[id].rotation as [number, number, number];
      const q = new Quaternion().setFromEuler(new Euler(...r.map((d) => (d * Math.PI) / 180) as [number, number, number], 'XYZ'));
      const angle = (2 * Math.acos(Math.min(1, Math.abs(q.w))) * 180) / Math.PI;
      const axis = new Vector3(q.x, q.y, q.z).normalize().multiplyScalar(Math.sign(q.w));
      expect(angle).toBeCloseTo(20, 1);
      expect(axis.angleTo(new Vector3(...elbow.flexionAxis).normalize()) * (180 / Math.PI)).toBeLessThan(0.1);
    }
  });

  it('the cerebellum with its drawn folds stays within its budget', () => {
    const { indices } = mesh('cerebellum');
    expect(indices.length / 3).toBeGreaterThan(20_000);
    expect(indices.length / 3).toBeLessThanOrEqual(30_000);
  });
});
