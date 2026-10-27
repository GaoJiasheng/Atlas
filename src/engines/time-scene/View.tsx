/**
 * TimeScene view: GeoStage (MapLibre) + the bottom bar (timeline rule, state
 * cluster, swimlanes) + HUD content (participation card, perf) + the control
 * panel (layers, tools, key) + inspectors (event, entity), and the scene
 * controls (geographic presets, modes, status, spec rows, beats). See
 * docs/06 "TimeScene".
 *
 * Time flows through two layers:
 *  - the store's `t` (TimePoint, in the URL, set by chapters, beats and deep links)
 *  - the playhead (continuous number the map renders at; lib/playhead.ts)
 * The bottom bar is segmented like the presentation's progress bar (one
 * segment per story chapter, a tick per beat; lib/segmentScale.ts). Picking a
 * chapter (segment, rail, chips, ← →, Next / Back) goes there and then applies
 * its FIRST BEAT (camera, `t`, layers, highlight) with the normal transition:
 * the camera flies and the playhead eases to the beat's time in 1.6 s; there
 * is no auto-run. A tick applies its beat the same way (the chapter follows;
 * the HUD and the reader stay as they are). The playhead drags at any time;
 * scrubbing writes a rounded `t` back with `patch()`. There is no
 * free-running playback: the top bar's PRESENT button (key P) starts the
 * presentation.
 *
 * A background chapter (`kind: background`, core/chapters.ts) has no time of
 * its own: no segment on the bar; its map is the first keyframe (or its
 * `state.time`).
 *
 * PRESENTATION (P) runs on the core presentation system
 * (core/presentation: beats, caption card, progress bar, auto-play, voice,
 * keys, save / restore). TimeScene's adapter: a beat is the chapter's target
 * plus the beat's `t` / `camera` / `layers` / `highlight`, applied with the
 * store's `applyState` (camera flight, `t` ease); the caption card's header
 * shows the playhead date; entering leaves REFERENCE and drops selections;
 * the map shows leader labels for the beat's highlighted ids only. Once a
 * beat has settled the map is free to pan and zoom (core lifts its input
 * layer); clicking the map selects nothing and does not advance; the next
 * beat flies from wherever the reader left the camera.
 */
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import type { EngineViewProps, GeoCamera, SceneSnapshot } from '../core/types';
import { SceneSlot, useScene, useSceneContext, useSceneControls, useSceneStore, useT } from '../core/context';
import { storyChapters } from '../core/chapters';
import type { SceneControls, SpecRow } from '../core/controls';
import { usePresentation, type Beat, type PresentationAdapter } from '../core/presentation';
import { ControlPanel, type ControlRow } from '../widgets/ControlPanel';
import type { LegendItem } from '../widgets/Legend';
import { Icon } from '../widgets/icons';
import { t as translate, tx, type BilingualText, type UiKey } from '../../i18n';
import { isGeoTime, formatTimeParam } from '../../lib/time';
import type { TimeSceneExt } from './index';
import type { TimeBeat, TimeChapterState, TimeSceneGeoData } from './schema';
import { timeBeatState, linkedTimeBeatState } from './lib/beatState';
import { filterModernPoints, nextModernSelection } from './lib/deepTime';
import type { ReconstructionStats } from './lib/reconstruction';
import './geology.css';
import { buildTimeModel, type TimeModel } from './lib/model';
import { createPlayhead, type Playhead } from './lib/playhead';
import type { Anchor, SegmentSpec } from './lib/segmentScale';
import { clamp, fromNumber, keyframeWindow, stepFor, toNumber, type TimePoint } from './lib/time';
import { frameAt } from './lib/frame';
import { controlAreas, referencePair } from './lib/stats';
import { withEntityColours } from './lib/holders';
import { formatTime } from './lib/format';
import { GeoStage } from './stages/geo/GeoStage';
import type { GeoController } from './stages/geo/controller';
import { Timeline, formatReadout } from './timeline/Timeline';
import { EventInspector } from './EventInspector';
import { EntityInspector } from './EntityInspector';
import { ChapterIndex } from './ChapterIndex';
import { eventSelectionPatch } from './lib/reader';
import { BandCard, PerfReadout, useFps } from './hud/HudPanels';
import { DatedLayerPlate } from './hud/DatedLayerPlate';
import type { DatedLayerIndex } from './lib/datedLayers';
import { BLOC_CSS, entityCssColor } from './colors';
import { blocsOf, changesBloc } from './lib/bloc';
import { blocLabel, blocLabelText } from './lib/blocLabels';
import './time-scene.css';

const CHAPTER_TWEEN_MS = 1600;
const SQUARE_KINDS = new Set<string>(['massacre', 'atrocity']);
const TRIANGLE_KINDS = new Set<string>(['disaster']);
/** Up to this many entities, the legend names each one; above, it groups by bloc. */
const LEGEND_ENTITY_LIMIT = 6;
/** Status line: BCE dates read as the readout (`350 BCE`), not the raw `-0350`. */
const isBce = (iso: string) => iso.startsWith('-');
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

/* Deep-time topics only (docs/47): their HUD and modern-evidence loader stay out of the View chunk. */
const deepTimeUi = () => import('./ModernInset');
const ModernInset = lazy(() => deepTimeUi().then((m) => ({ default: m.ModernInset })));
const ModernInspector = lazy(() => deepTimeUi().then((m) => ({ default: m.ModernInspector })));
const ModernIndex = lazy(() => deepTimeUi().then((m) => ({ default: m.ModernIndex })));
const ModernEvidence = lazy(() => deepTimeUi().then((m) => ({ default: m.ModernEvidence })));
const ReconstructionReadout = lazy(() => deepTimeUi().then((m) => ({ default: m.ReconstructionReadout })));
const GeologyPlate = lazy(() => deepTimeUi().then((m) => ({ default: m.GeologyPlate })));

