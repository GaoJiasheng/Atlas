import { nextModernSelection } from '../../src/engines/time-scene/lib/deepTime';
/** Deep links use the same state merge as the visible chapter/beat controls. */
import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { parse as parseYaml } from 'yaml';
import { createSceneStore } from '../../src/engines/core/store';
import { decodeSceneState, encodeSceneState, mergeSearch } from '../../src/engines/core/url-state';
import type { Chapter, GeoCamera, SceneSnapshot } from '../../src/engines/core/types';
import { timeSceneEngine, type TimeSceneExt } from '../../src/engines/time-scene';
import { linkedTimeBeatState, timeBeatState } from '../../src/engines/time-scene/lib/beatState';
import { timeBeat, type TimeBeat } from '../../src/engines/time-scene/schema';
import { formatTime } from '../../src/engines/time-scene/lib/format';
import { fromNumber, toNumber } from '../../src/engines/time-scene/lib/time';
import { geoTime } from '../../src/content/schema/common';
import { topicSchema } from '../../src/content/schema/topic';
import { loadDeepTime } from '../../src/engines/time-scene/deep-time-build';
import { timeSceneGeoData, timeSceneIds, timeChapterRefs } from '../../src/engines/time-scene/schema';

type Snap = SceneSnapshot<TimeSceneExt>;
const cam: GeoCamera = { center: [-30, 5], zoom: 1.1 };
const beats: TimeBeat[] = [
  { t: { ma: 70 }, camera: cam, layers: ['base', 'fossils-modern'], highlight: [], inset: 'world', insetVisible: true, fossilMode: 'age-window', caption: { en: 'TEST old sample', zh: '测试较老样本' } },
  { t: { ma: 66 }, camera: cam, layers: ['base', 'fossils-modern'], highlight: ['impact-modern'], inset: 'mexico', insetVisible: true, fossilMode: 'age-window', caption: { en: 'TEST event', zh: '测试事件' } },
  { t: { ma: 65 }, camera: cam, layers: ['base', 'fossils-modern'], highlight: [], inset: 'southeast-asia', insetVisible: true, fossilMode: 'all-mesozoic', caption: { en: 'TEST later sample', zh: '测试较新样本' } },
];
const chapter: Chapter = { id: 'impact-boundary', order: 1, title: { en: 'TEST', zh: '测试' }, sensitive: false, quiz: [], state: {
  time: { ma: 66 }, camera: cam, layers: ['base', 'fossils-modern'], highlight: [], inset: 'world', insetVisible: true, fossilMode: 'age-window', beats,
} };
const defaults: Snap = { chapter: null, t: { ma: 250 }, beat: null, camera: null, layers: ['base'], highlight: [], inset: 'world', insetVisible: true, fossilMode: 'age-window' };
function store() { return createSceneStore<TimeSceneExt>({ chapters: [chapter], defaults, fromChapterState: timeSceneEngine.fromChapterState }); }
function viaLink(search: string): Snap {
  const s = store();
  const fields = decodeSceneState(search);
  const { t, beat, highlight, inset, insetVisible, fossilMode, ...common } = fields;
  s.getState().hydrate({ ...common, ...timeSceneEngine.fromUrl({ t, beat, highlight, inset, insetVisible, fossilMode }) });
  const state = s.getState();
  const index = state.beat;
  if (index !== null && index >= 0 && index < beats.length) state.applyState(linkedTimeBeatState(timeBeatState(state.chapterTarget(state.chapter), beats[index], index), state.transition.fields ?? []), { instant: true });
  else if (index !== null) state.patch({ beat: null });
  return s.getState().snapshot();
}
function viaAxis(index: number): Snap {
  const s = store(); s.getState().goToChapter(chapter.id);
  s.getState().applyState(timeBeatState(s.getState().chapterTarget(chapter.id), beats[index], index), { instant: true });
  return s.getState().snapshot();
}
function linkOf(state: Snap): string {
  const s = store();
  const target = s.getState().chapterTarget(state.chapter);
  const baseline = state.beat === null ? target : timeBeatState(target, beats[state.beat], state.beat);
  return mergeSearch('', encodeSceneState(state, { ...baseline, beat: target.beat }));
}

