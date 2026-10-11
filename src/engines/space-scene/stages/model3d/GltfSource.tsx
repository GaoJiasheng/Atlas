/**
 * Loads a topic's glb and hands back a PartShape per named node, plus the
 * skeleton (docs/06 §SpaceScene "Real meshes and human muscles"). Lazy-loaded:
 * only topics with `mesh` parts pay for the GLTF loader.
 *
 *  - three's own GLTFLoader with the meshopt decoder (`EXT_meshopt_compression`;
 *    an inline WebAssembly module, nothing is fetched) and native
 *    `KHR_mesh_quantization`. Draco stays off: its decoder lives on a CDN and
 *    Atlas makes no runtime network requests.
 *  - progress (bytes) and failure go to the engine UI store; the stage draws
 *    the hairline progress bar and the bilingual failure note.
 *  - the scene is cloned (SkeletonUtils, so skinned meshes bind to the copy's
 *    bones); the meshes are taken out and drawn by PartNode (one material and
 *    one draw call per part, skinned where the glb skins them); what is left,
 *    the bone hierarchy, is mounted by the stage so the bones' world matrices
 *    stay current for skinning, the rig, sites and equipment.
 *  - per part: the rest transform, scene-space bounds (label anchor, stage
 *    bounds), `extras.closed` (false: the cut leaves it open), and for muscles
 *    with `_U` / `_FIBRE` the fibre length and belly thickness the
 *    contraction shader needs (the attributes are renamed `atlasU` /
 *    `atlasFibre`, the names the shader reads).
 */
import { useEffect } from 'react';
import { useLoader } from '@react-three/fiber';
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { Box3, PropertyBinding, Quaternion, Vector3, type BufferGeometry, type Mesh, type Object3D, type Skeleton, type SkinnedMesh } from 'three';
import type { SpaceUiStore } from '../../ui';
import type { PartShape } from './PartNode';

/** The skeleton left after the meshes were taken out, and a node by its glb name. */
export interface GltfRig {
  root: Object3D;
  node(name: string): Object3D | null;
}

/** three's GLTFLoader strips `.`, `:`, `/`, `[`, `]` from node names (`pec.l` → `pecl`): look names up the same way. */
const loaded = (name: string) => PropertyBinding.sanitizeNodeName(name);

function findMesh(node: Object3D | undefined): Mesh | null {
  if (!node) return null;
  if ((node as Mesh).isMesh) return node as Mesh;
  let found: Mesh | null = null;
  node.traverse((o) => {
    if (!found && (o as Mesh).isMesh) found = o as Mesh;
  });
  return found;
}

const _v = new Vector3();
const _a = new Vector3();
const _b = new Vector3();

/**
 * Fibre length (origin end → insertion end, mesh units) and belly thickness
 * (mean distance of the vertices from that line) of a muscle with `atlasU`.
 */
export function fibreMeasure(geometry: BufferGeometry): { length: number; thickness: number } | null {
  const u = geometry.getAttribute('atlasU');
  const pos = geometry.getAttribute('position');
  if (!u || !pos || !geometry.getAttribute('atlasFibre')) return null;
  const lo = new Vector3();
  const hi = new Vector3();
  let nLo = 0;
  let nHi = 0;
  for (let i = 0; i < pos.count; i++) {
    const t = u.getX(i);
    if (t < 0.12) {
      lo.add(_v.fromBufferAttribute(pos, i));
      nLo++;
    } else if (t > 0.88) {
      hi.add(_v.fromBufferAttribute(pos, i));
      nHi++;
    }
  }
  if (nLo === 0 || nHi === 0) return null;
  lo.divideScalar(nLo);
  hi.divideScalar(nHi);
  const length = lo.distanceTo(hi);
  if (length <= 0) return null;
  _a.subVectors(hi, lo).normalize();
  let sum = 0;
  const step = Math.max(1, Math.floor(pos.count / 512));
  let n = 0;
  for (let i = 0; i < pos.count; i += step) {
    _b.fromBufferAttribute(pos, i).sub(lo);
    sum += _b.sub(_v.copy(_a).multiplyScalar(_b.dot(_a))).length();
    n++;
  }
  return { length, thickness: n > 0 ? sum / n : 0 };
}

