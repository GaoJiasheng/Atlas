/** Verify the command-line validator reaches public arrays and the monthly schema branch. */
import { spawnSync } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const root = join(import.meta.dirname, '..');
let dir = '';
let output = '';
let status: number | null = null;
beforeAll(() => {
  dir = mkdtempSync(join(tmpdir(), 'atlas-monthly-validator-'));
  for (const slug of ['clean', 'missing-array', 'unknown-source', 'bad-index', 'id-collision']) {
    const target = join(dir, slug);
    cpSync(join(root, 'src/content/topics/sample-climate'), target, {
      recursive: true,
    });
    const topicFile = join(target, 'topic.yaml');
    const topic = JSON.parse(readFileSync(topicFile, 'utf8'));
    topic.id = slug;
    if (slug === 'missing-array') topic.monthlyLayers[0].file = 'missing-monthly-fixture-resource';
    if (slug === 'unknown-source') topic.monthlyLayers[0].sources = ['S999'];
    if (slug === 'id-collision') topic.monthlyLayers[0].id = 'site-singapore';
    writeFileSync(topicFile, JSON.stringify(topic));
    if (slug === 'bad-index') {
      const file = join(target, 'chapters/01-northeast-monsoon.mdx');
      writeFileSync(file, readFileSync(file, 'utf8').replace('"index": [\n      "site-singapore"', '"index": [\n      "missing-site"'));
    }
  }
  const result = spawnSync(join(root, 'node_modules/.bin/tsx'), ['scripts/validate-content.ts'], {
    cwd: root,
    encoding: 'utf8',
    env: { ...process.env, ATLAS_TOPICS_DIR: dir, FORCE_COLOR: '0' },
    timeout: 60_000,
  });
  status = result.status;
  output = result.stdout + result.stderr;
}, 60_000);
afterAll(() => {
  if (dir) rmSync(dir, { recursive: true, force: true });
});

describe('monthly validator command', () => {
  it('accepts the date-free fixture through the same schemas as page builds', () => {
    expect(output).toContain('5 topic(s)');
    expect(output.split('\n').filter((line) => line.startsWith('error') && line.includes('/clean/'))).toEqual([]);
  });
  it('validates public files and declared source references', () => {
    expect(status).toBe(1);
    expect(output).toMatch(/public\/geo\/missing-monthly-fixture-resource\.json\s+monthly layer "clim-wind": file not found/);
    expect(output).toContain('monthlyLayers.0.sources.0: unknown source S999');
  });
  it('rejects site-index references through the monthly branch', () => {
    expect(output).toContain('state.index: unknown site "missing-site"');
  });
  it('keeps monthly layers in the topic-wide id registry', () => {
    expect(output).toContain('site id "site-singapore" duplicates monthly layer "site-singapore"');
  });
});
