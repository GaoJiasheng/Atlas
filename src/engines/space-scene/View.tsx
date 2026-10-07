/**
 * SpaceScene view: Model3DStage (react-three-fiber, lazy-loaded so the
 * Explorer controls appear before three.js arrives) + Explorer controls in the
 * host's slots (bottom bar, stage overlay, inspector).
 */
import { lazy, Suspense } from 'react';
import type { EngineViewProps } from '../core/types';
import { SceneSlot, useSceneStore, useT } from '../core/context';
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

export default function SpaceSceneView({ data, chapters, locale }: EngineViewProps) {
  const file = (data as SpaceSceneData).parts;
  const store = useSceneStore<SpaceSceneExt>();
  const t = useT();

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
