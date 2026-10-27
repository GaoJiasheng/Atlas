/** Analytic model trajectories, separate from the student's explicitly recorded rows. */
import { useEffect, useRef, useState } from "react";
import { useSceneContext, useT } from "../../core/context";
import { tx } from "../../../i18n";
import type { SimData, SimValues } from "../sim-schema";
import {
  curveCursor,
  curveModel,
  curveSummary,
  type CurveSpec,
} from "../lib/sim/curve";
import { outputText } from "../lib/sim/text";
import { setSim, useSimStore } from "../hud/sim";

const W = 340;
const H = 198;
const P = { l: 34, r: 12, t: 18, b: 38 };
const DASH = ["", "5 3", "2 3"];
const round = (n: number) => Math.round(n * 100) / 100;

export function TryCurve({
  sim,
  values,
  curve,
}: {
  sim: SimData;
  values: SimValues;
  curve: CurveSpec;
}) {
  const t = useT();
  const { locale } = useSceneContext();
  const store = useSimStore();
  const model = curveModel(sim, values, curve);
  const cursor = curveCursor(sim, values, curve);
  const [announcement, setAnnouncement] = useState("");
  const previous = useRef("");
  const current =
    cursor && model
      ? `${cursor.x} s · ${model.series.map((s) => `${tx(s.output.label, locale)} ${outputText(s.output, cursor.values[s.output.id], locale)} °C`).join(" · ")}`
      : "";
  // Do not announce the 101 samples or speak on mount; speak only a changed current reading.
  useEffect(() => {
    if (previous.current && previous.current !== current)
      setAnnouncement(current);
    previous.current = current;
  }, [current]);
  if (!model || !cursor) return null;
  const [start, end] = model.domain;
  const sx = (x: number) =>
    P.l + ((x - start) / (end - start)) * (W - P.l - P.r);
  const sy = (y: number) => P.t + (1 - y / 100) * (H - P.t - P.b);
  return (
    <figure className="space-chart space-curve" data-model-curve="">
      <figcaption className="space-chart__title">
        {t("space.try.curve")}
        {model.series.map((s, k) => (
          <span className="space-chart__key" key={s.output.id}>
            <svg width="16" height="10" aria-hidden="true">
              <path
                className="space-chart__line"
                strokeDasharray={DASH[k] || undefined}
                d="M0 5h16"
              />
            </svg>
            {tx(s.output.label, locale)}
          </span>
        ))}
      </figcaption>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="space-chart__svg"
        role="img"
        aria-label={curveSummary(model, locale)}
      >
        <title>{t("space.try.curve")}</title>
        <text className="space-chart__axis-title" x={P.l} y={10}>
          °C
        </text>
        {[0, 25, 50, 75, 100].map((y) => (
          <g key={y}>
            <path
              className={y === 0 ? "space-chart__axis" : "space-chart__grid"}
              d={`M${P.l} ${sy(y)}H${W - P.r}`}
            />
            <text
              className="space-chart__tick"
              x={P.l - 5}
              y={sy(y) + 3}
              textAnchor="end"
            >
              {y}
            </text>
          </g>
        ))}
        <path className="space-chart__axis" d={`M${P.l} ${P.t}V${H - P.b}`} />
        {model.ticks.map((x) => (
          <g key={x}>
            <path className="space-chart__axis" d={`M${sx(x)} ${H - P.b}v4`} />
            <text
              className="space-chart__tick"
              x={sx(x)}
              y={H - P.b + 15}
              textAnchor="middle"
            >
              {round(x)}
            </text>
          </g>
        ))}
        <text
          className="space-chart__axis-title"
          x={(W + P.l - P.r) / 2}
          y={H - 5}
          textAnchor="middle"
        >
          {t("space.try.elapsed")}
        </text>
        {model.series.map((s, k) => (
          <polyline
            key={s.output.id}
            data-series={s.output.id}
            className="space-chart__line"
            strokeDasharray={DASH[k] || undefined}
            points={s.points
              .map((p) => `${round(sx(p.x))},${round(sy(p.y))}`)
              .join(" ")}
          />
        ))}
        <path
          className="space-curve__cursor"
          d={`M${sx(cursor.x)} ${P.t}V${H - P.b}`}
        />
        {model.series.map((s, k) => {
          const x = sx(cursor.x);
          const y = sy(cursor.values[s.output.id]!);
          return k === 1 ? (
            <rect
              key={s.output.id}
              className="space-chart__mark space-chart__mark--now"
              x={x - 3}
              y={y - 3}
              width={6}
              height={6}
            />
          ) : k === 2 ? (
            <path
              key={s.output.id}
              className="space-chart__mark space-chart__mark--now"
              d={`M${x} ${y - 4}l4 7h-8Z`}
            />
          ) : (
            <circle
              key={s.output.id}
              className="space-chart__mark space-chart__mark--now"
              cx={x}
              cy={y}
              r={3.5}
            />
          );
        })}
      </svg>
      <p className="space-curve__current" data-curve-cursor={cursor.x}>
        {current}
      </p>
      <p className="space-curve__summary">{curveSummary(model, locale)}</p>
      <span
        className="space-curve__announce"
        aria-live="polite"
        aria-atomic="true"
      >
        {announcement}
      </span>
      <button
        type="button"
        className="space-try__opt"
        data-curve-zero=""
        onClick={() => setSim(store, sim, curve.x, start)}
        disabled={cursor.x === start}
      >
        {t("space.try.zero")}
      </button>
      <details className="space-curve__values">
        <summary>{t("space.try.modelTable")}</summary>
        <table className="space-try__table">
          <caption>{t("space.try.modelTable")}</caption>
          <thead>
            <tr>
              <th scope="col">{t("space.try.elapsed")}</th>
              {model.series.map((s) => (
                <th scope="col" key={s.output.id}>
                  {tx(s.output.label, locale)} (°C)
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {model.table.map(({ x, values: outputs }) => {
              return (
                <tr key={x}>
                  <th scope="row">{round(x)} s</th>
                  {model.series.map((s) => (
                    <td key={s.output.id}>
                      {outputText(s.output, outputs[s.output.id], locale)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
