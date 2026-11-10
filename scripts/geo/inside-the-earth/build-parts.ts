/**
 * Inside the Earth — original teaching geometry and finite snapshots.
 * Source contract: docs/48 §3. Run with pnpm tsx scripts/geo/inside-the-earth/build-parts.ts.
 * The four Earth radii are a teaching synthesis, not one seismic reference model.
 * Other lengths, snapshots and motion amplitudes are diagram design (S63).
 */
import assert from 'node:assert/strict';
import { sculptGeology } from './sculpt-geology';
import { beds, joints, section, shellGrain, trace } from './geology';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { feature } from 'topojson-client';
import type { FeatureCollection } from 'geojson';
import type { z } from 'zod';
import { partsFile, partSchema, primitiveSchema, poseSchema } from '../../../src/engines/space-scene/schema';
import { simSchema } from '../../../src/engines/space-scene/sim-schema';

type Primitive = z.input<typeof primitiveSchema>;
type Part = z.input<typeof partSchema>;
type Pose = z.input<typeof poseSchema>;
type V3 = [number, number, number];
type V2 = [number, number];
const bi = (en: string, zh: string) => ({ en, zh });
const parts: Part[] = [];
const poses: Record<string, Pose> = {};
const ink = 'token:mat-rock-dark';
const light = 'token:mat-rock-pale';
const muted = 'token:mat-rock';
const hot = 'token:hot';
const cold = 'token:cold';
const accent = 'token:accent-1';
const box = (size: V3, at: V3, tint = ink): Primitive => ({ kind: 'box', size, at, color: 'plastic', tint });
const sphere = (r:number,at:V3,tint=ink):Primitive=>({
  kind:'lathe',profile:Array.from({length:25},(_,k):V2=>k===0?[0,-r]:k===24?[0,r]:[r*Math.sin(Math.PI*k/24),-r*Math.cos(Math.PI*k/24)]),segments:32,at,color:'plastic',tint,
});
const extrude = (shape: V2[], depth: number, at: V3 = [0, 0, 0], tint = ink): Primitive => ({ kind: 'extrude', shape, depth, at, color: 'abrasive', tint });
const sweep = (path: V3[], radius: number | number[], tint = hot): Extract<Primitive, { kind: 'sweep' }> => ({ kind: 'sweep', path, radius, radial: 48, segments: 64, at: [0, 0, 0], color: 'plastic', tint, caps: 'flat' });
function add(id: string, en: string, zh: string, group: string, primitive: Primitive, summary: ReturnType<typeof bi>, detail: ReturnType<typeof bi>, options: Partial<Part> = {}) {
  const part: Part = { id, name: bi(en, zh), group, primitive, summary, detail, explode: { dir: [0, 1, 0], dist: 0 }, connects: [], castShadow: false, ...options };
  parts.push(part);
  return part;
}

// Closed annular meridians: the outer arc goes pole to pole, then the
// inner arc returns. Identical integer-derived radii meet without overlap.
function hemisphere(outer: number, inner: number): V2[] {
  const arc = (r: number): V2[] => Array.from({ length: 47 }, (_, k) => {
    if (k === 0) return [0, -r];
    if (k === 46) return [0, r];
    const t = Math.PI * k / 46;
    return [r * Math.sin(t), -r * Math.cos(t)];
  });
  const outerArc = arc(outer);
  return inner > 0 ? [...outerArc, ...arc(inner).reverse(), outerArc[0]!] : [...outerArc, outerArc[0]!];
}
const radii = [1, 6341 / 6371, 3485 / 6371, 1221 / 6371, 0];
const earth = [
  ['crust', 'Crust', '地壳', 'token:mat-crust', 'The crust is Earth’s thin rocky outer layer.', '地壳是地球外面很薄的岩石层。', "The shell uses a uniform land-crust example of about 30 km. Real crust varies in thickness, and oceanic crust can be much thinner. [S59, S63]", "薄壳统一采用约 30 千米的陆壳示例。真实地壳厚薄不同，海洋地壳可以薄得多。[S59, S63]"],
  ['mantle', 'Mantle', '地幔', 'token:mat-mantle', 'The mantle is mostly solid rock beneath the crust.', '地幔在地壳下方，大部分是固态岩石。', "Most mantle rock is solid, but it can slowly change shape over geological time. Its thickness here combines the cited Earth measurements to make a teaching model. Fine section grain is illustrative, not additional seismic layers. It is not a global magma ocean. [S6, S58, S59, S63]", "地幔岩石大部分是固态，却能在漫长地质时间内缓慢变形。模型根据所引地球尺寸画出厚度；剖面细纹仅为示意，不表示额外的地震分层；地幔不是全球岩浆海。[S6, S58, S59, S63]"],
  ['outer-core', 'Outer core', '外核', 'token:mat-outer-core', 'Liquid metal surrounds the solid inner core.', '液态金属包围着固态内核。', "The outer core is liquid metal. Its outer boundary is about 3,485 km from Earth's centre. The shell shows its position; volcanic magma does not come from it. [S58, S59, S10, S63]", "外核是液态金属，外边界离地心约 3485 千米。壳层显示它的位置，火山岩浆不来自这里。[S58, S59, S10, S63]"],
  ['inner-core', 'Inner core', '内核', 'token:mat-inner-core', 'The inner core is solid metal at Earth’s centre.', '内核是地心的固态金属。', "The inner core is solid metal with a radius of about 1,221 km. The sphere with a quarter wedge removed reveals the centre. A radius runs from the centre to the boundary, rather than all the way across. [S59, S63]", "内核是固态金属，半径约 1221 千米。球体切去四分之一楔形后露出中心。半径从中心量到边界，不是横跨整个内核的距离。[S59, S63]"],
];
earth.forEach(([id, en, zh, tint, sen, szh, den, dzh], i) => add(`earth-${id}`, en!, zh!, 'planet-shells', {
  kind: 'lathe', profile: hemisphere(radii[i]!, radii[i + 1]!), segments: 96, arc: 270, rotation: [0, -25, 0], at: [0, 0, 0], color: i < 3 ? 'plastic' : 'steel', tint,
}, bi(sen!, szh!), bi(den!, dzh!), { shell: i < 3, explode: { dir: [1, 0, 0], dist: [0.2, 0.15, 0.1, 0][i]! }, connects: i < 3 ? [`earth-${earth[i + 1]![0]}`] : [] }));

// Shell detail takes its shell's tint, as shipped (decision 17).
parts[1]!.extra = shellGrain(radii[2]!, radii[1]!).map((q) => ({ ...q, tint: 'token:mat-mantle' }));

// Geographic exterior engraved on the curved crust, never freehand land.
// Natural Earth 1:110m (public domain), redistributed by world-atlas 2.0.2.
// The fixed longitude offset presents Africa/Europe on the retained side.
const world = JSON.parse(readFileSync(new URL('../../../node_modules/world-atlas/land-110m.json', import.meta.url), 'utf8')) as Parameters<typeof feature>[0];
const land = feature(world, world.objects.land!) as unknown as FeatureCollection;
const coasts: V3[][] = [];
for (const f of land.features) {
  if (f.geometry?.type !== 'MultiPolygon') continue;
  for (const polygon of f.geometry.coordinates) {
    const ring = polygon[0]!;
    if (ring.length < 18) continue;
    let path: V3[] = [];
    const flush = () => { if (path.length > 5) coasts.push(path); path = []; };
    for (const coord of ring) {
      const phi = (coord[0]! + 70) * Math.PI / 180;
      const lat = coord[1]! * Math.PI / 180;
      if (Math.cos(phi) > Math.SQRT1_2 - 0.006) { flush(); continue; }
      const angle = phi - 25 * Math.PI / 180;
      path.push([1.002 * Math.cos(lat) * Math.sin(angle), 1.002 * Math.sin(lat), 1.002 * Math.cos(lat) * Math.cos(angle)]);
    }
    flush();
  }
}
parts[0]!.extra = coasts.sort((a, b) => b.length - a.length).slice(0, 12).map(path => {
  const step = Math.max(1, Math.ceil((path.length - 1) / 63));
  const reduced = path.filter((_, k) => k % step === 0);
  if (reduced.at(-1) !== path.at(-1)) reduced.push(path.at(-1)!);
  return { ...sweep(reduced, 0.0022, 'token:mat-crust'), radial: 8, segments: 64 };
});

