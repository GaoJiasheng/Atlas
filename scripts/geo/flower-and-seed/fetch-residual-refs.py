"""Download development-only reference images. All downloaded files stay ignored."""
import json
import pathlib
import time
import urllib.request

root = pathlib.Path(__file__).parent
manifest = json.loads((root / 'residual-references.json').read_text())
refs = root / 'refs'
refs.mkdir(exist_ok=True)
for rows in manifest.values():
    for row in rows:
        target = refs / row['file']
        if target.exists():
            continue
        for attempt in range(3):
            try:
                request = urllib.request.Request(row['image'], headers={
                    'User-Agent': 'AtlasEducationalReferenceStudy/1.0',
                })
                with urllib.request.urlopen(request, timeout=60) as response:
                    temporary = target.with_suffix('.part')
                    temporary.write_bytes(response.read())
                    temporary.replace(target)
                break
            except Exception:
                if attempt == 2:
                    raise
                time.sleep(2 + attempt * 3)
(refs / 'manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
