/**
 * Scaffold a topic.
 *
 * "Timeline + map" (docs/10, skill .claude/skills/atlas-history-topic):
 *
 *   pnpm tsx scripts/new-topic.ts <slug> --engine time-scene --subject history \
 *     --title-en "The Cold War" --title-zh "冷战" [--subtitle-en "1947–1991" --subtitle-zh "1947–1991"] \
 *     [--start 1947-03-12 --end 1991-12-26]
 *
 * "Space" (SpaceScene, docs/06 "SpaceScene"):
 *
 *   pnpm tsx scripts/new-topic.ts <slug> --engine space-scene --subject science \
 *     --title-en "How a bicycle works" --title-zh "自行车是怎么工作的" [--subtitle-en "…" --subtitle-zh "…"]
 *
 * space-scene creates, and refuses to overwrite:
 *   src/content/topics/<slug>/topic.yaml                 status: draft, mode: space, stage: model3d
 *   src/content/topics/<slug>/chapters/01-chapter-one.mdx full SpaceScene frontmatter (state with camera and labels, summary)
 *   src/content/topics/<slug>/data/parts.json            one primitive part in one group, no flows or animations, views (assembled camera, cover, section)
 *   src/content/topics/<slug>/data/{sources,glossary}.json
 *
 * time-scene creates, and refuses to overwrite:
 *   src/content/topics/<slug>/topic.yaml                 status: draft
 *   src/content/topics/<slug>/chapters/00-background.mdx  kind: background, reading note
 *   src/content/topics/<slug>/chapters/01-chapter-one.mdx full TimeScene frontmatter (state, summary, beats)
 *   src/content/topics/<slug>/data/{entities,control,movements,events,presets,sources,glossary}.json
 *   src/content/topics/<slug>/data/SOURCES.md            with the generated-sources block
 *   scripts/geo/<slug>/sources.json, SOURCES-GEO.md       geo pipeline manifest and provenance log
 *
 * The data files are minimal and valid (no entities, one empty control
 * keyframe at --start): `pnpm validate` passes right away. Nothing geographic
 * is invented: control areas come from the geo pipeline (scripts/geo/lib).
 * Prints the next steps. Both are valid as written: `pnpm validate` passes right away.
 */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { KEBAB_ID, ISO_DATE } from '../src/content/schema/common';
import { SUBJECTS } from '../src/content/schema/topic';
import { BEGIN, END } from './sources-md';

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
  console.error('       pnpm tsx scripts/new-topic.ts <slug> --engine space-scene --subject science --title-en "…" --title-zh "…" [--subtitle-en "…" --subtitle-zh "…"]');
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
for (const dir of engine === 'space-scene' ? [topicDir] : [topicDir, geoDir]) if (existsSync(dir)) fail(`${relative(ROOT, dir)} already exists`);

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

function scaffoldSpace(): void {
  const part = `${slug}-body`;
  const group = `${slug}-main`;
  write(
    join(topicDir, 'topic.yaml'),
    `# ${titleEn}. Content spec first (docs/05 briefing playbook; docs/12 is the aircon example).
id: ${slug}
title: { en: ${q(titleEn)}, zh: ${q(titleZh)} }
subtitle: { en: ${q(subtitleEn)}, zh: ${q(subtitleZh)} }
subject: ${subject}
mode: space
engine: space-scene
stage: model3d
theme: paper
sensitivity: open
status: draft
# The title block's statement line, e.g. for a generic design study:
# note: { en: "Generic design study · not a specific brand or model", zh: "通用设计研究 · 不代表任何品牌或型号" }
`,
  );

  write(
    join(topicDir, 'chapters/01-chapter-one.mdx'),
    `---
id: chapter-one
order: 1
title: { en: "Chapter one", zh: "第一章" }
state:
  view: assembled          # assembled | xray | exploded | isolate
  explode: 0
  part: null
  run: false
  cutaway: none
  layers: [${group}]
  hide: []
  labels: [${part}]        # 3–6 part ids (or "group:<id>") with a leader label at this camera
  camera: { position: [2.4, 1.6, 3.2], target: [0, 0.3, 0], fov: 30 }
  summary:
    en: "One sentence: what this chapter shows and why it matters."
    zh: "一句话：这一章展示什么、为什么重要。"
  # PRESENTATION beats (optional; without them the chapter is one beat captioned with the summary):
  # beats:
  #   - part: ${part}
  #     labels: [${part}]
  #     caption: { en: "What the stage shows at this step.", zh: "这一步舞台上显示的是什么。" }
---

<Lang en>

The chapter text: what the reader sees on the stage and how it works, in 150–250 words.

</Lang>

<Lang zh>

本章正文：舞台上看到的是什么、怎样工作，300–450 字。

</Lang>
`,
  );

  const data = join(topicDir, 'data');
  write(
    join(data, 'parts.json'),
    json({
      parts: [
        {
          id: part,
          name: { en: 'Body', zh: '机身' },
          group,
          summary: { en: 'One line: what this part does.', zh: '一句话：这个零件做什么。' },
          detail: { en: 'A few sentences about the part.', zh: '关于这个零件的几句话。' },
          primitive: { kind: 'bevelBox', size: [1.2, 0.6, 0.6], bevel: 0.03, at: [0, 0.3, 0], color: 'enamel' },
          explode: { dir: [0, 1, 0], dist: 0.4 },
        },
      ],
      groups: [{ id: group, name: { en: 'Main unit', zh: '主机' }, color: 'token:neutral' }],
      flows: [],
      animations: [],
      views: {
        assembled: { camera: { position: [2.4, 1.6, 3.2], target: [0, 0.3, 0], fov: 30 } },
        cover: { position: [2.0, 1.3, 2.7], target: [0, 0.3, 0], fov: 30 },
        section: { plane: 'xy' },
      },
    }),
  );
  write(join(data, 'sources.json'), json({ sources: [] }));
  write(join(data, 'glossary.json'), json({ terms: [] }));

  console.log(`new-topic: created ${slug}\n  ${written.join('\n  ')}\n`);
  console.log(`Next steps (docs/06 "SpaceScene", docs/08 technical plate):
  1. Write the content spec (parts, groups, flows, chapters, sources) and get it signed off.
  2. Model the parts in data/parts.json (primitives or a glb), then groups, flows, animations, views and presets.
  3. Chapters: state (view, labels, camera) per chapter, then the text, then beats.
  4. The topic is a draft: reachable at /en/topics/${slug}/ but not listed on the index until status: published.
  5. pnpm validate && pnpm build && pnpm shoot ${slug} --keys --layout --beats (chapter highlights: none).`);
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
