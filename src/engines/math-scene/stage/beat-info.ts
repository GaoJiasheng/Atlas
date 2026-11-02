/** Pure beat metadata shared by the HUD and the optional stage renderers. */
import type { Beat } from '../schema';
import type { Frac } from '../lib/fraction';
import { formatDecimal } from '../lib/decimal';
import { thingsOf } from '../lib/array';
import { partsOf } from '../lib/instrument';
import { netItems } from '../lib/net-view';
import { facesOf } from '../lib/clock';
import { rangeOf } from '../lib/timeline';
import { naturalUnits } from '../lib/value';
import type { TimeShown } from '../hud/cards/TimeCard';
import { timelineNow } from './timeline-now';
const indices = (set: number | number[] | undefined): number[] => (set === undefined ? [] : Array.isArray(set) ? [...set] : Array.from({ length: set }, (_, i) => i));

export function beatShape(beat: Beat): string {
  const m = beat.model;
  switch (m.kind) {
    case 'bar':
      return `bar|${m.parts}|${m.wholes ?? 1}|${m.cuts?.join(',') ?? ''}|${m.diagonal ? 'd' : ''}|${m.rows?.map((r) => r.parts).join(',') ?? ''}`;
    case 'circle':
      return `circle|${m.parts}`;
    case 'numberline':
      if (m.scale === 'decimal') return `dline|${formatDecimal(m.from)}|${formatDecimal(m.to)}|${formatDecimal(m.step)}|${(m.zoom ?? []).map((z) => formatDecimal(z.from)).join(',')}${beat.under ? `|${beatShape({ ...beat, model: beat.under, under: undefined })}` : ''}`;
      return m.scale === 'whole' ? `wline|${m.from}|${m.to}|${m.step ?? 1}` : `line|${m.from}|${m.to}|${m.intervals}`;
    case 'wall':
      return `wall|${m.rows.join(',')}`;
    case 'barmodel':
      return `barmodel|${m.bars.map((b) => b.id).join(',')}`;
    case 'grid':
      // Squares laid, sides walked, dimensions and highlights change in place; new figures, a cut or another scale remount.
      return `grid|${m.unit}|${m.show}|${JSON.stringify(m.figures.map((f) => [f.rect, f.rects, f.cells, f.poly, f.halves]))}|${JSON.stringify(m.cuts ?? [])}|${m.apart ? 'apart' : ''}`;
    case 'array':
      // The same things keep the drawing (grouped, dealt, arranged: each one moves); a quarter turn remounts it, turning in.
      return `array|${m.object}|${thingsOf(m)}|${m.pair ? 'pair' : ''}${beat.move === 'rotate' ? `|turn${m.rows}x${m.cols}` : ''}${beat.under ? `|${beatShape({ ...beat, model: beat.under, under: undefined })}` : ''}`;
    case 'blocks':
      // The rows of a × pushed together, a trade or a share change in place (each block keeps its key); another number remounts.
      return `blocks|${m.value ?? ''}|${m.mat}|${m.plates ?? 0}|${m.column ? `${m.column.op}${m.column.a}.${m.column.b}` : ''}`;
    case 'decimal-grid':
      // Shading changes in place (the squares ease); another size, another number of wholes or a magnifier remounts.
      return `dgrid|${(m.pair ?? [m]).map((g) => `${g.level}.${g.wholes ?? 1}.${g.zoom ? formatDecimal(g.zoom.at) : ''}`).join(',')}${beat.under ? `|${beatShape({ ...beat, model: beat.under, under: undefined })}` : ''}`;
    case 'place-value':
      // The chart is redrawn for each beat: the move (a trade, a slide, a line-up) plays as it comes in.
      return `pv|${JSON.stringify(m)}`;
    case 'money':
      return `money|${m.layout}|${JSON.stringify(m.pair ?? m.pieces ?? (m.amount ? formatDecimal(m.amount) : ''))}`;
    case 'instrument':
      // The same scale keeps its drawing (a thing slides, a needle sweeps, a level fills, a beam tips, a dial unrolls, arcs and a magnifier come);
      // another scale, another instrument or another number of them remounts.
      return `instrument|${partsOf(m)
        .map((x) => [x.type, x.unit, x.from && formatDecimal(x.from), x.to && formatDecimal(x.to), x.major && formatDecimal(x.major), x.minor && formatDecimal(x.minor), x.look, x.orient, x.shape, x.scale, x.broken, x.inset && formatDecimal(x.inset), x.sub?.unit, x.dual, x.skip && formatDecimal(x.skip.from)].join(','))
        .join('|')}`;
    case 'net':
      // The same net keeps its drawing (it folds, unfolds, turns, its colours come in); another solid, another layout or a set remounts.
      return `net|${m.set ? 'set|' : ''}${JSON.stringify(netItems(m).map((x) => [x.solid, x.layout, x.curved, x.base, x.open]))}`;
    case 'clock':
    case 'timeline': {
      // The same face keeps its drawing (the hands sweep to the new time, a lens comes and goes; new jumps are drawn on); another face or ruler remounts.
      const shape = (x: Beat['model']) =>
        x.kind === 'clock' ? `clock|${facesOf(x).map((f) => f.face).join(',')}` : x.kind === 'timeline' ? `timeline|${x.scale}|${rangeOf(x).from}-${rangeOf(x).to}|${x.labels}|${x.clock ? 'c' : ''}` : x.kind;
      return `${shape(m)}${beat.under ? `|${shape(beat.under)}` : ''}`;
    }
  }
}

