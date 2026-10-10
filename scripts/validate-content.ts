/**
 * Content validator: `pnpm validate` (also runs before `pnpm build`).
 *
 * Checks, per topic in src/content/topics/<slug>/:
 *   - topic.yaml parses against the topic schema; `id` equals the folder name
 *   - every chapter's frontmatter parses; `order` unique; file named <nn>-<id>.mdx
 *   - chapter `state` parses against the engine's chapter-state schema and
 *     only references ids that exist in the data (SpaceScene, beats included:
 *     `part` / `hide` / `labels` name parts or `group:<id>` groups, `layers`
 *     groups, a beat's string `camera` a named preset)
 *   - data/*.json parse against the engine's data schema; required files exist
 *   - all ids kebab-case and unique within the topic (topic, chapters, data)
 *   - bilingual fields: missing/empty `en` is an error, missing `zh` a warning
 *   - MDX bodies carry both <Lang en> and <Lang zh> blocks (warning otherwise)
 *   - data/sources.json: ids unique (S1, S2 …); every event `sources` ref and
 *     every `<Num s="…">` in a chapter body names a listed source
 *   - `<FlyTo preset="…">` names a preset (TimeScene data/presets.json, SpaceScene
 *     parts.json `presets`); `<More>` has a title
 *   - data/glossary.json: term ids unique, `see` refs exist; every `<Term id="…">`
 *     in a chapter body names a listed term
 *   - at most one `kind: background` chapter, with `order: 0`; `state.note`
 *     only on the background chapter
 *   - referenced files (cover) exist
 * Plus: UI dictionaries (src/i18n/ui.*.json) have identical keys.
 *
 * Exit code 1 if any error.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';
import type { z } from 'zod';
import { topicSchema, type TopicMeta } from '../src/content/schema/topic';
import { chapterSchema } from '../src/content/schema/chapter';
import { KEBAB_ID } from '../src/content/schema/common';
import { sourceIds, type SourcesFile } from '../src/content/schema/sources';
import { glossaryIds, type GlossaryFile } from '../src/content/schema/glossary';
import { engineSchemas, formatIssues } from '../src/engines/schemas';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
// ATLAS_TOPICS_DIR lets tests / tooling validate another tree.
const TOPICS_DIR = process.env.ATLAS_TOPICS_DIR ? resolve(process.env.ATLAS_TOPICS_DIR) : join(ROOT, 'src/content/topics');

/* ------------------------------------------------------------------ */
/* Reporting                                                           */
/* ------------------------------------------------------------------ */

type Level = 'error' | 'warn';
interface Issue {
  level: Level;
  file: string;
  message: string;
}
const issues: Issue[] = [];
const rel = (file: string) => relative(ROOT, file);
const error = (file: string, message: string) => issues.push({ level: 'error', file: rel(file), message });
const warn = (file: string, message: string) => issues.push({ level: 'warn', file: rel(file), message });

