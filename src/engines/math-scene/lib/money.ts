/**
 * Money (docs/29 §3.5, model A6d): Singapore coins of 5¢, 10¢, 20¢, 50¢ and
 * $1 and notes of $2, $5, $10 and $50, drawn plain (no real designs, no 1¢
 * coin). An amount's pieces by default follow its places — whole dollars as
 * $1 coins (notes past $9), tenths as 10¢ coins, the 5¢ — so "by place" puts
 * each digit of $2.35 in a column. Counted in cents. Pure.
 */
import type { MoneyPiece, MoneySpec } from '../schema';
import { thousandths, type Decimal } from './decimal';

const CENTS: Record<MoneyPiece, number> = { '0.05': 5, '0.1': 10, '0.2': 20, '0.5': 50, '1': 100, '2': 200, '5': 500, '10': 1000, '50': 5000 };

/** Cents a piece is worth. */
export const pieceCents = (p: MoneyPiece): number => CENTS[p];

export const isNote = (p: MoneyPiece): boolean => ['2', '5', '10', '50'].includes(p);

/** The cents of an amount (`null` when it is not a whole number of cents). */
export function centsOf(d: Decimal): number | null {
  const t = thousandths(d);
  return t !== null && t % 10 === 0 ? t / 10 : null;
}

/** The pieces that show an amount by its places: the tens of dollars in $50 and $10 notes, the ones in $1 coins, 10¢ coins, a 5¢. */
export function piecesByPlace(cents: number): MoneyPiece[] {
  const out: MoneyPiece[] = [];
  const dollars = Math.floor(cents / 100);
  let tens = dollars - (dollars % 10);
  while (tens >= 50) {
    out.push('50');
    tens -= 50;
  }
  for (; tens > 0; tens -= 10) out.push('10');
  for (let i = 0; i < dollars % 10; i++) out.push('1');
  const rest = cents % 100;
  for (let i = 0; i < Math.floor(rest / 10); i++) out.push('0.1');
  if (rest % 10 === 5) out.push('0.05');
  return out;
}

/** The pieces a money model draws for one amount. */
export function piecesOf(m: Pick<MoneySpec, 'pieces' | 'amount'>): MoneyPiece[] {
  if (m.pieces) return m.pieces;
  const c = m.amount ? centsOf(m.amount) : null;
  return c === null ? [] : piecesByPlace(c);
}

/** The column a piece goes in, by place: dollars, ten cents, cents. */
export function columnOf(p: MoneyPiece): 'dollars' | 'tens' | 'cents' {
  const c = pieceCents(p);
  return c >= 100 ? 'dollars' : c >= 10 ? 'tens' : 'cents';
}

/** The total of some pieces, in cents. */
export const totalCents = (ps: readonly MoneyPiece[]): number => ps.reduce((s, p) => s + pieceCents(p), 0);

/** `$2.35`. */
export const moneyText = (cents: number): string => `$${Math.floor(cents / 100)}.${String(cents % 100).padStart(2, '0')}`;