describe('TimeScene geological beat links', () => {
  it('opens the exact beat with a matching camera, highlight, view, layer and age mode', () => {
    expect(viaLink('?ch=impact-boundary&b=2')).toEqual(viaAxis(1));
    expect(viaLink('?ch=impact-boundary&b=2')).toMatchObject({ beat: 1, t: { ma: 66 }, inset: 'mexico', highlight: ['impact-modern'] });
  });
  it('preserves all explicit URL overrides ahead of the selected beat', () => {
    const linked = viaLink('?ch=impact-boundary&b=2&t=65ma&inset=southeast-asia&inset-visible=0&fossil-mode=all-mesozoic&hl=singapore-modern&layers=fossils-modern&cam=20,3,2');
    expect(linked).toMatchObject({ beat: 1, t: { ma: 65 }, inset: 'southeast-asia', insetVisible: false, fossilMode: 'all-mesozoic', highlight: ['singapore-modern'], layers: ['fossils-modern'], camera: { center: [20, 3], zoom: 2 } });
    expect(viaLink(linkOf(linked))).toEqual(linked);
  });
  it('writes a beat baseline with b preserved and reloads the same scene', () => {
    for (let i = 0; i < beats.length; i++) {
      const state = viaAxis(i); expect(linkOf(state)).toBe(`?ch=impact-boundary&b=${i + 1}`);
      expect(viaLink(linkOf(state))).toEqual(state);
    }
  });
  it('without b retains chapter state and discards out-of-range beat indices', () => {
    expect(viaLink('?ch=impact-boundary')).toMatchObject({ beat: null, t: { ma: 66 }, inset: 'world' });
    expect(viaLink('?ch=impact-boundary&b=999')).toMatchObject({ beat: null, t: { ma: 66 } });
  });
  it('keeps a hidden modern view after reloading then reopening', () => {
    const hidden = viaLink('?ch=impact-boundary&b=2&inset=southeast-asia&inset-visible=0');
    const s = store(); s.getState().applyState(viaLink(linkOf(hidden)), { instant: true });
    s.getState().patch({ insetVisible: true });
    expect(s.getState()).toMatchObject({ insetVisible: true, inset: 'southeast-asia', beat: 1 });
  });
  it('clears the beat on a free time commit so a reload retains the chosen age', () => {
    const s = store(); s.getState().applyState(viaAxis(1), { instant: true });
    s.getState().patch({ t: fromNumber(-143100000, 'ma', { maDigits: 3 }), beat: null });
    const state = s.getState().snapshot();
    expect(linkOf(state)).toContain('t=143.1ma');
    expect(viaLink(linkOf(state)).t).toEqual({ ma: 143.1 });
  });
});

describe('geological URL validation and precision', () => {
  it.each(['NaNma', 'Infinityma', '-1ma', '1e309ma', `${'9'.repeat(309)}ma`])('ignores invalid time %s without losing the valid beat/view', (t) => {
    expect(decodeSceneState(`?b=2&t=${t}&inset=mexico`)).toEqual({ beat: 1, inset: 'mexico' });
  });
  it('ignores invalid modern keys and preserves foreign query parameters during canonicalization', () => {
    expect(decodeSceneState('?inset=ancient&inset-visible=true&fossil-mode=all')).toEqual({});
    expect(viaLink('?ch=impact-boundary&b=2&inset=ancient')).toMatchObject({ inset: 'mexico' });
    expect(mergeSearch('?utm_source=field&t=NaNma&inset=ancient', encodeSceneState({ chapter: chapter.id, inset: 'mexico' }))).toBe('?ch=impact-boundary&inset=mexico&utm_source=field');
  });
  it.each([201.4, 143.1, 251.902])('retains %s Ma through URL, numeric axis and localized precise labels', (ma) => {
    const time = { ma }; const n = toNumber(time);
    expect(fromNumber(n, 'ma', { maDigits: 3 })).toEqual(time);
    expect(decodeSceneState(mergeSearch('', encodeSceneState({ t: time }))).t).toEqual(time);
    expect(formatTime(time, 'en', undefined, undefined, 3)).toBe(`${ma} Ma`);
    expect(formatTime(time, 'zh', undefined, undefined, 3)).toBe(`${ma} Ma / ${ma}百万年前`);
  });
  it('keeps existing formatting when no topic precision is provided', () => {
    expect(formatTime({ ma: 200 }, 'en')).toBe('200 Ma');
    expect(formatTime({ ma: 200 }, 'zh')).toBe('2亿年前');
    expect(formatTime('1942-02-15', 'en')).toBe('15 Feb 1942');
  });
  it('rejects nonfinite values and mixed data inside the strict Ma object', () => {
    for (const invalid of [{ ma: NaN }, { ma: Infinity }, { ma: -1 }, { ma: Number.MAX_VALUE }, { ma: 66, date: '2000' }]) expect(geoTime.safeParse(invalid).success).toBe(false);
    expect(timeBeat.safeParse({ ...beats[0], inset: 'past', fossilMode: 'all' }).success).toBe(false);
  });
});

