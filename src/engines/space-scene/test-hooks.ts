/** Development / local QA hooks, fetched only on existing test/development hosts. */
import type { Chapter } from '../core/types';
import type { SceneStore } from '../core/store';
import type { SpaceSceneExt } from './index';
import type { PartsFile, SpaceChapterState } from './schema';
import type { SpaceUiStore } from './ui';
import type { StageBridge } from './bridge';
import { EXERCISE_BODIES, type ExerciseBody } from '../../lib/anatomy';
import { resolveSimValues, isControlValue } from './lib/sim/controls';
import { evaluateSimOnStage } from './lib/sim/carrier';
import { curveDiagnostics } from './lib/sim/curve';
import { tableSources } from './lib/sim/table';
import { microscopeFieldReading } from './lib/sim/microscope';
import { orbitPanelReading } from './hud/OrbitCard';
import type { OrbitSession } from './lib/sim/orbit-session';
import { airfoilApi } from './lib/sim/airfoil-api';
import { setSim } from './hud/sim';
export function createSpaceTestHooks(file: PartsFile, store: SceneStore<SpaceSceneExt>, ui: SpaceUiStore, bridge: StageBridge, chapters: readonly Chapter[], orbitSession: OrbitSession | null) {
  return {
        exercisePhase: (phase: 'start' | 'end' | 'loop') => {
          const ex = store.getState().exercise;
          if (!ex) return false;
          store.getState().applyState({ exercise: { ...ex, phase } }, { instant: true });
          return true;
        },
        // QA: jump to any scene state (camera, hidden, cutaway, layers, view …), e.g. a realism-round camera next to a reference photo.
        apply: (patch: Parameters<ReturnType<typeof store.getState>['applyState']>[0]) => {
          store.getState().applyState(patch, { instant: true });
          return true;
        },
        // Try-it (docs/06 「SpaceScene · 试一试」): the values on show, what was set, the outputs, the card and its table.
        // Orbit sims (docs/44 §4.10): the shared snapshot (physical km, display m), what the stage really drew, the observation window; NaN → null.
        orbit: () => {
          const o = orbitSession;
          if (!o) return null;
          const reading = {
            snapshotId: o.id,
            timeSeconds: o.clock.elapsedSeconds,
            running: o.clock.running,
            lab: o.snapshot.lab,
            scale: o.values[o.config.display.scale],
            physical: { bodies: o.snapshot.bodies, axis: o.snapshot.axis, solarDirections: o.snapshot.solarDirections },
            display: o.display,
            rendered: bridge.orbitRendered ?? null,
            panel: orbitPanelReading(o),
          };
          return JSON.parse(JSON.stringify(reading, (_key, value) => (typeof value === 'number' && !Number.isFinite(value) ? null : value)));
        },
        orbitSeek: (seconds: number) => orbitSession?.seek(seconds) ?? false,
        sim: () => {
          const sim = file.sim;
          if (!sim) return null;
          const st = store.getState();
          const values = resolveSimValues(sim, st.sim);
          const state = chapters.find((c) => c.id === st.chapter)?.state as SpaceChapterState | undefined;
          const card = state?.sim?.try ?? null;
          // Timelines: where each run is on the stage (model seconds), whether it plays, and how many times slowed down.
          const timeline = Object.fromEntries(
            [...bridge.playback].map(([id, p]) => [id, { t: Math.round(p.t * 1000) / 1000, duration: Math.round(p.timeline.duration * 1000) / 1000, playing: p.playing, slow: p.timeline.slow }]),
          );
          return {
            values,
            set: { ...st.sim },
            outputs: orbitSession?.outputs ?? evaluateSimOnStage(sim, file, values, st.pose, card?.observe).outputs,
            try: card,
            table: ui.getState().simTables[st.chapter ?? ''] ?? [],
            ...(card?.curve ? { curve: curveDiagnostics(sim, values, card.curve) } : {}),
            tableContext: ui.getState().simTableContexts[st.chapter ?? ''] ?? null,
            prediction: ui.getState().simPredict,
            reveal: ui.getState().simReveal,
            timeline,
            replays: ui.getState().simReplay.n,
            // An orbit model: the computed table's source for its local-* readings, the model's sources for the rest.
            ...(orbitSession ? { sources: Object.fromEntries(sim.outputs.map((o) => [o.id, (o.from ?? o.id).startsWith('local-') ? ['S33'] : orbitSession.config.sources])) } : {}),
            // A table model (docs/40 §4.2): the sources of the row each typical output comes from now.
            ...(sim.table ? { sources: Object.fromEntries(Object.entries(tableSources(sim.table, values)).filter(([id]) => sim.outputs.find((o) => o.id === id)?.tag === 'typical')) } : {}),
          };
        },
        microscopeField: () => file.sim?.microscope ? microscopeFieldReading(file.sim.microscope, resolveSimValues(file.sim, store.getState().sim)) : null,
        solarSystem: () => file.sim?.solarSystem ? {sky:bridge.solarSky??{status:'loading'},outputs:evaluateSimOnStage(file.sim,file,resolveSimValues(file.sim,store.getState().sim),store.getState().pose).outputs,scales:Object.fromEntries(bridge.scales)} : null,
        scale: (id:string) => bridge.scales.get(id) ?? null,
        senses: () => bridge.senses,
        /** The measured free HUD band the hudFrame camera fits into (stage CSS px), or null. */
        freeStage: () => (bridge.freeStage ? { ...bridge.freeStage } : null),
        sensesSeek: (cycles: number) => bridge.sensesSeek(cycles),
        sensesEchoSeek: (u: number) => bridge.sensesEchoSeek(u),
        joint: (id: string) => { const j = bridge.joints.get(id); return j ? structuredClone(j) : null; },
        ...(file.sim?.airfoil ? airfoilApi(file,store,ui,bridge,chapters) : {}),
        shadows: () => Object.fromEntries(bridge.shadows),
        mechanism: (id: string) => {
          const m = bridge.mechanisms.get(id);
          return m ? structuredClone(m) : null;
        },
        seekMechanism: (id: string, deg: number) => bridge.seekMechanism(id, deg),
        // Copies of a counted `repeat` part drawn now (a `count` binding: the balls of a table's per cents); null without one.
        copies: (id: string) => bridge.copies.get(id) ?? null,
        // A try-it tint drawn now (docs/41 E-S1: a cup's pale seedlings): the colour it blends toward and how far (0–1, 3 decimals); null without a tint binding.
        tint: (id: string) => {
          const t = bridge.tints.get(id);
          return t ? { color: t.color, level: Math.round(t.level * 1000) / 1000 } : null;
        },
        // An animation now (docs/40 §4.3): its frequency (Hz, 4 decimals), cycle phase (0–1) and how far it is switched on; null before the stage draws it.
        animation: (id: string) => {
          const a = bridge.animations.get(id);
          const r = (x: number) => Math.round(x * 1e4) / 1e4;
          return a ? { hz: r(a.hz), phase: r(a.phase), on: r(a.on) } : null;
        },
        flow: (id: string) => {
          const paths = bridge.flowPaths.get(id);
          const pace = bridge.flowPace.get(id);
          return paths ? { paths: Object.fromEntries(Object.entries(paths).map(([key, value]) => [key, { ...value }])), ...(pace !== undefined ? { pace } : {}) } : null;
        },
        fillBenchmark: (id: string) => bridge.fillBenchmarks.get(id)?.() ?? null,
        fill: (id: string) => {
          const f = bridge.fills.get(id);
          return f ? { ...f } : null;
        },
        // A bent strip (docs/37 §4.5): the drawn sag / drop (m), its middle and free end now (model coordinates), its centre line's length.
        bend: (id: string) => {
          const b = bridge.bends.get(id);
          return b ? { value: b.value, mid: [...b.mid], tip: [...b.tip], length: b.length, shown: b.shown } : null;
        },
        // A shifted part now (docs/38 §4.3): its drawn offset, its target (scene units, to 0.1 mm), whether it is drawn and how long its move waited (s); null without a shift.
        shift: (id: string) => {
          const r = bridge.shifts.get(id);
          const mm = (v: readonly number[]) => v.map((x) => Math.round(x * 1e4) / 1e4);
          return r ? { offset: mm(r.offset), target: mm(r.target), shown: r.shown, delay: Math.round(r.delay * 1000) / 1000 } : null;
        },
        span: (id: string) => {
          const r = bridge.spans.get(id);
          return r ? { from: [...r.from], to: [...r.to], centre: [...r.centre], length: r.length, shown: r.shown, matrix: [...r.matrix] } : null;
        },
        // Energy bars on the stage (docs/31 E-EN6): per timeline output, the three bars now (potential + kinetic + lost = 100) and whether they show.
        energyBars: () =>
          Object.fromEntries(
            [...bridge.energyBars.values()].map((b) => [b.timeline, { potential: Math.round(b.potential * 1000) / 1000, kinetic: Math.round(b.kinetic * 1000) / 1000, lost: Math.round(b.lost * 1000) / 1000, shown: b.shown }]),
          ),
        // QA: where part `id`'s label anchor is on the stage now (stage CSS px; follows pose, try-it offsets and timeline runs); null before the stage draws it.
        anchor: (id: string) => {
          const a = bridge.anchors.get(id);
          return a ? { x: Math.round(a.x * 10) / 10, y: Math.round(a.y * 10) / 10, shown: a.shown, onScreen: a.onScreen } : null;
        },
        // QA: hold timeline output `id` at model time `t` (s); false if the stage has no such run.
        simSeek: (id: string, t: number) => {
          if (!bridge.playback.has(id) || !Number.isFinite(t)) return false;
          const prev = ui.getState().simSeek;
          ui.setState({ simSeek: { id, t, n: (prev?.n ?? 0) + 1 } });
          return true;
        },
        // Set controls as the reader would (one at a time, through the choices' `sets`); false if one is not a control value.
        setSim: (values: Record<string, boolean | number | string>) => {
          const sim = file.sim;
          if (!sim) return false;
          let ok = true;
          for (const [id, v] of Object.entries(values)) {
            const c = sim.controls.find((x) => x.id === id);
            if (!c || !isControlValue(c, v)) ok = false;
            else setSim(store, sim, id, v);
          }
          return ok;
        },
        // QA: hold a pose of parts.json (null = rest).
        pose: (name: string | null) => {
          if (name !== null && !(file.poses && name in file.poses)) return false;
          store.getState().applyState({ pose: name, exercise: null }, { instant: true });
          return true;
        },
        // QA: draw exercise mode's body as `wire`, `mannequin` or `ghost` (null = the data's `views.exerciseBody`).
        exerciseBody: (style: ExerciseBody | null) => {
          if (style !== null && !(EXERCISE_BODIES as readonly string[]).includes(style)) return false;
          ui.setState({ exerciseBody: style });
          return true;
        },
  };
}
