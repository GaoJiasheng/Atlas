"""Publish the acquired Natural Earth snapshot without inventing/simplifying geometry.
Usage: python3 scripts/geo/southeast-asia/build.py /path/to/research/southeast-asia
Raw inputs are deliberately outside the repo; exact input/output hashes in provenance.json.
"""
import sys,json,hashlib
from pathlib import Path
root=Path(__file__).resolve().parents[3]
raw=Path(sys.argv[1]); out=root/'src/content/topics/southeast-asia/data'
read=lambda f:json.loads((raw/'data'/f).read_text())
bi=lambda en,zh:dict(en=en,zh=zh)
fc=lambda fs:dict(type='FeatureCollection',features=fs)
feature=lambda g,p:dict(type='Feature',geometry=g,properties=p)
country_names={'IDN':bi('Indonesia','印度尼西亚'),'MYS':bi('Malaysia','马来西亚'),'VNM':bi('Viet Nam','越南'),'KHM':bi('Cambodia','柬埔寨'),'LAO':bi('Lao PDR','寮国'),'THA':bi('Thailand','泰国'),'TLS':bi('Timor-Leste','东帝汶'),'BRN':bi('Brunei Darussalam','文莱'),'MMR':bi('Myanmar','缅甸'),'PHL':bi('Philippines','菲律宾'),'SGP':bi('Singapore','新加坡')}
countries=[]
for f in read('countries-sea.geojson')['features']:
 p=f['properties']; a=p['ADM0_A3']; countries.append(feature(f['geometry'],dict(id='geo-'+a.lower(),a3=a,name=country_names[a],sources=['S101'])))
# Country labels are source LABEL_X/Y, never inferred centroids or weather stations.
anchors=[]; seas=[]; peaks=[]
sea_alias={'South China Sea':('sea-south-china','南中国海'),'Java Sea':('sea-java','爪哇海'),'Andaman Sea':('sea-andaman','安达曼海'),'Strait of Malacca':('sea-malacca','马六甲海峡')}
peak_alias={'Hkakabo Razi':'peak-hkakabo-razi','Mount Kinabalu':'peak-kinabalu','Mount Kerinci':'peak-kerinci','Mount Pulag':'peak-pulag'}
for a in read('anchors-sea.json')['anchors']:
 if a['id'].startswith('geo-'):
  name=country_names[a['id'][4:].upper()]; source='S101'; ident=a['id']
 elif a['id'].startswith('sea-'):
  ident,zh=sea_alias[a['name']['en']]; name=bi(a['name']['en'],zh); source='S108'
  seas.append(feature(dict(type='Point',coordinates=a['at']),dict(id=ident,name=name,sources=[source],summary=bi('A source-derived sea-name label, not a maritime boundary.','依据来源生成的海名标签，不是海上边界。'))))
 else:
  ident=peak_alias[a['name']['en']];name=a['name'];source='S109'
  peaks.append(feature(dict(type='Point',coordinates=a['at']),dict(id=ident,name=name,sources=[source],summary=bi('A generalised mountain location, not a terrain surface or height measurement.','概括的山峰位置，不是地形面或高度测量。'))))
 anchors.append(dict(id=ident,name=name,at=a['at'],sources=[source]))
# Only Singapore is required; source city coordinates, not park positions.
city=next(f for f in read('cities-sea.geojson')['features'] if f['properties'].get('NAME')=='Singapore')
anchors.append(dict(id='city-singapore',name=bi('Singapore city','新加坡市区'),at=city['geometry']['coordinates'],sources=['S110']))
river_names={'Ayeyarwady':('river-ayeyarwady',bi('Ayeyarwady','伊洛瓦底江')),'Hong':('river-red',bi('Red River','红河')),'Lancang':('river-mekong',bi('Lancang–Mekong','澜沧江—湄公河')),'Mekong':('river-mekong',bi('Lancang–Mekong','澜沧江—湄公河')),'Chao Phraya':('river-chao-phraya',bi('Chao Phraya','湄南河'))}
rivers=[]
for f in read('rivers-sea.geojson')['features']:
 ident,name=river_names[f['properties']['name']]
 rivers.append(feature(f['geometry'],dict(id=ident,name=name,sources=['S102'],summary=bi('Generalised source river reaches; gaps are not connected or animated as water flow.','来源资料中的概括河段；不补接缺线，也不把线当作水流模拟。'))))
