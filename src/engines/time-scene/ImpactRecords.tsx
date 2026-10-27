import type { Locale } from '../core/types';
import { tx } from '../../i18n';
import { Counter } from '../widgets/Counter';
import { SourceRefs } from '../widgets/SourcePopover';
import type { ImpactRecord } from './impactSchema';
import { counterPer } from './lib/format';
import { impactDateLabel, impactEstimateText } from './lib/impacts';

/** Source-defined totals stay independent, neutral, static, and beside their definitions. */
export function ImpactRecords({ records, locale }: { records: readonly ImpactRecord[]; locale: Locale }) {
  const fmt = new Intl.NumberFormat(locale === 'zh' ? 'zh-CN' : 'en-SG');
  return <>{records.map((record) => {
    const definition = tx(record.label, locale);
    return (
      <section className="ts-event__block ts-impact" key={record.id} data-impact={record.id}
        aria-label={`${definition}: ${impactEstimateText(record, locale)}`}>
        <Counter value={record.estimate.value} per={counterPer(record.estimate.value)} locale={locale}
          label={definition} valueLabel={impactEstimateText(record, locale)} />
        <p>{tx(record.scope, locale)}</p>
        <p>{impactDateLabel(record.sourceDateKind, locale)}: <time dateTime={record.sourceAsOf}>{record.sourceAsOf}</time>
          <SourceRefs ids={record.sources} locale={locale} /></p>
        {record.components && <>
          <ul>{record.components.map((component) => (
            <li key={component.id}>{tx(component.label, locale)}: {fmt.format(component.value)}
              <SourceRefs ids={component.sources} locale={locale} /></li>
          ))}</ul>
          {record.componentsComplete !== true && <p>{locale === 'zh'
            ? '这里只列部分条目，并非完整分项。' : 'Selected entries shown; not a complete breakdown.'}</p>}
        </>}
      </section>
    );
  })}</>;
}
