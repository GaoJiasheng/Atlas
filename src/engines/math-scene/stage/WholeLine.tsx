/**
 * The whole-number line (docs/19 §3.1, `numberline` with `scale: "whole"`):
 * engineering-ruler grammar — a tick every `step`, taller and numbered as
 * `labels` says (the ends, every ten, every step) — with jumps drawn as arcs
 * above the line ("+5" at the top, a small ring where each lands; `counter`
 * numbers them 1, 2, 3 … under the arcs: count the jumps, not the marks), marks
 * and an arrow. A `jump` beat draws the arcs one after the other. On a
 * skip-count check the child lands the jumps: tap a tick, or move the cursor
 * (`role="slider"`, ← → one step, Home / End) and press Enter; tapping a
 * landing again lifts it. "Show me" draws the right jumps in dashed ink.
 */
import { useState, type KeyboardEvent, type PointerEvent } from 'react';
import type { Locale } from '../../core/types';
import { t } from '../../../i18n';
import type { BeatMove, NumberLineSpec } from '../schema';
import { wholeWords } from '../lib/words';

export interface WholeLineProps {
  x: number;
  y: number;
  w: number;
  model: NumberLineSpec;
  locale: Locale;
  label: string;
  move?: BeatMove | null;
  /** The child's landings (a skip-count check). */
  landings?: number[];
  onLand?(at: number): void;
  /** "Show me": the right landings, dashed. */
  ghost?: number[] | null;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Arcs from each landing to the next (from the line's start), with their sizes. */
function arcsOf(from: number, landings: readonly number[]): { a: number; b: number }[] {
  const out: { a: number; b: number }[] = [];
  let at = from;
  for (const l of landings) {
    out.push({ a: at, b: l });
    at = l;
  }
  return out;
}

export function WholeLine(p: WholeLineProps) {
  const m = p.model;
  const step = m.step ?? 1;
  const span = m.to - m.from;
  const ticks = span / step;
  const X = (v: number) => p.x + ((v - m.from) / span) * p.w;
  const [cursor, setCursor] = useState<number | null>(null);
  const live = !!p.onLand;
  const labelled = (v: number) => {
    switch (m.labels) {
      case 'none':
        return false;
      case 'ends':
        return v === m.from || v === m.to;
      case 'tens':
      case 'wholes':
        return v % (m.major ?? 10) === 0 || v === m.from || v === m.to;
      default:
        return true;
    }
  };
  // A longer, numbered tick every ten (or every `major`: a scale straightened, docs/32 §3.7).
  const major = (v: number) => v % (m.major ?? 10) === 0 || v === m.from || v === m.to;
  // Few pixels per tick: label fewer.
  const crowded = p.w / Math.max(1, ticks) < 22;
  const beatArcs = m.jumps ? Array.from({ length: m.jumps.count }, (_, i) => ({ a: (m.jumps!.from ?? m.from) + i * m.jumps!.size, b: (m.jumps!.from ?? m.from) + (i + 1) * m.jumps!.size })) : [];
  const mine = p.landings ? arcsOf(m.from, p.landings) : [];
  const ghost = p.ghost ? arcsOf(m.from, p.ghost) : [];
  // Arcs one after the other, the last done within 900 ms (380 ms each).
  const stagger = p.move === 'jump' ? Math.min(150, 500 / Math.max(1, beatArcs.length)) : 0;
  const arc = (a: number, b: number, h: number) => `M${X(a)} ${p.y - 3}Q${(X(a) + X(b)) / 2} ${p.y - h} ${X(b)} ${p.y - 3}`;
  const arcH = (a: number, b: number) => clamp((X(b) - X(a)) * 0.55, 18, 70);
  const cur = cursor ?? p.landings?.at(-1) ?? m.from;
  const key = (e: KeyboardEvent<SVGGElement>) => {
    if (!p.onLand) return;
    const go = (v: number) => {
      e.preventDefault();
      setCursor(clamp(v, m.from, m.to));
    };
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') go(cur + step);
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') go(cur - step);
    else if (e.key === 'Home') go(m.from);
    else if (e.key === 'End') go(m.to);
    else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      p.onLand(cur);
    }
  };
  const tap = (e: PointerEvent<SVGRectElement>) => {
    if (!p.onLand || e.button !== 0) return;
    const b = (e.currentTarget as SVGGraphicsElement).ownerSVGElement?.getBoundingClientRect();
    if (!b) return;
    const v = clamp(m.from + Math.round(((e.clientX - b.left - p.x) / p.w) * ticks) * step, m.from, m.to);
    setCursor(v);
    p.onLand(v);
  };
  return (
    <g className="ms-wline" role="group" aria-label={p.label} data-move={p.move ?? undefined}>
      <line className="ms-line__axis" x1={p.x - 10} x2={p.x + p.w + 10} y1={p.y} y2={p.y} />
      {Array.from({ length: ticks + 1 }, (_, i) => {
        const v = m.from + i * step;
        const big = major(v);
        return (
          <g key={v}>
            <line className={big ? 'ms-line__major' : 'ms-line__minor'} x1={X(v)} x2={X(v)} y1={p.y - (big ? 10 : 6)} y2={p.y + (big ? 10 : 6)} />
            {labelled(v) && (!crowded || big) && (
              <text className="ms-line__num" x={X(v)} y={p.y + 30} textAnchor="middle">
                {v}
              </text>
            )}
          </g>
        );
      })}
      {beatArcs.map((j, i) => (
        <g key={`j${i}`} className="ms-wline__jump" style={{ animationDelay: `${i * stagger}ms` }} aria-hidden="true">
          <path d={arc(j.a, j.b, arcH(j.a, j.b))} />
          <text x={(X(j.a) + X(j.b)) / 2} y={p.y - arcH(j.a, j.b) / 2 - 8} textAnchor="middle">
            +{j.b - j.a}
          </text>
          <circle className="ms-wline__land" cx={X(j.b)} cy={p.y} r={4.5} />
          {m.counter && (
            <text className="ms-wline__counter" x={(X(j.a) + X(j.b)) / 2} y={p.y - 9} textAnchor="middle">
              {i + 1}
            </text>
          )}
        </g>
      ))}
      {mine.map((j, i) => (
        <g key={`m${i}`} className="ms-wline__jump ms-wline__jump--mine" aria-hidden="true">
          <path d={arc(j.a, j.b, arcH(j.a, j.b))} />
          <text x={(X(j.a) + X(j.b)) / 2} y={p.y - arcH(j.a, j.b) / 2 - 8} textAnchor="middle">
            +{j.b - j.a}
          </text>
          <circle className="ms-wline__land" cx={X(j.b)} cy={p.y} r={5} />
          <text className="ms-wline__counter" x={(X(j.a) + X(j.b)) / 2} y={p.y - 9} textAnchor="middle">
            {i + 1}
          </text>
        </g>
      ))}
      {ghost.map((j, i) => (
        <path key={`g${i}`} className="ms-wline__ghost" d={arc(j.a, j.b, arcH(j.a, j.b) + 8)} aria-hidden="true" />
      ))}
      {(m.marks ?? []).map((f, i) => (
        <path key={`k${i}`} className="ms-wline__mark" d={`M${X(f.n)} ${p.y - 8}l-7 -13h14Z`} aria-hidden="true" />
      ))}
      {m.arrow && (
        <g className="ms-line__arrow" aria-label={t(p.locale, 'math.line.arrow')}>
          <path d={`M${X(m.arrow.n)} ${p.y - 8}l-8 -16h16Z`} />
          <line x1={X(m.arrow.n)} x2={X(m.arrow.n)} y1={p.y - 24} y2={p.y - 46} />
        </g>
      )}
      {live && <rect className="ms-line__hit" x={p.x - 22} y={p.y - 30} width={p.w + 44} height={60} onPointerDown={tap} aria-hidden="true" />}
      {live && (
        <g
          className="ms-wline__cursor"
          role="slider"
          tabIndex={0}
          data-keys="arrows"
          aria-label={t(p.locale, 'math.wline.cursor')}
          aria-valuemin={m.from}
          aria-valuemax={m.to}
          aria-valuenow={cur}
          aria-valuetext={wholeWords(cur, p.locale) + (p.landings?.includes(cur) ? t(p.locale, 'math.wline.landed') : '')}
          onKeyDown={key}
          transform={`translate(${X(cur)} ${p.y})`}
        >
          <path className="ms-wline__caret" d="M0 14l-7 12h14Z" />
        </g>
      )}
    </g>
  );
}
