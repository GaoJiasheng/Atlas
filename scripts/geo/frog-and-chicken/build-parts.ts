/**
 * Original observation specimens, not measurements of a species or a clock.
 * Run: pnpm tsx scripts/geo/frog-and-chicken/build-parts.ts
 * Reference: docs/56 §3–4; approved graphite frog/hen and egg/tadpole plates.
 * Main frogs have four fingers per forefoot and five toes per hind foot.
 * Comparison specimens omit digits at their small display size.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { partsFile } from '../../../src/engines/space-scene/schema';

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
const hen = '#ab9580';
const chick = '#cdbd8f';
const foot = '#a98e66';
// Smooth revolved ellipsoids use a deliberate mesh budget instead of the
// sphere primitive's fixed high tessellation on every tiny comparison bead.
const roundProfile = Array.from({ length: 17 }, (_, i): [number, number] => [i === 0 || i === 16 ? 0 : n(Math.sin(i * Math.PI / 16)), n(-Math.cos(i * Math.PI / 16))]);
const ell = (at: V, radii: V, tint: string, color = 'tissue'): P => ({ kind: 'lathe', profile: roundProfile, segments: 24, at, scale: radii, color, tint });
const sweep = (at: V, path: V[], radius: number | number[], tint: string, color = 'tissue', more = {}): P => ({ kind: 'sweep', at, path, radius, radial: 8, segments: 20, color, tint, ...more });
const extrude = (at: V, shape: [number, number][], depth: number, tint: string, color = 'tissue', more = {}): P => ({ kind: 'extrude', at, shape, depth, color, tint, ...more });
const local = (p: P, at: V, s = 1): P => {
  const q: P = { ...p, at: add(at, scale(p.at, s)) };
  // Scale the complete primitive, including its path, through the existing scale field.
  q.scale = scale((p.scale as V | undefined) ?? [1, 1, 1], s);
  return q;
};

/** Side-facing larva: flattened tail membrane, continuous taper, no fish fins. */
function tadpole(legs = false): P[] {
  const p = [
    ell([-.16, .12, 0], [.27, .17, .18], skin),
    sweep([0, 0, 0], [[0, .1, 0], [.28, .11, .025], [.51, .18, 0], [.73, .27, -.015]], [.11, .075, .035, .004], skin),
    extrude([0, 0, 0], [[0, .1], [.18, .28], [.43, .34], [.73, .27], [.48, .09], [.2, -.01]], .018, '#a2aa91'),
    ell([-.29, .2, .13], [.035, .037, .027], dark),
    ell([-.29, .2, -.13], [.035, .037, .027], dark),
  ];
  if (legs) for (const side of [-1, 1]) {
    p.push(sweep([0, 0, 0], [[.03, .09, side * .12], [.21, .025, side * .27], [.12, -.055, side * .32], [.26, -.08, side * .4]], [.065, .055, .029, .025], skin));
    for (let d = 0; d < 5; d++) {
      const z = side * (.34 + d * .032);
      p.push(sweep([0, 0, 0], [[.26, -.08, side * .4], [.34 + (d === 2 ? .07 : .035), -.09, z], [.4 + (d === 2 ? .07 : .015), -.09, z]], [.018, .012, .004], skin));
    }
  }
  return p;
}

/** All four feet remain separate in plan; toes branch from the same ankle. */
function frog(tail = false): P[] {
  const p: P[] = [
    ell([0, .22, 0], [.32, .23, .23], skin),
    ell([-.29, .28, 0], [.255, .15, .245], skin),
    ell([-.37, .4, .16], [.06, .062, .045], dark),
    ell([-.37, .4, -.16], [.06, .062, .045], dark),
    sweep([0, 0, 0], [[-.49, .225, -.16], [-.53, .205, 0], [-.49, .225, .16]], .009, dark),
  ];
  for (const side of [-1, 1]) {
    const ankle: V = [.16, -.015, side * .45];
    p.push(sweep([0, 0, 0], [[.12, .22, side * .15], [.35, .13, side * .29], [-.03, .015, side * .37], ankle], [.12, .13, .05, .035], skin));
    for (let d = 0; d < 5; d++) {
      const end: V = [.37 + .11 * Math.sin(d / 4 * Math.PI), -.025, side * (.32 + d * .073)];
      p.push(sweep([0, 0, 0], [ankle, [n((ankle[0] + end[0]) / 2), -.025, n((ankle[2] + end[2]) / 2)], end], [.021, .014, .005], skin));
    }
    const wrist: V = [-.4, -.02, side * .33];
    p.push(sweep([0, 0, 0], [[-.22, .23, side * .15], [-.23, .09, side * .32], wrist], [.055, .04, .027], skin));
    for (let d = 0; d < 4; d++) {
      const end: V = [-.6 - .07 * Math.sin(d / 3 * Math.PI), -.03, side * (.22 + d * .08)];
      p.push(sweep([0, 0, 0], [wrist, [n((wrist[0] + end[0]) / 2), -.03, n((wrist[2] + end[2]) / 2)], end], [.018, .012, .004], skin));
    }
  }
  if (tail) p.push(sweep([0, 0, 0], [[.21, .2, 0], [.45, .16, 0], [.63, .12, .035]], [.1, .05, .003], skin));
  return p;
}

