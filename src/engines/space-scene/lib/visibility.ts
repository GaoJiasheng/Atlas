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
 *  - `solo` naming a part (SOLO in the inspector, docs/16 §6.1): that part,
 *    the parts it `connects` (a muscle's bones), shells and context parts stay;
 *    every other part is drawn faint.
 *  - `highlight` (signal / cold: part or group ids): the part's tint.
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
  connects?: readonly string[] | undefined;
}

export interface DisplayState {
  view: SpaceView;
  part: string | null;
  layers: readonly string[];
  /** Part ids put aside (chapter / beat `hide`). */
  hidden?: readonly string[];
  /** Group or part ids drawn faint (chapter / beat `ghost`). */
  ghosted?: readonly string[];
  /** Soloed group (every part outside it faint) or soloed part (see above). */
  solo?: string | null;
  /** Tints: part or group ids. */
  highlight?: { signal: readonly string[]; cold: readonly string[]; custom?: Readonly<Record<string, string>> | undefined } | null;
}

/** A highlight tint: signal, cold, or `custom` (the part's own colour ref in `PartDisplay.tintRef`). */
export type PartTint = 'signal' | 'cold' | 'custom' | null;

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
  /** Highlight tint. */
  tint: PartTint;
  /** With tint `custom`: the colour ref (`token:<name>` / `#hex`). */
  tintRef?: string;
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
  const soloPart = state.solo != null && !parts.some((p) => p.group === state.solo) ? parts.find((p) => p.id === state.solo) : undefined;
  const soloed = soloPart
    ? part.id === soloPart.id || (soloPart.connects?.includes(part.id) ?? false) || part.shell === true || part.context === true
    : state.solo != null && part.group === state.solo;
  let visible = part.group === undefined ? true : (soloed && !soloPart) || state.layers.includes(part.group);
  if (visible && state.view === 'isolate' && selectedPart) {
    visible = selected || (part.group !== undefined && part.group === selectedPart.group);
  }
  const names = (list: readonly string[] | undefined) =>
    list !== undefined && (list.includes(part.id) || (part.twinOf !== undefined && list.includes(part.twinOf)));
  const hidden = names(state.hidden);
  if (hidden) visible = false;
  const faint =
    !selected &&
    ((state.solo != null && !soloed && (part.group !== undefined || soloPart !== undefined || names(state.ghosted))) ||
      names(state.ghosted) ||
      (part.group !== undefined && (state.ghosted?.includes(part.group) ?? false)));
  const xray = state.view === 'xray' && !selected && (!shells || part.shell === true);
  const ghost = xray || faint;
  const opacity = faint ? GHOST_OPACITY : xray ? XRAY_OPACITY : 1;
  const lists = (ids: readonly string[] | undefined) => names(ids) || (part.group !== undefined && (ids?.includes(part.group) ?? false));
  const custom = state.highlight?.custom;
  const customRef = custom ? (custom[part.id] ?? (part.twinOf !== undefined ? custom[part.twinOf] : undefined) ?? (part.group !== undefined ? custom[part.group] : undefined)) : undefined;
  const tint: PartTint = lists(state.highlight?.signal) ? 'signal' : lists(state.highlight?.cold) ? 'cold' : customRef !== undefined ? 'custom' : null;
  return { visible, opacity, selected, ghost, hidden, selectable: part.context !== true && !faint, faint, tint, ...(tint === 'custom' ? { tintRef: customRef! } : {}) };
}

/** Display for every part, keyed by id. */
export function resolveAllPartDisplays(parts: readonly PartRef[], state: DisplayState): Map<string, PartDisplay> {
  const shells = hasShells(parts);
  return new Map(parts.map((p) => [p.id, resolvePartDisplay(p, state, parts, shells)]));
}
