/** Targeted code overlay on the original grounded graphite blocks. */
import assert from 'node:assert/strict';
import { mkdirSync,copyFileSync,readFileSync,writeFileSync } from 'node:fs';
import sharp from 'sharp';
import { main,PREVIEW,arrow,path,line } from './redo-cd-utils.js';
import { face,type Point } from './round2-graphite.js';
const source='scripts/figures/materials/boundary-grounded-original.webp';
export function boundaries(){
 // The original third model already has an offset; enlarge it to 123 figure units.
 const leftBand:Point[]=[[420,487],[630,504],[610,524],[400,506]];
 const rightBand:Point[]=[[546,588],[780,620],[760,642],[525,607]];
 const leftEnd=[620,514],rightEnd=[536,598];
 const faultVector=[120,-120];
 assert(Math.abs((rightEnd[1]!-leftEnd[1]!)-(rightEnd[0]!-leftEnd[0]!))>50);
 const motions=[[[270,79],[135,79]],[[390,79],[530,79]],[[655,79],[795,79]],[[1080,79],[940,79]],[[438,570],[548,460]],[[694,480],[584,590]]] as const;
 assert(motions[0][1][0]<motions[0][0][0]&&motions[1][1][0]>motions[1][0][0]);
 assert(motions[2][1][0]>motions[2][0][0]&&motions[3][1][0]<motions[3][0][0]);
 assert.equal((motions[4][1][0]-motions[4][0][0])/(motions[4][1][1]-motions[4][0][1]),faultVector[0]!/faultVector[1]!);
 let b=motions.slice(0,4).map(([a,z])=>arrow(a,z,3.5)).join('');
 // Cover only the old reference stripe on the top plane, maintaining material hatching.
 b+=face([[317,577],[440,470],[646,490],[525,607]],.22,.06);
 b+=face([[525,607],[646,490],[868,513],[760,642]],.22,.06);
 b+=face(leftBand,.88,.05)+face(rightBand,.88,.05);
 // Two transform arrows stay on opposite sides and parallel to the actual fault.
 b+=arrow([383,564],[479,468],3.5)+arrow([769,502],[673,598],3.5);
 b+=line([[525,607],[646,488]],'#555',1.3);
 return b;
}
export async function exportBoundaries(){
 mkdirSync('scripts/figures/materials',{recursive:true});
 // Source is stored once; subsequent exports never use the previously overlaid delivery.
 const {existsSync}=await import('node:fs');
 if(!existsSync(source))copyFileSync('/tmp/atlas-ia-round2/originals/inside-the-earth-boundary-models.webp',source);
 const overlay=`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900">${boundaries()}</svg>`;
 mkdirSync(`${PREVIEW}/svg`,{recursive:true});writeFileSync(`${PREVIEW}/svg/inside-the-earth-boundary-models-overlay.svg`,overlay);
 const input=await sharp(readFileSync(source)).composite([{input:Buffer.from(overlay)}]).png().toBuffer();
 let b=Buffer.alloc(0);for(const quality of [88,84,80,76,72,68,64,60,56,52,48]){b=await sharp(input).webp({quality,effort:6,preset:'drawing'}).toBuffer();if(b.length<=120000)break;}
 assert(b.length<=120000);writeFileSync('public/illustrations/figures/inside-the-earth-boundary-models.webp',b);console.log(b.length);
}
if(main(import.meta.url)){
 if(process.argv.includes('--overlay'))await exportBoundaries();
 else {const {saveGuide}=await import('./round2-graphite.js');await saveGuide('inside-the-earth-boundary-models-overlay',boundaries());}
}
