/** Periodic procedural pigmentation only. Relief remains geometry. */
import sharp from "sharp";
import { Color } from "three";
export async function fruitTexture(id: string) {
  const W = 384,
    H = 192,
    pixels = new Uint8Array(W * H * 3);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const u = (x + 0.5) / W,
        v = (y + 0.5) / H,
        a = v * Math.PI * 2;
      let c = new Color("#ffffff");
      if (u > 0.025) {
        const z = Math.cos(a),
          q = Math.sin(a),
          n =
            Math.sin(u * 45 + Math.sin(a * 7) * 1.4) +
            Math.sin(u * 89 + Math.cos(a * 11) * 1.4) * 0.6 +
            Math.sin(u * 131 + a * 0 + z * 19 + q * 23) * 0.28;
        if (id === "rubber-seeds") {
          const t = Math.max(0, Math.min(1, (n + 0.1) * 1.6));
          c.setRGB(1 - t * 0.83, 1 - t * 0.85, 1 - t * 0.87);
        } else {
          const t = Math.max(
            0,
            Math.min(
              1,
              0.5 +
                0.4 * Math.sin(u * 13 + Math.sin(a * 3) * 1.1) +
                0.25 * Math.sin(u * 23 + Math.cos(a * 2) * 2.7),
            ),
          );
          c.set("#576a2f").lerp(new Color("#744518"), t).multiplyScalar(0.85);
          const U = u * 28,
            V = v * 22,
            ix = Math.floor(U),
            iy = Math.floor(V),
            hash = (k: number) => {
              const x =
                Math.sin(ix * 17.71 + iy * 23.13 + k * 9.7) * 43758.5453;
              return x - Math.floor(x);
            },
            dx = U - ix - (0.2 + 0.6 * hash(1)),
            dy = V - iy - (0.2 + 0.6 * hash(2));
          if (dx * dx + dy * dy < (0.065 + 0.025 * hash(3)) ** 2)
            c.lerp(new Color("#e0d6bf"), 0.38);
        }
      }
      c.convertLinearToSRGB();
      pixels[(y * W + x) * 3] = Math.max(
        0,
        Math.min(255, Math.round(c.r * 255)),
      );
      pixels[(y * W + x) * 3 + 1] = Math.max(
        0,
        Math.min(255, Math.round(c.g * 255)),
      );
      pixels[(y * W + x) * 3 + 2] = Math.max(
        0,
        Math.min(255, Math.round(c.b * 255)),
      );
    }
  return sharp(pixels, { raw: { width: W, height: H, channels: 3 } })
    .png({ palette: true, colours: 64 })
    .toBuffer();
}
