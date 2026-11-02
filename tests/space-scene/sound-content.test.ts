/** Published sound lesson: data, comparisons and visible structures agree with docs/64. */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse as yaml } from 'yaml';
import { spaceSceneData } from '../../src/engines/space-scene/schema';
import { chapterSimIssues } from '../../src/engines/space-scene/sim-schema';
import { evaluateSim } from '../../src/engines/space-scene/lib/sim';
import { resolveSimValues } from '../../src/engines/space-scene/lib/sim/controls';
import { simEffects } from '../../src/engines/space-scene/lib/sim/bind';
import { longitudinalPositions } from '../../src/engines/space-scene/lib/sim/senses';
import { echoDuration, echoPosition, echoVisualDistance } from '../../src/engines/space-scene/lib/sim/sound-motion';
import { partBounds } from '../../src/engines/space-scene/lib/parts';

const DIR=join(import.meta.dirname,'../../src/content/topics/sound');
const json=(name:string)=>JSON.parse(readFileSync(join(DIR,'data',name),'utf8'));
const sources=json('sources.json');
const file=spaceSceneData.parse({parts:json('parts.json'),sources}).parts;
const sim=file.sim!;
const terms=json('glossary.json').terms as {id:string}[];
const chapters=readdirSync(join(DIR,'chapters')).filter(f=>f.endsWith('.mdx')).sort().map(f=>{
  const text=readFileSync(join(DIR,'chapters',f),'utf8');
  const [,front,...body]=text.split(/^---$/m);
  return {...yaml(front!),body:body.join('---')};
});
const IDS=['00-before-you-start','01-vibrating-sources','02-a-medium-to-travel','03-pitch-and-frequency','04-loudness-and-amplitude','05-returning-sound','06-musical-instruments','07-noise-and-hearing-care'];
const CH=(n:number)=>chapters[n]!;
const values=(ch:number,beat:number)=>resolveSimValues(sim,{...CH(ch).state.sim.set,...CH(ch).state.beats[beat-1].sim.set});
const at=(ch:number,beat:number)=>evaluateSim(sim,values(ch,beat));
const part=(id:string)=>file.parts.find(p=>p.id===id)!;
const effects=(patch={})=>{const v=resolveSimValues(sim,patch);return simEffects(sim,v,evaluateSim(sim,v));};
const sourceIds=new Set((sources.sources as {id:string}[]).map(s=>s.id));

