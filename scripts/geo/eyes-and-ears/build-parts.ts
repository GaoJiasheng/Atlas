/**
 * Original schematic anatomy, not traced geometry or a measured specimen.
 * Rebuild with: pnpm tsx scripts/geo/eyes-and-ears/build-parts.ts
 * All coordinates are DESIGN scene units; the separate optical bench uses
 * model centimetres. Reference relationships: NIH NEI / NIDCD, S2 and S7.
 * No third-party meshes or reference images are included in this data.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { partsFile } from '../../../src/engines/space-scene/schema';

type V3 = [number, number, number];
type P = Record<string, unknown>;
const out = join(import.meta.dirname, '../../../src/content/topics/eyes-and-ears/data/parts.json');
const bi = (en: string, zh: string) => ({ en, zh });
const round = (n: number) => Number(n.toFixed(6));
const tissue = (tint = 'token:bone') => ({ color: 'tissue', tint });
const sphere = (at: V3, radius: number, scale: V3, color = 'tissue', tint = 'token:bone'): P =>
  ({ kind: 'sphere', at, size: [radius], scale, color, tint });
const sweep = (at: V3, path: V3[], radius: number | number[], more: P = {}): P =>
  ({ kind: 'sweep', at, path, radius, color: 'tissue', tint: 'token:bone', radial: 12, ...more });
const lathe = (at: V3, profile: number[][], more: P = {}): P =>
  ({ kind: 'lathe', at, profile, segments: 48, rotation: [0, 0, -90], ...tissue(), ...more });
const ring = (at: V3, inner: number, outer: number, thick: number, more: P = {}): P =>
  lathe(at, [[inner, -thick / 2], [outer, -thick / 2], [outer, thick / 2], [inner, thick / 2], [inner, -thick / 2]], more);
const parts: P[] = [];
/** Closed Catmull-Rom outline through control points, `per` samples per span (smooth extrude edges). */
const smoothLoop = (pts: number[][], per = 6) => pts.flatMap((_, i) => {
  const p0 = pts[(i - 1 + pts.length) % pts.length]!, p1 = pts[i]!, p2 = pts[(i + 1) % pts.length]!, p3 = pts[(i + 2) % pts.length]!;
  return Array.from({ length: per }, (_, k) => {
    const t = k / per, t2 = t * t, t3 = t2 * t;
    return [0, 1].map(j => round(.5 * (2 * p1[j]! + (-p0[j]! + p2[j]!) * t + (2 * p0[j]! - 5 * p1[j]! + 4 * p2[j]! - p3[j]!) * t2 + (-p0[j]! + 3 * p1[j]! - 3 * p2[j]! + p3[j]!) * t3)));
  });
});
/** Open Catmull-Rom polyline through control points (ends kept), `per` samples per span; radii clamped ≥ 0. */
const smoothOpen = (pts: number[][], per = 4) => {
  const at = (i: number) => pts[Math.max(0, Math.min(pts.length - 1, i))]!;
  const out: number[][] = [];
  for (let i = 0; i < pts.length - 1; i++) for (let k = 0; k < per; k++) {
    const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2), t = k / per, t2 = t * t, t3 = t2 * t;
    const v = [0, 1].map(j => .5 * (2 * p1[j]! + (-p0[j]! + p2[j]!) * t + (2 * p0[j]! - 5 * p1[j]! + 4 * p2[j]! - p3[j]!) * t2 + (-p0[j]! + 3 * p1[j]! - 3 * p2[j]! + p3[j]!) * t3));
    out.push([round(Math.max(0, v[0]!)), round(v[1]!)]);
  }
  out.push(pts[pts.length - 1]!);
  return out;
};
/** Thin spherical-cap shell profile [r, y] (lathe): outer then inner surface, closed, evenly sampled. */
const capShell = (centreY: number, outer: number, inner: number, fromDeg: number, samples = 28) => {
  const arc = (R: number, reverse: boolean) => Array.from({ length: samples + 1 }, (_, i) => {
    const a = (fromDeg + (90 - fromDeg) * (reverse ? samples - i : i) / samples) * Math.PI / 180;
    return [round(Math.max(0, R * Math.cos(a))), round(centreY + R * Math.sin(a))];
  });
  const out = [...arc(outer, false), ...arc(inner, true)];
  return [...out, out[0]!];
};
function add(id: string, group: string, en: string, zh: string, summaryEn: string, summaryZh: string,
  detailEn: string, detailZh: string, primitive: P, more: P = {}) {
  parts.push({ id, group, name: bi(en, zh), summary: bi(summaryEn, summaryZh), detail: bi(detailEn, detailZh),
    primitive, castShadow: false, ...more });
}

/* Study layout (DESIGN). The enlarged hair-cell window sits below and right of the cochlea, clear of the
 * middle ear; the optical bench sits below the eye, clear of its envelope, its heights drawn ×BENCH_Y. */
const WIN: V3 = [3.15, -1.30, .35];
const win = (dx: number, dy: number, dz = 0): V3 => [round(WIN[0] + dx), round(WIN[1] + dy), round(WIN[2] + dz)];
const BENCH: V3 = [-1, -2.4, 1.3], BENCH_CM = .06, BENCH_Y = 20;
const benchAt = (xCm: number, yCm: number): V3 => [round(BENCH[0] + xCm * BENCH_CM), round(BENCH[1] + yCm * BENCH_CM * BENCH_Y), BENCH[2]];

/* Eye: anterior → posterior is +X. Rings have a genuine open centre. */
add('cornea', 'eye-front', 'Cornea', '角膜',
  'The transparent cornea admits and bends incoming light.', '透明的角膜让光进入，并使光折射。',
  'The cornea is the curved transparent surface at the front of the eye, ahead of the iris and lens. It works with the lens to focus incoming light. [S2]\n\nThis clear shell is an original cutaway schematic. Its thickness and curvature are design choices; the separate optical bench combines the cornea and lens into one effective lens. [S31]',
  '角膜是眼睛前端弯曲、透明的表面，位于虹膜和晶状体之前。它与晶状体一起使入眼的光聚焦。[S2]\n\n这里的透明薄壳是原创剖面示意，厚度与曲率是设计值。另一个光学工位把角膜与晶状体合成一个有效透镜。[S31]',
  lathe([-2, 0, 0], [[0, -1.08], [.25, -1.04], [.44, -.92], [.57, -.73], [.55, -.715], [.42, -.905], [.24, -1.015], [0, -1.055]], { color: 'glass', tint: 'token:bone', arc: 178 }),
  { connects: ['iris'], shell: true });
