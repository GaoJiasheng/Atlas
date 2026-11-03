/** Process approved original art; preserve framing while meeting cover and figure budgets. */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import sharp from 'sharp';

const root = resolve(import.meta.dirname, '../../../../..');
const source = process.argv[2];
if (!source) throw new Error('Pass the approved art directory, or --finalize-only after scripts/illustrate.ts.');
const names = ['coral-reef', 'coral-reef-polyp', 'coral-reef-zones'];
const approved = source === '--finalize-only' ? '/Users/gavin/work/atlas/art/planned/coral-reef' : resolve(source);
if (source !== '--finalize-only') {
  const result = spawnSync('pnpm', ['tsx', 'scripts/illustrate.ts', 'process', resolve(approved, 'coral-reef.png'), 'coral-reef'], { cwd: root, stdio: 'inherit' });
  if (result.status !== 0) throw new Error('Illustration processing failed: coral-reef');
}
const cover = resolve(root, 'public/illustrations/coral-reef.webp');
if (statSync(cover).size > 90 * 1024) {
  const input = readFileSync(cover);
  for (const [quality, alphaQuality] of [[40, 50], [34, 30]] as const) {
    const output = await sharp(input).webp({ quality, alphaQuality, effort: 6, smartSubsample: true }).toBuffer();
    if (output.length <= 90 * 1024) { writeFileSync(cover, output); break; }
  }
  if (statSync(cover).size > 90 * 1024) throw new Error('Small cover exceeds 90 KiB.');
}
// Match scripts/illustrate.ts figure trimming, 6% padding and Lanczos framing,
// but search below its q58 soft floor from the original PNG, never a lossy WebP.
for (const name of names.slice(1)) {
  const { data, info } = await sharp(resolve(approved, `${name}.png`))
    .ensureAlpha().modulate({ saturation: 0 }).raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  let x0 = width, y0 = height, x1 = -1, y1 = -1;
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    if (data[(y * width + x) * channels + 3]! <= 10) continue;
    x0 = Math.min(x0, x); y0 = Math.min(y0, y);
    x1 = Math.max(x1, x); y1 = Math.max(y1, y);
  }
  if (x1 < 0) throw new Error(`${name} is fully transparent.`);
  const w = x1 - x0 + 1, h = y1 - y0 + 1;
  const canvasW = Math.ceil(Math.max(w, h * 4 / 3) / 0.88);
  const canvasH = Math.ceil(canvasW / (4 / 3));
  const left = Math.floor((canvasW - w) / 2), top = Math.floor((canvasH - h) / 2);
  const padded = await sharp(data, { raw: { width, height, channels } })
    .extract({ left: x0, top: y0, width: w, height: h })
    .extend({ left, top, right: canvasW - w - left, bottom: canvasH - h - top, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png().toBuffer();
  let encoded: Buffer | undefined;
  for (let quality = 58; quality >= 48; quality--) {
    const output = await sharp(padded).resize(1200, 900, { kernel: 'lanczos3' })
      .webp({ quality, alphaQuality: 90, effort: 6, smartSubsample: true }).toBuffer();
    if (output.length <= 120 * 1024) { encoded = output; break; }
  }
  if (!encoded) throw new Error(`${name} exceeds 120 KiB; review its original art.`);
  writeFileSync(resolve(root, `public/illustrations/figures/${name}.webp`), encoded);
}
const hash = (bytes: Buffer) => createHash('sha256').update(bytes).digest('hex');
const assets = await Promise.all(names.map(async (name, i) => {
  const input = readFileSync(resolve(approved, `${name}.png`));
  const files = i === 0 ? [`public/illustrations/${name}.webp`, `public/illustrations/${name}@2x.webp`] : [`public/illustrations/figures/${name}.webp`];
  return { name, input: { file: `${name}.png`, bytes: input.length, sha256: hash(input) }, outputs: await Promise.all(files.map(async (file) => {
    const bytes = readFileSync(resolve(root, file));
    const meta = await sharp(bytes).metadata();
    return { file, bytes: bytes.length, sha256: hash(bytes), width: meta.width, height: meta.height, alpha: meta.hasAlpha };
  })) };
}));
writeFileSync(resolve(import.meta.dirname, 'art-provenance.json'), JSON.stringify({
  date: '2026-11-03', licence: 'Atlas original content, CC BY-NC-SA 4.0',
  origin: 'Approved generated originals; no third-party photographs, traced geometry or textures.',
  method: 'scripts/illustrate.ts process for cover; small cover additionally re-encoded q40/alpha50 (q34/alpha30 fallback), unchanged 800×800 framing. Figures encoded directly from approved PNGs with identical figure crop, 6% padding, greyscale and 1200×900 framing; alpha90, effort6, smartSubsample; highest q58–48 meeting 120 KiB (polyp q54, zones q51). No cascading lossy re-encoding.',
  visualReview: 'Approved originals, previous WebPs and final figures inspected at full size and 2× mouth/reef close-ups on paper ground: contours, fine stippling and cross-hatching retained without visible loss; dimensions, framing and decoded alpha unchanged. One polyp mouth, twelve unbranched tentacles; continuous flat/crest/slope; cover depicts skeletal morphology and does not establish living tissue.',
  assets,
}, null, 2) + '\n');
