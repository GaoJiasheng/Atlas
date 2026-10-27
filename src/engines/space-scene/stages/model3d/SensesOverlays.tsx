/** Six shared-solver eye rays and a single instanced longitudinal particle row. */
import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { BufferAttribute, BufferGeometry, Color, DoubleSide, InstancedMesh, LineBasicMaterial, Matrix4, MeshBasicMaterial, SphereGeometry, type Group } from 'three';
import type { SimData, SimOverlay, SimValues } from '../../sim-schema';
import { effectiveEyeRays, solveSenses } from '../../lib/sim/senses';
import type { StageBridge } from '../../bridge';
import type { StageLook } from './look';
import { resolveDataColor } from '../../lib/color';
import { keepAnimating, MAX_DT, prefersReducedMotion, useRuntime } from './runtime';
import { numberOf, type SimOutputs } from '../../lib/sim';

type Overlay = Extract<SimOverlay, { kind: 'paraxial-eye' | 'longitudinal-wave' }>;
export function SensesOverlay({ overlay: o, sim, values, outputs, exploded, layers, run, snapKey, phaseKey, look, bridge }: {
  overlay: Overlay; sim: SimData; values: SimValues; outputs: SimOutputs; exploded: boolean; layers: readonly string[]; run: boolean; snapKey: number; phaseKey: number; look: StageLook; bridge: StageBridge;
}) {
  const particles = useRef<InstancedMesh>(null);
  const group = useRef<Group>(null);
  const runtime = useRuntime();
  const phase = useRef(0), hold = useRef(false);
  const q = useMemo(() => sim.senses ? solveSenses(sim.senses, values) : {}, [sim, values]);
  const eye = useMemo(() => sim.senses ? effectiveEyeRays(sim.senses, values) : null, [sim, values]);
  const w = o.when;
  const when = !w || (w.control ? values[w.control] : outputs[w.output!]) === w.is;
  const reason = exploded ? 'exploded' : o.group && !layers.includes(o.group) ? 'layer' : !when ? 'condition' : o.kind === 'paraxial-eye' && q['eye-state'] === 'dark' ? 'dark' : null;
  const visible = reason === null;
  const color = useMemo(() => new Color(resolveDataColor(o.kind === 'paraxial-eye' ? 'token:en-light' : 'token:air', look.tokens, look.theme, '')), [look, o.kind]);
  const muted = useMemo(() => new Color(resolveDataColor('token:ink-2', look.tokens, look.theme, '')), [look]);
  const matrix = useMemo(() => new Matrix4(), []);
  const wave = useMemo(() => ({ phaseCycles: 0, positions: Array.from({length:41}, (_,i)=>i*.05), rests: Array.from({length:41}, (_,i)=>i*.05), visualHz: 0, lambda: 1, A: 0, playing: false, slowFactor: 250, active: false, hiddenReason: null as string | null }), []);

  const lineMaterial = useMemo(() => new LineBasicMaterial({ color: o.kind === 'longitudinal-wave' ? muted : color, transparent: true, opacity: .75, depthTest: false }), [color, muted, o.kind]);
  const spotMaterial = useMemo(() => new MeshBasicMaterial({ ...(o.kind === 'paraxial-eye' ? { color } : {}), transparent: true, opacity: .6, depthTest: false, side: DoubleSide }), [color, o.kind]);
  const sphere = useMemo(() => new SphereGeometry(o.kind === 'longitudinal-wave' ? .007 : 1, 10, 8), [o.kind]);
  const lines = useMemo(() => {
    const vertices: number[] = [];
    if (o.kind === 'paraxial-eye' && eye) for (const p of eye.points) for (const ray of p.rays) for (const endpoint of [ray.object, ray.lens, ray.lens, ray.retina]) vertices.push(...endpoint.map((v, i) => o.origin[i]! + v * o.cmToScene));
    else if (o.kind === 'longitudinal-wave') {
      const t = Math.abs(o.axis[1]) < .9 ? [-o.axis[2], 0, o.axis[0]] : [0, -o.axis[2], o.axis[1]];
      // A perpendicular tick plane; for the authored horizontal row use vertical ticks.
      const cross = [t[1]!*o.axis[2]-t[2]!*o.axis[1],t[2]!*o.axis[0]-t[0]!*o.axis[2],t[0]!*o.axis[1]-t[1]!*o.axis[0]], norm = Math.hypot(...cross);
      const world = (x: number, y: number) => o.origin.map((v,i)=>v+o.axis[i]!*x+cross[i]!/norm*y);
      vertices.push(...world(0, -.025), ...world(2, -.025));
      for (let i = 0; i < o.count; i++) vertices.push(...world(i * o.spacing, -.035), ...world(i * o.spacing, -.015));
    }
    return new BufferGeometry().setAttribute('position', new BufferAttribute(new Float32Array(vertices), 3));
  }, [o, eye]);
  const eyeDebug = useMemo(() => {
    if (o.kind !== 'paraxial-eye' || !eye) return undefined;
    const actual = lines.getAttribute('position').array;
    const vertex = (i: number) => [Number(actual[i]), Number(actual[i+1]), Number(actual[i+2])];
    return { ...eye, active: visible, hiddenReason: reason, readings: q, rendered: eye.points.map((p, pi) => p.rays.map((_, ri) => { const i = (pi * 3 + ri) * 12; return { object:vertex(i),lens:vertex(i+3),retina:vertex(i+9) }; })) };
  }, [o, eye, lines, visible, reason, q]);
  useEffect(() => () => { if(o.kind === 'paraxial-eye') bridge.senses.eye = undefined; }, [bridge, o.kind]);
  useEffect(() => () => lines.dispose(), [lines]);
  useEffect(() => () => sphere.dispose(), [sphere]);
  useEffect(() => () => lineMaterial.dispose(), [lineMaterial]);
  useEffect(() => () => spotMaterial.dispose(), [spotMaterial]);
  useEffect(() => {
    if (o.kind !== 'longitudinal-wave') return;
    bridge.sensesSeek = (cycles) => { if (!Number.isFinite(cycles)) return false; phase.current = cycles; hold.current = true; bridge.invalidate(); return true; };
    return () => { bridge.sensesSeek = () => false; bridge.senses.wave = undefined; };
  }, [bridge, o.kind]);
  useEffect(() => { phase.current = 0; hold.current = false; bridge.invalidate(); }, [snapKey, phaseKey, bridge]);
  useEffect(() => { hold.current = false; bridge.invalidate(); }, [run, values, bridge]);
  useFrame((state, dt) => {
    if (!sim.senses || !particles.current) return;
    const mesh = particles.current, m = matrix;
    const frameReason = exploded || runtime.explode > 0 ? 'exploded' : reason;
    const frameVisible = frameReason === null;
    if (group.current) group.current.visible = frameVisible;
    if (o.kind === 'paraxial-eye' && eye) {
      eye.points.forEach((p, i) => { const r = q['focus-state'] === 'on-retina' ? .0003 : p.spotDiameter * o.cmToScene / 2; m.makeScale(.0015, r, r); m.setPosition(o.origin[0] + eye.r * o.cmToScene, o.origin[1] + p.centerY * o.cmToScene, o.origin[2]); mesh.setMatrixAt(i, m); });
      if (eyeDebug) { eyeDebug.active = frameVisible; eyeDebug.hiddenReason = frameReason; }
      bridge.senses.eye = eyeDebug;
    } else if (o.kind === 'longitudinal-wave') {
      const hz = numberOf(q['visual-hz']), A = numberOf(q['displacement-max']), lambda = numberOf(q['wavelength-scene']);
      const playing = frameVisible && run && hz > 0 && !hold.current && !prefersReducedMotion();
      if (playing) phase.current += Math.min(dt, MAX_DT) * hz;
      for (let i = 0; i < o.count; i++) { const x = wave.rests[i]! + A * Math.sin(2*Math.PI*(wave.rests[i]!/lambda-phase.current)); wave.positions[i] = x; m.makeTranslation(o.origin[0] + o.axis[0]*x, o.origin[1] + o.axis[1]*x, o.origin[2]+o.axis[2]*x); mesh.setMatrixAt(i,m); mesh.setColorAt(i,i===o.referenceIndex?color:muted); }
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      wave.phaseCycles = phase.current; wave.visualHz = hz; wave.lambda = lambda; wave.A = A; wave.playing = playing; wave.slowFactor = sim.senses.sound.slowFactor; wave.active = frameVisible; wave.hiddenReason = frameReason;
      bridge.senses.wave = wave;
      if (playing) keepAnimating(state.invalidate);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });
  return <group ref={group} visible={visible}>
    <lineSegments geometry={lines} material={lineMaterial} frustumCulled={false} raycast={() => {}} />
    <instancedMesh ref={particles} args={[sphere, spotMaterial, o.kind === 'paraxial-eye' ? 2 : o.count]} frustumCulled={false} raycast={() => {}} />
  </group>;
}
