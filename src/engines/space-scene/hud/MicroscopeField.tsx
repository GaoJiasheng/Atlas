/** One responsive renderer, shared by the desktop card and phone TryIt. */
import { useEffect, useRef, useSyncExternalStore } from 'react';
import { useSceneContext } from '../../core/context';
import { tx } from '../../../i18n';
import { resolveColorRef, readThemeTokens } from '../../../theme/theme';
import type { PartsFile } from '../schema';
import { microscopeFeatures, microscopeInputs, microscopeFieldReading } from '../lib/sim/microscope';
import { useSimView } from './sim';
import { PartChainCard } from './PartChainCard';
const query='(min-width: 1024px)';
const subscribe=(fn:()=>void)=>{const m=window.matchMedia(query);m.addEventListener('change',fn);return()=>m.removeEventListener('change',fn);};
const desktop=()=>window.matchMedia(query).matches;
const themeSubscribe=(fn:()=>void)=>{const observer=new MutationObserver(fn);observer.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});return()=>observer.disconnect();};
const themeSnapshot=()=>document.documentElement.dataset.theme??'paper';
const words={sharp:{en:'In focus',zh:'对焦清晰'},soft:{en:'Slightly out of focus',zh:'焦点稍偏'},blurred:{en:'Out of focus',zh:'焦点模糊'},dark:{en:'Illumination is off',zh:'照明已关闭'},outside:{en:'Target centre is outside the field',zh:'目标中心在视野外'},inactive:{en:'Observation is off',zh:'观察已关闭'}};
const roles={wall:{en:'Cell wall boundary',zh:'细胞壁边界'},'membrane-boundary':{en:'Cell boundary',zh:'细胞边界'},nucleus:{en:'Stained nucleus',zh:'染色细胞核'},chloroplast:{en:'Chloroplasts',zh:'叶绿体'},'cytoplasm-area':{en:'Faint cell contents',zh:'浅淡的细胞内部'}};
export function MicroscopeField({file,location}:{file:PartsFile;location:'desktop'|'mobile'}){
 const isDesktop=useSyncExternalStore(subscribe,desktop,()=>true),view=useSimView(file),canvas=useRef<HTMLCanvasElement>(null);
 const {locale}=useSceneContext();
 const buffer=useRef<HTMLCanvasElement|null>(null);
 const theme=useSyncExternalStore(themeSubscribe,themeSnapshot,()=> 'paper');
 const config=file.sim?.microscope,overlay=file.sim?.overlays.find(o=>o.kind==='microscope-field');
 const active=!!config&&!!view&&view.values[config.controls.enabled]===true;
 const shown=active&&isDesktop===(location==='desktop');
 useEffect(()=>{
  if(!shown||!config||!view||!canvas.current)return;
  const size=512,c=canvas.current,ctx=c.getContext('2d');if(!ctx)return;
  c.width=c.height=size;
  const tokens=readThemeTokens();
  const layer=buffer.current??(buffer.current=document.createElement('canvas'));layer.width=layer.height=size;const pen=layer.getContext('2d');if(!pen)return;
  const input=microscopeInputs(config,view.values),features=microscopeFeatures(config,view.values),r=size/2,scale=r/(500*config.fieldNumberMm/input.objective);
  ctx.clearRect(0,0,size,size);ctx.save();ctx.beginPath();ctx.arc(r,r,r-1,0,2*Math.PI);ctx.clip();
  ctx.fillStyle=resolveColorRef('token:paper',tokens);ctx.fillRect(0,0,size,size);
  const edges=new Set<string>();
  for(const depth of [...new Set(features.map(f=>f.positionUm[2]))].sort((a,b)=>a-b)){
   pen.clearRect(0,0,size,size);
   for(const f of features.filter(f=>f.positionUm[2]===depth).sort((a,b)=>(a.role==='cytoplasm-area'?-1:0)-(b.role==='cytoplasm-area'?-1:0))){
    const x=r+f.u*r,y=r-f.v*r;
    pen.save();pen.filter=`blur(${f.blurPx}px)`;pen.globalAlpha=f.contrast;pen.lineWidth=1.4;
    pen.strokeStyle=resolveColorRef('token:ink',tokens);pen.fillStyle=resolveColorRef(f.role==='chloroplast'?'token:seedling':'token:ink',tokens);
    pen.beginPath();
    if(f.kind==='ellipse'){
     pen.ellipse(x,y,f.axesUm![0]*scale/2,f.axesUm![1]*scale/2,0,0,2*Math.PI);pen.fill();
    }else if(f.role==='wall'||f.role==='membrane-boundary'){
     for(let j=0;j<f.pointsUm!.length;j++){
      const a=f.pointsUm![j]!,b=f.pointsUm![(j+1)%f.pointsUm!.length]!;
      const pa=[f.positionUm[0]+a[0],f.positionUm[1]+a[1]],pb=[f.positionUm[0]+b[0],f.positionUm[1]+b[1]];
      const key=[pa.join(','),pb.join(',')].sort().join('|');if(edges.has(key))continue;edges.add(key);
      pen.moveTo(x-a[0]*scale,y+a[1]*scale);pen.lineTo(x-b[0]*scale,y+b[1]*scale);
     }
     pen.stroke();
    }else{
     f.pointsUm!.forEach((p,j)=>j?pen.lineTo(x-p[0]*scale,y+p[1]*scale):pen.moveTo(x-p[0]*scale,y+p[1]*scale));pen.closePath();pen.fill();
    }
    pen.restore();
   }
   ctx.drawImage(layer,0,0);
  }
  ctx.restore();
 },[shown,config,view?.values,theme]);
 if(!shown||!config||!view||!overlay||overlay.kind!=='microscope-field')return null;
 const input=microscopeInputs(config,view.values),reading=microscopeFieldReading(config,view.values),status=tx(words[reading.viewStatus as keyof typeof words],locale),features=microscopeFeatures(config,view.values);
 const list=reading.viewStatus==='dark'?[]:[...new Set(features.map(f=>f.role))];
 const label=`${tx(input.specimen.label,locale)} · ${reading.totalPower}× · ${reading.fieldDiameterUm} µm · ${status}`;
 return <figure className="space-microscope" data-microscope-field="" data-location={location} aria-label={label} style={{maxWidth:overlay.diameterPx}}>
  <figcaption>{tx(overlay.title,locale)} <span className="atlas-chip">SIM</span></figcaption>
  <canvas ref={canvas} width={512} height={512} role="img" aria-label={label} style={{filter:`brightness(${input.illumination})`}} />
  <p>{tx(input.specimen.label,locale)}</p>
  <p aria-live="polite">{status} · {reading.totalPower}× · {reading.fieldDiameterUm} µm</p>
  <ul aria-label={locale==='en'?'Visible structures':'可观察结构'}>{list.map(role=><li key={role}>{tx(roles[role],locale)}</li>)}</ul>
 </figure>;
}
export function MicroscopeCard({file}:{file:PartsFile}){
 const view=useSimView(file),m=file.sim?.microscope;
 return m&&view?.values[m.controls.enabled]===true?<MicroscopeField file={file} location="desktop"/>:<PartChainCard file={file}/>;
}
