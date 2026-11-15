import assert from 'node:assert/strict';
import {save,poly,path,line,ellipse,random,type Point} from './continental-drift-plate.js';
// Tubes parallel to X, fins in YZ planes. Oblique projection is shared by all.
export const project=(x:number,y:number,z:number):Point=>[150+x+z*.65,660-y-z*.38];
export const fins=Array.from({length:16},(_,i)=>i*50);
export const tubes=Array.from({length:2},(_,row)=>Array.from({length:4},(_,j)=>({row,y:80+j*90,z:35+row*115}))).flat();
assert.equal(fins.length,16);assert.equal(tubes.length,8);assert.equal(new Set(tubes.map(t=>t.row)).size,2);
assert(fins.slice(1).every((x,i)=>x-fins[i]! === 50));
let b='';
// Back tubes first, then fins, then visible end stubs.
for(const t of tubes)b+=line([project(-25,t.y,t.z),project(800,t.y,t.z)],'#777777',15)+line([project(-25,t.y,t.z),project(800,t.y,t.z)],'#cecece',9);
const r=random(42);
for(const x of [...fins].reverse()){
 const p=[project(x,30,0),project(x,395,0),project(x,395,190),project(x,30,190)];
 b+=poly(p,x<400?'#eeeeee':'url(#metal)','#777777',1.4);
 b+=path(`M${p.map(q=>q.join(',')).join('L')}Z`,'url(#hatch)','none');
 b+=line([project(x+1,42,10),project(x+1,382,10)],'#999999',.7);
 if(x<400){
  // Thick crystalline accretion is attached to each of the eight left fins.
  // Ragged opaque perimeter and surface crystals replace the old almost invisible ticks.
  for(let edge=0;edge<4;edge++){
   const a=p[edge]!,c=p[(edge+1)%4]!;
   const n=Math.ceil(Math.hypot(c[0]-a[0],c[1]-a[1])/9);
   const crust:Point[]=Array.from({length:n+1},(_,j)=>{
    const t=j/n,rough=5+r()*9;return [a[0]+(c[0]-a[0])*t+rough,a[1]+(c[1]-a[1])*t+(r()-.5)*9];
   });
   b+=line([a,...crust,c],'#d6d6d6',14)+line([a,...crust,c],'#fafafa',9);
  }
  for(let i=0;i<230;i++){
   const y=42+r()*340,z=5+r()*180,c=project(x,y,z),k=2+r()*6;
   b+=poly([[c[0]-k,c[1]],[c[0],c[1]-k*.8],[c[0]+k,c[1]+2],[c[0]+1,c[1]+k]],i%3?'#fafafa':'#dddddd','#c5c5c5',.5);
  }

 }
}
for(const t of tubes){const p=project(780,t.y,t.z);b+=line([p,project(820,t.y,t.z)],'#777777',15)+ellipse(p[0]+40,p[1],8,8,'#a1a1a1','#555555',1.2);}
for(const y of [80,350]){
 const a=project(-10,y,0),c=project(385,y,0);
 b+=line([a,c],'#bcbcbc',23)+line([a,c],'#f8f8f8',16);
 for(let i=0;i<80;i++){const t=i/79,q:Point=[a[0]+(c[0]-a[0])*t,a[1]+(c[1]-a[1])*t];b+=ellipse(q[0],q[1]-4+r()*8,2+r()*4,2+r()*3,'#fafafa','#dedede',.4);}
}
// One continuous U heater below entire bank, both ends turn upward.
b+=line([project(0,30,25),[166,658]],'#777777',5)+line([project(750,30,190),[1036,561],[1036,620]],'#777777',5);
b+=path('M166 648L166 680Q166 702 190 702L1012 702Q1036 702 1036 678L1036 610','none','#5d5d5d',14)+path('M166 648L166 680Q166 702 190 702L1012 702Q1036 702 1036 678L1036 610','none','#bdbdbd',8);
if(!process.argv.includes('--check')) await save('refrigerator-frost',b);
