/** Saturn V's content contract: sourced table values and physically connected static configurations. */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { expect, it } from 'vitest';
import { parse as parseYaml } from 'yaml';
import { Euler, Matrix4, PerspectiveCamera, Vector3, Mesh, MeshBasicMaterial, Raycaster, DoubleSide } from 'three';
import { tableIndexBeat } from '../../scripts/geo/saturn-v/index-route';
import { readModel } from '../../scripts/geo/saturn-v/read-model';
import { partsFile, type Part } from '../../src/engines/space-scene/schema';
import { evaluateSim } from '../../src/engines/space-scene/lib/sim';
import { resolveSimValues } from '../../src/engines/space-scene/lib/sim/controls';
import { simEffects } from '../../src/engines/space-scene/lib/sim/bind';
import { cellValue } from '../../src/engines/space-scene/lib/sim/table';
import { tableSourceIssues } from '../../src/engines/space-scene/table-schema';
import { anchorPoint } from '../../src/engines/space-scene/stages/model3d/shapes';
import { partPieces } from '../../src/engines/space-scene/stages/model3d/geometry';
import { toTransform } from '../../src/engines/space-scene/lib/pose';
import type { SimValues } from '../../src/engines/space-scene/sim-schema';

const DIR = join(import.meta.dirname, '../../src/content/topics/saturn-v');
const file = partsFile.parse(JSON.parse(readFileSync(join(DIR, 'data/parts.json'), 'utf8')));
const sim = file.sim!;
const actualMeshes=await readModel();
const sources = JSON.parse(readFileSync(join(DIR, 'data/sources.json'), 'utf8')).sources as { id: string; design?: boolean }[];
interface Camera { position: [number, number, number]; target: [number, number, number]; fov?: number; }
interface Beat { camera?: string | Camera; caption: { en: string; zh: string }; labels?: string[]; hide?: string[]; pose?: string; sim?: { set?: SimValues }; }
interface Chapter { id: string; state: { camera?: Camera; index: { parts: string[] }; beats: Beat[]; labels?: string[]; hide?: string[]; pose?: string; sim?: { set?: SimValues } }; body: string; }
const chapters: Chapter[] = readdirSync(join(DIR, 'chapters')).filter((x) => x.endsWith('.mdx')).sort().map((name) => {
  const [, front, ...rest] = readFileSync(join(DIR, 'chapters', name), 'utf8').split(/^---$/m);
  return { ...parseYaml(front!), body: rest.join('---') };
});
const part = (id: string) => file.parts.find((x) => x.id === id)!;
const count = (id: string) => part(id).repeat?.count ?? 1;
const PHASE_NAMES = ['launch', 'first-off', 'parking', 'translunar', 'separated', 'turned', 'docked', 'extracted', 'lunar', 'ascent', 'rendezvous', 'homeward', 'return'];
const phaseValue = (phase: string) => phaseControl.kind === 'step' ? PHASE_NAMES.indexOf(phase) : phase;
const values = (set: SimValues = {}) => resolveSimValues(sim, { ...set, ...(typeof set.phase === 'string' && PHASE_NAMES.includes(set.phase) ? { phase: phaseValue(set.phase) } : {}) });
const out = (set: SimValues = {}) => evaluateSim(sim, values(set));
const effects = (set: SimValues = {}) => simEffects(sim, values(set), out(set));
const phaseControl = sim.controls.find((c) => c.id === 'phase')!;
const phases = phaseControl.kind === 'choice' ? phaseControl.options.map((x) => x.id) : PHASE_NAMES;
const phasePose = (phase: string, id: string) => effects({ phase }).poses.get(id);

/** Independent scene-space application of the documented XYZ, scale, pivot, offset contract. */
const poseFrames = new Map<string, { pivot: Vector3; rotation: Matrix4; scale: Vector3; offset: Vector3 }>();
function posedPoint(id: string, phase: string, point: readonly number[]) {
  const key = `${phase}/${id}`;
  let frame = poseFrames.get(key);
  if (!frame) {
    const name = phasePose(phase, id);
    const entry = name ? file.poses?.[name]?.parts[id] : undefined;
    const t = toTransform(entry);
    frame = {
      pivot: new Vector3(...(t.pivot ?? part(id).primitive!.at)),
      rotation: new Matrix4().makeRotationFromEuler(new Euler(...t.rotation.map((x) => x * Math.PI / 180) as [number, number, number], 'XYZ')),
      scale: new Vector3(...t.scale), offset: new Vector3(...t.offset),
    };
    poseFrames.set(key, frame);
  }
  return new Vector3(...point as [number, number, number]).sub(frame.pivot).multiply(frame.scale).applyMatrix4(frame.rotation).add(frame.pivot).add(frame.offset);
}
/** Use actual generated mesh vertices, including repeat/extra, rather than boxes around radial parts. */
function vertices(p: Part): Vector3[] {
  const points: Vector3[] = [];
  if(p.mesh){const g=actualMeshes.get(p.mesh)!;const pos=g.getAttribute('position');return Array.from({length:pos.count},(_,i)=>new Vector3().fromBufferAttribute(pos,i));}
  for (const piece of partPieces(p)) {
    const pos = piece.geometry.getAttribute('position');
    for (const matrix of piece.matrices ?? [new Matrix4()]) for (let i = 0; i < pos.count; i++) {
      points.push(new Vector3().fromBufferAttribute(pos, i).applyMatrix4(matrix).add(new Vector3(...p.primitive!.at)));
    }
    piece.geometry.dispose();
  }
  return points;
}

