/**
 * Outlines of the things measured (docs/32 §3.2): orthographic line art in
 * 1 px ink with a flat tone fill (given = cold, a second one = hot, the
 * child's = signal), no shading, no faces, no brands. Things laid along a
 * scale are drawn into the box they span (end to end, so their ends sit on
 * the marks); loads sit on a pan, their bottom on its top.
 */
import type { ReactNode } from 'react';
import type { LoadKind } from '../../schema';
import type { Rect } from '../layout';

type LengthThing = 'pencil' | 'crayon' | 'eraser' | 'key' | 'ribbon' | 'leaf' | 'straw' | 'string' | 'rope' | 'book' | 'whiteboard' | 'corridor' | 'door';

/** A thing laid from `x0` to `x1` (its ends exactly there), `h` tall, its bottom on `y`. Vertical things (a door) stand from `y` up. */
export function LengthGlyph({ kind, x0, x1, y, h, tone }: { kind: LengthThing; x0: number; x1: number; y: number; h: number; tone: 'cold' | 'hot' | 'signal' }): ReactNode {
  const w = x1 - x0;
  const mid = y - h / 2;
  const cls = `ms-glyph ms-glyph--${tone}`;
  switch (kind) {
    case 'pencil': {
      const t = Math.min(w * 0.18, h * 1.4);
      return (
        <g className={cls}>
          <path d={`M${x0} ${mid - h * 0.32}H${x1 - t}L${x1} ${mid}L${x1 - t} ${mid + h * 0.32}H${x0}Z`} />
          <path className="ms-glyph__line" d={`M${x1 - t} ${mid - h * 0.32}L${x1 - t} ${mid + h * 0.32}M${x0 + w * 0.08} ${mid - h * 0.32}V${mid + h * 0.32}M${x1 - t * 0.35} ${mid - h * 0.11}V${mid + h * 0.11}`} />
        </g>
      );
    }
    case 'crayon': {
      const t = Math.min(w * 0.14, h);
      return (
        <g className={cls}>
          <path d={`M${x0} ${mid - h * 0.3}H${x1 - t}L${x1} ${mid - h * 0.08}V${mid + h * 0.08}L${x1 - t} ${mid + h * 0.3}H${x0}Z`} />
          <path className="ms-glyph__line" d={`M${x0 + w * 0.2} ${mid - h * 0.3}V${mid + h * 0.3}M${x1 - t - w * 0.12} ${mid - h * 0.3}V${mid + h * 0.3}`} />
        </g>
      );
    }
    case 'eraser':
      return (
        <g className={cls}>
          <rect x={x0} y={mid - h * 0.4} width={w} height={h * 0.8} rx={Math.min(6, h * 0.12)} />
          <path className="ms-glyph__line" d={`M${x0 + w * 0.32} ${mid - h * 0.4}V${mid + h * 0.4}`} />
        </g>
      );
    case 'key': {
      const r = Math.min(h * 0.42, w * 0.22);
      return (
        <g className={cls}>
          <path d={`M${x0 + 2 * r} ${mid - h * 0.12}H${x1}V${mid + h * 0.12}H${x1 - w * 0.1}V${mid + h * 0.32}H${x1 - w * 0.18}V${mid + h * 0.12}H${x1 - w * 0.26}V${mid + h * 0.26}H${x1 - w * 0.33}V${mid + h * 0.12}H${x0 + 2 * r}Z`} />
          <circle cx={x0 + r} cy={mid} r={r} />
          <circle className="ms-glyph__hole" cx={x0 + r * 0.8} cy={mid} r={r * 0.36} />
        </g>
      );
    }
    case 'ribbon': {
      const n = Math.min(h * 0.3, w * 0.05);
      return <path className={cls} d={`M${x0} ${mid - h * 0.22}H${x1}L${x1 - n} ${mid}L${x1} ${mid + h * 0.22}H${x0}L${x0 + n} ${mid}Z`} />;
    }
    case 'leaf':
      return (
        <g className={cls}>
          <path d={`M${x0} ${mid}Q${x0 + w * 0.45} ${mid - h * 0.85} ${x1} ${mid}Q${x0 + w * 0.45} ${mid + h * 0.85} ${x0} ${mid}Z`} />
          <path className="ms-glyph__line" d={`M${x0} ${mid}H${x1 - w * 0.04}`} />
        </g>
      );
    case 'straw':
      return (
        <g className={cls}>
          <rect x={x0} y={mid - h * 0.14} width={w} height={h * 0.28} />
          <path className="ms-glyph__line" d={`M${x0 + w * 0.7} ${mid - h * 0.14}V${mid + h * 0.14}M${x0 + w * 0.74} ${mid - h * 0.14}V${mid + h * 0.14}`} />
        </g>
      );
    case 'string':
    case 'rope': {
      const t = kind === 'rope' ? h * 0.2 : h * 0.08;
      const waves = Math.max(3, Math.round(w / 40));
      const d = Array.from({ length: waves }, (_, i) => {
        const a = x0 + (i * w) / waves;
        const b = x0 + ((i + 1) * w) / waves;
        return `Q${(a + b) / 2} ${mid + (i % 2 ? t : -t)} ${b} ${mid}`;
      }).join('');
      return <path className={`${cls} ms-glyph--cord`} d={`M${x0} ${mid}${d}`} strokeWidth={kind === 'rope' ? 3 : 1.6} />;
    }
    case 'book':
      return (
        <g className={cls}>
          <rect x={x0} y={y - h * 0.9} width={w} height={h * 0.9} />
          <path className="ms-glyph__line" d={`M${x0 + w * 0.06} ${y - h * 0.9}V${y}`} />
        </g>
      );
    case 'whiteboard':
      return (
        <g className={cls}>
          <rect x={x0} y={y - h} width={w} height={h * 0.92} />
          <rect className="ms-glyph__paper" x={x0 + 5} y={y - h + 5} width={w - 10} height={h * 0.92 - 10} />
          <path className="ms-glyph__line" d={`M${x0 + w * 0.1} ${y - h * 0.08}H${x1 - w * 0.1}`} />
        </g>
      );
    case 'corridor':
      return (
        <g className={cls}>
          <path d={`M${x0} ${y}V${y - h}H${x1}V${y}`} fill="none" />
          <path className="ms-glyph__line" d={`M${x0} ${y - h * 0.5}H${x1}`} strokeDasharray="6 5" />
        </g>
      );
    case 'door':
      return (
        <g className={cls}>
          <rect x={x0} y={y - h} width={w} height={h} />
          <circle className="ms-glyph__hole" cx={x1 - w * 0.14} cy={y - h * 0.48} r={Math.max(2, w * 0.04)} />
        </g>
      );
  }
}

