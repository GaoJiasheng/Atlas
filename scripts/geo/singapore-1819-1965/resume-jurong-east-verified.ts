import {readFileSync,writeFileSync} from 'node:fs';
import{buildModel}from'./resume-register-anu1958-model';
const d=import.meta.dirname,m=buildModel();
function inverse(lon:number,lat:number):[number,number]{let x=2400,y=4100;for(let i=0;i<8;i++){const a=m.toLngLat(x,y),b=m.toLngLat(x+1,y),c=m.toLngLat(x,y+1);const ux=b[0]-a[0],uy=b[1]-a[1],vx=c[0]-a[0],vy=c[1]-a[1],dx=lon-a[0],dy=lat-a[1],det=ux*vy-vx*uy;x+=(dx*vy-vx*dy)/det;y+=(ux*dy-dx*uy)/det;}return[x-400,y-3400]}
const f=JSON.parse(readFileSync(`${d}/work/coast-g16-main.geojson`,'utf8'));const rings=f.features.flatMap((a:any)=>a.geometry.type==='Polygon'?a.geometry.coordinates:a.geometry.coordinates.flat());const a=rings.map((r:any)=>r.map((p:any)=>inverse(p[0],p[1]))).filter((r:any)=>r.some((p:any)=>p[0]>1850&&p[0]<2200&&p[1]>0&&p[1]<1100));writeFileSync(`${d}/work/resume-jurong-east-verified-g16-pixels.json`,JSON.stringify(a));console.log(a.map((r:any)=>r.filter((p:any)=>p[0]>1850&&p[0]<2200&&p[1]>0&&p[1]<1100).length));
