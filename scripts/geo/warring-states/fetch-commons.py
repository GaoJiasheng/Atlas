"""Resolve Commons licence metadata, then download immutable source files.
Run: python3 scripts/geo/warring-states/fetch-commons.py
"""
import concurrent.futures, hashlib, json, pathlib, re, time, urllib.parse, urllib.request
ROOT=pathlib.Path(__file__).parent
spec=pathlib.Path('docs/27-warring-states-content-spec.md').read_text()
rows=re.findall(r'^\| G(\d+) \| `([^`]+)` \|',spec,re.M)
UA='AtlasHistorySourceAudit/1.0 (educational mapping)'
def get(url):
    for attempt in range(4):
        try:
            with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':UA}),timeout=180) as r:return r.read()
        except Exception:
            if attempt==3:raise
            time.sleep(2*(attempt+1))
def fetch(row):
    n,title=row; id='G'+n
    previous=ROOT/'raw'/f'{id}-metadata.json'
    if previous.exists():
        cached=json.loads(previous.read_text()); local=ROOT/'raw'/cached['file']
        if local.exists() and hashlib.sha256(local.read_bytes()).hexdigest()==cached['sha256']:
            print(id,'verified cache',cached['file'],flush=True); return id,cached
    api='https://commons.wikimedia.org/w/api.php?'+urllib.parse.urlencode({'action':'query','format':'json','prop':'imageinfo','iiprop':'url|extmetadata|size|sha1','iiurlwidth':'960','titles':'File:'+title})
    body=json.loads(get(api)); page=next(iter(body['query']['pages'].values())); ii=page['imageinfo'][0]; meta=ii['extmetadata']
    ext=title.rsplit('.',1)[-1].lower(); file=f'{id}.{ext}'; target=ROOT/'raw'/file
    fetched_url=ii['url']
    if target.exists():
        data=target.read_bytes()
        previous=ROOT/'raw'/f'{id}-metadata.json'
        if previous.exists(): fetched_url=json.loads(previous.read_text()).get('url',ii['url'])
    else:
        try:data=get(ii['url'])
        except Exception:
            # Commons thumbnails are published map renders; preserve the SVG origin in metadata.
            if ext=='svg':
                ext='png'; file=f'{id}.png'; target=ROOT/'raw'/file
            fetched_url=ii.get('thumburl',ii['url'])
            if fetched_url==ii['url'] or ii['width']<960:
                api_small=api.replace('iiurlwidth=960','iiurlwidth=330')
                small=next(iter(json.loads(get(api_small))['query']['pages'].values()))['imageinfo'][0]
                fetched_url=small.get('thumburl',ii['url'])
            data=get(fetched_url)
    target.write_bytes(data)
    result={'downloadKind':'original' if fetched_url==ii['url'] else 'Commons published thumbnail/render (original rate limited)', 'file':file,'title':title,'url':fetched_url,'originalUrl':ii['url'],'page':ii['descriptionurl'],'author':meta.get('Artist',{}).get('value',''),'license':meta.get('LicenseShortName',{}).get('value',''),'licenseUrl':meta.get('LicenseUrl',{}).get('value',''),'sha256':hashlib.sha256(data).hexdigest(),'bytes':len(data),'width':ii['width'],'height':ii['height'],'fetched':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'commonsApi':api,'commonsMetadata':meta}
    (ROOT/'raw'/f'{id}-metadata.json').write_text(json.dumps(result,ensure_ascii=False,indent=2))
    print(id,title,len(data),result['license'],flush=True); return id,result
log=json.loads((ROOT/'raw/fetch-log.json').read_text()) if (ROOT/'raw/fetch-log.json').exists() else {}; errors={}
with concurrent.futures.ThreadPoolExecutor(max_workers=1) as pool:
    futures={pool.submit(fetch,r):r for r in rows}
    for future in concurrent.futures.as_completed(futures):
        try:
            key,value=future.result();log[key]=value
        except Exception as e:errors['G'+futures[future][0]]=str(e);print('ERROR',futures[future],e,flush=True)
        (ROOT/'raw'/'fetch-log.json').write_text(json.dumps(dict(sorted(log.items(),key=lambda kv:int(kv[0][1:]) if kv[0].startswith('G') else 1000)),ensure_ascii=False,indent=2))
if errors:(ROOT/'raw'/'fetch-errors.json').write_text(json.dumps(errors,indent=2));raise SystemExit(1)
if (ROOT/'raw'/'fetch-errors.json').exists():(ROOT/'raw'/'fetch-errors.json').unlink()
datasets={key:{'ref':key,'title':v['title'],'url':v['url'],'file':v['file'],'page':v['page'],'author':re.sub('<[^>]*>','',v['author']),'license':v['license'],'role':'Published map for georeferencing, tracing or independent comparison; see SOURCES-GEO.md'} for key,v in log.items() if key.startswith('G')}
manifest=ROOT/'sources.json'
m=json.loads(manifest.read_text()) if manifest.exists() else {'datasets':{},'keyframes':[],'pipeline':{'plannedKeyframes':11,'budgetMB':1.2,'focus':[[100,20,125,44]],'coast':{'enabled':False,'land':'public/geo/warring-states-region.json','detailBox':None,'detailLand':None,'worldBox':[100,20,125,44]},'shots':'scripts/geo/warring-states/check'}}
m['datasets'].update(datasets);manifest.write_text(json.dumps(m,ensure_ascii=False,indent=2)+'\n')
