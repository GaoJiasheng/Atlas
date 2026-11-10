/**
 * The bacteria close-up: a round magnifier inset above the empty plate, tilted to the
 * close-up camera. A pale disc of leaf tissue under a dark rim carries many small rods and
 * round cells, so they read as microbes on a leaf surface and not as stones beside the bank.
 * Scene units. The rod layout is fixed so a rebuild draws the same picture.
 */
type V3 = [number, number, number];
// Above the fungal threads (they stand at x 1.04, z 0.09, up to y 0.21), so neither inset hides the other.
const CENTRE: V3 = [1.02, 0.37, -0.06];
const RADIUS = 0.135;
const DISC = 0.008;
/** The disc faces up the close-up camera's line: normal, and the two directions in its face. */
const N: V3 = [0, 0.342, 0.94];
const U: V3 = [1, 0, 0];
const V: V3 = [0, 0.94, -0.342];
const round = (v: number) => Number(v.toFixed(5));
const onDisc = (a: number, b: number, lift: number): V3 => [0, 1, 2].map((i) => round(CENTRE[i]! + U[i]! * a + V[i]! * b + N[i]! * (DISC / 2 + lift))) as V3;

const INK = 'token:mat-rock-dark';
/** [a, b, angle in degrees] in units of the disc radius; angle null is a round cell. */
const CELLS: [number, number, number | null][] = [
  [-0.62, 0.34, 25], [-0.4, 0.58, 110], [-0.12, 0.66, 40], [0.2, 0.62, 150], [0.5, 0.42, 70],
  [-0.74, -0.04, 95], [-0.46, 0.14, 160], [-0.18, 0.28, 60], [0.12, 0.26, null], [0.4, 0.14, 15],
  [0.7, 0.08, 125], [-0.6, -0.36, 35], [-0.3, -0.16, null], [0, -0.02, 130], [0.28, -0.18, 50],
  [0.58, -0.3, 165], [-0.36, -0.58, 80], [-0.06, -0.42, 20], [0.24, -0.58, 105], [0.48, 0.66, null],
  [-0.72, 0.52, null], [0.72, -0.5, null],
];

export function bacteriaInset() {
  const rodLength = 0.036;
  const rodRadius = 0.0078;
  const extra: unknown[] = [
    { kind: 'torus', size: [RADIUS, 0.0048], color: 'plastic', tint: 'token:ink-2', rotation: [-20, 0, 0], at: onDisc(0, 0, 0) },
  ];
  for (const [a, b, angle] of CELLS) {
    const x = a * RADIUS;
    const y = b * RADIUS;
    if (angle === null) {
      extra.push({ kind: 'sweep', at: onDisc(x, y, rodRadius), path: [[0, 0, 0], [round(rodRadius * 0.3), 0, 0]], radius: rodRadius, radial: 12, segments: 4, caps: 'round', color: 'tissue', tint: INK });
      continue;
    }
    const c = (Math.cos((angle * Math.PI) / 180) * rodLength) / 2;
    const s = (Math.sin((angle * Math.PI) / 180) * rodLength) / 2;
    const dx = [0, 1, 2].map((i) => U[i]! * c + V[i]! * s);
    extra.push({
      kind: 'sweep',
      at: onDisc(x - c, y - s, rodRadius),
      path: [[0, 0, 0], dx.map((v) => round(v)), dx.map((v) => round(2 * v))],
      radius: rodRadius,
      radial: 12,
      segments: 8,
      caps: 'round',
      color: 'tissue',
      tint: INK,
    });
  }
  return {
    primitive: { kind: 'cylinder', size: [RADIUS, RADIUS, DISC], color: 'tissue', tint: 'token:mat-leaf-litter', rotation: [70, 0, 0], at: CENTRE },
    extra,
  };
}
