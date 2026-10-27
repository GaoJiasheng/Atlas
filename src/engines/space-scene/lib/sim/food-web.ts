/** Read the existing table outputs for the directed plate. No graph solving at runtime. */
import type { FoodWebData } from '../../food-web-schema';
import type { SimOutputs } from './index';
import type { SimValues } from '../../sim-schema';

export function foodWebModel(web: FoodWebData, outputs: SimOutputs, values: SimValues, selected: string | null) {
  return {
    nodes: web.nodes.map((node) => {
      const status = String(outputs[node.output]);
      return { ...node, status, present: status !== 'removed', supported: status === 'unchanged' || status === 'fewer-foods', inspect: values[web.inspect] === node.id, selected: selected !== null && node.parts.includes(selected) };
    }),
    edges: web.edges.map((edge) => ({ ...edge, active: outputs[edge.output] === 1 })),
  };
}

/** Reserve space for wrapped node labels and inspect/selected lines; crop arrows to the cards; viewBox coordinates, no force layout. */
export function foodEdgePath(from: readonly number[], to: readonly number[]): string {
  const x = (to[0]! - from[0]!) * 320;
  const y = (to[1]! - from[1]!) * 380;
  // First rectangle boundary crossed, including vertical or horizontal links.
  const start = Math.min(0.45, Math.min(Math.abs(x) > 0 ? 72 / Math.abs(x) : Infinity, Math.abs(y) > 0 ? 40 / Math.abs(y) : Infinity));
  return `M${from[0]! * 320 + x * start},${from[1]! * 380 + y * start}L${to[0]! * 320 - x * start},${to[1]! * 380 - y * start}`;
}
