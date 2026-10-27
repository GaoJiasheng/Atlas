import { timeBeatScene, timeLinkedBeatPatch } from '../../src/engines/time-scene/lib/beatScene';
import { encodeSceneState } from '../../src/engines/core/url-state';
import type { Beat } from '../../src/engines/core/presentation';
import type { TimeBeat } from '../../src/engines/time-scene/schema';
import type { SceneSnapshot } from '../../src/engines/core/types';
import type { TimeSceneExt } from '../../src/engines/time-scene';
import { describe, expect, it } from 'vitest';
import type { z } from 'zod';
import { eventSchema, timeSceneGeoData } from '../../src/engines/time-scene/schema';
import { timePresentation } from '../../src/content/schema/topic';
import { buildTimeModel } from '../../src/engines/time-scene/lib/model';
import { frameAt } from '../../src/engines/time-scene/lib/frame';
import { frameStats } from '../../src/engines/time-scene/lib/stats';
import { hasMapAnchor, missionBadge, missionContext, missionChapterIndex } from '../../src/engines/time-scene/lib/missions';
import { toNumber } from '../../src/engines/time-scene/lib/time';
import entities from '../../src/content/topics/sample-missions/data/entities.json';
import control from '../../src/content/topics/sample-missions/data/control.json';
import movements from '../../src/content/topics/sample-missions/data/movements.json';
import events from '../../src/content/topics/sample-missions/data/events.json';
import sources from '../../src/content/topics/sample-missions/data/sources.json';

const presentation = { mode: 'missions', showArea: false, eventsLabel: { en: 'Events', zh: '事件' }, entityLabel: { en: 'Programmes', zh: '项目' } } as const;
const raw = { entities, control, movements, events, sources };
const data = timeSceneGeoData.parse(raw);
const model = buildTimeModel(data, [], { timePresentation: presentation });
const lunar = events[1]!;
const fresh = () => structuredClone(raw) as unknown as z.input<typeof timeSceneGeoData>;
function issues(value: unknown) {
  const parsed = timeSceneGeoData.safeParse(value);
  expect(parsed.success).toBe(false);
  return parsed.success ? [] : parsed.error.issues.map((issue) => issue.path.join('.'));
}

describe('mission evidence contract', () => {
  it.each([
    ['1969-07-19', 0, 0, 0],
    ['1969-07-20', 2, 2, 2],
    ['1969-07-21', 3, 1, 2],
    ['1969-07-22', 3, 0, 2],
  ] as const)('%s: recorded %i, active %i, mapped %i', (date, recordedEvents, activeEvents, mapped) => {
    const frame = frameAt(model, toNumber(date));
    expect(frameStats(model, frame)).toMatchObject({ recordedEvents, activeEvents, activeBattles: 0, entities: 2 });
    expect(frame.events.filter((item) => hasMapAnchor(data.events.find((event) => event.id === item.id)!))).toHaveLength(mapped);
  });
  it('never reveals a future mission from a highlight', () => {
    expect(frameAt(model, toNumber('1969-07-19'), [lunar.id]).events).toHaveLength(0);
  });
  it('preserves mission semantics and exact anchor coordinates through normalisation', () => {
    expect(model.events[0]!.missionContext).toEqual(data.events[1]!.missionContext);
    expect(missionContext(model, lunar.id)).toEqual({
      setting: 'moon-surface', anchorRole: 'associated-launch-centre', anchorSite: 'site-fixture-centre', relatedSites: [],
      occurredAt: '1969-07-20T20:17:39Z', at: [-80.64861111111112, 28.52472222222222],
    });
    expect(missionContext(model, 'fixture-retrospective')).toBeNull();
    expect(missionContext(model, 'unknown')).toBeNull();
  });
  it('returns detached QA arrays so callers cannot mutate the source', () => {
    const reading = missionContext(model, lunar.id)!;
    reading.at![0] = 0;
    reading.relatedSites.push('not-a-site');
    expect(missionContext(model, lunar.id)!.at![0]).toBe(-80.64861111111112);
    expect(missionContext(model, lunar.id)!.relatedSites).toEqual([]);
  });
  it('puts the actual setting and map-anchor role in both badge languages', () => {
    expect(missionBadge(data.events[1]!, 'en')).toBe('Moon surface · associated launch centre');
    expect(missionBadge(data.events[1]!, 'zh')).toBe('月面任务 · 关联发射中心');
    const suborbital = eventSchema.parse({ ...lunar, missionContext: { ...lunar.missionContext!, setting: 'suborbital' } });
    expect(missionBadge(suborbital, 'zh')).toContain('亚轨道飞行');
  });
  it('excludes unlocated evidence from map bounds even if at is supplied', () => {
    const altered = fresh();
    altered.events[3]!.at = [170, -50];
    const other = buildTimeModel(timeSceneGeoData.parse(altered), [], { timePresentation: presentation });
    expect(other.bounds).toEqual(model.bounds);
    expect(hasMapAnchor(other.events[2]!.event)).toBe(false);
  });
  it('indexes independent outcomes and their deduplicated associated sites in chapter order', () => {
    expect(missionChapterIndex(data.events, { beats: [{ highlight: [lunar.id, 'fixture-orbit-outcome'] }, { highlight: ['fixture-retrospective', lunar.id] }] }).map((event) => event.id))
      .toEqual([lunar.id, 'fixture-orbit-outcome', 'fixture-retrospective', 'site-fixture-centre']);
  });
  it('counts a docking once with two associated centres', () => {
    const value = fresh();
    value.events.push({ ...value.events[0]!, id: 'site-second', at: [63.3051, 45.9648] });
    value.events[1]!.missionContext!.relatedSites = ['site-second'];
    value.events[1]!.missionContext!.setting = 'earth-orbit';
    value.events = value.events.filter((event) => event.id !== 'fixture-orbit-outcome' && event.id !== 'fixture-retrospective');
    const docking = buildTimeModel(timeSceneGeoData.parse(value), [], { timePresentation: presentation });
    expect(frameStats(docking, frameAt(docking, toNumber('1969-07-20'))).recordedEvents).toBe(1);
    expect(missionContext(docking, lunar.id)!.relatedSites).toEqual(['site-second']);
    expect(missionChapterIndex(docking.sites.concat(docking.events.map((item) => item.event)), { highlight: [lunar.id] }).map((event) => event.id)).toEqual([lunar.id, 'site-fixture-centre', 'site-second']);
  });
});

