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
 *  - Placement is lib/leader-layout.ts: two columns near their anchors, a
 *    placard far from its column pulled in beside its anchor, level with it as
 *    far as stacking allows and clear of `[data-hud-panel]` blocks; one that
 *    finds no room is hidden. Anchors off the stage fade out.
 *  - Visibility follows the host switches through CSS
 *    (`data-labels="off"`, `data-hud="off"`).
 */
import type { Map as MlMap } from 'maplibre-gl';
import type { LngLat } from '../../lib/geo';
import { displayOffsetScale, eventDisplayPoint, type DisplayOffset } from '../../lib/event-display';
import { placeLeaders } from '../../lib/leader-layout';

export interface LeaderItem {
  /** Unique key (`event:sample-meeting`). */
  key: string;
  /** Data id passed to `onSelect`. */
  id: string;
  kind: 'event' | 'movement' | 'entity';
  badge?: string;
  en: string;
  zh: string;
  /** One-line note (summary); `date` is shown before it in mono. */
  note: string;
  date?: string;
  at: LngLat;
  displayOffset?: DisplayOffset;
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
  /** Container-local boxes of the placards on show, from the last placement (no layout read). */
  boxes(): { x: number; y: number; w: number; h: number }[];
  /** Container-local anchors of the placards on show (territory names keep off them). */
  anchors(): { x: number; y: number }[];
  /** English names on the placards on show (a territory name would only repeat them). */
  named(): string[];
  /** The last measured free band (null before the first measure). */
  band(): Band | null;
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

interface Entry {
  item: LeaderItem;
  el: HTMLElement;
  path: SVGPathElement;
  dot: SVGCircleElement;
  w: number;
  h: number;
  side: 'L' | 'R' | null;
  sx: number;
  sy: number;
  /** Placed box (container px), when shown. */
  box: { x: number; y: number; w: number; h: number } | null;
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
  // MapLibre listens for pan / pinch on its canvas container. Keeping the
  // placards inside it lets native gestures start and finish on a label,
  // including the mouseup that ends a drag begun on the bare map.
  const labelParent = labelRoot.parentNode;
  const labelNext = labelRoot.nextSibling;
  const canvasContainer = map.getCanvasContainer();
  canvasContainer.appendChild(labelRoot);
  // A drag suppresses click, so release pointer focus here as well. Keyboard
  // focus stays on the placard until a pointer is used (Enter / Space still select).
  const releasePointerFocus = () => {
    const focused = document.activeElement;
    if (focused instanceof HTMLElement && labelRoot.contains(focused)) focused.blur();
  };
  canvasContainer.addEventListener('pointerup', releasePointerFocus);
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
        // A label selects its own event, rather than a map feature beneath it.
        // Down / move / up still bubble so MapLibre can pan and suppress clicks
        // after a drag, using the same threshold as the rest of the map.
        ev.stopPropagation();
        options.onSelect(item.id);
        // Touch compatibility mouse events may focus after pointerup.
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
    return { item, el, path, dot, w: 0, h: 0, side: null, sx: 0, sy: 0, box: null };
  };

  const fill = (e: Entry) => {
    const { item, el } = e;
    el.dataset.kind = item.kind;
    el.dataset.id = item.id;
    el.dataset.pinned = String(item.pinned);
    el.setAttribute('aria-label', `${item.badge ? `${item.badge} · ` : ''}${item.en}${item.zh ? ` · ${item.zh}` : ''}`);
    el.replaceChildren();
    if (item.badge) {
      const badge = document.createElement('span');
      badge.className = 'ts-co__badge';
      badge.textContent = item.badge;
      el.appendChild(badge);
    }
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

  const signature = (i: LeaderItem) => `${i.badge ?? ''}|${i.en}|${i.zh}|${i.note}|${i.date ?? ''}|${i.pinned}|${i.clickable}`;
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
    e.box = null;
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
    const scale = displayOffsetScale(map.getZoom());
    for (const e of entries.values()) {
      // The world copy the camera is looking at (a path across the antimeridian sits in the neighbouring copy).
      const p = eventDisplayPoint((q) => map.project(q), e.item, width / 2, scale);
      e.sx = p.x;
      e.sy = p.y;
    }
    const slots = placeLeaders(
      [...entries.values()].map((e) => ({ key: e.item.key, w: e.w, h: e.h, sx: e.sx, sy: e.sy, side: e.side })),
      { left: b.left, right: b.right, top: b.top, bottom: b.bottom, u: b.u, obstacles: b.obstacles.map((r) => ({ x: r.x, y: r.y, w: r.width, h: r.height })) },
      width,
      height,
    );
    for (const e of entries.values()) {
      const slot = slots.get(e.item.key);
      if (!slot) {
        hide(e);
        e.side = null;
        continue;
      }
      const { side, x, y } = slot;
      e.side = side;
      e.box = { x, y, w: e.w, h: e.h };
      e.el.dataset.side = side;
      e.el.dataset.hidden = 'false';
      e.el.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px)`;
      e.el.style.opacity = '1';
      const ly = y + Math.min(e.h / 2, 9 * b.u);
      const lx = side === 'L' ? x + e.w + 3 * b.u : x - 3 * b.u;
      const ex = lx + (side === 'L' ? ELBOW : -ELBOW) * b.u;
      const ax = e.sx + b.ox;
      const ay = e.sy + b.oy;
      e.path.setAttribute('d', `M${(lx + b.ox).toFixed(1)} ${(ly + b.oy).toFixed(1)}H${(ex + b.ox).toFixed(1)}L${ax.toFixed(1)} ${ay.toFixed(1)}`);
      e.path.setAttribute('opacity', '1');
      e.dot.setAttribute('cx', ax.toFixed(1));
      e.dot.setAttribute('cy', ay.toFixed(1));
      e.dot.setAttribute('opacity', '1');
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
    boxes() {
      const out: { x: number; y: number; w: number; h: number }[] = [];
      for (const e of entries.values()) if (e.box) out.push(e.box);
      return out;
    },
    anchors() {
      return [...entries.values()].filter((e) => e.box).map((e) => ({ x: e.sx, y: e.sy }));
    },
    named() {
      return [...entries.values()].filter((e) => e.box).map((e) => e.item.en);
    },
    band: () => band,
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
      canvasContainer.removeEventListener('pointerup', releasePointerFocus);
      if (labelParent) labelParent.insertBefore(labelRoot, labelNext);
    },
  };
}
