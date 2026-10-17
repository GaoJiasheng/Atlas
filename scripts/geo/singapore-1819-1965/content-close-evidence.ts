/** Incremental evidence closure; deliberately preserves parent-added sources and frozen WW2 copies. */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dir = path.join(root, 'scripts/geo/singapore-1819-1965');
const data = path.join(root, 'src/content/topics/singapore-1819-1965/data');
const read = (p: string) => JSON.parse(fs.readFileSync(p, 'utf8'));
const write = (p: string, v: unknown) => fs.writeFileSync(p, JSON.stringify(v, null, 2) + '\n');
const bi = (en: string) => ({ en, zh: '【待译】' + en });
const events = read(path.join(data, 'events.json'));
const sourcesDoc = read(path.join(data, 'sources.json'));
const sources = sourcesDoc.sources;
const gaps = read(path.join(dir, 'content-date-gaps.json'));
const originalGaps = { ...gaps };
const ledger = read(path.join(dir, 'content-gaps.json'));
const closures = read(path.join(dir, 'research/date-closures.json')).events;
const wwEvents = read(path.join(root, 'src/content/topics/ww2/data/events.json'));
const wwMoves = read(path.join(root, 'src/content/topics/ww2/data/movements.json'));
const moves = read(path.join(data, 'movements.json'));
const wwIds = new Set(ledger.copiedWW2Events);
let next = Math.max(228, ...sources.map((s: any) => Number(s.id.slice(1)))) + 1;
const allocated: Record<string, string> = {};
function addSource(key: string, title: string, url: string, note: string) {
  let s = sources.find((s: any) => s.url === url);
  if (!s) {
    s = { id: 'S' + next++, text: bi(title), url, note: bi(note) };
    sources.push(s);
  }
  allocated[key] = s.id;
  return s.id;
}
const find = (id: string) => {
  if (wwIds.has(id)) throw new Error('Cannot edit copied WW2 event ' + id);
  const e = events.find((e: any) => e.id === id);
  if (!e) throw new Error('Missing event ' + id);
  return e;
};
function cite(e: any, ids: string[]) { e.sources = [...new Set([...e.sources, ...ids])]; }
function detail(e: any, sentence: string) {
  if (!e.detail.en.includes(sentence)) e.detail = bi(e.detail.en + ' ' + sentence);
}
const dateResults: any[] = [];
for (const [id, c] of Object.entries(closures) as [string, any][]) {
  if (!c.sources.length) continue;
  const ids = c.sources.map((s: any) => addSource(s.key, s.title, s.url,
    'Read by the topic research agent: ' + s.readExtent + ' Evidence quotation is recorded in research/date-closures.json and RESEARCH.md; this note adds no further quotation.'));
  const e = find(id);
  cite(e, ids);
  // The BMA proclamation's signature is distinct from this event's September ceremony/return anchor.
  const confirmed = c.confirmedDate !== null && id !== 'bma-1945';
  if (confirmed) {
    e.detail = bi(e.detail.en.replace(' Date evidence gap: ' + originalGaps[id], ''));
    e.sources = e.sources.filter((s: string) => s !== 'S200');
    delete gaps[id];
    detail(e, c.meaning);
    if (c.remaining) detail(e, 'Evidence limit: ' + c.remaining);
  } else {
    const warning = c.remaining + ' ' + c.meaning;
    e.detail = bi(e.detail.en.replace('Date evidence gap: ' + originalGaps[id], 'Date evidence gap: ' + warning));
    gaps[id] = warning;
  }
  if (id === 'site-penang') {
    e.t = '1786-08-11';
    e.summary = bi('The East India Company took possession on 11 August 1786; Malay settlements already existed. This date does not mark the beginning of habitation.');
  }
  if (id === 'site-sultan-mosque') e.summary = bi('The original mosque was constructed between 1824 and 1826. The present building is a later replacement.');
  if (id === 'site-kampong-glam-istana') e.summary = bi('The first timber palace with attap roofs was completed in 1819. The present palace belongs to a later commission.');
  if (id === 'census-1931') {
    // The timeline keeps month precision because reference night and enumeration are distinct.
    e.t = '1931-04';
    e.summary = bi('The census referred to the night of 1 April 1931; enumeration was taken on 2 April as at midnight the previous night. Published community categories differ from earlier returns.');
  }
  const row = ledger.events.find((r: any) => r.id === id);
  row.date = e.t;
  row.datePrecision = e.t.length === 10 ? 'day' : e.t.length === 7 ? 'month' : 'year';
  row.dateVerification = confirmed ? c.status + ': ' + c.meaning + (c.remaining ? ' Evidence limit: ' + c.remaining : '') : gaps[id];
  row.verifiedDateSources = ids;
  dateResults.push({ id, status: c.status, closed: confirmed, date: e.t, meaning: c.meaning, remaining: c.remaining, sourceIds: ids });
}

