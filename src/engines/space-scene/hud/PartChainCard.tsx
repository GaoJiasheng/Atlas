/**
 * Top-right card: the part chain as a schematic — groups with parts as
 * columns (flow-only groups get none), parts as numbered nodes (context
 * scenery left out), `connects` as hairlines. Columns longer than ten rows
 * switch to a compact row pitch. The selected part is filled in the signal
 * colour. While the scene runs, the lines a flow with `parts` runs along take
 * that flow's colour at that point of its chain (its `stops`) and march;
 * flows without `parts` colour the lines inside their group.
 */
import { useMemo } from 'react';
import { useScene } from '../../core/context';
import { tx } from '../../../i18n';
import { resolveColorRef } from '../../../theme/theme';
import { chainKey, flowLinks, partChain } from '../lib/schematic';
import { flowColorAt } from '../lib/flow-stops';
import type { SpaceSceneExt } from '../index';
import type { PartsFile } from '../schema';
import { clip, flowingGroups, isFlowing, spanCss } from './common';

const W = 330;

export function PartChainCard({ file }: { file: PartsFile }) {
  const s = useScene<SpaceSceneExt, { part: string | null; run: boolean; layers: string[] }>((st) => ({
    part: st.part,
    run: st.run,
    layers: st.layers,
  }));
  const layout = useMemo(
    () => partChain(file.parts, file.groups, W, { row: 23, compactRow: 16, compactAfter: 10, header: 18, gap: 10 }),
    [file.parts, file.groups],
  );
  const onFlow = useMemo(() => flowLinks(file.flows), [file.flows]);
  const flows = useMemo(() => new Map(file.flows.map((f) => [f.id, f])), [file.flows]);
  const flowing = flowingGroups(file, s.run, s.layers);
  // Groups whose flows declare their own chain colour only those links.
  const chained = new Set(file.flows.filter((f) => f.parts).map((f) => f.group));
  const groups = new Map(file.groups.map((g) => [g.id, g]));
  const byId = new Map(file.parts.map((p) => [p.id, p]));
  const maxChars = Math.max(6, Math.floor(((layout.columns[0]?.w ?? 90) - 22) / (layout.compact ? 5.4 : 5.8)));
  const textDy = layout.compact ? 3.5 : 3.8;

  const linkColor = (a: string, b: string, group: string | null): string | undefined => {
    const hit = onFlow.get(chainKey(a, b));
    const flow = hit ? flows.get(hit.flow) : undefined;
    if (hit && flow) return isFlowing(flow, s.run, s.layers) ? spanCss(flowColorAt(flow, hit.u)) : undefined;
    if (!group || chained.has(group)) return undefined;
    const color = flowing.get(group);
    return color ? resolveColorRef(color) : undefined;
  };

  return (
    <svg
      className="space-chain"
      data-compact={layout.compact || undefined}
      viewBox={`0 0 ${W} ${layout.height + 4}`}
      role="img"
      aria-label={layout.columns.map((c) => tx(groups.get(c.id)?.name, 'en')).join(' · ')}
    >
      {layout.columns.map((c) => {
        const g = groups.get(c.id);
        const n = file.groups.findIndex((x) => x.id === c.id) + 1;
        return (
          <g key={c.id} className="space-chain__col">
            <text x={c.x} y={11} className="space-chain__head">
              {String(n).padStart(2, '0')} {clip(tx(g?.name, 'en').toUpperCase(), maxChars)}
            </text>
            <line x1={c.x} x2={c.x + c.w} y1={16} y2={16} className="space-chain__rule" style={{ stroke: resolveColorRef(g?.color ?? 'token:ink') }} />
          </g>
        );
      })}
      {layout.links.map((l) => {
        const color = linkColor(l.a, l.b, l.group);
        return (
          <path
            key={`${l.a}-${l.b}`}
            d={l.d}
            className="space-chain__link"
            data-flow={color ? 'on' : undefined}
            style={color ? { stroke: color } : undefined}
          />
        );
      })}
      {layout.nodes.map((n) => {
        const part = byId.get(n.id)!;
        const on = s.part === n.id;
        return (
          <g key={n.id} className="space-chain__node" data-on={on || undefined}>
            <title>{tx(part.name, 'en')} · {tx(part.name, 'zh')}</title>
            <rect x={n.x} y={n.y} width={n.w} height={n.h} />
            <text x={n.x + 4} y={n.y + n.h / 2 + textDy} className="space-chain__n">
              {String(n.n).padStart(2, '0')}
            </text>
            <text x={n.x + 20} y={n.y + n.h / 2 + textDy} className="space-chain__name">
              {clip(tx(part.name, 'en').toUpperCase(), maxChars)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
