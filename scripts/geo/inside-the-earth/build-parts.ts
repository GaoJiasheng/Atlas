/**
 * Inside the Earth — original teaching geometry and finite snapshots.
 * Source contract: docs/48 §3. Run with pnpm tsx scripts/geo/inside-the-earth/build-parts.ts.
 * The four Earth radii are a teaching synthesis, not one seismic reference model.
 * Other lengths, snapshots and motion amplitudes are diagram design (S63).
 */
import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
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
const ink = 'token:ink-2';
const light = 'token:paper';
const muted = 'token:ink-3';
const hot = 'token:hot';
const cold = 'token:cold';
const accent = 'token:accent-1';
const box = (size: V3, at: V3, tint = ink): Primitive => ({ kind: 'box', size, at, color: 'plastic', tint });
const sphere = (r: number, at: V3, tint = ink): Primitive => ({ kind: 'sphere', size: [r], at, color: 'plastic', tint });
const extrude = (shape: V2[], depth: number, at: V3 = [0, 0, 0], tint = ink): Primitive => ({ kind: 'extrude', shape, depth, at, color: 'plastic', tint });
const sweep = (path: V3[], radius: number | number[], tint = hot): Extract<Primitive, { kind: 'sweep' }> => ({ kind: 'sweep', path, radius, at: [0, 0, 0], color: 'plastic', tint, caps: 'flat' });
function add(id: string, en: string, zh: string, group: string, primitive: Primitive, summary: ReturnType<typeof bi>, detail: ReturnType<typeof bi>, options: Partial<Part> = {}) {
  const part: Part = { id, name: bi(en, zh), group, primitive, summary, detail, explode: { dir: [0, 1, 0], dist: 0 }, connects: [], castShadow: false, ...options };
  parts.push(part);
  return part;
}

// Closed annular meridians: the outer arc goes pole to pole, then the
// inner arc returns. Identical integer-derived radii meet without overlap.
function hemisphere(outer: number, inner: number): V2[] {
  const arc = (r: number): V2[] => Array.from({ length: 41 }, (_, k) => {
    if (k === 0) return [0, -r];
    if (k === 40) return [0, r];
    const t = Math.PI * k / 40;
    return [r * Math.sin(t), -r * Math.cos(t)];
  });
  const outerArc = arc(outer);
  return inner > 0 ? [...outerArc, ...arc(inner).reverse(), outerArc[0]!] : [...outerArc, outerArc[0]!];
}
const radii = [1, 6341 / 6371, 3485 / 6371, 1221 / 6371, 0];
const earth = [
  ['crust', 'Crust', '地壳', accent, 'The crust is Earth’s thin rocky outer layer.', '地壳是地球外面很薄的岩石层。', 'This shell uses a uniform land-crust example of about 30 km; real crust varies in thickness. Oceanic crust can be much thinner. [S59, S63]', '这个薄壳采用约30千米的均匀陆壳示例；真实地壳厚薄不同，海洋地壳可以薄得多。[S59, S63]'],
  ['mantle', 'Mantle', '地幔', muted, 'The mantle is mostly solid rock beneath the crust.', '地幔在地壳下方，大部分是固态岩石。', 'Rock here can deform over geological time. The thick rocky shell is not a global sea of magma. Its radial extent is a teaching synthesis of the cited Earth measurements. [S6, S58, S59, S63]', '这里的岩石能在地质时间尺度上变形。这个厚岩石壳不是全球岩浆海；其半径范围由所引地球数值拼合成教学几何。[S6, S58, S59, S63]'],
  ['outer-core', 'Outer core', '外核', light, 'Liquid metal surrounds the solid inner core.', '液态金属包围着固态内核。', 'The outer core is liquid metal, represented by a closed shell rather than flowing light. Its outer boundary is about 3,485 km from Earth’s centre. It does not supply a volcano’s magma. [S58, S59, S10, S63]', '外核是液态金属；模型用闭合壳表示，不用流光表示液态。其外边界离地心约3485千米。它不为火山供给岩浆。[S58, S59, S10, S63]'],
  ['inner-core', 'Inner core', '内核', ink, 'The inner core is solid metal at Earth’s centre.', '内核是地心的固态金属。', 'The inner-core boundary has a radius of about 1,221 km. A solid half-sphere exposes the centre. Radius means centre to boundary, not the distance across the whole core. [S59, S63]', '内核边界半径约1221千米。实心半球露出中心；半径是中心到边界的距离，不是穿过整个内核的距离。[S59, S63]'],
];
earth.forEach(([id, en, zh, tint, sen, szh, den, dzh], i) => add(`earth-${id}`, en!, zh!, 'planet-shells', {
  kind: 'lathe', profile: hemisphere(radii[i]!, radii[i + 1]!), segments: 96, arc: 180, at: [0, 0, 0], color: 'plastic', tint,
}, bi(sen!, szh!), bi(den!, dzh!), { shell: i < 3, explode: { dir: [1, 0, 0], dist: [0.2, 0.15, 0.1, 0][i]! }, connects: i < 3 ? [`earth-${earth[i + 1]![0]}`] : [] }));

