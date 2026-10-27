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
import type { Chapter } from '../../../core/types';
import type { SpaceSceneExt } from '../../index';
import type { PartsFile } from '../../schema';
import type { FitnessBundle } from '../../../../content/schema/fitness';
import { t, type Locale } from '../../../../i18n';
import type { SpaceUiStore } from '../../ui';
import type { StageBridge } from '../../bridge';
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

const NO_TRAINING: readonly string[] = [];

export default function Model3DStage({ store, data, ui, bridge, chapters, label, fitness, training = NO_TRAINING, locale }: Model3DStageProps) {
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
