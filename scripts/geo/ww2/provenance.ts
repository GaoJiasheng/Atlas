/** Source graph follows selectors, including clips and erasures, rather than trusting step.src. */
import { readFileSync } from 'node:fs';
export const manifest = JSON.parse(readFileSync('scripts/geo/ww2/sources.json', 'utf8'));
export const traces = JSON.parse(readFileSync('scripts/geo/ww2/lines.json', 'utf8'));
export const sourceByRef: Record<string, {title: string; license: string; page: string}> = Object.fromEntries(Object.values(manifest.datasets).map((d: any) => [d.ref, d]));
sourceByRef.G2 = { title: 'OpenHistoricalMap contributors, dated boundary relations without licence overrides', license: 'CC0 1.0', page: 'https://www.openhistoricalmap.org/copyright' };
sourceByRef.G34 = { title: 'Natural Earth 1:50m world land and 1:10m Southeast Asia coastline', license: 'Public domain', page: 'https://www.naturalearthdata.com/about/terms-of-use/' };
export function references(spec: any): string[] {
  if (!spec || typeof spec !== 'object') return [];
  if (Array.isArray(spec)) return [...new Set(spec.flatMap(references))].sort();
  const out: string[] = [];
  if (spec.cshapes) out.push('G1');
  if (spec.ohm) out.push('G2');
  if (spec.admin1) out.push('G4');
  if (spec.geojson) out.push(manifest.datasets[spec.geojson].ref);
  for (const kind of ['svg', 'raster']) {
    const id = spec[kind] ?? spec[kind+'Frame'];
    if (!id) continue;
    if (id === 'lines') {
      const classes: string[] = Array.isArray(spec.class) ? spec.class : [spec.class];
      for (const cls of classes) {
        const line = traces.lines[cls];
        if (!line) throw new Error('Unknown traced class: '+cls);
        for (const part of line.parts) out.push(manifest.datasets[traces.maps[part.map].dataset].ref);
        if (cls === 'greece-italian') out.push('G4');
        if (cls === 'east-1944-dec') out.push('G27'); // pocket erased by finalize-lines.ts
      }
    } else {
      const map = manifest[kind][id];
      if (!map) throw new Error('Unknown map: '+id);
      out.push(manifest.datasets[map.dataset].ref);
    }
  }
  for (const v of Object.values(spec)) if (typeof v === 'object') out.push(...references(v));
  return [...new Set(out)].sort((a,b) => Number(a.slice(1))-Number(b.slice(1)));
}
