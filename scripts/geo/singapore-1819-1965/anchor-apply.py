"""Apply the reviewed 92 event reference positions; preserve historical prose and uncertainty.
Run without --write to validate and emit the review ledger only. Raw receipts are never runtime data.
"""
import json,re,pathlib,sys
p=pathlib.Path(__file__).resolve().parent
root=p.parents[2]
data=root/'src/content/topics/singapore-1819-1965/data'
assign=json.loads((p/'anchor-assignments.json').read_text())
places={}
for row in json.loads((p/'anchor-singapore-places.json').read_text()):
 if not row.get('coordinates'): continue
 choices=[c for c in row['coordinates'] if c['rank']!='deprecated' and c['value']]
 if row['title']=='Singapore':
  value=row['geographicCentre'][0]['mainsnak']['datavalue']['value'];prop='P5140'
 elif row['title']=='Singapore River':
  # Last of the two current statements is explicitly qualified as river mouth.
  value=choices[-1]['value'];prop='P625 (mouth-qualified statement)'
 else:
  choices.sort(key=lambda c:0 if c['rank']=='preferred' else 1)
  value=choices[0]['value'];prop='P625'
 places[row['title']]={'qid':row['qid'],'place':row['label'],'at':[value['longitude'],value['latitude']],'property':prop,'revision':row['revision'],'url':f"https://www.wikidata.org/wiki/{row['qid']}",'receipt':f"raw/anchor-{row['qid']}.json",'sha256':row['sha256'],'precisionDegrees':value.get('precision')}
for row in json.loads((p/'anchor-regional-places.json').read_text())['places']:
 places[row['id']]=row
extra=p/'anchor-regional-extra.json'
if extra.exists():
 j=json.loads(extra.read_text())
 for row in j.get('places',[]):
  if row.get('at'): places[row['id']]=row
correction=p/'anchor-geylang-correction.json'
if correction.exists():
 row=json.loads(correction.read_text())['recommended']
 places[row['place']]=row
sources=json.loads((data/'sources.json').read_text())
events=json.loads((data/'events.json').read_text())
old_warning='Map anchor approximate; original site/precise location unverified. The coordinate is a draft orientation anchor, not a newly verified historical position.'
before=(p/'work/anchors-events-before-second-pass.json')
if not before.exists():before.write_text(json.dumps(events,ensure_ascii=False,indent=2)+'\n')
source_index={s.get('url'):s['id'] for s in sources['sources']}
next_id=max(int(s['id'][1:]) for s in sources['sources'])+1
records=[]
supplementary=json.loads((p/'anchor-supplementary.json').read_text())
for place in places.values():
 for item in place.get('supplementaryEvidence',[]):
  supplementary.append({'events':place.get('events',[]),'title':item['title'],'url':item['url'],'read':item['read']})
supplementary_by_event={}
for supplement in supplementary:
 sid=source_index.get(supplement['url'])
 if not sid:
  sid=f'S{next_id}';next_id+=1;source_index[supplement['url']]=sid
  sources['sources'].append({'id':sid,'text':{'en':supplement['title'],'zh':'【待译】'+supplement['title']},'url':supplement['url'],'note':{'en':supplement['read'],'zh':'【待译】'+supplement['read']}})
 for eid in supplement['events']:supplementary_by_event.setdefault(eid,[]).append(sid)
