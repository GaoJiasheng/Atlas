import { Fragment } from 'react';
import { tx } from '../../i18n';
import type { Locale } from '../core/types';
import type { DatedLayerDef } from '../../content/schema/topic';
import type { CatalogueEntry } from './catalogueSchema';
import { SourceRefs } from '../widgets/SourcePopover';
export function CatalogueInspector({ entry, layer, locale, onClose }: { entry: CatalogueEntry; layer: DatedLayerDef; locale: Locale; onClose(): void }) {
  return <article className="ts-event" data-catalogue-inspector={entry.id}>
    <header className="ts-event__header"><span>{layer.temporal?.mode === 'reference' ? 'REF.' : tx(layer.label, locale)}</span><button type="button" className="atlas-control" onClick={onClose} aria-label={locale === 'en' ? 'Close details' : '关闭详情'}>×</button></header>
    <h3 className="ts-event__title">{tx(entry.title, locale)}</h3>
    <p>{tx(entry.summary, locale)}</p>
    {layer.temporal?.mode === 'reference' && <p>{tx(layer.temporal.note, locale)} · {layer.temporal.release}</p>}
    <dl className="ts-event__facts"><dt>{locale === 'en' ? 'Record ID' : '记录编号'}</dt><dd><code>{entry.id}</code></dd>{entry.rows.map((row) => <Fragment key={row.key}><dt>{tx(row.label, locale)}</dt><dd>{row.value === null ? (locale === 'en' ? 'Not recorded' : '未记录') : typeof row.value === 'number' ? row.value.toLocaleString(locale === 'en' ? 'en-SG' : 'zh-SG') : tx(row.value, locale)}{row.unit && <> {tx(row.unit, locale)}</>}{row.sources?.length ? <SourceRefs ids={row.sources} locale={locale} /> : null}</dd></Fragment>)}</dl>
    <SourceRefs ids={entry.sources} locale={locale} />
  </article>;
}
