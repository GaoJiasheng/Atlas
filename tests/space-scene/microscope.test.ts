import { microscopeIndexBeat } from '../../src/engines/space-scene/lib/microscope-index';
import type { SpaceChapterState } from '../../src/engines/space-scene/schema';
import { describe, expect, it } from 'vitest';
import { simSchema, simIssues, quantityKind, simTimelineChannels, chapterSimIssues } from '../../src/engines/space-scene/sim-schema';
import { microscopeSchema, microscopeSourceIssues } from '../../src/engines/space-scene/microscope-schema';
import { featureFocus, featureInDisk, microscopeFeatures, microscopeFieldReading, MicroscopeInputError, solveMicroscope } from '../../src/engines/space-scene/lib/sim/microscope';
import { makeMicroscopeSim, MICROSCOPE_DEFAULTS } from '../../src/engines/space-scene/lib/sim/microscope-fixture';
import { decodeSimParam, encodeSimParam, resolveSimValues, setSimControl } from '../../src/engines/space-scene/lib/sim/controls';
import { evaluateSim, SEPARATE_EXPERIMENTS } from '../../src/engines/space-scene/lib/sim';
import { spaceSceneData } from '../../src/engines/space-scene/schema';
import sampleParts from '../../src/content/topics/sample-microscope/data/parts.json';
import sampleSources from '../../src/content/topics/sample-microscope/data/sources.json';
import oracles from './fixtures/microscope-oracles.json';
const sim=simSchema.parse(makeMicroscopeSim()),m=sim.microscope!,defaults=MICROSCOPE_DEFAULTS;
const ctx={parts:new Set<string>(),flows:new Map(),animations:new Map(),poses:new Set<string>(),countable:new Set<string>(),groups:new Set(['microscope-bench'])};
const solve=(set={})=>solveMicroscope(m,{...defaults,...set});
const close=(a:unknown,b:number)=>expect(Math.abs(Number(a)-b)).toBeLessThan(1e-9);
describe('microscope arithmetic contract T1–T12',()=>{
 it.each(oracles.cases)('$id',(c)=>{
  const i=c.input,q=solve({specimen:i.specimen,objective:i.objective,'slide-x':i.slideX,'slide-y':i.slideY,'focus-z':i.focusZ,illumination:i.illumination,'field-on':i.enabled});
  const map={'total-power':'totalPower','field-diameter-um':'fieldDiameterUm','target-u':'u','target-v':'v',clarity:'clarity','blur-px':'blurPx','target-location':'targetLocation','focus-status':'focusStatus','view-status':'viewStatus'} as const;
  for(const [id,key]of Object.entries(map)){const expected=c.expected[key as keyof typeof c.expected];typeof expected==='number'?close(q[id],expected):expect(q[id]).toBe(expected);}
 });
 it('T8 focuses near and far chloroplasts independently',()=>{expect(featureFocus(3,3,2)).toEqual({clarity:1,blurPx:0});expect(featureFocus(-3,3,2)).toEqual({clarity:0,blurPx:8});const f=microscopeFeatures(m,{...defaults,specimen:'pondweed-leaf',objective:40,'focus-z':3});expect(f.find(x=>x.instanceId==='0:0:pondweed-near-chloroplast')?.clarity).toBe(1);expect(f.find(x=>x.instanceId==='0:0:leaf-chloroplast-2')?.clarity).toBe(0);});
 it('T10 maps positive slide-y to screen pixels below centre',()=>{const q=solve({specimen:'prepared-cheek',objective:40,'slide-y':100});expect(256-Number(q['target-v'])*256).toBeGreaterThan(256);});
 it('T11 enlarges a fixed100µm target tenfold while field diameter shrinks',()=>{close(100/Number(solve({'objective':4})['field-diameter-um']),oracles.additionalCases.T11.fractionAt4);close(100/Number(solve({'objective':40})['field-diameter-um']),oracles.additionalCases.T11.fractionAt40);});
 it('includes the exact field boundary and distinguishes focus thresholds',()=>{const custom=structuredClone(m);custom.specimens[0]!.target.atUm=[225,0,0];expect(solveMicroscope(custom,{...defaults,objective:40})['target-location']).toBe('inside');expect(solve({objective:4,'focus-z':5})['focus-status']).toBe('sharp');expect(solve({objective:4,'focus-z':6})['focus-status']).toBe('soft');});
 it('T12 retains quantities while inactive and hidden',()=>{const r=microscopeFieldReading(m,defaults);expect(r.viewStatus).toBe('inactive');expect(r.visibleFeatureIds).toEqual([]);expect(r.bufferSize).toEqual([512,512]);expect(r.totalPower).toBe(40);});
});
describe('finite feature field and registration',()=>{
 it('parses sample parts and all registered quantities',()=>{expect(spaceSceneData.safeParse({parts:sampleParts,sources:sampleSources}).success).toBe(true);expect(simIssues(sim,ctx)).toEqual([]);expect(SEPARATE_EXPERIMENTS.microscope).toBe(true);for(const o of sim.outputs)expect(quantityKind(sim,o.id)).toBe(o.kind);expect(quantityKind(sim,'resolution-nm')).toBeNull();expect(simTimelineChannels(sim,'total-power')).toBeNull();expect(evaluateSim(sim,defaults)['total-power']).toBe(40);});
 it.each([['onion-bulb',75],['pondweed-leaf',968],['prepared-cheek',243]] as const)('limits %s to its complete finite patch of %i features',(specimen,count)=>{const f=microscopeFeatures(m,{...defaults,specimen});expect(f.length).toBe(count);expect(new Set(f.map(x=>x.instanceId)).size).toBe(count);expect(f.every(x=>[...x.positionUm,x.u,x.v,x.clarity,x.blurPx].every(Number.isFinite))).toBe(true);});
 it('does not invent chloroplasts in onion or walls in cheek',()=>{expect(microscopeFeatures(m,defaults).some(f=>f.role==='chloroplast')).toBe(false);expect(microscopeFeatures(m,{...defaults,specimen:'prepared-cheek'}).some(f=>f.role==='wall'||f.role==='chloroplast')).toBe(false);});
 it('clips polygons and ellipses against the disk rather than only bounding circles',()=>{const polygon=m.patterns[0]!.features[0]!,ellipse=m.patterns[0]!.features[2]!;expect(featureInDisk(polygon,0,0,1)).toBe(true);expect(featureInDisk(polygon,200,200,10)).toBe(false);expect(featureInDisk(ellipse,11,0,2)).toBe(true);expect(featureInDisk(ellipse,12,0,2)).toBe(false);});
 it('candidate count shrinks at high power and blank slide stays blank beyond patch',()=>{expect(microscopeFeatures(m,{...defaults,objective:40}).length).toBeLessThan(75);expect(microscopeFeatures(m,{...defaults,objective:40,'slide-x':1000,'slide-y':1000})).toEqual([]);});
 it('T14 ignores invalid URL values and preserves valid locale/theme roundtrip control values',()=>{const set={'objective':20,'focus-z':NaN};expect(resolveSimValues(sim,set)).toEqual(defaults);expect(setSimControl(sim,defaults,'objective',20)).toEqual(defaults);const v={...defaults,objective:40,'slide-x':-200,'focus-z':1,'field-on':true};const round=resolveSimValues(sim,decodeSimParam(encodeSimParam(v)));expect(round).toEqual(v);expect(solveMicroscope(m,round)).toEqual(solveMicroscope(m,v));});
 it('validates chapter card control and output references',()=>{expect(chapterSimIssues('',{try:{vary:'objective',observe:['total-power','field-diameter-um']}},sim)).toEqual([]);});
});
describe('T13 illegal microscope authored and runtime domains',()=>{
 const issues=(fn:(s:any)=>void)=>{const raw=structuredClone(makeMicroscopeSim());fn(raw);const p=simSchema.safeParse(raw);return p.success?simIssues(p.data,ctx):p.error.issues;};
 it.each([(s:any)=>s.microscope.ocularPower=0,(s:any)=>s.microscope.fieldNumberMm=Infinity,(s:any)=>s.microscope.objectives[0].focusWidthUm=0,(s:any)=>s.microscope.specimens[0].target.atUm[2]=NaN,(s:any)=>s.microscope.specimens[1].id='onion-bulb',(s:any)=>s.microscope.specimens[1].target.id='onion-nucleus',(s:any)=>delete s.microscope.specimens[0].label.zh,(s:any)=>s.microscope.specimens[0].target.atUm[0]=201,(s:any)=>s.microscope.specimens[0].target.id='missing',(s:any)=>s.microscope.controls.focusZ='slide-x',(s:any)=>s.controls[1].values=[4,20,40],(s:any)=>s.controls[4].values=[-100,0,100],(s:any)=>s.microscope.extra='external-url',(s:any)=>s.overlays.push(s.overlays[0]),(s:any)=>s.overlays[0].maxBufferPx=1024,(s:any)=>s.overlays[0].when.control='objective',(s:any)=>s.overlays[0].diameterPx=179,(s:any)=>s.microscope.patterns[0].tileRange={x:[-20,20],y:[-20,20]},(s:any)=>s.microscope.patterns[0].features[0].pointsUm=[[0,0],[10,10],[0,10],[10,0]],(s:any)=>s.microscope.patterns[0].features[0].parentCell='missing'])('rejects invalid schema %#',(fn)=>expect(issues(fn).length).toBeGreaterThan(0));
 it('reports source ids and missing design source explicitly',()=>{expect(microscopeSourceIssues(m,new Map())).toHaveLength(2);expect(microscopeSourceIssues(m,new Map([['S20',{design:false}]]))).toHaveLength(1);expect(microscopeSourceIssues(m,new Map([['S20',{design:true}]]))).toEqual([]);});
 it.each([{objective:0},{objective:20},{objective:'40'},{'focus-z':NaN},{'focus-z':Infinity},{illumination:1.1},{specimen:'missing'},{'field-on':'true'}])('throws typed runtime error for %j',(set)=>{expect(()=>solve(set)).toThrow(MicroscopeInputError);});
 it('rejects unknown pattern fields, negative axes and excess full patch budget',()=>{const raw=structuredClone(m);(raw.patterns[0] as any).url='remote';expect(microscopeSchema.safeParse(raw).success).toBe(false);raw.patterns[0]!.tileRange.x=[-20,20];raw.patterns[0]!.tileRange.y=[-20,20];delete(raw.patterns[0] as any).url;expect(microscopeSchema.safeParse(raw).success).toBe(false);});
});

describe('microscope chapter index explanation restore',()=>{
 it('skips hidden or disabled-layer labels and chooses a visible authored beat',()=>{
  const state={layers:['microscope-bench'],hide:['slide-glass'],beats:[{labels:['slide-glass']},{labels:['slide-glass'],hide:[],layers:[]},{part:'slide-glass',hide:[],layers:['microscope-bench']}]} as SpaceChapterState;
  const file=spaceSceneData.parse({parts:sampleParts,sources:sampleSources}).parts;
  expect(microscopeIndexBeat(state,file,'slide-glass')).toBe(2);
  expect(microscopeIndexBeat(state,file,'missing')).toBeNull();
  expect(microscopeIndexBeat(undefined,file,'slide-glass')).toBeNull();
 });
});
