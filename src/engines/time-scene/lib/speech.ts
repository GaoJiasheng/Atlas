/**
 * Caption narration with the browser's Web Speech API (`speechSynthesis`): no
 * audio files, no network. Pure helpers (voice choice, text clean-up) plus the
 * thin `speak` wrapper the presentation uses.
 */

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
  /** Stop speaking; no callback fires after this. */
  cancel(): void;
}

/**
 * Speak `text` in `voice`. `onEnd` fires once when the utterance ends or fails
 * (never after `cancel`). Cancels anything queued first: Chrome can otherwise
 * leave its queue stuck. A hidden tab pauses speech; coming back resumes it.
 */
export function speak(text: string, voice: SpeechSynthesisVoice, onEnd: () => void): Narration {
  const synth = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = voice;
  utterance.lang = voice.lang;
  utterance.rate = 0.95;
  utterance.pitch = 1;
  let live = true;
  const finish = () => {
    if (!live) return;
    live = false;
    document.removeEventListener('visibilitychange', onVisible);
    onEnd();
  };
  const onVisible = () => {
    if (document.visibilityState === 'visible') synth.resume();
  };
  utterance.onend = finish;
  utterance.onerror = finish;
  document.addEventListener('visibilitychange', onVisible);
  synth.cancel();
  synth.speak(utterance);
  return {
    cancel() {
      if (!live) return;
      live = false;
      document.removeEventListener('visibilitychange', onVisible);
      synth.cancel();
    },
  };
}

/** Stop all speech (leaving the presentation, changing beat). */
export function stopSpeech(): void {
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
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}
