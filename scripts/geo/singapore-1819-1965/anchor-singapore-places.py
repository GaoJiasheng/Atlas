"""Cache named-place Wikidata P625 with explicit entity identity; no map geometry."""
import requests,re,json,pathlib,hashlib
from urllib.parse import quote
p=pathlib.Path(__file__).resolve().parent
h={'User-Agent':'TimeSceneHistoricalResearch/1.0 (Atlas local educational source audit; research@example.org)'}
titles=['Little India, Singapore','Tekka Centre','Telok Ayer Street','The Adelphi','Sembawang','North Canal Road','Raffles Place','North Bridge Road','Long Ya Men','Fort Canning Hill','The Fullerton Hotel Singapore',"Raffles's Landing Site",'Singapore','Former City Hall, Singapore','Kampong Glam','Chinatown, Singapore',"Saint John's Island",'The Arts House','Singapore River','Boat Quay','Telok Blangah','Istana Kampong Glam','Raffles City Singapore','Keppel Harbour','Bras Basah','Serangoon Road','Telok Ayer','Alexandra, Singapore','Outram Prison','Kreta Ayer','Sembawang Naval Base','Sultan Mosque','Chinese High School, Singapore','Istana, Singapore','Adelphi Hotel','Geylang Serai','Kallang','Downtown Core','Empress Place Building','Labrador Nature Reserve']
results=[]
for t in titles:
 try:
  slug=quote(t.replace(' ','_'),safe="_,'")
  htmlpath=p/'raw'/f'anchor-html-{slug}.html'
  if htmlpath.exists(): html=htmlpath.read_text()
  else:
   r=requests.get('https://en.wikipedia.org/wiki/'+slug,headers=h,timeout=35);r.raise_for_status();html=r.text;htmlpath.write_text(html)
  qids=list(set(re.findall(r'(?:wikidata.org/wiki/|Special:EntityPage/)(Q\d+)',html)))
  if len(qids)!=1: raise ValueError(f'Identity ambiguous: {qids}')
  qid=qids[0];f=p/'raw'/f'anchor-{qid}.json'
  if f.exists(): j=json.loads(f.read_text())
  else:
   r=requests.get(f'https://www.wikidata.org/wiki/Special:EntityData/{qid}.json',headers=h,timeout=35);r.raise_for_status();j=r.json();f.write_text(r.text)
  e=j['entities'][qid];claims=e.get('claims',{}).get('P625',[])
  pts=[{'value':c['mainsnak'].get('datavalue',{}).get('value'),'rank':c['rank'],'qualifiers':c.get('qualifiers',{}),'references':c.get('references',[])} for c in claims]
  geo=e.get('claims',{}).get('P5140',[])
  record={'qid':qid,'title':t,'label':e.get('labels',{}).get('en',{}).get('value'),'revision':e['lastrevid'],'coordinates':pts,'geographicCentre':geo,'sha256':hashlib.sha256(f.read_bytes()).hexdigest()}
  results.append(record);print(qid,t,[(x['value'],x['rank']) for x in pts],flush=True)
 except Exception as ex: print('FAIL',t,str(ex),flush=True);results.append({'title':t,'error':str(ex)})
 (p/'anchor-singapore-places.json').write_text(json.dumps(results,indent=2)+'\n')
