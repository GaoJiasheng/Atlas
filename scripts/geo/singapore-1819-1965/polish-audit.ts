/** Reproducible source/registration audit. Never promotes a failed fit or
 * substitutes printed-grid precision for external geographic accuracy.
 * pnpm tsx scripts/geo/singapore-1819-1965/polish-audit.ts
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { feature } from 'topojson-client';
import { pointInPolygon } from '../lib/common';
import { ringIssues } from '../lib/rings';
import { buildModel } from './resume-register-anu1958-model';
import { candidates, evaluate } from '../lib/fit';
import type { ControlPoint } from '../lib/manifest';

const dir = resolve(import.meta.dirname);
const read = (name: string): any => JSON.parse(readFileSync(`${dir}/${name}`, 'utf8'));
const manifest = read('sources.json');
const lines = read('lines.json');
const receipts = read('raw/fetch-log.json');
const specs = [
  { id: 'G9', rms: 40, max: 80 },
  { id: 'G11', rms: 30, max: 60 },
  { id: 'G16', rms: 30, max: 60 },
];
const fit = (points: ControlPoint[]) => candidates('auto', points)
  .map(c => evaluate(c.proj, c.kind, points))
  .sort((a, b) => a.report.looRmsKm - b.report.looRmsKm)[0]!;
const metres = (r: ReturnType<typeof fit>['report']) => ({
  model: r.model, fitRmsM: r.rmsKm * 1000, fitMaxM: r.maxKm * 1000,
  looRmsM: r.looRmsKm * 1000, looMaxM: r.looMaxKm * 1000,
  points: r.points.map(p => ({ name: p.name, fitM: p.residualKm * 1000, looM: p.looKm * 1000 })),
});
const readings = read('third-control-readings.json').readings;
const maps = specs.map(s => {
  const input = read(`georef-${s.id}.json`);
  const previous = metres(fit(input.controlPoints).report);
  const revised = s.id === 'G16' && existsSync(`${dir}/resume-coast-integration.json`) ? read('resume-G16-graticule.json').externalTranslationFit : null;
  const warp=existsSync(`${dir}/round2-registration.json`)?read('round2-registration.json').reports.find((r:any)=>r.id===s.id&&r.adopted):null;
  const active = warp?{model:warp.model,fitRmsM:warp.fit.rmsM,fitMaxM:warp.fit.maxM,looRmsM:warp.loo.rmsM,looMaxM:warp.loo.maxM,points:warp.points}:revised ? {
    model: '16 printed Mercator axis ticks + six-ground translation',
    fitRmsM: revised.fitRmsM, fitMaxM: revised.fitMaxM,
    looRmsM: revised.looRmsM, looMaxM: revised.looMaxM,
    points: revised.checks.map((p: any)=>({name:p.name,fitM:p.errorM,looM:p.looErrorM})),
  } : previous;
  const extras = readings.filter((p: { map: string }) => p.map === s.id);
  const expanded = metres(fit([...input.controlPoints, ...extras]).report);
  return {
    ...s, controlPoints: warp?.controlPoints.length??input.controlPoints.length, internalGridObservations: 16, previous, active,
    candidate: { controlPoints: input.controlPoints.length + extras.length, ...expanded, adopted: false,
      reason: 'Candidate identities remain unqualified and their leave-one-out RMS is worse. Neither more points nor a smaller fitted residual establishes external accuracy.' },
    legacyToleranceMet: input.controlPoints.length >= 16 && active.looRmsM <= s.rms && active.looMaxM <= s.max,
  };
});
const grid = read('georef-G14-grid.json');
const gridFit = fit(grid.controlPoints);
// Every geometry-bearing map is resolved through its dataset, rather than
// searching for the word NAS in historical prose and rejecting legitimate citations.
const used = new Set<string>();
used.add('g14'); // Candidate source is also checked, although never published.
used.add('g35'); // Independently dated, permission-free Jurong source.
for (const map of Object.values(read('border-traces.json').maps) as { file: string }[]) {
  const entry = Object.entries(manifest.datasets).find(([, d]: [string, any]) => `raw/${d.file}` === map.file);
  if (!entry) throw Error(`Unresolved border source ${map.file}`);
  used.add(entry[0]);
}
for (const line of Object.values(lines.lines) as { parts: { map: string }[] }[])
  for (const part of line.parts) {
    const map = lines.maps[part.map] ?? manifest.svg?.[part.map] ?? manifest.raster?.[part.map];
    if (!map) throw Error(`Unresolved source map ${part.map}`);
    used.add(map.dataset);
  }
const sourceAudit = [...used].map(id => {
  const d = manifest.datasets[id];
  if (!d) throw Error(`Missing dataset ${id}`);
  if (/nas\.gov\.sg|TM000014_5/i.test(`${d.url} ${d.page} ${d.file}`))
    throw Error(`Restricted NAS map entered trace dependencies: ${id}`);
  if (!/public domain|CC0/i.test(d.license)) throw Error(`Trace licence requires review: ${id}: ${d.license}`);
  // The quarter raster is a local reduction of the full-resolution PD map.
  const receipt = id === 'g35' ? { ...read('resume-source-receipt.json'), file: d.file } : receipts.find((r: { id: string }) => r.id === d.ref)
    ?? { file: d.file, sha256: read('border-audit.json').hashes[`raw/${d.file}`] };
  if (!receipt?.sha256) throw Error(`No source receipt for ${id}`);
  const original = resolve(dir, 'raw', receipt.file);
  if (!existsSync(original)) throw Error(`Missing original ${original}`);
  const actual = createHash('sha256').update(readFileSync(original)).digest('hex');
  if (actual !== receipt.sha256) throw Error(`Source hash mismatch: ${id}`);
  return { id, ref: d.ref, role: id === 'g14' ? 'unpublished candidate' : 'map trace / source recipe', page: d.page, license: d.license, sha256: actual };
});
const dataDir = resolve(dir, '../../../src/content/topics/singapore-1819-1965/data');
const control = JSON.parse(readFileSync(`${dataDir}/control.json`, 'utf8'));
const coast = JSON.parse(readFileSync(resolve(dir, '../../../public/geo/land-sg-history.json'), 'utf8'));
const polygons=(f:any):number[][][][]=>f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.type==='MultiPolygon'?f.geometry.coordinates:[];
const decodedCoast=(feature(coast,coast.objects['land-sg-history'])as any).features;
const sourceModel=buildModel();
const wetPixels=[[2250,900],[2371,920],[2460,1010],[2540,1040],[2585,1125],[2475,1370]];
const finalReceipt=read('resume-final-water-audit.json');
const covers=(features:any[],p:number[])=>features.some(f=>polygons(f).some(poly=>pointInPolygon(p,poly)));
const deliveryChecks:Record<string,unknown>={};
const layers=[{id:'L5',features:decodedCoast.filter((f:any)=>f.properties.id==='L5')},
 ...control.keyframes.filter((k:any)=>k.t>='1961-01-01').map((k:any)=>({id:k.object,features:(feature(control.topology,control.topology.objects[k.object])as any).features}))];
for(const layer of layers){
 const water=wetPixels.map(native=>({native,land:covers(layer.features,sourceModel.toLngLat(native[0]!+400,native[1]!+3400))}));
 const islands=finalReceipt.coast.islandWitness.map((p:any)=>({lnglat:p.lnglat,land:covers(layer.features,p.lnglat)}));
 const coverageFrameLand=covers(layer.features,[103.601,1.32]);
 const coverageFrameComponents=layer.features.flatMap(polygons).filter((poly:number[][][])=>poly[0]!.every(p=>p[0]!<103.61&&p[1]!>1.23&&p[1]!<1.38)).length;
 if(water.some(p=>p.land)||islands.some((p:any)=>!p.land)||coverageFrameLand||coverageFrameComponents)throw Error(`${layer.id}: delivered source water/island/coverage-frame check failed`);
 deliveryChecks[layer.id]={water,islands,coverageFrameLand,coverageFrameComponents};
}
const coastRings=ringIssues(decodedCoast.flatMap(polygons));
const controlRings=ringIssues(Object.values(control.topology.objects).flatMap(o=>(feature(control.topology,o as any)as any).features.flatMap(polygons)));
if(coastRings.zeroArea||coastRings.selfCrossing||controlRings.zeroArea||controlRings.selfCrossing)throw Error('Delivered ring check failed');
// A valid exported ring does not prove that a source channel was retained.
// Native paired-bank cross-sections, reread on the original G35 scan, expose
// the inherited head-mask retraces. Keep failures in the report, not just the
// passing mouth/island witnesses above. These are source-relative checks.
const headWetPixels=[[2005,230],[2002,240],[2013,260],[2019,275],[2081,275]];
const headDelivery=layers.map(layer=>({id:layer.id,checks:headWetPixels.map(native=>({native,land:covers(layer.features,sourceModel.toLngLat(native[0]!+400,native[1]!+3400))}))}));
const headInputRings=ringIssues(read('resume-jurong-east-verified-full-water.json').coordinates);
const headDryPixels=[[1970,230],[2020,250],[2055,188],[2090,290],[1940,315]];
const headDryDelivery=layers.map(layer=>({id:layer.id,checks:headDryPixels.map(native=>({native,land:covers(layer.features,sourceModel.toLngLat(native[0]!+400,native[1]!+3400))}))}));
const splice=read('round2-splice-audit.json');
const headAccepted=!headInputRings.zeroArea&&!headInputRings.selfCrossing&&headDelivery.every(l=>l.checks.every(c=>!c.land))&&headDryDelivery.every(l=>l.checks.every(c=>c.land));
const sourceCompleteness={
 accepted:headAccepted&&!splice.issues.zeroArea&&!splice.issues.selfCrossing,
 jurongHead:{accepted:headAccepted,inputRings:headInputRings,delivery:headDelivery,dryDelivery:headDryDelivery,reason:'Paired bank redraw; source-native water and dry/island witnesses checked independently on decoded coast and all five 1961–1965 frames.'},
 g15Splice:{accepted:!splice.issues.zeroArea&&!splice.issues.selfCrossing,method:splice.method,north:splice.north,south:splice.south,guard:'Exact source-bank intersections and simple-ring checks; no coverage cap or invented connector.'},
};
const baseline = read('polish-baseline.json');
const runtimeChecks = baseline.runtimeFiles.map((f: { path: string; sha256: string }) => ({
  path: f.path,
  unchanged: createHash('sha256').update(readFileSync(resolve(dir, '../../..', f.path))).digest('hex') === f.sha256,
}));
// Allow only the exact bilingual map-method correction and appended source
// evidence. Reverse the reviewed lines and compare with the original hash.
const textReceipt=read('resume-text-changes.json');
let restoredChapter=readFileSync(resolve(dir,'../../..',textReceipt.chapter),'utf8');
for(const change of textReceipt.changes) {
  if(!restoredChapter.includes(change.after))throw Error('Reviewed map-method line missing');
  restoredChapter=restoredChapter.replace(change.after,change.before);
}
const hashText=(value:string)=>createHash('sha256').update(value).digest('hex');
const chapterMethodOnly=hashText(restoredChapter)===textReceipt.beforeSHA256
  && baseline.runtimeFiles.some((f:any)=>f.path===textReceipt.chapter&&f.sha256===textReceipt.beforeSHA256);
const sourcePath='src/content/topics/singapore-1819-1965/data/sources.json';
const sourceEntries=JSON.parse(readFileSync(resolve(dir,'../../..',sourcePath),'utf8')).sources;
const sourcesAppendOnly=hashText(JSON.stringify(sourceEntries.slice(0,textReceipt.originalSourceCount)))===textReceipt.originalSourcesCanonicalSHA256
  && baseline.runtimeFiles.some((f:any)=>f.path===sourcePath&&f.sha256===textReceipt.sourcesBeforeSHA256);
const legacyTeachingFactsUnchanged=runtimeChecks.filter((f:any)=>!f.path.endsWith('/control.json')&&!f.path.endsWith('/land-sg-history.json'))
  .every((f:any)=>f.unchanged||(f.path===textReceipt.chapter&&chapterMethodOnly)||(f.path===sourcePath&&sourcesAppendOnly));
// The accepted live topic includes later historian edits. An explicit residual
// mode compares every original content file with its start-of-pass hash instead
// of treating those already accepted edits as changes made by this map pass.
// The old baseline/receipt and default historical check remain intact.
const acceptedLive=process.argv.includes('--accepted-live');
const liveBaseline=acceptedLive?read('residual-text-baseline.json'):null;
const liveChecks=acceptedLive?Object.entries(liveBaseline.files).map(([path,sha256])=>({
 path,sha256,unchanged:hashText(readFileSync(resolve(dir,'../../..',path),'utf8'))===sha256,
})):[];
const expectedTextPaths=runtimeChecks.filter((f:any)=>!f.path.endsWith('/control.json')&&!f.path.endsWith('/land-sg-history.json')).map((f:any)=>f.path);
if(acceptedLive&&(!expectedTextPaths.every((p:string)=>liveChecks.some(f=>f.path===p))||!liveChecks.every(f=>f.unchanged)))throw Error('Accepted live topic content changed');
const teachingFactsUnchanged=acceptedLive?liveChecks.every(f=>f.unchanged):legacyTeachingFactsUnchanged;
if(!acceptedLive&&(!chapterMethodOnly||!sourcesAppendOnly||!teachingFactsUnchanged))throw Error('Unreviewed teaching-content change');
const chaptersUnchanged = (acceptedLive?liveChecks:runtimeChecks).filter((f: { path: string }) => f.path.includes('/chapters/')).every((f: { unchanged: boolean }) => f.unchanged);
const geometryUnchanged = runtimeChecks.filter((f: { path: string }) => f.path.endsWith('/control.json') || f.path.endsWith('/land-sg-history.json')).every((f: { unchanged: boolean }) => f.unchanged);
const ground35 = read('resume-register-anu1958-fit-report.json').reports.find((r: any)=>r.set==='roads-only');
const reviewed = existsSync(`${dir}/resume-jurong-reviewed.json`) ? read('resume-jurong-reviewed.json') : null;
const report = {
  date: '2026-11-09', status: sourceCompleteness.accepted?'source-geometry-guards-passed-positions-approximate':'source-geometry-guard-failed', sourceAudit, maps,
  jurong: { source: 'G35', editionYear: 1958, licence: 'Public domain; ANU Copyright Expired',
    internalGridControls: 16, externalRoadCandidates: ground35.count,
    internalPrintedGrid: read('resume-register-anu1958-internal-fit.json').fits,
    sourcePixelTraceVertices: reviewed?.coordinates.length ?? 0,
    tracedWater:{Jurong:read('resume-jurong-east-verified-full-water.json').counts,Pandan:read('resume-jurong-east-verified-pandan-water.json').counts},
    tracedIslands:read('resume-jurong-reviewed-islands.json').islands.map((i:any)=>({name:i.name,vertices:i.vertices})),
    sourceCoastJoins:existsSync(`${dir}/resume-coast-integration.json`)?read('resume-coast-integration.json').sourceCoastJoins:null,
    ...ground35.gridPlusTranslation, externalRmsM: ground35.gridPlusTranslation.looRmsM,
    externalMaxM: ground35.gridPlusTranslation.looMaxM,
    published: reviewed?.status === 'source-trace-reviewed' && existsSync(`${dir}/resume-coast-integration.json`),
    reason: '1958 preconstruction source used for January1961; first earth-moving September1961 is a dated primary-source chronology. Positions are approximate at the reported measured error; later1961–1965 reclamation is not individually mapped.' },
  rejected1966Trial: {source:'G14',internalPrintedGrid:metres(gridFit.report),published:false,reason:'Corrected1966 edition cannot establish an exact1961 shore.'},
  runtimeChecks,deliveryChecks,sourceCompleteness,deliveredRings:{coast:coastRings,control:controlRings},
  mapMethodCorrection:{chapterMethodOnly,sourcesAppendOnly,changedParagraphs:textReceipt.changes.length,receipt:'resume-text-changes.json'},
  acceptedLiveBaseline:acceptedLive?{receipt:'residual-text-baseline.json',checks:liveChecks,unchanged:teachingFactsUnchanged}:null,
  unchanged: { chapters: chaptersUnchanged, beats: acceptedLive?teachingFactsUnchanged:chapterMethodOnly, facts: teachingFactsUnchanged, liveGeometry: geometryUnchanged,
    controlBytes: readFileSync(`${dataDir}/control.json`).length,
    coastBytes: readFileSync(resolve(dir, '../../../public/geo/land-sg-history.json')).length,
    controlArcs: control.topology.arcs.length, coastArcs: coast.arcs.length },
};
mkdirSync(`${dir}/previews`, { recursive: true });
writeFileSync(`${dir}/polish-audit.json`, JSON.stringify(report, null, 2) + '\n');
for (const m of maps) console.log(`${m.id}: measured LOO RMS/max ${m.active.looRmsM.toFixed(2)}/${m.active.looMaxM.toFixed(2)} m; positions approximate (legacy tolerance diagnostics retained in JSON)`);
console.log(`G35: external LOO RMS/max ${report.jurong.externalRmsM.toFixed(2)}/${report.jurong.externalMaxM.toFixed(2)} m; positions approximate.`);
console.log(`${sourceAudit.length} active/candidate source maps: original hashes verified; no restricted NAS scan.`);
console.log(`Source completeness ${sourceCompleteness.accepted?'PASS':'FAIL'}: paired banks, dry/island witnesses and source-bank splice.`);
if (!sourceCompleteness.accepted) process.exitCode=1;
