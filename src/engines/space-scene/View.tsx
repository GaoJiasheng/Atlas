import { microscopeIndexBeat } from './lib/microscope-index';
/**
 * SpaceScene view: Model3DStage (react-three-fiber, lazy-loaded so the HUD
 * appears before three.js arrives) + the technical-plate HUD content in the
 * host's slots (docs/08 §2–§3): VIEW presets (ORBIT, REFERENCE, then the
 * named presets of parts.json; chapters are the top bar's number chips),
 * mode switches (X / E / C / F / R / P, buttons in the overlay's control
 * panel, the explode slider under them while EXPLODED), part-chain card,
 * two-column leader labels, the chapter axis at the bottom (`bottomBar`), the
 * left column's PLATE block (`plate`: elevation, state rows, selection, perf),
 * and the reading panel's beat line + inspector (`readerTop`) and chapter
 * index (`readerEnd`).
 *
 * BEATS OUTSIDE THE PRESENTATION (docs/08 §2 HUD 铁律 a): the chapter axis
 * (core/axis) has a segment per chapter and a tick per beat. A tick, `,` /
 * `.`, or the beat line's ‹ › apply that beat exactly as the presentation
 * does (camera flight, layers, ghost, tints, labels, pose, cut, exercise,
 * sites, run) without entering it: no caption card, the HUD stays, the
 * caption is the reading panel's beat line. A chapter picked by the reader
 * (segment, chips, rail, ← →) opens on its first beat once the chapter
 * transition is out; instant chapter changes (tests, shots) show the
 * chapter's own state (`beat: null`). The store's `beat` is in the URL (`b`,
 * 1-based); a deep link with `b` opens on the beat as the axis shows it (its
 * try-it values, view, layers, camera, hide …, runs at their end), the fields
 * the link sets itself winning; at a beat the URL's baseline is the beat's
 * scene. After the flight the reader may orbit; selecting a part keeps the
 * beat. P starts at the beat on show.
 *
 * PRESENTATION (P) runs on the core presentation system (core/presentation).
 * SpaceScene's adapter: a beat is its chapter's target plus the beat's view /
 * part / explode / run / cutaway / layers / hide / pose / ghost and its camera (an orbit
 * camera, a named preset's camera, else the chapter's), applied with the
 * store's `applyState` (camera tween 1.4 s); the beat has settled when the
 * stage reports the camera move done (and the explode / put-aside motion has
 * had its time). Entering leaves ORBIT and REFERENCE and drops the selection;
 * the leader labels show the beat's `labels` only (≤ 6) with the HUD hidden.
 * Once a beat has settled the reader may orbit and zoom (core lifts its
 * input layer); clicks on the model select nothing while presenting (the
 * beat's part stays), and the next beat flies from where the camera was left.
 * EXPLODED and FLOW do not combine (docs/12 §7.5): F is disabled while
 * exploded and the stage draws no particles. With the HUD hidden outside the
 * presentation the stage frames the cover camera (`views.cover`, else the
 * model re-fitted to the stage) and goes back when the HUD returns.
 */
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useStore } from 'zustand';
import type { Chapter, EngineViewProps, OrbitCamera, SceneSnapshot } from '../core/types';
import { SceneSlot, useHud, useScene, useSceneContext, useSceneControls, useSceneStore, useT } from '../core/context';
import { chapterNumbers, isBackground } from '../core/chapters';
import { ChapterAxis, type AxisChapter } from '../core/axis/ChapterAxis';
import { axisCounter, flatIndex, stepBeat } from '../core/axis/axis';
import type { SceneControls, SceneMode, ScenePreset, SceneStats } from '../core/controls';
import { isOrbitCamera, normalizeCamera } from '../core/camera';
import { usePresentation, type Beat, type SpaceBeatSpec, type SpacePresentationAdapter, type SpaceSavedState } from '../core/presentation';
import { t as tl, tx, type BilingualText, type UiKey } from '../../i18n';
import { DEFAULT_CAMERA, REFERENCE_TWEEN_MS, referenceCamera, roundCamera } from './lib/camera';
import { modelBounds } from './lib/parts';
import { POSE_DURATION } from './lib/pose';
import { targetExplodeAmount } from './lib/explode';
import type { SpaceSceneExt } from './index';
import { beatBaseline, beatScene as sceneOfBeat, linkedBeatPatch } from './lib/beat-scene';
import type { SpaceChapterState, SpaceSceneData, SpaceView, ViewPresets } from './schema';
import { createSpaceUi } from './ui';
import { cameraSettled, createBridge, stageReady } from './bridge';
import { DEFAULT_EXPLODE } from './explorer/ExplorerBar';
import { ExplorerOverlay } from './explorer/ExplorerOverlay';
import { Inspector } from './explorer/Inspector';
import { BeatLine } from './explorer/BeatLine';
import { ChapterIndex } from './explorer/ChapterIndex';
import { PlateBlock } from './hud/PlateBlock';
import { spaceSpecRows } from './hud/spec';
import { partNumber } from './hud/common';
import { applyNamedCameraPreset } from './lib/camera-preset';
import { LeaderLabels } from './hud/LeaderLabels';
import { setSim } from './hud/sim';
import { replay } from './lib/sim/replay-ui';
import { cardTimelines } from './lib/sim/replay';
import { resolveSimValues, stepValue } from './lib/sim/controls';
import { trialContextPatch } from './lib/sim/session';
import { displayOnlyControls } from './lib/sim/trial';
import type { SimTry } from './sim-schema';
import { SIM_KEYS } from '../core/controls';
import type { OrbitSession } from './lib/sim/orbit-session';
import { readSim } from './lib/sim/runtime';
import { readOrbitRuntime } from './lib/sim/orbit-resource';
import './space-scene.css';

