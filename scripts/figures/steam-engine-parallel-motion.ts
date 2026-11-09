/** Watt topology and ratios from the existing teaching model; original code geometry. */
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { circle } from '../../src/engines/space-scene/lib/mechanism';
import sharp from 'sharp';
import {type Point} from './graphite';
import {asset,encode,figure,localEdit} from './round2-io';
const L=2.5,S=.8,R=1.25;
export function pose(angle:number){const a=angle*Math.PI/180,A:Point=[0,0],B:Point=[-L*Math.cos(a),L*Math.sin(a)],C:Point=[B[0]/2,B[1]/2],F:Point=[-L,-S];const E=circle(C,S,F,R,1);const D:Point=[B[0]+E[0]-C[0],B[1]+E[1]-C[1]];return {A,B,C,D,E,F};}
export function assertMotion():void {
 const xs:number[]=[],ys:number[]=[];for(let a=-14;a<=14;a+=.1){const p=pose(a),dist=(a:Point,b:Point)=>Math.hypot(a[0]-b[0],a[1]-b[1]);for(const [a,b,l] of [[p.C,p.E,S],[p.B,p.D,S],[p.E,p.F,R],[p.E,p.D,L/2],[p.C,p.B,L/2]] as const)assert(Math.abs(dist(a,b)-l)<1e-9);assert(Math.abs((p.B[0]-p.C[0])-(p.D[0]-p.E[0]))<1e-9);xs.push(p.D[0]);ys.push(p.D[1]);}
 assert(Math.max(...xs)-Math.min(...xs)<.004);assert(Math.max(...ys)-Math.min(...ys)>1.1);
 const p=pose(-9);assert(p.D[1]<p.F[1]-.1,'separate radius support from moving piston pin');
}
/** Local edits are registered to the original 1200×900 projection, not a new pose. */
export const editMask=`<g fill="white"><path d="M70 265V142L91 128L184 143L202 266Z"/><path d="M1038 483V425L1050 411L1128 410L1140 483Z"/><path d="M928 604H1009V826H928Z"/></g>`;
export async function assertEdits():Promise<void> {
 assertMotion();
 const rearCrossing=[941,451],frontLink=[943,330,1001,610];
 assert(rearCrossing[0]!<frontLink[0]!,'radius rod enters behind outer link');
 const widthAt=async(file:string)=>{const {data}=await sharp(file).resize(1200,900,{fit:'fill'}).ensureAlpha().raw().toBuffer({resolveWithObject:true});let n=0;for(let x=920;x<1010;x++)if(data[(720*1200+x)*4+3]!>80)n++;return n;};
 const original=await widthAt(asset('steam-original.webp')),edited=await widthAt(asset('steam-edit.png'));
 assert(edited>=original*1.15,`piston width ${original} -> ${edited}`);
 assert(2*420/1200<1,'local mask edge remains below one display pixel');
}
export async function editedMotion():Promise<Buffer>{
 let plate=await localEdit(asset('steam-original.webp'),asset('steam-edit.png'),editMask);
 // Recess the rear radius rod with longitudinal pencil shading. The foreground
 // upright occludes it; no new pin or connection is introduced at the crossing.
 const depth=Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900"><defs><linearGradient id="rear" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#444" stop-opacity=".28"/><stop offset=".5" stop-color="#555" stop-opacity=".12"/><stop offset="1" stop-color="#222" stop-opacity=".4"/></linearGradient></defs><path d="M637 494L939 437L939 455L640 511Z" fill="url(#rear)"/><path d="M932 440L940 438L940 456L932 457Z" fill="#222" opacity=".32"/></svg>`);
 plate=await sharp(plate).composite([{input:depth}]).png().toBuffer();
 return plate;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 await assertEdits();const plate=await editedMotion();
 await figure('public/illustrations/figures/steam-engine-parallel-motion.webp',plate);
 for(const size of [800,1600])await encode(`public/illustrations/steam-engine-parallel-motion${size===1600?'@2x':''}.webp`,await sharp(plate).resize(size,size,{fit:'contain',background:{r:0,g:0,b:0,alpha:0}}).png().toBuffer());
}