// A thin mineral line remains inside the true 30 km shell section.
for(const angle of [-70,-160])for(const [a0,a1] of [[0.025,Math.PI/2-0.03],[Math.PI/2+0.03,Math.PI-0.025]]) {
  const line:V2[]=Array.from({length:33},(_,k)=>{const a=a0!+(a1!-a0!)*k/32,r=(1+radii[1]!)/2+0.00025*Math.sin(a*31);return [r*Math.sin(a),r*Math.cos(a)];});
  parts[0]!.extra!.push({...section(line,line.map(([x,y]):V2=>[x*1.0007,y*1.0007]),0.001,'token:mat-crust'),rotation:[0,angle,0]});
}

// The local plate is independently enlarged; it carries no Earth scale bar.
const plateScale = 0.45;
const plateLayers = [
  ['crust', 'Plate crust', '板块的地壳', 0.15, -1.31375, accent],
  ['rigid-mantle', 'Rigid uppermost mantle', '刚性最上部地幔', 0.65, -1.49375, ink],
  ['deep-mantle', 'Mantle below the plate', '板块下方地幔', 0.4, -1.73, muted],
] as const;
plateLayers.forEach(([id, en, zh, h, y, tint], i) => add(`plate-${id}`, en, zh, 'planet-shells', box([3 * plateScale, h * plateScale, plateScale], [0, y, 0], tint),
  bi(i < 2 ? 'This layer moves with the rest of the lithospheric plate.' : 'The mantle below the plate remains mostly solid.', i < 2 ? '这一层与岩石圈板块的其余部分一起移动。' : '板块下方的地幔仍大部分是固态。'),
  bi("Crust and rigid uppermost mantle form a plate together. This enlarged sample shows the thin layers clearly. Its thicknesses are chosen for the diagram, at a different scale from the globe. [S6, S7, S63]", "地壳和刚性的最上部地幔合成板块。放大小样让薄层更清楚；厚度供图解使用，与球体比例不同。[S6, S7, S63]"),
  { connects: i < 2 ? [`plate-${plateLayers[i + 1]![0]}`] : [] }));

// The independently enlarged plate reveals uneven mineral bands and joints.
for (const p of parts.filter(p => p.id.startsWith('plate-'))) {
  const q = p.primitive!;
  if (q.kind !== 'box') continue;
  const y0 = q.at[1] - q.size[1]! / 2, y1 = q.at[1] + q.size[1]! / 2;
  q.color = 'abrasive';
  p.extra = [
    ...Array.from({ length: 3 }, (_, k) => {
      const line = trace(-0.675, 0.675, x => y0 + (y1-y0)*(k+1)/4 + Math.sin(x*19+k)*Math.min(0.003,(y1-y0)/12));
      return section(line, line.map(([x,y]): V2 => [x,y+0.0015]), 0.002, k % 2 ? muted : ink, [0,0,0.226]);
    }), ...joints(-0.66,0.66,y0+0.003,y1-0.003,0.227,3),
  ];
}

// Four independent samples, all visible together. A main block and its
// crust extra belong to one logical part, so every transform carries both.
function plateBlock(id: string, en: string, zh: string, x: number, y: number, width: number, summary: ReturnType<typeof bi>, detail: ReturnType<typeof bi>) {
  const strata = beds(x-width/2, x+width/2, y-0.22, y+0.22, 0.7, 5);
  const top = trace(x-width/2, x+width/2, (a,t) => y+0.30 + 0.008*Math.sin(Math.PI*t)**2*Math.sin(a*26));
  const crust = section(trace(x-width/2,x+width/2,()=>y+0.22),top,0.7,accent);
  return add(id,en,zh,'boundary-blocks',strata[0]!,summary,detail,
    { extra: [crust,...strata.slice(1),...joints(x-width/2,x+width/2,y-0.21,y+0.29,0.351,3)] });
}
const boundaryDetail = bi("Crust and rigid uppermost mantle move together in this block. The model speeds up motion and simplifies the local shape. It does not mark a real map location. [S7, S45, S63]", "块体中的地壳与刚性的最上部地幔一起运动。模型加快运动，并简化局部形状，没有标出真实地图位置。[S7, S45, S63]");
for (const [side, x] of [['left', -1.35], ['right', -0.55]] as const) plateBlock(`edge-div-${side}`, `Spreading plate, ${side}`, `扩张板块${side === 'left' ? '左' : '右'}侧`, x, 0.78, 0.72,
  bi('Separating plates allow magma to rise and make new oceanic crust.', '板块分开时，岩浆可上升形成新海洋地壳。'), boundaryDetail);
// Shared join at x=.55, y=.78 (bottom) / 1.00 (top).
add('edge-sub-left', 'Incoming oceanic plate', '进入俯冲区的海洋板块', 'boundary-blocks', { ...box([0.6, 0.14, 0.7], [0.25, 0.85, 0], ink), color: 'abrasive' },
  bi('The incoming plate continues into the descending slab.', '进入俯冲区的板块与下降板片连续相接。'), boundaryDetail,
  { extra: [{ ...box([0.6, 0.08, 0.7], [0.25, 0.96, 0], accent), color: 'abrasive' }, ...joints(-0.04,0.54,0.79,0.99,0.351,3)], connects: ['edge-slab'] });
// Dense analytic meridian: horizontal at the incoming plate, with a
// continuous tangent all the way down. Keep the full rectangular join.
const slabTop: V2[] = Array.from({ length: 73 }, (_, k) => { const t = k / 72; return [0.55 + 1.05 * t, 1 - 0.91 * t * t]; });
const slabCrustBase: V2[] = slabTop.map(([x, y]) => [x, y - 0.08]);
const slabBottom: V2[] = slabTop.map(([x, y]) => [x, y - 0.22]);
add('edge-slab', 'Descending slab', '俯冲板片', 'boundary-blocks', extrude([...slabCrustBase, ...slabBottom.slice().reverse()], 0.7),
  bi('This continuous slab descends into the mantle.', '这块连续的板片向地幔下降。'),
  bi("The incoming plate continues into this descending slab across its full thickness. Water carried down by the rock helps some rock above it melt. The slab descends into the mantle; it is not a pipe from the core. [S7, S9, S63]", "进入俯冲区的板块与下降板片完整相接。岩石带下去的水帮助上方部分岩石熔融。板片向地幔下降，不是地核通出的管道。[S7, S9, S63]"),
  { extra: [extrude([...slabTop, ...slabCrustBase.slice().reverse()], 0.7, [0, 0, 0], accent),
    ...[0.03,0.13,0.18].map((d,k) => section(slabTop.map(([x,y]): V2 => [x,y-d-0.003]),slabTop.map(([x,y]): V2 => [x,y-d]),0.703,k===0 ? muted : light)),
  ], connects: ['edge-sub-left'] });
