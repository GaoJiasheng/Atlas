/**
 * Leader labels on the map (docs/08 §5, skill master-spec J): highlighted
 * ids and events inside their time window get a placard (EN bold, Chinese,
 * one-line note) in one of two aligned columns at the edges of the free stage
 * band, with a hairline leader: label edge → short horizontal → straight run
 * → hollow anchor circle at the projected lon/lat.
 *
 *  - HTML placards live in `labelRoot` (over the map canvas); leader paths
 *    and anchors are portaled into the host `leaders` <svg>.
 *  - `update()` runs on every map render frame and only writes transforms,
 *    opacity and SVG attributes. Sizes and HUD panel rects are measured in
 *    `relayout()` (resize, new items, a slow interval), never per frame.
 *  - Columns avoid each other by projected y (sort + minimum gap), stay inside
 *    the band left free by `[data-hud-panel]` blocks, and a placard that would
 *    still touch a panel is hidden. Anchors off the stage fade out.
 *  - Visibility follows the host switches through CSS
 *    (`data-labels="off"`, `data-hud="off"`).
 */
import type { Map as MlMap } from 'maplibre-gl';
import { projectNearCentre, type LngLat } from '../../lib/geo';

export interface LeaderItem {
  /** Unique key (`event:sample-meeting`). */
  key: string;
  /** Data id passed to `onSelect`. */
  id: string;
  kind: 'event' | 'movement' | 'entity';
  en: string;
  zh: string;
  /** One-line note (summary); `date` is shown before it in mono. */
  note: string;
  date?: string;
  at: LngLat;
  /** Highlighted by the chapter or the user. */
  pinned: boolean;
  /** Placard is a button (events open the inspector). */
  clickable: boolean;
}

export interface LeaderSystem {
  setItems(items: LeaderItem[]): void;
  setSvg(svg: SVGSVGElement | null): void;
  /** Re-project anchors and place placards (cheap; every map render). */
  update(): void;
  /** Re-measure placards and HUD panels. */
  relayout(): void;
  /** Viewport rects of the placards on show and of the HUD panels over the stage (place labels yield to both). */
  rects(): DOMRect[];
  destroy(): void;
}

const SVG_NS = 'http://www.w3.org/2000/svg';
const MAX_ITEMS = 8;
/** Design px (× --u). */
const GAP = 8;
const EDGE = 22;
const ELBOW = 14;
const MIN_COL = 120;
const MAX_COL = 210;
const SIDE_HYSTERESIS = 40;

interface Entry {
  item: LeaderItem;
  el: HTMLElement;
  path: SVGPathElement;
  dot: SVGCircleElement;
  w: number;
  h: number;
  side: 'L' | 'R' | null;
  /** The anchor lies outside the column, so the placard can sit level with it. */
  clear: boolean;
  sx: number;
  sy: number;
}

/** Free stage band between the HUD blocks, in container px. */
export interface Band {
  left: number;
  right: number;
  top: number;
  bottom: number;
  /** Visible `[data-hud-panel]` rects over the stage. */
  obstacles: DOMRect[];
  /** HUD design pixel (`--kt`). */
  u: number;
  /** Offset from the container to the leaders <svg>. */
  ox: number;
  oy: number;
}

export function intersects(a: { x: number; y: number; w: number; h: number }, r: DOMRect): boolean {
  return a.x < r.right && a.x + a.w > r.left && a.y < r.bottom && a.y + a.h > r.top;
}