/** No copied mesh: broad breast, raised neck, short hen tail, two folded wings. */
function bird(adult: boolean): P[] {
  const plumage = adult ? hen : chick;
  // A chick has a rounder, relatively larger head, shorter neck and stubby beak.
  const headY = adult ? 1 : .88;
  const headX = adult ? -.36 : -.28;
  const p: P[] = [
    ell([0, .51, 0], adult ? [.4, .33, .27] : [.35, .32, .29], plumage, 'feathers'),
    sweep([0, 0, 0], adult ? [[-.18, .52, 0], [-.3, .74, 0], [-.32, .94, 0]] : [[-.14, .54, 0], [-.22, .67, 0], [-.25, .8, 0]], adult ? [.2, .145, .11] : [.18, .15, .13], plumage, 'feathers'),
    ell([headX, headY, 0], adult ? [.155, .17, .14] : [.205, .215, .19], plumage, 'feathers'),
    extrude([adult ? -.49 : -.45, headY - .015, 0], adult ? [[.035, .055], [-.17, -.015], [.035, -.045]] : [[.025, .035], [-.09, -.01], [.025, -.035]], adult ? .11 : .085, foot),
    ell([headX - .06, headY + .045, adult ? .12 : .172], [.027, .029, .018], dark),
    ell([headX - .06, headY + .045, adult ? -.12 : -.172], [.027, .029, .018], dark),
  ];
  for (const side of [-1, 1]) {
    p.push(extrude([.02, .54, side * .24], [[-.24, .13], [-.12, .21], [.15, .12], [.31, -.1], [.04, -.17], [-.17, -.08]], .04, plumage, 'feathers'));
    p.push(sweep([0, 0, 0], adult ? [[.02, .32, side * .14], [.045, .14, side * .155], [0, .015, side * .17]] : [[.02, .21, side * .14], [.035, .09, side * .155], [0, .015, side * .17]], adult ? [.05, .029, .022] : [.038, .024, .02], foot));
    for (let d = 0; d < 3; d++) p.push(sweep([0, 0, 0], [[0, .015, side * .17], [-.12, .005, side * .17 + (d - 1) * .065], [-.22, .005, side * .17 + (d - 1) * .085]], [.018, .012, .004], foot));
    p.push(sweep([0, 0, 0], [[0, .015, side * .17], [.12, .005, side * .19]], [.018, .004], foot));
  }
  // Three blunt feather blades give a short tail; a chick only has a small tuft.
  for (const side of [-1, 0, 1]) p.push(extrude([.3, .67, side * .075], [[-.08, -.13], [.11, -.07], [adult ? .34 : .13, adult ? .26 : .08], [.05, .18]], .07, plumage, 'feathers'));
  if (adult) {
    p.push(extrude([-.34, 1.145, 0], [[-.15, 0], [-.12, .12], [-.065, .075], [-.01, .15], [.04, .08], [.09, .11], [.13, -.015]], .045, '#a17d70'));
    p.push(ell([-.42, .87, 0], [.055, .1, .06], '#a17d70'));
  }
  return p;
}

const parts: Record<string, unknown>[] = [];
function part(id: string, group: string, name: ReturnType<typeof bi>, summary: ReturnType<typeof bi>, detail: ReturnType<typeof bi>, geometry: P[], more = {}) {
  if (!geometry.length || geometry.length > 33) throw new Error(`${id}: ${geometry.length} primitives`);
  parts.push({ id, group, name, summary, detail, primitive: geometry[0], ...(geometry.length > 1 ? { extra: geometry.slice(1) } : {}), castShadow: false, ...more });
}
const frogPoints: V[] = [[-2.8, .18, -1.4], [-1.468521, .18, -.432624], [-1.977101, .18, 1.132624], [-3.622899, .18, 1.132624], [-4.131479, .18, -.432624]];
const chickenPoints: V[] = [[2.8, .18, -1.4], [4.012436, .18, .7], [1.587564, .18, .7]];
const base = (v: V, y: number): V => [v[0], y, v[2]];
const eggs: P[] = [];
for (const offset of [[-.19, 0, 0], [.13, .02, -.15], [.13, .02, .17], [-.06, .2, .03]] as V[]) {
  eggs.push(ell(add(base(frogPoints[0]!, .38), offset), [.19, .19, .19], '#c6cbbb', 'membrane'));
  eggs.push(ell(add(base(frogPoints[0]!, .38), offset), [.075, .075, .075], dark));
}
part('frog-eggs', 'frog-cycle', bi('Jelly-coated eggs', '胶质包被的卵'), bi('Enclose developing young', '包围发育中的幼体'), bi('Each jelly capsule surrounds an embryo. Only a small part of a clutch is represented here. [S2]\n\nThis independently enlarged observation is not a count of eggs laid by a particular frog. [S22]', '每个胶质包被围着一个胚胎。这里仅画卵团的一小部分。[S2]\n\n这个观察标本独立放大，不表示某种青蛙一次产卵的数量。[S22]'), eggs);
part('frog-tadpole', 'frog-cycle', bi('Swimming tadpole', '游泳的蝌蚪'), bi('Swims with its tail', '靠尾巴游动'), bi('The rounded body joins a tapering tail and thin tail membrane. This selected free-swimming view has no visible legs and no feathery external gills. [S2, S3]\n\nIt is a young frog, not a fish. Some other frogs develop differently; this is a general pond-frog example. [S3, S5, S22]', '圆胖的身体连着逐渐变细的尾巴和薄尾膜。所选的自由游泳视图不画可见的腿或羽状外鳃。[S2, S3]\n\n它是青蛙的幼体，不是鱼。有些蛙的发育方式不同；这里画的是通用池塘型青蛙的例子。[S3, S5, S22]'), tadpole().map((p) => local(p, base(frogPoints[1]!, .37), .82)));
part('frog-hind-legs', 'frog-cycle', bi('Tadpole with hind legs', '长出后腿的蝌蚪'), bi('Shows the emerging hind legs', '显示逐渐显现的后腿'), bi('Two hind legs are visible beside the tail. The front legs are not yet visible in this chosen observation. [S2, S3]\n\nEach model hind foot has five toes. The stage is a snapshot of continuous change, not a fixed number of days. [S20, S22]', '尾巴两旁各能看到一条后腿。这个观察视图还没有可见的前腿。[S2, S3]\n\n模型每只后足有五趾。它是连续变化中的一个观察画面，不代表固定的发育天数。[S20, S22]'), tadpole(true).map((p) => local(p, base(frogPoints[2]!, .37), .82)));
part('frog-froglet', 'frog-cycle', bi('Froglet with tail', '尾巴尚未吸收完的幼蛙'), bi('Shows a shrinking attached tail', '显示仍连着身体的短尾'), bi('Four limbs support a frog-shaped body while the tail remains attached. During metamorphosis the tail tissues are remodelled and absorbed; the tail does not break off. [S2, S4]\n\nThe model keeps four fingers on each forefoot and five toes on each hind foot. Its tail length is an observation choice, not an age measurement. [S20, S22]', '身体已经呈蛙形，四肢出现，短尾仍与身体相连。变态发育时尾部组织重塑并吸收，不是尾巴断掉。[S2, S4]\n\n模型每只前足保留四指，每只后足五趾。所画尾长只是观察选择，不是日龄测量。[S20, S22]'), frog(true).map((p) => local(p, base(frogPoints[3]!, .28), .78)));
part('frog-adult', 'frog-cycle', bi('Adult frog', '成蛙'), bi('Shows the adult frog form', '显示成蛙的形态'), bi('The broad head, short forelimbs and folded hind limbs show a tailless adult form. It has four fingers on each forefoot and five toes on each hind foot. [S2, S20]\n\nThis original generic specimen is not an identification of a Singapore species. The next-generation link means reproduction; this adult never turns into an egg. [S12, S15, S22]', '宽扁的头、短前肢和屈曲后肢呈现无尾的成体形态。每只前足四指，每只后足五趾。[S2, S20]\n\n这个原创通用标本不用于鉴定新加坡蛙种。通向下一代的连接表示繁殖；成蛙不会变回卵。[S12, S15, S22]'), frog().map((p) => local(p, base(frogPoints[4]!, .28), .95)));

