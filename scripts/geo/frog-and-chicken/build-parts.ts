/**
 * Original observation specimens, not measurements of a species or a clock.
 * Run: pnpm tsx scripts/geo/frog-and-chicken/build-parts.ts
 * Reference: docs/56 §3–4; approved graphite frog/hen and egg/tadpole plates.
 * Main frogs have four fingers per forefoot and five toes per hind foot.
 * Comparison specimens reuse the detailed stage geometry.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { partsFile } from '../../../src/engines/space-scene/schema';
import { bird } from './specimens';
import { frog, tadpole } from './amphibians';
import { writeComparisonMeshes } from './comparison-meshes';

type V = [number, number, number];
type P = Record<string, unknown> & { kind: string; at: V };
const out = join(import.meta.dirname, '../../../src/content/topics/frog-and-chicken/data/parts.json');
const bi = (en: string, zh: string) => ({ en, zh });
const n = (v: number) => Number(v.toFixed(6));
const add = (a: V, b: V): V => a.map((v, i) => n(v + b[i]!)) as V;
const scale = (a: V, s: number): V => a.map((v) => n(v * s)) as V;
const skin = '#78806a';
const dark = '#373a32';
const shell = '#d4cbb7';
// Smooth revolved ellipsoids use a deliberate mesh budget instead of the
// sphere primitive's fixed high tessellation on every tiny comparison bead.
const roundProfile = Array.from({ length: 21 }, (_, i): [number, number] => [i === 0 || i === 20 ? 0 : n(Math.sin(i * Math.PI / 20)), n(-Math.cos(i * Math.PI / 20))]);
const ell = (at: V, radii: V, tint: string, color = 'tissue'): P => ({ kind: 'lathe', profile: roundProfile, segments: 24, at, scale: radii, color, tint });
const sweep = (at: V, path: V[], radius: number | number[], tint: string, color = 'tissue', more = {}): P => ({ kind: 'sweep', at, path, radius, radial: 8, segments: 20, color, tint, ...more });
const local = (p: P, at: V, s = 1): P => {
  const q: P = { ...p, at: add(at, scale(p.at, s)) };
  // Scale the complete primitive, including its path, through the existing scale field.
  q.scale = scale((p.scale as V | undefined) ?? [1, 1, 1], s);
  return q;
};

/** Level of detail by on-screen size (docs/02 budget, perf-lessons): `k` scales the
 * tessellation of every sweep / lathe of a specimen. Flat feather vanes and
 * membranes (section flat ≤ .25) are thin blades seen edge-on or face-on, so
 * their cross-section ring drops to 6; round limbs and bodies keep ≥ 10 and
 * hero bodies ≥ 32. Lengthwise samples keep ≥ 2.5 per path point so bundled
 * feather tips and toe ends stay rounded.
 */
const lod = (prims: P[], k: number): P[] => prims.map((p) => {
  const q: P = { ...p };
  const flat = typeof p.section === 'object' && p.section !== null && 'flat' in p.section ? Number((p.section as { flat: number }).flat) : 1;
  // Ringed (scaled) shanks keep ≥ 10 stations a ring so the scale relief holds.
  if (p.kind === 'sweep' && p.rings) {
    q.radial = Math.min(Number(p.radial ?? 12), 12);
    q.segments = Math.round(Number(p.segments) * .75);
  } else if (p.kind === 'sweep') {
    const radial = Number(p.radial ?? 12), seg = Number(p.segments ?? 32), pts = (p.path as V[]).length;
    q.radial = flat <= .25 ? Math.min(radial, 6) : Math.min(radial, Math.max(radial >= 48 ? 32 : 10, Math.round(radial * k / 2) * 2));
    q.segments = Math.min(seg, Math.max(16, Math.round(pts * 2.5), Math.round(seg * k)));
  } else if (p.kind === 'lathe') q.segments = Math.max(Number(p.segments) >= 48 ? 40 : 16, Math.round(Number(p.segments) * k / 2) * 2);
  return q;
});