// The local plate is independently enlarged; it carries no Earth scale bar.
const plateScale = 0.45;
const plateLayers = [
  ['crust', 'Plate crust', '板块的地壳', 0.15, -1.31375, accent],
  ['rigid-mantle', 'Rigid uppermost mantle', '刚性最上部地幔', 0.65, -1.49375, ink],
  ['deep-mantle', 'Mantle below the plate', '板块下方地幔', 0.4, -1.73, muted],
] as const;
plateLayers.forEach(([id, en, zh, h, y, tint], i) => add(`plate-${id}`, en, zh, 'planet-shells', box([3 * plateScale, h * plateScale, plateScale], [0, y, 0], tint),
  bi(i < 2 ? 'This layer moves with the rest of the lithospheric plate.' : 'The mantle below the plate remains mostly solid.', i < 2 ? '这一层与岩石圈板块的其余部分一起移动。' : '板块下方的地幔仍大部分是固态。'),
  bi('A plate includes crust and rigid uppermost mantle. This separate sample enlarges thin layers; its drawn thicknesses are design values, not Earth-scale measurements. [S6, S7, S63]', '板块包括地壳和刚性的最上部地幔。这个独立小样放大薄层；所画厚度是设计值，不按地球比例量取。[S6, S7, S63]'),
  { connects: i < 2 ? [`plate-${plateLayers[i + 1]![0]}`] : [] }));

// Four independent samples, all visible together. A main block and its
// crust extra belong to one logical part, so every transform carries both.
function plateBlock(id: string, en: string, zh: string, x: number, y: number, width: number, summary: ReturnType<typeof bi>, detail: ReturnType<typeof bi>) {
  return add(id, en, zh, 'boundary-blocks', box([width, 0.44, 0.7], [x, y, 0], ink), summary, detail,
    { extra: [box([width, 0.08, 0.7], [x, y + 0.26, 0], accent)] });
}
const boundaryDetail = bi('Each complete block includes crust and rigid uppermost mantle. The local shape and accelerated movement are schematic, without geographical coordinates. [S7, S45, S63]', '每块完整板块包括地壳和刚性的最上部地幔。局部形状与加速运动均为示意，没有地理坐标。[S7, S45, S63]');
for (const [side, x] of [['left', -1.35], ['right', -0.55]] as const) plateBlock(`edge-div-${side}`, `Spreading plate, ${side}`, `扩张板块${side === 'left' ? '左' : '右'}侧`, x, 0.78, 0.72,
  bi('Separating plates allow magma to rise and make new oceanic crust.', '板块分开时，岩浆可上升形成新海洋地壳。'), boundaryDetail);
// Shared join at x=.55, y=.78 (bottom) / 1.00 (top).
add('edge-sub-left', 'Incoming oceanic plate', '进入俯冲区的海洋板块', 'boundary-blocks', box([0.6, 0.14, 0.7], [0.25, 0.85, 0], ink),
  bi('The incoming plate continues into the descending slab.', '进入俯冲区的板块与下降板片连续相接。'), boundaryDetail,
  { extra: [box([0.6, 0.08, 0.7], [0.25, 0.96, 0], accent)], connects: ['edge-slab'] });
const slabTop: V2[] = Array.from({ length: 17 }, (_, k) => { const t = k / 16; return [0.55 + 1.05 * t, 1 - 0.91 * t * t]; });
const slabBottom: V2[] = slabTop.map(([x, y]) => [x, y - 0.22]);
add('edge-slab', 'Descending slab', '俯冲板片', 'boundary-blocks', extrude([...slabTop, ...slabBottom.slice().reverse()], 0.7),
  bi('This continuous slab descends into the mantle.', '这块连续的板片向地幔下降。'),
  bi('The slab meets the incoming plate along the same full cross-section. Water carried by subducting rock helps rock above it melt partly; the slab is not drawn as a pipe from the core. [S7, S9, S63]', '板片沿相同完整截面接上进入区的板块。俯冲岩石所带的水有助于上方岩石部分熔融；板片不是来自地核的管道。[S7, S9, S63]'),
  { extra: [extrude([...slabTop, ...slabTop.map(([x, y]): V2 => [x, y - 0.08]).reverse()], 0.702, [0, 0, 0], accent)], connects: ['edge-sub-left'] });
