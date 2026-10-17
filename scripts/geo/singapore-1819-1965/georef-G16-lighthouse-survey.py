"""Independent native-chart lighthouse inspection receipts; no fit/trace mutation.
Pixel readings below were read from named historical light stars in native crops,
not computed from modern longitude/latitude or from a georeferencing model.
"""
from pathlib import Path
import json,hashlib,requests
from PIL import Image
D=Path(__file__).resolve().parent;W=D/'work';R=D/'raw'
Image.MAX_IMAGE_PIXELS=None
im=Image.open(R/'G16.jpg')
H={'User-Agent':'TimeSceneHistoricalResearch/1.0 (Atlas local educational source audit; research@example.org)'}
urls={
 'mpa-positions':'https://www.mpa.gov.sg/port-marine-ops/arrivals-and-departures/vessels-arriving-in-singapore',
 'raffles-history':'https://www.mpa.gov.sg/media-centre/details/mpa-launches-regular-guided-tours-to-raffles-lighthouse',
 'horsburgh-history':'https://www.mfa.gov.sg/about-mfa/key-issues/pedra-branca/',
 'sultan-history':'https://www.mpa.gov.sg/media-centre/details/mpa30-exhibition-invites-singaporeans-to-reimagine-the-future-of-maritime-singapore',
 'canning-replica':'https://www.mpa.gov.sg/media-centre/details/launch-of-the-singapore-maritime-trails-and-maritime-corner%40fort-canning',
}
receipts=[]
for key,url in urls.items():
 path=R/f'G16-lighthouse-{key}.html'
 if not path.exists():
  response=requests.get(url,headers=H,timeout=45)
  if response.status_code==429:raise SystemExit('429; no retry')
  response.raise_for_status();path.write_text(response.text)
 receipts.append({'id':key,'url':url,'file':str(path.relative_to(D)),'sha256':hashlib.sha256(path.read_bytes()).hexdigest()})