export default function TimeSceneView(props: EngineViewProps) {
  const source = props.data as TimeSceneGeoData;
  const [loaded, setLoaded] = useState<TimeSceneGeoData | null>(() => !props.topic.modernInset || source.deepTime?.land ? source : null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (!props.topic.modernInset || !source.deepTime) { setLoaded(source); return; }
    let cancelled = false;
    const deepTime = source.deepTime;
    const config = props.topic.modernInset;
    // The UI chunk loads alongside the local evidence files, so the scene mounts without a second wait.
    Promise.all([import('./deep-time-transport'), deepTimeUi()]).then(([{ loadModernEvidence }]) => loadModernEvidence(deepTime, config)).then(
      (bundle) => { if (!cancelled) setLoaded({ ...source, deepTime: bundle }); },
      () => { if (!cancelled) setFailed(true); },
    );
    return () => { cancelled = true; };
  }, [source, props.topic.modernInset]);
  if (!loaded) return <p className="ts-geo__notice" role="status">{props.locale === 'zh' ? (failed ? '现代证据资料暂不可用，请重新加载。' : '正在加载本地现代证据资料…') : (failed ? 'Modern evidence is unavailable. Please reload.' : 'Loading local modern evidence…')}</p>;
  return <TimeSceneReady {...props} data={loaded} />;
}

