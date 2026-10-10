/**
 * Build-time registry of engine schemas. Used by the topic page (to parse
 * `data/*.json` before handing it to the client) and by the content validator.
 * Never import this from client code: it pulls in zod.
 */
import type { z } from 'zod';
import type { EngineId } from '../content/schema/topic';
import {
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

export function engineSchemas(engine: EngineId, stage: string): EngineSchemaSet {
  switch (engine) {
    case 'time-scene':
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
export function parseEngineData(engine: EngineId, stage: string, raw: Record<string, unknown>, label: string): unknown {
  const result = engineSchemas(engine, stage).data.safeParse(raw);
  if (!result.success) {
    throw new Error(`Invalid engine data for ${label}:\n  ${formatIssues(result.error).join('\n  ')}`);
  }
  return result.data;
}
