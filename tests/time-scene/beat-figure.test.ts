/** The optional beat figure: its shape, its file check, and the validator's report. */
import { spawnSync } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { climatologyBeat, timeBeat, timeBeatFigureIssues, timeChapterState } from '../../src/engines/time-scene/schema';
import { geographyBeat } from '../../src/engines/time-scene/geography-schema';

const text = { en: 'Words', zh: '文字' };
const figure = { src: 'figures/b200-rack', alt: text, caption: text };
const beat = (f: unknown) => ({ caption: text, figure: f });

describe('beat figure schema', () => {
  it('is optional, and takes a stem with an optional invert', () => {
    expect(timeBeat.safeParse({ caption: text }).success).toBe(true);
    expect(timeBeat.parse(beat(figure)).figure).toEqual(figure);
    expect(timeBeat.parse(beat({ ...figure, invert: false })).figure?.invert).toBe(false);
  });
  it('accepts a stem under any public/illustrations folder, as <Figure> does', () => {
    expect(timeBeat.safeParse(beat({ ...figure, src: 'bones-and-joints/living-bone' })).success).toBe(true);
    expect(timeBeat.safeParse(beat({ ...figure, src: 'southeast-asia' })).success).toBe(true);
  });
  it.each(['figures/b200-rack.webp', '/figures/b200-rack', '../figures/b200-rack', 'figures//b200-rack', 'figures/B200', 'https://example.com/a', ''])('rejects src %j', (src) => {
    expect(timeBeat.safeParse(beat({ ...figure, src })).success).toBe(false);
  });
  it.each(['alt', 'caption'] as const)('requires %s', (key) => {
    const { [key]: _gone, ...rest } = figure;
    expect(timeBeat.safeParse(beat(rest)).success).toBe(false);
    expect(timeBeat.safeParse(beat({ ...figure, [key]: 'plain text' })).success).toBe(false);
  });
  it('rejects unknown keys and a non-boolean invert', () => {
    expect(timeBeat.safeParse(beat({ ...figure, width: 400 })).success).toBe(false);
    expect(timeBeat.safeParse(beat({ ...figure, invert: 'no' })).success).toBe(false);
  });
  it('reaches monthly beats, and geography beats still refuse it', () => {
    expect(climatologyBeat.safeParse({ month: 7, caption: text, figure }).success).toBe(true);
    expect(geographyBeat.safeParse({ caption: text, figure }).error?.issues.some((i) => i.code === 'unrecognized_keys' && i.keys.includes('figure'))).toBe(true);
  });
});

describe('beat figure file check', () => {
  const state = timeChapterState.parse({ beats: [{ caption: text }, beat(figure), beat({ ...figure, src: 'figures/missing' })] });
  it('names the beat and the file that is missing', () => {
    expect(timeBeatFigureIssues(state, (stem) => stem === 'figures/b200-rack')).toEqual(['state.beats.2.figure: public/illustrations/figures/missing.webp not found']);
  });
  it('is quiet with no beats or no figures', () => {
    expect(timeBeatFigureIssues({}, () => false)).toEqual([]);
    expect(timeBeatFigureIssues({ beats: [timeBeat.parse({ caption: text })] }, () => false)).toEqual([]);
  });
});

describe('pnpm validate', () => {
  it('reports a beat figure with no file, and passes the fixture', () => {
    const root = join(import.meta.dirname, '../..');
    const dir = mkdtempSync(join(tmpdir(), 'atlas-beat-figure-'));
    try {
      const run = () => spawnSync(join(root, 'node_modules/.bin/tsx'), ['scripts/validate-content.ts'], { cwd: root, encoding: 'utf8', env: { ...process.env, ATLAS_TOPICS_DIR: dir, FORCE_COLOR: '0' }, timeout: 60_000 });
      cpSync(join(root, 'src/content/topics/sample-beat-figure'), join(dir, 'sample-beat-figure'), { recursive: true });
      const clean = run();
      expect(clean.status, clean.stdout + clean.stderr).toBe(0);
      const file = join(dir, 'sample-beat-figure/chapters/01-dated-evidence.mdx');
      writeFileSync(file, readFileSync(file, 'utf8').replace('src: figures/b200-rack', 'src: figures/not-drawn-yet'));
      const broken = run();
      expect(broken.status).not.toBe(0);
      expect(broken.stdout + broken.stderr).toContain('state.beats.1.figure: public/illustrations/figures/not-drawn-yet.webp not found');
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  }, 120_000);
});
