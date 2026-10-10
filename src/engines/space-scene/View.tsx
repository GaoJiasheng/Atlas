/**
 * SpaceScene view: Model3DStage (react-three-fiber, lazy-loaded so the HUD
 * appears before three.js arrives) + the technical-plate HUD content in the
 * host's slots (docs/08 §2–§3): VIEW presets (chapter cameras, ORBIT,
 * REFERENCE, then the named presets of parts.json), mode switches
 * (X / E / C / F / R / P, buttons in the overlay's control panel), part-chain
 * card, the three bottom panels, perf readout, two-column leader labels,
 * explode slider and the part inspector.
 *
 * PRESENTATION (P) runs on the core presentation system (core/presentation).
 * SpaceScene's adapter: a beat is its chapter's target plus the beat's view /
 * part / explode / run / cutaway / layers / hide and its camera (an orbit
 * camera, a named preset's camera, else the chapter's), applied with the
 * store's `applyState` (camera tween 1.4 s); the beat has settled when the
 * stage reports the camera move done (and the explode / put-aside motion has
 * had its time). Entering leaves ORBIT and REFERENCE and drops the selection;
 * the leader labels show the beat's `labels` only (≤ 6) with the HUD hidden.
 * EXPLODED and FLOW do not combine (docs/12 §7.5): F is disabled while
 * exploded and the stage draws no particles. With the HUD hidden outside the
 * presentation the stage frames the cover camera (`views.cover`, else the
 * model re-fitted to the stage) and goes back when the HUD returns.
 */
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useStore } from 'zustand';
import type { Chapter, EngineViewProps, OrbitCamera } from '../core/types';
import { SceneSlot, useHud, useScene, useSceneContext, useSceneControls, useSceneStore, useT } from '../core/context';
import type { SceneControls, SceneMode, ScenePreset, SceneStats } from '../core/controls';
import { isOrbitCamera, normalizeCamera } from '../core/camera';
import { usePresentation, type SpaceBeatSpec, type SpacePresentationAdapter, type SpaceSavedState } from '../core/presentation';
import { t as tl, tx, type BilingualText, type UiKey } from '../../i18n';
import { DEFAULT_CAMERA, fitCameraToAspect, REFERENCE_TWEEN_MS, referenceCamera, roundCamera } from './lib/camera';
import { modelBounds } from './lib/parts';
import { targetExplodeAmount } from './lib/explode';
import type { SpaceSceneExt } from './index';
import type { SpaceChapterState, SpaceSceneData, SpaceView, ViewPresets } from './schema';
import { createSpaceUi } from './ui';
import { cameraSettled, createBridge } from './bridge';
import { ExplorerBar, DEFAULT_EXPLODE } from './explorer/ExplorerBar';
import { ExplorerOverlay } from './explorer/ExplorerOverlay';
import { Inspector } from './explorer/Inspector';
import { PartChainCard } from './hud/PartChainCard';
import { ArchitecturePanel } from './hud/ArchitecturePanel';
import { DetailPanel } from './hud/DetailPanel';
import { StatePanel } from './hud/StatePanel';
import { PerfReadout } from './hud/PerfReadout';
import { spaceSpecRows } from './hud/spec';
import { LeaderLabels } from './hud/LeaderLabels';
import './space-scene.css';

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

type Pick5 = Pick<SpaceSceneExt, 'view' | 'explode' | 'run' | 'cutaway' | 'part'> & { chapter: string | null };

