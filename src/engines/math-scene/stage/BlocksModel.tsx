/**
 * Place-value blocks (docs/19 §3.2, model A2), orthographic 2D in hairline
 * ink: a hundred is a 10 × 10 flat, a ten a 1 × 10 rod, a one a single cube,
 * on a mat of three columns (HUNDREDS · TENS · ONES, with the count under
 * each), in rows of five so a count reads at a glance. × draws the value in
 * equal rows (×1, ×2 …) that a `combine` beat pushes together column by
 * column (each block keeps its key, so it moves); ÷ draws plates under the
 * mat with what each has been dealt. A trade lights the ten blocks (or the
 * one) it takes; with `move: trade` they slide into the next column and the
 * new block appears. The column working sits beside the mat (below it on a
 * narrow stage), its place lit with the mat's column.
 *
 * On a check the columns are live: tap a column (or Enter on it) to trade
 * 10 of it up (regroup), or to share it into the plates — or, when it cannot
 * be shared, to trade one of it down (share). The tray has the same moves.
 */
import type { KeyboardEvent, PointerEvent, ReactNode } from 'react';
import type { Locale } from '../../core/types';
import { t } from '../../../i18n';
import type { BeatMove, BlocksModelSpec, PlaceKey, Task, Trade } from '../schema';
import type { Action, TaskState } from '../lib/state';
import { canTrade, columnFocus, counts, matOf, standard, total, tradeOf, type Counts } from '../lib/blocks';
import { ColumnWorking, columnCells } from './ColumnWorking';
import { placeValueWords } from '../lib/words';
import type { Rect } from './layout';

export interface BlocksModelProps {
  box: Rect;
  model: BlocksModelSpec;
  locale: Locale;
  label: string;
  move?: BeatMove | null;
  task?: Task | null;
  state?: TaskState | null;
  editable?: boolean;
  act?(a: Action): void;
  ghost?: TaskState | null;
  mini?: boolean;
}

const PLACES: PlaceKey[] = ['H', 'T', 'O'];
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** One block at 0, 0 (top-left), unit `u`. */
function Block({ place, u }: { place: PlaceKey; u: number }) {
  if (place === 'O') return <rect className="ms-block__body" width={u} height={u} />;
  if (place === 'T')
    return (
      <>
        <rect className="ms-block__body" width={u} height={u * 10} />
        <path className="ms-block__grid" d={Array.from({ length: 9 }, (_, i) => `M0 ${(i + 1) * u}h${u}`).join('')} />
      </>
    );
  return (
    <>
      <rect className="ms-block__body" width={u * 10} height={u * 10} />
      <path className="ms-block__grid" d={Array.from({ length: 9 }, (_, i) => `M0 ${(i + 1) * u}h${u * 10}M${(i + 1) * u} 0v${u * 10}`).join('')} />
    </>
  );
}

/** Size of one block. */
const blockW = (p: PlaceKey, u: number) => (p === 'H' ? 10 * u : u);
const blockH = (p: PlaceKey, u: number) => (p === 'O' ? u : 10 * u);
/** Blocks per row in a column: ones and tens in fives (two fives side by side), hundreds three across. */
const perRow = (p: PlaceKey) => (p === 'H' ? 3 : p === 'T' ? 10 : 5);
const gapOf = (u: number) => Math.max(2, Math.round(u * 0.35));

/** Where block `i` of a place sits inside its column (top-left). */
function slot(p: PlaceKey, i: number, u: number): { x: number; y: number } {
  const g = gapOf(u);
  const n = perRow(p);
  const c = i % n;
  const r = Math.floor(i / n);
  // A wider gap after every fifth rod or cube: the fives read at a glance.
  const five = p === 'H' ? 0 : Math.floor(c / 5) * g * 2;
  return { x: c * (blockW(p, u) + g) + five, y: r * (blockH(p, u) + g) };
}

/** A column's size for `n` blocks. */
function columnSize(p: PlaceKey, n: number, u: number): { w: number; h: number } {
  const g = gapOf(u);
  const across = Math.min(perRow(p), Math.max(n, p === 'H' ? 1 : 5));
  const rows = Math.max(1, Math.ceil(n / perRow(p)));
  return { w: across * (blockW(p, u) + g) + (p === 'H' ? 0 : Math.floor((across - 1) / 5) * g * 2), h: rows * (blockH(p, u) + g) };
}

