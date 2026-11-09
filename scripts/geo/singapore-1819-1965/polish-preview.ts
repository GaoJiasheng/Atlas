/** Offline CPU plates of the actual published vectors and source observations.
 * No browser, network, engine or viewport code. Requires cached PD originals.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { feature } from 'topojson-client';
import { ShapeUtils, Vector2 } from 'three';
import { candidates, evaluate } from '../lib/fit';
import type { ControlPoint } from '../lib/manifest';

const dir = resolve(import.meta.dirname), out = `${dir}/previews`;
mkdirSync(out, { recursive: true });
const root = resolve(dir, '../../..');
const json = (p: string): any => JSON.parse(readFileSync(p, 'utf8'));
const coast = json(`${root}/public/geo/land-sg-history.json`);
const control = json(`${root}/src/content/topics/singapore-1819-1965/data/control.json`);
const entities = json(`${root}/src/content/topics/singapore-1819-1965/data/entities.json`);
const coastFeatures = Object.values(coast.objects).flatMap((o: any) => (feature(coast, o) as any).features);
const css = readFileSync(`${root}/src/theme/tokens.css`, 'utf8');
const xml = (s: string) => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const polygons = (f: any): number[][][][] => f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.type === 'MultiPolygon' ? f.geometry.coordinates : [];
const counts: Record<string, number> = {};
for (const f of coastFeatures.filter((f: any) => f.properties.kind === 'land')) {
  counts[f.properties.id] = polygons(f).reduce((n, poly) => n + ShapeUtils.triangulateShape(
    poly[0]!.map(p => new Vector2(p[0], p[1])),
    poly.slice(1).map(r => r.map(p => new Vector2(p[0], p[1]))),
  ).length, 0);
}
const beforeCounts = json(`${dir}/polish-baseline.json`).triangleCounts;
const stats = { method: 'CPU earcut on decoded published local-land polygons, one era at a time; not runtime MapLibre tile or GPU measurements', before: beforeCounts, after: counts, liveGeometryChanged: json(`${dir}/polish-audit.json`).unchanged.liveGeometry === false };
writeFileSync(`${out}/triangle-counts.json`, JSON.stringify(stats, null, 2) + '\n');
for (const theme of ['paper', 'cinema']) {
  const block = css.slice(css.indexOf(`:root[data-theme="${theme}"]`)).split('\n}')[0]!;
  const tokens = Object.fromEntries([...block.matchAll(/--([\w-]+):\s*([^;]+);/g)].map(m => [m[1], m[2]!.trim()]));
  const tk = (k: string): string => {
    const v = tokens[k];
    if (!v) throw Error(`Missing ${theme} token ${k}`);
    return v.startsWith('var(') ? tk(v.slice(6, -1)) : v;
  };
  for (const view of [
    { id: 'island', title: 'Dated island coasts', box: [103.58, 1.23, 104.03, 1.49], eras: ['L3', 'L4', 'L5'] },
    { id: 'jurong', title: 'Jurong / Pandan close-up', box: [103.69, 1.285, 103.78, 1.345], eras: ['L4', 'L5'] },
    { id: 'jurong-head', title: 'Upper Jurong · paired source banks', box: [103.718, 1.337, 103.736, 1.356], eras: ['L5'] },
    { id: 'north-splice', title: 'Northern Poyan · source-bank splice', box: [103.655, 1.365, 103.684, 1.39], eras: ['L5'] },
    { id: 'river', title: 'Singapore River close-up', box: [103.838, 1.279, 103.86, 1.304], eras: ['L0', 'L1', 'L2'] },
  ]) {
    const W = 1800, H = 980, pane = 1700 / view.eras.length;
    const body: string[] = [];
    for (const [i, era] of view.eras.entries()) {
      const x0 = 50 + i * pane, y0 = 155, pw = pane - 20, ph = 660;
      const spanX = view.box[2]! - view.box[0]!, spanY = view.box[3]! - view.box[1]!;
      const scale = Math.min(pw / spanX, ph / spanY), mapW = spanX * scale, mapH = spanY * scale;
      const ox = x0 + (pw - mapW) / 2, oy = y0 + (ph - mapH) / 2;
      const xy = (p: number[]) => [ox + (p[0]! - view.box[0]!) * scale, oy + (view.box[3]! - p[1]!) * scale];
      const path = (f: any) => polygons(f).map(poly => poly.map(r => r.map((p, j) => {
        const [x, y] = xy(p); return `${j ? 'L' : 'M'}${x!.toFixed(2)},${y!.toFixed(2)}`;
      }).join(' ') + 'Z').join(' ')).join(' ');
      const f = coastFeatures.find((f: any) => f.properties.id === era);
      if (!f) throw Error(`Missing era ${era}`);
      body.push(`<defs><clipPath id="p${i}"><rect x="${x0}" y="${y0}" width="${pw}" height="${ph}"/></clipPath></defs>`);
      body.push(`<text x="${x0}" y="130" font-size="22">${era} · ${f.properties.from ?? '1819'} — ${f.properties.to ?? '1965'}</text>`);
      body.push(`<g clip-path="url(#p${i})"><rect x="${x0}" y="${y0}" width="${pw}" height="${ph}" fill="${tk('water')}"/>`);
      for (let j = 0; j <= 8; j++) {
        const x = x0 + pw * j / 8, y = y0 + ph * j / 8;
        body.push(`<path d="M${x},${y0}v${ph} M${x0},${y}h${pw}" stroke="${tk('ink')}" stroke-opacity=".07" stroke-width="1"/>`);
      }
      body.push(`<path d="${path(f)}" fill="${tk('land')}" fill-rule="evenodd" stroke="${tk('ink')}" stroke-opacity=".8" stroke-width="1.1" stroke-linejoin="round"/>`);
      body.push(`</g><text x="${x0}" y="850" font-size="16" opacity=".75">${counts[era]} planar fill triangles</text>`);
    }
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="${tk('paper')}"/><g fill="${tk('ink')}" font-family="sans-serif"><text x="50" y="50" font-size="18" letter-spacing="3">ATLAS · SINGAPORE 1819–1965 · ${theme.toUpperCase()}</text><text x="50" y="91" font-family="serif" font-size="32">${view.title}</text><path d="M50,105H1750" stroke="${tk('ink')}" stroke-opacity=".3"/>${body.join('')}<text x="50" y="910" font-size="20" fill="${tk('signal')}">2026-11-09 · source-detail rebuild · absolute registration remains approximate</text><text x="50" y="946" font-size="16">Offline CPU raster · actual published vectors and theme tokens · source-bank guards passed · measured positions approximate</text></g></svg>`;
    writeFileSync(`${out}/${theme}-${view.id}.svg`, svg);
    await sharp(Buffer.from(svg)).png().toFile(`${out}/${theme}-${view.id}.png`);
  }
  // Jackson settlement divisions: actual K2 polygons and actual holder tokens.
  const fc = feature(control.topology, control.topology.objects.K2) as any;
  const box = [103.838, 1.277, 103.872, 1.313], scale = 20000;
  const path = (f: any) => polygons(f).map(poly => poly.map(r => r.map((p, j) => `${j ? 'L' : 'M'}${(80 + (p[0]! - box[0]!) * scale).toFixed(2)},${(120 + (box[3]! - p[1]!) * scale).toFixed(2)}`).join(' ') + 'Z').join(' ')).join(' ');
  const era = coastFeatures.find((f: any) => f.properties.id === 'L1');
  const shapes = fc.features.map((f: any) => {
    const e = entities.find((e: any) => e.id === f.properties.holder);
    return `<path d="${path(f)}" fill="${tk(e.color.replace('token:', ''))}" fill-opacity=".4" fill-rule="evenodd" stroke="${tk('ink')}" stroke-width=".9"/>`;
  }).join('');
  const list = fc.features.filter((f: any) => !['johor', 'eic', 'netherlands'].includes(f.properties.holder)).map((f: any, i: number) => {
    const e = entities.find((e: any) => e.id === f.properties.holder);
    return `<rect x="850" y="${164 + i * 65}" width="18" height="18" fill="${tk(e.color.replace('token:', ''))}"/><text x="885" y="${180 + i * 65}" font-size="20">${xml(f.properties.label.en)}</text>`;
  }).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1800" height="1000"><rect width="1800" height="1000" fill="${tk('paper')}"/><g fill="${tk('ink')}" font-family="sans-serif"><text x="50" y="55" font-size="30">K2 · Jackson's proposed town divisions · ${theme}</text><defs><clipPath id="map"><rect x="50" y="100" width="740" height="760"/></clipPath></defs><g clip-path="url(#map)"><rect x="50" y="100" width="740" height="760" fill="${tk('water')}"/><path d="${path(era)}" fill="${tk('land')}" fill-rule="evenodd"/>${shapes}</g>${list}<text x="50" y="930" fill="${tk('signal')}" font-size="22">1822 proposed plan / 1839 coast substitution · source-bank detail restored</text><text x="50" y="968" font-size="17">Offline CPU raster · source-map allocation interpretation; these are not observed ethnic residence boundaries.</text></g></svg>`;
  writeFileSync(`${out}/${theme}-settlements.svg`, svg);
  await sharp(Buffer.from(svg)).png().toFile(`${out}/${theme}-settlements.png`);
}
// Source observations and reprojection residuals, never labelled accepted.
for (const id of ['G9', 'G11', 'G16', 'G14-grid']) {
  const spec = json(`${dir}/georef-${id}.json`);
  const warp=json(`${dir}/round2-registration.json`).reports.find((r:any)=>r.id===id&&r.adopted);
  const points = (warp?.controlPoints??spec.controlPoints) as ControlPoint[];
  const best = candidates('auto', points).map(c => evaluate(c.proj, c.kind, points)).sort((a, b) => a.report.looRmsKm - b.report.looRmsKm)[0]!;
  const axis = id === 'G16' ? json(`${dir}/resume-G16-graticule.json`) : null;
  const method = warp?`${points.length} controls · ${warp.model}`:axis ? '16 Mercator axis ticks + 6 ground translation references' : `${points.length} controls · ${best.report.model}`;
  const rms = warp?warp.loo.rmsM:axis ? axis.externalTranslationFit.looRmsM : best.report.looRmsKm * 1000;
  const max = warp?warp.loo.maxM:axis ? axis.externalTranslationFit.looMaxM : best.report.looMaxKm * 1000;
  const sourceId = id.split('-')[0]!;
  const meta = await sharp(`${dir}/raw/${sourceId}.jpg`, { limitInputPixels: false }).metadata();
  const width = 1600, scale = width / meta.width!, height = Math.round(meta.height! * scale);
  const source = await sharp(`${dir}/raw/${sourceId}.jpg`, { limitInputPixels: false }).resize({ width }).png().toBuffer();
  const marks = points.map((p, i) => `<circle cx="${p.svg[0] * scale}" cy="${p.svg[1] * scale}" r="5" fill="none" stroke="#bc3c2b" stroke-width="2"/><text x="${p.svg[0] * scale + 7}" y="${p.svg[1] * scale - 5}" font-size="13" fill="#8a241a" stroke="#faf4df" stroke-width="3" paint-order="stroke">${i + 1}</text>`).join('');
  const ticks = axis ? axis.axisObservations.map((p: any) => `<path d="M${p.svg[0]*scale-5},${p.svg[1]*scale}h10 M${p.svg[0]*scale},${p.svg[1]*scale-5}v10" stroke="#157886" stroke-width="2"/>`).join('') : '';
  const overlay = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="${height}">${marks}${ticks}</svg>`);
  const head = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="95"><rect width="1600" height="95" fill="#e9e4d8"/><g fill="#2a2824" font-family="sans-serif"><text x="25" y="35" font-size="24">${id} · ${xml(method)}</text><text x="25" y="70" font-size="20">${id === 'G14-grid' ? 'INTERNAL PRINTED GRID ONLY' : 'MEASURED EXTERNAL ERROR; POSITIONS APPROXIMATE'} · LOO RMS/max ${rms.toFixed(2)} / ${max.toFixed(2)} m</text></g></svg>`);
  await sharp({ create: { width, height: height + 95, channels: 3, background: '#e9e4d8' } }).composite([{ input: head, top: 0, left: 0 }, { input: source, top: 95, left: 0 }, { input: overlay, top: 95, left: 0 }]).png({ palette: true, colours: 128 }).toFile(`${out}/${id}-controls.png`);
}
const trace = json(`${dir}/polish-jurong-edge.json`);
const native = await sharp(`${dir}/raw/G14.jpg`, { limitInputPixels: false }).extract({ left: 600, top: 480, width: 7550, height: 3520 }).resize({ width: 1510, height: 704 }).png().toBuffer();
const traceSvg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1510" height="704"><path d="${trace.coordinates.map((p: number[], i: number) => `${i ? 'L' : 'M'}${(p[0]! - 600) / 5},${(p[1]! - 480) / 5}`).join(' ')}" fill="none" stroke="#2b6e76" stroke-width="1.8" stroke-linejoin="round"/></svg>`);
const candidateHeading = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1510" height="95"><rect width="1510" height="95" fill="#e9e4d8"/><g font-family="sans-serif" fill="#2a2824"><text x="25" y="34" font-size="24">G14 · shore-identification trial · NOT PUBLISHED</text><text x="25" y="70" font-size="19">1961 survey / 1966 corrected edition · seaward mangrove edge · external datum and correction dates unqualified</text></g></svg>`);
await sharp({ create: { width: 1510, height: 799, channels: 3, background: '#e9e4d8' } }).composite([{ input: candidateHeading, top: 0, left: 0 }, { input: native, top: 95, left: 0 }, { input: traceSvg, top: 95, left: 0 }]).png({ palette: true, colours: 128 }).toFile(`${out}/G14-candidate-trace.png`);
console.log(`Offline plates: ${out}; counts ${JSON.stringify(counts)}. Published vectors decoded directly.`);