add('edge-sub-right', 'Overriding plate', '上覆板块', 'boundary-blocks', extrude([[0.78, 1.12], [1.78, 1.12], [1.78, 0.72], [1.34, 0.72], [1.02, 0.91]], 0.7),
  bi('The overriding plate sits above the descending slab.', '上覆板块位于下降板片上方。'), boundaryDetail,
  { extra: [extrude([[0.78, 1.12], [1.78, 1.12], [1.78, 1.2], [1.25, 1.2], [1.18, 1.34], [1.04, 1.2], [0.78, 1.2]], 0.7, [0, 0, 0], accent)] });
add('edge-melt', 'Partial melting above the slab', '板片上方的部分熔融', 'boundary-blocks', { ...sphere(0.13, [1.22, 0.71, 0.42], hot), scale: [1.3, 0.65, 0.7] },
  bi('Water from the slab helps some rock above it melt.', '板片释放的水有助于上方部分岩石熔融。'),
  bi('This small highlighted region represents local partial melting, not a mantle-wide molten layer. Its size is enlarged for reading. [S9, S63]', '这块小区域表示局部部分熔融，不是遍布地幔的熔融层。大小为便于阅读而放大。[S9, S63]'));
for (const [side, x] of [['left', -1.35], ['right', -0.55]] as const) {
  const p = plateBlock(`edge-trans-${side}`, `Transform plate, ${side}`, `转换板块${side === 'left' ? '左' : '右'}侧`, x, -0.8, 0.76,
    bi('This plate slides horizontally past its neighbour.', '这块板块沿水平方向错过相邻板块。'), boundaryDetail);
  p.extra!.push(box([0.76, 0.018, 0.06], [x, -0.49, 0], ink));
}
add('collision-fold', 'Continental collision', '大陆碰撞', 'boundary-blocks', extrude([[0.08, -1.02], [1.78, -1.02], [1.78, -0.55], [1.47, -0.55], [1.31, -0.43], [1.1, -0.22], [0.94, -0.42], [0.76, -0.3], [0.55, -0.51], [0.08, -0.55]], 0.7),
  bi('Converging continents can build mountains.', '大陆靠近碰撞可以形成山脉。'),
  bi('This separate convergence sample compares continental collision with oceanic subduction. It does not assume the same volcanic arrangement. The folds and thickness are schematic. [S7, S63]', '这个独立汇聚小样把大陆碰撞与海洋板块俯冲并列比较，不假定两者具有相同的火山排列。褶皱与厚度为示意。[S7, S63]'),
  { extra: [extrude([[0.08, -0.55], [0.55, -0.51], [0.76, -0.3], [0.94, -0.42], [1.1, -0.22], [1.31, -0.43], [1.47, -0.55], [1.78, -0.55], [1.78, -0.47], [1.47, -0.47], [1.31, -0.35], [1.1, -0.14], [0.94, -0.34], [0.76, -0.22], [0.55, -0.43], [0.08, -0.47]], 0.7, [0, 0, 0], accent)] });

// A single volcanic opening and a local, crystal-bearing storage body.
const coneProfile: V2[] = [[1.2, 0], [0.95, 0.17], [0.72, 0.47], [0.5, 0.81], [0.29, 1.16], [0.19, 1.32], [0.12, 1.32], [0.095, 1.12], [0.095, 0], [1.2, 0]];
add('volcano-cone', 'Cone', '火山锥', 'volcano-system', { kind: 'lathe', profile: coneProfile, segments: 72, arc: 180, at: [0, 0, 0], color: 'plastic', tint: muted },
  bi('Rock builds the cone around a surface opening.', '岩石围着地表开口形成火山锥。'),
  bi('This cone is a teaching cutaway with one top opening. Its slopes and layers are schematic, not the dimensions of a named volcano. [S10, S63]','这是一个顶部只有一个开口的教学剖面。坡度和岩层均为示意，不是某座火山的尺寸。[S10, S63]'),
  { shell: true, explode: { dir: [1, 0, 0], dist: 0.3 }, chainName: bi('Cone', '火山锥'), connects: ['volcano-host'] });
