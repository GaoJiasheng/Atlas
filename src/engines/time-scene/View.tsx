/**
 * TimeScene view: GeoStage (MapLibre) + Timeline rule + HUD content (card,
 * three panels, perf) + legend / layer toggles + event inspector, and the
 * scene controls (presets, modes, pause, status, spec rows). See docs/06
 * "TimeScene".
 *
 * Time flows through two layers:
 *  - the store's `t` (TimePoint, in the URL, set by chapters and deep links)
 *  - the playhead (continuous number the map renders at; lib/playhead.ts)
 * Chapter changes tween the playhead to the chapter's time; scrubbing and
 * playback move the playhead and write a rounded `t` back with `patch()`.
 */
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import type { Chapter, EngineViewProps, GeoCamera } from '../core/types';
import { SceneSlot, useScene, useSceneContext, useSceneControls, useSceneStore, useT } from '../core/context';
import type { SceneControls, SpecRow } from '../core/controls';
import { SceneLayerToggles, type LayerItem } from '../widgets/LayerToggles';
import { Legend, type LegendItem } from '../widgets/Legend';
import { Icon } from '../widgets/icons';
import { t as translate, tx, type BilingualText, type UiKey } from '../../i18n';
import { formatTimeParam } from '../../lib/time';
import type { TimeSceneExt } from './index';
import type { TimeSceneGeoData } from './schema';
import { buildTimeModel, type TimeModel } from './lib/model';
import { createPlayhead, type Playhead } from './lib/playhead';
import { clamp, fromNumber, stepFor, toNumber, type TimePoint } from './lib/time';
import { frameAt } from './lib/frame';
import { referencePair } from './lib/stats';
import { formatTime } from './lib/format';
import { GeoStage } from './stages/geo/GeoStage';
import type { GeoController } from './stages/geo/controller';
import { Timeline, formatReadout } from './timeline/Timeline';
import { usePlayback } from './timeline/usePlayback';
import { EventInspector } from './EventInspector';
import { BandCard, PerfReadout, QuestionPanel, StatePanel, TimelinePanel, useFps } from './hud/HudPanels';
import { BLOC_CSS, entityCssColor } from './colors';
import { blocsOf, changesBloc } from './lib/bloc';
import './time-scene.css';

const CHAPTER_TWEEN_MS = 1600;
const TOGGLE_LAYERS = ['control', 'borders', 'movements', 'battles', 'participation', 'sites'] as const;
const SQUARE_KINDS = new Set<string>(['massacre', 'atrocity']);
/** Up to this many entities, the legend names each one; above, it groups by bloc. */
const LEGEND_ENTITY_LIMIT = 6;
const OVERLAY_OPEN_MIN_WIDTH = 720;
const TEXT_INPUTS = 'input, select, textarea, [contenteditable="true"], [data-keys="own"], [role="slider"]';
/** PRESENTATION: camera flight + 1.5 s hold per chapter. */
const PRESENT_STEP_MS = 2200 + 1500;
const WORLD_CAMERA: GeoCamera = { center: [20, 10], zoom: 1.4 };

const bi = (key: UiKey): BilingualText => ({ en: translate('en', key), zh: translate('zh', key) });

/**
 * First paragraph of a chapter's pre-rendered body (panel 02 when the chapter
 * has no question or summary). Skips collapsed `<More>` blocks, the parent-only
 * `<Full>` text and source superscripts.
 */
function firstParagraph(chapterId: string): string | null {
  const article = document.querySelector(`[data-chapter-body="${CSS.escape(chapterId)}"]`);
  if (!article) return null;
  for (const p of article.querySelectorAll('p')) {
    if (p.closest('details, .atlas-full')) continue;
    const copy = p.cloneNode(true) as HTMLElement;
    for (const sup of copy.querySelectorAll('.atlas-src-refs, [data-source]')) sup.remove();
    const text = (copy.textContent ?? '').replace(/\s+/g, ' ').trim();
    if (text) return text;
  }
  return null;
}
const pad2 = (n: number) => String(n).padStart(2, '0');

/** Fallback camera for the `theatre` preset before the map can measure itself. */
function boundsCamera(model: TimeModel): GeoCamera {
  const [w, s, e, n] = model.bounds ?? [-20, -10, 40, 30];
  const span = Math.max(e - w, n - s, 1);
  return { center: [(w + e) / 2, (s + n) / 2], zoom: Math.max(1, Math.min(8, Math.log2(360 / span))) };
}

