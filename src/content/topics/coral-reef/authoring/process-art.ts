/** Process the approved original art; preserve framing while meeting the catalogue cover budget. */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import sharp from 'sharp';

const root = resolve(import.meta.dirname, '../../../../..');
const source = process.argv[2];
if (!source) throw new Error('Pass the approved art directory, or --finalize-only after scripts/illustrate.ts.');
const names = ['coral-reef', 'coral-reef-polyp', 'coral-reef-zones'];
if (source !== '--finalize-only') for (const [i, name] of names.entries()) {
  const result = spawnSync('pnpm', ['tsx', 'scripts/illustrate.ts', i === 0 ? 'process' : 'figure', resolve(source, `${name}.png`), name], { cwd: root, stdio: 'inherit' });
  if (result.status !== 0) throw new Error(`Illustration processing failed: ${name}`);
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
const hash = (bytes: Buffer) => createHash('sha256').update(bytes).digest('hex');
const approved = source === '--finalize-only' ? '/Users/gavin/work/atlas/art/planned/coral-reef' : resolve(source);
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
  date: '2026-10-29', licence: 'Atlas original content, CC BY-NC-SA 4.0',
  origin: 'Approved generated originals; no third-party photographs, traced geometry or textures.',
  method: 'scripts/illustrate.ts process / figure. Small cover additionally re-encoded q40/alpha50 (q34/alpha30 fallback), unchanged 800×800 framing and transparent background. Figure script quality floor retained; figure budgets are soft.',
  visualReview: 'Original and final art inspected: one polyp mouth, twelve unbranched tentacles; continuous flat/crest/slope; cover depicts skeletal morphology and does not establish living tissue.',
  assets,
}, null, 2) + '\n');
