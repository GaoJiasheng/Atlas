"""Final exact-input verification, source and proposed-patch snapshots separated."""
from pathlib import Path
import sys,subprocess,time,json,hashlib
root=Path(__file__).resolve().parents[3];log=root/'scripts/anatomy/rebuild-evidence/gate-logs/round2';log.mkdir(parents=True,exist_ok=True)
mode=sys.argv[1]if len(sys.argv)>1 else'live';snapshot=Path('/private/tmp/atlas-muscles-round2-'+('patch-'if mode=='patch'else'')+'gates')
subprocess.run(['python3',str(root/'scripts/anatomy/rebuild-evidence/prepare-gates.py'),str(snapshot)],cwd=root,check=True)
if mode=='patch':subprocess.run(['patch','--batch','-p1','-i',str(root/'scripts/anatomy/round2-acceptance.patch')],cwd=snapshot,check=True)
def hashes(base):
 files=[]
 for directory in ['src','tests']:
  files.extend(p for p in(base/directory).rglob('*')if p.is_file()and p.suffix in['.ts','.tsx','.json','.mdx','.jsonl'])
 files.extend((base/'public/models').glob('muscles-*.glb'));files.extend((base/'public/illustrations').glob('muscles-*.webp'))
 files.extend(base/f'public/illustrations/exercises/{n}.webp'for n in['barbell-bench-press','heel-walk','cable-hip-adduction'])
 files.extend(base/n for n in['package.json','pnpm-lock.yaml','astro.config.mjs','tsconfig.json','vitest.config.ts'])
 return{str(p.relative_to(base)):hashlib.sha256(p.read_bytes()).hexdigest()for p in sorted(files)}
record={'mode':mode,'snapshot':str(snapshot),'source':str(root),'date':'2026-11-09','sourceInputSha256':hashes(root),'executingInputSha256':hashes(snapshot),'runs':[],'limits':'No browser, desktop, Chromium or git writes. Patch snapshot differs only by round2-acceptance.patch. Same installed dependency versions, writable caches.'}
if mode=='live'and record['sourceInputSha256']!=record['executingInputSha256']:raise SystemExit('Snapshot mismatch')
commands=[['pnpm','check'],['pnpm','validate'],['pnpm','build'],['pnpm','run','test','--maxWorkers=2','--testTimeout=30000'],['node_modules/.bin/tsx','scripts/js-budget.ts','--check','sample-space','muscles-core','muscles-legs']]
if mode=='patch':commands.extend([['node_modules/.bin/tsx','scripts/anatomy/round2-motion/verify.ts','--actual'],['node_modules/.bin/vitest','run','--config','scripts/anatomy/round2-motion/vitest.config.ts']])
for i,cmd in enumerate(commands):
 name=('patch-'if mode=='patch'else'final-')+str(i+1);path=log/(name+'.log');start=time.time()
 with path.open('w')as f:code=subprocess.run(cmd,cwd=snapshot,stdout=f,stderr=subprocess.STDOUT).returncode
 row={'command':cmd,'exitCode':code,'seconds':round(time.time()-start,2),'log':str(path.relative_to(root))};record['runs'].append(row)
 (log/(mode+'-run.json')).write_text(json.dumps(record,indent=2)+'\n');print(mode,name,code,flush=True)
 if code:raise SystemExit(code)
if hashes(root)!=record['sourceInputSha256']:raise SystemExit('Source inputs changed during gates')
for p in list((root/'public/models').glob('muscles-*.glb'))+list((root/'public/illustrations').glob('muscles-*.webp')):
 q=snapshot/'dist'/p.relative_to(root/'public')
 if hashlib.sha256(q.read_bytes()).digest()!=hashlib.sha256(p.read_bytes()).digest():raise SystemExit('Built asset differs: '+str(p))
summary={}
file=log/'final-gates.json'
if file.exists():summary=json.loads(file.read_text())
summary[mode]={'status':'PASS','runs':len(record['runs']),'record':str((log/(mode+'-run.json')).relative_to(root))}
file.write_text(json.dumps(summary,indent=2)+'\n')
print(mode,'all gates and exact asset hashes PASS',flush=True)
