/** SSR checks actual reader/HUD concealment and accessible static curve markup without browser gates. */
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createStore } from 'zustand/vanilla';
import { describe, expect, it } from 'vitest';
import { SceneContext, type SceneContextValue } from '../../src/engines/core/context';
import { createHudStore } from '../../src/engines/core/controls';
import { createSpaceUi, type SpaceUiStore } from '../../src/engines/space-scene/ui';
import { TryIt } from '../../src/engines/space-scene/explorer/TryIt';
import { PlateBlock } from '../../src/engines/space-scene/hud/PlateBlock';
import { createBridge } from '../../src/engines/space-scene/bridge';
import { resolveSimValues } from '../../src/engines/space-scene/lib/sim/controls';
import { simTrySchema, type SimData, type SimTry, type SimValues } from '../../src/engines/space-scene/sim-schema';
import type { PartsFile } from '../../src/engines/space-scene/schema';
import { heatSim } from './fixtures/heat-bench';
import { forcesSim } from './fixtures/forces-bench';
import { revealCurrentResult } from '../../src/engines/space-scene/hud/sim';
import { trialContextPatch } from '../../src/engines/space-scene/lib/sim/session';

const l = (en: string, zh = en) => ({ en, zh });
const card = simTrySchema.parse({ vary: 'elapsed-s', also: ['heater-w'], keep: ['water-g'], observe: ['heated-c'], record: true,
  curve: { x: 'elapsed-s', y: ['heated-c'], samples: 101 },
  predict: { prompt: l('Predict the temperature', '预测温度'), start: { 'elapsed-s': 0 }, change: { 'elapsed-s': 120 }, observe: 'heated-c', options: [{ id: 'up', label: l('Higher', '更高'), means: 'more' }, { id: 'same', label: l('Same', '相同'), means: 'same' }] },
});
function render(options: { locale?: 'en' | 'zh'; revealed?: boolean; answered?: boolean; elapsed?: number; beatReveal?: boolean; sim?: SimData; card?: SimTry; ui?: SpaceUiStore; set?: SimValues } = {}) {
  const sim = options.sim ?? heatSim();
  const activeCard = options.card ?? card;
  const first = sim.outputs.find((o) => o.id === activeCard.observe[0])!;
  const file = { sim, parts: [], groups: [], flows: [], animations: [], views: {}, telemetry: [{ key: l('Temperature'), unit: first.unit, follow: first.id, lag: 0 }] } as unknown as PartsFile;
  const ui = options.ui ?? createSpaceUi();
  const set = options.set ?? { 'elapsed-s': options.elapsed ?? 120 };
  const values = resolveSimValues(sim, set);
  if (options.answered) ui.setState({ simPredict: { chapter: 'heating', guess: 'up', value: 25, before: { ...values, 'elapsed-s': 0 }, after: values } });
  // SSR reads Zustand's initial snapshot; seed it with the simulated client's current UI state.
  ui.getInitialState = ui.getState;
  const store = createStore(() => ({ chapter: 'heating', sim: set, beat: options.beatReveal ? 0 : null, pose: null, run: false, view: 'assembled', explode: 0, part: null, hidden: [], layers: [], transition: { instant: true, id: 0 } }));
  const context = { store, hud: createHudStore(), locale: options.locale ?? 'en', actions: {}, slots: {}, topic: {}, chapters: [{ id: 'heating', title: l('Heating'), state: { sim: { set: { 'elapsed-s': 120 }, try: activeCard, ...(options.revealed ? { reveal: true } : {}) }, beats: options.beatReveal ? [{ caption: l('Explanation'), sim: { set: { 'elapsed-s': 120 }, reveal: true } }] : [] } }] } as unknown as SceneContextValue;
  return {
    reader: renderToStaticMarkup(createElement(SceneContext.Provider, { value: context }, createElement(TryIt, { file, ui, bridge: createBridge() }))),
    plate: renderToStaticMarkup(createElement(SceneContext.Provider, { value: context }, createElement(PlateBlock, { file, ui, bridge: createBridge() }))),
    values, ui, store,
  };
}

