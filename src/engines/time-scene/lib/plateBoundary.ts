/** PB2002 / Bird (2003) names, shared by every boundary instead of repeated in data. */
import type { CatalogueEntry } from '../catalogueSchema';

type Names = { en: string; zh: string };
const names: Record<string, Names> = {
  AF: { en: 'African Plate', zh: '非洲板块' },
  AM: { en: 'Amur Plate', zh: '阿穆尔板块' },
  AN: { en: 'Antarctic Plate', zh: '南极洲板块' },
  AP: { en: 'Altiplano Plate', zh: '阿尔蒂普拉诺板块' },
  AR: { en: 'Arabian Plate', zh: '阿拉伯板块' },
  AS: { en: 'Aegean Sea Plate', zh: '爱琴海板块' },
  AT: { en: 'Anatolian Plate', zh: '安纳托利亚板块' },
  AU: { en: 'Australian Plate', zh: '澳大利亚板块' },
  BH: { en: 'Bird’s Head Plate', zh: '鸟首板块' },
  BR: { en: 'Balmoral Reef Plate', zh: '巴尔莫勒尔礁板块' },
  BS: { en: 'Banda Sea Plate', zh: '班达海板块' },
  BU: { en: 'Burma Plate', zh: '缅甸板块' },
  CA: { en: 'Caribbean Plate', zh: '加勒比板块' },
  CL: { en: 'Caroline Plate', zh: '加罗林板块' },
  CO: { en: 'Cocos Plate', zh: '科科斯板块' },
  CR: { en: 'Conway Reef Plate', zh: '康韦礁板块' },
  EA: { en: 'Easter Plate', zh: '复活节板块' },
  EU: { en: 'Eurasian Plate', zh: '欧亚板块' },
  FT: { en: 'Futuna Plate', zh: '富图纳板块' },
  GP: { en: 'Galapagos Plate', zh: '加拉帕戈斯板块' },
  IN: { en: 'Indian Plate', zh: '印度板块' },
  JF: { en: 'Juan de Fuca Plate', zh: '胡安·德富卡板块' },
  JZ: { en: 'Juan Fernandez Plate', zh: '胡安·费尔南德斯板块' },
  KE: { en: 'Kermadec Plate', zh: '克马德克板块' },
  MA: { en: 'Mariana Plate', zh: '马里亚纳板块' },
  MN: { en: 'Manus Plate', zh: '马努斯板块' },
  MO: { en: 'Maoke Plate', zh: '毛克板块' },
  MS: { en: 'Molucca Sea Plate', zh: '马鲁古海板块' },
  NA: { en: 'North American Plate', zh: '北美洲板块' },
  NB: { en: 'North Bismarck Plate', zh: '北俾斯麦板块' },
  ND: { en: 'North Andes Plate', zh: '北安第斯板块' },
  NH: { en: 'New Hebrides Plate', zh: '新赫布里底板块' },
  NI: { en: 'Niuafo’ou Plate', zh: '纽阿福欧板块' },
  NZ: { en: 'Nazca Plate', zh: '纳斯卡板块' },
  OK: { en: 'Okhotsk Plate', zh: '鄂霍次克板块' },
  ON: { en: 'Okinawa Plate', zh: '冲绳板块' },
  PA: { en: 'Pacific Plate', zh: '太平洋板块' },
  PM: { en: 'Panama Plate', zh: '巴拿马板块' },
  PS: { en: 'Philippine Sea Plate', zh: '菲律宾海板块' },
  RI: { en: 'Rivera Plate', zh: '里韦拉板块' },
  SA: { en: 'South American Plate', zh: '南美洲板块' },
  SB: { en: 'South Bismarck Plate', zh: '南俾斯麦板块' },
  SC: { en: 'Scotia Plate', zh: '斯科舍板块' },
  SL: { en: 'Shetland Plate', zh: '设得兰板块' },
  SO: { en: 'Somali Plate', zh: '索马里板块' },
  SS: { en: 'Solomon Sea Plate', zh: '所罗门海板块' },
  SU: { en: 'Sunda Plate', zh: '巽他板块' },
  SW: { en: 'Sandwich Plate', zh: '桑威奇板块' },
  TI: { en: 'Timor Plate', zh: '帝汶板块' },
  TO: { en: 'Tonga Plate', zh: '汤加板块' },
  WL: { en: 'Woodlark Plate', zh: '伍德拉克板块' },
  YA: { en: 'Yangtze Plate', zh: '扬子板块' },
  OSR: { en: 'ocean-floor spreading ridge', zh: '海底扩张洋脊' },
  CRB: { en: 'continental rift boundary', zh: '大陆裂谷边界' },
  OTF: { en: 'oceanic transform fault', zh: '海洋转换断层' },
  CTF: { en: 'continental transform fault', zh: '大陆转换断层' },
  SUB: { en: 'subduction zone', zh: '俯冲带' },
  OCB: { en: 'oceanic convergent boundary', zh: '海洋汇聚边界' },
  CCB: { en: 'continental collision boundary', zh: '大陆碰撞边界' },
};

/** -, / and \ distinguish source boundary orientations; names keep their source order. */
export function decodePlateBoundary(code: string): Names | null {
  const match = /^([A-Z]{2})[-/\\]([A-Z]{2})\/([A-Z]{3})$/.exec(code);
  if (!match) return null;
  const first = names[match[1]!], second = names[match[2]!], type = names[match[3]!];
  if (!first || !second || !type) return null;
  return { en: `${first.en} – ${second.en} · ${type.en}`, zh: `${first.zh} – ${second.zh} · ${type.zh}` };
}

/** Expand once at load, so the index, search, map label and inspector agree. */
export function readablePlateBoundary(entry: CatalogueEntry): CatalogueEntry {
  const title = decodePlateBoundary(entry.title.en);
  return {
    ...entry,
    title: title ?? { en: 'Plate boundary', zh: '板块边界' },
    // The content spec requires original classification codes alongside readable names.
    rows: [...entry.rows, { key: 'source-code', label: { en: 'Source code', zh: '来源代码' }, value: entry.title }],
  };
}
