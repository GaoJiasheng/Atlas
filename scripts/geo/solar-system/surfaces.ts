/**
 * Build-time colour atlas. Output is sRGB; callers convert it to linear light
 * when storing glTF vertex colours. No data or noise is evaluated at runtime.
 *
 * Earth coastlines: Natural Earth, public domain, through world-atlas 2.0.2.
 * Other markings are visual reconstructions, not spacecraft image maps.
 * Appearance references: NASA Cassini Jupiter portrait (PIA02821), MESSENGER
 * Mercury true colour, NASA planet fact pages and visible-light portraits.
 */
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { feature } from 'topojson-client';

type RGB = [number, number, number];
const PI = Math.PI;
const TAU = PI * 2;
const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const smooth = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const mix = (a: RGB, b: RGB, t: number): RGB => [
  a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t,
];
const shade = (a: RGB, s: number): RGB => [clamp(a[0] * s), clamp(a[1] * s), clamp(a[2] * s)];
function hash(x: number, y: number, z: number): number {
  let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(z, 2147483647);
  h = Math.imul(h ^ h >>> 13, 1274126177);
  return ((h ^ h >>> 16) >>> 0) / 4294967295;
}
function noise(x: number, y: number, z: number): number {
  const ix = Math.floor(x), iy = Math.floor(y), iz = Math.floor(z);
  let tx = x - ix, ty = y - iy, tz = z - iz;
  tx *= tx * (3 - 2 * tx); ty *= ty * (3 - 2 * ty); tz *= tz * (3 - 2 * tz);
  const a = hash(ix, iy, iz), b = hash(ix + 1, iy, iz);
  const c = hash(ix, iy + 1, iz), d = hash(ix + 1, iy + 1, iz);
  const e = hash(ix, iy, iz + 1), f = hash(ix + 1, iy, iz + 1);
  const g = hash(ix, iy + 1, iz + 1), h = hash(ix + 1, iy + 1, iz + 1);
  const lo = a + (b - a) * tx + ((c + (d - c) * tx) - (a + (b - a) * tx)) * ty;
  const hi = e + (f - e) * tx + ((g + (h - g) * tx) - (e + (f - e) * tx)) * ty;
  return lo + (hi - lo) * tz;
}
function fbm(x: number, y: number, z: number, octaves = 4): number {
  let sum = 0, amp = .56, weight = 0;
  for (let i = 0; i < octaves; i++) {
    sum += amp * noise(x, y, z); weight += amp;
    // Unequal offsets decorrelate octaves; coordinates remain seam-free.
    x = x * 2.03 + 17.3; y = y * 2.03 - 11.8; z = z * 2.03 + 5.6;
    amp *= .49;
  }
  return sum / weight;
}
const wrapped = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));

