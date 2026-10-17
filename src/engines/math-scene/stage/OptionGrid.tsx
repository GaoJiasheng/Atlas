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
  /** The arrangement, when the cards were sized for their pictures (`optionGrid`); else cards near square. */
  shape?: { cols: number; rows: number };
}

const GAP = 18;
/** A card's room around its picture: the letter above, a margin each side. */
const PAD_W = 48;
const PAD_H = 54;

/** Columns × rows for n cards in a box: cards near square, or (given the pictures' shape) the arrangement that draws them largest. */
export function gridShape(n: number, w: number, h: number, aspect?: number): { cols: number; rows: number } {
  let best = { cols: n, rows: 1, score: -1 };
  for (let cols = 1; cols <= n; cols++) {
    const rows = Math.ceil(n / cols);
    const score = aspect
      ? Math.min((w - GAP * (cols - 1)) / cols - PAD_W, ((h - GAP * (rows - 1)) / rows - PAD_H) * aspect)
      : Math.min(w / cols, (h / rows) * 1.3);
    if (score > best.score) best = { cols, rows, score };
  }
  return { cols: best.cols, rows: best.rows };
}

/**
 * Cards for pictures of one shape (width ÷ height: a number line or groups in a row are wide) in a box at most `h` tall:
 * the arrangement that draws them largest, and the height it needs (each card as tall as its picture wants).
 */
export function optionGrid(n: number, w: number, h: number, aspect: number): { cols: number; rows: number; h: number } {
  const { cols, rows } = gridShape(n, w, h, aspect);
  const cw = (w - GAP * (cols - 1)) / cols;
  const ch = Math.min((h - GAP * (rows - 1)) / rows, (cw - PAD_W) / aspect + PAD_H);
  return { cols, rows, h: rows * ch + GAP * (rows - 1) };
}

export function OptionGrid(p: OptionGridProps) {
  const { cols, rows } = p.shape ?? gridShape(p.cells.length, p.w, p.h);
  const gap = GAP;
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
            {c.draw({ x: x + PAD_W / 2, y: y + 34, w: cw - PAD_W, h: ch - PAD_H })}
            {p.ghost?.includes(c.id) && <rect className="ms-ghost__part" x={x - 6} y={y - 6} width={cw + 12} height={ch + 12} />}
          </g>
        );
      })}
    </g>
  );
}