add('iris', 'eye-front', 'Iris', '虹膜',
  'The iris controls the size of the opening called the pupil.', '虹膜调节称为瞳孔的开口大小。',
  'The iris lies behind the cornea and in front of the lens. The pupil is its opening, not a solid black part. Changing that opening changes how much light can enter. [S2]\n\nSelect this fixed outer rim to inspect the iris. Two non-selectable annular inserts show the two model apertures with the same outer diameter and a twofold change of inner diameter. They are discrete schematic states, not a muscle simulation or a measurement of a child’s pupil. [S31]',
  '虹膜位于角膜后、晶状体前。瞳孔是虹膜中的开口，不是一块黑色实物。开口大小改变，能进入的光量也随之改变。[S2]\n\n可选中的这一圈是虹膜的固定外缘。两张不可选中的环形薄片表示两档模型孔径；外径相同，内径相差两倍。这是离散示意状态，不是肌肉模拟，也不是儿童瞳孔测量。[S31]',
  ring([-2.68, 0, 0], .495, .535, .035, { color: 'tissue', tint: 'token:ink-2' }),
  { connects: ['lens'] });
add('lens', 'eye-front', 'Lens', '晶状体',
  'The lens changes shape to help focus at different distances.', '晶状体改变形状，帮助眼睛看清不同距离。',
  'The lens sits behind the iris, held around its edge by fibres connected to the ciliary body. The cornea and lens together focus light toward the retina. [S2, S3]\n\nDuring near viewing the lens becomes rounder; during far viewing it is flatter. These two biconvex shapes illustrate that change without claiming a measured focal length or quantitative tissue deformation. [S3, S31]',
  '晶状体位于虹膜之后，周缘由连接睫状体的纤维悬持。角膜与晶状体共同把光聚向视网膜。[S2, S3]\n\n看近处时晶状体更圆鼓，看远处时较扁。这里的两种双凸形状只说明这一变化，不表示真实焦距或组织变形量。[S3, S31]',
  lathe([-2.47, 0, 0], [[0, -.14], [.18, -.12], [.34, -.065], [.40, 0], [.34, .065], [.18, .12], [0, .14]], { color: 'glass', tint: 'token:bone' }),
  { connects: ['ciliary-ring', 'vitreous'] });
const fibres = Array.from({ length: 12 }, (_, i) => {
  const a = i / 12 * Math.PI * 2;
  return sweep([-2.47, 0, 0], [[-.02, .40 * Math.sin(a), .40 * Math.cos(a)], [.02, .62 * Math.sin(a), .62 * Math.cos(a)]], .008, { ...tissue('token:ink-3'), caps: 'flat' });
});
add('ciliary-ring', 'eye-front', 'Ciliary ring', '睫状环',
  'The ciliary apparatus changes the tension holding the lens.', '睫状装置改变悬持晶状体的张力。',
  'The ciliary body surrounds the lens and connects to it through suspensory fibres. Changes in muscle action and fibre tension allow the lens to change shape. [S3]\n\nThe ring and a few radial fibres are enlarged schematic landmarks. The number of fibres drawn is not an anatomical count, and their movement is not calculated here. [S31]',
  '睫状体环绕晶状体，通过悬韧带与它相连。肌肉活动和纤维张力的变化，使晶状体能改变形状。[S3]\n\n环与少量放射纤维是便于辨认的放大示意。画出的纤维数不代表解剖总数，这里也不计算纤维运动。[S31]',
  ring([-2.45, 0, 0], .59, .68, .075, { ...tissue('token:muscle-2'), arc: 178 }), { extra: fibres, connects: ['lens'] });
add('sclera-shell', 'eye-receiver', 'Sclera', '巩膜',
  'The sclera forms the tough outer wall of the eyeball.', '巩膜构成眼球坚韧的外壁。',
  'The sclera is the outer coat surrounding most of the eyeball. At the front, the transparent cornea takes its place. The retina lines the inside of the back region. [S24]\n\nThis hollow shell is opened toward the viewer to expose the inside. It is not an empty solid sphere. X-ray changes this outer shell while leaving internal structures readable; dimensions are schematic. [S31]',
  '巩膜包围眼球的大部分，形成外层壁；眼球前端则是透明的角膜。后部内壁的里面衬着视网膜。[S24]\n\n这是一层中空外壳，朝观察者的一面打开，以露出内部。它不是一颗实心球。透视时主要降低外壳的不透明度，使内层仍可辨认；尺寸均为示意。[S31]',
  // Outer then inner wall, smoothed (Catmull-Rom) so the cut face reads as a clean curve, not a polygon.
  lathe([-2, 0, 0], smoothOpen([[.56, -.73], [.73, -.50], [.85, -.10], [.84, .30], [.68, .67], [.35, .88], [0, .95]], 5).concat(smoothOpen([[0, .895], [.32, .83], [.63, .62], [.79, .28], [.80, -.10], [.68, -.48], [.51, -.73]], 5), [[.56, -.73]]), { arc: 225, segments: 64 }),
  { shell: true, connects: ['cornea', 'retina'], castShadow: true });
add('vitreous', 'eye-receiver', 'Vitreous', '玻璃体',
  'The vitreous is the clear gel filling the space behind the lens.', '玻璃体是填充晶状体后方空间的透明胶状物。',
  'The vitreous occupies the large space between the lens and retina. It is a transparent gel rather than air. [S24]\n\nA translucent volume distinguishes the filling from the surrounding thin layers. Its open front and low opacity make the retina visible; the shape and displayed transparency are design choices. [S31]',
  '玻璃体位于晶状体与视网膜之间的大部分空间内，是透明胶状物，不是空气。[S24]\n\n这里用半透明的体积把填充物与周围薄层区分开。前方打开并降低不透明度，让视网膜可以看见；形状和透明程度是显示设计。[S31]',
  lathe([-2, 0, 0], [[0, -.34], [.57, -.34], [.75, -.10], [.74, .28], [.59, .58], [.29, .78], [0, .84]], { color: 'glass', tint: 'token:bone', arc: 190 }),
  { connects: ['retina'] });
