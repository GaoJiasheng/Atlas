"""Second-pass factual anchors; request sources with an identifying User-Agent."""
import json,re,time
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import requests
from bs4 import BeautifulSoup
OUT=Path(__file__).with_name('verification-sites.json')
NAMES=['葵丘之会', '城濮之战', '柏举之战', '夫椒之战', '石门之战', '桂陵之战', '马陵之战', '修鱼之战', '丹阳、蓝田之战', '阏与之战', '蕞之战', '秦赵平阳之战', '肥之战', '城父之战', '繻葛之战', '泓水之战', '崤之战', '邲之战', '鄢陵之战', '檇李之战', '艾陵之战', '晋阳之战', '伊阙之战', '华阳之战', '长平之战', '邯郸之战', '宜阳之战', '番吾之战', '郢之战', '昊京', '丰镐遗址', '雒邑', '曲阜', '朝歌', '楚丘', '临淄齐国故城', '陶丘', '商丘', '新郑', '楚纪南故城', '雍城', '绛', '溧阳', '邗沟', '黄池', '汉中', '葭萌', '成都', '济西', '鄢城', '野王', '上党', '井陉故关', '大梁', '蓟', '辽东', '会稽山', '琅琊台', '芝罘岛', '沙丘平台', '肥累县', '肥累城', '晋州市', '和顺县', '上蔡县', '胡阳', '函谷关', '井陉关', '平舆县', '城父镇', '城父县', '方城县', '孤竹国', '令支', '蓟城', '汉函谷关', '崤山', '滑国', '鄄城县', '范县', '伯举', '宝丰县', '父城县', '赵王城', '邯郸市', '平原津', '会稽山大禹陵', '秦函谷关', '轘辕关', '叶县']
HEAD={'User-Agent':'AtlasHistoricalVerification/1.0 (research; local static educational atlas)'}
def fetch(name):
 url='https://zh.wikipedia.org/wiki/'+name
 try:
  r=requests.get(url,headers=HEAD,timeout=35);r.raise_for_status(); s=BeautifulSoup(r.text,'html.parser')
  info=s.select_one('.infobox'); geo=s.select_one('.geo'); q=None
  for a in s.select('a[href]'):
   m=re.search(r'wikidata.org/wiki/(?:Special:EntityPage/)?(Q\d+)',a['href'])
   if m:q=m[1];break
  item={'name':name,'url':url,'retrieved':'2026-10-16','infobox':info.get_text(' ',strip=True)[:900] if info else None,'pageCoordinate':geo.get_text(' ',strip=True) if geo else None,'wikidata':q,'P625':[]}
  if q:
   d=requests.get('https://www.wikidata.org/wiki/Special:EntityData/'+q+'.json',headers=HEAD,timeout=35).json()['entities'][q]
   item['P625']=[{'value':c.get('mainsnak',{}).get('datavalue',{}).get('value'),'rank':c.get('rank'),'references':c.get('references',[])} for c in d.get('claims',{}).get('P625',[])]
  return item
 except Exception as e:return {'name':name,'url':url,'retrieved':'2026-10-16','error':str(e)}
if __name__=='__main__':
 with ThreadPoolExecutor(max_workers=4) as pool:data=list(pool.map(fetch,NAMES))
 OUT.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
 for x in data:print(x['name'],x.get('wikidata'),x.get('pageCoordinate'), [p.get('value') for p in x.get('P625',[])],x.get('error',''))
