/** Run after build with CI=1 ATLAS_E2E_PORT=5442 pnpm e2e tests-e2e/southeast-asia.spec.ts. */
import { expect, test, type Page } from '@playwright/test';
import type { GeoContext } from '../src/engines/time-scene/lib/geography';
import type { ClimateSample } from '../src/engines/time-scene/lib/climate';
type Snapshot = {context:GeoContext;geometryHash:string;countryCount:number;memberIds:string[];memberCount:number;selection:string|null;visibleLayerIds:string[];climateSample:ClimateSample|null;climatology:null|{month:number;renderedMonth:number}};
type Engine = {geography():Snapshot;setGeoContext(c:GeoContext):boolean;selectGeography(id:string|null):boolean;goToGeographyBeat(c:string,i:number):boolean;toggleGeographyLayer(id:string,on:boolean):boolean;sampleClimate(x:number,y:number):ClimateSample|null};
const snapshot=(page:Page)=>page.evaluate(()=>(window.__atlas!.engine as unknown as Engine).geography());
async function open(page:Page,query='',locale='en'){
 await page.goto(`/${locale}/topics/southeast-asia/?${query}`);
 await page.waitForFunction(()=>window.__atlas!==undefined);expect(await page.evaluate(()=>window.__atlas!.ready)).toBe(true);
 await expect(page.locator('.maplibregl-canvas')).toBeVisible();
}
async function beat(page:Page,c:string,i:number){
 expect(await page.evaluate(([c,i])=>(window.__atlas!.engine as unknown as Engine).goToGeographyBeat(c,i),[c,i] as [string,number])).toBe(true);
 await expect.poll(async()=>{const s=await snapshot(page);return s.climatology?s.climatology.month===s.climatology.renderedMonth:true},{timeout:30_000}).toBe(true);
}
for(const locale of ['en','zh'])for(const theme of ['paper','cinema'])test(`${locale}/${theme}: 33 authored beats and fixed country geometries`,async({page})=>{
 test.setTimeout(120_000);
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await open(page,`theme=${theme}`,locale);
 const initial=await snapshot(page);expect(initial.countryCount).toBe(11);expect(initial.context).toEqual({kind:'present'});
 const beats=await page.evaluate(()=>window.__atlas!.beats());expect(beats).toHaveLength(33);
 for(const b of beats){
  await beat(page,b.chapter,b.index);
  const s=await snapshot(page);expect(s.geometryHash).toBe(initial.geometryHash);
  expect(await page.evaluate(()=>window.__atlas!.state())).toMatchObject({chapter:b.chapter,beat:b.index,t:null,playhead:null});
  await expect(page.locator('.clim-beatline')).toContainText(b.caption[locale as 'en'|'zh']!);
  if(s.context.kind!=='climatology'){expect(s.climateSample).toBeNull();expect(s.visibleLayerIds).not.toContain('clim-wind');expect(s.visibleLayerIds).not.toContain('clim-rain');}
 }
 await expect(page.locator('.ts-timeline')).toHaveCount(0);expect(errors).toEqual([]);
});
test('member dates include Timor-Leste, same-day accessions and immutable shapes',async({page})=>{
 await open(page,'ch=asean');const hash=(await snapshot(page)).geometryHash;
 for(const [date,count] of [['1967-08-07',0],['1967-08-08',5],['1984-01-06',5],['1984-01-07',6],['1995-07-28',7],['1997-07-22',7],['1997-07-23',9],['1999-04-30',10],['2025-10-25',10],['2025-10-26',11]] as const){
  expect(await page.evaluate(date=>(window.__atlas!.engine as unknown as Engine).setGeoContext({kind:'membership',date}),date)).toBe(true);
  await expect.poll(async()=>(await snapshot(page)).memberCount).toBe(count);expect((await snapshot(page)).geometryHash).toBe(hash);
 }
 await page.evaluate(()=>(window.__atlas!.engine as unknown as Engine).toggleGeographyLayer('geo-membership',false));
 expect((await snapshot(page)).memberCount).toBe(11);await expect(page.locator('[data-member-count]')).toHaveText('Membership layer off');
});
test('native January/July samples and country-scale cases clear across contexts',async({page})=>{
 test.setTimeout(120_000);
 await open(page,'ch=seasons-and-rain&b=2');
 await expect.poll(async()=>((await snapshot(page)).climateSample?.rain as {rate?:number})?.rate).toBe(3.784817);
 await beat(page,'seasons-and-rain',2);
 await expect.poll(async()=>((await snapshot(page)).climateSample?.rain as {rate?:number})?.rate).toBe(3.726351);
 await beat(page,'forests-and-parks',1);
 await expect(page.locator('[data-geography-selection="case-bukit-timah"]')).toContainText('Country-scale reference');
 await page.locator('[data-geography-index="case-sungei-buloh"]').click();
 await expect(page.locator('[data-geography-selection="case-sungei-buloh"]')).toBeVisible();
 expect((await snapshot(page)).climateSample).toBeNull();
 expect(await page.evaluate(()=>(window.__atlas!.engine as unknown as Engine).sampleClimate(105,0))).toBeNull();
});
test('URL contexts have atomic precedence and canonical invalid-parameter recovery',async({page})=>{
 test.setTimeout(180_000);
 await open(page,'ch=seasons-and-rain&b=3&gc=c&m=13');expect((await snapshot(page)).context).toEqual({kind:'climatology',month:7});
 await expect(page).toHaveURL(/[?&]m=7(?:&|$)/);
 await open(page,'ch=asean&b=1&gc=a&at=2025-10-26');expect((await snapshot(page)).memberCount).toBe(11);
 expect(await page.evaluate(()=>window.__atlas!.state())).toMatchObject({beat:0});
 await page.reload();await page.waitForFunction(()=>window.__atlas!==undefined);expect(await page.evaluate(()=>window.__atlas!.ready)).toBe(true);expect((await snapshot(page)).memberCount).toBe(11);
 await open(page,'gc=p&m=7&at=2025-10-26&t=1967');expect((await snapshot(page)).context).toEqual({kind:'present'});
 await expect(page).not.toHaveURL(/[?&](?:m|at|t)=/);
});
test('390px Chinese reader supports case selection and figure links without runtime external requests',async({page})=>{
 const external:string[]=[];let localOrigin:string|null=null;
 page.on('request',r=>{if(!/^https?:/.test(r.url()))return;const origin=new URL(r.url()).origin;if(localOrigin===null&&r.isNavigationRequest())localOrigin=origin;if(localOrigin!==null&&origin!==localOrigin)external.push(r.url());});
 await page.setViewportSize({width:390,height:844});await open(page,'ch=forests-and-parks&b=4','zh');
 await page.locator('.atlas-panel__toggle[aria-expanded="false"]').click();
 // Opening a case uses the same reader reveal action on desktop and phone.
 await page.evaluate(()=>(window.__atlas!.engine as unknown as Engine).selectGeography('case-mangrove-roots'));
 await expect(page.locator('[data-geography-selection="case-mangrove-roots"]')).toContainText('国家尺度参考');
 await expect(page.locator('[data-geography-selection="case-mangrove-roots"] a[href="#sea-mangrove-figure"]')).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
 expect(external).toEqual([]);
 await page.screenshot({path:'tests-e2e/__screenshots__/southeast-asia-zh-phone.png'});
});
