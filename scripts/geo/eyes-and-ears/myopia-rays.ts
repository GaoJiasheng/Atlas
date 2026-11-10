/**
 * Myopia ray diagram on the eye section (near-far-and-focus-5). Parallel light from a distant
 * object bends at the cornea, then at the lens, comes to a focus in front of the retina, crosses
 * and spreads again, so it lands on the retina as a blur and not a point (S5).
 * Scene units on the eye's axis (+X towards the back of the eye), just in front of the cut plane.
 * The cornea alone would focus behind the retina; the lens brings the focus forward.
 */
type V3 = [number, number, number];
const Z = 0.03;
const START_X = -3.78;
const LENS_X = -2.47;
/** Back of the eye: a sphere fitted to the retina part's profile. */
const RETINA_CENTRE = -1.9;
const RETINA_R = 0.8077;
const FOCUS_X = -1.42;
const CORNEA_ONLY_FOCUS_X = -0.72;
// Two rays, the usual textbook pair: the eye's drawn-triangle budget (180k) leaves room for little more.
const HEIGHTS = [0.3, -0.3];
const RADIUS = 0.0105;
const TINT = 'token:ray-top';
const round = (v: number) => Number(v.toFixed(5));
const corneaX = (y: number) => -3.08 + (y * y) / (2 * 0.7);
const retinaX = (y: number) => RETINA_CENTRE + Math.sqrt(RETINA_R * RETINA_R - y * y);

/** The ray's height where it reaches the retina, after crossing the axis at the focus. */
function ray(y0: number): V3[] {
  const xc = corneaX(y0);
  const yLens = y0 * (1 - (LENS_X - xc) / (CORNEA_ONLY_FOCUS_X - xc));
  const slope = -yLens / (FOCUS_X - LENS_X);
  // Solve the line against the curved retina.
  let x = retinaX(0);
  for (let k = 0; k < 6; k++) x = retinaX(yLens + slope * (x - LENS_X));
  return [[START_X, y0, Z], [xc, y0, Z], [LENS_X, yLens, Z], [FOCUS_X, 0, Z], [x, yLens + slope * (x - LENS_X), Z]];
}

const sweep = (points: V3[], radius: number, tint: string) => ({
  kind: 'sweep',
  at: points[0]!.map(round),
  path: points.map((p) => [round(p[0] - points[0]![0]), round(p[1] - points[0]![1]), round(p[2] - points[0]![2])]),
  radius,
  radial: 6,
  segments: points.length > 2 ? 8 : 4,
  caps: 'none',
  color: 'tissue',
  tint,
});

export function myopiaRays() {
  const rays = HEIGHTS.map(ray);
  const lastY = rays[0]![4]![1];
  const blur: V3[] = Array.from({ length: 5 }, (_, i) => {
    const y = lastY + ((-2 * lastY) * i) / 4;
    return [retinaX(y), y, Z] as V3;
  });
  const dotProfile = Array.from({ length: 5 }, (_, i) => {
    const a = (i / 4) * Math.PI;
    return [round(Math.sin(a) * 0.034), round(-Math.cos(a) * 0.034)];
  });
  return {
    primitive: { kind: 'lathe', profile: dotProfile, segments: 8, color: 'tissue', tint: 'token:signal', at: [FOCUS_X, 0, Z] },
    // Each leg is its own straight tube, so the bends at the cornea, the lens and the focus stay sharp.
    extra: [...rays.flatMap((r) => r.slice(1).map((p, i) => sweep([r[i]!, p], RADIUS, TINT))), sweep(blur, RADIUS * 1.9, 'token:signal')],
  };
}