// The forearc rises out of a narrow trench into an imbricated wedge and
// a low volcanic arc. Smooth asymmetric crests replace triangular spikes.
const overrideTop = trace(0.64,1.78,x => 0.995 + 0.105*(1-Math.exp(-(((x-0.64)/0.10)**2))) + 0.065*Math.exp(-(((x-0.94)/0.13)**2)) + 0.20*Math.exp(-(((x-1.43)/0.11)**2)) + 0.012*Math.sin(x*39));
const overrideBase: V2[] = [[0.64,1-0.91*(0.09/1.05)**2],[0.78,0.96],[1.02,0.91],[1.34,0.72],[1.78,0.72]];
const overrideCrust = overrideTop.map(([x,y]): V2 => [x,y+0.08*Math.min(1,(x-0.64)/0.17)]);
add('edge-sub-right','Overriding plate','上覆板块','boundary-blocks',section(overrideBase,overrideTop,0.7,ink),
  bi('The overriding plate sits above the descending slab.', '上覆板块位于下降板片上方。'),boundaryDetail,
  { extra: [section(overrideTop,overrideCrust,0.7,accent),
    ...Array.from({length:5},(_,k) => {
      const line = trace(0.79,1.13,x => 1.005 + k*0.021 + 0.10*(x-0.79) + 0.005*Math.sin(x*31+k));
      return section(line,line.map(([x,y]): V2 => [x,y+0.006]),0.703,k%2 ? muted : light);
    }), ...joints(1.15,1.76,0.82,1.11,0.352,4)], connects: ['edge-slab'] });
add('edge-melt', 'Partial melting above the slab', '板片上方的部分熔融', 'boundary-blocks', { ...sphere(0.13, [1.22, 0.71, 0.42], hot), scale: [1.3, 0.65, 0.7] },
  bi('Water from the slab helps some rock above it melt.', '板片释放的水有助于上方部分岩石熔融。'),
  bi("Some rock melts in this small region above the slab. The region is enlarged so we can see it; most mantle rock stays solid. [S9, S63]", "板片上方这片小区域有部分岩石熔融。区域已放大，方便观察；地幔大部分岩石仍是固态。[S9, S63]"));
for (const [side, x] of [['left', -1.35], ['right', -0.55]] as const) {
  const p = plateBlock(`edge-trans-${side}`, `Transform plate, ${side}`, `转换板块${side === 'left' ? '左' : '右'}侧`, x, -0.8, 0.76,
    bi('This plate slides horizontally past its neighbour.', '这块板块沿水平方向错过相邻板块。'), boundaryDetail);
  p.extra!.push(box([0.76, 0.018, 0.06], [x, -0.49, 0], ink));
}
const foldTop = trace(0.08,1.78,x => -0.55 + 0.32*Math.exp(-(((x-1.08)/0.18)**2)) + 0.19*Math.exp(-(((x-0.72)/0.14)**2)) + 0.075*Math.exp(-(((x-1.37)/0.09)**2)) + 0.008*Math.sin(x*37));
const foldContacts = Array.from({length:7},(_,k) => foldTop.map(([x,y]): V2 => [x,-1.02+(y+1.10)*k/6]));
const folds = foldContacts.slice(1).map((line,k) => section(foldContacts[k]!,line,0.7,k===5 ? accent : k%2 ? muted : ink));
add('collision-fold', 'Continental collision', '大陆碰撞', 'boundary-blocks', folds[0]!,
  bi('Converging continents can build mountains.', '大陆靠近碰撞可以形成山脉。'),
  bi("Colliding continents can form mountains. Compare this example with oceanic subduction: the volcanic arrangement can differ. Folds and layer thicknesses are simplified in the model. [S7, S63]", "大陆碰撞可形成山脉。与海洋板块俯冲相比，火山分布可以不同。模型简化了褶皱和岩层厚度。[S7, S63]"),
  {extra:[...folds.slice(1),...joints(0.15,1.7,-0.99,-0.6,0.352,5)]});

// A single volcanic opening and a local, crystal-bearing storage body.
// Stratovolcano: shallow foot, progressively steeper upper flanks, a
// rounded lip and recessed crater. The cut face carries nested strata.
const flankRadius = (y: number) => 0.19 + 1.01 * (1 - y / 1.32) ** 1.65;
const flank: V2[] = Array.from({ length: 41 }, (_, k) => { const y = 1.32 * k / 40; return [flankRadius(y), y]; });
// The crater wall, terraced floor and throat share the same meridian.
// No decorative torus: the rocky lip is part of this continuous volume.
const crater: V2[] = [[0.18,1.326],[0.165,1.323],[0.145,1.301],[0.132,1.27],[0.115,1.22],[0.10,1.19],[0.085,1.18],[0.075,1.14]];
const coneProfile: V2[] = [...flank,...crater,[0.075,0],[1.2,0]];
const strata: Primitive[] = Array.from({length:11},(_,k) => {
  const f = 0.20 + k*0.067, extent = 1.19*f;
  const line = trace(-extent,extent,(x) => {
    const t = Math.abs(x)/extent;
    return 1.28*f*(1-t**0.64) + 0.008*Math.sin(x*32+k)*Math.sin(Math.PI*t);
  },65);
  return section(line,line.map(([x,y]): V2 => [x,y+0.009+0.003*Math.sin(x*25+k)]),0.004,k%3===0 ? accent : k%2 ? ink : muted,[0,0,0.003]);
});
add('volcano-cone', 'Cone', '火山锥', 'volcano-system', { kind: 'lathe', profile: coneProfile, segments: 96, arc: 180, at: [0, 0, 0], color: 'abrasive', tint: muted },
  bi('Rock builds the cone around a surface opening.', '岩石围着地表开口形成火山锥。'),
  bi("Rock forms this cone around one top opening. The cutaway simplifies the slopes and layers; it does not copy a named volcano's dimensions. [S10, S63]","岩石围着顶部开口形成火山锥。剖面简化了坡度和岩层，没有复制具名火山的尺寸。[S10, S63]"),
  { extra: [...strata,...Array.from({length:13},(_,k): Primitive => {
    const a=0.13+(k*0.733)%2.8, y0=0.015+(k%4)*0.035, y1=0.6+((k*7)%11)*0.058;
    const path: V3[]=Array.from({length:28},(_,i)=>{
      const t=i/27,y=y0+(y1-y0)*t,aa=a+0.018*Math.sin(t*9+k)+0.025*t*t;
      const r=flankRadius(y)+0.002;
      return [r*Math.cos(aa),y,-r*Math.sin(aa)];
    });
    return {...sweep(path,Array.from({length:28},(_,i)=>0.002+0.012*Math.sin(Math.PI*i/27)**0.7),k%3 ? ink : muted),radial:8,segments:32,section:{flat:0.1},up:[Math.cos(a),0,-Math.sin(a)],color:'abrasive'};
  })], shell: true, explode: { dir: [1, 0, 0], dist: 0.3 }, chainName: bi('Cone', '火山锥'), connects: ['volcano-host'] });
// A shared irregular roof/floor contour guarantees the storage body and
// the rock aperture meet exactly; no detached oval or empty cave.
const storageHole: V2[] = Array.from({ length: 64 }, (_, k) => {
  const a = 2 * Math.PI * k / 64;
  const lobe = 1 + 0.10 * Math.sin(3 * a + 0.4) + 0.055 * Math.cos(5 * a);
  return [0.45 * Math.cos(a) * lobe, -0.43 + 0.23 * Math.sin(a) * lobe];
});
add('volcano-host', 'Host rock', '围岩', 'volcano-system', { ...extrude([[-1.35, -0.82], [1.35, -0.82], [1.35, 0], [-1.35, 0]], 0.62, [0, 0, -0.31], ink), color:'abrasive', holes: [storageHole] } as Primitive,
  bi('Solid rock surrounds the local magma system.', '固态围岩包围着局部岩浆系统。'),
  bi("Solid rock surrounds the magma storage region. The cutaway ends just below it. No conduit connects the storage region to Earth's core. [S10, S63]", "固态岩石包围岩浆储存区，剖面在其下方结束。储存区没有通往地核的通道。[S10, S63]"),
  { extra:[...[-0.1,-0.27,-0.49,-0.72].flatMap((y,k)=>[[-1.34,-0.55],[0.55,1.34]].map(([a,b])=>{const line=trace(a!,b!,x=>y+0.01*Math.sin(x*11+k));return section(line,line.map(([x,y]): V2=>[x,y+0.004]),0.002,muted,[0,0,0.002]);})),...joints(-1.3,-0.6,-0.8,-0.01,0.003,3),...joints(0.6,1.3,-0.8,-0.01,0.003,3)], shell: true, explode: { dir: [-1, 0, 0], dist: 0.3 }, chainName: bi('Rock', '围岩'), connects: ['volcano-storage'] });
