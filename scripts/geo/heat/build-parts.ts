/** Heat lab bench: original metre-scale apparatus, deterministic and entirely procedural.
 * Rebuild: pnpm tsx scripts/geo/heat/build-parts.ts
 * DESIGN geometry and effective thermal parameters [S27]; never apparatus measurements.
 */
import { polishApparatus } from './apparatus';
import { rebuildExpansion } from './expansion-apparatus';
import { bakeApparatus } from './bake-apparatus';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { partsFile, type Primitive } from '../../../src/engines/space-scene/schema';
import { HEAT_CONTROLS, HEAT_OUTPUTS, heatBench } from '../../../tests/space-scene/fixtures/heat-bench';

const l = (en: string, zh: string) => ({ en, zh });
type V = [number, number, number];
const box = (at: V, size: V, color = 'steel'): Primitive => ({ kind: 'box', at, size, color }) as Primitive;
const cyl = (at: V, radius: number, length: number, color = 'steel', rotation?: V): Primitive =>
  ({ kind: 'cylinder', at, size: [radius, radius, length], color, ...(rotation ? { rotation } : {}) }) as Primitive;
const ball = (at: V, radius: number, color = 'steel'): Primitive => ({ kind: 'sphere', at, size: [radius], color }) as Primitive;
const lathe = (at: V, profile: number[][], color: string, options = {}): Primitive => ({ kind: 'lathe', at, profile, color, segments: 40, ...options }) as Primitive;
const annulus = (at: V, inner: number, outer: number, height: number, color: string): Primitive =>
  lathe(
    at,
    [
      [inner, -height / 2],
      [outer, -height / 2],
      [outer, height / 2],
      [inner, height / 2],
      [inner, -height / 2],
    ],
    color,
  );
const tube = (at: V, path: V[], radius: number, color = 'steel'): Primitive => ({ kind: 'tube', at, path, radius, color }) as Primitive;
const bevel = (at: V, size: V, color: string, edge = 0.002): Primitive => ({ kind: 'bevelBox', at, size, bevel: edge, color }) as Primitive;
const parts: Record<string, unknown>[] = [];
// Every detail cites the design source once; text that already ends with its citation keeps its own spacing.
const cite = (text: string) => (text.endsWith('[S27]') ? text : `${text} [S27]`);
function add(
  id: string,
  group: string,
  name: [string, string],
  summary: [string, string],
  detail: [string, string],
  primitive: Primitive,
  extra: Primitive[] = [],
  options: Record<string, unknown> = {},
) {
  parts.push({
    id,
    group,
    name: l(...name),
    summary: l(...summary),
    detail: l(cite(detail[0]), cite(detail[1])),
    primitive,
    ...(extra.length ? { extra } : {}),
    explode: { dir: [0, 1, 0], dist: 0.025 },
    castShadow: false,
    clip: false,
    ...options,
  });
}
function cup(id: string, group: string, x: number, z: number, bottom: number, name: [string, string]) {
  // Continuous glass base and 2 mm wall return around an open mouth; no top cap.
  const profile = [
    [0, 0],
    [0.042, 0],
    [0.045, 0.003],
    [0.045, 0.117],
    [0.046, 0.119],
    [0.046, 0.12],
    [0.043, 0.12],
    [0.043, 0.118],
    [0.042, 0.006],
    [0, 0.006],
  ];
  add(
    id,
    group,
    name,
    ['Holds the liquid and leaves its surface open.', '盛放液体，杯口保持敞开。'],
    [
      'The thin glass wall, base and small pouring lip are original apparatus geometry. The water surface is separate; this is not a sealed pressure vessel.',
      '薄玻璃杯壁、杯底和小杯嘴是原创器材几何。水面为独立零件；这不是密封压力容器。',
    ],
    lathe([x, bottom, z], profile, 'glass'),
    [
      // A shallow U section forms a genuine pouring lip joined to the rim.
      {
        kind: 'extrude',
        at: [x - 0.043, bottom + 0.116, z],
        shape: [
          [-0.014, -0.002],
          [0, -0.003],
          [0.004, 0.003],
          [0, 0.004],
          [-0.014, 0.002],
        ],
        depth: 0.012,
        color: 'glass',
      } as Primitive,
    ],
    { shell: true, connects: [id === 'bath-beaker' ? 'bath-water' : id === 'heater-beaker' ? 'heater-water' : 'cooling-water'] },
  );
}
function water(
  id: string,
  x: number,
  z: number,
  bottom: number,
  name: [string, string],
  description: [string, string],
  summary: [string, string] = ['Keeps the bath at the selected temperature.', '表示保持选定温度的水。'],
) {
  add(
    id,
    id === 'bath-water' ? 'transfer' : 'curves',
    name,
    summary,
    description,
    cyl([x, bottom + 0.006 + 0.0325, z], 0.041, 0.065, 'glass'),
    [],
    {},
  );
  (parts[parts.length - 1]!.primitive as Record<string, unknown>).tint = 'token:water';
}
function probe(id: string, marker: string, group: string, x: number, z: number, bottom: number, name: [string, string], support: string) {
  const bulb = bottom + 0.027;
  add(
    id,
    group,
    name,
    ['Measures temperature with its bulb in the water.', '感温端浸入水中以测量温度。'],
    [
      'The sensing bulb sits in the water, clear of the bottom and wall. A support holds the stem. The separate indicator moves evenly with temperature as a diagram; it does not calculate an expanding liquid’s volume. [S27]',
      '感温端浸在水中，不碰杯底或杯壁。支架固定测温杆。旁边的指示片随温度均匀移动，只作图示，不计算液体膨胀的体积。[S27]',
    ],
    tube(
      [x, bulb, z],
      [
        [0, 0, 0],
        [0, 0.2, 0],
      ],
      0.0022,
      'glass',
    ),
    [ball([x, bulb, z], 0.004, 'steel')],
    { connects: [support, marker] },
  );
  add(
    marker,
    group,
    [`${name[0]} indicator`, `${name[1]}指示片`],
    ['Marks the model temperature on the probe.', '标示探头对应的模型温度。'],
    [
      'The indicator moves along the stem with the same full-precision control or model reading shown in the card. Position is a calibrated diagram, not a claimed liquid volume.',
      '指示片与卡片中的控件值或模型温度使用同一个全精度数值。位置是校准示意，不代表计算过的液柱体积。',
    ],
    box([x, bulb + 0.07, z + 0.0035], [0.007, 0.002, 0.002], 'token:signal'),
    [],
    { connects: [id] },
  );
}

