/** Optional directed food-web plate on a table sim; this describes a card, never a solver. */
import { z } from 'zod';
import { kebabId } from '../../content/schema/common';
import { sourceId } from '../../content/schema/sources';
import type { SimControl, SimOutput } from './sim-schema';
import type { TableData } from './table-schema';

const note = z.object({ en: z.string().trim().min(1), zh: z.string().trim().min(1) }).strict();
const sources = z.array(sourceId).min(1).max(12);
export const FOOD_STATES = ['unchanged', 'fewer-foods', 'no-shown-food', 'removed'] as const;
export const foodWebSchema = z.object({
  inspect: kebabId,
  nodes: z.array(z.object({
    id: kebabId, label: note, role: z.enum(['producer', 'consumer']),
    parts: z.array(kebabId).min(1).max(12),
    d: z.tuple([z.number().finite().min(0.22).max(0.78), z.number().finite().min(0.10).max(0.90)]),
    output: kebabId, sources,
  }).strict()).min(2).max(12),
  edges: z.array(z.object({
    id: kebabId, from: kebabId, to: kebabId, output: kebabId,
    evidence: z.enum(['general', 'local-observation', 'reported-observation', 'indexed-only']),
    sources, note,
  }).strict()).min(1).max(48),
  note,
}).strict();
export type FoodWebData = z.output<typeof foodWebSchema>;
type Issue = { path: (string | number)[]; message: string };

/** Teaching DAG restrictions and references, checked with the containing parts file. */
export function foodWebIssues(web: FoodWebData, controls: ReadonlyMap<string, SimControl>, outputs: readonly SimOutput[], parts: ReadonlySet<string>, contextParts: ReadonlySet<string>, table?: TableData): Issue[] {
  const issues: Issue[] = [];
  const add = (path: (string | number)[], message: string) => issues.push({ path, message });
  const nodes = new Map(web.nodes.map((n) => [n.id, n]));
  const byOutput = new Map(outputs.map((o) => [o.id, o]));
  const consumers = web.nodes.filter((n) => n.role === 'consumer').map((n) => n.id);
  const inspect = controls.get(web.inspect);
  if (!inspect || inspect.kind !== 'choice') add(['inspect'], `"${web.inspect}" must name an existing choice control`);
  else if (inspect.options.length !== consumers.length || inspect.options.some((o) => !consumers.includes(o.id))) add(['inspect'], 'inspect options must be exactly the consumer node ids');
  const owned = new Set<string>();
  web.nodes.forEach((n, i) => {
    const at = ['nodes', i];
    if (web.nodes.findIndex((v) => v.id === n.id) !== i) add([...at, 'id'], `duplicate node "${n.id}"`);
    n.parts.forEach((p, j) => {
      if (!parts.has(p)) add([...at, 'parts', j], `unknown part "${p}"`);
      if (contextParts.has(p)) add([...at, 'parts', j], `"${p}" is a context part and cannot be selected`);
      if (owned.has(p)) add([...at, 'parts', j], `shared or duplicate part "${p}"`);
      owned.add(p);
    });
    const o = byOutput.get(n.output);
    if (o?.kind !== 'state') add([...at, 'output'], `"${n.output}" must name a state output`);
    else for (const s of FOOD_STATES) if (!o.states?.[s]?.en.trim() || !o.states[s]?.zh.trim()) add([...at, 'output'], `"${n.output}" needs the state label "${s}"`);
  });
  const pairs = new Set<string>();
  web.edges.forEach((e, i) => {
    const at = ['edges', i];
    if (web.edges.findIndex((v) => v.id === e.id) !== i) add([...at, 'id'], `duplicate edge "${e.id}"`);
    const pair = `${e.from}/${e.to}`;
    if (pairs.has(pair)) add(at, `duplicate edge endpoints "${pair}"`);
    pairs.add(pair);
    if (!nodes.has(e.from)) add([...at, 'from'], `unknown node "${e.from}"`);
    if (!nodes.has(e.to)) add([...at, 'to'], `unknown node "${e.to}"`);
    if (e.from === e.to) add(at, 'self-loop');
    if (nodes.get(e.to)?.role === 'producer') add([...at, 'to'], 'a producer cannot have an incoming edge');
    if (byOutput.get(e.output)?.kind !== 'number') add([...at, 'output'], `"${e.output}" must name a number output`);
    if (table) for (const [id, exp] of Object.entries(table.experiments)) exp.rows.forEach((row, r) => {
      if (e.output in row.set && row.set[e.output] !== 0 && row.set[e.output] !== 1) add([...at, 'output'], `"${e.output}" must contain only 0 or 1 (table.experiments.${id}.rows.${r})`);
    });
  });
  const visit = (id: string, path: Set<string>, done: Set<string>): boolean => {
    if (path.has(id)) return false;
    if (done.has(id)) return true;
    path.add(id);
    for (const e of web.edges.filter((e) => e.from === id && nodes.has(e.to))) if (!visit(e.to, path, done)) return false;
    path.delete(id);
    done.add(id);
    return true;
  };
  const done = new Set<string>();
  for (const n of web.nodes) if (!visit(n.id, new Set(), done)) { add(['edges'], 'cycle in the teaching food web'); break; }
  // Every consumer must have an upstream producer, not merely another consumer.
  const reachable = new Set(web.nodes.filter((n) => n.role === 'producer').map((n) => n.id));
  for (let i = 0; i < web.nodes.length; i++) for (const e of web.edges) if (reachable.has(e.from)) reachable.add(e.to);
  web.nodes.forEach((n, i) => { if (n.role === 'consumer' && !reachable.has(n.id)) add(['nodes', i], `consumer "${n.id}" has no producer source`); });
  return issues;
}

/** Card evidence references use the topic's normal source registry. */
export function foodWebSourceIssues(web: FoodWebData, sources: ReadonlySet<string>): Issue[] {
  const issues: Issue[] = [];
  for (const kind of ['nodes', 'edges'] as const) web[kind].forEach((item, i) => item.sources.forEach((s, j) => {
    if (!sources.has(s)) issues.push({ path: [kind, i, 'sources', j], message: `unknown source "${s}" (not in data/sources.json)` });
  }));
  return issues;
}
