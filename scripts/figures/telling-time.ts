/** Exact 10:10: minute = 60 degrees; hour = 305 degrees clockwise from twelve. */
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import sharp from 'sharp';
import {writeFileSync} from 'node:fs';
import {bezelHatching,faceHatching} from './graphite-hatching';
import { ellipse, f, line, path, screw, svg, type Point } from './graphite';
import {encode} from './round2-io';
export const HOUR=30*10+.5*10, MINUTE=6*10;
export const rings=[600,582,568,547,527,505];
export const tickAngles=Array.from({length:60},(_,i)=>i*6);
export const numerals=Array.from({length:12},(_,i)=>i+1);
export const dials=[{cx:680,cy:710,r:600},{cx:1235,cy:1260,r:290}];
const radial=(deg:number,r:number):Point=>[f(Math.sin(deg*Math.PI/180)*r),f(-Math.cos(deg*Math.PI/180)*r)];
export function assertClock():void {
 assert.equal(HOUR,305);assert.equal(HOUR-30*10,5);assert.equal(MINUTE,60);
 assert.equal(tickAngles.length,60);assert.equal(new Set(tickAngles).size,60);
 assert.deepEqual(numerals,[1,2,3,4,5,6,7,8,9,10,11,12]);
 for(let i=1;i<rings.length;i++)assert(rings[i]!<rings[i-1]!);
 for(const a of tickAngles)assert(Math.hypot(...radial(a,505))<527);
 assert(459<467&&318<425,'hands inside tick ring');
 for(const d of dials){
  assert(d.cx-d.r>0&&d.cy-d.r>0&&d.cx+d.r<1600&&d.cy+d.r<1600);
  assert(318*d.r/600*420/1600>=40,'shorter hand readable at 420 px');
 }
 const s=clockSvg();assert(!s.includes('<image'),'no unregistered raster material');
 assert.equal((s.match(/<text /g)||[]).length,24);
 assert.equal((s.match(/transform="rotate\(305\)"/g)||[]).length,2);
 assert.equal((s.match(/transform="rotate\(60\)"/g)||[]).length,2);
}
function dial(cx:number,cy:number,r:number):string {
 const hand=(angle:number,length:number,width:number)=>{
  const d=`M0 ${-length}L${width} ${-length*.7}Q${width*.8} ${-length*.48} ${width*.32} ${-length*.4}L${width*.22} 35Q0 55 ${-width*.22} 35L${-width*.32} ${-length*.4}Q${-width*.8} ${-length*.48} ${-width} ${-length*.7}Z`,id=`hand-${cx}-${length}`;
  let strokes='';for(let y=-length;y<40;y+=3)strokes+=path(`M${-width-3} ${y}q${width} 5 ${width*2+6} 10`,'none','#252525',.65,'opacity=".7"');
  return `<g transform="rotate(${angle})">`+path(d,'#555555','none',0,'transform="translate(3 4)" opacity=".18"')+path(d,'url(#dark)','#484848',1.2)+`<clipPath id="${id}">${path(d,'white','none')}</clipPath><g clip-path="url(#${id})">${strokes}</g>`+line([[0,-length+15],[0,20]],'#bdbdbd',1)+path(d,'none','#444444',.4,'transform="translate(.55 -.4)" opacity=".5"')+'</g>';
 };
 // Geometry is the material master: all marks share the exact dial origin.
 const material=ellipse(0,0,600,600,'#ffffff','none')+bezelHatching()+
  ellipse(0,0,527,527,'#ffffff','none')+faceHatching(`face-${cx}`);
 return `<g transform="translate(${cx} ${cy}) scale(${r/600})">`+
 material+ellipse(0,0,600,600,'none','#606060',1.4)+
 rings.slice(1,4).map((rr,i)=>ellipse(0,0,rr,rr,'none',i%2?'#777777':'#bcbcbc',i%2?1.3:1.7)).join('')+
 ellipse(0,0,527,527,'none','#666666',1.7)+
 ellipse(0,0,505,505,'none','#888888',1)+
 tickAngles.map((a,i)=>line([radial(a,i%5?490:467),radial(a,505)],'#525252',i%5?1.8:4)).join('')+
 numerals.map(n=>{const p=radial(n*30,425);return `<text x="${p[0]}" y="${p[1]+27}" text-anchor="middle" font-family="Georgia, serif" font-size="82" fill="#505050">${n}</text>`;}).join('')+
 [0,90,180,270].map(a=>{const p=radial(a,563);return screw(p[0],p[1],12);}).join('')+
 hand(HOUR,318,23)+hand(MINUTE,459,16)+ellipse(0,0,27,27,'url(#metal)','#4a4a4a',2)+screw(0,0,13)+'</g>';
}
export const clockSvg=(size=1600)=>svg(`<g transform="scale(${size/1600})">${dial(dials[0]!.cx,dials[0]!.cy,dials[0]!.r)}<g transform="translate(1235 980)">${ellipse(0,-59,60,62,'none','#555555',18)}${ellipse(0,-59,60,62,'none','#cecece',6)}${path('M-35 -15h70v48h-70Z','url(#metal)','#555555',1)}</g>${dial(dials[1]!.cx,dials[1]!.cy,dials[1]!.r)}</g>`,size,size);
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){assertClock();if(process.argv.includes('--svg'))writeFileSync(process.argv[process.argv.indexOf('--svg')+1]!,clockSvg());for(const size of [800,1600])await encode(`public/illustrations/telling-time${size===1600?'@2x':''}.webp`,await sharp(Buffer.from(clockSvg(size))).png().toBuffer(),size===800?90000:120000,false);}
