/** Reuse approved drawings through the standard processor; final byte-only WebP optimisation. */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import sharp from 'sharp';
const dir = process.argv[2] ?? '/Users/gavin/work/atlas/art/planned/dinosaur-earth';
for (const [kind, stem] of [['process', 'dinosaur-earth'], ['figure', 'dinosaur-earth-reading-strata'], ['figure', 'dinosaur-earth-impactor']]) {
  execFileSync('pnpm', ['tsx', 'scripts/illustrate.ts', kind!, `${dir}/${stem}.png`, stem!], { stdio: 'inherit' });
}
for (const [file, cap] of [['public/illustrations/dinosaur-earth.webp', 90_000], ['public/illustrations/figures/dinosaur-earth-reading-strata.webp', 120_000], ['public/illustrations/figures/dinosaur-earth-impactor.webp', 120_000]] as const) {
  const input = readFileSync(file);
  for (let quality = 38; quality >= 10; quality -= 4) {
    const output = await sharp(input).webp({ quality, alphaQuality: 80, effort: 6 }).toBuffer();
    if (output.length <= cap || quality === 10) {
      if (output.length > cap) throw Error(`${file} exceeds image byte target`);
      writeFileSync(file, output);
      console.log(`${file}: ${output.length} bytes, final quality ${quality}`);
      break;
    }
  }
}
