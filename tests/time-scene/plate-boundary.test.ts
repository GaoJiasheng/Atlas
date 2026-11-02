import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { DatedLayerDef } from '../../src/content/schema/topic';
import type { CatalogueEntry } from '../../src/engines/time-scene/catalogueSchema';
import { CatalogueIndex } from '../../src/engines/time-scene/CatalogueIndex';
import { CatalogueInspector } from '../../src/engines/time-scene/CatalogueInspector';
import { cataloguePage, type CatalogueLayer } from '../../src/engines/time-scene/lib/catalogue';
import { createCatalogueLoader } from '../../src/engines/time-scene/lib/catalogueLoader';
import { decodePlateBoundary, readablePlateBoundary } from '../../src/engines/time-scene/lib/plateBoundary';

const entries = ['divergent', 'transform', 'subduction', 'convergent'].flatMap((suffix) =>
  (JSON.parse(readFileSync(new URL(`../../public/geo/ph-catalogue-plate-${suffix}.json`, import.meta.url), 'utf8')) as { entries: CatalogueEntry[] }).entries);
const example = entries.find((entry) => entry.id === 'ph-step-1327-1')!;
const expected = {
  en: 'Antarctic Plate – South American Plate · subduction zone',
  zh: '南极洲板块 – 南美洲板块 · 俯冲带',
};
const def: DatedLayerDef = {
  id: 'ph-plate-subduction', file: 'ph-plate-subduction', kind: 'line',
  label: { en: 'Subduction', zh: '俯冲' }, catalogue: { file: 'ph-catalogue-plate-subduction' },
  temporal: { mode: 'reference', note: { en: 'Present-day boundaries', zh: '现今板块边界' }, release: 'PB2002' },
};

describe('Bird (2003) boundary names', () => {
  it('decodes every shipped code in both languages without expanding the stored catalogues', () => {
    expect(entries).toHaveLength(5824);
    const plates = new Set<string>(), types = new Set<string>();
    for (const entry of entries) {
      expect(entry.title.en).toBe(entry.title.zh);
      const title = decodePlateBoundary(entry.title.en);
      expect(title, entry.title.en).not.toBeNull();
      expect(title!.en).toMatch(/Plate – .+ Plate · [a-z]/);
      expect(title!.zh).toMatch(/板块 – .+板块 · [\u3400-\u9fff]/);
      expect(title!.en).not.toContain(entry.title.en);
      const parts = entry.title.en.split(/[-/\\]/);
      plates.add(parts[0]!); plates.add(parts[1]!); types.add(parts[2]!);
    }
    expect(plates.size).toBe(52);
    expect([...types].sort()).toEqual(['CCB', 'CRB', 'CTF', 'OCB', 'OSR', 'OTF', 'SUB']);
    expect(decodePlateBoundary(example.title.en)).toEqual(expected);
  });

  it('accepts all source orientation separators, keeps plate order and rejects unknown codes', () => {
    for (const separator of ['-', '/', '\\']) expect(decodePlateBoundary(`AN${separator}SA/SUB`)).toEqual(expected);
    expect(decodePlateBoundary('SA/AN/SUB')?.en).toBe('South American Plate – Antarctic Plate · subduction zone');
    for (const code of ['XX-SA/SUB', 'AN-XX/SUB', 'AN-SA/XYZ', 'AN-SA', 'AN--SA/SUB', 'AN-SA/SUB/extra']) expect(decodePlateBoundary(code)).toBeNull();
  });

  it('loads readable titles for search and both reader views, retaining the code only in details', async () => {
    let layers: CatalogueLayer[] = [];
    const loader = createCatalogueLoader([def], async () => [example], (value) => { layers = value; });
    loader.request(def.id);
    await Promise.resolve();
    const entry = layers[0]!.entries[0]!;
    expect(entry.title).toEqual(expected);
    expect(cataloguePage([entry], 'Antarctic', 0).rows).toEqual([entry]);
    expect(cataloguePage([entry], '俯冲带', 0).rows).toEqual([entry]);
    expect(entry.sources).toEqual(example.sources);
    expect(entry.rows.slice(0, -1)).toEqual(example.rows);
    expect(example.rows).toHaveLength(1); // cached source data stays compact and unmodified.
    for (const locale of ['en', 'zh'] as const) {
      const index = renderToStaticMarkup(createElement(CatalogueIndex, { entries: [entry], locale, pick: null, onSelect: () => true, onRows: () => {} }));
      const detail = renderToStaticMarkup(createElement(CatalogueInspector, { entry, layer: def, locale, onClose: () => {} }));
      expect(index).toContain(expected[locale]);
      expect(index).not.toContain(example.title[locale]);
      expect(detail).toContain(`<h3 class="ts-event__title">${expected[locale]}</h3>`);
      expect(detail).toContain(example.title[locale]);
      expect(detail).toContain(locale === 'en' ? 'Source code' : '来源代码');
    }
    loader.dispose();
  });

  it('leaves other catalogues unchanged and gives unrecognised future boundaries a readable heading', async () => {
    let layers: CatalogueLayer[] = [];
    const other = { ...def, id: 'other-layer', catalogue: { file: 'other-catalogue' } };
    const loader = createCatalogueLoader([other], async () => [example], (value) => { layers = value; });
    loader.request(other.id);
    await Promise.resolve();
    expect(layers[0]!.entries).toEqual([example]);
    const unknown = readablePlateBoundary({ ...example, title: { en: 'AN-XX/SUB', zh: 'AN-XX/SUB' } });
    expect(unknown.title).toEqual({ en: 'Plate boundary', zh: '板块边界' });
    expect(unknown.rows.at(-1)?.value).toEqual({ en: 'AN-XX/SUB', zh: 'AN-XX/SUB' });
    loader.dispose();
  });
});
