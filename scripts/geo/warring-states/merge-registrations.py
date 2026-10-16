"""Merge owned registration fragments and preserve original-file audit records."""
import pathlib,json,hashlib,shutil,re
p=pathlib.Path(__file__).parent;m=json.load(open(p/'sources.json'));extra=json.load(open(p/'extra-georef-manifest.json'));r=json.load(open(p/'raster-manifest.json'));m['datasets'].update(r.get('datasets',{}));m['raster'].update(r.get('raster',{}));log=json.load(open(p/'raw/fetch-log.json'))
for item in extra['downloads']:
 src=p/item['file'];eid=item['id'];v=log[eid];ext=src.suffix;f=p/'raw'/f'{eid}-original{ext}'
 if ext=='.png' and eid=='G14':f=p/'raw'/'G14-render1280.png'
 shutil.copyfile(src,f)
 record={'file':f.name,'url':item['url'],'sha256':item['sha256'],'bytes':item['bytes'],'width':item['actualWidth'],'height':item['actualHeight']}
 if ext=='.png' and eid=='G14':v['registrationRender']=record
 else:v['originalDownload']=record
 (p/'raw'/f'{eid}-metadata.json').write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
(p/'raw/fetch-log.json').write_text(json.dumps(log,ensure_ascii=False,indent=2)+'\n')
for eid,src in extra['raster'].items():
 m['raster'][eid]=src
 m['raster'][eid]['palette']={'#ffffff':'_land','#c6ecff':'_sea'}
 m['raster'][eid]['land']=['_land'];m['raster'][eid]['sea']=['_sea'];m['raster'][eid]['tolerance']=20
 if src.get('registrationInput'):
  ds=eid+'-registration';inp=src['registrationInput'];m['datasets'][ds]={**m['datasets'][eid],'file':inp.removeprefix('raw/'),'role':'Registration input with source city symbols; reference only'};m['raster'][eid]['dataset']=ds
 fit=p/'check'/f'extra-{eid}-fit.json'
 if fit.exists():shutil.copyfile(fit,p/'work'/f'raster-{eid}-fit.json')
# Register G6 from the full vector original, using the unchanged G3 base.
m['datasets']['G6-vector']={**m['datasets']['G6'],'file':'G6-original.svg','url':log['G6']['originalDownload']['url'],'role':'Original250BCEvector map; same cartographic base asG3'}
m['svg']['G6']={**m['svg']['G5'],'dataset':'G6-vector','controlPoints':[],'controlPointsFrom':'G3'}
# G12 is a translated derivative on exactly the same G11 cartographic base.
if 'G11' in m['raster']:
 cp=m['raster']['G11']['controlPoints'];m['raster']['G12']={**m['raster']['G11'],'dataset':'G12','controlPoints':cp,'palette':{'#ffffff':'_land','#c6ecff':'_sea'},'land':['_land'],'sea':['_sea']}
(p/'sources.json').write_text(json.dumps(m,ensure_ascii=False,indent=2)+'\n')
