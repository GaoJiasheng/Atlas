/**
 * The top-right card of a grid lesson (docs/19 §3.0 G3 AREA, docs/21 §3): the
 * figure on show in the lesson's units — its size (length × breadth, a
 * square's side, or how many sides a rectilinear figure has), its area and
 * its perimeter. An explanation beat shows what the beat has measured (laid,
 * walked, or given by the dimensions; "?" while a length is the question). On
 * a check the card never says the answer first: the given lengths and the
 * child's own work (squares laid, sides traced, the rectangle drawn, the two
 * pieces) until the check is done.
 */
import type { Locale } from '../../core/types';
import { t } from '../../../i18n';
import type { GridModelSpec, Task } from '../schema';
import { dimEnds, factsOf, figureOf, isHalfKey, parseCell, parseCut, piecesAfter, readingOrder, rectOf, type Facts } from '../lib/grid';
import { taskFigure, type TaskState } from '../lib/state';
import { squared, unitText, type Unit } from '../lib/value';
import { describeFigure } from '../stage/GridModel';

const UP = (s: string) => s.toLocaleUpperCase('en');

interface Row {
  key: Parameters<typeof t>[1];
  value: string;
  tone?: 'area' | 'perimeter';
}

/** The size as the dimension lines give it ("?" for the unknown), else from the grid. */
function sizeOf(m: GridModelSpec, facts: Facts, u: (n: number) => string, fromGrid: boolean): string {
  let across: string | null = null;
  let up: string | null = null;
  const f = figureOf(m);
  for (const d of m.dims ?? []) {
    const e = dimEnds(m, d);
    if (!e || e.figure !== f) continue;
    const text = d.unknown ? '?' : u(e.length);
    if (e.from[1] === e.to[1] && (d.side === 'top' || d.side === 'bottom' || (!d.side && e.length === facts.box.w))) across ??= text;
    if (e.from[0] === e.to[0] && (d.side === 'left' || d.side === 'right' || (!d.side && e.length === facts.box.h))) up ??= text;
  }
  if (facts.square && (across || up) && !(across && up)) return across ?? up!;
  if (across || up) return `${across ?? (facts.square ? up : fromGrid ? u(facts.box.w) : '?')} × ${up ?? (facts.square ? across : fromGrid ? u(facts.box.h) : '?')}`;
  return fromGrid && facts.rect ? `${u(facts.box.w)} × ${u(facts.box.h)}` : '—';
}

/** Small squares a beat's `rows` / big-square tiles cover. */
function laidBy(facts: Facts, spec: { rows?: number; count?: number; size?: number }): number {
  if (spec.size) return (spec.count ?? 0) * spec.size * spec.size;
  const ys = [...new Set(readingOrder(facts.cells).map((k) => parseCell(k)[1]))].slice(0, spec.rows ?? 0);
  return [...facts.cells].filter((k) => ys.includes(parseCell(k)[1])).length;
}

/** The card's rows for an explanation beat. */
function beatRows(m: GridModelSpec, locale: Locale): Row[] {
  const figures = m.figures.filter((f) => f.tone !== 'ghost');
  if (figures.length === 0) return [];
  const len = (n: number) => `${n}${m.unit === 'unit' ? '' : ` ${unitText(m.unit, locale, n)}`}`;
  const sq = (n: number) => `${n} ${unitText(squared(m.unit), locale, n)}`;
  const unknown = (m.dims ?? []).some((d) => d.unknown);
  const dims = (m.dims?.length ?? 0) > 0;
  const each = figures.slice(0, 2).map((f) => {
    const facts = factsOf(f);
    const tiles = m.tiles?.[f.id];
    const walk = m.walk?.[f.id];
    const laid = tiles === undefined ? null : tiles === 'all' ? facts.area : typeof tiles === 'number' ? tiles : laidBy(facts, tiles);
    const area =
      unknown ? '?' : m.show === 'none' || dims || tiles !== undefined ? (laid !== null && laid < facts.area ? t(locale, 'math.card.soFar', { n: laid }) : sq(facts.area)) : '—';
    const walked = walk === undefined ? null : walk === 'all' ? facts.walk.length : walk;
    const perimeter =
      facts.perimeter === null
        ? '—'
        : unknown
          ? '?'
          : m.show === 'none' || dims || walk !== undefined
            ? walked !== null && walked < facts.perimeter
              ? t(locale, 'math.card.soFar', { n: walked })
              : len(facts.perimeter)
            : '—';
    return { size: f === figureOf(m) ? sizeOf(m, facts, len, m.show !== 'none') : facts.rect ? `${len(facts.box.w)} × ${len(facts.box.h)}` : '—', area, perimeter };
  });
  // Two figures compared: one line each, lettered as on the stage.
  const join = (k: 'size' | 'area' | 'perimeter') => (each.length > 1 ? each.map((e, i) => `${'AB'[i]}  ${e[k]}`).join('\n') : each[0]![k]);
  return [
    { key: 'math.card.size', value: join('size') },
    { key: 'math.card.areaRow', value: join('area'), tone: 'area' },
    { key: 'math.card.perimeterRow', value: join('perimeter'), tone: 'perimeter' },
  ];
}

