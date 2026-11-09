"""Native G35 paired-bank Tengeh/Blutang source water, no inherited masks.
Source-frame caps at native x80/y30 are WATER SELECTORS, not bank.
"""
from pathlib import Path
import cv2,numpy as np,json
from scipy.ndimage import distance_transform_edt
from skimage.graph import route_through_array
D=Path(__file__).parent;im=cv2.imread(str(D/'raw/resume-source-anu1958.jpg'))[3400:5100,400:3500]
x0,y0,x1,y1=80,30,780,660;a=im[y0:y1,x0:x1];b,g,r=a.astype(float).transpose(2,0,1)
blue=(b-r>5)&(g-r>0)&(r<195);red=(r-g>15)&(r-b>20);black=np.maximum.reduce([r,g,b])<150;dist=distance_transform_edt(~blue);ink=(blue|black|(red&(dist<7))).astype('uint8');ink=cv2.morphologyEx(ink,cv2.MORPH_CLOSE,np.ones((3,3),np.uint8));ink=cv2.dilate(ink,np.ones((3,3),np.uint8));_,lab,stats,_=cv2.connectedComponentsWithStats(1-ink)
selected=[1];water=np.zeros(im.shape[:2],np.uint8);water[y0:y1,x0:x1]=cv2.dilate(np.isin(lab,selected).astype('uint8'),np.ones((3,3),np.uint8));occlusions=[]
# Independently observed paired-bank bright-water continuation. Raw ink is
# deliberately not dilated here: source banks are only2px apart in places.
nx0,ny0,nx1,ny1=470,390,650,540;aa=im[ny0:ny1,nx0:nx1];bb,gg,rr=aa.astype(float).transpose(2,0,1);bl=(bb-rr>4)&(gg-rr>0)&(rr<205);di=distance_transform_edt(~bl);re=(rr-gg>15)&(rr-bb>20);bk=np.maximum.reduce([rr,gg,bb])<150;ii=(bl|bk|(re&(di<5))).astype('uint8');_,ll,ss,_=cv2.connectedComponentsWithStats(1-ii)
# These are native-white channel interiors, not arbitrary-width guide buffers.
small=[];narrow=cv2.dilate(np.isin(ll,small).astype('uint8'),np.ones((3,3),np.uint8));water[ny0:ny1,nx0:nx1]=np.maximum(water[ny0:ny1,nx0:nx1],narrow)
# Fresh native10px source-blue paired-bank core, rather than interpolating
# through the long vertical source-grid overprint that coincides with a bank.
fullb,fullg,fullr=im.astype(float).transpose(2,0,1);fullblue=(fullb-fullr>4)&(fullg-fullr>0)&(fullr<205);bd=distance_transform_edt(~fullblue)
def trace(guides,label):
 refined=[]
 for x,y in guides:
  choices=[]
  for yy in range(y-4,y+5):
   for xx in range(x-4,x+5):
    ds=(xx-x)**2+(yy-y)**2
    if ds<=16 and fullblue[yy,xx]:choices.append((ds,xx,yy))
  refined.append(list(min(choices)[1:])if choices else[x,y])
 line=[refined[0]]
 for a,b in zip(refined,refined[1:]):
  x0=min(a[0],b[0])-4;x1=max(a[0],b[0])+5;y0=min(a[1],b[1])-4;y1=max(a[1],b[1])+5
  band=np.zeros((y1-y0,x1-x0),np.uint8);cv2.line(band,(a[0]-x0,a[1]-y0),(b[0]-x0,b[1]-y0),1,3)
  cost=1+2*bd[y0:y1,x0:x1]**2;cost[band==0]=1e9
  pp,_=route_through_array(cost,(a[1]-y0,a[0]-x0),(b[1]-y0,b[0]-x0),fully_connected=True);seg=[[int(x+x0),int(y+y0)]for y,x in pp];line.extend(seg[1:]);gap=max(bd[y,x]for x,y in seg)
  if gap>2 and not(a==refined[-2] and b==refined[0] and label=='faded/printed source-grid native core bank'):occlusions.append({'source':label,'from':a,'to':b,'nativePathPixels':len(seg),'maxDistanceToVisibleBluePx':float(gap)})
 return line
