/**
 * The lesson's actions (docs/15 §2.0, §3, §4.3, §10): moving between beats,
 * drawing a step's check from its pool ("Another one", "Skip"), marking the
 * model, check, hint, "Show me", undo and the practice flow. One object shared
 * by the stage, the check tray, the chapter axis, the keys (commands C / I /
 * U), the presentation and `__atlas.engine`, so every path does the same
 * thing. Reads the scene store (chapter, `beat`, `model`) and writes the
 * child's work and the drawn tasks into the engine's UI store only.
 */
import type { BilingualText } from '../../i18n';
import { t } from '../../i18n';
import type { SceneStore } from '../core/store';
import type { MathSceneExt } from './index';
import type { Lesson, MisconceptionCode, ModelView, Step, Task } from './schema';
import type { Attempt, Feedback, MathUiStore, TaskRun } from './ui';
import { answered, check, readInput, segments, usesValueBoxes } from './lib/check';
import { readWritten, writtenLabel } from './lib/forms';
import { parseArrayCut } from './lib/array';
import { apply, sampleState, solve, step } from './lib/solve';
import { initialState, inputSpecOf, phasesOf, type Action, type TaskState } from './lib/state';
import { beatCount, beatSlot, findTask, locate, type BeatSlot, type Place } from './lib/lesson';
import { drawIndex, pageSeed } from './lib/pool';
import { formatFrac, lcm } from './lib/fraction';
import { isUnit, unitText } from './lib/value';

export interface Current {
  chapter: string | null;
  place: Place;
  step: Step | null;
  practice: boolean;
  /** The beat on show (clamped to the chapter). */
  beat: number;
  slot: BeatSlot;
  /** The task being answered: the step's drawn check, or the practice question (`null` on an explanation beat). */
  task: Task | null;
  run: TaskRun | null;
}

const both = (key: Parameters<typeof t>[1], vars?: Record<string, string | number>): BilingualText => ({ en: t('en', key, vars), zh: t('zh', key, vars) });

export function freshRun(task: Task): TaskRun {
  return { state: initialState(task), tries: 0, hints: 0, feedback: null, revealed: false, done: false, log: [], attempts: [] };
}

/** Mono caption of the answer after a move (undo log, "your attempts"). */
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
      if (spec && usesValueBoxes(task, spec)) {
        const w = readWritten(spec, s.input);
        return w ? `WRITE ${w.map(writtenLabel).join(' · ')}` : 'WRITE …';
      }
      const v = spec ? readInput(spec, s.input) : null;
      const unit = spec?.form === 'measure' && isUnit(s.input.u) ? ` ${unitText(s.input.u, 'en', 2).toLocaleUpperCase('en')}` : '';
      return v ? `WRITE ${v.map(formatFrac).join(' · ')}${unit}` : 'WRITE …';
    }
    case 'tile':
    case 'row':
    case 'rows':
      return `LAY ${s.tiles.length}`;
    case 'edge':
      return `TRACE ${s.edges.length}`;
    case 'clear':
      return 'CLEAR';
    case 'walk':
      return s.walked ? `WALK ${s.edges.length}` : `TRACE ${s.edges.length}`;
    case 'rect':
      return s.rect ? `DRAW ${s.rect[0]} × ${s.rect[1]}` : 'DRAW';
    case 'gridcut':
      return s.cut ? `CUT ${s.cut.toUpperCase()}` : 'CUT';
    case 'deal':
    case 'pack':
    case 'put':
    case 'take':
    case 'containers':
      return `GROUPS ${s.groups.join(' · ') || '—'}`;
    case 'arrange':
      return s.arr ? `ARRAY ${s.arr[0]} × ${s.arr[1]}` : 'ARRAY';
    case 'land':
      return `JUMPS ${s.landings.join(' · ') || '—'}`;
    case 'arraycut': {
      const c = parseArrayCut(s.cut);
      return c ? `CUT AFTER ${c.axis === 'rows' ? 'ROW' : 'COLUMN'} ${c.at}` : 'CUT';
    }
    case 'trade':
    case 'share':
      return `H ${s.mat.H} · T ${s.mat.T} · O ${s.mat.O}${task.kind === 'share' ? ` | EACH H ${s.dealt.H} · T ${s.dealt.T} · O ${s.dealt.O}` : ''}`;
    case 'check':
      return 'CHECK';
  }
}

