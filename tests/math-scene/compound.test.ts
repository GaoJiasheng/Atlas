/**
 * Quantities (docs/32 §3.1, M1): a measure in one unit or in two — parsed from
 * the data's notation (a space before each unit, so `50m` stays a duration),
 * refused when the pair or the small part is wrong, changed to the small unit
 * and back, compared in the family's smallest unit, shown with ℓ, read aloud
 * ("2 metres 35 centimetres" /「2 米 35 厘米」) and written as `{u:…}` tokens.
 */
import { describe, expect, it } from 'vitest';
import { answerValue } from '../../src/engines/math-scene/schema';
import { compareQty, compoundText, compoundWords, formatCompound, fromSmall, parseCompound, parseDuration, parseQuantity, printedNumber, qtyBase, qtyIn, toSmall, type QtyValue } from '../../src/engines/math-scene/lib/value';
import { plainText, speakable } from '../../src/lib/rich-text';
import { qtyWords } from '../../src/engines/math-scene/lib/words';

const q = (text: string): QtyValue => {
  const v = parseQuantity(text);
  if (!v) throw new Error(`not a quantity: ${text}`);
  return v;
};

describe('compound measures', () => {
  it('parses a pair of units, the small part under one big unit', () => {
    expect(parseCompound('2 m 35 cm')).toEqual({ big: 'm', small: 'cm', total: 235, bigPart: 2, smallPart: 35 });
    expect(parseCompound('1 l 250 ml')).toEqual({ big: 'l', small: 'ml', total: 1250, bigPart: 1, smallPart: 250 });
    expect(parseCompound('2 ℓ 250 ml')?.total).toBe(2250);
    expect(parseCompound('3 kg 40 g')?.total).toBe(3040);
    expect(parseCompound('4 km 50 m')?.total).toBe(4050);
    expect(parseCompound('2 m')).toEqual({ big: 'm', small: 'cm', total: 200, bigPart: 2, smallPart: 0 });
  });

  it('refuses a small part of a whole big unit or more, and units that are not a pair', () => {
    expect(parseCompound('2 m 135 cm')).toBeNull();
    expect(parseCompound('2 m 100 cm')).toBeNull();
    expect(parseCompound('2 kg 35 cm')).toBeNull();
    expect(parseCompound('2 cm 35 m')).toBeNull();
    expect(parseCompound('1 g')).toBeNull();
  });

  it('changes to the small unit and back', () => {
    expect(toSmall(parseCompound('2 m 35 cm')!)).toEqual({ value: { units: 235_000_000, dp: 0 }, unit: 'cm' });
    expect(fromSmall(1250, 'l-ml')).toEqual({ big: 'l', small: 'ml', total: 1250, bigPart: 1, smallPart: 250 });
    expect(fromSmall(3040, 'kg-g')).toMatchObject({ bigPart: 3, smallPart: 40 });
    expect(fromSmall(408, 'm-cm')).toMatchObject({ bigPart: 4, smallPart: 8 });
    expect(formatCompound(fromSmall(3000, 'kg-g'))).toBe('3 kg');
  });

  it('is shown with the symbols in both languages, ℓ for litres', () => {
    expect(compoundText(parseCompound('1 l 250 ml')!, 'en')).toBe('1 ℓ 250 ml');
    expect(compoundText(parseCompound('2 m 35 cm')!, 'zh')).toBe('2 m 35 cm');
  });

  it('is read aloud in both units', () => {
    expect(compoundWords(parseCompound('2 m 35 cm')!, 'en')).toBe('2 metres 35 centimetres');
    expect(compoundWords(parseCompound('1 l 1 ml')!, 'en')).toBe('1 litre 1 millilitre');
    expect(compoundWords(parseCompound('2 m 35 cm')!, 'zh')).toBe('2 米 35 厘米');
    expect(compoundWords(parseCompound('1 kg 400 g')!, 'zh')).toBe('1 千克 400 克');
  });
});

describe('quantities', () => {
  it('need a space before the unit (a duration keeps its notation)', () => {
    expect(parseQuantity('50 m')).toMatchObject({ kind: 'meas', unit: 'm' });
    expect(parseQuantity('50m')).toBeNull();
    expect(parseDuration('50m')?.t).toBe(3000);
    expect(parseQuantity('1.4 kg')).toMatchObject({ kind: 'meas', value: { units: 1_400_000, dp: 1 }, unit: 'kg' });
    expect(parseQuantity('1 m 5 cm')).toMatchObject({ kind: 'cmp', total: 105 });
    expect(parseQuantity('28 cm2')).toBeNull();
    expect(parseQuantity('3/4')).toBeNull();
  });

  it('are answers the schema reads', () => {
    expect(answerValue.parse('350 g')).toMatchObject({ kind: 'meas', unit: 'g' });
    expect(answerValue.parse('1 l 250 ml')).toMatchObject({ kind: 'cmp', total: 1250 });
    expect(answerValue.parse('1h35m')).toMatchObject({ kind: 'dur', t: 5700 });
    expect(answerValue.parse('0.35')).toMatchObject({ kind: 'dec' });
  });

  it('compare in the family\'s smallest unit, mixed units and compounds alike', () => {
    expect(compareQty(q('900 g'), q('1 kg'))).toBe(-1);
    expect(compareQty(q('1 m'), q('95 cm'))).toBe(1);
    expect(compareQty(q('1 m 5 cm'), q('105 cm'))).toBe(0);
    expect(compareQty(q('2 kg 50 g'), q('2500 g'))).toBe(-1);
    expect(compareQty(q('1.4 kg'), q('1 kg 400 g'))).toBe(0);
    expect(compareQty(q('1 l'), q('1 kg'))).toBeNull();
  });

  it('change exactly into another unit of their family', () => {
    expect(qtyIn(q('3 kg 40 g'), 'g')).toEqual({ units: 3040_000_000, dp: 0 });
    expect(qtyIn(q('2 km'), 'cm')?.units).toBe(200_000 * 1_000_000);
    expect(qtyIn(q('1.4 kg'), 'g')?.units).toBe(1400_000_000);
    expect(qtyIn(q('5 cm'), 'g')).toBeNull();
    expect(qtyBase(q('1 l 250 ml')).units).toBe(1250_000_000);
    expect(printedNumber(q('1 m 50 cm')).units).toBe(1_000_000);
  });

  it('are read aloud and shown as tokens', () => {
    expect(qtyWords(q('350 g'), 'en')).toBe('three hundred and fifty grams');
    expect(qtyWords(q('350 g'), 'zh')).toBe('三百五十克');
    expect(qtyWords(q('1 m'), 'en')).toBe('one metre');
    expect(plainText('A {u:1 l 250 ml} jug and {u:9 cm}', 'en')).toBe('A 1 ℓ 250 ml jug and 9 cm');
    expect(speakable('{u:2 m 35 cm}', 'en')).toBe('2 metres 35 centimetres');
    expect(speakable('{u:1 l 250 ml}', 'zh')).toBe('1 升 250 毫升');
    expect(speakable('{u:350 g}', 'en')).toBe('three hundred and fifty grams');
  });
});
