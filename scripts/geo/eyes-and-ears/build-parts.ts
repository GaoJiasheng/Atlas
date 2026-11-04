/**
 * Original schematic anatomy, not traced geometry or a measured specimen.
 * Rebuild with: pnpm tsx scripts/geo/eyes-and-ears/build-parts.ts
 * All coordinates are DESIGN scene units; the separate optical bench uses
 * model centimetres. Reference relationships: NIH NEI / NIDCD, S2 and S7.
 * No third-party meshes or reference images are included in this data.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { polishEar, writeEarModel } from './sculpt-ear';
import { polishEye, createEyeMeshes } from './polish-eye';
import { partsFile } from '../../../src/engines/space-scene/schema';
import { partPieces } from '../../../src/engines/space-scene/stages/model3d/geometry';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

type V3 = [number, number, number];
type P = Record<string, unknown>;
const out = join(import.meta.dirname, '../../../src/content/topics/eyes-and-ears/data/parts.json');
const bi = (en: string, zh: string) => ({ en, zh });
const round = (n: number) => Number(n.toFixed(6));
const tissue = (tint = 'token:bone') => ({ color: 'tissue', tint });
// Preserve 32 vertical samples on the enlarged cell bodies. Tiny markers and
// the narrow oval window need fewer angular stations than the fixed 48×32 sphere.
const sphere = (at: V3, radius: number, scale: V3, color = 'tissue', tint = 'token:bone'): P => {
  const rows=radius>=.12?32:radius<=.045?16:20;
  const segments=radius>=.12?32:radius<=.045?20:24;
  return {kind:'lathe',at,profile:Array.from({length:rows+1},(_,i)=>[
    Number((radius*Math.sin(Math.PI*i/rows)).toFixed(6)),
    Number((radius*Math.cos(Math.PI*i/rows)).toFixed(6)),
  ]).reverse(),segments,scale,color,tint};
};
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
  'Admits and bends incoming light.', '透明的角膜让光进入，并使光折射。',
  'The clear, curved cornea lies at the front of the eye, ahead of the iris and lens. It works with the lens to focus incoming light. [S2]\n\nThe cutaway opens this layer to show the inside. Its thickness and curve are simplified. On the optical bench, one lens represents the focusing action of both cornea and lens. [S31]',
  '透明、弯曲的角膜位于眼睛前端，在虹膜与晶状体之前。它与晶状体共同聚焦入眼的光。[S2]\n\n剖面打开这一层，让内部显露出来，厚度与弯曲程度都经过简化。光学实验台用一个透镜代表角膜与晶状体共同的聚焦作用。[S31]',
  lathe([-2, 0, 0], [[0, -1.08], [.25, -1.04], [.44, -.92], [.57, -.73], [.55, -.715], [.42, -.905], [.24, -1.015], [0, -1.055]], { color: 'glass', tint: 'token:bone', arc: 178 }),
  { connects: ['iris'], shell: true });
add('iris', 'eye-front', 'Iris', '虹膜',
  'Controls the size of the pupil opening.', '调节瞳孔开口大小。',
  'The iris lies behind the cornea and in front of the lens. The pupil is its opening. Changing the opening changes how much light enters. [S2]\n\nSelect the outer rim to inspect the iris. The model switches between two ring shapes: their outer diameters match, while one inner diameter is twice the other. The inserts cannot be selected separately. They show opening size without simulating muscles or measuring a child’s pupil. [S31]',
  '虹膜位于角膜后、晶状体前。瞳孔是虹膜的开口，开口大小改变，进光量也改变。[S2]\n\n点选外缘观察虹膜。模型切换两种环形：外径相同，一种内径是另一种的两倍。内部薄片不能单独点选，只显示开口大小，不模拟肌肉或测量儿童瞳孔。[S31]',
  ring([-2.68, 0, 0], .495, .535, .035, { color: 'tissue', tint: 'token:ink-2' }),
  { connects: ['lens'] });
add('lens', 'eye-front', 'Lens', '晶状体',
  'Changes shape to help focus at different distances.', '晶状体改变形状，帮助眼睛看清不同距离。',
  'The lens sits behind the iris. Fibres around its edge connect it to the ciliary body. Together, cornea and lens focus light towards the retina. [S2, S3]\n\nThe lens becomes rounder for near viewing and flatter for far viewing. Both shapes curve outwards on both sides. They illustrate the change without measuring focal length or tissue deformation. [S3, S31]',
  '晶状体位于虹膜之后，周缘的纤维连接睫状体。角膜与晶状体共同把光聚向视网膜。[S2, S3]\n\n看近时晶状体较圆鼓，看远时较扁。两种形状的两面都向外凸，只用来说明变化，不测量焦距或组织变形量。[S3, S31]',
  lathe([-2.47, 0, 0], [[0, -.14], [.18, -.12], [.34, -.065], [.40, 0], [.34, .065], [.18, .12], [0, .14]], { color: 'glass', tint: 'token:bone' }),
  { connects: ['ciliary-ring', 'vitreous'] });
const fibres = Array.from({ length: 12 }, (_, i) => {
  const a = i / 12 * Math.PI * 2;
  return sweep([-2.47, 0, 0], [[-.02, .40 * Math.sin(a), .40 * Math.cos(a)], [.02, .62 * Math.sin(a), .62 * Math.cos(a)]], .008, { ...tissue('token:ink-3'), caps: 'flat' });
});
add('ciliary-ring', 'eye-front', 'Ciliary ring', '睫状环',
  'Changes the pull of the fibres holding the lens.', '改变悬持晶状体的纤维张力。',
  'The ciliary body surrounds the lens. Muscles change the pull of its supporting fibres, allowing the lens to change shape. [S3]\n\nThe ring and a few spreading fibres are enlarged to show their positions. The drawing does not count all the fibres or calculate their movement. [S31]',
  '睫状体环绕晶状体。肌肉改变悬持纤维的张力，让晶状体改变形状。[S3]\n\n环和向外伸展的少量纤维经过放大，方便辨认位置。画面没有显示全部纤维，也不计算纤维运动。[S31]',
  ring([-2.45, 0, 0], .59, .68, .075, { ...tissue('token:muscle-2'), arc: 178 }), { extra: fibres, connects: ['lens'] });
add('sclera-shell', 'eye-receiver', 'Sclera', '巩膜',
  'Forms the tough outer wall of the eyeball.', '巩膜构成眼球坚韧的外壁。',
  'The tough sclera surrounds most of the eyeball. The clear cornea forms the front surface, and the retina lines the inside of the back region. [S24]\n\nThe model opens the hollow shell towards you to reveal the inside. X-ray makes the outer wall more transparent while keeping the inner parts visible. Sizes are simplified. [S31]',
  '坚韧的巩膜包围眼球大部分。前端表面是透明角膜，后部内壁衬着视网膜。[S24]\n\n模型把中空外壳朝你的一面打开，露出内部。透视让外壁更透明，同时保留清楚的内层。尺寸经过简化。[S31]',
  // Outer then inner wall, smoothed (Catmull-Rom) so the cut face reads as a clean curve, not a polygon.
  lathe([-2, 0, 0], smoothOpen([[.56, -.73], [.73, -.50], [.85, -.10], [.84, .30], [.68, .67], [.35, .88], [0, .95]], 5).concat(smoothOpen([[0, .895], [.32, .83], [.63, .62], [.79, .28], [.80, -.10], [.68, -.48], [.51, -.73]], 5), [[.56, -.73]]), { arc: 225, segments: 64 }),
  { shell: true, connects: ['cornea', 'retina'], castShadow: true });
add('vitreous', 'eye-receiver', 'Vitreous', '玻璃体',
  'The vitreous is the clear gel filling the space behind the lens.', '玻璃体是填充晶状体后方空间的透明胶状物。',
  'The vitreous is a clear gel filling the large space between lens and retina. [S24]\n\nThe model uses a partly transparent shape to distinguish this filling from the thin layers around it. Its front is opened so the retina stays visible. The shape and transparency are simplified for viewing. [S31]',
  '玻璃体是透明胶状物，填充晶状体与视网膜之间的大部分空间。[S24]\n\n模型用半透明形体区分填充物和周围薄层，并打开前方，让视网膜显露出来。形状和透明程度都按观察需要简化。[S31]',
  lathe([-2, 0, 0], [[0, -.34], [.57, -.34], [.75, -.10], [.74, .28], [.59, .58], [.29, .78], [0, .84]], { color: 'glass', tint: 'token:bone', arc: 190 }),
  { connects: ['retina'] });
add('retina', 'eye-receiver', 'Retina', '视网膜',
  'Receives light and starts electrical signalling.', '视网膜接收光，并启动电信号传递。',
  'The retina is a thin, light-sensitive layer at the back inside the eye. Rod and cone cells help turn light into electrical signals. [S2, S24]\n\nThe lining follows the inner wall. Cell arrangements and the brain’s later processing are left out. On the optical bench, light ends at the receiver. Along the nerve, moving marks show signals. [S31]',
  '视网膜是眼内后部薄薄的感光组织。视杆细胞与视锥细胞帮助把光转成电信号。[S2, S24]\n\n这一层贴着内壁。模型省略了细胞排列和后续脑内处理。实验台上的光到接收面为止，沿神经移动的标记则表示信号。[S31]',
  // A smooth, even lining just inside the sclera (centre y .08, radius ≈ .817): the cut edge reads as one clean curve.
  // Arc just under 180°: its own clean end face lies on the kept side of the eye cut, so the label anchor stays on show.
  lathe([-2, 0, 0], capShell(.08, .808, .792, -34), { ...tissue('token:muscle-1'), arc: 178, segments: 64 }),
  { connects: ['optic-nerve'] });
add('optic-nerve', 'eye-receiver', 'Optic nerve', '视神经',
  'Carries visual signals toward the brain.', '视神经把视觉信号传向大脑。',
  'The optic nerve leaves the back of the eye. It carries electrical signals from the retina towards the brain, rather than light. [S2]\n\nThe tube represents a nerve bundle. Moving marks show the signal route at a speed chosen for viewing. They do not measure nerve speed, and the brain is outside the model. [S31]',
  '视神经从眼球后部伸出，把视网膜的电信号传向大脑，传递的不是光。[S2]\n\n管状形体表示神经束。移动标记以便于观察的速度显示信号路线，不测量神经速度。大脑在模型之外。[S31]',
  sweep([-1.12, .03, -.12], [[0, 0, 0], [.19, -.02, -.04], [.43, -.08, -.11]], [.13, .115, .10], { color: 'nerve', tint: 'token:bone' }),
  { connects: ['retina'] });

/* Ear: simplified original outlines, three continuous ossicles. */
// Smooth ear outline: helix over the top and down the back, a soft lobule, the tragus side toward the canal (+x).
const pinnaOutline = smoothLoop([[.20,.50],[.10,.76],[-.12,.86],[-.36,.73],[-.49,.40],[-.51,.02],[-.43,-.36],[-.29,-.62],[-.13,-.75],[.02,-.67],[.06,-.47],[.08,-.27],[.17,-.13],[.22,.12],[.22,.34]]);
const helixRim: V3[] = [[.14,.66,0],[.02,.77,0],[-.12,.80,.005],[-.30,.69,.01],[-.42,.42,.012],[-.45,.05,.012],[-.39,-.30,.01],[-.27,-.54,.005]];
const antihelix: V3[] = [[-.20,-.34,0],[-.27,-.06,.005],[-.25,.22,.008],[-.13,.48,.005],[.02,.58,0]];
add('pinna', 'ear-transfer', 'Pinna', '耳廓',
  'Helps collect sound toward the ear canal.', '耳廓帮助把声音汇入外耳道。',
  'The pinna is the visible outer part of the ear. Its folds lead towards the ear canal. [S7]\n\nThe model shows one ear with a simplified rim and inner fold. Skin details and differences between people are left out. The eye and ear are enlarged by different amounts. [S31]',
  '耳廓是外面看得见的耳部，褶皱通向外耳道。[S7]\n\n模型展示一只耳，外缘与内侧褶皱经过简化，省略皮肤细节和个体差异。眼睛与耳朵的放大程度不同。[S31]',
  { kind: 'extrude', at: [.90, 0, -.18], shape: pinnaOutline, depth: .13, bevel: .04, ...tissue('token:muscle-1') },
  { extra: [
    sweep([.90,0,-.10], helixRim, [.035,.05,.058,.062,.06,.056,.05,.042], { ...tissue('token:muscle-1'), segments: 64, radial: 14, caps: 'round' }),
    sweep([.90,0,-.11], antihelix, [.028,.036,.038,.034,.024], { ...tissue('token:muscle-2'), segments: 40, radial: 12, caps: 'round' }),
    sphere([.96,-.13,-.06],.12,[.75,1,1.1],'tissue','token:muscle-2'),
  ], connects: ['canal'], clip: false });
