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
 *   pnpm tsx scripts/illustrate.ts exercise <src.png> <id>
 *   pnpm tsx scripts/illustrate.ts exercise-gen <id> "<subject>"
 *     the same for an exercise sketch (docs/16 §10): a two-panel 3:2 drawing
 *     (START left, END right) written to
 *       public/illustrations/exercises/<id>.webp     1200 × 800, alpha, target <= 110 KB
 *       public/illustrations/exercises/<id>@2x.webp  2400 × 1600, alpha, target <= 260 KB
 *     with no manifest entry (the exercise card references the stem directly).
 *
 * `<slug>` is the file stem a topic names in `topic.yaml` (`illustration: <slug>`);
 * `<id>` is the exercise id (`sketch` in the shared exercise sheet).
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

interface Variant {
  suffix: string;
  /** Output width in px (height follows the shape's aspect ratio). */
  width: number;
  budget: number;
}

interface Shape {
  /** Width : height of the padded canvas. */
  aspect: number;
  outDir: string;
  /** Path shown in the log, relative to the repo. */
  label: string;
  variants: readonly Variant[];
  /** Whether the result is recorded in the frontispiece manifest. */
  manifest: boolean;
  /** Lowest WebP quality the budget search may fall to. */
  minQuality: number;
}

const PLATE: Shape = {
  aspect: 1,
  outDir: OUT_DIR,
  label: 'public/illustrations',
  variants: [
    { suffix: '', width: 800, budget: 90 * 1024 },
    { suffix: '@2x', width: 1600, budget: 260 * 1024 },
  ],
  manifest: true,
  minQuality: 40,
};

const EXERCISE: Shape = {
  aspect: 3 / 2,
  outDir: join(OUT_DIR, 'exercises'),
  label: 'public/illustrations/exercises',
  variants: [
    { suffix: '', width: 1200, budget: 110 * 1024 },
    { suffix: '@2x', width: 2400, budget: 260 * 1024 },
  ],
  manifest: false,
  minQuality: 58,
};

/** The shared style brief every illustration is drawn to. */
export const STYLE_BRIEF =
  'STYLE (apply exactly): fine graphite pencil drawing in the manner of a 19th-century scientific / engineering plate: ' +
  'delicate cross-hatching and stippling for shading, confident clean contour lines, mid-grey to dark-grey graphite only. ' +
  'NO colour, NO paper texture, NO background, NO frame, NO text, NO labels, NO shadow on the ground. ' +
  'Fully transparent background (PNG with alpha). The subject fills about 85% of the 1024x1024 square canvas, centred, ' +
  'isolated like a museum specimen.';

/** The shared brief for exercise sketches (docs/16 §10.2). */
export const EXERCISE_BRIEF =
  'STYLE: fine graphite pencil drawing in the manner of a 19th-century scientific plate, delicate cross-hatching, clean confident contour lines, grey graphite only; ' +
  'NO colour, NO background, NO text, NO letters, NO labels, NO numbers, NO frame or border; fully transparent background (PNG alpha). ' +
  'LAYOUT: two panels side by side on one 3:2 landscape canvas, left panel = START position, right panel = END position, identical camera and scale in both panels, ' +
  'a single thin curved arrow showing the path of the movement. ' +
  'FIGURE: the same one neutral adult athlete of average build in both panels (not a bodybuilder, not a slim fashion model), short hair, plain fitted T-shirt and shorts, plain training shoes, ' +
  'face kept to a simple contour with no facial detail, anatomically correct hands with five fingers and correct joint angles, no muscles drawn on the skin. ' +
  'EQUIPMENT drawn accurately and to scale (Olympic barbell with round plates and collars, round dumbbells, flat or adjustable bench, cable column with a D-handle, parallel dip bars) exactly as named in the subject. ' +
  'SAFETY: neutral spine, feet planted where applicable, nothing unsafe.';

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function fail(message: string): never {
  console.error(`illustrate: ${message}`);
  process.exit(1);
}

