/** Temporary fair-test state is reconciled for every control setter (buttons, keys, links and test API). */
import type { SimValues } from "../../sim-schema";
import type { SpaceUiState } from "../../ui";
import { predictionContextKey, predictionIsCurrent, tableContextKey } from "./trial";

type TrialState = Pick<
  SpaceUiState,
  "simTables" | "simTableContexts" | "simTableNotices" | "simPredict" | "simReveal"
>;

/** Pure patch: changing a held condition clears only this chapter's rows; varying preserves the record. */
export function trialContextPatch(
  state: TrialState,
  chapter: string,
  values: SimValues,
  vary: string | undefined,
  resetPrediction = false,
): Partial<TrialState> {
  const patch: Partial<TrialState> = {};
  if (vary !== undefined) {
    const key = tableContextKey(chapter, values, vary);
    const previous = state.simTableContexts[chapter];
    if (previous !== undefined && previous !== key) {
      patch.simTables = { ...state.simTables, [chapter]: [] };
      patch.simTableContexts = { ...state.simTableContexts, [chapter]: key };
      patch.simTableNotices = { ...state.simTableNotices, [chapter]: true };
    }
  }
  if (
    state.simPredict &&
    (resetPrediction || !predictionIsCurrent(state.simPredict, chapter, values))
  )
    patch.simPredict = null;
  if (state.simReveal && (resetPrediction || state.simReveal.chapter !== chapter || state.simReveal.context !== predictionContextKey(chapter, values))) patch.simReveal = null;
  return patch;
}