// 01 · Maintained bath, equal-depth spoons and supported thermometer.
cup('bath-beaker', 'transfer', -0.55, 0.08, 0.75, ['Bath beaker', '温浴烧杯']);
water(
  'bath-water',
  -0.55,
  0.08,
  0.75,
  ['Maintained bath', '恒温温浴'],
  [
    'An external source keeps the bath at the selected temperature as it exchanges energy with the spoons. The bath’s temperature stays fixed in the calculation. [S27]',
    '外部来源维持选定浴温，让水与勺子交换能量时仍保持恒温。计算中，浴温不变。[S27]',
  ],
);
for (const [id, x, color, name] of [
  ['metal-spoon', -0.567, 'stainless', ['Metal spoon', '金属勺']],
  ['plastic-spoon', -0.533, 'plastic', ['Plastic spoon', '塑料勺']],
] as const) {
  const at: V = [x, 0.795, 0.095];
  // Closed shallow dish: outer back→rim→inner hollow→inner bottom. Oval in the vertical direction.
  const bowl = lathe(
    at,
    [
      [0, -0.0035],
      [0.005, -0.003],
      [0.01, -0.0015],
      [0.012, 0.001],
      [0.0118, 0.002],
      [0.0105, 0.0015],
      [0.008, -0.0002],
      [0.003, -0.0016],
      [0, -0.0016],
    ],
    color,
    { rotation: [90, 0, 0], scale: [1, 1, 1.4] },
  );
  const handle: Primitive = {
    kind: 'extrude',
    at,
    depth: 0.002,
    bevel: 0.0003,
    color,
    shape: [
      [-0.003, 0.01],
      [-0.0035, 0.024],
      [-0.003, 0.1],
      [-0.004, 0.137],
      [-0.002, 0.143],
      [0.002, 0.143],
      [0.004, 0.137],
      [0.003, 0.1],
      [0.0035, 0.024],
      [0.003, 0.01],
    ],
  };
  add(
    id,
    'transfer',
    [...name],
    ['Carries heat between the bath and its far end.', '在温浴与勺柄远端之间传热。'],
    [
      'A shallow bowl joins a continuous handle. The two model spoons have the same shape, immersion depth, starting temperature and tip heat capacity: the energy needed for each degree of warming. Their heat-transfer rates were chosen for comparison, rather than measured from real spoons. [S27]',
      '浅勺碗与完整勺柄相连。两把模型勺子的形状、浸入深度、初温和远端热容量相同。热容量表示升高一度需要多少能量。传热快慢是比较用的设定，不是实测值。[S27]',
    ],
    bowl,
    [handle],
    { connects: ['bath-water', id === 'metal-spoon' ? 'metal-tip-marker' : 'plastic-tip-marker'] },
  );
}
for (const [id, x, spoon, name] of [
  ['metal-tip-marker', -0.567, 'metal-spoon', ['Metal tip indicator', '金属远端指示片']],
  ['plastic-tip-marker', -0.533, 'plastic-spoon', ['Plastic tip indicator', '塑料远端指示片']],
] as const) {
  add(
    id,
    'transfer',
    [...name],
    ['Indicates the model temperature at the far end.', '指示模型中勺柄远端的温度。'],
    [
      'This separate pointer shows the temperature at the far end of the handle. Other places along a real spoon can have different temperatures. The colours show temperature; a warm spoon does not glow. [S27]',
      '独立指示片显示勺柄远端的温度。真实勺子其他位置的温度可能不同。颜色用来表示温度，温热勺子本身不会发光。[S27]',
    ],
    box([x, 0.944, 0.095], [0.007, 0.002, 0.003], 'token:signal'),
    [],
    { connects: [spoon] },
  );
}
probe('probe', 'probe-marker', 'transfer', -0.55, 0.055, 0.75, ['Bath thermometer', '温浴温度计'], 'probe-clamp');
add(
  'retort-stand',
  'transfer',
  ['Retort stand', '铁架台'],
  ['Supports the clamp above the open bath.', '支承敞口温浴上方的夹具。'],
  ['The base rests on the bench. The upright and clamp support the probe without holding its bulb against the cup.', '底座落在台面上。直杆与夹具支承温度计，不让感温端贴住烧杯。'],
  cyl([-0.66, 0.88, 0.055], 0.004, 0.25, 'steel'),
  [bevel([-0.66, 0.758, 0.055], [0.075, 0.016, 0.065], 'steel')],
  { connects: ['probe-clamp'] },
);
add(
  'probe-clamp',
  'transfer',
  ['Probe clamp', '温度计夹具'],
  ['Holds the stem while the bulb stays immersed.', '夹住测温杆，让感温端保持浸没。'],
  ['The horizontal arm meets the stand and the thermometer stem. The probe remains above the cup bottom.', '横臂连接铁架台与温度计杆。感温端与杯底留有间隔。'],
  cyl([-0.605, 0.97, 0.055], 0.0035, 0.11, 'steel', [0, 0, 90]),
  [box([-0.55, 0.97, 0.055], [0.014, 0.01, 0.012], 'rubber')],
  { connects: ['retort-stand', 'probe'] },
);

