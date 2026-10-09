/**
 * Small pieces shared by the TimeScene HUD drawings (band card, timeline
 * lanes): element size, the playhead as React state, the HUD design pixel,
 * hatch patterns and the current chapter's time window.
 */
import { useEffect, useRef, useState, useSyncExternalStore, type RefObject } from 'react';
import type { Playhead } from '../lib/playhead';
import type { TimeModel } from '../lib/model';
import { BLOC_CSS, entityCssColor } from '../colors';

/** Size of an element, tracked with a ResizeObserver. */
export function useSize<T extends Element>(): [RefObject<T | null>, { w: number; h: number }] {
  const ref = useRef<T>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const read = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    const ro = new ResizeObserver(read);
    ro.observe(el);
    read();
    return () => ro.disconnect();
  }, []);
  return [ref, size];
}

export function usePlayheadT(playhead: Playhead): number {
  return useSyncExternalStore(playhead.subscribe, playhead.get, playhead.get);
}

/** HUD design pixel of the scene (`--kt`), read once per size change. */
export function useUnit(ref: RefObject<Element | null>, deps: unknown): number {
  const [u, setU] = useState(1);
  useEffect(() => {
    const el = ref.current;
    if (el) setU(Number.parseFloat(getComputedStyle(el).getPropertyValue('--kt')) || 1);
  }, [ref, deps]);
  return u;
}

export const upper = (s: string) => s.toLocaleUpperCase('en');

/** Hatch patterns, one per colour (`colorKey`): each bloc, plus entities with their own colour. */
export function HatchDefs({ model, prefix }: { model: TimeModel; prefix: string }) {
  const own = [...model.entities.values()].filter(({ entity }) => entity.color);
  const pattern = (key: string, color: string) => (
    <pattern key={key} id={`${prefix}-${key}`} width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <line x1="0" y1="0" x2="0" y2="5" stroke={color} strokeWidth="0.9" opacity="0.7" />
    </pattern>
  );
  return (
    <defs>
      {(['axis', 'allied', 'neutral'] as const).map((b) => pattern(`b-${b}`, BLOC_CSS[b]))}
      {own.map(({ entity }) => pattern(`e-${entity.id}`, entityCssColor(entity)))}
    </defs>
  );
}

/** Time window [node i, node i+1) of the chapter `chapter` (null when it has no node). */
export function chapterWindow(model: TimeModel, chapter: string | null): [number, number] | null {
  const nodes = [...model.chapterNodes].sort((a, b) => a.t - b.t);
  const i = nodes.findIndex((n) => n.id === chapter);
  if (i < 0) return null;
  return [nodes[i]!.t, nodes[i + 1]?.t ?? model.max];
}