export default function TimeSceneView({ topic, data, chapters, locale }: EngineViewProps) {
  const t = useT();
  const geo = data as TimeSceneGeoData;
  const store = useSceneStore<TimeSceneExt>();
  const { hud } = useSceneContext();
  const currentChapter = useScene<TimeSceneExt, string | null>((s) => s.chapter);
  const layers = useScene<TimeSceneExt, string[]>((s) => s.layers);
  const highlight = useScene<TimeSceneExt, string[]>((s) => s.highlight);
  const storeT = useScene<TimeSceneExt, TimePoint | null>((s) => s.t);

  /* ---------- model + playhead ---------- */
  const model = useMemo(
    () =>
      buildTimeModel(
        geo,
        chapters.map((c) => ({ id: c.id, t: store.getState().chapterTarget(c.id).t })),
      ),
    [geo, chapters, store],
  );
  const [playhead] = useState(() => {
    const t0 = store.getState().t;
    const n = t0 !== null ? toNumber(t0) : Number.NaN;
    return createPlayhead(Number.isFinite(n) ? n : model.min);
  });
  useEffect(() => () => playhead.destroy(), [playhead]);

  /** Last `t` this view wrote, so the store echo is not treated as a jump. */
  const lastWritten = useRef<string | null>(null);

  const commit = useCallback(
    (n: number) => {
      const v = clamp(n, model.min, model.max);
      playhead.set(v);
      const tp = fromNumber(v, model.scale);
      const key = formatTimeParam(tp);
      if (key !== lastWritten.current) {
        lastWritten.current = key;
        store.getState().patch({ t: tp });
      }
    },
    [playhead, model, store],
  );

  const playback = usePlayback(playhead, model, commit);
  const { setPlaying } = playback;

  /* ---------- selected event (inspector) ---------- */
  const [selected, setSelected] = useState<string | null>(null);
  const selectEvent = useCallback(
    (id: string) => {
      setSelected(id);
      store.getState().patch({ highlight: [id] });
    },
    [store],
  );
  const closeEvent = useCallback(() => {
    setSelected(null);
    const s = store.getState();
    s.patch({ highlight: s.chapterTarget(s.chapter).highlight });
  }, [store]);

  /* ---------- store -> playhead ---------- */
  useEffect(
    () =>
      store.subscribe((s, prev) => {
        // Camera presets and snaps only move the camera / finish eases: keep playback and time.
        const transitioned =
          s.transition.id !== prev.transition.id && s.transition.reason !== 'preset' && s.transition.reason !== 'snap';
        if (transitioned) {
          setPlaying(false);
          setSelected(null);
        }
        if (!transitioned && s.t === prev.t) return;
        if (s.t === null) return;
        const key = formatTimeParam(s.t);
        if (!transitioned && key === lastWritten.current) return;
        lastWritten.current = key;
        const target = clamp(toNumber(s.t), model.min, model.max);
        if (!Number.isFinite(target)) return;
        if (transitioned && !s.transition.instant) playhead.tweenTo(target, CHAPTER_TWEEN_MS);
        else playhead.set(target);
      }),
    [store, playhead, model, setPlaying],
  );

  /* ---------- user time controls ---------- */
  const step = stepFor(model.span, model.scale);
  const nudge = useCallback(
    (dir: 1 | -1, big = false) => {
      setPlaying(false);
      commit(playhead.get() + dir * step * (big ? 10 : 1));
    },
    [commit, playhead, step, setPlaying],
  );
  const scrubStart = useCallback(() => {
    setPlaying(false);
    playhead.cancelTween();
  }, [playhead, setPlaying]);
  const stepChapter = useCallback((dir: 1 | -1) => store.getState().stepChapter(dir), [store]);

  // Shift+←/→ anywhere (outside text fields, the map and the timeline itself) nudges time.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!e.shiftKey || e.altKey || e.ctrlKey || e.metaKey || e.defaultPrevented) return;
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      const target = e.target instanceof Element ? e.target : null;
      if (target?.closest(TEXT_INPUTS)) return;
      e.preventDefault();
      nudge(e.key === 'ArrowRight' ? 1 : -1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [nudge]);

  /* ---------- map controller (graticule, reference, theatre camera, stats) ---------- */
  const [controller, setController] = useState<GeoController | null>(null);
  const [graticuleOn, setGraticuleOn] = useState(true);
  useEffect(() => controller?.setGraticule(graticuleOn), [controller, graticuleOn]);

  /* ---------- REFERENCE (R): adjacent keyframe as dashed outlines, playback paused ---------- */
  const [reference, setReference] = useState(false);
  const referenceRef = useRef(false);
  referenceRef.current = reference;
  const resumeAfterReference = useRef(false);
  const setReferenceMode = useCallback(
    (on: boolean, instant: boolean) => {
      if (on) {
        resumeAfterReference.current = playback.playing;
        setPlaying(false);
      } else if (resumeAfterReference.current) {
        resumeAfterReference.current = false;
        setPlaying(true);
      }
      setReference(on);
      controller?.setReference(on, instant);
    },
    [controller, playback.playing, setPlaying],
  );
  useEffect(() => {
    // The map may load after REFERENCE was switched on.
    if (controller && referenceRef.current) controller.setReference(true, true);
  }, [controller]);

  /* ---------- PRESENTATION (P): chapters in order, HUD hidden but title + caption ---------- */
  const [presenting, setPresenting] = useState(false);
  const presentingRef = useRef(false);
  const presentTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stopPresentation = useCallback(
    (restoreHud: boolean) => {
      if (presentTimer.current) clearTimeout(presentTimer.current);
      presentTimer.current = null;
      presentingRef.current = false;
      setPresenting(false);
      if (restoreHud) hud.setState({ hud: true });
    },
    [hud],
  );
  const startPresentation = useCallback(() => {
    if (reference) setReferenceMode(false, true);
    setPlaying(false);
    setSelected(null);
    presentingRef.current = true;
    setPresenting(true);
    hud.setState({ hud: false });
    const list = chapters;
    let i = 0;
    const next = () => {
      const chapter = list[i++];
      if (!chapter) {
        stopPresentation(true);
        return;
      }
      store.getState().goToChapter(chapter.id);
      presentTimer.current = setTimeout(next, PRESENT_STEP_MS);
    };
    next();
  }, [reference, setReferenceMode, setPlaying, hud, chapters, store, stopPresentation]);
  // ESC / H / "show HUD" bring the HUD back: that ends the presentation.
  useEffect(
    () =>
      hud.subscribe((s, prev) => {
        if (presentingRef.current && s.hud && !prev.hud) stopPresentation(false);
      }),
    [hud, stopPresentation],
  );
  useEffect(() => () => {
    if (presentTimer.current) clearTimeout(presentTimer.current);
  }, []);

  /* ---------- legend ---------- */
  const legend = useMemo<LegendItem[]>(() => {
    const items: LegendItem[] = [];
    if (layers.includes('control') || layers.includes('participation')) {
      if (geo.entities.length <= LEGEND_ENTITY_LIMIT) {
        for (const e of geo.entities) {
          // An entity that changes sides is listed once per bloc it is in.
          if (!e.color && changesBloc(e)) {
            for (const b of blocsOf(e))
              items.push({ id: `entity-${e.id}-${b}`, label: `${tx(e.name, locale)} · ${t(`time.bloc.${b}`)}`, color: BLOC_CSS[b] });
          } else {
            items.push({ id: `entity-${e.id}`, label: e.name, color: entityCssColor(e) });
          }
        }
      } else {
        for (const b of ['axis', 'allied', 'neutral'] as const)
          if (geo.entities.some((e) => blocsOf(e).includes(b))) items.push({ id: `bloc-${b}`, label: t(`time.bloc.${b}`), color: BLOC_CSS[b] });
      }
      // Entities with an end date turn neutral once they are out of the war.
      if (geo.entities.some((e) => e.left !== undefined)) items.push({ id: 'bloc-out', label: bi('time.bloc.out'), color: BLOC_CSS.neutral });
    }
    if (layers.includes('movements') && geo.movements.length)
      items.push({ id: 'movement', label: t('time.movement'), color: 'var(--ink-muted)', kind: 'arrow' });
    if (layers.includes('battles')) {
      const kinds = new Set(model.events.map((e) => e.event.kind));
      if ([...kinds].some((k) => !SQUARE_KINDS.has(k)))
        items.push({ id: 'event', label: t('time.event'), color: 'var(--ink-muted)', kind: 'point' });
      if (kinds.has('siege')) items.push({ id: 'siege', label: t('time.legend.siege'), color: 'var(--ink-muted)', kind: 'ring-dashed' });
      if ([...kinds].some((k) => SQUARE_KINDS.has(k)))
        items.push({ id: 'atrocity', label: bi('time.legend.atrocity'), color: 'var(--ink)', kind: 'square' });
    }
    if (layers.includes('sites') && model.sites.length)
      items.push({ id: 'site', label: t('time.legend.site'), color: 'var(--ink)', kind: 'site' });
    return items;
  }, [geo, model, layers, locale]); // `t` is bound to `locale`

  const layerItems = useMemo<LayerItem[]>(
    () =>
      TOGGLE_LAYERS.filter((id) => id !== 'sites' || model.sites.length > 0).map((id) => ({ id, label: t(`time.layer.${id}`) })),
    [model, locale],
  );

  /* ---------- overlay: open by default only when the stage is roomy ---------- */
  const stageRef = useRef<HTMLDivElement>(null);
  const [overlayOpen, setOverlayOpen] = useState(false);
  useEffect(() => {
    setOverlayOpen((stageRef.current?.clientWidth ?? 0) >= OVERLAY_OPEN_MIN_WIDTH);
  }, []);

  /* ---------- perf ---------- */
  const fps = useFps();
  const controllerRef = useRef<GeoController | null>(null);
  controllerRef.current = controller;
  const readStats = useCallback(() => {
    const s = controllerRef.current?.stats();
    return s ? { ...s, fps: fps.current } : null;
  }, [fps]);

  /* ---------- panel 02: question, else summary ---------- */
  const chapterState = (chapters.find((c) => c.id === currentChapter)?.state ?? {}) as { question?: BilingualText; summary?: BilingualText };
  const hasQuestion = Boolean(chapterState.question);

  /* ---------- HUD controls (docs/08 §3) ---------- */
  const movementsOn = layers.includes('movements');
  const bordersOn = layers.includes('borders');
  const statusT = storeT !== null ? formatTimeParam(storeT) : '';
  const specRows = useMemo<SpecRow[]>(
    () => [
      { id: 'entities', label: bi('time.spec.entities'), value: pad2(geo.entities.length), mono: true },
      { id: 'keyframes', label: bi('time.spec.keyframes'), value: pad2(model.keyframes.length), mono: true },
      { id: 'events', label: bi('time.spec.events'), value: pad2(geo.events.length), mono: true },
      { id: 'movements', label: bi('time.spec.movements'), value: pad2(geo.movements.length), mono: true },
    ],
    [geo, model],
  );
  const controls = useMemo<SceneControls>(() => {
    const chapterPresets = chapters.flatMap((c, i) => {
      const camera = store.getState().chapterTarget(c.id).camera;
      return camera ? [{ id: c.id, label: pad2(i + 1), chapter: c.id, camera: camera as GeoCamera | null }] : [];
    });
    // presets.json: after `world` / `theatre`, so digit keys keep their meaning; `<FlyTo>` names these ids.
    const filePresets = (geo.presets?.presets ?? []).map((p) => ({ id: p.id, label: p.label, title: p.label, camera: p.camera as GeoCamera | null }));
    const presets = [
      ...chapterPresets,
      { id: 'world', label: t('time.preset.world'), title: t('time.preset.world'), camera: WORLD_CAMERA },
      { id: 'theatre', label: t('time.preset.theatre'), title: t('time.preset.theatre'), camera: null },
      ...filePresets,
    ];
    const toggleLayer = (id: string, on: boolean) => {
      if (store.getState().layers.includes(id) !== on) store.getState().toggleLayer(id);
    };
    return {
      presets: {
        items: presets,
        set: (id, { instant }) => {
          const preset = presets.find((p) => p.id === id);
          if (!preset) return;
          const camera = preset.camera ?? controllerRef.current?.fitCamera() ?? boundsCamera(model);
          store.getState().applyCameraPreset(camera, { instant });
        },
      },
      modes: {
        items: [
          { id: 'flow', key: 'f', label: t('time.mode.flow'), on: movementsOn, tone: 'hot', status: 'FLOW' },
          { id: 'borders', key: 'b', label: t('time.mode.borders'), on: bordersOn },
          { id: 'graticule', key: 'g', label: t('time.mode.graticule'), on: graticuleOn, phone: false },
          {
            id: 'reference',
            key: 'r',
            label: t('time.mode.reference'),
            on: reference,
            disabled: model.keyframes.length < 2 || presenting,
            tone: 'cold',
            status: 'REFERENCE',
          },
          { id: 'presentation', key: 'p', label: t('time.mode.presentation'), on: presenting, tone: 'signal', status: 'PRESENTATION', phone: false },
        ],
        set: (id, on, { instant }) => {
          if (id === 'flow') toggleLayer('movements', on);
          else if (id === 'borders') toggleLayer('borders', on);
          else if (id === 'graticule') setGraticuleOn(on);
          else if (id === 'reference') setReferenceMode(on, instant);
          else if (id === 'presentation') {
            if (on) startPresentation();
            else stopPresentation(true);
          }
        },
      },
      labels: true,
      pause: { paused: !playback.playing, set: (paused) => setPlaying(!paused) },
      stats: () => {
        const s = readStats();
        return s ?? {};
      },
      specRows,
      status: [statusT, `×${playback.speed}`].filter(Boolean),
      card: bi('time.card.title'),
      panels: {
        panel01: bi('time.panel.timeline'),
        panel02: bi(hasQuestion ? 'time.panel.question' : 'time.panel.summary'),
        panel03: bi('time.panel.state'),
      },
      escape: () => {
        if (presentingRef.current) {
          stopPresentation(true);
          return true;
        }
        if (reference) {
          setReferenceMode(false, false);
          return true;
        }
        if (selected) {
          closeEvent();
          return true;
        }
        if (store.getState().highlight.length) {
          store.getState().patch({ highlight: [] });
          return true;
        }
        return false;
      },
    };
  }, [
    chapters,
    store,
    geo,
    hasQuestion,
    model,
    movementsOn,
    bordersOn,
    graticuleOn,
    reference,
    presenting,
    playback.playing,
    playback.speed,
    setPlaying,
    setReferenceMode,
    startPresentation,
    stopPresentation,
    readStats,
    specRows,
    statusT,
    selected,
    closeEvent,
    locale, // `t` is bound to `locale`
  ]);
  useSceneControls(controls);

  const selectedEvent = selected ? geo.events.find((e) => e.id === selected) ?? null : null;
  const stopChapter = playback.stop ? chapters.find((c) => c.id === playback.stop?.id) : undefined;
  const chapter = chapters.find((c) => c.id === currentChapter) ?? null;
  const chapterNumber = chapter ? chapters.indexOf(chapter) + 1 : 0;
  // No question: `state.summary`, else the body's first paragraph, else the highlighted event, else the subtitle.
  const fallbackSummary = useMemo<BilingualText | string | null>(() => {
    if (!currentChapter) return topic.subtitle;
    if (chapterState.summary) return chapterState.summary;
    const first = firstParagraph(currentChapter);
    if (first) return first;
    const target = store.getState().chapterTarget(currentChapter).highlight;
    const ev = geo.events.find((e) => target.includes(e.id));
    return ev?.summary ?? topic.subtitle;
  }, [currentChapter, chapterState.summary, store, geo, topic, locale]);
  const stateLabels = useMemo(
    () => ({
      time: bi('time.state.time'),
      participants: bi('time.state.participants'),
      battles: bi('time.state.battles'),
      movements: bi('time.state.movements'),
      keyframe: bi('time.state.keyframe'),
    }),
    [],
  );

  return (
    <div className="ts-stage" ref={stageRef} data-reference={reference || undefined}>
      <GeoStage
        store={store}
        playhead={playhead}
        model={model}
        locale={locale}
        onSelectEvent={selectEvent}
        onController={setController}
      />

      <div className="ts-stop" role="status" aria-live="polite">
        {reference ? (
          <ReferenceBanner model={model} playhead={playhead} locale={locale} />
        ) : (
          stopChapter &&
          playback.stop &&
          !presenting && (
            <div className="ts-stop__card">
              <span className="ts-stop__eyebrow">
                {t('time.chapterShort', { n: chapters.indexOf(stopChapter) + 1 })} · {formatReadout(playback.stop.t, model, locale)}
              </span>
              <span className="ts-stop__title">{tx(stopChapter.title, locale)}</span>
            </div>
          )
        )}
      </div>

      {presenting && (
        <PresentationCaption
          title={topic.title}
          chapter={chapter}
          number={chapterNumber}
          total={chapters.length}
          model={model}
          playhead={playhead}
          locale={locale}
          label={t('time.presentation')}
        />
      )}

      <SceneSlot name="stageOverlay">
        <details className="atlas-overlay-card ts-overlay" open={overlayOpen} onToggle={(e) => setOverlayOpen(e.currentTarget.open)}>
          <summary className="ts-overlay__summary" aria-label={t('time.layersAndKey')}>
            <span className="ts-overlay__closed">
              <Icon name="layers" size={18} />
              <span>{t('time.layersAndKey')}</span>
            </span>
            <Icon name="close" size={18} className="ts-overlay__open" />
          </summary>
          <SceneLayerToggles items={layerItems} />
          <Legend items={legend} locale={locale} />
        </details>
      </SceneSlot>

      <SceneSlot name="card">
        <BandCard model={model} playhead={playhead} locale={locale} chapter={currentChapter} highlight={highlight} />
      </SceneSlot>
      <SceneSlot name="panel01">
        <TimelinePanel model={model} playhead={playhead} locale={locale} chapters={chapters} chapter={currentChapter} />
      </SceneSlot>
      <SceneSlot name="panel02">
        <QuestionPanel chapter={chapter} number={chapterNumber} locale={locale} fallback={fallbackSummary} />
      </SceneSlot>
      <SceneSlot name="panel03">
        <StatePanel model={model} playhead={playhead} locale={locale} highlight={highlight} labels={stateLabels} />
      </SceneSlot>
      <SceneSlot name="perf">
        <PerfReadout read={readStats} />
      </SceneSlot>

      <SceneSlot name="bottomBar">
        <Timeline
          model={model}
          playhead={playhead}
          locale={locale}
          chapters={chapters}
          currentChapter={currentChapter}
          playing={playback.playing}
          speed={playback.speed}
          onTogglePlay={() => setPlaying(!playback.playing)}
          onSpeed={playback.setSpeed}
          onScrub={commit}
          onScrubStart={scrubStart}
          onNudge={nudge}
          onChapter={(id) => store.getState().goToChapter(id)}
          onStepChapter={stepChapter}
        />
      </SceneSlot>

      {selectedEvent && (
        <SceneSlot name="inspector">
          <EventInspector event={selectedEvent} model={model} locale={locale} onClose={closeEvent} />
        </SceneSlot>
      )}
    </div>
  );
}