const MicroscopeCard = lazy(() => import('./hud/MicroscopeField').then(m => ({ default: m.MicroscopeCard })));
const PartChainCard = lazy(() => import('./hud/PartChainCard').then(m => ({ default: m.PartChainCard })));
const SitesOverlay = lazy(() => import('./hud/SitesOverlay').then(m => ({ default: m.SitesOverlay })));
const CircuitCard = lazy(() => import('./hud/CircuitCard').then(m => ({ default: m.CircuitCard })));
const EnergyCard = lazy(() => import('./hud/EnergyCard').then(m => ({ default: m.EnergyCard })));
const CycleCard = lazy(() => import('./hud/CycleCard').then(m => ({ default: m.CycleCard })));
const FoodWebCard = lazy(() => import('./hud/FoodWebCard').then(m => ({ default: m.FoodWebCard })));
const KeyCard = lazy(() => import('./hud/KeyCard').then(m => ({ default: m.KeyCard })));
const EnergyBarLabels = lazy(() => import('./hud/EnergyBarLabels').then(m => ({ default: m.EnergyBarLabels })));
const GroupScaleBars = lazy(() => import('./hud/GroupScaleBars').then(m => ({ default: m.GroupScaleBars })));
const InsetFrames = lazy(() => import('./hud/InsetFrames').then(m => ({ default: m.InsetFrames })));
const SensesStageLabel = lazy(() => import('./hud/SensesStageLabel').then(m => ({ default: m.SensesStageLabel })));
const AirfoilDriver = lazy(() => import('./explorer/AirfoilDriver').then(m => ({ default: m.AirfoilDriver })));
const TryIt = lazy(() => import('./explorer/TryIt').then(m => ({ default: m.TryIt })));
const OrbitCard = lazy(() => import('./hud/OrbitCard').then(m => ({ default: m.OrbitCard })));
const Model3DStage = lazy(() => import('./stages/model3d/Model3DStage'));

function StageLoading({ label }: { label: string }) {
  return (
    <div className="atlas-stage__placeholder" role="status">
      <span className="atlas-stage__spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

/** HUD titles show English with the Chinese beneath, whatever the page locale. */
const both = (key: UiKey): BilingualText => ({ en: tl('en', key), zh: tl('zh', key) });

const ORBIT_PRESET = 'orbit';
const REFERENCE_PRESET = 'reference';
/** A beat's camera move (docs/12 §8 G1: ~1.4 s). */
const BEAT_TWEEN_MS = 1400;
/** How long the stage's explode (SceneRoot) and put-aside (PartNode) motions take: a beat settles after them. */
const EXPLODE_MS = 2000;
const HIDE_MS = 600;
/** A beat counts as settled after this even if the stage never reports (still loading). */
const SETTLE_TIMEOUT_MS = 4000;

const sameIds = (a: readonly string[], b: readonly string[]) => a.length === b.length && a.every((id) => b.includes(id));
const wait = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));
const asOrbit = (cam: unknown): OrbitCamera | null => {
  const n = normalizeCamera(cam);
  return n && isOrbitCamera(n) ? n : null;
};

/** A chapter's camera as the stage frames it on arrival: its own camera, else the view preset (`view`), else the inherited one. */
function chapterCamera(chapter: Chapter | undefined, inherited: unknown, view: SpaceView, views: ViewPresets): OrbitCamera {
  return asOrbit(chapter?.state.camera) ?? views[view]?.camera ?? asOrbit(inherited) ?? DEFAULT_CAMERA;
}

/** The three bodies as the orbit snapshot shows them now (REFERENCE frames them, not the parts' authored geometry). */
function orbitBodyBounds({ display: d }: OrbitSession): { min: [number, number, number]; max: [number, number, number] } {
  const ids = ['sun', 'earth', 'moon'] as const;
  const axis = (f: (id: (typeof ids)[number], j: number) => number, pick: (...v: number[]) => number) =>
    [0, 1, 2].map((j) => pick(...ids.map((id) => f(id, j)))) as [number, number, number];
  return { min: axis((id, j) => d.centres[id][j]! - d.radii[id], Math.min), max: axis((id, j) => d.centres[id][j]! + d.radii[id], Math.max) };
}

type Pick5 = Pick<SpaceSceneExt, 'view' | 'explode' | 'run' | 'cutaway' | 'part' | 'beat' | 'sim'> & { chapter: string | null };

const sameJson = (a: unknown, b: unknown) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
const ownBeats = (c: Chapter | undefined): readonly SpaceBeatSpec[] => (c?.state as SpaceChapterState | undefined)?.beats ?? [];
let tableIndexModule: Promise<typeof import('./lib/table-index')> | null = null;
const loadTableIndex = () => (tableIndexModule ??= import('./lib/table-index'));