it('publishes seven bilingual chapters with exactly five beats each and 33 selectable parts', () => {
  expect(parseYaml(readFileSync(join(DIR, 'topic.yaml'), 'utf8')).status).toBe('published');
  expect(chapters).toHaveLength(7);
  expect(chapters.map((c) => c.state.beats.length)).toEqual([5, 5, 5, 5, 5, 5, 5]);
  expect(file.parts.filter((p) => !p.context)).toHaveLength(33);
  expect(new Set(file.parts.map((p) => p.id)).size).toBe(file.parts.length);
  for (const c of chapters) for (const b of c.state.beats) {
    expect(b.caption.en.trim(), c.id).not.toBe('');
    expect(b.caption.zh.trim(), c.id).not.toBe('');
    if (phaseControl.kind === 'step') expect(phaseControl.values, `${c.id}: phase is a supported numeric step`).toContain(b.sim?.set?.phase);
    else expect(phases, `${c.id}: phase is a supported choice`).toContain(b.sim?.set?.phase);
  }
});

it('has five F-1, five S-II J-2, one S-IVB J-2, three couches and four single-ladder legs', () => {
  expect([count('f1-centre'), count('f1-outer'), count('j2-centre'), count('j2-outer'), count('sivb-engine')]).toEqual([1, 4, 1, 4, 1]);
  expect([count('cm-couches'), count('lm-legs'), count('lm-ladder')]).toEqual([3, 4, 1]);
  expect(count('lm-windows') * (1 + (part('lm-windows').extra?.length ?? 0))).toBe(2);
  expect(file.flows).toHaveLength(3);
  const stages = chapters.find((c) => c.id === 'stages-and-mass')!;
  expect(stages.state.beats.map((b) => out({ ...stages.state.sim?.set, ...b.sim?.set })['engine-count'])).toEqual([5, 5, 1, 1, 1]);
});

it('uses existing table only and every row cites the appropriate design or historical source', () => {
  expect(sim.kind).toBe('table');
  expect(phaseControl.kind).toBe('step');
  if (phaseControl.kind === 'step') expect(phaseControl.values).toEqual(Array.from({ length: 13 }, (_, i) => i));
  expect(tableSourceIssues(sim.table!, sim.outputs, new Map(sources.map((s) => [s.id, s])))).toEqual([]);
  expect(sources.filter((s) => s.design).map((s) => s.id)).toEqual(['S90']);
  expect(Object.fromEntries(Object.entries(sim.table!.experiments).map(([id, e]) => [id, e.rows.length]))).toEqual({ ideal: 18, stage: 3, 'phase-state': 13 });
});

it.each(Array.from({ length: 18 }, (_, i) => i))('ideal table row %i matches an independent mass-ratio calculation', (i) => {
  const row = sim.table!.experiments.ideal!.rows[i]!;
  const payload = Number(row.when.payload), propellant = Number(row.when.propellant), extra = row.when['carry-inert'] ? 100 : 0;
  const final = 100 + payload + extra, initial = final + propellant;
  expect(cellValue(row.set['initial-mass']!)).toBe(initial);
  expect(cellValue(row.set['final-mass']!)).toBe(final);
  expect(Number(cellValue(row.set['ideal-dv']!))).toBeCloseTo(3000 * Math.log(initial / final), 8);
  expect(row.source).toContain('S90');
  expect(initial).toBeGreaterThan(final);
  expect(final).toBeGreaterThan(0);
});

it.each([
  [200, 600, false, 3295.84], [200, 600, true, 2748.87], [100, 200, false, 2079.44], [300, 200, false, 1216.40],
] as const)('payload %i, propellant %i, inert %s produces %f m/s', (payload, propellant, inert, expected) => {
  expect(Number(out({ payload, propellant, 'carry-inert': inert })['ideal-dv'])).toBeCloseTo(expected, 2);
});

