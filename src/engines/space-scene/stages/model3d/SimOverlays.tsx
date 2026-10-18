/**
 * Try-it overlays drawn from the model's outputs (sim `overlays`, docs/22
 * §4.4 M5, docs/30 F3). `force-vectors`: an arrow per force on a part, its
 * colour the kind of force (lib/sim/arrows.ts), its length `per` × newtons
 * (≤ `max`), its value a number, a number output (eased) or a timeline
 * channel (read from the playing run every frame); every arrow of the
 * overlay is one mesh with vertex colours and alpha (one draw call); an arrow
 * fades below 0.05 N, while its part is off show, its `when` fails, its
 * group's layer is off or the model is exploded. `force-arrows`: one arrow on each of two parts, lifted above
 * their centres and laid along the line between them, toward each other for
 * a pull and apart for a push; length ∝ √|value| (the PLATE reading gives the
 * true relative value), eased; flat unlit ink in the pull / push colour. Both
 * arrows are one mesh (one draw call), rewritten only while they move. They
 * follow the parts (pose, try-it offset) through the label handles, fade out
 * while either part is off show, while exploded, below 0.5 or while `when`
 * does not hold.
 */
import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { BufferAttribute, BufferGeometry, Color, DoubleSide, MeshBasicMaterial, type Mesh } from 'three';
import type { SimData, SimOverlay, SimValues } from '../../sim-schema';
import { numberOf, type SimOutputs } from '../../lib/sim';
import { holds } from '../../lib/sim/bind';
import { resolveSimValues } from '../../lib/sim/controls';
import { ARROW_FLOOR as VECTOR_FLOOR, arrowLength as vectorLength, arrowValue, arrowWhen, FORCE_COLORS } from '../../lib/sim/arrows';
import { resolveDataColor } from '../../lib/color';
import { damp, normalize3, type Vec3 } from '../../lib/math';
import type { PartDisplay } from '../../lib/visibility';
import type { PartHandle } from './PartNode';
import { keepAnimating, MAX_DT, useRuntime } from './runtime';
import type { StageLook } from './look';

/** Default arrow length at 100 % and lift above the parts (scene units). */
export const ARROW_LENGTH = 0.04;
export const ARROW_LIFT = 0.02;
/** Below this |value| no arrows are drawn. */
const ARROW_FLOOR = 0.5;
/** Shaft radius, head radius and head length as shares of the 100 % length. */
const SHAFT = 0.035;
const HEAD_R = 0.09;
const HEAD_L = 0.28;
/** Sides of the shaft and head. */
const SIDES = 6;
/** Vertices of one arrow: shaft rings (2 × SIDES), head ring, tip, head base centre. */
const ARROW_VERTS = 3 * SIDES + 2;

/** Arrow length (scene units) for a relative value (%): ∝ √|value|, at most 1.6 × the 100 % length. */
export function arrowLength(value: number, length: number): number {
  return Math.min(1.6, Math.sqrt(Math.abs(value) / 100)) * length;
}

function arrowIndex(count = 2): number[] {
  const idx: number[] = [];
  for (let a = 0; a < count; a++) {
    const o = a * ARROW_VERTS;
    for (let k = 0; k < SIDES; k++) {
      const k1 = (k + 1) % SIDES;
      // Shaft side.
      idx.push(o + k, o + k1, o + SIDES + k, o + k1, o + SIDES + k1, o + SIDES + k);
      // Head side to the tip, and its base disc.
      idx.push(o + 2 * SIDES + k, o + 2 * SIDES + k1, o + 3 * SIDES);
      idx.push(o + 2 * SIDES + k1, o + 2 * SIDES + k, o + 3 * SIDES + 1);
    }
  }
  return idx;
}