// Published wording is separate from the geometry authoring pipeline.
// Only the four anatomy descriptions in editorial.json differ from the baseline.
const editorial = JSON.parse(readFileSync(join(import.meta.dirname,'editorial.json'),'utf8')) as { parts: Record<string, Record<string, unknown>>; sim: unknown; presets: unknown; spec: unknown };
const parts: Record<string, unknown>[] = [];
const meshRows=new Map<string,P[]>();
function part(id: string, group: string, geometry: P[], more = {}) {
  if(!editorial.parts[id])throw new Error(`Missing editorial metadata: ${id}`);
  if(id==='compare-frog'||id==='compare-chicken'){
    meshRows.set(id,geometry);
    // Invisible one-millimetre anchor/material proxy for static label tools.
    // GltfSource replaces it with the complete named mesh on stage.
    parts.push({id,group,...editorial.parts[id],mesh:id,material:{color:'tissue',tint:id==='compare-frog'?skin:'#ab9580'},primitive:ell(id==='compare-frog'?[-3.0,.30,3.5]:[-1.0,.30,3.5],[.001,.001,.001],id==='compare-frog'?skin:'#ab9580'),castShadow:false,...more});
  }else{
    if(!geometry.length||geometry.length>33)throw new Error(`${id}: ${geometry.length} primitives`);
    parts.push({id,group,...editorial.parts[id],primitive:geometry[0],...(geometry.length>1?{extra:geometry.slice(1)}:{}),castShadow:false,...more});
  }
}
const frogPoints: V[] = [[-2.8, .18, -1.4], [-1.468521, .18, -.432624], [-1.977101, .18, 1.132624], [-3.622899, .18, 1.132624], [-4.131479, .18, -.432624]];
const chickenPoints: V[] = [[2.8, .18, -1.4], [4.012436, .18, .7], [1.587564, .18, .7]];
const base = (v: V, y: number): V => [v[0], y, v[2]];
const eggs: P[] = [];
for (const offset of [[-.19, 0, 0], [.13, .02, -.15], [.13, .02, .17], [-.06, .2, .03]] as V[]) {
  eggs.push(ell(add(base(frogPoints[0]!, .38), offset), [.19, .19, .19], '#c6cbbb', 'membrane'));
  eggs.push(ell(add(base(frogPoints[0]!, .38), offset), [.075, .075, .075], dark));
}
part('frog-eggs', 'frog-cycle', eggs);
part('frog-tadpole', 'frog-cycle', lod(tadpole(), .75).map((p) => local(p, base(frogPoints[1]!, .37), .82)));
part('frog-hind-legs', 'frog-cycle', lod(tadpole(true), .75).map((p) => local(p, base(frogPoints[2]!, .37), .82)));
part('frog-froglet', 'frog-cycle', lod(frog(true), .7).map((p) => local(p, base(frogPoints[3]!, .28), .78)));
part('frog-adult', 'frog-cycle', lod(frog(), .75).map((p) => local(p, base(frogPoints[4]!, .28), .95)));

/** Hollow ring-section profile. Complementary 210°/150° sectors close fully. */
// Asymmetric oviform: broad blunt lower pole and a narrower upper pole.
const eggOuter: [number, number][] = Array.from({length:47}, (_,i) => {
  const t=i*Math.PI/46, y=-.54*Math.cos(t);
  return [i===0||i===46?0:n(.355*Math.sin(t)*(1-.19*y/.54)),n(y)];
});
const eggProfile = [...eggOuter, ...eggOuter.map(([r, y]): [number, number] => [r*.935, y * .95]).reverse(), eggOuter[0]!];
const eggAt: V = [2.8, .75, -1.4];
const shellGeometry = (arc: number, yaw: number): P => ({ kind: 'lathe', at: eggAt, profile: eggProfile, segments: 96, arc, rotation: [0, yaw, 0], color: 'tissue', tint: shell });
part('chicken-egg', 'chicken-cycle', [shellGeometry(210, 25),{...ell([2.8,.293,-1.4],[.145,.036,.145],'#e5e1d0','membrane'),segments:64}], { shell: true, connects: ['egg-shell-window', 'egg-white', 'egg-yolk', 'egg-embryo'] });
part('egg-shell-window', 'chicken-cycle', [shellGeometry(150, 205)], { shell: true, explode: { dir: [0, 1, 1], dist: .55 }, connects: ['chicken-egg'] });
// Two opposed twisted chalaza cords keep their proper pole-to-yolk topology.
const chalazae:P[]=[];
for(const side of [-1,1]) for(const phase of [0,Math.PI]) {
  const path:V[]=Array.from({length:25},(_,i)=>{
    const t=i/24,angle=t*Math.PI*3+phase;
    return [Math.cos(angle)*.012*(.5+.5*Math.sin(Math.PI*t)),side*(.21+t*.18),Math.sin(angle)*.012];
  });
  chalazae.push(sweep([2.77,.72,-1.41],path,Array.from({length:25},(_,i)=>.003+.004*Math.sin(i*Math.PI/24)), '#e2dece','tissue',{radial:8,segments:40}));
}
part('egg-yolk', 'chicken-cycle', [{...ell([2.77, .72, -1.41], [.215, .225, .215], '#c5a05c'),segments:64},...chalazae], { explode: { dir: [-1, 0, 0], dist: .45 }, connects: ['egg-embryo', 'egg-white'] });
part('egg-white', 'chicken-cycle', [{kind:'lathe',at:eggAt,profile:eggOuter.map(([r,y])=>[r*.91,y*.91]),segments:96,color:'membrane',tint:'#d9d7c7'}], { shell: true, explode: { dir: [1, 0, 0], dist: .5 }, connects: ['egg-yolk', 'chicken-egg'] });
part('egg-embryo', 'chicken-cycle', [sweep([2.9, .9, -1.22], [[-.05, .02, 0], [-.03, -.07, .015], [.04, -.11, 0], [.08, -.07, -.01]], [.048, .035, .026, .008], '#ab8e82'), ell([2.85, .94, -1.21], [.055, .059, .045], '#ab8e82')], { explode: { dir: [1, 1, 1], dist: .55 }, connects: ['egg-yolk'] });
part('chicken-chick', 'chicken-cycle', lod(bird(false), .5).map((p) => local(p, base(chickenPoints[1]!, .24), .64)));
part('chicken-adult', 'chicken-cycle', lod(bird(true), .7).map((p) => local(p, base(chickenPoints[2]!, .24), .98)));

