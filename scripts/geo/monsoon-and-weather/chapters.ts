/**
 * monsoon-and-weather: chapter and beat table (docs/50 §2), the single source for every
 * chapter's frontmatter. `build-chapters.ts` writes it into the chapter files and keeps
 * their bodies; `tests/time-scene/monsoon-and-weather.test.ts` checks it against the data.
 */

export type LayerSet = 'map' | 'wind' | 'rain' | 'both';
export type Bi = { en: string; zh: string };
export interface BeatRow {
  month: number;
  preset: string;
  layers: LayerSet;
  highlight: string[];
  caption: Bi;
}
export interface ChapterRow {
  file: string;
  id: string;
  order: number;
  background?: true;
  title: Bi;
  index: string[];
  /** Defaults to the first beat's caption (docs/50 §2). */
  summary?: Bi;
  note?: Bi;
  beats: BeatRow[];
}

export const LAYERS: Record<LayerSet, string[]> = {
  map: ['base', 'sites'],
  wind: ['base', 'sites', 'clim-wind'],
  rain: ['base', 'sites', 'clim-rain'],
  both: ['base', 'sites', 'clim-wind', 'clim-rain'],
};

const SG = 'site-singapore';
const KL = 'site-kuala-lumpur';
const JKT = 'site-jakarta';
const HAN = 'site-hanoi';
const ALL_SITES = [SG, KL, JKT, HAN, 'site-bangkok', 'site-manila'];

