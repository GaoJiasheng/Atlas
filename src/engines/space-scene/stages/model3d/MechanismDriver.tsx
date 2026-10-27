/** One physical frame and one phase clock, consumed before parts, ports, flows and probes. */
import { useLayoutEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Matrix4, Vector3 } from 'three';
import type { SceneStore } from '../../../core/store';
import type { SpaceSceneExt } from '../../index';
import type { PartsFile } from '../../schema';
import type { StageBridge, MechanismReading, MechanismSave } from '../../bridge';
import type { SpaceUiStore } from '../../ui';
import { createMechanismFrame, solveMechanism, ROLE_ENDPOINTS, MECHANISM_ROLES, PORT_ROLES } from '../../lib/mechanism';
import { resolveSimValues } from '../../lib/sim/controls';
import { keepAnimating, prefersReducedMotion, useRuntime, type MechanismPartRuntime } from './runtime';
import { createMechanismClock, syncMechanismClock, seekMechanismClock, advanceMechanismClock, saveMechanismClock, restoreMechanismClock } from '../../lib/mechanism-clock';

const translate = new Matrix4();

export function MechanismDriver({ data, store, ui, bridge }: { data: PartsFile; store: SceneStore<SpaceSceneExt>; ui: SpaceUiStore; bridge: StageBridge }) {
  const runtime = useRuntime();
  const invalidate = useThree((s) => s.invalidate);
  const machines = useMemo(() => data.mechanisms.map((spec) => {
    const frame = createMechanismFrame();
    const rest = createMechanismFrame();
    let restValid = true;
    try { solveMechanism(0, spec.geometry, rest); } catch { restValid = false; }
    const reading: MechanismReading = { thetaRad: 0, phaseDeg: 0, cycles: 0, pistonDirection: 'switch', points: {}, planetAngleRad: 0, sunAngleRad: 0, shaftTurns: 0, ports: {}, linkResidualM: 0, clearanceMarginM: 0, parts: {}, gates: {} };
    for (const key of Object.keys(frame.points)) reading.points[key] = [0, 0, 0];
    const parts = MECHANISM_ROLES.map((role) => {
      const binding = spec.parts[role];
      const z = data.parts.find((p) => p.id === binding.part)?.primitive?.at[2] ?? spec.origin[2];
      const entry: MechanismPartRuntime = { matrix: new Matrix4(), reading: { matrix: new Matrix4().toArray() } };
      if ('restEndpoints' in binding) {
        entry.restEndpoints = binding.restEndpoints.map((p) => new Vector3(p[0] + spec.origin[0], p[1] + spec.origin[1], z)) as [Vector3, Vector3];
        entry.reading.endpoints = [[0, 0, 0], [0, 0, 0]];
      }
      reading.parts[binding.part] = entry.reading;
      return { role, id: binding.part, entry };
    });
    const ports = PORT_ROLES.map((role) => {
      const binding = spec.ports[role];
      const entry: MechanismPartRuntime = { matrix: new Matrix4(), reading: { matrix: new Matrix4().toArray() } };
      reading.parts[binding.part] = entry.reading;
      const key = `${binding.flow.id}:${binding.flow.path}`;
      reading.gates[key] = false;
      reading.ports[role] = false;
      return { role, binding, entry, key };
    });
    return { spec, frame, rest, reading, parts, ports, clock: createMechanismClock(0, 'manual'), reset: true, failed: !restValid, restValid, drawnTheta: NaN, wasRunning: false, restore: null as MechanismSave[string] | null };
  }), [data]);

  useLayoutEffect(() => {
    let values = data.sim ? resolveSimValues(data.sim, store.getState().sim) : {};
    ui.setState({ mechanismError: machines.some((m) => m.failed) });
    for (const m of machines) {
      bridge.mechanisms.set(m.spec.id, m.reading);
      for (const p of m.parts) runtime.mechanismParts.set(p.id, p.entry);
      for (const p of m.ports) {
        runtime.mechanismParts.set(p.binding.part, p.entry);
        runtime.mechanismGates.set(p.key, false);
      }
    }
    bridge.seekMechanism = (id, deg) => {
      const m = machines.find((x) => x.spec.id === id);
      if (!m || !Number.isFinite(deg) || deg < 0 || deg > 360) return false;
      syncMechanismClock(m.clock, Number(values[m.spec.clock.phaseControl]), values[m.spec.clock.modeControl] === 'auto' ? 'auto' : 'manual');
      seekMechanismClock(m.clock, deg);
      m.reset = false;
      m.failed = false;
      invalidate();
      return true;
    };
    bridge.resetMechanisms = () => {
      for (const m of machines) { m.reset = true; m.clock.qaHold = false; }
      invalidate();
    };
    bridge.saveMechanisms = () => Object.fromEntries(machines.map((m) => [m.spec.id, saveMechanismClock(m.clock)]));
    bridge.restoreMechanisms = (saved) => {
      for (const m of machines) if (saved[m.spec.id]) m.restore = saved[m.spec.id]!;
      invalidate();
    };
    const unsubscribe = store.subscribe((st, prev) => {
      if (st.sim !== prev.sim && data.sim) {
        const next = resolveSimValues(data.sim, st.sim);
        for (const m of machines) {
          const c = m.spec.clock;
          if (next[c.phaseControl] !== values[c.phaseControl] || next[c.modeControl] !== values[c.modeControl]) {
            syncMechanismClock(m.clock, Number(next[c.phaseControl]), next[c.modeControl] === 'auto' ? 'auto' : 'manual');
            m.failed = false;
          }
        }
        values = next;
      }
      if (st.chapter !== prev.chapter || st.beat !== prev.beat || (st.transition.id !== prev.transition.id && (st.transition.reason === 'chapter' || st.transition.reason === 'url'))) bridge.resetMechanisms();
    });
    // Resolve only when controls change; no object allocation in the frame loop.
    controlValues.current = () => values;
    invalidate();
    return () => {
      unsubscribe();
      for (const m of machines) {
        bridge.mechanisms.delete(m.spec.id);
        for (const p of m.parts) runtime.mechanismParts.delete(p.id);
        for (const p of m.ports) { runtime.mechanismParts.delete(p.binding.part); runtime.mechanismGates.delete(p.key); }
      }
      bridge.seekMechanism = () => false;
      bridge.resetMechanisms = () => {};
      bridge.saveMechanisms = () => ({});
      bridge.restoreMechanisms = () => {};
    };
  }, [machines, runtime, store, ui, data.sim, bridge, invalidate]);

  const controlValues = useMemo(() => ({ current: () => data.sim ? resolveSimValues(data.sim, store.getState().sim) : {} }), [data.sim, store]);
  useFrame((state, delta) => {
    const st = store.getState();
    const values = controlValues.current();
    const protectedView = ui.getState().reference !== null || st.view === 'exploded' || runtime.explode > 0 || st.view === 'isolate' || st.solo !== null;
    for (const m of machines) {
      const c = m.spec.clock;
      let seek = m.reset;
      if (seek) {
        syncMechanismClock(m.clock, Number(values[c.phaseControl]), values[c.modeControl] === 'auto' ? 'auto' : 'manual', true);
        m.failed = false;
        m.reset = false;
      }
      if (m.restore) {
        restoreMechanismClock(m.clock, m.restore);
        m.restore = null;
        seek = true;
      }
      const experiment = values[c.experimentControl];
      const running = !m.failed && !m.clock.qaHold && !protectedView && st.run && values[c.modeControl] === 'auto' && (experiment === 'pressure' || experiment === 'mechanism') && !prefersReducedMotion() && !document.hidden;
      // A resumed demand loop has no elapsed physical time to make up. Its first
      // frame displays the preserved phase; only subsequent running deltas advance.
      advanceMechanismClock(m.clock, delta, Number(values[c.rateControl]), running && m.wasRunning && !seek);
      m.wasRunning = running;
      if (m.failed) continue;
      try {
        if (!m.restValid) { solveMechanism(0, m.spec.geometry, m.rest); m.restValid = true; }
        const f = solveMechanism(m.clock.thetaRad, m.spec.geometry, m.frame);
        const r = m.reading;
        r.thetaRad = f.thetaRad;
        r.phaseDeg = f.phaseDeg;
        r.cycles = f.cycles;
        r.pistonDirection = f.pistonDirection;
        r.planetAngleRad = f.planetAngleRad;
        r.sunAngleRad = f.sunAngleRad;
        r.shaftTurns = f.shaftTurns;
        r.linkResidualM = f.linkResidualM;
        r.clearanceMarginM = f.clearanceMarginM;
        for (const key in f.points) {
          const p = f.points[key as keyof typeof f.points];
          const out = r.points[key]!;
          out[0] = p[0] + m.spec.origin[0]; out[1] = p[1] + m.spec.origin[1]; out[2] = m.spec.origin[2];
        }
        for (const p of m.parts) {
          const pair = ROLE_ENDPOINTS[p.role as keyof typeof ROLE_ENDPOINTS];
          let rx: number, ry: number, x: number, y: number, angle = 0;
          if (pair) {
            const a = f.points[pair[0]], b = f.points[pair[1]], ra = m.rest.points[pair[0]], rb = m.rest.points[pair[1]];
            rx = (ra[0] + rb[0]) / 2; ry = (ra[1] + rb[1]) / 2;
            x = (a[0] + b[0]) / 2; y = (a[1] + b[1]) / 2;
            angle = Math.atan2(b[1] - a[1], b[0] - a[0]) - Math.atan2(rb[1] - ra[1], rb[0] - ra[0]);
          } else {
            const key = p.role === 'piston' ? 'S' : p.role === 'pumpPiston' ? 'W' : p.role === 'planet' ? 'P' : 'O';
            rx = m.rest.points[key][0]; ry = m.rest.points[key][1]; x = f.points[key][0]; y = f.points[key][1];
            angle = p.role === 'planet' ? f.planetAngleRad : p.role === 'sun' || p.role === 'shaft' || p.role === 'flywheel' ? f.sunAngleRad : 0;
          }
          p.entry.matrix.makeTranslation(x + m.spec.origin[0], y + m.spec.origin[1], 0)
            .multiply(translate.makeRotationZ(angle)).multiply(translate.makeTranslation(-rx - m.spec.origin[0], -ry - m.spec.origin[1], 0));
        }
        for (const p of m.ports) {
          const open = f.ports[p.role];
          const o = p.binding.openOffset;
          p.entry.matrix.makeTranslation(open ? o[0] : 0, open ? o[1] : 0, open ? o[2] : 0);
          runtime.mechanismGates.set(p.key, open);
          r.ports[p.role] = r.gates[p.key] = open;
        }
        if (m.drawnTheta !== f.thetaRad) { runtime.moved++; runtime.shadowDirty = true; m.drawnTheta = f.thetaRad; }
        if (ui.getState().mechanismError) ui.setState({ mechanismError: false });
        if (running) keepAnimating(state.invalidate);
      } catch {
        m.failed = true;
        for (const p of m.ports) {
          p.entry.matrix.identity();
          runtime.mechanismGates.set(p.key, false);
          m.reading.ports[p.role] = m.reading.gates[p.key] = false;
        }
        ui.setState({ mechanismError: true });
      }
    }
  }, -20);
  return null;
}
