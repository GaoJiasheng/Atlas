import assert from 'node:assert/strict';
import {save,poly,rect,path,line,ellipse,texture} from './continental-drift-plate.js';
export const stages=['soak','beat','form','dry'];assert.equal(stages.length,4);
let b='';
// Reading order: upper left / upper right / lower left / lower right.
b+=texture('M95 220L487 220L466 385Q290 426 116 385Z','#c6c6c6')+ellipse(291,220,196,62,'#b6b6b6','#666666',1.6)+ellipse(291,225,176,46,'#dddddd','#888888',.9);
b+=texture('M148 208L179 183L218 197L202 223L169 237L156 224Z','#c9c9c9')+path('M179 190L190 216L169 231','none','#969696',.9);
b+=texture('M239 195L285 187L307 208L295 239L253 234L228 213Z','#d6d6d6')+path('M244 199L274 220L299 213','none','#969696',.9);
b+=texture('M315 225L332 194L361 202L375 236L339 248Z','#bcbcbc')+path('M333 198L346 231L369 233','none','#969696',.9);
for(let i=0;i<17;i++)b+=path(`M${381+i*3} ${241-i%4}q-8 -21 ${6+i%3} -43`,'none','#969696',.65);
for(let i=0;i<15;i++)b+=path(`M${125+i*22} 249q14 -16 31 -4`,'none','#999999',.7);
b+=texture('M759 225Q846 253 950 225L930 382Q845 414 778 382Z','#b8b8b8')+ellipse(854,225,96,39,'#929292','#666666',1.6)+ellipse(854,225,75,25,'#c9c9c9','#777777',.9);
b+=texture('M820 140L853 122L882 277Q866 294 845 281Z','#c7c7c7');
for(let x=791;x<929;x+=15)b+=path(`M${x} 276q-5 44 4 98`,'none','#888888',.8);
b+=texture('M96 614L483 614L475 776L111 776Z','#c4c4c4')+poly([[96,614],[159,566],[540,566],[483,614]],'#a9a9a9');
// Plain wooden draining rests support the raised mould; no levitating tool.
b+=line([[130,566],[120,614]],'#8b8b8b',8)+line([[470,566],[485,614]],'#8b8b8b',8);
// Mould lifted above the pulp vat; mesh on one part, continuous wet blank sheet on rest.
b+=poly([[130,565],[188,469],[527,469],[470,565]],'#b3b3b3');
b+=poly([[145,551],[196,483],[507,483],[463,551]],'#dedede');
for(let x=205;x<494;x+=9)b+=line([[x,484],[x-42,549]],'#aaaaaa',.5);
for(let y=491;y<551;y+=8)b+=line([[196-(y-483)*.65,y],[506-(y-483)*.65,y]],'#aaaaaa',.5);
b+=poly([[145,552],[188,493],[415,493],[376,552]],'#eeeeee','#aaaaaa',.6);
// Drying sheets flat against one plaster wall, no text or inscriptions.
b+=texture('M699 505L1105 505L1105 790L699 790Z','#d1d1d1');
for(let i=0;i<3;i++)b+=rect(720+i*122,548,100,185,'#ececec','#9b9b9b',1.1);
await save('silk-road-papermaking',b);