// 02 · Separate heating and cooling experiments.
add(
  'heater',
  'curves',
  ['Electric heater', '电热台'],
  ['Supplies energy at the selected power.', '按选定功率供给能量。'],
  [
    'The electric heater supports an open beaker. In this ideal model, all supplied energy heats the water; the container absorbs none and no heat escapes. Use the time control to advance the experiment. RUN only switches the moving symbols on or off. [S27]',
    '电热台支承敞口烧杯。理想模型中，供给的能量全部用于加热水，容器不吸热，也没有散热。用时间控件推进实验；RUN 只开关移动符号。[S27]',
  ],
  bevel([0.15, 0.7675, 0.1], [0.14, 0.035, 0.14], 'enamel', 0.004),
  [cyl([0.15, 0.786, 0.1], 0.052, 0.003, 'steel')],
  { connects: ['heater-beaker'] },
);
cup('heater-beaker', 'curves', 0.15, 0.1, 0.788, ['Heating beaker', '加热烧杯']);
water(
  'heater-water',
  0.15,
  0.1,
  0.788,
  ['Heated water', '加热的水'],
  [
    'Set the water’s mass with the control. Its drawn level stays fixed, so read the control rather than estimating mass or volume from the picture. [S27]',
    '用控件设定水的质量。画面的水位不变，要读控件数值，不要从图中估计质量或体积。[S27]',
  ],
  ['Warms as the heater supplies energy.', '获得加热器供给的能量而升温。'],
);
probe('heater-probe', 'heater-probe-marker', 'curves', 0.15, 0.078, 0.788, ['Heating probe', '加热探头'], 'heater-probe-support');
cup('cooling-beaker', 'curves', 0.55, 0.1, 0.75, ['Cooling beaker', '冷却烧杯']);
water(
  'cooling-water',
  0.55,
  0.1,
  0.75,
  ['Cooling water', '冷却的水'],
  [
    'The water exchanges heat with surroundings held at 25 °C. The transfer setting describes the whole route between them, rather than the conductivity of one material. [S27]',
    '水与保持 25 °C 的环境交换热量。传热参数描述两者之间的整条通路，并非某一种材料的导热率。[S27]',
  ],
  ['Exchanges heat with the surroundings.', '与周围环境交换热量。'],
);
probe('cool-probe', 'cool-probe-marker', 'curves', 0.55, 0.078, 0.75, ['Cooling probe', '冷却探头'], 'cooler-probe-support');
add(
  'wrap',
  'curves',
  ['Insulating wrap', '隔热包覆层'],
  ['Slows heat transfer into or out of the water.', '减慢能量传入水中或从水中传出。'],
  [
    'The sleeve surrounds the cup and leaves its mouth open. It slows heat transfer without supplying energy. It can slow both the cooling of hot water and the warming of cold water. [S27]',
    '包覆层围住杯身，杯口保持敞开。它不供能，只减慢传热，既能减慢热水冷却，也能减慢冷水变暖。[S27]',
  ],
  annulus([0.55, 0.807, 0.1], 0.05, 0.06, 0.102, 'rubber'),
  [],
  { shell: true, clip: true, connects: ['cooling-beaker', 'air-gap', 'room-reference'] },
);
add(
  'air-gap',
  'curves',
  ['Air gap', '空气间隙'],
  ['Marks the space between the cup and its wrap.', '标示烧杯与包覆层之间的间隙。'],
  [
    'This ring-shaped gap lies between the cup and its wrap. It is part of the insulation. The model does not calculate a separate temperature for the air in the gap. [S27]',
    '杯身与包覆层之间留有环形空隙，是隔热结构的一部分。模型不单独计算空隙中的空气温度。[S27]',
  ],
  annulus([0.55, 0.807, 0.1], 0.0455, 0.0495, 0.1, 'glass'),
  [],
  { clip: true, connects: ['wrap', 'cooling-beaker'] },
);

