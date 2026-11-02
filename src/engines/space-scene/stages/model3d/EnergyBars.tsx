import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { BufferAttribute, BufferGeometry, Color, DoubleSide, MeshBasicMaterial, Vector3, type Mesh } from 'three';
import type { SimData, SimOverlay, SimValues } from '../../sim-schema';
import type { SimOutputs } from '../../lib/sim';
import { holds } from '../../lib/sim/bind';
import { energyBarValues } from '../../lib/sim/bars';
import { isTimeline } from '../../lib/sim/timeline';
import type { StageBridge } from '../../bridge';
import { resolveDataColor } from '../../lib/color';
import { damp } from '../../lib/math';
import type { PartDisplay } from '../../lib/visibility';
import type { PartHandle } from './PartNode';
import { keepAnimating, MAX_DT, useRuntime } from './runtime';
import type { StageLook } from './look';
type Bars = Extract<SimOverlay, { kind: 'energy-bars' }>;
/** Quads per energy-bars overlay: potential, kinetic, heat, sound, the 100 % hairline, the base line. */
const BAR_QUADS = 6;
/** Hairline thickness as a share of the bars' 100 % height. */
const HAIR = 0.006;
const tmpA = new Vector3();
const tmpCam = new Vector3();

/**
 * Energy bars (docs/31 E-EN6): three upright bars beside a part, turned about
 * the vertical to face the camera, flat and unlit; every overlay's bars are
 * one mesh (one draw call). Values come from the timeline's channels at the
 * moment the stage plays (lib/sim/bars.ts), so they follow the run and show
 * the end state when it is still. Each frame the bars' values and the point
 * under them are written to the bridge for the HUD labels and QA.
 */
