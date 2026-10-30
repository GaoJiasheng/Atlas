import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { partsFile, type Primitive } from '../../src/engines/space-scene/schema';
import { partBounds, partCopies, partMaterialSlots, partPrimitives } from '../../src/engines/space-scene/lib/parts';
import { apply3, eulerDeg } from '../../src/engines/space-scene/lib/xform';
import { partPieces } from '../../src/engines/space-scene/stages/model3d/geometry';

const file=partsFile.parse(JSON.parse(readFileSync('src/content/topics/cells/data/parts.json','utf8')));
const part=(id:string)=>{const p=file.parts.find(p=>p.id===id);if(!p)throw new Error(id);return p;};
const polygon=(poly:readonly (readonly number[])[],x:number,y:number)=>{
 let inside=false;
 for(let i=0,j=poly.length-1;i<poly.length;j=i++){
  const a=poly[i]!,b=poly[j]!;
  if((a[1]!>y)!==(b[1]!>y)&&x<(b[0]!-a[0]!)*(y-a[1]!)/(b[1]!-a[1]!)+a[0]!)inside=!inside;
 }
 return inside;
};
function filled(p:Primitive,point:number[]):boolean{
 const q=point.map((x,i)=>x-p.at[i]!);
 if(p.kind==='box'||p.kind==='bevelBox')return q.every((v,i)=>Math.abs(v)<p.size[i]!/2-1e-8);
 if(p.kind==='extrude')return Math.abs(q[2]!)<p.depth/2-1e-8&&polygon(p.shape,q[0]!,q[1]!)&&!(p.holes??[]).some(h=>polygon(h,q[0]!,q[1]!));
 throw new Error(`Unexpected test solid ${p.kind}`);
}

