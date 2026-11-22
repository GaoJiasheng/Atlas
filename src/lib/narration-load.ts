/**
 * The recorded-narration runtime (`lib/narration.ts`) is not first-screen
 * code: it loads when a presentation starts. `narratorNow()` is for the one
 * caller that must stay synchronous (priming playback inside the Voice click).
 */
import type { Narrator } from './narration';

let ready: Narrator | null = null;
let pending: Promise<Narrator> | null = null;

export const loadNarrator = (): Promise<Narrator> => (pending ??= import('./narration').then((m) => (ready = m.narrator())));

/** The narrator if it has loaded, else `null`. */
export const narratorNow = (): Narrator | null => ready;
