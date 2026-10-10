/**
 * Scaffold a topic.
 *
 * "Timeline + map" (docs/10, skill .claude/skills/atlas-history-topic):
 *
 *   pnpm tsx scripts/new-topic.ts <slug> --engine time-scene --subject history \
 *     --title-en "The Cold War" --title-zh "冷战" [--subtitle-en "1947–1991" --subtitle-zh "1947–1991"] \
 *     [--start 1947-03-12 --end 1991-12-26]
 *
 * "Object anatomy" (SpaceScene; docs/13, skill .claude/skills/atlas-space-topic):
 *
 *   pnpm tsx scripts/new-topic.ts <slug> --engine space-scene --subject science|biology \
 *     --title-en "How a bicycle works" --title-zh "自行车是怎么工作的" [--subtitle-en "…" --subtitle-zh "…"]
 *
 * space-scene creates, and refuses to overwrite:
 *   src/content/topics/<slug>/topic.yaml                 status: draft, mode: space, stage: model3d, note examples
 *   src/content/topics/<slug>/chapters/01-chapter-one.mdx full SpaceScene state (view … camera, hide, labels with a group label),
 *                                                        summary, two beats (one on a named preset), Num / FlyTo / More in the text
 *   src/content/topics/<slug>/data/parts.json            one part per group (shell casing with `extra` feet; lathe core) plus a
 *                                                        context part, a flow-only group with one flow (stops, spread, clip, parts),
 *                                                        one animation, views (assembled, exploded, cutaway, section, cover),
 *                                                        three presets, spec rows and telemetry
 *   src/content/topics/<slug>/data/sources.json          S1 = the self-describing design-study source
 *   src/content/topics/<slug>/data/{glossary.json,SOURCES.md}
 *   scripts/geo/<slug>/refs/.gitignore                   reference images stay local
 *
 * time-scene creates, and refuses to overwrite:
 *   src/content/topics/<slug>/topic.yaml                 status: draft
 *   src/content/topics/<slug>/chapters/00-background.mdx  kind: background, reading note
 *   src/content/topics/<slug>/chapters/01-chapter-one.mdx full TimeScene frontmatter (state, summary, beats)
 *   src/content/topics/<slug>/data/{entities,control,movements,events,presets,sources,glossary}.json
 *   src/content/topics/<slug>/data/SOURCES.md            with the generated-sources block
 *   scripts/geo/<slug>/sources.json, SOURCES-GEO.md       geo pipeline manifest and provenance log
 *
 * The time-scene data files are minimal (no entities, one empty control
 * keyframe at --start). Nothing geographic is invented: control areas come
 * from the geo pipeline (scripts/geo/lib). Both skeletons are valid as
 * written (`pnpm validate` passes right away); both print the next steps.
 */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { KEBAB_ID, ISO_DATE } from '../src/content/schema/common';
import { SUBJECTS } from '../src/content/schema/topic';
import { BEGIN, END, sourcesBlock } from './sources-md';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    engine: { type: 'string', default: 'time-scene' },
    subject: { type: 'string' },
    'title-en': { type: 'string' },
    'title-zh': { type: 'string' },
    'subtitle-en': { type: 'string' },
    'subtitle-zh': { type: 'string' },
    start: { type: 'string', default: '1900-01-01' },
    end: { type: 'string', default: '1900-12-31' },
  },
});

function fail(message: string): never {
  console.error(`new-topic: ${message}`);
  console.error('usage: pnpm tsx scripts/new-topic.ts <slug> --engine time-scene --subject history --title-en "…" --title-zh "…" [--start YYYY-MM-DD --end YYYY-MM-DD]');
  console.error('       pnpm tsx scripts/new-topic.ts <slug> --engine space-scene --subject science|biology --title-en "…" --title-zh "…" [--subtitle-en "…" --subtitle-zh "…"]');
  process.exit(1);
}

