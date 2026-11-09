import { describe, expect, it } from 'vitest';
import { PerspectiveCamera, Vector3 } from 'three';
import { DESIGN_ASPECT, DESIGN_FREE, DESIGN_STAGE, fitCameraToHud, freeStageRect, stageFraming, type FrameBox, type FrameRect } from '../../src/engines/space-scene/lib/hud-framing';
import { fitCameraToAspect } from '../../src/engines/space-scene/lib/camera';
import type { OrbitCamera } from '../../src/engines/core/types';
import { viewsSchema } from '../../src/engines/space-scene/schema';
const cam: OrbitCamera = { position: [.3,.65,1.6], target: [.3,0,0], fov: 46 };
const bodies: FrameBox[] = [{center:[0,0,0],half:[.12,.12,.12]}, {center:[.75,0,0],half:[.033,.033,.033]}];
function checkProjection(camera: OrbitCamera, boxes: FrameBox[], w: number, h: number, rect: FrameRect) {
  const c = new PerspectiveCamera(camera.fov, w/h, .001, 1000);
  c.position.fromArray(camera.position); c.lookAt(...camera.target); c.updateMatrixWorld();
  for (const b of boxes) for (let k=0; k<8; k++) {
    const p = new Vector3(...b.center.map((v,i) => v + (k & 1<<i ? 1 : -1) * b.half[i]!) as [number,number,number]).project(c);
    const x = (p.x+1)*w/2, y = (1-p.y)*h/2;
    expect(x).toBeGreaterThanOrEqual(rect.x0-1e-6); expect(x).toBeLessThanOrEqual(rect.x1+1e-6);
    expect(y).toBeGreaterThanOrEqual(rect.y0-1e-6); expect(y).toBeLessThanOrEqual(rect.y1+1e-6);
  }
}
describe('HUD-aware perspective framing', () => {
  it('keeps an already fitting desktop composition exactly unchanged', () => {
    expect(fitCameraToHud(cam,bodies,1200,840,{x0:260,y0:12,x1:940,y1:790})).toBe(cam);
  });
  it.each([[880,650,260,590],[624,670,250,374],[1017,703,280,713],[390,720,12,378]])('fits asymmetric free bands at %i × %i without size-specific tuning', (w,h,left,right) => {
    const rect = {x0:left,y0:40,x1:right,y1:h-90};
    const fitted = fitCameraToHud(fitCameraToAspect(cam,w/h),bodies,w,h,rect);
    checkProjection(fitted,bodies,w,h,rect);
    expect(fitted.fov).toBe(cam.fov);
    expect(Math.hypot(...fitted.position.map((v,i)=>v-fitted.target[i]!))).toBeGreaterThanOrEqual(Math.hypot(...cam.position.map((v,i)=>v-cam.target[i]!))-1e-9);
  });
  it('handles depth and an off-centre vertical band, and ignores an intentionally offscreen Sun', () => {
    const boxes: FrameBox[] = [...bodies, {center:[.35,.3,.5],half:[.05,.05,.05]}];
    const rect={x0:260,y0:100,x1:580,y1:400};
    const fitted=fitCameraToHud(cam,[...boxes,{center:[-3.6,0,0],half:[.45,.45,.45]}],880,650,rect);
    expect(fitted).toEqual(fitCameraToHud(cam,boxes,880,650,rect));
    checkProjection(fitted,boxes,880,650,rect);
  });
  it('measures left/right panels and a bottom drawer, excluding panels outside the stage', () => {
    expect(freeStageRect(1000,700,[{x0:10,y0:20,x1:240,y1:500},{x0:710,y0:20,x1:980,y1:300},{x0:0,y0:600,x1:1000,y1:700},{x0:1000,y0:0,x1:1400,y1:700}])).toEqual({x0:252,y0:12,x1:698,y1:588});
  });
  it('keeps the full width on a stacked phone stage: only the top and bottom bands constrain', () => {
    // 390 × 844: a title block in the top-left corner, a layers card across the middle, the chapter bar at the bottom.
    expect(freeStageRect(390,844,[{x0:12,y0:82,x1:165,y1:180},{x0:175,y0:82,x1:378,y1:500},{x0:12,y0:733,x1:378,y1:778}])).toEqual({x0:12,y0:12,x1:378,y1:721});
  });
  it('returns the authored camera for unavailable layout or no subjects', () => {
    expect(fitCameraToHud(cam,bodies,0,0,{x0:0,y0:0,x1:0,y1:0})).toBe(cam);
    expect(fitCameraToHud(cam,[],800,600,{x0:10,y0:10,x1:790,y1:590})).toBe(cam);
  });
});

