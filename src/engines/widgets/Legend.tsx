import type { Locale } from '../core/types';
import { t, tx, type BilingualText } from '../../i18n';
import { resolveColorRef } from '../../theme/theme';

export interface LegendItem {
  id: string;
  label: BilingualText | string;
  /** CSS colour, `var(--x)`, or a data colour ref (`token:accent-axis`). */
  color: string;
  kind?: 'fill' | 'line' | 'point' | 'arrow';
}

export interface LegendProps {
  items: readonly LegendItem[];
  locale: Locale;
  title?: BilingualText | string;
}

function Swatch({ color, kind = 'fill' }: { color: string; kind?: LegendItem['kind'] }) {
  const c = resolveColorRef(color);
  switch (kind) {
    case 'line':
      return <svg width="24" height="12" aria-hidden="true"><line x1="2" y1="6" x2="22" y2="6" stroke={c} strokeWidth="3" strokeLinecap="round" /></svg>;
    case 'arrow':
      return (
        <svg width="24" height="12" aria-hidden="true">
          <path d="M2 6h16M14 2l5 4-5 4" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'point':
      return <svg width="24" height="12" aria-hidden="true"><circle cx="12" cy="6" r="5" fill={c} /></svg>;
    default:
      return <span className="atlas-legend__fill" style={{ background: c }} aria-hidden="true" />;
  }
}

/** Key for what the colours and marks on the stage mean. */
export function Legend({ items, locale, title }: LegendProps) {
  if (items.length === 0) return null;
  return (
    <section className="atlas-legend" aria-label={title ? tx(title, locale) : t(locale, 'legend.heading')}>
      <h3 className="atlas-overlay__heading">{title ? tx(title, locale) : t(locale, 'legend.heading')}</h3>
      <ul>
        {items.map((item) => (
          <li key={item.id} className="atlas-legend__item">
            <Swatch color={item.color} kind={item.kind} />
            <span>{tx(item.label, locale)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