for event in events:
 if event['id'] not in assign:continue
 key,role=assign[event['id']]
 place=places[key]
 assert len(place['at'])==2
 source_url=place.get('apiUrl') if place.get('sourceKind')=='onemap' else f"https://www.wikidata.org/w/index.php?title={place['qid']}&oldid={place['revision']}"
 sid=source_index.get(source_url)
 if not sid:
  sid=f'S{next_id}';next_id+=1;source_index[source_url]=sid
  note=f"Read the cached Wikidata entity identity and {place['property']} on 18 October 2026, revision {place['revision']}; selected non-deprecated coordinate statement, [longitude, latitude] {place['at']}. Structured data CC0. Receipt {place['receipt']}; SHA-256 {place['sha256']}. The point documents the named place or locality centre, not a surveyed historical event footprint. Event-specific placement scope is recorded in each event's anchor note. Numerical precision of a coordinate is not a claim of historical accuracy."
  if place.get('sourceKind')=='onemap': note=place['sourceNote']+' '+place['attribution']
  title=f"SLA OneMap: {place['place']} address reference" if place.get('sourceKind')=='onemap' else f"Wikidata {place['qid']}, {place['place']}: {place['property']} reference coordinate"
  sources['sources'].append({'id':sid,'text':{'en':title,'zh':'【待译】'+title},'url':source_url,'note':{'en':note,'zh':'【待译】'+note}})
 old=event['at'];event['at']=[round(float(x),7) for x in place['at']]
 coordinate_label=f"SLA OneMap {place['property']} (18 October 2026)" if place.get('sourceKind')=='onemap' else f"Wikidata {place['qid']}, {place['property']}, revision {place['revision']}"
 note=f"Map anchor approximate: {role} Coordinate source: {coordinate_label} [{sid}]."
 assert old_warning in event['detail']['en'], f"{event['id']}: old anchor note not found; refusing duplicate/overwriting incremental corrections"
 event['detail']['en']=event['detail']['en'].replace(old_warning,note)
 event['detail']['zh']='【待译】'+event['detail']['en']
 if sid not in event['sources']:event['sources'].append(sid)
 for supplement_sid in supplementary_by_event.get(event['id'],[]):
  if supplement_sid not in event['sources']:event['sources'].append(supplement_sid)
 # The only removed summary text was an obsolete anchor-source disclaimer.
 if event['id']=='malaysia-agreement':
  stale='Signed in London, not at this Singapore orientation anchor.'
  event['summary']['en']=event['summary']['en'].replace(stale,'Signed in London.')
  event['summary']['zh']='【待译】'+event['summary']['en']
  event['detail']['en']=event['detail']['en'].replace(stale,'Signed in London.')
  event['detail']['zh']='【待译】'+event['detail']['en']
 records.append({**place,'id':event['id'],'before':old,'at':event['at'],'status':'source-backed-approximate-reference','sourceId':sid,'role':role,'historicalFootprintVerified':False})
assert len(records)==92 and {x['id'] for x in records}==set(assign)
report={'checked':'2026-10-18','resolvedThisPass':92,'remainingUnresolvedReferencePositions':0,'exactHistoricalFootprintsClaimed':0,'note':'Source-backed positions include explicitly approximate documented district/town/geographic centres. This closes missing positional evidence, not the separate question of exact event footprints. All original approximate cautions are preserved as qualified anchor notes. WW2 copies remain untouched.','records':records}
(p/'anchor-second-pass.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
if '--write' in sys.argv:
 (data/'events.json').write_text(json.dumps(events,ensure_ascii=False,indent=2)+'\n')
 (data/'sources.json').write_text(json.dumps(sources,ensure_ascii=False,indent=2)+'\n')
 audit_path=p/'content-anchor-review.json'
 audit=json.loads(audit_path.read_text())
 audit['sourceBackedReferencePoints']=103
 audit['unresolvedDraftAnchors']=0
 audit['secondPass']={'checked':'2026-10-18','resolved':92,'remaining':0,'ledger':'anchor-second-pass.json','scope':'Approximate sourced place/locality references, not exact original footprints.'}
 resolved={r['id']:r for r in records}
 for row in audit['events']:
  if row['id'] in resolved:
   row['firstPassStatus']=row['status'];row['status']='source-backed-approximate-reference'
   row['action']='Second pass sourced position and placement scope in anchor-second-pass.json.'
 audit_path.write_text(json.dumps(audit,ensure_ascii=False,indent=2)+'\n')
 print(f'Wrote {len(records)} source-backed approximate positions; {len(sources["sources"])} sources. No chapter body changed.')
else: print(f'Review ledger validated: {len(records)} positions; no event data written.')