add('retina', 'eye-receiver', 'Retina', '视网膜',
  'The retina receives light and starts electrical signalling.', '视网膜接收光，并启动电信号传递。',
  'The retina is a thin light-sensitive layer at the back inside the eye. Rod and cone cells help convert incoming light into electrical activity. [S2, S24]\n\nThis thin lining follows the inside wall; it is not a second eyeball. Individual receptor distributions and the later processing of vision in the brain are omitted. Light rays stop at the receiver in the separate bench; nerve paths show signals. [S31]',
  '视网膜是眼球内部后方的一层薄薄的感光组织，其中的视杆细胞和视锥细胞帮助把入射光转成电活动。[S2, S24]\n\n这里的薄层贴着内壁，不是另一个眼球。模型没有画感光细胞分布，也没有模拟脑内的视觉处理。另一个工位的光线止于接收面，神经路径表示信号。[S31]',
  // A smooth, even lining just inside the sclera (centre y .08, radius ≈ .817): the cut edge reads as one clean curve.
  // Arc just under 180°: its own clean end face lies on the kept side of the eye cut, so the label anchor stays on show.
  lathe([-2, 0, 0], capShell(.08, .808, .792, -34), { ...tissue('token:muscle-1'), arc: 178, segments: 64 }),
  { connects: ['optic-nerve'] });
add('optic-nerve', 'eye-receiver', 'Optic nerve', '视神经',
  'The optic nerve carries visual signals toward the brain.', '视神经把视觉信号传向大脑。',
  'The optic nerve leaves the back of the eye and carries electrical signals from the retina toward the brain. Light does not continue along the nerve. [S2]\n\nThe bundled tube and moving markers are schematic. The displayed speed is for reading the route, not a measured nerve conduction speed, and the brain lies outside this model. [S31]',
  '视神经从眼球后部离开，把来自视网膜的电信号传向大脑。光不会沿视神经继续前进。[S2]\n\n束状管与移动标记都是示意。显示速度只为看清路径，不表示神经传导速度；大脑位于模型之外。[S31]',
  sweep([-1.12, .03, -.12], [[0, 0, 0], [.19, -.02, -.04], [.43, -.08, -.11]], [.13, .115, .10], { color: 'nerve', tint: 'token:bone' }),
  { connects: ['retina'] });

/* Ear: simplified original outlines, three continuous ossicles. */
// Smooth ear outline: helix over the top and down the back, a soft lobule, the tragus side toward the canal (+x).
const pinnaOutline = smoothLoop([[.20,.50],[.10,.76],[-.12,.86],[-.36,.73],[-.49,.40],[-.51,.02],[-.43,-.36],[-.29,-.62],[-.13,-.75],[.02,-.67],[.06,-.47],[.08,-.27],[.17,-.13],[.22,.12],[.22,.34]]);
const helixRim: V3[] = [[.14,.66,0],[.02,.77,0],[-.12,.80,.005],[-.30,.69,.01],[-.42,.42,.012],[-.45,.05,.012],[-.39,-.30,.01],[-.27,-.54,.005]];
const antihelix: V3[] = [[-.20,-.34,0],[-.27,-.06,.005],[-.25,.22,.008],[-.13,.48,.005],[.02,.58,0]];
add('pinna', 'ear-transfer', 'Pinna', '耳廓',
  'The pinna helps collect sound toward the ear canal.', '耳廓帮助把声音汇入外耳道。',
  'The pinna is the visible outer flap of the ear. Its folds lead toward the entrance of the ear canal; it is only one part of the ear. [S7]\n\nThis single-ear schematic uses an original outer rim and inner fold. Fine skin anatomy and personal differences are omitted, and this station is enlarged independently from the eye. [S31]',
  '耳廓是从外面看得见的耳部，褶皱通向外耳道入口。它只是耳朵的一部分。[S7]\n\n这一只耳的示意由原创外缘与内侧褶皱组成，省略皮肤细节和个体差异。它与眼睛工位分别放大，不共用真实比例。[S31]',
  { kind: 'extrude', at: [.90, 0, -.18], shape: pinnaOutline, depth: .13, bevel: .04, ...tissue('token:muscle-1') },
  { extra: [
    sweep([.90,0,-.10], helixRim, [.035,.05,.058,.062,.06,.056,.05,.042], { ...tissue('token:muscle-1'), segments: 64, radial: 14, caps: 'round' }),
    sweep([.90,0,-.11], antihelix, [.028,.036,.038,.034,.024], { ...tissue('token:muscle-2'), segments: 40, radial: 12, caps: 'round' }),
    sphere([.96,-.13,-.06],.12,[.75,1,1.1],'tissue','token:muscle-2'),
  ], connects: ['canal'], clip: false });
add('canal', 'ear-transfer', 'Ear canal', '外耳道',
  'The ear canal guides sound vibration to the eardrum.', '外耳道把声音振动传到鼓膜。',
  'The ear canal runs inward from the pinna and ends at the eardrum. It does not continue through the middle ear into the cochlea. [S7]\n\nThe open U-shaped wall exposes the air passage in this longitudinal cut. Its shortened path is a display choice; do not put objects into the ear canal. [S18, S31]',
  '外耳道从耳廓向内延伸，止于鼓膜，并不会穿过中耳一直通到耳蜗。[S7]\n\n纵切示意用打开的U形壁露出通道，路径为展示而缩短。不要把物品伸入外耳道。[S18, S31]',
  sweep([1.05,-.13,0], [[0,0,0],[.13,.01,-.02],[.28,.045,-.035],[.46,.06,-.045]], [.18,.16,.15,.17], { hollow: .035, section: { u: 210 }, up: [0,0,-1], caps: 'none', ...tissue('token:muscle-1') }),
  { connects: ['pinna','eardrum'], shell: true });
add('eardrum', 'ear-transfer', 'Eardrum', '鼓膜',
  'The eardrum vibrates when sound reaches the end of the canal.', '声音到达外耳道末端，使鼓膜振动。',
  'The eardrum is a thin membrane at the inner end of the ear canal. Its movement passes to the malleus, the first of the three middle-ear bones. [S7, S8]\n\nThe sloping, shallow membrane vibrates slowly here so its motion can be seen. The shown displacement and timing are illustrative, not measured eardrum movement. [S31]',
  '鼓膜位于外耳道内端，是一层薄膜。它的运动传给锤骨，即中耳三块听小骨中的第一块。[S7, S8]\n\n这里把浅凹、倾斜的薄膜慢放振动，便于观察。显示的位移与节律只是示意，不是鼓膜运动测量。[S31]',
  lathe([1.51,-.065,-.045], [[0,-.035],[.10,-.022],[.19,.012],[.235,.035]], { color: 'membrane', tint: 'token:bone', rotation: [0,0,-72] }),
  { connects: ['canal','malleus'] });
