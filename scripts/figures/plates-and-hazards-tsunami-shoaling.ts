import { saveGuide } from './round2-graphite.js';
import assert from 'node:assert/strict';
import { main,poly,path,line,arrow,type Point } from './redo-cd-utils.js';
export function shoaling(){
 // Qualitative shallow-water scaling: c ∝ sqrt(depth), lambda ∝ c and A ∝ depth^(-1/4).
 const depth=(t:number)=>5000*(1-t)**2+40;
 // Independent display scale exaggerates near-shore water depth; troughs stay submerged.
 const displayDepth=(t:number)=>400*(1-t)**2+90;
 const amplitude=(t:number)=>22*(depth(0)/depth(t))**.25;
 const wavelength=(t:number)=>570*Math.sqrt(depth(t)/depth(0));
 assert(depth(0)>depth(1)*20);assert(amplitude(1)>amplitude(0)*2);assert(wavelength(1)<wavelength(0)/4);
 const base=320,water:Point[]=[];let phase=0;
 for(let x=75;x<=1060;x+=2){const t=(x-75)/985;phase+=2*Math.PI*2/wavelength(t);water.push([x,base-amplitude(t)*Math.sin(phase)]);}
 assert(Array.from({length:101},(_,i)=>i/100).every(t=>displayDepth(t)>amplitude(t)));
 const seabed:Point[]=Array.from({length:100},(_,i)=>{const t=i/99;return[75+t*985,base+displayDepth(t)];});
 let b=poly([...water,...seabed.slice().reverse()],'#e4e4e4');
 b+=poly([...seabed,[1125,240],[1125,825],[75,825]],'#b9b9b9');
 b+=path(`M${seabed.map(p=>p.join(' ')).join('L')}L1125 240V825H75Z`,'url(#section)','none');
 b+=line([[75,base],[1125,base]],'#7d7d7d',1.4,'stroke-dasharray="13 10"');
 b+=line(water,'#555',2.4);
 b+=arrow([125,180],[410,180],3)+arrow([815,180],[1020,180],3);
 b+=arrow([145,355],[145,750],2)+arrow([145,750],[145,355],2);
 b+=arrow([1015,350],[1015,base+displayDepth(.955)-8],2);
 // Water texture is horizontal and sparse, leaving sea level, profile and wave peaks unambiguous.
 for(let i=0;i<18;i++){
  const x=110+(i%6)*122,y=415+Math.floor(i/6)*110;
  // Both ends must lie inside water; horizontal water marks never cross rock.
  if([x,x+65].every(u=>y<base+displayDepth((u-75)/985)-15))b+=line([[x,y],[x+65,y]],'#b1b1b1',.8);
 }
 return b;
}
if(main(import.meta.url))await saveGuide('plates-and-hazards-tsunami-shoaling',shoaling());