core=[[415,290],[435,280],[446,278],[450,279],[455,285],[465,289],[475,289],[471,300],[470,307],[474,321],[475,332],[480,342],[488,349],[496,349],[501,344],[500,350],[492,356],[488,361],[485,367],[476,371],[469,377],[456,380],[440,381],[430,382],[426,387],[425,391],[432,398],[442,404],[450,408],[451,421],[452,436],[453,445],[459,451],[466,451],[478,444],[487,437],[498,429],[500,438],[490,447],[486,455],[480,461],[469,465],[457,464],[448,458],[443,450],[441,438],[440,426],[440,418],[432,412],[426,407],[420,400],[416,392],[417,383],[422,376],[432,371],[445,369],[458,368],[465,363],[468,359],[467,350],[460,338],[457,330],[455,316],[451,305],[445,299],[435,296],[425,298],[415,305],[415,290]]
C=trace(core,'faded/printed source-grid native core bank');cv2.fillPoly(water,[np.asarray(C,np.int32)],1)
# Printed Tengeh 'g/e/h' attaches to the east bank; do not export glyph bowls.
word=[[337,211],[334,218],[335,223],[334,227],[331,233],[330,241],[330,246],[328,251],[325,257],[325,262],[326,268],[327,273],[328,278],[331,284],[336,288],[342,293],[348,296],[355,298]]
W=trace(word,'printed Tengeh label over east bank')
for yy in range(225,294):
 xs=[x for x,y in W if y==yy]
 if not xs:continue
 bank=max(xs);old=np.where(water[yy,298:bank+1]>0)[0]+298
 if len(old):water[yy,int(old.min()):bank+1]=1
 water[yy,bank+1:bank+9]=0
# Local native-blue printed junctions: close only blue ink between qualified
# bright-water component ends, never pale dry land. One native pixel radius.
fullb,fullg,fullr=im.astype(float).transpose(2,0,1);fullblue=(fullb-fullr>4)&(fullg-fullr>0)&(fullr<205)
closed=cv2.morphologyEx(water,cv2.MORPH_CLOSE,np.ones((3,3),np.uint8));join=(closed>water)&fullblue;water[join]=1
# The already reviewed G35 native blue coast at Tg Terih corrects tiny
# red-grid/label fingers in the sea flood. This is the same 1958 source,
# never G15/modern data; replace only north of the Tengeh paired-bank mouth.
shore=json.load(open(D/'resume-jurong-west-final.json'))['denseLine'];stop=min(range(len(shore)),key=lambda i:(shore[i][0]-349)**2+(shore[i][1]-201)**2);coast=shore[:stop+1];coastmask=np.zeros_like(water);cv2.fillPoly(coastmask,[np.asarray(coast+[[80,201],[80,30],coast[0]],np.int32)],1);water[30:196,80:350]=coastmask[30:196,80:350]
# Whole-sea barrier draft still copies Blutang coastal lettering; it is NOT
# qualified as a new coast. Retain context evidence only, then limit the
# certified comparison to the independently checked Tengeh paired-bank core.
context=im.copy();context[water>0]=(context[water>0]*.55+np.array([255,20,200])*.45).astype('uint8');cv2.imwrite(str(D/'work/resume-west-inlet-sea-draft-NOT-QUALIFIED.png'),cv2.resize(context[20:530,80:660],None,fx=2,fy=2))
clip=np.zeros_like(water);clip[195:470,275:506]=water[195:470,275:506];water=clip
# Tiny x275/y430 fragment belongs to a different Blutang tributary cut by
# the comparison frame, not the qualified Tengeh inlet. Keep the connected
# component containing the verified main-channel cyan seed[470,350].
_,qualified=cv2.connectedComponents(water);water=(qualified==qualified[350,470]).astype('uint8')
# Text bowls and brown coral do not enclose source blue dry-land islands in
# this selected inlet. Fill those apparent holes, not unrelated land regions.
cs,_=cv2.findContours(water,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_NONE);filled=np.zeros_like(water);cv2.fillPoly(filled,cs,1);water=filled
cs,h=cv2.findContours(water,cv2.RETR_CCOMP,cv2.CHAIN_APPROX_NONE);parts=[]
for i,c in enumerate(cs):
 if h[0,i,3]!=-1:continue
 q=cv2.approxPolyDP(c,.5,True)[:,0,:].tolist();q.append(q[0]);parts.append([q])
