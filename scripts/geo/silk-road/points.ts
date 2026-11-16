/**
 * G4 (docs/73 §3.2): place coordinates for events, sites, route stops and
 * journeys, read from Wikidata (CC0) at build time, never typed from memory.
 *
 *   pnpm tsx scripts/geo/silk-road/points.ts
 *
 * For every place: the item's P625 (coordinate location), rounded to 5
 * decimals, and its English and Chinese labels. Written to places.json
 * (committed: the provenance of every `at` in events.json and of every stop in
 * itineraries.json) with the retrieval date. `note` says what a point stands
 * for when it is not the place itself (a region, a reference point); `offshore`
 * makes routes.ts pass by an island instead of going to its inland point (Sri
 * Lanka); `snapKm` widens the 15 km search for water for a port up a creek.
 * Requests are spaced and retried: the API throttles bursts.
 */
import { writeFileSync } from 'node:fs';

const OUT = 'scripts/geo/silk-road/places.json';
const UA = { 'User-Agent': 'atlas-build/0.1 (educational static site; build-time lookup)' };

const PLACES: Record<string, { qid: string; note?: string; offshore?: boolean; snapKm?: number }> = {
  // China and the Tarim
  'chang-an': { qid: 'Q6501000', note: 'the old city of Chang’an, in today’s Xi’an' },
  luoyang: { qid: 'Q187136' },
  longxi: { qid: 'Q632997', note: 'Lintao county, a reference point for the Han commandery of Longxi' },
  wuwei: { qid: 'Q769781', note: 'Liangzhou district of Wuwei (Han Wuwei commandery, Tang Liangzhou)' },
  zhangye: { qid: 'Q197402', note: 'today’s city (Han Zhangye commandery, Polo’s Campichu, Pegolotti’s Camexu)' },
  jiuquan: { qid: 'Q533432' },
  dunhuang: { qid: 'Q319114' },
  mogao: { qid: 'Q43286' },
  yumen: { qid: 'Q1324562', note: 'the Yumen Pass (Jade Gate)' },
  guazhou: { qid: 'Q1201947', note: 'Guazhou county' },
  hami: { qid: 'Q989892', note: 'Hami (Yiwu), today’s city' },
  gaochang: { qid: 'Q877381', note: 'the ruined city of Gaochang in the Turfan oasis' },
  jiaohe: { qid: 'Q1330939', note: 'the ruined city of Jiaohe (Yarkhoto), seat of Nearer Jushi' },
  yanqi: { qid: 'Q1023082', note: 'Yanqi county (Karashahr)' },
  luntai: { qid: 'Q1023121', note: 'Luntai county, where Wulei lay (which ruin is debated)' },
  kucha: { qid: 'Q1023116', note: 'Kuqa, today’s city (Qiuci, Tang Anxi)' },
  aksu: { qid: 'Q421648', note: 'Aksu, today’s city (Han Gumo; Tang Bohuan area)' },
  uqturpan: { qid: 'Q1207622', note: 'Uqturpan county (Han Wensu, Hill 2003)' },
  kashgar: { qid: 'Q170521' },
  yarkand: { qid: 'Q12832321', note: 'the county seat of Yarkant (Han Suoche)' },
  pishan: { qid: 'Q1028101', note: 'Pishan (Guma) county' },
  khotan: { qid: 'Q235389' },
  keriya: { qid: 'Q1209102', note: 'Yutian county (Keriya; Han Jumi)' },
  niya: { qid: 'Q1329268', note: 'the Niya site (Han Jingjue)' },
  qiemo: { qid: 'Q643714', note: 'Qiemo county (Cherchen)' },
  ruoqiang: { qid: 'Q1023120', note: 'Ruoqiang county (Charklik), a reference point for Shanshan and Polo’s Lop' },
  khanbaliq: { qid: 'Q101186473', note: 'Khanbaliq (Dadu), within today’s Beijing; also Tang Youzhou' },
  shangdu: { qid: 'Q471765', note: 'Shangdu (Kaiping), Khubilai’s summer capital' },
  hangzhou: { qid: 'Q4970' },
  quanzhou: { qid: 'Q68695' },
  guangzhou: { qid: 'Q16572' },
  xuwen: { qid: 'Q1374567', note: 'Xuwen county' },
  hepu: { qid: 'Q1268277', note: 'Hepu county' },
  laoshan: { qid: 'Q1698782', note: 'Mount Lao (Laoshan), Shandong' },
  qingzhou: { qid: 'Q1360781' },
  'tuen-mun': { qid: 'Q1758751' },
  // Steppe and Central Asia
  onon: { qid: 'Q206694', note: 'the Wikidata point of the Onon River, in the Khentii mountains near its source' },
  karakorum: { qid: 'Q62677' },
  ferghana: { qid: 'Q486324', note: 'a reference point for the Ferghana Valley (Dayuan), not a site' },
  bactria: { qid: 'Q132646', note: 'a reference point for the region of Bactria (Daxia), not a site' },
  samarkand: { qid: 'Q5753' },
  tashkent: { qid: 'Q269' },
  suyab: { qid: 'Q15636265', note: 'Ak-Beshim, the ruins of Suyab' },
  bedel: { qid: 'Q2330389', note: 'the Bedel pass' },
  kulan: { qid: 'Q4246014' },
  taraz: { qid: 'Q486545' },
  otrar: { qid: 'Q956911' },
  almaliq: { qid: 'Q2627464' },
  urgench: { qid: 'Q48472', note: 'Köneürgenç (Old Urgench)' },
  saraichik: { qid: 'Q2996387', note: 'Saray-Jük (Saraichik)' },
  astrakhan: { qid: 'Q3927' },
  tana: { qid: 'Q102762', note: 'today’s Azov, near the site of Tana' },
  burana: { qid: 'Q852032', note: 'the Burana tower, beside one of the two cemeteries of the 2022 study' },
  merv: { qid: 'Q193325', note: 'the ruins of Merv' },
  nishapur: { qid: 'Q131350' },
  balkh: { qid: 'Q182159' },
  bamyan: { qid: 'Q214495' },
  badakhshan: { qid: 'Q165376', note: 'a reference point for Badakhshan province, not a site' },
  rabatak: { qid: 'Q2382049', note: 'the find-spot of the Rabatak inscription' },
  herat: { qid: 'Q45313' },
  farah: { qid: 'Q2399439', note: 'Farah city district' },
  kandahar: { qid: 'Q45604' },
  // India and the seas
  peshawar: { qid: 'Q1113311' },
  mathura: { qid: 'Q200311' },
  patna: { qid: 'Q80484', note: 'Patna (Pataliputra)' },
  nalanda: { qid: 'Q216243', note: 'the ruins of Nalanda Mahavihara' },
  tamluk: { qid: 'Q118278', note: 'Tamluk (Tamralipti), a river port that the plate does not reach by water', snapKm: 60 },
  'sri-lanka': { qid: 'Q4526612', note: 'the main island of Sri Lanka (a reference point)', offshore: true },
  kollam: { qid: 'Q321475' },
  muziris: { qid: 'Q2974112' },
  mangalore: { qid: 'Q127041' },
  bharuch: { qid: 'Q760153', note: 'Bharuch (Barygaza, Broach)' },
  banbhore: { qid: 'Q491993', note: 'Banbhore, identified with Debal (Hsieh 2010); it lies up a creek of the Indus delta that the plate does not draw', snapKm: 40 },
  'samudera-pasai': { qid: 'Q3284315', note: 'the Wikidata point of the kingdom of Samudra-Pasai' },
  palembang: { qid: 'Q8131' },
  belitung: { qid: 'Q3589078', note: 'the Belitung wreck site' },
  'fort-canning': { qid: 'Q1438470', note: 'Fort Canning Hill, Singapore' },
  'cu-lao-cham': { qid: 'Q386184', note: 'the Chàm Islands' },
  'phan-rang': { qid: 'Q19013' },
  'con-son': { qid: 'Q1866965' },
  // West Asia, Africa and Europe
  harran: { qid: 'Q199547', note: 'Harran (Carrhae)' },
  zeugma: { qid: 'Q196987' },
  raqqa: { qid: 'Q283368', note: 'Raqqa (Nicephorium)' },
  'dura-europos': { qid: 'Q464266' },
  seleucia: { qid: 'Q1136681', note: 'Seleucia on the Tigris' },
  ctesiphon: { qid: 'Q192541' },
  behistun: { qid: 'Q180012', note: 'the Behistun inscription (Bagistana)' },
  kangavar: { qid: 'Q720604' },
  hamadan: { qid: 'Q28587', note: 'Hamadan (Ecbatana)' },
  rey: { qid: 'Q636188', note: 'Ray (Rhaga)' },
  baghdad: { qid: 'Q1530' },
  basra: { qid: 'Q48195' },
  ubulla: { qid: 'Q619594', note: 'al-Ubulla, a river port up the Shatt al-Arab, which the plate does not draw as water', snapKm: 130 },
  kufa: { qid: 'Q186234' },
  damascus: { qid: 'Q3766' },
  jabiyah: { qid: 'Q3607443' },
  antioch: { qid: 'Q200441', note: 'ancient Antioch, in today’s Antakya' },
  'ain-jalut': { qid: 'Q603425', note: 'the spring of Harod (Ain Jalut)' },
  pelusium: { qid: 'Q1145715', note: 'Pelusium (al-Farama)' },
  clysma: { qid: 'Q3775676', note: 'Clysma (al-Qulzum), by today’s Suez' },
  jeddah: { qid: 'Q374365' },
  berenike: { qid: 'Q819050' },
  aden: { qid: 'Q131694' },
  alexandria: { qid: 'Q87' },
  cairo: { qid: 'Q85' },
  hormuz: { qid: 'Q695265', note: 'Hormuz island, a reference point for the Hormuz of Polo’s time' },
  tabriz: { qid: 'Q80053' },
  trabzon: { qid: 'Q45301', note: 'Trabzon (Trebizond)' },
  acre: { qid: 'Q126084' },
  ayas: { qid: 'Q939243', note: 'Yumurtalık (Ayas, Polo’s Layas)' },
  constantinople: { qid: 'Q16869' },
  bosporus: { qid: 'Q35958', note: 'the Bosporus strait: a waypoint where a sea route enters the Black Sea, because the plate’s 2 km coast closes the strait itself' },
  sudak: { qid: 'Q7830', note: 'Sudak (Soldaia)' },
  derbent: { qid: 'Q131416' },
  nakhchivan: { qid: 'Q230104' },
  sivas: { qid: 'Q107401' },
  kayseri: { qid: 'Q48338' },
  konya: { qid: 'Q79857' },
  tripoli: { qid: 'Q168954', note: 'Tripoli, Lebanon' },
  caffa: { qid: 'Q158491', note: 'Feodosia (Caffa)' },
  messina: { qid: 'Q13666' },
  strasbourg: { qid: 'Q6602' },
  venice: { qid: 'Q641' },
  naples: { qid: 'Q2634' },
  rome: { qid: 'Q220' },
  genoa: { qid: 'Q1449' },
  paris: { qid: 'Q90' },
  bordeaux: { qid: 'Q1479' },
  tangier: { qid: 'Q126148' },
  kairouan: { qid: 'Q179570' },
};

