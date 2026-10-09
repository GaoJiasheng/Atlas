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
 * back with `patch()`. There is no other free-running playback: the bar's
 * PRESENT button starts the presentation.
 *
 * PRESENTATION (P) is a sequence of user-paced beats: every chapter's
 * `state.beats`, or one beat per chapter (its state, `summary` as caption).
 * Each beat flies the camera and eases `t` (store `applyState`), then fades
 * its caption in; click / → / SPACE = next, ← = previous, a chapter segment or
 * beat tick of the progress bar = jump. The
 * HUD is hidden, the map takes no input. ESC or P ends it and restores the
 * scene as it was. AUTO-PLAY (a checkbox by the progress bar, remembered for
 * the session) advances by itself once the camera has settled and the caption
 * has faded in: after the audio clip or the spoken caption (VOICE) ends, else
 * after a dwell that grows with the caption's length; any input pauses it for
 * that beat. VOICE (a checkbox beside it, remembered for the session) speaks
 * each caption with the browser's speech synthesis (lib/speech.ts).
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
import { onVoicesChanged, primeSpeech, speak, speakableText, stopSpeech, voiceFor, type Narration } from './lib/speech';
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
import './time-scene.css';

const CHAPTER_TWEEN_MS = 1600;
/** A chapter's auto-run: the playhead eases from the span start to the chapter time. */
const CHAPTER_RUN_MS = 5000;
/** A beat's camera flight (controller FLY_MS) and caption fade-in end about here; auto-play counts from then. */
const BEAT_SETTLE_MS = 2300;
/** Auto-play dwell: 4 s + 60 ms per caption character, within 6–20 s. */
const autoplayDwell = (chars: number) => Math.min(20_000, Math.max(6_000, 4_000 + 60 * chars));
const AUTOPLAY_KEY = 'atlas:autoplay';
const readAutoplay = () => {
  try {
    return sessionStorage.getItem(AUTOPLAY_KEY) === '1';
  } catch {
    return false;
  }
};
const writeAutoplay = (on: boolean) => {
  try {
    sessionStorage.setItem(AUTOPLAY_KEY, on ? '1' : '0');
  } catch {
    // Storage unavailable (private mode): the switch still works for this page.
  }
};
const VOICE_KEY = 'atlas:voice';
const readVoice = () => {
  try {
    return sessionStorage.getItem(VOICE_KEY) === '1';
  } catch {
    return false;
  }
};
const writeVoice = (on: boolean) => {
  try {
    sessionStorage.setItem(VOICE_KEY, on ? '1' : '0');
  } catch {
    // Storage unavailable (private mode): the switch still works for this page.
  }
};
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

  /* ---------- chapter auto-run ---------- */
  const [running, setRunning] = useState(false);
  const runningRef = useRef(false);
  const runToken = useRef(0);
  /**
   * Where a chapter's run starts and ends: its first beat's `t` if it has one, else the previous
   * chapter's time, else the data minimum (each only when it is before the chapter time).
   */
  const chapterSpan = useCallback(
    (id: string | null): [number, number] | null => {
      const i = chapters.findIndex((c) => c.id === id);
      const chapter = chapters[i];
      const end = chapter ? store.getState().chapterTarget(chapter.id).t : null;
      if (!chapter || end === null) return null;
      const to = clamp(toNumber(end), model.min, model.max);
      const beatT = (chapter.state as TimeChapterState).beats?.[0]?.t;
      const prev = i > 0 ? store.getState().chapterTarget(chapters[i - 1]!.id).t : null;
      const candidates = [beatT !== undefined ? toNumber(beatT as TimePoint) : null, prev !== null ? toNumber(prev) : null, model.min];
      for (const c of candidates) {
        if (c === null || !Number.isFinite(c)) continue;
        const from = clamp(c, model.min, model.max);
        if (from < to) return [from, to];
      }
      return [to, to];
    },
    [chapters, store, model],
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
        else if (s.transition.reason === 'chapter' && !presentingRef.current) startRun(s.chapter, target);
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
    [beats, reference, setReferenceMode, store, hud, applyBeat],
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
  /* AUTO-PLAY: off by default, remembered for the session. */
  const [autoplay, setAutoplayState] = useState(false);
  useEffect(() => setAutoplayState(readAutoplay()), []);
  const autoplayRef = useRef(autoplay);
  autoplayRef.current = autoplay;
  const setAutoplay = useCallback((on: boolean) => {
    writeAutoplay(on);
    setAutoplayState(on);
  }, []);
  /* VOICE: the caption is narrated with the browser's speech synthesis. Off by default, remembered for the session. */
  const [voiceWanted, setVoiceWanted] = useState(false);
  useEffect(() => setVoiceWanted(readVoice()), []);
  const [voiceAvailable, setVoiceAvailable] = useState(false);
  const voiceAvailableRef = useRef(false);
  voiceAvailableRef.current = voiceAvailable;
  useEffect(() => {
    const update = () => setVoiceAvailable(voiceFor(locale) !== null);
    update();
    return onVoicesChanged(update); // Chrome loads voices asynchronously
  }, [locale]);
  const voiceRef = useRef(false);
  voiceRef.current = voiceWanted;
  const setVoice = useCallback((on: boolean) => {
    if (on && !voiceAvailableRef.current) return false;
    writeVoice(on);
    if (on) primeSpeech(); // inside the click: iOS / Safari only speak after a gesture
    setVoiceWanted(on);
    return true;
  }, []);
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
  // The caption card mounts / changes size with each beat: labels re-measure around it at once.
  const beatIndex = beat?.index ?? -1;
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
      beats: {
        list: () => beats.map(({ chapter, index, caption }) => ({ chapter, index, caption })),
        go: (i, { instant }) => startPresentation(i, instant),
        current: () => {
          const b = beatRef.current !== null ? beats[beatRef.current] : undefined;
          return b ? { chapter: b.chapter, beat: b.index, autoplay: autoplayRef.current, voice: voiceRef.current } : null;
        },
        setAutoplay,
        setVoice,
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
    territoryOn,
    reference,
    presenting,
    beat,
    beats,
    setAutoplay,
    setVoice,
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

  const beatClip = beat ? beats[beat.index]?.audio : undefined;
  const beatAudio = beatClip ? (audio.current.get(beatClip) ?? null) : null;

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
          audio={beatAudio}
          autoplay={autoplay}
          onAutoplay={setAutoplay}
          voice={voiceWanted && voiceAvailable}
          voiceAvailable={voiceAvailable}
          onVoice={setVoice}
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
          presenting={presenting}
          onPresent={() => (presentingRef.current ? stopPresentation(true) : startPresentation(null, false))}
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

/**
 * PRESENTATION: the only HUD left on the stage — the title block and one
 * paper caption card at the bottom (fades in once the flight is done): a
 * header line (`04 / 11 · chapter · date · 2 / 3`), the caption (large serif,
 * scrolls inside the card when it is long) and a two-level progress bar — one
 * hairline segment per chapter, the current chapter's segment split into its
 * beats; the filled part is the progress up to the current beat. Leader labels
 * for the beat's highlighted ids come from the map (controller
 * `setPresentation`). A transparent layer over the map takes clicks (= next
 * beat) and keeps the map still. Beside the bar, the AUTO-PLAY checkbox.
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
  audio,
  autoplay,
  onAutoplay,
  voice,
  voiceAvailable,
  onVoice,
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
  /** This beat's narration clip, if it has one. */
  audio: HTMLAudioElement | null;
  autoplay: boolean;
  onAutoplay(on: boolean): void;
  /** Narrate the caption (switched on and a voice exists). */
  voice: boolean;
  voiceAvailable: boolean;
  onVoice(on: boolean): void;
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

  /*
   * AUTO-PLAY: once the camera has settled and the caption has faded in, wait
   * for the narration to end (if the beat has one and it plays), else a dwell
   * by caption length, then go on. Any input (click, key, wheel) holds it for
   * this beat; the next beat (however it comes) runs it again. Stops at the end.
   */
  const [held, setHeld] = useState(false);
  useEffect(() => setHeld(false), [index]);
  const last = index >= beats.length - 1;
  const captionText = tx(b.caption, locale);

  /*
   * VOICE: once the caption has faded in, speak it (a beat's `audio` clip takes priority).
   * A new beat, turning Voice off and leaving the presentation cancel it. `speech` tells the
   * auto-play below whether an utterance is on its way, so it can wait for the end of it.
   */
  const speech = useRef<{ state: 'idle' | 'pending' | 'speaking' | 'ended'; listeners: Set<() => void> }>({ state: 'idle', listeners: new Set() });
  const spoken = speakableText(captionText);
  const voiceOn = voice && !audio && spoken !== '';
  useEffect(() => {
    const sp = speech.current;
    const voiceChoice = voiceOn ? voiceFor(locale) : null;
    if (!voiceChoice) {
      sp.state = 'idle';
      return;
    }
    sp.state = 'pending';
    let narration: Narration | null = null;
    const timer = window.setTimeout(
      () => {
        sp.state = 'speaking';
        narration = speak(spoken, voiceChoice, () => {
          sp.state = 'ended';
          for (const l of [...sp.listeners]) l();
        });
      },
      instant ? 0 : BEAT_SETTLE_MS,
    );
    return () => {
      window.clearTimeout(timer);
      narration?.cancel();
      stopSpeech();
      sp.state = 'idle';
    };
  }, [voiceOn, index, instant, locale, spoken]);

  useEffect(() => {
    if (!autoplay || held || last) return;
    let dwell = 0;
    let stopWaiting = () => {};
    const advance = () => onStep(1);
    const settle = window.setTimeout(
      () => {
        if (audio?.ended) advance();
        else if (audio && !audio.paused) audio.addEventListener('ended', advance, { once: true });
        else if (voiceOn && speech.current.state !== 'idle') {
          // Wait for the utterance to end (a short breath after it); a stuck engine falls back to three dwells.
          const sp = speech.current;
          const afterEnd = () => {
            window.clearTimeout(dwell);
            dwell = window.setTimeout(advance, 600);
          };
          if (sp.state === 'ended') afterEnd();
          else {
            sp.listeners.add(afterEnd);
            stopWaiting = () => sp.listeners.delete(afterEnd);
            dwell = window.setTimeout(advance, 3 * autoplayDwell([...captionText].length));
          }
        } else dwell = window.setTimeout(advance, autoplayDwell([...captionText].length));
      },
      instant ? 0 : BEAT_SETTLE_MS,
    );
    const hold = (e: Event) => {
      if (e.target instanceof Element && e.target.closest('.ts-present__auto')) return;
      setHeld(true);
    };
    window.addEventListener('pointerdown', hold, true);
    window.addEventListener('keydown', hold, true);
    window.addEventListener('wheel', hold, true);
    return () => {
      window.clearTimeout(settle);
      window.clearTimeout(dwell);
      stopWaiting();
      audio?.removeEventListener('ended', advance);
      window.removeEventListener('pointerdown', hold, true);
      window.removeEventListener('keydown', hold, true);
      window.removeEventListener('wheel', hold, true);
    };
  }, [autoplay, held, last, index, instant, audio, captionText, onStep, voiceOn]);
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
          {captionText}
        </p>
        <div className="ts-present__row">
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
          <div className="ts-present__opts">
            <label className="ts-present__auto" title={tr('time.autoplayHint')} data-held={(autoplay && held) || undefined}>
              <input
                type="checkbox"
                checked={autoplay}
                onChange={(e) => onAutoplay(e.currentTarget.checked)}
                onClick={(e) => {
                  if (e.detail > 0) e.currentTarget.blur();
                }}
              />
              <span>{tr('time.autoplay')}</span>
            </label>
            <label
              className="ts-present__auto ts-present__voice"
              title={voiceAvailable ? tr('time.voiceHint') : tr('time.voiceNone')}
              data-disabled={!voiceAvailable || undefined}
            >
              <input
                type="checkbox"
                checked={voice}
                disabled={!voiceAvailable}
                onChange={(e) => onVoice(e.currentTarget.checked)}
                onClick={(e) => {
                  if (e.detail > 0) e.currentTarget.blur();
                }}
              />
              <span>{tr('time.voice')}</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
