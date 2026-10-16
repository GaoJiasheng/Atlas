import sharp from 'sharp';
import { controlPoints, object, readJson, required } from './strict-input';
const manifest = object(readJson('scripts/geo/warring-states/raster-manifest.json'));
for (const [id, value] of Object.entries(object(manifest.raster))) {
  const points = controlPoints(object(value).controlPoints);
  const file = `scripts/geo/warring-states/raw/${id}.${['G9', 'G11'].includes(id) ? 'jpg' : 'png'}`;
  const metadata = await sharp(file).metadata();
  const width = required(metadata.width, `${id} width`), height = required(metadata.height, `${id} height`);
  const radius = Math.max(width / 250, 1.6), font = Math.max(width / 95, 6);
  let svg = `<svg width="${width}" height="${height}">`;
  points.forEach((point, index) => {
    const [x, y] = point.svg;
    svg += `<circle cx="${x}" cy="${y}" r="${radius}" fill="none" stroke="#00ffff" stroke-width="1"/><path d="M${x - radius * 2} ${y}H${x + radius * 2}M${x} ${y - radius * 2}V${y + radius * 2}" stroke="#00ffff" stroke-width=".5"/><text x="${x + radius * 2}" y="${y - radius * 2}" font-size="${font}" fill="#002cff" stroke="white" stroke-width=".2">${index + 1}</text>`;
  });
  svg += '</svg>';
  const buffer = await sharp(file).composite([{ input: Buffer.from(svg) }]).toBuffer();
  await sharp(buffer).resize({ width: Math.min(1600, width * 2) }).toFile(`scripts/geo/warring-states/check/raster-${id}-control-points.png`);
}
