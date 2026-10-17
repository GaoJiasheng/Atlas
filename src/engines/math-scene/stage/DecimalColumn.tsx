/**
 * The column method with decimals (docs/29 §3.3): the points stand on one
 * vertical line — the numbers added or taken away, the sum or difference,
 * the product, the quotient and the number divided all have their point in
 * the same column. + and − are written place by place from the right, the
 * traded digit small above its place (signal), an empty place filled with a
 * faint 0; × and ÷ are the whole-number column method (`ColumnWorking`) of
 * the digits, with the point put back in: the product under the point of the
 * number multiplied, the quotient's point above the dividend's, a 0 written
 * before the point when there are no ones. Monospace digits on a grid.
 */
import type { ReactNode } from 'react';
import type { DecimalColumnSpec } from '../schema';
import { add, divWhole, fracDigits, sub, wholePart, type Decimal } from '../lib/decimal';
import { ColumnWorking, columnCells } from './ColumnWorking';

/** The digits of a decimal by place exponent (ones 0, tenths −1 …), from its top place to `dp` places. */
function digitsByExp(d: Decimal, dp: number): Map<number, number> {
  const out = new Map<number, number>();
  const w = String(wholePart(d));
  [...w].forEach((ch, i) => out.set(w.length - 1 - i, Number(ch)));
  const f = fracDigits({ units: d.units, dp });
  [...f].forEach((ch, i) => out.set(-(i + 1), Number(ch)));
  return out;
}

const topExp = (d: Decimal) => String(wholePart(d)).length - 1;

/** The integer the column method of × or ÷ works with, and the places of the point. */
function integerSpec(c: DecimalColumnSpec): { a: number; b: number; dp: number; q: Decimal | null } {
  const b = wholePart(c.b);
  if (c.op === '×') return { a: Math.round(c.a.units / 10 ** (6 - c.a.dp)), b, dp: c.a.dp, q: null };
  const q = divWhole(c.a, b, 3).q;
  const dp = Math.max(c.a.dp, q.dp);
  return { a: Math.round(c.a.units / 10 ** (6 - dp)), b, dp, q };
}

/** The size in cells (columns × rows). */
export function decimalColumnCells(c: DecimalColumnSpec): { cols: number; rows: number } {
  if (c.op === '×' || c.op === '÷') {
    const s = integerSpec(c);
    return columnCells({ op: c.op, a: s.a, b: s.b, show: c.show });
  }
  const r = c.op === '+' ? add(c.a, c.b) : (sub(c.a, c.b) ?? c.a);
  const top = Math.max(topExp(c.a), topExp(c.b), topExp(r));
  return { cols: top + 1 + Math.max(c.a.dp, c.b.dp) + 1, rows: 4 };
}

