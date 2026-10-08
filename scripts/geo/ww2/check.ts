/**
 * Step 6 — visual check: render each keyframe of control.json on the Natural
 * Earth basemap with MapLibre (from node_modules, in headless Chromium via
 * Playwright) next to the source map it was taken from, one row per view in
 * sources.json `keyframes[].checks`, and save docs/screenshots/ww2/geo-<K>.png.
 *
 *   pnpm tsx scripts/geo/ww2/check.ts          # every keyframe
 *   pnpm tsx scripts/geo/ww2/check.ts K6       # one keyframe
 *   pnpm tsx scripts/geo/ww2/check.ts --work K6   # the unsimplified work/K6.geojson (quick look before simplify.ts)
 *
 * control.json is TopoJSON (simplify.ts): each keyframe object is decoded
 * with topojson-client, as the engine does.
 *
 * Holders are drawn with distinct flat colours (axis warm / blue, allied
 * green / red / teal, neutral grey) and a label at their largest area, so a
 * reviewer can compare territory by territory with the source on the right.
 * The page is served from a throwaway local HTTP server; nothing external is
 * requested.
 */
import { createServer } from 'node:http';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import type { AddressInfo } from 'node:net';
import { extname, join } from 'node:path';
import { parseArgs } from 'node:util';
import { chromium } from '@playwright/test';
import type { FeatureCollection } from 'geojson';
import { feature } from 'topojson-client';
import { ROOT, SHOTS, TOPIC, loadSources, log, rawFile, readJson, warn, workFile } from './lib';

const { positionals, values } = parseArgs({ allowPositionals: true, options: { work: { type: 'boolean', default: false } } });

type Topology = Parameters<typeof feature>[0];
type TopoObject = Parameters<typeof feature>[1];

/** Keyframe areas: the decoded TopoJSON object of control.json, or (--work) the unsimplified compose output. */
function keyframeData(id: string, t: string): FeatureCollection | null {
  if (values.work) {
    const path = workFile(`${id}.geojson`);
    return existsSync(path) ? readJson<FeatureCollection>(path) : null;
  }
  const control = readJson<{ topology: Topology; keyframes: { t: string; object: string }[] }>(join(TOPIC, 'data', 'control.json'));
  const kf = control.keyframes.find((k) => k.t === t);
  const obj = kf && (control.topology.objects as Record<string, TopoObject>)[kf.object];
  if (!obj) return null;
  return feature(control.topology, obj) as FeatureCollection;
}

const COLORS: Record<string, string> = {
  japan: '#d4552a',
  manchukuo: '#ef9a5a',
  thailand: '#f2c46d',
  germany: '#3d5a99',
  italy: '#7b95d6',
  hungary: '#9a8fd1',
  romania: '#a9c2ee',
  bulgaria: '#7fb2c9',
  finland: '#c5d3f2',
  'vichy-france': '#d9c9ef',
  uk: '#3f9a4f',
  india: '#82c47d',
  australia: '#2f7f5f',
  'new-zealand': '#5aa57f',
  canada: '#6aa36a',
  usa: '#2a8a96',
  philippines: '#7cc8cf',
  netherlands: '#e3b23c',
  belgium: '#c8a050',
  france: '#8d6cc4',
  'free-france': '#b39ad9',
  ussr: '#c83737',
  china: '#d98c8c',
  poland: '#e07070',
  norway: '#9fb7a0',
  greece: '#88b8d8',
  yugoslavia: '#b0a080',
  brazil: '#9bc46a',
};
const NEUTRAL = '#bdbdbd';

const MIME: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
};

interface Row {
  name: string;
  center: [number, number];
  zoom: number;
  source?: { url: string; caption: string };
}

