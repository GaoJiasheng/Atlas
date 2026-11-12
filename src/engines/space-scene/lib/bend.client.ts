/** Browser facade for bend.ts: stages/model3d/kits.ts fetches the strip-bending maths only for topics whose try-it bends a part. */
import { kits } from '../stages/model3d/kits';
export { BEND_ATTRIBUTE, BEND_SLICES, bendAxisIndex } from './bend-axis';

type Bend = typeof import('./bend');
const bend = (): Bend => {
  if (!kits.bend) throw new Error('[atlas] space-scene: the bend kit is not loaded');
  return kits.bend;
};

export const bendLimit: Bend['bendLimit'] = (...args) => bend().bendLimit(...args);
export const newBendCurve: Bend['newBendCurve'] = () => bend().newBendCurve();
export const bendCurve: Bend['bendCurve'] = (...args) => bend().bendCurve(...args);
export const curveLength: Bend['curveLength'] = (c) => bend().curveLength(c);
export const bendFrame: Bend['bendFrame'] = (...args) => bend().bendFrame(...args);
export const bendVertices: Bend['bendVertices'] = (...args) => bend().bendVertices(...args);
export const curvePoint: Bend['curvePoint'] = (...args) => bend().curvePoint(...args);
