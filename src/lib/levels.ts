/** Singapore primary levels. Client-safe (no zod). */
export const LEVELS = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'] as const;
export type Level = (typeof LEVELS)[number];

export function levelIndex(level: Level): number {
  return LEVELS.indexOf(level);
}

/** `true` when content for `contentLevel` is beyond the reader's `readerLevel`. */
export function isAboveLevel(contentLevel: Level, readerLevel: Level): boolean {
  return levelIndex(contentLevel) > levelIndex(readerLevel);
}
