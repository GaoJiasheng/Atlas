/**
 * The `table` model's author data and its checks (docs/40 §4.2, E-HL1): a few
 * experiments, each a lookup table from the controls it reads (`keys`) to
 * sourced values of the outputs it sets. Every row names its sources; the
 * source checks against `data/sources.json` (`tableSourceIssues`) run in
 * `pnpm validate`, the rest with the parts file (`tableIssues`).
 */
import { z } from 'zod';
import { kebabId } from '../../content/schema/common';
import { sourceId } from '../../content/schema/sources';
import type { SimControl, SimOutput, SimValue } from './sim-schema';
import { cellValue, isCell, tableCombinations, tableExperimentOf } from './lib/sim/table';

/** What an output's numbers are: `sim` (default: set by the design study, "in this model") or `typical` (measured values from a source). */
export const OUTPUT_TAGS = ['sim', 'typical'] as const;
export type OutputTag = (typeof OUTPUT_TAGS)[number];

/** A table cell: a number, a state id, or a number shown with its own decimals (`{ value: 0.04, decimals: 2 }`). */
export const tableCellSchema = z.union([
  z.number().finite(),
  z.string().min(1).max(64),
  z.object({ value: z.number().finite(), decimals: z.number().int().min(0).max(3) }).strict(),
]);
export type TableCell = z.output<typeof tableCellSchema>;

export const tableRowSchema = z
  .object({
    /** The value of each of the experiment's `keys` this row is for. */
    when: z.record(kebabId, z.union([z.boolean(), z.number(), kebabId])),
    /** Output id → cell. */
    set: z.record(kebabId, tableCellSchema),
    /** Where the row's values come from: `S#` of the topic's sources.json. */
    source: z.array(sourceId).min(1).max(6),
  })
  .strict();
export type TableRow = z.output<typeof tableRowSchema>;

export const tableExperimentSchema = z
  .object({
    /** The controls this experiment reads (its rows cover every combination of their values once). */
    keys: z.array(kebabId).min(1).max(4),
    rows: z.array(tableRowSchema).min(1).max(64),
  })
  .strict();
export type TableExperiment = z.output<typeof tableExperimentSchema>;

export const tableSchema = z.object({ experiments: z.record(kebabId, tableExperimentSchema) }).strict();
export type TableData = z.output<typeof tableSchema>;

type Issue = { path: (string | number)[]; message: string };

/** A part the checks read: its `repeat` count (a `count` binding shows at most that many copies). */
export interface TableCheckPart {
  id: string;
  repeat?: { count: number } | undefined;
}

/** A `count` binding of an output: how a value turns into copies (lib/sim/bind.ts). */
export interface TableCount {
  output: string;
  parts: readonly string[];
  per: number;
  minus: number;
}

/**
 * Structure: keys are controls and each experiment has exactly one row for
 * every combination of their values; `set` names outputs of the right kind
 * (a number or a `{ value, decimals }` cell for a number output, a labelled
 * state for a state output), every row of an experiment sets the same
 * outputs, an output belongs to one experiment, state outputs are set by
 * one; outputs read their own id (no `from`), are numbers or states, and
 * `count`-bound parts have copies enough for the largest value.
 */