export function DecimalColumn({ spec, x, y, cell }: { spec: DecimalColumnSpec; x: number; y: number; cell: number }) {
  const rh = cell * 1.5;
  const out: ReactNode[] = [];
  const dot = (cx: number, row: number, key: string, cls = 'ms-col__point') => <circle key={key} className={cls} cx={cx} cy={y + row * rh + rh * 0.68} r={Math.max(2, cell * 0.1)} />;
  const digit = (col: number, row: number, d: string | number, cls: string, key: string) => (
    <text key={key} className={cls} x={x + col * cell + cell / 2} y={y + row * rh + rh * 0.72} textAnchor="middle">
      {d}
    </text>
  );
  if (spec.op === '×' || spec.op === '÷') {
    const s = integerSpec(spec);
    const { cols } = columnCells({ op: spec.op, a: s.a, b: s.b, show: spec.show });
    out.push(<ColumnWorking key="int" spec={{ op: spec.op, a: s.a, b: s.b, show: spec.show }} x={x} y={y} cell={cell} />);
    if (spec.op === '×') {
      // The point after `dp` places from the right, in the number multiplied and in the product.
      if (s.dp > 0) {
        const px = x + (cols - s.dp) * cell;
        out.push(dot(px, 1, 'p1'));
        if (spec.show === 'all') out.push(dot(px, 3, 'p3'));
      }
    } else {
      const bd = String(s.b).length;
      const L = String(s.a).length;
      const c0 = bd + 1;
      if (s.dp > 0) {
        const px = x + (c0 + L - s.dp) * cell;
        out.push(dot(px, 1, 'p1'));
        if (spec.show === 'all') out.push(dot(px, 0, 'p0'));
      }
      // No ones in the quotient: its 0 before the point is written too.
      if (spec.show === 'all' && s.q && wholePart(s.q) === 0) out.push(digit(c0 + L - s.dp - 1, 0, 0, 'ms-col__digit ms-col__digit--new', 'q0'));
      // The places written longer than the number divided (1.5 → 1.500): faint zeros.
      const own = spec.a.dp;
      for (let k = own; k < s.dp; k++) out.push(<rect key={`pad${k}`} className="ms-col__pad" x={x + (c0 + L - s.dp + k) * cell + 2} y={y + rh + 2} width={cell - 4} height={rh - 4} />);
    }
    return (
      <g className="ms-col ms-col--decimal" aria-hidden="true">
        {out}
      </g>
    );
  }
  /* + and −, place by place, lined up on the point */
  const P = Math.max(spec.a.dp, spec.b.dp);
  const result = spec.op === '+' ? add(spec.a, spec.b) : (sub(spec.a, spec.b) ?? spec.a);
  const top = Math.max(topExp(spec.a), topExp(spec.b), topExp(result));
  const colOf = (e: number) => 1 + (top - e);
  const A = digitsByExp(spec.a, P);
  const B = digitsByExp(spec.b, P);
  const R = digitsByExp(result, P);
  const px = x + colOf(0) * cell + cell;
  // Carries (+) and the digits after a trade (−), right to left.
  const above = new Map<number, string>();
  const struck = new Set<number>();
  if (spec.op === '+') {
    let carry = 0;
    for (let e = -P; e <= top; e++) {
      const s = (A.get(e) ?? 0) + (B.get(e) ?? 0) + carry;
      carry = s >= 10 ? 1 : 0;
      if (carry && e + 1 <= top) above.set(e + 1, '1');
    }
  } else {
    const work = new Map<number, number>();
    for (let e = -P; e <= top; e++) work.set(e, A.get(e) ?? 0);
    for (let e = -P; e <= top; e++) {
      if (work.get(e)! < (B.get(e) ?? 0)) {
        let k = e + 1;
        while (k <= top && work.get(k)! === 0) k++;
        for (let j = k; j > e; j--) {
          work.set(j, work.get(j)! - 1);
          work.set(j - 1, work.get(j - 1)! + 10);
        }
      }
    }
    for (let e = -P; e <= top; e++) if (work.get(e) !== (A.get(e) ?? 0)) {
      above.set(e, String(work.get(e)));
      struck.add(e);
    }
  }
  const show = spec.show === 'all';
  for (let e = top; e >= -P; e--) {
    const c = colOf(e);
    if (A.has(e)) out.push(digit(c, 1, A.get(e)!, e < -spec.a.dp ? 'ms-col__digit ms-col__digit--pad' : 'ms-col__digit', `a${e}`));
    if (B.has(e)) out.push(digit(c, 2, B.get(e)!, e < -spec.b.dp ? 'ms-col__digit ms-col__digit--pad' : 'ms-col__digit', `b${e}`));
    if (show && R.has(e)) out.push(digit(c, 3, R.get(e)!, 'ms-col__digit ms-col__digit--new', `r${e}`));
    if (show && above.has(e)) out.push(digit(c, 0, above.get(e)!, 'ms-col__carry', `c${e}`));
    if (show && struck.has(e)) out.push(<line key={`s${e}`} className="ms-col__strike" x1={x + c * cell + cell * 0.2} x2={x + c * cell + cell * 0.8} y1={y + rh * 1.85} y2={y + rh * 1.15} />);
  }
  // Zeros the written numbers do not have, before their first digit, stay empty; the operator goes on the second row.
  out.push(digit(0, 2, spec.op, 'ms-col__op', 'op'));
  out.push(<line key="rule" className="ms-col__rule" x1={x + cell * 0.2} x2={x + (colOf(-P) + 1) * cell} y1={y + 3 * rh} y2={y + 3 * rh} />);
  if (P > 0) {
    out.push(dot(px, 1, 'p1'), dot(px, 2, 'p2'));
    if (show) out.push(dot(px, 3, 'p3'));
  }
  return (
    <g className="ms-col ms-col--decimal" aria-hidden="true">
      {out}
    </g>
  );
}
