/**
 * TimeScene view: GeoStage (MapLibre) + the bottom bar (timeline rule, state
 * cluster, swimlanes) + HUD content (participation card, perf) + the control
 * panel (layers, tools, key) + inspectors (event, entity), and the scene
 * controls (geographic presets, modes, status, spec rows, beats). See
 * docs/06 "TimeScene".
 *
 * Time flows through two layers:
 *  - the store's `t` (TimePoint, in the URL, set by chapters and deep links)
 *  - the playhead (continuous number the map renders at; lib/playhead.ts)
 * Picking a chapter (rail, node, ← →, Next / Back) AUTO-RUNS it: the playhead
 * eases from the chapter's span start to its time over 5 s (movements advance,
 * events pulse in order; the store's `t` is already the chapter time). The
 * playhead is draggable at any time: touching it, or any key that changes `t`,
 * cancels the run and leaves `t` where it is. Scrubbing writes a rounded `t`
 * back with `patch()`. There is no other free-running playback: the top
 * bar's PRESENT button (key P) starts the presentation.
 *
 * A background chapter (`kind: background`, core/chapters.ts) has no time of
 * its own: no timeline node, no auto-run, ignored by the rule's hybrid scale;
 * its map is the first keyframe (or its `state.time`).
 *
 * PRESENTATION (P) runs on the core presentation system
 * (core/presentation: beats, caption card, progress bar, auto-play, voice,
 * keys, save / restore). TimeScene's adapter: a beat is the chapter's target
 * plus the beat's `t` / `camera` / `layers` / `highlight`, applied with the
 * store's `applyState` (camera flight, `t` ease); the caption card's header
 * shows the playhead date; entering leaves REFERENCE and drops selections;
 * the map shows leader labels for the beat's highlighted ids only.
 */
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import type { EngineViewProps, GeoCamera, SceneSnapshot } from '../core/types';
import { SceneSlot, useScene, useSceneControls, useSceneStore, useT } from '../core/context';
import { storyChapters } from '../core/chapters';
import type { SceneControls, SpecRow } from '../core/controls';
import { usePresentation, type PresentationAdapter } from '../core/presentation';
import { ControlPanel, type ControlRow } from '../widgets/ControlPanel';
import type { LegendItem } from '../widgets/Legend';
import { Icon } from '../widgets/icons';
import { t as translate, tx, type BilingualText, type UiKey } from '../../i18n';
import { formatTimeParam } from '../../lib/time';
import type { TimeSceneExt } from './index';
import type { TimeBeat, TimeChapterState, TimeSceneGeoData } from './schema';
import { buildTimeModel, type TimeModel } from './lib/model';
import { createPlayhead, type Playhead } from './lib/playhead';
import { clamp, fromNumber, stepFor, toNumber, type TimePoint } from './lib/time';
import { frameAt } from './lib/frame';
import { referencePair } from './lib/stats';
import { formatTime } from './lib/format';
import { GeoStage } from './stages/geo/GeoStage';
import type { GeoController } from './stages/geo/controller';
import { Timeline, formatReadout } from './timeline/Timeline';
import { EventInspector } from './EventInspector';
import { EntityInspector } from './EntityInspector';
import { BandCard, PerfReadout, useFps } from './hud/HudPanels';
import { BLOC_CSS, entityCssColor } from './colors';
import { blocsOf, changesBloc } from './lib/bloc';
import { blocLabel, blocLabelText } from './lib/blocLabels';
import './time-scene.css';

const CHAPTER_TWEEN_MS = 1600;
/** A chapter's auto-run: the playhead eases from the span start to the chapter time. */
const CHAPTER_RUN_MS = 5000;
const SQUARE_KINDS = new Set<string>(['massacre', 'atrocity']);
const TRIANGLE_KINDS = new Set<string>(['disaster']);
/** Up to this many entities, the legend names each one; above, it groups by bloc. */
const LEGEND_ENTITY_LIMIT = 6;
const OVERLAY_OPEN_MIN_WIDTH = 720;
const TEXT_INPUTS = 'input, select, textarea, [contenteditable="true"], [data-keys="own"], [role="slider"]';
const WORLD_CAMERA: GeoCamera = { center: [20, 10], zoom: 1.4 };

