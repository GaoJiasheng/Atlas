"""Full source-native Pandan paired banks, including narrow upper arm/island.
Each bank guide was independently read from native scan at5/10/20px grid.
No root flood mask is input. Mouth closure is an offshore selector only.
"""
from pathlib import Path
import cv2,numpy as np,json
from scipy.ndimage import distance_transform_edt
from skimage.graph import route_through_array
D=Path(__file__).parent;im=cv2.imread(str(D/'raw/resume-source-anu1958.jpg'))[3400:5100,400:3500]
# Independently reproduce source-ink bounded wide-water components. Native
# guides below are ONLY the narrow upper arm and labelled mouth replacements.
arm=[[2380,924],[2392,917],[2405,906],[2420,898],[2435,893],[2450,892],[2465,894],[2480,898],[2492,901],[2499,900],[2500,891],[2498,883],[2498,878],[2502,873],[2507,869],[2513,866],[2517,862],[2518,858],[2515,853],[2510,848],[2505,843],[2500,839],[2493,834],[2482,835],[2470,838],[2462,837],[2457,834],[2456,827],[2450,817],[2444,808],[2440,798],[2441,791],[2444,787],[2450,783],[2460,782],[2470,783],[2476,782],[2482,784],[2488,786],[2494,792],[2498,800],[2501,809],[2502,820],[2504,830],[2509,839],[2516,844],[2524,849],[2530,853],[2531,859],[2528,863],[2520,867],[2512,872],[2507,879],[2507,886],[2509,895],[2509,903],[2506,908],[2495,909],[2480,906],[2463,903],[2447,901],[2434,902],[2420,907],[2408,915],[2397,925],[2388,931],[2381,932],[2375,929],[2380,924]]
hole=[[2450,789],[2460,787],[2473,788],[2483,790],[2490,796],[2495,807],[2497,819],[2496,825],[2484,827],[2473,830],[2467,831],[2463,829],[2459,823],[2455,816],[2450,807],[2447,800],[2447,794],[2450,789]]
mouth=[[2442,1000],[2460,999],[2478,999],[2490,1002],[2500,1005],[2512,1005],[2520,1009],[2529,1016],[2539,1021],[2548,1024],[2560,1024],[2570,1021],[2570,1024],[2515,1052],[2508,1047],[2494,1039],[2478,1031],[2463,1024],[2449,1021],[2443,1025],[2439,1034],[2439,1020],[2440,1010],[2442,1000]]
b,g,r=im.astype(float).transpose(2,0,1);blue=(b-r>5)&(g-r>0)&(r<195);dist=distance_transform_edt(~blue)
def trace(guides,name):
 # Local native ink refinement: at most4px from each independently read
 # bank; larger road-overprint gaps retain explicit visible-end guides.
 refined=[]
 for x,y in guides:
  choices=[]
  for yy in range(y-4,y+5):
   for xx in range(x-4,x+5):
    dd=(xx-x)**2+(yy-y)**2
    if dd<=16 and blue[yy,xx]:choices.append((dd,xx,yy))
  refined.append(list(min(choices)[1:])if choices else[x,y])
 # Keep water-only closure ends exact; they are selectors rather than ink.
 if name=='mouth':
  for i,p in enumerate(guides):
   if p in [[2570,1024],[2515,1052],[2439,1034],[2439,1020],[2440,1010]]:refined[i]=p
 guides=refined
 line=[guides[0]];gaps=[]
 for a,b in zip(guides,guides[1:]):
  # final offshore selector cap is straight, not asserted as shore.
  if name=='mouth' and (a==[2570,1024] or a==[2439,1034] or a==[2439,1020] or a==[2440,1010]):
   for t in np.linspace(0,1,max(abs(b[0]-a[0]),abs(b[1]-a[1]))+1)[1:]:line.append([int(round(a[0]+t*(b[0]-a[0]))),int(round(a[1]+t*(b[1]-a[1])))])
   continue
  x0=min(a[0],b[0])-4;x1=max(a[0],b[0])+5;y0=min(a[1],b[1])-4;y1=max(a[1],b[1])+5
  band=np.zeros((y1-y0,x1-x0),np.uint8);cv2.line(band,(a[0]-x0,a[1]-y0),(b[0]-x0,b[1]-y0),1,3)
  dg=distance_transform_edt(band==0);cost=1+2*dist[y0:y1,x0:x1]**2;cost[band==0]=1e9
  pp,_=route_through_array(cost,(a[1]-y0,a[0]-x0),(b[1]-y0,b[0]-x0),fully_connected=True)
  seg=[[int(x+x0),int(y+y0)]for y,x in pp];line.extend(seg[1:]);gap=max(dist[y,x]for x,y in seg)
  if gap>2 and not(name=='gridjoin'and b==guides[0]):gaps.append({'from':a,'to':b,'nativePathPixels':len(seg),'maximumDistanceVisibleBluePx':float(gap),'source':'printed label, road or faded blue bank; constrained source-guide continuation'})
 # Remove exact retraced tick/tributary pixels without replacing two banks.
 clean=[];seen={}
 for point in line:
  key=tuple(point)
  if key in seen:
   if point==guides[0]and len(clean)>20:clean.append(point);continue
   n=seen[key]+1
   for old in clean[n:]:seen.pop(tuple(old),None)
   clean=clean[:n]
  else:seen[key]=len(clean);clean.append(point)
 if clean[-1]!=clean[0]:clean.append(clean[0])
 return clean,gaps
