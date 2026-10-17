/**
 * The rows of a top-right card (PRODUCT, PLACE VALUE, TIME, AREA): an EN
 * small-caps label with its Chinese, and the value (a big one first).
 */
import type { ReactNode } from 'react';
import { t } from '../../../../i18n';

export interface CardRow {
  key: Parameters<typeof t>[1];
  value: string;
  /** The headline value (the fact, the number, the time). */
  big?: boolean;
  tone?: 'cold' | 'hot' | 'signal';
}

const UP = (s: string) => s.toLocaleUpperCase('en');

export function CardRows({ rows, render, after }: { rows: CardRow[]; render?(value: string): ReactNode; after?: ReactNode }) {
  return (
    <div className="ms-card-body ms-card-body--grid">
      <dl className="ms-areacard">
        {rows.map((r, i) => (
          <div key={`${r.key}${i}`} className="ms-areacard__row" data-tone={r.tone} data-big={r.big || undefined}>
            <dt>
              <b>{UP(t('en', r.key))}</b> {t('zh', r.key)}
            </dt>
            <dd>{render ? render(r.value) : r.value}</dd>
          </div>
        ))}
      </dl>
      {after}
    </div>
  );
}
