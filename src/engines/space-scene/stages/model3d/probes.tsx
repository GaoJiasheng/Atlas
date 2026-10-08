/**
 * Per-frame helpers of the stage that feed the HUD through the bridge
 * (no allocation per frame; module-level temporaries):
 *
 *  - LabelProbe: projects every part's label anchor to stage pixels, checks
 *    occlusion with a throttled raycast (two parts per frame, only after the
 *    camera or the parts moved) and notifies the HUD listeners
 *  - StatsProbe: renderer counters and a rolling FPS (`__atlas.stats()`, perf readout)
 *  - ShadowUpdater: one shadow-map update when something that casts moved
 *  - ResolutionGovernor: drops the pixel ratio while frames are slow (perf-lessons §3)
 */
import { useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Matrix4, Raycaster, Vector3, type Intersection, type Object3D, type Plane, type WebGLRenderer } from 'three';
import type { ScreenAnchor, StageBridge } from '../../bridge';
import type { PartHandle } from './PartNode';
import { keepAnimating, type StageRuntime } from './runtime';

const _p = new Vector3();
const _dir = new Vector3();
const _hits: Intersection[] = [];
/** Occlusion checks per frame. */
const CHECKS_PER_FRAME = 2;

export function LabelProbe({
  bridge,
  handles,
  clipping,
  xray,
  runtime,
}: {
  bridge: StageBridge;
  handles: Map<string, PartHandle>;
  clipping: Plane[] | null;
  xray: boolean;
  runtime: StageRuntime;
}) {
  const st = useMemo(
    () => ({ raycaster: new Raycaster(), lastCam: new Matrix4(), lastExplode: -1, stale: new Set<string>(), occluders: [] as Object3D[] }),
    [],
  );
  // Anything that changes what hides what re-checks every label.
  useEffect(() => {
    for (const id of handles.keys()) st.stale.add(id);
    bridge.invalidate();
  }, [st, handles, clipping, xray, bridge]);

  const clipped = (p: Vector3) => clipping !== null && clipping.some((pl) => pl.distanceToPoint(p) < 0);

  useFrame((state) => {
    const camera = state.camera;
    camera.updateMatrixWorld();
    const W = state.size.width;
    const H = state.size.height;
    bridge.width = W;
    bridge.height = H;
    if (!st.lastCam.equals(camera.matrixWorld) || st.lastExplode !== runtime.explode) {
      st.lastCam.copy(camera.matrixWorld);
      st.lastExplode = runtime.explode;
      for (const id of handles.keys()) st.stale.add(id);
    }

    for (const [id, h] of handles) {
      let a: ScreenAnchor | undefined = bridge.anchors.get(id);
      if (!a) {
        a = { x: 0, y: 0, onScreen: false, occluded: false, shown: false, depth: 0 };
        bridge.anchors.set(id, a);
      }
      _p.set(h.object.position.x + h.offset[0], h.object.position.y + h.offset[1], h.object.position.z + h.offset[2]);
      a.shown = h.visible && !clipped(_p);
      a.depth = _p.distanceTo(camera.position);
      _p.project(camera);
      a.x = (_p.x * 0.5 + 0.5) * W;
      a.y = (-_p.y * 0.5 + 0.5) * H;
      a.onScreen = _p.z > -1 && _p.z < 1 && Math.abs(_p.x) < 1.02 && Math.abs(_p.y) < 1.02;
    }
    for (const id of bridge.anchors.keys()) if (!handles.has(id)) bridge.anchors.delete(id);

    // Throttled occlusion: a couple of stale labels per frame.
    let budget = CHECKS_PER_FRAME;
    for (const id of st.stale) {
      if (budget-- <= 0) break;
      st.stale.delete(id);
      const h = handles.get(id);
      const a = bridge.anchors.get(id);
      if (!h || !a) continue;
      if (xray || !a.shown) {
        a.occluded = false;
        continue;
      }
      st.occluders.length = 0;
      for (const [other, oh] of handles) if (other !== id && oh.visible && oh.fade > 0.6) st.occluders.push(...oh.meshes);
      _p.set(h.object.position.x + h.offset[0], h.object.position.y + h.offset[1], h.object.position.z + h.offset[2]);
      _dir.subVectors(_p, camera.position);
      const dist = _dir.length();
      st.raycaster.set(camera.position, _dir.normalize());
      st.raycaster.far = Math.max(0, dist - 0.02);
      _hits.length = 0;
      st.raycaster.intersectObjects(st.occluders, false, _hits);
      a.occluded = _hits.some((hit) => !clipped(hit.point));
    }

    for (const listener of bridge.listeners) listener();
    if (st.stale.size > 0) keepAnimating(state.invalidate);
  });
  return null;
}

