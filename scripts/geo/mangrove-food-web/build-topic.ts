/** Rebuild the fixed teaching web's sourced table rows; no runtime ecology solver. */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { buildParts } from './build-parts';

type Text = { en: string; zh: string };
type Node = { id: string; label: Text; role: 'producer' | 'consumer'; parts: string[]; d: [number, number]; sources: string[] };
type Edge = { id: string; from: string; to: string; evidence: string; sources: string[]; note: Text };
type Graph = { nodes: Node[]; edges: Edge[]; controls: unknown[] };
const dir = dirname(fileURLToPath(import.meta.url));
const target = resolve(dir, '../../../src/content/topics/mangrove-food-web/data');
const graph: Graph = JSON.parse(readFileSync(resolve(target, '../authoring/food-web.json'), 'utf8'));
const text = (en: string, zh: string): Text => ({ en, zh });
const states = {
  unchanged: text('Same shown foods', '图内食物未减少'),
  'fewer-foods': text('Fewer shown foods', '图内食物减少'),
  'no-shown-food': text('No food path shown', '图内未留食物路径'),
  removed: text('Removed from this web', '已从这个网移走'),
};
const removals = ['none', ...graph.nodes.map((n) => n.id)];
const consumers = graph.nodes.filter((n) => n.role === 'consumer');
function scenario(remove: string) {
  const present = new Set(graph.nodes.filter((n) => n.id !== remove).map((n) => n.id));
  const supported = new Set(graph.nodes.filter((n) => present.has(n.id) && n.role === 'producer').map((n) => n.id));
  // Monotone propagation reaches a fixed point; schema rejects cycles before publication.
  for (let i = 0; i < graph.nodes.length; i++)
    for (const e of graph.edges)
      if (present.has(e.to) && supported.has(e.from)) supported.add(e.to);
  const active = Object.fromEntries(graph.edges.map((e) => [e.id, Number(present.has(e.from) && present.has(e.to) && supported.has(e.from))]));
  const foods = (id: string) => graph.edges.filter((e) => e.to === id).reduce((sum, e) => sum + active[e.id]!, 0);
  const status = (id: string) => !present.has(id) ? 'removed' : graph.nodes.find((n) => n.id === id)!.role === 'producer' ? 'unchanged' : !foods(id) ? 'no-shown-food' : foods(id) < graph.edges.filter((e) => e.to === id).length ? 'fewer-foods' : 'unchanged';
  return { present, supported, active, foods, status };
}
const number = (id: string, label: Text, decimals = 0) => ({ id, kind: 'number', label, decimals, tag: 'sim' });
const state = (id: string, label: Text) => ({ id, kind: 'state', label, states });
const outputs = [
  number('present-count', text('Present nodes', '未移走节点')),
  number('supported-count', text('Nodes with food paths', '有食物路径节点')),
  number('active-links', text('Active links', '有效连线')),
  ...graph.nodes.map((n) => state(`status-${n.id}`, n.label)),
  ...graph.edges.map((e) => number(`active-${e.id}`, text('Active feeding link', '有效取食连线'))),
  number('foods', text('Shown food types', '图内食物种类')),
  state('food-status', text('Food pathway status', '食物路径状态')),
  number('water-rise', text('Diagram water displacement', '示意水面位移'), 2),
  number('crab-rise', text('Diagram crab displacement', '示意蟹位移'), 2),
  number('show-fiddlers', text('Fiddlers visible', '招潮蟹可见')),
];
const webRows = removals.map((remove) => {
  const s = scenario(remove);
  return { when: { remove }, set: {
    'present-count': s.present.size, 'supported-count': s.supported.size,
    'active-links': Object.values(s.active).reduce((a, b) => a + b, 0),
    ...Object.fromEntries(graph.nodes.map((n) => [`status-${n.id}`, s.status(n.id)])),
    ...Object.fromEntries(graph.edges.map((e) => [`active-${e.id}`, s.active[e.id]])),
  }, source: ['S30'] };
});
const inspectionRows = removals.flatMap((remove) => consumers.map((n) => {
  const s = scenario(remove);
  return { when: { remove, inspect: n.id }, set: { foods: s.foods(n.id), 'food-status': s.status(n.id) }, source: ['S30'] };
}));
const tideRows = removals.flatMap((remove) => ['low', 'high'].map((tide) => ({ when: { remove, tide }, set: {
  'water-rise': tide === 'high' ? .14 : 0, 'crab-rise': tide === 'high' ? .16 : 0,
  'show-fiddlers': Number(remove !== 'n-fiddlers' && tide === 'low'),
}, source: ['S30'] })));
const file = buildParts();
const anchors: Record<string, [number, number, number]> = {
  'n-mangrove': [-.1, .025, .1], 'n-algae': [.055, .014, .13],
  'n-tree-crabs': [.19, .15, -.19], 'n-fiddlers': [-.35, .045, .04],
  'n-mudskipper': [.42, .055, .145], 'n-heron': [.79, .36, -.02],
};
const flows = graph.edges.map((e) => {
  const a = anchors[e.from]!, b = anchors[e.to]!;
  return {
    id: `food-${e.id}`, group: 'food-paths',
    path: [a, [(a[0] + b[0]) / 2, Math.max(a[1], b[1]) + .1, (a[2] + b[2]) / 2], b],
    color: 'token:food', speed: .12, count: 24, size: .6,
    spread: .002, clip: false, flat: true, whenRun: true,
  };
});
const sim = {
  kind: 'table', controls: graph.controls, outputs,
  table: { experiments: {
    web: { keys: ['remove'], rows: webRows },
    inspection: { keys: ['remove', 'inspect'], rows: inspectionRows },
    'tide-pose': { keys: ['remove', 'tide'], rows: tideRows },
  } },
  bind: [
    { output: 'water-rise', part: 'tidal-water', offset: { axis: [0, 1, 0], per: 1, origin: 0 } },
    { output: 'crab-rise', part: 'tree-crabs', offset: { axis: [0, 1, 0], per: 1, origin: 0 } },
    { output: 'show-fiddlers', part: 'fiddler-crabs', visible: { eq: 1 } },
    ...graph.nodes.filter((n) => n.id !== 'n-fiddlers').map((n) => ({ control: 'remove', part: n.parts, visible: { ne: n.id } })),
    ...graph.edges.flatMap((e) => [
      { output: `active-${e.id}`, flow: `food-${e.id}`, intensity: { full: 1, mode: 'density' } },
      { control: 'tide', flow: `food-${e.id}`, visible: { eq: 'low' } },
    ]),
  ],
  foodWeb: {
    inspect: 'inspect',
    nodes: graph.nodes.map(({ id, label, role, parts, d, sources }) => ({ id, label, role, parts, d, sources, output: `status-${id}` })),
    edges: graph.edges.map(({ id, from, to, evidence, sources, note }) => ({ id, from, to, evidence, sources, note, output: `active-${id}` })),
    note: text('Selected possible feeding links. Missing pathways do not predict extinction.', '这里只选入一些可能的取食关系。路径中断不等于预测灭绝。'),
  },
};
writeFileSync(resolve(target, 'parts.json'), JSON.stringify({ ...file, flows, sim }, null, 2) + '\n');
