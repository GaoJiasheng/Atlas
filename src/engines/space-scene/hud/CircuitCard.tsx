/**
 * The live circuit diagram (docs/23 §4.3 C2): the top-right card of a topic
 * whose try-it model is a circuit with a `diagram` (in place of the part
 * chain), and inside the try-it card below 1024 px where the card is hidden.
 *
 * IEC-style symbols on right-angled wires (lib/sim/diagram.ts): cells as long
 * (+) and short (−) lines, one pair per cell and turned round when a cell is,
 * a lamp as a circle with a cross (warming with its brightness, dashed when
 * unscrewed), a switch as a lever over two terminals, a buzzer, a motor (M),
 * the test gap's two terminals with whatever bridges them. Wires and symbols
 * that carry current are drawn in the current colour (hot in a short circuit)
 * with an arrow from the positive end round to the negative. A switch symbol
 * flips the real switch (the same store value as the try-it card, the keys
 * and the URL); any other symbol selects its part, and the selected part's
 * symbol is outlined in signal. Hit areas are 44 px.
 */
import type { KeyboardEvent } from 'react';
import { useScene, useSceneContext, useT } from '../../core/context';
import { tx } from '../../../i18n';
import type { SpaceSceneExt } from '../index';
import type { PartsFile } from '../schema';
import type { CircuitData, SimData, SimValues } from '../sim-schema';
import { diagramEdges, diagramJunctions, polylinePath, SYMBOL_LENGTH, type DiagramEdge, type P2 } from '../lib/sim/diagram';
import { OPEN_AMPS, solveCircuit } from '../lib/sim/circuit';
import { setSim, useSimStore, useSimView } from './sim';

const PAD = 18;
const HALF = SYMBOL_LENGTH / 2;
const f2 = (n: number) => Math.round(n * 100) / 100;

function cellCount(edge: DiagramEdge['edge'], values: SimValues): number {
  return typeof edge.cells === 'string' ? Math.max(1, Number(values[edge.cells]) || 1) : (edge.cells ?? 1);
}

/** The symbol of one edge, drawn along +x about the origin (the caller rotates it onto the wire). */
function Symbol({ e, c, values, current }: { e: DiagramEdge; c: CircuitData; values: SimValues; current: number }) {
  const edge = e.edge;
  switch (edge.kind) {
    case 'battery': {
      const n = cellCount(edge, values);
      const step = Math.min(8, (SYMBOL_LENGTH - 4) / n);
      const w = n * step;
      const x0 = -w / 2;
      return (
        <g className="space-cd__sym">
          <path d={`M${-HALF} 0H${f2(x0 + 1)}M${f2(x0 + w - 1)} 0H${HALF}`} />
          {Array.from({ length: n }, (_, i) => {
            const flipped = edge.flip?.[String(i + 1)] !== undefined && values[edge.flip[String(i + 1)]!] === true;
            const a = x0 + i * step + 1;
            const b = a + step / 2;
            // From the negative end: short (−) line, then long (+) line; a cell turned round the other way.
            const [short, long] = flipped ? [b, a] : [a, b];
            return (
              <g key={i}>
                <path className="space-cd__neg" d={`M${f2(short)} -5V5`} />
                <path className="space-cd__pos" d={`M${f2(long)} -10V10`} />
                {i < n - 1 && <path d={`M${f2(b)} 0H${f2(a + step)}`} />}
              </g>
            );
          })}
        </g>
      );
    }
    case 'switch': {
      const closed = values[edge.control!] === true;
      return (
        <g className="space-cd__sym">
          <path d={`M${-HALF} 0H-11M11 0H${HALF}`} />
          <circle className="space-cd__term" cx={-11} cy={0} r={2.2} />
          <circle className="space-cd__term" cx={11} cy={0} r={2.2} />
          <path className="space-cd__lever" d={closed ? 'M-11 0L11 0' : 'M-11 0L8 -10'} />
        </g>
      );
    }
    case 'gap': {
      const m = String(values[edge.control!]);
      const r = c.materials[m];
      return (
        <g className="space-cd__sym">
          <path d={`M${-HALF} 0H-9M9 0H${HALF}`} />
          <circle className="space-cd__term" cx={-9} cy={0} r={2.5} />
          <circle className="space-cd__term" cx={9} cy={0} r={2.5} />
          {r !== undefined && <path className="space-cd__bridge" data-weak={r > 1 || undefined} d="M-6.5 0H6.5" />}
        </g>
      );
    }
    case 'load': {
      const present = edge.present === undefined || values[edge.present] === true;
      const load = c.loads[edge.load ?? String(values[edge.control!])];
      const stubs = <path d={`M${-HALF} 0H-9M9 0H${HALF}`} />;
      if (load?.kind === 'motor')
        return (
          <g className="space-cd__sym" data-out={!present || undefined}>
            {stubs}
            <circle cx={0} cy={0} r={9} />
            <text className="space-cd__m" x={0} y={3.6} textAnchor="middle">
              M
            </text>
          </g>
        );
      if (load?.kind === 'buzzer')
        return (
          <g className="space-cd__sym" data-out={!present || undefined}>
            {stubs}
            <path d="M-9 3A9 9 0 0 1 9 3Z" />
            <path d="M-4 3V7M4 3V7" />
          </g>
        );
      // The lamp warms with its brightness (power ÷ the reference power), like the filament on the stage.
      const level = load ? Math.sqrt((current * current * load.r) / c.reference.power) : 0;
      return (
        <g className="space-cd__sym" data-out={!present || undefined}>
          {stubs}
          <circle className="space-cd__lamp" cx={0} cy={0} r={9} style={{ fillOpacity: present ? Math.min(0.85, level * 0.6) : 0 }} />
          <path d="M-6.36 -6.36L6.36 6.36M-6.36 6.36L6.36 -6.36" />
        </g>
      );
    }
    case 'wire':
      return null;
  }
}