const slug = positionals[0] ?? fail('missing <slug>');
if (!KEBAB_ID.test(slug)) fail(`slug "${slug}" must be kebab-case`);
const engine = values.engine;
if (engine !== 'time-scene' && engine !== 'space-scene') fail(`--engine must be time-scene or space-scene (got "${engine}")`);
const subject = values.subject ?? (engine === 'space-scene' ? 'science' : 'history');
if (!(SUBJECTS as readonly string[]).includes(subject)) fail(`--subject must be one of ${SUBJECTS.join(', ')}`);
const titleEn = values['title-en']?.trim() || fail('missing --title-en');
const titleZh = values['title-zh']?.trim() || fail('missing --title-zh');
const subtitleEn =
  values['subtitle-en']?.trim() || (engine === 'space-scene' ? 'What is inside and how it works' : `${values.start!.slice(0, 4)}–${values.end!.slice(0, 4)}`);
const subtitleZh = values['subtitle-zh']?.trim() || (engine === 'space-scene' && !values['subtitle-en'] ? '里面有什么、怎样工作' : subtitleEn);
const start = values.start!;
const end = values.end!;
for (const [flag, date] of [['--start', start], ['--end', end]] as const) {
  if (!ISO_DATE.test(date)) fail(`${flag} must be an ISO date (YYYY, YYYY-MM or YYYY-MM-DD)`);
}
if (end <= start) fail('--end must be after --start');

const topicDir = join(ROOT, 'src/content/topics', slug);
const geoDir = join(ROOT, 'scripts/geo', slug);
/** Reference images for modelling a space topic (photos, patent drawings): local only, gitignored. */
const refsDir = join(geoDir, 'refs');
for (const dir of engine === 'space-scene' ? [topicDir, refsDir] : [topicDir, geoDir]) if (existsSync(dir)) fail(`${relative(ROOT, dir)} already exists`);

/** YAML / JSON string literal. */
const q = (s: string) => JSON.stringify(s);
const json = (value: unknown) => `${JSON.stringify(value, null, 2)}\n`;
const written: string[] = [];
function write(file: string, text: string): void {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, text);
  written.push(relative(ROOT, file));
}

/* ------------------------------------------------------------------ */
/* SpaceScene                                                          */
/* ------------------------------------------------------------------ */

/** Ids the space skeleton uses; ids are unique across a topic (the topic id included). */
const SPACE_IDS = ['chapter-one', 'housing', 'mechanism', 'stream', 'casing', 'core', 'plinth', 'stream-main', 'core-spin', 'hero', 'close-up', 'front-section'];

