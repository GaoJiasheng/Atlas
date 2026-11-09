/** Regressions against the actual shipped meshopt asset and production loader.
 * Visual similarity is assessed with comparison sheets, not claimed by tests. */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import { Box3, Mesh, MeshStandardMaterial, PropertyBinding, Raycaster, Triangle, Vector3 } from 'three';
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { partsFile } from '../../src/engines/space-scene/schema';
import { gltfSurface } from '../../src/engines/space-scene/stages/model3d/GltfSource';
import { glbLabelPoint } from '../../src/engines/space-scene/stages/model3d/glbAnchor';
import {anatomySource} from '../../scripts/geo/digestive-system/anatomy-source';
import baseline from '../../scripts/geo/digestive-system/baseline-contract.json';

const ROOT = join(import.meta.dirname, '../..');
const original = anatomySource();
const partsRaw = JSON.parse(readFileSync(join(ROOT, 'src/content/topics/digestive-system/data/parts.json'), 'utf8'));
const parts = partsFile.parse(partsRaw);
const rebuilt = readFileSync(join(ROOT, `public${parts.model}`));
const IDS = ['tooth-section', 'stomach-wall', 'villi-block', 'villi-field'];
// Independent container parsing deliberately does not import the append writer.
function chunks(bytes: Buffer) {
  expect(bytes.readUInt32LE(0)).toBe(0x46546c67);
  expect(bytes.readUInt32LE(4)).toBe(2);
  expect(bytes.readUInt32LE(8)).toBe(bytes.length);
  const entries = new Map<number, Buffer>();
  for (let offset = 12; offset < bytes.length;) {
    const length = bytes.readUInt32LE(offset), kind = bytes.readUInt32LE(offset + 4);
    entries.set(kind, bytes.subarray(offset + 8, offset + 8 + length)); offset += length + 8;
  }
  return { json: JSON.parse(entries.get(0x4e4f534a)!.toString()), bin: entries.get(0x004e4942)! };
}
const canonical = (value: unknown): unknown => Array.isArray(value) ? value.map(canonical) : value && typeof value === 'object' ? Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => [k, canonical(v)])) : value;
const hash = (value: unknown) => createHash('sha256').update(JSON.stringify(canonical(value))).digest('hex');
const preservedPart = (part: Record<string, unknown>) => Object.fromEntries(Object.entries(part).filter(([key]) => !(IDS.includes(part.id as string) && ['primitive', 'extra', 'mesh', 'material'].includes(key)) && !(['tooth-section', 'villi-field'].includes(part.id as string) && key === 'detail')));
let loaded: GLTF;
beforeAll(async () => {
  // The exact loader/decoder imports used by runtime GltfSource; no browser.
  loaded = await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).parseAsync(new Uint8Array(rebuilt).buffer, '');
  loaded.scene.updateMatrixWorld(true);
}, 60000);
function mesh(id: string): Mesh {
  const found = loaded.scene.getObjectByName(PropertyBinding.sanitizeNodeName(id)) as Mesh;
  expect(found?.isMesh, id).toBe(true); return found;
}

describe('digestive rebuild: source anatomy and teaching contract', () => {
  it('retains the entire original anatomy BIN and every original JSON entry', () => {
    const old = chunks(original), next = chunks(rebuilt);
    expect(next.bin.subarray(0, old.bin.length).equals(old.bin)).toBe(true);
    for (const key of ['nodes', 'accessors', 'bufferViews', 'meshes', 'materials']) expect(next.json[key].slice(0, old.json[key].length), key).toEqual(old.json[key]);
    expect(next.json.asset.copyright).toBe(old.json.asset.copyright);
    expect(next.json.scenes[old.json.scene ?? 0].nodes.slice(0, old.json.scenes[old.json.scene ?? 0].nodes.length)).toEqual(old.json.scenes[old.json.scene ?? 0].nodes);
    expect(rebuilt.length - original.length).toBeLessThanOrEqual(1_500_000);
  });
  it('keeps every part id, its teaching/behavior metadata and topic configuration', () => {
    expect(partsRaw.parts.map((p: { id: string }) => p.id)).toEqual(baseline.partOrder);
    for (const part of partsRaw.parts) expect(hash(preservedPart(part)), part.id).toBe(baseline.parts[part.id as keyof typeof baseline.parts]);
    expect(hash(Object.fromEntries(Object.entries(partsRaw).filter(([k]) => !['model', 'parts'].includes(k))))).toBe(baseline.configuration);
    const field=parts.parts.find(p=>p.id==='villi-field')!;
    expect(field.detail!.en).toContain('200 square metres'); expect(field.detail!.en).toContain('32 square metres');
    expect(field.detail!.en).toContain('not measured under a microscope'); expect(field.detail!.zh).toContain('不是在显微镜下量出来的');
    for (const id of IDS) {
      const part = parts.parts.find(p => p.id === id)!;
      expect(part.mesh).toBe(id); expect(part.primitive).toBeUndefined(); expect(part.extra).toBeUndefined();
    }
  });
});

