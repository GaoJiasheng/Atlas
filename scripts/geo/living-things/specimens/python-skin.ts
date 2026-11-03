/** Malayopython reticulatus: irregular black reticulation enclosing warm grey
 * dorsal saddles, gold flanks, pale lateral ocelli and broad ventral scutes.
 * Original sculpture; the pattern is pigmentation, never floating zigzag wires. */
import { Color, Float32BufferAttribute } from 'three';
import { sweepStations } from '../../../../src/engines/space-scene/lib/sweep';
import { primitiveSchema } from '../../../../src/engines/space-scene/schema';
import { surface,mesh,orb,tube,type P } from '../sculpture';
import type { Model } from '../kit';
const tau=Math.PI*2;
const smooth=(a:number,b:number,t:number)=>{const q=Math.max(0,Math.min(1,(t-a)/(b-a)));return q*q*(3-2*q);};
export function reticulatedSkin(model:Model):Model {
 const at=model.extra[0]!.at,path=model.primitive.path as P[],radii=model.primitive.radius as number[];
 const end=path.at(-1)!;
 const prim=primitiveSchema.parse({...model.primitive,path:[...path,[end[0]+.003,end[1]+.0012,end[2]]],radius:[...radii,.0026],segments:512,radial:48});
 if(prim.kind!=='sweep')throw new Error('Python requires a sweep centreline');
 const {stations}=sweepStations(prim),length=stations.at(-1)!.s;
 const N=stations.length-1,M=48,uv:number[]=[],colours:number[]=[];
 const grey=new Color('#95846a'),gold=new Color('#ad8b40'),black=new Color('#29271d'),cream=new Color('#d3c3a0');
 const body=surface(N,M,(u,v)=>{
  const st=stations[Math.round(u*N)]!,a=v*tau,belly=smooth(.30,.60,-Math.sin(a))*(1-smooth(.90,.98,u));
  // Scutes are contiguous transversely broad plates, with very shallow seams.
  const seam=Math.pow(.5+.5*Math.cos(st.s/length*tau*228),12);
  const r=st.r-.00010*seam*belly;
  const out=st.p.map((x,k)=>x+st.b[k]!*Math.cos(a)*r+st.n[k]!*Math.sin(a)*r) as P;
  uv.push((st.s/.012)*(1-belly)+(st.s/length*14.25)*belly,(v*2.7)*(1-belly)+(.0357+(v-.75)*.0045)*belly); // finer scales than the old fourteen-row whole-body map
  const angle=Math.atan2(Math.cos(a),Math.sin(a)); // zero at mid-dorsum
  const phase=st.s/length*23+.065*Math.sin(st.s/length*83),cell=Math.floor(phase),f=phase-cell;
  const jitter=.07*Math.sin(cell*2.39),centre=.08*Math.sin(cell*1.67),width=1.20+.12*Math.sin(cell*3.43);
  // Unequal diamond saddles with softly scalloped boundaries; neighbouring
  // outlines connect down the flank around cream-centred black ocelli.
  const diamond=Math.abs((f-.5+jitter)*2)+Math.abs((angle-centre)/width);
  const irregular=.045*Math.sin(f*31+angle*9)+.035*Math.sin(angle*23-cell*2.1);
  const edge=Math.abs(diamond-1+irregular),line=1-smooth(.11,.21,edge);
  const goldRim=1-smooth(.22,.34,edge);
  let c=grey.clone().lerp(gold,Math.max(goldRim,.3*smooth(.6,1.8,Math.abs(angle))));
  c.lerp(black,line);
  const flank=Math.abs(angle),spot=Math.hypot((f-.52)*2.8,(flank-1.83)*1.7);
  const ocellus=1-smooth(.35,.55,spot);
  c.lerp(black,ocellus).lerp(cream,(1-smooth(.19,.30,spot))*.95);
  c.lerp(cream,belly*.92).multiplyScalar(1-.11*seam*belly);
  colours.push(c.r,c.g,c.b);
  return out.map((x,k)=>x+prim.at[k]!) as P;
 },true);
 body.setAttribute('uv',new Float32BufferAttribute(uv,2));body.setAttribute('color',new Float32BufferAttribute(colours,3));
 // Anatomical head narrows toward a blunt snout; cheeks flare behind the eyes.
 const profile=[[.0001,.0001],[.0037,.0025],[.0046,.0030],[.0039,.0025],[.0030,.0017],[.0001,.0001]];
 const hc:number[]=[];
 const head=surface(42,32,(u,v)=>{
  const x=(u-.5)*.0138,a=-v*tau,q=u*(profile.length-1),i=Math.min(profile.length-2,Math.floor(q)),f=q-i;
  const w=profile[i]![0]!*(1-f)+profile[i+1]![0]!*f,h=profile[i]![1]!*(1-f)+profile[i+1]![1]!*f;
  const c=grey.clone().lerp(gold,.30).lerp(black,Math.exp(-Math.pow(Math.cos(a)/.09,2))*smooth(.1,.6,Math.sin(a))*.85);
  hc.push(c.r,c.g,c.b);return [at[0]+x,at[1]+Math.sin(a)*h,at[2]+Math.cos(a)*w];
 },true);
 // This loft uses X as its axis; reverse winding to face out.
 const ix=head.index!;for(let i=0;i<ix.count;i+=3){const b=ix.getX(i+1);ix.setX(i+1,ix.getX(i+2));ix.setX(i+2,b);}head.computeVertexNormals();
 head.setAttribute('color',new Float32BufferAttribute(hc,3));
 const extra=[mesh(head,'scales','#ffffff')];
 for(const side of [-1,1]){
  extra.push(mesh(orb([at[0]+.001,at[1]+.0013,at[2]+side*.0038],[.00115,.00105,.00078],20,12),'scales','#957323'));
  extra.push(mesh(orb([at[0]+.0011,at[1]+.0014,at[2]+side*.00443],[.00020,.00077,.00016],16,10),'eye','#201f18'));
  extra.push(mesh(tube([[at[0]+.006,at[1]-.0008,at[2]+side*.0015],[at[0]+.003,at[1]-.0015,at[2]+side*.003],[at[0]-.002,at[1]-.0016,at[2]+side*.0038]],[.00010,.00012,.00005],1,6,20),'eye','#3b3325'));
  for(let j=0;j<4;j++)extra.push(mesh(orb([at[0]+.005-j*.0013,at[1]-.0006,at[2]+side*(.0022+j*.00035)],[.00022,.00027,.00012],10,6),'eye','#473d2b'));
 }
 for(const p of extra.slice(1)){const g=p.geometry as import('three').BufferGeometry,uv=g.getAttribute('uv');if(uv)for(let i=0;i<uv.count;i++)uv.setXY(i,0,0);}
 return {primitive:mesh(body,'scales','#ffffff'),extra};
}