function scaffoldSpace(): void {
  if (SPACE_IDS.includes(slug)) fail(`slug "${slug}" clashes with an id of the space skeleton (${SPACE_IDS.join(', ')})`);
  write(
    join(topicDir, 'topic.yaml'),
    `# ${titleEn}. Content spec first: skill atlas-space-topic, references/spec-template.md (docs/12 is the aircon example).
id: ${slug}
title: { en: ${q(titleEn)}, zh: ${q(titleZh)} }
subtitle: { en: ${q(subtitleEn)}, zh: ${q(subtitleZh)} }
subject: ${subject}
moe: []
mode: space
engine: space-scene
stage: model3d
theme: paper
sensitivity: open
status: draft
# The title block's statement line (replaces "Educational visualization"). A generic machine:
# note: { en: "Generic design study · not a specific brand or model", zh: "通用设计研究 · 不代表任何品牌或型号" }
# An organism:
# note: { en: "Model study · schematic proportions · not a specific specimen", zh: "模型研究 · 示意比例 · 不对应具体标本" }
`,
  );

  /* The hero camera is shared by the chapter, the assembled view and the `hero` preset. */
  const hero = { position: [2.4, 1.5, 3.2], target: [0, 0.33, 0], fov: 30 };
  const cam = (c: { position: number[]; target: number[]; fov: number }) =>
    `{ position: [${c.position.join(', ')}], target: [${c.target.join(', ')}], fov: ${c.fov} }`;

  write(
    join(topicDir, 'chapters/01-chapter-one.mdx'),
    `---
id: chapter-one
order: 1
title: { en: "Chapter one", zh: "第一章" }
sensitive: false
# Chapter targets accumulate (write only what changes from the previous chapter); hide and labels do not.
state:
  view: assembled          # assembled | xray | exploded | isolate
  explode: 0               # 0..1, used by the exploded view
  part: null               # selected part id, or null
  run: false               # true = animations and flows play
  cutaway: none            # none | half (plane: views.cutaway in parts.json)
  layers: [housing, mechanism, stream]   # visible groups
  hide: []                 # parts slid aside in this chapter (casing panels, to show the inside)
  labels: [casing, "group:mechanism"]    # 3–6 part ids or group:<id>, visible at this camera
  camera: ${cam(hero)}
  summary:
    en: "One sentence: what this chapter shows and why it matters."
    zh: "一句话：这一章展示什么、为什么重要。"
  # PRESENTATION beats, 3–5 per chapter: each = this chapter's state + the fields it sets
  # (view, part, explode, run, cutaway, layers, camera, labels ≤ 6, hide, caption, audio).
  # camera may name a preset from parts.json. The caption says what the model shows now.
  beats:
    - caption:
        en: "What the whole object looks like, and its main parts."
        zh: "整体是什么样子，主要有哪几部分。"
    - camera: close-up
      view: xray
      run: true
      part: core
      labels: [core, casing]
      caption:
        en: "What the stage shows at this step: the core turns inside the see-through casing."
        zh: "这一步舞台上显示的是什么：透明外壳里，核心在转动。"
---

<Lang en>

The chapter text: 200–300 words in 3–5 paragraphs, what the reader sees on the stage first, then how it works. Every quantity carries its source, like the design value <Num s="S1">1.2 m</Num>; glossary words are wrapped in Term the first time they appear. <FlyTo preset="close-up">Look closer</FlyTo>

<More title={{ en: "A closer look", zh: "细看" }}>

Numbers at the simulated operating point, how the model differs from the real thing, a common misconception.

</More>

</Lang>

<Lang zh>

本章正文：350–500 字、3–5 段，先讲舞台上看到什么，再讲它怎样工作。每个数量都标来源，例如设计值 <Num s="S1">1.2 米</Num>；名词第一次出现时用 Term 标出。<FlyTo preset="close-up">靠近看</FlyTo>

<More title={{ en: "A closer look", zh: "细看" }}>

模拟运行点的数字、模型与真实对象的差别、一个常见误解。

</More>

</Lang>
`,
  );

  const data = join(topicDir, 'data');
  write(
    join(data, 'parts.json'),
    json({
      parts: [
        {
          id: 'casing',
          name: { en: 'Casing', zh: '外壳' },
          group: 'housing',
          summary: { en: 'One line: what this part does.', zh: '一句话：这个零件做什么。' },
          detail: {
            en: 'What it does; how it does it; a typical figure with its source [S1].\n\nWhat happens if it fails or gets dirty.',
            zh: '它做什么；怎样做到；一个带来源的典型数字 [S1]。\n\n坏了或脏了会怎样。',
          },
          primitive: { kind: 'bevelBox', size: [1.2, 0.6, 0.6], bevel: 0.02, at: [0, 0.33, 0], color: 'enamel' },
          extra: [
            { kind: 'bevelBox', size: [0.1, 0.03, 0.5], bevel: 0.008, at: [-0.45, 0.015, 0], color: 'rubber' },
            { kind: 'bevelBox', size: [0.1, 0.03, 0.5], bevel: 0.008, at: [0.45, 0.015, 0], color: 'rubber' },
          ],
          explode: { dir: [0, 1, 0], dist: 0.5 },
          connects: ['core'],
          shell: true,
        },
        {
          id: 'core',
          name: { en: 'Core', zh: '核心' },
          group: 'mechanism',
          summary: { en: 'One line: what this part does.', zh: '一句话：这个零件做什么。' },
          detail: {
            en: 'What it does; how it does it; a typical figure with its source [S1].\n\nWhat happens if it fails or gets dirty.',
            zh: '它做什么；怎样做到；一个带来源的典型数字 [S1]。\n\n坏了或脏了会怎样。',
          },
          primitive: {
            kind: 'lathe',
            profile: [[0, -0.4], [0.16, -0.4], [0.18, -0.38], [0.18, 0.38], [0.16, 0.4], [0.03, 0.4], [0.03, 0.75], [0, 0.75]],
            segments: 48,
            at: [0, 0.33, 0],
            rotation: [0, 0, 90],
            color: 'steel',
          },
          explode: { dir: [0, 0, 1], dist: 0.4 },
          connects: ['casing'],
        },
        {
          id: 'plinth',
          name: { en: 'Plinth', zh: '展台' },
          summary: { en: 'Scenery: what the object stands on.', zh: '场景：对象所在的位置。' },
          detail: { en: 'Context only: drawn, never labelled, selected or exploded.', zh: '只是场景：画出来，但不标注、不可选、不拆开。' },
          context: true,
          primitive: { kind: 'box', size: [1.6, 0.04, 0.9], at: [0, -0.02, 0], color: 'plastic' },
        },
      ],
      groups: [
        { id: 'housing', name: { en: 'Housing', zh: '外壳' }, color: 'token:ink-3' },
        { id: 'mechanism', name: { en: 'Mechanism', zh: '机构' }, color: 'token:neutral' },
        { id: 'stream', name: { en: 'Air stream', zh: '气流' }, color: 'token:cold' },
      ],
      flows: [
        {
          id: 'stream-main',
          group: 'stream',
          path: [
            [-0.95, 0.45, 0],
            [-0.6, 0.56, 0],
            [0.6, 0.56, 0],
            [0.95, 0.45, 0],
          ],
          speed: 0.4,
          color: 'token:cold',
          stops: [
            { at: 0, color: 'token:neutral' },
            { at: 1, color: 'token:cold' },
          ],
          ends: 'fade',
          count: 360,
          size: 1,
          spread: [0.02, 0.02, 0.15],
          clip: false,
          parts: ['casing', 'core'],
        },
      ],
      animations: [{ id: 'core-spin', target: 'core', kind: 'rotate', axis: [1, 0, 0], rpm: 30 }],
      views: {
        assembled: { camera: hero },
        exploded: { camera: { position: [2.8, 1.9, 3.8], target: [0, 0.45, 0], fov: 30 } },
        cutaway: { normal: [0, 0, -1], offset: 0 },
        section: { plane: 'xy' },
        cover: { position: [2.0, 1.25, 2.7], target: [0, 0.33, 0], fov: 30 },
      },
      spec: [
        { key: { en: 'Size', zh: '外形尺寸' }, value: '1.2 × 0.6 × 0.6 m', tag: 'design' },
        { key: { en: 'Speed', zh: '转速' }, value: '1,200 rpm', tag: 'design' },
      ],
      telemetry: [
        { key: { en: 'Speed', zh: '转速' }, unit: 'rpm', idle: 0, run: 1200, lag: 4, decimals: 0 },
        { key: { en: 'Power', zh: '功率' }, unit: 'kW', idle: 0, run: 0.5, lag: 4, decimals: 2 },
      ],
      presets: [
        { id: 'hero', label: { en: 'Hero', zh: '全景' }, camera: hero },
        { id: 'close-up', label: { en: 'Close-up', zh: '近景' }, camera: { position: [1.3, 0.95, 1.9], target: [-0.05, 0.33, 0], fov: 30 }, view: 'xray' },
        { id: 'front-section', label: { en: 'Section', zh: '剖面' }, camera: { position: [0, 0.35, 3.4], target: [0, 0.33, 0], fov: 28 } },
      ],
    }),
  );
  const designStudy = {
    id: 'S1',
    text: {
      en: `Atlas design study for this topic (generic, no brand, model or specimen; docs/NN §1.2). Design values: overall size 1.2 × 0.6 × 0.6 m, speed 1,200 rpm. Simulated operating point: inputs and results.`,
      zh: `本主题的 Atlas 设计研究（通用对象，不对应任何品牌、型号或标本；docs/NN §1.2）。设计值：外形 1.2 × 0.6 × 0.6 m，转速 1,200 rpm。模拟运行点：输入与结果。`,
    },
    note: {
      en: 'Not a measurement. Each design value sits inside the typical range of the sources listed here; inputs and arithmetic are in the notes of those sources.',
      zh: '不是实测值。每个设计值都落在这里所列来源的典型范围内；输入数据与算法写在那些来源的说明里。',
    },
  };
  write(join(data, 'sources.json'), json({ sources: [designStudy] }));
  write(join(data, 'glossary.json'), json({ terms: [] }));
  write(
    join(data, 'SOURCES.md'),
    `# ${titleEn} — sources

Rules: skill atlas-space-topic (references/writing-rules.md) and skill industrial-3d-showcase references/fact-discipline.md. Numbers in chapter bodies are \`<Num s="S#">\`; part details cite \`[S#]\`. Design values and the simulated operating point are their own entry (the design study), with the arithmetic in the notes; they are not measurements. Reference images used for modelling are listed in the content spec, not here (they are not published).

## Numbered sources

${sourcesBlock([designStudy])}
`,
  );
  write(join(refsDir, '.gitignore'), '*\n!.gitignore\n');

  console.log(`new-topic: created ${slug}\n  ${written.join('\n  ')}\n`);
  console.log(`Next steps (skill .claude/skills/atlas-space-topic, references/build-order.md):
  0. Spec: copy references/spec-template.md to docs/NN-${slug}-content-spec.md, fill it in, get it signed off before writing text.
  1. References first: photos, patent drawings, diagrams (CC / public domain) into scripts/geo/${slug}/refs/ (gitignored); list each in the spec.
  2. E  engine gaps from the spec (Opus): schema + stage + unit tests + docs/06, before the data needs them.
  3. D  geometry (Opus): replace the skeleton parts in data/parts.json (references/modelling-runbook.md), then
       R2 geometry side by side with the references (two rounds, clash check) -> R3 materials and light -> R4 flows and animations;
       pnpm build && pnpm shoot ${slug} --perf after each round, and look at the shots.
  4. T  facts and texts (Opus): sources.json (keep S1 as the self-describing design study, fill docs/NN in its text), glossary.json,
       part summary / detail, chapter text (references/writing-rules.md); pnpm tsx scripts/sources-md.ts ${slug}.
  5. B  beats (Sonnet): 3–5 per chapter, captions say what the model shows now; pnpm shoot ${slug} --beats.
  6. P  polish and audit (Sonnet): references/acceptance.md.
  7. The topic is a draft: reachable at /en/topics/${slug}/ but not listed on the index until status: published.
  Gates every step: pnpm check && pnpm validate && pnpm test && pnpm build && pnpm e2e; pnpm shoot ${slug} --keys --layout --beats.`);
}

