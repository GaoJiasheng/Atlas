/**
 * VOICE with recorded narration (docs/06 语音): a beat's parts (chapter
 * number, title, caption) play as pre-generated neural-voice clips when every
 * one of them exists, otherwise the whole beat is spoken by the device's
 * speech synthesis exactly as before (`lib/speech.ts`). One beat never mixes
 * the two voices, except when a clip fails mid-way (the rest is spoken).
 *
 * Where clips come from (`lib/narration-clips.ts` names them by a hash of the
 * spoken text): the website serves them same-origin under `/narration/`; the
 * iPad app fetches them from the production site, keeps every clip it fetched
 * (IndexedDB, see `idbStore`) and falls back to speech when it is offline or a
 * clip is missing. Which clips exist is a small per-topic index
 * (`/narration/<slug>.json`), fetched once per page when Voice is wanted, so
 * the page never probes for files that are not there. No query strings, no
 * identity: plain GETs of static files.
 *
 * `createNarrator(deps)` builds one with injected platform pieces (the unit
 * tests use fakes); `narrator()` is the page's instance.
 */
import type { VoiceLogEntry } from '../engines/core/controls';
import { withBase } from '../i18n';
import { clipHash, clipPath, indexPath, NARRATION_ORIGIN, NARRATION_VOICES, parseIndex, type NarrationIndex, type NarrationLocale } from './narration-clips';
import { PART_GAP_MS, recordVoice, speakSequence, type Narration, type SpeechPart } from './speech';

/** The parts of an `HTMLAudioElement` the narrator uses. */
export interface AudioLike {
  src: string;
  preload: string;
  readonly duration: number;
  readonly paused: boolean;
  play(): Promise<void>;
  pause(): void;
  addEventListener(type: 'playing' | 'ended' | 'error', listener: () => void): void;
  removeEventListener(type: 'playing' | 'ended' | 'error', listener: () => void): void;
}

/** A persistent cache of fetched clips and indexes (the app); every method resolves, never throws. */
export interface ClipStore {
  getClip(key: string): Promise<Blob | null>;
  putClip(key: string, blob: Blob): Promise<void>;
  getIndex(topic: string): Promise<unknown>;
  putIndex(topic: string, index: NarrationIndex): Promise<void>;
}

export interface NarratorDeps {
  /** The URL of a site path (`narration/…`, no leading slash): same-origin on the web, the production site in the app. */
  url(path: string): string;
  fetch(url: string, init: { signal: AbortSignal }): Promise<Pick<Response, 'ok' | 'json' | 'blob'>>;
  /** Keeps fetched clips across launches (the app); `null` on the web, where the HTTP cache does it. */
  store: ClipStore | null;
  createAudio(): AudioLike;
  createObjectURL(blob: Blob): string;
  revokeObjectURL(url: string): void;
  /** The speech fallback (`speakSequence`). */
  speak: typeof speakSequence;
  log(entry: VoiceLogEntry): void;
  now(): number;
  /** Visibility, so a hidden page pauses its clip like speech does; omitted in tests. */
  document?: Pick<Document, 'visibilityState' | 'addEventListener' | 'removeEventListener'>;
}

/** How long a beat waits for its index and clips before it is spoken instead (ms): a slow network falls back quickly. */
export const CLIP_WAIT_MS = 2500;
/** A clip or index fetch is abandoned after this (ms); one that arrives after `CLIP_WAIT_MS` is still kept for next time. */
export const FETCH_ABORT_MS = 20_000;
/** Clips kept in memory (the page's own short-term cache). */
const MEMORY_CLIPS = 24;

export interface NarrateOptions {
  topic: string;
  locale: NarrationLocale;
  /** BCP-47 tag the speech fallback speaks in (`SPEECH_LANG`). */
  lang: string;
  /** The device voice for the speech fallback; `null` = none (the beat then stays silent for `silentMs`). */
  voice: SpeechSynthesisVoice | null;
  /** Fires once, when the last part genuinely ended (never after `cancel`). */
  onEnd(): void;
  /** As each part starts; `durationMs` is the clip's length (`null` for speech, or a clip of unknown length). */
  onPart?(part: SpeechPart, durationMs: number | null): void;
  /** With neither clips nor a device voice, `onEnd` fires after this long instead (ms). */
  silentMs: number;
}