// 03 · A true 100 mm steel rod and a separate 500× displacement indicator.
add(
  'rod',
  'expansion',
  ['Steel rod', '钢杆'],
  ['Provides a solid with a freely moving right end.', '表示右端能够自由伸缩的固体杆。'],
  [
    'In the model, the rod is 100 mm long at 25 °C. The drawn rod stays at this length. A separate pointer shows its calculated length change enlarged 500 times. [S27]',
    '模型中，杆在 25 °C 时长 100 mm。画出的杆保持这个长度，独立指示片显示放大 500 倍的计算伸缩量。[S27]',
  ],
  cyl([0.05, 0.807, -0.22], 0.003, 0.1, 'steel', [0, 0, 90]),
  [],
  { connects: ['rod-support-left', 'rod-support-right', 'rod-end-marker'] },
);
add(
  'rod-end-marker',
  'expansion',
  ['Enlarged endpoint indicator', '放大端点指示片'],
  ['Shows rod-end displacement enlarged 500 times.', '显示放大500倍的杆端位移。'],
  [
    'The pointer is separate from the rod. When the calculated extension is 0.072 mm, the pointer moves 0.036 m in the diagram. It moves left when the rod contracts. Read the actual calculated extension from the number. [S27]',
    '指示片与杆分开。计算伸长 0.072 mm 时，图中指示片移动 0.036 m；杆收缩时，指示片向左移动。计算的实际伸缩量要看数字。[S27]',
  ],
  box([0.1, 0.825, -0.198], [0.0015, 0.032, 0.015], 'token:signal'),
  [],
  { connects: ['rod'] },
);
for (const [id, x, name] of [
  ['rod-support-left', 0.01, ['Left rod support', '钢杆左支承']],
  ['rod-support-right', 0.09, ['Sliding rod support', '钢杆滑动支承']],
] as const) {
  add(
    id,
    'expansion',
    [...name],
    ['Supports the rod without locking both ends.', '托住钢杆，不把两端同时锁死。'],
    [
      'The shallow, open support lets the rod slide along its length as temperature changes. The two supports hold it up without clamping both ends in place. [S27]',
      '开放的浅槽托住杆，让杆随温度变化沿长度方向滑动。两个支座承托杆身，不把两端锁死。[S27]',
    ],
    bevel([x, 0.775, -0.22], [0.018, 0.05, 0.035], 'steel', 0.002),
    [
      {
        kind: 'extrude',
        at: [x, 0.797, -0.22],
        shape: [
          [-0.009, 0],
          [0.009, 0],
          [0.009, 0.019],
          [0.005, 0.019],
          [0.005, 0.009],
          [0, 0.007],
          [-0.005, 0.009],
          [-0.005, 0.019],
          [-0.009, 0.019],
        ],
        depth: 0.01,
        rotation: [0, 90, 0],
        color: 'steel',
      } as Primitive,
    ],
    { connects: ['rod'] },
  );
}
add(
  'expansion-ball',
  'expansion',
  ['Expansion ball', '热胀小球'],
  ['Compares a cold ball with its warmed illustration.', '比较小球原状与受热后的示意状态。'],
  [
    'This independent qualitative ball-and-ring scene enlarges the visual size change. It does not use the steel rod’s dimensions or coefficient, and it gives no numerical ball temperature or expansion.',
    '球环是独立的定性场景，尺寸变化为了观察而放大。不使用钢杆尺寸或系数，也不给小球温度或膨胀量数字。',
  ],
  ball([0.24, 0.865, -0.22], 0.02, 'steel'),
  [cyl([0.24, 0.913, -0.22], 0.0025, 0.06, 'steel'), cyl([0.24, 0.952, -0.22], 0.006, 0.025, 'plastic')],
  { connects: ['expansion-ring'] },
);
add(
  'expansion-ring',
  'expansion',
  ['Ring with an opening', '带孔圆环'],
  ['Keeps the original opening for the ball comparison.', '在小球对照中保持原来的孔。'],
  [
    'The annular ring has a real 44 mm design opening rather than a solid painted disc. In this ball-only warming scene the ring stays in its original state; a separately heated ring would expand too.',
    '圆环有真实的设计孔洞，并非把孔画在实心圆盘上。在只加热小球的情景中，环保持原状；若另外加热圆环，环也会膨胀。',
  ],
  annulus([0.24, 0.818, -0.22], 0.022, 0.033, 0.008, 'steel'),
  [
    cyl([0.295, 0.818, -0.22], 0.0025, 0.05, 'steel', [0, 0, 90]),
    cyl([0.335, 0.818, -0.22], 0.006, 0.035, 'plastic', [0, 0, 90]),
    box([0.24, 0.782, -0.248], [0.018, 0.064, 0.012], 'steel'),
  ],
  { connects: ['expansion-ball'] },
);
add(
  'expansion-thermometer',
  'expansion',
  ['Liquid-column demonstration', '液柱演示'],
  ['Shows a longer liquid column in a fixed glass sleeve.', '在固定玻璃套管中显示变长的液柱。'],
  [
    'Only the coloured liquid column changes length in these qualitative poses. Its fixed glass sleeve, bulb and support belong to the bench context geometry so the glass does not grow. This is a diagram of liquid expansion, without a volume or temperature solver.',
    '定性姿态只改变有色液柱长度。固定玻璃套管、球泡和支座并入台面背景几何，因此玻璃不会跟着变长。这是液体膨胀示意，没有体积或温度求解器。',
  ],
  cyl([0.4, 0.8215, -0.24], 0.0016, 0.045, 'token:signal'),
);
add(
  'gas-cylinder',
  'expansion',
  ['Open-top piston cylinder', '可动活塞筒'],
  ['Contains the gas below a movable piston.', '围住可动活塞下方的气体。'],
  [
    'The clear cylinder has a fixed bottom and an open top. In the warm view, the piston moves up to give the gas more space. The picture does not calculate pressure or volume using a gas law. [S27]',
    '透明筒底部固定，上端敞开。受热视图中，活塞上移，给气体更多空间。画面不使用气体定律计算压强或体积。[S27]',
  ],
  lathe(
    [0.65, 0.75, -0.24],
    [
      [0, 0],
      [0.026, 0],
      [0.029, 0.004],
      [0.029, 0.14],
      [0.026, 0.14],
      [0.026, 0.006],
      [0, 0.006],
    ],
    'glass',
  ),
  [],
  { shell: true, clip: true, connects: ['gas-piston'] },
);
add(
  'gas-piston',
  'expansion',
  ['Movable piston', '可动活塞'],
  ['Moves to leave more space for warmed gas.', '移动以给受热气体留出更大空间。'],
  [
    'This disc has a slender handle. Its two positions show gas taking up more space beneath a movable piston. A rigid sealed container would hold the volume fixed. [S27]',
    '圆盘带有细柄。两个位置显示气体在可动活塞下占据更多空间。刚性密闭容器则会限制体积。[S27]',
  ],
  cyl([0.65, 0.815, -0.24], 0.0255, 0.008, 'steel'),
  [cyl([0.65, 0.866, -0.24], 0.0025, 0.094, 'steel'), cyl([0.65, 0.914, -0.24], 0.011, 0.006, 'plastic')],
  { connects: ['gas-cylinder'] },
);