function marker(id: string, group: string, at: V, radius: number) {
  // The pose origin remains the exact planning centre; place its bead on the
  // forward rim so the label anchor cannot disappear inside a specimen.
  part(id, group, [sweep(at, [[0, 0, radius - .02], [0, 0, radius + .02]], .055, dark, 'tissue', { segments: 4 }), { kind: 'torus', size: [radius, .014], at, rotation: [90, 0, 0], color: 'token:ink-2' }]);
}
marker('frog-marker', 'frog-cycle', frogPoints[0]!, .61);
marker('chicken-marker', 'chicken-cycle', chickenPoints[0]!, .62);

// Miniature comparison silhouettes retain the distinguishing stage structures.
const mini: P[] = [];
mini.push(ell([-3.65, .31, 3.5], [.1, .1, .1], '#c6cbbb', 'membrane'), ell([-3.65, .31, 3.5], [.04, .04, .04], dark));
for (let stage = 0; stage < 4; stage++) {
  const at: V = [-3.37 + stage * .31, .26, 3.5];
  // Each full stage is baked into the named local comparison mesh.
  mini.push(...lod(stage<2?tadpole(stage===1):frog(stage===2),.4).map(p=>local(p,at,.22)));
}
part('compare-frog', 'comparison', mini);
const miniBird = (at: V, grown: boolean): P[] => lod(bird(grown,false),.4).map(p=>local(p,at,grown?.32:.30));
part('compare-chicken', 'comparison', [{kind:'lathe',at:[-1.56,.37,3.5],profile:eggOuter,segments:64,scale:[.24,.24,.24],color:'tissue',tint:shell}, ...miniBird([-1.08, .25, 3.5], false), ...miniBird([-.48, .25, 3.5], true)]);
const mosquitoes: P[] = [
  ell([.31, .28, 3.5], [.035, .07, .035], dark),
  sweep([.63, .35, 3.5], [[-.04, .12, 0], [-.09, .02, 0], [0, -.07, 0], [.06, -.11, 0]], [.035, .035, .027, .01], dark),
  sweep([1.05, .35, 3.5], [[-.04, .06, 0], [-.08, -.03, 0], [0, -.11, 0], [.09, -.08, 0]], [.075, .058, .028, .008], dark),
  ell([1.51, .49, 3.5], [.08, .055, .05], dark),
  sweep([1.51, .49, 3.5], [[.04, 0, 0], [.14, -.06, 0], [.23, -.13, 0]], [.045, .032, .005], dark),
  ell([1.42, .51, 3.5], [.045, .045, .045], dark),
  sweep([1.42, .51, 3.5], [[-.02, -.01, 0], [-.15, -.06, 0]], [.008, .004], dark),
];
for (const side of [-1, 1]) {
  mosquitoes.push(ell([1.58, .51, 3.5 + side * .14], [.15, .012, .08], '#b8beb3', 'membrane'));
  for (let leg = 0; leg < 3; leg++) mosquitoes.push(sweep([1.51, .49, 3.5], [[0, -.01, side * .03], [(leg - 1) * .1, -.08, side * .13], [(leg - 1) * .17, -.23, side * .22]], [.009, .006, .003], dark));
}
part('compare-mosquito', 'comparison', mosquitoes);
const plants: P[] = [ell([2.4, .3, 3.5], [.075, .045, .05], '#9d8b70')];
for (const [x, height] of [[2.91, .32], [3.52, .64]]) {
  const at: V = [x!, .24, 3.5];
  plants.push(sweep(at, [[0, 0, 0], [.01, height! * .6, 0], [0, height!, 0]], .013, skin));
  for (const side of [-1, 1]) plants.push(ell(add(at, [side * .09, height! * .55, 0]), [.11, .035, .065], skin));
  if (height! > .5) {
    plants.push(ell(add(at, [0, height!, 0]), [.04, .04, .04], '#c5a05c'));
    for (let d = 0; d < 5; d++) plants.push(ell(add(at, [Math.cos(d * 2 * Math.PI / 5) * .065, height! + Math.sin(d * 2 * Math.PI / 5) * .065, 0]), [.055, .04, .02], '#c8b8ae'));
  }
}
part('compare-plant', 'comparison', plants);
marker('comparison-marker', 'comparison', [-3, .2, 3.5], .76);

