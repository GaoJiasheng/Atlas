/** Cumulonimbus silhouette and particle distribution are constructed, never AI generated. */
import assert from 'node:assert/strict';
import{main}from'./redo-cd-utils.js';
import{surface,pencil,path,line,random,save,type Point}from'./round3-graphite.js';
export const cloudParticles={freeze:428,ice:[[652,222,15],[751,240,10],[697,307,58],[600,324,11],[786,332,15],[635,380,12],[757,385,9],[703,367,8],[706,269,8],[806,281,7]] as const,drops:[[622,478,9],[715,470,13],[787,504,8],[684,550,58],[792,570,10],[615,588,10],[714,645,12],[776,644,17],[653,674,7],[812,581,9],[740,704,8]] as const};
export function cloud(){
 const{ice,drops,freeze}=cloudParticles;
 assert(ice.every(p=>p[1]+p[2]<freeze));assert(drops.every(p=>p[1]-p[2]>freeze));
 assert(new Set(ice.map(p=>p[0])).size>8);assert(new Set(drops.map(p=>p[1])).size===drops.length);
 const outline='M80 143Q190 116 313 113Q384 103 443 81Q511 46 583 68Q630 32 688 61Q740 50 796 79Q924 96 1114 107Q1060 154 938 176L815 191Q747 204 722 237Q775 254 753 294Q802 315 777 358Q830 387 801 427Q855 451 825 494Q889 519 851 563Q921 592 875 637Q956 648 954 681Q1050 699 1095 736Q967 773 835 754Q693 779 557 757Q411 781 263 749Q170 756 133 728Q228 697 303 688Q299 646 343 627Q307 583 355 551Q327 507 376 479Q348 437 395 410Q369 369 416 341Q402 301 448 278Q434 243 470 218L511 186Q346 184 217 175Q125 164 80 143Z';
 let b=`<defs><clipPath id="cloud-body"><path d="${outline}"/></clipPath></defs><g clip-path="url(#cloud-body)">`+surface(outline,[80,40,1040,740],(u,v)=>.3+.5*v+.17*Math.sin(u*12+v*5),-.28,5);
 const r=random(881);
 // Billowing contours use nested, incomplete arcs rather than a drum-shaped wall.
 const puffs=[[480,226,67],[449,302,58],[425,376,72],[422,469,58],[386,545,82],[382,644,76],[530,697,78],[912,706,63],[813,673,55],[553,110,78],[697,105,69],[504,402,43],[500,587,58]];
 for(const[x,y,radius]of puffs){b+=surface(`M${x!-radius!} ${y!+20}C${x!-radius!*1.1} ${y!-radius!*1.05} ${x!+radius!*.8} ${y!-radius!} ${x!+radius!} ${y!}Q${x!+radius!*.9} ${y!+radius!*.7} ${x!-radius!*.55} ${y!+radius!*.65}`,[x!-radius!,y!-radius!,radius!*2,radius!*1.8],(u,v)=>.04+.57*v*v+.24*u*u,.6,7,Math.round(x!),0);}
 for(let i=0;i<90;i++){const x=180+r()*800,y=115+r()*54;b+=pencil(`M${x} ${y}q${35+r()*80} ${-5-r()*12} ${70+r()*70} ${-3-r()*7}`,.45,.3);}
 b+='</g>';
 // Irregular opening follows the tower, no rectangular window or hard shell edge.
 const opening='M638 180Q734 181 810 169Q795 201 818 232Q783 259 811 291Q835 321 810 353Q841 385 819 419Q850 450 824 485Q851 518 835 552Q867 589 842 625Q882 666 841 713Q732 737 586 724Q616 690 588 661Q620 630 590 600Q620 568 588 535Q614 506 588 475Q615 444 594 415Q626 389 605 357Q637 329 616 299Q649 270 624 241Q651 210 638 180Z';
 b+=path(opening,'#fff','none');
 b+=pencil('M638 180Q651 210 624 241Q649 270 616 299Q637 329 605 357Q626 389 594 415Q615 444 588 475Q614 506 588 535Q620 568 590 600Q620 630 588 661Q616 690 586 724',.8,.5);
 b+=line([[600,freeze],[826,freeze]],'#999',1,'stroke-dasharray="10 13" opacity=".7"');
 for(const[x,y,size]of ice){const hex=Array.from({length:6},(_,i):Point=>[x+size*Math.cos(i*Math.PI/3),y+size*.67*Math.sin(i*Math.PI/3)]);b+=path(`M${hex.map(p=>p.join(',')).join('L')}Z`,'#fff','#777',1.1);if(size>25)b+=pencil(`M${x-size*.65} ${y}l${size*1.3} 0`,.5,.4);}
 for(const[x,y,size]of drops){const d=`M${x} ${y-size}C${x-size*.25} ${y-size*.4} ${x-size*.72} ${y-size*.12} ${x-size*.7} ${y+size*.3}C${x-size*.65} ${y+size*1.15} ${x+size*.65} ${y+size*1.15} ${x+size*.7} ${y+size*.3}C${x+size*.72} ${y-size*.12} ${x+size*.25} ${y-size*.4} ${x} ${y-size}Z`;b+=surface(d,[x-size*.75,y-size,size*1.5,size*2],(u,v)=>.02+.16*u*u+.08*v,.5,2,61,.7);}
 // Soft graphite rain, staggered starts and ends, fades instead of forming spikes.
 for(let i=0;i<130;i++){const x=360+r()*580,y=754+r()*20,len=40+r()*110;for(let j=0;j<6;j++){const t=j/6;b+=line([[x-len*.24*t,y+len*t],[x-len*.24*(t+1/6),y+len*(t+1/6)]],'#666',.6+r()*.6,`opacity="${(.28*(1-t)).toFixed(3)}"`);}}
 return b;
}
if(main(import.meta.url))await save('monsoon-and-weather-cloud-cutaway',cloud());
