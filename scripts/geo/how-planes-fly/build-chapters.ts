/**
 * `pnpm tsx scripts/geo/how-planes-fly/build-chapters.ts` — writes the
 * frontmatter (state, beats, index, try-it cards) of
 * src/content/topics/how-planes-fly/chapters/*.mdx (docs/45 §2, with §9).
 *
 * Every chapter and every beat writes its full state: view, explode, part,
 * run, cutaway, pose, layers, the hide list of everything outside its
 * station (layout.ts), labels, camera and all five sim controls, so no beat
 * leans on the one before it. Captions and summaries are the spec's, word for
 * word. The body of each file (below the frontmatter) is edited in the .mdx
 * and kept as it is.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { A_SHOWN, B, E, PRESETS, W, cam, hideExcept, type Cam } from './layout';

type T = { en: string; zh: string };
type Json = Record<string, unknown>;
const t = (en: string, zh: string): T => ({ en, zh });
const DIR = join(import.meta.dirname, '../../../src/content/topics/how-planes-fly/chapters');

/* Visible sets and their layers (docs/45 §2.0.1). */
const SETS = {
  W: { show: W, layers: ['airframe', 'flight-controls', 'propulsion', 'flight-flows'] },
  A: { show: A_SHOWN, layers: ['airfoil-bench', 'flight-flows'] },
  B: { show: B, layers: ['airframe'] },
  E: { show: E, layers: ['propulsion', 'flight-flows'] },
} as const;
type SetId = keyof typeof SETS;

interface Sim {
  angle?: number;
  speed?: number;
  altitude?: number;
  view?: 'streamlines' | 'pressure';
  diagram?: string;
}
const simSet = (s: Sim = {}) => ({
  'angle-deg': s.angle ?? 4,
  'airspeed-mps': s.speed ?? 40,
  'altitude-m': s.altitude ?? 0,
  'flow-view': s.view ?? 'streamlines',
  'diagram-case': s.diagram ?? 'none',
});

interface Shot {
  set: SetId;
  /** Parts removed from the set, and parts added to it, for this state only. */
  minus?: string[];
  plus?: string[];
  layers?: string[];
  camera: string | Cam;
  labels: string[];
  run: boolean;
  view?: 'assembled' | 'xray';
  cutaway?: string;
  pose?: string | null;
  /** Parts drawn faint (not labelled, not pickable). */
  ghost?: string[];
  sim?: Sim;
}
/** The full state of a chapter or a beat. */
function state(s: Shot, beat: boolean): Json {
  const set = SETS[s.set];
  const show = [...set.show.filter((id) => !(s.minus ?? []).includes(id)), ...(s.plus ?? [])];
  const camera = typeof s.camera === 'string' ? (beat ? s.camera : cam(s.camera)) : s.camera;
  if (typeof s.camera === 'string' && !PRESETS[s.camera]) throw new Error(`unknown preset ${s.camera}`);
  return {
    view: s.view ?? 'assembled',
    explode: 0,
    part: null,
    run: s.run,
    cutaway: s.cutaway ?? 'none',
    pose: s.pose ?? null,
    layers: s.layers ?? [...set.layers],
    hide: hideExcept(show),
    labels: s.labels,
    ghost: s.ghost ?? [],
    camera,
    sim: { set: simSet(s.sim) },
  };
}

interface Chapter {
  id: string;
  order: number;
  file: string;
  title: T;
  kind?: 'background';
  summary: T;
  note?: T;
  beats: (Shot & { caption: T })[];
  index: string[];
  try?: Json;
}

