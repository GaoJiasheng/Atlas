import type { AirfoilData } from '../../airfoil-schema';
import type { SimValues } from '../../sim-schema';
import { solveAirfoil } from './airfoil';
import { emptyField, traceAirfoil, type AirfoilField } from './airfoil-field';
export const AIRFOIL_FIELD_VERSION = 'joukowski-rk4-tau-v1';
export interface AirfoilSnapshot {
  version: number;
  inputKey: string;
  field: AirfoilField | null;
  fieldReady: boolean;
}
export const airfoilInputKey = (d: AirfoilData, v: SimValues) =>
  JSON.stringify([
    AIRFOIL_FIELD_VERSION,
    d.model,
    d.profile.epsilon,
    v[d.angle],
    v[d.speed],
    d.atmosphere.kind === 'constant'
      ? d.atmosphere.density
      : v[d.atmosphere.altitude],
    d.chord,
    d.area,
  ]);
/** Instance owned by a mounted topic. Stale tasks can never publish. Cached paths are nondimensional. */
export class AirfoilCache {
  private version = 0;
  private cache = new Map<number, AirfoilField>();
  private pending = new Map<number, Promise<AirfoilField>>();
  private disposed = false;
  private async trace(angle: number): Promise<AirfoilField> {
    const gen = traceAirfoil(angle);
    for (;;) {
      const start = performance.now();
      let r = gen.next();
      while (!r.done && performance.now() - start < 4) r = gen.next();
      if (r.done) return r.value;
      if (this.disposed) {
        gen.return(emptyField('still', angle));
        return emptyField('still', angle);
      }
      await new Promise<void>((resolve) => setTimeout(resolve, 0));
    }
  }
  async request(
    d: AirfoilData,
    v: SimValues,
    publish: (s: AirfoilSnapshot) => void,
  ): Promise<void> {
    const version = ++this.version,
      inputKey = airfoilInputKey(d, v),
      s = solveAirfoil(d, v);
    publish({ version, inputKey, field: null, fieldReady: false });
    if (s.mode !== 'ideal-attached') {
      publish({
        version,
        inputKey,
        field: emptyField(s.mode, s.angle),
        fieldReady: true,
      });
      return;
    }
    let field = this.cache.get(s.angle);
    if (!field) {
      let work = this.pending.get(s.angle);
      if (!work) {
        work = this.trace(s.angle);
        this.pending.set(s.angle, work);
      }
      field = await work;
      this.pending.delete(s.angle);
      if (this.disposed) return;
      this.cache.set(s.angle, field);
      while (this.cache.size > 11)
        this.cache.delete(this.cache.keys().next().value!);
    }
    if (!this.disposed && version === this.version)
      publish({ version, inputKey, field, fieldReady: true });
  }
  dispose() {
    this.disposed = true;
    this.version++;
    this.cache.clear();
    this.pending.clear();
  }
}