interface ManifestEntry {
  /** MASK rows of MASK hex digits: coverage of each cell, 0 (empty) to f (solid). */
  mask: string[];
}

async function processImage(src: string, slug: string, shape: Shape): Promise<void> {
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
  // Smallest canvas of the shape's aspect that holds the drawing with the margin.
  const inner = Math.max(w, h * shape.aspect);
  const canvasW = Math.ceil(inner / (1 - 2 * MARGIN));
  const canvasH = Math.ceil(canvasW / shape.aspect);
  const left = Math.floor((canvasW - w) / 2);
  const top = Math.floor((canvasH - h) / 2);

  const square = await sharp(data, { raw: { width, height, channels } })
    .extract({ left: x0, top: y0, width: w, height: h })
    .extend({
      left,
      top,
      right: canvasW - w - left,
      bottom: canvasH - h - top,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  mkdirSync(shape.outDir, { recursive: true });
  for (const v of shape.variants) {
    const file = join(shape.outDir, `${slug}${v.suffix}.webp`);
    const outH = Math.round(v.width / shape.aspect);
    let quality = 82;
    for (;;) {
      await sharp(square)
        .resize(v.width, outH, { kernel: 'lanczos3' })
        .webp({ quality, alphaQuality: 90, effort: 6, smartSubsample: true })
        .toFile(file);
      const bytes = statSync(file).size;
      if (bytes <= v.budget || quality <= shape.minQuality) {
        const note = bytes > v.budget ? ` (over the ${Math.round(v.budget / 1024)} KB target)` : '';
        console.log(`wrote ${shape.label}/${slug}${v.suffix}.webp  ${v.width}×${outH}  q${quality}  ${Math.round(bytes / 1024)} KB${note}`);
        break;
      }
      quality -= 6;
    }
  }
  if (!shape.manifest) return;

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

async function generate(slug: string, subject: string, shape: Shape): Promise<void> {
  if (!SLUG.test(slug)) fail(`slug "${slug}" must be kebab-case`);
  if (!subject.trim()) fail('give the subject to draw, e.g. gen kueh "a slice of kueh lapis, layers visible"');
  const dir = mkdtempSync(join(tmpdir(), `atlas-illustrate-${slug}-`));
  const size = shape === EXERCISE ? 'ONE landscape image (1536x1024)' : 'ONE image';
  const brief = shape === EXERCISE ? EXERCISE_BRIEF : STYLE_BRIEF;
  const prompt =
    `Use the image generation tool to generate ${size} and save it as ${slug}.png in the current working directory. ` +
    `SUBJECT: ${subject}. ${brief} Reply with the absolute path only.`;
  console.log(`codex exec in ${dir} …`);
  const run = spawnSync('codex', ['exec', '--skip-git-repo-check', '-C', dir, prompt], {
    stdio: ['ignore', 'inherit', 'inherit'],
  });
  if (run.error) fail(`could not run codex: ${run.error.message}`);
  if (run.status !== 0) fail(`codex exited with ${run.status}`);
  const png = join(dir, `${slug}.png`);
  if (!existsSync(png)) fail(`codex finished but ${png} is missing`);
  await processImage(png, slug, shape);
  console.log(`source kept at ${png}`);
}

const [command, a, b] = process.argv.slice(2);
if (command === 'process' && a && b) await processImage(resolve(a), b, PLATE);
else if (command === 'gen' && a && b) await generate(a, b, PLATE);
else if (command === 'exercise' && a && b) await processImage(resolve(a), b, EXERCISE);
else if (command === 'exercise-gen' && a && b) await generate(a, b, EXERCISE);
else {
  console.error(
    'usage:\n  pnpm tsx scripts/illustrate.ts process <src.png> <slug>\n  pnpm tsx scripts/illustrate.ts gen <slug> "<subject>"' +
      '\n  pnpm tsx scripts/illustrate.ts exercise <src.png> <id>\n  pnpm tsx scripts/illustrate.ts exercise-gen <id> "<subject>"',
  );
  process.exit(1);
}
