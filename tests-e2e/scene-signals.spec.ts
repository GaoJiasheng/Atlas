/** Unit tests for the synchronization helpers: no browser or page fixture. */
import { expect, test, type Page } from '@playwright/test';
import { poll, sceneFrame, sceneReady, signalTimeout } from './scene-signals';

test('signal budgets follow the test timeout used for loaded runs', () => {
  test.setTimeout(60_000);
  expect(signalTimeout()).toBe(30_000);
  test.setTimeout(120_000);
  expect(signalTimeout()).toBe(60_000);
  test.setTimeout(240_000);
  expect(signalTimeout()).toBe(120_000);
});

test('ready waits for the resolved app signal and rejects a failed load', async () => {
  let resolve!: (ready: boolean) => void;
  const ready = new Promise<boolean>(done => { resolve = done; });
  let evaluated = false, finished = false;
  const page = {
    waitForFunction: async () => undefined,
    evaluate: () => { evaluated = true; return ready; },
  } as unknown as Page;
  const waiting = sceneReady(page).then(() => { finished = true; });
  await poll(() => evaluated).toBe(true);
  expect(finished).toBe(false);
  resolve(true);
  await waiting;
  expect(finished).toBe(true);

  const failed = {
    waitForFunction: async () => undefined,
    evaluate: async () => false,
  } as unknown as Page;
  await expect(sceneReady(failed)).rejects.toThrow();
});

test('advancing browser time alone is insufficient without a new app frame', async () => {
  let lastFrame = 100;
  const advances: number[] = [];
  const page = {
    evaluate: async () => lastFrame,
    clock: {
      runFor: async (ms: number) => {
        advances.push(ms);
        // Simulate two browser ticks before the demand renderer submits.
        if (advances.length === 3) lastFrame = 148;
      },
    },
  } as unknown as Page;
  await sceneFrame(page);
  expect(advances).toEqual([16, 16, 16]);
  expect(lastFrame).toBe(148);
});