export default function EnergyBars({
  overlays,
  sim,
  values,
  outputs,
  handles,
  displays,
  exploded,
  look,
  snapKey,
  bridge,
}: {
  overlays: readonly { overlay: Bars; index: number }[];
  sim: SimData;
  values: SimValues;
  outputs: SimOutputs;
  handles: Map<string, PartHandle>;
  displays: ReadonlyMap<string, PartDisplay>;
  exploded: boolean;
  look: StageLook;
  snapKey: number;
  bridge: StageBridge;
}) {
  const runtime = useRuntime();
  const ref = useRef<Mesh>(null);
  const n = overlays.length;
  const geometry = useMemo(() => {
    const g = new BufferGeometry();
    g.setAttribute('position', new BufferAttribute(new Float32Array(n * BAR_QUADS * 4 * 3), 3));
    g.setAttribute('color', new BufferAttribute(new Float32Array(n * BAR_QUADS * 4 * 4), 4));
    const idx: number[] = [];
    for (let q = 0; q < n * BAR_QUADS; q++) idx.push(q * 4, q * 4 + 1, q * 4 + 2, q * 4, q * 4 + 2, q * 4 + 3);
    g.setIndex(idx);
    return g;
  }, [n]);
  const material = useMemo(() => new MeshBasicMaterial({ vertexColors: true, transparent: true, depthWrite: false, toneMapped: false, side: DoubleSide }), []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);
  useEffect(() => {
    const bars = bridge.energyBars;
    return () => bars.clear();
  }, [bridge]);
  const colors = useMemo(
    () => ['token:en-potential', 'token:en-kinetic', 'token:en-heat', 'token:en-sound', 'token:ink-3', 'token:ink-3'].map((c) => new Color(resolveDataColor(c, look.tokens, look.theme, '#5a5a5a'))),
    [look],
  );
  const on = overlays.map(({ overlay: o }) => {
    const w = o.when;
    const first = w?.output ? Object.keys(sim.outputs.find((x) => x.id === w.output)?.states ?? {})[0] : undefined;
    const when = !w || holds(w.is, w.control !== undefined ? values[w.control] : outputs[w.output!], first);
    return when && !exploded && displays.get(o.near)?.visible === true;
  });
  const m = useRef({ fade: overlays.map(() => 0), snap: true, key: '' });
  useEffect(() => {
    m.current.snap = true;
  }, [snapKey]);

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
    const cam = state.camera;
    const parent = mesh.parent;
    let easing = false;
    let any = false;
    let key = '';
    overlays.forEach(({ overlay: o, index }, i) => {
      const tl = outputs[o.timeline];
      const pb = runtime.play.get(o.timeline);
      const v = energyBarValues(isTimeline(tl) ? tl : null, o, pb && isTimeline(tl) && pb.key === tl.key ? pb.t : undefined);
      const h = handles.get(o.near);
      const fadeTo = on[i] && v !== null && h !== undefined && h.visible ? 1 : 0;
      s.fade[i] = snap ? fadeTo : damp(s.fade[i]!, fadeTo, 8, dt);
      if (Math.abs(s.fade[i]! - fadeTo) < 0.003) s.fade[i] = fadeTo;
      else easing = true;
      const base = i * BAR_QUADS * 4;
      if (!h || !v || s.fade[i]! <= 0) {
        parr.fill(0, base * 3, (base + BAR_QUADS * 4) * 3);
        bridge.energyBars.set(index, { timeline: o.timeline, potential: v?.potential ?? 0, kinetic: v?.kinetic ?? 0, lost: v?.lost ?? 0, heat: v?.heat ?? 0, sound: v?.sound ?? 0, x: 0, y: 0, shown: false });
        return;
      }
      any = true;
      // The base centre (scene units in this group), then a right vector across the view, upright bars.
      tmpA.set(h.object.position.x + h.point[0] + (o.offset?.[0] ?? 0), h.object.position.y + h.point[1] + (o.offset?.[1] ?? 0), h.object.position.z + h.point[2] + (o.offset?.[2] ?? 0));
      tmpCam.copy(cam.position);
      if (parent) parent.worldToLocal(tmpCam);
      let rx = tmpCam.z - tmpA.z;
      let rz = -(tmpCam.x - tmpA.x);
      const rl = Math.hypot(rx, rz) || 1;
      rx /= rl;
      rz /= rl;
      const full = o.height;
      const span = 3 * o.width + 2 * o.gap;
      const quad = (q: number, x0: number, x1: number, y0: number, y1: number, c: Color) => {
        const at = base + q * 4;
        const corners: [number, number][] = [
          [x0, y0],
          [x1, y0],
          [x1, y1],
          [x0, y1],
        ];
        corners.forEach(([x, y], k) => {
          parr[(at + k) * 3] = tmpA.x + rx * x;
          parr[(at + k) * 3 + 1] = tmpA.y + y;
          parr[(at + k) * 3 + 2] = tmpA.z + rz * x;
          carr[(at + k) * 4] = c.r;
          carr[(at + k) * 4 + 1] = c.g;
          carr[(at + k) * 4 + 2] = c.b;
          carr[(at + k) * 4 + 3] = s.fade[i]!;
        });
      };
      const left = -span / 2;
      const bar = (k: number) => left + k * (o.width + o.gap);
      const y = (pct: number) => (full * pct) / 100;
      quad(0, bar(0), bar(0) + o.width, 0, y(v.potential), colors[0]!);
      quad(1, bar(1), bar(1) + o.width, 0, y(v.kinetic), colors[1]!);
      quad(2, bar(2), bar(2) + o.width, 0, y(v.heat), colors[2]!);
      quad(3, bar(2), bar(2) + o.width, y(v.heat), y(v.lost), colors[3]!);
      const hair = full * HAIR;
      quad(4, left - o.gap, -left + o.gap, full - hair / 2, full + hair / 2, colors[4]!);
      quad(5, left - o.gap, -left + o.gap, -hair / 2, hair / 2, colors[5]!);
      key += `${tmpA.x},${tmpA.y},${tmpA.z},${rx},${rz}|${v.potential}|${v.kinetic}|${v.lost}|${s.fade[i]};`;
      // The label block goes under the bars: project the base centre a little below the base line.
      tmpCam.set(tmpA.x, tmpA.y - full * 0.04, tmpA.z);
      if (parent) parent.localToWorld(tmpCam);
      tmpCam.project(cam);
      const front = tmpCam.z < 1 && Math.abs(tmpCam.x) <= 0.97 && Math.abs(tmpCam.y) <= 0.97;
      bridge.energyBars.set(index, {
        timeline: o.timeline,
        ...v,
        x: ((tmpCam.x + 1) / 2) * state.size.width,
        y: ((1 - tmpCam.y) / 2) * state.size.height,
        shown: front && s.fade[i]! > 0.5,
      });
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