/** A plate's blocks of one place, packed (no room kept for a row of five): its width. */
function packedWidth(p: PlaceKey, n: number, u: number): number {
  const g = gapOf(u);
  const across = Math.min(perRow(p), Math.max(n, 1));
  return across * (blockW(p, u) + g) + (p === 'H' ? 0 : Math.floor((across - 1) / 5) * g * 2);
}

interface MatLayout {
  u: number;
  cols: Record<PlaceKey, { x: number; w: number }>;
  w: number;
  /** The blocks' rows (the columns' heads and counts not included). */
  h: number;
  /** The plates' height (0: no plates). */
  plateH: number;
  /** The row of plates' width (0: no plates): as wide as the mat, or wider when a plate's last blocks need it. */
  platesW: number;
}

const HEAD_H = 34;
const COUNT_H = 26;
/** Largest unit cube (px) and the share of the box's height the mat may take (docs/19 §3.2: the mat is read across the stage, like the fraction bars). */
const MAX_U = 32;
const MAT_SHARE = 0.62;

/**
 * A row of the mat is at least a rod tall, so the mat keeps its size while blocks are traded between columns;
 * the equal rows of a × (`copies`) are as tall as their own blocks (a row of ones is a row of cubes).
 */
const rowHeight = (c: Counts, u: number, copies = false) => Math.max(...PLACES.map((p) => (c[p] > 0 || !copies ? columnSize(p, c[p], u).h : 0)), copies ? u + gapOf(u) : 10 * u + gapOf(u));
/** The gap between two equal rows of a ×. */
const rowGap = (u: number) => Math.round(u * 1.2);

/**
 * The unit that fits the mat (its rows of a ×), and under it the plates with the share's final blocks, in the box:
 * the largest whole-pixel cube (crisp edges) with the mat at most `MAT_SHARE` of the box's height.
 */
function matLayout(rows: Counts[], plates: { k: number; each: Counts } | null, box: { w: number; h: number }, maxU: number, share: number, hundreds: boolean): MatLayout {
  const most = (p: PlaceKey) => Math.max(...rows.map((c) => c[p]));
  const copies = rows.length > 1;
  let best: MatLayout | null = null;
  // The equal rows of a × are short (a row of ones is one cube tall): their cubes may be larger.
  for (let u = copies ? Math.round(maxU * 1.25) : maxU; u >= 3; u -= 1) {
    const pad = Math.max(8, Math.round(u * 1.4));
    // A column is at least as wide as its head (HUNDREDS) and room for a row of five.
    // The hundreds column keeps room for a flat only when the number has (or can come to have) hundreds.
    // An empty hundreds column (no hundreds, and none to come), or a place the rows of a × do not have, is only as wide as its head.
    const w = PLACES.map((p) => Math.round((p === 'H' && !hundreds) || (copies && most(p) === 0) ? 84 : Math.max(columnSize(p, most(p), u).w + 2 * pad, (p === 'O' ? 5 * u * 1.35 : 6 * u) + 2 * pad, 66)));
    const total = w.reduce((a, b) => a + b, 0);
    const height = rows.reduce((s, c) => s + rowHeight(c, u, copies) + rowGap(u), 0);
    const pu = Math.max(2, Math.floor(u * 0.7));
    const plateH = plates ? Math.max(...PLACES.map((pl) => columnSize(pl, Math.max(plates.each[pl], 1), pu).h)) + 22 : 0;
    const plateW = plates ? PLACES.reduce((s, pl) => s + (plates.each[pl] ? packedWidth(pl, plates.each[pl], pu) + 8 : 0), 16) : 0;
    // The plates sit under the mat, one per share; a row of them may be wider than the mat when each plate's blocks need it.
    const platesW = plates ? Math.max(total, plates.k * (plateW + 10)) : 0;
    let x = 0;
    const cols = {} as MatLayout['cols'];
    PLACES.forEach((p, i) => {
      cols[p] = { x, w: w[i]! };
      x += w[i]!;
    });
    best = { u, cols, w: total, h: height, plateH, platesW };
    const tall = HEAD_H + height + COUNT_H + (plates ? plateH + 14 : 0);
    if (Math.max(total, platesW) <= box.w && tall <= box.h * share) return best;
  }
  return best!;
}