add('malleus', 'ear-transfer', 'Malleus', '锤骨',
  'The malleus transfers movement from the eardrum to the incus.', '锤骨把鼓膜运动传给砧骨。',
  'The handle of the malleus contacts the eardrum, while its rounded head articulates with the incus. It is one of the three ossicles. [S7, S8]\n\nThe head and curved handle are an original simplified outline. The slow rocking motion shows transfer through the connected chain without claiming a real lever gain or biological delay. [S31]',
  '锤骨的柄与鼓膜接触，圆头与砧骨相接。它是三块听小骨之一。[S7, S8]\n\n圆头与弯柄是原创简化外形。慢速摆动用来说明相连骨链传递运动，不表示真实杠杆增益或生理延迟。[S31]',
  sphere([1.68,.26,-.065],.105,[.9,1.1,.9]),
  { extra: [sweep([1.68,.26,-.065], [[0,0,0],[-.035,-.14,0],[-.12,-.30,.015],[-.16,-.42,.02]], [.053,.043,.03,.022]), sweep([1.64,.15,-.065], [[0,0,0],[-.13,.01,.01]], [.035,.018])], connects: ['eardrum','incus'], explode: {dir:[0,.8,.4],dist:.26} });
add('incus', 'ear-transfer', 'Incus', '砧骨',
  'The incus links the malleus to the stapes.', '砧骨连接锤骨与镫骨。',
  'The incus is the middle bone of the ossicle chain. Its body meets the malleus, and its long process reaches the stapes. [S7, S8]\n\nThe two processes are kept distinct in this original schematic. The contact at each end is enlarged enough to read; small joints and ligaments are omitted. [S31]',
  '砧骨位于听小骨链中间，体部与锤骨相接，长突伸向镫骨。[S7, S8]\n\n原创示意保留了可分辨的两个突起。两端接触处放大以便观察，省略细小关节与韧带。[S31]',
  sphere([1.86,.25,-.065],.105,[1.15,.8,.8]),
  { extra: [sweep([1.86,.25,-.065], [[0,0,0],[.12,.055,-.025],[.20,.02,-.03]], [.05,.032,.015]), sweep([1.86,.25,-.065], [[0,0,0],[.10,-.13,0],[.20,-.27,.01],[.29,-.29,.015]], [.048,.038,.024,.025])], connects: ['malleus','stapes'], explode: {dir:[0,1,.4],dist:.30} });
add('stapes', 'ear-transfer', 'Stapes', '镫骨',
  'The stapes footplate transfers movement at the oval window.', '镫骨底板在卵圆窗处传递运动。',
  'The stapes receives movement from the incus. Its two limbs join a footplate that rests at the oval window, transferring movement into the inner ear. [S8]\n\nThe two crura and single footplate are explicit in this original schematic. The small piston-like movement is illustrative and stays at the window; it is not a spinning bone. [S31]',
  '镫骨接收砧骨的运动，两条脚连接一块底板，底板位于卵圆窗处，把运动传入内耳。[S8]\n\n原创示意明确画出两脚和一块底板。小幅活塞式运动只作说明，底板保持在窗处；镫骨不会自转。[S31]',
  sphere([2.15,-.04,-.05],.04,[1,1,1]),
  { extra: [sweep([2.15,-.04,-.05], [[0,0,0],[.11,.065,0],[.24,.065,0]], [.022,.018,.021]), sweep([2.15,-.04,-.05], [[0,0,0],[.11,-.065,0],[.24,-.065,0]], [.022,.018,.021]), sphere([2.40,-.04,-.05],.09,[.18,1.2,.65])], connects: ['incus','oval-window'], explode: {dir:[0,.4,1],dist:.24} });
add('oval-window', 'ear-transfer', 'Oval window', '卵圆窗',
  'The oval window is the interface where stapes movement enters the inner ear.', '卵圆窗是镫骨运动传入内耳的界面。',
  'The stapes footplate sits at the oval window. Its movement passes to the fluid-filled inner ear rather than carrying a stream of outside air into the cochlea. [S8]\n\nThe thin oval interface and footplate touch in this schematic. Surrounding bone is omitted to expose that relationship; the displayed size is not a measurement. [S31]',
  '镫骨底板位于卵圆窗处，其运动传到充满液体的内耳，并不是把外界空气不断送进耳蜗。[S8]\n\n薄薄的椭圆界面与底板在示意中相接。为了露出这层关系，周围骨壁被省略；显示尺寸不是测量值。[S31]',
  sphere([2.415,-.04,-.05],.105,[.12,1.15,.67],'membrane','token:bone'), { connects: ['stapes','cochlea-shell'] });
add('eustachian-tube', 'ear-transfer', 'Eustachian tube', '咽鼓管',
  'The Eustachian tube helps equalise pressure across the eardrum.', '咽鼓管帮助平衡鼓膜两侧的气压。',
  'The Eustachian tube connects the middle ear toward the throat and helps equalise pressure. It is not the main route carrying hearing signals to the brain. [S8]\n\nThe downward tube is shown only as context. This lesson does not simulate opening, swallowing or pressure changes. [S31]',
  '咽鼓管连接中耳与咽部方向，帮助平衡气压。它不是把听觉信号传向大脑的主要路径。[S8]\n\n向下的管道只用来定位。本课不模拟管道开放、吞咽或压力变化。[S31]',
  sweep([1.94,-.25,-.20], [[0,0,0],[.12,-.23,-.02],[.36,-.61,-.05]], [.13,.11,.08], { hollow: .025, caps: 'none', ...tissue('token:bone') }), { short: bi('Pressure tube','咽鼓管') });

