/**
 * TimeScene view: GeoStage (MapLibre) + the bottom bar (timeline rule, state
 * cluster, swimlanes) + HUD content (participation card, perf) + the control
 * panel (layers, tools, key) + inspectors (event, entity), and the scene
 * controls (geographic presets, modes, pause, status, spec rows, beats). See
 * docs/06 "TimeScene".
 *
 * Time flows through two layers:
 *  - the store's `t` (TimePoint, in the URL, set by chapters and deep links)
 *  - the playhead (continuous number the map renders at; lib/playhead.ts)
 * Chapter changes tween the playhead to the chapter's time; scrubbing and
 * playback move the playhead and write a rounded `t` back with `patch()`.
 *
 * PRESENTATION (P) is a sequence of user-paced beats: every chapter's
 * `state.beats`, or one beat per chapter (its state, `summary` as caption).
 * Each beat flies the camera and eases `t` (store `applyState`), then fades
 * its caption in; click / → / SPACE = next, ← = previous, a chapter segment or
 * beat tick of the progress bar = jump. The
 * HUD is hidden, the map takes no input. ESC or P ends it and restores the
 * scene as it was.
 */
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import type { Chapter, EngineViewProps, GeoCamera, SceneSnapshot } from '../core/types';
import { SceneSlot, useScene, useSceneContext, useSceneControls, useSceneStore, useT } from '../core/context';
import type { BeatInfo, SceneControls, SpecRow } from '../core/controls';
import { ControlPanel, type ControlRow } from '../widgets/ControlPanel';
import type { LegendItem } from '../widgets/Legend';
import { Icon } from '../widgets/icons';
import { t as translate, tx, withBase, type BilingualText, type UiKey } from '../../i18n';
import { formatTimeParam } from '../../lib/time';
import type { TimeSceneExt } from './index';
import type { TimeChapterState, TimeSceneGeoData } from './schema';
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
import { EntityInspector } from './EntityInspector';
import { BandCard, PerfReadout, useFps } from './hud/HudPanels';
import { BLOC_CSS, entityCssColor } from './colors';
import { blocsOf, changesBloc } from './lib/bloc';
import './time-scene.css';

const CHAPTER_TWEEN_MS = 1600;
const SQUARE_KINDS = new Set<string>(['massacre', 'atrocity']);
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

/** One presentation beat, flattened across chapters. */
interface Beat extends BeatInfo {
  /** 0-based chapter position. */
  chapterIndex: number;
  /** Beats in this chapter. */
  count: number;
  t?: TimePoint;
  camera?: GeoCamera;
  layers?: string[];
  highlight?: string[];
  audio?: string;
}

function buildBeats(chapters: readonly Chapter[]): Beat[] {
  return chapters.flatMap((c, ci) => {
    const state = c.state as TimeChapterState;
    const list = state.beats ?? [{ caption: state.summary ?? state.question ?? c.title }];
    return list.map((b, i) => ({
      chapter: c.id,
      chapterIndex: ci,
      index: i,
      count: list.length,
      caption: b.caption,
      ...('t' in b && b.t !== undefined ? { t: b.t as TimePoint } : {}),
      ...('camera' in b && b.camera ? { camera: b.camera as GeoCamera } : {}),
      ...('layers' in b && b.layers ? { layers: [...b.layers] } : {}),
      ...('highlight' in b && b.highlight ? { highlight: [...b.highlight] } : {}),
      ...('audio' in b && b.audio ? { audio: b.audio } : {}),
    }));
  });
}

