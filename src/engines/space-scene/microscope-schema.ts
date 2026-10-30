/** A finite, original teaching model, in object-side micrometres. */
import { z } from 'zod';
import { kebabId } from '../../content/schema/common';
import type { SimControl } from './sim-schema';
import recipe from './lib/sim/microscope-patterns.json';
const finite = z.number().finite(), positive = finite.positive();
const bilingual=z.object({en:z.string().trim().min(1),zh:z.string().trim().min(1)}).strict();
const point = z.tuple([finite, finite]);
const triple = z.tuple([finite, finite, finite]);
export const MICROSCOPE_PATTERNS = ['onion-grid', 'leaf-grid', 'cheek-grid'] as const;
const feature = z.object({
  id: kebabId, kind: z.enum(['ellipse','polygon']), role: z.enum(['wall','membrane-boundary','nucleus','chloroplast','cytoplasm-area']),
  atUm: triple, axesUm: z.tuple([positive,positive]).optional(), pointsUm: z.array(point).min(3).max(32).optional(), contrast: finite.min(0).max(1), parentCell: kebabId,
}).strict().superRefine((f,ctx) => {
  if (f.kind === 'ellipse' ? !f.axesUm || !!f.pointsUm : !f.pointsUm || !!f.axesUm) ctx.addIssue({code:'custom',path:[f.kind === 'ellipse' ? 'axesUm':'pointsUm'],message:'provide only the geometry for this feature kind'});
  const p = f.pointsUm;
  if (!p) return;
  const cross = (a:number[],b:number[],c:number[]) => (b[0]!-a[0]!)*(c[1]!-a[1]!)-(b[1]!-a[1]!)*(c[0]!-a[0]!);
  let area=0;
  for(let i=0;i<p.length;i++) {
    const a=p[i]!,b=p[(i+1)%p.length]!; area+=a[0]*b[1]-a[1]*b[0];
    if(a[0]===b[0]&&a[1]===b[1])ctx.addIssue({code:'custom',path:['pointsUm',i],message:'duplicate adjacent polygon vertex'});
    for(let j=i+2;j<p.length;j++){
      if(i===0&&j===p.length-1)continue;
      const c=p[j]!,d=p[(j+1)%p.length]!;
      const intersects = cross(a,b,c)*cross(a,b,d)<=0 && cross(c,d,a)*cross(c,d,b)<=0 && Math.max(Math.min(a[0],b[0]),Math.min(c[0],d[0]))<=Math.min(Math.max(a[0],b[0]),Math.max(c[0],d[0])) && Math.max(Math.min(a[1],b[1]),Math.min(c[1],d[1]))<=Math.min(Math.max(a[1],b[1]),Math.max(c[1],d[1]));
      if(intersects)ctx.addIssue({code:'custom',path:['pointsUm',j],message:'polygon must not self-intersect'});
    }
  }
  if(Math.abs(area)<1e-9)ctx.addIssue({code:'custom',path:['pointsUm'],message:'polygon must have positive area'});
});
const range=z.tuple([finite.int().min(-20).max(20),finite.int().min(-20).max(20)]).refine(([a,b])=>a<=b,'tile range must ascend');
export const microscopePatternSchema=z.object({id:z.enum(MICROSCOPE_PATTERNS),periodUm:z.tuple([positive,positive]),originUm:point,tileRange:z.object({x:range,y:range}).strict(),features:z.array(feature).min(1).max(32)}).strict().superRefine((p,ctx)=>{
  if((p.tileRange.x[1]-p.tileRange.x[0]+1)*(p.tileRange.y[1]-p.tileRange.y[0]+1)*p.features.length>2048)ctx.addIssue({code:'custom',path:['tileRange'],message:'finite patch exceeds 2048 feature instances'});
  if(new Set(p.features.map(f=>f.atUm[2])).size>3)ctx.addIssue({code:'custom',path:['features'],message:'at most three optical depth layers'});
  p.features.forEach((f,i)=>{
    const bounds=[...p.tileRange.x.flatMap(tx=>p.tileRange.y.flatMap(ty=>[f.atUm[0]+p.originUm[0]+tx*p.periodUm[0],f.atUm[1]+p.originUm[1]+ty*p.periodUm[1]]))];
    if(bounds.some(n=>!Number.isFinite(n)))ctx.addIssue({code:'custom',path:['features',i,'atUm'],message:'all finite patch coordinates must remain finite'});
    if(p.features.findIndex(x=>x.id===f.id)!==i)ctx.addIssue({code:'custom',path:['features',i,'id'],message:'duplicate template feature id'});
    if(!p.features.some(x=>x.id===f.parentCell&&['wall','membrane-boundary','cytoplasm-area'].includes(x.role)))ctx.addIssue({code:'custom',path:['features',i,'parentCell'],message:'parentCell must name a cell outline or area in this template'});
  });
});
export const microscopeSchema=z.object({
  controls:z.object({specimen:kebabId,objective:kebabId,slideX:kebabId,slideY:kebabId,focusZ:kebabId,illumination:kebabId,enabled:kebabId}).strict(),
  ocularPower:positive,fieldNumberMm:positive,objectives:z.array(z.object({power:positive,focusWidthUm:positive}).strict()).length(3),
  specimens:z.array(z.object({id:kebabId,label:bilingual,target:z.object({id:kebabId,atUm:triple}).strict(),pattern:z.enum(MICROSCOPE_PATTERNS)}).strict()).min(1).max(3),
  patterns:z.array(microscopePatternSchema).min(1).max(3).default(()=>recipe.patterns as z.input<typeof microscopePatternSchema>[]),
  sources:z.array(z.string().regex(/^S\d+$/)).min(1),
}).strict().superRefine((m,ctx)=>{
  const add=(path:(string|number)[],message:string)=>ctx.addIssue({code:'custom',path,message});
  if(!Number.isFinite(m.fieldNumberMm*1000)||!Number.isFinite(m.ocularPower*40))add(['fieldNumberMm'],'model quantities must remain finite');
  if(new Set(Object.values(m.controls)).size!==7)add(['controls'],'seven distinct controls are required');
  if(m.objectives.map(x=>x.power).join(',')!=='4,10,40')add(['objectives'],'objective powers must be exactly 4,10,40 in ascending order');
  const targets=new Set<string>();
  m.specimens.forEach((s,i)=>{
    if(m.specimens.findIndex(x=>x.id===s.id)!==i)add(['specimens',i,'id'],'duplicate specimen id');
    if(targets.has(s.target.id))add(['specimens',i,'target','id'],'duplicate target id'); targets.add(s.target.id);
    const radius=500*m.fieldNumberMm/40;
    if(radius<=0||!Number.isFinite((Math.max(Math.abs(s.target.atUm[0]),Math.abs(s.target.atUm[1]))+1000)/radius))add(['specimens',i,'target','atUm'],'projection must remain finite across the full slide range');
    const p=m.patterns.find(x=>x.id===s.pattern), f=p?.features.find(x=>x.id===s.target.id);
    if(!f)add(['specimens',i,'target','id'],'target must exist in its pattern');
    else if(s.target.atUm.some((v,j)=>v!==f.atUm[j]!+(j<2?p!.originUm[j]!:0)))add(['specimens',i,'target','atUm'],'target coordinates must match the template feature plus origin');
  });
  m.patterns.forEach((p,i)=>{if(m.patterns.findIndex(x=>x.id===p.id)!==i)add(['patterns',i,'id'],'duplicate pattern id');});
});
export type MicroscopeData=z.output<typeof microscopeSchema>;
export type MicroscopePattern=z.output<typeof microscopePatternSchema>;
export const microscopeOverlaySchema=z.object({kind:z.literal('microscope-field'),model:z.literal('microscope'),group:kebabId,when:z.object({control:kebabId,is:z.literal(true)}).strict(),diameterPx:finite.int().min(180).max(360).default(300),maxBufferPx:z.literal(512),title:bilingual}).strict();
export const MICROSCOPE_STEPS={ objective:[4,10,40],slideX:Array.from({length:21},(_,i)=>(i-10)*100),slideY:Array.from({length:21},(_,i)=>(i-10)*100),focusZ:Array.from({length:41},(_,i)=>i-20),illumination:[0,.25,.5,.75,1] };
export function microscopeIssues(m:MicroscopeData,controls:ReadonlyMap<string,SimControl>){
  const out:{path:(string|number)[];message:string}[]=[];
  const issue=(path:(string|number)[],message:string)=>out.push({path,message});
  if(controls.size!==7)issue(['controls'],'microscope requires exactly seven controls');
  const names={specimen:'specimen',objective:'objective',slideX:'slide-x',slideY:'slide-y',focusZ:'focus-z',illumination:'illumination',enabled:'field-on'};
  for(const [field,id]of Object.entries(m.controls)){
    const c=controls.get(id); if(id!==names[field as keyof typeof names])issue(['controls',field],`must name ${names[field as keyof typeof names]}`);
    if(!c){issue(['controls',field],`unknown control ${id}`);continue;}
    if(field==='specimen'){
      const ids=m.specimens.map(s=>s.id).sort();
      if(c.kind!=='choice'||c.options.map(o=>o.id).sort().join(',')!==ids.join(','))issue(['controls',field],'choice must exactly cover specimens');
      if(c.default!=='onion-bulb')issue(['controls',field],'default must be onion-bulb');
    }else if(field==='enabled'){
      if(c.kind!=='toggle'||c.default!==false)issue(['controls',field],'field-on must be a toggle defaulting to false');
    }else{
      const steps=MICROSCOPE_STEPS[field as keyof typeof MICROSCOPE_STEPS];
      if(c.kind!=='step'||c.values.join(',')!==steps.join(','))issue(['controls',field],`step values must be exactly ${steps.join(',')}`);
      const initial=field==='objective'?4:field==='illumination'?.5:0;
      if(c.default!==initial)issue(['controls',field],`default must be ${initial}`);
    }
  }
  return out;
}
export function microscopeSourceIssues(m:MicroscopeData,sources:ReadonlyMap<string,{design?:boolean}>){
  const out=m.sources.flatMap((id,i)=>sources.has(id)?[]:[{path:['sources',i] as (string|number)[],message:`unknown source ${id}`}]);
  if(!m.sources.some(id=>sources.get(id)?.design===true))out.push({path:['sources'],message:'microscope requires at least one design:true source'});
  return out;
}