const coilPath: V3[] = Array.from({ length: 76 }, (_, i) => {
  const t = i / 75, theta = Math.PI + t * Math.PI * 4.5, r = .46 * (1-t) + .055;
  return [round(.515 + r * Math.cos(theta)), round(.05 + r * Math.sin(theta)), round(-.11 - .07*t)];
});
add('cochlea-shell', 'ear-receiver', 'Cochlea', '耳蜗',
  'The fluid-filled cochlea contains structures that turn vibration into signals.', '充满液体的耳蜗含有把振动转成信号的结构。',
  'The cochlea is the coiled hearing structure of the inner ear. Movement at the oval window produces motion in its fluid and a travelling wave along the basilar membrane. [S7]\n\nThis original open spiral shows a cavity, not a pipe draining water out of the ear. Its turns are schematic, not an exact anatomical turn count. A separate enlarged strip makes the membrane and sensory cells readable. [S31]',
  '耳蜗是内耳中卷曲的听觉结构。卵圆窗处的运动使内部液体运动，并在基底膜上形成行波。[S7]\n\n原创的开口螺旋显示腔体，不表示水不断排出耳外。圈数是示意，不是精确解剖计数。另一个放大条带用来展示膜与感受细胞。[S31]',
  sweep([2.43,-.04,0], coilPath, coilPath.map((_,i)=>round(.12-.055*i/75)), { hollow: .022, section: {u:235}, up:[0,0,-1], caps:'none', radial:16, segments:200, ...tissue('token:bone') }),
  { shell:true, extra:[sweep([2.43,-.04,0],coilPath,coilPath.map((_,i)=>round(.087-.045*i/75)),{color:'glass',tint:'token:bone',radial:12,segments:180,caps:'round'})], connects:['oval-window','auditory-nerve'] });
add('basilar-strip', 'ear-receiver', 'Basilar membrane', '基底膜',
  'A travelling wave along the basilar membrane moves nearby sensory structures.', '沿基底膜传播的行波使附近的感受结构运动。',
  'The basilar membrane lies within the cochlea. Cochlear fluid movement sets up a travelling wave along it; different regions respond most strongly to different frequencies. [S7]\n\nThis unfolded strip is an enlarged schematic, at a different scale and outside its anatomical position. A single local patch rises and falls as one sample; this is not a simulation of a spatial travelling wave, biological timing or cochlear tuning. [S31]',
  '基底膜位于耳蜗内部，耳蜗液体的运动在它上面形成行波。不同区域对不同频率的响应较强。[S7]\n\n展开的条带是独立放大示意，比例与原位不同。单个局部膜片作为一个示意样本整体起伏，不模拟空间行波、生理时延或具体的耳蜗调谐曲线。[S31]',
  {kind:'extrude', at:win(0,-.28), shape:[[-.65,-.025],[.65,-.045],[.65,.045],[-.65,.025]], depth:.23, bevel:.008, ...tissue('token:muscle-1')},
  {clip:false,short:bi('Basilar strip','基底膜'),connects:['hair-patch']});
const cellExtra: P[] = [];
const bundleExtra: P[] = [];
for (const x of [-.30,0,.30]) {
  cellExtra.push(sphere(win(x,-.04),.13,[.70,1.55,.70],'tissue','token:bone'));
  for (const [i,h] of [.13,.18,.23].entries()) bundleExtra.push(sweep(win(x+(i-1)*.035,.145),[[0,0,0],[.015,h,0]],.012,{...tissue('token:ink-2'),caps:'flat'}));
}
// Fixed cell bodies stay with the membrane; only the fine bundles tilt.
parts.find(p=>p.id==='basilar-strip')!.extra = cellExtra;
add('hair-patch','ear-receiver','Hair-cell patch','毛细胞局部',
  'Bending the tiny bundles helps sensory hair cells start electrical signalling.','微小纤毛束的弯曲帮助毛细胞启动电信号传递。',
  'Sensory hair cells lie on the cochlear sensory structure. Their tiny hair-like bundles bend during movement and help initiate electrical signalling. These bundles are not ordinary hair. [S7]\n\nThe three cells and a few bundle strokes form an enlarged schematic at a different scale. The number drawn is not a total cell count, and the bundles tilt together as a stylised sample rather than deforming each stereocilium. No ion channels or biological delays are calculated. [S31]',
  '感受毛细胞位于耳蜗的感受结构上，微小的纤毛束在运动中弯曲，帮助启动电信号。纤毛束不是普通毛发。[S7]\n\n这里的三个细胞和少量纤毛笔画是独立比例的放大示意，画出数量不代表细胞总数。纤毛束整体倾斜是风格化样本，不是逐根纤毛的变形模拟，也不计算离子通道或生理时延。[S31]',
  bundleExtra[4]!,
  {extra:bundleExtra.filter((_,i)=>i!==4),clip:false,short:bi('Hair cells','毛细胞'),connects:['basilar-strip','auditory-nerve']});
add('auditory-nerve','ear-receiver','Auditory nerve','听神经',
  'The auditory nerve carries hearing signals toward the brain.','听神经把听觉信号传向大脑。',
  'The auditory nerve carries electrical signals from the cochlea toward the brain. Outside air particles do not travel along this nerve. [S7]\n\nThe tube is a schematic nerve bundle. The signal route connects the enlarged sensory-cell window to this route for teaching; its length and the speed of markers are not biological measurements. [S31]',
  '听神经把来自耳蜗的电信号传向大脑。外界空气粒子不会沿这条神经传到脑里。[S7]\n\n管状形体表示神经束。为了教学，信号路径把放大的感受细胞窗接向这一通路；路径长度和标记速度都不是生理测量。[S31]',
  sweep([3.01,.12,-.22],[[0,0,0],[.23,.14,-.02],[.53,.13,-.07],[.73,.15,-.12]],[.11,.12,.10,.09],{color:'nerve',tint:'token:bone'}),
  {short:bi('Hearing nerve','听神经'),connects:['cochlea-shell']});
const balanceLoops = [
  [[0,0,0],[-.23,.23,-.05],[-.20,.55,-.08],[.02,.65,-.09],[.19,.48,-.07],[.13,.18,-.03],[0,0,0]],
  [[0,0,0],[.05,.23,-.23],[.11,.49,-.34],[.29,.52,-.24],[.36,.29,-.08],[.20,.08,0],[0,0,0]],
  [[0,0,0],[-.25,.07,-.12],[-.37,.22,-.31],[-.19,.29,-.43],[.04,.21,-.31],[.12,.05,-.10],[0,0,0]],
] as V3[][];
add('balance-context','ear-receiver','Balance organs','平衡结构',
  'Nearby vestibular structures help sense head movement and balance.','附近的前庭结构帮助感知头部运动与平衡。',
  'The vestibular structures, including the semicircular canals, lie beside the cochlea. They help with balance and are distinct from the hearing pathway taught here. [S8]\n\nThree simplified loops locate this neighbouring system. No balance experiment, fluid response or individual vestibular function is simulated. [S31]',
  '前庭结构包括半规管，位于耳蜗附近，帮助维持平衡，与这里讲述的听觉通路功能不同。[S8]\n\n三个简化环只用来定位邻近系统，不模拟平衡实验、液体响应或个人前庭功能。[S31]',
  sweep([2.57,.30,-.24],balanceLoops[0]!, .04,{...tissue('token:ink-3'),closed:true}),
  {extra:balanceLoops.slice(1).map(path=>sweep([2.57,.30,-.24],path,.04,{...tissue('token:ink-3'),closed:true})),short:bi('Balance','平衡结构')});

