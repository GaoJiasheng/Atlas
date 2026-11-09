import { saveGuide } from './round2-graphite.js';
import assert from 'node:assert/strict';
import { main,etched,path,line,arrow } from './redo-cd-utils.js';
export function zones(){
 const sea=250,flat=350,crest=270,deep=710;
 const boundaries=[80,445,660,1110];
 assert(flat>sea && crest<flat && crest>=sea && deep>flat+300);
 assert(boundaries.every((x,i)=>i===0||(x-boundaries[i-1]!)*.35>=70));
 const profile='M80 350L445 350Q510 349 550 288Q584 258 620 280L660 330C770 424 850 614 1110 710L1110 815L80 815Z';
 let b=path('M80 250H1110V710C850 614 770 424 660 330L620 280Q584 258 550 288Q510 349 445 350H80Z','#e9e9e9','none');
 b+=etched(profile,'#b9b9b9');b+=path(profile,'url(#section)','none');
 b+=line([[80,250],[1110,250]],'#777',1.7);
 // Three large zones delimited by quiet dashed guides, independent of the material texture.
 for(const x of boundaries.slice(1,-1))b+=line([[x,156],[x,795]],'#929292',1,'stroke-dasharray="8 9"');
 for(let i=0;i<3;i++){const a=boundaries[i]!,z=boundaries[i+1]!;b+=line([[a+8,180],[z-8,180]],'#666',1.5)+line([[a+8,169],[a+8,191]],'#666',1.5)+line([[z-8,169],[z-8,191]],'#666',1.5);}
 b+=path('M485 239q30-34 62-6t62-2q-10 35-41 11','none','#555',2);
 b+=arrow([1045,325],[1045,650],2)+arrow([1045,650],[1045,325],2);
 // Fine coral surface texture follows the reef rather than hiding its profile.
 for(let i=0;i<26;i++){const x=100+i*12;b+=path(`M${x} 350q-7-18-2-27m2 27q14-13 9-23`,'none','#666',1);}
 // Root each coral mark on the actual cubic reef surface, not a linear guess.
 for(let i=0;i<11;i++){
  const t=(i+.5)/11,s=1-t;
  const x=s*s*s*660+3*s*s*t*770+3*s*t*t*850+t*t*t*1110;
  const y=s*s*s*330+3*s*s*t*424+3*s*t*t*614+t*t*t*710;
  b+=path(`M${x} ${y}q-10-17-4-25m4 25q14-12 10-24`,'none','#666',1);
 }
 return b;
}
if(main(import.meta.url))await saveGuide('coral-reef-zones',zones());
