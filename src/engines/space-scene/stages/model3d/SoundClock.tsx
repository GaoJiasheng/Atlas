/** One acoustic phase shared by the instanced row and all visual-hz markers. */
import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { SimData, SimValues } from '../../sim-schema';
import type { SensesFrame } from '../../schema';
import type { StageBridge } from '../../bridge';
import { solveSenses } from '../../lib/sim/senses';
import { echoDuration, echoPosition, echoVisualDistance, syncSoundMotion, seekSoundPhase } from '../../lib/sim/sound-motion';
import { keepAnimating, MAX_DT, prefersReducedMotion, useRuntime } from './runtime';

export function SoundClock({ sim, values, frame, snapKey, run, exploded, layers, echoContext, markerVisible, bridge }: {
  sim: SimData; values: SimValues; frame?: SensesFrame | null; snapKey: number; run: boolean; exploded: boolean; layers: readonly string[]; echoContext: boolean; markerVisible: boolean; bridge: StageBridge;
}) {
  const runtime = useRuntime(), clock = runtime.sound;
  const q = useMemo(() => sim.senses ? solveSenses(sim.senses, values) : {}, [sim, values]);
  const echo = sim.overlays.find(o => o.kind === 'sound-echo-pulse');
  const physicalEchoMs = typeof q['echo-ms'] === 'number' ? q['echo-ms'] : null;
  const duration = echoDuration(physicalEchoMs);
  const waveKey = `${values['frequency-hz']}|${values.amplitude}|${values['sound-active']}`;
  const echoKey = `${values.medium}|${values['distance-m']}|${values['sound-active']}`;
  const soundLab = useMemo(() => ({ echo: { elapsedVisual: 0, u: 0, pathPosition: 0, atReturn: false, playing: false, hiddenReason: null as string | null, physicalEchoMs: null as number | null, slowFactor: 10 } }), []);
  const seen = useRef({ snapshot: null as number | null, wave: '', echo: '' }), wasRun = useRef(run);
  const keys = useMemo(() => ({ snapshot: snapKey, wave: waveKey, echo: echoKey }), [snapKey, waveKey, echoKey]);
  const markers = useMemo(() => new Set(sim.bind.flatMap(b => 'animation' in b && b.hz && b.output && sim.outputs.some(o => o.id === b.output && (o.from ?? o.id) === 'visual-hz') ? typeof b.animation === 'string' ? [b.animation] : b.animation : [])), [sim]);
  useEffect(() => {
    clock.markerIds = markers;
    bridge.senses.profile = 'sound-only';
    bridge.senses.eye = undefined;
    bridge.senses.sourceMarkers = {};
    bridge.sensesSeek = cycles => { if (!seekSoundPhase(cycles)) return false; clock.phaseCycles = cycles; clock.waveHold = true; bridge.invalidate(); return true; };
    bridge.sensesEchoSeek = u => { if (!echo || !seekSoundPhase(u)) return false; clock.elapsedVisual = u * duration; clock.echoHold = true; bridge.invalidate(); return true; };
    if (echo) bridge.senses.soundLab = soundLab;
    bridge.invalidate();
    return () => { clock.markerIds = new Set(); bridge.sensesSeek = () => false; bridge.sensesEchoSeek = () => false; };
  }, [clock, markers, bridge, echo, duration, soundLab]);
  // A reading rebuilt on a dependency change must not drop the wave overlay's or the other readings; only leaving the stage clears them.
  useEffect(() => () => { bridge.senses = {}; }, [bridge]);
  useFrame((state, delta) => {
    syncSoundMotion(clock, seen.current, keys, frame, duration);
    if (run !== wasRun.current) {
      if (run) {
        clock.waveHold = false; clock.echoHold = false;
        if (duration > 0 && clock.elapsedVisual >= duration) clock.elapsedVisual = 0;
      }
      wasRun.current = run;
    }
    const dt = Math.min(delta, MAX_DT), reduced = prefersReducedMotion();
    const blocked = exploded || runtime.explode > 0;
    clock.visualHz = typeof q['visual-hz'] === 'number' ? q['visual-hz'] : 0;
    clock.echoContext = echoContext;
    const waveOverlay = sim.overlays.find(o => o.kind === 'longitudinal-wave');
    const condition = waveOverlay?.kind === 'longitudinal-wave' ? waveOverlay.when : undefined;
    const conditionValue = condition?.control ? values[condition.control] : condition?.output ? q[sim.outputs.find(o => o.id === condition.output)?.from ?? condition.output] : undefined;
    const waveVisible = !!waveOverlay && (!waveOverlay.group || layers.includes(waveOverlay.group)) && (!condition || conditionValue === condition.is);
    clock.wavePlaying = run && !blocked && !reduced && !document.hidden && !clock.waveHold && !echoContext && clock.visualHz > 0 && (waveVisible || markerVisible);
    if (clock.wavePlaying) clock.phaseCycles += dt * clock.visualHz;
    const hiddenReason = blocked ? 'exploded' : !echoContext ? 'condition' : echo?.group && !layers.includes(echo.group) ? 'layer' : values.medium === 'vacuum' ? 'no-medium' : values.medium !== 'air' ? 'medium' : values['sound-active'] === false ? 'source-off' : null;
    const playing = !!echo && hiddenReason === null && run && !reduced && !document.hidden && !clock.echoHold && duration > 0 && clock.elapsedVisual < duration;
    if (playing) clock.elapsedVisual = Math.min(duration, clock.elapsedVisual + dt);
    if (echo) {
      const reading = soundLab.echo;
      echoPosition(clock.elapsedVisual, duration, echoVisualDistance(Number(values['distance-m'])), reading);
      reading.elapsedVisual = clock.elapsedVisual; reading.playing = playing && !reading.atReturn;
      reading.hiddenReason = hiddenReason; reading.physicalEchoMs = physicalEchoMs;
      bridge.senses.soundLab = soundLab;
    }
    if (clock.wavePlaying || (playing && clock.elapsedVisual < duration)) keepAnimating(state.invalidate);
  });
  return null;
}
