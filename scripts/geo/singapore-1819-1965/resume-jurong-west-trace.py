"""Trace the 1958 survey's blue mainland shore, never the brown coral symbol.
All coordinates are native pixels within original crop [400,3400,3500,5100].
Closely reviewed guide corridors constrain a dense least-cost path to blue ink.
"""
from pathlib import Path
import json
import cv2
import numpy as np
from scipy.ndimage import distance_transform_edt
from skimage.graph import route_through_array
D=Path(__file__).parent
im=cv2.imread(str(D/'raw/resume-source-anu1958.jpg'))[3400:5100,400:3500]
b,g,r=im.astype(float).transpose(2,0,1)
blue=(b-r>8)&(g-r>0)&(r<180)
distance=distance_transform_edt(~blue)
guides=[
[239,0],[248,28],[251,43],[261,56],[273,83],[274,94],[289,105],[295,126],[298,142],[294,155],[285,166],
[304,163],[324,163],[331,179],[341,195],[351,201],[361,197],[368,187],[372,177],[365,183],[353,195],[337,206],[322,219],[310,235],[306,246],[297,230],[285,226],[267,225],[248,221],[229,219],[214,214],[199,203],[198,207],[212,217],[213,231],[201,241],[184,247],[177,250],[180,259],[175,264],[165,256],[150,255],[136,257],[122,257],[116,265],[116,274],[127,279],[144,282],[157,283],[167,288],[180,286],[190,294],[195,305],[195,320],[206,326],[213,334],[219,333],[220,345],[229,352],[231,361],[241,368],[251,366],[252,372],[246,381],[246,393],[248,408],[244,418],[236,425],[235,432],[224,435],[211,434],[195,427],[181,422],[163,419],[145,413],[134,405],[122,405],[111,414],[104,419],[93,420],[84,432],[80,446],[70,456],[70,464],[88,469],[95,481],[95,493],[88,505],[79,515],[74,530],[77,536],[87,537],[88,541],[78,543],[72,551],[76,560],[78,579],[87,591],[103,603],[118,613],[127,623],[140,620],[150,613],[155,602],[150,590],[145,581],[143,583],[143,594],[144,609],[141,618],[146,630],[149,643],[149,661],[155,678],[162,686],[172,687],[178,682],[183,686],[181,695],[185,699],[196,701],[204,710],[214,717],[222,722],[231,723],[240,728],[237,733],[225,733],[223,739],[226,745],[236,748],[236,755],[231,762],[237,770],[246,774],[248,783],[246,793],[253,804],[261,810],[274,810],[275,817],[267,823],[267,837],[272,850],[281,860],[296,864],[303,872],[305,885],[312,893],[323,891],[327,879],[328,867],[341,862],[365,859],[389,861],[414,866],[435,875],[448,877],
# Tuas tidal inlet: source banks bend north through the road-overprinted mouth.
[453,866],[452,855],[447,848],[446,841],[455,837],[467,841],[481,837],[481,829],[475,823],[468,814],[467,804],[473,799],[478,806],[483,813],[489,809],[491,796],[498,793],[510,796],[526,793],[542,792],[549,796],[550,808],[555,819],[564,828],[569,842],[578,852],[584,863],[591,875],[596,884],[610,890],
# Opposite bank of the same inlet is the line returning west under the road.
[595,887],[581,873],[572,855],[565,839],[553,824],[548,811],[543,800],[528,799],[510,801],[501,803],[497,814],[491,828],[483,838],[472,844],[460,846],[453,851],[462,860],[462,875],[471,882],[487,886],
[501,903],[510,921],[522,936],[534,949],[542,962],[550,976],[545,984],[535,988],[530,995],[538,1000],[551,1000],[563,1006],[574,1020],[578,1033],[572,1047],[561,1055],[559,1069],[561,1085],[563,1100],[558,1116],[550,1128],[539,1137],[531,1144],[531,1149],[546,1146],[566,1146],[580,1149],[591,1154],[599,1162],[600,1177],[598,1192],[601,1205],[609,1218],[619,1230],[633,1243],[647,1259],[662,1275],[670,1294],[678,1300],[697,1300],[715,1301],[732,1287]
]
# Source-native guides are retained for the evidence overlay.
snapped=[]
for x,y in guides:
 x,y=int(x),int(y);y=max(0,min(y,im.shape[0]-1));x=max(0,min(x,im.shape[1]-1))
 y0,y1=max(0,y-35),min(im.shape[0],y+36);x0,x1=max(0,x-35),min(im.shape[1],x+36)
 yy,xx=np.indices((y1-y0,x1-x0));score=distance[y0:y1,x0:x1]*100+np.hypot(xx+x0-x,yy+y0-y)
 iy,ix=np.unravel_index(np.argmin(score),score.shape);snapped.append([int(ix+x0),int(iy+y0)])
# Keep seam identical for both independently traced arc halves.
snapped[-1]=[732,1287]
path=[]
for start,end in zip(snapped,snapped[1:]):
 x0=max(0,min(start[0],end[0])-45);x1=min(im.shape[1],max(start[0],end[0])+46);y0=max(0,min(start[1],end[1])-45);y1=min(im.shape[0],max(start[1],end[1])+46)
 corridor=np.zeros((y1-y0,x1-x0),'uint8');cv2.line(corridor,(start[0]-x0,start[1]-y0),(end[0]-x0,end[1]-y0),1,71)
 cost=1+100*distance[y0:y1,x0:x1]**2;cost[corridor==0]=1e8
 segment,_=route_through_array(cost,(start[1]-y0,start[0]-x0),(end[1]-y0,end[0]-x0),fully_connected=True)
 path += [[int(x+x0),int(y+y0)] for y,x in segment][0 if not path else 1:]