// Holders and supports stay functional; they are indexable apparatus, not decorations.
add(
  'bath-holder',
  'transfer',
  ['Spoon holder', '勺架'],
  ['Holds both spoons at the same immersion depth.', '把两勺固定在相同浸入深度。'],
  [
    'An upright and crossbar support both spoon handles. Short tabs touch the handles without covering the bowls. The holder keeps both bowls immersed to the same depth. [S27]',
    '立柱与横梁支承两根勺柄。短托片接触勺柄，不遮住勺碗，让两个勺碗保持相同浸入深度。[S27]',
  ],
  box([-0.55, 0.905, 0.12], [0.055, 0.006, 0.02], 'steel'),
  [
    box([-0.55, 0.8275, 0.13], [0.008, 0.155, 0.012], 'steel'),
    box([-0.55, 0.755, 0.13], [0.07, 0.01, 0.04], 'steel'),
    box([-0.567, 0.905, 0.1035], [0.008, 0.004, 0.017], 'steel'),
    box([-0.533, 0.905, 0.1035], [0.008, 0.004, 0.017], 'steel'),
  ],
  { connects: ['metal-spoon', 'plastic-spoon'] },
);
for (const [id, x, bottom, probeId, name] of [
  ['heater-probe-support', 0.15, 0.788, 'heater-probe', ['Heating probe stand', '加热探头支架']],
  ['cooler-probe-support', 0.55, 0.75, 'cool-probe', ['Cooling probe stand', '冷却探头支架']],
] as const) {
  add(
    id,
    'curves',
    [...name],
    ['Holds its probe clear of the cup wall and bottom.', '支承探头，让感温端不碰杯壁和杯底。'],
    [
      'The base rests on the bench beside the cup. A continuous upright and arm meet the probe stem above the open mouth.',
      '底座放在烧杯旁的台面上。连续立杆与横臂在杯口上方连接探头杆。',
    ],
    tube(
      [x - 0.09, 0.76, 0.078],
      [
        [0, 0, 0],
        [0, bottom + 0.195 - 0.76, 0],
        [0.09, bottom + 0.195 - 0.76, 0],
      ],
      0.0035,
      'steel',
    ),
    [bevel([x - 0.09, 0.756, 0.078], [0.04, 0.012, 0.045], 'steel', 0.001), box([x, bottom + 0.195, 0.078], [0.012, 0.009, 0.012], 'rubber')],
    { connects: [probeId] },
  );
}
add(
  'room-reference',
  'curves',
  ['Room-temperature reference', '环境温度参考'],
  ['Marks the fixed environment used by the cooling model.', '标示冷却模型采用的固定环境温度。'],
  [
    'The surroundings stay at 25 °C in this simulation. This chosen temperature is not a live reading of your room or Singapore weather. [S27]',
    '模拟环境保持 25 °C。这个设定温度不是你的房间或新加坡天气的实时读数。[S27]',
  ],
  bevel([0.75, 0.79, 0.1], [0.045, 0.08, 0.014], 'enamel', 0.002),
  [box([0.75, 0.756, 0.1], [0.07, 0.012, 0.05], 'steel')],
  { connects: ['wrap', 'cooling-water'] },
);

