/**
 * The two-pan balance (docs/32 §3.2; built to be the algebra balance too,
 * docs/17 A9): a stand, a beam that turns about its pivot — the heavier side
 * 8° down, level when the masses are equal — and two pans that stay level
 * on their stems, their bottoms clear (no hanging chains). `BalanceDrawing`
 * knows nothing of grams: it draws whatever things it is given in each pan
 * (each draws itself in the box it gets), so the algebra lesson can put its
 * own things (x and unit blocks) on it. `BalanceInstrument` is the measuring
 * lesson's: loads and plain weights, the child's weights in signal (tap one
 * to take it off), "Show me" the fewest weights dashed.
 */
import type { ReactNode } from 'react';
import type { Locale } from '../../../core/types';
import { t } from '../../../../i18n';
import type { InstrumentSpec, PanThing } from '../../schema';
import { beamAngle, beamTilt, tiltOf, weightText } from '../../lib/instrument';
import type { Rect } from '../layout';
import { LoadGlyph, loadAspect, WeightGlyph } from '../glyphs/measure';
import type { BalanceFrame } from './geometry';

/** A thing in a pan: how wide it is for its height, and how it draws itself in a box (its bottom on the box's bottom). */
export interface PanItem {
  key: string;
  aspect: number;
  /** Relative height (1 = a weight's). */
  size: number;
  draw(box: Rect): ReactNode;
  /** A tap takes it off (the child's own). */
  onTap?(): void;
  label?: string;
}

/** Things side by side on a pan of width `w`, as tall as they can be (at most `maxH`). */
function laid(items: PanItem[], x: number, w: number, y: number, maxH: number): { item: PanItem; box: Rect }[] {
  if (items.length === 0) return [];
  const gap = 4;
  const units = items.reduce((a, it) => a + it.aspect * it.size, 0);
  const h = Math.min(maxH, (w - gap * (items.length - 1)) / units);
  const total = items.reduce((a, it) => a + it.aspect * it.size * h, 0) + gap * (items.length - 1);
  let at = x + (w - total) / 2;
  return items.map((item) => {
    const iw = item.aspect * item.size * h;
    const box = { x: at, y: y - item.size * h, w: iw, h: item.size * h };
    at += iw + gap;
    return { item, box };
  });
}

export function BalanceDrawing({ f, tilt, left, right, tipMs, label }: { f: BalanceFrame; tilt: -1 | 0 | 1; left: PanItem[]; right: PanItem[]; tipMs: number; label: string }) {
  const deg = beamAngle(tilt);
  const rad = (deg * Math.PI) / 180;
  const dy = f.half * Math.sin(rad);
  const { pivot, half, panW } = f;
  const stem = Math.min(60, half * 0.3);
  const thick = Math.max(6, half * 0.035);
  const maxH = Math.min(panW * 0.55, 120);
  const pan = (side: -1 | 1, items: PanItem[]) => {
    const cx = pivot.x + side * half * Math.cos(rad);
    const lift = side * dy;
    const top = pivot.y - stem;
    return (
      <g className="ms-bal__side" style={{ transform: `translate(${cx - (pivot.x + side * half)}px, ${lift}px)`, transitionDuration: `${tipMs}ms` }}>
        <line className="ms-bal__stem" x1={pivot.x + side * half} x2={pivot.x + side * half} y1={pivot.y} y2={top} />
        <path className="ms-bal__pan" d={`M${pivot.x + side * half - panW / 2} ${top}h${panW}l${-panW * 0.06} ${thick * 1.4}h${-panW * 0.88}Z`} />
        {laid(items, pivot.x + side * half - panW / 2 + 6, panW - 12, top, maxH).map(({ item, box }) =>
          item.onTap ? (
            <g key={item.key} className="ms-bal__thing" role="button" tabIndex={0} aria-label={item.label} onClick={item.onTap} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), item.onTap!())}>
              <rect className="ms-inst__hit" x={box.x - Math.max(0, (44 - box.w) / 2)} y={box.y - Math.max(0, (44 - box.h) / 2)} width={Math.max(44, box.w)} height={Math.max(44, box.h)} />
              {item.draw(box)}
            </g>
          ) : (
            <g key={item.key}>{item.draw(box)}</g>
          ),
        )}
      </g>
    );
  };
  return (
    <g className="ms-bal" role="group" aria-label={label}>
      <rect className="ms-bal__base" x={f.base.x} y={f.base.y} width={f.base.w} height={f.base.h} />
      <path className="ms-bal__post" d={`M${pivot.x - 8} ${f.base.y}L${pivot.x - 3} ${pivot.y}h6L${pivot.x + 8} ${f.base.y}Z`} />
      <g transform={`translate(${pivot.x} ${pivot.y})`}>
        <g className="ms-inst__turn" style={{ transform: `rotate(${deg}deg)`, transitionDuration: `${tipMs}ms` }}>
          <rect className="ms-bal__beam" x={-half} y={-thick / 2} width={2 * half} height={thick} rx={thick / 2} />
          <line className="ms-bal__pointer" x1={0} x2={0} y1={0} y2={-Math.min(50, half * 0.25)} />
        </g>
      </g>
      <circle className="ms-bal__pivot" cx={pivot.x} cy={pivot.y} r={Math.max(4, thick * 0.7)} />
      {pan(-1, left)}
      {pan(1, right)}
    </g>
  );
}