add('canal', 'ear-transfer', 'Ear canal', '外耳道',
  'Guides sound vibration to the eardrum.', '外耳道把声音振动传到鼓膜。',
  'The ear canal runs inwards from the pinna and ends at the eardrum. It does not extend through the middle ear into the cochlea. [S7]\n\nA lengthwise cut opens the wall into a U shape so you can see the air passage. The path is shortened for display. Keep objects out of the ear canal. [S18, S31]',
  '外耳道从耳廓向内延伸，止于鼓膜，不会穿过中耳通入耳蜗。[S7]\n\n纵向剖面把管壁打开成 U 形，让通道显露出来。路径为展示而缩短。不要把物品伸进耳道。[S18, S31]',
  sweep([1.05,-.13,0], [[0,0,0],[.13,.01,-.02],[.28,.045,-.035],[.46,.06,-.045]], [.18,.16,.15,.17], { hollow: .035, section: { u: 210 }, up: [0,0,-1], caps: 'none', ...tissue('token:muscle-1') }),
  { connects: ['pinna','eardrum'], shell: true });
add('eardrum', 'ear-transfer', 'Eardrum', '鼓膜',
  'Vibrates when sound reaches the end of the canal.', '声音到达外耳道末端，使鼓膜振动。',
  'The eardrum is a thin membrane at the inner end of the ear canal. It passes movement to the malleus, the first of three middle-ear bones. [S7, S8]\n\nThe shallow, sloping membrane vibrates slowly here. Its movement is sized and slowed for viewing, rather than measured from an ear. [S31]',
  '鼓膜是外耳道内端的薄膜，把运动传给锤骨，也就是三块中耳听骨中的第一块。[S7, S8]\n\n浅凹、倾斜的膜在画面中缓慢振动。运动大小与速度以看得清为准，并非耳内实测。[S31]',
  lathe([1.51,-.065,-.045], [[0,-.035],[.10,-.022],[.19,.012],[.235,.035]], { color: 'membrane', tint: 'token:bone', rotation: [0,0,-72] }),
  { connects: ['canal','malleus'] });
