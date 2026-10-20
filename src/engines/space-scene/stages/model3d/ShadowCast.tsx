/** Actual caster meshes projected onto a clipped receiver; no shadow map or extra depth pass. */
import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  DoubleSide,
  Group,
  InstancedBufferAttribute,
  InstancedMesh,
  LineSegments,
  Matrix4,
  Mesh,
  PlaneGeometry,
  Quaternion,
  ShaderMaterial,
  Vector3,
} from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { ShadowCastOverlay, SimData, SimValues } from '../../sim-schema';
import { evaluateSim, numberOf, type SimOutputs } from '../../lib/sim';
import { holds } from '../../lib/sim/bind';
import {
  projectShadow,
  inReceiver,
  segmentMesh,
  inBeam,
  receiverFrame,
  receiverPlane,
  receiverPoint,
  receiverUV,
  shadowBounds,
  shadowMatrix,
  spotOpacity,
  spotRadius,
  type ReceiverFrame,
  type ShadowLight,
} from '../../lib/sim/shadow';
import type { Vec3 } from '../../lib/math';
import type { PartDisplay } from '../../lib/visibility';
import { resolveDataColor } from '../../lib/color';
import type { StageBridge, ShadowOnScreen } from '../../bridge';
import type { PartHandle } from './PartNode';
import type { StageLook } from './look';
import { keepAnimating, MAX_DT, prefersReducedMotion, useRuntime } from './runtime';

