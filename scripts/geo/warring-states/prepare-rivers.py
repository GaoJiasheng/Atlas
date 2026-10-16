"""Copy open river paths from G1 with ids and transforms preserved, for lib/svg.
No geographic line is drawn or interpolated here.
"""
import xml.etree.ElementTree as E,json,pathlib,copy
p=pathlib.Path(__file__).parent
r=E.parse(p/'raw/G1.svg').getroot(); out=E.Element('svg',{'xmlns':'http://www.w3.org/2000/svg','width':r.get('width'),'height':r.get('height')}); g=E.SubElement(out,'g',{'transform':list(r)[2].get('transform','scale(1,-1) translate(-9424.609294455078,-4619.758867920853)')})
# Locate actual parent wrapper, rather than depend on child order.
g.set('transform',next(e.get('transform') for e in r if e.tag.endswith('g')))
meta={};i=0
names={'Fen':'Fen River','Wei':'Wei River','Han':'Han River','Huai':'Huai River','Dan':'Dan River','Jing':'Jing River','Ying':'Ying River','Luan':'Luan River','Wuding':'Wuding River','Fuchun':'Fuchun River','Yongding':'Yongding River','Hai':'Hai River','Liao':'Liao River','Gan':'Gan River','Min':'Min River','Yangtze':'Yangtze River','Chang_Jiang':'Yangtze River','Huang':'Yellow River'}
zh={'Fen':'汾水','Wei':'渭水','Han':'汉水','Huai':'淮水','Dan':'丹水','Jing':'泾水','Ying':'颍水','Luan':'滦水','Wuding':'无定河','Fuchun':'富春江','Yongding':'永定河','Hai':'海河','Liao':'辽水','Gan':'赣水','Min':'岷江','Yangtze':'长江','Chang_Jiang':'长江','Huang':'黄河'}
def walk(e,parent=''):
 global i
 eid=e.get('id','');inherited=eid if eid in ['Huang_before_602_BC','Huang_before_11_AD','Ji'] else parent
 tag=e.tag.split('}')[-1];cls=e.get('class','')
 if tag in ['polyline','path'] and ((eid in names and ('rivers' in cls)) or inherited):
  i+=1; ident=f'river-{i}';attrs={'id':ident,'fill':'#010101','stroke':'none'}
  attrs['d']=e.get('d') if tag=='path' else 'M '+' L '.join(e.get('points').split())
  E.SubElement(g,'path',attrs)
  key=inherited or eid
  props={'id':key.lower().replace('_','-')+'-'+str(i),'name':{'en':names.get(eid,'Ji River' if inherited=='Ji' else 'Yellow River'),'zh':zh.get(eid,'济水' if inherited=='Ji' else '黄河')},'src':['G1'],'method':'Open path copied from Kanguole SVG and affine registered against Natural Earth endpoints.'}
  if inherited:props['reconstructed']=True
  if inherited=='Huang_before_602_BC':props['to']='-0602'
  if inherited=='Huang_before_11_AD':props['from']='-0602';props['to']='0011'
  meta[ident]=props
 for c in e:walk(c,inherited)
walk(r)
E.ElementTree(out).write(p/'raw/G1-rivers.svg',encoding='unicode')
(p/'river-path-metadata.json').write_text(json.dumps(meta,ensure_ascii=False,indent=2)+'\n')
# Registration copy has explicit fills because lib/svg intentionally does not parse CSS.
# Minimal style-only registration copies keep the actual source frame geometry.
E.register_namespace('', 'http://www.w3.org/2000/svg')
for ident,klass in [('G1','land'),('G2','background')]:
 r=E.parse(p/f'raw/{ident}.svg').getroot()
 bg=next(e for e in r.iter() if e.get('class')==klass and e.tag.split('}')[-1] in ['rect','polygon'])
 if bg.tag.endswith('rect'):
  shape=f'<rect fill="#a8c68f" x="0" y="0" width="{bg.get("width")}" height="{bg.get("height")}"/>'
  tr=''
 else:
  shape=f'<polygon fill="#a8c68f" points="{bg.get("points")}"/>'
  tr=next(e.get('transform') for e in r if e.tag.endswith('g'))
 content=f'<svg width="{r.get("width")}" height="{r.get("height")}" xmlns="http://www.w3.org/2000/svg"><g transform="{tr}">{shape}</g></svg>'
 (p/f'raw/{ident}-registration.svg').write_text(content)
