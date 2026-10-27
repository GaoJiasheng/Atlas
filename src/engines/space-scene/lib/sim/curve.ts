/** Continuous display samples of an analytic model; no samples enter control state or student records. */
import type { SimData, SimOutput, SimTry, SimValues } from "../../sim-schema";
import { resolveSimValues } from "./controls";
import { solveHeatAt } from "./heat";

export type CurveSpec = NonNullable<SimTry["curve"]>;
export interface CurveSeries {
  output: SimOutput;
  points: readonly { x: number; y: number }[];
}
export interface CurveModel {
  x: string;
  domain: readonly [number, number];
  yDomain: readonly [0, 100];
  ticks: readonly number[];
  series: readonly CurveSeries[];
  table: readonly { x: number; values: Record<string, number> }[];
  /** A snapshot of conditions, excluding the cursor, for cache and diagnostics. */
  key: string;
}
export interface CurveCursor {
  x: number;
  values: Record<string, number>;
}
export interface CurveEvaluator {
  domain: readonly [number, number];
  sampleAt(seconds: number): Record<string, number>;
}

/** Models opt into continuous evaluation explicitly; the step-control validator remains unchanged. */
export function curveEvaluator(
  sim: SimData,
  values: SimValues,
  curve: CurveSpec,
): CurveEvaluator | null {
  const heat = sim.heat;
  const control = sim.controls.find((c) => c.id === curve.x);
  if (
    sim.kind !== "heat" ||
    !heat ||
    curve.x !== heat.time ||
    control?.kind !== "step"
  )
    return null;
  const ys = curve.y.map((id) => sim.outputs.find((o) => o.id === id));
  if (
    ys.some(
      (o) =>
        !o ||
        o.kind !== "number" ||
        o.unit !== "°C" ||
        !o.from?.startsWith("temperature:"),
    )
  )
    return null;
  return {
    domain: [control.values[0]!, control.values[control.values.length - 1]!],
    sampleAt: (seconds) => {
      const result = solveHeatAt(heat, values, seconds);
      return Object.fromEntries(
        ys.map((o) => [o!.id, Number(result[o!.from!])]),
      );
    },
  };
}

/** The cursor is deliberately absent: moving it performs one solve, never 101. */
export function curveCacheKey(
  sim: SimData,
  values: SimValues,
  curve: CurveSpec,
): string {
  const resolved = resolveSimValues(sim, values);
  return JSON.stringify([
    curve.x,
    curve.y,
    curve.samples ?? 101,
    Object.keys(resolved)
      .filter((id) => id !== curve.x)
      .sort()
      .map((id) => [id, resolved[id]]),
  ]);
}

// Bounded per-model cache: old topics and their samples can be garbage collected.
const cache = new WeakMap<SimData, Map<string, CurveModel>>();
export function curveModel(
  sim: SimData,
  values: SimValues,
  curve: CurveSpec,
): CurveModel | null {
  const key = curveCacheKey(sim, values, curve);
  let entries = cache.get(sim);
  const found = entries?.get(key);
  if (found) return found;
  const evaluator = curveEvaluator(sim, resolveSimValues(sim, values), curve);
  if (!evaluator) return null;
  const samples = curve.samples ?? 101;
  if (!Number.isInteger(samples) || samples < 33 || samples > 201) return null;
  const [start, end] = evaluator.domain;
  const points = Array.from({ length: samples }, (_, i) => {
    const x =
      i === samples - 1 ? end : start + ((end - start) * i) / (samples - 1);
    return { x, values: evaluator.sampleAt(x) };
  });
  const model: CurveModel = {
    x: curve.x,
    domain: evaluator.domain,
    yDomain: [0, 100],
    ticks: Array.from({ length: 6 }, (_, i) => start + ((end - start) * i) / 5),
    table: Array.from({ length: 6 }, (_, i) => { const x = start + ((end - start) * i) / 5; return { x, values: evaluator.sampleAt(x) }; }),
    series: curve.y.map((id) => ({
      output: sim.outputs.find((o) => o.id === id)!,
      points: points.map((p) => ({ x: p.x, y: p.values[id]! })),
    })),
    key,
  };
  if (!entries) {
    entries = new Map();
    cache.set(sim, entries);
  }
  if (entries.size >= 24) entries.delete(entries.keys().next().value!);
  entries.set(key, model);
  return model;
}

export function curveCursor(
  sim: SimData,
  values: SimValues,
  curve: CurveSpec,
): CurveCursor | null {
  const resolved = resolveSimValues(sim, values);
  const evaluator = curveEvaluator(sim, resolved, curve);
  const x = Number(resolved[curve.x]);
  return evaluator ? { x, values: evaluator.sampleAt(x) } : null;
}

export function curveSummary(model: CurveModel, locale: "en" | "zh"): string {
  const zh = locale === "zh";
  const series = model.series.map(({ output, points }) => {
    const first = points[0]!;
    const last = points[points.length - 1]!;
    const delta = last.y - first.y;
    const trend =
      Math.abs(delta) < 1e-9
        ? zh
          ? "保持不变"
          : "stays constant"
        : delta > 0
          ? zh
            ? "上升"
            : "rises"
          : zh
            ? "下降"
            : "falls";
    return zh
      ? `${output.label.zh}${trend}：${first.x} s 时 ${first.y.toFixed(1)} °C，${last.x} s 时 ${last.y.toFixed(1)} °C`
      : `${output.label.en} ${trend}: ${first.y.toFixed(1)} °C at ${first.x} s to ${last.y.toFixed(1)} °C at ${last.x} s`;
  });
  return `${zh ? "模型曲线。模型预计：" : "Model curve. The model predicts: "}${series.join(zh ? "；" : "; ")}.`;
}

/** Read-only numeric test diagnostics, independent of SVG and display formatting. */
export function curveDiagnostics(
  sim: SimData,
  values: SimValues,
  curve: CurveSpec,
) {
  const model = curveModel(sim, values, curve);
  if (!model) return null;
  return {
    x: model.x,
    domain: [...model.domain],
    series: model.series.map((s) => ({
      id: s.output.id,
      points: s.points.map((p) => ({ ...p })),
    })),
    cursor: curveCursor(sim, values, curve),
  };
}