it('changing stage selection preserves every ideal output and changes only the sourced stage description', () => {
  const picked = { payload: 300, propellant: 400, 'carry-inert': true };
  const initial = out(picked);
  for (const [stage, engines, fuel] of [['first', 5, 'kerosene'], ['second', 5, 'hydrogen'], ['third', 1, 'hydrogen']] as const) {
    const after = out({ ...picked, 'stage-choice': stage });
    expect([after['engine-count'], after['fuel-name']]).toEqual([engines, fuel]);
    for (const id of ['initial-mass', 'final-mass', 'ideal-dv']) expect(after[id]).toBe(initial[id]);
  }
});

it.each(['launch', 'first-off', 'parking', 'translunar', 'separated', 'turned', 'docked', 'extracted', 'lunar', 'ascent', 'rendezvous', 'homeward', 'return'])('%s reconstructs visibility and a named absolute pose for every part', (phase) => {
  const fx = effects({ phase });
  expect(phases).toContain(phase);
  expect(out({ phase })['configuration-name']).toBe(phase);
  for (const p of file.parts) {
    const name = fx.poses.get(p.id);
    expect(typeof name, `${phase}/${p.id} pose`).toBe('string');
    expect(file.poses?.[name!], `${phase}/${p.id}`).toBeDefined();
  }
  const sic = ['sic-shell', 'sic-fuel', 'sic-oxidiser', 'f1-centre', 'f1-outer', 'sic-fins'];
  const sii = ['sii-shell', 'sii-fuel', 'sii-oxidiser', 'j2-centre', 'j2-outer'];
  const upper = ['sivb-shell', 'sivb-fuel', 'sivb-oxidiser', 'sivb-engine', 'iu-ring'];
  for (const id of sic) expect(fx.hidden.has(id), `${phase}/${id}`).toBe(phase !== 'launch');
  for (const id of sii) expect(fx.hidden.has(id), `${phase}/${id}`).toBe(!['launch', 'first-off'].includes(phase));
  for (const id of upper) expect(fx.hidden.has(id), `${phase}/${id}`).toBe(['extracted', 'lunar', 'ascent', 'rendezvous', 'homeward', 'return'].includes(phase));
  expect(fx.hidden.has('sla-shell')).toBe(!['launch', 'first-off', 'parking', 'translunar'].includes(phase));
  for (const id of ['lm-descent', 'lm-descent-engine', 'lm-legs', 'lm-ladder']) expect(fx.hidden.has(id), `${phase}/${id}`).toBe(['rendezvous', 'homeward', 'return'].includes(phase));
  for (const id of ['lm-ascent', 'lm-ascent-engine', 'lm-windows', 'lm-docking-port']) expect(fx.hidden.has(id), `${phase}/${id}`).toBe(['homeward', 'return'].includes(phase));
  for (const id of ['sm-shell', 'sm-tanks', 'sm-engine']) expect(fx.hidden.has(id), `${phase}/${id}`).toBe(phase === 'return');
  expect(fx.hidden.has('les-tower')).toBe(!['launch', 'first-off'].includes(phase));
  expect(fx.hidden.has('cm-probe')).toBe(['homeward', 'return'].includes(phase));
  if (phase === 'return') expect(file.parts.filter((p) => !fx.hidden.has(p.id)).map((p) => p.id).sort()).toEqual(['cm-couches', 'cm-heatshield', 'cm-shell']);
});

it('the ascent cabin, engine, windows and port rise together while descent gear remains on the surface', () => {
  for (const id of ['lm-ascent', 'lm-ascent-engine', 'lm-windows', 'lm-docking-port']) {
    const rest = posedPoint(id, 'lunar', part(id).primitive!.at);
    const up = posedPoint(id, 'ascent', part(id).primitive!.at);
    expect(up.clone().sub(rest).toArray(), id).toEqual([0, 8, 0]);
  }
  for (const id of ['lm-descent', 'lm-descent-engine', 'lm-legs', 'lm-ladder']) {
    expect(posedPoint(id, 'ascent', part(id).primitive!.at).distanceTo(posedPoint(id, 'lunar', part(id).primitive!.at)), id).toBeLessThan(1e-8);
  }
});

it('the CSM components retain pairwise distances while clearing, turning and docking', () => {
  const ids = ['cm-shell', 'cm-heatshield', 'cm-couches', 'cm-probe', 'sm-shell', 'sm-tanks', 'sm-engine'];
  for (const phase of ['separated', 'turned', 'docked', 'extracted', 'rendezvous']) {
    for (const a of ids) for (const b of ids) {
      const before = new Vector3(...part(a).primitive!.at).distanceTo(new Vector3(...part(b).primitive!.at));
      const after = posedPoint(a, phase, part(a).primitive!.at).distanceTo(posedPoint(b, phase, part(b).primitive!.at));
      expect(Math.abs(after - before), `${phase}: ${a}/${b}`).toBeLessThan(1e-7);
    }
  }
});