function page(id: string, t: string, rows: Row[], caption: string): string {
  const rowsHtml = rows
    .map(
      (r, i) => `<section><div class="map" id="m${i}"></div><figure>${r.source ? `<img src="${r.source.url}"><figcaption>${r.source.caption}</figcaption>` : '<figcaption>no source image for this view</figcaption>'}</figure><h2>${id} · ${t} · ${r.name}</h2></section>`,
    )
    .join('');
  return `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="/maplibre-gl.css">
<style>
body{margin:0;background:#fff;font:13px/1.3 -apple-system,Helvetica,Arial,sans-serif;color:#222}
header{padding:10px 14px;border-bottom:1px solid #ccc}
section{position:relative;display:grid;grid-template-columns:900px 900px;gap:8px;padding:30px 8px 8px}
section h2{position:absolute;left:12px;top:6px;margin:0;font-size:13px}
.map{width:900px;height:620px;border:1px solid #999}
figure{margin:0;width:900px;height:620px;border:1px solid #999;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#fafafa}
figure img{max-width:900px;max-height:590px}
figcaption{font-size:11px;color:#555;padding:2px 6px}
.lbl{font:600 10px Helvetica,Arial;color:#111;background:rgba(255,255,255,.7);padding:0 2px;white-space:nowrap;pointer-events:none}
</style></head><body><header><b>${id} · ${t}</b> — ${caption}</header>${rowsHtml}
<script src="/maplibre-gl.js"></script>
<script>
const COLORS=${JSON.stringify(COLORS)};const NEUTRAL='${NEUTRAL}';
const rows=${JSON.stringify(rows)};
window.__ready=Promise.all(rows.map(async (r,i)=>{
  const [land,kf]=await Promise.all([fetch('/land.json').then(x=>x.json()),fetch('/kf.json').then(x=>x.json())]);
  for(const f of kf.features){f.properties.color=COLORS[f.properties.holder]||NEUTRAL;}
  const map=new maplibregl.Map({container:'m'+i,center:r.center,zoom:r.zoom,attributionControl:false,fadeDuration:0,canvasContextAttributes:{preserveDrawingBuffer:true},
    style:{version:8,sources:{land:{type:'geojson',data:land},kf:{type:'geojson',data:kf}},layers:[
      {id:'bg',type:'background',paint:{'background-color':'#dfe9f0'}},
      {id:'land',type:'fill',source:'land',paint:{'fill-color':'#f4f1e8'}},
      {id:'kf',type:'fill',source:'kf',paint:{'fill-color':['get','color'],'fill-opacity':0.78}},
      {id:'kfl',type:'line',source:'kf',paint:{'line-color':'#222','line-width':0.7}},
      {id:'coast',type:'line',source:'land',paint:{'line-color':'#6d8fa6','line-width':0.5}}]}});
  await new Promise(res=>map.once('idle',res));
  const seen=new Set();
  for(const f of kf.features){
    if(!f.geometry)continue;
    const polys=f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.coordinates;
    let best=null,ba=0;
    for(const p of polys){const r0=p[0];let a=0,cx=0,cy=0;for(let k=0,j=r0.length-1;k<r0.length;j=k++){const c=r0[j][0]*r0[k][1]-r0[k][0]*r0[j][1];a+=c;cx+=(r0[j][0]+r0[k][0])*c;cy+=(r0[j][1]+r0[k][1])*c;}if(Math.abs(a)>ba){ba=Math.abs(a);best=[cx/(3*a),cy/(3*a)];}}
    if(!best)continue;const key=f.properties.holder+(f.properties.label?f.properties.label.en:'');if(seen.has(key))continue;seen.add(key);
    const el=document.createElement('div');el.className='lbl';el.textContent=f.properties.label?f.properties.label.en:f.properties.holder;
    new maplibregl.Marker({element:el}).setLngLat(best).addTo(map);
  }
  await new Promise(res=>setTimeout(res,300));
}));
</script></body></html>`;
}

