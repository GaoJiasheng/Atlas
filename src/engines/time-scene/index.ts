/**
 * TimeScene descriptor (client-safe, synchronous). The view is lazy-loaded.
 * Phase 2 replaces `./View` with GeoStage + Timeline; this file's contract
 * (extension fields and chapter-state mapping) should stay stable.
 */
import { defineEngine } from '../core/engine';
import type { ChapterState, TimePoint } from '../core/types';
import type { TimeSceneGeoData } from './schema';
import { isGeoTime } from '../../lib/time';

/** TimeScene's fields on top of SceneState. `t` is in the URL. */
export interface TimeSceneExt {
  /** Current time on the axis. */
  t: TimePoint | null;
  /** Ids (events, movements, entities) the current chapter emphasises. */
  highlight: string[];
}

function asTimePoint(value: unknown): TimePoint | null {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object' && isGeoTime(value as TimePoint)) return value as TimePoint;
  return null;
}

export const timeSceneEngine = defineEngine<TimeSceneExt, TimeSceneGeoData>({
  id: 'time-scene',
  defaults(_topic, data) {
    const first = data && 'control' in data ? data.control.keyframes[0]?.t : undefined;
    return { t: first ?? null, highlight: [], layers: ['base', 'control', 'movements', 'battles'] };
  },
  fromChapterState(state: ChapterState) {
    const out: Partial<TimeSceneExt> = {};
    const t = asTimePoint(state.time);
    if (t) out.t = t;
    if (Array.isArray(state.highlight)) out.highlight = state.highlight.filter((h): h is string => typeof h === 'string');
    return out;
  },
  fromUrl(fields) {
    const out: Partial<TimeSceneExt> = {};
    if (fields.t !== undefined) out.t = fields.t;
    if (fields.highlight !== undefined) out.highlight = fields.highlight;
    return out;
  },
  load: () => import('./View'),
});
