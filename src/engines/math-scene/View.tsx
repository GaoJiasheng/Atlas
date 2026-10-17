/**
 * MathScene view (docs/15 §4, §10): an explanation-first lesson on an SVG
 * stage inside the technical-plate HUD. Each step is told in beats (the
 * stage animates the model, the number sentence sits under it, the caption
 * is the reading panel's beat line) and ends in one short check drawn from
 * the step's pool; the practice chapter is eight fixed questions.
 *
 * HUD (docs/08 §2 全引擎 HUD 铁律): the chapter axis at the bottom (core
 * `ChapterAxis`: a segment per chapter, a circle per beat, the check and the
 * practice questions as squares; click = go there, nothing runs by itself),
 * the top-right FRACTION card, the left column's compact PLATE block, and in
 * the reading panel: beat line → check tray (on the check) → chapter body →
 * chapter index (key facts, syllabus links). Registers the VIEW group as the
 * model switch on a check (core C2), the display modes S / E / N (+ host L)
 * and P, the commands C check · I hint · U undo (core C3), `,` / `.` beats,
 * the test hooks `__atlas.engine` (C7) and `<Beat n>` / `<Task id>` links
 * (C9). The presentation walks the beats and stops at each check with the
 * tray in its caption card; auto-play waits until it is answered, shown or
 * skipped (core C4).
 */
import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useStore } from 'zustand';
import type { EngineViewProps } from '../core/types';
import { SceneSlot, useHud, useScene, useSceneContext, useSceneControls, useSceneStore } from '../core/context';
import type { SceneCommand, SceneControls, SceneMode, ScenePreset, SpecRow } from '../core/controls';
import { usePresentation, type PresentationAdapter } from '../core/presentation';
import { chapterNumbers } from '../core/chapters';
import { ChapterAxis, type AxisChapter } from '../core/axis/ChapterAxis';
import { axisCounter, flatIndex } from '../core/axis/axis';
import { t, tx, type BilingualText } from '../../i18n';
import { NotationContext, renderRich, speakable } from '../../lib/rich-text';
import type { MathSceneExt } from './index';
import type { MathChapterState, MathSceneData, MisconceptionCode, ModelView } from './schema';
import { createMathUi } from './ui';
import { createController } from './controller';
import { lessonBeats, type LessonBeat } from './lib/beats';
import { beatCount, viewsFor } from './lib/lesson';
import { answered } from './lib/check';
import type { Action } from './lib/state';
import { cardValue, workingLines } from './lib/working';
import { formatFrac } from './lib/fraction';
import { Defs } from './stage/svg';
import { SPECIMEN_ARRAY, SPECIMEN_DECIMAL, SPECIMEN_GRID, StageContent } from './stage/Stage';
import { isDecimalModel } from './lib/decimal-tasks';
import { beatCounts, beatFraction, beatPair, beatShape } from './stage/BeatModel';
import { useStageLayout, type LayoutMode, type Rect } from './stage/layout';
import { Tray, partsAreNarrow } from './tray/Tray';
import { Card, CARD_TITLE, cardKindOf, type CardKind } from './hud/cards';
import { decimalPlateRows, valuePlateRows } from './hud/plate';
import { factsOf, figureOf } from './lib/grid';
import type { GridModelSpec, Model } from './schema';
import { isFractionModel } from './lib/check';
import { MathOverlay } from './hud/Overlay';
import { BeatLine } from './hud/BeatLine';
import { ChapterIndex } from './hud/ChapterIndex';
import { PlateBlock, modelRows, type PlateRow } from './hud/PlateBlock';
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
  grid: 'math.view.grid',
  array: 'math.view.array',
  blocks: 'math.view.blocks',
  clock: 'math.view.clock',
  timeline: 'math.view.timeline',
  'decimal-grid': 'math.view.decimalGrid',
  'place-value': 'math.view.placeValue',
  money: 'math.view.money',
};
const SPECIMEN_VIEWS: ModelView[] = ['bar', 'circle', 'numberline', 'wall'];

