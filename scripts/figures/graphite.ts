/** Shared deterministic SVG engraving tools for the geometry-drawn plates. */
import { writeFileSync } from 'node:fs';
import sharp from 'sharp';
export type Point = readonly [number, number];
export const BUDGET = 120_000;
export const f = (x: number) => Number(x.toFixed(3));
export const pts = (p: readonly Point[]) => p.map(([x, y]) => `${f(x)},${f(y)}`).join(' ');
export const line = (p: readonly Point[], ink = '#555555', width = 2.4, extra = '') => `<polyline points="${pts(p)}" fill="none" stroke="${ink}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
export const path = (d: string, fill = 'none', stroke = '#555555', width = 2.4, extra = '') => `<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${width}" stroke-linejoin="round" stroke-linecap="round" ${extra}/>`;
export const ellipse = (x: number, y: number, rx: number, ry: number, fill = 'none', stroke = '#555555', width = 2) => `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${rx}" ry="${ry}" fill="${fill}" stroke="${stroke}" stroke-width="${width}"/>`;
export const defs = `<defs>
 <pattern id="hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><path d="M0 0V7" stroke="#555555" stroke-width=".8" opacity=".32"/></pattern>
 <pattern id="cross" width="9" height="9" patternUnits="userSpaceOnUse"><path d="M0 9L9 0M-3 3L3 -3M6 12L12 6M0 0L9 9" stroke="#555555" stroke-width=".7" opacity=".25"/></pattern>
 <linearGradient id="metal"><stop stop-color="#777777"/><stop offset=".24" stop-color="#dddddd"/><stop offset=".47" stop-color="#eeeeee"/><stop offset=".75" stop-color="#b8b8b8"/><stop offset="1" stop-color="#666666"/></linearGradient>
 <radialGradient id="glass" cx=".37" cy=".28"><stop stop-color="#f5f5f5" stop-opacity=".3"/><stop offset=".58" stop-color="#bbbbbb" stop-opacity=".22"/><stop offset="1" stop-color="#777777" stop-opacity=".6"/></radialGradient>
 </defs>`;
export const svg = (body: string, width = 1200, height = 900, extraDefs = '') => `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${defs}${extraDefs}${body}</svg>`;
export const screw = (x: number, y: number, r = 5) => ellipse(x,y,r,r,'#cccccc','#555555',1.5)+line([[x-r*.55,y+r*.55],[x+r*.55,y-r*.55]],'#555555',1.2);
/** Seeded surface detail changes texture only, never the teaching geometry. */
export function random(seed: number): () => number {
 return () => { seed = (Math.imul(1664525, seed) + 1013904223) >>> 0; return seed / 4294967296; };
}
export async function writePlate(output: string, text: string): Promise<void> {
 const bytes = await sharp(Buffer.from(text)).greyscale().ensureAlpha().webp({nearLossless:true,quality:40,effort:6}).toBuffer();
 if(bytes.length > BUDGET) throw new Error(`${output}: ${bytes.length} exceeds ${BUDGET} B`);
 writeFileSync(output, bytes);
 console.log(`${output}: ${bytes.length} B`);
}
