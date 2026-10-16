import json, urllib.request, urllib.parse, concurrent.futures
from pathlib import Path
root=Path('scripts/geo/warring-states')
titles=['Anyang',"Wu\'an",'She County, Hebei','Licheng County','Changzhi','Changzi County','Gaoping','Qinyang','Luoyang','Mianchi County',"Xin\'an County",'Yuncheng','Linfen','Quwo County','Xinjiang County','Qinyuan County','Qin County','Xi County, Shanxi','Yuncheng','Yongji, Shanxi','Yu County, Hebei','Beijing']
u='https://en.wikipedia.org/w/api.php?'+urllib.parse.urlencode(dict(action='query',format='json',prop='coordinates',colimit='max',redirects=1,titles='|'.join(titles)))
try:
 data=json.load(urllib.request.urlopen(urllib.request.Request(u,headers={"User-Agent":"AtlasHistorySourceAudit/1.0 (educational mapping)"}),timeout=45))
 (root/'extra-control-coordinates-G14.json').write_text(json.dumps({'url':u,'data':data},ensure_ascii=False,indent=2))
 for p in data.get('query',{}).get('pages',{}).values():print(p['title'],p.get('coordinates'))
except Exception as e:print('ERROR',repr(e))