// Rasterise the actual Natural Earth polygon rings once, rather than performing
// 60,000-edge geographic point-in-polygon tests for each mesh vertex.
const MAP_W = 1440, MAP_H = 720;
let earthMask: Uint8Array | undefined;
function buildEarthMask(): Uint8Array {
  const require = createRequire(import.meta.url);
  const topology = JSON.parse(readFileSync(require.resolve('world-atlas/land-50m.json'), 'utf8')) as Parameters<typeof feature>[0];
  const geo = feature(topology, topology.objects.land!);
  const geometry = geo.type === 'FeatureCollection' ? geo.features[0]!.geometry : geo.geometry;
  if (geometry.type !== 'MultiPolygon' && geometry.type !== 'Polygon') throw new Error('Natural Earth land must contain polygons');
  const polygons = geometry.type === 'MultiPolygon' ? geometry.coordinates : [geometry.coordinates];
  const mask = new Uint8Array(MAP_W * MAP_H);
  for (const polygon of polygons) {
    const rows: number[][] = Array.from({ length: MAP_H }, () => []);
    for (const ring of polygon) {
      for (let i = 0; i < ring.length - 1; i++) {
        const p = ring[i]!, q = ring[i + 1]!;
        const ax = (p[0]! + 180) * MAP_W / 360, bx = (q[0]! + 180) * MAP_W / 360;
        const ay = (90 - p[1]!) * MAP_H / 180, by = (90 - q[1]!) * MAP_H / 180;
        if (ay === by) continue;
        for (let y = Math.max(0, Math.ceil(Math.min(ay, by) - .5)); y < Math.min(MAP_H, Math.ceil(Math.max(ay, by) - .5)); y++) {
          rows[y]!.push(ax + (bx - ax) * (y + .5 - ay) / (by - ay));
        }
      }
    }
    for (let y = 0; y < MAP_H; y++) {
      const row = rows[y]!; row.sort((a, b) => a - b);
      for (let i = 0; i + 1 < row.length; i += 2) {
        const start = clamp(Math.ceil(row[i]! - .5), 0, MAP_W);
        const end = clamp(Math.ceil(row[i + 1]! - .5), 0, MAP_W);
        mask.fill(255, y * MAP_W + start, y * MAP_W + end);
      }
    }
  }
  return mask;
}
function landAt(lon: number, lat: number): number {
  earthMask ??= buildEarthMask();
  const u = (lon / TAU + .5) * MAP_W - .5;
  const v = clamp((.5 - lat / PI) * MAP_H - .5, 0, MAP_H - 1.001);
  const x0 = Math.floor(u), y0 = Math.floor(v), tx = u - x0, ty = v - y0;
  const sample = (x: number, y: number) => earthMask![y * MAP_W + (x + MAP_W) % MAP_W]! / 255;
  return (sample(x0, y0) * (1 - tx) + sample(x0 + 1, y0) * tx) * (1 - ty)
    + (sample(x0, y0 + 1) * (1 - tx) + sample(x0 + 1, y0 + 1) * tx) * ty;
}
function earth(x: number, y: number, z: number): RGB {
  const lat = Math.asin(clamp(y, -1, 1)), lon = Math.atan2(x, z), degrees = lat * 180 / PI;
  const land = landAt(lon, lat), n = fbm(x * 7 + 3, y * 7, z * 7);
  const longitude = lon * 180 / PI;
  // Broad climate regions are illustrative. Coastline geography is measured.
  const sahara = Math.exp(-(((longitude - 22) / 44) ** 2 + ((degrees - 24) / 13) ** 2));
  const arabia = Math.exp(-(((longitude - 47) / 24) ** 2 + ((degrees - 27) / 12) ** 2));
  const australia = Math.exp(-(((longitude - 134) / 24) ** 2 + ((degrees + 25) / 15) ** 2));
  const centralAsia = Math.exp(-(((longitude - 83) / 37) ** 2 + ((degrees - 43) / 13) ** 2));
  const desert = clamp(Math.max(sahara, arabia, australia, centralAsia) * 1.13 + (n - .5) * .22);
  const forest: RGB = [.22, .36, .21], sand: RGB = [.69, .58, .37];
  let ground = mix(forest, sand, desert);
  const dryCold = smooth(43, 68, Math.abs(degrees));
  ground = mix(ground, [.45, .44, .31], dryCold * .64);
  ground = shade(ground, .85 + n * .32);
  const snow = smooth(66 + (n - .5) * 16, 79, Math.abs(degrees));
  ground = mix(ground, [.86, .9, .88], snow);
  const water = mix([.035, .16, .31], [.055, .31, .47], n * .5);
  let color = mix(water, ground, land);
  color = mix(color, [.86, .92, .94], smooth(79, 88, Math.abs(degrees)) * .82);
  // Tilted, broken fronts, with two cyclonic curls instead of evenly spaced
  // latitude stripes or unrelated white speckles.
  let cloudLon = lon + .36 * Math.sin(lat * 5) + .1 * Math.sin(lon * 3 + lat * 8);
  let cloudLat = lat;
  for (const [cx, cy, radius, spin] of [[-.78, .56, .34, 1.9], [2.1, -.51, .3, -1.7]]) {
    const dx = wrapped(lon - cx!), dy = lat - cy!, r = Math.hypot(dx, dy);
    if (r < radius! * 2.2) {
      const angle = spin! * Math.exp(-r * r / (radius! * radius!));
      cloudLon += dx * Math.cos(angle) - dy * Math.sin(angle) - dx;
      cloudLat += dx * Math.sin(angle) + dy * Math.cos(angle) - dy;
    }
  }
  const c = Math.cos(cloudLat), a = Math.sin(cloudLon) * c, b = Math.cos(cloudLon) * c;
  const warp = fbm(a * 3 + 20, cloudLat * 4, b * 3, 3) - .5;
  const clouds = fbm(a * 8 + warp * 3, cloudLat * 18, b * 8, 4);
  const front = .5 + .5 * Math.sin(cloudLat * 23 + Math.sin(cloudLon * 3) * 3 + warp * 8);
  const alpha = smooth(.52, .72, clouds + front * .035) * .9;
  return mix(color, [.94, .96, .96], alpha);
}

