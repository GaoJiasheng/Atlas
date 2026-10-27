/** Allocation-free span application, shared with the geometry/frame-order tests. */
import { Vector3 } from 'three';
import type { SimSpan } from '../../span-schema';
import { createSpanGeometry, spanGeometry } from '../../lib/span';
import type { PartHandle } from './PartNode';

export function createSpanRuntime(part: string, span: SimSpan, radius: number) {
  return { part, span, radius, geometry: createSpanGeometry(), from: new Vector3(), to: new Vector3(), drawn: false };
}
export type SpanRuntime = ReturnType<typeof createSpanRuntime>;

/** Run after all parts, before probes. Endpoints always consume the current frame's matrices. */
export function updateSpan(entry: SpanRuntime, handles: ReadonlyMap<string, PartHandle>): boolean {
  const from = handles.get(entry.span.from.part), to = handles.get(entry.span.to.part), target = handles.get(entry.part);
  if (!target) return false;
  const geometry = entry.geometry;
  if (!from || !to) {
    const changed = geometry.shown;
    geometry.shown = false;
    target.visible = target.object.visible = false;
    return changed;
  }
  entry.from.fromArray(entry.span.from.point).applyMatrix4(from.attachmentMatrix).toArray(geometry.from);
  entry.to.fromArray(entry.span.to.point).applyMatrix4(to.attachmentMatrix).toArray(geometry.to);
  spanGeometry(geometry.from, geometry.to, entry.span.minLength, geometry);
  geometry.shown = geometry.shown && from.visible && to.visible && target.visible;
  const g = target.object;
  let changed = !entry.drawn || g.visible !== geometry.shown;
  for (let i = 0; i < 16 && !changed; i++) if (Math.abs(g.matrix.elements[i]! - geometry.matrix[i]!) > 1e-10) changed = true;
  g.position.fromArray(geometry.centre);
  g.quaternion.fromArray(geometry.quaternion);
  g.scale.set(1, Math.hypot(geometry.matrix[4]!, geometry.matrix[5]!, geometry.matrix[6]!), 1);
  g.visible = target.visible = geometry.shown;
  // Span geometry is absolute. It does not inherit its own authored pose,
  // play, shift or explode (its endpoints already include their display state).
  const pose = g.children[0], anim = pose?.children[0];
  if (pose) { pose.matrix.identity(); pose.matrixWorldNeedsUpdate = true; }
  if (anim) { anim.matrix.identity(); anim.matrixWorldNeedsUpdate = true; }
  g.updateMatrix();
  g.updateWorldMatrix(true, true);
  target.attachmentMatrix.fromArray(geometry.matrix);
  target.offset[0] = target.offset[1] = target.offset[2] = 0;
  target.point[0] = target.point[1] = target.point[2] = 0;
  for (let axis = 0; axis < 3; axis++) target.half[axis] = Math.abs(geometry.matrix[axis]!) * entry.radius + Math.abs(geometry.matrix[axis + 4]!) / 2 + Math.abs(geometry.matrix[axis + 8]!) * entry.radius;
  target.radius = Math.hypot(...target.half);
  entry.drawn = true;
  return changed;
}