/** The plate's rows for a grid: unit, squares laid, sides walked or traced (the child's on a check). */
function gridRows(m: GridModelSpec, state: { tiles: string[]; edges: string[] } | null): PlateRow[] {
  const f = figureOf(m);
  const facts = f ? factsOf(f) : null;
  const tiles = f ? m.tiles?.[f.id] : undefined;
  const walk = f ? m.walk?.[f.id] : undefined;
  const squares = state ? state.tiles.length : facts && tiles !== undefined ? (tiles === 'all' ? facts.whole + facts.halfCount : typeof tiles === 'number' ? tiles : (tiles.count ?? 0)) : null;
  const sides = state ? state.edges.length : facts && walk !== undefined ? (walk === 'all' ? facts.walk.length : walk) : null;
  return [
    { key: 'math.plate.model', value: 'GRID' },
    { key: 'math.plate.unit', value: m.unit === 'unit' ? 'UNIT' : m.unit.toUpperCase() },
    { key: 'math.plate.squares', value: squares === null ? '—' : String(squares) },
    { key: 'math.plate.sides', value: sides === null ? '—' : String(sides), on: true },
  ];
}
/** A beat's model change settles (the stage is SVG: a short ease). */
const BEAT_SETTLE_MS = 650;
/** Height of the number-sentence line under the model. */
const EQUATION_H = 58;