/** Mono caption of the answer a state holds (a check's "your attempts" line). */
export function answerLabel(task: Task, s: TaskState): string {
  const phase = phasesOf(task)[s.phase];
  if (phase === 'input') return describe(task, { do: 'input', field: '', value: '' }, s);
  if (phase === 'convert') return describe(task, { do: 'factor', k: s.factor }, s);
  switch (task.kind) {
    case 'shade':
      return describe(task, { do: 'shade', part: 0 }, s);
    case 'build-sum':
      return describe(task, task.op === '-' ? { do: 'cross', part: 0 } : { do: 'shade', part: 0 }, s);
    case 'cut':
      return describe(task, { do: 'cut', at: 0 }, s);
    case 'fold':
      return describe(task, { do: 'fold' }, s);
    case 'split':
    case 'merge':
      return describe(task, { do: 'factor', k: s.factor }, s);
    case 'place':
      return describe(task, { do: 'place', at: 0 }, s);
    case 'compare':
      return task.ask === 'symbol' && s.symbol ? describe(task, { do: 'symbol', value: s.symbol }, s) : describe(task, { do: 'pick', side: s.pick ?? 'a' }, s);
    case 'order':
      return describe(task, { do: 'order', item: 0 }, s);
    case 'choose':
      return describe(task, { do: 'choose', id: '' }, s);
    case 'input':
      return describe(task, { do: 'input', field: '', value: '' }, s);
    case 'count-squares':
      return describe(task, { do: 'rows', count: 0 }, s);
    case 'trace-perimeter':
      return describe(task, { do: 'edge', key: '' }, s);
    case 'draw-rectangle':
      return describe(task, { do: 'rect', w: 0, h: 0 }, s);
    case 'split-figure':
      return describe(task, { do: 'gridcut', cut: null }, s);
    case 'group':
      return describe(task, { do: 'deal' }, s);
    case 'arrange':
      return describe(task, { do: 'arrange', rows: 0, cols: 0 }, s);
    case 'skip-count':
      return describe(task, { do: 'land', at: 0 }, s);
    case 'split-array':
      return describe(task, { do: 'arraycut', cut: null }, s);
    case 'regroup':
    case 'share':
      return describe(task, { do: 'trade', trade: 'O>T' }, s);
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

export interface ControllerOptions {
  /** The page view's seed for drawing checks (tests pass a fixed one). */
  seed?: number;
  /** Open the reading panel (a check is answered there). */
  openReader?(): void;
}

export function createController(lesson: Lesson, scene: SceneStore<MathSceneExt>, ui: MathUiStore, practiceChapter: string | null, options: ControllerOptions = {}) {
  const seed = options.seed ?? pageSeed();
  const draws = new Map<string, number>();
  /** A pool task forced for the next visit of a step (`__atlas.engine.goToTask`). */
  const forced = new Map<string, number>();
  const runOf = (task: Task): TaskRun => ui.getState().runs[task.id] ?? freshRun(task);
  const setRun = (task: Task, run: TaskRun) => ui.setState((u) => ({ runs: { ...u.runs, [task.id]: run } }));

  const drawnTask = (step: Step): Task => step.pool[Math.min(ui.getState().drawn[step.id] ?? 0, step.pool.length - 1)]!;

  const current = (): Current => {
    const { chapter, beat } = scene.getState();
    const practice = chapter !== null && chapter === practiceChapter;
    const place = locate(lesson, chapter, practice);
    const slot = beatSlot(place, beat);
    const step = place.kind === 'step' ? place.step : null;
    const task = slot.kind === 'check' && step ? drawnTask(step) : slot.kind === 'question' ? slot.question.task : null;
    return { chapter, place, step, practice, beat: slot.index, slot, task, run: task ? runOf(task) : null };
  };

  const say = (task: Task, code: MisconceptionCode | null): BilingualText =>
    (code && task.feedback.wrong.find((w) => w.when === code)?.say) || task.feedback.fallback;

  const phaseText = (task: Task, phase: string): BilingualText => {
    if (phase === 'input') return both('math.phase.input');
    if (phase === 'mark') return both(task.kind === 'build-sum' && task.op === '-' ? 'math.phase.cross' : 'math.phase.shade');
    return both('math.phase.next');
  };

  const attempt = (task: Task, run: TaskRun, tone: Attempt['tone']): Attempt[] => [...run.attempts, { label: answerLabel(task, run.state), tone }].slice(-6);

  /** Draw the step's check: a fresh pool task (not the one shown last), started afresh. */
  const draw = (step: Step) => {
    const count = draws.get(step.id) ?? 0;
    draws.set(step.id, count + 1);
    const prev = ui.getState().drawn[step.id];
    const pick = forced.get(step.id) ?? drawIndex(seed, step.id, count, step.pool.length, prev ?? null);
    forced.delete(step.id);
    const task = step.pool[pick]!;
    ui.setState((u) => ({ drawn: { ...u.drawn, [step.id]: pick }, runs: { ...u.runs, [task.id]: freshRun(task) } }));
  };

  const api = {
    current,
    runOf,

    /** A chapter was entered (any path): its check is drawn again (or the forced one). */
    visit(chapter: string | null) {
      const step = lesson.steps.find((s) => s.id === chapter);
      if (step) draw(step);
    },

    /** Show beat `index` (0-based) of `chapter`; the check beat opens the reading panel where it is answered. */
    goToBeat(chapter: string, index: number, instant = false) {
      const st = scene.getState();
      if (st.chapter !== chapter) st.goToChapter(chapter, { instant });
      scene.getState().patch({ beat: index, model: null });
      const { slot } = current();
      if (slot.kind === 'check' || slot.kind === 'question') options.openReader?.();
    },

    /** Beat `n` (1-based) of the chapter on show (`<Beat n>` in a chapter body). */
    goToBeatOfChapter(n: number): boolean {
      const { chapter, place } = current();
      if (!chapter || place.kind !== 'step' || n < 1 || n > place.step.beats.length) return false;
      api.goToBeat(chapter, n - 1);
      return true;
    },

    /** A `<Task id>` in a chapter body: a step id opens its check, a pool task id that task. */
    goToTask(id: string): boolean {
      const beat = /^beat-(\d+)$/.exec(id);
      if (beat) return api.goToBeatOfChapter(Number(beat[1]));
      const step = lesson.steps.find((s) => s.id === id);
      if (step) {
        api.goToBeat(step.id, step.beats.length);
        return true;
      }
      const at = findTask(lesson, id);
      if (!at) return false;
      if ('practice' in at) {
        if (practiceChapter) api.goToBeat(practiceChapter, at.practice);
        return !!practiceChapter;
      }
      api.force(at.step, at.pool);
      return true;
    },

    /** Show pool task `pool` (0-based) as the check of `stepId` (tests, `<Task id>` with a pool id). */
    force(stepId: string, pool: number, instant = false) {
      const step = lesson.steps.find((s) => s.id === stepId);
      if (!step) return;
      const pick = Math.min(Math.max(0, pool), step.pool.length - 1);
      if (scene.getState().chapter === stepId) {
        const task = step.pool[pick]!;
        ui.setState((u) => ({ drawn: { ...u.drawn, [step.id]: pick }, runs: { ...u.runs, [task.id]: freshRun(task) } }));
      } else forced.set(stepId, pick);
      api.goToBeat(stepId, step.beats.length, instant);
    },

    /** "Another one": a different task from the step's pool. */
    another(): boolean {
      const { step, slot } = current();
      if (!step || slot.kind !== 'check' || step.pool.length < 2) return false;
      draw(step);
      scene.getState().patch({ model: null });
      return true;
    },

    /** "Skip": nothing is forced. Presenting, the auto-play goes on; otherwise the next chapter. */
    skip() {
      const { task, practice } = current();
      if (ui.getState().presenting) {
        if (task) ui.setState((u) => ({ skipped: { ...u.skipped, [task.id]: true } }));
        return;
      }
      if (practice) api.next();
      else scene.getState().stepChapter(1);
    },

    /** A move on the model or in the answer controls. */
    act(action: Action): boolean {
      const { task, run, practice } = current();
      if (!task || !run || run.done || action.do === 'check') return false;
      if (practice && ui.getState().practice[task.id]) return false;
      const next = step(task, run.state, action);
      if (sameState(next, run.state)) return false;
      const keep = run.feedback && (run.feedback.tone === 'hint' || run.feedback.tone === 'phase') ? run.feedback : null;
      setRun(task, { ...run, state: next, feedback: keep, log: [...run.log, { label: describe(task, action, next), state: next }].slice(-12) });
      return true;
    },

    /** Check (C, the Check buttons, Enter in an answer box). */
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
        setRun(task, { ...run, state: { ...run.state, phase: run.state.phase + 1 }, attempts: attempt(task, run, 'phase'), feedback: { tone: 'phase', text: phaseText(task, phases[run.state.phase + 1]!) } });
        ui.setState((u) => ({ pulse: u.pulse + 1 }));
        return true;
      }
      if (practice) {
        // One check per question: right, or the diagnosis and the right model drawn.
        const fb: Feedback = r.ok ? { tone: 'correct', text: task.feedback.correct } : { tone: 'wrong', text: say(task, r.code), code: r.code };
        setRun(task, { ...run, done: true, revealed: !r.ok, feedback: fb, attempts: attempt(task, run, r.ok ? 'correct' : 'wrong') });
        ui.setState((u) => ({ practice: { ...u.practice, [task.id]: { ok: r.ok, code: r.code, near: !!r.near } }, pulse: r.ok ? u.pulse + 1 : u.pulse }));
        return r.ok;
      }
      if (r.ok) {
        setRun(task, { ...run, done: true, feedback: { tone: 'correct', text: task.feedback.correct }, attempts: attempt(task, run, 'correct') });
        ui.setState((u) => ({ pulse: u.pulse + 1 }));
        return true;
      }
      if (r.near) {
        const text = say(task, 'not-simplest') === task.feedback.fallback ? both('math.feedback.near') : say(task, 'not-simplest');
        setRun(task, { ...run, feedback: { tone: 'near', text, code: 'not-simplest' }, attempts: attempt(task, run, 'near') });
        return false;
      }
      setRun(task, { ...run, tries: run.tries + 1, feedback: { tone: 'wrong', text: say(task, r.code), code: r.code }, attempts: attempt(task, run, 'wrong') });
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
      return true;
    },

    canUndo(): boolean {
      const { run } = current();
      return !!run && !run.done && run.log.length > 0;
    },

    /** After a check or a question: the next chapter, the next question, the practice summary. */
    next() {
      const { place, beat, practice } = current();
      if (practice && place.kind === 'practice') {
        if (beat < place.questions.length - 1) scene.getState().patch({ beat: beat + 1, model: null });
        else ui.setState({ summary: true });
        return;
      }
      scene.getState().stepChapter(1);
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
      scene.getState().patch({ beat: 0, model: null });
    },

    /** Reset the task on show to its start (a presentation check beat). */
    reset(task: Task) {
      setRun(task, freshRun(task));
    },

    /** The chapter's beats on the axis. */
    beatCount(chapter: string): number {
      return beatCount(locate(lesson, chapter, chapter === practiceChapter));
    },

    /* ---------------- test hooks (window.__atlas.engine) ---------------- */

    /** The beat and the task on show as tests see it. */
    info() {
      const { chapter, beat, slot, task, run, practice, step } = current();
      const base = { step: chapter, beat: beat + 1, slot: slot.kind };
      if (!task || !run) return { ...base, index: null, id: null, kind: null };
      return {
        ...base,
        index: step ? (ui.getState().drawn[step.id] ?? 0) + 1 : beat + 1,
        id: task.id,
        kind: task.kind,
        phase: phasesOf(task)[run.state.phase],
        answered: answered(task, run.state),
        done: run.done,
        tries: run.tries,
        hints: run.hints,
        revealed: run.revealed,
        attempts: run.attempts.length,
        feedback: run.feedback ? { tone: run.feedback.tone, code: run.feedback.code ?? null } : null,
        practice,
      };
    },

    /** Every pool task and practice question: `{ step, index (1-based pool / question), id, kind, practice, wrong }`. */
    tasks() {
      const firstWrong = (x: Task) => x.feedback.wrong.find((w) => w.sample)?.when ?? (x.kind === 'choose' ? (x.options.find((o) => !o.correct && o.misconception)?.misconception ?? null) : null);
      return [
        ...lesson.steps.flatMap((st) => st.pool.map((x, i) => ({ step: st.id, index: i + 1, id: x.id, kind: x.kind, practice: false, wrong: firstWrong(x) }))),
        ...lesson.practice.map((q, i) => ({ step: practiceChapter, index: i + 1, id: q.id, kind: q.task.kind, practice: true, wrong: firstWrong(q.task) })),
      ];
    },

    /** Open pool task `i` (1-based) as the step's check, or practice question `i`. */
    goToTaskAt(stepId: string, i: number, instant = false) {
      if (stepId === practiceChapter) api.goToBeat(stepId, i - 1, instant);
      else api.force(stepId, i - 1, instant);
    },

    /** Do the right moves for the phase the task on show is in (as the child would), unchecked. */
    solve(): boolean {
      const { task, run } = current();
      if (!task || !run || run.done) return false;
      const state = solvedUpTo(task, run.state.phase);
      setRun(task, { ...run, state, feedback: null, log: [...run.log, { label: 'SOLVE', state }] });
      return true;
    },

    /** Put a planned wrong answer (`code`) or the right one (`'correct'`) on the task on show, unchecked. */
    answer(code: MisconceptionCode | 'correct'): boolean {
      const { task, run } = current();
      if (!task || !run || run.done) return false;
      if (code === 'correct') return api.solve();
      const sample = task.feedback.wrong.find((w) => w.when === code)?.sample;
      const option = task.kind === 'choose' ? task.options.find((o) => !o.correct && o.misconception === code) : undefined;
      const state = sample ? sampleState(task, sample) : option ? { ...initialState(task), chosen: [option.id] } : null;
      if (!state) return false;
      setRun(task, { ...run, state, feedback: null, log: [...run.log, { label: code.toUpperCase(), state }] });
      return true;
    },

    practiceInfo() {
      const results = ui.getState().practice;
      const { practice, beat } = current();
      return {
        index: practice ? beat + 1 : null,
        summary: ui.getState().summary,
        score: Object.values(results).filter((r) => r.ok).length,
        results: lesson.practice.map((q) => (results[q.id] ? { id: q.id, ok: results[q.id]!.ok, code: results[q.id]!.code } : { id: q.id, ok: null, code: null })),
      };
    },
  };
  return api;
}

export type Controller = ReturnType<typeof createController>;
