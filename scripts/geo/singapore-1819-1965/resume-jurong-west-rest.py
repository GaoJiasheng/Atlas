from pathlib import Path
import json,cv2,numpy as np
from scipy.ndimage import distance_transform_edt
from skimage.graph import route_through_array
D=Path(__file__).parent
im=cv2.imread(str(D/'raw/resume-source-anu1958.jpg'))[3400:5100,400:3500]
b,g,r=im.astype(float).transpose(2,0,1);blue=(b-r>8)&(g-r>0)&(r<180);dist=distance_transform_edt(~blue)
guides=[
[732,1289],[760,1288],[772,1278],[795,1281],[820,1288],[840,1283],[865,1284],[886,1280],[898,1273],[907,1256],[902,1252],[893,1269],[882,1275],[872,1271],[867,1258],[866,1249],[861,1246],[856,1251],[853,1261],[849,1262],[836,1254],[820,1247],[805,1242],[791,1237],[779,1232],
[788,1240],[795,1247],[787,1250],[802,1250],[817,1257],[830,1266],[844,1270],[853,1267],[858,1259],[858,1252],[862,1251],[864,1265],[869,1275],[878,1280],[890,1277],[897,1269],[900,1257],[901,1250],[896,1245],[884,1239],[881,1236],
[882,1228],[887,1213],[887,1206],[883,1199],[890,1203],[901,1201],[915,1196],[927,1190],[939,1183],[943,1168],[950,1150],[949,1140],[942,1133],[934,1131],[922,1139],[913,1144],[902,1144],[893,1141],[888,1136],[886,1129],[895,1131],[903,1131],[907,1128],[903,1123],[901,1119],[909,1123],[911,1128],[907,1132],[895,1134],[888,1133],
[900,1140],[915,1142],[928,1136],[938,1129],[948,1132],[956,1140],[963,1143],[965,1150],[969,1155],[975,1155],[983,1154],[990,1156],[998,1154],[1007,1153],[1015,1149],[1021,1143],[1025,1140],[1026,1152],[1029,1158],[1040,1158],[1055,1157],[1067,1150],[1078,1133],[1088,1117],[1097,1111],[1101,1113],[1102,1107],[1097,1102],[1090,1104],[1080,1111],[1068,1116],
[1080,1111],[1092,1103],[1100,1104],[1114,1109],[1128,1105],[1143,1096],[1151,1086],[1154,1077],[1149,1067],[1138,1058],[1132,1049],[1130,1041],[1128,1050],[1117,1058],[1104,1063],[1094,1060],[1088,1050],[1087,1039],[1093,1029],[1100,1023],[1098,1017],[1087,1017],[1080,1019],
[1091,1022],[1097,1027],[1090,1035],[1085,1044],[1089,1057],[1099,1065],[1111,1068],[1123,1063],[1134,1056],[1144,1059],[1157,1064],[1164,1070],[1167,1081],[1163,1093],[1153,1103],[1143,1111],[1140,1118],[1148,1121],[1160,1116],[1174,1111],[1187,1106],[1193,1101],[1202,1100],[1203,1105],[1196,1107],[1200,1112],[1204,1118],[1205,1126],[1210,1131],[1217,1133],[1224,1126],[1235,1126],[1241,1123],[1244,1127],[1251,1130],[1256,1136],[1257,1143],[1253,1152],[1250,1160],[1254,1159],[1260,1157],[1268,1149],[1273,1143],[1273,1131],[1284,1133],[1295,1136],[1303,1141],[1309,1141],[1317,1135],[1322,1128],[1319,1118],[1314,1113],[1310,1106],[1310,1094],[1313,1082],[1311,1074],[1308,1068],[1296,1062],[1289,1055],[1288,1045],[1290,1034],[1295,1020],[1301,1006],[1303,990],
# Upper Samulun tributary is a single printed stroke: no invented bank width.
[1301,1006],[1295,1020],[1290,1034],[1288,1045],[1289,1055],[1296,1062],[1308,1068],[1310,1072],[1320,1064],[1330,1057],[1340,1049],[1350,1047],[1362,1044],[1375,1039],[1383,1031],[1388,1016],[1392,1007],[1396,1013],[1396,1025],[1396,1033],[1401,1039],[1408,1042]
]
snap=[]
for x,y in guides:
 y0,y1=y-25,y+26;x0,x1=x-25,x+26;yy,xx=np.indices((51,51));score=dist[y0:y1,x0:x1]*100+np.hypot(xx-25,yy-25);iy,ix=np.unravel_index(np.argmin(score),score.shape);snap.append([int(x0+ix),int(y0+iy)])
snap[0]=[732,1287];snap[-1]=[1408,1042]
path=[]
for a,z in zip(snap,snap[1:]):
 x0=min(a[0],z[0])-45;x1=max(a[0],z[0])+46;y0=min(a[1],z[1])-45;y1=max(a[1],z[1])+46
 corridor=np.zeros((y1-y0,x1-x0),'uint8');cv2.line(corridor,(a[0]-x0,a[1]-y0),(z[0]-x0,z[1]-y0),1,71)
 cost=1+100*dist[y0:y1,x0:x1]**2;cost[corridor==0]=1e9
 pp,_=route_through_array(cost,(a[1]-y0,a[0]-x0),(z[1]-y0,z[0]-x0),fully_connected=True)
 path += [[int(x+x0),int(y+y0)] for y,x in pp][0 if not path else 1:]
# Pixel coincidence is below this scan's shoreline resolution. Keep raw guides
# in the audit and erase only zero-width retraces, never add invented width.
clean=[];seen={}
for p in path:
 key=tuple(p)
 if key in seen:
  k=seen[key]
  for q in clean[k+1:]:seen.pop(tuple(q),None)
  clean=clean[:k+1]
 else:seen[key]=len(clean);clean.append(p)
partial=json.loads((D/'resume-jurong-west-verified.json').read_text());joined=partial['denseLine']+clean[1:]
line=cv2.approxPolyDP(np.asarray(joined,dtype=np.int32),.6,False)[:,0,:].tolist()
report={'source':'G35 ANU 1958 native map','cropOffset':[400,3400],'method':'Independently reviewed native-pixel coast guides; constrained least-cost blue-ink paths. Exact repeated-pixel retraces removed as scan-unresolved single-stroke tributaries. Brown coral excluded.','guides':snap,'denseLine':joined,'line':line,'endpoint':joined[-1],'counts':{'dense':len(joined),'simplified':len(line)}}
(D/'resume-jurong-west-final.json').write_text(json.dumps(report,indent=2)+'\n')
over=im.copy();cv2.polylines(over,[np.array(joined,dtype=np.int32)],False,(255,0,255),1)
for x,y in snap:cv2.circle(over,(x,y),1,(0,0,255),1)
cv2.imwrite(str(D/'work/resume-jurong-west-final-overlay.png'),over[:1400,:1550])
for name,box in [('gul',(740,1100,1040,1310)),('center',(950,1000,1330,1240)),('seam',(1250,990,1440,1190))]:
 x0,y0,x1,y1=box;cv2.imwrite(str(D/f'work/resume-jurong-west-final-{name}.png'),cv2.resize(over[y0:y1,x0:x1],((x1-x0)*3,(y1-y0)*3),interpolation=cv2.INTER_NEAREST))
print(report['counts'])