add('malleus', 'ear-transfer', 'Malleus', '锤骨',
  'Transfers movement from the eardrum to the incus.', '锤骨把鼓膜运动传给砧骨。',
  'The malleus has a handle touching the eardrum and a rounded head joined to the incus. It is one of the three ossicles. [S7, S8]\n\nIts simplified head and curved handle rock slowly to show movement along the chain. This does not measure how much the bones amplify movement or the delay between them. [S31]',
  '锤骨的柄接触鼓膜，圆头连接砧骨，是三块听小骨之一。[S7, S8]\n\n简化的圆头与弯柄缓慢摆动，显示骨链怎样传递运动，不测量听骨放大运动的倍数或彼此间的延迟。[S31]',
  sphere([1.68,.26,-.065],.105,[.9,1.1,.9]),
  { extra: [sweep([1.68,.26,-.065], [[0,0,0],[-.035,-.14,0],[-.12,-.30,.015],[-.16,-.42,.02]], [.053,.043,.03,.022]), sweep([1.64,.15,-.065], [[0,0,0],[-.13,.01,.01]], [.035,.018])], connects: ['eardrum','incus'], explode: {dir:[0,.8,.4],dist:.26} });
add('incus', 'ear-transfer', 'Incus', '砧骨',
  'Links the malleus to the stapes.', '砧骨连接锤骨与镫骨。',
  'The incus is the middle bone in the chain. Its body joins the malleus, and its long projection reaches the stapes. [S7, S8]\n\nThe drawing keeps its two projections distinct. Enlarged contacts make the connections visible. Small joints and ligaments are left out. [S31]',
  '砧骨位于骨链中间，体部连接锤骨，长突伸向镫骨。[S7, S8]\n\n图中保留两个不同的突起，放大两端接触处，方便看清连接。细小关节与韧带被省略。[S31]',
  sphere([1.86,.25,-.065],.105,[1.15,.8,.8]),
  { extra: [sweep([1.86,.25,-.065], [[0,0,0],[.12,.055,-.025],[.20,.02,-.03]], [.05,.032,.015]), sweep([1.86,.25,-.065], [[0,0,0],[.10,-.13,0],[.20,-.27,.01],[.29,-.29,.015]], [.048,.038,.024,.025])], connects: ['malleus','stapes'], explode: {dir:[0,1,.4],dist:.30} });