export function BlocksModel(p: BlocksModelProps) {
  const { model: m, box, locale, task, state } = p;
  const T = (key: Parameters<typeof t>[1], vars?: Record<string, string | number>) => t(locale, key, vars);
  const live = !!p.editable && !!task && !!state && state.phase === 0;
  const k = task?.kind === 'share' ? task.k : (m.plates ?? 0);
  const dealt = state && task?.kind === 'share' ? state.dealt : counts(m.dealt);
  const mat: Counts = state && (task?.kind === 'regroup' || task?.kind === 'share') ? state.mat : matOf(m);
  // × not pushed together yet: one row per copy.
  const rowsOf: Counts[] = !task && m.copies && !m.combined && !m.left ? Array.from({ length: m.copies }, () => standard(m.value ?? 0)) : [mat];
  const column = m.column;
  const cc = column ? columnCells(column) : null;
  const wide = box.w >= 700;
  // The column working beside the mat on a wide stage (at most about half the box's height), under it on a narrow one;
  // its cell follows the stage (crisp, whole pixels), not the blocks: a long working is read at the same size as a short one.
  const cellMax = cc ? Math.round(clamp(Math.min((box.h * (wide ? 0.55 : m.mat ? 0.9 : 0.75)) / (cc.rows * 1.5), (wide ? 0.3 * box.w : box.w - 20) / cc.cols), 14, 56)) : 0;
  const reserveW = cc && wide ? Math.min(0.34 * box.w, cc.cols * cellMax + 48) : 0;
  // The plates are laid out for the share's last blocks (each plate's digits of the quotient), so they never grow.
  const value = task?.kind === 'share' && typeof task.value === 'number' ? task.value : (m.value ?? total(matOf(m)) + k * total(counts(m.dealt)));
  const each = k > 0 ? standard(Math.floor(value / k)) : standard(0);
  // Hundreds on the mat now, or in the number worked with (a check's blocks can be traded up into a hundred).
  const hundreds = rowsOf.some((r) => r.H > 0) || value * (m.copies ?? 1) >= 100 || (task?.kind === 'regroup' && typeof task.value === 'number' && task.value >= 100);
  // The rows of a × are numbered ×1, ×2 … to the mat's left: room for the numbers.
  const lab = m.mat && rowsOf.length > 1 ? 36 : 0;
  const matRows = m.mat ? rowsOf : [ZERO_ROW];
  const platesFor = k > 0 && m.mat ? { k, each } : null;
  const matBoxW = Math.max(120, box.w - reserveW - 20 - lab);
  let fit: MatLayout;
  let cellW = 0;
  if (cc && !wide && m.mat && !p.mini) {
    // Narrow: the mat above its working, sharing the box's height (room left for the sentence under them). The split that
    // draws both largest together: the digit cell about six unit cubes (cells at least 18 px), neither squeezed for the other.
    const avail = box.h - 64;
    let best: { score: number; cell: number; fit: MatLayout } | null = null;
    for (let c = cellMax; c >= Math.min(18, cellMax); c -= 2) {
      const rest = avail - (cc.rows * 1.5 * c + 20);
      if (rest < 90) continue;
      const f = matLayout(matRows, platesFor, { w: matBoxW, h: rest }, MAX_U, 1, hundreds);
      const score = Math.min(f.u * 6, c);
      if (!best || score > best.score) best = { score, cell: c, fit: f };
    }
    fit = best?.fit ?? matLayout(matRows, platesFor, { w: matBoxW, h: Math.max(90, avail * 0.5) }, MAX_U, 1, hundreds);
    cellW = best?.cell ?? 14;
  } else {
    fit = matLayout(matRows, platesFor, { w: matBoxW, h: box.h }, p.mini ? 10 : MAX_U, p.mini ? 1 : MAT_SHARE, hundreds);
    if (cc) cellW = Math.round(clamp(Math.min(cellMax, wide ? (reserveW - 48) / cc.cols : box.w / cc.cols), 14, 56));
  }
  const u = fit.u;
  const plateU = Math.max(2, Math.floor(u * 0.7));
  const headH = HEAD_H;
  const matW = m.mat ? fit.w : 0;
  const matH = m.mat ? fit.h + HEAD_H + COUNT_H : 0;
  const plates = k > 0 && m.mat ? fit.plateH + 14 : 0;
  // The mat and the plates under it share a width (the plates' row may be the wider); each is centred in it.
  const figW = m.mat ? Math.max(fit.w, fit.platesW) + lab : 0;
  const mx = lab + Math.round((figW - lab - matW) / 2);
  const colW = cc ? cc.cols * cellW : 0;
  const colH = cc ? cc.rows * cellW * 1.5 : 0;
  const contentW = wide ? figW + (cc ? colW + (m.mat ? 40 : 0) : 0) : Math.max(figW, colW);
  const contentH = wide ? Math.max(matH + plates, colH) : matH + plates + (cc ? colH + (m.mat ? 20 : 0) : 0);
  const x0 = Math.round(box.x + (box.w - contentW) / 2);
  const y0 = Math.round(box.y + Math.max(0, (box.h - contentH) / 2));
  const focus: PlaceKey | null = m.focus ?? (column ? columnFocus(column) : null) ?? (m.trade ? tradeOf(m.trade).from : null);
  const out: ReactNode[] = [];
  const trade = m.trade && !task ? tradeOf(m.trade) : null;
  const traded = p.move === 'trade' && trade;

  if (m.mat) {
    const tap = (place: PlaceKey) => {
      if (!live || !task || !state) return;
      if (task.kind === 'regroup') {
        const up: Trade | null = place === 'O' ? 'O>T' : place === 'T' ? 'T>H' : null;
        if (up && canTrade(state.mat, up) && state.mat[place] >= 10) p.act?.({ do: 'trade', trade: up });
      } else if (task.kind === 'share') {
        if (state.mat[place] >= task.k) p.act?.({ do: 'share', place });
        else if (place !== 'O' && state.mat[place] > 0) p.act?.({ do: 'trade', trade: place === 'H' ? 'H>T' : 'T>O' });
      }
    };
    const key = (place: PlaceKey) => (e: KeyboardEvent<SVGGElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        tap(place);
      }
    };
    PLACES.forEach((place) => {
      const c = fit.cols[place];
      const cx = x0 + mx + c.x;
      out.push(
        <g key={`col${place}`} className="ms-mat__col" data-lit={focus === place || undefined}>
          <rect className="ms-mat__band" x={cx} y={y0} width={c.w} height={matH} />
          <text className="ms-mat__head" x={cx + c.w / 2} y={y0 + 15} textAnchor="middle">
            {t('en', `math.blocks.${place}`).toLocaleUpperCase('en')}
          </text>
          <text className="ms-mat__head ms-mat__head--zh" x={cx + c.w / 2} y={y0 + 29} textAnchor="middle" lang="zh-Hans">
            {t('zh', `math.blocks.${place}`)}
          </text>
          {live && (
            <rect
              className="ms-mat__hit"
              role="button"
              tabIndex={0}
              data-keys="own"
              x={cx}
              y={y0}
              width={c.w}
              height={matH}
              aria-label={T(task?.kind === 'regroup' ? 'math.blocks.tapTrade' : 'math.blocks.tapShare', { place: T(`math.blocks.${place}`), n: state!.mat[place] })}
              onKeyDown={key(place) as unknown as (e: KeyboardEvent<SVGRectElement>) => void}
              onPointerDown={(e: PointerEvent<SVGRectElement>) => {
                if (e.button !== 0) return;
                e.preventDefault();
                tap(place);
              }}
            />
          )}
        </g>,
      );
    });
    // Blocks, row by row (one row per copy of a ×).
    let ry = y0 + headH + 6;
    rowsOf.forEach((row, ri) => {
      const rowH = rowHeight(row, u, rowsOf.length > 1);
      if (rowsOf.length > 1)
        out.push(
          <text key={`x${ri}`} className="ms-mat__rowno" x={x0 + mx - 8} y={ry + Math.min(rowH, 10 * u) / 2 + 4} textAnchor="end">
            ×{ri + 1}
          </text>,
        );
      PLACES.forEach((place) => {
        const c = fit.cols[place];
        const pad = Math.round((c.w - columnSize(place, Math.max(row[place], 1), u).w) / 2);
        for (let i = 0; i < row[place]; i++) {
          // Rows of a × share one numbering per place, so pushing them together moves each block.
          const index = rowsOf.slice(0, ri).reduce((s, r) => s + r[place], 0) + i;
          const combinedIndex = index;
          const at = rowsOf.length > 1 ? slot(place, i, u) : slot(place, combinedIndex, u);
          const lit = trade && !traded && trade.from === place && i < trade.take;
          const fresh = traded && trade.to === place && i >= row[place] - trade.give;
          out.push(
            <g key={`b${place}${index}`} className="ms-block" data-place={place} data-lit={lit || undefined} data-new={fresh || undefined} style={{ transform: `translate(${x0 + mx + c.x + pad + at.x}px, ${ry + at.y}px)` }}>
              <Block place={place} u={u} />
            </g>,
          );
        }
        // The blocks traded away, sliding into the next column as they go.
        if (traded && trade.from === place && ri === rowsOf.length - 1) {
          const to = fit.cols[trade.to];
          for (let j = 0; j < trade.take; j++) {
            const at = slot(place, row[place] + j, u);
            const sx = x0 + mx + c.x + pad + at.x;
            const sy = ry + at.y;
            const dx = x0 + mx + to.x + to.w / 2 - sx;
            out.push(
              <g key={`gone${j}`} style={{ transform: `translate(${sx}px, ${sy}px)` }} aria-hidden="true">
                <g className="ms-block ms-block--gone" data-place={place} style={{ ['--dx' as string]: `${dx}px`, animationDelay: `${j * 18}ms` }}>
                  <Block place={place} u={u} />
                </g>
              </g>,
            );
          }
        }
      });
      ry += rowH + rowGap(u);
    });
    // The count under each column.
    PLACES.forEach((place) => {
      const c = fit.cols[place];
      const n = rowsOf.reduce((s, r) => s + r[place], 0);
      out.push(
        <text key={`n${place}`} className="ms-mat__count" x={x0 + mx + c.x + c.w / 2} y={y0 + matH - 8} textAnchor="middle" aria-hidden="true">
          {rowsOf.length > 1 ? `${rowsOf[0]![place]} × ${rowsOf.length}` : n}
        </text>,
      );
    });
    // Plates under the mat (÷).
    if (k > 0) {
      const py = y0 + matH + 14;
      const pitch = fit.platesW / k;
      const pw = pitch - 10;
      for (let j = 0; j < k; j++) {
        const px = x0 + lab + Math.round((figW - lab - fit.platesW) / 2) + j * pitch + 5;
        out.push(<rect key={`plate${j}`} className="ms-plate-dish" x={px} y={py} width={pw} height={fit.plateH} rx={10} />);
        let bx = px + 8;
        PLACES.forEach((place) => {
          for (let i = 0; i < dealt[place]; i++) {
            const at = slot(place, i, plateU);
            out.push(
              <g key={`p${j}${place}${i}`} className="ms-block ms-block--dealt" data-place={place} style={{ transform: `translate(${bx + at.x}px, ${py + 10 + at.y}px)`, animationDelay: `${(j * 3 + i) * 25}ms` }}>
                <Block place={place} u={plateU} />
              </g>,
            );
          }
          if (dealt[place] > 0) bx += packedWidth(place, dealt[place], plateU) + 8;
        });
      }
    }
  }
  if (column && cc) {
    const cx = wide ? x0 + figW + (m.mat ? 40 : 0) : x0 + (contentW - colW) / 2;
    const cy = wide ? y0 + Math.max(0, (Math.max(matH + plates, colH) - colH) / 2) : y0 + matH + plates + (m.mat ? 20 : 0);
    out.push(<ColumnWorking key="col" spec={column} x={cx} y={cy} cell={cellW} focus={focus} />);
  }
  if (p.ghost && task?.kind === 'regroup') {
    const g = p.ghost.mat;
    out.push(
      <text key="ghost" className="ms-array__ghost-count" x={x0 + figW / 2} y={y0 + matH + 22} textAnchor="middle" aria-hidden="true">
        {placeValueWords([g.O, g.T, g.H], locale)}
      </text>,
    );
  }
  if (p.ghost && task?.kind === 'share') {
    out.push(
      <text key="ghost" className="ms-array__ghost-count" x={x0 + figW / 2} y={y0 + matH + plates + 22} textAnchor="middle" aria-hidden="true">
        {T('math.blocks.each', { list: PLACES.filter((pl) => p.ghost!.dealt[pl] > 0).map((pl) => `${p.ghost!.dealt[pl]} ${T(`math.blocks.${pl}`)}`).join(' · ') })}
      </text>,
    );
  }
  return (
    <g className="ms-blocks" role={live ? 'group' : 'img'} aria-label={p.label} data-move={p.move ?? undefined}>
      {out}
    </g>
  );
}

const ZERO_ROW: Counts = { H: 0, T: 1, O: 5 };