/** Hollow ring-section profile. Complementary 210°/150° sectors close fully. */
const eggOuter: [number, number][] = [[.01, -.52], [.15, -.49], [.28, -.35], [.35, -.1], [.34, .13], [.27, .34], [.14, .49], [.01, .54]];
const eggProfile = [...eggOuter, ...eggOuter.map(([r, y]): [number, number] => [Math.max(.005, r - .025), y * .95]).reverse(), eggOuter[0]!];
const eggAt: V = [2.8, .75, -1.4];
const shellGeometry = (arc: number, yaw: number): P => ({ kind: 'lathe', at: eggAt, profile: eggProfile, segments: 40, arc, rotation: [0, yaw, 0], color: 'tissue', tint: shell });
part('chicken-egg', 'chicken-cycle', bi('Chicken egg', '鸡卵'), bi('Encloses the egg contents', '包围卵内结构'), bi('A hard shell encloses the albumen, yolk and other structures. The model leaves most of the shell in place when its separate window opens. [S6, S7]\n\nThe shell is hollow geometry, not a solid egg hidden with X-ray. Its thickness, size and cut are teaching choices. [S22]', '坚硬的蛋壳包住卵白、卵黄等结构。独立壳窗打开时，其余蛋壳仍留在原位。[S6, S7]\n\n模型蛋壳是有壁厚的空壳，不靠 X 光模式隐藏一个实心卵。壁厚、显示大小和切口都是教学设计。[S22]'), [shellGeometry(210, 25)], { shell: true, connects: ['egg-shell-window', 'egg-white', 'egg-yolk', 'egg-embryo'] });
part('egg-shell-window', 'chicken-cycle', bi('Model shell window', '模型壳窗'), bi('Opens a teaching window', '打开讲解用的示意窗'), bi('This complementary shell sector fits the remaining shell when closed. The reveal control lifts it away, exposing a genuine opening toward the egg close-up camera. [S22]\n\nThis is a teaching cut. Natural hatching is a chick opening and leaving the shell, not this neat removable sector. [S6, S22]', '闭合时，这片壳与其余蛋壳合成完整外壳。打开控件把它移开，形成朝向近看镜头的真实开口。[S22]\n\n这是讲解用的切口。自然孵出是雏鸡打开蛋壳并离开卵，不会切下这样整齐的壳片。[S6, S22]'), [shellGeometry(150, 205)], { shell: true, explode: { dir: [0, 1, 1], dist: .55 }, connects: ['chicken-egg'] });
part('egg-yolk', 'chicken-cycle', bi('Yolk', '卵黄'), bi('Supplies nourishment', '提供营养'), bi('The yolk supplies nourishment to a developing embryo. It is represented by a separate rounded body inside the egg. [S6, S7]\n\nThe embryo lies beside its surface in this schematic example; it is not a miniature chick hidden at the centre of the yolk. [S6, S22]', '卵黄为发育中的胚胎提供营养。模型把它画成卵内独立的圆形结构。[S6, S7]\n\n这个示意例子的胚胎位于卵黄表面旁，不是藏在卵黄中心的缩小雏鸡。[S6, S22]'), [ell([2.77, .72, -1.41], [.215, .225, .215], '#c5a05c')], { explode: { dir: [-1, 0, 0], dist: .45 }, connects: ['egg-embryo', 'egg-white'] });
part('egg-white', 'chicken-cycle', bi('Albumen · egg white', '卵白'), bi('Surrounds the yolk', '围着卵黄'), bi('The albumen surrounds the yolk. It contains water and protein and is separate from the yolk and embryo. [S7]\n\nThe pale translucent envelope is schematic; the model omits the shell membranes, air cell and chalazae rather than inventing their positions. [S7, S22]', '卵白围着卵黄，含水分和蛋白质，与卵黄及胚胎是不同结构。[S7]\n\n浅色透明包络仅作示意。模型省略壳膜、气室和卵黄系带，不虚构它们的位置。[S7, S22]'), [ell([2.8, .75, -1.4], [.302, .465, .302], '#d9d7c7', 'membrane')], { shell: true, explode: { dir: [1, 0, 0], dist: .5 }, connects: ['egg-yolk', 'chicken-egg'] });
part('egg-embryo', 'chicken-cycle', bi('Schematic embryo', '示意胚胎'), bi('Shows a developing embryo example', '显示发育中胚胎的例子'), bi('A curved small body sits beside the yolk in this developing fertilised-egg example. No exact incubation age is assigned to this schematic outline. [S6, S22]\n\nThe embryo is shown only when the window is open and the fertilised example is chosen. A closed view merely conceals it; warmth does not fertilise an unfertilised egg. [S6, S9, S22]', '小而弯曲的身体位于卵黄旁，表示一个正在发育的受精卵例子。此轮廓不对应精确的孵化日龄。[S6, S22]\n\n只有打开壳窗并选择受精例子时才显示胚胎。闭合只是遮住内部；温暖不会使未受精卵受精。[S6, S9, S22]'), [sweep([2.9, .9, -1.22], [[-.05, .02, 0], [-.03, -.07, .015], [.04, -.11, 0], [.08, -.07, -.01]], [.048, .035, .026, .008], '#ab8e82'), ell([2.85, .94, -1.21], [.055, .059, .045], '#ab8e82')], { explode: { dir: [1, 1, 1], dist: .55 }, connects: ['egg-yolk'] });
part('chicken-chick', 'chicken-cycle', bi('Chick', '雏鸡'), bi('Shows the young chicken', '显示幼小的鸡'), bi('A short beak, rounded down-covered body, two wings and two feet identify a young bird. It grows into an adult chicken without a pupa stage. [S6, S9]\n\nThe independently enlarged specimen has simplified down and proportionally short tail feathers. It is not the adult model scaled down. [S22]', '短喙、圆胖的绒羽身体、两翅和两足呈现幼鸟的形态。它逐渐长成成鸡，不经过蛹期。[S6, S9]\n\n标本独立放大，简化绒羽并保留较短尾羽。它不是把成鸡等比例缩小。[S22]'), bird(false).map((p) => local(p, base(chickenPoints[1]!, .24), .64)));
part('chicken-adult', 'chicken-cycle', bi('Adult hen', '成年母鸡'), bi('Shows an adult domestic hen', '显示成年家鸡母鸡'), bi('The broad breast, feathered wings, small comb and short tail show a domestic hen. A cock is also an adult chicken, but this model uses a hen as its example. [S9, S22]\n\nThe chick and hen share the bird body form but differ in proportions and feathers. This is not a field guide to Singapore domestic fowl or Red Junglefowl. [S11, S22]', '丰满的胸部、带羽毛的翅、小鸡冠和短尾呈现家鸡母鸡。公鸡也属于成鸡；这个模型选择母鸡作为例子。[S9, S22]\n\n雏鸡和母鸡都具有鸟类身体形态，比例与羽毛却不同。本图不用于野外区分新加坡家鸡与红原鸡。[S11, S22]'), bird(true).map((p) => local(p, base(chickenPoints[2]!, .24), .98)));

