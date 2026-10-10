/**
 * Two-column leader labels (master-spec J) in the host's `leaders` SVG slot.
 *
 *  - label = number + EN name (bold) / 中文 / one-line note (the part's summary);
 *    left column right-aligned, right column left-aligned behind a small triangle
 *  - thin leader: label edge → short horizontal → straight run → hollow circle
 *    on the projected anchor (the part's bounds centre)
 *  - per rendered frame (stage bridge): only `transform` / `opacity` / `d` /
 *    `cx` / `cy` are written; sizes and the free band between the HUD's
 *    `[data-hud-panel]` blocks are measured on resize and when the label set
 *    changes
 *  - fades when the anchor is behind the camera, off-screen, cut away or
 *    occluded (throttled raycast in the stage); fewer labels in close-ups
 *  - set = the chapter's `labels`, else every visible part (largest first);
 *    the selected part is always labelled and highlighted
 *  - click / tap a label to select its part; hidden with the host's LABELS
 *    switch (L) and with the HUD
 */
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useHud, useScene, useSceneContext, useSceneStore } from '../../core/context';
import type { Chapter } from '../../core/types';
import { tx } from '../../../i18n';
import { resolveAllPartDisplays } from '../lib/visibility';
import { partBounds } from '../lib/parts';
import { labelBudget, stackColumn } from '../lib/schematic';
import type { SpaceSceneExt } from '../index';
import type { PartsFile } from '../schema';
import type { StageBridge } from '../bridge';
import { clip, partNumber } from './common';

interface LabelDom {
  g: SVGGElement;
  text: SVGTextElement;
  hit: SVGRectElement;
  tri: SVGPathElement;
  leader: SVGPathElement;
  dot: SVGCircleElement;
}

interface LabelState {
  dom: LabelDom;
  w: number;
  h: number;
  /** bbox.y of the text (top edge relative to the EN baseline). */
  top: number;
  side: 'L' | 'R' | null;
  y: number;
  vis: number;
}

interface Frame {
  /** Stage width and the free band for the columns, in stage pixels. */
  width: number;
  top: number;
  bottom: number;
  left: number;
  right: number;
  /** HUD blocks over the stage: anchors under them get no label. */
  rects: DOMRect[];
  ok: boolean;
}

const under = (rects: readonly DOMRect[], x: number, y: number) =>
  rects.some((r) => x >= r.left && x <= r.right && y >= r.top && y <= r.bottom);

const GAP = 8;
const HIT = 44;
const TRI = 8;
const FADE = 9;
/** Share of a part's on-screen radius a label column must stay clear of. */
const CLEARANCE = 0.6;
/** Free stage band (stage px) below which leader labels are limited to the selected part. */
const MIN_BAND = 480;

function priority(file: PartsFile): Map<string, number> {
  return new Map(
    file.parts.map((p) => {
      const b = partBounds(p);
      return [p.id, b ? Math.hypot(b.max[0] - b.min[0], b.max[1] - b.min[1], b.max[2] - b.min[2]) : 0.5] as [string, number];
    }),
  );
}