it('the shipped five F-1 mouths preserve the nominal 0.10 m separation within 1 mm quantization', () => {
  const centres = [[0,0],[0,-3.8],[-3.8,0],[0,3.8],[3.8,0]];
  const rings: Vector3[][] = centres.map(() => []);
  for (const id of ['f1-centre','f1-outer']) for (const v of vertices(part(id))) {
    if (v.y > .15) continue;
    const distances = centres.map(([x,z]) => Math.hypot(v.x-x!,v.z-z!));
    rings[distances.indexOf(Math.min(...distances))]!.push(v);
  }
  const radii = rings.map((points,i) => {
    expect(points.length, `mouth ${i}`).toBeGreaterThan(40);
    return Math.max(...points.map(v => Math.hypot(v.x-centres[i]![0]!,v.z-centres[i]![1]!)));
  });
  for(let i=0;i<5;i++)for(let j=i+1;j<5;j++) {
    const distance=Math.hypot(centres[i]![0]!-centres[j]![0]!,centres[i]![1]!-centres[j]![1]!);
    expect(distance-radii[i]!-radii[j]!, `${i}/${j}`).toBeGreaterThanOrEqual(.099);
  }
});

it('every beat labels only visible indexed objects, and each index entry can be viewed within its chapter', () => {
  for (const c of chapters) {
    const seen = new Set<string>();
    for (const b of c.state.beats) {
      const set = { ...c.state.sim?.set, ...b.sim?.set };
      const hidden = new Set([...effects(set).hidden, ...(b.hide ?? c.state.hide ?? [])]);
      const labels = b.labels ?? c.state.labels ?? [];
      expect(labels.length, c.id).toBeLessThanOrEqual(4);
      for (const id of c.state.index.parts) {
        expect(part(id), `${c.id}/${id}`).toBeDefined();
        if (!hidden.has(id)) seen.add(id);
      }
      for (const id of labels) {
        expect(c.state.index.parts, `${c.id} label ${id}`).toContain(id);
        expect(hidden.has(id), `${c.id} hidden label ${id}`).toBe(false);
      }
    }
    for (const id of c.state.index.parts) expect(seen.has(id), `${c.id} index ${id} needs a visible beat`).toBe(true);
  }
});

it('cold-link ideal-model beat 2 starts at 3295.84 m/s independently of the preceding chapter', () => {
  const chapter = chapters.find((c) => c.id === 'ideal-model')!;
  const set = { ...chapter.state.sim?.set, ...chapter.state.beats[1]!.sim?.set };
  expect(values(set)).toMatchObject({ payload: 200, propellant: 600, 'carry-inert': false, phase: phaseValue('translunar') });
  expect(Number(out(set)['ideal-dv'])).toBeCloseTo(3295.836866004329, 8);
});


it.each(['docked', 'extracted', 'rendezvous'])('%s aligns the actual probe tip and LM docking-port centre within 0.05 m', (phase) => {
  // Measure the delivered contact head, not a duplicated expected station.
  const tip = vertices(part('cm-probe')).reduce((a,b) => b.y>a.y?b:a);
  const probe = posedPoint('cm-probe', phase, tip.toArray());
  // The unbaked LM torus really is generated at this runtime position.
  const port = posedPoint('lm-docking-port', phase, part('lm-docking-port').primitive!.at);
  expect(probe.distanceTo(port)).toBeLessThanOrEqual(0.05);
});

it('the complete folded LM mesh fits inside the tapered adapter without a second copy outside it', () => {
  const points = file.parts.filter((p) => p.group === 'lander').flatMap((p) => vertices(p).map((v) => posedPoint(p.id, 'launch', v.toArray())));
  expect(points.length).toBeGreaterThan(100);
  let minRadialClearance = Infinity, minY = Infinity, maxY = -Infinity;
  for (const v of points) {
    minY = Math.min(minY, v.y); maxY = Math.max(maxY, v.y);
    // SLA inner profile is 3.225 m at y85.59, tapering to1.87 m at y94.
    const inner = 3.225 + (1.87 - 3.225) * (v.y - 85.59) / (94 - 85.59);
    minRadialClearance = Math.min(minRadialClearance, inner - Math.hypot(v.x, v.z));
  }
  expect(minY).toBeGreaterThanOrEqual(85.59 - 1e-5);
  expect(maxY).toBeLessThanOrEqual(94 + 1e-5);
  expect(minRadialClearance).toBeGreaterThanOrEqual(-1e-5);
  expect(file.parts.filter((p) => p.id === 'lm-ascent')).toHaveLength(1);
});

