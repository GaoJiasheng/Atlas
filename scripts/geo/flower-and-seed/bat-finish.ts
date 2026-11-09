/** Authored short coat. Like living-things' finish samplers, pigment and relief
 * share one seeded field; the independent UV1 mask still controls bare skin/gloss.
 * No photo pixels, canvas, runtime fetch or engine changes.
 */
import sharp from "sharp";
import { Color, Float32BufferAttribute, type BufferGeometry } from "three";
import { rng } from "../living-things/kit";
export const COAT = { width: 1024, height: 512, gutter: 16 } as const;

/** Continuous axial chart: U follows rump→face, V follows the circumference.
 * Keep the duplicated periodic seam vertices; never interpolate across a wrap.
 */
export function coatUV(g: BufferGeometry, n: number, m: number) {
  const uv: number[] = [];
  for (let i = 0; i <= n; i++) for (let j = 0; j <= m; j++)
    uv.push((16 + i / n * 992) / 1024, (16 + j / m * 480) / 512);
  g.setAttribute("uv", new Float32BufferAttribute(uv, 2));
  g.userData.textureUV = true;
  return g;
}

export function coatPigment(u: number, v: number) {
  const ventral = (1 - Math.cos(v * Math.PI * 2)) / 2;
  const back = new Color("#555047"), flank = new Color("#857d70");
  const c = back.lerp(flank, .08 + .92 * ventral);
  // Warm nape/shoulders, cool grey-buff face, and a pale ventral coat.
  const nape = Math.exp(-(((u - .40) / .10) ** 2)) * (1 - ventral * .75);
  c.lerp(new Color("#744518"), .45 * nape);
  return c;
}

export async function batCoatMaps() {
  const { width: W, height: H, gutter: G } = COAT, w = W - 2 * G, h = H - 2 * G;
  const field = new Float32Array(w * h), rand = rng(1052);
  // Irregular, overlapping tapered fibres. Flow runs back along -U with a
  // gentle cheek sweep; no regular fan, grid, round carpet tufts or painted gaps.
  for (let i = 0; i < 68000; i++) {
    const x = rand() * w, y = rand() * h, u = x / w;
    const len = u > .57 ? 4.5 + rand() * 7 : 6 + rand() * 10;
    const sweep = 1.5 * Math.sin(y / h * Math.PI * 2) + (rand() - .5) * 3;
    const radius = .38 + rand() * .40, height = .4 + rand() * .6;
    for (let t = 0; t <= Math.ceil(len * 2); t++) {
      const f = t / Math.ceil(len * 2), xx = x - len * f, yy = y + sweep * f + .55 * Math.sin(f * Math.PI);
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const a = Math.round(xx) + dx, b = Math.round(yy) + dy;
        if (a < 0 || a >= w) continue;
        const d = Math.hypot(a - xx, b - yy) / radius;
        if (d >= 1) continue;
        const k = ((b + h) % h) * w + a;
        field[k] = Math.max(field[k]!, height * (1 - f * .75) * Math.sqrt(1 - d * d));
      }
    }
  }
  const at = (x: number, y: number) => field[((y + h) % h) * w + Math.max(0, Math.min(w - 1, x))]!;
  const colour = Buffer.alloc(W * H * 3, 255), normal = Buffer.alloc(W * H * 3);
  for (let i = 0; i < W * H; i++) normal.set([128, 128, 255], i * 3);
  // Extend the periodic charts into a 16px gutter. Row h is row 0, so bilinear
  // sampling at BOTH seam vertices agrees before compression; decoded borders
  // are regression-tested within a small JPEG error tolerance.
  for (let y = G - 8; y <= H - G + 8; y++) for (let x = G - 8; x <= W - G + 8; x++) {
    const a = Math.max(0, Math.min(w - 1, x - G)), b = (y - G + h) % h;
    const c = coatPigment(a / w, b / h).multiplyScalar(a / w > .57 ? .90 + .20 * at(a, b) : .85 + .32 * at(a, b));
    c.convertLinearToSRGB();
    const k = (y * W + x) * 3;
    colour.set([c.r, c.g, c.b].map(v => Math.round(v * 255)), k);
    const strength = a / w > .57 ? .25 : .50;
    const dx = (at(a + 1, b) - at(a - 1, b)) * strength;
    const dy = (at(a, b + 1) - at(a, b - 1)) * strength, L = Math.hypot(dx, dy, 1);
    normal.set([-.5 * dx / L + .5, -.5 * dy / L + .5, .5 / L + .5].map(v => Math.round(v * 255)), k);
  }
  return {
    colour: await sharp(colour, { raw: { width: W, height: H, channels: 3 } }).jpeg({ quality: 64, chromaSubsampling: "4:4:4" }).toBuffer(),
    normal: await sharp(normal, { raw: { width: W, height: H, channels: 3 } }).resize(512,256).jpeg({ quality: 68, chromaSubsampling: "4:4:4" }).toBuffer(),
  };
}
