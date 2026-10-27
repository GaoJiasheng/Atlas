import { withBase } from '../../../i18n';
import {
  packClimate,
  validateClimateResource,
  type ClimateData,
  type ClimateLoadState,
  type ClimateValidationContext,
  type MonthlyLayer,
} from './climate';

/** Cache belongs to one mounted topic. Retry is explicit; disposal suppresses pending results. */
export class ClimateLoader {
  readonly states = new Map<string, ClimateLoadState>();
  readonly loads: Record<string, number> = {};
  private cache = new Map<string, Promise<ClimateData>>();
  private versions = new Map<string, number>();
  private disposed = false;
  constructor(
    private context: Omit<ClimateValidationContext, 'quantity'>,
    private changed: () => void,
    private fetcher: typeof fetch = fetch,
  ) {}
  load(layer: MonthlyLayer, retry = false): void {
    if (this.disposed || (!retry && this.states.has(layer.id))) return;
    const key = `${layer.file}:1:${layer.periodId}`;
    if (retry) this.cache.delete(key);
    const version = (this.versions.get(layer.id) ?? 0) + 1;
    this.versions.set(layer.id, version);
    this.states.set(layer.id, { status: 'loading' });
    this.changed();
    let promise = this.cache.get(key);
    if (!promise) {
      this.loads[layer.file] = (this.loads[layer.file] ?? 0) + 1;
      promise = this.fetcher(withBase(`/geo/${layer.file}.json`)).then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return packClimate(
          validateClimateResource(await r.json(), {
            ...this.context,
            quantity: layer.quantity,
          }),
        );
      });
      this.cache.set(key, promise);
    }
    promise.then(
      (data) => {
        if (this.disposed || this.versions.get(layer.id) !== version) return;
        if (data.resource.kind !== `monthly-${layer.quantity}`) {
          this.states.set(layer.id, {
            status: 'error',
            error: 'kind must match layer quantity',
          });
          this.changed();
          return;
        }
        this.states.set(layer.id, { status: 'ready', data });
        this.changed();
      },
      (error: unknown) => {
        if (this.disposed || this.versions.get(layer.id) !== version) return;
        this.states.set(layer.id, {
          status: 'error',
          error: error instanceof Error ? error.message : String(error),
        });
        this.changed();
      },
    );
  }
  dispose() {
    this.disposed = true;
    this.cache.clear();
    this.states.clear();
    this.versions.clear();
  }
}