const storageHole: V2[] = Array.from({ length: 40 }, (_, k) => { const a = 2 * Math.PI * k / 40; return [0.45 * Math.cos(a), -0.43 + 0.23 * Math.sin(a)]; });
add('volcano-host', 'Host rock', '围岩', 'volcano-system', { ...extrude([[-1.35, -0.82], [1.35, -0.82], [1.35, 0], [-1.35, 0]], 0.62, [0, 0, -0.31], ink), holes: [storageHole] } as Primitive,
  bi('Solid rock surrounds the local magma system.', '固态围岩包围着局部岩浆系统。'),
  bi('The cut rock surrounds a shaped storage region. The teaching section ends locally below it; no conduit leads down to the core. [S10, S63]', '切开的围岩围绕着储存区。教学剖面在其下方的局部范围结束，没有通向地核的通道。[S10, S63]'),
  { shell: true, explode: { dir: [-1, 0, 0], dist: 0.3 }, chainName: bi('Rock', '围岩'), connects: ['volcano-storage'] });
const storageProfile: V2[] = Array.from({ length: 25 }, (_, k) => { const a = Math.PI * k / 24; return [k === 0 || k === 24 ? 0 : 0.45 * Math.sin(a), -0.23 * Math.cos(a)]; });
storageProfile.push(storageProfile[0]!);
add('volcano-storage', 'Magma storage', '岩浆储存区', 'volcano-system', { kind: 'lathe', profile: storageProfile, segments: 48, arc: 180, at: [0, -0.43, 0], color: 'plastic', tint: hot },
  bi('Magma collects locally with crystals in the storage region.', '岩浆与晶体在局部储存区共存。'),
  bi('Storage can contain melt and crystals together. The small pale crystals and the cut surface are enlarged symbols; the region is not an empty cave or the core. [S10, S63]', '储存区可以同时含熔体与晶体。浅色小晶体和切面是放大的示意；这里不是空洞，也不是地核。[S10, S63]'),
  { extra: Array.from({ length: 11 }, (_, k) => ({ ...box([0.035, 0.055, 0.035], [0.31 * Math.cos(k * 2.4), -0.43 + 0.12 * Math.sin(k * 2.4), 0.007], light), rotation: [0, 0, k * 37] } as Primitive)), chainName: bi('Storage', '储存区'), connects: ['volcano-conduit'] });
const conduitPath: V3[] = [[0, -0.23, 0.018], [0, 0.1, 0.018], [-0.015, 0.61, 0.018], [0, 1.1, 0.018], [0, 1.33, 0.018]];
add('volcano-conduit', 'Conduit', '岩浆通道', 'volcano-system', sweep(conduitPath, [0.072, 0.067, 0.06, 0.065, 0.09]),
  bi('This passage connects local magma storage to the opening.', '这条通道把局部岩浆储存区接到喷发口。'),
  bi('The solid filled passage joins the storage body and the top vent. Real volcanic plumbing can be more complex; this path is local and does not connect to the core. [S10, S63]', '填满物质的通道接上储存区与顶部喷发口。真实火山管道可能更复杂；本通道限于局部，不连接地核。[S10, S63]'),
  { chainName: bi('Conduit', '通道'), connects: ['volcano-storage', 'volcano-vent'] });
add('volcano-vent', 'Vent', '喷发口', 'volcano-system', { kind: 'lathe', profile: [[0.19, 1.3], [0.2, 1.34], [0.12, 1.34], [0.12, 1.3], [0.19, 1.3]], segments: 64, at: [0, 0, 0], color: 'plastic', tint: accent },
  bi('Gas, fragments or lava can reach the surface at this opening.', '气体、碎屑或熔岩可从这个开口到达地表。'),
  bi('The annular rim marks the same single top opening as the cone and conduit. It is an opening, not an extra underground chamber. [S10, S63]', '环形边缘标出火山锥与通道的同一个顶部开口；它是开口，不是额外的地下空腔。[S10, S63]'),
  { chainName: bi('Vent', '喷发口'), connects: ['volcano-conduit', 'volcano-lava'] });
