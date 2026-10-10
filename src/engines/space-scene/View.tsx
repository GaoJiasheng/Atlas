/**
 * SpaceScene view: Model3DStage (react-three-fiber, lazy-loaded so the HUD
 * appears before three.js arrives) + the technical-plate HUD content in the
 * host's slots (docs/08 §2–§3): VIEW presets (chapter cameras, ORBIT,
 * REFERENCE), mode switches (X / E / C / F / R, buttons in the overlay's
 * control panel), part-chain card, the three bottom panels, perf readout,
 * two-column leader labels, explode slider and the part inspector.
 */
import { lazy, Suspense, useCallback, useMemo, useState } from 'react';
import { useStore } from 'zustand';
import type { EngineViewProps, OrbitCamera } from '../core/types';
import { SceneSlot, useScene, useSceneContext, useSceneControls, useSceneStore, useT } from '../core/context';
import type { SceneControls, SceneMode, ScenePreset, SceneStats } from '../core/controls';
import { isOrbitCamera, normalizeCamera } from '../core/camera';
import { t as tl, tx, type BilingualText, type UiKey } from '../../i18n';
import { DEFAULT_CAMERA, REFERENCE_TWEEN_MS, referenceCamera } from './lib/camera';
import { modelBounds } from './lib/parts';
import type { SpaceSceneExt } from './index';
import type { SpaceSceneData } from './schema';
import { createSpaceUi } from './ui';
import { createBridge } from './bridge';
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

  const controls = useMemo<SceneControls>(() => {
    // A chapter's camera as the stage frames it: its own camera, else its view preset, else the inherited one.
    const chapterPresets = chapters.map((c, i) => {
      const target = store.getState().chapterTarget(c.id);
      const ownCamera = normalizeCamera(c.state.camera);
      const own = ownCamera && isOrbitCamera(ownCamera) ? ownCamera : null;
      const inherited = target.camera && isOrbitCamera(target.camera) ? target.camera : null;
      const camera = own ?? file.views[target.view]?.camera ?? inherited ?? DEFAULT_CAMERA;
      return { id: c.id, label: String(i + 1).padStart(2, '0'), chapter: c.id, camera };
    });
    const presets: ScenePreset[] = [
      ...chapterPresets,
      { id: ORBIT_PRESET, label: t('space.preset.orbit'), title: t('space.preset.orbitTitle') },
      { id: REFERENCE_PRESET, label: t('space.preset.reference'), title: t('space.preset.referenceTitle') },
    ];
    const set = (patch: Partial<SpaceSceneExt>) => store.getState().patch(patch);
    const inReference = reference !== null;
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
      { id: 'flow', key: 'f', label: t('space.mode.flow'), on: s.run, tone: 'hot', disabled: inReference },
      { id: 'reference', key: 'r', label: t('space.mode.reference'), on: inReference, tone: 'ink', phone: false },
    ];
    const partIndex = s.part ? file.parts.findIndex((p) => p.id === s.part) : -1;
    const status = [
      ...(partIndex >= 0 ? [`#${String(partIndex + 1).padStart(2, '0')} ${tx(file.parts[partIndex]!.name, 'en').toUpperCase()}`] : []),
      ...(inReference ? [t('space.status.locked').toLocaleUpperCase()] : []),
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
          const preset = chapterPresets.find((p) => p.id === id);
          if (preset) store.getState().applyCameraPreset(preset.camera, { instant });
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
        const out: Partial<SceneStats> & { geometries: number; textures: number } = {
          calls: st.calls,
          triangles: st.triangles,
          geometries: st.geometries,
          textures: st.textures,
          fps: st.fps === undefined ? undefined : Math.round(st.fps * 10) / 10,
          gpu: st.gpu,
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
      escape: () => {
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
  }, [chapters, store, file, s, reference, enterReference, exitReference, ui, hud, bridge, locale]); // `t` is bound to `locale`
  useSceneControls(controls);

  return (
    <>
      <Suspense fallback={<StageLoading label={t('space.loading')} />}>
        <Model3DStage store={store} ui={ui} bridge={bridge} data={file} chapters={chapters} label={t('space.stage')} />
      </Suspense>

      <SceneSlot name="leaders">
        <LeaderLabels file={file} chapters={chapters} bridge={bridge} />
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