export interface Narrator {
  /** The topic's index (fetched once; the app keeps the last copy for offline use); `null` = none available. */
  loadIndex(topic: string): Promise<NarrationIndex | null>;
  /** Whether a clip of `text` exists: `undefined` while the index has not loaded. */
  hasClip(topic: string, locale: NarrationLocale, text: string): boolean | undefined;
  /** Whether the topic has any clip in `locale` (`false` until the index has loaded). */
  hasAny(topic: string, locale: NarrationLocale): boolean;
  /** Fetch (and in the app, keep) these parts' clips in the background, if they exist. */
  preload(topic: string, locale: NarrationLocale, parts: readonly { text: string }[]): void;
  /** Play `parts` as clips, else speak them; `cancel()` stops it and drops the rest. */
  narrate(parts: readonly { part: SpeechPart; text: string }[], options: NarrateOptions): Narration;
  /** Unlock playback inside a user gesture (iOS Safari): a silent sound on the narration element. */
  prime(): void;
  /** Stop whatever is playing (leaving the presentation). */
  stop(): void;
}

/** A 50 ms silent WAV (the prime): built in code, as the app's CSP allows `blob:` media but not `data:`. */
function silentWav(): Blob {
  const samples = 400;
  const view = new DataView(new ArrayBuffer(44 + samples * 2));
  const text = (at: number, s: string) => [...s].forEach((c, i) => view.setUint8(at + i, c.charCodeAt(0)));
  text(0, 'RIFF');
  view.setUint32(4, 36 + samples * 2, true);
  text(8, 'WAVEfmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, 8000, true);
  view.setUint32(28, 16000, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  text(36, 'data');
  view.setUint32(40, samples * 2, true);
  return new Blob([view.buffer], { type: 'audio/wav' });
}

/** `promise`, or `fallback` once `ms` have passed (the promise keeps running). */
function within<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(fallback), Math.max(0, ms));
    promise.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      () => {
        clearTimeout(timer);
        resolve(fallback);
      },
    );
  });
}

