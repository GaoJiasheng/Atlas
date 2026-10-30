import { portSourceIssues } from '../src/engines/space-scene/port-schema';
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
 *   - `<TopicLink slug="…">` names a topic folder; `ch="…"` a chapter of it (so
 *     does a SpaceScene life-cycle ring card's `sim.lifeCycle.card.compare.link`)
 *   - `<FlyTo preset="…">` names a preset (TimeScene data/presets.json, SpaceScene
 *     parts.json `presets`); `<More>` has a title
 *   - data/glossary.json: term ids unique, `see` refs exist; every `<Term id="…">`
 *     in a chapter body names a listed term
 *   - at most one `kind: background` chapter, with `order: 0`; `state.note`
 *     only on the background chapter
 *   - MathScene (docs/15 §4.10, §10): chapters and steps one-to-one, the practice
 *     chapter, 3–5 drawable explanation beats and a check pool of 8–10 per step,
 *     syllabus / source refs, denominators and sums, targets, planned feedback,
 *     prompt length, `{a/b}` tokens; `<Task id>` names a step (its check) or a
 *     pool task, `<Beat n>` a beat of the chapter's step, `<Time t as>` / `<Dur d>` parse as
 *     the `{t:…}` / `{d:…}` tokens, and `<Frac n d>` has
 *     whole numbers (d ≥ 1)
 *   - referenced files (cover) exist
 *   - TimeScene basemap (docs/06 "TimeScene"): `basemap.local` / `basemap.region`
 *     files exist under public/geo/ (the plate's land holds `kind: land`, its
 *     rivers parse as dated river lines); `colorBy: entity`: every holder has a
 *     colour and no two neighbouring holders share one (warnings)
 *   - SpaceScene glb (`model`, scripts/lib/glb-check.ts): exists under public/,
 *     ≤ 8 MB, `asset.copyright` set, every part `mesh` and rig `node` in its
 *     node table (an error, not a warning)
 *   - shared fitness data (src/content/shared/fitness, docs/16 §4): every file
 *     parses, ids unique across files, muscle ↔ exercise links, `M#` sources,
 *     exercise drawings exist; merged into each topic that uses it
 *     (`withSharedFitness`) and checked there (part `muscle`, training.json,
 *     motion joints in the rig, chapter `exercise` / `sites` / `highlight`)
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
import { sensesSourceIssues } from '../src/engines/space-scene/senses-schema';
import { sourceIds, type SourcesFile } from '../src/content/schema/sources';
import { airfoilSourceIssues } from '../src/engines/space-scene/airfoil-schema';
import { foodWebSourceIssues } from '../src/engines/space-scene/food-web-schema';
import { tableSourceIssues } from '../src/engines/space-scene/table-schema';
import { glossaryIds, type GlossaryFile } from '../src/content/schema/glossary';
import { engineSchemas, formatIssues } from '../src/engines/schemas';
import { timeChapterLayerIssues, timeSceneTopicIssues, type TimeChapterState, type TimeSceneGeoData } from '../src/engines/time-scene/schema';
import { loadDeepTime } from '../src/engines/time-scene/deep-time-build';
import {
  exercisesFile,
  musclesFile,
  sharedFitnessIssues,
  withSharedFitness,
  type FitnessBundle,
  type SharedFitnessParsed,
  type SharedFitnessRaw,
} from '../src/content/schema/fitness';
import { sharedSourcesFile } from '../src/content/schema/sources';
import { glbIssues, glbNodeNames } from './lib/glb-check';
import { readSharedFitness } from './lib/shared-data';
import { badTokens } from '../src/lib/rich-text';
import { matterWarnings } from '../src/engines/space-scene/matter-schema';
import type { PartsFile } from '../src/engines/space-scene/schema';
import { bareQuantities } from '../src/engines/math-scene/validate-measure';
import { monthlyResourceIssues } from './lib/monthly-resources';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
// ATLAS_TOPICS_DIR lets tests / tooling validate another tree.
const TOPICS_DIR = process.env.ATLAS_TOPICS_DIR ? resolve(process.env.ATLAS_TOPICS_DIR) : join(ROOT, 'src/content/topics');
// ATLAS_SHARED_DIR: another shared-data tree (tests); the site's public/ for glb and drawings.
const SHARED_DIR = process.env.ATLAS_SHARED_DIR ? resolve(process.env.ATLAS_SHARED_DIR) : join(ROOT, 'src/content/shared');
const PUBLIC_DIR = join(ROOT, 'public');

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

const chapterIds = new Map<string, Set<string>>();
/** Chapter ids of a topic folder (the `id:` of each chapter's frontmatter), for `<TopicLink ch>`. */
function chapterIdsOf(slug: string): Set<string> {
  let ids = chapterIds.get(slug);
  if (ids) return ids;
  ids = new Set();
  const dir = join(TOPICS_DIR, slug, 'chapters');
  if (isDir(dir))
    for (const name of readdirSync(dir).filter((f) => f.endsWith('.mdx'))) {
      const front = /^---\r?\n([\s\S]*?)\r?\n---/.exec(readFileSync(join(dir, name), 'utf8'))?.[1] ?? '';
      // YAML (`id: x`) or JSON frontmatter (`"id": "x"`, as in singapore-1819-1965).
      const id = /^(?:id|\s*"id")\s*:\s*["']?([^"'\s#,]+)/m.exec(front)?.[1];
      if (id) ids.add(id);
    }
  chapterIds.set(slug, ids);
  return ids;
}

/** `<Frac n={3} d={4} />` attributes (string or `{number}`). */
function fracAttrs(raw: string): Record<string, number | null> {
  const out: Record<string, number | null> = {};
  for (const m of raw.matchAll(/\b([ndw])\s*=\s*(?:"([^"]*)"|'([^']*)'|\{\s*([^}]*?)\s*\})/g)) {
    const v = m[2] ?? m[3] ?? m[4] ?? '';
    out[m[1]!] = /^\d+$/.test(v) ? Number(v) : null;
  }
  return out;
}

/** `<Num s>`, `<FlyTo preset>`, `<More title>`, `<Term id>`, `<Task id>`, `<Beat n>`, `<Figure src alt caption>` and `<Frac>` in a chapter body. */
function checkBodyComponents(
  file: string,
  body: string,
  sources: Set<string> | null,
  presets: Set<string>,
  terms: Set<string> | null,
  tasks: Set<string> | null,
  beats: number | null,
  measuring = false,
  events: Set<string> | null = null,
): void {
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
    if (attrs.event !== undefined && !events?.has(attrs.event))
      error(file, `<FlyTo event="${attrs.event}">: unknown event (not in this TimeScene topic's data/events.json)`);
  }
  for (const { raw, attrs } of tagAttrs(body, 'TopicLink')) {
    const slug = attrs.slug;
    if (!slug) error(file, `<TopicLink> needs a slug, e.g. <TopicLink slug="four-taps">: ${raw}`);
    else if (!isDir(join(TOPICS_DIR, slug))) error(file, `<TopicLink slug="${slug}">: no such topic`);
    else if (attrs.ch !== undefined && !chapterIdsOf(slug).has(attrs.ch))
      error(file, `<TopicLink slug="${slug}" ch="${attrs.ch}">: topic "${slug}" has no chapter "${attrs.ch}"`);
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
  for (const { raw, attrs } of tagAttrs(body, 'Task')) {
    const id = attrs.id;
    if (!id) error(file, `<Task> needs an id, e.g. <Task id="fold-strip-quarters">: ${raw}`);
    else if (!tasks) error(file, `<Task id="${id}">: this engine has no lesson sub-steps`);
    else if (!tasks.has(id)) error(file, `<Task id="${id}">: unknown step or check task (not in data/lesson.json)`);
  }
  for (const m of body.matchAll(/<Beat(?![A-Za-z])([^>]*)>/g)) {
    const n = /\bn\s*=\s*(?:"(\d+)"|\{\s*(\d+)\s*\})/.exec(m[1] ?? '');
    const k = n ? Number(n[1] ?? n[2]) : null;
    if (k === null) error(file, `<Beat> needs a beat number, e.g. <Beat n={2}>: ${m[0]}`);
    else if (beats === null) error(file, `<Beat n={${k}}>: this chapter has no explanation beats (lesson.json steps[].beats)`);
    else if (k < 1 || k > beats) error(file, `<Beat n={${k}}>: the chapter has beats 1–${beats}`);
  }
  for (const { raw, attrs } of tagAttrs(body, 'Figure')) {
    const stem = attrs.src;
    if (!stem) error(file, `<Figure> needs src="<stem under public/illustrations/>", e.g. src="figures/b200-rack": ${raw}`);
    else
      if (!existsSync(join(ROOT, 'public/illustrations', `${stem}.webp`)))
        error(file, `<Figure src="${stem}">: public/illustrations/${stem}.webp not found`);
    if (!/\balt=/.test(raw)) error(file, `<Figure> needs alt={{ en: "…", zh: "…" }}: ${raw}`);
    if (!/\bcaption=/.test(raw)) error(file, `<Figure> needs caption={{ en: "…", zh: "…" }}: ${raw}`);
  }
  for (const m of body.matchAll(/<Frac(?![A-Za-z])([^>]*)>/g)) {
    const a = fracAttrs(m[1] ?? '');
    if (a.n == null || a.d == null || a.d < 1 || (('w' in a) && a.w == null)) error(file, `<Frac> needs whole numbers n and d (d ≥ 1), e.g. <Frac n={3} d={4} />: ${m[0]}`);
  }
  // `<Time>` and `<Dur>` write what the `{t:…}` / `{d:…}` tokens write: the same values must parse.
  for (const { raw, attrs } of tagAttrs(body, 'Time')) {
    if (attrs.as !== undefined && !['24', 'face', 'ampm'].includes(attrs.as)) error(file, `<Time as>: "24", "face" or "ampm" (12-hour by default): ${raw}`);
    else if (!attrs.t || badTokens(`{t:${attrs.t}${attrs.as ? `|${attrs.as}` : ''}}`).length) error(file, `<Time> needs a 24-hour time t="HH:MM" (face: hours 1–12), e.g. <Time t="09:40" />: ${raw}`);
  }
  for (const { raw, attrs } of tagAttrs(body, 'Dur')) {
    if (!attrs.d || badTokens(`{d:${attrs.d}}`).length) error(file, `<Dur> needs a duration d like "1h35m", "95m" or "75s": ${raw}`);
  }
  // `<Qty>` writes what `{u:…}` writes; a lesson on reading instruments writes every quantity so (docs/32 M8).
  for (const { raw, attrs } of tagAttrs(body, 'Qty')) {
    if (!attrs.u || badTokens(`{u:${attrs.u}}`).length) error(file, `<Qty> needs a quantity u like "9 cm", "1.5 l" or "2 m 35 cm": ${raw}`);
  }
  if (measuring) {
    const prose = body.replace(/<[^>]*>/g, ' ').replace(/^---[\s\S]*?---/, '');
    for (const bare of bareQuantities(prose)) error(file, `"${bare}" is a quantity written as text: write <Qty u="${bare.replace(/(\d)(?=[a-zℓ])/, '$1 ')}" />`);
  }
}

/** MathScene: a lesson on reading instruments (a beat draws one), whose chapter bodies write quantities with `<Qty>` (docs/32 M8). */
function drawsInstruments(data: unknown): boolean {
  const steps = (data as { lesson?: { steps?: { beats?: { model?: { kind?: string } }[] }[] } }).lesson?.steps;
  return !!steps?.some((x) => x.beats?.some((b) => b.model?.kind === 'instrument'));
}

/** MathScene: the explanation beats of a chapter's step (`<Beat n>`), `null` when the chapter has none. */
function lessonBeats(data: unknown, chapter: unknown): number | null {
  const steps = (data as { lesson?: { steps?: { id: string; beats?: unknown[] }[] } }).lesson?.steps;
  const step = steps?.find((x) => x.id === chapter);
  return step?.beats ? step.beats.length : null;
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
/* Shared data (src/content/shared/fitness, docs/16 §4)                */
/* ------------------------------------------------------------------ */

/** Parse every shared file and check the references between them. */
function validateSharedFitness(raw: SharedFitnessRaw): void {
  const dir = join(SHARED_DIR, 'fitness');
  const tree: SharedFitnessParsed = { muscles: new Map(), exercises: new Map(), sources: [] };
  for (const [stem, value] of Object.entries(raw.muscles)) {
    const file = join(dir, 'muscles', `${stem}.json`);
    checkBilingual(file, value);
    const parsed = musclesFile.safeParse(value);
    if (parsed.success) tree.muscles.set(stem, parsed.data);
    else reportZod(file, parsed.error);
  }
  for (const [stem, value] of Object.entries(raw.exercises)) {
    const file = join(dir, 'exercises', `${stem}.json`);
    checkBilingual(file, value);
    const parsed = exercisesFile.safeParse(value);
    if (parsed.success) {
      tree.exercises.set(stem, parsed.data);
      for (const e of parsed.data.exercises) {
        if (!e.sketch) continue;
        const img = join(PUBLIC_DIR, 'illustrations/exercises', `${e.sketch}.webp`);
        if (!existsSync(img)) error(file, `${e.id}: sketch file not found: ${relative(ROOT, img)}`);
      }
    } else reportZod(file, parsed.error);
  }
  if (raw.sources !== undefined) {
    const file = join(dir, 'sources.json');
    checkBilingual(file, raw.sources);
    const parsed = sharedSourcesFile.safeParse(raw.sources);
    if (parsed.success) tree.sources = parsed.data.sources;
    else reportZod(file, parsed.error);
  }
  for (const issue of sharedFitnessIssues(tree)) (issue.level === 'error' ? error : warn)(join(dir, issue.where.split(' ')[0]!), issue.where.split(' ').slice(1).join(' ') + ': ' + issue.message);
}

/* ------------------------------------------------------------------ */
/* Topic                                                               */
/* ------------------------------------------------------------------ */

async function validateTopic(dir: string, shared: SharedFitnessRaw): Promise<void> {
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
  if (topic.basemap?.reconstruction) for (const id of ['base', 'fossils-modern']) ids.add(id, 'reconstruction layer');
  for (const layer of topic.datedLayers ?? []) ids.add(layer.id, 'dated layer');
  for (const layer of topic.monthlyLayers ?? []) ids.add(layer.id, 'monthly layer');
  const schemas = engineSchemas(topic.engine, topic.stage, topic.temporalMode);

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
  if (topic.basemap?.reconstruction) {
    try { Object.assign(raw, loadDeepTime(topic, raw, (stem) => { const f = join(PUBLIC_DIR, 'geo', `${stem}.json`); return existsSync(f) ? readJson(f) : undefined; })); }
    catch (e) { error(topicFile, String(e)); return; }
  }
  if (topic.maDigits !== undefined && (typeof (raw.control as { keyframes?: { t?: unknown }[] } | undefined)?.keyframes?.[0]?.t !== 'object')) error(topicFile, 'maDigits requires geological Ma control frames');
  const parsedData = schemas.data.safeParse(withSharedFitness(raw, shared));
  if (parsedData.success) {
    data = parsedData.data;
    for (const { kind, id } of schemas.ids(data)) ids.add(id, kind, dataDir);
  } else {
    reportZod(dataDir, parsedData.error, 'data.');
  }
  // Ids chapter bodies may cite / fly to (null: the topic has no sources.json and uses no shared data).
  const sourcesFile = data !== undefined ? (data as { sources?: SourcesFile }).sources : undefined;
  const fitness = data !== undefined ? (data as { fitness?: FitnessBundle }).fitness : undefined;
  const sources =
    sourcesFile || fitness
      ? new Set([...sourceIds(sourcesFile), ...(fitness?.sources ?? []).map((x) => x.id)])
      : 'sources' in raw
        ? new Set<string>()
        : null;
  // A glb model: present, within budget, licensed, and holding every node the parts and rig name.
  const model = data !== undefined ? (data as { parts?: { model?: string } }).parts?.model : undefined;
  if (model !== undefined && data !== undefined) {
    const file = (data as { parts: PartsLike }).parts;
    const nodes = [
      ...file.parts.flatMap((p) => (p.mesh ? [{ node: p.mesh, what: `part "${p.id}" mesh` }] : [])),
      ...Object.entries(file.rig?.joints ?? {}).map(([name, j]) => ({ node: j.node, what: `rig joint "${name}"` })),
    ];
    for (const message of await glbIssues(join(PUBLIC_DIR, model), nodes)) error(join(dataDir, 'parts.json'), `model ${model}: ${message}`);
    // The wire figure of exercise mode (docs/06 动作模式数据手册): asked for on a skinned skin part, its low-poly node should be in the glb.
    const skin = file.parts.some((p) => p.context === true && p.mesh !== undefined && !p.mesh.startsWith('skin-hand'));
    if (file.views?.exerciseBody === 'wire' && skin && !(await glbNodeNames(join(PUBLIC_DIR, model))).has('skin-wire'))
      warn(join(dataDir, 'parts.json'), `views.exerciseBody "wire": model ${model} has no "skin-wire" node, so the engine decimates the skin outline at load (slower, rougher)`);
  }
  const matterFile = topic.engine === 'space-scene' && data ? (data as { parts?: PartsFile }).parts : undefined;
  if (matterFile?.sim?.port) for (const issue of portSourceIssues(matterFile.sim.port, new Map((sourcesFile?.sources ?? []).map((x) => [x.id, x])))) error(join(dataDir, 'parts.json'), `sim.port.${issue.path.join('.')}: ${issue.message}`);
  // A table model's rows (docs/40 §4.2): every source listed, SIM rows citing the design study, TYPICAL rows another source.
  for (const [i, overlay] of (matterFile?.sim?.overlays ?? []).entries()) if (overlay.kind === 'sound-echo-pulse') for (const id of overlay.sources) if (!sources?.has(id)) error(join(dataDir,'parts.json'), `sim.overlays.${i}.sources: unknown source ${id}`);
  if (matterFile?.sim?.senses) for (const issue of sensesSourceIssues(matterFile.sim.senses, sources ?? new Set())) error(join(dataDir, 'parts.json'), `sim.senses.${issue.path.join('.')}: ${issue.message}`);
  if (matterFile?.sim?.airfoil) for (const issue of airfoilSourceIssues(matterFile.sim.airfoil, new Map((sourcesFile?.sources ?? []).map(x => [x.id, x])))) error(join(dataDir, 'parts.json'), `sim.airfoil.${issue.path.join('.')}: ${issue.message}`);
  if (matterFile?.sim?.table)
    for (const issue of tableSourceIssues(matterFile.sim.table, matterFile.sim.outputs, new Map((sourcesFile?.sources ?? []).map((x) => [x.id, x]))))
      error(join(dataDir, 'parts.json'), `sim.${issue.path.join('.')}: ${issue.message}`);
  if (matterFile?.sim?.foodWeb)
    for (const issue of foodWebSourceIssues(matterFile.sim.foodWeb, sources ?? new Set()))
      error(join(dataDir, 'parts.json'), `sim.foodWeb.${issue.path.join('.')}: ${issue.message}`);
  if (matterFile?.sim?.matter) for (const issue of matterWarnings(matterFile.sim.matter, new Map(matterFile.sim.controls.map((c) => [c.id, c])))) warn(join(dataDir, 'parts.json'), `sim.matter.${issue.path.join('.')}: ${issue.message}`);
  // The life-cycle ring card's second ring links to another topic (docs/33 §4.3): checked like `<TopicLink slug ch>`.
  const cycleLink = data !== undefined ? (data as { parts?: { sim?: { lifeCycle?: { card?: { compare?: { link?: { topic: string; chapter?: string } } } } } } }).parts?.sim?.lifeCycle?.card?.compare?.link : undefined;
  if (cycleLink) {
    const where = join(dataDir, 'parts.json');
    if (!isDir(join(TOPICS_DIR, cycleLink.topic))) error(where, `sim.lifeCycle.card.compare.link: no topic "${cycleLink.topic}"`);
    else if (cycleLink.chapter !== undefined && !chapterIdsOf(cycleLink.topic).has(cycleLink.chapter))
      error(where, `sim.lifeCycle.card.compare.link: topic "${cycleLink.topic}" has no chapter "${cycleLink.chapter}"`);
  }
  if (data !== undefined && topic.engine === 'time-scene' && topic.stage === 'geo') {
    const readGeo = (name: string) => {
      const file = join(PUBLIC_DIR, 'geo', `${name}.json`);
      return existsSync(file) ? readJson(file) : undefined;
    };
    for (const issue of timeSceneTopicIssues(topic, data as TimeSceneGeoData, readGeo)) {
      const file = issue.file.startsWith('public/') ? join(ROOT, issue.file) : join(dir, issue.file);
      (issue.level === 'error' ? error : warn)(file, issue.message);
    }
    if(topic.temporalMode==='geography' && topic.geography){
      for(const m of (data as {geography:{members:{id:string;joined:string}[]}}).geography.members)if(m.joined>topic.geography.asOf)error(join(dataDir,'geography.json'),`${m.id}: joined after geography.asOf`);
    }
    for (const issue of monthlyResourceIssues(topic, sources ?? new Set(), readGeo))
      error(issue.file.startsWith('public/') ? join(ROOT, issue.file) : join(dir, issue.file), issue.message);
  }
  const presets = new Set(data !== undefined ? schemas.presetIds(data) : []);
  const eventIds = data !== undefined && topic.engine === 'time-scene'
    ? new Set((data as { events: { id: string }[] }).events.map((event) => event.id))
    : null;
  const glossaryFile = data !== undefined ? (data as { glossary?: GlossaryFile }).glossary : undefined;
  const terms = glossaryFile ? glossaryIds(glossaryFile) : 'glossary' in raw ? new Set<string>() : null;
  const tasks = data !== undefined && schemas.taskIds ? new Set(schemas.taskIds(data)) : null;
  const chapterInfos: { id: string; order: number; kind?: 'chapter' | 'background'; state: unknown }[] = [];

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
    if (data !== undefined) checkBodyComponents(file, match[2] ?? '', sources, presets, terms, tasks, lessonBeats(data, (front as { id?: unknown }).id), drawsInstruments(data), eventIds);

    const parsed = chapterSchema.safeParse(front);
    if (!parsed.success) {
      reportZod(file, parsed.error);
      continue;
    }
    const chapter = parsed.data;
    chapterInfos.push({ id: chapter.id, order: chapter.order, kind: chapter.kind, state: chapter.state });
    ids.add(chapter.id, 'chapter', file);
    if (topic.basemap?.reconstruction || topic.maDigits !== undefined) {
      const st = chapter.state as TimeChapterState;
      for (const when of [st.time, ...(st.beats ?? []).map((b) => b.t)])
        if (when !== undefined && typeof when !== 'object') error(file, 'geological TimeScene requires Ma in every chapter and beat');
      if (topic.basemap?.reconstruction) {
        const objects = new Set([...(data as TimeSceneGeoData).deepTime?.points ?? [], ...(data as TimeSceneGeoData).deepTime?.cards ?? []].map((p) => p.id));
        for (const id of [...st.index ?? [], ...st.highlight ?? [], ...(st.beats ?? []).flatMap((b) => b.highlight ?? [])]) if (!objects.has(id)) error(file, `deep-time object reference not found: ${id}`);
        for (const layer of [...st.layers ?? [], ...(st.beats ?? []).flatMap((b) => b.layers ?? [])]) if (layer !== 'fossils-modern' && layer !== 'base') error(file, `reconstruction has no layer ${layer}`);
      }
    }

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
      if(topic.temporalMode==='geography' && topic.geography){const gs=state.data as {geoContext:{kind:string;date?:string};beats:{geoContext:{kind:string;date?:string}}[]};for(const ctx of [gs.geoContext,...gs.beats.map(b=>b.geoContext)]){if(ctx.kind==='climatology'&&(!topic.climatology||!topic.monthlyLayers?.length))error(file,'climatology context requires monthly layers and metadata');if(ctx.kind==='membership'&&(ctx.date!<topic.geography.dateRange[0]||ctx.date!>topic.geography.dateRange[1]))error(file,'geoContext membership date outside geography.dateRange');}}
      for (const ref of schemas.chapterRefs(state.data)) {
        if (!ids.has(ref)) error(file, `state references unknown id "${ref}"`);
      }
      for (const issue of schemas.chapterIssues?.(state.data, data) ?? []) error(file, issue);
      if (topic.engine === 'time-scene' && topic.stage === 'geo')
        for (const issue of timeChapterLayerIssues(state.data as TimeChapterState, [...(topic.datedLayers ?? []), ...(topic.monthlyLayers ?? []), ...((data as {geography?: {layers:{id:string}[]}})?.geography?.layers ?? []), ...(topic.temporalMode==='geography'?[{id:'geo-countries'},{id:'geo-membership'},{id:'geo-anchors'}]:[])])) error(file, issue);
    }
  }
  if (data !== undefined) {
    for (const issue of schemas.topicIssues?.(chapterInfos, data) ?? []) (issue.level === 'error' ? error : warn)(dataDir, issue.message);
  }
}

/* ------------------------------------------------------------------ */
/* UI dictionaries                                                     */
/* ------------------------------------------------------------------ */

interface PartsLike {
  parts: { id: string; mesh?: string; context?: boolean }[];
  rig?: { joints: Record<string, { node: string }> };
  views?: { exerciseBody?: string };
}

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

async function main(): Promise<void> {
  const topics = isDir(TOPICS_DIR)
    ? readdirSync(TOPICS_DIR)
        .map((name) => join(TOPICS_DIR, name))
        .filter(isDir)
    : [];

  validateUiStrings();
  const shared = readSharedFitness(SHARED_DIR, error);
  validateSharedFitness(shared);
  for (const dir of topics) await validateTopic(dir, shared);

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

await main();
