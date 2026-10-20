import { BoxGeometry, BufferAttribute, BufferGeometry, DynamicDrawUsage, Sphere, Vector3 } from 'three';
import { fillBounds, fillSlice, type FillProfile, type FillShape, type FillSlice } from '../../lib/fill';

const SEGMENTS = 48;
const sin = new Float64Array(SEGMENTS + 1), cos = new Float64Array(SEGMENTS + 1);
for (let i = 0; i <= SEGMENTS; i++) { sin[i] = Math.sin(i / SEGMENTS * Math.PI * 2); cos[i] = Math.cos(i / SEGMENTS * Math.PI * 2); }
interface GeometryState { box: boolean; boxY?: Float32Array; maxEdges: number }
const states = new WeakMap<BufferGeometry, GeometryState>();

/** Allocate the GPU buffers once. Updates only write active vertices and draw range. */
export function createFillGeometry(shape: FillShape, meniscus = 0): BufferGeometry {
  const box = !Array.isArray(shape) && 'kind' in shape && shape.kind === 'box';
  let geometry: BufferGeometry;
  if (box) {
    const size = (shape as { size: readonly number[] }).size;
    geometry = new BoxGeometry(size[0], size[1], size[2]);
    const yaw = (shape as { rotationY?: number }).rotationY ?? 0;
    if (yaw) geometry.rotateY(yaw * Math.PI / 180);
    const position = geometry.getAttribute('position');
    const boxY = new Float32Array(position.count);
    for (let i = 0; i < position.count; i++) boxY[i] = position.getY(i) > 0 ? 1 : 0;
    // Four extra quads form the rectangular vessel's decorative raised lip.
    for (const name of ['position', 'normal', 'uv']) {
      const source = geometry.getAttribute(name), array = new Float32Array(40 * source.itemSize);
      array.set(source.array);
      geometry.setAttribute(name, new BufferAttribute(array, source.itemSize));
    }
    const indices = new Uint16Array(60);
    indices.set(geometry.index!.array);
    for (let side = 0; side < 4; side++) {
      const v = 24 + side * 4, k = 36 + side * 6;
      indices.set([v, v + 1, v + 2, v, v + 2, v + 3], k);
    }
    geometry.setIndex(new BufferAttribute(indices, 1));
    states.set(geometry, { box: true, boxY, maxEdges: 0 });
  } else {
    const profile = Array.isArray(shape) ? shape : (shape as { profile: FillProfile }).profile;
    // A non-convex profile may gain intersections at both horizontal cuts.
    const maxEdges = profile.length * 2 + 16;
    geometry = new BufferGeometry();
    const vertexCount = maxEdges * 2 * (SEGMENTS + 1);
    geometry.setAttribute('position', new BufferAttribute(new Float32Array(vertexCount * 3), 3));
    geometry.setAttribute('normal', new BufferAttribute(new Float32Array(vertexCount * 3), 3));
    const uv = new Float32Array(vertexCount * 2);
    for (let e = 0; e < maxEdges; e++) for (let s = 0; s <= SEGMENTS; s++) for (let end = 0; end < 2; end++) {
      const k = (e * 2 * (SEGMENTS + 1) + end * (SEGMENTS + 1) + s) * 2;
      uv[k] = s / SEGMENTS; uv[k + 1] = end;
    }
    geometry.setAttribute('uv', new BufferAttribute(uv, 2));
    const indices = new Uint16Array(maxEdges * SEGMENTS * 6);
    for (let e = 0; e < maxEdges; e++) for (let s = 0; s < SEGMENTS; s++) {
      const a = e * 2 * (SEGMENTS + 1) + s, b = a + SEGMENTS + 1, k = (e * SEGMENTS + s) * 6;
      indices[k] = a; indices[k + 1] = a + 1; indices[k + 2] = b;
      indices[k + 3] = b; indices[k + 4] = a + 1; indices[k + 5] = b + 1;
    }
    geometry.setIndex(new BufferAttribute(indices, 1));
    states.set(geometry, { box: false, maxEdges });
  }
  (geometry.getAttribute('position') as BufferAttribute).setUsage(DynamicDrawUsage);
  (geometry.getAttribute('normal') as BufferAttribute).setUsage(DynamicDrawUsage);
  geometry.setDrawRange(0, 0);
  const bounds = fillBounds(shape);
  const radius = box ? Math.hypot(...(shape as { size: readonly number[] }).size) : Math.max(...(Array.isArray(shape) ? shape : (shape as { profile: FillProfile }).profile).map(([r]) => r));
  geometry.boundingSphere = new Sphere(new Vector3(0, (bounds.min + bounds.max) / 2, 0), Math.hypot(radius, (bounds.max - bounds.min) / 2) + meniscus);
  return geometry;
}

