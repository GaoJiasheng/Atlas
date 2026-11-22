/**
 * Recorded narration (docs/06 语音, docs/02 the one runtime-download
 * exception): which neural voice reads each locale, how a clip is named and
 * where it is served. Pure and shared by the runtime (`lib/narration.ts`), the
 * caption extractor (`scripts/audio/extract.ts`), the coverage check and the
 * deploy staging, so the name a clip is generated under is exactly the name
 * the page asks for.
 *
 * A clip's name is a hash of (format, voice, rate, spoken text): edit a
 * caption and its clip name changes, so the old clip simply stops being asked
 * for and the page speaks the new text with the system voice until a clip for
 * it has been generated.
 */

export type NarrationLocale = 'en' | 'zh';

/** The edge-tts voice and rate per locale (Gavin 2026-11-22). */
export const NARRATION_VOICES: Record<NarrationLocale, { voice: string; rate: string; lang: string }> = {
  en: { voice: 'en-GB-SoniaNeural', rate: '-10%', lang: 'en-GB' },
  zh: { voice: 'zh-CN-XiaoxiaoNeural', rate: '-8%', lang: 'zh-CN' },
};

/** edge-tts's native output (MP3, 24 kHz mono, 48 kbps): plays in WKWebView, Safari, Chrome and Playwright's Chromium (which has no AAC). */
export const NARRATION_FORMAT = 'audio-24khz-48kbitrate-mono-mp3';
export const NARRATION_EXT = 'mp3';

/** Where the iPad app fetches clips and indexes from (the website itself, same files). */
export const NARRATION_ORIGIN = 'https://atlas.gavin.pub';

/** Site path prefix of every clip and index (no leading slash). */
export const NARRATION_DIR = 'narration';

const FNV_OFFSET = 0xcbf29ce484222325n;
const FNV_PRIME = 0x100000001b3n;
const MASK_64 = 0xffffffffffffffffn;

/** FNV-1a 64 over the UTF-8 bytes of `input`, as 16 hex digits (a name, not a security measure). */
export function fnv1a64(input: string): string {
  let h = FNV_OFFSET;
  for (const byte of new TextEncoder().encode(input)) {
    h ^= BigInt(byte);
    h = (h * FNV_PRIME) & MASK_64;
  }
  return h.toString(16).padStart(16, '0');
}

/** The clip name for `text` spoken in `locale`: changes with the text, the voice, the rate and the format. */
export function clipHash(locale: NarrationLocale, text: string): string {
  const { voice, rate } = NARRATION_VOICES[locale];
  return fnv1a64(`${NARRATION_FORMAT}|${voice}|${rate}|${text}`);
}

/** A clip's path, relative to the audio folder and to the site root alike: `narration/en/<hash>.mp3`. */
export const clipPath = (locale: NarrationLocale, hash: string): string => `${NARRATION_DIR}/${locale}/${hash}.${NARRATION_EXT}`;

/** A topic's availability index, relative to the site root: `narration/<slug>.json`. */
export const indexPath = (topic: string): string => `${NARRATION_DIR}/${topic}.json`;

/** `narration/<slug>.json`: the clip names of this topic that exist on the site, per locale. */
export interface NarrationIndex {
  version: 1;
  en: string[];
  zh: string[];
}

/** A parsed index, or `null` when `value` is not one. */
export function parseIndex(value: unknown): NarrationIndex | null {
  if (typeof value !== 'object' || value === null) return null;
  const v = value as Partial<NarrationIndex>;
  const list = (x: unknown) => Array.isArray(x) && x.every((h) => typeof h === 'string' && /^[0-9a-f]{16}$/.test(h));
  if (v.version !== 1 || !list(v.en) || !list(v.zh)) return null;
  return { version: 1, en: v.en!, zh: v.zh! };
}