export default function SpaceSceneView({ data, chapters, locale }: EngineViewProps) {
  const file = (data as SpaceSceneData).parts;
  const store = useSceneStore<SpaceSceneExt>();
  const { hud } = useSceneContext();
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
  }));

  const bounds = useMemo(() => modelBounds(file.parts), [file.parts]);
  const plane = file.views.section?.plane ?? 'xy';

  /* REFERENCE: straight long-lens elevation, run off, no explode; R again restores. */
  const enterReference = useCallback(
    (instant: boolean) => {
      if (ui.getState().reference) return;
      const st = store.getState();
      const h = hud.getState();
      const live = bridge.liveCamera();
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
      const cam: OrbitCamera = file.views.reference?.camera ?? (bounds ? referenceCamera(bounds, plane, aspect) : DEFAULT_CAMERA);
      st.applyCameraPreset(cam, { instant });
      hud.setState({ presetId: REFERENCE_PRESET, cameraFree: false });
    },
    [ui, store, hud, bridge, file.views.reference, bounds, plane],
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
  const presentationAdapter: SpacePresentationAdapter = {
    beatsOf: (c) => (c.state as SpaceChapterState).beats,
    captionOf: (b, l) => tx(b.caption, l),
    applyBeat: (b, { instant }) => {
      const st = store.getState();
      const before = st.snapshot();
      const target = st.chapterTarget(b.chapter);
      const spec: SpaceBeatSpec | undefined = b.spec;
      const view = spec?.view ?? target.view;
      const preset = typeof spec?.camera === 'string' ? named.find((p) => p.id === spec.camera)?.camera : undefined;
      const own = typeof spec?.camera === 'object' ? spec.camera : undefined;
      const camera = own ?? preset ?? chapterCamera(chapters.find((c) => c.id === b.chapter), target.camera, view, file.views);
      const next: Partial<typeof before> = {
        ...target,
        view,
        ...(spec?.part !== undefined ? { part: spec.part } : {}),
        ...(spec?.explode !== undefined ? { explode: spec.explode } : {}),
        ...(spec?.run !== undefined ? { run: spec.run } : {}),
        ...(spec?.cutaway !== undefined ? { cutaway: spec.cutaway } : {}),
        ...(spec?.layers ? { layers: [...spec.layers] } : {}),
        hidden: spec?.hide ? [...spec.hide] : target.hidden,
        camera,
      };
      ui.setState({ orbit: false, beatLabels: spec?.labels ? [...spec.labels] : null, nextTweenMs: instant ? null : BEAT_TWEEN_MS });
      st.applyState(next, { instant });
      if (instant) return;
      const id = store.getState().transition.id;
      const after = store.getState();
      const motion =
        targetExplodeAmount(before.view, before.explode) !== targetExplodeAmount(after.view, after.explode)
          ? EXPLODE_MS
          : sameIds(before.hidden, after.hidden)
            ? 0
            : HIDE_MS;
      return Promise.all([cameraSettled(bridge, id, SETTLE_TIMEOUT_MS), wait(motion)]).then(() => undefined);
    },
    onEnter: () => {
      const st = store.getState();
      const snap = st.snapshot();
      const u = ui.getState();
      const h = hud.getState();
      const ref = u.reference;
      const live = bridge.liveCamera();
      const aspect = bridge.width > 0 && bridge.height > 0 ? bridge.width / bridge.height : 1.5;
      entered.current = {
        chapter: snap.chapter,
        layers: [...snap.layers],
        camera: ref ? ref.camera : live ? { ...roundCamera(fitCameraToAspect(live, aspect, true)), fov: live.fov } : asOrbit(snap.camera),
        view: ref ? ref.view : snap.view,
        part: snap.part,
        explode: ref ? ref.explode : snap.explode,
        run: ref ? ref.run : snap.run,
        cutaway: snap.cutaway,
        hidden: [...snap.hidden],
        labels: u.beatLabels,
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
      ui.setState({ presenting: false, beatLabels: saved.labels, orbit: saved.orbit });
      const { chapter, layers, camera, view, part, explode, run, cutaway, hidden } = saved;
      store.getState().applyState({ chapter, layers, camera, view, part, explode, run, cutaway, hidden }, { instant: false });
      hud.setState({ presetId: saved.presetId, cameraFree: saved.cameraFree });
    },
  };
  const presentation = usePresentation(presentationAdapter);
  const { presenting, isPresenting, status: presentationStatus, controls: beatControls, start: startPresentation, stop: stopPresentation } = presentation;

  // HUD hidden (H, hero shots) outside the presentation: the stage frames the cover camera.
  const hudOn = useHud((h) => h.hud);
  useEffect(() => {
    ui.setState({ cover: !hudOn && !presenting });
  }, [ui, hudOn, presenting]);

  const controls = useMemo<SceneControls>(() => {
    const chapterPresets = chapters.map((c, i) => {
      const target = store.getState().chapterTarget(c.id);
      return { id: c.id, label: String(i + 1).padStart(2, '0'), chapter: c.id, camera: chapterCamera(c, target.camera, target.view, file.views) };
    });
    const presets: ScenePreset[] = [
      ...chapterPresets,
      { id: ORBIT_PRESET, label: t('space.preset.orbit'), title: t('space.preset.orbitTitle') },
      { id: REFERENCE_PRESET, label: t('space.preset.reference'), title: t('space.preset.referenceTitle') },
      ...named.map((p) => ({ id: p.id, label: p.label, title: p.label })),
    ];
    const set = (patch: Partial<SpaceSceneExt>) => store.getState().patch(patch);
    const inReference = reference !== null;
    const exploded = s.view === 'exploded';
    const pct = Math.round(s.explode * 100);
    const modes: SceneMode[] = [
      { id: 'xray', key: 'x', label: t('space.mode.xray'), on: s.view === 'xray', tone: 'xray' },
      {
        id: 'exploded',
        key: 'e',
        label: t('space.mode.exploded'),
        on: s.view === 'exploded',
        disabled: inReference,
        status: `${t('space.state.explode')} ${pct}`,
      },
      { id: 'cutaway', key: 'c', label: t('space.mode.cutaway'), on: s.cutaway === 'half', tone: 'cut', status: `${t('space.mode.cutaway')} 50` },
      // Flow paths do not follow the parts apart (docs/12 §7.5): no FLOW while exploded.
      { id: 'flow', key: 'f', label: t('space.mode.flow'), on: s.run, tone: 'hot', disabled: inReference || exploded },
      { id: 'reference', key: 'r', label: t('space.mode.reference'), on: inReference, tone: 'ink', disabled: presenting, phone: false },
      { id: 'presentation', key: 'p', label: t('present.mode'), on: presenting, tone: 'signal', status: presentationStatus, phone: false },
    ];
    const partIndex = s.part ? file.parts.findIndex((p) => p.id === s.part) : -1;
    const status = [
      ...(partIndex >= 0 ? [`#${String(partIndex + 1).padStart(2, '0')} ${tx(file.parts[partIndex]!.name, 'en').toUpperCase()}`] : []),
      ...(inReference ? [t('space.status.locked').toLocaleUpperCase()] : []),
      ...(exploded && !inReference && file.flows.length > 0 ? [t('space.status.flowLocked').toLocaleUpperCase()] : []),
    ];
    return {
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
          if (own?.view) set(own.view === 'exploded' ? { view: 'exploded', explode: s.explode < 0.05 ? DEFAULT_EXPLODE : s.explode } : { view: own.view });
          const camera = own?.camera ?? chapterPresets.find((p) => p.id === id)?.camera;
          if (camera) store.getState().applyCameraPreset(camera, { instant });
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
            if (on) startPresentation(null, instant);
            else stopPresentation(true);
          }
        },
      },
      labels: true,
      pause: {
        paused: !s.run,
        set: (paused) => {
          if (!ui.getState().reference) set({ run: !paused });
        },
      },
      stats: () => {
        const st = bridge.stats;
        const live = bridge.liveCamera();
        const out: Partial<SceneStats> & { geometries: number; textures: number; camera?: OrbitCamera } = {
          calls: st.calls,
          triangles: st.triangles,
          geometries: st.geometries,
          textures: st.textures,
          fps: st.fps === undefined ? undefined : Math.round(st.fps * 10) / 10,
          gpu: st.gpu,
          // The live camera (tests: where the stage really is, not the stored target).
          ...(live ? { camera: { ...roundCamera(live), fov: Math.round((live.fov ?? 0) * 100) / 100 } } : {}),
        };
        return out;
      },
      specRows: spaceSpecRows(file),
      status,
      card: both('space.card.title'),
      panels: {
        panel01: both('space.panel.architecture'),
        panel02: both('space.panel.detail'),
        panel03: both('space.panel.state'),
      },
      beats: beatControls,
      escape: () => {
        if (isPresenting()) {
          stopPresentation(true);
          return true;
        }
        if (s.part !== null) {
          set({ part: null });
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
    chapters,
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
    isPresenting,
    startPresentation,
    stopPresentation,
    locale, // `t` is bound to `locale`
  ]);
  useSceneControls(controls);

  return (
    <>
      <Suspense fallback={<StageLoading label={t('space.loading')} />}>
        <Model3DStage store={store} ui={ui} bridge={bridge} data={file} chapters={chapters} label={t('space.stage')} />
      </Suspense>

      {presentation.element}

      <SceneSlot name="leaders">
        <LeaderLabels file={file} chapters={chapters} bridge={bridge} ui={ui} />
      </SceneSlot>
      <SceneSlot name="card">
        <PartChainCard file={file} />
      </SceneSlot>
      <SceneSlot name="panel01">
        <ArchitecturePanel file={file} />
      </SceneSlot>
      <SceneSlot name="panel02">
        <DetailPanel file={file} chapters={chapters} />
      </SceneSlot>
      <SceneSlot name="panel03">
        <StatePanel file={file} ui={ui} />
      </SceneSlot>
      <SceneSlot name="perf">
        <PerfReadout bridge={bridge} />
      </SceneSlot>
      <SceneSlot name="stageOverlay">
        <ExplorerOverlay file={file} glossary={((data as SpaceSceneData).glossary?.terms.length ?? 0) > 0} />
      </SceneSlot>
      <SceneSlot name="bottomBar">
        <ExplorerBar />
      </SceneSlot>
      <SceneSlot name="inspector">
        <Inspector file={file} />
      </SceneSlot>
    </>
  );
}