export function LeaderLabels({ file, chapters, bridge }: { file: PartsFile; chapters: readonly Chapter[]; bridge: StageBridge }) {
  const { locale } = useSceneContext();
  const store = useSceneStore<SpaceSceneExt>();
  const labelsOn = useHud((h) => h.labels && h.hud);
  const s = useScene<
    SpaceSceneExt,
    { part: string | null; view: SpaceSceneExt['view']; layers: string[]; hidden: string[]; chapter: string | null }
  >((st) => ({
    part: st.part,
    view: st.view,
    layers: st.layers,
    hidden: st.hidden,
    chapter: st.chapter,
  }));
  const sizes = useMemo(() => priority(file), [file]);
  const candidates = useMemo(() => {
    const displays = resolveAllPartDisplays(file.parts, { view: s.view, part: s.part, layers: s.layers, hidden: s.hidden });
    const listed = chapters.find((c) => c.id === s.chapter)?.state.labels;
    const pool = Array.isArray(listed) ? listed.filter((x): x is string => typeof x === 'string') : file.parts.map((p) => p.id);
    const labelled = (id: string) => displays.get(id)?.visible === true && displays.get(id)?.selectable === true;
    const ids = pool.filter(labelled).sort((a, b) => (sizes.get(b) ?? 0) - (sizes.get(a) ?? 0));
    if (s.part && labelled(s.part)) return [s.part, ...ids.filter((id) => id !== s.part)];
    return ids;
  }, [file.parts, chapters, s, sizes]);

  const root = useRef<SVGGElement>(null);
  const labels = useRef(new Map<string, LabelState>());
  const frame = useRef<Frame>({ width: 0, top: 0, bottom: 0, left: 0, right: 0, rects: [], ok: false });
  const clock = useRef(0);
  const colX = useRef({ L: 0, R: 0, init: false });
  const selected = s.part;

  const register = useCallback((id: string, dom: LabelDom | null) => {
    const map = labels.current;
    if (!dom) {
      map.delete(id);
      return;
    }
    const prev = map.get(id);
    map.set(id, prev ? { ...prev, dom } : { dom, w: 0, h: 0, top: 0, side: null, y: -1, vis: 0 });
  }, []);

  /* ---------------- measure (resize, label set, fonts) ---------------- */
  const measure = useCallback(() => {
    const g = root.current;
    const svg = g?.ownerSVGElement;
    const f = frame.current;
    if (!g || !svg) return;
    const box = svg.getBoundingClientRect();
    f.ok = box.width > 0 && box.height > 0;
    if (!f.ok) return;
    for (const l of labels.current.values()) {
      const b = l.dom.text.getBBox();
      l.w = b.width;
      l.h = b.height;
      l.top = b.y;
      const hh = Math.max(HIT, b.height + 8);
      l.dom.hit.setAttribute('y', String(b.y + b.height / 2 - hh / 2));
      l.dom.hit.setAttribute('height', String(hh));
      l.dom.hit.setAttribute('width', String(b.width + TRI + 8));
      l.side = null; // re-apply alignment
    }
    const W = box.width;
    const H = box.height;
    let top = 14;
    let bottom = H - 14;
    let left = 14;
    let right = W - 14;
    const scene = svg.closest('.atlas-scene') ?? document;
    const rects: DOMRect[] = [];
    // The overlay column is wider than its right-aligned cards: use the cards.
    const blocks = [...scene.querySelectorAll('[data-hud-panel]')].flatMap((el) =>
      el.getAttribute('data-hud-panel') === 'overlay' ? [...el.children] : [el],
    );
    for (const el of blocks) {
      const r = el.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) continue;
      if (r.right <= box.left || r.left >= box.right || r.bottom <= box.top || r.top >= box.bottom) continue;
      if (getComputedStyle(el).visibility === 'hidden') continue;
      rects.push(new DOMRect(r.left - box.left, r.top - box.top, r.width, r.height));
    }
    // Blocks across the middle at the bottom (panels, bar, reader sheet) close the band from below.
    for (const r of rects) if (r.top > H * 0.45 && r.left < W / 2 && r.right > W / 2) bottom = Math.min(bottom, r.top - 12);
    for (const r of rects) {
      if (r.top >= bottom || r.bottom <= top) continue;
      if (r.right < W / 2) left = Math.max(left, r.right + 18);
      else if (r.left > W / 2) right = Math.min(right, r.left - 18);
    }
    Object.assign(f, { width: W, top, bottom, left, right, rects });
    bridge.invalidate();
  }, [bridge]);

  useLayoutEffect(() => {
    measure();
  }, [measure, candidates, locale, labelsOn]);

  useEffect(() => {
    const svg = root.current?.ownerSVGElement;
    if (!svg) return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(svg);
    let alive = true;
    document.fonts?.ready.then(() => alive && measure());
    return () => {
      alive = false;
      ro.disconnect();
    };
  }, [measure, labelsOn]);

  /* ---------------- per-frame layout ---------------- */
  useEffect(() => {
    if (!labelsOn) return;
    const cols = { L: [] as [string, LabelState][], R: [] as [string, LabelState][] };
    const placed = new Set<string>();
    const layout = () => {
      const f = frame.current;
      const now = performance.now();
      const dt = clock.current ? Math.min(0.1, (now - clock.current) / 1000) : 0.016;
      clock.current = now;
      if (!f.ok) return;
      const map = labels.current;
      let wL = 0;
      let wR = 0;
      let sumH = 0;
      for (const l of map.values()) {
        wL = Math.max(wL, l.w);
        wR = Math.max(wR, l.w + TRI);
        sumH += l.h;
      }
      // Band between the HUD blocks too narrow to put columns beside the model (720p laptops): only the selected part is labelled.
      const roomy = f.right - f.left >= MIN_BAND;
      const twoCols = roomy && f.right - wR - (f.left + wL) > 60;
      const oneCol = roomy && !twoCols && f.right - f.left > wR + 140;
      const avgH = map.size ? sumH / map.size : 30;
      const perCol = Math.max(0, Math.floor((f.bottom - f.top + GAP) / (avgH + GAP)));
      const budget = roomy
        ? Math.min(labelBudget(bridge.modelRadius > 0 ? bridge.cameraDistance / bridge.modelRadius : 3), twoCols ? perCol * 2 : oneCol ? perCol : 0)
        : selected && perCol > 0
          ? 1
          : 0;
      const mid = (f.left + f.right) / 2;
      cols.L.length = 0;
      cols.R.length = 0;
      let count = 0;
      for (const id of candidates) {
        const l = map.get(id);
        const a = bridge.anchors.get(id);
        if (!l || !a || !a.shown || count >= budget || under(f.rects, a.x, a.y)) continue;
        let side: 'L' | 'R' = twoCols && a.x < mid ? 'L' : 'R';
        if (cols[side].length >= perCol) side = side === 'L' ? 'R' : 'L';
        if (cols[side].length >= perCol || (side === 'L' && !twoCols)) continue;
        // A column that cannot sit beside the part (narrow stage, e.g. 720p) would print over the model: skip it.
        const clear = side === 'L' ? f.left + wL <= a.x - a.r * CLEARANCE : f.right - wR >= a.x + a.r * CLEARANCE;
        if (!clear && id !== selected) continue;
        cols[side].push([id, l]);
        count++;
      }
      // Stack each column first (screen order, min gap, inside the band) ...
      const tops = { L: [] as number[], R: [] as number[] };
      for (const side of ['L', 'R'] as const) {
        const col = cols[side];
        col.sort((a, b) => (bridge.anchors.get(a[0])?.y ?? 0) - (bridge.anchors.get(b[0])?.y ?? 0));
        tops[side] = stackColumn(
          col.map(([id, l]) => (bridge.anchors.get(id)?.y ?? 0) - l.h * 0.5),
          col.map(([, l]) => l.h),
          f.top,
          f.bottom,
          GAP,
        );
      }
      // ... then place it just outside its anchors (leaders run inwards, never across
      // a label), clear of the HUD blocks beside its own rows, gliding as the camera moves.
      const bound = (side: 'L' | 'R') => {
        const col = cols[side];
        const t = tops[side];
        if (col.length === 0) return side === 'L' ? f.left : f.right;
        const y0 = t[0]!;
        const y1 = t[t.length - 1]! + col[col.length - 1]![1].h;
        let edge = side === 'L' ? 14 : f.width - 14;
        for (const r of f.rects) {
          if (r.bottom < y0 - 4 || r.top > y1 + 4 || r.top >= f.bottom) continue;
          if (side === 'L' && r.right < mid) edge = Math.max(edge, r.right + 18);
          if (side === 'R' && r.left > mid) edge = Math.min(edge, r.left - 18);
        }
        return edge;
      };
      let minL = Infinity;
      let maxR = -Infinity;
      // Columns clear the parts' silhouettes (anchor ∓ on-screen radius), not just their centres.
      for (const [id] of cols.L) minL = Math.min(minL, bridge.anchors.get(id)!.x - bridge.anchors.get(id)!.r);
      for (const [id] of cols.R) maxR = Math.max(maxR, bridge.anchors.get(id)!.x + bridge.anchors.get(id)!.r);
      const leftEdge = bound('L') + wL;
      const rightEdge = bound('R') - wR;
      const wantL = Math.min(Math.max(minL - 34, leftEdge), Math.max(leftEdge, mid - 10));
      const wantR = Math.max(Math.min(maxR + 34, rightEdge), Math.min(rightEdge, mid + 10));
      const cx = colX.current;
      const k = cx.init ? Math.min(1, dt * 6) : 1;
      if (Number.isFinite(wantL)) cx.L += (wantL - cx.L) * k;
      if (Number.isFinite(wantR)) cx.R += (wantR - cx.R) * k;
      cx.init = true;
      const xL = cx.L;
      const xR = cx.R;
      let moving = Math.abs(cx.L - wantL) > 0.5 || Math.abs(cx.R - wantR) > 0.5;
      placed.clear();
      for (const side of ['L', 'R'] as const) {
        const col = cols[side];
        col.forEach(([id, l], i) => {
          placed.add(id);
          const a = bridge.anchors.get(id)!;
          if (l.side !== side) {
            l.side = side;
            const anchor = side === 'L' ? 'end' : 'start';
            l.dom.text.setAttribute('text-anchor', anchor);
            for (const ts of l.dom.text.children) ts.setAttribute('x', side === 'L' ? '0' : String(TRI));
            l.dom.tri.style.display = side === 'L' ? 'none' : '';
            l.dom.hit.setAttribute('x', String(side === 'L' ? -l.w - 4 : -4));
            l.y = -1;
          }
          const target = tops[side][i]!;
          l.y = l.y < 0 ? target : l.y + (target - l.y) * Math.min(1, dt * 10);
          if (Math.abs(l.y - target) > 0.3) moving = true;
          const want = a.onScreen && (id === selected || !a.occluded) ? 1 : 0;
          l.vis += (want - l.vis) * Math.min(1, dt * FADE);
          if (Math.abs(want - l.vis) < 0.01) l.vis = want;
          else moving = true;
          const x = side === 'L' ? xL : xR;
          const baseline = l.y - l.top;
          const ly = l.y + Math.min(l.h * 0.22, -l.top * 0.7);
          // Leave from the label edge facing the anchor (never across the text).
          const far = side === 'L' ? a.x < x - l.w * 0.6 : a.x > x + TRI + l.w * 0.6;
          const out = side === 'L' ? (far ? -1 : 1) : far ? 1 : -1;
          const sx = side === 'L' ? (far ? x - l.w - 6 : x + 6) : far ? x + TRI + l.w + 6 : x - 6;
          const ex = sx + out * 16;
          l.dom.g.setAttribute('transform', `translate(${x.toFixed(1)} ${baseline.toFixed(1)})`);
          l.dom.g.style.opacity = l.vis.toFixed(3);
          l.dom.g.style.pointerEvents = l.vis > 0.5 ? '' : 'none';
          l.dom.leader.setAttribute('d', `M${sx.toFixed(1)} ${ly.toFixed(1)}H${ex.toFixed(1)}L${a.x.toFixed(1)} ${a.y.toFixed(1)}`);
          l.dom.leader.style.opacity = (l.vis * 0.9).toFixed(3);
          l.dom.dot.setAttribute('cx', a.x.toFixed(1));
          l.dom.dot.setAttribute('cy', a.y.toFixed(1));
          l.dom.dot.style.opacity = l.vis.toFixed(3);
        });
      }
      for (const [id, l] of map) {
        if (placed.has(id)) continue;
        if (l.vis > 0) {
          l.vis = Math.max(0, l.vis - dt * FADE * 0.6);
          moving = true;
        }
        l.dom.g.style.opacity = l.vis.toFixed(3);
        l.dom.g.style.pointerEvents = 'none';
        l.dom.leader.style.opacity = (l.vis * 0.9).toFixed(3);
        l.dom.dot.style.opacity = l.vis.toFixed(3);
      }
      if (moving) bridge.invalidate();
    };
    bridge.listeners.add(layout);
    bridge.invalidate();
    return () => {
      bridge.listeners.delete(layout);
    };
  }, [bridge, candidates, selected, labelsOn]);

  if (!labelsOn) return null;
  return (
    <g ref={root} className="space-leaders">
      {candidates.map((id) => {
        const part = file.parts.find((p) => p.id === id)!;
        return (
          <Label
            key={id}
            id={id}
            n={partNumber(file, id)}
            en={tx(part.name, 'en')}
            zh={tx(part.name, 'zh')}
            note={clip(tx(part.summary, locale), locale === 'zh' ? 18 : 34)}
            on={id === selected}
            register={register}
            onSelect={() => store.getState().patch({ part: id })}
          />
        );
      })}
    </g>
  );
}

