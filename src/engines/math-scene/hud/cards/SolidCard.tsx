/**
 * The SOLID card (docs/39 §3.7): on a beat, the solid's name (big), its
 * faces (`6 faces · 6 squares`, `5 faces · 2 triangles · 3 rectangles`,
 * `2 flat faces · 1 curved face`) and how far the net is folded; folded all
 * the way, whether it closes or what goes wrong ("2 faces on one · 1 open").
 * On a check only what the task gives: the name `?` when the name is asked,
 * the faces of a net being completed and whether it closes only once it is
 * checked; how many faces are placed.
 */
import type { Locale } from '../../../core/types';
import { t } from '../../../../i18n';
import type { Model, Task } from '../../schema';
import type { TaskState } from '../../lib/state';
import { foldResult } from '../../lib/net';
import { childSpec, foldedOf, isNetModel, netOfSpec, taskNetSpec } from '../../lib/net-tasks';
import { foldOf, netItems, type SolidNet } from '../../lib/net-view';
import { netFacesText, solidFacesText, solidName } from '../../lib/net-description';
import { solidClass } from '../../lib/solid';
import { CardRows, type CardRow } from './CardRows';

/** Whether a folded net closes, or what goes wrong (`null`: not a polyhedron's net). */
export function foldStatus(spec: SolidNet, locale: Locale): string | null {
  const net = spec.layout ? netOfSpec(spec) : null;
  if (!net) return null;
  const r = foldResult(net);
  if (r.closes) return t(locale, 'math.solid.closes');
  const parts = [...(r.overlaps.length ? [t(locale, 'math.solid.overlap')] : []), ...(r.missing.length ? [t(locale, 'math.solid.missing', { n: r.missing.length })] : []), ...(!r.overlaps.length && r.sizeMismatch.length ? [t(locale, 'math.solid.gap')] : [])];
  return parts.join(' · ');
}

/** Is the solid's name what the check asks for? */
export const asksName = (task: Task): boolean => task.kind === 'choose' && task.options.some((o) => !!o.solid);

export function SolidCard({ model, task, state, done, fold, locale }: { model: Model | null; task: Task | null; state: TaskState | null; done: boolean; fold: number | null; locale: Locale }) {
  const rows: CardRow[] = [];
  if (task && state) {
    const spec = taskNetSpec(task);
    if (spec) {
      rows.push({ key: 'math.plate.solid', value: asksName(task) && !done ? '?' : solidName(solidClass(spec.solid), locale), big: true });
      if (task.kind === 'complete-net') {
        const mine = childSpec(task, state.nplaced);
        rows.push({ key: 'math.plate.placed', value: `${state.nplaced.length} / ${task.add}`, tone: 'signal' });
        if (done && mine) {
          rows.push({ key: 'math.plate.faces', value: netFacesText(mine, locale) });
          rows.push({ key: 'math.plate.folded', value: foldedOf(mine).closes ? t(locale, 'math.solid.closes') : (foldStatus(mine, locale) ?? '—') });
        }
      } else rows.push({ key: 'math.plate.faces', value: task.kind === 'input' && !done ? '?' : netFacesText(spec, locale) });
    }
  } else if (model && isNetModel(model)) {
    const items = netItems(model);
    if (model.set) rows.push({ key: 'math.plate.solids', value: [...new Set(items.map((s) => solidName(solidClass(s.solid), locale)))].join(' · '), big: true });
    else if (items[0]) {
      const spec = items[0];
      const f = fold ?? foldOf(spec);
      rows.push({ key: 'math.plate.solid', value: solidName(solidClass(spec.solid), locale), big: true });
      rows.push({ key: 'math.plate.faces', value: spec.layout ? netFacesText(spec, locale) : solidFacesText(spec.solid, locale) });
      if (spec.solid.type !== 'sphere') rows.push({ key: 'math.plate.folding', value: `${Math.round(f * 100)} %`, tone: 'signal' });
      const status = f >= 1 ? foldStatus(spec, locale) : null;
      if (status) rows.push({ key: 'math.plate.folded', value: status });
    }
  }
  if (rows.length === 0)
    return (
      <div className="ms-card-body">
        <p className="ms-card-body__empty">{t(locale, 'math.solid.none')}</p>
      </div>
    );
  return <CardRows rows={rows} />;
}
