import { describe, expect, it, vi } from 'vitest';
import {
  activePreset,
  allModes,
  buildKeymap,
  createHudActions,
  createHudStore,
  docId,
  registerSceneControls,
  trackCamera,
  type SceneControls,
} from '../src/engines/core/controls';
import { createSceneStore } from '../src/engines/core/store';
import { hudScale } from '../src/engines/core/SceneHost';
import type { Chapter, SceneSnapshot } from '../src/engines/core/types';

const chapter = (id: string, order: number, state: Chapter['state'] = {}): Chapter => ({
  id,
  order,
  title: { en: id, zh: id },
  sensitive: false,
  state,
  quiz: [],
});

const noSuppress = { suppress: (fn: () => void) => fn() };

describe('docId', () => {
  it('uses the first six letters of the topic and a two-digit chapter number', () => {
    expect(docId('sample-space', 2)).toBe('ATL-SAMPLE-02');
    expect(docId('ww2-pacific', 11)).toBe('ATL-WW2PAC-11');
    expect(docId('ab', 0)).toBe('ATL-AB-01');
  });
});

describe('hudScale', () => {
  it('follows clamp(min(W/1920, H/1080), .6, 1.6) and is 1 on phones', () => {
    expect(hudScale(1920, 1080)).toBe(1);
    expect(hudScale(3840, 2160)).toBe(1.6);
    expect(hudScale(1280, 720)).toBeCloseTo(2 / 3);
    expect(hudScale(900, 1200)).toBe(0.6);
    expect(hudScale(390, 844)).toBe(1);
  });
});

describe('registration, modes and keymap', () => {
  const controls: SceneControls = {
    presets: { items: [{ id: 'a', label: '01', chapter: 'one' }, { id: 'b', label: '02', chapter: 'two' }], set: vi.fn() },
    modes: {
      items: [
        { id: 'xray', key: 'x', label: 'X-ray', on: false },
        { id: 'bad', key: 'h', label: 'reserved key', on: false },
      ],
      set: vi.fn(),
    },
    pause: { paused: true, set: vi.fn() },
    labels: true,
  };

  it('adds the host LABELS mode when the engine supports labels', () => {
    expect(allModes(controls, false, 'Labels').map((m) => [m.id, m.key, m.on])).toEqual([
      ['xray', 'x', false],
      ['bad', 'h', false],
      ['labels', 'l', false],
    ]);
    expect(allModes({}, true, 'Labels')).toEqual([]);
  });

  it('maps digits to presets, letters to modes, reserved keys to the host', () => {
    const keys = buildKeymap(controls).map((k) => `${k.key}:${k.type}:${k.name}`);
    expect(keys).toEqual([
      '1:preset:a',
      '2:preset:b',
      'x:mode:xray',
      'l:mode:labels',
      ' :pause:pause',
      'h:hud:hud',
      'Escape:escape:escape',
      'ArrowLeft:chapter:prev',
      'ArrowRight:chapter:next',
    ]);
  });

  it('unregisters only its own registration', () => {
    const hud = createHudStore();
    const off = registerSceneControls(hud, controls);
    const next: SceneControls = { labels: true };
    registerSceneControls(hud, next);
    off();
    expect(hud.getState().controls).toBe(next);
  });

  it('routes actions to the engine and keeps host state', () => {
    const hud = createHudStore();
    registerSceneControls(hud, controls);
    const actions = createHudActions(hud, noSuppress);
    expect(actions.setPreset('b', { instant: true })).toBe(true);
    expect(controls.presets!.set).toHaveBeenCalledWith('b', { instant: true });
    expect(hud.getState().presetId).toBe('b');
    expect(actions.setPreset('nope')).toBe(false);
    actions.setMode('xray', true);
    expect(controls.modes!.set).toHaveBeenCalledWith('xray', true, { instant: false });
    actions.setMode('labels', false);
    expect(hud.getState().labels).toBe(false);
    actions.togglePaused();
    expect(controls.pause!.set).toHaveBeenCalledWith(false);
    actions.setHud(false);
    actions.escape();
    expect(hud.getState().hud).toBe(true);
    // The docked reading panel: expanded by default, host state only.
    expect(hud.getState().reader).toBe(true);
    actions.setReader(false);
    expect(hud.getState().reader).toBe(false);
  });
});

describe('active preset tracking', () => {
  const chapters = [
    chapter('one', 1, { camera: { center: [0, 0], zoom: 3 } }),
    chapter('two', 2, { camera: { center: [5, 5], zoom: 4 } }),
  ];
  const setup = () => {
    const store = createSceneStore({ chapters, defaults: { chapter: null, layers: [], camera: null } as SceneSnapshot });
    const hud = createHudStore();
    const tracker = trackCamera(hud, store, (id) => store.getState().chapterTarget(id).camera);
    registerSceneControls(hud, {
      presets: {
        items: chapters.map((c) => ({ id: c.id, label: c.id, chapter: c.id })),
        set: (id, { instant }) => store.getState().applyCameraPreset(store.getState().chapterTarget(id).camera!, { instant }),
      },
    });
    const actions = createHudActions(hud, tracker);
    const active = () => activePreset(hud.getState(), store.getState().chapter);
    return { store, hud, actions, active };
  };

  it("starts on the chapter's own preset, follows picks and chapter changes", () => {
    const { store, actions, active } = setup();
    expect(active()).toBe('one');
    actions.setPreset('two');
    expect(active()).toBe('two');
    expect(store.getState().transition.reason).toBe('preset');
    expect(store.getState().chapter).toBe('one');
    store.getState().goToChapter('two');
    expect(active()).toBe('two');
  });

  it('treats an applied state (presentation beat) like a deep link: free only off the chapter camera', () => {
    const { store, active } = setup();
    store.getState().applyState({ chapter: 'two', camera: { center: [9, 9], zoom: 6 } });
    expect(store.getState().transition.reason).toBe('state');
    expect(active()).toBeNull();
    store.getState().applyState({ chapter: 'two', camera: { center: [5, 5], zoom: 4 } });
    expect(active()).toBe('two');
  });

  it('becomes free camera when the user moves the camera', () => {
    const { store, active } = setup();
    store.getState().setCamera({ center: [1, 1], zoom: 3 });
    expect(active()).toBeNull();
    store.getState().goToChapter('one');
    expect(active()).toBe('one');
  });
});
