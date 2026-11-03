/** Offline reproduction of CameraRig's default HUD placement (docs/06).
 * Dolly along the authored direction, then shift the projection, never pitch.
 * Used by the CPU preview and composition regression; no browser required.
 */
import type { OrbitCamera } from '../../../src/engines/core/types';
import { fitCameraToAspect } from '../../../src/engines/space-scene/lib/camera';
import { DESIGN_ASPECT, stageFraming, type FrameRect } from '../../../src/engines/space-scene/lib/hud-framing';
export function museumHudCamera(authored: OrbitCamera, width: number, height: number, panels: FrameRect[]) {
 const design=fitCameraToAspect(authored,DESIGN_ASPECT),plain=fitCameraToAspect(authored,width/height);
 const distance=(c:OrbitCamera)=>Math.hypot(...c.position.map((v,i)=>v-c.target[i]!));
 const framing=stageFraming(width,height,panels,distance(design)/distance(plain));
 const camera=framing?{...design,position:design.position.map((v,i)=>design.target[i]!+(v-design.target[i]!)/framing.scale) as [number,number,number]}:plain;
 return {camera,framing};
}
export const museumHudLayouts=[
 {width:1520,height:1023,panels:[{x0:28,y0:12,x1:328,y1:650},{x0:1162,y0:12,x1:1508,y1:500},{x0:0,y0:963,x1:1520,y1:1023},{x0:1520,y0:0,x1:1920,y1:1023}]},
 {width:1200,height:843,panels:[{x0:20,y0:12,x1:268,y1:550},{x0:925,y0:12,x1:1188,y1:410},{x0:0,y0:790,x1:1200,y1:843},{x0:1200,y0:0,x1:1600,y1:843}]},
 {width:1017,height:703,panels:[{x0:20,y0:12,x1:250,y1:480},{x0:752,y0:12,x1:1005,y1:365},{x0:0,y0:648,x1:1017,y1:703},{x0:1017,y0:0,x1:1366,y1:703}]},
];
