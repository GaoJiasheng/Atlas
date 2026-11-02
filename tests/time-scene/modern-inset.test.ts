import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { ModernInset, type ModernInsetProps } from '../../src/engines/time-scene/ModernInset';
import { filterModernPoints, modernInsetLabels, type DeepTimeBundle, type ModernInsetConfig } from '../../src/engines/time-scene/lib/deepTime';

const json = (stem: string) => JSON.parse(readFileSync(`public/geo/${stem}.json`, 'utf8'));
const config = parse(readFileSync('src/content/topics/dinosaur-earth/topic.yaml', 'utf8')).modernInset as ModernInsetConfig;
const bundle: DeepTimeBundle = {
  reconstruction: json('de-reconstruction'), inset: json(config.file),
  points: [...json('de-modern-points').points, ...json('de-reference-points').points],
  cards: json('de-reference-cards').cards,
};
const fossil = bundle.points.find((p) => p.kind === 'fossil-collection')!;
const impact = bundle.points.find((p) => p.kind === 'reference' && p.role === 'impact-site')!;
const singapore = bundle.points.find((p) => p.kind === 'reference' && p.role === 'singapore')!;
const props: ModernInsetProps = {
  bundle, config, locale: 'en', selectedMa: 70, view: 'world', insetVisible: true,
  fossilMode: 'all-mesozoic', fossilsEnabled: true, highlight: [fossil.id], selectedObjectId: null,
  onSelect() {}, onPatch() {}, hosted: true,
};
const render = (overrides: Partial<ModernInsetProps> = {}) => renderToStaticMarkup(createElement(ModernInset, { ...props, ...overrides }));

describe('modern inset callouts', () => {
  it('keeps world references quiet while retaining every highlighted or selected label', () => {
    expect(modernInsetLabels(bundle.points, 'world', [fossil.id], null).map((p) => p.id)).toEqual([fossil.id]);
    const ids = modernInsetLabels(bundle.points, 'world', [fossil.id, impact.id], singapore.id).map((p) => p.id);
    expect(ids).toContain(fossil.id);
    expect(ids).toContain(impact.id);
    expect(ids).toContain(singapore.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it('names each reference in its own regional view', () => {
    expect(modernInsetLabels(bundle.points, 'mexico', [], null).map((p) => p.id)).toEqual([impact.id]);
    expect(modernInsetLabels(bundle.points, 'southeast-asia', [], null).map((p) => p.id)).toEqual([singapore.id]);
  });
  it.each(['en', 'zh'] as const)('renders wrapping HTML label rows instead of shrinking map text (%s)', (locale) => {
    const html = render({ locale, highlight: [fossil.id, impact.id, singapore.id] });
    const afterMap = html.slice(html.indexOf('</svg>') + 6);
    for (const point of [fossil, impact, singapore]) {
      expect(afterMap).toContain(`class="ts-modern-label" data-id="${point.id}"`);
      expect(afterMap).toContain(point.title[locale]);
    }
    expect(html).toContain('class="ts-modern__badge"');
    expect(html).not.toContain('class="ts-modern__label"');
  });
  it('shows one title in hosted, reader and presentation maps, retaining hide and view buttons', () => {
    const hosted = render();
    expect(hosted).not.toContain('<strong>');
    expect(hosted).toContain('aria-label="Hide modern map"');
    expect(hosted).toContain('aria-label="Modern map view"');
    expect(hosted).toContain('aria-pressed="true">World');
    const reader = render({ hosted: false, embedded: true });
    expect(reader).toContain(`<strong>${config.label.en}</strong>`);
    expect(reader.match(/<strong>/g)).toHaveLength(1);
    expect(render({ insetVisible: false })).toBe('');
  });
  it('does not reintroduce filtered-out fossils as labels', () => {
    const filtered = filterModernPoints(bundle.points, { selectedMa: 0, fossilsEnabled: false });
    expect(modernInsetLabels(filtered.visiblePoints, 'world', [fossil.id], fossil.id)).toEqual([]);
  });
});
