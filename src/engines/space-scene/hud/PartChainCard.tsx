/**
 * Top-right card: the part chain as a schematic — groups as columns, parts as
 * numbered nodes, `connects` as hairlines. The selected part is filled in the
 * signal colour; while the scene runs, links inside a group with a flow take
 * the flow colour and march (CSS dash animation).
 */
import { useMemo } from 'react';
import { useScene } from '../../core/context';
import { tx } from '../../../i18n';
import { resolveColorRef } from '../../../theme/theme';
import { partChain } from '../lib/schematic';
import type { SpaceSceneExt } from '../index';
import type { PartsFile } from '../schema';
import { clip, flowingGroups } from './common';

const W = 330;

export function PartChainCard({ file }: { file: PartsFile }) {
  const s = useScene<SpaceSceneExt, { part: string | null; run: boolean; layers: string[] }>((st) => ({
    part: st.part,
    run: st.run,
    layers: st.layers,
  }));
  const layout = useMemo(() => partChain(file.parts, file.groups, W, { row: 21, header: 15 }), [file.parts, file.groups]);
  const flowing = flowingGroups(file, s.run, s.layers);
  const groups = new Map(file.groups.map((g) => [g.id, g]));
  const maxChars = Math.max(6, Math.floor((layout.columns[0]?.w ?? 90) / 5.1) - 3);

  return (
    <svg className="space-chain" viewBox={`0 0 ${W} ${layout.height + 4}`} role="img" aria-label={file.groups.map((g) => tx(g.name, 'en')).join(' · ')}>
      {layout.columns.map((c, i) => {
        const g = groups.get(c.id);
        return (
          <g key={c.id} className="space-chain__col">
            <text x={c.x} y={9} className="space-chain__head">
              {String(i + 1).padStart(2, '0')} {clip(tx(g?.name, 'en').toUpperCase(), maxChars)}
            </text>
            <line x1={c.x} x2={c.x + c.w} y1={13} y2={13} className="space-chain__rule" style={{ stroke: resolveColorRef(g?.color ?? 'token:ink') }} />
          </g>
        );
      })}
      {layout.links.map((l) => {
        const color = l.group ? flowing.get(l.group) : undefined;
        return (
          <path
            key={`${l.a}-${l.b}`}
            d={l.d}
            className="space-chain__link"
            data-flow={color ? 'on' : undefined}
            style={color ? { stroke: resolveColorRef(color) } : undefined}
          />
        );
      })}
      {layout.nodes.map((n) => {
        const part = file.parts[n.n - 1]!;
        const on = s.part === n.id;
        return (
          <g key={n.id} className="space-chain__node" data-on={on || undefined}>
            <title>{tx(part.name, 'en')} · {tx(part.name, 'zh')}</title>
            <rect x={n.x} y={n.y} width={n.w} height={n.h} />
            <text x={n.x + 4} y={n.y + n.h / 2 + 2.8} className="space-chain__n">
              {String(n.n).padStart(2, '0')}
            </text>
            <text x={n.x + 17} y={n.y + n.h / 2 + 2.8} className="space-chain__name">
              {clip(tx(part.name, 'en').toUpperCase(), maxChars)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
