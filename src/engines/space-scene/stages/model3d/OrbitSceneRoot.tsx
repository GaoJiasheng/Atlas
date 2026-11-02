/** Orbital topics share one physical snapshot across stage, cards and readings. */
import { getOrbitSession } from '../../lib/sim/orbit-session';
import { SceneGraph, type SceneRootProps } from './SceneRoot';

export default function OrbitSceneRoot(props: SceneRootProps) {
  return <SceneGraph {...props} orbitSession={getOrbitSession(props.store, props.data.sim!)} />;
}
