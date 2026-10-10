/**
 * SpaceScene descriptor (client-safe, synchronous). The view is lazy-loaded.
 * Phase 2 replaces `./View` with Model3DStage + Explorer.
 */
import { defineEngine } from '../core/engine';
import type { ChapterState } from '../core/types';
import type { SpaceSceneData, SpaceView } from './schema';

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
  /** Group soloed from the control panel (the rest drawn faint); reset by a chapter change, never in the URL. */
  solo: string | null;
}

const KEBAB = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const isId = (v: unknown): v is string => typeof v === 'string' && KEBAB.test(v);

function isView(value: unknown): value is SpaceView {
  return typeof value === 'string' && (SPACE_VIEW_IDS as readonly string[]).includes(value);
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

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
    return out;
  },
  load: () => import('./View'),
});
