import type { Locale } from '../core/types';
import { t, tx, type BilingualText } from '../../i18n';
import { resolveColorRef } from '../../theme/theme';

export interface LegendItem {
  id: string;
  label: BilingualText | string;
  /** CSS colour, `var(--x)`, or a data colour ref (`token:accent-axis`). */
  color: string;
  /** `square`: hollow hairline square; `ring-dashed`: dot in a dashed ring; `site`: small hollow diamond; `triangle`: hollow hairline triangle; `hatch`: 45° hatched box; `dashed`: dashed outline box. */
  kind?: 'fill' | 'line' | 'point' | 'arrow' | 'square' | 'ring-dashed' | 'site' | 'triangle' | 'hatch' | 'dashed';
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
    case 'square':
      return <svg width="24" height="12" aria-hidden="true"><rect x="7.5" y="1.5" width="9" height="9" fill="none" stroke={c} strokeWidth="1" /></svg>;
    case 'triangle':
      return <svg width="24" height="12" aria-hidden="true"><path d="M12 1.4L16.6 10.6H7.4Z" fill="none" stroke={c} strokeWidth="1" /></svg>;
    case 'ring-dashed':
      return (
        <svg width="24" height="12" aria-hidden="true">
          <circle cx="12" cy="6" r="5.2" fill="none" stroke={c} strokeWidth="1" strokeDasharray="2 1.6" />
          <circle cx="12" cy="6" r="2" fill={c} />
        </svg>
      );
    case 'hatch':
      return (
        <svg width="24" height="12" aria-hidden="true">
          <rect x="4.5" y="1.5" width="15" height="9" fill="none" stroke={c} strokeWidth="1" />
          <path d="M6 10.5L11 1.5M10.5 10.5L15.5 1.5M15 10.5L19.5 2.4" stroke={c} strokeWidth="1" />
        </svg>
      );
    case 'dashed':
      return <svg width="24" height="12" aria-hidden="true"><rect x="4.5" y="1.5" width="15" height="9" fill="none" stroke={c} strokeWidth="1.2" strokeDasharray="3 2" /></svg>;
    case 'site':
      return <svg width="24" height="12" aria-hidden="true"><path d="M12 1.5L16.5 6L12 10.5L7.5 6Z" fill="none" stroke={c} strokeWidth="1" /><circle cx="12" cy="6" r="1.2" fill={c} /></svg>;
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
