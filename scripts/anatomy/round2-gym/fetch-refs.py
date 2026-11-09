from pathlib import Path
import urllib.request,urllib.parse,json,time
root=Path('scripts/anatomy/round2-gym/refs');root.mkdir(exist_ok=True)
for name in ['Lat Pull down Machine.jpg','PulldownMachineExercise.JPG','Diverging Lat Pulldown Machine.jpg']:
 url='https://commons.wikimedia.org/w/api.php?'+urllib.parse.urlencode({'action':'query','format':'json','titles':'File:'+name,'prop':'imageinfo','iiprop':'url|extmetadata'})
 try:
  data=json.load(urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'Atlas anatomy research/1.0'}),timeout=30));page=next(iter(data['query']['pages'].values()));info=page['imageinfo'][0]
  (root/(name+'.json')).write_text(json.dumps(info,indent=2));img=urllib.request.urlopen(urllib.request.Request(info['url'],headers={'User-Agent':'Atlas anatomy research/1.0'}),timeout=30).read();(root/name).write_bytes(img);print(name,len(img))
 except Exception as e:print(name,str(e))
 time.sleep(1)
