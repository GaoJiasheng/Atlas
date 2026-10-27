import { geographyData, geographyChapterState, type GeographyData, type GeographyChapterState } from './time-scene/geography-schema';
import { geographyObjects, climateCell } from './time-scene/lib/geography';
/**
 * Build-time registry of engine schemas. Used by the topic page (to parse
 * `data/*.json` before handing it to the client) and by the content validator.
 * Never import this from client code: it pulls in zod.
 */
import type { z } from 'zod';
import type { EngineId } from '../content/schema/topic';
import {
  climatologyGeoData, climatologyChapterState,
  type ClimatologyGeoData, type ClimatologyChapterState,
  timeChapterRefs,
  timeChapterState,
  timeSceneDiagramData,
  timeSceneGeoData,
  timeSceneIds,
  timeScenePresetIds,
  type TimeChapterState,
  type TimeSceneGeoData,
} from './time-scene/schema';
import {
  spaceChapterIssues,
  spaceChapterState,
  spacePresetIds,
  spaceSceneData,
  spaceSceneIds,
  type SpaceChapterState,
  type SpaceSceneData,
} from './space-scene/schema';
import { simulationChapterState, simulationData } from './simulation/schema';
import { mathChapterState, mathSceneData, mathSceneIds, type MathSceneData } from './math-scene/schema';
import { lessonIssues, lessonTaskIds, type ChapterInfo, type LessonIssue } from './math-scene/validate';

export interface EngineSchemaSet {
  /** Schema for the object `{ [fileBaseName]: json }` built from `data/*.json`. */
  data: z.ZodTypeAny;
  /** Schema for a chapter's `state` frontmatter. */
  chapterState: z.ZodTypeAny;
  /** Data files the engine expects (base names, no extension). */
  requiredFiles: readonly string[];
  /** All ids declared in the data (for topic-wide uniqueness checks). */
  ids(data: unknown): { kind: string; id: string }[];
  /** Ids a chapter state refers to (must exist in the data). */
  chapterRefs(state: unknown): string[];
  /** Engine-specific reference problems of a chapter state against the parsed data (one message each; optional). */
  chapterIssues?(state: unknown, data: unknown): string[];
  /** Camera preset ids a chapter body may name in `<FlyTo preset>` (engines without presets: none). */
  presetIds(data: unknown): string[];
  /** Sub-step ids a chapter body may name in `<Task id>` (MathScene); omitted = the engine has none. */
  taskIds?(data: unknown): string[];
  /** Rules over the whole topic: data against every chapter (MathScene: chapters ↔ steps, docs/15 §4.10); optional. */
  topicIssues?(chapters: readonly ChapterInfo[], data: unknown): LessonIssue[];
}