const johor = addSource('johor-lama-jmm', 'Department of Museums Malaysia, Kota Johor Lama Museum, background',
  'https://www.jmm.gov.my/en/content/kota-johor-lama-museum',
  'Read the complete institutional historical background, museum address and map-location section on 17 October 2026. It places Sultan Alauddin Riayat Shah II’s move to Tanjung Batu and fort construction in 1540; the date is not the beginning of the wider Johor Sultanate. Its cited 1954 excavation report and original chronicles were not independently read. No Google map geometry or museum photograph is reproduced. Short quotation: “The history of Kota Johor Lama began in 1540”.');
{
  const e = find('site-johor-lama');
  e.summary = bi('The museum’s historical account dates Sultan Alauddin Riayat Shah II’s move to Tanjung Batu and the fort’s beginning to 1540. The marker orients the wider Johor political world.');
  e.detail = bi(e.detail.en.replace(' Date evidence gap: ' + originalGaps[e.id], ''));
  detail(e, 'The 1540 date concerns the Tanjung Batu fort and royal centre, not the foundation of the wider Johor Sultanate. The exact fort footprint remains unverified here.');
  e.sources = e.sources.filter((s: string) => s !== 'S200'); cite(e, [johor]); delete gaps[e.id];
  const row = ledger.events.find((r: any) => r.id === e.id);
  row.dateVerification = 'confirmed-institutional: 1540 move and fort beginning; original chronicle not read.';
  row.verifiedDateSources = [johor];
  dateResults.push({ id: e.id, closed: true, date: e.t, status: 'confirmed-institutional', sourceIds: [johor] });
}

const wdLicence = addSource('wikidata-licence', 'Wikidata structured-data licensing: CC0', 'https://www.wikidata.org/wiki/Wikidata:Licensing',
  'Read the structured-data licensing section in full on 17 October 2026. P625 coordinates below use the CC0 structured statements, not the map-display tiles. Source-claim references and historical-site limitations are recorded in content-anchor-review.json. No OSM geometry was used.');
const slaLicence = addSource('onemap-licence', 'Singapore Land Authority, OneMap Open Data Licence version 1.0', 'https://www.onemap.gov.sg/legal/opendatalicence.html',
  'Read the complete licence on 17 October 2026, including reuse/adaptation, attribution and third-party exclusions. Contains information from OneMap accessed on 17 October 2026 from Singapore Land Authority which is made available under the terms of the Singapore Open Data Licence version 1.0 (https://www.onemap.gov.sg/legal/opendatalicence.html). Only the sourced point and a point read from the georeferenced tile are published; no basemap tiles or third-party map geometry are redistributed.');
