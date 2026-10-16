/**
 * River names on a regional plate (`basemap.region.rivers`): one small italic
 * label per course that exists at `t`, laid along the river (the angle is
 * fixed per course: Mercator keeps angles at every zoom), at the course's
 * `label` point or the middle of its longest line. A secondary class: they
 * follow the territory names' switch (N), give way to leader placards and
 * territory names and to each other (greedy, in data order), and hide off
 * screen. HTML markers, no glyphs.
 */
import { Marker, type Map as MlMap } from 'maplibre-gl';
import type { Locale } from '../../../core/types';
import { tx } from '../../../../i18n';
import type { RiverN } from '../../lib/rivers';

export interface RiverLabels {
  /** The rivers of the plate (once loaded). */
  set(rivers: readonly RiverN[]): void;
  /** Show the names of `visible` (null hides all) in `locale`. */
  show(visible: ReadonlySet<string> | null, locale: Locale): void;
  /** Hide the names that collide with `occupied` (viewport rects) or with each other. */
  resolve(occupied: readonly DOMRect[]): void;
  /** Number of names on show. */
  count(): number;
  destroy(): void;
}

const PAD = 3;

export function createRiverLabels(map: MlMap): RiverLabels {
  let rivers: readonly RiverN[] = [];
  const markers = new Map<string, { marker: Marker; text: string }>();

  const clear = (keep: ReadonlySet<string>) => {
    for (const [id, entry] of markers) {
      if (keep.has(id)) continue;
      entry.marker.remove();
      markers.delete(id);
    }
  };

  return {
    set(next) {
      rivers = next;
      clear(new Set());
    },
    show(visible, locale) {
      const want = new Set(visible && rivers.length ? rivers.filter((r) => visible.has(r.id) && r.label).map((r) => r.id) : []);
      clear(want);
      for (const r of rivers) {
        if (!want.has(r.id) || !r.label) continue;
        const text = tx(r.name, locale);
        let entry = markers.get(r.id);
        if (!entry) {
          const el = document.createElement('div');
          el.className = 'ts-river';
          el.dataset.river = r.id;
          el.appendChild(document.createElement('span'));
          const marker = new Marker({ element: el, anchor: 'center', rotationAlignment: 'viewport', pitchAlignment: 'viewport' }).setLngLat(r.label).setRotation(r.angle).addTo(map);
          entry = { marker, text: '' };
          markers.set(r.id, entry);
        }
        if (entry.text !== text) {
          (entry.marker.getElement().firstChild as HTMLElement).textContent = text;
          entry.text = text;
        }
      }
    },
    resolve(occupied) {
      const taken: DOMRect[] = [...occupied];
      for (const r of rivers) {
        const entry = markers.get(r.id);
        if (!entry) continue;
        const el = entry.marker.getElement();
        const rect = (el.firstElementChild ?? el).getBoundingClientRect();
        const hit =
          rect.width === 0 ||
          taken.some((o) => rect.left < o.right + PAD && rect.right > o.left - PAD && rect.top < o.bottom + PAD && rect.bottom > o.top - PAD);
        el.dataset.collided = String(hit);
        if (!hit) taken.push(rect);
      }
    },
    count() {
      let n = 0;
      for (const { marker } of markers.values()) if (marker.getElement().dataset.collided !== 'true') n++;
      return n;
    },
    destroy() {
      clear(new Set());
    },
  };
}