export function createNarrator(deps: NarratorDeps): Narrator {
  const indexes = new Map<string, Promise<NarrationIndex | null>>();
  const ready = new Map<string, { en: Set<string>; zh: Set<string> } | null>();
  const memory = new Map<string, Blob>();
  const inflight = new Map<string, Promise<Blob | null>>();
  let element: AudioLike | null = null;
  let silent: string | null = null;
  let active: Narration | null = null;

  const audio = () => (element ??= deps.createAudio());

  async function get(url: string): Promise<Pick<Response, 'ok' | 'json' | 'blob'> | null> {
    const abort = new AbortController();
    const timer = setTimeout(() => abort.abort(), FETCH_ABORT_MS);
    try {
      const res = await deps.fetch(url, { signal: abort.signal });
      return res.ok ? res : null;
    } catch {
      return null;
    } finally {
      clearTimeout(timer);
    }
  }

  function loadIndex(topic: string): Promise<NarrationIndex | null> {
    let pending = indexes.get(topic);
    if (pending) return pending;
    pending = (async () => {
      const res = await get(deps.url(indexPath(topic)));
      let index = res ? parseIndex(await res.json().catch(() => null)) : null;
      if (index) await deps.store?.putIndex(topic, index);
      else if (deps.store) index = parseIndex(await deps.store.getIndex(topic));
      return index;
    })();
    indexes.set(topic, pending);
    pending.then((index) => ready.set(topic, index && { en: new Set(index.en), zh: new Set(index.zh) }));
    return pending;
  }

  const hasClip = (topic: string, locale: NarrationLocale, text: string): boolean | undefined => {
    if (!ready.has(topic)) return undefined;
    return ready.get(topic)?.[locale].has(clipHash(locale, text)) ?? false;
  };

  function loadClip(locale: NarrationLocale, hash: string): Promise<Blob | null> {
    const key = `${locale}/${hash}`;
    const kept = memory.get(key);
    if (kept) {
      memory.delete(key);
      memory.set(key, kept);
      return Promise.resolve(kept);
    }
    const pending = inflight.get(key);
    if (pending) return pending;
    const load = (async () => {
      const stored = await deps.store?.getClip(key);
      if (stored) return stored;
      const res = await get(deps.url(clipPath(locale, hash)));
      const blob = res ? await res.blob().catch(() => null) : null;
      if (!blob || blob.size === 0) return null;
      await deps.store?.putClip(key, blob);
      return blob;
    })()
      .catch(() => null)
      .then((blob) => {
        inflight.delete(key);
        if (blob) {
          memory.set(key, blob);
          while (memory.size > MEMORY_CLIPS) memory.delete(memory.keys().next().value!);
        }
        return blob;
      });
    inflight.set(key, load);
    return load;
  }

  function preload(topic: string, locale: NarrationLocale, parts: readonly { text: string }[]): void {
    for (const p of parts) if (hasClip(topic, locale, p.text)) void loadClip(locale, clipHash(locale, p.text));
  }

  function narrate(parts: readonly { part: SpeechPart; text: string }[], o: NarrateOptions): Narration {
    active?.cancel();
    let finished = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let speech: Narration | null = null;
    /** Stops the clip on show (no `onEnd`); set while one is loaded. */
    let stopClip: ((reason: string) => void) | null = null;

    const finish = () => {
      if (finished) return;
      finished = true;
      if (active === narration) active = null;
      o.onEnd();
    };
    /** The device speaks parts `from`… (or, without a voice, a silent dwell stands in for them). */
    const speakFrom = (from: number) => {
      if (finished) return;
      const rest = parts.slice(from);
      if (rest.length === 0) finish();
      else if (!o.voice) timer = setTimeout(finish, o.silentMs);
      else speech = deps.speak(rest, o.lang, o.voice, finish, (part) => o.onPart?.(part, null));
    };
    const play = (i: number, clips: readonly Blob[]) => {
      const p = parts[i];
      if (finished) return;
      if (!p) return finish();
      const el = audio();
      const url = deps.createObjectURL(clips[i]!);
      const entry: VoiceLogEntry = { text: p.text, lang: NARRATION_VOICES[o.locale].lang, voice: NARRATION_VOICES[o.locale].voice, part: p.part, started: null, ended: null, reason: null, source: 'clip' };
      deps.log(entry);
      const onPlaying = () => {
        if (entry.started !== null) return;
        entry.started = Math.round(deps.now());
        o.onPart?.(p.part, Number.isFinite(el.duration) && el.duration > 0 ? Math.round(el.duration * 1000) : null);
      };
      const onVisible = () => {
        if (deps.document?.visibilityState === 'hidden') el.pause();
        else el.play().catch(() => {});
      };
      const settle = (reason: string) => {
        entry.ended = Math.round(deps.now());
        entry.reason = reason;
        stopClip = null;
        el.removeEventListener('playing', onPlaying);
        el.removeEventListener('ended', onEnded);
        el.removeEventListener('error', onError);
        deps.document?.removeEventListener('visibilitychange', onVisible);
        deps.revokeObjectURL(url);
      };
      function onEnded() {
        settle('end');
        if (i + 1 < parts.length) timer = setTimeout(() => play(i + 1, clips), PART_GAP_MS);
        else finish();
      }
      function onError() {
        settle('error:media');
        speakFrom(i);
      }
      stopClip = (reason) => {
        el.pause();
        settle(reason);
      };
      el.addEventListener('playing', onPlaying);
      el.addEventListener('ended', onEnded);
      el.addEventListener('error', onError);
      deps.document?.addEventListener('visibilitychange', onVisible);
      el.preload = 'auto';
      el.src = url;
      el.play().catch((e: unknown) => {
        // Refused (no gesture yet) or undecodable: this part and the rest are spoken.
        if (stopClip === null || entry.reason !== null) return;
        settle(`error:${(e as { name?: string } | null)?.name ?? 'play'}`);
        speakFrom(i);
      });
    };

    const narration: Narration = {
      cancel() {
        if (finished) return;
        finished = true;
        clearTimeout(timer);
        stopClip?.('cancelled');
        speech?.cancel();
        if (active === narration) active = null;
      },
    };
    active = narration;

    const hashes = parts.map((p) => clipHash(o.locale, p.text));
    const known = ready.has(o.topic) ? ready.get(o.topic) : undefined;
    // The index is in and lacks a part: speak at once, as without recordings.
    if (known !== undefined && !(known && hashes.every((h) => known[o.locale].has(h)))) {
      speakFrom(0);
      return narration;
    }
    const deadline = deps.now() + CLIP_WAIT_MS;
    void (async () => {
      const index = known !== undefined ? known : await within(loadIndex(o.topic), CLIP_WAIT_MS, null).then((x) => x && { en: new Set(x.en), zh: new Set(x.zh) });
      if (!index || !hashes.every((h) => index[o.locale].has(h))) return null;
      const clips = await within(Promise.all(hashes.map((h) => loadClip(o.locale, h))), deadline - deps.now(), null);
      return clips?.every((c): c is Blob => c !== null) ? clips : null;
    })().then((clips) => {
      if (finished) return;
      if (clips) play(0, clips);
      else speakFrom(0);
    });
    return narration;
  }

  return {
    loadIndex,
    hasClip,
    hasAny: (topic, locale) => (ready.get(topic)?.[locale].size ?? 0) > 0,
    preload,
    narrate,
    prime() {
      const el = audio();
      if (!el.paused) return;
      silent ??= deps.createObjectURL(silentWav());
      el.src = silent;
      el.play().catch(() => {});
    },
    stop() {
      active?.cancel();
    },
  };
}

