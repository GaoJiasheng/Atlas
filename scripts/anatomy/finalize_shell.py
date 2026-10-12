"""Synchronize thin-shell weights on the actual quantized bind geometry.

Export normal seams and final position quantization can reveal extra opposing
surface pairs. Muscle data is never changed by this pass.
"""
import json
import sys
from pathlib import Path
from full_body import shell_aliases, match_shell_weights
from skin_weights import repair, inspect

path=Path(sys.argv[1])
mesh=json.loads(path.read_text())
# Small conservative guards cover float32 dequantization at pairing boundaries.
aliases=shell_aliases(mesh['points'],mesh['faces'],thickness=.0061,normal_dot=.4)
paired=match_shell_weights(mesh['weights'],aliases)
audit_aliases=shell_aliases(mesh['points'],mesh['faces'])
weights,_,stats=repair(mesh['points'],mesh['faces'],mesh['weights'],mesh['joints'],
                       shell_aliases=audit_aliases,equivalence_aliases=aliases)
check=inspect(mesh['points'],mesh['faces'],weights,mesh['joints'],audit_aliases)
if check['outlierCount']: raise RuntimeError(check)
assert all(weights[i]==weights[root] for i,root in enumerate(aliases))
path.write_text(json.dumps(dict(weights=weights,stats=dict(**stats,shellPairedGroups=paired))))
print(f"FINAL SHELL: {paired} paired groups, {stats['outliersFixed']} repaired, 0 outliers, identical shell weights")