/* ------------------------------------------------------------------ */
/* TimeScene                                                           */
/* ------------------------------------------------------------------ */

function scaffoldTime(): void {
  /* ------------------------------------------------------------------ */
  /* Topic                                                               */
  /* ------------------------------------------------------------------ */

  write(
    join(topicDir, 'topic.yaml'),
    `# ${titleEn}. Content spec: write it first (skill atlas-history-topic, references/spec-template.md).
id: ${slug}
title: { en: ${q(titleEn)}, zh: ${q(titleZh)} }
subtitle: { en: ${q(subtitleEn)}, zh: ${q(subtitleZh)} }
subject: ${subject}
mode: time
engine: time-scene
stage: geo
theme: paper
sensitivity: open
status: draft
# TimeScene blocs are axis / allied / neutral; rename them for this war (docs/06 blocLabels), e.g.
# blocLabels:
#   axis: { en: "Central Powers", zh: "同盟国" }
#   allied: { en: "Allies (Entente)", zh: "协约国" }
`,
  );

  write(
    join(topicDir, 'chapters/00-background.mdx'),
    `---
# Background chapter (prologue): no timeline node, no number (doc id 00, the rail says "Background").
# Keep order: 0 and kind: background. The map shows the first control keyframe unless state.time is set;
# the reading panel opens on first entry; PRESENTATION plays its beats (default: one, the summary) first.
id: background
order: 0
kind: background
title: { en: "Background", zh: "背景" }
sensitive: false
state:
  camera: { center: [20, 25], zoom: 1.6 }
  layers: [base, control]
  summary:
    en: "One sentence: what a reader needs to know before chapter 01."
    zh: "一句话：读第 01 章之前需要知道什么。"
  # The reading note: a hairline box at the top of this chapter's text ("How this topic is written").
  note:
    en: "Whose perspectives the topic follows, how numbers are sourced and rounded, and where the map comes from."
    zh: "本主题从哪些视角讲述、数字怎样标注来源和取整、地图来自哪里。"
---

<Lang en>

The background: the situation before chapter 01, the sides and the places, in 150–250 words. Mark glossary words with Term, numbers with Num.

</Lang>

<Lang zh>

背景：第 01 章之前的局势、各方和地点，300–450 字。名词用 Term 标出，数字用 Num 标来源。

</Lang>
`,
  );

  write(
    join(topicDir, 'chapters/01-chapter-one.mdx'),
    `---
id: chapter-one
order: 1
title: { en: "Chapter one", zh: "第一章" }
sensitive: false
state:
  time: ${q(end)}                     # the chapter's date (day precision); chapters must be in time order
  camera: { center: [20, 25], zoom: 2.2 }
  layers: [base, control, movements, battles]
  # highlight: [event-id, movement-id]   # ids from data/*.json; each gets a leader label
  summary:
    en: "One sentence: what happened in this chapter and why it matters."
    zh: "一句话：这一章发生了什么、为什么重要。"
  # PRESENTATION beats, 3–5 per chapter. Each beat = this chapter's state + the fields it sets;
  # the caption says what the map shows at that moment, with its date.
  beats:
    - t: ${q(start)}
      # camera: { center: [lng, lat], zoom: 4 }
      # highlight: [event-id]
      caption:
        en: "Date: what the map shows at this step."
        zh: "日期：这一步地图上显示的是什么。"
    - t: ${q(end)}
      caption:
        en: "Date: what the map shows at the end of the chapter."
        zh: "日期：本章结束时地图上显示的是什么。"
---

<Lang en>

The chapter text: 200–300 words in 3–5 paragraphs, what happened first, then why and what followed.

<More title={{ en: "A closer look", zh: "细看" }}>

People, numbers, disputes, links to other theatres.

</More>

</Lang>

<Lang zh>

本章正文：350–500 字、3–5 段，先讲发生了什么，再讲原因和后果。

<More title={{ en: "A closer look", zh: "细看" }}>

人物、数字、争议、与其他战场或地区的联系。

</More>

</Lang>
`,
  );

  /* ------------------------------------------------------------------ */
  /* Data                                                                */
  /* ------------------------------------------------------------------ */

  const data = join(topicDir, 'data');
  write(join(data, 'entities.json'), json([]));
  write(join(data, 'control.json'), json({ keyframes: [{ t: start, features: { type: 'FeatureCollection', features: [] } }] }));
  write(join(data, 'movements.json'), json([]));
  write(join(data, 'events.json'), json([]));
  write(join(data, 'presets.json'), json({ presets: [] }));
  write(join(data, 'sources.json'), json({ sources: [] }));
  write(join(data, 'glossary.json'), json({ terms: [] }));
  write(
    join(data, 'SOURCES.md'),
    `# ${titleEn} — sources

Rules: skill atlas-history-topic (references/writing-rules.md for numbers, references/geo-runbook.md for maps). Numbered facts are \`[S#]\`, generated below from \`sources.json\` by \`pnpm tsx scripts/sources-md.ts ${slug}\`; map geometry is \`[G#]\`. Survey, georeferencing residuals and rebuild commands: \`scripts/geo/${slug}/SOURCES-GEO.md\`.

## Map data

One line per dataset or map: **[G#]** title, author, URL, **licence**, what it is used for.

## Control keyframes

| K | date | method | sources | control-point residual | checked |
|---|---|---|---|---|---|

## Movement routes

| movement | route (waypoints) | map / text source | strength source |
|---|---|---|---|

## Numbered sources

${BEGIN}
${END}
`,
  );

  /* ------------------------------------------------------------------ */
  /* Geo pipeline manifest                                               */
  /* ------------------------------------------------------------------ */

  write(
    join(geoDir, 'sources.json'),
    json({
      _comment:
        'Placeholders to edit: pipeline.plannedKeyframes (how many control keyframes the spec lists) and pipeline.focus (boxes [w,s,e,n] the chapters zoom into; the default is Europe). Datasets, ohm sets, svg/raster maps and keyframes are filled in step by step (skill atlas-history-topic, references/geo-runbook.md).',
      datasets: {
        cshapes: {
          ref: 'G1',
          title: 'CShapes 2.0 (GW version), borders of independent states and dependent territories 1886-2019',
          url: 'https://icr.ethz.ch/data/cshapes/CShapes-2.0.geojson',
          file: 'cshapes-2.0.geojson',
          page: 'https://icr.ethz.ch/data/cshapes/',
          author: 'Schvitz, Rüegger, Girardin, Cederman, Weidmann, Gleditsch (ETH Zürich ICR), 2022',
          license: 'CC BY-NC-SA 4.0',
          role: 'sovereign and colonial base borders on each keyframe date',
        },
      },
      ohm: {},
      svg: {},
      raster: {},
      keyframes: [],
      pipeline: {
        plannedKeyframes: 8, // EDIT: number of keyframes in the spec
        focus: [[-12, 28, 62, 72]], // EDIT: fine-simplification boxes [w, s, e, n]
        coast: { detailBox: null, detailLand: null },
      },
    }),
  );
  write(
    join(geoDir, 'SOURCES-GEO.md'),
    `# ${titleEn} map data — source survey and per-keyframe provenance

Every edge in \`src/content/topics/${slug}/data/control.json\` comes from a dataset below; nothing is drawn by hand. Reference ids \`[G#]\` are the same as in the topic's \`data/SOURCES.md\`. Commands: \`pnpm tsx scripts/geo/lib/<step>.ts --topic ${slug}\` (skill atlas-history-topic, references/geo-runbook.md).

## 1. Survey

Per dataset or map: URL, citation, **exact licence** (quoted from its page), coverage, limits for this topic, what it is used for.

## 2. Keyframes

Per keyframe: date, recipe (base + steps), sources, georeferencing model and control-point residuals (RMS / max, km), the side-by-side check image, known simplifications.

## 3. Licences

Attribution and share-alike obligations of each source used in the published data.
`,
  );

  console.log(`new-topic: created ${slug}\n  ${written.join('\n  ')}\n`);
  console.log(`Next steps (skill .claude/skills/atlas-history-topic, references/build-order.md):
  1. Write the content spec (references/spec-template.md) and get it signed off before writing chapters.
  2. Set --start / --end dates in the chapter files, the control keyframe and topic.yaml subtitle if they were not given.
  3. Geo: edit pipeline.plannedKeyframes and pipeline.focus in scripts/geo/${slug}/sources.json, add datasets and keyframes, then
       pnpm tsx scripts/geo/lib/fetch.ts --topic ${slug}
       pnpm tsx scripts/geo/lib/ohm-export.ts --topic ${slug} --list <YYYY-MM-DD> --levels 1-3   # which OpenHistoricalMap relations are valid that day
       pnpm tsx scripts/geo/lib/ohm-export.ts --topic ${slug}                                    # export the relation sets named in sources.json
       pnpm tsx scripts/geo/lib/georef-svg.ts --topic ${slug}                                    # Commons SVG maps: control points, fit, residuals (--fills / --dots / --propose help)
       pnpm tsx scripts/geo/lib/georef-raster.ts --topic ${slug}                                 # PNG / JPG maps, same idea
       pnpm tsx scripts/geo/lib/compose.ts --topic ${slug}
       pnpm tsx scripts/geo/lib/simplify.ts --topic ${slug} --fine 1.5                           # --fine while only some keyframes exist; automatic search only with all of them
       pnpm tsx scripts/geo/lib/check.ts --topic ${slug}
     (first and last keyframe first; log every source in SOURCES-GEO.md and data/SOURCES.md).
  4. Data: entities.json, events.json, movements.json, presets.json, sources.json, glossary.json (references/data-cookbook.md).
  5. Chapters: the background chapter and two template chapters first, then the rest in batches; beats last.
  6. Blocs: if the war is not WW2, set blocLabels in topic.yaml (axis / allied are only engine slots).
  7. The topic is a draft: reachable at /en/topics/${slug}/ but not listed on the index until status: published.
  8. pnpm validate && pnpm build && pnpm shoot ${slug} --keys --layout --beats; acceptance: references/acceptance.md.`);
}

if (engine === 'space-scene') scaffoldSpace();
else scaffoldTime();