export function createLeaders(options: {
  map: MlMap;
  container: HTMLElement;
  labelRoot: HTMLElement;
  onSelect(id: string): void;
  /** Called after every re-measure (the controller places the scale bar). */
  onBand?(band: Band): void;
  /** Which `[data-hud-panel]` blocks count as obstacles (default all). PRESENTATION ignores the HUD panels that are still fading out. */
  panelFilter?(panel: Element): boolean;
}): LeaderSystem {
  const { map, container, labelRoot } = options;
  const entries = new Map<string, Entry>();
  let svg: SVGSVGElement | null = null;
  let group: SVGGElement | null = null;
  let band: Band | null = null;
  /** Viewport rects of the HUD panels over the stage, from the last measure. */
  let panelRects: DOMRect[] = [];
  const observed = new Set<Element>();
  let destroyed = false;

  const resizeObserver = new ResizeObserver(() => relayout());
  resizeObserver.observe(container);
  const timer = setInterval(() => relayout(), 1000);

  const ensureGroup = () => {
    if (!svg) return null;
    if (!group || group.ownerSVGElement !== svg) {
      group = document.createElementNS(SVG_NS, 'g');
      group.setAttribute('class', 'ts-leaders');
      svg.appendChild(group);
      for (const e of entries.values()) group.append(e.path, e.dot);
    }
    return group;
  };

  const build = (item: LeaderItem): Entry => {
    const el = document.createElement(item.clickable ? 'button' : 'div');
    el.className = 'ts-co ts-label';
    if (item.clickable) {
      (el as HTMLButtonElement).type = 'button';
      el.addEventListener('click', (ev) => {
        options.onSelect(item.id);
        // Keep keys working after a pointer click (the stage is a `data-keys="own"` region).
        if ((ev as MouseEvent).detail > 0) el.blur();
      });
    }
    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('class', 'ts-leader');
    const dot = document.createElementNS(SVG_NS, 'circle');
    dot.setAttribute('class', 'ts-leader__dot');
    dot.setAttribute('r', '3');
    labelRoot.appendChild(el);
    ensureGroup()?.append(path, dot);
    return { item, el, path, dot, w: 0, h: 0, side: null, clear: true, sx: 0, sy: 0 };
  };

  const fill = (e: Entry) => {
    const { item, el } = e;
    el.dataset.kind = item.kind;
    el.dataset.id = item.id;
    el.dataset.pinned = String(item.pinned);
    el.setAttribute('aria-label', `${item.en}${item.zh ? ` · ${item.zh}` : ''}`);
    el.replaceChildren();
    const en = document.createElement('b');
    en.className = 'ts-co__en';
    en.lang = 'en';
    en.textContent = item.en;
    el.appendChild(en);
    if (item.zh && item.zh !== item.en) {
      const zh = document.createElement('span');
      zh.className = 'ts-co__zh';
      zh.lang = 'zh-Hans';
      zh.textContent = item.zh;
      el.appendChild(zh);
    }
    const note = document.createElement('span');
    note.className = 'ts-co__note';
    if (item.date) {
      const date = document.createElement('i');
      date.textContent = item.date;
      note.appendChild(date);
    }
    note.append(item.note);
    el.appendChild(note);
    e.path.dataset.pinned = String(item.pinned);
  };

  const signature = (i: LeaderItem) => `${i.en}|${i.zh}|${i.note}|${i.date ?? ''}|${i.pinned}|${i.clickable}`;
  const sigs = new Map<string, string>();

  function setItems(items: LeaderItem[]) {
    const chosen = [...items].sort((a, b) => Number(b.pinned) - Number(a.pinned)).slice(0, MAX_ITEMS);
    const keep = new Set(chosen.map((i) => i.key));
    for (const [key, e] of entries) {
      if (keep.has(key)) continue;
      e.el.remove();
      e.path.remove();
      e.dot.remove();
      entries.delete(key);
      sigs.delete(key);
    }
    let changed = false;
    for (const item of chosen) {
      let e = entries.get(item.key);
      if (e && e.item.clickable !== item.clickable) {
        e.el.remove();
        e.path.remove();
        e.dot.remove();
        entries.delete(item.key);
        e = undefined;
      }
      if (!e) {
        e = build(item);
        entries.set(item.key, e);
      }
      e.item = item;
      const sig = signature(item);
      if (sigs.get(item.key) !== sig) {
        sigs.set(item.key, sig);
        fill(e);
        changed = true;
      }
    }
    if (changed) relayout();
    else update();
  }

  function measureBand(): Band {
    const c = container.getBoundingClientRect();
    const scene = container.closest('.atlas-scene');
    const kt = Number.parseFloat(scene ? getComputedStyle(scene).getPropertyValue('--kt') : '') || 1;
    const svgRect = svg?.getBoundingClientRect();
    let left = 0;
    let right = c.width;
    let bottom = c.height;
    const obstacles: DOMRect[] = [];
    const panels: DOMRect[] = [];
    for (const el of scene ? scene.querySelectorAll('[data-hud-panel]') : []) {
      if (options.panelFilter && !options.panelFilter(el)) continue;
      if (!observed.has(el)) {
        observed.add(el);
        resizeObserver.observe(el);
      }
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      if (r.right <= c.left || r.left >= c.right || r.bottom <= c.top || r.top >= c.bottom) continue;
      const style = getComputedStyle(el);
      if (style.visibility === 'hidden' || style.display === 'none') continue;
      panels.push(r);
      const local = new DOMRect(r.left - c.left, r.top - c.top, r.width, r.height);
      obstacles.push(local);
      if (local.top > c.height * 0.55) bottom = Math.min(bottom, local.top);
      else if (local.left + local.width / 2 < c.width / 2) left = Math.max(left, local.right);
      else right = Math.min(right, local.left);
    }
    panelRects = panels;
    return {
      left: left + EDGE * kt,
      right: right - EDGE * kt,
      top: 14 * kt,
      bottom: bottom - 12 * kt,
      obstacles,
      u: kt,
      ox: svgRect ? c.left - svgRect.left : 0,
      oy: svgRect ? c.top - svgRect.top : 0,
    };
  }

  function relayout() {
    if (destroyed) return;
    band = measureBand();
    options.onBand?.(band);
    // Placards never get wider than their column (two columns when there is room, else one).
    const room = band.right - band.left;
    const gap = GAP * band.u;
    const twoColumns = room >= 2 * MIN_COL * band.u + 6 * gap;
    const cap = Math.max(MIN_COL * band.u, Math.min(MAX_COL * band.u, twoColumns ? room / 2 - 3 * gap : room - 2 * gap));
    for (const e of entries.values()) e.el.style.maxWidth = `${cap.toFixed(0)}px`;
    for (const e of entries.values()) {
      e.w = e.el.offsetWidth;
      e.h = e.el.offsetHeight;
    }
    update();
  }

  const hide = (e: Entry) => {
    e.el.style.opacity = '0';
    e.el.dataset.hidden = 'true';
    e.path.setAttribute('opacity', '0');
    e.dot.setAttribute('opacity', '0');
  };

  function update() {
    if (destroyed || !band || entries.size === 0) return;
    const b = band;
    const width = container.clientWidth;
    const height = container.clientHeight;
    const room = b.right - b.left;
    const twoColumns = room >= 2 * MIN_COL * b.u + 6 * GAP * b.u;
    const oneColumn = room >= MIN_COL * b.u + 2 * GAP * b.u;
    const colW = Math.max(...[...entries.values()].map((e) => e.w), MIN_COL * b.u);
    const mid = (b.left + b.right) / 2;
    const xL = b.left + colW;
    const xR = b.right - colW;

    const cols: Record<'L' | 'R', Entry[]> = { L: [], R: [] };
    for (const e of entries.values()) {
      // The world copy the camera is looking at (a path across the antimeridian sits in the neighbouring copy).
      const p = projectNearCentre((q) => map.project(q), e.item.at, width / 2);
      e.sx = p.x;
      e.sy = p.y;
      const onStage = p.x >= 0 && p.x <= width && p.y >= 0 && p.y <= height;
      if (!onStage || !oneColumn) {
        hide(e);
        e.side = null;
        continue;
      }
      let side: 'L' | 'R' = !twoColumns ? 'R' : p.x < mid ? 'L' : 'R';
      if (twoColumns && e.side && e.side !== side && Math.abs(p.x - mid) < SIDE_HYSTERESIS * b.u) side = e.side;
      // An anchor under its column (narrow bands) moves to the other column if that one is clear of it.
      const clear = (s: 'L' | 'R') => (s === 'L' ? p.x >= xL + ELBOW * b.u : p.x <= xR - ELBOW * b.u);
      if (twoColumns && !clear(side) && clear(side === 'L' ? 'R' : 'L')) side = side === 'L' ? 'R' : 'L';
      e.side = side;
      e.clear = clear(side);
      cols[side].push(e);
    }

    const gap = GAP * b.u;
    for (const side of ['L', 'R'] as const) {
      const col = cols[side].sort((a, z) => a.sy - z.sy);
      // Beside the anchor when it is clear of the column, else just below it (never on top of it).
      const ys = col.map((e) => Math.min(Math.max(e.clear ? e.sy - e.h * 0.35 : e.sy + ELBOW * b.u, b.top), b.bottom - e.h));
      for (let i = 1; i < col.length; i++) ys[i] = Math.max(ys[i]!, ys[i - 1]! + col[i - 1]!.h + gap);
      for (let i = col.length - 1; i >= 0; i--) {
        const limit = i === col.length - 1 ? b.bottom - col[i]!.h : ys[i + 1]! - col[i]!.h - gap;
        ys[i] = Math.min(ys[i]!, limit);
      }
      col.forEach((e, i) => {
        const y = ys[i]!;
        const x = side === 'L' ? xL - e.w : xR;
        const box = { x, y, w: e.w, h: e.h };
        if (y < b.top - 1 || b.obstacles.some((r) => intersects(box, r))) {
          hide(e);
          return;
        }
        e.el.dataset.side = side;
        e.el.dataset.hidden = 'false';
        e.el.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px)`;
        e.el.style.opacity = '1';
        const ly = y + Math.min(e.h / 2, 9 * b.u);
        const lx = side === 'L' ? xL + 3 * b.u : xR - 3 * b.u;
        const ex = lx + (side === 'L' ? ELBOW : -ELBOW) * b.u;
        const ax = e.sx + b.ox;
        const ay = e.sy + b.oy;
        e.path.setAttribute(
          'd',
          `M${(lx + b.ox).toFixed(1)} ${(ly + b.oy).toFixed(1)}H${(ex + b.ox).toFixed(1)}L${ax.toFixed(1)} ${ay.toFixed(1)}`,
        );
        e.path.setAttribute('opacity', '1');
        e.dot.setAttribute('cx', ax.toFixed(1));
        e.dot.setAttribute('cy', ay.toFixed(1));
        e.dot.setAttribute('opacity', '1');
      });
    }
  }

  return {
    setItems,
    setSvg(next) {
      if (next === svg) return;
      group?.remove();
      group = null;
      svg = next;
      ensureGroup();
      relayout();
    },
    update,
    relayout,
    rects() {
      const out: DOMRect[] = [...panelRects];
      for (const e of entries.values()) if (e.el.dataset.hidden === 'false') out.push(e.el.getBoundingClientRect());
      return out;
    },
    destroy() {
      destroyed = true;
      clearInterval(timer);
      resizeObserver.disconnect();
      for (const e of entries.values()) e.el.remove();
      group?.remove();
      entries.clear();
    },
  };
}