add('stapes', 'ear-transfer', 'Stapes', '镫骨',
  'Transfers movement at the oval window.', '镫骨底板在卵圆窗处传递运动。',
  'The stapes receives movement from the incus. Its two limbs join one footplate at the oval window, passing movement into the inner ear. [S8]\n\nThe drawing shows both limbs and the single footplate. The footplate stays at the window and moves back and forth like a small piston, without spinning. Its movement is illustrative. [S31]',
  '镫骨接收砧骨的运动。两条脚连接一块底板，底板在卵圆窗处把运动传入内耳。[S8]\n\n图中画出两脚和一块底板。底板留在窗处，像小活塞一样来回活动，不会自转。运动只作示意。[S31]',
  sphere([2.15,-.04,-.05],.04,[1,1,1]),
  { extra: [sweep([2.15,-.04,-.05], [[0,0,0],[.11,.065,0],[.24,.065,0]], [.022,.018,.021]), sweep([2.15,-.04,-.05], [[0,0,0],[.11,-.065,0],[.24,-.065,0]], [.022,.018,.021]), sphere([2.40,-.04,-.05],.09,[.18,1.2,.65])], connects: ['incus','oval-window'], explode: {dir:[0,.4,1],dist:.24} });
add('oval-window', 'ear-transfer', 'Oval window', '卵圆窗',
  'Passes movement from the stapes into the inner ear.', '把镫骨运动传入内耳。',
  'The stapes footplate sits at the oval window. Its movement pushes the fluid inside the inner ear; outside air does not flow into the cochlea. [S8]\n\nThe oval surface touches the footplate in the model. Surrounding bone is left out to show this connection, and the sizes are simplified. [S31]',
  '镫骨底板位于卵圆窗处，运动推动内耳液体，并非让外界空气流进耳蜗。[S8]\n\n模型中，椭圆表面与底板相接。周围骨壁被省略，让连接显露出来，尺寸也经过简化。[S31]',
  sphere([2.415,-.04,-.05],.105,[.12,1.15,.67],'membrane','token:bone'), { connects: ['stapes','cochlea-shell'] });
