import { describe, expect, it, vi } from 'vitest';
import { activateFlyTo } from '../src/engines/core/flyto';
import { createSceneStore } from '../src/engines/core/store';
import type { Chapter, GeoCamera } from '../src/engines/core/types';
import type { TimeSceneExt } from '../src/engines/time-scene';
import { eventSelectionPatch } from '../src/engines/time-scene/lib/reader';
import { eventSchema } from '../src/engines/time-scene/schema';

const text = { en: 'Object', zh: '对象' };
const chapter: Chapter = { id: 'chapter-one', order: 1, title: text, sensitive: false, quiz: [], state: {} };
const camera: GeoCamera = { center: [90, 10], zoom: 3, bearing: 20, pitch: 15 };

describe('delegated chapter-body FlyTo action', () => {
  it.each(['site', 'milestone'] as const)('selects a %s, reveals its detail, and keeps the authored preset framing', (kind) => {
    const event = eventSchema.parse({ id: 'event-one', kind, t: '1415-10-01', at: [118.8, 32.1], title: text, summary: text, importance: 1 });
    const store = createSceneStore<TimeSceneExt>({ chapters: [chapter], defaults: { chapter: null, camera: null, t: '1405', layers: ['base'], highlight: [] } });
    let selected: string | null = null;
    let readerOpen = false;
    // The real view clears selections for state transitions, but keeps them for presets.
    store.subscribe((state, previous) => {
      if (state.transition.id !== previous.transition.id && state.transition.reason === 'state') selected = null;
    });
    const selectEvent = (id: string) => {
      const patch = eventSelectionPatch(store.getState(), [event], id);
      if (!patch) return false;
      store.getState().applyState(patch);
      selected = id;
      readerOpen = true;
      return true;
    };
    const setPreset = vi.fn((id: string) => {
      expect(id).toBe('view-indian-ocean');
      store.getState().applyCameraPreset(camera);
      return true;
    });
    const fold = vi.fn();
    expect(activateFlyTo({ flyto: 'view-indian-ocean', timeTarget: event.id }, { selectEvent }, setPreset, fold)).toBe(true);
    expect(selected).toBe(event.id);
    expect(readerOpen).toBe(true);
    expect(store.getState().highlight).toEqual([event.id]);
    expect(store.getState().layers).toContain(kind === 'site' ? 'sites' : 'battles');
    expect(store.getState().t).toBe(kind === 'site' ? '1405' : event.t);
    expect(store.getState().camera).toEqual(camera);
    expect(store.getState().chapter).toBe(chapter.id);
    expect(fold).not.toHaveBeenCalled();
  });

  it('keeps ordinary FlyTo camera navigation and its mobile sheet behavior', () => {
    const selectEvent = vi.fn();
    const setPreset = vi.fn(() => true);
    const fold = vi.fn();
    expect(activateFlyTo({ flyto: 'view-china' }, { selectEvent }, setPreset, fold)).toBe(true);
    expect(selectEvent).not.toHaveBeenCalled();
    expect(setPreset).toHaveBeenCalledWith('view-china');
    expect(fold).toHaveBeenCalledOnce();
  });

  it('does not move the camera or fold the reader when selection is rejected or unsupported', () => {
    for (const controls of [{}, { selectEvent: () => false }]) {
      const setPreset = vi.fn();
      const fold = vi.fn();
      expect(activateFlyTo({ flyto: 'view-china', timeTarget: 'missing-or-presenting' }, controls, setPreset, fold)).toBe(false);
      expect(setPreset).not.toHaveBeenCalled();
      expect(fold).not.toHaveBeenCalled();
    }
  });
});
