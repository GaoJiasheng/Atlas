/**
 * MathScene descriptor (docs/15 §4): an interactive lesson with practice —
 * a step per chapter, sub-steps (tasks) the child works on an SVG stage,
 * and a practice chapter. Client-safe and synchronous; the view is lazy.
 * Store fields: `task` (1-based sub-step or question, URL `task`) and
 * `model` (the VIEW group's model, URL `model`; `null` = the sub-step's own).
 * Answers never go into the store, the URL or storage (D6).
 */
import { defineEngine } from '../core/engine';
import type { ChapterState } from '../core/types';
import type { MathSceneData, ModelView } from './schema';

export const MODEL_VIEW_IDS: readonly ModelView[] = ['bar', 'circle', 'numberline', 'wall', 'barmodel'];

export interface MathSceneExt {
  /** Sub-step of the step (or practice question), 1-based. Every chapter starts at 1. */
  task: number;
  /** Model view picked in the VIEW group; `null` = the sub-step's own model (or the chapter's `state.model`). */
  model: ModelView | null;
}

const isView = (v: unknown): v is ModelView => typeof v === 'string' && (MODEL_VIEW_IDS as readonly string[]).includes(v);

export const mathSceneEngine = defineEngine<MathSceneExt, MathSceneData>({
  id: 'math-scene',
  defaults() {
    return { task: 1, model: null };
  },
  fromChapterState(state: ChapterState) {
    // Not cumulative: every chapter opens on its first sub-step with its own model.
    return { task: 1, model: isView(state.model) ? state.model : null };
  },
  fromUrl(fields) {
    const out: Partial<MathSceneExt> = {};
    // The range is checked by the view against the lesson (an index past the end shows the last sub-step).
    if (fields.task !== undefined && Number.isInteger(fields.task) && fields.task >= 1) out.task = fields.task;
    if (fields.model === null || isView(fields.model)) out.model = fields.model;
    return out;
  },
  load: () => import('./View'),
});
