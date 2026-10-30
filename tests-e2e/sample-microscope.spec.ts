/** Authored browser gate; run by the main session with ATLAS_E2E_PORT=5451. */
import { test, expect, type Page } from '@playwright/test';
type Reading={specimen:string;totalPower:number;fieldDiameterUm:number;targetUV:[number,number];targetLocation:string;focusStatus:string;viewStatus:string;visibleFeatureIds:string[];bufferSize:[number,number]};
type Engine={microscopeField():Reading;setSim(values:Record<string,number|string|boolean>):boolean;apply(value:unknown):boolean;sim():{values:Record<string,unknown>}};
const read=(page:Page)=>page.evaluate(()=>(window.__atlas!.engine as unknown as Engine).microscopeField());
const set=(page:Page,v:Record<string,number|string|boolean>)=>page.evaluate(v=>(window.__atlas!.engine as unknown as Engine).setSim(v),v);
async function open(page:Page,locale='en',theme='paper',query='ch=field&b=2'){
 await page.goto(`/${locale}/topics/sample-microscope/?theme=${theme}&${query}`);await page.waitForFunction(()=>window.__atlas?.ready);await expect.poll(async()=>(await read(page))?.totalPower).toBe(400);
}
for(const locale of ['en','zh'])for(const theme of ['paper','cinema'])test(`${locale}/${theme}: finite microscope, inversion, focus, illumination and URL replay`,async({page})=>{
 await open(page,locale,theme);const first=await read(page);expect(first.fieldDiameterUm).toBe(450);expect(first.targetUV).toEqual([0,0]);expect(first.focusStatus).toBe('sharp');expect(first.bufferSize).toEqual([512,512]);expect(first.visibleFeatureIds).toContain('0:0:onion-nucleus');expect(first.visibleFeatureIds.some(id=>id.includes('chloroplast'))).toBe(false);
 await expect(page.locator('[data-microscope-field] canvas')).toHaveCount(1);
 await set(page,{'slide-x':-100,'focus-z':1});expect((await read(page)).targetUV[0]).toBeCloseTo(-4/9,9);expect((await read(page)).focusStatus).toBe('soft');
 await set(page,{'focus-z':2});expect((await read(page)).focusStatus).toBe('blurred');
 expect(await set(page,{objective:20})).toBe(false);expect((await read(page)).totalPower).toBe(400);
 await set(page,{specimen:'pondweed-leaf','slide-x':0,'slide-y':0,'focus-z':3});expect((await read(page)).targetUV).toEqual([0,0]);expect((await read(page)).visibleFeatureIds).toContain('0:0:pondweed-near-chloroplast');
 const lit=await read(page);await set(page,{illumination:0});const dark=await read(page);expect(dark.viewStatus).toBe('dark');expect(dark.visibleFeatureIds).toEqual([]);expect(dark.fieldDiameterUm).toBe(lit.fieldDiameterUm);expect(dark.focusStatus).toBe(lit.focusStatus);
 await set(page,{specimen:'prepared-cheek','slide-y':100,'focus-z':0,illumination:.5});expect((await read(page)).targetUV[1]).toBeCloseTo(-4/9,9);expect((await read(page)).visibleFeatureIds.some(id=>id.includes('onion')||id.includes('chloroplast'))).toBe(false);
 await set(page,{'field-on':false});await expect(page.locator('[data-microscope-field]')).toHaveCount(0);expect((await read(page)).viewStatus).toBe('inactive');expect((await read(page)).totalPower).toBe(400);
 await page.evaluate(()=>(window.__atlas!.engine as unknown as Engine).apply({view:'exploded',explode:1,cutaway:'half'}));await set(page,{'field-on':true});await expect.poll(()=>page.evaluate(()=>(window.__atlas!.state() as unknown as {view:string}).view)).toBe('assembled');
 await expect(page.locator('[data-microscope-field] canvas')).toHaveAttribute('role','img');
 const before=await read(page);await page.waitForTimeout(1200);/* the sim state reaches the URL after a short debounce */await page.reload();await page.waitForFunction(()=>window.__atlas?.ready);expect(await read(page)).toEqual(before);
 const url=new URL(page.url());url.pathname=`/${locale==='en'?'zh':'en'}/topics/sample-microscope/`;url.searchParams.set('theme',theme==='paper'?'cinema':'paper');await page.goto(url.toString());await page.waitForFunction(()=>window.__atlas?.ready);expect(await read(page)).toEqual(before);
});
test('390px phone has the same single field inside TryIt and usable44px controls',async({page})=>{
 await page.setViewportSize({width:390,height:844});await open(page);const toggle=page.locator('.atlas-panel__toggle[aria-expanded="false"]');if(await toggle.count())await toggle.click();
 const field=page.locator('.space-try [data-microscope-field]');await expect(field).toHaveCount(1);await expect(field.locator('canvas')).toBeVisible();expect((await read(page)).targetUV).toEqual([0,0]);
 const button=page.locator('[data-sim-control="slide-x"] button').last();const box=await button.boundingBox();expect(box?.width).toBeGreaterThanOrEqual(44);expect(box?.height).toBeGreaterThanOrEqual(44);await button.click();expect((await read(page)).targetUV[0]).toBeCloseTo(-4/9,9);
 await page.setViewportSize({width:1440,height:1000});await expect(page.locator('[data-microscope-field]')).toHaveCount(1);await expect(page.locator('[data-microscope-field]')).toHaveAttribute('data-location','desktop');
});
test('illegal URL value normalizes to default rather than false readings',async({page})=>{
 await page.goto('/en/topics/sample-microscope/?ch=field&b=1&sim=objective.20~field-on.on');await page.waitForFunction(()=>window.__atlas?.ready);expect((await read(page)).totalPower).toBe(40);expect((await read(page)).fieldDiameterUm).toBe(4500);
});
test('observation locks the x-ray, exploded and cutaway modes instead of silently ignoring them',async({page})=>{
 await open(page);
 for(const mode of ['xray','exploded','cutaway'])await expect(page.locator(`[data-mode="${mode}"]`)).toBeDisabled();
 await set(page,{'field-on':false});
 for(const mode of ['xray','exploded','cutaway'])await expect(page.locator(`[data-mode="${mode}"]`)).toBeEnabled();
});
