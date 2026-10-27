/**
 * Enlarged-window borders (`views.insets`, docs/58 F4, slot `leaders`): a
 * hairline frame around the parts of each inset while any of them is on
 * show, following their projected boxes every frame, with the inset's label
 * ("Enlarged schematic · different scale") on its top edge. Same hairline
 * and label style as the group scale bars; no magnification number.
 */
import { useEffect, useRef } from 'react';
import { useSceneContext } from '../../core/context';
import { tx } from '../../../i18n';
import type { PartsFile } from '../schema';
import type { StageBridge } from '../bridge';
import { insetRect } from '../lib/insets';

export function InsetFrames({ file, bridge }: { file: PartsFile; bridge: StageBridge }) {
  const { locale } = useSceneContext();
  const insets = file.views.insets ?? [];
  const root = useRef<SVGGElement>(null);

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
