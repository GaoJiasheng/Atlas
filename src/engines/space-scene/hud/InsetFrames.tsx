/**
 * Enlarged-window borders (`views.insets`, docs/58 F4, slot `leaders`): a
 * hairline frame around the parts of each inset while any of them is on
 * show, following their projected boxes every frame, with the inset's label
 * ("Enlarged schematic · different scale") on its top edge. Same hairline
 * and label style as the group scale bars; no magnification number.
 */
import { useEffect, useLayoutEffect, useRef } from 'react';
import { useSceneContext } from '../../core/context';
import { tx } from '../../../i18n';
import type { PartsFile } from '../schema';
import type { StageBridge } from '../bridge';
import { insetRect, leaderClearOfInsets } from '../lib/insets';

export function InsetFrames({ file, bridge }: { file: PartsFile; bridge: StageBridge }) {
  const { locale } = useSceneContext();
  const insets = file.views.insets ?? [];
  const root = useRef<SVGGElement>(null);

  useLayoutEffect(() => {
    if (!insets.length) return;
    bridge.insetLayout = () => {
      const bodies = insets.flatMap(inset => inset.parts.flatMap(id => {
        const a = bridge.anchors.get(id);
        return a?.shown && a.onScreen ? [a] : [];
      }));
      const texts = root.current?.querySelectorAll<SVGTextElement>('[data-inset] text');
      const rects: { x0: number; y0: number; x1: number; y1: number }[] = [], titles: typeof rects = [];
      insets.forEach((inset, k) => {
        const r = insetRect(inset.parts.map(id => bridge.anchors.get(id)),bridge.width,bridge.height);
        if (!r) return;
        rects.push({x0:r.x,y0:r.y,x1:r.x+r.w,y1:r.y+r.h});
        // The title line drawn by the effect below (x + 6, baseline y − 5, or inside near the top edge).
        const base = r.y - 5 < 10 ? r.y + 12 : r.y - 5, width = texts?.[k]?.getComputedTextLength() ?? 0;
        if (width > 0) titles.push({x0:r.x+2,y0:base-12,x1:r.x+10+width,y1:base+3});
      });
      return {bodies,clear:(p,ax,ay,dx=0,dy=0,withTitles=true)=>leaderClearOfInsets(dx || dy ? {
        ...p,x0:p.x0+dx,x1:p.x1+dx,y0:p.y0+dy,y1:p.y1+dy,sx:p.sx+dx,ex:p.ex+dx,sy:p.sy+dy,
      } : p,ax,ay,rects,withTitles ? titles : [])};
    };
    bridge.invalidate();
    return () => { delete bridge.insetLayout; };
  }, [bridge,insets]);

  useEffect(() => {
    const g = root.current;
    if (!g || insets.length === 0) return;
    const frames = [...g.querySelectorAll<SVGGElement>('[data-inset]')];
    const last = new Map<number, string>();
    const update = () => {
      insets.forEach((inset, k) => {
        const frame = frames[k];
        if (!frame) return;
        const r = insetRect(inset.parts.map((id) => bridge.anchors.get(id)), bridge.width, bridge.height);
        const key = r ? `${r.x.toFixed(1)},${r.y.toFixed(1)},${r.w.toFixed(1)},${r.h.toFixed(1)}` : 'off';
        if (last.get(k) === key) return;
        last.set(k, key);
        if (!r) {
          frame.style.opacity = '0';
          return;
        }
        const rect = frame.querySelector('rect')!, text = frame.querySelector('text')!;
        rect.setAttribute('x', r.x.toFixed(1));
        rect.setAttribute('y', r.y.toFixed(1));
        rect.setAttribute('width', r.w.toFixed(1));
        rect.setAttribute('height', r.h.toFixed(1));
        text.setAttribute('x', (r.x + 6).toFixed(1));
        text.setAttribute('y', (r.y - 5 < 10 ? r.y + 12 : r.y - 5).toFixed(1));
        frame.style.opacity = '';
      });
    };
    bridge.listeners.add(update);
    update();
    bridge.invalidate();
    return () => {
      bridge.listeners.delete(update);
    };
  }, [bridge, insets]);

  if (insets.length === 0) return null;
  return (
    <g ref={root} className="space-inset">
      {insets.map((inset) => (
        <g key={inset.id} data-inset={inset.id} style={{ opacity: 0 }}>
          <rect className="space-inset__frame" rx={3} />
          <text className="space-inset__label">{tx(inset.label, locale)}</text>
        </g>
      ))}
    </g>
  );
}
