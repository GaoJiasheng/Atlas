"""Read-only Wikimedia place-identity / P625 receipts; no event writes or API search.
Fetch each HTML/EntityData URL once, cache under raw/, and stop on rate limiting.
"""
import json, re, time
from pathlib import Path
from urllib.parse import quote
import requests
DIR=Path(__file__).resolve().parent
CACHE=DIR/'raw'/'anchor-regional'
CACHE.mkdir(parents=True,exist_ok=True)
UA='TimeSceneHistoricalResearch/1.0 (Atlas local educational source audit; research@example.org)'
session=requests.Session();session.headers.update({'User-Agent':UA})
places=[('johor-lama','Johor_Lama'),('daik','Daik'),('george-town','George_Town,_Penang'),('malacca','Malacca_City'),('naning','Naning'),('victoria-hong-kong','Victoria,_Hong_Kong'),('port-said','Port_Said'),('pangkor','Pangkor_Island'),('pasir-salak','Pasir_Salak'),('kuala-lumpur','Kuala_Lumpur'),('istana-besar','Istana_Besar'),('victoria-labuan','Victoria,_Labuan'),('bangkok','Bangkok'),('lumut','Lumut,_Perak'),('alor-setar','Alor_Setar'),('bahau','Bahau'),('endau','Endau'),('bandar-seri-begawan','Bandar_Seri_Begawan'),('kuching','Kuching'),('jakarta','Jakarta'),('london','London')]

def get(url,file):
 if file.exists():return file.read_text()
 response=session.get(url,timeout=45)
 print(response.status_code,url,flush=True)
 if response.status_code==429:raise SystemExit('Rate-limited; no retry')
 response.raise_for_status();file.write_text(response.text)
 return response.text

results=[]
for key,title in places:
 try:
  url='https://en.wikipedia.org/wiki/'+quote(title,safe=',_')
  html=get(url,CACHE/(key+'.html'))
  ids=re.findall(r'(?:wikidata.org/wiki/|Special:EntityPage/)(Q\d+)',html)
  if not ids:raise ValueError('No main Wikidata identity link')
  qid=ids[0]
  data=json.loads(get('https://www.wikidata.org/wiki/Special:EntityData/'+qid+'.json',CACHE/(qid+'.json')))
  entity=next(iter(data['entities'].values()))
  coord=[{'id':c['id'],'rank':c['rank'],'value':c['mainsnak'].get('datavalue',{}).get('value'),'references':c.get('references',[]),'qualifiers':c.get('qualifiers',{})} for c in entity.get('claims',{}).get('P625',[])]
  row={'id':key,'wikipediaTitle':title,'discoveryUrl':url,'qid':entity['id'],'requestedQid':qid,'lastrevid':entity.get('lastrevid'),'modified':entity.get('modified'),'label':entity.get('labels',{}).get('en',{}).get('value'),'description':entity.get('descriptions',{}).get('en',{}).get('value'),'coordinates':coord}
  print(json.dumps({k:row[k] for k in ('id','qid','label','description','coordinates')}),flush=True)
  results.append(row)
 except Exception as exc:
  print(key,str(exc),flush=True);results.append({'id':key,'wikipediaTitle':title,'error':str(exc)})
 (DIR/'work'/'anchor-regional-candidates.json').write_text(json.dumps(results,ensure_ascii=False,indent=2)+'\n')
 time.sleep(.2)
