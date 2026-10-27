import { describe, expect, it } from 'vitest';
import { simSchema, simIssues, quantityKind, simTimelineChannels, chapterSimIssues, simTrySchema } from '../../src/engines/space-scene/sim-schema';
import { effectiveEyeRays, longitudinalPositions, solveSenses, sensesExperiment } from '../../src/engines/space-scene/lib/sim/senses';
import { evaluateSim, SEPARATE_EXPERIMENTS } from '../../src/engines/space-scene/lib/sim';
import { sensesSourceIssues } from '../../src/engines/space-scene/senses-schema';
import { cardStates } from '../../src/engines/space-scene/lib/sim/replay';
import { spaceSceneData } from '../../src/engines/space-scene/schema';
import sampleParts from '../../src/content/topics/sample-senses/data/parts.json';
import sampleSources from '../../src/content/topics/sample-senses/data/sources.json';
import { SENSES_BENCH_SIM } from './fixtures/senses-bench';
import oracles from './fixtures/senses-oracles.json';
const sim = simSchema.parse(SENSES_BENCH_SIM), senses = sim.senses!;
const values = Object.fromEntries(sim.controls.map((c) => [c.id, c.default]));
const ctx = {parts:new Set<string>(), flows:new Map(), animations:new Map(), poses:new Set<string>(), countable:new Set<string>(), groups:new Set(['bench','eye-study','wave-study'])};
const solve = (set = {}) => solveSenses(senses,{...values,...set});
const close = (actual: unknown, expected: number) => expect(Math.abs(Number(actual)-expected)).toBeLessThan(1e-9);
describe('senses oracle contract',()=>{
 it('parses the complete draft fixture with group-gated overlays',()=>{expect(spaceSceneData.safeParse({parts:sampleParts,sources:sampleSources}).success).toBe(true);});
 it('registers only the whitelist and separate experiment semantics',()=>{
   expect(simIssues(sim,ctx)).toEqual([]); expect(SEPARATE_EXPERIMENTS.senses).toBe(true);
   for(const output of sim.outputs) expect(quantityKind(sim,output.from??output.id)).toBe(output.kind);
   expect(quantityKind(sim,'real-brightness')).toBeNull(); expect(simTimelineChannels(sim,'visual-hz')).toBeNull();
   expect(sensesExperiment('relative-light')).toBe('eye-light'); expect(sensesExperiment('eye-state')).toBe('eye-focus');
   expect(cardStates(sim,values,{vary:'frequency-hz',observe:['visual-hz']},{'light-in':true})).toEqual([]);
 });
 it.each(oracles.lens)('reproduces independent lens oracle $uCm / $fCm',(o)=>{
   const set={'object-range':o.uCm===12?'near':'far','lens-focus':o.fCm===3?'near':'far','pupil-mm':o.pupilMm};
   const q=solve(set); close(q['image-distance'],o.expected.vCm); close(q.magnification,o.expected.magnificationAtFocus); close(q['retinal-top-y'],o.expected.retinalTopYCm); close(q['blur-diameter'],o.expected.blurDiameterCm); expect(q['focus-state']).toBe(o.expected.focusState);
   close(solve({...set,'pupil-mm':4})['blur-diameter'],o.expected.blurDiameterCm*2);
   const eye=effectiveEyeRays(senses,{...values,...set});
   for(const p of eye.points) for(const ray of p.rays){close(ray.retina[0],4);close(ray.retina[1],ray.lens[1]+4*((ray.lens[1]-p.h)/eye.u-ray.lens[1]/eye.f));}
 });
 it.each(oracles.aperture)('reproduces aperture $diameterMm',(o)=>{const q=solve({'pupil-mm':o.diameterMm});close(q['aperture-area'],o.areaMm2);close(q['relative-light'],o.relativeLight);close(q['image-distance'],4);close(q['retinal-top-y'],-.1);});
 it.each(oracles.sound)('reproduces sound $frequencyHz / $amplitude',(o)=>{const q=solve({'frequency-hz':o.frequencyHz,amplitude:o.amplitude});close(q['visual-hz'],o.visualHz);close(q['wavelength-scene'],o.wavelengthScene);close(q['displacement-max'],o.displacementMax);close(q['amplitude-level'],o.amplitudeLevel);});
 it.each(oracles.waveSamples)('reproduces reference particle at $secondsVisual s',(o)=>{const q=solve({'frequency-hz':o.frequencyHz,amplitude:o.amplitude});close(longitudinalPositions(41,.05,Number(q['displacement-max']),Number(q['wavelength-scene']),o.secondsVisual*Number(q['visual-hz']))[5],o.expectedX);});
 it('returns at one cycle and keeps particles ordered at all phases',()=>{close(longitudinalPositions(41,.05,.0125,1,1)[5],.2625);for(let phase=0;phase<1;phase+=.01){const p=longitudinalPositions(41,.05,.025,.5,phase);expect(p.every((x,i)=>i===0||x>p[i-1]!)).toBe(true);}});
 it('keeps dark geometry defined and inactive sound at rest',()=>{const q=solve({'light-in':false,'sound-active':false});expect([q['relative-light'],q['eye-state'],q['sound-state'],q['visual-hz'],q['displacement-max'],q['amplitude-level']]).toEqual([0,'dark','still',0,0,0]);close(q['image-distance'],4);expect(longitudinalPositions(41,.05,0,1,.2)[5]).toBe(.25);});
 it('evaluates every one of the 128 independent control combinations as finite',()=>{let n=0;function vary(i:number,v:typeof values){if(i===sim.controls.length){for(const x of Object.values(evaluateSim(sim,v))) expect(typeof x==='number'?Number.isFinite(x):typeof x==='string').toBe(true);n++;return;}const c=sim.controls[i]!;const domain=c.kind==='toggle'?[false,true]:c.kind==='step'?c.values:c.options.map(o=>o.id);for(const x of domain)vary(i+1,{...v,[c.id]:x});}vary(0,values);expect(n).toBe(128);});
});
describe('senses rejects invalid authored domains',()=>{
 const issues=(mutate:(x:any)=>void)=>{const raw=structuredClone(SENSES_BENCH_SIM);mutate(raw);const parsed=simSchema.safeParse(raw);return parsed.success?simIssues(parsed.data,ctx):parsed.error.issues;};
 it.each([(x:any)=>x.senses.eye.objectsCm.near=3,(x:any)=>x.controls[1].values=[-2,4],(x:any)=>x.controls.shift(),(x:any)=>x.senses.sound.slowFactor=Infinity,(x:any)=>x.senses.eye.sources=[],(x:any)=>x.senses.eye.referencePupilMm=1e-300,(x:any)=>x.senses.sound.slowFactor=500,(x:any)=>x.senses.sound.baseDisplacementScene=1,(x:any)=>x.overlays[1].axis=[0,0,0],(x:any)=>x.overlays[0].when={output:'focus-state',is:'missing'},(x:any)=>x.overlays[0].when={control:'light-in',output:'eye-state',is:true},(x:any)=>x.kind='seeds'])('rejects illegal configuration %#',(mutate)=>expect(issues(mutate).length).toBeGreaterThan(0));
 it('rejects a prediction in an unobserved workstation',()=>{const card=simTrySchema.parse({vary:'pupil-mm',observe:['relative-light'],predict:{prompt:{en:'Compare',zh:'比较'},change:{'frequency-hz':500},observe:'visual-hz',options:[{id:'same',label:{en:'Same',zh:'相同'},means:'same'},{id:'more',label:{en:'More',zh:'更多'},means:'more'}]}});expect(chapterSimIssues('',{try:card},sim).length).toBeGreaterThan(0);});
 it('rejects unknown source references',()=>expect(sensesSourceIssues(senses,new Set())).toHaveLength(2));
 it('throws for missing runtime values instead of fabricating zero or a first state',()=>{expect(()=>solveSenses(senses,{})).toThrow();expect(()=>solve({'object-range':'missing'})).toThrow();});
});
