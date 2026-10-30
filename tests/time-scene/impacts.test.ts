import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { impactRecordSchema, type ImpactRecord } from '../../src/engines/time-scene/impactSchema';
import { ImpactRecords } from '../../src/engines/time-scene/ImpactRecords';
import { eventImpacts, impactDateLabel, impactEstimateText } from '../../src/engines/time-scene/lib/impacts';
import { eventSchema, timeSceneGeoData, timeSceneIds } from '../../src/engines/time-scene/schema';

const text = { en: 'Dead or missing and presumed dead', zh: '死亡或失踪并推定死亡' };
const total: ImpactRecord = {
  id: 'impact-indian-ocean', measure: 'dead-or-missing-presumed-dead',
  estimate: { kind: 'reported', value: 227899 }, label: text,
  scope: { en: '15 countries', zh: '15个国家' }, sourceAsOf: '2024-10', sourceDateKind: 'publication', sources: ['S17'],
  componentsComplete: false,
  components: [
    { id: 'impact-indonesia', label: { en: 'Indonesia', zh: '印尼' }, value: 167540, sources: ['S17'] },
    { id: 'impact-sri-lanka', label: { en: 'Sri Lanka', zh: '斯里兰卡' }, value: 35322, sources: ['S17'] },
    { id: 'impact-india', label: { en: 'India', zh: '印度' }, value: 16269, sources: ['S17'] },
    { id: 'impact-thailand', label: { en: 'Thailand', zh: '泰国' }, value: 8212, sources: ['S17'] },
  ],
};
const event = { id: 'event-example', t: '2004-12-26', at: [95.982, 3.295], kind: 'disaster', importance: 3, title: text, summary: text, impacts: [total] };
function topic(events: unknown[] = [event]) {
  return { events, entities: [], movements: [], control: { keyframes: [{ t: '2004-12-26', features: { type: 'FeatureCollection', features: [] } }] },
    sources: { sources: [{ id: 'S17', text }] } };
}

