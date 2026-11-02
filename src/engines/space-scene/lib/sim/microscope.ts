/** Deterministic object-side microscopy. No camera, randomness, clock or DOM. */
import type { MicroscopeData, MicroscopePattern } from '../../microscope-schema';
import type { SimValues } from '../../sim-schema';
export const MICROSCOPE_STATES:Record<string,readonly string[]>={ 'target-location':['inside','outside'],'focus-status':['sharp','soft','blurred'],'view-status':['inactive','dark','outside','sharp','soft','blurred'] };
const NUMBERS=['total-power','field-diameter-um','target-u','target-v','clarity','blur-px'];
export const microscopeQuantity=(id:string):'number'|'state'|null=>NUMBERS.includes(id)?'number':id in MICROSCOPE_STATES?'state':null;
export class MicroscopeInputError extends Error { readonly code='microscope-input'; constructor(readonly field:string,message:string){super(`${field}: ${message}`);this.name='MicroscopeInputError';} }
const fail=(field:string,message:string):never=>{throw new MicroscopeInputError(field,message);};
export function microscopeInputs(m:MicroscopeData,v:SimValues){
 const value=(k:keyof MicroscopeData['controls'])=>v[m.controls[k]];
 const number=(k:'objective'|'slideX'|'slideY'|'focusZ'|'illumination',test:(n:number)=>boolean)=>{const n=value(k);return typeof n==='number'&&Number.isFinite(n)&&test(n)?n:fail(m.controls[k],'invalid finite numeric control value');};
 const specimen=m.specimens.find(s=>s.id===value('specimen'))??fail(m.controls.specimen,'unknown specimen');
 const objective=number('objective',n=>m.objectives.some(o=>o.power===n));
 const slideX=number('slideX',n=>n>=-1000&&n<=1000&&n%100===0),slideY=number('slideY',n=>n>=-1000&&n<=1000&&n%100===0);
 const focusZ=number('focusZ',n=>n>=-20&&n<=20&&Number.isInteger(n)),illumination=number('illumination',n=>[0,.25,.5,.75,1].includes(n));
 const enabled=value('enabled');if(typeof enabled!=='boolean')fail(m.controls.enabled,'expected boolean');
 const width=m.objectives.find(o=>o.power===objective)!.focusWidthUm;
 for(const [field,n]of Object.entries({ocularPower:m.ocularPower,fieldNumberMm:m.fieldNumberMm,focusWidthUm:width}))if(!Number.isFinite(n)||n<=0)fail(field,'expected positive finite value');
 if(specimen.target.atUm.some(n=>!Number.isFinite(n)))fail('target.atUm','expected finite coordinates');
 return {specimen,objective,slideX,slideY,focusZ,illumination,enabled,width};
}
export function featureFocus(z:number,focusZ:number,width:number){const clarity=Math.max(0,1-Math.abs(focusZ-z)/width);return {clarity,blurPx:8*(1-clarity)};}
export function solveMicroscope(m:MicroscopeData,v:SimValues):Record<string,number|string>{
 const i=microscopeInputs(m,v),radius=500*m.fieldNumberMm/i.objective;
 const x=i.specimen.target.atUm[0]+i.slideX,y=i.specimen.target.atUm[1]+i.slideY;
 const {clarity,blurPx}=featureFocus(i.specimen.target.atUm[2],i.focusZ,i.width);
 const location=Math.hypot(x,y)<=radius?'inside':'outside',focus=clarity>=.75?'sharp':clarity>0?'soft':'blurred';
 const q={'total-power':m.ocularPower*i.objective,'field-diameter-um':2*radius,'target-u':-x/radius||0,'target-v':-y/radius||0,clarity,'blur-px':blurPx,'target-location':location,'focus-status':focus,'view-status':!i.enabled?'inactive':i.illumination===0?'dark':location==='outside'?'outside':focus};
 if(Object.values(q).some(n=>typeof n==='number'&&!Number.isFinite(n)))fail('quantities','non-finite model result');
 return q;
}
/** Exact filled-feature intersection with the circular object field. */
export function featureInDisk(f:MicroscopePattern['features'][number],cx:number,cy:number,r:number):boolean{
 if(f.axesUm){
  const a=f.axesUm[0]/2,b=f.axesUm[1]/2;
  if((cx/a)**2+(cy/b)**2<=1)return true;
  const equation=(t:number)=>(a*cx/(t+a*a))**2+(b*cy/(t+b*b))**2;
  let lo=0,hi=Math.max(a*a,b*b,1);while(equation(hi)>1)hi*=2;
  for(let k=0;k<64;k++){const mid=(lo+hi)/2;if(equation(mid)>1)lo=mid;else hi=mid;}
  return Math.hypot(cx-a*a*cx/(hi+a*a),cy-b*b*cy/(hi+b*b))<=r;
 }
 const p=f.pointsUm!.map(([x,y])=>[cx+x,cy+y] as const);let inside=false;
 for(let k=0,j=p.length-1;k<p.length;j=k++){
  const [ax,ay]=p[j]!,[bx,by]=p[k]!;
  if((ay>0)!==(by>0)&&0<(bx-ax)*(-ay)/(by-ay)+ax)inside=!inside;
  const dx=bx-ax,dy=by-ay,t=Math.max(0,Math.min(1,-(ax*dx+ay*dy)/(dx*dx+dy*dy)));
  if(Math.hypot(ax+t*dx,ay+t*dy)<=r)return true;
 }
 return inside;
}
export type FieldFeature=MicroscopePattern['features'][number]&{instanceId:string;tile:[number,number];positionUm:[number,number,number];u:number;v:number;clarity:number;blurPx:number};
/** Finite patch first, bounding candidates second, then exact feature/disk intersection. */
export function microscopeFeatures(m:MicroscopeData,v:SimValues):FieldFeature[]{
 const i=microscopeInputs(m,v),p=m.patterns.find(p=>p.id===i.specimen.pattern);if(!p)fail('pattern','missing specimen pattern');
 const radius=500*m.fieldNumberMm/i.objective,out:FieldFeature[]=[];
 const [px,py]=p!.periodUm,[ox,oy]=p!.originUm;
 const minX=Math.max(p!.tileRange.x[0],Math.floor((-radius-i.slideX-ox)/px)-1),maxX=Math.min(p!.tileRange.x[1],Math.ceil((radius-i.slideX-ox)/px)+1);
 const minY=Math.max(p!.tileRange.y[0],Math.floor((-radius-i.slideY-oy)/py)-1),maxY=Math.min(p!.tileRange.y[1],Math.ceil((radius-i.slideY-oy)/py)+1);
 for(let tx=minX;tx<=maxX;tx++)for(let ty=minY;ty<=maxY;ty++)for(const f of p!.features){
   const x=f.atUm[0]+ox+tx*px,y=f.atUm[1]+oy+ty*py,z=f.atUm[2],cx=x+i.slideX,cy=y+i.slideY;
   const reach=f.axesUm?Math.max(...f.axesUm)/2:Math.max(...f.pointsUm!.map(pt=>Math.hypot(...pt)));
   if(Math.hypot(cx,cy)>radius+reach||!featureInDisk(f,cx,cy,radius))continue;
   out.push({...f,instanceId:`${tx}:${ty}:${f.id}`,tile:[tx,ty],positionUm:[x,y,z],u:-cx/radius||0,v:-cy/radius||0,...featureFocus(z,i.focusZ,i.width)});
 }
 if(out.length>2048)fail('patterns','visible feature budget exceeded');return out;
}
export function microscopeFieldReading(m:MicroscopeData,v:SimValues){
 const q=solveMicroscope(m,v),i=microscopeInputs(m,v);
 return {specimen:i.specimen.id,totalPower:q['total-power'] as number,fieldDiameterUm:q['field-diameter-um'] as number,targetUV:[q['target-u'],q['target-v']] as [number,number],targetLocation:q['target-location'] as string,focusStatus:q['focus-status'] as string,viewStatus:q['view-status'] as string,visibleFeatureIds:i.enabled&&i.illumination>0?microscopeFeatures(m,v).map(f=>f.instanceId):[],bufferSize:[512,512] as [number,number]};
}