function projection(camera: OrbitCamera, box: FrameBox, w: number, h: number): FrameRect {
  const c = new PerspectiveCamera(camera.fov, w/h, .001, 1000);
  c.position.fromArray(camera.position); c.lookAt(...camera.target); c.updateMatrixWorld();
  const points = Array.from({length:8}, (_,k) => new Vector3(...box.center.map((v,i) => v+(k & 1<<i ? 1 : -1)*box.half[i]!) as [number,number,number]).project(c));
  return {x0:Math.min(...points.map(p => (p.x+1)*w/2)), x1:Math.max(...points.map(p => (p.x+1)*w/2)),
    y0:Math.min(...points.map(p => (1-p.y)*h/2)), y1:Math.max(...points.map(p => (1-p.y)*h/2))};
}
function checkHudClear(camera: OrbitCamera, boxes: FrameBox[], w: number, h: number, panels: FrameRect[]) {
  for (const b of boxes) {
    const r = projection(camera,b,w,h);
    for (const p of panels) expect(r.x1 <= p.x0-12+1e-6 || r.x0 >= p.x1+12-1e-6 ||
      r.y1 <= p.y0-12+1e-6 || r.y0 >= p.y1+12-1e-6).toBe(true);
  }
}
function checkRadius(camera: OrbitCamera, box: FrameBox, h: number, min: number) {
  const view = new Vector3(...camera.position).sub(new Vector3(...camera.target)).normalize();
  const depth = new Vector3(...camera.position).sub(new Vector3(...box.center)).dot(view);
  expect(Math.min(...box.half)*h/(2*Math.tan(camera.fov!*Math.PI/360)*depth)).toBeGreaterThanOrEqual(min-1e-6);
}
const narrowPanels: FrameRect[] = [
  {x0:12,y0:20,x1:250,y1:350}, {x0:350,y0:20,x1:612,y1:400},
  {x0:12,y0:430,x1:250,y1:580}, {x0:0,y0:610,x1:624,y1:670},
];
describe('primary radius and actual reserved HUD rectangles', () => {
  const primary: FrameBox = {...bodies[0]!,minRadiusPx:24};
  const sun: FrameBox = {center:[-3.6,0,0],half:[.45,.45,.45]};
  it('uses the space below a card to preserve Earth and Moon at a readable size in a 76px band', () => {
    const boxes = [primary,bodies[1]!,sun], rect = freeStageRect(624,670,narrowPanels);
    expect(rect.x1-rect.x0).toBe(76);
    const authored = fitCameraToAspect(cam,624/670);
    const old = fitCameraToHud(authored,bodies,624,670,rect);
    expect(projection(old,primary,624,670).x1-projection(old,primary,624,670).x0).toBeLessThan(25);
    const fitted = fitCameraToHud(authored,boxes,624,670,rect,{panels:narrowPanels});
    checkProjection(fitted,boxes.slice(0,2),624,670,{x0:12,y0:12,x1:612,y1:658});
    checkRadius(fitted,primary,670,24);
    checkHudClear(fitted,boxes,624,670,narrowPanels);
    expect(fitted.fov).toBe(cam.fov);
    const direction = (c: OrbitCamera) => new Vector3(...c.position).sub(new Vector3(...c.target)).normalize().toArray();
    direction(fitted).forEach((v,i) => expect(v).toBeCloseTo(direction(cam)[i]!,12));
  });
  it('keeps an authored-offscreen Sun out of left-column text after pullback brings it into view', () => {
    const panel = {x0:12,y0:12,x1:250,y1:350}, rect = {x0:262,y0:12,x1:338,y1:598};
    const old = fitCameraToHud(cam,[...bodies,sun],624,670,rect);
    const r = projection(old,sun,624,670);
    expect(r.x1).toBeGreaterThan(panel.x0); expect(r.x0).toBeLessThan(panel.x1);
    expect(r.y1).toBeGreaterThan(panel.y0); expect(r.y0).toBeLessThan(panel.y1);
    const fitted = fitCameraToHud(cam,[...bodies,sun],624,670,rect,{panels:[panel]});
    checkProjection(fitted,bodies,624,670,{x0:12,y0:12,x1:612,y1:658});
    checkHudClear(fitted,[...bodies,sun],624,670,[panel]);
  });
  it('can move closer when the authored primary already falls below the size floor', () => {
    const wide = {...cam,position:[.3,6.5,16] as [number,number,number]};
    const fitted = fitCameraToHud(wide,[primary],800,600,{x0:12,y0:12,x1:788,y1:588},{panels:[]});
    checkRadius(fitted,primary,600,24);
    expect(fitCameraToHud(wide,[primary],800,600,{x0:12,y0:12,x1:788,y1:588})).toEqual(fitted);
    checkProjection(fitted,[primary],800,600,{x0:12,y0:12,x1:788,y1:588});
  });
  it('does not assign the floor to another body when the primary is absent or intentionally excluded', () => {
    const rect = {x0:12,y0:12,x1:788,y1:588};
    const missing = {...sun,minRadiusPx:24};
    expect(fitCameraToHud(cam,[...bodies,missing],800,600,rect,{panels:[]})).toEqual(fitCameraToHud(cam,bodies,800,600,rect));
    expect(fitCameraToHud(cam,bodies,800,600,rect,{panels:[]})).toEqual(fitCameraToHud(cam,bodies,800,600,rect));
  });
  it('retains an already fitting composition and recalculates from authored values as panels change', () => {
    const rect = {x0:12,y0:12,x1:1188,y1:828};
    expect(fitCameraToHud(cam,[primary,bodies[1]!],1200,840,rect,{panels:[]})).toBe(cam);
    const fit = (panels: FrameRect[]) => fitCameraToHud(cam,[primary,bodies[1]!],624,670,freeStageRect(624,670,panels),{panels});
    const expanded = fit(narrowPanels), collapsed = fit(narrowPanels.filter((_,i) => i!==1));
    expect(collapsed).not.toEqual(expanded);
    expect(fit(narrowPanels)).toEqual(expanded);
    checkRadius(collapsed,primary,670,24);
    checkHudClear(collapsed,[primary,bodies[1]!],624,670,narrowPanels.filter((_,i) => i!==1));
  });
  it('finds actual free space even when the legacy full-height band is empty', () => {
    const panels = [{x0:0,y0:0,x1:290,y1:200},{x0:310,y0:0,x1:624,y1:200}];
    const fitted = fitCameraToHud(cam,[primary,bodies[1]!],624,670,freeStageRect(624,670,panels),{panels});
    checkRadius(fitted,primary,670,24);
    checkHudClear(fitted,[primary,bodies[1]!],624,670,panels);
  });
  it('ignores secondaries fully behind the eye and rejects unsafe eye-plane straddling fits', () => {
    const straight: OrbitCamera = {position:[0,0,2],target:[0,0,0],fov:46};
    const earth: FrameBox = {center:[0,0,0],half:[.12,.12,.12],minRadiusPx:24};
    const behind: FrameBox = {center:[10,0,4],half:[.2,.2,.2]};
    const straddling: FrameBox = {center:[10,0,2],half:[.2,.2,.2]};
    const panels = [{x0:10,y0:10,x1:150,y1:200}], rect = freeStageRect(800,600,panels);
    const fitted = fitCameraToHud(straight,[earth,behind],800,600,rect,{panels});
    checkRadius(fitted,earth,600,24);
    checkHudClear(fitted,[earth],800,600,panels);
    // There is no obstruction in a layout without HUD blocks, even for a straddling offscreen body.
    expect(fitCameraToHud(straight,[earth,straddling],800,600,rect,{panels:[]})).toBe(straight);
    const safe = fitCameraToHud(straight,[earth,straddling],800,600,rect,{panels});
    expect([...safe.position,...safe.target].every(Number.isFinite)).toBe(true);
    checkHudClear(safe,[earth],800,600,panels);
  });
  it('validates a positive pixel floor on an explicitly listed primary only', () => {
    const schema = viewsSchema.shape.hudFrame;
    const value = {parts:['earth'],primary:{part:'earth',minRadiusPx:24}};
    expect(schema.safeParse(value).success).toBe(true);
    expect(schema.safeParse({parts:['earth']}).success).toBe(true);
    expect(schema.safeParse({...value,primary:{part:'moon',minRadiusPx:24}}).success).toBe(false);
    for (const minRadiusPx of [0,-1,Infinity,NaN])
      expect(schema.safeParse({...value,primary:{part:'earth',minRadiusPx}}).success).toBe(false);
  });
  it('returns a finite safe camera when the requested floor is geometrically impossible', () => {
    const tiny: FrameBox = {center:[0,0,-100],half:[.001,.001,.001],minRadiusPx:24};
    const straight: OrbitCamera = {position:[0,0,1],target:[0,0,0],fov:46};
    const fitted = fitCameraToHud(straight,[tiny],800,600,{x0:12,y0:12,x1:788,y1:588},{panels:[]});
    expect([...fitted.position,...fitted.target].every(Number.isFinite)).toBe(true);
    expect(fitted.position[2]-fitted.target[2]).toBeGreaterThan(0);
    checkProjection(fitted,[tiny],800,600,{x0:12,y0:12,x1:788,y1:588});
  });
});

