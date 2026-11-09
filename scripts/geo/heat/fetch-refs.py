"""Commons reference photographs for offline comparison only; never runtime textures."""
import urllib.request,re,html,json,pathlib,time,subprocess
root=pathlib.Path(__file__).parent/'refs';root.mkdir(exist_ok=True)
names=["Gravesande's ring and ball.png",'Gravesande ring.png','Round bottom flask 500ml.jpg','Round bottom flask 1.jpg','Retort stand with a clamp.jpg','Clamp holder with utility clamp.jpg','Boss Head Right Angle.jpg','Laboratory support stand.jpg','Laboratory hot plate.JPG','Laboratory thermometer-04.jpg','Glass_100ml_beaker.jpg','Schott_Duran_Beaker_low_form_100ml.jpg','Hot_plate_with_magnetic_stirrer_01.jpg','Thermometer.JPG','Spoons.jpg','Brass_teaspoon.jpg','Lab thermometer.JPG','Hot plate.jpg','Hot plate2.jpg']
if (root/'manifest.json').exists(): old=json.loads((root/'manifest.json').read_text())
else: old=[]
for name in names:
 if any(i['file']==name for i in old): continue
 try:
  url='https://commons.wikimedia.org/wiki/File:'+urllib.parse.quote(name.replace(' ','_'))
  req=urllib.request.Request(url,headers={'User-Agent':'Atlas educational geometry study'})
  s=subprocess.check_output(['curl','-sfL','--retry','2',url]).decode()
  hits=re.findall(r'https://upload.wikimedia.org/wikipedia/commons/[^"<>? ]+',s)
  img=html.unescape(next(i for i in hits if '/thumb/' not in i))
  path=root/name.replace(' ','_');subprocess.run(['curl','-sfL','--retry','2','https://commons.wikimedia.org/wiki/Special:Redirect/file/'+urllib.parse.quote(name.replace(' ','_'))+'?width=900','-o',str(path)],check=True)
  old.append({'file':name,'url':url,'image':img,'local':str(path),'licenseNotes':re.findall(r'title="(Creative Commons[^"]+)',s)[:3]})
  print(name,path.stat().st_size)
 except Exception as e: print(name,e)
(root/'manifest.json').write_text(json.dumps(old,indent=2))

# Additional copyrighted primary-source apparatus photos: offline study only.
for name,url in [('eisco-ball-ring.jpg','https://www.eiscolabs.com/cdn/shop/files/xesxw3otezfarkhku9cj_1163x700.jpg?v=1780341277'),('purdue-liquid.jpg','https://www.physics.purdue.edu/demos/images/3A-04_sized.jpg')]:
 if not (root/name).exists():
  try: subprocess.run(['curl','-sfL','--retry','2',url,'-o',str(root/name)],check=True)
  except Exception as e: print('WARN',name,e)
