/** Isolated headless Chromium; never attaches to a user's browser or desktop. */
import { expect, test } from '@playwright/test';
import sharp from 'sharp';

for(const locale of ['en','zh']) {
 test(`${locale}: semantic drawings retain their tones on paper and cinema`,async({page},testInfo)=>{
  // Static MDX and the actual shared stylesheet suffice; skip the unrelated 3D engine.
  await page.route('**/*.js',route=>route.abort());
  await page.goto(`/${locale}/topics/sun-earth-moon/`);
  const phases=page.locator('img[src$="sun-earth-moon-four-phases.webp"]:not(#tone-probe)');
  await expect(phases).toHaveCount(1);
  await phases.evaluate((el:HTMLImageElement)=>{el.loading='eager';el.closest('figure')!.style.display='block';el.closest('section')?.removeAttribute('hidden');});
  // Hidden chapter containers do not affect computed image filter/background.
  await expect.poll(()=>phases.evaluate((el:HTMLImageElement)=>el.complete&&el.naturalWidth===1200)).toBe(true);
  await phases.evaluate(el=>{
   const plate=document.createElement('div');
   plate.style.cssText='position:fixed;left:0;top:0;width:420px;background:var(--bg);z-index:2147483647';
   const image=el.cloneNode(true) as HTMLImageElement;image.id='tone-probe';image.loading='eager';
   plate.append(image);document.body.append(plate);
  });
  const probe=page.locator('#tone-probe');
  for(const theme of ['paper','cinema']){
   await page.evaluate(t=>document.documentElement.dataset.theme=t,theme);
   const styles=await phases.evaluate(el=>{const s=getComputedStyle(el);return{filter:s.filter,blend:s.mixBlendMode,background:s.backgroundColor,opacity:s.opacity};});
   const shot=await probe.screenshot({path:testInfo.outputPath(`moon-${theme}.png`)});
   // stats() reads the input image, not the extract: materialise the patch first.
   const light=async(x:number,y:number)=>(await sharp(await sharp(shot).extract({left:x-4,top:y-4,width:9,height:9}).greyscale().toBuffer()).stats()).channels[0]!.mean;
   // Native image pixels: new Moon dark, full Moon bright; first quarter right
   // half bright, last quarter left half bright, with north up in both themes.
   expect(await light(136,227)-await light(136,87)).toBeGreaterThan(70);
   expect(await light(315,87)-await light(252,87)).toBeGreaterThan(70);
   expect(await light(252,227)-await light(315,227)).toBeGreaterThan(70);
   expect(styles.filter).not.toContain('invert');
   expect(styles.blend).toBe(theme==='paper'?'multiply':'normal');
   if(theme==='cinema'){
    expect(styles.filter).toBe('brightness(0.85) contrast(0.95)');
    expect(styles.background).toBe('rgb(233, 228, 216)');expect(styles.opacity).toBe('1');
   }
  }
  await page.goto(`/${locale}/`);
  const covers=page.locator('.plate__figure img[data-invert="false"]');
  await expect(covers).toHaveCount(3);
  await page.evaluate(()=>document.documentElement.dataset.theme='cinema');
  for(const image of await covers.all())await expect(image).toHaveCSS('mix-blend-mode','normal');
  await expect(page.locator('.plate__figure img[src$="fractions.webp"]')).toHaveCSS('mix-blend-mode','screen');
 });
}
