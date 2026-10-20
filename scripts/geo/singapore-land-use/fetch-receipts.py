"""Retain licence/source/download receipts outside ignored raw/; no signed tokens."""
from pathlib import Path
import hashlib,json
p=Path(__file__).parent
rows=[]
for name in ['fetch-log.json','landsat-fetch-log.json']:
 f=p/'raw'/name
 if f.exists():rows.append({'ledger':name,'records':json.load(open(f))})
for name in ['bis1959.jpg','osm-water.geojson']:
 f=p/'raw'/name
 rows.append({'file':name,'bytes':f.stat().st_size,'sha256':hashlib.sha256(f.read_bytes()).hexdigest(),'method':'Copied read-only existing retained source, 2026-10-20','origin':'scratchpad/lu preview from Commons documented1920pxthumbnail' if name.startswith('bis') else 'main worktree scripts/geo/four-taps/raw/osm-water.geojson; same preexisting export as four-taps, ODbL1.0'})
(p/'fetch-receipts.json').write_text(json.dumps(rows,indent=2))
