/**
 * The top-right card and the PLATE rows of a line-symmetry grid (docs/79
 * §3.4). Card SYMMETRY: LINE (UPRIGHT / ACROSS / SLANTED) · MATCH (a beat
 * folded flat: ✓ or ○; a check: only once the child has folded it with
 * "Fold it") · LINES (a beat's lines of symmetry drawn). Plate: MODEL GRID ·
 * LINE · SQUARES (the given half's) · PARTNERS (what the child has put down,
 * never the number to find). The card never says the answer first.
 */
import type { Locale } from '../../../core/types';
import { t } from '../../../../i18n';
import type { GridModelSpec, Model, Task } from '../../schema';
import type { TaskState } from '../../lib/state';
import { figureCells, figureHalves, figureOf } from '../../lib/grid';
import { lineDirection, lineMatches } from '../../lib/symmetry';
import { completionOf, givenOf, isSymmetryModel, taskLine } from '../../lib/symmetry-tasks';
import { isRight } from '../../lib/diagnose/symmetry';
import type { PlateRow } from '../PlateBlock';

const UP = (s: string) => s.toLocaleUpperCase('en');
const DIR_KEY = { upright: 'math.sym.upright', across: 'math.sym.across', slanted: 'math.sym.slanted' } as const;

interface Shown {
  line: string;
  match: string;
  lines: string;
}

function shownOf(model: GridModelSpec | null, task: Task | null, state: TaskState | null): Shown {
  const dash = '—';
  if (task && state) {
    const line = taskLine(task);
    let match = dash;
    if (state.sfold && line) {
      if (task.kind === 'complete-symmetric') {
        const c = completionOf(task, state.sym);
        match = c && state.sym.length ? (isRight(c) ? '✓' : '○') : dash;
      } else if (task.model.kind === 'grid') match = lineMatches(task.model, line) ? '✓' : '○';
    }
    return { line: line ? UP(t('en', DIR_KEY[lineDirection(line)])) : dash, match, lines: dash };
  }
  if (!model) return { line: dash, match: dash, lines: dash };
  const line = model.fold?.line ?? model.candidates?.[0] ?? model.mirror?.[0];
  const match = model.fold && model.fold.t === 1 ? (lineMatches(model, model.fold.line) ? '✓' : '○') : dash;
  return { line: line ? UP(t('en', DIR_KEY[lineDirection(line)])) : dash, match, lines: model.mirror ? String(model.mirror.length) : dash };
}

export function SymmetryCard({ model, task, state, locale }: { model: Model | null; task: Task | null; state: TaskState | null; locale: Locale }) {
  const m = model && isSymmetryModel(model) ? model : null;
  const s = shownOf(m, task, state);
  const rows: { key: Parameters<typeof t>[1]; value: string }[] = [
    { key: 'math.sym.lineRow', value: s.line },
    { key: 'math.sym.matchRow', value: s.match },
    { key: 'math.sym.linesRow', value: s.lines },
  ];
  return (
    <div className="ms-card-body ms-card-body--grid">
      <dl className="ms-areacard">
        {rows.map((r) => (
          <div key={r.key} className="ms-areacard__row">
            <dt>
              <b>{UP(t('en', r.key))}</b> {t('zh', r.key)}
            </dt>
            <dd>
              <span>{r.value}</span>
            </dd>
          </div>
        ))}
      </dl>
      {s.match !== '—' && <p className="ms-card-body__words">{t(locale, s.match === '✓' ? 'math.sym.matchYes' : 'math.sym.matchNo')}</p>}
    </div>
  );
}

/** PLATE rows for a symmetry grid (`null`: not one). */
export function symmetryPlateRows(m: Model, task: Task | null, state: TaskState | null): PlateRow[] | null {
  if (!isSymmetryModel(m)) return null;
  const line = task ? taskLine(task) : (m.fold?.line ?? m.candidates?.[0] ?? m.mirror?.[0] ?? null);
  const given = task?.kind === 'complete-symmetric' ? givenOf(task) : figureOf(m);
  const squares = given ? figureCells(given).size + figureHalves(given).length : 0;
  return [
    { key: 'math.plate.model', value: 'GRID' },
    { key: 'math.sym.lineRow', value: line ? UP(t('en', DIR_KEY[lineDirection(line)])) : '—' },
    { key: 'math.plate.squares', value: squares ? String(squares) : given?.path ? String(given.path.length) : '—' },
    { key: 'math.sym.partnersRow', value: task?.kind === 'complete-symmetric' && state ? String(state.sym.length) : m.pairs ? String((m.pairs.cells?.length ?? 0) + (m.pairs.points?.length ?? 0)) : '—', on: true },
  ];
}