/** Write one arrow from `s` along unit `d`, `len` long, into `pos` at vertex `o` (its thickness and head scale with `full`). */
function writeArrow(pos: Float32Array, o: number, s: Vec3, d: Vec3, len: number, full: number): void {
  // Two unit vectors across the arrow.
  const ref: Vec3 = Math.abs(d[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
  const e1: Vec3 = [d[1] * ref[2] - d[2] * ref[1], d[2] * ref[0] - d[0] * ref[2], d[0] * ref[1] - d[1] * ref[0]];
  const n1 = Math.hypot(...e1) || 1;
  e1[0] /= n1;
  e1[1] /= n1;
  e1[2] /= n1;
  const e2: Vec3 = [d[1] * e1[2] - d[2] * e1[1], d[2] * e1[0] - d[0] * e1[2], d[0] * e1[1] - d[1] * e1[0]];
  const head = Math.min(HEAD_L * full, 0.6 * len);
  const shaft = len - head;
  const put = (i: number, x: number, r: number, th: number) => {
    const c = Math.cos(th) * r;
    const sn = Math.sin(th) * r;
    pos[(o + i) * 3] = s[0] + d[0] * x + e1[0] * c + e2[0] * sn;
    pos[(o + i) * 3 + 1] = s[1] + d[1] * x + e1[1] * c + e2[1] * sn;
    pos[(o + i) * 3 + 2] = s[2] + d[2] * x + e1[2] * c + e2[2] * sn;
  };
  for (let k = 0; k < SIDES; k++) {
    const th = (k / SIDES) * Math.PI * 2;
    put(k, 0, SHAFT * full, th);
    put(SIDES + k, shaft, SHAFT * full, th);
    put(2 * SIDES + k, shaft, HEAD_R * full, th);
  }
  put(3 * SIDES, len, 0, 0);
  put(3 * SIDES + 1, shaft, 0, 0);
}

function ForceArrows({
  overlay,
  value,
  on,
  handles,
  look,
  snapKey,
}: {
  overlay: Extract<SimOverlay, { kind: 'force-arrows' }>;
  value: number;
  on: boolean;
  handles: Map<string, PartHandle>;
  look: StageLook;
  snapKey: number;
}) {
  const ref = useRef<Mesh>(null);
  const geometry = useMemo(() => {
    const g = new BufferGeometry();
    g.setAttribute('position', new BufferAttribute(new Float32Array(2 * ARROW_VERTS * 3), 3));
    g.setIndex(arrowIndex());
    return g;
  }, []);
  const material = useMemo(() => new MeshBasicMaterial({ transparent: true, depthWrite: false, toneMapped: false, side: DoubleSide }), []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);
  const pull = useMemo(() => new Color(resolveDataColor(overlay.pull ?? 'token:signal', look.tokens, look.theme, '#cc6328')), [overlay.pull, look]);
  const push = useMemo(() => new Color(resolveDataColor(overlay.push ?? 'token:cold', look.tokens, look.theme, '#4f7f8c')), [overlay.push, look]);
  const m = useRef({ v: value, fade: 0, snap: true, last: '' });
  useEffect(() => {
    m.current.snap = true;
  }, [snapKey]);
  const full = overlay.length ?? ARROW_LENGTH;
  const lift = overlay.lift ?? ARROW_LIFT;

  useFrame((state, delta) => {
    const dt = Math.min(delta, MAX_DT);
    const s = m.current;
    const snap = s.snap;
    s.snap = false;
    const a = handles.get(overlay.between[0]);
    const b = handles.get(overlay.between[1]);
    const shown = on && a !== undefined && b !== undefined && a.visible && b.visible && Math.abs(value) >= ARROW_FLOOR;
    s.v = snap ? value : damp(s.v, value, 7, dt);
    if (Math.abs(s.v - value) < 0.01) s.v = value;
    const fadeTo = shown ? 1 : 0;
    s.fade = snap ? fadeTo : damp(s.fade, fadeTo, 8, dt);
    if (Math.abs(s.fade - fadeTo) < 0.003) s.fade = fadeTo;
    const mesh = ref.current;
    if (!mesh) return;
    mesh.visible = s.fade > 0;
    material.opacity = s.fade;
    material.color.copy(s.v >= 0 ? pull : push);
    if (a && b && s.fade > 0) {
      const pa: Vec3 = [a.object.position.x + a.point[0], a.object.position.y + a.point[1] + lift, a.object.position.z + a.point[2]];
      const pb: Vec3 = [b.object.position.x + b.point[0], b.object.position.y + b.point[1] + lift, b.object.position.z + b.point[2]];
      const key = `${pa.join()}|${pb.join()}|${s.v}`;
      if (key !== s.last) {
        s.last = key;
        const span = Math.hypot(pb[0] - pa[0], pb[1] - pa[1], pb[2] - pa[2]) || 1;
        const d: Vec3 = [(pb[0] - pa[0]) / span, (pb[1] - pa[1]) / span, (pb[2] - pa[2]) / span];
        const back: Vec3 = [-d[0], -d[1], -d[2]];
        const len = Math.max(arrowLength(s.v, full), HEAD_L * full * 0.5);
        const pos = geometry.getAttribute('position') as BufferAttribute;
        const arr = pos.array as Float32Array;
        // A pull points each arrow at the other part; a push points it away.
        writeArrow(arr, 0, pa, s.v >= 0 ? d : back, len, full);
        writeArrow(arr, ARROW_VERTS, pb, s.v >= 0 ? back : d, len, full);
        pos.needsUpdate = true;
        geometry.computeBoundingSphere();
      }
    }
    if (s.v !== value || s.fade !== fadeTo) keepAnimating(state.invalidate);
  });

  return <mesh ref={ref} geometry={geometry} material={material} renderOrder={3} frustumCulled={false} visible={false} />;
}


type Vectors = Extract<SimOverlay, { kind: 'force-vectors' }>;
/** A force arrow's shaft and head scale with the overlay's `per` (the length of 1 N): this many newtons' worth. */
const VECTOR_FULL = 1.6;
const tmpStart: Vec3 = [0, 0, 0];
const tmpDir: Vec3 = [0, 0, 0];

function ForceVectors({
  overlay,
  sim,
  values,
  outputs,
  handles,
  displays,
  layers,
  exploded,
  look,
  snapKey,
}: {
  overlay: Vectors;
  sim: SimData;
  values: SimValues;
  outputs: SimOutputs;
  handles: Map<string, PartHandle>;
  displays: ReadonlyMap<string, PartDisplay>;
  layers: readonly string[];
  exploded: boolean;
  look: StageLook;
  snapKey: number;
}) {
  const runtime = useRuntime();
  const ref = useRef<Mesh>(null);
  const n = overlay.arrows.length;
  const geometry = useMemo(() => {
    const g = new BufferGeometry();
    g.setAttribute('position', new BufferAttribute(new Float32Array(n * ARROW_VERTS * 3), 3));
    g.setAttribute('color', new BufferAttribute(new Float32Array(n * ARROW_VERTS * 4), 4));
    g.setIndex(arrowIndex(n));
    return g;
  }, [n]);
  const material = useMemo(() => new MeshBasicMaterial({ vertexColors: true, transparent: true, depthWrite: false, toneMapped: false, side: DoubleSide }), []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);
  const colors = useMemo(() => overlay.arrows.map((a) => new Color(resolveDataColor(FORCE_COLORS[a.force], look.tokens, look.theme, '#4f5b66'))), [overlay.arrows, look]);
  const dirs = useMemo(() => overlay.arrows.map((a) => normalize3(a.dir)), [overlay.arrows]);
  // Whether each arrow may show (its part, `when`, the group's layer, not exploded); a number value's target.
  const layerOn = overlay.group === undefined || layers.includes(overlay.group);
  const on = overlay.arrows.map((a) => !exploded && layerOn && displays.get(a.part)?.visible === true && arrowWhen(a, sim, values, outputs));
  const m = useRef({ v: overlay.arrows.map(() => 0), fade: overlay.arrows.map(() => 0), snap: true, key: '' });
  useEffect(() => {
    m.current.snap = true;
  }, [snapKey]);
  const full = overlay.per * VECTOR_FULL;

  useFrame((state, delta) => {
    const dt = Math.min(delta, MAX_DT);
    const s = m.current;
    const snap = s.snap;
    s.snap = false;
    const mesh = ref.current;
    if (!mesh) return;
    const pos = geometry.getAttribute('position') as BufferAttribute;
    const col = geometry.getAttribute('color') as BufferAttribute;
    const parr = pos.array as Float32Array;
    const carr = col.array as Float32Array;
    let easing = false;
    let any = false;
    let key = '';
    overlay.arrows.forEach((a, i) => {
      const live = typeof a.value === 'object' && a.value.channel !== undefined;
      const pb = live && typeof a.value === 'object' ? runtime.play.get(a.value.output) : undefined;
      const target = arrowValue(a, outputs, pb?.t);
      // A timeline channel is played as it is; a number eases like the readings.
      s.v[i] = snap || live ? target : damp(s.v[i]!, target, 7, dt);
      if (Math.abs(s.v[i]! - target) < 1e-4) s.v[i] = target;
      else easing = true;
      const h = handles.get(a.part);
      const fadeTo = on[i] && h !== undefined && h.visible && Math.abs(s.v[i]!) >= VECTOR_FLOOR ? 1 : 0;
      s.fade[i] = snap ? fadeTo : damp(s.fade[i]!, fadeTo, 8, dt);
      if (Math.abs(s.fade[i]! - fadeTo) < 0.003) s.fade[i] = fadeTo;
      else easing = true;
      const o = i * ARROW_VERTS;
      const c = colors[i]!;
      for (let k = o * 4, end = (o + ARROW_VERTS) * 4; k < end; k += 4) {
        carr[k] = c.r;
        carr[k + 1] = c.g;
        carr[k + 2] = c.b;
        carr[k + 3] = s.fade[i]!;
      }
      if (!h || s.fade[i]! <= 0) {
        // Collapse a hidden arrow to a point (nothing drawn).
        parr.fill(0, o * 3, (o + ARROW_VERTS) * 3);
        return;
      }
      any = true;
      const lift = a.at === 'top' ? h.half[1] : a.at === 'bottom' ? -h.half[1] : 0;
      tmpStart[0] = h.object.position.x + h.point[0] + (a.offset?.[0] ?? 0);
      tmpStart[1] = h.object.position.y + h.point[1] + lift + (a.offset?.[1] ?? 0);
      tmpStart[2] = h.object.position.z + h.point[2] + (a.offset?.[2] ?? 0);
      const d = dirs[i]!;
      const sign = s.v[i]! < 0 ? -1 : 1;
      tmpDir[0] = d[0] * sign;
      tmpDir[1] = d[1] * sign;
      tmpDir[2] = d[2] * sign;
      const len = Math.max(vectorLength(s.v[i]!, overlay.per, overlay.max), HEAD_L * full * 0.5);
      key += `${tmpStart[0]},${tmpStart[1]},${tmpStart[2]}|${len}|${sign}|${s.fade[i]};`;
      writeArrow(parr, o, tmpStart, tmpDir, len, full);
    });
    mesh.visible = any;
    if (key !== s.key) {
      s.key = key;
      pos.needsUpdate = true;
      col.needsUpdate = true;
      geometry.computeBoundingSphere();
    }
    if (easing) keepAnimating(state.invalidate);
  });

  return <mesh ref={ref} geometry={geometry} material={material} renderOrder={3} frustumCulled={false} visible={false} />;
}

export function SimOverlays({
  overlays,
  sim,
  values,
  outputs,
  handles,
  displays,
  layers,
  exploded,
  look,
  snapKey,
}: {
  overlays: readonly SimOverlay[];
  sim: SimData;
  /** The store's set values (resolved here). */
  values: SimValues;
  outputs: SimOutputs;
  handles: Map<string, PartHandle>;
  displays: ReadonlyMap<string, PartDisplay>;
  /** Layers on (a force-vectors overlay's `group`). */
  layers: readonly string[];
  exploded: boolean;
  look: StageLook;
  snapKey: number;
}) {
  const resolved = useMemo(() => resolveSimValues(sim, values), [sim, values]);
  return (
    <>
      {overlays.map((o, i) => {
        if (o.kind === 'force-vectors')
          return (
            <ForceVectors
              key={i}
              overlay={o}
              sim={sim}
              values={resolved}
              outputs={outputs}
              handles={handles}
              displays={displays}
              layers={layers}
              exploded={exploded}
              look={look}
              snapKey={snapKey}
            />
          );
        const w = o.when;
        const firstState = w?.output ? Object.keys(sim.outputs.find((x) => x.id === w.output)?.states ?? {})[0] : undefined;
        const when = !w || holds(w.is, w.control !== undefined ? resolved[w.control] : outputs[w.output!], firstState);
        const on = when && !exploded && o.between.every((id) => displays.get(id)?.visible === true);
        // A value that does not apply (NaN: a magnet off the bench) draws no arrows.
        const value = numberOf(outputs[o.output]);
        const ok = Number.isFinite(value);
        return <ForceArrows key={i} overlay={o} value={ok ? value : 0} on={on && ok} handles={handles} look={look} snapKey={snapKey} />;
      })}
    </>
  );
}
