/**
 * A beat opened from a link (`?ch=<chapter>&b=<n>`) is the beat the chapter
 * axis shows: the try-it values, view, layers and camera are the beat's unless
 * the link sets them itself (an explicit `sim=` wins), and the URL written at a
 * beat (baseline = the beat's scene) opens back on the same scene.
 */
import { describe, expect, it } from 'vitest';
import { createSceneStore, type SceneStore } from '../../src/engines/core/store';
import { decodeSceneState, encodeSceneState, mergeSearch, type UrlState } from '../../src/engines/core/url-state';
import type { Chapter, OrbitCamera, SceneSnapshot, TopicMeta } from '../../src/engines/core/types';
import type { Beat, SpaceBeatSpec } from '../../src/engines/core/presentation';
import { spaceSceneEngine, type SpaceSceneExt } from '../../src/engines/space-scene';
import { beatBaseline, beatScene, linkedBeatPatch } from '../../src/engines/space-scene/lib/beat-scene';

type Snap = SceneSnapshot<SpaceSceneExt>;

const chapterCam: OrbitCamera = { position: [1, 2, 3], target: [0, 0, 0], fov: 30 };
const beatCam: OrbitCamera = { position: [4, 1, 2], target: [0, 0.5, 0], fov: 30 };
const presetCam: OrbitCamera = { position: [0, 5, 0.1], target: [0, 0, 0], fov: 40 };
const presets = [{ id: 'top', camera: presetCam }];

const drop: SpaceBeatSpec[] = [
  { caption: { en: 'Two balls', zh: '两只球' } },
  { caption: { en: 'Higher', zh: '更高' }, sim: { set: { 'drop-height': 1.5 } }, camera: beatCam },
  { caption: { en: 'Paper', zh: '纸' }, sim: { set: { pair: 'papers' } }, view: 'xray', layers: ['drop'], hide: ['push-rod'], camera: 'top' },
];

const chapter = (id: string, order: number, state: Chapter['state']): Chapter => ({ id, order, title: { en: id, zh: id }, sensitive: false, state, quiz: [] });
const chapters = [
  chapter('pushes', 1, { camera: chapterCam, sim: { set: { push: 'none' } } }),
  chapter('gravity', 2, { camera: chapterCam, sim: { set: { pair: 'balls', 'drop-height': 1 } }, beats: drop }),
];

const beats: Beat<SpaceBeatSpec>[] = drop.map((spec, index) => ({ chapter: 'gravity', index, caption: spec.caption, chapterIndex: 1, count: drop.length, spec }));

function makeStore(): SceneStore<SpaceSceneExt> {
  const defaults = { ...spaceSceneEngine.defaults({} as TopicMeta, undefined), chapter: null, layers: ['drop', 'ramp'], camera: null, theme: undefined } as Snap;
  return createSceneStore<SpaceSceneExt>({ chapters, defaults, fromChapterState: spaceSceneEngine.fromChapterState });
}

const sceneOf = (store: SceneStore<SpaceSceneExt>, b: Beat<SpaceBeatSpec>) => {
  const target = store.getState().chapterTarget(b.chapter);
  return beatScene(b, target, presets, (view) => (view === 'exploded' ? presetCam : (target.camera as OrbitCamera)));
};

/** The chapter axis: the beat's scene, applied whole. */
function viaAxis(i: number): Snap {
  const store = makeStore();
  store.getState().goToChapter('gravity', { instant: true });
  store.getState().applyState(sceneOf(store, beats[i]!), { instant: true });
  return store.getState().snapshot();
}

/** A deep link, as SceneHost hydrates it and the SpaceScene view settles it. */
function viaLink(search: string): Snap {
  const store = makeStore();
  const { t, beat, highlight, part, view, explode, run, cutaway, pose, task, model, sim, ...common } = decodeSceneState(search);
  store.getState().hydrate({ ...common, ...spaceSceneEngine.fromUrl({ t, beat, highlight, part, view, explode, run, cutaway, pose, task, model, sim }) } as Partial<Snap>);
  const st = store.getState();
  const b = beats.find((x) => x.chapter === st.chapter && x.index === st.beat);
  if (b) st.applyState(linkedBeatPatch(sceneOf(store, b), st.transition.fields ?? []), { instant: true });
  return store.getState().snapshot();
}

/** The URL the scene writes (SceneHost's sync with the view's beat baseline). */
function linkOf(state: Snap): string {
  const store = makeStore();
  const b = beats.find((x) => x.chapter === state.chapter && x.index === state.beat);
  const baseline = b ? beatBaseline(sceneOf(store, b), store.getState().chapterTarget(b.chapter)) : store.getState().chapterTarget(state.chapter);
  return mergeSearch('', encodeSceneState(state as UrlState, baseline as UrlState));
}

describe('a beat opened from a link', () => {
  it('gets the beat’s try-it values on top of the chapter’s, as the chapter axis does', () => {
    const linked = viaLink('?ch=gravity&b=2');
    expect(linked.sim).toEqual({ pair: 'balls', 'drop-height': 1.5 });
    expect(linked.beat).toBe(1);
    expect(linked).toEqual(viaAxis(1));
  });

  it('gets the beat’s view, layers, hidden parts and named-preset camera', () => {
    const linked = viaLink('?ch=gravity&b=3');
    expect(linked).toMatchObject({ view: 'xray', layers: ['drop'], hidden: ['push-rod'], camera: presetCam, sim: { pair: 'papers', 'drop-height': 1 } });
    expect(linked).toEqual(viaAxis(2));
  });

  it('keeps what the link sets itself: an explicit sim= and cam= win over the beat', () => {
    const linked = viaLink('?ch=gravity&b=2&sim=drop-height.0.5~pair.papers&cam=9,9,9,0,0,0');
    expect(linked.sim).toEqual({ 'drop-height': 0.5, pair: 'papers' });
    expect(linked.camera).toMatchObject({ position: [9, 9, 9], target: [0, 0, 0] });
    // The beat still fills in the rest.
    expect(viaLink('?ch=gravity&b=3&sim=pair.balls')).toMatchObject({ view: 'xray', hidden: ['push-rod'], sim: { pair: 'balls' } });
  });

  it('without b opens on the chapter’s own state', () => {
    expect(viaLink('?ch=gravity')).toMatchObject({ beat: null, sim: { pair: 'balls', 'drop-height': 1 }, camera: chapterCam, hidden: [] });
  });

  it('writes a plain ?ch=&b= link at a beat, and the link it writes opens back on the same scene', () => {
    const atBeat = viaAxis(1);
    expect(linkOf(atBeat)).toBe('?ch=gravity&b=2');
    // The reader puts the height back to the chapter's: the link must say so, or the beat's 1.5 would come back.
    const changed = { ...atBeat, sim: { ...atBeat.sim, 'drop-height': 1 }, view: 'assembled' as const };
    const link = linkOf(changed);
    expect(link).toContain('sim=drop-height.1~pair.balls');
    expect(viaLink(link)).toEqual(changed);
    const xray = { ...viaAxis(2), view: 'assembled' as const, part: 'paper-flat' };
    expect(viaLink(linkOf(xray))).toEqual(xray);
  });
});
