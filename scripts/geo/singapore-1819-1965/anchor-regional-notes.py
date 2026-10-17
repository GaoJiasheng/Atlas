"""Build sourced regional point notes from cached, individually read P625 receipts."""
import json,hashlib
from pathlib import Path
DIR=Path(__file__).resolve().parent
items=json.loads((DIR/'work'/'anchor-regional-candidates.json').read_text())
roles={
'johor-lama':(['site-johor-lama'],'Documented representative point of Johor Lama mukim, used as the regional place centre. This is not a survey of the 1540 fort or former palace footprint.'),
'daik':(['site-lingga-daik','mahmud-iii-dies'],'Documented representative point of Daik, used as the town/subdistrict centre. It does not identify the former royal compound or the location of a ruler’s death.'),
'george-town':(['site-penang'],'Documented representative point of George Town, used as the port-city centre. It does not mark the exact 1786 landing or all of Penang island. The preferred-rank P625 is selected; a second normal-rank GNS point is retained in the receipt.'),
'malacca':(['site-malacca','malacca-handover'],'Documented representative point of Malacca City, used as its city centre. It does not mark a specific 1511 battle site or the precise 1825 handover ceremony.'),
'naning':(['naning-war'],'Documented representative point of the Naning district/former chiefdom, used as the district centre for a conflict known only at district scale. P625 has no separate references on this item; the point is a Wikidata locality reference, not a surveyed centroid or a claimed battlefield.'),
'victoria-hong-kong':(['hong-kong-1841'],'Documented representative point of Victoria, the historical city on Hong Kong Island. It is a historical-city centre reference, not the exact 1841 occupation/flag-raising site.'),
'port-said':(['suez-1869'],'Documented representative point of Port Said, used as the northern-port city centre for the canal opening. The published ceremony account places the inauguration at Port Said; this point does not locate the official stand or a ship’s track.'),
'pangkor':(['pangkor-1874'],'Documented representative point of Pangkor Island, used as the island centre. The agreement was signed aboard ship in the Pangkor area; this point does not claim the ship’s exact anchorage.'),
'pasir-salak':(['perak-war'],'Documented representative point of Pasir Salak, used as its locality centre for the Perak conflict. It does not mark Birch’s exact killing site or the extent of the wider war.'),
'kuala-lumpur':(['fms-1896','malayan-union','federation-1948','merdeka-1957'],'Documented representative point of Kuala Lumpur, used as the administrative city centre for changes affecting Malaya. It does not locate a particular agreement room, proclamation ceremony or Stadium Merdeka.'),
'istana-besar':(['umno-founded'],'Wikidata point for Istana Besar, Johor Bahru. UMNO’s institutional history identifies this palace as the venue where the constitution was adopted and the organisation formally founded on 11 May 1946. The point identifies the palace, not the precise meeting room.'),
'victoria-labuan':(['labuan-to-ss'],'Documented representative point of Victoria, Labuan, used as the town centre for Labuan’s administrative transfer. It does not claim an exact handover venue or all of the island.'),
'bangkok':(['anglo-siamese-treaty'],'Documented representative point of Bangkok, used as the city centre for the treaty/ratification narrative. It does not locate the exact diplomatic building or the four transferred states.'),
'lumut':(['dindings-to-perak'],'Documented representative point of Lumut, used as the mainland Dindings locality centre. It is an approximate event reference and is not a boundary, polygon centroid or claim about the exact 1935 handover ceremony.'),
'alor-setar':(['four-states-to-thailand'],'Documented representative point of Alor Setar, used as the capital-city centre of Kedah for the four-state transfer. This regional anchor does not imply that all four states or the transfer ceremony occupied a single point.'),
'bahau':(['bahau-settlement'],'Documented representative point of Bahau, used as the town/subdistrict centre. NLB explicitly places the wartime Catholic settlement about five miles from Bahau town centre; this point is a regional reference and must not be represented as the settlement footprint.'),
'endau':(['endau-settlement'],'Documented representative point of Endau, Johor, used as the town centre. NLB identifies the Chinese resettlement scheme with Endau; this reference does not locate the original agricultural settlement footprint.'),
'bandar-seri-begawan':(['brunei-revolt'],'Documented representative point of Bandar Seri Begawan (then Brunei Town), used as the city centre for the revolt. It does not locate a particular police station, clash or individual casualty.'),
'kuching':([], 'Documented representative point of Kuching, used as its city centre when a Sarawak-wide event needs a regional reference. The deprecated former P625 is rejected; the current normal-rank statement is retained. This does not locate a specific historical ceremony.'),
'jakarta':(['konfrontasi-begins'],'Documented representative point of Jakarta, used as the capital-city centre for the Indonesian political announcement. It does not locate the precise announcement venue or military incursions in Borneo.'),
'london':(['anglo-dutch-treaty','johor-treaty-1885','malaysia-agreement'],'Documented representative point of London, used as the city centre for agreements described by the event evidence as signed in London. It is not the precise treaty-signing building. In particular, the 1885 Johor treaty and 1963 Malaysia Agreement should not be anchored to Johor Bahru/Singapore as if those were their signing locations.'),
}
extra={
'port-said': [{'url':'https://www.napoleon.org/wp-content/themes/napoleon/annexes/hors-serie/suez/en/html-content/inauguration/ceremonie/ceremonie2.html','title':'Official Journal of the French Empire, 29 November 1869, no. 328 p. 1527, reproduced/translated by Fondation Napoléon','read':'Read the ceremony passage: Port Said was prepared for the canal blessing; official platforms were on the opposite bank from the quay. This confirms Port Said as the opening locality but provides no surveyed platform coordinate.'}],
'istana-besar':[{'url':'https://umno-online.my/sejarah/penubuhan/','title':'UMNO Online, Penubuhan UMNO','read':'Read the institutional founding account: the 11 May 1946 congress and first general assembly met at Istana Besar Johor Bahru, adopted the constitution and formally founded UMNO.'}],
'bahau':[{'url':'https://biblioasia.nlb.gov.sg/all-sections/vol-12-issue-2-jul-sep-2016-bahau/','title':'Fiona Hodgkins, Bahau: A Utopia That Went Awry, BiblioAsia, 7 July 2016','read':'Read Where is Bahau? and Life in Bahau: the wartime settlement was about five miles from town centre and settlers completed the journey on foot. The Bahau locality coordinate is therefore explicitly a town-centre reference.'}],
'endau':[{'url':'https://biblioasia.nlb.gov.sg/all-sections/vol-15-issue-1-apr-jun-2019-wartime-victuals/','title':'Wartime Victuals: Surviving the Japanese Occupation, BiblioAsia, April–June 2019','read':'Read the resettlement section and caption: farming communities were established in Endau, Johor, and Bahau, Negeri Sembilan; the Chinese settlement in Endau is identified. No exact surveyed settlement footprint is supplied.'}],
}
notes=[]
for row in items:
 key=row['id'];events,role=roles[key]
 claims=[c for c in row['coordinates'] if c['rank']!='deprecated' and c.get('value')]
 claims.sort(key=lambda c:c['rank']!='preferred')
 claim=claims[0];value=claim['value'];qid=row['qid'];rev=row['lastrevid'];point=[value['longitude'],value['latitude']]
 path=DIR/'raw'/'anchor-regional'/(row['requestedQid']+'.json')
 refs=[]
 for ref in claim.get('references',[]):
  for prop,snaks in ref.get('snaks',{}).items():
   for snak in snaks:
    val=snak.get('datavalue',{}).get('value')
    refs.append({'property':prop,'value':val})
 source=f'https://www.wikidata.org/w/index.php?title={qid}&oldid={rev}'
 note=f'Approximate map anchor: {role} Coordinate source: Wikidata {qid}, P625 statement {claim["id"]}, revision {rev}; [longitude, latitude] {point}. Wikidata structured data is CC0. The historical footprint remains approximate.'
 notes.append({'id':key,'events':events,'place':row['label'],'description':row['description'],'at':point,'approximate':True,'role':role,'qid':qid,'property':'P625','statement':claim['id'],'rank':claim['rank'],'precisionDegrees':value.get('precision'),'globe':value.get('globe'),'revision':rev,'modified':row.get('modified'),'url':f'https://www.wikidata.org/wiki/{qid}','revisionUrl':source,'entityDataUrl':f'https://www.wikidata.org/wiki/Special:EntityData/{row["requestedQid"]}.json','receipt':str(path.relative_to(DIR)),'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'read':'Read the full cached entity JSON; verified English identity/description and all P625 statements; selected preferred rank if present, otherwise current non-deprecated normal rank. References are reproduced below as a statement audit, not independently read sources.','coordinateClaimReferences':refs,'otherCoordinateStatements':[c for c in row['coordinates'] if c['id']!=claim['id']],'supplementaryEvidence':extra.get(key,[]),'sourceNote':note})
out={'checked':'2026-10-18','method':'Wikipedia HTML used only to discover main Wikidata identity; each canonical entity and its exact P625 statement read from Special:EntityData JSON without search APIs or retrying rate limits. Coordinates are exact copies of the selected structured statement, in longitude/latitude order. Current localities serve as documented place-centre references where only district/city-scale location is established; they do not establish exact historical footprints. Existing event approximate flags must remain.','licence':'Wikidata structured data CC0. Supplementary text is cited/paraphrased only. No source images or other geometry reproduced.','count':len(notes),'places':notes}
(DIR/'anchor-regional-places.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
print('Wrote',len(notes),'source-backed regional references')
