"""Reprocess all cached round-8 native skin scenes; run native round-9 gates."""
import argparse,json,subprocess,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parent
parser=argparse.ArgumentParser(); parser.add_argument('--topics',nargs='+',default=['chest','back','shoulders','arms','legs','core']);args=parser.parse_args()
for topic in args.topics:
    for label,command in [
        ('derive',['blender','-b','--python-exit-code','1','-P',str(ROOT/'round9.py'),'--','--topic',topic]),
        ('optimize',['pnpm','exec','node','--import','tsx',str(ROOT/'optimize.ts'),'--topic',topic]),
        ('audit',[sys.executable,str(ROOT/'audit.py'),'--topic',topic]),
        ('preview',['blender','-b','--python-exit-code','1','-P',str(ROOT/'preview.py'),'--','--topic',topic]),
        ('report',['blender','-b','--python-exit-code','1','-P',str(ROOT/'report.py'),'--','--topic',topic])]:
        print(topic,label,flush=True)
        with (ROOT/f'cache/{topic}-round9-{label}.log').open('w') as log:
            subprocess.run(command,stdout=log,stderr=subprocess.STDOUT,check=True,cwd=ROOT.parents[1])
    from audit import append_report
    result=json.loads((ROOT/f'cache/{topic}-weights-audit.json').read_text());append_report(topic,result)
    print('ACCEPTED',topic,result['bytes'],result['triangles'],result['sha256'],flush=True)