describe('local deep-time manifest build integration', () => {
  const folder = 'src/content/topics/sample-deep-time';
  const topic = topicSchema.parse(parseYaml(readFileSync(`${folder}/topic.yaml`, 'utf8')));
  const data = Object.fromEntries(readdirSync(`${folder}/data`).filter((f) => f.endsWith('.json')).map((f) => [f.slice(0, -5), JSON.parse(readFileSync(`${folder}/data/${f}`, 'utf8'))]));
  const readGeo = (stem: string) => JSON.parse(readFileSync(`public/geo/${stem}.json`, 'utf8')) as unknown;
  it('actually loads local manifest, every frame, point/card subfile and modern polygons', () => {
    const result = timeSceneGeoData.parse(loadDeepTime(topic, data, readGeo));
    expect(result.deepTime?.reconstruction.frames.length).toBe(7);
    expect(result.deepTime?.points.length).toBeGreaterThan(0);
    expect(result.deepTime?.cards.length).toBeGreaterThan(0);
    expect(result.deepTime?.land?.features.length).toBeGreaterThan(0);
    expect(result.deepTime?.countries?.features.length).toBeGreaterThan(0);
    const ids = timeSceneIds(result).map((o) => o.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toContain(result.deepTime!.points[0]!.id);
    expect(timeChapterRefs({ highlight: [ids[0]!], index: [ids[1]!], beats: [{ caption: { en: 'TEST', zh: '测试' }, highlight: [ids[2]!] }] })).toEqual([ids[1], ids[0], ids[2]]);
  });
  it('fails on missing local files and unknown sources before a runtime request can happen', () => {
    expect(() => loadDeepTime(topic, data, () => undefined)).toThrow('file not found');
    expect(() => loadDeepTime(topic, { ...data, sources: { sources: [] } }, readGeo)).toThrow('unknown source');
  });
  it('rejects ISO dates masquerading as a reconstruction control age and nonempty legacy objects', () => {
    const mixed = structuredClone(data) as typeof data;
    (mixed.control as { keyframes: { t: unknown }[] }).keyframes[0]!.t = '2000';
    expect(() => loadDeepTime(topic, mixed, readGeo)).toThrow('matching Ma times');
    expect(() => loadDeepTime(topic, { ...data, events: [{ id: 'legacy-event' }] }, readGeo)).toThrow('must be empty');
  });
});

describe('modern inspector follows the visible evidence selection', () => {
  it('changes from one reference or card to the next highlighted object, then clears', () => {
    expect(nextModernSelection('singapore', ['chicxulub'], null)).toBe('chicxulub');
    expect(nextModernSelection('thailand', ['pahang'], null)).toBe('pahang');
    expect(nextModernSelection('fossil-outside-window', [], null)).toBeNull();
    expect(nextModernSelection('singapore', ['thailand', 'singapore'], null)).toBe('singapore');
  });
  it('keeps an explicit out-of-window index pick until the time or filter changes', () => {
    expect(nextModernSelection('fossil-outside-window', [], 'fossil-outside-window')).toBe('fossil-outside-window');
    expect(nextModernSelection('fossil-outside-window', ['pahang'], 'fossil-outside-window')).toBe('pahang');
    expect(nextModernSelection('fossil-outside-window', [], null)).toBeNull();
  });
});