export function CircuitDiagram({ file, sim }: { file: PartsFile; sim: SimData }) {
  const t = useT();
  const { locale } = useSceneContext();
  const store = useSimStore();
  const view = useSimView(file);
  const selected = useScene<SpaceSceneExt, string | null>((s) => s.part);
  const c = sim.circuit;
  if (!c?.diagram || !view) return null;
  const edges = diagramEdges(c);
  const solved = solveCircuit(c, view.values);
  const currents = solved.edges;
  // A short circuit anywhere draws the current hot.
  const state = Object.entries(solved.quantities).some(([k, v]) => k.startsWith('status:') && v === 'short') ? 'short' : '';
  const [w, h] = c.diagram.size;
  const partName = (id: string | undefined) => {
    const p = id ? file.parts.find((x) => x.id === id) : undefined;
    return p ? tx(p.name, locale) : '';
  };
  const act = (e: DiagramEdge) => {
    const ctl = e.edge.kind === 'switch' ? sim.controls.find((x) => x.id === e.edge.control) : undefined;
    if (ctl) setSim(store, sim, ctl.id, !(view.values[ctl.id] === true));
    else if (e.edge.part) store.getState().patch({ part: e.edge.part });
  };
  const onKey = (e: DiagramEdge) => (ev: KeyboardEvent<SVGGElement>) => {
    if (ev.key !== 'Enter' && ev.key !== ' ') return;
    ev.preventDefault();
    act(e);
  };
  return (
    <svg
      className="space-cd"
      viewBox={`${-PAD} ${-PAD} ${w + 2 * PAD} ${h + 2 * PAD}`}
      preserveAspectRatio="xMidYMid meet"
      role="group"
      aria-label={t('space.circuit.label')}
      data-state={state || undefined}
    >
      <defs>
        <marker id="space-cd-arrow" viewBox="0 0 8 8" refX="4" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0L8 4L0 8Z" className="space-cd__arrowhead" />
        </marker>
      </defs>
      {edges.map((e) => {
        const i = currents[e.edge.id] ?? 0;
        const on = Math.abs(i) >= OPEN_AMPS;
        const angle = (Math.atan2(e.dir[1], e.dir[0]) * 180) / Math.PI;
        const longest = e.wires.reduce((best, piece) => (pieceLength(piece) > pieceLength(best) ? piece : best), e.wires[0]!);
        const arrow = on && pieceLength(longest) > 14 ? arrowOn(longest, i > 0) : null;
        const isSwitch = e.edge.kind === 'switch';
        const name = partName(e.edge.part);
        const interactive = isSwitch || e.edge.part !== undefined;
        const label = isSwitch
          ? t('space.circuit.flip', {
              name: tx(sim.controls.find((x) => x.id === e.edge.control)?.label ?? { en: '', zh: '' }, locale),
              state: t(view.values[e.edge.control!] === true ? 'space.state.on' : 'space.state.off'),
            })
          : t('space.circuit.select', { name });
        return (
          <g key={e.edge.id} className="space-cd__edge" data-edge={e.edge.id} data-on={on || undefined} data-picked={(e.edge.part !== undefined && e.edge.part === selected) || undefined}>
            {e.wires.map((piece, k) => (
              <path key={k} className="space-cd__wire" d={polylinePath(piece)} />
            ))}
            {arrow && <path className="space-cd__arrow" d={`M${f2(arrow[0][0])} ${f2(arrow[0][1])}L${f2(arrow[1][0])} ${f2(arrow[1][1])}`} markerEnd="url(#space-cd-arrow)" />}
            {e.edge.kind !== 'wire' && (
              <g
                transform={`translate(${f2(e.at[0])} ${f2(e.at[1])}) rotate(${f2(angle)})`}
                className="space-cd__hit"
                data-sim-switch={isSwitch ? e.edge.control : undefined}
                {...(interactive
                  ? { role: 'button', tabIndex: 0, 'aria-label': label, 'aria-pressed': isSwitch ? view.values[e.edge.control!] === true : undefined, onClick: () => act(e), onKeyDown: onKey(e) }
                  : {})}
              >
                <title>{interactive ? label : name}</title>
                <rect x={-22} y={-22} width={44} height={44} className="space-cd__target" />
                <Symbol e={e} c={c} values={view.values} current={Math.abs(i)} />
              </g>
            )}
          </g>
        );
      })}
      {diagramJunctions(c).map((p, k) => (
        <circle key={k} className="space-cd__node" cx={p[0]} cy={p[1]} r={2.4} />
      ))}
      {c.diagram.labels?.map((l, k) => (
        <text key={k} className="space-cd__label" x={l.at[0]} y={l.at[1]}>
          {tx(l.text, locale).toLocaleUpperCase(locale === 'zh' ? 'zh' : 'en')}
        </text>
      ))}
    </svg>
  );
}