/* Study points: deliberately asymmetrical, separate from anatomical retina. */
add('object-top','study-bench','Object top','物体上部',
  'This point marks the upper part of the model object.','这一点表示模型物体的上部。',
  'The upper point supplies one set of rays to the effective lens. At the receiver its beam centre lies below the optical axis. [S11]\n\nThe model height is one model centimetre. The bench draws heights twenty times taller than distances so the inverted image and any blur can be seen; this vertical exaggeration is schematic. This larger amber point and the smaller teal lower point, with their matching rays, make the inversion readable without drawing a photographic image; these are design values, not eye measurements. [S31]',
  '物体上部的一点向有效透镜提供一组光线；在接收面上，这束光的中心位于光轴下方。[S11]\n\n模型高度为一模型厘米。为了看清倒像和光斑，实验台把高度画成距离的二十倍，这是示意性的竖向放大。较大的琥珀色上点、较小的青色下点及各自同色的光线帮助辨认倒立关系，不表示完整照片；这些是设计值，不是眼球测量。[S31]',
  {kind:'sphere',at:benchAt(-40,1),size:[.04],color:'token:ray-top'},{clip:false,connects:['retinal-screen']});
add('object-bottom','study-bench','Object bottom','物体下部',
  'This point marks the lower part of the model object.','这一点表示模型物体的下部。',
  'The lower point supplies the other three rays in the optical model. Its beam centre reaches the upper part of the receiver. [S11]\n\nIts height is minus half a model centimetre, drawn with the same twentyfold vertical exaggeration as the rest of the bench. The two unequal marker sizes and colours belong to the teaching object and do not represent a living structure. [S31]',
  '模型下部的一点提供另一组三条光线，它的光束中心到达接收面的上部。[S11]\n\n高度为负半模型厘米，与整个实验台一样按二十倍竖向放大绘制。两个大小、颜色不同的标记只属于教学物体，不表示生物结构。[S31]',
  {kind:'sphere',at:benchAt(-40,-.5),size:[.026],color:'token:ray-bottom'},{clip:false,connects:['object-top']});
add('retinal-screen','study-bench','Model receiver','模型接收面',
  'The fixed receiver shows where the model light bundle arrives.','固定接收面显示模型光束落在哪里。',
  'This receiver represents the retina in the separate effective-lens model. Light rays terminate at the receiver; a focused point or blur is derived from the same thin-lens geometry as the readouts. [S11]\n\nIt stays four model centimetres behind the effective lens. Heights on the bench, including the spot, are drawn twenty times taller than distances (a schematic vertical exaggeration). This frame is not a second anatomical retina, and its dimensions are design values rather than human measurements. [S31]',
  '这一接收面在独立有效透镜模型中代表视网膜。光线到这里为止；清晰点或散开的光斑与读数使用同一套薄透镜几何计算。[S11]\n\n它固定在有效透镜后四模型厘米。实验台上的高度（包括光斑）都画成距离的二十倍，这是示意性的竖向放大。线框不是另一层解剖视网膜，尺寸是设计值，不是人体测量。[S31]',
  // Receiver half-height .45 scene units covers every near/far image and blur at BENCH_Y; the thin lens disc spans the drawn aperture.
  {kind:'box',at:benchAt(4,0),size:[.008,.9,.008],color:'token:ink-2'},
  {extra:[{kind:'box',at:[benchAt(4,0)[0],round(BENCH[1]-.45),BENCH[2]],size:[.008,.008,.10],color:'token:ink-2'},{kind:'box',at:[benchAt(4,0)[0],round(BENCH[1]+.45),BENCH[2]],size:[.008,.008,.10],color:'token:ink-2'},lathe(BENCH,[[0,-.014],[.10,-.010],[.17,0],[.10,.010],[0,.014]],{color:'tissue',tint:'token:ink-3',segments:32,scale:[1,1,.35]})],clip:false,short:bi('Receiver','接收面')});
add('signal-marker','ear-receiver','Signal','信号',
  'This marker identifies the start of the hearing-signal route.','这一标记指出听觉信号通路的起点。',
  'Electrical signalling begins after sensory transduction, rather than being a continuation of incoming light or a stream of outside air. [S2, S7]\n\nThe small marker sits beside the enlarged hair-cell window. Moving route markers represent signals only, and their size and speed are chosen for visibility. [S31]',
  '感受结构转导之后才开始电信号传递；它不是入射光的延续，也不是外界空气流。[S2, S7]\n\n小标记位于放大毛细胞窗旁。路径中的移动标记只表示信号，大小与速度按可见性设计。[S31]',
  sphere(win(.74,-.24),.045,[1,1,1],'tissue','token:ink-2'),{clip:false,connects:['hair-patch','auditory-nerve']});
add('wave-reference','study-bench','Particle reference','粒子参照',
  'The rest mark shows that a medium particle moves locally back and forth.','静止位置标记显示介质粒子只在附近来回运动。',
  'In a longitudinal sound wave, medium particles move back and forth about their rest positions while the wave pattern travels. A particle does not make the journey from a source to the ear. [S9]\n\nThis fixed tick marks the highlighted particle’s rest position. The silent model uses a fixed slowdown factor and relative displacement; it is not a sound-level meter or a hearing test. [S31]',
  '纵向声波中的介质粒子在静止位置附近往复，而波的形态向前传播。粒子不会从声源一路走到耳朵。[S9]\n\n固定短刻度标出高亮粒子的静止位置。无声模型使用固定慢放倍率与相对位移，不是声级计或听力测试。[S31]',
  {kind:'box',at:[1.25,-1.50,1.29],size:[.006,.10,.006],color:'token:ink-2'}, {extra:[{kind:'box',at:[.985,-1.53,1.29],size:[.006,.07,.006],color:'token:ink-3'},{kind:'box',at:[3.015,-1.53,1.29],size:[.006,.07,.006],color:'token:ink-3'}],clip:false,short:bi('Rest position','静止位置')});

