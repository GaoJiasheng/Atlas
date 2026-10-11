/**
 * Home page (docs/08 §9 「首页」): pure helpers, no astro:content, so vitest can run them.
 *   - topicStats         the mono stats line of a plate card, counted from the topic's data
 *   - pickFeatured       which topics the frontispiece shows, in slot order
 *   - composeFrontispiece slot geometry (drawings, anchors, labels, leaders) for 1–5 drawings
 *   - catalogueLayout    one grid, or one section per subject once the catalogue is long
 */
import type { UiKey } from '../i18n';
import { SUBJECTS, type EngineId, type Subject } from '../content/schema/topic';
import manifest from './illustrations.json';

/* ------------------------------------------------------------------ */
/* Stats line                                                          */
/* ------------------------------------------------------------------ */

export interface StatItem {
  n: number;
  /** Plural UI key; the singular is `${key}.one`. */
  key: Extract<UiKey, `index.stats.${string}`>;
}

const len = (v: unknown): number => (Array.isArray(v) ? v.length : 0);
const field = (v: unknown, k: string): unknown => (v && typeof v === 'object' ? (v as Record<string, unknown>)[k] : undefined);

/**
 * Counts for a plate card, from the topic's raw `data/*.json` (keyed by file base name):
 * history maps (TimeScene) chapters · events · keyframes; object anatomy (SpaceScene)
 * chapters · parts; lessons (MathScene) steps · explanation beats · practice questions. Zero counts are dropped.
 */