it('every labelled anchor is inside its beat camera at 1600×900 after the phase pose is applied', () => {
  const failures: string[] = [];
  for (const c of chapters) for (const [i, b] of c.state.beats.entries()) {
    const camera = typeof b.camera === 'string' ? file.presets?.find((p) => p.id === b.camera)?.camera : b.camera ?? c.state.camera;
    expect(camera, `${c.id}/${i + 1} camera`).toBeDefined();
    const cam = new PerspectiveCamera(camera!.fov ?? 35, 1600 / 900, 0.01, 4000);
    cam.position.set(...camera!.position); cam.lookAt(new Vector3(...camera!.target)); cam.updateMatrixWorld();
    const set = { ...c.state.sim?.set, ...b.sim?.set };
    for (const id of b.labels ?? c.state.labels ?? []) {
      const p = part(id);
      const point=p.mesh?actualMeshes.get(p.mesh)!.userData.labelPoint:undefined;
      const anchor = point?new Vector3(...point as [number,number,number]):new Vector3(...p.primitive!.at).add(new Vector3(...anchorPoint(p)));
      const phase = phaseControl.kind === 'step' ? PHASE_NAMES[Number(values(set).phase)]! : String(values(set).phase);
      const ndc = posedPoint(id, phase, anchor.toArray()).project(cam);
      if (Math.abs(ndc.x) > 1 || Math.abs(ndc.y) > 1 || ndc.z <= -1 || ndc.z >= 1) failures.push(`${c.id}/${i + 1}: ${id} NDC [${ndc.toArray().map((v) => v.toFixed(3)).join(', ')}]`);
    }
  }
  expect(failures).toEqual([]);
});


it('propellant flows require launch configuration and first-stage selection together', () => {
  for (const phase of phases) for (const stage of ['first', 'second', 'third']) {
    const fx = effects({ phase, 'stage-choice': stage });
    for (const id of ['fuel-feed', 'oxidiser-feed', 'exhaust-out']) expect(fx.flows.get(id)?.visible, `${phase}/${stage}/${id}`).toBe(phase === 'launch' && stage === 'first');
  }
});


it('loads every rebuilt node from the shipped GLB and stays below the geometry and payload budgets',()=>{
 const audit=JSON.parse(readFileSync(join(DIR,'../../../../scripts/geo/saturn-v/mesh-audit.json'),'utf8'));
 let actual=0;for(const p of file.parts){if(!p.mesh)continue;const g=actualMeshes.get(p.mesh);expect(g,p.id).toBeDefined();actual+=(g!.index?.count??g!.getAttribute('position').count)/3;}
 expect(actual).toBe(Object.values(audit.after).reduce((a:any,b:any)=>a+b,0));
 expect(audit.totalAfter).toBeLessThanOrEqual(350000);
 expect(readFileSync(join(DIR,'../../../../public/models/saturn-v.glb')).length).toBeLessThanOrEqual(1500000);
});

it('ch05 indexes the launch escape tower and probe and has a launch comparison beat',()=>{
 const ch=chapters.find(c=>c.id==='home-in-the-cone')!;
 for(const id of ['les-tower','cm-probe']){expect(ch.state.index.parts).toContain(id);expect(ch.state.beats.some(b=>b.labels?.includes(id)&&!effects({...ch.state.sim?.set,...b.sim?.set}).hidden.has(id))).toBe(true);}
});


it('the proposed one-tap router finds a visible in-chapter configuration for every indexed part',()=>{
 for(const c of chapters)for(const id of c.state.index.parts){
  const b=tableIndexBeat(c.state as any,file,id);expect(b,`${c.id}/${id}`).not.toBeNull();
  const beat=c.state.beats[b!]!,fx=effects({...c.state.sim?.set,...beat.sim?.set});expect(fx.hidden.has(id),`${c.id}/${id}`).toBe(false);
 }
});


it('the delivered CM has five recessed glazing apertures through the pressure skin',()=>{
 const mesh=new Mesh(actualMeshes.get('cm-shell')!,new MeshBasicMaterial({side:DoubleSide}));mesh.updateMatrixWorld();
 const ray=new Raycaster();
 for(const [a,y]of [[0,99.76],[-1.08,99.85],[1.08,99.85],[-.43,100.74],[.43,100.74]] as [number,number][]){
  const dir=new Vector3(Math.sin(a),0,Math.cos(a)),radius=1.95-1.51*(y-98.5)/3+.025*Math.sin(Math.PI*(y-98.5)/3);
  ray.set(dir.clone().multiplyScalar(3.5).setY(y),dir.clone().negate());const hit=ray.intersectObject(mesh)[0];
  expect(hit,`window ${a}/${y}`).toBeDefined();const r=Math.hypot(hit!.point.x,hit!.point.z);
  expect(r,`glazing recessed inside opening ${a}`).toBeLessThan(radius-.018);
  expect(r,`glazing exists ${a}`).toBeGreaterThan(radius-.12);
 }
 (mesh.material as MeshBasicMaterial).dispose();
});