export function StatsProbe({ bridge }: { bridge: StageBridge }) {
  const gl = useThree((s) => s.gl) as unknown as WebGLRenderer;
  const st = useMemo(() => ({ last: 0, samples: new Float32Array(60), n: 0, i: 0 }), []);
  useEffect(() => {
    const ctx = gl.getContext();
    const ext = ctx.getExtension('WEBGL_debug_renderer_info');
    bridge.stats.gpu = ext ? String(ctx.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : undefined;
  }, [gl, bridge]);
  useFrame(() => {
    const now = performance.now();
    const dt = now - st.last;
    st.last = now;
    // Idle gaps of the demand frameloop are not frame times.
    if (dt > 0 && dt < 250) {
      st.samples[st.i] = dt;
      st.i = (st.i + 1) % st.samples.length;
      st.n = Math.min(st.n + 1, st.samples.length);
      let sum = 0;
      for (let k = 0; k < st.n; k++) sum += st.samples[k]!;
      bridge.stats.fps = st.n >= 5 ? 1000 / (sum / st.n) : bridge.stats.fps;
    }
    bridge.stats.lastFrame = now;
    bridge.stats.buffer[0] = gl.domElement.width;
    bridge.stats.buffer[1] = gl.domElement.height;
    const info = gl.info;
    bridge.stats.calls = info.render.calls;
    bridge.stats.triangles = info.render.triangles;
    bridge.stats.geometries = info.memory.geometries;
    bridge.stats.textures = info.memory.textures;
  });
  return null;
}

export function ShadowUpdater({ runtime }: { runtime: StageRuntime }) {
  const gl = useThree((s) => s.gl) as unknown as WebGLRenderer;
  useFrame(() => {
    if (runtime.shadowDirty) {
      gl.shadowMap.needsUpdate = true;
      runtime.shadowDirty = false;
    }
  });
  return null;
}

/** Frame time (ms) above which a run of frames counts as slow, and the run length. */
const SLOW_MS = 45;
const SLOW_RUN = 6;
const FAST_MS = 20;
const FAST_RUN = 240;
const STEPS = [1, 0.75, 0.5] as const;

/**
 * Dynamic resolution (perf-lessons §3): a run of slow consecutive frames
 * steps the pixel ratio down (1 → 0.75 → 0.5 of the clamped ratio); a long
 * run of fast frames steps it back up. Idle gaps of the demand frameloop are
 * not frames, so only runs of back-to-back frames count.
 */
export function ResolutionGovernor({ bridge, base }: { bridge: StageBridge; base: () => number }) {
  const setDpr = useThree((s) => s.setDpr);
  const st = useMemo(() => ({ last: 0, slow: 0, fast: 0, step: 0 }), []);
  useFrame(() => {
    const now = performance.now();
    const dt = now - st.last;
    st.last = now;
    if (dt <= 0 || dt > 1500) {
      st.slow = 0;
      return;
    }
    if (dt > SLOW_MS) {
      st.slow++;
      st.fast = 0;
    } else {
      st.slow = 0;
      if (dt < FAST_MS) st.fast++;
    }
    let step = st.step;
    if (st.slow >= SLOW_RUN && step < STEPS.length - 1) step++;
    else if (st.fast >= FAST_RUN && step > 0) step--;
    if (step !== st.step) {
      st.step = step;
      st.slow = 0;
      st.fast = 0;
      bridge.resolution = STEPS[step]!;
      setDpr(base() * bridge.resolution);
    }
  });
  return null;
}