function marker(id: string, group: string, at: V, radius: number, en: string, zh: string) {
  // The pose origin remains the exact planning centre; place its bead on the
  // forward rim so the label anchor cannot disappear inside a specimen.
  part(id, group, bi(en, zh), bi('Marks the chosen observation', '标出当前选定的观察'), bi('The small bead and thin ring are display marks, not organisms or a clock. The control moves the marker between fixed observations; the specimens remain in place. [S22]\n\nMoving back to an earlier observation means inspecting it again, not reversing biological development. [S15, S22]', '小珠和细环是展台标记，不是生物或时钟。控件让标记移到预定观察位置，标本本身留在原位。[S22]\n\n切回较早的观察表示重新查看，不表示生物发育可以倒转。[S15, S22]'), [sweep(at, [[0, 0, radius - .02], [0, 0, radius + .02]], .055, dark, 'tissue', { segments: 4 }), { kind: 'torus', size: [radius, .014], at, rotation: [90, 0, 0], color: 'token:ink-2' }]);
}
marker('frog-marker', 'frog-cycle', frogPoints[0]!, .61, 'Frog observation marker', '青蛙观察标记');
marker('chicken-marker', 'chicken-cycle', chickenPoints[0]!, .62, 'Chicken observation marker', '鸡的观察标记');