it('all sixteen SM RCS mouths are hollow in the compressed payload',()=>{
 const mesh=new Mesh(actualMeshes.get('sm-shell')!,new MeshBasicMaterial({side:DoubleSide}));mesh.updateMatrixWorld();const ray=new Raycaster();
 for(let k=0;k<4;k++)for(const d of [[0,1,0],[0,-1,0],[1,0,0],[-1,0,0]] as [number,number,number][]){
  const a=Math.PI/4+k*Math.PI/2,rot=new Matrix4().makeRotationY(a),origin=new Vector3(2.005*Math.sin(a),97.25,2.005*Math.cos(a));
  const dir=new Vector3(...d).transformDirection(rot),mouth=new Vector3(d[0]*.35*.93,d[1]*.35*.93,.045).applyMatrix4(rot).add(origin);
  ray.set(mouth.clone().addScaledVector(dir,.05),dir.clone().negate());const hit=ray.intersectObject(mesh)[0];
  expect(hit,`quad ${k} nozzle ${d}`).toBeDefined();expect(hit!.distance,`open throat ${k}/${d}`).toBeGreaterThan(.14);
  expect(hit!.distance,`attached chamber ${k}/${d}`).toBeLessThan(.36);
 }
 (mesh.material as MeshBasicMaterial).dispose();
});

it('S-II and S-IVB curved common bulkheads retain a physical insulation gap',()=>{
 for(const prefix of ['sii','sivb']){
  const low=vertices(part(prefix+'-fuel')).filter(p=>Math.hypot(p.x,p.z)<.02).map(p=>p.y);
  const high=vertices(part(prefix+'-oxidiser')).filter(p=>Math.hypot(p.x,p.z)<.02).map(p=>p.y);
  expect(Math.min(...low)-Math.max(...high),prefix).toBeGreaterThan(.025);
 }
});


it('fuel and oxygen FLOW centre-lines run inside the actual separate S-IC pipes',()=>{
 for(const [id,selection,index]of [['fuel-feed','sic-fuel',1],['oxidiser-feed','sic-oxidiser',2]] as [string,string,number][]){
  const mesh=new Mesh(actualMeshes.get(selection)!,new MeshBasicMaterial({side:DoubleSide}));mesh.updateMatrixWorld();const ray=new Raycaster(),flow=file.flows.find(f=>f.id===id)!;
  expect(flow.paths).toHaveLength(5);
  for(const path of flow.paths!){const p=path.path[index]!;ray.set(new Vector3(...p),new Vector3(1,0,0));const hit=ray.intersectObject(mesh)[0];expect(hit,`${id}/${path.id}`).toBeDefined();expect(hit!.distance).toBeGreaterThan(.09);expect(hit!.distance).toBeLessThan(.23);}
  (mesh.material as MeshBasicMaterial).dispose();
 }
});


it('the identifying J-2 start tank stays spherical and smoothly tessellated after compression',()=>{
 const centre=new Vector3(-.19,42.5+2.4*1.125,.42);
 const points=vertices(part('j2-centre')).filter(p=>Math.abs(p.distanceTo(centre)-.31)<.004);
 expect(points.length).toBeGreaterThan(500);
 for(const axis of ['x','y','z'] as const){const span=Math.max(...points.map(p=>p[axis]))-Math.min(...points.map(p=>p[axis]));expect(span,axis).toBeGreaterThan(.612);expect(span,axis).toBeLessThan(.63);}
});

// Inspect the extras actually loaded by GltfSource, not an authoring proxy.
it('keeps hollow multipart GLB interiors open under the engine cutaway shader', () => {
  const bytes = readFileSync(join(DIR, '../../../../public/models/saturn-v.glb'));
  const json = JSON.parse(bytes.subarray(20, 20 + bytes.readUInt32LE(12)).toString());
  const meshes = json.nodes.filter((n: {mesh?:number}) => n.mesh !== undefined);
  expect(meshes).toHaveLength(31);
  for (const node of meshes) expect(node.extras.closed, node.name).toBe(false);
});

it('LM corner quads retain sixteen open mouths across both horizontal translation axes',()=>{
 const mesh=new Mesh(actualMeshes.get('lm-ascent')!,new MeshBasicMaterial({side:DoubleSide}));mesh.updateMatrixWorld();const ray=new Raycaster();
 for(const sx of [-1,1])for(const sz of [-1,1])for(const d of [[0,1,0],[0,-1,0],[1,0,0],[-1,0,0]] as [number,number,number][]){
  const origin=new Vector3(sx*1.60,90.55,sz*1.55),rot=new Matrix4().makeRotationY(Math.atan2(origin.x,origin.z));
  const dir=new Vector3(...d).transformDirection(rot),mouth=new Vector3(d[0]*.35*.82,d[1]*.35*.82,.045).applyMatrix4(rot).add(origin);
  ray.set(mouth.clone().addScaledVector(dir,.05),dir.clone().negate());const hit=ray.intersectObject(mesh)[0];
  expect(hit,`LM quad ${sx}/${sz}/${d}`).toBeDefined();expect(hit!.distance,`open LM throat ${sx}/${sz}/${d}`).toBeGreaterThan(.12);expect(hit!.distance,`connected LM chamber ${sx}/${sz}/${d}`).toBeLessThan(.33);
  if(d[0]){expect(Math.abs(dir.x)).toBeGreaterThan(.65);expect(Math.abs(dir.z)).toBeGreaterThan(.65);}
 }
 (mesh.material as MeshBasicMaterial).dispose();
});

