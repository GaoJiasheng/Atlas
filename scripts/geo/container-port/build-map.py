from pathlib import Path
import json,html,hashlib
ROOT=Path(__file__).resolve().parents[3]
OUT=ROOT/'src/content/topics/container-port/assets'
land=json.loads((OUT/'straits-land.geojson').read_text())
water=json.loads((OUT/'marine-labels.geojson').read_text())
sg=json.loads((OUT/'singapore-label.geojson').read_text())['features'][0]['geometry']['coordinates']
W,H=640,570
views=[]
for name,box in [('regional',[94,-7,115,16]),('straits',[98,0,106,7])]:
 w,s,e,n=box
 k=min((W-28)/(e-w),(H-30)/(n-s))
 ox=(W-(e-w)*k)/2;oy=(H-(n-s)*k)/2
 def project(p):return [round(ox+(p[0]-w)*k,2),round(oy+(n-p[1])*k,2)]
 paths=[]
 for f in land['features']:
  g=f['geometry'];polys=g['coordinates'] if g['type']=='MultiPolygon' else [g['coordinates']]
  for poly in polys:
   rings=[]
   for ring in poly:
    pts=[project(p) for p in ring]; rings.append('M'+'L'.join(f'{x},{y}' for x,y in pts)+'Z')
   paths.append(''.join(rings))
 labels=[]
 for f in water['features']:
  p=f['geometry']['coordinates']
  if not (w<=p[0]<=e and s<=p[1]<=n): continue
  x,y=project(p);i=f['properties']['id']
  # Leader endpoints move for legibility; geography anchor remains the source point.
  dx,dy={'strait-of-singapore':(78,38),'strait-of-malacca':(35,-24),'andaman-sea':(22,-22),'south-china-sea':(0,-20),'indian-ocean':(0,-20)}[i]
  if name=='straits' and i=='strait-of-singapore':dx,dy=85,45
  labels.append({'id':i,'x':x,'y':y,'tx':max(96,min(544,x+dx)),'ty':max(30,min(530,y+dy)),'name':{'en':f['properties']['name'].title() if i=='indian-ocean' else f['properties']['name'],'zh':f['properties']['name_zh']}})
 x,y=project(sg)
 labels.append({'id':'singapore','x':x,'y':y,'tx':min(542,x+72),'ty':max(35,y-50),'name':{'en':'Singapore','zh':'新加坡'}})
 # These are typographic placements over the source land, not geographic point records.
 landnames=[{'name':{'en':'Malay Peninsula','zh':'马来半岛'},'xy':project([102,8 if name=='regional' else 5.8])},{'name':{'en':'Sumatra','zh':'苏门答腊'},'xy':project([101,-1 if name=='regional' else 1.3])}]
 views.append({'id':name,'bounds':box,'paths':paths,'labels':labels,'landnames':landnames})
(OUT/'straits-map.json').write_text(json.dumps({'width':W,'height':H,'views':views},ensure_ascii=False,separators=(',',':'))+'\n')
component='''---
import map from './straits-map.json';
import { pageLocale } from '../../../../components/mdx/locale';
const locale = pageLocale(Astro.url, Astro.currentLocale);
const { view = 'regional' } = Astro.props;
const plate = map.views.find((v) => v.id === view) ?? map.views[0]!;
const zh = locale === 'zh';
const title = zh ? (view === 'straits' ? '海峡近景' : '区域位置') : (view === 'straits' ? 'The two straits' : 'Regional position');
---
<figure class="port-map">
  <svg viewBox={`0 0 ${map.width} ${map.height}`} role="img" aria-label={zh ? 'Natural Earth 真实海岸图，标出两条海峡与新加坡；不作导航用途。' : 'Natural Earth coastline map locating the two straits and Singapore; not for navigation.'}>
    <defs><clipPath id={`port-clip-${view}-${locale}`}><rect x="1" y="1" width="638" height="568" /></clipPath></defs>
    <rect class="port-map__water" x="1" y="1" width="638" height="568" />
    <g clip-path={`url(#port-clip-${view}-${locale})`}>
      {plate.paths.map((d) => <path class="port-map__land" d={d} fill-rule="evenodd" />)}
      {plate.landnames.map((l) => <text class="port-map__land-name" x={l.xy[0]} y={l.xy[1]}>{l.name[locale]}</text>)}
      {plate.labels.map((l) => <g>
        <path class="port-map__leader" d={`M${l.x},${l.y}L${l.tx},${l.ty}`} />
        <circle class="port-map__point" cx={l.x} cy={l.y} r={l.id === 'singapore' ? 3.8 : 2.2} />
        <text class="port-map__label" x={l.tx} y={l.ty - 7}>{l.name[locale]}</text>
      </g>)}
    </g>
    <path class="port-map__north" d="M612,45V19M606,27L612,19L618,27" />
    <text class="port-map__label" x="612" y="63">{zh ? '北' : 'N'}</text>
  </svg>
  <figcaption><strong>{title}</strong> · {zh ? 'Natural Earth 公有领域陆地与水体名称；无日期制图快照。点是水体标签或国家标签位置，不是航线、泊位或实时船位。' : 'Public-domain Natural Earth land and waterbody names; an undated cartographic snapshot. Points locate labels, not routes, berths or live vessels.'}</figcaption>
</figure>
<style>
.port-map { margin: 1.25rem 0; color: var(--ink); }
.port-map svg { display: block; width: 100%; height: auto; border: 1px solid var(--line); }
.port-map__water { fill: var(--paper); }
.port-map__land { fill: var(--land); stroke: var(--ink-muted); stroke-width: .65; }
.port-map__point { fill: var(--signal); }
.port-map__leader, .port-map__north { fill: none; stroke: var(--ink); stroke-width: 1; }
.port-map__label { fill: var(--ink); text-anchor: middle; font: 18px sans-serif; paint-order: stroke; stroke: var(--paper); stroke-width: 4px; stroke-linejoin: round; }
.port-map__land-name { fill: var(--ink-muted); text-anchor: middle; font: italic 17px sans-serif; paint-order: stroke; stroke: var(--land); stroke-width: 3px; }
.port-map figcaption { margin-top: .5rem; font-size: .82em; line-height: 1.5; color: var(--ink-muted); }
</style>
'''
(OUT/'StraitsMap.astro').write_text(component)
print('Built two inline, theme-token map views from unchanged PD GeoJSON')