describe('sound: complete bilingual published lesson',()=>{
  it('publishes eight chapters, thirty-two beats, five workstations and twenty-four selectable parts',()=>{
    expect(yaml(readFileSync(join(DIR,'topic.yaml'),'utf8'))).toMatchObject({id:'sound',status:'published',subject:'science',engine:'space-scene'});
    expect(chapters.map(c=>c.id)).toEqual(IDS);
    expect(chapters.map(c=>c.state.beats.length)).toEqual(Array(8).fill(4));
    expect(file.parts.filter(p=>!p.context)).toHaveLength(24);
    expect(file.groups.map(g=>g.id)).toEqual(['sources','transmission','reflection','instruments','care','air-wave']);
    expect(new Set(file.parts.filter(p=>!p.context).map(p=>p.group)).size).toBe(5);
    expect(file.groups.find(g=>g.id==='air-wave')?.card).toBe(false);
    expect(file.flows).toEqual([]);
    expect(sim.kind).toBe('senses');expect(sim.senses?.profile).toBe('sound-only');expect(sim.senses?.eye).toBeUndefined();
    expect(sim.overlays.map(o=>o.kind).sort()).toEqual(['longitudinal-wave','sound-echo-pulse']);
  });
  it('starts each beat from five explicit controls and a complete assembled chapter baseline',()=>{
    const controls=sim.controls.map(c=>c.id).sort();
    for(const c of chapters){
      expect(c.state).toMatchObject({view:'assembled',explode:0,cutaway:'none',run:false});
      expect(Object.keys(c.state.sim.set).sort(),c.id).toEqual(controls);
      expect(chapterSimIssues(c.id,c.state.sim,sim)).toEqual([]);
      for(const b of c.state.beats){
        expect(Object.keys(b.sim.set).sort(),`${c.id}/${b.id}`).toEqual(controls);
        expect(chapterSimIssues(c.id,b.sim,sim)).toEqual([]);
        expect(b.labels.length).toBeLessThanOrEqual(4);
        for(const id of b.labels) expect(c.state.index.parts,id).toContain(id);
        expect(b.caption.en.trim()).not.toBe('');expect(b.caption.zh.trim()).not.toBe('');
        expect(b.caption.en.split(/\s+/).length).toBeLessThanOrEqual(45);
      }
    }
  });
  it('offers exactly four independent fair comparisons and no care risk score',()=>{
    const cards=chapters.filter(c=>c.state.sim.try);
    expect(cards.map(c=>c.id)).toEqual(IDS.slice(2,6));
    expect(cards.map(c=>c.state.sim.try.vary)).toEqual(['medium','frequency-hz','amplitude','distance-m']);
    expect(cards.map(c=>[...c.state.sim.try.observe].sort())).toEqual([
      ['propagation-state','speed-mps','one-way-ms'].sort(),['visual-hz','wavelength-scene','sound-state'].sort(),
      ['displacement-max','amplitude-level','sound-state'].sort(),['echo-ms','propagation-state'].sort(),
    ]);
    for(const c of cards) expect(c.state.sim.try.record).toBeTruthy();
    expect(CH(7).state.sim.try).toBeUndefined();
    expect(sim.outputs.some(o=>/dose|decibel|db|safety|risk-score/.test(o.id))).toBe(false);
  });
  it('uses sixteen terms once in each language and links reception to the existing hearing topic',()=>{
    expect(terms.map(t=>t.id).sort()).toEqual(['vibration','source','medium','vacuum','sound-wave','longitudinal','frequency','hertz','pitch','amplitude','loudness','wavelength','echo','resonance','noise','hearing-care'].sort());
    for(const {id} of terms) for(const locale of ['en','zh']){
      const text=chapters.map(c=>c.body.match(new RegExp(`<Lang ${locale}>([\\s\\S]*?)</Lang>`))?.[1]??'').join('\n');
      expect(text.match(new RegExp(`<Term id="${id}">`,'g'))?.length??0,`${id}/${locale}`).toBe(1);
    }
    for(const ch of [0,7]) expect(CH(ch).body).toContain('slug="eyes-and-ears"');
    expect(file.parts.some(p=>/cochlea|ossicle|malleus|stapes|ear-drum|retina/.test(p.id))).toBe(false);
  });
  it('keeps source references real and describes a silent classroom model in both languages',()=>{
    for(const section of [sim.senses!.sound,sim.senses!.soundLab!]) for(const id of section.sources) expect(sourceIds.has(id),id).toBe(true);
    const detailText=file.parts.map(p=>`${p.summary.en} ${p.summary.zh} ${p.detail.en} ${p.detail.zh}`).join(' ');
    for(const match of detailText.matchAll(/\bS\d+\b/g)) expect(sourceIds.has(match[0]),match[0]).toBe(true);
    for(const c of chapters){
      expect(c.body).toContain('<Lang en>');expect(c.body).toContain('<Lang zh>');
      for(const match of c.body.matchAll(/\bs="(S\d+(?:[ ,]+S\d+)*)"/g)) for(const id of match[1]!.split(/[ ,]+/)) expect(sourceIds.has(id),id).toBe(true);
    }
    const all=chapters.map(c=>c.body).join('\n');
    expect(all).not.toMatch(/getUserMedia|AudioContext|<audio|TODO|placeholder|PSLE必考|PSLE core/i);
    expect(all).toMatch(/silent/i);expect(all).toContain('静音');
    expect(CH(7).body).toMatch(/trusted adult|professional/i);expect(CH(7).body).toMatch(/成人|专业/);
  });
});