add('eustachian-tube', 'ear-transfer', 'Eustachian tube', '咽鼓管',
  'Helps equalise pressure across the eardrum.', '咽鼓管帮助平衡鼓膜两侧的气压。',
  'The Eustachian tube connects the middle ear to the throat and helps balance pressure across the eardrum. Hearing signals reach the brain through the auditory nerve. [S8]\n\nThe downward tube shows its position. The model does not simulate opening, swallowing or pressure changes. [S31]',
  '咽鼓管连接中耳与咽部，帮助平衡鼓膜两侧气压。听觉信号经听神经传向大脑。[S8]\n\n向下的管道显示它的位置，不模拟开放、吞咽或气压变化。[S31]',
  sweep([1.94,-.25,-.20], [[0,0,0],[.12,-.23,-.02],[.36,-.61,-.05]], [.13,.11,.08], { hollow: .025, caps: 'none', ...tissue('token:bone') }), { short: bi('Pressure tube','咽鼓管') });

const coilPath: V3[] = Array.from({ length: 76 }, (_, i) => {
  const t = i / 75, theta = Math.PI + t * Math.PI * 4.5, r = .46 * (1-t) + .055;
  return [round(.515 + r * Math.cos(theta)), round(.05 + r * Math.sin(theta)), round(-.11 - .07*t)];
});
add('cochlea-shell', 'ear-receiver', 'Cochlea', '耳蜗',
  'The fluid-filled cochlea contains structures that turn vibration into signals.', '充满液体的耳蜗含有把振动转成信号的结构。',
  'The cochlea is the curled hearing structure in the inner ear. Movement at the oval window disturbs its fluid and sends a wave along the basilar membrane. [S7]\n\nThe open spiral reveals a cavity, rather than a pipe draining water. Its turns are simplified, so do not use them as an exact anatomical count. The separate enlarged strip shows the membrane and sensory cells. [S31]',
  '耳蜗是内耳中卷曲的听觉结构。卵圆窗处的运动扰动液体，使波沿基底膜传播。[S7]\n\n打开的螺旋露出腔体，并非排水管。圈数经过简化，不能当作精确解剖计数。独立放大条带显示膜与感受细胞。[S31]',
  sweep([2.43,-.04,0], coilPath, coilPath.map((_,i)=>round(.12-.055*i/75)), { hollow: .022, section: {u:235}, up:[0,0,-1], caps:'none', radial:16, segments:200, ...tissue('token:bone') }),
  { shell:true, extra:[sweep([2.43,-.04,0],coilPath,coilPath.map((_,i)=>round(.087-.045*i/75)),{color:'glass',tint:'token:bone',radial:12,segments:180,caps:'round'})], connects:['oval-window','auditory-nerve'] });
add('basilar-strip', 'ear-receiver', 'Basilar membrane', '基底膜',
  'Supports sensory structures moved by a travelling wave.', '支撑随行波而运动的感受结构。',
  'The basilar membrane lies inside the cochlea. Fluid movement sends a wave along it. Different regions respond most strongly to different frequencies. [S7]\n\nThis enlarged strip unfolds part of the membrane outside its usual position, at a separate scale. A local patch rises and falls together. It illustrates movement without calculating a travelling wave, biological timing or an exact frequency response. [S31]',
  '基底膜位于耳蜗内。液体运动使波沿膜传播，不同区域对不同频率响应最强。[S7]\n\n放大条带把部分膜展开，另用比例，摆在原位之外。局部膜片一起起伏，只说明运动，不计算行波、生理时延或精确的频率响应。[S31]',
  {kind:'extrude', at:win(0,-.28), shape:[[-.65,-.025],[.65,-.045],[.65,.045],[-.65,.025]], depth:.23, bevel:.008, ...tissue('token:muscle-1')},
  {clip:false,short:bi('Basilar strip','基底膜'),connects:['hair-patch']});