function arc(cx: number, start: number, end: number): P[] {
  const path: V[] = Array.from({ length: 13 }, (_, i) => {
    const angle = (start + (end - start) * i / 12) * Math.PI / 180;
    return [n(1.4 * Math.sin(angle)), 0, n(-1.4 * Math.cos(angle))];
  });
  const angle = end * Math.PI / 180;
  return [sweep([cx, .145, 0], path, .015, '#7c7b6e'), { kind: 'cone', size: [.047, .13], at: [n(cx + 1.4 * Math.sin(angle)), .145, n(-1.4 * Math.cos(angle))], rotation: [90, 0, n(end - 90)], color: 'token:ink-2' }];
}
for (const [animal, cx, start] of [['frog', -2.8, 302], ['chicken', 2.8, 258]] as const) {
  part(`${animal}-next-generation`, `${animal}-cycle`, arc(cx, start, 346));
}
for (const [id, cx, count] of [['frog-tray', -2.8, 5], ['chicken-tray', 2.8, 3]] as const) {
  const marks: P[] = [{ kind: 'cylinder', size: [2.06, 2.1, .12], at: [cx, .055, 0], color: 'tissue', tint: '#c7c5b7' }];
  for (let stage = 0; stage < count - 1; stage++) marks.push(...arc(cx, stage * 360 / count + 14, (stage + 1) * 360 / count - 14));
  part(id, id === 'frog-tray' ? 'frog-cycle' : 'chicken-cycle', marks, { context: true, clip: false });
}
part('comparison-tray', 'comparison', [{ kind: 'bevelBox', size: [8, .12, 1.7], bevel: .035, at: [0, .08, 3.5], color: 'tissue', tint: '#c7c5b7' }], { context: true, clip: false });

const poses: Record<string, unknown> = {};
for (const [prefix, id, points, names] of [
  ['frog', 'frog-marker', frogPoints, ['egg', 'tadpole', 'hind-legs', 'froglet', 'adult']],
  ['chicken', 'chicken-marker', chickenPoints, ['egg', 'chick', 'adult']],
  ['compare', 'comparison-marker', [[-3, .2, 3.5], [-1, .2, 3.5], [1, .2, 3.5], [3, .2, 3.5]], ['frog', 'chicken', 'mosquito', 'plant']],
] as [string, string, V[], string[]][]) for (let i = 0; i < names.length; i++) poses[`${prefix}-at-${names[i]}`] = { [id]: { offset: points[i]!.map((v, j) => n(v - points[0]![j]!)) }, duration: .65 };
poses['egg-window-open'] = { 'egg-shell-window': { offset: [.8, .25, -.41], rotation: [0, 0, 0] }, duration: .65 };
await writeComparisonMeshes(meshRows,join(import.meta.dirname,'../../../public/models/frog-and-chicken.glb'));
const data = {
  model: '/models/frog-and-chicken.glb',
  parts,
  groups: [
    { id: 'frog-cycle', name: bi('Frog observations', '青蛙观察'), color: 'token:ink-2' },
    { id: 'chicken-cycle', name: bi('Chicken observations', '鸡的观察'), color: 'token:neutral' },
    { id: 'comparison', name: bi('Life-cycle comparison', '生活史比较'), color: 'token:cold' },
  ],
  flows: [], animations: [], poses,
  presets: editorial.presets,
  views: { assembled: { camera: { position: [10, 10, 14], target: [0, .4, 0], fov: 32 } }, cover: { position: [8, 9, 14], target: [0, .5, .6], fov: 32 }, shadows: 'contact', section: { plane: 'xz' } },
  spec: editorial.spec,
  sim: editorial.sim,
};
// Parse before writing, but keep author JSON rather than transformed pose schema.
partsFile.parse(data);
mkdirSync(join(out, '..'), { recursive: true });
writeFileSync(out, JSON.stringify(data, null, 2) + '\n');
process.stdout.write(`frog-and-chicken: ${parts.filter((p) => !p.context).length} selectable + ${parts.filter((p) => p.context).length} context; ${Object.keys(poses).length} poses\n`);
