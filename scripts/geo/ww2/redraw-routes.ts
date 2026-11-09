/** Independent route-axis redigitisation from USMA maps 19/20; never reads old paths. */
import {readFileSync,writeFileSync} from 'node:fs';
import {candidates,evaluate} from '../lib/fit';
import sharp from 'sharp';
// Main map shared by plates 19 and 20 (1800 px rendition); plate 20 inset excluded.
const cities:[string,number,number,number,number][]=[
 ['Helsinki',24.938,60.170,738,108],['Tallinn',24.753,59.437,730,147],['Viipuri',28.752,60.713,841,93],['Riga',24.105,56.95,708,282],
 ['Dvinsk',26.52,55.87,773,349],['Kaunas',23.903,54.898,693,394],
 ['Minsk',27.56,53.90,798,462],['Smolensk',32.05,54.78,955,421],
 ['Moscow',37.62,55.75,1106,350],['Warsaw',21.01,52.23,580,533],
 ['Brest',23.69,52.1,674,553],['Kyiv',30.524,50.45,893,654],
 ['Kharkov',36.23,50,1096,673],['Dnepropetrovsk',35.04,48.46,1046,764],
 ['Rostov',39.72,47.23,1228,810],['Odessa',30.73,46.48,899,883],
 ['Sevastopol',33.53,44.62,1006,977],['Budapest',19.04,47.5,475,790],
];
const cp=cities.map(([name,lng,lat,x,y])=>({name,lnglat:[lng,lat] as [number,number],svg:[x,y] as [number,number]}));
const fits=candidates('auto',cp).map(c=>evaluate(c.proj,c.kind,cp)).sort((a,b)=>a.report.looRmsKm-b.report.looRmsKm);const fit=fits[0]!;
if(fit.report.maxKm>30)throw new Error('Route registration exceeds 30 km');
// Pixel waypoints read independently from the two government plates: drive corridors,
// not individual unit manoeuvres. Endpoint towns use factual WGS84 coordinates.
const routes:Record<string,{parts:{map:string;pixels:[number,number][]}[];start:[number,number];end:[number,number]}>={
 'barbarossa-n':{parts:[{map:'pd-19',pixels:[[649,391],[681,387],[715,379],[748,362],[773,349],[799,310],[823,267],[826,243],[854,219],[875,201]]},{map:'pd-20',pixels:[[875,201],[881,174],[876,157],[879,145],[903,141]]}],start:[21.89,55.08],end:[31.03,59.94]},
 'barbarossa-c':{parts:[{map:'pd-19',pixels:[[653,552],[674,553],[707,546],[750,506],[798,462],[837,453],[873,449],[905,440],[939,427]]},{map:'pd-20',pixels:[[939,427],[963,412],[996,391],[1026,377],[1050,368],[1074,358]]}],start:[23.12,52.03],end:[36.7,55.6]},
 'barbarossa-s':{parts:[{map:'pd-19',pixels:[[672,608],[721,622],[760,629],[802,645],[840,649],[885,654]]},{map:'pd-20',pixels:[[885,654],[915,679],[946,705],[983,723],[1046,764],[1059,794],[1100,808],[1151,812],[1191,809],[1228,810]]}],start:[23.89,50.81],end:[39.72,47.23]},
};
const moves=JSON.parse(readFileSync('src/content/topics/ww2/data/movements.json','utf8'));
for(const m of moves){const r=routes[m.id];if(r)m.path.coordinates=[r.start,...r.parts.flatMap(p=>p.pixels.map(pt=>fit.model.toLngLat(pt[0],pt[1]))).filter((pt,i,a)=>i===0||pt[0]!==a[i-1]![0]||pt[1]!==a[i-1]![1]),r.end];}
writeFileSync('src/content/topics/ww2/data/movements.json',JSON.stringify(moves,null,2)+'\n');
writeFileSync('scripts/geo/ww2/route-registration.json',JSON.stringify({method:'Independent pixel digitisation of named drive corridors from USMA plates 19 and 20; shared main map registration; inset and old BY-SA paths excluded; WGS84 endpoint towns retained as facts',controlPoints:cp,fit:fit.report,routes},null,2)+'\n');
for(const map of ['pd-19','pd-20']){let overlay='<svg xmlns="http://www.w3.org/2000/svg" width="1800" height="1164">';for(const [id,r]of Object.entries(routes))for(const p of r.parts.filter(p=>p.map===map)){overlay+=`<polyline points="${p.pixels.map(p=>p.join(',')).join(' ')}" fill="none" stroke="#00b33c" stroke-width="4"/>`;overlay+=`<text x="${p.pixels[0]![0]}" y="${p.pixels[0]![1]-9}" fill="#005911" font-size="18" stroke="white" stroke-width="3" paint-order="stroke">${id}</text>`;}overlay+='</svg>';await sharp(`scripts/geo/ww2/raw/${map}.jpg`).composite([{input:Buffer.from(overlay)}]).png().toFile(`scripts/geo/ww2/work/previews/routes-${map}.png`);}
console.log(`3 route axes independently redigitised; max registration ${fit.report.maxKm.toFixed(1)} km`);
