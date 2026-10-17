/**
 * Money (docs/29 §3.5, model A6d): Singapore coins and notes drawn plain —
 * a coin is a ring sized by its value with the value printed in the middle
 * ($1 with an inner ring for the two metals), a note a rounded rectangle
 * with its value; no real designs and no 1-cent coin. Loose on a tray, or
 * sorted into three columns — DOLLARS · TEN CENTS · CENTS (元 · 10 分 · 分) —
 * with each column's digit under it, so the columns read as the digits of
 * the amount. A trade lights ten 10¢ coins that make $1; two amounts stand
 * side by side (the first cold, the second hot).
 */
import type { ReactNode } from 'react';
import type { Locale } from '../../core/types';
import { t } from '../../../i18n';
import type { BeatMove, MoneyPiece, MoneySpec } from '../schema';
import { columnOf, isNote, moneyText, pieceCents, piecesOf, totalCents } from '../lib/money';
import type { Rect } from './layout';

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const COLS = ['dollars', 'tens', 'cents'] as const;
const RADIUS: Record<string, number> = { '0.05': 0.62, '0.1': 0.7, '0.2': 0.8, '0.5': 0.92, '1': 1 };
const FACE: Record<MoneyPiece, string> = { '0.05': '5¢', '0.1': '10¢', '0.2': '20¢', '0.5': '50¢', '1': '$1', '2': '$2', '5': '$5', '10': '$10', '50': '$50' };

/** Width and height of a piece at unit `u`. */
const sizeOf = (p: MoneyPiece, u: number) => (isNote(p) ? { w: 2.7 * u, h: 1.35 * u } : { w: 2 * RADIUS[p]! * u, h: 2 * RADIUS[p]! * u });

function Piece({ p, x, y, u, lit, tone }: { p: MoneyPiece; x: number; y: number; u: number; lit?: boolean; tone: 'cold' | 'hot' }) {
  const s = sizeOf(p, u);
  if (isNote(p))
    return (
      <g className="ms-money__note" data-tone={tone} data-lit={lit || undefined}>
        <rect x={x} y={y} width={s.w} height={s.h} rx={u * 0.16} />
        <rect className="ms-money__inner" x={x + u * 0.16} y={y + u * 0.16} width={s.w - u * 0.32} height={s.h - u * 0.32} rx={u * 0.1} />
        <text x={x + s.w / 2} y={y + s.h / 2 + u * 0.18} textAnchor="middle" fontSize={u * 0.5}>
          {FACE[p]}
        </text>
      </g>
    );
  const r = s.w / 2;
  return (
    <g className="ms-money__coin" data-tone={tone} data-lit={lit || undefined}>
      <circle cx={x + r} cy={y + r} r={r} />
      {p === '1' && <circle className="ms-money__inner" cx={x + r} cy={y + r} r={r * 0.72} />}
      <text x={x + r} y={y + r + u * 0.16} textAnchor="middle" fontSize={u * (FACE[p].length > 2 ? 0.42 : 0.5)}>
        {FACE[p]}
      </text>
    </g>
  );
}

interface Placed {
  p: MoneyPiece;
  x: number;
  y: number;
}

/** Pieces in rows inside a width (notes first, then coins from the largest). */
function flow(pieces: readonly MoneyPiece[], u: number, width: number): { placed: Placed[]; w: number; h: number } {
  const order = [...pieces].sort((a, b) => pieceCents(b) - pieceCents(a));
  const gap = u * 0.28;
  const placed: Placed[] = [];
  let x = 0;
  let y = 0;
  let rowH = 0;
  let maxW = 0;
  for (const p of order) {
    const s = sizeOf(p, u);
    if (x > 0 && x + s.w > width) {
      x = 0;
      y += rowH + gap;
      rowH = 0;
    }
    placed.push({ p, x, y });
    x += s.w + gap;
    rowH = Math.max(rowH, s.h);
    maxW = Math.max(maxW, x - gap);
  }
  return { placed, w: maxW, h: y + rowH };
}