describe('sound: captions and authored snapshots reproduce the solver',()=>{
  it('keeps the source active in vacuum while every travel-event quantity is null',()=>{
    expect(values(2,4)['sound-active']).toBe(true);expect(values(2,4).medium).toBe('vacuum');
    expect(at(2,4)).toMatchObject({'speed-mps':null,'one-way-ms':null,'echo-ms':null,'propagation-state':'no-medium','source-drive':'amplitude-one'});
    for(const beat of [2,3]) expect(at(2,beat)['propagation-state']).toBe('transmitted');
    expect(CH(2).state.beats[3].caption.en).toMatch(/vacuum/);expect(CH(2).state.beats[3].caption.zh).toContain('真空');
  });
  it('frequency alone changes display rate and wavelength, preserving amplitude and teaching air speed',()=>{
    const low=at(3,1),high=at(3,2);
    expect([low['visual-hz'],high['visual-hz']]).toEqual([1,2]);
    expect([low['wavelength-scene'],high['wavelength-scene']]).toEqual([1,.5]);
    expect(high['displacement-max']).toBe(low['displacement-max']);expect(high['speed-mps']).toBe(low['speed-mps']);
    expect(values(3,1).amplitude).toBe(1);expect(values(3,2).amplitude).toBe(1);
    expect(CH(3).state.beats[3].caption.en).toMatch(/not.*faster|does not.*faster/i);
  });
  it('amplitude alone changes displacement, preserving frequency and pitch settings',()=>{
    expect([1,2,3,4].map(b=>at(4,b)['displacement-max'])).toEqual([.035,.07,.035,.07]);
    for(const b of [1,2,3,4]){expect(values(4,b)['frequency-hz']).toBe(250);expect(at(4,b)['visual-hz']).toBe(1);}
    expect(CH(4).state.beats[3].run).toBe(false);expect(at(4,4)['source-drive']).toBe('amplitude-two');
    expect(CH(4).state.beats[3].caption.en).toMatch(/does not measure decibels/);
  });
  it('snapshots pause local markers at a known phase and reset other beats',()=>{
    expect(CH(1).state.beats[3].sensesFrame).toEqual({waveCycles:.25});
    expect(CH(3).state.beats[2].sensesFrame).toEqual({waveCycles:.25});
    expect(longitudinalPositions(41,.05,.07,.5,.25)[0]).toBeCloseTo(-.07,12);
    for(const ch of [1,3]) for(const i of [0,1]) expect(CH(ch).state.beats[i].sensesFrame?.waveCycles??0).toBe(0);
    expect(CH(1).state.beats[3].run).toBe(false);
  });
  it('echo snapshots distinguish a completed two-second display from the physical 200ms return',()=>{
    expect(CH(5).state.beats.map((b:any)=>b.sensesFrame?.echoProgress??0)).toEqual([0,0,1,0]);
    expect(at(5,3)['echo-ms']).toBe(200);expect(at(5,4)['echo-ms']).toBe(400);
    for(const [distance,physical,visual] of [[17,100,1],[34,200,2],[68,400,4]]){
      const v=resolveSimValues(sim,{'distance-m':distance!,medium:'air','sound-active':true});
      expect(evaluateSim(sim,v)['echo-ms']).toBe(physical);
      expect(echoDuration(physical!)).toBe(visual);
      expect(echoPosition(visual!/2,visual!,echoVisualDistance(distance!)).pathPosition).toBe(echoVisualDistance(distance!));
      expect(echoPosition(visual!,visual!,echoVisualDistance(distance!))).toMatchObject({pathPosition:0,atReturn:true});
    }
    expect(CH(5).state.beats[2].caption.en).toMatch(/two tenths/);
    expect(CH(5).state.beats[2].caption.zh).toContain('零点二');
  });
  it('resets vacuum and all held variables when entering frequency and echo chapters',()=>{
    for(const ch of [3,4,5]) for(const beat of [1,2,3,4]){
      expect(values(ch,beat).medium).toBe('air');expect(values(ch,beat)['sound-active']).toBe(true);
      expect(at(ch,beat)['propagation-state']).toBe('transmitted');
    }
    expect(values(5,4)['distance-m']).toBe(68);expect(values(5,1)['distance-m']).toBe(34);
  });
});