const bi = (key: UiKey): BilingualText => ({ en: translate('en', key), zh: translate('zh', key) });
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
  const currentChapter = useScene<TimeSceneExt, string | null>((s) => s.chapter);
  const layers = useScene<TimeSceneExt, string[]>((s) => s.layers);
  const highlight = useScene<TimeSceneExt, string[]>((s) => s.highlight);
  const storeT = useScene<TimeSceneExt, TimePoint | null>((s) => s.t);

  /* ---------- model + playhead ---------- */
  /** Chapters with a place on the timeline (the background chapter has none). */
  const story = useMemo(() => storyChapters(chapters), [chapters]);
  const model = useMemo(
    () =>
      buildTimeModel(
        geo,
        story.map((c) => ({ id: c.id, t: store.getState().chapterTarget(c.id).t })),
      ),
    [geo, story, store],
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

  /* ---------- chapter auto-run ---------- */
  const [running, setRunning] = useState(false);
  const runningRef = useRef(false);
  const runToken = useRef(0);
  /**
   * Where a chapter's run starts and ends: its first beat's `t` if it has one, else the previous
   * story chapter's time, else the data minimum (each only when it is before the chapter time).
   * The background chapter has no span (it eases to its time, it does not run).
   */
  const chapterSpan = useCallback(
    (id: string | null): [number, number] | null => {
      const i = story.findIndex((c) => c.id === id);
      const chapter = story[i];
      const end = chapter ? store.getState().chapterTarget(chapter.id).t : null;
      if (!chapter || end === null) return null;
      const to = clamp(toNumber(end), model.min, model.max);
      const beatT = (chapter.state as TimeChapterState).beats?.[0]?.t;
      const prev = i > 0 ? store.getState().chapterTarget(story[i - 1]!.id).t : null;
      const candidates = [beatT !== undefined ? toNumber(beatT as TimePoint) : null, prev !== null ? toNumber(prev) : null, model.min];
      for (const c of candidates) {
        if (c === null || !Number.isFinite(c)) continue;
        const from = clamp(c, model.min, model.max);
        if (from < to) return [from, to];
      }
      return [to, to];
    },
    [story, store, model],
  );
  const startRun = useCallback(
    (chapter: string | null, target: number) => {
      const span = chapterSpan(chapter);
      const token = ++runToken.current;
      if (!span || span[0] >= span[1]) {
        runningRef.current = false;
        setRunning(false);
        playhead.tweenTo(target, CHAPTER_TWEEN_MS);
        return;
      }
      runningRef.current = true;
      setRunning(true);
      playhead.tweenTo(span[1], CHAPTER_RUN_MS, {
        from: span[0],
        onDone: () => {
          if (token !== runToken.current) return;
          runningRef.current = false;
          setRunning(false);
        },
      });
    },
    [chapterSpan, playhead],
  );

  /** α of the timeline mapping, fitted by the rule to its width; the band card reuses it. */
  const [alpha, setAlpha] = useState(1);

  /* ---------- selection: an event (map / labels) or an entity (card row) ---------- */
  const [selected, setSelected] = useState<string | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
  const [cardExpanded, setCardExpanded] = useState(false);
  const restoreHighlight = useCallback(() => {
    const s = store.getState();
    s.patch({ highlight: s.chapterTarget(s.chapter).highlight });
  }, [store]);
  const selectEvent = useCallback(
    (id: string) => {
      setSelectedEntity(null);
      setSelected(id);
      store.getState().patch({ highlight: [id] });
    },
    [store],
  );
  const closeEvent = useCallback(() => {
    setSelected(null);
    restoreHighlight();
  }, [restoreHighlight]);
  const selectEntity = useCallback(
    (id: string) => {
      setSelected(null);
      if (selectedEntity === id) {
        setSelectedEntity(null);
        restoreHighlight();
        return;
      }
      setSelectedEntity(id);
      store.getState().patch({ highlight: [id] });
    },
    [store, selectedEntity, restoreHighlight],
  );
  const closeEntity = useCallback(() => {
    setSelectedEntity(null);
    restoreHighlight();
  }, [restoreHighlight]);

  /* ---------- store -> playhead ---------- */
  useEffect(
    () =>
      store.subscribe((s, prev) => {
        // Camera presets and snaps only move the camera / finish eases: keep the selection and time.
        const transitioned =
          s.transition.id !== prev.transition.id && s.transition.reason !== 'preset' && s.transition.reason !== 'snap';
        if (transitioned) {
          setSelected(null);
          setSelectedEntity(null);
        }
        if (!transitioned && s.t === prev.t) return;
        if (s.t === null) return;
        const key = formatTimeParam(s.t);
        if (!transitioned && key === lastWritten.current) return;
        lastWritten.current = key;
        const target = clamp(toNumber(s.t), model.min, model.max);
        if (!Number.isFinite(target)) return;
        if (!transitioned || s.transition.instant) playhead.set(target);
        else if (s.transition.reason === 'chapter' && !presentation.isPresenting()) startRun(s.chapter, target);
        else playhead.tweenTo(target, CHAPTER_TWEEN_MS);
      }),
    [store, playhead, model, startRun],
  );

  /* ---------- user time controls ---------- */
  const step = stepFor(model.span, model.scale);
  const nudge = useCallback(
    (dir: 1 | -1, big = false) => commit(playhead.get() + dir * step * (big ? 10 : 1)),
    [commit, playhead, step],
  );
  const scrubStart = useCallback(() => playhead.cancelTween(), [playhead]);
  const goToChapterFromRule = useCallback((id: string) => store.getState().goToChapter(id), [store]);
  const currentSpan = useMemo(() => chapterSpan(currentChapter), [chapterSpan, currentChapter]);

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
  const [territoryOn, setTerritoryOn] = useState(true);
  useEffect(() => controller?.setTerritory(territoryOn), [controller, territoryOn]);


  /* ---------- REFERENCE (R): adjacent keyframe as dashed outlines ---------- */
  const [reference, setReference] = useState(false);
  const referenceRef = useRef(false);
  referenceRef.current = reference;
  const setReferenceMode = useCallback(
    (on: boolean, instant: boolean) => {
      setReference(on);
      controller?.setReference(on, instant);
    },
    [controller],
  );
  useEffect(() => {
    // The map may load after REFERENCE was switched on.
    if (controller && referenceRef.current) controller.setReference(true, true);
  }, [controller]);

  /* ---------- PRESENTATION (P): the core presentation over this map ---------- */
  const presentationAdapter: PresentationAdapter<TimeBeat, SceneSnapshot<TimeSceneExt>> = {
    beatsOf: (c) => (c.state as TimeChapterState).beats,
    captionOf: (b, l) => tx(b.caption, l),
    applyBeat: (b, { instant }) => {
      const s = store.getState();
      const spec = b.spec;
      s.applyState(
        {
          ...s.chapterTarget(b.chapter),
          ...(spec?.t !== undefined ? { t: spec.t as TimePoint } : {}),
          ...(spec?.camera ? { camera: spec.camera } : {}),
          ...(spec?.layers ? { layers: [...spec.layers] } : {}),
          ...(spec?.highlight ? { highlight: [...spec.highlight] } : {}),
        },
        { instant },
      );
    },
    saveState: () => store.getState().snapshot(),
    restoreState: (saved) => store.getState().applyState(saved, { instant: false }),
    onEnter: () => {
      if (referenceRef.current) setReferenceMode(false, true);
      setSelected(null);
      setSelectedEntity(null);
      setCardExpanded(false);
    },
    readout: <BeatReadout model={model} playhead={playhead} locale={locale} />,
  };
  const presentation = usePresentation(presentationAdapter);
  const { presenting, isPresenting, status: presentationStatus, controls: beatControls, start: startPresentation, stop: stopPresentation } = presentation;
  // Leader labels for the beat's highlighted ids only (the caption and the map agree).
  useEffect(() => controller?.setPresentation(presenting), [controller, presenting]);
  // The caption card mounts / changes size with each beat: labels re-measure around it at once.
  const beatIndex = presentation.beat?.index ?? -1;
  useEffect(() => {
    if (beatIndex >= 0) controller?.refreshLabels();
  }, [controller, beatIndex]);

  /* ---------- legend ---------- */
  const legend = useMemo<LegendItem[]>(() => {
    const items: LegendItem[] = [];
    if (layers.includes('control') || layers.includes('participation')) {
      if (geo.entities.length <= LEGEND_ENTITY_LIMIT) {
        for (const e of geo.entities) {
          // An entity that changes sides is listed once per bloc it is in.
          if (!e.color && changesBloc(e)) {
            for (const b of blocsOf(e))
              items.push({ id: `entity-${e.id}-${b}`, label: `${tx(e.name, locale)} · ${blocLabel(topic.blocLabels, b, locale)}`, color: BLOC_CSS[b] });
          } else {
            items.push({ id: `entity-${e.id}`, label: e.name, color: entityCssColor(e) });
          }
        }
      } else {
        for (const b of ['axis', 'allied', 'neutral'] as const)
          if (geo.entities.some((e) => blocsOf(e).includes(b))) items.push({ id: `bloc-${b}`, label: blocLabel(topic.blocLabels, b, locale), color: BLOC_CSS[b] });
      }
      // Entities with an end date turn neutral once they are out of the war.
      if (geo.entities.some((e) => e.left !== undefined)) items.push({ id: 'bloc-out', label: blocLabelText(topic.blocLabels, 'out'), color: BLOC_CSS.neutral });
    }
    if (layers.includes('movements') && geo.movements.length)
      items.push({ id: 'movement', label: t('time.movement'), color: 'var(--ink-muted)', kind: 'arrow' });
    if (layers.includes('battles')) {
      const kinds = new Set(model.events.map((e) => e.event.kind));
      if ([...kinds].some((k) => !SQUARE_KINDS.has(k) && !TRIANGLE_KINDS.has(k)))
        items.push({ id: 'event', label: t('time.event'), color: 'var(--ink-muted)', kind: 'point' });
      if (kinds.has('siege')) items.push({ id: 'siege', label: t('time.legend.siege'), color: 'var(--ink-muted)', kind: 'ring-dashed' });
      if ([...kinds].some((k) => SQUARE_KINDS.has(k)))
        items.push({ id: 'atrocity', label: bi('time.legend.atrocity'), color: 'var(--ink)', kind: 'square' });
      if ([...kinds].some((k) => TRIANGLE_KINDS.has(k)))
        items.push({ id: 'disaster', label: bi('time.legend.disaster'), color: 'var(--ink)', kind: 'triangle' });
    }
    if (layers.includes('sites') && model.sites.length)
      items.push({ id: 'site', label: t('time.legend.site'), color: 'var(--ink)', kind: 'site' });
    return items;
  }, [geo, model, layers, locale, topic.blocLabels]); // `t` is bound to `locale`

  /* ---------- control panel: LAYERS (store layers + drawing modes) and TOOLS ---------- */
  const panelLayers = useMemo<ControlRow[]>(
    () => [
      { kind: 'layer', id: 'control', label: t('time.layer.control') },
      { kind: 'mode', id: 'territory', label: t('time.layer.territory') },
      { kind: 'mode', id: 'borders', label: t('time.layer.borders') },
      { kind: 'mode', id: 'graticule', label: t('time.layer.graticule') },
      { kind: 'mode', id: 'flow', label: t('time.layer.movements') },
      { kind: 'layer', id: 'battles', label: t('time.layer.battles') },
      { kind: 'layer', id: 'participation', label: t('time.layer.participation') },
      ...(model.sites.length > 0 ? [{ kind: 'layer' as const, id: 'sites', label: t('time.layer.sites') }] : []),
      { kind: 'mode', id: 'labels', label: t('time.layer.labels') },
    ],
    [model, locale], // `t` is bound to `locale`
  );
  const hasGlossary = (geo.glossary?.terms.length ?? 0) > 0;
  const panelTools = useMemo<ControlRow[]>(
    () => [
      { kind: 'mode', id: 'reference', label: t('time.tool.reference') },
      { kind: 'mode', id: 'presentation', label: t('present.tool') },
      ...(hasGlossary ? [{ kind: 'glossary' as const }] : []),
      { kind: 'hud' },
    ],
    [locale, hasGlossary], // `t` is bound to `locale`
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
    // Geographic presets only (chapters have the rail, the rule and ← →): world, the whole area, then presets.json.
    const presets = [
      { id: 'world', label: t('time.preset.world'), title: t('time.preset.world'), camera: WORLD_CAMERA as GeoCamera | null },
      { id: 'theatre', label: t('time.preset.theatre'), title: t('time.preset.theatre'), camera: null },
      ...(geo.presets?.presets ?? []).map((p) => ({ id: p.id, label: p.label, title: p.label, camera: p.camera as GeoCamera | null })),
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
          { id: 'territory', key: 'n', label: t('time.mode.territory'), on: territoryOn },
          {
            id: 'reference',
            key: 'r',
            label: t('time.mode.reference'),
            on: reference,
            disabled: model.keyframes.length < 2 || presenting,
            tone: 'cold',
            status: 'REFERENCE',
          },
          {
            id: 'presentation',
            key: 'p',
            label: t('present.mode'),
            on: presenting,
            tone: 'signal',
            status: presentationStatus,
            phone: false,
          },
        ],
        set: (id, on, { instant }) => {
          if (id === 'flow') toggleLayer('movements', on);
          else if (id === 'borders') toggleLayer('borders', on);
          else if (id === 'graticule') setGraticuleOn(on);
          else if (id === 'territory') setTerritoryOn(on);
          else if (id === 'reference') setReferenceMode(on, instant);
          else if (id === 'presentation') {
            if (on) startPresentation(null, instant);
            else stopPresentation(true);
          }
        },
      },
      labels: true,
      stats: () => {
        const s = readStats();
        return s ?? {};
      },
      specRows,
      status: [statusT, running ? 'RUNNING' : ''].filter(Boolean),
      time: { running: () => runningRef.current, now: () => playhead.get() },
      card: bi('time.card.title'),
      cardToggle: { expanded: cardExpanded, set: setCardExpanded },
      beats: beatControls,
      escape: () => {
        if (isPresenting()) {
          stopPresentation(true);
          return true;
        }
        if (reference) {
          setReferenceMode(false, false);
          return true;
        }
        if (cardExpanded) {
          setCardExpanded(false);
          if (selectedEntity) closeEntity();
          return true;
        }
        if (selectedEntity) {
          closeEntity();
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
    store,
    geo,
    model,
    movementsOn,
    bordersOn,
    graticuleOn,
    territoryOn,
    reference,
    presenting,
    presentationStatus,
    beatControls,
    isPresenting,
    setReferenceMode,
    startPresentation,
    stopPresentation,
    readStats,
    specRows,
    statusT,
    running,
    playhead,
    cardExpanded,
    selected,
    selectedEntity,
    closeEvent,
    closeEntity,
    locale, // `t` is bound to `locale`
  ]);
  useSceneControls(controls);

  const selectedEvent = selected ? geo.events.find((e) => e.id === selected) ?? null : null;
  const pickedEntity = selectedEntity ? geo.entities.find((e) => e.id === selectedEntity) ?? null : null;

  return (
    <div className="ts-stage" ref={stageRef} data-reference={reference || undefined} data-presenting={presenting || undefined}>
      <GeoStage
        store={store}
        playhead={playhead}
        model={model}
        locale={locale}
        onSelectEvent={selectEvent}
        onController={setController}
      />

      <div className="ts-stop" role="status" aria-live="polite">
        {reference && <ReferenceBanner model={model} playhead={playhead} locale={locale} />}
      </div>

      {presentation.element}

      <SceneSlot name="stageOverlay">
        <details className="atlas-overlay-card ts-overlay" open={overlayOpen} onToggle={(e) => setOverlayOpen(e.currentTarget.open)}>
          <summary className="ts-overlay__summary" aria-label={t('time.layersAndKey')}>
            <span className="ts-overlay__closed">
              <Icon name="layers" size={18} />
              <span>{t('time.layersAndKey')}</span>
            </span>
            <Icon name="close" size={18} className="ts-overlay__open" />
          </summary>
          <ControlPanel layers={panelLayers} tools={panelTools} legend={legend} />
        </details>
      </SceneSlot>

      <SceneSlot name="card">
        <BandCard
          model={model}
          playhead={playhead}
          locale={locale}
          chapter={currentChapter}
          highlight={highlight}
          alpha={alpha}
          expanded={cardExpanded}
          selected={selectedEntity}
          onSelect={selectEntity}
          onExpand={() => setCardExpanded(true)}
        />
      </SceneSlot>
      <SceneSlot name="perf">
        <PerfReadout read={readStats} />
      </SceneSlot>

      <SceneSlot name="bottomBar">
        <Timeline
          model={model}
          playhead={playhead}
          locale={locale}
          chapters={story}
          currentChapter={currentChapter}
          highlight={highlight}
          onScrub={commit}
          onScrubStart={scrubStart}
          onNudge={nudge}
          onChapter={goToChapterFromRule}
          span={currentSpan}
          running={running}
          onAlpha={setAlpha}
        />
      </SceneSlot>

      {selectedEvent && (
        <SceneSlot name="inspector">
          <EventInspector event={selectedEvent} model={model} locale={locale} onClose={closeEvent} />
        </SceneSlot>
      )}
      {pickedEntity && (
        <SceneSlot name="inspector">
          <EntityInspector entity={pickedEntity} model={model} playhead={playhead} locale={locale} onClose={closeEntity} />
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

/** The caption card's date: the playhead as the timeline reads it. */
function BeatReadout({ model, playhead, locale }: { model: TimeModel; playhead: Playhead; locale: EngineViewProps['locale'] }) {
  const now = useSyncExternalStore(playhead.subscribe, playhead.get, playhead.get);
  return formatReadout(now, model, locale);
}
