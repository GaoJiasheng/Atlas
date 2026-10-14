/**
 * Group scale bars (`groups[].scale`, slot `leaders`): under the group in
 * focus — a part of it selected, the group soloed, or `group:<id>` among the
 * labels on show (the beat's, else the chapter's) — a hairline bar of a round
 * real length (lib/units.ts `groupScaleBar`) with its label, following the
 * group's projected box every frame. Magnified sub-models say their
 * magnification (`5 MM · ×20`).
 */
import { useEffect, useMemo, useRef } from 'react';
import { useScene, useSceneContext } from '../../core/context';
import type { SpaceSceneExt } from '../index';
import type { PartsFile, SpaceChapterState } from '../schema';
import type { StageBridge } from '../bridge';
import { groupScaleBar } from '../lib/units';
import { GROUP_LABEL_PREFIX } from '../lib/labels';

export function GroupScaleBars({ file, bridge }: { file: PartsFile; bridge: StageBridge }) {
  const { chapters } = useSceneContext();
  const s = useScene<SpaceSceneExt, { part: string | null; solo: string | null; chapter: string | null; beat: number | null }>((st) => ({
    part: st.part,
    solo: st.solo,
    chapter: st.chapter,
    beat: st.beat,
  }));
  const scaled = useMemo(() => file.groups.filter((g) => g.scale), [file.groups]);
  const focus = useMemo(() => {
    if (scaled.length === 0) return null;
    const state = chapters.find((c) => c.id === s.chapter)?.state as SpaceChapterState | undefined;
    const labels = (s.beat !== null ? state?.beats?.[s.beat]?.labels : undefined) ?? state?.labels ?? [];
    const picked = s.part ? file.parts.find((p) => p.id === s.part)?.group : undefined;
    return scaled.find((g) => g.id === picked || g.id === s.solo || labels.includes(`${GROUP_LABEL_PREFIX}${g.id}`)) ?? null;
  }, [scaled, chapters, s, file.parts]);
  const root = useRef<SVGGElement>(null);

  useEffect(() => {
    const g = root.current;
    if (!g || !focus?.scale) return;
    const bar = g.querySelector('path')!;
    const text = g.querySelector('text')!;
    const update = () => {
      const a = bridge.anchors.get(`${GROUP_LABEL_PREFIX}${focus.id}`);
      const scale = a && a.shown && a.onScreen && a.depth > 0 ? groupScaleBar(bridge.focal / a.depth, file.units, focus.scale!) : null;
      if (!a || !scale) {
        g.style.opacity = '0';
        return;
      }
      const x = Math.min(Math.max((a.x0 + a.x1) / 2, scale.px / 2 + 8), bridge.width - scale.px / 2 - 8);
      const y = Math.min(a.y1 + 16, bridge.height - 18);
      bar.setAttribute('d', `M${(x - scale.px / 2).toFixed(1)} ${(y - 4).toFixed(1)}v4h${scale.px.toFixed(1)}v-4`);
      text.setAttribute('x', x.toFixed(1));
      text.setAttribute('y', (y + 12).toFixed(1));
      if (text.textContent !== scale.label) text.textContent = scale.label;
      g.style.opacity = '';
    };
    bridge.listeners.add(update);
    update();
    bridge.invalidate();
    return () => {
      bridge.listeners.delete(update);
    };
  }, [bridge, focus, file.units]);

  if (!focus) return null;
  return (
    <g ref={root} className="space-gscale" data-group={focus.id} style={{ opacity: 0 }}>
      <path className="space-gscale__bar" />
      <text className="space-gscale__label" textAnchor="middle" />
    </g>
  );
}