describe('strict mission schema and cross references', () => {
  it('rejects a UTC date mismatch at the context timestamp path', () => {
    const value = fresh(); value.events[1]!.missionContext!.occurredAt = '1969-07-21T20:17:39Z';
    expect(issues(value)).toContain('events.1.missionContext.occurredAt');
  });
  it.each(['1969-02-30T20:17:39Z', '1969-07-20T24:00:00Z', '1969-07-20T20:17:39+00:00', '1969-07-20T20:17:60Z'])('rejects malformed UTC timestamp %s', (occurredAt) => {
    expect(eventSchema.safeParse({ ...lunar, missionContext: { ...lunar.missionContext!, occurredAt } }).success).toBe(false);
  });
  it.each(['1969', '1969-07', { ma: 1 }])('rejects mission date precision %j', (t) => {
    expect(eventSchema.safeParse({ ...lunar, t }).success).toBe(false);
  });
  it('requires at least one mission source', () => {
    expect(eventSchema.safeParse({ ...lunar, sources: [] }).success).toBe(false);
    expect(eventSchema.safeParse({ ...lunar, sources: undefined }).success).toBe(false);
  });
  it('rejects missing mission context and a nonmission carrying one', () => {
    expect(eventSchema.safeParse({ ...lunar, missionContext: undefined }).success).toBe(false);
    expect(eventSchema.safeParse({ ...lunar, kind: 'political' }).success).toBe(false);
  });
  it.each(['missing-site', 'fixture-orbit-outcome'])('rejects unknown/non-site anchor %s', (anchorSite) => {
    const value = fresh(); value.events[1]!.missionContext!.anchorSite = anchorSite;
    expect(issues(value)).toContain('events.1.missionContext.anchorSite');
  });
  it('rejects a 0.1 degree longitude displacement', () => {
    const value = fresh(); value.events[1]!.at![0]! += .1;
    expect(issues(value)).toContain('events.1.at');
  });
  it('accepts coordinate error at the stated tolerance and rejects beyond it', () => {
    const value = fresh(); value.events[1]!.at![0]! += .000009;
    expect(timeSceneGeoData.safeParse(value).success).toBe(true);
    value.events[1]!.at![0]! += .000002;
    expect(issues(value)).toContain('events.1.at');
  });
  it('cross-validates programme and source ids', () => {
    const value = fresh(); value.events[1]!.missionContext!.programme = 'missing-programme'; value.events[1]!.sources = ['S99'];
    expect(issues(value)).toEqual(expect.arrayContaining(['events.1.missionContext.programme', 'events.1.sources.0']));
  });
  it.each([['site-fixture-centre'], ['missing-site'], ['one', 'one'], ['a', 'b', 'c', 'd']])('rejects invalid related sites %j', (...relatedSites) => {
    const value = fresh(); value.events[1]!.missionContext!.relatedSites = relatedSites;
    expect(timeSceneGeoData.safeParse(value).success).toBe(false);
  });
  it('rejects missing/unknown settings, anchor roles, and extra context keys', () => {
    for (const patch of [{ setting: undefined }, { setting: 'moon' }, { anchorRole: 'landing-site' }, { extra: true }])
      expect(eventSchema.safeParse({ ...lunar, missionContext: { ...lunar.missionContext!, ...patch } }).success).toBe(false);
  });
  it.each(['mission', 'site', 'battle', 'landing', 'bombing'])('forbids timeline-only %s events', (kind) => {
    expect(eventSchema.safeParse({ ...lunar, kind, mapVisibility: 'timeline-only' }).success).toBe(false);
  });
  it('allows a coordinate-less timeline-only political record, but requires at for anchored records', () => {
    expect(eventSchema.safeParse(events[3]).success).toBe(true);
    expect(eventSchema.safeParse({ ...events[3], mapVisibility: 'anchor' }).success).toBe(false);
  });
});

