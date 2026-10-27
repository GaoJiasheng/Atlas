import { readFileSync, readdirSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { createStore } from 'zustand/vanilla';
import { SceneContext, type SceneContextValue } from '../../src/engines/core/context';
import { buildTimeModel } from '../../src/engines/time-scene/lib/model';
import { timeHudAvailability, timeLayerRows } from '../../src/engines/time-scene/lib/hud';
import { StateCluster } from '../../src/engines/time-scene/timeline/Timeline';
import { timeSceneGeoData } from '../../src/engines/time-scene/schema';
import { createSceneStore } from '../../src/engines/core/store';
import { createHudActions, createHudStore, type HudState } from '../../src/engines/core/controls';
import { ControlPanel } from '../../src/engines/widgets/ControlPanel';

const root = new URL('../../src/content/topics/', import.meta.url);
const topics = readdirSync(root).filter((slug) => {
  const topic = parse(readFileSync(new URL(`${slug}/topic.yaml`, root), 'utf8'));
  // Monthly and geography topics have their own views and fixed non-war controls (climatology-state.test.ts, geography tests).
  return topic.engine === 'time-scene' && topic.temporalMode !== 'climatology' && topic.temporalMode !== 'geography';
});
const models = new Map(topics.map((slug) => {
  const data = Object.fromEntries(['control', 'entities', 'events', 'movements', 'sources'].map((name) => [name, JSON.parse(readFileSync(new URL(`${slug}/data/${name}.json`, root), 'utf8'))]));
  return [slug, buildTimeModel(timeSceneGeoData.parse(data), [])];
}));
const render = (slug: string, locale: 'en' | 'zh', t?: number) => {
  const model = models.get(slug)!;
  return renderToStaticMarkup(createElement(SceneContext.Provider, { value: { locale } as SceneContextValue },
    createElement(StateCluster, { model, t: t ?? model.min, highlight: [], locale })));
};
const renderLayers = (slug: string, locale: 'en' | 'zh') => {
  const available = timeHudAvailability(models.get(slug)!);
  const store = createSceneStore({ chapters: [], defaults: { chapter: null, camera: null, layers: ['base'] } });
  const hud = createStore<HudState>(() => ({ ...createHudStore().getState(), controls: { modes: { items: ['flow', 'territory', 'borders', 'graticule'].map((id) => ({ id, label: id, on: false })), set() {} } } }));
  const actions = createHudActions(hud, { suppress: (fn) => fn() });
  const context = { locale, store, hud, actions } as unknown as SceneContextValue;
  return renderToStaticMarkup(createElement(SceneContext.Provider, { value: context },
    createElement(ControlPanel, { layers: timeLayerRows(available, locale), tools: [] })));
};

describe('TimeScene topic-wide HUD availability', () => {
  it.each([
    ['ww1', true, true, true, true],
    ['ww2', true, true, true, true],
    ['four-taps', false, true, true, true],
    ['singapore-1819-1965', true, true, true, true],
    ['singapore-after-1965', false, false, false, false],
    ['singapore-land-use', false, true, true, true],
    ['ancient-civilisations', false, true, true, true],
    ['warring-states', true, true, true, true],
    ['industrial-revolution', false, false, false, false],
    ['zheng-he', true, false, false, true],
  ] as const)('%s keeps its populated layers and only applicable battle/movement counts', (slug, battles, movements, control, participation) => {
    expect(timeHudAvailability(models.get(slug)!)).toEqual({ battles, movements, control, participants: participation, participation: participation && control, events: true, sites: true });
    for (const locale of ['en', 'zh'] as const) {
      const html = render(slug, locale);
      expect(html.includes('data-stat="battles"')).toBe(battles);
      expect(html.includes('data-stat="movements"')).toBe(movements);
      expect(html.includes('data-stat="participants"')).toBe(participation);
      expect(html.includes('data-stat="keyframe"')).toBe(control);
      const layers = renderLayers(slug, locale);
      expect(layers.includes('data-layer="control"')).toBe(control);
      expect(layers.includes('data-layer="participation"')).toBe(participation && control);
      expect(layers.includes('data-mode="flow"')).toBe(movements);
      expect(layers).toContain('data-layer="battles"');
      expect(layers).toContain('data-layer="sites"');
    }
  });

  it('checks every chronological TimeScene topic, including sample topics', () => {
    expect(models.size).toBe(topics.length);
    for (const [slug, model] of models) {
      const available = timeHudAvailability(model);
      const html = render(slug, 'en');
      expect(html.includes('data-stat="battles"'), slug).toBe(available.battles);
      expect(html.includes('data-stat="movements"'), slug).toBe(available.movements);
      expect(available.events, slug).toBe(model.events.length > 0);
      expect(available.sites, slug).toBe(model.sites.length > 0);
      const layers = renderLayers(slug, 'en');
      expect(layers.includes('data-layer="control"'), slug).toBe(available.control);
      expect(layers.includes('data-layer="participation"'), slug).toBe(available.participation);
      expect(layers.includes('data-mode="flow"'), slug).toBe(available.movements);
      expect(layers.includes('data-layer="battles"'), slug).toBe(available.events);
      expect(layers.includes('data-layer="sites"'), slug).toBe(available.sites);
    }
  });

  it('keeps zero current counts for a topic with battles and movements at other dates', () => {
    const html = render('ww2', 'en', models.get('ww2')!.min - 100);
    expect(html).toContain('0 BATTLES');
    expect(html).toContain('0 MOVEMENTS');
  });

  it('retains authored dated layers and non-war map labels on an otherwise empty control model', () => {
    const available = timeHudAvailability(models.get('industrial-revolution')!);
    const ids = timeLayerRows(available, 'en', { territory: true, borders: false, dated: [
      { kind: 'layer', id: 'coal', label: 'Coal' }, { kind: 'layer', id: 'rail', label: 'Railways' },
    ] }).map((row) => 'id' in row ? row.id : row.kind);
    expect(ids).toEqual(['territory', 'graticule', 'battles', 'sites', 'coal', 'rail', 'labels']);
  });
});