add('volcano-bubbles', 'Bubbles', '气泡', 'volcano-system', sphere(0.024, [0, 0.62, 0.092], light),
  bi('Gas can form expanding bubbles as magma rises and pressure falls.', '岩浆上升、压力降低时，气体可析出并形成膨胀气泡。'),
  bi('The pale bubbles are enlarged and repeated only for visibility. Their number and pose do not calculate gas pressure or an eruption threshold. [S10, S63]', '浅色气泡只为看清而放大重复。数量与姿态不计算气体压力，也不计算喷发门槛。[S10, S63]'),
  { repeat: { count: 6, axis: [0, 1, 0], spacing: 0.14 }, chainName: bi('Bubbles', '气泡') });
const lavaPath: V3[] = [[0.12, 1.33, 0.09], [0.31, 1.16, 0.11], [0.53, 0.82, 0.13], [0.75, 0.48, 0.16], [0.98, 0.19, 0.2], [1.25, 0.04, 0.22]];
add('volcano-lava', 'Lava', '熔岩', 'volcano-system', { ...sweep(lavaPath, [0.045, 0.055, 0.06, 0.07, 0.08, 0.06]), section: { flat: 0.45 }, up: [0, 0, 1] },
  bi('Magma that reaches the surface is called lava.', '岩浆喷到地表后叫熔岩。'),
  bi('This small slope sample is kept beside the ash sample for comparison. It shows a path, not a forecast of how far a real lava flow would travel. [S10, S45, S63]', '这件小型坡面样本与火山灰并列供比较。它表示路径，不预测真实熔岩流能走多远。[S10, S45, S63]'),
  { chainName: bi('Lava', '熔岩'), connects: ['volcano-vent'] });
add('volcano-ash', 'Ash', '火山灰', 'volcano-system', { ...box([0.033, 0.04, 0.025], [0, 1.67, -0.04], ink), rotation: [21, 12, 30] },
  bi('Volcanic ash consists of small rock, mineral and glass fragments.', '火山灰由细小岩石、矿物与玻璃碎屑组成。'),
  bi('The fragments here are greatly enlarged. Under the definition used by this topic, ash is less than 2 mm in diameter. This comparison sample remains visible alongside lava and is not a simulated eruption cloud. [S65, S63]', '这里的碎屑大大放大。本题采用的定义为直径小于2毫米。这个比较样本与熔岩同时可见，不是模拟喷发云。[S65, S63]'),
  { extra: [{ ...sphere(0.022, [0.035, 1.81, 0.02], muted), scale: [1.2, 0.7, 1] }, { ...box([0.02, 0.045, 0.024], [-0.02, 1.96, -0.02], ink), rotation: [0, 10, 38] }], repeat: { count: 5, axis: [1, 0, 0], spacing: 0.15 }, chainName: bi('Ash', '火山灰') });

// Fault and two distinct marker rows. Surface markers are segmented at
// the locked contact, so bending can be shown without a sliding contact.
for (const [side, x] of [['left', -0.765], ['right', 0.765]] as const) add(`fault-${side}`, `Fault block, ${side}`, `断层${side === 'left' ? '左' : '右'}侧岩块`, 'ground-and-waves', box([1.47, 0.7, 1], [x, 0.9, 0], muted),
  bi('Rock stores elastic strain before sudden fault slip.', '断层突然滑动前，岩石储存弹性应变能。'),
  bi('The sample shows horizontal offset and has no magma. The enlarged poses illustrate deformation followed by slip; they cannot predict an earthquake’s place or time. [S6, S12, S63]', '小样表示水平错距，不含岩浆。放大姿态表示先变形再滑动，不能预测地震的地点或时刻。[S6, S12, S63]'));
for (const [side, a, b] of [['left', -1.4, -0.18], ['lock', -0.18, 0.18], ['right', 0.18, 1.4]] as const) add(`fault-marker-${side}`, side === 'lock' ? 'Locked marker segment' : `Marker band, ${side}`, side === 'lock' ? '锁定段标记' : `${side === 'left' ? '左' : '右'}侧标记带`, 'ground-and-waves', extrude([[a, 1.256], [b, 1.256], [b, 1.272], [a, 1.272]], 0.065, [0, 0, 0.17], accent),
  bi(side === 'lock' ? 'The contact stays locked while the outer marker arms turn.' : 'This surface marker makes bending and offset visible.', side === 'lock' ? '外侧标记臂偏转时，接触段保持锁定。' : '地表标记让变形与错距可见。'),
  bi('This coloured marker is a diagram device, not a separate geological layer. In the loaded pose each arm pivots about its contact end; slip then leaves a visible sideways mismatch. [S12, S63]', '这条有色标记是图解工具，不是独立地层。受力姿态中，两臂各绕接触端转动；滑动后保留可见的水平错距。[S12, S63]'));
