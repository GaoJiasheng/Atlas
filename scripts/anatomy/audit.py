"""Audit published GLB weights and fibre endpoints using offline native references."""
import argparse
import hashlib
import json
import subprocess
import sys
from pathlib import Path
from rig_rules import attachment_joint, joint_path, parents
from skin_weights import inspect

ROOT = Path(__file__).resolve().parent
TOPICS = ('chest','back','shoulders','arms','legs','core')


def markdown(result):
    lines = ['## Published skin-weight audit', '',
             f"Decoded published GLB SHA-256: `{result['sha256']}`.", '',
             'Shares sum decoded weights over referenced vertices, including UV/normal seams. '
             'Required alternatives are joints bordering the manifest attachment bones; allowed joints include intervening '
             'joints in the rig parent chain (e.g. shoulder between scapula and elbow). '
             'Radius uses elbow unless the rig provides a separate pronation joint. '
             'Missing attachment weights, unrelated joints above 30%, reversed fibre fields and '
             'violated persistent endpoint overrides and local weight outliers fail this gate. '
             'Outliers compare welded 1–2-ring dominant joints and area-weighted vectors; '
             'a discrepant vector must be over twice the neighbours’ median dominant-joint distance. '
             'Sub-edge detached scraps use nearby substantial surface rings because their component-local '
             'endpoint seeds are artificial; >1% discrepant weight mass on those scraps also fails. '
             'Smooth joint crossovers are excluded. Fixed counts refer to unique welded bind vertices.', '',
             '| Muscle | Joint shares | Required attachment joints | Fibre endpoints | Outliers remaining / fixed | Result |',
             '|---|---|---|---|---|---|']
    for row in result['rows']:
        shares = ', '.join(f'{n} {100*w:.2f}%' for n,w in sorted(row['shares'].items(),key=lambda x:-x[1]))
        lines.append(f"| {row['name']} | {shares} | {', '.join(row['required'])} | {row.get('fibreStatus','unchecked')} | {row['outlierCount']} / {row['outliersFixed']} | {'; '.join(row['flags']) or 'clean'} |")
    lines += ['', '| Other mesh | Outliers remaining / fixed |', '|---|---|']
    for mesh in result['meshes']:
        if mesh['role'] not in ('region','neighbour'):
            lines.append(f"| {mesh['name']} | {mesh['outlierCount']} / {mesh['outliersFixed']} |")
    lines += ['', f"Audit result: **{'FAIL' if result['flags'] else 'clean'}** ({len(result['rows'])} muscle nodes; {result['outlierCount']} outliers remaining, {result['outliersFixed']} fixed).", '']
    return '\n'.join(lines)


def append_report(topic, result):
    path = ROOT/topic/'report.md'
    content = path.read_text().split('## Published skin-weight audit')[0].rstrip()
    path.write_text(content+'\n\n'+markdown(result))


