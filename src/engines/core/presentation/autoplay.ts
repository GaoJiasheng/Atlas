/**
 * Presentation timing and the two session switches (docs/06 "演示系统（core）"):
 * when a beat counts as settled, how long auto-play dwells on a caption, the
 * fallback when a spoken caption's `end` never comes, and the AUTO-PLAY /
 * VOICE switches remembered in sessionStorage. Pure apart from the storage
 * and timer helpers.
 */

/** A beat's camera flight (TimeScene FLY_MS 2.2 s) and caption fade-in end about here; auto-play and voice count from then. */
export const BEAT_SETTLE_MS = 2300;

/** Auto-play dwell on a caption that is neither spoken nor has a clip: 4 s + 60 ms per character, within 6–20 s. */
export const autoplayDwell = (chars: number): number => Math.min(20_000, Math.max(6_000, 4_000 + 60 * chars));

/** Breath between the end of the narration and the next beat (ms). */
export const AFTER_SPEECH_MS = 600;

/**
 * Auto-play's fallback when the narration's `end` is lost: 3× the expected
 * speaking time (12 characters a second, at least 6 s), plus 3 s per part
 * before the caption (chapter number, title).
 */
export const lostEndFallback = (chars: number, parts: number): number => Math.max(6_000, 3 * (chars / 12) * 1000) + (parts - 1) * 3_000;

export const AUTOPLAY_KEY = 'atlas:autoplay';
export const VOICE_KEY = 'atlas:voice';

/** A session switch (`AUTOPLAY_KEY`, `VOICE_KEY`): off unless this tab switched it on. */
export function readSwitch(key: string): boolean {
  try {
    return sessionStorage.getItem(key) === '1';
  } catch {
    return false;
  }
}

export function writeSwitch(key: string, on: boolean): void {
  try {
    sessionStorage.setItem(key, on ? '1' : '0');
  } catch {
    // Storage unavailable (private mode): the switch still works for this page.
  }
}

/**
 * Run `fn` once the beat has settled: at once (next task) for an `instant`
 * beat, else when `settled` resolves (or rejects) if the engine gave one, else
 * after `BEAT_SETTLE_MS`. Returns a cancel function.
 */
export function afterSettle(instant: boolean, settled: Promise<void> | null, fn: () => void): () => void {
  if (instant || !settled) {
    const timer = window.setTimeout(fn, instant ? 0 : BEAT_SETTLE_MS);
    return () => window.clearTimeout(timer);
  }
  let cancelled = false;
  const run = () => {
    if (!cancelled) fn();
  };
  settled.then(run, run);
  return () => {
    cancelled = true;
  };
}
