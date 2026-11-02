/**
 * Model3DStage: the WebGL stage of SpaceScene (react-three-fiber).
 *
 * R3F is driven through `createRoot` instead of `<Canvas>`: `<Canvas>`
 * registers the whole THREE namespace, which defeats tree-shaking and blows
 * the page JS budget. We register only the classes we use (extend.ts),
 * connect pointer events to the stage wrapper (so OrbitControls attach there,
 * as with <Canvas>), size the renderer with a ResizeObserver, clamp the pixel
 * ratio to `min(dpr, 3840 / innerWidth, 2)` (master-spec M), tone-map with
 * ACES filmic, update shadow maps only on demand and render on demand (`frameloop: 'demand'`; animations
 * request frames while they run and stop while the tab is hidden).
 * Topics with a glb get a hairline progress bar across the stage while it
 * loads and a short bilingual note if it fails (the primitives still draw).
 */
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useStore } from 'zustand';
import { createRoot, events as createPointerEvents, type ReconcilerRoot, type RootState } from '@react-three/fiber';
import type { StoreApi, UseBoundStore } from 'zustand';
import type { SceneStore } from '../../../core/store';
import { useSceneContext } from '../../../core/context';
import type { Chapter } from '../../../core/types';
import type { SpaceSceneExt } from '../../index';
import type { PartsFile } from '../../schema';
import type { FitnessBundle } from '../../../../content/schema/fitness';
import { t, type Locale } from '../../../../i18n';
import type { SpaceUiStore } from '../../ui';
import type { StageBridge } from '../../bridge';
import { freeStageRect, type FrameRect } from '../../lib/hud-framing';
import { DEFAULT_CAMERA } from '../../lib/camera';
import { extendThree } from './extend';
import { useStageLook } from './look';
import { SceneRoot } from './SceneRoot';
import { stageDpr } from './dpr';

export interface Model3DStageProps {
  store: SceneStore<SpaceSceneExt>;
  data: PartsFile;
  ui: SpaceUiStore;
  bridge: StageBridge;
  chapters: readonly Chapter[];
  /** Accessible description of the stage. */
  label: string;
  /** Shared fitness data merged into the topic (muscle topics). */
  fitness?: FitnessBundle | undefined;
  /** Exercise ids of the topic's training.json (exercise mode plays these). */
  training?: readonly string[] | undefined;
  locale: Locale;
}

type RootStore = UseBoundStore<StoreApi<RootState>>;

/** How long after a HUD change its blocks are measured (ms): after the browser has laid the change out and painted it. */
const MEASURE_DELAY_MS = 120;

const NO_TRAINING: readonly string[] = [];