add('fault-focus', 'Focus', '震源', 'ground-and-waves', sphere(0.06, [0, 0.83, 0.04], hot),
  bi('The earthquake rupture starts at the focus.', '地震破裂从震源开始。'), bi('The small sphere marks one starting location inside the fault, not the whole fault plane. Its size is enlarged. [S12, S63]', '小球标出断层内部的一个破裂起点，不代表整个断层面；大小经过放大。[S12, S63]'));
add('fault-epicentre', 'Epicentre', '震中', 'ground-and-waves', { kind: 'cylinder', size: [0.085, 0.085, 0.012], at: [0, 1.285, 0.04], color: 'plastic', tint: hot },
  bi('The epicentre is on the surface directly above the focus.', '震中位于震源正上方的地表。'), bi('This disc is vertically above the focus sphere. It does not mark the place that must shake most strongly. [S12, S63]', '这个圆盘在震源小球垂直上方，不表示那里一定震得最强。[S12, S63]'));
const letters = 'abcdefghijklmnopq'.split('');
const waveIds: string[] = [];
for (const [kind, y] of [['p', -0.35], ['s', -0.9]] as const) letters.forEach((letter, i) => {
  const id = `wave-${kind}-${letter}`;
  waveIds.push(id);
  add(id, `${kind.toUpperCase()}-wave marker ${letter.toUpperCase()}`, `${kind.toUpperCase()}波标记${letter.toUpperCase()}`, 'ground-and-waves', sphere(0.047, [-1.6 + 0.4 * (0.5 * i), y, 0.06], kind === 'p' ? accent : cold),
    bi(kind === 'p' ? 'This rock marker moves parallel to the wave’s travel direction.' : 'This rock marker moves across the wave’s travel direction.', kind === 'p' ? '这枚岩石标记沿波传播的方向振动。' : '这枚岩石标记垂直于波传播方向振动。'),
    bi(`The marker oscillates near its resting place instead of travelling with the wavefront. This ${kind.toUpperCase()} row is a separate comparison model. Position, amplitude, frequency and drawing speed are design values; du means diagram units, not metres. [S60, S63]`, `标记在原位附近往返，不随波前一路前进。${kind.toUpperCase()}波这一排是独立的比较模型。位置、振幅、频率与绘图速度都是设计值；du表示图解单位，不是米。[S60, S63]`));
});

// Water markers encode signed displacement; they are not moving parcels
// tracked by a hydrodynamic solver. All three source blocks remain joined.
for (const [id, x, w] of [['sea-bed', 0, 0.4], ['sea-bed-left', -0.9, 1.4], ['sea-bed-right', 0.9, 1.4]] as const) add(id, id === 'sea-bed' ? 'Central seafloor source' : `Seafloor source, ${x < 0 ? 'left' : 'right'}`, id === 'sea-bed' ? '中心海床源区' : `${x < 0 ? '左' : '右'}侧海床源区`, 'water-and-structures', box([w, 0.15, 0.65], [x, -0.075, 0], ink),
  bi('Sudden vertical seafloor movement can displace the water above.', '海床突然垂直移动，可以移开上方海水。'),
  bi('In this example the central block rises and neighbouring blocks settle. The source switch turns off this example only; it does not exclude landslides or volcanic tsunami sources. [S13, S14, S63]', '本例中心块上升，相邻块下移。关闭源开关只表示本例无源，不排除滑坡或火山过程产生海啸。[S13, S14, S63]'));
