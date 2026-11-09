"""Sea-connected blue shore; source lettering occlusion reconstructed locally."""
from pathlib import Path
import cv2,numpy as np,json
from scipy.ndimage import distance_transform_edt
from skimage.graph import route_through_array
D=Path(__file__).parent
im=cv2.imread(str(D/'raw/resume-source-anu1958.jpg'))[3400:5100,400:3500]
a=im[950:1230,1400:2450];b,g,r=a.astype(float).transpose(2,0,1)
ink=(((b-r>5)&(g-r>0)&(r<195))|(np.maximum.reduce([r,g,b])<150)).astype('uint8');ink=cv2.morphologyEx(ink,cv2.MORPH_CLOSE,np.ones((5,5),'uint8'));ink=cv2.dilate(ink,np.ones((3,3),'uint8'));_,lab,_,_=cv2.connectedComponentsWithStats(1-ink);sea=(lab==lab[250,300]).astype('uint8');sea=cv2.dilate(sea,np.ones((3,3),'uint8'));sea=cv2.morphologyEx(sea,cv2.MORPH_CLOSE,np.ones((3,3),'uint8'));c=max(cv2.findContours(sea,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_NONE)[0],key=cv2.contourArea)[:,0,:]+[1400,950]
a=int(np.argmin(np.linalg.norm(c-[2090,1068],axis=1)));b=int(np.argmin(np.linalg.norm(c-[2200,1130],axis=1)));p=c[a:b+1]if a<b else np.concatenate([c[a:],c[:b+1]]);q=c[b:a+1][::-1]if b<a else np.concatenate([c[b:],c[:a+1]])[::-1];p=p if len(p)<len(q)else q
# Native10px evidence: source blue line, with text below and across the bank.
guides=[[2112,1055],[2123,1064],[2138,1073],[2150,1081],[2166,1093],[2180,1110],[2192,1123],[2200,1130],[2210,1145],[2225,1158],[2240,1158],[2260,1156],[2275,1155],[2284,1150],[2289,1142],[2292,1135],[2295,1141],[2297,1151],[2302,1158],[2315,1164],[2327,1168],[2337,1175],[2347,1180],[2360,1182],[2375,1183],[2390,1183],[2402,1185],[2411,1188],[2411,1183]]
bb,gg,rr=im.astype(float).transpose(2,0,1);blue=(bb-rr>5)&(gg-rr>0)&(rr<195);dist=distance_transform_edt(~blue)
line=[guides[0]];occlusions=[]
for a,b in zip(guides,guides[1:]):
 x0=min(a[0],b[0])-8;x1=max(a[0],b[0])+9;y0=min(a[1],b[1])-8;y1=max(a[1],b[1])+9
 band=np.zeros((y1-y0,x1-x0),'uint8');cv2.line(band,(a[0]-x0,a[1]-y0),(b[0]-x0,b[1]-y0),1,11);cost=1+3*dist[y0:y1,x0:x1]**2;cost[band==0]=1e9
 pp,_=route_through_array(cost,(a[1]-y0,a[0]-x0),(b[1]-y0,b[0]-x0),fully_connected=True);seg=[[int(x+x0),int(y+y0)]for y,x in pp];line+=seg[1:]
 if max(dist[y,x]for x,y in seg)>2:occlusions.append({'from':a,'to':b,'reason':'printed place-label/source ink occlusion','pixels':len(seg),'maxGapToVisibleBluePx':float(max(dist[y,x]for x,y in seg))})
simple=cv2.approxPolyDP(np.asarray(line,dtype=np.int32),.5,False)[:,0,:].tolist();r={'source':'G35 ANU1958','cropOffset':[400,3400],'method':'Sea-connected source-blue/black barrier bank; excludes red-grid and brown-coral barriers; native10px reviewed guide continuation through source place-label occlusion; 5px guide corridor,0.5pxDP.','denseLine':line,'line':simple,'start':line[0],'endpoint':line[-1],'occlusions':occlusions,'counts':{'dense':len(line),'simplified':len(simple)}};(D/'resume-jurong-east-verified-penjuru.json').write_text(json.dumps(r,indent=2)+'\n');over=im.copy();cv2.polylines(over,[np.asarray(line,dtype=np.int32)],False,(255,0,255),1);cv2.imwrite(str(D/'work/resume-jurong-east-verified-penjuru-source.png'),cv2.resize(over[1030:1210,2070:2440],None,fx=2,fy=2));print(r['start'],r['endpoint'],r['counts'])
