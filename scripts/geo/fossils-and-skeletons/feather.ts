/**
 * The enlarged comparison feather (`myna-feather`): a flight feather, not a leaf.
 * Long and nearly parallel-sided with a rounded tip, the vane narrow on the leading
 * side and wide on the trailing side, split in a few places along the barbs, on a
 * pale shaft that tapers to the tip and runs on below the vane as a bare quill.
 * Scene units, drawn in the feather's own plane; y runs from quill to tip.
 */
type P2 = [number, number];
type V3 = [number, number, number];

const AT: V3 = [1.755641, 2.059677, 0.731712];
const QUILL_END = -1.85;
const VANE_START = -1.25;
const TIP = 1.94;
const LEADING = 0.17;
const TRAILING = 0.42;
/** A barb leaves the shaft at about 40 degrees: rise per unit of width. */
const BARB_RISE = 1.15;
const BARBS_PER_SIDE = 32;
const round = (v: number) => Number(v.toFixed(6));

/** The shaft's gentle curve towards the trailing side. */
const shaft = (y: number) => 0.11 * ((y - QUILL_END) / (TIP - QUILL_END)) ** 2;

/** 0 at the base of the vane, 1 along the parallel-sided middle, rounding off over the last fifth. */
function envelope(y: number): number {
  const t = (y - VANE_START) / (TIP - VANE_START);
  if (t <= 0 || t >= 1) return 0;
  const base = Math.min(1, (t / 0.12) ** 0.7);
  return t > 0.8 ? base * Math.sqrt(1 - ((t - 0.8) / 0.2) ** 2) : base;
}

const edge = (side: 1 | -1, y: number): P2 => [shaft(y) + side * (side > 0 ? TRAILING : LEADING) * envelope(y), y];

/** Splits between barbs: fractions along the vane, per side. */
const SPLITS: Record<'1' | '-1', number[]> = { '1': [0.5, 0.73], '-1': [0.62] };

function sideOutline(side: 1 | -1): P2[] {
  const out: P2[] = [];
  const span = TIP - VANE_START;
  const steps = 52;
  const splits = SPLITS[String(side) as '1' | '-1'];
  // Points crowd towards the tip, so the rounded end stays round.
  const at = (i: number) => 1 - (1 - i / steps) ** 1.7;
  for (let i = 1; i < steps; i++) {
    out.push(edge(side, VANE_START + at(i) * span));
    for (const s of splits) {
      if (s < at(i) || s >= at(i + 1)) continue;
      const y = VANE_START + s * span;
      const [x, yEdge] = edge(side, y);
      const inward = (x - shaft(y)) * 0.55;
      out.push([x, yEdge - 0.012], [x - inward, yEdge - Math.abs(inward) * BARB_RISE], [x, yEdge + 0.012]);
    }
  }
  return out;
}

function barbs(side: 1 | -1): P2[][] {
  const out: P2[][] = [];
  const span = TIP - VANE_START;
  const full = side > 0 ? TRAILING : LEADING;
  for (let i = 0; i < BARBS_PER_SIDE; i++) {
    const y0 = VANE_START + (0.015 + (i / BARBS_PER_SIDE) * 0.93) * span;
    // The barb ends just inside the vane edge at its own height: bisect for where that is.
    let lo = 0;
    let hi = full;
    for (let k = 0; k < 24; k++) {
      const w = (lo + hi) / 2;
      if (full * envelope(y0 + w * BARB_RISE) * 0.97 > w) lo = w;
      else hi = w;
    }
    const w = lo;
    if (w < 0.01) continue;
    const y1 = y0 + w * BARB_RISE;
    const x0 = shaft(y0);
    const x1 = shaft(y1) + side * w;
    // A slight curve towards the tip, as real barbs have.
    out.push([[x0, y0], [x0 + (x1 - x0) * 0.55, y0 + (y1 - y0) * 0.46], [x1, y1]]);
  }
  return out;
}

export function flightFeather() {
  const outline = [[shaft(VANE_START), VANE_START] as P2, ...sideOutline(1), [shaft(TIP), TIP] as P2, ...sideOutline(-1).reverse()];
  const veins = [...barbs(1), ...barbs(-1)];
  const pathY = [QUILL_END, -1.55, VANE_START, -0.6, 0.1, 0.8, 1.4, 1.92];
  const radius = [0.044, 0.046, 0.04, 0.032, 0.024, 0.016, 0.009, 0.004];
  return [
    {
      kind: 'wing',
      at: AT,
      outline: outline.map(([x, y]) => [round(x), round(y)]),
      veins: veins.map((v) => v.map(([x, y]) => [round(x), round(y)])),
      thickness: 0.02,
      color: 'powder',
      tint: 'token:mat-wing',
      scale: [1, 1, 1],
    },
    {
      kind: 'sweep',
      at: [AT[0], AT[1], round(AT[2] + 0.008)],
      path: pathY.map((y) => [round(shaft(y)), y, 0]),
      radius,
      radial: 24,
      segments: 48,
      caps: 'round',
      closed: false,
      section: { flat: 1 },
      up: [0, 0, 1],
      color: 'powder',
      tint: 'token:bone',
      scale: [1, 1, 1],
    },
  ];
}
