from pathlib import Path
import subprocess
script=Path(__file__).with_name('run-gates.py')
for mode in [[],['--patched']]:
 p=subprocess.run(['python3',str(script),*mode])
 if p.returncode:raise SystemExit(p.returncode)