describe('default framing in the free HUD area (docs/67 §9)', () => {
  // Measured 2026-11-02 (stage CSS px): left column, top-right card, overlay legend, chapter axis.
  const design: FrameRect[] = [{x0:28,y0:20,x1:328,y1:949},{x0:1162,y0:20,x1:1492,y1:384},{x0:1315,y0:396,x1:1492,y1:1060},{x0:28,y0:963,x1:1492,y1:1009}];
  const ipad: FrameRect[] = [{x0:22,y0:16,x1:262,y1:706},{x0:494,y0:16,x1:758,y1:307},{x0:650,y0:317,x1:758,y1:706},{x0:22,y0:717,x1:758,y1:763}];
  const authored: OrbitCamera = { position: [1.8,1.76,4.41], target: [0,.4,0], fov: 30 };
  /** World points on the plane through the target, square to the view, that the design camera shows at these stage shares. */
  function pointsAt(camera: OrbitCamera, shares: [number,number][], aspect: number) {
    const c = new PerspectiveCamera(camera.fov, aspect, .01, 100);
    c.position.fromArray(camera.position); c.lookAt(...camera.target); c.updateMatrixWorld();
    const d = new Vector3(...camera.position).distanceTo(new Vector3(...camera.target));
    return shares.map(([u,v]) => {
      const p = new Vector3(u*2-1, 1-v*2, .5).unproject(c).sub(c.position).normalize();
      const along = p.dot(new Vector3(...camera.target).sub(c.position).normalize());
      return c.position.clone().add(p.multiplyScalar(d/along));
    });
  }
  /** Project with the framing applied the way CameraRig applies it: pull back about the target, then the view offset. */
  function project(camera: OrbitCamera, f: { scale: number; shift: [number,number] }, w: number, h: number, pts: Vector3[]) {
    const k = 1/f.scale, t = new Vector3(...camera.target);
    const c = new PerspectiveCamera(camera.fov, w/h, .01, 100);
    c.position.copy(new Vector3(...camera.position).sub(t).multiplyScalar(k).add(t)); c.lookAt(t);
    c.setViewOffset(w, h, -f.shift[0]*w, f.shift[1]*h, w, h); c.updateMatrixWorld();
    return pts.map(p => { const q = p.clone().project(c); return [(q.x+1)*w/2, (1-q.y)*h/2] as const; });
  }
  const corners: [number,number][] = [[DESIGN_FREE.x0,DESIGN_FREE.y0],[DESIGN_FREE.x1,DESIGN_FREE.y0],[DESIGN_FREE.x0,DESIGN_FREE.y1],[DESIGN_FREE.x1,DESIGN_FREE.y1],[(DESIGN_FREE.x0+DESIGN_FREE.x1)/2,(DESIGN_FREE.y0+DESIGN_FREE.y1)/2]];

  it('leaves the 1920 × 1080 layout exactly as authored', () => {
    const f = stageFraming(DESIGN_STAGE.width, DESIGN_STAGE.height, design, 1)!;
    expect(f.rect).toEqual({x0:340,y0:12,x1:1150,y1:951});
    expect(f.scale).toBe(1);
    f.shift.forEach(v => expect(Math.abs(v)).toBeLessThan(1e-12));
  });
  it.each([[780,774,ipad],[733,679,ipad.map(r => ({...r, x0:r.x0-47*(r.x0>300?1:0), x1:r.x1-47*(r.x0>300?1:0), y1:Math.min(r.y1,668)}))],[966,978,ipad.map(r => ({...r, x0:r.x0+186*(r.x0>300?1:0), x1:r.x1+186*(r.x0>300?1:0)}))]])
  ('maps the design free area into the free rectangle it is largest in at %i × %i', (w, h, panels) => {
    const d = fitCameraToAspect(authored, DESIGN_ASPECT), plain = fitCameraToAspect(authored, w/h);
    const cap = Math.hypot(...d.position.map((v,i)=>v-d.target[i]!)) / Math.hypot(...plain.position.map((v,i)=>v-plain.target[i]!));
    const f = stageFraming(w, h, panels, cap)!;
    expect(f.scale).toBeGreaterThan(0); expect(f.scale).toBeLessThanOrEqual(cap + 1e-12);
    for (const p of panels) expect(f.rect.x1 <= p.x0-12+1e-6 || f.rect.x0 >= p.x1+12-1e-6 || f.rect.y1 <= p.y0-12+1e-6 || f.rect.y0 >= p.y1+12-1e-6).toBe(true);
    const out = project(d, f, w, h, pointsAt(d, corners, DESIGN_ASPECT));
    for (const [x,y] of out.slice(0,4)) {
      expect(x).toBeGreaterThanOrEqual(f.rect.x0-1e-6); expect(x).toBeLessThanOrEqual(f.rect.x1+1e-6);
      expect(y).toBeGreaterThanOrEqual(f.rect.y0-1e-6); expect(y).toBeLessThanOrEqual(f.rect.y1+1e-6);
    }
    // Centred in the free rectangle along the axis it does not fill.
    const [cx, cy] = out[4]!;
    expect(Math.abs(cx-(f.rect.x0+f.rect.x1)/2)).toBeLessThan(1e-6); expect(Math.abs(cy-(f.rect.y0+f.rect.y1)/2)).toBeLessThan(1e-6);
  });
  it('never comes closer than the plain camera: a wide free stage only shifts', () => {
    const f = stageFraming(1180, 774, [{x0:22,y0:16,x1:262,y1:706}], .63)!;
    expect(f.scale).toBe(.63);
    expect(f.shift[0]).toBeGreaterThan(0);
  });
  it('takes the space below a short card when it holds the view larger than the band beside it', () => {
    const f = stageFraming(780, 774, [{x0:22,y0:16,x1:262,y1:706},{x0:494,y0:16,x1:758,y1:307},{x0:700,y0:317,x1:758,y1:706}], 2)!;
    expect(f.rect).toEqual({x0:274,y0:319,x1:688,y1:762});
  });
  it('prefers the smaller move between two near-equal spaces (no hopping as a panel grows a few px)', () => {
    const a = stageFraming(780, 774, ipad, 2)!;
    const b = stageFraming(780, 774, ipad.map((r,i) => i === 1 ? {...r, y1: r.y1+6} : r), 2)!;
    expect(b.rect.x0).toBe(a.rect.x0); expect(b.rect.y0 === a.rect.y0 || Math.abs(b.rect.y0-a.rect.y0) === 6).toBe(true);
  });
  it('has nothing to offer on an empty or tiny stage', () => {
    expect(stageFraming(0, 0, [], 1)).toBeNull();
    expect(stageFraming(20, 20, [], 1)).toBeNull();
  });
  it('counts side columns on a landscape tablet stage narrower than 0.8 when told it is not stacked', () => {
    const panels = [{x0:12,y0:12,x1:200,y1:700},{x0:420,y0:12,x1:540,y1:300}];
    expect(freeStageRect(550,760,panels).x0).toBe(12);
    expect(freeStageRect(550,760,panels,12,false)).toEqual({x0:212,y0:12,x1:408,y1:748});
  });
});

