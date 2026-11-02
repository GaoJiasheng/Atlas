/** HYG remains a separate BY-SA resource; these functions never persist mixed data. */
import { RAD } from './orbit-rotation';
import type { SolarSystem } from '../../solar-system-schema';
import type { SimValues } from '../../sim-schema';
export interface CatalogueStar {
    id: string;
    hip: string;
    ra: number;
    dec: number;
    dist: number | null;
    mag: number;
}
export interface StarCatalogue {
    meta: {
        licence: string;
        credit: string;
        source: string;
        sourceSha256: string;
    };
    stars: CatalogueStar[];
}
export function parseStarCatalogue(input: unknown, patterns?: SolarSystem['patterns']): StarCatalogue {
    const v = input as {
        meta?: Record<string, unknown>;
        stars?: Record<string, unknown>[];
    };
    if (v?.meta?.licence !== 'CC BY-SA 4.0' || typeof v.meta.credit !== 'string' || typeof v.meta.source !== 'string' || typeof v.meta.sourceSha256 !== 'string' || !/^[a-f0-9]{64}$/.test(v.meta.sourceSha256) || !Array.isArray(v.stars) || !v.stars.length)
        throw new Error('catalogue.meta: expected HYG attribution, SHA256 and CC BY-SA 4.0');
    const ids = new Set<string>(), hips = new Set<string>();
    const stars = v.stars.map((s, i) => { const id = String(s.id), hip = String(s.hip), ra = Number(s.ra), dec = Number(s.dec), mag = Number(s.mag), d = Number(s.dist); if (!/^\d+$/.test(id) || ids.has(id) || !Number.isFinite(ra) || ra < 0 || ra >= 24 || !Number.isFinite(dec) || Math.abs(dec) > 90 || !Number.isFinite(mag))
        throw new Error(`catalogue.stars.${i}: invalid id or RA/Dec/magnitude`); ids.add(id); if (hip && hip !== 'null')
        hips.add(hip); return { id, hip, ra, dec, mag, dist: s.dist !== null && s.dist !== '' && Number.isFinite(d) && d > 0 && d < 100000 ? d : null }; });
    if (patterns)
        for (const [name, edges] of Object.entries(patterns))
            for (const [i, [a, b]] of edges.entries())
                if (!hips.has(a) || !hips.has(b))
                    throw new Error(`patterns.${name}.${i}: unknown HIP endpoint`);
    return { meta: v.meta as unknown as StarCatalogue['meta'], stars };
}
const mod = (x: number, m: number) => ((x % m) + m) % m;
export function gmstHours(utcMs: number) { if (!Number.isFinite(utcMs))
    throw new RangeError('finite UTC milliseconds required'); const jd = utcMs / 86400000 + 2440587.5, jd0 = Math.floor(jd - .5) + .5, d0 = jd0 - 2451545, h = (jd - jd0) * 24, t = (jd - 2451545) / 36525; return mod(6.697375 + .065709824279 * d0 + 1.0027379 * h + .0000258 * t * t, 24); }
export function equatorialToHorizon(latDeg: number, decDeg: number, hourAngleDeg: number) { if (![latDeg, decDeg, hourAngleDeg].every(Number.isFinite) || Math.abs(latDeg) > 90 || Math.abs(decDeg) > 90)
    throw new RangeError('invalid horizon angles'); const p = latDeg * RAD, d = decDeg * RAD, h = hourAngleDeg * RAD, east = -Math.cos(d) * Math.sin(h), north = Math.sin(d) * Math.cos(p) - Math.cos(d) * Math.cos(h) * Math.sin(p), up = Math.sin(d) * Math.sin(p) + Math.cos(d) * Math.cos(h) * Math.cos(p); return { east, north, up, altDeg: Math.asin(Math.max(-1, Math.min(1, up))) / RAD, azDeg: Math.hypot(east, north) < 1e-12 ? null : mod(Math.atan2(east, north) / RAD, 360) }; }
export function skySnapshot(c: SolarSystem, values: SimValues, catalogue: StarCatalogue, radius = 5) { const get = (key: keyof SolarSystem['controls']) => values[c.controls[key]]; const date = String(get('skyDate')), hour = Number(get('skyHour')); if (!/^2026-(01|04|07|10)-15$/.test(date) || ![0, 2, 4, 18, 20, 22].includes(hour))
    throw new RangeError('invalid sky date/hour'); const [year, month, day] = date.split('-').map(Number); const utc = Date.UTC(year!, month! - 1, day!, hour - 8); const observer = String(get('observer')); const [lat, lon] = observer === 'equator' ? [0, 103.7357] : observer === 'north45' ? [45, 103.7357] : [1.3342, 103.7357]; const lst = gmstHours(utc) + lon! / 15; const depth = get('depth') === true; const rows = catalogue.stars.map(s => { const h = equatorialToHorizon(lat!, s.dec, (lst - s.ra) * 15); const scale = depth ? (s.dist ?? 0) * .02 : radius; return { ...s, ...h, position: [h.east * scale, h.up * scale, -h.north * scale] as [
        number,
        number,
        number
    ], shown: s.mag <= 3 && (depth ? s.dist !== null : h.up > 0) }; }); return { utc: new Date(utc).toISOString(), latitude: lat!, longitude: lon!, depth, rows }; }
