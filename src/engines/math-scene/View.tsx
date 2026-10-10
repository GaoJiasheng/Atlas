/**
 * MathScene view (docs/15 §4): the lesson on an SVG stage inside the
 * technical-plate HUD. Registers the VIEW group as the model switch (the
 * engine lights it, core C2), the display modes S / E / N (+ host L) and P,
 * the commands C check · I hint · U undo · W example (core C3), the test
 * hooks `__atlas.engine` (C7) and `<Task id>` links (C9). Draws the stage,
 * the answer tray, the bottom bar of steps, the card, the three panels, the
 * reader inspector and the control panel; runs the presentation with "your
 * turn" beats the child answers on the stage (core C4: the tray's controls in
 * the caption card, auto-play waiting for a right answer or "Show me").
 */
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useStore } from 'zustand';
import type { EngineViewProps } from '../core/types';
import { SceneSlot, useHud, useScene, useSceneContext, useSceneControls, useSceneStore } from '../core/context';
import type { SceneCommand, SceneControls, SceneMode, ScenePreset, SpecRow } from '../core/controls';
import { usePresentation, type PresentationAdapter } from '../core/presentation';
import { chapterNumbers } from '../core/chapters';
import { t, tx, type BilingualText } from '../../i18n';
import { renderRich, speakable } from '../../lib/rich-text';
import type { MathSceneExt } from './index';
import type { MathChapterState, MathSceneData, MisconceptionCode, ModelView } from './schema';
import { createMathUi } from './ui';
import { createController } from './controller';
import { lessonBeats, type LessonBeat } from './lib/beats';
import { viewsFor } from './lib/lesson';
import { answered } from './lib/check';
import { exampleFrames, exampleTask } from './lib/solve';
import type { Action } from './lib/state';
import { cardValue } from './lib/working';
import { formatFrac } from './lib/fraction';
import { Defs } from './stage/svg';
import { StageContent } from './stage/Stage';
import { useStageLayout, type LayoutMode } from './stage/layout';
import { Tray, partsAreNarrow } from './tray/Tray';
import { FractionCard, HistoryPanel, StatePanel, TaskInspector, WorkingPanel } from './hud/Panels';
import { StepBar } from './hud/StepBar';
import { MathOverlay } from './hud/Overlay';
import { PracticeSummary } from './practice/Summary';
import './math-scene.css';

const both = (key: Parameters<typeof t>[1]): BilingualText => ({ en: t('en', key), zh: t('zh', key) });
const UP = (s: string) => s.toLocaleUpperCase('en');
const VIEW_KEY: Record<ModelView, Parameters<typeof t>[1]> = {
  bar: 'math.view.bar',
  circle: 'math.view.circle',
  numberline: 'math.view.numberline',
  wall: 'math.view.wall',
  barmodel: 'math.view.barmodel',
};
const SPECIMEN_VIEWS: ModelView[] = ['bar', 'circle', 'numberline', 'wall'];
/** One example line on the stage before the next (outside the presentation). */
const EXAMPLE_LINE_MS = 2800;
/** A beat's model change settles (the stage is SVG: a short ease). */
const BEAT_SETTLE_MS = 600;

type LessonBeatSpec = LessonBeat & { caption: BilingualText };

function useMedia(query: string): boolean {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setOn(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, [query]);
  return on;
}

