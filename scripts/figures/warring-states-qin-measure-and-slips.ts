/** Guide only. Final image is a local glyph-removal edit of the ORIGINAL, not this geometry. */
import { saveGuide } from './round2-graphite.js';
/** Measure plan proportions traced from Todd CC0 9874250044; perspective rim is constructed. */
import assert from 'node:assert/strict';
import {main,poly,etched,path,line } from './redo-cd-utils.js';
export function measure(){
 const length=570,width=315,handle=180;assert(Math.abs(length/width-12.5/7)<.04);assert(handle*.35>=40);
 const slips=Array.from({length:8},(_,i)=>150+i*114);const cords=[585,727];assert.equal(cords.length,2);assert.equal(slips.length,8);
 let b=poly([[110,160],[680,100],[825,260],[255,320]],'url(#metal)');
 b+=poly([[110,160],[255,320],[255,422],[110,262]],'#999999');
 b+=poly([[255,320],[825,260],[825,362],[255,422]],'url(#metal)');
 b+=poly([[138,166],[670,115],[791,254],[264,304]],'#777777');
 b+=poly([[165,183],[665,134],[750,240],[274,283]],'#c6c6c6');
 b+=poly([[791,254],[825,260],[1023,235],[1019,279],[822,305],[825,362],[791,354]],'#bcbcbc');
 b+=poly([[825,267],[1006,247],[1008,270],[825,291]],'#666666');
 // Continuous unmarked front band and blank slips: surface marks never resemble writing.
 b+=path('M270 346L807 289V336L270 397Z','#bcbcbc','#aaa',.6);
 for(const [i,x] of slips.entries()){
  const y=495+(i%3)*6;
  b+=etched(`M${x} ${y}Q${x+33} ${y-6} ${x+66} ${y}L${x+66} 801Q${x+33} 808 ${x} 801Z`,'url(#wood)');
  b+=line([[x+9,y+15],[x+9,788]],'#a8a8a8',.7);
 }
 for(const y of cords)b+=path(`M137 ${y}Q602 ${y+17} 1044 ${y}M137 ${y+6}Q602 ${y+23} 1044 ${y+6}`,'none','#606060',2);
 return b;
}
if(main(import.meta.url))await saveGuide('warring-states-qin-measure-and-slips',measure());
