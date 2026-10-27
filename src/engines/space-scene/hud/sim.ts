/**
 * The try-it state as the HUD reads it (the try-it card, the circuit diagram,
 * the PLATE readings): the values on show, the model's outputs, the chapter's
 * try-it card, and one setter shared by buttons, keys, the diagram's switch
 * symbols and the test API (docs/22 §4.3 S3: keys and buttons share the store).
 * The outputs are the stage's: the magnets where the pose on show and the
 * try-it bindings put their parts (lib/sim/carrier.ts).
 */
import { useMemo, useSyncExternalStore } from 'react';
import { useStore } from 'zustand';
import { useScene, useSceneContext, useSceneStore } from '../../core/context';
import type { SceneStore } from '../../core/store';
import { getOrbitSession } from '../lib/sim/orbit-session';
import type { SpaceSceneExt } from '../index';
import type { PartsFile, SpaceChapterState } from '../schema';
import type { SimData, SimTry, SimValue, SimValues } from '../sim-schema';
import { resolveSimValues, setSimControl } from '../lib/sim/controls';
import type { SimOutputs } from '../lib/sim';
import { evaluateSimOnStage } from '../lib/sim/carrier';
import { predictionContextKey, predictionHidden } from '../lib/sim/trial';
import type { SpaceUiStore } from '../ui';

export interface SimView {
  sim: SimData;
  /** Values on show (defaults ⊕ sets ⊕ the store's). */
  values: SimValues;
  outputs: SimOutputs;
  /** This chapter's try-it card, if any. */
  card: SimTry | null;
  /** The control values this chapter starts from (`state.sim.set`). */
  chapterSet: Readonly<SimValues>;
  /** An authored explanatory reveal applies while its original controls remain on show. */
  revealed: boolean;
}

/** Set one control (the store keeps only what was set; lib/sim/controls.ts). */
export function setSim(store: SceneStore<SpaceSceneExt>, sim: SimData, id: string, value: SimValue): void {
  const st = store.getState();
  st.patch({ sim: setSimControl(sim, st.sim, id, value) });
}

export function useSimView(file: Pick<PartsFile, 'sim' | 'parts' | 'poses'>): SimView | null {
  const { chapters } = useSceneContext();
  const store = useSimStore();
  const orbit = file.sim?.orbitRotation ? getOrbitSession(store, file.sim) : null;
  const orbitId = useSyncExternalStore(orbit?.subscribe ?? (() => () => {}), () => orbit?.id ?? 0, () => 0);
  const s = useScene<SpaceSceneExt, { set: SimValues; chapter: string | null; pose: string | null; beat: number | null }>((st) => ({ set: st.sim, chapter: st.chapter, pose: st.pose, beat: st.beat }));
  return useMemo(() => {
    const sim = file.sim;
    if (!sim) return null;
    const values = resolveSimValues(sim, s.set);
    const state = chapters.find((c) => c.id === s.chapter)?.state as SpaceChapterState | undefined;
    const beat = s.beat === null ? undefined : state?.beats?.[s.beat];
    const authored = resolveSimValues(sim, { ...state?.sim?.set, ...beat?.sim?.set });
    const revealed = (beat?.sim?.reveal ?? state?.sim?.reveal) === true && predictionContextKey(s.chapter ?? '', authored) === predictionContextKey(s.chapter ?? '', values);
    const card = state?.sim?.try ?? null;
    return { sim, values, outputs: orbit?.outputs ?? evaluateSimOnStage(sim, file, values, s.pose, card?.observe).outputs, card, chapterSet: state?.sim?.set ?? {}, revealed };
  }, [file, s.set, s.chapter, s.pose, s.beat, chapters, orbitId, orbit]);
}

export function useSimStore(): SceneStore<SpaceSceneExt> {
  return useSceneStore<SpaceSceneExt>();
}

/** Show this exact input state; this changes only temporary UI state, never model controls. */
export function revealCurrentResult(ui: SpaceUiStore, chapter: string, values: SimValues): void {
  ui.setState({ simReveal: { chapter, context: predictionContextKey(chapter, values) } });
}

/** Heat concealment is shared by the reader and PLATE; earlier models keep their existing visible readouts. */
export function usePredictionHidden(ui: SpaceUiStore, view: SimView | null): boolean {
  const chapter = useScene<SpaceSceneExt, string | null>((st) => st.chapter);
  const answer = useStore(ui, (state) => state.simPredict);
  const reveal = useStore(ui, (state) => state.simReveal);
  if (view === null || chapter === null || view.sim.kind !== 'heat') return false;
  const shown = reveal?.chapter === chapter && reveal.context === predictionContextKey(chapter, view.values);
  return predictionHidden(!!view.card?.predict, view.revealed || shown, answer, chapter, view.values);
}
