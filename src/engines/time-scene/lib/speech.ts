/**
 * Caption narration with the browser's Web Speech API (`speechSynthesis`): no
 * audio files, no network. Pure helpers (voice choice, text clean-up) plus the
 * thin `speak` wrapper the presentation uses.
 */

import type { VoiceLogEntry } from '../../core/controls';

/** The parts of a `SpeechSynthesisVoice` the choice looks at. */
export interface VoiceLike {
  name: string;
  lang: string;
  localService?: boolean;
}

/** Names worth picking first when present (substring, case-insensitive). */
const PREFERRED_NAMES: Record<'en' | 'zh', readonly string[]> = {
  zh: ['Tingting', 'Meijia', 'Lili', 'Xiaoxiao'],
  en: ['Daniel', 'Samantha', 'Aria', 'Libby'],
};

const normLang = (lang: string) => lang.replace(/_/g, '-').toLowerCase();

/** 0 = the best language match for `locale`, larger = worse, `null` = not this language. */
function langTier(lang: string, locale: 'en' | 'zh'): number | null {
  const l = normLang(lang);
  if (locale === 'en') {
    if (l === 'en-gb') return 0;
    return l === 'en' || l.startsWith('en-') ? 1 : null;
  }
  if (l === 'zh-cn' || l === 'zh-sg' || l === 'zh-hans' || l.startsWith('zh-hans-')) return 0;
  if (l.startsWith('yue') || l === 'zh-tw' || l === 'zh-hk' || l === 'zh-mo' || l.startsWith('zh-hant')) return 2;
  return l === 'zh' || l.startsWith('zh-') || l === 'cmn' || l.startsWith('cmn-') ? 1 : null;
}

/**
 * The voice to narrate in `locale`: by language (en-GB then en-*; zh-CN / zh-SG,
 * then other zh-*, Traditional and Cantonese only as a last resort), then a
 * local voice over a network one, then the preferred names. `null` = none.
 */
export function pickVoice<V extends VoiceLike>(voices: readonly V[], locale: 'en' | 'zh'): V | null {
  const names = PREFERRED_NAMES[locale].map((n) => n.toLowerCase());
  let best: { voice: V; key: [number, number, number] } | null = null;
  for (const voice of voices) {
    const tier = langTier(voice.lang, locale);
    if (tier === null) continue;
    const rank = names.findIndex((n) => voice.name.toLowerCase().includes(n));
    const key: [number, number, number] = [tier, voice.localService === false ? 1 : 0, rank < 0 ? names.length : rank];
    if (!best || key[0] < best.key[0] || (key[0] === best.key[0] && (key[1] < best.key[1] || (key[1] === best.key[1] && key[2] < best.key[2])))) best = { voice, key };
  }
  return best?.voice ?? null;
}

