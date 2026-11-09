"""Development-only Commons photos; attribution in HARDWARE-REBUILD.md."""
import hashlib,pathlib,urllib.request,urllib.parse,concurrent.futures,subprocess
names=['Sidepull caliper brakes.jpg','Shimano 600 tricolor Brakes BR-6400.jpg','Retort stand with a clamp.jpg','Laboratory support stand.jpg','DM bottom old.jpg','Semelle de chaussure pointure 47.jpg','MephistoSchuhsohle.JPG','Nike Running Shoe Dissected Front.jpg','Nike Running Shoe Dissected Rear.jpg','Paperball 2.jpeg','Paperball.png']
out=pathlib.Path('scripts/geo/forces/refs/hardware');out.mkdir(parents=True,exist_ok=True)
def fetch(name):
 dest=out/name.replace(' ','_')
 if dest.exists():return f'{name}: cached'
 file=name.replace(' ','_');h=hashlib.md5(file.encode()).hexdigest();url=f'https://upload.wikimedia.org/wikipedia/commons/thumb/{h[0]}/{h[:2]}/{urllib.parse.quote(file)}/960px-{urllib.parse.quote(file)}'
 url=url.replace('upload.wikimedia.org','thumb.wikimedia.org')
 result=subprocess.run(['curl','-L','--fail','--retry','2','--max-time','40','-A','AtlasEducationalReference/1.0',url,'-o',str(dest)],capture_output=True)
 if result.returncode:return f'WARN {name}: download failed ({result.returncode})'
 return f'{name}: {dest.stat().st_size} bytes'

with concurrent.futures.ThreadPoolExecutor(4) as pool:
 for r in pool.map(fetch,names):print(r,flush=True)
