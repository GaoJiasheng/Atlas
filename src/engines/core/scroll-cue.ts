/** Scroll-cue arithmetic (pure): which ends of a scroller still hide content, and where to scroll to bring an item into view. */

/** Below this many CSS px of hidden content an end counts as reached (sub-pixel rounding, a browser's rubber band). */
const CUE_EPSILON = 2;

export interface ScrollMetrics {
  /** Scroll offset along the axis (`scrollTop` / `scrollLeft`). */
  offset: number;
  /** Visible size along the axis (`clientHeight` / `clientWidth`). */
  view: number;
  /** Content size along the axis (`scrollHeight` / `scrollWidth`). */
  content: number;
}

export function scrollCue({ offset, view, content }: ScrollMetrics): { start: boolean; end: boolean } {
  return { start: offset > CUE_EPSILON, end: content - view - offset > CUE_EPSILON };
}

/** The scroll offset that centres an item in its scroller, clamped to the range (a short list stays at 0). */
export function centredOffset(itemStart: number, itemSize: number, view: number, content: number): number {
  return Math.max(0, Math.min(content - view, itemStart + itemSize / 2 - view / 2));
}

/** How far the "more" control scrolls: most of a screenful, keeping one line of context. */
export function pageStep(view: number, lineHeight: number): number {
  return Math.max(lineHeight, view - lineHeight);
}
