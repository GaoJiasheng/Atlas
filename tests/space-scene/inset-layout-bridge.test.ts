import { afterEach, describe, expect, it, vi } from 'vitest';
import { InsetFrames } from '../../src/engines/space-scene/hud/InsetFrames';
import { createBridge, type ScreenAnchor } from '../../src/engines/space-scene/bridge';
import type { PartsFile } from '../../src/engines/space-scene/schema';
import type { LeaderPlace } from '../../src/engines/space-scene/lib/leader-layout';

const hooks=vi.hoisted(()=>({cleanup:[] as (()=>void)[]}));
vi.mock('react',async original=>({
  ...await original<typeof import('react')>(),useRef:(current:unknown)=>({current}),
  useEffect:()=>{},useLayoutEffect:(fn:()=>void|(()=>void))=>{const off=fn();if(off)hooks.cleanup.push(off);},
}));
vi.mock('../../src/engines/core/context',()=>({useSceneContext:()=>({locale:'en'})}));
afterEach(()=>hooks.cleanup.splice(0).forEach(fn=>fn()));

describe('lazy inset barrier provider',()=>{
  it('installs only for inset data, follows live projected bounds and removes itself on unmount',()=>{
    const bridge=createBridge();bridge.width=800;bridge.height=600;
    expect(bridge.insetLayout).toBeUndefined();
    const file={views:{insets:[{id:'window',parts:['body'],label:{en:'Window',zh:'放大窗'}}]}} as PartsFile;
    const body={x0:100,y0:100,x1:200,y1:200,shown:true,onScreen:true} as ScreenAnchor;
    bridge.anchors.set('body',body);
    InsetFrames({file,bridge});
    const p:LeaderPlace={id:'ear',side:'L',x0:300,y0:380,x1:450,y1:420,sx:456,ex:472,sy:389};
    expect(bridge.insetLayout!().bodies).toEqual([body]);
    expect(bridge.insetLayout!().clear(p,500,400)).toBe(true);
    expect(bridge.insetLayout!().clear(p,500,400,-200,-250)).toBe(false);
    Object.assign(body,{x0:250,y0:260,x1:450,y1:480});
    expect(bridge.insetLayout!().clear(p,500,400)).toBe(false);
    body.shown=false;
    expect(bridge.insetLayout!().bodies).toEqual([]);
    expect(bridge.insetLayout!().clear(p,500,400)).toBe(true);
    hooks.cleanup.splice(0).forEach(fn=>fn());
    expect(bridge.insetLayout).toBeUndefined();
  });
});