type Entity = { labels?: Record<string, { value: string }>; claims?: Record<string, { rank?: string; mainsnak: { datavalue?: { value: { latitude: number; longitude: number } } } }[]> };
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
async function get(url: string): Promise<{ entities: Record<string, Entity> }> {
  for (let i = 0; i < 6; i++) {
    const text = await (await fetch(url, { headers: UA })).text();
    if (text.startsWith('{')) return JSON.parse(text) as { entities: Record<string, Entity> };
    await sleep(15_000 * (i + 1));
  }
  throw new Error(`Wikidata kept refusing ${url}`);
}
const missing = Object.entries(PLACES).filter(([, p]) => p.qid === 'Q0').map(([id]) => id);
if (missing.length) throw new Error(`no Wikidata item chosen for: ${missing.join(', ')}`);
const ids = [...new Set(Object.values(PLACES).map((p) => p.qid))];
const entities: Record<string, Entity> = {};
for (let i = 0; i < ids.length; i += 50) {
  if (i) await sleep(10_000);
  Object.assign(entities, (await get(`https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&props=claims|labels&languages=en|zh|zh-hans|zh-sg&ids=${ids.slice(i, i + 50).join('|')}`)).entities);
}
const r5 = (n: number) => Math.round(n * 1e5) / 1e5;
const out: Record<string, unknown> = {};
for (const [id, p] of Object.entries(PLACES)) {
  const e = entities[p.qid];
  const claims = e?.claims?.P625 ?? [];
  const c = (claims.find((x) => x.rank === 'preferred') ?? claims.find((x) => x.rank !== 'deprecated'))?.mainsnak.datavalue?.value;
  if (!c) throw new Error(`${id} (${p.qid}): no P625`);
  out[id] = {
    qid: p.qid,
    at: [r5(c.longitude), r5(c.latitude)],
    en: e!.labels?.en?.value ?? '',
    zh: e!.labels?.['zh-sg']?.value ?? e!.labels?.['zh-hans']?.value ?? e!.labels?.zh?.value ?? '',
    ...(p.note ? { note: p.note } : {}),
    ...(p.offshore ? { offshore: true } : {}),
    ...(p.snapKm ? { snapKm: p.snapKm } : {}),
  };
}
writeFileSync(OUT, `${JSON.stringify({ source: 'Wikidata (CC0), property P625', retrieved: new Date().toISOString().slice(0, 10), places: out }, null, 2)}\n`);
console.log(`${OUT}: ${Object.keys(out).length} places`);
