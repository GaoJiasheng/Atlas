/**
 * The life-cycle ring card (docs/33 §4.3 E-M2): the top-right card of a topic
 * whose try-it model is `life-cycle` (in place of the part chain), and
 * inside the try-it card below 1024 px where the card is hidden. The stages
 * on a ring (lib/sim/cycle.ts), first at 12 o'clock, clockwise; each arc
 * says how many days the stage before it takes at the water temperature on
 * show (the egg's note, "lays eggs" back round), the stages in water sit on
 * a cold band, the stage on the day on show is filled in signal, the centre
 * reads hatching-to-adult and the temperature. All numbers come from the
 * model (SIM, "in this model"); they fade over 0.3 s when a control
 * changes. A node selects its stage's part (44 px hit areas, Enter /
 * Space). With `card.compare` a switch shows a second ring below (another
 * animal's stages, no days) and a link to its topic. Screen readers get the
 * ring as words.
 */
import { useId, type KeyboardEvent } from 'react';
import { useScene, useSceneContext, useT } from '../../core/context';
import { localeHref, tx } from '../../../i18n';
import type { SpaceSceneExt } from '../index';
import type { PartsFile } from '../schema';
import type { SimData } from '../sim-schema';
import { solveLifeCycle, stageSpans } from '../lib/sim/lifecycle';
import { cycleArcWords, cycleGroups, cycleSummary, daysText, ringLayout, type RingLayout, type RingText } from '../lib/sim/cycle';
import { formatReading } from '../lib/telemetry';
import { valueText } from '../lib/sim/text';
import { setSim, useSimStore, useSimView } from './sim';

const W = 300;
const R = 76;
const CY = 106;
/** A node's hit square in viewBox units: 44 CSS px while the card is drawn at 82 % or more (the right column at 1280 px). */
const HIT = 54;
/** The second ring (another animal's cycle) below the first. */
const R2 = 30;

function Text({ at, className, children }: { at: RingText; className: string; children: string }) {
  return (
    <text className={className} x={at.x} y={at.y} textAnchor={at.anchor}>
      {children}
    </text>
  );
}

function Arcs({ lay }: { lay: RingLayout }) {
  return (
    <>
      {lay.arcs.map((a) => (
        <g key={`${a.from}-${a.to}`} className="space-cy__arc" data-arc={`${a.from}-${a.to}`}>
          <path className="space-cy__line" d={a.d} />
          <path className="space-cy__head" d="M -3.2 -2.6 L 3.2 0 L -3.2 2.6 Z" transform={`translate(${a.arrow.x} ${a.arrow.y}) rotate(${a.arrow.rotate})`} />
        </g>
      ))}
    </>
  );
}

