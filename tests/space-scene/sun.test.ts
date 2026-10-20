import { describe, expect, it } from 'vitest';
import noaa from './fixtures/noaa-singapore.json';
import { julianDate, solarNoon, sunPosition, sunVector } from '../../src/engines/space-scene/lib/sim/sun';
import { shadowDirection } from '../../src/engines/space-scene/lib/sim/light';

describe('NOAA original calculator fixtures, Singapore (docs/35 §2.4)', () => {
  it('Julian day and the calculator solar noon', () => {
    expect(julianDate(noaa.date)).toBe(noaa.julian_day_utc_midnight);
    expect(solarNoon(noaa.date, 103.8, 8) * 60).toBeCloseTo(noaa.solar_noon.local_minutes, 10);
  });
  it.each(noaa.rows)('$local_time: original NOAA elevation, bearing and shadow to 1 mm', (row) => {
    const at = sunPosition(noaa.date, row.local_minutes / 60, 1.3, 103.8, 8);
    expect(at.height).toBeCloseTo(row.elevation, 8);
    expect(at.bearing).toBeCloseTo(row.azimuth, 8);
    expect(Math.abs(1 / Math.tan((at.height * Math.PI) / 180) - row.shadow_length_per_metre)).toBeLessThan(0.001);
  });
  it.each([
    [8, 17, 101, 'west', 3.25],
    [9, 32, 103, 'west', 1.62],
    [10, 46, 106, 'west', 0.96],
    [11, 60, 114, 'north-west', 0.57],
    [12, 73, 134, 'north-west', 0.3],
    [13, 78, 192, 'north', 0.21],
    [14, 69, 236, 'north-east', 0.38],
    [15, 56, 249, 'east', 0.69],
    [16, 41, 255, 'east', 1.14],
    [17, 27, 258, 'east', 1.99],
    [18, 12, 259, 'east', 4.7],
  ] as const)('%s h: complete printed table', (hour, height, bearing, direction, length) => {
    const at = sunPosition(noaa.date, hour, 1.3, 103.8, 8);
    expect(Math.round(at.height)).toBe(height);
    expect(Math.round(at.bearing)).toBe(bearing);
    expect(shadowDirection(at.bearing)).toBe(direction);
    expect(Number((1 / Math.tan((at.height * Math.PI) / 180)).toFixed(2))).toBe(length);
  });
  it('June noon Sun is north and its shadow south; March Sun passes almost overhead', () => {
    const noon = solarNoon('2026-06-21', 103.8, 8),
      june = sunPosition('2026-06-21', noon, 1.3, 103.8, 8);
    expect(june.height).toBeCloseTo(67.86847939079688, 8);
    expect(june.bearing).toBeLessThan(0.1);
    expect(shadowDirection(june.bearing)).toBe('south');
    const march = sunPosition('2026-03-24', solarNoon('2026-03-24', 103.8, 8), 1.3, 103.8, 8);
    expect(march.height).toBeGreaterThan(89.8);
    expect(1 / Math.tan((march.height * Math.PI) / 180)).toBeLessThan(0.01);
    const december = sunPosition('2026-12-21', solarNoon('2026-12-21', 103.8, 8), 1.3, 103.8, 8);
    expect(Math.abs(december.bearing - 180)).toBeLessThan(0.2);
  });
  // docs/35 §2.4: the printed noon row and the two extra dates, as the spec rounds them.
  const length = (height: number) => 1 / Math.tan((height * Math.PI) / 180);
  const clock = (hours: number) => `${Math.floor(hours)}:${String(Math.round((hours % 1) * 60)).padStart(2, '0')}`;
  it.each([
    ['2026-10-20', '12:50', 78.4, 0.21, 'north'],
    ['2026-06-21', '13:06', 67.9, 0.41, 'south'],
    ['2026-03-24', '13:11', 89.9, 0, undefined],
  ] as const)('%s: solar noon %s, height %s°, shadow %s m %s', (date, noonAt, height, metres, points) => {
    const noon = solarNoon(date, 103.8, 8),
      at = sunPosition(date, noon, 1.3, 103.8, 8);
    expect(clock(noon)).toBe(noonAt);
    expect(Number(at.height.toFixed(1))).toBe(height);
    expect(Number(length(at.height).toFixed(2))).toBe(metres);
    if (points) expect(shadowDirection(at.bearing)).toBe(points);
  });
  it.each([
    ['2026-06-21', 0.41, 'south', 184],
    // docs/35 prints 268°; the NOAA model gives 267.49°, so the spec's figure is a rounding slip.
    ['2026-03-24', 0.05, 'west', 267],
  ] as const)('%s at 1.00 pm: shadow %s m, %s (%s°)', (date, metres, points, bearing) => {
    const at = sunPosition(date, 13, 1.3, 103.8, 8);
    expect(Number(length(at.height).toFixed(2))).toBe(metres);
    expect(shadowDirection(at.bearing)).toBe(points);
    expect(Math.round((at.bearing + 180) % 360)).toBe(bearing);
  });
  it('the noon Sun is within 0.3° of overhead only on 23–24 March and 19–20 September 2026', () => {
    const overhead: string[] = [];
    for (let day = 0; day < 365; day++) {
      const date = new Date(Date.UTC(2026, 0, 1 + day)).toISOString().slice(0, 10);
      if (90 - sunPosition(date, solarNoon(date, 103.8, 8), 1.3, 103.8, 8).height < 0.3) overhead.push(date);
    }
    expect(overhead).toEqual(['2026-03-23', '2026-03-24', '2026-09-19', '2026-09-20']);
  });
  it('Sun directions have unit length and respect a rotated scene north', () => {
    expect(sunVector(0, 0)).toEqual({ x: 0, y: 0, z: -1 });
    expect(sunVector(0, 0, [1, 0, 0])).toEqual({ x: 1, y: 0, z: 0 });
    const at = sunVector(46, 106, [1, 0, 0]);
    expect(Math.hypot(at.x, at.y, at.z)).toBeCloseTo(1, 12);
    expect(at.z).toBeGreaterThan(0);
  });
});
