import assert from 'node:assert/strict';
import {save,path,line,ellipse,texture,random} from './continental-drift-plate.js';
export const order=['scalp','outer-table','diploe','inner-table','dura','arachnoid','csf','pia','cortex','white-matter'];
assert(order.indexOf('pia')>order.indexOf('csf'));assert(order.indexOf('diploe')===order.indexOf('outer-table')+1);
export const layerBounds=[[162,236],[236,262],[262,330],[330,354],[354,379]] as const;
for(const [i,[top,bottom]]of layerBounds.entries()){assert(bottom>top);if(i)assert.equal(top,layerBounds[i-1]![1]);}
export const arachnoid='M150 383Q600 341 1050 383';
// Pia uses the exact cortical contour; arachnoid bridges the sulcus as a shallow arc.
export const cortex='M150 466C210 421 310 435 359 475C400 509 390 619 437 627C487 635 466 505 510 470C560 424 645 446 685 483C727 522 702 611 749 618C795 623 790 509 831 477C890 430 981 445 1050 468';
let b='';const bandPath=(top:number,bottom:number)=>`M150 ${top}Q600 ${top-42} 1050 ${top}L1050 ${bottom}Q600 ${bottom-42} 150 ${bottom}Z`;
const band=(top:number,bottom:number,fill:string)=>texture(bandPath(top,bottom),fill);
b+=band(162,236,'#c5c5c5');
for(let x=190;x<1040;x+=42)b+=path(`M${x} 200q-17 -44 -5 -82M${x} 201q7 -25 13 -30`,'none','#666666',1.5)+ellipse(x,211,6,12,'#ababab','#888888',.8);
b+=band(236,262,'#e1e1e1');b+=band(262,330,'#aaaaaa');
// Irregular marrow spaces leave a connected trabecular bone matrix. Clip to
// the diploe so none of its pores or texture can cross the compact tables.
b+=`<defs><clipPath id="diploe"><path d="${bandPath(262,330)}"/></clipPath></defs><g clip-path="url(#diploe)">`;
const r=random(83);
for(let row=0;row<3;row++)for(let col=0;col<29;col++){
 const x=164+col*30+(row%2)*10,y=274+row*21-21*(1-((x-600)/450)**2);
 const rx=8+r()*5,ry=4+r()*4;
 const pts=Array.from({length:7},(_,j)=>{const a=j*Math.PI*2/7,s=.7+r()*.3;return [x+Math.cos(a)*rx*s,y+Math.sin(a)*ry*s];});
 b+=path(`M${pts.map(p=>p.join(',')).join('L')}Z`,'#e0e0e0','#999999',.6);
}
b+='</g>';
b+=band(330,354,'#e1e1e1');b+=band(354,379,'#ababab');
b+=path(arachnoid,'none','#747474',2);
// Cortex/white matter continuous cut face, not separated floating sheets.
b+=texture(`${cortex}L1050 786Q600 754 150 786Z`,'#e1e1e1');
// Grey cortical ribbon bounded by independently sampled inner contour.
b+=texture(`${cortex}L1050 528C979 502 905 496 865 527C836 556 836 678 745 679C657 680 667 566 653 536C631 506 587 491 552 524C524 550 525 694 432 689C348 684 350 552 327 523C286 492 210 487 150 526Z`,'#a6a6a6');
b+=path(cortex,'none','#555555',4);
b+=`<defs><clipPath id="csf-space"><path d="${cortex}L1050 383Q600 341 150 383Z"/></clipPath></defs><g clip-path="url(#csf-space)">`;
for(const x of [190,255,330,400,453,518,593,667,729,770,845,935,1010])b+=line([[x,330],[x+4,700]],'#999999',1);
b+='</g>';
for(let i=0;i<45;i++){const x=170+i*19;b+=path(`M${x} 756q-14 -19 -13 -33`,'none','#aaaaaa',.6);}
await save('brain-and-nerves-protection-layers',b);