export function topicStats(engine: EngineId, raw: Record<string, unknown>, chapters: number): StatItem[] {
  const out: StatItem[] = [];
  const add = (n: number, key: StatItem['key']) => {
    if (n > 0) out.push({ n, key });
  };
  switch (engine) {
    case 'time-scene':
      add(chapters, 'index.stats.chapters');
      add(len(raw.events), 'index.stats.events');
      add(len(field(raw.control, 'keyframes')), 'index.stats.keyframes');
      break;
    case 'space-scene':
      add(chapters, 'index.stats.chapters');
      add(len(field(raw.parts, 'parts')), 'index.stats.parts');
      break;
    case 'math-scene': {
      const steps = field(raw.lesson, 'steps');
      add(len(steps), 'index.stats.steps');
      add(Array.isArray(steps) ? steps.reduce((sum: number, s) => sum + len(field(s, 'beats')), 0) : 0, 'index.stats.beats');
      add(len(field(raw.lesson, 'practice')), 'index.stats.questions');
      break;
    }
    default:
      add(chapters, 'index.stats.chapters');
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Illustrations                                                       */
/* ------------------------------------------------------------------ */

export interface IllustrationMeta {
  /** 16 rows of 16 hex digits: alpha coverage per cell of the padded square, 0–f. */
  mask: string[];
}

const ILLUSTRATIONS = manifest as Record<string, IllustrationMeta>;

/** The processed drawing for a file stem, or null when it has not been made yet. */
export function illustrationMeta(stem: string | undefined, known: Record<string, IllustrationMeta> = ILLUSTRATIONS): IllustrationMeta | null {
  return (stem && known[stem]) || null;
}

/* ------------------------------------------------------------------ */
/* Featured                                                            */
/* ------------------------------------------------------------------ */

export const MAX_FEATURED = 5;

export interface FeatureCandidate {
  id: string;
  featured: boolean | number;
  hasIllustration: boolean;
}

/**
 * Frontispiece topics in slot order (largest first): featured ones with a drawing, ranked
 * numbers first, then `true` in catalogue order. With nothing featured, the first drawn
 * topics of the catalogue. At most five.
 */
export function pickFeatured<T extends FeatureCandidate>(topics: readonly T[], max = MAX_FEATURED): T[] {
  const drawn = topics.filter((t) => t.hasIllustration);
  const rank = (t: T) => (typeof t.featured === 'number' ? t.featured : t.featured ? 1000 : Infinity);
  const featured = drawn
    .map((t, i) => ({ t, i }))
    .filter(({ t }) => t.featured !== false)
    .sort((a, b) => rank(a.t) - rank(b.t) || a.i - b.i)
    .map(({ t }) => t);
  return (featured.length > 0 ? featured : drawn).slice(0, max);
}

/* ------------------------------------------------------------------ */
/* Frontispiece composition                                            */
/* ------------------------------------------------------------------ */

export type FrontLayout = 'wide' | 'narrow';

/** One designed slot, in composition units (the box is 1000 wide). */
interface SlotDef {
  /** Top-left of the (square) drawing box, and its side. */
  x: number;
  y: number;
  w: number;
  /** Degrees, ±3. */
  rot: number;
  /** Stacking order. */
  z: number;
  /** Where the leader should touch the drawing (fraction of the square); snapped onto ink. */
  anchor: [number, number];
  /** Label edge point: the underline's end nearest the drawing. `end` = text runs leftwards from x. */
  label: { x: number; y: number; align: 'start' | 'end' };
}

interface LayoutDef {
  height: number;
  /** slots[n - 1] = the arrangement for n drawings. */
  slots: SlotDef[][];
}

const s = (x: number, y: number, w: number, rot: number, z: number, anchor: [number, number], lx: number, ly: number, align: 'start' | 'end'): SlotDef => ({
  x,
  y,
  w,
  rot,
  z,
  anchor,
  label: { x: lx, y: ly, align },
});

/**
 * The designed arrangements. Largest drawing ≈ 55 % of the width; the others smaller and
 * overlapping a little; labels sit in the top and bottom bands so leaders stay short.
 */
export const FRONT_LAYOUTS: Record<FrontLayout, LayoutDef> = {
  wide: {
    height: 800,
    slots: [
      [s(190, 90, 620, -1.5, 2, [0.35, 0.45], 230, 50, 'start')],
      [s(40, 190, 560, -1.5, 3, [0.4, 0.55], 250, 780, 'start'), s(560, 60, 400, 2.5, 2, [0.6, 0.4], 960, 40, 'end')],
      [
        s(250, 190, 540, -1.5, 4, [0.5, 0.62], 520, 785, 'start'),
        s(30, 50, 330, 2.5, 3, [0.4, 0.42], 140, 34, 'start'),
        s(650, 60, 330, -3, 2, [0.6, 0.42], 970, 40, 'end'),
      ],
      [
        s(230, 170, 550, -1.5, 5, [0.62, 0.42], 620, 225, 'end'),
        s(10, 60, 320, 2.5, 3, [0.33, 0.45], 105, 40, 'start'),
        s(690, 50, 300, -3, 2, [0.55, 0.42], 985, 40, 'end'),
        s(690, 470, 300, 2, 4, [0.42, 0.62], 820, 790, 'start'),
      ],
      [
        s(225, 165, 550, -1.5, 5, [0.62, 0.42], 610, 215, 'end'),
        s(0, 40, 320, 2.5, 3, [0.33, 0.45], 95, 34, 'start'),
        s(690, 40, 300, -3, 2, [0.55, 0.42], 985, 34, 'end'),
        s(0, 470, 310, -2, 4, [0.38, 0.62], 130, 790, 'start'),
        s(705, 470, 290, 2, 4, [0.42, 0.62], 820, 790, 'start'),
      ],
    ],
  },
  narrow: {
    height: 800,
    slots: [
      [s(120, 100, 760, -1.5, 2, [0.35, 0.45], 230, 56, 'start')],
      [s(0, 200, 640, -1.5, 3, [0.42, 0.6], 280, 780, 'start'), s(500, 60, 480, 2.5, 2, [0.55, 0.42], 965, 52, 'end')],
    ],
  },
};

export const FRONT_WIDTH = 1000;
/** Most drawings a layout shows (the narrow one shows the first two). */
export const frontCapacity = (layout: FrontLayout) => FRONT_LAYOUTS[layout].slots.length;

export interface LabelText {
  /** Shown in small caps (English). */
  en: string;
  zh: string;
}

/** One featured topic as the frontispiece draws it. */
export interface FrontEntry {
  id: string;
  href: string;
  /** Image alt = the topic title. */
  alt: string;
  /** File stem under public/illustrations/. */
  stem: string;
  mask?: readonly string[];
  label: LabelText;
}

export interface FrontItem {
  x: number;
  y: number;
  w: number;
  rot: number;
  z: number;
  /** Leader end on the drawing, in composition units (rotation applied). */
  anchor: { x: number; y: number };
  label: { x: number; y: number; align: 'start' | 'end'; width: number };
  /** SVG path data: underline-edge → short tick → anchor. */
  leader: string;
}

export interface FrontComposition {
  width: number;
  height: number;
  items: FrontItem[];
}

/** Ink coverage threshold (of 15) for a mask cell to take a leader anchor. */
const INK = 7;

/** Snap a desired anchor (fraction of the square) to the nearest inked mask cell centre. */
export function snapAnchor(mask: readonly string[] | undefined, fx: number, fy: number): [number, number] {
  if (!mask || mask.length === 0) return [fx, fy];
  const n = mask.length;
  let best: [number, number] = [fx, fy];
  let bestD = Infinity;
  for (let r = 0; r < n; r++) {
    const row = mask[r] ?? '';
    for (let c = 0; c < row.length; c++) {
      if (parseInt(row[c] ?? '0', 16) < INK) continue;
      const cx = (c + 0.5) / row.length;
      const cy = (r + 0.5) / n;
      const d = (cx - fx) ** 2 + (cy - fy) ** 2;
      if (d < bestD) {
        bestD = d;
        best = [cx, cy];
      }
    }
  }
  return best;
}

/**
 * Estimated label width in composition units for a box of `boxPx` CSS px: the label is
 * IBM Plex Sans Condensed 11 px caps with .12em tracking, a " · " and the Chinese name.
 */
export function estimateLabelWidth(text: LabelText, boxPx: number): number {
  const latinPx = [...text.en].length * 11 * (0.56 + 0.12);
  const sepPx = 3 * 11 * 0.5;
  const cjkPx = [...text.zh].length * 12;
  return Math.ceil(((latinPx + sepPx + cjkPx) * FRONT_WIDTH) / boxPx);
}

const LABEL_ROW = 40;
const LABEL_GAP = 24;

/** Spread labels sharing a band so their estimated extents never overlap, keeping them inside the box. */
export function relaxLabels(labels: { x: number; y: number; align: 'start' | 'end'; width: number }[], width = FRONT_WIDTH): void {
  const span = (l: (typeof labels)[number]) => (l.align === 'start' ? [l.x, l.x + l.width] : [l.x - l.width, l.x]) as [number, number];
  for (let pass = 0; pass < 8; pass++) {
    let moved = false;
    for (let i = 0; i < labels.length; i++) {
      for (let j = i + 1; j < labels.length; j++) {
        const a = labels[i]!;
        const b = labels[j]!;
        if (Math.abs(a.y - b.y) >= LABEL_ROW) continue;
        const [a0, a1] = span(a);
        const [b0, b1] = span(b);
        const overlap = Math.min(a1, b1) - Math.max(a0, b0) + LABEL_GAP;
        if (overlap <= 0) continue;
        // Push apart along x, half each, the left one leftwards.
        const left = a0 <= b0 ? a : b;
        const right = left === a ? b : a;
        left.x -= overlap / 2;
        right.x += overlap / 2;
        moved = true;
      }
    }
    for (const l of labels) {
      const [l0, l1] = span(l);
      if (l0 < 0) l.x -= l0;
      if (l1 > width) l.x -= l1 - width;
    }
    if (!moved) break;
  }
}

/** Label height in CSS px (11.5 px caps + 5 px to the underline). */
const LABEL_PX = 18;

/**
 * Leader from the label's underline edge: a tick continuing the underline outwards (away
 * from the text), then straight to the anchor. A leader climbing from a bottom label gets
 * a tick long enough that the diagonal clears the text above the underline.
 */
export function leaderPath(label: { x: number; y: number; align: 'start' | 'end' }, anchor: { x: number; y: number }, textHeight: number): string {
  const dir = label.align === 'start' ? -1 : 1;
  let tick = 14;
  const rise = label.y - anchor.y;
  if (rise > textHeight) {
    // Inward offset of the anchor (negative = under the text), and the tick that keeps the line outside the text box.
    const out = dir * (anchor.x - label.x);
    const k = textHeight / rise;
    if (out < 0) tick = Math.min(64, Math.max(tick, (-out * k) / (1 - k) + 4));
  }
  const r = (v: number) => Math.round(v * 10) / 10;
  return `M${r(label.x)} ${r(label.y)}H${r(label.x + dir * tick)}L${r(anchor.x)} ${r(anchor.y)}`;
}

/** Geometry for `items` (≤ the layout's capacity; extra items are dropped). */
export function composeFrontispiece(
  items: readonly { mask?: readonly string[]; label: LabelText }[],
  layout: FrontLayout,
  boxPx = layout === 'wide' ? 660 : 360,
): FrontComposition {
  const def = FRONT_LAYOUTS[layout];
  const n = Math.min(items.length, def.slots.length);
  if (n === 0) return { width: FRONT_WIDTH, height: def.height, items: [] };
  const slots = def.slots[n - 1]!;
  const out: FrontItem[] = slots.slice(0, n).map((slot, i) => {
    const [fx, fy] = snapAnchor(items[i]!.mask, slot.anchor[0], slot.anchor[1]);
    // Rotate the anchor about the drawing centre, as CSS rotates the drawing.
    const cx = slot.x + slot.w / 2;
    const cy = slot.y + slot.w / 2;
    const dx = (fx - 0.5) * slot.w;
    const dy = (fy - 0.5) * slot.w;
    const a = (slot.rot * Math.PI) / 180;
    const anchor = { x: cx + dx * Math.cos(a) - dy * Math.sin(a), y: cy + dx * Math.sin(a) + dy * Math.cos(a) };
    return {
      x: slot.x,
      y: slot.y,
      w: slot.w,
      rot: slot.rot,
      z: slot.z,
      anchor,
      label: { ...slot.label, width: estimateLabelWidth(items[i]!.label, boxPx) },
      leader: '',
    };
  });
  relaxLabels(out.map((o) => o.label));
  const textHeight = (LABEL_PX * FRONT_WIDTH) / boxPx;
  for (const o of out) o.leader = leaderPath(o.label, o.anchor, textHeight);
  return { width: FRONT_WIDTH, height: def.height, items: out };
}

/* ------------------------------------------------------------------ */
/* Catalogue                                                           */
/* ------------------------------------------------------------------ */

/** Above this many topics the catalogue renders one section per subject. */
export const SECTION_THRESHOLD = 9;

export type Catalogue<T> = { mode: 'grid'; items: T[] } | { mode: 'sections'; sections: { subject: Subject; items: T[] }[] };

/** One grid, or (more than `threshold` topics) sections in SUBJECTS order, empty subjects left out. */
export function catalogueLayout<T extends { subject: Subject }>(topics: readonly T[], threshold = SECTION_THRESHOLD): Catalogue<T> {
  if (topics.length <= threshold) return { mode: 'grid', items: [...topics] };
  return {
    mode: 'sections',
    sections: SUBJECTS.map((subject) => ({ subject, items: topics.filter((t) => t.subject === subject) })).filter((g) => g.items.length > 0),
  };
}
