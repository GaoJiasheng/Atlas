/**
 * TimeScene descriptor (client-safe, synchronous). The view is lazy-loaded.
 * Phase 2 replaces `./View` with GeoStage + Timeline; this file's contract
 * (extension fields and chapter-state mapping) should stay stable.
 */
import { defineEngine } from '../core/engine';
import type { ChapterState, TimePoint } from '../core/types';
import type { TimeSceneGeoData } from './schema';
import { isGeoTime } from '../../lib/time';
import { geographyChapterFields } from './lib/geography';
import { monthlyChapterFields } from './lib/climatology-state';

/** TimeScene's fields on top of SceneState. `t` is in the URL. */
export interface TimeSceneExt {
  /** Current time on the axis. */
  t: TimePoint | null;
  month?: number;
  geoContext?: import('./lib/geography').GeoContext;
  geoSelection?: string | null;
  beat?: number | null;
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
    if (_topic.temporalMode === 'geography') return { t:null, month:undefined, beat:0, geoContext:_topic.geography!.initialContext, geoSelection:null, highlight:[], layers:['base','geo-countries'] };
    if (_topic.temporalMode === 'climatology') return { t: null, month: _topic.climatology!.initialMonth, beat: 0, highlight: [], layers: ['base', 'sites'] };
    const first = data && 'control' in data ? data.control.keyframes[0]?.t : undefined;
    return { t: first ?? null, highlight: [], layers: ['base', 'control', 'movements', 'battles'] };
  },
  fromChapterState(state: ChapterState) {
    if (state.geoContext) return geographyChapterFields(state);
    if (typeof state.month === 'number') return monthlyChapterFields(state);
    const out: Partial<TimeSceneExt> = {};
    const t = asTimePoint(state.time);
    if (t) out.t = t;
    if (Array.isArray(state.highlight)) out.highlight = state.highlight.filter((h): h is string => typeof h === 'string');
    return out;
  },
  fromUrl(fields, topic) {
    if (topic?.temporalMode === 'geography') return {t:null,geoContext:fields.geoContext,beat:fields.beat,highlight:fields.highlight};
    if (topic?.temporalMode === 'climatology') return { t: null, ...(fields.month !== undefined ? {month: fields.month}: {}), ...(fields.beat !== undefined ? {beat: fields.beat} : {}), ...(fields.highlight !== undefined ? {highlight: fields.highlight}: {}) };
    const out: Partial<TimeSceneExt> = {};
    if (fields.t !== undefined) out.t = fields.t;
    if (fields.highlight !== undefined) out.highlight = fields.highlight;
    return out;
  },
  load: () => import('./View'),
});