function TimeSceneReady({ topic, data, chapters, locale }: EngineViewProps) {
  const t = useT();
  // `colorBy: entity`: every entity is drawn in its own colour (a holder token when it names none).
  const geo = useMemo(() => withEntityColours(data as TimeSceneGeoData, topic.colorBy), [data, topic.colorBy]);
  const region = topic.basemap?.region ?? null;
  const deepTime = geo.deepTime;
  const reconstructed = !!topic.basemap?.reconstruction;
  const [narrowInset, setNarrowInset] = useState(false);
  useEffect(() => {
    // Phones (the host hides the card below 760 px): the find map moves into the reader, which opens on a picked find.
    const query = window.matchMedia('(max-width: 759px)');
    const update = () => setNarrowInset(query.matches);
    update(); query.addEventListener('change', update); return () => query.removeEventListener('change', update);
  }, []);
  const [reconstructionStats, setReconstructionStats] = useState<ReconstructionStats | null>(null);
  const store = useSceneStore<TimeSceneExt>();
  const { hud, revealReader } = useSceneContext();
  const currentChapter = useScene<TimeSceneExt, string | null>((s) => s.chapter);
  const layers = useScene<TimeSceneExt, string[]>((s) => s.layers);
  const highlight = useScene<TimeSceneExt, string[]>((s) => s.highlight);
  const storeT = useScene<TimeSceneExt, TimePoint | null>((s) => s.t);

  const inset = useScene<TimeSceneExt, TimeSceneExt['inset']>((s) => s.inset) ?? 'world';
  const insetVisible = useScene<TimeSceneExt, boolean | undefined>((s) => s.insetVisible) ?? true;
  const fossilMode = useScene<TimeSceneExt, TimeSceneExt['fossilMode']>((s) => s.fossilMode) ?? 'age-window';
  const activeBeat = useScene<TimeSceneExt, number | null>((s) => s.beat ?? null);
  const selectedMa = storeT && isGeoTime(storeT) ? storeT.ma : 0;
  const outsideSelection = useRef<string | null>(null);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const modernObjects = useMemo(() => new Map([...(deepTime?.points ?? []), ...(deepTime?.cards ?? [])].map((o) => [o.id, o])), [deepTime]);
  const modernCounts = useMemo(() => deepTime ? filterModernPoints(deepTime.points, { selectedMa, fossilMode, fossilsEnabled: layers.includes('fossils-modern'), bounds: topic.modernInset?.views.find((v) => v.id === inset)?.bounds, cards: deepTime.cards }) : null, [deepTime, selectedMa, fossilMode, layers, inset, topic.modernInset]);
  const selectModern = useCallback((id: string) => { const object = modernObjects.get(id); const outside = object?.kind === 'fossil-collection' && !modernCounts?.visiblePoints.some((p) => p.id === id); outsideSelection.current = outside ? id : null; setSelectedObjectId(id); store.getState().patch({ highlight: outside ? [] : [id] }); revealReader?.(); }, [store, revealReader, modernObjects, modernCounts]);
  const modernPatch = useCallback((patch: Pick<Partial<TimeSceneExt>, 'inset' | 'insetVisible' | 'fossilMode'>) => store.getState().patch(patch), [store]);

  /* ---------- model + playhead ---------- */
  /** Chapters with a place on the timeline (the background chapter has none). */
  const story = useMemo(() => storyChapters(chapters), [chapters]);
  const model = useMemo(
    () =>
      buildTimeModel(
        geo,
        story.map((c) => ({ id: c.id, t: store.getState().chapterTarget(c.id).t })),
        { datePrecision: topic.datePrecision, maDigits: topic.maDigits },
      ),
    [geo, story, store, topic.datePrecision, topic.maDigits],
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
      // A topic dated to the year writes years back (`t=-0350`).
      const tp = fromNumber(v, model.scale, { precision: model.datePrecision, maDigits: model.maDigits });
      const key = formatTimeParam(tp);
      if (store.getState().beat != null) store.getState().patch({ beat: null });
      if (key !== lastWritten.current) {
        lastWritten.current = key;
        store.getState().patch({ t: tp, beat: null });
      }
    },
    [playhead, model, store],
  );

  /* ---------- segments: one per story chapter, a tick per beat (the bar and the band card) ---------- */
  const segments = useMemo<SegmentSpec[]>(
    () =>
      story.map((c) => {
        const own = store.getState().chapterTarget(c.id).t;
        const beats = (c.state as TimeChapterState).beats ?? [];
        const first = beats.find((b) => b.t !== undefined)?.t;
        const timeOf = (p: TimePoint | null | undefined) => (p !== null && p !== undefined ? toNumber(p) : Number.NaN);
        const time = [timeOf(own), timeOf(first as TimePoint | undefined), model.min].find(Number.isFinite)!;
        return { id: c.id, time, beats: beats.map((b) => (b.t !== undefined ? toNumber(b.t as TimePoint) : time)) };
      }),
    [story, store, model],
  );
  /** Where the playhead belongs on the bar: the chapter's segment, and the beat it rests on. */
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  /** The beat being applied (so the transition it causes anchors the playhead on its tick). */
  const pendingBeat = useRef<{ chapter: string; index: number } | null>(null);

  /* ---------- selection: an event (map / labels) or an entity (card row) ---------- */
  const [selected, setSelected] = useState<string | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
  const [cardExpanded, setCardExpanded] = useState(false);
  const anchorRef = useRef(anchor);
  anchorRef.current = anchor;
  /** The beat the bar rests on (scrubbing, a date jump or a new chapter leave it). */
  const anchoredBeat = useCallback(() => {
    const a = anchorRef.current;
    const chapter = a ? story[a.segment]?.id : undefined;
    return chapter !== undefined && typeof a?.tick === 'number' ? { chapter, index: a.tick } : null;
  }, [story]);
  // Closing a detail returns the emphasis of the beat the bar rests on, else the chapter's.
  const restoreHighlight = useCallback(() => {
    const s = store.getState();
    const at = anchoredBeat();
    const beat = at?.chapter === s.chapter ? beatsRef.current.find((b) => b.chapter === at.chapter && b.index === at.index) : undefined;
    s.patch({ highlight: [...(beat?.spec?.highlight ?? s.chapterTarget(s.chapter).highlight)] });
  }, [store, anchoredBeat]);
  const selectEvent = useCallback(
    (id: string) => {
      if (presentation.isPresenting() || !geo.events.some((event) => event.id === id)) return false;
      store.getState().patch({ highlight: [id] });
      setSelectedEntity(null);
      setSelected(id);
      revealReader();
      return true;
    },
    [store, geo.events, revealReader],
  );
  const selectIndexedEvent = useCallback((id: string) => {
    const s = store.getState();
    const patch = eventSelectionPatch(s, geo.events, id, presentation.isPresenting());
    if (!patch) return false;
    // A place keeps the time, so it keeps the beat the bar rests on; a dated event leaves it.
    const at = geo.events.find((event) => event.id === id)?.kind === 'site' ? anchoredBeat() : null;
    if (at) pendingBeat.current = at;
    // Store transitions clear old selections synchronously: select only after applying the map state.
    s.applyState(patch);
    setSelectedEntity(null);
    setSelected(id);
    revealReader();
    return true;
  }, [store, geo.events, revealReader, anchoredBeat]);
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
      revealReader();
    },
    [store, selectedEntity, restoreHighlight, revealReader],
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
          const segment = story.findIndex((c) => c.id === s.chapter);
          const pending = pendingBeat.current;
          pendingBeat.current = null;
          // A chapter without beats of its own is its single beat.
          const ownBeats = (story[segment]?.state as TimeChapterState | undefined)?.beats?.length ?? 0;
          const tick = pending?.chapter === s.chapter ? pending.index : s.transition.reason === 'chapter' && ownBeats === 0 ? 0 : null;
          setAnchor(segment >= 0 ? { segment, tick } : null);
          // A chapter picked by the reader (segment, rail, chips, ← →) opens on its first beat, once this transition is out.
          if (s.transition.reason === 'chapter' && !s.transition.instant && !presentation.isPresenting() && ownBeats > 0) {
            const id = s.transition.id;
            const chapter = s.chapter;
            queueMicrotask(() => {
              const first = beatsRef.current.find((b) => b.chapter === chapter && b.index === 0);
              if (first && store.getState().transition.id === id && !presentation.isPresenting()) applyBeatState(first, false);
            });
          }
        }
        if (!transitioned && s.t === prev.t) return;
        if (s.t === null) return;
        const key = formatTimeParam(s.t);
        if (!transitioned && key === lastWritten.current) return;
        lastWritten.current = key;
        const target = clamp(toNumber(s.t), model.min, model.max);
        if (!Number.isFinite(target)) return;
        if (reconstructed || !transitioned || s.transition.instant) playhead.set(target);
        else playhead.tweenTo(target, CHAPTER_TWEEN_MS);
      }),
    // `applyBeatState` and `presentation.isPresenting` read refs only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [store, playhead, model, story, reconstructed],
  );

  /* ---------- user time controls ---------- */
  const step = stepFor(model.span, model.scale);
  const nudge = useCallback(
    (dir: 1 | -1, big = false) => {
      setAnchor((a) => (a ? { segment: a.segment, tick: null } : a));
      commit(playhead.get() + dir * step * (big ? 10 : 1));
    },
    [commit, playhead, step],
  );
  const scrubStart = useCallback(() => playhead.cancelTween(), [playhead]);
  const scrub = useCallback(
    (n: number, segment: number) => {
      setAnchor({ segment, tick: null });
      commit(n);
    },
    [commit],
  );
  const goToChapterFromBar = useCallback((id: string) => store.getState().goToChapter(id), [store]);

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
  /** The island-scale land carries today's coastline (a dashed reference line, listed in the legend while names are on). */
  const [coastToday, setCoastToday] = useState(false);
  const onLocalLand = useCallback((info: { coastToday: boolean }) => setCoastToday(info.coastToday), []);
  const [datedIndexes, setDatedIndexes] = useState<{ id: string; index: DatedLayerIndex }[]>([]);


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

  /* ---------- beats: the presentation's, and the bar's ticks (the same state) ---------- */
  /** Put the scene in a beat's state: the chapter's target plus the beat's `t` / `camera` / `layers` / `highlight`. */
  const applyBeatState = (b: Beat<TimeBeat>, instant: boolean) => {
    outsideSelection.current = null;
    const s = store.getState();
    const spec = b.spec;
    pendingBeat.current = { chapter: b.chapter, index: b.index };
    s.applyState(timeBeatState(s.chapterTarget(b.chapter), spec, b.index), { instant });
    // A beat's camera is authored, not the reader's: the status line keeps "CHAPTER NN VIEW".
    hud.setState({ cameraFree: false });
  };

  /* ---------- PRESENTATION (P): the core presentation over this map ---------- */
  const presentationAdapter: PresentationAdapter<TimeBeat, SceneSnapshot<TimeSceneExt>> = {
    beatsOf: (c) => (c.state as TimeChapterState).beats,
    captionOf: (b, l) => tx(b.caption, l),
    applyBeat: (b, { instant }) => applyBeatState(b, instant),
    saveState: () => store.getState().snapshot(),
    restoreState: (saved) => store.getState().applyState(saved, { instant: false }),
    onEnter: () => {
      if (outsideSelection.current) { outsideSelection.current = null; setSelectedObjectId(null); }
      if (referenceRef.current) setReferenceMode(false, true);
      setSelected(null);
      setSelectedEntity(null);
      setCardExpanded(false);
    },
    readout: <BeatReadout model={model} playhead={playhead} locale={locale} />,
  };
  const presentation = usePresentation(presentationAdapter);
  const beatsRef = useRef(presentation.beats);
  beatsRef.current = presentation.beats;
  /** A tick on the bar: that beat's state, outside the presentation (HUD and reader as they are). */
  const goToBeatFromBar = useCallback(
    (chapter: string, index: number) => {
      const b = beatsRef.current.find((x) => x.chapter === chapter && x.index === index);
      if (b) applyBeatState(b, false);
    },
    // `applyBeatState` reads the store and a ref only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  /** A tick's caption and date as written (a beat dated to the month reads as that month). */
  const beatLabel = useCallback(
    (chapter: string, index: number) => {
      const b = presentation.beats.find((x) => x.chapter === chapter && x.index === index);
      const when = (b?.spec?.t as TimePoint | undefined) ?? store.getState().chapterTarget(chapter).t;
      const date = when !== null && when !== undefined ? formatTime(when, locale, model.datePrecision, model.mixedEra, model.maDigits) : '';
      return { caption: b ? tx(b.caption, locale) : '', date: locale === 'en' ? date.toLocaleUpperCase('en') : date };
    },
    [presentation.beats, locale, store, model],
  );
  const urlBeatDone = useRef(false);
  useEffect(() => {
    const settle = () => {
      const st = store.getState();
      if (urlBeatDone.current || st.transition.reason !== 'url') return;
      urlBeatDone.current = true;
      if (st.beat == null) return;
      const b = beatsRef.current.find((x) => x.chapter === st.chapter && x.index === st.beat);
      if (!b) { st.patch({ beat: null }); return; }
      pendingBeat.current = { chapter: b.chapter, index: b.index };
      st.applyState(linkedTimeBeatState(timeBeatState(st.chapterTarget(b.chapter), b.spec, b.index), st.transition.fields ?? []), { instant: true });
      // As `applyBeatState`: the beat's camera is authored (the status line keeps "CHAPTER NN VIEW") unless the link sets its own.
      if (!(st.transition.fields ?? []).includes('camera')) hud.setState({ cameraFree: false });
    };
    settle();
    return store.subscribe((st, prev) => { if (st.transition.id !== prev.transition.id && st.transition.reason === 'url') queueMicrotask(settle); });
  }, [store, hud]);
  useEffect(() => { outsideSelection.current = null; }, [selectedMa, fossilMode]);
  // Clamp and quantize geological URL inputs, and discard layers/ids from the other coordinate space.
  useEffect(() => {
    if (!reconstructed || !deepTime) return;
    const normalize = () => {
      const st = store.getState();
      const patch: Partial<TimeSceneExt & SceneSnapshot> = {};
      const beat = st.beat == null ? undefined : beatsRef.current.find((b) => b.chapter === st.chapter && b.index === st.beat);
      const fallback = beat?.spec?.t ?? st.chapterTarget(st.chapter).t;
      const ma = st.t && isGeoTime(st.t) ? st.t.ma : fallback && isGeoTime(fallback) ? fallback.ma : deepTime.reconstruction.frames[0]!.t.ma;
      const quantized = fromNumber(-Math.min(deepTime.reconstruction.frames[0]!.t.ma, Math.max(0, ma)) * 1e6, 'ma', { maDigits: topic.maDigits });
      if (JSON.stringify(st.t) !== JSON.stringify(quantized)) patch.t = quantized;
      const valid = st.highlight.filter((id) => modernObjects.has(id));
      if (valid.length !== st.highlight.length) patch.highlight = valid;
      if (st.layers.some((id) => id !== 'fossils-modern' && id !== 'base')) patch.layers = st.layers.filter((id) => id === 'fossils-modern' || id === 'base');
      if (Object.keys(patch).length) st.patch(patch);
    };
    normalize();
    return store.subscribe(normalize);
  }, [store, reconstructed, deepTime, modernObjects, topic.maDigits]);
  useEffect(() => {
    if (!deepTime || !modernCounts) return;
    const visible = new Set(modernCounts.visiblePoints.map((p) => p.id));
    const eligible = (id: string) => { const o = modernObjects.get(id); return o && (o.kind !== 'fossil-collection' || visible.has(id)); };
    const filtered = highlight.filter(eligible);
    if (filtered.length !== highlight.length) store.getState().patch({ highlight: filtered });
    setSelectedObjectId((old) => nextModernSelection(old, filtered, outsideSelection.current));
  }, [deepTime, modernCounts, highlight, modernObjects, store, currentChapter, activeBeat]);
  const currentSegment = story.findIndex((c) => c.id === currentChapter);
  const { presenting, isPresenting, status: presentationStatus, controls: beatControls, start: startPresentation, stop: stopPresentation } = presentation;
  // Leader labels for the beat's highlighted ids only (the caption and the map agree).
  useEffect(() => controller?.setPresentation(presenting), [controller, presenting]);
  // The caption card mounts / changes size with each beat: labels re-measure around it at once.
  const beatIndex = presentation.beat?.index ?? -1;
  useEffect(() => {
    if (beatIndex >= 0) controller?.refreshLabels();
  }, [controller, beatIndex]);

  /* ---------- legend ---------- */
  const byEntity = topic.colorBy === 'entity';
  // The keyframe on show (re-render only when it changes): `colorBy: entity` lists its holders, largest first; an empty one has no control rows.
  const legendKeyframe = useSyncExternalStore(
    playhead.subscribe,
    () => dominantKeyframe(model, playhead.get()),
    () => dominantKeyframe(model, playhead.get()),
  );
  const areas = useMemo(() => (byEntity ? controlAreas(model) : null), [byEntity, model]);
  const approximate = useMemo(() => model.keyframes.some((k) => k.keyframe.features.features.some((f) => f.properties.certainty === 'approximate')), [model]);
  const legend = useMemo<LegendItem[]>(() => {
    const items: LegendItem[] = [];
    // An empty control keyframe (docs/34 E2) has no holder rows; participation shading does not depend on it.
    const emptyFrame = model.keyframes.length > 0 && model.keyframes[Math.max(0, legendKeyframe)]!.keyframe.features.features.length === 0;
    if (layers.includes('participation') || (layers.includes('control') && !emptyFrame)) {
      if (byEntity && areas) {
        // Every holder of this keyframe, each in its own colour, largest area first (never collapsed into one "states" row).
        const k = Math.max(0, legendKeyframe);
        const holders = geo.entities
          .map((e, i) => ({ e, i, area: areas.get(e.id)?.[k] ?? 0 }))
          .filter((h) => h.area > 0)
          .sort((a, b) => b.area - a.area || a.i - b.i);
        for (const { e } of holders) items.push({ id: `entity-${e.id}`, label: e.name, color: entityCssColor(e) });
      } else if (geo.entities.length <= LEGEND_ENTITY_LIMIT) {
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
      // Entities with an end date turn neutral once they are out of the war (by entity: a conquered state's land has a new holder, so no grey row).
      if (!byEntity && geo.entities.some((e) => e.left !== undefined)) items.push({ id: 'bloc-out', label: blocLabelText(topic.blocLabels, 'out'), color: BLOC_CSS.neutral });
      if (approximate) items.push({ id: 'approximate', label: bi('time.legend.approximate'), color: 'var(--line)', kind: 'dashed' });
    }
    if (region?.rivers) items.push({ id: 'river', label: bi('time.legend.river'), color: 'var(--rivers)', kind: 'line' });
    if (coastToday && territoryOn) items.push({ id: 'coast-today', label: bi('time.legend.coastToday'), color: 'var(--ink)', kind: 'line-dashed' });
    for (const layer of topic.datedLayers ?? []) {
      if (!layers.includes(layer.id)) continue;
      items.push({ id: `dated-layer-${layer.id}`, label: layer.label, color: layer.color ?? entityCssColor(geo.entities.find((e) => e.id === layer.holder)), kind: layer.kind === 'area' ? 'fill' : layer.kind === 'line' ? 'line' : 'point' });
    }
    if (topic.datedLayers?.some((layer) => layer.kind === 'point' && layers.includes(layer.id)))
      items.push({ id: 'dated-recent', label: bi('time.legend.datedRecent'), color: 'var(--signal)', kind: 'ring' });
    if (layers.includes('movements') && geo.movements.length)
      items.push({ id: 'movement', label: t('time.movement'), color: 'var(--ink-muted)', kind: 'arrow' });
    if (layers.includes('battles')) {
      const kinds = new Set(model.events.map((e) => e.event.kind));
      if ([...kinds].some((k) => k !== 'milestone' && !SQUARE_KINDS.has(k) && !TRIANGLE_KINDS.has(k)))
        items.push({ id: 'event', label: t('time.event'), color: 'var(--ink-muted)', kind: 'point' });
      if (kinds.has('milestone')) items.push({ id: 'milestone', label: bi('time.kind.milestone'), color: 'var(--ink)', kind: 'ring' });
      if (kinds.has('siege')) items.push({ id: 'siege', label: t('time.legend.siege'), color: 'var(--ink-muted)', kind: 'ring-dashed' });
      if ([...kinds].some((k) => SQUARE_KINDS.has(k)))
        items.push({ id: 'atrocity', label: bi('time.legend.atrocity'), color: 'var(--ink)', kind: 'square' });
      if ([...kinds].some((k) => TRIANGLE_KINDS.has(k)))
        items.push({ id: 'disaster', label: bi('time.legend.disaster'), color: 'var(--ink)', kind: 'triangle' });
    }
    if (layers.includes('sites') && model.sites.length)
      items.push({ id: 'site', label: t('time.legend.site'), color: 'var(--ink)', kind: 'site' });
    return items;
  }, [geo, model, layers, locale, topic.blocLabels, topic.datedLayers, byEntity, areas, legendKeyframe, approximate, region, coastToday, territoryOn]); // `t` is bound to `locale`

  /* ---------- control panel: LAYERS (store layers + drawing modes) and TOOLS ---------- */
  const panelLayers = useMemo<ControlRow[]>(
    () => reconstructed ? [
      { kind: 'layer', id: 'fossils-modern', label: { en: 'Selected fossil collections', zh: '所选化石采集记录' } },
      ...['inset-world', 'inset-southeast-asia', 'inset-mexico', 'inset-visible', 'fossil-all'].map((id) => ({ kind: 'mode' as const, id })),
      { kind: 'mode', id: 'graticule', label: t('time.layer.graticule') },
    ] : [
      { kind: 'layer', id: 'control', label: t('time.layer.control') },
      { kind: 'mode', id: 'territory', label: t('time.layer.territory') },
      // A regional plate has no modern borders.
      ...(region ? [] : [{ kind: 'mode' as const, id: 'borders', label: t('time.layer.borders') }]),
      { kind: 'mode', id: 'graticule', label: t('time.layer.graticule') },
      { kind: 'mode', id: 'flow', label: t('time.layer.movements') },
      { kind: 'layer', id: 'battles', label: t('time.layer.battles') },
      { kind: 'layer', id: 'participation', label: t('time.layer.participation') },
      ...(model.sites.length > 0 ? [{ kind: 'layer' as const, id: 'sites', label: t('time.layer.sites') }] : []),
      ...(topic.datedLayers ?? []).map((layer) => ({ kind: 'layer' as const, id: layer.id, label: layer.label, color: layer.color ?? entityCssColor(geo.entities.find((e) => e.id === layer.holder))})),
      { kind: 'mode', id: 'labels', label: t('time.layer.labels') },
    ],
    [model, locale, region, topic.datedLayers, geo.entities, reconstructed], // `t` is bound to `locale`
  );
  const hasGlossary = (geo.glossary?.terms.length ?? 0) > 0;
  const panelTools = useMemo<ControlRow[]>(
    () => [
      ...(!reconstructed ? [{ kind: 'mode' as const, id: 'reference', label: t('time.tool.reference') }] : []),
      { kind: 'mode', id: 'presentation', label: t('present.tool') },
      ...(hasGlossary ? [{ kind: 'glossary' as const }] : []),
      { kind: 'hud' },
    ],
    [locale, hasGlossary, reconstructed], // `t` is bound to `locale`
  );

  /* ---------- overlay: open by default only when the stage is roomy ---------- */
  const stageRef = useRef<HTMLDivElement>(null);
  const [overlayOpen, setOverlayOpen] = useState(false);
  useEffect(() => {
    setOverlayOpen((stageRef.current?.clientWidth ?? 0) >= OVERLAY_OPEN_MIN_WIDTH);
  }, []);

  /* ---------- perf ---------- */
  const fps = useFps(!reconstructed);
  const controllerRef = useRef<GeoController | null>(null);
  controllerRef.current = controller;
  const readStats = useCallback(() => {
    const s = controllerRef.current?.stats();
    return s ? { ...s, fps: reconstructed ? undefined : fps.current } : null;
  }, [fps, reconstructed]);

  /* ---------- HUD controls (docs/08 §3) ---------- */
  const movementsOn = layers.includes('movements');
  const bordersOn = layers.includes('borders');
  const statusParam = storeT !== null ? formatTimeParam(storeT) : '';
  // BCE dates, and every date of a topic that crosses into CE (docs/43 E1), read as the readout: '221 BCE', '150 CE'.
  const statusT = storeT !== null && (isBce(statusParam) || model.mixedEra) ? formatReadout(toNumber(storeT), model, locale) : statusParam;
  const specRows = useMemo<SpecRow[]>(
    () => reconstructed ? [
      { id: 'samples', label: { en: 'Model samples', zh: '模型样本' }, value: pad2(model.keyframes.length), mono: true },
      { id: 'collections', label: { en: 'Selected collections', zh: '所选采集记录' }, value: String(modernCounts?.fossilsTotal ?? 0), mono: true },
    ] : [
      { id: 'entities', label: bi('time.spec.entities'), value: pad2(geo.entities.length), mono: true },
      { id: 'keyframes', label: bi('time.spec.keyframes'), value: pad2(model.keyframes.length), mono: true },
      { id: 'events', label: bi('time.spec.events'), value: pad2(geo.events.length), mono: true },
      { id: 'movements', label: bi('time.spec.movements'), value: pad2(geo.movements.length), mono: true },
    ],
    [geo, model, reconstructed, modernCounts?.fossilsTotal],
  );
  const controls = useMemo<SceneControls>(() => {
    // Geographic presets only (chapters have the rail, the rule and ← →): world, the whole area, then presets.json.
    const presets = [
      // A regional plate: the first preset is the whole plate (the world is out of reach).
      region
        ? { id: 'world', label: t('time.preset.plate'), title: t('time.preset.plate'), camera: null as GeoCamera | null }
        : { id: 'world', label: t('time.preset.world'), title: t('time.preset.world'), camera: WORLD_CAMERA as GeoCamera | null },
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
          const fitted = id === 'world' ? controllerRef.current?.plateCamera() : controllerRef.current?.fitCamera();
          const camera = preset.camera ?? fitted ?? boundsCamera(model);
          store.getState().applyCameraPreset(camera, { instant });
        },
      },
      modes: {
        items: [
          ...(!reconstructed ? [{ id: 'flow', key: 'f', label: t('time.mode.flow'), on: movementsOn, tone: 'hot' as const, status: 'FLOW' }] : []),
          ...(region || reconstructed ? [] : [{ id: 'borders', key: 'b', label: t('time.mode.borders'), on: bordersOn }]),
          { id: 'graticule', key: 'g', label: t('time.mode.graticule'), on: graticuleOn, phone: false },
          ...(!reconstructed ? [{ id: 'territory', key: 'n', label: t('time.mode.territory'), on: territoryOn }] : []),
          ...(topic.modernInset ? [
            ...topic.modernInset.views.map((v) => ({ id: `inset-${v.id}`, label: v.label, on: inset === v.id })),
            { id: 'inset-visible', label: { en: 'Modern find map', zh: '现代发现地图' }, on: insetVisible },
            { id: 'fossil-all', label: { en: 'Across the Mesozoic (different ages)', zh: '跨中生代（不同年代）' }, on: fossilMode === 'all-mesozoic' },
          ] : []),
          ...(!reconstructed ? [{
            id: 'reference',
            key: 'r',
            label: t('time.mode.reference'),
            on: reference,
            disabled: model.keyframes.length < 2 || presenting,
            tone: 'cold' as const,
            status: 'REFERENCE',
          }] : []),
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
          if (id === 'inset-visible') modernPatch({ insetVisible: on });
          else if (id === 'fossil-all') modernPatch({ fossilMode: on ? 'all-mesozoic' : 'age-window' });
          else if (id.startsWith('inset-') && ['world', 'southeast-asia', 'mexico'].includes(id.slice(6))) modernPatch({ inset: id.slice(6) as TimeSceneExt['inset'] });
          else if (id === 'flow') toggleLayer('movements', on);
          else if (id === 'borders') toggleLayer('borders', on);
          else if (id === 'graticule') setGraticuleOn(on);
          else if (id === 'territory') setTerritoryOn(on);
          else if (id === 'reference') setReferenceMode(on, instant);
          else if (id === 'presentation') {
            if (on) { const st = store.getState(); const i = beatsRef.current.findIndex((b) => b.chapter === st.chapter && b.index === (st.beat ?? 0)); startPresentation(i < 0 ? null : i, instant); }
            else stopPresentation(true);
          }
        },
      },
      // A reconstruction map has no place-name or leader labels of its own (the inset labels its evidence), so no `L`.
      labels: !reconstructed,
      stats: () => {
        const s = readStats();
        return s ?? {};
      },
      specRows,
      status: [statusT],
      time: { now: () => playhead.get() },
      // No participants (a single-country story): no participation card, not an empty frame.
      ...(topic.modernInset ? { card: topic.modernInset.label, cardToggle: { expanded: cardExpanded, set: setCardExpanded } } : geo.entities.length > 0 ? { card: bi('time.card.title'), cardToggle: { expanded: cardExpanded, set: setCardExpanded } } : {}),
      beats: beatControls,
      // `,` / `.` and the reader's beat line: reconstruction topics only, so the dated maps keep their keys.
      ...(reconstructed ? { beatStep: (dir: 1 | -1) => {
        const st = store.getState();
        const i = beatsRef.current.findIndex((b) => b.chapter === st.chapter && b.index === (st.beat ?? 0));
        const next = beatsRef.current[i + dir];
        if (next) applyBeatState(next, false);
      } } : {}),
      urlBaseline: (state) => {
        const st = state as SceneSnapshot<TimeSceneExt>;
        const b = st.beat == null ? undefined : beatsRef.current.find((b) => b.chapter === st.chapter && b.index === st.beat);
        return b ? { ...timeBeatState(store.getState().chapterTarget(b.chapter), b.spec, b.index), beat: null } : null;
      },
      test: {
        selectEvent: (id: string) => selectIndexedEvent(id),
        reader: () => ({
          indexIds: [...((chapters.find((c) => c.id === store.getState().chapter)?.state as TimeChapterState | undefined)?.index ?? [])],
          selectedId: selected ?? selectedEntity,
          detailCount: selected || selectedEntity ? 1 : 0,
        }),
        ...(deepTime ? { geology: () => ({
          reconstruction: controllerRef.current?.reconstructionStats?.() ?? reconstructionStats,
          inset: { coordinateSpace: 'modern', view: inset, insetVisible, fossilMode,
            ...Object.fromEntries(Object.entries(modernCounts ?? {}).filter(([k]) => !['visiblePoints', 'visibleFossils'].includes(k))),
            suppressedCollections: deepTime.inset?.suppression.collections ?? 0, suppressedOccurrences: deepTime.inset?.suppression.occurrences ?? 0,
            highlightedObjectIds: store.getState().highlight, selectedObjectId,
          },
        }) } : {}),
      },
      escape: () => {
        if (isPresenting()) {
          stopPresentation(true);
          return true;
        }
        if (selectedObjectId) { setSelectedObjectId(null); store.getState().patch({ highlight: [] }); return true; }
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
    playhead,
    cardExpanded,
    selected,
    selectedEntity,
    selectIndexedEvent,
    chapters,
    closeEvent,
    closeEntity,
    region, reconstructed, topic.modernInset, inset, insetVisible, fossilMode, modernPatch, deepTime, modernCounts, selectedObjectId, reconstructionStats,
    locale, // `t` is bound to `locale`
  ]);
  useSceneControls(controls);

  const selectedEvent = selected ? geo.events.find((e) => e.id === selected) ?? null : null;
  const pickedEntity = selectedEntity ? geo.entities.find((e) => e.id === selectedEntity) ?? null : null;
  const indexIds = (chapters.find((c) => c.id === currentChapter)?.state as TimeChapterState | undefined)?.index ?? [];

  const geologyProps = deepTime ? {
    bundle: deepTime, locale, selectedMa, stats: reconstructionStats, fossilMode, counts: modernCounts,
    recordSources: ['S65', 'S66'].filter((id) => geo.sources?.sources.some((s) => s.id === id)),
  } : null;

  return (
    <div className="ts-stage" ref={stageRef} data-reference={reference || undefined} data-presenting={presenting || undefined} data-region-plate={region ? '' : undefined} data-reconstruction={reconstructed ? '' : undefined}>
      <GeoStage
        reconstruction={deepTime?.reconstruction}
        onReconstruction={setReconstructionStats}
        store={store}
        playhead={playhead}
        model={model}
        locale={locale}
        onSelectEvent={selectEvent}
        onController={setController}
        onLocalLand={onLocalLand}
        onDatedLayers={setDatedIndexes}
      />

      <div className="ts-stop" role="status" aria-live="polite">
        {reference && <ReferenceBanner model={model} playhead={playhead} locale={locale} />}
      </div>

      {reconstructed && <SceneSlot name="readerTop"><TimeBeatLine chapter={chapters.find((c) => c.id === currentChapter)} beat={activeBeat} locale={locale} onStep={(dir) => controls.beatStep?.(dir)} /></SceneSlot>}
      {deepTime && topic.modernInset && geologyProps && <Suspense fallback={null}>
        <ReconstructionReadout {...geologyProps} />
        {!presenting && !narrowInset && <SceneSlot name="card"><ModernInset bundle={deepTime} config={topic.modernInset} locale={locale} selectedMa={selectedMa} view={inset} insetVisible={insetVisible} fossilMode={fossilMode} fossilsEnabled={layers.includes('fossils-modern')} highlight={highlight} selectedObjectId={selectedObjectId} onSelect={selectModern} onPatch={modernPatch} /></SceneSlot>}
        {!presenting && narrowInset && <SceneSlot name="readerTop"><div className="ts-modern-mobile"><ModernInset embedded bundle={deepTime} config={topic.modernInset} locale={locale} selectedMa={selectedMa} view={inset} insetVisible={insetVisible} fossilMode={fossilMode} fossilsEnabled={layers.includes('fossils-modern')} highlight={highlight} selectedObjectId={selectedObjectId} onSelect={selectModern} onPatch={modernPatch} /></div></SceneSlot>}
        <SceneSlot name="readerEnd"><ModernIndex ids={(chapters.find((c) => c.id === currentChapter)?.state as TimeChapterState)?.index ?? []} bundle={deepTime} locale={locale} onSelect={selectModern} /></SceneSlot>
        {selectedObjectId && modernObjects.has(selectedObjectId) && <SceneSlot name="readerTop"><ModernInspector references={deepTime.references} object={modernObjects.get(selectedObjectId)!} locale={locale} outsideWindow={modernObjects.get(selectedObjectId)?.kind === 'fossil-collection' && !modernCounts?.visiblePoints.some((p) => p.id === selectedObjectId)} showAll={() => modernPatch({ fossilMode: 'all-mesozoic' })} onClose={() => { setSelectedObjectId(null); store.getState().patch({ highlight: [] }); }} /></SceneSlot>}
        {presenting && <ModernEvidence bundle={deepTime} config={topic.modernInset} locale={locale} selectedMa={selectedMa} view={inset} insetVisible={insetVisible} fossilMode={fossilMode} fossilsEnabled={layers.includes('fossils-modern')} highlight={highlight} selectedObjectId={selectedObjectId} onSelect={selectModern} onPatch={modernPatch} />}
        <SceneSlot name="plate"><GeologyPlate {...geologyProps} /></SceneSlot>
      </Suspense>}
      {presentation.element}

      <SceneSlot name="stageOverlay">
        <details className="atlas-overlay-card ts-overlay" data-legend={byEntity ? 'entities' : undefined} open={overlayOpen} onToggle={(e) => setOverlayOpen(e.currentTarget.open)}>
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

      {geo.entities.length > 0 && (
        <SceneSlot name="card">
          <BandCard
            model={model}
            playhead={playhead}
            locale={locale}
            highlight={highlight}
            segments={segments}
            anchor={anchor}
            current={currentSegment}
            expanded={cardExpanded}
            selected={selectedEntity}
            onSelect={selectEntity}
            onExpand={() => setCardExpanded(true)}
          />
        </SceneSlot>
      )}
      <SceneSlot name="perf">
        <PerfReadout read={readStats} />
      </SceneSlot>
      {topic.datedLayers?.some((layer) => layer.count) && (
        <SceneSlot name="plate">
          <DatedLayerPlate definitions={topic.datedLayers} indexes={datedIndexes} layers={layers} playhead={playhead} locale={locale} />
        </SceneSlot>
      )}

      <SceneSlot name="bottomBar">
        <Timeline
          model={model}
          playhead={playhead}
          locale={locale}
          chapters={story}
          segments={segments}
          beatLabel={beatLabel}
          currentChapter={currentChapter}
          highlight={highlight}
          anchor={activeBeat !== null && currentSegment >= 0 ? { segment: currentSegment, tick: activeBeat } : anchor}
          state={deepTime ? <ReconstructionState selectedMa={selectedMa} stats={reconstructionStats} locale={locale} /> : undefined}
          onScrub={scrub}
          onScrubStart={scrubStart}
          onNudge={nudge}
          onChapter={goToChapterFromBar}
          onBeat={goToBeatFromBar}
        />
      </SceneSlot>

      <SceneSlot name="readerEnd">
        <ChapterIndex ids={indexIds} events={geo.events} selected={selected} locale={locale} disabled={presenting} onSelect={selectIndexedEvent} />
      </SceneSlot>

      {selectedEvent && (
        <SceneSlot name="readerTop">
          <EventInspector event={selectedEvent} model={model} locale={locale} onClose={closeEvent} />
        </SceneSlot>
      )}
      {pickedEntity && (
        <SceneSlot name="readerTop">
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
    const date = formatTime(k.keyframe.t, locale, model.datePrecision, model.mixedEra);
    return `K${i + 1} ${locale === 'en' ? date.toLocaleUpperCase('en') : date}`;
  };
  return (
    <div className="ts-stop__card ts-ref">
      <span className="ts-stop__eyebrow">{tr('time.reference.banner', { current: name(pair.current), other: name(pair.other) })}</span>
    </div>
  );
}

/** Index of the keyframe the map shows most strongly at `t` (the incoming one past half the crossfade); 0 before the first. */
function dominantKeyframe(model: TimeModel, t: number): number {
  const w = keyframeWindow(model.keyframes, t, (k) => k.t);
  return w.nextIndex >= 0 && w.blend >= 0.5 ? w.nextIndex : Math.max(0, w.prevIndex);
}

/** The caption card's date: the playhead as the timeline reads it. */
function BeatReadout({ model, playhead, locale }: { model: TimeModel; playhead: Playhead; locale: EngineViewProps['locale'] }) {
  const now = useSyncExternalStore(playhead.subscribe, playhead.get, playhead.get);
  return formatReadout(now, model, locale);
}

/** Same manual beat navigation as the chapter axis, available on narrow screens. */
function TimeBeatLine({ chapter, beat, locale, onStep }: { chapter: EngineViewProps['chapters'][number] | undefined; beat: number | null; locale: EngineViewProps['locale']; onStep(dir: 1 | -1): void }) {
  const ref = useRef<HTMLDivElement>(null);
  const beats = (chapter?.state as TimeChapterState | undefined)?.beats ?? [];
  useEffect(() => { ref.current?.closest('.atlas-panel__scroll')?.scrollTo({ top: 0 }); }, [chapter?.id, beat]);
  if (!beats.length) return null;
  return <div ref={ref} className="ts-beatline"><p><b>{locale === 'zh' ? '节拍' : 'BEAT'} {beat === null ? '—' : beat + 1}/{beats.length}</b> {beat !== null && beats[beat] && tx(beats[beat]!.caption, locale)}</p><span><button type="button" onClick={() => onStep(-1)} aria-label={locale === 'zh' ? '上一拍' : 'Previous beat'}>‹</button><button type="button" onClick={() => onStep(1)} aria-label={locale === 'zh' ? '下一拍' : 'Next beat'}>›</button></span></div>;
}

/** A reconstruction topic's bar readout (docs/47 E-DE1): the selected age against the map sample actually drawn. */
function ReconstructionState({ selectedMa, stats, locale }: { selectedMa: number; stats: ReconstructionStats | null; locale: EngineViewProps['locale'] }) {
  const zh = locale === 'zh';
  const sample = stats?.status === 'ready' ? `${stats.frameMa} Ma · Δ ${stats.deltaMa} Ma` : stats?.status === 'unavailable' ? (zh ? '不可用' : 'UNAVAILABLE') : (zh ? '加载中' : 'LOADING');
  return (
    <p className="ts-state" data-reconstruction-state="" role="status">
      <span data-stat="selected">{zh ? '所选' : 'SELECTED'} {selectedMa} Ma</span>
      <span data-stat="sample"><i aria-hidden="true">·</i>{zh ? '地图样本' : 'MAP SAMPLE'} {sample}</span>
    </p>
  );
}
