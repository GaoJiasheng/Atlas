import { describe, expect, it } from 'vitest';
import { engineSchemas } from '../../src/engines/schemas';
import { eventSchema, timeChapterIndexIssues, timeChapterRefs, timeChapterState } from '../../src/engines/time-scene/schema';
import { eventSelectionPatch, readerHighlight } from '../../src/engines/time-scene/lib/reader';
import type { SceneSnapshot } from '../../src/engines/core/types';
import type { TimeSceneExt } from '../../src/engines/time-scene';

const text = { en: 'Test event', zh: '测试事件' };
const site = eventSchema.parse({ id: 'loc-new-orleans', t: '1760', at: [-90.07, 29.95], kind: 'site', title: text, summary: text, importance: 1 });
const census = eventSchema.parse({ ...site, id: 'ev-us-census-enslavement', t: '1860', kind: 'milestone' });
const cable = eventSchema.parse({ ...site, id: 'ev-cable-completion', t: '1870-12-31', kind: 'milestone' });
const events = [site, census, cable];
const initial: SceneSnapshot<TimeSceneExt> = { chapter: 'cotton', t: '1833', camera: { center: [0, 50], zoom: 4.4, pitch: 20, bearing: 10 }, layers: ['base', 'rail-rshapes'], highlight: ['loc-glasgow'] };

describe('TimeScene reader index schema', () => {
  it('is optional, chapter-local, and event-only (site and milestone included)', () => {
    expect(timeChapterState.parse({}).index).toBeUndefined();
    const valid = timeChapterState.parse({ index: events.map((e) => e.id), highlight: ['rail-rshapes'] });
    expect(timeChapterIndexIssues(valid, { events })).toEqual([]);
    expect(timeChapterRefs(valid)).toEqual(['rail-rshapes']);
    // The runtime reads index on the current chapter, never on its cumulative target.
    expect(timeChapterState.parse({ time: '1830' }).index ?? []).toEqual([]);
  });

  it('reports one duplicate error at the second target', () => {
    const parsed = timeChapterState.safeParse({ index: ['loc-pawtucket', 'loc-pawtucket'] });
    expect(parsed.success).toBe(false);
    if (!parsed.success) expect(parsed.error.issues.map((issue) => issue.path)).toEqual([['index', 1]]);
  });

  it.each(['rail-rshapes', 'entity-britain', 'movement-cotton', 'other-topic-event', 'unknown-id'])('rejects non-event %s at its exact field', (id) => {
    expect(timeChapterIndexIssues(timeChapterState.parse({ index: [id] }), { events })).toEqual([`state.index.0: unknown event "${id}"`]);
  });

  it('registers the event-only reference check with the content validator', () => {
    const schemas = engineSchemas('time-scene', 'geo');
    expect(schemas.chapterIssues?.({ index: ['rail-rshapes'] }, { events })).toEqual(['state.index.0: unknown event "rail-rshapes"']);
  });

  it('does not allow index on a beat', () => {
    expect(timeChapterState.safeParse({ beats: [{ caption: text, index: [site.id] }] }).success).toBe(false);
  });
});

describe('TimeScene reader selection', () => {
  it('opens a site at its location without changing the chapter or time', () => {
    const patch = eventSelectionPatch(initial, events, site.id)!;
    const next = { ...initial, ...patch };
    expect(next.chapter).toBe('cotton');
    expect(next.t).toBe('1833');
    expect(next.layers).toEqual(['base', 'rail-rshapes', 'sites']);
    expect(next.highlight).toEqual([site.id]);
    expect(next.camera).toEqual({ center: site.at, zoom: 4.4, pitch: 20, bearing: 10 });
    expect(patch).not.toHaveProperty('chapter');
    expect(patch).not.toHaveProperty('t');
  });

  it('opens an event at its exact authored date and retains camera orientation', () => {
    const next = { ...initial, ...eventSelectionPatch(initial, events, census.id) };
    expect(next.t).toBe('1860');
    expect(next.chapter).toBe('cotton');
    expect(next.layers).toContain('battles');
    expect(next.highlight).toEqual([census.id]);
    expect(next.camera).toEqual({ center: census.at, zoom: 4.4, pitch: 20, bearing: 10 });
    expect(eventSelectionPatch(initial, events, cable.id)?.t).toBe('1870-12-31');
  });

  it('does not duplicate an already visible layer or mutate its inputs', () => {
    const state = { ...initial, layers: ['base', 'sites'] };
    const before = structuredClone({ state, events });
    const patch = eventSelectionPatch(state, events, site.id)!;
    expect(patch.layers).toEqual(['base', 'sites']);
    expect({ state, events }).toEqual(before);
    expect(patch.layers).not.toBe(state.layers);
    expect((patch.camera as { center: number[] }).center).not.toBe(site.at);
  });

  it('rejects unknown ids and presentation selection with zero state changes', () => {
    const before = structuredClone(initial);
    expect(eventSelectionPatch(initial, events, 'unknown-id')).toBeNull();
    expect(eventSelectionPatch(initial, events, site.id, true)).toBeNull();
    expect(initial).toEqual(before);
  });

  it('can center a topic whose chapter has no authored camera', () => {
    expect(eventSelectionPatch({ ...initial, camera: null }, events, site.id)?.camera).toEqual({ center: site.at, zoom: 1.4 });
  });

  it('restores the applied second beat highlight, then falls back after a time or chapter change', () => {
    const beat = { chapter: 'steam', index: 1, highlight: ['loc-glasgow'] };
    expect(readerHighlight('steam', beat, ['loc-dudley', 'loc-birmingham'])).toEqual(['loc-glasgow']);
    expect(readerHighlight('cotton', beat, ['loc-pawtucket'])).toEqual(['loc-pawtucket']);
    expect(readerHighlight('steam', null, ['loc-dudley', 'loc-birmingham'])).toEqual(['loc-dudley', 'loc-birmingham']);
  });
});
