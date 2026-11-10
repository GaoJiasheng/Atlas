/**
 * Chapter targets of the date-free TimeScene modes, kept apart from lib/geography.ts and
 * lib/climatology-state.ts so the engine definition (index.ts, on every TimeScene page) does not
 * pull those modules into the main bundle; they load with their own views.
 */
import type { ChapterState, SceneSnapshot } from '../../core/types';
import type { GeographyChapterState } from '../geography-schema';
import type { ClimatologyChapterState } from '../schema';
import type { ClimatologyExt } from './climatology-state';

/** A geography chapter's target is its first beat (context, selection, highlight, camera, layers). */
export function geographyChapterFields(raw: ChapterState) {
  const s = raw as GeographyChapterState;
  const b = s.beats?.[0];
  return {
    t: null,
    month: undefined,
    beat: 0,
    geoContext: b?.geoContext ?? s.geoContext,
    geoSelection: b ? b.selection : s.selection,
    highlight: b?.highlight ?? s.highlight ?? [],
    ...(b?.camera ? { camera: b.camera } : {}),
    ...(b?.layers ? { layers: b.layers } : {}),
  };
}

/** Chapter targets themselves are the first authored beat, including its camera. */
export function monthlyChapterFields(raw: ChapterState): Partial<SceneSnapshot<ClimatologyExt>> {
  const state = raw as ClimatologyChapterState;
  const first = state.beats?.[0];
  return {
    t: null,
    beat: 0,
    month: first?.month ?? state.month,
    ...(first?.camera ? { camera: first.camera } : {}),
    ...(first?.layers ? { layers: first.layers } : {}),
    highlight: first?.highlight ?? state.highlight ?? [],
  };
}
