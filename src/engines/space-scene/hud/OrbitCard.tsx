import { SourceRefs } from '../../widgets/SourcePopover';
import { useStageLook } from '../stages/model3d/look';
import { holds } from '../lib/sim/bind';
/** Three observations in the existing card / narrow reader slot; one shared session. */
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { useSceneContext } from '../../core/context';
import type { PartsFile } from '../schema';
import { getOrbitSession, type OrbitSession } from '../lib/sim/orbit-session';
import { add, dot, mul, sub, unit, rotate, finiteShadow } from '../lib/sim/orbit-rotation';
import { northBasis } from '../lib/sim/orbit-projection';
import { outputText } from '../lib/sim/text';
import { setSim, useSimStore } from './sim';
const text = (zh: boolean, en: string, cn: string) => (zh ? cn : en);
export function orbitPanelReading(orbit: OrbitSession) {
  const s = orbit.snapshot,
    c = orbit.config;
  const kind = c.panel.byLab[s.lab as keyof typeof c.panel.byLab] ?? null;
  const row = c.solarYear.table?.days[s.dayIndex - 1];
  const k = c.display.trueScaleMPerKm;
  return {
    kind,
    northUp: kind === 'phase',
    observer: kind === 'apparent-discs' ? 'model-surface' : 'geocentric',
    dayIndex: kind === 'solar-year' ? s.dayIndex : null,
    readings:
      kind === 'solar-year' && row
        ? {
            sunrise: row.sunrise_sgt,
            noon: row.solar_noon_sgt,
            sunset: row.sunset_sgt,
            daylightMinutes: row.daylight_minutes,
          }
        : null,
    shadowFrame: {
      origin: 'earth',
      scaleMPerKm: k,
      centres: {
        earth: [0, 0, 0],
        moon: mul(sub(s.bodies.moon.position, s.bodies.earth.position), k),
      },
      radii: {
        earth: s.bodies.earth.radiusKm * k,
        moon: s.bodies.moon.radiusKm * k,
      },
      du: s.shadow.du,
      dp: s.shadow.dp,
    },
    notApplicable: s.lab === 'local-year' ? 'orbit geometry readings are not applicable to the computed solar table' : null,
  };
}
function Phase({ orbit, label }: { orbit: OrbitSession; label: string }) {
  const look = useStageLook();
  const canvas = useRef<HTMLCanvasElement>(null);
  const s = orbit.snapshot;
  const basis = northBasis(sub(s.bodies.moon.position, s.bodies.earth.position), s.axis);
  useEffect(() => {
    const c = canvas.current,
      ctx = c?.getContext('2d');
    if (!c || !ctx) return;
    const css = getComputedStyle(c),
      bright = css.getPropertyValue('--ink').trim(),
      dark = css.getPropertyValue('--bg').trim();
    // A tiny 2-colour palette from the two theme tokens, then exact sphere-ray normals.
    ctx.fillStyle = bright;
    ctx.fillRect(0, 0, 1, 1);
    const lit = ctx.getImageData(0, 0, 1, 1).data;
    ctx.fillStyle = dark;
    ctx.fillRect(0, 0, 1, 1);
    const dim = ctx.getImageData(0, 0, 1, 1).data;
    const size = 160,
      image = ctx.createImageData(size, size),
      E = s.bodies.earth.position,
      M = s.bodies.moon.position,
      R = s.bodies.moon.radiusKm,
      D = Math.hypot(...sub(M, E)),
      disc = R / Math.sqrt(D * D - R * R),
      v = unit(sub(M, E));
    const basis = northBasis(v, s.axis),
      sun = s.solarDirections.moon;
    for (let y = 0; y < size; y++)
      for (let x = 0; x < size; x++) {
        const px = (x + 0.5 - size / 2) / (size * 0.46),
          py = (size / 2 - y - 0.5) / (size * 0.46);
        if (px * px + py * py > 1) continue;
        const ray = unit(add(v, add(mul(basis.right, px * disc), mul(basis.up, py * disc)))),
          b = dot(ray, sub(M, E)),
          h = b * b - (D * D - R * R);
        if (h < 0) continue;
        const hit = sub(mul(ray, b - Math.sqrt(h)), sub(M, E)),
          normal = mul(hit, 1 / R);
        let k = dot(normal, sun) > 0 ? 1 : 0.035;
        if (s.quantities['lunar-eclipse'] !== 'none') {
          const point = add(sub(M, E), hit),
            sh = finiteShadow(s.bodies.sun.radiusKm, s.bodies.earth.radiusKm, orbit.config.orbit.earthRadiusKm, point, mul(s.solarDirections.earth, -1), 0);
          if (sh.x > 0 && sh.du < 0) k *= 0.12;
          else if (sh.x > 0 && sh.dp < 0) k *= 0.55;
        }
        const o = (y * size + x) * 4;
        for (let j = 0; j < 3; j++) image.data[o + j] = dim[j]! * (1 - k) + lit[j]! * k;
        image.data[o + 3] = 255;
      }
    ctx.putImageData(image, 0, 0);
    ctx.strokeStyle = css.getPropertyValue('--ink-3').trim();
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size * 0.46, 0, Math.PI * 2);
    ctx.stroke();
    const mark = rotate(s.bodies.moon.quaternion, [1, 0, 0]);
    if (dot(mark, mul(v, -1)) > 0) {
      ctx.fillStyle = css.getPropertyValue('--signal').trim();
      ctx.beginPath();
      ctx.arc(size / 2 + dot(mark, basis.right) * size * 0.46, size / 2 - dot(mark, basis.up) * size * 0.46, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [orbit, s, look.theme]);
  return <canvas ref={canvas} width={160} height={160} role="img" aria-label={label} data-north-up="true" data-north={basis.up.join(',')} />;
}
function Discs({ orbit, label }: { orbit: OrbitSession; label: string }) {
  const s = orbit.snapshot,
    d = s.discs,
    b = northBasis(d.sunDirection, s.axis),
    a = d.separation,
    projection = sub(d.moonDirection, mul(d.sunDirection, dot(d.moonDirection, d.sunDirection))),
    p = unit(projection),
    k = 68 / d.sunRadius;
  const x = dot(p, b.right) * a * k,
    y = -dot(p, b.up) * a * k;
  return (
    <svg viewBox="0 0 300 165" role="img" aria-label={label}>
      <circle cx="150" cy="82" r="68" className="space-orbit__sun" />
      <circle cx={150 + x} cy={82 + y} r={d.moonRadius * k} className="space-orbit__moon" />
      <path d="M82 158 H218 M82 154 V162 M218 154 V162" className="space-orbit__line" />
      <text x="150" y="154" textAnchor="middle">
        {((2 * d.sunRadius * 180) / Math.PI).toFixed(3)}°
      </text>
    </svg>
  );
}
function Shadow({ orbit, zh }: { orbit: OrbitSession; zh: boolean }) {
  const s = orbit.snapshot,
    R = s.bodies.earth.radiusKm,
    mr = s.bodies.moon.radiusKm,
    m = sub(s.bodies.moon.position, s.bodies.earth.position),
    axis = mul(s.solarDirections.earth, -1),
    x = dot(m, axis),
    off = Math.hypot(...sub(m, mul(axis, x))),
    extent = Math.max(430000, off * 1.15),
    k = Math.min(260 / 550000, 92 / (extent + 10000)),
    cx = 35,
    cy = 68;
  const cone = (source: number, body: number, D: number, ox: number, oy = 0, ax = 1, ay = 0) => {
    const ku = Math.asin((source - body) / D),
      kp = Math.asin((source + body) / D),
      L = body / Math.sin(ku),
      end = 520000;
    const u = (body - end * Math.sin(ku)) / Math.cos(ku),
      p = (body + end * Math.sin(kp)) / Math.cos(kp);
    const pt = (x: number, y: number) => `${cx + (ox + x * ax - y * ay) * k},${cy - (oy + x * ay + y * ax) * k}`;
    return (
      <g>
        <path className="space-orbit__penumbra" d={`M${pt(0, body)}L${pt(end, p)}L${pt(end, -p)}L${pt(0, -body)}Z`} />
        <path className="space-orbit__umbra" d={`M${pt(0, body)}L${pt(L, 0)}L${pt(0, -body)}Z`} />
        {L < end && <path className="space-orbit__penumbra" d={`M${pt(L, 0)}L${pt(end, Math.abs(u))}L${pt(end, -Math.abs(u))}Z`} />}
      </g>
    );
  };
  return (
    <figure className="space-orbit__shadow">
      <figcaption>{text(zh, 'Finite Sun · one scale · no atmospheric brightness', '有限太阳 · 同一比例 · 非大气亮度预测')}</figcaption>
      <svg
        viewBox="0 0 300 130"
        role="img"
        aria-label={text(zh, 'Earth and Moon with finite-source umbra, penumbra and antumbra', '地月与有限光源本影、半影和伪本影')}
      >
        {cone(s.bodies.sun.radiusKm, R, orbit.config.orbit.earthRadiusKm, 0)}
        {s.quantities['solar-eclipse'] !== 'none' &&
          cone(
            s.bodies.sun.radiusKm,
            mr,
            Math.hypot(...s.bodies.moon.position),
            x,
            off,
            (orbit.config.orbit.earthRadiusKm + x) / Math.hypot(orbit.config.orbit.earthRadiusKm + x, off),
            off / Math.hypot(orbit.config.orbit.earthRadiusKm + x, off),
          )}
        <circle cx={cx} cy={cy} r={R * k} className="space-orbit__moon" />
        <circle cx={cx + x * k} cy={cy - off * k} r={mr * k} className="space-orbit__moon" />
        <text x={cx} y={cy + 16}>
          E
        </text>
        <text x={cx + x * k} y={Math.max(10, cy - off * k - 8)}>
          M
        </text>
      </svg>
    </figure>
  );
}
export function OrbitCard({ file, reader = false }: { file: PartsFile; reader?: boolean }) {
  const { locale } = useSceneContext(),
    store = useSimStore(),
    sim = file.sim;
  const orbit = sim ? getOrbitSession(store, sim) : null;
  useSyncExternalStore(
    orbit?.subscribe ?? (() => () => {}),
    () => orbit?.id ?? 0,
    () => 0,
  );
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const m = matchMedia('(max-width: 1023px)'),
      sync = () => setNarrow(m.matches);
    sync();
    m.addEventListener('change', sync);
    return () => m.removeEventListener('change', sync);
  }, []);
  const curve = useMemo(
    () => orbit?.config.solarYear.table?.days.map((r, i) => `${20 + (i / 364) * 260},${105 - ((r.daylight_minutes - 720) / 15) * 90}`).join(' ') ?? '',
    [orbit],
  );
  if (!orbit || !sim || reader !== narrow) return null;
  const s = orbit.snapshot,
    c = orbit.config,
    zh = locale === 'zh',
    panel = orbitPanelReading(orbit),
    kind = panel.kind;
  const read = (id: string) => {
    const o = sim.outputs.find((o) => (o.from ?? o.id) === id);
    return o ? outputText(o, orbit.outputs[o.id], locale) + (o.unit && o.format !== 'time' ? ' ' + o.unit : '') : '—';
  };
  const choose = (id: string) => store.getState().patch({ part: id });
  const scale = String(orbit.values[c.display.scale]),
    multipliers = orbit.display.multipliers;
  const row = c.solarYear.table?.days[s.dayIndex - 1];
  const setDay = (day: number) => setSim(store, sim, c.solarYear.control, Math.max(1, Math.min(365, day)));
  return (
    <section className="space-orbit" data-orbit-panel={kind ?? 'scale'} data-snapshot-id={orbit.id} aria-label={text(zh, 'Model observation', '模型观察窗')}>
      <div className="space-orbit__scale">
        <button type="button" onClick={() => setSim(store, sim, c.display.scale, scale === 'schematic' ? 'true-scale' : 'schematic')}>
          {text(
            zh,
            scale === 'schematic' ? 'Schematic → true scale' : 'True scale → schematic',
            scale === 'schematic' ? '示意尺度 → 真尺度' : '真尺度 → 示意尺度',
          )}
        </button>
        <small>{text(zh, 'SIM · undated circular model', '模拟 · 无日期圆轨道模型')}</small>
      </div>
      <p className="space-orbit__mapping">
        {text(zh, 'Size × S / E / M', '大小倍率 日 / 地 / 月')}{' '}
        {Object.values(multipliers.size)
          .map((n) => n.toFixed(2))
          .join(' / ')}
        <br />
        {text(zh, 'Distance × SE / EM', '距离倍率 日地 / 地月')} {multipliers.earthSun.toFixed(4)} / {multipliers.earthMoon.toFixed(4)}
      </p>
      {kind && (
        <h3>
          {text(
            zh,
            kind === 'phase' ? 'Geocentric · north up' : kind === 'apparent-discs' ? 'Model observer' : 'Computed solar year',
            kind === 'phase' ? '地心视图 · 北朝上' : kind === 'apparent-discs' ? '模型观察点' : '计算太阳年表',
          )}
        </h3>
      )}
      {kind === 'phase' && (
        <>
          <Phase orbit={orbit} label={`${read('moon-phase')} · ${read('moon-lit-percent')}`} />
          <p>
            {read('moon-phase')} · {read('moon-lit-percent')}
          </p>
          <p>{text(zh, 'Geometric lit fraction; eclipse dimming is separate. Faint teaching fill.', '几何亮部比例；食遮暗单列。暗侧为教学填光。')}</p>
          <p>
            {text(zh, 'Lunar eclipse: ', '月食：')}
            {read('lunar-eclipse')}
          </p>
        </>
      )}
      {kind === 'apparent-discs' && (
        <>
          <Discs orbit={orbit} label={`${read('solar-eclipse')}; ${read('sun-diameter-deg')} / ${read('moon-diameter-deg')}`} />
          <p>
            {text(zh, 'Solar eclipse: ', '日食：')}
            {read('solar-eclipse')} ·{' '}
            {s.quantities['solar-visible'] === 1 ? text(zh, 'above horizon', '地平线上方') : text(zh, 'alignment below horizon', '地平下的排列')}
          </p>
          <p>
            {text(zh, 'Sun / Moon diameter', '日 / 月视直径')} {read('sun-diameter-deg')} / {read('moon-diameter-deg')}
          </p>
          <p>
            {text(zh, 'Separation', '分离角')} {read('disc-separation-deg')}
          </p>
        </>
      )}
      {kind === 'solar-year' && row && (
        <>
          <svg
            viewBox="0 0 300 125"
            role="img"
            aria-label={text(zh, 'Computed daylight, expanded vertical range 720 to 735 minutes', '计算日长，纵轴放大至720至735分钟')}
            onPointerDown={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              setDay(Math.round(((((e.clientX - r.left) / r.width) * 300 - 20) / 260) * 364) + 1);
            }}
          >
            <path d="M20 15 V105 H280" className="space-orbit__line" />
            <polyline points={curve} className="space-orbit__line" />
            <path d={`M${20 + ((s.dayIndex - 1) / 364) * 260} 15 V105`} className="space-orbit__pointer" />
            <text x="22" y="12">
              735 min
            </text>
            <text x="22" y="120">
              720 min · 2026
            </text>
          </svg>
          <p>{text(zh, 'Expanded vertical range · calculated estimate', '纵轴放大区间 · 计算估计')}</p>
          <div className="space-orbit__days">
            <button onClick={() => setDay(s.dayIndex - 1)} disabled={s.dayIndex === 1} aria-label={text(zh, 'Previous day', '前一天')}>
              ‹
            </button>
            <time>{row.date}</time>
            <button onClick={() => setDay(s.dayIndex + 1)} disabled={s.dayIndex === 365} aria-label={text(zh, 'Next day', '后一天')}>
              ›
            </button>
          </div>
          <p>
            {row.sunrise_sgt} / {row.solar_noon_sgt} / {row.sunset_sgt}
            <br />
            {read('local-daylight-minutes')}
          </p>
          <p>
            {text(
              zh,
              'Sunrise / solar noon / sunset · UTC+8 · Atlas reference point 1.3342°N, 103.7357°E · flat unobstructed horizon · −0.833° · minutes, computed not observed.',
              '日出 / 太阳正午 / 日落 · UTC+8 · Atlas参考点1.3342°N、103.7357°E · 平坦无遮挡地平线 · −0.833° · 分钟级计算估计，非实测。',
            )}
          </p>
        </>
      )}
      {(kind === 'phase' || kind === 'apparent-discs') &&
        sim.overlays.some(
          (o) =>
            o.kind === 'orbit-eclipse-shadow' &&
            store.getState().layers.includes(o.group) &&
            o.labs.includes(s.lab as 'moon' | 'eclipse') &&
            (!o.when || holds(o.when.is, o.when.control ? orbit.values[o.when.control] : orbit.outputs[o.when.output!])),
        ) && <Shadow orbit={orbit} zh={zh} />}
      {s.parameters.tilt === 0 && <p>{text(zh, 'Orbital planes coincide; there is no distinct node line.', '轨道平面重合，没有唯一交线。')}</p>}
      <p>
        <SourceRefs ids={kind === 'solar-year' ? ['S33', 'S36'] : ['S36']} locale={locale} />
      </p>
      <div className="space-orbit__pick">
        {['earth', 'moon'].map((id) => (
          <button key={id} type="button" onClick={() => choose(`${id}-body`)}>
            {text(zh, id === 'earth' ? 'Earth' : 'Moon', id === 'earth' ? '地球' : '月球')}
          </button>
        ))}
      </div>
      <p>
        {text(zh, 'Solid spheres: X-RAY, CUTAWAY and EXPLODED do not apply.', '实心球体：不使用透视、剖切或拆解。')}
        {['eclipse', 'local-year'].includes(s.lab) ? text(zh, ' Static comparison.', ' 静态比较。') : ''}
      </p>
    </section>
  );
}
