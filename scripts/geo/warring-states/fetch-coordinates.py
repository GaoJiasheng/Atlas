"""Build-time Wikipedia coordinate audit; no runtime requests."""
import urllib.request,urllib.parse,json,pathlib
p=pathlib.Path(__file__).parent
names=['Fengxiang District','Linzi District','Qufu','Ji (state)','Shangqiu','Ying (Chu)','Shanghai','Tianjin','Wuhan','Nanjing','Xinzheng','Jinan','Suzhou',"Xi'an",'Hangzhou']
q=urllib.parse.urlencode({'action':'query','format':'json','prop':'coordinates','colimit':'max','redirects':'1','titles':'|'.join(names)})
u='https://en.wikipedia.org/w/api.php?'+q
req=urllib.request.Request(u,headers={'User-Agent':'AtlasHistorySourceAudit/1.0 (educational mapping)'})
with urllib.request.urlopen(req,timeout=90) as r:data=json.load(r)
(p/'coordinates-wikipedia.json').write_text(json.dumps({'url':u,'data':data},ensure_ascii=False,indent=2)+'\n')
for row in data['query']['pages'].values():print(row.get('title'),row.get('coordinates'))
