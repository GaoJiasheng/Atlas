"""Build-time reference fetch. No runtime network. Rights are recorded per item.
Uses both reference manifests and downloads into ignored refs/. Existing
originals are retained; --refresh re-fetches. NASA model source is vendored.
"""
import json,pathlib,urllib.request,hashlib,sys
ROOT=pathlib.Path(__file__).parent
out=ROOT/'refs';out.mkdir(exist_ok=True)
items=json.loads((ROOT/'references.json').read_text())+json.loads((ROOT/'round2-references.json').read_text())
for item in items:
    if 'file' not in item:
        continue # Primary dimensional references are linked in the report.
    name=pathlib.Path(item['file']).name
    if item.get('id')=='NASA-LM-mesh':
        continue # The licensed source GLB is vendored beside this script.
    if (out/name).exists() and '--refresh' not in sys.argv:
        continue
    try:
        req=urllib.request.Request(item.get('imageURL',item['url']),headers={'User-Agent':'Atlas-reference-study/1.0'})
        with urllib.request.urlopen(req,timeout=25) as response:
            content=response.read()
        (out/(name+'.part')).write_bytes(content)
        (out/(name+'.part')).replace(out/name)
        print(name,len(content),hashlib.sha256(content).hexdigest())
    except Exception as exc:
        print('WARN',name,str(exc))