describe('model curve and predictive result visibility', () => {
  it('unanswered predictions omit readouts, the complete curve, model value table and numerical HUD', () => {
    const { reader, plate } = render();
    expect(reader).toContain('data-predict="up"');
    expect(reader).not.toContain('data-sim-output');
    expect(reader).not.toContain('data-model-curve');
    expect(reader).not.toContain('Model value table');
    expect(reader).not.toContain('39.3');
    expect(plate).not.toContain('39.3');
    expect(plate).not.toContain('space-plate__reading');
  });
  it('a current guess reveals exact readings, a static full curve, model table and before/after condition snapshots', () => {
    const { reader, plate } = render({ answered: true });
    expect(reader).toContain('data-sim-output="heated-c"');
    expect(reader).toContain('data-model-curve');
    expect(reader).toContain('data-curve-cursor="120"');
    expect(reader).toContain('Model value table');
    expect(reader).toContain('Compared conditions');
    expect(reader).toContain('Before');
    expect(reader).toContain('After');
    expect(reader).toContain('39.3');
    expect(plate).toContain('39.3');
    expect(reader).toContain('role="img"');
    expect(reader).toContain('aria-live="polite"');
  });
  it('author reveal works in chapters and beats; changing time hides that old reveal', () => {
    expect(render({ revealed: true }).reader).toContain('data-model-curve');
    expect(render({ beatReveal: true }).reader).toContain('data-model-curve');
    expect(render({ revealed: true, elapsed: 60 }).reader).not.toContain('data-model-curve');
  });
  it('explicit current-result reveal keeps arbitrary inputs and exposes their readouts and record button', () => {
    const ui = createSpaceUi();
    const set = { 'elapsed-s': 180, 'heater-w': 50 };
    const before = structuredClone(set);
    expect(render({ ui, set }).reader).toContain('data-sim-reveal');
    expect(render({ ui, set }).reader).not.toContain('data-sim-record');
    const values = resolveSimValues(heatSim(), set);
    revealCurrentResult(ui, 'heating', values);
    const shown = render({ ui, set });
    expect(set).toEqual(before);
    expect(shown.store.getState().sim).toEqual(before);
    expect(shown.reader).toContain('data-sim-output="heated-c"');
    expect(shown.reader).toContain('data-curve-cursor="180"');
    expect(shown.reader).toContain('35.7');
    expect(shown.reader).toContain('data-sim-record');
    expect(shown.plate).toContain('35.7');
    expect(shown.reader).not.toContain('Compared conditions');
    expect(ui.getState().simPredict).toBeNull();
    expect(render({ locale: 'zh', set }).reader).toContain('显示当前结果');
  });
  it('editing time or a held condition hides an explicit reveal and clears it on reconciliation', () => {
    const cases: SimValues[] = [{ 'elapsed-s': 180 }, { 'elapsed-s': 120, 'heater-w': 50 }];
    for (const set of cases) {
      const ui = createSpaceUi();
      const values = resolveSimValues(heatSim(), { 'elapsed-s': 120 });
      revealCurrentResult(ui, 'heating', values);
      expect(render({ ui }).reader).toContain('data-model-curve');
      expect(render({ ui, set }).reader).not.toContain('data-model-curve');
      expect(render({ ui, set }).reader).not.toContain('data-sim-record');
      ui.setState(trialContextPatch(ui.getState(), 'heating', resolveSimValues(heatSim(), set), 'elapsed-s'));
      expect(ui.getState().simReveal).toBeNull();
    }
    const ui = createSpaceUi();
    const values = resolveSimValues(heatSim(), {});
    revealCurrentResult(ui, 'heating', values);
    expect(trialContextPatch(ui.getState(), 'heating', values, 'elapsed-s', true).simReveal).toBeNull();
    expect(trialContextPatch(ui.getState(), 'cooling', values, 'elapsed-s').simReveal).toBeNull();
  });
  it('legacy force predictions preserve visible readouts, PLATE and recording before a guess', () => {
    const legacy = simTrySchema.parse({ vary: 'spring-load', observe: ['extension'], record: true,
      predict: { prompt: l('Predict extension'), start: { 'spring-load': 0 }, change: { 'spring-load': 100 }, observe: 'extension', options: [{ id: 'more', label: l('More'), means: 'more' }, { id: 'same', label: l('Same'), means: 'same' }] },
    });
    const { reader, plate } = render({ sim: forcesSim, card: legacy, set: { 'spring-load': 100 } });
    expect(reader).toContain('data-predict="more"');
    expect(reader).toContain('data-sim-output="extension"');
    expect(reader).toContain('data-sim-record');
    expect(reader).not.toContain('data-sim-reveal');
    expect(plate).toContain('space-plate__reading');
  });
  it('Chinese accessible figure title, model table, controls and trend are localised', () => {
    const { reader } = render({ locale: 'zh', answered: true });
    expect(reader).toContain('模型曲线');
    expect(reader).toContain('模型值表');
    expect(reader).toContain('回到 0 s');
    expect(reader).toContain('模型预计');
    expect(reader).toContain('加热水温上升');
  });
});