add('volcano-storage', 'Magma storage', '岩浆储存区', 'volcano-system', extrude(storageHole, 0.3, [0, 0, -0.15], hot),
  bi('Magma collects locally with crystals in the storage region.', '岩浆与晶体在局部储存区共存。'),
  bi("Melt and crystals can share a magma storage region. The pale crystals are enlarged to make them visible. This region contains material; it is not an empty cave or the core. [S10, S63]", "岩浆储存区可以同时有熔体和晶体。浅色晶体已放大，方便看清。这里装着物质，不是空洞或地核。[S10, S63]"),
  { extra: Array.from({ length: 11 }, (_, k) => ({ kind:'lathe',profile:[[0,-0.03],[0.014,-0.018],[0.016,0.015],[0,0.033]],segments:6,scale:[0.8+(k%3)*0.12,0.8+(k%4)*0.15,0.85+(k%2)*0.2],at:[0.31*Math.cos(k*2.4),-0.43+0.12*Math.sin(k*2.4),0.007],rotation:[k*13,0,k*37],color:'enamel',tint:light } as Primitive)), chainName: bi('Storage', '储存区'), connects: ['volcano-conduit'] });
const conduitPath: V3[] = [[-0.02, -0.25, 0.018], [-0.045, 0.1, 0.018], [0.035, 0.49, 0.018], [-0.025, 0.9, 0.018], [0, 1.08, 0.008], [0, 1.14, 0], [0, 1.18, 0], [0,1.19,0], [0,1.22,0]];
add('volcano-conduit', 'Conduit', '岩浆通道', 'volcano-system', sweep(conduitPath, [0.072, 0.067, 0.06, 0.065, 0.065, 0.075, 0.085, 0.10, 0.115]),
  bi('This passage connects local magma storage to the opening.', '这条通道把局部岩浆储存区接到喷发口。'),
  bi("Magma fills this passage from the storage region to the vent. Real volcanic passages can be more complicated. This local route does not connect to the core. [S10, S63]", "岩浆填满从储存区到喷发口的通道。真实火山通道可以更复杂。这条局部路线不通往地核。[S10, S63]"),
  { extra: [
    sweep([conduitPath[1]!, [-0.21, 0.25, 0.018], [-0.4, 0.48, 0.018], [-0.47, 0.68, 0.018]], [0.045, 0.034, 0.025, 0.006]),
    sweep([conduitPath[2]!, [0.19, 0.58, 0.018], [0.32, 0.77, 0.018]], [0.035, 0.024, 0.006]),
    { ...sweep([conduitPath[1]!, [0.2, 0.13, 0.018], [0.54, 0.14, 0.018], [0.72, 0.18, 0.018]], [0.033, 0.038, 0.028, 0.006]), section: { flat: 0.45 }, up: [0, 1, 0] },
  ], chainName: bi('Conduit', '通道'), connects: ['volcano-storage', 'volcano-vent'] });
// The conduit itself flares continuously to the crater floor. This small
// meniscus closes the filled opening without a coincident second pipe wall.
add('volcano-vent','Vent','喷发口','volcano-system',{
  kind:'lathe',profile:[[0,1.218],[0.114,1.218],[0.115,1.22],[0.111,1.223],[0,1.223],[0,1.218]],segments:64,at:[0,0,0],color:'enamel',tint:hot,
},bi('Gas, fragments or lava can reach the surface at this opening.','气体、碎屑或熔岩可从这个开口到达地表。'),
  bi("The flared throat joins the conduit to the crater floor inside the rocky summit rim. The vent is an opening, rather than another underground chamber. [S10, S63]","喇叭形出口把通道接到岩质顶缘内的火山口底部。喷发口是开口，不是另一个地下空腔。[S10, S63]"),
  {chainName:bi('Vent','喷发口'),connects:['volcano-conduit','volcano-lava']});
add('volcano-bubbles', 'Bubbles', '气泡', 'volcano-system', sphere(0.024, [0, 0.62, 0.092], light),
  bi('Gas can form expanding bubbles as magma rises and pressure falls.', '岩浆上升、压力降低时，气体可析出并形成膨胀气泡。'),
  bi("Gas bubbles can grow as magma rises. The pale bubbles are enlarged and repeated for visibility. Their positions and number do not measure pressure or determine when an eruption starts. [S10, S63]", "岩浆上升时，气泡可以膨胀。浅色气泡经过放大并重复显示，方便看清。位置和数量不表示压力，也不能确定喷发何时开始。[S10, S63]"),
  { repeat: { count: 6, axis: [0, 1, 0], spacing: 0.14 }, chainName: bi('Bubbles', '气泡') });
// The half cone fills z ≤ 0 (lathe arc 180 from +X through −Z to −X), so the
// flow lies on its exterior a little behind the cut edge, not in front of the
// cut plane; `up` +Y keeps the flattened ribbon tangent to the flank.
const lavaAz = 9 * Math.PI / 180;
const onFlank = (r: number, y: number, da = 0): V3 => [r * Math.cos(lavaAz + da), y, -r * Math.sin(lavaAz + da)];
const lavaPath: V3[] = [onFlank(0.10,1.222),onFlank(0.116,1.226),onFlank(0.133,1.274),onFlank(0.165,1.328),onFlank(0.19,1.325),...[1.25,1.16,0.82,0.48,0.19,0.025].map((y,k): V3=>onFlank(flankRadius(y)+0.007,y,0.012*Math.sin(k*1.7)))];
add('volcano-lava', 'Lava', '熔岩', 'volcano-system', { ...sweep(lavaPath, [0.018,0.018,0.019,0.023,0.026,0.033,0.045,0.07,0.1,0.13,0.1]), section: { flat: 0.16 }, up: [0, 1, 0] },
  bi('Magma that reaches the surface is called lava.', '岩浆喷到地表后叫熔岩。'),
  bi("Compare this lava sample on the slope with the ash beside it. The model shows a flow path, without predicting how far real lava would travel. [S10, S45, S63]", "把坡面熔岩与旁边的火山灰比较。模型显示流动路径，不预测真实熔岩能流多远。[S10, S45, S63]"),
  { extra: [
    { ...sweep([lavaPath[8]!, onFlank(1.2, 0.03, -0.06), onFlank(1.3, 0.018, -0.1)], [0.06, 0.09, 0.065]), section: { flat: 0.14 }, up: [0, 1, 0] },
    { ...sweep([lavaPath[9]!, onFlank(1.22, 0.02, 0.07), onFlank(1.31, 0.016, 0.1)], [0.065, 0.1, 0.08]), section: { flat: 0.14 }, up: [0, 1, 0] },
  ], chainName: bi('Lava', '熔岩'), connects: ['volcano-vent'] });