/** The card's rows on a check: given lengths and the child's work; the measures once done. */
function taskRows(task: Task, state: TaskState, done: boolean, locale: Locale): Row[] {
  const m = task.model;
  if (m.kind !== 'grid') return [];
  const len = (n: number) => `${n}${m.unit === 'unit' ? '' : ` ${unitText(m.unit, locale, n)}`}`;
  const sqU: Unit = squared(m.unit);
  const fig = taskFigure(task) ?? (figureOf(m) ? { figure: figureOf(m)!, facts: factsOf(figureOf(m)!) } : null);
  const rows: Row[] = [];
  if (task.kind === 'draw-rectangle') {
    rows.push({ key: 'math.card.drawn', value: state.rect ? `${len(state.rect[0])} × ${len(state.rect[1])}` : '—' });
    if (done && state.rect) {
      const [w, h] = state.rect;
      rows.push({ key: 'math.card.areaRow', value: `${w * h} ${unitText(sqU, locale, w * h)}`, tone: 'area' }, { key: 'math.card.perimeterRow', value: len(2 * (w + h)), tone: 'perimeter' });
    }
    return rows;
  }
  if (!fig) return rows;
  const given = sizeOf(m, fig.facts, len, false);
  if (given !== '—') rows.push({ key: 'math.card.size', value: given });
  if (task.kind === 'count-squares') {
    const halves = state.tiles.filter(isHalfKey).length;
    rows.push({ key: 'math.card.laid', value: halves ? `${state.tiles.length - halves} + ${halves} × ½` : String(state.tiles.length) });
  }
  if (task.kind === 'trace-perimeter') rows.push({ key: 'math.card.traced', value: String(state.edges.length) });
  if (task.kind === 'split-figure') {
    const cut = parseCut(state.cut);
    const pieces = cut ? piecesAfter(fig.facts.cells, cut) : null;
    const boxes = pieces?.map((p) => rectOf(p));
    rows.push({ key: 'math.card.pieces', value: boxes && boxes.every(Boolean) ? boxes.map((b) => `${b!.w} × ${b!.h}`).join(' + ') : '—' });
  }
  if (done) {
    rows.push({ key: 'math.card.areaRow', value: `${fig.facts.area} ${unitText(sqU, locale, fig.facts.area)}`, tone: 'area' });
    if (fig.facts.perimeter !== null) rows.push({ key: 'math.card.perimeterRow', value: len(fig.facts.perimeter), tone: 'perimeter' });
  }
  return rows;
}

export function AreaCard({ model, task, state, done, locale }: { model: GridModelSpec | null; task: Task | null; state: TaskState | null; done: boolean; locale: Locale }) {
  const rows = task && state ? taskRows(task, state, done, locale) : model ? beatRows(model, locale) : [];
  const f = model ? figureOf(model) : null;
  if (rows.length === 0 || !model) {
    return (
      <div className="ms-card-body">
        <p className="ms-card-body__empty">{t(locale, task ? 'math.card.empty' : 'math.card.gridNone')}</p>
      </div>
    );
  }
  return (
    <div className="ms-card-body ms-card-body--grid">
      <dl className="ms-areacard">
        {rows.map((r) => (
          <div key={r.key} className="ms-areacard__row" data-tone={r.tone}>
            <dt>
              <b>{UP(t('en', r.key))}</b> {t('zh', r.key)}
            </dt>
            <dd data-lines={r.value.includes('\n') || undefined}>
              {r.value.split('\n').map((line, i) => (
                <span key={i}>{line}</span>
              ))}
            </dd>
          </div>
        ))}
      </dl>
      {f && (task ? done : !(model.dims ?? []).some((d) => d.unknown)) && <p className="ms-card-body__words">{describeFigure(model, f, locale)}</p>}
    </div>
  );
}