const SAME_SECTION = t('Same section and reference area', '翼型和参考面积不变');
const options = [
  { id: 'more', label: t('More lift', '升力更大'), means: 'more' },
  { id: 'same', label: t('The same', '不变'), means: 'same' },
  { id: 'less', label: t('Less lift', '升力更小'), means: 'less' },
];
const SIDE: Cam = { position: [-0.35, 1.8, 9.2], target: [0.1, 1.15, 0], fov: 30 };
const BANK: Cam = { position: [7.2, 2.35, 1.6], target: [0.35, 1.18, 0], fov: 30 };
/** The four-force beats: from the left side, a little above, so all four arrows stand clear of the aircraft. */
const FORCES: Cam = { position: [-1.9, 2.05, 9.1], target: [0.1, 1.12, 0], fov: 30 };
/** The left wing's flaps and slats, from behind and above. */
const HIGH_LIFT: Cam = { position: [-1.9, 2.75, 3.9], target: [0.0, 1.0, 0.95], fov: 30 };
const STALL_AND_FAN: Cam = { position: [-2.3, 3.2, 6.7], target: [-0.4, 1.55, 1.1], fov: 30 };

const CHAPTERS: Chapter[] = [
  {
    id: 'before-you-start',
    order: 0,
    file: '00-before-you-start.mdx',
    kind: 'background',
    title: t('Before you start', '开始之前'),
    summary: t(
      'Use a generic airliner and a separate wing experiment to see forces, flow and propulsion.',
      '从一架通用客机和独立的翼型实验，看清力、气流与推进。',
    ),
    note: t(
      'The aircraft and the engine are generic design studies, not any real type. Numbers marked SIM come from this topic’s teaching model and say “in this simulation”; they are not measurements. Dates, places and counts come from the sources listed in each chapter. Dashed lines mark the illustrative stall region.',
      '飞机和发动机是通用设计研究，不对应任何真实机型。标“模拟”的数来自本主题的教学模型，句中写明“在这个模拟里”，不是测量值。日期、地名和数量来自各章列出的来源。虚线标出失速示意区。',
    ),
    beats: [
      {
        set: 'W',
        camera: 'aircraft-overview',
        labels: ['wing-left', 'nacelle-left', 'fin'],
        run: false,
        caption: t(
          'This generic airliner has wings, engines and a tail. The wings provide most of its lift; the engines supply thrust.',
          '这架通用客机有机翼、发动机和尾翼。大部分升力来自机翼，发动机提供推力。',
        ),
      },
      {
        set: 'A',
        layers: ['airfoil-bench'],
        camera: 'section-view',
        labels: ['foil-sample', 'chord-marker'],
        run: false,
        caption: t(
          'This separate wing section is an experiment. It uses a simple mathematical shape, not the wing of a named aircraft.',
          '旁边这块翼型是实验教具。它用一个简单的数学形状，不是哪一型号飞机的机翼。',
        ),
      },
      {
        set: 'E',
        camera: 'engine-section-view',
        cutaway: 'engine-cut',
        labels: ['fan-disc', 'combustor-ring', 'turbine-bank'],
        run: false,
        caption: t(
          'The cutaway shows a fan, a core and the machinery joining them. Some air passes around the core.',
          '剖面能看见风扇、核心和连接它们的机构。有一部分空气绕过核心流动。',
        ),
      },
      {
        set: 'A',
        camera: 'section-view',
        labels: ['foil-sample'],
        run: true,
        sim: { angle: 16 },
        caption: t(
          'Dashed lines mark an illustrative stall region. They explain a limit of this teaching model; they are not a wind-tunnel measurement.',
          '虚线标出失速示意区。它说明教学模型的范围，不是风洞测量。',
        ),
      },
    ],
    index: ['wing-left', 'nacelle-left', 'fin', 'foil-sample', 'chord-marker', 'fan-disc', 'combustor-ring', 'turbine-bank'],
  },
  {
    id: 'four-forces',
    order: 1,
    file: '01-four-forces.mdx',
    title: t('Four forces in flight', '飞行中的四种力'),
    summary: t('Balanced forces can accompany steady motion.', '力平衡时，飞机仍可以保持匀速运动。'),
    beats: [
      {
        set: 'W',
        camera: FORCES,
        labels: ['wing-left', 'fuselage-shell'],
        run: false,
        sim: { diagram: 'vertical' },
        caption: t(
          'Weight pulls the aircraft towards Earth. In this level-flight picture, lift acts upwards against it.',
          '重力把飞机拉向地球。在这幅水平飞行示意里，升力向上，与重力相对。',
        ),
      },
      {
        set: 'W',
        camera: FORCES,
        labels: ['nacelle-left'],
        run: true,
        sim: { diagram: 'level' },
        caption: t(
          'Lift balances weight and thrust balances drag in this steady, level example. The aircraft keeps moving.',
          '在这个稳定水平飞行的例子里，升力与重力平衡，推力与阻力平衡。飞机继续运动。',
        ),
      },
      {
        set: 'W',
        camera: FORCES,
        labels: ['nacelle-left', 'wing-left'],
        run: false,
        sim: { diagram: 'axial' },
        caption: t(
          'Thrust acts forwards, while drag opposes motion through the air. These arrows show forces on the aircraft.',
          '推力向前，阻力阻碍飞机相对空气的运动。这里的箭头都表示飞机受到的力。',
        ),
      },
      {
        set: 'W',
        minus: ['nacelle-left', 'nacelle-right', 'fan-left', 'fan-right'],
        camera: SIDE,
        labels: ['wing-left', 'fuselage-shell'],
        run: false,
        sim: { diagram: 'vertical' },
        caption: t('A glider needs no engine to have lift. An engine and a wing do different jobs.', '滑翔机没有发动机，也能产生升力。发动机和机翼做的事不同。'),
      },
      {
        set: 'A',
        camera: 'section-view',
        labels: ['inflow-reference', 'foil-sample'],
        run: true,
        caption: t(
          'Lift is measured across the incoming airflow, and drag along it. Lift does not always point vertically upwards.',
          '升力垂直于来流方向，阻力沿着来流方向。升力并不总是竖直向上。',
        ),
      },
    ],
    index: ['fuselage-shell', 'wing-left', 'wing-right', 'nacelle-left', 'nacelle-right', 'inflow-reference', 'foil-sample'],
  },
  {
    id: 'wing-and-air',
    order: 2,
    file: '02-wing-and-air.mdx',
    title: t('The wing and the air', '机翼与空气'),
    summary: t('A wing changes the surrounding airflow and pressure.', '机翼改变周围的气流和气压。'),
    beats: [
      {
        set: 'B',
        ghost: ['wing-box-skin'],
        camera: 'wing-structure-view',
        labels: ['front-spar', 'rear-spar', 'wing-ribs'],
        run: false,
        caption: t(
          'Spars run along the wing, while ribs hold its cross-sectional shape. This cutaway shows one chosen structural example.',
          '翼梁沿翼展延伸，翼肋维持机翼的剖面形状。这幅剖面画的是选定的一种结构样件。',
        ),
      },
      {
        set: 'A',
        camera: 'section-view',
        labels: ['foil-sample', 'inflow-reference'],
        run: true,
        caption: t(
          'In this ideal flow model, air changes direction around both sides of the wing. The lines show direction, not packets that must stay together.',
          '在这个理想流模型里，空气沿机翼上下两侧改变方向。线表示气流方向，不表示必须结伴的空气包。',
        ),
      },
      {
        set: 'A',
        camera: 'section-view',
        labels: ['foil-sample'],
        run: true,
        caption: t(
          'The marked air follows local speeds. Air passing above and below has no requirement to meet again at the trailing edge.',
          '标出的空气按各处的速度前进。经过上下两侧的空气，不需要在后缘重新碰头。',
        ),
      },
      {
        set: 'A',
        camera: 'section-view',
        labels: ['foil-sample'],
        run: true,
        sim: { view: 'pressure' },
        caption: t(
          'This pressure view uses the same ideal flow. Pressure differences and the turning of air describe one aerodynamic force.',
          '气压图使用同一个理想流。气压差与气流转向，是对同一个空气动力的两种描述。',
        ),
      },
      {
        set: 'A',
        camera: 'section-view',
        labels: ['foil-sample'],
        run: true,
        caption: t(
          'In this simulation, doubling speed gives four times the lift while density, area and lift coefficient stay fixed.',
          '在这个模拟里，密度、面积和升力系数不变时，速度加倍，升力变成四倍。',
        ),
      },
    ],
    index: ['wing-box-skin', 'front-spar', 'rear-spar', 'wing-ribs', 'foil-sample', 'chord-marker', 'inflow-reference'],
    try: {
      vary: 'airspeed-mps',
      also: ['flow-view'],
      keep: ['angle-deg', 'altitude-m', SAME_SECTION],
      observe: ['speed-now', 'lift-n'],
      record: true,
      predict: {
        prompt: t(
          'In this model, the airspeed goes from 20 to 40 metres per second. What happens to the lift?',
          '在这个模型里，空气速度从每秒 20 米增加到每秒 40 米。升力会怎样？',
        ),
        start: { 'airspeed-mps': 20 },
        change: { 'airspeed-mps': 40 },
        observe: 'lift-n',
        options,
      },
    },
  },
  {
    id: 'angle-and-stall',
    order: 3,
    file: '03-angle-and-stall.mdx',
    title: t('Angle of attack and stall', '迎角与失速'),
    summary: t('More angle gives more lift only over part of the range.', '增加迎角只能在一定范围内增加升力。'),
    beats: [
      {
        set: 'A',
        camera: 'section-view',
        labels: ['chord-marker', 'inflow-reference'],
        run: true,
        sim: { angle: 0 },
        caption: t(
          'Angle of attack is measured between the chord and the incoming air. Here the symmetric wing is at zero angle and has zero lift in the ideal model.',
          '迎角是翼弦与来流之间的角。在理想模型里，这块对称翼型零迎角时，升力为零。',
        ),
      },
      {
        set: 'A',
        camera: 'section-view',
        labels: ['foil-sample', 'angle-marker'],
        run: true,
        sim: { angle: 4 },
        caption: t(
          'Tilt this symmetric section to four degrees in the simulation. It now produces lift; a rounded top alone is not the explanation.',
          '在模拟里，把对称翼型转到四度，它就产生了升力。不能只用上表面的弯曲来解释。',
        ),
      },
      {
        set: 'A',
        camera: 'section-view',
        labels: ['foil-sample'],
        run: true,
        sim: { angle: 12 },
        caption: t(
          'The teaching curve rises to its chosen peak at twelve degrees. This value belongs to our illustrative model, not every real wing.',
          '这条教学曲线在选定的十二度达到峰值。这个数属于示意模型，不适用于每一块真实机翼。',
        ),
      },
      {
        set: 'A',
        camera: 'section-view',
        labels: ['foil-sample'],
        run: true,
        sim: { angle: 16 },
        caption: t(
          'Beyond that model boundary, lift falls on the dashed curve. Separated flow is shown as a diagram; the ideal solver cannot calculate a real stall.',
          '超过模型分界，虚线上的升力减小。分离气流用示意图表示；理想求解器不能计算真实失速。',
        ),
      },
      {
        set: 'A',
        plus: ['nacelle-right', 'fan-right'],
        layers: ['airfoil-bench', 'propulsion', 'flight-flows'],
        view: 'xray',
        camera: STALL_AND_FAN,
        labels: ['foil-sample', 'fan-right'],
        run: true,
        sim: { angle: 16 },
        caption: t(
          'A wing can stall while the engine is still running. Stall concerns airflow and lift, and does not mean all lift suddenly disappears.',
          '发动机仍在运转时，机翼也可能失速。失速说的是气流和升力，不是所有升力突然消失。',
        ),
      },
    ],
    index: ['foil-sample', 'chord-marker', 'inflow-reference', 'angle-marker', 'fan-right', 'nacelle-right'],
    try: {
      vary: 'angle-deg',
      also: ['flow-view'],
      keep: ['airspeed-mps', 'altitude-m', SAME_SECTION],
      observe: ['cl-now', 'lift-n', 'flow-state'],
      record: true,
      predict: {
        prompt: t('In this model, the angle of attack goes from 12 to 16 degrees. What happens to the lift?', '在这个模型里，迎角从 12 度增加到 16 度。升力会怎样？'),
        start: { 'angle-deg': 12 },
        change: { 'angle-deg': 16 },
        observe: 'lift-n',
        options,
      },
    },
  },
  {
    id: 'changing-direction',
    order: 4,
    file: '04-changing-direction.mdx',
    title: t('Changing direction', '改变方向'),
    summary: t('Control surfaces change the aircraft’s orientation.', '操纵面改变飞机的姿态。'),
    beats: [
      {
        set: 'W',
        camera: 'controls-view',
        pose: 'controls-roll',
        labels: ['aileron-left', 'aileron-right'],
        run: false,
        caption: t('The ailerons move in opposite directions. They help roll the aircraft into a bank.', '两侧副翼朝相反方向偏转，帮助飞机滚转、倾斜。'),
      },
      {
        set: 'W',
        camera: 'controls-view',
        pose: 'controls-pitch',
        labels: ['elevator-left', 'elevator-right'],
        run: false,
        caption: t(
          'The elevator changes pitching motion: the nose turns up or down. It is part of the horizontal tail.',
          '升降舵改变俯仰，让机头向上或向下转动。它位于水平尾翼。',
        ),
      },
      {
        set: 'W',
        camera: 'controls-view',
        pose: 'controls-yaw',
        labels: ['rudder', 'fin'],
        run: false,
        caption: t(
          'The rudder controls yaw, turning the nose left or right. In a coordinated turn, it helps keep the aircraft aligned with its path.',
          '方向舵控制偏航，让机头左右转动。在协调转弯时，它帮助飞机沿着弯曲的航迹对准方向。',
        ),
      },
      {
        set: 'W',
        camera: BANK,
        pose: 'controls-bank',
        labels: ['wing-right'],
        run: false,
        sim: { diagram: 'bank' },
        caption: t(
          'Banking tilts lift. Its sideways component helps curve the flight path; this pose is an explanation, not a calculated flight.',
          '飞机倾斜时，升力也倾斜。向侧面的分量帮助航迹转弯；这个姿态用于说明，并非飞行计算。',
        ),
      },
      {
        set: 'W',
        camera: HIGH_LIFT,
        pose: 'high-lift-open',
        labels: ['flap-left', 'slat-left', 'spoiler-left'],
        run: false,
        caption: t(
          'Flaps and slats change the wing for lower-speed flight. Flaps also add drag; they are different from spoilers.',
          '襟翼和缝翼改变翼形，帮助较低速度的飞行。襟翼也增加阻力；它与扰流板不同。',
        ),
      },
    ],
    index: ['aileron-left', 'aileron-right', 'elevator-left', 'elevator-right', 'tailplane-left', 'tailplane-right', 'rudder', 'fin', 'wing-right', 'flap-left', 'flap-right', 'slat-left', 'slat-right', 'spoiler-left'],
  },
  {
    id: 'inside-a-turbofan',
    order: 5,
    file: '05-inside-a-turbofan.mdx',
    title: t('Inside a turbofan', '涡扇发动机的里面'),
    summary: t(
      'A turbofan has two air paths and machinery linking turbines to the fan and compressor.',
      '涡扇有两条气路，涡轮通过轴带动风扇和压气机。',
    ),
    beats: [
      {
        set: 'E',
        camera: 'engine-section-view',
        cutaway: 'engine-cut',
        labels: ['fan-disc', 'engine-shell'],
        run: true,
        sim: { diagram: 'engine-intake' },
        caption: t(
          'The large front fan draws air into the engine. The cutaway lets us see what lies behind it.',
          '前方的大风扇把空气引入发动机。剖面让我们看见它后面的结构。',
        ),
      },
      {
        set: 'E',
        camera: 'engine-section-view',
        cutaway: 'engine-cut',
        labels: ['bypass-duct', 'compressor-bank'],
        run: true,
        sim: { diagram: 'engine-split' },
        caption: t(
          'Air divides into an outer bypass stream and a central core stream. The bypass air goes around the core.',
          '空气分成外侧的外涵气流和中央的核心气流。外涵空气绕着核心流过。',
        ),
      },
      {
        set: 'E',
        camera: 'engine-section-view',
        cutaway: 'engine-cut',
        labels: ['compressor-bank', 'combustor-ring', 'turbine-bank'],
        run: true,
        sim: { diagram: 'engine-core' },
        caption: t(
          'In the core, air is compressed before fuel is added and burned. The hot gas then passes through turbines and towards the nozzle.',
          '核心气流先被压缩，再加入燃料燃烧。热气随后经过涡轮，流向喷口。',
        ),
      },
      {
        set: 'E',
        camera: 'engine-section-view',
        cutaway: 'engine-cut',
        labels: ['lp-shaft', 'hp-shaft', 'fan-disc'],
        run: true,
        sim: { diagram: 'engine-shafts' },
        caption: t(
          'Turbines drive the fan and compressor through shafts. The fan shaft runs inside the core shaft in this two-spool example.',
          '涡轮通过轴带动风扇与压气机。在这个两转子样件里，风扇轴从核心轴的内部穿过。',
        ),
      },
      {
        set: 'E',
        camera: 'engine-section-view',
        cutaway: 'engine-cut',
        labels: ['core-nozzle', 'bypass-nozzle'],
        run: true,
        sim: { diagram: 'engine-exhaust' },
        caption: t(
          'Both streams help provide thrust. Hot gas also drives the turbines connected to the fan and compressor.',
          '两股气流都帮助产生推力。热气还推动涡轮，经轴带动风扇与压气机。',
        ),
      },
    ],
    index: [...E],
  },
  {
    id: 'thin-air',
    order: 6,
    file: '06-thin-air.mdx',
    title: t('Flying in thinner air', '在较稀薄的空气中飞行'),
    summary: t(
      'Thinner air changes aerodynamic forces, but does not remove the need to support weight.',
      '稀薄空气会改变空气动力，但飞机仍需要支撑重量。',
    ),
    beats: [
      {
        set: 'A',
        camera: 'section-view',
        labels: ['foil-sample', 'inflow-reference'],
        run: true,
        sim: { altitude: 0 },
        caption: t(
          'This average-atmosphere model starts near sea level. It is a reference model, not today’s Singapore weather.',
          '这个平均大气模型从接近海平面开始。它是参考模型，不是新加坡今天的天气。',
        ),
      },
      {
        set: 'A',
        camera: 'section-view',
        labels: ['foil-sample'],
        run: true,
        sim: { altitude: 5000 },
        caption: t(
          'At the same speed, angle and reference area, the thinner air gives less lift in this simulation.',
          '在这个模拟里，速度、迎角和参考面积不变时，较稀薄的空气产生较小的升力。',
        ),
      },
      {
        set: 'A',
        camera: 'section-view',
        labels: ['foil-sample'],
        run: true,
        sim: { altitude: 10000 },
        caption: t(
          'Density changes the force here, while the ideal streamline shape stays the same. A real aircraft still needs to support its weight.',
          '这里密度改变了力，理想流线的形状仍相同。真实飞机仍然需要支撑自身重量。',
        ),
      },
      {
        set: 'W',
        camera: 'cruise-view',
        labels: ['fuselage-shell', 'wing-left', 'nacelle-left'],
        run: true,
        sim: { diagram: 'weight' },
        caption: t(
          'Flying higher is a compromise. Aircraft performance, available thrust, weather and traffic all limit the choice; higher is not always better.',
          '飞得更高是一种取舍。飞机性能、可用推力、天气和空中交通都会限制选择；并非越高越好。',
        ),
      },
    ],
    index: ['foil-sample', 'chord-marker', 'inflow-reference', 'fuselage-shell', 'wing-left', 'nacelle-left'],
    try: {
      vary: 'altitude-m',
      also: ['flow-view'],
      keep: ['angle-deg', 'airspeed-mps', SAME_SECTION],
      observe: ['rho-now', 'lift-n'],
      record: true,
      predict: {
        prompt: t(
          'In this model, the speed and the angle stay the same while the altitude goes from 0 to 10,000 metres. What happens to the lift?',
          '在这个模型里，速度和迎角不变，高度从 0 米升到 10,000 米。升力会怎样？',
        ),
        start: { 'altitude-m': 0 },
        change: { 'altitude-m': 10000 },
        observe: 'lift-n',
        options,
      },
    },
  },
  {
    id: 'flight-and-singapore',
    order: 7,
    file: '07-flight-and-singapore.mdx',
    title: t('Flight and Singapore', '飞行与新加坡'),
    summary: t(
      'Air travel uses machines and airports, and airport development changes land and communities.',
      '航空交通依靠飞机与机场；机场建设也改变土地与社区。',
    ),
    beats: [
      {
        set: 'W',
        camera: 'aircraft-overview',
        labels: ['wing-left'],
        run: false,
        caption: t(
          'In December 1903, the Wrights demonstrated powered, controlled, sustained heavier-than-air flight. Orville’s first flight lasted twelve seconds. This generic model is not their aircraft.',
          '1903 年 12 月，莱特兄弟展示了有动力、可操纵、持续的重于空气飞行。奥维尔首飞持续十二秒。画面里的通用模型不是那架飞机。',
        ),
      },
      {
        set: 'W',
        camera: 'aircraft-overview',
        labels: ['nacelle-left'],
        run: false,
        caption: t(
          'Singapore Airlines received its first A380 on 15 October 2007 and began commercial services to Sydney on 25 October. Delivery and passenger service are different events.',
          '新航在 2007 年 10 月 15 日接收首架 A380，10 月 25 日开始悉尼商业服务。交付与投入客运是不同事件。',
        ),
      },
      {
        set: 'W',
        camera: 'aircraft-overview',
        labels: ['fuselage-shell'],
        run: false,
        caption: t(
          'Kallang Airport officially opened in 1937. Its civil-airport role passed to Paya Lebar in 1955. These names describe a sequence of civil-airport changes.',
          '加冷机场在 1937 年正式开幕，民用机场功能在 1955 年转到巴耶利峇。这条文字序列记录的是民用机场的变化。',
        ),
      },
      {
        set: 'W',
        camera: 'aircraft-overview',
        labels: ['wing-left'],
        run: false,
        caption: t(
          'Changi began commercial operations on 1 July 1981. Its official opening was on 29 December that year. Operations and a formal opening can have different dates.',
          '樟宜在 1981 年 7 月 1 日开始商业运营，同年 12 月 29 日正式开幕。开始运营和正式开幕可以是不同日期。',
        ),
      },
      {
        set: 'W',
        camera: 'aircraft-overview',
        labels: ['fuselage-shell'],
        run: false,
        caption: t(
          'Planning considered capacity and noise. Site preparation beginning in 1975 involved demolishing 558 buildings and exhuming 4,096 graves. These count buildings and graves, not people.',
          '规划考虑了容量与噪音。1975 年开始的场地准备涉及拆除 558 座建筑、迁掘 4,096 座坟墓。这里统计的是建筑和坟墓，不是人数。',
        ),
      },
    ],
    index: ['fuselage-shell', 'wing-left', 'nacelle-left'],
  },
];