# A printed single-stroke tributary has no resolvable two-bank width. Remove
# retraced source-pixel loops before simplifying, retaining the raw raster path
# separately for audit; do not invent artificial channel width.
clean=[];seen={};removed=0
for point in path:
 key=tuple(point)
 if key in seen:
  keep=seen[key]
  for old in clean[keep+1:]:seen.pop(tuple(old),None)
  removed += len(clean)-keep-1;clean=clean[:keep+1]
 else:seen[key]=len(clean);clean.append(point)
line=cv2.approxPolyDP(np.array(clean,dtype=np.int32),.6,False)[:,0,:].tolist()
report={'source':'G35 ANU Singapore 1958 survey sheet, native original MD5 verified by parent','cropOffset':[400,3400],'coordinateSystem':'native pixels relative to crop; add [400,3400] for original','method':'Reviewed coast and tidal-bank source-pixel guides; blue ink classification B-R>8,G-R>0,R<180; source-nearest blue-pixel guide refinement <=35px; least-cost native raster paths in 35px guide corridors; exact repeated-pixel loops removed where printed tributaries have no resolvable second bank; 0.6px contour simplification. Brown scalloped coral symbols excluded.','guides':snapped,'rawRasterPath':path,'denseLine':clean,'line':line,'counts':{'guides':len(snapped),'dense':len(clean),'rawDense':len(path),'singleStrokeLoopPixelsRemoved':removed,'simplified':len(line)},'endpoint':line[-1]}
overlay=im.copy();cv2.polylines(overlay,[np.array(clean,dtype=np.int32)],False,(255,0,255),2)
for x,y in snapped:cv2.circle(overlay,(x,y),2,(0,0,255),1)
cv2.imwrite(str(D/'work/resume-jurong-west-overlay.png'),overlay[:1400,:1550]);print(report['counts'],line[0],line[-1])
# P. Merawang is a blue-bounded land island; Terembu Paya's brown-only coral
# mark is deliberately excluded from land. The source label overprints 4px of
# Merawang's SW bank; this tiny gap follows the printed bank's continuation.
island_guides=[[43,633],[44,620],[48,609],[54,604],[63,602],[69,605],[75,614],[74,622],[70,627],[63,631],[55,635],[48,636],[43,633]]
island=[]
for start,end in zip(island_guides,island_guides[1:]):
 x0=max(0,min(start[0],end[0])-5);x1=max(start[0],end[0])+6;y0=min(start[1],end[1])-5;y1=max(start[1],end[1])+6
 corridor=np.zeros((y1-y0,x1-x0),'uint8');cv2.line(corridor,(start[0]-x0,start[1]-y0),(end[0]-x0,end[1]-y0),1,7)
 cost=1+100*distance[y0:y1,x0:x1]**2;cost[corridor==0]=1e8
 segment,_=route_through_array(cost,(start[1]-y0,start[0]-x0),(end[1]-y0,end[0]-x0),fully_connected=True)
 island += [[int(x+x0),int(y+y0)] for y,x in segment][0 if not island else 1:]
islandline=cv2.approxPolyDP(np.array(island,dtype=np.int32),.6,True)[:,0,:].tolist();islandline.append(islandline[0])
(D/'resume-jurong-west-islands.json').write_text(json.dumps({'source':'G35 ANU 1958','cropOffset':[400,3400],'islands':[{'name':'P. Merawang','guides':island_guides,'line':islandline}],'excluded':'Terembu Paya brown-only coral mark is not blue-bounded dry land.'},indent=2)+'\n')
cv2.polylines(overlay,[np.array(island,dtype=np.int32)],True,(255,0,255),2)
cv2.imwrite(str(D/'work/resume-jurong-west-overlay.png'),overlay[:1400,:1550])
# Close-up evidence preserves native bank detail at 3x source pixels.
for name,box in [('coast-detail',(40,390,260,750)),('gul-detail',(740,1100,1040,1310)),('samulun-detail',(1250,990,1440,1190))]:
 x0,y0,x1,y1=box
 cv2.imwrite(str(D/f'work/resume-jurong-west-{name}-overlay.png'),cv2.resize(overlay[y0:y1,x0:x1],((x1-x0)*3,(y1-y0)*3),interpolation=cv2.INTER_NEAREST))
print('P. Merawang:',len(island),'native bank pixels;',len(islandline),'vector vertices')

# Only the independently inspected western arc is integration-ready. The full
# draft intentionally remains rejected after close-up exposed bad Gul guides.
cut=len(clean)-1
partial=clean[:cut+1]
partialline=cv2.approxPolyDP(np.array(partial,dtype=np.int32),.6,False)[:,0,:].tolist()
partialreport={k:v for k,v in report.items() if k not in ['rawRasterPath','denseLine','line','guides','counts','endpoint','status']}
partialreport.update({'status':'Source-overlay inspected west arc only','coverage':'Tg Pasir Laba through Tuas to the southwestern Gul coastline; continuation east of endpoint requires independent tracing','guides':snapped,'denseLine':partial,'line':partialline,'endpoint':partial[-1],'counts':{'dense':len(partial),'simplified':len(partialline)}})
(D/'resume-jurong-west-verified.json').write_text(json.dumps(partialreport,indent=2)+'\n')
verified=im.copy();cv2.polylines(verified,[np.array(partial,dtype=np.int32)],False,(255,0,255),1);cv2.polylines(verified,[np.array(island,dtype=np.int32)],True,(255,0,255),1)
cv2.imwrite(str(D/'work/resume-jurong-west-verified-overlay.png'),verified[:1400,:1550])
print('Inspected partial only:',partialreport['counts'],'endpoint',partial[-1])
