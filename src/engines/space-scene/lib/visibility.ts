/**
 * Which parts are shown, and how, for an Explorer state (pure, unit-tested).
 *
 *  - `layers`: a part whose group is not in `layers` is hidden.
 *    Layers always win, also for the selected part.
 *  - `isolate`: with a selection, only the selected part and the parts in its
 *    group are shown. Without a selection every part (in visible layers) shows.
 *  - `xray`: every part except the selected one is see-through (opacity 0.15,
 *    no depth write); the selected part stays solid.
 *  - otherwise parts are solid.
 */
import type { SpaceView } from '../schema';

export const XRAY_OPACITY = 0.15;

export interface PartRef {
  id: string;
  group: string;
}

export interface DisplayState {
  view: SpaceView;
  part: string | null;
  layers: readonly string[];
}

export interface PartDisplay {
  visible: boolean;
  /** Target opacity when visible (1 = solid). */
  opacity: number;
  selected: boolean;
  /** See-through: render without depth write. */
  ghost: boolean;
}

export function resolvePartDisplay(part: PartRef, state: DisplayState, parts: readonly PartRef[]): PartDisplay {
  const selectedPart = state.part ? parts.find((p) => p.id === state.part) ?? null : null;
  const selected = selectedPart !== null && selectedPart.id === part.id;
  let visible = state.layers.includes(part.group);
  if (visible && state.view === 'isolate' && selectedPart) {
    visible = selected || part.group === selectedPart.group;
  }
  const ghost = state.view === 'xray' && !selected;
  return { visible, opacity: ghost ? XRAY_OPACITY : 1, selected, ghost };
}

/** Display for every part, keyed by id. */
export function resolveAllPartDisplays(parts: readonly PartRef[], state: DisplayState): Map<string, PartDisplay> {
  return new Map(parts.map((p) => [p.id, resolvePartDisplay(p, state, parts)]));
}
