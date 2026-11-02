/** Sound-only author, travel-event and nullable display contract (docs/64 §4). */
import { describe, expect, it } from 'vitest';
import { simSchema, simIssues, quantityKind, chapterSimIssues, simTrySchema } from '../../src/engines/space-scene/sim-schema';
import { solveSenses, solveSoundLab, effectiveEyeRays, longitudinalPositions, SENSES_STATES } from '../../src/engines/space-scene/lib/sim/senses';
import { evaluateSim, numberOf } from '../../src/engines/space-scene/lib/sim';
import { outputText } from '../../src/engines/space-scene/lib/sim/text';
import { chartModel, chartSummary } from '../../src/engines/space-scene/lib/sim/chart';
import { recordRow } from '../../src/engines/space-scene/lib/sim/trial';
import { sensesSourceIssues } from '../../src/engines/space-scene/senses-schema';
import { SENSES_BENCH_SIM } from './fixtures/senses-bench';
const label = {en:'Model',zh:'模型'};
function rawSound(lab=true): any {
  const legacy=structuredClone(SENSES_BENCH_SIM);
  return {kind:'senses',controls:[...legacy.controls.slice(4),...(lab ? [
    {id:'medium',kind:'choice',label,options:['air','water','solid-example','vacuum'].map(id=>({id,label})),default:'air'},
    {id:'distance-m',kind:'step',label,values:[17,34,68],default:34},
  ] : [])],outputs:[...legacy.outputs.filter(o=>['visual-hz','wavelength-scene','displacement-max','amplitude-level','sound-state'].includes(o.id)),
    {id:'source-drive',kind:'state',label,states:Object.fromEntries(SENSES_STATES['source-drive']!.map(s=>[s,label]))},
    ...(lab ? ['speed-mps','one-way-ms','echo-ms'].map(id=>({id,label,nullable:true,kind:'number',unit:id==='speed-mps'?'m/s':'ms'})) : []),
    ...(lab ? [{id:'propagation-state',kind:'state',label,states:Object.fromEntries(SENSES_STATES['propagation-state']!.map(s=>[s,label]))}] : []),
  ],bind:[],overlays:[legacy.overlays[1],...(lab ? [{kind:'sound-echo-pulse',model:'echo',group:'echo-study',origin:[0,0,0],axis:[1,0,0],visualDistancesScene:{near:1,mid:1.4,far:2.2},slowFactor:10,reference:'distance-m',sources:['S1']}] : [])],
  senses:{profile:'sound-only',sound:legacy.senses.sound,...(lab ? {soundLab:{medium:'medium',distanceM:'distance-m',speedMps:{air:340,water:1500,'solid-example':5000},sources:['S1']}} : {})}};
}
const sim=simSchema.parse(rawSound()), data=sim.senses!;
const defaults=Object.fromEntries(sim.controls.map(c=>[c.id,c.default]));
const ctx={parts:new Set<string>(),flows:new Map(),animations:new Map(),poses:new Set<string>(),countable:new Set<string>(),groups:new Set(['wave-study','echo-study'])};
const invalid=(mutate:(raw:any)=>void)=>{const raw=rawSound();mutate(raw);const parsed=simSchema.safeParse(raw);return parsed.success?simIssues(parsed.data,ctx):parsed.error.issues;};
const cardIssues=(card:any,set={})=>chapterSimIssues('',{try:simTrySchema.parse(card),set},sim);

