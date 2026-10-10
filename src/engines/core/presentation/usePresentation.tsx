/**
 * `usePresentation(adapter)`: the presentation system any engine can run
 * (docs/06 "演示系统（core）"). It owns the beat list (`beats.ts`), entering
 * (adapter `onEnter`, `saveState`, HUD hidden, audio clips preloaded) and
 * leaving (restore, HUD back), the beat keys (→ / SPACE next, ← previous,
 * captured before the host's chapter keys), the AUTO-PLAY and VOICE session
 * switches, audio playback per beat, and the `controls.beats` object the
 * engine registers for `__atlas.beats / goToBeat / setAutoplay / setVoice /
 * voiceLog / state().presentation`. ESC / H / "show HUD" bring the HUD back,
 * which ends the presentation.
 *
 * The engine registers the `presentation` mode itself (key P, `status`,
 * `start` / `stop`), puts `beats` into its `SceneControls`, checks
 * `isPresenting()` in its ESC chain, and renders `element` on its stage.
 */
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useSceneContext } from '../context';
import type { SceneControls } from '../controls';
import { withBase } from '../../../i18n';
import { onVoicesChanged, primeSpeech, voiceFor, voiceLog } from '../../../lib/speech';
import { AUTOPLAY_KEY, readSwitch, VOICE_KEY, writeSwitch } from './autoplay';
import { beatInfos, buildBeats, current, presentationStatus, startIndex, stepIndex, type Beat, type BeatBase } from './beats';
import type { PresentationAdapter } from './adapter';
import { Presentation } from './Presentation';

export interface PresentationApi<B extends BeatBase> {
  beats: readonly Beat<B>[];
  /** The beat on show (`index` into `beats`; `serial` counts beats shown; `settled` as `PresentationAdapter.afterCameraSettle` gave it); `null` outside the presentation. */
  beat: { index: number; serial: number; instant: boolean; settled: Promise<void> | null } | null;
  presenting: boolean;
  /** Synchronous check for store subscriptions and the ESC chain. */
  isPresenting(): boolean;
  /** Enter (if needed) and show beat `index`, or the current chapter's first beat. */
  start(index: number | null, instant: boolean): void;
  /** Leave and restore the scene; `restoreHud` = bring the HUD back too (P, the PRESENT button, ESC). */
  stop(restoreHud: boolean): void;
  /** Status-line text of the `presentation` mode (`PRESENTATION 03/40`). */
  status: string;
  /** For `SceneControls.beats`. */
  controls: NonNullable<SceneControls['beats']>;
  /** The caption card, progress bar and click layer; render it on the stage (null outside the presentation). */
  element: ReactNode;
}

