/** Map counts belong in the left PLATE block (docs/08 §2). */
import { useEffect, useState, useSyncExternalStore } from 'react';
import type { DatedLayerDef } from '../../../content/schema/topic';
import type { Locale } from '../../core/types';
import { t, tx } from '../../../i18n';
import { getPlateExpanded, setPlateExpanded } from '../../../lib/prefs';
import { datedLayerState, type DatedLayerIndex } from '../lib/datedLayers';
import type { Playhead } from '../lib/playhead';

export function DatedLayerPlate({ definitions, indexes, layers, playhead, locale, catalogueLayers, selectedSummary }: {
  selectedSummary?: import('../../../i18n').BilingualText;
  catalogueLayers?: readonly import('../lib/catalogue').CatalogueLayer[];
  definitions: readonly DatedLayerDef[];
  indexes: readonly { id: string; index: DatedLayerIndex }[];
  layers: readonly string[];
  playhead: Playhead;
  locale: Locale;
}) {
  const [open, setOpen] = useState(true);
  useEffect(() => setOpen(getPlateExpanded()), []);
  const counted = definitions.filter((layer) => layer.count);
  // Only re-render on a count boundary, rather than every frame of an eased playhead.
  const snapshot = () => counted.map((layer) => {
    if (!layers.includes(layer.id)) return '0';
    const loaded = indexes.find((entry) => entry.id === layer.id);
    if (catalogueLayers?.some((entry) => entry.id === layer.id && entry.status === 'error')) return 'error';
    return !loaded ? '—' : String(layers.includes(layer.id) ? datedLayerState(loaded.index, playhead.get()).visible : 0);
  }).join('|');
  const values = useSyncExternalStore(playhead.subscribe, snapshot, snapshot).split('|');
  const fold = t(locale, open ? 'time.plate.fold' : 'time.plate.unfold');
  return (
    <section className="ts-plate" data-hud-panel="plate" data-folded={!open || undefined}>
      <button type="button" className="ts-plate__head" aria-expanded={open} aria-label={fold} title={fold} onClick={(event) => {
        setOpen(!open);
        setPlateExpanded(!open);
        if (event.detail > 0) event.currentTarget.blur();
      }}>
        <span>{t('en', 'hud.plate').toLocaleUpperCase('en')} <small lang="zh-Hans">{t('zh', 'hud.plate')}</small></span>
        <span aria-hidden="true">{open ? '⌄' : '⌃'}</span>
      </button>
      {open && <dl className="ts-plate__rows">
        {counted.map((layer, i) => <div key={layer.id} className="ts-plate__row" data-dated-count={layer.id} data-enabled={layers.includes(layer.id)}>
          <dt>{tx(layer.countLabel ?? layer.label, locale)}{layer.temporal?.mode === 'reference' && <><small> REF. · {layer.temporal.release}</small><small>{tx(layer.temporal.note, locale)}</small></>}</dt>
          <dd>{values[i] === 'error' ? (locale === 'en' ? 'Layer could not be loaded' : '图层未能载入') : values[i] === '—' ? '—' : Number(values[i]).toLocaleString(locale === 'zh' ? 'zh-SG' : 'en-SG')}</dd>
        </div>)}
        {selectedSummary && <div className="ts-plate__row"><dt>{locale === 'en' ? 'Selected' : '已选'}</dt><dd>{tx(selectedSummary, locale)}</dd></div>}
      </dl>}
    </section>
  );
}