describe('source-defined event impacts (E-PH2)', () => {
  it('accepts the incomplete four-country vector without inferring a fifth entry', () => {
    const record = impactRecordSchema.parse(total);
    const sum = record.components!.reduce((n, part) => n + part.value, 0);
    expect(sum).toBe(227343);
    expect(record.estimate.value - sum).toBe(556);
    expect(record.components).toHaveLength(4);
    expect(timeSceneGeoData.safeParse(topic()).success).toBe(true);
    expect(eventImpacts([eventSchema.parse(event)], event.id)).toEqual([total]);
    expect(eventImpacts([eventSchema.parse(event)], 'missing')).toEqual([]);
  });
  it('requires complete components to equal a reported total', () => {
    expect(impactRecordSchema.safeParse({ ...total, componentsComplete: true }).success).toBe(false);
    const complete = { ...total, estimate: { kind: 'reported', value: 227343 }, componentsComplete: true };
    expect(impactRecordSchema.safeParse(complete).success).toBe(true);
    for (const kind of ['about', 'more-than'])
      expect(impactRecordSchema.safeParse({ ...complete, estimate: { kind, value: 227343 } }).success).toBe(false);
    expect(impactRecordSchema.safeParse({ ...total, components: undefined }).success).toBe(false);
  });
  it('rejects components over the total (Thailand 9000 gives 228131)', () => {
    const components = total.components!.map((part) => part.id === 'impact-thailand' ? { ...part, value: 9000 } : part);
    expect(components.reduce((sum, part) => sum + part.value, 0)).toBe(228131);
    expect(impactRecordSchema.safeParse({ ...total, components }).success).toBe(false);
  });
  it.each([null, -1, 1.5, Infinity, NaN])('rejects invalid numeric values %s without coercion', (value) => {
    expect(impactRecordSchema.safeParse({ ...total, estimate: { kind: 'reported', value } }).success).toBe(false);
  });
  it('requires real CE source dates, preserving their exact precision', () => {
    for (const sourceAsOf of ['2024', '2024-10', '2024-02-29'])
      expect(impactRecordSchema.parse({ ...total, sourceAsOf }).sourceAsOf).toBe(sourceAsOf);
    for (const sourceAsOf of ['2024-02-30', '2023-02-29', '2024-13', '-0221', 'October 2024'])
      expect(impactRecordSchema.safeParse({ ...total, sourceAsOf }).success).toBe(false);
  });
  it('requires bilingual definitions, scopes, component labels and sources', () => {
    for (const patch of [{ label: { en: 'Deaths', zh: '' } }, { label: { en: 'Deaths', zh: '  ' } }, { scope: { en: '  ', zh: '全球' } }, { scope: { en: 'Global', zh: '' } }, { sources: [] }, { components: [{ ...total.components![0], label: { en: 'Indonesia', zh: '' } }] }])
      expect(impactRecordSchema.safeParse({ ...total, ...patch }).success).toBe(false);
    expect(timeSceneGeoData.safeParse(topic([{ ...event, impacts: [{ ...total, sources: ['S99'] }] }])).success).toBe(false);
    expect(timeSceneGeoData.safeParse(topic([{ ...event, impacts: [{ ...total, components: [{ ...total.components![0], sources: ['S99'] }] }] }])).success).toBe(false);
  });
  it('rejects duplicates across impact records, components and topic object ids', () => {
    expect(timeSceneGeoData.safeParse(topic([{ ...event, impacts: [total, total] }])).success).toBe(false);
    expect(timeSceneGeoData.safeParse(topic([{ ...event, impacts: [{ ...total, id: event.id }] }])).success).toBe(false);
    expect(impactRecordSchema.safeParse({ ...total, components: [total.components![0], total.components![0]] }).success).toBe(false);
    const parsed = timeSceneGeoData.parse(topic());
    expect(timeSceneIds(parsed).filter((entry) => entry.kind.startsWith('impact'))).toHaveLength(5);
  });
  it('rejects impacts with legacy casualties while leaving legacy events valid', () => {
    expect(eventSchema.safeParse({ ...event, casualties: {} }).success).toBe(false);
    expect(eventSchema.safeParse({ ...event, impacts: undefined, casualties: {} }).success).toBe(true);
  });
  it('keeps distinct Tambora estimates and estimate qualifiers in both languages', () => {
    const records: ImpactRecord[] = [
      { ...total, id: 'impact-tambora-hvo', measure: 'deaths', estimate: { kind: 'more-than', value: 70000 }, components: undefined, componentsComplete: undefined, sourceDateKind: 'publication', sourceAsOf: '2011-09-29' },
      { ...total, id: 'impact-tambora-table', measure: 'deaths', estimate: { kind: 'reported', value: 92000 }, components: undefined, componentsComplete: undefined, sourceDateKind: 'accessed', sourceAsOf: '2026-10-27' },
      { ...total, id: 'impact-krakatau-estimate', measure: 'deaths', estimate: { kind: 'about', value: 36000 }, components: undefined, componentsComplete: undefined },
    ];
    expect(records.map((record) => impactEstimateText(record, 'en'))).toEqual(['More than 70,000', '92,000', 'About 36,000']);
    expect(records.map((record) => impactEstimateText(record, 'zh'))).toEqual(['超过70,000', '92,000', '约36,000']);
    for (const locale of ['en', 'zh'] as const) {
      const html = renderToStaticMarkup(createElement(ImpactRecords, { records, locale }));
      expect(html).toContain(impactEstimateText(records[0]!, locale));
      expect(html).toContain(impactEstimateText(records[2]!, locale));
      expect(html).not.toContain('atlas-counter-vs');
      expect(records.map((record) => impactRecordSchema.parse(record).estimate.value)).toEqual([70000, 92000, 36000]);
    }
  });
  it('labels publication and accessed dates separately and keeps the total with its definition', () => {
    expect(impactDateLabel('publication', 'en')).toBe('Source publication date');
    expect(impactDateLabel('accessed', 'en')).toBe('Accessed');
    expect(impactDateLabel('publication', 'zh')).toBe('来源发布日期');
    expect(impactDateLabel('accessed', 'zh')).toBe('读取日期');
    const html = renderToStaticMarkup(createElement(ImpactRecords, { records: [total], locale: 'en' }));
    for (const required of ['227,899', text.en, '15 countries', '2024-10', 'data-source="S17"', 'not a complete breakdown']) expect(html).toContain(required);
    expect(html).not.toContain('556');
    expect(html).not.toContain('227,343');
  });
});
