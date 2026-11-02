/** Shared scale for optional net pictures, independent of SVG rendering. */
import type { NetModelSpec } from '../schema';
import type { Rect } from './layout';
import { netItems, shapeOf, specPose, poseBounds, flatOutline, fitIn } from '../lib/net-view';

export function sharedUnit(models: NetModelSpec[], box: Rect): number {
  let s = Infinity;
  for (const m of models)
    for (const spec of netItems(m)) {
      const shape = shapeOf(spec);
      const pose = specPose(shape, spec);
      const b = poseBounds(shape, pose, spec.footprint ? flatOutline(shape) : []);
      if (b) s = Math.min(s, fitIn(b, box, 0.02).s);
    }
  return Number.isFinite(s) ? s : 1;
}