describe('sound: schematic geometry and visibility support the comparisons',()=>{
  it('shows exactly one medium and keeps the source visible for an ideal vacuum',()=>{
    const media=['air-cell','water-cell','solid-bar'];
    for(const [medium,shown] of [['air','air-cell'],['water','water-cell'],['solid-example','solid-bar'],['vacuum',null]]){
      const fx=effects({medium:medium!});
      expect(media.filter(id=>!fx.hidden.has(id))).toEqual(shown?[shown]:[]);
      expect(fx.hidden.has('source-driver')).toBe(false);expect(fx.hidden.has('receiver')).toBe(false);
    }
    const wave=sim.overlays.find(o=>o.kind==='longitudinal-wave')!;
    expect(wave).toMatchObject({model:'sound',when:{control:'medium',is:'air'},count:41,spacing:.05});
    expect(wave.group).toBe('air-wave');
    for(const [i,c] of chapters.entries()) expect(c.state.layers.includes('air-wave'),c.id).toBe([0,2,3,4].includes(i));
  });
  it('uses one reflector per distance and a matching short-string preset per frequency',()=>{
    for(const [distance,wall] of [[17,'reflector-near'],[34,'reflector-mid'],[68,'reflector-far']] as const){
      const fx=effects({'distance-m':distance});
      expect(['reflector-near','reflector-mid','reflector-far'].filter(id=>!fx.hidden.has(id))).toEqual([wall]);
    }
    expect(['bridge-long','bridge-short'].filter(id=>!effects({'frequency-hz':250}).hidden.has(id))).toEqual(['bridge-long']);
    expect(['bridge-long','bridge-short'].filter(id=>!effects({'frequency-hz':500}).hidden.has(id))).toEqual(['bridge-short']);
  });
  it('does not move entire sound sources as a substitute for their vibrating markers',()=>{
    const targets=file.animations.map(a=>a.target);
    expect(targets.some(t=>t==='fork-marker')).toBe(true);expect(targets.some(t=>t==='drum-marker')).toBe(true);
    for(const id of ['fork','drum-shell','drumhead','monochord-string']) expect(targets,id).not.toContain(id);
    const fx=effects({'sound-active':false});
    for(const animation of file.animations) expect(fx.animations.get(animation.id)?.enabled??false).toBe(false);
    expect(sim.bind.some(b=>'animation' in b&&b.output==='source-drive')).toBe(true);
  });
  it('builds two fork arms with one joined root and one contacting handle',()=>{
    const fork=part('fork'),body=fork.primitive!;
    expect(body.kind).toBe('extrude');if(body.kind!=='extrude') throw new Error('fork must expose its U profile');
    const intersections=(y:number)=>body.shape.flatMap((a,i)=>{
      const b=body.shape[(i+1)%body.shape.length]!;
      return (a[1]<=y&&b[1]>y)||(b[1]<=y&&a[1]>y) ? [a[0]+(y-a[1])*(b[0]-a[0])/(b[1]-a[1])] : [];
    }).sort((a,b)=>a-b);
    expect(intersections(.4)).toEqual([-.2,-.12,.12,.2]);
    expect(intersections(-.28)).toHaveLength(2);
    expect(fork.extra).toHaveLength(1);const handle=fork.extra![0]!;
    expect(handle.kind).toBe('cylinder');if(handle.kind!=='cylinder') throw new Error('one fork handle');
    expect(handle.at[0]).toBe(body.at[0]);expect(handle.at[2]).toBe(body.at[2]);
    expect(handle.at[1]+handle.size[2]!/2).toBeGreaterThan(body.at[1]+Math.min(...body.shape.map(p=>p[1])));
  });
  it('keeps one membrane over an open hollow drum frame',()=>{
    const shell=part('drum-shell').primitive!,head=part('drumhead').primitive!;
    expect(shell.kind).toBe('lathe');expect(head.kind).toBe('cylinder');
    if(shell.kind!=='lathe'||head.kind!=='cylinder') throw new Error('drum topology must remain inspectable');
    expect(Math.min(...shell.profile.map(p=>p[0]))).toBeGreaterThan(0);
    expect(shell.arc).toBeLessThan(360);
    expect(new Set(shell.profile.map(p=>p[0])).size).toBe(2);
    expect(head.size[2]).toBeLessThan(.02);
    expect(Math.abs((head.at[1]-head.size[2]!/2)-(shell.at[1]+Math.max(...shell.profile.map(p=>p[1]))))).toBeLessThan(.005);
    expect(part('drumhead').extra!.every(p=>p.kind==='torus')).toBe(true);
    expect(part('drum-shell').connects).toContain('drumhead');
  });
  it('anchors one continuous string and halves only its supported vibrating length',()=>{
    const string=part('monochord-string').primitive!,box=part('monochord-box').primitive!;
    expect(string.kind).toBe('tube');expect(box.kind).toBe('panelHole');
    if(string.kind!=='tube') throw new Error('single continuous string');
    expect(string.path).toHaveLength(2);expect(part('monochord-string').extra??[]).toHaveLength(0);
    const ends=string.path.map(p=>p.map((v,i)=>v+string.at[i]!));
    const anchors=part('monochord-anchors');
    expect(ends[0]![0]).toBeCloseTo(anchors.primitive!.at[0],12);expect(ends[1]![0]).toBeCloseTo(anchors.extra![0]!.at[0],12);
    const fixed=part('monochord-fixed-bridge').primitive!,long=part('bridge-long').primitive!,short=part('bridge-short').primitive!;
    expect((short.at[0]-fixed.at[0])/(long.at[0]-fixed.at[0])).toBeCloseTo(.5,12);
    for(const support of [fixed,long,short]){
      expect(support.kind).toBe('extrude');if(support.kind!=='extrude') throw new Error('bridge profile');
      expect(support.at[1]+Math.max(...support.shape.map(p=>p[1]))).toBeCloseTo(ends[0]![1]!,12);
      expect(support.at[0]).toBeGreaterThan(ends[0]![0]!);expect(support.at[0]).toBeLessThan(ends[1]![0]!);
    }
    expect(part('monochord-box').extra!.every(p=>'size' in p&&Array.isArray(p.size)&&p.size.some(d=>d<=.05))).toBe(true);
  });
  it('joins the solid specimen continuously to both contact faces',()=>{
    const driver=partBounds(part('source-driver'))!,bar=partBounds(part('solid-bar'))!,receiver=partBounds(part('receiver'))!;
    expect(driver.max[0]).toBeCloseTo(bar.min[0],10);expect(bar.max[0]).toBeCloseTo(receiver.min[0],10);
    expect(part('solid-bar').connects).toEqual(expect.arrayContaining(['source-driver','receiver']));
  });
  it('positions reflectors in increasing physical-comparison order on the pulse axis',()=>{
    const overlay=sim.overlays.find(o=>o.kind==='sound-echo-pulse')!;
    expect(overlay.kind).toBe('sound-echo-pulse');
    if(overlay.kind!=='sound-echo-pulse') throw new Error('missing echo overlay');
    const projection=(id:string)=>{const b=partBounds(part(id))!;return b.min.map((v,i)=>(v+b.max[i]!)/2-overlay.origin[i]!).reduce((sum,v,i)=>sum+v*overlay.axis[i]!,0);};
    expect(projection('reflector-near')).toBeCloseTo(overlay.visualDistancesScene.near,6);
    expect(projection('reflector-mid')).toBeCloseTo(overlay.visualDistancesScene.mid,6);
    expect(projection('reflector-far')).toBeCloseTo(overlay.visualDistancesScene.far,6);
  });
});
