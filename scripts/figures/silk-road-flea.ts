import assert from 'node:assert/strict';
import {save,path,line,texture,type Point} from './continental-drift-plate.js';
export const legs:Point[][]=[[[448,480],[358,557],[272,647],[156,673]],[[492,490],[440,613],[367,722],[269,746]],[[538,478],[682,565],[611,704],[937,736]],[[461,490],[387,589],[292,691],[147,730]],[[507,498],[478,650],[422,764],[290,790]],[[546,488],[730,601],[651,753],[1025,794]]];
assert.equal(legs.length,6);assert(legs.every(l=>l.length===4));
assert(Math.hypot(legs[5]![1]![0]-legs[5]![0]![0],legs[5]![1]![1]-legs[5]![0]![1])>150);
let b='';
for(const [i,p]of legs.entries()){
 b+=line(p,i<3?'#999999':'#696969',i%3===2?18:10)+line(p,i<3?'#dddddd':'#bfbfbf',i%3===2?12:6);
 const end=p[3]!,direction=i%3===2?1:-1;
 b+=line([end,[end[0]+direction*35,end[1]+6]],'#777777',2);
 for(let j=1;j<=5;j++)b+=line([[end[0]+direction*j*7,end[1]+j*1.2-2],[end[0]+direction*j*7,end[1]+j*1.2+2]],'#777777',.8);
 b+=path(`M${end[0]+direction*35} ${end[1]+6}l${direction*4} 8l${direction*9} -3`,'none','#777777',1.5);
}
b+=texture('M517 345C605 225 813 179 936 268C1037 341 1030 469 938 523C823 580 657 553 558 490Z','#bdbdbd');
for(let i=0;i<8;i++)b+=path(`M${610+i*46} ${266+i*1.5}C${570+i*48} 342 ${601+i*48} 457 ${640+i*43} ${530-i*2}`,'none','#7e7e7e',1.8);
b+=texture('M420 347C474 313 542 335 564 386L558 490Q484 534 429 481Z','#c7c7c7');
b+=path('M459 342Q491 420 468 504M505 344Q541 416 514 512','none','#888888',2);
b+=texture('M403 338C355 310 310 337 291 385C276 423 291 471 335 492L418 476Q446 405 403 338Z','#cecece');
// No genal/pronotal combs: characteristic of Xenopsylla, unlike cat fleas.
b+=path('M382 373Q361 396 380 426Q393 438 403 418M382 386q15 12 6 25','none','#828282',2);
b+=path('M322 474L324 540M334 479L339 551M345 481L350 534','none','#777777',3);
function hairs(points:Point[],count:number,length:number){
 const [a,c,d,z]=points as [Point,Point,Point,Point];
 for(let i=1;i<count;i++){const t=i/count,u=1-t;
  const x=u*u*u*a[0]+3*u*u*t*c[0]+3*u*t*t*d[0]+t*t*t*z[0],y=u*u*u*a[1]+3*u*u*t*c[1]+3*u*t*t*d[1]+t*t*t*z[1];
  const dx=3*u*u*(c[0]-a[0])+6*u*t*(d[0]-c[0])+3*t*t*(z[0]-d[0]),dy=3*u*u*(c[1]-a[1])+6*u*t*(d[1]-c[1])+3*t*t*(z[1]-d[1]),norm=Math.hypot(dx,dy);
  b+=line([[x,y],[x+dy/norm*length,y-dx/norm*length]],'#777777',.8);
 }
}
hairs([[517,345],[605,225],[813,179],[936,268]],32,17);
hairs([[936,268],[1037,341],[1030,469],[938,523]],10,15);
hairs([[938,523],[823,580],[657,553],[558,490]],22,16);
// Bacterium inset is a plain rod capsule, no symbol or anatomical equivalence.
b+=path('M957 100L1044 100A26 26 0 0 1 1044 152L957 152A26 26 0 0 1 957 100Z','#d0d0d0','#777777',1.8);
await save('silk-road-flea',b);
