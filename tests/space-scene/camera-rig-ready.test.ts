/** Exercise the actual camera subscription/frame handoff, with no renderer or browser. */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Object3D, PerspectiveCamera, Vector3 } from 'three';
import { CameraRig } from '../../src/engines/space-scene/stages/model3d/CameraRig';
import type { PartHandle } from '../../src/engines/space-scene/stages/model3d/PartNode';
import { createBridge } from '../../src/engines/space-scene/bridge';
import { createSpaceUi } from '../../src/engines/space-scene/ui';
import { createSceneStore } from '../../src/engines/core/store';
import { spaceSceneEngine, type SpaceSceneExt } from '../../src/engines/space-scene';
import type { OrbitCamera, SceneSnapshot, TopicMeta } from '../../src/engines/core/types';
import { viewsSchema } from '../../src/engines/space-scene/schema';
import { fitCameraToAspect } from '../../src/engines/space-scene/lib/camera';
import { fitCameraToHud } from '../../src/engines/space-scene/lib/hud-framing';
import { fitExerciseCamera } from '../../src/engines/space-scene/lib/camera';

const hooks = vi.hoisted(()=>({state:null as any,frame:null as any,effects:[] as (()=>void|(()=>void))[],cleanup:[] as (()=>void)[]}));
vi.mock('react',async original=>({
  ...await original<typeof import('react')>(),
  useRef:(current:unknown)=>({current}),
  useState:(value:unknown)=>[value,()=>{}],
  useEffect:(fn:()=>void|(()=>void))=>hooks.effects.push(fn),
}));
vi.mock('@react-three/fiber',()=>({useThree:(fn:(s:any)=>unknown)=>fn(hooks.state),useFrame:(fn:unknown)=>{hooks.frame=fn;}}));
vi.mock('@react-three/drei/core/OrbitControls',()=>({OrbitControls:()=>null}));
vi.mock('zustand',()=>({useStore:(store:any,select:(s:any)=>unknown)=>select(store.getState())}));
beforeEach(()=>{
  vi.stubGlobal('window',{matchMedia:()=>({matches:true})});
  vi.stubGlobal('matchMedia',()=>({matches:true}));
  vi.stubGlobal('document',{hidden:false});
});
afterEach(()=>{
  hooks.cleanup.splice(0).forEach(fn=>fn());
  hooks.effects.length=0;
  vi.unstubAllGlobals();
});
const authored:OrbitCamera={position:[0,.5,3],target:[0,0,0],fov:30};
function setup(exerciseView: Parameters<typeof CameraRig>[0]['exerciseView'] = ()=>null) {
  const camera=new PerspectiveCamera(30,1200/840,.01,1000);
  camera.position.set(0,0,99);
  const invalidate=vi.fn();
  hooks.state={camera,size:{width:1200,height:840},invalidate,get:()=>hooks.state};
  const bridge=createBridge(),ui=createSpaceUi();
  bridge.freeStage={x0:260,y0:12,x1:940,y1:790};
  bridge.hudLayout=1;
  bridge.hudPending=false;
  bridge.modelExpected=true;
  const store=createSceneStore<SpaceSceneExt>({chapters:[],defaults:{
    ...spaceSceneEngine.defaults({} as TopicMeta,undefined),chapter:null,layers:['g'],camera:authored,theme:undefined,
  } as SceneSnapshot<SpaceSceneExt>});
  const handle={visible:true,object:new Object3D(),offset:[0,0,0],half:[5,5,5]} as unknown as PartHandle;
  const views=viewsSchema.parse({assembled:{camera:authored},exploded:{camera:authored},hudFrame:{parts:['body']}});
  const element=CameraRig({store,ui,bridge,chapters:[],views,sphere:{center:[0,0,0],radius:1},minDistance:.9,
    span:()=>null,exerciseView,handles:new Map([['body',handle]])});
  const props=element.props as any;
  props.ref.current={target:new Vector3(),update:()=>{camera.lookAt(0,0,0);}};
  for(const effect of hooks.effects.splice(0)) {const off=effect();if(off)hooks.cleanup.push(off);}
  return {camera,bridge,store,ui,handle,props,frame:()=>hooks.frame(hooks.state,.016)};
}
describe('hudFrame ready handoff',()=>{
  it('keeps an exercise selected during model loading through the HUD fence and a snap',()=>{
    const s=setup(()=>({azimuth:0,elevation:0,fill:undefined,yaw:0}));
    s.store.getState().patch({exercise:{id:'lift',phase:'start'}});
    s.bridge.exerciseFrame={id:'lift',points:new Float32Array([-.2,-1,0,.2,1,0])};
    s.handle.half=[.2,.2,.2];
    s.frame();
    expect(s.camera.position.z).toBe(99);
    s.store.getState().snap();
    const id=s.store.getState().transition.id;
    s.bridge.stageMarks.add('scene');s.bridge.stageMarks.add('model');
    s.frame();
    expect(s.camera.position.z).toBeLessThan(99);
    expect(s.bridge.settledTransition).toBe(id);
    expect(s.bridge.hudSettled).toBe(true);
  });
  it('fits an exercise after its sweep arrives and then frames it for the HUD',()=>{
    const s=setup(()=>({azimuth:0,elevation:0,fill:undefined,yaw:0}));
    s.bridge.stageMarks.add('scene');
    s.bridge.stageMarks.add('model');
    s.handle.half=[.2,.2,.2];
    s.frame();
    s.store.getState().patch({exercise:{id:'lift',phase:'start'}});
    const before=s.camera.position.toArray();
    s.frame();
    expect(s.camera.position.toArray()).toEqual(before);
    const points=new Float32Array([-.2,-1,0,.2,1,0]);
    s.bridge.exerciseFrame={id:'lift',points};
    s.frame();
    const expected=fitCameraToHud(fitCameraToAspect(fitExerciseCamera(points,[0,0,1],1200/840)!,1200/840),
      [{center:[0,0,0],half:[.2,.2,.2]}],1200,840,s.bridge.freeStage!,{panels:[]});
    s.camera.position.toArray().forEach((v,i)=>expect(v).toBeCloseTo(expected.position[i]!,10));
  });
  it('waits through stand-in geometry, keeps the latest preset/snap, and settles only after fitting final bounds',()=>{
    const s=setup();
    s.frame();
    expect(s.camera.position.z).toBe(99);
    expect(s.bridge.hudSettled).toBe(false);
    const next={...authored,position:[1,.5,3] as [number,number,number]};
    s.store.getState().applyCameraPreset(next);
    s.store.getState().snap();
    const id=s.store.getState().transition.id;
    s.handle.half=[.2,.2,.2];
    s.bridge.stageMarks.add('scene');
    s.frame();
    expect(s.camera.position.z).toBe(99);
    expect(s.bridge.settledTransition).toBeLessThan(id);
    s.bridge.stageMarks.add('model');
    s.frame();
    const expected=fitCameraToHud(fitCameraToAspect(next,1200/840),[{center:[0,0,0],half:[.2,.2,.2]}],1200,840,s.bridge.freeStage!,{panels:[]});
    s.camera.position.toArray().forEach((v,i)=>expect(v).toBeCloseTo(expected.position[i]!,10));
    expect(s.bridge.hudSettled).toBe(true);
    expect(s.bridge.settledTransition).toBe(id);
  });
  it('cancels a waiting authored move when the reader takes over the camera',()=>{
    const s=setup();
    s.props.onStart();
    s.bridge.stageMarks.add('scene');
    s.bridge.stageMarks.add('model');
    s.frame();
    expect(s.camera.position.z).toBe(99);
  });
  it('does not apply a waiting HUD composition over the cover camera',()=>{
    const s=setup();
    s.ui.setState({cover:true});
    const covered=s.camera.position.toArray();
    s.bridge.stageMarks.add('scene');
    s.bridge.stageMarks.add('model');
    s.frame();
    expect(s.camera.position.toArray()).toEqual(covered);
    expect(s.bridge.hudSettled).toBe(false);
  });
});