describe('sound-only and travel-event solver',()=>{
  it('requires no dummy eye config, exposes only sound quantities and validates sources',()=>{
    expect(simIssues(sim,ctx)).toEqual([]);
    expect(quantityKind(sim,'image-distance')).toBeNull();
    for(const o of sim.outputs) expect(quantityKind(sim,o.from??o.id)).toBe(o.kind);
    expect(()=>effectiveEyeRays(data,defaults)).toThrow('no eye');
    expect(sensesSourceIssues(data,new Set())).toHaveLength(2);
    expect(simSchema.parse(rawSound(false)).senses?.eye).toBeUndefined();
  });
  it('solves the eight drive comparisons and reuses the longitudinal oracle',()=>{
    let count=0;
    for(const frequency of [250,500]) for(const amplitude of [1,2]) for(const active of [true,false]) {
      const q=solveSenses(data,{...defaults,'frequency-hz':frequency,amplitude,'sound-active':active});
      expect(q['visual-hz']).toBe(active?frequency/250:0);
      expect(q['wavelength-scene']).toBe(250/frequency);
      expect(q['displacement-max']).toBe(active?.035*amplitude:0);
      expect(q['source-drive']).toBe(!active?'off':amplitude===1?'amplitude-one':'amplitude-two');
      expect(q).not.toHaveProperty('image-distance');count++;
    }
    expect(count).toBe(8);
    expect(longitudinalPositions(41,.05,.035,1,0)[5]).toBeCloseTo(.285,12);
    expect(longitudinalPositions(41,.05,.07,.5,0)[5]).toBeCloseTo(.25,12);
    expect(longitudinalPositions(41,.05,.07,.5,.25)[0]).toBeCloseTo(-.07,12);
    expect(2*Math.PI*.07/.5).toBeCloseTo(.879645943,9);
  });
  it('solves all 24 medium × distance × drive combinations without zero-time missing paths',()=>{
    let count=0;
    for(const medium of ['air','water','solid-example','vacuum']) for(const distance of [17,34,68]) for(const active of [true,false]) {
      const q=solveSoundLab(data.soundLab!,{...defaults,medium,'distance-m':distance,'sound-active':active});
      const speed=medium==='vacuum'?null:({air:340,water:1500,'solid-example':5000} as Record<string,number>)[medium]!;
      expect(q['speed-mps']).toBe(speed);
      expect(q['propagation-state']).toBe(medium==='vacuum'?'no-medium':active?'transmitted':'source-off');
      if(speed!==null&&active) {expect(q['one-way-ms']).toBe(1000*distance/speed);expect(q['echo-ms']).toBe(2000*distance/speed);}
      else {expect(q['one-way-ms']).toBeNull();expect(q['echo-ms']).toBeNull();}
      expect(solveSoundLab(data.soundLab!,{...defaults,medium,'distance-m':distance,'sound-active':active,'frequency-hz':500,amplitude:2})).toEqual(q);count++;
    }
    expect(count).toBe(24);
    const q=evaluateSim(sim,{...defaults,medium:'vacuum'});
    expect(q['speed-mps']).toBeNull();expect(q['source-drive']).toBe('amplitude-one');
    const water=solveSoundLab(data.soundLab!,{...defaults,medium:'water'});
    expect(water['one-way-ms']).toBeCloseTo(22.666666667,8);expect(water['echo-ms']).toBeCloseTo(45.333333333,8);
    expect(solveSoundLab(data.soundLab!,{...defaults,medium:'solid-example'})['one-way-ms']).toBe(6.8);
  });
});
describe('sound author rejection and experiment isolation',()=>{
  it.each([
    (x:any)=>x.senses.eye=SENSES_BENCH_SIM.senses.eye,
    (x:any)=>x.controls.push(SENSES_BENCH_SIM.controls[0]),
    (x:any)=>x.outputs.push(SENSES_BENCH_SIM.outputs[0]),
    (x:any)=>x.overlays.push(SENSES_BENCH_SIM.overlays[0]),
    (x:any)=>x.controls[1].values=[0,500],(x:any)=>x.controls[1].values=[250,1000],
    (x:any)=>x.controls[2].values=[1,3],(x:any)=>x.senses.sound.slowFactor=1,
    (x:any)=>x.overlays[0].count=40,(x:any)=>x.overlays[0].spacing=.1,(x:any)=>x.overlays[0].axis=[2,0,0],
    (x:any)=>x.senses.soundLab.speedMps.air=343,(x:any)=>x.senses.soundLab.speedMps.vacuum=0,
    (x:any)=>x.senses.soundLab.speedMps.extra=1,(x:any)=>x.senses.soundLab.medium='missing',
    (x:any)=>x.controls[3].options.pop(),(x:any)=>x.controls[4].default=17,
    (x:any)=>delete x.outputs.find((o:any)=>o.id==='echo-ms').nullable,
    (x:any)=>x.outputs[0].nullable=true,
    (x:any)=>x.bind=[{output:'echo-ms',animation:'marker',hz:{per:1}}],
    (x:any)=>x.bind=[{output:'echo-ms',part:'marker',pose:{'200':'posed'}}],
    (x:any)=>x.bind=[{output:'visual-hz',animation:'marker',enabled:{eq:'amplitude-one'}}],
    (x:any)=>x.bind=[{output:'source-drive',animation:'marker',enabled:{eq:1}}],
    (x:any)=>x.overlays[1].axis=[2,0,0],(x:any)=>x.overlays[1].origin=[Infinity,0,0],
    (x:any)=>x.overlays[1].slowFactor=250,(x:any)=>x.overlays[1].visualDistancesScene.mid=2,
    (x:any)=>x.overlays[1].extra=true,
  ])('rejects invalid sound contract %#',mutate=>expect(invalid(mutate).length).toBeGreaterThan(0));
  it('requires propagation-state and medium context with nullable readings',()=>{
    expect(cardIssues({vary:'medium',observe:['speed-mps','one-way-ms','propagation-state']})).toEqual([]);
    expect(cardIssues({vary:'medium',observe:['speed-mps']})).not.toEqual([]);
    expect(cardIssues({vary:'distance-m',observe:['speed-mps','propagation-state']})).not.toEqual([]);
    expect(cardIssues({vary:'distance-m',keep:['medium'],observe:['speed-mps','propagation-state']})).toEqual([]);
    expect(cardIssues({vary:'distance-m',observe:['echo-ms','propagation-state']})).toEqual([]);
    expect(cardIssues({vary:'medium',observe:['echo-ms','propagation-state']})).not.toEqual([]);
    expect(cardIssues({vary:'distance-m',observe:['echo-ms','propagation-state']},{medium:'water'})).not.toEqual([]);
    expect(cardIssues({vary:'frequency-hz',observe:['one-way-ms','propagation-state']})).not.toEqual([]);
    expect(cardIssues({vary:'medium',observe:['visual-hz']})).not.toEqual([]);
    expect(cardIssues({vary:'frequency-hz',observe:['visual-hz','echo-ms','propagation-state']})).not.toEqual([]);
  });
  it('throws for invalid runtime values',()=>{
    expect(()=>solveSenses(data,{...defaults,'frequency-hz':1000})).toThrow();
    expect(()=>solveSoundLab(data.soundLab!,{...defaults,medium:'missing'})).toThrow();
    expect(()=>solveSoundLab(data.soundLab!,{...defaults,'distance-m':1})).toThrow();
  });
});
describe('nullable readings and records',()=>{
  const out=sim.outputs.find(o=>o.id==='echo-ms')!;
  it('retains null in records and formats it without a false numeric zero',()=>{
    const rows=recordRow([],{vary:34,values:{'echo-ms':null,'propagation-state':'source-off'},controls:{...defaults}});
    expect(JSON.parse(JSON.stringify(rows))[0].values['echo-ms']).toBeNull();
    expect(numberOf(null)).toBeNaN();expect(outputText(out,null,'en')).toBe('No transmission');expect(outputText(out,null,'zh')).toBe('无传播');
  });
  it('splits line paths at missing readings and omits null bars',()=>{
    const rows=[{vary:17,values:{'echo-ms':100}},{vary:34,values:{'echo-ms':null}},{vary:68,values:{'echo-ms':400}}];
    const model=chartModel(rows,sim.controls.find(c=>c.id==='distance-m')!,[out],34)!;
    expect(model.series[0]!.points.map(p=>p.y)).toEqual([100,400]);expect(model.series[0]!.segments.map(s=>s.length)).toEqual([1,1]);
    expect(chartSummary(model,{locale:'en',x:'Distance',xText:String,y:()=> 'Return',yText:(_,v)=>String(v)})).toContain('gaps');
    const bars=chartModel([{vary:'air',values:{'echo-ms':200}},{vary:'vacuum',values:{'echo-ms':null}}],sim.controls.find(c=>c.id==='medium')!,[out],'vacuum')!;
    expect(bars.series[0]!.points).toHaveLength(1);
  });
});
