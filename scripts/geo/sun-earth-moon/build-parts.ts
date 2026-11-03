/** Prepare the complete topic data for the surface-support integration.
 * The default output is a review artifact, because shared rendering changes
 * are outside this task's authorised ownership. Does not apply the patch.
 * pnpm tsx scripts/geo/sun-earth-moon/build-parts.ts [--out <parts.json>]
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
const root=resolve(import.meta.dirname,'../../..');
const path=resolve(root,'src/content/topics/sun-earth-moon/data/parts.json');
const data=JSON.parse(readFileSync(path,'utf8'));
data.model='/models/sun-earth-moon/surfaces.glb';
for(const id of ['sun-body','earth-body','moon-body']){
 const p=data.parts.find((p:{id:string})=>p.id===id);
 p.mesh=id;p.material={color:'matte',tint:'#ffffff'};delete p.primitive;
}
const earth=data.parts.find((p:{id:string})=>p.id==='earth-body');
earth.detail.en=earth.detail.en.replace('It leaves out continents and weather. Faint light helps show the dark side.','Natural Earth coastlines show the continents; the clouds are an illustration, not dated weather. A fixed ring marks Singapore. Neutral grey fill makes the night side readable.');
earth.detail.zh=earth.detail.zh.replace('画面省去大陆和天气，用微弱填光显示暗侧。','大陆轮廓来自Natural Earth；云层是示意，不代表某日天气。固定圆环标出新加坡，用中性灰填光显示夜侧。');
const observer=data.parts.find((p:{id:string})=>p.id==='observer-marker');
observer.detail.en=observer.detail.en.replace('The globe marks latitude; its lighting does not follow the table’s dates.','The fixed globe ring marks Singapore at this latitude and longitude. The movable observer shares Singapore’s meridian but can use other latitudes in the experiments; its lighting does not follow the table’s dates.');
observer.detail.zh=observer.detail.zh.replace('球体标示纬度，受光画面不随表格日期改变。','球面固定圆环标出这个经纬度的新加坡。活动观察点与新加坡同经线，实验中可改纬度；受光画面不随表格日期改变。');
const moon=data.parts.find((p:{id:string})=>p.id==='moon-body');
moon.detail.en=moon.detail.en.replace('The phase window looks','The surface uses NASA LROC maria and crater markings with LOLA relief at its true relative height. The phase window looks');
moon.detail.zh=moon.detail.zh.replace('月相窗从地心看','表面按NASA LROC资料显示月海与陨坑，LOLA起伏保持真实相对高度。月相窗从地心看');
const mark=data.parts.find((p:{id:string})=>p.id==='near-side-mark');
mark.detail.en=mark.detail.en.replace('The mark helps you follow the turning;', 'The real maria pattern and the small mark help you follow the turning;');
mark.detail.zh=mark.detail.zh.replace('标记帮助追踪转动','真实月海图案和小标记帮助追踪转动');
const arg=process.argv.indexOf('--out'),out=resolve(arg<0?'/tmp/atlas-sun-earth-moon/proposed-parts.json':process.argv[arg+1]!);
mkdirSync(dirname(out),{recursive:true});writeFileSync(out,JSON.stringify(data,null,2)+'\n');
process.stdout.write(`Prepared topic data, not installed: ${out}\n`);
