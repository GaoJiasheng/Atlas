import type { Locale } from '../../core/types';
import type { ImpactRecord } from '../impactSchema';

/** Keep qualifiers with the number in both visible and accessible text. */
export function impactEstimateText(record: Pick<ImpactRecord, 'estimate'>, locale: Locale): string {
  const number = new Intl.NumberFormat(locale === 'zh' ? 'zh-CN' : 'en-SG').format(record.estimate.value);
  if (record.estimate.kind === 'more-than') return locale === 'zh' ? `超过${number}` : `More than ${number}`;
  if (record.estimate.kind === 'about') return locale === 'zh' ? `约${number}` : `About ${number}`;
  return number;
}

export function impactDateLabel(kind: ImpactRecord['sourceDateKind'], locale: Locale): string {
  return kind === 'publication'
    ? locale === 'zh' ? '来源发布日期' : 'Source publication date'
    : locale === 'zh' ? '读取日期' : 'Accessed';
}

/** The already validated records; no recalculation, averaging, or inferred remainder. */
export function eventImpacts(events: readonly { id: string; impacts?: ImpactRecord[] }[], eventId: string): ImpactRecord[] {
  return events.find((event) => event.id === eventId)?.impacts ?? [];
}