export function MoneyModel({ box, model: m, locale, label, move, mini }: { box: Rect; model: MoneySpec; locale: Locale; label: string; move?: BeatMove | null; mini?: boolean }) {
  const groups = m.pair ? m.pair.map((g) => piecesOf({ amount: g.amount })) : [piecesOf(m)];
  const byPlace = m.layout === 'by-place';
  const out: ReactNode[] = [];
  const n = groups.length;
  // A group no wider than it needs: three columns of 260 at most, a tray of 640.
  const gw = Math.min((box.w - (n - 1) * 40) / n, byPlace ? 780 : 640);
  const colW = gw / 3;
  // The unit: a $1 coin's radius, as large as the box allows.
  // By place, the fullest column takes up to five coins in a row.
  const most = Math.max(1, ...groups.flatMap((g) => COLS.map((c) => g.filter((p) => columnOf(p) === c).length)));
  let u = clamp(byPlace ? Math.min(colW / (1.68 * Math.min(5, most) + 0.9), box.h / 6) : Math.min(gw / 12, box.h / 4.8), mini ? 6 : 16, mini ? 26 : 60);
  const layoutOf = (pieces: readonly MoneyPiece[], uu: number) => (byPlace ? COLS.map((c) => flow(pieces.filter((p) => columnOf(p) === c), uu, colW - uu * 0.8)) : [flow(pieces, uu, gw - uu * 1.6)]);
  const HEAD = 42;
  const FOOT = 40;
  const heightOf = (uu: number) => Math.max(...groups.map((g) => Math.max(...layoutOf(g, uu).map((l) => l.h)))) + (byPlace ? HEAD + FOOT + 12 : uu * 1.4);
  while (heightOf(u) > box.h - 10 && u > (mini ? 5 : 12)) u -= 1;
  const totalH = heightOf(u);
  const x0 = box.x + (box.w - (n * gw + (n - 1) * 40)) / 2;
  const y0 = box.y + Math.max(0, (box.h - totalH) / 2);
  groups.forEach((pieces, gi) => {
    const gx = x0 + gi * (gw + 40);
    const tone = gi === 0 ? 'cold' : 'hot';
    const layouts = layoutOf(pieces, u);
    let litLeft = m.trade === 't>O' ? 10 : 0;
    const lit = (p: MoneyPiece) => {
      if (p !== '0.1' || litLeft <= 0) return false;
      litLeft--;
      return true;
    };
    if (byPlace) {
      const bodyH = Math.max(...layouts.map((l) => l.h)) + 12;
      COLS.forEach((c, ci) => {
        const cx = gx + ci * colW;
        const lay = layouts[ci]!;
        // The column's digit: how many of its own unit it holds (ten 10¢ coins read 10, the trade to come).
        const cents = totalCents(pieces.filter((p) => columnOf(p) === c));
        const digit = c === 'dollars' ? Math.floor(cents / 100) : c === 'tens' ? Math.floor(cents / 10) : cents;
        out.push(
          <g key={`c${gi}${c}`} className="ms-money__col">
            <rect className="ms-mat__band" x={cx + 3} y={y0} width={colW - 6} height={HEAD + bodyH + FOOT} />
            <text className="ms-mat__head" x={cx + colW / 2} y={y0 + 16} textAnchor="middle">
              {t('en', `math.money.${c}`).toLocaleUpperCase('en')}
            </text>
            <text className="ms-mat__head ms-mat__head--zh" x={cx + colW / 2} y={y0 + 31} textAnchor="middle" lang="zh-Hans">
              {t('zh', `math.money.${c}`)}
            </text>
            <text className="ms-money__digit" x={cx + colW / 2} y={y0 + HEAD + bodyH + FOOT - 12} textAnchor="middle">
              {digit}
            </text>
          </g>,
        );
        const ox = cx + (colW - lay.w) / 2;
        lay.placed.forEach((pl, i) =>
          out.push(
            <g key={`p${gi}${c}${i}`} className="ms-money__piece" style={{ animationDelay: move === 'arrange' ? `${i * 40}ms` : undefined }}>
              <Piece p={pl.p} x={ox + pl.x} y={y0 + HEAD + 6 + pl.y} u={u} lit={lit(pl.p)} tone={tone} />
            </g>,
          ),
        );
        // Ten 10¢ coins traded: the $1 they make, dashed, in the dollars column.
        if (m.trade && c === 'dollars' && lay.placed.length === 0) {
          const r = RADIUS['1']! * u;
          out.push(<circle key={`tr${gi}`} className="ms-money__ghost" cx={cx + colW / 2} cy={y0 + HEAD + 6 + r} r={r} />);
        }
      });
    } else {
      const lay = layouts[0]!;
      const tw = Math.min(gw, lay.w + u * 1.6);
      const tx = gx + (gw - tw) / 2;
      out.push(<rect key={`tray${gi}`} className="ms-money__tray" x={tx} y={y0} width={tw} height={lay.h + u * 1.4} rx={u * 0.5} />);
      lay.placed.forEach((pl, i) => out.push(<Piece key={`p${gi}${i}`} p={pl.p} x={tx + u * 0.8 + pl.x} y={y0 + u * 0.7 + pl.y} u={u} lit={lit(pl.p)} tone={tone} />));
    }
  });
  return (
    <g className="ms-money" role="img" aria-label={m.note ? `${label} · ${t(locale, 'math.money.note')}` : label} data-move={move ?? undefined}>
      {out}
    </g>
  );
}

/** A money model in words (an option, the plate): "6 coins and notes: $2.35". */
export function describeMoney(m: MoneySpec, locale: Locale): string {
  const pieces = m.pair ? m.pair.flatMap((g) => piecesOf({ amount: g.amount })) : piecesOf(m);
  return t(locale, 'math.money.describe', { n: pieces.length, total: moneyText(totalCents(pieces)) });
}
