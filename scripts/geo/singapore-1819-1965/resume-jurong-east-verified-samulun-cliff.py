"""Short Samulun east coast, source BLACK CLIFF convention, not buildings/pier.
Independent native5px source reading. This is an open reviewed arc only.
"""
from pathlib import Path
import cv2,numpy as np,json
from scipy.ndimage import distance_transform_edt
from skimage.graph import route_through_array
D=Path(__file__).parent;im=cv2.imread(str(D/'raw/resume-source-anu1958.jpg'))[3400:5100,400:3500]
guides=[[1418,1100],[1421,1106],[1423,1111],[1427,1116],[1429,1120],[1430,1125],[1431,1130],[1432,1135],[1433,1140],[1433,1145],[1434,1150],[1434,1155],[1435,1160],[1437,1165],[1438,1170],[1440,1174],[1444,1177],[1445,1181],[1443,1186],[1439,1191],[1434,1196],[1427,1202],[1420,1204]]
b,g,r=im.astype(float).transpose(2,0,1);ink=((np.maximum.reduce([b,g,r])<180)&(r-g<35)&(r-b<40))|((b-r>5)&(g-r>0)&(r<195));dist=distance_transform_edt(~ink);line=[guides[0]];gaps=[]
for a,b in zip(guides,guides[1:]):
 x0=min(a[0],b[0])-5;x1=max(a[0],b[0])+6;y0=min(a[1],b[1])-5;y1=max(a[1],b[1])+6
 band=np.zeros((y1-y0,x1-x0),np.uint8);cv2.line(band,(a[0]-x0,a[1]-y0),(b[0]-x0,b[1]-y0),1,5)
 cost=1+4*dist[y0:y1,x0:x1]**2;cost[band==0]=1e9
 pp,_=route_through_array(cost,(a[1]-y0,a[0]-x0),(b[1]-y0,b[0]-x0),fully_connected=True)
 seg=[[int(x+x0),int(y+y0)]for y,x in pp];line.extend(seg[1:])
 if max(dist[y,x]for x,y in seg)>2:gaps.append({'from':a,'to':b,'maxDistanceVisibleInkPx':float(max(dist[y,x]for x,y in seg)),'pixels':len(seg),'reason':'faded source cliff crest, short constrained continuation; not land buildings or pier'})
# Erase exact pixel retraces into one cliff tick; no opposite water bank exists here.
clean=[];seen={}
for point in line:
 key=tuple(point)
 if key in seen:
  keep=seen[key]+1
  for old in clean[keep:]:seen.pop(tuple(old),None)
  clean=clean[:keep]
 else:seen[key]=len(clean);clean.append(point)
line=clean
j={'source':'G35 ANU1958 native scan','cropOffset':[400,3400],'qualification':'Open eastshore arc independently read at native5px. BLACK CLIFF crest convention matches printed legend; ticks on inland/left side are not bank. Transition to blue coast at [1444,1177]. Western blue jetty y1175 x1409..1430 is excluded. This arc is not a closed island polygon. Native line placement uncertain by approximately 2–3px where original is faded.','guides':guides,'denseLine':line,'line':cv2.approxPolyDP(np.asarray(line,np.int32),.5,False)[:,0,:].tolist(),'start':line[0],'endpoint':line[-1],'occlusions':gaps,'counts':{'dense':len(line)}}
(D/'resume-jurong-east-verified-samulun-cliff.json').write_text(json.dumps(j,indent=2)+'\n');over=im.copy();cv2.polylines(over,[np.asarray(line,np.int32)],False,(255,0,255),1);cv2.imwrite(str(D/'work/resume-jurong-east-verified-samulun-cliff-overlay.png'),cv2.resize(over[1085:1210,1380:1470],None,fx=6,fy=6,interpolation=cv2.INTER_NEAREST));print(j['counts'],gaps)