function pieceLength(piece: readonly P2[]): number {
  let l = 0;
  for (let i = 1; i < piece.length; i++) l += Math.hypot(piece[i]![0] - piece[i - 1]![0], piece[i]![1] - piece[i - 1]![1]);
  return l;
}

/** A short arrow at the middle of the longest straight run of a wire piece, pointing the way the current goes. */
function arrowOn(piece: readonly P2[], forward: boolean): [P2, P2] {
  let best = 0;
  let bestLen = -1;
  for (let i = 0; i < piece.length - 1; i++) {
    const l = Math.hypot(piece[i + 1]![0] - piece[i]![0], piece[i + 1]![1] - piece[i]![1]);
    if (l > bestLen) {
      bestLen = l;
      best = i;
    }
  }
  const a = piece[best]!;
  const b = piece[best + 1]!;
  const m: P2 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const d: P2 = [((b[0] - a[0]) / bestLen) * (forward ? 1 : -1), ((b[1] - a[1]) / bestLen) * (forward ? 1 : -1)];
  return [
    [m[0] - d[0] * 3, m[1] - d[1] * 3],
    [m[0] + d[0] * 3, m[1] + d[1] * 3],
  ];
}

/** The top-right card (slot `card`) of a circuit topic. */
export function CircuitCard({ file }: { file: PartsFile }) {
  if (!file.sim?.circuit?.diagram) return null;
  return (
    <div className="space-cd-card">
      <CircuitDiagram file={file} sim={file.sim} />
    </div>
  );
}
