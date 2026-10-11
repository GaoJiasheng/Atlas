/**
 * The left column's compact PLATE / 图版 block (slot `plate`, docs/08 §2 HUD
 * 铁律 b): the few readouts of what the stage shows — the model kind, its
 * parts, the parts marked and the value (`MODEL BAR · PARTS 8 · MARKED 3 ·
 * VALUE 3/8`); in the practice, the question and how many are answered. On a
 * check the value is the child's, never the answer first (`cardValue`). The
 * header folds the block (sessionStorage `atlas:plate`, never in the URL);
 * hidden on phones with the rest of the left column's extras.
 */
import { useEffect, useState } from 'react';
import type { Locale } from '../../core/types';
import { t } from '../../../i18n';
import { getPlateExpanded, setPlateExpanded } from '../../../lib/prefs';
import { formatFrac, type Frac } from '../lib/fraction';

export interface PlateRow {
  key: Parameters<typeof t>[1];
  value: string;
  on?: boolean;
}

const UP = (s: string) => s.toLocaleUpperCase('en');

/** Rows for a model: kind, parts, marked, value (`null` = not shown yet). */
export function modelRows(kind: string, parts: number | null, marked: number | null, value: Frac | null): PlateRow[] {
  return [
    { key: 'math.plate.model', value: UP(kind) },
    { key: 'math.plate.parts', value: parts && parts > 0 ? String(parts) : '—' },
    { key: 'math.plate.marked', value: marked !== null && parts ? String(marked) : '—' },
    { key: 'math.plate.value', value: value && value.d > 0 ? formatFrac(value) : '—', on: true },
  ];
}

export function PlateBlock({ rows, locale }: { rows: PlateRow[]; locale: Locale }) {
  const [open, setOpen] = useState(true);
  useEffect(() => setOpen(getPlateExpanded()), []);
  const fold = t(locale, open ? 'math.plate.fold' : 'math.plate.unfold');
  return (
    <section className="ms-plate" data-hud-panel="plate" data-folded={open ? undefined : ''}>
      <button
        type="button"
        className="ms-plate__head"
        aria-expanded={open}
        aria-label={fold}
        title={fold}
        onClick={(e) => {
          setOpen(!open);
          setPlateExpanded(!open);
          if (e.detail > 0) e.currentTarget.blur();
        }}
      >
        <span>
          {UP(t('en', 'math.plate'))}
          <small lang="zh-Hans">{t('zh', 'math.plate')}</small>
        </span>
        <i aria-hidden="true" />
      </button>
      {open && (
        <dl className="ms-plate__rows">
          {rows.map((r) => (
            <div key={r.key} className="ms-plate__row" data-on={r.on || undefined}>
              <dt>{UP(t('en', r.key))}</dt>
              <dd>{r.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}
