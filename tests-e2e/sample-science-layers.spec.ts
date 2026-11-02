/** Synthetic science references, calendar catalogue selection and lazy load failures. */
import { expect, test, type Page } from '@playwright/test';
type Catalogue = { pick: string | null; layers: Record<string,{status:string;visible:number}>; indexCount:number;renderedRows:number;selectedScreen:[number,number]|null };
// Routes below must reach the page, not a service-worker cache.
test.use({ serviceWorkers: 'block' });
type Engine = { selectCatalogue(id:string|null):boolean; catalogueState():Catalogue };
async function state(page: Page) { return page.evaluate(() => (window.__atlas!.engine as unknown as Engine).catalogueState()); }
async function open(page:Page,url:string) {
 await page.goto(url); await page.waitForFunction(()=>window.__atlas!==undefined); expect(await page.evaluate(()=>window.__atlas!.ready)).toBe(true);
 await expect.poll(async()=>Object.values((await state(page)).layers).every(l=>l.status==='ready'),{timeout:30_000}).toBe(true);
}
for(const locale of ['en','zh']) for(const theme of ['paper','cinema']) {
 test(`reference and pick ${locale}/${theme}`,async({page})=>{
  await open(page,`/${locale}/topics/sample-science-layers/?ch=catalogue&t=2004-12-26&theme=${theme}`);
  expect((await state(page)).layers['sample-reference']?.visible).toBe(2);
  expect((await state(page)).layers['sample-quakes']?.visible).toBe(2);
  expect((await state(page)).layers['sample-observations']?.visible).toBe(2);
  expect((await state(page)).indexCount).toBe(6);
  expect(await page.evaluate(()=>(window.__atlas!.engine as unknown as Engine).selectCatalogue('ph-q-future'))).toBe(false);
  await page.locator('[data-catalogue-row="ph-q-b"]').focus(); await page.keyboard.press('Enter');
  await expect.poll(async()=>(await state(page)).pick).toBe('ph-q-b');
  await expect(page.locator('[data-catalogue-inspector="ph-q-b"]')).toContainText(locale==='en'?'Not recorded':'未记录');
  await expect(page.locator('[data-catalogue-inspector="ph-q-b"]')).toContainText('ph-q-b');
  await expect.poll(()=>new URL(page.url()).searchParams.get('pick')).toBe('ph-q-b');
  await page.reload(); await page.waitForFunction(()=>window.__atlas!==undefined); expect(await page.evaluate(()=>window.__atlas!.ready)).toBe(true);
  await expect.poll(async()=>(await state(page)).pick,{timeout:30_000}).toBe('ph-q-b');
  await page.keyboard.press('Escape'); await expect.poll(async()=>(await state(page)).pick).toBeNull();
  await page.locator('[data-catalogue-row="ph-q-a"]').click();
  await page.evaluate(()=>window.__atlas!.setMode('presentation',true,{instant:true}));
  expect(await page.evaluate(()=>(window.__atlas!.engine as unknown as Engine).selectCatalogue('ph-q-b'))).toBe(false);
 });
}
test('hidden layer and time reversal clear a selection',async({page})=>{
 await open(page,'/en/topics/sample-science-layers/?ch=catalogue&t=2004-12-26&pick=ph-q-b');
 await expect.poll(async()=>(await state(page)).pick).toBe('ph-q-b');
 await page.goto('/en/topics/sample-science-layers/?ch=catalogue&t=2004-12-25&pick=ph-q-b');
 await page.waitForFunction(()=>window.__atlas!==undefined); expect(await page.evaluate(()=>window.__atlas!.ready)).toBe(true);
 await expect.poll(async()=>(await state(page)).pick).toBeNull();
 await page.goto('/en/topics/sample-science-layers/?ch=catalogue&t=2004-12-26&pick=ph-q-a&layers=base,sample-reference');
 await page.waitForFunction(()=>window.__atlas!==undefined); expect(await page.evaluate(()=>window.__atlas!.ready)).toBe(true);
 await expect.poll(async()=>(await state(page)).pick).toBeNull();
});
test('catalogue loading waits for a deep link and errors do not show stale cards',async({page})=>{
 await page.route('**/geo/sample-quakes-catalogue.json', async route=> { await new Promise(resolve=>setTimeout(resolve,700)); await route.continue(); });
 await open(page,'/en/topics/sample-science-layers/?ch=catalogue&pick=ph-q-b');
 await expect.poll(async()=>(await state(page)).pick).toBe('ph-q-b');
 await page.unroute('**/geo/sample-quakes-catalogue.json');
 await page.route('**/geo/sample-quakes-catalogue.json',route=>route.abort());
 await page.reload(); await page.waitForFunction(()=>window.__atlas!==undefined); expect(await page.evaluate(()=>window.__atlas!.ready)).toBe(true);
 await expect.poll(async()=>(await state(page)).layers['sample-quakes']?.status,{timeout:30_000}).toBe('error');
 await expect.poll(async()=>(await state(page)).pick).toBeNull();
 await expect(page.locator('[data-catalogue-inspector]')).toHaveCount(0);
 await expect(page.locator('.atlas-panel')).toContainText('Layer could not be loaded');
});

test('search and keyboard access the fifty-first catalogue record without mounting it early',async({page})=>{
 const records=Array.from({length:51},(_,i)=>({id:`sample-pagination-${String(i).padStart(2,'0')}`,at:[103.8+i/1000,1.3],title:{en:`Synthetic pagination ${i}`,zh:`合成分页 ${i}`},summary:{en:'Synthetic test record.',zh:'合成测试记录。'},sources:['S1'],rows:[]}));
 await page.route('**/geo/sample-reference-catalogue.json',route=>route.fulfill({json:{entries:records}}));
 await page.route('**/geo/sample-reference.json',route=>route.fulfill({json:{type:'Topology',objects:{'sample-reference':{type:'GeometryCollection',geometries:records.map(entry=>({type:'Point',coordinates:entry.at,properties:{id:entry.id}}))}},arcs:[]}}));
 await open(page,'/en/topics/sample-science-layers/?ch=catalogue');
 await page.getByRole('searchbox',{name:'Search catalogue'}).fill('Synthetic pagination');
 await expect(page.locator('[data-catalogue-row]')).toHaveCount(50);
 expect((await state(page)).renderedRows).toBeLessThanOrEqual(50);
 await expect(page.locator('[data-catalogue-row="sample-pagination-50"]')).toHaveCount(0);
 await page.getByRole('navigation',{name:'Catalogue pages'}).getByRole('button',{name:'→'}).click();
 await expect(page.locator('[data-catalogue-row]')).toHaveCount(1);
 await page.locator('[data-catalogue-row="sample-pagination-50"]').focus(); await page.keyboard.press('Enter');
 await expect.poll(async()=>(await state(page)).pick).toBe('sample-pagination-50');
});