describe('opt-in mission presentation', () => {
  it('requires false showArea, both nonempty languages and no unknown options', () => {
    expect(timePresentation.safeParse(presentation).success).toBe(true);
    for (const patch of [{ showArea: true }, { eventsLabel: { en: 'Events', zh: '' } }, { entityLabel: { en: '', zh: '项目' } }, { extra: true }])
      expect(timePresentation.safeParse({ ...presentation, ...patch }).success).toBe(false);
  });
  it('keeps legacy min-window behaviour when omitted, and exact dates when opted in', () => {
    const legacy = buildTimeModel(data, []);
    expect(legacy.timePresentation).toBeUndefined();
    expect([...model.entities.keys()]).toEqual(['programme-a', 'programme-b']);
    expect(frameAt(model, toNumber('1969-07-21')).events.filter((event) => event.active).map((event) => event.id)).toEqual(['fixture-retrospective']);
  });
});


describe('mission beat state and existing b URL key', () => {
  const target: SceneSnapshot<TimeSceneExt> = { chapter: 'dated-evidence', t: '1969-07-19', beat: 0, highlight: [], layers: ['base', 'battles'], camera: { center: [0, 20], zoom: 1 } };
  const beat: Beat<TimeBeat> = { chapter: 'dated-evidence', chapterIndex: 1, index: 1, count: 3, caption: { en: 'Lunar evidence', zh: '月面证据' }, spec: { t: '1969-07-20', highlight: ['fixture-lunar-outcome'], caption: { en: 'Lunar evidence', zh: '月面证据' } } };
  it('uses one scene for presentation, map ticks and phone controls', () => {
    expect(timeBeatScene(target, beat, true)).toMatchObject({ t: '1969-07-20', beat: 1, highlight: ['fixture-lunar-outcome'], camera: target.camera });
  });
  it('keeps explicit link fields while filling missing beat fields', () => {
    const scene = timeBeatScene(target, beat, true);
    expect(timeLinkedBeatPatch(scene, ['t', 'camera'])).toEqual({ highlight: ['fixture-lunar-outcome'], layers: ['base', 'battles'] });
  });
  it('writes only ch/b for the exact beat using its scene as the URL baseline', () => {
    const scene = timeBeatScene(target, beat, true);
    expect(encodeSceneState(scene, { ...scene, beat: target.beat })).toEqual([['ch', 'dated-evidence'], ['b', '2']]);
    expect(encodeSceneState(target, target)).toEqual([['ch', 'dated-evidence']]);
  });
  it('does not add a beat field to legacy topic beat states', () => {
    const { beat: _beat, ...legacy } = target;
    expect(timeBeatScene(legacy, beat, false)).not.toHaveProperty('beat');
  });
});
