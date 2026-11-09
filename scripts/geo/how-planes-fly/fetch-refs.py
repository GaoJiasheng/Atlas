"""Development-only Commons references; provenance in refs/manifest.json."""
import json, pathlib, urllib.request, urllib.parse
sets={'how-planes-fly':[
('front','Airbus A330 Front View.jpg'),
('nose','G-VGEM Airbus A330 Virgin Atlantic Nose (9319525067).jpg'),
('profile','PK-GPA Airbus A330 Garuda Indonesia Nose (7590247646).jpg'),
('airframe','Aeroflot Airbus A330 Kustov.jpg'),
('drawing','Airbus A330-300 v1.0.png'),
('engine-photo','National Air and Space Museum - Washington DC - General Electric CF6.jpg'),
('engine-detail','National Air and Space Museum - Washington DC - General Electric CF6 - Compressor and Combustor Cut Out.jpg'),
('engine','CF6-6 engine cutaway.jpg'),
('engine-section','Overall layout of General Electric CF6.svg')],
'aircon':[
('board','Close-up view of a circuit board being held near an air conditioning unit in a contemporary indoor environment.jpg'),
('power','Dornbirn-Inverter KACO Powador 25000xi-M-circuit board-02ASD.jpg'),
('caps','Dornbirn-Inverter KACO Powador 25000xi-M-circuit board-09ASD.jpg')]}
for slug,refs in sets.items():
 root=pathlib.Path('scripts/geo')/slug/'refs';root.mkdir(exist_ok=True);manifest=[]
 for name,title in refs:
  url='https://commons.wikimedia.org/w/api.php?action=query&titles='+urllib.parse.quote('File:'+title)+'&prop=imageinfo&iiprop=url%7Cextmetadata&iiurlwidth=1000&format=json'
  req=lambda u: urllib.request.Request(u,headers={'User-Agent':'AtlasStudy/1.0 (educational modelling reference)'})
  data=json.load(urllib.request.urlopen(req(url))); info=next(iter(data['query']['pages'].values()))['imageinfo'][0]
  imageurl=info.get('thumburl',info['url']).split('?')[0]; path=root/(name+'.jpg')
  if not path.exists(): path.write_bytes(urllib.request.urlopen(req(imageurl)).read())
  meta=info['extmetadata'];manifest.append(dict(id=name,title=title,page=info['descriptionurl'],image=imageurl,author=meta.get('Artist',{}).get('value'),license=meta.get('LicenseShortName',{}).get('value'),license_url=meta.get('LicenseUrl',{}).get('value')))
  print(slug,name,path.stat().st_size)
 (root/'manifest.json').write_text(json.dumps(manifest,indent=2))
