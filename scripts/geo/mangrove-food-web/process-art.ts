/** Canonical approved-art processing, plus the small cover's hard catalogue budget. */
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import sharp from 'sharp';

const root = resolve(import.meta.dirname, '../../..');
const source = process.argv[2];
if (!source) throw new Error('Give the approved art directory, or --finalize-only after scripts/illustrate.ts.');
if (source !== '--finalize-only') for (const [command, name] of [
  ['process', 'mangrove-food-web'], ['figure', 'mangrove-food-web-breathing-roots'], ['figure', 'mangrove-food-web-predator-prey'],
]) {
  const result = spawnSync('pnpm', ['tsx', 'scripts/illustrate.ts', command!, resolve(source, `${name}.png`), name!], { cwd: root, stdio: 'inherit' });
  if (result.status !== 0) throw new Error(`Illustration processing failed: ${name}`);
}
const cover = resolve(root, 'public/illustrations/mangrove-food-web.webp');
if (statSync(cover).size > 90 * 1024) {
  const input = readFileSync(cover);
  for (const [quality, alphaQuality] of [[40, 50], [34, 30]] as const) {
    const output = await sharp(input).webp({ quality, alphaQuality, effort: 6, smartSubsample: true }).toBuffer();
    console.log(`Cover q${quality}/alpha${alphaQuality}: ${output.length} bytes`);
    if (output.length <= 90 * 1024) { writeFileSync(cover, output); break; }
  }
  if (statSync(cover).size > 90 * 1024) throw new Error('Small cover still exceeds 90 KiB.');
}
const provenanceFile = resolve(root, 'src/content/topics/mangrove-food-web/authoring/art-provenance.json');
const provenance = JSON.parse(readFileSync(provenanceFile, 'utf8'));
provenance.coverPostprocess = 'Canonical small cover re-encoded at WebP q40/alpha50 (q34/alpha30 fallback), unchanged 800×800 framing; retained transparency with quantized alpha, to meet hard 90KiB target. No image generation.';
for (const asset of provenance.assets) for (const output of asset.outputs) {
  const bytes = readFileSync(resolve(root, output.file));
  output.bytes = bytes.length;
  output.sha256 = createHash('sha256').update(bytes).digest('hex');
}
writeFileSync(provenanceFile, JSON.stringify(provenance, null, 2) + '\n');
console.log(`Small cover: ${statSync(cover).size} bytes; provenance refreshed.`);
