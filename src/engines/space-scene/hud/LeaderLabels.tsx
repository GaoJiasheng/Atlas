/**
 * Leader labels (master-spec J) in the host's `leaders` SVG slot.
 *
 *  - label = number + EN name (bold) / 中文 / one-line note (the part's summary);
 *    left-hand placards set right, right-hand ones set left behind a small triangle
 *  - thin leader: label edge → short horizontal → straight run → hollow circle
 *    on the projected anchor (the part's bounds centre; a pipe's path midpoint)
 *  - placement (`lib/leader-layout.ts`, the rules of TimeScene's map leaders):
 *    two aligned columns at the free band's edges (no further out than 22 % /
 *    78 % of the stage, moving in towards their anchors), each placard on its
 *    anchor's side and as level with it as stacking allows, clear of the HUD
 *    blocks and of the labelled parts' screen boxes; placards may sit over the
 *    model where no labelled part is (then a paper plate backs the text)
 *  - per rendered frame (stage bridge): only `transform` / `opacity` / `d` /
 *    `cx` / `cy` are written; sizes and the `[data-hud-panel]` blocks are
 *    measured on resize and when the label set changes
 *  - fades when the anchor is behind the camera, off-screen, cut away or
 *    occluded (throttled raycast in the stage, for the labelled parts only);
 *    fewer labels in close-ups
 *  - set = the chapter's `labels`, else every visible part (largest first);
 *    the selected part is always labelled and highlighted. A `group:<id>`
 *    entry is one placard for the whole group (group name, anchored at the
 *    bounding centre of its visible parts)
 *  - PRESENTATION: the beat's `labels` (else the chapter's) only, at most 6,
 *    20 % larger, not capped by camera distance, and shown with the HUD
 *    hidden (they keep clear of the caption card and the title block only)
 *  - click / tap a label to select its part; hidden with the host's LABELS
 *    switch (L) and with the HUD (outside the presentation)
 *  - each placard carries `data-id`; the group carries `data-want` (the
 *    listed labels, when there is a list) for `pnpm shoot`'s label check
 */
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useStore } from 'zustand';
import { useHud, useScene, useSceneContext, useSceneStore } from '../../core/context';
import type { Chapter } from '../../core/types';
import { tx } from '../../../i18n';
import { resolveAllPartDisplays } from '../lib/visibility';
import { partBounds } from '../lib/parts';
import { labelBudget } from '../lib/schematic';
import { layoutLeaders, type LeaderFrame, type LeaderItem, type ScreenRect, type Side } from '../lib/leader-layout';
import { groupLabelId, labelGroup, listedLabels, PRESENT_LABEL_CAP } from '../lib/labels';
import type { SpaceSceneExt } from '../index';
import type { PartsFile } from '../schema';
import type { ScreenAnchor, StageBridge } from '../bridge';
import type { SpaceUiStore } from '../ui';
import { clip, partNumber } from './common';

interface LabelDom {
  g: SVGGElement;
  text: SVGTextElement;
  hit: SVGRectElement;
  plate: SVGRectElement;
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
  side: Side | null;
  /** Placard box left / top edge on show (glides towards its place). */
  x: number;
  y: number;
  vis: number;
  /** The paper plate is on (the placard lies over the model). */
  plate: boolean;
}

interface Frame extends LeaderFrame {
  /** HUD blocks over the stage (placards keep clear; anchors under them get no label). */
  obstacles: ScreenRect[];
  ok: boolean;
}

/** Does the box overlap the on-screen box of any part on show (group anchors left out: their boxes have gaps)? */
function overModel(anchors: ReadonlyMap<string, ScreenAnchor>, b: ScreenRect): boolean {
  for (const [id, a] of anchors) {
    if (a.shown && a.onScreen && labelGroup(id) === null && b.x0 < a.x1 && b.x1 > a.x0 && b.y0 < a.y1 && b.y1 > a.y0) return true;
  }
  return false;
}

const under = (rects: readonly ScreenRect[], x: number, y: number) => rects.some((r) => x >= r.x0 && x <= r.x1 && y >= r.y0 && y <= r.y1);

const HIT = 44;
const TRI = 8;
/** Padding of the paper plate behind a placard's text, px. */
const PLATE_PAD = 4;
const FADE = 9;
/** Free stage band (stage px) below which leader labels are limited to the selected part. */
const MIN_BAND = 480;
/** Re-measure this long after the HUD shows or hides, in case its fade's `transitionend` never comes (`--dur-hud` is 350 ms). */
const HUD_FADE_MS = 1000;

function priority(file: PartsFile): Map<string, number> {
  return new Map(
    file.parts.map((p) => {
      const b = partBounds(p);
      return [p.id, b ? Math.hypot(b.max[0] - b.min[0], b.max[1] - b.min[1], b.max[2] - b.min[2]) : 0.5] as [string, number];
    }),
  );
}

