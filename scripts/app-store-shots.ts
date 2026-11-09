/**
 * `pnpm tsx scripts/app-store-shots.ts [--origin http://127.0.0.1:4240] [--only name,name]`
 * App Store iPad screenshots of the built site (serve dist/ first, e.g. `pnpm preview --port 4240`).
 *
 * Shoots every entry of SHOTS in EN and ZH, paper theme, landscape, deviceScaleFactor 2, at
 *   13-inch   1376×1032 CSS px -> 2752×2064  -> docs/app-store/screenshots/<locale>/NN-<name>.png
 *   12.9-inch 1366×1024 CSS px -> 2732×2048  -> docs/app-store/screenshots/<locale>-12.9/NN-<name>.png
 * and checks with macOS `sips` that no PNG carries an alpha channel (App Store rejects alpha).
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { chromium, type Browser } from '@playwright/test';

const ROOT = resolve(import.meta.dirname, '..');
const OUT = join(ROOT, 'docs/app-store/screenshots');

interface Shot {
  name: string;
  /** Path after /<locale>/ ('' = home page). */
  path: string;
  /** Extra settle time after the stage is ready (ms). */
  wait?: number;
  /** Camera preset to land on after load. */
  preset?: string;
  /** Display modes to switch on after load. */
  modes?: string[];
  /** false folds the reading panel so the stage takes the page. */
  reader?: boolean;
}

const SHOTS: Shot[] = [
  { name: 'home', path: '' },
  { name: 'aircon-cutaway', path: 'topics/aircon/?ch=open-it-up', wait: 3500, preset: 'cutaway-side', modes: ['cutaway'], reader: false },
  { name: 'eyes-and-ears', path: 'topics/eyes-and-ears/?ch=three-moving-bones', wait: 3500, preset: 'ear', reader: false },
  { name: 'ww2-map', path: 'topics/ww2/?ch=fall-of-singapore', wait: 4000 },
  { name: 'zheng-he-map', path: 'topics/zheng-he/?ch=hormuz-and-gifts', wait: 4000, preset: 'view-ocean' },
  { name: 'fractions-lesson', path: 'topics/fractions/?ch=equivalent-fractions&b=3', wait: 2500 },
  { name: 'solar-system', path: 'topics/solar-system/?ch=eight-worlds', wait: 3500, preset: 'orbit', reader: false },
  { name: 'saturn-v', path: 'topics/saturn-v/?ch=stages-and-mass', wait: 3500, preset: 'stages', modes: ['exploded'], reader: false },
];

const SIZES = [
  { dir: (l: string) => l, viewport: { width: 1376, height: 1032 } },
  { dir: (l: string) => `${l}-12.9`, viewport: { width: 1366, height: 1024 } },
];

const { values } = parseArgs({ options: { origin: { type: 'string', default: 'http://127.0.0.1:4240' }, only: { type: 'string' }, locale: { type: 'string' }, size: { type: 'string' } } });
const origin = values.origin!;
const only = values.only ? new Set(values.only.split(',')) : null;

async function shoot(browser: Browser, locale: string, size: (typeof SIZES)[number]): Promise<void> {
  const dir = join(OUT, size.dir(locale));
  mkdirSync(dir, { recursive: true });
  for (const [i, shot] of SHOTS.entries()) {
    if (only && !only.has(shot.name)) continue;
    const context = await browser.newContext({ viewport: size.viewport, deviceScaleFactor: 2, hasTouch: true, isMobile: true, serviceWorkers: 'block', locale: locale === 'zh' ? 'zh-CN' : 'en-SG' });
    await context.addInitScript(() => {
      try {
        localStorage.setItem('atlas:guide-seen', '1');
        localStorage.setItem('atlas:theme', 'paper');
      } catch { /* blocked storage */ }
      (window as unknown as { __name: <T>(fn: T) => T }).__name = (fn) => fn;
    });
    const page = await context.newPage();
    const external: string[] = [];
    page.on('request', (r) => { if (!r.url().startsWith(origin) && !/^(data|blob|about):/.test(r.url())) external.push(r.url()); });
    await page.goto(`${origin}/${locale}/${shot.path}`);
    if (shot.path) {
      await page.waitForFunction(() => window.__atlas !== undefined, null, { timeout: 60_000 });
      const ready = await page.evaluate(() => window.__atlas!.ready);
      if (!ready) throw new Error(`${shot.name}: stage never became ready`);
      await page.evaluate(({ preset, modes, reader }) => {
        const api = window.__atlas!;
        api.setTheme('paper');
        api.setCard(false);
        api.setLegends(false);
        api.setPlate(false);
        api.setLeftColumn('collapsed');
        if (reader === false) api.setReader(false);
        for (const mode of modes ?? []) api.setMode(mode, true, { instant: true });
        if (preset) api.setPreset(preset, { instant: true });
      }, { preset: shot.preset, modes: shot.modes, reader: shot.reader });
      // Renderer telemetry and keyboard hints mean nothing on a store page for a touch device.
      await page.addStyleTag({ content: '.atlas-perf, .space-perf, .ts-perf, .atlas-hint { visibility: hidden !important; }' });
    } else {
      await page.waitForLoadState('networkidle');
    }
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(shot.wait ?? 1500);
    const file = join(dir, `${String(i + 1).padStart(2, '0')}-${shot.name}.png`);
    await page.screenshot({ path: file, animations: 'disabled' });
    const alpha = execFileSync('sips', ['-g', 'hasAlpha', file], { encoding: 'utf8' });
    if (/hasAlpha: yes/.test(alpha)) throw new Error(`${file} has an alpha channel`);
    const mb = statSync(file).size / 1e6;
    console.log(`${size.dir(locale)}/${shot.name}: ${mb.toFixed(1)} MB${external.length ? ` EXTERNAL ${external.join(' ')}` : ''}`);
    if (mb >= 10) throw new Error(`${file} is ${mb.toFixed(1)} MB (limit 10 MB)`);
    await context.close();
  }
}

const browser = await chromium.launch({ args: ['--enable-gpu', '--ignore-gpu-blocklist', ...(process.platform === 'darwin' ? ['--use-angle=metal'] : [])] });
try {
  for (const size of SIZES) {
    if (values.size && String(size.viewport.width) !== values.size) continue;
    for (const locale of ['en', 'zh']) if (!values.locale || values.locale === locale) await shoot(browser, locale, size);
  }
} finally {
  await browser.close();
}
