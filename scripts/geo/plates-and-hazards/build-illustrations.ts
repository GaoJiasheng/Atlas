/** Process the three approved PNGs; near-lossless RGB keeps decoded graphite exactly neutral. */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import sharp from 'sharp';
const root = resolve(import.meta.dirname, '../../..');
const approved = process.env.ATLAS_PH_IMAGES_DIR ?? '/Users/gavin/work/atlas/art/planned/plates-and-hazards';
for (const [mode, stem] of [['process', 'plates-and-hazards'], ['figure', 'plates-and-hazards-fault-offset'], ['figure', 'plates-and-hazards-tsunami-shoaling']] as const) {
  const command = spawnSync('pnpm', ['tsx', 'scripts/illustrate.ts', mode, `${approved}/${stem}.png`, stem], { cwd: root, encoding: 'utf8' });
  if (command.status !== 0) throw new Error(command.stderr || command.stdout);
}
const reports = [];
for (const stem of ['plates-and-hazards', 'plates-and-hazards@2x', 'figures/plates-and-hazards-fault-offset', 'figures/plates-and-hazards-tsunami-shoaling']) {
  const file = `public/illustrations/${stem}.webp`;
  const bytes = await sharp(readFileSync(resolve(root, file))).greyscale().ensureAlpha().webp({ nearLossless: true, quality: 40, effort: 6 }).toBuffer();
  writeFileSync(resolve(root, file), bytes);
  const { data, info } = await sharp(bytes).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let transparent = 0, coloured = 0;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) transparent++;
    if (data[i + 3] && (data[i] !== data[i + 1] || data[i + 1] !== data[i + 2])) coloured++;
  }
  if (coloured !== 0 || transparent === 0) throw new Error(`${file}: neutral graphite / transparent ground check failed`);
  reports.push({ file, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex'), width: info.width, height: info.height, transparentPixels: transparent, colouredPixels: coloured });
}
const audit = resolve(root, 'src/content/topics/plates-and-hazards/provenance');
mkdirSync(audit, { recursive: true });
writeFileSync(resolve(audit, 'illustrations.json'), JSON.stringify({ method: 'Approved PNGs through existing illustrate.ts, then grayscale near-lossless WebP quality40; alpha retained. This avoids 1-level chroma decoder rounding in lossy YUV WebP. No new image generation.', softBudgetDeviation: 'Exact decoded R=G=B takes priority over the illustrate.ts soft compression targets; actual sizes recorded below.', reports }, null, 2)+'\n');
console.log(reports);