function Label(props: {
  id: string;
  n: string;
  en: string;
  zh: string;
  note: string;
  on: boolean;
  register(id: string, dom: LabelDom | null): void;
  onSelect(): void;
}) {
  const g = useRef<SVGGElement>(null);
  const text = useRef<SVGTextElement>(null);
  const hit = useRef<SVGRectElement>(null);
  const tri = useRef<SVGPathElement>(null);
  const leader = useRef<SVGPathElement>(null);
  const dot = useRef<SVGCircleElement>(null);
  const { id, register } = props;
  useLayoutEffect(() => {
    register(id, { g: g.current!, text: text.current!, hit: hit.current!, tri: tri.current!, leader: leader.current!, dot: dot.current! });
    return () => register(id, null);
  }, [id, register]);
  return (
    <>
      <path ref={leader} className="space-co__leader" data-on={props.on || undefined} style={{ opacity: 0 }} />
      <circle ref={dot} className="space-co__dot" data-on={props.on || undefined} r={2.6} style={{ opacity: 0 }} />
      <g
        ref={g}
        className="space-co"
        data-on={props.on || undefined}
        style={{ opacity: 0 }}
        onClick={(e) => {
          e.stopPropagation();
          props.onSelect();
        }}
      >
        <rect ref={hit} className="space-co__hit" />
        <path ref={tri} className="space-co__tri" d="M0 -6.2L5 -3.1L0 0Z" />
        <text ref={text} className="space-co__text">
          <tspan className="space-co__en">
            <tspan className="space-co__n">{props.n} </tspan>
            {props.en.toUpperCase()}
          </tspan>
          <tspan className="space-co__zh" x={0} dy="1.5em" lang="zh-Hans">
            {props.zh}
          </tspan>
          <tspan className="space-co__note" x={0} dy="1.45em">
            {props.note}
          </tspan>
        </text>
      </g>
    </>
  );
}
