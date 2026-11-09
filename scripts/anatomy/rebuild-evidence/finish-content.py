"""Keep topic data edits minimal, preserving original formatting and facts."""
from pathlib import Path
import copy
import json
import re

root = Path(__file__).resolve().parents[3]
substitutions = {
    'arms': [('low-detail', 'smooth source-derived'), ('低细节', '平滑')],
    'back': [('simplified skin surface', 'smooth source-derived skin surface'), ('简化皮肤', '平滑皮肤')],
    'chest': [('low-detail', 'smooth source-derived'), ('做了简化', '重建为平滑表面')],
    'core': [('Simplified whole-body surface', 'Smooth source-derived whole-body surface'), ('简化全身体表', '平滑全身体表')],
    'legs': [('low-detail', 'smooth source-derived'), ('低精度皮肤', '平滑皮肤')],
    'shoulders': [('simplified for orientation', 'smoothly reconstructed for orientation'), ('经过简化', '重建为平滑表面')],
}
for topic, replacements in substitutions.items():
    original_path = root / f'scripts/anatomy/cache/evidence-baseline/muscles-{topic}-parts.json'
    target = root / f'src/content/topics/muscles-{topic}/data/parts.json'
    raw = original_path.read_text()
    original = json.loads(raw)
    current = json.loads(target.read_text())
    permitted = copy.deepcopy(current)
    assert permitted['views'].pop('exerciseBody') == 'mannequin'
    old_skin = next(p for p in original['parts'] if p['id'] == 'skin-outline')
    next(p for p in permitted['parts'] if p['id'] == 'skin-outline')['detail'] = old_skin['detail']
    assert original == permitted, f'{topic}: unexpected semantic edit outside body style and skin detail'
    for language, text in old_skin['detail'].items():
        revised = text
        for old, new in replacements:
            revised = revised.replace(old, new)
        needle = json.dumps(text, ensure_ascii=False)
        assert raw.count(needle) == 1
        raw = raw.replace(needle, json.dumps(revised, ensure_ascii=False))
    raw, count = re.subn(r'("views"\s*:\s*\{\s*\n)', r'\1    "exerciseBody": "mannequin",\n', raw, count=1)
    assert count == 1
    final = json.loads(raw)
    assert final['views']['exerciseBody'] == 'mannequin'
    target.write_text(raw)
    print(topic, 'only body-style and bilingual skin-detail edits retained')
