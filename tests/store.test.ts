import { describe, expect, it } from 'vitest';
import { createSceneStore } from '../src/engines/core/store';
import type { Chapter, SceneSnapshot } from '../src/engines/core/types';

interface Ext {
  t: string | null;
  highlight: string[];
}

const chapter = (id: string, order: number, state: Chapter['state']): Chapter => ({
  id,
  order,
  title: { en: id, zh: '' },
  sensitive: false,
  state,
  quiz: [],
});

const chapters = [
  chapter('one', 1, { time: '1939', layers: ['control'], camera: { center: [10, 50], zoom: 3 } }),
  chapter('two', 2, { time: '1940-06', theme: 'cinema' }),
  chapter('three', 3, { layers: ['control', 'movements'], highlight: ['x'] }),
];

const defaults: SceneSnapshot<Ext> = { chapter: null, layers: [], camera: null, theme: undefined, t: null, highlight: [] };

function makeStore() {
  return createSceneStore<Ext>({
    chapters,
    defaults,
    fromChapterState: (s) => ({
      ...(typeof s.time === 'string' ? { t: s.time } : {}),
      ...(Array.isArray(s.highlight) ? { highlight: s.highlight as string[] } : {}),
    }),
  });
}

describe('scene store', () => {
  it('starts on the first chapter target', () => {
    const s = makeStore().getState();
    expect(s.chapter).toBe('one');
    expect(s.t).toBe('1939');
    expect(s.layers).toEqual(['control']);
    expect(s.transition).toEqual({ id: 0, reason: 'init', instant: true });
  });

  it('goToChapter merges cumulative chapter state and bumps transitionId', () => {
    const store = makeStore();
    store.getState().goToChapter('three');
    const s = store.getState();
    expect(s.chapter).toBe('three');
    expect(s.t).toBe('1940-06'); // inherited from chapter two
    expect(s.theme).toBe('cinema'); // inherited from chapter two
    expect(s.layers).toEqual(['control', 'movements']);
    expect(s.camera).toEqual({ center: [10, 50], zoom: 3 }); // inherited from chapter one
    expect(s.highlight).toEqual(['x']);
    expect(s.transition).toMatchObject({ id: 1, reason: 'chapter', instant: false });
  });

  it('chapter targets reset user changes', () => {
    const store = makeStore();
    store.getState().toggleLayer('battles');
    store.getState().setTheme('paper');
    expect(store.getState().layers).toEqual(['control', 'battles']);
    store.getState().goToChapter('one');
    expect(store.getState().layers).toEqual(['control']);
    expect(store.getState().theme).toBeUndefined();
  });

  it('hydrate applies the chapter target then URL overrides, instantly', () => {
    const store = makeStore();
    store.getState().hydrate({ chapter: 'two', t: '1940-07-01', layers: [] });
    const s = store.getState();
    expect(s.chapter).toBe('two');
    expect(s.t).toBe('1940-07-01');
    expect(s.layers).toEqual([]);
    expect(s.theme).toBe('cinema');
    expect(s.transition).toMatchObject({ reason: 'url', instant: true });
  });

  it('stepChapter walks every chapter and stops at the ends', () => {
    const store = makeStore();
    expect(store.getState().stepChapter(-1)).toBeNull();
    expect(store.getState().stepChapter(1)).toBe('two');
    expect(store.getState().stepChapter(1)).toBe('three');
    expect(store.getState().stepChapter(1)).toBeNull();
    expect(store.getState().stepChapter(-1)).toBe('two');
  });

  it('snapshot returns only serializable fields', () => {
    const snap = makeStore().getState().snapshot();
    expect(Object.keys(snap).sort()).toEqual(['camera', 'chapter', 'highlight', 'layers', 't']);
  });

  it('ignores unknown chapter ids', () => {
    const store = makeStore();
    store.getState().goToChapter('nope');
    expect(store.getState().chapter).toBe('one');
  });

  it('rebase swaps in data-dependent defaults and keeps the current chapter', () => {
    const store = createSceneStore<Ext>({
      chapters: [chapter('a', 1, {}), chapter('b', 2, { highlight: ['y'] })],
      defaults,
    });
    store.getState().goToChapter('b');
    expect(store.getState().t).toBeNull();
    store.getState().rebase({ ...defaults, t: '1939-09-01', layers: ['base'] });
    const s = store.getState();
    expect(s.chapter).toBe('b');
    expect(s.t).toBe('1939-09-01');
    expect(s.layers).toEqual(['base']);
    expect(s.transition.instant).toBe(true);
    expect(store.getState().chapterTarget('a').t).toBe('1939-09-01');
  });

  it('applyState sets several fields at once, keeps the rest and animates (reason state)', () => {
    const store = makeStore();
    store.getState().applyState({ chapter: 'three', t: '1941-12-08', highlight: ['y'] }, { instant: false });
    const s = store.getState();
    expect(s.chapter).toBe('three');
    expect(s.t).toBe('1941-12-08');
    expect(s.highlight).toEqual(['y']);
    // Not reset to chapter three's target: layers stay where they were.
    expect(s.layers).toEqual(['control']);
    expect(s.transition).toMatchObject({ reason: 'state', instant: false });
    store.getState().applyState({ chapter: 'nope' }, { instant: true });
    expect(store.getState().chapter).toBe('three');
    expect(store.getState().transition.instant).toBe(true);
  });
});