const vertex = /* glsl */ `
uniform mat4 uObject;
uniform mat4 uProjection;
uniform vec3 uNormal;
varying vec3 vWorld;
void main() {
  vec4 p = uProjection * uObject * vec4(position, 1.0);
  vWorld = p.xyz / p.w + uNormal * 0.001;
  gl_Position = projectionMatrix * viewMatrix * vec4(vWorld, 1.0);
}`;
const clip = /* glsl */ `
uniform vec3 uCentre, uU, uV, uSource, uAxis;
uniform vec2 uSize;
uniform float uRadius, uCos, uPoint;
varying vec3 vWorld;
vec2 clippedUV() {
  vec3 d = vWorld - uCentre;
  vec2 uv = vec2(dot(d, uU), dot(d, uV));
  if (any(greaterThan(abs(uv), uSize * 0.5))) discard;
  if (uRadius > 0.0 && length(uv) > uRadius) discard;
  if (uPoint > 0.5 && dot(normalize(vWorld - uSource), uAxis) < uCos) discard;
  return uv;
}`;
const fragment = /* glsl */ `${clip}
uniform vec3 uColor, uBase;
uniform float uFade;
void main() {
  clippedUV();
  gl_FragColor = vec4(mix(uBase, uColor, uFade), 1.0);
  #include <colorspace_fragment>
}`;
const spotFragment = /* glsl */ `${clip}
uniform vec3 uColor, uBase;
uniform float uOpacity;
void main() {
  clippedUV();
  float c = dot(normalize(vWorld - uSource), uAxis);
  float innerCos = inversesqrt(1.0 + 0.9409 * (1.0 / (uCos * uCos) - 1.0));
  float a = smoothstep(uCos, innerCos, c) * uOpacity;
  gl_FragColor = vec4(mix(uBase, uColor, a), 1.0);
  #include <colorspace_fragment>
}`;
function material(spot = false): ShaderMaterial {
  return new ShaderMaterial({
    vertexShader: vertex,
    fragmentShader: spot ? spotFragment : fragment,
    side: DoubleSide,
    // Opaque paint forms a union without writing a coplanar depth layer over the spot.
    depthWrite: false,
    toneMapped: false,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
    uniforms: {
      uObject: { value: new Matrix4() },
      uProjection: { value: new Matrix4() },
      uNormal: { value: new Vector3() },
      uCentre: { value: new Vector3() },
      uU: { value: new Vector3() },
      uV: { value: new Vector3() },
      uSource: { value: new Vector3() },
      uAxis: { value: new Vector3(1, 0, 0) },
      uSize: { value: [1e6, 1e6] },
      uRadius: { value: 0 },
      uCos: { value: -1 },
      uPoint: { value: 0 },
      uColor: { value: new Color() },
      uBase: { value: new Color() },
      uOpacity: { value: 0 },
      uFade: { value: 1 },
    },
  });
}
interface Caster {
  part: string;
  geometry: BufferGeometry;
  mesh: Mesh;
  original: Mesh;
  /** World vertices, three per triangle, and their bounding box (rays are traced against them). */
  points: Vec3[];
  min: Vec3;
  max: Vec3;
  projected: Vec3[];
  world: Matrix4;
  shown: boolean;
  fade: number;
}
const xyz = (v: Vector3): Vec3 => [v.x, v.y, v.z];
const vec = (p: Vec3) => new Vector3(...p);
/** Merge every piece, including extra primitives and instance transforms, once in the first piece's frame. */
function casterOf(part: string, handle: PartHandle): Caster | null {
  const original = handle.meshes.find((o) => o instanceof Mesh) as Mesh | undefined;
  if (!original) return null;
  const inverse = original.matrixWorld.clone().invert();
  const pieces: BufferGeometry[] = [];
  for (const object of handle.meshes) {
    if (!(object instanceof Mesh)) continue;
    const count = object instanceof InstancedMesh ? object.count : 1;
    for (let i = 0; i < count; i++) {
      const transform = inverse.clone().multiply(object.matrixWorld);
      if (object instanceof InstancedMesh) {
        const instance = new Matrix4();
        object.getMatrixAt(i, instance);
        transform.multiply(instance);
      }
      const g = object.geometry.clone();
      for (const key of Object.keys(g.attributes)) if (key !== 'position') g.deleteAttribute(key);
      const flat = g.index ? g.toNonIndexed() : g;
      if (flat !== g) g.dispose();
      flat.applyMatrix4(transform);
      pieces.push(flat);
    }
  }
  const geometry = mergeGeometries(pieces);
  pieces.forEach((g) => g.dispose());
  if (!geometry) return null;
  const mesh = new Mesh(geometry, material());
  mesh.frustumCulled = false;
  mesh.renderOrder = 5;
  mesh.raycast = () => {};
  return {
    part,
    geometry,
    mesh,
    original,
    points: Array.from({ length: geometry.getAttribute('position').count }, () => [0, 0, 0] as Vec3),
    projected: Array.from({ length: geometry.getAttribute('position').count }, () => [0, 0, 0] as Vec3),
    min: [0, 0, 0],
    max: [0, 0, 0],
    shown: false,
    fade: -1,
    world: new Matrix4(),
  };
}
function setFrame(m: ShaderMaterial, f: ReceiverFrame, o: ShadowCastOverlay, source: Vec3, axis: Vec3, point: boolean) {
  m.uniforms.uNormal!.value.set(...f.normal);
  m.uniforms.uCentre!.value.set(...f.centre);
  m.uniforms.uU!.value.set(...f.u);
  m.uniforms.uV!.value.set(...f.v);
  m.uniforms.uSource!.value.set(...source);
  m.uniforms.uAxis!.value.set(...axis);
  m.uniforms.uSize!.value = o.receiver.size ?? [1e6, 1e6];
  m.uniforms.uRadius!.value = o.receiver.radius ?? 0;
  m.uniforms.uCos!.value = 'beam' in o.source ? Math.cos((o.source.beam * Math.PI) / 180) : -1;
  m.uniforms.uPoint!.value = point ? 1 : 0;
}
function when(o: ShadowCastOverlay, sim: SimData, values: SimValues, outputs: SimOutputs): boolean {
  const w = o.source.when;
  const first = w?.output ? Object.keys(sim.outputs.find((x) => x.id === w.output)?.states ?? {})[0] : undefined;
  return !w || holds(w.is, w.control !== undefined ? values[w.control] : outputs[w.output!], first);
}
/** A caster's darkness: 1 (opaque), a fixed fraction or a number output (`sheet-dark`). */
function casterDark(def: ShadowCastOverlay['casters'][number], outputs: SimOutputs): number {
  return typeof def.dark === 'number' ? def.dark : def.dark ? numberOf(outputs[def.dark.output]) : 1;
}
const rayVertex = /* glsl */ `
attribute float alpha, along;
varying float vAlpha, vAlong;
void main() {
  vAlpha = alpha;
  vAlong = along;
  gl_Position = projectionMatrix * viewMatrix * vec4(position, 1.0);
}`;
const rayFragment = /* glsl */ `
uniform vec3 uColor;
uniform float uPhase, uFade;
varying float vAlpha, vAlong;
void main() {
  if (fract(vAlong * 25.0 - uPhase) > 0.68) discard;
  gl_FragColor = vec4(uColor, vAlpha * uFade);
  #include <colorspace_fragment>
}`;
const trailVertex = /* glsl */ `
attribute float hollow;
varying vec2 vUv;
varying float vHollow;
void main() {
  vUv = uv;
  vHollow = hollow;
  gl_Position = projectionMatrix * viewMatrix * instanceMatrix * vec4(position, 1.0);
}`;
const trailFragment = /* glsl */ `
uniform vec3 uColor;
uniform float uAlpha;
varying vec2 vUv;
varying float vHollow;
void main() {
  float r = length(vUv - 0.5) * 2.0;
  if (r > 1.0 || (vHollow > 0.5 && r < 0.68)) discard;
  gl_FragColor = vec4(uColor, uAlpha);
  #include <colorspace_fragment>
}`;