/** Rename the pipeline's custom attributes (`_U` → `_u` by the loader) to the shader's names. */
function adoptFibreAttributes(geometry: BufferGeometry): void {
  for (const [from, to] of [
    ['_u', 'atlasU'],
    ['_fibre', 'atlasFibre'],
  ] as const) {
    const attr = geometry.getAttribute(from);
    if (attr && !geometry.getAttribute(to)) {
      geometry.setAttribute(to, attr);
      geometry.deleteAttribute(from);
    }
  }
}

/** Skeletons with the same bones and inverses are one (each clone gets its own copy). */
function shareSkeleton(cache: Skeleton[], skeleton: Skeleton): Skeleton {
  for (const s of cache) {
    if (s.bones.length !== skeleton.bones.length) continue;
    if (s.bones.every((b, i) => b === skeleton.bones[i]) && s.boneInverses.every((m, i) => m.equals(skeleton.boneInverses[i]!))) return s;
  }
  cache.push(skeleton);
  return skeleton;
}

function skinOf(cache: Skeleton[], mesh: SkinnedMesh): NonNullable<PartShape['pieces'][number]['skin']> {
  const skeleton = shareSkeleton(cache, mesh.skeleton);
  return { skeleton, bindMatrix: mesh.bindMatrix.clone(), boneRest: skeleton.bones.map((b) => b.matrixWorld.clone()) };
}

export default function GltfSource({
  url,
  meshes,
  ui,
  onShapes,
}: {
  url: string;
  /** part id -> node name in the glb */
  meshes: ReadonlyMap<string, string>;
  ui: SpaceUiStore;
  onShapes(shapes: Map<string, PartShape>, rig: GltfRig): void;
}) {
  const gltf = useLoader(
    GLTFLoader,
    url,
    (loader) => {
      loader.setMeshoptDecoder(MeshoptDecoder);
    },
    (event) => {
      if (event.lengthComputable && event.total > 0) ui.setState({ model: { state: 'loading', progress: event.loaded / event.total } });
    },
  ) as GLTF;

  useEffect(() => {
    const root = cloneSkinned(gltf.scene);
    root.updateMatrixWorld(true);
    const out = new Map<string, PartShape>();
    const skeletons: Skeleton[] = [];
    for (const [partId, name] of meshes) {
      const mesh = findMesh(root.getObjectByName(loaded(name)));
      if (!mesh) continue; // `pnpm validate` checks every node exists.
      const geometry = mesh.geometry;
      adoptFibreAttributes(geometry);
      const position = new Vector3();
      const quaternion = new Quaternion();
      const scale = new Vector3();
      mesh.matrixWorld.decompose(position, quaternion, scale);
      geometry.computeBoundingSphere();
      const skinned = (mesh as SkinnedMesh).isSkinnedMesh ? (mesh as SkinnedMesh) : null;
      // Rest bounds in the scene: a skinned mesh's vertices only get there through its bones (glTF ignores
      // a skinned node's own transform; quantised positions sit in the bones' inverse bind matrices).
      if (skinned) skinned.computeBoundingBox();
      else geometry.computeBoundingBox();
      const box = new Box3().copy(skinned ? skinned.boundingBox! : geometry.boundingBox!).applyMatrix4(mesh.matrixWorld);
      const size = box.getSize(new Vector3());
      const extras = { ...mesh.parent?.userData, ...mesh.userData } as { closed?: unknown };
      const fibre = fibreMeasure(geometry);
      out.set(partId, {
        pieces: [
          {
            geometry,
            matrices: null,
            ...(skinned ? { skin: skinOf(skeletons, skinned) } : {}),
          },
        ],
        position: [position.x, position.y, position.z],
        quaternion,
        scale,
        radius: size.length() / 2,
        closed: extras.closed !== false,
        twoSided: false,
        restFan: 1,
        box: { min: [box.min.x, box.min.y, box.min.z], max: [box.max.x, box.max.y, box.max.z] },
        ...(fibre ? { fibre } : {}),
      });
    }
    // Every mesh comes out of the copy (PartNode draws the parts); the bones stay.
    const all: Object3D[] = [];
    root.traverse((o) => {
      if ((o as Mesh).isMesh) all.push(o);
    });
    for (const o of all) o.removeFromParent();
    const nodes = new Map<string, Object3D>();
    root.traverse((o) => {
      if (o.name && !nodes.has(o.name)) nodes.set(o.name, o);
    });
    ui.setState({ model: { state: 'ready', progress: 1 } });
    onShapes(out, { root, node: (name) => nodes.get(loaded(name)) ?? null });
  }, [gltf, meshes, url, onShapes, ui]);
  return null;
}