const institutional = read(path.join(dir, 'raw/content-anchor-institutional.json'));
const anchorUpdates: any[] = [];
const dms = (d: number, m: number, s: number) => d + m / 60 + s / 3600;
const wd: any[] = [
  ['site-sri-mariamman', 'Q2428845', 'Sri Mariamman Temple', [dms(103,50,42), dms(1,16,57.4)], 'English Wikipedia import', 'sri-mariamman-temple'],
  ['site-masjid-jamae', 'Q2993428', 'Masjid Jamae', [dms(103,50,43.8), dms(1,16,59.5)], 'English Wikipedia import', null],
  ['site-sultan-mosque', 'Q1907146', 'Sultan Mosque', [dms(103,51,32.4), dms(1,18,7.7)], 'English Wikipedia import', 'sultan-mosque'],
  ['site-thian-hock-keng', 'Q2158122', 'Thian Hock Keng', [dms(103,50,51.11), dms(1,16,51.82)], 'Dutch Wikipedia import', 'thian-hock-keng'],
  ['site-armenian-church', 'Q2660779', 'Armenian Church', [dms(103,50,57.5), dms(1,17,35)], 'Russian Wikipedia import', 'armenian-apostolic-church-of-saint-gregory-the-illuminator'],
  ['site-st-andrews', 'Q168806', 'St Andrew’s Cathedral', [dms(103,51,8), dms(1,17,32)], 'English Wikipedia import', null],
  ['macdonald-house', 'Q6721822', 'MacDonald House', [dms(103,50,45.6), dms(1,17,57.1)], 'English Wikipedia import', 'macdonald-house'],
  ['causeway-1924', 'Q892615', 'Johor–Singapore Causeway', [dms(103,46,8.95), dms(1,27,9.98)], 'English Wikipedia import', null],
  ['site-riau-penyengat', 'Q3374975', 'Penyengat Island', [dms(104,25,4.001), dms(0,55,41.992)], 'Republic of Indonesia Gazetteer, Islands vol.3 (2024), p.232, and Home Affairs decrees 2022/2025', null],
];
const macId = events.find((e: any) => e.id.includes('macdonald'))?.id;
for (const a of wd) {
  let [id, q, name, at, reference, crossKey] = a;
  if (id === 'macdonald-house') id = macId;
  const e = find(id);
  const current = [...e.at];
  const role = id === 'causeway-1924' ? 'Modern causeway reference point; not the exact 1924 ceremony position or a historical rail alignment.'
    : id === 'site-riau-penyengat' ? 'Published island reference point; not the exact royal compound or an 1803 footprint.'
    : 'Present monument/building reference point; not a surveyed original historical footprint or event position within the building.';
  const source = addSource('anchor-' + q, 'Wikidata ' + q + ', ' + name + ', coordinate location P625', 'https://www.wikidata.org/wiki/' + q,
    'Read entity identity, P625 coordinate and its references on 17 October 2026. Coordinate claim reference: ' + reference + '. Converted the published DMS value to decimal degrees; no coordinates were inferred from memory. ' + role + ' Structured data CC0; no OSM geometry or map-display data copied. Institutional identity cross-checks and uncertainties: content-anchor-review.json.');
  e.at = at.map((v: number) => Number(v.toFixed(6)));
  const anchorNote = 'Map anchor approximate: sourced Wikidata P625 reference point. ' + role;
  e.detail = bi(e.detail.en.replace('Map anchor approximate; original site/precise location unverified. The coordinate is a draft orientation anchor, not a newly verified historical position.', anchorNote));
  cite(e, [source, wdLicence]);
  const cross = crossKey ? institutional[crossKey] : null;
  anchorUpdates.push({ id, before: current, at: e.at, status: 'source-backed-reference-point', geometrySource: 'Wikidata ' + q + ' P625', url: 'https://www.wikidata.org/wiki/' + q,
    licence: 'CC0', sourceIds: [source, wdLicence], readExtent: 'Read identity, P625 and its references; DMS converted arithmetically to decimal degrees.', claimReference: reference,
    role, historicalFootprintVerified: false, ...(cross ? { institutionalCrossCheck: { url: cross.url, address: cross.address, at: cross.at, readExtent: cross.readExtent, geometryCopied: false } } : {}) });
}
const suss = addSource('hospital-trail-suss', 'SUSS and MSF, Social Services Heritage Trail launch, 12 April 2025, annex site 12',
  'https://www.suss.edu.sg/about-suss/media-centres/media-releases/new-social-services-heritage-trail-to-celebrate-singapore-s-legacy-of-care-and-community',
  'Read the complete launch article and annex. Site 12 places the former Chinese Pauper/Tan Tock Seng Hospital premises at 195 Pearl’s Hill Terrace. This supplies the modern heritage reference address, not a surveyed 1844 hospital footprint. Short quotation: “195 Pearl’s Hill Terrace (Former premises of Chinese Pauper Hospital/Tan Tock Seng Hospital”. No photograph or article reproduction is proposed.');
