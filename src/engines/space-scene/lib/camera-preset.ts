import type { SceneStore } from '../../core/store';
import type { SpaceSceneExt } from '../index';
import type { CameraPreset } from '../schema';
import type { PartRef } from './visibility';
import { DEFAULT_EXPLODE } from '../explorer/ExplorerBar';

/** VIEW buttons, digit keys and FlyTo share this action. Required layers are
 * additive: a subsystem preset reveals its subject without disabling the rest. */
export function applyNamedCameraPreset(store: SceneStore<SpaceSceneExt>, preset: CameraPreset, parts: readonly PartRef[], options: { instant: boolean }): void {
  const state = store.getState();
  const required = new Set(preset.layers ?? []);
  // `show` narrows the reveal to the subject (e.g. Newcomen's module, not the energy bars sharing its group).
  const members = new Set(preset.show ?? parts.filter(p=>p.group && required.has(p.group)).map(p=>p.id));
  state.patch({
    ...(preset.layers ? {
      layers: [...new Set([...state.layers, ...preset.layers])],
      hidden: state.hidden.filter(id=>!members.has(id)),
      ghosted: state.ghosted.filter(id=>!members.has(id) && !required.has(id)),
      solo: null,
    } : {}),
    ...(preset.view ? { view: preset.view } : {}),
    ...(preset.view === 'exploded' && state.explode < 0.05 ? { explode: DEFAULT_EXPLODE } : {}),
  });
  store.getState().applyCameraPreset(preset.camera, options);
}