const waterIds = ['sea-bed', 'sea-bed-left', 'sea-bed-right'];
letters.forEach((letter, i) => {
  const id = `sea-column-${letter}`;
  waterIds.push(id);
  const x = 0.2 * (i - 8);
  add(id, `Water-depth marker ${letter.toUpperCase()}`, `水深标记${letter.toUpperCase()}`, 'water-and-structures', box([0.008, 0.26, 0.008], [x, 0.25, 0.08], cold),
    bi('This depth marker represents disturbance through the water depth.', '这枚水深标记表示扰动涉及整个水深。'),
    bi('The line and its two dots are one selectable symbol, not a to-scale water column. Vertical offsets are balanced diagram snapshots, not a calculation of currents, energy, flooding or real arrival time. [S15, S63]', '细线与上下两点合为一枚可选符号，不是按实尺画的水柱。上下位移是保持正负平衡的图解快照，不计算洋流、能量、淹没或真实到时。[S15, S63]'),
    { extra: [sphere(0.023, [x, 0.12, 0.08], cold), sphere(0.023, [x, 0.38, 0.08], cold)] });
});
// A separate nearshore section and two low long-wave profiles. No breaker.
const coastWave = (x0: number, length: number, amp: number): Primitive => {
  const points: V3[] = Array.from({ length: 25 }, (_, i) => [x0 + length * i / 24, -0.7 + amp * Math.sin(Math.PI * 2 * i / 24), 0.18]);
  return { ...sweep(points, 0.018, cold), section: { flat: 0.6 }, up: [0, 0, 1] };
};
add('sea-coast', 'Shore sample', '近岸小样', 'water-and-structures', extrude([[-1.6, -1.18], [1.6, -1.18], [1.6, -0.64], [1.05, -0.74], [0.4, -0.94], [-1.6, -1.06]], 0.6, [0, 0, -0.04], muted),
  bi('A long wave slows in shallower water and its height may grow.', '长波进入浅水后减速，波高可能增加。'),
  bi('This independent shore sample contrasts a longer, lower profile with a shorter, taller one. The shallow pose enlarges the drawn vertical shape only. The speed formula does not calculate wave height, inundation or a breaking wave. [S15, S63]', '这个独立近岸小样比较较长较低与较短较高的波形。浅水姿态只放大所画的竖向形状。速度公式不计算波高、淹没或卷浪。[S15, S63]'),
  { extra: [coastWave(-1.5, 1.8, 0.045), coastWave(0.55, 0.75, 0.1)] });

// A generic four-floor structure. All upper parts share one foundation-top
// pivot, so they remain connected in the exaggerated ±1 degree poses.
add('building-ground', 'Ground', '地面', 'water-and-structures', box([1.65, 0.22, 1.2], [0, -0.26, 0], muted),
  bi('Moving ground supplies the motion at the foundation.', '移动的地面把运动传到基础。'), bi('This is a generic ground sample with no fault beneath it. Ground conditions help determine how shaking affects a structure. It is not a Singapore soil survey. [S25, S63]', '这是通用地面小样，下方不画断层。地面条件会影响结构对震动的响应；它不是新加坡土层勘测。[S25, S63]'), { connects: ['building-foundation'] });
add('building-foundation', 'Foundation', '基础', 'water-and-structures', box([1.2, 0.3, 0.92], [0, -0.15, 0], ink),
  bi('The foundation connects the structure to the ground.', '基础把结构连接到地面。'), bi('The foundation depth and width are design choices. This sample has no default isolation device, specified piles or building-code parameters. It does not assess an actual building. [S25, S63]', '基础深度和宽度是设计选择。本样本没有默认隔震装置、指定桩基或建筑规范参数，不评估真实建筑。[S25, S63]'), { connects: ['building-ground', 'building-frame', 'building-core'] });
const frame: Primitive[] = [];
for (const x of [-0.45, 0.45]) for (const z of [-0.35, 0.35]) frame.push(box([0.075, 2.6, 0.075], [x, 1.3, z], ink));
for (const y of [0.65, 1.3, 1.95, 2.6]) {
  for (const z of [-0.35, 0.35]) frame.push(box([0.98, 0.07, 0.07], [0, y, z], ink));
  for (const x of [-0.45, 0.45]) frame.push(box([0.07, 0.07, 0.78], [x, y, 0], ink));
}
add('building-frame', 'Frame', '框架', 'water-and-structures', frame[0]!,
  bi('Connected beams and columns support this generic structure.', '相连的梁柱支撑这件通用结构。'),
  bi('This open frame lets the connections be seen. Its dimensions and exaggerated movement are diagram design, not an HDB drawing or measured Singapore building. Correct connections and suitable bracing matter. [S25, S63]', '开放框架让连接位置可见。尺寸与放大运动均为图解设计，不是HDB图纸或新加坡某栋楼的实测。正确连接与合适支撑很重要。[S25, S63]'),
  { extra: frame.slice(1), connects: ['building-foundation', 'building-floors', 'building-core'] });
add('building-floors', 'Floors', '楼板', 'water-and-structures', box([1, 0.065, 0.8], [0, 1.625, 0], light),
  bi('Floor slabs connect to the frame and structural wall in this sample.', '本样本的楼板与框架和结构墙相连。'),
  bi('The repeated floors are design geometry, not a claim about a real building’s storey count. The floor, frame and wall share the same pose pivot so the connections stay together. [S25, S63]', '重复楼板是设计几何，不表示真实建筑的楼层数。楼板、框架和结构墙共用姿态枢轴，使连接保持相接。[S25, S63]'),
  { repeat: { count: 4, axis: [0, 1, 0], spacing: 0.65 }, connects: ['building-frame', 'building-core'] });