const hospitalMap = addSource('hospital-onemap', 'Singapore Land Authority OneMap, address search for 195 Pearl’s Hill Terrace',
  'https://www.onemap.gov.sg/api/common/elastic/search?searchVal=195%20Pearl%27s%20Hill%20Terrace&returnGeom=Y&getAddrDetails=Y&pageNum=1',
  'Read the full successful API response on 17 October 2026: one address, postal 168976, latitude 1.284018894718415, longitude 103.841554531024. Exact response stored in raw/content-anchor-onemap.json. This is a modern address reference point cross-checked against the SUSS/MSF heritage trail; it is not measured original building geometry. Contains information from OneMap accessed on 17 October 2026 from Singapore Land Authority which is made available under Singapore Open Data Licence version 1.0 (https://www.onemap.gov.sg/legal/opendatalicence.html).');
const sg101 = addSource('hocklee-junction', 'SG101, Hock Lee Bus Riots, 12 May 2023, location statement',
  'https://www.sg101.gov.sg/resources/archives/onthisday-hock-lee-bus-riots/',
  'Read the complete official article on 17 October 2026. Used its Dawson/Alexandra junction location statement, cross-checked against the official NHB/My Queenstown trail brochure p.11. Its political characterisations are not adopted; casualty wording and attributed competing accounts continue to use NLB S153. Short quotation: “at the junction of Dawson and Alexandra Roads”. The depot gate and original footprint were not surveyed.');
const tile = addSource('hocklee-onemap', 'Singapore Land Authority OneMap Default map, zoom 18 tile 206664/130130, Dawson–Alexandra junction',
  'https://www.onemap.gov.sg/maps/tiles/Default/18/206664/130130.png',
  'Downloaded and visually inspected the georeferenced EPSG:3857 XYZ 256-pixel tile on 17 October 2026. The named junction centre was read at pixel x=75,y=218; inverted the published zoom/x/y Web Mercator grid to WGS84. Georeferencing comes from the published tile grid, not a fitted or hand-drawn map. Reading uncertainty is about 30 m; this is a schematic junction anchor, not a depot-gate survey. Tile and metadata retained in raw/ only. Contains information from OneMap accessed on 17 October 2026 from Singapore Land Authority which is made available under Singapore Open Data Licence version 1.0 (https://www.onemap.gov.sg/legal/opendatalicence.html).');
function updateAnchor(id: string, at: number[], sourceIds: string[], note: string, record: any) {
  const e = find(id); const before = [...e.at]; e.at = at;
  e.detail = bi(e.detail.en.replace('Map anchor approximate; original site/precise location unverified. The coordinate is a draft orientation anchor, not a newly verified historical position.', note));
  cite(e, sourceIds); anchorUpdates.push({ id, before, at, sourceIds, status: 'source-backed-reference-point', historicalFootprintVerified: false, ...record });
}
updateAnchor('site-tan-tock-seng-1844', [103.841555,1.284019], [suss,hospitalMap,slaLicence],
  'Map anchor approximate: modern heritage-trail reference at 195 Pearl’s Hill Terrace, geocoded from SLA OneMap. The original hospital foundation and building footprint are not surveyed here.',
  { geometrySource: 'SLA OneMap address-search response', url: sources.find((s: any) => s.id === hospitalMap).url, licence: 'Singapore Open Data Licence 1.0', readExtent: 'Full API response and SUSS/MSF trail annex site 12 read.', role: 'Original hospital vicinity via modern institutional heritage reference address; exact 1844 footprint unverified.' });