it('CM hatch top and bottom seals stay in relief over the curved shell',()=>{
 const mesh=new Mesh(actualMeshes.get('cm-shell')!,new MeshBasicMaterial({side:DoubleSide}));mesh.updateMatrixWorld();const ray=new Raycaster();
 for(const [lo,hi]of [[99.05,99.18],[100.28,100.43]]){
  let relief=-Infinity;
  for(let y=lo!;y<=hi!;y+=.004){
   ray.set(new Vector3(0,y,3),new Vector3(0,0,-1));const hit=ray.intersectObject(mesh)[0];
   if(hit){const r=1.95-1.51*(y-98.5)/3+.025*Math.sin(Math.PI*(y-98.5)/3);relief=Math.max(relief,hit.point.z-r);}
  }
  expect(relief,`hatch seal ${lo}/${hi}`).toBeGreaterThan(.018);
 }
 (mesh.material as MeshBasicMaterial).dispose();
});

it('both lower upper-stage tanks actually contain their annular slosh baffles',()=>{
 for(const [id,x,y,lo,hi,count]of [['sii-oxidiser',4.79,50.45,48.85,50.45,3],['sivb-oxidiser',3.05,73.4,72.75,73.4,1]] as [string,number,number,number,number,number][]){
  const mesh=new Mesh(actualMeshes.get(id)!,new MeshBasicMaterial({side:DoubleSide}));mesh.updateMatrixWorld();const ray=new Raycaster(new Vector3(x,y,0),new Vector3(0,-1,0));
  const levels:number[]=[];for(const hit of ray.intersectObject(mesh)){const v=hit.point.y;if(v>lo&&v<hi&&levels.every(n=>Math.abs(n-v)>.08))levels.push(v);}
  expect(levels,id).toHaveLength(count);(mesh.material as MeshBasicMaterial).dispose();
 }
});
it('nine cold helium vessels are present inside the delivered S-IVB hydrogen tank',()=>{
 const g=actualMeshes.get('sivb-fuel')!,mesh=new Mesh(g,new MeshBasicMaterial({side:DoubleSide}));mesh.updateMatrixWorld();
 for(let k=0;k<9;k++){const a=k*Math.PI*2/9,centre=new Vector3(2.64*Math.sin(a),74.65,2.64*Math.cos(a));const ray=new Raycaster(centre,new Vector3(0,1,0));const hit=ray.intersectObject(mesh)[0];expect(hit,`helium ${k}`).toBeDefined();expect(hit!.distance).toBeGreaterThan(.29);expect(hit!.distance).toBeLessThan(.35);}
 (mesh.material as MeshBasicMaterial).dispose();
});

it('the four high-gain antenna feeds stand at the actual paraboloid focus',()=>{
 const mesh=new Mesh(actualMeshes.get('sm-shell')!,new MeshBasicMaterial({side:DoubleSide}));mesh.updateMatrixWorld();const ray=new Raycaster(),normal=new Vector3(1,-.1,1).normalize();
 for(const x of [-.30,.30])for(const y of [-.42,.42]){
  const focus=new Vector3(2.65+x,93.85+y,2.65-x).addScaledVector(normal,.39**2/(4*.12));
  ray.set(focus.clone().addScaledVector(normal,.1),normal.clone().negate());const hit=ray.intersectObject(mesh)[0];
  expect(hit,`feed ${x}/${y}`).toBeDefined();expect(hit!.distance).toBeGreaterThan(.03);expect(hit!.distance).toBeLessThan(.09);
 }
 (mesh.material as MeshBasicMaterial).dispose();
});

it('pressure vessels follow the NASA cutaway proportions rather than old proxy envelopes',()=>{
 for(const [id,y,radius]of [['sic-fuel',15,4.95],['sic-oxidiser',30,4.95],['sii-fuel',58,4.93],['sii-oxidiser',49.5,4.93],['sivb-fuel',78,3.2],['sivb-oxidiser',73.1,3.2]] as [string,number,number][]){
  const mesh=new Mesh(actualMeshes.get(id)!,new MeshBasicMaterial({side:DoubleSide}));mesh.updateMatrixWorld();const ray=new Raycaster(new Vector3(10,y,.06),new Vector3(-1,0,0));const hit=ray.intersectObject(mesh)[0];
  expect(hit,id).toBeDefined();expect(Math.hypot(hit!.point.x,hit!.point.z),id).toBeCloseTo(radius,1);(mesh.material as MeshBasicMaterial).dispose();
 }
 for(const [id,ceiling]of [['sic-fuel',21.5],['sii-oxidiser',52.45],['sivb-oxidiser',74.80]] as [string,number][]){expect(Math.max(...vertices(part(id)).map(v=>v.y)),id).toBeLessThan(ceiling);}
});