/** The flat surface stays at slice.level; the meniscus is decorative only. */
export function updateFillGeometry(geometry: BufferGeometry, shape: FillShape, volume: number, below = 0, meniscus = 0): FillSlice {
  const state = states.get(geometry);
  if (!state) throw new Error('Use createFillGeometry before updateFillGeometry');
  const slice = fillSlice(shape, volume, { below, meniscus });
  if (!slice.shown) { geometry.setDrawRange(0, 0); return slice; }
  const position = geometry.getAttribute('position') as BufferAttribute;
  if (state.box) {
    for (let i = 0; i < state.boxY!.length; i++) position.setY(i, state.boxY![i] ? slice.level : slice.bottom);
    const size = (shape as { size: readonly number[] }).size;
    const hx = (size[0] ?? 1) / 2, hz = (size[2] ?? 1) / 2;
    const width = Math.min(meniscus * 2, hx, hz);
    if (width > 0) {
      const corners = [[-1, -1], [-1, 1], [1, 1], [1, -1]] as const;
      const normal = geometry.getAttribute('normal') as BufferAttribute;
      const uv = geometry.getAttribute('uv') as BufferAttribute;
      const length = Math.hypot(width, meniscus);
      const yaw = ((shape as { rotationY?: number }).rotationY ?? 0) * Math.PI / 180;
      const sinY = Math.sin(yaw), cosY = Math.cos(yaw);
      for (let side = 0; side < 4; side++) {
        const a = corners[side]!, b = corners[(side + 1) % 4]!;
        const nx = -(a[0] + b[0]) / 2 * meniscus / length, nz = -(a[1] + b[1]) / 2 * meniscus / length;
        for (let j = 0; j < 4; j++) {
          const corner = j === 0 || j === 3 ? a : b, outer = j < 2, index = 24 + side * 4 + j;
          const x = corner[0] * (outer ? hx : hx - width), z = corner[1] * (outer ? hz : hz - width);
          position.setXYZ(index, cosY * x + sinY * z, slice.level + (outer ? meniscus : 0), -sinY * x + cosY * z);
          normal.setXYZ(index, cosY * nx + sinY * nz, width / length, -sinY * nx + cosY * nz);
          uv.setXY(index, j === 0 || j === 3 ? 0 : 1, outer ? 1 : 0);
        }
      }
      normal.needsUpdate = true; uv.needsUpdate = true;
    }
    position.needsUpdate = true;
    geometry.setDrawRange(0, width > 0 ? 60 : 36);
    return slice;
  }
  const normal = geometry.getAttribute('normal') as BufferAttribute;
  const positions = position.array as Float32Array, normals = normal.array as Float32Array;
  let edge = 0;
  const write = (profile: FillProfile) => {
    let area = 0;
    for (let i = 1; i < profile.length; i++) area += profile[i - 1]![0] * profile[i]![1] - profile[i]![0] * profile[i - 1]![1];
    const forward = area >= 0;
    for (let i = 1; i < profile.length; i++) {
      const a = profile[forward ? i - 1 : profile.length - i]!, b = profile[forward ? i : profile.length - i - 1]!;
      if (a[0] === b[0] && a[1] === b[1]) continue;
      if (edge >= state.maxEdges) throw new Error('Fill profile exceeds its allocated geometry');
      const dr = b[0] - a[0], dy = b[1] - a[1], length = Math.hypot(dr, dy);
      const nr = dy / length, ny = -dr / length;
      for (let s = 0; s <= SEGMENTS; s++) for (let end = 0; end < 2; end++) {
        const point = end ? b : a, k = (edge * 2 * (SEGMENTS + 1) + end * (SEGMENTS + 1) + s) * 3;
        positions[k] = point[0] * sin[s]!; positions[k + 1] = point[1]; positions[k + 2] = point[0] * cos[s]!;
        normals[k] = nr * sin[s]!; normals[k + 1] = ny; normals[k + 2] = nr * cos[s]!;
      }
      edge++;
    }
  };
  write(slice.profile); write(slice.meniscus);
  position.needsUpdate = true; normal.needsUpdate = true;
  geometry.setDrawRange(0, edge * SEGMENTS * 6);
  return slice;
}