// Miniature comparison silhouettes retain the distinguishing stage structures.
const mini: P[] = [];
mini.push(ell([-3.65, .31, 3.5], [.1, .1, .1], '#c6cbbb', 'membrane'), ell([-3.65, .31, 3.5], [.04, .04, .04], dark));
for (let stage = 0; stage < 4; stage++) {
  const x = -3.37 + stage * .31;
  const at: V = [x, .26, 3.5];
  mini.push(ell(add(at, [0, .08, 0]), [.105, .075, .065], skin));
  if (stage < 3) mini.push(sweep(at, [[.07, .07, 0], [.16, .09, .01], [.23 - stage * .035, .14, 0]], [.045, .025, .003], skin));
  if (stage > 0) for (const side of [-1, 1]) mini.push(sweep(at, [[.025, .06, side * .035], [.07, .025, side * .095], [-.015, -.015, side * .13]], [.035, .025, .008], skin));
  if (stage > 1) for (const side of [-1, 1]) mini.push(sweep(at, [[-.05, .07, side * .04], [-.075, .01, side * .09], [-.12, -.015, side * .11]], [.022, .018, .006], skin));
}
part('compare-frog', 'comparison', bi('Frog comparison', '青蛙对照'), bi('Compares selected frog forms', '对照青蛙的不同形态'), bi('Read the jelly-coated egg, tadpole, hind-leg tadpole, froglet with tail and adult. The tail is still attached in the froglet; there is no pupa. [S2, S3]\n\nThese tiny silhouettes omit digits. The main frog tray shows four fingers and five toes on the corresponding feet. Every stage is enlarged independently; spaces do not measure time. [S20, S22]', '依次观察胶质包被的卵、蝌蚪、长出后腿的蝌蚪、带尾幼蛙和成蛙。幼蛙尾巴仍相连，没有蛹期。[S2, S3]\n\n微型轮廓省略指趾细节；主青蛙展台呈现前足四指、后足五趾。各阶段分别放大，间距不代表时间。[S20, S22]'), mini);
const miniBird = (at: V, grown: boolean): P[] => [
  ell(add(at, [0, .15, 0]), [.16, .13, .1], grown ? hen : chick, 'feathers'),
  ell(add(at, [-.11, .31, 0]), [.075, .085, .065], grown ? hen : chick, 'feathers'),
  extrude(add(at, [-.19, .3, 0]), [[.02, .02], [-.06, -.005], [.02, -.025]], .04, foot),
  ...[-1, 1].map((side) => sweep(at, [[.02, .1, side * .05], [.02, 0, side * .06], [-.07, -.01, side * .07]], [.017, .013, .005], foot)),
  ...[-1, 1].map((side) => ell(add(at, [.025, .15, side * .09]), [.095, .065, .025], grown ? hen : chick, 'feathers')),
  extrude(add(at, [.13, .21, 0]), [[-.05, -.06], [.1, .11], [0, .1]], .07, grown ? hen : chick, 'feathers'),
];
part('compare-chicken', 'comparison', bi('Chicken comparison', '鸡的对照'), bi('Compares egg, chick and adult', '对照卵、雏鸡与成鸡'), bi('The chicken comparison shows an egg, a small downy chick and an adult hen. The chick is a young bird, with no intervening pupa. [S6, S9]\n\nEach model is independently enlarged. This row shows order only; it does not compare how long stages take or how large they really are. [S22]', '鸡的对照展示卵、绒羽雏鸡和成年母鸡。雏鸡是幼鸟，中间没有蛹期。[S6, S9]\n\n各模型分别放大。这一排只显示顺序，不比较各阶段持续时间或实际大小。[S22]'), [ell([-1.56, .37, 3.5], [.085, .135, .085], shell), ...miniBird([-1.08, .25, 3.5], false), ...miniBird([-.48, .25, 3.5], true)]);
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
part('compare-mosquito', 'comparison', bi('Mosquito comparison', '蚊子的对照'), bi('Includes the mosquito pupa', '包括蚊子的蛹期'), bi('The four silhouettes represent egg, larva, comma-shaped pupa and six-legged adult. Mosquito larvae and pupae develop in water; the pupa precedes the emerging adult. [S14]\n\nThese are independently enlarged silhouettes, not a frog sequence. The main mosquito topic explains its water stages in detail. [S13, S14, S22]', '四个轮廓分别表示卵、幼虫、逗号形的蛹和六足成虫。蚊子的幼虫与蛹在水中发育，之后成虫羽化。[S14]\n\n这些是分别放大的蚊子轮廓，不是青蛙的阶段。蚊子主题详细讲述水中阶段。[S13, S14, S22]'), mosquitoes);
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
part('compare-plant', 'comparison', bi('Flowering plant comparison', '开花植物对照'), bi('Compares seed, young and adult plant', '对照种子、幼株与成株'), bi('The plant row uses a seed, a young plant and an adult flowering plant. The seed is not called an egg. [S1]\n\nThis is an abbreviated comparison, with independent sizes and no common timescale. Pollination, fruit and seed dispersal belong to the linked plant topic. [S21, S22]', '植物一排用种子、幼株和开花成株进行比较。种子不称为卵。[S1]\n\n这是简化对照，大小分别设定，也没有共同时间尺度。传粉、果实和种子传播由链接的植物主题展开。[S21, S22]'), plants);
marker('comparison-marker', 'comparison', [-3, .2, 3.5], .76, 'Comparison marker', '比较标记');

