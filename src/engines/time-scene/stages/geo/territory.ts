/**
 * Territory names (docs/08 §5): one museum-placard label per control area
 * that is big enough on screen, naming who holds it at `t` — EN small caps
 * letter-spaced on one line, Chinese beneath, ink with a paper halo, no box.
 *
 *  - Anchor: pole of inaccessibility of the feature's largest polygon on
 *    screen (lib/territory.ts `labelGeometries`: the largest and up to five
 *    more sizeable ones), computed lazily once per keyframe feature, cached.
 *  - Text: `properties.label` (its short form) else the holder's name.
 *  - Size: three tiers by the polygon's on-screen area; a label must also fit
 *    the polygon (width against the inscribed circle), else a smaller tier,
 *    else none. At most 24, larger areas first, greedy against the leader
 *    placards, the HUD panels and each other.
 *  - Keyframes: outgoing labels fade out and incoming ones in over the
 *    control crossfade window; the same holder + text within 40 px in both
 *    keyframes is one label that moves.
 *  - `place()` decides what shows (keyframe pair, blend bucket, camera end,
 *    band changes); `reproject()` only moves the shown labels (every map
 *    render, so they ride along while the camera flies).
 *
 * Labels live in their own layer over the map, outside the host LABELS (L)
 * and HUD switches: they are part of the map (N toggles them).
 */
import type { Map as MlMap } from 'maplibre-gl';
import type { ControlFeature } from '../../schema';
import type { TimeModel } from '../../lib/model';
import { projectNearCentre, type LngLat } from '../../lib/geo';
import {
  alternativeSpots,
  labelGeometries,
  labelText,
  latOfMercY,
  pairCrossfade,
  placeLabels,
  pxPerUnit,
  signedDistance,
  textAtBlend,
  tierFor,
  TIER_MIN_AREA,
  type Box,
  type LabelGeometry,
  type PlaceCandidate,
  type Tier,
} from '../../lib/territory';

export interface TerritoryInput {
  prevIndex: number;
  nextIndex: number;
  /** 0..1 inside the crossfade window (lib/time.ts `keyframeWindow`). */
  blend: number;
  /** Holders whose unlabelled areas carry a leader placard instead (highlighted entities). */
  skipHolders: ReadonlySet<string>;
  /** Container-local boxes to keep clear of: leader placards, then HUD panels. */
  obstacles: readonly Box[];
}

export interface TerritoryLabels {
  /** Decide what shows and where (null hides everything). */
  place(input: TerritoryInput | null): void;
  /** Move and fade the shown labels for the current camera and blend (cheap). */
  reproject(blend?: number): void;
  /** Centres (container px) of the labels on show (place names keep 60 px away). */
  centres(): { x: number; y: number }[];
  /** Viewport rects of the labels on show. */
  rects(): DOMRect[];
  /** Number of labels on show. */
  count(): number;
  destroy(): void;
}

export const MAX_TERRITORY_LABELS = 24;
/** Same holder + text in both keyframes and closer than this (px): one moving label. */
const PAIR_PX = 40;
/** Same holder with different text (Russia -> Soviet Russia) closer than this (px): one moving label that switches its text at half the crossfade. */
const RETEXT_PX = 120;
/** A label may be this much wider than the inscribed circle (labels are wide, circles round). */
const FIT_W = 1.6;
const FIT_H = 1.1;

interface Shown {
  key: string;
  el: HTMLElement;
  /** Mercator units of the anchor in each keyframe (a moving pair has both). */
  from: { x: number; y: number } | null;
  to: { x: number; y: number } | null;
  /** Fade role: 'prev' fades out with the blend, 'next' fades in, 'both' stays. */
  role: 'prev' | 'next' | 'both';
  /** Mercator offset from the anchor (the pole's spot was taken; another spot inside the area). */
  off: { x: number; y: number };
  w: number;
  h: number;
  /** What the label says: one text, or the outgoing then the incoming one of a pair (the switch is at half the crossfade). */
  texts: TextBox[];
  tier: Tier;
}

