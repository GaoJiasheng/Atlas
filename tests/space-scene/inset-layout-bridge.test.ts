import { afterEach, describe, expect, it, vi } from 'vitest';
import { InsetFrames } from '../../src/engines/space-scene/hud/InsetFrames';
import { createBridge, type ScreenAnchor } from '../../src/engines/space-scene/bridge';
import type { PartsFile } from '../../src/engines/space-scene/schema';
import type { LeaderPlace } from '../../src/engines/space-scene/lib/leader-layout';
import { layoutLeaders, segmentThroughRect } from '../../src/engines/space-scene/lib/leader-layout';

const hooks=vi.hoisted(()=>({cleanup:[] as (()=>void)[],root:null as unknown}));
vi.mock('react',async original=>({
  ...await original<typeof import('react')>(),useRef:(current:unknown)=>({current:hooks.root??current}),
  useEffect:()=>{},useLayoutEffect:(fn:()=>void|(()=>void))=>{const off=fn();if(off)hooks.cleanup.push(off);},
}));
vi.mock('../../src/engines/core/context',()=>({useSceneContext:()=>({locale:'en'})}));
afterEach(()=>{hooks.cleanup.splice(0).forEach(fn=>fn());hooks.root=null;});

describe('lazy inset barrier provider',()=>{
  it('keeps the measured title a hard barrier in a crowded 1024×768 view, including glides',()=>{
    hooks.root={querySelectorAll:()=>[{getComputedTextLength:()=>238}]};
    const bridge=createBridge();bridge.width=1024;bridge.height=768;
    bridge.anchors.set('body',{x0:410,y0:310,x1:690,y1:490,shown:true,onScreen:true} as ScreenAnchor);
    InsetFrames({file:{views:{insets:[{id:'window',parts:['body'],label:{en:'Enlarged schematic',zh:'放大示意'}}]}} as PartsFile,bridge});
    const inset=bridge.insetLayout!();
    const p:LeaderPlace={id:'hair-cell',side:'L',x0:200,x1:350,y0:240,y1:280,sx:356,ex:372,sy:249};
    expect(inset.clear(p,620,340)).toBe(false);
    // Even a caller compiled against the old optional flag cannot bypass the title.
    expect(Reflect.apply(inset.clear,undefined,[p,620,340,0,0,false])).toBe(false);
    const item={id:'hair-cell',ax:620,ay:340,w:150,h:40,lead:9,bounds:null,prev:null};
    const frame={width:1024,height:768,left:14,right:1010,top:14,bottom:700,obstacles:inset.bodies};
    const places=layoutLeaders([item],{...frame,accept:(p,i)=>inset.clear(p,i.ax,i.ay)});
    expect(places).toHaveLength(1);
    const title={x0:402,y0:283,x1:648,y1:298};
    for(const q of places){
      expect(segmentThroughRect(q.sx,q.sy,q.ex,q.sy,title,0)).toBe(false);
      expect(segmentThroughRect(q.ex,q.sy,item.ax,item.ay,title,0)).toBe(false);
      expect(inset.clear(q,item.ax,item.ay,p.x0-q.x0,p.y0-q.y0)).toBe(false);
    }
    // A fully blocked view omits the callout, keeping the title readable.
    expect(layoutLeaders([item],{...frame,top:240,bottom:280,obstacles:[...inset.bodies,{x0:0,y0:0,x1:1024,y1:768}],accept:(p,i)=>inset.clear(p,i.ax,i.ay)})).toEqual([]);
  });
  it('tries just outside the framed window when the anchor sits under its title',()=>{
    hooks.root={querySelectorAll:()=>[{getComputedTextLength:()=>214}]};
    const bridge=createBridge();bridge.width=1024;bridge.height=768;
    bridge.anchors.set('strip',{x0:585,y0:355,x1:855,y1:500,shown:true,onScreen:true} as ScreenAnchor);
    bridge.anchors.set('cell',{x0:770,y0:352,x1:800,y1:470,shown:true,onScreen:true} as ScreenAnchor);
    InsetFrames({file:{views:{insets:[{id:'window',parts:['strip','cell'],label:{en:'Enlarged schematic',zh:'放大示意'}}]}} as PartsFile,bridge});
    const inset=bridge.insetLayout!();
    expect(inset.frames).toHaveLength(1);
    const r=inset.frames[0]!;
    // The anchor: a bundle tip just inside the frame's top edge, under the title.
    const item={id:'cell',ax:790,ay:r.y0+8,w:136,h:40,lead:9,bounds:{x0:770,y0:352,x1:800,y1:470},prev:null};
    const frame={width:1024,height:768,left:14,right:1010,top:14,bottom:520,obstacles:inset.bodies,accept:(p:LeaderPlace,i:{ax:number;ay:number})=>inset.clear(p,i.ax,i.ay)};
    const places=layoutLeaders([item],{...frame,beside:inset.frames});
    expect(places).toHaveLength(1);
    const q=places[0]!;
    expect(q.x1<r.x0||q.x0>r.x1).toBe(true);
    expect(inset.clear(q,item.ax,item.ay)).toBe(true);
  });
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