function arc(cx: number, start: number, end: number): P[] {
  const path: V[] = Array.from({ length: 13 }, (_, i) => {
    const angle = (start + (end - start) * i / 12) * Math.PI / 180;
    return [n(1.4 * Math.sin(angle)), 0, n(-1.4 * Math.cos(angle))];
  });
  const angle = end * Math.PI / 180;
  return [sweep([cx, .145, 0], path, .015, '#7c7b6e'), { kind: 'cone', size: [.047, .13], at: [n(cx + 1.4 * Math.sin(angle)), .145, n(-1.4 * Math.cos(angle))], rotation: [90, 0, n(end - 90)], color: 'token:ink-2' }];
}
for (const [animal, cx, start, source] of [['frog', -2.8, 302, 'S15'], ['chicken', 2.8, 258, 'S15']] as const) {
  part(`${animal}-next-generation`, `${animal}-cycle`, bi('Reproduction · next generation', '繁殖 · 下一代'), bi('Links adults to new offspring', '从成体连接到下一代'), bi(`The final link connects an adult with eggs of a new generation. It does not show the same adult shrinking back into an egg. [${source}]\n\nThe arrow is a static diagram mark. Equal spacing and reversing an observation control do not mean equal durations or reversible development. [S22]`, `最后的连接把成体与下一代的卵联系起来，不表示同一个成体缩回卵中。[${source}]\n\n箭头是静态图示。等距摆放或反向拨动观察控件，都不表示时间相等或发育可以倒转。[S22]`), arc(cx, start, 346));
}
for (const [id, cx, count] of [['frog-tray', -2.8, 5], ['chicken-tray', 2.8, 3]] as const) {
  const marks: P[] = [{ kind: 'cylinder', size: [2.06, 2.1, .12], at: [cx, .055, 0], color: 'tissue', tint: '#c7c5b7' }];
  for (let stage = 0; stage < count - 1; stage++) marks.push(...arc(cx, stage * 360 / count + 14, (stage + 1) * 360 / count - 14));
  part(id, id === 'frog-tray' ? 'frog-cycle' : 'chicken-cycle', bi('Observation tray', '观察展台'), bi('Supports separate observation specimens', '承托各自独立的观察标本'), bi('This low display tray is a diagram support, not a simulated habitat. Static arrows show reading order only. Sizes are independently enlarged and spacing is not time. [S22]', '低矮展台只是图示支撑，不是生境仿真。静态箭头只表示阅读顺序。标本分别放大，间距不代表时间。[S22]'), marks, { context: true, clip: false });
}
part('comparison-tray', 'comparison', bi('Comparison tray', '比较展台'), bi('Supports independently sized comparisons', '承托各自设定大小的对照'), bi('Four separate specimen groups sit on a low tray. No common physical scale or developmental timescale is implied. [S22]', '四组独立标本摆在低矮展台上，不表示共同的实际比例或发育时间尺度。[S22]'), [{ kind: 'bevelBox', size: [8, .12, 1.7], bevel: .035, at: [0, .08, 3.5], color: 'tissue', tint: '#c7c5b7' }], { context: true, clip: false });