/** REFERENCE banner: which keyframe is solid and which is dashed. */
function ReferenceBanner({ model, playhead, locale }: { model: TimeModel; playhead: Playhead; locale: EngineViewProps['locale'] }) {
  const tr = useT();
  const now = useSyncExternalStore(playhead.subscribe, playhead.get, playhead.get);
  const pair = referencePair(model, frameAt(model, now));
  if (!pair) return null;
  const name = (i: number) => {
    const k = model.keyframes[i]!;
    const date = formatTime(k.keyframe.t, locale);
    return `K${i + 1} ${locale === 'en' ? date.toLocaleUpperCase('en') : date}`;
  };
  return (
    <div className="ts-stop__card ts-ref">
      <span className="ts-stop__eyebrow">{tr('time.reference.banner', { current: name(pair.current), other: name(pair.other) })}</span>
    </div>
  );
}

/** PRESENTATION: the only HUD left on the stage — title and chapter caption. */
function PresentationCaption({
  title,
  chapter,
  number,
  total,
  model,
  playhead,
  locale,
  label,
}: {
  title: BilingualText;
  chapter: Chapter | null;
  number: number;
  total: number;
  model: TimeModel;
  playhead: Playhead;
  locale: EngineViewProps['locale'];
  label: string;
}) {
  const now = useSyncExternalStore(playhead.subscribe, playhead.get, playhead.get);
  return (
    <div className="ts-present" aria-live="polite">
      <p className="ts-present__title">
        <small>{label.toLocaleUpperCase('en')}</small>
        <span lang="en">{title.en}</span>
        {title.zh && <span lang="zh-Hans">{title.zh}</span>}
      </p>
      {chapter && (
        <p className="ts-present__caption">
          <i>
            {pad2(number)} / {pad2(total)}
          </i>
          <span>{tx(chapter.title, locale)}</span>
          <b>{formatReadout(now, model, locale)}</b>
        </p>
      )}
    </div>
  );
}