def audit(topic):
    subprocess.run(['pnpm','exec','node','--import','tsx',str(ROOT/'decode_weights.ts'),'--topic',topic],
                   cwd=ROOT.parents[1],check=True)
    subprocess.run(['blender','-b','--python-exit-code','1','-P',str(ROOT/'audit_fibres.py'),'--','--topic',topic],
                   cwd=ROOT.parents[1],check=True,stdout=subprocess.DEVNULL)
    result=json.loads((ROOT/f'cache/{topic}-weights-decoded.json').read_text())
    fibre=json.loads((ROOT/f'cache/{topic}-fibre-audit.json').read_text())
    manifest=json.loads((ROOT/topic/'manifest.json').read_text())
    weight_meshes={m['name']: m for m in json.loads((ROOT/f'cache/{topic}-weight-meshes.json').read_text())}
    repair_path=ROOT/f'cache/{topic}-weight-repair.json'
    repairs=json.loads(repair_path.read_text()) if repair_path.exists() else {}
    result['meshes']=[]
    for name, mesh in weight_meshes.items():
        check=inspect(mesh['points'],mesh['faces'],mesh['weights'],mesh['joints'])
        result['meshes'].append({'name':name,'role':mesh['role'],**check,
                                'outliersFixed':repairs.get(name,{}).get('outliersFixed',0)})
    mesh_checks={m['name']:m for m in result['meshes']}
    actual=result['parents']
    canonical=parents(actual)
    canonical.update(actual)
    if topic=='chest':
        for side in ('l','r'): canonical['wrist.'+side]='elbow.'+side
    result['flags']=[]
    result['flags'] += ['missing declared rig joint '+n for n in
                        sorted(set(manifest['jointNames'])-set(actual))]
    for index, skin in enumerate(result['skins']):
        result['flags'] += [f'skin {index}: missing declared rig joint '+n for n in
                            sorted(set(manifest['jointNames'])-set(skin))]
    result['flags'] += [f"{m['name']}: {m['outlierCount']} local skin-weight outliers" for m in result['meshes']
                        if m['role'] not in ('region','neighbour') and m['outlierCount']]
    expected={p['id']+('.'+s if s else '') for p in manifest['parts']
              if p['role'] in ('region','neighbour')
              for s in (('l','r') if p['sides']=='bilateral' else (None,))}
    observed={r['name'] for r in result['rows']}
    result['flags'] += ['missing muscle node '+n for n in sorted(expected-observed)]
    result['manifestSha256']=hashlib.sha256((ROOT/topic/'manifest.json').read_bytes()).hexdigest()
    for row in result['rows']:
        name=row['name'];side=name[-1] if name.endswith(('.l','.r')) else None
        part=next(p for p in manifest['parts'] if name in (p['id'],p['id']+'.l',p['id']+'.r'))
        origins={attachment_joint(b,side,f'forearm.{side}' in actual,topic=='chest') for b in part['origin']}
        insertions={attachment_joint(b,side,f'forearm.{side}' in actual,topic=='chest') for b in part['insertion']}
        required=origins|insertions
        allowed=set().union(*(set(joint_path(a,b,canonical)) for a in origins for b in insertions))
        flags=[]
        mesh=weight_meshes[name]
        row.update({k:mesh_checks[name][k] for k in ('outlierCount','outlierVertices')})
        row['outliersFixed']=repairs.get(name,{}).get('outliersFixed',0)
        row['monotonicVerticesFixed']=repairs.get(name,{}).get('monotonicVerticesFixed',0)
        if row['outlierCount']:
            flags.append(f"{row['outlierCount']} local skin-weight outliers")
        adjacency={joint: {joint} for joint in required}
        # A connecting joint borders both bones. Shoulder is adjacent to scapula
        # as well as humerus, so chest's merged triceps can legitimately bind its
        # long-head origin to shoulder. Trunk has no such limb ownership.
        for joint in required-{'trunk'}:
            adjacency[joint].update(n for n,p in canonical.items() if p==joint)
        if 'pelvis' in part['origin']+part['insertion']:
            adjacency['trunk'].add('hip.'+str(side))
        for joint in sorted(required):
            choices=adjacency[joint]
            if joint not in actual: flags.append(f'missing rig joint {joint}')
            if not any(row['shares'].get(n,0)>=1e-6 for n in choices):
                flags.append(f'missing attachment weight adjacent to {joint}')
        for joint,share in row['shares'].items():
            if share>.30 and joint not in allowed:
                flags.append(f'unrelated {joint} {share*100:.2f}% > 30%')
        row['required']=[' / '.join(sorted(adjacency[j])) for j in sorted(required)]
        row['allowed']=sorted(allowed)
        row.update(fibre[name]);flags+=row.pop('fibreFlags')
        row['flags']=flags
        result['flags'] += [name+': '+flag for flag in flags]
        shares=', '.join(f'{n}={100*w:.2f}%' for n,w in sorted(row['shares'].items(),key=lambda x:-x[1]))
        print(f'{topic} {name}: {shares} | '+('; '.join(flags) or 'clean'),flush=True)
        del row['endpoints']
        row.pop('components',None)
    result['outlierCount']=sum(r['outlierCount'] for r in result['meshes'])
    result['outliersFixed']=sum(r['outliersFixed'] for r in result['meshes'])
    (ROOT/f'cache/{topic}-weights-audit.json').write_text(json.dumps(result,indent=2)+'\n')
    print(f"AUDIT {topic}: "+('CLEAN' if not result['flags'] else f"{len(result['flags'])} FLAGS"),flush=True)
    print(f"GLB {topic}: {result['outliersFixed']} outliers fixed, {result['outlierCount']} remaining, {result['bytes']} bytes, {result['triangles']} triangles, sha256 {result['sha256']}",flush=True)
    print(f"RIG {topic}: {', '.join(manifest['jointNames'])}",flush=True)
    return result


if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--topic',choices=('all',)+TOPICS,default='all')
    parser.add_argument('--write-report',action='store_true')
    args=parser.parse_args()
    failures=[]
    for topic in TOPICS if args.topic=='all' else (args.topic,):
        result=audit(topic)
        if args.write_report: append_report(topic,result)
        failures+=result['flags']
    if failures:
        print('\nFLAGS:\n'+'\n'.join(failures),flush=True)
        sys.exit(1)
