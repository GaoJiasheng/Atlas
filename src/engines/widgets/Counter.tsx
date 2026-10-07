import type { Locale } from '../core/types';
import { t, tx, type BilingualText } from '../../i18n';
import { resolveColorRef } from '../../theme/theme';
import { Icon, type IconName } from './icons';

export interface CounterProps {
  /** Total quantity, e.g. 70000 soldiers. */
  value: number;
  /** Units per icon, e.g. 10000. */
  per: number;
  locale: Locale;
  label?: BilingualText | string;
  icon?: Extract<IconName, 'person' | 'ship' | 'plane' | 'square'>;
  /** CSS colour or `token:` ref. */
  color?: string;
  /** Cap on drawn icons (keeps huge numbers readable). Default 50. */
  maxIcons?: number;
}

const NUMBER_LOCALE: Record<Locale, string> = { en: 'en-SG', zh: 'zh-CN' };

/**
 * "One icon = N" quantity view (docs/02: casualties and troop numbers are
 * always shown this way, never as images). The last icon is partially filled.
 */
export function Counter({ value, per, locale, label, icon = 'person', color = 'var(--ink)', maxIcons = 50 }: CounterProps) {
  const safePer = per > 0 ? per : 1;
  const exact = Math.max(0, value) / safePer;
  const shown = Math.min(Math.ceil(exact), maxIcons);
  const capped = Math.ceil(exact) > maxIcons;
  const fmt = new Intl.NumberFormat(NUMBER_LOCALE[locale]);
  const text = label ? tx(label, locale) : '';
  const c = resolveColorRef(color);

  return (
    <figure className="atlas-counter">
      <div className="atlas-counter__grid" role="img" aria-label={`${text} ${fmt.format(value)}`.trim()}>
        {Array.from({ length: shown }, (_, i) => {
          const fill = !capped && i === shown - 1 && exact % 1 !== 0 ? exact % 1 : 1;
          return (
            <span key={i} className="atlas-counter__icon" style={{ color: c }}>
              <span className="atlas-counter__ghost">
                <Icon name={icon} size={18} />
              </span>
              <span className="atlas-counter__fill" style={{ width: `${fill * 100}%` }}>
                <Icon name={icon} size={18} />
              </span>
            </span>
          );
        })}
        {capped && <span className="atlas-counter__more">+</span>}
      </div>
      <figcaption className="atlas-counter__caption">
        {text && <strong>{text}: </strong>}
        <span>{fmt.format(value)}</span>
        <span className="atlas-counter__unit">· {t(locale, 'counter.each', { n: fmt.format(safePer) })}</span>
      </figcaption>
    </figure>
  );
}