// One reusable uneven grain, arbitrary orientations, a narrowing jet and
// widening billows. eachPieces groups these into one InstancedMesh.
const grainProfile: V2[] = [[0, -0.016], [0.017, -0.008], [0.013, 0.006], [0.007, 0.017], [0, 0.021]];
const grains: Primitive[] = Array.from({ length: 33 }, (_, k) => {
  const t = k / 32;
  const angle = k * 2.399963;
  const width = t < 0.35 ? 0.02 + t * 0.13 : 0.15 + 0.15 * Math.sin((t - 0.35) / 0.65 * Math.PI / 2);
  const r = width * Math.sqrt(((k * 17) % 33 + 0.5) / 33);
  return { kind: 'lathe', profile: grainProfile, segments: 12, scale: [1, 0.85, 0.65], at: [r * Math.cos(angle) + 0.09 * t * t, 1.4 + t * 0.78, r * Math.sin(angle) - 0.035], rotation: [k * 47, k * 83, k * 29], color: 'plastic', tint: ink };
});
add('volcano-ash', 'Ash', '火山灰', 'volcano-system', grains[0]!,
  bi('Volcanic ash consists of small rock, mineral and glass fragments.', '火山灰由细小岩石、矿物与玻璃碎屑组成。'),
  bi("Volcanic ash fragments are less than 2 mm in diameter under the definition used here. The enlarged pieces stay beside the lava for comparison. They remain a material sample; their plume arrangement does not simulate an eruption cloud. [S65, S63]", "按这里采用的定义，火山灰碎屑直径小于 2 毫米。放大的碎屑与熔岩并列供比较，仍表示材料样本；羽流排列不是模拟喷发云。[S65, S63]"),
  { extra: grains.slice(1), repeat: { count: 7, axis: [0, 1, 0], radius: 0.025 }, chainName: bi('Ash', '火山灰') });

// Fault and two distinct marker rows. Surface markers are segmented at
// the locked contact, so bending can be shown without a sliding contact.
for (const [side,x] of [['left',-0.765],['right',0.765]] as const) {
  const layers = beds(x-0.735,x+0.735,0.55,1.25,1,9);
  add(`fault-${side}`,`Fault block, ${side}`,`断层${side==='left' ? '左' : '右'}侧岩块`,'ground-and-waves',layers[0]!,
    bi('Rock stores elastic strain before sudden fault slip.','断层突然滑动前，岩石储存弹性应变能。'),
    bi("The rocks deform before suddenly slipping sideways, without magma. The movement is enlarged for viewing. It cannot predict an earthquake's time or place. [S6, S12, S63]","岩石先变形，再突然水平滑动，过程中没有岩浆。位移已放大，方便观察，不能预测地震的时间或地点。[S6, S12, S63]"),
    {extra:[...layers.slice(1),...joints(x-0.72,x+0.72,0.56,1.24,0.501,6),...joints(x-0.72,x+0.72,0.56,1.24,-0.501,5),
      ...Array.from({length:6},(_,k):Primitive=>{
        const path:V3[]=Array.from({length:21},(_,i)=>{const z=-0.49+i*0.98/20,xx=x-0.64+k*0.24+0.018*Math.sin(z*13+k);return [xx,1.25-0.007*(0.5+0.5*Math.sin(xx*23+(xx-(x-0.735))/1.47))+0.0005,z];});
        return {...sweep(path,0.002,ink),radial:6,segments:24,section:{flat:0.2},up:[0,1,0],color:'abrasive'};
      })]});
}
for (const [side, a, b] of [['left', -1.4, -0.18], ['lock', -0.18, 0.18], ['right', 0.18, 1.4]] as const) add(`fault-marker-${side}`, side === 'lock' ? 'Locked marker segment' : `Marker band, ${side}`, side === 'lock' ? '锁定段标记' : `${side === 'left' ? '左' : '右'}侧标记带`, 'ground-and-waves', extrude([[a, 1.256], [b, 1.256], [b, 1.272], [a, 1.272]], 0.065, [0, 0, 0.17], accent),
  bi(side === 'lock' ? 'The contact stays locked while the outer marker arms turn.' : 'This surface marker makes bending and offset visible.', side === 'lock' ? '外侧标记臂偏转时，接触段保持锁定。' : '地表标记让变形与错距可见。'),
  bi("The coloured band helps us see deformation; it is not another rock layer. Each outer arm turns around its contact end while the middle stays locked. After slip, the two sides are offset. [S12, S63]", "有色带帮助我们看清变形，不是另一层岩石。中间锁定时，两侧标记臂绕接触端转动。滑动后，两边留下错距。[S12, S63]"));
add('fault-focus', 'Focus', '震源', 'ground-and-waves', sphere(0.06, [0, 0.83, 0.04], hot),
  bi('The earthquake rupture starts at the focus.', '地震破裂从震源开始。'), bi("The enlarged sphere marks where rupture starts inside the fault. It shows one starting place, rather than the whole fault surface. [S12, S63]", "放大小球标出断层内部破裂的起点。它表示一个起始位置，不是整个断层面。[S12, S63]"));
add('fault-epicentre', 'Epicentre', '震中', 'ground-and-waves', { kind: 'cylinder', size: [0.085, 0.085, 0.012], at: [0, 1.285, 0.04], color: 'plastic', tint: hot },
  bi('The epicentre is on the surface directly above the focus.', '震中位于震源正上方的地表。'), bi("The disc sits directly above the focus on the surface. This point need not be the place that shakes most strongly. [S12, S63]", "圆盘位于震源正上方的地表。这个点未必是震得最强的地方。[S12, S63]"));
const letters = 'abcdefghijklmnopq'.split('');
const waveIds: string[] = [];
for (const [kind, y] of [['p', -0.35], ['s', -0.9]] as const) letters.forEach((letter, i) => {
  const id = `wave-${kind}-${letter}`;
  waveIds.push(id);
  add(id, `${kind.toUpperCase()}-wave marker ${letter.toUpperCase()}`, `${kind.toUpperCase()}波标记${letter.toUpperCase()}`, 'ground-and-waves', sphere(0.047, [-1.6 + 0.4 * (0.5 * i), y, 0.06], kind === 'p' ? accent : cold),
    bi(kind === 'p' ? 'This rock marker moves parallel to the wave’s travel direction.' : 'This rock marker moves across the wave’s travel direction.', kind === 'p' ? '这枚岩石标记沿波传播的方向振动。' : '这枚岩石标记垂直于波传播方向振动。'),
    bi(`The marker moves back and forth near its starting place while the wavefront travels on. Compare this ${kind.toUpperCase()} row with the other row. Positions, vibration size, cycle rate and speed are chosen for the diagram. The unit du means diagram units, rather than metres. [S60, S63]`, `波前向远处传播，标记只在原位附近往返。把这排 ${kind.toUpperCase()} 波与另一排比较。位置、振动幅度、频率和速度均供图解使用；du 表示图解单位，不是米。[S60, S63]`));
});

// Water markers encode signed displacement; they are not moving parcels
// tracked by a hydrodynamic solver. All three source blocks remain joined.
for (const [id, x, w] of [['sea-bed', 0, 0.4], ['sea-bed-left', -0.9, 1.4], ['sea-bed-right', 0.9, 1.4]] as const) add(id, id === 'sea-bed' ? 'Central seafloor source' : `Seafloor source, ${x < 0 ? 'left' : 'right'}`, id === 'sea-bed' ? '中心海床源区' : `${x < 0 ? '左' : '右'}侧海床源区`, 'water-and-structures', box([w, 0.15, 0.65], [x, -0.075, 0], ink),
  bi('Sudden vertical seafloor movement can displace the water above.', '海床突然垂直移动，可以移开上方海水。'),
  bi("The central seabed rises while its neighbours move down, displacing water above. The switch controls this source only. Landslides and volcanic processes can also cause tsunamis. [S13, S14, S63]", "中央海床上升，相邻部分下降，带动上方海水。开关只控制这个位移源；滑坡和火山过程也能引发海啸。[S13, S14, S63]"));
