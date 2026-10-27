import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  climateResourceSchema,
  packClimate,
  sampleClimate,
  nativeClimateCell,
  windVector,
  rainBin,
  projectWind,
  windGlyphs,
  type ClimateResource,
} from '../../src/engines/time-scene/lib/climate';
import { rainGeometry } from '../../src/engines/time-scene/stages/geo/climateStyle';
const read = (name: string) =>
  climateResourceSchema.parse(JSON.parse(readFileSync(new URL(`../../public/geo/sample-climate-${name}.json`, import.meta.url), 'utf8')));
const wind = read('wind-850-1991-2020'),
  rain = read('rain-gpcp-1991-2020');
const ws = { status: 'ready' as const, data: packClimate(wind) },
  rs = { status: 'ready' as const, data: packClimate(rain) };
function readSample(lon: number, lat: number, month: number) {
  return sampleClimate(lon, lat, month, ws, rs);
}
describe('climate native arrays and independent sampling, T01/T03–06', () => {
  it('preserves all original valid values and periods', () => {
    expect(wind.frames).toHaveLength(12);
    expect(rain.frames).toHaveLength(12);
    expect(wind.frames.reduce((n, f) => n + f.validYears.length, 0)).toBe(4788);
    expect(rain.frames.reduce((n, f) => n + f.validYears.length, 0)).toBe(4320);
    for (const d of [wind, rain]) {
      expect(d.frames.every((f) => f.validYears.every((n) => n === 30))).toBe(true);
      expect(d.period).toEqual({
        id: 'clim-1991-2020',
        startYear: 1991,
        endYear: 2020,
        statistic: 'mean-of-calendar-month-means',
        yearsExpected: 30,
      });
    }
    expect(wind.kind === 'monthly-wind' && wind.pressureHpa).toBe(850);
    expect(wind.units).toBe('m/s');
    expect(rain.units).toBe('mm/day');
  });
  it('samples independent offset grids', () => {
    expect(Array.from(ws.data.nodes.slice(132 * 2, 132 * 2 + 2))).toEqual([105, 0]);
    const a = readSample(105, 0, 1);
    expect(a.wind).toMatchObject({ i: 6, j: 6, index: 132, at: [105, 0] });
    expect(a.rain).toMatchObject({ index: 126, at: [106.25, 1.25] });
    const b = readSample(103.85, 1.3, 1);
    expect(b.wind).toMatchObject({ index: 153, at: [105, 2.5] });
    expect(b.rain).toMatchObject({ index: 125, at: [103.75, 1.25] });
  });
  it.each([
    [1, 1.1373713, -4.9311786, 5.0606457947, 167.0119250358, 347.0119250358],
    [7, 0.11203182, 3.5973375, 3.5990815797, 1.7837849378, 181.7837849378],
  ])('keeps precision for month %i', (month, u, v, s, towards, from) => {
    const a = readSample(105, 0, month).wind;
    expect(a).toMatchObject({ u, v });
    if ('s' in a) {
      expect(a.s).toBeCloseTo(s!, 6);
      expect(a.towards).toBeCloseTo(towards!, 5);
      expect(a.from).toBeCloseTo(from!, 5);
    }
  });
  it.each([
    [1, 6.9486356, '6.9'],
    [2, 4.3688293, '4.4'],
    [7, 4.8847475, '4.9'],
    [12, 10.126022, '10.1'],
  ])('rain month %i preserves rate', (month, rate, display) => {
    const a = readSample(103.85, 1.3, month as number).rain;
    expect(a).toMatchObject({ rate });
    if ('rate' in a) expect(a.rate?.toFixed(1)).toBe(display);
  });
});
describe('deterministic arrows, rain boundaries and nulls, T07–10', () => {
  const project = ([x, y]: [number, number]) => ({ x: x * 10, y: -y * 10 });
  it('maps vectors through projection and preserves rotated bearing', () => {
    expect(windVector(3, 4)).toMatchObject({ s: 5, length: 15 });
    expect(windVector(3, 4).towards).toBeCloseTo(36.8698976458, 5);
    expect(windVector(3, 4).from).toBeCloseTo(216.8698976458, 5);
    expect(projectWind(105, 0, 0, 5, project)).toMatchObject({ dx: 0, dy: -1 });
    expect(projectWind(105, 0, 5, 0, project)).toMatchObject({ dx: 1, dy: 0 });
    const rotate = ([x, y]: [number, number]) => ({ x: -y * 10, y: -x * 10 });
    expect(projectWind(105, 0, 5, 0, rotate)).toMatchObject({ dx: 0, dy: -1 });
    const fixture = packClimate(read('fixture-wind'));
    for (const [month, u, v] of [
      [1, 3, 4],
      [2, 0, 5],
      [3, 5, 0],
      [4, -5, 0],
      [5, 0, -5],
      [6, -3, -4],
    ])
      expect(sampleClimate(102.5, 0, month!, { status: 'ready', data: fixture }).wind).toMatchObject({ u, v, s: 5 });
  });
  it('distinguishes calm/missing and thresholds', () => {
    for (const [u, v] of [
      [0, 0],
      [0.1, 0.1],
    ])
      expect(windVector(u!, v!)).toMatchObject({
        calm: true,
        towards: null,
        from: null,
      });
    expect(windVector(0, 0.2)).toMatchObject({ calm: false, towards: 0 });
    expect(windVector((10 - 10) / 2, 0).s).toBe(0);
    expect((Math.abs(10) + Math.abs(-10)) / 2).toBe(10);
    const missing = read('fixture-wind');
    const s = sampleClimate(105, 0, 1, {
      status: 'ready',
      data: packClimate(missing),
    });
    expect(s.rain.status).toBe('absent');
    expect(
      sampleClimate(102.5, 2.5, 1, {
        status: 'ready',
        data: packClimate(missing),
      }).wind,
    ).toMatchObject({
      status: 'missing',
      u: null,
      v: null,
      s: null,
      validYears: 0,
    });
    expect(sampleClimate(105, 0, 1, { status: 'ready', data: packClimate(missing) }).wind).toMatchObject({ validYears: 29 });
  });
  it('assigns breakpoints to the upper bin, preserves zero and constructs geometry once', () => {
    expect([0, 0.999, 1, 2, 4, 8, 16, 32, null].map(rainBin)).toEqual([0, 0, 1, 2, 3, 4, 5, 6, null]);
    const geometry = rainGeometry(rs.data);
    expect(geometry.features).toHaveLength(360);
    expect(geometry.features[125]?.geometry.coordinates).toEqual([
      [
        [102.5, 0],
        [105, 0],
        [105, 2.5],
        [102.5, 2.5],
        [102.5, 0],
      ],
    ]);
    expect(nativeClimateCell(rain.grid, 105, 0, 'rain')?.index).toBe(126);
    expect(nativeClimateCell(rain.grid, 140, 30, 'rain')?.index).toBe(359);
    expect(nativeClimateCell(rain.grid, 140.01, 30, 'rain')).toBe(null);
  });
  it('nearest ties choose lower node and rejects outside', () => {
    expect(nativeClimateCell(wind.grid, 103.75, 1.25, 'wind')).toMatchObject({
      index: 131,
      at: [102.5, 0],
    });
    expect(nativeClimateCell(wind.grid, 89.9, 0, 'wind')).toBe(null);
  });
  it('selects only visible native glyphs with 44 px separation and cap300', () => {
    const glyphs = windGlyphs(ws.data, 1, 2000, 2000, ([x, y]) => ({
      x: (x - 90) * 30,
      y: (30 - y) * 30,
    }));
    expect(glyphs.length).toBeLessThanOrEqual(300);
    for (let i = 0; i < glyphs.length; i++)
      for (let j = i + 1; j < glyphs.length; j++)
        expect(Math.hypot(glyphs[i]!.x - glyphs[j]!.x, glyphs[i]!.y - glyphs[j]!.y)).toBeGreaterThanOrEqual(44);
  });
});
describe('strict field errors T02', () => {
  const bad = (change: (d: ClimateResource) => void, path: string) => {
    const d = structuredClone(wind);
    change(d);
    const result = climateResourceSchema.safeParse(d);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues.some((i) => i.path.join('.').includes(path))).toBe(true);
  };
  it('rejects invalid month/order/frame length/array pair/finite/extent/period/source', () => {
    bad((d) => {
      d.frames[0]!.month = 0;
    }, 'frames.0.month');
    bad((d) => {
      d.frames[1]!.month = 1;
    }, 'frames.1.month');
    bad((d) => {
      d.frames.pop();
    }, 'frames');
    bad((d) => {
      if (d.kind === 'monthly-wind') d.frames[0]!.u.pop();
    }, 'frames.0.u');
    bad((d) => {
      if (d.kind === 'monthly-wind') d.frames[0]!.u[0] = null;
    }, 'frames.0.v');
    bad((d) => {
      if (d.kind === 'monthly-wind') d.frames[0]!.u[0] = NaN;
    }, 'frames.0.u.0');
    bad((d) => {
      d.grid.lon0 = 180;
    }, 'grid');
    bad((d) => {
      d.period.yearsExpected = 29;
    }, 'period');
    bad((d) => {
      d.sources = ['SX01'];
    }, 'sources.0');
    bad((d) => {
      if (d.kind === 'monthly-wind') d.frames[0]!.u[0] = Infinity;
    }, 'frames.0.u.0');
    bad((d) => {
      if (d.kind === 'monthly-wind') d.frames[0]!.u[0] = -9999;
    }, 'frames.0.u.0');
    bad((d) => {
      d.grid.nx = 1;
    }, 'grid.nx');
    bad((d) => {
      d.grid.ny = 1025;
    }, 'grid.ny');
    bad((d) => {
      d.grid.nx = 1024;
      d.grid.ny = 1024;
    }, 'grid');
    bad((d) => {
      d.frames[0]!.validYears[0] = 31;
    }, 'frames.0.validYears.0');
    bad((d) => {
      d.frames[0]!.validYears[0] = 0;
    }, 'frames.0.validYears.0');
    const r = structuredClone(rain);
    if (r.kind === 'monthly-rain') {
      r.frames[0]!.values[0] = -1;
      expect(climateResourceSchema.safeParse(r).success).toBe(false);
      r.frames[0]!.values[0] = 1001;
      expect(climateResourceSchema.safeParse(r).success).toBe(false);
    }
    expect(climateResourceSchema.safeParse({ ...wind, units: 'km/h' }).success).toBe(false);
  });
});
