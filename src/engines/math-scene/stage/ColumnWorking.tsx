/**
 * The written column method (docs/19 §3.2): × right-aligned with the traded
 * digit small above the next place (signal) and the product under a hairline;
 * ÷ the long-division way, as Singapore textbooks write it — the divisor, a
 * bracket and a bar over the dividend, the quotient above it digit by digit
 * (a 0 written once a digit has started), and under it each place's product,
 * a line and what is left with the next digit brought down. `show` says how
 * far it is written; the place being worked lights up, the same as its
 * column on the blocks mat. Monospace digits in a fixed grid.
 */
import type { ColumnSpec, PlaceKey } from '../schema';
import { columnFocus, columnProgress, divideColumns, multiplyColumns } from '../lib/blocks';
import { placeDigits } from '../lib/value';

const PLACE_OF: Record<PlaceKey, number> = { O: 0, T: 1, H: 2 };

/** The size of a column working in cells (columns × rows). */
export function columnCells(c: ColumnSpec): { cols: number; rows: number } {
  if (c.op === '×') {
    const m = multiplyColumns(c.a, c.b);
    const cols = Math.max(m.a.length, placeDigits(c.b).length + 1, m.product.length) + 1;
    return { cols, rows: m.partials ? 6 : 4 };
  }
  const d = divideColumns(c.a, c.b);
  return { cols: placeDigits(c.b).length + 1 + d.a.length + 1, rows: 2 + 2 * d.steps.length + 0.5 };
}

export function ColumnWorking({ spec, x, y, cell, focus }: { spec: ColumnSpec; x: number; y: number; cell: number; focus?: PlaceKey | null }) {
  const rh = cell * 1.5;
  const { cols, rows } = columnCells(spec);
  const lit = focus ?? columnFocus(spec);
  const prog = columnProgress(spec);
  const digitAt = (col: number, row: number, d: string | number, cls = 'ms-col__digit', key?: string) => (
    <text key={key ?? `${col},${row}`} className={cls} x={x + col * cell + cell / 2} y={y + row * rh + rh * 0.72} textAnchor="middle">
      {d}
    </text>
  );
  const out = [];
  if (spec.op === '×') {
    const m = multiplyColumns(spec.a, spec.b);
    // Place p sits in column cols − 1 − p (right-aligned).
    const colOf = (p: number) => cols - 1 - p;
    if (lit) out.push(<rect key="lit" className="ms-col__lit" x={x + colOf(PLACE_OF[lit]) * cell + 1} y={y + 2} width={cell - 2} height={rows * rh - 4} />);
    // Carries above, small (shown once the place below is done).
    if (prog.carry)
      m.carries.forEach((cv, p) => {
        if (cv && p <= prog.places && p < m.product.length) out.push(digitAt(colOf(p), 0, cv, 'ms-col__carry', `c${p}`));
      });
    m.a.forEach((d, p) => out.push(digitAt(colOf(p), 1, d, 'ms-col__digit', `a${p}`)));
    const bd = placeDigits(spec.b);
    bd.forEach((d, p) => out.push(digitAt(colOf(p), 2, d, 'ms-col__digit', `b${p}`)));
    out.push(digitAt(colOf(bd.length), 2, '×', 'ms-col__op', 'op'));
    out.push(<line key="l1" className="ms-col__rule" x1={x + cell * 0.2} x2={x + cols * cell} y1={y + 3 * rh} y2={y + 3 * rh} />);
    if (m.partials) {
      if (spec.show !== 'none')
        m.partials.forEach((v, r) =>
          placeDigits(v).forEach((d, p) => out.push(digitAt(colOf(p), 3 + r, d, 'ms-col__digit', `p${r}${p}`))),
        );
      out.push(<line key="l2" className="ms-col__rule" x1={x + cell * 0.2} x2={x + cols * cell} y1={y + 5 * rh} y2={y + 5 * rh} />);
      if (spec.show === 'all') m.product.forEach((d, p) => out.push(digitAt(colOf(p), 5, d, 'ms-col__digit ms-col__digit--new', `r${p}`)));
    } else {
      m.product.forEach((d, p) => {
        if (p < prog.places) out.push(digitAt(colOf(p), 3, d, 'ms-col__digit ms-col__digit--new', `r${p}`));
      });
    }
  } else {
    const d = divideColumns(spec.a, spec.b);
    const bd = String(spec.b);
    const c0 = bd.length + 1;
    const L = d.a.length;
    const colOf = (p: number) => c0 + (L - 1 - p);
    // The lit place runs down as far as the working is written.
    const doneSteps = d.steps.filter((s) => L - 1 - s.place < prog.places).length;
    const written = 2 + 2 * doneSteps;
    if (lit) out.push(<rect key="lit" className="ms-col__lit" x={x + colOf(PLACE_OF[lit]) * cell + 1} y={y + 2} width={cell - 2} height={Math.min(rows, written) * rh - 4} />);
    // The divisor, the bracket and the bar over the dividend.
    [...bd].forEach((ch, i) => out.push(digitAt(i, 1, ch, 'ms-col__digit', `b${i}`)));
    out.push(<path key="bracket" className="ms-col__rule" d={`M${x + c0 * cell - cell * 0.3} ${y + rh * 1.02}q${cell * 0.32} ${rh * 0.5} 0 ${rh}M${x + c0 * cell - cell * 0.3} ${y + rh * 1.02}H${x + (c0 + L) * cell + cell * 0.2}`} />);
    d.a.forEach((dg, i) => out.push(digitAt(c0 + i, 1, dg, 'ms-col__digit', `a${i}`)));
    // Steps from the top place: how many are written, and whether the next digit is brought down.
    const done = d.steps.filter((s) => L - 1 - s.place < prog.places);
    d.q.forEach((q, i) => {
      const p = L - 1 - i;
      if (q !== null && L - 1 - p < prog.places) out.push(digitAt(colOf(p), 0, q, 'ms-col__digit ms-col__digit--new', `q${i}`));
    });
    done.forEach((s, k) => {
      const row = 2 + 2 * k;
      const take = String(s.take);
      [...take].forEach((ch, j) => out.push(digitAt(colOf(s.place) - (take.length - 1 - j), row, ch, 'ms-col__digit', `t${k}${j}`)));
      const span = Math.max(take.length, String(s.have).length);
      out.push(<line key={`u${k}`} className="ms-col__rule" x1={x + (colOf(s.place) - span + 1) * cell + 2} x2={x + (colOf(s.place) + 1) * cell - 2} y1={y + (row + 1) * rh} y2={y + (row + 1) * rh} />);
      const next = d.steps[d.steps.indexOf(s) + 1];
      const last = !next;
      // What is left, with the next digit brought down beside it (or, at the end, the remainder).
      if (last) [...String(s.left)].forEach((ch, j, arr) => out.push(digitAt(colOf(0) - (arr.length - 1 - j), row + 1, ch, 'ms-col__digit', `r${k}${j}`)));
      else if (k < done.length - 1 || prog.carry) {
        const have = String(next.have);
        [...have].forEach((ch, j) => out.push(digitAt(colOf(next.place) - (have.length - 1 - j), row + 1, ch, j === have.length - 1 ? 'ms-col__digit ms-col__digit--down' : 'ms-col__digit', `h${k}${j}`)));
      } else [...String(s.left)].forEach((ch, j, arr) => out.push(digitAt(colOf(s.place) - (arr.length - 1 - j), row + 1, ch, 'ms-col__digit', `l${k}${j}`)));
    });
  }
  return (
    <g className="ms-col" aria-hidden="true">
      {out}
    </g>
  );
}
