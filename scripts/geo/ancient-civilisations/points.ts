/**
 * G5 (docs/43 §3.7): place coordinates for events, sites and route ports,
 * read from Wikidata (CC0) at build time — never typed from memory.
 *
 *   pnpm tsx scripts/geo/ancient-civilisations/points.ts
 *
 * For every place in PLACES: the item's P625 (coordinate location), rounded
 * to 5 decimals, and its English and Chinese labels (zh-sg, then zh-hans, zh).
 * Written to places.json (committed: the provenance of every `at` in
 * events.json and of the ports in movements.json) with the retrieval date.
 * Two requests (wbgetentities takes 50 ids at a time).
 */
import { writeFileSync } from 'node:fs';

const OUT = 'scripts/geo/ancient-civilisations/places.json';
const UA = { 'User-Agent': 'atlas-build/0.1 (educational static site; build-time lookup)' };

/** id → Wikidata item. `note` says what the point stands for when it is not the place itself. */
const PLACES: Record<string, { qid: string; note?: string }> = {
  uruk: { qid: 'Q168518' },
  ur: { qid: 'Q5699' },
  eridu: { qid: 'Q210065' },
  nippur: { qid: 'Q188395' },
  lagash: { qid: 'Q207330' },
  kish: { qid: 'Q132272' },
  babylon: { qid: 'Q5684' },
  memphis: { qid: 'Q5715' },
  giza: { qid: 'Q12508' },
  thebes: { qid: 'Q101583', note: 'Wikidata point in the town of Luxor' },
  alexandria: { qid: 'Q87' },
  athens: { qid: 'Q1524' },
  sparta: { qid: 'Q5690' },
  delphi: { qid: 'Q75459' },
  olympia: { qid: 'Q38888' },
  corinth: { qid: 'Q103011' },
  rome: { qid: 'Q220' },
  pantheon: { qid: 'Q99309' },
  'pont-du-gard': { qid: 'Q189764' },
  capua: { qid: 'Q58477', note: 'today’s Capua; ancient Capua lay at Santa Maria Capua Vetere, about 4 km south-east' },
  'mohenjo-daro': { qid: 'Q5725' },
  harappa: { qid: 'Q185562' },
  dholavira: { qid: 'Q9468' },
  pataliputra: { qid: 'Q389755' },
  dhauli: { qid: 'Q3498218' },
  jaugada: { qid: 'Q11927218' },
  kalinga: { qid: 'Q1150706', note: 'representative point of the historical region, not a battlefield' },
  taxila: { qid: 'Q156093' },
  nalanda: { qid: 'Q216243' },
  sanchi: { qid: 'Q181123' },
  'gwalior-chaturbhuj': { qid: 'Q44545847' },
  erlitou: { qid: 'Q2692927' },
  yinxu: { qid: 'Q464904' },
  xianyang: { qid: 'Q497341' },
  'qin-mausoleum': { qid: 'Q47672' },
  changan: { qid: 'Q6501000' },
  luoyang: { qid: 'Q187136' },
  mogao: { qid: 'Q43286', note: 'the Mogao Caves near Dunhuang, where the Library Cave is' },
  'oc-eo': { qid: 'Q2344822' },
  'angkor-borei': { qid: 'Q986338' },
  palembang: { qid: 'Q8131' },
  'muaro-jambi': { qid: 'Q2725535' },
  'belitung-wreck': { qid: 'Q3589078' },
  'phnom-kulen': { qid: 'Q956515' },
  'angkor-wat': { qid: 'Q43473' },
  angkor: { qid: 'Q163607' },
  vijaya: { qid: 'Q10841882', note: 'Đồ Bàn citadel, the site of the Cham capital Vijaya' },
  'sambor-prei-kuk': { qid: 'Q1818746' },
  trowulan: { qid: 'Q962410' },
  sukhothai: { qid: 'Q423654' },
  melaka: { qid: 'Q61089' },
  'fort-canning': { qid: 'Q1438470' },
  borobudur: { qid: 'Q42798' },
  prambanan: { qid: 'Q84403674' },
  bagan: { qid: 'Q29317' },
  'ban-chiang': { qid: 'Q584125' },
  'my-son': { qid: 'Q391406' },
  ayutthaya: { qid: 'Q1025100' },
  'vat-phou': { qid: 'Q579860' },
  guangzhou: { qid: 'Q16572' },
  muziris: { qid: 'Q2974112' },
  arikamedu: { qid: 'Q2861278' },
  'sg-botanic-gardens': { qid: 'Q3046409' },
  acm: { qid: 'Q633033' },
  nagapattinam: { qid: 'Q695585', note: 'Chola port; that the 1025 fleet sailed from here is not recorded' },
  sambor: { qid: 'Q4929336', note: 'Sambour district, Kratie, where inscription K-127 was found in 1891 (Aczel); the exact find-spot is not given' },
};

type Entity = { labels?: Record<string, { value: string }>; claims?: Record<string, { mainsnak: { datavalue?: { value: { latitude: number; longitude: number } } } }[]> };
const ids = Object.values(PLACES).map((p) => p.qid);
const entities: Record<string, Entity> = {};
for (let i = 0; i < ids.length; i += 50) {
  if (i) await new Promise((r) => setTimeout(r, 10_000));
  const url = `https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&props=claims|labels&languages=en|zh|zh-hans|zh-sg&ids=${ids.slice(i, i + 50).join('|')}`;
  const res = await fetch(url, { headers: UA });
  const body = (await res.json()) as { entities: Record<string, Entity> };
  Object.assign(entities, body.entities);
}
const r5 = (n: number) => Math.round(n * 1e5) / 1e5;
const out: Record<string, unknown> = {};
for (const [id, p] of Object.entries(PLACES)) {
  const e = entities[p.qid];
  const c = e?.claims?.P625?.[0]?.mainsnak.datavalue?.value;
  if (!c) throw new Error(`${id} (${p.qid}): no P625`);
  out[id] = {
    qid: p.qid,
    at: [r5(c.longitude), r5(c.latitude)],
    en: e.labels?.en?.value ?? '',
    zh: e.labels?.['zh-sg']?.value ?? e.labels?.['zh-hans']?.value ?? e.labels?.zh?.value ?? '',
    ...(p.note ? { note: p.note } : {}),
  };
}
writeFileSync(OUT, `${JSON.stringify({ source: 'Wikidata (CC0), property P625', retrieved: new Date().toISOString().slice(0, 10), places: out }, null, 2)}\n`);
console.log(`${OUT}: ${Object.keys(out).length} places`);
