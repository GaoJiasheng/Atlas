"""Supplementary source receipts only; no event changes."""
import requests,json,re,hashlib
from pathlib import Path
from urllib.parse import quote
D=Path(__file__).resolve().parent;C=D/'raw'/'anchor-regional';C.mkdir(parents=True,exist_ok=True)
h={'User-Agent':'TimeSceneHistoricalResearch/1.0 (Atlas local educational source audit; research@example.org)'}
def get(url,path):
 if path.exists():return path.read_text()
 r=requests.get(url,headers=h,timeout=40);print(r.status_code,url,flush=True)
 if r.status_code==429:raise SystemExit('429, no retry')
 r.raise_for_status();path.write_text(r.text);return r.text
rows=[]
for key,title in [('sungai-siput','Sungai_Siput'),('stadium-merdeka','Independence_Stadium_(Malaysia)'),('penyengat','Penyengat_Island')]:
 url='https://en.wikipedia.org/wiki/'+quote(title,safe='_,')
 html=get(url,C/(key+'.html'))
 ids=re.findall(r'(?:wikidata.org/wiki/|Special:EntityPage/)(Q\d+)',html)
 assert ids,key
 qid=ids[0];data=json.loads(get('https://www.wikidata.org/wiki/Special:EntityData/'+qid+'.json',C/(qid+'.json')));entity=next(iter(data['entities'].values()))
 rows.append({'id':key,'qid':entity['id'],'revision':entity['lastrevid'],'modified':entity.get('modified'),'label':entity['labels'].get('en',{}).get('value'),'description':entity.get('descriptions',{}).get('en',{}).get('value'),'coordinates':entity.get('claims',{}).get('P625',[]),'receipt':'raw/anchor-regional/'+qid+'.json','sha256':hashlib.sha256((C/(qid+'.json')).read_bytes()).hexdigest()})
 print(key,entity['id'],json.dumps(rows[-1]['coordinates']),flush=True)
(D/'work'/'anchor-regional-extra-candidates.json').write_text(json.dumps(rows,indent=2)+'\n')
url='https://www.onemap.gov.sg/api/common/elastic/search?searchVal=The%20Adelphi&returnGeom=Y&getAddrDetails=Y&pageNum=1'
try:
 text=get(url,C/'onemap-adelphi.json');print('ADELPHI',text[:1200],flush=True)
except Exception as ex:print('ADELPHI ERROR',str(ex),flush=True)
