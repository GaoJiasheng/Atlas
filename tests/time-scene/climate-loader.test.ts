import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { ClimateLoader } from '../../src/engines/time-scene/lib/climateLoader';
const body = JSON.parse(readFileSync(new URL('../../public/geo/sample-climate-fixture-wind.json', import.meta.url), 'utf8'));
const layer = {
  id: 'fixture-wind',
  type: 'monthly-climatology' as const,
  quantity: 'wind' as const,
  file: 'sample-climate-fixture-wind',
  label: { en: 'Fixture', zh: '测试' },
  periodId: 'clim-1991-2020',
  sources: ['S101'],
};
const context = { periodId: 'clim-1991-2020', startYear: 1991, endYear: 2020 };
const settle = async () => {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
};
describe('per mount resource caching and failure isolation', () => {
  it('fetches once across any month reads, retries only explicitly', async () => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify(body)));
    const loader = new ClimateLoader(context, () => {}, fetcher as typeof fetch);
    loader.load(layer);
    await settle();
    await new Promise((r) => setTimeout(r, 0));
    expect(loader.states.get(layer.id)?.status).toBe('ready');
    for (let month = 1; month <= 12; month++) loader.load(layer);
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(loader.loads[layer.file]).toBe(1);
    loader.load(layer, true);
    await settle();
    expect(fetcher).toHaveBeenCalledTimes(2);
    loader.dispose();
  });

  it('a late first request cannot overwrite an explicit successful retry', async () => {
    const requests: ((response: Response) => void)[] = [];
    const loader = new ClimateLoader(
      context,
      () => {},
      vi.fn(() => new Promise<Response>((resolve) => requests.push(resolve))) as typeof fetch,
    );
    loader.load(layer);
    loader.load(layer, true);
    requests[1]!(new Response(JSON.stringify(body)));
    await new Promise((r) => setTimeout(r, 0));
    expect(loader.states.get(layer.id)?.status).toBe('ready');
    requests[0]!(new Response('', { status: 500 }));
    await new Promise((r) => setTimeout(r, 0));
    expect(loader.states.get(layer.id)?.status).toBe('ready');
    expect(loader.loads[layer.file]).toBe(2);
    loader.dispose();
  });
  it('keeps failures explicit and does not refill a disposed mount', async () => {
    const changed = vi.fn();
    const loader = new ClimateLoader(context, changed, vi.fn(async () => new Response('', { status: 500 })) as typeof fetch);
    loader.load(layer);
    await settle();
    expect(loader.states.get(layer.id)?.status).toBe('error');
    loader.load(layer);
    expect(loader.loads[layer.file]).toBe(1);
    let finish!: (response: Response) => void;
    const pending = new ClimateLoader(
      context,
      () => {},
      vi.fn(
        () =>
          new Promise<Response>((resolve) => {
            finish = resolve;
          }),
      ) as typeof fetch,
    );
    pending.load(layer);
    pending.dispose();
    finish(new Response(JSON.stringify(body)));
    await settle();
    expect(pending.states.size).toBe(0);
    loader.dispose();
  });
});