A,gaps=trace(arm,'arm');H,hg=trace(hole,'island');M,mg=trace(mouth,'mouth')
join=[[2300,855],[2309,861],[2318,864],[2329,867],[2336,871],[2338,885],[2328,877],[2318,871],[2310,868],[2300,866],[2300,855]]
J,jg=trace(join,'gridjoin')
# Pixel barriers do not establish the tiny upper arm, so only use them for
# the five independently native-reviewed WIDE bright-water regions.
a=im[720:1700,2100:3100];bb,gg,rr=a.astype(float).transpose(2,0,1);bl=(bb-rr>5)&(gg-rr>0)&(rr<195);di=distance_transform_edt(~bl);red=(rr-gg>15)&(rr-bb>20);black=np.maximum.reduce([rr,gg,bb])<150;ink=(bl|black|(red&(di<7))).astype('uint8');ink=cv2.morphologyEx(ink,cv2.MORPH_CLOSE,np.ones((3,3),np.uint8));ink=cv2.dilate(ink,np.ones((3,3),np.uint8));_,lab,stats,_=cv2.connectedComponentsWithStats(1-ink)
wide=np.isin(lab,[74,80,103,104,115]).astype('uint8');wide=cv2.dilate(wide,np.ones((3,3),np.uint8));water=np.zeros(im.shape[:2],np.uint8);water[720:1700,2100:3100]=wide
# Printed grid crossings; use actual visible water-bank ends on each side.
for x0,x1 in [(2225,2270),(2340,2395)]:
 runs=[]
 for yy in [897,909]:
  xs=np.where(water[yy,x0:x1]>0)[0]+x0
  if len(xs):runs.append((int(xs.min()),int(xs.max())))
 if len(runs)==2:
  for yy in range(898,909):
   t=(yy-897)/12;l=round(runs[0][0]*(1-t)+runs[1][0]*t);r=round(runs[0][1]*(1-t)+runs[1][1]*t);water[yy,l:r+1]=1
runs=[]
for xx in [2312,2323]:
 ys=np.where(water[948:985,xx]>0)[0]+948
 if len(ys):runs.append((int(ys.min()),int(ys.max())))
if len(runs)==2:
 for xx in range(2313,2323):
  t=(xx-2312)/11;top=round(runs[0][0]*(1-t)+runs[1][0]*t);bottom=round(runs[0][1]*(1-t)+runs[1][1]*t);water[top:bottom+1,xx]=1
cv2.fillPoly(water,[np.asarray(A,np.int32)],1);cv2.fillPoly(water,[np.asarray(M,np.int32)],1);cv2.fillPoly(water,[np.asarray(J,np.int32)],1);cv2.fillPoly(water,[np.asarray(H,np.int32)],0)
# Fill only black printed-letter holes; preserve source central blue island.
cs,_=cv2.findContours(water,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_NONE);cv2.fillPoly(water,cs,1);cv2.fillPoly(water,[np.asarray(H,np.int32)],0)
cs,hh=cv2.findContours(water,cv2.RETR_CCOMP,cv2.CHAIN_APPROX_NONE);coords=[]
for i,c in enumerate(cs):
 if hh[0,i,3]!=-1:continue
 rings=[]
 for j,p in enumerate(cs):
  if j!=i and hh[0,j,3]!=i:continue
  if j!=i and cv2.contourArea(p)<80:continue
  q=cv2.approxPolyDP(p,.5,True)[:,0,:].tolist();q.append(q[0]);rings.append(q)
 coords.append(rings)
over=im.copy();over[water>0]=(over[water>0]*.55+np.array([255,20,200])*.45).astype('uint8')
report={'source':'G35 ANU1958','cropOffset':[400,3400],'method':'Independent native blue/red-near-blue/black barrier flood of qualified WIDE bright-water components74,80,103,104,115; source-blue centre expansion1px. Narrow upper arm separately follows fresh native paired blue-bank guides in1px corridors, with actual central upper-loop blue-enclosed dry island retained. Printed Pandan word removed from bank; visible blue ends and constrained continuation.','coordinates':coords,'mouthSelector':{'from':[2570,1024],'to':[2515,1052],'qualification':'offshore broad-water closure only, never shore'},'occlusions':gaps+hg+mg+jg,'sourceGuides':{'arm':arm,'island':hole,'mouth':mouth,'sourceBlueGridJoin':join},'counts':{'parts':len(coords),'holes':sum(len(p)-1 for p in coords),'vertices':sum(len(r)for p in coords for r in p),'sourceWaterPixels':int(water.sum())}}
(D/'resume-jurong-east-verified-pandan-water.json').write_text(json.dumps(report,indent=2)+'\n');cv2.imwrite(str(D/'work/resume-jurong-east-verified-pandan-full.png'),cv2.resize(over[760:1060,2200:2600],None,fx=3,fy=3));cv2.imwrite(str(D/'work/resume-jurong-east-verified-pandan-upper.png'),cv2.resize(over[770:940,2370:2540],None,fx=4,fy=4));cv2.imwrite(str(D/'work/resume-jurong-east-verified-pandan-word.png'),cv2.resize(over[985:1055,2400:2580],None,fx=5,fy=5));print(report['counts'],len(gaps))
