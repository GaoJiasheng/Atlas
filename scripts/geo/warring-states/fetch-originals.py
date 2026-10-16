"""Recover canonical original-file links, retaining prior renders and audit trail."""
import pathlib,json,urllib.request,urllib.parse,hashlib,time
p=pathlib.Path(__file__).parent;log=json.load(open(p/'raw/fetch-log.json'))
for k in ['G6','G8','G9','G11','G12','G18']:
 v=log[k];u=v.get('originalUrl',v['url']).split('?')[0];ext=v['title'].rsplit('.',1)[1].lower();f=p/'raw'/f'{k}-original.{ext}'
 try:
  if not f.exists():
   with urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'AtlasHistorySourceAudit/1.0 (educational mapping)'}),timeout=120) as r:data=r.read()
   f.write_bytes(data)
  data=f.read_bytes();v['originalDownload']={'file':f.name,'url':u,'sha256':hashlib.sha256(data).hexdigest(),'bytes':len(data),'fetched':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime())};print(k,'original',len(data),flush=True)
 except Exception as e:print(k,'unavailable',e,flush=True);v['originalDownloadError']=str(e)
 (p/'raw/fetch-log.json').write_text(json.dumps(log,ensure_ascii=False,indent=2)+'\n')