async function main(): Promise<void> {
  const sources = loadSources();
  const wanted = positionals.length ? positionals : sources.keyframes.map((k) => k.id);
  mkdirSync(SHOTS, { recursive: true });
  const files = new Map<string, { body: Buffer | string; type: string }>();
  const server = createServer((req, res) => {
    const f = files.get((req.url ?? '/').split('?')[0] ?? '/');
    if (!f) {
      res.writeHead(404).end();
      return;
    }
    res.writeHead(200, { 'Content-Type': f.type }).end(f.body);
  });
  await new Promise<void>((r) => server.listen(0, '127.0.0.1', r));
  const port = (server.address() as AddressInfo).port;
  const mapDist = join(ROOT, 'node_modules', 'maplibre-gl', 'dist');
  files.set('/maplibre-gl.js', { body: readFileSync(join(mapDist, 'maplibre-gl.js')), type: MIME['.js']! });
  files.set('/maplibre-gl.css', { body: readFileSync(join(mapDist, 'maplibre-gl.css')), type: MIME['.css']! });
  files.set('/land.json', { body: readFileSync(join(ROOT, 'public', 'geo', 'land-50m.json')), type: MIME['.json']! });
  const browser = await chromium.launch({ headless: true, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  try {
    for (const id of wanted) {
      const kf = sources.keyframes.find((k) => k.id === id);
      const data = kf && keyframeData(kf.id, kf.t);
      if (!kf || !data) {
        warn(`keyframe ${id} not in sources.json / ${values.work ? 'work/' : 'control.json'}`);
        continue;
      }
      if (values.work) {
        // compose.ts writes flat label_en / label_zh; the page reads properties.label like control.json.
        for (const f of data.features) {
          const p = f.properties as Record<string, unknown>;
          if (p.label_en) p.label = { en: p.label_en, zh: p.label_zh };
        }
      }
      files.set('/kf.json', { body: JSON.stringify(data), type: MIME['.json']! });
      const rows: Row[] = [];
      for (const c of kf.checks) {
        const row: Row = { name: c.name, center: c.center, zoom: c.zoom };
        const ds = c.source ? sources.datasets[c.source] : undefined;
        if (ds && existsSync(rawFile(ds.file))) {
          const url = `/src/${encodeURIComponent(ds.file)}`;
          files.set(url, { body: readFileSync(rawFile(ds.file)), type: MIME[extname(ds.file).toLowerCase()] ?? 'application/octet-stream' });
          const svgId = Object.entries(sources.svg).find(([, s]) => s.dataset === c.source)?.[0];
          const rasterId = Object.entries(sources.raster ?? {}).find(([, s]) => s.dataset === c.source)?.[0];
          const fitPath = svgId ? workFile(`svg-${svgId}-fit.json`) : rasterId ? workFile(`raster-${rasterId}-fit.json`) : '';
          const fit = fitPath && existsSync(fitPath) ? readJson<{ model: string; rmsKm: number; maxKm: number }>(fitPath) : null;
          row.source = {
            url,
            caption: `[${ds.ref}] ${ds.title} — ${ds.author ?? ''} — ${ds.license}${fit ? ` · georeferenced ${fit.model}, RMS ${fit.rmsKm.toFixed(1)} km, max ${fit.maxKm.toFixed(1)} km` : ' · reference image (not traced)'}`,
          };
        }
        rows.push(row);
      }
      const html = page(kf.id, kf.t, rows, kf.method);
      files.set('/', { body: html, type: MIME['.html']! });
      const p = await browser.newPage({ viewport: { width: 1820, height: 100 + rows.length * 664 } });
      p.on('pageerror', (e) => warn(`page error: ${e.message}`));
      await p.goto(`http://127.0.0.1:${port}/`);
      await p.waitForFunction('window.__ready !== undefined');
      await p.evaluate('window.__ready');
      const out = values.work ? workFile(`check-${kf.id}.png`) : join(SHOTS, `geo-${kf.id}.png`);
      await p.screenshot({ path: out, fullPage: true });
      await p.close();
      log(`wrote ${out.replace(`${ROOT}/`, '')}`);
    }
  } finally {
    await browser.close();
    server.close();
  }
}

await main();
