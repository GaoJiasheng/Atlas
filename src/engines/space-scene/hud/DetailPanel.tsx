/**
 * Bottom panel 02 / DETAIL: the selected part (else the chapter's focus part):
 * number, EN + 中文 name, group, what it connects to, one line of what it
 * does, and a mini exploded drawing (the part and its neighbours at rest,
 * dotted, and pulled apart along their explode directions). Without a part:
 * the chapter title and a one-line summary of the model.
 */
import { useMemo } from 'react';
import { useScene, useSceneContext, useT } from '../../core/context';
import type { Chapter } from '../../core/types';
import { tx } from '../../../i18n';
import { resolveColorRef } from '../../../theme/theme';
import { elevation, numberedParts } from '../lib/schematic';
import type { SpaceSceneExt } from '../index';
import type { Part, PartsFile } from '../schema';
import { clip, partNumber } from './common';

const IW = 120;
const IH = 96;

function ExplodedIcon({ file, part }: { file: PartsFile; part: Part }) {
  const plane = file.views.section?.plane ?? 'xy';
  const { rest, out } = useMemo(() => {
    const set = file.parts.filter((p) => !p.context && (p.id === part.id || part.connects.includes(p.id)));
    return { rest: elevation(set, plane, 0), out: elevation(set, plane, 0.6) };
  }, [file.parts, part, plane]);
  const u0 = Math.min(rest.u0, out.u0);
  const u1 = Math.max(rest.u1, out.u1);
  const v0 = Math.min(rest.v0, out.v0);
  const v1 = Math.max(rest.v1, out.v1);
  const k = Math.min((IW - 12) / Math.max(u1 - u0, 1e-6), (IH - 12) / Math.max(v1 - v0, 1e-6));
  const ox = (IW - (u1 - u0) * k) / 2;
  const oy = (IH - (v1 - v0) * k) / 2;
  const plan = plane === 'xz';
  const x = (u: number) => Number((ox + (u - u0) * k).toFixed(2));
  const y = (v: number) => Number((plan ? oy + (v - v0) * k : oy + (v1 - v) * k).toFixed(2));
  const color = new Map(file.groups.map((g) => [g.id, g.color]));
  return (
    <svg className="space-detail__icon" viewBox={`0 0 ${IW} ${IH}`} aria-hidden="true">
      {rest.rects.map((r) => (
        <rect key={`r-${r.id}`} className="space-detail__rest" x={x(r.u0)} y={Math.min(y(r.v0), y(r.v1))} width={Math.max(0.5, (r.u1 - r.u0) * k)} height={Math.max(0.5, (r.v1 - r.v0) * k)} />
      ))}
      {out.rects.map((r) => {
        const a = rest.rects.find((q) => q.id === r.id)!;
        const on = r.id === part.id;
        return (
          <g key={`o-${r.id}`}>
            <line
              className="space-detail__move"
              x1={x((a.u0 + a.u1) / 2)}
              y1={y((a.v0 + a.v1) / 2)}
              x2={x((r.u0 + r.u1) / 2)}
              y2={y((r.v0 + r.v1) / 2)}
            />
            <rect
              className="space-detail__out"
              data-on={on || undefined}
              x={x(r.u0)}
              y={Math.min(y(r.v0), y(r.v1))}
              width={Math.max(0.5, (r.u1 - r.u0) * k)}
              height={Math.max(0.5, (r.v1 - r.v0) * k)}
              style={on ? undefined : { fill: resolveColorRef(color.get(r.group) ?? 'token:ink') }}
            />
          </g>
        );
      })}
    </svg>
  );
}

export function DetailPanel({ file, chapters }: { file: PartsFile; chapters: readonly Chapter[] }) {
  const { locale } = useSceneContext();
  const t = useT();
  const s = useScene<SpaceSceneExt, { part: string | null; chapter: string | null; view: string }>((st) => ({
    part: st.part,
    chapter: st.chapter,
    view: st.view,
  }));
  const part = s.part ? file.parts.find((p) => p.id === s.part && !p.context) : undefined;

  if (!part) {
    const chapter = chapters.find((c) => c.id === s.chapter);
    const n = chapters.findIndex((c) => c.id === s.chapter) + 1;
    return (
      <div className="space-detail space-detail--chapter">
        <p className="space-detail__no">{String(Math.max(1, n)).padStart(2, '0')}</p>
        <div className="space-detail__text">
          <p className="space-detail__en">{tx(chapter?.title, 'en').toUpperCase()}</p>
          <p className="space-detail__zh" lang="zh-Hans">
            {tx(chapter?.title, 'zh')}
          </p>
          <p className="space-detail__line">{t('space.detail.parts', { n: numberedParts(file.parts).length, groups: file.groups.length })}</p>
          <p className="space-detail__hint">{t('space.hint')}</p>
        </div>
      </div>
    );
  }

  const group = part.group !== undefined ? file.groups.find((g) => g.id === part.group) : undefined;
  const connects = part.connects.map((id) => file.parts.find((p) => p.id === id)).filter((p): p is Part => p !== undefined);
  return (
    <div className="space-detail">
      <ExplodedIcon file={file} part={part} />
      <div className="space-detail__text">
        <p className="space-detail__en">
          <i>{partNumber(file, part.id)}</i> {tx(part.name, 'en').toUpperCase()}
        </p>
        <p className="space-detail__zh" lang="zh-Hans">
          {tx(part.name, 'zh')}
        </p>
        <dl className="space-detail__dl">
          <dt>{t('space.detail.group')}</dt>
          <dd>
            <span className="space-detail__swatch" style={{ background: resolveColorRef(group?.color ?? 'token:ink') }} aria-hidden="true" />
            {tx(group?.name, locale)}
          </dd>
          {connects.length > 0 && (
            <>
              <dt>{t('space.detail.connects')}</dt>
              <dd className="space-detail__mono">{connects.map((p) => partNumber(file, p.id)).join(' · ')}</dd>
            </>
          )}
        </dl>
        <p className="space-detail__line">{clip(tx(part.summary, locale), locale === 'zh' ? 34 : 80)}</p>
      </div>
    </div>
  );
}