export function tableIssues(table: TableData, controls: ReadonlyMap<string, SimControl>, outputs: readonly SimOutput[], parts: readonly TableCheckPart[], counts: readonly TableCount[]): Issue[] {
  const out: Issue[] = [];
  const issue = (path: (string | number)[], message: string) => out.push({ path, message });
  const byId = new Map(outputs.map((o) => [o.id, o]));
  const owner = new Map<string, string>();
  for (const [id, exp] of Object.entries(table.experiments)) {
    const at = ['table', 'experiments', id];
    if (new Set(exp.keys).size !== exp.keys.length) issue([...at, 'keys'], 'duplicate keys');
    const keys = exp.keys.map((k) => controls.get(k));
    exp.keys.forEach((k, i) => {
      if (!keys[i]) issue([...at, 'keys', i], `unknown control "${k}"`);
    });
    const sets = new Set<string>();
    exp.rows.forEach((row, r) => {
      const rat = [...at, 'rows', r];
      for (const k of Object.keys(row.when)) if (!exp.keys.includes(k)) issue([...rat, 'when', k], `"${k}" is not one of this experiment's keys (${exp.keys.join(', ')})`);
      exp.keys.forEach((k, i) => {
        const c = keys[i];
        const v = row.when[k];
        if (v === undefined) issue([...rat, 'when'], `give "${k}"`);
        else if (c && !legal(c, v)) issue([...rat, 'when', k], `${JSON.stringify(v)} is not a value of "${k}"`);
      });
      for (const [o, cell] of Object.entries(row.set)) {
        sets.add(o);
        const output = byId.get(o);
        if (!output) {
          issue([...rat, 'set', o], `unknown output "${o}"`);
          continue;
        }
        if (output.kind === 'state') {
          if (typeof cell !== 'string') issue([...rat, 'set', o], `"${o}" is a state: give one of its states`);
          else if (!output.states?.[cell]) issue([...rat, 'set', o], `"${o}" has no state "${cell}" (${Object.keys(output.states ?? {}).join(', ')})`);
        } else if (output.kind === 'number' && typeof cell === 'string') issue([...rat, 'set', o], `"${o}" is a number, "${cell}" is not`);
      }
    });
    exp.rows.forEach((row, r) => {
      const missing = [...sets].filter((o) => !(o in row.set));
      if (missing.length) issue([...at, 'rows', r, 'set'], `every row of "${id}" sets the same outputs: missing ${missing.join(', ')}`);
    });
    for (const o of sets) {
      const prev = owner.get(o);
      if (prev !== undefined && prev !== id) issue([...at], `"${o}" is set by "${prev}" already (one experiment per output)`);
      else owner.set(o, id);
    }
    if (keys.every((c) => c !== undefined)) {
      const seen = new Map<string, number>();
      exp.rows.forEach((row) => {
        const key = exp.keys.map((k) => JSON.stringify(row.when[k] ?? null)).join('|');
        seen.set(key, (seen.get(key) ?? 0) + 1);
      });
      const all = tableCombinations(keys as SimControl[]);
      const missing = all.filter((v) => !seen.has(exp.keys.map((k) => JSON.stringify(v[k])).join('|')));
      const dupes = [...seen].filter(([, n]) => n > 1).map(([k]) => k);
      if (missing.length) issue([...at, 'rows'], `no row for ${missing.map((v) => exp.keys.map((k) => `${k} = ${JSON.stringify(v[k])}`).join(', ')).join('; ')}`);
      if (dupes.length) issue([...at, 'rows'], `more than one row for ${dupes.map((k) => k.split('|').map((v, i) => `${exp.keys[i]} = ${v}`).join(', ')).join('; ')}`);
    }
  }
  outputs.forEach((o, i) => {
    if (o.from !== undefined && o.from !== o.id) issue(['outputs', i, 'from'], 'a table output is set by the rows under its own id: leave `from` out');
    if (o.kind !== 'number' && o.kind !== 'state') issue(['outputs', i, 'kind'], `a table output is a number or a state, not a ${o.kind}`);
    if (o.kind === 'state' && !owner.has(o.id)) issue(['outputs', i], `no experiment sets "${o.id}"`);
    if (o.tag === 'typical' && !owner.has(o.id)) issue(['outputs', i, 'tag'], `"${o.id}" is typical, but no row gives it a sourced value`);
    if (o.tag !== undefined && o.kind !== 'number') issue(['outputs', i, 'tag'], 'SIM / TYPICAL tag numbers (a state is named by its row\'s sources)');
  });
  for (const c of counts) {
    const exp = tableExperimentOf(table, c.output);
    if (!exp) continue;
    const most = Math.max(0, ...table.experiments[exp]!.rows.map((r) => {
      const cell = r.set[c.output];
      return cell === undefined || typeof cell === 'string' ? 0 : Math.round((cellValue(cell) - c.minus) / c.per);
    }));
    for (const id of c.parts) {
      const n = parts.find((p) => p.id === id)?.repeat?.count ?? 0;
      if (n < most) issue(['bind'], `"${id}" has ${n} copies, but "${c.output}" asks for up to ${most} (not enough balls)`);
    }
  }
  return out;
}

/**
 * Sources (`pnpm validate`, against the topic's sources.json): every row's
 * `S#` is listed; a row that sets a `sim` number output cites at least one
 * design study (a source with `design: true`), a row that sets a `typical`
 * one at least one source that is not one (state outputs: any source).
 */
export function tableSourceIssues(table: TableData, outputs: readonly SimOutput[], sources: ReadonlyMap<string, { design?: boolean | undefined }>): Issue[] {
  const out: Issue[] = [];
  // Numbers only: a state (the diaphragm moves down) is a fact its row's sources name, with no SIM / TYPICAL of its own.
  const tag = new Map(outputs.filter((o) => o.kind === 'number').map((o) => [o.id, o.tag ?? 'sim']));
  for (const [id, exp] of Object.entries(table.experiments)) {
    exp.rows.forEach((row, r) => {
      const at = ['table', 'experiments', id, 'rows', r, 'source'];
      for (const s of row.source) if (!sources.has(s)) out.push({ path: at, message: `unknown source "${s}" (not in data/sources.json)` });
      const known = row.source.filter((s) => sources.has(s));
      const design = known.some((s) => sources.get(s)!.design === true);
      const measured = known.some((s) => sources.get(s)!.design !== true);
      const outs = Object.keys(row.set);
      const sims = outs.filter((o) => tag.get(o) === 'sim');
      const typicals = outs.filter((o) => tag.get(o) === 'typical');
      if (sims.length && !design) out.push({ path: at, message: `sets ${sims.join(', ')} (SIM): cite the design study (a source with \`design: true\`)` });
      if (typicals.length && !measured) out.push({ path: at, message: `sets ${typicals.join(', ')} (TYPICAL): cite a source that is not the design study` });
    });
  }
  return out;
}

/** Predict-then-observe on a table: the controls `change` sets must be keys of the experiment the observed output belongs to. */
export function tablePredictIssues(table: TableData, observe: string, change: Readonly<Record<string, SimValue>>): string[] {
  const exp = tableExperimentOf(table, observe);
  if (!exp) return [`"${observe}" is set by no experiment`];
  const keys = table.experiments[exp]!.keys;
  return Object.keys(change).filter((k) => !keys.includes(k)).map((k) => `"${k}" does not change "${observe}" (experiment "${exp}" reads ${keys.join(', ')})`);
}

/** Per output: the decimals of cells that give their own (`{ value, decimals }`), by value; the outputs' text reads them. */
export function tableCellDecimals(table: TableData): Map<string, Record<string, number>> {
  const out = new Map<string, Record<string, number>>();
  for (const exp of Object.values(table.experiments))
    for (const row of exp.rows)
      for (const [o, cell] of Object.entries(row.set)) if (isCell(cell)) out.set(o, { ...(out.get(o) ?? {}), [String(cell.value)]: cell.decimals });
  return out;
}

function legal(c: SimControl, v: unknown): boolean {
  if (c.kind === 'toggle') return typeof v === 'boolean';
  if (c.kind === 'step') return typeof v === 'number' && c.values.includes(v);
  return typeof v === 'string' && c.options.some((o) => o.id === v);
}
