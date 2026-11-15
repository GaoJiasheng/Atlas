import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {save,path,line,ellipse,texture,random,type Point} from './continental-drift-plate.js';
// Anatomical appearance is a separate ImageGen asset. All neuronal connections,
// cross-section shapes, root side, soma locations and counts are constructed here.
export const cord={x:945,y:350,rx:205,ry:255};
export const ganglion:Point=[705,180],sensorySoma:Point=[705,190],relay:Point=[896,329],motor:Point=[874,448];
export const dorsalEntry:Point=[810,231],ventralExit:Point=[799,489];
export const receptor:Point=[166,487],muscle:Point=[609,493];
const outside=(p:Point)=>((p[0]-cord.x)/cord.rx)**2+((p[1]-cord.y)/cord.ry)**2>1;
assert(outside(ganglion));assert(!outside(relay));assert(!outside(motor));
assert(Math.hypot(sensorySoma[0]-ganglion[0],sensorySoma[1]-ganglion[1])<30);
assert(dorsalEntry[1]<cord.y&&ventralExit[1]>cord.y);
assert(relay[1]<cord.y&&motor[1]>cord.y);
assert(receptor[0]<muscle[0]);
export const grey='M920 415C883 391 873 301 851 270C834 315 827 355 834 392C840 420 861 434 891 445C852 451 817 464 808 504C789 563 829 593 867 575C907 555 908 492 929 480C950 491 951 552 993 575C1031 594 1073 561 1053 507C1040 469 1008 453 968 445C998 432 1022 420 1026 391C1032 351 1021 309 1005 270C983 303 976 391 938 415Z';
// Flatten the actual cubic grey-matter contour to verify somata lie in grey,
// rather than merely somewhere inside the outer spinal section.
const tokens=grey.match(/[MCZ]|-?\d+(?:\.\d+)?/g)!;
const contour:Point[]=[];let pen:Point=[0,0];
for(let i=0;i<tokens.length;){const op=tokens[i++]!;
 if(op==='M'){pen=[+tokens[i++]!,+tokens[i++]!];contour.push(pen);}
 else if(op==='C'){
  const a=pen,b:Point=[+tokens[i++]!,+tokens[i++]!],c:Point=[+tokens[i++]!,+tokens[i++]!],d:Point=[+tokens[i++]!,+tokens[i++]!];
  for(let j=1;j<=24;j++){const t=j/24,u=1-t;contour.push([u*u*u*a[0]+3*u*u*t*b[0]+3*u*t*t*c[0]+t*t*t*d[0],u*u*u*a[1]+3*u*u*t*b[1]+3*u*t*t*c[1]+t*t*t*d[1]]);}pen=d;
 }
}
function inGrey(p:Point){const x=p[0]-15,y=p[1]+95;let inside=false;for(let i=0,j=contour.length-1;i<contour.length;j=i++){
 const a=contour[i]!,b=contour[j]!;if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])inside=!inside;
}return inside;}
assert(inGrey(relay));assert(inGrey(motor));assert(!inGrey(ganglion));
assert(inGrey([889,370]));
const outer='M930 191C1051 186 1135 307 1135 446C1135 590 1049 699 948 700L930 661L912 700C803 694 725 583 725 445C725 307 809 187 921 191L930 221Z';
const arm=readFileSync('art/img4/round2/arm-base.png').toString('base64');
let b=`<image href="data:image/png;base64,${arm}" x="40" y="290" width="650" height="488"/>`;
b+='<g transform="translate(15 -95)">';
b+=texture(outer,'#e4e4e4');
const r=random(182);
b+='<g clip-path="url(#cord-section)">';
for(let i=0;i<4500;i++){
 const x=725+r()*410,y=190+r()*510;
 b+=path(`M${x} ${y}l${2+r()*4} ${-2-r()*5}`,'none','#777777',.4,`opacity="${.1+r()*.2}"`);
}
b+='</g>'+texture(grey,'#adadad')+ellipse(930,445,6,6,'#515151','none')+'</g>';
// Dorsal and ventral sleeves attach to the section; dorsal ganglion remains external.
b+=path('M646 226Q659 171 679 173L734 178Q777 187 810 231','none','#999999',28);
b+=path('M646 226Q659 171 679 173L734 178Q777 187 810 231','none','#dddddd',22);
b+=ellipse(...ganglion,43,28,'#d2d2d2','#777777',1.4);
b+=path('M799 489Q741 554 673 556L610 506','none','#999999',23)+path('M799 489Q741 554 673 556L610 506','none','#d5d5d5',17);
// All signal paths are continuous, arrow-free and outlined against shaded skin.
const sensory='M166 487Q197 485 223 501C310 542 426 624 523 665Q562 657 584 591L626 377Q639 287 646 226Q659 171 684 174L731 179Q778 194 810 231L873 270Q899 283 896 314';
const relayPath='M896 343Q889 370 874 431';
const motorPath='M864 453Q830 479 799 489Q741 554 673 556L609 493';
for(const [d,w]of [[sensory,4],[relayPath,4],[motorPath,5]] as const)b+=path(d,'none','#f3f3f3',w+4)+path(d,'none','#4c4c4c',w);
// Pseudounipolar sensory soma branches off the dorsal axon, never inside cord.
b+=line([[705,176],sensorySoma],'#505050',4)+ellipse(...sensorySoma,10,10,'#929292','#494949',1.3);
b+=ellipse(...relay,12,12,'#929292','#494949',1.3);
b+=texture('M874 431L890 446L880 461L864 465L856 448Z','#8c8c8c');
for(const [x,y]of [[890,443],[879,461],[856,445]])b+=path(`M${x} ${y}l12 -8m-12 8l13 6`,'none','#565656',1.8);
// Fingertip ending and motor terminal lie on the attached arm tissue.
b+=ellipse(...receptor,6,6,'#c0c0c0','#505050',2);
for(let j=0;j<4;j++)b+=path(`M609 493q${-8+j*7} ${-9-j*4} ${-11+j*9} ${-18-j*5}`,'none','#555555',1.7);
if(!process.argv.includes('--check')) await save('brain-and-nerves-reflex-arc',b,false,`<defs><clipPath id="cord-section"><path d="${outer}"/></clipPath></defs>`);