// Fixed outer iris diameter; only the opening changes. Context is not selectable.
for (const [id,inner] of [['iris-aperture-small',.12],['iris-aperture-large',.24]] as const) parts.push({
  id,name:bi(inner===.12?'Small iris aperture':'Large iris aperture',inner===.12?'虹膜小开口':'虹膜大开口'),group:'eye-front',context:true,castShadow:false,primitive:ring([-2.68,0,0],inner,.50,.018,{...tissue('token:ink-2')}),
  summary:bi('This insert shows one model pupil opening.','这张薄片显示一档模型瞳孔开口。'),
  detail:bi('Original schematic annulus with a fixed outer diameter and a control-selected inner aperture. It is non-selectable context belonging to the iris. [S31]','原创环形示意保持外径不变，由控件选择内孔。这是属于虹膜的不可选中背景件。[S31]'),
});

const presets = [
  {id:'overview',label:bi('OVERVIEW','总览'),camera:{position:[0,2,11.8],target:[.20,0,0],fov:32}},
  {id:'eye',label:bi('EYE','眼睛'),camera:{position:[-4.3,1.1,4.8],target:[-2,0,0],fov:28}},
  // The optical bench under the eye: object points, effective lens and receiver all in frame, the eye above.
  // (hudFrame only fits subjects the authored view includes, so the whole bench is inside this frame.)
  {id:'focus-bench',label:bi('FOCUS','聚焦'),camera:{position:[-2.05,-.45,9.4],target:[-2.05,-1.0,.7],fov:30}},
  {id:'ear',label:bi('EAR','耳朵'),camera:{position:[2,1.0,5.4],target:[2.1,.02,-.05],fov:30}},
  // Cochlea and the enlarged hair-cell window below it, both clear of the caption band.
  {id:'cochlea',label:bi('COCHLEA','耳蜗'),camera:{position:[2.95,.25,5.9],target:[3.0,-.45,.1],fov:30}},
  // The particle row is the subject; the ear stays above it as context.
  {id:'wave',label:bi('VIBRATION','振动'),camera:{position:[2.1,-.05,6.3],target:[2.1,-.5,.65],fov:28}},
];
const boneAnimations = ['drum-vibrate','malleus-rock','incus-rock','stapes-piston'];
const sequence = (id:string,target:string,offset:V3,pivot?:V3) => ({id,target,kind:'sequence',loop:true,...(pivot?{pivot}:{}),keys:[
  {t:0,offset:[0,0,0]}, {t:.25,offset}, {t:.5,offset:[0,0,0]}, {t:.75,offset:offset.map(n=>-n)}, {t:1,offset:[0,0,0]},
]});
const animations = [
  sequence('drum-vibrate','eardrum',[.008,0,0]),
  {id:'malleus-rock',target:'malleus',kind:'oscillate',axis:[0,0,1],amplitude:1.5,hz:1,pivot:[1.68,.26,-.065]},
  {id:'incus-rock',target:'incus',kind:'oscillate',axis:[0,0,1],amplitude:1.3,hz:1,pivot:[1.86,.25,-.065]},
  sequence('stapes-piston','stapes',[.008,0,0]),
  sequence('basilar-wave','basilar-strip',[0,.045,0]),
  {id:'bundle-bend',target:'hair-patch',kind:'sequence',loop:true,pivot:win(0,.145),keys:[
    {t:0,offset:[0,0,0],rotation:[0,0,0]},
    {t:.25,offset:[0,.045,0],rotation:[0,0,5]},
    {t:.5,offset:[0,0,0],rotation:[0,0,0]},
    {t:.75,offset:[0,-.045,0],rotation:[0,0,-5]},
    {t:1,offset:[0,0,0],rotation:[0,0,0]},
  ]},
];

const numberOutput = (id:string,en:string,zh:string,unit:string,decimals=3) => ({id,from:id,kind:'number',label:bi(en,zh),unit,decimals});
const choice = (id:string,en:string,zh:string) => ({id,kind:'choice',label:bi(en,zh),default:'far',options:[{id:'near',label:bi('Near','近')},{id:'far',label:bi('Far','远')}]});
const sim = {
  kind:'senses',
  controls:[
    {id:'light-in',kind:'toggle',label:bi('Incoming light','入射光'),default:true},
    {id:'pupil-mm',kind:'step',label:bi('Model aperture','模型孔径'),default:2,values:[2,4],unit:'mm'},
    choice('object-range','Object distance','物距'), choice('lens-focus','Focus setting','聚焦设置'),
    {id:'sound-active',kind:'toggle',label:bi('Vibration active','振动启用'),default:true},
    {id:'frequency-hz',kind:'step',label:bi('Example frequency','示例频率'),default:250,values:[250,500],unit:'Hz'},
    {id:'amplitude',kind:'step',label:bi('Relative displacement','相对位移'),default:1,values:[1,2],unit:'×'},
  ],
  outputs:[
    numberOutput('aperture-area','Aperture area','开口面积','mm²'),
    numberOutput('relative-light','Relative incoming light','相对进光量','×',0),
    numberOutput('image-distance','Image distance','像距','model cm'),
    numberOutput('magnification','Focal-plane magnification','焦面放大率','×'),
    numberOutput('retinal-top-y','Receiver centre height','接收面光束中心高度','model cm'),
    numberOutput('blur-diameter','Geometric blur diameter','几何光斑直径','model cm'),
    {id:'focus-state',from:'focus-state',kind:'state',label:bi('Geometric focus','几何焦点'),states:{'on-retina':bi('On receiver','在接收面上'),'before-retina':bi('Before receiver','在接收面前'),'behind-retina':bi('Behind receiver','在接收面后')}},
    {id:'eye-state',from:'eye-state',kind:'state',label:bi('Light state','光照状态'),states:{dark:bi('Dark · geometry prediction','暗处·几何预测'),lit:bi('Lit','有光')}},
    numberOutput('visual-hz','Displayed frequency','显示频率','Hz',0),
    numberOutput('wavelength-scene','Model wavelength · scene units','模型波长·场景单位','u'),
    numberOutput('displacement-max','Maximum model displacement · scene units','模型最大位移·场景单位','u'),
    numberOutput('amplitude-level','Relative displacement amplitude','相对位移振幅','×',0),
    {id:'sound-state',from:'sound-state',kind:'state',label:bi('Vibration state','振动状态'),states:{still:bi('Still','静止'),vibrating:bi('Vibrating','振动')}},
  ],
  bind:[
    {control:'pupil-mm',part:'iris-aperture-small',visible:{eq:2}},
    {control:'pupil-mm',part:'iris-aperture-large',visible:{eq:4}},
    {control:'lens-focus',part:'lens',pose:{far:'lens-far',near:'lens-near'}},
    {control:'object-range',part:['object-top','object-bottom'],pose:{far:'object-far',near:'object-near'}},
    {output:'visual-hz',animation:boneAnimations,hz:{per:1,origin:0}},
    {output:'sound-state',animation:boneAnimations,enabled:{eq:'vibrating'}},
    {control:'light-in',flow:'optic-signal',visible:{eq:true}},
    {control:'sound-active',flow:'auditory-signal',visible:{eq:true}},
  ],
  senses:{
    eye:{illumination:'light-in',pupilMm:'pupil-mm',object:'object-range',focus:'lens-focus',objectsCm:{near:12,far:40},focalCm:{near:3,far:40/11},retinaCm:4,referencePupilMm:2,objectHeightsCm:[1,-.5],sources:['S11','S31']},
    sound:{active:'sound-active',frequencyHz:'frequency-hz',amplitude:'amplitude',slowFactor:250,baseFrequencyHz:250,baseWavelengthScene:1,baseDisplacementScene:.035,sources:['S9','S10','S31']},
  },
  overlays:[
    {kind:'paraxial-eye',group:'study-bench',model:'eye',origin:BENCH,cmToScene:BENCH_CM,yScale:BENCH_Y,pointColors:['token:ray-top','token:ray-bottom'],halfApertureSamples:1,when:{control:'light-in',is:true}},
    {kind:'longitudinal-wave',group:'study-bench',model:'sound',origin:[1,-1.5,1.3],axis:[1,0,0],count:41,spacing:.05,referenceIndex:5,when:{control:'sound-active',is:true}},
  ],
};