export default function Model3DStage({ store, data, ui, bridge, chapters, label, fitness, training = NO_TRAINING, locale }: Model3DStageProps) {
  const { hud } = useSceneContext();
  const playable = useMemo(() => new Set(training), [training]);
  const model = useStore(ui, (u) => u.model);
  const mechanismError = useStore(ui, (u) => u.mechanismError);
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rootRef = useRef<ReconcilerRoot<HTMLCanvasElement> | null>(null);
  const rootStore = useRef<RootStore | null>(null);
  const look = useStageLook();

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    extendThree();
    const root = createRoot(canvas);
    rootRef.current = root;
    const rect = wrap.getBoundingClientRect();
    root
      .configure({
        gl: { antialias: true, alpha: true, powerPreference: 'high-performance' },
        events: createPointerEvents,
        camera: { fov: DEFAULT_CAMERA.fov, near: 0.05, far: 200, position: DEFAULT_CAMERA.position },
        size: { width: Math.max(1, rect.width), height: Math.max(1, rect.height), top: 0, left: 0 },
        dpr: stageDpr() * bridge.resolution,
        frameloop: 'demand',
        shadows: 'percentage',
        onPointerMissed: () => {
          if (store.getState().part !== null) store.getState().patch({ part: null });
        },
        onCreated: (state) => {
          state.gl.localClippingEnabled = true;
          state.gl.shadowMap.autoUpdate = false;
          state.gl.setClearColor(0x000000, 0);
          // Like <Canvas>: events (and drei Html / OrbitControls) live on the wrapper.
          state.events.connect?.(wrap);
        },
      })
      .catch((error: unknown) => console.error('[atlas] space-scene: WebGL renderer failed', error));

    const resize = new ResizeObserver((entries) => {
      const box = entries[0]?.contentRect;
      const st = rootStore.current?.getState();
      if (!box || !st || box.width < 1 || box.height < 1) return;
      st.setDpr(stageDpr() * bridge.resolution);
      st.setSize(box.width, box.height, 0, 0);
      st.invalidate();
    });
    resize.observe(wrap);

    const onVisibility = () => {
      if (!document.hidden) rootStore.current?.getState().invalidate();
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      resize.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      rootRef.current = null;
      rootStore.current = null;
      root.unmount();
    };
  }, [store, bridge]);

  // The DOM HUD lives outside R3F: measure its visible blocks on layout changes (not per rendered frame, and a
  // beat after the change rather than in the next animation frame: reading boxes while the DOM is still dirty
  // forces a layout inside the frame that answers an interaction, which slows exactly that frame);
  // CameraRig frames the view in the area they leave free and re-fits when they move (docs/67 §9).
  useEffect(() => {
    const stage = wrapRef.current, scene = stage?.closest('.atlas-scene');
    if (!stage || !scene) return;
    let timer = 0, alive = true;
    const resize = new ResizeObserver(() => schedule());
    const measure = () => {
      timer = 0;
      // Until the host has measured the HUD once, the view is not placed (ready waits); its first measurement schedules this again.
      bridge.hudPending = hud.getState().room === null;
      if (bridge.hudPending) return;
      // One measurement of the HUD for every engine: the host's (core/useHudRoom), moved from `.atlas-stage` into this stage.
      const box = stage.getBoundingClientRect(), view = scene.getBoundingClientRect();
      const host = stage.closest('.atlas-stage')?.getBoundingClientRect() ?? box;
      const dx = host.left - box.left, dy = host.top - box.top;
      const rects = hud.getState().hudObstacles.map((r) => ({ x0: r.x0 + dx, y0: r.y0 + dy, x1: r.x1 + dx, y1: r.y1 + dy }));
      resize.observe(stage);
      // The phone / portrait layouts stack the HUD over the stage (no side columns to frame between).
      const stacked = view.width < 1024 || view.height > view.width;
      const same = (a: readonly FrameRect[] | undefined) => a?.length === rects.length &&
        a.every((r, i) => Math.abs(r.x0 - rects[i]!.x0) + Math.abs(r.y0 - rects[i]!.y0) + Math.abs(r.x1 - rects[i]!.x1) + Math.abs(r.y1 - rects[i]!.y1) < 1);
      if (same(bridge.hudPanels) && stacked === bridge.hudStacked && box.width === bridge.hudStage?.[0] && box.height === bridge.hudStage?.[1]) {
        // Nothing moved; a frame still lets CameraRig mark the first layout settled.
        if (!bridge.hudSettled) rootStore.current?.getState().invalidate();
        return;
      }
      // Side by side: the host's largest free rectangle (12 px gutter); stacked, the documented full-width band.
      const free = hud.getState().freeStage;
      bridge.freeStage = stacked || !free
        ? freeStageRect(box.width, box.height, rects, 12, stacked)
        : { x0: Math.max(0, free.x0 + dx) + 12, y0: Math.max(0, free.y0 + dy) + 12, x1: Math.min(box.width, free.x1 + dx) - 12, y1: Math.min(box.height, free.y1 + dy) - 12 };
      bridge.hudPanels = rects;
      bridge.hudStacked = stacked;
      bridge.hudStage = [box.width, box.height];
      bridge.hudLayout += 1;
      // A frame for CameraRig to re-fit in (the bridge's invalidate is wired once the R3F tree has mounted).
      bridge.invalidate();
      rootStore.current?.getState().invalidate();
    };
    const schedule = () => {
      if (!alive || timer) return;
      // A HUD change waits to be measured (throttled, not debounced: a stream of readout updates still gets measured);
      // not ready until then (a busy first load can hold it for seconds).
      bridge.hudPending = true;
      timer = window.setTimeout(measure, MEASURE_DELAY_MS);
    };
    const mutations = new MutationObserver(schedule);
    mutations.observe(scene, { childList: true, subtree: true });
    const attributes = new MutationObserver(schedule);
    attributes.observe(scene, { attributes: true });
    const off = ui.subscribe((s, prev) => { if (s.presenting !== prev.presenting || s.cover !== prev.cover) schedule(); });
    const offHud = hud.subscribe((s, prev) => { if (s.hudObstacles !== prev.hudObstacles || s.freeStage !== prev.freeStage || s.room !== prev.room) schedule(); });
    scene.addEventListener('transitionend', schedule);
    document.fonts?.ready.then(schedule);
    measure();
    return () => {
      alive = false;
      resize.disconnect(); mutations.disconnect(); attributes.disconnect(); off(); offHud();
      scene.removeEventListener('transitionend', schedule);
      window.clearTimeout(timer);
      delete bridge.freeStage;
      delete bridge.hudPanels;
      delete bridge.hudStacked;
      delete bridge.hudStage;
      bridge.hudPending = false;
    };
  }, [bridge, ui, hud]);

  // Re-render the R3F tree whenever the inputs change (data / theme).
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    rootStore.current = root.render(
      <SceneRoot store={store} ui={ui} bridge={bridge} data={data} fitness={fitness} playable={playable} chapters={chapters} look={look} />,
    ) as RootStore;
  }, [store, ui, bridge, data, fitness, playable, chapters, look]);

  useEffect(() => {
    rootStore.current?.getState().invalidate();
  }, [look]);

  return (
    <div ref={wrapRef} className="space-stage" role="img" aria-label={label}>
      <canvas ref={canvasRef} className="space-stage__canvas" />
      {mechanismError && <p className="space-stage__failed" role="status">Mechanism configuration error. Motion has stopped.<span lang="zh-Hans">机构配置错误，运动已停止。</span></p>}
      {model.state === 'loading' && (
        <div
          className="space-stage__progress"
          role="progressbar"
          aria-label={t(locale, 'space.model.loading')}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(model.progress * 100)}
        >
          <i style={{ transform: `scaleX(${model.progress.toFixed(3)})` }} />
        </div>
      )}
      {model.state === 'failed' && (
        <p className="space-stage__failed" role="status">
          {t('en', 'space.model.failed')}
          <span lang="zh-Hans">{t('zh', 'space.model.failed')}</span>
        </p>
      )}
    </div>
  );
}
