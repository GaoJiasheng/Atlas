/** Offline raster proof of the production field recipe, no browser or GPU. */
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { makeMicroscopeSim } from '../../../src/engines/space-scene/lib/sim/microscope-fixture.ts';
import { microscopeFeatures } from '../../../src/engines/space-scene/lib/sim/microscope.ts';
import { polishField } from './polish-field.mjs';
const sim = polishField(makeMicroscopeSim());
const dir = '/private/tmp/atlas-cells-polish';
mkdirSync(dir, { recursive: true });
for (const objective of [4, 10, 40]) {
  const features = microscopeFeatures(sim.microscope, { specimen: 'onion-bulb', objective, 'slide-x': -200, 'slide-y': 0, 'focus-z': 0, illumination: 1, 'field-on': true });
  const scale = 512 / (500 * sim.microscope.fieldNumberMm / objective);
  const geometry = features.sort((a, b) => (a.role === 'cytoplasm-area' ? -1 : 0) - (b.role === 'cytoplasm-area' ? -1 : 0)).map(f => {
    const x = 512 + f.u * 512, y = 512 - f.v * 512;
    return f.kind === 'ellipse'
      ? `<ellipse cx="${x}" cy="${y}" rx="${f.axesUm[0] * scale / 2}" ry="${f.axesUm[1] * scale / 2}" fill="#2A2824" opacity="${f.contrast}"/>`
      : `<polygon points="${f.pointsUm.map(([px, py]) => `${x - px * scale},${y + py * scale}`).join(' ')}" ${f.role === 'wall' ? `fill="none" stroke="#2A2824" stroke-width="2.8"` : `fill="#2A2824"`} opacity="${f.contrast}"/>`;
  }).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024"><defs><clipPath id="disk"><circle cx="512" cy="512" r="510"/></clipPath></defs><rect width="1024" height="1024" fill="#E9E4D8"/><g clip-path="url(#disk)">${geometry}</g><circle cx="512" cy="512" r="510" fill="none" stroke="#2A2824" stroke-width="2"/></svg>`;
  await sharp(Buffer.from(svg)).png().toFile(`${dir}/onion-${objective}x.png`);
}
console.log(`Field previews: ${dir}/onion-{4,10,40}x.png`);
