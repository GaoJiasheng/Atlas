"""Make an exact source snapshot with writable build caches; no dependency edits.

The supplied worktree's node_modules is a symlink to a read-only sibling.
Astro/Vite try to mutate its caches. The snapshot retains the same installed
packages, linking each top-level package individually, with local cache dirs.
"""
from pathlib import Path
import subprocess
import json
import shutil
import sys

source = Path(__file__).resolve().parents[3]
target = Path(sys.argv[1] if len(sys.argv) > 1 else '/private/tmp/atlas-muscles-rebuild-gates')
target.mkdir(parents=True, exist_ok=True)
subprocess.run([
    'rsync', '-a', '--delete', '--exclude', '.git', '--exclude', 'node_modules',
    '--exclude', 'dist', '--exclude', '.astro', '--exclude', 'shots',
    '--exclude', 'scripts/anatomy/cache', '--exclude', 'scripts/anatomy/rebuild-baseline',
    '--exclude', 'scripts/anatomy/rebuild-evidence/baseline',
    str(source) + '/', str(target) + '/',
], check=True)
modules = target / 'node_modules'
modules.mkdir(exist_ok=True)
for package in (source / 'node_modules').resolve().iterdir():
    if package.name in ('.vite', '.astro', '.cache', '.vite-temp'):
        continue
    link = modules / package.name
    if not link.exists() and not link.is_symlink():
        link.symlink_to(package.resolve(), target_is_directory=package.is_dir())
# Vite 6's external dependency resolution cannot transform Drei's extensionless
# Html entry through this worktree's sibling-package realpath. An exact local
# copy resolves it. Package files/versions are unchanged; dependency links point
# at the same installed files, and the original node_modules is read-only.
scope = modules / '@react-three'
original_scope = (source / 'node_modules/@react-three').resolve()
if scope.is_symlink():
    scope.unlink()
    scope.mkdir()
for package in original_scope.iterdir():
    link = scope / package.name
    if package.name != 'drei':
        if not link.exists():
            link.symlink_to(package.resolve(), target_is_directory=True)
        continue
    original = package.resolve()
    if not link.exists():
        shutil.copytree(original, link, symlinks=True)
        for nested in list(link.rglob('*')):
            if nested.is_symlink():
                destination = (original / nested.relative_to(link)).resolve()
                nested.unlink()
                nested.symlink_to(destination, target_is_directory=destination.is_dir())
    dependencies = link / 'node_modules'
    dependencies.mkdir(exist_ok=True)
    for dependency in original.parent.parent.iterdir():
        dependency_link = dependencies / dependency.name
        if not dependency_link.exists() and not dependency_link.is_symlink():
            dependency_link.symlink_to(dependency.resolve(), target_is_directory=dependency.is_dir())
print(json.dumps({'snapshot': str(target), 'source': str(source), 'dependencies': str((source / 'node_modules').resolve()), 'packageChanges': False}))