function SpaceSceneView({ data, chapters, locale, orbitRuntime, testHooks }: EngineViewProps & { orbitRuntime: typeof import('./lib/sim/orbit-session') | null; testHooks?: typeof import('./test-hooks').createSpaceTestHooks }) {
  const file = (data as SpaceSceneData).parts;
  const store = useSceneStore<SpaceSceneExt>();
  // Orbit sims (docs/44 E-SEM1): one clock + physical snapshot per scene, shared by the stage, the HUD and the test API.
  const solarSnapshots = file.sim?.kind === 'solar-system';
  useEffect(()=>{if(!solarSnapshots)return;const stop=()=>{if(store.getState().run)store.getState().patch({run:false});};stop();return store.subscribe(stop);},[solarSnapshots,store]);
  const orbitSession = useMemo(() => (file.sim?.orbitRotation ? orbitRuntime!.getOrbitSession(store, file.sim) : null), [store, file.sim]);
  useEffect(() => {
    if (orbitSession) store.getState().patch({ run: false });
    return () => orbitSession?.dispose();
  }, [orbitSession, store]);
  const { hud, actions } = useSceneContext();
  const t = useT();
  const [ui] = useState(createSpaceUi);
  const [bridge] = useState(createBridge);
  const reference = useStore(ui, (u) => u.reference);

  const s = useScene<SpaceSceneExt, Pick5>((st) => ({
    view: st.view,
    explode: st.explode,
    run: st.run,
    cutaway: st.cutaway,
    part: st.part,
    chapter: st.chapter,
    beat: st.beat,
    sim: st.sim,
  }));

  const tableSim = file.sim?.kind === 'table';
  useEffect(() => {
    if (!tableSim) return;
    const id = window.setTimeout(() => void loadTableIndex(), 0);
    return () => window.clearTimeout(id);
  }, [tableSim]);

  const microscopeOn = file.sim?.microscope && resolveSimValues(file.sim, s.sim)[file.sim.microscope.controls.enabled] === true;
  useEffect(() => {
    if (microscopeOn && (s.view !== 'assembled' || s.cutaway !== 'none' || s.explode !== 0)) store.getState().patch({ view: 'assembled', explode: 0, cutaway: 'none' });
  }, [microscopeOn, s.view, s.cutaway, s.explode, store]);

  const bounds = useMemo(() => modelBounds(file.parts), [file.parts]);
  const plane = file.views.section?.plane ?? 'xy';

  /* REFERENCE: straight long-lens elevation, run off, no explode; R again restores. */
  const enterReference = useCallback(
    (instant: boolean) => {
      if (ui.getState().reference) return;
      const st = store.getState();
      const h = hud.getState();
      // The camera as authored (this stage's aspect pull-back and HUD framing undone): exiting re-applies them.
      const live = bridge.viewCamera();
      const stored = normalizeCamera(st.camera);
      ui.setState({
        orbit: false,
        reference: {
          camera: live ?? (stored && isOrbitCamera(stored) ? stored : null),
          view: st.view,
          explode: st.explode,
          run: st.run,
          presetId: h.presetId,
          cameraFree: h.cameraFree,
        },
        nextTweenMs: REFERENCE_TWEEN_MS,
      });
      st.patch({ run: false, view: st.view === 'exploded' ? 'assembled' : st.view });
      const aspect = bridge.width > 0 && bridge.height > 0 ? bridge.width / bridge.height : 1.5;
      const orbitBounds = orbitSession ? orbitBodyBounds(orbitSession) : null;
      const referenceBounds = orbitBounds ?? (file.views.reference?.fit === 'layers'
        ? modelBounds(file.parts.filter((p) => !p.context && (p.group === undefined || st.layers.includes(p.group)) && !st.hidden.includes(p.id))) ?? bounds
        : bounds);
      const cam: OrbitCamera = file.views.reference?.camera ?? (referenceBounds ? referenceCamera(referenceBounds, plane, aspect) : DEFAULT_CAMERA);
      st.applyCameraPreset(cam, { instant });
      hud.setState({ presetId: REFERENCE_PRESET, cameraFree: false });
    },
    [ui, store, hud, bridge, file.parts, file.views.reference, bounds, plane],
  );

  const exitReference = useCallback(
    (restoreCamera: boolean, instant = false) => {
      const save = ui.getState().reference;
      if (!save) return;
      ui.setState({ reference: null, nextTweenMs: restoreCamera ? REFERENCE_TWEEN_MS : null });
      const st = store.getState();
      st.patch({ view: save.view, explode: save.explode, run: save.run });
      if (restoreCamera && save.camera) {
        st.applyCameraPreset(save.camera, { instant });
        hud.setState({ presetId: save.presetId, cameraFree: save.cameraFree });
      }
    },
    [ui, store, hud],
  );

  /* ---------- PRESENTATION (P): the core presentation over this stage ---------- */
  const named = useMemo(() => file.presets ?? [], [file.presets]);
  /** The scene on entering (before ORBIT / REFERENCE / the selection were dropped). */
  const entered = useRef<SpaceSavedState | null>(null);
  const enteredMechanisms = useRef<ReturnType<typeof bridge.saveMechanisms>>({});
  /**
   * Put the stage in a beat's state (lib/beat-scene.ts): its chapter's target
   * plus the beat's fields and camera. The presentation's `applyBeat`, the
   * chapter axis and a deep link with `b` share it; so does the URL baseline.
   */
  const beatScene = (b: Beat<SpaceBeatSpec>) => {
    const target = store.getState().chapterTarget(b.chapter);
    const chapter = chapters.find((c) => c.id === b.chapter);
    return sceneOfBeat(b, target, named, (view) => chapterCamera(chapter, target.camera, view, file.views));
  };
  const applyBeatState = (b: Beat<SpaceBeatSpec>, instant: boolean): Promise<void> | undefined => {
    const st = store.getState();
    const before = st.snapshot();
    bridge.resetMechanisms();
    ui.setState({ orbit: false, nextTweenMs: instant ? null : BEAT_TWEEN_MS, beatCamera: b.spec?.camera !== undefined ? 'authored' : 'auto' });
    st.applyState(beatScene(b), { instant });
    if (instant) return;
    const id = store.getState().transition.id;
    const after = store.getState();
    const poseMs =
      before.pose === after.pose && before.exercise?.id === after.exercise?.id && before.exercise?.phase === after.exercise?.phase
        ? 0
        : ((after.pose ? file.poses?.[after.pose]?.duration : undefined) ?? POSE_DURATION) * 1000;
    const motion = Math.max(
      poseMs,
      targetExplodeAmount(before.view, before.explode) !== targetExplodeAmount(after.view, after.explode)
        ? EXPLODE_MS
        : sameIds(before.hidden, after.hidden)
          ? 0
          : HIDE_MS,
    );
    return Promise.all([cameraSettled(bridge, id, SETTLE_TIMEOUT_MS), wait(motion)]).then(() => undefined);
  };
  const presentationAdapter: SpacePresentationAdapter = {
    beatsOf: (c) => (c.state as SpaceChapterState).beats,
    captionOf: (b, l) => tx(b.caption, l),
    applyBeat: (b, { instant }) => applyBeatState(b, instant),
    onEnter: () => {
      enteredMechanisms.current = bridge.saveMechanisms();
      const st = store.getState();
      const snap = st.snapshot();
      const u = ui.getState();
      const h = hud.getState();
      const ref = u.reference;
      const live = bridge.viewCamera();
      entered.current = {
        chapter: snap.chapter,
        layers: [...snap.layers],
        camera: ref ? ref.camera : live ? { ...roundCamera(live), fov: live.fov } : asOrbit(snap.camera),
        view: ref ? ref.view : snap.view,
        part: snap.part,
        explode: ref ? ref.explode : snap.explode,
        run: ref ? ref.run : snap.run,
        cutaway: snap.cutaway,
        hidden: [...snap.hidden],
        pose: snap.pose,
        ghosted: [...snap.ghosted],
        exercise: snap.exercise,
        tints: snap.tints,
        sites: [...snap.sites],
        beat: snap.beat,
        sim: { ...snap.sim },
        sensesFrame: snap.sensesFrame,
        orbitTime: orbitSession?.clock.elapsedSeconds,
        orbit: u.orbit,
        presetId: ref ? ref.presetId : h.presetId,
        cameraFree: ref ? ref.cameraFree : h.cameraFree,
      };
      // Leave REFERENCE without flying back (the first beat moves the camera), stop ORBIT, drop the selection.
      ui.setState({ reference: null, orbit: false, presenting: true });
      if (snap.part !== null) st.patch({ part: null });
    },
    saveState: () => entered.current!,
    restoreState: (saved) => {
      ui.setState({ presenting: false, orbit: saved.orbit });
      const { chapter, layers, camera, view, part, explode, run, cutaway, hidden, pose, ghosted, exercise, tints, sites, beat, sim, sensesFrame, orbitTime } = saved;
      store
        .getState()
        .applyState({ chapter, layers, camera, view, part, explode, run, cutaway, hidden, pose, ghosted, exercise, tints, sites, beat, sim, sensesFrame, ...(orbitSession ? { orbitTime: orbitTime ?? null } : {}), demo: null }, { instant: false });
      bridge.restoreMechanisms(enteredMechanisms.current);
      hud.setState({ presetId: saved.presetId, cameraFree: saved.cameraFree });
    },
  };
  const presentation = usePresentation(presentationAdapter);
  const { presenting, isPresenting, status: presentationStatus, controls: beatControls, start: startPresentation, stop: stopPresentation } = presentation;
  const beatsRef = useRef(presentation.beats);
  beatsRef.current = presentation.beats;

  /* ---------- BEATS OUTSIDE THE PRESENTATION: chapter axis, `,` / `.`, the beat line ---------- */
  /** Apply a beat with the HUD on (no caption card): leave REFERENCE, then the beat's scene; its camera is authored, not free. */
  const showBeat = useCallback(
    (b: Beat<SpaceBeatSpec>) => {
      exitReference(false);
      applyBeatState(b, false);
      hud.setState({ presetId: typeof b.spec?.camera === 'string' ? b.spec.camera : null, cameraFree: false });
    },
    // `applyBeatState` reads the stores, refs and data only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [exitReference, hud],
  );
  const goToBeat = useCallback(
    (chapter: string, index: number) => {
      const b = beatsRef.current.find((x) => x.chapter === chapter && x.index === index);
      if (b) showBeat(b);
    },
    [showBeat],
  );
  const selectIndexedPart = useCallback((id: string) => {
    const st = store.getState(), state = chapters.find(c => c.id === st.chapter)?.state as SpaceChapterState | undefined;
    if (file.sim?.kind === 'table') {
      // The table index evaluates the simulation, so it stays out of the first frame (prefetched after
      // mount). The tap selects at once; the beat that shows the part follows when the module is in.
      store.getState().patch({ part: id });
      void loadTableIndex().then(({ tableIndexBeat }) => {
        const now = store.getState();
        if (now.chapter !== st.chapter || now.part !== id) return;
        const beat = tableIndexBeat(state, file, id);
        if (st.chapter && beat !== null) {
          goToBeat(st.chapter, beat);
          store.getState().patch({ part: id });
        }
      });
      return;
    }
    const beat = microscopeIndexBeat(state, file, id);
    if (st.chapter && beat !== null) goToBeat(st.chapter, beat);
    store.getState().patch({ part: id });
  }, [store, chapters, file, goToBeat]);
  /** `,` / `.` and the beat line's ‹ ›: one beat back / on, across chapters; in the presentation, its own step. */
  const beatStep = useCallback(
    (direction: 1 | -1) => {
      const beats = beatsRef.current;
      if (isPresenting()) {
        const cur = beatControls.current();
        const i = cur ? flatIndex(beats, cur.chapter, cur.beat) + direction : -1;
        if (i >= 0 && i < beats.length) beatControls.go(i, { instant: false });
        return;
      }
      const st = store.getState();
      const i = stepBeat(beats, st.chapter, st.beat, ownBeats(chapters.find((c) => c.id === st.chapter)).length > 0, direction);
      if (i !== null) showBeat(beats[i]!);
    },
    [store, chapters, isPresenting, beatControls, showBeat],
  );
  // A chapter picked by the reader (axis segment, chips, rail, ← →) opens on its first beat, once that transition is out.
  // A deep link with `b` opens on the beat as the chapter axis shows it (try-it values, view, layers, camera, hide …,
  // timelines at their end: the step is instant); a field the link sets itself (`sim=`, `cam=`, `view=` …) wins.
  const urlBeatDone = useRef(false);
  useEffect(() => {
    const settleUrlBeat = () => {
      const st = store.getState();
      if (urlBeatDone.current || st.transition.reason !== 'url') return;
      urlBeatDone.current = true;
      if (st.beat === null) return;
      const b = beatsRef.current.find((x) => x.chapter === st.chapter && x.index === st.beat);
      if (!b) {
        st.patch({ beat: null });
        return;
      }
      const next = beatScene(b);
      const linked = st.transition.fields ?? [];
      st.applyState(linkedBeatPatch(next, linked), { instant: true });
      ui.setState({ orbit: false });
      const ownCamera = !linked.includes('camera');
      hud.setState({
        presetId: ownCamera && typeof b.spec?.camera === 'string' ? b.spec.camera : null,
        cameraFree: !sameJson(store.getState().camera, next.camera),
      });
    };
    settleUrlBeat();
    return store.subscribe((st, prev) => {
      if (st.transition.id === prev.transition.id) return;
      const { reason, instant, id } = st.transition;
      if (reason === 'url') {
        queueMicrotask(settleUrlBeat);
        return;
      }
      if (reason !== 'chapter' || instant || isPresenting()) return;
      const chapter = st.chapter;
      if (ownBeats(chapters.find((c) => c.id === chapter)).length === 0) return;
      queueMicrotask(() => {
        if (store.getState().transition.id !== id || isPresenting()) return;
        const first = beatsRef.current.find((b) => b.chapter === chapter && b.index === 0);
        if (first) showBeat(first);
      });
    });
    // `beatScene` reads the stores, refs and data only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store, ui, hud, chapters, isPresenting, showBeat]);

  // Free look in the presentation: a click on a part or on empty space must not change the beat's selection.
  useEffect(() => {
    let reverting = false;
    return store.subscribe((s, prev) => {
      if (reverting || !isPresenting() || s.part === prev.part || s.transition.id !== prev.transition.id) return;
      reverting = true;
      store.getState().patch({ part: prev.part });
      reverting = false;
    });
  }, [store, isPresenting]);

  // Reconcile every control route, including keyboard, deep links, beat changes and test API.
  useEffect(() => {
    const reconcile = (st: ReturnType<typeof store.getState>, prev?: ReturnType<typeof store.getState>) => {
      const sim = file.sim;
      if (!sim || !st.chapter) return;
      if (prev && st.sim === prev.sim && st.chapter === prev.chapter && st.transition.id === prev.transition.id) return;
      const state = chapters.find((c) => c.id === st.chapter)?.state as SpaceChapterState | undefined;
      const transition = prev !== undefined && st.transition.id !== prev.transition.id;
      const reset = transition && ['chapter', 'state', 'url'].includes(st.transition.reason);
      const patch = trialContextPatch(ui.getState(), st.chapter, resolveSimValues(sim, st.sim), state?.sim?.try?.vary, reset, displayOnlyControls(sim));
      if (Object.keys(patch).length > 0) ui.setState(patch);
    };
    reconcile(store.getState());
    return store.subscribe(reconcile);
  }, [store, ui, file, chapters]);

  /* ---------- TRY IT: `[` `]` step the varied control, `T` flips the card's first switch ---------- */
  const simCard = useScene<SpaceSceneExt, SimTry | null>((st) => {
    const state = chapters.find((c) => c.id === st.chapter)?.state as SpaceChapterState | undefined;
    return state?.sim?.try ?? null;
  });
  const simCommands = useMemo(() => {
    const sim = file.sim;
    if (!sim || !simCard) return [];
    const ctl = (id: string) => sim.controls.find((c) => c.id === id);
    const vary = ctl(simCard.vary);
    const toggle = [simCard.vary, ...(simCard.also ?? [])].map(ctl).find((c) => c?.kind === 'toggle');
    const now = () => resolveSimValues(sim, store.getState().sim);
    const step = (dir: 1 | -1) => () => {
      if (vary) setSim(store, sim, vary.id, stepValue(vary, now()[vary.id]!, dir));
    };
    return [
      { id: 'sim-prev', key: SIM_KEYS.prev, label: t('space.try.prev'), disabled: !vary, run: step(-1) },
      { id: 'sim-next', key: SIM_KEYS.next, label: t('space.try.next'), disabled: !vary, run: step(1) },
      {
        id: 'sim-toggle',
        key: SIM_KEYS.toggle,
        label: toggle ? tx(toggle.label, locale) : t('space.try.title'),
        disabled: !toggle,
        run: () => {
          if (toggle) setSim(store, sim, toggle.id, !(now()[toggle.id] === true));
        },
      },
      // `G`: run the card's timelines again (the button writes the same count).
      ...(simCard.replay
        ? [{ id: 'sim-replay', key: SIM_KEYS.replay, label: t('space.try.replay'), run: () => replay(ui, cardTimelines(sim, now(), simCard)) }]
        : []),
    ];
  }, [file.sim, simCard, store, ui, t, locale]);

  // HUD hidden (H, hero shots) outside the presentation: the stage frames the cover camera.
  const hudOn = useHud((h) => h.hud);
  useEffect(() => {
    ui.setState({ cover: !hudOn && !presenting });
  }, [ui, hudOn, presenting]);

  const controls = useMemo<SceneControls>(() => {
    // Chapters are reached through the top bar's number chips, the rail and ← →; the VIEW group holds model views only.
    const presets: ScenePreset[] = [
      { id: ORBIT_PRESET, label: t('space.preset.orbit'), title: t('space.preset.orbitTitle') },
      { id: REFERENCE_PRESET, label: t('space.preset.reference'), title: t('space.preset.referenceTitle') },
      ...named.map((p) => ({ id: p.id, label: p.label, title: p.label })),
    ];
    const set = (patch: Partial<SpaceSceneExt>) => store.getState().patch(patch);
    const inReference = reference !== null;
    const exploded = s.view === 'exploded';
    const pct = Math.round(s.explode * 100);
    // A named cut says its name in the status line (`CUTAWAY SAGITTAL`); the default plane, its half.
    const cutName = s.cutaway !== 'none' && s.cutaway !== 'half' ? s.cutaway : null;
    const cutStatus = `${t('space.mode.cutaway')} ${cutName ? tx(file.views.cuts?.[cutName]?.label ?? { en: cutName, zh: cutName }, 'en') : '50'}`;
    const modes: SceneMode[] = [
      { id: 'xray', key: 'x', label: t('space.mode.xray'), disabled: !!orbitSession || !!microscopeOn, on: s.view === 'xray', tone: 'xray' },
      {
        id: 'exploded',
        key: 'e',
        // A topic may name it (PEEL / 剥层 for staged muscle layers).
        label: file.views.explodeLabel ? tx(file.views.explodeLabel, locale) : t('space.mode.exploded'),
        on: s.view === 'exploded',
        disabled: inReference || !!orbitSession || !!microscopeOn,
        status: `${file.views.explodeLabel ? tx(file.views.explodeLabel, 'en').toUpperCase() : t('space.state.explode')} ${pct}`,
      },
      { id: 'cutaway', key: 'c', label: t('space.mode.cutaway'), disabled: !!orbitSession || !!microscopeOn, on: s.cutaway !== 'none', tone: 'cut', status: cutStatus },
      // Flow paths do not follow the parts apart (docs/12 §7.5): no FLOW while exploded.
      { id: 'flow', key: 'f', label: t('space.mode.flow'), on: s.run, tone: 'hot', disabled: solarSnapshots || inReference || exploded || (!!orbitSession && orbitRuntime!.orbitIsStill(orbitSession)) },
      { id: 'reference', key: 'r', label: t('space.mode.reference'), on: inReference, tone: 'ink', disabled: presenting, phone: false },
      { id: 'presentation', key: 'p', label: t('present.mode'), on: presenting, tone: 'signal', status: presentationStatus, phone: false },
    ];
    const picked = s.part ? file.parts.find((p) => p.id === s.part && !p.context) : undefined;
    // A paired part says its side: `#05 HIND FEMUR · L`.
    const side = picked?.side ? ` · ${picked.side === 'left' ? 'L' : 'R'}` : '';
    const status = [
      ...(picked ? [`#${partNumber(file, picked.id)} ${tx(picked.name, 'en').toUpperCase()}${side}`] : []),
      ...(inReference ? [t('space.status.locked').toLocaleUpperCase()] : []),
      ...(exploded && !inReference && file.flows.length > 0 ? [t('space.status.flowLocked').toLocaleUpperCase()] : []),
    ];
    return {
      // Ready once the lazy stage content is drawn and the camera stands where the measured HUD puts it (docs/67 §9).
      ready: () => stageReady(bridge) && bridge.hudSettled === true,
      presets: {
        items: presets,
        set: (id, { instant }) => {
          if (id === REFERENCE_PRESET) {
            enterReference(instant);
            return;
          }
          exitReference(false);
          if (id === ORBIT_PRESET) {
            ui.setState({ orbit: true });
            return;
          }
          ui.setState({ orbit: false });
          const own = named.find((p) => p.id === id);
          if (own) applyNamedCameraPreset(store, own, file.parts, { instant });
        },
      },
      modes: {
        items: modes,
        set: (id, on, { instant }) => {
          if (id === 'xray') set({ view: on ? 'xray' : 'assembled' });
          else if (id === 'exploded')
            set(on ? { view: 'exploded', explode: s.explode < 0.05 ? DEFAULT_EXPLODE : s.explode } : { view: 'assembled' });
          else if (id === 'cutaway') set({ cutaway: on ? 'half' : 'none' });
          else if (id === 'flow') set({ run: on });
          else if (id === 'reference') {
            if (on) enterReference(instant);
            else exitReference(true, instant);
          } else if (id === 'presentation') {
            if (on) {
              // Start at the beat on show (the chapter's first when it shows its own state).
              const st = store.getState();
              const i = flatIndex(beatsRef.current, st.chapter, st.beat);
              startPresentation(i >= 0 ? i : null, instant);
            }
            else stopPresentation(true);
          }
        },
      },
      labels: true,
      pause: {
        paused: !s.run,
        set: (paused) => {
          if (!solarSnapshots && !ui.getState().reference && !(orbitSession && orbitRuntime!.orbitIsStill(orbitSession))) set({ run: !paused });
        },
      },
      stats: () => {
        const st = bridge.stats;
        const live = bridge.liveCamera();
        const out: Partial<SceneStats> & { geometries: number; textures: number; shadowMapUpdates: number; camera?: OrbitCamera; footSlip?: number } = {
          calls: st.calls,
          triangles: st.triangles,
          geometries: st.geometries,
          textures: st.textures,
          shadowMapUpdates: st.shadowMapUpdates,
          fps: st.fps === undefined ? undefined : Math.round(st.fps * 10) / 10,
          gpu: st.gpu,
          lastFrame: st.lastFrame,
          // The live camera (tests: where the stage really is, not the stored target).
          ...(live ? { camera: { ...roundCamera(live), fov: Math.round((live.fov ?? 0) * 100) / 100 } } : {}),
          // A standing exercise: how far the planted feet still slide (cm).
          ...(bridge.footSlip !== null ? { footSlip: Math.round(bridge.footSlip * 1000) / 10 } : {}),
        };
        return out;
      },
      specRows: spaceSpecRows(file),
      status,
      card: file.sim?.foodWeb ? { en: 'Food web', zh: '食物网' } : orbitSession ? both('space.card.orbit') : file.sim?.sort ? both('space.card.key') : file.sim?.lifeCycle ? both('space.card.cycle') : file.sim?.energy ? both('space.card.energy') : file.sim?.circuit?.diagram ? both('space.card.circuit') : both('space.card.title'),
      beats: beatControls,
      beatStep,
      // At a beat the URL leaves out what `?ch=<chapter>&b=<n>` brings back (the beat's scene), not the chapter's target.
      urlBaseline: (state) => {
        const st = state as SceneSnapshot<SpaceSceneExt>;
        const b = st.beat === null ? undefined : beatsRef.current.find((x) => x.chapter === st.chapter && x.index === st.beat);
        return b ? beatBaseline(beatScene(b), store.getState().chapterTarget(b.chapter)) : null;
      },
      ...(simCommands.length > 0 ? { commands: simCommands, commandsHint: t('space.try.title') } : {}),
      test: testHooks?.(file, store, ui, bridge, chapters, orbitSession),
      escape: () => {
        if (isPresenting()) {
          stopPresentation(true);
          return true;
        }
        if (s.part !== null) {
          set({ part: null });
          return true;
        }
        if (store.getState().solo !== null) {
          set({ solo: null });
          return true;
        }
        if (store.getState().demo !== null) {
          set({ demo: null });
          return true;
        }
        if (store.getState().exercise !== null) {
          set({ exercise: null });
          return true;
        }
        if (ui.getState().reference) {
          exitReference(true);
          return true;
        }
        if (ui.getState().orbit) {
          ui.setState({ orbit: false });
          hud.setState({ cameraFree: true });
          return true;
        }
        return false;
      },
    };
  }, [
    store,
    file,
    named,
    s,
    reference,
    enterReference,
    exitReference,
    ui,
    hud,
    bridge,
    presenting,
    presentationStatus,
    beatControls,
    beatStep,
    isPresenting,
    startPresentation,
    stopPresentation,
    locale, // `t` is bound to `locale`
    simCommands,
    chapters,
  ]);
  useSceneControls(controls);

  /* ---------- the chapter axis, the beat line, the chapter index ---------- */
  const axisOpen = useHud((h) => h.panelsOpen);
  const axisChapters = useMemo<AxisChapter[]>(() => {
    const numbers = chapterNumbers(chapters);
    return chapters.map((c) => ({
      id: c.id,
      number: isBackground(c) ? tl(locale, 'chapter.backgroundShort') : String(numbers.get(c.id) ?? 0).padStart(2, '0'),
      title: tx(c.title, locale),
      beats: presentation.beats.filter((b) => b.chapter === c.id).map((b) => tx(b.caption, locale)),
    }));
  }, [chapters, presentation.beats, locale]);
  const here = chapters.find((c) => c.id === s.chapter);
  const hereAxis = axisChapters.find((c) => c.id === s.chapter);
  const hereOwn = ownBeats(here);
  // A chapter without beats of its own is its one beat.
  const shownBeat = s.beat ?? (hereOwn.length === 0 ? 0 : null);
  const fitness = (data as SpaceSceneData).fitness;
  const training = (data as SpaceSceneData).training;
  const canStep = (dir: 1 | -1) => stepBeat(presentation.beats, s.chapter, s.beat, hereOwn.length > 0, dir) !== null;

  return (
    <>
      {file.sim?.airfoil && <Suspense fallback={null}><AirfoilDriver file={file} store={store} ui={ui} chapters={chapters} /></Suspense>}
      <Suspense fallback={<StageLoading label={t('space.loading')} />}>
        <Model3DStage
          store={store}
          ui={ui}
          bridge={bridge}
          data={file}
          fitness={(data as SpaceSceneData).fitness}
          training={(data as SpaceSceneData).training?.exercises}
          chapters={chapters}
          label={t('space.stage')}
          locale={locale}
        />
      </Suspense>

      {presentation.element}

      <SceneSlot name="leaders">
        <LeaderLabels file={file} chapters={chapters} bridge={bridge} ui={ui} />
        <Suspense fallback={null}>{file.sites && <SitesOverlay file={file} bridge={bridge} />}</Suspense>
        <Suspense fallback={null}>{file.groups.some(g => g.scale) && <GroupScaleBars file={file} bridge={bridge} />}</Suspense>
        <Suspense fallback={null}>{(file.views.insets?.length ?? 0) > 0 && <InsetFrames file={file} bridge={bridge} />}</Suspense>
        {file.sim?.kind === 'senses' && <Suspense fallback={null}><SensesStageLabel file={file} bridge={bridge} /></Suspense>}
        <Suspense fallback={null}>{file.sim?.overlays.some(o => o.kind === 'energy-bars') && <EnergyBarLabels file={file} bridge={bridge} />}</Suspense>
      </SceneSlot>
      <SceneSlot name="card"><Suspense fallback={null}>{file.sim?.microscope ? <MicroscopeCard file={file} /> : file.sim?.foodWeb ? <FoodWebCard file={file} /> : orbitSession ? <OrbitCard file={file} /> : file.sim?.sort ? <KeyCard file={file} /> : file.sim?.lifeCycle ? <CycleCard file={file} /> : file.sim?.energy ? <EnergyCard file={file} /> : file.sim?.circuit?.diagram ? <CircuitCard file={file} /> : <PartChainCard file={file} />}</Suspense></SceneSlot>
      <SceneSlot name="plate">
        <PlateBlock file={file} ui={ui} bridge={bridge} />
      </SceneSlot>
      <SceneSlot name="stageOverlay">
        <ExplorerOverlay file={file} glossary={((data as SpaceSceneData).glossary?.terms.length ?? 0) > 0} />
      </SceneSlot>
      <SceneSlot name="bottomBar">
        <ChapterAxis
          chapters={axisChapters}
          chapter={s.chapter}
          beat={shownBeat}
          open={axisOpen}
          onOpen={actions.setPanels}
          onChapter={(id) => store.getState().goToChapter(id)}
          onBeat={goToBeat}
          status={hereAxis ? axisCounter(hereAxis.number, shownBeat, hereAxis.beats.length) : undefined}
          locale={locale}
        />
      </SceneSlot>
      <SceneSlot name="readerTop">
        <BeatLine
          captions={hereOwn.length > 0 ? (hereAxis?.beats ?? []) : []}
          beat={s.beat}
          canPrev={canStep(-1)}
          canNext={canStep(1)}
          onStep={beatStep}
        />
        {orbitSession && <Suspense fallback={null}><OrbitCard file={file} reader /></Suspense>}
        {file.sim && <Suspense fallback={null}><TryIt file={file} ui={ui} bridge={bridge} /></Suspense>}
        {file.sim?.foodWeb && <Suspense fallback={null}><FoodWebCard file={file} reader /></Suspense>}
        <Inspector file={file} fitness={fitness} training={training} />
      </SceneSlot>
      <SceneSlot name="readerEnd">
        <ChapterIndex index={(here?.state as SpaceChapterState | undefined)?.index} file={file} fitness={fitness} training={training} onSelectPart={file.sim?.microscope || file.sim?.kind === 'table' ? selectIndexedPart : undefined} />
      </SceneSlot>
    </>
  );
}

// The resource lives outside React so retries never start another network request.
function resource<T>(load: () => Promise<T>) {
  let value: T, ready = false;
  let pending: Promise<void> | undefined;
  return () => {
    if (!ready) throw (pending ??= load().then(result => { value = result; ready = true; }));
    return value;
  };
}
const readTestHooks = resource(() => import('./test-hooks'));
export default function SpaceSceneEntry(props: EngineViewProps) {
  const file = (props.data as SpaceSceneData).parts;
  if (!import.meta.env.SSR && file.sim) readSim(file.sim.kind);
  const orbitRuntime = file.sim?.orbitRotation ? readOrbitRuntime() : null;
  // Same test/development host gate used by the airfoil sample API.
  const testing = import.meta.env.DEV || (typeof location !== 'undefined' && ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname));
  const testHooks = testing ? readTestHooks().createSpaceTestHooks : undefined;
  return <SpaceSceneView {...props} orbitRuntime={orbitRuntime} testHooks={testHooks} />;
}