export function usePresentation<B extends BeatBase, S>(adapter: PresentationAdapter<B, S>): PresentationApi<B> {
  const { store, hud, chapters, locale, topic } = useSceneContext();
  const adapterRef = useRef(adapter);
  adapterRef.current = adapter;

  const beats = useMemo(() => buildBeats(chapters, (c) => adapterRef.current.beatsOf(c)), [chapters]);
  const [beat, setBeat] = useState<{ index: number; serial: number; instant: boolean; settled: Promise<void> | null } | null>(null);
  const serial = useRef(0);
  const presenting = beat !== null;
  const presentingRef = useRef(false);
  const beatRef = useRef<number | null>(null);
  /** The scene before the presentation started (restored when it ends). */
  const saved = useRef<{ state: S } | null>(null);
  const audio = useRef(new Map<string, HTMLAudioElement>());

  const stopAudio = useCallback(() => {
    for (const a of audio.current.values()) {
      a.pause();
      a.currentTime = 0;
    }
  }, []);
  const show = useCallback(
    (i: number, instant: boolean) => {
      const b = beats[i];
      if (!b) return;
      beatRef.current = i;
      const a = adapterRef.current;
      const applied = a.applyBeat(b, { instant });
      const settled = a.afterCameraSettle ? a.afterCameraSettle() : applied instanceof Promise ? applied : null;
      setBeat({ index: i, serial: ++serial.current, instant, settled });
      stopAudio();
      const clip = b.audio ? audio.current.get(b.audio) : undefined;
      // Autoplay may be refused until the reader has interacted; the beat works without sound.
      if (clip) clip.play().catch(() => {});
    },
    [beats, stopAudio],
  );
  const stop = useCallback(
    (restoreHud: boolean) => {
      if (!presentingRef.current) return;
      presentingRef.current = false;
      beatRef.current = null;
      setBeat(null);
      stopAudio();
      if (saved.current) adapterRef.current.restoreState(saved.current.state);
      if (restoreHud) hud.setState({ hud: true });
    },
    [hud, stopAudio],
  );
  const start = useCallback(
    (requested: number | null, instant: boolean) => {
      if (beats.length === 0) return;
      if (!presentingRef.current) {
        adapterRef.current.onEnter?.();
        saved.current = { state: adapterRef.current.saveState() };
        presentingRef.current = true;
        hud.setState({ hud: false });
        // Preload the narration of every beat that has one.
        for (const b of beats) {
          if (!b.audio || audio.current.has(b.audio)) continue;
          const clip = new Audio(withBase(b.audio));
          clip.preload = 'auto';
          audio.current.set(b.audio, clip);
        }
      }
      show(startIndex(beats, store.getState().chapter, requested), instant);
    },
    [beats, store, hud, show],
  );
  const isPresenting = useCallback(() => presentingRef.current, []);
  const step = useCallback(
    (dir: 1 | -1) => {
      const i = beatRef.current;
      if (i === null) return;
      const next = stepIndex(i, dir, beats.length);
      if (next !== null) show(next, false);
    },
    [beats.length, show],
  );

  /* AUTO-PLAY: off by default, remembered for the session. */
  const [autoplay, setAutoplayState] = useState(false);
  useEffect(() => setAutoplayState(readSwitch(AUTOPLAY_KEY)), []);
  const autoplayRef = useRef(autoplay);
  autoplayRef.current = autoplay;
  const setAutoplay = useCallback((on: boolean) => {
    writeSwitch(AUTOPLAY_KEY, on);
    setAutoplayState(on);
  }, []);
  /* VOICE: the caption is narrated with the browser's speech synthesis. Off by default, remembered for the session. */
  const [voiceWanted, setVoiceWanted] = useState(false);
  useEffect(() => setVoiceWanted(readSwitch(VOICE_KEY)), []);
  const [voiceAvailable, setVoiceAvailable] = useState(false);
  const voiceAvailableRef = useRef(false);
  voiceAvailableRef.current = voiceAvailable;
  useEffect(() => {
    const update = () => setVoiceAvailable(voiceFor(locale) !== null);
    update();
    return onVoicesChanged(update); // Chrome loads voices asynchronously
  }, [locale]);
  const voiceRef = useRef(false);
  voiceRef.current = voiceWanted;
  const setVoice = useCallback((on: boolean) => {
    if (on && !voiceAvailableRef.current) return false;
    writeSwitch(VOICE_KEY, on);
    if (on) primeSpeech(); // inside the click: iOS / Safari only speak after a gesture
    setVoiceWanted(on);
    return true;
  }, []);

  // ESC / H / "show HUD" bring the HUD back: that ends the presentation.
  useEffect(
    () =>
      hud.subscribe((s, prev) => {
        if (presentingRef.current && s.hud && !prev.hud) stop(false);
      }),
    [hud, stop],
  );
  // Beat keys: → / SPACE next, ← previous. Captured before the host's chapter / pause keys.
  useEffect(() => {
    if (!presenting) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      const dir = e.key === 'ArrowRight' || e.key === ' ' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!dir) return;
      e.preventDefault();
      e.stopPropagation();
      step(dir);
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [presenting, step]);
  useEffect(() => () => stopAudio(), [stopAudio]);

  const controls = useMemo<NonNullable<SceneControls['beats']>>(
    () => ({
      list: () => beatInfos(beats),
      go: (i, { instant }) => start(i, instant),
      current: () => current(beats, beatRef.current, { autoplay: autoplayRef.current, voice: voiceRef.current }),
      setAutoplay,
      setVoice,
      voiceLog,
    }),
    [beats, start, setAutoplay, setVoice],
  );

  const captionAt = (i: number) => {
    const b = beats[i];
    return b ? adapter.captionOf(b, locale) : '';
  };
  const clipName = beat ? beats[beat.index]?.audio : undefined;
  const element = beat ? (
    <Presentation
      title={topic.title}
      beats={beats}
      index={beat.index}
      serial={beat.serial}
      instant={beat.instant}
      settled={beat.settled}
      chapters={chapters}
      locale={locale}
      caption={captionAt(beat.index)}
      captionAt={captionAt}
      readout={adapter.readout}
      onStep={step}
      onGo={(i) => show(i, false)}
      audio={clipName ? (audio.current.get(clipName) ?? null) : null}
      autoplay={autoplay}
      onAutoplay={setAutoplay}
      voice={voiceWanted && voiceAvailable}
      voiceAvailable={voiceAvailable}
      onVoice={setVoice}
    />
  ) : null;

  return {
    beats,
    beat,
    presenting,
    isPresenting,
    start,
    stop,
    status: presentationStatus(beat?.index ?? null, beats.length),
    controls,
    element,
  };
}
