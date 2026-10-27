/** monsoon-and-weather: captions, body numbers and counts checked against the shipped data (docs/50 §2, §4.5). */
import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import {
  climateResourceSchema,
  packClimate,
  sampleClimateLayer,
  validateClimateResource,
  type ClimateLoadState,
} from '../../src/engines/time-scene/lib/climate';
import { CHAPTERS, LAYERS } from '../../scripts/geo/monsoon-and-weather/chapters';
import { frontmatter } from '../../scripts/geo/monsoon-and-weather/build-chapters';
import { deriveRain, deriveWind, parseAscii } from '../../scripts/geo/monsoon-and-weather/derive';

const root = new URL('../../', import.meta.url);
const read = (path: string) => readFileSync(new URL(path, root), 'utf8');
const json = (path: string) => JSON.parse(read(path));
const TOPIC = 'src/content/topics/monsoon-and-weather/';
const context = (quantity: 'wind' | 'rain') => ({
  quantity,
  periodId: 'clim-1991-2020',
  startYear: 1991,
  endYear: 2020,
  sources: new Set<string>(json(`${TOPIC}data/sources.json`).sources.map((s: { id: string }) => s.id)),
  ...(quantity === 'wind' ? { pressureHpa: 850 } : {}),
});
const windRes = validateClimateResource(json('public/geo/monsoon-and-weather-wind-850-1991-2020.json'), context('wind'));
const rainRes = validateClimateResource(json('public/geo/monsoon-and-weather-rain-gpcp-1991-2020.json'), context('rain'));
const wind: ClimateLoadState = { status: 'ready', data: packClimate(windRes) };
const rain: ClimateLoadState = { status: 'ready', data: packClimate(rainRes) };
type WindSample = { status: string; index: number; at: [number, number]; u: number; v: number; s: number; from: number; towards: number };
type RainSample = { status: string; index: number; at: [number, number]; rate: number };
const w = (lon: number, lat: number, m: number) => sampleClimateLayer(wind, 'wind', lon, lat, m) as unknown as WindSample;
const r = (lon: number, lat: number, m: number) => sampleClimateLayer(rain, 'rain', lon, lat, m) as unknown as RainSample;
const one = (x: number) => Math.round(x * 10) / 10;

/** Chapter files: JSON frontmatter plus EN / ZH bodies. */
const chapters = readdirSync(new URL(`${TOPIC}chapters/`, root))
  .sort()
  .map((file) => {
    const text = read(`${TOPIC}chapters/${file}`);
    const end = text.indexOf('\n---\n', 4);
    const body = text.slice(end + 5);
    const [en, zh] = body.split('<Lang zh>');
    return { file, fm: JSON.parse(text.slice(4, end)), en: en!, zh: zh! };
  });
const allBeats = chapters.flatMap((c) => c.fm.state.beats as { month: number; layers: string[]; caption: { en: string; zh: string } }[]);