// Context bench: no labels, part number or exploded motion. Static thermometer sleeve is scenery.
const benchExtra: Primitive[] = [];
for (const x of [-0.78, 0.78]) for (const z of [-0.25, 0.25]) benchExtra.push(bevel([x, 0.355, z], [0.045, 0.71, 0.045], 'powder', 0.004));
for (const z of [-0.25, 0.25]) benchExtra.push(box([0, 0.66, z], [1.56, 0.035, 0.025], 'powder'));
for (const x of [-0.78, 0.78]) benchExtra.push(box([x, 0.66, 0], [0.025, 0.035, 0.5], 'powder'));
benchExtra.push(
  tube(
    [0.4, 0.798, -0.24],
    [
      [0, 0, 0],
      [0, 0.117, 0],
    ],
    0.004,
    'glass',
  ),
);
benchExtra.push(ball([0.4, 0.79, -0.24], 0.012, 'glass'), ball([0.4, 0.79, -0.24], 0.009, 'token:signal'), box([0.4, 0.761, -0.24], [0.035, 0.022, 0.035], 'steel'));
parts.push({
  id: 'bench',
  context: true,
  name: l('Laboratory bench', '实验台'),
  summary: l('Supports the independent model apparatus.', '支承各个独立模型的器材。'),
  detail: l(
    'Original 1.8 × 0.7 m design bench, top at 0.75 m. Adjacent apparatus are separate experiments, not thermally connected. The fixed glass envelope and bulb of the qualitative liquid-column diagram are static context; only its selected liquid column lengthens. [S27]',
    '原创设计台面为1.8 × 0.7 m，台面高0.75 m。并排器材属于独立实验，不表示互相热接触。定性液柱图的固定玻璃外壳和球泡是静态背景；只有可选液柱变长。[S27]',
  ),
  primitive: bevel([0, 0.73, 0], [1.8, 0.04, 0.7], 'plastic', 0.006),
  extra: benchExtra,
  castShadow: true,
  clip: false,
});

