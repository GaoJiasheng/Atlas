/**
 * Which parts are shown, and how, for an Explorer state (pure, unit-tested).
 *
 *  - `layers`: a part whose group is not in `layers` is hidden.
 *    Layers always win, also for the selected part. Context parts without a
 *    group ignore layers.
 *  - `isolate`: with a selection, only the selected part and the parts in its
 *    group are shown. Without a selection every part (in visible layers) shows.
 *  - `hidden`: parts put aside by the chapter / beat (`hide`) are not shown;
 *    `hidden: true` tells the stage to slide them out before fading.
 *  - `xray`: see-through parts (opacity 0.15, no depth write) are the parts
 *    flagged `shell` when the topic has any, else every part except the
 *    selected one; the selected part always stays solid.
 *  - otherwise parts are solid.
 *  - `ghosted` (chapter / beat `ghost`: group or part ids) and `solo` (one
 *    group soloed from the control panel: every other part): drawn faint
 *    (opacity 0.12, no depth write), never picked or labelled; the selected
 *    part stays solid. A soloed group shows even when its layer is off.
 *  - a bilateral pair: `hide` / `ghost` naming the data part (`<id>`) cover its
 *    twin (`<id>-r`) too; naming the twin covers the twin only.
 *  - `context` parts (scenery) are never selectable.
 */
import type { SpaceView } from '../schema';

export const XRAY_OPACITY = 0.15;
/** Opacity of parts drawn faint (`ghost`, solo). */
export const GHOST_OPACITY = 0.12;

export interface PartRef {
  id: string;
  group?: string | undefined;
  shell?: boolean | undefined;
  context?: boolean | undefined;
  /** A bilateral twin: the part it mirrors. */
  twinOf?: string | undefined;
}

export interface DisplayState {
  view: SpaceView;
  part: string | null;
  layers: readonly string[];
  /** Part ids put aside (chapter / beat `hide`). */
  hidden?: readonly string[];
  /** Group or part ids drawn faint (chapter / beat `ghost`). */
  ghosted?: readonly string[];
  /** Soloed group: every part outside it is drawn faint. */
  solo?: string | null;
}

export interface PartDisplay {
  visible: boolean;
  /** Target opacity when visible (1 = solid). */
  opacity: number;
  selected: boolean;
  /** See-through: render without depth write. */
  ghost: boolean;
  /** Put aside by `hide` (the stage slides it out, then fades it). */
  hidden: boolean;
  /** Can be picked / labelled (false for context parts and faint ones). */
  selectable: boolean;
  /** Drawn faint (`ghost` / solo). */
  faint: boolean;
}

/** Whether a part list uses the `shell` flag (then X-RAY ghosts only shells). */
export function hasShells(parts: readonly PartRef[]): boolean {
  return parts.some((p) => p.shell === true);
}

export function resolvePartDisplay(
  part: PartRef,
  state: DisplayState,
  parts: readonly PartRef[],
  shells = hasShells(parts),
): PartDisplay {
  const selectedPart = state.part ? parts.find((p) => p.id === state.part && !p.context) ?? null : null;
  const selected = selectedPart !== null && selectedPart.id === part.id;
  const soloed = state.solo != null && part.group === state.solo;
  let visible = part.group === undefined ? true : soloed || state.layers.includes(part.group);
  if (visible && state.view === 'isolate' && selectedPart) {
    visible = selected || (part.group !== undefined && part.group === selectedPart.group);
  }
  const names = (list: readonly string[] | undefined) =>
    list !== undefined && (list.includes(part.id) || (part.twinOf !== undefined && list.includes(part.twinOf)));
  const hidden = names(state.hidden);
  if (hidden) visible = false;
  const faint =
    !selected &&
    ((state.solo != null && !soloed && (part.group !== undefined || names(state.ghosted))) ||
      names(state.ghosted) ||
      (part.group !== undefined && (state.ghosted?.includes(part.group) ?? false)));
  const xray = state.view === 'xray' && !selected && (!shells || part.shell === true);
  const ghost = xray || faint;
  const opacity = faint ? GHOST_OPACITY : xray ? XRAY_OPACITY : 1;
  return { visible, opacity, selected, ghost, hidden, selectable: part.context !== true && !faint, faint };
}

/** Display for every part, keyed by id. */
export function resolveAllPartDisplays(parts: readonly PartRef[], state: DisplayState): Map<string, PartDisplay> {
  const shells = hasShells(parts);
  return new Map(parts.map((p) => [p.id, resolvePartDisplay(p, state, parts, shells)]));
}
