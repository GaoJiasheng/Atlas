"""Exact-source verification snapshot with writable tool caches. No git writes.
Dependencies retain their installed versions; no package/lock edits.
"""
from pathlib import Path
import os,subprocess,json,hashlib,shutil,time,sys
root=Path(__file__).resolve().parents[3];patched=False;snap=Path('/private/tmp/atlas-muscles-round4-patch-gates' if patched else '/private/tmp/atlas-muscles-round4-gates');log=root/('scripts/anatomy/round4/gates-patched' if patched else 'scripts/anatomy/round4/gates');log.mkdir(exist_ok=True)
snap.mkdir(exist_ok=True)
for path in ['src','public','tests','tests-e2e','docs']:
 subprocess.run(['rsync','-a','--delete',str(root/path)+'/',str(snap/path)+'/'],check=True)
# Exclude large development reference/cache files, while keeping every TS input
# and all test fixtures needed by the repository's checks.
subprocess.run(['rsync','-a','--delete','--exclude=anatomy/cache','--exclude=anatomy/round3/before','--exclude=anatomy/round3/comparisons','--exclude=anatomy/rebuild-illustrations/sources','--exclude=anatomy/rebuild-evidence/comparisons','--exclude=anatomy/rebuild-evidence/gate-logs',str(root/'scripts')+'/',str(snap/'scripts')+'/'],check=True)
for path in ['astro.config.mjs','tsconfig.json','package.json','pnpm-lock.yaml','vitest.config.ts','playwright.config.ts']:
 shutil.copy2(root/path,snap/path)
# Vite's SSR external loader fails the existing extensionless Drei Html
# import in this symlinked install. Inline the unchanged installed dependency
# in the verifier only; no test is mocked, skipped or weakened.
vc=snap/'vitest.config.ts'
vc.write_text(vc.read_text().replace("environment: 'node',", "environment: 'node',\n    maxWorkers: 2,\n    server: { deps: { inline: ['@react-three/drei'] } },"))
(log/'environment.json').write_text(json.dumps({'nodeModules':'writable facade of installed versions','vitestOverride':'server.deps.inline: @react-three/drei; maxWorkers: 2 to avoid unrelated 5-second CPU timeouts while offline renders run','reason':'Existing solar-system-polish suite fails Vite SSR external loading of Html.js in original config; real dependency inlining passes all 28 assertions. Product source and repository test assertions unchanged.'},indent=2))
modules=snap/'node_modules';modules.mkdir(exist_ok=True)
for path in (root/'node_modules').iterdir():
 if path.name in ['.vite','.vite-temp','.astro']:continue
 dst=modules/path.name
 if not dst.exists():dst.symlink_to(path.resolve(),target_is_directory=path.is_dir())
for c in ['.vite','.vite-temp','.astro']:(modules/c).mkdir(exist_ok=True)
if patched:subprocess.run(['patch','-p1','-i',str(root/'scripts/anatomy/round3/highlights.patch')],cwd=snap,check=True)
inputs={str(p.relative_to(root)):hashlib.sha256(p.read_bytes()).hexdigest()for top in ['src','public','tests','scripts/anatomy/round4']for p in (root/top).rglob('*')if p.is_file()and p.suffix in ['.ts','.tsx','.json','.glb','.webp','.patch']and '/comparisons/'not in str(p)and '/before/'not in str(p)and '/gates'not in str(p)}
(log/'inputs.json').write_text(json.dumps(inputs,indent=2))
results=[]
for command in [['pnpm','exec','vitest','run','tests/muscles-round4.test.ts','tests/muscles-round3.test.ts','tests/space-scene/muscles-rebuild.test.ts'],['pnpm','check'],['pnpm','validate'],['pnpm','test'],['pnpm','build'],['pnpm','exec','vitest','run','tests/js-budget.test.ts']]:
 name='-'.join(command[1:]).replace('/','_');start=time.time()
 with (log/(name+'.log')).open('w')as out:p=subprocess.run(command,cwd=snap,stdout=out,stderr=subprocess.STDOUT)
 row={'command':' '.join(command),'exitCode':p.returncode,'seconds':round(time.time()-start,2),'log':str(log/(name+'.log'))};results.append(row);(log/'results.json').write_text(json.dumps(results,indent=2));print(row,flush=True)
 if p.returncode:break
if any(r['exitCode'] for r in results):raise SystemExit(1)
