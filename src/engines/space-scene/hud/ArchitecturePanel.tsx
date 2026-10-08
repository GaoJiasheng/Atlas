/**
 * Bottom panel 01 / ARCHITECTURE: an elevation drawn straight from the part
 * data (rest bounds of every primitive part on the section plane, default
 * front XY), zones numbered by group, a ground line and a scale bar in model
 * units. The selected part is outlined in the signal colour.
 */
import { useMemo } from 'react';
import { useScene, useT } from '../../core/context';
import { tx } from '../../../i18n';
import { resolveColorRef } from '../../../theme/theme';
import { elevation, scaleStep } from '../lib/schematic';
import type { SpaceSceneExt } from '../index';
import type { PartsFile } from '../schema';
import { clip } from './common';

const VW = 620;
const VH = 140;
/** Drawing area; the zone legend and scale bar sit in the right-hand column. */
const PAD = { l: 14, r: 170, t: 16, b: 30 };
const LEGEND_X = VW - 150;

const f2 = (n: number) => Number(n.toFixed(2));

export function ArchitecturePanel({ file }: { file: PartsFile }) {
  const t = useT();
  const part = useScene<SpaceSceneExt, string | null>((st) => st.part);
  const plane = file.views.section?.plane ?? 'xy';
  const el = useMemo(() => elevation(file.parts, plane), [file.parts, plane]);

  const spanU = el.u1 - el.u0;
  const spanV = el.v1 - el.v0;
  const k = Math.min((VW - PAD.l - PAD.r) / Math.max(spanU, 1e-6), (VH - PAD.t - PAD.b) / Math.max(spanV, 1e-6));
  const ox = PAD.l + (VW - PAD.l - PAD.r - spanU * k) / 2;
  const plan = plane === 'xz';
  const x = (u: number) => f2(ox + (u - el.u0) * k);
  // Elevations: v up. Plan: +z towards the viewer = down the sheet.
  const y = (v: number) => f2(plan ? PAD.t + (v - el.v0) * k : PAD.t + (el.v1 - v) * k);
  const groundY = y(plan ? el.v1 : el.v0);

  const zones = file.groups
    .map((g, i) => {
      const rs = el.rects.filter((r) => r.group === g.id);
      if (rs.length === 0) return null;
      return { id: g.id, n: i + 1, name: tx(g.name, 'en'), u0: Math.min(...rs.map((r) => r.u0)), u1: Math.max(...rs.map((r) => r.u1)), color: g.color };
    })
    .filter((z): z is NonNullable<typeof z> => z !== null);
  const groupColor = new Map(file.groups.map((g) => [g.id, g.color]));
  const step = scaleStep(spanU);

  return (
    <svg className="space-elev" viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="xMidYMid meet" role="img" aria-label={t('space.panel.architecture')}>
      <text x={PAD.l} y={9} className="space-elev__tag">
        {plane.toUpperCase()} · {String(file.parts.length).padStart(2, '0')} {t('space.spec.parts').toLocaleUpperCase()}
      </text>
      <line x1={PAD.l} x2={VW - PAD.r} y1={groundY} y2={groundY} className="space-elev__ground" />
      {el.rects.map((r) => {
        const on = r.id === part;
        return (
          <rect
            key={r.id}
            x={x(r.u0)}
            y={Math.min(y(r.v0), y(r.v1))}
            width={Math.max(0.6, f2((r.u1 - r.u0) * k))}
            height={Math.max(0.6, f2((r.v1 - r.v0) * k))}
            className="space-elev__part"
            data-on={on || undefined}
            style={on ? undefined : { fill: resolveColorRef(groupColor.get(r.group) ?? 'token:ink') }}
          />
        );
      })}
      {zones.map((z, i) => {
        const yy = VH - PAD.b + 8 + i * 7;
        return (
          <g key={z.id} className="space-elev__zone">
            <path d={`M${x(z.u0)} ${yy - 3}V${yy}H${x(z.u1)}V${yy - 3}`} style={{ stroke: resolveColorRef(z.color) }} />
            <text x={x(z.u1) + 3} y={yy + 2.4}>
              {String(z.n).padStart(2, '0')}
            </text>
          </g>
        );
      })}
      <g className="space-elev__legend">
        {zones.map((z, i) => (
          <g key={z.id} transform={`translate(${LEGEND_X} ${PAD.t + 6 + i * 15})`}>
            <rect x={0} y={-5} width={12} height={6} style={{ fill: resolveColorRef(z.color) }} />
            <text x={18} y={0}>
              {String(z.n).padStart(2, '0')} {clip(z.name.toUpperCase(), 22)}
            </text>
          </g>
        ))}
      </g>
      <g className="space-elev__scale">
        <path d={`M${LEGEND_X} ${VH - 8}h${f2(step * k)}M${LEGEND_X} ${VH - 11}v6M${f2(LEGEND_X + step * k)} ${VH - 11}v6`} />
        <text x={LEGEND_X} y={VH - 14}>
          {t('space.scale').toLocaleUpperCase()} {step} U
        </text>
      </g>
    </svg>
  );
}
