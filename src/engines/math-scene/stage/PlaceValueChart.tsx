/**
 * The place-value chart with decimal places (docs/29 §3.3, model A6b):
 * column heads in small capitals with their Chinese (TENS · ONES · TENTHS ·
 * HUNDREDTHS · THOUSANDTHS / 十位 · 个位 · 十分位 · 百分位 · 千分位), hairline
 * rules between the columns, and a large ink dot between the ones and the
 * tenths — the decimal point, the one thing on the chart that never moves.
 * A number is written as digits (a 0 in an empty place), as place-value
 * discs (ink rings printed 1 · 0.1 · 0.01 · 0.001, or $1 · 10¢ · 1¢; five to
 * a row, never coloured by place), or both. Two numbers stand one under the
 * other, lined up on the point (zeros filled in faint) or, to show the slip,
 * on their last digit (their points boxed in grey dashes). × draws equal
 * rows pushed together; ÷ plates under the chart; a trade lights the ten
 * discs (or the one) it takes; × ÷ 10ⁿ slides the digits along, a dashed
 * ghost where they were. The column method sits beside the chart (under it
 * on a narrow stage), its points on one line.
 *
 * On a check: tap a column to share it or trade (share, regroup); the second
 * row of an align-add and the digits of a shift-digits are sliders (← →).
 */
import type { KeyboardEvent, PointerEvent, ReactNode } from 'react';
import type { Locale } from '../../core/types';
import { t, tx } from '../../../i18n';
import type { BeatMove, DPlace, DTrade, PlaceValueSpec, Task } from '../schema';
import { DPLACES } from '../schema';
import type { Action, TaskState } from '../lib/state';
import { formatDecimal, thousandths, type Decimal } from '../lib/decimal';
import { asDecimal, below, chartColumns, dcounts, dstandard, dtotal, dtradeOf, discFace, PLACE_EXP, placeAt, placesBetween, placesOf, shiftedValue, spanOf, type DCounts } from '../lib/placevalue';
import { alignRange, shiftRange } from '../lib/decimal-tasks';
import { DecimalColumn, decimalColumnCells } from './DecimalColumn';
import type { Rect } from './layout';

