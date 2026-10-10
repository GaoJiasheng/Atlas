/**
 * The lesson's actions (docs/15 §2.0, §3, §4.3): mark the model, check, hint,
 * "Show me", undo, the example, moving between sub-steps and the practice
 * flow. One object shared by the stage, the tray, the bottom bar, the keys
 * (commands C / I / U / W), the presentation and `__atlas.engine`, so every
 * path does the same thing. Reads the scene store (chapter, `task`, `model`)
 * and writes the child's work into the engine's UI store only.
 */
import type { BilingualText } from '../../i18n';
import { t } from '../../i18n';
import type { SceneStore } from '../core/store';
import type { MathSceneExt } from './index';
import type { Lesson, MisconceptionCode, ModelView, Task } from './schema';
import type { Feedback, MathUiStore, TaskRun } from './ui';
import { answered, check, readInput, segments } from './lib/check';
import { apply, sampleState, solve, step } from './lib/solve';
import { initialState, inputSpecOf, phasesOf, type Action, type TaskState } from './lib/state';
import { findTask, locate, type Place } from './lib/lesson';
import { formatFrac, lcm } from './lib/fraction';

export interface Current {
  chapter: string | null;
  place: Place;
  practice: boolean;
  index: number;
  task: Task | null;
  run: TaskRun | null;
}

const both = (key: Parameters<typeof t>[1], vars?: Record<string, string | number>): BilingualText => ({ en: t('en', key, vars), zh: t('zh', key, vars) });

export function freshRun(task: Task): TaskRun {
  return { state: initialState(task), tries: 0, hints: 0, feedback: null, revealed: false, done: false, log: [] };
}

/** Mono HISTORY caption for a move. */
function describe(task: Task, action: Action, s: TaskState): string {
  const total = s.parts * s.wholes;
  switch (action.do) {
    case 'shade':
    case 'fill':
      return `SHADE ${s.shaded.length}/${s.parts}`;
    case 'cross':
      return `TAKE AWAY ${s.crossed.length}/${s.parts}`;
    case 'cut':
      return `CUT · ${segments(s.cuts, task.kind === 'cut' ? task.snap : 12).length} PARTS`;
    case 'fold':
      return `FOLD → ${total}`;
    case 'unfold':
      return `UNFOLD → ${total}`;
    case 'factor':
      return action.k === null ? `BACK → ${s.parts}` : `${task.kind === 'merge' ? '÷' : '×'}${action.k} → ${s.parts}`;
    case 'place':
      return `MARK ${s.place ?? 0}/${s.parts}`;
    case 'symbol':
      return task.kind === 'compare' ? `${formatFrac(task.a)} ${action.value} ${formatFrac(task.b)}` : action.value;
    case 'pick':
      return task.kind === 'compare' ? `PICK ${formatFrac(action.side === 'a' ? task.a : task.b)}` : 'PICK';
    case 'align':
      return task.kind === 'compare' ? `SAME-SIZE PARTS · ${lcm(task.a.d, task.b.d)}` : 'SAME-SIZE PARTS';
    case 'order':
    case 'unorder':
      return task.kind === 'order' ? `ORDER ${s.order.map((i) => formatFrac(task.items[i]!)).join(' · ')}` : 'ORDER';
    case 'choose':
      return `CHOOSE ${s.chosen.map((id) => id.toUpperCase()).join(' ')}`;
    case 'input': {
      const spec = inputSpecOf(task);
      const v = spec ? readInput(spec, s.input) : null;
      return v ? `WRITE ${v.map(formatFrac).join(' · ')}` : 'WRITE …';
    }
    case 'check':
      return 'CHECK';
  }
}

const sameState = (a: TaskState, b: TaskState) => JSON.stringify(a) === JSON.stringify(b);

/** The state with phases 0..`phase` solved: the earlier ones checked, the last one not yet. */
export function solvedUpTo(task: Task, phase: number): TaskState {
  const segments: Action[][] = [[]];
  for (const a of solve(task)) {
    if (a.do === 'check') segments.push([]);
    else segments.at(-1)!.push(a);
  }
  const actions = segments.slice(0, phase + 1).flatMap((seg, i) => (i < phase ? [...seg, { do: 'check' } as Action] : seg));
  return apply(task, actions);
}

