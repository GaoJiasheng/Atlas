"""Record the inspected Wikipedia/Wikidata coordinate pages; no downloaded-map bytes change."""
import json
from pathlib import Path
p=Path('scripts/geo/warring-states/raster-manifest.json');d=json.loads(p.read_text())
coords={
'Ji (Beijing)':([116.382425,39.894262],'https://en.wikipedia.org/wiki/Ji_(Beijing)','ancient city coordinate'),
'Handan':([114.487,36.601],'https://en.wikipedia.org/wiki/Handan','modern urban coordinate proxy near ancient capital'),
'Linzi':([118.3554,36.8829],'https://en.wikipedia.org/wiki/Ancient_Linzi','ancient city site coordinate'),
'Linzi (Yingqiu)':([118.3554,36.8829],'https://en.wikipedia.org/wiki/Ancient_Linzi','ancient city site coordinate'),
'Linwu':([112.55608,25.28167],'https://zh.wikipedia.org/wiki/临武县','modern town coordinate proxy for source ancient settlement'),
'Xianyang':([108.7088,34.3299],'https://en.wikipedia.org/wiki/Xianyang','modern urban coordinate proxy for source ancient capital'),
'Chengdu':([104.06333,30.66],'https://en.wikipedia.org/wiki/Chengdu','Tianfu Square city coordinate proxy'),
'Shu (Chengdu)':([104.06333,30.66],'https://en.wikipedia.org/wiki/Chengdu','Tianfu Square city coordinate proxy'),
'Ying (Jinancheng)':([112.19029806,30.40572194],'https://zh.wikipedia.org/wiki/楚纪南故城','archaeological site coordinate; different earlier Ying locations not assumed'),
'Luoyang (Wangcheng)':([112.4539,34.6197],'https://en.wikipedia.org/wiki/Luoyang','modern urban coordinate proxy; ancient urban footprint covers several sites'),
'Luoyang':([112.4539,34.6197],'https://en.wikipedia.org/wiki/Luoyang','modern urban coordinate proxy'),
'Daliang (Kaifeng)':([114.345,34.795],'https://en.wikipedia.org/wiki/Kaifeng','urban coordinate proxy for buried ancient capital'),
'Xinzheng':([113.7402,34.3964],'https://en.wikipedia.org/wiki/Xinzheng','urban coordinate proxy for ancient Zheng/Han capital'),
'Ba (Chongqing)':([106.5504,29.5637],'https://en.wikipedia.org/wiki/Chongqing','urban coordinate proxy for source Ba/Jiangzhou point'),
'Changsha':([112.939,28.228],'https://en.wikipedia.org/wiki/Changsha','urban coordinate proxy'),
'Qufu':([116.9862,35.5819],'https://en.wikipedia.org/wiki/Qufu','urban coordinate proxy for ancient Lu capital'),
'Wey (Puyang)':([115.0292,35.7627],'https://en.wikipedia.org/wiki/Puyang','urban coordinate proxy for source Diqiu/Wey point'),
'Yong (Fengxiang)':([107.42056,34.56],'https://en.wikipedia.org/wiki/Fengxiang_District','modern town coordinate proxy for nearby ancient Yong'),
'Song (Shangqiu)':([115.656,34.415],'https://en.wikipedia.org/wiki/Shangqiu','urban coordinate proxy for ancient Song capital'),
'Chen (Huaiyang)':([114.85,33.73306],'https://en.wikipedia.org/wiki/Huaiyang_District','town coordinate proxy for source Chen/Wanqiu'),
'Wu (Suzhou)':([120.61944,31.3],'https://en.wikipedia.org/wiki/Suzhou','urban coordinate proxy for ancient Wu capital'),
'Kuaiji (Shaoxing)':([120.58333333,30.0],'https://www.wikidata.org/wiki/Q42666','Wikidata P625 urban coordinate proxy'),
'Dai (Yuxian)':([114.567,39.833],'https://en.wikipedia.org/wiki/Yu_County,_Hebei','county-seat coordinate proxy for source Dai point'),
'Anyi':([111.17433,35.18425],'https://zh.wikipedia.org/wiki/安邑城','actual Warring States Wei capital site; not the different 安邑古城遗址'),
'Yangzhai (Yuzhou)':([113.489,34.142],'https://en.wikipedia.org/wiki/Yuzhou,_Henan','urban coordinate proxy for ancient Yangzhai'),
'Shouchun':([116.7982,32.545],'https://en.wikipedia.org/wiki/Shouchun','modern Shou county-seat proxy for nearby source Shouchun'),
'Nanzheng (Hanzhong)':([107.0232,33.0664],'https://en.wikipedia.org/wiki/Hanzhong','urban coordinate proxy for source Nanzheng/Hanzhong'),
}
notes={'method':'Control-point identities read from city dots/circles on source maps. Where the ancient-site article has no coordinate, inspected Wikipedia modern urban coordinates are explicit kilometre-scale proxies, not survey-precision ancient-site coordinates. No point is removed to make a residual budget pass.','coordinateSources':{},'sourceLimitations':{
'G7':'Textured relief cannot be reliably colour-classified. State boundaries digitised in original source pixel coordinates; no geographic polygons invented. Tiny Zhou glyph is not reliable geometry and should be omitted from frame. G7 tracing corrections wei-central/wei-east follow orange Wei source areas previously omitted.',
'G8':'Same physical map template as G7; controls transferred by exact thumbnail scale (330/736,352/786), city symbols visually checked. State outlines read from published 280BCE source. Qi is shown separate despite narrative occupation ambiguity. No Yue polygon in source (main old Yue lands are Chu).',
'G9':'Only point distribution and rivers/coasts; no territorial fills or political boundaries. Must not supply state polygons. Georeferenced check-only, independent city dots.',
'G10':'Undated schematic period map supplies the actual filled state outlines used instead of spec-misidentified G9. Missing bounded Chen/Cai/minor states are not invented; chronological frames remain explicit inference and omission.',
'G11':'Source city positions are schematic: Ba, Handan and Shouchun mismatches remain. Registration exceeds25km budget. State class tracing is faithful source geometry but draft-quality only; no bounded Lu or Wey face. Grey elongated Zhou Capital Area manually traced as shown. Lettering halos removed by component absorption and traced Wei outline.'}}
for mapid,src in d['raster'].items():
 notes['coordinateSources'][mapid]=[]
 for cp in src['controlPoints']:
  c,url,method=coords[cp['name']];cp['lnglat']=c;cp['coordinateSource']=url;cp['coordinateMethod']=method
  notes['coordinateSources'][mapid].append(cp)
p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
Path('scripts/geo/warring-states/raster-registration-notes.json').write_text(json.dumps(notes,ensure_ascii=False,indent=2)+'\n')
