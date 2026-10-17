/**
 * The try-it state as the HUD reads it (the try-it card, the circuit diagram,
 * the PLATE readings): the values on show, the model's outputs, the chapter's
 * try-it card, and one setter shared by buttons, keys, the diagram's switch
 * symbols and the test API (docs/22 §4.3 S3: keys and buttons share the store).
 * The outputs are the stage's: the magnets where the pose on show and the
 * try-it bindings put their parts (lib/sim/carrier.ts).
 */
import { useMemo } from 'react';
import { useScene, useSceneContext, useSceneStore } from '../../core/context';
import type { SceneStore } from '../../core/store';
import type { SpaceSceneExt } from '../index';
import type { PartsFile, SpaceChapterState } from '../schema';
import type { SimData, SimTry, SimValue, SimValues } from '../sim-schema';
import { resolveSimValues, setSimControl } from '../lib/sim/controls';
import type { SimOutputs } from '../lib/sim';
import { evaluateSimOnStage } from '../lib/sim/carrier';

export interface SimView {
  sim: SimData;
  /** Values on show (defaults ⊕ sets ⊕ the store's). */
  values: SimValues;
  outputs: SimOutputs;
  /** This chapter's try-it card, if any. */
  card: SimTry | null;
}

/** Set one control (the store keeps only what was set; lib/sim/controls.ts). */
export function setSim(store: SceneStore<SpaceSceneExt>, sim: SimData, id: string, value: SimValue): void {
  const st = store.getState();
  st.patch({ sim: setSimControl(sim, st.sim, id, value) });
}

export function useSimView(file: Pick<PartsFile, 'sim' | 'parts' | 'poses'>): SimView | null {
  const { chapters } = useSceneContext();
  const s = useScene<SpaceSceneExt, { set: SimValues; chapter: string | null; pose: string | null }>((st) => ({ set: st.sim, chapter: st.chapter, pose: st.pose }));
  return useMemo(() => {
    const sim = file.sim;
    if (!sim) return null;
    const values = resolveSimValues(sim, s.set);
    const state = chapters.find((c) => c.id === s.chapter)?.state as SpaceChapterState | undefined;
    const card = state?.sim?.try ?? null;
    return { sim, values, outputs: evaluateSimOnStage(sim, file, values, s.pose, card?.observe).outputs, card };
  }, [file, s.set, s.chapter, s.pose, chapters]);
}

export function useSimStore(): SceneStore<SpaceSceneExt> {
  return useSceneStore<SpaceSceneExt>();
}
