import { readFileSync, readdirSync } from 'node:fs';
import { createElement, type ComponentProps, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { parse } from 'yaml';
import { topicSchema } from '../../src/content/schema/topic';
import { SceneContext, type SceneContextValue } from '../../src/engines/core/context';
import { createHudActions, createHudStore } from '../../src/engines/core/controls';
import { solveHudRoom, type HudMeasurements } from '../../src/engines/core/hud-room';
import { createSceneStore } from '../../src/engines/core/store';
import type { Chapter, EngineViewProps, Locale } from '../../src/engines/core/types';
import { timeSceneEngine, type TimeSceneExt } from '../../src/engines/time-scene';
import TimeSceneView from '../../src/engines/time-scene/View';
import GeographyView from '../../src/engines/time-scene/GeographyView';
import ClimatologyView from '../../src/engines/time-scene/ClimatologyView';
import { GeologyPlate, ModernEvidence, ModernInset, ReconstructionReadout, type GeologyReadoutProps, type ModernInsetProps } from '../../src/engines/time-scene/ModernInset';
import type { DeepTimeBundle } from '../../src/engines/time-scene/lib/deepTime';
import { climatologyGeoData, timeSceneGeoData, type TimeSceneGeoData } from '../../src/engines/time-scene/schema';
import { geographyData } from '../../src/engines/time-scene/geography-schema';

// Render the real engine slot contents without needing a DOM or map renderer.
vi.mock('../../src/engines/core/context', async (original) => ({
  ...await original<typeof import('../../src/engines/core/context')>(),
  SceneSlot: ({ name, children }: { name: string; children: ReactNode }) => ['plate', 'stageOverlay'].includes(name) ? children : null,
}));
vi.mock('../../src/engines/time-scene/stages/geo/GeoStage', () => ({ GeoStage: () => null }));
const { headers } = vi.hoisted(() => ({ headers: [] as { onToggle(): void; controls?: string }[] }));
vi.mock('../../src/engines/widgets/FoldHeader', async (original) => {
  const module = await original<typeof import('../../src/engines/widgets/FoldHeader')>();
  return { FoldHeader: (props: ComponentProps<typeof module.FoldHeader>) => {
    headers.push(props);
    return createElement(module.FoldHeader, props);
  } };
});

const text = (path: string) => readFileSync(path, 'utf8');
const json = (path: string) => JSON.parse(text(path));
function fixture(slug: string, locale: Locale = 'en'): EngineViewProps {
  const dir = `src/content/topics/${slug}`;
  const topic = topicSchema.parse(parse(text(`${dir}/topic.yaml`)));
  const raw = Object.fromEntries(readdirSync(`${dir}/data`).filter((f) => f.endsWith('.json')).map((f) => [f.replace('.json', ''), json(`${dir}/data/${f}`)]));
  const data = topic.temporalMode === 'geography' ? geographyData.parse(raw) : topic.temporalMode === 'climatology' ? climatologyGeoData.parse(raw) : timeSceneGeoData.parse(raw);
  const chapters = readdirSync(`${dir}/chapters`).filter((f) => f.endsWith('.mdx')).map((f) => parse(text(`${dir}/chapters/${f}`).split('---')[1]!) as Chapter).sort((a, b) => a.order - b.order);
  return { topic, data, chapters, locale };
}
function harness(props = fixture('sample-dated-layers')) {
  const hud = createHudStore();
  // SSR normally reads the initial snapshot; each render here represents a new client update.
  vi.spyOn(hud, 'getInitialState').mockImplementation(hud.getState);
  const actions = createHudActions(hud, { suppress: (fn) => fn() });
  const store = createSceneStore<TimeSceneExt>({ chapters: props.chapters, defaults: { chapter: null, camera: null, layers: [], t: null, highlight: [], ...timeSceneEngine.defaults(props.topic, props.data as TimeSceneGeoData) }, fromChapterState: timeSceneEngine.fromChapterState });
  const context = { ...props, store, hud, actions, slots: {}, revealReader() {} } as unknown as SceneContextValue;
  return { hud, actions, store, render: (node: ReactNode) => {
    headers.length = 0;
    return renderToStaticMarkup(createElement(SceneContext.Provider, { value: context }, node));
  } };
}
function expectFold(html: string, open: boolean, panel?: string) {
  const block = panel ? html.slice(html.indexOf(`data-hud-panel="${panel}"`)) : html;
  if (panel) expect(html).toContain(`data-hud-panel="${panel}"`);
  expect(block).toMatch(new RegExp(`data-fold-control=""[^>]*aria-expanded="${open}"`));
  expect(block).toMatch(open ? /class="ts-fold__body">/ : /class="ts-fold__body" hidden="">/);
  expect(block).toMatch(/type="button"[^>]*class="atlas-fold /);
  expect(block).toMatch(/aria-controls="[^"]+"/);
  expect(block).toContain('class="ts-fold__header" data-keys="own"');
  if (!open) expect(block).toContain('data-fold-tab=""');
}
const measures: HudMeasurements = { top: 90, bottom: 90, reader: 400, edge: 24, tab: 44, left: { width: 300, height: 580, metadata: 180 }, right: { width: 264, height: 500, legends: 160, card: 180 } };

beforeEach(() => { headers.length = 0; });
describe('TimeScene HUD folds', () => {
  for (const [slug, View, panel] of [
    ['sample-dated-layers', TimeSceneView, 'plate'],
    ['southeast-asia', GeographyView, 'geography-plate'],
    ['sample-climate', ClimatologyView, 'climatology-plate'],
  ] as const) for (const locale of ['en', 'zh'] as const) {
    it(`${slug}/${locale}: real overlay and plate follow automatic, manual and stage-only state`, () => {
      const props = fixture(slug, locale);
      const h = harness(props);
      const view = createElement(View, props);
      const room = solveHudRoom({ width: 1180, height: 820 }, measures);
      h.hud.setState(room.folds);
      let html = h.render(view);
      expectFold(html, true, panel);
      expect(html).not.toMatch(/<details[^>]*ts-overlay/);
      const overlay = html.slice(html.indexOf('ts-overlay'));
      expectFold(overlay, false);
      // Use the actual FoldHeader callback: it must record a manual host override.
      headers.find((header) => overlay.includes(`aria-controls="${header.controls}"`))!.onToggle();
      expect(h.hud.getState().manual.legendsOpen).toBe(true);
      html = h.render(view);
      expectFold(html.slice(html.indexOf('ts-overlay')), true);
      h.actions.setPlate(false);
      expectFold(h.render(view), false, panel);
      h.actions.setStageOnly(true);
      html = h.render(view);
      expectFold(html, false, panel);
      expectFold(html.slice(html.indexOf('ts-overlay')), false);
      h.store.getState().goToChapter(props.chapters.at(-1)!.id, { instant: true });
      expectFold(h.render(view), false, panel);
      h.actions.setStageOnly(false);
      html = h.render(view);
      expectFold(html, false, panel);
      expectFold(html.slice(html.indexOf('ts-overlay')), true);
    });
  }

  const topic = fixture('sample-deep-time').topic;
  const config = topic.modernInset!;
  const bundle: DeepTimeBundle = { reconstruction: json('public/geo/sample-de-reconstruction.json'), inset: json(`public/geo/${config.file}.json`), points: json('public/geo/sample-de-points.json').points, cards: json('public/geo/sample-de-cards.json').cards };
  const insetProps: ModernInsetProps = { bundle, config, locale: 'en', selectedMa: 66, view: 'world', insetVisible: true, fossilMode: 'age-window', fossilsEnabled: true, highlight: [], selectedObjectId: null, onSelect() {}, onPatch() {} };
  const geologyProps: GeologyReadoutProps = { bundle, locale: 'en', selectedMa: 66, stats: null, fossilMode: 'age-window', counts: null, recordSources: [] };
  for (const [panel, node, field] of [
    ['present-evidence', createElement(ModernEvidence, insetProps), 'legendsOpen'],
    ['reconstruction-age', createElement(ReconstructionReadout, geologyProps), 'legendsOpen'],
    ['geology-plate', createElement(GeologyPlate, geologyProps), 'plateOpen'],
  ] as const) {
    it(`${panel}: labelled header, body and reopen callback use ${field}`, () => {
      const h = harness();
      expectFold(h.render(node), true, panel);
      headers[0]!.onToggle();
      expect(h.hud.getState().manual[field]).toBe(false);
      expectFold(h.render(node), false, panel);
      headers[0]!.onToggle();
      expect(h.hud.getState().manual[field]).toBe(true);
      expectFold(h.render(node), true, panel);
      h.actions.setStageOnly(true);
      expectFold(h.render(node), false, panel);
      h.actions.setStageOnly(false);
      expectFold(h.render(node), true, panel);
    });
  }
  it('hosted find map: the host card supplies the one title and the fold, the header row is the view buttons and ×', () => {
    const h = harness();
    const html = h.render(createElement(ModernInset, { ...insetProps, hosted: true }));
    expect(html).toContain('data-hud-panel="modern-inset"');
    expect(html).not.toContain('ts-fold__header');
    expect(html).not.toContain('<strong>');
    expect(html).toContain('aria-label="Modern map view"');
    expect(html).toContain('aria-label="Hide modern map"');
    expect(headers).toHaveLength(0);
  });
  it('keeps reader evidence outside HUD folding and removes explicitly hidden presentation evidence', () => {
    const h = harness();
    h.actions.setLegends(false);
    const html = h.render(createElement(ModernInset, { ...insetProps, embedded: true }));
    expect(html).not.toContain('data-hud-panel');
    expect(html).not.toContain('ts-fold__body');
    expect(html).toContain('ts-modern__map');
    expect(h.render(createElement(ModernEvidence, { ...insetProps, insetVisible: false }))).toBe('');
  });
});
