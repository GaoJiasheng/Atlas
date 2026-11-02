/** Accessible money description, independent of SVG rendering. */
import type { Locale } from '../../core/types';
import { t } from '../../../i18n';
import type { MoneySpec } from '../schema';
import { piecesOf, moneyText, totalCents } from '../lib/money';

export function describeMoney(m: MoneySpec, locale: Locale): string {
  const pieces = m.pair ? m.pair.flatMap((g) => piecesOf({ amount: g.amount })) : piecesOf(m);
  return t(locale, 'math.money.describe', { n: pieces.length, total: moneyText(totalCents(pieces)) });
}
