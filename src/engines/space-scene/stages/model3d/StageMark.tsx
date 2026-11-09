/**
 * Marks lazily loaded stage content as drawn, for `__atlas.ready` (bridge.stageReady): once every sibling chunk has
 * arrived, the content's shader programs are compiled without blocking (`compileAsync`, KHR_parallel_shader_compile;
 * the stage holds its draws meanwhile instead of stalling the main thread in the first draw), then drawn, and the
 * mark is set when the GPU has finished that frame. The first draw of new content is where the GPU builds its
 * pipelines and takes in its buffers (under software WebGL most of a second): marking the frame when it was merely
 * submitted let `ready` resolve while it was still being drawn, so the next frame came late.
 */
import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import type { Camera, Object3D, WebGLRenderer } from 'three';
import type { StageBridge } from '../../bridge';

/** Longest wait for shader programs or the GPU before going on anyway (a context that never answers must not hold `ready` for good). */
const GPU_WAIT_MS = 10_000;

/** Calls `done` once the GPU has finished every command issued so far (at once without WebGL 2 fences). Returns a cancel. */
export function whenGpuDone(gl: WebGLRenderingContext | WebGL2RenderingContext, done: () => void): () => void {
  const gl2 = typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext ? gl : null;
  const sync = gl2?.fenceSync(gl2.SYNC_GPU_COMMANDS_COMPLETE, 0) ?? null;
  if (!gl2 || !sync) {
    done();
    return () => {};
  }
  gl2.flush();
  const start = performance.now();
  let timer = 0;
  // A fence's status changes only between tasks: poll from timers, without asking for frames.
  const poll = () => {
    if (gl2.isContextLost() || gl2.getSyncParameter(sync, gl2.SYNC_STATUS) === gl2.SIGNALED || performance.now() - start > GPU_WAIT_MS) {
      gl2.deleteSync(sync);
      done();
    } else timer = window.setTimeout(poll, 8);
  };
  timer = window.setTimeout(poll, 0);
  return () => {
    window.clearTimeout(timer);
    gl2.deleteSync(sync);
  };
}

const holds = new WeakMap<WebGLRenderer, { count: number; render: WebGLRenderer['render'] }>();

/**
 * Skip the stage's own draws of `scene` (matrices still update, as a draw would) until the returned release is called;
 * other renders (an environment map's) go through. Holds from several marks nest.
 */
export function holdDraws(gl: WebGLRenderer, scene: Object3D): () => void {
  let hold = holds.get(gl);
  if (!hold) {
    const render = gl.render;
    hold = { count: 0, render };
    holds.set(gl, hold);
    gl.render = function (this: WebGLRenderer, target: Object3D, camera: Camera) {
      if (target !== scene) return render.call(this, target, camera);
      if (target.matrixWorldAutoUpdate) target.updateMatrixWorld();
      if (camera.parent === null && camera.matrixWorldAutoUpdate) camera.updateMatrixWorld();
    };
  }
  const h = hold;
  h.count += 1;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    h.count -= 1;
    if (h.count === 0) {
      gl.render = h.render;
      holds.delete(gl);
    }
  };
}

type Phase = 'mounted' | 'compiling' | 'draw' | 'drawn';

/** Render it after its siblings: frame callbacks run in mount order, so the siblings have mounted by then. */
export function StageMark({ bridge, name }: { bridge: StageBridge; name: 'scene' | 'overlays' | 'model' }) {
  const invalidate = useThree((s) => s.invalidate);
  const phase = useRef<Phase>('mounted');
  const cancel = useRef<() => void>(() => {});
  useEffect(() => {
    phase.current = 'mounted';
    invalidate();
    return () => {
      phase.current = 'mounted';
      cancel.current();
      cancel.current = () => {};
      bridge.stageMarks.delete(name);
    };
  }, [bridge, name, invalidate]);
  useFrame((state) => {
    if (phase.current === 'mounted') {
      phase.current = 'compiling';
      const release = holdDraws(state.gl, state.scene);
      let timer = 0;
      let live = true;
      const go = () => {
        if (!live) return;
        live = false;
        window.clearTimeout(timer);
        release();
        phase.current = 'draw';
        state.invalidate();
      };
      timer = window.setTimeout(go, GPU_WAIT_MS);
      state.gl.compileAsync(state.scene, state.camera).then(go, go);
      cancel.current = () => {
        live = false;
        window.clearTimeout(timer);
        release();
      };
      return;
    }
    if (phase.current !== 'draw') return;
    phase.current = 'drawn';
    // Frame callbacks run before the frame's draw: the next animation frame comes after it has been issued.
    const frame = requestAnimationFrame(() => {
      cancel.current = whenGpuDone(state.gl.getContext(), () => {
        cancel.current = () => {};
        if (phase.current === 'drawn') {
          bridge.stageMarks.add(name);
          state.invalidate();
        }
      });
    });
    cancel.current = () => cancelAnimationFrame(frame);
  });
  return null;
}