/** The caption as speakable plain text: markup and source superscripts out, numbers as written. */
export function speakableText(text: string): string {
  return text
    .replace(/<sup\b[^>]*>[\s\S]*?<\/sup>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

export function speechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';
}

/** The voice for `locale` on this device, or `null` (no API, or no matching voice). */
export function voiceFor(locale: 'en' | 'zh'): SpeechSynthesisVoice | null {
  if (!speechSupported()) return null;
  return pickVoice(window.speechSynthesis.getVoices(), locale);
}

/** Re-run `listener` when the device's voice list changes (Chrome loads voices asynchronously). */
export function onVoicesChanged(listener: () => void): () => void {
  if (!speechSupported()) return () => {};
  const synth = window.speechSynthesis;
  synth.addEventListener?.('voiceschanged', listener);
  return () => synth.removeEventListener?.('voiceschanged', listener);
}

export interface Narration {
  /** Stop speaking; `onEnd` does not fire after this. */
  cancel(): void;
}

/** The page locale's BCP-47 tag: what the utterance is told to speak, whatever voice was found. */
export const SPEECH_LANG: Record<'en' | 'zh', string> = { en: 'en-GB', zh: 'zh-CN' };

/** Fastest believable speech (characters per second): an `end` sooner than this is a spurious event, not the end. */
const MAX_CHARS_PER_SEC = 60;
/** Chrome stops a long utterance after ~15 s: nudge the engine this often while speaking. */
const KEEPALIVE_MS = 10_000;

const LOG_SIZE = 10;
const log: VoiceLogEntry[] = [];
/** The last utterances (`__atlas.voiceLog()`), oldest first. */
export const voiceLog = (): VoiceLogEntry[] => log.map((e) => ({ ...e }));

let active: Narration | null = null;

/** Chrome / Edge / Android pause-resume to keep long utterances alive; Safari and iOS do not need it (and break). */
const needsKeepAlive = () => typeof navigator !== 'undefined' && /Chrome|Chromium|Edg\//.test(navigator.userAgent) && !/iPhone|iPad|iPod/.test(navigator.userAgent);

/**
 * Speak `text` as `lang` in `voice`. `onEnd` fires once, only when the utterance
 * genuinely ended (or failed for a reason other than being cancelled): never
 * after `cancel`, never for an `interrupted` / `canceled` error, never for an
 * `end` that comes implausibly early (Chrome fires those when a `cancel()`
 * races a `speak()`). Events of an utterance that is no longer the current one
 * are ignored. `cancel()` goes first, `speak()` follows on the next animation
 * frame so the two cannot race; a hidden tab pauses speech and coming back
 * resumes it.
 */
export function speak(text: string, lang: string, voice: SpeechSynthesisVoice, onEnd: () => void): Narration {
  active?.cancel();
  const synth = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = voice;
  utterance.lang = lang;
  utterance.rate = 0.95;
  utterance.pitch = 1;
  const entry: VoiceLogEntry = { text, lang, voice: voice.name, started: null, ended: null, reason: null };
  log.push(entry);
  if (log.length > LOG_SIZE) log.shift();

  let done = false;
  let launched = 0;
  let raf = 0;
  let timer = 0;
  let keepAlive = 0;
  const onVisible = () => {
    if (document.visibilityState === 'visible') synth.resume();
  };
  const settle = (reason: string, advance: boolean) => {
    if (done) return;
    done = true;
    entry.ended = Math.round(performance.now());
    entry.reason = reason;
    if (active === narration) active = null;
    cancelAnimationFrame(raf);
    window.clearTimeout(timer);
    window.clearInterval(keepAlive);
    document.removeEventListener('visibilitychange', onVisible);
    if (advance) onEnd();
  };
  utterance.onstart = () => {
    if (!done && entry.started === null) entry.started = Math.round(performance.now());
  };
  utterance.onend = () => {
    if (done) return;
    const elapsed = performance.now() - launched;
    // Far too soon for this much text: not the end (the dwell fallback of the caller covers a lost one).
    settle(elapsed < (text.length / MAX_CHARS_PER_SEC) * 1000 ? 'spurious-end' : 'end', elapsed >= (text.length / MAX_CHARS_PER_SEC) * 1000);
  };
  utterance.onerror = (e) => {
    const reason = (e as SpeechSynthesisErrorEvent).error ?? 'error';
    settle(`error:${reason}`, reason !== 'canceled' && reason !== 'interrupted');
  };

  const go = () => {
    if (done || launched) return;
    launched = performance.now();
    cancelAnimationFrame(raf);
    window.clearTimeout(timer);
    synth.speak(utterance);
    if (needsKeepAlive())
      keepAlive = window.setInterval(() => {
        if (synth.speaking) {
          synth.pause();
          synth.resume();
        }
      }, KEEPALIVE_MS);
  };
  const narration: Narration = {
    cancel() {
      if (done) return;
      settle('cancelled', false);
      synth.cancel();
    },
  };
  active = narration;
  document.addEventListener('visibilitychange', onVisible);
  synth.cancel();
  // speak() on the next frame (a hidden tab has none: the timer covers it).
  raf = requestAnimationFrame(go);
  timer = window.setTimeout(go, 120);
  return narration;
}

/** Stop all speech (leaving the presentation, changing beat). */
export function stopSpeech(): void {
  active?.cancel();
  if (speechSupported()) window.speechSynthesis.cancel();
}

/**
 * Prime the engine inside a user gesture (iOS / Safari only speak after one):
 * a silent utterance when Voice is switched on.
 */
export function primeSpeech(): void {
  if (!speechSupported()) return;
  const u = new SpeechSynthesisUtterance(' ');
  u.volume = 0;
  window.speechSynthesis.speak(u);
}
