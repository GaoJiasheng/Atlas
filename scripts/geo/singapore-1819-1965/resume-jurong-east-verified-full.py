"""G35 Jurong water authoring draft: final head review FAILED.
The output retains a retraced/crossing head and is not a qualified full river.
See polish-audit.json.sourceCompleteness before using this research output.
Run after resume-jurong-east-verified.py and resume-jurong-east-verified-mask.py.
Native coordinates are relative to scan crop origin [400,3400].
"""
from pathlib import Path
import json,cv2,numpy as np
from scipy.ndimage import distance_transform_edt
from skimage.graph import route_through_array
D=Path(__file__).parent
im=cv2.imread(str(D/'raw/resume-source-anu1958.jpg'))[3400:5100,400:3500]
raw=np.asarray(json.load(open(D/'resume-jurong-east-verified.json'))['rawLine'],np.int32)
# Paired native source bank paths surround the head. Select bank cross-sections
# below the head, then close ONLY through the water between those bank ends.
a=int(np.argmin(np.linalg.norm(raw-[2014,401],axis=1)));b=int(np.argmin(np.linalg.norm(raw-[2031,386],axis=1)))
if a>b:a,b=b,a
upper=np.zeros(im.shape[:2],np.uint8);cv2.fillPoly(upper,[raw[a:b+1]],1)
water=np.zeros_like(upper)
old=json.load(open(D/'resume-jurong-east-verified-water.json'))
for part in old['coordinates']:
 cv2.fillPoly(water,[np.asarray(part[0],np.int32)],1)
# Native y390 cap had selected a disconnected source-paper strip x2046..2143.
# This strip is outside both blue banks (main water x2014..2031); remove it.
water[388:402,2037:2200]=0
water=np.maximum(water,upper)
# Source bright-water main bank, reread at native5/10px grid. Blue coastal
# outline is overprinted by the yellow road east edge y1003..1073.
left=[[2006,905],[2003,914],[1997,923],[1990,931],[1984,937],[1978,945],[1976,955],[1968,966],[1956,978],[1944,990],[1931,1000],[1923,1002],[1927,1013],[1925,1023],[1923,1035],[1924,1046],[1921,1058],[1918,1071],[1921,1087]]
right=[[2047,905],[2041,916],[2033,929],[2025,941],[2019,952],[2017,960],[2017,970],[2022,980],[2025,990],[2027,1000],[2032,1009],[2039,1016],[2047,1020],[2053,1021],[2054,1030],[2065,1030],[2076,1036],[2090,1040],[2101,1045],[2112,1055]]
bb,gg,rr=im.astype(float).transpose(2,0,1);blue=(bb-rr>5)&(gg-rr>0)&(rr<195);dist=distance_transform_edt(~blue)
def trace(guides):
 out=[guides[0]]
 for a,b in zip(guides,guides[1:]):
  x0=min(a[0],b[0])-6;x1=max(a[0],b[0])+7;y0=min(a[1],b[1])-6;y1=max(a[1],b[1])+7
  band=np.zeros((y1-y0,x1-x0),np.uint8);cv2.line(band,(a[0]-x0,a[1]-y0),(b[0]-x0,b[1]-y0),1,7)
  cost=1+3*dist[y0:y1,x0:x1]**2;cost[band==0]=1e9
  p,_=route_through_array(cost,(a[1]-y0,a[0]-x0),(b[1]-y0,b[0]-x0),fully_connected=True)
  out.extend([[int(x+x0),int(y+y0)]for y,x in p][1:])
 return out
L,R=trace(left),trace(right)
lower=np.zeros_like(water);cv2.fillPoly(lower,[np.asarray(L+R[::-1],np.int32)],1)
water[906:]=0;water=np.maximum(water,lower)
# The printed 'g' of Jurong attaches to the western blue bank; flood
# treats its bowls as land fingers. Restore native visible blue-bank span,
# including only short faded/overprinted intervals between visible ends.
wordguides=[[2069,830],[2066,832],[2062,835],[2058,839],[2053,843],[2048,847],[2043,850],[2038,853],[2033,855],[2028,857]]
wordbank=trace(wordguides)
for yy in range(830,858):
 xs=[x for x,y in wordbank if y==yy]
 if xs:
  oldxs=np.where(water[yy]>0)[0]
  if len(oldxs):water[yy,min(xs):int(oldxs.max())+1]=1
