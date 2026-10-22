/**
 * Speed checks that hold on a loaded machine: after a warm-up, `fn` is timed in
 * many short batches and the cost of one call is that of the fastest batch.
 * A batch lasts a few milliseconds at most, so some run without the scheduler
 * handing the core to another process (other Vitest workers, a browser suite):
 * the result measures the work, not the load. Each test's budget stays fixed.
 */
export function msPerCall(fn: () => unknown, batch: number, batches = 40): number {
  for (let i = 0; i < batch * 4; i++) fn();
  let best = Infinity;
  for (let b = 0; b < batches; b++) {
    const t0 = performance.now();
    for (let i = 0; i < batch; i++) fn();
    best = Math.min(best, performance.now() - t0);
  }
  return best / batch;
}
