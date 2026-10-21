/**
 * MathScene's own UI store (docs/15 §4.9, §10): the child's work on every
 * check and practice question (model state, attempts, hints, feedback,
 * "Show me", done), which pool task each step drew, the practice results,
 * the display modes and the presentation flag. In memory only: never in the
 * URL or any storage, gone on reload (D6).
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

/** One move on the model or in the answer controls (undo goes back through these). */
export interface LogEntry {
  /** Mono caption of the answer after the move, e.g. `SHADE 3/8`, `WRITE 5/7`. */
  label: string;
  state: TaskState;
}

/** One press of Check: what the answer was and how it went ("your attempts" in the tray). */
export interface Attempt {
  label: string;
  tone: 'correct' | 'wrong' | 'near' | 'phase';
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
  attempts: Attempt[];
}

export interface PracticeResult {
  ok: boolean;
  code: MisconceptionCode | null;
  near: boolean;
}

export interface MathUiState {
  runs: Record<string, TaskRun>;
  /** Pool index drawn for each step's check (by step id). */
  drawn: Record<string, number>;
  /** Checks skipped in the presentation (task id): its auto-play goes on. */
  skipped: Record<string, boolean>;
  modes: { symbol: boolean; equivalent: boolean; numberline: boolean };
  practice: Record<string, PracticeResult>;
  /** The practice summary is on show. */
  summary: boolean;
  presenting: boolean;
  /** Bumped on every right answer (one signal pulse on the model). */
  pulse: number;
  /** The FOLD slider and the turn buttons on a net (docs/39 §3.5): for the beat or check `at`, back to the spec's anywhere else. */
  net: { at: string; fold: number | null; turn: number | null };
  /** A net check folding up (Check on a completed net, a face found, "Show me"): bumped per play; `stay` keeps it folded. */
  netPlay: { id: string; n: number; stay: boolean } | null;
}

export type MathUiStore = StoreApi<MathUiState>;

export function createMathUi(): MathUiStore {
  return createStore<MathUiState>()(() => ({
    runs: {},
    drawn: {},
    skipped: {},
    modes: { symbol: false, equivalent: false, numberline: false },
    practice: {},
    summary: false,
    presenting: false,
    pulse: 0,
    net: { at: '', fold: null, turn: null },
    netPlay: null,
  }));
}
