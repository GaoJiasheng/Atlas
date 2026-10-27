/** One physical snapshot per scene, shared by WebGL, readings, cards and QA. */
import type { SceneStore } from '../../../core/store';
import type { SpaceSceneExt } from '../../index';
import type { SimData, SimValues } from '../../sim-schema';
import type { OrbitRotation } from '../../orbit-rotation-schema';
import { resolveSimValues } from './controls';
import { orbitClock, stepOrbitClock, seekOrbitClock, type OrbitClockState } from './orbit-clock';
import { orbitSnapshot, validOrbitTime, type OrbitSnapshot } from './orbit-rotation';
import { orbitDisplay, type OrbitDisplay } from './orbit-projection';
import type { SimOutputs } from './index';
export interface OrbitSession {
  config: OrbitRotation;
  clock: OrbitClockState;
  values: SimValues;
  snapshot: OrbitSnapshot;
  display: OrbitDisplay;
  outputs: SimOutputs;
  id: number;
  listeners: Set<() => void>;
  subscribe: (cb: () => void) => () => void;
  tick(delta: number, hidden?: boolean): void;
  seek(t: number): boolean;
  sync(): void;
  dispose(): void;
}
/** Whether the lab on show is a static comparison (its clock rate is 0: no FLOW / SPACE). */
export const orbitIsStill = (o: OrbitSession): boolean => !(o.config.clock.rateByLab[o.snapshot.lab as keyof typeof o.config.clock.rateByLab] > 0);
const sessions = new WeakMap<object, OrbitSession>();
export function getOrbitSession(store: SceneStore<SpaceSceneExt>, sim: SimData): OrbitSession | null {
  return sim.orbitRotation ? (sessions.get(store) ?? createSession(store, sim)) : null;
}
function createSession(store: SceneStore<SpaceSceneExt>, sim: SimData): OrbitSession {
  const config = sim.orbitRotation!,
    values = resolveSimValues(sim, store.getState().sim),
    seed = Number(values[config.clock.seed]);
  const clock = orbitClock(seed);
  if (validOrbitTime(store.getState().orbitTime, config.clock.maxSeconds)) clock.elapsedSeconds = store.getState().orbitTime!;
  let previous = store.getState(),
    busy = false,
    resetNextDelta = true;
  const listeners = new Set<() => void>();
  const snapshot = orbitSnapshot(config, values, {
    timeSeconds: clock.elapsedSeconds,
  });
  const session: OrbitSession = {
    config,
    clock,
    values,
    snapshot,
    display: orbitDisplay(config, snapshot, String(values[config.display.scale])),
    outputs: {},
    id: 0,
    listeners,
    subscribe: (cb) => {
      listeners.add(cb);
      return () => {
        listeners.delete(cb);
      };
    },
    tick(delta, hidden = false) {
      if (resetNextDelta) {
        resetNextDelta = false;
        delta = 0;
      }
      if (hidden) {
        resetNextDelta = true;
        return;
      }
      if (stepOrbitClock(clock, delta, Number(config.clock.rateByLab[session.snapshot.lab as keyof typeof config.clock.rateByLab]), config.clock.maxSeconds))
        publish(true);
      if (!clock.running && store.getState().run) store.getState().patch({ run: false, orbitTime: clock.elapsedSeconds });
    },
    seek(t) {
      if (!seekOrbitClock(clock, t, config.clock.maxSeconds)) return false;
      busy = true;
      store.getState().patch({ run: false, orbitTime: t });
      previous = store.getState();
      busy = false;
      publish(true);
      resetNextDelta = true;
      return true;
    },
    sync() {
      if (busy) return;
      const st = store.getState(),
        prev = previous,
        next = resolveSimValues(sim, st.sim);
      const keys = Object.keys(next).filter((k) => next[k] !== session.values[k]);
      const scaleOnly = keys.length > 0 && keys.every((k) => k === config.display.scale),
        controlChanged = keys.length > 0 && !scaleOnly;
      const transition = st.transition.id !== prev.transition.id && ['chapter', 'state', 'url', 'init'].includes(st.transition.reason);
      const explicitTime = st.orbitTime !== prev.orbitTime && validOrbitTime(st.orbitTime, config.clock.maxSeconds);
      const restoredTime = transition && validOrbitTime(st.orbitTime, config.clock.maxSeconds);
      if (transition || controlChanged) {
        clock.seedSeconds = Number(next[config.clock.seed]);
        clock.elapsedSeconds = restoredTime ? st.orbitTime! : clock.seedSeconds;
        clock.running = false;
        resetNextDelta = true;
      } else if (explicitTime) clock.elapsedSeconds = st.orbitTime!;
      const lab = String(next[config.controls.lab]),
        rate = config.clock.rateByLab[lab as keyof typeof config.clock.rateByLab];
      const shouldRun = st.run && rate > 0 && (!controlChanged || restoredTime) && !(transition && st.transition.reason === 'url');
      if (st.run !== prev.run) resetNextDelta = true;
      clock.running = shouldRun;
      session.values = next;
      if (st.run !== shouldRun || controlChanged || transition || st.run !== prev.run) {
        busy = true;
        store.getState().patch({
          run: shouldRun,
          orbitTime: shouldRun ? null : clock.elapsedSeconds,
        });
        busy = false;
      }
      previous = store.getState();
      if (transition || controlChanged || explicitTime) publish(true);
      else if (scaleOnly) publish(false);
      else for (const cb of listeners) cb();
    },
    dispose() {
      off();
      sessions.delete(store);
      listeners.clear();
    },
  };
  function publish(physical: boolean) {
    if (physical) {
      session.snapshot = orbitSnapshot(config, session.values, {
        timeSeconds: clock.elapsedSeconds,
      });
      session.outputs = Object.fromEntries(sim.outputs.map((o) => [o.id, session.snapshot.quantities[o.from ?? o.id]!]));
    }
    session.display = orbitDisplay(config, session.snapshot, String(session.values[config.display.scale]));
    session.id++;
    for (const cb of listeners) cb();
  }
  sessions.set(store, session);
  const off = store.subscribe(() => session.sync());
  publish(true);
  return session;
}