export function createController(lesson: Lesson, scene: SceneStore<MathSceneExt>, ui: MathUiStore, practiceChapter: string | null, chapterIds: readonly string[]) {
  const runOf = (task: Task): TaskRun => ui.getState().runs[task.id] ?? freshRun(task);
  const setRun = (task: Task, run: TaskRun) => ui.setState((u) => ({ runs: { ...u.runs, [task.id]: run } }));

  const current = (): Current => {
    const { chapter, task: n } = scene.getState();
    const practice = chapter !== null && chapter === practiceChapter;
    const place = locate(lesson, chapter, practice);
    const tasks = place.kind === 'background' ? [] : place.tasks;
    const index = Math.min(Math.max(0, n - 1), Math.max(0, tasks.length - 1));
    const task = tasks[index] ?? null;
    return { chapter, place, practice, index, task, run: task ? runOf(task) : null };
  };

  const say = (task: Task, code: MisconceptionCode | null): BilingualText =>
    (code && task.feedback.wrong.find((w) => w.when === code)?.say) || task.feedback.fallback;

  const phaseText = (task: Task, phase: string): BilingualText => {
    if (phase === 'input') return both('math.phase.input');
    if (phase === 'mark') return both(task.kind === 'build-sum' && task.op === '-' ? 'math.phase.cross' : 'math.phase.shade');
    return both('math.phase.next');
  };

  const api = {
    current,
    runOf,

    /** A move on the model or in the answer controls. */
    act(action: Action): boolean {
      const { task, run, practice } = current();
      if (!task || !run || run.done || action.do === 'check') return false;
      if (practice && ui.getState().practice[task.id]) return false;
      if (ui.getState().example) ui.setState({ example: null });
      const next = step(task, run.state, action);
      if (sameState(next, run.state)) return false;
      const keep = run.feedback && (run.feedback.tone === 'hint' || run.feedback.tone === 'phase') ? run.feedback : null;
      setRun(task, { ...run, state: next, feedback: keep, log: [...run.log, { label: describe(task, action, next), state: next }].slice(-12) });
      ui.setState({ preview: null });
      return true;
    },

    /** Check (C, the Check buttons, Enter in the tray). */
    check(): boolean {
      const { task, run, practice } = current();
      if (!task || !run || run.done) return false;
      if (!answered(task, run.state)) {
        setRun(task, { ...run, feedback: { tone: 'info', text: both('math.feedback.incomplete') } });
        return false;
      }
      const r = check(task, run.state);
      const phases = phasesOf(task);
      const last = run.state.phase >= phases.length - 1;
      if (r.ok && !last) {
        setRun(task, { ...run, state: { ...run.state, phase: run.state.phase + 1 }, feedback: { tone: 'phase', text: phaseText(task, phases[run.state.phase + 1]!) } });
        ui.setState((u) => ({ pulse: u.pulse + 1 }));
        return true;
      }
      if (practice) {
        // One check per question: right, or the diagnosis and the right model drawn.
        const fb: Feedback = r.ok
          ? { tone: 'correct', text: task.feedback.correct }
          : { tone: 'wrong', text: say(task, r.code), code: r.code };
        setRun(task, { ...run, done: true, revealed: !r.ok, feedback: fb });
        ui.setState((u) => ({ practice: { ...u.practice, [task.id]: { ok: r.ok, code: r.code, near: !!r.near } }, pulse: r.ok ? u.pulse + 1 : u.pulse }));
        return r.ok;
      }
      if (r.ok) {
        setRun(task, { ...run, done: true, feedback: { tone: 'correct', text: task.feedback.correct } });
        ui.setState((u) => ({ pulse: u.pulse + 1 }));
        return true;
      }
      if (r.near) {
        setRun(task, { ...run, feedback: { tone: 'near', text: say(task, 'not-simplest') === task.feedback.fallback ? both('math.feedback.near') : say(task, 'not-simplest'), code: 'not-simplest' } });
        return false;
      }
      setRun(task, { ...run, tries: run.tries + 1, feedback: { tone: 'wrong', text: say(task, r.code), code: r.code } });
      return false;
    },

    /** The next hint level (I). Practice questions have one. */
    hint(): boolean {
      const { task, run, practice } = current();
      if (!task || !run || run.done) return false;
      const max = practice ? Math.min(1, task.hints.length) : task.hints.length;
      if (run.hints >= max) return false;
      const hints = run.hints + 1;
      setRun(task, { ...run, hints, feedback: { tone: 'hint', text: task.hints[hints - 1]! } });
      return true;
    },

    canHint(): boolean {
      const { task, run, practice } = current();
      if (!task || !run || run.done) return false;
      return run.hints < (practice ? Math.min(1, task.hints.length) : task.hints.length);
    },

    /** "Show me": after two tries, the right answer as a dashed outline and why. */
    showMe(): boolean {
      const { task, run, practice } = current();
      if (!task || !run || practice || run.done || run.tries < 2) return false;
      setRun(task, { ...run, revealed: true, feedback: { tone: 'reveal', text: task.feedback.reveal } });
      return true;
    },

    /** Undo the last move (U). */
    undo(): boolean {
      const { task, run } = current();
      if (!task || !run || run.done || run.log.length === 0) return false;
      const log = run.log.slice(0, -1);
      const state = log.at(-1)?.state ?? { ...initialState(task), phase: run.state.phase };
      setRun(task, { ...run, state: { ...state, phase: Math.min(state.phase, run.state.phase) }, log, feedback: null });
      ui.setState({ preview: null });
      return true;
    },

    canUndo(): boolean {
      const { run } = current();
      return !!run && !run.done && run.log.length > 0;
    },

    /** Play (W) or stop the example of the current sub-step. */
    example(on?: boolean): boolean {
      const { task, practice } = current();
      if (!task?.example || practice) return false;
      const playing = ui.getState().example?.task === task.id;
      const want = on ?? !playing;
      ui.setState({ example: want ? { task: task.id, line: 0 } : null, preview: null });
      return true;
    },

    /** Go to sub-step `index` (0-based) of `chapter`. */
    goTo(chapter: string, index: number, instant = false) {
      const st = scene.getState();
      if (st.chapter !== chapter) st.goToChapter(chapter, { instant });
      scene.getState().patch({ task: index + 1, model: null });
    },

    /** A `<Task id>` in a chapter body. */
    goToTask(id: string): boolean {
      const at = findTask(lesson, id, practiceChapter);
      if (!at) return false;
      api.goTo(at.chapter, at.index);
      return true;
    },

    next() {
      const { place, index, practice } = current();
      if (place.kind === 'background') {
        scene.getState().stepChapter(1);
        return;
      }
      if (index < place.tasks.length - 1) scene.getState().patch({ task: index + 2, model: null });
      else if (practice) ui.setState({ summary: true });
      else scene.getState().stepChapter(1);
    },

    prev() {
      const { index, chapter } = current();
      if (index > 0) {
        scene.getState().patch({ task: index, model: null });
        return;
      }
      const i = chapterIds.indexOf(chapter ?? '');
      const before = chapterIds[i - 1];
      if (!before) return;
      const prevPlace = locate(lesson, before, before === practiceChapter);
      api.goTo(before, prevPlace.kind === 'background' ? 0 : prevPlace.tasks.length - 1);
    },

    setView(view: ModelView | null) {
      const { task } = current();
      scene.getState().patch({ model: task && view === task.model.kind ? null : view });
    },

    /** Practice: start again with the same questions (D3). */
    restartPractice() {
      const ids = new Set(lesson.practice.map((q) => q.id));
      ui.setState((u) => ({
        practice: {},
        summary: false,
        runs: Object.fromEntries(Object.entries(u.runs).filter(([id]) => !ids.has(id))),
      }));
      scene.getState().patch({ task: 1, model: null });
    },

    /** Entering a sub-step: start it afresh unless it was finished (a finished one shows its right answer). */
    enter() {
      const { task, run } = current();
      if (!task || !run) return;
      if (!run.done) setRun(task, freshRun(task));
      ui.setState({ preview: null });
    },

    /** Reset a sub-step to its start (a presentation "your turn" beat). */
    reset(task: Task) {
      setRun(task, freshRun(task));
    },

    /* ---------------- test hooks (window.__atlas.engine) ---------------- */

    /** The current sub-step as tests see it. */
    info() {
      const { chapter, index, task, run, practice } = current();
      if (!task || !run) return { step: chapter, index: null, id: null, kind: null };
      return {
        step: chapter,
        index: index + 1,
        id: task.id,
        kind: task.kind,
        phase: phasesOf(task)[run.state.phase],
        answered: answered(task, run.state),
        done: run.done,
        tries: run.tries,
        hints: run.hints,
        revealed: run.revealed,
        feedback: run.feedback ? { tone: run.feedback.tone, code: run.feedback.code ?? null } : null,
        example: ui.getState().example?.task === task.id,
        practice,
      };
    },

    /** Do the right moves for the phase the current sub-step is in (as the child would), unchecked. */
    solve(): boolean {
      const { task, run } = current();
      if (!task || !run || run.done) return false;
      const state = solvedUpTo(task, run.state.phase);
      setRun(task, { ...run, state, feedback: null, log: [...run.log, { label: 'SOLVE', state }] });
      return true;
    },

    /** Put a planned wrong answer (`code`) or the right one (`'correct'`) on the current sub-step, unchecked. */
    answer(code: MisconceptionCode | 'correct'): boolean {
      const { task, run } = current();
      if (!task || !run || run.done) return false;
      if (code === 'correct') return api.solve();
      const sample = task.feedback.wrong.find((w) => w.when === code)?.sample;
      const option = task.kind === 'choose' ? task.options.find((o) => !o.correct && o.misconception === code) : undefined;
      const state = sample ? sampleState(task, sample) : option ? { ...initialState(task), chosen: [option.id] } : null;
      if (!state) return false;
      setRun(task, { ...run, state, feedback: null });
      return true;
    },

    practiceInfo() {
      const results = ui.getState().practice;
      const { practice, index } = current();
      return {
        index: practice ? index + 1 : null,
        summary: ui.getState().summary,
        score: Object.values(results).filter((r) => r.ok).length,
        results: lesson.practice.map((q) => (results[q.id] ? { id: q.id, ok: results[q.id]!.ok, code: results[q.id]!.code } : { id: q.id, ok: null, code: null })),
      };
    },
  };
  return api;
}

export type Controller = ReturnType<typeof createController>;
