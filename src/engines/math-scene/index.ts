/**
 * MathScene descriptor (docs/15 §4, §10): an explanation-first lesson — a
 * step per chapter, told in beats on an SVG stage, each chapter ending in one
 * short check drawn from a pool — and a practice chapter. Client-safe and
 * synchronous; the view is lazy.
 * Store fields: `beat` (0-based beat of the chapter on show, URL `b` 1-based;
 * in a step the check is the beat after the last explanation beat, in the
 * practice beat k is question k + 1) and `model` (the VIEW group's model on
 * the check, URL `model`; `null` = the task's own). Which pool task is drawn
 * and every answer stay out of the store, the URL and storage (D6).
 */
import { defineEngine } from '../core/engine';
import type { MathSceneData, ModelView } from './schema';

export const MODEL_VIEW_IDS: readonly ModelView[] = ['bar', 'circle', 'numberline', 'wall', 'barmodel', 'grid', 'array', 'blocks', 'clock', 'timeline'];

export interface MathSceneExt {
  /** Beat of the chapter on show, 0-based. Every chapter opens on its first beat. */
  beat: number;
  /** Model view picked in the VIEW group on the check; `null` = the task's own model. */
  model: ModelView | null;
}

const isView = (v: unknown): v is ModelView => typeof v === 'string' && (MODEL_VIEW_IDS as readonly string[]).includes(v);

export const mathSceneEngine = defineEngine<MathSceneExt, MathSceneData>({
  id: 'math-scene',
  defaults() {
    return { beat: 0, model: null };
  },
  fromChapterState() {
    // Not cumulative: every chapter opens on its first beat.
    return { beat: 0, model: null };
  },
  fromUrl(fields) {
    const out: Partial<MathSceneExt> = {};
    // The range is checked by the view against the lesson (a beat past the end shows the last one).
    if (fields.beat !== undefined) out.beat = fields.beat === null ? 0 : Math.max(0, Math.floor(fields.beat));
    if (fields.model === null || isView(fields.model)) out.model = fields.model;
    return out;
  },
  load: () => import('./View'),
});
