/** A TimeScene beat and its URL baseline use exactly the same state merge. */
import type { SceneSnapshot } from '../../core/types';
import type { TimeSceneExt } from '../index';
import type { TimeBeat } from '../schema';
export function timeBeatState(target: SceneSnapshot<TimeSceneExt>, spec: TimeBeat | null | undefined, index: number): SceneSnapshot<TimeSceneExt> {
  return { ...target, beat: index,
    ...(spec?.t !== undefined ? { t: spec.t } : {}),
    ...(spec?.camera ? { camera: spec.camera } : {}),
    ...(spec?.layers ? { layers: [...spec.layers] } : {}),
    ...(spec?.highlight ? { highlight: [...spec.highlight] } : {}),
    ...(spec?.inset !== undefined ? { inset: spec.inset } : {}),
    ...(spec?.insetVisible !== undefined ? { insetVisible: spec.insetVisible } : {}),
    ...(spec?.fossilMode !== undefined ? { fossilMode: spec.fossilMode } : {}),
  };
}
export function linkedTimeBeatState(next: SceneSnapshot<TimeSceneExt>, linked: readonly string[]): Partial<SceneSnapshot<TimeSceneExt>> {
  return Object.fromEntries(Object.entries(next).filter(([key]) => !linked.includes(key) || key === 'chapter' || key === 'beat'));
}
