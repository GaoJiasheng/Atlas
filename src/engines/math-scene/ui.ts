/**
 * MathScene's own UI store (docs/15 §4.9): the child's work on every sub-step
 * (model state, tries, hints, feedback, "Show me", done), the practice
 * results, the example being played, the display modes and the presentation
 * flag. In memory only: never in the URL or any storage, gone on reload (D6).
 */
import { createStore, type StoreApi } from 'zustand/vanilla';
import type { BilingualText } from '../../i18n';
import type { MisconceptionCode } from './schema';
import type { TaskState } from './lib/state';

export type FeedbackTone = 'correct' | 'wrong' | 'near' | 'phase' | 'info' | 'hint' | 'reveal';

export interface Feedback {
  tone: FeedbackTone;
  text: BilingualText;
  code?: MisconceptionCode | null;
}

/** One move in the HISTORY panel: what was done and the model after it. */
export interface LogEntry {
  /** Mono caption, e.g. `FOLD → 4`, `SHADE 3/8`. */
  label: string;
  state: TaskState;
}

export interface TaskRun {
  state: TaskState;
  /** Wrong checks (a near miss does not count). */
  tries: number;
  /** Hint levels shown so far. */
  hints: number;
  feedback: Feedback | null;
  /** "Show me": the right answer is drawn as a dashed outline. */
  revealed: boolean;
  done: boolean;
  log: LogEntry[];
}

export interface PracticeResult {
  ok: boolean;
  code: MisconceptionCode | null;
  near: boolean;
}

export interface MathUiState {
  runs: Record<string, TaskRun>;
  /** The example being played on the stage (W, or a presentation example beat). */
  example: { task: string; line: number } | null;
  modes: { symbol: boolean; equivalent: boolean; numberline: boolean };
  practice: Record<string, PracticeResult>;
  /** The practice summary is on show. */
  summary: boolean;
  presenting: boolean;
  /** A HISTORY thumbnail shown on the stage (index into the current run's log), read-only. */
  preview: number | null;
  /** Bumped on every right answer (one signal pulse on the model). */
  pulse: number;
}

export type MathUiStore = StoreApi<MathUiState>;

export function createMathUi(): MathUiStore {
  return createStore<MathUiState>()(() => ({
    runs: {},
    example: null,
    modes: { symbol: false, equivalent: false, numberline: false },
    practice: {},
    summary: false,
    presenting: false,
    preview: null,
    pulse: 0,
  }));
}
