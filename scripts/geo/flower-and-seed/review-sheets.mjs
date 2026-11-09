/** Contact sheets retain BOTH sides of all four comparison views. */
import fs from "node:fs";
import sharp from "sharp";
const dir = process.argv[2];
if (!dir) throw new Error("Pass an evidence round directory.");
const ids = [
  ...new Set(
    fs
      .readdirSync(dir)
      .filter((f) => f.endsWith("-comparison.webp"))
      .map((f) =>
        f.replace(/-(front|three-quarter|profile|detail)-comparison.webp$/, ""),
      ),
  ),
];
for (const id of ids) {
  const images = [];
  for (const [i, view] of [
    "front",
    "three-quarter",
    "profile",
    "detail",
  ].entries()) {
    const path = `${dir}/${id}-${view}-comparison.webp`;
    if (!fs.existsSync(path)) continue;
    images.push({
      input: await sharp(path).resize(680, 315).toBuffer(),
      left: (i % 2) * 680,
      top: Math.floor(i / 2) * 315,
    });
  }
  await sharp({
    create: { width: 1360, height: 630, channels: 3, background: "#e9e4d8" },
  })
    .composite(images)
    .webp({ quality: 92 })
    .toFile(`${dir}/${id}-sheet.webp`);
}