/** A door standing from `y` (its foot) up to `top`, `w` wide, at `x` (a height compared with a vertical scale). */
export function DoorGlyph({ x, y, top, w, tone }: { x: number; y: number; top: number; w: number; tone: 'cold' | 'hot' }) {
  return (
    <g className={`ms-glyph ms-glyph--${tone}`}>
      <rect x={x} y={top} width={w} height={y - top} />
      <circle className="ms-glyph__hole" cx={x + w * 0.82} cy={top + (y - top) * 0.52} r={Math.max(2.5, w * 0.04)} />
    </g>
  );
}

/** The width-to-height of a load's outline (big things wider). */
export function loadAspect(kind: LoadKind): number {
  switch (kind) {
    case 'fish':
    case 'long-beans':
      return 2.6;
    case 'kangkong':
    case 'prawns':
      return 2;
    case 'rice':
    case 'flour':
    case 'beans':
      return 0.8;
    case 'paper-clip':
      return 2.2;
    case 'watermelon':
      return 1.35;
    case 'papaya':
      return 1.7;
    case 'pineapple':
      return 0.62;
    default:
      return 1;
  }
}

/** A load drawn in its box, its bottom on the box's bottom. */
export function LoadGlyph({ kind, box, tone }: { kind: LoadKind; box: Rect; tone: 'cold' | 'hot' | 'signal' }): ReactNode {
  const { x, y, w, h } = box;
  const cx = x + w / 2;
  const b = y + h;
  const cls = `ms-glyph ms-glyph--${tone}`;
  switch (kind) {
    case 'fish':
      return (
        <g className={cls}>
          <path d={`M${x + w * 0.04} ${b - h * 0.45}Q${x + w * 0.38} ${b - h * 0.98} ${x + w * 0.8} ${b - h * 0.45}L${x + w} ${b - h * 0.78}V${b - h * 0.12}L${x + w * 0.8} ${b - h * 0.45}Q${x + w * 0.38} ${b + h * 0.02} ${x + w * 0.04} ${b - h * 0.45}Z`} />
          <circle className="ms-glyph__hole" cx={x + w * 0.16} cy={b - h * 0.52} r={Math.max(1.5, h * 0.05)} />
        </g>
      );
    case 'prawns': {
      // Three curled prawns: a thick C each, the tail fanned.
      const pw = w / 3;
      return (
        <g className={cls}>
          {[0, 1, 2].map((i) => {
            const px = x + i * pw + pw * 0.08;
            const py = b - h * 0.08;
            const R = Math.min(pw * 0.44, h * 0.46);
            return (
              <g key={i}>
                <path d={`M${px} ${py - R}A${R} ${R} 0 1 1 ${px + R * 0.9} ${py}L${px + R * 0.62} ${py - R * 0.3}A${R * 0.55} ${R * 0.55} 0 1 0 ${px + R * 0.05} ${py - R * 0.55}Z`} />
                <path d={`M${px} ${py - R}l${-R * 0.3} ${-R * 0.25}l${R * 0.05} ${R * 0.5}Z`} />
              </g>
            );
          })}
        </g>
      );
    }
    case 'kangkong':
      return (
        <g className={cls}>
          <path d={`M${x} ${b - h * 0.2}H${x + w * 0.55}V${b - h * 0.1}H${x}Z`} />
          {[0.12, 0.3, 0.48].map((k) => (
            <path key={k} d={`M${x + w * 0.5} ${b - h * k}Q${x + w * 0.78} ${b - h * (k + 0.55)} ${x + w} ${b - h * (k + 0.2)}Q${x + w * 0.75} ${b - h * (k + 0.05)} ${x + w * 0.5} ${b - h * k}Z`} />
          ))}
        </g>
      );
    case 'long-beans':
      return (
        <g className={cls}>
          {[0, 1, 2].map((i) => (
            <path key={i} d={`M${x} ${b - h * (0.15 + i * 0.25)}Q${cx} ${b - h * (0.45 + i * 0.25)} ${x + w} ${b - h * (0.18 + i * 0.22)}`} fill="none" strokeWidth={Math.max(2, h * 0.08)} />
          ))}
        </g>
      );
    case 'pineapple':
      return (
        <g className={cls}>
          <ellipse cx={cx} cy={b - h * 0.32} rx={w * 0.42} ry={h * 0.32} />
          <path d={`M${cx} ${b - h * 0.62}L${cx - w * 0.3} ${y}L${cx - w * 0.06} ${b - h * 0.68}L${cx} ${y - h * 0.04}L${cx + w * 0.06} ${b - h * 0.68}L${cx + w * 0.3} ${y}Z`} />
          <path className="ms-glyph__line" d={`M${cx - w * 0.3} ${b - h * 0.48}L${cx + w * 0.2} ${b - h * 0.08}M${cx + w * 0.3} ${b - h * 0.48}L${cx - w * 0.2} ${b - h * 0.08}`} />
        </g>
      );
    case 'papaya':
      return <path className={cls} d={`M${x + w * 0.02} ${b - h * 0.55}C${x + w * 0.04} ${b - h * 1.02} ${x + w * 0.7} ${b - h * 1.04} ${x + w * 0.98} ${b - h * 0.6}C${x + w * 1.02} ${b - h * 0.12} ${x + w * 0.4} ${b + h * 0.12} ${x + w * 0.02} ${b - h * 0.55}Z`} />;
    case 'watermelon':
      return (
        <g className={cls}>
          <ellipse cx={cx} cy={b - h * 0.47} rx={w * 0.49} ry={h * 0.47} />
          <path className="ms-glyph__line" d={`M${cx} ${b - h * 0.94}Q${cx - w * 0.2} ${b - h * 0.47} ${cx} ${b}M${cx} ${b - h * 0.94}Q${cx + w * 0.2} ${b - h * 0.47} ${cx} ${b}`} />
        </g>
      );
    case 'mango':
      return <path className={cls} d={`M${x + w * 0.1} ${b - h * 0.55}Q${x + w * 0.2} ${y} ${x + w * 0.7} ${y + h * 0.1}Q${x + w} ${b - h * 0.5} ${x + w * 0.6} ${b}Q${x} ${b} ${x + w * 0.1} ${b - h * 0.55}Z`} />;
    case 'guava':
      return (
        <g className={cls}>
          <circle cx={cx} cy={b - h * 0.45} r={Math.min(w, h) * 0.45} />
          <path className="ms-glyph__line" d={`M${cx} ${b - h * 0.9}v${-h * 0.08}`} />
        </g>
      );
    case 'onion':
      return <path className={cls} d={`M${cx} ${y}Q${cx + w * 0.08} ${y + h * 0.3} ${x + w * 0.88} ${b - h * 0.42}Q${x + w * 0.9} ${b} ${cx} ${b}Q${x + w * 0.1} ${b} ${x + w * 0.12} ${b - h * 0.42}Q${cx - w * 0.08} ${y + h * 0.3} ${cx} ${y}Z`} />;
    case 'rice':
    case 'flour':
    case 'beans':
      return (
        <g className={cls}>
          <path d={`M${x + w * 0.08} ${b}L${x + w * 0.02} ${y + h * 0.16}Q${cx} ${y - h * 0.04} ${x + w * 0.98} ${y + h * 0.16}L${x + w * 0.92} ${b}Z`} />
          <path className="ms-glyph__line" d={`M${x + w * 0.04} ${y + h * 0.26}Q${cx} ${y + h * 0.12} ${x + w * 0.96} ${y + h * 0.26}`} />
          {kind === 'beans' && <circle className="ms-glyph__hole" cx={cx} cy={b - h * 0.4} r={Math.max(2, w * 0.08)} />}
        </g>
      );
    case 'paper-clip':
      return <path className={`${cls} ms-glyph--cord`} d={`M${x + w * 0.2} ${b - h * 0.25}H${x + w * 0.85}A${h * 0.25} ${h * 0.25} 0 0 0 ${x + w * 0.85} ${b - h * 0.75}H${x + w * 0.1}A${h * 0.2} ${h * 0.2} 0 0 0 ${x + w * 0.1} ${b - h * 0.35}H${x + w * 0.7}`} strokeWidth={1.6} />;
    case 'beach-ball': {
      const r = Math.min(w, h) * 0.49;
      const cy = b - r;
      return (
        <g className={cls}>
          <circle cx={cx} cy={cy} r={r} />
          <path className="ms-glyph__line" d={`M${cx} ${cy - r}Q${cx - r * 0.5} ${cy} ${cx} ${cy + r}M${cx} ${cy - r}Q${cx + r * 0.5} ${cy} ${cx} ${cy + r}M${cx - r} ${cy}H${cx + r}`} />
        </g>
      );
    }
    case 'stone':
      return <path className={cls} d={`M${x + w * 0.05} ${b}Q${x} ${b - h * 0.6} ${x + w * 0.4} ${y + h * 0.2}Q${x + w * 0.95} ${y} ${x + w * 0.96} ${b - h * 0.4}Q${x + w} ${b} ${x + w * 0.05} ${b}Z`} />;
  }
}

