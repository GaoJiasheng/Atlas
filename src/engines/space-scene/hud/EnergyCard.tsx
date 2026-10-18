/**
 * The energy-chain card (docs/31 E-EN2): the top-right card of a topic whose
 * try-it model is `energy` (in place of the part chain), and inside the
 * try-it card below 1024 px where the card is hidden. A small Sankey diagram
 * (lib/sim/sankey.ts) of the chain on show: nodes are parts (short names; a
 * node selects its part, the selected one outlined in signal) or places such
 * as "the air around"; each band is one form of energy in its colour token,
 * as wide as its share, with the percentage on bands of 8 % or more;
 * potential energy is stored, so a node that only keeps potential energy is
 * drawn as a wider solid block in the potential colour (the KEY names it). Percentages are SIM: the
 * card says "in this model". A new chain fades in over 0.4 s. Screen readers
 * get the chain as words. Hit areas are 44 px.
 */
import type { KeyboardEvent } from 'react';
import { useScene, useSceneContext, useT } from '../../core/context';
import { tx } from '../../../i18n';
import type { SpaceSceneExt } from '../index';
import type { PartsFile } from '../schema';
import type { EnergyForm, SimData } from '../sim-schema';
import { currentChain } from '../lib/sim/energy';
import { sankeyLayout, SANKEY_DEFAULTS } from '../lib/sim/sankey';
import { clip } from './common';
import { useSimStore, useSimView } from './sim';

const W = 330;
/** Room right of the last column for its names (the air around, the water). */
const RIGHT = 84;
/** Bands at least this many % carry their percentage. */
const LABEL_FROM = 8;
const CHAR = 5.6;

export function EnergyDiagram({ file, sim }: { file: PartsFile; sim: SimData }) {
  const t = useT();
  const { locale } = useSceneContext();
  const store = useSimStore();
  const view = useSimView(file);
  const selected = useScene<SpaceSceneExt, string | null>((s) => s.part);
  const e = sim.energy;
  if (!e || !view) return null;
  const f = currentChain(e, view.values);
  const chain = f.chain;
  const parts = new Map(file.parts.map((p) => [p.id, p]));
  const nodeName = (id: string) => {
    const n = chain?.nodes.find((x) => x.id === id);
    const p = n?.part ? parts.get(n.part) : undefined;
    return n?.label ? tx(n.label, locale) : p ? tx(p.short ?? p.name, locale) : id;
  };
  const links = (chain?.links ?? []).map((l) => ({ id: l.id, from: l.from, to: l.to, value: f.links[l.id] ?? 0 }));
  const lay = sankeyLayout(chain?.nodes ?? [], links, { width: W, right: RIGHT });
  const formOf = new Map((chain?.links ?? []).map((l) => [l.id, l.form as EnergyForm]));
  const formName = (form: EnergyForm) => t(`space.energy.form.${form}`);
  // A node that only keeps potential energy (the lift car at the top, the ball at the top of its bounce): a solid block.
  const stored = new Set(lay.nodes.filter((n) => !lay.bands.some((b) => b.from === n.id) && lay.bands.filter((b) => b.to === n.id).every((b) => formOf.get(b.id) === 'potential')).map((n) => n.id));
  const words = lay.bands.map((b) => `${nodeName(b.from)} → ${nodeName(b.to)}: ${formName(formOf.get(b.id)!)} ${b.value} %`).join('; ');
  // Every name starts at its node, above it: one column's names end before the next column starts; the last column's run into the room on the right.
  const span = lay.columns > 1 ? (W - SANKEY_DEFAULTS.left - RIGHT - SANKEY_DEFAULTS.nodeWidth) / (lay.columns - 1) : W - RIGHT;
  const fits = (column: number) => Math.max(6, Math.floor(((column === lay.columns - 1 ? RIGHT + SANKEY_DEFAULTS.nodeWidth : span) - 8) / CHAR));
  const height = Math.max(lay.height, 40) + 22;
  const pick = (id: string) => {
    const part = chain?.nodes.find((n) => n.id === id)?.part;
    if (part) store.getState().patch({ part });
  };
  const onKey = (id: string) => (ev: KeyboardEvent<SVGGElement>) => {
    if (ev.key !== 'Enter' && ev.key !== ' ') return;
    ev.preventDefault();
    pick(id);
  };
  return (
    <svg className="space-ec" viewBox={`0 0 ${W} ${height}`} role="group" aria-label={t('space.energy.label', { text: words || t('space.energy.none') })}>
      <g key={f.id ?? ''} className="space-ec__chain">
        {lay.nodes.length === 0 && (
          <text className="space-ec__none" x={W / 2} y={height / 2} textAnchor="middle">
            {t('space.energy.none')}
          </text>
        )}
        {lay.bands.map((b) => {
          const form = formOf.get(b.id)!;
          return (
            <path key={b.id} className="space-ec__band" data-form={form} data-link={b.id} d={b.d} style={{ stroke: `var(--en-${form})`, strokeWidth: b.w }}>
              <title>{`${formName(form)} ${b.value} %`}</title>
            </path>
          );
        })}
        {lay.bands
          .filter((b) => b.value >= LABEL_FROM)
          .map((b) => (
            <text key={b.id} className="space-ec__pct" x={(b.x0 + b.x1) / 2} y={(b.y0 + b.y1) / 2 + 3.4} textAnchor="middle">
              {`${b.value} %`}
            </text>
          ))}
        {lay.nodes.map((n) => {
          const node = chain!.nodes.find((x) => x.id === n.id)!;
          const name = clip(nodeName(n.id), fits(n.column));
          const block = stored.has(n.id);
          const interactive = node.part !== undefined;
          const label = t('space.energy.select', { name: nodeName(n.id) });
          return (
            <g
              key={n.id}
              className="space-ec__node"
              data-node={n.id}
              data-picked={(node.part !== undefined && node.part === selected) || undefined}
              data-sink={node.sink || undefined}
              data-stored={block || undefined}
              {...(interactive ? { role: 'button', tabIndex: 0, 'aria-label': label, onClick: () => pick(n.id), onKeyDown: onKey(n.id) } : {})}
            >
              {interactive && <rect className="space-ec__target" x={n.x + SANKEY_DEFAULTS.nodeWidth / 2 - 22} y={n.y + n.h / 2 - 22} width={44} height={44} />}
              <rect className="space-ec__bar" x={block ? n.x - SANKEY_DEFAULTS.nodeWidth : n.x} y={n.y} width={block ? SANKEY_DEFAULTS.nodeWidth * 2 : SANKEY_DEFAULTS.nodeWidth} height={n.h} />
              <text className="space-ec__name" x={n.x} y={n.y - 4}>
                {name}
              </text>
            </g>
          );
        })}
      </g>
      <text className="space-ec__sim" x={0} y={height - 4}>
        <tspan className="space-ec__chip">SIM</tspan>
        {` ${t('space.try.model')}${chain?.note ? ` · ${tx(chain.note, locale)}` : ''}`}
      </text>
    </svg>
  );
}

/** The top-right card (slot `card`) of an energy topic. */
export function EnergyCard({ file }: { file: PartsFile }) {
  if (!file.sim?.energy) return null;
  return (
    <div className="space-ec-card">
      <EnergyDiagram file={file} sim={file.sim} />
    </div>
  );
}