const controlLabels: Record<string, [string, string]> = {
  'elapsed-s': ['Elapsed time', '经过时间'],
  'water-g': ['Water mass', '水的质量'],
  'heater-w': ['Heater power', '加热功率'],
  'cool-start-c': ['Starting temperature', '冷却初温'],
  cover: ['Insulation', '包覆'],
  'bath-c': ['Bath temperature', '温浴温度'],
  'rod-c': ['Rod temperature', '杆温度'],
};
const outputLabels: Record<string, string> = {
  'heated-c': 'Heated-water temperature',
  'heated-j': 'Net energy received',
  'heated-input-j': 'Energy supplied',
  'metal-c': 'Metal far-end temperature',
  'plastic-c': 'Plastic far-end temperature',
  'metal-rate-w': 'Metal net heating rate',
  'plastic-rate-w': 'Plastic net heating rate',
  'tip-comparison': 'Far-end comparison',
  'cool-c': 'Cooling-water temperature',
  'cool-rate-w': 'Net heating rate',
  'cool-energy-j': 'Cooling net energy',
  'cool-reservoir-j': 'Energy to environment',
  'cool-direction': 'Cooling-water change',
  'heated-direction': 'Heated-water change',
  'metal-direction': 'Metal temperature change',
  'plastic-direction': 'Plastic temperature change',
  'rod-delta-mm': 'Rod extension',
  'rod-length-mm': 'Rod length',
  'heater-rate-w': 'Heater net heating rate',
  'heated-change-k': 'Heating temperature change',
  'cool-change-k': 'Cooling temperature change',
  'heated-reservoir-j': 'Heater energy to environment',
  'metal-energy-j': 'Metal net energy',
  'plastic-energy-j': 'Plastic net energy',
};
// Chinese labels that read better than the shared fixture's short forms.
const outputLabelsZh: Record<string, string> = {
  'metal-direction': '金属温度变化',
  'plastic-direction': '塑料温度变化',
  'heated-change-k': '加热温度变化',
  'cool-change-k': '冷却温度变化',
};
const camera = (position: V, target: V) => ({ position, target, fov: 30 });
const hero = camera([-0.30, 1.10, 0.66], [-0.595, 0.87, 0.09]);
// The HUD-off cover and the assembled / exploded views show every experiment, so no chapter hides its own apparatus behind the bath close-up.
const overview = camera([-0.04, 1.42, 1.95], [-0.04, 0.80, -0.05]);
const presets = [
  { id: 'view-hero', label: l('Bench', '实验台'), camera: hero },
  { id: 'view-probe', label: l('Thermometer', '温度计'), camera: camera([-0.34, 1.09, 0.56], [-0.60, 0.89, 0.085]) },
  { id: 'view-spoons', label: l('Spoons', '勺子'), camera: camera([-0.36, 1.10, 0.57], [-0.59, 0.88, 0.10]) },
  { id: 'view-heater', label: l('Heating', '加热'), camera: camera([0.43, 1.26, 1.08], [0.36, 0.89, 0.08]) },
  { id: 'view-cooler', label: l('Cooling', '冷却'), camera: camera([0.68, 1.26, 1.08], [0.43, 0.89, 0.08]) },
  { id: 'view-expansion', label: l('Expansion', '膨胀'), camera: camera([0.7, 1.3, 0.7], [0.32, 0.85, -0.22]) },
];
const poses = {
  'ball-ring-start': { 'expansion-ball': { scale: 1 } },
  'ball-ring-warm': { 'expansion-ball': { scale: 1.2 } },
  'liquid-column-start': { 'expansion-thermometer': { scale: [1, 1, 1], pivot: [0.4, 0.799, -0.24] } },
  'liquid-column-warm': { 'expansion-thermometer': { scale: [1, 1.9, 1], pivot: [0.4, 0.799, -0.24] } },
  'gas-start': { 'gas-piston': { offset: [0, 0, 0] } },
  'gas-warm': { 'gas-piston': { offset: [0, 0.035, 0] } },
};
const sim = {
  kind: 'heat',
  controls: HEAT_CONTROLS.map((c) => ({ ...c, label: l(...controlLabels[c.id]!) })),
  outputs: HEAT_OUTPUTS.map((o) => ({ ...o, label: { en: outputLabels[o.id], zh: outputLabelsZh[o.id] ?? o.label.zh } })),
  heat: heatBench,
  bind: [
    { control: 'bath-c', part: 'probe-marker', offset: { axis: [0, 1, 0], per: 0.0008, origin: 25 } },
    { output: 'heated-c', part: 'heater-probe-marker', offset: { axis: [0, 1, 0], per: 0.0008, origin: 25 } },
    { output: 'cool-c', part: 'cool-probe-marker', offset: { axis: [0, 1, 0], per: 0.0008, origin: 25 } },
    { output: 'metal-c', part: 'metal-tip-marker', offset: { axis: [0, 1, 0], per: 0.0004, origin: 25 } },
    { output: 'plastic-c', part: 'plastic-tip-marker', offset: { axis: [0, 1, 0], per: 0.0004, origin: 25 } },
    { output: 'rod-delta-mm', part: 'rod-end-marker', offset: { axis: [1, 0, 0], per: 0.5, origin: 0 } },
    { control: 'cover', part: ['wrap', 'air-gap'], visible: { eq: 'wrapped' } },
    { output: 'metal-rate-w', flow: 'heat-to-metal', intensity: { full: 20, mode: 'speed' } },
    { output: 'plastic-rate-w', flow: 'heat-to-plastic', intensity: { full: 20, mode: 'speed' } },
  ],
};
const flows = [
  ['heat-to-metal', -0.567, 'metal-spoon', 'metal-tip-marker'],
  ['heat-to-plastic', -0.533, 'plastic-spoon', 'plastic-tip-marker'],
].map(([id, x, spoon, marker]) => ({
  id,
  group: 'heat-paths',
  path: [
    [Number(x), 0.791, 0.115],
    [Number(x), 0.815, 0.115],
    [Number(x), 0.875, 0.115],
    [Number(x), 0.938, 0.115],
  ],
  speed: 0.08,
  count: 48,
  size: 0.45,
  spread: 0.0008,
  color: 'token:signal',
  ends: 'fade',
  clip: false,
  parts: ['bath-water', spoon, marker],
  whenRun: true,
}));
const raw = {
  parts,
  groups: [
    { id: 'transfer', name: l('Heat transfer', '传热'), color: 'token:ink-2' },
    { id: 'curves', name: l('Heating and cooling', '加热与冷却'), color: 'token:cold' },
    { id: 'expansion', name: l('Expansion', '膨胀'), color: 'token:neutral' },
    { id: 'heat-paths', name: l('Energy-transfer symbols', '能量传递符号'), color: 'token:signal' },
  ],
  flows,
  animations: [],
  presets,
  poses,
  units: { modelUnit: 'm', scale: 1 },
  views: {
    assembled: { camera: overview },
    exploded: { camera: overview },
    cover: overview,
    hudFrame: { parts: ['bath-beaker','retort-stand','bath-holder','probe','heater','heater-beaker','heater-probe-support','heater-probe','cooling-beaker','cooler-probe-support','cool-probe','room-reference','rod','expansion-ball','expansion-ring','expansion-thermometer','gas-cylinder','gas-piston'], primary: {part:'bath-beaker',minRadiusPx:28} },
    section: { plane: 'xy' },
    reference: { fit: 'layers' },
    cutaway: { normal: [0, 0, -1], offset: 0.1 },
    cuts: {
      'wrap-section': { normal: [0, 0, -1], offset: 0.1, label: l('Wrap section', '包覆层剖面') },
      'gas-section': { normal: [0, 0, -1], offset: -0.24, label: l('Piston section', '活塞筒剖面') },
    },
  },
  spec: [
    { key: l('Elapsed time', '经过时间'), value: '0–300 s', tag: 'design' },
    { key: l('Default water mass', '默认水量'), value: '200 g', tag: 'design' },
    { key: l('Environment', '环境'), value: '25 °C', tag: 'design' },
    { key: l('Reference rod', '参考钢杆'), value: '100 mm', tag: 'design' },
  ],
  telemetry: [
    { key: l('Temperature', '温度'), follow: ['heated-c', 'cool-c'], unit: '°C', scope: 'observe', lag: 0, decimals: 1 },
    { key: l('Far ends', '勺柄远端'), follow: ['metal-c', 'plastic-c'], unit: '°C', scope: 'observe', lag: 0, decimals: 1 },
    { key: l('Net energy received', '净传入能量'), follow: ['heated-j', 'cool-energy-j'], unit: 'J', scope: 'observe', lag: 0, decimals: 0 },
    { key: l('Input energy', '外部供能'), follow: 'heated-input-j', unit: 'J', scope: 'observe', lag: 0, decimals: 0 },
    { key: l('Net power received', '净传入功率'), follow: ['cool-rate-w', 'metal-rate-w', 'plastic-rate-w'], unit: 'W', scope: 'observe', lag: 0, decimals: 1 },
    { key: l('Rod extension', '钢杆伸长'), follow: 'rod-delta-mm', unit: 'mm', scope: 'observe', lag: 0, decimals: 3 },
  ],
  sim,
};