export default function MathSceneView({ data, chapters, locale }: EngineViewProps) {
  const file = data as MathSceneData;
  const lesson = file.lesson;
  const store = useSceneStore<MathSceneExt>();
  const { hud } = useSceneContext();
  const [ui] = useState(createMathUi);
  const practiceChapter = useMemo(() => chapters.find((c) => (c.state as MathChapterState).practice)?.id ?? null, [chapters]);
  const chapterIds = useMemo(() => chapters.map((c) => c.id), [chapters]);
  const numbers = useMemo(() => chapterNumbers(chapters), [chapters]);
  const ctl = useMemo(() => createController(lesson, store, ui, practiceChapter, chapterIds), [lesson, store, ui, practiceChapter, chapterIds]);
  const defs = `ms${useId().replace(/[^a-z0-9]/gi, '')}`;

  const s = useScene<MathSceneExt, { chapter: string | null; task: number; model: ModelView | null }>((st) => ({ chapter: st.chapter, task: st.task, model: st.model }));
  const u = useStore(ui);
  const cur = ctl.current();
  const { place, practice, index, task, run } = cur;
  const step = place.kind === 'step' ? place.step : null;
  const tasks = place.kind === 'background' ? [] : place.tasks;
  const chapterNo = String(numbers.get(s.chapter ?? '') ?? 0).padStart(2, '0');
  const hudOn = useHud((h) => h.hud);
  const labelsOn = useHud((h) => h.labels);
  const phone = useMedia('(max-width: 759px)');
  const coarse = useMedia('(pointer: coarse)');

  // Labels (L) name every part 1/n: an assist the child switches on, so the lesson starts without them.
  useEffect(() => hud.setState({ labels: false }), [hud]);

  /* ---------- the view: the VIEW group's model, else the chapter's, else the task's own ---------- */
  const views = task ? (practice ? [task.model.kind] : viewsFor(step, task)) : place.kind === 'background' ? SPECIMEN_VIEWS : [];
  const view: ModelView = s.model && views.includes(s.model) ? s.model : task ? task.model.kind : (s.model ?? 'bar');

  /* ---------- entering a sub-step: fresh unless finished; clamp the index ---------- */
  useEffect(() => {
    if (tasks.length > 0 && s.task > tasks.length) store.getState().patch({ task: tasks.length });
  }, [s.task, tasks.length, store]);
  const presentingRef = useRef(false);
  useEffect(() => {
    if (!presentingRef.current) {
      ctl.enter();
      ui.setState({ example: null, summary: false });
    }
  }, [s.chapter, s.task, ctl, ui]);

  /* ---------- example playback (W): one caption line every few seconds ---------- */
  const exampleOn = !!task && u.example?.task === task.id;
  const frames = useMemo(() => (task && exampleOn ? exampleFrames(task) : []), [task, exampleOn]);
  useEffect(() => {
    if (!u.example || u.presenting || !task?.example) return;
    if (u.example.line >= task.example.say.length - 1) return;
    const timer = window.setTimeout(() => ui.setState((x) => (x.example ? { example: { ...x.example, line: x.example.line + 1 } } : {})), EXAMPLE_LINE_MS);
    return () => window.clearTimeout(timer);
  }, [u.example, u.presenting, task, ui]);

  /* ---------- Shift + ← → : previous / next sub-step ---------- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!e.shiftKey || e.altKey || e.ctrlKey || e.metaKey || e.defaultPrevented) return;
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      const target = e.target instanceof Element ? e.target : null;
      if (target?.closest('input, textarea, select, [data-keys="own"], [data-keys="arrows"], [role="slider"], [role="radiogroup"]')) return;
      if (presentingRef.current) return;
      e.preventDefault();
      if (e.key === 'ArrowRight') ctl.next();
      else ctl.prev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [ctl]);

  /* ---------- PRESENTATION: beats from the data (examples + "your turn") ---------- */
  const summaryCaption = useMemo(() => both('math.summary.beat'), []);
  const adapter: PresentationAdapter<LessonBeatSpec, { chapter: string | null; task: number; model: ModelView | null }> = {
    beatsOf: (c) => lessonBeats(lesson, c.id, c.id === practiceChapter, summaryCaption) as LessonBeatSpec[] | undefined,
    captionOf: (b, l) => speakable(tx(b.caption, l), l),
    renderCaption: (b, l) => renderRich(tx(b.caption, l), l),
    applyBeat: (b, { instant }) => {
      const spec = b.spec;
      const st = store.getState();
      // The summary beat stays on the last question (its index is one past it).
      st.applyState({ chapter: b.chapter, task: spec ? Math.min(spec.index, spec.kind === 'summary' ? spec.index - 1 : spec.index) + 1 : 1, model: null }, { instant });
      const { task: now } = ctl.current();
      if (!spec || spec.kind === 'summary') ui.setState({ example: null, summary: spec?.kind === 'summary', preview: null });
      else if (spec.kind === 'example' && now) ui.setState({ example: { task: now.id, line: spec.line ?? 0 }, summary: false, preview: null });
      else if (now) {
        ui.setState({ example: null, summary: false, preview: null });
        if (!(practice && ui.getState().practice[now.id])) ctl.reset(now);
      }
      return instant ? undefined : new Promise<void>((resolve) => window.setTimeout(resolve, BEAT_SETTLE_MS));
    },
    gate: (b) => {
      if (b.spec?.kind !== 'try' || !b.spec.task) return null;
      const id = b.spec.task;
      const open = () => {
        const r = ui.getState().runs[id];
        return !!r && (r.done || r.revealed);
      };
      return new Promise<void>((resolve) => {
        if (open()) return resolve();
        const stop = ui.subscribe(() => {
          if (open()) {
            stop();
            resolve();
          }
        });
      });
    },
    onEnter: () => {
      presentingRef.current = true;
      ui.setState({ presenting: true, example: null, preview: null });
    },
    saveState: () => ({ chapter: store.getState().chapter, task: store.getState().task, model: store.getState().model }),
    restoreState: (saved) => {
      presentingRef.current = false;
      ui.setState({ presenting: false, example: null, summary: false });
      store.getState().applyState(saved, { instant: false });
    },
    cardActions:
      u.presenting && task && run && !exampleOn && !u.summary ? (
        <Tray ctl={ctl} lesson={lesson} task={task} run={run} where={null} practice={practice} example={null} compact narrow={coarse} locale={locale} />
      ) : undefined,
  };
  const presentation = usePresentation(adapter);
  const { presenting, isPresenting, status: presentationStatus, controls: beatControls, start: startPresentation, stop: stopPresentation } = presentation;

  /* ---------- layout ---------- */
  const rootRef = useRef<HTMLDivElement>(null);
  const trayRef = useRef<HTMLDivElement>(null);
  const mode: LayoutMode = presenting ? 'present' : hudOn ? 'hud' : 'bare';
  const L = useStageLayout(rootRef, trayRef, mode, `${s.chapter}|${s.task}|${u.summary}|${exampleOn}|${run?.state.phase}|${run?.feedback?.tone}|${locale}`);

  /* ---------- what the stage draws ---------- */
  const preview = run && u.preview !== null ? (run.log[u.preview]?.state ?? null) : null;
  const exTask = exampleOn && task ? exampleTask(task) : null;
  const exState = exampleOn && u.example ? (frames[Math.min(u.example.line, frames.length - 1)] ?? null) : null;
  const exPrev = exampleOn && u.example && u.example.line > 0 ? (frames[u.example.line - 1] ?? null) : null;
  const pointer = exState && exPrev ? ([...exState.shaded, ...exState.crossed].find((i) => !exPrev.shaded.includes(i) && !exPrev.crossed.includes(i)) ?? null) : null;
  const practiceLocked = practice && !!task && !!u.practice[task.id];
  const modes = {
    symbol: u.modes.symbol && !practice,
    equivalent: u.modes.equivalent && !practice,
    numberline: u.modes.numberline && !practice && view !== 'numberline',
    labels: labelsOn && !practice,
  };
  const value = task && run ? cardValue(task, run.state, run.done) : null;

  /* ---------- HUD registration ---------- */
  const canCheck = !!task && !!run && !run.done && !exampleOn && answered(task, run.state);
  const commands: SceneCommand[] = [
    { id: 'check', key: 'c', label: t(locale, 'math.cmd.check'), disabled: !canCheck, run: () => ctl.check() },
    { id: 'hint', key: 'i', label: t(locale, 'math.cmd.hint'), disabled: !ctl.canHint(), run: () => ctl.hint() },
    { id: 'undo', key: 'u', label: t(locale, 'math.cmd.undo'), disabled: !ctl.canUndo(), run: () => ctl.undo() },
    { id: 'example', key: 'w', label: t(locale, 'math.cmd.example'), disabled: !task?.example || practice, run: () => ctl.example() },
  ];
  const status = practice
    ? [`${UP(t('en', 'math.status.practice'))} ${index + 1}/${tasks.length}`, UP(t('en', 'math.status.assistsOff'))]
    : task && run
      ? [`${UP(t('en', 'math.status.task'))} ${index + 1}/${tasks.length}`, ...(value ? [`${UP(t('en', 'math.status.value'))} ${formatFrac(value)}`] : []), ...(run.done ? [UP(t('en', 'math.status.done'))] : [])]
      : [`${UP(t('en', 'math.status.specimen'))} 3/4`];
  const [cardExpanded, setCardExpanded] = useState(false);
  const specRows = useMemo<SpecRow[]>(
    () => [
      { id: 'steps', label: both('math.spec.steps'), value: String(lesson.steps.length).padStart(2, '0'), mono: true, source: 'ref' },
      { id: 'tasks', label: both('math.spec.tasks'), value: String(lesson.steps.reduce((n, x) => n + x.tasks.length, 0)), mono: true, source: 'ref' },
      { id: 'practice', label: both('math.spec.practice'), value: String(lesson.practice.length), mono: true },
      { id: 'levels', label: both('math.spec.levels'), value: 'P2–P3 (+P4)', mono: true, source: 'ref' },
      { id: 'denominators', label: both('math.spec.denominators'), value: '≤ 12', mono: true, source: 'ref' },
    ],
    [lesson],
  );

  const controls = useMemo<SceneControls>(() => {
    const presets: ScenePreset[] = views.map((v) => ({ id: v, label: both(VIEW_KEY[v]), title: both(VIEW_KEY[v]) }));
    const modeItems: SceneMode[] = [
      { id: 'symbol', key: 's', label: t(locale, 'math.mode.symbol'), on: modes.symbol, disabled: practice },
      { id: 'equivalent', key: 'e', label: t(locale, 'math.mode.equivalent'), on: modes.equivalent, disabled: practice },
      { id: 'numberline', key: 'n', label: t(locale, 'math.mode.numberline'), on: modes.numberline, disabled: practice || view === 'numberline' },
      { id: 'presentation', key: 'p', label: t(locale, 'present.mode'), on: presenting, tone: 'signal', status: presentationStatus, phone: false },
    ];
    return {
      presets: {
        items: presets,
        set: (id) => ctl.setView(id as ModelView),
        current: views.includes(view) ? view : null,
        status: `${UP(t('en', 'math.status.model'))} ${UP(t('en', VIEW_KEY[view]))}`,
      },
      modes: {
        items: modeItems,
        set: (id, on, { instant }) => {
          if (id === 'presentation') {
            if (on) startPresentation(null, instant);
            else stopPresentation(true);
            return;
          }
          if (id === 'symbol' || id === 'equivalent' || id === 'numberline') ui.setState((x) => ({ modes: { ...x.modes, [id]: on } }));
        },
      },
      // Labels are an assist: none in the practice.
      labels: !practice,
      commands,
      specRows,
      status,
      card: both('math.card.title'),
      cardToggle: { expanded: cardExpanded, set: setCardExpanded },
      panels: { panel01: both('math.panel.history'), panel02: both('math.panel.working'), panel03: both('math.panel.state') },
      beats: beatControls,
      goToTask: (id) => ctl.goToTask(id),
      escape: () => {
        if (isPresenting()) {
          stopPresentation(true);
          return true;
        }
        if (ui.getState().example) {
          ui.setState({ example: null });
          return true;
        }
        if (ui.getState().preview !== null) {
          ui.setState({ preview: null });
          return true;
        }
        return false;
      },
      test: {
        task: () => ctl.info(),
        tasks: () => {
          const firstWrong = (x: (typeof lesson.steps)[number]['tasks'][number]) =>
            x.feedback.wrong.find((w) => w.sample)?.when ?? (x.kind === 'choose' ? (x.options.find((o) => !o.correct && o.misconception)?.misconception ?? null) : null);
          return [
            ...lesson.steps.flatMap((st) => st.tasks.map((x, i) => ({ step: st.id, index: i + 1, id: x.id, kind: x.kind, example: !!x.example, practice: false, wrong: firstWrong(x) }))),
            ...lesson.practice.map((q, i) => ({ step: practiceChapter, index: i + 1, id: q.id, kind: q.task.kind, example: false, practice: true, wrong: firstWrong(q.task) })),
          ];
        },
        goToTask: (stepId: string, i: number, options?: { instant?: boolean }) => ctl.goTo(stepId, i - 1, options?.instant ?? false),
        solve: () => ctl.solve(),
        answer: (code: MisconceptionCode | 'correct') => ctl.answer(code),
        act: (action: Action) => ctl.act(action),
        practice: () => ctl.practiceInfo(),
      },
    };
    // `commands`, `status` and the modes are rebuilt from state every render; the deps below cover what they read.
  }, [ctl, ui, u, s, run, task, view, views.join(','), practice, presenting, presentationStatus, beatControls, isPresenting, startPresentation, stopPresentation, specRows, cardExpanded, locale, labelsOn, canCheck]);
  useSceneControls(controls);

  /* ---------- tray placement ---------- */
  const trayStyle = L.tray ? { left: L.tray.left, width: L.tray.width, bottom: L.tray.bottom } : undefined;
  const narrow = coarse || (task ? partsAreNarrow(task, Math.min(900, L.free.w - 60)) : false);
  const exLines = task?.example?.say.length ?? 0;
  const exampleLine = exampleOn && u.example && task?.example ? { line: u.example.line, lines: exLines, say: tx(task.example.say[Math.min(u.example.line, exLines - 1)]!, locale) } : null;
  const revisit = practice && task && run?.done && !u.practice[task.id]?.ok ? lesson.practice[index]?.revisit.map((id) => ({ id, number: String(numbers.get(id) ?? 0).padStart(2, '0') })) : undefined;
  const segments = chapters.filter((c) => lesson.steps.some((x) => x.id === c.id) || c.id === practiceChapter).map((c) => ({ id: c.id, number: String(numbers.get(c.id) ?? 0).padStart(2, '0'), title: tx(c.title, locale), practice: c.id === practiceChapter }));
  const showSummary = practice && u.summary;
  const background = place.kind === 'background';

  return (
    <div className="ms-root" ref={rootRef} data-presenting={presenting || undefined}>
      <svg className="ms-svg" data-stage-surface="" width={L.w} height={L.h} viewBox={`0 0 ${Math.max(1, L.w)} ${Math.max(1, L.h)}`} role="group" aria-label={t(locale, 'math.stage')}>
        <Defs id={defs} />
        {!showSummary &&
          (background ? (
            <StageContent defs={defs} box={L.free} locale={locale} modes={modes} specimen={view} />
          ) : (
            <StageContent
              defs={defs}
              box={L.free}
              locale={locale}
              modes={modes}
              task={exTask ?? task}
              state={exState ?? preview ?? run?.state ?? null}
              run={exTask ? null : run}
              view={exTask ? exTask.model.kind : view}
              editable={!exTask && !preview && !practiceLocked && !!run && !run.done}
              pointer={pointer}
              ctl={ctl}
            />
          ))}
        {u.pulse > 0 && !showSummary && <rect key={u.pulse} className="ms-pulse" x={L.free.x - 6} y={L.free.y - 6} width={L.free.w + 12} height={L.free.h + 12} />}
      </svg>
      {showSummary && (
        <PracticeSummary lesson={lesson} results={u.practice} numbers={numbers} ctl={ctl} locale={locale} style={{ left: L.free.x, top: L.free.y, width: L.free.w, maxHeight: L.free.h }} />
      )}
      {preview && (
        <button type="button" className="ms-btn ms-preview-chip" style={{ left: L.free.x, top: L.free.y }} onClick={() => ui.setState({ preview: null })}>
          {t(locale, 'math.history.back')}
        </button>
      )}
      <div ref={trayRef} className="ms-tray-slot" style={trayStyle} hidden={presenting || !L.tray}>
        {background ? (
          <div className="ms-tray" data-hud-panel="task" role="group" aria-label={t(locale, 'math.tray.label')}>
            <div className="ms-tray__head">
              <p className="ms-tray__prompt">{renderRich(t(locale, 'math.start.line'), locale)}</p>
              <button type="button" className="ms-btn ms-tray__next" data-done="" onClick={() => ctl.next()}>
                {t(locale, 'math.start.go')} <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        ) : showSummary ? null : (
          <Tray
            ctl={ctl}
            lesson={lesson}
            task={task}
            run={run}
            where={task ? { step: chapterNo, index: index + 1, count: tasks.length } : null}
            practice={practice}
            example={exampleLine}
            revisit={revisit}
            narrow={narrow}
            readout={phone}
            locale={locale}
          />
        )}
      </div>
      {presentation.element}

      <SceneSlot name="card">
        <FractionCard task={showSummary ? null : (exTask ?? task)} state={exState ?? preview ?? run?.state ?? null} done={!exTask && !!run?.done} specimen={background} expanded={cardExpanded} locale={locale} />
      </SceneSlot>
      <SceneSlot name="panel01">
        <HistoryPanel run={run} ui={ui} locale={locale} />
      </SceneSlot>
      <SceneSlot name="panel02">
        <WorkingPanel task={exTask ?? task} state={exState ?? preview ?? run?.state ?? null} done={!!run?.done} locale={locale} />
      </SceneSlot>
      <SceneSlot name="panel03">
        <StatePanel
          task={exTask ?? task}
          state={exState ?? preview ?? run?.state ?? null}
          done={!exTask && !!run?.done}
          practice={practice ? { index: index + 1, total: tasks.length } : null}
          lesson={lesson}
          answered={Object.keys(u.practice).length}
        />
      </SceneSlot>
      <SceneSlot name="stageOverlay">
        <MathOverlay glossary={(file.glossary?.terms.length ?? 0) > 0} compact={phone} />
      </SceneSlot>
      <SceneSlot name="bottomBar">
        <StepBar
          lesson={lesson}
          ctl={ctl}
          ui={u}
          segments={segments}
          chapter={s.chapter}
          index={index}
          canCheck={canCheck}
          canHint={ctl.canHint()}
          status={background ? UP(t('en', 'chapter.background')) : `${practice ? UP(t('en', 'math.status.practice')) : `${UP(t('en', 'math.status.step'))} ${chapterNo}`} · ${index + 1}/${tasks.length}`}
          locale={locale}
        />
      </SceneSlot>
      <SceneSlot name="inspector">
        <TaskInspector task={task} run={run} step={step} lesson={lesson} where={`${chapterNo} · ${index + 1}/${Math.max(1, tasks.length)}`} practice={practice} locale={locale} />
      </SceneSlot>
    </div>
  );
}
