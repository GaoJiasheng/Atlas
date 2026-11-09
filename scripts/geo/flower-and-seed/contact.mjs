import fs from "node:fs";
import sharp from "sharp";
const dir = process.argv[2] ?? "scripts/geo/flower-and-seed/refs";
const names = fs
  .readdirSync(dir)
  .filter((x) => x.endsWith(".jpg") || x.endsWith("-three-quarter.png"));
const w = 350,
  h = 310,
  items = [];
for (let i = 0; i < names.length; i++) {
  const b = await sharp(`${dir}/${names[i]}`)
    .resize(w, h - 30, { fit: "contain", background: "#e9e4d8" })
    .png()
    .toBuffer();
  items.push({ input: b, left: (i % 4) * w, top: Math.floor(i / 4) * h });
  items.push({
    input: Buffer.from(
      `<svg width="350" height="30"><text x="8" y="20" font-size="15">${names[i]}</text></svg>`,
    ),
    left: (i % 4) * w,
    top: Math.floor(i / 4) * h + h - 30,
  });
}
await sharp({
  create: {
    width: w * 4,
    height: Math.ceil(names.length / 4) * h,
    channels: 3,
    background: "#e9e4d8",
  },
})
  .composite(items)
  .png()
  .toFile(`${dir}/contact.png`);
