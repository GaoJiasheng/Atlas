import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { BufferAttribute, BufferGeometry, Color, DoubleSide, MeshBasicMaterial, type Mesh } from 'three';
import type { SimData, SimOverlay, SimValues } from '../../sim-schema';
import type { SimOutputs } from '../../lib/sim';
import type { StageBridge } from '../../bridge';
import { resolveDataColor } from '../../lib/color';
import { damp, normalize3, type Vec3 } from '../../lib/math';
import type { PartDisplay } from '../../lib/visibility';
import type { PartHandle } from './PartNode';
import { keepAnimating, MAX_DT, useRuntime } from './runtime';
import type { StageLook } from './look';
import { ARROW_FLOOR as VECTOR_FLOOR, arrowLength as vectorLength, arrowValue, arrowWhen, FORCE_COLORS, vectorScale } from '../../lib/sim/arrows';
import { ARROW_VERTS, HEAD_L, arrowIndex, writeArrow } from './arrowGeometry';

type Vectors = Extract<SimOverlay, { kind: 'force-vectors' }>;
const tmpStart: Vec3 = [0, 0, 0];
const tmpDir: Vec3 = [0, 0, 0];

export default function ForceVectors({
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
  bridge,
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
  bridge:StageBridge;
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
  const readings = useMemo(() => overlay.arrows.map(a => ({force:a.force,dir:[0,0,0] as Vec3,shown:false,scaled:false})),[overlay]);
  useEffect(()=>{if(sim.airfoil)readings.forEach((r,i)=>bridge.airfoilArrows.set(`${sim.overlays.indexOf(overlay)}:${i}`,r));return()=>{readings.forEach((_,i)=>bridge.airfoilArrows.delete(`${sim.overlays.indexOf(overlay)}:${i}`));};},[sim,overlay,bridge,readings]);
  // Thickness: the overlay's own `width`, else scaled from `per` with a floor from `max`.
  const full = overlay.width ?? vectorScale(overlay.per, overlay.max);

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
      readings[i]!.shown = !!h && s.fade[i]! > 0 && !!on[i];
      readings[i]!.scaled = Math.abs(s.v[i]!) * overlay.per > overlay.max;
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
      for(let j=0;j<3;j++)readings[i]!.dir[j]=tmpDir[j]!;
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