function reportZod(file: string, err: z.ZodError, prefix = '') {
  for (const line of formatIssues(err, prefix)) error(file, line);
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function isDir(path: string): boolean {
  return existsSync(path) && statSync(path).isDirectory();
}

function readJson(file: string): unknown {
  try {
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch (e) {
    error(file, `invalid JSON: ${(e as Error).message}`);
    return undefined;
  }
}

function readYaml(file: string, text: string): unknown {
  try {
    return parseYaml(text);
  } catch (e) {
    error(file, `invalid YAML: ${(e as Error).message}`);
    return undefined;
  }
}

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

/**
 * Walk raw data and check every bilingual-looking object (only `en`/`zh`
 * keys): `en` must be a non-empty string, `zh` should be.
 */
function checkBilingual(file: string, value: unknown, path: string[] = []): void {
  if (Array.isArray(value)) {
    value.forEach((v, i) => checkBilingual(file, v, [...path, String(i)]));
    return;
  }
  if (!value || typeof value !== 'object') return;
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj);
  const at = path.length ? path.join('.') : '(root)';
  if (keys.length > 0 && keys.every((k) => k === 'en' || k === 'zh')) {
    if (typeof obj.en !== 'string' || obj.en.trim() === '') error(file, `${at}: missing English text (en)`);
    if (typeof obj.zh !== 'string' || obj.zh.trim() === '') warn(file, `${at}: missing Chinese text (zh), falls back to en`);
    return;
  }
  for (const [k, v] of Object.entries(obj)) checkBilingual(file, v, [...path, k]);
}

function checkLangBlocks(file: string, body: string): void {
  const hasEn = /<Lang\s+en(\s|>|\/)/.test(body);
  const hasZh = /<Lang\s+zh(\s|>|\/)/.test(body);
  const bad = body.match(/<Lang(?![^>]*\b(en|zh)\b)[^>]*>/g);
  if (bad) error(file, `<Lang> needs an "en" or "zh" attribute: ${bad[0]}`);
  if (!body.trim()) {
    warn(file, 'chapter body is empty');
  } else if (!hasEn && !hasZh) {
    warn(file, 'body has no <Lang en>/<Lang zh> blocks; the same text shows in both languages');
  } else {
    if (!hasEn) error(file, 'body has <Lang zh> but no <Lang en> block');
    if (!hasZh) warn(file, 'body has no <Lang zh> block (Chinese page will show nothing)');
  }
}

/** Attributes of every `<Tag …>` opening tag in an MDX body (string attributes only). */
function tagAttrs(body: string, tag: string): { raw: string; attrs: Record<string, string> }[] {
  const out: { raw: string; attrs: Record<string, string> }[] = [];
  const re = new RegExp(`<${tag}(?![A-Za-z])([^>]*)>`, 'g');
  for (const m of body.matchAll(re)) {
    const attrs: Record<string, string> = {};
    for (const a of (m[1] ?? '').matchAll(/([A-Za-z]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|\{)/g)) {
      attrs[a[1]!] = a[2] ?? a[3] ?? '{…}';
    }
    out.push({ raw: m[0], attrs });
  }
  return out;
}

/** `<Num s>`, `<FlyTo preset>`, `<More title>` and `<Term id>` in a chapter body. */
function checkBodyComponents(file: string, body: string, sources: Set<string> | null, presets: Set<string>, terms: Set<string> | null): void {
  for (const { raw, attrs } of tagAttrs(body, 'Num')) {
    const ids = (attrs.s ?? '').split(/[\s,]+/).filter(Boolean);
    if (ids.length === 0) {
      error(file, `<Num> needs a source id, e.g. <Num s="S1">: ${raw}`);
      continue;
    }
    for (const id of ids) {
      if (!sources) error(file, `<Num s="${id}">: the topic has no data/sources.json`);
      else if (!sources.has(id)) error(file, `<Num s="${id}">: unknown source "${id}" (not in data/sources.json)`);
    }
  }
  for (const { raw, attrs } of tagAttrs(body, 'FlyTo')) {
    const id = attrs.preset;
    if (!id) error(file, `<FlyTo> needs a preset, e.g. <FlyTo preset="singapore-island">: ${raw}`);
    else if (!presets.has(id)) error(file, `<FlyTo preset="${id}">: unknown preset (not a named camera preset of this topic)`);
  }
  for (const { raw, attrs } of tagAttrs(body, 'More')) {
    if (!attrs.title) error(file, `<More> needs a title={{ en: "…", zh: "…" }}: ${raw}`);
  }
  for (const { raw, attrs } of tagAttrs(body, 'Term')) {
    const id = attrs.id;
    if (!id) error(file, `<Term> needs an id, e.g. <Term id="blitzkrieg">: ${raw}`);
    else if (!terms) error(file, `<Term id="${id}">: the topic has no data/glossary.json`);
    else if (!terms.has(id)) error(file, `<Term id="${id}">: unknown term (not in data/glossary.json)`);
  }
}

class IdRegistry {
  private seen = new Map<string, string>();
  constructor(private readonly file: string) {}
  add(id: string, kind: string, file = this.file) {
    if (!KEBAB_ID.test(id)) error(file, `${kind} id "${id}" is not kebab-case`);
    const prev = this.seen.get(id);
    if (prev) error(file, `${kind} id "${id}" duplicates ${prev}`);
    else this.seen.set(id, `${kind} "${id}"`);
  }
  has(id: string) {
    return this.seen.has(id);
  }
}

/* ------------------------------------------------------------------ */
/* Topic                                                               */
/* ------------------------------------------------------------------ */

function validateTopic(dir: string): void {
  const slug = basename(dir);
  const topicFile = join(dir, 'topic.yaml');
  if (!existsSync(topicFile)) {
    error(dir, 'missing topic.yaml');
    return;
  }

  const rawTopic = readYaml(topicFile, readFileSync(topicFile, 'utf8'));
  if (rawTopic === undefined) return;
  checkBilingual(topicFile, rawTopic);
  const parsedTopic = topicSchema.safeParse(rawTopic);
  if (!parsedTopic.success) {
    reportZod(topicFile, parsedTopic.error);
    return;
  }
  const topic: TopicMeta = parsedTopic.data;
  if (topic.id !== slug) error(topicFile, `id "${topic.id}" must equal the folder name "${slug}"`);
  if (topic.cover && !existsSync(resolve(dir, topic.cover))) error(topicFile, `cover file not found: ${topic.cover}`);

  const ids = new IdRegistry(topicFile);
  ids.add(topic.id, 'topic');
  const schemas = engineSchemas(topic.engine, topic.stage);

  /* ---- data ---- */
  const dataDir = join(dir, 'data');
  const raw: Record<string, unknown> = {};
  if (isDir(dataDir)) {
    for (const name of readdirSync(dataDir).sort()) {
      const file = join(dataDir, name);
      if (!name.endsWith('.json')) {
        if (!name.startsWith('.') && name !== 'SOURCES.md') warn(file, 'non-JSON file in data/ is ignored');
        continue;
      }
      const value = readJson(file);
      if (value === undefined) continue;
      checkBilingual(file, value);
      raw[name.replace(/\.json$/, '')] = value;
    }
  }
  for (const required of schemas.requiredFiles) {
    if (!(required in raw)) error(join(dataDir, `${required}.json`), `required by ${topic.engine}/${topic.stage} but missing`);
  }

  let data: unknown;
  const parsedData = schemas.data.safeParse(raw);
  if (parsedData.success) {
    data = parsedData.data;
    for (const { kind, id } of schemas.ids(data)) ids.add(id, kind, dataDir);
  } else {
    reportZod(dataDir, parsedData.error, 'data.');
  }
  // Ids chapter bodies may cite / fly to (null: the topic has no sources.json).
  const sourcesFile = data !== undefined ? (data as { sources?: SourcesFile }).sources : undefined;
  const sources = sourcesFile ? sourceIds(sourcesFile) : 'sources' in raw ? new Set<string>() : null;
  const presets = new Set(data !== undefined ? schemas.presetIds(data) : []);
  const glossaryFile = data !== undefined ? (data as { glossary?: GlossaryFile }).glossary : undefined;
  const terms = glossaryFile ? glossaryIds(glossaryFile) : 'glossary' in raw ? new Set<string>() : null;

  /* ---- chapters ---- */
  const chaptersDir = join(dir, 'chapters');
  if (!isDir(chaptersDir)) {
    error(dir, 'missing chapters/ directory');
    return;
  }
  const files = readdirSync(chaptersDir).filter((f) => f.endsWith('.mdx')).sort();
  if (files.length === 0) error(chaptersDir, 'topic has no chapters');
  for (const other of readdirSync(chaptersDir)) {
    if (!other.endsWith('.mdx') && !other.startsWith('.')) warn(join(chaptersDir, other), 'only .mdx chapters are loaded');
  }

  const orders = new Map<number, string>();
  let background: string | null = null;
  for (const name of files) {
    const file = join(chaptersDir, name);
    const text = readFileSync(file, 'utf8');
    const match = FRONTMATTER.exec(text);
    if (!match) {
      error(file, 'missing YAML frontmatter (--- … ---)');
      continue;
    }
    const front = readYaml(file, match[1] ?? '');
    if (front === undefined) continue;
    checkBilingual(file, front);
    checkLangBlocks(file, match[2] ?? '');
    // Only when the data parsed: otherwise the data errors already explain missing ids.
    if (data !== undefined) checkBodyComponents(file, match[2] ?? '', sources, presets, terms);

    const parsed = chapterSchema.safeParse(front);
    if (!parsed.success) {
      reportZod(file, parsed.error);
      continue;
    }
    const chapter = parsed.data;
    ids.add(chapter.id, 'chapter', file);

    const prev = orders.get(chapter.order);
    if (prev) error(file, `order ${chapter.order} duplicates ${prev}`);
    else orders.set(chapter.order, name);

    if (chapter.kind === 'background') {
      if (chapter.order !== 0) error(file, `the background chapter must have order 0 (has ${chapter.order})`);
      if (background) error(file, `only one background chapter per topic (${background} is one already)`);
      else background = name;
    } else if ((chapter.state as { note?: unknown }).note !== undefined) {
      error(file, 'state.note (the reading note) belongs on the background chapter (kind: background)');
    }

    const expected = new RegExp(`^\\d+-${chapter.id}\\.mdx$`);
    if (!expected.test(name)) warn(file, `file name should be <nn>-${chapter.id}.mdx`);

    const state = schemas.chapterState.safeParse(chapter.state);
    if (!state.success) {
      reportZod(file, state.error, 'state.');
    } else if (data !== undefined) {
      for (const ref of schemas.chapterRefs(state.data)) {
        if (!ids.has(ref)) error(file, `state references unknown id "${ref}"`);
      }
      for (const issue of schemas.chapterIssues?.(state.data, data) ?? []) error(file, issue);
    }
  }
}

/* ------------------------------------------------------------------ */
/* UI dictionaries                                                     */
/* ------------------------------------------------------------------ */

function validateUiStrings(): void {
  const enFile = join(ROOT, 'src/i18n/ui.en.json');
  const zhFile = join(ROOT, 'src/i18n/ui.zh.json');
  const en = readJson(enFile) as Record<string, string> | undefined;
  const zh = readJson(zhFile) as Record<string, string> | undefined;
  if (!en || !zh) return;
  for (const key of Object.keys(en)) {
    if (!(key in zh)) warn(zhFile, `missing UI string "${key}"`);
    else if (!String(zh[key]).trim()) warn(zhFile, `empty UI string "${key}"`);
  }
  for (const key of Object.keys(zh)) if (!(key in en)) error(enFile, `missing UI string "${key}" (present in zh)`);
}

/* ------------------------------------------------------------------ */
/* Main                                                                */
/* ------------------------------------------------------------------ */

function main(): void {
  const topics = isDir(TOPICS_DIR)
    ? readdirSync(TOPICS_DIR)
        .map((name) => join(TOPICS_DIR, name))
        .filter(isDir)
    : [];

  validateUiStrings();
  for (const dir of topics) validateTopic(dir);

  const tty = process.stdout.isTTY;
  const paint = (code: number, s: string) => (tty ? `\x1b[${code}m${s}\x1b[0m` : s);
  const errors = issues.filter((i) => i.level === 'error');
  const warnings = issues.filter((i) => i.level === 'warn');

  for (const issue of [...errors, ...warnings]) {
    const tag = issue.level === 'error' ? paint(31, 'error') : paint(33, 'warn ');
    console.log(`${tag} ${paint(2, issue.file)}  ${issue.message}`);
  }
  const summary = `validate-content: ${topics.length} topic(s), ${errors.length} error(s), ${warnings.length} warning(s)`;
  console.log(errors.length ? paint(31, summary) : paint(32, summary));
  process.exitCode = errors.length ? 1 : 0;
}

main();
