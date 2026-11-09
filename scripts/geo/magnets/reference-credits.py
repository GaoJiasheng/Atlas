"""Fetch Commons attribution once; images never enter the runtime bundle."""
import urllib.request,urllib.parse,json,re,html
from pathlib import Path
root=Path('scripts/geo/magnets');names=[p.name for p in (root/'refs').iterdir() if not p.name.startswith('.')]
u='https://commons.wikimedia.org/w/api.php?'+urllib.parse.urlencode({'action':'query','format':'json','titles':'|'.join('File:'+n for n in names),'prop':'imageinfo','iiprop':'extmetadata'})
j=json.load(urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'AtlasEducation/1.0 original 3D apparatus study'})))
(root/'evidence'/'reference-metadata.json').write_text(json.dumps(j,indent=2))
clean=lambda x:html.unescape(re.sub('<[^>]*>','',x))
credits={}
for p in j['query']['pages'].values():
 m=p.get('imageinfo',[{}])[0].get('extmetadata',{});name=p['title'][5:]
 credits[name]={'author':clean(m.get('Artist',{}).get('value','Unknown')),'license':m.get('LicenseShortName',{}).get('value','Unknown'),'licenseUrl':m.get('LicenseUrl',{}).get('value',''),'url':'https://commons.wikimedia.org/wiki/File:'+urllib.parse.quote(name.replace(' ','_'))}
(root/'evidence'/'reference-credits.json').write_text(json.dumps(credits,indent=2))
text='# Comparison photo credits\n\nThese sheets compare original Atlas geometry with separately credited photos. Photo crops and resized copies retain their original listed licences. Atlas comparison layout is CC BY-SA 4.0 (https://creativecommons.org/licenses/by-sa/4.0/). No photo is a runtime texture.\n\n'
for n,c in credits.items():text+=f"- **{n}** — {c['author']}; {c['license']}. [Original]({c['url']})"+(f" · [Licence]({c['licenseUrl']})" if c['licenseUrl'] else ' · Public-domain release by author')+('. Changes: resized and detail cropped.\n' if n=='Pince à 3 doigts.jpg' else '. Changes: resized.\n')
(root/'comparisons'/'CREDITS.md').write_text(text)
print(text)