const poses: Record<string, unknown> = {};
for (const [prefix, id, points, names] of [
  ['frog', 'frog-marker', frogPoints, ['egg', 'tadpole', 'hind-legs', 'froglet', 'adult']],
  ['chicken', 'chicken-marker', chickenPoints, ['egg', 'chick', 'adult']],
  ['compare', 'comparison-marker', [[-3, .2, 3.5], [-1, .2, 3.5], [1, .2, 3.5], [3, .2, 3.5]], ['frog', 'chicken', 'mosquito', 'plant']],
] as [string, string, V[], string[]][]) for (let i = 0; i < names.length; i++) poses[`${prefix}-at-${names[i]}`] = { [id]: { offset: points[i]!.map((v, j) => n(v - points[0]![j]!)) }, duration: .65 };
poses['egg-window-open'] = { 'egg-shell-window': { offset: [.8, .25, -.41], rotation: [0, 0, 0] }, duration: .65 };
const cameras = [
  ['overview', bi('Whole study', '全图'), [10, 10, 14], [0, .4, 0], 32],
  ['frog-overview', bi('Frog observations', '青蛙观察'), [0, 5, 6], [-2.8, .4, 0], 32],
  ['chicken-overview', bi('Chicken observations', '鸡的观察'), [5.6, 5, 6], [2.8, .4, 0], 32],
  ['egg-close', bi('Inside the egg', '卵的里面'), [3.8, 2.3, .5], [2.8, .5, -1.4], 30],
  ['comparison-view', bi('Compare life cycles', '比较生活史'), [0, 11.7, 16.1], [0, .3, 3.5], 32],
] as const;
const SIM = {
  "kind": "table",
  "controls": [
    {
      "id": "frog-view",
      "kind": "choice",
      "default": "egg",
      "label": {
        "en": "Frog observation",
        "zh": "观察青蛙的阶段"
      },
      "options": [
        {
          "id": "egg",
          "label": {
            "en": "Egg",
            "zh": "卵"
          }
        },
        {
          "id": "tadpole",
          "label": {
            "en": "Tadpole",
            "zh": "蝌蚪"
          }
        },
        {
          "id": "hind-legs",
          "label": {
            "en": "Tadpole with hind legs",
            "zh": "长出后腿的蝌蚪"
          }
        },
        {
          "id": "froglet",
          "label": {
            "en": "Froglet with tail",
            "zh": "尾巴尚未吸收完的幼蛙"
          }
        },
        {
          "id": "adult",
          "label": {
            "en": "Adult frog",
            "zh": "成蛙"
          }
        }
      ]
    },
    {
      "id": "chicken-view",
      "kind": "choice",
      "default": "egg",
      "label": {
        "en": "Chicken observation",
        "zh": "观察鸡的阶段"
      },
      "options": [
        {
          "id": "egg",
          "label": {
            "en": "Egg",
            "zh": "卵"
          }
        },
        {
          "id": "chick",
          "label": {
            "en": "Chick",
            "zh": "雏鸡"
          }
        },
        {
          "id": "adult",
          "label": {
            "en": "Adult chicken",
            "zh": "成鸡"
          }
        }
      ]
    },
    {
      "id": "egg-open",
      "kind": "toggle",
      "default": false,
      "label": {
        "en": "Reveal the egg model",
        "zh": "打开卵的示意模型"
      }
    },
    {
      "id": "fertilised",
      "kind": "toggle",
      "default": true,
      "label": {
        "en": "Fertilised egg example",
        "zh": "受精卵的例子"
      }
    },
    {
      "id": "compare-view",
      "kind": "choice",
      "default": "frog",
      "label": {
        "en": "Cycle to compare",
        "zh": "比较哪一种生活史"
      },
      "options": [
        {
          "id": "frog",
          "label": {
            "en": "Frog",
            "zh": "青蛙"
          }
        },
        {
          "id": "chicken",
          "label": {
            "en": "Chicken",
            "zh": "鸡"
          }
        },
        {
          "id": "mosquito",
          "label": {
            "en": "Mosquito",
            "zh": "蚊子"
          }
        },
        {
          "id": "plant",
          "label": {
            "en": "Flowering plant",
            "zh": "开花植物"
          }
        }
      ]
    }
  ],
  "outputs": [
    {
      "id": "frog-form",
      "kind": "state",
      "label": {
        "en": "Frog form",
        "zh": "青蛙的形态"
      },
      "states": {
        "egg": {
          "en": "Egg",
          "zh": "卵"
        },
        "tadpole": {
          "en": "Tadpole",
          "zh": "蝌蚪"
        },
        "hind-legs": {
          "en": "Tadpole with hind legs",
          "zh": "长出后腿的蝌蚪"
        },
        "froglet": {
          "en": "Froglet with tail",
          "zh": "尾巴尚未吸收完的幼蛙"
        },
        "adult": {
          "en": "Adult frog",
          "zh": "成蛙"
        }
      }
    },
    {
      "id": "chicken-form",
      "kind": "state",
      "label": {
        "en": "Chicken form",
        "zh": "鸡的形态"
      },
      "states": {
        "egg": {
          "en": "Egg",
          "zh": "卵"
        },
        "chick": {
          "en": "Chick",
          "zh": "雏鸡"
        },
        "adult": {
          "en": "Adult chicken",
          "zh": "成鸡"
        }
      }
    },
    {
      "id": "egg-view",
      "kind": "state",
      "label": {
        "en": "Egg model",
        "zh": "卵的模型"
      },
      "states": {
        "closed": {
          "en": "Shell closed",
          "zh": "蛋壳闭合"
        },
        "open": {
          "en": "Model opened",
          "zh": "模型已打开"
        }
      }
    },
    {
      "id": "embryo-view",
      "kind": "state",
      "label": {
        "en": "Developing embryo shown",
        "zh": "是否显示发育中的胚胎"
      },
      "states": {
        "shown": {
          "en": "Schematic embryo revealed",
          "zh": "显示示意胚胎"
        },
        "hidden": {
          "en": "No embryo shown in this view",
          "zh": "此视图不显示胚胎"
        }
      }
    },
    {
      "id": "egg-condition",
      "kind": "state",
      "label": {
        "en": "Development condition",
        "zh": "发育条件"
      },
      "states": {
        "fertilised": {
          "en": "Fertilised; suitable incubation is also needed",
          "zh": "已经受精；还需要适宜的孵化条件"
        },
        "unfertilised": {
          "en": "Unfertilised; warmth does not fertilise it",
          "zh": "没有受精；温暖不会使它受精"
        }
      }
    },
    {
      "id": "comparison",
      "kind": "state",
      "label": {
        "en": "Selected cycle",
        "zh": "选中的生活史"
      },
      "states": {
        "frog": {
          "en": "Frog",
          "zh": "青蛙"
        },
        "chicken": {
          "en": "Chicken",
          "zh": "鸡"
        },
        "mosquito": {
          "en": "Mosquito",
          "zh": "蚊子"
        },
        "plant": {
          "en": "Flowering plant",
          "zh": "开花植物"
        }
      }
    }
  ],
  "bind": [
    {
      "output": "frog-form",
      "part": "frog-marker",
      "pose": {
        "egg": "frog-at-egg",
        "tadpole": "frog-at-tadpole",
        "hind-legs": "frog-at-hind-legs",
        "froglet": "frog-at-froglet",
        "adult": "frog-at-adult"
      }
    },
    {
      "output": "chicken-form",
      "part": "chicken-marker",
      "pose": {
        "egg": "chicken-at-egg",
        "chick": "chicken-at-chick",
        "adult": "chicken-at-adult"
      }
    },
    {
      "output": "egg-view",
      "part": "egg-shell-window",
      "pose": {
        "closed": null,
        "open": "egg-window-open"
      }
    },
    {
      "output": "embryo-view",
      "part": "egg-embryo",
      "visible": {
        "eq": "shown"
      }
    },
    {
      "output": "comparison",
      "part": "comparison-marker",
      "pose": {
        "frog": "compare-at-frog",
        "chicken": "compare-at-chicken",
        "mosquito": "compare-at-mosquito",
        "plant": "compare-at-plant"
      }
    }
  ],
  "table": {
    "experiments": {
      "frog-observation": {
        "keys": [
          "frog-view"
        ],
        "rows": [
          {
            "when": {
              "frog-view": "egg"
            },
            "set": {
              "frog-form": "egg"
            },
            "source": [
              "S22",
              "S2"
            ]
          },
          {
            "when": {
              "frog-view": "tadpole"
            },
            "set": {
              "frog-form": "tadpole"
            },
            "source": [
              "S22",
              "S2"
            ]
          },
          {
            "when": {
              "frog-view": "hind-legs"
            },
            "set": {
              "frog-form": "hind-legs"
            },
            "source": [
              "S22",
              "S2"
            ]
          },
          {
            "when": {
              "frog-view": "froglet"
            },
            "set": {
              "frog-form": "froglet"
            },
            "source": [
              "S22",
              "S2"
            ]
          },
          {
            "when": {
              "frog-view": "adult"
            },
            "set": {
              "frog-form": "adult"
            },
            "source": [
              "S22",
              "S2"
            ]
          }
        ]
      },
      "chicken-observation": {
        "keys": [
          "chicken-view"
        ],
        "rows": [
          {
            "when": {
              "chicken-view": "egg"
            },
            "set": {
              "chicken-form": "egg"
            },
            "source": [
              "S22",
              "S6"
            ]
          },
          {
            "when": {
              "chicken-view": "chick"
            },
            "set": {
              "chicken-form": "chick"
            },
            "source": [
              "S22",
              "S6"
            ]
          },
          {
            "when": {
              "chicken-view": "adult"
            },
            "set": {
              "chicken-form": "adult"
            },
            "source": [
              "S22",
              "S6"
            ]
          }
        ]
      },
      "egg-window": {
        "keys": [
          "egg-open",
          "fertilised"
        ],
        "rows": [
          {
            "when": {
              "egg-open": false,
              "fertilised": false
            },
            "set": {
              "egg-view": "closed",
              "embryo-view": "hidden",
              "egg-condition": "unfertilised"
            },
            "source": [
              "S22",
              "S6",
              "S9"
            ]
          },
          {
            "when": {
              "egg-open": false,
              "fertilised": true
            },
            "set": {
              "egg-view": "closed",
              "embryo-view": "hidden",
              "egg-condition": "fertilised"
            },
            "source": [
              "S22",
              "S6",
              "S9"
            ]
          },
          {
            "when": {
              "egg-open": true,
              "fertilised": false
            },
            "set": {
              "egg-view": "open",
              "embryo-view": "hidden",
              "egg-condition": "unfertilised"
            },
            "source": [
              "S22",
              "S6",
              "S9"
            ]
          },
          {
            "when": {
              "egg-open": true,
              "fertilised": true
            },
            "set": {
              "egg-view": "open",
              "embryo-view": "shown",
              "egg-condition": "fertilised"
            },
            "source": [
              "S22",
              "S6",
              "S9"
            ]
          }
        ]
      },
      "comparison-selection": {
        "keys": [
          "compare-view"
        ],
        "rows": [
          {
            "when": {
              "compare-view": "frog"
            },
            "set": {
              "comparison": "frog"
            },
            "source": [
              "S22"
            ]
          },
          {
            "when": {
              "compare-view": "chicken"
            },
            "set": {
              "comparison": "chicken"
            },
            "source": [
              "S22"
            ]
          },
          {
            "when": {
              "compare-view": "mosquito"
            },
            "set": {
              "comparison": "mosquito"
            },
            "source": [
              "S22"
            ]
          },
          {
            "when": {
              "compare-view": "plant"
            },
            "set": {
              "comparison": "plant"
            },
            "source": [
              "S22"
            ]
          }
        ]
      }
    }
  }
};