export function CycleDiagram({ file, sim }: { file: PartsFile; sim: SimData }) {
  const t = useT();
  const { locale } = useSceneContext();
  const store = useSimStore();
  const view = useSimView(file);
  const selected = useScene<SpaceSceneExt, string | null>((s) => s.part);
  // Two diagrams can be on one page (the top-right card and the try-it card): their band paths need their own ids.
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const lc = sim.lifeCycle;
  if (!lc || !view) return null;
  const q = solveLifeCycle(lc, view.values, sim.controls);
  const stage = String(q.stage);
  const tempControl = sim.controls.find((c) => c.id === lc.temp);
  const tempText = tempControl ? valueText(tempControl, view.values[lc.temp], locale) : '';
  const spans = stageSpans(lc, Number(view.values[lc.temp]))?.spans ?? [];
  const total = typeof q['to-adult'] === 'number' ? q['to-adult'] : NaN;
  const groups = cycleGroups(lc);
  const lay = ringLayout(lc.stages, { cx: W / 2, cy: CY, radius: R, groups });
  const words = cycleArcWords(lc, spans);
  const cmp = lc.card?.compare;
  const comparing = cmp !== undefined && view.values[cmp.control] === true;
  const second = comparing ? ringLayout(cmp.stages, { cx: W / 2, cy: CY + R + 78 + R2, radius: R2, node: 5, outside: 9, places: false }) : null;
  const height = second ? second.cy + R2 + 22 : CY + R + 34;
  const parts = new Map(file.parts.map((p) => [p.id, p]));
  const summary = cycleSummary(lc, spans, tempText, locale);
  const arcText = (i: number): string => {
    const w = words[i]!;
    if (w.kind === 'days') return daysText(w.days, locale);
    if (w.kind === 'note') return tx(lc.stages[i]!.note, locale);
    if (w.kind === 'lays') return t('space.cycle.lays');
    return '';
  };
  const pick = (part: string | undefined) => {
    if (part && parts.has(part)) store.getState().patch({ part });
  };
  const onKey = (part: string | undefined) => (ev: KeyboardEvent<SVGGElement>) => {
    if (ev.key !== 'Enter' && ev.key !== ' ') return;
    ev.preventDefault();
    pick(part);
  };
  const link = cmp?.link
    ? { href: localeHref(locale, `/topics/${cmp.link.topic}/`) + (cmp.link.chapter ? `?ch=${encodeURIComponent(cmp.link.chapter)}` : ''), label: tx(cmp.link.label, locale) }
    : null;
  const cmpName = cmp ? tx(cmp.label, locale) : '';
  const compareControl = cmp ? sim.controls.find((c) => c.id === cmp.control) : undefined;
  return (
    <div className="space-cy-wrap">
      <svg className="space-cy" viewBox={`0 0 ${W} ${height}`} role="group" aria-label={summary} data-stage={stage} data-compare={comparing || undefined}>
        {lay.bands.map((b) => (
          <path key={b.stages.join('-')} id={`space-cy-${uid}-${b.stages[0]}`} className="space-cy__band" d={b.d} style={{ strokeWidth: b.width }} data-band={b.stages.join(' ')} />
        ))}
        {lay.bands.map((b) => (
          <text key={`w-${b.stages[0]}`} className="space-cy__water" dy={2.6}>
            <textPath href={`#space-cy-${uid}-${b.stages[0]}`} startOffset="3%">
              {t('space.cycle.inWater').toUpperCase()}
            </textPath>
          </text>
        ))}
        {lay.brackets.map((b) => {
          const g = groups.find((x) => x.id === b.group);
          return (
            <g key={b.group} className="space-cy__group" data-group={b.group}>
              <path className="space-cy__bracket" d={b.d} />
              {g?.label && <Text at={b.label} className="space-cy__groupname">{tx(g.label, locale)}</Text>}
            </g>
          );
        })}
        <Arcs lay={lay} />
        {lay.arcs.map((a, i) => {
          const s = arcText(i);
          return s ? (
            <Text key={`t-${a.from}-${s}`} at={a.text} className={words[i]!.kind === 'days' ? 'space-cy__days' : 'space-cy__note'}>
              {s}
            </Text>
          ) : null;
        })}
        {lay.nodes.map((n, i) => {
          const st = lc.stages[i]!;
          const name = tx(st.label, locale);
          const w = words[i]!;
          const on = n.id === stage;
          const interactive = st.part !== undefined && parts.has(st.part);
          const aria = `${name}${w.kind === 'days' ? `, ${t('space.cycle.daysLong', { n: formatReading(w.days, 1) })}` : w.kind === 'note' ? `, ${tx(st.note, locale)}` : ''}`;
          return (
            <g
              key={n.id}
              className="space-cy__node"
              data-node={n.id}
              data-on={on || undefined}
              data-small={n.small || undefined}
              data-picked={(interactive && st.part === selected) || undefined}
              {...(interactive ? { role: 'button', tabIndex: 0, 'aria-label': aria, 'aria-current': on ? ('step' as const) : undefined, onClick: () => pick(st.part), onKeyDown: onKey(st.part) } : {})}
            >
              {interactive && <rect className="space-cy__target" x={n.x - HIT / 2} y={n.y - HIT / 2} width={HIT} height={HIT} />}
              {n.wall && <line className="space-cy__wall" x1={n.wall.x} y1={n.wall.y1} x2={n.wall.x} y2={n.wall.y2} />}
              <circle className="space-cy__dot" cx={n.x} cy={n.y} r={n.r} />
              <Text at={n.label} className="space-cy__name">{name}</Text>
            </g>
          );
        })}
        <g className="space-cy__centre">
          <text key={`c-${total}`} className="space-cy__total" x={W / 2} y={CY - 2} textAnchor="middle">
            {Number.isFinite(total) ? `≈ ${daysText(total, locale)}` : '—'}
          </text>
          <text key={`tc-${tempText}`} className="space-cy__temp" x={W / 2} y={CY + 11} textAnchor="middle">
            {tempText}
          </text>
        </g>
        {second && cmp && (
          <g className="space-cy__second" data-second="">
            <text className="space-cy__title" x={W / 2} y={second.cy - R2 - 30} textAnchor="middle">
              {cmpName.toUpperCase()}
            </text>
            <Arcs lay={second} />
            {second.nodes.map((n, i) => (
              <g key={n.id} className="space-cy__node" data-node2={n.id}>
                <circle className="space-cy__dot" cx={n.x} cy={n.y} r={n.r} />
                <Text at={n.label} className="space-cy__name">{tx(cmp.stages[i]!.label, locale)}</Text>
              </g>
            ))}
          </g>
        )}
        <text className="space-cy__sim" x={0} y={height - 4}>
          <tspan className="space-cy__chip">SIM</tspan>
          {` ${t('space.try.model')}`}
        </text>
      </svg>
      {cmp && (
        <div className="space-cy__foot">
          <button
            type="button"
            role="switch"
            aria-checked={comparing}
            className="space-try__switch space-cy__compare"
            data-cycle-compare={cmp.control}
            onClick={() => setSim(store, sim, cmp.control, !comparing)}
          >
            <span className="space-try__toggle" aria-hidden="true">
              <i />
            </span>
            <span>{compareControl ? tx(compareControl.label, locale) : cmpName}</span>
          </button>
          {comparing && link && (
            <a className="space-cy__link" href={link.href}>
              {link.label}
            </a>
          )}
        </div>
      )}
    </div>
  );
}

/** The top-right card (slot `card`) of a life-cycle topic. */
export function CycleCard({ file }: { file: PartsFile }) {
  if (!file.sim?.lifeCycle) return null;
  return (
    <div className="space-cy-card">
      <CycleDiagram file={file} sim={file.sim} />
    </div>
  );
}
