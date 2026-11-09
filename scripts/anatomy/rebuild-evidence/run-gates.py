"""Run complete project gates in a byte-checked snapshot with writable caches.
No browser tests, package edits, source-engine patches, or git mutations.
"""
from pathlib import Path
import subprocess,json,hashlib,time,sys
ROOT=Path(__file__).resolve().parents[3];HERE=Path(__file__).resolve().parent
SNAPSHOT=Path('/private/tmp/atlas-muscles-rebuild-gates')
subprocess.run([sys.executable,str(HERE/'prepare-gates.py'),str(SNAPSHOT)],cwd=ROOT,check=True)

def inputs(base):
 paths=[]
 for directory in ['src','tests','scripts']:
  paths.extend(p for p in (base/directory).rglob('*')if p.is_file()and p.suffix in ['.ts','.tsx','.mjs','.json','.py','.mdx']and '/cache/'not in str(p)and(p.suffix!='.json'or('/rebuild-evidence/'not in str(p)and '/rebuild-illustrations/'not in str(p))))
 paths.extend([base/'package.json',base/'pnpm-lock.yaml',base/'astro.config.mjs',base/'tsconfig.json',base/'vitest.config.ts'])
 paths.extend((base/'src/content/topics').glob('muscles-*/illustration-manifest.jsonl'))
 paths.extend((base/'scripts/geo/muscles-core').glob('*.patch'))
 paths.append(base/'scripts/anatomy/rebuild-illustrations/shared-coverage.patch')
 paths.extend((base/'public/models').glob('muscles-*.glb'))
 paths.extend((base/'public/illustrations').glob('muscles-*.webp'))
 paths.extend(base/f'public/illustrations/exercises/{x}.webp'for x in ['barbell-bench-press','heel-walk','cable-hip-adduction'])
 return{str(p.relative_to(base)):hashlib.sha256(p.read_bytes()).hexdigest()for p in sorted(set(paths))}
a=inputs(ROOT);b=inputs(SNAPSHOT)
if a!=b:raise SystemExit('Snapshot input byte verification failed')
record={'source':str(ROOT),'snapshot':str(SNAPSHOT),'date':'2026-11-09','gitBase':subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip(),'inputSha256':a,'runs':[], 'limits':'No browser/Chromium/desktop launched. Source worktree engine patches remain unapplied. Existing test assertions preserved and nail-shell regressions added; two workers and 30s timeout avoid default 5s failures in unrelated CPU-heavy geometry tests during offline rendering.'}
(HERE/'gate-run.json').write_text(json.dumps(record,indent=2)+'\n')
commands=[('pnpm check',['pnpm','check']),('pnpm validate',['pnpm','validate']),('pnpm test (2 workers, 30s timeout)',['pnpm','run','test','--maxWorkers=2','--testTimeout=30000']),('pnpm build',['pnpm','build'])]
logdir=HERE/'gate-logs';logdir.mkdir(exist_ok=True);results={}
for i,(label,command)in enumerate(commands):
 log=logdir/f'{i+1}-{label.split()[1]}.log';start=time.time()
 with log.open('w')as stream:ret=subprocess.run(command,cwd=SNAPSHOT,stdout=stream,stderr=subprocess.STDOUT).returncode
 row={'command':command,'exitCode':ret,'seconds':round(time.time()-start,2),'log':str(log.relative_to(ROOT))};record['runs'].append(row)
 results[label]=f'{"PASS"if ret==0 else"FAIL"} (exit {ret}; {row["seconds"]}s; `{row["log"]}`)'
 (HERE/'gates.json').write_text(json.dumps(results,indent=2)+'\n');(HERE/'gate-run.json').write_text(json.dumps(record,indent=2)+'\n')
 print(label,results[label],flush=True)
 if ret:raise SystemExit(ret)
# Build may copy or transform assets; verify the public files remain byte-exact.
for relative,digest in a.items():
 if relative.startswith('public/'):
  output=SNAPSHOT/'dist'/relative.removeprefix('public/')
  if not output.exists()or hashlib.sha256(output.read_bytes()).hexdigest()!=digest:raise SystemExit('Built asset mismatch: '+relative)
if inputs(ROOT)!=a:raise SystemExit('Worktree inputs changed during gates; refresh snapshot and rerun')
print('All four complete gates, stable source inputs and built muscle asset hashes passed.',flush=True)