const hospital = find('site-tan-tock-seng-1844');
const hospitalSummary = 'The first hospital stood in the Pearl’s Hill area. The marker uses the institutional heritage trail’s modern reference address; it does not mark the present hospital or a surveyed original footprint.';
hospital.summary = bi(hospitalSummary);
hospital.detail = bi(hospital.detail.en.replace('The draft marker is not the present hospital. The exact original-site anchor requires verification.', hospitalSummary));
const scale = 2 ** 18;
const lon = ((206664 + 75/256)/scale)*360-180;
const lat = Math.atan(Math.sinh(Math.PI*(1-2*(130130+218/256)/scale)))*180/Math.PI;
updateAnchor('hock-lee-riots', [Number(lon.toFixed(6)),Number(lat.toFixed(6))], [sg101,tile,slaLicence],
  'Map anchor approximate: Dawson Road–Alexandra Road junction, identified in the official historical account and read from SLA OneMap’s published georeferenced tile. Pixel-reading uncertainty is about 30 m. The original depot gate and footprint are not established.',
  { geometrySource: 'Published SLA OneMap EPSG:3857 XYZ tile', url: sources.find((s: any) => s.id === tile).url, licence: 'Singapore Open Data Licence 1.0', readExtent: 'Full SG101 account, NHB brochure location text and tile image read.', role: 'Named riot junction, not a claim for an exact bus-depot gate.', pixel: [75,218], grid: {z:18,x:206664,y:130130}, estimatedReadingUncertaintyMetres: 30 });
const hock = find('hock-lee-riots');
hock.summary = bi(hock.summary.en.replace(' The bus-depot anchor in the brief remains unverified.', ' The marker locates the Dawson–Alexandra junction named in the official historical account; the precise depot gate remains unverified.'));
hock.detail = bi(hock.detail.en.replace(' The bus-depot anchor in the brief remains unverified.', ' The source-backed marker identifies the Dawson–Alexandra junction; the precise original depot gate remains unverified.'));