export function buildHeatParts() {
  return partsFile.parse(raw);
}
polishApparatus(parts, sim, Number(process.env.HEAT_ITERATION ?? 3));
rebuildExpansion(parts, poses);
const baked = await bakeApparatus(parts, Number(process.env.HEAT_ITERATION ?? 3));
Object.assign(raw, {model: baked.model});
writeFileSync('scripts/geo/heat/mesh-metrics.json', JSON.stringify(baked,null,2)+'\n');
const data = buildHeatParts();
const target = fileURLToPath(new URL('../../../src/content/topics/heat/data/', import.meta.url));
mkdirSync(target, { recursive: true });
writeFileSync(`${target}/parts.json`, `${JSON.stringify(raw, null, 2)}\n`);
console.log(`heat: ${data.parts.filter((p) => !p.context).length} parts + bench; ${data.groups.length} groups; ${data.flows.length} flows; ${data.presets?.length} presets`);

// Keep baseline chapter cameras and beat presets in agreement; prose and beats remain intact.
const chapterCameras: Record<string,string> = {'00-before-you-start':'view-hero','01-temperature-and-heat':'view-probe','02-heat-along-spoons':'view-spoons','03-slowing-heat-transfer':'view-cooler','04-heating-curves':'view-heater','05-cooling-curves':'view-cooler','06-expansion-and-contraction':'view-expansion','07-explain-with-evidence':'view-spoons'};
for(const [name,id] of Object.entries(chapterCameras)){
 const path=fileURLToPath(new URL(`../../../src/content/topics/heat/chapters/${name}.mdx`,import.meta.url));
 const c=presets.find(p=>p.id===id)!.camera;
 const block=`  camera:\n    position:\n${c.position.map(v=>`    - ${v}`).join('\n')}\n    target:\n${c.target.map(v=>`    - ${v}`).join('\n')}\n    fov: ${c.fov}\n`;
 writeFileSync(path,readFileSync(path,'utf8').replace(/  camera:\n    position:[\s\S]*?    fov: 30\n/,block));
}