export default function TimeSceneView({ topic, data, chapters, locale }: EngineViewProps) {
  const t = useT();
  const geo = data as TimeSceneGeoData;
  const store = useSceneStore<TimeSceneExt>();
  const { hud, actions } = useSceneContext();
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
        // Camera presets and snaps only move the camera / finish eases: keep playback and time.
        const transitioned =
          s.transition.id !== prev.transition.id && s.transition.reason !== 'preset' && s.transition.reason !== 'snap';
        if (transitioned) {
          setPlaying(false);
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
  const goToChapterFromRule = useCallback(
    (id: string) => {
      store.getState().goToChapter(id);
      actions.setReader(true);
    },
    [store, actions],
  );

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

  /* ---------- PRESENTATION (P): user-paced beats ---------- */
  const beats = useMemo(() => buildBeats(chapters), [chapters]);
  const [beat, setBeat] = useState<{ index: number; instant: boolean } | null>(null);
  const presenting = beat !== null;
  const presentingRef = useRef(false);
  const beatRef = useRef<number | null>(null);
  /** The scene before the presentation started (restored when it ends). */
  const savedScene = useRef<SceneSnapshot<TimeSceneExt> | null>(null);
  const audio = useRef(new Map<string, HTMLAudioElement>());

  const stopAudio = useCallback(() => {
    for (const a of audio.current.values()) {
      a.pause();
      a.currentTime = 0;
    }
  }, []);
  const applyBeat = useCallback(
    (i: number, instant: boolean) => {
      const b = beats[i];
      if (!b) return;
      beatRef.current = i;
      setBeat({ index: i, instant });
      const s = store.getState();
      const target = s.chapterTarget(b.chapter);
      s.applyState(
        {
          ...target,
          ...(b.t !== undefined ? { t: b.t } : {}),
          ...(b.camera ? { camera: b.camera } : {}),
          ...(b.layers ? { layers: b.layers } : {}),
          ...(b.highlight ? { highlight: b.highlight } : {}),
        },
        { instant },
      );
      stopAudio();
      const clip = b.audio ? audio.current.get(b.audio) : undefined;
      // Autoplay may be refused until the reader has interacted; the beat works without sound.
      if (clip) clip.play().catch(() => {});
    },
    [beats, store, stopAudio],
  );
  const stopPresentation = useCallback(
    (restoreHud: boolean) => {
      if (!presentingRef.current) return;
      presentingRef.current = false;
      beatRef.current = null;
      setBeat(null);
      stopAudio();
      if (savedScene.current) store.getState().applyState(savedScene.current, { instant: false });
      if (restoreHud) hud.setState({ hud: true });
    },
    [hud, store, stopAudio],
  );
  const startPresentation = useCallback(
    (start: number | null, instant: boolean) => {
      if (beats.length === 0) return;
      if (!presentingRef.current) {
        if (reference) setReferenceMode(false, true);
        setPlaying(false);
        setSelected(null);
        setSelectedEntity(null);
        setCardExpanded(false);
        savedScene.current = store.getState().snapshot();
        presentingRef.current = true;
        hud.setState({ hud: false });
        // Preload the narration of every beat that has one.
        for (const b of beats) {
          if (!b.audio || audio.current.has(b.audio)) continue;
          const clip = new Audio(withBase(b.audio));
          clip.preload = 'auto';
          audio.current.set(b.audio, clip);
        }
      }
      const here = beats.findIndex((b) => b.chapter === store.getState().chapter);
      applyBeat(clamp(start ?? Math.max(0, here), 0, beats.length - 1), instant);
    },
    [beats, reference, setReferenceMode, setPlaying, store, hud, applyBeat],
  );
  const stepBeat = useCallback(
    (dir: 1 | -1) => {
      const i = beatRef.current;
      if (i === null) return;
      const next = i + dir;
      if (next >= 0 && next < beats.length) applyBeat(next, false);
    },
    [beats.length, applyBeat],
  );
  // ESC / H / "show HUD" bring the HUD back: that ends the presentation.
  useEffect(
    () =>
      hud.subscribe((s, prev) => {
        if (presentingRef.current && s.hud && !prev.hud) stopPresentation(false);
      }),
    [hud, stopPresentation],
  );
  // Beat keys: → / SPACE next, ← previous. Captured before the host's chapter / pause keys.
  useEffect(() => {
    if (!presenting) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      const dir = e.key === 'ArrowRight' || e.key === ' ' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!dir) return;
      e.preventDefault();
      e.stopPropagation();
      stepBeat(dir);
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [presenting, stepBeat]);
  useEffect(() => () => stopAudio(), [stopAudio]);
  // Leader labels for the beat's highlighted ids only (the caption and the map agree).
  useEffect(() => controller?.setPresentation(presenting), [controller, presenting]);

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

  /* ---------- control panel: LAYERS (store layers + drawing modes) and TOOLS ---------- */
  const panelLayers = useMemo<ControlRow[]>(
    () => [
      { kind: 'layer', id: 'control', label: t('time.layer.control') },
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
  const panelTools = useMemo<ControlRow[]>(
    () => [
      { kind: 'mode', id: 'reference', label: t('time.tool.reference') },
      { kind: 'mode', id: 'presentation', label: t('time.tool.presentation') },
      { kind: 'hud' },
    ],
    [locale], // `t` is bound to `locale`
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
    const step = beat ? `${pad2(beat.index + 1)}/${pad2(beats.length)}` : '';
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
          {
            id: 'presentation',
            key: 'p',
            label: t('time.mode.presentation'),
            on: presenting,
            tone: 'signal',
            status: `PRESENTATION ${step}`.trim(),
            phone: false,
          },
        ],
        set: (id, on, { instant }) => {
          if (id === 'flow') toggleLayer('movements', on);
          else if (id === 'borders') toggleLayer('borders', on);
          else if (id === 'graticule') setGraticuleOn(on);
          else if (id === 'reference') setReferenceMode(on, instant);
          else if (id === 'presentation') {
            if (on) startPresentation(null, instant);
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
      cardToggle: { expanded: cardExpanded, set: setCardExpanded },
      beats: {
        list: () => beats.map(({ chapter, index, caption }) => ({ chapter, index, caption })),
        go: (i, { instant }) => startPresentation(i, instant),
        current: () => {
          const b = beatRef.current !== null ? beats[beatRef.current] : undefined;
          return b ? { chapter: b.chapter, beat: b.index } : null;
        },
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
    reference,
    presenting,
    beat,
    beats,
    playback.playing,
    playback.speed,
    setPlaying,
    setReferenceMode,
    startPresentation,
    stopPresentation,
    readStats,
    specRows,
    statusT,
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
  const stopChapter = playback.stop ? chapters.find((c) => c.id === playback.stop?.id) : undefined;

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

      {beat && (
        <Presentation
          title={topic.title}
          beats={beats}
          index={beat.index}
          instant={beat.instant}
          chapters={chapters}
          model={model}
          playhead={playhead}
          locale={locale}
          onStep={stepBeat}
          onGo={(i) => applyBeat(i, false)}
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
          chapters={chapters}
          currentChapter={currentChapter}
          highlight={highlight}
          playing={playback.playing}
          speed={playback.speed}
          onTogglePlay={() => setPlaying(!playback.playing)}
          onSpeed={playback.setSpeed}
          onScrub={commit}
          onScrubStart={scrubStart}
          onNudge={nudge}
          onChapter={goToChapterFromRule}
          onStepChapter={stepChapter}
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

/**
 * PRESENTATION: the only HUD left on the stage — the title block and one
 * paper caption card at the bottom (fades in once the flight is done): a
 * header line (`04 / 11 · chapter · date · 2 / 3`), the caption (large serif,
 * scrolls inside the card when it is long) and a two-level progress bar — one
 * hairline segment per chapter, the current chapter's segment split into its
 * beats; the filled part is the progress up to the current beat. Leader labels
 * for the beat's highlighted ids come from the map (controller
 * `setPresentation`). A transparent layer over the map takes clicks (= next
 * beat) and keeps the map still.
 */
function Presentation({
  title,
  beats,
  index,
  instant,
  chapters,
  model,
  playhead,
  locale,
  onStep,
  onGo,
}: {
  title: BilingualText;
  beats: readonly Beat[];
  index: number;
  instant: boolean;
  chapters: readonly Chapter[];
  model: TimeModel;
  playhead: Playhead;
  locale: EngineViewProps['locale'];
  onStep(dir: 1 | -1): void;
  onGo(index: number): void;
}) {
  const tr = useT();
  const now = useSyncExternalStore(playhead.subscribe, playhead.get, playhead.get);
  const b = beats[index]!;
  const chapter = chapters[b.chapterIndex];
  /** First beat and beat count of every chapter. */
  const spans = useMemo(
    () =>
      chapters.map((_, ci) => {
        const first = beats.findIndex((x) => x.chapterIndex === ci);
        return { first, count: first < 0 ? 0 : beats.filter((x) => x.chapterIndex === ci).length };
      }),
    [chapters, beats],
  );
  const caption = useRef<HTMLParagraphElement>(null);
  // A new beat starts at the top of its caption.
  useEffect(() => {
    caption.current?.scrollTo({ top: 0 });
  }, [index]);
  const go = (i: number) => (e: { detail: number; currentTarget: HTMLElement }) => {
    onGo(i);
    if (e.detail > 0) e.currentTarget.blur();
  };
  return (
    <div className="ts-present" data-instant={instant || undefined}>
      <div className="ts-present__hit" onClick={() => onStep(1)} aria-hidden="true" />
      <p className="ts-present__title" data-hud-panel="present-title">
        <small>{tr('time.presentation').toLocaleUpperCase('en')}</small>
        <span lang="en">{title.en}</span>
        {title.zh && <span lang="zh-Hans">{title.zh}</span>}
      </p>
      <div className="ts-present__foot" data-hud-panel="present">
        <p className="ts-present__chapter">
          <i>
            {pad2(b.chapterIndex + 1)} / {pad2(chapters.length)}
          </i>
          {chapter && <span>{tx(chapter.title, locale)}</span>}
          <b>{formatReadout(now, model, locale)}</b>
          {b.count > 1 && (
            <em>
              {b.index + 1} / {b.count}
            </em>
          )}
        </p>
        <p className="ts-present__caption" key={index} ref={caption} aria-live="polite" onClick={() => onStep(1)}>
          {tx(b.caption, locale)}
        </p>
        <nav className="ts-present__bar" aria-label={tr('time.beats')}>
          <ol>
            {chapters.map((c, ci) => {
              const { first, count } = spans[ci]!;
              const state = ci < b.chapterIndex ? 'done' : ci === b.chapterIndex ? 'current' : 'todo';
              const label = <span className="ts-present__no">{pad2(ci + 1)}</span>;
              return (
                <li key={c.id} className="ts-present__seg" data-state={state}>
                  {state === 'current' && count > 1 ? (
                    <>
                      <div className="ts-present__ticks">
                        {Array.from({ length: count }, (_, k) => (
                          <button
                            key={k}
                            type="button"
                            className="ts-present__tick"
                            data-state={k <= b.index ? 'done' : 'todo'}
                            aria-current={k === b.index ? 'step' : undefined}
                            aria-label={tr('time.beat', { n: ci + 1, k: k + 1, caption: tx(beats[first + k]!.caption, locale) })}
                            title={`${pad2(ci + 1)}.${k + 1} · ${tx(c.title, locale)}`}
                            onClick={go(first + k)}
                          />
                        ))}
                      </div>
                      {label}
                    </>
                  ) : (
                    <button
                      type="button"
                      className="ts-present__chap"
                      aria-current={state === 'current' ? 'step' : undefined}
                      aria-label={tr('time.beatChapter', { n: ci + 1, title: tx(c.title, locale) })}
                      title={`${pad2(ci + 1)} · ${tx(c.title, locale)}`}
                      onClick={go(first)}
                    >
                      <i className="ts-present__line" />
                      {label}
                    </button>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </div>
  );
}
