/** Test ambiguous source-origin glyph readings against independently printed corner degrees. */
import{readFileSync,writeFileSync}from'node:fs';import{createRequire}from'node:module';import{buildNativeModel,nativeProjection}from'./resume-register-anu1958-model';import{haversineKm}from'../lib/common';
const p=import.meta.dirname,require=createRequire(import.meta.url),proj4=require(process.env.ATLAS_PROJ4_MODULE??'../.tools/node_modules/proj4');
const pixel:[number,number]=[375,6360],printed:[number,number]=[103+37/60+47/3600,1+12/60+50/3600],native=buildNativeModel().toLngLat(pixel[0],pixel[1]),grid=nativeProjection.forward(native[0],native[1]);
const comparisons=[];
for(const latMinutes of[1,2])for(const lonMinutes of[23,33]){
 const def=`+proj=cass +lat_0=${2+latMinutes/60+33.3/3600} +lon_0=${103+lonMinutes/60+45.93/3600} +x_0=411480 +y_0=274320 +ellps=evrst30 +units=m`;
 const corner=proj4(def,'WGS84',grid)as[number,number];comparisons.push({origin:`2°${latMinutes}′33.30″N /103°${lonMinutes}′45.93″E`,cornerLngLat:corner,printedCornerMismatchM:haversineKm(corner,printed)*1000});
}
writeFileSync(`${p}/resume-register-anu1958-origin-proof.json`,JSON.stringify({method:'The1958redoriginminute glyphs are partlyfaded. Compare four candidate readings using the same16pointnativegridpixel fit and independently visible southwestgraticulecorner103°37′47″E/01°12′50″N. No modernWGS84point or externaltranslation is involved. Numbers are native-graticule consistency diagnostics, not externalgrounderrors.',nativeSouthwestPixel:pixel,printedSouthwestCornerLngLat:printed,localGridMetres:grid,comparisons,additionalEvidence:'G11sameJohoreGrid clearprintedorigin2°02′33.30″N/103°33′45.93″E; previewwork/resume-G11-origin-footer.png;1958cornerpreviewwork/resume-register-anu1958-corner-proof.png'},null,2)+'\n');console.log(comparisons);