export function ShadowCast({
  overlay: o,
  index,
  sim,
  values,
  outputs,
  handles,
  displays,
  layers,
  exploded,
  look,
  snapKey,
  bridge,
}: {
  overlay: ShadowCastOverlay;
  index: number;
  sim: SimData;
  values: SimValues;
  outputs: SimOutputs;
  handles: Map<string, PartHandle>;
  displays: ReadonlyMap<string, PartDisplay>;
  layers: readonly string[];
  exploded: boolean;
  look: StageLook;
  snapKey: number;
  bridge: StageBridge;
}) {
  const root = useRef<Group>(null),
    runtime = useRuntime();
  const casters = useRef(new Map<string, Caster>());
  const spot = useMemo(() => {
    const m = new Mesh(new PlaneGeometry(1, 1), material(true));
    m.renderOrder = 4;
    m.frustumCulled = false;
    m.raycast = () => {};
    return m;
  }, []);
  const rays = useMemo(() => {
    const g = new BufferGeometry();
    g.setAttribute('position', new BufferAttribute(new Float32Array(768 * 3), 3));
    g.setAttribute('alpha', new BufferAttribute(new Float32Array(768), 1));
    g.setAttribute('along', new BufferAttribute(new Float32Array(768), 1));
    g.setDrawRange(0, 0);
    const m = new ShaderMaterial({
      vertexShader: rayVertex,
      fragmentShader: rayFragment,
      uniforms: {
        uColor: { value: new Color() },
        uPhase: { value: 0 },
        uFade: { value: 1 },
      },
      transparent: true,
      depthWrite: false,
      toneMapped: false,
      linewidth: 1.25,
    });
    const line = new LineSegments(g, m);
    line.frustumCulled = false;
    line.renderOrder = 6;
    line.raycast = () => {};
    return line;
  }, []);
  const trail = useMemo(() => {
    const g = new PlaneGeometry(0.04, 0.04);
    g.setAttribute('hollow', new InstancedBufferAttribute(new Float32Array(48), 1));
    const m = new ShaderMaterial({
      vertexShader: trailVertex,
      fragmentShader: trailFragment,
      uniforms: { uColor: { value: new Color() }, uAlpha: { value: 0.6 } },
      transparent: true,
      depthWrite: false,
      side: DoubleSide,
      toneMapped: false,
    });
    const mesh = new InstancedMesh(g, m, 48);
    mesh.count = 0;
    mesh.frustumCulled = false;
    mesh.renderOrder = 6;
    mesh.raycast = () => {};
    return mesh;
  }, []);
  useEffect(() => {
    const g = root.current;
    if (!g) return;
    g.add(spot, rays, trail);
    return () => {
      for (const c of casters.current.values()) {
        c.geometry.dispose();
        (c.mesh.material as ShaderMaterial).dispose();
        g.remove(c.mesh);
      }
      casters.current.clear();
      for (const m of [spot, rays, trail]) {
        m.geometry.dispose();
        (m.material as ShaderMaterial).dispose();
      }
      bridge.shadows.delete(index);
    };
  }, [spot, rays, trail, bridge, index]);
  const state = useRef({
    key: '',
    fade: 0,
    lastFade: -1,
    snap: true,
    receiver: new Matrix4(),
    source: new Matrix4(),
    spotStrength: 0,
  });
  const scratch = useMemo(() => ({ vertex: new Vector3(), projected: new Vector3() }), []);
  useEffect(() => {
    state.current.snap = true;
  }, [snapKey]);
  const configKey = useMemo(() => JSON.stringify([values, outputs, layers, look.theme, look.tokens]), [values, outputs, layers, look]);
  useFrame((frame, delta) => {
    const group = root.current,
      receiver = handles.get(o.receiver.part),
      sourceHandle = 'part' in o.source ? handles.get(o.source.part) : undefined;
    if (!group || !receiver || ('part' in o.source && !sourceHandle)) return;
    receiver.object.updateWorldMatrix(true, true);
    sourceHandle?.object.updateWorldMatrix(true, true);
    for (const c of o.casters) {
      const h = handles.get(c.part);
      if (!h) continue;
      h.object.updateWorldMatrix(true, true);
      if (!casters.current.has(c.part)) {
        const made = casterOf(c.part, h);
        if (made) {
          casters.current.set(c.part, made);
          group.add(made.mesh);
        }
      }
    }
    const s = state.current;
    const receiverShown = receiver.visible && displays.get(o.receiver.part)?.visible;
    const sourceShown = !sourceHandle || (sourceHandle.visible && displays.get(('part' in o.source && o.source.part) || '')?.visible);
    const target = receiverShown && sourceShown && when(o, sim, values, outputs) && !exploded ? 1 : 0;
    s.fade = s.snap ? target : s.fade + Math.sign(target - s.fade) * Math.min(Math.abs(target - s.fade), Math.min(delta, MAX_DT) / 0.3);
    if (Math.abs(s.fade - target) < 0.003) s.fade = target;
    s.snap = false;
    group.visible = s.fade > 0;
    for (const c of casters.current.values()) (c.mesh.material as ShaderMaterial).uniforms.uFade!.value = s.fade;
    (rays.material as ShaderMaterial).uniforms.uFade!.value = s.fade;
    (trail.material as ShaderMaterial).uniforms.uAlpha!.value = 0.6 * s.fade;
    // Exploding is a view of the apparatus, not a different light experiment: freeze its construction while it fades.
    if (exploded) {
      (spot.material as ShaderMaterial).uniforms.uOpacity!.value = s.spotStrength * s.fade;
      if (s.fade !== target) keepAnimating(frame.invalidate);
      return;
    }
    const first = receiver.meshes.find((x) => x instanceof Mesh) as Mesh | undefined;
    const sourceMesh = sourceHandle?.meshes.find((x) => x instanceof Mesh) as Mesh | undefined;
    if (!first) return;
    let changed =
      s.key !== configKey || s.lastFade !== s.fade || !s.receiver.equals(first.matrixWorld) || (!!sourceMesh && !s.source.equals(sourceMesh.matrixWorld));
    for (const [id, c] of casters.current) {
      const h = handles.get(id),
        shown = h?.visible === true && displays.get(id)?.visible === true;
      if (shown !== c.shown || h?.fade !== c.fade || !c.world.equals(c.original.matrixWorld)) changed = true;
    }
    if (changed) {
      s.key = configKey;
      s.lastFade = s.fade;
      s.receiver.copy(first.matrixWorld);
      if (sourceMesh) s.source.copy(sourceMesh.matrixWorld);
      const centre = receiver.object.getWorldPosition(new Vector3()).add(new Vector3(...receiver.offset));
      const normal = new Vector3(...o.receiver.normal).transformDirection(first.matrixWorld);
      // The receiving face, rather than the middle of a thick board/ground slab.
      let face = -Infinity;
      for (const object of receiver.meshes) {
        if (!(object instanceof Mesh)) continue;
        const p = object.geometry.getAttribute('position');
        for (let i = 0; i < p.count; i++) {
          const v = scratch.vertex.fromBufferAttribute(p, i).applyMatrix4(object.matrixWorld);
          face = Math.max(face, v.sub(centre).dot(normal));
        }
      }
      if (Number.isFinite(face)) centre.addScaledVector(normal, face);
      const f = receiverFrame(xyz(centre), xyz(normal)),
        plane = receiverPlane(f);
      const point = 'point' in o.source;
      let source: Vec3 = [0, 0, 0],
        axis: Vec3 = [1, 0, 0],
        light: ShadowLight;
      if ('point' in o.source && sourceHandle) {
        const transform = sourceMesh!.matrixWorld.clone().multiply(sourceHandle.restInverse);
        source = xyz(new Vector3(...o.source.point).applyMatrix4(transform));
        axis = xyz(new Vector3(...o.source.axis).transformDirection(transform));
        light = [...source, 1];
      } else {
        const output = 'direction' in o.source ? outputs[o.source.direction.output] : null;
        const d = output && typeof output === 'object' ? (output as Record<string, number>) : {};
        source = xyz(new Vector3(d.x ?? 0, d.y ?? 1, d.z ?? 0).normalize());
        light = [...source, 0];
      }
      const projection = new Matrix4().fromArray(shadowMatrix(plane, light));
      const base = (() => {
        const m = Array.isArray(first.material) ? first.material[0] : first.material;
        return m && 'color' in m ? (m.color as Color).clone() : new Color(resolveDataColor('token:paper', look.tokens, look.theme));
      })();
      const ink = new Color(resolveDataColor('token:ink', look.tokens, look.theme));
      if (look.theme === 'cinema') ink.multiplyScalar(0);
      const energy = new Color(resolveDataColor(o.spot?.color ?? 'token:en-light', look.tokens, look.theme));
      const distance = vec(source).distanceTo(centre);
      s.spotStrength = point && o.spot ? spotOpacity(distance) : 0;
      const spotMix = s.spotStrength * s.fade;
      const lit = base.clone().lerp(energy, spotMix);
      const metadata: ShadowOnScreen = { casters: {}, trail: [], rays: 0 };
      const segments: { a: Vec3; b: Vec3; alpha: number }[] = [];
      const add = (a: Vec3, b: Vec3, alpha = 1) => segments.push({ a, b, alpha });
      const active: Caster[] = [];
      const darkOf = new Map<Caster, number>();
      /** Edge rays: the caster's grazed vertex and where the ray meets the receiver. */
      const edges: { caster: Caster; edge: Vec3; end: Vec3 }[] = [];
      /** Whether a caster of this darkness stops a drawn ray (`through: dark` lets rays pass a transmitting sheet). */
      const stops = (dark: number) => dark >= 0.999 || o.rays?.through !== 'dark';
      for (const def of o.casters) {
        const c = casters.current.get(def.part),
          h = handles.get(def.part);
        if (!c || !h) continue;
        c.shown = h.visible && displays.get(def.part)?.visible === true;
        c.fade = h.fade;
        c.world.copy(c.original.matrixWorld);
        c.mesh.visible = s.fade > 0 && c.shown;
        if (!c.mesh.visible) continue;
        active.push(c);
        const positions = c.geometry.getAttribute('position');
        c.min.fill(Infinity);
        c.max.fill(-Infinity);
        let high: Vec3 | undefined,
          low: Vec3 | undefined,
          highAt: Vec3 | undefined,
          lowAt: Vec3 | undefined,
          hi = -Infinity,
          lo = Infinity;
        for (let i = 0; i < positions.count; i++) {
          const world = scratch.vertex.fromBufferAttribute(positions, i).applyMatrix4(c.world),
            projected = scratch.projected.copy(world).applyMatrix4(projection);
          const original = c.points[i]!,
            p = c.projected[i]!;
          original[0] = world.x;
          original[1] = world.y;
          original[2] = world.z;
          for (let axis = 0; axis < 3; axis++) {
            c.min[axis] = Math.min(c.min[axis]!, original[axis]!);
            c.max[axis] = Math.max(c.max[axis]!, original[axis]!);
          }
          p[0] = projected.x;
          p[1] = projected.y;
          p[2] = projected.z;
          const v = (p[0] - f.centre[0]) * f.v[0] + (p[1] - f.centre[1]) * f.v[1] + (p[2] - f.centre[2]) * f.v[2];
          if (v > hi) {
            hi = v;
            high = p;
            highAt = original;
          }
          if (v < lo) {
            lo = v;
            low = p;
            lowAt = original;
          }
        }
        metadata.casters[def.part] = shadowBounds(c.projected, f);
        const m = c.mesh.material as ShaderMaterial;
        setFrame(m, f, o, source, axis, point);
        m.uniforms.uObject!.value.copy(c.world);
        m.uniforms.uProjection!.value.copy(projection);
        const dark = casterDark(def, outputs);
        darkOf.set(c, dark);
        m.uniforms.uBase!.value.copy(lit);
        m.uniforms.uFade!.value = s.fade;
        m.uniforms.uColor!.value.copy(lit).lerp(ink, (look.theme === 'cinema' ? 0.6 : 0.55) * Math.max(0, Math.min(1, dark)) * h.fade);
        if (o.rays?.edges === 'vertical' && point && high && low && highAt && lowAt)
          edges.push({ caster: c, edge: highAt, end: high }, { caster: c, edge: lowAt, end: low });
      }
      // An edge ray is drawn only where the light reaches the grazed edge: another opaque caster between the
      // source and that edge (the holder rod's top behind a card, a hole card behind the first) hides it.
      for (const { caster, edge, end } of edges) {
        const arrives =
          inReceiver(receiverUV(end, f), o.receiver.size, o.receiver.radius) && inBeam(end, source, axis, 'beam' in o.source ? o.source.beam : 89);
        // A caster touching the edge (the rod under a card) does not hide it: only one at least 1 mm nearer the source.
        const reach = 1 - 0.001 / Math.hypot(edge[0] - source[0], edge[1] - source[1], edge[2] - source[2]);
        const blocked = active.some((other) => {
          if (other === caster || !stops(darkOf.get(other)!)) return false;
          const t = segmentMesh(source, edge, other.points, other.min, other.max);
          return t !== null && t < reach;
        });
        if (arrives && !blocked) add(source, end);
      }
      if (o.spot && point) {
        spot.visible = s.fade > 0;
        const m = spot.material as ShaderMaterial;
        setFrame(m, f, o, source, axis, true);
        m.uniforms.uObject!.value.makeBasis(vec(f.u), vec(f.v), vec(f.normal));
        m.uniforms.uObject!.value.setPosition(centre);
        const size = o.receiver.size ?? [o.receiver.radius! * 2, o.receiver.radius! * 2];
        m.uniforms.uObject!.value.scale(new Vector3(size[0], size[1], 1));
        m.uniforms.uProjection!.value.identity();
        m.uniforms.uColor!.value.copy(energy);
        m.uniforms.uBase!.value.copy(base);
        m.uniforms.uOpacity!.value = spotMix;
        metadata.spot = {
          radius: spotRadius(distance, 'beam' in o.source ? o.source.beam : 0) * 100,
        };
      } else spot.visible = false;
      if (o.rays?.extra && point) {
        for (const uv of o.rays.extra) {
          const end = receiverPoint([uv[0] / 100, uv[1] / 100], f, 0.001);
          const hits: { t: number; dark: number }[] = [];
          for (const c of active) {
            const found = segmentMesh(source, end, c.points, c.min, c.max);
            if (found === null) continue;
            hits.push({ t: found, dark: darkOf.get(c)! });
          }
          hits.sort((a, b) => a.t - b.t);
          let alpha = 1,
            start = source;
          for (const hit of hits) {
            const at = xyz(vec(source).lerp(vec(end), hit.t));
            add(start, at, alpha);
            if (stops(hit.dark)) {
              alpha = 0;
              break;
            }
            alpha *= 1 - hit.dark;
            start = at;
          }
          if (alpha > 0) add(start, end, alpha);
        }
      }
      trail.count = 0;
      if (!point && active.length) {
        const c = active[0]!;
        let top = -Infinity;
        for (const p of c.points) top = Math.max(top, p[1]);
        const tops = c.points.filter((p) => Math.abs(p[1] - top) < 1e-6),
          tip = tops.reduce((p, q) => p.map((x, i) => x + q[i]! / tops.length) as Vec3, [0, 0, 0] as Vec3);
        const end = projectShadow(tip, plane, light);
        if (o.rays?.edges === 'tip') {
          const start = tip.map((x, i) => x + source[i]! * 2) as Vec3;
          add(start, end);
          for (const offset of o.rays.parallel ?? []) {
            const sideways = new Vector3(source[2], 0, -source[0]).normalize().multiplyScalar(offset);
            const p = vec(end).add(sideways),
              a = p.clone().addScaledVector(vec(source), 3);
            add(xyz(a), xyz(p));
          }
        }
        if (o.trail) {
          const control = sim.controls.find((x) => x.id === o.trail!.control),
            current = values[o.trail.control];
          if (control?.kind === 'step' && typeof current === 'number' && 'direction' in o.source) {
            const steps = control.values.filter((x) => x <= current),
              hollow = trail.geometry.getAttribute('hollow') as InstancedBufferAttribute;
            for (const value of steps) {
              const out = evaluateSim(sim, { ...values, [control.id]: value })[o.source.direction.output] as Record<string, number>;
              const p = projectShadow(tip, plane, [out.x!, out.y!, out.z!, 0]),
                uv = receiverUV(p, f);
              metadata.trail.push([uv[0] * 100, uv[1] * 100]);
              const orientation = new Quaternion().setFromUnitVectors(new Vector3(0, 0, 1), normal),
                matrix = new Matrix4().compose(vec(p).addScaledVector(normal, 0.002), orientation, new Vector3(1, 1, 1));
              trail.setMatrixAt(trail.count, matrix);
              hollow.setX(trail.count, value === current ? 1 : 0);
              trail.count++;
            }
            hollow.needsUpdate = true;
            trail.instanceMatrix.needsUpdate = true;
          }
        }
      }
      trail.visible = s.fade > 0 && trail.count > 0;
      (trail.material as ShaderMaterial).uniforms.uColor!.value.copy(ink);
      (trail.material as ShaderMaterial).uniforms.uAlpha!.value = 0.6 * s.fade;
      const on = !!o.rays && layers.includes(o.rays.group),
        pos = rays.geometry.getAttribute('position') as BufferAttribute,
        alpha = rays.geometry.getAttribute('alpha') as BufferAttribute,
        along = rays.geometry.getAttribute('along') as BufferAttribute;
      let k = 0;
      for (const line of segments) {
        if (k + 2 > pos.count) break;
        pos.setXYZ(k, ...line.a);
        pos.setXYZ(k + 1, ...line.b);
        alpha.setX(k, line.alpha);
        alpha.setX(k + 1, line.alpha);
        along.setX(k, 0);
        along.setX(k + 1, vec(line.a).distanceTo(vec(line.b)));
        k += 2;
      }
      pos.needsUpdate = true;
      alpha.needsUpdate = true;
      along.needsUpdate = true;
      rays.geometry.setDrawRange(0, k);
      rays.visible = on && s.fade > 0 && k > 0;
      (rays.material as ShaderMaterial).uniforms.uColor!.value.copy(energy);
      metadata.rays = on ? k / 2 : 0;
      bridge.shadows.set(index, metadata);
    }
    const animated = rays.visible && runtime.energy > 0.001 && !prefersReducedMotion();
    if (animated) (rays.material as ShaderMaterial).uniforms.uPhase!.value = runtime.phase * 0.6;
    if (s.fade !== target || animated) keepAnimating(frame.invalidate);
  });
  return <group ref={root} visible={false} />;
}
