/** Apply the shared snapshot to the actual selectable part nodes before label projection. */
import { useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { BufferAttribute, BufferGeometry, Mesh, Vector3, Quaternion, Box3, Sphere } from 'three';
import type { PartsFile } from '../../schema';
import type { PartHandle } from './PartNode';
import type { StageBridge } from '../../bridge';
import type { OrbitSession } from '../../lib/sim/orbit-session';
import { bodyPlacement, orbitalTiltGuide, orbitGuideLabelPoint } from '../../lib/sim/orbit-projection';
import { add, mul, sub, unit, cross, rotate, qm, qy, qx, type V3 } from '../../lib/sim/orbit-rotation';
import { holds } from '../../lib/sim/bind';
import { keepAnimating, useRuntime } from './runtime';

/** Six-sided tubes: 128 sampled orbit segments, shared preallocated vertex storage. */
function writeSegments(g: BufferGeometry, points: readonly V3[], radius: number) {
  const out = g.getAttribute('position') as BufferAttribute;
  const a = out.array as Float32Array,
    n = (g.getAttribute('normal') as BufferAttribute).array as Float32Array;
  let o = 0;
  for (let i = 1; i < points.length; i++) {
    const p = points[i - 1]!,
      q = points[i]!;
    if (!Number.isFinite(p[0]) || !Number.isFinite(q[0])) continue;
    const dx = q[0] - p[0],
      dy = q[1] - p[1],
      dz = q[2] - p[2],
      len = Math.hypot(dx, dy, dz) || 1;
    let bx = -dz,
      by = 0,
      bz = dx;
    let bl = Math.hypot(bx, bz);
    if (bl < 1e-9) {
      bx = 1;
      bl = 1;
    }
    bx /= bl;
    bz /= bl;
    const cx = (dy * bz) / len,
      cy = (dz * bx - dx * bz) / len,
      cz = (-dy * bx) / len;
    const vertex = (at: V3, k: number) => {
      const c = Math.cos((k * Math.PI) / 3) * radius,
        s = Math.sin((k * Math.PI) / 3) * radius;
      n[o] = (bx * c) / radius + (cx * s) / radius;
      a[o++] = at[0] + bx * c + cx * s;
      n[o] = (by * c) / radius + (cy * s) / radius;
      a[o++] = at[1] + by * c + cy * s;
      n[o] = (bz * c) / radius + (cz * s) / radius;
      a[o++] = at[2] + bz * c + cz * s;
    };
    for (let k = 0; k < 6; k++) {
      vertex(p, k);
      vertex(q, k);
      vertex(p, k + 1);
      vertex(p, k + 1);
      vertex(q, k);
      vertex(q, k + 1);
    }
  }
  out.needsUpdate = true;
  g.getAttribute('normal').needsUpdate = true;
  g.setDrawRange(0, o / 3);
  const box = g.boundingBox!;
  box.min.set(Infinity, Infinity, Infinity);
  box.max.set(-Infinity, -Infinity, -Infinity);
  for (let j = 0; j < o; j += 3) {
    box.min.x = Math.min(box.min.x, a[j]!);
    box.min.y = Math.min(box.min.y, a[j + 1]!);
    box.min.z = Math.min(box.min.z, a[j + 2]!);
    box.max.x = Math.max(box.max.x, a[j]!);
    box.max.y = Math.max(box.max.y, a[j + 1]!);
    box.max.z = Math.max(box.max.z, a[j + 2]!);
  }
  box.getCenter(g.boundingSphere!.center);
  g.boundingSphere!.radius = box.min.distanceTo(box.max) / 2;
}
function guidePoints(key: string, orbit: OrbitSession): V3[] {
  const d = orbit.display,
    s = orbit.snapshot,
    p = s.parameters,
    E = d.centres.earth,
    M = d.centres.moon,
    S = d.centres.sun;
  if (key === 'earthTrack')
    return Array.from({ length: 129 }, (_, j) => {
      const a = (j / 128) * 2 * Math.PI,
        r = Math.hypot(...sub(E, S));
      return add(S, [r * Math.cos(a), 0, -r * Math.sin(a)]);
    });
  if (key === 'lunarTrack')
    return Array.from({ length: 129 }, (_, j) => {
      const a = (j / 128) * 2 * Math.PI,
        r = Math.hypot(...sub(M, E));
      return add(E, rotate(qm(qy(p.node), qx(p.tilt)), [r * Math.cos(a), 0, -r * Math.sin(a)]));
    });
  if (key === 'nodes') {
    const r = Math.hypot(...sub(M, E));
    const n = rotate(qy(p.node), [r * 1.12, 0, 0]);
    return [sub(E, n), add(E, n)];
  }
  if (key === 'plane') return orbitalTiltGuide(E, s.axis, d.radii.earth, Math.hypot(...sub(M, E)) * 1.12);
  if (key === 'ruler') return [E, M];
  const r = d.radii.earth,
    v = s.solarDirections.earth,
    b1 = unit(cross(v, Math.abs(v[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0])),
    b2 = cross(v, b1);
  return [
    add(E, mul(v, r * 1.1)),
    add(E, mul(v, r * 3)),
    [NaN, 0, 0],
    ...Array.from({ length: 129 }, (_, j) =>
      add(E, add(mul(b1, Math.cos((j / 128) * 2 * Math.PI) * r * 1.006), mul(b2, Math.sin((j / 128) * 2 * Math.PI) * r * 1.006))),
    ),
  ];
}
export function OrbitClockDriver({ orbit }: { orbit: OrbitSession }) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    const off = orbit.subscribe(invalidate);
    const on = () => {
      orbit.tick(0, true);
      invalidate();
    };
    document.addEventListener('visibilitychange', on);
    return () => {
      off();
      document.removeEventListener('visibilitychange', on);
    };
  }, [orbit, invalidate]);
  useFrame((state, delta) => {
    orbit.tick(delta, document.hidden);
    if (orbit.clock.running) keepAnimating(state.invalidate);
  }, -2);
  return null;
}
export function OrbitDriver({ orbit, data, handles, bridge }: { orbit: OrbitSession; data: PartsFile; handles: Map<string, PartHandle>; bridge: StageBridge }) {
  const runtime = useRuntime();
  const tmp = useMemo(
    () => ({
      v: new Vector3(),
      q: new Quaternion(),
      scale: new Vector3(),
      box: new Box3(),
      bounds: new Box3(),
      last: -1,
    }),
    [],
  );
  const transforms = useMemo(
    () =>
      data.sim!.bind.flatMap((b) =>
        'part' in b && b.bodyTransform
          ? (Array.isArray(b.part) ? b.part : [b.part]).map((id) => ({
              id,
              b: b.bodyTransform!,
            }))
          : [],
      ),
    [data],
  );
  const lights = useMemo(
    () =>
      data.sim!.bind.flatMap((b) =>
        'part' in b && b.solarIllumination
          ? (Array.isArray(b.part) ? b.part : [b.part]).map((id) => ({
              id,
              b: b.solarIllumination!,
            }))
          : [],
      ),
    [data],
  );
  const guides = useMemo(() => data.sim!.overlays.flatMap((o) => (o.kind === 'orbit-guides' ? [o] : [])), [data]);
  const geometries = useMemo(
    () =>
      new Map(
        guides
          .flatMap((o) => Object.values(o.parts))
          .map((id) => {
            const g = new BufferGeometry();
            g.setAttribute('position', new BufferAttribute(new Float32Array(256 * 36 * 3), 3));
            g.setAttribute('normal', new BufferAttribute(new Float32Array(256 * 36 * 3), 3));
            g.boundingBox = new Box3();
            g.boundingSphere = new Sphere();
            return [id, g] as const;
          }),
      ),
    [guides],
  );
  useEffect(
    () => () => {
      for (const g of geometries.values()) g.dispose();
    },
    [geometries],
  );
  useFrame(() => {
    const s = orbit.snapshot,
      d = orbit.display;
    tmp.bounds.makeEmpty();
    const reading = (bridge.orbitRendered ??= {
      snapshotId: -1,
      parts: {},
      solarDirections: {},
    });
    for (const { id, b } of transforms) {
      const h = handles.get(id);
      if (!h?.object) continue;
      const t = bodyPlacement(s, d, b),
        o = h.object;
      o.position.fromArray(t.position);
      o.quaternion.fromArray(t.quaternion);
      o.scale.setScalar(t.scale);
      o.updateWorldMatrix(true, true);
      tmp.box.setFromObject(o);
      if (h.visible) tmp.bounds.union(tmp.box);
      tmp.box.getCenter(tmp.v);
      h.offset[0] = tmp.v.x - o.position.x;
      h.offset[1] = tmp.v.y - o.position.y;
      h.offset[2] = tmp.v.z - o.position.z;
      if (t.labelOffset) tmp.v.fromArray(t.labelOffset);
      else tmp.v.set(...h.offset);
      tmp.v.toArray(h.point);
      tmp.box.getSize(tmp.scale).multiplyScalar(0.5);
      h.half[0] = tmp.scale.x;
      h.half[1] = tmp.scale.y;
      h.half[2] = tmp.scale.z;
      h.radius = tmp.scale.length();
      o.matrixWorld.decompose(tmp.v, tmp.q, tmp.scale);
      reading.parts[id] = {
        position: tmp.v.toArray(),
        quaternion: tmp.q.toArray(),
        scale: tmp.scale.toArray(),
        visible: h.visible,
      };
      if (b.body === 'sun') for (const u of h.orbitUniforms ?? []) u.uOrbitLight.value = 2;
    }
    for (const { id, b } of lights) {
      const h = handles.get(id);
      if (!h) continue;
      const v = s.solarDirections[b.body];
      for (const u of h.orbitUniforms ?? []) {
        u.uOrbitLight.value = 1;
        u.uOrbitFill.value = b.darkFill;
        u.uOrbitSun.value.fromArray(v);
        reading.solarDirections[b.body] = u.uOrbitSun.value.toArray();
      }
    }
    for (const overlay of guides) {
      const when = !overlay.when || holds(overlay.when.is, overlay.when.control ? orbit.values[overlay.when.control] : orbit.outputs[overlay.when.output!]);
      if (!overlay.axes)
        for (const id of ['earth-axis', 'equator-ring']) {
          const h = handles.get(id);
          if (h) {
            h.visible = false;
            h.object.visible = false;
          }
        }
      for (const [key, id] of Object.entries(overlay.parts)) {
        const h = handles.get(id),
          g = geometries.get(id);
        if (!h?.object || !g) continue;
        if (tmp.last !== orbit.id) writeSegments(g, guidePoints(key, orbit), Math.max(d.radii.earth * (overlay.radius ?? 0.012), 1e-7));
        for (const mesh of h.meshes) if (mesh instanceof Mesh && mesh.geometry !== g) mesh.geometry = g;
        const enabled =
          when &&
          (key === 'nodes'
            ? overlay.nodes && s.parameters.tilt > 1e-9
            : key === 'earthTrack' || key === 'lunarTrack'
              ? overlay.tracks
              : key === 'rays'
                ? overlay.incidence
                : true) &&
          s.lab !== 'local-year';
        h.object.visible = h.visible && enabled;
        h.visible = h.visible && enabled;
        h.object.position.set(0, 0, 0);
        h.object.quaternion.identity();
        h.object.scale.setScalar(1);
        h.object.updateWorldMatrix(true, true);
        if (g.boundingBox) {
          g.boundingBox.getCenter(tmp.v);
          tmp.v.toArray(h.offset);
          // Anchor the name on a visible stroke, never the empty centre of a guide.
          const anchor = overlay.labelAnchors === 'strokes' ? orbitGuideLabelPoint(key, d) : null;
          if (anchor) tmp.v.fromArray(anchor);
          tmp.v.toArray(h.point);
          g.boundingBox.getSize(tmp.scale).multiplyScalar(0.5);
          h.half[0] = tmp.scale.x;
          h.half[1] = tmp.scale.y;
          h.half[2] = tmp.scale.z;
          h.radius = tmp.scale.length();
        }
        reading.parts[id] = {
          position: [0, 0, 0],
          quaternion: [0, 0, 0, 1],
          scale: [1, 1, 1],
          visible: h.visible,
        };
      }
    }
    if (!tmp.bounds.isEmpty()) {
      tmp.bounds.getSize(tmp.v);
      bridge.modelRadius = tmp.v.length() / 2;
    }
    if (tmp.last !== orbit.id) runtime.moved++;
    tmp.last = orbit.id;
    reading.snapshotId = orbit.id;
    bridge.orbitRendered = reading;
  });
  return null;
}