// The three moving seafloor samples retain their exact shared boundaries;
// rock grain is confined to the exposed section face, so snapshots balance.
for(const p of parts.filter(p=>['sea-bed','sea-bed-left','sea-bed-right'].includes(p.id))) {
  const q=p.primitive!;if(q.kind!=='box')continue;q.color='abrasive';
  const x0=q.at[0]-q.size[0]!/2,x1=q.at[0]+q.size[0]!/2;
  p.extra=[...[-0.04,-0.085,-0.12].map((y,k)=>{const line=trace(x0,x1,x=>y+.002*Math.sin(x*19+k));return section(line,line.map(([x,y]):V2=>[x,y+.0015]),.0015,k%2?muted:light,[0,0,.326]);}),...joints(x0+.005,x1-.005,-.148,-.003,.327,3)];
}

const waterIds = ['sea-bed', 'sea-bed-left', 'sea-bed-right'];
letters.forEach((letter, i) => {
  const id = `sea-column-${letter}`;
  waterIds.push(id);
  const x = 0.2 * (i - 8);
  add(id, `Water-depth marker ${letter.toUpperCase()}`, `水深标记${letter.toUpperCase()}`, 'water-and-structures', box([0.008, 0.26, 0.008], [x, 0.25, 0.08], cold),
    bi('This depth marker represents disturbance through the water depth.', '这枚水深标记表示扰动涉及整个水深。'),
    bi("The line and two dots form one selectable marker for the whole water depth. The symbol is enlarged. The snapshots balance upward and downward movements; they do not calculate currents, energy, flooding or real arrival times. [S15, S63]", "细线和两点组成一个可选标记，表示整个水深，符号已放大。快照中的向上与向下位移保持平衡，不计算洋流、能量、淹没或真实到达时间。[S15, S63]"),
    { extra: [sphere(0.023, [x, 0.12, 0.08], cold), sphere(0.023, [x, 0.38, 0.08], cold)] });
});
// A separate nearshore section and two low long-wave profiles. No breaker.
const coastWave = (x0: number, length: number, amp: number): Primitive => {
  const points: V3[] = Array.from({ length: 25 }, (_, i) => [x0 + length * i / 24, -0.7 + amp * Math.sin(Math.PI * 2 * i / 24), 0.18]);
  return { ...sweep(points, 0.018, cold), section: { flat: 0.6 }, up: [0, 0, 1] };
};
add('sea-coast', 'Shore sample', '近岸小样', 'water-and-structures', section(trace(-1.6,1.6,()=>-1.18),trace(-1.6,1.6,x=>-1.06+0.43/(1+Math.exp(-(x-0.66)*3.3))),0.6,muted,[0,0,-0.04]),
  bi('A long wave slows in shallower water and its height may grow.', '长波进入浅水后减速，波高可能增加。'),
  bi("Compare a longer, lower wave with a shorter, higher one in this separate shore sample. The shallow-water view stretches the drawn height. The speed formula does not calculate wave height, flooding or breaking waves. [S15, S63]", "在独立近岸小样中，比较较长较低与较短较高的波。浅水视图放大了图中的高度。速度公式不计算波高、淹没或波浪破碎。[S15, S63]"),
  { extra: [coastWave(-1.5, 1.8, 0.045), coastWave(0.55, 0.75, 0.1),...[0.025,0.055,0.085].map((d,k)=>{const line=trace(-1.6,1.6,x=>-1.06+0.43/(1+Math.exp(-(x-0.66)*3.3))-d);return section(line,line.map(([x,y]):V2=>[x,y+0.003]),0.002,k%2 ? ink : light,[0,0,0.262]);})] });

// A generic four-floor structure. All upper parts share one foundation-top
// pivot, so they remain connected in the exaggerated ±1 degree poses.
// The main primitive is the front strip beyond the foundation, so the leader
// lands on ground that shows; the rest is the same slab.
add('building-ground', 'Ground', '地面', 'water-and-structures', box([1.65, 0.22, 0.14], [0, -0.26, 0.53], muted),
  bi('Moving ground supplies the motion at the foundation.', '移动的地面把运动传到基础。'), bi("Ground motion reaches the building through its foundation. Ground conditions affect how the structure responds. This general sample has no fault below it and does not copy surveyed Singapore soil. [S25, S63]", "地面运动通过基础传到建筑。地面条件会影响结构反应。通用小样下方没有断层，也没有复制新加坡实测土层。[S25, S63]"), { extra: [box([1.65, 0.22, 1.06], [0, -0.26, -0.07], muted)], connects: ['building-foundation'] });
add('building-foundation', 'Foundation', '基础', 'water-and-structures', box([1.2, 0.3, 0.92], [0, -0.15, 0], ink),
  bi('The foundation connects the structure to the ground.', '基础把结构连接到地面。'), bi("The foundation supports the building at the ground. Its width and depth help make the diagram clear. The sample specifies no isolation device, piles or building-code values and cannot assess a real building. [S25, S63]", "基础在地面处支撑建筑。宽度和深度方便图解说明。小样没有指定隔震装置、桩基或规范数值，不能评估真实建筑。[S25, S63]"), { connects: ['building-ground', 'building-frame', 'building-core'] });
const frame: Primitive[] = [];
// The first piece is the front column between two floor slabs, so the leader anchor is not buried in a slab.
frame.push(box([0.075, 0.55, 0.075], [0.45, 0.975, 0.35], ink), box([0.075, 0.7, 0.075], [0.45, 0.35, 0.35], ink), box([0.075, 1.35, 0.075], [0.45, 1.925, 0.35], ink));
for (const [x, z] of [[0.45, -0.35], [-0.45, 0.35], [-0.45, -0.35]] as const) frame.push(box([0.075, 2.6, 0.075], [x, 1.3, z], ink));
for (const y of [0.65, 1.3, 1.95, 2.6]) {
  for (const z of [-0.35, 0.35]) frame.push(box([0.98, 0.07, 0.07], [0, y, z], ink));
  for (const x of [-0.45, 0.45]) frame.push(box([0.07, 0.07, 0.78], [x, y, 0], ink));
}
add('building-frame', 'Frame', '框架', 'water-and-structures', frame[0]!,
  bi('Connected beams and columns support this generic structure.', '相连的梁柱支撑这件通用结构。'),
  bi("The open frame reveals connections between beams and columns. Good connections and suitable bracing matter. The model enlarges movement and uses general dimensions, without copying an HDB plan or a measured Singapore building. [S25, S63]", "开放框架露出梁柱之间的连接。正确连接和合适支撑很重要。模型放大运动并采用通用尺寸，没有复制组屋图纸或实测新加坡建筑。[S25, S63]"),
  { extra: frame.slice(1), connects: ['building-foundation', 'building-floors', 'building-core'] });
add('building-floors', 'Floors', '楼板', 'water-and-structures', box([1, 0.065, 0.8], [0, 1.625, 0], light),
  bi('Floor slabs connect to the frame and structural wall in this sample.', '本样本的楼板与框架和结构墙相连。'),
  bi("The floors, frame and wall turn together so their connections stay joined. The repeated floors are chosen for the diagram; their count does not describe a real building. [S25, S63]", "楼板、框架和墙一起转动，连接处保持相接。重复楼板供图解使用，层数不代表真实建筑。[S25, S63]"),
  { repeat: { count: 4, axis: [0, 1, 0], spacing: 0.65 }, connects: ['building-frame', 'building-core'] });
