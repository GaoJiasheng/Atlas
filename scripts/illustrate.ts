/**
 * Home-page illustrations (docs/06 「首页插图」): graphite pencil drawings on a
 * transparent ground, one per topic, shown in the frontispiece and on the plate cards.
 *
 *   pnpm tsx scripts/illustrate.ts process <src.png> <slug>
 *     trims the transparent margin, pads to a square with a 6 % margin, drops any
 *     colour cast (graphite greys only) and writes
 *       public/illustrations/<slug>.webp      800 px, alpha, target <= 90 KB
 *       public/illustrations/<slug>@2x.webp   1600 px, alpha, target <= 260 KB
 *     plus the slug's coverage mask in src/lib/illustrations.json (the frontispiece
 *     snaps its leader anchors onto the drawing with it; a slug listed there is "present").
 *
 *   pnpm tsx scripts/illustrate.ts gen <slug> "<subject>"
 *     asks `codex exec` to draw the subject in the shared style brief (below) into a
 *     temporary directory, then runs `process` on the result.
 *
 * `<slug>` is the file stem a topic names in `topic.yaml` (`illustration: <slug>`).
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'public', 'illustrations');
const MANIFEST = join(ROOT, 'src', 'lib', 'illustrations.json');

/** Margin around the trimmed drawing, as a fraction of the square side. */
const MARGIN = 0.06;
/** Alpha at or below this counts as empty when trimming (soft halo pixels). */
const ALPHA_FLOOR = 10;
/** Coverage mask resolution (cells per side). */
const MASK = 16;

const VARIANTS = [
  { suffix: '', size: 800, budget: 90 * 1024 },
  { suffix: '@2x', size: 1600, budget: 260 * 1024 },
] as const;

/** The shared style brief every illustration is drawn to. */
export const STYLE_BRIEF =
  'STYLE (apply exactly): fine graphite pencil drawing in the manner of a 19th-century scientific / engineering plate: ' +
  'delicate cross-hatching and stippling for shading, confident clean contour lines, mid-grey to dark-grey graphite only. ' +
  'NO colour, NO paper texture, NO background, NO frame, NO text, NO labels, NO shadow on the ground. ' +
  'Fully transparent background (PNG with alpha). The subject fills about 85% of the 1024x1024 square canvas, centred, ' +
  'isolated like a museum specimen.';

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function fail(message: string): never {
  console.error(`illustrate: ${message}`);
  process.exit(1);
}

interface ManifestEntry {
  /** MASK rows of MASK hex digits: coverage of each cell, 0 (empty) to f (solid). */
  mask: string[];
}

async function processImage(src: string, slug: string): Promise<void> {
  if (!SLUG.test(slug)) fail(`slug "${slug}" must be kebab-case`);
  if (!existsSync(src)) fail(`no such file: ${src}`);

  // Greys only: drop saturation (generated drawings carry faint colour fringes at the alpha edge).
  const { data, info } = await sharp(src)
    .ensureAlpha()
    .modulate({ saturation: 0 })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  let x0 = width;
  let y0 = height;
  let x1 = -1;
  let y1 = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * channels + 3]! <= ALPHA_FLOOR) continue;
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
  }
  if (x1 < 0) fail(`${src} is fully transparent`);
  const w = x1 - x0 + 1;
  const h = y1 - y0 + 1;
  const side = Math.ceil(Math.max(w, h) / (1 - 2 * MARGIN));
  const left = Math.floor((side - w) / 2);
  const top = Math.floor((side - h) / 2);

  const square = await sharp(data, { raw: { width, height, channels } })
    .extract({ left: x0, top: y0, width: w, height: h })
    .extend({
      left,
      top,
      right: side - w - left,
      bottom: side - h - top,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  mkdirSync(OUT_DIR, { recursive: true });
  for (const v of VARIANTS) {
    const file = join(OUT_DIR, `${slug}${v.suffix}.webp`);
    let quality = 82;
    for (;;) {
      await sharp(square)
        .resize(v.size, v.size, { kernel: 'lanczos3' })
        .webp({ quality, alphaQuality: 90, effort: 6, smartSubsample: true })
        .toFile(file);
      const bytes = statSync(file).size;
      if (bytes <= v.budget || quality <= 40) {
        const note = bytes > v.budget ? ` (over the ${Math.round(v.budget / 1024)} KB target)` : '';
        console.log(`wrote public/illustrations/${slug}${v.suffix}.webp  ${v.size}px  q${quality}  ${Math.round(bytes / 1024)} KB${note}`);
        break;
      }
      quality -= 6;
    }
  }

  // Coverage mask of the padded square (alpha averaged per cell).
  const small = await sharp(square).resize(MASK, MASK, { kernel: 'cubic', fit: 'fill' }).ensureAlpha().raw().toBuffer();
  const mask: string[] = [];
  for (let r = 0; r < MASK; r++) {
    let row = '';
    for (let c = 0; c < MASK; c++) row += Math.round((small[(r * MASK + c) * 4 + 3]! / 255) * 15).toString(16);
    mask.push(row);
  }
  const manifest: Record<string, ManifestEntry> = existsSync(MANIFEST)
    ? (JSON.parse(readFileSync(MANIFEST, 'utf8')) as Record<string, ManifestEntry>)
    : {};
  manifest[slug] = { mask };
  const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)));
  writeFileSync(MANIFEST, `${JSON.stringify(sorted, null, 2)}\n`);
  console.log(`updated src/lib/illustrations.json (${slug})`);
}

async function generate(slug: string, subject: string): Promise<void> {
  if (!SLUG.test(slug)) fail(`slug "${slug}" must be kebab-case`);
  if (!subject.trim()) fail('give the subject to draw, e.g. gen kueh "a slice of kueh lapis, layers visible"');
  const dir = mkdtempSync(join(tmpdir(), `atlas-illustrate-${slug}-`));
  const prompt =
    `Use the image generation tool to generate ONE image and save it as ${slug}.png in the current working directory. ` +
    `SUBJECT: ${subject}. ${STYLE_BRIEF} Reply with the absolute path only.`;
  console.log(`codex exec in ${dir} …`);
  const run = spawnSync('codex', ['exec', '--skip-git-repo-check', '-C', dir, prompt], {
    stdio: ['ignore', 'inherit', 'inherit'],
  });
  if (run.error) fail(`could not run codex: ${run.error.message}`);
  if (run.status !== 0) fail(`codex exited with ${run.status}`);
  const png = join(dir, `${slug}.png`);
  if (!existsSync(png)) fail(`codex finished but ${png} is missing`);
  await processImage(png, slug);
  console.log(`source kept at ${png}`);
}

const [command, a, b] = process.argv.slice(2);
if (command === 'process' && a && b) await processImage(resolve(a), b);
else if (command === 'gen' && a && b) await generate(a, b);
else {
  console.error('usage:\n  pnpm tsx scripts/illustrate.ts process <src.png> <slug>\n  pnpm tsx scripts/illustrate.ts gen <slug> "<subject>"');
  process.exit(1);
}