report={'source':'G35 ANU1958 original scan','cropOffset':[400,3400],'method':'Independent native blue+black+red-near-blue barrier flood of source-qualified sea/main-inlet component1; source-ink centre expansion1px. Main paired-bank S-loop independently follows source native10px blue guides refined <=4px and narrow1px corridors, replacing the printed-grid barrier cap. Tengeh glyph attachment replaced by native visible blue bank. Native0.5pxDP. No G15, modern URA or composite geometry used.','sourceLimits':'Qualified comparison is Tengeh main paired-bank core only, clipped to native[275,195,506,470]. Top y195 and left x275 cross actual mouth water and are selector caps, never bank. Main paired S-loop through nativey465, with upstream water-only selection cap approximately[498,429]–[500,438]. Never stroke any cap or publish an upstream dead end. Narrow eastern continuation beyondx500 has disconnected white-water patches under opaque blue ink and is NOT qualified. Whole-sea/Blutang coastal draft has attached-letter artifacts and is explicitly NOT qualified or included in this JSON.','coordinates':parts,'occlusions':occlusions,'qualificationSeed':[470,350],'excludedSourceFragment':'Disconnected Blutang tributary fragment intersected by x275 comparison frame; excluded because outside qualified Tengeh main-channel scope, not by numeric area pruning.','counts':{'parts':len(parts),'vertices':sum(len(r)for p in parts for r in p),'sourceWaterPixels':int(water.sum())},'status':'SOURCE_CORE_REVIEWED_COMPARISON_ONLY','integrationQualification':'No certified northern G35/G15 coast crossing supplied. Keep current independently dated source splice; do not adopt this whole-frame mask without dry-land splice and continuation-water qualification. This is source comparison/optional qualified lower-water subtraction only, not a replacement full western coastline.','waterOnlyCaps':[[[275,195],[350,195]],[[275,195],[275,230]],[[498,429],[500,438]]],'sourceBankGuides':{'core':core,'TengehWord':word},'reviewedSourceCoast':'Same-G35 native blue shore from resume-jurong-west-final.json, northern portion y30..195 only, replaces source-letter/red-grid fingers; no data from another map.'}
# Export only actual source-bank arcs, omitting all image/water selector caps.
main=max(cs,key=cv2.contourArea)[:,0,:].tolist();arcs=[];run=[]
def cap(p):
 x,y=p
 return x<=276 or y<=196 or (x>=493 and 423<=y<=446)
for i,a in enumerate(main):
 b=main[(i+1)%len(main)]
 if not cap(a)and not cap(b):
  if not run:run=[a]
  run.append(b)
 elif run:
  if len(run)>3:arcs.append(cv2.approxPolyDP(np.asarray(run,np.int32),.5,False)[:,0,:].tolist())
  run=[]
if len(run)>3:arcs.append(cv2.approxPolyDP(np.asarray(run,np.int32),.5,False)[:,0,:].tolist())
banks={'source':'G35 ANU1958','cropOffset':[400,3400],'status':'SOURCE_BANK_ARCS_REVIEWED_LIMITED_COMPARISON','arcs':arcs,'counts':{'arcs':len(arcs),'vertices':sum(len(a)for a in arcs)},'limits':'All x275/y195 comparison-selection caps and upstream water-only cap near[498,429]–[500,438] omitted. Do not join arcs with a coast connector. No qualified north-of-inlet G15/G35 splice supplied.'};(D/'resume-west-inlet-bank-arcs.json').write_text(json.dumps(banks,indent=2)+'\n')
(D/'resume-west-inlet-water.json').write_text(json.dumps(report,indent=2)+'\n');cv2.imwrite(str(D/'work/resume-west-inlet-water-mask.png'),water*255);out=im.copy();out[water>0]=(out[water>0]*.55+np.array([255,20,200])*.45).astype('uint8');cv2.imwrite(str(D/'work/resume-west-inlet-water-overlay.png'),cv2.resize(out[185:480,265:515],None,fx=2,fy=2));cv2.imwrite(str(D/'work/resume-west-inlet-main-label.png'),cv2.resize(out[190:340,275:450],None,fx=5,fy=5));cv2.imwrite(str(D/'work/resume-west-inlet-head.png'),cv2.resize(out[390:490,460:610],None,fx=6,fy=6));bankim=im.copy();cv2.polylines(bankim,[np.asarray(a,np.int32)for a in arcs],False,(255,0,255),1);cv2.imwrite(str(D/'work/resume-west-inlet-banks-overlay.png'),cv2.resize(bankim[185:480,265:515],None,fx=2,fy=2));print(report['counts'],banks['counts'])