/* ------------------------------------------------------------------ */
/* The page's narrator                                                 */
/* ------------------------------------------------------------------ */

/** The iPad app (Capacitor serves the bundle at `capacitor://localhost`). */
export const isNativeShell = (): boolean =>
  typeof location !== 'undefined' && (location.protocol === 'capacitor:' || !!(window as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.());

/** Clips the app keeps (~50 KB each): the oldest go beyond this. */
const STORED_CLIPS = 3000;

/**
 * The app's clip cache: IndexedDB, as ArrayBuffers with their type. Chosen over
 * Cache Storage, which WebKit does not reliably expose on the custom
 * `capacitor://` scheme (no service worker there either), and over the
 * Capacitor Filesystem plugin, which the app does not ship. Every failure
 * resolves to "not stored", so the narration falls back to fetching or speech.
 */
export function idbStore(name = 'atlas-narration'): ClipStore {
  let db: Promise<IDBDatabase | null> | null = null;
  const open = () =>
    (db ??= new Promise((resolve) => {
      try {
        const req = indexedDB.open(name, 1);
        req.onupgradeneeded = () => {
          req.result.createObjectStore('clips').createIndex('at', 'at');
          req.result.createObjectStore('index');
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(null);
        req.onblocked = () => resolve(null);
      } catch {
        resolve(null);
      }
    }));
  const request = <T>(store: 'clips' | 'index', mode: IDBTransactionMode, make: (s: IDBObjectStore) => IDBRequest<T>): Promise<T | null> =>
    open().then(
      (d) =>
        new Promise<T | null>((resolve) => {
          if (!d) return resolve(null);
          try {
            const req = make(d.transaction(store, mode).objectStore(store));
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => resolve(null);
          } catch {
            resolve(null);
          }
        }),
    );
  const trim = async () => {
    const count = await request('clips', 'readonly', (s) => s.count());
    if (count === null || count <= STORED_CLIPS) return;
    const d = await open();
    try {
      let extra = count - STORED_CLIPS;
      const cursor = d!.transaction('clips', 'readwrite').objectStore('clips').index('at').openCursor();
      cursor.onsuccess = () => {
        const c = cursor.result;
        if (!c || extra-- <= 0) return;
        c.delete();
        c.continue();
      };
    } catch {
      // A failed trim keeps a few more clips than the limit; nothing else depends on it.
    }
  };
  return {
    async getClip(key) {
      const rec = await request<{ type: string; data: ArrayBuffer } | undefined>('clips', 'readonly', (s) => s.get(key));
      return rec ? new Blob([rec.data], { type: rec.type }) : null;
    },
    async putClip(key, blob) {
      const data = await blob.arrayBuffer().catch(() => null);
      if (!data) return;
      await request('clips', 'readwrite', (s) => s.put({ type: blob.type || 'audio/mpeg', data, at: Date.now() }, key));
      await trim();
    },
    async getIndex(topic) {
      return (await request<unknown>('index', 'readonly', (s) => s.get(topic))) ?? null;
    },
    async putIndex(topic, index) {
      await request('index', 'readwrite', (s) => s.put(index, topic));
    },
  };
}

let instance: Narrator | null = null;

/** The page's narrator: same-origin on the web; the production site plus the IndexedDB cache in the app. */
export function narrator(): Narrator {
  if (instance) return instance;
  const native = isNativeShell();
  instance = createNarrator({
    url: (path) => (native ? `${NARRATION_ORIGIN}/${path}` : withBase(`/${path}`)),
    fetch: (url, init) => fetch(url, { ...init, credentials: 'omit', referrerPolicy: 'no-referrer' }),
    store: native && typeof indexedDB !== 'undefined' ? idbStore() : null,
    createAudio: () => new Audio(),
    createObjectURL: (blob) => URL.createObjectURL(blob),
    revokeObjectURL: (url) => URL.revokeObjectURL(url),
    speak: speakSequence,
    log: recordVoice,
    now: () => performance.now(),
    document,
  });
  return instance;
}
