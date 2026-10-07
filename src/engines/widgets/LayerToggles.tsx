import type { Locale } from '../core/types';
import { useScene, useSceneContext } from '../core/context';
import { t, tx, type BilingualText } from '../../i18n';
import { resolveColorRef } from '../../theme/theme';
import { Icon } from './icons';

export interface LayerItem {
  id: string;
  label: BilingualText | string;
  /** Optional swatch colour (CSS or `token:` ref). */
  color?: string;
}

export interface LayerTogglesProps {
  items: readonly LayerItem[];
  active: readonly string[];
  locale: Locale;
  onToggle(id: string): void;
}

/** Presentational layer switches (checkbox semantics, 44px rows). */
export function LayerToggles({ items, active, locale, onToggle }: LayerTogglesProps) {
  if (items.length === 0) return null;
  return (
    <fieldset className="atlas-layers">
      <legend className="atlas-overlay__heading">
        <Icon name="layers" size={16} /> {t(locale, 'layers.heading')}
      </legend>
      {items.map((item) => {
        const on = active.includes(item.id);
        return (
          <button
            key={item.id}
            type="button"
            role="checkbox"
            aria-checked={on}
            className="atlas-layers__row"
            onClick={() => onToggle(item.id)}
          >
            <span className="atlas-layers__box" data-on={on} aria-hidden="true">
              {on && <Icon name="check" size={14} />}
            </span>
            {item.color && (
              <span className="atlas-legend__fill" style={{ background: resolveColorRef(item.color) }} aria-hidden="true" />
            )}
            <span>{tx(item.label, locale)}</span>
          </button>
        );
      })}
    </fieldset>
  );
}

/** LayerToggles bound to the scene store's `layers`. */
export function SceneLayerToggles({ items }: { items: readonly LayerItem[] }) {
  const { locale, store } = useSceneContext();
  const layers = useScene((s) => s.layers);
  return <LayerToggles items={items} active={layers} locale={locale} onToggle={(id) => store.getState().toggleLayer(id)} />;
}
