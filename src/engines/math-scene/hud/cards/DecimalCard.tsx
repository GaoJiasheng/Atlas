/**
 * The DECIMAL card (docs/29 §3.9, X4): the number large, a small place name
 * under each digit (ones · tenths · hundredths · thousandths / 个位 · 十分位
 * · 百分位 · 千分位) and the point drawn large; its reading ("zero point two
 * three five" /「零点二三五」); the fraction it is ({235/1000}) and, expanded,
 * its parts (0.2 + 0.03 + 0.005). Money adds dollars and cents and the cents
 * (`$2.35 · 2 dollars 35 cents · 235 cents`), a rounding the rounded value
 * and its places (`2.96 ≈ 3.0 · 1 decimal place`), a line with two scales
 * the measure in both units (`1.5 ℓ = 1500 ml`). On a check it shows only
 * what is given (the child's shading is in the PLATE block): never the
 * answer before the check is done.
 */
import type { Locale } from '../../../core/types';
import { t } from '../../../../i18n';
import { renderRich } from '../../../../lib/rich-text';
import type { Beat, Model, Task } from '../../schema';
import type { TaskState } from '../../lib/state';
import { inputSpecOf } from '../../lib/state';
import { fracDigits, formatDecimal, minPlaces, round, scale, toFraction, wholePart, withPlaces, type Decimal } from '../../lib/decimal';
import { decimalPlaceName, decimalWords, moneyWords, placeName } from '../../lib/words';
import { centsOf, moneyText, piecesOf, totalCents } from '../../lib/money';
import { runsOf, shadedTh } from '../../lib/dgrid';
import { decOf, decimalAnswers, numToken, shiftTarget, workOf } from '../../lib/decimal-tasks';
import { decimalLines } from '../../lib/decimal-working';
import { shiftedValue } from '../../lib/placevalue';
import { unitText, type Unit } from '../../lib/value';
import { CardRows, type CardRow } from './CardRows';

const D = (d: Decimal) => formatDecimal(d);

/** The value a beat's decimal model shows (`null`: none, or a pair). */
export function beatDecimal(m: Model): Decimal | null {
  if (m.kind === 'decimal-grid' && !m.pair) return { units: shadedTh(m) * 1000, dp: 0 };
  if (m.kind === 'place-value') {
    if (m.value && m.shift) return shiftedValue(m.value, m.shift.by * (m.shift.dir === 'left' ? 1 : -1));
    if (m.value && m.copies && !m.combined) return null;
    return m.value ?? null;
  }
  if (m.kind === 'numberline' && m.scale === 'decimal') return m.marks?.at(-1) ?? m.arrow ?? null;
  if (m.kind === 'money' && !m.pair) {
    const c = m.amount ? centsOf(m.amount) : totalCents(piecesOf(m));
    return c === null ? null : { units: c * 10_000, dp: 2 };
  }
  return null;
}

/** The digits with their place names, the point large. */
function Digits({ d, locale }: { d: Decimal; locale: Locale }) {
  const whole = String(wholePart(d));
  const frac = fracDigits(d);
  const cells = [...[...whole].map((ch, i) => ({ ch, name: placeName(whole.length - 1 - i, 'en', 2), zh: placeName(whole.length - 1 - i, 'zh') })), ...[...frac].map((ch, i) => ({ ch, name: decimalPlaceName(i + 1, 'en'), zh: decimalPlaceName(i + 1, 'zh') }))];
  return (
    <div className="ms-dcard" role="img" aria-label={decimalWords(d, locale)}>
      {cells.map((c, i) => [
        i === whole.length ? (
          <b key="point" className="ms-dcard__point" aria-hidden="true">
            .
          </b>
        ) : null,
        <span key={i} className="ms-dcard__cell">
          <span className="ms-dcard__digit">{c.ch}</span>
          <span className="ms-dcard__name">
            {c.name}
            <br />
            <span lang="zh-Hans">{c.zh}</span>
          </span>
        </span>,
      ])}
    </div>
  );
}

/** The parts of a decimal by place: 0.235 → 0.2 + 0.03 + 0.005. */
export function expanded(d: Decimal): string {
  const parts: string[] = [];
  const w = wholePart(d);
  const f = fracDigits(withPlaces({ units: d.units, dp: 0 }, 0));
  [...String(w)].forEach((ch, i, all) => {
    if (ch !== '0') parts.push(`${ch}${'0'.repeat(all.length - 1 - i)}`);
  });
  [...f].forEach((ch, i) => {
    if (ch !== '0') parts.push(`0.${'0'.repeat(i)}${ch}`);
  });
  return parts.join(' + ') || '0';
}

/** The rows of a value: the fraction its last place names; expanded, in lowest terms and its parts. */
function valueRows(d: Decimal, expandedOn: boolean): CardRow[] {
  const rows: CardRow[] = [];
  const f = toFraction(d);
  const k = minPlaces(d);
  if (k > 0) rows.push({ key: 'math.card.asFraction', value: `{${d.units / 10 ** (6 - k)}/${10 ** k}}${expandedOn && f.d !== 10 ** k ? ` = {${f.n}/${f.d}}` : ''}` });
  if (expandedOn && k > 0) rows.push({ key: 'math.card.expanded', value: expanded(d) });
  return rows;
}

/** The places a rounding keeps, in words. */
const keeps = (to: number, locale: Locale) => (to === 0 ? t(locale, 'math.card.toWhole') : to === 1 ? t(locale, 'math.card.toPlace') : t(locale, 'math.card.toPlaces', { n: to }));

interface Body {
  /** The number drawn large with its place names. */
  big: Decimal | null;
  rows: CardRow[];
  /** Lines in words under the rows (the reading, the places kept). */
  words: string[];
}

