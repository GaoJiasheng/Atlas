"""Record final evidence from the delivered bytes and completed gate logs."""
from pathlib import Path
import json,hashlib,re
base=Path('scripts/geo/saturn-v')
asset=Path('public/models/saturn-v.glb').read_bytes()
sha=hashlib.sha256(asset).hexdigest()
audit=json.loads((base/'mesh-audit.json').read_text())
assert len(asset)==audit['glbAfter']<1_500_000
assert audit['totalAfter']<=350_000

def log(name):
    return re.sub(r'\x1b\[[0-9;]*m','',(base/name).read_text())
check=log('round2-check-complete.log')
assert '- 0 errors' in check and '- 0 warnings' in check
validate=log('round2-validate-complete.log')
assert '94 topic(s), 0 error(s), 0 warning(s)' in validate
suite=log('round2-suite-final.log')
saturn=log('round2-saturn-final.log')
saturn_count=re.search(r'saturn-v-topic.test.ts \((\d+) tests\)',saturn)
assert saturn_count and int(saturn_count[1])>=68
saturn_tests=int(saturn_count[1])
assert f'{saturn_tests} passed' in saturn
assert re.search(rf'saturn-v-topic.test.ts \({saturn_tests} tests\)',suite)
totals=re.search(r'Tests\s+(\d+) failed \| (\d+) passed \((\d+)\)',suite)
assert totals and int(totals[1])==1 and '273 passed (275)' in suite
assert 'solar-system-polish.test.ts' in suite and 'tests/js-budget.test.ts' in suite
build=log('round2-build-complete.log')
assert "Cannot access 'CLIP_QUANTITIES' before initialization" in build
assert 'error TS' not in log('round2-preview-types.log')

evidence=[]
for theme in ['paper','cinema']:
    directory=base/'comparisons'/('round2-final-'+theme)
    manifest=json.loads((directory/'render-manifest.json').read_text())
    assert len(manifest)==39,(theme,len(manifest))
    for shot,entry in manifest.items():
        assert entry['assetSHA256']==sha,(theme,shot,'stale payload')
        assert (directory/(shot+'-comparison.png')).exists()
        assert entry['shading']=='interpolated-fragment-normals'
    contacts=[directory/(hero+'-four-views.png') for hero in ['stack','f1','j2','csm','les','lm']]
    assert all(p.exists() for p in contacts)
    contact_manifest=json.loads((directory/'contact-manifest.json').read_text())
    assert len(contact_manifest)==6 and all(e['assetSHA256']==sha for e in contact_manifest.values())
    assert manifest['lm-rear-photo']['projection']=='perspective'
    evidence.append({'directory':str(directory.resolve()),'renderReferencePairs':len(manifest),'heroContacts':6,'allFramesMatchFinalAsset':True,'rearPhotoProjection':manifest['lm-rear-photo']})

record={
 'date':'2026-11-09','flight':'AS-506 / CSM-107 Columbia / LM-5 Eagle',
 'asset':{'path':'public/models/saturn-v.glb','bytes':len(asset),'sha256':sha,'trianglesAllParts':audit['totalAfter'],'estimatedMaterialDrawPieces':audit['callsAfterEstimate'],'runtimeNetwork':False},
 'round1':audit['round1'],
 'selfGrades':{'A':33,'B':0,'C':0,'scope':'Mechanical shape/attachment/quantity review under studio+ACES; provisional for Claude GPU acceptance, not manufacturing CAD or a flight dynamics certification.'},
 'gates':{
  'check':{'status':'pass','command':'pnpm check','errors':0,'warnings':0,'hints':5,'log':'round2-check-complete.log','finalPreviewTypecheck':'pnpm exec tsc --noEmit; pass'},
  'validate':{'status':'pass','command':'pnpm validate','topics':94,'errors':0,'warnings':0},
  'saturnRegression':{'status':'pass','tests':saturn_tests,'withinFullSuite':True,'readsActualCompressedPayload':True,'log':'round2-saturn-final.log'},
  'test':{'status':'blocked_outside_topic','command':'pnpm run test --maxWorkers=2 --testTimeout=15000','filesPassed':273,'filesFailed':2,'testsPassed':int(totals[2]),'testsFailed':1,'failures':['solar-system-polish: shared CatalogueSky extensionless Drei Html import','JS budget: dist/en/topics missing after blocked build'],'log':'round2-suite-final.log','defaultLog':'round2-suite-default-final.log','defaultRun':'Default pnpm test also ran; an unrelated toad-dermis 5s timeout cleared in the limited-concurrency rerun. No Vitest config added or modified.'},
  'build':{'status':'blocked_outside_topic','command':'pnpm build','error':"Cannot access 'CLIP_QUANTITIES' before initialization",'log':'round2-build-complete.log','isolationProof':'Schema/runtime-only Vite entry fails without any Saturn content; same entry imports successfully with proposed cycle fix substituted in memory.'}
 },
 'editorialText':json.loads((base/'editorial-text-audit.json').read_text()),
 'sharedPatches':[{'path':str(base/'build-magnet-cycle.patch'),'applied':False,'gitApplyCheck':'pass'},{'path':str(base/'catalogue-html-import.patch'),'applied':False,'gitApplyCheck':'pass'}],
 'evidence':evidence,
 'fit':json.loads((base/'fit-audit.json').read_text()),
 'retainedBehavior':'33 IDs, 35 beats, 13 terminal configurations, existing one-tap fix, teaching tables and animation/flow gates retained. S90 terminal stow remains an educational compressed envelope, not new hinge dynamics.',
 'notPerformed':['GPU/browser/desktop acceptance, as prohibited','Application of shared-engine patches, outside ownership','Git writes'],
}
old=base/'round1-verification.json'
if not old.exists():old.write_bytes((base/'verification.json').read_bytes())
text=json.dumps(record,ensure_ascii=False,indent=2)+'\n'
(base/'round2-verification.json').write_text(text)
(base/'verification.json').write_text(text)
print(json.dumps({'triangles':audit['totalAfter'],'bytes':len(asset),'sha256':sha,'framesPerTheme':39,'saturnTests':saturn_tests}))
