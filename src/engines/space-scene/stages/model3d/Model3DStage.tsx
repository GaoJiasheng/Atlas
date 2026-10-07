/**
 * Model3DStage: the WebGL stage of SpaceScene (react-three-fiber).
 *
 * R3F is driven through `createRoot` instead of `<Canvas>`: `<Canvas>`
 * registers the whole THREE namespace, which defeats tree-shaking and blows
 * the page JS budget. We register only the classes we use (extend.ts),
 * connect pointer events to the stage wrapper (so drei <Html> labels and
 * OrbitControls attach there, as with <Canvas>), size the renderer with a
 * ResizeObserver and render on demand (`frameloop: 'demand'`; animations
 * request frames while they run and stop while the tab is hidden).
 */
import { useEffect, useLayoutEffect, useRef } from 'react';
import { createRoot, events as createPointerEvents, type ReconcilerRoot, type RootState } from '@react-three/fiber';
import type { StoreApi, UseBoundStore } from 'zustand';
import type { SceneStore } from '../../../core/store';
import type { Chapter, Locale } from '../../../core/types';
import type { SpaceSceneExt } from '../../index';
import type { PartsFile } from '../../schema';
import { DEFAULT_CAMERA } from '../../lib/camera';
import { extendThree } from './extend';
import { useStageLook } from './look';
import { SceneRoot } from './SceneRoot';

export interface Model3DStageProps {
  store: SceneStore<SpaceSceneExt>;
  data: PartsFile;
  chapters: readonly Chapter[];
  locale: Locale;
  /** Accessible description of the stage. */
  label: string;
}

type RootStore = UseBoundStore<StoreApi<RootState>>;

export default function Model3DStage({ store, data, chapters, locale, label }: Model3DStageProps) {
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
        dpr: [1, 2],
        frameloop: 'demand',
        flat: true,
        onPointerMissed: () => {
          if (store.getState().part !== null) store.getState().patch({ part: null });
        },
        onCreated: (state) => {
          state.gl.localClippingEnabled = true;
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
  }, [store]);

  // Re-render the R3F tree whenever the inputs change (data / theme / locale).
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    rootStore.current = root.render(
      <SceneRoot store={store} data={data} chapters={chapters} locale={locale} look={look} />,
    ) as RootStore;
  }, [store, data, chapters, locale, look]);

  useEffect(() => {
    rootStore.current?.getState().invalidate();
  }, [look]);

  return (
    <div ref={wrapRef} className="space-stage" role="img" aria-label={label}>
      <canvas ref={canvasRef} className="space-stage__canvas" />
    </div>
  );
}
