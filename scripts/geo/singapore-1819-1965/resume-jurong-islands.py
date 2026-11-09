"""Native source-blue coast paths; coral/pier outlines are not dry islands."""
from pathlib import Path
import cv2,numpy as np,json
from scipy.ndimage import distance_transform_edt
from skimage.graph import route_through_array
D=Path(__file__).parent
im=cv2.imread(str(D/'raw/resume-source-anu1958.jpg'))[3400:5100,400:3500]
b,g,r=im.astype(float).transpose(2,0,1)
blue=(b-r>5)&(g-r>0)&(r<195);dist=distance_transform_edt(~blue)
specs=[('P. Samulun',[[1420,1204],[1412,1195],[1410,1181],[1409,1171],[1397,1164],[1392,1158],[1380,1154],[1373,1145],[1374,1130],[1366,1115],[1360,1105],[1346,1106],[1340,1101],[1339,1090],[1342,1075],[1354,1068],[1366,1063],[1380,1065],[1390,1074],[1405,1087],[1418,1100]],(1300,1030,1470,1235)),
 ('P. Damar Laut',[[1700,1076],[1710,1072],[1728,1071],[1743,1076],[1752,1093],[1757,1112],[1765,1128],[1772,1136],[1778,1125],[1785,1120],[1800,1121],[1813,1123],[1823,1134],[1825,1145],[1820,1160],[1810,1170],[1795,1180],[1780,1183],[1768,1177],[1765,1168],[1754,1160],[1738,1152],[1720,1141],[1703,1137],[1693,1128],[1690,1110],[1693,1090],[1700,1076]],(1650,1045,1850,1210))]
islands=[]
for name,guides,box in specs:
 selectedBlue=blue
 dist=distance_transform_edt(~selectedBlue)
 snap=[]
 for x,y in guides:
  a=dist[y-12:y+13,x-12:x+13];yy,xx=np.indices(a.shape)
  j,i=np.unravel_index(np.argmin(a*100+np.hypot(xx-12,yy-12)),a.shape);snap.append([int(x+i-12),int(y+j-12)])
 if name=='P. Samulun':
  cliff=json.loads((D/'resume-jurong-east-verified-samulun-cliff.json').read_text());snap[:4]=guides[:4];snap[-1]=cliff['start']
 path=[]
 for a,z in zip(snap,snap[1:]):
  x0=min(a[0],z[0])-15;x1=max(a[0],z[0])+16;y0=min(a[1],z[1])-15;y1=max(a[1],z[1])+16
  corridor=np.zeros((y1-y0,x1-x0),'uint8');cv2.line(corridor,(a[0]-x0,a[1]-y0),(z[0]-x0,z[1]-y0),1,19)
  cost=1+100*dist[y0:y1,x0:x1]**2;cost[corridor==0]=1e9
  pp,_=route_through_array(cost,(a[1]-y0,a[0]-x0),(z[1]-y0,z[0]-x0),fully_connected=True)
  path += [[int(x+x0),int(y+y0)] for y,x in pp][0 if not path else 1:]
 if name=='P. Samulun':path += cliff['denseLine'][1:]
 clean=[];seen={};cycles=[]
 for point in path:
  key=tuple(point)
  if key in seen:
   at=seen[key];cycle=clean[at:]+[point]
   if len(cycle)>3:cycles.append(cycle)
   for q in clean[at+1:]:seen.pop(tuple(q),None)
   clean=clean[:at+1]
  else:seen[key]=len(clean);clean.append(point)
 if not cycles:raise RuntimeError('No closed source bank cycle')
 main=max(cycles,key=lambda c:abs(cv2.contourArea(np.asarray(c,dtype='int32'))))
 line=cv2.approxPolyDP(np.asarray(main,dtype='int32'),.5,True)[:,0,:].tolist();line.append(line[0])
 islands.append({'name':name,'guides':snap,'denseLine':path,'coordinates':[line],'vertices':len(line)})
 out=im.copy();cv2.polylines(out,[np.asarray(line,dtype='int32')],True,(255,0,255),1)
 x0,y0,x1,y1=box;cv2.imwrite(str(D/f'work/resume-island-{name.replace(" ","-")}.png'),cv2.resize(out[y0:y1,x0:x1],None,fx=4,fy=4))
(D/'resume-jurong-reviewed-islands.json').write_text(json.dumps({'status':'DRAFT_REQUIRES_NATIVE_REVIEW','source':'G35 ANU1958','cropOffset':[400,3400],'method':'Native blue bank paths; source guides within12px snap,19px selection corridor,0.5pxDP. Brown coral excluded.','islands':islands},indent=2)+'\n')
