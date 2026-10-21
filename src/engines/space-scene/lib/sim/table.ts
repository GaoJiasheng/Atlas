/**
 * The `table` model (docs/40 §4.2, E-HL1; pure, synchronous, well under
 * 0.05 ms): sourced values looked up by the controls. Each experiment reads
 * its `keys`, finds the one row for their values and sets its outputs from
 * that row's cells; every experiment is evaluated at once (a chapter without
 * a card still beats its heart at the default activity). An output no
 * experiment sets is NaN (shown `—`). Quantities: each output's own id.
 */
import type { SimControl, SimValue, SimValues } from '../../sim-schema';
import type { TableCell, TableData, TableExperiment, TableRow } from '../../table-schema';

/** A cell that carries its own decimals (`{ value: 0.04, decimals: 2 }`). */
export function isCell(c: TableCell): c is { value: number; decimals: number } {
  return typeof c === 'object' && c !== null;
}

/** A number cell's value (the `value` of a `{ value, decimals }` cell). */
export function cellValue(c: TableCell): number {
  return typeof c === 'number' ? c : isCell(c) ? c.value : NaN;
}

/** The experiment that sets this output, or null. */
export function tableExperimentOf(table: TableData, output: string): string | null {
  for (const [id, exp] of Object.entries(table.experiments)) if (exp.rows.some((r) => output in r.set)) return id;
  return null;
}

/** The row of an experiment for these control values (null: none matches). */
export function tableRow(exp: TableExperiment, values: SimValues): TableRow | null {
  return exp.rows.find((r) => exp.keys.every((k) => r.when[k] === values[k])) ?? null;
}

/** Every combination of these controls' values (toggles off / on, steps and choices in their order). */
export function tableCombinations(controls: readonly SimControl[]): SimValues[] {
  let out: SimValues[] = [{}];
  for (const c of controls) {
    const vals: SimValue[] = c.kind === 'toggle' ? [false, true] : c.kind === 'step' ? c.values : c.options.map((o) => o.id);
    out = out.flatMap((v) => vals.map((x) => ({ ...v, [c.id]: x })));
  }
  return out;
}

/** Every output's value for these control values: a number, a state id, NaN where no row (or no experiment) gives one. */
export function solveTable(table: TableData, values: SimValues, outputs: readonly { id: string }[]): Record<string, number | string> {
  const out: Record<string, number | string> = {};
  for (const o of outputs) out[o.id] = NaN;
  for (const exp of Object.values(table.experiments)) {
    const row = tableRow(exp, values);
    if (!row) continue;
    for (const [id, cell] of Object.entries(row.set)) out[id] = typeof cell === 'string' ? cell : cellValue(cell);
  }
  return out;
}

/** The sources of the row each output's value comes from now (outputs no row sets are left out). */
export function tableSources(table: TableData, values: SimValues): Record<string, readonly string[]> {
  const out: Record<string, readonly string[]> = {};
  for (const exp of Object.values(table.experiments)) {
    const row = tableRow(exp, values);
    if (row) for (const id of Object.keys(row.set)) out[id] = row.source;
  }
  return out;
}

/** The kind of a table quantity (an output's id): a state where its cells are state ids, else a number. */
export function tableQuantity(table: TableData, id: string): 'number' | 'state' {
  for (const exp of Object.values(table.experiments))
    for (const r of exp.rows) {
      const c = r.set[id];
      if (c !== undefined) return typeof c === 'string' ? 'state' : 'number';
    }
  return 'number';
}

/** What an output's numbers are (docs/40 §4.2): `typical` (a sourced measurement) or `sim` (the default: "in this model"). */
export function outputTag(o: { tag?: 'sim' | 'typical' | undefined }): 'sim' | 'typical' {
  return o.tag ?? 'sim';
}

/** The PLATE status line's tag: TYPICAL when the card observes only typical outputs, else SIM. */
export function statusTag(observe: readonly string[], outputs: readonly { id: string; tag?: 'sim' | 'typical' | undefined }[]): 'SIM' | 'TYPICAL' {
  return observe.length > 0 && observe.every((id) => outputs.find((o) => o.id === id)?.tag === 'typical') ? 'TYPICAL' : 'SIM';
}

/** The states a table output can take (its string cells), or undefined for a number. */
export function tableStates(table: TableData, id: string): string[] | undefined {
  const out = new Set<string>();
  for (const exp of Object.values(table.experiments)) for (const r of exp.rows) if (typeof r.set[id] === 'string') out.add(r.set[id] as string);
  return out.size ? [...out] : undefined;
}
