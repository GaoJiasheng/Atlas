#!/usr/bin/env python3
"""Static emitted-JS graph audit, not a browser/network or device performance measurement."""
import gzip
import json
import pathlib
import re

root = pathlib.Path(__file__).resolve().parents[3]
dist = root / 'dist'
page = (dist / 'en/topics/dinosaur-earth/index.html').read_text()
attrs = re.findall(r'(?:component-url|renderer-url|src)="([^"?]+\.js)"', page)
shell = [dist / url.lstrip('/') for url in attrs if url.startswith('/')]
time_views = [p for p in (dist / '_astro').glob('View.*.js') if 'ts-stage' in p.read_text()]
reconstruction = list((dist / '_astro').glob('reconstruction-map.*.js'))
# The View loads the deep-time HUD and evidence loader lazily; a reconstruction topic always takes both.
deep_ui = [*(dist / '_astro').glob('ModernInset.*.js'), *(dist / '_astro').glob('deep-time-transport.*.js')]
if len(time_views) != 1 or len(reconstruction) != 1 or len(deep_ui) != 2:
    raise SystemExit('Build the current reconstruction code before auditing its selected lazy-loading path')

def graph(seeds):
    seen = set()
    def visit(path):
        path = path.resolve()
        if path in seen:
            return
        if not path.is_file():
            raise RuntimeError(f'Missing emitted import: {path}')
        seen.add(path)
        code = path.read_text()
        for spec in re.findall(r'\b(?:from|import)\s*["\'](\./[^"\']+\.js)["\']', code):
            visit(path.parent / spec)
    for seed in seeds:
        visit(seed)
    return sorted(seen)

def report(files):
    return {'gzipBytes': sum(len(gzip.compress(p.read_bytes(), compresslevel=9, mtime=0)) for p in files),
            'files': [{ 'file': str(p.relative_to(dist)), 'gzipBytes': len(gzip.compress(p.read_bytes(), compresslevel=9, mtime=0)) } for p in files]}

out = {'method': 'Deduplicated emitted ES-module static import closure; add only TimeScene View, its lazy deep-time HUD / evidence loader and the selected reconstruction-map lazy branch (with the MapLibre chunk it imports). Per-resource gzip level9, no source maps. Includes Astro React renderer. Excludes CSS/fonts/JSON, inline scripts, service worker, unselected engine views and historical controller. A build artifact estimate, not transferred bytes or GPU/iPad timing.',
       'shell': report(graph(shell)),
       'mapReady': report(graph([*shell, *time_views, *reconstruction, *deep_ui])),
       'mapReadyBudgetBytes': 400_000}
out['deployedData'] = {'publicGeoBytes': sum(p.stat().st_size for p in (root / 'public/geo').glob('de-*.json')), 'topicPayloadBytes': (dist / 'topics/dinosaur-earth/data.json').stat().st_size}
out['deployedData']['combinedBytes'] = sum(out['deployedData'].values())
out['deployedData']['budgetBytes'] = 2_000_000
out['deployedData']['budgetMet'] = out['deployedData']['combinedBytes'] <= out['deployedData']['budgetBytes']
out['mapReadyBudgetMet'] = out['mapReady']['gzipBytes'] <= out['mapReadyBudgetBytes']
path = root / 'scripts/geo/dinosaur-earth/bundle-report.json'
path.write_text(json.dumps(out, indent=2) + '\n')
print(json.dumps({k: v if k not in ('shell','mapReady') else v['gzipBytes'] for k,v in out.items() if k != 'method'}, indent=2))

raise SystemExit(0 if out['mapReadyBudgetMet'] and out['deployedData']['budgetMet'] else 1)
