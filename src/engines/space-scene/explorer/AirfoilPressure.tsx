import { useEffect, useId, useRef } from 'react';
import { useStore } from 'zustand';
import { useScene, useSceneContext } from '../../core/context';
import { tx } from '../../../i18n';
import type { SpaceSceneExt } from '../index';
import type { PartsFile } from '../schema';
import type { SimValues } from '../sim-schema';
import type { SpaceUiStore } from '../ui';
import type { StageBridge } from '../bridge';
import { airfoilInputKey } from '../lib/sim/airfoil-cache';
import { solveAirfoil } from '../lib/sim/airfoil';
import { surfacePoint } from '../lib/sim/airfoil-field';
import { resolveAllPartDisplays } from '../lib/visibility';
export function AirfoilPressure({
  file,
  values,
  ui,
  bridge,
}: {
  file: PartsFile;
  values: SimValues;
  ui: SpaceUiStore;
  bridge: StageBridge;
}) {
  const { locale } = useSceneContext(),
    id = useId(),
    snapshot = useStore(ui, (u) => u.airfoil),
    selected = useStore(ui, (u) => u.airfoilSelected),
    reset = useStore(ui, (u) => u.airfoilReset);
  const st = useScene<
      SpaceSceneExt,
      import('../../core/store').SceneStoreState<SpaceSceneExt>
    >((s) => s),
    d = file.sim!.airfoil!,
    inputKey = airfoilInputKey(d, values),
    field = snapshot?.inputKey === inputKey ? snapshot.field : null;
  const overlay = file.sim!.overlays.find((o) => o.kind === 'airfoil-pressure'),
    part = resolveAllPartDisplays(file.parts, {
      ...st,
      highlight: st.tints,
    }).get(d.section.part);
  const on =
    overlay?.kind === 'airfoil-pressure' &&
    st.layers.includes(overlay.group) &&
    part?.visible &&
    st.view !== 'exploded';
  const scaledRef = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    const update = () => {
      if (scaledRef.current) {
        let show = false;
        for (const a of bridge.airfoilArrows.values())
          if (a.shown && a.scaled) show = true;
        scaledRef.current.hidden = !show;
      }
    };
    bridge.listeners.add(update);
    update();
    return () => {
      bridge.listeners.delete(update);
    };
  }, [bridge]);
  const mode = solveAirfoil(d, values).mode;
  const pressure = field?.pressure;
  const note = tx(
    {
      en: 'Illustrative stall region, not wind-tunnel data. Ideal flow does not predict separation.',
      zh: '失速区仅作示意，并非风洞数据；理想流不预测分离。',
    },
    locale,
  );
  if (!on) return null;
  const failed = field?.paths.some((p) => p.status !== 'complete');
  return (
    <div className="space-airfoil-status">
      <p aria-live="polite" key={reset}>
        {reset > 0 &&
          tx(
            {
              en: 'Conditions changed; the model table has been reset',
              zh: '条件改变，模型记录表已重置',
            },
            locale,
          )}
      </p>
      {!field && (
        <p role="status">
          {tx({ en: 'Updating flow', zh: '正在更新气流' }, locale)}
        </p>
      )}
      {failed && (
        <p role="status">
          {tx(
            {
              en: 'Some flow paths could not be drawn',
              zh: '部分流线未能绘出',
            },
            locale,
          )}
        </p>
      )}
      {mode === 'separated-illustration' && <p>{note}</p>}
      <p className="space-airfoil-scaled" ref={scaledRef}>
        {tx({ en: 'Arrow lengths are scaled', zh: '箭长经缩放' }, locale)}
      </p>
      {values['flow-view'] === 'pressure' && (
        <figure className="space-airfoil-plot" data-airfoil-pressure="">
          <figcaption>
            {tx(
              {
                en: 'Surface pressure · teaching model',
                zh: '表面气压 · 教学模型',
              },
              locale,
            )}{' '}
            <span className="atlas-chip">SIM</span>
          </figcaption>
          {!pressure ? (
            <p>
              {tx(
                {
                  en: 'Pressure not modelled for this state',
                  zh: '此状态不计算压力',
                },
                locale,
              )}
            </p>
          ) : (
            <PressureGraph
              pressure={pressure}
              selected={selected}
              choose={(airfoilSelected) => ui.setState({ airfoilSelected })}
              id={id}
              locale={locale}
            />
          )}
        </figure>
      )}
    </div>
  );
}
function PressureGraph({
  pressure,
  selected,
  choose,
  id,
  locale,
}: {
  pressure: NonNullable<
    import('../lib/sim/airfoil-field').AirfoilField['pressure']
  >;
  selected: number;
  choose: (n: number) => void;
  id: string;
  locale: 'en' | 'zh';
}) {
  const low = Math.min(0, ...pressure.map((p) => p.cp)),
    high = Math.max(1, ...pressure.map((p) => p.cp)),
    span = high - low,
    x = (v: number) => 42 + 264 * v,
    y = (v: number) => 32 + ((v - low) / span) * 135;
  const point = pressure[selected]!,
    rep = [30, 16, 2, 33, 47, 61];
  return (
    <>
      <svg
        viewBox="0 0 330 206"
        role="img"
        aria-labelledby={`${id}-title ${id}-desc`}
      >
        <title id={`${id}-title`}>
          {tx(
            {
              en: 'Cp against chord position, negative Cp upward',
              zh: 'Cp 随翼弦位置变化，负 Cp 向上',
            },
            locale,
          )}
        </title>
        <desc id={`${id}-desc`}>
          {tx(
            {
              en: 'Upper surface solid; lower surface dashed. Selected point corresponds to the surface marker.',
              zh: '上表面为实线，下表面为虚线。所选点与模型表面标记对应。',
            },
            locale,
          )}{' '}
          x/c={surfacePoint(point.theta)[0].toFixed(3)}, Cp=
          {point.cp.toFixed(3)}.
        </desc>
        <path
          d={`M42 30V167H306 M42 ${y(0)}H306`}
          stroke="var(--ink-3)"
          fill="none"
        />
        {[pressure.slice(0, 32), pressure.slice(32)].map((ps, i) => (
          <polyline
            key={i}
            points={ps
              .map((p) => `${x(surfacePoint(p.theta)[0])},${y(p.cp)}`)
              .join(' ')}
            fill="none"
            stroke={i ? 'var(--ink-2)' : 'var(--ink)'}
            strokeDasharray={i ? '4 3' : undefined}
            strokeWidth="1.5"
          />
        ))}
        <circle
          cx={x(surfacePoint(point.theta)[0])}
          cy={y(point.cp)}
          r="4"
          fill="var(--signal)"
        />
        <text x="18" y="22">
          Cp ↑ −
        </text>
        <text x="34" y="35" textAnchor="end">
          {low.toFixed(2)}
        </text>
        <text x="34" y="166" textAnchor="end">
          {high.toFixed(2)}
        </text>
        {[0, 0.5, 1].map((v) => (
          <text key={v} x={x(v)} y="182" textAnchor="middle">
            {v}
          </text>
        ))}
        <text x="174" y="201" textAnchor="middle">
          x/c
        </text>
      </svg>
      <p>
        {tx(
          {
            en: 'Negative Cp indicates pressure below the free stream',
            zh: '负 Cp 表示静压低于来流静压',
          },
          locale,
        )}
      </p>
      <div className="space-airfoil-samples">
        {rep.map((n, i) => (
          <button
            type="button"
            className="space-try__opt"
            key={n}
            aria-pressed={n === selected}
            onClick={() => choose(n)}
          >
            {tx(
              {
                en: i < 3 ? 'Upper' : 'Lower',
                zh: i < 3 ? '上表面' : '下表面',
              },
              locale,
            )}{' '}
            x/c {surfacePoint(pressure[n]!.theta)[0].toFixed(2)} · Cp{' '}
            {pressure[n]!.cp.toFixed(3)}
          </button>
        ))}
      </div>
    </>
  );
}