const cellExtra: P[] = [];
const bundleExtra: P[] = [];
for (const x of [-.30,0,.30]) {
  cellExtra.push(sphere(win(x,-.04),.13,[.70,1.55,.70],'tissue','token:bone'));
  for (const [i,h] of [.13,.18,.23].entries()) bundleExtra.push(sweep(win(x+(i-1)*.035,.145),[[0,0,0],[.015,h,0]],.012,{...tissue('token:ink-2'),caps:'flat',segments:4,radial:8}));
}
// Fixed cell bodies stay with the membrane; only the fine bundles tilt.
parts.find(p=>p.id==='basilar-strip')!.extra = cellExtra;
add('hair-patch','ear-receiver','Hair-cell patch','毛细胞局部',
  'Starts electrical signalling when tiny bundles bend.','微小纤毛束弯曲，帮助启动电信号。',
  'Hair cells have tiny bundles of hair-like projections. Movement bends the bundles and helps start electrical signals. These are different from ordinary hairs. [S7]\n\nThe three enlarged cells are examples at a separate scale, rather than a total count. Their bundles tilt together. The model does not calculate each projection’s bending, ion channels or biological delays. [S31]',
  '毛细胞顶部有微小的毛发状突起束。运动使小束弯曲，帮助启动电信号。它们与普通毛发不同。[S7]\n\n三个放大细胞另用比例，只举例说明，不表示总数。小束一起倾斜，没有逐根计算弯曲，也没有模拟离子通道或生理时延。[S31]',
  bundleExtra[4]!,
  {extra:bundleExtra.filter((_,i)=>i!==4),clip:false,short:bi('Hair cells','毛细胞'),connects:['basilar-strip','auditory-nerve']});
add('auditory-nerve','ear-receiver','Auditory nerve','听神经',
  'Carries hearing signals toward the brain.','听神经把听觉信号传向大脑。',
  'The auditory nerve carries electrical signals from the cochlea towards the brain. Outside air particles do not travel along it. [S7]\n\nThe tube represents a nerve bundle. The signal route links the enlarged cell view to this nerve. Its length and marker speed help show the pathway, rather than measure a body. [S31]',
  '听神经把耳蜗的电信号传向大脑，外界空气粒子不会沿神经前进。[S7]\n\n管状形体表示神经束。信号路线把放大细胞区接向这条神经。路径长度和标记速度用于展示路线，并非人体测量。[S31]',
  sweep([3.01,.12,-.22],[[0,0,0],[.23,.14,-.02],[.53,.13,-.07],[.73,.15,-.12]],[.11,.12,.10,.09],{color:'nerve',tint:'token:bone'}),
  {short:bi('Hearing nerve','听神经'),connects:['cochlea-shell']});
const balanceLoops = [
  [[0,0,0],[-.23,.23,-.05],[-.20,.55,-.08],[.02,.65,-.09],[.19,.48,-.07],[.13,.18,-.03],[0,0,0]],
  [[0,0,0],[.05,.23,-.23],[.11,.49,-.34],[.29,.52,-.24],[.36,.29,-.08],[.20,.08,0],[0,0,0]],
  [[0,0,0],[-.25,.07,-.12],[-.37,.22,-.31],[-.19,.29,-.43],[.04,.21,-.31],[.12,.05,-.10],[0,0,0]],
] as V3[][];
add('balance-context','ear-receiver','Balance organs','平衡结构',
  'Nearby vestibular structures help sense head movement and balance.','附近的前庭结构帮助感知头部运动与平衡。',
  'The vestibular structures, including semicircular canals, lie beside the cochlea. They help with balance and have a different role from hearing. [S8]\n\nThree simplified loops show where these structures lie. The model does not simulate balance, fluid responses or a person’s balance function. [S31]',
  '前庭结构包括半规管，位于耳蜗附近。它们帮助维持平衡，作用与听觉不同。[S8]\n\n三个简化环显示这些结构的位置，不模拟平衡、液体响应或个人平衡功能。[S31]',
  sweep([2.57,.30,-.24],balanceLoops[0]!, .04,{...tissue('token:ink-3'),closed:true}),
  {extra:balanceLoops.slice(1).map(path=>sweep([2.57,.30,-.24],path,.04,{...tissue('token:ink-3'),closed:true})),short:bi('Balance','平衡结构')});

/* Study points: deliberately asymmetrical, separate from anatomical retina. */
add('object-top','study-bench','Object top','物体上部',
  'This point marks the upper part of the model object.','这一点表示模型物体的上部。',
  'Rays from the upper point pass through the model lens. Their centre lands below the optical axis, the central line through the lens and receiver. [S11]\n\nThis point is one model centimetre high. Heights are drawn twenty times larger relative to horizontal distances so you can see the inverted image and blur. The upper point is larger and amber; the lower point is smaller and teal. Matching ray colours help you follow each point. These are model settings, rather than eye measurements. [S31]',
  '上点的光线穿过模型透镜，光束中心落到光轴下方。光轴是穿过透镜与接收面的中心线。[S11]\n\n上点高一模型厘米。高度相对水平距离放大二十倍，方便看清倒像与光斑。上点较大、呈琥珀色，下点较小、呈青色，同色光线帮助跟随各点。这些是模型设定，不是眼球测量。[S31]',
  sphere(benchAt(-40,1),.04,[1,1,1],'token:ray-top','token:ray-top'),{clip:false,connects:['retinal-screen']});