/** A plain weight: a cylinder seen from the side with its mass on it (`500 g`, `1 kg`). */
export function WeightGlyph({ x, y, w, h, grams, tone, dashed }: { x: number; y: number; w: number; h: number; grams: number; tone: 'cold' | 'signal' | 'ink'; dashed?: boolean }) {
  const text = grams >= 1000 && grams % 1000 === 0 ? `${grams / 1000} kg` : `${grams} g`;
  return (
    <g className={`ms-weight ms-weight--${tone}`} data-dashed={dashed || undefined}>
      <rect x={x} y={y + h * 0.18} width={w} height={h * 0.82} rx={2} />
      <rect x={x + w * 0.32} y={y} width={w * 0.36} height={h * 0.2} rx={1.5} />
      <text x={x + w / 2} y={y + h * 0.62} textAnchor="middle" dominantBaseline="central" fontSize={Math.max(10, Math.min(16, w * 0.24))}>
        {text}
      </text>
    </g>
  );
}

/** A small eye on the eye-level line (no face: a ring and its pupil). */
export function EyeGlyph({ x, y, r }: { x: number; y: number; r: number }) {
  return (
    <g className="ms-eye" aria-hidden="true">
      <path d={`M${x - r * 1.6} ${y}Q${x} ${y - r * 1.5} ${x + r * 1.6} ${y}Q${x} ${y + r * 1.5} ${x - r * 1.6} ${y}Z`} />
      <circle cx={x} cy={y} r={r * 0.55} />
    </g>
  );
}