export function beatValue(beat: Beat): Frac | null {
  const m = beat.model;
  if (m.kind !== 'bar' && m.kind !== 'circle') return null;
  if (m.kind === 'bar' && (m.rows || m.cuts || m.diagonal || !m.parts)) return null;
  const count = indices(m.given).length + indices(m.shaded).length - indices(beat.crossed).length;
  return count > 0 ? { n: count, d: m.parts! } : null;
}

export function beatFraction(beat: Beat): Frac | null {
  const m = beat.model;
  // Two lit rows are a comparison (the card shows the pair); more are equivalents or an order (the first names them).
  if (m.kind === 'wall') return beat.highlight && beat.highlight.length !== 2 ? beat.highlight[0]! : null;
  if (m.kind === 'numberline') return m.scale === 'decimal' ? null : (m.marks?.at(-1) ?? m.arrow ?? null);
  if (m.kind === 'bar' && m.rows) return { n: indices(m.rows[0]!.given).length, d: m.rows[0]!.parts ?? 1 };
  return beatValue(beat);
}

export function beatPair(beat: Beat): { a: Frac; b: Frac; open: boolean } | null {
  const m = beat.model;
  const open = beat.equation?.includes('○') ?? false;
  // A sum or a difference written on stacked bars is not a comparison.
  if (/[+−]/.test(beat.equation ?? '')) return null;
  if (m.kind === 'wall' && beat.highlight?.length === 2) return { a: beat.highlight[0]!, b: beat.highlight[1]!, open };
  if (m.kind === 'bar' && m.rows?.length === 2) {
    const f = (r: { given?: number | number[]; parts: number | null }): Frac => ({ n: indices(r.given).length, d: r.parts ?? 1 });
    return { a: f(m.rows[0]!), b: f(m.rows[1]!), open };
  }
  return null;
}

export function beatCounts(beat: Beat): { parts: number | null; marked: number | null } {
  const m = beat.model;
  if (m.kind === 'grid') return { parts: null, marked: null };
  if (m.kind === 'bar' && !m.rows) {
    const parts = (m.cuts ? m.cuts.length + 1 : m.diagonal ? 2 : (m.parts ?? 1)) * (m.wholes ?? 1);
    return { parts, marked: indices(m.given).length + indices(m.shaded).length - indices(beat.crossed).length };
  }
  if (m.kind === 'circle') return { parts: m.parts, marked: indices(m.given).length + indices(m.shaded).length - indices(beat.crossed).length };
  if (m.kind === 'numberline') return { parts: m.scale === 'fraction' ? (m.intervals ?? 1) * (m.to - m.from) : null, marked: null };
  return { parts: null, marked: null };
}

export function beatTime(beat: Beat): TimeShown | null {
  const models = [beat.model, ...(beat.under ? [beat.under] : [])];
  for (const m of models) {
    if (m.kind !== 'clock') continue;
    const f = facesOf(m)[0]!;
    if (f.face === 'stopwatch') return { seconds: f.elapsed?.t ?? 0, units: naturalUnits(f.elapsed?.t ?? 0) };
    return { at: f.time, mode: f.ampm === 'show' ? '12' : f.inner24 ? '24' : 'face' };
  }
  for (const m of models) {
    if (m.kind !== 'timeline') continue;
    if (rangeOf(m).duration) {
      const seconds = (m.jumps ?? []).reduce((a, [x, y]) => a + Math.abs(y - x), 0);
      return seconds > 0 ? { seconds, units: naturalUnits(seconds) } : null;
    }
    return { at: timelineNow(m, null, null), mode: m.labels === '24h' ? '24' : '12' };
  }
  return null;
}