// Same wall in two pieces; the main one ends between floor slabs so its leader anchor is not buried in one.
add('building-core', 'Structural wall', '结构墙', 'water-and-structures', box([0.36, 1.9, 0.09], [0, 0.95, -0.2], accent),
  bi('This wall is connected to the frame, floors and foundation.', '这面墙与框架、楼板和基础相连。'),
  bi("This wall shows one way to support a structure, without representing every Singapore building. Ground conditions and vibration characteristics affect the response. Height alone cannot tell us safety. [S25, S63]", "这面墙显示一种结构支撑方式，不代表所有新加坡建筑。地面条件和振动特性会影响反应，单凭高矮不能判断安全。[S25, S63]"),
  { extra: [box([0.36, 0.7, 0.09], [0, 2.25, -0.2], accent)], connects: ['building-foundation', 'building-frame', 'building-floors'] });

// The generic structural sample uses a matte mineral finish for concrete.
for(const p of parts.filter(p=>p.id.startsWith('building-')))for(const q of [p.primitive!,...(p.extra??[])])q.color='abrasive';

// Non-simulation poses never take ownership of the wave or source glyphs.
poses['edge-open'] = { duration: 0.6, 'edge-div-left': { offset: [-0.2, 0, 0] }, 'edge-div-right': { offset: [0.2, 0, 0] } };
poses['edge-slide'] = { duration: 0.6, 'edge-trans-left': { offset: [0, 0, 0.2] }, 'edge-trans-right': { offset: [0, 0, -0.2] } };
poses['magma-rising'] = { duration: 0.6, 'volcano-bubbles': { offset: [0, 0.1, 0] } };
poses['magma-gas'] = { duration: 0.6, 'volcano-bubbles': { offset: [0, 0.16, 0], scale: 1.5 } };
poses['fault-loaded'] = { duration: 0.6,
  'fault-marker-left': { pivot: [-0.18, 1.264, 0.17], rotation: [0, 6, 0] },
  'fault-marker-lock': { offset: [0, 0, 0] },
  'fault-marker-right': { pivot: [0.18, 1.264, 0.17], rotation: [0, 6, 0] },
};
poses['fault-slipped'] = { duration: 0.6,
  'fault-left': { offset: [0, 0, 0.15] }, 'fault-right': { offset: [0, 0, -0.15] },
  'fault-marker-left': { offset: [0, 0, 0.15] }, 'fault-marker-lock': { offset: [0, 0, 0] }, 'fault-marker-right': { offset: [0, 0, -0.15] },
};
poses['sea-shallow'] = { duration: 0.6, 'sea-coast': { pivot: [0, -1.18, 0], scale: [1, 1.18, 1] } };
for (const [name, sign] of [['positive', 1], ['negative', -1]] as const) poses[`building-${name}`] = {
  duration: 0.6,
  'building-ground': { offset: [sign * 0.02, 0, 0] }, 'building-foundation': { offset: [sign * 0.02, 0, 0] },
  ...Object.fromEntries(['frame', 'floors', 'core'].map(id => [`building-${id}`, { pivot: [0, 0, 0], rotation: [0, 0, sign], offset: [sign * 0.02, 0, 0] }])),
};

const steps = Array.from({ length: 9 }, (_, k) => k);
function waveOffset(kind: 'p' | 's', k: number, i: number): V3 {
  const x = i * 0.5;
  const tau = 0.25 * k - x / (kind === 'p' ? 4 : 2);
  const u = tau < 0 || tau > 1 ? 0 : 0.08 * Math.sin(2 * Math.PI * tau);
  return kind === 'p' ? [u, 0, 0] : [0, u, 0];
}
function eta(j: number, q: number): number {
  if (q === 0) return 0;
  const d = 0.5 * (q - 1);
  const K = (v: number) => Math.max(0, 1 - Math.abs(v));
  return 0.12 / 2 * (K(j - d) + K(j + d) - K(j - 1 - d) - K(j + 1 + d));
}
for (const k of steps) {
  poses[`wave-snap-${k}`] = { duration: 0, ...Object.fromEntries((['p', 's'] as const).flatMap(kind => letters.map((letter, i) => [`wave-${kind}-${letter}`, { offset: waveOffset(kind, k, i) }])))};
  poses[`sea-snap-${k}`] = { duration: 0,
    'sea-bed': { offset: [0, k === 0 ? 0 : 0.06, 0] },
    'sea-bed-left': { offset: [0, k === 0 ? 0 : -0.03, 0] },
    'sea-bed-right': { offset: [0, k === 0 ? 0 : -0.03, 0] },
    ...Object.fromEntries(letters.map((letter, i) => [`sea-column-${letter}`, { offset: [0, eta(i - 8, k), 0] }])),
  };
  assert(Math.abs(letters.reduce((sum, _, i) => sum + eta(i - 8, k), 0)) < 1e-12, `unbalanced water snapshot ${k}`);
}
const shapeStates = (prefix: string, rest: string) => Object.fromEntries(steps.map(k => [k === 0 ? rest : `${prefix}-at-${k}`, bi(k === 0 ? 'At rest' : `Snapshot ${k}`, k === 0 ? '静止' : `快照${k}`)]));
const sim: z.input<typeof simSchema> = {
  kind: 'table',
  controls: [
    { id: 'wave-kind', kind: 'choice', default: 'p', label: bi('Inspect wave', '观察哪种波'), options: [{ id: 'p', label: bi('P wave', 'P波') }, { id: 's', label: bi('S wave', 'S波') }] },
    { id: 'wave-step', kind: 'step', values: steps, default: 0, label: bi('Wave snapshot', '波动快照') },
    { id: 'water-depth', kind: 'step', values: [100, 1000, 4000], default: 4000, unit: 'm', label: bi('Water depth', '水深') },
    { id: 'sea-step', kind: 'step', values: steps, default: 0, label: bi('Displacement step', '位移步骤') },
    { id: 'sea-uplift', kind: 'toggle', default: true, label: bi('Seafloor displacement', '海床位移') },
    { id: 'flow-mode', kind: 'choice', default: 'none', label: bi('Flow illustration', '流动示意'), options: [{ id: 'none', label: bi('Off', '关闭') }, { id: 'up', label: bi('Magma rising', '岩浆上升') }, { id: 'surface', label: bi('Surface lava', '地表熔岩') }] },
  ],
  outputs: [
    { id: 'wave-shape', label: bi('Wave snapshot shape', '波动快照形状'), kind: 'state', states: shapeStates('wave', 'wave-rest') },
    { id: 'wave-stage', label: bi('Wave state', '波动状态'), kind: 'state', states: { rest: bi('At rest', '静止'), travelling: bi('Disturbance travelling', '扰动传播') } },
    { id: 'wave-front', label: bi('Selected wavefront (diagram units)', '所选波前（图解单位）'), kind: 'number', tag: 'sim', unit: 'du', decimals: 1 },
    { id: 'water-shape', label: bi('Water snapshot shape', '水体快照形状'), kind: 'state', states: shapeStates('water', 'water-rest') },
    { id: 'water-stage', label: bi('Water state', '水体状态'), kind: 'state', states: { 'no-uplift-in-model': bi('No source in this model', '本例没有位移源'), rest: bi('At rest', '静止'), displaced: bi('Water displaced', '水体被移开'), spreading: bi('Disturbance spreading', '扰动向外传播') } },
    { id: 'longwave-ms', label: bi('Model long-wave speed if a wave is present', '模型中存在长波时的理论速度'), kind: 'number', tag: 'sim', unit: 'm/s', decimals: 1 },
    { id: 'longwave-kmh', label: bi('Model long-wave speed if a wave is present', '模型中存在长波时的理论速度'), kind: 'number', tag: 'sim', unit: 'km/h', decimals: 1 },
  ],
  bind: [
    { output: 'wave-shape', part: waveIds, pose: Object.fromEntries(steps.map(k => [k === 0 ? 'wave-rest' : `wave-at-${k}`, `wave-snap-${k}`])) },
    { output: 'water-shape', part: waterIds, pose: Object.fromEntries(steps.map(k => [k === 0 ? 'water-rest' : `water-at-${k}`, `sea-snap-${k}`])) },
    { control: 'flow-mode', flow: 'magma-path', visible: { eq: 'up' } },
    { control: 'flow-mode', flow: 'lava-path', visible: { eq: 'surface' } },
  ],
  table: { experiments: {
    wave: { keys: ['wave-kind', 'wave-step'], rows: (['p', 's'] as const).flatMap(kind => steps.map(k => ({
      when: { 'wave-kind': kind, 'wave-step': k }, set: { 'wave-shape': k === 0 ? 'wave-rest' : `wave-at-${k}`, 'wave-stage': k === 0 ? 'rest' : 'travelling', 'wave-front': (kind === 'p' ? 4 : 2) * 0.25 * k }, source: ['S63', 'S60'],
    }))) },
    sea: { keys: ['sea-uplift', 'sea-step'], rows: [false, true].flatMap(uplift => steps.map(q => ({
      when: { 'sea-uplift': uplift, 'sea-step': q }, set: { 'water-shape': !uplift || q === 0 ? 'water-rest' : `water-at-${q}`, 'water-stage': !uplift ? 'no-uplift-in-model' : q === 0 ? 'rest' : q === 1 ? 'displaced' : 'spreading' }, source: ['S63', 'S14', 'S15'],
    }))) },
    depth: { keys: ['water-depth'], rows: [100, 1000, 4000].map(h => ({ when: { 'water-depth': h }, set: { 'longwave-ms': Math.sqrt(9.8 * h), 'longwave-kmh': Math.sqrt(9.8 * h) * 3.6 }, source: ['S63', 'S15'] })) },
  } },
};
const camera = (position: V3, target: V3, fov = 34) => ({ position, target, fov });
const candidate=process.argv.indexOf('--candidate');
const candidateOutput=candidate>=0 ? resolve(process.argv[candidate+1]!) : null;
// The normal build ships the sculpted relief; candidate builds stay in scratch.
const primitivesOnly=process.argv.includes('--primitives-only');
if(!primitivesOnly)await sculptGeology(parts,candidateOutput
  ? resolve(dirname(candidateOutput),'geology.glb')
  : fileURLToPath(new URL('../../../public/models/inside-the-earth.glb',import.meta.url)));
