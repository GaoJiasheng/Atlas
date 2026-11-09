import urllib.request, concurrent.futures, pathlib, hashlib
root=pathlib.Path(__file__).parent
url='https://openresearch-repository.anu.edu.au/server/api/core/bitstreams/d16267c8-37de-41e6-8471-b7f708b600a6/content'
size=11068520; chunk=100000
out=root/'raw/resume-source-anu1958.jpg'
parts=root/'raw/resume-source-anu1958-parts';parts.mkdir(exist_ok=True)
def get(start):
 end=min(start+chunk,size)-1
 target=parts/str(start)
 if target.exists() and target.stat().st_size==end-start+1:return
 for attempt in range(2):
  try:
   req=urllib.request.Request(url,headers={'Range':f'bytes={start}-{end}'})
   with urllib.request.urlopen(req,timeout=15) as r:b=r.read(end-start+1)
   if len(b)!=end-start+1:raise Exception(f'length {len(b)}')
   target.write_bytes(b);print(start,len(b),flush=True);return
  except Exception as e:print('retry',start,attempt,str(e),flush=True)
 pieces=[]
 for s in range(start,end+1,10000):
  e=min(s+9999,end)
  req=urllib.request.Request(url+f'?range={s}',headers={'Range':f'bytes={s}-{e}'})
  with urllib.request.urlopen(req,timeout=15) as r:b=r.read(e-s+1)
  if len(b)!=e-s+1:raise Exception(f'failed subrange {s}')
  pieces.append(b)
 target.write_bytes(b''.join(pieces));print('subranges',start,flush=True)
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as ex:list(ex.map(get,range(0,size,chunk)))
out.write_bytes(b''.join((parts/str(s)).read_bytes() for s in range(0,size,chunk)))
assert hashlib.md5(out.read_bytes()).hexdigest()=='753796180f2c7d659280ec601a5602bb'
print('COMPLETE',out,out.stat().st_size,'MD5 verified',flush=True)
