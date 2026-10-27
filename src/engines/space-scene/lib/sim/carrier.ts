/**
 * Where the magnets are now (docs/22 §4.2; pure, unit-tested). A magnet with
 * a `part` rides on that part: its poles go wherever the stage puts the part
 * at the end of its move: the chapter / beat pose (or the pose a try-it
 * `pose` binding gives it instead), then the try-it turn (`rotate`, about its
 * `pivot` or the posed centre), then the try-it offset (`offset`, `at`), the
 * same stack as PartNode without explode, put-aside and animations. Bindings
 * driven by the magnet's own `move` / `flip` controls are left out: the model
 * moves and turns its poles for those itself. Only control-driven bindings
 * count (an output cannot move a magnet: the outputs come from where it is).
 *
 * The frames are worked out for the targets, not the eased in-between, so
 * the field is solved once per change (lib/sim/field.ts caches it per
 * place). Frames: lib/sim/frame.ts.
 */
import type { Primitive } from '../../schema';
import type { MatterPart } from '../../matter-schema';
import type { SimData, SimValues } from '../../sim-schema';
import { restTransform, toTransform, type TransformInput } from '../pose';
import { simEffects } from './bind';
import { frameKey, partFrame, type Frame, type MagnetFrames } from './frame';
import { evaluateSim, type SimOutputs } from './index';

const NO_FRAMES: MagnetFrames = new Map();

/** What the frames are worked out from: the parts' rest centres and the named poses (parts.json). */
export interface CarrierSource {
  parts: readonly { id: string; primitive?: Primitive | { at: readonly number[] } | undefined }[];
  poses?: Readonly<Record<string, { parts: Readonly<Record<string, TransformInput>> }>> | undefined;
}

/**
 * Where each magnet with a `part` is for these control values and the
 * chapter / beat `pose` on show (a part with a try-it `pose` binding takes
 * that instead, like the stage).
 */
export function magnetFrames(sim: SimData, source: CarrierSource, values: SimValues, pose: string | null): Map<string, Frame> {
  const out = new Map<string, Frame>();
  for (const m of sim.magnet?.magnets ?? []) {
    const id = m.part;
    if (id === undefined) continue;
    const names = (b: SimData['bind'][number]) => 'part' in b && (Array.isArray(b.part) ? b.part.includes(id) : b.part === id);
    const own = new Set([m.move?.control, m.flip?.control]);
    const bind = sim.bind.filter((b) => names(b) && b.control !== undefined && !own.has(b.control));
    const e = simEffects({ ...sim, bind }, values, {});
    // A mapped pose driven by the model's own move / flip is already applied
    // by that model. Only an unmapped value inherits the chapter / beat pose.
    const ownPose = sim.bind.some((b) => names(b) && b.control !== undefined && own.has(b.control) && 'pose' in b && b.pose?.[String(values[b.control])] !== undefined);
    const name = e.poses.has(id) ? (e.poses.get(id) ?? null) : ownPose ? null : pose;
    const entry = name ? source.poses?.[name]?.parts[id] : undefined;
    const centre = source.parts.find((p) => p.id === id)?.primitive?.at ?? [0, 0, 0];
    const f = partFrame(centre, entry ? toTransform(entry) : restTransform(), e.offset.get(id), e.rotate.get(id) ?? null);
    if (frameKey(f) !== '') out.set(m.id, f);
  }
  return out;
}

/** The model's outputs with the magnets where their parts are (`pose`: the chapter / beat pose on show), and those frames. */
export function evaluateSimOnStage(
  sim: SimData,
  source: CarrierSource,
  values: SimValues,
  pose: string | null,
  observe: readonly string[] = [],
): { outputs: SimOutputs; frames: MagnetFrames } {
  const frames = sim.magnet ? magnetFrames(sim, source, values, pose) : NO_FRAMES;
  // The matter model reads its liquids' primitives; the sort and port models their specimens' and boxes' homes (the parts as they are: one list, cached).
  const parts = sim.kind === 'matter' ? source.parts.map((p) => ({ id: p.id, ...(p.primitive && 'kind' in p.primitive ? { primitive: p.primitive } : {}) })) : sim.kind === 'sort' || sim.kind === 'port' ? (source.parts as unknown as readonly MatterPart[]) : [];
  return { outputs: evaluateSim(sim, values, observe, frames, parts), frames };
}