describe('cells: physical model topology and microscope clearance',()=>{
 it('has 29 selectable logical parts, four groups, six cameras and no flows',()=>{
  expect(file.parts).toHaveLength(29);expect(file.parts.some(p=>p.context)).toBe(false);
  expect(file.parts.filter(p=>p.group==='animal-cell')).toHaveLength(3);
  expect(file.parts.filter(p=>p.group==='plant-cell')).toHaveLength(6);
  expect(file.parts.filter(p=>p.group==='microscope-bench')).toHaveLength(15);
  expect(file.parts.filter(p=>p.group==='tissue-context')).toHaveLength(5);
  expect(file.groups.find(g=>g.id==='tissue-context')?.card).toBe(false);
  expect(file.presets?.map(p=>p.id)).toEqual(['pair-hero','animal-close','animal-oblique','plant-close','scope-whole','scope-stage-close']);
  expect(file.flows).toHaveLength(0);expect(file.animations).toHaveLength(0);
  for(const p of file.parts){expect(p.summary?.en.length).toBeLessThanOrEqual(60);expect(p.detail?.en).toMatch(/\[S\d/);expect(p.detail?.zh).toMatch(/\[S\d/);}
 });
 it('uses hollow independent boundaries and preserves the model envelopes',()=>{
  for(const id of ['animal-membrane','plant-cell-wall','plant-membrane']){
   const p=part(id);expect(p.shell).toBe(true);
   for(const primitive of partPrimitives(p)){expect(primitive.kind).toBe('extrude');if(primitive.kind==='extrude')expect(primitive.holes).toHaveLength(1);}
  }
  const bounds=partBounds(part('plant-cell-wall'))!;
  for(const [i,size] of [.16,.08,.05].entries())expect(bounds.max[i]!-bounds.min[i]!).toBeCloseTo(size,8);
  const animal=partBounds(part('animal-membrane'))!;
  expect(animal.max[0]-animal.min[0]).toBeCloseTo(.12,8);expect(animal.max[1]-animal.min[1]).toBeCloseTo(.09,8);expect(animal.max[2]-animal.min[2]).toBeCloseTo(.016,8);
 });
 it('leaves real voids for the large vacuole and the side nucleus',()=>{
  const cyt=partPrimitives(part('plant-cytoplasm'));expect(cyt).toHaveLength(6);
  // Sample throughout each internal volume, rather than merely checking centres.
  for(const x of [-.158,-.13,-.1,-.07,-.042])for(const y of [.092,.105,.12,.135,.148])for(const z of [-.019,-.01,0,.01,.019])expect(cyt.some(p=>filled(p,[x,y,z]))).toBe(false);
  for(let a=0;a<16;a++)for(let k=-3;k<=3;k++){
   const z=k*.0015, f=Math.sqrt(1-(z/.006)**2), t=a*Math.PI/8;
   expect(cyt.some(p=>filled(p,[-.169+.0068*f*Math.cos(t),.12+.0058*f*Math.sin(t),z]))).toBe(false);
  }
  const n=partBounds(part('plant-nucleus'))!,v=partBounds(part('plant-vacuole'))!;
  expect(v.min[0]-n.max[0]).toBeCloseTo(.002,8);
  expect(file.parts.filter(p=>p.id.endsWith('-nucleus'))).toHaveLength(2);
 });
 it('keeps animal cytoplasm outside the single nucleus',()=>{
  const cyt=partPrimitives(part('animal-cytoplasm'));
  for(let i=0;i<24;i++)for(let j=-4;j<=4;j++){
   const z=j*.0015, f=Math.sqrt(1-(z/.0065)**2), t=i*Math.PI/12;
   expect(cyt.some(p=>filled(p,[.115+.0114*f*Math.cos(t),.1+.0094*f*Math.sin(t),.001+z]))).toBe(false);
  }
 });
 it('places all six chloroplasts around the vacuole, inside the membrane',()=>{
  const p=part('plant-chloroplasts'), main=p.primitive!, copies=partCopies(p);
  expect(copies).toHaveLength(6);
  const centres=copies.map(c=>c.centre.map((v,i)=>v+main.at[i]!));
  for(const [i,x] of centres.map(c=>c[0]!).sort((a,b)=>a-b).entries())expect(x).toBeCloseTo([-.15,-.15,-.1,-.1,-.05,-.05][i]!,10);
  for(const c of centres){expect(c[1]===.084||c[1]===.156).toBe(true);expect(Math.abs(c[1]!-.12)-.002).toBeGreaterThanOrEqual(.03-1e-9);expect(c[1]!-.002).toBeGreaterThan(.0818);expect(c[1]!+.002).toBeLessThan(.1582);}
 });
 it('indexes exactly one objective over the slide in every complete pose',()=>{
  const ids=['scope-objective-four','scope-objective-ten','scope-objective-forty'];
  const coverTop=partBounds(part('coverslip-glass'))!.max[1];
  for(const [poseId,active] of [['scope-scan',ids[0]],['scope-low',ids[1]],['scope-high',ids[2]]] as const){
   const pose=file.poses![poseId]!, onAxis:string[]=[];
   for(const id of ids){
    const p=part(id),entry=pose.parts[id]!,pivot=entry.pivot!;
    const rel=p.primitive!.at.map((v,i)=>v-pivot[i]!);
    const turned=apply3(eulerDeg(entry.rotation),rel), at=turned.map((v,i)=>v+pivot[i]!);
    if(Math.hypot(at[0]!-.18,at[2]!)<1e-8)onAxis.push(id);
    expect(partBounds(p)!.min[1]-coverTop).toBeGreaterThan(.003);
   }
   expect(onAxis).toEqual([active]);
  }
  for(const id of ['scope-condenser','scope-illuminator','slide-glass','coverslip-glass']){expect(part(id).primitive!.at[0]).toBe(.18);expect(part(id).primitive!.at[2]).toBe(0);}
  const stage=partPrimitives(part('scope-stage'));expect(stage.some(p=>filled(p,[.18,.168,0]))).toBe(false);
  expect(partBounds(part('slide-glass'))!.min[1]).toBeCloseTo(.172,10);
 });
 it('uses identical physical slide offsets, a fixed stage and three objective poses',()=>{
  const sim=file.sim!;
  const objective=sim.bind!.find(b=>'control' in b&&b.control==='objective');
  expect(objective&&'pose' in objective&&objective.pose).toEqual({'4':'scope-scan','10':'scope-low','40':'scope-high'});
  for(const id of ['slide-x','slide-y']){
   const binding=sim.bind!.find(b=>'control' in b&&b.control===id)!;
   expect('part' in binding&&binding.part).toEqual(['slide-glass','coverslip-glass']);
   expect('offset' in binding&&binding.offset?.per).toBe(1e-6);
  }
  expect(sim.bind!.some(b=>'part' in b&&(Array.isArray(b.part)?b.part:[b.part]).includes('scope-stage'))).toBe(false);
 });
 it('separates all solid cell structures at full model peel',()=>{
  for(const group of ['animal-cell','plant-cell']){
   const bounds=file.parts.filter(p=>p.group===group).map(p=>{
    const d=p.explode.dir, length=Math.hypot(...d), offset=d.map(v=>v/length*p.explode.dist);
    return {id:p.id,box:partBounds(p,offset)!};
   });
   for(let i=0;i<bounds.length;i++)for(let j=i+1;j<bounds.length;j++){
    const a=bounds[i]!,b=bounds[j]!;
    const overlap=a.box.min.every((v,k)=>Math.min(a.box.max[k]!,b.box.max[k]!)-Math.max(v,b.box.min[k]!)>1e-8);
    expect(overlap,`${a.id} / ${b.id}`).toBe(false);
   }
  }
 });
 it('builds finite CPU geometry within the triangle and material-slot budgets',()=>{
  let triangles=0,slots=0;
  for(const p of file.parts){
   slots+=partMaterialSlots(p).length;
   for(const piece of partPieces(p)){
    const attr=piece.geometry.getAttribute('position');
    expect(Array.from(attr.array).every(Number.isFinite)).toBe(true);
    triangles+=(piece.geometry.index?.count??attr.count)/3*(piece.matrices?.length??1);
    piece.geometry.dispose();
   }
  }
  expect(triangles).toBeLessThan(300_000);expect(slots).toBeLessThan(50);
 });
});