const file = {
  ...(!primitivesOnly ? {model:'/models/inside-the-earth.glb'} : {}),
  parts,
  groups: [
    { id: 'planet-shells', name: bi('Earth layers', '地球各层'), color: 'token:ink-2', card: false },
    { id: 'boundary-blocks', name: bi('Plate boundaries', '板块边界'), color: accent, card: false },
    { id: 'volcano-system', name: bi('Volcano', '火山'), color: hot },
    { id: 'ground-and-waves', name: bi('Slip and waves', '滑动与波'), color: 'token:ink-2', card: false },
    { id: 'water-and-structures', name: bi('Sea and structures', '海水与结构'), color: cold, card: false },
  ],
  flows: [
    { id: 'magma-path', group: 'volcano-system', path: conduitPath, count: 120, speed: 0.15, color: hot, whenRun: true, ends: 'fade', spread: 0.018, parts: ['volcano-storage', 'volcano-conduit', 'volcano-vent'], flat: true },
    { id: 'lava-path', group: 'volcano-system', path: lavaPath, count: 80, speed: 0.08, color: hot, whenRun: true, ends: 'fade', spread: 0.015, parts: ['volcano-vent', 'volcano-lava'], flat: true },
  ],
  animations: [{ id: 'ash-tumble', target: 'volcano-ash', kind: 'rotate', axis: [0.3, 1, 0.2], rpm: 0.8, each: true }], poses, sim,
  views: { assembled: { camera: camera([0.4, 0.35, 4.8], [0, -0.25, 0], 32) }, cover: camera([0.35, 0.15, 3.8], [0, 0, 0], 32), section: { plane: 'xy' }, reference: { fit: 'layers' }, cutaway: { normal: [1, 0, 0], offset: 0 }, shadows: 'contact' },
  presets: [
    { id: 'earth-view', label: bi('Earth', '地球'), camera: camera([0.4, 0.35, 4.8], [0, -0.25, 0], 32) },
    { id: 'edge-view', label: bi('Boundaries', '板块边界'), camera: camera([3.8, 3, 5.8], [0, 0, 0]) },
    { id: 'volcano-view', label: bi('Volcano', '火山'), camera: camera([3, 2.2, 5.6], [0, 0.65, 0]) },
    { id: 'fault-view', label: bi('Slip and waves', '滑动与波'), camera: camera([0, 2.2, 6.5], [0, 0, 0]) },
    { id: 'sea-view', label: bi('Sea', '海水'), camera: camera([0, 1.5, 5.8], [0, 0, 0]) },
    { id: 'building-view', label: bi('Structure', '结构'), camera: camera([3.3, 2.3, 5.8], [0, 1.05, 0]) },
  ],
  spec: [
    { key: bi('Earth radius', '地球半径'), value: '≈ 6371 km [S58]', tag: 'typical' },
    { key: bi('Crust example', '地壳示例'), value: '30 km · DESIGN [S59, S63]', tag: 'design' },
    { key: bi('Scale', '比例'), value: bi('Local sections enlarged', '局部剖面放大'), tag: 'design' },
    { key: bi('Models', '模型'), value: bi("Each has its own scale", "各用独立比例"), tag: 'design' },
  ],
  telemetry: [
    { key: bi('Wavefront · diagram units', '波前·图解单位'), follow: 'wave-front', unit: 'du', decimals: 1, scope: 'observe' },
    { key: bi('Long-wave speed', '长波速度'), follow: 'longwave-ms', unit: 'm/s', decimals: 1, scope: 'observe' },
    { key: bi('Long-wave speed', '长波速度'), follow: 'longwave-kmh', unit: 'km/h', decimals: 1, scope: 'observe' },
  ],
};

// Content-specific limits stay here and in the topic tests, not the engine.
const expected = [
  'earth-crust', 'earth-mantle', 'earth-outer-core', 'earth-inner-core', 'plate-crust', 'plate-rigid-mantle', 'plate-deep-mantle',
  'edge-div-left', 'edge-div-right', 'edge-sub-left', 'edge-sub-right', 'edge-slab', 'edge-melt', 'edge-trans-left', 'edge-trans-right', 'collision-fold',
  ...['cone', 'host', 'storage', 'conduit', 'vent', 'bubbles', 'lava', 'ash'].map(id => `volcano-${id}`),
  'fault-left', 'fault-right', 'fault-marker-left', 'fault-marker-lock', 'fault-marker-right', 'fault-focus', 'fault-epicentre',
  ...waveIds, ...waterIds, 'sea-coast', ...['ground', 'foundation', 'frame', 'floors', 'core'].map(id => `building-${id}`),
];
assert.equal(parts.length, 91);
assert.deepEqual(parts.map(p => p.id).sort(), expected.sort());
assert.equal(new Set(expected).size, 91);
assert.equal(Object.keys(poses).length, 27);
assert.equal(sim.controls.length, 6);
assert.equal(sim.outputs.length, 7);
assert.equal(sim.bind!.length, 4);
assert.equal(Object.values(sim.table!.experiments).reduce((n, e) => n + e.rows.length, 0), 39);
assert(Object.values(sim.table!.experiments).every(e => e.rows.length <= 64));
partsFile.parse(file);
const output = fileURLToPath(new URL('../../../src/content/topics/inside-the-earth/data/parts.json', import.meta.url));
writeFileSync(candidateOutput ?? output, `${JSON.stringify(file, null, 2)}\n`);
process.stdout.write('inside-the-earth: 91 parts · 27 poses · 39 rows · 7 outputs · 6 controls · 4 bindings · 2 flows\n');
