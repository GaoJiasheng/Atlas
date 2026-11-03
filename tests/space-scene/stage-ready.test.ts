import { describe, expect, it } from 'vitest';
import { createBridge, stageReady } from '../../src/engines/space-scene/bridge';

describe('stage readiness', () => {
  it('waits for the lazily mounted scene, and for the overlays and the glb meshes when the scene has them', () => {
    const bridge = createBridge();
    expect(stageReady(bridge)).toBe(false);
    bridge.stageMarks.add('scene');
    expect(stageReady(bridge)).toBe(true);
    bridge.overlaysExpected = true;
    expect(stageReady(bridge)).toBe(false);
    bridge.stageMarks.add('overlays');
    expect(stageReady(bridge)).toBe(true);
    bridge.modelExpected = true;
    expect(stageReady(bridge)).toBe(false);
    bridge.stageMarks.add('model');
    expect(stageReady(bridge)).toBe(true);
  });
});

describe('GPU-drawn stage mark', () => {
  it('waits for the fence issued after the first frame, and does not wait without WebGL 2', async () => {
    const { whenGpuDone } = await import('../../src/engines/space-scene/stages/model3d/StageMark');
    const g = globalThis as Record<string, unknown>;
    const saved = { gl2: g.WebGL2RenderingContext, window: g.window };
    class FakeGl2 {
      SYNC_GPU_COMMANDS_COMPLETE = 1; SYNC_STATUS = 2; SIGNALED = 3; UNSIGNALED = 4;
      status = 4; flushed = 0; deleted = 0;
      fenceSync() { return {}; }
      flush() { this.flushed++; }
      isContextLost() { return false; }
      getSyncParameter() { return this.status; }
      deleteSync() { this.deleted++; }
    }
    g.WebGL2RenderingContext = FakeGl2;
    g.window = { setTimeout, clearTimeout };
    try {
      const gl = new FakeGl2();
      let done = 0;
      whenGpuDone(gl as unknown as WebGL2RenderingContext, () => done++);
      expect(gl.flushed).toBe(1);
      await new Promise((r) => setTimeout(r, 30));
      expect(done).toBe(0);
      gl.status = gl.SIGNALED;
      await new Promise((r) => setTimeout(r, 30));
      expect(done).toBe(1);
      expect(gl.deleted).toBe(1);
      let plain = 0;
      whenGpuDone({} as WebGLRenderingContext, () => plain++);
      expect(plain).toBe(1);
    } finally {
      g.WebGL2RenderingContext = saved.gl2;
      g.window = saved.window;
    }
  });
});

describe('held stage draws', () => {
  it('skips only the stage scene while held (matrices still update) and restores the renderer once every hold is released', async () => {
    const { holdDraws } = await import('../../src/engines/space-scene/stages/model3d/StageMark');
    const { Object3D, PerspectiveCamera, Scene } = await import('three');
    const drawn: unknown[] = [];
    const render = function (target: unknown) { drawn.push(target); };
    const gl = { render } as unknown as import('three').WebGLRenderer;
    const scene = new Scene(), other = new Scene(), camera = new PerspectiveCamera();
    const child = new Object3D();
    scene.add(child);
    child.position.x = 2;
    const a = holdDraws(gl, scene), b = holdDraws(gl, scene);
    gl.render(scene, camera);
    gl.render(other, camera);
    expect(drawn).toEqual([other]);
    expect(child.matrixWorld.elements[12]).toBe(2);
    a();
    a();
    gl.render(scene, camera);
    expect(drawn).toEqual([other]);
    b();
    expect(gl.render).toBe(render);
    gl.render(scene, camera);
    expect(drawn).toEqual([other, scene]);
  });
});
