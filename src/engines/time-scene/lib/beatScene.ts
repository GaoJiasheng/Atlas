/** The existing TimeScene beat path, shared by ticks, phone controls, P and mission b links. */
import type { SceneSnapshot } from '../../core/types';
import type { Beat } from '../../core/presentation';
import type { TimeSceneExt } from '../index';
import type { TimeBeat } from '../schema';

export function timeBeatScene(target: SceneSnapshot<TimeSceneExt>, beat: Beat<TimeBeat>, trackBeat: boolean): SceneSnapshot<TimeSceneExt> {
  const spec = beat.spec;
  return {
    ...target,
    ...(trackBeat ? { beat: beat.index } : {}),
    ...(spec?.t !== undefined ? { t: spec.t } : {}),
    ...(spec?.camera ? { camera: spec.camera } : {}),
    ...(spec?.layers ? { layers: [...spec.layers] } : {}),
    ...(spec?.highlight ? { highlight: [...spec.highlight] } : {}),
  };
}
/** Explicit URL fields win; chapter and beat were already hydrated by the host. */
export function timeLinkedBeatPatch(scene: SceneSnapshot<TimeSceneExt>, linked: Iterable<string>): Partial<SceneSnapshot<TimeSceneExt>> {
  const skip = new Set(['chapter', 'beat', ...linked]);
  return Object.fromEntries(Object.entries(scene).filter(([key]) => !skip.has(key))) as Partial<SceneSnapshot<TimeSceneExt>>;
}
