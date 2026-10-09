/**
 * A topic of the real-map pipeline: `scripts/geo/<slug>/` holds its manifest
 * `sources.json`, `SOURCES-GEO.md`, an optional `check-colors.json`
 * (holder -> #rrggbb for check.ts) and the gitignored `raw/` (downloads) and
 * `work/` (intermediate GeoJSON). Its output is
 * `src/content/topics/<slug>/data/control.json`.
 *
 * Every runner takes `--topic <slug>`; `openTopic` turns a missing or unknown
 * slug into a usage error that lists the topics present.
 */
import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { GEO, ROOT, readJson } from './common';
import { pipelineConfig, type PipelineConfig, type Sources } from './manifest';

export interface Topic {
  slug: string;
  /** scripts/geo/<slug> */
  dir: string;
  raw: string;
  work: string;
  sources: Sources;
  config: PipelineConfig;
  /** src/content/topics/<slug>/data/control.json */
  controlFile: string;
  /** Absolute folder for check.ts screenshots (`pipeline.shots`). */
  shots: string;
  rawFile(name: string): string;
  workFile(name: string): string;
  /** Create raw/ and work/. */
  ensureDirs(): void;
}

/** A repo-relative path from the manifest, made absolute. */
export const repoPath = (path: string): string => resolve(ROOT, path);

/** Folders under scripts/geo/ that contain a sources.json. */
export function listTopics(): string[] {
  return readdirSync(GEO, { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(join(GEO, d.name, 'sources.json')))
    .map((d) => d.name)
    .sort();
}

export function loadTopic(slug: string): Topic {
  const dir = join(GEO, slug);
  const manifest = join(dir, 'sources.json');
  if (!/^[a-z0-9][a-z0-9-]*$/.test(slug) || !existsSync(manifest)) throw new Error(`unknown topic "${slug}": no scripts/geo/${slug}/sources.json`);
  const sources = readJson<Sources>(manifest);
  const config = pipelineConfig(sources, slug);
  const colorsFile = join(dir, 'check-colors.json');
  if (existsSync(colorsFile)) config.checkColors = { ...readJson<Record<string, string>>(colorsFile), ...config.checkColors };
  const raw = join(dir, 'raw');
  const work = join(dir, 'work');
  return {
    slug,
    dir,
    raw,
    work,
    sources,
    config,
    controlFile: join(ROOT, 'src/content/topics', slug, 'data', 'control.json'),
    shots: repoPath(config.shots),
    rawFile: (name) => join(raw, name),
    workFile: (name) => join(work, name),
    ensureDirs: () => {
      for (const d of [raw, work]) mkdirSync(d, { recursive: true });
    },
  };
}

/** The topic named by `--topic`, or a usage error (exit 2) listing the available topics. */
export function openTopic(slug: string | undefined): Topic {
  const step = basename(process.argv[1] ?? 'step.ts');
  const available = listTopics();
  const usage = `usage: pnpm tsx scripts/geo/lib/${step} --topic <slug>\navailable topics (folders under scripts/geo/ with a sources.json): ${available.join(', ') || 'none'}\n`;
  if (!slug) {
    process.stderr.write(`ERROR --topic is required\n${usage}`);
    process.exit(2);
  }
  try {
    return loadTopic(slug);
  } catch (e) {
    process.stderr.write(`ERROR ${(e as Error).message}\n${usage}`);
    process.exit(2);
  }
}
