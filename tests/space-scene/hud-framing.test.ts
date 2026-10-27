import { describe, expect, it } from 'vitest';
import { PerspectiveCamera, Vector3 } from 'three';
import { fitCameraToHud, freeStageRect, type FrameBox, type FrameRect } from '../../src/engines/space-scene/lib/hud-framing';
import { fitCameraToAspect } from '../../src/engines/space-scene/lib/camera';
import type { OrbitCamera } from '../../src/engines/core/types';
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
