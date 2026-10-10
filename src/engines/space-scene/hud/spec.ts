/**
 * The engine's title-block spec rows: PARTS / GROUPS / FLOWS, or, when the
 * topic writes its own `spec` rows, PARTS followed by those (the host's rows
 * come first; the title block shows 8 at most). A `sim` row carries the SIM
 * chip; `typical` / `design` rows carry none (docs/12 §1.2).
 */
import type { SpecRow } from '../../core/controls';
import { t, type BilingualText, type UiKey } from '../../../i18n';
import { numberedParts } from '../lib/schematic';
import type { PartsFile } from '../schema';

const both = (key: UiKey): BilingualText => ({ en: t('en', key), zh: t('zh', key) });
const two = (n: number) => String(n).padStart(2, '0');

export function spaceSpecRows(file: PartsFile): SpecRow[] {
  const parts: SpecRow = { id: 'parts', label: both('space.spec.parts'), value: two(numberedParts(file.parts).length), mono: true };
  if (!file.spec?.length) {
    return [
      parts,
      { id: 'groups', label: both('space.spec.groups'), value: two(file.groups.length), mono: true },
      { id: 'flows', label: both('space.spec.flows'), value: two(file.flows.length), mono: true },
    ];
  }
  return [
    parts,
    ...file.spec.map(
      (row, i): SpecRow => ({
        id: `spec-${i + 1}`,
        label: row.key,
        value: row.value,
        mono: typeof row.value === 'string',
        ...(row.tag === 'sim' ? { source: 'simulated' as const } : {}),
      }),
    ),
  ];
}