/** The measuring lesson's things: a load (its outline; its mass kept to itself with `hideMass`) or a plain weight. */
export function panItems(things: readonly PanThing[], key: string, tone: 'cold' | 'hot' | 'signal', locale: Locale, onTap?: (i: number) => void, dashed = false, massTag = false): PanItem[] {
  return things.map((th, i) => {
    if (th.weight !== undefined) {
      const w = th.weight;
      return {
        key: `${key}${i}`,
        aspect: 0.9,
        size: w >= 1000 ? 1.15 : w >= 200 ? 0.95 : 0.75,
        draw: (b: Rect) => <WeightGlyph x={b.x} y={b.y} w={b.w} h={b.h} grams={w} tone={tone === 'signal' ? 'signal' : dashed ? 'ink' : 'cold'} dashed={dashed} />,
        onTap: onTap ? () => onTap(i) : undefined,
        label: onTap ? t(locale, 'math.measure.takeOff', { w: weightText(w) }) : undefined,
      };
    }
    const kind = th.item!;
    const big = th.size === 'big' ? 1.9 : th.size === 'small' ? 0.6 : 1.25;
    const tag = massTag && th.mass !== undefined ? weightText(th.mass) : null;
    return {
      key: `${key}${i}`,
      aspect: loadAspect(kind),
      size: big,
      draw: (b: Rect) => (
        <g>
          <LoadGlyph kind={kind} box={b} tone={tone} />
          {tag && (
            <text className="ms-bal__tag" x={b.x + b.w / 2} y={b.y - (kind === 'pineapple' ? 22 : 8)} textAnchor="middle">
              {tag}
            </text>
          )}
        </g>
      ),
    };
  });
}

export function BalanceInstrument({ s, f, right, mine, ghost, tipMs, onTake, locale, label, showMass }: { s: InstrumentSpec; f: BalanceFrame; right: PanThing[]; mine: boolean; ghost: number[] | null; tipMs: number; onTake?: (i: number) => void; locale: Locale; label: string; showMass: boolean }) {
  const mass = (things: readonly PanThing[]) => things.reduce((a, x) => a + (x.weight ?? x.mass ?? 0), 0);
  // "Show me": the fewest weights that balance, dashed, in place of the child's.
  const shown: PanThing[] = ghost ? ghost.map((w) => ({ weight: w })) : right;
  const tilt = mine || ghost ? tiltOf(mass(s.left ?? []), mass(shown)) : beamTilt(s, right);
  const rightItems = ghost ? panItems(shown, 'g', 'cold', locale, undefined, true) : panItems(shown, 'r', mine ? 'signal' : 'cold', locale, onTake);
  return (
    <g className="ms-inst ms-inst--balance">
      <BalanceDrawing f={f} tilt={tilt} left={panItems(s.left ?? [], 'l', 'cold', locale, undefined, false, showMass && !s.hideMass)} right={rightItems} tipMs={tipMs} label={label} />
    </g>
  );
}