const data = {
  parts,
  groups:[
    {id:'eye-front',name:bi('Eye entrance','眼前部'),color:'token:ink-2'},
    {id:'eye-receiver',name:bi('Retina and nerve','视网膜与神经'),color:'token:ink-2'},
    {id:'ear-transfer',name:bi('Eardrum and bones','鼓膜与听骨'),color:'token:ink-2'},
    {id:'ear-receiver',name:bi('Cochlea and nerve','耳蜗与神经'),color:'token:ink-2'},
    {id:'study-bench',name:bi('Model studies','示意实验'),color:'token:ink-2',card:false},
    {id:'nerve-signals',name:bi('Nerve signals','神经信号'),color:'token:en-electrical'},
  ],
  flows:[
    {id:'optic-signal',group:'nerve-signals',path:[[-1.17,.03,-.12],[-1.08,.02,-.12],[-.92,.0,-.16],[-.69,-.05,-.23]],speed:.22,color:'token:en-electrical',count:18,size:.7,spread:.006,parts:['retina','optic-nerve'],clip:false},
    {id:'auditory-signal',group:'nerve-signals',path:[win(.74,-.24),win(.80,.10,-.05),win(.66,.48,-.12),[3.62,-.42,-.05],[3.22,-.05,-.18],[3.01,.12,-.22],[3.24,.26,-.24],[3.54,.25,-.29],[3.74,.27,-.34]],speed:.28,color:'token:en-electrical',count:32,size:.7,spread:.006,parts:['hair-patch','auditory-nerve'],clip:false},
  ],
  animations,
  poses:{
    'lens-far':{lens:{pivot:[-2.47,0,0],scale:[1,1,1]},duration:.5},
    'lens-near':{lens:{pivot:[-2.47,0,0],scale:[1.5,.88,.88]},duration:.5},
    'object-far':{'object-top':{offset:[0,0,0]},'object-bottom':{offset:[0,0,0]},duration:.3},
    'object-near':{'object-top':{offset:[round((40-12)*BENCH_CM),0,0]},'object-bottom':{offset:[round((40-12)*BENCH_CM),0,0]},duration:.3},
  },
  views:{
    assembled:{camera:presets[0]!.camera},exploded:{camera:presets[3]!.camera},
    cutaway:{normal:[0,0,-1],offset:0},section:{plane:'xy'},cover:presets[0]!.camera,
    hudFrame:{parts:['cornea','sclera-shell','object-top','object-bottom','retinal-screen','pinna','cochlea-shell','auditory-nerve','basilar-strip','hair-patch','signal-marker','wave-reference']},
    insets:[{id:'hair-cell-window',parts:['basilar-strip','hair-patch','signal-marker'],label:bi('Enlarged schematic · different scale','放大示意·非同一比例')}],
    cuts:{'eye-cut':{normal:[0,0,-1],offset:0,label:bi('Eye section','眼部剖面')},'ear-cut':{normal:[0,0,-1],offset:0,label:bi('Ear section','耳部剖面')}},
  },
  presets,
  spec:[
    {key:bi('Model','模型'),value:bi('Original schematic · separate scales','原创示意·各工位比例不同'),tag:'design'},
    {key:bi('Optics','光学'),value:bi('Cornea + lens → one effective lens','角膜与晶状体合成一个有效透镜'),tag:'sim'},
    {key:bi('Bench heights','实验台高度'),value:bi(`Vertical ×${BENCH_Y} · schematic`,`竖向放大 ×${BENCH_Y}·示意`),tag:'design'},
    {key:bi('Hair-cell window','毛细胞窗'),value:bi('Enlarged schematic · different scale','放大示意·非同一比例'),tag:'design'},
  ],
  sim,
};

// Validate the geometry contract before writing; cross-file sources are checked
// by pnpm validate after the topic's prose and source files have been authored.
partsFile.parse(data);
if (parts.filter(p=>!p.context).length !== 26 || parts.filter(p=>p.context).length !== 2) throw new Error('Expected 26 selectable parts and two iris inserts');
mkdirSync(dirname(out), {recursive:true});
writeFileSync(out, JSON.stringify(data,null,2)+'\n');
