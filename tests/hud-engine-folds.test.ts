import { readFileSync } from 'node:fs';
import { createElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { SceneContext, type SceneContextValue } from '../src/engines/core/context';
import { createHudActions, createHudStore } from '../src/engines/core/controls';
import { CardFrame } from '../src/engines/core/Hud';
import { solveHudRoom } from '../src/engines/core/hud-room';
import { createSceneStore } from '../src/engines/core/store';
import { ExplorerOverlay } from '../src/engines/space-scene/explorer/ExplorerOverlay';
import { PlateBlock as SpacePlate } from '../src/engines/space-scene/hud/PlateBlock';
import { partsFile } from '../src/engines/space-scene/schema';
import { createSpaceUi } from '../src/engines/space-scene/ui';
import { createBridge } from '../src/engines/space-scene/bridge';
import { MathOverlay } from '../src/engines/math-scene/hud/Overlay';
import { PlateBlock as MathPlate } from '../src/engines/math-scene/hud/PlateBlock';
import { FoldPanel } from '../src/engines/math-scene/hud/FoldPanel';
import { NetTools } from '../src/engines/math-scene/tray/NetControls';
import { Tray } from '../src/engines/math-scene/tray/Tray';
import { freshRun, type Controller } from '../src/engines/math-scene/controller';
import { lessonFile } from '../src/engines/math-scene/schema';
import type { FoldHeader } from '../src/engines/widgets/FoldHeader';

// Capture the actual header's callbacks so wiring can be exercised without a browser.
const headers = vi.hoisted(() => [] as Parameters<typeof FoldHeader>[0][]);
vi.mock('../src/engines/widgets/FoldHeader', async (load) => {
  const actual = await load<typeof import('../src/engines/widgets/FoldHeader')>();
  return { FoldHeader: (props: Parameters<typeof FoldHeader>[0]) => {
    headers.push(props);
    return createElement(actual.FoldHeader, props);
  } };
});

const file = partsFile.parse(JSON.parse(readFileSync(new URL('../src/content/topics/sample-space/data/parts.json', import.meta.url), 'utf8')));
const lesson = lessonFile.parse(JSON.parse(readFileSync(new URL('../src/content/topics/fractions/data/lesson.json', import.meta.url), 'utf8')));
const task = lesson.steps[0]!.pool[0]!;
const ctl = { canHint: () => false, canCheck: () => false } as unknown as Controller;

function fixture(locale: 'en' | 'zh' = 'en', sceneFile = file) {
  const hud = createHudStore();
  // Each server render should read the current state, as a mounted client does.
  hud.getInitialState = hud.getState;
  const actions = createHudActions(hud, { suppress: (fn) => fn() });
  const store = createSceneStore({ chapters: [], defaults: {
    chapter: null, camera: null, layers: sceneFile.groups.map((g) => g.id),
    part: null, run: false, view: 'exploded', explode: 0.7, hidden: [], solo: null, sim: {}, pose: null, beat: null,
  } });
  const context = { hud, actions, store, locale, chapters: [] } as unknown as SceneContextValue;
  const render = (node: ReactNode) => {
    headers.length = 0;
    return renderToStaticMarkup(createElement(SceneContext.Provider, { value: context }, node));
  };
  return { hud, actions, render };
}

const autoFold = (f: ReturnType<typeof fixture>) => {
  const room = solveHudRoom({ width: 1180, height: 820 }, {
    top: 90, bottom: 90, reader: 400, edge: 24, tab: 44,
    left: { width: 300, height: 580, metadata: 180 }, right: { width: 264, height: 500, legends: 160, card: 180 },
  }, f.hud.getState().manual);
  f.hud.setState(room.folds);
};

for (const locale of ['en', 'zh'] as const) {
  describe(`engine HUD folds (${locale})`, () => {
    it('Space group/flow KEY uses the shared fold and hides the explode slider', () => {
      const f = fixture(locale);
      autoFold(f);
      const node = createElement(ExplorerOverlay, { file });
      let html = f.render(node);
      expect(html).toContain('data-hud-panel="space-overlay" data-folded=""');
      expect(html).toContain('class="atlas-ctl__rows" hidden=""');
      expect(html).toContain('<ul hidden="">');
      expect(html).toContain('<div hidden=""><div class="space-bar">');
      expect(headers.every((h) => !h.open)).toBe(true);
      headers[0]!.onToggle();
      expect(f.hud.getState().manual.legendsOpen).toBe(true);
      autoFold(f);
      html = f.render(node);
      expect(headers.every((h) => h.open)).toBe(true);
      expect(html).not.toContain('<ul hidden="">');
    });

    it.each(['forces', 'energy-conversion'])('%s semantic colour KEY follows the same fold', (topic) => {
      const semantic = partsFile.parse(JSON.parse(readFileSync(new URL(`../src/content/topics/${topic}/data/parts.json`, import.meta.url), 'utf8')));
      const f = fixture(locale, semantic);
      const node = createElement(ExplorerOverlay, { file: semantic });
      f.actions.setLegends(false);
      let html = f.render(node);
      expect(html).toContain('<ul hidden="">');
      expect(html).toContain(topic === 'forces' ? (locale === 'en' ? 'Gravitational force' : '重力') : (locale === 'en' ? 'Potential energy (stored)' : '势能（储存的能量）'));
      headers.at(-1)!.onToggle();
      html = f.render(node);
      expect(html).not.toContain('<ul hidden="">');
    });

    it('simulation readouts in CardFrame follow solver folds and stage-only restoration', () => {
      const f = fixture(locale);
      f.hud.setState({ controls: { card: { en: 'Energy', zh: '能量' } } });
      autoFold(f);
      const node = createElement(CardFrame, { hud: f.hud, actions: f.actions, locale, slotRef: () => () => {} });
      expect(f.render(node)).toContain('data-hud-panel="card-tab"');
      f.actions.setCard(true);
      expect(f.render(node)).not.toContain('data-hud-panel="card-tab"');
      f.actions.setStageOnly(true);
      expect(f.render(node)).toContain('data-hud-panel="card-tab"');
      f.actions.setStageOnly(false);
      expect(f.render(node)).not.toContain('data-hud-panel="card-tab"');
    });

    it.each([false, true])('Math tools/key use the same store, compact=%s', (compact) => {
      const f = fixture(locale);
      autoFold(f);
      const node = createElement(MathOverlay, { glossary: false, compact });
      let html = f.render(node);
      expect(html).toContain('data-hud-panel="math-overlay" data-folded=""');
      expect(headers.every((h) => !h.open)).toBe(true);
      if (compact) expect(html).toMatch(/class="atlas-overlay-card ms-overlay" hidden=""/);
      headers[0]!.onToggle();
      html = f.render(node);
      expect(headers.every((h) => h.open)).toBe(true);
      expect(html).not.toContain('hidden=""');
    });

    it.each(['space', 'math'] as const)('%s PLATE follows the store and records manual choices', (engine) => {
      const f = fixture(locale);
      const node = engine === 'space'
        ? createElement(SpacePlate, { file, ui: createSpaceUi(), bridge: createBridge() })
        : createElement(MathPlate, { rows: [{ key: 'math.plate.parts', value: '8' }], locale });
      f.actions.setPlate(false);
      let html = f.render(node);
      expect(html).toContain('data-hud-panel="plate" data-folded=""');
      expect(html).toContain('data-fold-control=""');
      expect(html).toContain('aria-expanded="false"');
      expect(html).toContain('hidden=""');
      headers[0]!.onToggle();
      expect(f.hud.getState().manual.plateOpen).toBe(true);
      html = f.render(node);
      expect(html).toContain('aria-expanded="true"');
      expect(html).not.toContain('hidden=""');
    });

    it.each(['equation', 'task', 'net-tools'])('%s retains its named reopen header through stage-only and restore', (panel) => {
      const f = fixture(locale);
      const node = panel === 'equation'
        ? createElement(FoldPanel, { panel, title: 'Equation', className: 'ms-equation-panel', children: '1 + 1 = 2' })
        : panel === 'task'
          ? createElement(Tray, { ctl, task, run: freshRun(task), where: '01', practice: false, locale })
          : createElement(NetTools, { fold: 50, onFold() {}, foldable: true, onTurn() {}, style: {}, locale });
      f.actions.setStageOnly(true);
      let html = f.render(node);
      expect(html).toContain(`data-hud-panel="${panel}" data-folded=""`);
      expect(html).toContain('aria-expanded="false"');
      expect(html).toContain('aria-controls=');
      expect(html).toContain('data-fold-tab=""');
      expect(html).toContain('hidden=""');
      expect(headers[0]!.title).toBeTruthy();
      headers[0]!.onToggle();
      expect(f.hud.getState().legendsOpen).toBe(true);
      expect(f.hud.getState().stageOnly).toBe(true);
      f.actions.setStageOnly(false);
      html = f.render(node);
      expect(html).toContain('aria-expanded="true"');
      expect(html).not.toContain('hidden=""');
      f.actions.setLegends(false);
      f.actions.setStageOnly(true);
      f.actions.setStageOnly(false);
      expect(f.render(node)).toContain('aria-expanded="false"');
    });

    it('presentation tasks remain usable when the HUD legends are folded', () => {
      const f = fixture(locale);
      f.actions.setLegends(false);
      const html = f.render(createElement(Tray, { ctl, task, run: freshRun(task), where: null, practice: false, compact: true, locale }));
      expect(html).not.toContain('data-hud-panel="task"');
      expect(html).not.toContain('hidden=""');
      expect(headers).toHaveLength(0);
      expect(html).toContain('data-command="check"');
    });
  });
}
