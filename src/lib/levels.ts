/** Singapore primary levels. Content-planning metadata only (client-safe, no zod); never rendered. */
export const LEVELS = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'] as const;
export type Level = (typeof LEVELS)[number];