describe('digestive rebuild: production decoder and runtime surface contract', () => {
  it('decodes all four independent COLOR_0 sculptures through the actual atlasSurface hook', () => {
    for (const id of IDS) {
      const node = mesh(id), geometry = node.geometry, material = node.material as MeshStandardMaterial;
      expect(material.userData.atlasSurface, id).toBe(true);
      expect(material.vertexColors).toBe(true);
      expect(geometry.getAttribute('color').count).toBe(geometry.getAttribute('position').count);
      const source = gltfSurface(node); expect(source, id).toBeDefined();
      const target = new MeshStandardMaterial({ roughness: .99, metalness: .99, color: '#e0d6bf' });
      const expectedColor = target.color.clone().multiply(material.color); source!.style(target);
      expect(target.color.toArray()).toEqual(expectedColor.toArray());
      expect(target.vertexColors).toBe(true); expect(target.roughness).toBe(material.roughness); expect(target.metalness).toBe(0);
      expect(target.normalMap).toBeNull(); expect(target.roughnessMap).toBeNull();
      expect(node.userData.closed).toBe(false); // Explicit teaching section: no fake engine cut caps.
      target.dispose();
    }
  });
  it('has finite positions, unit normals and bounded token-relative vertex colors', () => {
    for (const id of IDS) {
      const geometry = mesh(id).geometry, position = geometry.getAttribute('position'), normals = geometry.getAttribute('normal'), colors = geometry.getAttribute('color');
      expect(position.count).toBeGreaterThan(100); expect(normals.count).toBe(position.count);
      for (const attribute of [position, normals, colors]) expect(Array.from(attribute.array).every(Number.isFinite), id).toBe(true);
      let min = Infinity, max = 0, minColor = Infinity, maxColor = 0;
      for (let i = 0; i < position.count; i++) {
        const length = Math.hypot(normals.getX(i), normals.getY(i), normals.getZ(i)); min = Math.min(min, length); max = Math.max(max, length);
        minColor = Math.min(minColor, colors.getX(i), colors.getY(i), colors.getZ(i)); maxColor = Math.max(maxColor, colors.getX(i), colors.getY(i), colors.getZ(i));
      }
      expect(min, id).toBeGreaterThan(.90); expect(max, id).toBeLessThan(1.10);
      expect(minColor).toBeGreaterThanOrEqual(0); expect(maxColor).toBeLessThanOrEqual(1.001);
    }
  });
  it('anchors each leader on visible specimen geometry after the quantization transform', () => {
    const triangle = new Triangle(), point = new Vector3();
    for (const id of IDS) {
      const node = mesh(id), anchor = glbLabelPoint(node); expect(anchor, id).not.toBeNull();
      expect(anchor!.every(Number.isFinite)).toBe(true);
      const label = new Vector3(...anchor!), geometry = node.geometry, positions = geometry.getAttribute('position'), indices = geometry.index;
      let nearest = Infinity;
      for (let i = 0; i < (indices?.count ?? positions.count); i += 3) {
        const vertices = [triangle.a, triangle.b, triangle.c];
        for (let k = 0; k < 3; k++) vertices[k]!.fromBufferAttribute(positions, indices ? indices.getX(i + k) : i + k).applyMatrix4(node.matrixWorld);
        if (triangle.getArea() < 1e-14) continue; // Quantization can collapse a tiny triangle.
        triangle.closestPointToPoint(label, point); nearest = Math.min(nearest, point.distanceTo(label));
      }
      expect(nearest, `${id} label distance from actual triangle surface`).toBeLessThan(.004);
      const origin = label.clone().add(new Vector3(0, .008, .3)), ray = new Raycaster(origin, label.clone().sub(origin).normalize());
      const hit = ray.intersectObject(node, false)[0]; expect(hit, `${id} front-facing anchor hit`).toBeDefined();
      expect(hit!.point.distanceTo(label), `${id} label hidden behind tissue`).toBeLessThan(.008);
    }
  });
  it('keeps the exposed basal front face clean below the cut villus', () => {
    const node = mesh('villi-block'), colors = node.geometry.getAttribute('color');
    const reference = new Vector3(), sampled = new Vector3(), barycentric = new Vector3();
    const triangle = new Triangle(), local = new Vector3();
    const sample = (x: number, y: number, target: Vector3) => {
      const ray = new Raycaster(new Vector3(x, y, .20), new Vector3(0, 0, -1));
      const hit = ray.intersectObject(node, false)[0];
      expect(hit, `basal front face at ${x},${y}`).toBeDefined();
      const face = hit!.face!, positions = node.geometry.getAttribute('position');
      triangle.a.fromBufferAttribute(positions, face.a);
      triangle.b.fromBufferAttribute(positions, face.b);
      triangle.c.fromBufferAttribute(positions, face.c);
      node.worldToLocal(local.copy(hit!.point)); triangle.getBarycoord(local, barycentric);
      target.set(0, 0, 0);
      for (const [index, weight] of [[face.a, barycentric.x], [face.b, barycentric.y], [face.c, barycentric.z]]) {
        target.addScaledVector(new Vector3(colors.getX(index!), colors.getY(index!), colors.getZ(index!)), weight!);
      }
    };
    sample(.895, -.003, reference);
    // Test the rendered surface, not just the authored path: the old basal
    // blood approaches pierced this region as a pair of dark crescents.
    for (let x = .900; x <= .9801; x += .001) for (let y = -.007; y <= .0071; y += .001) {
      sample(x, y, sampled);
      expect(sampled.distanceTo(reference), `exposed basal vessel at ${x},${y}`).toBeLessThan(.004);
    }
  });
  it('keeps every authored selectable part together below the 350k triangle budget', () => {
    let triangles = 0;
    for (const part of parts.parts) {
      expect(part.mesh).toBeDefined();
      const node = mesh(part.mesh!), geometry = node.geometry;
      triangles += (geometry.index?.count ?? geometry.getAttribute('position').count) / 3;
      const bounds = new Box3().setFromObject(node); expect([...bounds.min.toArray(), ...bounds.max.toArray()].every(Number.isFinite), part.id).toBe(true);
    }
    expect(triangles).toBeLessThanOrEqual(350_000);
  });
});