interface TextBox {
  en: string;
  zh: string;
  text: string;
  w: number;
  h: number;
}

interface Candidate extends PlaceCandidate {
  holder: string;
  en: string;
  zh: string;
  tier: Tier;
  texts: TextBox[];
  role: Shown['role'];
  from: { x: number; y: number } | null;
  to: { x: number; y: number } | null;
  /** Mercator offsets for the alternative spots, in the order `alternatives()` returns them. */
  offsets: { dx: number; dy: number }[];
}

export function createTerritoryLabels(options: { map: MlMap; container: HTMLElement; root: HTMLElement; model: TimeModel }): TerritoryLabels {
  const { map, container, root, model } = options;
  const geometry = new Map<string, LabelGeometry[]>();
  const sizes = new Map<string, { w: number; h: number }>();
  const shown = new Map<string, Shown>();
  let blendNow = 0;
  let destroyed = false;

  const measurer = document.createElement('div');
  measurer.className = 'ts-terr';
  measurer.setAttribute('aria-hidden', 'true');
  measurer.style.visibility = 'hidden';
  root.appendChild(measurer);
  const resizeObserver = new ResizeObserver(() => sizes.clear());
  resizeObserver.observe(container);
  const onFonts = () => sizes.clear();
  document.fonts?.addEventListener?.('loadingdone', onFonts);

  const fill = (el: HTMLElement, en: string, zh: string) => {
    el.replaceChildren();
    const a = document.createElement('span');
    a.className = 'ts-terr__en';
    a.lang = 'en';
    a.textContent = en;
    el.appendChild(a);
    if (zh && zh !== en) {
      const b = document.createElement('span');
      b.className = 'ts-terr__zh';
      b.lang = 'zh-Hans';
      b.textContent = zh;
      el.appendChild(b);
    }
  };

  const measure = (en: string, zh: string, tier: Tier) => {
    const key = `${tier}|${en}|${zh}`;
    let s = sizes.get(key);
    if (!s) {
      measurer.dataset.tier = String(tier);
      fill(measurer, en, zh);
      s = { w: measurer.offsetWidth, h: measurer.offsetHeight };
      sizes.set(key, s);
    }
    return s;
  };

  const geometryOf = (k: number, i: number, f: ControlFeature): LabelGeometry[] => {
    const key = `${k}:${i}`;
    let list = geometry.get(key);
    if (!list) {
      const g = f.geometry;
      list = labelGeometries(g.type === 'Polygon' ? [g.coordinates] : g.coordinates);
      geometry.set(key, list);
    }
    return list;
  };

  const lngLatOf = (m: { x: number; y: number }): LngLat => [m.x, latOfMercY(m.y)];

  /** Anchor in Mercator units at blend `b`, and the fade for that role. */
  const stateOf = (s: Pick<Shown, 'from' | 'to' | 'role' | 'off'>, b: number) => {
    const a = s.from ?? s.to!;
    const z = s.to ?? s.from!;
    const k = s.role === 'both' ? b : 0;
    const at = {
      x: a.x + (z.x - a.x) * k + s.off.x,
      y: a.y + (z.y - a.y) * k + s.off.y,
    };
    const opacity = s.role === 'both' ? 1 : s.role === 'prev' ? 1 - b : b;
    return { at, opacity };
  };

  const screenOf = (at: { x: number; y: number }, width: number) => projectNearCentre((q) => map.project(q), lngLatOf(at), width / 2);

  function place(input: TerritoryInput | null) {
    if (destroyed) return;
    if (!input || input.prevIndex < 0) {
      for (const s of shown.values()) s.el.remove();
      shown.clear();
      return;
    }
    const width = container.clientWidth;
    const height = container.clientHeight;
    const scale = pxPerUnit(map.getZoom());
    const s2 = scale * scale;
    blendNow = input.nextIndex >= 0 ? input.blend : 0;

    type Raw = {
      key: string;
      holder: string;
      text: string;
      en: string;
      zh: string;
      g: LabelGeometry;
      x: number;
      y: number;
      area: number;
      r: number;
    };
    const collect = (k: number): Raw[] => {
      const kf = model.keyframes[k]?.keyframe;
      if (!kf) return [];
      const out: Raw[] = [];
      kf.features.features.forEach((f, i) => {
        const holder = f.properties.holder;
        const label = f.properties.label;
        if (!label && input.skipHolders.has(holder)) return;
        const text = labelText(label, model.entities.get(holder)?.entity.name);
        if (!text) return;
        // The largest of the feature's polygons whose anchor is on screen (an empire's home island when its largest part is not).
        for (const g of geometryOf(k, i, f)) {
          if (g.area * s2 < TIER_MIN_AREA[3]) break;
          const p = screenOf({ x: g.mx, y: g.my }, width);
          if (p.x < 0 || p.y < 0 || p.x > width || p.y > height) continue;
          out.push({
            key: `${k}:${i}`,
            holder,
            text: `${text.en}|${text.zh}`,
            en: text.en,
            zh: text.zh,
            g,
            x: p.x,
            y: p.y,
            area: g.area * s2,
            r: g.r * scale,
          });
          break;
        }
      });
      return out;
    };
    const prev = blendNow < 0.999 ? collect(input.prevIndex) : [];
    const next = blendNow > 0.001 ? collect(input.nextIndex) : [];

    const candidates: Candidate[] = [];
    // Also one gliding label when each anchor lies inside the other keyframe's area (the same territory, reshaped).
    const inside = (p: Raw, q: Raw) => signedDistance(p.g.mx, p.g.my, q.g.poly) > 0 && signedDistance(q.g.mx, q.g.my, p.g.poly) > 0;
    for (const pair of pairCrossfade(prev, next, PAIR_PX, inside, RETEXT_PX)) {
      const a = pair.prev;
      const z = pair.next;
      const one = (a ?? z)!;
      const role: Shown['role'] = a && z ? 'both' : a ? 'prev' : 'next';
      const k = role === 'both' ? blendNow : 0;
      const area = a && z ? a.area + (z.area - a.area) * k : one.area;
      const r = a && z ? a.r + (z.r - a.r) * k : one.r;
      const opacity = role === 'both' ? 1 : role === 'prev' ? 1 - blendNow : blendNow;
      const tier0 = tierFor(area);
      if (!tier0 || opacity < 0.02) continue;
      // A pair whose text differs says the outgoing one, then the incoming one; both must fit.
      const says = a && z && a.text !== z.text ? [a, z] : [one];
      let fit: { tier: Tier; w: number; h: number; texts: TextBox[] } | null = null;
      for (let t = tier0; t <= 3; t++) {
        const texts = says.map((q) => ({ en: q.en, zh: q.zh, text: q.text, ...measure(q.en, q.zh, t as Tier) }));
        if (texts.every((q) => q.w > 0 && q.w <= 2 * r * FIT_W && q.h <= 2 * r * FIT_H)) {
          fit = { tier: t as Tier, w: Math.max(...texts.map((q) => q.w)), h: Math.max(...texts.map((q) => q.h)), texts };
          break;
        }
      }
      if (!fit) continue;
      // Spots inside the area (of the incoming keyframe for a moving pair) where this label still fits, if the pole's is taken.
      const g = (z ?? a)!.g;
      const need = Math.max(fit.w / (2 * FIT_W), fit.h / (2 * FIT_H)) / scale;
      const x0 = a && z ? a.x + (z.x - a.x) * k : one.x;
      const y0 = a && z ? a.y + (z.y - a.y) * k : one.y;
      const candidate: Candidate = {
        // A moving pair keeps the incoming key, so the same element carries on once the window moves to the next keyframe.
        key: (z ?? a)!.key,
        text: one.text,
        holder: one.holder,
        en: one.en,
        zh: one.zh,
        tier: fit.tier,
        texts: fit.texts,
        x: x0,
        y: y0,
        w: fit.w,
        h: fit.h,
        priority: area * (0.5 + 0.5 * opacity),
        role,
        from: a ? { x: a.g.mx, y: a.g.my } : null,
        to: z ? { x: z.g.mx, y: z.g.my } : null,
        offsets: [],
      };
      candidate.alternatives = () => {
        candidate.offsets = alternativeSpots(g, need);
        // Mercator y grows north, screen y down.
        return candidate.offsets.map((o) => ({
          x: x0 + o.dx * scale,
          y: y0 - o.dy * scale,
        }));
      };
      candidates.push(candidate);
    }

    const kept = placeLabels(candidates, {
      stage: { w: width, h: height },
      obstacles: input.obstacles,
      cap: MAX_TERRITORY_LABELS,
    });
    const keep = new Set(kept.map((c) => c.key));
    for (const [key, s] of shown) {
      if (keep.has(key)) continue;
      s.el.remove();
      shown.delete(key);
    }
    for (const c of kept) {
      let s = shown.get(c.key);
      if (!s) {
        const el = document.createElement('div');
        el.className = 'ts-terr';
        el.style.opacity = '0';
        root.appendChild(el);
        s = {
          key: c.key,
          el,
          from: null,
          to: null,
          role: c.role,
          off: { x: 0, y: 0 },
          w: 0,
          h: 0,
          texts: c.texts,
          tier: c.tier,
        };
        shown.set(c.key, s);
      }
      s.texts = c.texts;
      s.tier = c.tier;
      s.el.dataset.holder = c.holder;
      s.from = c.from;
      s.to = c.to;
      const o = c.alt >= 0 ? c.offsets[c.alt] : undefined;
      s.off = o ? { x: o.dx, y: o.dy } : { x: 0, y: 0 };
      s.role = c.role;
      s.w = c.w;
      s.h = c.h;
    }
    reproject(blendNow);
  }

  /** Put the right text in a label for the blend (a gliding pair switches at half the crossfade). */
  function say(s: Shown, blend: number) {
    const q = s.texts.length > 1 ? textAtBlend(s.texts[0]!, s.texts[1]!, blend) : s.texts[0]!;
    if (s.el.dataset.text === q.text && s.el.dataset.tier === String(s.tier)) return q;
    s.el.dataset.text = q.text;
    s.el.dataset.tier = String(s.tier);
    fill(s.el, q.en, q.zh);
    return q;
  }

  function reproject(blend?: number) {
    if (destroyed || shown.size === 0) return;
    if (blend !== undefined) blendNow = blend;
    const width = container.clientWidth;
    for (const s of shown.values()) {
      const { at, opacity } = stateOf(s, blendNow);
      const q = say(s, blendNow);
      const p = screenOf(at, width);
      s.el.style.transform = `translate(${(p.x - q.w / 2).toFixed(1)}px,${(p.y - q.h / 2).toFixed(1)}px)`;
      const o = opacity.toFixed(2);
      if (s.el.style.opacity !== o) s.el.style.opacity = o;
    }
  }

  return {
    place,
    reproject,
    centres() {
      const width = container.clientWidth;
      return [...shown.values()].map((s) => screenOf(stateOf(s, blendNow).at, width));
    },
    rects() {
      return [...shown.values()].filter((s) => stateOf(s, blendNow).opacity > 0.05).map((s) => s.el.getBoundingClientRect());
    },
    count: () => shown.size,
    destroy() {
      destroyed = true;
      resizeObserver.disconnect();
      document.fonts?.removeEventListener?.('loadingdone', onFonts);
      for (const s of shown.values()) s.el.remove();
      shown.clear();
      measurer.remove();
    },
  };
}