export interface PlaceValueChartProps {
  box: Rect;
  model: PlaceValueSpec;
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

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const HEAD = 46;

interface Cellish {
  d: number;
  faint?: boolean;
}

/** One line of the chart: digits (by place, after any move), or discs. */
interface Line {
  digits?: Partial<Record<DPlace, Cellish>>;
  discs?: DCounts;
  /** Where the digits were before they slid (a shift's dashed ghost). */
  ghost?: Partial<Record<DPlace, Cellish>>;
  /** The second row of an align-add, the digits of a shift: a slider on a check. */
  slider?: 'offset' | 'shift';
  /** Its point is not on the chart's point (lined up on the last digit). */
  stray?: number | null;
  rowLabel?: string;
  /** Discs lit for a trade (from this place, how many). */
  lit?: { place: DPlace; n: number } | null;
}

/** Digits of a decimal moved `by` places (left > 0), with faint zeros filled in up to `padTo` places; `slid`: × ÷ 10ⁿ (the empty places it leaves hold a 0), not a row lined up. */
function digitLine(d: Decimal, by = 0, padTo = 0, slid = true): Partial<Record<DPlace, Cellish>> {
  const own = placesOf(d);
  const c = dstandard(d);
  const out: Partial<Record<DPlace, Cellish>> = {};
  for (const p of own) {
    const e = PLACE_EXP[p] + by;
    if (e < -3 || e > 3) continue;
    out[placeAt(e)] = { d: c[p] };
  }
  // The empty places a × 10ⁿ leaves (between the digits and the point) hold a 0.
  if (by !== 0 && slid) {
    const exps = own.map((p) => PLACE_EXP[p] + by);
    const lo = Math.min(...exps, 0);
    const hi = Math.max(...exps, 0);
    for (let e = hi; e >= lo; e--) if (!out[placeAt(e)] && e <= 3 && e >= -3) out[placeAt(e)] = { d: 0, faint: true };
  }
  for (let e = -1; e >= -padTo; e--) if (!out[placeAt(e)]) out[placeAt(e)] = { d: 0, faint: true };
  return out;
}

export function PlaceValueChart(p: PlaceValueChartProps) {
  const { model: m, box, locale, task, state } = p;
  const T = (key: Parameters<typeof t>[1], vars?: Record<string, string | number>) => t(locale, key, vars);
  const live = !!p.editable && !!task && !!state && state.phase === 0;
  const lines: Line[] = [];
  let columns: DPlace[];
  let plates = 0;
  let dealt: DCounts = dcounts(m.dealt);
  const money = !!m.money;
  const showDigits = m.show !== 'discs';
  const showDiscs = m.show !== 'digits';

  if (task?.kind === 'align-add' && state) {
    const range = alignRange(task.a, task.b, task.start);
    const P = Math.max(task.a.dp, task.b.dp);
    const top = Math.max(PLACE_EXP[placesOf(task.a)[0]!], PLACE_EXP[placesOf(task.b)[0]!] + range[1]);
    const bottom = Math.min(-task.a.dp, -task.b.dp + range[0]);
    columns = placesBetween(placeAt(top), placeAt(bottom));
    lines.push({ digits: digitLine(task.a, 0, state.padded ? P : 0) });
    lines.push({ digits: digitLine(task.b, state.offset, state.padded && state.offset === 0 ? P : 0, false), slider: 'offset', stray: state.offset === 0 ? null : state.offset });
  } else if (task?.kind === 'shift-digits' && state) {
    const [lo, hi] = shiftRange(task.value);
    const own = placesOf(task.value).map((pl) => PLACE_EXP[pl]);
    columns = placesBetween(placeAt(Math.max(...own, 0) + hi), placeAt(Math.min(...own, 0) + lo));
    lines.push({ digits: digitLine(task.value, state.shift), ghost: state.shift ? digitLine(task.value) : undefined, slider: 'shift' });
  } else if ((task?.kind === 'share' || task?.kind === 'regroup') && state) {
    const v = typeof task.value === 'number' ? null : task.value;
    const n = v ? (thousandths(v) ?? 0) : 0;
    const sp = spanOf(n, 3);
    columns = m.columns ?? placesBetween(sp.top, task.kind === 'share' ? 'th' : sp.bottom === 'O' ? 't' : sp.bottom);
    lines.push({ discs: state.pv });
    if (task.kind === 'share') {
      plates = task.k;
      dealt = state.pvDealt;
    }
  } else {
    const shift = m.shift ? m.shift.by * (m.shift.dir === 'left' ? 1 : -1) : 0;
    const pad = m.pad === true ? Math.max(...(m.rows ?? (m.value ? [m.value] : [])).map((d) => d.dp), 0) : typeof m.pad === 'object' ? m.pad.dp : 0;
    columns = chartColumns(m);
    if (m.rows) {
      const lastDp = Math.max(...m.rows.map((r) => r.dp));
      m.rows.forEach((r, i) => {
        // Lined up on the last digit: the row moved left by the places it is short of the longest.
        // Lined up on the last digit: a row with fewer places sits that many places to the right.
        const by = m.align === 'right' ? r.dp - lastDp : 0;
        lines.push({ digits: digitLine(r, by, m.align === 'point' ? pad : 0, false), stray: by ? by : null, discs: showDiscs ? dstandard(r) : undefined });
        if (i === 0 && m.align === 'right') columns = placesBetween(placeAt(Math.max(0, ...m.rows!.map((x) => PLACE_EXP[placesOf(x)[0]!] + (x.dp - lastDp)))), placeAt(-lastDp));
      });
    } else if (m.value) {
      const v = m.value;
      // On the chart: what is left (given, or what the plates have not taken), else the number.
      const shared = m.plates ? dtotal(dcounts(m.dealt)) * m.plates : 0;
      const counts = m.left ? dcounts(m.left) : m.plates && m.dealt ? dstandard(asDecimal((thousandths(v) ?? 0) - shared)) : dstandard(v);
      if (m.copies && !m.combined) {
        for (let i = 0; i < m.copies; i++) lines.push({ discs: showDiscs ? counts : undefined, digits: showDigits && !showDiscs ? digitLine(v) : undefined, rowLabel: `×${i + 1}` });
      } else {
        const discs = m.copies && m.combined ? (Object.fromEntries(DPLACES.map((pl) => [pl, counts[pl] * m.copies!])) as DCounts) : counts;
        const tr = m.trade ? dtradeOf(m.trade) : null;
        const padded = typeof m.pad === 'object' ? m.pad : v;
        lines.push({
          digits: showDigits ? digitLine(padded, shift, pad) : undefined,
          ghost: shift && showDigits ? digitLine(v) : undefined,
          discs: showDiscs ? discs : undefined,
          lit: tr && p.move !== 'trade' ? { place: tr.from, n: tr.take } : null,
        });
      }
      if (m.plates) plates = m.plates;
    }
    if (!m.columns && m.plates) {
      const deepest = placeAt(Math.min(...columns.map((c) => PLACE_EXP[c])));
      columns = placesBetween(columns[0]!, deepest);
    }
  }

  /* layout */
  const cols = columns.length;
  const cc = m.column && !task ? decimalColumnCells(m.column) : null;
  // The column method beside the chart (and its plates) on a wide stage; under them on a narrow one.
  const wide = box.w >= 720;
  const titleH = m.label && !p.mini ? 28 : 0;
  // The plates hold the discs dealt so far, each plate as wide as its discs at the end of a share need.
  const final = task?.kind === 'share' && typeof task.value !== 'number' ? dstandard(asDecimal(Math.round((thousandths(task.value) ?? 0) / task.k))) : dealt;
  const held = columns.map((pl) => Math.max(dealt[pl], final[pl])).filter((n) => n > 0);
  const discRowsOf = (c: DCounts | undefined, perRow: number) => (c ? Math.max(1, ...columns.map((pl) => Math.ceil(c[pl] / perRow))) : 0);
  const colArea = cc && wide ? cc.cols * 30 + 50 : 0;
  const chartDiscs = lines.some((l) => l.discs && columns.some((pl) => l.discs![pl] > 0));
  let cw = clamp((box.w - 40 - colArea) / cols, p.mini ? 18 : 46, p.mini ? 60 : 200);
  let shrink = 1;
  let layout = sizes(cw, shrink);
  // Too tall, or the plates left with discs much smaller than the chart's: the chart and the column method give way together.
  const cramped = (l: typeof layout) => l.total > box.h - 20 - titleH || (plates > 0 && l.pl.pd < (chartDiscs ? l.disc * 0.8 : p.mini ? 8 : 20));
  const minCw = p.mini ? 14 : 40;
  while (cramped(layout) && (cw > minCw || shrink > 0.45)) {
    cw = Math.max(minCw, cw - 4);
    shrink = Math.max(0.45, shrink - 0.04);
    layout = sizes(cw, shrink);
  }
  /**
   * The plates' discs, the plates in one to three rows, each place's discs `q` to a row in a plate: the largest discs (up to the
   * chart's largest) that fit `room` wide and `tall` high.
   */
  function platesOf(room: number, tall: number, chartDisc: number) {
    // As large as the chart's discs when the chart still holds some (the same coins), else up to the chart's largest.
    const disc = chartDiscs ? chartDisc : p.mini ? 20 : 40;
    if (!plates) return { pd: 0, q: 5, rows: 0, pw: 0, ph: 0, h: 0, w: 0 };
    let best = { pd: 0, q: 5, rows: 1 };
    for (const rows of [1, 2, 3]) {
      if (rows > plates) break;
      for (const q of [5, 4, 3, 2]) {
        const across = Math.ceil(plates / rows);
        const units = held.reduce((sum, n) => sum + Math.min(n, q), 0) * 1.15;
        const fixed = 16 + held.length * 6;
        const deep = Math.max(1, ...held.map((n) => Math.ceil(n / q)));
        const byWidth = units > 0 ? (room / across - 10 - fixed) / units : disc;
        const byHeight = ((tall + 10) / rows - 10 - 24) / (deep * 1.15);
        const pd = Math.min(disc, byWidth, byHeight);
        // A plate row more, or narrower blocks, only for discs clearly larger.
        if (pd > best.pd + 2) best = { pd, q, rows };
      }
    }
    const pd = Math.max(10, best.pd);
    const pw = Math.max(70, 16 + held.reduce((sum, n) => sum + Math.min(n, best.q) * pd * 1.15 + 6, 0));
    const deep = Math.max(1, ...held.map((n) => Math.ceil(n / best.q)));
    const ph = Math.max(pd * 2.2, deep * pd * 1.15 + 24);
    const across = Math.ceil(plates / best.rows);
    return { ...best, pd, pw, ph, h: best.rows * (ph + 10) - 10, w: across * (pw + 10) };
  }
  function sizes(w: number, k: number) {
    const disc = clamp((w - 14) / 4.4, 12, 40);
    const perRow = clamp(Math.floor((w - 8) / (disc * 1.18)), 2, 5);
    const digitH = clamp(w * 0.95, 40, 170);
    const rowHs = lines.map((l) => (l.digits && showDigits ? digitH : 0) + (l.discs ? discRowsOf(l.discs, perRow) * disc * 1.18 + 14 : 0) + 8);
    const chartH = HEAD + rowHs.reduce((a, b) => a + b, 0) + 6;
    const colCell = cc ? clamp((wide ? Math.min(34, (box.h * 0.7) / (cc.rows * 1.5)) : Math.min(32, (box.w - 40) / cc.cols)) * k, 14, 34) : 0;
    const colH = cc ? cc.rows * colCell * 1.5 : 0;
    const colW = cc ? cc.cols * colCell : 0;
    const pl = platesOf(box.w - 20 - (cc && wide ? colW + 50 : 0), box.h - 20 - titleH - chartH - 18 - (cc && !wide ? colH + 24 : 0), disc);
    const leftH = chartH + (plates ? pl.h + 18 : 0);
    const total = wide ? Math.max(leftH, colH) : leftH + (cc ? colH + 24 : 0);
    return { disc, perRow, digitH, rowHs, chartH, colCell, colH, colW, pl, leftH, total };
  }
  const { disc, perRow, digitH, rowHs, chartH, colCell, colH, colW, pl: plate, leftH } = layout;
  const chartW = cols * cw;
  const leftW = Math.max(chartW, plate.w);
  const contentW = wide && cc ? leftW + 50 + colW : Math.max(leftW, colW);
  const x0 = box.x + (box.w - contentW) / 2 + (wide && cc ? (leftW - chartW) / 2 : (contentW - chartW) / 2) + (lines.some((l) => l.rowLabel) ? 14 : 0);
  const y0 = box.y + titleH + Math.max(0, (box.h - titleH - layout.total) / 2);
  const colX = (pl: DPlace) => x0 + columns.indexOf(pl) * cw;
  const has = (pl: DPlace) => columns.includes(pl);
  const pointX = has('O') ? colX('O') + cw : has('t') ? colX('t') : x0 + chartW;
  const out: ReactNode[] = [];
  const highlight = new Set(m.highlight ?? []);

  /* the columns: heads, rules, the lit ones */
  columns.forEach((pl, i) => {
    const x = x0 + i * cw;
    out.push(
      <g key={`h${pl}`} className="ms-pvc__col" data-lit={highlight.has(pl) || undefined}>
        <rect className="ms-pvc__band" x={x} y={y0} width={cw} height={chartH} />
        <text className="ms-pvc__head" x={x + cw / 2} y={y0 + 17} textAnchor="middle">
          {cw < 70 ? discFace(pl, false) : t('en', `math.pv.${pl}`).toLocaleUpperCase('en')}
        </text>
        <text className="ms-pvc__head ms-pvc__head--zh" x={x + cw / 2} y={y0 + 34} textAnchor="middle" lang="zh-Hans">
          {t('zh', `math.pv.${pl}`)}
        </text>
      </g>,
    );
  });
  out.push(<line key="headrule" className="ms-pvc__rule" x1={x0} x2={x0 + chartW} y1={y0 + HEAD - 4} y2={y0 + HEAD - 4} />);

  /* the lines */
  let ry = y0 + HEAD;
  lines.forEach((l, li) => {
    const h = rowHs[li]!;
    if (l.rowLabel) out.push(<text key={`rl${li}`} className="ms-pvc__rowno" x={x0 - 10} y={ry + Math.min(h, 40) / 2 + 6} textAnchor="end">{l.rowLabel}</text>);
    const digitsY = ry + digitH * 0.7;
    if (l.digits && showDigits) {
      for (const [pl, c] of Object.entries(l.digits) as [DPlace, Cellish][]) {
        if (!has(pl)) continue;
        out.push(
          <text key={`d${li}${pl}`} className={c.faint ? 'ms-pvc__digit ms-pvc__digit--faint' : 'ms-pvc__digit'} data-lit={highlight.has(pl) || undefined} x={colX(pl) + cw / 2} y={digitsY} textAnchor="middle" fontSize={digitH * 0.66} style={p.move === 'slide' && m.shift ? { ['--from' as string]: `${m.shift.by * (m.shift.dir === 'left' ? 1 : -1) * cw}px` } : undefined}>
            {c.d}
          </text>,
        );
      }
      if (l.ghost)
        for (const [pl, c] of Object.entries(l.ghost) as [DPlace, Cellish][]) {
          if (!has(pl) || c.faint) continue;
          out.push(<rect key={`g${li}${pl}`} className="ms-pvc__ghost" x={colX(pl) + cw * 0.18} y={ry + digitH * 0.12} width={cw * 0.64} height={digitH * 0.72} rx={4} />);
        }
      // The point: on the chart's point, or (lined up wrong) boxed where this row's point is.
      if (l.stray) {
        const sx = pointX - l.stray * cw;
        out.push(<rect key={`sb${li}`} className="ms-pvc__stray" x={sx - 9} y={digitsY - 14} width={18} height={22} rx={3} />);
        out.push(<circle key={`sp${li}`} className="ms-pvc__point ms-pvc__point--stray" cx={sx} cy={digitsY - 2} r={Math.max(3, cw * 0.05)} />);
      } else out.push(<circle key={`p${li}`} className="ms-pvc__point" data-on={task?.kind === 'align-add' && state?.offset === 0 ? '' : undefined} cx={pointX} cy={digitsY - 2} r={Math.max(3.5, cw * 0.055)} />);
      if (l.slider && live) out.push(<SliderRow key={`sl${li}`} {...p} kind={l.slider} x={x0} y={ry} w={chartW} h={digitH} />);
    }
    if (l.discs) {
      const dy = ry + (l.digits && showDigits ? digitH : 0) + 8;
      for (const pl of columns) {
        const n = l.discs[pl];
        for (let i = 0; i < n; i++) {
          const cx = colX(pl) + (cw - Math.min(n, perRow) * disc * 1.18) / 2 + ((i % perRow) + 0.5) * disc * 1.18;
          const cy = dy + (Math.floor(i / perRow) + 0.5) * disc * 1.18;
          const lit = l.lit && l.lit.place === pl && i < l.lit.n;
          out.push(
            <g key={`c${li}${pl}${i}`} className="ms-disc" data-lit={lit || undefined} style={{ animationDelay: m.fill ? `${Math.max(0, m.fill.indexOf(pl)) * 160 + i * 25}ms` : undefined }}>
              <circle cx={cx} cy={cy} r={disc / 2} />
              <text x={cx} y={cy + disc * 0.13} textAnchor="middle" fontSize={clamp(disc * ([0, 0.42, 0.42, 0.38, 0.3, 0.25][discFace(pl, money).length] ?? 0.25), 7, 15)}>
                {discFace(pl, money)}
              </text>
            </g>,
          );
        }
      }
      if (p.move === 'trade' && m.trade && !task) {
        const tr = dtradeOf(m.trade);
        if (has(tr.from) && has(tr.to)) out.push(<path key={`ta${li}`} className="ms-pvc__trade" d={`M${colX(tr.from) + cw / 2} ${dy - 4}Q${(colX(tr.from) + colX(tr.to)) / 2 + cw / 2} ${dy - 26} ${colX(tr.to) + cw / 2} ${dy - 4}`} />);
      }
      // Share and regroup: each column is a button.
      if (live && (task?.kind === 'share' || task?.kind === 'regroup')) out.push(<ColumnHits key={`hits${li}`} {...p} columns={columns} colX={colX} cw={cw} y={y0} h={chartH} />);
    }
    ry += h;
  });
  // The point's own line through the chart, so the eye finds it.
  out.push(<line key="pointline" className="ms-pvc__pointline" x1={pointX} x2={pointX} y1={y0 + HEAD} y2={y0 + chartH} />);

  /* plates (÷), each as wide as its discs (at the end of a share) need, in one to three rows */
  if (plates) {
    const { pd, q, pw, ph } = plate;
    const across = Math.ceil(plates / plate.rows);
    for (let j = 0; j < plates; j++) {
      const row = Math.floor(j / across);
      const inRow = Math.min(across, plates - row * across);
      const px = x0 + chartW / 2 - (inRow * (pw + 10)) / 2 + (j % across) * (pw + 10) + 5;
      const py = y0 + chartH + 18 + row * (ph + 10);
      out.push(<rect key={`pl${j}`} className="ms-plate-dish" x={px} y={py} width={pw} height={ph} rx={10} />);
      let bx = px + 8;
      for (const pl of columns) {
        for (let i = 0; i < dealt[pl]; i++) {
          const cx = bx + ((i % q) + 0.5) * pd * 1.15;
          const cy = py + 12 + (Math.floor(i / q) + 0.5) * pd * 1.15;
          out.push(
            <g key={`pd${j}${pl}${i}`} className="ms-disc ms-disc--dealt">
              <circle cx={cx} cy={cy} r={pd / 2} />
              <text x={cx} y={cy + pd * 0.13} textAnchor="middle" fontSize={clamp(pd * ([0, 0.42, 0.42, 0.38, 0.3, 0.25][discFace(pl, money).length] ?? 0.25), 6, 15)}>
                {discFace(pl, money)}
              </text>
            </g>,
          );
        }
        const n = Math.max(dealt[pl], final[pl]);
        if (n) bx += Math.min(n, q) * pd * 1.15 + 6;
      }
    }
  }

  /* the column method */
  if (cc && m.column) {
    const cx = wide ? x0 + chartW / 2 + leftW / 2 + 50 : x0 + chartW / 2 - colW / 2;
    const cy = wide ? y0 + Math.max(0, (leftH - colH) / 2) : y0 + leftH + 24;
    out.push(<DecimalColumn key="col" spec={m.column} x={cx} y={cy} cell={colCell} />);
  }
  if (titleH && m.label)
    out.push(
      <text key="title" className="ms-array__title ms-pvc__title" x={x0 + chartW / 2} y={y0 - 14} textAnchor="middle">
        {tx(m.label, locale)}
      </text>,
    );
  if (p.ghost && task?.kind === 'share') {
    out.push(
      <text key="ghost" className="ms-array__ghost-count" x={x0 + chartW / 2} y={y0 + leftH + 22} textAnchor="middle" aria-hidden="true">
        {T('math.tray.eachValue', { v: formatDecimal(asDecimal(DPLACES.reduce((s, pl) => s + p.ghost!.pvDealt[pl] * 10 ** (PLACE_EXP[pl] + 3), 0))) })}
      </text>,
    );
  }
  return (
    <g className="ms-pvc" role={live ? 'group' : 'img'} aria-label={p.label} data-move={p.move ?? undefined}>
      {out}
    </g>
  );
}

/** A column of discs as a button: share it (or trade one down when it cannot be shared), or trade 10 up. */
function ColumnHits(p: PlaceValueChartProps & { columns: DPlace[]; colX(pl: DPlace): number; cw: number; y: number; h: number }) {
  const { task, state, locale } = p;
  if (!task || !state || (task.kind !== 'share' && task.kind !== 'regroup')) return null;
  const T = (key: Parameters<typeof t>[1], vars?: Record<string, string | number>) => t(locale, key, vars);
  const tap = (pl: DPlace) => {
    const n = state.pv[pl];
    if (task.kind === 'share') {
      if (n >= task.k) p.act?.({ do: 'dshare', place: pl });
      else if (n > 0 && below(pl)) p.act?.({ do: 'dtrade', trade: `${pl}>${below(pl)}` as DTrade });
      return;
    }
    const up = DPLACES[DPLACES.indexOf(pl) - 1];
    if (n >= 10 && up) p.act?.({ do: 'dtrade', trade: `${pl}>${up}` as DTrade });
    else if (task.goal && n > 0 && below(pl) && state.pv[pl] > (task.goal[pl] ?? 0)) p.act?.({ do: 'dtrade', trade: `${pl}>${below(pl)}` as DTrade });
  };
  return (
    <g className="ms-pvc__hits">
      {p.columns.map((pl) => (
        <rect
          key={pl}
          className="ms-mat__hit"
          role="button"
          tabIndex={0}
          data-keys="own"
          x={p.colX(pl)}
          y={p.y}
          width={p.cw}
          height={p.h}
          aria-label={T(task.kind === 'share' ? 'math.pv.tapShare' : 'math.pv.tapTrade', { place: t(locale, `math.pv.${pl}`), n: state.pv[pl] })}
          onPointerDown={(e: PointerEvent<SVGRectElement>) => {
            if (e.button !== 0) return;
            e.preventDefault();
            tap(pl);
          }}
          onKeyDown={(e: KeyboardEvent<SVGRectElement>) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              tap(pl);
            }
          }}
        />
      ))}
    </g>
  );
}