add('object-bottom','study-bench','Object bottom','物体下部',
  'This point marks the lower part of the model object.','这一点表示模型物体的下部。',
  'The lower point provides the other three rays. Their centre lands on the upper part of the receiver. [S11]\n\nIt is minus half a model centimetre high, with the same twentyfold vertical enlargement as the rest of the bench. Marker sizes and colours distinguish points on a teaching object. [S31]',
  '下点提供另一组三条光线，光束中心落到接收面上部。[S11]\n\n高度为负半模型厘米，与实验台其余部分一样竖向放大二十倍。标记的大小和颜色用来区分教学物体上的两点。[S31]',
  sphere(benchAt(-40,-.5),.026,[1,1,1],'token:ray-bottom','token:ray-bottom'),{clip:false,connects:['object-top']});
add('retinal-screen','study-bench','Model receiver','模型接收面',
  'The fixed receiver shows where the model light bundle arrives.','固定接收面显示模型光束落在哪里。',
  'The receiver stands for the retina on the optical bench. Light paths end here. The same lens calculation gives both the readings and the focused point or blurred spot. [S11]\n\nIt stays four model centimetres behind the lens. All heights, including the spot, are drawn twenty times larger relative to horizontal distances. The receiver is a diagram at a chosen scale, rather than another retinal layer in the eye. [S31]',
  '接收面在光学实验台上代表视网膜。光路到这里为止，读数与清晰点或模糊光斑来自同一套透镜计算。[S11]\n\n它固定在透镜后四模型厘米。所有高度，包括光斑，都相对水平距离放大二十倍。这是按设定比例画出的示意面，不是眼内另一层视网膜。[S31]',
  // Receiver half-height .45 scene units covers every near/far image and blur at BENCH_Y; the thin lens disc spans the drawn aperture.
  {kind:'box',at:benchAt(4,0),size:[.008,.9,.008],color:'token:ink-2'},
  {extra:[{kind:'box',at:[benchAt(4,0)[0],round(BENCH[1]-.45),BENCH[2]],size:[.008,.008,.10],color:'token:ink-2'},{kind:'box',at:[benchAt(4,0)[0],round(BENCH[1]+.45),BENCH[2]],size:[.008,.008,.10],color:'token:ink-2'},lathe(BENCH,[[0,-.014],[.10,-.010],[.17,0],[.10,.010],[0,.014]],{color:'tissue',tint:'token:ink-3',segments:32,scale:[1,1,.35]})],clip:false,short:bi('Receiver','接收面')});
add('signal-marker','ear-receiver','Signal','信号',
  'This marker identifies the start of the hearing-signal route.','这一标记指出听觉信号通路的起点。',
  'Sensory structures turn light or movement into electrical signals. A nerve carries these signals, rather than incoming light or outside air. [S2, S7]\n\nThis marker sits beside the enlarged hair cells. Moving marks show the signal route, with sizes and speeds chosen so you can follow them. [S31]',
  '感受结构把光或运动转成电信号。神经传递这些信号，而非入射光或外界空气。[S2, S7]\n\n标记位于放大的毛细胞旁。移动标记显示信号路线，大小和速度以容易跟随为准。[S31]',
  sphere(win(.74,-.24),.045,[1,1,1],'tissue','token:ink-2'),{clip:false,connects:['hair-patch','auditory-nerve']});
add('wave-reference','study-bench','Particle reference','粒子参照',
  'The rest mark shows that a medium particle moves locally back and forth.','静止位置标记显示介质粒子只在附近来回运动。',
  'In a longitudinal sound wave, particles move back and forth around their rest positions while the wave travels. A particle does not travel from the source to the ear. [S9]\n\nThe fixed tick marks the highlighted particle’s rest position. The silent model uses a fixed slowdown and relative movement size. It does not measure sound level or test hearing. [S31]',
  '纵向声波传播时，粒子在静止位置附近往复，不会从声源一路走到耳朵。[S9]\n\n固定刻度标出高亮粒子的静止位置。静音模型采用固定慢放倍率与相对运动幅度，不测量声级或测试听力。[S31]',
  {kind:'box',at:[1.25,-1.50,1.29],size:[.006,.10,.006],color:'token:ink-2'}, {extra:[{kind:'box',at:[.985,-1.53,1.29],size:[.006,.07,.006],color:'token:ink-3'},{kind:'box',at:[3.015,-1.53,1.29],size:[.006,.07,.006],color:'token:ink-3'}],clip:false,short:bi('Rest position','静止位置')});

// Fixed outer iris diameter; only the opening changes. Context is not selectable.
for (const [id,inner] of [['iris-aperture-small',.12],['iris-aperture-large',.24]] as const) parts.push({
  id,name:bi(inner===.12?'Small iris aperture':'Large iris aperture',inner===.12?'虹膜小开口':'虹膜大开口'),group:'eye-front',context:true,castShadow:false,primitive:ring([-2.68,0,0],inner,.50,.018,{...tissue('token:ink-2')}),
  summary:bi('This insert shows one model pupil opening.','这张薄片显示一档模型瞳孔开口。'),
  detail:bi('This ring shows the selected pupil opening. Its outer edge stays fixed. It belongs to the iris and cannot be selected separately. [S31]','环形薄片显示选定的瞳孔开口，外缘保持固定。它属于虹膜，不能单独点选。[S31]'),
});

