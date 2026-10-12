/**
 * SpaceScene descriptor (client-safe, synchronous). The view is lazy-loaded.
 * Phase 2 replaces `./View` with Model3DStage + Explorer.
 */
import { defineEngine } from '../core/engine';
import type { ChapterState } from '../core/types';
import type { SpaceSceneData, SpaceView } from './schema';
import { EXERCISE_PHASES, type ExercisePhase } from '../../lib/anatomy';

export const SPACE_VIEW_IDS: readonly SpaceView[] = ['assembled', 'xray', 'exploded', 'isolate'];

/** SpaceScene's fields on top of SceneState (docs/03 §B Explorer). */
export interface SpaceSceneExt {
  part: string | null;
  view: SpaceView;
  explode: number;
  run: boolean;
  /** `none`, `half` (the default plane) or the name of a cut in `views.cuts`. */
  cutaway: string;
  /** Parts put aside (chapter / beat `hide`; not cumulative, never in the URL). */
  hidden: string[];
  /** Pose on show (`parts.json` `poses`; chapter / beat `pose`, not cumulative; URL `pose`). */
  pose: string | null;
  /** Groups or parts drawn faint (chapter / beat `ghost`; not cumulative, never in the URL). */
  ghosted: string[];
  /**
   * Group soloed from the control panel, or a part soloed from the inspector
   * (SOLO: that part, the parts it connects and the shells stay; the rest
   * drawn faint); reset by a chapter change, never in the URL.
   */
  solo: string | null;
  /** Exercise mode (chapter / beat `exercise`, or an exercise chip; not cumulative, never in the URL); `bones`: the skeleton stays on show over the mannequin. */
  exercise: { id: string; phase: ExercisePhase; bones?: true } | null;
  /**
   * Signal / cold tints (chapter / beat `highlight`; exercise mode adds its own; not cumulative, never
   * in the URL: the store's `highlight` is TimeScene's URL field, hence the other name).
   */
  tints: { signal: string[]; cold: string[] } | null;
  /** Muscle parts whose origin / insertion markers show (chapter / beat `sites`; not cumulative). */
  sites: string[];
  /**
   * The beat of the current chapter on show (0-based index into its `beats`;
   * a chapter without beats has one, 0), applied by the chapter axis, the
   * `,` / `.` keys, the reading panel's beat line or the presentation; `null`
   * = the chapter's own state (deep links without `b`, instant chapter
   * changes). Not cumulative. URL `b` (1-based).
   */
  beat: number | null;
  /** A muscle sheet's ACTIONS demo on show: that part's joint swinging through the movement (never in the URL). */
  demo: { part: string; joint: string; movement: string } | null;
}

const KEBAB = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const isId = (v: unknown): v is string => typeof v === 'string' && KEBAB.test(v);

function isView(value: unknown): value is SpaceView {
  return typeof value === 'string' && (SPACE_VIEW_IDS as readonly string[]).includes(value);
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/** A chapter / beat `exercise` (`{ id, phase? }`), or null. */
export function exerciseOf(value: unknown): SpaceSceneExt['exercise'] {
  if (!value || typeof value !== 'object') return null;
  const { id, phase, bones } = value as { id?: unknown; phase?: unknown; bones?: unknown };
  if (!isId(id)) return null;
  return { id, phase: (EXERCISE_PHASES as readonly unknown[]).includes(phase) ? (phase as ExercisePhase) : 'loop', ...(bones === true ? { bones: true as const } : {}) };
}

/** A chapter / beat `highlight` (`{ signal?, cold? }`), or null. */
export function highlightOf(value: unknown): SpaceSceneExt['tints'] {
  if (!value || typeof value !== 'object') return null;
  const { signal, cold } = value as { signal?: unknown; cold?: unknown };
  const ids = (v: unknown) => (Array.isArray(v) ? v.filter(isId) : []);
  return { signal: ids(signal), cold: ids(cold) };
}

export const spaceSceneEngine = defineEngine<SpaceSceneExt, SpaceSceneData>({
  id: 'space-scene',
  defaults(_topic, data) {
    return {
      part: null,
      view: 'assembled',
      explode: 0,
      run: false,
      cutaway: 'none',
      hidden: [],
      pose: null,
      ghosted: [],
      solo: null,
      exercise: null,
      tints: null,
      sites: [],
      demo: null,
      beat: null,
      // All groups visible by default.
      layers: data ? data.parts.groups.map((g) => g.id) : [],
    };
  },
  fromChapterState(state: ChapterState) {
    const out: Partial<SpaceSceneExt> = {};
    if (state.part === null || typeof state.part === 'string') out.part = state.part;
    if (isView(state.view)) out.view = state.view;
    if (typeof state.explode === 'number') out.explode = clamp01(state.explode);
    if (typeof state.run === 'boolean') out.run = state.run;
    if (isId(state.cutaway)) out.cutaway = state.cutaway;
    // Not cumulative: a chapter without `hide` shows every part, without `pose` is at rest, without `ghost` draws all solid.
    out.hidden = Array.isArray(state.hide) ? state.hide.filter((id): id is string => typeof id === 'string') : [];
    out.pose = isId(state.pose) ? state.pose : null;
    out.ghosted = Array.isArray(state.ghost) ? state.ghost.filter(isId) : [];
    out.exercise = exerciseOf(state.exercise);
    out.tints = highlightOf(state.highlight);
    out.sites = Array.isArray(state.sites) ? state.sites.filter(isId) : [];
    out.demo = null;
    out.beat = null;
    return out;
  },
  fromUrl(fields) {
    const out: Partial<SpaceSceneExt> = {};
    if (fields.part !== undefined) out.part = fields.part;
    if (isView(fields.view)) out.view = fields.view;
    if (fields.explode !== undefined) out.explode = clamp01(fields.explode);
    if (fields.run !== undefined) out.run = fields.run;
    if (isId(fields.cutaway)) out.cutaway = fields.cutaway;
    if (fields.pose === null || isId(fields.pose)) out.pose = fields.pose;
    if (fields.beat === null || (typeof fields.beat === 'number' && Number.isInteger(fields.beat) && fields.beat >= 0)) out.beat = fields.beat;
    return out;
  },
  load: () => import('./View'),
});
