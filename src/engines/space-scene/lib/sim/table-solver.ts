import type { TableData } from '../../table-schema';
import type { SimValues } from '../../sim-schema';
import { tableRow, cellValue } from './table';
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
