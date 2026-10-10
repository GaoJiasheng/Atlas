/**
 * Picture options of a `choose` task (docs/15 §2.1): one card per option with
 * a model, lettered A, B, C … Tap (or Tab + Enter / Space) to choose; several
 * may be chosen when the task allows. "Show me" outlines the right ones dashed.
 */
import type { KeyboardEvent, ReactNode } from 'react';
import type { Locale } from '../../core/types';
import { t } from '../../../i18n';

export interface OptionCell {
  id: string;
  letter: string;
  /** What the picture shows, in words (the card's accessible name). */
  alt: string;
  draw(box: { x: number; y: number; w: number; h: number }): ReactNode;
}

export interface OptionGridProps {
  x: number;
  y: number;
  w: number;
  h: number;
  cells: OptionCell[];
  multi: boolean;
  chosen: string[];
  onChoose?(id: string): void;
  ghost?: string[] | null;
  label: string;
  locale: Locale;
}

/** Columns × rows for n cards in a box (cards stay near square). */
export function gridShape(n: number, w: number, h: number): { cols: number; rows: number } {
  let best = { cols: n, rows: 1, score: -1 };
  for (let cols = 1; cols <= n; cols++) {
    const rows = Math.ceil(n / cols);
    const cw = w / cols;
    const ch = h / rows;
    const score = Math.min(cw, ch * 1.3);
    if (score > best.score) best = { cols, rows, score };
  }
  return { cols: best.cols, rows: best.rows };
}

export function OptionGrid(p: OptionGridProps) {
  const { cols, rows } = gridShape(p.cells.length, p.w, p.h);
  const gap = 18;
  const cw = (p.w - gap * (cols - 1)) / cols;
  const ch = (p.h - gap * (rows - 1)) / rows;
  const key = (id: string) => (e: KeyboardEvent<SVGGElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      p.onChoose?.(id);
    }
  };
  return (
    <g className="ms-options" role={p.multi ? 'group' : 'radiogroup'} aria-label={p.label}>
      {p.cells.map((c, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = p.x + col * (cw + gap);
        const y = p.y + row * (ch + gap);
        const on = p.chosen.includes(c.id);
        return (
          <g
            key={c.id}
            className="ms-option"
            role={p.multi ? 'checkbox' : 'radio'}
            aria-checked={on}
            aria-label={t(p.locale, 'math.option.picture', { letter: c.letter }) + `: ${c.alt}`}
            tabIndex={p.onChoose ? 0 : -1}
            data-option={c.id}
            data-on={on || undefined}
            onClick={() => p.onChoose?.(c.id)}
            onKeyDown={key(c.id)}
          >
            <rect className="ms-option__card" x={x} y={y} width={cw} height={ch} />
            <text className="ms-option__letter" x={x + 12} y={y + 22}>
              {c.letter}
            </text>
            {c.draw({ x: x + 24, y: y + 34, w: cw - 48, h: ch - 54 })}
            {p.ghost?.includes(c.id) && <rect className="ms-ghost__part" x={x - 6} y={y - 6} width={cw + 12} height={ch + 12} />}
          </g>
        );
      })}
    </g>
  );
}