const presets = [
  {id:'overview',label:bi('OVERVIEW','总览'),camera:{position:[0,2,11.8],target:[.20,0,0],fov:32}},
  {id:'eye',label:bi('EYE','眼睛'),camera:{position:[-4.3,1.1,4.8],target:[-2,0,0],fov:28}},
  // The optical bench under the eye: object points, effective lens and receiver all in frame, the eye above.
  // (hudFrame only fits subjects the authored view includes, so the whole bench is inside this frame.)
  {id:'focus-bench',label:bi('FOCUS','聚焦'),camera:{position:[-2.05,-.45,9.4],target:[-2.05,-1.0,.7],fov:30}},
  {id:'ear',label:bi('EAR','耳朵'),camera:{position:[1.55,1.0,5.4],target:[1.65,.02,-.05],fov:30}},
  // Cochlea and the enlarged hair-cell window below it, both clear of the caption band.
  {id:'cochlea',label:bi('COCHLEA','耳蜗'),camera:{position:[2.4,-.55,5.55],target:[2.4,-.95,.05],fov:30}},
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
    {id:'eye-state',from:'eye-state',kind:'state',label:bi('Light state','光照状态'),states:{dark:bi('Dark · calculated paths only','无光·仅显示计算光路'),lit:bi('Lit','有光')}},
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
    {key:bi('Model','模型'),value:bi('Simplified organs · separate scales','简化器官·各部分比例不同'),tag:'design'},
    {key:bi('Optics','光学'),value:bi('One lens represents cornea + lens','一个透镜代表角膜与晶状体'),tag:'sim'},
    {key:bi('Bench height scale','实验台竖向比例'),value:bi(`Vertical ×${BENCH_Y} · schematic`,`竖向放大 ×${BENCH_Y}·示意`),tag:'design'},
    {key:bi('Hair-cell window','毛细胞窗'),value:bi('Enlarged schematic · different scale','放大示意·非同一比例'),tag:'design'},
  ],
  sim,
};

polishEar(parts, data);
polishEye(parts, data);
// Preserve the nine existing sweeps verbatim, but ship them as one static mesh
// so the leader can use a surface point instead of the centre of one bristle.
// The explicit bundle-bend pivot still moves all nine together as before.
const hair=parts.find(p=>p.id==='hair-patch')!;
const hairSource=partsFile.parse({...data,model:'/models/eyes-and-ears.glb'}).parts.find(p=>p.id==='hair-patch')!;
const hairPieces=partPieces(hairSource);
const hairMesh=mergeGeometries(hairPieces.map(p=>p.geometry),false)!;
hairMesh.translate(...hairSource.primitive!.at);
const positions=hairMesh.getAttribute('position');
// Outer, tallest bundle: its front/right tip is an actual shipped vertex.
let tip=0;
for(let i=1;i<positions.count;i++) if(positions.getX(i)+positions.getY(i)>positions.getX(tip)+positions.getY(tip))tip=i;
const hairLabel:V3=[positions.getX(tip),positions.getY(tip),positions.getZ(tip)];
hair.mesh='hair-patch';hair.material={color:'tissue',tint:'token:ink-2'};
delete hair.primitive;delete hair.extra;
const eyeMeshes=createEyeMeshes();
// The ciliary ring's bounds centre coincides with the lens centre on screen; its
// leader ends on the ring's upper inner edge at the section plane instead, so the
// two callouts stay distinct (the outer rim sits under the sclera's cut face).
const ringPos=eyeMeshes['ciliary-ring']!.getAttribute('position');
let top=-1;
for(let i=0;i<ringPos.count;i++) if(ringPos.getZ(i)>-.03&&ringPos.getY(i)>.5&&(top<0||ringPos.getY(i)<ringPos.getY(top)))top=i;
const ringLabel:V3=[ringPos.getX(top),ringPos.getY(top),ringPos.getZ(top)];
await writeEarModel({...eyeMeshes,'hair-patch':hairMesh},{'hair-patch':hairLabel,'ciliary-ring':ringLabel});
for(const p of hairPieces)p.geometry.dispose();hairMesh.dispose();
Object.assign(data, {model:'/models/eyes-and-ears.glb'});

// Validate the geometry contract before writing; cross-file sources are checked
// by pnpm validate after the topic's prose and source files have been authored.
partsFile.parse(data);
if (parts.filter(p=>!p.context).length !== 26 || parts.filter(p=>p.context).length !== 2) throw new Error('Expected 26 selectable parts and two iris inserts');
mkdirSync(dirname(out), {recursive:true});
writeFileSync(out, JSON.stringify(data,null,2)+'\n');