# River label anchors are exact source vertices, never new connecting geometry.
for ident,name in dict(river_names.values()).items():
 parts=[]
 for f in rivers:
  if f['properties']['id']!=ident:continue
  geometry=f['geometry'];parts.extend(geometry['coordinates'] if geometry['type']=='MultiLineString' else [geometry['coordinates']])
 segment=max(parts,key=len)
 anchors.append(dict(id=ident,name=name,at=segment[len(segment)//2],sources=['S102']))
members=[]
for m in read('membership-sea.json')['members']:
 members.append({k:m[k] for k in ['id','a3','joined']}|dict(sources=['S5'] if m['a3']=='TLS' else ['S6'] if m['joined']=='1967-08-08' else ['S4']))
ref=[]
def case(ident,en,zh,summary_en,summary_zh,country,sources,figure=None):
 item=dict(id=ident,label=bi(en,zh),summary=bi(summary_en,summary_zh),sourceIds=sources,locationRef=country,locationScope='country')
 if figure:item['figure']=figure
 ref.append(item)
case('case-bukit-timah','Bukit Timah rainforest','武吉知马雨林','NParks describes primary rainforest here. Singapore is the country-scale reference; no park boundary is plotted.','NParks 介绍这里的原生雨林。新加坡只作国家尺度参考；图中未画保护区边界。','geo-sgp',['S104','S12'])
case('case-sungei-buloh','Sungei Buloh wetlands','双溪布洛湿地','Wetlands, mangroves and migratory birds are part of this NParks example. Its park boundary is not plotted.','这个 NParks 案例包括湿地、红树林与候鸟。图中未画保护区边界。','geo-sgp',['S105','S12'])
case('case-mangrove-roots','Arching stilt roots','弯拱的支柱根','The specimen shows a stilt-root growth form described for Rhizophora. It is not a species-identification key or a vegetation map.','标本图展示红树属植物可见的支柱根形态，不是物种检索表或植被分布图。','geo-sgp',['S103'],'sea-mangrove-figure')
case('case-terraces','Ifugao rice terraces','伊富高水稻梯田','The UNESCO property is in northern Luzon. The schematic illustrates retained level fields; it does not survey any named cluster.','联合国教科文组织遗产地位于吕宋北部。示意图解释有挡护的平田面，不是任何具名田区的测绘。','geo-phl',['S9','S10'],'sea-terrace-figure')
case('case-terraces-water','Water for terraces','梯田的供水','FAO describes upland forests, irrigation, cultivated fields and community management as connected parts of the farming system.','粮农组织说明高地森林、灌溉、耕地和社区管理是相互联系的农业系统组成部分。','geo-phl',['S10'],'sea-terrace-figure')
case('case-terrace-dating','Different dating claims','不同的年代解释','UNESCO gives a long heritage chronology; UCLA reports younger wet-rice dates for studied sites. The claims concern different evidence and cannot be averaged.','教科文组织采用较长的遗产年代叙述；UCLA 报道所研究遗址较晚的湿稻年代。证据和范围不同，不能取平均。','geo-phl',['S9','S11'])
case('case-songket','Songket weaving','宋吉织造','UNESCO describes songket as a Malaysian hand-weaving tradition; it is one example, not everyone’s work or exclusive cultural ownership.','教科文组织介绍马来西亚的宋吉手工织造传统。这是一个案例，不代表所有人的职业或文化的独占归属。','geo-mys',['S107'])
case('case-technology','Semiconductor work','半导体工作','Singapore EDB describes IC design and manufacturing-related infrastructure and skills. This country reference is not a factory location.','新加坡经济发展局介绍集成电路设计和制造相关的设施与技能。这里是国家参考，不是工厂位置。','geo-sgp',['S13'])
case('case-tourism','Sustainable tourism cooperation','可持续旅游合作','ASEAN has a sustainable tourism roadmap. The Philippines, home of the terrace example, is only a country reference for discussing this regional activity, not a mapped tourism hotspot.','亚细安有可持续旅游路线图。菲律宾（梯田案例所在国）在此只作讨论区域活动的国家参考，不是旅游热点地图。','geo-phl',['S14'])
case('case-housing','A raised-house example','高脚屋案例','NHB describes a raised floor and a high sloping attap roof in a kampong-house example. The cover is a generic drawing, not a named building.','国家文物局介绍甘榜房屋实例的架高地板与高斜亚答屋顶。封面是一般图例，不是某一栋建筑。','geo-sgp',['S106'])
case('case-asean-cooperation','Cooperation across neighbours','邻国之间的合作','ASEAN’s founding declaration describes economic and social cooperation and regional peace. Conservation provides a concrete example.','亚细安创立宣言包括经济、社会合作与区域和平。保育是一个具体的合作案例。','geo-sgp',['S114','S12'])
layers=[dict(id='geo-rivers',kind='line',label=bi('River systems','水系'),color='token:rivers',features=fc(rivers)),dict(id='geo-peaks',kind='point',label=bi('Mountain locations','山峰位置'),color='token:ink-2',features=fc(peaks)),dict(id='geo-marine-labels',kind='point',label=bi('Sea-name references','海名参考'),color='token:rivers',features=fc(seas))]
geography=dict(countries=fc(countries),layers=layers,anchors=anchors,members=members,referenceItems=ref)
out.mkdir(parents=True,exist_ok=True)
blob=json.dumps(geography,ensure_ascii=False,separators=(',',':'))+'\n';(out/'geography.json').write_text(blob)
# Source hashes permit deterministic verification without republishing 23MB of raw files.
inputs=['countries-sea.geojson','rivers-sea.geojson','peaks-sea.geojson','marine-reference-sea.geojson','anchors-sea.json','cities-sea.geojson','membership-sea.json']
provenance=dict(acquired='2026-10-27',crs='EPSG:4326',licenceFamily='PD-derived',method='Exact source coordinates; selected properties only. No simplification, interpolation, geometric joins or invented shapes. Sea labels use prepared interior points; country anchors use source LABEL_X/Y.',inputs=[dict(file=f,sha256=hashlib.sha256((raw/'data'/f).read_bytes()).hexdigest()) for f in inputs],output=dict(file='geography.json',bytes=len(blob.encode()),sha256=hashlib.sha256(blob.encode()).hexdigest(),countryGeometrySha256=hashlib.sha256(json.dumps([f['geometry'] for f in countries],separators=(',',':')).encode()).hexdigest()),countries=[dict(id=f['properties']['id'],neId=src['properties']['NE_ID']) for f,src in zip(countries,read('countries-sea.geojson')['features'])],riverSourceNames=[f['properties']['name'] for f in read('rivers-sea.geojson')['features']])
(out.parent/'provenance.json').write_text(json.dumps(provenance,indent=2,ensure_ascii=False)+'\n')
print(len(countries),'countries;',len(rivers),'river features;',len(peaks),'peaks;',len(seas),'seas;',len(ref),'cases;',len(blob.encode()),'bytes')