export const CHAPTERS: ChapterRow[] = [
  {
    file: '00-background.mdx',
    id: 'background',
    order: 0,
    background: true,
    title: { en: 'Read a year of weather', zh: '怎样读一整年的天气' },
    index: ALL_SITES,
    note: {
      en: 'These maps compare calendar-month means for 1991–2020. Wind is a regional pressure-level reanalysis; rain is a satellite–gauge estimate. Neither is a forecast or a school observation. City points locate the discussion.',
      zh: '地图比较 1991–2020 年各月平均。风来自区域气压层再分析，雨来自卫星与测站合成估计；它们不是预报，也不是学校观测。城市点只标示讨论位置。',
    },
    beats: [
      {
        month: 1,
        preset: 'view-region',
        layers: 'map',
        highlight: [],
        caption: {
          en: 'January, with the 1991–2020 monthly layers still switched off: this map shows Southeast Asia. Its city points are reading anchors, not weather stations.',
          zh: '1 月，1991–2020 年的月平均图层还没有打开：地图显示东南亚。城市点帮助认位置，并不代表气象站。',
        },
      },
      {
        month: 1,
        preset: 'view-region',
        layers: 'wind',
        highlight: [],
        caption: {
          en: 'January climatology: wind arrows point towards the air’s motion. The values describe the regional 850 hPa level, not surface gusts.',
          zh: '1 月气候平均：风箭头朝空气移动的方向。数值表示区域 850 hPa 气压层的风，不是地面阵风。',
        },
      },
      {
        month: 1,
        preset: 'view-region',
        layers: 'rain',
        highlight: [],
        caption: {
          en: 'January climatology: shaded cells show mean precipitation rate in millimetres per day. They do not show today’s rain.',
          zh: '1 月气候平均：色块表示平均降水率，单位是毫米／日，并不显示今天下雨的地方。',
        },
      },
      {
        month: 1,
        preset: 'view-singapore',
        layers: 'map',
        highlight: [SG],
        caption: {
          en: 'January reference view: Singapore is the local anchor. Open Water in Singapore to revisit evaporation, condensation and the water cycle.',
          zh: '1 月参考视图：新加坡是本地锚点。打开《新加坡的水》，重温蒸发、凝结和水循环。',
        },
      },
    ],
  },
  {
    file: '01-regional-winds.mdx',
    id: 'regional-winds',
    order: 1,
    title: { en: 'The winds change through the year', zh: '风怎样随着月份转变' },
    index: [SG, HAN],
    beats: [
      {
        month: 1,
        preset: 'view-region',
        layers: 'both',
        highlight: [],
        caption: {
          en: 'January climatology: inspect the regional arrows and rain cells together. Seasonal circulation concerns a region, rather than one coastal afternoon.',
          zh: '1 月气候平均：一起看区域风箭头和雨量格点。季风讲的是大范围环流，并非一个海岸下午的海风。',
        },
      },
      {
        month: 7,
        preset: 'view-equator',
        layers: 'both',
        highlight: [SG],
        caption: {
          en: 'July climatology: near the equatorial grid node at 105 degrees east, the mean northward wind component differs from January.',
          zh: '7 月气候平均：在东经 105 度的赤道格点，平均南北风分量与 1 月不同。',
        },
      },
      {
        month: 7,
        preset: 'view-north',
        layers: 'wind',
        highlight: [HAN],
        caption: {
          en: 'July climatology: these arrows describe regional flow. Rotation affects large-scale winds differently north and south of the equator.',
          zh: '7 月气候平均：箭头显示区域环流。地球自转对赤道南北两侧的大范围风有不同的偏转作用。',
        },
      },
      {
        month: 12,
        preset: 'view-region',
        layers: 'both',
        highlight: [],
        caption: {
          en: 'December climatology: return to the same fixed legends. A month’s resultant vector is not the average of all its instantaneous wind speeds.',
          zh: '12 月气候平均：回看相同的固定图例。月平均矢量的大小，不等于这一个月每次风速的平均。',
        },
      },
    ],
  },
  {
    file: '02-northeast-monsoon.mdx',
    id: 'northeast-monsoon',
    order: 2,
    title: { en: 'Two phases of the Northeast Monsoon', zh: '东北季风的前后两段' },
    index: [SG, JKT],
    beats: [
      {
        month: 12,
        preset: 'view-equator',
        layers: 'both',
        highlight: [SG],
        caption: {
          en: 'December climatology: Singapore’s Northeast Monsoon usually begins around this part of the year, with an early wetter phase.',
          zh: '12 月气候平均：新加坡的东北季风通常在这一时期开始，前段较湿。',
        },
      },
      {
        month: 1,
        preset: 'view-north',
        layers: 'both',
        highlight: [],
        caption: {
          en: 'January climatology: the South China Sea is the regional setting for monsoon surges. A monthly mean does not show any individual surge.',
          zh: '1 月气候平均：南中国海是季风涌经过的区域。月平均图并不显示某一次季风涌。',
        },
      },
      {
        month: 2,
        preset: 'view-java',
        layers: 'rain',
        highlight: [JKT],
        caption: {
          en: 'February climatology: compare rain shading towards Java. Singapore’s weather service describes the tropical rain belt moving farther south at this time.',
          zh: '2 月气候平均：比较爪哇方向的雨量色块。新加坡气象局指出，这时热带雨带移得更偏南。',
        },
      },
      {
        month: 2,
        preset: 'view-singapore',
        layers: 'map',
        highlight: [SG],
        caption: {
          en: 'February reference view: Changi’s mean monthly total is 105.1 millimetres, compared with 331.9 in December, for 1991–2020. These are station values.',
          zh: '2 月参考视图：1991–2020 年，樟宜站的月平均总雨量为 105.1 毫米，12 月为 331.9 毫米。这是测站数值。',
        },
      },
    ],
  },
  {
    file: '03-inter-monsoons.mdx',
    id: 'inter-monsoons',
    order: 3,
    title: { en: 'Between the monsoons', zh: '两段季风之间' },
    index: [SG],
    beats: [
      {
        month: 3,
        preset: 'view-singapore',
        layers: 'map',
        highlight: [SG],
        caption: {
          en: 'March reference view: early March can still be Northeast Monsoon; the later part is a transition. The boundary varies between years.',
          zh: '3 月参考视图：月初仍可能处于东北季风，月后段转入过渡期，实际边界随年份变化。',
        },
      },
      {
        month: 4,
        preset: 'view-straits',
        layers: 'both',
        highlight: [SG],
        caption: {
          en: 'April climatology: the regional average is shown here; Singapore’s weather service describes the island’s surface winds in the inter-monsoon as light and variable.',
          zh: '4 月气候平均：这里显示区域平均；新加坡气象局将本地过渡期的地面风描述为轻而多变。',
        },
      },
      {
        month: 4,
        preset: 'view-singapore',
        layers: 'map',
        highlight: [SG],
        caption: {
          en: 'April reference view: Singapore marks the local setting. An ordinary storm cell grows, matures and decays; this map does not track a particular cloud.',
          zh: '4 月参考视图：新加坡标示本地位置。普通雨胞经历成长、成熟与消散；本图不追踪某一朵云。',
        },
      },
      {
        month: 10,
        preset: 'view-straits',
        layers: 'both',
        highlight: [SG],
        caption: {
          en: 'October climatology: this is the second transition period. Local heating and sea breezes can help afternoon thunderstorms develop.',
          zh: '10 月气候平均：这是另一段过渡期。本地受热与海风可帮助午后雷雨发展。',
        },
      },
    ],
  },
  {
    file: '04-southwest-monsoon.mdx',
    id: 'southwest-monsoon',
    order: 4,
    title: { en: 'A regional name and a local wind', zh: '区域季风名称与本地风向' },
    index: [SG],
    beats: [
      {
        month: 6,
        preset: 'view-region',
        layers: 'both',
        highlight: [],
        caption: {
          en: 'June climatology: Singapore’s Southwest Monsoon usually begins around June and continues through September.',
          zh: '6 月气候平均：新加坡的西南季风通常约从 6 月开始，持续至 9 月。',
        },
      },
      {
        month: 7,
        preset: 'view-singapore',
        layers: 'map',
        highlight: [SG],
        caption: {
          en: 'July reference view: Singapore’s surface winds are commonly from the southeast to south in this season, despite its regional name.',
          zh: '7 月参考视图：这一季节在新加坡常见东南至南方来风，不能只按季风名称判断本地风向。',
        },
      },
      {
        month: 7,
        preset: 'view-equator',
        layers: 'both',
        highlight: [SG],
        caption: {
          en: 'July climatology: the arrows return at regional scale. They represent 850 hPa winds and must not be read as Changi’s surface wind measurements.',
          zh: '7 月气候平均：把箭头放回区域尺度。它们表示 850 hPa 层的风，不可当作樟宜站的地面测量。',
        },
      },
      {
        month: 9,
        preset: 'view-region',
        layers: 'both',
        highlight: [],
        caption: {
          en: 'September climatology: use the same rain legend as January. Seasonal averages describe patterns; individual days still differ.',
          zh: '9 月气候平均：雨量图例与 1 月相同。季节平均描述规律，每一天仍会不同。',
        },
      },
    ],
  },
  {
    file: '05-sumatra-squalls.mdx',
    id: 'sumatra-squalls',
    order: 5,
    title: { en: 'A line of storms crosses the straits', zh: '越过海峡的一列雷雨' },
    index: [SG],
    beats: [
      {
        month: 7,
        preset: 'view-straits',
        layers: 'map',
        highlight: [SG],
        caption: {
          en: 'July reference view: Sumatra and the Strait of Malacca lie west of Singapore. Sumatra squalls commonly develop in that region.',
          zh: '7 月参考视图：苏门答腊与马六甲海峡位于新加坡以西，苏门答腊飑线常在这一带发展。',
        },
      },
      {
        month: 7,
        preset: 'view-singapore',
        layers: 'map',
        highlight: [SG],
        caption: {
          en: 'July reference view: organised storm lines can travel eastwards and bring sudden gusts and heavy rain. No observed storm track is drawn here.',
          zh: '7 月参考视图：组织起来的雷雨线可向东移动，带来突发阵风和大雨。这里没有绘制实测风暴轨迹。',
        },
      },
      {
        month: 7,
        preset: 'view-straits',
        layers: 'both',
        highlight: [SG],
        caption: {
          en: 'July climatology: restoring the monthly layers does not reveal a particular squall. This average combines many different weather situations.',
          zh: '7 月气候平均：重新打开月平均图层，也看不到某一次飑线。这幅平均图合并了许多不同天气情况。',
        },
      },
      {
        month: 12,
        preset: 'view-equator',
        layers: 'map',
        highlight: [SG],
        caption: {
          en: 'December reference view: the Singapore marker locates the discussion. Local storm cells, squall lines and monsoon surges are different rain systems, not events measured on this map.',
          zh: '12 月参考视图：新加坡点标示讨论位置。本地雨胞、飑线和季风涌是不同雨系统，本图没有显示一次实测事件。',
        },
      },
    ],
  },
  {
    file: '06-thunder-and-shelter.mdx',
    id: 'thunder-and-shelter',
    order: 6,
    title: { en: 'Inside a cloud, then into shelter', zh: '看懂雷雨云，及时进屋' },
    index: [SG],
    summary: {
      en: 'Hear thunder: tell an adult, seek safe shelter immediately, and stay there at least 30 minutes after the last thunder.',
      zh: '听雷就告诉成人，立即进入安全处；最后雷声后仍留至少 30 分钟。',
    },
    beats: [
      {
        month: 4,
        preset: 'view-singapore',
        layers: 'map',
        highlight: [SG],
        caption: {
          en: 'April reference view: Singapore is a location marker, not a detected storm. Visible clouds contain droplets and sometimes ice; a cloud has no solid shell.',
          zh: '4 月参考视图：新加坡只是位置标记，不是探测到的风暴。可见云含水滴，也可有冰；云没有硬壳。',
        },
      },
      {
        month: 4,
        preset: 'view-singapore',
        layers: 'map',
        highlight: [SG],
        caption: {
          en: 'April reference view: lightning rapidly heats air along its path; the air’s expansion produces thunder. Clouds do not need to collide.',
          zh: '4 月参考视图：闪电令路径附近空气迅速受热膨胀，产生雷声，并不需要两片云相撞。',
        },
      },
      {
        month: 4,
        preset: 'view-singapore',
        layers: 'map',
        highlight: [SG],
        caption: {
          en: 'April reference view: hearing thunder means move promptly into a substantial building or an enclosed, metal-topped vehicle with windows up. Tell a responsible adult.',
          zh: '4 月参考视图：听到雷声，立即告诉负责的成人，进入合适的坚固建筑，或关好车窗的封闭金属顶车辆。',
        },
      },
      {
        month: 4,
        preset: 'view-singapore',
        layers: 'map',
        highlight: [SG],
        caption: {
          en: 'April reference view: stay sheltered for at least 30 minutes after the last thunder. Avoid plumbing and corded electrical equipment; an isolated tree is unsafe shelter.',
          zh: '4 月参考视图：最后一次雷声后，仍留在安全处至少 30 分钟。避开管道及有线电器，不要躲在孤树下。',
        },
      },
    ],
  },
  {
    file: '07-haze-across-borders.mdx',
    id: 'haze-across-borders',
    order: 7,
    title: { en: 'Smoke crosses borders', zh: '烟霾跨过国界' },
    index: [JKT, KL, SG],
    beats: [
      {
        month: 8,
        preset: 'view-region',
        layers: 'both',
        highlight: [],
        caption: {
          en: 'August climatology: the arrows illustrate the regional wind field. Fires can supply smoke that winds transport, but these arrows do not trace a haze episode.',
          zh: '8 月气候平均：箭头显示区域风场。火产生的烟可由风输送，但这些箭头不是某次烟霾事件的轨迹。',
        },
      },
      {
        month: 8,
        preset: 'view-indonesia',
        layers: 'map',
        highlight: [JKT],
        caption: {
          en: 'August reference view: Indonesia’s BMKG describes early warning, cooperation and efforts to keep peat wetter to reduce fire risk. Jakarta is a discussion anchor, not a fire location.',
          zh: '8 月参考视图：印尼 BMKG 介绍预警、协作及保持泥炭湿润以减低火险的工作。雅加达只是讨论锚点，不是火点。',
        },
      },
      {
        month: 8,
        preset: 'view-malaysia',
        layers: 'map',
        highlight: [KL],
        caption: {
          en: 'August reference view: Malaysia’s atmospheric monitoring supports study of regional problems including transboundary haze. The capital point does not locate a monitoring instrument.',
          zh: '8 月参考视图：马来西亚的大气监测支持研究跨境烟霾等区域问题。首都点并不表示监测仪器的位置。',
        },
      },
      {
        month: 8,
        preset: 'view-straits',
        layers: 'map',
        highlight: [SG, KL],
        caption: {
          en: 'August reference view: Singapore, Malaysia and Indonesia are part of the regional story. ASEAN’s haze agreement was signed in 2002; a monthly wind map cannot assign responsibility for individual fires.',
          zh: '8 月参考视图：新加坡、马来西亚和印尼都是区域故事的一部分。东盟烟霾协定于 2002 年签署；月平均风图不能判定个别火灾的责任。',
        },
      },
    ],
  },
  {
    file: '08-averages-and-change.mdx',
    id: 'averages-and-change',
    order: 8,
    title: { en: 'What an average can tell us', zh: '平均图能告诉我们什么' },
    index: [SG],
    beats: [
      {
        month: 1,
        preset: 'view-region',
        layers: 'both',
        highlight: [],
        caption: {
          en: 'January climatology: return to the start of the twelve-month cycle. The baseline stays 1991–2020; scrubbing months does not move through historical years.',
          zh: '1 月气候平均：回到十二个月循环的起点。基准期始终是 1991–2020 年，拖动月份并不是浏览历史年份。',
        },
      },
      {
        month: 7,
        preset: 'view-singapore',
        layers: 'map',
        highlight: [SG],
        caption: {
          en: 'July reference view: Singapore is the local anchor. El Niño generally brings less rainfall here, and La Niña generally brings more; these are tendencies.',
          zh: '7 月参考视图：新加坡是本地锚点。厄尔尼诺时这里一般较少雨，拉尼娜时一般较多雨，这是倾向，并非保证。',
        },
      },
      {
        month: 7,
        preset: 'view-region',
        layers: 'map',
        highlight: [],
        caption: {
          en: 'July reference view: no monthly fields are shown. Human-caused climate change affects many extremes worldwide; this map cannot attribute a particular Singapore rainfall event.',
          zh: '7 月参考视图：这里未开月平均图层。人为气候变化影响全球许多极端天气；本图不能为某次新加坡降雨作归因。',
        },
      },
      {
        month: 12,
        preset: 'view-singapore',
        layers: 'map',
        highlight: [SG],
        caption: {
          en: 'December reference view: Singapore is the local anchor. Open Water in Singapore to explore rain and water use, keeping regional climate averages separate from local observations.',
          zh: '12 月参考视图：新加坡是本地锚点。打开《新加坡的水》继续看雨与用水，并把区域气候平均与本地观测分开。',
        },
      },
    ],
  },
];
