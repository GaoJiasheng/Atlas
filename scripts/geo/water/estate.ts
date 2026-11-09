/** Round-2 estate: architecture remains volumetric through every facade. */
import { Sculpture, hdb, type V } from './scenery';
import { Architecture } from './occlusion';
import { opaqueUV } from './vegetation';
function tank(s:Sculpture,x:number,y:number,z:number){
 const w=.023,d=.030,h=.018;
 s.box([x,y+.002,z],[w+.005,.004,d+.006],'neutral');
 s.box([x,y+.004+h/2,z],[w,h,d],'paper');
 for(const sign of [-1,1]){
  for(const u of [-.5,0,.5])s.box([x+u*w,y+.004+h/2,z+sign*(d/2+.0004)],[.0007,h,.0009],'ink-3');
  for(const v of [0,.5,1])s.box([x,y+.004+v*h,z+sign*(d/2+.0004)],[w,.0007,.0009],'ink-3');
 }
 s.box([x,y+h+.005,z],[w+.001,.002,d+.001],'neutral');
 s.box([x+.003,y+h+.007,z],[.007,.002,.008],'ink-3');
 s.tube([[x+w/2,y+.012,z],[x+w/2+.004,y+.012,z],[x+w/2+.004,y-.001,z]],.0011,.0011,'ink-3',4,8);
}
/** Four square corner dwellings around a recessed circulation core. Continuous
 * corner piers and recessed glazing keep the towers from reading as combs. */
function tower(s:Sculpture,x:number,z:number,h:number){
 const f=h/15,w=.042,offset=.026,ground=f;
 s.box([x,h/2,z],[.031,h,.031],'neutral');
 s.box([x,.0015,z],[.111,.003,.111],'neutral');
 for(const sx of [-1,1])for(const sz of [-1,1]){
  const cx=x+sx*offset,cz=z+sz*offset;
  // Open void deck, seated outer columns and continuous inner bearing walls.
  for(const dx of [-.016,.016])for(const dz of [-.016,.016])s.box([cx+dx,ground/2,cz+dz],[.0038,ground,.0038],'neutral');
  s.box([cx-sx*w/2,(h+f)/2,cz],[.0025,h-f,w],'paper');
  s.box([cx,(h+f)/2,cz-sz*w/2],[w,h-f,.0025],'paper');
  for(const axis of [0,2]){
   for(const sign of [-1,1]){
    const at:V=[cx,(h+f)/2,cz];at[axis]!+=sign*(w/2-.0013);at[axis===0?2:0]!+=(axis===0?sz:sx)*w/2;
    s.box(at,axis===0?[.0026,h-f,.004]:[.004,h-f,.0026],'paper');
   }
  }
  for(let floor=1;floor<=15;floor++){
   const y=floor*f;s.box([cx,y,cz],[w,.0016,w],'neutral');if(floor===15)break;
   for(const axis of [0,2]){
    const direction=axis===0?sx:sz,at:V=[cx,y+f*.17,cz];at[axis]!+=direction*w/2;
    s.box(at,axis===0?[.003,f*.25,w]:[w,f*.25,.003],'paper');
    const glass:V=[cx,y+f*.59,cz];glass[axis]!+=direction*(w/2-.002);
    s.box(glass,axis===0?[.0006,f*.55,w-.006]:[w-.006,f*.55,.0006],'ink-2',0,.45);
    const mullion=[...glass] as V;mullion[axis]!+=direction*.002;
    s.box(mullion,axis===0?[.002,f*.56,.001]:[.001,f*.56,.002],'paper');
   }
  }
 }
 s.box([x,h+.010,z],[.040,.020,.040],'neutral');
}
export function estate(){
 const s=new Architecture();
 for(let row=0;row<3;row++)for(let i=0;i<4;i++){
  const x=-.45+i*.35,z=-1+row*.28;
  if((i+row)%3===0){
   const h=.23+(i%2)*.03;tower(s,x,z,h);
   // Low parapet caps each wing; the overrun stays attached at the core.
   for(const sign of [-1,1])for(const axis of [0,2]){
    const at:V=[x,h+.003,z];at[axis]!+=sign*.047;
    s.box(at,axis===0?[.002,.006,.072]:[.072,.006,.002],'paper');
   }
   tank(s,x,h+.020,z);
  }else{
   const h=.145+row*.008;hdb(s,[x,0,z],.205,h,.070,9,4,false,12,true);
   // A pair of panelled storage tanks sits on each slab roof; formerly a cube.
   for(const dx of [.020,.058])tank(s,x+dx,h+.001,z+.001);
   // A projecting gallery stair, with real landings and inclined stair flights.
   for(let floor=0;floor<8;floor++){
    const y=(floor+1)*h/9;
    s.box([x-.083,y,z-.044],[.025,.002,.021],'neutral');
    for(let step=0;step<7;step++)s.box([x-.091+step*.0026,y+(step+1)*h/63,z-.044],[.0026,.0015,.017],'neutral');
   }
  }
 }
 return opaqueUV(s.finish());
}