const bodyOf = (file: string): string => {
  const path = join(DIR, file);
  if (existsSync(path)) {
    const src = readFileSync(path, 'utf8');
    const end = src.indexOf('\n---\n', 4);
    if (src.startsWith('---\n') && end > 0) return src.slice(end + 5).replace(/^\n+/, '');
  }
  throw new Error(`no body for ${file}`);
};

const total = CHAPTERS.reduce((n, c) => n + c.beats.length, 0);
if (total !== 38) throw new Error(`docs/45 §2.9 has 38 beats, built ${total}`);
for (const c of CHAPTERS) {
  // The chapter's own state (what a reader sees on opening it) is its first beat.
  const st = state(c.beats[0]!, false);
  const front = {
    id: c.id,
    order: c.order,
    ...(c.kind ? { kind: c.kind } : {}),
    title: c.title,
    sensitive: false,
    state: {
      ...st,
      summary: c.summary,
      ...(c.note ? { note: c.note } : {}),
      index: { parts: c.index },
      sim: { ...(st.sim as Json), ...(c.try ? { try: c.try } : {}) },
      beats: c.beats.map((b) => ({ ...state(b, true), caption: b.caption })),
    },
  };
  const body = bodyOf(c.file);
  writeFileSync(join(DIR, c.file), `---\n${JSON.stringify(front, null, 2)}\n---\n\n${body}`);
}
console.log(`wrote ${CHAPTERS.length} chapters, ${total} beats`);
