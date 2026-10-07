/**
 * Rasterise the Atlas mark (public/favicon.svg palette) into the PWA icons in
 * `public/icons/`. Run `pnpm tsx scripts/build-icons.ts` and commit the output.
 *
 *   icon-192.png / icon-512.png   purpose "any"      (rounded tile, transparent corners)
 *   icon-maskable-512.png         purpose "maskable" (full-bleed, mark inside the 80% safe zone)
 *   apple-touch-icon.png (180)    full-bleed, iOS rounds the corners itself
 */
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const INK = '#2b2117';
const PAPER = '#f4ecd8';
const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'icons');
mkdirSync(out, { recursive: true });

/** The globe mark in a 64x64 box, scaled about the centre. */
const mark = (scale: number) => `
  <g transform="translate(32 32) scale(${scale}) translate(-32 -32)" fill="none" stroke="${PAPER}">
    <circle cx="32" cy="32" r="17" stroke-width="4"/>
    <path d="M15 32h34M32 15c6 5 8 11 8 17s-2 12-8 17c-6-5-8-11-8-17s2-12 8-17z" stroke-width="3"/>
  </g>`;

const svg = (body: string) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">${body}</svg>`);
const rounded = svg(`<rect width="64" height="64" rx="14" fill="${INK}"/>${mark(1)}`);
// Mark spans ~38 of 64 units at scale 1; at 0.9 it sits well inside the 80% safe circle.
const fullBleed = svg(`<rect width="64" height="64" fill="${INK}"/>${mark(0.9)}`);

const jobs: [string, Buffer, number][] = [
  ['icon-192.png', rounded, 192],
  ['icon-512.png', rounded, 512],
  ['icon-maskable-512.png', fullBleed, 512],
  ['apple-touch-icon.png', fullBleed, 180],
];
for (const [name, source, size] of jobs) {
  await sharp(source, { density: 384 }).resize(size, size).png({ compressionLevel: 9 }).toFile(join(out, name));
  console.log(`wrote public/icons/${name} (${size}x${size})`);
}