# Fill letter/coral interiors: they have NO enclosing source blue land bank.
# Explicitly retain only source-qualified head land components (blue outline).
cs,_=cv2.findContours(water,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_NONE);filled=np.zeros_like(water);cv2.fillPoly(filled,cs,1);water=filled
roi=im[90:1100,1850:2200];b,g,r=roi.astype(float).transpose(2,0,1)
ink=(((b-r>5)&(g-r>0)&(r<195))|((r-g>15)&(r-b>20))|(np.maximum.reduce([r,g,b])<150)).astype('uint8');ink=cv2.morphologyEx(ink,cv2.MORPH_CLOSE,np.ones((3,3),'uint8'));ink=cv2.dilate(ink,np.ones((3,3),'uint8'));_,lab,_,_=cv2.connectedComponentsWithStats(1-ink)
land=cv2.dilate(np.isin(lab,[14,18,23,25]).astype('uint8'),np.ones((3,3),'uint8'));water[90:1100,1850:2200][land>0]=0
# No source-paper hairlines may survive the water-only selection cap.
water[388:395,2040:2200]=0
cs,h=cv2.findContours(water,cv2.RETR_CCOMP,cv2.CHAIN_APPROX_NONE);parts=[]
for i,c in enumerate(cs):
 if h[0,i,3]!=-1:continue
 rings=[]
 for j,p in enumerate(cs):
  if j!=i and h[0,j,3]!=i:continue
  if j!=i and cv2.contourArea(p)<80:continue
  ring=cv2.approxPolyDP(p,.5,True)[:,0,:].tolist();ring.append(ring[0]);rings.append(ring)
 parts.append(rings)
report={'reviewStatus':'unqualified-upper-channel','remaining':'Final 2026-11-09 source inspection found one crossing/retraced ring and collapsed paired-bank reaches; see polish-audit.json.sourceCompleteness. Export validity is not source completeness.','source':'G35 ANU1958','cropOffset':[400,3400],'method':'Source-native paired blue-bank paths at head and lower river, barrier-flood selected bright-water middle. Blue road-water interface followed where mapped yellow coastal road overprints lower western bank. Brown coral and black lettering are water, never land islands; only four explicitly blue-enclosed head land components retained. Native contours DP0.5px.','qualification':'Mouth [1921,1087] to [2112,1055] is offshore water selector closure only, never a bank. y390 paper cap artifact x2046..2143 removed because outside actual blue-bank cross-section x2014..2031.','coordinates':parts,'counts':{'parts':len(parts),'vertices':sum(len(r)for p in parts for r in p),'holes':sum(len(p)-1 for p in parts),'sourceWaterPixels':int(water.sum())},'occlusions':old['occlusions']+[{'source':'yellow road overprint of blue coastal bank','from':[1923,1002],'to':[1918,1071],'lengthNativePx':len([p for p in L if 1002<=p[1]<=1071]),'method':'visible seaward road-water interface and adjacent blue bank, constrained native3px corridor; no invented channel width'}],'letterBankOcclusion':{'source':'printed g of Jurong attached to western bank','guides':wordguides,'nativeBankLine':wordbank,'method':'native blue-visible ends and constrained source-blue continuation; letter bowls not land'},'lowerBankGuides':{'left':left,'right':right},'lowerBanks':{'left':L,'right':R}}
(D/'resume-jurong-east-verified-full-water.json').write_text(json.dumps(report,indent=2)+'\n');cv2.imwrite(str(D/'work/resume-jurong-east-verified-full-mask.png'),water*255)
out=im.copy();out[water>0]=(out[water>0]*.55+np.array([255,20,200])*.45).astype('uint8');cv2.imwrite(str(D/'work/resume-jurong-east-verified-full-water.png'),cv2.resize(out[70:1110,1840:2200],None,fx=1.5,fy=1.5));cv2.imwrite(str(D/'work/resume-jurong-east-verified-lower-qualified.png'),cv2.resize(out[890:1100,1890:2130],None,fx=3,fy=3));print(report['counts'])