it('SM storage uses full-size SPS vessels, spherical helium tanks and upright fuel-cell units',()=>{
 const mesh=new Mesh(actualMeshes.get('sm-tanks')!,new MeshBasicMaterial({side:DoubleSide}));mesh.updateMatrixWorld();const ray=new Raycaster();
 for(const angle of [85,150,265,330]){const a=angle*Math.PI/180,d=new Vector3(Math.sin(a),0,Math.cos(a)),centre=d.clone().multiplyScalar(1.24).setY(96.25);ray.set(centre.clone().addScaledVector(d,2),d.clone().negate());expect(ray.intersectObject(mesh)[0]!.point.distanceTo(centre)).toBeCloseTo(.57,1);}
 for(const y of [96.7,97.84]){ray.set(new Vector3(0,y,0),new Vector3(0,1,0));const hit=ray.intersectObject(mesh)[0];expect(hit).toBeDefined();expect(hit!.distance).toBeCloseTo(.508,1);}
 const a=205*Math.PI/180,d=new Vector3(Math.sin(a),0,Math.cos(a));
 for(const [r,t]of [[.91,0],[1.46,-.34],[1.46,.34]]){const p=new Vector3(r!*Math.sin(a)+t!*Math.cos(a),97.72,r!*Math.cos(a)-t!*Math.sin(a));ray.set(p.clone().addScaledVector(d,.6),d.clone().negate());const hit=ray.intersectObject(mesh)[0];expect(hit).toBeDefined();expect(hit!.point.distanceTo(p)).toBeCloseTo(.28,1);ray.set(p,new Vector3(0,1,0));expect(ray.intersectObject(mesh)[0]!.distance).toBeCloseTo(.55,1);}
 (mesh.material as MeshBasicMaterial).dispose();
});
it('the SPS exit matches the handbook 98.4-inch nozzle envelope',()=>{
 const rim=vertices(part('sm-engine')).filter(p=>p.y<91.025),diameter=2*Math.max(...rim.map(p=>Math.hypot(p.x,p.z)));expect(diameter).toBeGreaterThan(2.49);expect(diameter).toBeLessThan(2.51);
});

it('LM footpad foil clears its metal backing around every rim after compression',()=>{
 const mesh=new Mesh(actualMeshes.get('lm-legs')!,new MeshBasicMaterial({side:DoubleSide}));mesh.updateMatrixWorld();const ray=new Raycaster();
 for(let leg=0;leg<4;leg++)for(const r of [.42,.44,.455])for(let k=0;k<24;k++){
  const a=(k+.31)*Math.PI*2/24,p=new Vector3(r*Math.sin(a),86,4.25+r*Math.cos(a)).applyAxisAngle(new Vector3(0,1,0),leg*Math.PI/2);
  ray.set(p,new Vector3(0,-1,0));const hit=ray.intersectObject(mesh)[0],backing=85.79-(r-.36)*.6;
  expect(hit,`leg ${leg}, rim ${r}/${k}`).toBeDefined();expect(hit!.point.y-backing,`foil clearance ${leg}/${r}/${k}`).toBeGreaterThan(.005);
 }
 (mesh.material as MeshBasicMaterial).dispose();
});

it('the delivered couches have supine backs and raised leg pans inside the CM pressure shell',()=>{
 const mesh=new Mesh(actualMeshes.get('cm-couches')!,new MeshBasicMaterial({side:DoubleSide}));mesh.updateMatrixWorld();const ray=new Raycaster();
 for(const x of [-.65,0,.65]){
  ray.set(new Vector3(x+.07,100.5,-.45),new Vector3(0,-1,0));const back=ray.intersectObject(mesh)[0];
  ray.set(new Vector3(x+.07,100.5,.59),new Vector3(0,-1,0));const leg=ray.intersectObject(mesh)[0];
  expect(back,`back ${x}`).toBeDefined();expect(leg,`leg ${x}`).toBeDefined();
  expect(back!.point.y).toBeGreaterThan(99.0);expect(back!.point.y).toBeLessThan(99.3);
  expect(leg!.point.y-back!.point.y).toBeGreaterThan(.35);
 }
 for(const p of vertices(part('cm-couches'))){const inner=1.95-1.51*(p.y-98.5)/3;expect(Math.hypot(p.x,p.z)).toBeLessThan(inner-.035);}
 (mesh.material as MeshBasicMaterial).dispose();
});
