/** Philg88's CC0 reconstruction supplies every vehicle connection.
 * Horse contour adapted from Gary Todd's CC0 Qin chariot horse photographs,
 * retaining the original Atlas horses' stocky proportions, not muscular anatomy.
 */
import assert from 'node:assert/strict';
import{main}from'./redo-cd-utils.js';
import{surface,pencil,line,ellipse,face,save,type Point}from'./round3-graphite.js';
export const vehicle={boxCentre:[930,480]as Point,axle:[[863,490],[997,590]]as const,heng:[[366,264],[500,364]]as const,poleEnd:[433,314]as Point,spokes:28};
/** Near-side quarter view: long head, deep chest, plain rounded barrel and fine lower legs. */
function horse(dx:number,dy:number){
 let b=`<g transform="translate(${dx} ${dy})">`;
 const limbs=[
  'M348 445Q369 466 365 503L347 560L343 674L332 698L313 698L320 682L329 669L331 562L336 511Z',
  'M557 459Q583 471 574 506L551 562L555 650L571 676L568 688L545 687L541 672L538 564L546 515Z',
 ];
 for(const d of limbs)b+=surface(d,[300,440,290,270],(_u,v)=>.55+.2*v,.8,3,57,.8);
 const body='M277 255L272 222Q275 208 286 224L301 250L315 238L317 213Q323 205 333 229L340 252Q364 268 375 306L394 354Q430 370 471 360Q523 348 566 372Q606 396 605 433Q613 463 588 487Q560 507 520 508Q471 531 427 508L388 487Q363 475 350 451Q327 433 323 400L310 365L296 360L279 384Q265 408 242 407L218 393Q205 384 208 365L222 333L239 307L253 277Z';
 b+=surface(body,[205,207,412,326],(u,v)=>{const x=205+412*u,y=207+326*v;const blend=Math.max(0,Math.min(1,(x-345)/75)),n=(y-423)/88;const barrel=.1+.68*Math.max(0,n)+.16*Math.abs((x-470)/150);const neck=.12+.6*Math.abs((x-305)/85)+.22*Math.exp(-(((y-400)/55)**2));return barrel*blend+neck*(1-blend);},-.7,5,79,1.05);
 // Near foreleg and hindleg have articulated knees/hocks and small hooves.
 const near=[
  'M358 435Q382 446 380 481L372 531L356 580L355 687L347 704L352 716L327 716L329 702L340 687L343 582L347 532L346 482Z',
  'M557 453Q587 450 585 482L571 527L546 569L543 620L557 691L569 704L570 716L548 716L543 701L532 624L532 566L546 520Z',
 ];
 for(const d of near)b+=surface(d,[315,430,285,300],(u,v)=>.15+.2*v+.6*Math.abs(Math.sin(u*12)),.9,2,78,.85);
 for(const d of['M329 702L348 702L352 716L327 716Z','M544 704L565 701L570 716L548 716Z','M317 685L337 685L332 698L313 698Z','M545 675L564 674L568 688L545 687Z'])b+=surface(d,[300,675,290,50],()=>.82,.5,1,23,.6);
 // Relief follows the scapula, jaw, barrel and hock; no bulging muscle islands.
 b+=pencil('M326 285Q338 328 325 361M365 355Q349 398 365 433M386 386Q381 436 401 463M424 476Q477 505 524 483M557 386Q590 420 574 451M346 539Q360 547 379 539M530 575Q545 585 554 574',.8,.55);
 b+=pencil('M278 273Q300 265 312 282M285 281Q293 288 304 280M221 364Q238 354 246 369M212 384Q232 397 248 386',1,.75);
 // Short upright mane, single natural tail. No ornamental marks or modern collars.
 for(let i=0;i<44;i++){const t=i/44;b+=pencil(`M${333+t*48} ${254+t*99}q${9-t*5} ${-3} ${13-t*4} ${5}`,1,.65);}
 const tail='M599 412Q631 438 622 487Q613 528 634 559Q611 560 599 534Q591 515 601 479Q613 441 594 432Z';
 b+=surface(tail,[590,410,48,155],u=>.5+.4*u,1.3,2,91,.8);
 // Simple head straps are contour-following, entirely above the mouth.
 b+=pencil('M267 296L304 326M217 353Q234 368 255 372M304 326Q324 319 333 304',2,.7);
 b+='</g>';return b;
}
function wheel(x:number,y:number,rx:number,ry:number){
 const n=vehicle.spokes;assert.equal(n,28);let b='';
 const ring=`M${x-rx} ${y}a${rx} ${ry} 0 1 0 ${2*rx} 0a${rx} ${ry} 0 1 0 ${-2*rx} 0M${x-rx+13} ${y}a${rx-13} ${ry-17} 0 1 1 ${2*(rx-13)} 0a${rx-13} ${ry-17} 0 1 1 ${-2*(rx-13)} 0`;
 b+=surface(ring,[x-rx,y-ry,rx*2,ry*2],(_u,v)=>.36+.35*v,.8,2,33,1);
 for(let i=0;i<n;i++){const a=i*Math.PI*2/n,end:Point=[x+(rx-15)*Math.cos(a),y+(ry-20)*Math.sin(a)];b+=line([[x,y],end],'#777',3.2)+line([[x+1.8,y],end],'#444',.7);}
 b+=surface(`M${x-11} ${y-25}L${x+38} ${y-16}L${x+38} ${y+21}L${x-11} ${y+25}Z`,[x-12,y-25,53,52],(_u,v)=>.18+.65*v,.5,1,21,.9);
 b+=ellipse(x+38,y+2,12,20,'#fff','#666',1)+pencil(`M${x+43} ${y-14}Q${x+52} ${y+6} ${x+40} ${y+20}`,1.4,.8);return b;
}
export function chariot(){
 const{boxCentre,axle,heng,poleEnd}=vehicle;
 assert.equal(axle.length,2);assert.equal(heng.length,2);assert.equal((axle[0][0]+axle[1][0])/2,boxCentre[0]);assert((axle[0][1]+axle[1][1])/2>boxCentre[1]);
 assert.equal(poleEnd[0],(heng[0][0]+heng[1][0])/2);assert.equal(poleEnd[1],(heng[0][1]+heng[1][1])/2);
 const transverse:Point=[134,100],longitudinal:Point=[150,50];
 assert.equal((axle[1][0]-axle[0][0])*(heng[1][1]-heng[0][1]),(axle[1][1]-axle[0][1])*(heng[1][0]-heng[0][0]),'Axle, heng and horse spacing share one transverse projection');
 const shift=(p:Point,d:Point):Point=>[p[0]+d[0],p[1]+d[1]];
 const floorA:Point=[boxCentre[0]-(transverse[0]+longitudinal[0])/2,boxCentre[1]-(transverse[1]+longitudinal[1])/2];
 const floorB=shift(floorA,transverse),floorC=shift(floorB,longitudinal),floorD=shift(floorA,longitudinal);
 const tops=[floorA,floorB,floorC,floorD].map(p=>shift(p,[0,-120]));
 const [a,bTop,c,d]=tops as [Point,Point,Point,Point];
 let b=wheel(axle[0][0],axle[0][1],86,170);
 b+=line(axle,'#777',16)+line(axle,'#555',1);
 // A small open box: every shared corner comes from the same projected frame.
 b+=face([floorA,floorB,floorC,floorD],.42);
 b+=face([floorA,floorB,bTop,a],.31);
 b+=face([floorB,floorC,c,bTop],.58);
 b+=face([a,bTop,c,d],.17);
 const inset=tops.map(p=>[p[0]+(930-p[0])*.1,p[1]+(360-p[1])*.1] as Point);
 b+=face(inset,.65);
 // Contour-following wicker strands stay on the two visible vertical faces.
 for(const [start,end]of[[a,bTop],[bTop,c]]as const){
  for(let i=1;i<10;i++){const t=i/10,x=start[0]+(end[0]-start[0])*t,y=start[1]+(end[1]-start[1])*t;b+=pencil(`M${x} ${y}v118`,.7,.5);}
  for(let i=1;i<5;i++)b+=pencil(`M${start[0]} ${start[1]+i*24}L${end[0]} ${end[1]+i*24}`,.8,.55);
 }
 b+=line([a,bTop,c],'#777',5)+line([floorA,floorB,floorC],'#555',1);
 b+=horse(-28,-90);
 // Exactly ONE continuous curved pole, from under box centre to middle of heng.
 const pole='M930 482C760 442 619 368 478 339Q450 330 437 309L424 318Q444 344 473 351C619 381 756 455 928 497Z';
 b+=surface(pole,[360,337,575,165],(_u,v)=>.2+.6*v,.2,2,61,.9);
 b+=horse(106,10);
 // Heng crosses the withers; two inverted-V saddle yokes are above the necks.
 b+=surface('M355 255L512 372L504 385L347 268Z',[344,249,170,140],(_u,v)=>.35+.4*v,.4,1,77,.9);
 const saddles=[{x:366,y:264},{x:500,y:364}];assert.equal(saddles.length,2);
 assert.deepEqual(saddles.map(p=>[p.x,p.y]),[[394-28,354-90],[394+106,354+10]],'Both yokes sit on the traced withers, never under the jaw');
 for(const{x,y}of saddles){const d=`M${x-51} ${y+17}L${x-18} ${y-29}Q${x-10} ${y-39} ${x+1} ${y-31}L${x+54} ${y+9}L${x+45} ${y+21}L${x-8} ${y-15}L${x-38} ${y+22}Z`;b+=surface(d,[x-56,y-45,115,85],(_u,v)=>.22+.5*v,-.8,2,67,.9);b+=pencil(`M${x-13} ${y-24}l-3 33m8-29l-4 34`,.8,.7);}
 b+=wheel(axle[1][0],axle[1][1],112,210);
 return b;
}
if(main(import.meta.url))await save('warring-states-zhou-war-chariot',chariot());
