/** Reuse the fossil renderer's sampled installed RoomEnvironment. The engine
 * multiplies this radiance by BOTH rig intensity and material envMapIntensity.
 */
import fs from 'node:fs';
type V=[number,number,number];
let maps:number[][];
export function roomRadiance(d:V,roughness:number){
 maps??=JSON.parse(fs.readFileSync('/private/tmp/fossils-fix-2026-11-04/room-radiance-v2.json','utf8'));
 const W=96,H=48,lod=roughness>=.85?0:roughness>=.65?1:roughness>=.45?2:3;
 const x=((Math.atan2(d[2],d[0])/(2*Math.PI)+1)%1)*W-.5,y=Math.acos(Math.max(-1,Math.min(1,d[1])))/Math.PI*H-.5;
 const ix=Math.floor(x),iy=Math.floor(y),u=x-ix,v=y-iy,map=maps[lod]!;
 const at=(a:number,b:number)=>map[Math.max(0,Math.min(H-1,b))*W+((a%W+W)%W)]!;
 return (at(ix,iy)*(1-u)+at(ix+1,iy)*u)*(1-v)+(at(ix,iy+1)*(1-u)+at(ix+1,iy+1)*u)*v;
}
