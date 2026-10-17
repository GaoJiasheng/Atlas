/**
 * The PRODUCT card (docs/19 §3.0 G3): the fact on the array or the
 * whole-number line — `4 × 3 = 12`, read as "4 groups of 3" / "3 rows of 4" /
 * "6 jumps of 2", the total in words; groups that are not equal are written
 * as their sum, a covered count as `?`, a split as its two parts. On a check
 * it never says the answer first: the fact with `?` and the child's own work
 * (groups made, the array laid out, the jumps, the cut, what is written).
 */
import type { Locale } from '../../../core/types';
import { t } from '../../../../i18n';
import { renderRich } from '../../../../lib/rich-text';
import type { ArrayLayoutSpec, Model, Task } from '../../schema';
import type { TaskState } from '../../lib/state';
import { factOf, groupSizes, layoutOf, splitParts, thingCount } from '../../lib/array';
import { workingLines } from '../../lib/working';
import { wholeWords } from '../../lib/words';
import { CardRows, type CardRow } from './CardRows';

/** The fact one layout shows, with `?` where the beat covers a count. */
function layoutFact(s: ArrayLayoutSpec): { expr: string; read: { key: Parameters<typeof t>[1]; vars: Record<string, number> } | null; total: number | null } {
  const layout = layoutOf(s);
  const n = thingCount(s);
  if (layout === 'rows') {
    const r = s.rows ?? 0;
    const c = s.cols ?? 0;
    const extra = s.extra ? ` + ${s.extra}` : '';
    if (s.cover?.rows) return { expr: `? × ${c} = ${r * c}`, read: { key: 'math.card.inEachRow', vars: { k: c } }, total: null };
    if (s.cover?.cols) return { expr: `${r} × ? = ${r * c}`, read: { key: 'math.array.rows', vars: { n: r } }, total: null };
    const split = splitParts(s);
    if (split) {
      const [a, b] = split.axis === 'rows' ? [`${split.first} × ${c}`, `${split.second} × ${c}`] : [`${r} × ${split.first}`, `${r} × ${split.second}`];
      return { expr: `${r} × ${c} = ${a} + ${b} = ${r * c}`, read: { key: 'math.card.rowsOf', vars: { n: r, k: c } }, total: n };
    }
    const crossed = s.crossed?.rows?.length ?? 0;
    if (crossed) return { expr: `${r} × ${c} − ${crossed} × ${c} = ${(r - crossed) * c}`, read: { key: 'math.card.rowsOf', vars: { n: r - crossed, k: c } }, total: (r - crossed) * c };
    return { expr: `${r} × ${c}${extra} = ${n}`, read: { key: 'math.card.rowsOf', vars: { n: r, k: c } }, total: n };
  }
  if (layout === 'groups') {
    const f = factOf(s);
    if (!f) return { expr: `${groupSizes(s).join(' + ')} = ${n}`, read: null, total: n };
    return { expr: `${f.groups} × ${f.each}${f.extra ? ` + ${f.extra}` : ''} = ${n}`, read: { key: 'math.card.groupsOf', vars: { n: f.groups, k: f.each } }, total: n };
  }
  return { expr: String(n), read: null, total: n };
}

/** The card's rows for a beat's model. */
export function productBeatRows(m: Model, locale: Locale): CardRow[] {
  if (m.kind === 'numberline' && m.scale === 'whole') {
    if (!m.jumps) return [];
    const end = (m.jumps.from ?? m.from) + m.jumps.size * m.jumps.count;
    return [
      { key: 'math.card.fact', value: `${m.jumps.count} × ${m.jumps.size} = ${end}`, big: true },
      { key: 'math.card.read', value: t(locale, 'math.card.jumpsOf', { n: m.jumps.count, k: m.jumps.size }) },
      { key: 'math.card.total', value: wholeWords(end, locale) },
    ];
  }
  if (m.kind !== 'array') return [];
  const layouts = m.pair ?? [m];
  return layouts.flatMap((s, i) => {
    const f = layoutFact(s);
    const tag = layouts.length > 1 ? `${'AB'[i]}  ` : '';
    return [
      { key: 'math.card.fact' as const, value: `${tag}${f.expr}`, big: layouts.length === 1 },
      ...(f.read ? [{ key: 'math.card.read' as const, value: `${tag}${t(locale, f.read.key, f.read.vars)}` }] : []),
      ...(f.total !== null && layouts.length === 1 ? [{ key: 'math.card.total' as const, value: wholeWords(f.total, locale) }] : []),
    ];
  });
}

/** The card's rows on a check: the givens and the child's work, the fact as far as it goes (never the answer first). */
export function productTaskRows(task: Task, state: TaskState, done: boolean, locale: Locale): CardRow[] {
  const line = workingLines(task, state, locale, done).at(-1);
  // A choice in pictures or words has no fact of its own: the card waits for the answer.
  if (task.kind === 'choose') return [];
  const fact: CardRow = { key: 'math.card.fact', value: line ?? '—', big: true };
  const T = (key: Parameters<typeof t>[1], vars?: Record<string, string | number>) => t(locale, key, vars);
  switch (task.kind) {
    case 'group': {
      const g = state.groups;
      const loose = task.total - g.reduce((a, b) => a + b, 0);
      return [fact, { key: 'math.card.total', value: String(task.total) }, { key: 'math.plate.groups', value: g.length ? g.join(' · ') : '—', tone: 'signal' }, { key: 'math.card.left', value: String(loose) }];
    }
    case 'arrange':
      return [fact, { key: 'math.card.read', value: state.arr ? T('math.card.rowsOf', { n: state.arr[0], k: state.arr[1] }) : '—', tone: 'signal' }];
    case 'skip-count':
      return [fact, { key: 'math.plate.size', value: `+${task.size}` }, { key: 'math.plate.jumps', value: String(state.landings.length), tone: 'signal' }];
    case 'split-array':
      return [fact, { key: 'math.card.read', value: T('math.card.rowsOf', { n: task.rows, k: task.cols }) }];
    default: {
      // A written answer on an array: the picture's reading where it does not give the answer away (a product asked for).
      const m = task.model;
      const spec = task.kind === 'input' ? task : null;
      const safe = m.kind === 'array' && !m.pair && !m.cover && (!spec?.op || (spec.op.kind === '×' && (spec.op.missing ?? 'c') === 'c'));
      const f = safe && m.kind === 'array' ? layoutFact(m) : null;
      return [fact, ...(f?.read ? [{ key: 'math.card.read' as const, value: t(locale, f.read.key, f.read.vars) }] : [])];
    }
  }
}

export function ProductCard({ model, task, state, done, locale }: { model: Model | null; task: Task | null; state: TaskState | null; done: boolean; locale: Locale }) {
  const rows: CardRow[] = task && state ? productTaskRows(task, state, done, locale) : model ? productBeatRows(model, locale) : [];
  if (rows.length === 0)
    return (
      <div className="ms-card-body">
        <p className="ms-card-body__empty">{t(locale, task ? 'math.card.empty' : 'math.card.factNone')}</p>
      </div>
    );
  return <CardRows rows={rows} render={(v) => renderRich(v, locale, { line: true })} />;
}
