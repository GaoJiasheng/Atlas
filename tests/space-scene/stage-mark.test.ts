import { afterEach, describe, expect, it, vi } from 'vitest';
import { Scene, PerspectiveCamera, type WebGLRenderer } from 'three';
import { createBridge } from '../../src/engines/space-scene/bridge';
import { StageMark } from '../../src/engines/space-scene/stages/model3d/StageMark';

const hooks = vi.hoisted(() => ({
  frame:null as null | ((state:any)=>void),
  cleanup:[] as (()=>void)[],
  invalidate:vi.fn(),
}));
vi.mock('react',() => ({
  useRef:(value:unknown)=>({current:value}),
  useEffect:(fn:()=>()=>void)=>hooks.cleanup.push(fn()),
}));
vi.mock('@react-three/fiber',() => ({
  useThree:(select:(s:unknown)=>unknown)=>select({invalidate:hooks.invalidate}),
  useFrame:(fn:(state:any)=>void)=>{hooks.frame=fn;},
}));
afterEach(() => {
  hooks.cleanup.splice(0).forEach(fn=>fn());
  hooks.invalidate.mockClear();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('draw fence and demand-loop handoff', () => {
  it('does not release model readiness until the GPU fence signals, then wakes the waiting camera', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('window',{setTimeout,clearTimeout});
    let frame:()=>void = ()=>{};
    vi.stubGlobal('requestAnimationFrame',(fn:()=>void)=>{frame=fn;return 1;});
    vi.stubGlobal('cancelAnimationFrame',()=>{});
    class FakeGl2 {
      SYNC_GPU_COMMANDS_COMPLETE=1; SYNC_STATUS=2; SIGNALED=3; status=4;
      fenceSync(){return {};}
      flush(){}
      isContextLost(){return false;}
      getSyncParameter(){return this.status;}
      deleteSync(){}
    }
    vi.stubGlobal('WebGL2RenderingContext',FakeGl2);
    const gpu = new FakeGl2(), bridge = createBridge();
    let compile:()=>void = ()=>{};
    const gl = {render:()=>{},compileAsync:()=>new Promise<void>(resolve=>{compile=resolve;}),getContext:()=>gpu} as unknown as WebGLRenderer;
    const state = {gl,scene:new Scene(),camera:new PerspectiveCamera(),invalidate:hooks.invalidate};
    StageMark({bridge,name:'model'});
    hooks.frame!(state);
    expect(bridge.stageMarks.has('model')).toBe(false);
    compile();
    await Promise.resolve();
    hooks.frame!(state);
    frame();
    await vi.advanceTimersByTimeAsync(32);
    expect(bridge.stageMarks.has('model')).toBe(false);
    const before = hooks.invalidate.mock.calls.length;
    gpu.status = gpu.SIGNALED;
    await vi.advanceTimersByTimeAsync(16);
    expect(bridge.stageMarks.has('model')).toBe(true);
    expect(hooks.invalidate.mock.calls.length).toBe(before+1);
  });
});