type Saved = { chapter: string | null; beat: number; model: ModelView | null };

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
  const { hud, actions } = useSceneContext();
  const [ui] = useState(createMathUi);
  const practiceChapter = useMemo(() => chapters.find((c) => (c.state as MathChapterState).practice)?.id ?? null, [chapters]);
  const numbers = useMemo(() => chapterNumbers(chapters), [chapters]);
  const ctl = useMemo(
    () =>
      createController(lesson, store, ui, practiceChapter, {
        // Below 1024 px the reader is a sheet and the check sits on the stage instead.
        openReader: () => actions.setReader(true),
      }),
    [lesson, store, ui, practiceChapter, actions],
  );
  const defs = `ms${useId().replace(/[^a-z0-9]/gi, '')}`;

  const s = useScene<MathSceneExt, Saved>((st) => ({ chapter: st.chapter, beat: st.beat, model: st.model }));
  const u = useStore(ui);
  const cur = ctl.current();
  const { place, practice, slot, task, run, step } = cur;
  const background = place.kind === 'background';
  // A lesson on the square grid (area and perimeter): its own card, plate rows, specimen and no fraction assists.
  const gridLesson = useMemo(() => lesson.steps.some((x) => x.beats.some((b) => b.model.kind === 'grid')), [lesson]);
  // A lesson on decimals (it draws the hundred grid, the decimal chart or line, money) also draws bars, but it is not a fraction lesson.
  const decimalLesson = useMemo(() => lesson.steps.some((x) => x.beats.some((b) => isDecimalModel(b.model))), [lesson]);
  // The fraction assists (S / E / N, labels) and specimen belong to a lesson on fractions; another lesson's background shows its first model.
  const fractionLesson = useMemo(() => !decimalLesson && lesson.steps.some((x) => x.beats.some((b) => isFractionModel(b.model))), [lesson, decimalLesson]);
  const firstKind = lesson.steps[0]?.beats[0]?.model.kind ?? 'bar';
  const specimenModel: Model | null = fractionLesson ? null : decimalLesson ? SPECIMEN_DECIMAL : firstKind === 'grid' ? SPECIMEN_GRID : firstKind === 'array' || firstKind === 'blocks' || firstKind === 'numberline' ? SPECIMEN_ARRAY : null;
  const lessonCard: CardKind = fractionLesson ? 'fraction' : cardKindOf(specimenModel, null, 'fraction');
  const assists = fractionLesson;
  const explain = slot.kind === 'explain' ? slot.beat : null;
  const number = (id: string | null) => {
    const c = chapters.find((x) => x.id === id);
    return c?.kind === 'background' ? t(locale, 'chapter.backgroundShort') : String(numbers.get(id ?? '') ?? 0).padStart(2, '0');
  };
  const chapterNo = number(s.chapter);
  const hudOn = useHud((h) => h.hud);
  const labelsOn = useHud((h) => h.labels);
  const axisOpen = useHud((h) => h.panelsOpen);
  const coarse = useMedia('(pointer: coarse)');
  // Reduced motion: a beat that moves things in place (the array, the blocks) is redrawn and faded in instead.
  const reduced = useMedia('(prefers-reduced-motion: reduce)');
  const phone = useMedia('(max-width: 759px)');
  // Below 1024 px the reader is a sheet over the stage: the check tray docks on the stage above the axis.
  const sheet = useMedia('(max-width: 1023px)');

  // Labels (L) name every part 1/n: an assist the reader switches on, so the lesson starts without them.
  useEffect(() => hud.setState({ labels: false }), [hud]);

  /* ---------- entering a chapter draws its check; a beat past the end shows the last one ---------- */
  useEffect(() => {
    ctl.visit(s.chapter);
    ui.setState({ summary: false });
  }, [s.chapter, ctl, ui]);
  useEffect(() => {
    const n = beatCount(place);
    if (s.beat > n - 1) store.getState().patch({ beat: n - 1 });
  }, [s.beat, place, store]);

  /* ---------- the view on a check: the VIEW group's model, else the task's own ---------- */
  const views = task && slot.kind === 'check' ? viewsFor(step, task) : background && fractionLesson ? SPECIMEN_VIEWS : [];
  const view: ModelView = task ? (s.model && views.includes(s.model) ? s.model : task.model.kind) : !fractionLesson && specimenModel ? specimenModel.kind : (s.model ?? 'bar');

  /* ---------- the flat list of beats (axis ticks, `,` / `.`) ---------- */
  const flat = useMemo(() => chapters.flatMap((c) => Array.from({ length: ctl.beatCount(c.id) }, (_, index) => ({ chapter: c.id, index }))), [chapters, ctl]);

  /* ---------- PRESENTATION: beats from the data (explanation beats, then the check) ---------- */
  const captions = useMemo(() => ({ check: both('math.check.beat'), summary: both('math.summary.beat') }), []);
  const adapter: PresentationAdapter<LessonBeat, Saved> = {
    beatsOf: (c) => lessonBeats(lesson, c.id, c.id === practiceChapter, captions),
    captionOf: (b, l) => speakable(tx(b.caption, l), l),
    renderCaption: (b, l) => renderRich(tx(b.caption, l), l),
    applyBeat: (b, { instant }) => {
      const spec = b.spec;
      const st = store.getState();
      // The summary beat stays on the last question (its index is one past it).
      st.applyState({ chapter: b.chapter, beat: spec ? (spec.kind === 'summary' ? spec.index - 1 : spec.index) : 0, model: null }, { instant });
      ui.setState({ summary: spec?.kind === 'summary' });
      const { task: now } = ctl.current();
      if (now && (spec?.kind === 'check' || spec?.kind === 'question') && !(practice && ui.getState().practice[now.id])) ctl.reset(now);
      return instant ? undefined : new Promise<void>((resolve) => window.setTimeout(resolve, BEAT_SETTLE_MS));
    },
    gate: (b) => {
      if (b.spec?.kind !== 'check' && b.spec?.kind !== 'question') return null;
      const open = () => {
        const { task: now } = ctl.current();
        if (!now) return true;
        const r = ui.getState().runs[now.id];
        return ui.getState().skipped[now.id] === true || (!!r && (r.done || r.revealed));
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
    onEnter: () => ui.setState({ presenting: true, skipped: {} }),
    saveState: () => ({ chapter: store.getState().chapter, beat: store.getState().beat, model: store.getState().model }),
    restoreState: (saved) => {
      ui.setState({ presenting: false, summary: false });
      store.getState().applyState(saved, { instant: false });
    },
    cardActions:
      u.presenting && task && run && !u.summary ? <Tray ctl={ctl} task={task} run={run} where={null} practice={practice} pool={step?.pool.length} compact captioned={practice} narrow={coarse} locale={locale} /> : undefined,
  };
  const presentation = usePresentation(adapter);
  const { presenting, isPresenting, status: presentationStatus, controls: beatControls, start: startPresentation, stop: stopPresentation } = presentation;

  /** `,` / `.` and the beat line's ‹ ›: one beat back / on, across chapters; in the presentation, its own step. */
  const beatStep = useCallback(
    (direction: 1 | -1) => {
      if (isPresenting()) {
        const now = beatControls.current();
        const all = presentation.beats;
        const i = now ? all.findIndex((b) => b.chapter === now.chapter && b.index === now.beat) + direction : -1;
        if (i >= 0 && i < all.length) beatControls.go(i, { instant: false });
        return;
      }
      const st = store.getState();
      const i = flatIndex(flat, st.chapter, Math.min(st.beat, ctl.beatCount(st.chapter ?? '') - 1)) + direction;
      const target = flat[i];
      if (target) ctl.goToBeat(target.chapter, target.index);
    },
    [isPresenting, beatControls, presentation.beats, store, flat, ctl],
  );
  const at = flatIndex(flat, s.chapter, cur.beat);

  /* ---------- `<Beat n>` links in the body: the one on show is marked ---------- */
  useEffect(() => {
    for (const el of document.querySelectorAll<HTMLElement>('[data-task^="beat-"]')) {
      if (el.dataset.task === `beat-${cur.beat + 1}` && slot.kind === 'explain') el.setAttribute('aria-current', 'step');
      else el.removeAttribute('aria-current');
    }
  }, [cur.beat, slot.kind, s.chapter]);

  /* ---------- layout ---------- */
  const rootRef = useRef<HTMLDivElement>(null);
  const trayRef = useRef<HTMLDivElement>(null);
  const mode: LayoutMode = presenting ? 'present' : hudOn ? 'hud' : 'bare';
  const L = useStageLayout(rootRef, trayRef, mode, `${s.chapter}|${cur.beat}|${u.summary}|${run?.state.phase}|${run?.feedback?.tone}|${sheet}|${locale}`);

  // The docked tray's band in the HUD grid (math-scene.css): the left and right columns end above it.
  const docked = sheet && !presenting && !(practice && u.summary) && !!task && !!run;
  useLayoutEffect(() => {
    const scene = rootRef.current?.closest<HTMLElement>('.atlas-scene');
    if (!scene) return;
    const h = docked && trayRef.current ? `${Math.ceil(trayRef.current.offsetHeight)}px` : '0px';
    if (scene.style.getPropertyValue('--task-h') !== h) scene.style.setProperty('--task-h', h);
  });
  useEffect(() => {
    const scene = rootRef.current?.closest<HTMLElement>('.atlas-scene');
    return () => {
      scene?.style.removeProperty('--task-h');
    };
  }, []);

  /* ---------- what the stage draws ---------- */
  const practiceLocked = practice && !!task && !!u.practice[task.id];
  const modes = {
    symbol: u.modes.symbol && !practice,
    equivalent: u.modes.equivalent && !practice,
    numberline: u.modes.numberline && !practice && view !== 'numberline',
    labels: labelsOn && !practice,
  };
  const equation = explain ? (explain.equation ?? (explain.words ? tx(explain.words, locale) : null)) : task && run && !practice ? (workingLines(task, run.state, locale, run.done, lesson.notation).at(-1) ?? null) : null;
  const modelBox: Rect = equation ? { ...L.free, h: Math.max(0, L.free.h - EQUATION_H) } : L.free;
  // The sentence sits right under the drawing (its bounding box), not at the foot of the free rectangle.
  const drawingRef = useRef<SVGGElement>(null);
  const [equationTop, setEquationTop] = useState(0);
  useLayoutEffect(() => {
    const g = drawingRef.current;
    if (!g || !equation) return;
    const bb = g.getBBox();
    const top = Math.round(Math.min(modelBox.y + modelBox.h, Math.max(modelBox.y, bb.y + bb.height + 10)));
    if (top !== equationTop) setEquationTop(top);
  });
  const value = task && run ? cardValue(task, run.state, run.done) : explain ? beatFraction(explain) : background && fractionLesson ? { n: 3, d: 4 } : null;
  /** The model on show (a check's, a beat's, the specimen's): it picks the card and the plate rows. */
  const modelOnShow: Model | null = task ? task.model : explain ? explain.model : background ? specimenModel : null;
  const gridOnShow: GridModelSpec | null = modelOnShow?.kind === 'grid' ? modelOnShow : null;
  const cardKind: CardKind = showSummaryOf(practice, u.summary) ? lessonCard : cardKindOf(modelOnShow, task, lessonCard);

  /* ---------- HUD registration ---------- */
  const canCheck = !!task && !!run && !run.done && answered(task, run.state);
  const commands: SceneCommand[] = [
    { id: 'check', key: 'c', label: t(locale, 'math.cmd.check'), disabled: !canCheck, run: () => ctl.check() },
    { id: 'hint', key: 'i', label: t(locale, 'math.cmd.hint'), disabled: !ctl.canHint(), run: () => ctl.hint() },
    { id: 'undo', key: 'u', label: t(locale, 'math.cmd.undo'), disabled: !ctl.canUndo(), run: () => ctl.undo() },
  ];
  const count = beatCount(place);
  const status = practice
    ? [`${UP(t('en', 'math.status.practice'))} ${cur.beat + 1}/${count}`, UP(t('en', 'math.status.assistsOff'))]
    : slot.kind === 'check' && run
      ? [UP(t('en', 'math.check.title')), ...(value ? [`${UP(t('en', 'math.status.value'))} ${formatFrac(value)}`] : []), ...(run.done ? [UP(t('en', 'math.status.done'))] : [])]
      : explain
        ? [`${UP(t('en', 'math.beat.label'))} ${cur.beat + 1}/${count - 1}`, ...(value ? [`${UP(t('en', 'math.status.value'))} ${formatFrac(value)}`] : [])]
        : [`${UP(t('en', 'math.status.specimen'))} ${fractionLesson ? '3/4' : decimalLesson ? '0.35' : gridLesson && firstKind === 'grid' ? '4 × 3' : '3 × 4'}`];
  const [cardExpanded, setCardExpanded] = useState(false);
  const specRows = useMemo<SpecRow[]>(
    () => [
      { id: 'steps', label: both('math.spec.steps'), value: String(lesson.steps.length).padStart(2, '0'), mono: true, source: 'ref' },
      { id: 'beats', label: both('math.spec.beats'), value: String(lesson.steps.reduce((n, x) => n + x.beats.length, 0)), mono: true },
      { id: 'checks', label: both('math.spec.checks'), value: `${lesson.steps.length} × ${Math.min(...lesson.steps.map((x) => x.pool.length))}–${Math.max(...lesson.steps.map((x) => x.pool.length))}`, mono: true },
      { id: 'practice', label: both('math.spec.practice'), value: String(lesson.practice.length), mono: true },
      ...(fractionLesson
        ? [{ id: 'denominators', label: both('math.spec.denominators'), value: '≤ 12', mono: true, source: 'ref' as const }]
        : decimalLesson
          ? [{ id: 'places', label: both('math.spec.places'), value: '≤ 3', mono: true, source: 'ref' as const }]
          : gridLesson && firstKind === 'grid'
          ? [{ id: 'units', label: both('math.spec.units'), value: 'cm · m · cm² · m²', mono: true, source: 'ref' as const }]
          : maxNumber(lesson) !== null
            ? [{ id: 'numbers', label: both('math.spec.numbers'), value: `≤ ${maxNumber(lesson)}`, mono: true, source: 'ref' as const }]
            : []),
    ],
    [lesson, gridLesson, fractionLesson, decimalLesson, firstKind],
  );

  const controls = useMemo<SceneControls>(() => {
    const presets: ScenePreset[] = views.map((v) => ({ id: v, label: both(VIEW_KEY[v]), title: both(VIEW_KEY[v]) }));
    const modeItems: SceneMode[] = [
      // The S / E / N assists are about fractions: a lesson on the grid, whole numbers or time has none.
      ...(!assists
        ? []
        : [
            { id: 'symbol', key: 's', label: t(locale, 'math.mode.symbol'), on: modes.symbol, disabled: practice },
            { id: 'equivalent', key: 'e', label: t(locale, 'math.mode.equivalent'), on: modes.equivalent, disabled: practice },
            { id: 'numberline', key: 'n', label: t(locale, 'math.mode.numberline'), on: modes.numberline, disabled: practice || view === 'numberline' },
          ]),
      { id: 'presentation', key: 'p', label: t(locale, 'present.mode'), on: presenting, tone: 'signal', status: presentationStatus, phone: false },
    ];
    return {
      ...(presets.length > 0
        ? {
            presets: {
              items: presets,
              set: (id: string) => ctl.setView(id as ModelView),
              current: views.includes(view) ? view : null,
              status: `${UP(t('en', 'math.status.model'))} ${UP(t('en', VIEW_KEY[view]))}`,
            },
          }
        : {}),
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
      // Labels are an assist (each part named 1/n): none in the practice, none outside a fraction lesson.
      labels: !practice && assists,
      commands,
      specRows,
      status,
      card: both(CARD_TITLE[cardKind]),
      cardToggle: { expanded: cardExpanded, set: setCardExpanded },
      beats: beatControls,
      beatStep,
      goToTask: (id) => ctl.goToTask(id),
      escape: () => {
        if (isPresenting()) {
          stopPresentation(true);
          return true;
        }
        return false;
      },
      test: {
        task: () => ctl.info(),
        tasks: () => ctl.tasks(),
        goToTask: (stepId: string, i: number, options?: { instant?: boolean }) => ctl.goToTaskAt(stepId, i, options?.instant ?? false),
        goToBeat: (chapter: string, i: number) => ctl.goToBeat(chapter, i - 1),
        another: () => ctl.another(),
        skip: () => ctl.skip(),
        solve: () => ctl.solve(),
        answer: (code: MisconceptionCode | 'correct') => ctl.answer(code),
        act: (action: Action) => ctl.act(action),
        practice: () => ctl.practiceInfo(),
      },
    };
    // `commands`, `status` and the modes are rebuilt from state every render; the deps below cover what they read.
  }, [ctl, ui, u, s, run, task, view, views.join(','), practice, presenting, presentationStatus, beatControls, beatStep, isPresenting, startPresentation, stopPresentation, specRows, cardExpanded, locale, labelsOn, canCheck, assists, cardKind]);
  useSceneControls(controls);

  /* ---------- the chapter axis ---------- */
  const axisChapters = useMemo<AxisChapter[]>(
    () =>
      chapters.map((c) => {
        const beats = lessonBeats(lesson, c.id, c.id === practiceChapter, captions)?.filter((b) => b.kind !== 'summary');
        return {
          id: c.id,
          number: number(c.id),
          title: tx(c.title, locale),
          beats: beats ? beats.map((b) => speakable(tx(b.caption, locale), locale)) : [speakable(tx((c.state as MathChapterState).summary ?? c.title, locale), locale)],
        };
      }),
    // `number` reads `chapters`, `numbers` and `locale`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [chapters, lesson, practiceChapter, captions, numbers, locale],
  );

  // The check and the practice questions are squares on the axis (the core axis draws circles; the shape is ours).
  useEffect(() => {
    for (const c of axisChapters) {
      const st = lesson.steps.find((x) => x.id === c.id);
      const squares = c.id === practiceChapter ? c.beats.map((_, k) => k) : st ? [st.beats.length] : [];
      for (const k of squares) document.querySelector(`.atlas-axis__tick[data-beat="${c.id}.${k}"]`)?.setAttribute('data-shape', 'square');
    }
  });

  /* ---------- the plate ---------- */
  const plateRows: PlateRow[] = practice
    ? [
        { key: 'math.state.question', value: `${cur.beat + 1}/${count}`, on: true },
        { key: 'math.state.answered', value: `${Object.keys(u.practice).length}/${lesson.practice.length}` },
        { key: 'math.state.assists', value: UP(t('en', 'math.state.off')) },
      ]
    : gridOnShow
      ? gridRows(gridOnShow, task && run && task.kind !== 'choose' && task.kind !== 'input' ? run.state : null)
      : modelOnShow && decimalPlateRows(modelOnShow, task, run?.state ?? null, !!run?.done)
        ? decimalPlateRows(modelOnShow, task, run?.state ?? null, !!run?.done)!
      : modelOnShow && valuePlateRows(modelOnShow, task, run?.state ?? null, !!run?.done)
        ? valuePlateRows(modelOnShow, task, run?.state ?? null, !!run?.done)!
      : explain
      ? modelRows(t('en', VIEW_KEY[explain.model.kind]), beatCounts(explain).parts, beatCounts(explain).marked, value)
      : task && run
        ? modelRows(t('en', VIEW_KEY[view]), run.state.parts * run.state.wholes || null, run.done || slot.kind === 'check' ? run.state.shaded.length + run.state.given.length - run.state.crossed.length : null, value)
        : modelRows(t('en', VIEW_KEY[view]), 4, 3, value);

  const narrow = coarse || (task ? partsAreNarrow(task, Math.min(900, L.free.w - 60)) : false);
  const revisit = practice && task && run?.done && !u.practice[task.id]?.ok ? lesson.practice[cur.beat]?.revisit.map((id) => ({ id, number: number(id) })) : undefined;
  const showSummary = practice && u.summary;
  const where = slot.kind === 'check' ? `${chapterNo} · ${UP(t('en', 'math.check.title'))}` : practice ? `${chapterNo} · ${cur.beat + 1} / ${count}` : null;
  const beatCaption = explain ? tx(explain.caption, locale) : null;

  return (
    <NotationContext.Provider value={lesson.notation}>
    <div className="ms-root" ref={rootRef} data-presenting={presenting || undefined}>
      <svg className="ms-svg" data-stage-surface="" width={L.w} height={L.h} viewBox={`0 0 ${Math.max(1, L.w)} ${Math.max(1, L.h)}`} role="group" aria-label={t(locale, 'math.stage')}>
        <Defs id={defs} />
        {!showSummary &&
          (background ? (
            <StageContent defs={defs} box={modelBox} locale={locale} modes={modes} specimen={fractionLesson || specimenModel ? view : undefined} />
          ) : explain ? (
            <g ref={drawingRef} key={`${s.chapter}|${beatShape(explain)}${reduced ? `|${cur.beat}` : ''}`} className="ms-beat" data-move={explain.move ?? 'none'} data-model={explain.model.kind}>
              <StageContent defs={defs} box={modelBox} locale={locale} modes={modes} beat={explain} />
            </g>
          ) : (
            <g ref={drawingRef} key={task?.id ?? 'none'} className="ms-beat" data-move="morph">
              <StageContent defs={defs} box={modelBox} locale={locale} modes={modes} task={task} state={run?.state ?? null} run={run} view={view} editable={!practiceLocked && !!run && !run.done} ctl={ctl} />
            </g>
          ))}
        {u.pulse > 0 && !showSummary && !explain && <rect key={u.pulse} className="ms-pulse" x={L.free.x - 6} y={L.free.y - 6} width={L.free.w + 12} height={L.free.h + 12} />}
      </svg>
      {equation && !showSummary && L.free.w > 0 && (
        <p key={`${s.chapter}|${cur.beat}|${equation}`} className="ms-equation" data-hud-panel="equation" style={{ left: L.free.x, width: L.free.w, top: equationTop || modelBox.y + modelBox.h, height: EQUATION_H }}>
          <span>{renderRich(equation, locale, { line: true })}</span>
        </p>
      )}
      {docked && task && run && (
        <div ref={trayRef} className="ms-tray-dock" style={{ bottom: L.dock }}>
          <Tray ctl={ctl} task={task} run={run} where={where} practice={practice} pool={step?.pool.length} last={practice && cur.beat === count - 1} revisit={revisit} narrow={narrow} locale={locale} />
        </div>
      )}
      {showSummary && <PracticeSummary lesson={lesson} results={u.practice} numbers={numbers} ctl={ctl} locale={locale} style={{ left: L.free.x, top: L.free.y, width: L.free.w, maxHeight: L.free.h }} />}
      {presentation.element}

      <SceneSlot name="card">
        <Card
          kind={cardKind}
          model={showSummary ? null : modelOnShow}
          beat={explain}
          task={showSummary ? null : task}
          state={run?.state ?? null}
          done={!!run?.done}
          fixed={showSummary ? null : value}
          pair={explain ? beatPair(explain) : null}
          expanded={cardExpanded}
          locale={locale}
        />
      </SceneSlot>
      <SceneSlot name="plate">
        <PlateBlock rows={plateRows} locale={locale} />
      </SceneSlot>
      <SceneSlot name="stageOverlay">
        <MathOverlay glossary={(file.glossary?.terms.length ?? 0) > 0} compact={phone} />
      </SceneSlot>
      <SceneSlot name="bottomBar">
        <ChapterAxis
          chapters={axisChapters}
          chapter={s.chapter}
          beat={cur.beat}
          open={axisOpen}
          onOpen={actions.setPanels}
          onChapter={(id) => ctl.goToBeat(id, 0)}
          onBeat={(id, k) => ctl.goToBeat(id, k)}
          status={phone ? undefined : axisCounter(chapterNo, cur.beat, count) + (slot.kind === 'check' ? ` · ${UP(t('en', 'math.check.title'))}` : '')}
          locale={locale}
        />
      </SceneSlot>
      <SceneSlot name="readerTop">
        {step?.bridge && (
          <p className="ms-further">
            <b className="atlas-chip">{t(locale, 'math.chip.further')}</b>
          </p>
        )}
        {!background && (
          <BeatLine
            kind={slot.kind === 'check' ? 'check' : practice ? 'question' : 'explain'}
            beat={cur.beat}
            count={slot.kind === 'explain' ? count - 1 : count}
            caption={beatCaption}
            canPrev={at > 0}
            canNext={at >= 0 && at < flat.length - 1}
            onStep={beatStep}
            focus={`${s.chapter}|${cur.beat}`}
            locale={locale}
          />
        )}
        {!sheet && !presenting && !showSummary && task && run && <Tray ctl={ctl} task={task} run={run} where={where} practice={practice} pool={step?.pool.length} last={practice && cur.beat === count - 1} revisit={revisit} narrow={narrow} locale={locale} />}
      </SceneSlot>
      <SceneSlot name="readerEnd">
        <ChapterIndex step={step} lesson={lesson} onCheck={() => step && ctl.goToBeat(step.id, step.beats.length)} locale={locale} />
      </SceneSlot>
    </div>
    </NotationContext.Provider>
  );
}

/** The practice summary is on show. */
const showSummaryOf = (practice: boolean, summary: boolean) => practice && summary;

/** The largest number a lesson's steps allow (its spec row), from their limits. */
function maxNumber(lesson: MathSceneData['lesson']): number | null {
  const all = lesson.steps.flatMap((x) => [x.limits?.maxValue, x.limits?.maxTotal].filter((v): v is number => v !== undefined));
  return all.length ? Math.max(...all) : null;
}