/** What a check gives — the number worked on, the sentence with `?` — never its answer; once done, the answer. */
function checkBody(task: Task, state: TaskState, done: boolean, open: boolean, locale: Locale): Body {
  const spec = inputSpecOf(task);
  const w = spec ? workOf(task, spec) : null;
  const words: string[] = [];
  if (task.kind === 'compare') return { big: null, rows: [{ key: 'math.card.given', value: `${numToken(task.a)} ○ ${numToken(task.b)}`, big: true }], words };
  let given: Decimal | null = null;
  if (task.kind === 'round-on-line') given = task.value;
  else if (task.kind === 'shift-digits') given = task.value;
  else if (task.kind === 'shade-decimal') given = task.target;
  else if (task.kind === 'place') given = decOf(task.target);
  else if ((task.kind === 'share' || task.kind === 'regroup') && typeof task.value !== 'number') given = task.value;
  else if (w?.a) given = w.a;
  const answer = done ? (task.kind === 'shift-digits' ? shiftTarget(task) : spec?.form === 'decimal' ? (decimalAnswers(spec)[0] ?? null) : null) : null;
  const rows: CardRow[] = [];
  // The sentence of the written part (`?` for what is not written yet), else the number given.
  const sentence = spec?.form === 'decimal' || task.kind === 'shift-digits' ? (decimalLines(task, { ...state, input: done ? state.input : {} }, locale, done).at(-1) ?? null) : null;
  if (sentence) rows.push({ key: done ? 'math.card.fact' : 'math.card.given', value: sentence, big: true });
  else if (given) rows.push({ key: 'math.card.given', value: D(given), big: true });
  if (w?.do === 'round' && w.to !== undefined) words.push(keeps(w.to, locale));
  const shown = answer ?? given;
  if (shown) words.unshift(decimalWords(shown, locale));
  return { big: answer, rows: [...rows, ...(answer ? valueRows(answer, open) : [])], words };
}

/** A beat's model: the number it shows, a pair, money, a rounding, a measure in two units. */
function beatBody(model: Model, beat: Beat | null, open: boolean, locale: Locale): Body {
  const rows: CardRow[] = [];
  const words: string[] = [];
  let big = beatDecimal(model);
  if (model.kind === 'decimal-grid' && model.pair) {
    const [a, b] = model.pair.map((g) => ({ units: runsOf(g).reduce((s, r) => s + r.value, 0) * 1000, dp: 0 }) as Decimal);
    rows.push({ key: 'math.card.fact', value: `${D(a!)} ○ ${D(b!)}`, big: true });
  }
  if (model.kind === 'place-value' && model.rows) rows.push({ key: 'math.card.fact', value: model.rows.map(D).join(' · '), big: true });
  if (model.kind === 'place-value' && model.column) rows.push({ key: 'math.card.fact', value: `${D(model.column.a)} ${model.column.op} ${D(model.column.b)}`, big: true });
  if (model.kind === 'money' && model.pair) rows.push({ key: 'math.card.fact', value: model.pair.map((g) => `$${D(withPlaces(g.amount, 2))}`).join(' · '), big: true });
  else if (model.kind === 'money' && big) {
    const cents = Math.round(big.units / 10_000);
    rows.push({ key: 'math.card.money', value: moneyText(cents), big: true }, { key: 'math.card.cents', value: String(cents) });
    words.push(moneyWords(cents, locale));
    big = null;
  }
  if (model.kind === 'numberline' && model.scale === 'decimal') {
    const mark = model.marks?.at(-1);
    if (mark && model.nearest) {
      rows.push({ key: 'math.card.rounded', value: `${D(mark)} ≈ ${D(round(mark, model.nearest.dp))}`, big: true });
      words.push(keeps(model.nearest.dp, locale));
    }
    if (mark && model.unit && model.dual) {
      const other = scale(mark, String(model.dual.factor).length - 1);
      if (other) rows.push({ key: 'math.card.measure', value: `${D(mark)} ${unitText(model.unit as Unit, locale)} = ${D(other)} ${unitText(model.dual.unit as Unit, locale)}`, big: true });
    }
  }
  if (beat?.equation && !big && rows.length === 0) rows.push({ key: 'math.card.fact', value: beat.equation, big: true });
  if (big && big.units === 0 && model.kind !== 'place-value') big = null;
  const shown = big ? withPlaces(big, 0) : null;
  if (shown) words.unshift(decimalWords(shown, locale));
  return { big: shown, rows: [...(shown ? valueRows(shown, open) : []), ...rows], words };
}

export function DecimalCard({ model, beat, task, state, done, expanded: open, locale }: { model: Model | null; beat: Beat | null; task: Task | null; state: TaskState | null; done: boolean; expanded: boolean; locale: Locale }) {
  const body = task && state ? checkBody(task, state, done, open, locale) : model ? beatBody(model, beat, open, locale) : null;
  if (!body || (!body.big && body.rows.length === 0)) return <Empty locale={locale} task={!!task} />;
  return (
    <div className="ms-card-body ms-card-body--grid">
      {body.big && <Digits d={body.big} locale={locale} />}
      <CardRows rows={body.rows} render={(v) => (v.includes('{') ? renderRich(v, locale, { line: true }) : v)} after={body.words.length ? <p className="ms-card-body__words">{body.words.join(' · ')}</p> : undefined} />
    </div>
  );
}

function Empty({ locale, task }: { locale: Locale; task?: boolean }) {
  return (
    <div className="ms-card-body">
      <p className="ms-card-body__empty">{t(locale, task ? 'math.card.empty' : 'math.card.decimalNone')}</p>
    </div>
  );
}

