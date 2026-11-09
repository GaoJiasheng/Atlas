"""Fetch the frozen development references. No search, no runtime requests.
The frozen manifest records each Commons author, licence, source and original URL.
"""
import json
import pathlib
import urllib.request
from time import sleep
ROOT = pathlib.Path(__file__).parent
refs = ROOT / 'refs'
refs.mkdir(exist_ok=True)
manifest = json.loads((ROOT / 'evidence/reference-manifest.json').read_text())
for rows in manifest.values():
    for row in rows:
        path = refs / row['file']
        if path.exists():
            continue
        for attempt in range(3):
            try:
                request = urllib.request.Request(row['image'], headers={'User-Agent': 'AtlasEducationalReferenceStudy/1.0'})
                with urllib.request.urlopen(request, timeout=40) as response:
                    path.write_bytes(response.read())
                break
            except Exception as error:
                if attempt == 2:
                    raise RuntimeError(f"Reference unavailable: {row['url']}") from error
                sleep(1)
(refs / 'manifest.json').write_text(json.dumps(manifest, indent=2)+'\n')
