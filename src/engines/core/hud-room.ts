/** Pure HUD room policy. All dimensions are CSS pixels, never device models. */
export type LeftColumn = 'open' | 'compact' | 'collapsed';
export interface HudFolds {
  reader: boolean;
  panelsOpen: boolean;
  cardOpen: boolean;
  plateOpen: boolean;
  legendsOpen: boolean;
  leftColumn: LeftColumn;
}
export type HudOverrides = Partial<HudFolds>;
export interface FreeStage {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}
export interface HudMeasurements {
  top: number;
  bottom: number;
  left: { width: number; height: number; metadata: number };
  right: { width: number; height: number; legends: number; card: number };
  reader: number;
  /** Space between the viewport edge and the column's outer edge. */
  edge: number;
  tab: number;
}
export const OPEN_FOLDS: HudFolds = {
  reader: true,
  panelsOpen: true,
  cardOpen: true,
  plateOpen: true,
  legendsOpen: true,
  leftColumn: 'open',
};
export function usesReaderDrawer(width: number, height: number): boolean {
  return width < 1024 || (height > width && width < 1100);
}
export interface HudRoom {
  folds: HudFolds;
  readerWidth: number;
  drawer: boolean;
  /** Primary stage band, between the left column and reader, below topbar and above dock. */
  stage: FreeStage;
  meetsShare: boolean;
  steps: ('legends' | 'card' | 'metadata' | 'left' | 'reader-width')[];
}
export function solveHudRoom(viewport: { width: number; height: number }, sizes: HudMeasurements, manual: HudOverrides = {}): HudRoom {
  const { width: w, height: h } = viewport;
  const drawer = usesReaderDrawer(w, h);
  const folds: HudFolds = { ...OPEN_FOLDS, ...manual };
  let readerWidth = Math.max(340, sizes.reader);
  const steps: HudRoom['steps'] = [];
  const rect = (): FreeStage => {
    const left = folds.leftColumn === 'collapsed' ? sizes.tab : sizes.left.width;
    const leftHeight =
      folds.leftColumn === 'collapsed' ? 0 : sizes.left.height - (folds.leftColumn === 'compact' ? sizes.left.metadata : 0);
    const rightHeight = sizes.right.height - (folds.cardOpen ? 0 : sizes.right.card) - (folds.legendsOpen ? 0 : sizes.right.legends);
    const available = Math.max(0, h - sizes.top - sizes.bottom);
    // Corner stacks must fit above the dock. Folding legends/card and metadata
    // releases the vertical pressure before the whole column is folded.
    const pressure = Math.max(0, leftHeight - available, rightHeight - available);
    return {
      x0: sizes.edge + left,
      x1: Math.max(sizes.edge + left, w - sizes.edge - (drawer ? 0 : folds.reader ? readerWidth : sizes.tab)),
      y0: sizes.top,
      y1: Math.max(sizes.top, h - sizes.bottom - pressure),
    };
  };
  const fits = () => {
    const r = rect();
    return r.x1 - r.x0 >= w * 0.5 && r.y1 - r.y0 >= h * 0.6;
  };
  const attempt = (step: HudRoom['steps'][number], field: keyof HudFolds, apply: () => void) => {
    if (!fits() && manual[field] === undefined) {
      apply();
      steps.push(step);
    }
  };
  attempt('legends', 'legendsOpen', () => {
    folds.legendsOpen = false;
  });
  attempt('card', 'cardOpen', () => {
    folds.cardOpen = false;
  });
  attempt('metadata', 'leftColumn', () => {
    folds.leftColumn = 'compact';
  });
  attempt('left', 'leftColumn', () => {
    folds.leftColumn = 'collapsed';
  });
  if (!fits() && !drawer && folds.reader && readerWidth > 340) {
    readerWidth = 340;
    steps.push('reader-width');
  }
  return { folds, readerWidth, drawer, stage: rect(), meetsShare: fits(), steps };
}

/** Largest unobstructed rectangle within a stage.
 * Called on layout changes, not animation frames. Coordinates are stage-local. */
export function measureFreeStage(width: number, height: number, obstacles: readonly FreeStage[]): FreeStage {
  const blocks = obstacles.filter((r) => r.x1 > 0 && r.y1 > 0 && r.x0 < width && r.y0 < height);
  const xs = [...new Set([0, width, ...blocks.flatMap((r) => [Math.max(0, r.x0), Math.min(width, r.x1)])])].sort((a, b) => a - b);
  let best: FreeStage = { x0: 0, y0: 0, x1: 0, y1: 0 },
    area = -1;
  for (let i = 0; i < xs.length - 1; i++)
    for (let j = i + 1; j < xs.length; j++) {
      const x0 = xs[i]!,
        x1 = xs[j]!;
      const intervals = blocks.filter((r) => r.x0 < x1 && r.x1 > x0).sort((a, b) => a.y0 - b.y0);
      let y0 = 0;
      const consider = (y1: number) => {
        const next = (x1 - x0) * (y1 - y0);
        if (next > area) {
          area = next;
          best = { x0, y0, x1, y1 };
        }
      };
      for (const r of intervals) {
        consider(Math.max(0, r.y0));
        y0 = Math.max(y0, Math.min(height, r.y1));
      }
      consider(height);
    }
  return best;
}