add('building-core', 'Structural wall', '结构墙', 'water-and-structures', box([0.36, 2.6, 0.09], [0, 1.3, -0.2], accent),
  bi('This wall is connected to the frame, floors and foundation.', '这面墙与框架、楼板和基础相连。'),
  bi('The wall is one generic example of structural support, not a claim about every Singapore building. Response depends on ground conditions and vibration characteristics; height alone cannot rank safety. [S25, S63]', '这面墙只是结构支撑的通用例子，不代表每栋新加坡建筑。响应受地面条件和振动特性影响，不能只按高矮排列安全程度。[S25, S63]'),
  { connects: ['building-foundation', 'building-frame', 'building-floors'] });

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
    { id: 'longwave-ms', label: bi('Theoretical long-wave speed', '理论长波速度'), kind: 'number', tag: 'sim', unit: 'm/s', decimals: 1 },
    { id: 'longwave-kmh', label: bi('Theoretical long-wave speed', '理论长波速度'), kind: 'number', tag: 'sim', unit: 'km/h', decimals: 1 },
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
const file = {
  parts,
  groups: [
    { id: 'planet-shells', name: bi('Earth layers', '地球各层'), color: ink, card: false },
    { id: 'boundary-blocks', name: bi('Plate boundaries', '板块边界'), color: accent, card: false },
    { id: 'volcano-system', name: bi('Volcano', '火山'), color: hot },
    { id: 'ground-and-waves', name: bi('Slip and waves', '滑动与波'), color: ink, card: false },
    { id: 'water-and-structures', name: bi('Sea and structures', '海水与结构'), color: cold, card: false },
  ],
  flows: [
    { id: 'magma-path', group: 'volcano-system', path: conduitPath, count: 120, speed: 0.15, color: hot, whenRun: true, ends: 'fade', spread: 0.018, parts: ['volcano-storage', 'volcano-conduit', 'volcano-vent'], flat: true },
    { id: 'lava-path', group: 'volcano-system', path: lavaPath, count: 80, speed: 0.08, color: hot, whenRun: true, ends: 'fade', spread: 0.015, parts: ['volcano-vent', 'volcano-lava'], flat: true },
  ],
  animations: [], poses, sim,
  views: { assembled: { camera: camera([0.4, 0.35, 4.8], [0, -0.25, 0], 32) }, cover: camera([0.35, 0.15, 3.8], [0, 0, 0], 32), section: { plane: 'xy' }, reference: { fit: 'layers' }, cutaway: { normal: [1, 0, 0], offset: 0 }, shadows: 'contact' },
  presets: [
    { id: 'earth-view', label: bi('Earth', '地球'), camera: camera([0.4, 0.35, 4.8], [0, -0.25, 0], 32) },
    { id: 'edge-view', label: bi('Boundaries', '板块边界'), camera: camera([3.8, 3, 5.8], [0, 0, 0]) },
    { id: 'volcano-view', label: bi('Volcano', '火山'), camera: camera([3, 2.1, 4.8], [0, 0.4, 0]) },
    { id: 'fault-view', label: bi('Slip and waves', '滑动与波'), camera: camera([0, 2.2, 6.5], [0, 0, 0]) },
    { id: 'sea-view', label: bi('Sea', '海水'), camera: camera([0, 1.5, 5.8], [0, 0, 0]) },
    { id: 'building-view', label: bi('Structure', '结构'), camera: camera([3, 2.2, 5], [0, 1, 0]) },
  ],
  spec: [
    { key: bi('Earth radius', '地球半径'), value: '≈ 6371 km [S58]', tag: 'typical' },
    { key: bi('Crust example', '地壳示例'), value: '30 km · DESIGN [S59, S63]', tag: 'design' },
    { key: bi('Scale', '比例'), value: bi('Local sections enlarged', '局部剖面放大'), tag: 'design' },
    { key: bi('Models', '模型'), value: bi('Independent teaching samples', '独立教学标本'), tag: 'design' },
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
writeFileSync(output, `${JSON.stringify(file, null, 2)}\n`);
process.stdout.write('inside-the-earth: 91 parts · 27 poses · 39 rows · 7 outputs · 6 controls · 4 bindings · 2 flows\n');