function gasGiant(id: string, x: number, y: number, z: number): RGB {
  const lat = Math.asin(clamp(y, -1, 1)), lon = Math.atan2(x, z);
  const coarse = fbm(x * 5 + 11, y * 9, z * 5, 3) - .5;
  const fine = fbm(x * 38, y * 60, z * 38, 3) - .5;
  const wlat = lat + coarse * .055 + Math.sin(lon * 11 + lat * 31) * .009 + fine * .018;
  if (id === 'jupiter') {
    const equator = Math.exp(-((wlat / .12) ** 2));
    const beltN = Math.exp(-(((wlat - .28) / .095) ** 4));
    const beltS = Math.exp(-(((wlat + .29) / .105) ** 4));
    const other = .5 + .5 * Math.sin(wlat * 44 + coarse * 2.2);
    let color = mix([.84, .79, .67], [.63, .47, .34], Math.max(beltN, beltS) * .84);
    color = mix(color, [.92, .87, .75], equator * .72);
    color = mix(color, [.56, .49, .4], other * .23 * smooth(.36, .85, Math.abs(lat)));
    color = shade(color, 1 + fine * .17 + Math.sin(wlat * 135 + coarse * 7) * .023);
    // Southern oval, with pale collar, uneven salmon annulus and ochre core.
    const sx = wrapped(lon - .14) * Math.cos(-.38), sy = lat + .38;
    const angle = Math.atan2(sy / .072, sx / .15);
    const radius = Math.hypot(sx / .15, sy / .072) + fine * .12;
    const collar = 1 - smooth(1, 1.5, radius);
    color = mix(color, [.88, .83, .7], collar * .9);
    const spot = 1 - smooth(.86, 1.1, radius);
    const turn = angle + (1 - Math.min(radius, 1.2)) * 2.7;
    const swirl = fbm(Math.cos(turn) * radius * 4 + 5, Math.sin(turn) * radius * 4, 9, 3);
    const storm = mix([.7, .36, .22], [.89, .57, .36], swirl * .8 + smooth(.1, 1, radius) * .15);
    color = mix(color, storm, spot);
    // Several small, irregular southern white anticyclones.
    for (const center of [-2.6, -1.4, -.64, .66, 1.52, 2.1]) {
      const r = Math.hypot(wrapped(lon - center) / .045, (lat + .64 + .017 * Math.sin(center * 5)) / .028);
      color = mix(color, [.92, .88, .79], (1 - smooth(.65, 1.2, r)) * .77);
    }
    return color;
  }
  if (id === 'saturn') {
    const stripe = .5 + .5 * Math.sin(wlat * 46 + coarse * .7);
    let color = mix([.84, .76, .55], [.68, .59, .41], stripe * .32);
    color = mix(color, [.58, .6, .5], smooth(.8, 1.45, Math.abs(lat)) * .52);
    return shade(color, 1 + fine * .095 + Math.sin(wlat * 112) * .013);
  }
  if (id === 'uranus') {
    let color = mix([.48, .76, .79], [.66, .84, .83], smooth(-.4, .8, lat) * .36);
    return shade(color, 1 + Math.sin(wlat * 25) * .012 + fine * .025);
  }
  const stripe = .5 + .5 * Math.sin(wlat * 29 + coarse);
  let color = mix([.19, .4, .65], [.31, .54, .75], stripe * .3);
  color = mix(color, [.42, .62, .81], smooth(.7, 1.4, Math.abs(lat)) * .22);
  const cirrus = smooth(.7, .83, fbm(x * 12, y * 45, z * 12, 3))
    * Math.exp(-(((lat + .36) / .25) ** 2));
  return mix(color, [.7, .81, .91], cirrus * .48);
}

