"""Verify published round-9 evidence and emit a reviewable per-topic summary."""
import hashlib,json
from pathlib import Path
from full_body import POSE
from skin_manifest import SKIN_NODES
ROOT=Path(__file__).resolve().parent
TOPICS=('chest','back','shoulders','arms','legs','core')
rows=[]
for topic in TOPICS:
    model=ROOT.parents[1]/f'public/models/muscles-{topic}.glb'
    data=model.read_bytes();sha=hashlib.sha256(data).hexdigest()
    audit=json.loads((ROOT/f'cache/{topic}-weights-audit.json').read_text())
    summary=json.loads((ROOT/f'cache/{topic}-optimize-stats.json').read_text())
    pose=json.loads((ROOT/f'cache/{topic}-pose-stats.json').read_text())
    manifest_path=ROOT/topic/'manifest.json';manifest=json.loads(manifest_path.read_text())
    surface=json.loads((ROOT/f'cache/{topic}-report-stats.json').read_text())
    coverage=json.loads((ROOT/f'cache/{topic}-skin-coverage.json').read_text())
    assert audit['sha256']==sha and audit['bytes']==len(data)==summary['bytes']
    assert audit['manifestSha256']==hashlib.sha256(manifest_path.read_bytes()).hexdigest()
    assert not audit['flags'] and audit['outlierCount']==audit['shellWeightMismatches']==0
    assert pose['angles']==POSE
    assert manifest['skinNodes']==SKIN_NODES
    assert all(s['sampledHausdorffM']<=s['budgetM']+1e-6 for s in surface)
    assert coverage['sampledUnionDeviationM']<=coverage['maxDeviationM']+1e-6
    parts={r['node']:r['triangles'] for r in summary['nodes'] if r['node'] in SKIN_NODES}
    assert set(parts)==set(SKIN_NODES) and 3000<=parts['skin-wire']<=5000
    assert len(data)<=4000000 and summary['triangles']<=350000
    previews={name:str(ROOT/f'cache/{topic}-preview-{name}.png') for name in
              ('pose','pose-front','pose-back','pose-left','pose-anatomy','wire-rest','wire-pose')}
    assert all(Path(p).exists() for p in previews.values())
    rows.append(dict(topic=topic,skinNodes=SKIN_NODES,skinTriangles=parts,bytes=len(data),
                     triangles=summary['triangles'],sha256=sha,previewPaths=previews,
                     outliersRemaining=0,shellWeightMismatches=0,
                     splitSkinDeviationM=coverage['sampledUnionDeviationM']))
    print(json.dumps(rows[-1]),flush=True)
(ROOT/'round9-summary.json').write_text(json.dumps(rows,indent=2)+'\n')
lines=['# Round 9 hands and wireframe acceptance','','All six topics export `skin-outline`, `skin-hand.l`, `skin-hand.r`, and `skin-wire`. The wrist cuts are open, 5 mm distal to the existing styloid-midpoint hand pivots and perpendicular to each real elbow-to-wrist axis. Both hand nodes are rigidly skinned to their matching hand joints. The outline has no hands. Hide the two original hand nodes when replacing them with procedural hands.','',
       'The additional whole-body wire node includes both hands. Native planar dissolve (3°) and quadric planar-preserving simplification yield 3,000–5,000 decoded triangles. The existing skin weights are barycentrically interpolated from source triangles, normalized to four influences, shell-synchronized and repaired. All 19 rig joints retain nonzero wire weights. A final codec-roundtrip inspection repairs any remaining skin shell mismatch on the exact decoded bind geometry before publication; the independent audit remains unchanged. Skin UVs and wire normals are omitted as unused attributes.','',
       'Published weights, fibre endpoints, local outliers, shell equivalence, rigid hand binding, wrist cut planes, joint declarations, coordinate/attribute gates, native source surface comparisons and split-skin union coverage pass. Every output is under both soft limits (4,000,000 bytes / 350,000 triangles) and hard limits (8,000,000 bytes / 500,000 triangles). No downloads or application build/test/e2e commands ran. All changes for this round stay within scripts/anatomy and the six muscles GLBs.','',
       'Derived skin nodes reference the full source-label provenance on `skin-outline`, avoiding repeated metadata payloads. Muscle positions, weight fields, fibre directions and normals retain their Round 8 precision. Legs rounds `_U` to 1/4096 and UVs to 1/512 for the soft byte limit; other topics retain `_U` and UV precision. Exact 0/1 endpoints remain exact.','',
       'Pose: left shoulder flexion 90°, right elbow flexion 90°, left hip flexion 60°, right knee flexion 90°, both ankles dorsiflexion 15°. The existing engine right-axis sign convention is retained. Blender edge-only previews trace the actual decoded wire geometry; all mesh faces are hidden. Full-body posed front/back/left/oblique and anatomy images and rest/posed wire previews were inspected for all six topics. Limbs, hands and bent knees remain readable. Existing panel creases and overlapping shell edges remain visible; the intentionally open wrist cuts can be seen at the separate rigid-hand seams. No new neck/shoulder/groin detachment was observed. This review covers the common test pose.','',
       '| Topic | Skin nodes | Bytes | Total triangles | Wire triangles | SHA-256 | Previews |',
       '|---|---|---:|---:|---:|---|---|']
for r in rows:
    topic=r['topic']
    lines.append(f"| {topic} | `{', '.join(r['skinNodes'])}` | {r['bytes']:,} | {r['triangles']:,} | {r['skinTriangles']['skin-wire']:,} | `{r['sha256']}` | [pose]({r['previewPaths']['pose']}), [wire rest]({r['previewPaths']['wire-rest']}), [wire pose]({r['previewPaths']['wire-pose']}) |")
lines+=['','## Evidence','']
for r in rows:
    topic=r['topic'];lines.append(f"- {topic}: [manifest]({topic}/manifest.json), [surface and weights report]({topic}/report.md), [visual review]({topic}/preview-review.md); split-skin union deviation {r['splitSkinDeviationM']*1000:.3f} mm; 0 outliers and 0 shell mismatches.")
lines+=['','Reproduce from cached native scenes with `python3 scripts/anatomy/run_round9.py`; a fresh source build also derives the skin parts through `build.py`. `round9-summary.json` contains full per-topic node counts, checksums and preview paths. Historical Round 8 acceptance is preserved in [ROUND-8-REPORT.md](ROUND-8-REPORT.md).','','Anatomical attachment/tendon wording and exercise-specific motion approval remain [待核]. Geometry and derived assets: CC BY-SA 4.0.','']
(ROOT/'report.md').write_text('\n'.join(lines))
(ROOT/'ROUND-9-REPORT.md').write_text('\n'.join(lines))
