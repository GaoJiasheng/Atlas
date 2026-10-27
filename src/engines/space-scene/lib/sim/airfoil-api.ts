import type { PartsFile, SpaceChapterState } from '../../schema';
import type { SpaceSceneExt } from '../../index';
import type { SceneStore } from '../../../core/store';
import type { Chapter } from '../../../core/types';
import type { SpaceUiStore } from '../../ui';
import type { StageBridge } from '../../bridge';
import { resolveSimValues } from './controls';
import { airfoilPlot, airfoilRecordSignature, solveAirfoil } from './airfoil';
import { airfoilInputKey } from './airfoil-cache';
import { airfoilProbe } from './airfoil-field';
export function airfoilApi(
  file: PartsFile,
  store: SceneStore<SpaceSceneExt>,
  ui: SpaceUiStore,
  bridge: StageBridge,
  chapters: readonly Chapter[],
) {
  const current = () => {
    const sim = file.sim,
      d = sim?.airfoil;
    if (!sim || !d) return null;
    const st = store.getState(),
      values = resolveSimValues(sim, st.sim),
      s = solveAirfoil(d, values),
      inputKey = airfoilInputKey(d, values),
      snapshot = ui.getState().airfoil,
      field = snapshot?.inputKey === inputKey ? snapshot.field : null;
    return { sim, d, st, values, s, inputKey, snapshot, field };
  };
  return {
    airfoil: () => {
      const c = current();
      if (!c) return null;
      const { sim, d, st, values, s, inputKey, snapshot, field } = c,
        card = (
          chapters.find((c) => c.id === st.chapter)?.state as
            SpaceChapterState | undefined
        )?.sim?.try,
        from = sim.outputs.find((o) => o.id === d.plot.y)?.from as
          'cl' | 'lift-n';
      return {
        model: d.model,
        mode: s.mode,
        angle: s.angle,
        speed: s.speed,
        rho: s.rho,
        cl: s.cl,
        lift: s.lift,
        fieldReady: !!field,
        version: snapshot?.version ?? 0,
        inputKey,
        pathCount: field?.paths.length ?? 0,
        pathStatuses:
          field?.paths.map((p) => ({ id: p.id, status: p.status })) ?? [],
        pressureCount: field?.pressure?.length ?? 0,
        pulseTime: bridge.airfoilPulse,
        arrowDirections: [...bridge.airfoilArrows.values()]
          .filter((a) => a.shown)
          .map((a) => ({ force: a.force, dir: [...a.dir], scaled: a.scaled })),
        plot: airfoilPlot(d, values, from ?? 'cl'),
        recordSignature: card
          ? airfoilRecordSignature(d, values, card.vary)
          : null,
      };
    },
    airfoilProbe: ({ x, y }: { x: number; y: number }) => {
      const c = current();
      return airfoilProbe(x, y, c?.s.angle ?? 0, c?.field ? c.s.mode : 'still');
    },
    // Test/development hosts only. Copies are made on request, never retained by the runtime.
    airfoilSamples: () => {
      if (
        !import.meta.env.DEV &&
        !['localhost', '127.0.0.1', '[::1]'].includes(location.hostname)
      )
        return null;
      const c = current();
      return c?.field
        ? {
            paths: c.field.paths.map((p) => ({
              id: p.id,
              status: p.status,
              xy: Array.from(p.xy),
              tau: Array.from(p.tau),
            })),
            pressure:
              c.field.pressure?.map((p) => ({ ...p, xy: [...p.xy] })) ?? null,
          }
        : null;
    },
  };
}