describe('monsoon-and-weather resources (T01, T03–T06 on the shipped files)', () => {
  it('has twelve complete frames on the documented native grids, 30 valid years everywhere', () => {
    expect(climateResourceSchema.parse(windRes).frames).toHaveLength(12);
    expect(windRes.grid).toMatchObject({ nx: 21, ny: 19, lon0: 90, lat0: -15, dlon: 2.5, dlat: 2.5 });
    expect(rainRes.grid).toMatchObject({ nx: 20, ny: 18, lon0: 91.25, lat0: -13.75, dlon: 2.5, dlat: 2.5 });
    expect(windRes.kind === 'monthly-wind' && windRes.pressureHpa).toBe(850);
    let vectors = 0;
    let cells = 0;
    for (const f of windRes.frames) if ('u' in f) vectors += f.u.filter((x) => x !== null).length;
    for (const f of rainRes.frames) if ('values' in f) cells += f.values.filter((x) => x !== null).length;
    expect([vectors, cells]).toEqual([12 * 399, 12 * 360]);
    for (const f of [...windRes.frames, ...rainRes.frames]) expect(new Set(f.validYears)).toEqual(new Set([30]));
    expect(windRes.frames.map((f) => f.month)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    expect(windRes.sources).toEqual(['S22', 'S25', 'S101']);
    expect(rainRes.sources).toEqual(['S32', 'S25', 'S102']);
  });

  it('samples the offset grids independently, at the spec values', () => {
    expect(w(105, 0, 1)).toMatchObject({ index: 132, at: [105, 0] });
    expect(r(105, 0, 1)).toMatchObject({ index: 126, at: [106.25, 1.25] });
    expect(w(103.85, 1.3, 1)).toMatchObject({ index: 153, at: [105, 2.5] });
    expect(r(103.85, 1.3, 1)).toMatchObject({ index: 125, at: [103.75, 1.25] });
    const jan = w(105, 0, 1);
    expect(jan.u).toBeCloseTo(1.1373713, 6);
    expect(jan.v).toBeCloseTo(-4.9311786, 6);
    expect(jan.s).toBeCloseTo(5.0606457947, 6);
    expect(jan.from).toBeCloseTo(347.0119250358, 5);
    const jul = w(105, 0, 7);
    expect(jul.v).toBeCloseTo(3.5973375, 6);
    expect(jul.towards).toBeCloseTo(1.7837849378, 5);
    expect([1, 2, 7, 12].map((m) => r(103.85, 1.3, m).rate)).toEqual([6.9486356, 4.3688293, 4.8847475, 10.126022]);
  });
});

describe('monsoon-and-weather derivation', () => {
  it('parses OPeNDAP ASCII blocks and turns a north-to-south grid south-to-north', () => {
    const text = [
      'Dataset { … } x;',
      '---------------------------------------------',
      'climatology_bounds[12][2]',
      ...Array.from({ length: 12 }, (_, m) => `[${m}], ${1674264 + m * 744}.0, ${1928472 + m * 744}.0`),
      '',
      'uwnd.uwnd[12][1][2][2]',
      ...Array.from({ length: 12 }, (_, m) => [`[${m}][0][0], ${m}.5, 1.0`, `[${m}][0][1], -2.5, 3.970941E-4`]).flat(),
      '',
      'uwnd.lat[2]',
      '2.5, 0.0',
    ].join('\n');
    const blocks = parseAscii(text);
    expect(blocks.get('uwnd.uwnd')?.dims).toEqual([12, 1, 2, 2]);
    expect(blocks.get('uwnd.uwnd')?.values.slice(0, 4)).toEqual([0.5, 1, -2.5, 0.0003970941]);
    expect(blocks.get('uwnd.lat')?.values).toEqual([2.5, 0]);
  });

  it('refuses a truncated block and a wrong grid', () => {
    expect(() => parseAscii('-----\nx[3]\n1.0, 2.0')).toThrow(/expected 3/);
    expect(() => deriveWind('-----\nuwnd.uwnd[1]\n1.0', '-----\nvwnd.vwnd[1]\n1.0')).toThrow();
    expect(() => deriveRain('-----\nprecip.precip[1]\n1.0')).toThrow();
  });
});

describe('monsoon-and-weather chapters and beats', () => {
  it('has a background and eight chapters of four beats, 36 in all, generated from the table', () => {
    expect(chapters.map((c) => c.fm.id)).toEqual(CHAPTERS.map((c) => c.id));
    expect(chapters.map((c) => c.fm.state.beats.length)).toEqual([4, 4, 4, 4, 4, 4, 4, 4, 4]);
    expect(allBeats).toHaveLength(36);
    for (const [i, c] of chapters.entries()) expect(c.fm).toEqual(frontmatter(CHAPTERS[i]!));
    expect(chapters[0]!.fm).toMatchObject({ kind: 'background', order: 0 });
  });

  it('keeps authored month order, including months out of calendar order and repeated months', () => {
    expect(chapters.map((c) => c.fm.state.beats.map((b: { month: number }) => b.month))).toEqual([
      [1, 1, 1, 1],
      [1, 7, 7, 12],
      [12, 1, 2, 2],
      [3, 4, 4, 10],
      [6, 7, 7, 9],
      [7, 7, 7, 12],
      [4, 4, 4, 4],
      [8, 8, 8, 8],
      [1, 7, 7, 12],
    ]);
    const used = new Set(allBeats.map((b) => b.month));
    expect([...Array(12).keys()].map((m) => m + 1).filter((m) => !used.has(m))).toEqual([5, 11]);
  });

  it('every caption is distinct, begins with its own month, and names a climatology only when a monthly layer is on', () => {
    const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    expect(new Set(allBeats.map((b) => b.caption.en)).size).toBe(36);
    expect(new Set(allBeats.map((b) => b.caption.zh)).size).toBe(36);
    for (const b of allBeats) {
      expect(b.caption.en.startsWith(MONTHS[b.month - 1]!)).toBe(true);
      expect(b.caption.zh.startsWith(`${b.month} 月`)).toBe(true);
      const monthly = b.layers.some((l) => l.startsWith('clim-'));
      if (monthly) expect([b.caption.en.includes('climatology'), b.caption.zh.includes('气候平均')]).toEqual([true, true]);
      // Map-only beats are "reference views", except the opening beat, which says its layers are still off.
      const reference = !monthly && !b.caption.en.includes('switched off');
      expect([b.caption.en.includes('reference view'), b.caption.zh.includes('参考视图')]).toEqual([reference, reference]);
      expect(b.caption.en.split(/\s+/).length).toBeLessThanOrEqual(45);
      expect(Object.values(LAYERS)).toContainEqual(b.layers);
    }
  });

  it('the Changi caption and body agree with the S2 note', () => {
    const s2 = json(`${TOPIC}data/sources.json`).sources.find((s: { id: string }) => s.id === 'S2');
    for (const n of ['105.1', '331.9']) {
      expect(s2.note.en).toContain(`${n} mm`);
      expect(allBeats.find((b) => b.caption.en.includes('Changi'))!.caption.en).toContain(n);
      expect(chapters[2]!.en).toContain(`<Num s="S2">${n} mm</Num>`);
      expect(chapters[2]!.zh).toContain(`<Num s="S2">${n} 毫米</Num>`);
    }
  });

  it('the safety summary carries the 30-minute rule in both languages', () => {
    const shelter = chapters.find((c) => c.fm.id === 'thunder-and-shelter')!;
    expect(shelter.fm.state.summary.en).toContain('30 minutes after the last thunder');
    expect(shelter.fm.state.summary.zh).toContain('30 分钟');
    expect(shelter.en).toContain('<Num s="S8">30 minutes</Num>');
  });
});

describe('monsoon-and-weather body numbers and wind readings match the data', () => {
  it('chapter 01: the equator point at 105° E points south in January, north in July', () => {
    const body = chapters[1]!;
    expect(one(w(105, 0, 1).v)).toBe(-4.9);
    expect(one(w(105, 0, 7).v)).toBe(3.6);
    expect(body.en).toContain('<Num s="S101,S24">−4.9</Num>');
    expect(body.en).toContain('<Num s="S101,S24">+3.6</Num>');
    expect(w(105, 0, 1).towards).toBeGreaterThan(157.5); // south-south-east to south
    expect(w(105, 0, 1).towards).toBeLessThan(202.5);
  });

  it('chapter 01: South China Sea arrows come from the east and north-east in January, south-west and west in July', () => {
    const box = (m: number) => {
      const out: number[] = [];
      for (let lon = 107.5; lon <= 117.5; lon += 2.5) for (let lat = 7.5; lat <= 20; lat += 2.5) out.push(w(lon, lat, m).from);
      return out;
    };
    const jan = box(1);
    const jul = box(7);
    expect(jan.filter((f) => f >= 22.5 && f < 112.5).length / jan.length).toBeGreaterThan(0.85);
    expect(jul.filter((f) => f >= 202.5 && f < 292.5).length / jul.length).toBeGreaterThan(0.85);
  });

  it('chapter 02: in February the Jakarta cell is far wetter than the Singapore cell', () => {
    expect(one(r(106.827492, -6.172472, 2).rate)).toBe(13);
    expect(one(r(103.853875, 1.294979, 2).rate)).toBe(4.4);
    expect(chapters[2]!.en).toContain('<Num s="S102">13</Num>');
    expect(chapters[2]!.en).toContain('<Num s="S102">4.4</Num>');
  });

  it('chapter 04: July over Singapore at 850 hPa comes from the south-south-west; over Java from the east', () => {
    const sg = w(103.853875, 1.294979, 7);
    expect(sg.index).toBe(153);
    expect(sg.from).toBeGreaterThan(191.25);
    expect(sg.from).toBeLessThan(213.75);
    const south: number[] = [];
    for (let lon = 90; lon <= 140; lon += 2.5) for (let lat = -15; lat <= -5; lat += 2.5) south.push(w(lon, lat, 7).from);
    expect(south.filter((f) => f >= 67.5 && f < 112.5).length / south.length).toBeGreaterThan(0.9);
  });
});
