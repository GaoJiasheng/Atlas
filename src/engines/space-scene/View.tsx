/**
 * SpaceScene view: Model3DStage (react-three-fiber, lazy-loaded so the
 * Explorer controls appear before three.js arrives) + Explorer controls in the
 * host's slots (bottom bar, stage overlay, inspector).
 */
import { lazy, Suspense, useMemo } from 'react';
import type { EngineViewProps } from '../core/types';
import { SceneSlot, useScene, useSceneControls, useSceneStore, useT } from '../core/context';
import type { SceneControls } from '../core/controls';
import { isOrbitCamera, normalizeCamera } from '../core/camera';
import { DEFAULT_CAMERA } from './lib/camera';
import type { SpaceSceneExt } from './index';
import type { SpaceSceneData } from './schema';
import { ExplorerBar } from './explorer/ExplorerBar';
import { ExplorerOverlay } from './explorer/ExplorerOverlay';
import { Inspector } from './explorer/Inspector';
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

/** Explode amount used when EXPLODED is switched on from (almost) 0 (matches ExplorerBar). */
const DEFAULT_EXPLODE = 0.7;

export default function SpaceSceneView({ data, chapters, locale }: EngineViewProps) {
  const file = (data as SpaceSceneData).parts;
  const store = useSceneStore<SpaceSceneExt>();
  const t = useT();

  /* HUD controls (docs/08 §3): presets = chapter cameras; X / E / C / F modes; SPACE = run; L = labels. */
  const s = useScene<SpaceSceneExt, Pick<SpaceSceneExt, 'view' | 'explode' | 'run' | 'cutaway' | 'part'>>((st) => ({
    view: st.view,
    explode: st.explode,
    run: st.run,
    cutaway: st.cutaway,
    part: st.part,
  }));
  const controls = useMemo<SceneControls>(() => {
    // A chapter's camera as the stage frames it: its own camera, else its view preset, else the inherited one.
    const presets = chapters.map((c, i) => {
      const target = store.getState().chapterTarget(c.id);
      const ownCamera = normalizeCamera(c.state.camera);
      const own = ownCamera && isOrbitCamera(ownCamera) ? ownCamera : null;
      const inherited = target.camera && isOrbitCamera(target.camera) ? target.camera : null;
      const camera = own ?? file.views[target.view]?.camera ?? inherited ?? DEFAULT_CAMERA;
      return { id: c.id, label: String(i + 1).padStart(2, '0'), chapter: c.id, camera };
    });
    const set = (patch: Partial<SpaceSceneExt>) => store.getState().patch(patch);
    return {
      presets: {
        items: presets,
        set: (id, { instant }) => {
          const preset = presets.find((p) => p.id === id);
          if (preset) store.getState().applyCameraPreset(preset.camera, { instant });
        },
      },
      modes: {
        items: [
          { id: 'xray', key: 'x', label: t('space.mode.xray'), on: s.view === 'xray', tone: 'xray' },
          {
            id: 'exploded',
            key: 'e',
            label: t('space.mode.exploded'),
            on: s.view === 'exploded',
            status: `${t('space.mode.exploded')} ${Math.round(s.explode * 100)}`,
          },
          { id: 'cutaway', key: 'c', label: t('space.mode.cutaway'), on: s.cutaway === 'half', tone: 'cut' },
          { id: 'flow', key: 'f', label: t('space.mode.flow'), on: s.run, tone: 'hot' },
        ],
        set: (id, on) => {
          if (id === 'xray') set({ view: on ? 'xray' : 'assembled' });
          else if (id === 'exploded')
            set(on ? { view: 'exploded', explode: s.explode < 0.05 ? DEFAULT_EXPLODE : s.explode } : { view: 'assembled' });
          else if (id === 'cutaway') set({ cutaway: on ? 'half' : 'none' });
          else if (id === 'flow') set({ run: on });
        },
      },
      labels: true,
      pause: { paused: !s.run, set: (paused) => set({ run: !paused }) },
      escape: () => {
        if (s.part === null) return false;
        set({ part: null });
        return true;
      },
    };
  }, [chapters, store, file, s, locale]); // `t` is bound to `locale`
  useSceneControls(controls);

  return (
    <>
      <Suspense fallback={<StageLoading label={t('space.loading')} />}>
        <Model3DStage store={store} data={file} chapters={chapters} locale={locale} label={t('space.stage')} />
      </Suspense>

      <SceneSlot name="stageOverlay">
        <ExplorerOverlay file={file} />
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