export function engineSchemas(engine: EngineId, stage: string, temporalMode?: 'chronological' | 'climatology' | 'geography'): EngineSchemaSet {
  switch (engine) {
    case 'time-scene':
      if (temporalMode === 'geography') return {
        data:geographyData,chapterState:geographyChapterState,requiredFiles:['geography'],
        ids:(raw)=>{const d=raw as GeographyData;return [...geographyObjects(d.geography).map(o=>({kind:'geography object',id:o.id})),...d.geography.layers.map(l=>({kind:'geography layer',id:l.id})),...(d.presets?.presets??[]).map(p=>({kind:'preset',id:p.id}))]},
        chapterRefs:(raw)=>{const s=raw as GeographyChapterState;return [...(s.index??[]),...(s.highlight??[]),s.selection,...s.beats.flatMap(b=>[...(b.highlight??[]),b.selection])].filter((id):id is string=>!!id&&!climateCell(id))},
        chapterIssues:(raw,d)=>{const s=raw as GeographyChapterState;const ids=new Set(geographyObjects((d as GeographyData).geography).map(o=>o.id));return [...new Set([...(s.highlight??[]),s.selection,...s.beats.flatMap(b=>[...(b.highlight??[]),b.selection])])].filter((id):id is string=>!!id&&ids.has(id)&&!s.index.includes(id)).map(id=>`geography object ${id} must appear in state.index`)},
        presetIds:(raw)=>((raw as GeographyData).presets?.presets??[]).map(p=>p.id),
      };
      if (temporalMode === 'climatology') return {
        data: climatologyGeoData, chapterState: climatologyChapterState,
        requiredFiles: ['entities', 'control', 'movements', 'events'],
        ids: (raw) => { const d = raw as ClimatologyGeoData; return [...d.events.map((e) => ({kind: 'site', id: e.id})), ...(d.presets?.presets ?? []).map((p) => ({kind: 'preset', id:p.id}))]; },
        chapterRefs: (raw) => { const s = raw as ClimatologyChapterState; return [...(s.highlight ?? []), ...(s.index ?? []), ...(s.beats ?? []).flatMap((b) => b.highlight ?? [])]; },
        chapterIssues: (raw, data) => { const s = raw as ClimatologyChapterState; const sites = new Set((data as ClimatologyGeoData).events.map((e) => e.id)); const issues = (s.index ?? []).filter((id) => !sites.has(id)).map((id) => `state.index: unknown site "${id}"`); const listed = new Set(s.index ?? []); for (const id of new Set([...(s.highlight ?? []), ...(s.beats ?? []).flatMap((b) => b.highlight ?? [])])) if (sites.has(id) && !listed.has(id)) issues.push(`highlighted site "${id}" must appear in state.index`); return issues; },
        presetIds: (raw) => ((raw as ClimatologyGeoData).presets?.presets ?? []).map((p) => p.id),
      };
      if (stage === 'diagram') {
        return {
          data: timeSceneDiagramData,
          chapterState: timeChapterState,
          requiredFiles: [],
          ids: () => [],
          chapterRefs: () => [],
          presetIds: () => [],
        };
      }
      return {
        data: timeSceneGeoData,
        chapterState: timeChapterState,
        requiredFiles: ['entities', 'control', 'movements', 'events'],
        ids: (d) => timeSceneIds(d as TimeSceneGeoData),
        chapterRefs: (s) => timeChapterRefs(s as TimeChapterState),
        presetIds: (d) => timeScenePresetIds(d as TimeSceneGeoData),
      };
    case 'space-scene':
      return {
        data: spaceSceneData,
        chapterState: spaceChapterState,
        requiredFiles: ['parts'],
        ids: (d) => spaceSceneIds(d as SpaceSceneData),
        chapterRefs: () => [],
        chapterIssues: (s, d) => spaceChapterIssues(s as SpaceChapterState, d as SpaceSceneData),
        presetIds: (d) => spacePresetIds(d as SpaceSceneData),
      };
    case 'math-scene':
      return {
        data: mathSceneData,
        chapterState: mathChapterState,
        requiredFiles: ['lesson'],
        ids: (d) => mathSceneIds(d as MathSceneData),
        chapterRefs: () => [],
        presetIds: () => [],
        taskIds: (d) => lessonTaskIds(d as MathSceneData),
        topicIssues: (chapters, d) => lessonIssues(d as MathSceneData, chapters),
      };
    case 'simulation':
      return {
        data: simulationData,
        chapterState: simulationChapterState,
        requiredFiles: [],
        ids: () => [],
        chapterRefs: () => [],
        presetIds: () => [],
      };
  }
}

/** Format zod issues as `path: message` lines. */
export function formatIssues(error: z.ZodError, prefix = ''): string[] {
  return error.issues.map((issue) => {
    const path = issue.path.length ? issue.path.join('.') : '(root)';
    return `${prefix}${path}: ${issue.message}`;
  });
}

/**
 * Parse raw engine data at build time. Throws with a readable message so
 * `astro build` fails loudly on bad content.
 */
export function parseEngineData(engine: EngineId, stage: string, raw: Record<string, unknown>, label: string, temporalMode?: 'chronological' | 'climatology' | 'geography'): unknown {
  const result = engineSchemas(engine, stage, temporalMode).data.safeParse(raw);
  if (!result.success) {
    throw new Error(`Invalid engine data for ${label}:\n  ${formatIssues(result.error).join('\n  ')}`);
  }
  return result.data;
}

/** The page and CLI validator select the same topic-aware chapter branch. */
export function validateEngineChapterState(engine: EngineId, stage: string, raw: unknown, label: string, temporalMode?: 'chronological' | 'climatology' | 'geography'): void {
  const result = engineSchemas(engine, stage, temporalMode).chapterState.safeParse(raw);
  if (!result.success) throw new Error(`Invalid engine chapter state for ${label}:\n  ${formatIssues(result.error).join('\n  ')}`);
}