describe('bounded framing recovery and hysteresis', () => {
  it('keeps a previous safe camera across small shrinking bounds, then refits when they grow beyond it', () => {
    const rect = freeStageRect(624,670,narrowPanels);
    const original = fitCameraToAspect(cam,624/670);
    const larger = bodies.map(b=>({...b,half:b.half.map(v=>v*1.02) as [number,number,number]}));
    const previous = fitCameraToHud(original,larger,624,670,rect,{panels:narrowPanels});
    const stable = fitCameraToHud(original,bodies,624,670,rect,{panels:narrowPanels,previous});
    expect(stable).toBe(previous);
    const huge = bodies.map(b=>({...b,half:b.half.map(v=>v*2) as [number,number,number]}));
    const changed = fitCameraToHud(original,huge,624,670,rect,{panels:narrowPanels,previous});
    expect(changed).not.toBe(previous);
    checkProjection(changed,huge,624,670,{x0:12,y0:12,x1:612,y1:658});
  });
  it('bounds the fallback by the viewport fit even when the HUD leaves only a vanishing strip', () => {
    const viewport = {x0:12,y0:12,x1:788,y1:588};
    const expected = fitCameraToHud(cam,bodies,800,600,viewport);
    for (const gap of [20, 0.03, 0]) {
      const rect = {x0:400-gap/2,y0:12,x1:400+gap/2,y1:588};
      const fitted = fitCameraToHud(cam,bodies,800,600,rect,{panels:[{x0:0,y0:0,x1:800,y1:600}]});
      expect(fitted).toEqual(expected);
      checkProjection(fitted,bodies,800,600,viewport);
      expect([...fitted.position,...fitted.target].every(Number.isFinite)).toBe(true);
    }
  });
});