def pos(latmin,lonmin,londeg=103):return [londeg+lonmin/60,1+latmin/60]
rows=[
 {'id':'sultan-shoal','name':'Sultan Shoal Lighthouse','svg':[7024,8277],'lnglat':pos(14.377,38.884),'coordinateText':"01°14.377'N 103°38.884'E",'mapLabel':'Sultan Shoal; Gp.Fl.(2) ev.15sec.60ft13M','cropBox':[6800,8000,7400,8600],'reading':'Hollow centre of black five-point light star at the northwest end of the dotted Sultan Shoal islet, at the base of the magenta flash. Not the separate southeastern unlabelled flashing light.','identityEvidence':[{'ref':'mpa-positions','read':'The current named Sultan Shoal Lt is an official reporting reference with the precise coordinates copied here.'},{'ref':'sultan-history','read':'MPA describes Sultan Shoal Lighthouse as a longstanding historic landmark off Tuas and offers tours to the standing light. The chart explicitly names the same shoal light.'}],'status':'named-fixed-light-candidate','caveat':'Same named standing offshore lighthouse, whose flash character has changed. The map symbol generalisation and any historical/current datum offset remain separate from tower identity.'},
 {'id':'raffles','name':'Raffles Lighthouse (Pulau Satumu)','svg':[8970,9940],'lnglat':pos(9.606,44.450),'coordinateText':"01°09.606'N 103°44.450'E",'mapLabel':'Raffles; Gp.Fl.(3) ev.10sec.105ft16M','cropBox':[8600,9650,9300,10300],'reading':'Hollow centre of black lighthouse star at the southern end of the small island, southwest of the text Raffles and at the base of the magenta flash. Not the islands labelled P.Biola or P.Senang to its north.','identityEvidence':[{'ref':'mpa-positions','read':'Official current Raffles Lt reporting reference has the precise coordinates copied here.'},{'ref':'raffles-history','read':'MPA identifies the standing Raffles Lighthouse on Pulau Satumu as built in 1855, confirming a fixed tower dating before the chart and still operating.'}],'status':'named-fixed-light-candidate','caveat':'Light apparatus/flash characteristic changed, but tower identity and island are independently named. No coastline vertex or island centroid is used.'},
 {'id':'horsburgh','name':'Horsburgh Lighthouse (Pedra Branca)','svg':[22923,6343],'lnglat':pos(19.814,24.337,104),'coordinateText':"01°19.814'N 104°24.337'E",'mapLabel':'Horsburgh; Fl.ev.10sec.101ft16M','cropBox':[22500,6000,23200,6650],'reading':'Black star at the base of the magenta flash immediately right of the Horsburgh label on the northernmost of the Pedra Branca rocks. Not the separate +high rock or Middle Rocks to its south.','identityEvidence':[{'ref':'mpa-positions','read':'Official current Horsburgh Lt reporting reference has the precise coordinates copied here.'},{'ref':'horsburgh-history','read':'MFA identifies Horsburgh Lighthouse as the oldest structure still present on Pedra Branca, built between 1847 and 1851.'}],'status':'named-fixed-light-candidate','caveat':'Independently read from the printed named symbol. It happens to coincide within a few pixels with anonymous Warper point6; that anonymous point was not used to derive this reading.'},
]
for row in rows:
 box=row['cropBox'];out=W/f'G16-lighthouse-{row["id"]}-native.png';crop=im.crop(tuple(box));crop.save(out)
 # Crosshair beside the point, leaving the symbol centre visible; plate coordinates are native offsets.
 from PIL import ImageDraw
 overlay=crop.convert('RGB');draw=ImageDraw.Draw(overlay);x=row['svg'][0]-box[0];y=row['svg'][1]-box[1]
 draw.line((x-35,y,x-12,y),fill='red',width=1);draw.line((x+12,y,x+35,y),fill='red',width=1);draw.line((x,y-35,x,y-12),fill='red',width=1);draw.line((x,y+12,x,y+35),fill='red',width=1)
 overlay.resize((overlay.width*2,overlay.height*2)).save(W/f'G16-lighthouse-{row["id"]}-read.png')
 row.update({'mapsrcpixel':{'map':'G16','file':'raw/G16.jpg','nativeDimensions':list(im.size),'pixel':row['svg'],'convention':'x right, y down, from original top-left; no rotation or crop coordinates substituted','readUncertaintyPx':3,'crop':str(out.relative_to(D)),'cropBox':box,'cropPoint':[x,y]},'coordinateSource':urls['mpa-positions'],'coordinateSourceType':'Official MPA current named aid-to-navigation reporting position; converted degrees + decimal minutes directly to decimal degrees; registration-only point','readMethod':'Direct visual inspection of native named light symbol; no inverse-model prediction, graticule interpolation, residual minimisation or CP fitting used to choose the pixel.'})
out={'checked':'2026-10-18','map':'G16','mapFile':'raw/G16.jpg','mapTitle':'Admiralty Chart No.2403 Singapore Strait, published1936, small corrections through1954','method':'Independent named-lighthouse native-pixel audit. Three stars are paired with independently published current MPA named-light positions. Candidate list does not modify the active georeferencing model and does not claim residual acceptance. Pixel locations were read visually before modern-coordinate pairing. The original map may have datum/position generalisation errors.','controlPoints':rows,'sources':receipts,'excluded':[{'name':'Fort Canning Lighthouse','chartSymbolPixel':[11196,7144],'reason':'The chart explicitly marks the original Fort Canning light. Modern park lighthouse is a replica. MPA identifies adoption of the replica from NParks; no independent exact original-tower coordinate was found. Do not use modern replica P625 as a surviving original tower CP.','source':urls['canning-replica']},{'name':'Pulau Iyu Kecil / The Brothers','chartSymbolPixel':[790,9298],'reason':'Native chart clearly labels The Brothers light, but the present station has a replacement tower of unknown date/location continuity. MPA current arrivals page also gives two slightly different Iyu coordinates (11.479 and11.466 minutesN). Named candidate for further qualification only; not added as a surviving fixed-tower CP.','source':urls['mpa-positions']},{'name':'Fullerton Lighthouse','reason':'Installed after the1954 correction date; cannot be a1936/1954 chart light CP.'},{'name':'Bedok Lighthouse','reason':'Modern rooftop light postdates the chart; cannot substitute for Fort Canning or another original chart light.'}],'acceptance':'Only the three named-fixed-light candidates above are proposed. They still require combined projection:auto and LOO evaluation by the coast agent. No point may be kept or discarded solely to force residual budgets.'}
(D/'georef-G16-lighthouse-candidates.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');print('Wrote',len(rows),'independently named lighthouse candidates')
