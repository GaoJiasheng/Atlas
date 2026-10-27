import { describe, expect, it } from 'vitest';
import { topicSchema } from '../../src/content/schema/topic';
import { climatologyGeoData, climatologyChapterState, timeSceneGeoData, timeChapterState } from '../../src/engines/time-scene/schema';
import { engineSchemas, validateEngineChapterState } from '../../src/engines/schemas';
import { createSceneStore } from '../../src/engines/core/store';
import { decodeSceneState, encodeSceneState, mergeSearch } from '../../src/engines/core/url-state';
import { timeSceneEngine } from '../../src/engines/time-scene';
import { monthlyUrlPatch, monthlyBeatScene, cycleMonth, setClimatologyMonth, type ClimatologyExt } from '../../src/engines/time-scene/lib/climatology-state';
import { tickPosition, stepBeat } from '../../src/engines/core/axis/axis';
import { buildBeats } from '../../src/engines/core/presentation/beats';
import type { Chapter, SceneSnapshot } from '../../src/engines/core/types';
const bi = { en: 'Fixture', zh: '测试' };
const camera = { center: [110, -6] as [number, number], zoom: 4.7 };
const chapter = (id: string, order: number, months: number[]): Chapter => ({
  id,
  order,
  title: bi,
  sensitive: false,
  quiz: [],
  state: {
    month: months[0],
    layers: ['sites'],
    camera: { center: [105, 0], zoom: 3 },
    beats: months.map((month) => ({
      month,
      caption: bi,
      camera,
      layers: ['sites'],
      highlight: [],
    })),
  },
});
const chapters = [chapter('background', 0, [1, 7]), chapter('northeast-monsoon', 1, [12, 1, 2, 2]), chapter('same-month', 2, [4, 4, 4, 4])];
const topic = {
  id: 'fixture',
  title: bi,
  subtitle: bi,
  subject: 'geography',
  mode: 'time',
  engine: 'time-scene',
  stage: 'geo',
  temporalMode: 'climatology',
  climatology: {
    periodId: 'clim-1991-2020',
    startYear: 1991,
    endYear: 2020,
    initialMonth: 1,
  },
  monthlyLayers: [
    {
      id: 'rain',
      type: 'monthly-climatology',
      quantity: 'rain',
      file: 'rain',
      label: bi,
      periodId: 'clim-1991-2020',
      sources: ['S1'],
    },
  ],
};
const data = {
  entities: [],
  control: { keyframes: [] },
  movements: [],
  events: [
    {
      id: 'site-one',
      kind: 'site',
      at: [103.8, 1.3],
      title: bi,
      summary: bi,
      importance: 1,
    },
  ],
};
function makeStore() {
  const parsed = topicSchema.parse(topic);
  return createSceneStore<ClimatologyExt>({
    chapters,
    defaults: {
      chapter: null,
      camera: null,
      layers: [],
      ...timeSceneEngine.defaults(parsed, undefined),
    } as SceneSnapshot<ClimatologyExt>,
    fromChapterState: timeSceneEngine.fromChapterState,
  });
}
describe('explicit calendar-month schema branch', () => {
  it('accepts static sites and empty control only in climatology', () => {
    expect(climatologyGeoData.safeParse(data).success).toBe(true);
    expect(engineSchemas('time-scene', 'geo', 'climatology').data.safeParse(data).success).toBe(true);
    expect(timeSceneGeoData.safeParse(data).success).toBe(false);
    for (const change of [{ kind: 'battle' }, { t: '2000' }, { until: '2000' }, { unknown: true }])
      expect(
        climatologyGeoData.safeParse({
          ...data,
          events: [{ ...data.events[0], ...change }],
        }).success,
      ).toBe(false);
    expect(
      climatologyGeoData.safeParse({
        ...data,
        control: {
          keyframes: [
            {
              t: '2000',
              features: { type: 'FeatureCollection', features: [] },
            },
          ],
        },
      }).success,
    ).toBe(false);
  });
  it('requires proper topic and month fields, forbids dates and beat index', () => {
    expect(topicSchema.safeParse(topic).success).toBe(true);
    for (const override of [
      { climatology: undefined },
      { stage: 'diagram' },
      { engine: 'space-scene', stage: 'model3d' },
      { datedLayers: [] },
      { climatology: { ...topic.climatology, initialMonth: 13 } },
      { climatology: { ...topic.climatology, endYear: 1990 } },
    ])
      expect(topicSchema.safeParse({ ...topic, ...override }).success).toBe(false);
    expect(climatologyChapterState.safeParse(chapters[1]!.state).success).toBe(true);
    expect(() => validateEngineChapterState('time-scene', 'geo', { month: 1, time: '2000' }, 'monthly fixture', 'climatology')).toThrow(
      'Unrecognized key',
    );
    expect(
      climatologyChapterState.safeParse({
        month: 1,
        index: ['site-one', 'site-one'],
      }).success,
    ).toBe(false);
    expect(
      engineSchemas('time-scene', 'geo', 'climatology').chapterIssues?.(
        { month: 1, highlight: ['site-one'] },
        climatologyGeoData.parse(data),
      ),
    ).toEqual(['highlighted site "site-one" must appear in state.index']);
    expect(timeChapterState.safeParse(chapters[1]!.state).success).toBe(false);
    for (const override of [
      { month: 0 },
      { month: 2.5 },
      { time: '2000' },
      { beats: [{ month: 1, caption: bi, index: [] }] },
      { beats: [{ month: 1, caption: bi, t: '2000' }] },
      { beats: [{ caption: bi }] },
    ])
      expect(
        climatologyChapterState.safeParse({
          ...chapters[1]!.state,
          ...override,
        }).success,
      ).toBe(false);
  });
});
describe('monthly state and URL priorities', () => {
  it('selects chapter first beat atomically and keeps exploration to month only', () => {
    const store = makeStore();
    store.getState().goToChapter('northeast-monsoon');
    expect(store.getState()).toMatchObject({
      month: 12,
      beat: 0,
      t: null,
      camera,
    });
    const before = store.getState().snapshot();
    expect(setClimatologyMonth(store, 7)).toBe(true);
    expect(store.getState().snapshot()).toEqual({ ...before, month: 7 });
    for (const bad of [0, 13, 2.5, NaN, Infinity]) {
      expect(setClimatologyMonth(store, bad)).toBe(false);
      expect(store.getState().month).toBe(7);
    }
    expect(cycleMonth(12, 1)).toBe(1);
    expect(cycleMonth(1, -1)).toBe(12);
    store.getState().applyState(monthlyBeatScene(store, chapters, 'northeast-monsoon', 2));
    expect(store.getState()).toMatchObject({ month: 2, beat: 2, camera });
  });
  it('opens b=3 at index 2, then applies m and removes old time', () => {
    const store = makeStore();
    const decoded = decodeSceneState('?ch=northeast-monsoon&b=3&m=7&t=1942&utm_source=x');
    store.getState().hydrate(monthlyUrlPatch(store, chapters, decoded));
    expect(store.getState()).toMatchObject({
      chapter: 'northeast-monsoon',
      beat: 2,
      month: 7,
      t: null,
      camera,
    });
    const baseline = {
      ...monthlyBeatScene(store, chapters, 'northeast-monsoon', 2),
      beat: 0,
    };
    expect(mergeSearch('?utm_source=x&t=1942', encodeSceneState(store.getState().snapshot(), baseline))).toBe(
      '?ch=northeast-monsoon&b=3&m=7&utm_source=x',
    );
    for (const bad of ['0', '13', '2.5', '', 'NaN']) {
      const patch = monthlyUrlPatch(store, chapters, decodeSceneState(`?ch=northeast-monsoon&b=3&m=${bad}`));
      expect(patch).toMatchObject({ beat: 2, month: 2 });
    }
    store.getState().goToChapter('same-month');
    expect(monthlyUrlPatch(store, chapters, decodeSceneState('?m=7'))).toMatchObject({ chapter: 'background', beat: 0, month: 7 });
    for (const bad of ['0', '99', 'bad'])
      expect(monthlyUrlPatch(store, chapters, decodeSceneState(`?ch=northeast-monsoon&b=${bad}&m=13`))).toMatchObject({
        beat: 0,
        month: 12,
      });
  });
  it('keeps reverse and same-month authored order, each with an independent axis tick', () => {
    const beats = buildBeats(chapters, (c) => (c.state as any).beats);
    expect(beats.filter((b) => b.chapter === 'northeast-monsoon').map((b) => (b.spec as any).month)).toEqual([12, 1, 2, 2]);
    expect(beats.filter((b) => b.chapter === 'same-month')).toHaveLength(4);
    expect([0, 1, 2, 3].map((i) => tickPosition(i, 4))).toEqual([0.125, 0.375, 0.625, 0.875]);
    expect(stepBeat(beats, 'background', 1, true, 1)).toBe(2);
  });
});