/** The second row of an align-add, or the digits of a shift-digits: ← → move it one place. */
function SliderRow(p: PlaceValueChartProps & { kind: 'offset' | 'shift'; x: number; y: number; w: number; h: number }) {
  const { task, state, locale } = p;
  if (!task || !state) return null;
  const value = p.kind === 'offset' ? state.offset : state.shift;
  const range: [number, number] = task.kind === 'align-add' ? alignRange(task.a, task.b, task.start) : task.kind === 'shift-digits' ? shiftRange(task.value) : [0, 0];
  const set = (to: number) => p.act?.(p.kind === 'offset' ? { do: 'offset', to } : { do: 'shift', to });
  const text = task.kind === 'shift-digits' ? formatDecimal(shiftedValue(task.value, value) ?? task.value) : t(locale, value === 0 ? 'math.tray.onPoint' : 'math.tray.offPoint');
  return (
    <rect
      className="ms-pvc__slider"
      role="slider"
      tabIndex={0}
      data-keys="arrows"
      aria-label={t(locale, p.kind === 'offset' ? 'math.tray.rowLeft' : 'math.tray.shiftLeft')}
      aria-valuemin={range[0]}
      aria-valuemax={range[1]}
      aria-valuenow={value}
      aria-valuetext={text}
      x={p.x}
      y={p.y}
      width={p.w}
      height={p.h}
      onKeyDown={(e: KeyboardEvent<SVGRectElement>) => {
        if (e.key === 'ArrowLeft' && value < range[1]) {
          e.preventDefault();
          set(value + 1);
        } else if (e.key === 'ArrowRight' && value > range[0]) {
          e.preventDefault();
          set(value - 1);
        }
      }}
    />
  );
}