interface Crater { x: number; y: number; z: number; radius: number; rim: number }
const craterFields = new Map<string, Crater[]>();
function craters(id: string): Crater[] {
  let field = craterFields.get(id);
  if (!field) {
    field = [];
    for (let i = 0; i < 180; i++) {
      const y = hash(i, 17, id === 'moon' ? 4 : 9) * 2 - 1, lon = hash(i, 31, 5) * TAU;
      const r = Math.sqrt(1 - y * y), radius = .012 + hash(i, 13, 1) ** 3 * .082;
      field.push({ x: Math.sin(lon) * r, y, z: Math.cos(lon) * r, radius, rim: .04 + hash(i, 8, 3) * .08 });
    }
    craterFields.set(id, field);
  }
  return field;
}
function rocky(id: string, x: number, y: number, z: number): RGB {
  const broad = fbm(x * 4 + 6, y * 4, z * 4, 4);
  const fine = fbm(x * 58, y * 58, z * 58, 3);
  if (id === 'mars') {
    const dark = smooth(.47, .66, fbm(x * 3 + 15, y * 5, z * 3, 4));
    let color = mix([.67, .36, .2], [.31, .25, .2], dark * .77);
    color = mix(color, [.78, .49, .3], smooth(.57, .75, broad) * .5);
    color = shade(color, .9 + fine * .2);
    const cap = smooth((y > 0 ? .923 : .955) + (broad - .5) * .022, .978, Math.abs(y));
    return mix(color, [.9, .88, .81], cap);
  }
  let base = .44 + broad * .19 + (fine - .5) * .075;
  if (id === 'moon') {
    // Lunar maria as connected low-albedo basins. Original reconstruction.
    const maria = smooth(.49, .62, fbm(x * 3.2 + 14, y * 3.2, z * 3.2, 3));
    base -= maria * .17;
  }
  for (const crater of craters(id)) {
    const dot = x * crater.x + y * crater.y + z * crater.z;
    const bound = crater.radius * 1.28;
    if (dot < 1 - bound * bound * .5) continue;
    const distance = Math.sqrt(Math.max(0, 2 * (1 - dot))) / crater.radius;
    const floor = 1 - smooth(.55, .9, distance);
    const rim = Math.exp(-(((distance - 1) / .12) ** 2));
    // An albedo bowl and uneven bright ejecta ring, not a painted black dot.
    base -= floor * .09;
    base += rim * crater.rim * (.65 + fine * .7);
    if (distance < .2 && crater.radius > .052) base += (1 - distance / .2) * .045;
  }
  return id === 'moon' ? [base * 1.025, base * 1.01, base * .98] : [base * 1.015, base, base * .975];
}

/** Unit sphere: +Y north; longitude zero faces +Z. Returns sRGB in [0, 1]. */
export function surfaceColor(id: string, x: number, y: number, z: number): RGB {
  if (id === 'sun') {
    // Unresolved photospheric granulation: pale hot cells and narrow cooler
    // lanes, deliberately low contrast. Limb darkening belongs to the shader.
    const granule = noise(x * 115 + 9, y * 115, z * 115);
    const cells = smooth(.24, .63, granule);
    let color = mix([.9, .52, .13], [1, .76, .32], .79 + cells * .21);
    const lon = Math.atan2(x, z), lat = Math.asin(clamp(y, -1, 1));
    const dx = wrapped(lon + .38), dy = lat - .22;
    const spot = Math.hypot(dx / .025, dy / .016);
    color = mix(color, [.54, .36, .17], (1 - smooth(.6, 1.6, spot)) * .66);
    return color;
  }
  if (id === 'earth') return earth(x, y, z);
  if (['jupiter', 'saturn', 'uranus', 'neptune'].includes(id)) return gasGiant(id, x, y, z);
  if (id === 'venus') {
    const lat = Math.asin(clamp(y, -1, 1));
    const warp = fbm(x * 4 + 8, y * 7, z * 4, 3) - .5;
    const cloud = fbm(x * 12 + warp * 4, y * 22 + Math.sin(lat * 7) * .6, z * 12, 4);
    return mix([.8, .74, .57], [.95, .91, .78], clamp(.35 + cloud * .65 + warp * .14));
  }
  if (['mars', 'mercury', 'moon'].includes(id)) return rocky(id, x, y, z);
  const n = fbm(x * 9 + 3, y * 9, z * 9);
  return shade([.41, .36, .29], .72 + n * .55);
}
