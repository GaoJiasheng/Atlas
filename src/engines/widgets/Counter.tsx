import type { Locale } from '../core/types';
import { t, tx, type BilingualText } from '../../i18n';
import { resolveColorRef } from '../../theme/theme';
import { Icon, type IconName } from './icons';

/** The large-number unit: "1 icon = 100,000 people / 一个图标 = 10 万人". */
export const COUNTER_UNIT_100K = 100_000;

type CounterIcon = Extract<IconName, 'person' | 'ship' | 'plane' | 'square'>;

export interface CounterProps {
  /** Total quantity, e.g. 70000 soldiers. */
  value: number;
  /** Units per icon, e.g. 10000 (100000 gets its own wording, see COUNTER_UNIT_100K). */
  per: number;
  locale: Locale;
  label?: BilingualText | string;
  icon?: CounterIcon;
  /** CSS colour or `token:` ref. */
  color?: string;
  /** Cap on drawn icons (keeps huge numbers readable). Default 50. */
  maxIcons?: number;
}

const NUMBER_LOCALE: Record<Locale, string> = { en: 'en-SG', zh: 'zh-CN' };

/** "Each icon = N", or the fixed 100,000-people wording. */
function unitText(per: number, icon: CounterIcon, locale: Locale, fmt: Intl.NumberFormat): string {
  if (per === COUNTER_UNIT_100K && icon === 'person') return t(locale, 'counter.each100k');
  return t(locale, 'counter.each', { n: fmt.format(per) });
}

/** The icon row: ghost icons with a colour fill; the last one partially filled. */
function IconGrid({
  value,
  per,
  icon,
  color,
  maxIcons,
  label,
  className = '',
}: {
  value: number;
  per: number;
  icon: CounterIcon;
  color: string;
  maxIcons: number;
  label: string;
  className?: string;
}) {
  const exact = Math.max(0, value) / per;
  const shown = Math.min(Math.ceil(exact), maxIcons);
  const capped = Math.ceil(exact) > maxIcons;
  return (
    <div className={`atlas-counter__grid ${className}`.trim()} role="img" aria-label={label}>
      {Array.from({ length: shown }, (_, i) => {
        const fill = !capped && i === shown - 1 && exact % 1 !== 0 ? exact % 1 : 1;
        return (
          <span key={i} className="atlas-counter__icon">
            <span className="atlas-counter__ghost">
              <Icon name={icon} size={18} />
            </span>
            <span className="atlas-counter__fill" style={{ width: `${fill * 100}%`, color }}>
              <Icon name={icon} size={18} />
            </span>
          </span>
        );
      })}
      {capped && <span className="atlas-counter__more">+</span>}
    </div>
  );
}

/**
 * "One icon = N" quantity view (docs/02: casualties and troop numbers are
 * always shown this way, never as images). Icons are drawn in ink with the
 * functional colour as fill; the last icon is partially filled.
 */
export function Counter({ value, per, locale, label, icon = 'person', color = 'var(--ink)', maxIcons = 50 }: CounterProps) {
  const safePer = per > 0 ? per : 1;
  const fmt = new Intl.NumberFormat(NUMBER_LOCALE[locale]);
  const text = label ? tx(label, locale) : '';

  return (
    <figure className="atlas-counter">
      <IconGrid
        value={value}
        per={safePer}
        icon={icon}
        color={resolveColorRef(color)}
        maxIcons={maxIcons}
        label={`${text} ${fmt.format(value)}`.trim()}
      />
      <figcaption className="atlas-counter__caption">
        {text && <strong>{text}: </strong>}
        <span>{fmt.format(value)}</span>
        <span className="atlas-counter__unit">· {unitText(safePer, icon, locale, fmt)}</span>
      </figcaption>
    </figure>
  );
}

export interface CounterSide {
  value: number;
  label: BilingualText | string;
  /** CSS colour or `token:` ref. */
  color?: string;
}

export interface CounterVersusProps {
  /** Attacker: drawn on the left, icons growing out from the centre rule. */
  left: CounterSide;
  /** Defender: drawn on the right. */
  right: CounterSide;
  /** Units per icon, shared by both sides. */
  per: number;
  locale: Locale;
  icon?: CounterIcon;
  /** Cap per side. Default 30. */
  maxIcons?: number;
}

/** Two quantities side by side on one scale (attacker left, defender right). */
export function CounterVersus({ left, right, per, locale, icon = 'person', maxIcons = 30 }: CounterVersusProps) {
  const safePer = per > 0 ? per : 1;
  const fmt = new Intl.NumberFormat(NUMBER_LOCALE[locale]);
  const side = (s: CounterSide, which: 'left' | 'right') => {
    const text = tx(s.label, locale);
    return (
      <div className={`atlas-counter-vs__side atlas-counter-vs__side--${which}`}>
        <p className="atlas-counter-vs__head">
          <strong>{text}</strong>
          <span>{fmt.format(s.value)}</span>
        </p>
        <IconGrid
          value={s.value}
          per={safePer}
          icon={icon}
          color={resolveColorRef(s.color ?? 'var(--ink)')}
          maxIcons={maxIcons}
          label={`${text} ${fmt.format(s.value)}`}
        />
      </div>
    );
  };
  return (
    <figure className="atlas-counter atlas-counter-vs">
      <div className="atlas-counter-vs__sides">
        {side(left, 'left')}
        {side(right, 'right')}
      </div>
      <figcaption className="atlas-counter__caption atlas-counter-vs__caption">
        <span className="atlas-counter__unit">{unitText(safePer, icon, locale, fmt)}</span>
      </figcaption>
    </figure>
  );
}
