/** The preview must follow the executing renderer, including tissue emission. */
import fs from 'node:fs';
import {describe, expect, it, vi} from 'vitest';
import {loadTopic, verifyRig} from '../../scripts/anatomy/rebuild-evidence/studio';

describe('muscle offline studio contract',()=>{
  it('verifies the executing lighting, R3F colour conversion and material bindings',()=>{
    const rig=verifyRig();
    expect(rig.executingSourceSha256).toMatch(/^[a-f0-9]{64}$/);
    expect(rig.roomFingerprint).toMatch(/^[a-f0-9]{64}$/);
    expect(rig.rigs.paper.exposure).toBe(1.05);
    expect(rig.backend).toContain('material emission');
  });
  it('includes muscle self-light and the actual quiet mannequin environment',async()=>{
    const muscles=await loadTopic('core');
    expect(muscles.some(s=>(s.glow??0)>0)).toBe(true);
    const skin=await loadTopic('core',false,'paper','body');
    expect(skin.length).toBeGreaterThanOrEqual(3);
    for(const s of skin){
      expect(s.roughness).toBe(.85);
      expect(s.envIntensity).toBe(.35);
      expect(s.glow).toBe(0);
    }
  });
  it('responds to the actual runtime topic axes rather than the source-cache axes',async()=>{
    const file='src/content/topics/muscles-arms/data/parts.json';
    const data=JSON.parse(fs.readFileSync(file,'utf8'));
    const pose={'knee.r':{flexion:90}};
    const before=await loadTopic('arms',false,'paper','body',pose);
    for(const side of ['l','r']){
      data.rig.joints[`knee.${side}`].axes.flexion=data.rig.joints[`knee.${side}`].axes.flexion.map((x:number)=>-x);
    }
    const original=fs.readFileSync;
    const spy=vi.spyOn(fs,'readFileSync').mockImplementation(((path:unknown,...args:unknown[])=>
      path===file?JSON.stringify(data):Reflect.apply(original,fs,[path,...args])) as typeof fs.readFileSync);
    try{
      const after=await loadTopic('arms',false,'paper','body',pose);
      const a=before.find(s=>s.id==='skin-outline')!.positions;
      const b=after.find(s=>s.id==='skin-outline')!.positions;
      let delta=0;
      for(let i=0;i<a.length;i++)delta=Math.max(delta,Math.abs(a[i]!-b[i]!));
      expect(delta).toBeGreaterThan(.1);
    }finally{spy.mockRestore();}
  });
});