const updateById = new Map(anchorUpdates.map((a: any) => [a.id, a]));
for (const row of ledger.events) {
  const a = updateById.get(row.id);
  if (a) {
    row.anchorStatus = a.status + ': ' + a.role;
    row.anchorSources = a.sourceIds;
    row.historicalFootprintVerified = false;
  }
}
ledger.note = 'All 103 non-WW2 event anchors remain approximate as historical positions. Eleven now use audited Wikidata CC0 or SLA OneMap SODL reference points with explicit site-role limitations; 92 retain unresolved draft anchors. See content-anchor-review.json. No OSM geometry was introduced.';
ledger.unverifiedEventDates = Object.entries(gaps).map(([id, reason]) => ({ id, reason }));
const checks = [
  {id:'riots-july-1964', status:'historical-location-text-confirmed-coordinate-unresolved', url:'https://www.nlb.gov.sg/main/article-detail?cmsuuid=3cb72867-1eec-4caa-96b2-365e1301cbb1', readExtent:'Full article read; initial clashes described at Kallang Road and Kampong Soo Poo off Padang Jeringau towards Geylang. No reliable exact onset coordinate obtained.', action:'No coordinate changed; the existing marker remains approximate and is not an onset claim.'},
  {id:'site-johor-lama', status:'date-closed-coordinate-unresolved', url:'https://www.jmm.gov.my/en/content/kota-johor-lama-museum', readExtent:'Complete museum historical background/address read. Modern mukim and museum Wikidata points do not measure the original fort footprint.', action:'Close the 1540 fort-date gap only; retain the draft coordinate warning.'},
  {id:'site-lingga-daik',status:'modern-place-candidate-not-adopted',url:'https://www.wikidata.org/wiki/Q2407251',readExtent:'Read modern administrative-place identity and Wikipedia-import P625. It does not establish the historical royal compound.',action:'Retain historical point gap; no replacement.'},
  {id:'site-fort-canning-temasek',status:'hill-centre-not-excavation-site',url:'https://www.wikidata.org/wiki/Q1438470',readExtent:'Read hill identity/P625; modern hill centre is not the precise 1984 archaeological trench.',action:'Date closed separately; retain archaeological-location gap.'},
  {id:'first-cabinet-1959',status:'venue-confirmed-coordinate-claim-conflict',url:'https://www.wikidata.org/wiki/Q3531770',readExtent:'Two discordant P625 points found. NAS B0033/30 confirms City Hall as the ceremony venue; NHB address identifies building.',action:'Do not select between discordant statements silently; retain approximate original point.'},
  {id:'site-chinatown',status:'modern-neighbourhood-point-not-historical-extent',url:'https://www.wikidata.org/wiki/Q1318670',readExtent:'Modern neighbourhood P625 has no claim references; it does not map the 1823 plan division.',action:'No coordinate changed.'},
  {id:'site-kampong-glam',status:'modern-neighbourhood-point-not-historical-extent',url:'https://www.wikidata.org/wiki/Q4251481',readExtent:'Modern neighbourhood P625 has no claim references; it does not map the 1823 plan division.',action:'No coordinate changed.'},
  {id:'site-serangoon-road',status:'no-coordinate-claim-obtained',url:'https://www.wikidata.org/wiki/Q7452693',readExtent:'Read entity; no P625 obtained.',action:'No coordinate invented.'},
];
// Resolve the exact 1964 event id used by the approved specification.
checks[0]!.id = events.find((e: any) => /1964/.test(e.id) && /july/i.test(e.id))?.id ?? checks[0]!.id;
const reviewed = new Map([...anchorUpdates, ...checks].map((a: any) => [a.id,a]));
const review = {
  checked:'2026-10-17', totalNonWW2Anchors:103, sourceBackedReferencePoints:anchorUpdates.length,
  exactHistoricalFootprintsEstablished:0, unresolvedDraftAnchors:103-anchorUpdates.length,
  note:'A source-backed current reference point is not a measured historical footprint. Coordinates were accepted only from Wikidata structured data or SLA published georeferenced maps/API. No OSM geometry. Only the entries with detailed read records below were actively audited; remaining entries are explicitly unreviewed in this pass.',
  licenceSourceIds:[wdLicence,slaLicence], verifiedUpdates:anchorUpdates, checkedUnresolved:checks,
  rejectedCandidates:[{url:'https://www.wikidata.org/wiki/Q12484698',reason:'Daik mountain is the wrong feature and its coordinate claim cites OpenStreetMap; excluded.'}],
  events:ledger.events.map((r:any)=>({id:r.id,...(reviewed.get(r.id) ?? {status:'unreviewed-in-this-pass', action:'Retain original approximate warning; no reliable new coordinate obtained.'})})),
  networkLimit:'Wikidata API returned HTTP429 during broader discovery; no location was invented to fill the remaining gaps.'
};
// Exact original WW2 objects remain invariant.
for (const id of ledger.copiedWW2Events) {
  if (JSON.stringify(events.find((e:any)=>e.id===id)) !== JSON.stringify(wwEvents.find((e:any)=>e.id===id))) throw new Error('WW2 event changed: '+id);
}
for (const id of ledger.copiedWW2Movements) {
  if (JSON.stringify(moves.find((e:any)=>e.id===id)) !== JSON.stringify(wwMoves.find((e:any)=>e.id===id))) throw new Error('WW2 movement changed: '+id);
}
write(path.join(data,'events.json'),events); write(path.join(data,'sources.json'),sourcesDoc);
write(path.join(dir,'content-date-gaps.json'),gaps); write(path.join(dir,'content-gaps.json'),ledger);
write(path.join(dir,'content-anchor-review.json'),review);
write(path.join(dir,'content-date-closures-applied.json'),{checked:'2026-10-17', sources:allocated, events:dateResults, remaining:gaps});
const audit = read(path.join(dir,'content-audit.json'));
Object.assign(audit,{sources:sources.length,eventDateGaps:Object.keys(gaps).length,sourceBackedReferenceAnchors:anchorUpdates.length,unresolvedDraftAnchors:103-anchorUpdates.length,exactHistoricalFootprintsEstablished:0});
write(path.join(dir,'content-audit.json'),audit);
console.log(JSON.stringify({sources:sources.length,closedDateWarnings:new Set(dateResults.filter(r=>r.closed).map(r=>r.id)).size,remainingDateWarnings:Object.keys(gaps).length,sourceBackedReferenceAnchors:anchorUpdates.length,unresolvedDraftAnchors:103-anchorUpdates.length,allocated},null,2));
