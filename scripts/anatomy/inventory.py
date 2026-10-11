"""Inventory all four cached FBX systems; no conversion loses object names."""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from common import CACHE, FILES, ROOT, clear_scene, import_system, object_info, part_instances, save_json


def write_report(inventory):
    manifest_path = ROOT / 'chest/manifest.json'
    if not manifest_path.exists():
        return
    manifest = json.loads(manifest_path.read_text())
    lines = ['# Chest source inventory — human gate', '',
             'Source metres, Z up, front −Y. Side inference for unsuffixed bones uses source X.', '',
             '| Part | Role | Side | Exists | Triangles | Closed sources | Exact source nodes |',
             '|---|---|---|---|---:|---|---|']
    for part, side, entries in part_instances(manifest, inventory['objects']):
        complete = len(entries) >= part.get('minimumObjects', 1)
        lines.append(f"| {part.get('specId', part['id'])} | {part['role']} | {side or '—'} | {'YES' if complete else 'MISSING'} | "
                     f"{sum(e['triangles'] for e in entries):,} | {sum(e['closed'] for e in entries)}/{len(entries)} | "
                     + '<br>'.join(e['name'] for e in entries) + ' |')
    lines += ['', 'Counts describe original source meshes, before any merge or simplification.',
              'Fascia, bursae, attachment areas and landmark cubes are excluded from selection.',
              'Skin regions are separate source surfaces; their union is not assumed watertight.',
              'Review this gate and the four previews before accepting anatomical candidates.']
    (CACHE / 'inventory-report.md').write_text('\n'.join(lines) + '\n')


if '--report-only' in sys.argv:
    inventory = json.loads((CACHE / 'inventory.json').read_text())
else:
    entries = []
    for system in FILES:
        clear_scene()
        objects = import_system(system)
        entries.extend(object_info(ob, system) for ob in objects)
        print(f'INVENTORY {system}: {len(objects)} objects', flush=True)
    inventory = {'units': 'metres', 'up': '+Z', 'front': '-Y', 'left': '+X', 'objects': entries}
    save_json(CACHE / 'inventory.json', inventory)
write_report(inventory)
print(CACHE / 'inventory.json', flush=True)
