/** Apply numeric overrides to a pose/exercise without changing either input. */
import type { Angles } from '../rig';

export function overrideJoints(base: ReadonlyMap<string, Angles>, overrides?: ReadonlyMap<string, Angles>): Map<string, Angles> {
  const out = new Map(base);
  for (const [joint, angles] of overrides ?? []) out.set(joint, { ...(base.get(joint) ?? {}), ...angles });
  return out;
}