export function LeaderLabels({ file, chapters, bridge, ui }: { file: PartsFile; chapters: readonly Chapter[]; bridge: StageBridge; ui: SpaceUiStore }) {
  const { locale } = useSceneContext();
  const store = useSceneStore<SpaceSceneExt>();
  const presenting = useStore(ui, (u) => u.presenting);
  const beatLabels = useStore(ui, (u) => u.beatLabels);
  const hudOn = useHud((h) => h.hud);
  const cardOpen = useHud((h) => h.cardOpen);
  const labelsOn = useHud((h) => h.labels && (h.hud || presenting));
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
  const groups = useMemo(() => new Map(file.groups.map((g) => [g.id, g])), [file.groups]);
  const listed = useMemo(
    () => listedLabels({ presenting, beat: beatLabels, chapter: chapters.find((c) => c.id === s.chapter)?.state.labels }),
    [presenting, beatLabels, chapters, s.chapter],
  );
  const candidates = useMemo(() => {
    const displays = resolveAllPartDisplays(file.parts, { view: s.view, part: s.part, layers: s.layers, hidden: s.hidden });
    const pool = listed ?? file.parts.map((p) => p.id);
    const labelled = (id: string) => displays.get(id)?.visible === true && displays.get(id)?.selectable === true;
    // A group placard while any of its parts is on show.
    const groupShown = (g: string) => groups.has(g) && file.parts.some((p) => p.group === g && labelled(p.id));
    const size = (id: string) => (labelGroup(id) !== null ? Infinity : (sizes.get(id) ?? 0));
    const ids = pool
      .filter((id) => {
        const g = labelGroup(id);
        return g !== null ? groupShown(g) : labelled(id);
      })
      .sort((a, b) => size(b) - size(a));
    // The selected part comes first; outside an explicit presentation list it is always labelled.
    if (s.part && labelled(s.part) && (!presenting || listed === null || ids.includes(s.part))) return [s.part, ...ids.filter((id) => id !== s.part)];
    return ids;
  }, [file.parts, groups, listed, presenting, s, sizes]);

  const root = useRef<SVGGElement>(null);
  const labels = useRef(new Map<string, LabelState>());
  const frame = useRef<Frame>({ width: 0, height: 0, top: 0, bottom: 0, left: 0, right: 0, obstacles: [], ok: false });
  const clock = useRef(0);
  const selected = s.part;

  const register = useCallback((id: string, dom: LabelDom | null) => {
    const map = labels.current;
    if (!dom) {
      map.delete(id);
      return;
    }
    const prev = map.get(id);
    map.set(id, prev ? { ...prev, dom, plate: true } : { dom, w: 0, h: 0, top: 0, side: null, x: 0, y: -1, vis: 0, plate: true });
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
      l.dom.hit.setAttribute('x', '-4');
      l.dom.hit.setAttribute('width', String(b.width + TRI + 8));
      // Paper knock-out behind the text: placards may sit over the model.
      l.dom.plate.setAttribute('x', String(TRI - PLATE_PAD));
      l.dom.plate.setAttribute('y', String(b.y - PLATE_PAD / 2));
      l.dom.plate.setAttribute('width', String(b.width + 2 * PLATE_PAD));
      l.dom.plate.setAttribute('height', String(b.height + PLATE_PAD));
      l.side = null; // re-apply alignment
    }
    const W = box.width;
    const H = box.height;
    let top = 14;
    let bottom = H - 14;
    let left = 14;
    let right = W - 14;
    const scene = svg.closest('.atlas-scene') ?? document;
    const rects: ScreenRect[] = [];
    // The overlay column is wider than its right-aligned cards: use the cards.
    // Presenting: only the caption card and the title block count (the HUD blocks are fading out, still `visible`).
    const blocks = [...scene.querySelectorAll('[data-hud-panel]')]
      .filter((el) => !presenting || el.getAttribute('data-hud-panel')!.startsWith('present'))
      .flatMap((el) => (el.getAttribute('data-hud-panel') === 'overlay' ? [...el.children] : [el]));
    for (const el of blocks) {
      const r = el.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) continue;
      if (r.right <= box.left || r.left >= box.right || r.bottom <= box.top || r.top >= box.bottom) continue;
      if (getComputedStyle(el).visibility === 'hidden') continue;
      rects.push({ x0: r.left - box.left, y0: r.top - box.top, x1: r.right - box.left, y1: r.bottom - box.top });
    }
    // Blocks across the middle at the bottom (panels, bar, reader sheet) close the band from below.
    for (const r of rects) if (r.y0 > H * 0.45 && r.x0 < W / 2 && r.x1 > W / 2) bottom = Math.min(bottom, r.y0 - 12);
    for (const r of rects) {
      if (r.y0 >= bottom || r.y1 <= top) continue;
      if (r.x1 < W / 2) left = Math.max(left, r.x1 + 18);
      else if (r.x0 > W / 2) right = Math.min(right, r.x0 - 18);
    }
    Object.assign(f, { width: W, height: H, top, bottom, left, right, obstacles: rects });
    bridge.invalidate();
  }, [bridge, presenting]);

  useLayoutEffect(() => {
    measure();
  }, [measure, candidates, locale, labelsOn, presenting, cardOpen]);

  // The HUD fades out (presentation) or in: its blocks count as obstacles only once they are there
  // (the fade's `visibility` step ends it; the timer covers reduced motion and slow frames).
  useEffect(() => {
    const scene = root.current?.ownerSVGElement?.closest('.atlas-scene');
    const onEnd = (e: Event) => {
      if ((e as TransitionEvent).propertyName === 'visibility') measure();
    };
    scene?.addEventListener('transitionend', onEnd);
    const timer = window.setTimeout(measure, HUD_FADE_MS);
    return () => {
      scene?.removeEventListener('transitionend', onEnd);
      window.clearTimeout(timer);
    };
  }, [measure, hudOn, presenting, labelsOn]);

  // With the HUD hidden the leaders slot fades with it; the presentation keeps it on (space-scene.css).
  useLayoutEffect(() => {
    const svg = root.current?.ownerSVGElement;
    if (!svg || !presenting) return;
    svg.setAttribute('data-present', '');
    return () => svg.removeAttribute('data-present');
  }, [presenting, labelsOn]);

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

  // The stage checks occlusion for these parts only (none while the labels are off).
  useEffect(() => {
    bridge.labelled = new Set(labelsOn ? candidates : []);
    bridge.invalidate();
    return () => {
      bridge.labelled = null;
    };
  }, [bridge, candidates, labelsOn]);

  /* ---------------- per-frame layout ---------------- */
  useEffect(() => {
    if (!labelsOn) return;
    const items: LeaderItem[] = [];
    const placed = new Set<string>();
    const layout = () => {
      const f = frame.current;
      const now = performance.now();
      const dt = clock.current ? Math.min(0.1, (now - clock.current) / 1000) : 0.016;
      clock.current = now;
      if (!f.ok) return;
      const map = labels.current;
      // Band between the HUD blocks too narrow for placards beside the model (720p laptops): only the selected part is labelled.
      const roomy = f.right - f.left >= MIN_BAND;
      // Presenting: the beat's list as it is (≤ 6); otherwise fewer labels in close-ups.
      const wanted = presenting ? PRESENT_LABEL_CAP : labelBudget(bridge.modelRadius > 0 ? bridge.cameraDistance / bridge.modelRadius : 3);
      const budget = roomy ? wanted : selected ? 1 : 0;
      items.length = 0;
      for (const id of candidates) {
        if (items.length >= budget) break;
        const l = map.get(id);
        const a = bridge.anchors.get(id);
        if (!l || !a || !a.shown || !a.onScreen || l.w <= 0 || under(f.obstacles, a.x, a.y)) continue;
        if (!roomy && id !== selected) continue;
        items.push({
          id,
          ax: a.x,
          ay: a.y,
          w: l.w + TRI,
          h: l.h,
          lead: Math.min(l.h * 0.22, -l.top * 0.7),
          bounds: { x0: a.x0, y0: a.y0, x1: a.x1, y1: a.y1 },
          prev: l.side && l.y >= 0 ? { side: l.side, x0: l.x, y0: l.y } : null,
        });
      }
      const places = layoutLeaders(items, f);
      let moving = false;
      placed.clear();
      const k = Math.min(1, dt * 10);
      for (const p of places) {
        const l = map.get(p.id)!;
        const a = bridge.anchors.get(p.id)!;
        placed.add(p.id);
        if (l.side !== p.side) {
          // Text set towards the anchor: right-aligned left of it, left-aligned (with the triangle) right of it.
          l.dom.text.setAttribute('text-anchor', p.side === 'L' ? 'end' : 'start');
          for (const ts of l.dom.text.children) ts.setAttribute('x', String(p.side === 'L' ? l.w + TRI : TRI));
          l.dom.tri.style.display = p.side === 'L' ? 'none' : '';
          l.dom.hit.setAttribute('x', '-4');
          l.side = p.side;
          l.y = -1;
        }
        // Glide to the new place (snap on the first frame and after a side change).
        if (l.y < 0) {
          l.x = p.x0;
          l.y = p.y0;
        } else {
          l.x += (p.x0 - l.x) * k;
          l.y += (p.y0 - l.y) * k;
        }
        if (Math.abs(l.x - p.x0) > 0.3 || Math.abs(l.y - p.y0) > 0.3) moving = true;
        const want = a.onScreen && (p.id === selected || !a.occluded) ? 1 : 0;
        l.vis += (want - l.vis) * Math.min(1, dt * FADE);
        if (Math.abs(want - l.vis) < 0.01) l.vis = want;
        else moving = true;
        const dx = l.x - p.x0;
        const dy = l.y - p.y0;
        // The paper plate only where the placard lies over a part on show.
        const over = overModel(bridge.anchors, p);
        if (l.plate !== over) {
          l.plate = over;
          l.dom.plate.style.opacity = over ? '' : '0';
        }
        const baseline = l.y - l.top;
        l.dom.g.setAttribute('transform', `translate(${l.x.toFixed(1)} ${baseline.toFixed(1)})`);
        l.dom.g.style.opacity = l.vis.toFixed(3);
        l.dom.g.style.pointerEvents = l.vis > 0.5 ? '' : 'none';
        l.dom.leader.setAttribute(
          'd',
          `M${(p.sx + dx).toFixed(1)} ${(p.sy + dy).toFixed(1)}H${(p.ex + dx).toFixed(1)}L${a.x.toFixed(1)} ${a.y.toFixed(1)}`,
        );
        l.dom.leader.style.opacity = (l.vis * 0.9).toFixed(3);
        l.dom.dot.setAttribute('cx', a.x.toFixed(1));
        l.dom.dot.setAttribute('cy', a.y.toFixed(1));
        l.dom.dot.style.opacity = l.vis.toFixed(3);
      }
      for (const [id, l] of map) {
        if (placed.has(id)) continue;
        if (l.vis > 0) {
          l.vis = Math.max(0, l.vis - dt * FADE * 0.6);
          moving = true;
        }
        if (l.vis === 0) l.y = -1;
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
  }, [bridge, candidates, selected, labelsOn, presenting]);

  if (!labelsOn) return null;
  return (
    <g ref={root} className="space-leaders" data-presenting={presenting || undefined} data-want={listed?.join(',')}>
      {candidates.map((id) => {
        const group = labelGroup(id);
        const g = group !== null ? groups.get(group) : undefined;
        if (g) {
          return (
            <Label
              key={id}
              id={groupLabelId(g.id)}
              n=""
              en={tx(g.name, 'en')}
              zh={tx(g.name, 'zh')}
              note=""
              group
              on={false}
              register={register}
            />
          );
        }
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
  /** A whole group (`group:<id>`): name only, nothing to select. */
  group?: boolean;
  on: boolean;
  register(id: string, dom: LabelDom | null): void;
  onSelect?(): void;
}) {
  const g = useRef<SVGGElement>(null);
  const text = useRef<SVGTextElement>(null);
  const hit = useRef<SVGRectElement>(null);
  const plate = useRef<SVGRectElement>(null);
  const tri = useRef<SVGPathElement>(null);
  const leader = useRef<SVGPathElement>(null);
  const dot = useRef<SVGCircleElement>(null);
  const { id, register } = props;
  useLayoutEffect(() => {
    register(id, { g: g.current!, text: text.current!, hit: hit.current!, plate: plate.current!, tri: tri.current!, leader: leader.current!, dot: dot.current! });
    return () => register(id, null);
  }, [id, register]);
  return (
    <>
      <path ref={leader} className="space-co__leader" data-on={props.on || undefined} style={{ opacity: 0 }} />
      <circle ref={dot} className="space-co__dot" data-on={props.on || undefined} r={2.6} style={{ opacity: 0 }} />
      <g
        ref={g}
        className="space-co"
        data-id={id}
        data-group={props.group || undefined}
        data-on={props.on || undefined}
        style={{ opacity: 0 }}
        onClick={(e) => {
          e.stopPropagation();
          props.onSelect?.();
        }}
      >
        <rect ref={hit} className="space-co__hit" />
        <rect ref={plate} className="space-co__plate" />
        <path ref={tri} className="space-co__tri" d="M0 -6.2L5 -3.1L0 0Z" />
        <text ref={text} className="space-co__text">
          <tspan className="space-co__en">
            {props.n && <tspan className="space-co__n">{props.n} </tspan>}
            {props.en.toUpperCase()}
          </tspan>
          <tspan className="space-co__zh" x={0} dy="1.5em" lang="zh-Hans">
            {props.zh}
          </tspan>
          {props.note && (
            <tspan className="space-co__note" x={0} dy="1.45em">
              {props.note}
            </tspan>
          )}
        </text>
      </g>
    </>
  );
}
