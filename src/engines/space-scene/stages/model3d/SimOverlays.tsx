/** Topic-data dispatcher: importing the stage never imports unrelated overlay families. */
import { lazy, Suspense, useMemo } from 'react';
import type { SensesFrame } from '../../schema';
import type { SimData, SimOverlay, SimValues } from '../../sim-schema';
import { numberOf, type SimOutputs } from '../../lib/sim';
import { holds } from '../../lib/sim/bind';
import type { StageBridge } from '../../bridge';
import { resolveSimValues } from '../../lib/sim/controls';
import type { PartDisplay } from '../../lib/visibility';
import type { PartHandle } from './PartNode';
import type { StageLook } from './look';
import { StageMark } from './StageMark';

export { ARROW_LENGTH, ARROW_LIFT, arrowLength } from './arrowGeometry';

const EnergyBars = lazy(() => import('./EnergyBars'));
const ForceArrows = lazy(() => import('./ForceArrows'));
const ForceVectors = lazy(() => import('./ForceVectors'));
const CatalogueSky = lazy(() => import('./CatalogueSky').then(m => ({ default: m.CatalogueSky })));
const SensesOverlay = lazy(() => import('./SensesOverlays').then(m => ({ default: m.SensesOverlay })));
const SoundEchoPulse = lazy(() => import('./SoundEchoPulse').then(m => ({ default: m.SoundEchoPulse })));
const ShadowCast = lazy(() => import('./ShadowCast').then(m => ({ default: m.ShadowCast })));

export function SimOverlays({
  overlays,
  sim,
  values,
  outputs,
  handles,
  displays,
  layers,
  exploded,
  run,
  phaseKey,
  sensesFrame,
  look,
  snapKey,
  bridge,
}: {
  overlays: readonly SimOverlay[];
  sim: SimData;
  /** The store's set values (resolved here). */
  values: SimValues;
  outputs: SimOutputs;
  handles: Map<string, PartHandle>;
  displays: ReadonlyMap<string, PartDisplay>;
  /** Layers on (a force-vectors overlay's `group`). */
  layers: readonly string[];
  exploded: boolean;
  run: boolean;
  phaseKey: number;
  sensesFrame?: SensesFrame | null;
  look: StageLook;
  snapKey: number;
  bridge: StageBridge;
}) {
  const resolved = useMemo(() => resolveSimValues(sim, values), [sim, values]);
  const bars = useMemo(() => overlays.flatMap((o, index) => (o.kind === 'energy-bars' ? [{ overlay: o, index }] : [])), [overlays]);
  return (
    <Suspense fallback={null}>
      {bars.length > 0 && (
        <EnergyBars
          overlays={bars}
          sim={sim}
          values={resolved}
          outputs={outputs}
          handles={handles}
          displays={displays}
          exploded={exploded}
          look={look}
          snapKey={snapKey}
          bridge={bridge}
        />
      )}
      {overlays.map((o, i) => {
        if(o.kind==='catalogue-sky')return <CatalogueSky key={i} overlay={o} sim={sim} values={resolved} on={!exploded&&layers.includes(o.group)} look={look} bridge={bridge} handles={handles}/>;
        if (o.kind === 'microscope-field' || o.kind === 'energy-bars' || o.kind === 'orbit-guides' || o.kind === 'orbit-eclipse-shadow' || o.kind === 'airfoil-pressure') return null;
        if (o.kind === 'sound-echo-pulse') return <SoundEchoPulse key={i} overlay={o} bridge={bridge} look={look} />;
        if (o.kind === 'paraxial-eye' || o.kind === 'longitudinal-wave') return <SensesOverlay key={i} overlay={o} sim={sim} values={resolved} outputs={outputs} exploded={exploded} layers={layers} run={run} snapKey={snapKey} phaseKey={phaseKey} sensesFrame={sensesFrame} look={look} bridge={bridge} />;
        if (o.kind === 'shadow-cast') return <ShadowCast key={i} overlay={o} index={i} sim={sim} values={resolved} outputs={outputs} handles={handles} displays={displays} layers={layers} exploded={exploded} look={look} snapKey={snapKey} bridge={bridge} />;
        if (o.kind === 'force-vectors')
          return (
            <ForceVectors
              key={i}
              overlay={o}
              bridge={bridge}
              sim={sim}
              values={resolved}
              outputs={outputs}
              handles={handles}
              displays={displays}
              layers={layers}
              exploded={exploded}
              look={look}
              snapKey={snapKey}
            />
          );
        const w = o.when;
        const firstState = w?.output ? Object.keys(sim.outputs.find((x) => x.id === w.output)?.states ?? {})[0] : undefined;
        const when = !w || holds(w.is, w.control !== undefined ? resolved[w.control] : outputs[w.output!], firstState);
        const on = when && !exploded && o.between.every((id) => displays.get(id)?.visible === true);
        // A value that does not apply (NaN: a magnet off the bench) draws no arrows.
        const value = numberOf(outputs[o.output]);
        const ok = Number.isFinite(value);
        return <ForceArrows key={i} overlay={o} value={ok ? value : 0} on={on && ok} handles={handles} look={look} snapKey={snapKey} />;
      })}
      <StageMark bridge={bridge} name="overlays" />
    </Suspense>
  );
}
