import { browserFrames, poll, sceneReady } from './scene-signals';
/** Browser gates deliberately authored but not executed in the build sandbox. */
import { test, expect, type Page } from '@playwright/test';
type Engine = { sim():{values:Record<string,unknown>;outputs:Record<string,unknown>}; setSim(v:Record<string,number|string|boolean>):boolean; apply(v:unknown):boolean; senses():{eye:{active:boolean;hiddenReason:string|null;r:number;readings:Record<string,unknown>;points:{rays:{retina:number[]}[]}[];rendered:{retina:number[]}[][]};wave:{positions:number[];rests:number[];phaseCycles:number;playing:boolean;visualHz:number;hiddenReason:string|null}}; sensesSeek(n:number):boolean };
const read = (page:Page)=>page.evaluate(()=>(window.__atlas!.engine as unknown as Engine).senses());
const set = (page:Page, v:Record<string,number|string|boolean>)=>page.evaluate(v=>(window.__atlas!.engine as unknown as Engine).setSim(v),v);
async function open(page:Page,query:string,lang='en',theme='paper'){await page.goto(`/${lang}/topics/sample-senses/?theme=${theme}&${query}`);await sceneReady(page);await poll(async()=>Boolean((await read(page)).eye)).toBe(true);}
for(const lang of ['en','zh'])for(const theme of ['paper','cinema'])test(`${lang}/${theme}: deep-linked optics, darkness and reversible wave`,async({page})=>{
 await open(page,'ch=sample-focus&b=2',lang,theme);await poll(async()=>(await read(page)).eye.readings['focus-state']).toBe('behind-retina');const before=await read(page);expect(Number(before.eye.readings['image-distance'])).toBeCloseTo(120/23,9);
 for(const p of before.eye.points)for(const ray of p.rays)expect(ray.retina[0]).toBe(4);
 await set(page,{'pupil-mm':4});await poll(async()=>Number((await read(page)).eye.readings['blur-diameter'])).toBeCloseTo(7/75,9);
 await set(page,{'light-in':false});await poll(async()=>(await read(page)).eye.active).toBe(false);expect((await read(page)).eye.hiddenReason).toBe('dark');
 await page.evaluate(()=>(window.__atlas!.engine as unknown as Engine).apply({view:'exploded',explode:1}));await poll(async()=>(await read(page)).eye.hiddenReason).toBe('exploded');
 await open(page,'ch=sample-sound',lang,theme);await page.evaluate(()=>(window.__atlas!.engine as unknown as Engine).sensesSeek(0));await poll(async()=>(await read(page)).wave.positions[5]).toBeCloseTo(.285,9);
 await page.evaluate(()=>(window.__atlas!.engine as unknown as Engine).sensesSeek(.25));await poll(async()=>(await read(page)).wave.positions[5]).toBeCloseTo(.25,9);
 await set(page,{'frequency-hz':500});expect((await page.evaluate(()=>(window.__atlas!.engine as unknown as Engine).sim())).outputs['visual-hz']).toBe(2);
 await expect(page.locator('[data-senses-notes]')).toContainText('250');
 await page.evaluate(()=>(window.__atlas!.engine as unknown as Engine).apply({layers:['bench']}));await poll(async()=>(await read(page)).wave.playing).toBe(false);
 await set(page,{'sound-active':false});await poll(async()=>(await read(page)).wave.positions[5]).toBe(.25);expect((await read(page)).wave.playing).toBe(false);
 await expect(page.locator('[data-senses-notes]')).toHaveCount(0);
});
test('paused and reduced-motion wave keeps a deterministic seek on a phone',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});await open(page,'ch=sample-sound');await page.evaluate(()=>(window.__atlas!.engine as unknown as Engine).apply({run:true}));
 await poll(() => page.evaluate(() => window.__atlas!.state().paused)).toBe(false);
 await browserFrames(page);
 await page.evaluate(()=>(window.__atlas!.engine as unknown as Engine).sensesSeek(.25));await poll(async()=>(await read(page)).wave.phaseCycles).toBe(.25);const first=await read(page);await browserFrames(page);expect((await read(page)).wave.phaseCycles).toBe(first.wave.phaseCycles);expect(first.wave.playing).toBe(false);
});
test('ordinary manual scene transition resets phase; control and RUN patches preserve it',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await open(page,'ch=sample-sound');
 await page.evaluate(()=>(window.__atlas!.engine as unknown as Engine).sensesSeek(.375));
 await poll(async()=>(await read(page)).wave.phaseCycles).toBe(.375);
 await set(page,{'frequency-hz':500});
 await poll(async () => (await read(page)).wave.visualHz).toBe(2);
 expect((await read(page)).wave.phaseCycles).toBe(.375);
 // F is RUN/FLOW. R enters REFERENCE and emits a camera transition,
 // which resets this fixture's phase on the next rendered frame.
 await page.keyboard.press('f');
 await poll(() => page.evaluate(() => window.__atlas!.state().paused)).toBe(false);
 await browserFrames(page);
 expect((await read(page)).wave.phaseCycles).toBe(.375);
 await page.evaluate(()=>(window.__atlas!.engine as unknown as Engine).apply({run:false,camera:{position:[0,.8,6],target:[0,.8,0],fov:40}}));
 await poll(async()=>(await read(page)).wave.phaseCycles).toBe(0);
});
test('E exit restores overlays and motion despite the remembered explode slider', async ({page}) => {
 await open(page, 'ch=sample-sound');
 await page.evaluate(()=>(window.__atlas!.engine as unknown as Engine).apply({run:true,view:'exploded',explode:.55}));
 await poll(async()=>(await read(page)).wave.hiddenReason).toBe('exploded');
 await page.keyboard.press('e');
 await poll(async()=>(await read(page)).wave.playing).toBe(true);
 const phase=(await read(page)).wave.phaseCycles;
 await poll(async()=>(await read(page)).wave.phaseCycles).toBeGreaterThan(phase);
});