const data = {
  parts,
  groups: [
    { id: 'frog-cycle', name: bi('Frog observations', '青蛙观察'), color: 'token:ink-2' },
    { id: 'chicken-cycle', name: bi('Chicken observations', '鸡的观察'), color: 'token:neutral' },
    { id: 'comparison', name: bi('Life-cycle comparison', '生活史比较'), color: 'token:cold' },
  ],
  flows: [], animations: [], poses,
  presets: cameras.map(([id, label, position, target, fov]) => ({ id, label, camera: { position, target, fov } })),
  views: { assembled: { camera: { position: [10, 10, 14], target: [0, .4, 0], fov: 32 } }, cover: { position: [8, 9, 14], target: [0, .5, .6], fov: 32 }, shadows: 'contact', section: { plane: 'xz' } },
  spec: [
    { key: bi('Frog views', '青蛙视图'), value: '5', tag: 'design' },
    { key: bi('Chicken views', '鸡的视图'), value: '3', tag: 'design' },
    { key: bi('Model', '模型'), value: bi('Observation, not a forecast', '观察模型，不是发育预测'), tag: 'design' },
  ],
  sim: SIM,
};
// Parse before writing, but keep author JSON rather than transformed pose schema.
partsFile.parse(data);
mkdirSync(join(out, '..'), { recursive: true });
writeFileSync(out, JSON.stringify(data, null, 2) + '\n');
process.stdout.write(`frog-and-chicken: ${parts.filter((p) => !p.context).length} selectable + ${parts.filter((p) => p.context).length} context; ${Object.keys(poses).length} poses\n`);
